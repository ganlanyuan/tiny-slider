import { sql } from 'drizzle-orm';

import type { Database } from './connect';

// Deliberately not marked `server-only`: the only runtime caller is the
// server-only db client, and keeping this module plain lets the migration
// tests exercise it directly.

/**
 * Applies the SQL files in `drizzle/` in order, once each.
 *
 * Drizzle's own migrator needs a driver-specific adapter; this runner works
 * against any Drizzle client that can execute raw SQL, which is what lets the
 * same code bring up an embedded PGlite database in development and a Neon
 * database in production.
 */

const LEDGER = '__hok_migrations';

async function appliedMigrations(db: Database): Promise<Set<string>> {
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS ${LEDGER} (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `));
  // Drivers disagree on the result shape: some return the rows array directly,
  // others wrap it in `{ rows }`. Normalise both.
  const result: unknown = await db.execute(sql.raw(`SELECT name FROM ${LEDGER};`));
  const rows = (
    Array.isArray(result) ? result : ((result as { rows?: unknown[] })?.rows ?? [])
  ) as { name: string }[];
  return new Set(rows.map((r) => r.name));
}

export interface MigrationReport {
  applied: string[];
  skipped: string[];
}

export async function ensureSchema(db: Database, dir?: string): Promise<MigrationReport> {
  const { promises: fs } = await import('node:fs');
  const path = await import('node:path');

  const migrationsDir = dir ?? path.resolve(process.cwd(), 'drizzle');
  let files: string[];
  try {
    files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();
  } catch {
    throw new Error(
      `No migrations found at ${migrationsDir}. Run "npm run db:generate" to create them.`,
    );
  }

  const done = await appliedMigrations(db);
  const report: MigrationReport = { applied: [], skipped: [] };

  for (const file of files) {
    if (done.has(file)) {
      report.skipped.push(file);
      continue;
    }
    const body = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    // drizzle-kit separates statements with this marker; splitting on it keeps
    // functions and dollar-quoted bodies intact, which a naive ";" split would not.
    const statements = body
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }
    await db.execute(
      sql.raw(`INSERT INTO ${LEDGER} (name) VALUES ('${file.replace(/'/g, "''")}');`),
    );
    report.applied.push(file);
  }

  return report;
}
