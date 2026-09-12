import { cookies } from 'next/headers';

import { ok, route } from '@/lib/api';
import { SESSION_COOKIE } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  (await cookies()).delete(SESSION_COOKIE);
  return ok({ signedOut: true });
});
