import { and, desc, eq, isNull } from 'drizzle-orm';

import { ok, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { invitations } from '@/db/schema';

export const dynamic = 'force-dynamic';

/** Pending invitations for this workspace, newest first. */
export const GET = route(async () => {
  const { db, orgId } = await requireCapability('user.manage');

  const rows = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.orgId, orgId),
        isNull(invitations.acceptedAt),
        isNull(invitations.revokedAt),
      ),
    )
    .orderBy(desc(invitations.createdAt))
    .limit(100);

  const now = Date.now();
  return ok({
    invitations: rows.map((i) => ({
      id: i.id,
      email: i.email,
      name: i.name,
      role: i.role,
      token: i.token,
      expiresAt: i.expiresAt.toISOString(),
      expired: i.expiresAt.getTime() < now,
      createdAt: i.createdAt.toISOString(),
    })),
  });
});
