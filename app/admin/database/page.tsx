"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Database, RefreshCw, ChevronLeft, ChevronRight,
  Edit2, Save, X, Search, Table2, Loader2,
} from "lucide-react";

type TableMeta = { table: string; model: string; count: number };
type TableData = { table: string; total: number; page: number; limit: number; rows: Record<string, unknown>[] };

function isAdmin(role: string) {
  return ["MD","IT Admin","IT_ADMIN"].some(r => role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_"));
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean")   return v ? "Yes" : "No";
  if (v instanceof Date)        return (v as Date).toLocaleDateString();
  if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))
    return new Date(v).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" });
  if (typeof v === "object")    return JSON.stringify(v).slice(0, 60);
  return String(v);
}

export default function DatabasePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const role = (session?.user as { role?: string })?.role ?? "";

  const [tables, setTables]   = useState<TableMeta[]>([]);
  const [active, setActive]   = useState<string>("");
  const [data, setData]       = useState<TableData | null>(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<{ id: string; data: Record<string, unknown> } | null>(null);
  const [search, setSearch]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState("");

  const fetchTables = useCallback(async () => {
    const res = await fetch("/api/admin/tables");
    if (res.ok) { const d = await res.json(); setTables(d.data ?? []); }
  }, []);

  const fetchData = useCallback(async (table: string, p: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/tables/${table}?page=${p}&limit=50`);
    if (res.ok) { const d = await res.json(); setData(d.data); }
    setLoading(false);
  }, []);

  useEffect(() => { if (isAdmin(role)) fetchTables(); }, [role, fetchTables]);
  useEffect(() => { if (active) { setPage(1); fetchData(active, 1); } }, [active, fetchData]);

  if (sessionStatus === "loading") return <div className="p-10 text-slate-500">Loading…</div>;
  if (sessionStatus === "authenticated" && !isAdmin(role)) { router.replace("/dashboard"); return null; }

  async function saveEdit() {
    if (!editing || !active) return;
    setSaving(true);
    const res = await fetch(`/api/admin/tables/${active}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, data: editing.data }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      fetchData(active, page);
      setMsg("Record updated.");
      setTimeout(() => setMsg(""), 3000);
    } else {
      const d = await res.json();
      setMsg(d.error ?? "Update failed");
    }
  }

  const columns = data?.rows[0] ? Object.keys(data.rows[0]) : [];
  const filtered = search
    ? (data?.rows ?? []).filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
    : (data?.rows ?? []);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="p-6 max-w-full">
      <div className="flex items-center gap-3 mb-6">
        <Database size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Database Admin</h1>
          <p className="text-slate-500 text-sm">View and edit database records — IT Admin / MD only</p>
        </div>
      </div>

      {msg && (
        <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
          {msg}
        </div>
      )}

      <div className="flex gap-5">
        {/* Table list sidebar */}
        <div className="w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Tables</span>
              <button onClick={fetchTables} className="text-slate-400 hover:text-slate-600">
                <RefreshCw size={12} />
              </button>
            </div>
            <div className="divide-y divide-slate-50">
              {tables.map(t => (
                <button
                  key={t.table}
                  onClick={() => setActive(t.table)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${
                    active === t.table
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Table2 size={13} />
                    <span className="truncate">{t.table}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{t.count}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="flex-1 min-w-0">
          {!active && (
            <div className="flex items-center justify-center h-60 bg-white rounded-2xl border border-slate-200 text-slate-400">
              Select a table to view data
            </div>
          )}

          {active && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Toolbar */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <span className="font-semibold text-slate-700">{active}</span>
                {data && <span className="text-xs text-slate-400 font-mono">{data.total} records</span>}
                <div className="flex-1" />
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    placeholder="Filter rows…"
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <button onClick={() => fetchData(active, page)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex items-center justify-center h-40 text-slate-400">
                  <Loader2 size={20} className="animate-spin mr-2" />Loading…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-3 py-2 text-left font-semibold text-slate-500 w-8">#</th>
                        {columns.map(c => (
                          <th key={c} className="px-3 py-2 text-left font-semibold text-slate-500 whitespace-nowrap">{c}</th>
                        ))}
                        <th className="px-3 py-2 text-right font-semibold text-slate-500">Edit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filtered.map((row, i) => (
                        <tr key={String(row.id ?? i)} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-slate-400">{(page-1)*50 + i + 1}</td>
                          {columns.map(c => (
                            <td key={c} className="px-3 py-2 text-slate-700 max-w-xs truncate" title={String(row[c] ?? "")}>
                              {formatValue(row[c])}
                            </td>
                          ))}
                          <td className="px-3 py-2 text-right">
                            <button
                              onClick={() => setEditing({ id: String(row.id), data: { ...row } })}
                              className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600">
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr><td colSpan={columns.length + 2} className="text-center py-8 text-slate-400">No records</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Page {page} of {totalPages}</span>
                  <div className="flex gap-1">
                    <button disabled={page === 1} onClick={() => { setPage(p=>p-1); fetchData(active, page-1); }}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                      <ChevronLeft size={14} />
                    </button>
                    <button disabled={page >= totalPages} onClick={() => { setPage(p=>p+1); fetchData(active, page+1); }}
                      className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40">
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Edit2 size={16} className="text-indigo-500" /> Edit Record
              </h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-3">
              {Object.entries(editing.data).map(([key, val]) => {
                const readOnly = ["id","createdAt","updatedAt"].includes(key);
                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">{key}</label>
                    <input
                      readOnly={readOnly}
                      value={val === null || val === undefined ? "" : String(val)}
                      onChange={e => setEditing(s => s ? {
                        ...s,
                        data: { ...s.data, [key]: e.target.value },
                      } : null)}
                      className={`w-full px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 ${
                        readOnly ? "bg-slate-50 border-slate-100 text-slate-400" : "border-slate-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
