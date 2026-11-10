"use client";
import { useState, Suspense } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt } from "@/lib/utils";
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";

type Job = {
  id: string; orderNo: string; customer: string; company: string;
  revenueQuoted: number; revenueActual: number; totalCost: number;
  grossProfit: number; grossMarginPct: number;
  costBreakdown: Record<string, number>;
};
type BranchRevenue = { branch: string; _sum: { totalAmount: number } };
type Summary = { totalRevenue: number; totalCost: number; totalProfit: number; avgMarginPct: number };
type ProfitabilityData = { jobs: Job[]; branchRevenue: BranchRevenue[]; branchCollections: any[]; summary: Summary };

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
const BRANCH_COLORS = ["#4F46E5", "#7C3AED", "#0EA5E9", "#10B981"];

function ProfitabilityPageInner() {
  const [branch, setBranch] = useState("");
  const dr = useDateRangeQuery();
  const from = dr.range?.from ?? "";
  const to = dr.range?.to ?? "";

  const params = new URLSearchParams();
  if (branch) params.set("branch", branch);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString() ? `?${params}` : "";

  const { data, loading, refetch } = useApi<ProfitabilityData>(`/reports/profitability${query}`);

  const jobs = data?.jobs ?? [];
  const summary = data?.summary ?? { totalRevenue: 0, totalCost: 0, totalProfit: 0, avgMarginPct: 0 };

  const branchChartData = (data?.branchRevenue ?? []).map((b: any) => ({
    branch: b.branch,
    revenue: b._sum?.totalAmount ?? 0,
    collections: (data?.branchCollections ?? []).find((c: any) => c.branch === b.branch)?._sum?.amount ?? 0,
  }));

  const topJobs = [...jobs].sort((a, b) => b.grossProfit - a.grossProfit).slice(0, 10);
  const lowMargin = [...jobs].filter(j => j.grossMarginPct < 15).sort((a, b) => a.grossMarginPct - b.grossMarginPct).slice(0, 5);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="Profitability Reports" />
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Filters */}
        <div className="flex gap-3 flex-wrap items-center bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <select value={branch} onChange={e => setBranch(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
            <option value="">All Branches</option>
            {BRANCHES.map(b => <option key={b}>{b}</option>)}
          </select>
          <DateRangeFilter value={dr.range} onChange={dr.setRange} urlError={dr.urlError}
            basisLabel="Job-cost / invoice / collection date" />
          <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50">
            <RefreshCw size={14} className={loading ? "animate-spin text-slate-400" : "text-slate-400"} />
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: fmt(summary.totalRevenue), color: "indigo", icon: <DollarSign size={16} />, sub: "actual billed" },
            { label: "Total Cost", value: fmt(summary.totalCost), color: "amber", icon: <BarChart2 size={16} />, sub: "direct job costs" },
            { label: "Gross Profit", value: fmt(summary.totalProfit), color: summary.totalProfit >= 0 ? "emerald" : "red", icon: summary.totalProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, sub: "revenue − cost" },
            { label: "Avg Margin %", value: `${summary.avgMarginPct.toFixed(1)}%`, color: summary.avgMarginPct >= 20 ? "emerald" : summary.avgMarginPct >= 10 ? "amber" : "red", icon: <TrendingUp size={16} />, sub: "across all jobs" },
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

        {/* Branch Revenue Chart */}
        {branchChartData.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-4">Revenue vs Collections by Branch</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={branchChartData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
                  {branchChartData.map((_: any, i: number) => <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />)}
                </Bar>
                <Bar dataKey="collections" name="Collections" radius={[6, 6, 0, 0]} fill="#10B981" opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Jobs by Profit */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-700">Top Jobs by Gross Profit</h3>
            </div>
            {loading && <p className="text-center py-8 text-slate-400">Loading…</p>}
            {!loading && jobs.length === 0 && <p className="text-center py-8 text-slate-400">No job cost data. Enter job costs first.</p>}
            {topJobs.map((j, i) => (
              <div key={j.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{j.customer ?? j.orderNo}</p>
                  <p className="text-xs text-slate-400">{j.orderNo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">{fmt(j.grossProfit)}</p>
                  <p className={`text-xs font-semibold ${j.grossMarginPct >= 20 ? "text-emerald-500" : j.grossMarginPct >= 10 ? "text-amber-500" : "text-red-500"}`}>{j.grossMarginPct}%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Low Margin Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-700">Low Margin Jobs</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">below 15%</span>
            </div>
            {!loading && lowMargin.length === 0 && <p className="text-center py-8 text-slate-400 text-sm">All jobs above 15% margin</p>}
            {lowMargin.map(j => (
              <div key={j.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-red-50/30">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{j.customer ?? j.orderNo}</p>
                  <p className="text-xs text-slate-400">{j.orderNo}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${j.grossProfit >= 0 ? "text-amber-600" : "text-red-600"}`}>{fmt(j.grossProfit)}</p>
                  <p className="text-xs font-bold text-red-500">{j.grossMarginPct}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Job Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">All Jobs — Cost vs Revenue</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Order No", "Customer", "Revenue (Quoted)", "Revenue (Actual)", "Total Cost", "Gross Profit", "Margin %"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {loading && <tr><td colSpan={7} className="text-center py-10 text-slate-400">Loading…</td></tr>}
                {!loading && jobs.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">No data yet — add job costs to see reports</td></tr>}
                {jobs.map(j => (
                  <tr key={j.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-xs text-indigo-600">{j.orderNo}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">{j.customer}</td>
                    <td className="px-4 py-3 text-xs">{fmt(j.revenueQuoted)}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{fmt(j.revenueActual > 0 ? j.revenueActual : j.revenueQuoted)}</td>
                    <td className="px-4 py-3 text-xs text-amber-700">{fmt(j.totalCost)}</td>
                    <td className="px-4 py-3 text-xs font-bold">
                      <span className={j.grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}>{fmt(j.grossProfit)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${j.grossMarginPct >= 20 ? "bg-emerald-100 text-emerald-700" : j.grossMarginPct >= 10 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                        {j.grossMarginPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function ProfitabilityPage() {
  return (
    <Suspense fallback={null}>
      <ProfitabilityPageInner />
    </Suspense>
  );
}
