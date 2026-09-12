'use client';

import { useState } from 'react';
import { Info, Lock, Plus, Receipt, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  SectionTitle,
  Select,
  TableSkeleton,
  Textarea,
} from '@/components/ui';
import { MeterRow } from '@/components/ui/stat';
import { MonthPicker } from '@/components/dashboard/month-picker';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { apiDelete, apiPost, qs } from '@/lib/client';
import { EXPENSE_CATEGORIES, EXPENSE_LABEL, type Expense, type ExpenseCategory } from '@/lib/types';
import { formatDate, money, todayIso } from '@/lib/utils';

interface ExpensesResponse {
  expenses: Expense[];
  showCost: boolean;
  total: number;
  byCategory: { category: ExpenseCategory; amount: number }[];
}

interface MeResponse {
  capabilities: string[];
}

const TONES: Record<string, 'brand' | 'violet' | 'amber' | 'green' | 'rose' | 'slate'> = {
  PRODUCT: 'brand',
  SALARY: 'violet',
  COMMISSION: 'violet',
  TRANSPORT: 'amber',
  RENT: 'rose',
  UTILITY: 'green',
  MARKETING: 'brand',
  MAINTENANCE: 'slate',
  OTHER: 'slate',
};

export default function ExpensesPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState('');
  const [creating, setCreating] = useState(false);

  const me = useResource<MeResponse>('/api/auth/me');
  const canManage = me.data?.capabilities.includes('expense.manage') ?? false;

  const { data, error, initial, reload } = useResource<ExpensesResponse>(
    `/api/expenses${qs({ month, category })}`,
  );

  const expenses = data?.expenses ?? [];
  const total = data?.total ?? 0;
  const showCost = data?.showCost ?? false;

  async function remove(expense: Expense) {
    try {
      await apiDelete(`/api/expenses/${expense.id}`);
      toast.success('Expense removed.');
      void reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove the expense.');
    }
  }

  return (
    <PageTransition>
      <SectionTitle
        title="খরচের হিসাব"
        subtitle="Everything the business spent, month by month."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            {canManage ? (
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                Add expense
              </Button>
            ) : null}
          </div>
        }
      />

      {!showCost ? (
        <p className="mb-5 flex items-start gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
          <Lock size={15} className="mt-0.5 shrink-0" />
          Product-purchase lines are hidden from this view because they reveal the owner’s buying
          price. The totals below cover running costs only.
        </p>
      ) : null}

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-0">
          {error ? (
            <ErrorState message={error} onRetry={() => void reload()} />
          ) : initial ? (
            <TableSkeleton rows={6} cols={4} />
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={<Receipt size={22} strokeWidth={1.5} />}
              title="Nothing recorded this month"
              description="Transport, rent, utilities, marketing — log them here and they land in the overview."
              action={
                canManage ? (
                  <Button icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                    Add expense
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="table-wrap border-0">
              <table className="table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Expense</th>
                    <th>Category</th>
                    <th className="text-right">Amount</th>
                    {canManage ? <th className="w-12" /> : null}
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id}>
                      <td className="whitespace-nowrap">{formatDate(e.date)}</td>
                      <td>
                        <p className="truncate font-medium">{e.title}</p>
                        {e.note ? <p className="truncate text-xs muted">{e.note}</p> : null}
                      </td>
                      <td>
                        <Badge tone={TONES[e.category] ?? 'slate'}>
                          {EXPENSE_LABEL[e.category].en}
                        </Badge>
                      </td>
                      <td className="tabular text-right font-medium">{money(e.amount)}</td>
                      {canManage ? (
                        <td>
                          {e.refType === 'MANUAL' ? (
                            <button
                              type="button"
                              onClick={() => remove(e)}
                              aria-label={`Delete ${e.title}`}
                              className="rounded-lg p-1.5 muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : (
                            <span title="Created by a purchase or salary payment">
                              <Info size={14} className="muted" />
                            </span>
                          )}
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="This month"
              subtitle="Total spend"
              icon={<Receipt size={18} strokeWidth={1.7} />}
            />
            <p className="tabular font-display text-3xl font-semibold">{money(total)}</p>
            <div className="mt-5 space-y-3">
              {(data?.byCategory ?? []).map((c) => (
                <MeterRow
                  key={c.category}
                  label={EXPENSE_LABEL[c.category].en}
                  value={c.amount}
                  total={total}
                  tone={TONES[c.category] === 'slate' ? 'slate' : TONES[c.category]}
                />
              ))}
              {(data?.byCategory ?? []).length === 0 ? (
                <p className="text-sm muted">No spend recorded yet.</p>
              ) : null}
            </div>
          </Card>

          <Card className="p-4">
            <Select
              label="Filter by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {EXPENSE_CATEGORIES.filter((c) => showCost || c !== 'PRODUCT').map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_LABEL[c].en} — {EXPENSE_LABEL[c].bn}
                </option>
              ))}
            </Select>
          </Card>
        </div>
      </div>

      {canManage ? (
        <ExpenseModal
          open={creating}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            void reload();
          }}
        />
      ) : null}
    </PageTransition>
  );
}

function ExpenseModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('TRANSPORT');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayIso());
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/expenses', {
        title,
        category,
        amount,
        date,
        note: note || undefined,
      });
      toast.success(`${money(amount)} recorded.`);
      setTitle('');
      setAmount(0);
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the expense.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add an expense"
      subtitle="আনুষঙ্গিক খরচ"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!title || amount <= 0}>
            Save expense
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="What was it for?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Truck fare from Dhaka"
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            {EXPENSE_CATEGORIES.filter((c) => c !== 'PRODUCT' && c !== 'SALARY').map((c) => (
              <option key={c} value={c}>
                {EXPENSE_LABEL[c].en} — {EXPENSE_LABEL[c].bn}
              </option>
            ))}
          </Select>
          <Input
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
          />
        </div>
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="text-xs muted">
          Product purchases and salaries are booked automatically from their own entries, so they
          are not offered here.
        </p>
      </div>
    </Modal>
  );
}
