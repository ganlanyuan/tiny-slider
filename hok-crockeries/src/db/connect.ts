import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { neonConfig, Pool } from '@neondatabase/serverless';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import ws from 'ws';

import { schema } from './schema';

/**
 * Builds the database client. One schema, two drivers:
 *
 *  - Production (Vercel): `DATABASE_URL` points at Neon, over the pooled
 *    WebSocket driver. The HTTP driver would be marginally faster but cannot
 *    run interactive transactions, and a stock ledger must never record an
 *    invoice without its line items.
 *  - Local development, tests and scripts: no URL, so an embedded Postgres
 *    (PGlite) runs in-process and persists under `.data/pg`. Nothing to install.
 *
 * Both speak the same Postgres dialect and both support transactions, so a
 * query that works locally works in production.
 *
 * This module is deliberately free of the `server-only` marker: the seed script
 * and the integration tests need to open a connection outside Next.
 */

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export type DbKind = 'neon' | 'pglite';

// Node 22 has a global WebSocket, but older runtimes do not — point the driver
// at the `ws` polyfill so the connection works on every Vercel Node version.
if (!globalThis.WebSocket) {
  neonConfig.webSocketConstructor = ws;
}

export function connectionString(): string | undefined {
  const url =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;
  return url && url.trim().length > 0 ? url.trim() : undefined;
}

export interface Connection {
  db: Database;
  kind: DbKind;
  /** Present only for the embedded driver, so tests can shut it down. */
  close?: () => Promise<void>;
}

export async function createConnection(options: { dataDir?: string } = {}): Promise<Connection> {
  const url = connectionString();

  if (url) {
    const pool = new Pool({ connectionString: url });
    return {
      db: drizzleNeon(pool, { schema }) as unknown as Database,
      kind: 'neon',
      close: () => pool.end(),
    };
  }

  // The embedded database keeps its data in one directory on one machine, so
  // it cannot work on Vercel or anywhere else that runs several instances.
  // A single-server self-host is a legitimate use, so it is allowed with an
  // explicit opt-in rather than silently.
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_EMBEDDED_DB !== '1') {
    throw new Error(
      'DATABASE_URL is not set. A production deployment needs a Postgres connection string — ' +
        'add a Neon (or any Postgres) database and set DATABASE_URL. ' +
        'To run on a single self-hosted server using the embedded database instead, ' +
        'set ALLOW_EMBEDDED_DB=1.',
    );
  }

  // Dynamic import so the WASM build is never pulled into a serverless bundle.
  const { PGlite } = await import('@electric-sql/pglite');
  const path = await import('node:path');
  // An in-memory database (dataDir omitted and PGLITE_DIR unset) is what the
  // integration tests use, so each run starts from a clean schema.
  const dir =
    options.dataDir ??
    (process.env.PGLITE_DIR === 'memory://'
      ? undefined
      : path.resolve(process.cwd(), process.env.PGLITE_DIR || '.data/pg'));

  let releaseLock: (() => void) | undefined;
  if (dir) {
    // PGlite only creates the leaf directory, so make sure its parents exist.
    const { promises: fs } = await import('node:fs');
    await fs.mkdir(dir, { recursive: true });
    releaseLock = await acquireDirectoryLock(dir);
  }

  const client = dir ? new PGlite(dir) : new PGlite();
  await client.waitReady;
  return {
    db: drizzlePglite(client, { schema }) as unknown as Database,
    kind: 'pglite',
    close: async () => {
      await client.close();
      releaseLock?.();
    },
  };
}

/**
 * Advisory lock for the embedded database directory.
 *
 * PGlite runs Postgres inside one process and does not coordinate between
 * them, so two Node processes opening the same directory each keep their own
 * page cache and quietly diverge — a seed run against a live dev server
 * appears to succeed and then is invisible to the app. Refusing up front, with
 * the name of the process holding it, is far kinder than the silence.
 */
/** Directories this process already has open, to catch the in-process case. */
const openDirectories = new Set<string>();

async function acquireDirectoryLock(dir: string): Promise<() => void> {
  const { promises: fs } = await import('node:fs');
  const nodePath = await import('node:path');
  const lockFile = nodePath.join(dir, '.hok-db-lock');

  // Opening the same directory twice inside one process deadlocks on Postgres's
  // own directory lock, with no error and no timeout. Refuse it outright.
  if (openDirectories.has(dir)) {
    throw new Error(
      `The local database at ${dir} is already open in this process. ` +
        'Reuse the existing connection instead of opening a second one.',
    );
  }

  try {
    const raw = await fs.readFile(lockFile, 'utf8');
    const held = JSON.parse(raw) as { pid: number; startedAt: string };
    // A crashed process leaves its lock behind, so only a live pid counts.
    let alive = false;
    try {
      process.kill(held.pid, 0);
      alive = held.pid !== process.pid;
    } catch {
      alive = false;
    }
    if (alive) {
      throw new Error(
        `The local database at ${dir} is already open by process ${held.pid} ` +
          `(since ${held.startedAt}). The embedded database allows one process at a time — ` +
          'stop the dev server before running a script like `npm run seed`, or point ' +
          'DATABASE_URL at a Postgres server to run both at once.',
      );
    }
    await fs.rm(lockFile, { force: true });
  } catch (err) {
    // A missing or unreadable lock file just means the directory is free.
    if (err instanceof Error && err.message.startsWith('The local database at')) throw err;
  }

  await fs.writeFile(
    lockFile,
    JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }),
    'utf8',
  );
  openDirectories.add(dir);

  // Loaded eagerly so the exit handler, which cannot await, has it to hand.
  const { rmSync } = await import('node:fs');
  const release = () => {
    openDirectories.delete(dir);
    try {
      rmSync(lockFile, { force: true });
    } catch {
      // Best effort — a stale lock is detected by pid on the next open.
    }
  };

  process.once('exit', release);
  return release;
}
