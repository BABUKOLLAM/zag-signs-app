"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Loader2, TrendingUp } from "lucide-react";

export default function TeamPerformancePage() {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchTeamData();
  }, [month]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/sales/team/performance?month=${month}`);
      if (res.data) setTeamData(res.data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Team Performance</h1>
          <p className="text-gray-600 mt-1">Monitor team metrics and achievements</p>
        </div>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {/* Team Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
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
          <p className="text-xs text-gray-500 mt-2">Received this month</p>
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
          <li>• Target achievement % shows how much of monthly target is completed</li>
          <li>• Green = on track (100%+), Amber = at risk (80–99%), Red = behind (&lt; 80%)</li>
          <li>• Click team member names to see detailed activity logs</li>
          <li>• Review collections regularly to ensure cash flow targets are met</li>
        </ul>
      </div>
    </div>
  );
}
