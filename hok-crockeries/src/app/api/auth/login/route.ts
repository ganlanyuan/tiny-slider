import { cookies } from 'next/headers';

import { fail, ok, parseJson, route } from '@/lib/api';
import { toSafeUser, verifyPassword } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { SESSION_COOKIE, signSession, sessionCookieOptions } from '@/lib/session';
import { loginSchema } from '@/lib/validation';

export const POST = route(async (request: Request) => {
  const body = loginSchema.parse(await parseJson(request));
  const identifier = body.phone.toLowerCase();

  const db = await readDb();
  const user = db.users.find(
    (u) => u.phone.toLowerCase() === identifier || (u.email ?? '').toLowerCase() === identifier,
  );

  // Same message either way so the form cannot be used to enumerate accounts.
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return fail('Phone/email or password is incorrect.', 401);
  }
  if (!user.active) {
    return fail('This account has been deactivated. Contact the owner.', 403);
  }

  const token = await signSession({ sub: user.id, name: user.name, role: user.role });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  return ok({ user: toSafeUser(user) });
});
