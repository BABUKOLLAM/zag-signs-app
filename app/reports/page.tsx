"use client";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { fmt, fmtL } from "@/lib/utils";
import { LoadingState, ErrorState } from "@/components/States";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const BLUE_PALETTE = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
const PIE_COLORS   = ["#10b981", "#ef4444", "#6366f1"];
const WO_COLORS    = ["#6366f1","#3b82f6","#f59e0b","#8b5cf6","#10b981","#f97316"];

interface DashboardStats {
  totalLeads: number; newLeadsThisMonth: number; pipelineValue: number;
  ordersThisMonth: number; revenueThisMonth: number;
  collectionTarget: number; collectionAchieved: number; openComplaints: number;
  branchPerformance: { branch: string; revenue: number; orders: number; leads: number }[];
  monthlyRevenue:    { month: string; revenue: number; target: number }[];
  leadFunnel:        { stage: string; count: number; value: number }[];
}

interface Lead { id: string; status: string; }

interface WorkOrder { id: string; status: string; priority: string; }

interface Material { id: string; stockStatus: string; name: string; currentStock: number; minimumStock: number; unit: string; }

export default function ReportsPage() {
  const { data: stats, loading: sL, error: sE, refetch: refetchStats } =
    useApi<DashboardStats>("/dashboard");
  const { data: leadsData,  loading: lL } = useApi<Lead[]>("/leads",       { limit: 500 });
  const { data: woData,     loading: wL } = useApi<WorkOrder[]>("/work-orders");
  const { data: matData,    loading: mL } = useApi<Material[]>("/inventory");

  const leads     = leadsData ?? [];
  const workOrders = woData   ?? [];
  const materials  = matData  ?? [];
  const isLoading  = sL || lL || wL || mL;
  const error      = sE;

  const pieData = [
    { name: "Won",    value: leads.filter((l) => l.status === "WON").length },
    { name: "Lost",   value: leads.filter((l) => l.status === "LOST").length },
    { name: "Active", value: leads.filter((l) => !["WON","LOST"].includes(l.status)).length },
  ];

  const woByStatus = ["Pending","In Progress","Quality Check","Dispatch Ready","Completed","On Hold"]
    .map((s) => ({ name: s, value: workOrders.filter((w) => w.status === s).length }))
    .filter((s) => s.value > 0);

  const alertMaterials = materials
    .filter((m) => m.stockStatus === "Critical" || m.stockStatus === "Out" || m.stockStatus === "Low")
    .sort((a, b) => {
      const order: Record<string,number> = { Out: 0, Critical: 1, Low: 2 };
      return (order[a.stockStatus] ?? 3) - (order[b.stockStatus] ?? 3);
    })
    .slice(0, 8);

  const ytdRev    = stats?.monthlyRevenue.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const ytdTgt    = stats?.monthlyRevenue.reduce((s, m) => s + m.target, 0) ?? 1;
  const totalBranch = Math.max(stats?.branchPerformance.reduce((s, b) => s + b.revenue, 0) ?? 0, 1);
  const collPct   = stats
    ? Math.min(100, (stats.collectionAchieved / Math.max(stats.collectionTarget, 1)) * 100)
    : 0;

  return (
    <div>
      <TopBar title="Reports & MIS" />
      <div className="p-4 md:p-6 space-y-6">

        {isLoading ? <LoadingState label="Loading reports…" /> :
         error     ? <ErrorState message={error} onRetry={refetchStats} /> :
         stats ? (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "YTD Revenue (6 mo)", value: fmtL(ytdRev),  sub: `${((ytdRev/ytdTgt)*100).toFixed(1)}% of target`, color: "text-blue-700" },
                { label: "Pipeline Value",      value: fmtL(stats.pipelineValue), sub: `${stats.totalLeads} total leads`, color: "text-indigo-700" },
                { label: "Collection This Month", value: fmt(stats.collectionAchieved), sub: `Target: ${fmt(stats.collectionTarget)}`, color: collPct >= 100 ? "text-green-600" : "text-orange-600" },
                { label: "Open Complaints",     value: stats.openComplaints, sub: "Requiring action", color: stats.openComplaints > 0 ? "text-red-600" : "text-green-600" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Revenue chart + Lead pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Monthly Revenue vs Target</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `${(Number(v)/100000).toFixed(0)}L`} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [fmtL(Number(v ?? 0))]} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#2563eb" name="Revenue" radius={[3,3,0,0]} />
                    <Bar dataKey="target"  fill="#e5e7eb" name="Target"  radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Lead Conversion</h3>
                {leads.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">No lead data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }) => `${name ?? ""}: ${value ?? 0}`}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Lead funnel + Work Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Lead Pipeline Funnel</h3>
                {stats.leadFunnel.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">No active leads</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={stats.leadFunnel} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="stage" type="category" tick={{ fontSize: 11 }} width={80} />
                      <Tooltip formatter={(v) => [Number(v).toLocaleString(), "Leads"]} />
                      <Bar dataKey="count" radius={[0,4,4,0]}>
                        {stats.leadFunnel.map((_, i) => (
                          <Cell key={i} fill={BLUE_PALETTE[i % BLUE_PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Work Orders by Status</h3>
                {woByStatus.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">No work orders yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={woByStatus} cx="50%" cy="50%" outerRadius={85} dataKey="value"
                        label={({ name, value }) => `${name ?? ""}: ${value ?? 0}`}>
                        {woByStatus.map((_, i) => <Cell key={i} fill={WO_COLORS[i % WO_COLORS.length]} />)}
                      </Pie>
                      <Tooltip /><Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Collection progress */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Collection Progress — This Month</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-2xl font-bold text-indigo-700">{fmt(stats.collectionAchieved)}</span>
                <span className="text-sm text-gray-400">of</span>
                <span className="text-xl font-semibold text-gray-600">{fmt(stats.collectionTarget)}</span>
                <span className={`ml-auto text-lg font-bold ${collPct >= 100 ? "text-green-600" : collPct >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                  {collPct.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${collPct >= 100 ? "bg-green-500" : collPct >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(collPct, 100)}%` }}
                />
              </div>
            </div>

            {/* Branch Performance */}
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
                      <th className="p-3 w-40">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.branchPerformance.map((b) => (
                      <tr key={b.branch} className="hover:bg-gray-50">
                        <td className="p-3 font-semibold">{b.branch}</td>
                        <td className="p-3 text-right">{b.orders}</td>
                        <td className="p-3 text-right font-semibold text-blue-700">{fmtL(b.revenue)}</td>
                        <td className="p-3 text-right text-gray-600">{((b.revenue/totalBranch)*100).toFixed(1)}%</td>
                        <td className="p-3">
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(b.revenue/totalBranch)*100}%` }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inventory Alerts */}
            {alertMaterials.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-800">Inventory Alerts</h3>
                  <span className="text-xs text-gray-400">{alertMaterials.length} item{alertMaterials.length > 1 ? "s" : ""} need attention</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {alertMaterials.map((m) => (
                    <div key={m.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                      m.stockStatus === "Out" || m.stockStatus === "Critical"
                        ? "bg-red-50 border-red-100"
                        : "bg-yellow-50 border-yellow-100"
                    }`}>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{m.name}</p>
                        <p className="text-xs text-gray-500">Stock: {m.currentStock} {m.unit} · Min: {m.minimumStock}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        m.stockStatus === "Out"      ? "bg-gray-200 text-gray-700"  :
                        m.stockStatus === "Critical" ? "bg-red-200 text-red-800"    :
                        "bg-yellow-200 text-yellow-800"
                      }`}>
                        {m.stockStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
