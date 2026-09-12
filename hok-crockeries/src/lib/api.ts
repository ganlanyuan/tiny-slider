import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { AuthError } from './auth';

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/**
 * Wrap a route handler so thrown auth/validation errors turn into clean JSON
 * instead of a 500 with a stack trace.
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
        return fail(
          where ? `${where}: ${first.message}` : (first?.message ?? 'Invalid input.'),
          422,
          { issues: err.issues },
        );
      }
      console.error('[api]', err);
      const message = err instanceof Error ? err.message : 'Unexpected server error.';
      return fail(message, 500);
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
