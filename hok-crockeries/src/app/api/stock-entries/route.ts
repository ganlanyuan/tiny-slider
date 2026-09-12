import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, nextDocNumber, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { stockEntryTotal } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { stockEntrySchema } from '@/lib/validation';
import type { Expense, StockEntry } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireCapability('inventory.view');
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const showCost = can(user.role, 'cost.view');

  const db = await readDb();
  const names = new Map(db.products.map((p) => [p.id, p.name]));
  const entries = db.stockEntries
    .filter((e) => !month || e.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => ({
      id: e.id,
      invoiceNo: e.invoiceNo,
      supplier: e.supplier,
      date: e.date,
      note: e.note,
      createdAt: e.createdAt,
      units: e.items.reduce((n, i) => n + i.qty, 0),
      lines: e.items.length,
      items: e.items.map((i) => ({
        productId: i.productId,
        productName: names.get(i.productId) ?? 'Removed product',
        qty: i.qty,
        // Unit cost IS the owner's purchase price, so it follows the same rule.
        ...(showCost ? { unitCost: i.unitCost } : {}),
      })),
      ...(showCost
        ? { total: e.total, paid: e.paid, due: e.total - e.paid, extraCost: e.extraCost }
        : {}),
    }));

  return ok({ entries, showCost });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('inventory.manage');
  const input = stockEntrySchema.parse(await parseJson(request));
  const setsCost = can(user.role, 'cost.view');

  const created = await writeDb((db) => {
    const missing = input.items.find((i) => !db.products.some((p) => p.id === i.productId));
    if (missing) return { ok: false, error: `Unknown product in the list: ${missing.productId}` } as const;

    // A manager records what physically arrived, never what it cost. Their
    // submitted unit costs are discarded and the owner's standing purchase
    // price is used for valuation instead.
    if (!setsCost) {
      input.items = input.items.map((item) => ({
        ...item,
        unitCost: db.products.find((p) => p.id === item.productId)?.costPrice ?? 0,
      }));
      input.extraCost = 0;
      input.paid = 0;
    }

    const now = new Date().toISOString();
    const entry: StockEntry = {
      id: newId('stk'),
      invoiceNo:
        input.invoiceNo?.trim() ||
        nextDocNumber('PO', db.stockEntries.map((e) => e.invoiceNo)),
      supplier: input.supplier,
      date: input.date,
      items: input.items,
      extraCost: input.extraCost,
      total: stockEntryTotal(input),
      paid: input.paid,
      note: input.note,
      createdBy: user.id,
      createdAt: now,
    };
    db.stockEntries.push(entry);

    // Mirror the ledger onto the product record and book the purchase cost.
    for (const item of entry.items) {
      const product = db.products.find((p) => p.id === item.productId);
      if (!product) continue;
      product.stock += item.qty;
      product.updatedAt = now;
      // Only the owner's own entry may move the standing purchase price.
      if (setsCost && item.unitCost > 0) product.costPrice = item.unitCost;
    }

    const expense: Expense = {
      id: newId('exp'),
      date: entry.date,
      category: 'PRODUCT',
      amount: entry.total,
      title: `Stock purchase — ${entry.supplier}`,
      note: entry.invoiceNo,
      refType: 'STOCK_ENTRY',
      refId: entry.id,
      createdBy: user.id,
      createdAt: now,
    };
    db.expenses.push(expense);

    logAction(db, user, 'stock.receive', 'stockEntry', entry.id, {
      supplier: entry.supplier,
      units: entry.items.reduce((n, i) => n + i.qty, 0),
    });
    return { ok: true, entry } as const;
  });

  if (!created.ok) return fail(created.error, 422);
  return ok({ entry: created.entry }, { status: 201 });
});
