import { fail, ok, parseJson, route } from '@/lib/api';
import { hashPassword, requireCapability, toSafeUser } from '@/lib/auth';
import { readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { srAccount, srStockLedger } from '@/lib/analytics';
import { userUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  await requireCapability('user.view');
  const { id } = await ctx.params;
  const db = await readDb();
  const user = db.users.find((u) => u.id === id);
  if (!user) return fail('User not found.', 404);

  const products = new Map(db.products.map((p) => [p.id, p]));
  const holdings =
    user.role === 'SR'
      ? [...srStockLedger(db, id)]
          .filter(([, qty]) => qty > 0)
          .map(([productId, qty]) => {
            const product = products.get(productId);
            return {
              productId,
              name: product?.name ?? 'Removed product',
              unit: product?.unit ?? 'pcs',
              qty,
              srPrice: product?.srPrice ?? 0,
              value: qty * (product?.srPrice ?? 0),
            };
          })
          .sort((a, b) => b.value - a.value)
      : [];

  return ok({
    user: toSafeUser(user),
    account: user.role === 'SR' ? srAccount(db, id) : null,
    holdings,
    recentSales: db.sales
      .filter((s) => s.srId === id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10),
    recentDeposits: db.deposits
      .filter((d) => d.srId === id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10),
  });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const actor = await requireCapability('user.manage');
  const { id } = await ctx.params;
  const patch = userUpdateSchema.parse(await parseJson(request));
  const passwordHash = patch.password ? await hashPassword(patch.password) : undefined;

  const result = await writeDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false, error: 'User not found.', status: 404 } as const;

    // The business must never be left without an owner who can sign in.
    const isLastAdmin =
      user.role === 'ADMIN' && db.users.filter((u) => u.role === 'ADMIN' && u.active).length === 1;
    if (isLastAdmin && (patch.active === false || (patch.role && patch.role !== 'ADMIN'))) {
      return {
        ok: false,
        error: 'This is the only active owner account. Promote another owner first.',
        status: 409,
      } as const;
    }

    const { password: _password, ...rest } = patch;
    Object.assign(user, rest, { updatedAt: new Date().toISOString() });
    if (passwordHash) user.passwordHash = passwordHash;
    if (rest.email === '') user.email = undefined;

    logAction(db, actor, 'user.update', 'user', id, {
      fields: Object.keys(patch),
      name: user.name,
    });
    return { ok: true, user: toSafeUser(user) } as const;
  });

  if (!result.ok) return fail(result.error, result.status);
  return ok({ user: result.user });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const actor = await requireCapability('user.manage');
  const { id } = await ctx.params;

  const result = await writeDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false, error: 'User not found.', status: 404 } as const;
    if (user.id === actor.id) {
      return { ok: false, error: 'You cannot deactivate your own account.', status: 409 } as const;
    }
    if (user.role === 'ADMIN' && db.users.filter((u) => u.role === 'ADMIN' && u.active).length === 1) {
      return { ok: false, error: 'This is the only active owner account.', status: 409 } as const;
    }
    // Deactivate rather than delete — an SR's invoices and deposits must survive.
    user.active = false;
    user.updatedAt = new Date().toISOString();
    logAction(db, actor, 'user.deactivate', 'user', id, { name: user.name });
    return { ok: true } as const;
  });

  if (!result.ok) return fail(result.error, result.status);
  return ok({ deactivated: true });
});
