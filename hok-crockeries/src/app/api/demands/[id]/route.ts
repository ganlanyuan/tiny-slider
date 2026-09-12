import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { demandUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const user = await requireCapability('demand.manage');
  const { id } = await ctx.params;
  const patch = demandUpdateSchema.parse(await parseJson(request));

  const updated = await writeDb((db) => {
    const demand = db.demands.find((d) => d.id === id);
    if (!demand) return null;
    demand.status = patch.status;
    if (patch.note !== undefined) demand.note = patch.note;
    demand.handledBy = user.id;
    demand.handledAt = new Date().toISOString();
    logAction(db, user, `demand.${patch.status.toLowerCase()}`, 'demand', id);
    return demand;
  });

  if (!updated) return fail('Demand not found.', 404);
  return ok({ demand: updated });
});
