"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api-client";

/** Server-side list info: `meta` from okList(), or the older `pagination` shape. */
export interface ListInfo {
  total?: number;
  limit?: number;
  [k: string]: unknown;
}

interface UseApiState<T> {
  data: T | null;
  /** Totals for capped lists (null when the endpoint sends none). */
  meta: ListInfo | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/** Fetch data from an API GET endpoint with loading + error state. */
export function useApi<T>(
  path: string,
  params?: Record<string, string | number | undefined | null>
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [meta, setMeta] = useState<ListInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize params so the effect re-runs when filters change
  const key = JSON.stringify(params ?? {});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: T; meta?: ListInfo; pagination?: ListInfo }>(path, params ? JSON.parse(key) : undefined);
      setData(res.data);
      setMeta(res.meta ?? res.pagination ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, meta, loading, error, refetch: load };
}
