"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/Toaster";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import WorkOrderSlipTemplate, { type WorkOrderSlip, type SlipCompany } from "@/components/WorkOrderSlipTemplate";
import {
  Plus, RefreshCw, Printer, UserPlus, CheckCircle, Clock, X,
  Trash2, Activity, AlertTriangle, Timer, Users as UsersIcon, Pencil,
} from "lucide-react";

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────
interface Ticket {
  id: string; ticketNo: string; branch: string;
  source: string; status: string; priority: string;
  customerId: string | null; customerName: string;
  customerPhone: string; customerEmail: string; customerAddress: string;
  customerCompany: string;
  quotationId: string | null; quotationNo: string;
  natureOfWork: string; description: string; reference: string;
  estimatedCost: number; advancePaid: number; balanceDue: number;
  paymentMode: string;
  receivedAt: string; expectedAt: string | null;
  assignedAt: string | null; startedAt: string | null;
  halfDoneAt: string | null; completedAt: string | null;
  assignedDesignerId: string | null; assignedDesignerName: string;
  halfDoneReason: string; designerRemarks: string; closingNotes: string;
  createdByName: string;
  createdAt: string;
}

interface Designer {
  id: string; name: string; email: string; branch: string | null;
  activeCount: number; wipCount: number; halfDoneCount: number;
}

const SOURCES = [
  { value: "WALK_IN",   label: "Walk-in"    },
  { value: "PHONE",     label: "Phone Call" },
  { value: "WHATSAPP",  label: "WhatsApp"   },
  { value: "EMAIL",     label: "Email"      },
  { value: "QUOTATION", label: "From Quotation" },
  { value: "OTHER",     label: "Other"      },
];
const PRIORITIES = [
  { value: "LOW",    label: "Low"    },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH",   label: "High"   },
  { value: "URGENT", label: "Urgent" },
];
const PAYMENT_MODES = ["Cash", "UPI", "NEFT", "Cheque", "Card", "On Delivery"];
const NATURES = [
  "Signboard", "LED Display", "Acrylic Letters", "ACP Cladding",
  "Vehicle Wrap", "Hoarding", "Banner / Flex", "Glow Sign",
  "Standee", "Vinyl Print", "Channel Letters", "Neon Sign",
  "Repair / Service", "Site Survey", "Installation", "Other",
];

const STATUS_TABS = [
  { value: "",            label: "All",         color: "indigo" },
  { value: "NEW",         label: "New",         color: "gray"   },
  { value: "ASSIGNED",    label: "Assigned",    color: "blue"   },
  { value: "IN_PROGRESS", label: "In Progress", color: "amber"  },
  { value: "HALF_DONE",   label: "Half Done",   color: "orange" },
  { value: "DONE",        label: "Done",        color: "emerald"},
  { value: "BILLED",      label: "Billed",      color: "green"  },
  { value: "CANCELLED",   label: "Cancelled",   color: "rose"   },
];

const STATUS_COLOR: Record<string, string> = {
  NEW:         "bg-gray-100 text-gray-700",
  ASSIGNED:    "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  HALF_DONE:   "bg-orange-100 text-orange-700",
  DONE:        "bg-emerald-100 text-emerald-700",
  BILLED:      "bg-green-100 text-green-700",
  CANCELLED:   "bg-rose-100 text-rose-700",
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW:    "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH:   "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";

const BLANK_FORM = {
  source: "WALK_IN",
  customerId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  customerCompany: "",
  natureOfWork: "Signboard",
  description: "",
  reference: "",
  estimatedCost: "",
  advancePaid: "",
  paymentMode: "Cash",
  expectedAt: "",
  priority: "MEDIUM",
  assignedDesignerId: "",
};

interface CustomerLite { id: string; name: string; company: string; phone: string; email: string | null; address: string | null; }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function fmtINR(n: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
function turnaroundHours(t: Ticket): number | null {
  if (!t.completedAt || !t.assignedAt) return null;
  return Math.round((new Date(t.completedAt).getTime() - new Date(t.assignedAt).getTime()) / (1000 * 60 * 60));
}
function isOverdue(t: Ticket): boolean {
  if (!t.expectedAt) return false;
  if (t.status === "DONE" || t.status === "BILLED" || t.status === "CANCELLED") return false;
  return new Date(t.expectedAt).getTime() < Date.now();
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function WorkOrderTicketsPage() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, loading, error, refetch } = useApi<Ticket[]>("/work-order-tickets", {
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const tickets = useMemo(() => data ?? [], [data]);

  // Designers + customers
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [customers, setCustomers] = useState<CustomerLite[]>([]);
  const [company, setCompany] = useState<SlipCompany | null>(null);

  const loadDesigners = useCallback(async () => {
    try {
      const res = await api.get<{ data: Designer[] }>("/designers");
      setDesigners(res.data);
    } catch { /* swallow — UI degrades */ }
  }, []);

  useEffect(() => { loadDesigners(); }, [loadDesigners]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ data: CustomerLite[] }>("/customers");
        setCustomers(res.data);
      } catch { /* swallow */ }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<{ data: SlipCompany }>("/settings");
        setCompany(res.data);
      } catch { /* swallow */ }
    })();
  }, []);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [creating, setCreating] = useState(false);

  // Assign modal
  const [assignTicket, setAssignTicket] = useState<Ticket | null>(null);
  const [assignDesigner, setAssignDesigner] = useState("");
  const [assignBusy, setAssignBusy] = useState(false);

  // Status-change modal (for half-done reason / done remarks)
  const [closingTicket, setClosingTicket] = useState<{ t: Ticket; to: "HALF_DONE" | "DONE" } | null>(null);
  const [closingText, setClosingText] = useState("");
  const [closingBusy, setClosingBusy] = useState(false);

  // Print slip
  const [printSlip, setPrintSlip] = useState<WorkOrderSlip | null>(null);

  const onChange = (k: keyof typeof BLANK_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  // When customer picked from existing, prefill the rest
  useEffect(() => {
    if (!form.customerId) return;
    const c = customers.find((x) => x.id === form.customerId);
    if (!c) return;
    setForm((p) => ({
      ...p,
      customerName:    c.name,
      customerCompany: c.company,
      customerPhone:   c.phone ?? "",
      customerEmail:   c.email ?? "",
      customerAddress: c.address ?? "",
    }));
  }, [form.customerId, customers]);

  const handleCreate = async () => {
    if (!form.customerName.trim()) { toast.error("Customer name is required"); return; }
    if (!form.natureOfWork.trim()) { toast.error("Nature of work is required"); return; }
    if (!form.description.trim())  { toast.error("Description is required");  return; }
    setCreating(true);
    try {
      const res = await api.post<{ data: Ticket }>("/work-order-tickets", {
        source: form.source,
        customerId:      form.customerId || undefined,
        customerName:    form.customerName,
        customerPhone:   form.customerPhone || undefined,
        customerEmail:   form.customerEmail || undefined,
        customerAddress: form.customerAddress || undefined,
        natureOfWork:    form.natureOfWork,
        description:     form.description,
        reference:       form.reference || undefined,
        estimatedCost:   form.estimatedCost ? Number(form.estimatedCost) : 0,
        advancePaid:     form.advancePaid   ? Number(form.advancePaid)   : 0,
        paymentMode:     form.paymentMode || undefined,
        expectedAt:      form.expectedAt || undefined,
        priority:        form.priority,
        assignedDesignerId: form.assignedDesignerId || undefined,
      });
      toast.success(`Ticket ${res.data.ticketNo} created`);
      setForm({ ...BLANK_FORM });
      setShowCreate(false);
      refetch();
      loadDesigners();
      // Auto open print preview
      openPrintFor(res.data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create ticket");
    } finally { setCreating(false); }
  };

  const handleAssign = async () => {
    if (!assignTicket || !assignDesigner) return;
    setAssignBusy(true);
    try {
      await api.put(`/work-order-tickets/${assignTicket.id}`, {
        assignedDesignerId: assignDesigner,
        eventNote: "Designer assigned",
      });
      toast.success("Designer assigned");
      setAssignTicket(null);
      setAssignDesigner("");
      refetch();
      loadDesigners();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to assign");
    } finally { setAssignBusy(false); }
  };

  const handleStatusClose = async () => {
    if (!closingTicket) return;
    if (!closingText.trim()) { toast.error("This field is required"); return; }
    setClosingBusy(true);
    try {
      await api.put(`/work-order-tickets/${closingTicket.t.id}`, {
        status: closingTicket.to,
        ...(closingTicket.to === "HALF_DONE"
          ? { halfDoneReason: closingText }
          : { designerRemarks: closingText }),
      });
      toast.success(closingTicket.to === "DONE" ? "Marked Done" : "Marked Half-Done");
      setClosingTicket(null);
      setClosingText("");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status");
    } finally { setClosingBusy(false); }
  };

  const openPrintFor = (t: Ticket) => {
    setPrintSlip({
      ticketNo: t.ticketNo,
      branch: t.branch,
      source: t.source,
      status: t.status,
      priority: t.priority,
      customerName: t.customerName,
      customerCompany: t.customerCompany,
      customerPhone: t.customerPhone,
      customerEmail: t.customerEmail,
      customerAddress: t.customerAddress,
      quotationNo: t.quotationNo,
      natureOfWork: t.natureOfWork,
      description: t.description,
      reference: t.reference,
      estimatedCost: t.estimatedCost,
      advancePaid: t.advancePaid,
      balanceDue: t.balanceDue,
      paymentMode: t.paymentMode,
      receivedAt: t.receivedAt,
      expectedAt: t.expectedAt,
      assignedDesignerName: t.assignedDesignerName,
      createdByName: t.createdByName,
    });
    setTimeout(() => window.print(), 200);
  };

  const handleDelete = async (t: Ticket) => {
    if (!confirm(`Delete ticket ${t.ticketNo}? This cannot be undone.`)) return;
    try {
      await api.del(`/work-order-tickets/${t.id}`);
      toast.success("Ticket deleted");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  // ── Aggregates ──
  const counts = useMemo(() => {
    const c: Record<string, number> = { NEW: 0, ASSIGNED: 0, IN_PROGRESS: 0, HALF_DONE: 0, DONE: 0, BILLED: 0 };
    for (const t of tickets) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [tickets]);

  const overdueCount = useMemo(() => tickets.filter(isOverdue).length, [tickets]);

  const avgTurnaroundHours = useMemo(() => {
    const closed = tickets.map(turnaroundHours).filter((h): h is number => h !== null);
    if (!closed.length) return null;
    return Math.round(closed.reduce((a, b) => a + b, 0) / closed.length);
  }, [tickets]);

  return (
    <>
      <TopBar title="Work Order Tickets" subtitle="Front-office ticketing → designer queue → completion" />

      <div className="p-4 lg:p-6 space-y-4">
        {/* ── SUMMARY CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <SumCard label="New + Assigned" value={(counts.NEW + counts.ASSIGNED).toString()} icon={Activity} color="indigo" />
          <SumCard label="In Progress"    value={counts.IN_PROGRESS.toString()} icon={Clock}      color="amber" />
          <SumCard label="Half Done"      value={counts.HALF_DONE.toString()}    icon={AlertTriangle} color="orange" />
          <SumCard label="Done"           value={counts.DONE.toString()}         icon={CheckCircle} color="emerald" />
          <SumCard label="Overdue"        value={overdueCount.toString()}        icon={Timer}        color="red" highlight={overdueCount > 0} />
          <SumCard label="Avg. TAT (hrs)" value={avgTurnaroundHours?.toString() ?? "—"} icon={Activity} color="indigo" />
        </div>

        {/* ── DESIGNER PRODUCTIVITY ── */}
        {designers.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-gray-800">Designer Load</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {designers.map((d) => (
                <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-gray-50">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                    <p className="text-xs text-gray-500">{d.branch ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-700">{d.activeCount}</p>
                    <p className="text-xs text-gray-500">
                      WIP {d.wipCount} · HD {d.halfDoneCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STATUS_TABS.map((s) => {
              const active = statusFilter === s.value;
              return (
                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                    active ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}>
                  {s.label}{s.value && counts[s.value] !== undefined ? ` (${counts[s.value]})` : ""}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ticket / customer…"
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
              <RefreshCw size={14} className="text-gray-600" />
            </button>
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
              <Plus size={14} /> New Ticket
            </button>
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <TableSkeleton rows={5} /> : error ? <ErrorState message={error} onRetry={refetch} /> :
            tickets.length === 0 ? (
              <div className="py-12 text-center">
                <EmptyState
                  label="No tickets yet"
                  hint="Create your first work order ticket — walk-in, phone, WhatsApp, or from a quotation."
                />
                <button onClick={() => setShowCreate(true)}
                  className="mt-3 inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
                  <Plus size={14} /> New Ticket
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <Th>Ticket</Th>
                      <Th>Customer</Th>
                      <Th>Source</Th>
                      <Th>Nature</Th>
                      <Th>Designer</Th>
                      <Th>Status</Th>
                      <Th right>Cost / Balance</Th>
                      <Th>ETA</Th>
                      <Th right>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => {
                      const overdue = isOverdue(t);
                      return (
                        <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <Td>
                            <div className="font-semibold text-gray-900">{t.ticketNo}</div>
                            <div className="text-xs text-gray-500">{t.branch} · {fmtDate(t.createdAt)}</div>
                            {t.quotationNo && <div className="text-xs text-indigo-600 mt-0.5">Q: {t.quotationNo}</div>}
                          </Td>
                          <Td>
                            <div className="font-medium text-gray-900">{t.customerName}</div>
                            {t.customerCompany && <div className="text-xs text-gray-500">{t.customerCompany}</div>}
                            {t.customerPhone && <div className="text-xs text-gray-500">{t.customerPhone}</div>}
                          </Td>
                          <Td>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {SOURCES.find((s) => s.value === t.source)?.label ?? t.source}
                            </span>
                          </Td>
                          <Td>
                            <div className="text-gray-900">{t.natureOfWork}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{t.description}</div>
                          </Td>
                          <Td>
                            {t.assignedDesignerName ? (
                              <span className="text-sm text-gray-800">{t.assignedDesignerName}</span>
                            ) : (
                              <span className="text-xs text-gray-400 italic">unassigned</span>
                            )}
                          </Td>
                          <Td>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[t.status] ?? "bg-gray-100"}`}>
                              {t.status.replace(/_/g, " ")}
                            </span>
                            <div className="mt-1">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_COLOR[t.priority]}`}>
                                {t.priority}
                              </span>
                            </div>
                          </Td>
                          <Td right>
                            <div className="font-semibold text-gray-900">₹ {fmtINR(t.estimatedCost)}</div>
                            {t.balanceDue > 0 && (
                              <div className="text-xs text-red-600">Bal ₹ {fmtINR(t.balanceDue)}</div>
                            )}
                          </Td>
                          <Td>
                            <span className={overdue ? "text-red-600 font-semibold" : "text-gray-700"}>
                              {fmtDate(t.expectedAt)}
                            </span>
                            {overdue && <div className="text-[10px] text-red-600">OVERDUE</div>}
                          </Td>
                          <Td right>
                            <div className="flex items-center justify-end gap-1">
                              <IconBtn title="Print Slip" onClick={() => openPrintFor(t)}><Printer size={14} /></IconBtn>
                              <IconBtn title="Assign Designer"
                                onClick={() => { setAssignTicket(t); setAssignDesigner(t.assignedDesignerId ?? ""); }}>
                                <UserPlus size={14} />
                              </IconBtn>
                              {(t.status === "ASSIGNED" || t.status === "IN_PROGRESS" || t.status === "HALF_DONE") && (
                                <IconBtn title="Mark Done" color="green"
                                  onClick={() => { setClosingTicket({ t, to: "DONE" }); setClosingText(""); }}>
                                  <CheckCircle size={14} />
                                </IconBtn>
                              )}
                              {(t.status === "ASSIGNED" || t.status === "IN_PROGRESS") && (
                                <IconBtn title="Mark Half-Done" color="orange"
                                  onClick={() => { setClosingTicket({ t, to: "HALF_DONE" }); setClosingText(""); }}>
                                  <AlertTriangle size={14} />
                                </IconBtn>
                              )}
                              <IconBtn title="Delete" color="red" onClick={() => handleDelete(t)}>
                                <Trash2 size={14} />
                              </IconBtn>
                            </div>
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>

      {/* ── CREATE MODAL ── */}
      {showCreate && (
        <Modal onClose={() => setShowCreate(false)} title="New Work Order Ticket">
          <div className="space-y-3">
            {/* Source */}
            <div>
              <Label>Source</Label>
              <div className="grid grid-cols-3 gap-2">
                {SOURCES.map((s) => (
                  <button key={s.value} type="button"
                    onClick={() => setForm((p) => ({ ...p, source: s.value }))}
                    className={`text-xs px-3 py-2 rounded-lg border font-medium transition ${
                      form.source === s.value
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}>{s.label}</button>
                ))}
              </div>
            </div>

            {/* Customer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Pick Existing Customer</Label>
                <select value={form.customerId} onChange={onChange("customerId")} className={ic}>
                  <option value="">— New / Walk-in customer —</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Customer Name *</Label>
                <input value={form.customerName} onChange={onChange("customerName")} className={ic} placeholder="Walk-in customer" />
              </div>
              <div>
                <Label>Phone</Label>
                <input value={form.customerPhone} onChange={onChange("customerPhone")} className={ic} placeholder="+91 …" />
              </div>
              <div>
                <Label>Email</Label>
                <input value={form.customerEmail} onChange={onChange("customerEmail")} className={ic} />
              </div>
              <div className="col-span-2">
                <Label>Address</Label>
                <textarea value={form.customerAddress} onChange={onChange("customerAddress")} className={ic} rows={2} />
              </div>
            </div>

            <hr className="my-2 border-gray-100" />

            {/* Work */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Nature of Work *</Label>
                <select value={form.natureOfWork} onChange={onChange("natureOfWork")} className={ic}>
                  {NATURES.map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select value={form.priority} onChange={onChange("priority")} className={ic}>
                  {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <Label>Description of Work *</Label>
                <textarea value={form.description} onChange={onChange("description")} className={ic} rows={3}
                  placeholder="Size, material, colour, finish, mounting, etc." />
              </div>
              <div>
                <Label>Reference (PO / sketch ref)</Label>
                <input value={form.reference} onChange={onChange("reference")} className={ic} />
              </div>
              <div>
                <Label>Expected Completion</Label>
                <input type="date" value={form.expectedAt} onChange={onChange("expectedAt")} className={ic} />
              </div>
            </div>

            <hr className="my-2 border-gray-100" />

            {/* Costing */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Estimated Cost (₹)</Label>
                <input type="number" value={form.estimatedCost} onChange={onChange("estimatedCost")} className={ic} placeholder="0" />
              </div>
              <div>
                <Label>Advance Paid (₹)</Label>
                <input type="number" value={form.advancePaid} onChange={onChange("advancePaid")} className={ic} placeholder="0" />
              </div>
              <div>
                <Label>Payment Mode</Label>
                <select value={form.paymentMode} onChange={onChange("paymentMode")} className={ic}>
                  {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Designer assignment */}
            <div>
              <Label>Assign Designer (optional — can assign later)</Label>
              <select value={form.assignedDesignerId} onChange={onChange("assignedDesignerId")} className={ic}>
                <option value="">— leave unassigned —</option>
                {designers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} (load: {d.activeCount})
                  </option>
                ))}
              </select>
              {designers.length === 0 && (
                <p className="text-xs text-amber-700 mt-1">
                  No DESIGNER role users found. Ask IT Admin to add users with role = Designer in User Management.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60">
                {creating ? "Saving…" : "Create & Print"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assignTicket && (
        <Modal onClose={() => setAssignTicket(null)} title={`Assign Designer · ${assignTicket.ticketNo}`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{assignTicket.customerName}</span> · {assignTicket.natureOfWork}
            </p>
            <select value={assignDesigner} onChange={(e) => setAssignDesigner(e.target.value)} className={ic}>
              <option value="">— select a designer —</option>
              {designers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (current load: {d.activeCount})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setAssignTicket(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssign} disabled={!assignDesigner || assignBusy}
                className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60">
                {assignBusy ? "Assigning…" : "Assign"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DONE / HALF-DONE MODAL ── */}
      {closingTicket && (
        <Modal onClose={() => setClosingTicket(null)}
          title={`${closingTicket.to === "DONE" ? "Mark Done" : "Mark Half-Done"} · ${closingTicket.t.ticketNo}`}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">{closingTicket.t.customerName}</span> · {closingTicket.t.natureOfWork}
            </p>
            <Label>{closingTicket.to === "DONE" ? "Designer Remarks (required)" : "Reason for Half-Done (required)"}</Label>
            <textarea value={closingText} onChange={(e) => setClosingText(e.target.value)} rows={3} className={ic}
              placeholder={closingTicket.to === "DONE"
                ? "What was completed, ready for the next step (billing/production)…"
                : "Why is this half done? Missing material, customer pending approval, etc."} />
            <div className="flex justify-end gap-2">
              <button onClick={() => setClosingTicket(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
              <button onClick={handleStatusClose} disabled={!closingText.trim() || closingBusy}
                className={`px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-60 ${
                  closingTicket.to === "DONE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700"
                }`}>
                {closingBusy ? "Saving…" : "Confirm"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── PRINT ZONE — off-screen on display, made visible by @media print ── */}
      <div id="zag-print-zone" style={{ position: "absolute", left: "-9999px", top: 0 }}>
        {printSlip && <WorkOrderSlipTemplate slip={printSlip} company={company ?? undefined} />}
      </div>
    </>
  );
}

// ─── SMALL UI HELPERS ──────────────────────────────────────────────────────────
function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className={`px-4 py-2.5 text-xs font-semibold text-gray-600 uppercase tracking-wider ${right ? "text-right" : "text-left"}`}>{children}</th>;
}
function Td({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <td className={`px-4 py-3 align-top ${right ? "text-right" : ""}`}>{children}</td>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1">{children}</label>;
}
function IconBtn({ children, title, onClick, color = "gray" }: { children: React.ReactNode; title: string; onClick: () => void; color?: "gray" | "green" | "orange" | "red" }) {
  const colors: Record<string, string> = {
    gray: "text-gray-600 hover:bg-gray-100",
    green: "text-emerald-600 hover:bg-emerald-50",
    orange: "text-orange-600 hover:bg-orange-50",
    red: "text-red-600 hover:bg-red-50",
  };
  return (
    <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition ${colors[color]}`}>{children}</button>
  );
}
function SumCard({ label, value, icon: Icon, color, highlight }: {
  label: string; value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "indigo" | "amber" | "orange" | "emerald" | "red";
  highlight?: boolean;
}) {
  const palettes: Record<string, { bg: string; text: string; ring: string }> = {
    indigo:  { bg: "bg-indigo-50",  text: "text-indigo-700",  ring: "ring-indigo-200" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-700",   ring: "ring-amber-200"  },
    orange:  { bg: "bg-orange-50",  text: "text-orange-700",  ring: "ring-orange-200" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200"},
    red:     { bg: "bg-red-50",     text: "text-red-700",     ring: "ring-red-200"    },
  };
  const p = palettes[color];
  return (
    <div className={`bg-white rounded-xl border ${highlight ? `ring-2 ${p.ring}` : "border-gray-200"} p-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.bg}`}>
          <Icon size={14} className={p.text} />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
