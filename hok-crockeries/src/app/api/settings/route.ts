import { eq } from 'drizzle-orm';

import { ok, parseJson, route } from '@/lib/api';
import { requireAuth, requireCapability, toOrgSummary } from '@/lib/auth';
import { organizations } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { organizationSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const { org } = await requireAuth();
  return ok({ organization: org });
});

/** Update the workspace. Everything here is per-organisation, nothing global. */
export const PATCH = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('settings.manage');
  const input = organizationSchema.parse(await parseJson(request));
  const { onboarded, ...fields } = input;

  const [updated] = await db
    .update(organizations)
    .set({
      ...fields,
      ...(onboarded === true ? { onboardedAt: new Date() } : {}),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, orgId))
    .returning();

  await logAction(db, user, 'settings.update', 'organization', orgId, {
    fields: Object.keys(input),
  });
  return ok({ organization: toOrgSummary(updated) });
});
