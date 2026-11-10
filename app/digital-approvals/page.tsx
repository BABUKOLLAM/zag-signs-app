"use client";
import { Suspense } from "react";
import React, { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { Plus, RefreshCw, Search, X, CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";
import { useToast } from "@/components/Toaster";
import { LoadingState } from "@/components/States";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

const APPROVAL_TYPES = ["ARTWORK", "PRODUCTION", "SITE", "HANDOVER"];
const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED", "REVISION_REQUESTED"];

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-600",
  REVISION_REQUESTED: "bg-violet-100 text-violet-700",
};
const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING: <Clock size={14} className="text-amber-500" />,
  APPROVED: <CheckCircle size={14} className="text-emerald-500" />,
  REJECTED: <XCircle size={14} className="text-red-500" />,
  REVISION_REQUESTED: <RotateCcw size={14} className="text-violet-500" />,
};

type Approval = {
  id: string; approvalNo: string; type: string; status: string;
  customerName: string; customerEmail: string | null; customerPhone: string | null;
  documentUrl: string | null; signatureUrl: string | null; approvedAt: string | null;
  createdBy: { name: string }; createdAt: string;
};

const EMPTY = {
  type: "ARTWORK", relatedType: "SALES_ORDER", relatedId: "",
  customerName: "", customerEmail: "", customerPhone: "", documentUrl: "",
};

function DigitalApprovalsPageInner() {
  const dr = useDateRangeQuery();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Approval | null>(null);
  const toast = useToast();

  const { data: approvals, loading, refetch } = useApi<Approval[]>("/digital-approvals", dr.params);
  const filtered = (approvals ?? []).filter(a =>
    (!typeFilter || a.type === typeFilter) &&
    (!statusFilter || a.status === statusFilter) &&
    (!search || a.customerName.toLowerCase().includes(search.toLowerCase()) || a.approvalNo.toLowerCase().includes(search.toLowerCase()))
  );

  async function save() {
    if (!form.customerName) return toast.error("Customer name required");
    setSaving(true);
    try {
      await api.post("/digital-approvals", form);
      toast.success("Approval request created");
      setShowForm(false); setForm(EMPTY); refetch();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/digital-approvals/${id}`, { status });
    refetch();
    if (selected?.id === id) setSelected(a => a ? { ...a, status } : a);
    toast.success(`Marked as ${status.toLowerCase().replace(/_/g, " ")}`);
  }

  const counts = {
    pending: (approvals ?? []).filter(a => a.status === "PENDING").length,
    approved: (approvals ?? []).filter(a => a.status === "APPROVED").length,
    revision: (approvals ?? []).filter(a => a.status === "REVISION_REQUESTED").length,
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Digital Approvals" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Awaiting Approval", value: counts.pending, color: "amber" },
            { label: "Approved", value: counts.approved, color: "emerald" },
            { label: "Revision Requested", value: counts.revision, color: "violet" },
            { label: "Total", value: (approvals ?? []).length, color: "indigo" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600 mt-1`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Types</option>
            {APPROVAL_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Status</option>
            {APPROVAL_STATUSES.map(s => <option key={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError} basisLabel="Created" />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-400" : "text-slate-400"} />
          </button>
          <button onClick={() => { setForm(EMPTY); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> New Approval
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-2 space-y-3">
            {loading && <p className="text-center text-slate-400 py-10">Loading…</p>}
            {!loading && filtered.length === 0 && <p className="text-center text-slate-400 py-10">No approval requests found</p>}
            {filtered.map(a => (
              <div key={a.id} onClick={() => setSelected(a)}
                className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${selected?.id === a.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {STATUS_ICON[a.status]}
                    <div>
                      <p className="font-bold text-slate-800">{a.customerName}</p>
                      <p className="text-xs text-slate-500">{a.approvalNo}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[a.status]}`}>{a.status.replace(/_/g, " ")}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{a.type}</span>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                  {a.customerEmail && <span>{a.customerEmail}</span>}
                  {a.customerPhone && <span>{a.customerPhone}</span>}
                  <span className="ml-auto">{new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{selected.approvalNo}</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={14} /></button>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  ["Type", selected.type],
                  ["Customer", selected.customerName],
                  ["Email", selected.customerEmail ?? "—"],
                  ["Phone", selected.customerPhone ?? "—"],
                  ["Created by", selected.createdBy?.name],
                  ["Approved at", selected.approvedAt ? new Date(selected.approvedAt).toLocaleDateString("en-IN") : "—"],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-xs text-slate-400">{l}</span>
                    <span className="text-xs font-semibold text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
              {selected.documentUrl && (
                <a href={selected.documentUrl} target="_blank" rel="noopener noreferrer"
                  className="block text-xs text-indigo-600 hover:underline">View Document</a>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Update Status</p>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateStatus(selected.id, "APPROVED")}
                    className="py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => updateStatus(selected.id, "REJECTED")}
                    className="py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 flex items-center justify-center gap-1">
                    <XCircle size={12} /> Reject
                  </button>
                  <button onClick={() => updateStatus(selected.id, "REVISION_REQUESTED")}
                    className="col-span-2 py-2 rounded-xl bg-violet-50 text-violet-700 text-xs font-semibold hover:bg-violet-100 flex items-center justify-center gap-1">
                    <RotateCcw size={12} /> Request Revision
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center p-8">
              <p className="text-slate-400 text-sm text-center">Select an approval to act on it</p>
            </div>
          )}
        </div>
      </div>

      {/* New Approval Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New Approval Request</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Approval Type</label>
                  <select value={form.type} onChange={e => setForm((f: any) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {APPROVAL_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Related To</label>
                  <select value={form.relatedType} onChange={e => setForm((f: any) => ({ ...f, relatedType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {["SALES_ORDER", "WORK_ORDER", "QUOTATION"].map(t => <option key={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Related ID / Ref</label>
                <input value={form.relatedId} onChange={e => setForm((f: any) => ({ ...f, relatedId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="SO-2026-0001 etc." />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Name *</label>
                <input value={form.customerName} onChange={e => setForm((f: any) => ({ ...f, customerName: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Email</label>
                  <input type="email" value={form.customerEmail} onChange={e => setForm((f: any) => ({ ...f, customerEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Customer Phone</label>
                  <input value={form.customerPhone} onChange={e => setForm((f: any) => ({ ...f, customerPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Document URL</label>
                <input value={form.documentUrl} onChange={e => setForm((f: any) => ({ ...f, documentUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Drive link to artwork/document" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? "Creating…" : "Create Request"}
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
export default function DigitalApprovalsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DigitalApprovalsPageInner />
    </Suspense>
  );
}
