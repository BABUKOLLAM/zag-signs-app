"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { RefreshCw, Loader2, Shield } from "lucide-react";

type AuditLog = {
  id: string; action: string; tableName: string; recordId: string;
  oldValues: unknown; newValues: unknown;
  ipAddress: string; createdAt: string; userName: string; userEmail: string;
};

const ACTION_COLORS: Record<string,string> = {
  CREATE: "bg-emerald-100 text-emerald-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN:  "bg-indigo-100 text-indigo-700",
  APPROVE:"bg-blue-100 text-blue-700",
  REJECT: "bg-rose-100 text-rose-700",
};

export default function AuditPage() {
  const [page, setPage]   = useState(1);
  const [table, setTable] = useState("");

  const params = new URLSearchParams({ page: String(page), ...(table ? { table } : {}) });
  const { data: raw, loading, refetch } = useApi<AuditLog[]>(`/audit-logs?${params}`);
  const logs = raw ?? [];

  const TABLES = ["User","Lead","Customer","SalesOrder","Quotation","Employee","Invoice","WorkOrder","Inventory"];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Audit Trail" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">System Audit Log</p>
            <p className="text-xs text-slate-400">All create/update/delete actions across the ERP (most recent 100 per page)</p>
          </div>
          <button onClick={refetch} className="ml-auto p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
            <RefreshCw size={14} className={loading?"animate-spin":""} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          <select value={table} onChange={e => { setTable(e.target.value); setPage(1); }} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Tables</option>
            {TABLES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Timestamp","User","Action","Table","Record ID","IP"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={6} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
              {!loading && logs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString("en-IN",{ day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-slate-800">{l.userName}</p>
                    <p className="text-xs text-slate-400">{l.userEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[l.action] ?? "bg-slate-100 text-slate-500"}`}>{l.action}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs font-medium">{l.tableName}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{l.recordId.slice(0,12)}…</td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{l.ipAddress || "—"}</td>
                </tr>
              ))}
              {!loading && logs.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-slate-400">No audit logs yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-xs text-slate-400">{logs.length} entries (page {page})</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50">
              Previous
            </button>
            <button disabled={logs.length < 100} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-600 disabled:opacity-40 hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
