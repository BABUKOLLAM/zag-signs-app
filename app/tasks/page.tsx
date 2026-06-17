"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { branches } from "@/lib/data";
import { Plus, X, CheckCircle, Circle, Clock, AlertTriangle } from "lucide-react";

// ─── BRD Section 9 — Task Management ──────────────────────────────────────────

type Priority = "High" | "Medium" | "Low";
type TaskStatus = "Pending" | "In Progress" | "Completed" | "Overdue";
type RelatedTo = "Lead" | "Customer" | "Sales Order" | "Collection" | "Complaint" | "General";

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  branch: string;
  priority: Priority;
  status: TaskStatus;
  relatedTo: RelatedTo;
  relatedName: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
}

const team = ["Arun Kumar", "Meera Nair", "Vijay CRE", "Renu Thomas", "Salman Khan", "Rajesh Kumar", "Priya Accounts", "HR Admin"];
const relatedTypes: RelatedTo[] = ["Lead", "Customer", "Sales Order", "Collection", "Complaint", "General"];

const priorityColor: Record<Priority, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Low: "bg-green-100 text-green-700",
};

const statusColor: Record<TaskStatus, string> = {
  Pending: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Overdue: "bg-red-100 text-red-700",
};

const today = new Date().toISOString().split("T")[0];

const sampleTasks: Task[] = [
  { id: "T001", title: "Follow up: Lulu Mall quotation revision", description: "Send revised quotation with updated pricing to Thomas George at Lulu Mall EKM.", assignedTo: "Vijay CRE", branch: "EKM", priority: "High", status: "Pending", relatedTo: "Lead", relatedName: "L003 - Lulu Mall Kochi", dueDate: "2026-06-18", createdAt: "2026-06-17" },
  { id: "T002", title: "Collect outstanding — Rasheed Motors", description: "Call Anwar Rasheed re ₹85,000 outstanding. Escalate to manager if no response.", assignedTo: "Meera Nair", branch: "CLT", priority: "High", status: "In Progress", relatedTo: "Collection", relatedName: "C003 - Rasheed Motors", dueDate: "2026-06-20", createdAt: "2026-06-16" },
  { id: "T003", title: "Site visit — Baby Memorial Hospital", description: "Confirm installation date for wayfinding signage. Take photos of installation points.", assignedTo: "Renu Thomas", branch: "KTYM", priority: "Medium", status: "Pending", relatedTo: "Sales Order", relatedName: "Baby Memorial Hospital", dueDate: "2026-06-19", createdAt: "2026-06-15" },
  { id: "T004", title: "Resolve Malabar Gold LED complaint", description: "Check and repair LED unit at Malabar Gold EKM that stopped working after 2 weeks.", assignedTo: "Rajesh Kumar", branch: "EKM", priority: "High", status: "In Progress", relatedTo: "Complaint", relatedName: "CMP001 - Malabar Gold", dueDate: "2026-06-17", createdAt: "2026-06-10" },
  { id: "T005", title: "Reorder Cyan solvent ink", description: "Ink level critical. Place urgent order with Sai Printware for minimum 2 litres.", assignedTo: "Rajesh Kumar", branch: "EKM", priority: "High", status: "Pending", relatedTo: "General", relatedName: "Inventory", dueDate: "2026-06-18", createdAt: "2026-06-17" },
  { id: "T006", title: "Send quotation — Muthoot Finance CLT", description: "Rajan Pillai requested quotation for 3-branch signage. Prepare and send by Friday.", assignedTo: "Arun Kumar", branch: "TVM", priority: "Medium", status: "Completed", relatedTo: "Lead", relatedName: "L001 - Muthoot Finance", dueDate: "2026-06-16", createdAt: "2026-06-14", completedAt: "2026-06-15" },
  { id: "T007", title: "Monthly payroll input — June", description: "Compile attendance and leave data for all branches, submit to accounts by 25th June.", assignedTo: "HR Admin", branch: "TVM", priority: "Medium", status: "Pending", relatedTo: "General", relatedName: "HR", dueDate: "2026-06-25", createdAt: "2026-06-17" },
  { id: "T008", title: "Follow up — SBT Bank ATM signage", description: "Sathish Kumar hasn't responded in 5 days. Call and reconfirm interest.", assignedTo: "Meera Nair", branch: "EKM", priority: "Low", status: "Overdue", relatedTo: "Lead", relatedName: "L002 - SBT Bank EKM", dueDate: "2026-06-15", createdAt: "2026-06-10" },
];

const blank = {
  title: "", description: "", assignedTo: team[0], branch: branches[0],
  priority: "Medium" as Priority, relatedTo: "General" as RelatedTo, relatedName: "", dueDate: "",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(blank);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");

  const set = (f: keyof typeof blank) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.title) return;
    const t: Task = {
      id: `T${String(tasks.length + 1).padStart(3, "0")}`,
      title: form.title, description: form.description, assignedTo: form.assignedTo,
      branch: form.branch, priority: form.priority, status: "Pending",
      relatedTo: form.relatedTo, relatedName: form.relatedName, dueDate: form.dueDate,
      createdAt: today,
    };
    setTasks(p => [t, ...p]);
    setForm(blank); setShowModal(false);
  };

  const cycleStatus = (id: string) => setTasks(p => p.map(t => {
    if (t.id !== id) return t;
    const flow: TaskStatus[] = ["Pending", "In Progress", "Completed"];
    const idx = flow.indexOf(t.status as "Pending" | "In Progress" | "Completed");
    const next = idx < 0 ? "In Progress" : flow[Math.min(idx + 1, flow.length - 1)];
    return { ...t, status: next, completedAt: next === "Completed" ? today : undefined };
  }));

  const filtered = tasks.filter(t =>
    (filterStatus === "All" || t.status === filterStatus) &&
    (filterPriority === "All" || t.priority === filterPriority) &&
    (filterAssignee === "All" || t.assignedTo === filterAssignee)
  );

  const counts = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "Pending").length,
    inProgress: tasks.filter(t => t.status === "In Progress").length,
    overdue: tasks.filter(t => t.status === "Overdue" || (t.status !== "Completed" && t.dueDate < today)).length,
    completed: tasks.filter(t => t.status === "Completed").length,
  };

  const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lc = "block text-xs font-medium text-gray-600 mb-1";

  const StatusIcon = ({ status }: { status: TaskStatus }) => {
    if (status === "Completed") return <CheckCircle size={16} className="text-green-500" />;
    if (status === "In Progress") return <Clock size={16} className="text-blue-500" />;
    if (status === "Overdue") return <AlertTriangle size={16} className="text-red-500" />;
    return <Circle size={16} className="text-gray-400" />;
  };

  return (
    <div>
      <TopBar title="Task Management" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: "Total", value: counts.total, color: "text-gray-900" },
            { label: "Pending", value: counts.pending, color: "text-gray-700" },
            { label: "In Progress", value: counts.inProgress, color: "text-blue-600" },
            { label: "Overdue", value: counts.overdue, color: "text-red-600" },
            { label: "Completed", value: counts.completed, color: "text-green-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="All">All Status</option>
              <option>Pending</option><option>In Progress</option><option>Completed</option><option>Overdue</option>
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="All">All Priorities</option><option>High</option><option>Medium</option><option>Low</option>
            </select>
            <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="All">All Assignees</option>{team.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Task
          </button>
        </div>

        {/* Task Cards */}
        <div className="space-y-3">
          {filtered.map(t => {
            const isOverdue = t.status !== "Completed" && t.dueDate < today;
            return (
              <div key={t.id} className={`bg-white rounded-xl border shadow-sm p-4 flex gap-4 ${isOverdue ? "border-red-200" : "border-gray-100"}`}>
                <button onClick={() => cycleStatus(t.id)} className="mt-0.5 flex-shrink-0">
                  <StatusIcon status={isOverdue && t.status !== "Completed" ? "Overdue" : t.status} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`font-medium text-sm ${t.status === "Completed" ? "line-through text-gray-400" : "text-gray-900"}`}>{t.title}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priorityColor[t.priority]}`}>{t.priority}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[isOverdue && t.status !== "Completed" ? "Overdue" : t.status]}`}>
                        {isOverdue && t.status !== "Completed" ? "Overdue" : t.status}
                      </span>
                    </div>
                  </div>
                  {t.description && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t.description}</p>}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <span className="text-xs text-gray-500">👤 {t.assignedTo}</span>
                    <span className="text-xs text-gray-500">🏢 {t.branch}</span>
                    <span className={`text-xs font-medium ${isOverdue && t.status !== "Completed" ? "text-red-600" : "text-gray-500"}`}>
                      📅 Due: {t.dueDate}
                    </span>
                    {t.relatedName && <span className="text-xs text-blue-600">{t.relatedTo}: {t.relatedName}</span>}
                    {t.completedAt && <span className="text-xs text-green-600">✓ Done: {t.completedAt}</span>}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{t.id}</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-400">No tasks found</div>}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Add Task</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div><label className={lc}>Task Title *</label><input type="text" placeholder="What needs to be done?" value={form.title} onChange={set("title")} className={ic} /></div>
              <div><label className={lc}>Description</label><textarea rows={2} placeholder="Add details, context, or instructions" value={form.description} onChange={set("description")} className={ic} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lc}>Assigned To</label>
                  <select value={form.assignedTo} onChange={set("assignedTo")} className={ic}>{team.map(t => <option key={t}>{t}</option>)}</select>
                </div>
                <div><label className={lc}>Branch</label>
                  <select value={form.branch} onChange={set("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                </div>
                <div><label className={lc}>Priority</label>
                  <select value={form.priority} onChange={set("priority")} className={ic}>
                    <option>High</option><option>Medium</option><option>Low</option>
                  </select>
                </div>
                <div><label className={lc}>Due Date</label><input type="date" value={form.dueDate} onChange={set("dueDate")} className={ic} /></div>
                <div><label className={lc}>Related To</label>
                  <select value={form.relatedTo} onChange={set("relatedTo")} className={ic}>{relatedTypes.map(r => <option key={r}>{r}</option>)}</select>
                </div>
                <div><label className={lc}>Reference (optional)</label><input type="text" placeholder="e.g. L003, C001, SO-001" value={form.relatedName} onChange={set("relatedName")} className={ic} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={!form.title} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Create Task</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
