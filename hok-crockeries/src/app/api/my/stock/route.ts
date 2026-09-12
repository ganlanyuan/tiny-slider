import { ok, route } from '@/lib/api';
import { requireUser } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { round2, srAccount, srStockLedger } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

/**
 * What the signed-in rep is carrying right now. Scoped to the caller by
 * construction — there is no id parameter to tamper with, so an SR can reach
 * their own van stock without being granted `user.view`.
 */
export const GET = route(async () => {
  const user = await requireUser();
  const db = await readDb();
  const products = new Map(db.products.map((p) => [p.id, p]));

  const holdings = [...srStockLedger(db, user.id)]
    .filter(([, qty]) => qty > 0)
    .map(([productId, qty]) => {
      const product = products.get(productId);
      return {
        productId,
        sku: product?.sku ?? '',
        name: product?.name ?? 'Removed product',
        nameBn: product?.nameBn,
        unit: product?.unit ?? 'pcs',
        qty,
        srPrice: product?.srPrice ?? 0,
        marketPrice: product?.marketPrice ?? 0,
        value: round2(qty * (product?.srPrice ?? 0)),
      };
    })
    .sort((a, b) => b.value - a.value);

  return ok({
    holdings,
    account: user.role === 'SR' ? srAccount(db, user.id) : null,
    totals: {
      lines: holdings.length,
      units: holdings.reduce((n, h) => n + h.qty, 0),
      value: round2(holdings.reduce((n, h) => n + h.value, 0)),
    },
  });
});
