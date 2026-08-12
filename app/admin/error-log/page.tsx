"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/Toaster";
import { RefreshCw, Loader2, AlertTriangle, Trash2, ChevronDown, ChevronUp } from "lucide-react";

type ErrorLogEntry = {
  id: string; message: string; digest: string; stack: string;
  path: string; method: string; routeType: string; createdAt: string;
};

export default function ErrorLogPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const { data, loading, refetch } = useApi<{ logs: ErrorLogEntry[]; total: number }>(
    `/admin/error-log?page=${page}`
  );
  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;

  const handleClear = async () => {
    if (!confirm("Clear all logged errors? This can't be undone.")) return;
    setClearing(true);
    try {
      await api.del("/admin/error-log");
      toast.success("Error log cleared");
      setPage(1);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to clear");
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Error Log" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,#DC2626,#EA580C)" }}>
            <AlertTriangle size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Server Error Log</p>
            <p className="text-xs text-slate-400">Unhandled server errors caught automatically — {total} total logged</p>
          </div>
          <button onClick={refetch} className="ml-auto p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleClear} disabled={clearing || total === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-40">
            <Trash2 size={13} /> Clear all
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Timestamp", "Route", "Method", "Message", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={5} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && logs.map((l) => (
                <>
                  <tr key={l.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs font-mono">{l.path || "—"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{l.method || "—"}</td>
                    <td className="px-4 py-3 text-red-700 text-xs max-w-md truncate">{l.message}</td>
                    <td className="px-4 py-3 text-slate-400">{expanded === l.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                  </tr>
                  {expanded === l.id && (
                    <tr key={`${l.id}-detail`}>
                      <td colSpan={5} className="px-4 py-3 bg-slate-50">
                        <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">{l.stack || l.message}</pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400">No errors logged — good sign.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-slate-400">{logs.length} entries (page {page})</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50">
              Previous
            </button>
            <button disabled={logs.length < 50} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
