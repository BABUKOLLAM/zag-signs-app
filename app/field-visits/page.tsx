"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { fieldVisitSchema, parseErrors, type FormErrors } from "@/lib/schemas";
import { Plus, X, MapPin, Eye, Clock, CheckCircle, Navigation, RefreshCw } from "lucide-react";

type VisitType = "SALES_CALL" | "SITE_SURVEY" | "INSTALLATION" | "SERVICE_COMPLAINT" | "COLLECTION" | "FOLLOW_UP";
type VisitOutcome = "POSITIVE" | "ORDER_EXPECTED" | "FOLLOW_UP_NEEDED" | "NOT_INTERESTED" | "COMPLETED";

interface FieldVisit {
  id: string; date: string; visitType: VisitType; visitTypeLabel: string;
  outcome: VisitOutcome; outcomeLabel: string; customerName: string;
  location: string; startTime: string; endTime: string;
  orderValue: number; nextAction: string; notes: string;
  createdAt: string; employee: string;
}

const VISIT_TYPES: { value: VisitType; label: string }[] = [
  { value: "SALES_CALL", label: "Sales Call" },
  { value: "SITE_SURVEY", label: "Site Survey" },
  { value: "INSTALLATION", label: "Installation" },
  { value: "SERVICE_COMPLAINT", label: "Service / Complaint" },
  { value: "COLLECTION", label: "Collection" },
  { value: "FOLLOW_UP", label: "Follow-up" },
];
const OUTCOMES: { value: VisitOutcome; label: string }[] = [
  { value: "POSITIVE", label: "Positive" },
  { value: "ORDER_EXPECTED", label: "Order Expected" },
  { value: "FOLLOW_UP_NEEDED", label: "Follow-up Needed" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
  { value: "COMPLETED", label: "Completed" },
];

const OUTCOME_COLOR: Record<string, string> = {
  POSITIVE: "bg-emerald-100 text-emerald-700",
  ORDER_EXPECTED: "bg-blue-100 text-blue-700",
  FOLLOW_UP_NEEDED: "bg-amber-100 text-amber-700",
  NOT_INTERESTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-slate-100 text-slate-700",
};
const TYPE_COLOR: Record<string, string> = {
  SALES_CALL: "bg-indigo-100 text-indigo-700",
  SITE_SURVEY: "bg-violet-100 text-violet-700",
  INSTALLATION: "bg-teal-100 text-teal-700",
  SERVICE_COMPLAINT: "bg-orange-100 text-orange-700",
  COLLECTION: "bg-green-100 text-green-700",
  FOLLOW_UP: "bg-blue-100 text-blue-700",
};

const blank = {
  date: new Date().toISOString().split("T")[0],
  visitType: "SALES_CALL" as VisitType,
  outcome: "POSITIVE" as VisitOutcome,
  customerName: "", location: "",
  startTime: "", endTime: "",
  orderValue: "", nextAction: "", notes: "",
};

export default function FieldVisitsPage() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [viewVisit, setViewVisit] = useState<FieldVisit | null>(null);
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const { data, loading, error, refetch } = useApi<FieldVisit[]>("/field-visits", { limit: 100 });
  const visits = data ?? [];

  const set = (f: keyof typeof blank) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((p) => ({ ...p, [f]: e.target.value }));
      if (errors[f]) setErrors((er) => { const n = { ...er }; delete n[f]; return n; });
    };

  const handleSave = async () => {
    const result = fieldVisitSchema.safeParse(form);
    if (!result.success) { setErrors(parseErrors(result.error)); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.post("/field-visits", {
        ...form,
        orderValue: form.orderValue ? Number(form.orderValue) : null,
      });
      setForm(blank);
      setShowModal(false);
      refetch();
      toast.success("Visit logged successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log visit");
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const todayCount = visits.filter((v) => v.date === todayStr).length;
  const totalMins = visits.reduce((s, v) => {
    if (!v.startTime || !v.endTime) return s;
    const [sh, sm] = v.startTime.split(":").map(Number);
    const [eh, em] = v.endTime.split(":").map(Number);
    return s + (eh * 60 + em - sh * 60 - sm);
  }, 0);
  const ordersExpected = visits.filter((v) => v.outcome === "ORDER_EXPECTED").length;

  const ic = (err?: string) =>
    `border rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 bg-slate-50 focus:bg-white transition-all ${err ? "border-red-400 focus:ring-red-300" : "border-slate-200 focus:ring-indigo-500"}`;
  const lc = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="Field Visits" subtitle="People & Field" />
      <div className="p-4 md:p-6 space-y-5">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Visits", value: visits.length, color: "from-indigo-500 to-violet-500" },
            { label: "Today", value: todayCount, color: "from-emerald-500 to-teal-500" },
            { label: "Avg Duration", value: visits.length ? `${Math.round(totalMins / visits.length)}m` : "—", color: "from-amber-500 to-orange-500" },
            { label: "Orders Expected", value: ordersExpected, color: "from-blue-500 to-cyan-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                <MapPin size={16} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Navigation size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">Field visit tracker</p>
            <p className="text-xs text-indigo-600 mt-0.5">Log customer visits, site surveys, and service calls. GPS tracking and mobile app integration coming in Phase 3.</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            <Plus size={14} /> Log Visit
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : visits.length === 0 ? (
            <EmptyState label="No field visits logged" hint="Log your first visit using the button above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-semibold">
                  <tr>
                    <th className="text-left px-4 py-3">Date</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Location</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Time</th>
                    <th className="text-left px-4 py-3">Outcome</th>
                    <th className="text-left px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visits.map((v) => {
                    let duration = "";
                    if (v.startTime && v.endTime) {
                      const [sh, sm] = v.startTime.split(":").map(Number);
                      const [eh, em] = v.endTime.split(":").map(Number);
                      const mins = eh * 60 + em - sh * 60 - sm;
                      if (mins > 0) duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                    }
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/50 text-sm">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-indigo-600 text-xs">{v.id.slice(0, 8)}</p>
                          <p className="text-xs text-slate-400">{v.date}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{v.customerName}</p>
                          {v.employee && <p className="text-xs text-slate-400">{v.employee}</p>}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <MapPin size={10} className="text-slate-400" />{v.location || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLOR[v.visitType] ?? "bg-gray-100 text-gray-700"}`}>
                            {v.visitTypeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-xs text-slate-700">{v.startTime ? `${v.startTime} – ${v.endTime}` : "—"}</p>
                          {duration && <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5"><Clock size={9} />{duration}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[v.outcome] ?? "bg-gray-100 text-gray-700"}`}>
                            {v.outcomeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setViewVisit(v)} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                            <Eye size={12} /> View
                          </button>
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

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Log Field Visit</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lc}>Date <span className="text-red-500">*</span></label>
                  <input type="date" value={form.date} onChange={set("date")} className={ic(errors.date)} />
                  {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className={lc}>Visit Type <span className="text-red-500">*</span></label>
                  <select value={form.visitType} onChange={set("visitType")} className={ic(errors.visitType)}>
                    {VISIT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={lc}>Customer Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Company / person visited" value={form.customerName} onChange={set("customerName")} className={ic(errors.customerName)} />
                  {errors.customerName && <p className="text-xs text-red-500 mt-1">{errors.customerName}</p>}
                </div>
                <div className="col-span-2"><label className={lc}>Location</label><input type="text" placeholder="Area, City" value={form.location} onChange={set("location")} className={ic()} /></div>
                <div><label className={lc}>Start Time</label><input type="time" value={form.startTime} onChange={set("startTime")} className={ic()} /></div>
                <div><label className={lc}>End Time</label><input type="time" value={form.endTime} onChange={set("endTime")} className={ic()} /></div>
                <div>
                  <label className={lc}>Outcome <span className="text-red-500">*</span></label>
                  <select value={form.outcome} onChange={set("outcome")} className={ic()}>
                    {OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div><label className={lc}>Order Value (₹)</label><input type="number" min="0" placeholder="0" value={form.orderValue} onChange={set("orderValue")} className={ic()} /></div>
                <div className="col-span-2"><label className={lc}>Next Action</label><input type="text" placeholder="What to do next?" value={form.nextAction} onChange={set("nextAction")} className={ic()} /></div>
                <div className="col-span-2"><label className={lc}>Visit Notes</label><textarea rows={2} placeholder="Key discussion points, observations" value={form.notes} onChange={set("notes")} className={ic()} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowModal(false); setForm(blank); setErrors({}); }} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="px-4 py-2 text-sm text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
                  {saving ? "Saving…" : "Save Visit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewVisit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900">{viewVisit.customerName}</h2>
                <p className="text-xs text-slate-400">{viewVisit.date} · {viewVisit.employee}</p>
              </div>
              <button onClick={() => setViewVisit(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLOR[viewVisit.visitType] ?? ""}`}>{viewVisit.visitTypeLabel}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${OUTCOME_COLOR[viewVisit.outcome] ?? ""}`}>{viewVisit.outcomeLabel}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
                {viewVisit.location && <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium text-slate-800">{viewVisit.location}</span></div>}
                {viewVisit.startTime && <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{viewVisit.startTime} – {viewVisit.endTime}</span></div>}
                {viewVisit.orderValue > 0 && <div className="flex justify-between"><span className="text-slate-500">Order Value</span><span className="font-bold text-indigo-600">₹{viewVisit.orderValue.toLocaleString("en-IN")}</span></div>}
              </div>
              {viewVisit.notes && <div className="bg-blue-50 rounded-xl p-3"><p className="text-xs font-semibold text-blue-700 mb-1">Notes</p><p className="text-sm text-slate-700">{viewVisit.notes}</p></div>}
              {viewVisit.nextAction && <div className="bg-amber-50 rounded-xl p-3"><p className="text-xs font-semibold text-amber-700 mb-1">Next Action</p><p className="text-sm text-slate-700">{viewVisit.nextAction}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
