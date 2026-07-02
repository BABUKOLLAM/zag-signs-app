"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import PoweredByBpro from "@/components/PoweredByBpro";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") ?? "";

  const [password,   setPassword]   = useState("");
  const [confirm,    setConfirm]    = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [showConf,   setShowConf]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    if (!token) setError("No reset token found. Please request a new password reset link.");
  }, [token]);

  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 8)  s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8)        { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm)        { setError("Passwords do not match."); return; }
    if (!token)                      { setError("Invalid reset link. Please request a new one."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.replace("/login"), 3000);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-8 pt-7 pb-8">
      {success ? (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Password updated!</h2>
          <p className="text-sm text-slate-500 mb-2">Your password has been changed successfully.</p>
          <p className="text-xs text-slate-400 mb-6">Redirecting to sign in…</p>
          <Link
            href="/login"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Sign in now →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <KeyRound size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">Set new password</h2>
              <p className="text-xs text-slate-500">Choose a strong password for your account.</p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(""); }}
                  required
                  autoFocus
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strengthColor}`} style={{ width: `${strength * 25}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm password</label>
              <div className="relative">
                <input
                  type={showConf ? "text" : "password"}
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(""); }}
                  required
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className={`w-full border rounded-xl px-4 py-2.5 pr-11 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all ${
                    confirm.length > 0 && confirm !== password ? "border-red-300" : "border-slate-200"
                  }`}
                />
                <button type="button" onClick={() => setShowConf(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && confirm !== password && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2 transition-opacity shadow-md"
              style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                : "Update password →"
              }
            </button>
          </form>

          <div className="flex justify-center mt-5">
            <Link href="/login" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">
              ← Back to Sign in
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0F1629 0%, #1E1B4B 50%, #111827 100%)" }}
    >
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(124,58,237,0.2)" }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(79,70,229,0.2)" }} />

      <div className="relative mb-7 flex flex-col items-center">
        <BrandLogo height={46} pill className="mb-3 shadow-xl" />
        <p className="text-slate-400 text-sm mt-1">Enterprise ERP System</p>
      </div>

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1" style={{ background: "linear-gradient(90deg, #6366F1, #9333EA, #EC4899)" }} />
        <Suspense fallback={<div className="px-8 py-12 text-center text-slate-400 text-sm">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-2">
        <PoweredByBpro variant="dark" logoHeight={28} />
        <p className="text-xs text-slate-600">© 2026 ZAG SIGNS. Enterprise ERP · All rights reserved.</p>
      </div>
    </div>
  );
}
