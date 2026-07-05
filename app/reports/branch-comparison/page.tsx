"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt } from "@/lib/utils";
import { RefreshCw, Trophy } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, Legend, Cell,
} from "recharts";

const BRANCHES = ["TVM", "KTYM", "EKM", "CLT"];
const BRANCH_LABELS: Record<string, string> = {
  TVM: "Thiruvananthapuram", KTYM: "Kottayam", EKM: "Ernakulam", CLT: "Calicut",
};
const COLORS = ["#4F46E5", "#7C3AED", "#0EA5E9", "#10B981"];
const STATUS_COLORS = ["bg-yellow-400", "bg-slate-300", "bg-slate-200", "bg-slate-100"];

type BranchStats = {
  branch: string;
  revenue: number; invoiced: number; leads: number;
  quotations: number; customers: number; tickets: number;
};

type BranchCompareData = { branches: BranchStats[]; topBranch: string; };

export default function BranchComparisonPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, loading, refetch } = useApi<BranchCompareData>(
    `/reports/branch-comparison?from=${from}&to=${to}`
  );

  const branches: BranchStats[] = data?.branches ?? BRANCHES.map(b => ({
    branch: b, revenue: 0, invoiced: 0, leads: 0, quotations: 0, customers: 0, tickets: 0,
  }));

  // Rank branches by revenue
  const ranked = [...branches].sort((a, b) => b.revenue - a.revenue);

  const radarData = ["Revenue", "Invoiced", "Leads", "Quotations", "Customers", "Tickets"].map(metric => {
    const key = metric.toLowerCase() as keyof BranchStats;
    const row: Record<string, any> = { metric };
    const max = Math.max(...branches.map(b => Number(b[key]) || 0), 1);
    BRANCHES.forEach(br => {
      const b = branches.find(x => x.branch === br);
      row[br] = b ? Math.round((Number(b[key] ?? 0) / max) * 100) : 0;
    });
    return row;
  });

  const METRICS = [
    { label: "Revenue Collected",  key: "revenue",    format: fmt },
    { label: "Total Invoiced",     key: "invoiced",   format: fmt },
    { label: "New Leads",          key: "leads",      format: (v: number) => String(v) },
    { label: "Quotations",         key: "quotations", format: (v: number) => String(v) },
    { label: "New Customers",      key: "customers",  format: (v: number) => String(v) },
    { label: "Work Order Tickets", key: "tickets",    format: (v: number) => String(v) },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen" style={{ background: "var(--bg-base)" }}>
      <TopBar title="Branch Comparison" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* ── Date filter ──────────────────────────────────────────────── */}
        <div className="flex gap-3 flex-wrap items-center rounded-2xl border p-4 shadow-sm"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="px-3 py-2 rounded-xl border text-sm"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }} />
          </div>
          {[
            { label: "This Month", fn: () => { const n = new Date(); setFrom(new Date(n.getFullYear(), n.getMonth(), 1).toISOString().slice(0,10)); setTo(n.toISOString().slice(0,10)); } },
            { label: "Last Month", fn: () => { const n = new Date(); const m = n.getMonth() - 1; const y = m < 0 ? n.getFullYear()-1 : n.getFullYear(); const mo = ((m+12)%12); setFrom(new Date(y,mo,1).toISOString().slice(0,10)); setTo(new Date(y,mo+1,0).toISOString().slice(0,10)); } },
            { label: "Last 3M",    fn: () => { const d = new Date(); d.setMonth(d.getMonth()-3); setFrom(d.toISOString().slice(0,10)); setTo(new Date().toISOString().slice(0,10)); } },
          ].map(q => (
            <button key={q.label} onClick={q.fn}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ background: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-secondary)" }}>
              {q.label}
            </button>
          ))}
          <button onClick={refetch} className="p-2 rounded-xl border ml-auto"
            style={{ borderColor: "var(--input-border)", background: "var(--input-bg)" }}>
            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-400" : "text-slate-400"} />
          </button>
        </div>

        {/* ── Ranking podium ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ranked.map((b, i) => (
            <div key={b.branch} className="rounded-2xl p-4 shadow-sm relative overflow-hidden"
              style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <div className={`absolute top-0 left-0 w-1 h-full rounded-l-2xl ${STATUS_COLORS[i]}`} />
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-black text-2xl" style={{ color: COLORS[i] }}>{b.branch}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{BRANCH_LABELS[b.branch]}</p>
                </div>
                {i === 0 && <Trophy size={20} className="text-yellow-400" />}
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: i === 0 ? "#FEF9C3" : "var(--input-bg)", color: i === 0 ? "#B45309" : "var(--text-secondary)" }}>
                  #{i + 1}
                </span>
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{fmt(b.revenue)}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Revenue collected</p>
              <div className="mt-2 flex gap-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>{b.leads} leads</span>
                <span>{b.quotations} quotes</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── KPI comparison table ─────────────────────────────────────── */}
        <div className="rounded-2xl border shadow-sm overflow-hidden"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: "var(--card-border)" }}>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Key Metrics by Branch</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b" style={{ background: "var(--input-bg)", borderColor: "var(--card-border)" }}>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Metric</th>
                  {BRANCHES.map((b, i) => (
                    <th key={b} className="px-4 py-3 text-center text-xs font-bold uppercase" style={{ color: COLORS[i] }}>{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map(row => {
                  const vals = BRANCHES.map(b => Number(branches.find(x => x.branch === b)?.[row.key as keyof BranchStats] ?? 0));
                  const max = Math.max(...vals, 1);
                  return (
                    <tr key={row.label} className="border-b" style={{ borderColor: "var(--card-border)" }}>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>{row.label}</td>
                      {vals.map((v, i) => (
                        <td key={BRANCHES[i]} className="px-4 py-3 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`text-sm font-bold ${v === max && max > 0 ? "text-indigo-600" : ""}`}
                              style={v === max && max > 0 ? {} : { color: "var(--text-primary)" }}>
                              {row.format(v)}
                            </span>
                            <div className="w-full rounded-full h-1.5 max-w-[60px]" style={{ background: "var(--input-bg)" }}>
                              <div className="h-1.5 rounded-full transition-all"
                                style={{ width: `${(v / max) * 100}%`, background: COLORS[i] }} />
                            </div>
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Charts row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Revenue vs Invoiced bar */}
          <div className="rounded-2xl border p-5 shadow-sm"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Revenue vs Invoiced</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Collected vs billed for the period</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branches} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                <YAxis tickFormatter={(v: number) => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend />
                <Bar dataKey="invoiced" name="Invoiced" fill="#e0e7ff" radius={[6,6,0,0]}>
                  {branches.map((_,i) => <Cell key={i} fill={`${COLORS[i]}33`} />)}
                </Bar>
                <Bar dataKey="revenue" name="Collected" radius={[6,6,0,0]}>
                  {branches.map((_,i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leads + Quotations */}
          <div className="rounded-2xl border p-5 shadow-sm"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Leads & Quotations</h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Pipeline activity per branch</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branches} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="branch" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Legend />
                <Bar dataKey="leads" name="Leads" fill="#4F46E5" radius={[6,6,0,0]} />
                <Bar dataKey="quotations" name="Quotations" fill="#10B981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Radar — indexed performance ──────────────────────────────── */}
        <div className="rounded-2xl border p-5 shadow-sm"
          style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
          <h3 className="text-sm font-bold mb-1" style={{ color: "var(--text-primary)" }}>Performance Radar</h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Indexed scores — 100 = best branch for each metric in this period</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--card-border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
              {BRANCHES.map((b, i) => (
                <Radar key={b} name={b} dataKey={b}
                  stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} strokeWidth={2} />
              ))}
              <Legend />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}
