"use client";
// Standalone print page — bare route (no AppShell/sidebar).
// Opened in a popup by the Print button on /help/manual.
// Waits for all images to load before triggering print so logos appear.
import { useEffect } from "react";
import ManualContent from "@/app/help/manual/ManualContent";

export default function ManualPrintPage() {
  useEffect(() => {
    const triggerPrint = () => {
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
      const pending = imgs.filter(img => !img.complete);
      if (pending.length === 0) {
        setTimeout(() => window.print(), 400);
        return;
      }
      let loaded = 0;
      const onSettle = () => {
        loaded++;
        if (loaded >= pending.length) setTimeout(() => window.print(), 400);
      };
      pending.forEach(img => {
        img.addEventListener("load", onSettle, { once: true });
        img.addEventListener("error", onSettle, { once: true });
      });
    };
    // Give React a moment to fully render before checking images
    const t = setTimeout(triggerPrint, 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div id="zag-print-zone">
      <ManualContent showButtons={false} />
    </div>
  );
}
