'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Banknote, HandCoins, Plus, TrendingDown, Wallet } from 'lucide-react';
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
import { MonthPicker } from '@/components/dashboard/month-picker';
import { PageTransition } from '@/components/motion/reveal';
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { apiPost, qs } from '@/lib/client';
import { PAYMENT_METHODS, type PaymentMethod, type SafeUser } from '@/lib/types';
import { avatarTone, cn, formatDate, initials, todayIso } from '@/lib/utils';

interface DepositRow {
  id: string;
  srId: string;
  srName: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  note?: string;
  receivedByName: string;
}

interface Account {
  srId: string;
  name: string;
  soldValue: number;
  collected: number;
  marketDue: number;
  deposited: number;
  cashInHand: number;
  unitsInHand: number;
  stockValueInHand: number;
  lastDepositAt?: string;
}

interface DepositsResponse {
  deposits: DepositRow[];
  accounts: Account[];
  totals: { deposited: number; count: number };
}

interface MeResponse {
  user: SafeUser | null;
  capabilities: string[];
}

export default function DepositsPage() {
  const { money } = useWorkspace();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [srFilter, setSrFilter] = useState('');
  const [creating, setCreating] = useState(false);

  const me = useResource<MeResponse>('/api/auth/me');
  const isSr = me.data?.user?.role === 'SR';
  const canReceive = me.data?.capabilities.includes('deposit.receive') ?? false;
  const canCreate = me.data?.capabilities.includes('deposit.create') ?? false;
  const viewsAll = me.data?.capabilities.includes('deposit.view.all') ?? false;

  const { data, error, initial, reload } = useResource<DepositsResponse>(
    `/api/deposits${qs({ month, sr: srFilter })}`,
  );

  const deposits = data?.deposits ?? [];
  const accounts = data?.accounts ?? [];

  const outstanding = useMemo(
    () => accounts.reduce((n, a) => n + a.cashInHand, 0),
    [accounts],
  );
  const marketDue = useMemo(() => accounts.reduce((n, a) => n + a.marketDue, 0), [accounts]);

  return (
    <PageTransition>
      <SectionTitle
        title="Deposits"
        subtitle={
          isSr
            ? 'What you have handed over, and what is still with you.'
            : 'Cash coming back from the field, rep by rep.'
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            {canReceive || canCreate ? (
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                {canReceive ? 'Record deposit' : 'Deposit cash'}
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label={`Deposited in ${month.slice(5)}`}
          value={money(data?.totals.deposited ?? 0)}
          icon={<Banknote size={15} />}
        />
        <Tile label="Deposit entries" value={String(data?.totals.count ?? 0)} icon={<HandCoins size={15} />} />
        <Tile
          label={isSr ? 'Still with you' : 'Still with the reps'}
          value={money(outstanding)}
          icon={<Wallet size={15} />}
          warn={outstanding > 0}
        />
        <Tile
          label="Owed by shops"
          value={money(marketDue)}
          icon={<TrendingDown size={15} />}
          warn={marketDue > 0}
        />
      </div>

      {/* per-rep position */}
      {accounts.length > 0 ? (
        <Card className="mb-5">
          <CardHeader
            title={viewsAll ? 'Where every rep stands' : 'Your running account'}
            subtitle="Collected − deposited = cash still in hand"
            icon={<Wallet size={18} strokeWidth={1.7} />}
          />
          <div className="table-wrap">
            <table className="table min-w-[720px]">
              <thead>
                <tr>
                  <th>Sales rep</th>
                  <th className="text-right">Sold</th>
                  <th className="text-right">Collected</th>
                  <th className="text-right">Owed by shops</th>
                  <th className="text-right">Deposited</th>
                  <th className="text-right">Cash in hand</th>
                  <th className="text-right">Stock held</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.srId}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold',
                            avatarTone(a.srId),
                          )}
                        >
                          {initials(a.name)}
                        </span>
                        <div className="min-w-0">
                          {viewsAll ? (
                            <Link
                              href={`/dashboard/team/${a.srId}`}
                              className="truncate font-medium hover:text-brand-600"
                            >
                              {a.name}
                            </Link>
                          ) : (
                            <span className="truncate font-medium">{a.name}</span>
                          )}
                          <p className="text-xs muted">
                            Last deposit {a.lastDepositAt ? formatDate(a.lastDepositAt) : '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="tabular text-right">{money(a.soldValue)}</td>
                    <td className="tabular text-right">{money(a.collected)}</td>
                    <td className="tabular text-right muted">{money(a.marketDue)}</td>
                    <td className="tabular text-right">{money(a.deposited)}</td>
                    <td className="tabular text-right">
                      <span
                        className={
                          a.cashInHand > 0 ? 'font-semibold text-rose-600 dark:text-rose-400' : ''
                        }
                      >
                        {money(a.cashInHand)}
                      </span>
                    </td>
                    <td className="tabular text-right muted">{money(a.stockValueInHand)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs muted">
            Cash in hand is a running, all-time figure — it does not reset when the month changes.
          </p>
        </Card>
      ) : null}

      {viewsAll && accounts.length > 1 ? (
        <Card className="mb-5 p-4">
          <Select
            label="Filter deposits by rep"
            value={srFilter}
            onChange={(e) => setSrFilter(e.target.value)}
            wrapperClassName="w-full sm:w-64"
          >
            <option value="">All reps</option>
            {accounts.map((a) => (
              <option key={a.srId} value={a.srId}>
                {a.name}
              </option>
            ))}
          </Select>
        </Card>
      ) : null}

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={5} cols={5} />
        </Card>
      ) : deposits.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Banknote size={22} strokeWidth={1.5} />}
            title="No deposits this month"
            description="Every payment a rep hands to the office is recorded here."
          />
        </Card>
      ) : (
        <div className="table-wrap">
          <table className="table min-w-[640px]">
            <thead>
              <tr>
                <th>Date</th>
                {viewsAll ? <th>Sales rep</th> : null}
                <th>Method</th>
                <th>Reference</th>
                <th>Received by</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((d) => (
                <tr key={d.id}>
                  <td className="whitespace-nowrap">{formatDate(d.date)}</td>
                  {viewsAll ? <td className="truncate font-medium">{d.srName}</td> : null}
                  <td>
                    <Badge tone={d.method === 'CASH' ? 'green' : 'brand'}>{d.method}</Badge>
                  </td>
                  <td className="truncate text-sm muted">{d.reference || d.note || '—'}</td>
                  <td className="truncate text-sm muted">{d.receivedByName}</td>
                  <td className="tabular text-right font-medium">{money(d.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canReceive || canCreate ? (
        <DepositModal
          open={creating}
          isSr={isSr}
          accounts={accounts}
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

function Tile({
  label,
  value,
  icon,
  warn,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          warn
            ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
            : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs muted">{label}</p>
        <p className="tabular truncate font-display font-semibold">{value}</p>
      </div>
    </div>
  );
}

function DepositModal({
  open,
  isSr,
  accounts,
  onClose,
  onSaved,
}: {
  open: boolean;
  isSr: boolean;
  accounts: Account[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { money } = useWorkspace();
  const [srId, setSrId] = useState('');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(todayIso());
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const target = isSr ? accounts[0] : accounts.find((a) => a.srId === srId);
  const holding = target?.cashInHand ?? 0;

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/deposits', {
        ...(isSr ? {} : { srId }),
        amount,
        date,
        method,
        reference: reference || undefined,
        note: note || undefined,
      });
      toast.success(`${money(amount)} recorded.`);
      setAmount(0);
      setReference('');
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record the deposit.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a deposit"
      subtitle="Cash handed back to the office"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={amount <= 0 || (!isSr && !srId)}>
            Record {money(amount)}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!isSr ? (
          <Select label="Money received from" value={srId} onChange={(e) => setSrId(e.target.value)}>
            <option value="">Choose a rep…</option>
            {accounts.map((a) => (
              <option key={a.srId} value={a.srId}>
                {a.name} — {money(a.cashInHand)} in hand
              </option>
            ))}
          </Select>
        ) : null}

        {target ? (
          <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
            <span className="muted">Currently in hand</span>
            <span className="tabular font-display font-semibold">{money(holding)}</span>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            hint={
              holding > 0 && amount > holding
                ? 'More than the rep currently holds — double-check.'
                : undefined
            }
          />
          <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {holding > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setAmount(holding)}>
            Deposit the full {money(holding)}
          </Button>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Method"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
          <Input
            label="Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="bKash TrxID, slip no…"
          />
        </div>

        <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Modal>
  );
}
