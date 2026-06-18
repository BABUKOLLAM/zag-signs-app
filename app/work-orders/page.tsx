"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { Plus, RefreshCw, Wrench, ChevronRight, X, Calendar } from "lucide-react";

const STATUSES = ["Pending", "In Progress", "Quality Check", "Dispatch Ready", "Completed", "On Hold"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];

const STATUS_COLORS: Record<string, string> = {
  "Pending":        "bg-gray-100 text-gray-700",
  "In Progress":    "bg-blue-100 text-blue-700",
  "Quality Check":  "bg-yellow-100 text-yellow-700",
  "Dispatch Ready": "bg-indigo-100 text-indigo-700",
  "Completed":      "bg-green-100 text-green-700",
  "On Hold":        "bg-orange-100 text-orange-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  "Low":    "bg-slate-100 text-slate-600",
  "Medium": "bg-blue-100 text-blue-700",
  "High":   "bg-orange-100 text-orange-700",
  "Urgent": "bg-red-100 text-red-700",
};

const STATUS_FLOW: Record<string, string> = {
  "Pending":        "In Progress",
  "In Progress":    "Quality Check",
  "Quality Check":  "Dispatch Ready",
  "Dispatch Ready": "Completed",
};

interface WorkOrder {
  id: string; workOrderNo: string; description: string;
  status: string; priority: string;
  startDate: string; dueDate: string; completedAt: string;
  notes: string; createdAt: string;
  salesOrderId: string; salesOrderNo: string; customerName: string;
}

const emptyForm = {
  description: "", priority: "Medium",
  startDate: "", dueDate: "", notes: "",
};

const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function WorkOrdersPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter]   = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState(emptyForm);
  const [saving, setSaving]               = useState(false);
  const [advancing, setAdvancing]         = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi<WorkOrder[]>("/work-orders", {
    status:   statusFilter   || undefined,
    priority: priorityFilter || undefined,
  });

  const orders = data ?? [];
  const pending    = orders.filter((w) => w.status === "Pending").length;
  const inProgress = orders.filter((w) => w.status === "In Progress").length;
  const completed  = orders.filter((w) => w.status === "Completed").length;
  const overdue    = orders.filter((w) => w.dueDate && w.dueDate < new Date().toISOString().slice(0,10) && w.status !== "Completed").length;

  const set = (f: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.description.trim()) { toast.error("Description is required"); return; }
    setSaving(true);
    try {
      await api.post("/work-orders", {
        description:  form.description,
        priority:     form.priority,
        startDate:    form.startDate || undefined,
        dueDate:      form.dueDate   || undefined,
        notes:        form.notes     || undefined,
      });
      setForm(emptyForm);
      setShowModal(false);
      refetch();
      toast.success("Work order created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create work order");
    } finally { setSaving(false); }
  };

  const handleAdvance = async (wo: WorkOrder) => {
    const next = STATUS_FLOW[wo.status];
    if (!next) return;
    setAdvancing(wo.id);
    try {
      await api.put(`/work-orders/${wo.id}`, { status: next });
      refetch();
      toast.success(`${wo.workOrderNo} → ${next}`);
    } catch { toast.error("Status update failed"); }
    finally { setAdvancing(null); }
  };

  const handleHold = async (wo: WorkOrder) => {
    const newStatus = wo.status === "On Hold" ? "In Progress" : "On Hold";
    setAdvancing(wo.id);
    try {
      await api.put(`/work-orders/${wo.id}`, { status: newStatus });
      refetch();
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error("Status update failed"); }
    finally { setAdvancing(null); }
  };

  return (
    <div>
      <TopBar title="Work Orders" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total", value: orders.length, color: "text-gray-900" },
            { label: "In Progress", value: inProgress, color: "text-blue-700" },
            { label: "Pending", value: pending, color: "text-orange-600" },
            { label: "Overdue", value: overdue, color: overdue > 0 ? "text-red-600" : "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Status</option>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Priority</option>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button onClick={refetch} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> New Work Order
          </button>
        </div>

        {/* Status pipeline summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium mb-3">Pipeline</p>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUSES.filter((s) => s !== "On Hold").map((s, i, arr) => {
              const count = orders.filter((w) => w.status === s).length;
              return (
                <div key={s} className="flex items-center gap-1">
                  <button
                    onClick={() => setStatusFilter((f) => f === s ? "" : s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      statusFilter === s ? "ring-2 ring-indigo-300" : ""
                    } ${STATUS_COLORS[s] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    <Wrench size={10} /> {s} <span className="font-bold">({count})</span>
                  </button>
                  {i < arr.length - 1 && <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />}
                </div>
              );
            })}
            <div className="ml-2">
              <button
                onClick={() => setStatusFilter((f) => f === "On Hold" ? "" : "On Hold")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${STATUS_COLORS["On Hold"]} ${statusFilter === "On Hold" ? "ring-2 ring-orange-300" : ""}`}
              >
                On Hold ({orders.filter((w) => w.status === "On Hold").length})
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <TableSkeleton rows={6} cols={7} /> :
           error   ? <ErrorState message={error} onRetry={refetch} /> :
           orders.length === 0 ? (
             <EmptyState label="No work orders found" hint="Create a work order to track production jobs." />
           ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-xs text-gray-500 font-medium">
                    <th className="text-left px-4 py-3">WO No</th>
                    <th className="text-left px-4 py-3">Description</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Customer</th>
                    <th className="text-left px-4 py-3">Priority</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Due Date</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((wo) => {
                    const next = STATUS_FLOW[wo.status];
                    const isOverdue = wo.dueDate && wo.dueDate < new Date().toISOString().slice(0,10) && wo.status !== "Completed";
                    return (
                      <tr key={wo.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-indigo-600">{wo.workOrderNo}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 max-w-[200px] truncate">{wo.description}</p>
                          {wo.salesOrderNo && (
                            <p className="text-xs text-gray-400">SO: {wo.salesOrderNo}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700 hidden md:table-cell">{wo.customerName || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[wo.priority] ?? "bg-gray-100 text-gray-600"}`}>
                            {wo.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {wo.dueDate ? (
                            <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                              <Calendar size={10} /> {wo.dueDate}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[wo.status] ?? "bg-gray-100 text-gray-700"}`}>
                            {wo.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {next && (
                              <button
                                onClick={() => handleAdvance(wo)}
                                disabled={advancing === wo.id}
                                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-40 flex items-center gap-0.5"
                              >
                                <ChevronRight size={12} /> {next}
                              </button>
                            )}
                            {wo.status !== "Completed" && (
                              <button
                                onClick={() => handleHold(wo)}
                                disabled={advancing === wo.id}
                                className={`text-xs font-medium px-2 py-0.5 rounded disabled:opacity-40 ${
                                  wo.status === "On Hold"
                                    ? "text-blue-600 hover:text-blue-800"
                                    : "text-orange-600 hover:text-orange-800"
                                }`}
                              >
                                {wo.status === "On Hold" ? "Resume" : "Hold"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <h2 className="text-base font-bold text-gray-900">New Work Order</h2>
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description / Job Title <span className="text-red-500">*</span></label>
                <input value={form.description} onChange={set("description")} placeholder="e.g. LED Sign Board – Lulu Mall Kochi" className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select value={form.priority} onChange={set("priority")} className={ic}>
                  {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                <input type="date" value={form.startDate} onChange={set("startDate")} className={ic} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
                <input type="date" value={form.dueDate} onChange={set("dueDate")} className={ic} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Special instructions, materials needed…" className={ic} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => { setShowModal(false); setForm(emptyForm); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                {saving ? "Creating…" : "Create Work Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
