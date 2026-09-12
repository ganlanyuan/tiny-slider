import { sql } from 'drizzle-orm';

import { int, num, round2 } from '@/lib/money';
import type { Database } from '../connect';
import { rows } from './rows';
import { srHoldings } from './stock';

/**
 * A sales rep's money position.
 *
 * `collected − deposited` is the cash still in the rep's pocket, and
 * `sold − collected` is what the shops still owe. Both are running, all-time
 * figures: a rep's pocket does not empty because the calendar turned over.
 * Only the activity figures are month-scoped.
 */

export interface SrAccount {
  srId: string;
  name: string;
  area: string | null;
  active: boolean;
  /** Value of goods handed over on challans, at SR rate. */
  assignedValue: number;
  invoices: number;
  soldValue: number;
  collected: number;
  /** Credit the shops still owe. */
  marketDue: number;
  deposited: number;
  /** Collected minus deposited — cash the rep is still holding. */
  cashInHand: number;
  unitsInHand: number;
  stockValueInHand: number;
  lastSaleAt: string | null;
  lastDepositAt: string | null;
}

const monthFilter = (column: string, month?: string) =>
  month
    ? sql.raw(`AND to_char(${column} AT TIME ZONE 'UTC', 'YYYY-MM') = '${month.replace(/'/g, '')}'`)
    : sql.raw('');

/**
 * Every rep's position in one query.
 *
 * `month` scopes the activity columns (sold, collected, deposited this month)
 * while the standing position — cash in hand, market due, stock held — is
 * always computed over all time.
 */
export async function srAccounts(
  db: Database,
  orgId: string,
  options: { month?: string; srId?: string } = {},
): Promise<SrAccount[]> {
  const { month, srId } = options;
  const only = srId ? sql`AND u.id = ${srId}` : sql``;

  const result = await rows<Record<string, unknown>>(
    db,
    sql`
      WITH sr AS (
        SELECT u.id, u.name, u.area, u.active
        FROM users u
        WHERE u.org_id = ${orgId} AND u.role = 'SR' ${only}
      ),
      month_sales AS (
        SELECT s.sr_id,
               COUNT(*)::int                AS invoices,
               COALESCE(SUM(s.total), 0)    AS sold_value,
               COALESCE(SUM(s.paid), 0)     AS collected
        FROM sales s
        WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'
              ${monthFilter('s.date', month)}
        GROUP BY s.sr_id
      ),
      life_sales AS (
        SELECT s.sr_id,
               COALESCE(SUM(s.total), 0) AS sold_value,
               COALESCE(SUM(s.paid), 0)  AS collected,
               MAX(s.date)               AS last_sale_at
        FROM sales s
        WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'
        GROUP BY s.sr_id
      ),
      month_deposits AS (
        SELECT d.sr_id, COALESCE(SUM(d.amount), 0) AS deposited
        FROM deposits d
        WHERE d.org_id = ${orgId} ${monthFilter('d.date', month)}
        GROUP BY d.sr_id
      ),
      life_deposits AS (
        SELECT d.sr_id,
               COALESCE(SUM(d.amount), 0) AS deposited,
               MAX(d.date)                AS last_deposit_at
        FROM deposits d
        WHERE d.org_id = ${orgId}
        GROUP BY d.sr_id
      ),
      month_assignments AS (
        SELECT a.sr_id, COALESCE(SUM(a.total_value), 0) AS assigned_value
        FROM assignments a
        WHERE a.org_id = ${orgId} ${monthFilter('a.date', month)}
        GROUP BY a.sr_id
      )
      SELECT
        sr.id, sr.name, sr.area, sr.active,
        COALESCE(month_assignments.assigned_value, 0) AS assigned_value,
        COALESCE(month_sales.invoices, 0)             AS invoices,
        COALESCE(month_sales.sold_value, 0)           AS sold_value,
        COALESCE(month_sales.collected, 0)            AS collected,
        COALESCE(month_deposits.deposited, 0)         AS deposited,
        COALESCE(life_sales.sold_value, 0)            AS life_sold,
        COALESCE(life_sales.collected, 0)             AS life_collected,
        COALESCE(life_deposits.deposited, 0)          AS life_deposited,
        life_sales.last_sale_at,
        life_deposits.last_deposit_at
      FROM sr
      LEFT JOIN month_sales       ON month_sales.sr_id       = sr.id
      LEFT JOIN life_sales        ON life_sales.sr_id        = sr.id
      LEFT JOIN month_deposits    ON month_deposits.sr_id    = sr.id
      LEFT JOIN life_deposits     ON life_deposits.sr_id     = sr.id
      LEFT JOIN month_assignments ON month_assignments.sr_id = sr.id
      ORDER BY COALESCE(month_sales.sold_value, 0) DESC, sr.name
    `,
  );

  // Stock in hand needs the per-product ledger, so it is fetched per rep.
  const accounts: SrAccount[] = [];
  for (const r of result) {
    const id = String(r.id);
    const held = await srHoldings(db, orgId, id);
    const lifeCollected = num(r.life_collected);
    const lifeSold = num(r.life_sold);
    const lifeDeposited = num(r.life_deposited);

    accounts.push({
      srId: id,
      name: String(r.name),
      area: (r.area as string | null) ?? null,
      active: Boolean(r.active),
      assignedValue: round2(num(r.assigned_value)),
      invoices: int(r.invoices),
      soldValue: round2(num(r.sold_value)),
      collected: round2(num(r.collected)),
      marketDue: round2(lifeSold - lifeCollected),
      deposited: round2(num(r.deposited)),
      cashInHand: round2(lifeCollected - lifeDeposited),
      unitsInHand: held.reduce((n, h) => n + h.qty, 0),
      stockValueInHand: round2(held.reduce((n, h) => n + h.value, 0)),
      lastSaleAt: r.last_sale_at ? new Date(r.last_sale_at as string).toISOString() : null,
      lastDepositAt: r.last_deposit_at
        ? new Date(r.last_deposit_at as string).toISOString()
        : null,
    });
  }
  return accounts;
}

export async function srAccount(
  db: Database,
  orgId: string,
  srId: string,
  month?: string,
): Promise<SrAccount | undefined> {
  const [account] = await srAccounts(db, orgId, { month, srId });
  return account;
}

/** Total cash sitting with every rep right now. */
export async function cashWithSrs(db: Database, orgId: string): Promise<number> {
  const [row] = await rows<Record<string, unknown>>(
    db,
    sql`
      SELECT COALESCE(
        (SELECT SUM(s.paid) FROM sales s
          WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'), 0)
        -
        COALESCE((SELECT SUM(d.amount) FROM deposits d WHERE d.org_id = ${orgId}), 0)
        AS cash
    `,
  );
  return round2(num(row?.cash));
}
