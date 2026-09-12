'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Ban,
  ChevronDown,
  HandCoins,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
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
import { apiPatch, apiPost, qs } from '@/lib/client';
import type { SafeUser, SaleStatus } from '@/lib/types';
import { formatDate, money, number as fmtNumber, todayIso } from '@/lib/utils';

interface SaleRow {
  id: string;
  invoiceNo: string;
  srId: string;
  srName: string;
  date: string;
  shopName: string;
  customerName?: string;
  customerPhone?: string;
  area?: string;
  discount: number;
  total: number;
  paid: number;
  due: number;
  units: number;
  status: SaleStatus;
  note?: string;
  items: { productId: string; productName: string; qty: number; rate: number }[];
}

interface SalesResponse {
  sales: SaleRow[];
  totals: {
    invoices: number;
    value: number;
    collected: number;
    delivered: number;
    pending: number;
  };
  scope: 'own' | 'all';
}

interface MeResponse {
  user: SafeUser | null;
  capabilities: string[];
}

/** Stock a rep is carrying, as returned by `/api/my/stock` and `/api/users/[id]`. */
interface Holding {
  productId: string;
  sku?: string;
  name: string;
  unit: string;
  qty: number;
  srPrice: number;
  marketPrice?: number;
}

const STATUS_TONE: Record<SaleStatus, 'green' | 'amber' | 'rose'> = {
  DELIVERED: 'green',
  PENDING: 'amber',
  CANCELLED: 'rose',
};

export default function SalesPage() {
  const params = useSearchParams();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState(params.get('status') ?? '');
  const [search, setSearch] = useState('');
  const [srFilter, setSrFilter] = useState('');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const me = useResource<MeResponse>('/api/auth/me');
  const role = me.data?.user?.role;
  const canCreate = me.data?.capabilities.includes('sale.create') ?? false;
  const canManage = me.data?.capabilities.includes('sale.manage') ?? false;
  const canViewAll = me.data?.capabilities.includes('sale.view.all') ?? false;

  const { data, error, initial, reload } = useResource<SalesResponse>(
    `/api/sales${qs({ month, status, q: search, sr: srFilter })}`,
  );
  const usersRes = useResource<{ users: SafeUser[] }>(canViewAll ? '/api/users?role=SR' : null);
  const srs = usersRes.data?.users?.filter((u) => u.active) ?? [];

  const totals = data?.totals;
  const sales = data?.sales ?? [];

  return (
    <PageTransition>
      <SectionTitle
        title="বিক্রয়"
        subtitle={
          data?.scope === 'own'
            ? 'Your invoices from the market.'
            : 'Every invoice raised by the sales team.'
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            {canCreate ? (
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                New sale
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile
          label="Invoices"
          value={fmtNumber(totals?.invoices ?? 0)}
          icon={<ShoppingCart size={15} />}
        />
        <Tile label="Sales value" value={money(totals?.value ?? 0)} icon={<Store size={15} />} />
        <Tile
          label="Cash collected"
          value={money(totals?.collected ?? 0)}
          icon={<HandCoins size={15} />}
        />
        <Tile
          label="Delivered / pending"
          value={`${totals?.delivered ?? 0} / ${totals?.pending ?? 0}`}
          icon={<Truck size={15} />}
        />
      </div>

      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[200px] flex-1">
            <label className="label">Search</label>
            <Search size={16} className="pointer-events-none absolute left-3.5 top-[34px] muted" />
            <input
              className="field pl-10"
              placeholder="Invoice no., shop or area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            wrapperClassName="w-full sm:w-44"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          {canViewAll ? (
            <Select
              label="Sales rep"
              value={srFilter}
              onChange={(e) => setSrFilter(e.target.value)}
              wrapperClassName="w-full sm:w-52"
            >
              <option value="">All reps</option>
              {srs.map((sr) => (
                <option key={sr.id} value={sr.id}>
                  {sr.name}
                </option>
              ))}
            </Select>
          ) : null}
        </div>
      </Card>

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={6} cols={5} />
        </Card>
      ) : sales.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<ShoppingCart size={22} strokeWidth={1.5} />}
            title="No invoices here"
            description={
              role === 'SR'
                ? 'Record a sale and it will appear here with its payment status.'
                : 'Nothing was sold in this period with these filters.'
            }
            action={
              canCreate ? (
                <Button icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  New sale
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {sales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              expanded={expanded === sale.id}
              showSr={data?.scope === 'all'}
              canManage={canManage}
              isOwnInvoice={sale.srId === me.data?.user?.id}
              onToggle={() => setExpanded(expanded === sale.id ? null : sale.id)}
              onChanged={() => void reload()}
            />
          ))}
        </div>
      )}

      {canCreate ? (
        <SaleModal
          open={creating}
          currentUser={me.data?.user ?? null}
          canPickSr={canViewAll}
          srs={srs}
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

function SaleCard({
  sale,
  expanded,
  showSr,
  canManage,
  isOwnInvoice,
  onToggle,
  onChanged,
}: {
  sale: SaleRow;
  expanded: boolean;
  showSr: boolean;
  canManage: boolean;
  isOwnInvoice: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState(sale.paid);

  useEffect(() => setPayment(sale.paid), [sale.paid]);

  async function patch(body: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    try {
      await apiPatch(`/api/sales/${sale.id}`, body);
      toast.success(successMessage);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the invoice.');
    } finally {
      setBusy(false);
    }
  }

  // An SR may collect more cash and confirm delivery on their own invoice;
  // cancelling and repricing stays with the office.
  const canRecordPayment = canManage || isOwnInvoice;

  return (
    <Card className="p-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            sale.status === 'DELIVERED'
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
              : sale.status === 'CANCELLED'
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                : 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
          }`}
        >
          {sale.status === 'CANCELLED' ? (
            <Ban size={18} strokeWidth={1.7} />
          ) : sale.status === 'DELIVERED' ? (
            <PackageCheck size={18} strokeWidth={1.7} />
          ) : (
            <Truck size={18} strokeWidth={1.7} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{sale.shopName}</p>
          <p className="truncate text-xs muted">
            {sale.invoiceNo} · {formatDate(sale.date)}
            {showSr ? ` · ${sale.srName}` : ''}
            {sale.area ? ` · ${sale.area}` : ''}
          </p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="tabular font-medium">{money(sale.total)}</p>
          <p className="tabular text-xs muted">
            {sale.due > 0 ? `${money(sale.due)} due` : 'fully paid'}
          </p>
        </div>
        <Badge tone={STATUS_TONE[sale.status]}>{sale.status}</Badge>
        <ChevronDown size={18} className={`shrink-0 muted transition ${expanded ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="space-y-4 px-5 py-4">
              <div className="table-wrap">
                <table className="table min-w-[440px]">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Rate</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="truncate">{item.productName}</td>
                        <td className="tabular text-right">{fmtNumber(item.qty)}</td>
                        <td className="tabular text-right">{money(item.rate)}</td>
                        <td className="tabular text-right font-medium">
                          {money(item.qty * item.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
                  <SumRow label="Discount" value={money(sale.discount)} />
                  <SumRow label="Invoice total" value={money(sale.total)} strong />
                  <SumRow label="Cash collected" value={money(sale.paid)} />
                  <SumRow label="Shop still owes" value={money(sale.due)} />
                </div>

                {sale.status !== 'CANCELLED' ? (
                  <div className="space-y-3">
                    {canRecordPayment ? (
                      <div className="flex items-end gap-2">
                        <Input
                          label="Update cash collected"
                          type="number"
                          min={0}
                          max={sale.total}
                          step="0.01"
                          value={payment}
                          onChange={(e) => setPayment(Number(e.target.value) || 0)}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          loading={busy}
                          disabled={payment === sale.paid}
                          onClick={() => patch({ paid: payment }, 'Payment recorded.')}
                          className="h-[42px]"
                        >
                          Save
                        </Button>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {sale.status === 'PENDING' && canRecordPayment ? (
                        <Button
                          size="sm"
                          variant="subtle"
                          icon={<PackageCheck size={14} />}
                          loading={busy}
                          onClick={() => patch({ status: 'DELIVERED' }, 'Marked as delivered.')}
                        >
                          Mark delivered
                        </Button>
                      ) : null}
                      {canManage ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Ban size={14} />}
                          loading={busy}
                          onClick={() =>
                            patch({ status: 'CANCELLED' }, 'Invoice cancelled, stock returned.')
                          }
                        >
                          Cancel invoice
                        </Button>
                      ) : null}
                    </div>

                    {sale.note ? <p className="text-sm muted">Note: {sale.note}</p> : null}
                  </div>
                ) : (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                    This invoice was cancelled. The goods went back to the rep’s stock and the value
                    is excluded from every total.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

function SumRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? 'font-medium' : 'muted'}>{label}</span>
      <span className={`tabular ${strong ? 'font-display font-semibold' : ''}`}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------ new sale */

function SaleModal({
  open,
  currentUser,
  canPickSr,
  srs,
  onClose,
  onSaved,
}: {
  open: boolean;
  currentUser: SafeUser | null;
  canPickSr: boolean;
  srs: SafeUser[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isSr = currentUser?.role === 'SR';
  const [srId, setSrId] = useState(isSr ? (currentUser?.id ?? '') : '');
  const [date, setDate] = useState(todayIso());
  const [shopName, setShopName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [area, setArea] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [status, setStatus] = useState<SaleStatus>('DELIVERED');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const effectiveSr = isSr ? currentUser?.id : srId;

  // The picker is limited to what the selling rep is actually carrying.
  const holdings = useResource<{ holdings: Holding[] }>(
    effectiveSr && !isSr && open ? `/api/users/${effectiveSr}` : null,
  );

  // A rep sells from their own van; the office sells on a rep's behalf, so it
  // reads that rep's holdings instead. Either way the picker only ever offers
  // stock that is genuinely available.
  const ownStock = useResource<{ holdings: Holding[] }>(isSr && open ? '/api/my/stock' : null);

  const products: PickableProduct[] = useMemo(() => {
    const rows = isSr ? (ownStock.data?.holdings ?? []) : (holdings.data?.holdings ?? []);
    return rows.map((h) => ({
      id: h.productId,
      sku: h.sku ?? '',
      name: h.name,
      unit: h.unit,
      srPrice: h.srPrice,
      marketPrice: h.marketPrice ?? h.srPrice,
      available: h.qty,
    }));
  }, [isSr, ownStock.data, holdings.data]);

  const subtotal = items.reduce((n, i) => n + i.qty * i.rate, 0);
  const total = Math.max(0, subtotal - discount);

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/sales', {
        ...(isSr ? {} : { srId }),
        date,
        shopName,
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        area: area || undefined,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, rate: i.rate })),
        discount,
        paid,
        status,
        note: note || undefined,
      });
      toast.success(`Invoice recorded — ${money(total)}.`);
      setShopName('');
      setCustomerName('');
      setCustomerPhone('');
      setItems([]);
      setDiscount(0);
      setPaid(0);
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not record the sale.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Record a sale"
      subtitle="নতুন বিক্রয়"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={save}
            loading={busy}
            disabled={!shopName || items.length === 0 || (!isSr && !srId) || paid > total}
          >
            Save invoice · {money(total)}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {canPickSr && !isSr ? (
          <Select
            label="Selling rep"
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
        ) : null}
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input
          label="Shop name"
          value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="Bismillah Store"
          required
        />
        <Input
          label="Area / bazar"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="Sadar Bazar"
        />
        <Input
          label="Contact person"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
        <Input
          label="Phone"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          placeholder="017…"
        />
      </div>

      <div className="mt-5">
        <p className="label">Products sold</p>
        {!isSr && !srId ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm muted">
            Pick the selling rep first — you can only invoice what they are carrying.
          </p>
        ) : products.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm muted">
            {isSr
              ? 'Your van is empty. Raise a demand and the office will load you up.'
              : 'This rep is not carrying any stock right now.'}
          </p>
        ) : (
          <LineItemEditor
            products={products}
            value={items}
            onChange={setItems}
            rateMode="sr"
            rateLabel="Rate"
            enforceAvailable
            availableLabel="in van"
          />
        )}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Input
          label="Discount"
          type="number"
          min={0}
          step="0.01"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value) || 0)}
        />
        <Input
          label="Cash collected now"
          type="number"
          min={0}
          max={total}
          step="0.01"
          value={paid}
          onChange={(e) => setPaid(Number(e.target.value) || 0)}
          error={paid > total ? 'More than the invoice total.' : undefined}
          hint={paid <= total ? `Shop will owe ${money(total - paid)}` : undefined}
        />
        <Select
          label="Delivery"
          value={status}
          onChange={(e) => setStatus(e.target.value as SaleStatus)}
        >
          <option value="DELIVERED">Delivered now</option>
          <option value="PENDING">Pending delivery</option>
        </Select>
      </div>

      <div className="mt-4">
        <Textarea label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>

      {items.length > 0 ? (
        <div className="mt-4 space-y-1.5 rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
          <SumRow label="Subtotal" value={money(subtotal)} />
          <SumRow label="Discount" value={money(discount)} />
          <SumRow label="Invoice total" value={money(total)} strong />
        </div>
      ) : null}
    </Modal>
  );
}
