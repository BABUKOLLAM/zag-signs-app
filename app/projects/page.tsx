"use client";
import { useState, Suspense } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, Search, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toaster";
import { LoadingState } from "@/components/States";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
const PROJECT_STATUSES = ["PLANNING", "PRODUCTION", "DISPATCH", "INSTALLATION", "COMPLETED", "ON_HOLD"];
const MILESTONE_STATUSES = ["PENDING", "COMPLETED", "DELAYED"];

const STATUS_COLOR: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-600",
  PRODUCTION: "bg-blue-100 text-blue-700",
  DISPATCH: "bg-amber-100 text-amber-700",
  INSTALLATION: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  ON_HOLD: "bg-red-100 text-red-600",
};

const MS_COLOR: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-500",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  DELAYED: "bg-red-100 text-red-600",
};

type Milestone = { title: string; dueDate: string; status: string };
type Project = {
  id: string; projectNo: string; name: string; branch: string; status: string;
  budget: number; startDate: string; endDate: string | null;
  customer: { name: string; company: string } | null;
  manager: { name: string } | null;
  milestones: (Milestone & { id: string; completedDate: string | null })[];
};

const EMPTY_MILESTONE: Milestone = { title: "", dueDate: "", status: "PENDING" };
const EMPTY = {
  name: "", branch: "TVM", status: "PLANNING", budget: 0,
  startDate: new Date().toISOString().slice(0, 10), endDate: "",
  customerId: "", salesOrderId: "", managerId: "",
  milestones: [{ ...EMPTY_MILESTONE }] as Milestone[],
};

function ProjectsPageInner() {
  const dr = useDateRangeQuery();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const toast = useToast();

  const { data: projects, loading, refetch } = useApi<Project[]>("/projects", dr.params);
  const { data: customers } = useApi<{ id: string; name: string; company: string }[]>("/customers?limit=200");

  const filtered = (projects ?? []).filter(p =>
    (!statusFilter || p.status === statusFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.projectNo.toLowerCase().includes(search.toLowerCase()))
  );

  function addMilestone() { setForm((f: any) => ({ ...f, milestones: [...f.milestones, { ...EMPTY_MILESTONE }] })); }
  function updateMilestone(i: number, field: string, val: string) {
    setForm((f: any) => {
      const ms = [...f.milestones];
      ms[i] = { ...ms[i], [field]: val };
      return { ...f, milestones: ms };
    });
  }
  function removeMilestone(i: number) { setForm((f: any) => ({ ...f, milestones: f.milestones.filter((_: any, idx: number) => idx !== i) })); }

  async function save() {
    if (!form.name) return toast.error("Project name required");
    setSaving(true);
    try {
      await api.post("/projects", form);
      toast.success("Project created");
      setShowForm(false); setForm(EMPTY); refetch();
    } catch { toast.error("Save failed"); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    await api.put(`/projects/${id}`, { status });
    refetch();
    if (selectedProject?.id === id) setSelectedProject(p => p ? { ...p, status } : p);
  }

  const stats = {
    active: (projects ?? []).filter(p => !["COMPLETED", "ON_HOLD"].includes(p.status)).length,
    completed: (projects ?? []).filter(p => p.status === "COMPLETED").length,
    onHold: (projects ?? []).filter(p => p.status === "ON_HOLD").length,
    budget: (projects ?? []).reduce((s, p) => s + p.budget, 0),
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Project Management" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Projects", value: stats.active, color: "indigo" },
            { label: "Completed", value: stats.completed, color: "emerald" },
            { label: "On Hold", value: stats.onHold, color: "red" },
            { label: "Total Budget", value: fmt(stats.budget), color: "amber" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <p className="text-xs text-slate-500">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600 mt-1`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Status</option>
            {PROJECT_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError} basisLabel="Created" />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-400" : "text-slate-400"} />
          </button>
          <button onClick={() => { setForm(EMPTY); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
            style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
            <Plus size={14} /> New Project
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Project list */}
          <div className="space-y-3">
            {loading && <p className="text-center text-slate-400 py-10">Loading…</p>}
            {!loading && filtered.length === 0 && <p className="text-center text-slate-400 py-10">No projects found</p>}
            {filtered.map(p => (
              <div key={p.id} onClick={() => setSelectedProject(p)}
                className={`bg-white rounded-2xl border p-4 shadow-sm cursor-pointer transition-all ${selectedProject?.id === p.id ? "border-indigo-400 ring-1 ring-indigo-200" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.projectNo} · {p.customer?.name ?? "No customer"}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status]}`}>{p.status}</span>
                </div>
                <div className="flex gap-3 mt-3 text-xs text-slate-500">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{p.branch}</span>
                  <span>Budget: {fmt(p.budget)}</span>
                  {p.endDate && <span>Due: {new Date(p.endDate).toLocaleDateString("en-IN")}</span>}
                </div>
                {/* Milestone progress */}
                {p.milestones.length > 0 && (
                  <div className="mt-3 flex gap-1">
                    {p.milestones.map((m, i) => (
                      <div key={i} title={m.title}
                        className={`h-1.5 flex-1 rounded-full ${m.status === "COMPLETED" ? "bg-emerald-400" : m.status === "DELAYED" ? "bg-red-400" : "bg-slate-200"}`} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Project detail */}
          {selectedProject ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">{selectedProject.name}</h3>
                  <p className="text-xs text-slate-500">{selectedProject.projectNo}</p>
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Customer", selectedProject.customer?.name ?? "—"],
                  ["Manager", selectedProject.manager?.name ?? "—"],
                  ["Branch", selectedProject.branch],
                  ["Budget", fmt(selectedProject.budget)],
                  ["Start", new Date(selectedProject.startDate).toLocaleDateString("en-IN")],
                  ["End", selectedProject.endDate ? new Date(selectedProject.endDate).toLocaleDateString("en-IN") : "—"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs text-slate-400">{l}</p>
                    <p className="font-semibold text-slate-700">{v}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Update Status</p>
                <div className="flex gap-2 flex-wrap">
                  {PROJECT_STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selectedProject.id, s)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${selectedProject.status === s ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 mb-2">Milestones</p>
                <div className="space-y-2">
                  {selectedProject.milestones.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                      {m.status === "COMPLETED" ? <CheckCircle size={14} className="text-emerald-500" /> :
                        m.status === "DELAYED" ? <AlertTriangle size={14} className="text-red-500" /> :
                          <Clock size={14} className="text-slate-400" />}
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-700">{m.title}</p>
                        <p className="text-xs text-slate-400">{m.dueDate ? new Date(m.dueDate).toLocaleDateString("en-IN") : "No date"}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${MS_COLOR[m.status]}`}>{m.status}</span>
                    </div>
                  ))}
                  {selectedProject.milestones.length === 0 && <p className="text-xs text-slate-400">No milestones</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 flex items-center justify-center p-10">
              <p className="text-slate-400 text-sm">Click a project to see details</p>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New Project</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Name *</label>
                <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer</label>
                <select value={form.customerId} onChange={e => setForm((f: any) => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select customer —</option>
                  {(customers ?? []).map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={form.branch} onChange={e => setForm((f: any) => ({ ...f, branch: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {BRANCHES.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm((f: any) => ({ ...f, budget: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm((f: any) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-600">Milestones</label>
                  <button onClick={addMilestone} className="text-xs text-indigo-600 flex items-center gap-1"><Plus size={11} /> Add</button>
                </div>
                <div className="space-y-2">
                  {form.milestones.map((m: Milestone, i: number) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={m.title} onChange={e => updateMilestone(i, "title", e.target.value)}
                        placeholder="Milestone title" className="flex-1 px-2 py-1.5 rounded-xl border border-slate-200 text-xs" />
                      <input type="date" value={m.dueDate} onChange={e => updateMilestone(i, "dueDate", e.target.value)}
                        className="px-2 py-1.5 rounded-xl border border-slate-200 text-xs w-32" />
                      <button onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? "Creating…" : "Create Project"}
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
export default function ProjectsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProjectsPageInner />
    </Suspense>
  );
}
