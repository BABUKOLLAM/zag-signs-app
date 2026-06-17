"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { branches } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, X, Eye, TrendingUp } from "lucide-react";

type Stage = "Qualification" | "Proposal Sent" | "Negotiation" | "Verbal Commitment" | "Closed Won" | "Closed Lost";
type ProductCategory = "ACP Signage" | "LED Signage" | "Flex & Digital Print" | "Hoarding" | "Vehicle Branding" | "Interior Branding" | "Other";

interface Opportunity {
  id: string;
  name: string;
  customer: string;
  branch: string;
  assignedTo: string;
  value: number;
  probability: number;
  stage: Stage;
  category: ProductCategory;
  expectedClose: string;
  competitors: string;
  notes: string;
  createdAt: string;
}

const stages: Stage[] = ["Qualification", "Proposal Sent", "Negotiation", "Verbal Commitment", "Closed Won", "Closed Lost"];
const categories: ProductCategory[] = ["ACP Signage", "LED Signage", "Flex & Digital Print", "Hoarding", "Vehicle Branding", "Interior Branding", "Other"];
const reps = ["Arun Kumar", "Vijay CRE", "Renu Thomas", "Salman Khan", "Meera Nair"];

const stageColor: Record<Stage, string> = {
  "Qualification": "bg-gray-100 text-gray-700",
  "Proposal Sent": "bg-blue-100 text-blue-700",
  "Negotiation": "bg-yellow-100 text-yellow-700",
  "Verbal Commitment": "bg-indigo-100 text-indigo-700",
  "Closed Won": "bg-green-100 text-green-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const stageProbability: Record<Stage, number> = {
  "Qualification": 20, "Proposal Sent": 40, "Negotiation": 65,
  "Verbal Commitment": 85, "Closed Won": 100, "Closed Lost": 0,
};

const sampleOpps: Opportunity[] = [
  { id: "OPP001", name: "Lulu Mall Full Branding", customer: "Lulu Mall Kochi", branch: "EKM", assignedTo: "Vijay CRE", value: 850000, probability: 65, stage: "Negotiation", category: "Interior Branding", expectedClose: "2026-07-15", competitors: "SignWorld, Brandcraft", notes: "3-storey interior branding. Decision by July end.", createdAt: "2026-06-05" },
  { id: "OPP002", name: "Muthoot Finance 3 Branches", customer: "Muthoot Finance", branch: "TVM", assignedTo: "Arun Kumar", value: 280000, probability: 40, stage: "Proposal Sent", category: "ACP Signage", expectedClose: "2026-06-30", competitors: "None identified", notes: "Quotation submitted. Awaiting approval from regional head.", createdAt: "2026-06-01" },
  { id: "OPP003", name: "Al Baraka Export House Signage", customer: "Al Baraka Exports", branch: "CLT", assignedTo: "Salman Khan", value: 175000, probability: 40, stage: "Proposal Sent", category: "LED Signage", expectedClose: "2026-07-05", competitors: "Local vendors", notes: "Client wants LED name board. Negotiating delivery timeline.", createdAt: "2026-06-10" },
  { id: "OPP004", name: "Sreeja Jewellery 3 Showrooms", customer: "Sreeja Jewellery", branch: "CLT", assignedTo: "Salman Khan", value: 260000, probability: 20, stage: "Qualification", category: "ACP Signage", expectedClose: "2026-07-20", competitors: "Unknown", notes: "Initial visit done. Budget confirmed. Sending proposal.", createdAt: "2026-06-12" },
  { id: "OPP005", name: "KSFE District Office", customer: "KSFE Office", branch: "KTYM", assignedTo: "Renu Thomas", value: 420000, probability: 65, stage: "Negotiation", category: "ACP Signage", expectedClose: "2026-07-10", competitors: "Government-empanelled vendors", notes: "Negotiation on price. Internal approval process ongoing.", createdAt: "2026-05-15" },
  { id: "OPP006", name: "Baby Memorial Hospital Wayfinding", customer: "Baby Memorial Hospital", branch: "KTYM", assignedTo: "Renu Thomas", value: 100000, probability: 85, stage: "Verbal Commitment", category: "Interior Branding", expectedClose: "2026-06-25", competitors: "None", notes: "Verbal PO received. Waiting for formal work order.", createdAt: "2026-06-08" },
];

const blank = {
  name: "", customer: "", branch: branches[0], assignedTo: reps[0],
  value: "", probability: "", stage: "Qualification" as Stage,
  category: "ACP Signage" as ProductCategory, expectedClose: "", competitors: "", notes: "",
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>(sampleOpps);
  const [showModal, setShowModal] = useState(false);
  const [viewOpp, setViewOpp] = useState<Opportunity | null>(null);
  const [form, setForm] = useState(blank);
  const [filterStage, setFilterStage] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");

  const set = (f: keyof typeof blank) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSave = () => {
    if (!form.name || !form.customer) return;
    const o: Opportunity = {
      id: `OPP${String(opps.length + 1).padStart(3, "0")}`,
      name: form.name, customer: form.customer, branch: form.branch, assignedTo: form.assignedTo,
      value: +form.value || 0, probability: +form.probability || stageProbability[form.stage],
      stage: form.stage, category: form.category, expectedClose: form.expectedClose,
      competitors: form.competitors, notes: form.notes, createdAt: new Date().toISOString().split("T")[0],
    };
    setOpps(p => [o, ...p]);
    setForm(blank); setShowModal(false);
  };

  const updateStage = (id: string, stage: Stage) =>
    setOpps(p => p.map(o => o.id === id ? { ...o, stage, probability: stageProbability[stage] } : o));

  const filtered = opps.filter(o =>
    (filterStage === "All" || o.stage === filterStage) &&
    (filterBranch === "All" || o.branch === filterBranch)
  );

  const active = opps.filter(o => o.stage !== "Closed Won" && o.stage !== "Closed Lost");
  const pipeline = active.reduce((s, o) => s + (o.value * o.probability / 100), 0);
  const totalValue = opps.filter(o => o.stage === "Closed Won").reduce((s, o) => s + o.value, 0);

  const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lc = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div>
      <TopBar title="Opportunity Management" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open Opportunities", value: active.length },
            { label: "Weighted Pipeline", value: fmt(Math.round(pipeline)) },
            { label: "Total Opps Value", value: fmt(opps.reduce((s, o) => s + o.value, 0)) },
            { label: "Closed Won", value: fmt(totalValue) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Pipeline Stage Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline by Stage</p>
          <div className="grid grid-cols-6 gap-2">
            {stages.map(s => {
              const cnt = opps.filter(o => o.stage === s).length;
              const val = opps.filter(o => o.stage === s).reduce((sum, o) => sum + o.value, 0);
              return (
                <div key={s} className={`rounded-lg p-3 text-center cursor-pointer border-2 transition-all ${filterStage === s ? "border-blue-500" : "border-transparent"} ${stageColor[s].replace("text-", "border-").split(" ")[0]} bg-opacity-50`}
                  style={{ background: s === "Closed Won" ? "#EAF3DE" : s === "Closed Lost" ? "#FCEBEB" : s === "Negotiation" ? "#FAEEDA" : s === "Verbal Commitment" ? "#EEEDFE" : s === "Proposal Sent" ? "#E6F1FB" : "#F1EFE8" }}
                  onClick={() => setFilterStage(filterStage === s ? "All" : s)}>
                  <p className="text-lg font-bold text-gray-900">{cnt}</p>
                  <p className="text-xs font-medium text-gray-700 leading-tight">{s}</p>
                  {val > 0 && <p className="text-xs text-gray-500 mt-1">{fmt(val)}</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="All">All Stages</option>{stages.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
              <option value="All">All Branches</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Opportunity
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
              <tr>
                <th className="text-left px-4 py-3">Opportunity</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-right px-4 py-3">Value</th>
                <th className="text-right px-4 py-3">Prob%</th>
                <th className="text-right px-4 py-3">Weighted</th>
                <th className="text-left px-4 py-3">Stage</th>
                <th className="text-left px-4 py-3">Close Date</th>
                <th className="text-left px-4 py-3">Assigned</th>
                <th className="text-left px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{o.name}</td>
                  <td className="px-4 py-3 text-gray-700">{o.customer}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{o.branch}</span></td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(o.value)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${o.probability >= 80 ? "text-green-600" : o.probability >= 50 ? "text-yellow-600" : "text-gray-600"}`}>{o.probability}%</span>
                  </td>
                  <td className="px-4 py-3 text-right text-blue-700 font-medium">{fmt(Math.round(o.value * o.probability / 100))}</td>
                  <td className="px-4 py-3">
                    <select value={o.stage} onChange={e => updateStage(o.id, e.target.value as Stage)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${stageColor[o.stage]}`}>
                      {stages.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{o.expectedClose}</td>
                  <td className="px-4 py-3 text-gray-700 text-xs">{o.assignedTo}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewOpp(o)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Eye size={12} /> View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No opportunities found</p>}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Add Opportunity</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={lc}>Opportunity Name *</label><input type="text" placeholder="e.g. KSRTC TVM Depot Signage" value={form.name} onChange={set("name")} className={ic} /></div>
                <div><label className={lc}>Customer *</label><input type="text" placeholder="Company name" value={form.customer} onChange={set("customer")} className={ic} /></div>
                <div><label className={lc}>Branch</label><select value={form.branch} onChange={set("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select></div>
                <div><label className={lc}>Opportunity Value (₹)</label><input type="number" min="0" value={form.value} onChange={set("value")} className={ic} /></div>
                <div><label className={lc}>Stage</label><select value={form.stage} onChange={set("stage")} className={ic}>{stages.map(s => <option key={s}>{s}</option>)}</select></div>
                <div><label className={lc}>Product Category</label><select value={form.category} onChange={set("category")} className={ic}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className={lc}>Expected Close Date</label><input type="date" value={form.expectedClose} onChange={set("expectedClose")} className={ic} /></div>
                <div><label className={lc}>Assigned To</label><select value={form.assignedTo} onChange={set("assignedTo")} className={ic}>{reps.map(r => <option key={r}>{r}</option>)}</select></div>
                <div><label className={lc}>Probability % (auto)</label><input type="number" min="0" max="100" placeholder={`${stageProbability[form.stage]}`} value={form.probability} onChange={set("probability")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Competitors</label><input type="text" placeholder="Known competing vendors" value={form.competitors} onChange={set("competitors")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Notes</label><textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Key discussion points, next steps" className={ic} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={!form.name || !form.customer} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Save Opportunity</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOpp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="font-bold text-gray-900">{viewOpp.name}</h2>
                <p className="text-xs text-gray-500">{viewOpp.id} · {viewOpp.branch} · {viewOpp.assignedTo}</p></div>
              <button onClick={() => setViewOpp(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[["Value", fmt(viewOpp.value)], ["Probability", `${viewOpp.probability}%`], ["Weighted", fmt(Math.round(viewOpp.value * viewOpp.probability / 100))]].map(([l, v]) => (
                  <div key={l} className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-sm font-bold text-blue-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Stage</span><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stageColor[viewOpp.stage]}`}>{viewOpp.stage}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-medium">{viewOpp.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Expected Close</span><span className="font-medium">{viewOpp.expectedClose}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Competitors</span><span className="font-medium text-right max-w-[200px]">{viewOpp.competitors || "None"}</span></div>
              </div>
              {viewOpp.notes && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{viewOpp.notes}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
