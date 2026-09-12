'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Plus, RotateCcw, Truck, Users, Warehouse } from 'lucide-react';
import { toast } from 'sonner';

import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  SectionTitle,
  Select,
  TableSkeleton,
  Textarea,
} from '@/components/ui';
import { LineItemEditor, type LineItem, type PickableProduct } from '@/components/dashboard/line-items';
import { MonthPicker } from '@/components/dashboard/month-picker';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { apiPost, qs } from '@/lib/client';
import type { SafeUser } from '@/lib/types';
import { formatDate, money, number as fmtNumber, todayIso } from '@/lib/utils';

interface AssignmentRow {
  id: string;
  challanNo: string;
  srId: string;
  srName: string;
  date: string;
  note?: string;
  units: number;
  totalValue: number;
  items: { productId: string; productName: string; qty: number; srRate: number }[];
}

interface AssignmentsResponse {
  assignments: AssignmentRow[];
}

interface ProductsResponse {
  products: (PickableProduct & { stock: number; withSrs: number })[];
}

interface UsersResponse {
  users: (SafeUser & { account: { unitsInHand: number; stockValueInHand: number } | null })[];
}

interface MeResponse {
  capabilities: string[];
}

export default function AssignmentsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [srFilter, setSrFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [returning, setReturning] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const me = useResource<MeResponse>('/api/auth/me');
  const canManage = me.data?.capabilities.includes('assignment.manage') ?? false;

  const { data, error, initial, reload } = useResource<AssignmentsResponse>(
    `/api/assignments${qs({ month, sr: srFilter })}`,
  );
  const productsRes = useResource<ProductsResponse>('/api/products');
  const usersRes = useResource<UsersResponse>('/api/users?role=SR');

  const assignments = data?.assignments ?? [];
  const srs = useMemo(
    () => (usersRes.data?.users ?? []).filter((u) => u.active),
    [usersRes.data],
  );

  const storeProducts = useMemo(
    () =>
      (productsRes.data?.products ?? []).map((p) => ({ ...p, available: p.stock })),
    [productsRes.data],
  );

  const summary = useMemo(
    () => ({
      challans: assignments.length,
      units: assignments.reduce((n, a) => n + a.units, 0),
      value: assignments.reduce((n, a) => n + a.totalValue, 0),
    }),
    [assignments],
  );

  return (
    <PageTransition>
      <SectionTitle
        title="এসআর চালান"
        subtitle="Stock handed from the store to a sales rep."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            {canManage ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size={15} />}
                  onClick={() => setReturning(true)}
                >
                  Take return
                </Button>
                <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  New challan
                </Button>
              </>
            ) : null}
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Tile label="Challans issued" value={fmtNumber(summary.challans)} icon={<Truck size={15} />} />
        <Tile label="Units handed out" value={fmtNumber(summary.units)} icon={<Warehouse size={15} />} />
        <Tile label="Value at SR rate" value={money(summary.value)} icon={<Users size={15} />} />
      </div>

      {/* SR holdings strip */}
      {srs.length > 0 ? (
        <Card className="mb-5">
          <p className="mb-3 text-sm font-medium">Stock currently with each rep</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {srs.map((sr) => (
              <button
                key={sr.id}
                type="button"
                onClick={() => setSrFilter(srFilter === sr.id ? '' : sr.id)}
                className={`rounded-xl border px-4 py-3 text-left transition hover:shadow-soft ${
                  srFilter === sr.id ? 'border-brand-400 bg-brand-50/50 dark:bg-brand-500/10' : ''
                }`}
              >
                <p className="truncate text-sm font-medium">{sr.name}</p>
                <p className="truncate text-xs muted">{sr.area || 'No area set'}</p>
                <p className="tabular mt-2 text-sm">
                  {fmtNumber(sr.account?.unitsInHand ?? 0)} units
                  <span className="ml-2 text-xs muted">
                    {money(sr.account?.stockValueInHand ?? 0)}
                  </span>
                </p>
              </button>
            ))}
          </div>
          {srFilter ? (
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSrFilter('')}>
              Show all reps
            </Button>
          ) : null}
        </Card>
      ) : null}

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={5} cols={4} />
        </Card>
      ) : assignments.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Truck size={22} strokeWidth={1.5} />}
            title="No challans this month"
            description="Issue a challan to load a rep’s van. They can only sell what the challan gave them."
            action={
              canManage ? (
                <Button icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  New challan
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {assignments.map((a) => (
            <Card key={a.id} className="p-0">
              <button
                type="button"
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10">
                  <Truck size={18} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{a.srName}</p>
                  <p className="truncate text-xs muted">
                    {a.challanNo} · {formatDate(a.date)} · {a.items.length} lines
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular font-medium">{fmtNumber(a.units)} units</p>
                  <p className="tabular text-xs muted">{money(a.totalValue)}</p>
                </div>
                <ChevronDown
                  size={18}
                  className={`shrink-0 muted transition ${expanded === a.id ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded === a.id ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t"
                  >
                    <div className="px-5 py-4">
                      <div className="table-wrap">
                        <table className="table min-w-[440px]">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th className="text-right">Qty</th>
                              <th className="text-right">SR rate</th>
                              <th className="text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {a.items.map((item) => (
                              <tr key={item.productId}>
                                <td className="truncate">{item.productName}</td>
                                <td className="tabular text-right">{fmtNumber(item.qty)}</td>
                                <td className="tabular text-right">{money(item.srRate)}</td>
                                <td className="tabular text-right font-medium">
                                  {money(item.qty * item.srRate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {a.note ? <p className="mt-3 text-sm muted">Note: {a.note}</p> : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {canManage ? (
        <>
          <ChallanModal
            open={creating}
            srs={srs}
            products={storeProducts}
            onClose={() => setCreating(false)}
            onSaved={() => {
              setCreating(false);
              void reload();
              void productsRes.reload();
              void usersRes.reload();
            }}
          />
          <ReturnModal
            open={returning}
            srs={srs}
            onClose={() => setReturning(false)}
            onSaved={() => {
              setReturning(false);
              void reload();
              void productsRes.reload();
              void usersRes.reload();
            }}
          />
        </>
      ) : null}
    </PageTransition>
  );
}

function Tile({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs muted">{label}</p>
        <p className="tabular truncate font-display font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ChallanModal({
  open,
  srs,
  products,
  onClose,
  onSaved,
}: {
  open: boolean;
  srs: SafeUser[];
  products: PickableProduct[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [srId, setSrId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState<LineItem[]>([]);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const units = items.reduce((n, i) => n + i.qty, 0);
  const overStock = items.some((i) => {
    const p = products.find((x) => x.id === i.productId);
    return p?.available !== undefined && i.qty > p.available;
  });

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/assignments', {
        srId,
        date,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, srRate: i.rate })),
        note: note || undefined,
      });
      toast.success(`Challan issued — ${units} units loaded.`);
      setItems([]);
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not issue the challan.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Issue a challan"
      subtitle="এসআর কে মাল দিন"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={busy}
            disabled={!srId || items.length === 0 || overStock}
          >
            Issue challan
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Sales rep" value={srId} onChange={(e) => setSrId(e.target.value)}>
          <option value="">Choose a rep…</option>
          {srs.map((sr) => (
            <option key={sr.id} value={sr.id}>
              {sr.name} {sr.area ? `— ${sr.area}` : ''}
            </option>
          ))}
        </Select>
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="mt-5">
        <p className="label">Products to hand over</p>
        <LineItemEditor
          products={products}
          value={items}
          onChange={setItems}
          rateMode="sr"
          rateLabel="SR rate"
          enforceAvailable
          availableLabel="in store"
        />
      </div>

      {overStock ? (
        <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          One or more lines ask for more than the store holds. Reduce the quantity or receive more
          stock first.
        </p>
      ) : null}

      <div className="mt-4">
        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Route, market day, anything the rep should know."
        />
      </div>
    </Modal>
  );
}

function ReturnModal({
  open,
  srs,
  onClose,
  onSaved,
}: {
  open: boolean;
  srs: SafeUser[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [srId, setSrId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState<LineItem[]>([]);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // Holdings come from the SR detail endpoint, so a return can never exceed
  // what the rep is actually carrying.
  const holdings = useResource<{
    holdings: { productId: string; name: string; unit: string; qty: number; srPrice: number }[];
  }>(srId ? `/api/users/${srId}` : null);

  const products: PickableProduct[] = (holdings.data?.holdings ?? []).map((h) => ({
    id: h.productId,
    sku: '',
    name: h.name,
    unit: h.unit,
    srPrice: h.srPrice,
    marketPrice: h.srPrice,
    available: h.qty,
  }));

  const overHeld = items.some((i) => {
    const p = products.find((x) => x.id === i.productId);
    return p?.available !== undefined && i.qty > p.available;
  });

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/returns', {
        srId,
        date,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        reason: reason || undefined,
      });
      toast.success('Return recorded — stock is back in the store.');
      setItems([]);
      setReason('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record the return.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Take stock back from a rep"
      subtitle="ফেরত নেওয়া মাল"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!srId || items.length === 0 || overHeld}>
            Record return
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Sales rep"
          value={srId}
          onChange={(e) => {
            setSrId(e.target.value);
            setItems([]);
          }}
        >
          <option value="">Choose a rep…</option>
          {srs.map((sr) => (
            <option key={sr.id} value={sr.id}>
              {sr.name}
            </option>
          ))}
        </Select>
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="mt-5">
        <p className="label">Products coming back</p>
        {!srId ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm muted">
            Pick a rep first to see what they are carrying.
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm muted">
            This rep is not holding any stock right now.
          </p>
        ) : (
          <LineItemEditor
            products={products}
            value={items}
            onChange={setItems}
            showRate={false}
            enforceAvailable
            availableLabel="with rep"
          />
        )}
      </div>

      <div className="mt-4">
        <Textarea
          label="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Damaged in transit, unsold at month end, wrong size…"
        />
      </div>
    </Modal>
  );
}
