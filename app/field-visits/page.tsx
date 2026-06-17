"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { branches } from "@/lib/data";
import { Plus, X, MapPin, Eye, Clock, CheckCircle, Navigation } from "lucide-react";

// BRD Phase 3 — Field Force Automation

type VisitType = "Sales Call" | "Site Survey" | "Installation" | "Service / Complaint" | "Collection" | "Follow-up";
type VisitOutcome = "Positive" | "Order Expected" | "Follow-up Needed" | "Not Interested" | "Completed";

interface FieldVisit {
  id: string;
  date: string;
  employee: string;
  branch: string;
  customerName: string;
  location: string;
  visitType: VisitType;
  startTime: string;
  endTime: string;
  geoTagged: boolean;
  outcome: VisitOutcome;
  orderValue?: number;
  nextAction: string;
  notes: string;
  submittedAt: string;
}

const visitTypes: VisitType[] = ["Sales Call", "Site Survey", "Installation", "Service / Complaint", "Collection", "Follow-up"];
const outcomes: VisitOutcome[] = ["Positive", "Order Expected", "Follow-up Needed", "Not Interested", "Completed"];
const team = ["Arun Kumar", "Vijay CRE", "Renu Thomas", "Salman Khan", "Rajesh Kumar"];

const outcomeColor: Record<VisitOutcome, string> = {
  "Positive": "bg-emerald-100 text-emerald-700",
  "Order Expected": "bg-blue-100 text-blue-700",
  "Follow-up Needed": "bg-amber-100 text-amber-700",
  "Not Interested": "bg-red-100 text-red-700",
  "Completed": "bg-slate-100 text-slate-700",
};

const visitTypeColor: Record<VisitType, string> = {
  "Sales Call": "bg-indigo-100 text-indigo-700",
  "Site Survey": "bg-violet-100 text-violet-700",
  "Installation": "bg-teal-100 text-teal-700",
  "Service / Complaint": "bg-orange-100 text-orange-700",
  "Collection": "bg-green-100 text-green-700",
  "Follow-up": "bg-blue-100 text-blue-700",
};

const sampleVisits: FieldVisit[] = [
  { id: "FV001", date: "2026-06-17", employee: "Arun Kumar", branch: "TVM", customerName: "Asha Hospitals", location: "Pattom, Thiruvananthapuram", visitType: "Sales Call", startTime: "10:00", endTime: "11:30", geoTagged: true, outcome: "Order Expected", orderValue: 320000, nextAction: "Send revised quotation by EOD.", notes: "Met Dr. Ramesh. Positive discussions. Site photos taken.", submittedAt: "2026-06-17T12:00:00" },
  { id: "FV002", date: "2026-06-17", employee: "Vijay CRE", branch: "EKM", customerName: "Lulu Mall Kochi", location: "Edappally, Ernakulam", visitType: "Site Survey", startTime: "14:00", endTime: "16:00", geoTagged: true, outcome: "Follow-up Needed", nextAction: "Prepare detailed project plan for all 3 floors.", notes: "Measured all signage points. Complex project — need 2 days to quote.", submittedAt: "2026-06-17T16:30:00" },
  { id: "FV003", date: "2026-06-16", employee: "Salman Khan", branch: "CLT", customerName: "Al Baraka Exports", location: "SM Street, Kozhikode", visitType: "Follow-up", startTime: "11:00", endTime: "12:00", geoTagged: true, outcome: "Positive", nextAction: "Submit final quotation and await PO.", notes: "Client likes the design. Budget approved internally. Expecting PO next week.", submittedAt: "2026-06-16T13:00:00" },
  { id: "FV004", date: "2026-06-16", employee: "Rajesh Kumar", branch: "EKM", customerName: "Malabar Gold EKM", location: "MG Road, Ernakulam", visitType: "Service / Complaint", startTime: "09:00", endTime: "10:30", geoTagged: true, outcome: "Completed", nextAction: "Issue service report. Offer 3-month warranty check.", notes: "Replaced faulty LED driver. All lights working now. Client satisfied.", submittedAt: "2026-06-16T11:00:00" },
  { id: "FV005", date: "2026-06-15", employee: "Renu Thomas", branch: "KTYM", customerName: "Baby Memorial Hospital", location: "KK Road, Kottayam", visitType: "Installation", startTime: "08:00", endTime: "17:00", geoTagged: true, outcome: "Completed", orderValue: 100000, nextAction: "Collect final payment. Get customer signature on completion form.", notes: "Wayfinding signage installed. Room plates done. Client very happy.", submittedAt: "2026-06-15T17:30:00" },
];

const blank = {
  date: new Date().toISOString().split("T")[0],
  employee: team[0], branch: branches[0],
  customerName: "", location: "", visitType: "Sales Call" as VisitType,
  startTime: "", endTime: "", geoTagged: false,
  outcome: "Positive" as VisitOutcome, orderValue: "",
  nextAction: "", notes: "",
};

export default function FieldVisitsPage() {
  const [visits, setVisits] = useState<FieldVisit[]>(sampleVisits);
  const [showModal, setShowModal] = useState(false);
  const [viewVisit, setViewVisit] = useState<FieldVisit | null>(null);
  const [form, setForm] = useState(blank);
  const [filterType, setFilterType] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");

  const set = (f: keyof typeof blank) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.customerName || !form.employee) return;
    const v: FieldVisit = {
      id: `FV${String(visits.length + 1).padStart(3, "0")}`,
      date: form.date, employee: form.employee, branch: form.branch,
      customerName: form.customerName, location: form.location,
      visitType: form.visitType, startTime: form.startTime, endTime: form.endTime,
      geoTagged: form.geoTagged,
      outcome: form.outcome, orderValue: form.orderValue ? +form.orderValue : undefined,
      nextAction: form.nextAction, notes: form.notes,
      submittedAt: new Date().toISOString(),
    };
    setVisits(p => [v, ...p]);
    setForm(blank); setShowModal(false);
  };

  const filtered = visits.filter(v =>
    (filterType === "All" || v.visitType === filterType) &&
    (filterBranch === "All" || v.branch === filterBranch)
  );

  const todayStr = new Date().toISOString().split("T")[0];
  const todayVisits = visits.filter(v => v.date === todayStr).length;
  const totalDuration = visits.reduce((s, v) => {
    if (!v.startTime || !v.endTime) return s;
    const [sh, sm] = v.startTime.split(":").map(Number);
    const [eh, em] = v.endTime.split(":").map(Number);
    return s + (eh * 60 + em - sh * 60 - sm);
  }, 0);

  const ic = "border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all";
  const lc = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="Field Visits" subtitle="People & Field" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Visits", value: visits.length, color: "from-indigo-500 to-violet-500" },
            { label: "Today", value: todayVisits, color: "from-emerald-500 to-teal-500" },
            { label: "Avg Duration", value: visits.length ? `${Math.round(totalDuration / visits.length)}m` : "—", color: "from-amber-500 to-orange-500" },
            { label: "Orders Expected", value: visits.filter(v => v.outcome === "Order Expected").length, color: "from-blue-500 to-cyan-500" },
          ].map(s => (
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

        {/* Geo-verification banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Navigation size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-900">Geo-verification enabled</p>
            <p className="text-xs text-indigo-600 mt-0.5">BRD Phase 3 · All visits are geo-tagged with GPS coordinates, visit time & duration. Mobile app (Flutter) required for live tracking, selfie verification & customer signature.</p>
          </div>
          <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">Phase 3</span>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-slate-50">
              <option value="All">All Visit Types</option>{visitTypes.map(t => <option key={t}>{t}</option>)}
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-slate-50">
              <option value="All">All Branches</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            <Plus size={14} /> Log Visit
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-semibold">
              <tr>
                <th className="text-left px-4 py-3">Visit</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Geo</th>
                <th className="text-left px-4 py-3">Outcome</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(v => {
                let duration = "";
                if (v.startTime && v.endTime) {
                  const [sh, sm] = v.startTime.split(":").map(Number);
                  const [eh, em] = v.endTime.split(":").map(Number);
                  const mins = eh * 60 + em - sh * 60 - sm;
                  duration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                }
                return (
                  <tr key={v.id} className="hover:bg-slate-50/50 text-sm">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-indigo-600">{v.id}</p>
                      <p className="text-xs text-slate-400">{v.date}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{v.customerName}</p>
                      <p className="text-xs text-slate-400">{v.employee} · {v.branch}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-600 flex items-center gap-1"><MapPin size={10} className="text-slate-400" />{v.location}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visitTypeColor[v.visitType]}`}>{v.visitType}</span></td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-slate-700">{v.startTime} – {v.endTime}</p>
                      {duration && <p className="text-xs text-slate-400 flex items-center gap-0.5 mt-0.5"><Clock size={9} />{duration}</p>}
                    </td>
                    <td className="px-4 py-3">
                      {v.geoTagged
                        ? <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle size={12} /> Tagged</span>
                        : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${outcomeColor[v.outcome]}`}>{v.outcome}</span></td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewVisit(v)} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><Eye size={12} /> View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-sm text-slate-400">No visits found</p>}
        </div>
      </div>

      {/* Log Visit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Log Field Visit</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className={lc}>Date *</label><input type="date" value={form.date} onChange={set("date")} className={ic} /></div>
                <div><label className={lc}>Employee *</label><select value={form.employee} onChange={set("employee")} className={ic}>{team.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className={lc}>Branch</label><select value={form.branch} onChange={set("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select></div>
                <div><label className={lc}>Visit Type</label><select value={form.visitType} onChange={set("visitType")} className={ic}>{visitTypes.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="col-span-2"><label className={lc}>Customer Name *</label><input type="text" placeholder="Company / person visited" value={form.customerName} onChange={set("customerName")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Location</label><input type="text" placeholder="Area, City" value={form.location} onChange={set("location")} className={ic} /></div>
                <div><label className={lc}>Start Time</label><input type="time" value={form.startTime} onChange={set("startTime")} className={ic} /></div>
                <div><label className={lc}>End Time</label><input type="time" value={form.endTime} onChange={set("endTime")} className={ic} /></div>
                <div><label className={lc}>Outcome</label><select value={form.outcome} onChange={set("outcome")} className={ic}>{outcomes.map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={lc}>Order Value (₹) if applicable</label><input type="number" min="0" placeholder="0" value={form.orderValue} onChange={set("orderValue")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Next Action</label><input type="text" placeholder="What to do next?" value={form.nextAction} onChange={set("nextAction")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Visit Notes</label><textarea rows={2} placeholder="Key discussion points, observations" value={form.notes} onChange={set("notes")} className={ic} /></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="geo" checked={form.geoTagged} onChange={e => setForm(p => ({ ...p, geoTagged: e.target.checked }))} className="rounded" />
                <label htmlFor="geo" className="text-sm text-slate-600">Mark as geo-tagged (location verified)</label>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleSave} disabled={!form.customerName || !form.employee}
                  className="px-4 py-2 text-sm text-white rounded-xl font-semibold disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
                  Save Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewVisit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div><h2 className="font-bold text-slate-900">{viewVisit.customerName}</h2>
                <p className="text-xs text-slate-400">{viewVisit.id} · {viewVisit.date} · {viewVisit.employee}</p></div>
              <button onClick={() => setViewVisit(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visitTypeColor[viewVisit.visitType]}`}>{viewVisit.visitType}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${outcomeColor[viewVisit.outcome]}`}>{viewVisit.outcome}</span>
                {viewVisit.geoTagged && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">✓ Geo-tagged</span>}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Location</span><span className="font-medium text-slate-800">{viewVisit.location}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Time</span><span className="font-medium">{viewVisit.startTime} – {viewVisit.endTime}</span></div>
                {viewVisit.orderValue && <div className="flex justify-between"><span className="text-slate-500">Order Value</span><span className="font-bold text-indigo-600">₹{viewVisit.orderValue.toLocaleString("en-IN")}</span></div>}
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
