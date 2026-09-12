import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { Database } from './types';

const DATA_DIR = path.resolve(process.cwd(), process.env.DATA_DIR || '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function emptyDatabase(): Database {
  const now = new Date().toISOString();
  return {
    users: [],
    categories: [],
    products: [],
    stockEntries: [],
    assignments: [],
    returns: [],
    sales: [],
    demands: [],
    deposits: [],
    expenses: [],
    salaries: [],
    auditLogs: [],
    settings: {
      companyName: 'Hok Crockeries',
      companyNameBn: 'হক ক্রোকারিজ',
      tagline: 'Crockery & houseware distribution, run on real numbers.',
      address: 'Bangladesh',
      phone: '',
      email: '',
      currency: '৳',
      lowStockThreshold: 10,
      updatedAt: now,
    },
  };
}

/**
 * Every field of `Database` must exist even if the file on disk was written by
 * an older version of the app, so merge the parsed file over a fresh shell.
 */
function normalise(parsed: Partial<Database>): Database {
  const base = emptyDatabase();
  return {
    ...base,
    ...parsed,
    settings: { ...base.settings, ...(parsed.settings ?? {}) },
  };
}

/**
 * The JSON file is the single source of truth, so reads are cached in module
 * scope and every write goes through one promise chain. That keeps concurrent
 * request handlers from clobbering each other's changes within a process.
 */
let cache: Database | null = null;
let writeChain: Promise<unknown> = Promise.resolve();

async function loadFromDisk(): Promise<Database> {
  try {
    const raw = await fs.readFile(DB_FILE, 'utf8');
    return normalise(JSON.parse(raw) as Partial<Database>);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      const fresh = emptyDatabase();
      await persist(fresh);
      return fresh;
    }
    throw err;
  }
}

async function persist(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  // Write to a temp file first so a crash mid-write cannot truncate the db.
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
  await fs.rename(tmp, DB_FILE);
}

/** Read-only snapshot of the database. Do not mutate the returned object. */
export async function readDb(): Promise<Database> {
  if (!cache) cache = await loadFromDisk();
  return cache;
}

/**
 * Run `mutator` against the live database and persist the result. Mutations are
 * serialised, so the callback always sees the newest state.
 */
export async function writeDb<T>(mutator: (db: Database) => T | Promise<T>): Promise<T> {
  const run = writeChain.then(async () => {
    const db = cache ?? (cache = await loadFromDisk());
    const result = await mutator(db);
    await persist(db);
    return result;
  });
  // Keep the chain alive even when this particular mutation rejects.
  writeChain = run.catch(() => undefined);
  return run;
}

/** Replace the whole database (used by the seeder and the reset endpoint). */
export async function replaceDb(next: Database): Promise<void> {
  await writeDb((db) => {
    Object.assign(db, next);
  });
}

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

/** Sequential-looking document numbers, e.g. INV-20260912-0007. */
export function nextDocNumber(prefix: string, existing: string[]): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const head = `${prefix}-${stamp}-`;
  const highest = existing
    .filter((no) => no.startsWith(head))
    .map((no) => Number.parseInt(no.slice(head.length), 10))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0);
  return `${head}${String(highest + 1).padStart(4, '0')}`;
}

export const dbFilePath = DB_FILE;
