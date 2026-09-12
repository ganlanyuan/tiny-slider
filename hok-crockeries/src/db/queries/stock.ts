import { sql } from 'drizzle-orm';

import { int, num } from '@/lib/money';
import type { Database } from '../connect';
import { rows } from './rows';

/**
 * Stock is never stored as a mutable counter. It is derived from the documents
 * that moved it, so the books cannot drift out of step with reality:
 *
 *   in store = received − assigned + returned
 *   with SRs = assigned − returned − sold
 *
 * A cancelled invoice is excluded everywhere, which puts its goods back in the
 * rep's van automatically.
 */

export interface StockRow {
  productId: string;
  received: number;
  assigned: number;
  returned: number;
  sold: number;
  inStore: number;
  withSrs: number;
  onHand: number;
}

export async function productStockLedger(
  db: Database,
  orgId: string,
): Promise<Map<string, StockRow>> {
  const result = await rows<Record<string, unknown>>(
    db,
    sql`
      WITH received AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM stock_entry_items i
        JOIN stock_entries e ON e.id = i.entry_id
        WHERE e.org_id = ${orgId}
        GROUP BY i.product_id
      ),
      assigned AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM assignment_items i
        JOIN assignments a ON a.id = i.assignment_id
        WHERE a.org_id = ${orgId}
        GROUP BY i.product_id
      ),
      returned AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM stock_return_items i
        JOIN stock_returns r ON r.id = i.return_id
        WHERE r.org_id = ${orgId}
        GROUP BY i.product_id
      ),
      sold AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM sale_items i
        JOIN sales s ON s.id = i.sale_id
        WHERE s.org_id = ${orgId} AND s.status <> 'CANCELLED'
        GROUP BY i.product_id
      )
      SELECT
        p.id                             AS product_id,
        COALESCE(received.qty, 0)        AS received,
        COALESCE(assigned.qty, 0)        AS assigned,
        COALESCE(returned.qty, 0)        AS returned,
        COALESCE(sold.qty, 0)            AS sold
      FROM products p
      LEFT JOIN received ON received.product_id = p.id
      LEFT JOIN assigned ON assigned.product_id = p.id
      LEFT JOIN returned ON returned.product_id = p.id
      LEFT JOIN sold     ON sold.product_id     = p.id
      WHERE p.org_id = ${orgId}
    `,
  );

  const ledger = new Map<string, StockRow>();
  for (const r of result) {
    const received = int(r.received);
    const assigned = int(r.assigned);
    const returned = int(r.returned);
    const sold = int(r.sold);
    const inStore = received - assigned + returned;
    const withSrs = assigned - returned - sold;
    ledger.set(String(r.product_id), {
      productId: String(r.product_id),
      received,
      assigned,
      returned,
      sold,
      inStore,
      withSrs,
      onHand: inStore + withSrs,
    });
  }
  return ledger;
}

/** Units currently loaded in one rep's van, per product. */
export async function srHoldings(
  db: Database,
  orgId: string,
  srId: string,
): Promise<
  { productId: string; sku: string; name: string; unit: string; qty: number; srPrice: number; marketPrice: number; value: number }[]
> {
  const result = await rows<Record<string, unknown>>(
    db,
    sql`
      WITH assigned AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM assignment_items i
        JOIN assignments a ON a.id = i.assignment_id
        WHERE a.org_id = ${orgId} AND a.sr_id = ${srId}
        GROUP BY i.product_id
      ),
      returned AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM stock_return_items i
        JOIN stock_returns r ON r.id = i.return_id
        WHERE r.org_id = ${orgId} AND r.sr_id = ${srId}
        GROUP BY i.product_id
      ),
      sold AS (
        SELECT i.product_id, SUM(i.qty)::int AS qty
        FROM sale_items i
        JOIN sales s ON s.id = i.sale_id
        WHERE s.org_id = ${orgId} AND s.sr_id = ${srId} AND s.status <> 'CANCELLED'
        GROUP BY i.product_id
      )
      SELECT
        p.id AS product_id, p.sku, p.name, p.unit, p.sr_price, p.market_price,
        (COALESCE(assigned.qty,0) - COALESCE(returned.qty,0) - COALESCE(sold.qty,0)) AS qty
      FROM assigned
      JOIN products p ON p.id = assigned.product_id
      LEFT JOIN returned ON returned.product_id = assigned.product_id
      LEFT JOIN sold     ON sold.product_id     = assigned.product_id
      WHERE (COALESCE(assigned.qty,0) - COALESCE(returned.qty,0) - COALESCE(sold.qty,0)) > 0
      ORDER BY p.name
    `,
  );

  return result.map((r) => {
    const qty = int(r.qty);
    const srPrice = num(r.sr_price);
    return {
      productId: String(r.product_id),
      sku: String(r.sku),
      name: String(r.name),
      unit: String(r.unit),
      qty,
      srPrice,
      marketPrice: num(r.market_price),
      value: Math.round(qty * srPrice * 100) / 100,
    };
  });
}

/** How many units of one product a rep can still sell. Used to guard a sale. */
export async function srAvailableQty(
  db: Database,
  orgId: string,
  srId: string,
  productIds: string[],
): Promise<Map<string, number>> {
  if (productIds.length === 0) return new Map();
  const held = await srHoldings(db, orgId, srId);
  const wanted = new Set(productIds);
  const map = new Map<string, number>();
  for (const h of held) {
    if (wanted.has(h.productId)) map.set(h.productId, h.qty);
  }
  for (const id of productIds) if (!map.has(id)) map.set(id, 0);
  return map;
}

/** Units of each product sitting in the central store. Used to guard a challan. */
export async function storeAvailableQty(
  db: Database,
  orgId: string,
  productIds: string[],
): Promise<Map<string, number>> {
  const ledger = await productStockLedger(db, orgId);
  const map = new Map<string, number>();
  for (const id of productIds) map.set(id, ledger.get(id)?.inStore ?? 0);
  return map;
}
