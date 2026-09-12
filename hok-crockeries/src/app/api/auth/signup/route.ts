import { cookies } from 'next/headers';

import { fail, ok, parseJson, route } from '@/lib/api';
import { capabilitiesFor, findUserByEmail, hashPassword, toOrgSummary, toSafeUser } from '@/lib/auth';
import { getDb } from '@/db/client';
import { categories, organizations, users } from '@/db/schema';
import { SESSION_COOKIE, signSession, sessionCookieOptions } from '@/lib/session';
import { signupSchema } from '@/lib/validation';
import { slugify } from '@/lib/utils';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/** Starter categories so a brand-new workspace is not a blank page. */
const STARTER_CATEGORIES = [
  'Dinner Sets',
  'Plates & Bowls',
  'Glassware',
  'Mugs & Cups',
  'Cookware',
  'Storage & Jars',
  'Cutlery',
];

/**
 * Create a workspace and its owner in one step.
 *
 * This is the only route that creates an organisation. Everyone else joins an
 * existing one through an invitation, which is what keeps a tenant's data
 * reachable only by people its owner put there.
 */
export const POST = route(async (request: Request) => {
  const input = signupSchema.parse(await parseJson(request));
  const db = await getDb();

  if (await findUserByEmail(db, input.email)) {
    return fail('That email address is already registered. Sign in instead.', 409);
  }

  const passwordHash = await hashPassword(input.password);

  // A slug collision is possible between two similarly-named businesses, so
  // suffix until free rather than rejecting the signup.
  const base = slugify(input.organizationName).slice(0, 48) || 'workspace';
  let slug = base;
  for (let attempt = 1; attempt < 50; attempt += 1) {
    const [taken] = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(sql`${organizations.slug} = ${slug}`)
      .limit(1);
    if (!taken) break;
    slug = `${base}-${attempt + 1}`;
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: input.organizationName,
      slug,
      currency: input.currency,
      email: input.email,
      phone: input.phone ?? '',
    })
    .returning();

  const [owner] = await db
    .insert(users)
    .values({
      orgId: org.id,
      name: input.name,
      email: input.email,
      phone: input.phone ?? '',
      passwordHash,
      role: 'ADMIN',
      lastLoginAt: new Date(),
    })
    .returning();

  await db.insert(categories).values(
    STARTER_CATEGORIES.map((name) => ({ orgId: org.id, name, slug: slugify(name) })),
  );

  const token = await signSession({
    sub: owner.id,
    org: org.id,
    role: 'ADMIN',
    name: owner.name,
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  return ok(
    {
      user: toSafeUser(owner),
      org: toOrgSummary(org),
      capabilities: capabilitiesFor('ADMIN'),
    },
    { status: 201 },
  );
});
