'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiGet } from '@/lib/client';

export interface Resource<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** True only on the very first load, so lists can show a skeleton once. */
  initial: boolean;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Fetch-on-mount with a manual reload, guarding against out-of-order responses
 * when filters change quickly.
 */
export function useResource<T>(path: string | null): Resource<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [initial, setInitial] = useState(true);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await apiGet<T>(path);
      if (id !== requestId.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setInitial(false);
      }
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, initial, reload: load, setData };
}
