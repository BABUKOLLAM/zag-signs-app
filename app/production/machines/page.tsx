"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { MACHINE_COLUMNS } from "@/lib/import-specs";
import BatchImportModal from "@/components/BatchImportModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("master");
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    workOrderId: "",
    machineId: "",
    scheduledStartAt: "",
    scheduledEndAt: "",
  });

  const [newMachine, setNewMachine] = useState({
    name: "",
    type: "",
    branch: "TVM",
  });
  const [showMachineForm, setShowMachineForm] = useState(false);

  const api = useApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [machResponse, schedResponse, woResponse] = await Promise.all([
        api.get("/api/production/machines"),
        api.get("/api/production/schedules"),
        api.get("/api/work-orders"),
      ]);

      if (machResponse.data) setMachines(machResponse.data);
      if (schedResponse.data) setSchedules(schedResponse.data);
      if (woResponse.data) setWorkOrders(woResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMachine = async () => {
    if (!newMachine.name || !newMachine.type) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/production/machines", newMachine);
      setNewMachine({ name: "", type: "", branch: "TVM" });
      setShowMachineForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error adding machine:", error);
      alert("Failed to add machine");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleData.workOrderId || !scheduleData.machineId || !scheduleData.scheduledStartAt || !scheduleData.scheduledEndAt) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/production/schedules", {
        workOrderId: scheduleData.workOrderId,
        machineId: scheduleData.machineId,
        scheduledStartAt: scheduleData.scheduledStartAt,
        scheduledEndAt: scheduleData.scheduledEndAt,
      });

      setScheduleData({
        workOrderId: "",
        machineId: "",
        scheduledStartAt: "",
        scheduledEndAt: "",
      });
      setShowScheduleForm(false);
      await fetchData();
    } catch (error) {
      console.error("Error adding schedule:", error);
      alert("Failed to schedule job. Machine may already be booked for this time.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machine Management</h1>
          <p className="text-gray-600 mt-2">Manage machines and schedule production jobs</p>
        </div>
        <Button onClick={() => setShowImport(true)} className="bg-blue-600">
          Import Machines
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("master")}
          className={`px-4 py-2 font-medium ${
            activeTab === "master"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Machine Master
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 font-medium ${
            activeTab === "schedule"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600"
          }`}
        >
          Schedule Board
        </button>
      </div>

      {/* Master Tab */}
      {activeTab === "master" && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowMachineForm(!showMachineForm)}
            className="bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Machine
          </Button>

          {showMachineForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Machine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Machine Name</label>
                    <Input
                      value={newMachine.name}
                      onChange={(e) =>
                        setNewMachine({ ...newMachine, name: e.target.value })
                      }
                      placeholder="e.g., PrintPress-01"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      value={newMachine.type}
                      onChange={(e) =>
                        setNewMachine({ ...newMachine, type: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 mt-1"
                    >
                      <option value="">Select Type</option>
                      <option value="Printing">Printing</option>
                      <option value="Cutting">Cutting</option>
                      <option value="Laminating">Laminating</option>
                      <option value="Binding">Binding</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Branch</label>
                    <select
                      value={newMachine.branch}
                      onChange={(e) =>
                        setNewMachine({ ...newMachine, branch: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 mt-1"
                    >
                      <option value="TVM">TVM</option>
                      <option value="KTYM">KTYM</option>
                      <option value="EKM">EKM</option>
                      <option value="CLT">CLT</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddMachine}
                    disabled={loading}
                    className="flex-1 bg-green-600"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Machine
                  </Button>
                  <Button
                    onClick={() => setShowMachineForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Machines Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Machines ({machines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : machines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">Machine No</th>
                        <th className="text-left py-2 px-2">Name</th>
                        <th className="text-left py-2 px-2">Type</th>
                        <th className="text-left py-2 px-2">Location</th>
                        <th className="text-left py-2 px-2">Status</th>
                        <th className="text-left py-2 px-2">Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {machines.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{m.machineNo}</td>
                          <td className="py-2 px-2">{m.name}</td>
                          <td className="py-2 px-2">{m.type}</td>
                          <td className="py-2 px-2">{m.location || "-"}</td>
                          <td className="py-2 px-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              m.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="py-2 px-2">{m.branch}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No machines available</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === "schedule" && (
        <div className="space-y-4">
          <Button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="bg-green-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Job
          </Button>

          {showScheduleForm && (
            <Card>
              <CardHeader>
                <CardTitle>Schedule Work Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Work Order</label>
                    <select
                      value={scheduleData.workOrderId}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          workOrderId: e.target.value,
                        })
                      }
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
                    <label className="text-sm font-medium">Machine</label>
                    <select
                      value={scheduleData.machineId}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          machineId: e.target.value,
                        })
                      }
                      className="w-full border rounded px-3 py-2 mt-1"
                    >
                      <option value="">Select Machine</option>
                      {machines.filter((m) => m.status === "ACTIVE").map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.machineNo} - {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="datetime-local"
                      value={scheduleData.scheduledStartAt}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          scheduledStartAt: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="datetime-local"
                      value={scheduleData.scheduledEndAt}
                      onChange={(e) =>
                        setScheduleData({
                          ...scheduleData,
                          scheduledEndAt: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddSchedule}
                    disabled={loading}
                    className="flex-1 bg-green-600"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Schedule
                  </Button>
                  <Button
                    onClick={() => setShowScheduleForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Schedules List */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Jobs ({schedules.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : schedules.length > 0 ? (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 border rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{s.workOrder?.workOrderNo}</p>
                          <p className="text-sm text-gray-600">
                            {s.machine?.name} {s.scheduleNo}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(s.scheduledStartAt).toLocaleString()} -{" "}
                            {new Date(s.scheduledEndAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          s.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" :
                          s.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No schedules yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <BatchImportModal
          title="Import Machines"
          endpoint="/api/production/machines/bulk"
          templateName="zag-machines-template"
          columns={MACHINE_COLUMNS}
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
