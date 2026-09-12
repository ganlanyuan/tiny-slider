import type { Database } from '../src/lib/types';

/**
 * A blank database for tests. Mirrors `src/lib/db.ts`'s shell without pulling
 * in the `server-only` module, which cannot be imported from a plain test run.
 */
export function emptyDatabase(): Database {
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
      tagline: '',
      address: '',
      phone: '',
      email: '',
      currency: '৳',
      lowStockThreshold: 10,
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  };
}
