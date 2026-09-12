import 'server-only';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';

import { getDb, type Database } from '@/db/client';
import { organizations, users } from '@/db/schema';
import { can, ROLE_CAPABILITIES, type Capability } from './permissions';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './session';
import type { OrgSummary, Role, SafeUser } from './types';

export class AuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

type UserRow = typeof users.$inferSelect;
type OrgRow = typeof organizations.$inferSelect;

export function toSafeUser(row: UserRow): SafeUser {
  return {
    id: row.id,
    orgId: row.orgId,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role as Role,
    active: row.active,
    area: row.area,
    monthlySalary: row.monthlySalary,
    commissionRate: row.commissionRate,
    joinedAt: row.joinedAt.toISOString(),
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toOrgSummary(row: OrgRow): OrgSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    address: row.address,
    phone: row.phone,
    email: row.email,
    currency: row.currency,
    lowStockThreshold: row.lowStockThreshold,
    units: row.units ?? [],
    onboardedAt: row.onboardedAt ? row.onboardedAt.toISOString() : null,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}

/** Everything a request handler needs: the caller, their org, and the db handle. */
export interface AuthContext {
  db: Database;
  user: SafeUser;
  org: OrgSummary;
  orgId: string;
  role: Role;
  /** True when the caller may see purchase cost and anything derived from it. */
  showCost: boolean;
}

/**
 * Resolve the caller from the database rather than trusting the token body, so
 * a deactivated account, a changed role or a deleted organisation loses access
 * on the very next request.
 */
export async function getAuthContext(): Promise<AuthContext | null> {
  const session = await getSession();
  if (!session) return null;

  const db = await getDb();
  const [row] = await db
    .select({ user: users, org: organizations })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(eq(users.id, session.sub))
    .limit(1);

  if (!row || !row.user.active) return null;
  // A token minted for a different organisation must not unlock this one.
  if (row.user.orgId !== session.org) return null;

  const user = toSafeUser(row.user);
  return {
    db,
    user,
    org: toOrgSummary(row.org),
    orgId: user.orgId,
    role: user.role,
    showCost: can(user.role, 'cost.view'),
  };
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  return (await getAuthContext())?.user ?? null;
}

export async function requireAuth(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx) throw new AuthError('You must be signed in.', 401);
  return ctx;
}

export async function requireCapability(capability: Capability): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!can(ctx.role, capability)) {
    throw new AuthError('Your role does not allow this action.', 403);
  }
  return ctx;
}

/** Any one of the listed capabilities is enough. */
export async function requireAnyCapability(capabilities: Capability[]): Promise<AuthContext> {
  const ctx = await requireAuth();
  if (!capabilities.some((c) => can(ctx.role, c))) {
    throw new AuthError('Your role does not allow this action.', 403);
  }
  return ctx;
}

export function capabilitiesFor(role: Role): string[] {
  return [...ROLE_CAPABILITIES[role]];
}

/** Case-insensitive email lookup, used by sign-in and by invite acceptance. */
export async function findUserByEmail(db: Database, email: string): Promise<UserRow | undefined> {
  const [row] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.trim().toLowerCase()}`)
    .limit(1);
  return row;
}
