"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/lib/sidebar-context";

// Inner component can safely call useSidebar (provided by SidebarProvider above in tree)
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

  // Login page renders full-screen — no sidebar / shell
  if (pathname === "/login") return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {children}
      </div>
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
