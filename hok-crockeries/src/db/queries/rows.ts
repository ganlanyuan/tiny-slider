import type { SQL } from 'drizzle-orm';

import type { Database } from '../connect';

/**
 * `db.execute` returns a driver-shaped result — an array for some drivers, an
 * object with `.rows` for others. This flattens both so query code never has to
 * care which driver is underneath.
 */
export async function rows<T>(db: Database, query: SQL): Promise<T[]> {
  const result = (await db.execute(query)) as unknown;
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object' && 'rows' in result) {
    return ((result as { rows: unknown[] }).rows ?? []) as T[];
  }
  return [];
}

export async function firstRow<T>(db: Database, query: SQL): Promise<T | undefined> {
  return (await rows<T>(db, query))[0];
}
