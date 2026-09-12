import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AuthError } from './auth';

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/** Postgres unique-violation, surfaced as a readable message per constraint. */
const UNIQUE_MESSAGES: Record<string, string> = {
  users_email_idx: 'That email address is already registered.',
  organizations_slug_idx: 'That workspace address is already taken.',
  products_org_sku_idx: 'A product with that SKU already exists.',
  categories_org_slug_idx: 'That category already exists.',
  salary_user_month_idx: 'This person has already been paid for that month.',
  sales_org_no_idx: 'That invoice number is already in use.',
  assignments_org_no_idx: 'That challan number is already in use.',
  stock_entries_org_no_idx: 'That purchase invoice number is already in use.',
  invitations_token_idx: 'That invitation link is no longer valid.',
};

interface PgError {
  code?: string;
  constraint?: string;
  constraint_name?: string;
  detail?: string;
  message?: string;
}

/**
 * Drizzle wraps driver errors, so the Postgres error code sits on `cause`
 * (sometimes nested twice). Walk the chain to find the row that actually
 * carries a SQLSTATE code.
 */
function findPgError(err: unknown, depth = 0): PgError | null {
  if (!err || typeof err !== 'object' || depth > 4) return null;
  const candidate = err as PgError & { cause?: unknown };
  if (typeof candidate.code === 'string' && /^\d{5}$/.test(candidate.code)) return candidate;
  return findPgError(candidate.cause, depth + 1);
}

function describeDbError(err: unknown): { message: string; status: number } | null {
  const e = findPgError(err);
  if (!e) return null;

  if (e.code === '23505') {
    const haystack = `${e.constraint ?? ''} ${e.constraint_name ?? ''} ${e.detail ?? ''} ${e.message ?? ''}`;
    const known = Object.entries(UNIQUE_MESSAGES).find(([key]) => haystack.includes(key));
    return { message: known?.[1] ?? 'That record already exists.', status: 409 };
  }
  if (e.code === '23503') {
    return {
      message: 'That record is still referenced by other data and cannot be removed.',
      status: 409,
    };
  }
  if (e.code === '23514' || e.code === '22P02' || e.code === '22003') {
    return { message: 'One of the values sent is out of range or the wrong type.', status: 422 };
  }
  return null;
}

/**
 * Wrap a route handler so auth, validation and database errors become clean
 * JSON instead of a 500 with a stack trace.
 */
export function route<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
): (...args: Args) => Promise<NextResponse> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (err) {
      if (err instanceof AuthError) return fail(err.message, err.status);
      if (err instanceof ZodError) {
        const first = err.issues[0];
        const where = first?.path.join('.');
        return fail(where ? `${where}: ${first.message}` : (first?.message ?? 'Invalid input.'), 422, {
          issues: err.issues,
        });
      }
      const db = describeDbError(err);
      if (db) return fail(db.message, db.status);

      // A driver message can carry SQL and parameter values, so it is logged
      // for the operator and never returned to the caller.
      console.error('[api]', err);
      return fail('Something went wrong on our side. Please try again.', 500);
    }
  };
}

export async function parseJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new AuthError('Request body must be valid JSON.', 400);
  }
}

/** A short, human-friendly document number: INV-20260912-0007. */
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
