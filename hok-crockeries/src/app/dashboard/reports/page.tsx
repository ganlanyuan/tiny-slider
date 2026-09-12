'use client';

import { useState } from 'react';
import {
  BarChart3,
  Download,
  Lock,
  Printer,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  SectionTitle,
  TableSkeleton,
} from '@/components/ui';
import { StatCard } from '@/components/ui/stat';
import { TrendChart } from '@/components/dashboard/charts';
import { MonthPicker } from '@/components/dashboard/month-picker';
import { PageTransition } from '@/components/motion/reveal';
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { qs } from '@/lib/client';
import { EXPENSE_LABEL, type ExpenseCategory } from '@/lib/types';
import { downloadBlob, formatMonth, number as fmtNumber, percent, toCsv } from '@/lib/utils';
import type { TrendPoint } from '@/components/dashboard/charts';

interface ExpenseLine {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  title: string;
}

interface ProductRow {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  qty: number;
  revenue: number;
  inStore: number;
  withSrs: number;
  cost?: number;
  profit?: number;
}

interface SrRow {
  srId: string;
  name: string;
  area?: string;
  active: boolean;
  invoices: number;
  soldValue: number;
  collected: number;
  deposited: number;
  cashInHand: number;
  marketDue: number;
  stockValueInHand: number;
  commission: number;
}

interface ReportsResponse {
  month: string;
  showCost: boolean;
  summary: {
    revenue: number;
    collected: number;
    marketDue: number;
    deposited: number;
    cashWithSrs: number;
    totalExpense: number;
    productExpense: number;
    salaryExpense: number;
    otherExpense: number;
    expenseByCategory: { category: ExpenseCategory; amount: number }[];
    costOfGoodsSold?: number;
    grossProfit?: number;
    netProfit?: number;
    margin?: number;
    stockCostValue?: number;
  };
  trend: TrendPoint[];
  products: ProductRow[];
  srs: SrRow[];
  purchases: { count: number; units: number; value?: number };
  expenses: ExpenseLine[];
  salaries: { id: string; userName: string; month: string; total: number }[];
}

export default function ReportsPage() {
  const { money } = useWorkspace();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const { data, error, initial, reload } = useResource<ReportsResponse>(
    `/api/reports${qs({ month })}`,
  );

  const showCost = data?.showCost ?? false;
  const summary = data?.summary;

  function exportProducts() {
    if (!data) return;
    downloadBlob(
      toCsv(data.products as unknown as Record<string, unknown>[]),
      `hok-product-report-${month}.csv`,
      'text/csv',
    );
    toast.success('Product report exported.');
  }

  function exportSrs() {
    if (!data) return;
    downloadBlob(
      toCsv(data.srs as unknown as Record<string, unknown>[]),
      `hok-sr-report-${month}.csv`,
      'text/csv',
    );
    toast.success('Sales rep report exported.');
  }

  return (
    <PageTransition>
      <SectionTitle
        title="Reports"
        subtitle={`Full picture for ${formatMonth(month)}.`}
        action={
          <div className="no-print flex flex-wrap items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            <Button
              variant="ghost"
              size="sm"
              icon={<Printer size={15} />}
              onClick={() => window.print()}
            >
              Print
            </Button>
          </div>
        }
      />

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial || !data || !summary ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
          <div className="skeleton h-72" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              sublabel="Invoiced this month"
              value={summary.revenue}
              icon={<TrendingUp size={18} strokeWidth={1.7} />}
              tone="brand"
              hint={`${money(summary.collected)} collected`}
            />
            <StatCard
              label="Expenses"
              sublabel="Booked this month"
              value={summary.totalExpense}
              icon={<Wallet size={18} strokeWidth={1.7} />}
              tone="amber"
            />
            <StatCard
              label="Net profit"
              sublabel={showCost ? 'After cost and running expenses' : 'Owner only'}
              value={summary.netProfit ?? 0}
              locked={!showCost}
              icon={<BarChart3 size={18} strokeWidth={1.7} />}
              tone="green"
              hint={showCost ? `Margin ${percent(summary.margin)}` : undefined}
            />
            <StatCard
              label="Outstanding"
              sublabel="Market dues plus rep float"
              value={summary.marketDue + summary.cashWithSrs}
              icon={<Users size={18} strokeWidth={1.7} />}
              tone="rose"
              hint={`${money(summary.marketDue)} in market · ${money(summary.cashWithSrs)} with reps`}
            />
          </div>

          <Card>
            <CardHeader
              title="Twelve-month trend"
              subtitle="Revenue, expense and profit"
              icon={<BarChart3 size={18} strokeWidth={1.7} />}
            />
            <TrendChart data={data.trend} showProfit={showCost} />
          </Card>

          {showCost ? (
            <Card className="border-brand-200/70 bg-gradient-to-br from-brand-50/60 to-transparent dark:border-brand-500/20 dark:from-brand-500/[0.06]">
              <CardHeader
                title="Owner’s profit statement"
                subtitle="Purchase cost is visible to you alone"
                icon={<Lock size={18} strokeWidth={1.7} />}
              />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Figure label="Revenue" value={money(summary.revenue)} />
                <Figure label="Cost of goods sold" value={money(summary.costOfGoodsSold)} />
                <Figure label="Gross profit" value={money(summary.grossProfit)} />
                <Figure label="Net profit" value={money(summary.netProfit)} strong />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Figure label="Product purchases" value={money(summary.productExpense)} />
                <Figure label="Salary & commission" value={money(summary.salaryExpense)} />
                <Figure label="Other running costs" value={money(summary.otherExpense)} />
                <Figure label="Stock at cost" value={money(summary.stockCostValue)} />
              </div>
            </Card>
          ) : null}

          {/* SR performance */}
          <Card className="p-0">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <CardHeader
                title="Sales rep report"
                subtitle="Sold, collected, deposited and still outstanding"
                icon={<Users size={18} strokeWidth={1.7} />}
                className="mb-0"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Download size={14} />}
                onClick={exportSrs}
                className="no-print"
              >
                CSV
              </Button>
            </div>
            {data.srs.length === 0 ? (
              <EmptyState title="No sales reps yet" />
            ) : (
              <div className="table-wrap mt-4 border-0">
                <table className="table min-w-[820px]">
                  <thead>
                    <tr>
                      <th>Sales rep</th>
                      <th className="text-right">Invoices</th>
                      <th className="text-right">Sold</th>
                      <th className="text-right">Collected</th>
                      <th className="text-right">Deposited</th>
                      <th className="text-right">Cash in hand</th>
                      <th className="text-right">Market due</th>
                      <th className="text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.srs.map((sr) => (
                      <tr key={sr.srId} className={sr.active ? '' : 'opacity-55'}>
                        <td>
                          <p className="truncate font-medium">{sr.name}</p>
                          <p className="truncate text-xs muted">{sr.area || 'No area set'}</p>
                        </td>
                        <td className="tabular text-right">{fmtNumber(sr.invoices)}</td>
                        <td className="tabular text-right font-medium">{money(sr.soldValue)}</td>
                        <td className="tabular text-right">{money(sr.collected)}</td>
                        <td className="tabular text-right">{money(sr.deposited)}</td>
                        <td className="tabular text-right">
                          <span className={sr.cashInHand > 0 ? 'text-rose-600 dark:text-rose-400' : ''}>
                            {money(sr.cashInHand)}
                          </span>
                        </td>
                        <td className="tabular text-right muted">{money(sr.marketDue)}</td>
                        <td className="tabular text-right">{money(sr.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* product performance */}
          <Card className="p-0">
            <div className="flex items-center justify-between gap-3 px-5 pt-5">
              <CardHeader
                title="Product report"
                subtitle="What sold, and what is left"
                icon={<ShoppingCart size={18} strokeWidth={1.7} />}
                className="mb-0"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Download size={14} />}
                onClick={exportProducts}
                className="no-print"
              >
                CSV
              </Button>
            </div>
            {data.products.length === 0 ? (
              <EmptyState title="Nothing sold in this month" />
            ) : (
              <div className="table-wrap mt-4 border-0">
                <table className="table min-w-[760px]">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Sold</th>
                      <th className="text-right">Revenue</th>
                      {showCost ? <th className="text-right">Cost</th> : null}
                      {showCost ? <th className="text-right">Profit</th> : null}
                      <th className="text-right">In store</th>
                      <th className="text-right">With reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.products.map((p) => (
                      <tr key={p.productId}>
                        <td>
                          <p className="truncate font-medium">{p.name}</p>
                          <p className="truncate text-xs muted">{p.sku}</p>
                        </td>
                        <td className="tabular text-right">
                          {fmtNumber(p.qty)} {p.unit}
                        </td>
                        <td className="tabular text-right font-medium">{money(p.revenue)}</td>
                        {showCost ? (
                          <td className="tabular text-right muted">{money(p.cost)}</td>
                        ) : null}
                        {showCost ? (
                          <td className="tabular text-right text-emerald-600 dark:text-emerald-400">
                            {money(p.profit)}
                          </td>
                        ) : null}
                        <td className="tabular text-right">{fmtNumber(p.inStore)}</td>
                        <td className="tabular text-right muted">{fmtNumber(p.withSrs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* expense detail */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader title="Expense lines" subtitle={formatMonth(month)} />
              {data.expenses.length === 0 ? (
                <p className="py-6 text-center text-sm muted">Nothing recorded.</p>
              ) : (
                <ul className="divide-y">
                  {data.expenses.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="text-xs muted">{EXPENSE_LABEL[e.category]}</p>
                      </div>
                      <span className="tabular shrink-0 text-sm">{money(e.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <CardHeader title="Payroll & purchases" subtitle={formatMonth(month)} />
              <div className="space-y-1.5 text-sm">
                <Line label="Salary payments" value={String(data.salaries.length)} />
                <Line
                  label="Payroll total"
                  value={money(data.salaries.reduce((n, s) => n + s.total, 0))}
                />
                <Line label="Purchase entries" value={String(data.purchases.count)} />
                <Line label="Units received" value={fmtNumber(data.purchases.units)} />
                {showCost ? (
                  <Line label="Purchase value" value={money(data.purchases.value)} strong />
                ) : (
                  <Line label="Purchase value" value="Owner only" />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageTransition>
  );
}

function Figure({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="surface rounded-xl border p-4">
      <p className="text-xs font-medium uppercase tracking-wide muted">{label}</p>
      <p
        className={`tabular mt-2 font-display font-semibold ${
          strong ? 'text-xl text-emerald-600 dark:text-emerald-400' : 'text-lg'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="muted">{label}</span>
      <span className={`tabular ${strong ? 'font-display font-semibold' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}
