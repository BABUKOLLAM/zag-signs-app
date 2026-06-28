"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { MATERIAL_CONSUMPTION_COLUMNS } from "@/lib/import-specs";
import BatchImportModal from "@/components/BatchImportModal";
import { Loader2 } from "lucide-react";

export default function MaterialsPage() {
  const [consumptions, setConsumptions] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("plan");
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [plannedQty, setPlannedQty] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consResponse, woResponse, matResponse] = await Promise.all([
        api.get("/production/materials/consumption"),
        api.get("/work-orders"),
        api.get("/inventory"),
      ]) as any[];

      if ((consResponse as any)?.data) setConsumptions((consResponse as any).data);
      if ((woResponse as any)?.data) setWorkOrders((woResponse as any).data);
      if ((matResponse as any)?.data) setMaterials((matResponse as any).data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsumption = async () => {
    if (!selectedWorkOrder || !selectedMaterial || !plannedQty) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/production/materials/consumption", {
        workOrderId: selectedWorkOrder,
        materialId: selectedMaterial,
        plannedQty: parseFloat(plannedQty),
        notes,
      });

      setSelectedWorkOrder("");
      setSelectedMaterial("");
      setPlannedQty("");
      setNotes("");
      await fetchData();
    } catch (error) {
      console.error("Error adding consumption:", error);
      alert("Failed to add material consumption");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Consumption</h1>
          <p className="text-gray-600 mt-2">Track materials used in production jobs</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Import Materials
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("plan")}
          className={`px-4 py-2 font-medium ${
            activeTab === "plan"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Consumption Plan
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-4 py-2 font-medium ${
            activeTab === "report"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Consumption Report
        </button>
      </div>

      {/* Plan Tab */}
      {activeTab === "plan" && (
        <div className="space-y-6">
          {/* Add Consumption Form */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Add Material Consumption</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Work Order</label>
                  <select
                    value={selectedWorkOrder}
                    onChange={(e) => setSelectedWorkOrder(e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="">Select Work Order</option>
                    {workOrders
                      .filter((wo) => wo.status === "In Progress")
                      .map((wo) => (
                        <option key={wo.id} value={wo.id}>
                          {wo.workOrderNo} - {wo.description}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="">Select Material</option>
                    {materials.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.name} (Stock: {mat.currentStock} {mat.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Planned Quantity</label>
                  <input
                    type="number"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                </div>
              </div>

              <button
                onClick={handleAddConsumption}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />}
                Add Consumption
              </button>
            </div>
          </div>

          {/* Work Orders List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">In-Progress Work Orders</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : workOrders.filter((wo) => wo.status === "In Progress").length > 0 ? (
                <div className="space-y-2">
                  {workOrders
                    .filter((wo) => wo.status === "In Progress")
                    .map((wo) => (
                      <div
                        key={wo.id}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <div>
                          <p className="font-medium">{wo.workOrderNo}</p>
                          <p className="text-sm text-gray-600">{wo.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {wo.status}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No in-progress work orders</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === "report" && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Material Consumption Report</h2>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : consumptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">ID</th>
                      <th className="text-left py-2 px-2">Work Order</th>
                      <th className="text-left py-2 px-2">Material</th>
                      <th className="text-right py-2 px-2">Planned Qty</th>
                      <th className="text-right py-2 px-2">Actual Qty</th>
                      <th className="text-right py-2 px-2">Wastage</th>
                      <th className="text-right py-2 px-2">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumptions.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2">{c.consumptionNo}</td>
                        <td className="py-2 px-2">{c.workOrder?.workOrderNo}</td>
                        <td className="py-2 px-2">{c.material?.name}</td>
                        <td className="text-right py-2 px-2">{c.plannedQty}</td>
                        <td className="text-right py-2 px-2">{c.actualQty || "-"}</td>
                        <td className="text-right py-2 px-2">{c.wastageQty}</td>
                        <td className="text-right py-2 px-2">{c.costValue || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No consumption records</p>
            )}
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <BatchImportModal
          title="Import Material Consumption"
          endpoint="/api/production/materials/consumption/bulk"
          templateName="zag-material-consumption-template"
          columns={MATERIAL_CONSUMPTION_COLUMNS}
          onClose={() => setShowImport(false)}
          onDone={() => {
            setShowImport(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
