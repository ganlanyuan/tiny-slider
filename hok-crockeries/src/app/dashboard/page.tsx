'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Banknote,
  Boxes,
  ClipboardList,
  Coins,
  HandCoins,
  Lock,
  PackageCheck,
  Percent,
  PiggyBank,
  Receipt,
  ShoppingCart,
  Store,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Warehouse,
} from 'lucide-react';

import { Card, CardHeader, EmptyState, ErrorState, SectionTitle } from '@/components/ui';
import { MeterRow, StatCard } from '@/components/ui/stat';
import { ExpenseDonut, SrBarChart, TrendChart } from '@/components/dashboard/charts';
import { MonthPicker } from '@/components/dashboard/month-picker';
import { SetupChecklist } from '@/components/dashboard/setup-checklist';
import { PageTransition } from '@/components/motion/reveal';
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { currentMonth } from '@/lib/money';
import { EXPENSE_LABEL } from '@/lib/types';
import { formatMonth, number as fmtNumber, relativeTime } from '@/lib/utils';
import type { DealerOverview, OfficeOverview, Overview, SrOverview } from './types';

export default function OverviewPage() {
  const { user } = useWorkspace();
  const [month, setMonth] = useState(currentMonth());
  const { data, error, initial, reload } = useResource<Overview>(`/api/overview?month=${month}`);

  const greeting = user.name.split(' ')[0];

  return (
    <PageTransition>
      <SectionTitle
        title={`Hello, ${greeting}`}
        subtitle={`Everything that moved in ${formatMonth(month)}.`}
        action={<MonthPicker value={month} onChange={setMonth} />}
      />

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial || !data ? (
        <DashboardSkeleton />
      ) : data.role === 'SR' ? (
        <SrDashboard data={data} month={month} />
      ) : data.role === 'DEALER' ? (
        <DealerDashboard data={data} />
      ) : (
        <OfficeDashboard data={data} />
      )}
    </PageTransition>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="skeleton h-80 lg:col-span-2" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------- owner / manager */

function OfficeDashboard({ data }: { data: OfficeOverview }) {
  const { money, moneyShort } = useWorkspace();
  const { finance, stock, staff, showCost } = data;
  const isOwner = data.role === 'ADMIN';

  return (
    <div className="space-y-5">
      <SetupChecklist setup={data.setup} />

      {/* headline money */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue this month"
          sublabel="Invoiced this month"
          value={finance.revenue}
          icon={<TrendingUp size={18} strokeWidth={1.7} />}
          tone="brand"
          hint={`${money(finance.collected)} collected · ${money(finance.marketDue)} still due`}
        />
        <StatCard
          label={showCost ? 'Total expense' : 'Running costs'}
          sublabel={showCost ? 'Booked this month' : 'Excludes product purchases'}
          value={finance.totalExpense}
          icon={<Receipt size={18} strokeWidth={1.7} />}
          tone="amber"
          hint={
            showCost
              ? `${money(finance.productExpense)} on products · ${money(finance.salaryExpense)} on staff`
              : `${money(finance.salaryExpense)} on staff · product purchases are owner-only`
          }
        />
        <StatCard
          label={isOwner ? 'Net profit' : 'Net profit'}
          sublabel={isOwner ? 'After cost and running expenses' : 'Owner only'}
          value={finance.netProfit ?? 0}
          locked={!showCost}
          icon={<PiggyBank size={18} strokeWidth={1.7} />}
          tone="green"
          hint={showCost ? `Gross ${money(finance.grossProfit)} · margin ${finance.margin?.toFixed(1)}%` : undefined}
        />
        <StatCard
          label="Cash with SRs"
          sublabel="Collected but not yet deposited"
          value={finance.cashWithSrs}
          icon={<Wallet size={18} strokeWidth={1.7} />}
          tone={finance.cashWithSrs > 0 ? 'rose' : 'slate'}
          hint={`${money(finance.deposited)} deposited this month`}
        />
      </div>

      {/* stock line */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Units in store"
          sublabel="Available to hand out"
          value={stock.unitsInStore}
          kind="count"
          icon={<Warehouse size={18} strokeWidth={1.7} />}
          tone="violet"
          compact
          hint={`${fmtNumber(stock.unitsReceived)} received all-time`}
        />
        <StatCard
          label="Units with SRs"
          sublabel="Loaded in rep vans"
          value={stock.unitsWithSrs}
          kind="count"
          icon={<Truck size={18} strokeWidth={1.7} />}
          tone="brand"
          compact
          hint={`${fmtNumber(stock.unitsSold)} sold all-time`}
        />
        <StatCard
          label="Stock value"
          sublabel={showCost ? 'at SR rate · cost shown below' : 'at SR rate'}
          value={stock.valueAtSrRate}
          kind="short"
          icon={<Boxes size={18} strokeWidth={1.7} />}
          tone="green"
          compact
          hint={
            showCost && data.allTime.stockCostValue !== undefined
              ? `Cost value ${moneyShort(data.allTime.stockCostValue)}`
              : `${stock.skus} active products`
          }
        />
        <StatCard
          label="Needs attention"
          sublabel="Low or out of stock"
          value={stock.lowStock + stock.outOfStock}
          kind="count"
          icon={<AlertTriangle size={18} strokeWidth={1.7} />}
          tone={stock.lowStock + stock.outOfStock > 0 ? 'rose' : 'slate'}
          compact
          hint={`${stock.lowStock} low · ${stock.outOfStock} out of stock`}
        />
      </div>

      {/* trend + expense split */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue & expense"
            subtitle="Last six months"
            icon={<Activity size={18} strokeWidth={1.7} />}
          />
          <TrendChart data={data.trend} showProfit={showCost} />
        </Card>

        <Card>
          <CardHeader
            title="Where the money went"
            subtitle={showCost ? formatMonth(data.month) : `Running costs · ${formatMonth(data.month)}`}
            icon={<Coins size={18} strokeWidth={1.7} />}
          />
          <ExpenseDonut
            data={finance.expenseByCategory.map((e) => ({
              name: EXPENSE_LABEL[e.category],
              value: e.amount,
            }))}
          />
          <div className="mt-4 space-y-3 border-t pt-4">
            {/* A zero "product purchase" row would read as "nothing was spent",
                when in fact the figure is simply not this viewer's to see. */}
            {showCost ? (
              <MeterRow
                label="Product purchase"
                value={finance.productExpense}
                total={finance.totalExpense}
                tone="brand"
              />
            ) : null}
            <MeterRow
              label="Staff & commission"
              value={finance.salaryExpense}
              total={finance.totalExpense}
              tone="violet"
            />
            <MeterRow
              label="Other running costs"
              value={finance.otherExpense}
              total={finance.totalExpense}
              tone="amber"
            />
            {!showCost ? (
              <p className="pt-1 text-xs muted">
                Product purchases are excluded — only the owner can see what stock costs.
              </p>
            ) : null}
          </div>
        </Card>
      </div>

      {/* owner-only profit block */}
      {showCost ? (
        <Card className="border-brand-200/70 bg-gradient-to-br from-brand-50/60 to-transparent dark:border-brand-500/20 dark:from-brand-500/[0.06]">
          <CardHeader
            title="Owner’s figures"
            subtitle="Purchase cost and profit — visible to you alone"
            icon={<Lock size={18} strokeWidth={1.7} />}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MiniStat
              label="Cost of goods sold"
              value={money(finance.costOfGoodsSold)}
              caption="What the sold stock cost you"
            />
            <MiniStat
              label="Gross profit"
              value={money(finance.grossProfit)}
              caption="Revenue minus purchase cost"
            />
            <MiniStat
              label="Net profit"
              value={money(finance.netProfit)}
              caption="After salaries and running costs"
            />
            <MiniStat
              label="Margin"
              value={`${(finance.margin ?? 0).toFixed(1)}%`}
              caption="Gross margin on sales"
              icon={<Percent size={14} />}
            />
          </div>
        </Card>
      ) : null}

      {/* SR board */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Sales rep performance"
            subtitle={`${data.srBoard.length} active reps · ${formatMonth(data.month)}`}
            icon={<Users size={18} strokeWidth={1.7} />}
            action={
              <Link href="/dashboard/team" className="text-sm font-medium text-brand-600 hover:underline">
                Team <ArrowRight size={13} className="inline" />
              </Link>
            }
          />
          {data.srBoard.length === 0 ? (
            <EmptyState
              icon={<Users size={22} strokeWidth={1.5} />}
              title="No sales reps yet"
              description="Invite a rep, load their van with a challan, and their performance shows up here."
              action={
                <Link href="/dashboard/team" className="btn-ghost text-sm">
                  Invite a rep
                </Link>
              }
            />
          ) : (
            <SrBarChart
              data={data.srBoard.slice(0, 6).map((s) => ({
                name: s.name.split(' ')[0],
                soldValue: s.soldValue,
                collected: s.collected,
              }))}
            />
          )}
          {data.srBoard.length > 0 ? (
            <div className="table-wrap mt-4">
              <table className="table">
                <thead>
                  <tr>
                    <th>SR</th>
                    <th className="text-right">Sold</th>
                    <th className="text-right">Deposited</th>
                    <th className="text-right">Cash in hand</th>
                    <th className="text-right">Stock held</th>
                  </tr>
                </thead>
                <tbody>
                  {data.srBoard.map((sr) => (
                    <tr key={sr.srId}>
                      <td>
                        <Link
                          href={`/dashboard/team/${sr.srId}`}
                          className="font-medium hover:text-brand-600"
                        >
                          {sr.name}
                        </Link>
                        <p className="text-xs muted">{sr.area || 'No area set'}</p>
                      </td>
                      <td className="tabular text-right">{money(sr.soldValue)}</td>
                      <td className="tabular text-right">{money(sr.deposited)}</td>
                      <td
                        className={`tabular text-right font-medium ${
                          sr.cashInHand > 0 ? 'text-rose-600 dark:text-rose-400' : ''
                        }`}
                      >
                        {money(sr.cashInHand)}
                      </td>
                      <td className="tabular text-right">
                        {fmtNumber(sr.unitsInHand)}
                        <span className="ml-1 text-xs muted">{moneyShort(sr.stockValueInHand)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader
              title="Operations"
              subtitle="This month"
              icon={<PackageCheck size={18} strokeWidth={1.7} />}
            />
            <ul className="space-y-3 text-sm">
              <OpRow
                icon={<ShoppingCart size={15} />}
                label="Delivered"
                value={data.deliveries.delivered}
                href="/dashboard/sales?status=DELIVERED"
              />
              <OpRow
                icon={<Truck size={15} />}
                label="Pending delivery"
                value={data.deliveries.pending}
                tone={data.deliveries.pending > 0 ? 'amber' : undefined}
                href="/dashboard/sales?status=PENDING"
              />
              <OpRow
                icon={<ClipboardList size={15} />}
                label="Open demand"
                value={data.demands.pending}
                tone={data.demands.pending > 0 ? 'brand' : undefined}
                href="/dashboard/demands"
              />
              <OpRow
                icon={<AlertTriangle size={15} />}
                label="Demand you can’t fill"
                value={data.demands.unfillable}
                tone={data.demands.unfillable > 0 ? 'rose' : undefined}
                href="/dashboard/demands"
              />
              <OpRow
                icon={<Banknote size={15} />}
                label="Payroll paid"
                value={money(staff.paidThisMonth)}
                caption={`Budget ${money(staff.salaryBudget)}`}
                href="/dashboard/salary"
              />
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Low stock"
              subtitle="Reorder before the demand arrives"
              icon={<Store size={18} strokeWidth={1.7} />}
            />
            {data.lowStockItems.length === 0 ? (
              <p className="py-6 text-center text-sm muted">Every product is above its threshold.</p>
            ) : (
              <ul className="divide-y">
                {data.lowStockItems.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate">{p.name}</span>
                    <span
                      className={`tabular shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.inStore <= 0
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                      }`}
                    >
                      {p.inStore} {p.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      {/* movers + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Top movers"
            subtitle={formatMonth(data.month)}
            icon={<TrendingUp size={18} strokeWidth={1.7} />}
          />
          {data.topProducts.length === 0 ? (
            <EmptyState title="No sales yet this month" />
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-semibold muted dark:bg-white/5">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs muted">{fmtNumber(p.qty)} units sold</p>
                  </div>
                  <span className="tabular shrink-0 text-sm font-medium">{money(p.value)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Recent activity"
            subtitle="Who changed what"
            icon={<Activity size={18} strokeWidth={1.7} />}
          />
          {data.activity.length === 0 ? (
            <EmptyState title="Nothing recorded yet" />
          ) : (
            <ul className="space-y-3">
              {data.activity.map((log) => (
                <li key={log.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">
                      <span className="font-medium">{log.userName}</span>{' '}
                      <span className="muted">{log.action.replace(/\./g, ' ')}</span>
                    </p>
                    <p className="text-xs muted">{relativeTime(log.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface rounded-xl border p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide muted">
        {icon}
        {label}
      </p>
      <p className="tabular mt-2 font-display text-xl font-semibold">{value}</p>
      <p className="mt-1 text-xs muted">{caption}</p>
    </div>
  );
}

function OpRow({
  icon,
  label,
  value,
  caption,
  tone,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  caption?: string;
  tone?: 'brand' | 'amber' | 'rose';
  href?: string;
}) {
  const toneClass =
    tone === 'rose'
      ? 'text-rose-600 dark:text-rose-400'
      : tone === 'amber'
        ? 'text-amber-600 dark:text-amber-400'
        : tone === 'brand'
          ? 'text-brand-600 dark:text-brand-400'
          : '';

  const body = (
    <>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 muted dark:bg-white/5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{label}</span>
        {caption ? <span className="block text-xs muted">{caption}</span> : null}
      </span>
      <span className={`tabular shrink-0 font-semibold ${toneClass}`}>{value}</span>
    </>
  );

  return (
    <li>
      {href ? (
        <Link href={href} className="flex items-center gap-3 rounded-lg transition hover:opacity-80">
          {body}
        </Link>
      ) : (
        <span className="flex items-center gap-3">{body}</span>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------- SR */

const EMPTY_SR_ACCOUNT = {
  soldValue: 0,
  collected: 0,
  marketDue: 0,
  deposited: 0,
  cashInHand: 0,
  invoices: 0,
  unitsInHand: 0,
  stockValueInHand: 0,
};

function SrDashboard({ data, month }: { data: SrOverview; month: string }) {
  const { money } = useWorkspace();
  // A rep who has not traded yet has no account row at all — show zeros
  // rather than blank tiles.
  const account = data.account ?? EMPTY_SR_ACCOUNT;
  const lifetime = data.lifetime ?? EMPTY_SR_ACCOUNT;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sold this month"
          sublabel="Your invoices this month"
          value={account.soldValue}
          icon={<ShoppingCart size={18} strokeWidth={1.7} />}
          tone="brand"
          hint={`${account.invoices} invoices`}
        />
        <StatCard
          label="Cash you collected"
          sublabel="Taken from shops"
          value={account.collected}
          icon={<HandCoins size={18} strokeWidth={1.7} />}
          tone="green"
          hint={`${money(account.marketDue)} still owed by shops`}
        />
        <StatCard
          label="Deposited to office"
          sublabel="Handed to the office"
          value={account.deposited}
          icon={<Banknote size={18} strokeWidth={1.7} />}
          tone="violet"
        />
        <StatCard
          label="Cash still with you"
          sublabel="Still to deposit"
          value={lifetime.cashInHand}
          icon={<Wallet size={18} strokeWidth={1.7} />}
          tone={lifetime.cashInHand > 0 ? 'rose' : 'slate'}
          hint="Collected minus deposited, all time"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader
            title="Stock in your van"
            subtitle="What you are carrying now"
            icon={<Truck size={18} strokeWidth={1.7} />}
          />
          <p className="tabular font-display text-3xl font-semibold">
            {fmtNumber(lifetime.unitsInHand)}
            <span className="ml-2 text-sm font-medium muted">units</span>
          </p>
          <p className="mt-1 text-sm muted">
            Worth {money(lifetime.stockValueInHand)} at your selling rate.
          </p>
          <Link
            href="/dashboard/demands"
            className="btn-ghost mt-4 w-full justify-center text-sm"
          >
            <ClipboardList size={15} /> Raise a demand
          </Link>
        </Card>

        <Card>
          <CardHeader
            title="Deliveries"
            subtitle={formatMonth(month)}
            icon={<PackageCheck size={18} strokeWidth={1.7} />}
          />
          <ul className="space-y-3 text-sm">
            <OpRow icon={<PackageCheck size={15} />} label="Delivered" value={data.sales.delivered} />
            <OpRow
              icon={<Truck size={15} />}
              label="Pending"
              value={data.sales.pending}
              tone={data.sales.pending > 0 ? 'amber' : undefined}
            />
            <OpRow
              icon={<ClipboardList size={15} />}
              label="Demand waiting"
              value={data.demands.pending}
              caption={`${data.demands.approved} approved`}
            />
          </ul>
          <Link href="/dashboard/sales" className="btn-primary mt-4 w-full justify-center text-sm">
            <ShoppingCart size={15} /> New sale
          </Link>
        </Card>

        <Card>
          <CardHeader
            title="Your top sellers"
            subtitle={formatMonth(month)}
            icon={<TrendingUp size={18} strokeWidth={1.7} />}
          />
          {data.topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm muted">No sales recorded this month.</p>
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-ink-100 text-xs font-semibold muted dark:bg-white/5">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{p.name}</span>
                  <span className="tabular shrink-0 muted">{fmtNumber(p.qty)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Recent invoices"
          subtitle="Your latest invoices"
          icon={<Receipt size={18} strokeWidth={1.7} />}
          action={
            <Link href="/dashboard/sales" className="text-sm font-medium text-brand-600 hover:underline">
              All sales <ArrowRight size={13} className="inline" />
            </Link>
          }
        />
        {data.recentSales.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            description="Record your first sale and it will show up here."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Shop</th>
                  <th className="text-right">Total</th>
                  <th className="text-right">Paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((s) => (
                  <tr key={s.id}>
                    <td className="tabular font-medium">{s.invoiceNo}</td>
                    <td className="truncate">{s.shopName}</td>
                    <td className="tabular text-right">{money(s.total)}</td>
                    <td className="tabular text-right">{money(s.paid)}</td>
                    <td>
                      <span
                        className={`chip ${
                          s.status === 'DELIVERED'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                            : s.status === 'CANCELLED'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

/* --------------------------------------------------------------- dealer */

function DealerDashboard({ data }: { data: DealerOverview }) {
  const { money } = useWorkspace();
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Products listed"
          value={data.stock.skus}
          kind="count"
          icon={<Boxes size={18} strokeWidth={1.7} />}
          tone="brand"
        />
        <StatCard
          label="Units available"
          value={data.stock.unitsInStore}
          kind="count"
          icon={<Warehouse size={18} strokeWidth={1.7} />}
          tone="green"
        />
        <StatCard
          label="Categories"
          value={data.categories}
          kind="count"
          icon={<Store size={18} strokeWidth={1.7} />}
          tone="violet"
        />
        <StatCard
          label="Out of stock"
          value={data.stock.outOfStock}
          kind="count"
          icon={<AlertTriangle size={18} strokeWidth={1.7} />}
          tone={data.stock.outOfStock > 0 ? 'amber' : 'slate'}
        />
      </div>

      <Card>
        <CardHeader
          title="Moving fastest"
          subtitle="What the market is taking right now"
          icon={<TrendingUp size={18} strokeWidth={1.7} />}
          action={
            <Link href="/dashboard/products" className="text-sm font-medium text-brand-600 hover:underline">
              Browse catalogue <ArrowRight size={13} className="inline" />
            </Link>
          }
        />
        {data.topProducts.length === 0 ? (
          <EmptyState title="No movement recorded yet" />
        ) : (
          <ul className="divide-y">
            {data.topProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0 truncate text-sm font-medium">{p.name}</span>
                <span className="tabular shrink-0 text-sm">{money(p.marketPrice)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
