"use client";
import { ComponentType } from "react";
import TopBar from "@/components/TopBar";
import { dashboardStats } from "@/lib/data";
import { fmtShort } from "@/lib/utils";
import { TrendingUp, Users, ShoppingCart, Wallet, AlertCircle, Target } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  sub: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  color: string;
}

function StatCard({ title, value, sub, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const s = dashboardStats;
  const collPct = Math.round((s.collectionAchieved / s.collectionTarget) * 100);
  const maxFunnelCount = Math.max(...s.leadFunnel.map((f) => f.count), 1);

  return (
    <div>
      <TopBar title="Executive Dashboard" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Total Leads" value={s.totalLeads} sub={`+${s.newLeadsThisMonth} this month`} icon={Users} color="bg-blue-500" />
          <StatCard title="Pipeline Value" value={fmtShort(s.pipelineValue)} sub="Active opportunities" icon={TrendingUp} color="bg-indigo-500" />
          <StatCard title="Orders / Month" value={s.ordersThisMonth} sub="June 2026" icon={ShoppingCart} color="bg-green-500" />
          <StatCard title="Revenue MTD" value={fmtShort(s.revenueThisMonth)} sub="June 2026" icon={Wallet} color="bg-emerald-500" />
          <StatCard title="Collection" value={`${collPct}%`} sub={`${fmtShort(s.collectionAchieved)} of ${fmtShort(s.collectionTarget)}`} icon={Target} color="bg-orange-500" />
          <StatCard title="Open Complaints" value={s.openComplaints} sub="Pending resolution" icon={AlertCircle} color="bg-red-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Revenue vs Target</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={s.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${(Number(v ?? 0) / 100000).toFixed(2)}L`]} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Revenue" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={2} strokeDasharray="4 4" name="Target" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Branch Performance (June)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={s.branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`₹${(Number(v ?? 0) / 100000).toFixed(2)}L`]} />
                <Bar dataKey="revenue" fill="#2563eb" name="Revenue (₹)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Lead Funnel</h3>
            <div className="space-y-2">
              {s.leadFunnel.map((f) => (
                <div key={f.stage} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-24">{f.stage}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.min(100, (f.count / maxFunnelCount) * 100)}%` }}
                    >
                      <span className="text-white text-xs font-medium">{f.count}</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 w-16 text-right">{fmtShort(f.value)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Branch Summary</h3>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-2">Branch</th>
                  <th className="text-right pb-2">Leads</th>
                  <th className="text-right pb-2">Orders</th>
                  <th className="text-right pb-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {s.branchPerformance.map((b) => (
                  <tr key={b.branch} className="text-sm border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 font-medium">{b.branch}</td>
                    <td className="py-2 text-right text-gray-600">{b.leads}</td>
                    <td className="py-2 text-right text-gray-600">{b.orders}</td>
                    <td className="py-2 text-right text-blue-700 font-medium">{fmtShort(b.revenue)}</td>
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
