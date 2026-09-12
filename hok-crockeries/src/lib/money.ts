/**
 * Money and document arithmetic.
 *
 * Kept free of database and framework imports so both the server and the
 * browser can compute a running total the same way — a form that previews an
 * invoice total must agree with the figure the API stores.
 */

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/** Sum a list of qty x rate lines. */
export function lineTotal(items: { qty: number; rate: number }[]): number {
  return round2(items.reduce((sum, i) => sum + i.qty * i.rate, 0));
}

export function saleTotal(items: { qty: number; rate: number }[], discount = 0): number {
  return round2(Math.max(0, lineTotal(items) - discount));
}

export function purchaseTotal(
  items: { qty: number; unitCost: number }[],
  extraCost = 0,
): number {
  return round2(items.reduce((sum, i) => sum + i.qty * i.unitCost, 0) + extraCost);
}

export function assignmentValue(items: { qty: number; srRate: number }[]): number {
  return round2(items.reduce((sum, i) => sum + i.qty * i.srRate, 0));
}

export function salaryTotal(p: {
  base: number;
  commission: number;
  bonus: number;
  deduction: number;
}): number {
  return round2(p.base + p.commission + p.bonus - p.deduction);
}

export function commissionOn(soldValue: number, ratePercent: number): number {
  return round2((soldValue * ratePercent) / 100);
}

/* ----------------------------------------------------------------- months */

/** The current month as YYYY-MM, in UTC so every client agrees. */
export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function shiftMonth(month: string, by: number): string {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1 + by, 1)).toISOString().slice(0, 7);
}

/** The last `count` months ending at `end` (default: this month), oldest first. */
export function recentMonths(count: number, end = currentMonth()): string[] {
  return Array.from({ length: count }, (_, i) => shiftMonth(end, i - (count - 1)));
}

export function isValidMonth(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

/**
 * Business dates are stored as UTC midnight of the chosen calendar day, so the
 * month a record belongs to never shifts with the server's timezone.
 */
export function toBusinessDate(input: string | Date): Date {
  if (input instanceof Date) {
    return new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate(), 0, 0, 0, 0),
    );
  }
  const parsed = new Date(input.length <= 10 ? `${input}T00:00:00.000Z` : input);
  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0, 0),
  );
}

/** Postgres returns numeric columns as strings; normalise them at the edge. */
export function num(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  }
  if (typeof value === 'bigint') return Number(value);
  return 0;
}

export function int(value: unknown): number {
  return Math.trunc(num(value));
}
