"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldX, Loader2, Home } from "lucide-react";
import { canAccess, isGuardedPath, homePath } from "@/lib/permissions";

/**
 * Blocks rendering of a guarded module page when the signed-in role lacks
 * access. The NextAuth middleware already enforces authentication; this adds
 * per-role authorization on top, including direct-URL navigation.
 */
export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Only gate known module pages — root redirect, 404s, etc. pass through.
  if (!isGuardedPath(pathname)) return <>{children}</>;

  // Wait for the session to resolve before deciding (avoids a denied flash).
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 size={26} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  const role = session?.user?.role;
  if (canAccess(role, pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <ShieldX size={26} className="text-red-500" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">Access restricted</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your role{role ? ` (${role})` : ""} doesn&apos;t have permission to view this module.
          If you believe this is a mistake, contact your administrator.
        </p>
        <Link
          href={homePath()}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 transition-colors"
        >
          <Home size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
