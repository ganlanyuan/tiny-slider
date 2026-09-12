import { and, desc, eq, inArray } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { products, stockReturnItems, stockReturns, users } from '@/db/schema';
import { srAvailableQty } from '@/db/queries/stock';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { toBusinessDate } from '@/lib/money';
import { returnSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const { db, orgId } = await requireCapability('assignment.view');

  const rows = await db
    .select({
      id: stockReturns.id,
      srId: stockReturns.srId,
      srName: users.name,
      date: stockReturns.date,
      reason: stockReturns.reason,
    })
    .from(stockReturns)
    .innerJoin(users, eq(users.id, stockReturns.srId))
    .where(eq(stockReturns.orgId, orgId))
    .orderBy(desc(stockReturns.date))
    .limit(200);

  const ids = rows.map((r) => r.id);
  const items = ids.length
    ? await db
        .select({
          returnId: stockReturnItems.returnId,
          productId: stockReturnItems.productId,
          productName: products.name,
          unit: products.unit,
          qty: stockReturnItems.qty,
        })
        .from(stockReturnItems)
        .innerJoin(products, eq(products.id, stockReturnItems.productId))
        .where(inArray(stockReturnItems.returnId, ids))
    : [];

  const byReturn = new Map<string, typeof items>();
  for (const item of items) {
    const list = byReturn.get(item.returnId) ?? [];
    list.push(item);
    byReturn.set(item.returnId, list);
  }

  return ok({
    returns: rows.map((r) => {
      const lines = byReturn.get(r.id) ?? [];
      return {
        ...r,
        date: r.date.toISOString(),
        units: lines.reduce((n, i) => n + i.qty, 0),
        items: lines,
      };
    }),
  });
});

/** Take unsold or damaged goods back from a rep, returning them to the store. */
export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('assignment.manage');
  const input = returnSchema.parse(await parseJson(request));

  const productIds = input.items.map((i) => i.productId);
  const catalogue = await db
    .select({ id: products.id, name: products.name, unit: products.unit })
    .from(products)
    .where(and(eq(products.orgId, orgId), inArray(products.id, productIds)));
  const info = new Map(catalogue.map((p) => [p.id, p]));

  const result = await withTransaction(db, async (tx) => {
    const database = tx as Database;

    // A rep cannot hand back more than they are carrying.
    const held = await srAvailableQty(database, orgId, input.srId, productIds);
    for (const item of input.items) {
      const have = held.get(item.productId) ?? 0;
      if (item.qty > have) {
        const p = info.get(item.productId);
        return {
          ok: false as const,
          error: `The rep only holds ${have} ${p?.unit ?? 'units'} of "${p?.name ?? 'that product'}".`,
        };
      }
    }

    const [created] = await database
      .insert(stockReturns)
      .values({
        orgId,
        srId: input.srId,
        date: toBusinessDate(input.date),
        reason: input.reason,
        createdBy: user.id,
      })
      .returning();

    await database.insert(stockReturnItems).values(
      input.items.map((i) => ({ returnId: created.id, productId: i.productId, qty: i.qty })),
    );

    return { ok: true as const, entry: created };
  });

  if (!result.ok) return fail(result.error, 422);

  await logAction(db, user, 'stock.return', 'return', result.entry.id, {
    units: input.items.reduce((n, i) => n + i.qty, 0),
  });

  return ok(
    { return: { ...result.entry, date: result.entry.date.toISOString() } },
    { status: 201 },
  );
});
