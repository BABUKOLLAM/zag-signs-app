"use client";
import * as XLSX from "xlsx";

// Shared client-side helpers for batch (bulk) data upload.
// Flow: download template → user fills → upload → parse here → preview →
// POST rows to /api/<entity>/bulk which validates + skips duplicates.

export interface ColumnSpec {
  key: string;          // field name sent to the API
  label: string;        // human header shown in the template / preview
  required?: boolean;
  example?: string;     // sample value shown on the Instructions sheet
  hint?: string;        // guidance shown on the Instructions sheet
}

/** Parse an uploaded .xlsx / .xls / .csv File into row objects keyed by the header text. */
export async function parseSpreadsheet(file: File): Promise<Record<string, unknown>[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return [];
  // raw:false → dates/numbers come through as formatted strings (predictable)
  return XLSX.utils.sheet_to_json(ws, { defval: "", raw: false });
}

/**
 * Map a parsed row (keyed by human labels, possibly with a trailing " *")
 * to the API field keys defined in the column spec. Trims strings.
 */
export function mapRow(row: Record<string, unknown>, cols: ColumnSpec[]): Record<string, unknown> {
  // Build a lookup that ignores case, surrounding spaces and a trailing "*".
  const norm = (s: string) => s.replace(/\*/g, "").trim().toLowerCase();
  const lut: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) lut[norm(k)] = v;

  const out: Record<string, unknown> = {};
  for (const c of cols) {
    const v = lut[norm(c.label)] ?? lut[norm(c.key)] ?? "";
    out[c.key] = typeof v === "string" ? v.trim() : v;
  }
  return out;
}

/** True if every required column on the row has a non-empty value. */
export function missingRequired(mapped: Record<string, unknown>, cols: ColumnSpec[]): string[] {
  return cols
    .filter((c) => c.required)
    .filter((c) => {
      const v = mapped[c.key];
      return v === undefined || v === null || String(v).trim() === "";
    })
    .map((c) => c.label);
}

/**
 * Download a template .xlsx with two sheets:
 *  • "Data" — header row only, ready to fill
 *  • "Instructions" — per-column required flag, example and notes
 */
export function downloadTemplate(filename: string, cols: ColumnSpec[]) {
  const wb = XLSX.utils.book_new();

  // Data sheet — headers only (no example row, so nothing junk gets imported)
  const header = cols.map((c) => c.label + (c.required ? " *" : ""));
  const wsData = XLSX.utils.aoa_to_sheet([header]);
  wsData["!cols"] = cols.map((c) => ({ wch: Math.max(14, c.label.length + 4) }));
  XLSX.utils.book_append_sheet(wb, wsData, "Data");

  // Instructions sheet
  const instr: (string | undefined)[][] = [
    ["ZAG SIGNS — Bulk Upload Instructions"],
    [""],
    ["1. Enter your records in the 'Data' sheet, one per row, starting from row 2."],
    ["2. Columns marked with * are required."],
    ["3. Do not rename, delete or reorder the column headers."],
    ["4. Save the file (.xlsx or .csv) and upload it back into the app."],
    ["5. Duplicate records (already in the system) are skipped automatically and reported."],
    [""],
    ["Column", "Required", "Example", "Notes"],
    ...cols.map((c) => [c.label, c.required ? "Yes" : "No", c.example ?? "", c.hint ?? ""]),
  ];
  const wsInstr = XLSX.utils.aoa_to_sheet(instr);
  wsInstr["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 22 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstr, "Instructions");

  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export interface BulkResult {
  created: number;
  skipped: { row: number; reason: string }[];
  errors:  { row: number; reason: string }[];
}
