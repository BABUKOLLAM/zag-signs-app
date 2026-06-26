"use client";
import ManualContent from "./ManualContent";

export default function ManualPage() {
  return (
    <>
      {/* Screen view — with buttons */}
      <ManualContent />

      {/* Print zone — same pattern as quotations/invoices.
          Invisible on screen (global CSS pushes it off-screen).
          During window.print(): body * hidden, only this div visible. */}
      <div id="zag-print-zone">
        <ManualContent showButtons={false} />
      </div>
    </>
  );
}
