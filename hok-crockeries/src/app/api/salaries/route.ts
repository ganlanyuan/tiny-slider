import { fail, ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { round2, salaryTotal, srAccount } from '@/lib/analytics';
import { salarySchema } from '@/lib/validation';
import type { Expense, SalaryPayment } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  await requireCapability('salary.view');
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';

  const db = await readDb();
  const byId = new Map(db.users.map((u) => [u.id, u]));

  const payments = db.salaries
    .filter((s) => !month || s.month === month)
    .sort((a, b) => b.month.localeCompare(a.month) || b.paidAt.localeCompare(a.paidAt))
    .map((s) => ({
      ...s,
      userName: byId.get(s.userId)?.name ?? 'Removed staff',
      role: byId.get(s.userId)?.role ?? 'SR',
    }));

  // Payroll preview: everyone on the books, what they are owed this month, and
  // whether it has already gone out.
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const paidThisMonth = new Set(
    db.salaries.filter((s) => s.month === targetMonth).map((s) => s.userId),
  );
  const roster = db.users
    .filter((u) => u.active && (u.role === 'SR' || u.role === 'MANAGER'))
    .map((u) => {
      const account = u.role === 'SR' ? srAccount(db, u.id, targetMonth) : null;
      const soldValue = account?.soldValue ?? 0;
      return {
        userId: u.id,
        name: u.name,
        role: u.role,
        area: u.area,
        base: u.monthlySalary,
        commissionRate: u.commissionRate,
        soldValue,
        suggestedCommission: round2((soldValue * u.commissionRate) / 100),
        paid: paidThisMonth.has(u.id),
      };
    });

  return ok({
    payments,
    roster,
    month: targetMonth,
    total: round2(payments.reduce((n, p) => n + p.total, 0)),
  });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('salary.manage');
  const input = salarySchema.parse(await parseJson(request));

  const result = await writeDb((db) => {
    const staff = db.users.find((u) => u.id === input.userId);
    if (!staff) return { ok: false, error: 'That staff member does not exist.' } as const;
    if (db.salaries.some((s) => s.userId === input.userId && s.month === input.month)) {
      return {
        ok: false,
        error: `${staff.name} has already been paid for ${input.month}.`,
      } as const;
    }

    const total = salaryTotal(input);
    if (total <= 0) return { ok: false, error: 'The net payable must be greater than zero.' } as const;

    const now = new Date().toISOString();
    const payment: SalaryPayment = {
      id: newId('sal'),
      userId: input.userId,
      month: input.month,
      base: input.base,
      commission: input.commission,
      bonus: input.bonus,
      deduction: input.deduction,
      total,
      paidAt: input.paidAt ?? now,
      method: input.method,
      note: input.note,
      paidBy: user.id,
      createdAt: now,
    };
    db.salaries.push(payment);

    // Payroll hits the books the moment it is paid.
    const expense: Expense = {
      id: newId('exp'),
      date: payment.paidAt,
      category: 'SALARY',
      amount: total,
      title: `Salary — ${staff.name} (${input.month})`,
      note: input.note,
      refType: 'SALARY',
      refId: payment.id,
      createdBy: user.id,
      createdAt: now,
    };
    db.expenses.push(expense);

    logAction(db, user, 'salary.pay', 'salary', payment.id, {
      staff: staff.name,
      month: payment.month,
      total,
    });
    return { ok: true, payment } as const;
  });

  if (!result.ok) return fail(result.error, 409);
  return ok({ payment: result.payment }, { status: 201 });
});
