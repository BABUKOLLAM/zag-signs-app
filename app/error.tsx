"use client";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-base, #f8fafc)" }}>
      <div className="max-w-md w-full rounded-2xl p-8 text-center shadow-sm"
        style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--card-border, #e2e8f0)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-red-50">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary, #0f172a)" }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted, #64748b)" }}>
          An unexpected error occurred. You can retry, or go back to the dashboard.
          {error.digest && <span className="block mt-2 font-mono text-xs opacity-60">Ref: {error.digest}</span>}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
            <RefreshCw size={14} /> Try Again
          </button>
          <a href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border"
            style={{ color: "var(--text-secondary, #475569)", borderColor: "var(--card-border, #e2e8f0)" }}>
            <Home size={14} /> Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
