import { cookies } from 'next/headers';

import { ok, route } from '@/lib/api';
import { SESSION_COOKIE } from '@/lib/session';

export const POST = route(async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  return ok({ signedOut: true });
});
