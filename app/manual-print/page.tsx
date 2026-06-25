"use client";
// Standalone print page — no sidebar, no AppShell chrome.
// Loaded by /api/manual/pdf redirect and the "Save as PDF" buttons.
import { useEffect } from "react";
import ManualContent from "@/app/help/manual/ManualContent";

export default function ManualPrintPage() {
  // Auto-trigger print dialog once the page has fully rendered
  useEffect(() => {
    const t = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(t);
  }, []);

  return <ManualContent />;
}
