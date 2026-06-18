"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function ApproveContent() {
  const searchParams = useSearchParams();
  const token  = searchParams.get("token");
  const action = searchParams.get("action");
  const [state, setState] = useState<"loading"|"approved"|"rejected"|"error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !action) { setState("error"); setMessage("Invalid approval link."); return; }

    fetch(`/api/auth/approve?token=${token}&action=${action}`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.action === "approved") setState("approved");
        else if (data.data?.action === "rejected") setState("rejected");
        else { setState("error"); setMessage(data.error ?? "Something went wrong."); }
      })
      .catch(() => { setState("error"); setMessage("Network error. Please try again."); });
  }, [token, action]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
        <Building2 size={24} className="text-white" />
      </div>

      {state === "loading" && (
        <>
          <Loader2 size={36} className="animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-500">Processing approval…</p>
        </>
      )}

      {state === "approved" && (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">User Approved</h2>
          <p className="text-slate-500 mb-6">
            The user&apos;s account has been activated. They will receive a welcome email with login instructions.
          </p>
          <Link href="/admin/users"
            className="inline-block w-full py-3 rounded-xl text-white font-semibold text-center mb-3"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            Manage Users
          </Link>
          <Link href="/dashboard" className="block text-sm text-indigo-500 hover:underline">
            Go to Dashboard
          </Link>
        </>
      )}

      {state === "rejected" && (
        <>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">User Rejected</h2>
          <p className="text-slate-500 mb-6">The account request has been rejected.</p>
          <Link href="/admin/users"
            className="inline-block w-full py-3 rounded-xl text-white font-semibold text-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            Manage Users
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Link Error</h2>
          <p className="text-slate-500 mb-6">{message}</p>
          <Link href="/admin/users"
            className="inline-block w-full py-3 rounded-xl text-white font-semibold text-center"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            Manage Users Panel
          </Link>
        </>
      )}
    </div>
  );
}

export default function ApprovePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #0F1629 0%, #1E1B4B 50%, #111827 100%)" }}>
      <Suspense fallback={
        <div className="bg-white rounded-3xl p-10 text-center">
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
        </div>
      }>
        <ApproveContent />
      </Suspense>
    </div>
  );
}
