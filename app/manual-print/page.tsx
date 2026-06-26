"use client";
// Standalone print page — bare route (no AppShell/sidebar).
// Opened in a popup by the Print button on /help/manual.
// ManualContent's PRINT_STYLE overrides globals.css visibility rules.
// Content renders visibly so the browser fully paints it before print fires.
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
    const t = setTimeout(triggerPrint, 800);
    return () => clearTimeout(t);
  }, []);

  return <ManualContent showButtons={false} />;
}
