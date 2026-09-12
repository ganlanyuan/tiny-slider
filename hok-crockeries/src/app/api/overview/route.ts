import { ok, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
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

/**
 * The dashboard overview. Shape depends on the viewer's role: the owner sees
 * cost and profit, a manager sees the same operation without cost, an SR sees
 * only their own book, and a dealer sees the catalogue position.
 */
export const GET = route(async (request: Request) => {
  const user = await requireUser();
  const url = new URL(request.url);
  const month = url.searchParams.get('month') || currentMonth();
  const showCost = can(user.role, 'cost.view');

  const db = await readDb();
  const ledger = productStockLedger(db);

  const stock = {
    skus: db.products.filter((p) => p.active).length,
    unitsInStore: [...ledger.values()].reduce((n, r) => n + Math.max(0, r.inStore), 0),
    unitsWithSrs: [...ledger.values()].reduce((n, r) => n + Math.max(0, r.withSrs), 0),
    unitsReceived: [...ledger.values()].reduce((n, r) => n + r.received, 0),
    unitsSold: [...ledger.values()].reduce((n, r) => n + r.sold, 0),
    lowStock: db.products.filter((p) => {
      const inStore = ledger.get(p.id)?.inStore ?? 0;
      return p.active && inStore > 0 && inStore <= p.lowStockThreshold;
    }).length,
    outOfStock: db.products.filter((p) => p.active && (ledger.get(p.id)?.inStore ?? 0) <= 0).length,
    /** Retail value of everything still on hand, at SR rate. */
    valueAtSrRate: round2(
      db.products.reduce((n, p) => n + Math.max(0, ledger.get(p.id)?.onHand ?? 0) * p.srPrice, 0),
    ),
  };

  /* ------------------------------------------------------------ SR view */
  if (user.role === 'SR') {
    const account = srAccount(db, user.id, month);
    const lifetime = srAccount(db, user.id);
    const myDemands = db.demands.filter((d) => d.srId === user.id);
    return ok({
      role: user.role,
      month,
      showCost: false,
      account,
      lifetime,
      demands: {
        pending: myDemands.filter((d) => d.status === 'PENDING').length,
        approved: myDemands.filter((d) => d.status === 'APPROVED').length,
      },
      sales: {
        invoices: account.invoices,
        delivered: db.sales.filter(
          (s) => s.srId === user.id && s.status === 'DELIVERED' && s.date.startsWith(month),
        ).length,
        pending: db.sales.filter(
          (s) => s.srId === user.id && s.status === 'PENDING' && s.date.startsWith(month),
        ).length,
      },
      // Scoped to this rep — the panel is labelled "your top sellers", and a
      // rep has no business seeing the whole company's movement.
      topProducts: topProducts(db, { month, limit: 5, srId: user.id }).map((t) => ({
        id: t.product.id,
        name: t.product.name,
        qty: t.qty,
        value: t.value,
      })),
      recentSales: db.sales
        .filter((s) => s.srId === user.id)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 6),
    });
  }

  /* -------------------------------------------------------- dealer view */
  if (user.role === 'DEALER') {
    return ok({
      role: user.role,
      month,
      showCost: false,
      stock: {
        skus: stock.skus,
        unitsInStore: stock.unitsInStore,
        lowStock: stock.lowStock,
        outOfStock: stock.outOfStock,
      },
      topProducts: topProducts(db, { month, limit: 8 }).map((t) => ({
        id: t.product.id,
        name: t.product.name,
        qty: t.qty,
        marketPrice: t.product.marketPrice,
      })),
      categories: db.categories.length,
    });
  }

  /* ------------------------------------------------- owner / manager view */
  const finance = financeSummary(db, { month, includeCost: showCost });
  const allTime = financeSummary(db, { includeCost: showCost });
  const srs = db.users.filter((u) => u.role === 'SR' && u.active);

  const srBoard = srs
    .map((u) => {
      const m = srAccount(db, u.id, month);
      const life = srAccount(db, u.id);
      return {
        id: u.id,
        name: u.name,
        area: u.area,
        invoices: m.invoices,
        soldValue: m.soldValue,
        collected: m.collected,
        deposited: m.deposited,
        /** Cash still with the SR is a running position, not a monthly one. */
        cashInHand: life.cashInHand,
        marketDue: life.marketDue,
        unitsInHand: life.unitsInHand,
        stockValueInHand: life.stockValueInHand,
        lastSaleAt: life.lastSaleAt,
      };
    })
    .sort((a, b) => b.soldValue - a.soldValue);

  const pendingDemands = db.demands.filter((d) => d.status === 'PENDING');

  return ok({
    role: user.role,
    month,
    showCost,
    finance,
    allTime: {
      revenue: allTime.revenue,
      totalExpense: allTime.totalExpense,
      cashWithSrs: allTime.cashWithSrs,
      marketDue: allTime.marketDue,
      ...(showCost ? { netProfit: allTime.netProfit, stockCostValue: allTime.stockCostValue } : {}),
    },
    stock,
    trend: monthlyTrend(db, 6, showCost),
    srBoard,
    staff: {
      sr: srs.length,
      manager: db.users.filter((u) => u.role === 'MANAGER' && u.active).length,
      dealer: db.users.filter((u) => u.role === 'DEALER' && u.active).length,
      salaryBudget: round2(
        db.users
          .filter((u) => u.active && (u.role === 'SR' || u.role === 'MANAGER'))
          .reduce((n, u) => n + u.monthlySalary, 0),
      ),
      paidThisMonth: round2(
        db.salaries.filter((s) => s.month === month).reduce((n, s) => n + s.total, 0),
      ),
    },
    demands: {
      pending: pendingDemands.length,
      /** Requests the store cannot fill right now — the real restock signal. */
      unfillable: pendingDemands.filter((d) =>
        d.items.some((i) => i.qty > (ledger.get(i.productId)?.inStore ?? 0)),
      ).length,
    },
    deliveries: {
      delivered: db.sales.filter((s) => s.status === 'DELIVERED' && s.date.startsWith(month)).length,
      pending: db.sales.filter((s) => s.status === 'PENDING' && s.date.startsWith(month)).length,
      cancelled: db.sales.filter((s) => s.status === 'CANCELLED' && s.date.startsWith(month)).length,
    },
    topProducts: topProducts(db, { month, limit: 6 }).map((t) => ({
      id: t.product.id,
      name: t.product.name,
      qty: t.qty,
      value: t.value,
      ...(showCost ? { costPrice: t.product.costPrice } : {}),
    })),
    lowStockItems: db.products
      .filter((p) => p.active && (ledger.get(p.id)?.inStore ?? 0) <= p.lowStockThreshold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        inStore: ledger.get(p.id)?.inStore ?? 0,
        threshold: p.lowStockThreshold,
      }))
      .sort((a, b) => a.inStore - b.inStore)
      .slice(0, 8),
    activity: db.auditLogs.slice(0, 8),
  });
});
