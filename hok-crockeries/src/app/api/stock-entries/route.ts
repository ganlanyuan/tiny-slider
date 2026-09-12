import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import { fail, nextDocNumber, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { expenses, products, stockEntries, stockEntryItems } from '@/db/schema';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { purchaseTotal, toBusinessDate } from '@/lib/money';
import { stockEntrySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, showCost } = await requireCapability('inventory.view');
  const month = new URL(request.url).searchParams.get('month') ?? '';

  const monthFilter = month
    ? sql`AND to_char(${stockEntries.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`
    : sql``;

  const entries = await db
    .select()
    .from(stockEntries)
    .where(sql`${eq(stockEntries.orgId, orgId)} ${monthFilter}`)
    .orderBy(desc(stockEntries.date), desc(stockEntries.createdAt));

  const ids = entries.map((e) => e.id);
  const items = ids.length
    ? await db
        .select({
          entryId: stockEntryItems.entryId,
          productId: stockEntryItems.productId,
          qty: stockEntryItems.qty,
          unitCost: stockEntryItems.unitCost,
          productName: products.name,
          unit: products.unit,
        })
        .from(stockEntryItems)
        .innerJoin(products, eq(products.id, stockEntryItems.productId))
        .where(inArray(stockEntryItems.entryId, ids))
    : [];

  const byEntry = new Map<string, typeof items>();
  for (const item of items) {
    const list = byEntry.get(item.entryId) ?? [];
    list.push(item);
    byEntry.set(item.entryId, list);
  }

  return ok({
    showCost,
    entries: entries.map((e) => {
      const lines = byEntry.get(e.id) ?? [];
      return {
        id: e.id,
        invoiceNo: e.invoiceNo,
        supplier: e.supplier,
        date: e.date.toISOString(),
        note: e.note,
        units: lines.reduce((n, i) => n + i.qty, 0),
        lines: lines.length,
        items: lines.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          unit: i.unit,
          qty: i.qty,
          // Unit cost IS the purchase price, so it follows the same rule.
          ...(showCost ? { unitCost: i.unitCost } : {}),
        })),
        ...(showCost
          ? { total: e.total, paid: e.paid, due: Math.round((e.total - e.paid) * 100) / 100, extraCost: e.extraCost }
          : {}),
      };
    }),
  });
});

/**
 * Record goods arriving into the central store.
 *
 * A manager records what physically arrived; the money side is the owner's.
 * Any unit cost a non-owner submits is discarded and the product's standing
 * purchase price is used for valuation instead, so the figure never has to be
 * shown to them in order for the books to be right.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user, role } = await requireCapability('inventory.manage');
  const input = stockEntrySchema.parse(await parseJson(request));
  const setsCost = role === 'ADMIN';

  const productIds = input.items.map((i) => i.productId);
  const known = await db
    .select({ id: products.id, costPrice: products.costPrice, name: products.name })
    .from(products)
    .where(and(eq(products.orgId, orgId), inArray(products.id, productIds)));

  if (known.length !== new Set(productIds).size) {
    return fail('One or more products in this list do not exist.', 422);
  }
  const costOf = new Map(known.map((p) => [p.id, p.costPrice]));

  const items = input.items.map((i) => ({
    ...i,
    unitCost: setsCost ? i.unitCost : (costOf.get(i.productId) ?? 0),
  }));
  const extraCost = setsCost ? input.extraCost : 0;
  const paid = setsCost ? input.paid : 0;
  const total = purchaseTotal(items, extraCost);
  const date = toBusinessDate(input.date);

  const entry = await withTransaction(db, async (tx) => {
    const database = tx as Database;

    const existingNos = await database
      .select({ invoiceNo: stockEntries.invoiceNo })
      .from(stockEntries)
      .where(eq(stockEntries.orgId, orgId));

    const [created] = await database
      .insert(stockEntries)
      .values({
        orgId,
        invoiceNo:
          input.invoiceNo?.trim() ||
          nextDocNumber('PO', existingNos.map((e) => e.invoiceNo)),
        supplier: input.supplier,
        date,
        extraCost,
        total,
        paid,
        note: input.note,
        createdBy: user.id,
      })
      .returning();

    await database.insert(stockEntryItems).values(
      items.map((i) => ({
        entryId: created.id,
        productId: i.productId,
        qty: i.qty,
        unitCost: i.unitCost,
      })),
    );

    // Only the owner's own entry may move the standing purchase price.
    if (setsCost) {
      for (const item of items) {
        if (item.unitCost > 0) {
          await database
            .update(products)
            .set({ costPrice: item.unitCost, updatedAt: new Date() })
            .where(and(eq(products.id, item.productId), eq(products.orgId, orgId)));
        }
      }
    }

    // The purchase hits the books as one expense line, tied to its source.
    await database.insert(expenses).values({
      orgId,
      date,
      category: 'PRODUCT',
      amount: total,
      title: `Stock purchase — ${input.supplier}`,
      note: created.invoiceNo,
      refType: 'STOCK_ENTRY',
      refId: created.id,
      createdBy: user.id,
    });

    return created;
  });

  await logAction(db, user, 'stock.receive', 'stockEntry', entry.id, {
    supplier: entry.supplier,
    units: items.reduce((n, i) => n + i.qty, 0),
  });

  return ok({ entry: { ...entry, date: entry.date.toISOString() } }, { status: 201 });
});
