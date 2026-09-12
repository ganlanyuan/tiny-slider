import { eq } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { hashPassword, requireAuth, verifyPassword } from '@/lib/auth';
import { users } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { changePasswordSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** Change your own password. Requires the current one, so a borrowed session
 *  cannot be used to lock the real owner out. */
export const POST = route(async (request: Request) => {
  const { db, user } = await requireAuth();
  const input = changePasswordSchema.parse(await parseJson(request));

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!row || !(await verifyPassword(input.currentPassword, row.passwordHash))) {
    return fail('Your current password is incorrect.', 403);
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(input.newPassword), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await logAction(db, user, 'account.password', 'user', user.id);
  return ok({ changed: true });
});
