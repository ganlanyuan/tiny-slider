import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { newId, readDb, writeDb } from '@/lib/db';
import { logAction } from '@/lib/audit';
import { round2 } from '@/lib/analytics';
import { can } from '@/lib/permissions';
import { expenseSchema } from '@/lib/validation';
import type { Expense, ExpenseCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const user = await requireCapability('expense.view');
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const category = url.searchParams.get('category') ?? '';
  const showCost = can(user.role, 'cost.view');

  const db = await readDb();
  const expenses = db.expenses
    // A product-purchase line is the supplier invoice total, so it reveals the
    // owner's buying price. Only the owner sees those rows.
    .filter((e) => showCost || e.category !== 'PRODUCT')
    .filter((e) => (!month || e.date.startsWith(month)) && (!category || e.category === category))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);

  return ok({
    expenses,
    showCost,
    total: round2(expenses.reduce((n, e) => n + e.amount, 0)),
    byCategory: [...byCategory.entries()]
      .map(([c, amount]) => ({ category: c, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount),
  });
});

export const POST = route(async (request: Request) => {
  const user = await requireCapability('expense.manage');
  const input = expenseSchema.parse(await parseJson(request));

  const expense = await writeDb((db) => {
    const row: Expense = {
      id: newId('exp'),
      ...input,
      refType: 'MANUAL',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    };
    db.expenses.push(row);
    logAction(db, user, 'expense.create', 'expense', row.id, {
      category: row.category,
      amount: row.amount,
    });
    return row;
  });

  return ok({ expense }, { status: 201 });
});
