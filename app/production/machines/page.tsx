"use client";

import { useState, useEffect } from "react";
import { api as apiClient } from "@/lib/api-client";
import { MACHINE_COLUMNS } from "@/lib/import-specs";
import BatchImportModal from "@/components/BatchImportModal";
import { Loader2, Plus } from "lucide-react";

export default function MachinesPage() {
  const [machines, setMachines] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("master");
  const [showImport, setShowImport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [newMachine, setNewMachine] = useState({ name: "", type: "", branch: "TVM" });
  const [showMachineForm, setShowMachineForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    workOrderId: "",
    machineId: "",
    scheduledStartAt: "",
    scheduledEndAt: "",
  });

  const api = apiClient;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [machResponse, schedResponse, woResponse] = await Promise.all([
        api.get("/production/machines"),
        api.get("/production/schedules"),
        api.get("/work-orders"),
      ]) as any[];

      if ((machResponse as any)?.data) setMachines((machResponse as any).data);
      if ((schedResponse as any)?.data) setSchedules((schedResponse as any).data);
      if ((woResponse as any)?.data) setWorkOrders((woResponse as any).data);
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
      await api.post("/production/machines", newMachine);
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
      await api.post("/production/schedules", {
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
      alert("Failed to schedule job. Machine may already be booked.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Machine Management</h1>
          <p className="text-gray-600 mt-2">Manage machines and schedule jobs</p>
        </div>
        <button
          onClick={() => setShowImport(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Import Machines
        </button>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("master")}
          className={`px-4 py-2 font-medium ${activeTab === "master" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Machine Master
        </button>
        <button
          onClick={() => setActiveTab("schedule")}
          className={`px-4 py-2 font-medium ${activeTab === "schedule" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`}
        >
          Schedule Board
        </button>
      </div>

      {activeTab === "master" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowMachineForm(!showMachineForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Machine
          </button>

          {showMachineForm && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
              <h2 className="font-semibold">Add New Machine</h2>
              <div className="grid grid-cols-3 gap-4">
                <input
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  placeholder="Machine Name"
                  className="border rounded px-3 py-2"
                />
                <select
                  value={newMachine.type}
                  onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select Type</option>
                  <option value="Printing">Printing</option>
                  <option value="Cutting">Cutting</option>
                  <option value="Laminating">Laminating</option>
                </select>
                <select
                  value={newMachine.branch}
                  onChange={(e) => setNewMachine({ ...newMachine, branch: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="TVM">TVM</option>
                  <option value="KTYM">KTYM</option>
                  <option value="EKM">EKM</option>
                  <option value="CLT">CLT</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddMachine} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : ""}Save
                </button>
                <button onClick={() => setShowMachineForm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold">All Machines ({machines.length})</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : machines.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b"><th className="text-left py-2 px-2">No</th><th className="text-left py-2 px-2">Name</th><th className="text-left py-2 px-2">Type</th><th className="text-left py-2 px-2">Location</th><th className="text-left py-2 px-2">Status</th></tr>
                    </thead>
                    <tbody>
                      {machines.map((m) => (
                        <tr key={m.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{m.machineNo}</td>
                          <td className="py-2 px-2">{m.name}</td>
                          <td className="py-2 px-2">{m.type}</td>
                          <td className="py-2 px-2">{m.location || "-"}</td>
                          <td className="py-2 px-2"><span className={`px-2 py-1 rounded text-xs font-medium ${m.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{m.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No machines</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "schedule" && (
        <div className="space-y-4">
          <button
            onClick={() => setShowScheduleForm(!showScheduleForm)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Schedule Job
          </button>

          {showScheduleForm && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-4">
              <h2 className="font-semibold">Schedule Work Order</h2>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={scheduleData.workOrderId}
                  onChange={(e) => setScheduleData({ ...scheduleData, workOrderId: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Work Order</option>
                  {workOrders.map((wo) => (
                    <option key={wo.id} value={wo.id}>{wo.workOrderNo}</option>
                  ))}
                </select>
                <select
                  value={scheduleData.machineId}
                  onChange={(e) => setScheduleData({ ...scheduleData, machineId: e.target.value })}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Machine</option>
                  {machines.filter((m) => m.status === "ACTIVE").map((m) => (
                    <option key={m.id} value={m.id}>{m.machineNo} - {m.name}</option>
                  ))}
                </select>
                <input
                  type="datetime-local"
                  value={scheduleData.scheduledStartAt}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledStartAt: e.target.value })}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="datetime-local"
                  value={scheduleData.scheduledEndAt}
                  onChange={(e) => setScheduleData({ ...scheduleData, scheduledEndAt: e.target.value })}
                  className="border rounded px-3 py-2"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddSchedule} disabled={loading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 inline mr-2 animate-spin" /> : ""}Schedule
                </button>
                <button onClick={() => setShowScheduleForm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold">Scheduled Jobs ({schedules.length})</h2>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : schedules.length > 0 ? (
                <div className="space-y-2">
                  {schedules.map((s) => (
                    <div key={s.id} className="p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{s.workOrder?.workOrderNo} - {s.machine?.name}</p>
                          <p className="text-xs text-gray-500">{new Date(s.scheduledStartAt).toLocaleString()} - {new Date(s.scheduledEndAt).toLocaleString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded text-sm font-medium ${s.status === "SCHEDULED" ? "bg-blue-100 text-blue-700" : s.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No schedules</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <BatchImportModal
          title="Import Machines"
          endpoint="/api/production/machines/bulk"
          templateName="zag-machines-template"
          columns={MACHINE_COLUMNS}
          onClose={() => setShowImport(false)}
          onDone={() => { setShowImport(false); fetchData(); }}
        />
      )}
    </div>
  );
}
