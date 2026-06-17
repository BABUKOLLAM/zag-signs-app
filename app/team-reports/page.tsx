"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { branches } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, X, Eye, ChevronRight, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Dept = "Sales / CRE" | "Production" | "Accounts" | "Administration";
type ApprovalStatus = "Submitted" | "Manager Approved" | "AVP Approved" | "MD Approved";
const APPROVAL_FLOW: ApprovalStatus[] = ["Submitted", "Manager Approved", "AVP Approved", "MD Approved"];
const depts: Dept[] = ["Sales / CRE", "Production", "Accounts", "Administration"];
const employees = ["Arun Kumar", "Meera Nair", "Vijay CRE", "Renu Thomas", "Salman Khan", "Rajesh Kumar", "Priya Accounts", "HR Admin"];

interface DARReport {
  id: string; date: string; employee: string; branch: string; dept: Dept;
  customerVisits: number; callsMade: number; followUpsDone: number;
  ordersBooked: number; ordersValue: number; collectionsAmount: number;
  travelFrom: string; travelTo: string; travelKm: number;
  productionOutput: string; outputQty: string;
  downtimeHours: number; downtimeReason: string;
  dispatches: number; dispatchDetails: string;
  accountsCollections: number; collectionFrom: string;
  vendorPayments: number; vendorDetails: string;
  reconciliationStatus: "Completed" | "Pending" | "Partial";
  highlights: string; challenges: string; submittedAt: string;
}

interface WWReport {
  id: string; weekFrom: string; weekTo: string; employee: string; branch: string; dept: Dept;
  weeklyTarget: number; weeklyAchievement: number;
  challenges: string; actionPlan: string;
  escalationsNeeded: boolean; escalationDetails: string;
  approvalStatus: ApprovalStatus; submittedAt: string;
}

interface MWReport {
  id: string; month: string; year: number; employee: string; branch: string; dept: Dept;
  targetAmount: number; achievementAmount: number; conversionPct: number; collectionPct: number;
  productionAchievement: string; efficiencyPct: number; rejectionCount: number; rejectionReasons: string;
  collectionEfficiencyPct: number; outstandingReduction: number; totalCollected: number;
  keyWins: string; challenges: string;
  approvalStatus: ApprovalStatus; submittedAt: string;
}

// ─── Sample data ───────────────────────────────────────────────────────────────

const sampleDAR: DARReport[] = [
  {
    id: "DAR001", date: "2026-06-17", employee: "Arun Kumar", branch: "TVM", dept: "Sales / CRE",
    customerVisits: 4, callsMade: 12, followUpsDone: 6, ordersBooked: 1, ordersValue: 94000, collectionsAmount: 50000,
    travelFrom: "TVM Office", travelTo: "Asha Hospitals, Pattom", travelKm: 18,
    productionOutput: "", outputQty: "", downtimeHours: 0, downtimeReason: "", dispatches: 0, dispatchDetails: "",
    accountsCollections: 0, collectionFrom: "", vendorPayments: 0, vendorDetails: "", reconciliationStatus: "Completed",
    highlights: "Converted Asha Hospitals lead. Sent quotation to KSFE.",
    challenges: "One site visit postponed — client unavailable.",
    submittedAt: "2026-06-17T18:30:00",
  },
  {
    id: "DAR002", date: "2026-06-17", employee: "Rajesh Kumar", branch: "EKM", dept: "Production",
    customerVisits: 0, callsMade: 0, followUpsDone: 0, ordersBooked: 0, ordersValue: 0, collectionsAmount: 0,
    travelFrom: "", travelTo: "", travelKm: 0,
    productionOutput: "ACP Cladding + LED Backlit boards", outputQty: "3 units / 240 sqft",
    downtimeHours: 1.5, downtimeReason: "Solvent printer head cleaning",
    dispatches: 2, dispatchDetails: "Malabar Gold branch 1 & 2 dispatched",
    accountsCollections: 0, collectionFrom: "", vendorPayments: 0, vendorDetails: "", reconciliationStatus: "Completed",
    highlights: "Completed Malabar Gold EKM job ahead of schedule.",
    challenges: "Solvent ink (Cyan) running low — need urgent reorder.",
    submittedAt: "2026-06-17T19:00:00",
  },
  {
    id: "DAR003", date: "2026-06-16", employee: "Meera Nair", branch: "TVM", dept: "Accounts",
    customerVisits: 0, callsMade: 0, followUpsDone: 0, ordersBooked: 0, ordersValue: 0, collectionsAmount: 0,
    travelFrom: "", travelTo: "", travelKm: 0,
    productionOutput: "", outputQty: "", downtimeHours: 0, downtimeReason: "", dispatches: 0, dispatchDetails: "",
    accountsCollections: 185000, collectionFrom: "KSRTC — full payment",
    vendorPayments: 42000, vendorDetails: "Flex media supplier — monthly bill",
    reconciliationStatus: "Completed",
    highlights: "Full collection from KSRTC. Raised 2 invoices worth ₹1.2L.",
    challenges: "Rasheed Motors not responding — escalate to management.",
    submittedAt: "2026-06-16T17:30:00",
  },
];

const sampleWWR: WWReport[] = [
  {
    id: "WWR001", weekFrom: "2026-06-09", weekTo: "2026-06-14", employee: "Salman Khan", branch: "CLT", dept: "Sales / CRE",
    weeklyTarget: 300000, weeklyAchievement: 245000,
    challenges: "Al Baraka deal delayed — client's internal approvals pending.",
    actionPlan: "Follow up Monday with revised quotation. Schedule 3 new prospect demos.",
    escalationsNeeded: false, escalationDetails: "",
    approvalStatus: "Manager Approved", submittedAt: "2026-06-15T09:00:00",
  },
  {
    id: "WWR002", weekFrom: "2026-06-09", weekTo: "2026-06-14", employee: "Vijay CRE", branch: "EKM", dept: "Sales / CRE",
    weeklyTarget: 350000, weeklyAchievement: 380000,
    challenges: "None significant — Lulu Mall project going strong.",
    actionPlan: "Close Lulu Mall negotiation this week. Start 2 new institutional calls.",
    escalationsNeeded: false, escalationDetails: "",
    approvalStatus: "AVP Approved", submittedAt: "2026-06-15T10:30:00",
  },
  {
    id: "WWR003", weekFrom: "2026-06-09", weekTo: "2026-06-14", employee: "Rajesh Kumar", branch: "EKM", dept: "Production",
    weeklyTarget: 0, weeklyAchievement: 0,
    challenges: "Solvent printer needs service — production slowed by 20%.",
    actionPlan: "Schedule service visit Monday. Prioritise urgent jobs manually.",
    escalationsNeeded: true, escalationDetails: "Request approval for emergency printer servicing (approx ₹18,000).",
    approvalStatus: "Submitted", submittedAt: "2026-06-15T08:00:00",
  },
];

const sampleMWR: MWReport[] = [
  {
    id: "MWR001", month: "May", year: 2026, employee: "Arun Kumar", branch: "TVM", dept: "Sales / CRE",
    targetAmount: 600000, achievementAmount: 520000, conversionPct: 28, collectionPct: 82,
    productionAchievement: "", efficiencyPct: 0, rejectionCount: 0, rejectionReasons: "",
    collectionEfficiencyPct: 0, outstandingReduction: 0, totalCollected: 0,
    keyWins: "Asha Hospitals order closed. KSFE quotation submitted.",
    challenges: "BSNL deal lost on price. Need better pricing for government sector.",
    approvalStatus: "AVP Approved", submittedAt: "2026-06-02T10:00:00",
  },
  {
    id: "MWR002", month: "May", year: 2026, employee: "Meera Nair", branch: "TVM", dept: "Accounts",
    targetAmount: 0, achievementAmount: 0, conversionPct: 0, collectionPct: 0,
    productionAchievement: "", efficiencyPct: 0, rejectionCount: 0, rejectionReasons: "",
    collectionEfficiencyPct: 91, outstandingReduction: 125000, totalCollected: 820000,
    keyWins: "Cleared 3 long-pending invoices. Reduced overdue by ₹1.25L.",
    challenges: "Rasheed Motors ₹85K outstanding — needs management involvement.",
    approvalStatus: "Manager Approved", submittedAt: "2026-06-03T09:00:00",
  },
];

// ─── Colour maps ───────────────────────────────────────────────────────────────

const deptColor: Record<Dept, string> = {
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

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ─── Blank forms ──────────────────────────────────────────────────────────────

const blankDAR = {
  date: new Date().toISOString().split("T")[0], employee: "", branch: branches[0], dept: "Sales / CRE" as Dept,
  customerVisits: "", callsMade: "", followUpsDone: "", ordersBooked: "", ordersValue: "", collectionsAmount: "",
  travelFrom: "", travelTo: "", travelKm: "",
  productionOutput: "", outputQty: "", downtimeHours: "", downtimeReason: "", dispatches: "", dispatchDetails: "",
  accountsCollections: "", collectionFrom: "", vendorPayments: "", vendorDetails: "",
  reconciliationStatus: "Completed" as "Completed" | "Pending" | "Partial",
  highlights: "", challenges: "",
};

const blankWWR = {
  weekFrom: "", weekTo: "", employee: "", branch: branches[0], dept: "Sales / CRE" as Dept,
  weeklyTarget: "", weeklyAchievement: "", challenges: "", actionPlan: "",
  escalationsNeeded: false, escalationDetails: "",
};

const blankMWR = {
  month: months[new Date().getMonth()], year: new Date().getFullYear(),
  employee: "", branch: branches[0], dept: "Sales / CRE" as Dept,
  targetAmount: "", achievementAmount: "", conversionPct: "", collectionPct: "",
  productionAchievement: "", efficiencyPct: "", rejectionCount: "", rejectionReasons: "",
  collectionEfficiencyPct: "", outstandingReduction: "", totalCollected: "",
  keyWins: "", challenges: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamReportsPage() {
  const [tab, setTab] = useState<"dar" | "wwr" | "mwr">("dar");
  const [darList, setDarList] = useState<DARReport[]>(sampleDAR);
  const [wwrList, setWwrList] = useState<WWReport[]>(sampleWWR);
  const [mwrList, setMwrList] = useState<MWReport[]>(sampleMWR);

  const [showSubmit, setShowSubmit] = useState(false);
  const [viewDAR, setViewDAR] = useState<DARReport | null>(null);
  const [viewWWR, setViewWWR] = useState<WWReport | null>(null);
  const [viewMWR, setViewMWR] = useState<MWReport | null>(null);

  const [dar, setDar] = useState(blankDAR);
  const [wwr, setWwr] = useState(blankWWR);
  const [mwr, setMwr] = useState(blankMWR);
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterDept, setFilterDept] = useState("All");

  const setD = (f: keyof typeof blankDAR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setDar(p => ({ ...p, [f]: e.target.value }));
  const setW = (f: keyof typeof blankWWR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setWwr(p => ({ ...p, [f]: e.target.value }));
  const setM = (f: keyof typeof blankMWR) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setMwr(p => ({ ...p, [f]: e.target.value }));

  const saveDAR = () => {
    if (!dar.employee || !dar.date) return;
    const r: DARReport = {
      id: `DAR${String(darList.length + 1).padStart(3, "0")}`,
      date: dar.date, employee: dar.employee, branch: dar.branch, dept: dar.dept,
      customerVisits: +dar.customerVisits || 0, callsMade: +dar.callsMade || 0,
      followUpsDone: +dar.followUpsDone || 0, ordersBooked: +dar.ordersBooked || 0,
      ordersValue: +dar.ordersValue || 0, collectionsAmount: +dar.collectionsAmount || 0,
      travelFrom: dar.travelFrom, travelTo: dar.travelTo, travelKm: +dar.travelKm || 0,
      productionOutput: dar.productionOutput, outputQty: dar.outputQty,
      downtimeHours: +dar.downtimeHours || 0, downtimeReason: dar.downtimeReason,
      dispatches: +dar.dispatches || 0, dispatchDetails: dar.dispatchDetails,
      accountsCollections: +dar.accountsCollections || 0, collectionFrom: dar.collectionFrom,
      vendorPayments: +dar.vendorPayments || 0, vendorDetails: dar.vendorDetails,
      reconciliationStatus: dar.reconciliationStatus,
      highlights: dar.highlights, challenges: dar.challenges,
      submittedAt: new Date().toISOString(),
    };
    setDarList(p => [r, ...p]);
    setDar(blankDAR); setShowSubmit(false);
  };

  const saveWWR = () => {
    if (!wwr.employee || !wwr.weekFrom) return;
    const r: WWReport = {
      id: `WWR${String(wwrList.length + 1).padStart(3, "0")}`,
      weekFrom: wwr.weekFrom, weekTo: wwr.weekTo,
      employee: wwr.employee, branch: wwr.branch, dept: wwr.dept,
      weeklyTarget: +wwr.weeklyTarget || 0, weeklyAchievement: +wwr.weeklyAchievement || 0,
      challenges: wwr.challenges, actionPlan: wwr.actionPlan,
      escalationsNeeded: wwr.escalationsNeeded, escalationDetails: wwr.escalationDetails,
      approvalStatus: "Submitted", submittedAt: new Date().toISOString(),
    };
    setWwrList(p => [r, ...p]);
    setWwr(blankWWR); setShowSubmit(false);
  };

  const saveMWR = () => {
    if (!mwr.employee || !mwr.month) return;
    const r: MWReport = {
      id: `MWR${String(mwrList.length + 1).padStart(3, "0")}`,
      month: mwr.month, year: +mwr.year,
      employee: mwr.employee, branch: mwr.branch, dept: mwr.dept,
      targetAmount: +mwr.targetAmount || 0, achievementAmount: +mwr.achievementAmount || 0,
      conversionPct: +mwr.conversionPct || 0, collectionPct: +mwr.collectionPct || 0,
      productionAchievement: mwr.productionAchievement, efficiencyPct: +mwr.efficiencyPct || 0,
      rejectionCount: +mwr.rejectionCount || 0, rejectionReasons: mwr.rejectionReasons,
      collectionEfficiencyPct: +mwr.collectionEfficiencyPct || 0,
      outstandingReduction: +mwr.outstandingReduction || 0, totalCollected: +mwr.totalCollected || 0,
      keyWins: mwr.keyWins, challenges: mwr.challenges,
      approvalStatus: "Submitted", submittedAt: new Date().toISOString(),
    };
    setMwrList(p => [r, ...p]);
    setMwr(blankMWR); setShowSubmit(false);
  };

  const advanceWWR = (id: string) => setWwrList(p => p.map(r => {
    if (r.id !== id) return r;
    const idx = APPROVAL_FLOW.indexOf(r.approvalStatus);
    return idx < APPROVAL_FLOW.length - 1 ? { ...r, approvalStatus: APPROVAL_FLOW[idx + 1] } : r;
  }));

  const advanceMWR = (id: string) => setMwrList(p => p.map(r => {
    if (r.id !== id) return r;
    const idx = APPROVAL_FLOW.indexOf(r.approvalStatus);
    return idx < APPROVAL_FLOW.length - 1 ? { ...r, approvalStatus: APPROVAL_FLOW[idx + 1] } : r;
  }));

  const todayStr = new Date().toISOString().split("T")[0];
  const fDAR = darList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.dept === filterDept));
  const fWWR = wwrList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.dept === filterDept));
  const fMWR = mwrList.filter(r => (filterBranch === "All" || r.branch === filterBranch) && (filterDept === "All" || r.dept === filterDept));

  const stats = tab === "dar"
    ? [
        { label: "Total DARs", value: darList.length },
        { label: "Today's DARs", value: darList.filter(r => r.date === todayStr).length },
        { label: "Orders Booked", value: darList.reduce((s, r) => s + r.ordersBooked, 0) },
        { label: "Total Collections", value: fmt(darList.reduce((s, r) => s + r.collectionsAmount + r.accountsCollections, 0)) },
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
        { label: "Avg Achievement", value: (() => { const s = mwrList.filter(r => r.targetAmount > 0); return s.length ? `${Math.round(s.reduce((a, r) => a + (r.achievementAmount / r.targetAmount) * 100, 0) / s.length)}%` : "—"; })() },
      ];

  const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
  const lc = "block text-xs font-medium text-gray-600 mb-1";

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
          <div className="flex gap-3 flex-wrap">
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Branches</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Departments</option>{depts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => setShowSubmit(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} />
            {tab === "dar" ? "Submit DAR" : tab === "wwr" ? "Submit WWR" : "Submit MWR"}
          </button>
        </div>

        {/* ── DAR Table ── */}
        {tab === "dar" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Dept</th>
                  <th className="text-right px-4 py-3">Visits</th>
                  <th className="text-right px-4 py-3">Calls</th>
                  <th className="text-right px-4 py-3">Orders</th>
                  <th className="text-left px-4 py-3">Highlights</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fDAR.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 text-sm">
                    <td className="px-4 py-3 text-blue-600 font-medium">{r.id}</td>
                    <td className="px-4 py-3 text-gray-600">{r.date}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptColor[r.dept]}`}>{r.dept}</span></td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.customerVisits || "—"}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{r.callsMade || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{r.ordersBooked || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-xs truncate">{r.highlights || "—"}</td>
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

        {/* ── WWR Table ── */}
        {tab === "wwr" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Week</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Dept</th>
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
                  const nextStep = APPROVAL_FLOW[APPROVAL_FLOW.indexOf(r.approvalStatus) + 1];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-blue-600 font-medium">{r.id}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{r.weekFrom} – {r.weekTo}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptColor[r.dept]}`}>{r.dept}</span></td>
                      <td className="px-4 py-3 text-right text-gray-600">{r.weeklyTarget > 0 ? fmt(r.weeklyTarget) : "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{r.weeklyAchievement > 0 ? fmt(r.weeklyAchievement) : "—"}</td>
                      <td className={`px-4 py-3 text-right font-bold ${pct === null ? "text-gray-400" : pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : "text-red-600"}`}>{pct !== null ? `${pct}%` : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[r.approvalStatus]}`}>{r.approvalStatus}</span>
                          {nextStep && <button onClick={() => advanceWWR(r.id)} className="text-xs text-blue-600 hover:text-blue-800">Approve →</button>}
                        </div>
                      </td>
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

        {/* ── MWR Table ── */}
        {tab === "mwr" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                <tr>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Period</th>
                  <th className="text-left px-4 py-3">Employee</th>
                  <th className="text-left px-4 py-3">Dept</th>
                  <th className="text-right px-4 py-3">Target / KPI</th>
                  <th className="text-right px-4 py-3">Achievement</th>
                  <th className="text-left px-4 py-3">Approval</th>
                  <th className="text-left px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {fMWR.map(r => {
                  const nextStep = APPROVAL_FLOW[APPROVAL_FLOW.indexOf(r.approvalStatus) + 1];
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-blue-600 font-medium">{r.id}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{r.month} {r.year}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptColor[r.dept]}`}>{r.dept}</span></td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {r.dept === "Sales / CRE" ? fmt(r.targetAmount) : r.dept === "Accounts" ? `Eff: ${r.collectionEfficiencyPct}%` : r.productionAchievement || "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {r.dept === "Sales / CRE" ? fmt(r.achievementAmount) : r.dept === "Accounts" ? fmt(r.totalCollected) : r.efficiencyPct ? `${r.efficiencyPct}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[r.approvalStatus]}`}>{r.approvalStatus}</span>
                          {nextStep && <button onClick={() => advanceMWR(r.id)} className="text-xs text-blue-600 hover:text-blue-800">Approve →</button>}
                        </div>
                      </td>
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

      {/* ═══ SUBMIT MODAL ═══ */}
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
                      <select value={dar.employee} onChange={setD("employee")} className={ic}>
                        <option value="">— Select —</option>{employees.map(e => <option key={e}>{e}</option>)}
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
                        <div><label className={lc}>Downtime Reason</label><input type="text" placeholder="Machine issue, power cut, etc." value={dar.downtimeReason} onChange={setD("downtimeReason")} className={ic} /></div>
                        <div><label className={lc}>Dispatches (count)</label><input type="number" min="0" value={dar.dispatches} onChange={setD("dispatches")} className={ic} /></div>
                        <div><label className={lc}>Dispatch Details</label><input type="text" placeholder="Orders / customers dispatched" value={dar.dispatchDetails} onChange={setD("dispatchDetails")} className={ic} /></div>
                      </div>
                    </>
                  )}

                  {dar.dept === "Accounts" && (
                    <>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Accounts Activity</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Collections (₹)</label><input type="number" min="0" value={dar.accountsCollections} onChange={setD("accountsCollections")} className={ic} /></div>
                        <div><label className={lc}>Collected From</label><input type="text" placeholder="Customer name(s)" value={dar.collectionFrom} onChange={setD("collectionFrom")} className={ic} /></div>
                        <div><label className={lc}>Vendor Payments (₹)</label><input type="number" min="0" value={dar.vendorPayments} onChange={setD("vendorPayments")} className={ic} /></div>
                        <div><label className={lc}>Vendor Details</label><input type="text" placeholder="Vendor name(s)" value={dar.vendorDetails} onChange={setD("vendorDetails")} className={ic} /></div>
                        <div><label className={lc}>Reconciliation Status</label>
                          <select value={dar.reconciliationStatus} onChange={setD("reconciliationStatus")} className={ic}>
                            <option>Completed</option><option>Partial</option><option>Pending</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 gap-3">
                    <div><label className={lc}>Key Highlights / Achievements</label><textarea rows={2} value={dar.highlights} onChange={setD("highlights")} placeholder="What went well today?" className={ic} /></div>
                    <div><label className={lc}>Challenges / Issues</label><textarea rows={2} value={dar.challenges} onChange={setD("challenges")} placeholder="Any blockers or escalations?" className={ic} /></div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveDAR} disabled={!dar.employee || !dar.date} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit DAR</button>
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
                      <select value={wwr.employee} onChange={setW("employee")} className={ic}>
                        <option value="">— Select —</option>{employees.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Branch</label>
                      <select value={wwr.branch} onChange={setW("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                    </div>
                    <div className="col-span-2"><label className={lc}>Department</label>
                      <select value={wwr.dept} onChange={setW("dept")} className={ic}>{depts.map(d => <option key={d}>{d}</option>)}</select>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weekly Performance</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Weekly Target (₹ or units)</label><input type="number" min="0" value={wwr.weeklyTarget} onChange={setW("weeklyTarget")} className={ic} /></div>
                    <div><label className={lc}>Weekly Achievement</label><input type="number" min="0" value={wwr.weeklyAchievement} onChange={setW("weeklyAchievement")} className={ic} /></div>
                  </div>
                  <div><label className={lc}>Challenges Faced This Week</label><textarea rows={2} value={wwr.challenges} onChange={setW("challenges")} placeholder="Main obstacles this week" className={ic} /></div>
                  <div><label className={lc}>Action Plan for Next Week</label><textarea rows={2} value={wwr.actionPlan} onChange={setW("actionPlan")} placeholder="What will you do differently?" className={ic} /></div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-600">Escalation Required?</span>
                    <button onClick={() => setWwr(p => ({ ...p, escalationsNeeded: !p.escalationsNeeded }))}
                      className={`w-10 h-5 rounded-full relative transition-colors ${wwr.escalationsNeeded ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${wwr.escalationsNeeded ? "right-0.5" : "left-0.5"}`} />
                    </button>
                    <span className="text-sm text-gray-600">{wwr.escalationsNeeded ? "Yes" : "No"}</span>
                  </div>
                  {wwr.escalationsNeeded && (
                    <div><label className={lc}>Escalation Details</label><textarea rows={2} value={wwr.escalationDetails} onChange={setW("escalationDetails")} placeholder="Describe what needs management attention" className={ic} /></div>
                  )}
                  <p className="text-xs text-gray-400">Approval flow: Employee → Reporting Manager → AVP → MD</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveWWR} disabled={!wwr.employee || !wwr.weekFrom} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit WWR</button>
                  </div>
                </>
              )}

              {/* MWR FORM */}
              {tab === "mwr" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={lc}>Month *</label>
                      <select value={mwr.month} onChange={setM("month")} className={ic}>{months.map(m => <option key={m}>{m}</option>)}</select>
                    </div>
                    <div><label className={lc}>Year</label><input type="number" value={mwr.year} onChange={setM("year")} className={ic} /></div>
                    <div><label className={lc}>Employee *</label>
                      <select value={mwr.employee} onChange={setM("employee")} className={ic}>
                        <option value="">— Select —</option>{employees.map(e => <option key={e}>{e}</option>)}
                      </select>
                    </div>
                    <div><label className={lc}>Branch</label>
                      <select value={mwr.branch} onChange={setM("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select>
                    </div>
                    <div className="col-span-2"><label className={lc}>Department</label>
                      <select value={mwr.dept} onChange={setM("dept")} className={ic}>{depts.map(d => <option key={d}>{d}</option>)}</select>
                    </div>
                  </div>
                  {mwr.dept === "Sales / CRE" && (
                    <>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Sales KPIs — BRD Section 7</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Monthly Target (₹)</label><input type="number" min="0" value={mwr.targetAmount} onChange={setM("targetAmount")} className={ic} /></div>
                        <div><label className={lc}>Achievement (₹)</label><input type="number" min="0" value={mwr.achievementAmount} onChange={setM("achievementAmount")} className={ic} /></div>
                        <div><label className={lc}>Lead Conversion %</label><input type="number" min="0" max="100" value={mwr.conversionPct} onChange={setM("conversionPct")} className={ic} /></div>
                        <div><label className={lc}>Collection %</label><input type="number" min="0" max="100" value={mwr.collectionPct} onChange={setM("collectionPct")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  {mwr.dept === "Production" && (
                    <>
                      <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Production KPIs — BRD Section 7</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Production Achievement</label><input type="text" placeholder="e.g. 4500 sqft, 28 jobs" value={mwr.productionAchievement} onChange={setM("productionAchievement")} className={ic} /></div>
                        <div><label className={lc}>Efficiency %</label><input type="number" min="0" max="100" value={mwr.efficiencyPct} onChange={setM("efficiencyPct")} className={ic} /></div>
                        <div><label className={lc}>Rejections / Rework (count)</label><input type="number" min="0" value={mwr.rejectionCount} onChange={setM("rejectionCount")} className={ic} /></div>
                        <div><label className={lc}>Rejection Reasons</label><input type="text" placeholder="Quality, print defects, etc." value={mwr.rejectionReasons} onChange={setM("rejectionReasons")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  {mwr.dept === "Accounts" && (
                    <>
                      <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Accounts KPIs — BRD Section 7</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className={lc}>Collection Efficiency %</label><input type="number" min="0" max="100" value={mwr.collectionEfficiencyPct} onChange={setM("collectionEfficiencyPct")} className={ic} /></div>
                        <div><label className={lc}>Total Collected (₹)</label><input type="number" min="0" value={mwr.totalCollected} onChange={setM("totalCollected")} className={ic} /></div>
                        <div className="col-span-2"><label className={lc}>Outstanding Reduction (₹)</label><input type="number" min="0" value={mwr.outstandingReduction} onChange={setM("outstandingReduction")} className={ic} /></div>
                      </div>
                    </>
                  )}
                  <div><label className={lc}>Key Wins / Highlights</label><textarea rows={2} value={mwr.keyWins} onChange={setM("keyWins")} placeholder="Major achievements this month" className={ic} /></div>
                  <div><label className={lc}>Challenges & Support Needed</label><textarea rows={2} value={mwr.challenges} onChange={setM("challenges")} placeholder="Issues requiring management attention" className={ic} /></div>
                  <p className="text-xs text-gray-400">Approval flow: Submitted → Reporting Manager → AVP → MD</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setShowSubmit(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={saveMWR} disabled={!mwr.employee || !mwr.month} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Submit MWR</button>
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
              <div><h2 className="font-bold text-gray-900">{viewDAR.id} — {viewDAR.employee}</h2>
                <p className="text-xs text-gray-500">{viewDAR.date} · {viewDAR.branch} · {viewDAR.dept}</p></div>
              <button onClick={() => setViewDAR(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {viewDAR.dept === "Sales / CRE" && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Sales Activity</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([["Visits",viewDAR.customerVisits],["Calls",viewDAR.callsMade],["Follow-ups",viewDAR.followUpsDone],["Orders",viewDAR.ordersBooked],["Value",fmt(viewDAR.ordersValue)],["Collections",fmt(viewDAR.collectionsAmount)]] as [string,string|number][]).map(([l,v]) => (
                      <div key={l} className="bg-blue-50 rounded-lg p-2 text-center"><p className="text-base font-bold text-blue-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  {viewDAR.travelFrom && <div className="mt-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">Travel: {viewDAR.travelFrom} → {viewDAR.travelTo} ({viewDAR.travelKm} km)</div>}
                </div>
              )}
              {viewDAR.dept === "Production" && (
                <div>
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">Production Activity</p>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {([["Output",viewDAR.outputQty||"—"],["Downtime",`${viewDAR.downtimeHours}h`],["Dispatches",viewDAR.dispatches]] as [string,string|number][]).map(([l,v]) => (
                      <div key={l} className="bg-yellow-50 rounded-lg p-2 text-center"><p className="text-base font-bold text-yellow-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  {viewDAR.productionOutput && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{viewDAR.productionOutput}</p>}
                  {viewDAR.dispatchDetails && <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">Dispatches: {viewDAR.dispatchDetails}</p>}
                </div>
              )}
              {viewDAR.dept === "Accounts" && (
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Accounts Activity</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([["Collections",fmt(viewDAR.accountsCollections)],["Vendor Pmts",fmt(viewDAR.vendorPayments)],["Recon",viewDAR.reconciliationStatus]] as [string,string][]).map(([l,v]) => (
                      <div key={l} className="bg-green-50 rounded-lg p-2 text-center"><p className="text-sm font-bold text-green-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                    ))}
                  </div>
                  {viewDAR.collectionFrom && <p className="text-sm text-gray-700 mt-2 bg-gray-50 rounded-lg p-2">From: {viewDAR.collectionFrom}</p>}
                </div>
              )}
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
              <div><h2 className="font-bold text-gray-900">{viewWWR.id} — {viewWWR.employee}</h2>
                <p className="text-xs text-gray-500">Week: {viewWWR.weekFrom} → {viewWWR.weekTo} · {viewWWR.branch}</p></div>
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
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[viewWWR.approvalStatus]}`}>{viewWWR.approvalStatus}</span>
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
              <div><h2 className="font-bold text-gray-900">{viewMWR.id} — {viewMWR.employee}</h2>
                <p className="text-xs text-gray-500">{viewMWR.month} {viewMWR.year} · {viewMWR.branch} · {viewMWR.dept}</p></div>
              <button onClick={() => setViewMWR(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {viewMWR.dept === "Sales / CRE" && (
                <div className="grid grid-cols-2 gap-3">
                  {([["Target",fmt(viewMWR.targetAmount)],["Achievement",fmt(viewMWR.achievementAmount)],["Conversion",`${viewMWR.conversionPct}%`],["Collection",`${viewMWR.collectionPct}%`]] as [string,string][]).map(([l,v]) => (
                    <div key={l} className="bg-blue-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-blue-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                  ))}
                </div>
              )}
              {viewMWR.dept === "Production" && (
                <div className="grid grid-cols-3 gap-2">
                  {([["Achievement",viewMWR.productionAchievement||"—"],["Efficiency",`${viewMWR.efficiencyPct}%`],["Rejections",viewMWR.rejectionCount]] as [string,string|number][]).map(([l,v]) => (
                    <div key={l} className="bg-yellow-50 rounded-lg p-3 text-center"><p className="text-lg font-bold text-yellow-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                  ))}
                </div>
              )}
              {viewMWR.dept === "Accounts" && (
                <div className="grid grid-cols-3 gap-2">
                  {([["Collected",fmt(viewMWR.totalCollected)],["Efficiency",`${viewMWR.collectionEfficiencyPct}%`],["OS Reduction",fmt(viewMWR.outstandingReduction)]] as [string,string][]).map(([l,v]) => (
                    <div key={l} className="bg-green-50 rounded-lg p-3 text-center"><p className="text-sm font-bold text-green-700">{v}</p><p className="text-xs text-gray-500">{l}</p></div>
                  ))}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">Approval Flow</p>
                <div className="flex gap-1 items-center">
                  {APPROVAL_FLOW.map((s, i) => (
                    <div key={s} className="flex items-center gap-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${APPROVAL_FLOW.indexOf(viewMWR.approvalStatus) >= i ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>{i + 1}</div>
                      {i < APPROVAL_FLOW.length - 1 && <ChevronRight size={12} className="text-gray-300" />}
                    </div>
                  ))}
                  <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${approvalColor[viewMWR.approvalStatus]}`}>{viewMWR.approvalStatus}</span>
                </div>
              </div>
              {viewMWR.keyWins && <div className="bg-green-50 border border-green-100 rounded-lg p-3"><p className="text-xs font-semibold text-green-700 mb-1">✓ Key Wins</p><p className="text-sm">{viewMWR.keyWins}</p></div>}
              {viewMWR.challenges && <div className="bg-orange-50 border border-orange-100 rounded-lg p-3"><p className="text-xs font-semibold text-orange-700 mb-1">⚠ Challenges</p><p className="text-sm">{viewMWR.challenges}</p></div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
