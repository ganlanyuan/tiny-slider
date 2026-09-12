import assert from 'node:assert/strict';
import test from 'node:test';

import { mapRow, parseDelimited, parseNumberLike, parseProductFile } from '../src/lib/import';

test('numbers survive currency symbols, separators and Bengali digits', () => {
  assert.equal(parseNumberLike('৳ 1,250.50'), 1250.5);
  assert.equal(parseNumberLike('1250'), 1250);
  assert.equal(parseNumberLike(1250), 1250);
  assert.equal(parseNumberLike('১২৫০'), 1250, 'Bengali digits');
  assert.equal(parseNumberLike('৮০০ টাকা'), 800);
  assert.equal(parseNumberLike('Tk. 99'), 99);
  assert.equal(parseNumberLike(''), undefined);
  assert.equal(parseNumberLike('abc'), undefined);
  assert.equal(parseNumberLike(Number.NaN), undefined);
});

test('column names map loosely, in English or Bangla', () => {
  const row = mapRow({
    'Product Name': ' Dinner Plate ',
    'Purchase Price': '540',
    'SR Rate': '720',
    MRP: '950',
    'ক্রয়মূল্য': '999',
    Category: 'Plates',
    rubbish: 'ignored',
  });
  assert.equal(row.name, 'Dinner Plate', 'trimmed');
  assert.equal(row.srPrice, 720);
  assert.equal(row.marketPrice, 950);
  assert.equal(row.category, 'Plates');
  assert.equal('rubbish' in row, false, 'unknown columns are dropped');
});

test('CSV parsing honours quoted cells containing commas', () => {
  const rows = parseDelimited('name,srPrice\n"Plate, 10 inch",720');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, 'Plate, 10 inch');
  assert.equal(rows[0].srPrice, '720');
});

test('a tab-separated paste is detected without being told', () => {
  const result = parseProductFile('Item\tSR Rate\nBowl\t510');
  assert.equal(result.format, 'delimited');
  assert.equal(result.rows[0].name, 'Bowl');
  assert.equal(result.rows[0].srPrice, 510);
});

test('a bare JSON array is read', () => {
  const result = parseProductFile('[{"name":"Mug","srPrice":640}]');
  assert.equal(result.format, 'json');
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].srPrice, 640);
});

test('a JSON object wrapping the array is read too', () => {
  for (const key of ['products', 'items', 'data', 'rows']) {
    const result = parseProductFile(`{"${key}":[{"name":"Mug"}]}`);
    assert.equal(result.rows.length, 1, `wrapper key ${key}`);
  }
});

test('rows without a usable name are rejected with an explanation', () => {
  const result = parseProductFile('a,b\n1,2');
  assert.equal(result.rows.length, 0);
  assert.match(result.error ?? '', /product name/i);
});

test('malformed JSON reports the parse failure rather than silently falling back', () => {
  const result = parseProductFile('{ not json');
  assert.equal(result.rows.length, 0);
  assert.match(result.error ?? '', /Could not read the JSON/);
});

test('an empty file is reported as empty', () => {
  assert.match(parseProductFile('   ').error ?? '', /empty/i);
});

test('unrecognised columns are surfaced so the user can see what was skipped', () => {
  const result = parseProductFile('name,srPrice,warehouse_bin,supplier_ref\nMug,640,A4,XY');
  assert.deepEqual(result.ignoredColumns.sort(), ['supplier_ref', 'warehouse_bin']);
});

test('rows missing a name are dropped while good rows are kept', () => {
  const result = parseProductFile('name,srPrice\nMug,640\n,999\nBowl,510');
  assert.deepEqual(result.rows.map((r) => r.name), ['Mug', 'Bowl']);
});

test('a stray dot in a currency prefix is not read as a decimal point', () => {
  // "Tk. 99" used to parse as 0.99, quietly under-pricing an imported row.
  assert.equal(parseNumberLike('Tk. 99'), 99);
  assert.equal(parseNumberLike('Rs. 1,250'), 1250);
  assert.equal(parseNumberLike('BDT. 45.50'), 45.5);
});

test('a product code is never mistaken for a negative number', () => {
  assert.equal(parseNumberLike('HC-1001'), 1001);
  assert.equal(parseNumberLike('-250'), -250);
  assert.equal(parseNumberLike(' -250'), -250);
});
