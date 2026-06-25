"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { MATERIAL_CONSUMPTION_COLUMNS } from "@/lib/import-specs";
import BatchImportModal from "@/components/BatchImportModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const api = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consResponse, woResponse, matResponse] = await Promise.all([
        api.get("/api/production/materials/consumption"),
        api.get("/api/work-orders"),
        api.get("/api/inventory"),
      ]);

      if (consResponse.data) setConsumptions(consResponse.data);
      if (woResponse.data) setWorkOrders(woResponse.data);
      if (matResponse.data) setMaterials(matResponse.data);
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
      await api.post("/api/production/materials/consumption", {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Material Consumption</h1>
          <p className="text-gray-600 mt-2">Track materials used in production jobs</p>
        </div>
        <Button onClick={() => setShowImport(true)} className="bg-blue-600">
          Import Materials
        </Button>
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
          <Card>
            <CardHeader>
              <CardTitle>Add Material Consumption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Input
                    type="number"
                    value={plannedQty}
                    onChange={(e) => setPlannedQty(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes"
                    className="mt-1"
                  />
                </div>
              </div>

              <Button
                onClick={handleAddConsumption}
                disabled={loading}
                className="w-full bg-green-600"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Add Consumption
              </Button>
            </CardContent>
          </Card>

          {/* Work Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>In-Progress Work Orders</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Tab */}
      {activeTab === "report" && (
        <Card>
          <CardHeader>
            <CardTitle>Material Consumption Report</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
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
