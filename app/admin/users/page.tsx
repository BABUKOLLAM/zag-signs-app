"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/use-api";
import {
  Users, Plus, CheckCircle2, XCircle, Edit2, RefreshCw,
  Shield, Building2, Phone, Mail, Search, Filter, Loader2,
} from "lucide-react";

type UserRecord = {
  id: string; name: string; email: string; role: string; branch: string;
  phone: string; status: string; isActive: boolean; createdAt: string;
  reportingTo: string; reportingToId: string;
};

const ROLES = [
  { value: "MD",               label: "MD" },
  { value: "AVP",              label: "AVP" },
  { value: "BUSINESS_MANAGER", label: "Business Manager" },
  { value: "SALES_EXECUTIVE",  label: "Sales Executive" },
  { value: "CRES",             label: "CRES" },
  { value: "PRODUCTION",       label: "Production" },
  { value: "DESIGNER",         label: "Designer" },
  { value: "ACCOUNTS",         label: "Accounts" },
  { value: "HR",               label: "HR" },
  { value: "IT_ADMIN",         label: "IT Admin" },
];
const BRANCHES = ["TVM","KTYM","EKM","CLT"];
const ALL_BRANCH_ROLES = ["MD","AVP","HR","IT_ADMIN"];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   "bg-emerald-100 text-emerald-700",
  PENDING:  "bg-amber-100   text-amber-700",
  REJECTED: "bg-red-100     text-red-700",
  INACTIVE: "bg-slate-100   text-slate-500",
};

export default function UsersPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const role = (session?.user as { role?: string })?.role ?? "";
  const isAdmin = ["MD","IT Admin","IT_ADMIN","AVP"].some(r =>
    role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_")
  );

  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState(""); // status filter
  const [editing, setEditing]   = useState<UserRecord | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState("");

  const [newUser, setNewUser] = useState({
    name:"", email:"", password:"", role:"", branch:"", phone:"", status:"ACTIVE",
  });
  const [editForm, setEditForm] = useState<{ role?: string; branch?: string; phone?: string; status?: string; password?: string; reportingToId?: string }>({});

  const url = `/api/users?${new URLSearchParams({ ...(filter ? {status:filter}:{}), ...(search?{search}:{}) })}`;
  const { data: rawUsers, loading, refetch } = useApi<UserRecord[]>(url);
  const users = rawUsers ?? [];

  // Redirect if not admin
  if (sessionStatus === "loading") return <div className="p-10 text-slate-500">Loading…</div>;
  if (sessionStatus === "authenticated" && !isAdmin) { router.replace("/dashboard"); return null; }

  async function approve(id: string) {
    setSaving(true);
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    setSaving(false); refetch(); setMsg("User approved.");
    setTimeout(() => setMsg(""), 3000);
  }

  async function reject(id: string) {
    setSaving(true);
    await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REJECTED" }),
    });
    setSaving(false); refetch();
  }

  async function deactivate(id: string) {
    if (!confirm("Deactivate this user?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    refetch();
  }

  async function saveEdit() {
    if (!editing) return;
    setSaving(true);
    await fetch(`/api/users/${editing.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    setSaving(false); setEditing(null); refetch();
  }

  async function createUser() {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      setMsg("Name, email, password, and role are required."); return;
    }
    setSaving(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    setSaving(false);
    if (!res.ok) { const d = await res.json(); setMsg(d.error ?? "Error"); return; }
    setCreating(false);
    setNewUser({ name:"",email:"",password:"",role:"",branch:"",phone:"",status:"ACTIVE" });
    refetch();
  }

  const pendingCount = users.filter(u => u.status === "PENDING").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users size={24} className="text-indigo-600" /> User Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage accounts, roles, branches and hierarchy</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {msg && <div className="mb-4 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">{msg}</div>}

      {/* Pending banner */}
      {pendingCount > 0 && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-xs flex items-center justify-center font-bold">{pendingCount}</span>
          <span className="text-amber-800 text-sm font-medium">pending account{pendingCount > 1 ? "s" : ""} awaiting approval</span>
          <button onClick={() => setFilter("PENDING")} className="ml-auto text-xs text-amber-700 underline">View</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Search name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="REJECTED">Rejected</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button onClick={refetch} className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Branch</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reports To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading && (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">
                <Loader2 size={20} className="animate-spin mx-auto mb-1" />Loading…
              </td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={7} className="text-center py-10 text-slate-400">No users found</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                      {u.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    {u.role.replace(/_/g," ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{u.branch}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.reportingTo || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[u.status] ?? "bg-slate-100 text-slate-500"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.createdAt}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {u.status === "PENDING" && (
                      <>
                        <button onClick={() => approve(u.id)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                          title="Approve">
                          <CheckCircle2 size={15} />
                        </button>
                        <button onClick={() => reject(u.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500"
                          title="Reject">
                          <XCircle size={15} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { setEditing(u); setEditForm({ role: u.role, branch: u.branch === "All" ? "" : (u.branch || undefined), phone: u.phone || undefined, status: u.status, reportingToId: u.reportingToId || undefined }); }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500"
                      title="Edit">
                      <Edit2 size={15} />
                    </button>
                    {u.status === "ACTIVE" && (
                      <button onClick={() => deactivate(u.id)}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500"
                        title="Deactivate">
                        <XCircle size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Edit2 size={18} className="text-indigo-500" /> Edit User: {editing.name}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role</label>
                  <select value={editForm.role ?? ""} onChange={e => setEditForm(f => ({...f, role: e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={editForm.branch ?? ""} onChange={e => setEditForm(f => ({...f, branch: e.target.value || undefined}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    disabled={ALL_BRANCH_ROLES.includes(editForm.role ?? "")}>
                    <option value="">All Branches</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select value={editForm.status ?? ""} onChange={e => setEditForm(f => ({...f, status: e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="PENDING">Pending</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input value={editForm.phone ?? ""} onChange={e => setEditForm(f => ({...f, phone: e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    placeholder="+91 9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reports To (User ID or leave blank)</label>
                <select value={editForm.reportingToId ?? ""} onChange={e => setEditForm(f => ({...f, reportingToId: e.target.value || undefined}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="">None</option>
                  {users.filter(u => u.id !== editing.id && u.status === "ACTIVE").map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role.replace(/_/g," ")})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reset Password (leave blank to keep)</label>
                <input type="password" placeholder="New password (min 8 chars)"
                  onChange={e => setEditForm(f => ({...f, password: e.target.value || undefined}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-500" /> Add New User
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name *</label>
                  <input value={newUser.name} onChange={e => setNewUser(f=>({...f,name:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Full name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email *</label>
                  <input type="email" value={newUser.email} onChange={e => setNewUser(f=>({...f,email:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="email@zagsigns.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Role *</label>
                  <select value={newUser.role} onChange={e => setNewUser(f=>({...f,role:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                    <option value="">Select…</option>
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Branch</label>
                  <select value={newUser.branch} onChange={e => setNewUser(f=>({...f,branch:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                    disabled={ALL_BRANCH_ROLES.includes(newUser.role)}>
                    <option value="">All Branches</option>
                    {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Password *</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser(f=>({...f,password:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="Min 8 chars" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                  <input value={newUser.phone} onChange={e => setNewUser(f=>({...f,phone:e.target.value}))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" placeholder="+91 …" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Status</label>
                <select value={newUser.status} onChange={e => setNewUser(f=>({...f,status:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm">
                  <option value="ACTIVE">Active (immediate access)</option>
                  <option value="PENDING">Pending (needs approval)</option>
                </select>
              </div>
            </div>
            {msg && <p className="text-red-500 text-xs mt-2">{msg}</p>}
            <div className="flex gap-3 mt-5">
              <button onClick={createUser} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}>
                {saving ? "Creating…" : "Create User"}
              </button>
              <button onClick={() => { setCreating(false); setMsg(""); }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
