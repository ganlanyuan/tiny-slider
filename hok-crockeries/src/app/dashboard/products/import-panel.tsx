'use client';

import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  Info,
  RefreshCw,
  Upload,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge, Button, Modal, Select, Textarea } from '@/components/ui';
import { apiPost } from '@/lib/client';
import { parseProductFile, RECOGNISED_COLUMNS, type RawRow } from '@/lib/import';
import { money } from '@/lib/utils';

interface RowOutcome {
  row: number;
  name: string;
  sku: string;
  action: 'create' | 'update' | 'skip';
  reason?: string;
}

interface ImportResult {
  results: RowOutcome[];
  summary: { created: number; updated: number; skipped: number; newCategories: number };
  dryRun: boolean;
}

const SAMPLE = `[
  {
    "sku": "HC-2001",
    "name": "Dinner Plate 10\\"",
    "nameBn": "ডিনার প্লেট ১০ ইঞ্চি",
    "category": "Plates & Bowls",
    "unit": "dozen",
    "costPrice": 540,
    "srPrice": 720,
    "marketPrice": 950,
    "brand": "Monno"
  }
]`;

/**
 * Three-step importer: paste or drop a file, preview exactly what will happen
 * (a dry run against the real data), then commit.
 */
export function ImportPanel({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'upsert' | 'insert'>('upsert');
  const [rows, setRows] = useState<RawRow[] | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [ignored, setIgnored] = useState<string[]>([]);
  const [format, setFormat] = useState<string>('');
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const reset = () => {
    setText('');
    setRows(null);
    setParseError(null);
    setIgnored([]);
    setPreview(null);
    setFormat('');
  };

  const close = () => {
    reset();
    onClose();
  };

  function handleText(value: string) {
    setText(value);
    setPreview(null);
    if (!value.trim()) {
      setRows(null);
      setParseError(null);
      setIgnored([]);
      return;
    }
    const result = parseProductFile(value);
    setRows(result.rows.length ? result.rows : null);
    setParseError(result.error ?? null);
    setIgnored(result.ignoredColumns);
    setFormat(result.format);
  }

  async function readFile(file: File) {
    const content = await file.text();
    handleText(content);
    toast.success(`Loaded ${file.name}`);
  }

  async function runPreview() {
    if (!rows) return;
    setBusy(true);
    try {
      const result = await apiPost<ImportResult>('/api/products/import', {
        rows,
        mode,
        dryRun: true,
      });
      setPreview(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not read that list.');
    } finally {
      setBusy(false);
    }
  }

  async function commit() {
    if (!rows) return;
    setBusy(true);
    try {
      const result = await apiPost<ImportResult>('/api/products/import', {
        rows,
        mode,
        dryRun: false,
      });
      toast.success(
        `${result.summary.created} added, ${result.summary.updated} updated.` +
          (result.summary.newCategories
            ? ` ${result.summary.newCategories} new categories created.`
            : ''),
      );
      reset();
      onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      wide
      title="Import product list"
      subtitle="Paste JSON or CSV, preview what will change, then commit."
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          {preview ? (
            <>
              <Button variant="ghost" icon={<RefreshCw size={15} />} onClick={() => setPreview(null)}>
                Back to edit
              </Button>
              <Button onClick={commit} loading={busy} icon={<Upload size={15} />}>
                Import {preview.summary.created + preview.summary.updated} products
              </Button>
            </>
          ) : (
            <Button onClick={runPreview} loading={busy} disabled={!rows}>
              Preview changes
            </Button>
          )}
        </>
      }
    >
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="grid gap-3 sm:grid-cols-4">
              <SummaryTile label="Will be added" value={preview.summary.created} tone="green" />
              <SummaryTile label="Will be updated" value={preview.summary.updated} tone="brand" />
              <SummaryTile label="Skipped" value={preview.summary.skipped} tone="amber" />
              <SummaryTile
                label="New categories"
                value={preview.summary.newCategories}
                tone="violet"
              />
            </div>

            <p className="mt-4 flex items-start gap-2 rounded-xl bg-brand-50 px-3 py-2.5 text-xs leading-relaxed text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
              <Info size={14} className="mt-0.5 shrink-0" />
              This is a preview — nothing has been written yet. Opening stock from a price list is
              recorded as a figure only; real stock still has to come through a store intake entry
              so the ledger stays honest.
            </p>

            <div className="table-wrap mt-4 max-h-80 overflow-y-auto">
              <table className="table min-w-[520px]">
                <thead>
                  <tr>
                    <th className="w-12">#</th>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.results.map((r) => (
                    <tr key={`${r.row}-${r.sku}`}>
                      <td className="tabular muted">{r.row}</td>
                      <td className="truncate">{r.name}</td>
                      <td className="tabular text-xs muted">{r.sku}</td>
                      <td>
                        <Badge
                          tone={
                            r.action === 'create' ? 'green' : r.action === 'update' ? 'brand' : 'amber'
                          }
                        >
                          {r.action}
                        </Badge>
                        {r.reason ? <p className="mt-1 text-xs muted">{r.reason}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* drop zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) void readFile(file);
              }}
              className={`rounded-2xl border-2 border-dashed px-5 py-8 text-center transition ${
                dragging
                  ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10'
                  : 'border-ink-200 dark:border-white/10'
              }`}
            >
              <div className="flex justify-center gap-2 muted">
                <FileJson size={22} strokeWidth={1.5} />
                <FileSpreadsheet size={22} strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-sm font-medium">Drop a .json or .csv file here</p>
              <p className="mt-1 text-xs muted">or paste the list into the box below</p>
              <input
                ref={fileInput}
                type="file"
                accept=".json,.csv,.tsv,.txt,application/json,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void readFile(file);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                onClick={() => fileInput.current?.click()}
              >
                Choose a file
              </Button>
            </div>

            <Textarea
              label="Or paste JSON / CSV"
              value={text}
              onChange={(e) => handleText(e.target.value)}
              placeholder={SAMPLE}
              className="min-h-[180px] font-mono text-xs"
            />

            {parseError ? (
              <p className="flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                <XCircle size={15} className="mt-0.5 shrink-0" />
                {parseError}
              </p>
            ) : null}

            {rows ? (
              <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <p className="flex items-center gap-2 font-medium">
                  <CheckCircle2 size={15} />
                  Read {rows.length} rows from {format === 'json' ? 'JSON' : 'a delimited file'}.
                </p>
                {ignored.length > 0 ? (
                  <p className="mt-1 text-xs opacity-80">
                    Ignored unrecognised columns: {ignored.slice(0, 6).join(', ')}
                    {ignored.length > 6 ? `, +${ignored.length - 6} more` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}

            {rows && rows.length > 0 ? (
              <div className="table-wrap max-h-56 overflow-y-auto">
                <table className="table min-w-[520px]">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th className="text-right">SR rate</th>
                      <th className="text-right">Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((r, i) => (
                      <tr key={i}>
                        <td className="truncate">{String(r.name ?? '')}</td>
                        <td className="text-xs muted">{String(r.category ?? '—')}</td>
                        <td className="tabular text-right">
                          {r.srPrice !== undefined ? money(Number(r.srPrice)) : '—'}
                        </td>
                        <td className="tabular text-right muted">
                          {r.marketPrice !== undefined ? money(Number(r.marketPrice)) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}

            <Select
              label="When a product already exists"
              value={mode}
              onChange={(e) => setMode(e.target.value as 'upsert' | 'insert')}
            >
              <option value="upsert">Update it with the new values (recommended)</option>
              <option value="insert">Skip it and only add new products</option>
            </Select>

            <details className="rounded-xl border p-4 text-sm">
              <summary className="cursor-pointer font-medium">
                Which columns are recognised?
              </summary>
              <p className="mt-3 leading-relaxed muted">
                Column names are matched loosely, in English or Bangla — spaces, underscores and
                case are ignored. For example <code>Purchase Price</code>, <code>cost</code> and{' '}
                <code>ক্রয়মূল্য</code> all map to the purchase price. Bengali digits are converted
                automatically.
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {RECOGNISED_COLUMNS.map((c) => (
                  <Badge key={c} tone="slate">
                    {c}
                  </Badge>
                ))}
              </div>
              <p className="mt-3 text-xs muted">
                Only <code>name</code> is required. Anything missing falls back to a sensible
                default.
              </p>
            </details>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'brand' | 'amber' | 'violet';
}) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  };
  return (
    <div className={`rounded-xl px-3 py-3 text-center ${tones[tone]}`}>
      <p className="tabular font-display text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-xs opacity-80">{label}</p>
    </div>
  );
}
