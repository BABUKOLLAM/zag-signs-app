"use client";

// Thin typed fetch wrapper for client components.
// All ZAG API routes return { data, ... } on success or { error } on failure.

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiError extends Error {
  status: number;
}

async function handle<T>(res: Response): Promise<T> {
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      (json as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
    const error = new Error(message) as ApiError;
    error.status = res.status;
    throw error;
  }

  return json as T;
}

function qs(params?: Record<string, string | number | undefined | null>) {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const api = {
  async get<T>(path: string, params?: Record<string, string | number | undefined | null>): Promise<T> {
    const res = await fetch(`/api${path}${qs(params)}`, { cache: "no-store" });
    return handle<T>(res);
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handle<T>(res);
  },
  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`/api${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return handle<T>(res);
  },
  async del<T>(path: string): Promise<T> {
    const res = await fetch(`/api${path}`, { method: "DELETE" });
    return handle<T>(res);
  },
};
