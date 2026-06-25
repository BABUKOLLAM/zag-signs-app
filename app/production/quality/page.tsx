"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function QualityPage() {
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("checkpoints");
  const [loading, setLoading] = useState(false);
  const [showCheckpointForm, setShowCheckpointForm] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("");
  const [stage, setStage] = useState("PRE_DELIVERY");
  const [qcStatus, setQcStatus] = useState("PASS");
  const [remarks, setRemarks] = useState("");
  const [defects, setDefects] = useState<any[]>([]);
  const [newDefect, setNewDefect] = useState({
    description: "",
    severity: "MINOR",
    category: "Color",
  });

  const api = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cpResponse, woResponse] = await Promise.all([
        api.get("/api/production/quality/checkpoints"),
        api.get("/api/work-orders"),
      ]);

      if (cpResponse.data) setCheckpoints(cpResponse.data);
      if (woResponse.data) setWorkOrders(woResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefect = () => {
    if (!newDefect.description) {
      alert("Please enter defect description");
      return;
    }
    setDefects([...defects, { ...newDefect, id: Math.random() }]);
    setNewDefect({ description: "", severity: "MINOR", category: "Color" });
  };

  const handleRemoveDefect = (id: number) => {
    setDefects(defects.filter((d) => d.id !== id));
  };

  const handleSubmitCheckpoint = async () => {
    if (!selectedWorkOrder) {
      alert("Please select a work order");
      return;
    }

    if (qcStatus === "FAIL" && defects.length === 0) {
      alert("Please add at least one defect for FAIL status");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/production/quality/checkpoints", {
        workOrderId: selectedWorkOrder,
        stage,
        inspectorId: "current-user-id", // Will need session context
        status: qcStatus,
        remarks: remarks || null,
        defects: defects.map((d) => ({
          description: d.description,
          severity: d.severity,
          category: d.category,
        })),
      });

      // Reset form
      setSelectedWorkOrder("");
      setStage("PRE_DELIVERY");
      setQcStatus("PASS");
      setRemarks("");
      setDefects([]);
      setShowCheckpointForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error submitting checkpoint:", error);
      alert("Failed to submit QC checkpoint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Control</h1>
          <p className="text-gray-600 mt-2">Manage quality checkpoints and defect tracking</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("checkpoints")}
          className={`px-4 py-2 font-medium ${
            activeTab === "checkpoints"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          QC Checkpoints
        </button>
        <button
          onClick={() => setActiveTab("defects")}
          className={`px-4 py-2 font-medium ${
            activeTab === "defects"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Defect Report
        </button>
      </div>

      {/* Checkpoints Tab */}
      {activeTab === "checkpoints" && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowCheckpointForm(!showCheckpointForm)}
            className="bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            New QC Checkpoint
          </Button>

          {showCheckpointForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create QC Checkpoint</CardTitle>
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
                      {workOrders.map((wo) => (
                        <option key={wo.id} value={wo.id}>
                          {wo.workOrderNo} - {wo.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full border rounded px-3 py-2 mt-1"
                    >
                      <option value="PRE_PRODUCTION">Pre-Production</option>
                      <option value="MID_PRODUCTION">Mid-Production</option>
                      <option value="PRE_DELIVERY">Pre-Delivery</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">QC Status</label>
                    <select
                      value={qcStatus}
                      onChange={(e) => setQcStatus(e.target.value)}
                      className="w-full border rounded px-3 py-2 mt-1"
                    >
                      <option value="PASS">Pass</option>
                      <option value="FAIL">Fail</option>
                      <option value="CONDITIONAL_PASS">Conditional Pass</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Remarks</label>
                    <Input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Optional remarks"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Defect Section */}
                {qcStatus === "FAIL" && (
                  <div className="space-y-3 p-3 bg-red-50 rounded">
                    <h4 className="font-medium">Add Defects</h4>

                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        value={newDefect.description}
                        onChange={(e) =>
                          setNewDefect({
                            ...newDefect,
                            description: e.target.value,
                          })
                        }
                        placeholder="Defect description"
                      />
                      <select
                        value={newDefect.severity}
                        onChange={(e) =>
                          setNewDefect({
                            ...newDefect,
                            severity: e.target.value,
                          })
                        }
                        className="border rounded px-3 py-2"
                      >
                        <option value="MINOR">Minor</option>
                        <option value="MAJOR">Major</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                      <select
                        value={newDefect.category}
                        onChange={(e) =>
                          setNewDefect({
                            ...newDefect,
                            category: e.target.value,
                          })
                        }
                        className="border rounded px-3 py-2"
                      >
                        <option value="Color">Color</option>
                        <option value="Dimension">Dimension</option>
                        <option value="Surface">Surface</option>
                        <option value="Assembly">Assembly</option>
                        <option value="Alignment">Alignment</option>
                      </select>
                    </div>

                    <Button
                      onClick={handleAddDefect}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Add Defect
                    </Button>

                    {defects.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {defects.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">{d.description}</p>
                              <p className="text-xs text-gray-600">
                                {d.severity} - {d.category}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveDefect(d.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitCheckpoint}
                    disabled={loading}
                    className="flex-1 bg-green-600"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Checkpoint
                  </Button>
                  <Button
                    onClick={() => setShowCheckpointForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checkpoints List */}
          <Card>
            <CardHeader>
              <CardTitle>Quality Checkpoints ({checkpoints.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : checkpoints.length > 0 ? (
                <div className="space-y-2">
                  {checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className={`p-3 rounded border ${
                        cp.status === "PASS"
                          ? "bg-green-50 border-green-200"
                          : cp.status === "FAIL"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium">{cp.workOrder?.workOrderNo}</p>
                          <p className="text-sm text-gray-600">{cp.checkpointNo}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded">
                            {cp.stage}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              cp.status === "PASS"
                                ? "bg-green-100 text-green-700"
                                : cp.status === "FAIL"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {cp.status}
                          </span>
                        </div>
                      </div>

                      {cp.defects && cp.defects.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium text-red-700">Defects:</p>
                          <ul className="list-disc list-inside text-red-600">
                            {cp.defects.map((d: any) => (
                              <li key={d.id}>
                                {d.description} ({d.severity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {cp.remarks && (
                        <p className="text-sm text-gray-700 mt-2">
                          <strong>Remarks:</strong> {cp.remarks}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No QC checkpoints yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Defects Tab */}
      {activeTab === "defects" && (
        <Card>
          <CardHeader>
            <CardTitle>Defect Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded">
                    <p className="text-sm text-gray-600">Total Defects</p>
                    <p className="text-3xl font-bold">
                      {checkpoints.reduce((sum, cp) => sum + (cp.defects?.length || 0), 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded">
                    <p className="text-sm text-gray-600">Critical</p>
                    <p className="text-3xl font-bold">
                      {checkpoints.reduce(
                        (sum, cp) =>
                          sum +
                          (cp.defects?.filter((d: any) => d.severity === "CRITICAL")
                            .length || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded">
                    <p className="text-sm text-gray-600">Pass Rate</p>
                    <p className="text-3xl font-bold">
                      {checkpoints.length > 0
                        ? Math.round(
                            ((checkpoints.filter((cp) => cp.status === "PASS").length /
                              checkpoints.length) *
                              100) | 0
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Work Order</th>
                        <th className="text-left py-2 px-2">Defect</th>
                        <th className="text-left py-2 px-2">Severity</th>
                        <th className="text-left py-2 px-2">Category</th>
                        <th className="text-left py-2 px-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkpoints.map(
                        (cp) =>
                          cp.defects &&
                          cp.defects.map((d: any) => (
                            <tr key={d.id} className="border-b hover:bg-gray-50">
                              <td className="py-2 px-2">
                                {cp.workOrder?.workOrderNo}
                              </td>
                              <td className="py-2 px-2">{d.description}</td>
                              <td className="py-2 px-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    d.severity === "CRITICAL"
                                      ? "bg-red-100 text-red-700"
                                      : d.severity === "MAJOR"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {d.severity}
                                </span>
                              </td>
                              <td className="py-2 px-2">{d.category}</td>
                              <td className="py-2 px-2">
                                {d.correctedAt ? (
                                  <span className="text-green-600">✓ Corrected</span>
                                ) : (
                                  <span className="text-red-600">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
