"use client";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt, fmtShort } from "@/lib/utils";
import { RefreshCw, Sparkles, TrendingUp, AlertTriangle, Users, ShoppingCart, MessageSquare, Ticket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type LeadPriority = { id: string; name: string; company: string; stage: string; score: number; estimatedValue: number; daysSinceUpdate: number; branch: string };
type ChurnRisk = { id: string; customer: string; company: string; risk: string; riskPct: number; daysSince: number; branch: string };
type BranchPerf = { branch: string; revenue: number; orders: number; leads: number };
type RevTrend = { week: string; revenue: number };
type Summary = { totalLeads: number; openOrders: number; openComplaints: number; openTickets: number };
type Insights = { leadPriority: LeadPriority[]; churnRisk: ChurnRisk[]; branchPerf: BranchPerf[]; revenueTrend: RevTrend[]; summary: Summary };

const BRANCH_COLORS = ["#4F46E5", "#7C3AED", "#0EA5E9", "#10B981"];
const RISK_COLOR: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-20">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg text-white ${color}`}>{score}</span>
    </div>
  );
}

export default function AIInsightsPage() {
  const { data, loading, refetch } = useApi<Insights>("/ai-insights");

  const summary = data?.summary ?? { totalLeads: 0, openOrders: 0, openComplaints: 0, openTickets: 0 };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="AI Insights" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-5">

        {/* Hero */}
        <div className="rounded-3xl p-5 flex items-center gap-5"
          style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)" }}>
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Sparkles size={28} className="text-yellow-300" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">AI-Powered Business Insights</h2>
            <p className="text-indigo-200 text-sm mt-0.5">Live analysis from your database — lead scores, churn risks, branch performance</p>
          </div>
          <button onClick={refetch} className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Leads",  value: summary.totalLeads,     bg: "bg-blue-50",   text: "text-blue-600",   icon: <Users size={16} /> },
            { label: "Open Orders",   value: summary.openOrders,     bg: "bg-indigo-50", text: "text-indigo-600", icon: <ShoppingCart size={16} /> },
            { label: "Complaints",    value: summary.openComplaints, bg: "bg-red-50",    text: "text-red-600",   icon: <MessageSquare size={16} /> },
            { label: "WO Tickets",    value: summary.openTickets,    bg: "bg-amber-50",  text: "text-amber-600", icon: <Ticket size={16} /> },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3 items-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}>{c.icon}</div>
              <div>
                <p className="text-xs text-slate-500">{c.label}</p>
                <p className={`text-xl font-bold ${c.text}`}>{loading ? "…" : c.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Lead Priority */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700">Lead Priority Score</h3>
              <span className="text-xs text-slate-400 ml-auto">Ranked by AI score</span>
            </div>
            {loading && <p className="text-center py-8 text-slate-400 text-sm">Analysing leads…</p>}
            {!loading && (data?.leadPriority ?? []).length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">No open leads found</p>
            )}
            {(data?.leadPriority ?? []).map((l, i) => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50">
                <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{l.name}</p>
                  <p className="text-xs text-slate-400">{l.company} · {l.stage} · {l.branch}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs font-bold text-slate-700">{fmtShort(l.estimatedValue)}</p>
                  <ScoreBadge score={l.score} />
                </div>
              </div>
            ))}
          </div>

          {/* Churn Risk */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500" />
              <h3 className="text-sm font-bold text-slate-700">Churn Risk Customers</h3>
              <span className="text-xs text-slate-400 ml-auto">No order 90+ days</span>
            </div>
            {loading && <p className="text-center py-8 text-slate-400 text-sm">Checking customer activity…</p>}
            {!loading && (data?.churnRisk ?? []).length === 0 && (
              <p className="text-center py-8 text-emerald-600 text-sm font-semibold">All customers are active</p>
            )}
            {(data?.churnRisk ?? []).map(c => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 hover:bg-slate-50/50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">{c.customer}</p>
                  <p className="text-xs text-slate-400">{c.company || c.branch} · {c.daysSince}d since last order</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${RISK_COLOR[c.risk] ?? "bg-slate-100 text-slate-600"}`}>{c.risk} Risk</span>
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-slate-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-red-400" style={{ width: `${c.riskPct}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{c.riskPct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-700">Branch Revenue This Month</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data?.branchPerf ?? []} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="branch" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Bar dataKey="revenue" name="Revenue" radius={[8, 8, 0, 0]}>
                  {(data?.branchPerf ?? []).map((_, i) => <Cell key={i} fill={BRANCH_COLORS[i % BRANCH_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={14} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-700">Revenue Trend (Last 30 Days)</h3>
            </div>
            {!loading && (data?.revenueTrend ?? []).length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">No invoice data in the last 30 days</p>
            )}
            {(data?.revenueTrend ?? []).length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data?.revenueTrend ?? []} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => fmt(Number(v))} />
                  <Bar dataKey="revenue" name="Revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Branch summary cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Users size={14} className="text-blue-500" />
            <h3 className="text-sm font-bold text-slate-700">Leads & Orders by Branch — This Month</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {(data?.branchPerf ?? []).map((b, i) => (
              <div key={b.branch} className="rounded-2xl p-4 border"
                style={{ background: `${BRANCH_COLORS[i]}10`, borderColor: `${BRANCH_COLORS[i]}30` }}>
                <p className="text-sm font-black" style={{ color: BRANCH_COLORS[i] }}>{b.branch}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Leads</span><span className="font-bold text-slate-800">{b.leads}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Orders</span><span className="font-bold text-slate-800">{b.orders}</span></div>
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Revenue</span><span className="font-bold text-slate-800">{fmt(b.revenue)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
