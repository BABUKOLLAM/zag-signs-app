"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { uploadToDrive, isDriveConfigured } from "@/lib/google-drive";
import { useToast } from "@/components/Toaster";

interface Props {
  filename: string;
  rows: Record<string, unknown>[];
  /** Optional: supply a pre-built Blob (e.g. PDF) instead of building Excel from rows */
  blob?: Blob;
  mimeHint?: string;
}

type Status = "idle" | "busy" | "done" | "error";

export default function DriveButton({ filename, rows, blob, mimeHint }: Props) {
  const toast = useToast();
  const [status, setStatus] = useState<Status>("idle");
  const [show, setShow] = useState(false);

  // Resolve Drive config at runtime so the button appears once the env vars are
  // set in Vercel — no rebuild required.
  useEffect(() => { isDriveConfigured().then(setShow).catch(() => setShow(false)); }, []);

  if (!show) return null;

  const handleClick = async () => {
    if (status === "busy") return;
    setStatus("busy");
    try {
      let file: Blob;
      if (blob) {
        file = blob;
      } else {
        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
        file = new Blob([buf], {
          type: mimeHint ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      }

      const url = await uploadToDrive(filename, file);
      setStatus("done");
      toast.success("Saved to Google Drive");
      window.open(url, "_blank");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      toast.error(err instanceof Error ? err.message : "Drive upload failed");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  const label = status === "busy" ? "Uploading…" : status === "done" ? "Saved!" : "Drive";
  const disabled = status === "busy" || rows.length === 0;

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      title="Save to Google Drive"
      className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-3 py-2 rounded-lg disabled:opacity-40"
    >
      {/* Google Drive icon (simplified) */}
      <svg width="14" height="14" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00AC47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 57.5c.8-1.4 1.2-2.95 1.2-4.5H59.8L73.55 76.8z" fill="#EA4335"/>
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2z" fill="#00832D"/>
        <path d="M59.8 53H87.3c0-1.55-.4-3.1-1.2-4.5L60.8 4.5c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25z" fill="#2684FC"/>
        <path d="M27.5 53L13.75 76.8c1.35.8 2.9 1.2 4.45 1.2h50.9c1.55 0 3.1-.4 4.45-1.2L59.8 53z" fill="#FFBA00"/>
      </svg>
      {label}
    </button>
  );
}
