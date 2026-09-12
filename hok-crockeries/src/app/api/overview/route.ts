import { and, desc, eq, ne, sql } from 'drizzle-orm';

import { ok, route } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { auditLogs, categories, demandItems, demands, products, sales, users } from '@/db/schema';
import { srAccount, srAccounts } from '@/db/queries/accounts';
import { financeSummary, monthlyTrend, productPerformance } from '@/db/queries/finance';
import { productStockLedger } from '@/db/queries/stock';
import { currentMonth, isValidMonth, round2 } from '@/lib/money';

export const dynamic = 'force-dynamic';

/**
 * The dashboard payload, shaped by role.
 *
 * An owner sees cost and profit, a manager sees the same operation without
 * them, a rep sees only their own book, and a dealer sees the catalogue
 * position. Nothing a role may not see is computed, let alone serialised.
 */
export const GET = route(async (request: Request) => {
  const { db, orgId, user, role, showCost, org } = await requireAuth();
  const requested = new URL(request.url).searchParams.get('month');
  const month = isValidMonth(requested) ? requested : currentMonth();

  const ledger = await productStockLedger(db, orgId);
  const catalogue = await db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      srPrice: products.srPrice,
      lowStockThreshold: products.lowStockThreshold,
      active: products.active,
    })
    .from(products)
    .where(eq(products.orgId, orgId));

  const activeProducts = catalogue.filter((p) => p.active);
  const stock = {
    skus: activeProducts.length,
    unitsInStore: [...ledger.values()].reduce((n, r) => n + Math.max(0, r.inStore), 0),
    unitsWithSrs: [...ledger.values()].reduce((n, r) => n + Math.max(0, r.withSrs), 0),
    unitsReceived: [...ledger.values()].reduce((n, r) => n + r.received, 0),
    unitsSold: [...ledger.values()].reduce((n, r) => n + r.sold, 0),
    lowStock: activeProducts.filter((p) => {
      const inStore = ledger.get(p.id)?.inStore ?? 0;
      return inStore > 0 && inStore <= p.lowStockThreshold;
    }).length,
    outOfStock: activeProducts.filter((p) => (ledger.get(p.id)?.inStore ?? 0) <= 0).length,
    valueAtSrRate: round2(
      catalogue.reduce((n, p) => n + Math.max(0, ledger.get(p.id)?.onHand ?? 0) * p.srPrice, 0),
    ),
  };

  /* ------------------------------------------------------------ SR view */
  if (role === 'SR') {
    const [monthAccount, lifetime, top, recent, myDemands] = await Promise.all([
      srAccount(db, orgId, user.id, month),
      srAccount(db, orgId, user.id),
      productPerformance(db, orgId, { month, includeCost: false, limit: 5, srId: user.id }),
      db
        .select({
          id: sales.id,
          invoiceNo: sales.invoiceNo,
          date: sales.date,
          shopName: sales.shopName,
          total: sales.total,
          paid: sales.paid,
          status: sales.status,
        })
        .from(sales)
        .where(and(eq(sales.orgId, orgId), eq(sales.srId, user.id)))
        .orderBy(desc(sales.date), desc(sales.createdAt))
        .limit(6),
      db
        .select({ status: demands.status })
        .from(demands)
        .where(and(eq(demands.orgId, orgId), eq(demands.srId, user.id))),
    ]);

    const monthSales = await db
      .select({ status: sales.status })
      .from(sales)
      .where(
        sql`${and(eq(sales.orgId, orgId), eq(sales.srId, user.id))}
            AND to_char(${sales.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`,
      );

    return ok({
      role,
      month,
      showCost: false,
      currency: org.currency,
      account: monthAccount,
      lifetime,
      demands: {
        pending: myDemands.filter((d) => d.status === 'PENDING').length,
        approved: myDemands.filter((d) => d.status === 'APPROVED').length,
      },
      sales: {
        invoices: monthAccount?.invoices ?? 0,
        delivered: monthSales.filter((s) => s.status === 'DELIVERED').length,
        pending: monthSales.filter((s) => s.status === 'PENDING').length,
      },
      topProducts: top.map((t) => ({
        id: t.productId,
        name: t.name,
        qty: t.qty,
        value: t.revenue,
      })),
      recentSales: recent.map((s) => ({
        ...s,
        date: s.date.toISOString(),
        due: round2(s.total - s.paid),
      })),
    });
  }

  /* -------------------------------------------------------- dealer view */
  if (role === 'DEALER') {
    const [top, categoryRows] = await Promise.all([
      productPerformance(db, orgId, { month, includeCost: false, limit: 8 }),
      db.select({ id: categories.id }).from(categories).where(eq(categories.orgId, orgId)),
    ]);
    const priceOf = new Map(
      (
        await db
          .select({ id: products.id, marketPrice: products.marketPrice })
          .from(products)
          .where(eq(products.orgId, orgId))
      ).map((p) => [p.id, p.marketPrice]),
    );

    return ok({
      role,
      month,
      showCost: false,
      currency: org.currency,
      stock: {
        skus: stock.skus,
        unitsInStore: stock.unitsInStore,
        lowStock: stock.lowStock,
        outOfStock: stock.outOfStock,
      },
      categories: categoryRows.length,
      topProducts: top.map((t) => ({
        id: t.productId,
        name: t.name,
        qty: t.qty,
        marketPrice: priceOf.get(t.productId) ?? 0,
      })),
    });
  }

  /* ------------------------------------------------- owner / manager view */
  // A brand-new workspace has nothing to chart, so the dashboard shows a setup
  // checklist instead. Each step is derived from real data, not a stored flag,
  // so it stays accurate even if someone starts in the middle.
  const setup = {
    dismissed: Boolean(org.onboardedAt),
    hasProducts: activeProducts.length > 0,
    hasTeam: false,
    hasStock: stock.unitsReceived > 0,
    hasChallan: stock.unitsWithSrs > 0 || stock.unitsSold > 0,
    hasSales: stock.unitsSold > 0,
  };

  const [finance, allTime, trend, accounts, top, activity] = await Promise.all([
    financeSummary(db, orgId, { month, includeCost: showCost }),
    financeSummary(db, orgId, { includeCost: showCost }),
    monthlyTrend(db, orgId, 6, showCost),
    srAccounts(db, orgId, { month }),
    productPerformance(db, orgId, { month, includeCost: showCost, limit: 6 }),
    db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.orgId, orgId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(8),
  ]);

  const [{ teamCount }] = await db
    .select({ teamCount: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(users)
    .where(and(eq(users.orgId, orgId), ne(users.role, 'ADMIN')));
  setup.hasTeam = teamCount > 0;

  const pendingDemands = await db
    .select({ id: demands.id, productId: demandItems.productId, qty: demandItems.qty })
    .from(demands)
    .innerJoin(demandItems, eq(demandItems.demandId, demands.id))
    .where(and(eq(demands.orgId, orgId), eq(demands.status, 'PENDING')));

  const unfillable = new Set(
    pendingDemands
      .filter((d) => d.qty > (ledger.get(d.productId)?.inStore ?? 0))
      .map((d) => d.id),
  );

  const monthSales = await db
    .select({ status: sales.status })
    .from(sales)
    .where(
      sql`${eq(sales.orgId, orgId)}
          AND to_char(${sales.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`,
    );

  const staff = await db.execute(sql`
    SELECT role, COUNT(*)::int AS count, COALESCE(SUM(monthly_salary), 0) AS salary
    FROM users WHERE org_id = ${orgId} AND active = true GROUP BY role
  `);
  const staffList = (Array.isArray(staff) ? staff : ((staff as { rows?: unknown[] }).rows ?? [])) as {
    role: string;
    count: number;
    salary: string | number;
  }[];
  const countFor = (r: string) => staffList.find((s) => s.role === r)?.count ?? 0;
  const salaryBudget = round2(
    staffList
      .filter((s) => s.role === 'SR' || s.role === 'MANAGER')
      .reduce((n, s) => n + Number(s.salary), 0),
  );

  const paidThisMonth = await db.execute(sql`
    SELECT COALESCE(SUM(total), 0) AS paid
    FROM salary_payments WHERE org_id = ${orgId} AND month = ${month}
  `);
  const paidRow = (
    Array.isArray(paidThisMonth) ? paidThisMonth : ((paidThisMonth as { rows?: unknown[] }).rows ?? [])
  )[0] as { paid: string | number } | undefined;

  return ok({
    role,
    month,
    showCost,
    currency: org.currency,
    setup,
    finance,
    allTime: {
      revenue: allTime.revenue,
      totalExpense: allTime.totalExpense,
      cashWithSrs: allTime.cashWithSrs,
      marketDue: allTime.marketDue,
      ...(showCost ? { netProfit: allTime.netProfit, stockCostValue: allTime.stockCostValue } : {}),
    },
    stock,
    trend,
    srBoard: accounts.filter((a) => a.active),
    staff: {
      sr: countFor('SR'),
      manager: countFor('MANAGER'),
      dealer: countFor('DEALER'),
      salaryBudget,
      paidThisMonth: round2(Number(paidRow?.paid ?? 0)),
    },
    demands: {
      pending: new Set(pendingDemands.map((d) => d.id)).size,
      unfillable: unfillable.size,
    },
    deliveries: {
      delivered: monthSales.filter((s) => s.status === 'DELIVERED').length,
      pending: monthSales.filter((s) => s.status === 'PENDING').length,
      cancelled: monthSales.filter((s) => s.status === 'CANCELLED').length,
    },
    topProducts: top.map((t) => ({
      id: t.productId,
      name: t.name,
      qty: t.qty,
      value: t.revenue,
    })),
    lowStockItems: activeProducts
      .map((p) => ({
        id: p.id,
        name: p.name,
        unit: p.unit,
        inStore: ledger.get(p.id)?.inStore ?? 0,
        threshold: p.lowStockThreshold,
      }))
      .filter((p) => p.inStore <= p.threshold)
      .sort((a, b) => a.inStore - b.inStore)
      .slice(0, 8),
    activity: activity.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
  });
});
