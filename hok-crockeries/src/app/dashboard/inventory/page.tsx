'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Info, Lock, PackagePlus, Plus, Truck, Warehouse } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Input,
  Modal,
  SectionTitle,
  TableSkeleton,
  Textarea,
} from '@/components/ui';
import { LineItemEditor, type LineItem, type PickableProduct } from '@/components/dashboard/line-items';
import { MonthPicker } from '@/components/dashboard/month-picker';
import { PageTransition } from '@/components/motion/reveal';
import { useWorkspace } from '@/components/workspace';
import { useResource } from '@/hooks/useResource';
import { apiPost, qs } from '@/lib/client';
import { formatDate, number as fmtNumber, todayIso } from '@/lib/utils';

interface EntryItem {
  productId: string;
  productName: string;
  qty: number;
  unitCost?: number;
}

interface Entry {
  id: string;
  invoiceNo: string;
  supplier: string;
  date: string;
  note?: string;
  units: number;
  lines: number;
  items: EntryItem[];
  total?: number;
  paid?: number;
  due?: number;
  extraCost?: number;
}

interface EntriesResponse {
  entries: Entry[];
  showCost: boolean;
}

interface ProductsResponse {
  products: (PickableProduct & { stock: number; withSrs: number })[];
}

interface MeResponse {
  capabilities: string[];
}

export default function InventoryPage() {
  const { money } = useWorkspace();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const me = useResource<MeResponse>('/api/auth/me');
  const canManage = me.data?.capabilities.includes('inventory.manage') ?? false;

  const { data, error, initial, reload } = useResource<EntriesResponse>(
    `/api/stock-entries${qs({ month })}`,
  );
  const productsRes = useResource<ProductsResponse>('/api/products');

  const entries = data?.entries ?? [];
  const showCost = data?.showCost ?? false;

  const summary = useMemo(
    () => ({
      entries: entries.length,
      units: entries.reduce((n, e) => n + e.units, 0),
      value: entries.reduce((n, e) => n + (e.total ?? 0), 0),
      due: entries.reduce((n, e) => n + (e.due ?? 0), 0),
    }),
    [entries],
  );

  return (
    <PageTransition>
      <SectionTitle
        title="Store intake"
        subtitle="Goods received into the central store."
        action={
          <div className="flex items-center gap-2">
            <MonthPicker value={month} onChange={setMonth} />
            {canManage ? (
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setOpen(true)}>
                Receive stock
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Intake entries" value={fmtNumber(summary.entries)} icon={<PackagePlus size={15} />} />
        <Tile label="Units received" value={fmtNumber(summary.units)} icon={<Warehouse size={15} />} />
        {showCost ? (
          <>
            <Tile label="Purchase value" value={money(summary.value)} icon={<Lock size={15} />} accent />
            <Tile label="Unpaid to suppliers" value={money(summary.due)} icon={<Truck size={15} />} />
          </>
        ) : (
          <Tile
            label="Purchase value"
            value="Owner only"
            icon={<Lock size={15} />}
            muted
            className="sm:col-span-2"
          />
        )}
      </div>

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={5} cols={5} />
        </Card>
      ) : entries.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<PackagePlus size={22} strokeWidth={1.5} />}
            title="No stock received this month"
            description="Record a supplier delivery and every unit becomes available to hand out on a challan."
            action={
              canManage ? (
                <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>
                  Receive stock
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Card key={entry.id} className="p-0">
              <button
                type="button"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                  <PackagePlus size={18} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{entry.supplier}</p>
                  <p className="truncate text-xs muted">
                    {entry.invoiceNo} · {formatDate(entry.date)} · {entry.lines} lines
                  </p>
                </div>
                <div className="hidden shrink-0 text-right sm:block">
                  <p className="tabular font-medium">{fmtNumber(entry.units)} units</p>
                  {showCost ? (
                    <p className="tabular text-xs muted">{money(entry.total)}</p>
                  ) : null}
                </div>
                {showCost && (entry.due ?? 0) > 0 ? (
                  <Badge tone="amber">{money(entry.due)} due</Badge>
                ) : null}
                <ChevronDown
                  size={18}
                  className={`shrink-0 muted transition ${expanded === entry.id ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded === entry.id ? (
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
                              {showCost ? <th className="text-right">Unit cost</th> : null}
                              {showCost ? <th className="text-right">Amount</th> : null}
                            </tr>
                          </thead>
                          <tbody>
                            {entry.items.map((item) => (
                              <tr key={item.productId}>
                                <td className="truncate">{item.productName}</td>
                                <td className="tabular text-right">{fmtNumber(item.qty)}</td>
                                {showCost ? (
                                  <td className="tabular text-right">{money(item.unitCost)}</td>
                                ) : null}
                                {showCost ? (
                                  <td className="tabular text-right font-medium">
                                    {money(item.qty * (item.unitCost ?? 0))}
                                  </td>
                                ) : null}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {entry.note ? (
                        <p className="mt-3 text-sm muted">Note: {entry.note}</p>
                      ) : null}
                      {showCost && entry.extraCost ? (
                        <p className="mt-2 text-sm muted">
                          Freight and handling: {money(entry.extraCost)}
                        </p>
                      ) : null}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      )}

      {canManage ? (
        <ReceiveModal
          open={open}
          showCost={showCost}
          products={productsRes.data?.products ?? []}
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            void reload();
            void productsRes.reload();
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
  accent,
  muted,
  className,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={`card flex items-center gap-3 p-3.5 ${className ?? ''}`}>
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          accent
            ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10'
            : 'bg-ink-100 muted dark:bg-white/5'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs muted">{label}</p>
        <p className={`tabular truncate font-display font-semibold ${muted ? 'muted' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function ReceiveModal({
  open,
  showCost,
  products,
  onClose,
  onSaved,
}: {
  open: boolean;
  showCost: boolean;
  products: PickableProduct[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { money } = useWorkspace();
  const [supplier, setSupplier] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState<LineItem[]>([]);
  const [extraCost, setExtraCost] = useState(0);
  const [paid, setPaid] = useState(0);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const goodsValue = items.reduce((n, i) => n + i.qty * i.rate, 0);
  const total = goodsValue + extraCost;
  const units = items.reduce((n, i) => n + i.qty, 0);

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/stock-entries', {
        supplier,
        invoiceNo: invoiceNo || undefined,
        date,
        items: items.map((i) => ({
          productId: i.productId,
          qty: i.qty,
          // A manager's figure is discarded server-side; sending zero is honest.
          unitCost: showCost ? i.rate : 0,
        })),
        extraCost: showCost ? extraCost : 0,
        paid: showCost ? paid : 0,
        note: note || undefined,
      });
      toast.success(`${units} units added to the store.`);
      setSupplier('');
      setInvoiceNo('');
      setItems([]);
      setExtraCost(0);
      setPaid(0);
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the intake.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Receive stock into the store"
      subtitle="Record a supplier delivery"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!supplier || items.length === 0}>
            Add {units} units
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          label="Supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Shinepukur Ceramics"
          required
        />
        <Input
          label="Supplier invoice no."
          value={invoiceNo}
          onChange={(e) => setInvoiceNo(e.target.value)}
          placeholder="Auto if left blank"
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {!showCost ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
          <Info size={14} className="mt-0.5 shrink-0" />
          Record the quantities that arrived. Purchase prices are entered by the owner, so no cost
          column is shown here.
        </p>
      ) : null}

      <div className="mt-5">
        <p className="label">Products received</p>
        <LineItemEditor
          products={products}
          value={items}
          onChange={setItems}
          showRate={showCost}
          rateMode="cost"
          rateLabel="Unit cost"
        />
      </div>

      {showCost ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Freight & handling"
            type="number"
            min={0}
            step="0.01"
            value={extraCost}
            onChange={(e) => setExtraCost(Number(e.target.value) || 0)}
            hint="Added to the purchase total"
          />
          <Input
            label="Paid to supplier"
            type="number"
            min={0}
            step="0.01"
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value) || 0)}
            hint={`Invoice total ${money(total)}`}
          />
        </div>
      ) : null}

      <div className="mt-4">
        <Textarea
          label="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anything worth remembering about this delivery."
        />
      </div>

      {showCost && items.length > 0 ? (
        <div className="mt-4 space-y-1.5 rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
          <Line label="Goods value" value={money(goodsValue)} />
          <Line label="Freight & handling" value={money(extraCost)} />
          <Line label="Invoice total" value={money(total)} strong />
          <Line label="Still owed" value={money(Math.max(0, total - paid))} />
        </div>
      ) : null}
    </Modal>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={strong ? 'font-medium' : 'muted'}>{label}</span>
      <span className={`tabular ${strong ? 'font-display font-semibold' : ''}`}>{value}</span>
    </div>
  );
}
