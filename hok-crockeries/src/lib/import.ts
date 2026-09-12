/**
 * Turns a pasted price list into product rows.
 *
 * Real-world lists arrive as JSON, CSV, TSV or a copy-pasted spreadsheet, with
 * column names in English or Bangla. Everything is funnelled into one row shape
 * before validation so the API only ever sees clean objects.
 */

export type RawRow = Record<string, unknown>;

/** Header aliases -> canonical field. Compared lowercased, punctuation stripped. */
const FIELD_ALIASES: Record<string, string[]> = {
  sku: ['sku', 'code', 'productcode', 'itemcode', 'id', 'barcode', 'কোড'],
  name: ['name', 'productname', 'product', 'item', 'itemname', 'title', 'পণ্য', 'পণ্যেরনাম', 'নাম'],
  category: ['category', 'categoryname', 'type', 'group', 'ক্যাটাগরি', 'বিভাগ'],
  categoryId: ['categoryid'],
  unit: ['unit', 'uom', 'measure', 'একক'],
  costPrice: [
    'costprice', 'cost', 'purchaseprice', 'purchase', 'buyprice', 'buyingprice',
    'kenadam', 'ক্রয়মূল্য', 'কেনাদাম', 'কেনামূল্য',
  ],
  srPrice: [
    'srprice', 'sr', 'srrate', 'dealerprice', 'wholesale', 'wholesaleprice',
    'salesprice', 'sellprice', 'বিক্রয়মূল্য', 'এসআরমূল্য', 'এসআররেট',
  ],
  marketPrice: [
    'marketprice', 'market', 'mrp', 'retail', 'retailprice', 'maxprice',
    'বাজারমূল্য', 'খুচরামূল্য',
  ],
  lowStockThreshold: ['lowstockthreshold', 'reorder', 'reorderlevel', 'minstock', 'minimum'],
  imageUrl: ['imageurl', 'image', 'photo', 'img', 'picture', 'ছবি'],
  description: ['description', 'details', 'note', 'remarks', 'বিবরণ'],
  brand: ['brand', 'company', 'manufacturer', 'ব্র্যান্ড', 'কোম্পানি'],
};

const CANONICAL_BY_ALIAS = new Map<string, string>();
for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
  CANONICAL_BY_ALIAS.set(normaliseKey(field), field);
  for (const alias of aliases) CANONICAL_BY_ALIAS.set(normaliseKey(alias), field);
}

function normaliseKey(key: string): string {
  return key
    .toLowerCase()
    .replace(/[\s_\-./\\()[\]{}:;,'"?#*+%]/g, '')
    .replace(/taka|tk|৳|bdt/g, '')
    .trim();
}

/** "১২৫", "1,250.50 tk" or "Tk. 99" -> 125 / 1250.5 / 99 */
export function parseNumberLike(value: unknown): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value !== 'string') return undefined;

  const bengaliDigits = '০১২৩৪৫৬৭৮৯';
  const ascii = value.replace(/[০-৯]/g, (d) => String(bengaliDigits.indexOf(d)));
  // Drop thousands separators, then pull out the first real number. Matching a
  // digit-anchored pattern (rather than stripping non-numeric characters) keeps
  // the dot in "Tk. 99" from being read as a decimal point.
  const withoutSeparators = ascii.replace(/,/g, '');
  const match = withoutSeparators.match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;

  const n = Number.parseFloat(match[0]);
  if (!Number.isFinite(n)) return undefined;

  // Only an explicit leading minus makes it negative, so a code like "HC-1001"
  // is never mistaken for a negative price.
  const negative = /^\s*-/.test(withoutSeparators);
  return negative ? -n : n;
}

/** Rename a row's keys to canonical field names, dropping unknown columns. */
export function mapRow(row: RawRow): RawRow {
  const out: RawRow = {};
  for (const [key, value] of Object.entries(row)) {
    const canonical = CANONICAL_BY_ALIAS.get(normaliseKey(key));
    if (!canonical) continue;
    if (value === null || value === undefined || value === '') continue;
    if (['costPrice', 'srPrice', 'marketPrice', 'lowStockThreshold'].includes(canonical)) {
      const n = parseNumberLike(value);
      if (n !== undefined) out[canonical] = n;
    } else {
      out[canonical] = typeof value === 'string' ? value.trim() : value;
    }
  }
  return out;
}

/** Split a delimited line, honouring double-quoted cells. */
function splitLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      cells.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells.map((c) => c.trim());
}

export function parseDelimited(text: string): RawRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const delimiter = (() => {
    const head = lines[0];
    const counts = [
      { d: '\t', n: head.split('\t').length },
      { d: ',', n: head.split(',').length },
      { d: ';', n: head.split(';').length },
      { d: '|', n: head.split('|').length },
    ];
    return counts.sort((a, b) => b.n - a.n)[0].d;
  })();

  const headers = splitLine(lines[0], delimiter);
  return lines.slice(1).map((line) => {
    const cells = splitLine(line, delimiter);
    const row: RawRow = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? '';
    });
    return row;
  });
}

export interface ParseResult {
  rows: RawRow[];
  format: 'json' | 'delimited' | 'unknown';
  /** Column headers that were present but not recognised. */
  ignoredColumns: string[];
  error?: string;
}

/**
 * Accepts a JSON array, a JSON object wrapping an array (`{products: [...]}`),
 * or CSV/TSV text, and returns canonical rows.
 */
export function parseProductFile(text: string): ParseResult {
  const trimmed = text.trim();
  if (!trimmed) return { rows: [], format: 'unknown', ignoredColumns: [], error: 'File is empty.' };

  let raw: RawRow[] | null = null;
  let format: ParseResult['format'] = 'unknown';

  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      const list = Array.isArray(parsed)
        ? parsed
        : (['products', 'items', 'data', 'rows'] as const)
            .map((k) => (parsed as Record<string, unknown>)[k])
            .find(Array.isArray);
      if (Array.isArray(list)) {
        raw = list.filter((r): r is RawRow => typeof r === 'object' && r !== null);
        format = 'json';
      }
    } catch (err) {
      return {
        rows: [],
        format: 'json',
        ignoredColumns: [],
        error: `Could not read the JSON: ${(err as Error).message}`,
      };
    }
  }

  if (!raw) {
    raw = parseDelimited(trimmed);
    format = 'delimited';
  }

  if (!raw || raw.length === 0) {
    return { rows: [], format, ignoredColumns: [], error: 'No data rows were found.' };
  }

  const seen = new Set<string>();
  const ignored = new Set<string>();
  for (const row of raw) {
    for (const key of Object.keys(row)) {
      if (seen.has(key)) continue;
      seen.add(key);
      if (!CANONICAL_BY_ALIAS.has(normaliseKey(key))) ignored.add(key);
    }
  }

  const rows = raw.map(mapRow).filter((r) => typeof r.name === 'string' && r.name.length > 0);
  if (rows.length === 0) {
    return {
      rows: [],
      format,
      ignoredColumns: [...ignored],
      error:
        'No row had a recognisable product name. Make sure one column is called "name" (or "product", "item", "পণ্যের নাম").',
    };
  }

  return { rows, format, ignoredColumns: [...ignored] };
}

export const RECOGNISED_COLUMNS = Object.keys(FIELD_ALIASES);
