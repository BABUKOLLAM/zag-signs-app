"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { leadSchema, parseErrors, type FormErrors } from "@/lib/schemas";
import { exportExcel } from "@/lib/export";
import DriveButton from "@/components/DriveButton";
import DocumentsPanel from "@/components/DocumentsPanel";
import { Plus, Phone, Mail, Calendar, RefreshCw, Download, Paperclip, X } from "lucide-react";

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

const ic = (err?: string) =>
  `border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${err ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-indigo-500"}`;

export default function LeadsPage() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [docsFor, setDocsFor] = useState<Lead | null>(null);

  const { data, loading, error, refetch } = useApi<Lead[]>("/leads", {
    branch: branchFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
    limit: 100,
  });

  const leads = data ?? [];
  const totalValue = leads.reduce((s, l) => s + l.value, 0);

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
    };

  const handleSave = async () => {
    const result = leadSchema.safeParse(form);
    if (!result.success) { setErrors(parseErrors(result.error)); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.post("/leads", { ...form, value: Number(form.value) || 0 });
      setForm(emptyForm);
      setShowModal(false);
      refetch();
      toast.success("Lead saved successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}); };

  const handleExport = () => exportExcel(`Leads_${new Date().toISOString().slice(0,10)}`, leads.map((l) => ({
    "Lead No": l.leadNo,
    "Name": l.name,
    "Company": l.company,
    "Phone": l.phone,
    "Email": l.email,
    "Branch": l.branch,
    "Status": l.statusLabel,
    "Source": l.sourceLabel,
    "Value (₹)": l.value,
    "Assigned To": l.assignedTo,
    "Follow Up Date": l.followUpDate,
    "Created": l.createdAt,
    "Notes": l.notes,
  })));

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
          <div className="flex gap-2">
            <button onClick={handleExport} disabled={leads.length === 0}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40">
              <Download size={14} /> Excel
            </button>
            <DriveButton filename={`Leads_${new Date().toISOString().slice(0,10)}`} rows={leads.map((l) => ({
              "Lead No": l.leadNo, "Name": l.name, "Company": l.company, "Phone": l.phone,
              "Email": l.email, "Branch": l.branch, "Status": l.statusLabel, "Source": l.sourceLabel,
              "Value (₹)": l.value, "Assigned To": l.assignedTo, "Follow Up": l.followUpDate,
            }))} />
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              <Plus size={14} /> Add Lead
            </button>
          </div>
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
                    <th className="px-4 py-3 w-8"></th>
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
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDocsFor(lead)}
                          title="Documents"
                          className="p-1 rounded hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                        >
                          <Paperclip size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {docsFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b sticky top-0 bg-white">
              <div>
                <h2 className="text-base font-bold text-slate-900">Documents</h2>
                <p className="text-xs text-slate-500">{docsFor.name} · {docsFor.leadNo}</p>
              </div>
              <button onClick={() => setDocsFor(null)} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5">
              <DocumentsPanel relatedTo={docsFor.id} relatedType="LEAD" />
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <h2 className="text-base font-semibold text-gray-900 px-6 pt-5 pb-4 border-b">Add New Lead</h2>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              {(["name", "company", "phone", "email"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {(field === "name" || field === "phone") && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <input
                    value={form[field]}
                    onChange={set(field)}
                    type={field === "email" ? "email" : "text"}
                    className={ic(errors[field])}
                  />
                  {errors[field] && <p className="text-xs text-red-500 mt-1">{errors[field]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Branch <span className="text-red-500">*</span></label>
                <select value={form.branch} onChange={set("branch")} className={ic(errors.branch)}>
                  {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Source</label>
                <select value={form.source} onChange={set("source")} className={ic()}>
                  {[["REFERRAL","Referral"],["COLD_CALL","Cold Call"],["WALK_IN","Walk-in"],["WEBSITE","Website"],["EXHIBITION","Exhibition"],["OTHER","Other"]].map(([v,l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Value (₹)</label>
                <input type="number" value={form.value} onChange={set("value")} className={ic()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Follow Up Date</label>
                <input type="date" value={form.followUpDate} onChange={set("followUpDate")} className={ic()} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={set("notes")} className={ic()} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
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
