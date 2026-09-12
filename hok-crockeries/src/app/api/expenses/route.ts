import { and, desc, eq, ne, sql } from 'drizzle-orm';

import { ok, parseJson, route } from '@/lib/api';
import { requireCapability } from '@/lib/auth';
import { expenses } from '@/db/schema';
import { logAction } from '@/lib/audit';
import { round2, toBusinessDate } from '@/lib/money';
import { expenseSchema } from '@/lib/validation';
import type { ExpenseCategory } from '@/lib/types';

export const dynamic = 'force-dynamic';

export const GET = route(async (request: Request) => {
  const { db, orgId, showCost } = await requireCapability('expense.view');
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? '';
  const category = url.searchParams.get('category') ?? '';

  const filters = [eq(expenses.orgId, orgId)];
  // A product-purchase line is a supplier invoice total, so it reveals the
  // owner's buying price in aggregate. Only the owner sees those rows.
  if (!showCost) filters.push(ne(expenses.category, 'PRODUCT'));
  if (category) filters.push(eq(expenses.category, category as ExpenseCategory));
  const monthFilter = month
    ? sql`AND to_char(${expenses.date} AT TIME ZONE 'UTC', 'YYYY-MM') = ${month}`
    : sql``;

  const rows = await db
    .select()
    .from(expenses)
    .where(sql`${and(...filters)} ${monthFilter}`)
    .orderBy(desc(expenses.date), desc(expenses.createdAt))
    .limit(500);

  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of rows) {
    byCategory.set(e.category, round2((byCategory.get(e.category) ?? 0) + e.amount));
  }

  return ok({
    showCost,
    expenses: rows.map((e) => ({ ...e, date: e.date.toISOString() })),
    total: round2(rows.reduce((n, e) => n + e.amount, 0)),
    byCategory: [...byCategory.entries()]
      .map(([c, amount]) => ({ category: c, amount }))
      .sort((a, b) => b.amount - a.amount),
  });
});

export const POST = route(async (request: Request) => {
  const { db, orgId, user } = await requireCapability('expense.manage');
  const input = expenseSchema.parse(await parseJson(request));

  const [created] = await db
    .insert(expenses)
    .values({
      orgId,
      date: toBusinessDate(input.date),
      category: input.category,
      amount: input.amount,
      title: input.title,
      note: input.note,
      refType: 'MANUAL',
      createdBy: user.id,
    })
    .returning();

  await logAction(db, user, 'expense.create', 'expense', created.id, {
    category: created.category,
    amount: created.amount,
  });

  return ok({ expense: { ...created, date: created.date.toISOString() } }, { status: 201 });
});
