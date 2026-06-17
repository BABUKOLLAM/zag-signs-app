"use client";
import TopBar from "@/components/TopBar";

const employees = [
  { id: "EMP001", name: "Arun Kumar", role: "CRE", branch: "TVM", dept: "Sales", present: true, leaveBalance: 12 },
  { id: "EMP002", name: "Meera Nair", role: "CRE", branch: "EKM", dept: "Sales", present: true, leaveBalance: 8 },
  { id: "EMP003", name: "Vijay CRE", role: "Senior CRE", branch: "EKM", dept: "Sales", present: false, leaveBalance: 5 },
  { id: "EMP004", name: "Renu Thomas", role: "CRE", branch: "KTYM", dept: "Sales", present: true, leaveBalance: 15 },
  { id: "EMP005", name: "Salman Khan", role: "CRE", branch: "CLT", dept: "Sales", present: true, leaveBalance: 10 },
  { id: "EMP006", name: "Rajesh Kumar", role: "Production Head", branch: "TVM", dept: "Production", present: true, leaveBalance: 6 },
];

export default function HRPage() {
  const present = employees.filter(e => e.present).length;
  return (
    <div>
      <TopBar title="HR & Attendance" />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Employees", value: employees.length },
            { label: "Present Today", value: present },
            { label: "On Leave", value: employees.length - present },
            { label: "Departments", value: [...new Set(employees.map(e=>e.dept))].length },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Today&rsquo;s Attendance — {new Date().toLocaleDateString("en-IN", {weekday:"long", day:"numeric", month:"long"})}</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr className="text-xs text-gray-500 font-medium">
                <th className="text-left px-4 py-3">Employee ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Branch</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Leave Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map(e => (
                <tr key={e.id} className="hover:bg-gray-50 text-sm">
                  <td className="px-4 py-3 text-blue-600 font-medium">{e.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{e.name}</td>
                  <td className="px-4 py-3 text-gray-600">{e.role}</td>
                  <td className="px-4 py-3 text-gray-600">{e.dept}</td>
                  <td className="px-4 py-3"><span className="bg-gray-100 text-xs px-2 py-0.5 rounded text-gray-700">{e.branch}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${e.present ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {e.present ? "Present" : "Absent"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-medium">{e.leaveBalance} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
          GPS Attendance, Geo-fencing, Overtime Tracking, and Payroll integration coming in Phase 4.
        </div>
      </div>
    </div>
  );
}
