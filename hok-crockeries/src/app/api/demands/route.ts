import { fail, ok, parseJson, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { productStockLedger } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { demandSchema } from '@/lib/validation';
import type { Demand } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireUser();
  if (!can(user.role, 'demand.view') && !can(user.role, 'demand.create')) {
    return fail('Your role does not allow this action.', 403);
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? '';
  const srFilter = can(user.role, 'demand.view') ? (url.searchParams.get('sr') ?? '') : user.id;

  const db = await readDb();
  const ledger = productStockLedger(db);
  const srName = new Map(db.users.map((u) => [u.id, u.name]));
  const products = new Map(db.products.map((p) => [p.id, p]));

  const demands = db.demands
    .filter((d) => (!srFilter || d.srId === srFilter) && (!status || d.status === status))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((d) => ({
      ...d,
      srName: srName.get(d.srId) ?? 'Unknown SR',
      units: d.items.reduce((n, i) => n + i.qty, 0),
      items: d.items.map((i) => {
        const product = products.get(i.productId);
        const inStore = ledger.get(i.productId)?.inStore ?? 0;
        return {
          ...i,
          productName: product?.name ?? 'Removed product',
          unit: product?.unit ?? 'pcs',
          inStore,
          // Flags the office when a request cannot be filled from the shelf.
          shortBy: Math.max(0, i.qty - inStore),
        };
      }),
    }));

  return ok({
    demands,
    counts: {
      pending: demands.filter((d) => d.status === 'PENDING').length,
      approved: demands.filter((d) => d.status === 'APPROVED').length,
      fulfilled: demands.filter((d) => d.status === 'FULFILLED').length,
    },
  });
});

export const POST = route(async (request: Request) => {
  const user = await requireUser();
  if (!can(user.role, 'demand.create') && !can(user.role, 'demand.manage')) {
    return fail('Your role does not allow this action.', 403);
  }
  const input = demandSchema.parse(await parseJson(request));
  const srId = user.role === 'SR' ? user.id : (input.srId ?? user.id);

  const result = await writeDb((db) => {
    if (!db.users.some((u) => u.id === srId)) {
      return { ok: false, error: 'That SR does not exist.' } as const;
    }
    const unknown = input.items.find((i) => !db.products.some((p) => p.id === i.productId));
    if (unknown) return { ok: false, error: `Unknown product: ${unknown.productId}` } as const;

    const demand: Demand = {
      id: newId('dmd'),
      srId,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      items: input.items,
      status: 'PENDING',
      priority: input.priority,
      note: input.note,
      createdAt: new Date().toISOString(),
    };
    db.demands.push(demand);
    logAction(db, user, 'demand.create', 'demand', demand.id, {
      units: demand.items.reduce((n, i) => n + i.qty, 0),
    });
    return { ok: true, demand } as const;
  });

  if (!result.ok) return fail(result.error, 422);
  return ok({ demand: result.demand }, { status: 201 });
});
