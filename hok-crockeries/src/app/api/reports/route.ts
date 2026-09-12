import { ok, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { readDb } from '@/lib/db';
import {
  currentMonth,
  financeSummary,
  monthlyTrend,
  productStockLedger,
  round2,
  srAccount,
  topProducts,
} from '@/lib/analytics';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireCapability('report.view');
  const url = new URL(request.url);
  const month = url.searchParams.get('month') || currentMonth();
  const showCost = can(user.role, 'report.profit');

  const db = await readDb();
  const ledger = productStockLedger(db);
  const summary = financeSummary(db, { month, includeCost: showCost });

  // Per-product performance for the month.
  const perProduct = new Map<string, { qty: number; revenue: number; cost: number }>();
  for (const sale of db.sales) {
    if (sale.status === 'CANCELLED' || !sale.date.startsWith(month)) continue;
    for (const item of sale.items) {
      const row = perProduct.get(item.productId) ?? { qty: 0, revenue: 0, cost: 0 };
      const product = db.products.find((p) => p.id === item.productId);
      row.qty += item.qty;
      row.revenue += item.qty * item.rate;
      row.cost += item.qty * (product?.costPrice ?? 0);
      perProduct.set(item.productId, row);
    }
  }

  const productRows = [...perProduct.entries()]
    .map(([productId, row]) => {
      const product = db.products.find((p) => p.id === productId);
      return {
        productId,
        name: product?.name ?? 'Removed product',
        sku: product?.sku ?? '—',
        unit: product?.unit ?? 'pcs',
        qty: row.qty,
        revenue: round2(row.revenue),
        inStore: ledger.get(productId)?.inStore ?? 0,
        withSrs: ledger.get(productId)?.withSrs ?? 0,
        ...(showCost
          ? { cost: round2(row.cost), profit: round2(row.revenue - row.cost) }
          : {}),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const srRows = db.users
    .filter((u) => u.role === 'SR')
    .map((u) => {
      const m = srAccount(db, u.id, month);
      const life = srAccount(db, u.id);
      return {
        id: u.id,
        name: u.name,
        area: u.area,
        active: u.active,
        invoices: m.invoices,
        soldValue: m.soldValue,
        collected: m.collected,
        deposited: m.deposited,
        cashInHand: life.cashInHand,
        marketDue: life.marketDue,
        stockValueInHand: life.stockValueInHand,
        commission: round2((m.soldValue * u.commissionRate) / 100),
      };
    })
    .sort((a, b) => b.soldValue - a.soldValue);

  const purchases = db.stockEntries.filter((e) => e.date.startsWith(month));

  return ok({
    month,
    showCost,
    summary,
    trend: monthlyTrend(db, 12, showCost),
    products: productRows,
    srs: srRows,
    topProducts: topProducts(db, { month, limit: 10 }).map((t) => ({
      id: t.product.id,
      name: t.product.name,
      qty: t.qty,
      value: t.value,
    })),
    purchases: {
      count: purchases.length,
      units: purchases.reduce((n, e) => n + e.items.reduce((m, i) => m + i.qty, 0), 0),
      ...(showCost ? { value: round2(purchases.reduce((n, e) => n + e.total, 0)) } : {}),
    },
    expenses: db.expenses
      .filter((e) => e.date.startsWith(month))
      .sort((a, b) => b.amount - a.amount),
    salaries: db.salaries
      .filter((s) => s.month === month)
      .map((s) => ({
        ...s,
        userName: db.users.find((u) => u.id === s.userId)?.name ?? 'Removed staff',
      })),
  });
});
