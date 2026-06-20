"use client";
import { useState, useCallback, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { api } from "@/lib/api-client";
import { MODULE_GROUPS, defaultModulesForRole } from "@/lib/permissions";
import { Shield, ChevronRight, RotateCcw, Save, Check, X, Search } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  MD:               "bg-purple-100 text-purple-700",
  AVP:              "bg-indigo-100 text-indigo-700",
  Consultant:       "bg-blue-100 text-blue-700",
  "IT Admin":       "bg-slate-100 text-slate-700",
  "Business Manager": "bg-teal-100 text-teal-700",
  "Sales Executive": "bg-green-100 text-green-700",
  CRES:             "bg-cyan-100 text-cyan-700",
  Production:       "bg-orange-100 text-orange-700",
  Accounts:         "bg-emerald-100 text-emerald-700",
  HR:               "bg-rose-100 text-rose-700",
};

const GROUP_COLORS: Record<string, string> = {
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
  blue:   "bg-blue-50 border-blue-200 text-blue-700",
  green:  "bg-green-50 border-green-200 text-green-700",
  orange: "bg-orange-50 border-orange-200 text-orange-700",
  emerald:"bg-emerald-50 border-emerald-200 text-emerald-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  rose:   "bg-rose-50 border-rose-200 text-rose-700",
  slate:  "bg-slate-50 border-slate-200 text-slate-700",
};

interface UserRow {
  id: string; name: string; email: string; role: string;
  branch: string; isActive: boolean;
  customModules: string[] | null;
  lastUpdated: string | null;
}

export default function PrivilegesPage() {
  const [users, setUsers]       = useState<UserRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<UserRow | null>(null);
  const [modules, setModules]   = useState<string[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: UserRow[] }>("/admin/privileges");
      setUsers(res.data ?? []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openUser = (u: UserRow) => {
    setSelected(u);
    if (u.customModules !== null) {
      setModules(u.customModules);
      setIsCustom(true);
    } else {
      const defs = defaultModulesForRole(u.role);
      setModules(defs.includes("*") ? ALL_PATHS : defs);
      setIsCustom(false);
    }
  };

  const ALL_PATHS = MODULE_GROUPS.flatMap((g) => g.items.map((i) => i.path));

  const toggle = (path: string) => {
    setIsCustom(true);
    setModules((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  };

  const toggleGroup = (paths: string[]) => {
    setIsCustom(true);
    const allOn = paths.every((p) => modules.includes(p));
    setModules((prev) =>
      allOn ? prev.filter((p) => !paths.includes(p)) : [...new Set([...prev, ...paths])]
    );
  };

  const resetToDefaults = () => {
    if (!selected) return;
    const defs = defaultModulesForRole(selected.role);
    setModules(defs.includes("*") ? ALL_PATHS : defs);
    setIsCustom(false);
  };

  const grantAll = () => { setModules(ALL_PATHS); setIsCustom(true); };
  const revokeAll = () => { setModules([]); setIsCustom(true); };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      // If !isCustom, send null → API deletes the override → role defaults apply
      const payload = isCustom ? modules : null;
      await api.put(`/admin/privileges/${selected.id}`, { modules: payload });
      showToast("Privileges saved.", true);
      await loadUsers();
      // Update the selected user's state
      setSelected((prev) => prev ? { ...prev, customModules: payload, lastUpdated: new Date().toISOString().split("T")[0] } : null);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopBar title="Privilege Settings" />
      <div className="p-4 md:p-6">
        <div className="flex gap-4 h-[calc(100vh-120px)]">

          {/* ── LEFT: User list ───────────────────────────────────────── */}
          <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                <Search size={13} className="text-gray-400" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users…"
                  className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">No users found.</div>
              ) : filtered.map((u) => (
                <button key={u.id} onClick={() => openUser(u)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-indigo-50 transition-colors flex items-start justify-between gap-2 ${
                    selected?.id === u.id ? "bg-indigo-50 border-l-2 border-l-indigo-500" : ""
                  }`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">{u.name}</span>
                      {!u.isActive && <span className="text-xs text-gray-400">(inactive)</span>}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {u.role}
                    </span>
                    {u.customModules !== null && (
                      <span className="ml-1.5 text-xs text-indigo-600 font-medium">custom</span>
                    )}
                  </div>
                  <ChevronRight size={13} className="text-gray-300 mt-1 flex-shrink-0" />
                </button>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
              {users.length} users · <span className="text-indigo-600">{users.filter(u => u.customModules !== null).length} customised</span>
            </div>
          </div>

          {/* ── RIGHT: Module editor ──────────────────────────────────── */}
          {!selected ? (
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Shield size={36} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">Select a user to configure their privileges</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-gray-100">
                <div>
                  <h2 className="font-bold text-gray-900">{selected.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[selected.role] ?? "bg-gray-100 text-gray-600"}`}>
                      {selected.role}
                    </span>
                    <span className="text-xs text-gray-400">{selected.email}</span>
                    {isCustom ? (
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Custom permissions</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Role defaults</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={revokeAll} title="Remove all"
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 rounded-lg px-2.5 py-1.5">
                    <X size={11} /> None
                  </button>
                  <button onClick={grantAll} title="Grant all"
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 border border-green-200 hover:border-green-400 rounded-lg px-2.5 py-1.5">
                    <Check size={11} /> All
                  </button>
                  <button onClick={resetToDefaults}
                    className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-lg px-2.5 py-1.5">
                    <RotateCcw size={11} /> Reset to role defaults
                  </button>
                  <button onClick={save} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium">
                    <Save size={13} /> {saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>

              {/* Module checkboxes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MODULE_GROUPS.map((grp) => {
                  const grpPaths = grp.items.map((i) => i.path);
                  const allOn = grpPaths.every((p) => modules.includes(p));
                  const someOn = grpPaths.some((p) => modules.includes(p));
                  return (
                    <div key={grp.group} className={`rounded-xl border p-3 ${GROUP_COLORS[grp.color] ?? GROUP_COLORS.slate}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold tracking-wide uppercase">{grp.group}</span>
                        <button onClick={() => toggleGroup(grpPaths)}
                          className={`text-xs px-2 py-0.5 rounded-md border transition-colors ${
                            allOn ? "bg-white/80 border-current font-medium" : someOn ? "bg-white/50 border-current/50" : "bg-transparent border-transparent opacity-60"
                          }`}>
                          {allOn ? "Deselect all" : "Select all"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {grp.items.map((item) => {
                          const on = modules.includes(item.path);
                          return (
                            <label key={item.path}
                              className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-3 py-2 transition-colors ${
                                on ? "bg-white shadow-sm" : "bg-white/30 hover:bg-white/60"
                              }`}>
                              <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                                on ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"
                              }`}
                                onClick={() => toggle(item.path)}>
                                {on && <Check size={10} className="text-white" strokeWidth={3} />}
                              </div>
                              <span className={`text-xs ${on ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                                {item.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer summary */}
              <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {modules.length} of {ALL_PATHS.length} modules enabled
                  {selected.lastUpdated && ` · last updated ${selected.lastUpdated}`}
                </span>
                <div className="flex gap-1 flex-wrap justify-end max-w-xs">
                  {MODULE_GROUPS.map((g) => {
                    const on = g.items.filter((i) => modules.includes(i.path)).length;
                    const total = g.items.length;
                    return on > 0 ? (
                      <span key={g.group} className={`text-xs px-1.5 py-0.5 rounded ${GROUP_COLORS[g.color] ?? GROUP_COLORS.slate}`}>
                        {g.group.split(" ")[0]}: {on}/{total}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.ok ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
        </div>
      )}
    </div>
  );
}
