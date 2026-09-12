import { fail, ok, parseJson, route } from '@/lib/api';
import { hashPassword, requireCapability, toSafeUser } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { srAccount } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { userCreateSchema } from '@/lib/validation';
import type { User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireCapability('user.view');
  const url = new URL(request.url);
  const roleFilter = url.searchParams.get('role') ?? '';
  const month = url.searchParams.get('month') ?? '';

  const db = await readDb();
  const users = db.users
    .filter((u) => !roleFilter || u.role === roleFilter)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((u) => {
      const safe = toSafeUser(u);
      if (u.role !== 'SR') return { ...safe, account: null };
      return { ...safe, account: srAccount(db, u.id, month || undefined) };
    });

  return ok({
    users,
    canManage: can(user.role, 'user.manage'),
    counts: {
      total: db.users.length,
      active: db.users.filter((u) => u.active).length,
      sr: db.users.filter((u) => u.role === 'SR').length,
      dealer: db.users.filter((u) => u.role === 'DEALER').length,
    },
  });
});

export const POST = route(async (request: Request) => {
  const actor = await requireCapability('user.manage');
  const input = userCreateSchema.parse(await parseJson(request));
  const passwordHash = await hashPassword(input.password);

  const result = await writeDb((db) => {
    const phone = input.phone.toLowerCase();
    if (db.users.some((u) => u.phone.toLowerCase() === phone)) {
      return { ok: false, error: 'That phone number is already registered.' } as const;
    }
    if (input.email && db.users.some((u) => (u.email ?? '').toLowerCase() === input.email!.toLowerCase())) {
      return { ok: false, error: 'That email is already registered.' } as const;
    }

    const now = new Date().toISOString();
    const user: User = {
      id: newId('usr'),
      name: input.name,
      phone: input.phone,
      email: input.email || undefined,
      passwordHash,
      role: input.role,
      active: true,
      area: input.area,
      monthlySalary: input.monthlySalary,
      commissionRate: input.commissionRate,
      joinedAt: input.joinedAt ?? now,
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };
    db.users.push(user);
    logAction(db, actor, 'user.create', 'user', user.id, { role: user.role, name: user.name });
    return { ok: true, user: toSafeUser(user) } as const;
  });

  if (!result.ok) return fail(result.error, 409);
  return ok({ user: result.user }, { status: 201 });
});
