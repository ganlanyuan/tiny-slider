import { and, asc, eq, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';

import { fail, ok, parseJson, route } from '@/lib/api';
import { findUserByEmail, requireCapability, toSafeUser } from '@/lib/auth';
import { invitations, users } from '@/db/schema';
import { srAccounts } from '@/db/queries/accounts';
import { logAction } from '@/lib/audit';
import { can } from '@/lib/permissions';
import { inviteSchema } from '@/lib/validation';
import type { Role } from '@/lib/types';

export const dynamic = 'force-dynamic';

const INVITE_TTL_DAYS = 14;

export const GET = route(async (request: Request) => {
  const { db, orgId, role } = await requireCapability('user.view');
  const url = new URL(request.url);
  const roleFilter = url.searchParams.get('role') ?? '';
  const month = url.searchParams.get('month') ?? '';

  const filters = [eq(users.orgId, orgId)];
  if (roleFilter) filters.push(eq(users.role, roleFilter as Role));

  const [rows, accounts] = await Promise.all([
    db.select().from(users).where(and(...filters)).orderBy(asc(users.name)),
    srAccounts(db, orgId, { month: month || undefined }),
  ]);

  const accountBySr = new Map(accounts.map((a) => [a.srId, a]));
  const all = await db
    .select({ role: users.role, active: users.active })
    .from(users)
    .where(eq(users.orgId, orgId));

  return ok({
    users: rows.map((u) => ({
      ...toSafeUser(u),
      account: u.role === 'SR' ? (accountBySr.get(u.id) ?? null) : null,
    })),
    canManage: can(role, 'user.manage'),
    counts: {
      total: all.length,
      active: all.filter((u) => u.active).length,
      sr: all.filter((u) => u.role === 'SR').length,
      manager: all.filter((u) => u.role === 'MANAGER').length,
      dealer: all.filter((u) => u.role === 'DEALER').length,
    },
  });
});

/**
 * Invite someone to the workspace.
 *
 * No password is set here. The invitee follows a single-use link and chooses
 * their own, which means an owner never handles anyone else's credentials.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('user.manage');
  const input = inviteSchema.parse(await parseJson(request));

  if (await findUserByEmail(db, input.email)) {
    return fail('Someone with that email already has an account.', 409);
  }

  // Re-inviting the same address replaces the previous pending invitation
  // rather than leaving two live links to the same seat.
  await db
    .update(invitations)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(invitations.orgId, orgId),
        sql`lower(${invitations.email}) = ${input.email}`,
        sql`${invitations.acceptedAt} IS NULL`,
        sql`${invitations.revokedAt} IS NULL`,
      ),
    );

  const [invite] = await db
    .insert(invitations)
    .values({
      orgId,
      email: input.email,
      name: input.name ?? '',
      role: input.role,
      area: input.area,
      monthlySalary: input.monthlySalary,
      commissionRate: input.commissionRate,
      token: randomBytes(32).toString('base64url'),
      invitedBy: user.id,
      expiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
    })
    .returning();

  await logAction(db, user, 'team.invite', 'invitation', invite.id, {
    email: invite.email,
    role: invite.role,
  });

  return ok(
    {
      invitation: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt.toISOString(),
      },
      // The caller turns this into a shareable link. There is no mail server in
      // this app, so the owner passes the link on however they normally would.
      token: invite.token,
    },
    { status: 201 },
  );
});
