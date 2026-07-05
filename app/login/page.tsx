"use client";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import PoweredByBpro from "@/components/PoweredByBpro";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0F1629 0%, #1E1B4B 50%, #111827 100%)" }}
    >
      {/* Background blur blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(124,58,237,0.2)" }} />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none"
           style={{ background: "rgba(79,70,229,0.2)" }} />

      {/* Logo */}
      <div className="relative mb-7 flex flex-col items-center">
        <BrandLogo height={46} pill className="mb-3 shadow-xl" />
        <p className="text-slate-400 text-sm mt-1">Enterprise ERP System</p>
      </div>

      {/* Login card */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Gradient top strip */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #6366F1, #9333EA, #EC4899)" }} />

        <div className="px-8 pt-7 pb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Sign in</h2>
          <p className="text-sm text-slate-500 mb-6">Access your ZAG SIGNS ERP dashboard</p>

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
                autoComplete="email"
                placeholder="you@zagsigns.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Your password"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || status === "loading"}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2 transition-opacity shadow-md"
              style={{ background: "linear-gradient(135deg, #6366F1, #EC4899)" }}
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" /> Signing in…</>
                : "Sign in →"
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            New to ZAG SIGNS ERP?{" "}
            <a href="/signup" className="text-indigo-600 font-semibold hover:underline">Request Access</a>
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex flex-col items-center gap-2">
        <PoweredByBpro variant="dark" logoHeight={28} />
        <p className="text-xs text-slate-600">© 2026 ZAG SIGNS. Enterprise ERP · All rights reserved.</p>
      </div>
    </div>
  );
}
