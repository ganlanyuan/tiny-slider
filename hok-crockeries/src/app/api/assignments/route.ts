import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, nextDocNumber, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { assignmentValue, productStockLedger } from '@/lib/analytics';
import { assignmentSchema } from '@/lib/validation';
import type { Assignment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  await requireCapability('assignment.view');
  const url = new URL(request.url);
  const srId = url.searchParams.get('sr') ?? '';
  const month = url.searchParams.get('month') ?? '';

  const db = await readDb();
  const productName = new Map(db.products.map((p) => [p.id, p.name]));
  const srName = new Map(db.users.map((u) => [u.id, u.name]));

  const assignments = db.assignments
    .filter((a) => (!srId || a.srId === srId) && (!month || a.date.startsWith(month)))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((a) => ({
      ...a,
      srName: srName.get(a.srId) ?? 'Unknown SR',
      units: a.items.reduce((n, i) => n + i.qty, 0),
      items: a.items.map((i) => ({
        ...i,
        productName: productName.get(i.productId) ?? 'Removed product',
      })),
    }));

  return ok({ assignments });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('assignment.manage');
  const input = assignmentSchema.parse(await parseJson(request));

  const result = await writeDb((db) => {
    const sr = db.users.find((u) => u.id === input.srId && u.role === 'SR');
    if (!sr) return { ok: false, error: 'That SR does not exist.' } as const;
    if (!sr.active) return { ok: false, error: 'That SR account is deactivated.' } as const;

    // Never hand out stock the store does not physically have.
    const ledger = productStockLedger(db);
    for (const item of input.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) return { ok: false, error: `Unknown product: ${item.productId}` } as const;
      const available = ledger.get(item.productId)?.inStore ?? 0;
      if (item.qty > available) {
        return {
          error: `Only ${available} ${product.unit} of "${product.name}" are in the store — cannot hand out ${item.qty}.`,
        } as const;
      }
    }

    const now = new Date().toISOString();
    const assignment: Assignment = {
      id: newId('asg'),
      challanNo: nextDocNumber('CH', db.assignments.map((a) => a.challanNo)),
      srId: input.srId,
      date: input.date,
      items: input.items,
      totalValue: assignmentValue(input),
      note: input.note,
      createdBy: user.id,
      createdAt: now,
    };
    db.assignments.push(assignment);

    for (const item of assignment.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.qty);
        product.updatedAt = now;
      }
    }

    logAction(db, user, 'assignment.create', 'assignment', assignment.id, {
      sr: sr.name,
      units: assignment.items.reduce((n, i) => n + i.qty, 0),
      value: assignment.totalValue,
    });
    return { ok: true, assignment } as const;
  });

  if (!result.ok) return fail(result.error, 422);
  return ok({ assignment: result.assignment }, { status: 201 });
});
