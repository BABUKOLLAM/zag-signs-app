"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, RefreshCw, X, ShieldCheck, Wrench, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/Toaster";

const AMC_STATUSES = ["ACTIVE", "EXPIRED", "CANCELLED", "RENEWED"];
const VISIT_FREQS = ["MONTHLY", "QUARTERLY", "HALF_YEARLY", "ANNUALLY"];
const TICKET_TYPES = ["WARRANTY", "AMC", "ADHOC"];
const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const TICKET_STATUSES = ["OPEN", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const AMC_STATUS_COLOR: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  EXPIRED: "bg-red-100 text-red-600",
  CANCELLED: "bg-slate-100 text-slate-500",
  RENEWED: "bg-blue-100 text-blue-700",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-500",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};
const TICKET_STATUS_COLOR: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  ASSIGNED: "bg-violet-100 text-violet-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-slate-100 text-slate-500",
};

type AMC = {
  id: string; amcNo: string; description: string; startDate: string; endDate: string;
  annualValue: number; status: string; visitFrequency: string;
  customer: { name: string; company: string; phone: string };
};
type Ticket = {
  id: string; ticketNo: string; type: string; priority: string; status: string;
  description: string; slaHours: number; resolvedAt: string | null; createdAt: string;
  customer: { name: string; company: string; phone: string };
  amc: { amcNo: string } | null;
  assignedTo: { name: string } | null;
};

const AMC_EMPTY = { customerId: "", description: "", startDate: "", endDate: "", annualValue: 0, visitFrequency: "QUARTERLY", status: "ACTIVE" };
const TICKET_EMPTY = { customerId: "", amcId: "", type: "AMC", priority: "MEDIUM", description: "", slaHours: 24, assignedToId: "" };

export default function AMCPage() {
  const [tab, setTab] = useState<"contracts" | "tickets">("contracts");
  const toast = useToast();

  const { data: contracts, loading: amcLoading, refetch: refetchAMC } = useApi<AMC[]>("/amc");
  const { data: tickets, loading: ticketLoading, refetch: refetchTickets } = useApi<Ticket[]>("/service-tickets");
  const { data: customers } = useApi<{ id: string; name: string; company: string }[]>("/customers?limit=200");
  const { data: users } = useApi<{ id: string; name: string }[]>("/employees?limit=100");

  const [showAMCForm, setShowAMCForm] = useState(false);
  const [amcForm, setAmcForm] = useState<any>(AMC_EMPTY);
  const [savingAMC, setSavingAMC] = useState(false);

  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState<any>(TICKET_EMPTY);
  const [savingTicket, setSavingTicket] = useState(false);

  const [ticketStatusFilter, setTicketStatusFilter] = useState("");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("");

  async function saveAMC() {
    if (!amcForm.customerId || !amcForm.startDate) return toast.error("Customer and start date required");
    setSavingAMC(true);
    try {
      await api.post("/amc", amcForm);
      toast.success("AMC contract created");
      setShowAMCForm(false); setAmcForm(AMC_EMPTY); refetchAMC();
    } catch { toast.error("Save failed"); }
    setSavingAMC(false);
  }

  async function saveTicket() {
    if (!ticketForm.customerId || !ticketForm.description) return toast.error("Customer and description required");
    setSavingTicket(true);
    try {
      await api.post("/service-tickets", ticketForm);
      toast.success("Service ticket raised");
      setShowTicketForm(false); setTicketForm(TICKET_EMPTY); refetchTickets();
    } catch { toast.error("Save failed"); }
    setSavingTicket(false);
  }

  async function updateTicketStatus(id: string, status: string) {
    await api.put(`/service-tickets/${id}`, { status });
    refetchTickets();
  }

  const filteredTickets = (tickets ?? []).filter(t =>
    (!ticketStatusFilter || t.status === ticketStatusFilter) &&
    (!ticketPriorityFilter || t.priority === ticketPriorityFilter)
  );

  const openTickets = (tickets ?? []).filter(t => !["RESOLVED", "CLOSED"].includes(t.status));
  const critical = (tickets ?? []).filter(t => t.priority === "CRITICAL" && t.status === "OPEN");
  const activeContracts = (contracts ?? []).filter(c => c.status === "ACTIVE");

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="AMC & Warranty" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Contracts", value: activeContracts.length, sub: fmt(activeContracts.reduce((s, c) => s + c.annualValue, 0)) + "/yr", color: "emerald", icon: <ShieldCheck size={16} /> },
            { label: "Open Tickets", value: openTickets.length, sub: "awaiting resolution", color: "blue", icon: <Wrench size={16} /> },
            { label: "Critical / Urgent", value: critical.length, sub: "needs immediate action", color: "red", icon: <AlertTriangle size={16} /> },
            { label: "Total Contracts", value: (contracts ?? []).length, sub: "all time", color: "indigo", icon: <ShieldCheck size={16} /> },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${c.color}-50 text-${c.color}-600 flex-shrink-0`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold text-${c.color}-600`}>{c.value}</p>
                <p className="text-xs text-slate-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-slate-200 p-1 w-fit shadow-sm">
          {[{ key: "contracts", label: "AMC Contracts" }, { key: "tickets", label: "Service Tickets" }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:bg-slate-50"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ──── AMC CONTRACTS ──── */}
        {tab === "contracts" && (
          <>
            <div className="flex justify-end gap-3">
              <button onClick={refetchAMC} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <RefreshCw size={14} className={amcLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
              </button>
              <button onClick={() => { setAmcForm(AMC_EMPTY); setShowAMCForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> New Contract
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amcLoading && <p className="col-span-3 text-center py-10 text-slate-400">Loading…</p>}
              {!amcLoading && (contracts ?? []).length === 0 && <p className="col-span-3 text-center py-10 text-slate-400">No AMC contracts yet</p>}
              {(contracts ?? []).map(c => (
                <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-slate-800">{c.customer?.name}</p>
                      <p className="text-xs text-slate-500">{c.amcNo}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${AMC_STATUS_COLOR[c.status]}`}>{c.status}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-2">{c.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-slate-400">Annual Value</p><p className="font-bold text-slate-700">{fmt(c.annualValue)}</p></div>
                    <div><p className="text-slate-400">Frequency</p><p className="font-semibold text-slate-700">{c.visitFrequency}</p></div>
                    <div><p className="text-slate-400">Start</p><p className="text-slate-600">{new Date(c.startDate).toLocaleDateString("en-IN")}</p></div>
                    <div><p className="text-slate-400">End</p><p className="text-slate-600">{new Date(c.endDate).toLocaleDateString("en-IN")}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ──── SERVICE TICKETS ──── */}
        {tab === "tickets" && (
          <>
            <div className="flex gap-3 flex-wrap">
              <select value={ticketStatusFilter} onChange={e => setTicketStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
                <option value="">All Status</option>
                {TICKET_STATUSES.map(s => <option key={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
              <select value={ticketPriorityFilter} onChange={e => setTicketPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
                <option value="">All Priority</option>
                {TICKET_PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
              <button onClick={refetchTickets} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                <RefreshCw size={14} className={ticketLoading ? "animate-spin text-slate-400" : "text-slate-400"} />
              </button>
              <button onClick={() => { setTicketForm(TICKET_EMPTY); setShowTicketForm(true); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold ml-auto"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Raise Ticket
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Ticket", "Customer", "Type", "Priority", "Assigned To", "SLA", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {ticketLoading && <tr><td colSpan={8} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                  {!ticketLoading && filteredTickets.length === 0 && <tr><td colSpan={8} className="text-center py-10 text-slate-400">No tickets found</td></tr>}
                  {filteredTickets.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs text-indigo-600">{t.ticketNo}</p>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-xs truncate">{t.description}</p>
                      </td>
                      <td className="px-4 py-3"><p className="text-xs font-semibold">{t.customer?.name}</p><p className="text-xs text-slate-400">{t.customer?.phone}</p></td>
                      <td className="px-4 py-3 text-xs">{t.type}</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-600">{t.assignedTo?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs">{t.slaHours}h</td>
                      <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TICKET_STATUS_COLOR[t.status]}`}>{t.status.replace(/_/g, " ")}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {t.status === "OPEN" && <button onClick={() => updateTicketStatus(t.id, "IN_PROGRESS")} className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100">Start</button>}
                          {t.status === "IN_PROGRESS" && <button onClick={() => updateTicketStatus(t.id, "RESOLVED")} className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100">Resolve</button>}
                          {t.status === "RESOLVED" && <button onClick={() => updateTicketStatus(t.id, "CLOSED")} className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200">Close</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* AMC Modal */}
      {showAMCForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">New AMC Contract</h3>
              <button onClick={() => setShowAMCForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer *</label>
                <select value={amcForm.customerId} onChange={e => setAmcForm((f: any) => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select —</option>
                  {(customers ?? []).map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea value={amcForm.description} onChange={e => setAmcForm((f: any) => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" placeholder="Signage maintenance contract details…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date *</label>
                  <input type="date" value={amcForm.startDate} onChange={e => setAmcForm((f: any) => ({ ...f, startDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input type="date" value={amcForm.endDate} onChange={e => setAmcForm((f: any) => ({ ...f, endDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Annual Value (₹)</label>
                <input type="number" value={amcForm.annualValue} onChange={e => setAmcForm((f: any) => ({ ...f, annualValue: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Visit Frequency</label>
                <select value={amcForm.visitFrequency} onChange={e => setAmcForm((f: any) => ({ ...f, visitFrequency: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {VISIT_FREQS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveAMC} disabled={savingAMC}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingAMC ? "Creating…" : "Create Contract"}
              </button>
              <button onClick={() => setShowAMCForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Raise Service Ticket</h3>
              <button onClick={() => setShowTicketForm(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Customer *</label>
                <select value={ticketForm.customerId} onChange={e => setTicketForm((f: any) => ({ ...f, customerId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— Select —</option>
                  {(customers ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Linked AMC Contract</label>
                <select value={ticketForm.amcId} onChange={e => setTicketForm((f: any) => ({ ...f, amcId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">— None / Ad-hoc —</option>
                  {(contracts ?? []).filter(c => c.status === "ACTIVE").map(c => (
                    <option key={c.id} value={c.id}>{c.amcNo} — {c.customer?.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                  <select value={ticketForm.type} onChange={e => setTicketForm((f: any) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {TICKET_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Priority</label>
                  <select value={ticketForm.priority} onChange={e => setTicketForm((f: any) => ({ ...f, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {TICKET_PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                <textarea value={ticketForm.description} onChange={e => setTicketForm((f: any) => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" placeholder="Describe the issue…" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Assign To</label>
                  <select value={ticketForm.assignedToId} onChange={e => setTicketForm((f: any) => ({ ...f, assignedToId: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">— Unassigned —</option>
                    {(users ?? []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SLA (hours)</label>
                  <input type="number" value={ticketForm.slaHours} onChange={e => setTicketForm((f: any) => ({ ...f, slaHours: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveTicket} disabled={savingTicket}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {savingTicket ? "Raising…" : "Raise Ticket"}
              </button>
              <button onClick={() => setShowTicketForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
