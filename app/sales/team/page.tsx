"use client";

import { useState, useEffect, Suspense } from "react";
import { api } from "@/lib/api-client";
import { Loader2, TrendingUp } from "lucide-react";
import DateRangeFilter, { useDateRangeQuery } from "@/components/DateRangeFilter";
import { useSession } from "next-auth/react";
import { isSalesManager } from "@/lib/list-filters";
import { formatRange, monthToRange, todayIst } from "@/lib/date-range";

// Default (as before): the current month. Old ?month=YYYY-MM links open that month.
const thisMonth = () => monthToRange(todayIst().slice(0, 7))!;

function TeamPerformancePageInner() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [meta, setMeta] = useState<{ monthCoverage?: Record<string, number>; unattributedCollected?: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const dr = useDateRangeQuery({ defaultRange: thisMonth });
  const range = dr.range ?? thisMonth();

  useEffect(() => {
    fetchTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from, range.to]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // (was "/api/sales/team/performance" — api.get already prefixes /api, so it 404'd)
      const res = await api.get("/sales/team/performance", { from: range.from, to: range.to });
      if ((res as any)?.data) setTeamData((res as any).data);
      setMeta((res as { meta?: typeof meta } | null)?.meta ?? null);
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return "text-green-600 bg-green-50";
    if (percentage >= 80) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-amber-500";
    if (percentage >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sales Team Performance</h1>
          <p className="text-gray-600 mt-1">Monitor team metrics and achievements</p>
        </div>
        <DateRangeFilter value={range} onChange={dr.setRange} urlError={dr.urlError} basisLabel="Activity / collection date" allowAll={false} />
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase">Team Size</p>
          <p className="text-3xl font-bold mt-2">{teamData.length}</p>
          <p className="text-xs text-gray-500 mt-2">Sales members</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase">Total Calls</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {teamData.reduce((sum, t) => sum + t.metrics.calls, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Target: {teamData.reduce((sum, t) => sum + t.metrics.callsTarget, 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase">Orders Confirmed</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {teamData.reduce((sum, t) => sum + t.metrics.confirmedOrders, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Value: ₹{(teamData.reduce((sum, t) => sum + t.metrics.opportunityValue, 0) / 100000).toFixed(1)}L
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase">Collections</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{(teamData.reduce((sum, t) => sum + t.metrics.totalCollected, 0) / 100000).toFixed(1)}L
          </p>
          <p className="text-xs text-gray-500 mt-2">Attributed to reps, {formatRange(range)}</p>
        </div>
      </div>

      {/* Individual Performance Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-lg">Team Member Performance</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr className="text-xs font-semibold text-gray-700">
                  <th className="text-left px-6 py-3">Name</th>
                  <th className="text-center px-4 py-3">Calls</th>
                  <th className="text-center px-4 py-3">Visits</th>
                  <th className="text-center px-4 py-3">Orders</th>
                  <th className="text-center px-4 py-3">Collections</th>
                  <th className="text-center px-4 py-3">Overall</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {teamData.map((member) => {
                  const overallAchievement = Math.round(
                    (member.achievements.callAchievement +
                      member.achievements.visitAchievement +
                      member.achievements.orderAchievement +
                      member.achievements.revenueAchievement) /
                      4
                  );

                  return (
                    <tr key={member.userId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-gray-500">{member.branch}</p>
                        </div>
                      </td>

                      {/* Calls */}
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{member.metrics.calls}/{member.metrics.callsTarget}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                (member.metrics.calls / member.metrics.callsTarget) * 100
                              )}`}
                              style={{
                                width: `${Math.min(
                                  (member.metrics.calls / member.metrics.callsTarget) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className={`text-xs font-medium ${getAchievementColor(member.achievements.callAchievement)}`}>
                            {member.achievements.callAchievement}%
                          </p>
                        </div>
                      </td>

                      {/* Visits */}
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{member.metrics.visits}/{member.metrics.visitsTarget}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                (member.metrics.visits / member.metrics.visitsTarget) * 100
                              )}`}
                              style={{
                                width: `${Math.min(
                                  (member.metrics.visits / member.metrics.visitsTarget) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className={`text-xs font-medium ${getAchievementColor(member.achievements.visitAchievement)}`}>
                            {member.achievements.visitAchievement}%
                          </p>
                        </div>
                      </td>

                      {/* Orders */}
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{member.metrics.confirmedOrders}/{member.metrics.ordersTarget}</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                (member.metrics.confirmedOrders / member.metrics.ordersTarget) * 100
                              )}`}
                              style={{
                                width: `${Math.min(
                                  (member.metrics.confirmedOrders / member.metrics.ordersTarget) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className={`text-xs font-medium ${getAchievementColor(member.achievements.orderAchievement)}`}>
                            {member.achievements.orderAchievement}%
                          </p>
                        </div>
                      </td>

                      {/* Collections */}
                      <td className="px-4 py-4 text-center">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">₹{(member.metrics.totalCollected / 100000).toFixed(1)}L</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(
                                (member.metrics.totalCollected / member.metrics.collectionTarget) * 100
                              )}`}
                              style={{
                                width: `${Math.min(
                                  (member.metrics.totalCollected / member.metrics.collectionTarget) * 100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <p className={`text-xs font-medium ${getAchievementColor(member.achievements.revenueAchievement)}`}>
                            {member.achievements.revenueAchievement}%
                          </p>
                        </div>
                      </td>

                      {/* Overall Score */}
                      <td className="px-4 py-4 text-center">
                        <div className="inline-block px-3 py-2 rounded-lg font-bold text-lg" style={{
                          backgroundColor: overallAchievement >= 100 ? '#dcfce7' : overallAchievement >= 80 ? '#fef3c7' : '#fee2e2',
                          color: overallAchievement >= 100 ? '#166534' : overallAchievement >= 80 ? '#92400e' : '#991b1b'
                        }}>
                          {overallAchievement}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tips for Manager */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="font-semibold text-blue-900">💡 Manager Tips</p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• Targets are monthly targets pro-rated by the days of each month in the range
            {meta?.monthCoverage && (
              <> ({Object.entries(meta.monthCoverage).map(([m, f]) => `${m}: ${Math.round(f * 100)}%`).join(", ")})</>
            )}; months without a target use the default.</li>
          <li>• Orders = orders dated in the range from the rep&apos;s quotations; opportunities = created in the range on the rep&apos;s leads;
            collections = collected in the range against the rep&apos;s quotation (order or invoice)
            {meta?.unattributedCollected ? <> — ₹{meta.unattributedCollected.toLocaleString("en-IN")} could not be attributed to a rep</> : null}.</li>
          <li>• Green = on track (100%+), Amber = at risk (80–99%), Red = behind (&lt; 80%)</li>
          <li>• Click team member names to see detailed activity logs</li>
          <li>• Review collections regularly to ensure cash flow targets are met</li>
        </ul>
      </div>
    </div>
  );
}

// useSearchParams (date range in the URL) needs a Suspense boundary.
export default function TeamPerformancePage() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;
  // Everyone's numbers: managers only (the API enforces the same rule).
  if (!isSalesManager((session?.user as { role?: string } | undefined)?.role)) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-sm text-gray-600">
          Team performance is available to MD, AVP and Business Managers only.
        </div>
      </div>
    );
  }
  return (
    <Suspense fallback={null}>
      <TeamPerformancePageInner />
    </Suspense>
  );
}
