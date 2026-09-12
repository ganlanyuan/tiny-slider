import { and, desc, eq, inArray } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireAnyCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { demandItems, demands, products, users } from '@/db/schema';
import { productStockLedger } from '@/db/queries/stock';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { toBusinessDate } from '@/lib/money';
import { can } from '@/lib/permissions';
import { demandSchema } from '@/lib/validation';
import type { DemandStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability(['demand.view', 'demand.create']);
  const url = new URL(request.url);
  const status = url.searchParams.get('status') ?? '';
  const srFilter = can(role, 'demand.view') ? (url.searchParams.get('sr') ?? '') : user.id;

  const filters = [eq(demands.orgId, orgId)];
  if (srFilter) filters.push(eq(demands.srId, srFilter));
  if (status) filters.push(eq(demands.status, status as DemandStatus));

  const rows = await db
    .select({
      id: demands.id,
      srId: demands.srId,
      srName: users.name,
      date: demands.date,
      status: demands.status,
      priority: demands.priority,
      note: demands.note,
      handledAt: demands.handledAt,
    })
    .from(demands)
    .innerJoin(users, eq(users.id, demands.srId))
    .where(and(...filters))
    .orderBy(desc(demands.date), desc(demands.createdAt))
    .limit(300);

  const ids = rows.map((r) => r.id);
  const [items, ledger] = await Promise.all([
    ids.length
      ? db
          .select({
            demandId: demandItems.demandId,
            productId: demandItems.productId,
            productName: products.name,
            unit: products.unit,
            qty: demandItems.qty,
          })
          .from(demandItems)
          .innerJoin(products, eq(products.id, demandItems.productId))
          .where(inArray(demandItems.demandId, ids))
      : Promise.resolve([]),
    productStockLedger(db, orgId),
  ]);

  const byDemand = new Map<string, typeof items>();
  for (const item of items) {
    const list = byDemand.get(item.demandId) ?? [];
    list.push(item);
    byDemand.set(item.demandId, list);
  }

  const list = rows.map((r) => {
    const lines = byDemand.get(r.id) ?? [];
    return {
      ...r,
      date: r.date.toISOString(),
      handledAt: r.handledAt ? r.handledAt.toISOString() : null,
      units: lines.reduce((n, i) => n + i.qty, 0),
      items: lines.map((i) => {
        const inStore = ledger.get(i.productId)?.inStore ?? 0;
        return {
          ...i,
          inStore,
          // What the store cannot cover right now — the real restock signal.
          shortBy: Math.max(0, i.qty - inStore),
        };
      }),
    };
  });

  return ok({
    demands: list,
    counts: {
      pending: list.filter((d) => d.status === 'PENDING').length,
      approved: list.filter((d) => d.status === 'APPROVED').length,
      fulfilled: list.filter((d) => d.status === 'FULFILLED').length,
    },
  });
});

export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireAnyCapability(['demand.create', 'demand.manage']);
  const input = demandSchema.parse(await parseJson(request));
  const srId = role === 'SR' ? user.id : (input.srId ?? user.id);

  const [rep] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, srId), eq(users.orgId, orgId)))
    .limit(1);
  if (!rep) return fail('That sales rep does not exist.', 422);

  const productIds = input.items.map((i) => i.productId);
  const known = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.orgId, orgId), inArray(products.id, productIds)));
  if (known.length !== new Set(productIds).size) {
    return fail('One or more products in this request do not exist.', 422);
  }

  const created = await withTransaction(db, async (tx) => {
    const database = tx as Database;
    const [demand] = await database
      .insert(demands)
      .values({
        orgId,
        srId,
        date: input.date ? toBusinessDate(input.date) : toBusinessDate(new Date()),
        priority: input.priority,
        note: input.note,
      })
      .returning();

    await database
      .insert(demandItems)
      .values(input.items.map((i) => ({ demandId: demand.id, productId: i.productId, qty: i.qty })));

    return demand;
  });

  await logAction(db, user, 'demand.create', 'demand', created.id, {
    units: input.items.reduce((n, i) => n + i.qty, 0),
  });

  return ok({ demand: { ...created, date: created.date.toISOString() } }, { status: 201 });
});
