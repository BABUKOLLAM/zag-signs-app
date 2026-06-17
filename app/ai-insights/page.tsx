"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { fmtShort } from "@/lib/utils";
import { Sparkles, TrendingUp, AlertTriangle, Users, Target, RefreshCw, ChevronRight, Star } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

// BRD Phase 4 — AI Insights (frontend simulation; backend ML required for live data)

interface LeadPriority {
  name: string;
  company: string;
  score: number;
  reason: string;
  stage: string;
  estimatedValue: number;
  nextAction: string;
}

interface ChurnRisk {
  customer: string;
  risk: "High" | "Medium" | "Low";
  riskPct: number;
  daysSinceOrder: number;
  reason: string;
}

interface TopPerformer {
  name: string; role: string; branch: string;
  revenueAchieved: number; target: number; visits: number; conversionPct: number;
}

const leads: LeadPriority[] = [
  { name: "Rajesh Menon", company: "Lulu Hypermarket", score: 94, reason: "High engagement: 3 site visits, responded to follow-up. Budget confirmed ₹8L.", stage: "Negotiation", estimatedValue: 800000, nextAction: "Schedule closing meeting" },
  { name: "Anitha Nair", company: "Aster Medcity", score: 89, reason: "Hospital expansion phase active. Similar to 2 past wins.", stage: "Proposal Sent", estimatedValue: 550000, nextAction: "Call within 24 hrs — budget approval pending" },
  { name: "Suresh PV", company: "KSRTC (Ernakulam)", score: 81, reason: "Government order. Annual tender aligned with our bid. Low competition.", stage: "Verbal Commitment", estimatedValue: 1200000, nextAction: "Submit compliance documents" },
  { name: "Fathima Beebi", company: "Gold Souk Mall CLT", score: 76, reason: "Mall expansion underway. 4 competitor quotes submitted. Time-sensitive.", stage: "Qualification", estimatedValue: 480000, nextAction: "Visit site and submit better design" },
  { name: "Thomas Joseph", company: "Federal Bank HO", score: 71, reason: "Renewal cycle — previous order 14 months ago. Procurement window opening.", stage: "Proposal Sent", estimatedValue: 320000, nextAction: "Reference previous order in follow-up" },
];

const churnRisks: ChurnRisk[] = [
  { customer: "Malabar Gold EKM", risk: "High", riskPct: 78, daysSinceOrder: 210, reason: "No order in 7 months. Competitor quoted lower last month. Service complaint unresolved." },
  { customer: "Rasheed Motors TVM", risk: "High", riskPct: 71, daysSinceOrder: 180, reason: "Outstanding payment ₹85K overdue 60 days. Communication gap since March." },
  { customer: "SBI Regional HO", risk: "Medium", riskPct: 48, daysSinceOrder: 120, reason: "Long payment cycles. 2 pending quotations not converted. Key contact changed." },
  { customer: "Jayalakshmi Textiles", risk: "Medium", riskPct: 43, daysSinceOrder: 95, reason: "Seasonal buyer. No order placed this season yet vs last year's 2 orders." },
  { customer: "Alphons Constructions", risk: "Low", riskPct: 22, daysSinceOrder: 45, reason: "Regular buyer. Small gap — project completion delay on their end, expected to order soon." },
];

const topPerformers: TopPerformer[] = [
  { name: "Arun Kumar", role: "Sales Exec", branch: "TVM", revenueAchieved: 320000, target: 300000, visits: 22, conversionPct: 36 },
  { name: "Vijay CRE", role: "CRES", branch: "EKM", revenueAchieved: 280000, target: 280000, visits: 28, conversionPct: 29 },
  { name: "Renu Thomas", role: "Sales Exec", branch: "KTYM", revenueAchieved: 240000, target: 250000, visits: 20, conversionPct: 30 },
  { name: "Salman Khan", role: "Sales Exec", branch: "CLT", revenueAchieved: 260000, target: 240000, visits: 24, conversionPct: 33 },
];

const forecastData = [
  { month: "Jan", actual: 200000, predicted: 195000 },
  { month: "Feb", actual: 230000, predicted: 225000 },
  { month: "Mar", actual: 210000, predicted: 220000 },
  { month: "Apr", actual: 280000, predicted: 270000 },
  { month: "May", actual: 310000, predicted: 305000 },
  { month: "Jun", actual: 290000, predicted: 300000 },
  { month: "Jul", actual: null as unknown as number, predicted: 340000 },
  { month: "Aug", actual: null as unknown as number, predicted: 360000 },
  { month: "Sep", actual: null as unknown as number, predicted: 385000 },
];

const radarData = [
  { metric: "Conversion", TVM: 85, EKM: 72, KTYM: 68, CLT: 78 },
  { metric: "Collection", TVM: 80, EKM: 88, KTYM: 74, CLT: 70 },
  { metric: "Productivity", TVM: 90, EKM: 75, KTYM: 80, CLT: 85 },
  { metric: "Lead Quality", TVM: 70, EKM: 82, KTYM: 65, CLT: 76 },
  { metric: "Visit eff.", TVM: 88, EKM: 79, KTYM: 85, CLT: 74 },
];

const scoreColor = (s: number) =>
  s >= 85 ? "bg-emerald-100 text-emerald-700" : s >= 70 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";

const riskColor: Record<"High" | "Medium" | "Low", string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-emerald-100 text-emerald-700",
};

export default function AIInsightsPage() {
  const [tab, setTab] = useState<"leads" | "churn" | "forecast" | "team">("leads");
  const [refreshed, setRefreshed] = useState(false);
  const tabs = [
    { key: "leads", label: "Lead Prioritisation", icon: Target },
    { key: "churn", label: "Churn Risk", icon: AlertTriangle },
    { key: "forecast", label: "Revenue Forecast", icon: TrendingUp },
    { key: "team", label: "Team Performance", icon: Users },
  ] as const;

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="AI Insights" subtitle="Reports & AI" />
      <div className="p-6 space-y-5">

        {/* AI Banner */}
        <div className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #4F46E5 60%, #2563EB 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 0%, transparent 55%)" }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
              <Sparkles size={24} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">AI-Powered Business Intelligence</p>
              <p className="text-indigo-200 text-sm mt-0.5">BRD Phase 4 · Insights generated from CRM, sales & operational data. Live ML backend required for production.</p>
            </div>
          </div>
          <button
            onClick={() => setRefreshed(r => !r)}
            className="relative flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all">
            <RefreshCw size={14} className={refreshed ? "animate-spin" : ""} />
            Refresh Insights
          </button>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Leads to prioritise", value: leads.length, sub: "avg score 82", color: "from-indigo-500 to-violet-500", icon: Target },
            { label: "Churn-risk customers", value: churnRisks.filter(c => c.risk !== "Low").length, sub: "High + Medium", color: "from-red-500 to-rose-500", icon: AlertTriangle },
            { label: "Forecast Aug (3M)", value: fmtShort(1085000), sub: "vs ₹8.3L this month", color: "from-emerald-500 to-teal-500", icon: TrendingUp },
            { label: "Top performers", value: topPerformers.length, sub: "above target", color: "from-amber-500 to-orange-500", icon: Star },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={16} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="text-xs text-slate-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-all ${
                  tab === t.key
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}>
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Lead Prioritisation */}
            {tab === "leads" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-4">Ranked by AI score (0–100) based on engagement, budget signals, deal stage, and historical win patterns.</p>
                {leads.map((l, i) => (
                  <div key={l.name} className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: i === 0 ? "linear-gradient(135deg,#4F46E5,#7C3AED)" : i === 1 ? "linear-gradient(135deg,#10B981,#059669)" : "linear-gradient(135deg,#F59E0B,#D97706)" }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <span className="font-semibold text-slate-900 text-sm">{l.company}</span>
                            <span className="text-xs text-slate-400 ml-2">— {l.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{l.stage}</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${scoreColor(l.score)}`}>
                              Score {l.score}
                            </span>
                            <span className="text-sm font-bold text-indigo-600">{fmtShort(l.estimatedValue)}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{l.reason}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <ChevronRight size={11} className="text-indigo-400" />
                          <span className="text-xs text-indigo-600 font-medium">{l.nextAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Churn Risk */}
            {tab === "churn" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 mb-4">Customers at risk of churning based on order recency, payment behaviour & engagement patterns.</p>
                {churnRisks.map(c => (
                  <div key={c.customer} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <p className="font-semibold text-slate-900">{c.customer}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{c.daysSinceOrder}d since last order</span>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${riskColor[c.risk]}`}>
                          {c.risk} Risk · {c.riskPct}%
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full mb-2">
                      <div className={`h-full rounded-full ${c.risk === "High" ? "bg-red-500" : c.risk === "Medium" ? "bg-amber-400" : "bg-emerald-400"}`}
                        style={{ width: `${c.riskPct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{c.reason}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Revenue Forecast */}
            {tab === "forecast" && (
              <div>
                <p className="text-xs text-slate-500 mb-4">3-month revenue forecast using linear regression on 6-month actuals. Shaded area = predicted.</p>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => `${(v / 100000).toFixed(1)}L`} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(v: number, name: string) => [`₹${(v / 100000).toFixed(2)}L`, name]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                    />
                    <Line type="monotone" dataKey="actual" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 3, fill: "#4F46E5" }} name="Actual" connectNulls={false} />
                    <Line type="monotone" dataKey="predicted" stroke="#7C3AED" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 2, fill: "#7C3AED" }} name="AI Forecast" />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    { month: "July 2026", value: 340000, confidence: "High" },
                    { month: "August 2026", value: 360000, confidence: "High" },
                    { month: "September 2026", value: 385000, confidence: "Medium" },
                  ].map(f => (
                    <div key={f.month} className="bg-violet-50 border border-violet-100 rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-500 font-medium">{f.month}</p>
                      <p className="text-xl font-bold text-violet-700 mt-1">{fmtShort(f.value)}</p>
                      <p className={`text-xs mt-1 font-medium ${f.confidence === "High" ? "text-emerald-600" : "text-amber-600"}`}>
                        {f.confidence} confidence
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team Performance */}
            {tab === "team" && (
              <div className="space-y-5">
                <p className="text-xs text-slate-500">Performance analytics across all sales team members. Branch radar + individual breakdown.</p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 mb-3">Branch Performance Radar</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748B" }} />
                        <Radar name="TVM" dataKey="TVM" stroke="#4F46E5" fill="#4F46E5" fillOpacity={0.2} />
                        <Radar name="EKM" dataKey="EKM" stroke="#10B981" fill="#10B981" fillOpacity={0.15} />
                        <Radar name="CLT" dataKey="CLT" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.15} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 mb-3">Revenue Achievement vs Target</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topPerformers} barSize={14} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v: number) => `₹${(v / 1000).toFixed(0)}K`}
                          contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
                        />
                        <Bar dataKey="target" fill="#E2E8F0" name="Target" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="revenueAchieved" fill="#4F46E5" name="Achieved" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="space-y-2">
                  {topPerformers.map(p => {
                    const achievePct = Math.round((p.revenueAchieved / p.target) * 100);
                    return (
                      <div key={p.name} className="border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-indigo-500 to-violet-600 flex-shrink-0">
                          {p.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-slate-900 text-sm">{p.name}</p>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{p.role} · {p.branch}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                            <span>{p.visits} visits</span>
                            <span>{p.conversionPct}% conversion</span>
                            <span>{fmtShort(p.revenueAchieved)} revenue</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`text-sm font-bold ${achievePct >= 100 ? "text-emerald-600" : "text-amber-600"}`}>{achievePct}%</span>
                          <p className="text-xs text-slate-400">of target</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
