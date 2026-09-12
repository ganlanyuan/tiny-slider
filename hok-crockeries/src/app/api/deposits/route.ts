import { and, desc, eq, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireAnyCapability } from '@/lib/auth';
import { deposits, users } from '@/db/schema';
import { srAccount, srAccounts } from '@/db/queries/accounts';
import { logAction } from '@/lib/audit';
import { round2, toBusinessDate } from '@/lib/money';
import { can } from '@/lib/permissions';
import { depositSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability([
    'deposit.view.all',
    'deposit.view.own',
  ]);
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const viewsAll = can(role, 'deposit.view.all');
  const srFilter = viewsAll ? (url.searchParams.get('sr') ?? '') : user.id;

  const receiver = alias(users, 'receiver');
  const filters = [eq(deposits.orgId, orgId)];
  if (srFilter) filters.push(eq(deposits.srId, srFilter));
  const monthFilter = month
    ? sql`AND to_char(${deposits.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`
    : sql``;

  const rows = await db
    .select({
      id: deposits.id,
      srId: deposits.srId,
      srName: users.name,
      amount: deposits.amount,
      date: deposits.date,
      method: deposits.method,
      reference: deposits.reference,
      note: deposits.note,
      receivedByName: receiver.name,
    })
    .from(deposits)
    .innerJoin(users, eq(users.id, deposits.srId))
    .leftJoin(receiver, eq(receiver.id, deposits.receivedBy))
    .where(sql`${and(...filters)} ${monthFilter}`)
    .orderBy(desc(deposits.date), desc(deposits.createdAt))
    .limit(500);

  // Every rep the viewer is allowed to see, with their running cash position.
  const accounts = await srAccounts(db, orgId, {
    month: month || undefined,
    srId: viewsAll ? undefined : user.id,
  });

  return ok({
    deposits: rows.map((r) => ({
      ...r,
      date: r.date.toISOString(),
      receivedByName: r.receivedByName ?? '—',
    })),
    accounts,
    totals: {
      deposited: round2(rows.reduce((n, d) => n + d.amount, 0)),
      count: rows.length,
    },
  });
});

export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability(['deposit.receive', 'deposit.create']);
  const input = depositSchema.parse(await parseJson(request));
  // A rep can only ever deposit against themselves, whatever the body says.
  const srId = role === 'SR' ? user.id : (input.srId ?? '');

  const [rep] = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.id, srId), eq(users.orgId, orgId)))
    .limit(1);
  if (!rep || rep.role !== 'SR') return fail('Pick the sales rep this money came from.', 422);

  const [created] = await db
    .insert(deposits)
    .values({
      orgId,
      srId,
      amount: input.amount,
      date: toBusinessDate(input.date),
      method: input.method,
      reference: input.reference,
      note: input.note,
      receivedBy: user.id,
    })
    .returning();

  await logAction(db, user, 'deposit.record', 'deposit', created.id, {
    sr: rep.name,
    amount: created.amount,
  });

  return ok(
    {
      deposit: { ...created, date: created.date.toISOString() },
      account: await srAccount(db, orgId, srId),
    },
    { status: 201 },
  );
});
