import { and, desc, eq, sql } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { hashPassword, requireCapability, toSafeUser } from '@/lib/auth';
import { deposits, sales, users } from '@/db/schema';
import { srAccount } from '@/db/queries/accounts';
import { srHoldings } from '@/db/queries/stock';
import { logAction } from '@/lib/audit';
import { round2 } from '@/lib/money';
import { userUpdateSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId } = await requireCapability('user.view');
  const { id } = await ctx.params;

  const [row] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.orgId, orgId)))
    .limit(1);
  if (!row) return fail('Team member not found.', 404);

  const isSr = row.role === 'SR';
  const [account, holdings, recentSales, recentDeposits] = await Promise.all([
    isSr ? srAccount(db, orgId, id) : Promise.resolve(null),
    isSr ? srHoldings(db, orgId, id) : Promise.resolve([]),
    db
      .select({
        id: sales.id,
        invoiceNo: sales.invoiceNo,
        date: sales.date,
        shopName: sales.shopName,
        total: sales.total,
        paid: sales.paid,
        status: sales.status,
      })
      .from(sales)
      .where(and(eq(sales.orgId, orgId), eq(sales.srId, id)))
      .orderBy(desc(sales.date))
      .limit(10),
    db
      .select({
        id: deposits.id,
        amount: deposits.amount,
        date: deposits.date,
        method: deposits.method,
        reference: deposits.reference,
      })
      .from(deposits)
      .where(and(eq(deposits.orgId, orgId), eq(deposits.srId, id)))
      .orderBy(desc(deposits.date))
      .limit(10),
  ]);

  return ok({
    user: toSafeUser(row),
    account: account ?? null,
    holdings,
    recentSales: recentSales.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      due: round2(s.total - s.paid),
    })),
    recentDeposits: recentDeposits.map((d) => ({ ...d, date: d.date.toISOString() })),
  });
});

export const PATCH = route(async (request: Request, ctx: Ctx) => {
  const { db, orgId, user: actor } = await requireCapability('user.manage');
  const { id } = await ctx.params;
  const patch = userUpdateSchema.parse(await parseJson(request));

  const [target] = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), eq(users.orgId, orgId)))
    .limit(1);
  if (!target) return fail('Team member not found.', 404);

  // The workspace must never be left without an owner who can sign in.
  if (target.role === 'ADMIN' && (patch.active === false || (patch.role && patch.role !== 'ADMIN'))) {
    const [{ owners }] = await db
      .select({ owners: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(users)
      .where(and(eq(users.orgId, orgId), eq(users.role, 'ADMIN'), eq(users.active, true)));
    if (owners <= 1) {
      return fail('This is the only active owner account. Promote another owner first.', 409);
    }
  }

  const { password, ...rest } = patch;
  const [updated] = await db
    .update(users)
    .set({
      ...rest,
      ...(password ? { passwordHash: await hashPassword(password) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  await logAction(db, actor, 'user.update', 'user', id, {
    fields: Object.keys(patch),
    name: updated.name,
  });
  return ok({ user: toSafeUser(updated) });
});

export const DELETE = route(async (_request: Request, ctx: Ctx) => {
  const { db, orgId, user: actor } = await requireCapability('user.manage');
  const { id } = await ctx.params;

  if (id === actor.id) return fail('You cannot deactivate your own account.', 409);

  const [target] = await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .where(and(eq(users.id, id), eq(users.orgId, orgId)))
    .limit(1);
  if (!target) return fail('Team member not found.', 404);

  if (target.role === 'ADMIN') {
    const [{ owners }] = await db
      .select({ owners: sql<number>`COUNT(*)`.mapWith(Number) })
      .from(users)
      .where(and(eq(users.orgId, orgId), eq(users.role, 'ADMIN'), eq(users.active, true)));
    if (owners <= 1) return fail('This is the only active owner account.', 409);
  }

  // Deactivate rather than delete — a rep's invoices and deposits must survive.
  await db.update(users).set({ active: false, updatedAt: new Date() }).where(eq(users.id, id));
  await logAction(db, actor, 'user.deactivate', 'user', id, { name: target.name });
  return ok({ deactivated: true });
});
