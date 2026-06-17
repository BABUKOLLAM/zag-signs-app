"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api-client";

interface UseApiState<T> {
  data: T | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize params so the effect re-runs when filters change
  const key = JSON.stringify(params ?? {});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: T }>(path, params ? JSON.parse(key) : undefined);
      setData(res.data);
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

  return { data, loading, error, refetch: load };
}
