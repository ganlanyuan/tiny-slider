import { ok, route } from '@/lib/api';
import { requireAuth } from '@/lib/auth';
import { srAccount } from '@/db/queries/accounts';
import { srHoldings } from '@/db/queries/stock';
import { round2 } from '@/lib/money';

export const dynamic = 'force-dynamic';

/**
 * What the signed-in rep is carrying right now.
 *
 * Scoped to the caller by construction — there is no id parameter to tamper
 * with — so a rep can see their own van without being granted `user.view`.
 */
export const GET = route(async () => {
  const { db, orgId, user, role } = await requireAuth();
  const holdings = await srHoldings(db, orgId, user.id);

  return ok({
    holdings,
    account: role === 'SR' ? await srAccount(db, orgId, user.id) : null,
    totals: {
      lines: holdings.length,
      units: holdings.reduce((n, h) => n + h.qty, 0),
      value: round2(holdings.reduce((n, h) => n + h.value, 0)),
    },
  });
});
