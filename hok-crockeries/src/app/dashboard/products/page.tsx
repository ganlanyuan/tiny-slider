'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Boxes,
  Download,
  Filter,
  LayoutGrid,
  Lock,
  Package,
  Pencil,
  Plus,
  Search,
  Table2,
  Tag,
  Upload,
  X,
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
import { PageTransition } from '@/components/motion/reveal';
import { ImportPanel } from './import-panel';
import { useResource } from '@/hooks/useResource';
import { apiDelete, apiPatch, apiPost, qs } from '@/lib/client';
import type { Category } from '@/lib/types';
import { downloadBlob, money, number as fmtNumber, toCsv } from '@/lib/utils';

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  nameBn?: string;
  categoryId: string;
  unit: string;
  costPrice?: number;
  srPrice: number;
  marketPrice: number;
  stock: number;
  withSrs: number;
  sold: number;
  lowStockThreshold: number;
  brand?: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
}

interface ProductsResponse {
  products: ProductRow[];
  categories: Category[];
  total: number;
}

interface MeResponse {
  user: { role: string } | null;
  capabilities: string[];
}

const BLANK = {
  sku: '',
  name: '',
  nameBn: '',
  categoryId: '',
  unit: 'pcs',
  costPrice: 0,
  srPrice: 0,
  marketPrice: 0,
  lowStockThreshold: 10,
  brand: '',
  description: '',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);

  const me = useResource<MeResponse>('/api/auth/me');
  const canManage = me.data?.capabilities.includes('product.manage') ?? false;
  const canImport = me.data?.capabilities.includes('product.import') ?? false;
  const canSeeCost = me.data?.capabilities.includes('cost.view') ?? false;

  const query = qs({
    q: search,
    category,
    stock: stockFilter,
    includeInactive: includeInactive ? 1 : '',
  });
  const { data, error, initial, reload } = useResource<ProductsResponse>(`/api/products${query}`);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];
  const categoryName = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories],
  );

  const summary = useMemo(
    () => ({
      count: products.length,
      inStore: products.reduce((n, p) => n + p.stock, 0),
      withSrs: products.reduce((n, p) => n + p.withSrs, 0),
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
      valueAtSr: products.reduce((n, p) => n + (p.stock + p.withSrs) * p.srPrice, 0),
    }),
    [products],
  );

  const exportJson = () => {
    // Export exactly what this viewer is allowed to see — cost included only
    // for the owner, so an exported file cannot leak the purchase price.
    const rows = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      nameBn: p.nameBn ?? '',
      category: categoryName.get(p.categoryId) ?? '',
      unit: p.unit,
      ...(canSeeCost ? { costPrice: p.costPrice ?? 0 } : {}),
      srPrice: p.srPrice,
      marketPrice: p.marketPrice,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      brand: p.brand ?? '',
      description: p.description ?? '',
    }));
    downloadBlob(JSON.stringify(rows, null, 2), 'hok-crockeries-products.json');
    toast.success(`Exported ${rows.length} products as JSON.`);
  };

  const exportCsv = () => {
    const rows = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      category: categoryName.get(p.categoryId) ?? '',
      unit: p.unit,
      ...(canSeeCost ? { costPrice: p.costPrice ?? 0 } : {}),
      srPrice: p.srPrice,
      marketPrice: p.marketPrice,
      inStore: p.stock,
      withSrs: p.withSrs,
      sold: p.sold,
    }));
    downloadBlob(toCsv(rows), 'hok-crockeries-products.csv', 'text/csv');
    toast.success('Exported as CSV.');
  };

  const hasFilters = Boolean(search || category || stockFilter || includeInactive);

  return (
    <PageTransition>
      <SectionTitle
        title="পণ্য তালিকা"
        subtitle="Catalogue, prices and live stock position."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" icon={<Download size={15} />} onClick={exportJson}>
              JSON
            </Button>
            <Button variant="ghost" size="sm" icon={<Download size={15} />} onClick={exportCsv}>
              CSV
            </Button>
            {canImport ? (
              <Button
                variant="subtle"
                size="sm"
                icon={<Upload size={15} />}
                onClick={() => setImporting(true)}
              >
                Import list
              </Button>
            ) : null}
            {canManage ? (
              <Button size="sm" icon={<Plus size={15} />} onClick={() => setCreating(true)}>
                New product
              </Button>
            ) : null}
          </div>
        }
      />

      {/* summary strip */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MiniTile label="Products" value={fmtNumber(summary.count)} icon={<Package size={15} />} />
        <MiniTile label="In store" value={fmtNumber(summary.inStore)} icon={<Boxes size={15} />} />
        <MiniTile label="With SRs" value={fmtNumber(summary.withSrs)} icon={<Tag size={15} />} />
        <MiniTile
          label="Low / out"
          value={`${summary.lowStock} / ${summary.outOfStock}`}
          icon={<AlertTriangle size={15} />}
          tone={summary.lowStock + summary.outOfStock > 0 ? 'warn' : undefined}
        />
        <MiniTile
          label="Stock value (SR rate)"
          value={money(summary.valueAtSr)}
          icon={<Boxes size={15} />}
        />
      </div>

      {/* filters */}
      <Card className="mb-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-[220px] flex-1">
            <label className="label">Search</label>
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-[34px] muted"
            />
            <input
              className="field pl-10"
              placeholder="Name, Bangla name, SKU or brand…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            wrapperClassName="w-full sm:w-48"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Stock"
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            wrapperClassName="w-full sm:w-40"
          >
            <option value="">Any level</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </Select>

          <label className="flex h-[42px] cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            Show retired
          </label>

          <div className="surface flex h-[42px] items-center rounded-xl border p-1">
            <button
              type="button"
              onClick={() => setView('table')}
              aria-label="Table view"
              className={`rounded-lg p-1.5 transition ${view === 'table' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10' : 'muted'}`}
            >
              <Table2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              aria-label="Grid view"
              className={`rounded-lg p-1.5 transition ${view === 'grid' ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10' : 'muted'}`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<X size={14} />}
              onClick={() => {
                setSearch('');
                setCategory('');
                setStockFilter('');
                setIncludeInactive(false);
              }}
            >
              Clear
            </Button>
          ) : null}
        </div>
      </Card>

      {/* list */}
      {error ? (
        <Card className="p-0">
          <ErrorState message={error} onRetry={() => void reload()} />
        </Card>
      ) : initial ? (
        <Card className="p-0">
          <TableSkeleton rows={6} cols={6} />
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-0">
          <EmptyState
            icon={<Filter size={22} strokeWidth={1.5} />}
            title={hasFilters ? 'Nothing matches those filters' : 'No products yet'}
            description={
              hasFilters
                ? 'Try a different search or clear the filters.'
                : 'Import your price list as JSON or CSV, or add the first product by hand.'
            }
            action={
              canImport && !hasFilters ? (
                <Button icon={<Upload size={15} />} onClick={() => setImporting(true)}>
                  Import product list
                </Button>
              ) : null
            }
          />
        </Card>
      ) : view === 'table' ? (
        <div className="table-wrap">
          <table className="table min-w-[860px]">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                {canSeeCost ? (
                  <th className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <Lock size={11} /> Cost
                    </span>
                  </th>
                ) : null}
                <th className="text-right">SR rate</th>
                <th className="text-right">Market</th>
                <th className="text-right">In store</th>
                <th className="text-right">With SRs</th>
                <th className="text-right">Sold</th>
                {canManage ? <th className="w-12" /> : null}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.active ? '' : 'opacity-55'}>
                  <td>
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="truncate text-xs muted">
                      {p.sku} · per {p.unit}
                      {p.nameBn ? ` · ${p.nameBn}` : ''}
                    </p>
                  </td>
                  <td className="text-sm muted">{categoryName.get(p.categoryId) ?? '—'}</td>
                  {canSeeCost ? (
                    <td className="tabular text-right text-brand-700 dark:text-brand-300">
                      {money(p.costPrice)}
                    </td>
                  ) : null}
                  <td className="tabular text-right font-medium">{money(p.srPrice)}</td>
                  <td className="tabular text-right muted">{money(p.marketPrice)}</td>
                  <td className="text-right">
                    <StockPill stock={p.stock} threshold={p.lowStockThreshold} unit={p.unit} />
                  </td>
                  <td className="tabular text-right muted">{fmtNumber(p.withSrs)}</td>
                  <td className="tabular text-right muted">{fmtNumber(p.sold)}</td>
                  {canManage ? (
                    <td>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        aria-label={`Edit ${p.name}`}
                        className="rounded-lg p-1.5 muted transition hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-white/5"
                      >
                        <Pencil size={15} />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className={`card p-4 transition hover:shadow-lift ${p.active ? '' : 'opacity-55'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs muted">{p.sku}</p>
                </div>
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    aria-label={`Edit ${p.name}`}
                    className="shrink-0 rounded-lg p-1.5 muted transition hover:text-brand-600"
                  >
                    <Pencil size={14} />
                  </button>
                ) : null}
              </div>
              <p className="mt-2 text-xs muted">{categoryName.get(p.categoryId) ?? '—'}</p>
              <dl className="mt-3 space-y-1.5 text-sm">
                {canSeeCost ? (
                  <Row label="Cost" value={money(p.costPrice)} accent />
                ) : null}
                <Row label="SR rate" value={money(p.srPrice)} />
                <Row label="Market" value={money(p.marketPrice)} muted />
              </dl>
              <div className="mt-3 flex items-center justify-between border-t pt-3">
                <StockPill stock={p.stock} threshold={p.lowStockThreshold} unit={p.unit} />
                <span className="text-xs muted">{fmtNumber(p.withSrs)} with SRs</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* modals */}
      {canManage ? (
        <ProductModal
          open={creating || Boolean(editing)}
          product={editing}
          categories={categories}
          canSeeCost={canSeeCost}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            void reload();
          }}
        />
      ) : null}

      {canImport ? (
        <ImportPanel
          open={importing}
          onClose={() => setImporting(false)}
          onImported={() => {
            setImporting(false);
            void reload();
          }}
        />
      ) : null}
    </PageTransition>
  );
}

function Row({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: string;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs muted">{label}</dt>
      <dd
        className={`tabular text-sm ${
          accent ? 'font-medium text-brand-700 dark:text-brand-300' : muted ? 'muted' : 'font-medium'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function StockPill({
  stock,
  threshold,
  unit,
}: {
  stock: number;
  threshold: number;
  unit: string;
}) {
  const tone =
    stock <= 0 ? 'rose' : stock <= threshold ? 'amber' : ('green' as const);
  return (
    <Badge tone={tone}>
      {fmtNumber(stock)} {unit}
    </Badge>
  );
}

function MiniTile({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: 'warn';
}) {
  return (
    <div className="card flex items-center gap-3 p-3.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          tone === 'warn'
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

/* --------------------------------------------------------- product form */

function ProductModal({
  open,
  product,
  categories,
  canSeeCost,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: ProductRow | null;
  categories: Category[];
  canSeeCost: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK });
  const [busy, setBusy] = useState(false);
  const [lastId, setLastId] = useState<string | null>(null);

  // Reset the form whenever the modal opens on a different product.
  const targetId = product?.id ?? 'new';
  if (open && targetId !== lastId) {
    setLastId(targetId);
    setForm(
      product
        ? {
            sku: product.sku,
            name: product.name,
            nameBn: product.nameBn ?? '',
            categoryId: product.categoryId,
            unit: product.unit,
            costPrice: product.costPrice ?? 0,
            srPrice: product.srPrice,
            marketPrice: product.marketPrice,
            lowStockThreshold: product.lowStockThreshold,
            brand: product.brand ?? '',
            description: product.description ?? '',
          }
        : { ...BLANK, categoryId: categories[0]?.id ?? '' },
    );
  }
  if (!open && lastId !== null) setLastId(null);

  const set = (patch: Partial<typeof BLANK>) => setForm((f) => ({ ...f, ...patch }));

  async function save() {
    setBusy(true);
    try {
      const payload = {
        ...form,
        nameBn: form.nameBn || undefined,
        brand: form.brand || undefined,
        description: form.description || undefined,
        ...(canSeeCost ? {} : { costPrice: undefined }),
      };
      if (product) {
        await apiPatch(`/api/products/${product.id}`, payload);
        toast.success(`${form.name} updated.`);
      } else {
        await apiPost('/api/products', payload);
        toast.success(`${form.name} added to the catalogue.`);
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the product.');
    } finally {
      setBusy(false);
    }
  }

  async function retire() {
    if (!product) return;
    setBusy(true);
    try {
      const { result } = await apiDelete<{ result: string }>(`/api/products/${product.id}`);
      toast.success(
        result === 'archived'
          ? 'Product retired — its history is kept intact.'
          : 'Product deleted.',
      );
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not remove the product.');
    } finally {
      setBusy(false);
    }
  }

  const margin =
    canSeeCost && form.costPrice > 0
      ? ((form.srPrice - form.costPrice) / form.srPrice) * 100
      : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={product ? 'Edit product' : 'New product'}
      subtitle={product ? product.sku : 'Add an item to the catalogue'}
      footer={
        <>
          {product ? (
            <Button variant="danger" onClick={retire} disabled={busy} className="mr-auto">
              Retire
            </Button>
          ) : null}
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} loading={busy} disabled={!form.name || !form.sku}>
            {product ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Product name"
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Dinner Plate 10&quot;"
          required
        />
        <Input
          label="Bangla name"
          value={form.nameBn}
          onChange={(e) => set({ nameBn: e.target.value })}
          placeholder="ডিনার প্লেট ১০ ইঞ্চি"
        />
        <Input
          label="SKU / code"
          value={form.sku}
          onChange={(e) => set({ sku: e.target.value })}
          placeholder="HC-1001"
          required
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(e) => set({ categoryId: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input
          label="Unit"
          value={form.unit}
          onChange={(e) => set({ unit: e.target.value })}
          hint="pcs, dozen, set, carton…"
        />
        <Input
          label="Brand"
          value={form.brand}
          onChange={(e) => set({ brand: e.target.value })}
          placeholder="Monno"
        />
      </div>

      <div className="mt-5 rounded-2xl border p-4">
        <p className="mb-3 text-sm font-medium">Pricing</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {canSeeCost ? (
            <Input
              label="Purchase price (owner only)"
              type="number"
              min={0}
              step="0.01"
              value={form.costPrice}
              onChange={(e) => set({ costPrice: Number(e.target.value) })}
              hint="Never sent to an SR or dealer"
            />
          ) : null}
          <Input
            label="SR selling rate"
            type="number"
            min={0}
            step="0.01"
            value={form.srPrice}
            onChange={(e) => set({ srPrice: Number(e.target.value) })}
            hint="What reps charge shops"
          />
          <Input
            label="Market price"
            type="number"
            min={0}
            step="0.01"
            value={form.marketPrice}
            onChange={(e) => set({ marketPrice: Number(e.target.value) })}
            hint="Suggested retail"
          />
        </div>
        {margin !== null ? (
          <p className="mt-3 text-xs muted">
            Margin on the SR rate:{' '}
            <span
              className={`font-medium ${margin < 10 ? 'text-rose-600' : 'text-emerald-600'}`}
            >
              {margin.toFixed(1)}%
            </span>
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          label="Low stock alert at"
          type="number"
          min={0}
          value={form.lowStockThreshold}
          onChange={(e) => set({ lowStockThreshold: Number(e.target.value) })}
          hint="Warn when the store falls to this level"
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Any notes about packing, sizes or variants."
        />
      </div>

      <p className="mt-4 text-xs muted">
        Stock is never edited here — it moves through store intake, SR challans and sales, so the
        ledger always reconciles.
      </p>
    </Modal>
  );
}
