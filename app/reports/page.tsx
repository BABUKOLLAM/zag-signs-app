"use client";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmtL } from "@/lib/utils";
import { LoadingState, ErrorState } from "@/components/States";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"];

interface DashboardStats {
  totalLeads: number; newLeadsThisMonth: number; pipelineValue: number;
  ordersThisMonth: number; revenueThisMonth: number;
  collectionTarget: number; collectionAchieved: number; openComplaints: number;
  branchPerformance: { branch: string; revenue: number; orders: number; leads: number }[];
  monthlyRevenue: { month: string; revenue: number; target: number }[];
  leadFunnel: { stage: string; count: number; value: number }[];
}

interface Lead { id: string; status: string; }

export default function ReportsPage() {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useApi<DashboardStats>("/dashboard");
  const { data: leadsData, loading: leadsLoading } = useApi<Lead[]>("/leads", { limit: 500 });

  const leads = leadsData ?? [];
  const isLoading = statsLoading || leadsLoading;
  const error = statsError;

  const pieData = [
    { name: "Won", value: leads.filter((l) => l.status === "WON").length },
    { name: "Lost", value: leads.filter((l) => l.status === "LOST").length },
    { name: "Active", value: leads.filter((l) => !["WON", "LOST"].includes(l.status)).length },
  ];

  const ytdRev = stats?.monthlyRevenue.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const ytdTgt = stats?.monthlyRevenue.reduce((s, m) => s + m.target, 0) ?? 1;
  const totalBranch = Math.max(stats?.branchPerformance.reduce((s, b) => s + b.revenue, 0) ?? 0, 1);

  return (
    <div>
      <TopBar title="Reports & MIS" />
      <div className="p-4 md:p-6 space-y-6">

        {isLoading ? (
          <LoadingState label="Loading reports…" />
        ) : error ? (
          <ErrorState message={error} onRetry={refetchStats} />
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "YTD Revenue (6 months)", value: fmtL(ytdRev), color: "text-blue-700" },
                { label: "YTD Target (6 months)", value: fmtL(ytdTgt), color: "text-gray-700" },
                { label: "Achievement %", value: `${((ytdRev / ytdTgt) * 100).toFixed(1)}%`, color: ytdRev >= ytdTgt ? "text-green-600" : "text-orange-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Revenue vs Target</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(Number(v) / 100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [fmtL(Number(v ?? 0))]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2563eb" name="Revenue" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Lead Conversion Rate</h3>
                {leads.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">No lead data yet</div>
                ) : (
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
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Branch Performance — This Month</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-xs text-gray-500 font-medium">
                      <th className="text-left p-3">Branch</th>
                      <th className="text-right p-3">Orders</th>
                      <th className="text-right p-3">Revenue</th>
                      <th className="text-right p-3">% of Total</th>
                      <th className="p-3">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.branchPerformance.map((b) => (
                      <tr key={b.branch} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold">{b.branch}</td>
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
          </>
        ) : null}
      </div>
    </div>
  );
}
