"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import MobileBottomNav from "./MobileBottomNav";
import RouteGuard from "./RouteGuard";
import { useSidebar } from "@/lib/sidebar-context";

function ShellContent({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <Sidebar />
      {/* Mobile overlay backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      {/* Main content — extra bottom padding on mobile for bottom nav */}
      <div className="lg:ml-64 min-h-screen flex flex-col pb-16 lg:pb-0">
        <RouteGuard>{children}</RouteGuard>
      </div>
      {/* Mobile bottom navigation */}
      <MobileBottomNav />
    </>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ShellContent>{children}</ShellContent>
    </SessionProvider>
  );
}
