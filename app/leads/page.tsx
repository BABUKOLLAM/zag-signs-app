"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { Plus, Phone, Mail, Calendar, RefreshCw } from "lucide-react";

const BRANCHES = ["TVM", "KTYM", "EKM", "CLT"];
const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
];
const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  CONTACTED: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-indigo-100 text-indigo-700",
  PROPOSAL: "bg-yellow-100 text-yellow-700",
  NEGOTIATION: "bg-orange-100 text-orange-700",
  WON: "bg-green-100 text-green-700",
  LOST: "bg-red-100 text-red-700",
};

interface Lead {
  id: string; leadNo: string; name: string; company: string;
  phone: string; email: string; branch: string; status: string;
  statusLabel: string; source: string; sourceLabel: string;
  value: number; assignedTo: string; followUpDate: string; createdAt: string; notes: string;
}

const emptyForm = {
  name: "", company: "", phone: "", email: "",
  branch: "TVM", source: "OTHER", value: "", followUpDate: "", notes: "",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi<Lead[]>("/leads", {
    branch: branchFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
    limit: 100,
  });

  const leads = data ?? [];
  const totalValue = leads.reduce((s, l) => s + l.value, 0);

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    setSaving(true);
    try {
      await api.post("/leads", { ...form, value: Number(form.value) || 0 });
      setForm(emptyForm);
      setShowModal(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar title="Leads & CRM" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Leads", value: leads.length },
            { label: "Won", value: leads.filter((l) => l.status === "WON").length },
            { label: "In Pipeline", value: leads.filter((l) => !["WON", "LOST"].includes(l.status)).length },
            { label: "Pipeline Value", value: `₹${(totalValue / 100000).toFixed(1)}L` },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <input type="text" placeholder="Search leads…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Lead
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : leads.length === 0 ? (
            <EmptyState label="No leads found" hint="Add your first lead or adjust the filters." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Lead No</th>
                    <th className="text-left px-4 py-3">Name / Company</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Contact</th>
                    <th className="text-left px-4 py-3">Branch</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Value</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Follow Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{lead.leadNo}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.company}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-600"><Phone size={10} />{lead.phone}</span>
                          <span className="flex items-center gap-1 text-xs text-gray-600"><Mail size={10} />{lead.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{lead.branch}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {lead.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{fmt(lead.value)}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{lead.assignedTo}</td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {lead.followUpDate && (
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar size={10} />{lead.followUpDate}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-base font-semibold text-gray-900 px-6 pt-5 pb-4 border-b">Add New Lead</h2>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {(["name", "company", "phone", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input value={form[field]} onChange={set(field)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                <select value={form.branch} onChange={set("branch")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                <select value={form.source} onChange={set("source")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none">
                  {[["REFERRAL","Referral"],["COLD_CALL","Cold Call"],["WALK_IN","Walk-in"],["WEBSITE","Website"],["EXHIBITION","Exhibition"],["OTHER","Other"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value (₹)</label>
                <input type="number" value={form.value} onChange={set("value")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Follow Up Date</label>
                <input type="date" value={form.followUpDate} onChange={set("followUpDate")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={set("notes")}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!form.name.trim() || !form.phone.trim() || saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving…" : "Save Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
