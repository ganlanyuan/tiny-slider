'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ClipboardList,
  Flame,
  PackageCheck,
  Plus,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Modal,
  SectionTitle,
  Select,
  TableSkeleton,
  Textarea,
} from '@/components/ui';
import { LineItemEditor, type LineItem, type PickableProduct } from '@/components/dashboard/line-items';
import { PageTransition } from '@/components/motion/reveal';
import { useResource } from '@/hooks/useResource';
import { apiPatch, apiPost, qs } from '@/lib/client';
import type { DemandStatus, SafeUser } from '@/lib/types';
import { formatDate, number as fmtNumber } from '@/lib/utils';

interface DemandRow {
  id: string;
  srId: string;
  srName: string;
  date: string;
  status: DemandStatus;
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  note?: string;
  units: number;
  handledAt?: string;
  items: {
    productId: string;
    productName: string;
    unit: string;
    qty: number;
    inStore: number;
    shortBy: number;
  }[];
}

interface DemandsResponse {
  demands: DemandRow[];
  counts: { pending: number; approved: number; fulfilled: number };
}

interface MeResponse {
  user: SafeUser | null;
  capabilities: string[];
}

const STATUS_TONE: Record<DemandStatus, 'amber' | 'brand' | 'green' | 'rose'> = {
  PENDING: 'amber',
  APPROVED: 'brand',
  FULFILLED: 'green',
  REJECTED: 'rose',
};

export default function DemandsPage() {
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const me = useResource<MeResponse>('/api/auth/me');
  const canManage = me.data?.capabilities.includes('demand.manage') ?? false;
  const canCreate = me.data?.capabilities.includes('demand.create') ?? false;
  const isSr = me.data?.user?.role === 'SR';

  const { data, error, initial, reload } = useResource<DemandsResponse>(
    `/api/demands${qs({ status })}`,
  );
  const productsRes = useResource<{ products: (PickableProduct & { stock: number })[] }>(
    '/api/products',
  );

  const demands = data?.demands ?? [];
  const unfillable = useMemo(
    () => demands.filter((d) => d.status === 'PENDING' && d.items.some((i) => i.shortBy > 0)).length,
    [demands],
  );

  return (
    <PageTransition>
      <SectionTitle
        title="Demand"
        subtitle={
          isSr
            ? 'Ask the office for the stock your shops are waiting on.'
            : 'What the field is asking for, and what the store can actually fill.'
        }
        action={
          canCreate || canManage ? (
            <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
              Raise demand
            </Button>
          ) : null
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Waiting" value={data?.counts.pending ?? 0} icon={<ClipboardList size={15} />} />
        <Tile label="Approved" value={data?.counts.approved ?? 0} icon={<Check size={15} />} />
        <Tile label="Fulfilled" value={data?.counts.fulfilled ?? 0} icon={<PackageCheck size={15} />} />
        <Tile
          label="Can’t fill from store"
          value={unfillable}
          icon={<AlertTriangle size={15} />}
          warn={unfillable > 0}
        />
      </div>

      <Card className="mb-5 p-4">
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          wrapperClassName="w-full sm:w-52"
        >
          <option value="">All requests</option>
          <option value="PENDING">Waiting</option>
          <option value="APPROVED">Approved</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="REJECTED">Rejected</option>
        </Select>
      </Card>

      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={4} cols={4} />
        </Card>
      ) : demands.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<ClipboardList size={22} strokeWidth={1.5} />}
            title="No demand recorded"
            description={
              isSr
                ? 'When shops ask for something you don’t have, raise it here so the office can send it.'
                : 'Reps have not asked for anything with these filters.'
            }
            action={
              canCreate || canManage ? (
                <Button icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                  Raise demand
                </Button>
              ) : null
            }
          />
        </Card>
      ) : (
        <div className="space-y-2">
          {demands.map((demand) => (
            <DemandCard
              key={demand.id}
              demand={demand}
              expanded={expanded === demand.id}
              canManage={canManage}
              showSr={!isSr}
              onToggle={() => setExpanded(expanded === demand.id ? null : demand.id)}
              onChanged={() => void reload()}
            />
          ))}
        </div>
      )}

      <DemandModal
        open={creating}
        isSr={isSr}
        products={productsRes.data?.products ?? []}
        onClose={() => setCreating(false)}
        onSaved={() => {
          setCreating(false);
          void reload();
        }}
      />
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
  value: number;
  icon: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          warn
            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
            : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs muted">{label}</p>
        <p className="tabular truncate font-display font-semibold">{fmtNumber(value)}</p>
      </div>
    </div>
  );
}

function DemandCard({
  demand,
  expanded,
  canManage,
  showSr,
  onToggle,
  onChanged,
}: {
  demand: DemandRow;
  expanded: boolean;
  canManage: boolean;
  showSr: boolean;
  onToggle: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const short = demand.items.filter((i) => i.shortBy > 0).length;

  async function setStatus(status: DemandStatus, message: string) {
    setBusy(true);
    try {
      await apiPatch(`/api/demands/${demand.id}`, { status });
      toast.success(message);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-0">
      <button type="button" onClick={onToggle} className="flex w-full items-center gap-4 px-5 py-4 text-left">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
            demand.priority === 'HIGH'
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
              : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10'
          }`}
        >
          {demand.priority === 'HIGH' ? (
            <Flame size={18} strokeWidth={1.7} />
          ) : (
            <ClipboardList size={18} strokeWidth={1.7} />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {showSr ? demand.srName : `${demand.items.length} products requested`}
          </p>
          <p className="truncate text-xs muted">
            {formatDate(demand.date)} · {fmtNumber(demand.units)} units
            {demand.priority === 'HIGH' ? ' · urgent' : ''}
          </p>
        </div>
        {short > 0 && demand.status === 'PENDING' ? (
          <Badge tone="rose">{short} short</Badge>
        ) : null}
        <Badge tone={STATUS_TONE[demand.status]}>{demand.status}</Badge>
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
                <table className="table min-w-[460px]">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Asked for</th>
                      <th className="text-right">In store</th>
                      <th className="text-right">Short by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demand.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="truncate">{item.productName}</td>
                        <td className="tabular text-right font-medium">
                          {fmtNumber(item.qty)} {item.unit}
                        </td>
                        <td className="tabular text-right muted">{fmtNumber(item.inStore)}</td>
                        <td className="tabular text-right">
                          {item.shortBy > 0 ? (
                            <span className="font-medium text-rose-600 dark:text-rose-400">
                              {fmtNumber(item.shortBy)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400">covered</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {demand.note ? <p className="text-sm muted">“{demand.note}”</p> : null}

              {canManage && demand.status !== 'FULFILLED' && demand.status !== 'REJECTED' ? (
                <div className="flex flex-wrap gap-2">
                  {demand.status === 'PENDING' ? (
                    <Button
                      size="sm"
                      variant="subtle"
                      icon={<Check size={14} />}
                      loading={busy}
                      onClick={() => setStatus('APPROVED', 'Request approved.')}
                    >
                      Approve
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="subtle"
                    icon={<PackageCheck size={14} />}
                    loading={busy}
                    onClick={() =>
                      setStatus('FULFILLED', 'Marked fulfilled — issue a challan to send the stock.')
                    }
                  >
                    Mark fulfilled
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<X size={14} />}
                    loading={busy}
                    onClick={() => setStatus('REJECTED', 'Request rejected.')}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}

              {demand.status === 'FULFILLED' ? (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Fulfilled {demand.handledAt ? formatDate(demand.handledAt) : ''}. The stock moves
                  on a challan, which is what actually changes the ledger.
                </p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}

function DemandModal({
  open,
  isSr,
  products,
  onClose,
  onSaved,
}: {
  open: boolean;
  isSr: boolean;
  products: (PickableProduct & { stock: number })[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [priority, setPriority] = useState<'LOW' | 'NORMAL' | 'HIGH'>('NORMAL');
  const [note, setNote] = useState('');
  const [srId, setSrId] = useState('');
  const [busy, setBusy] = useState(false);

  const srsRes = useResource<{ users: SafeUser[] }>(!isSr && open ? '/api/users?role=SR' : null);
  const srs = srsRes.data?.users?.filter((u) => u.active) ?? [];

  async function save() {
    setBusy(true);
    try {
      await apiPost('/api/demands', {
        ...(isSr ? {} : { srId }),
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        priority,
        note: note || undefined,
      });
      toast.success('Demand sent to the office.');
      setItems([]);
      setNote('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send the request.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title="Raise a demand"
      subtitle="Ask the office for stock you need"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={items.length === 0 || (!isSr && !srId)}>
            Send request
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {!isSr ? (
          <Select label="On behalf of" value={srId} onChange={(e) => setSrId(e.target.value)}>
            <option value="">Choose a rep…</option>
            {srs.map((sr) => (
              <option key={sr.id} value={sr.id}>
                {sr.name}
              </option>
            ))}
          </Select>
        ) : null}
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'LOW' | 'NORMAL' | 'HIGH')}
        >
          <option value="LOW">Low — whenever convenient</option>
          <option value="NORMAL">Normal</option>
          <option value="HIGH">Urgent — shops are waiting</option>
        </Select>
      </div>

      <div className="mt-5">
        <p className="label">Products you need</p>
        <LineItemEditor products={products} value={items} onChange={setItems} showRate={false} />
      </div>

      <div className="mt-4">
        <Textarea
          label="Why do you need it?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Two shops booked in advance, festival demand rising…"
        />
      </div>
    </Modal>
  );
}
