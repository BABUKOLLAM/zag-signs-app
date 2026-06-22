"use client";
import { useState, useMemo } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/Toaster";
import { useSession } from "next-auth/react";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import {
  Play, CheckCircle, AlertTriangle, Clock, X, RefreshCw,
  Briefcase, Phone, Award,
} from "lucide-react";

interface Ticket {
  id: string; ticketNo: string; branch: string;
  source: string; status: string; priority: string;
  customerName: string; customerCompany: string;
  customerPhone: string; customerEmail: string; customerAddress: string;
  quotationNo: string;
  natureOfWork: string; description: string; reference: string;
  estimatedCost: number; advancePaid: number; balanceDue: number;
  paymentMode: string;
  receivedAt: string; expectedAt: string | null;
  assignedAt: string | null; startedAt: string | null;
  halfDoneAt: string | null; completedAt: string | null;
  assignedDesignerName: string;
  halfDoneReason: string; designerRemarks: string;
  createdByName: string;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  ASSIGNED:    "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
  HALF_DONE:   "bg-orange-100 text-orange-700 border-orange-200",
  DONE:        "bg-emerald-100 text-emerald-700 border-emerald-200",
};
const PRIORITY_COLOR: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700", MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700", URGENT: "bg-red-100 text-red-700",
};

const FILTERS = [
  { value: "",            label: "All Mine" },
  { value: "ASSIGNED",    label: "To Pick" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "HALF_DONE",   label: "Half Done" },
  { value: "DONE",        label: "Completed" },
];

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function isOverdue(t: Ticket): boolean {
  if (!t.expectedAt) return false;
  if (t.status === "DONE" || t.status === "BILLED" || t.status === "CANCELLED") return false;
  return new Date(t.expectedAt).getTime() < Date.now();
}
function isCompletedToday(t: Ticket): boolean {
  if (!t.completedAt) return false;
  const d = new Date(t.completedAt);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

export default function MyWorkPage() {
  const toast = useToast();
  const { data: session } = useSession();
  const user = session?.user;

  const [filter, setFilter] = useState("");

  const { data, loading, error, refetch } = useApi<Ticket[]>("/work-order-tickets", {
    mine: "1",
    status: filter || undefined,
  });
  const tickets = useMemo(() => data ?? [], [data]);

  // Stat summary
  const stats = useMemo(() => {
    const all = data ?? [];
    return {
      toPick:     all.filter((t) => t.status === "ASSIGNED").length,
      inProgress: all.filter((t) => t.status === "IN_PROGRESS").length,
      halfDone:   all.filter((t) => t.status === "HALF_DONE").length,
      doneToday:  all.filter(isCompletedToday).length,
    };
  }, [data]);

  // Action modal
  const [actionTicket, setActionTicket] = useState<{ t: Ticket; type: "HALF_DONE" | "DONE" } | null>(null);
  const [actionText, setActionText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleStart = async (t: Ticket) => {
    try {
      await api.put(`/work-order-tickets/${t.id}`, { status: "IN_PROGRESS", eventNote: "Designer started work" });
      toast.success(`Started ${t.ticketNo}`);
      refetch();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
  };

  const handleAction = async () => {
    if (!actionTicket) return;
    if (!actionText.trim()) { toast.error("This field is required"); return; }
    setBusy(true);
    try {
      await api.put(`/work-order-tickets/${actionTicket.t.id}`, {
        status: actionTicket.type,
        ...(actionTicket.type === "HALF_DONE"
          ? { halfDoneReason: actionText }
          : { designerRemarks: actionText }),
      });
      toast.success(actionTicket.type === "DONE" ? "Marked Done" : "Marked Half-Done");
      setActionTicket(null); setActionText("");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <>
      <TopBar title="My Work" subtitle={`Welcome, ${user?.name ?? "Designer"} — your assigned tickets`} />

      <div className="p-4 lg:p-6 space-y-4">
        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Stat label="To Pick"      value={stats.toPick}     icon={Briefcase} color="blue" />
          <Stat label="In Progress"  value={stats.inProgress} icon={Clock}     color="amber" />
          <Stat label="Half Done"    value={stats.halfDone}   icon={AlertTriangle} color="orange" />
          <Stat label="Done Today"   value={stats.doneToday}  icon={Award}     color="emerald" />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                  filter === f.value ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <button onClick={() => refetch()} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh">
            <RefreshCw size={14} className="text-gray-600" />
          </button>
        </div>

        {/* ── TICKETS ── */}
        {loading ? <TableSkeleton rows={3} /> : error ? <ErrorState message={error} onRetry={refetch} /> :
          tickets.length === 0 ? (
            <EmptyState
              label="Nothing in your queue"
              hint="Your front office will assign tickets to you. They'll show up here automatically."
            />
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => {
                const overdue = isOverdue(t);
                return (
                  <div key={t.id}
                    className={`bg-white rounded-xl border ${overdue ? "border-red-300" : "border-gray-200"} p-4`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-[260px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900">{t.ticketNo}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                            {t.status.replace(/_/g, " ")}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITY_COLOR[t.priority]}`}>
                            {t.priority}
                          </span>
                          {overdue && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-semibold">OVERDUE</span>}
                          {t.quotationNo && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">Q: {t.quotationNo}</span>}
                        </div>

                        <div className="mt-2">
                          <p className="text-base font-semibold text-gray-900">{t.customerName}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                            {t.customerPhone && (
                              <a href={`tel:${t.customerPhone}`} className="flex items-center gap-1 hover:text-indigo-600">
                                <Phone size={12} /> {t.customerPhone}
                              </a>
                            )}
                            {t.customerCompany && <span>{t.customerCompany}</span>}
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                          <Field label="Nature" value={t.natureOfWork} />
                          <Field label="Reference" value={t.reference || "—"} />
                          <Field label="Branch" value={t.branch} />
                          <Field label="Expected" value={fmtDate(t.expectedAt)}
                                 valueClass={overdue ? "text-red-600 font-semibold" : ""} />
                        </div>

                        <div className="mt-3">
                          <p className="text-xs font-semibold text-gray-500 mb-1">DESCRIPTION</p>
                          <p className="text-sm text-gray-800 whitespace-pre-line">{t.description}</p>
                        </div>

                        {t.halfDoneReason && (
                          <div className="mt-3 p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                            <p className="text-xs font-semibold text-orange-800">Previous half-done reason</p>
                            <p className="text-sm text-orange-900">{t.halfDoneReason}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        {t.status === "ASSIGNED" && (
                          <Btn onClick={() => handleStart(t)} color="indigo" icon={Play}>Start Work</Btn>
                        )}
                        {(t.status === "IN_PROGRESS" || t.status === "HALF_DONE") && (
                          <Btn onClick={() => { setActionTicket({ t, type: "DONE" }); setActionText(""); }}
                            color="emerald" icon={CheckCircle}>Mark Done</Btn>
                        )}
                        {(t.status === "ASSIGNED" || t.status === "IN_PROGRESS") && (
                          <Btn onClick={() => { setActionTicket({ t, type: "HALF_DONE" }); setActionText(""); }}
                            color="orange" icon={AlertTriangle}>Half Done</Btn>
                        )}
                        {t.status === "DONE" && (
                          <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle size={14} /> Completed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Action modal */}
      {actionTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setActionTicket(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                {actionTicket.type === "DONE" ? "Mark Done" : "Mark Half-Done"} · {actionTicket.t.ticketNo}
              </h2>
              <button onClick={() => setActionTicket(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-600">{actionTicket.t.customerName} · {actionTicket.t.natureOfWork}</p>
              <label className="block text-xs font-semibold text-gray-600">
                {actionTicket.type === "DONE" ? "Remarks for billing / next step *" : "Why half-done? *"}
              </label>
              <textarea value={actionText} onChange={(e) => setActionText(e.target.value)} rows={4}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={actionTicket.type === "DONE"
                  ? "What was completed, special notes for billing or production…"
                  : "Reason — e.g. customer pending approval, material delay, design clarity needed…"} />
              <div className="flex justify-end gap-2">
                <button onClick={() => setActionTicket(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAction} disabled={!actionText.trim() || busy}
                  className={`px-4 py-2 text-sm rounded-lg text-white font-medium disabled:opacity-60 ${
                    actionTicket.type === "DONE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-orange-600 hover:bg-orange-700"
                  }`}>
                  {busy ? "Saving…" : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
      <p className={`text-sm text-gray-900 ${valueClass ?? ""}`}>{value}</p>
    </div>
  );
}

function Stat({ label, value, icon: Icon, color }: {
  label: string; value: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: "blue" | "amber" | "orange" | "emerald";
}) {
  const palettes: Record<string, { bg: string; text: string }> = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-700"    },
    amber:   { bg: "bg-amber-50",   text: "text-amber-700"   },
    orange:  { bg: "bg-orange-50",  text: "text-orange-700"  },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
  };
  const p = palettes[color];
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${p.bg}`}>
          <Icon size={14} className={p.text} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Btn({ children, onClick, color, icon: Icon }: {
  children: React.ReactNode; onClick: () => void;
  color: "indigo" | "emerald" | "orange";
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const colors: Record<string, string> = {
    indigo:  "bg-indigo-600 hover:bg-indigo-700",
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    orange:  "bg-orange-600 hover:bg-orange-700",
  };
  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg ${colors[color]}`}>
      <Icon size={12} /> {children}
    </button>
  );
}
