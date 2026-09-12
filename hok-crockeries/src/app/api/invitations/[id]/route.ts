import { and, eq } from 'drizzle-orm';

import { fail, ok, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { invitations } from '@/db/schema';
import { logAction } from '@/lib/audit';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Revoke a pending invitation, making its link dead immediately. */
export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, user } = await requireCapability('user.manage');
  const { id } = await ctx.params;

  const [revoked] = await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(and(eq(invitations.id, id), eq(invitations.orgId, orgId)))
    .returning({ id: invitations.id, email: invitations.email });

  if (!revoked) return fail('Invitation not found.', 404);
  await logAction(db, user, 'team.invite.revoke', 'invitation', id, { email: revoked.email });
  return ok({ revoked: true });
});
