"use client";
// Standalone print page — bare route (no AppShell/sidebar).
// Opened in a popup by the Print button on /help/manual.
// globals.css @media print: body * hidden → only #zag-print-zone visible.
import { useEffect } from "react";
import ManualContent from "@/app/help/manual/ManualContent";

export default function ManualPrintPage() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="zag-print-zone">
      <ManualContent showButtons={false} />
    </div>
  );
}
