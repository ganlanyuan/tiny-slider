import type { Config } from 'drizzle-kit';

/**
 * Used by `npm run db:generate` to produce SQL migrations, and by
 * `npm run db:push` to apply the schema straight to a Postgres URL.
 */
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? '',
  },
  strict: true,
  verbose: true,
} satisfies Config;
