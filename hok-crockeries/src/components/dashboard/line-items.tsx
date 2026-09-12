'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Trash2 } from 'lucide-react';

import { money, number as fmtNumber } from '@/lib/utils';

export interface PickableProduct {
  id: string;
  sku: string;
  name: string;
  nameBn?: string;
  unit: string;
  srPrice: number;
  marketPrice: number;
  costPrice?: number;
  /** Units the picker should treat as the ceiling for this line. */
  available?: number;
}

export interface LineItem {
  productId: string;
  qty: number;
  /** Unit price. Not used by demand lines, which are quantity-only. */
  rate: number;
}

/**
 * Search-and-add product lines with quantity, rate and a live total.
 * Shared by purchase entry, SR challan, sale invoice and demand forms so the
 * three price columns always behave the same way.
 */
export function LineItemEditor({
  products,
  value,
  onChange,
  rateLabel = 'Rate',
  rateMode = 'sr',
  showRate = true,
  enforceAvailable = false,
  availableLabel = 'in store',
}: {
  products: PickableProduct[];
  value: LineItem[];
  onChange: (items: LineItem[]) => void;
  rateLabel?: string;
  /** Which price seeds a new line. */
  rateMode?: 'sr' | 'market' | 'cost' | 'zero';
  showRate?: boolean;
  /** Block quantities above the product's `available` figure. */
  enforceAvailable?: boolean;
  availableLabel?: string;
}) {
  const [search, setSearch] = useState('');
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const seedRate = (p: PickableProduct): number => {
    if (rateMode === 'market') return p.marketPrice;
    if (rateMode === 'cost') return p.costPrice ?? 0;
    if (rateMode === 'zero') return 0;
    return p.srPrice;
  };

  const results = useMemo(() => {
    const chosen = new Set(value.map((v) => v.productId));
    const q = search.trim().toLowerCase();
    return products
      .filter((p) => !chosen.has(p.id))
      .filter(
        (p) =>
          !q ||
          [p.name, p.nameBn, p.sku].filter(Boolean).some((f) => String(f).toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [products, search, value]);

  const add = (product: PickableProduct) => {
    onChange([...value, { productId: product.id, qty: 1, rate: seedRate(product) }]);
    setSearch('');
  };

  const update = (index: number, patch: Partial<LineItem>) => {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  const total = value.reduce((sum, item) => sum + item.qty * (showRate ? item.rate : 0), 0);
  const units = value.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="space-y-3">
      {/* picker */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 muted"
        />
        <input
          className="field pl-10"
          placeholder="Search a product by name or SKU…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <AnimatePresence>
          {search.trim() && results.length > 0 ? (
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="surface absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border p-1 shadow-lift scrollbar-thin"
            >
              {results.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => add(p)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-brand-50 dark:hover:bg-white/5"
                  >
                    <Plus size={14} className="shrink-0 text-brand-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="block truncate text-xs muted">
                        {p.sku} · per {p.unit}
                        {enforceAvailable
                          ? ` · ${fmtNumber(p.available ?? 0)} ${availableLabel}`
                          : ''}
                      </span>
                    </span>
                    {showRate ? (
                      <span className="tabular shrink-0 text-xs muted">{money(seedRate(p))}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </div>

      {/* lines */}
      {value.length === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm muted">
          No products added yet. Search above to add the first line.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table min-w-[560px]">
            <thead>
              <tr>
                <th>Product</th>
                <th className="w-28 text-right">Qty</th>
                {showRate ? <th className="w-32 text-right">{rateLabel}</th> : null}
                {showRate ? <th className="w-32 text-right">Amount</th> : null}
                <th className="w-12" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {value.map((item, index) => {
                  const product = byId.get(item.productId);
                  const max = product?.available;
                  const over =
                    enforceAvailable && max !== undefined && item.qty > max;
                  return (
                    <motion.tr
                      key={item.productId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td>
                        <p className="truncate font-medium">{product?.name ?? 'Unknown product'}</p>
                        <p className="text-xs muted">
                          {product?.sku} · per {product?.unit}
                          {enforceAvailable && max !== undefined
                            ? ` · ${fmtNumber(max)} ${availableLabel}`
                            : ''}
                        </p>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={item.qty}
                          onChange={(e) =>
                            update(index, { qty: Math.max(1, Number(e.target.value) || 1) })
                          }
                          className={`field tabular w-full py-1.5 text-right ${
                            over ? 'border-rose-400 text-rose-600' : ''
                          }`}
                        />
                        {over ? (
                          <p className="mt-1 text-right text-[11px] text-rose-600">
                            only {fmtNumber(max ?? 0)} {availableLabel}
                          </p>
                        ) : null}
                      </td>
                      {showRate ? (
                        <td>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.rate}
                            onChange={(e) =>
                              update(index, { rate: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="field tabular w-full py-1.5 text-right"
                          />
                        </td>
                      ) : null}
                      {showRate ? (
                        <td className="tabular text-right font-medium">
                          {money(item.qty * item.rate)}
                        </td>
                      ) : null}
                      <td>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          aria-label="Remove line"
                          className="rounded-lg p-1.5 muted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {value.length > 0 ? (
        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-3 text-sm dark:bg-white/5">
          <span className="muted">
            {value.length} line{value.length > 1 ? 's' : ''} · {fmtNumber(units)} units
          </span>
          {showRate ? (
            <span className="tabular font-display text-base font-semibold">{money(total)}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
