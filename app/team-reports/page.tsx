"use client";
import { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api-client";
import { fmt } from "@/lib/utils";
import { Plus, X, Eye, ChevronRight, AlertCircle, Loader2, RefreshCw } from "lucide-react";

const branches = ["TVM", "KTYM", "EKM", "CLT"];
const depts = ["Sales / CRE", "Production", "Accounts", "Administration"];
const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

type Dept = "Sales / CRE" | "Production" | "Accounts" | "Administration";
type ApprovalStatus = "Submitted" | "Manager Approved" | "AVP Approved" | "MD Approved";
const APPROVAL_FLOW: ApprovalStatus[] = ["Submitted", "Manager Approved", "AVP Approved", "MD Approved"];

interface DARReport {
  id: string; date: string; employee: string; employeeRole?: string; branch: string; dept?: string;
  customerVisits: number; callsMade: number; followUpsDone: number;
  ordersBooked: number; ordersValue: number; collectionsAmount: number;
  travelKm: number; productionOutput: string; outputQty: number;
  dispatches: number; dispatches_details?: string;
  highlights?: string; challenges?: string; createdAt: string;
}
interface WWReport {
  id: string; weekFrom: string; weekTo: string; employee: string; branch: string; department?: string;
  weeklyTarget: number; weeklyAchievement: number;
  challenges?: string; actionPlan?: string;
  escalationsNeeded: boolean; escalationDetails?: string;
  approvalStatus: ApprovalStatus; createdAt: string;
}
interface MWReport {
  id: string; month: number; year: number; employee: string; branch: string; department?: string;
  salesTarget: number; salesAchievement: number; conversionPct: number; collectionPct: number;
  productionAchievement: number; efficiencyPct: number;
  totalCollected: number; approvalStatus: ApprovalStatus; createdAt: string;
}

const deptColor: Record<string, string> = {
  "Sales / CRE": "bg-blue-100 text-blue-700",
  "Production": "bg-yellow-100 text-yellow-700",
  "Accounts": "bg-green-100 text-green-700",
  "Administration": "bg-purple-100 text-purple-700",
};
const approvalColor: Record<ApprovalStatus, string> = {
  "Submitted": "bg-gray-100 text-gray-700",
  "Manager Approved": "bg-blue-100 text-blue-700",
  "AVP Approved": "bg-indigo-100 text-indigo-700",
  "MD Approved": "bg-green-100 text-green-700",
};

const blankDAR = {
  date: new Date().toISOString().split("T")[0], employeeId: "", branch: branches[0], dept: "Sales / CRE" as Dept,
  customerVisits: "", callsMade: "", followUpsDone: "", ordersBooked: "", ordersValue: "", collectionsAmount: "",
  travelFrom: "", travelTo: "", travelKm: "",
  productionOutput: "", outputQty: "", downtimeHours: "", downtimeReason: "", dispatches: "", dispatchDetails: "",
  accountsCollections: "", collectionFrom: "", vendorPayments: "", vendorDetails: "",
  reconciliationStatus: "Completed" as "Completed" | "Pending" | "Partial",
  highlights: "", challenges: "",
};
const blankWWR = {
  weekFrom: "", weekTo: "", employeeId: "", branch: branches[0], department: "Sales / CRE",
  weeklyTarget: "", weeklyAchievement: "", challenges: "", actionPlan: "",
  escalationsNeeded: false, escalationDetails: "",
};
const blankMWR = {
  month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()),
  employeeId: "", branch: branches[0], department: "Sales / CRE",
  salesTarget: "", salesAchievement: "", conversionPct: "", collectionPct: "",
  productionAchievement: "", efficiencyPct: "", rejectionCount: "", rejectionReasons: "",
  collectionEfficiencyPct: "", outstandingReduction: "", totalCollected: "",
};

export default function TeamReportsPage() {
  const [tab, setTab] = useState<"dar" | "wwr" | "mwr">("dar");
  const [darList, setDarList] = useState<DARReport[]>([]);
  const [wwrList, setWwrList] = useState<WWReport[]>([]);
  const [mwrList, setMwrList] = useState<MWReport[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; role: string; branch: string }[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [viewDAR, setViewDAR] = useState<DARReport | null>(null);
  const [viewWWR, setViewWWR] = useState<WWReport | null>(null);
  const [viewMWR, setViewMWR] = useState<MWReport | null>(null);

  const [dar, setDar] = useState(blankDAR);
  const [wwr, setWwr] = useState(blankWWR);
  const [mwr, setMwr] = useState(blankMWR);
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

  const loadDAR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/team-reports/dars", { branch: filterBranch !== "All" ? filterBranch : undefined, limit: "100" });
      setDarList(res?.data ?? []);
    } finally { setLoading(false); }
  }, [filterBranch]);

  const loadWWR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/team-reports/wwrs", { branch: filterBranch !== "All" ? filterBranch : undefined, limit: "100" });
      setWwrList(res?.data ?? []);
    } finally { setLoading(false); }
  }, [filterBranch]);

  const loadMWR = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>("/team-reports/mwrs", { branch: filterBranch !== "All" ? filterBranch : undefined, limit: "100" });
      setMwrList(res?.data ?? []);
    } finally { setLoading(false); }
  }, [filterBranch]);

  useEffect(() => {
    api.get<any>("/employees", { limit: "200" }).then(r => setEmployees(r?.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => { if (tab === "dar") loadDAR(); }, [tab, loadDAR]);
  useEffect(() => { if (tab === "wwr") loadWWR(); }, [tab, loadWWR]);
  useEffect(() => { if (tab === "mwr") loadMWR(); }, [tab, loadMWR]);

  const setD = (f: keyof typeof blankDAR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDar(p => ({ ...p, [f]: e.target.value }));
  const setW = (f: keyof typeof blankWWR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setWwr(p => ({ ...p, [f]: e.target.value }));
  const setM = (f: keyof typeof blankMWR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setMwr(p => ({ ...p, [f]: e.target.value }));

  const saveDAR = async () => {
    if (!dar.employeeId || !dar.date) return;
    setSaving(true);
    try {
      await api.post("/team-reports/dars", {
        branch: dar.branch, department: dar.dept, date: dar.date, employeeId: dar.employeeId,
        customerVisits: dar.customerVisits, callsMade: dar.callsMade, followUpsDone: dar.followUpsDone,
        ordersBooked: dar.ordersBooked, ordersValue: dar.ordersValue, collectionsAmount: dar.collectionsAmount,
        travelFrom: dar.travelFrom, travelTo: dar.travelTo, travelKm: dar.travelKm,
        productionOutput: dar.productionOutput, outputQty: dar.outputQty,
        downtimeHours: dar.downtimeHours, downtimeReason: dar.downtimeReason,
        dispatches: dar.dispatches, dispatchDetails: dar.dispatchDetails,
        accountsCollections: dar.accountsCollections, collectionFrom: dar.collectionFrom,
        vendorPayments: dar.vendorPayments, vendorDetails: dar.vendorDetails,
      });
      setDar(blankDAR);
      setShowSubmit(false);
      await loadDAR();
    } catch { alert("Failed to submit DAR"); }
    finally { setSaving(false); }
  };

  const saveWWR = async () => {
    if (!wwr.employeeId || !wwr.weekFrom) return;
    setSaving(true);
    try {
      await api.post("/team-reports/wwrs", {
        branch: wwr.branch, department: wwr.department, weekFrom: wwr.weekFrom, weekTo: wwr.weekTo,
        employeeId: wwr.employeeId, weeklyTarget: wwr.weeklyTarget, weeklyAchievement: wwr.weeklyAchievement,
        challenges: wwr.challenges, actionPlan: wwr.actionPlan,
        escalationsNeeded: wwr.escalationsNeeded, escalationDetails: wwr.escalationDetails,
      });
      setWwr(blankWWR);
      setShowSubmit(false);
      await loadWWR();
    } catch { alert("Failed to submit WWR"); }
    finally { setSaving(false); }
  };

  const saveMWR = async () => {
    if (!mwr.employeeId || !mwr.month) return;
    setSaving(true);
    try {
      await api.post("/team-reports/mwrs", {
        branch: mwr.branch, department: mwr.department, month: mwr.month, year: mwr.year,
        employeeId: mwr.employeeId, salesTarget: mwr.salesTarget, salesAchievement: mwr.salesAchievement,
        conversionPct: mwr.conversionPct, collectionPct: mwr.collectionPct,
        productionAchievement: mwr.productionAchievement, efficiencyPct: mwr.efficiencyPct,
        rejectionCount: mwr.rejectionCount, rejectionReasons: mwr.rejectionReasons,
        totalCollected: mwr.totalCollected,
      });
      setMwr(blankMWR);
      setShowSubmit(false);
      await loadMWR();
    } catch { alert("Failed to submit MWR"); }
    finally { setSaving(false); }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const fDAR = darList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.dept === filterDept));
  const fWWR = wwrList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.department === filterDept));
  const fMWR = mwrList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.department === filterDept));

  const stats = tab === "dar"
    ? [
        { label: "Total DARs", value: darList.length },
        { label: "Today's DARs", value: darList.filter(r => r.date?.startsWith(todayStr)).length },
        { label: "Orders Booked", value: darList.reduce((s, r) => s + (r.ordersBooked || 0), 0) },
        { label: "Total Collections", value: fmt(darList.reduce((s, r) => s + (r.collectionsAmount || 0), 0)) },
      ]
    : tab === "wwr"
    ? [
        { label: "Total WWRs", value: wwrList.length },
        { label: "Pending Approval", value: wwrList.filter(r => r.approvalStatus === "Submitted").length },
        { label: "MD Approved", value: wwrList.filter(r => r.approvalStatus === "MD Approved").length },
        { label: "Escalations", value: wwrList.filter(r => r.escalationsNeeded).length },
      ]
    : [
        { label: "Total MWRs", value: mwrList.length },
        { label: "Pending Approval", value: mwrList.filter(r => r.approvalStatus === "Submitted").length },
        { label: "MD Approved", value: mwrList.filter(r => r.approvalStatus === "MD Approved").length },
        { label: "Avg Achievement", value: (() => { const s = mwrList.filter(r => (r.salesTarget || 0) > 0); return s.length ? `${Math.round(s.reduce((a, r) => a + ((r.salesAchievement || 0) / (r.salesTarget || 1)) * 100, 0) / s.length)}%` : "—"; })() },
      ];

  const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lc = "block text-xs font-medium text-gray-600 mb-1";

  const empName = (id: string) => employees.find(e => e.id === id)?.name ?? id;

  return (
    <div>
      <TopBar title="Team Reports — DAR / WWR / MWR" />
      <div className="p-6 space-y-5">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {(["dar", "wwr", "mwr"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "dar" ? "Daily (DAR)" : t === "wwr" ? "Weekly (WWR)" : "Monthly (MWR)"}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Submit */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center">
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Branches</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Departments</option>{depts.map(d => <option key={d}>{d}</option>)}
            </select>
            <button onClick={() => { if (tab === "dar") loadDAR(); else if (tab === "wwr") loadWWR(); else loadMWR(); }}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Refresh">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
          <button onClick={() => setShowSubmit(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} />
            {tab === "dar" ? "Submit DAR" : tab === "wwr" ? "Submit WWR" : "Submit MWR"}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-500">Loading reports…</span>
          </div>
        )}

        {/* DAR Table */}
        {!loading && tab === "dar" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Branch</th>
                  <th className="text-right px-4 py-3">Visits</th>
                  <th className="text-right px-4 py-3">Calls</th>
                  <th className="text-right px-4 py-3">Orders</th>
                  <th className="text-right px-4 py-3">Collections</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fDAR.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 text-gray-600">{r.date?.slice(0,10)}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                    <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{r.branch}</span></td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.customerVisits || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.callsMade || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{r.ordersBooked || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.collectionsAmount ? fmt(r.collectionsAmount) : "—"}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setViewDAR(r)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Eye size={12} /> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fDAR.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No DARs found</p>}
          </div>
        )}

        {/* WWR Table */}
        {!loading && tab === "wwr" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Week</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Branch</th>
                  <th className="text-right px-4 py-3">Target</th>
                  <th className="text-right px-4 py-3">Achieved</th>
                  <th className="text-right px-4 py-3">%</th>
                  <th className="text-left px-4 py-3">Approval</th>
                  <th className="text-left px-4 py-3">Escalation</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fWWR.map(r => {
                  const pct = r.weeklyTarget > 0 ? Math.round((r.weeklyAchievement / r.weeklyTarget) * 100) : null;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.weekFrom?.slice(0,10)} – {r.weekTo?.slice(0,10)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{r.branch}</span></td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.weeklyTarget > 0 ? fmt(r.weeklyTarget) : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.weeklyAchievement > 0 ? fmt(r.weeklyAchievement) : "—"}</td>
                      <td className={`px-4 py-3 text-right font-bold ${pct === null ? "text-gray-400" : pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600"}`}>{pct !== null ? `${pct}%` : "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[r.approvalStatus] ?? "bg-gray-100 text-gray-700"}`}>{r.approvalStatus}</span></td>
                      <td className="px-4 py-3">
                        {r.escalationsNeeded
                          ? <span className="flex items-center gap-1 text-xs text-orange-600"><AlertCircle size={11} /> Yes</span>
                          : <span className="text-xs text-gray-400">None</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewWWR(r)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Eye size={12} /> View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {fWWR.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No WWRs found</p>}
          </div>
        )}

        {/* MWR Table */}
        {!loading && tab === "mwr" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">Period</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Branch</th>
                  <th className="text-right px-4 py-3">Target (₹)</th>
                  <th className="text-right px-4 py-3">Achievement</th>
                  <th className="text-right px-4 py-3">%</th>
                  <th className="text-left px-4 py-3">Approval</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fMWR.map(r => {
                  const pct = r.salesTarget > 0 ? Math.round((r.salesAchievement / r.salesTarget) * 100) : null;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{months[(r.month || 1) - 1]} {r.year}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                      <td className="px-4 py-3"><span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{r.branch}</span></td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.salesTarget ? fmt(r.salesTarget) : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.salesAchievement ? fmt(r.salesAchievement) : "—"}</td>
                      <td className={`px-4 py-3 text-right font-bold ${pct === null ? "text-gray-400" : pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600"}`}>{pct !== null ? `${pct}%` : "—"}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[r.approvalStatus] ?? "bg-gray-100 text-gray-700"}`}>{r.approvalStatus}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewMWR(r)} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"><Eye size={12} /> View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {fMWR.length === 0 && <p className="text-center py-10 text-sm text-gray-400">No MWRs found</p>}
          </div>
        )}
      </div>

      {/* SUBMIT MODAL */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                {tab === "dar" ? "Submit Daily Activity Report (DAR)" : tab === "wwr" ? "Submit Weekly Work Report (WWR)" : "Submit Monthly Work Report (MWR)"}
              </h2>
              <button onClick={() => setShowSubmit(false)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">

              {/* DAR FORM */}
              {tab === "dar" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Date *</label><input type="date" value={dar.date} onChange={setD("date")} className={ic} /></div>
                    <div><label className={lc}>Employee *</label>
                      <select value={dar.employeeId} onChange={setD("employeeId")} className={ic}>
                        <option value="">— Select —</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.branch})</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Branch</label>
                      <select value={dar.branch} onChange={setD("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                    </div>
                    <div><label className={lc}>Department</label>
                      <select value={dar.dept} onChange={setD("dept")} className={ic}>{depts.map(d => <option key={d}>{d}</option>)}</select>
                    </div>
                  </div>

                  {dar.dept === "Sales / CRE" && (
                    <>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Sales Activity</p>
                      <div className="grid grid-cols-3 gap-3">
                        {([["Customer Visits","customerVisits"],["Calls Made","callsMade"],["Follow-ups Done","followUpsDone"],["Orders Booked","ordersBooked"],["Orders Value (₹)","ordersValue"],["Collections (₹)","collectionsAmount"]] as [string, keyof typeof blankDAR][]).map(([l,f]) => (
                          <div key={f}><label className={lc}>{l}</label><input type="number" min="0" value={dar[f] as string} onChange={setD(f)} className={ic} /></div>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Travel Details</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div><label className={lc}>From</label><input type="text" placeholder="Office / Area" value={dar.travelFrom} onChange={setD("travelFrom")} className={ic} /></div>
                        <div><label className={lc}>To</label><input type="text" placeholder="Client / Location" value={dar.travelTo} onChange={setD("travelTo")} className={ic} /></div>
                        <div><label className={lc}>Distance (km)</label><input type="number" min="0" value={dar.travelKm} onChange={setD("travelKm")} className={ic} /></div>
                      </div>
                    </>
                  )}

                  {dar.dept === "Production" && (
                    <>
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Production Activity</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Production Output</label><input type="text" placeholder="e.g. ACP boards, LED signs" value={dar.productionOutput} onChange={setD("productionOutput")} className={ic} /></div>
                        <div><label className={lc}>Output Quantity</label><input type="text" placeholder="e.g. 3 units / 400 sqft" value={dar.outputQty} onChange={setD("outputQty")} className={ic} /></div>
                        <div><label className={lc}>Downtime (hours)</label><input type="number" min="0" step="0.5" value={dar.downtimeHours} onChange={setD("downtimeHours")} className={ic} /></div>
                        <div><label className={lc}>Downtime Reason</label><input type="text" value={dar.downtimeReason} onChange={setD("downtimeReason")} className={ic} /></div>
                        <div><label className={lc}>Dispatches (count)</label><input type="number" min="0" value={dar.dispatches} onChange={setD("dispatches")} className={ic} /></div>
                        <div><label className={lc}>Dispatch Details</label><input type="text" value={dar.dispatchDetails} onChange={setD("dispatchDetails")} className={ic} /></div>
                      </div>
                    </>
                  )}

                  {dar.dept === "Accounts" && (
                    <>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Accounts Activity</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Collections (₹)</label><input type="number" min="0" value={dar.accountsCollections} onChange={setD("accountsCollections")} className={ic} /></div>
                        <div><label className={lc}>Collected From</label><input type="text" value={dar.collectionFrom} onChange={setD("collectionFrom")} className={ic} /></div>
                        <div><label className={lc}>Vendor Payments (₹)</label><input type="number" min="0" value={dar.vendorPayments} onChange={setD("vendorPayments")} className={ic} /></div>
                        <div><label className={lc}>Vendor Details</label><input type="text" value={dar.vendorDetails} onChange={setD("vendorDetails")} className={ic} /></div>
                        <div><label className={lc}>Reconciliation Status</label>
                          <select value={dar.reconciliationStatus} onChange={setD("reconciliationStatus")} className={ic}>
                            <option>Completed</option><option>Partial</option><option>Pending</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div><label className={lc}>Key Highlights</label><textarea rows={2} value={dar.highlights} onChange={setD("highlights")} placeholder="What went well today?" className={ic} /></div>
                    <div><label className={lc}>Challenges / Issues</label><textarea rows={2} value={dar.challenges} onChange={setD("challenges")} placeholder="Any blockers or escalations?" className={ic} /></div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveDAR} disabled={!dar.employeeId || !dar.date || saving}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 size={14} className="animate-spin" />} Submit DAR
                    </button>
                  </div>
                </>
              )}

              {/* WWR FORM */}
              {tab === "wwr" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Week From *</label><input type="date" value={wwr.weekFrom} onChange={setW("weekFrom")} className={ic} /></div>
                    <div><label className={lc}>Week To</label><input type="date" value={wwr.weekTo} onChange={setW("weekTo")} className={ic} /></div>
                    <div><label className={lc}>Employee *</label>
                      <select value={wwr.employeeId} onChange={setW("employeeId")} className={ic}>
                        <option value="">— Select —</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.branch})</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Branch</label>
                      <select value={wwr.branch} onChange={setW("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                    </div>
                    <div className="col-span-2"><label className={lc}>Department</label>
                      <select value={wwr.department} onChange={setW("department")} className={ic}>{depts.map(d => <option key={d}>{d}</option>)}</select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Weekly Target (₹)</label><input type="number" min="0" value={wwr.weeklyTarget} onChange={setW("weeklyTarget")} className={ic} /></div>
                    <div><label className={lc}>Weekly Achievement (₹)</label><input type="number" min="0" value={wwr.weeklyAchievement} onChange={setW("weeklyAchievement")} className={ic} /></div>
                  </div>
                  <div><label className={lc}>Challenges This Week</label><textarea rows={2} value={wwr.challenges} onChange={setW("challenges")} className={ic} /></div>
                  <div><label className={lc}>Action Plan for Next Week</label><textarea rows={2} value={wwr.actionPlan} onChange={setW("actionPlan")} className={ic} /></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600">Escalation Required?</span>
                    <button onClick={() => setWwr(p => ({ ...p, escalationsNeeded: !p.escalationsNeeded }))}
                      className={`w-10 h-5 rounded-full relative transition-colors ${wwr.escalationsNeeded ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${wwr.escalationsNeeded ? "right-0.5" : "left-0.5"}`} />
                    </button>
                  </div>
                  {wwr.escalationsNeeded && (
                    <div><label className={lc}>Escalation Details</label><textarea rows={2} value={wwr.escalationDetails} onChange={setW("escalationDetails")} className={ic} /></div>
                  )}
                  <p className="text-xs text-gray-400">Approval flow: Employee → Reporting Manager → AVP → MD</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveWWR} disabled={!wwr.employeeId || !wwr.weekFrom || saving}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 size={14} className="animate-spin" />} Submit WWR
                    </button>
                  </div>
                </>
              )}

              {/* MWR FORM */}
              {tab === "mwr" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Month *</label>
                      <select value={mwr.month} onChange={setM("month")} className={ic}>
                        {months.map((m, i) => <option key={m} value={String(i+1)}>{m}</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Year</label><input type="number" value={mwr.year} onChange={setM("year")} className={ic} /></div>
                    <div><label className={lc}>Employee *</label>
                      <select value={mwr.employeeId} onChange={setM("employeeId")} className={ic}>
                        <option value="">— Select —</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.branch})</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Branch</label>
                      <select value={mwr.branch} onChange={setM("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                    </div>
                    <div className="col-span-2"><label className={lc}>Department</label>
                      <select value={mwr.department} onChange={setM("department")} className={ic}>{depts.map(d => <option key={d}>{d}</option>)}</select>
                    </div>
                  </div>
                  {mwr.department === "Sales / CRE" && (
                    <>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Sales KPIs</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Monthly Target (₹)</label><input type="number" min="0" value={mwr.salesTarget} onChange={setM("salesTarget")} className={ic} /></div>
                        <div><label className={lc}>Achievement (₹)</label><input type="number" min="0" value={mwr.salesAchievement} onChange={setM("salesAchievement")} className={ic} /></div>
                        <div><label className={lc}>Lead Conversion %</label><input type="number" min="0" max="100" value={mwr.conversionPct} onChange={setM("conversionPct")} className={ic} /></div>
                        <div><label className={lc}>Collection %</label><input type="number" min="0" max="100" value={mwr.collectionPct} onChange={setM("collectionPct")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  {mwr.department === "Production" && (
                    <>
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Production KPIs</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Production Achievement</label><input type="text" placeholder="e.g. 4500 sqft" value={mwr.productionAchievement} onChange={setM("productionAchievement")} className={ic} /></div>
                        <div><label className={lc}>Efficiency %</label><input type="number" min="0" max="100" value={mwr.efficiencyPct} onChange={setM("efficiencyPct")} className={ic} /></div>
                        <div><label className={lc}>Rejections (count)</label><input type="number" min="0" value={mwr.rejectionCount} onChange={setM("rejectionCount")} className={ic} /></div>
                        <div><label className={lc}>Rejection Reasons</label><input type="text" value={mwr.rejectionReasons} onChange={setM("rejectionReasons")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  {mwr.department === "Accounts" && (
                    <>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Accounts KPIs</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Collection Efficiency %</label><input type="number" min="0" max="100" value={mwr.collectionEfficiencyPct} onChange={setM("collectionEfficiencyPct")} className={ic} /></div>
                        <div><label className={lc}>Total Collected (₹)</label><input type="number" min="0" value={mwr.totalCollected} onChange={setM("totalCollected")} className={ic} /></div>
                        <div className="col-span-2"><label className={lc}>Outstanding Reduction (₹)</label><input type="number" min="0" value={mwr.outstandingReduction} onChange={setM("outstandingReduction")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-400">Approval flow: Submitted → Reporting Manager → AVP → MD</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveMWR} disabled={!mwr.employeeId || !mwr.month || saving}
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                      {saving && <Loader2 size={14} className="animate-spin" />} Submit MWR
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW DAR */}
      {viewDAR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="font-bold text-gray-900">{viewDAR.employee}</h2>
                <p className="text-xs text-gray-500">{viewDAR.date?.slice(0,10)} · {viewDAR.branch}</p></div>
              <button onClick={() => setViewDAR(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {([["Visits", viewDAR.customerVisits],["Calls", viewDAR.callsMade],["Follow-ups", viewDAR.followUpsDone],["Orders", viewDAR.ordersBooked],["Value (₹)", fmt(viewDAR.ordersValue)],["Collections", fmt(viewDAR.collectionsAmount)]] as [string, string|number][]).map(([l,v]) => (
                  <div key={l} className="bg-blue-50 rounded-lg p-2 text-center"><p className="text-base font-bold text-blue-700">{v || "—"}</p><p className="text-xs text-gray-500">{l}</p></div>
                ))}
              </div>
              {viewDAR.travelKm > 0 && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">Travel: {viewDAR.travelKm} km</div>}
              {viewDAR.productionOutput && <div className="bg-yellow-50 rounded-lg p-3 text-sm">Output: {viewDAR.productionOutput} · Qty: {viewDAR.outputQty}</div>}
              {viewDAR.highlights && <div className="bg-green-50 border border-green-100 rounded-lg p-3"><p className="text-xs font-semibold text-green-700 mb-1">✓ Highlights</p><p className="text-sm">{viewDAR.highlights}</p></div>}
              {viewDAR.challenges && <div className="bg-orange-50 border border-orange-100 rounded-lg p-3"><p className="text-xs font-semibold text-orange-700 mb-1">⚠ Challenges</p><p className="text-sm">{viewDAR.challenges}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* VIEW WWR */}
      {viewWWR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="font-bold text-gray-900">{viewWWR.employee}</h2>
                <p className="text-xs text-gray-500">Week: {viewWWR.weekFrom?.slice(0,10)} → {viewWWR.weekTo?.slice(0,10)} · {viewWWR.branch}</p></div>
              <button onClick={() => setViewWWR(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {viewWWR.weeklyTarget > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Achievement vs Target</span>
                    <span className="font-bold">{Math.round((viewWWR.weeklyAchievement / viewWWR.weeklyTarget) * 100)}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${(viewWWR.weeklyAchievement / viewWWR.weeklyTarget) >= 1 ? "bg-green-500" : "bg-blue-500"}`}
                      style={{ width: `${Math.min(100, Math.round((viewWWR.weeklyAchievement / viewWWR.weeklyTarget) * 100))}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Target: {fmt(viewWWR.weeklyTarget)}</span>
                    <span>Achieved: {fmt(viewWWR.weeklyAchievement)}</span>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Approval Flow</p>
                <div className="flex gap-1 items-center">
                  {APPROVAL_FLOW.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${APPROVAL_FLOW.indexOf(viewWWR.approvalStatus) >= i ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                      {i < APPROVAL_FLOW.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                    </div>
                  ))}
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[viewWWR.approvalStatus] ?? "bg-gray-100 text-gray-700"}`}>{viewWWR.approvalStatus}</span>
                </div>
              </div>
              {viewWWR.challenges && <div className="bg-orange-50 border border-orange-100 rounded-lg p-3"><p className="text-xs font-semibold text-orange-700 mb-1">Challenges</p><p className="text-sm">{viewWWR.challenges}</p></div>}
              {viewWWR.actionPlan && <div className="bg-blue-50 border border-blue-100 rounded-lg p-3"><p className="text-xs font-semibold text-blue-700 mb-1">Action Plan</p><p className="text-sm">{viewWWR.actionPlan}</p></div>}
              {viewWWR.escalationsNeeded && <div className="bg-red-50 border border-red-100 rounded-lg p-3"><p className="text-xs font-semibold text-red-700 mb-1">⚠ Escalation Required</p><p className="text-sm">{viewWWR.escalationDetails}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* VIEW MWR */}
      {viewMWR && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div><h2 className="font-bold text-gray-900">{viewMWR.employee}</h2>
                <p className="text-xs text-gray-500">{months[(viewMWR.month||1) - 1]} {viewMWR.year} · {viewMWR.branch}</p></div>
              <button onClick={() => setViewMWR(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {([["Sales Target", fmt(viewMWR.salesTarget)],["Achievement", fmt(viewMWR.salesAchievement)],["Conversion %", `${viewMWR.conversionPct ?? 0}%`],["Collection %", `${viewMWR.collectionPct ?? 0}%`],["Prod. Achievement", viewMWR.productionAchievement || "—"],["Efficiency %", `${viewMWR.efficiencyPct ?? 0}%`]] as [string,string|number][]).map(([l,v]) => (
                  <div key={l} className="bg-gray-50 rounded-lg p-3 text-center"><p className="text-base font-bold text-gray-800">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Approval Flow</p>
                <div className="flex gap-1 items-center">
                  {APPROVAL_FLOW.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${APPROVAL_FLOW.indexOf(viewMWR.approvalStatus) >= i ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                      {i < APPROVAL_FLOW.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                    </div>
                  ))}
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[viewMWR.approvalStatus] ?? "bg-gray-100 text-gray-700"}`}>{viewMWR.approvalStatus}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
