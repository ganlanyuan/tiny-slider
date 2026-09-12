'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Banknote,
  Boxes,
  HandCoins,
  MapPin,
  Phone,
  ShoppingCart,
  Truck,
  Wallet,
} from 'lucide-react';

import {
  Badge,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  SectionTitle,
  TableSkeleton,
} from '@/components/ui';
import { StatCard } from '@/components/ui/stat';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { ROLE_LABEL, type Deposit, type Role, type Sale, type SafeUser } from '@/lib/types';
import { avatarTone, cn, formatDate, initials, money, number as fmtNumber, percent } from '@/lib/utils';

interface MemberResponse {
  user: SafeUser;
  account: {
    soldValue: number;
    collected: number;
    marketDue: number;
    deposited: number;
    cashInHand: number;
    invoices: number;
    unitsInHand: number;
    stockValueInHand: number;
    assignedValue: number;
    lastSaleAt?: string;
    lastDepositAt?: string;
  } | null;
  holdings: {
    productId: string;
    name: string;
    unit: string;
    qty: number;
    srPrice: number;
    value: number;
  }[];
  recentSales: Sale[];
  recentDeposits: Deposit[];
}

const ROLE_TONE: Record<Role, 'brand' | 'violet' | 'green' | 'amber'> = {
  ADMIN: 'brand',
  MANAGER: 'violet',
  SR: 'green',
  DEALER: 'amber',
};

export default function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, initial, reload } = useResource<MemberResponse>(`/api/users/${id}`);

  if (error) {
    return (
      <PageTransition>
        <BackLink />
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      </PageTransition>
    );
  }

  if (initial || !data) {
    return (
      <PageTransition>
        <BackLink />
        <div className="space-y-4">
          <div className="skeleton h-28" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32" />
            ))}
          </div>
          <Card className="p-0">
            <TableSkeleton rows={4} cols={4} />
          </Card>
        </div>
      </PageTransition>
    );
  }

  const { user, account, holdings } = data;

  return (
    <PageTransition>
      <BackLink />

      <Card className="mb-5">
        <div className="flex flex-wrap items-start gap-4">
          <span
            className={cn(
              'grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-lg font-semibold',
              avatarTone(user.id),
            )}
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight">{user.name}</h1>
              <Badge tone={ROLE_TONE[user.role]}>{ROLE_LABEL[user.role].en}</Badge>
              {!user.active ? <Badge tone="rose">Deactivated</Badge> : null}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm muted">
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {user.phone}
              </span>
              {user.area ? (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} /> {user.area}
                </span>
              ) : null}
              <span>Joined {formatDate(user.joinedAt)}</span>
            </div>
            {user.note ? <p className="mt-3 text-sm muted">{user.note}</p> : null}
          </div>
          <div className="text-right">
            <p className="text-xs muted">Monthly salary</p>
            <p className="tabular font-display text-lg font-semibold">{money(user.monthlySalary)}</p>
            {user.commissionRate > 0 ? (
              <p className="text-xs muted">+ {percent(user.commissionRate, 1)} commission</p>
            ) : null}
          </div>
        </div>
      </Card>

      {account ? (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Sold all-time"
              value={account.soldValue}
              icon={<ShoppingCart size={18} strokeWidth={1.7} />}
              tone="brand"
              hint={`${fmtNumber(account.invoices)} invoices`}
            />
            <StatCard
              label="Collected"
              value={account.collected}
              icon={<HandCoins size={18} strokeWidth={1.7} />}
              tone="green"
              hint={`${money(account.marketDue)} owed by shops`}
            />
            <StatCard
              label="Deposited"
              value={account.deposited}
              icon={<Banknote size={18} strokeWidth={1.7} />}
              tone="violet"
              hint={
                account.lastDepositAt ? `Last on ${formatDate(account.lastDepositAt)}` : 'No deposits yet'
              }
            />
            <StatCard
              label="Cash still in hand"
              value={account.cashInHand}
              icon={<Wallet size={18} strokeWidth={1.7} />}
              tone={account.cashInHand > 0 ? 'rose' : 'slate'}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0">
              <div className="px-5 pt-5">
                <CardHeader
                  title="Stock in the van"
                  subtitle={`${fmtNumber(account.unitsInHand)} units · ${money(account.stockValueInHand)} at SR rate`}
                  icon={<Truck size={18} strokeWidth={1.7} />}
                  className="mb-0"
                />
              </div>
              {holdings.length === 0 ? (
                <EmptyState
                  icon={<Boxes size={22} strokeWidth={1.5} />}
                  title="Carrying nothing right now"
                  description="Issue a challan to load them up."
                />
              ) : (
                <div className="table-wrap mt-4 border-0">
                  <table className="table min-w-[420px]">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Rate</th>
                        <th className="text-right">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h) => (
                        <tr key={h.productId}>
                          <td className="truncate">{h.name}</td>
                          <td className="tabular text-right">
                            {fmtNumber(h.qty)} {h.unit}
                          </td>
                          <td className="tabular text-right muted">{money(h.srPrice)}</td>
                          <td className="tabular text-right font-medium">{money(h.value)}</td>
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
                  title="Recent invoices"
                  subtitle="Latest ten"
                  icon={<ShoppingCart size={18} strokeWidth={1.7} />}
                />
                {data.recentSales.length === 0 ? (
                  <p className="py-6 text-center text-sm muted">No sales recorded.</p>
                ) : (
                  <ul className="divide-y">
                    {data.recentSales.map((s) => (
                      <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{s.shopName}</p>
                          <p className="text-xs muted">
                            {s.invoiceNo} · {formatDate(s.date)}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="tabular text-sm font-medium">{money(s.total)}</p>
                          <p className="tabular text-xs muted">
                            {s.total - s.paid > 0 ? `${money(s.total - s.paid)} due` : 'paid'}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader
                  title="Recent deposits"
                  subtitle="Latest ten"
                  icon={<Banknote size={18} strokeWidth={1.7} />}
                />
                {data.recentDeposits.length === 0 ? (
                  <p className="py-6 text-center text-sm muted">No deposits recorded.</p>
                ) : (
                  <ul className="divide-y">
                    {data.recentDeposits.map((d) => (
                      <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{formatDate(d.date)}</p>
                          <p className="text-xs muted">
                            {d.method}
                            {d.reference ? ` · ${d.reference}` : ''}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-sm font-medium">
                          {money(d.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <SectionTitle
            title="No sales account"
            subtitle="Only sales reps carry stock and hold cash, so there is no ledger to show here."
          />
        </Card>
      )}
    </PageTransition>
  );
}

function BackLink() {
  return (
    <Link
      href="/dashboard/team"
      className="mb-4 inline-flex items-center gap-1.5 text-sm muted transition hover:text-brand-600"
    >
      <ArrowLeft size={15} /> Back to team
    </Link>
  );
}
