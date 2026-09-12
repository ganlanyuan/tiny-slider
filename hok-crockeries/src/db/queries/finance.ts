import { sql } from 'drizzle-orm';

import { int, num, recentMonths, round2 } from '@/lib/money';
import type { ExpenseCategory } from '@/lib/types';
import type { Database } from '../connect';
import { rows } from './rows';
import { cashWithSrs } from './accounts';
import { productStockLedger } from './stock';

/**
 * Finance aggregates.
 *
 * `includeCost` is the single switch that decides whether purchase-derived
 * numbers are computed at all. Callers pass the result of the `cost.view`
 * capability check, so a figure the viewer may not see is never calculated,
 * let alone serialised.
 */

export interface ExpenseSlice {
  category: ExpenseCategory;
  amount: number;
}

export interface FinanceSummary {
  month?: string;
  revenue: number;
  collected: number;
  marketDue: number;
  deposited: number;
  cashWithSrs: number;
  totalExpense: number;
  productExpense: number;
  salaryExpense: number;
  otherExpense: number;
  expenseByCategory: ExpenseSlice[];
  invoices: number;
  /** Owner-only from here down. */
  costOfGoodsSold?: number;
  grossProfit?: number;
  netProfit?: number;
  margin?: number;
  stockCostValue?: number;
}

const monthClause = (column: string, month?: string) =>
  month
    ? sql.raw(`AND to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM') = '${month.replace(/'/g, '')}'`)
    : sql.raw('');

export async function financeSummary(
  db: Database,
  orgId: string,
  options: { month?: string; includeCost: boolean },
): Promise<FinanceSummary> {
  const { month, includeCost } = options;

  const [salesRow] = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT COUNT(*)::int             AS invoices,
             COALESCE(SUM(total), 0)   AS revenue,
             COALESCE(SUM(paid), 0)    AS collected
      FROM sales
      WHERE org_id = ${orgId} AND status <> 'CANCELLED' ${monthClause('date', month)}
    `,
  );

  const [depositRow] = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT COALESCE(SUM(amount), 0) AS deposited
      FROM deposits
      WHERE org_id = ${orgId} ${monthClause('date', month)}
    `,
  );

  // A PRODUCT expense line is a supplier invoice total, which is the owner's
  // purchase price in aggregate — so it is excluded for everyone else, and the
  // resulting `totalExpense` is honestly labelled "running costs" in the UI.
  const costFilter = includeCost ? sql.raw('') : sql.raw(`AND category <> 'PRODUCT'`);
  const expenseRows = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT category, COALESCE(SUM(amount), 0) AS amount
      FROM expenses
      WHERE org_id = ${orgId} ${costFilter} ${monthClause('date', month)}
      GROUP BY category
      ORDER BY 2 DESC
    `,
  );

  const expenseByCategory: ExpenseSlice[] = expenseRows.map((r) => ({
    category: r.category as ExpenseCategory,
    amount: round2(num(r.amount)),
  }));
  const totalExpense = round2(expenseByCategory.reduce((n, e) => n + e.amount, 0));
  const productExpense = expenseByCategory.find((e) => e.category === 'PRODUCT')?.amount ?? 0;
  const salaryExpense = round2(
    expenseByCategory
      .filter((e) => e.category === 'SALARY' || e.category === 'COMMISSION')
      .reduce((n, e) => n + e.amount, 0),
  );

  const revenue = round2(num(salesRow?.revenue));
  const collected = round2(num(salesRow?.collected));

  const summary: FinanceSummary = {
    month,
    revenue,
    collected,
    marketDue: round2(revenue - collected),
    deposited: round2(num(depositRow?.deposited)),
    cashWithSrs: await cashWithSrs(db, orgId),
    totalExpense,
    productExpense,
    salaryExpense,
    otherExpense: round2(totalExpense - productExpense - salaryExpense),
    expenseByCategory,
    invoices: int(salesRow?.invoices),
  };

  if (!includeCost) return summary;

  const [cogsRow] = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT COALESCE(SUM(i.qty * p.cost_price), 0) AS cogs
      FROM sale_items i
      JOIN sales s    ON s.id = i.sale_id
      JOIN products p ON p.id = i.product_id
      WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED' ${monthClause('s.date', month)}
    `,
  );

  const ledger = await productStockLedger(db, orgId);
  const costs = await rows<Record<string, unknown>>(
    db,
    sql`SELECT id, cost_price FROM products WHERE org_id = ${orgId}`,
  );
  let stockCostValue = 0;
  for (const row of costs) {
    const onHand = ledger.get(String(row.id))?.onHand ?? 0;
    if (onHand > 0) stockCostValue += onHand * num(row.cost_price);
  }

  const cogs = round2(num(cogsRow?.cogs));
  // Stock purchases are capitalised into inventory, so subtracting both the
  // purchase total and the cost of goods sold would double-count them.
  const operatingExpense = round2(totalExpense - productExpense);

  summary.costOfGoodsSold = cogs;
  summary.grossProfit = round2(revenue - cogs);
  summary.netProfit = round2(revenue - cogs - operatingExpense);
  summary.margin = revenue > 0 ? round2(((revenue - cogs) / revenue) * 100) : 0;
  summary.stockCostValue = round2(stockCostValue);

  return summary;
}

export interface TrendPoint {
  month: string;
  revenue: number;
  expense: number;
  profit?: number;
}

/** Revenue, expense and (for the owner) profit per month, oldest first. */
export async function monthlyTrend(
  db: Database,
  orgId: string,
  months: number,
  includeCost: boolean,
): Promise<TrendPoint[]> {
  const wanted = recentMonths(months);
  const costFilter = includeCost ? sql.raw('') : sql.raw(`AND category <> 'PRODUCT'`);

  const revenueRows = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT to_char(date AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
             COALESCE(SUM(total), 0) AS revenue
      FROM sales
      WHERE org_id = ${orgId} AND status <> 'CANCELLED'
      GROUP BY 1
    `,
  );
  const expenseRows = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT to_char(date AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
             COALESCE(SUM(amount), 0) AS expense,
             COALESCE(SUM(amount) FILTER (WHERE category = 'PRODUCT'), 0) AS product_expense
      FROM expenses
      WHERE org_id = ${orgId} ${costFilter}
      GROUP BY 1
    `,
  );
  const cogsRows = includeCost
    ? await rows<Record<string, unknown>>(
        db,
        sql`
          SELECT to_char(s.date AT TIME ZONE 'UTC', 'YYYY-MM') AS month,
                 COALESCE(SUM(i.qty * p.cost_price), 0) AS cogs
          FROM sale_items i
          JOIN sales s    ON s.id = i.sale_id
          JOIN products p ON p.id = i.product_id
          WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'
          GROUP BY 1
        `,
      )
    : [];

  const revenueBy = new Map(revenueRows.map((r) => [String(r.month), num(r.revenue)]));
  const expenseBy = new Map(expenseRows.map((r) => [String(r.month), num(r.expense)]));
  const productBy = new Map(expenseRows.map((r) => [String(r.month), num(r.product_expense)]));
  const cogsBy = new Map(cogsRows.map((r) => [String(r.month), num(r.cogs)]));

  return wanted.map((month) => {
    const revenue = round2(revenueBy.get(month) ?? 0);
    const expense = round2(expenseBy.get(month) ?? 0);
    if (!includeCost) return { month, revenue, expense };
    const operating = round2(expense - (productBy.get(month) ?? 0));
    return {
      month,
      revenue,
      expense,
      profit: round2(revenue - (cogsBy.get(month) ?? 0) - operating),
    };
  });
}

export interface ProductPerformance {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  qty: number;
  revenue: number;
  inStore: number;
  withSrs: number;
  cost?: number;
  profit?: number;
}

/** Per-product sales performance for a month. */
export async function productPerformance(
  db: Database,
  orgId: string,
  options: { month?: string; includeCost: boolean; limit?: number; srId?: string },
): Promise<ProductPerformance[]> {
  const { month, includeCost, limit, srId } = options;
  const srFilter = srId ? sql`AND s.sr_id = ${srId}` : sql``;
  const capped = limit ? sql.raw(`LIMIT ${Math.max(1, Math.trunc(limit))}`) : sql.raw('');

  const result = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT p.id, p.sku, p.name, p.unit, p.cost_price,
             SUM(i.qty)::int               AS qty,
             COALESCE(SUM(i.qty * i.rate), 0) AS revenue,
             COALESCE(SUM(i.qty * p.cost_price), 0) AS cost
      FROM sale_items i
      JOIN sales s    ON s.id = i.sale_id
      JOIN products p ON p.id = i.product_id
      WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'
            ${srFilter} ${monthClause('s.date', month)}
      GROUP BY p.id, p.sku, p.name, p.unit, p.cost_price
      ORDER BY qty DESC, revenue DESC
      ${capped}
    `,
  );

  const ledger = await productStockLedger(db, orgId);
  return result.map((r) => {
    const productId = String(r.id);
    const revenue = round2(num(r.revenue));
    const cost = round2(num(r.cost));
    return {
      productId,
      sku: String(r.sku),
      name: String(r.name),
      unit: String(r.unit),
      qty: int(r.qty),
      revenue,
      inStore: ledger.get(productId)?.inStore ?? 0,
      withSrs: ledger.get(productId)?.withSrs ?? 0,
      ...(includeCost ? { cost, profit: round2(revenue - cost) } : {}),
    };
  });
}
