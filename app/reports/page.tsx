"use client";
import TopBar from "@/components/TopBar";
import { dashboardStats, leads } from "@/lib/data";
import { fmtL } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

export default function ReportsPage() {
  const pieData = [
    { name: "Won", value: leads.filter((l) => l.status === "Won").length },
    { name: "Lost", value: leads.filter((l) => l.status === "Lost").length },
    { name: "Active", value: leads.filter((l) => !["Won", "Lost"].includes(l.status)).length },
  ];
  const ytdRev = dashboardStats.monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
  const ytdTgt = dashboardStats.monthlyRevenue.reduce((s, m) => s + m.target, 0);
  const totalBranch = dashboardStats.branchPerformance.reduce((s, b) => s + b.revenue, 0);

  return (
    <div>
      <TopBar title="Reports & MIS" />
      <div className="p-6 space-y-6">

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "YTD Revenue (2026)", value: fmtL(ytdRev), color: "text-blue-700" },
            { label: "YTD Target (2026)", value: fmtL(ytdTgt), color: "text-gray-700" },
            { label: "Achievement %", value: `${((ytdRev / ytdTgt) * 100).toFixed(1)}%`, color: ytdRev >= ytdTgt ? "text-green-600" : "text-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Revenue vs Target (2026)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardStats.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [fmtL(Number(v ?? 0))]} />
                <Legend />
                <Bar dataKey="revenue" fill="#2563eb" name="Revenue" radius={[3, 3, 0, 0]} />
                <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Lead Conversion Rate</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                  label={({ name, value }) => `${name ?? ""}: ${value ?? 0}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Branch Performance — June 2026</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left p-3">Branch</th>
                <th className="text-right p-3">Leads</th>
                <th className="text-right p-3">Orders</th>
                <th className="text-right p-3">Revenue</th>
                <th className="text-right p-3">% of Total</th>
                <th className="p-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashboardStats.branchPerformance.map((b) => (
                <tr key={b.branch} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold">{b.branch}</td>
                  <td className="p-3 text-right">{b.leads}</td>
                  <td className="p-3 text-right">{b.orders}</td>
                  <td className="p-3 text-right font-semibold text-blue-700">{fmtL(b.revenue)}</td>
                  <td className="p-3 text-right text-gray-600">{((b.revenue / totalBranch) * 100).toFixed(1)}%</td>
                  <td className="p-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(b.revenue / totalBranch) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
