import type { Database } from './connect';

/**
 * Run work inside a database transaction.
 *
 * `Database` is a union of two driver types whose `transaction` signatures are
 * structurally different, so this narrows to the shared shape once, here,
 * rather than forcing every caller to cast. Both drivers roll back on a thrown
 * error, which is what makes "an invoice never exists without its line items"
 * a guarantee rather than a hope.
 *
 * The `Database` import is type-only, so this module stays free of the
 * server-only runtime and can be exercised directly by tests.
 */
/** The handle handed to transaction bodies. Same query surface, no nesting. */
export type Tx = Omit<Database, 'transaction'>;

export async function withTransaction<T>(
  db: Database,
  work: (tx: Tx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => work(tx as unknown as Tx));
}
