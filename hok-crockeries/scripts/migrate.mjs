/**
 * Applies pending migrations to the database in DATABASE_URL.
 *
 * Runs as part of `npm run build`, so a Vercel deploy brings the schema up to
 * date before the app starts serving. With no DATABASE_URL it prints a note and
 * exits cleanly, because local development uses an embedded database that
 * migrates itself on first use.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const url =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!url) {
  console.log('[migrate] No DATABASE_URL set — skipping (local dev uses the embedded database).');
  process.exit(0);
}

const { neon } = await import('@neondatabase/serverless');
const sql = neon(url);

const LEDGER = '__hok_migrations';
const dir = path.resolve(process.cwd(), 'drizzle');

await sql(`CREATE TABLE IF NOT EXISTS ${LEDGER} (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);`);

const done = new Set((await sql(`SELECT name FROM ${LEDGER};`)).map((r) => r.name));
const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();

let applied = 0;
for (const file of files) {
  if (done.has(file)) continue;
  const body = await fs.readFile(path.join(dir, file), 'utf8');
  const statements = body
    .split('--> statement-breakpoint')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql(statement);
  }
  await sql(`INSERT INTO ${LEDGER} (name) VALUES ($1);`, [file]);
  console.log(`[migrate] applied ${file}`);
  applied += 1;
}

console.log(
  applied === 0
    ? `[migrate] Database already up to date (${files.length} migrations).`
    : `[migrate] Applied ${applied} migration(s).`,
);
