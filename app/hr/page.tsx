"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import {
  Plus, CheckCircle2, XCircle, Search, RefreshCw, Loader2,
} from "lucide-react";

type Employee = {
  id: string; employeeNo: string; name: string; designation: string;
  department: string; branch: string; phone: string; email: string;
  dateOfJoining: string; salary: number; isActive: boolean;
};
type LeaveReq = {
  id: string; leaveType: string; fromDate: string; toDate: string;
  days: number; reason: string; status: string; employeeName: string;
  employeeNo: string; department: string; createdAt: string;
};
type Attendance = {
  id: string; date: string; status: string; checkIn: string | null;
  checkOut: string | null; employeeName: string; employeeNo: string; department: string;
};

const LEAVE_TYPES = ["Casual Leave","Sick Leave","Earned Leave","Maternity Leave","Paternity Leave","Unpaid Leave"];
const DEPTS = ["Sales","CRES","Production","Accounts","HR","IT","Management"];
const BRANCHES = ["TVM","KTYM","EKM","CLT"];
const STATUS_COLORS: Record<string,string> = {
  PENDING:  "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  PRESENT:  "bg-emerald-100 text-emerald-700",
  ABSENT:   "bg-red-100 text-red-700",
  HALF_DAY: "bg-amber-100 text-amber-700",
  ON_LEAVE: "bg-blue-100 text-blue-700",
  HOLIDAY:  "bg-purple-100 text-purple-700",
};

export default function HRPage() {
  const [tab, setTab] = useState<"employees"|"attendance"|"leaves">("employees");
  const [search, setSearch] = useState("");
  const [dept, setDept]     = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAddEmp,   setShowAddEmp]   = useState(false);
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [showAttend,   setShowAttend]   = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [attDate, setAttDate] = useState(today);

  const empParams = new URLSearchParams({ ...(search ? { search } : {}), ...(dept ? { department: dept } : {}) });
  const { data: employees, loading: loadEmp, refetch: refetchEmp } = useApi<Employee[]>(`/api/employees?${empParams}`);
  const { data: leaves, loading: loadLeave, refetch: refetchLeave } = useApi<LeaveReq[]>(`/api/leave-requests?${leaveStatus ? `status=${leaveStatus}` : ""}`);
  const { data: attendance, loading: loadAtt, refetch: refetchAtt } = useApi<Attendance[]>(`/api/attendance?date=${attDate}`);

  const empList  = employees  ?? [];
  const leaveList = leaves    ?? [];
  const attList   = attendance ?? [];

  const [empForm, setEmpForm] = useState({ name:"", designation:"", department:"", branch:"TVM", phone:"", email:"", dateOfJoining:"", salary:"" });
  const [leaveForm, setLeaveForm] = useState({ employeeId:"", leaveType:"Casual Leave", fromDate:"", toDate:"", days:"1", reason:"" });
  const [attForm, setAttForm] = useState({ employeeId:"", status:"PRESENT", checkIn:"", checkOut:"" });

  async function createEmployee() {
    if (!empForm.name || !empForm.designation) return;
    setSaving(true);
    await fetch("/api/employees", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...empForm, salary: Number(empForm.salary) || 0 }) });
    setSaving(false); setShowAddEmp(false); refetchEmp();
    setEmpForm({ name:"", designation:"", department:"", branch:"TVM", phone:"", email:"", dateOfJoining:"", salary:"" });
  }

  async function createLeave() {
    if (!leaveForm.employeeId || !leaveForm.fromDate) return;
    setSaving(true);
    await fetch("/api/leave-requests", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...leaveForm, days: Number(leaveForm.days) }) });
    setSaving(false); setShowAddLeave(false); refetchLeave();
  }

  async function markAttendance() {
    if (!attForm.employeeId) return;
    setSaving(true);
    await fetch("/api/attendance", { method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...attForm, date: attDate }) });
    setSaving(false); setShowAttend(false); refetchAtt();
  }

  async function updateLeave(id: string, status: string) {
    await fetch(`/api/leave-requests/${id}`, { method:"PUT", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ status }) });
    refetchLeave();
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">
      <TopBar title="HR & Attendance" />
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Employees", value: empList.length, color: "indigo" },
            { label: "Present Today",   value: attList.filter(a => a.status === "PRESENT").length, color: "emerald" },
            { label: "On Leave Today",  value: attList.filter(a => a.status === "ON_LEAVE").length, color: "blue" },
            { label: "Pending Leaves",  value: leaveList.filter(l => l.status === "PENDING").length, color: "amber" },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">{c.label}</p>
              <p className={`text-2xl font-bold text-${c.color}-600`}>{c.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 w-fit mb-5 shadow-sm">
          {(["employees","attendance","leaves"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab===t ? "text-white shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              style={tab===t ? { background:"linear-gradient(135deg,#4F46E5,#7C3AED)" } : {}}>
              {t === "leaves" ? "Leave Requests" : t}
            </button>
          ))}
        </div>

        {/* EMPLOYEES */}
        {tab === "employees" && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <select value={dept} onChange={e => setDept(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
                <option value="">All Departments</option>
                {DEPTS.map(d => <option key={d}>{d}</option>)}
              </select>
              <button onClick={() => setShowAddEmp(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold"
                style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Add Employee
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Employee","Dept","Branch","Contact","Joined","Salary","Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {loadEmp && <tr><td colSpan={7} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
                  {!loadEmp && empList.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="font-medium text-slate-800">{e.name}</p><p className="text-xs text-slate-400">{e.employeeNo} · {e.designation}</p></td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{e.department}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-700">{e.branch}</span></td>
                      <td className="px-4 py-3 text-xs text-slate-500"><p>{e.phone}</p><p>{e.email}</p></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{e.dateOfJoining}</td>
                      <td className="px-4 py-3 text-slate-700 text-xs">{e.salary > 0 ? `₹${e.salary.toLocaleString()}` : "—"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{e.isActive ? "Active" : "Inactive"}</span></td>
                    </tr>
                  ))}
                  {!loadEmp && empList.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-slate-400">No employees found</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ATTENDANCE */}
        {tab === "attendance" && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              <button onClick={refetchAtt} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
                <RefreshCw size={14} className={loadAtt ? "animate-spin" : ""} />
              </button>
              <button onClick={() => setShowAttend(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold ml-auto"
                style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> Mark Attendance
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Employee","Dept","Status","Check In","Check Out"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {loadAtt && <tr><td colSpan={5} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
                  {!loadAtt && attList.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="font-medium text-slate-800">{a.employeeName}</p><p className="text-xs text-slate-400">{a.employeeNo}</p></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.department}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? "bg-slate-100 text-slate-500"}`}>{a.status.replace("_"," ")}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) : "—"}</td>
                    </tr>
                  ))}
                  {!loadAtt && attList.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-slate-400">No attendance for {attDate}</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* LEAVE REQUESTS */}
        {tab === "leaves" && (
          <>
            <div className="flex gap-3 mb-4 flex-wrap">
              <select value={leaveStatus} onChange={e => setLeaveStatus(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm">
                <option value="">All Statuses</option>
                {["PENDING","APPROVED","REJECTED"].map(s => <option key={s}>{s}</option>)}
              </select>
              <button onClick={() => setShowAddLeave(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold ml-auto"
                style={{ background:"linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                <Plus size={14} /> New Leave Request
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Employee","Leave Type","From","To","Days","Reason","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {loadLeave && <tr><td colSpan={8} className="text-center py-8"><Loader2 size={18} className="animate-spin mx-auto text-slate-400" /></td></tr>}
                  {!loadLeave && leaveList.map(l => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3"><p className="font-medium text-slate-800">{l.employeeName}</p><p className="text-xs text-slate-400">{l.department}</p></td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{l.leaveType}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{l.fromDate}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{l.toDate}</td>
                      <td className="px-4 py-3 text-center font-medium">{l.days}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs max-w-xs truncate">{l.reason || "—"}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[l.status] ?? "bg-slate-100 text-slate-500"}`}>{l.status}</span></td>
                      <td className="px-4 py-3">
                        {l.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button onClick={() => updateLeave(l.id,"APPROVED")} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600" title="Approve"><CheckCircle2 size={14} /></button>
                            <button onClick={() => updateLeave(l.id,"REJECTED")} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500" title="Reject"><XCircle size={14} /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loadLeave && leaveList.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-slate-400">No leave requests</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddEmp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Add Employee</h3>
            <div className="grid grid-cols-2 gap-3">
              {([["name","Full Name *"],["designation","Designation *"],["phone","Phone"],["email","Email"],["salary","Salary (₹)"],["dateOfJoining","Date of Joining"]] as [string,string][]).map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{l}</label>
                  <input value={(empForm as Record<string,string>)[k]}
                    onChange={e => setEmpForm(f => ({...f,[k]:e.target.value}))}
                    type={k==="dateOfJoining"?"date":k==="salary"?"number":"text"}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                <select value={empForm.department} onChange={e => setEmpForm(f=>({...f,department:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">Select…</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                <select value={empForm.branch} onChange={e => setEmpForm(f=>({...f,branch:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createEmployee} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)"}}>
                {saving?"Saving…":"Create Employee"}
              </button>
              <button onClick={()=>setShowAddEmp(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      {showAddLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">New Leave Request</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Employee *</label>
                <select value={leaveForm.employeeId} onChange={e => setLeaveForm(f=>({...f,employeeId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">Select employee…</option>
                  {empList.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employeeNo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Leave Type</label>
                <select value={leaveForm.leaveType} onChange={e => setLeaveForm(f=>({...f,leaveType:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["fromDate","toDate"] as const).map(k => (
                  <div key={k}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{k==="fromDate"?"From":"To"}</label>
                    <input type="date" value={leaveForm[k]} onChange={e => setLeaveForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Days</label>
                  <input type="number" min="0.5" step="0.5" value={leaveForm.days} onChange={e => setLeaveForm(f=>({...f,days:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason</label>
                <textarea value={leaveForm.reason} onChange={e => setLeaveForm(f=>({...f,reason:e.target.value}))} rows={2} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={createLeave} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)"}}>
                {saving?"Saving…":"Submit Request"}
              </button>
              <button onClick={()=>setShowAddLeave(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttend && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Mark Attendance — {attDate}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Employee *</label>
                <select value={attForm.employeeId} onChange={e => setAttForm(f=>({...f,employeeId:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">Select employee…</option>
                  {empList.map(e => <option key={e.id} value={e.id}>{e.name} ({e.employeeNo})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select value={attForm.status} onChange={e => setAttForm(f=>({...f,status:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  {["PRESENT","ABSENT","HALF_DAY","ON_LEAVE","HOLIDAY"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
                </select>
              </div>
              {attForm.status === "PRESENT" && (
                <div className="grid grid-cols-2 gap-3">
                  {(["checkIn","checkOut"] as const).map(k => (
                    <div key={k}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{k==="checkIn"?"Check In":"Check Out"}</label>
                      <input type="time" value={attForm[k]} onChange={e => setAttForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={markAttendance} disabled={saving} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm" style={{background:"linear-gradient(135deg,#4F46E5,#7C3AED)"}}>
                {saving?"Saving…":"Mark Attendance"}
              </button>
              <button onClick={()=>setShowAttend(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
