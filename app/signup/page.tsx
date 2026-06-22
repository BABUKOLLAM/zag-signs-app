"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";

const ROLES = [
  { value: "MD",               label: "MD (Managing Director)" },
  { value: "AVP",              label: "AVP" },
  { value: "BUSINESS_MANAGER", label: "Business Manager" },
  { value: "SALES_EXECUTIVE",  label: "Sales Executive" },
  { value: "CRES",             label: "CRES (Customer Relations)" },
  { value: "PRODUCTION",       label: "Production" },
  { value: "DESIGNER",         label: "Designer" },
  { value: "ACCOUNTS",         label: "Accounts" },
  { value: "HR",               label: "HR" },
  { value: "IT_ADMIN",         label: "IT Admin" },
];
const BRANCHES = [
  { value: "TVM",  label: "Thiruvananthapuram (TVM)" },
  { value: "KTYM", label: "Kottayam (KTYM)" },
  { value: "EKM",  label: "Ernakulam (EKM)" },
  { value: "CLT",  label: "Calicut (CLT)" },
];
const ALL_BRANCH_ROLES = ["MD","AVP","HR","IT_ADMIN"];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    role: "", branch: "", phone: "",
  });
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const needsBranch = form.role && !ALL_BRANCH_ROLES.includes(form.role);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     form.name.trim(),
        email:    form.email.trim(),
        password: form.password,
        role:     form.role,
        branch:   needsBranch ? form.branch : undefined,
        phone:    form.phone.trim() || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #0F1629 0%, #1E1B4B 50%, #111827 100%)" }}>
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Submitted!</h2>
          <p className="text-slate-500 mb-6">
            Your account request has been sent to the IT Admin / MD for approval.
            You will receive an email once approved.
          </p>
          <Link href="/login"
            className="inline-block w-full py-3 rounded-xl text-white font-semibold text-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: "linear-gradient(135deg, #0F1629 0%, #1E1B4B 50%, #111827 100%)" }}>
      {/* Logo */}
      <div className="flex flex-col items-center mb-7">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-xl"
          style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
          <Building2 size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">ZAG SIGNS ERP</h1>
        <p className="text-slate-400 text-sm mt-0.5">Create your account</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Sign Up</h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name *</label>
            <input
              type="text" value={form.name} onChange={e => set("name", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Dr. Babu B" required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work Email *</label>
            <input
              type="email" value={form.email} onChange={e => set("email", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="you@zagsigns.com" required
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role *</label>
            <select
              value={form.role} onChange={e => set("role", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            >
              <option value="">Select your role…</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* Branch — only for branch-specific roles */}
          {needsBranch && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Branch *</label>
              <select
                value={form.branch} onChange={e => set("branch", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              >
                <option value="">Select branch…</option>
                {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone (optional)</label>
            <input
              type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="+91 9876543210"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={form.password} onChange={e => set("password", e.target.value)}
                className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="At least 8 characters" required minLength={8}
              />
              <button type="button" onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
            <input
              type={showPass ? "text" : "password"}
              value={form.confirm} onChange={e => set("confirm", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Repeat password" required
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            {loading ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : "Submit Request"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-600 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
