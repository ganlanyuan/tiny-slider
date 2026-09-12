import { ok, route } from '@/lib/api';
import { capabilitiesFor, getAuthContext } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Who am I, what workspace am I in, and what am I allowed to do. */
export const GET = route(async () => {
  const ctx = await getAuthContext();
  if (!ctx) return ok({ user: null, org: null, capabilities: [] });
  return ok({
    user: ctx.user,
    org: ctx.org,
    capabilities: capabilitiesFor(ctx.role),
  });
});
