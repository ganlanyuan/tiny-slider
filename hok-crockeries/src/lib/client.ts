'use client';

export interface ApiError extends Error {
  status: number;
  issues?: unknown;
}

/**
 * Thin wrapper over fetch that unwraps the `{ ok, data }` envelope every API
 * route returns and turns a failure into a throwable with a readable message.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  });

  let payload: { ok?: boolean; data?: T; error?: string; issues?: unknown } = {};
  try {
    payload = await response.json();
  } catch {
    // A non-JSON body (a proxy error page, say) still needs a usable message.
  }

  if (!response.ok || payload.ok === false) {
    const error = new Error(
      payload.error ?? `Request failed (${response.status}).`,
    ) as ApiError;
    error.status = response.status;
    error.issues = payload.issues;
    throw error;
  }

  return payload.data as T;
}

export const apiGet = <T,>(path: string) => api<T>(path);

export const apiPost = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: 'POST', body: JSON.stringify(body) });

export const apiPatch = <T,>(path: string, body: unknown) =>
  api<T>(path, { method: 'PATCH', body: JSON.stringify(body) });

export const apiDelete = <T,>(path: string) => api<T>(path, { method: 'DELETE' });

/** Build a query string, dropping empty values so URLs stay clean. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const s = search.toString();
  return s ? `?${s}` : '';
}
