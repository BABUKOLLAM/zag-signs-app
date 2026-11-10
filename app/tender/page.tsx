"use client";
import { useState, Suspense } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, Search, Trophy, FileText, TrendingUp, AlertCircle, X } from "lucide-react";
import { useToast } from "@/components/Toaster";
import { LoadingState } from "@/components/States";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

type Tender = {
  id: string; tenderNo: string; title: string; client: string; branch: string;
  status: string; bidValue: number; awardedValue: number | null;
  rfpDate: string | null; submitDeadline: string | null; openingDate: string | null;
  notes: string | null; competitors: string | null; createdBy: { name: string };
};

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
const STATUSES = ["OPEN", "SUBMITTED", "WON", "LOST", "CANCELLED"];

const STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  SUBMITTED: "bg-amber-100 text-amber-700",
  WON: "bg-emerald-100 text-emerald-700",
  LOST: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

const EMPTY: Partial<Tender> & { competitors: string } = {
  title: "", client: "", branch: "TVM", status: "OPEN",
  bidValue: 0, rfpDate: "", submitDeadline: "", openingDate: "", notes: "", competitors: "",
};

function TenderPageInner() {
  const dr = useDateRangeQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Tender | null>(null);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { data: raw, loading, refetch } = useApi<Tender[]>("/tender", dr.params);
  const tenders = (raw ?? []).filter(t =>
    (!statusFilter || t.status === statusFilter) &&
    (!search || t.title.toLowerCase().includes(search.toLowerCase()) || t.client.toLowerCase().includes(search.toLowerCase()))
  );

  const won = (raw ?? []).filter(t => t.status === "WON");
  const open = (raw ?? []).filter(t => t.status === "OPEN" || t.status === "SUBMITTED");
  const totalBid = open.reduce((s, t) => s + t.bidValue, 0);
  const totalWon = won.reduce((s, t) => s + (t.awardedValue ?? t.bidValue), 0);

  function openNew() { setForm(EMPTY); setEditing(null); setShowForm(true); }
  function openEdit(t: Tender) { setForm({ ...t, competitors: t.competitors ?? "" }); setEditing(t); setShowForm(true); }

  async function save() {
    if (!form.title || !form.client) return toast.error("Title and client are required");
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/tender/${editing.id}`, form);
        toast.success("Tender updated");
      } else {
        await api.post("/tender", form);
        toast.success("Tender created");
      }
      setShowForm(false); refetch();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/tender/${id}`, { status });
    refetch();
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Tender Management" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Pipeline", value: open.length, sub: fmt(totalBid), color: "blue", icon: <FileText size={18} /> },
            { label: "Tenders Won", value: won.length, sub: fmt(totalWon), color: "emerald", icon: <Trophy size={18} /> },
            { label: "Win Rate", value: `${(raw ?? []).length > 0 ? Math.round((won.length / (raw ?? []).length) * 100) : 0}%`, sub: "of total", color: "violet", icon: <TrendingUp size={18} /> },
            { label: "Overdue", value: (raw ?? []).filter(t => t.submitDeadline && new Date(t.submitDeadline) < new Date() && t.status === "OPEN").length, sub: "past deadline", color: "red", icon: <AlertCircle size={18} /> },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex gap-3 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600 flex-shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold text-${c.color}-600`}>{c.value}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenders…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Status</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError} basisLabel="Created" />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-400" : "text-slate-400"} />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> New Tender
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Tender No", "Title / Client", "Branch", "Bid Value", "Deadline", "Status", "Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading && <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading…</td></tr>}
              {!loading && tenders.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No tenders found</td></tr>}
              {tenders.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => openEdit(t)}>
                  <td className="px-4 py-3 font-mono text-xs text-indigo-600">{t.tenderNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.client}</p>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{t.branch}</span></td>
                  <td className="px-4 py-3 font-semibold text-slate-800">{fmt(t.bidValue)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{t.submitDeadline ? new Date(t.submitDeadline).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status] ?? "bg-slate-100 text-slate-500"}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      {t.status === "OPEN" && (
                        <button onClick={() => updateStatus(t.id, "SUBMITTED")}
                          className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100">Submit</button>
                      )}
                      {t.status === "SUBMITTED" && <>
                        <button onClick={() => updateStatus(t.id, "WON")}
                          className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Won</button>
                        <button onClick={() => updateStatus(t.id, "LOST")}
                          className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100">Lost</button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{editing ? "Edit Tender" : "New Tender"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Tender title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Client / Organisation *</label>
                  <input value={form.client} onChange={e => setForm((f: any) => ({ ...f, client: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Client name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={form.branch} onChange={e => setForm((f: any) => ({ ...f, branch: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Bid Value (₹)</label>
                  <input type="number" value={form.bidValue} onChange={e => setForm((f: any) => ({ ...f, bidValue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Awarded Value (₹)</label>
                  <input type="number" value={form.awardedValue ?? ""} onChange={e => setForm((f: any) => ({ ...f, awardedValue: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="If won" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">RFP Date</label>
                  <input type="date" value={form.rfpDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, rfpDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Submit Deadline</label>
                  <input type="date" value={form.submitDeadline ?? ""} onChange={e => setForm((f: any) => ({ ...f, submitDeadline: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Opening / Result Date</label>
                <input type="date" value={form.openingDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, openingDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Competitor Info</label>
                <textarea value={form.competitors ?? ""} onChange={e => setForm((f: any) => ({ ...f, competitors: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none"
                  placeholder="Known competitors and their bid values" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? "Saving…" : editing ? "Update" : "Create Tender"}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function TenderPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TenderPageInner />
    </Suspense>
  );
}
