"use client";
import { useEffect } from "react";
import Sidebar from "./Sidebar";
import { useSidebar } from "@/lib/sidebar-context";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { open, close } = useSidebar();

  // Register service worker once on mount
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Lock body scroll while mobile sidebar is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Sidebar />

      {/* Mobile backdrop — tapping it closes the sidebar */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      {/* Main content area — offset by sidebar width on desktop only */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {children}
      </div>
    </>
  );
}
