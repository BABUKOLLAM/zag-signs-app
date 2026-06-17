"use client";
import { Loader2, AlertCircle, Inbox, RefreshCw } from "lucide-react";

/** Full-width centered spinner for page/section loading. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
      <Loader2 size={28} className="animate-spin text-indigo-500" />
      <p className="mt-3 text-sm">{label}</p>
    </div>
  );
}

/** Error panel with a retry button. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle size={22} className="text-red-500" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-700">Couldn&apos;t load data</p>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:bg-indigo-50 rounded-lg px-3 py-1.5 transition-colors"
        >
          <RefreshCw size={12} /> Try again
        </button>
      )}
    </div>
  );
}

/** Empty placeholder when a list has no rows. */
export function EmptyState({ label = "No records found", hint }: { label?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
        <Inbox size={22} className="text-slate-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

/** Reusable shimmer rows for table skeletons. */
export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-slate-50">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-3.5 rounded bg-slate-100 animate-pulse"
              style={{ width: c === 0 ? "12%" : c === cols - 1 ? "10%" : `${18 + ((r + c) % 3) * 6}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
