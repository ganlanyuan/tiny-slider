import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import {
  capabilitiesFor,
  findUserByEmail,
  toOrgSummary,
  toSafeUser,
  verifyPassword,
} from '@/lib/auth';
import { getDb } from '@/db/client';
import { organizations, users } from '@/db/schema';
import { SESSION_COOKIE, signSession, sessionCookieOptions } from '@/lib/session';
import { loginSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const POST = route(async (request: Request) => {
  const input = loginSchema.parse(await parseJson(request));
  const db = await getDb();

  const row = await findUserByEmail(db, input.email);

  // The same message either way, so the form cannot be used to discover which
  // email addresses have accounts.
  if (!row || !(await verifyPassword(input.password, row.passwordHash))) {
    return fail('Email or password is incorrect.', 401);
  }
  if (!row.active) {
    return fail('This account has been deactivated. Ask the owner to re-enable it.', 403);
  }

  const [org] = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, row.orgId))
    .limit(1);
  if (!org) return fail('This workspace no longer exists.', 403);

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, row.id));

  const token = await signSession({
    sub: row.id,
    org: row.orgId,
    role: row.role,
    name: row.name,
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return ok({
    user: toSafeUser(row),
    org: toOrgSummary(org),
    capabilities: capabilitiesFor(row.role),
  });
});
