"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ShieldX, Loader2, Home } from "lucide-react";
import { isGuardedPath, homePath } from "@/lib/permissions";
import { usePermissions } from "@/lib/permission-context";

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const { canUse, loading: permLoading } = usePermissions();

  // Non-guarded paths (login page, 404s) always pass through.
  if (!isGuardedPath(pathname)) return <>{children}</>;

  // Show spinner while session or permission overrides are loading.
  if (status === "loading" || permLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 size={26} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (canUse(pathname)) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <ShieldX size={26} className="text-red-500" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-slate-900">Access restricted</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          You don&apos;t have permission to view this module.
          Contact your IT Admin or Consultant to request access.
        </p>
        <Link href={homePath()}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-4 py-2 transition-colors">
          <Home size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
