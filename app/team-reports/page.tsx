"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { branches } from "@/lib/data";
import { fmt } from "@/lib/utils";
import { Plus, FileText, ChevronDown, X, Eye } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ReportPeriod = "Daily" | "Weekly" | "Monthly";
type Department = "Sales / CRE" | "Production" | "Accounts" | "HR / General";

interface TeamReport {
  id: string;
  date: string;
  period: ReportPeriod;
  branch: string;
  employee: string;
  department: Department;
  // Sales
  leadsCalled: number;
  quotationsSent: number;
  siteVisits: number;
  ordersReceived: number;
  followUpsDone: number;
  // Production
  jobsCompleted: number;
  jobsInProgress: number;
  jobsPending: number;
  materialsConsumed: string;
  // Accounts
  invoicesRaised: number;
  amountCollected: number;
  collectionCalls: number;
  // Common
  highlights: string;
  challenges: string;
  submittedAt: string;
}

// ─── Sample data ─────────────────────────────────────────────────────────────

const sampleReports: TeamReport[] = [
  {
    id: "RPT001", date: "2026-06-17", period: "Daily", branch: "TVM",
    employee: "Arun Kumar", department: "Sales / CRE",
    leadsCalled: 8, quotationsSent: 2, siteVisits: 1, ordersReceived: 1, followUpsDone: 5,
    jobsCompleted: 0, jobsInProgress: 0, jobsPending: 0, materialsConsumed: "",
    invoicesRaised: 0, amountCollected: 0, collectionCalls: 0,
    highlights: "Converted Asha Hospitals lead to order. Sent quotation to new hospital.",
    challenges: "One site visit postponed due to client unavailability.",
    submittedAt: "2026-06-17T18:00:00",
  },
  {
    id: "RPT002", date: "2026-06-17", period: "Daily", branch: "EKM",
    employee: "Rajesh Kumar", department: "Production",
    leadsCalled: 0, quotationsSent: 0, siteVisits: 0, ordersReceived: 0, followUpsDone: 0,
    jobsCompleted: 2, jobsInProgress: 3, jobsPending: 1, materialsConsumed: "Flex 400 sqft, ACP 4 sheets",
    invoicesRaised: 0, amountCollected: 0, collectionCalls: 0,
    highlights: "Completed KSRTC hoarding and Malabar Gold ACP cladding.",
    challenges: "Solvent ink (Cyan) running low — reorder urgently.",
    submittedAt: "2026-06-17T19:15:00",
  },
  {
    id: "RPT003", date: "2026-06-16", period: "Daily", branch: "TVM",
    employee: "Meera Nair", department: "Accounts",
    leadsCalled: 0, quotationsSent: 0, siteVisits: 0, ordersReceived: 0, followUpsDone: 0,
    jobsCompleted: 0, jobsInProgress: 0, jobsPending: 0, materialsConsumed: "",
    invoicesRaised: 2, amountCollected: 185000, collectionCalls: 4,
    highlights: "Collected full payment from KSRTC. Raised 2 new invoices.",
    challenges: "Rasheed Motors not responding — escalate to management.",
    submittedAt: "2026-06-16T17:30:00",
  },
  {
    id: "RPT004", date: "2026-06-16", period: "Weekly", branch: "CLT",
    employee: "Salman Khan", department: "Sales / CRE",
    leadsCalled: 32, quotationsSent: 6, siteVisits: 4, ordersReceived: 2, followUpsDone: 18,
    jobsCompleted: 0, jobsInProgress: 0, jobsPending: 0, materialsConsumed: "",
    invoicesRaised: 0, amountCollected: 0, collectionCalls: 0,
    highlights: "Good week — 2 orders worth ₹2.5L. Al Baraka showing strong interest.",
    challenges: "Need more print samples for CLT prospects.",
    submittedAt: "2026-06-16T09:00:00",
  },
];

// ─── Department colours ───────────────────────────────────────────────────────

const deptColors: Record<Department, string> = {
  "Sales / CRE": "bg-blue-100 text-blue-700",
  "Production": "bg-yellow-100 text-yellow-700",
  "Accounts": "bg-green-100 text-green-700",
  "HR / General": "bg-purple-100 text-purple-700",
};

const periodColors: Record<ReportPeriod, string> = {
  Daily: "bg-gray-100 text-gray-700",
  Weekly: "bg-indigo-100 text-indigo-700",
  Monthly: "bg-orange-100 text-orange-700",
};

const employees = [
  "Arun Kumar", "Meera Nair", "Vijay CRE", "Renu Thomas",
  "Salman Khan", "Rajesh Kumar",
];

const departments: Department[] = ["Sales / CRE", "Production", "Accounts", "HR / General"];

// ─── Blank form ───────────────────────────────────────────────────────────────

const blankForm = {
  date: new Date().toISOString().split("T")[0],
  period: "Daily" as ReportPeriod,
  branch: branches[0],
  employee: "",
  department: "Sales / CRE" as Department,
  leadsCalled: "", quotationsSent: "", siteVisits: "", ordersReceived: "", followUpsDone: "",
  jobsCompleted: "", jobsInProgress: "", jobsPending: "", materialsConsumed: "",
  invoicesRaised: "", amountCollected: "", collectionCalls: "",
  highlights: "", challenges: "",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamReportsPage() {
  const [reports, setReports] = useState<TeamReport[]>(sampleReports);
  const [showModal, setShowModal] = useState(false);
  const [viewReport, setViewReport] = useState<TeamReport | null>(null);
  const [form, setForm] = useState(blankForm);
  const [filterBranch, setFilterBranch] = useState("All");
  const [filterDept, setFilterDept] = useState("All");
  const [filterPeriod, setFilterPeriod] = useState("All");

  const set = (field: keyof typeof blankForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    if (!form.employee || !form.date) return;
    const newReport: TeamReport = {
      id: `RPT${String(reports.length + 1).padStart(3, "0")}`,
      date: form.date,
      period: form.period,
      branch: form.branch,
      employee: form.employee,
      department: form.department,
      leadsCalled: Number(form.leadsCalled) || 0,
      quotationsSent: Number(form.quotationsSent) || 0,
      siteVisits: Number(form.siteVisits) || 0,
      ordersReceived: Number(form.ordersReceived) || 0,
      followUpsDone: Number(form.followUpsDone) || 0,
      jobsCompleted: Number(form.jobsCompleted) || 0,
      jobsInProgress: Number(form.jobsInProgress) || 0,
      jobsPending: Number(form.jobsPending) || 0,
      materialsConsumed: form.materialsConsumed,
      invoicesRaised: Number(form.invoicesRaised) || 0,
      amountCollected: Number(form.amountCollected) || 0,
      collectionCalls: Number(form.collectionCalls) || 0,
      highlights: form.highlights,
      challenges: form.challenges,
      submittedAt: new Date().toISOString(),
    };
    setReports(prev => [newReport, ...prev]);
    setForm(blankForm);
    setShowModal(false);
  };

  const filtered = reports.filter(r =>
    (filterBranch === "All" || r.branch === filterBranch) &&
    (filterDept === "All" || r.department === filterDept) &&
    (filterPeriod === "All" || r.period === filterPeriod)
  );

  return (
    <div>
      <TopBar title="Team Reports" />
      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: reports.length },
            { label: "Today", value: reports.filter(r => r.date === new Date().toISOString().split("T")[0]).length },
            { label: "This Week", value: reports.filter(r => r.period === "Weekly").length },
            { label: "This Month", value: reports.filter(r => r.period === "Monthly").length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters + Add button */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Branches</option>
              {branches.map(b => <option key={b}>{b}</option>)}
            </select>
            <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="All">All Periods</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Submit Report
          </button>
        </div>

        {/* Reports list */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Report ID</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Period</th>
                <th className="text-left px-4 py-3">Employee</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Key Highlights</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{r.id}</td>
                  <td className="px-4 py-3 text-gray-700">{r.date}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${periodColors[r.period]}`}>{r.period}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{r.employee}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{r.branch}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptColors[r.department]}`}>{r.department}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{r.highlights || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewReport(r)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800">
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No reports found</div>
          )}
        </div>
      </div>

      {/* ─── Submit Report Modal ─── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Submit Team Report</h2>
              <button onClick={() => { setShowModal(false); setForm(blankForm); }}
                className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-5">

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Report Date *</label>
                  <input type="date" value={form.date} onChange={set("date")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Report Period *</label>
                  <select value={form.period} onChange={set("period")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Employee Name *</label>
                  <select value={form.employee} onChange={set("employee")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— Select Employee —</option>
                    {employees.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Branch *</label>
                  <select value={form.branch} onChange={set("branch")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {branches.map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Department *</label>
                  <div className="flex gap-2 flex-wrap">
                    {departments.map(d => (
                      <button key={d} onClick={() => setForm(f => ({ ...f, department: d }))}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          form.department === d
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                        }`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Department-specific fields */}
              {form.department === "Sales / CRE" && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3">Sales Activity</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Leads Called / Contacted", field: "leadsCalled" },
                      { label: "Quotations Sent", field: "quotationsSent" },
                      { label: "Site Visits Done", field: "siteVisits" },
                      { label: "Orders Received", field: "ordersReceived" },
                      { label: "Follow-ups Done", field: "followUpsDone" },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input type="number" min="0" value={form[field as keyof typeof blankForm]}
                          onChange={set(field as keyof typeof blankForm)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {form.department === "Production" && (
                <div>
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-3">Production Activity</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Jobs Completed", field: "jobsCompleted" },
                      { label: "Jobs In Progress", field: "jobsInProgress" },
                      { label: "Jobs Pending", field: "jobsPending" },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input type="number" min="0" value={form[field as keyof typeof blankForm]}
                          onChange={set(field as keyof typeof blankForm)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Materials Consumed</label>
                    <input type="text" placeholder="e.g. Flex 500 sqft, ACP 3 sheets, Vinyl 200 sqft"
                      value={form.materialsConsumed} onChange={set("materialsConsumed")}
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              )}

              {form.department === "Accounts" && (
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3">Accounts Activity</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Invoices Raised", field: "invoicesRaised" },
                      { label: "Collection Calls Made", field: "collectionCalls" },
                    ].map(({ label, field }) => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                        <input type="number" min="0" value={form[field as keyof typeof blankForm]}
                          onChange={set(field as keyof typeof blankForm)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Amount Collected (₹)</label>
                      <input type="number" min="0" placeholder="0"
                        value={form.amountCollected} onChange={set("amountCollected")}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* HR / General shows no extra numeric fields — just highlights & challenges */}
              {form.department === "HR / General" && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 text-sm text-purple-700">
                  Please fill in the Highlights and Challenges fields below to describe your activity for the period.
                </div>
              )}

              {/* Common narrative fields */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Key Highlights / Achievements</label>
                  <textarea rows={2} placeholder="What went well? Any wins, completions, or notable events."
                    value={form.highlights} onChange={set("highlights")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Challenges / Issues / Support Needed</label>
                  <textarea rows={2} placeholder="Any problems, blockers, or requests for management support."
                    value={form.challenges} onChange={set("challenges")}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-5">
              <button onClick={() => { setShowModal(false); setForm(blankForm); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave}
                disabled={!form.employee || !form.date}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── View Report Modal ─── */}
      {viewReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">{viewReport.id} — {viewReport.employee}</h2>
                <p className="text-xs text-gray-500">{viewReport.date} · {viewReport.period} · {viewReport.branch} · {viewReport.department}</p>
              </div>
              <button onClick={() => setViewReport(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">

              {/* Sales metrics */}
              {viewReport.department === "Sales / CRE" && (
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Sales Activity</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Leads Called", viewReport.leadsCalled],
                      ["Quotations Sent", viewReport.quotationsSent],
                      ["Site Visits", viewReport.siteVisits],
                      ["Orders Received", viewReport.ordersReceived],
                      ["Follow-ups Done", viewReport.followUpsDone],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-blue-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-blue-700">{val}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production metrics */}
              {viewReport.department === "Production" && (
                <div>
                  <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide mb-2">Production Activity</p>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      ["Completed", viewReport.jobsCompleted],
                      ["In Progress", viewReport.jobsInProgress],
                      ["Pending", viewReport.jobsPending],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-yellow-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-yellow-700">{val}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                  {viewReport.materialsConsumed && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Materials Consumed</p>
                      <p className="text-sm text-gray-800">{viewReport.materialsConsumed}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Accounts metrics */}
              {viewReport.department === "Accounts" && (
                <div>
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Accounts Activity</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ["Invoices Raised", viewReport.invoicesRaised],
                      ["Collection Calls", viewReport.collectionCalls],
                    ].map(([label, val]) => (
                      <div key={label as string} className="bg-green-50 rounded-lg p-3 text-center">
                        <p className="text-2xl font-bold text-green-700">{val}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-green-700">{fmt(viewReport.amountCollected)}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Amount Collected</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Highlights & Challenges */}
              {viewReport.highlights && (
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-700 mb-1">✓ Key Highlights</p>
                  <p className="text-sm text-gray-800">{viewReport.highlights}</p>
                </div>
              )}
              {viewReport.challenges && (
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-orange-700 mb-1">⚠ Challenges / Issues</p>
                  <p className="text-sm text-gray-800">{viewReport.challenges}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 text-right">
                Submitted: {new Date(viewReport.submittedAt).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
