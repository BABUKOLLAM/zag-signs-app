"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, User, Shield, Mail, Building2, Lock } from "lucide-react";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent,     setShowCurrent]     = useState(false);
  const [showNew,         setShowNew]         = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState("");

  const strength = (() => {
    if (newPassword.length === 0) return 0;
    let s = 0;
    if (newPassword.length >= 8)          s++;
    if (/[A-Z]/.test(newPassword))        s++;
    if (/[0-9]/.test(newPassword))        s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPassword.length < 8)          { setError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to change password. Please try again.");
      } else {
        setSuccess("Password changed successfully.");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const roleColors: Record<string, string> = {
    "MD":               "bg-violet-100 text-violet-700",
    "AVP":              "bg-indigo-100 text-indigo-700",
    "Business Manager": "bg-blue-100 text-blue-700",
    "Sales Executive":  "bg-emerald-100 text-emerald-700",
    "CRES":             "bg-teal-100 text-teal-700",
    "Production":       "bg-orange-100 text-orange-700",
    "Accounts":         "bg-green-100 text-green-700",
    "HR":               "bg-rose-100 text-rose-700",
    "IT Admin":         "bg-slate-100 text-slate-600",
  };

  const initials = (user?.name ?? "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="My Profile" subtitle="Account" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Profile card */}
            <div
              className="rounded-2xl border p-6"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl font-bold shadow-md"
                  style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
                >
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                      {user?.name ?? "—"}
                    </h2>
                    {user?.role && (
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleColors[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{user?.email ?? "—"}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: User,      label: "Full name",  value: user?.name   },
                  { icon: Mail,      label: "Email",      value: user?.email  },
                  { icon: Shield,    label: "Role",       value: user?.role   },
                  { icon: Building2, label: "Branch",     value: user?.branch },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}
                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                    style={{ background: "var(--background)", border: "1px solid var(--card-border)" }}
                  >
                    <Icon size={15} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {value ?? "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change password card */}
            <div
              className="rounded-2xl border p-6"
              style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <Lock size={15} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Change Password</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Update your login password</p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm">
                  <CheckCircle2 size={15} className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Current password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={e => { setCurrentPassword(e.target.value); setError(""); setSuccess(""); }}
                      required
                      autoComplete="current-password"
                      placeholder="Your current password"
                      className="w-full border rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
                    />
                    <button type="button" onClick={() => setShowCurrent(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}
                      style={{ color: "var(--text-muted)" }}>
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    New password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setError(""); setSuccess(""); }}
                      required
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      className="w-full border rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      style={{ background: "var(--background)", borderColor: "var(--card-border)", color: "var(--text-primary)" }}
                    />
                    <button type="button" onClick={() => setShowNew(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}
                      style={{ color: "var(--text-muted)" }}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--card-border)" }}>
                        <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strength * 25}%` }} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                {/* Confirm new password */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => { setConfirmPassword(e.target.value); setError(""); setSuccess(""); }}
                      required
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                        confirmPassword.length > 0 && confirmPassword !== newPassword ? "border-red-300" : ""
                      }`}
                      style={{ background: "var(--background)", borderColor: confirmPassword.length > 0 && confirmPassword !== newPassword ? undefined : "var(--card-border)", color: "var(--text-primary)" }}
                    />
                    <button type="button" onClick={() => setShowConfirm(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" tabIndex={-1}
                      style={{ color: "var(--text-muted)" }}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-70 flex items-center gap-2 transition-opacity shadow-md"
                    style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
                  >
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                      : "Update password"
                    }
                  </button>
                </div>
              </form>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
