'use client';

import { useState } from 'react';
import { Banknote, CheckCircle2, Coins, Users, Wallet } from 'lucide-react';
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
import { PAYMENT_METHODS, ROLE_LABEL, type PaymentMethod, type Role } from '@/lib/types';
import { avatarTone, cn, formatDate, formatMonth, initials, percent } from '@/lib/utils';

interface RosterRow {
  userId: string;
  name: string;
  role: Role;
  area?: string;
  base: number;
  commissionRate: number;
  soldValue: number;
  suggestedCommission: number;
  paid: boolean;
}

interface PaymentRow {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  month: string;
  base: number;
  commission: number;
  bonus: number;
  deduction: number;
  total: number;
  paidAt: string;
  method: PaymentMethod;
  note?: string;
}

interface SalariesResponse {
  payments: PaymentRow[];
  roster: RosterRow[];
  month: string;
  total: number;
  budget: number;
}

export default function SalaryPage() {
  const { money, can } = useWorkspace();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [paying, setPaying] = useState<RosterRow | null>(null);

  const canPay = can('salary.manage');

  const { data, error, initial, reload } = useResource<SalariesResponse>(
    `/api/salaries${qs({ month })}`,
  );

  const roster = data?.roster ?? [];
  const payments = data?.payments ?? [];
  const outstanding = roster.filter((r) => !r.paid);
  const budget = data?.budget ?? 0;

  return (
    <PageTransition>
      <SectionTitle
        title="Payroll"
        subtitle={`Payroll for ${formatMonth(month)}.`}
        action={<MonthPicker value={month} onChange={setMonth} />}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Staff on payroll" value={String(roster.length)} icon={<Users size={15} />} />
        <Tile label="Expected payroll" value={money(budget)} icon={<Coins size={15} />} />
        <Tile label="Paid this month" value={money(data?.total ?? 0)} icon={<Banknote size={15} />} />
        <Tile
          label="Still to pay"
          value={String(outstanding.length)}
          icon={<Wallet size={15} />}
          warn={outstanding.length > 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* roster */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Payroll run"
            subtitle="Base salary plus commission on what each rep sold"
            icon={<Users size={18} strokeWidth={1.7} />}
          />
          {error ? (
            <ErrorState message={error} onRetry={() => void reload()} />
          ) : initial ? (
            <TableSkeleton rows={4} cols={4} />
          ) : roster.length === 0 ? (
            <EmptyState title="Nobody on payroll" description="Add staff from the Team page." />
          ) : (
            <div className="space-y-2">
              {roster.map((row) => (
                <div
                  key={row.userId}
                  className="flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3"
                >
                  <span
                    className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold',
                      avatarTone(row.userId),
                    )}
                  >
                    {initials(row.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{row.name}</p>
                    <p className="truncate text-xs muted">
                      {ROLE_LABEL[row.role]}
                      {row.area ? ` · ${row.area}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular text-sm font-medium">
                      {money(row.base + row.suggestedCommission)}
                    </p>
                    <p className="tabular text-xs muted">
                      {money(row.base)} base
                      {row.commissionRate > 0
                        ? ` + ${money(row.suggestedCommission)} @ ${percent(row.commissionRate, 1)}`
                        : ''}
                    </p>
                  </div>
                  {row.paid ? (
                    <Badge tone="green" icon={<CheckCircle2 size={13} />}>
                      Paid
                    </Badge>
                  ) : canPay ? (
                    <Button size="sm" onClick={() => setPaying(row)}>
                      Pay
                    </Button>
                  ) : (
                    <Badge tone="amber">Due</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* payments made */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Payments made"
            subtitle={formatMonth(month)}
            icon={<Banknote size={18} strokeWidth={1.7} />}
          />
          {payments.length === 0 ? (
            <p className="py-8 text-center text-sm muted">No salary paid for this month yet.</p>
          ) : (
            <ul className="divide-y">
              {payments.map((p) => (
                <li key={p.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.userName}</p>
                      <p className="text-xs muted">
                        {formatDate(p.paidAt)} · {p.method}
                      </p>
                    </div>
                    <span className="tabular shrink-0 font-medium">{money(p.total)}</span>
                  </div>
                  <p className="mt-1 text-xs muted">
                    {money(p.base)} base
                    {p.commission > 0 ? ` · ${money(p.commission)} commission` : ''}
                    {p.bonus > 0 ? ` · ${money(p.bonus)} bonus` : ''}
                    {p.deduction > 0 ? ` · −${money(p.deduction)} deduction` : ''}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {canPay ? (
        <PayModal
          row={paying}
          month={month}
          onClose={() => setPaying(null)}
          onSaved={() => {
            setPaying(null);
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

function PayModal({
  row,
  month,
  onClose,
  onSaved,
}: {
  row: RosterRow | null;
  month: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { money } = useWorkspace();
  const [base, setBase] = useState(0);
  const [commission, setCommission] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [seeded, setSeeded] = useState<string | null>(null);

  // Seed the form from the roster the first time this staff member opens.
  if (row && seeded !== row.userId) {
    setSeeded(row.userId);
    setBase(row.base);
    setCommission(row.suggestedCommission);
    setBonus(0);
    setDeduction(0);
    setNote('');
  }
  if (!row && seeded !== null) setSeeded(null);

  const total = Math.max(0, base + commission + bonus - deduction);

  async function save() {
    if (!row) return;
    setBusy(true);
    try {
      await apiPost('/api/salaries', {
        userId: row.userId,
        month,
        base,
        commission,
        bonus,
        deduction,
        method,
        note: note || undefined,
      });
      toast.success(`${money(total)} paid to ${row.name}.`);
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record the payment.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={Boolean(row)}
      onClose={onClose}
      title={row ? `Pay ${row.name}` : 'Pay salary'}
      subtitle={formatMonth(month)}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={total <= 0}>
            Pay {money(total)}
          </Button>
        </>
      }
    >
      {row ? (
        <div className="space-y-4">
          <div className="rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
            <div className="flex justify-between">
              <span className="muted">Sold in {formatMonth(month)}</span>
              <span className="tabular font-medium">{money(row.soldValue)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="muted">Commission rate</span>
              <span className="tabular font-medium">{percent(row.commissionRate, 1)}</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Base salary"
              type="number"
              min={0}
              step="0.01"
              value={base}
              onChange={(e) => setBase(Number(e.target.value) || 0)}
            />
            <Input
              label="Commission"
              type="number"
              min={0}
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value) || 0)}
              hint={`Suggested ${money(row.suggestedCommission)}`}
            />
            <Input
              label="Bonus"
              type="number"
              min={0}
              step="0.01"
              value={bonus}
              onChange={(e) => setBonus(Number(e.target.value) || 0)}
            />
            <Input
              label="Deduction"
              type="number"
              min={0}
              step="0.01"
              value={deduction}
              onChange={(e) => setDeduction(Number(e.target.value) || 0)}
              hint="Advance taken, shortfall, etc."
            />
          </div>

          <Select
            label="Paid by"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>

          <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />

          <div className="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
            <span className="font-medium">Net payable</span>
            <span className="tabular font-display text-lg font-semibold">{money(total)}</span>
          </div>

          <p className="text-xs muted">
            Recording this payment also books a salary expense for the month, so the overview stays
            in step.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
