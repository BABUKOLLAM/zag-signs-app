"use client";
import { useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import PoweredByBpro from "@/components/PoweredByBpro";

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [sent, setSent]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
        <div className="px-8 pt-7 pb-8">
          {sent ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                If <span className="font-medium text-slate-700">{email}</span> is registered, we've sent a password reset link. Check your email and click the link within 1 hour.
              </p>
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">Forgot password?</h2>
                  <p className="text-xs text-slate-500">We'll send a reset link to your email.</p>
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    autoComplete="email"
                    placeholder="you@zagsigns.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2 transition-opacity shadow-md"
                  style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
                >
                  {loading
                    ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    : "Send reset link →"
                  }
                </button>
              </form>

              <div className="flex justify-center mt-5">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back to Sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-2">
        <PoweredByBpro variant="dark" logoHeight={28} />
        <p className="text-xs text-slate-600">© 2026 ZAG SIGNS. Enterprise ERP · All rights reserved.</p>
      </div>
    </div>
  );
}
