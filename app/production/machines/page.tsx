"use client";

import { useState, useEffect } from "react";
import { api as apiClient } from "@/lib/api-client";
import { MACHINE_COLUMNS } from "@/lib/import-specs";
import BatchImportModal from "@/components/BatchImportModal";
import TopBar from "@/components/TopBar";
import { Loader2, Plus, X, Wrench, CheckCircle, AlertTriangle, Clock } from "lucide-react";

const BRANCHES = [
  { id: "ALL", label: "All Branches" },
  { id: "TVM",  label: "TVM" },
  { id: "KTYM", label: "KTYM" },
  { id: "EKM",  label: "EKM" },
  { id: "CLT",  label: "CLT" },
];

const MACHINE_TYPES = ["Printing", "UV Printing", "Digital Printing", "Cutting", "Laminating", "Framing", "Fabrication", "LED/Electrical", "Binding", "Other"];
const PRINT_TYPES   = ["Flex", "Vinyl", "Sticker", "Paper", "Cloth", "ACP", "Acrylic", "Canvas", "Backlit"];
const STATUSES      = ["ACTIVE", "MAINTENANCE", "RETIRED"];

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:      "bg-emerald-100 text-emerald-700",
  MAINTENANCE: "bg-amber-100 text-amber-700",
  RETIRED:     "bg-slate-100 text-slate-500",
};

const BLANK_MACHINE = { name: "", type: "", branch: "TVM", printType: "", model: "", location: "", hourlyRate: "", capacityPerHour: "", notes: "" };

export default function MachinesPage() {
  const api = apiClient;

  const [machines,   setMachines]   = useState<any[]>([]);
  const [schedules,  setSchedules]  = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeTab,  setActiveTab]  = useState("master");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [showImport, setShowImport] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(BLANK_MACHINE);
  const [scheduleData, setScheduleData] = useState({ workOrderId: "", machineId: "", scheduledStartAt: "", scheduledEndAt: "" });
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [machRes, schedRes, woRes] = await Promise.all([
        api.get("/production/machines"),
        api.get("/production/schedules"),
        api.get("/work-orders"),
      ]) as any[];
      if (machRes?.data)  setMachines(machRes.data);
      if (schedRes?.data) setSchedules(schedRes.data);
      if (woRes?.data)    setWorkOrders(woRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleAddMachine = async () => {
    if (!form.name.trim() || !form.type) { alert("Name and Type are required"); return; }
    setLoading(true);
    try {
      await api.post("/production/machines", {
        ...form,
        hourlyRate:      parseFloat(form.hourlyRate)      || 0,
        capacityPerHour: parseFloat(form.capacityPerHour) || null,
        printType:       form.printType  || null,
        model:           form.model      || null,
        location:        form.location   || null,
        notes:           form.notes      || null,
      });
      setForm(BLANK_MACHINE);
      setShowForm(false);
      fetchData();
    } catch (e) { alert("Failed to add machine"); }
    finally { setLoading(false); }
  };

  const handleAddSchedule = async () => {
    if (!scheduleData.workOrderId || !scheduleData.machineId || !scheduleData.scheduledStartAt || !scheduleData.scheduledEndAt) {
      alert("Fill all schedule fields"); return;
    }
    setLoading(true);
    try {
      await api.post("/production/schedules", scheduleData);
      setScheduleData({ workOrderId: "", machineId: "", scheduledStartAt: "", scheduledEndAt: "" });
      setShowScheduleForm(false);
      fetchData();
    } catch (e) { alert("Failed to schedule"); }
    finally { setLoading(false); }
  };

  const filteredMachines = branchFilter === "ALL" ? machines : machines.filter(m => m.branch === branchFilter);

  const branchCounts = BRANCHES.map(b => ({
    ...b,
    count: b.id === "ALL" ? machines.length : machines.filter(m => m.branch === b.id).length,
  }));

  const ic = "border rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-400";

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--background)" }}>
      <TopBar
        title="Machine Management"
        subtitle="Production"
        actions={
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
            <Plus size={14} /> Import Machines
          </button>
        }
      />

      <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto w-full">

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
          {["master", "schedule"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={activeTab === t ? { background: "#4F46E5", color: "#fff" } : { color: "var(--text-secondary)" }}>
              {t === "master" ? "Machine Master" : "Schedule Board"}
            </button>
          ))}
        </div>

        {/* ─── MACHINE MASTER ─── */}
        {activeTab === "master" && (
          <div className="space-y-4">

            {/* Branch filter tabs */}
            <div className="flex flex-wrap gap-2">
              {branchCounts.map(b => (
                <button key={b.id} onClick={() => setBranchFilter(b.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={branchFilter === b.id
                    ? { background: "#4F46E5", color: "#fff" }
                    : { background: "var(--card-bg)", color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}>
                  {b.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={branchFilter === b.id ? { background: "#6366F1" } : { background: "var(--input-bg)" }}>
                    {b.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Add Machine button */}
            <div className="flex gap-2">
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                <Plus size={14} /> Add Machine
              </button>
            </div>

            {/* Add Machine form */}
            {showForm && (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>New Machine</h3>
                  <button onClick={() => setShowForm(false)}><X size={16} className="text-gray-400" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Name *</label>
                    <input className={ic} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. EKM Printer 1"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Type *</label>
                    <select className={ic} value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
                      <option value="">Select type</option>
                      {MACHINE_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Branch *</label>
                    <select className={ic} value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
                      <option value="TVM">TVM – Thiruvananthapuram</option>
                      <option value="KTYM">KTYM – Kottayam</option>
                      <option value="EKM">EKM – Ernakulam</option>
                      <option value="CLT">CLT – Calicut</option>
                    </select>
                  </div>
                  {form.type === "Printing" || form.type === "UV Printing" || form.type === "Digital Printing" ? (
                    <div>
                      <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Print Type</label>
                      <select className={ic} value={form.printType} onChange={e => setForm(f => ({ ...f, printType: e.target.value }))}
                        style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
                        <option value="">Select</option>
                        {PRINT_TYPES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  ) : null}
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Model / Make</label>
                    <input className={ic} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="e.g. Roland TrueVIS SG2"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Location in Branch</label>
                    <input className={ic} value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Shop Floor – Bay 2"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Hourly Rate (₹)</label>
                    <input type="number" className={ic} value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} placeholder="0"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Capacity / hr</label>
                    <input type="number" className={ic} value={form.capacityPerHour} onChange={e => setForm(f => ({ ...f, capacityPerHour: e.target.value }))} placeholder="sqft or units"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Notes</label>
                    <input className={ic} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes"
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddMachine} disabled={loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#10B981,#059669)" }}>
                    {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null} Save Machine
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm border"
                    style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Machine table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--card-border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  {branchFilter === "ALL" ? "All Machines" : `${branchFilter} Machines`} ({filteredMachines.length})
                </h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-indigo-500" /></div>
              ) : filteredMachines.length === 0 ? (
                <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>
                  No machines found{branchFilter !== "ALL" ? ` for ${branchFilter}` : ""}. Add one above or import.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide" style={{ background: "var(--input-bg)", color: "var(--text-secondary)" }}>
                        <th className="px-4 py-3 text-left">Machine No</th>
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Branch</th>
                        <th className="px-4 py-3 text-left">Location</th>
                        <th className="px-4 py-3 text-right">Rate ₹/hr</th>
                        <th className="px-4 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                      {filteredMachines.map(m => (
                        <tr key={m.id} className="hover:opacity-80 transition-opacity">
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-500">{m.machineNo}</td>
                          <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                            {m.name}
                            {m.model && <span className="text-xs ml-1" style={{ color: "var(--text-muted)" }}>({m.model})</span>}
                          </td>
                          <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                            {m.type}
                            {m.printType && <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">{m.printType}</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700">{m.branch}</span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>{m.location || "—"}</td>
                          <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--text-primary)" }}>
                            {m.hourlyRate > 0 ? `₹${m.hourlyRate}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[m.status] ?? STATUS_STYLE.ACTIVE}`}>{m.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── SCHEDULE BOARD ─── */}
        {activeTab === "schedule" && (
          <div className="space-y-4">
            <button onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
              <Plus size={14} /> Schedule Job
            </button>

            {showScheduleForm && (
              <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
                <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Schedule Work Order to Machine</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Work Order</label>
                    <select className={ic} value={scheduleData.workOrderId} onChange={e => setScheduleData(s => ({ ...s, workOrderId: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
                      <option value="">Select Work Order</option>
                      {workOrders.map(wo => <option key={wo.id} value={wo.id}>{wo.workOrderNo}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Machine</label>
                    <select className={ic} value={scheduleData.machineId} onChange={e => setScheduleData(s => ({ ...s, machineId: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}>
                      <option value="">Select Machine</option>
                      {machines.filter(m => m.status === "ACTIVE").map(m => (
                        <option key={m.id} value={m.id}>{m.machineNo} — {m.name} [{m.branch}]</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>Start</label>
                    <input type="datetime-local" className={ic} value={scheduleData.scheduledStartAt}
                      onChange={e => setScheduleData(s => ({ ...s, scheduledStartAt: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block" style={{ color: "var(--text-secondary)" }}>End</label>
                    <input type="datetime-local" className={ic} value={scheduleData.scheduledEndAt}
                      onChange={e => setScheduleData(s => ({ ...s, scheduledEndAt: e.target.value }))}
                      style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddSchedule} disabled={loading}
                    className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
                    {loading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null} Schedule
                  </button>
                  <button onClick={() => setShowScheduleForm(false)} className="px-4 py-2 rounded-xl text-sm border"
                    style={{ borderColor: "var(--card-border)", color: "var(--text-secondary)" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: "var(--card-border)" }}>
                <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Scheduled Jobs ({schedules.length})</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 size={22} className="animate-spin text-indigo-500" /></div>
              ) : schedules.length === 0 ? (
                <div className="text-center py-10 text-sm" style={{ color: "var(--text-muted)" }}>No schedules yet.</div>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--card-border)" }}>
                  {schedules.map(s => (
                    <div key={s.id} className="px-5 py-3 flex items-center justify-between hover:opacity-80">
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {s.workOrder?.workOrderNo || "—"} → {s.machine?.name || "—"}
                          {s.machine?.branch && <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-bold">{s.machine.branch}</span>}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {new Date(s.scheduledStartAt).toLocaleString("en-IN")} — {new Date(s.scheduledEndAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        s.status === "SCHEDULED"   ? "bg-blue-100 text-blue-700" :
                        s.status === "IN_PROGRESS" ? "bg-amber-100 text-amber-700" :
                        s.status === "COMPLETED"   ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>{s.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showImport && (
        <BatchImportModal
          title="Import Machines"
          endpoint="/api/production/machines/bulk"
          templateName="zag-machines-template"
          columns={MACHINE_COLUMNS}
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); fetchData(); }}
        />
      )}
    </div>
  );
}
