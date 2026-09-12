import type {
  Assignment,
  Database,
  Deposit,
  Expense,
  ExpenseCategory,
  Product,
  Sale,
  SalaryPayment,
  StockEntry,
  StockReturn,
} from './types';

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function inMonth(iso: string, month?: string): boolean {
  return !month || monthKey(iso) === month;
}

export function saleSubtotal(sale: Pick<Sale, 'items'>): number {
  return round2(sale.items.reduce((sum, i) => sum + i.qty * i.rate, 0));
}

export function saleTotal(sale: Pick<Sale, 'items' | 'discount'>): number {
  return round2(saleSubtotal(sale) - (sale.discount || 0));
}

export function stockEntryTotal(entry: Pick<StockEntry, 'items' | 'extraCost'>): number {
  return round2(
    entry.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0) + (entry.extraCost || 0),
  );
}

export function assignmentValue(a: Pick<Assignment, 'items'>): number {
  return round2(a.items.reduce((sum, i) => sum + i.qty * i.srRate, 0));
}

/** A sale only consumes stock and creates a receivable once it is not cancelled. */
export function isCountableSale(sale: Sale): boolean {
  return sale.status !== 'CANCELLED';
}

/* ------------------------------------------------------------------ stock */

export interface ProductStockRow {
  productId: string;
  /** Total units ever received into the store. */
  received: number;
  /** Units handed out to SRs. */
  assigned: number;
  /** Units SRs handed back. */
  returned: number;
  /** Units actually sold in the market. */
  sold: number;
  /** Units sitting in the central store right now. */
  inStore: number;
  /** Units sitting with SRs, not yet sold. */
  withSrs: number;
  /** Everything the company still owns: store + SR vans. */
  onHand: number;
}

export function productStockLedger(db: Database): Map<string, ProductStockRow> {
  const rows = new Map<string, ProductStockRow>();
  const row = (productId: string): ProductStockRow => {
    let r = rows.get(productId);
    if (!r) {
      r = {
        productId,
        received: 0,
        assigned: 0,
        returned: 0,
        sold: 0,
        inStore: 0,
        withSrs: 0,
        onHand: 0,
      };
      rows.set(productId, r);
    }
    return r;
  };

  for (const p of db.products) row(p.id);
  for (const e of db.stockEntries) for (const i of e.items) row(i.productId).received += i.qty;
  for (const a of db.assignments) for (const i of a.items) row(i.productId).assigned += i.qty;
  for (const r of db.returns) for (const i of r.items) row(i.productId).returned += i.qty;
  for (const s of db.sales) {
    if (!isCountableSale(s)) continue;
    for (const i of s.items) row(i.productId).sold += i.qty;
  }

  for (const r of rows.values()) {
    r.inStore = r.received - r.assigned + r.returned;
    r.withSrs = r.assigned - r.returned - r.sold;
    r.onHand = r.inStore + r.withSrs;
  }
  return rows;
}

/** Stock currently held by one SR, per product. */
export function srStockLedger(db: Database, srId: string): Map<string, number> {
  const held = new Map<string, number>();
  const bump = (productId: string, delta: number) =>
    held.set(productId, (held.get(productId) ?? 0) + delta);

  for (const a of db.assignments) {
    if (a.srId !== srId) continue;
    for (const i of a.items) bump(i.productId, i.qty);
  }
  for (const r of db.returns) {
    if (r.srId !== srId) continue;
    for (const i of r.items) bump(i.productId, -i.qty);
  }
  for (const s of db.sales) {
    if (s.srId !== srId || !isCountableSale(s)) continue;
    for (const i of s.items) bump(i.productId, -i.qty);
  }
  return held;
}

/* ------------------------------------------------------------- SR accounts */

export interface SrAccount {
  srId: string;
  /** Value of goods handed to the SR, at SR rate. */
  assignedValue: number;
  /** Number of sale invoices raised. */
  invoices: number;
  /** Value of goods actually sold in the market. */
  soldValue: number;
  /** Cash the SR collected from shops. */
  collected: number;
  /** Credit the shops still owe the SR. */
  marketDue: number;
  /** Cash the SR has handed back to the company. */
  deposited: number;
  /** Cash still in the SR's pocket: collected − deposited. */
  cashInHand: number;
  /** Units still loaded in the SR's van. */
  unitsInHand: number;
  /** Value of those units at SR rate. */
  stockValueInHand: number;
  lastSaleAt?: string;
  lastDepositAt?: string;
}

export function srAccount(db: Database, srId: string, month?: string): SrAccount {
  const sales = db.sales.filter(
    (s) => s.srId === srId && isCountableSale(s) && inMonth(s.date, month),
  );
  const deposits = db.deposits.filter((d) => d.srId === srId && inMonth(d.date, month));
  const assignments = db.assignments.filter((a) => a.srId === srId && inMonth(a.date, month));

  const soldValue = round2(sales.reduce((sum, s) => sum + s.total, 0));
  const collected = round2(sales.reduce((sum, s) => sum + s.paid, 0));
  const deposited = round2(deposits.reduce((sum, d) => sum + d.amount, 0));

  // Stock in hand is always "right now", never scoped to a month — a van does
  // not empty itself when the calendar flips.
  const held = srStockLedger(db, srId);
  const priceOf = new Map(db.products.map((p) => [p.id, p.srPrice]));
  let unitsInHand = 0;
  let stockValueInHand = 0;
  for (const [productId, qty] of held) {
    if (qty <= 0) continue;
    unitsInHand += qty;
    stockValueInHand += qty * (priceOf.get(productId) ?? 0);
  }

  const sortedSales = [...sales].sort((a, b) => b.date.localeCompare(a.date));
  const sortedDeposits = [...deposits].sort((a, b) => b.date.localeCompare(a.date));

  return {
    srId,
    assignedValue: round2(assignments.reduce((sum, a) => sum + a.totalValue, 0)),
    invoices: sales.length,
    soldValue,
    collected,
    marketDue: round2(soldValue - collected),
    deposited,
    cashInHand: round2(collected - deposited),
    unitsInHand,
    stockValueInHand: round2(stockValueInHand),
    lastSaleAt: sortedSales[0]?.date,
    lastDepositAt: sortedDeposits[0]?.date,
  };
}

/* --------------------------------------------------------------- finances */

export interface ExpenseBreakdown {
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
  expenseByCategory: ExpenseBreakdown[];
  /** Cost of goods actually sold — owner-only. */
  costOfGoodsSold?: number;
  grossProfit?: number;
  netProfit?: number;
  margin?: number;
  stockCostValue?: number;
}

/**
 * Build the finance picture for a month (or all time when `month` is omitted).
 *
 * Cost-derived figures are only filled in when `includeCost` is true, which the
 * callers gate on the `cost.view` capability — the owner's purchase price must
 * not leak through a derived number either.
 */
export function financeSummary(
  db: Database,
  options: { month?: string; includeCost: boolean },
): FinanceSummary {
  const { month, includeCost } = options;
  const sales = db.sales.filter((s) => isCountableSale(s) && inMonth(s.date, month));
  const deposits = db.deposits.filter((d) => inMonth(d.date, month));
  // A PRODUCT expense line is the supplier invoice total, which is the owner's
  // purchase price in aggregate — so it is dropped entirely for anyone else.
  const expenses = db.expenses.filter(
    (e) => inMonth(e.date, month) && (includeCost || e.category !== 'PRODUCT'),
  );

  const revenue = round2(sales.reduce((sum, s) => sum + s.total, 0));
  const collected = round2(sales.reduce((sum, s) => sum + s.paid, 0));
  const deposited = round2(deposits.reduce((sum, d) => sum + d.amount, 0));

  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    byCategory.set(e.category, round2((byCategory.get(e.category) ?? 0) + e.amount));
  }
  const totalExpense = round2(expenses.reduce((sum, e) => sum + e.amount, 0));
  // Zero, not hidden, for a non-owner: their `totalExpense` is running costs only.
  const productExpense = byCategory.get('PRODUCT') ?? 0;
  const salaryExpense = round2((byCategory.get('SALARY') ?? 0) + (byCategory.get('COMMISSION') ?? 0));

  // Cash still sitting with every SR, across all time (a float, not a monthly figure).
  const srIds = db.users.filter((u) => u.role === 'SR').map((u) => u.id);
  const cashWithSrs = round2(
    srIds.reduce((sum, id) => sum + srAccount(db, id).cashInHand, 0),
  );

  const summary: FinanceSummary = {
    month,
    revenue,
    collected,
    marketDue: round2(revenue - collected),
    deposited,
    cashWithSrs,
    totalExpense,
    productExpense,
    salaryExpense,
    otherExpense: round2(totalExpense - productExpense - salaryExpense),
    expenseByCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };

  if (includeCost) {
    const costOf = new Map(db.products.map((p) => [p.id, p.costPrice]));
    const cogs = round2(
      sales.reduce(
        (sum, s) => sum + s.items.reduce((n, i) => n + i.qty * (costOf.get(i.productId) ?? 0), 0),
        0,
      ),
    );
    const ledger = productStockLedger(db);
    let stockCostValue = 0;
    for (const [productId, row] of ledger) {
      if (row.onHand > 0) stockCostValue += row.onHand * (costOf.get(productId) ?? 0);
    }
    // Product purchases are already capitalised into stock, so subtracting both
    // COGS and the PRODUCT expense line would double-count them.
    const operatingExpense = round2(totalExpense - productExpense);
    summary.costOfGoodsSold = cogs;
    summary.grossProfit = round2(revenue - cogs);
    summary.netProfit = round2(revenue - cogs - operatingExpense);
    summary.margin = revenue > 0 ? round2(((revenue - cogs) / revenue) * 100) : 0;
    summary.stockCostValue = round2(stockCostValue);
  }

  return summary;
}

/** Revenue / expense per month, oldest first, for the dashboard trend chart. */
export function monthlyTrend(
  db: Database,
  months: number,
  includeCost: boolean,
): { month: string; revenue: number; expense: number; profit?: number }[] {
  const keys: string[] = [];
  const cursor = new Date();
  cursor.setUTCDate(1);
  for (let i = months - 1; i >= 0; i -= 1) {
    const d = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() - i, 1));
    keys.push(d.toISOString().slice(0, 7));
  }
  return keys.map((month) => {
    const s = financeSummary(db, { month, includeCost });
    return {
      month,
      revenue: s.revenue,
      expense: s.totalExpense,
      ...(includeCost ? { profit: s.netProfit } : {}),
    };
  });
}

/**
 * Products selling fastest in a window, for the "top movers" panel.
 * Pass `srId` to scope the tally to one rep's own book.
 */
export function topProducts(
  db: Database,
  options: { month?: string; limit?: number; srId?: string } = {},
): { product: Product; qty: number; value: number }[] {
  const { month, limit = 5, srId } = options;
  const tally = new Map<string, { qty: number; value: number }>();
  for (const s of db.sales) {
    if (srId && s.srId !== srId) continue;
    if (!isCountableSale(s) || !inMonth(s.date, month)) continue;
    for (const i of s.items) {
      const cur = tally.get(i.productId) ?? { qty: 0, value: 0 };
      cur.qty += i.qty;
      cur.value += i.qty * i.rate;
      tally.set(i.productId, cur);
    }
  }
  const byId = new Map(db.products.map((p) => [p.id, p]));
  return [...tally.entries()]
    .map(([productId, t]) => ({ product: byId.get(productId), qty: t.qty, value: round2(t.value) }))
    .filter((r): r is { product: Product; qty: number; value: number } => Boolean(r.product))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, limit);
}

export function salaryTotal(p: Pick<SalaryPayment, 'base' | 'commission' | 'bonus' | 'deduction'>): number {
  return round2(p.base + p.commission + p.bonus - p.deduction);
}

export type { Deposit, Expense, StockReturn };
