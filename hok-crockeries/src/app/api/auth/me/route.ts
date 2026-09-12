import { ok, route } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_CAPABILITIES } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null, capabilities: [] });
  return ok({ user, capabilities: ROLE_CAPABILITIES[user.role] });
});
