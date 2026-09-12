import { cookies } from 'next/headers';
import { and, eq, isNull, sql } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { capabilitiesFor, findUserByEmail, hashPassword, toOrgSummary, toSafeUser } from '@/lib/auth';
import { getDb } from '@/db/client';
import { invitations, organizations, users } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { SESSION_COOKIE, signSession, sessionCookieOptions } from '@/lib/session';
import { acceptInviteSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** Look up an invitation so the accept page can show who invited whom. */
export const GET = route(async (request: Request) => {
  const token = new URL(request.url).searchParams.get('token') ?? '';
  if (!token) return fail('This invitation link is missing its token.', 400);

  const db = await getDb();
  const [row] = await db
    .select({ invite: invitations, org: organizations })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.orgId, organizations.id))
    .where(eq(invitations.token, token))
    .limit(1);

  if (!row) return fail('This invitation link is not valid.', 404);
  if (row.invite.revokedAt) return fail('This invitation has been revoked.', 410);
  if (row.invite.acceptedAt) return fail('This invitation has already been used.', 410);
  if (row.invite.expiresAt.getTime() < Date.now()) {
    return fail('This invitation has expired. Ask the owner to send a new one.', 410);
  }

  return ok({
    email: row.invite.email,
    name: row.invite.name,
    role: row.invite.role,
    organizationName: row.org.name,
  });
});

/**
 * Turn an invitation into a real account. The role, salary and territory come
 * from the invitation the owner created, never from the request body, so an
 * invitee cannot promote themselves on the way in.
 */
export const POST = route(async (request: Request) => {
  const input = acceptInviteSchema.parse(await parseJson(request));
  const db = await getDb();

  const [row] = await db
    .select({ invite: invitations, org: organizations })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.orgId, organizations.id))
    .where(and(eq(invitations.token, input.token), isNull(invitations.acceptedAt)))
    .limit(1);

  if (!row) return fail('This invitation link is not valid or has already been used.', 404);
  if (row.invite.revokedAt) return fail('This invitation has been revoked.', 410);
  if (row.invite.expiresAt.getTime() < Date.now()) {
    return fail('This invitation has expired. Ask the owner to send a new one.', 410);
  }
  if (await findUserByEmail(db, row.invite.email)) {
    return fail('An account already exists for this email. Sign in instead.', 409);
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      orgId: row.invite.orgId,
      name: input.name || row.invite.name || row.invite.email,
      email: row.invite.email,
      phone: input.phone ?? '',
      passwordHash,
      role: row.invite.role,
      area: row.invite.area,
      monthlySalary: row.invite.monthlySalary,
      commissionRate: row.invite.commissionRate,
      lastLoginAt: new Date(),
    })
    .returning();

  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.id, row.invite.id));

  await logAction(db, created, 'team.join', 'user', created.id, { role: created.role });

  const token = await signSession({
    sub: created.id,
    org: created.orgId,
    role: created.role,
    name: created.name,
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return ok(
    {
      user: toSafeUser(created),
      org: toOrgSummary(row.org),
      capabilities: capabilitiesFor(created.role),
    },
    { status: 201 },
  );
});
