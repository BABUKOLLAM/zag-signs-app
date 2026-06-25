"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProductionPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const api = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [woRes, matRes, schedRes, qcRes] = await Promise.all([
        api.get("/api/work-orders"),
        api.get("/api/production/materials/consumption"),
        api.get("/api/production/schedules"),
        api.get("/api/production/quality/checkpoints"),
      ]);

      if (woRes.data) setWorkOrders(woRes.data);
      if (matRes.data) setMaterials(matRes.data);
      if (schedRes.data) setSchedules(schedRes.data);
      if (qcRes.data) setCheckpoints(qcRes.data);
    } catch (error) {
      console.error("Error fetching production data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    "In Progress": "bg-blue-100 text-blue-700",
    "Quality Check": "bg-yellow-100 text-yellow-700",
    "Pending": "bg-orange-100 text-orange-700",
    "Completed": "bg-green-100 text-green-700",
  };

  const inProgressWOs = workOrders.filter((wo) => wo.status === "In Progress");
  const totalMaterialCost = materials.reduce((sum, m) => sum + (m.costValue || 0), 0);
  const activeSchedules = schedules.filter((s) => s.status === "IN_PROGRESS");
  const passedCheckpoints = checkpoints.filter((cp) => cp.status === "PASS");
  const passRate = checkpoints.length > 0 ? Math.round((passedCheckpoints.length / checkpoints.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <TopBar title="Production Dashboard" />
      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">Active Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{inProgressWOs.length}</p>
            <Link href="/production/machines" className="text-xs text-blue-600 hover:underline mt-2 block">
              View schedules →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">Material Cost In-Use</p>
            <p className="text-2xl font-bold text-gray-900">₹{totalMaterialCost.toLocaleString()}</p>
            <Link href="/production/materials" className="text-xs text-blue-600 hover:underline mt-2 block">
              View consumption →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">Machines Running</p>
            <p className="text-2xl font-bold text-gray-900">{activeSchedules.length}</p>
            <Link href="/production/machines" className="text-xs text-blue-600 hover:underline mt-2 block">
              Schedule board →
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">QC Pass Rate</p>
            <p className="text-2xl font-bold text-gray-900">{passRate}%</p>
            <Link href="/production/quality" className="text-xs text-blue-600 hover:underline mt-2 block">
              View QC →
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-4">
          <Link
            href="/production/materials"
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition"
          >
            <p className="font-semibold text-blue-900">Material Consumption</p>
            <p className="text-sm text-blue-700 mt-1">{materials.length} consumptions tracked</p>
          </Link>

          <Link
            href="/production/machines"
            className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition"
          >
            <p className="font-semibold text-purple-900">Machine Scheduling</p>
            <p className="text-sm text-purple-700 mt-1">{schedules.length} jobs scheduled</p>
          </Link>

          <Link
            href="/production/quality"
            className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition"
          >
            <p className="font-semibold text-green-900">Quality Control</p>
            <p className="text-sm text-green-700 mt-1">{checkpoints.length} checkpoints completed</p>
          </Link>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900">In-Progress Work Orders</h2>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Work Order</th>
                <th className="text-left px-4 py-3">Description</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Material Cost</th>
                <th className="text-left px-4 py-3">Machines</th>
                <th className="text-left px-4 py-3">QC Status</th>
                <th className="text-left px-4 py-3">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {inProgressWOs.length > 0 ? (
                inProgressWOs.map((wo) => {
                  const woMaterials = materials.filter((m) => m.workOrderId === wo.id);
                  const woSchedules = schedules.filter((s) => s.workOrderId === wo.id);
                  const woCheckpoints = checkpoints.filter((cp) => cp.workOrderId === wo.id);
                  const woMatCost = woMaterials.reduce((sum, m) => sum + (m.costValue || 0), 0);

                  return (
                    <tr key={wo.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 text-blue-600 font-medium">{wo.workOrderNo}</td>
                      <td className="px-4 py-3 text-gray-600">{wo.description}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            statusColors[wo.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {wo.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ₹{woMatCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {woSchedules.length > 0 ? (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {woSchedules.length} scheduled
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Not scheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {woCheckpoints.length > 0 ? (
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              woCheckpoints.some((cp) => cp.status === "PASS")
                                ? "bg-green-100 text-green-700"
                                : woCheckpoints.some((cp) => cp.status === "FAIL")
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {woCheckpoints.filter((cp) => cp.status === "PASS").length}/{woCheckpoints.length} ✓
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {wo.dueDate
                          ? new Date(wo.dueDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No in-progress work orders
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          <p className="font-medium">✓ Production Phase 2 Complete</p>
          <p className="mt-1">Material consumption, machine scheduling, and quality control modules are now live. Track materials, assign jobs to machines, and manage QC checkpoints.</p>
        </div>
      </div>
    </div>
  );
}
