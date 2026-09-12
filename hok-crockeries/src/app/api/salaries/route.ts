import { and, desc, eq, inArray, or } from 'drizzle-orm';

import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import type { Database } from '@/db/client';
import { expenses, salaryPayments, users } from '@/db/schema';
import { srAccounts } from '@/db/queries/accounts';
import { withTransaction } from '@/db/tx';
import { logAction } from '@/lib/audit';
import { commissionOn, currentMonth, isValidMonth, round2, salaryTotal, toBusinessDate } from '@/lib/money';
import { salarySchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId } = await requireCapability('salary.view');
  const requested = new URL(request.url).searchParams.get('month');
  const month = isValidMonth(requested) ? requested : currentMonth();

  const [payments, staff, accounts] = await Promise.all([
    db
      .select({
        id: salaryPayments.id,
        userId: salaryPayments.userId,
        userName: users.name,
        role: users.role,
        month: salaryPayments.month,
        base: salaryPayments.base,
        commission: salaryPayments.commission,
        bonus: salaryPayments.bonus,
        deduction: salaryPayments.deduction,
        total: salaryPayments.total,
        paidAt: salaryPayments.paidAt,
        method: salaryPayments.method,
        note: salaryPayments.note,
      })
      .from(salaryPayments)
      .innerJoin(users, eq(users.id, salaryPayments.userId))
      .where(and(eq(salaryPayments.orgId, orgId), eq(salaryPayments.month, month)))
      .orderBy(desc(salaryPayments.paidAt)),
    db
      .select()
      .from(users)
      .where(
        and(
          eq(users.orgId, orgId),
          eq(users.active, true),
          or(eq(users.role, 'SR'), eq(users.role, 'MANAGER'))!,
        ),
      ),
    srAccounts(db, orgId, { month }),
  ]);

  const soldBySr = new Map(accounts.map((a) => [a.srId, a.soldValue]));
  const paidIds = new Set(payments.map((p) => p.userId));

  // Payroll preview: who is owed what this month, and whether it has gone out.
  const roster = staff
    .map((u) => {
      const soldValue = soldBySr.get(u.id) ?? 0;
      return {
        userId: u.id,
        name: u.name,
        role: u.role,
        area: u.area,
        base: u.monthlySalary,
        commissionRate: u.commissionRate,
        soldValue,
        suggestedCommission: commissionOn(soldValue, u.commissionRate),
        paid: paidIds.has(u.id),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return ok({
    month,
    payments: payments.map((p) => ({ ...p, paidAt: p.paidAt.toISOString() })),
    roster,
    total: round2(payments.reduce((n, p) => n + p.total, 0)),
    budget: round2(roster.reduce((n, r) => n + r.base + r.suggestedCommission, 0)),
  });
});

/**
 * Pay one person for one month.
 *
 * The payment and the expense line it creates share a transaction, and a unique
 * index on (user, month) makes a double payment impossible even if two managers
 * click at the same moment.
 */
export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('salary.manage');
  const input = salarySchema.parse(await parseJson(request));

  const [staff] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(and(eq(users.id, input.userId), eq(users.orgId, orgId)))
    .limit(1);
  if (!staff) return fail('That staff member does not exist.', 422);

  const total = salaryTotal(input);
  if (total <= 0) return fail('The net payable must be greater than zero.', 422);

  const paidAt = input.paidAt ? toBusinessDate(input.paidAt) : new Date();

  const payment = await withTransaction(db, async (tx) => {
    const database = tx as Database;
    const [created] = await database
      .insert(salaryPayments)
      .values({
        orgId,
        userId: input.userId,
        month: input.month,
        base: input.base,
        commission: input.commission,
        bonus: input.bonus,
        deduction: input.deduction,
        total,
        paidAt,
        method: input.method,
        note: input.note,
        paidBy: user.id,
      })
      .returning();

    await database.insert(expenses).values({
      orgId,
      date: paidAt,
      category: 'SALARY',
      amount: total,
      title: `Salary — ${staff.name} (${input.month})`,
      note: input.note,
      refType: 'SALARY',
      refId: created.id,
      createdBy: user.id,
    });

    return created;
  });

  await logAction(db, user, 'salary.pay', 'salary', payment.id, {
    staff: staff.name,
    month: payment.month,
    total,
  });

  return ok({ payment: { ...payment, paidAt: payment.paidAt.toISOString() } }, { status: 201 });
});
