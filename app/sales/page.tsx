"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { Loader2, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function SalesDashboard() {
  const [activities, setActivities] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const [actRes, claimsRes, leadsRes, oppRes, soRes] = await Promise.all([
        api.get(`/api/sales/activities?date=${today}`),
        api.get("/api/sales/claims"),
        api.get("/api/leads?status=NEW"),
        api.get("/api/opportunities"),
        api.get("/api/sales-orders"),
      ]) as any[];

      if ((actRes as any)?.data) setActivities((actRes as any).data);
      if ((claimsRes as any)?.data) setClaims((claimsRes as any).data);
      if ((leadsRes as any)?.data) setLeads((leadsRes as any).data);
      if ((oppRes as any)?.data) setOpportunities((oppRes as any).data);
      if ((soRes as any)?.data) setSalesOrders((soRes as any).data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const todaysCalls = activities.filter((a) => a.type === "CALL").length;
  const todaysVisits = activities.filter((a) => a.type === "VISIT").length;
  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const wonThisMonth = opportunities.filter((o) => o.stage === "CLOSED_WON").length;
  const newOrders = salesOrders.filter((so) => so.status === "DRAFT" || so.status === "CONFIRMED").length;
  const inProduction = salesOrders.filter((so) => so.status === "IN_PRODUCTION").length;

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700",
    CONTACTED: "bg-indigo-100 text-indigo-700",
    QUALIFIED: "bg-purple-100 text-purple-700",
    PROPOSAL: "bg-orange-100 text-orange-700",
    NEGOTIATION: "bg-amber-100 text-amber-700",
    WON: "bg-green-100 text-green-700",
    LOST: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time pipeline, activities & orders</p>
        </div>
        <Link
          href="/sales/activities"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Log Activity
        </Link>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Calls</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{todaysCalls}</p>
          <p className="text-xs text-gray-500 mt-2">Target: 15</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Today's Visits</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{todaysVisits}</p>
          <p className="text-xs text-gray-500 mt-2">Target: 5</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Pipeline Value</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">₹{(totalPipeline / 100000).toFixed(1)}L</p>
          <p className="text-xs text-gray-500 mt-2">{opportunities.length} opportunities</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Won This Month</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{wonThisMonth}</p>
          <p className="text-xs text-gray-500 mt-2">Deals closed</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Today's Activities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold">Today's Activities</h2>
          </div>
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((a) => (
                <div key={a.id} className="p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{a.customer?.name || a.lead?.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {a.type} • {a.duration ? `${a.duration} min` : "timing TBD"}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      a.type === "CALL" ? "bg-blue-100 text-blue-700" :
                      a.type === "VISIT" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {a.type}
                    </span>
                  </div>
                  {a.outcome && <p className="text-xs text-gray-600 mt-2">Outcome: {a.outcome}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No activities logged today</p>
            )}
          </div>
        </div>

        {/* Center: Active Leads & Opportunities */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold">Pipeline</h2>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            <div className="p-3 bg-blue-50 rounded">
              <p className="text-xs text-blue-600 font-medium">NEW LEADS</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{leads.length}</p>
            </div>

            {opportunities.slice(0, 5).map((o) => (
              <div key={o.id} className="p-3 border rounded">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm line-clamp-1">{o.title}</p>
                  <span className="text-xs font-semibold text-purple-600">{o.probability}%</span>
                </div>
                <p className="text-sm font-bold text-gray-900">₹{(o.value / 100000).toFixed(1)}L</p>
                <p className="text-xs text-gray-500 mt-1">{o.stage}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Orders & Claims */}
        <div className="space-y-4">
          {/* Orders */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm">Order Status</h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
                <span className="text-sm font-medium">New/Confirmed</span>
                <span className="text-lg font-bold text-amber-600">{newOrders}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm font-medium">In Production</span>
                <span className="text-lg font-bold text-blue-600">{inProduction}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">Ready for Delivery</span>
                <span className="text-lg font-bold text-green-600">
                  {salesOrders.filter((s) => s.status === "READY").length}
                </span>
              </div>
            </div>
          </div>

          {/* Claims Window */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-sm">Claims Window</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-green-50 rounded">
                <p className="text-xs text-green-600 font-medium">WINDOW OPEN</p>
                <p className="text-sm font-bold text-green-700 mt-1">1st - 10th of Month</p>
              </div>
              <Link
                href="/sales/claims"
                className="block w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 text-center"
              >
                Submit Claim
              </Link>
              <div className="p-2 border rounded text-xs text-gray-600">
                <p className="font-medium">Pending: {claims.filter((c) => c.status === "DRAFT").length}</p>
                <p className="font-medium">Under Review: {claims.filter((c) => c.status?.includes("REVIEW")).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-4 gap-4">
        <Link
          href="/sales/activities"
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition"
        >
          <p className="font-semibold text-blue-900">Activity Tracker</p>
          <p className="text-sm text-blue-700 mt-1">Log calls, visits, follow-ups</p>
        </Link>

        <Link
          href="/sales/claims"
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition"
        >
          <p className="font-semibold text-green-900">Sales Claims</p>
          <p className="text-sm text-green-700 mt-1">Submit reimbursement claims</p>
        </Link>

        <Link
          href="/leads"
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition"
        >
          <p className="font-semibold text-purple-900">Manage Leads</p>
          <p className="text-sm text-purple-700 mt-1">Register & track prospects</p>
        </Link>

        <Link
          href="/opportunities"
          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition"
        >
          <p className="font-semibold text-orange-900">Sales Pipeline</p>
          <p className="text-sm text-orange-700 mt-1">Track opportunities</p>
        </Link>
      </div>
    </div>
  );
}
