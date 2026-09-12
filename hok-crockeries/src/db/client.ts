import 'server-only';

import { createConnection, type Connection, type Database, type DbKind } from './connect';

export type { Database, DbKind };

/**
 * The app's shared database handle.
 *
 * Cached on `globalThis` because Next's dev server re-evaluates modules on every
 * hot reload, and a second embedded-Postgres instance on the same directory
 * would fail to take the lock.
 */

declare global {
  // eslint-disable-next-line no-var
  var __hokDb: Connection | undefined;
}

let pending: Promise<Connection> | null = null;

export async function getDb(): Promise<Database> {
  if (globalThis.__hokDb) return globalThis.__hokDb.db;
  if (!pending) {
    pending = createConnection().then(async (connection) => {
      // An embedded database starts empty, so bring the schema up on first use.
      // A managed database is migrated by `npm run build` instead.
      if (connection.kind === 'pglite') {
        const { ensureSchema } = await import('./bootstrap');
        await ensureSchema(connection.db);
      }
      globalThis.__hokDb = connection;
      return connection;
    });
    pending.catch(() => {
      pending = null;
    });
  }
  return (await pending).db;
}

export async function getDbKind(): Promise<DbKind> {
  await getDb();
  return globalThis.__hokDb!.kind;
}
