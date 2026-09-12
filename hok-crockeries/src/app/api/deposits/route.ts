import { fail, ok, parseJson, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { srAccount } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { depositSchema } from '@/lib/validation';
import type { Deposit } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireUser();
  if (!can(user.role, 'deposit.view.all') && !can(user.role, 'deposit.view.own')) {
    return fail('Your role does not allow this action.', 403);
  }

  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const srFilter = can(user.role, 'deposit.view.all') ? (url.searchParams.get('sr') ?? '') : user.id;

  const db = await readDb();
  const names = new Map(db.users.map((u) => [u.id, u.name]));

  const deposits = db.deposits
    .filter((d) => (!srFilter || d.srId === srFilter) && (!month || d.date.startsWith(month)))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .map((d) => ({
      ...d,
      srName: names.get(d.srId) ?? 'Unknown SR',
      receivedByName: names.get(d.receivedBy) ?? '—',
    }));

  // Every SR the viewer is allowed to see, with their running cash position.
  const srIds = can(user.role, 'deposit.view.all')
    ? db.users.filter((u) => u.role === 'SR').map((u) => u.id)
    : [user.id];
  const accounts = srIds.map((id) => ({
    ...srAccount(db, id),
    name: names.get(id) ?? 'Unknown SR',
  }));

  return ok({
    deposits,
    accounts,
    totals: {
      deposited: deposits.reduce((n, d) => n + d.amount, 0),
      count: deposits.length,
    },
  });
});

export const POST = route(async (request: Request) => {
  const user = await requireUser();
  const isReceiver = can(user.role, 'deposit.receive');
  if (!isReceiver && !can(user.role, 'deposit.create')) {
    return fail('Your role does not allow this action.', 403);
  }
  const input = depositSchema.parse(await parseJson(request));
  const srId = user.role === 'SR' ? user.id : (input.srId ?? '');

  const result = await writeDb((db) => {
    const sr = db.users.find((u) => u.id === srId);
    if (!sr) return { ok: false, error: 'Pick the SR this money came from.' } as const;

    const deposit: Deposit = {
      id: newId('dep'),
      srId,
      amount: input.amount,
      date: input.date,
      method: input.method,
      reference: input.reference,
      note: input.note,
      receivedBy: user.id,
      createdAt: new Date().toISOString(),
    };
    db.deposits.push(deposit);
    logAction(db, user, 'deposit.record', 'deposit', deposit.id, {
      sr: sr.name,
      amount: deposit.amount,
    });
    // Report the SR's position after the deposit so the UI can show it at once.
    return { ok: true, deposit, account: srAccount(db, srId) } as const;
  });

  if (!result.ok) return fail(result.error, 422);
  return ok({ deposit: result.deposit, account: result.account }, { status: 201 });
});
