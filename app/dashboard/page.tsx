"use client";
import { ComponentType } from "react";
import TopBar from "@/components/TopBar";
import { dashboardStats } from "@/lib/data";
import { fmtShort, fmt } from "@/lib/utils";
import { TrendingUp, Users, ShoppingCart, Wallet, AlertCircle, Target, ArrowUpRight, ArrowDownRight, Building2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend, Area, AreaChart,
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  sub: string;
  trend?: string;
  trendUp?: boolean;
  icon: ComponentType<{ size?: number; className?: string }>;
  gradient: string;
}

function StatCard({ title, value, sub, trend, trendUp, icon: Icon, gradient }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all group card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${gradient}`}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
          }`}>
            {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs font-medium text-slate-500 mt-1">{title}</p>
      <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string; stroke: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.stroke }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-900">₹{(p.value / 100000).toFixed(2)}L</span>
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const s = dashboardStats;
  const collPct = Math.round((s.collectionAchieved / s.collectionTarget) * 100);
  const maxFunnelCount = Math.max(...s.leadFunnel.map(f => f.count), 1);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="Executive Dashboard" subtitle="ZAG SIGNS ERP" />

      <div className="p-6 space-y-6">

        {/* Welcome banner */}
        <div className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #6366F1 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
          <div className="relative">
            <p className="text-indigo-200 text-sm font-medium">{today}</p>
            <h2 className="text-white text-xl font-bold mt-0.5">Good day, Admin</h2>
            <p className="text-indigo-200 text-sm mt-1">You have <span className="text-white font-semibold">3 follow-ups</span> and <span className="text-white font-semibold">2 approvals</span> pending today.</p>
          </div>
          <div className="relative flex items-center gap-3">
            {[
              { label: "YTD Revenue", value: "₹1.26Cr" },
              { label: "Active Leads", value: "48" },
              { label: "Open Orders", value: "18" },
            ].map(item => (
              <div key={item.label} className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 text-center hidden lg:block">
                <p className="text-white font-bold text-lg">{item.value}</p>
                <p className="text-indigo-200 text-xs">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Leads" value={s.totalLeads} sub={`+${s.newLeadsThisMonth} this month`} trend="+14%" trendUp={true} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
          <StatCard title="Pipeline Value" value={fmtShort(s.pipelineValue)} sub="Weighted forecast" trend="+8%" trendUp={true} icon={TrendingUp} gradient="bg-gradient-to-br from-violet-500 to-purple-600" />
          <StatCard title="Orders / Month" value={s.ordersThisMonth} sub="June 2026" trend="+5%" trendUp={true} icon={ShoppingCart} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard title="Revenue MTD" value={fmtShort(s.revenueThisMonth)} sub="vs ₹2.3L last month" trend="+4%" trendUp={true} icon={Wallet} gradient="bg-gradient-to-br from-indigo-500 to-blue-600" />
          <StatCard title="Collection" value={`${collPct}%`} sub={`${fmtShort(s.collectionAchieved)} of ${fmtShort(s.collectionTarget)}`} trend="-3%" trendUp={false} icon={Target} gradient="bg-gradient-to-br from-amber-500 to-orange-500" />
          <StatCard title="Complaints" value={s.openComplaints} sub="Pending resolution" icon={AlertCircle} gradient="bg-gradient-to-br from-red-500 to-rose-600" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Revenue vs Target */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Revenue vs Target</h3>
                <p className="text-xs text-slate-400 mt-0.5">Jan – Jun 2026</p>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">Monthly</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={s.monthlyRevenue}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" dot={{ r: 3, fill: "#4F46E5" }} />
                <Line type="monotone" dataKey="target" stroke="#E2E8F0" strokeWidth={2} strokeDasharray="5 5" name="Target" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Branch performance */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Branch Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">June 2026 Revenue</p>
              </div>
              <Building2 size={16} className="text-slate-300" />
            </div>
            <div className="space-y-3">
              {s.branchPerformance
                .sort((a, b) => b.revenue - a.revenue)
                .map((b, i) => {
                  const max = Math.max(...s.branchPerformance.map(x => x.revenue));
                  const pct = Math.round((b.revenue / max) * 100);
                  const colors = ["from-indigo-500 to-violet-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-blue-500 to-cyan-500"];
                  return (
                    <div key={b.branch}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold w-5 h-5 rounded flex items-center justify-center text-white bg-gradient-to-br ${colors[i]}`}>{i + 1}</span>
                          <span className="text-sm font-semibold text-slate-800">{b.branch}</span>
                          <span className="text-xs text-slate-400">{b.orders} orders</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{fmtShort(b.revenue)}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${colors[i]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Lead Funnel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Sales Funnel</h3>
                <p className="text-xs text-slate-400 mt-0.5">Active pipeline by stage</p>
              </div>
              <span className="text-xs text-slate-400">{s.leadFunnel.reduce((s, f) => s + f.count, 0)} active leads</span>
            </div>
            <div className="space-y-2.5">
              {s.leadFunnel.map((f, i) => {
                const colors = ["bg-indigo-500", "bg-violet-500", "bg-blue-500", "bg-cyan-500", "bg-teal-500", "bg-emerald-500"];
                return (
                  <div key={f.stage} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-24 flex-shrink-0 font-medium">{f.stage}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full rounded-full flex items-center justify-end pr-2.5 ${colors[i]}`}
                        style={{ width: `${Math.max(8, Math.min(100, (f.count / maxFunnelCount) * 100))}%` }}
                      >
                        <span className="text-white text-xs font-bold">{f.count}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 w-16 text-right">{fmtShort(f.value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection tracker */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Collection Tracker</h3>
                <p className="text-xs text-slate-400 mt-0.5">June 2026 target progress</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${collPct >= 90 ? "bg-emerald-50 text-emerald-700" : collPct >= 70 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>{collPct}%</span>
            </div>

            {/* Big progress ring */}
            <div className="flex items-center gap-6 mb-5">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="40" cy="40" r="32" fill="none"
                    stroke={collPct >= 90 ? "#10B981" : collPct >= 70 ? "#F59E0B" : "#EF4444"}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(collPct / 100) * 201} 201`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-slate-900">{collPct}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Target</p>
                  <p className="text-lg font-bold text-slate-900">{fmt(s.collectionTarget)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Collected</p>
                  <p className="text-lg font-bold text-emerald-600">{fmt(s.collectionAchieved)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Remaining</p>
                  <p className="text-sm font-semibold text-amber-600">{fmt(s.collectionTarget - s.collectionAchieved)}</p>
                </div>
              </div>
            </div>

            {/* Branch breakdown */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">BRANCH BREAKDOWN</p>
              {s.branchPerformance.map(b => (
                <div key={b.branch} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{b.branch}</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-semibold text-slate-700">{b.orders} orders</span>
                  <span className="font-semibold text-indigo-600">{fmtShort(b.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
