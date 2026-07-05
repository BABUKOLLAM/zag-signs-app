import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--bg-base, #f8fafc)" }}>
      <div className="max-w-md w-full rounded-2xl p-8 text-center shadow-sm"
        style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--card-border, #e2e8f0)" }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-indigo-50">
          <Compass size={28} className="text-indigo-500" />
        </div>
        <h1 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary, #0f172a)" }}>
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted, #64748b)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#4F46E5,#6366F1)" }}>
          <Home size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
