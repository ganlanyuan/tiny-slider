import { and, desc, eq, sql } from 'drizzle-orm';

import { ok, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { expenses, salaryPayments, stockEntries, stockEntryItems, users } from '@/db/schema';
import { srAccounts } from '@/db/queries/accounts';
import { financeSummary, monthlyTrend, productPerformance } from '@/db/queries/finance';
import { commissionOn, currentMonth, isValidMonth, round2 } from '@/lib/money';
import { can } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, role, org } = await requireCapability('report.view');
  const requested = new URL(request.url).searchParams.get('month');
  const month = isValidMonth(requested) ? requested : currentMonth();
  const showCost = can(role, 'report.profit');

  const monthFilter = (column: string) =>
    sql.raw(`to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM') = '${month}'`);

  const [summary, trend, productRows, accounts, staff, expenseRows, salaries] = await Promise.all([
    financeSummary(db, orgId, { month, includeCost: showCost }),
    monthlyTrend(db, orgId, 12, showCost),
    productPerformance(db, orgId, { month, includeCost: showCost }),
    srAccounts(db, orgId, { month }),
    db.select().from(users).where(and(eq(users.orgId, orgId), eq(users.role, 'SR'))),
    db
      .select()
      .from(expenses)
      .where(
        sql`${eq(expenses.orgId, orgId)} AND ${monthFilter('date')}
            ${showCost ? sql.raw('') : sql.raw(`AND category <> 'PRODUCT'`)}`,
      )
      .orderBy(desc(expenses.amount)),
    db
      .select({
        id: salaryPayments.id,
        userName: users.name,
        month: salaryPayments.month,
        total: salaryPayments.total,
        paidAt: salaryPayments.paidAt,
      })
      .from(salaryPayments)
      .innerJoin(users, eq(users.id, salaryPayments.userId))
      .where(and(eq(salaryPayments.orgId, orgId), eq(salaryPayments.month, month))),
  ]);

  const rateOf = new Map(staff.map((u) => [u.id, u.commissionRate]));
  const srRows = accounts.map((a) => ({
    ...a,
    commission: commissionOn(a.soldValue, rateOf.get(a.srId) ?? 0),
  }));

  // Purchase volume is safe to show; its value is not.
  const purchases = await db.execute(sql`
    SELECT COUNT(DISTINCT e.id)::int AS count,
           COALESCE(SUM(i.qty), 0)::int AS units,
           COALESCE(SUM(e.total), 0) AS value
    FROM ${stockEntries} e
    LEFT JOIN ${stockEntryItems} i ON i.entry_id = e.id
    WHERE e.org_id = ${orgId} AND ${monthFilter('e.date')}
  `);
  const purchaseRow = (
    Array.isArray(purchases) ? purchases : ((purchases as { rows?: unknown[] }).rows ?? [])
  )[0] as { count: number; units: number; value: string | number } | undefined;

  return ok({
    month,
    showCost,
    currency: org.currency,
    summary,
    trend,
    products: productRows,
    srs: srRows,
    purchases: {
      count: Number(purchaseRow?.count ?? 0),
      units: Number(purchaseRow?.units ?? 0),
      ...(showCost ? { value: round2(Number(purchaseRow?.value ?? 0)) } : {}),
    },
    expenses: expenseRows.map((e) => ({ ...e, date: e.date.toISOString() })),
    salaries: salaries.map((s) => ({ ...s, paidAt: s.paidAt.toISOString() })),
  });
});
