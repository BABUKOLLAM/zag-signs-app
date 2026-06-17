"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";

// ─── BRD Section 10 — KPI Management System ───────────────────────────────────

type Role = "CRES" | "Sales Executive" | "Business Manager" | "AVP";
type Period = "June 2026" | "May 2026" | "Q2 2026";

interface KPI {
  name: string;
  target: number | string;
  actual: number | string;
  unit: string;
  pct: number;
  status: "On Track" | "At Risk" | "Behind";
}

interface EmployeeKPI {
  name: string;
  role: Role;
  branch: string;
  kpis: KPI[];
}

const kpiData: Record<Role, Record<Period, EmployeeKPI[]>> = {
  "CRES": {
    "June 2026": [
      {
        name: "Arun Kumar", role: "CRES", branch: "TVM", kpis: [
          { name: "Calls per Day (avg)", target: 15, actual: 12, unit: "calls/day", pct: 80, status: "At Risk" },
          { name: "Appointments Fixed", target: 20, actual: 18, unit: "appts", pct: 90, status: "On Track" },
          { name: "Lead Conversion %", target: 30, actual: 28, unit: "%", pct: 93, status: "On Track" },
          { name: "New Leads Added", target: 25, actual: 22, unit: "leads", pct: 88, status: "On Track" },
        ]
      },
      {
        name: "Salman Khan", role: "CRES", branch: "CLT", kpis: [
          { name: "Calls per Day (avg)", target: 15, actual: 10, unit: "calls/day", pct: 67, status: "Behind" },
          { name: "Appointments Fixed", target: 20, actual: 14, unit: "appts", pct: 70, status: "At Risk" },
          { name: "Lead Conversion %", target: 30, actual: 22, unit: "%", pct: 73, status: "At Risk" },
          { name: "New Leads Added", target: 25, actual: 16, unit: "leads", pct: 64, status: "Behind" },
        ]
      },
    ],
    "May 2026": [
      {
        name: "Arun Kumar", role: "CRES", branch: "TVM", kpis: [
          { name: "Calls per Day (avg)", target: 15, actual: 14, unit: "calls/day", pct: 93, status: "On Track" },
          { name: "Appointments Fixed", target: 20, actual: 19, unit: "appts", pct: 95, status: "On Track" },
          { name: "Lead Conversion %", target: 30, actual: 31, unit: "%", pct: 103, status: "On Track" },
          { name: "New Leads Added", target: 25, actual: 24, unit: "leads", pct: 96, status: "On Track" },
        ]
      },
    ],
    "Q2 2026": [],
  },
  "Sales Executive": {
    "June 2026": [
      {
        name: "Vijay CRE", role: "Sales Executive", branch: "EKM", kpis: [
          { name: "Customer Visits", target: 80, actual: 72, unit: "visits", pct: 90, status: "On Track" },
          { name: "Revenue Target", target: 1200000, actual: 980000, unit: "₹", pct: 82, status: "At Risk" },
          { name: "Collection %", target: 85, actual: 91, unit: "%", pct: 107, status: "On Track" },
          { name: "New Customers Acquired", target: 5, actual: 4, unit: "customers", pct: 80, status: "At Risk" },
        ]
      },
      {
        name: "Renu Thomas", role: "Sales Executive", branch: "KTYM", kpis: [
          { name: "Customer Visits", target: 80, actual: 55, unit: "visits", pct: 69, status: "Behind" },
          { name: "Revenue Target", target: 900000, actual: 640000, unit: "₹", pct: 71, status: "Behind" },
          { name: "Collection %", target: 85, actual: 78, unit: "%", pct: 92, status: "On Track" },
          { name: "New Customers Acquired", target: 5, actual: 2, unit: "customers", pct: 40, status: "Behind" },
        ]
      },
    ],
    "May 2026": [],
    "Q2 2026": [],
  },
  "Business Manager": {
    "June 2026": [
      {
        name: "Branch Manager TVM", role: "Business Manager", branch: "TVM", kpis: [
          { name: "Team Revenue Achievement", target: 2500000, actual: 2100000, unit: "₹", pct: 84, status: "At Risk" },
          { name: "Pipeline Value", target: 5000000, actual: 4850000, unit: "₹", pct: 97, status: "On Track" },
          { name: "Team Productivity Score", target: 85, actual: 78, unit: "%", pct: 92, status: "On Track" },
          { name: "Customer Complaints Resolved", target: 95, actual: 88, unit: "%", pct: 93, status: "On Track" },
        ]
      },
    ],
    "May 2026": [],
    "Q2 2026": [],
  },
  "AVP": {
    "June 2026": [
      {
        name: "AVP — South Kerala", role: "AVP", branch: "All", kpis: [
          { name: "Regional Revenue", target: 8000000, actual: 6840000, unit: "₹", pct: 86, status: "At Risk" },
          { name: "Gross Margin %", target: 30, actual: 29.5, unit: "%", pct: 98, status: "On Track" },
          { name: "Branch Target Achievement", target: 90, actual: 82, unit: "%", pct: 91, status: "On Track" },
          { name: "Collection Efficiency", target: 88, actual: 85, unit: "%", pct: 97, status: "On Track" },
        ]
      },
    ],
    "May 2026": [],
    "Q2 2026": [],
  },
};

const roles: Role[] = ["CRES", "Sales Executive", "Business Manager", "AVP"];
const periods: Period[] = ["June 2026", "May 2026", "Q2 2026"];

const statusColor = { "On Track": "bg-green-100 text-green-700", "At Risk": "bg-yellow-100 text-yellow-700", "Behind": "bg-red-100 text-red-700" };
const barColor = { "On Track": "bg-green-500", "At Risk": "bg-yellow-500", "Behind": "bg-red-500" };

export default function KPIPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("CRES");
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("June 2026");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("All");

  const employees = kpiData[selectedRole][selectedPeriod] ?? [];
  const filtered = selectedEmployee === "All" ? employees : employees.filter(e => e.name === selectedEmployee);

  const allKPIs = employees.flatMap(e => e.kpis);
  const onTrack = allKPIs.filter(k => k.status === "On Track").length;
  const atRisk = allKPIs.filter(k => k.status === "At Risk").length;
  const behind = allKPIs.filter(k => k.status === "Behind").length;
  const avgPct = allKPIs.length ? Math.round(allKPIs.reduce((s, k) => s + k.pct, 0) / allKPIs.length) : 0;

  return (
    <div>
      <TopBar title="KPI Dashboard" />
      <div className="p-6 space-y-5">

        {/* Role + Period selectors */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {roles.map(r => (
              <button key={r} onClick={() => { setSelectedRole(r); setSelectedEmployee("All"); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedRole === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {r}
              </button>
            ))}
          </div>
          <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value as Period)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
          {employees.length > 0 && (
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="All">All Employees</option>
              {employees.map(e => <option key={e.name}>{e.name}</option>)}
            </select>
          )}
        </div>

        {/* Summary stats */}
        {allKPIs.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Avg Achievement", value: `${avgPct}%`, color: avgPct >= 90 ? "text-green-600" : avgPct >= 70 ? "text-yellow-600" : "text-red-600" },
              { label: "On Track", value: onTrack, color: "text-green-600" },
              { label: "At Risk", value: atRisk, color: "text-yellow-600" },
              { label: "Behind Target", value: behind, color: "text-red-600" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* KPI Cards per employee */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-sm text-gray-400">
            No KPI data for this selection
          </div>
        ) : (
          <div className="space-y-5">
            {filtered.map(emp => (
              <div key={emp.name} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.role} · {emp.branch} · {selectedPeriod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(emp.kpis.reduce((s, k) => s + k.pct, 0) / emp.kpis.length)}%
                    </p>
                    <p className="text-xs text-gray-500">Overall Achievement</p>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {emp.kpis.map(kpi => (
                    <div key={kpi.name} className="px-5 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">{kpi.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {kpi.unit === "₹" ? `${fmt(kpi.actual as number)} / ${fmt(kpi.target as number)}` : `${kpi.actual} / ${kpi.target} ${kpi.unit}`}
                          </span>
                          <span className={`text-xs font-bold ${kpi.pct >= 100 ? "text-green-600" : kpi.pct >= 80 ? "text-yellow-600" : "text-red-600"}`}>{kpi.pct}%</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[kpi.status]}`}>{kpi.status}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barColor[kpi.status]}`}
                          style={{ width: `${Math.min(100, kpi.pct)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center">KPI framework per BRD Section 10 · Data updates as team reports are submitted</p>
      </div>
    </div>
  );
}
