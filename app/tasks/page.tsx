"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { ErrorState, EmptyState } from "@/components/States";
import { Plus, X, CheckCircle, Circle, Clock, AlertTriangle, RefreshCw } from "lucide-react";

type Priority = "HIGH" | "MEDIUM" | "LOW";
type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

interface Task {
  id: string; title: string; description: string; status: TaskStatus; statusLabel: string;
  priority: Priority; priorityLabel: string; dueDate: string; completedAt: string;
  createdAt: string; relatedTo: string; assignedTo: string; createdBy: string;
}

const priorityColor: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  LOW: "bg-green-100 text-green-700",
};
const statusColor: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  OVERDUE: "bg-red-100 text-red-700",
};

const today = new Date().toISOString().split("T")[0];

const blank = { title: "", description: "", priority: "MEDIUM", dueDate: "", relatedTo: "" };

export default function TasksPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi<Task[]>("/tasks", {
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
    limit: 100,
  });

  const tasks = data ?? [];

  const set = (f: keyof typeof blank) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.post("/tasks", {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
        relatedTo: form.relatedTo || null,
      });
      setForm(blank);
      setShowModal(false);
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = async (task: Task) => {
    if (task.status === "COMPLETED" || task.status === "CANCELLED") return;
    const flow: TaskStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    const idx = flow.indexOf(task.status);
    const next = flow[Math.min(idx + 1, flow.length - 1)];
    await api.put(`/tasks/${task.id}`, { status: next });
    refetch();
  };

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "PENDING").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    overdue: tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED" && t.dueDate && t.dueDate < today).length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const lc = "block text-xs font-medium text-gray-600 mb-1";

  const StatusIcon = ({ task }: { task: Task }) => {
    const isOverdue = task.status !== "COMPLETED" && task.dueDate && task.dueDate < today;
    if (task.status === "COMPLETED") return <CheckCircle size={16} className="text-green-500" />;
    if (isOverdue) return <AlertTriangle size={16} className="text-red-500" />;
    if (task.status === "IN_PROGRESS") return <Clock size={16} className="text-blue-500" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  return (
    <div>
      <TopBar title="Task Management" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total", value: counts.total, color: "text-gray-900" },
            { label: "Pending", value: counts.pending, color: "text-gray-700" },
            { label: "In Progress", value: counts.inProgress, color: "text-blue-600" },
            { label: "Overdue", value: counts.overdue, color: "text-red-600" },
            { label: "Completed", value: counts.completed, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Task
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <ErrorState message={error} onRetry={refetch} />
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <EmptyState label="No tasks found" hint="Create your first task or adjust the filters." />
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t) => {
              const isOverdue = t.status !== "COMPLETED" && t.status !== "CANCELLED" && t.dueDate && t.dueDate < today;
              const displayStatus = isOverdue ? "OVERDUE" : t.status;
              return (
                <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-4 flex gap-4 ${isOverdue ? "border-red-200" : "border-gray-100"}`}>
                  <button onClick={() => cycleStatus(t)} className="mt-0.5 flex-shrink-0">
                    <StatusIcon task={t} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-medium text-sm ${t.status === "COMPLETED" ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {t.title}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor[t.priority] ?? ""}`}>
                          {t.priorityLabel}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[displayStatus] ?? ""}`}>
                          {isOverdue ? "Overdue" : t.statusLabel}
                        </span>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2">
                      {t.assignedTo && <span className="text-xs text-gray-500">👤 {t.assignedTo}</span>}
                      {t.dueDate && (
                        <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                          📅 Due: {t.dueDate}
                        </span>
                      )}
                      {t.relatedTo && <span className="text-xs text-blue-600">{t.relatedTo}</span>}
                      {t.completedAt && <span className="text-xs text-green-600">✓ Done: {t.completedAt}</span>}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">{t.id.slice(0, 8)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Add Task</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className={lc}>Task Title *</label>
                <input type="text" placeholder="What needs to be done?" value={form.title} onChange={set("title")} className={ic} />
              </div>
              <div>
                <label className={lc}>Description</label>
                <textarea rows={2} placeholder="Add details or instructions" value={form.description} onChange={set("description")} className={ic} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Priority</label>
                  <select value={form.priority} onChange={set("priority")} className={ic}>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className={lc}>Due Date</label>
                  <input type="date" value={form.dueDate} onChange={set("dueDate")} className={ic} />
                </div>
                <div className="col-span-2">
                  <label className={lc}>Related To (optional)</label>
                  <input type="text" placeholder="e.g. Lead L001, Customer C002" value={form.relatedTo} onChange={set("relatedTo")} className={ic} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={!form.title.trim() || saving}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? "Saving…" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
