import { and, eq } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { demands } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { demandUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { db, orgId, user } = await requireCapability('demand.manage');
  const { id } = await ctx.params;
  const patch = demandUpdateSchema.parse(await parseJson(request));

  const [updated] = await db
    .update(demands)
    .set({
      status: patch.status,
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      handledBy: user.id,
      handledAt: new Date(),
    })
    .where(and(eq(demands.id, id), eq(demands.orgId, orgId)))
    .returning();

  if (!updated) return fail('Request not found.', 404);
  await logAction(db, user, `demand.${patch.status.toLowerCase()}`, 'demand', id);
  return ok({ demand: { ...updated, date: updated.date.toISOString() } });
});
