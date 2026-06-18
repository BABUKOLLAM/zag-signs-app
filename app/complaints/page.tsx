"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { complaintSchema, parseErrors, type FormErrors } from "@/lib/schemas";
import { Plus, RefreshCw } from "lucide-react";

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-200 text-red-800",
};
const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

interface Complaint {
  id: string; complaintNo: string; subject: string; description: string;
  status: string; statusLabel: string; priority: string; priorityLabel: string;
  resolution: string; resolvedAt: string; createdAt: string;
  customerId: string; customerName: string; assignedTo: string;
}

const emptyForm = { subject: "", description: "", priority: "MEDIUM", customerName: "" };

const ic = (err?: string) =>
  `border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 ${err ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-indigo-500"}`;

export default function ComplaintsPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi<Complaint[]>("/complaints", {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
    limit: 100,
  });

  const complaints = data ?? [];

  const set = (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      if (errors[field]) setErrors((er) => { const n = { ...er }; delete n[field]; return n; });
    };

  const handleSave = async () => {
    const result = complaintSchema.safeParse(form);
    if (!result.success) { setErrors(parseErrors(result.error)); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.post("/complaints", {
        subject: form.subject,
        description: form.customerName
          ? `Customer: ${form.customerName}\n\n${form.description}`
          : form.description,
        priority: form.priority,
      });
      setForm(emptyForm);
      setShowModal(false);
      refetch();
      toast.success("Complaint logged successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log complaint");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => { setShowModal(false); setForm(emptyForm); setErrors({}); };

  return (
    <div>
      <TopBar title="Complaints & Service" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Complaints", value: complaints.length },
            { label: "Open", value: complaints.filter((c) => c.status === "OPEN").length },
            { label: "In Progress", value: complaints.filter((c) => c.status === "IN_PROGRESS").length },
            { label: "Resolved", value: complaints.filter((c) => c.status === "RESOLVED").length },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Log Complaint
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} cols={7} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : complaints.length === 0 ? (
            <EmptyState label="No complaints found" hint="Adjust the filters or log a new complaint." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">Complaint No</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Subject</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Assigned To</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-indigo-600 font-medium">{c.complaintNo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.customerName || "—"}</td>
                      <td className="px-4 py-3 text-gray-800">{c.subject}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate hidden md:table-cell">{c.description}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[c.priority] ?? "bg-gray-100 text-gray-700"}`}>
                          {c.priorityLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {c.statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden lg:table-cell">{c.assignedTo}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{c.createdAt}</td>
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
            <h2 className="text-base font-semibold text-gray-900 px-6 pt-5 pb-4 border-b">Log New Complaint</h2>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name <span className="text-gray-400 font-normal">(optional)</span></label>
                <input value={form.customerName} onChange={set("customerName")} placeholder="Enter customer name if known"
                  className={ic()} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                <input value={form.subject} onChange={set("subject")} placeholder="Brief description of the issue"
                  className={ic(errors.subject)} />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority <span className="text-red-500">*</span></label>
                <select value={form.priority} onChange={set("priority")} className={ic()}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea rows={3} value={form.description} onChange={set("description")}
                  placeholder="Provide full details of the complaint…"
                  className={ic(errors.description)} />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={closeModal} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving…" : "Log Complaint"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
