"use client";
import { useState, useRef } from "react";
import { api } from "@/lib/api-client";
import {
  parseSpreadsheet, mapRow, missingRequired, downloadTemplate,
  type ColumnSpec, type BulkResult,
} from "@/lib/import";
import {
  X, Download, Upload, FileSpreadsheet, CheckCircle2,
  AlertTriangle, Loader2, ArrowLeft,
} from "lucide-react";

interface Props {
  title: string;                 // e.g. "Import Customers"
  endpoint: string;              // e.g. "/customers/bulk"
  templateName: string;          // e.g. "zag-customers-template"
  columns: ColumnSpec[];
  onClose: () => void;
  onDone?: (result: BulkResult) => void;
}

type Stage = "upload" | "preview" | "result";

interface PreviewRow {
  rowNo: number;                 // 1-based data row (matches spreadsheet)
  mapped: Record<string, unknown>;
  missing: string[];
}

export default function BatchImportModal({ title, endpoint, templateName, columns, onClose, onDone }: Props) {
  const [stage, setStage] = useState<Stage>("upload");
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkResult | null>(null);
  const [parseError, setParseError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validCount = rows.filter((r) => r.missing.length === 0).length;
  const invalidCount = rows.length - validCount;

  const handleFile = async (file: File) => {
    setParseError("");
    setParsing(true);
    try {
      const raw = await parseSpreadsheet(file);
      if (!raw.length) { setParseError("The file has no data rows."); setParsing(false); return; }
      const mapped: PreviewRow[] = raw.map((r, i) => {
        const m = mapRow(r, columns);
        return { rowNo: i + 2, mapped: m, missing: missingRequired(m, columns) };
      });
      setRows(mapped);
      setFileName(file.name);
      setStage("preview");
    } catch {
      setParseError("Could not read this file. Use the template (.xlsx) or a .csv with the same headers.");
    } finally {
      setParsing(false);
    }
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async () => {
    const payload = rows.filter((r) => r.missing.length === 0).map((r) => ({ ...r.mapped, __row: r.rowNo }));
    if (!payload.length) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ data: BulkResult }>(endpoint, { rows: payload });
      setResult(res.data);
      setStage("result");
      onDone?.(res.data);
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b border-gray-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {stage !== "upload" && stage !== "result" && (
              <button onClick={() => setStage("upload")} className="p-1 rounded hover:bg-gray-100 text-gray-500"><ArrowLeft size={16} /></button>
            )}
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><X size={16} /></button>
        </div>

        <div className="p-5 overflow-y-auto">
          {/* ── STAGE: UPLOAD ── */}
          {stage === "upload" && (
            <div className="space-y-4">
              <ol className="text-sm text-gray-600 space-y-1.5 list-decimal list-inside">
                <li>Download the template and fill in your data.</li>
                <li>Required columns are marked with <span className="font-semibold">*</span>.</li>
                <li>Upload the completed file — you&apos;ll preview before anything is saved.</li>
              </ol>

              <button onClick={() => downloadTemplate(templateName, columns)}
                className="flex items-center gap-2 text-sm font-medium text-indigo-700 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-lg px-4 py-2">
                <Download size={15} /> Download Template (.xlsx)
              </button>

              <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition">
                {parsing ? (
                  <div className="flex flex-col items-center text-gray-500">
                    <Loader2 size={28} className="animate-spin text-indigo-500" />
                    <p className="mt-2 text-sm">Reading file…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <FileSpreadsheet size={32} className="text-indigo-400" />
                    <p className="mt-2 text-sm font-medium text-gray-700">Click to choose, or drag a file here</p>
                    <p className="text-xs text-gray-400 mt-0.5">.xlsx, .xls or .csv</p>
                  </div>
                )}
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onPick} />
              </div>

              <div className="text-xs text-gray-500">
                <span className="font-semibold">Columns:</span> {columns.map((c) => c.label + (c.required ? "*" : "")).join(", ")}
              </div>

              {parseError && <p className="text-sm text-red-600">{parseError}</p>}
            </div>
          )}

          {/* ── STAGE: PREVIEW ── */}
          {stage === "preview" && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-gray-600">File: <span className="font-medium text-gray-900">{fileName}</span></span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">{validCount} ready</span>
                {invalidCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{invalidCount} need fixing</span>
                )}
              </div>

              {invalidCount > 0 && (
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <AlertTriangle size={13} /> Rows missing required fields are highlighted and will be skipped.
                </p>
              )}

              <div className="border border-gray-200 rounded-lg overflow-auto max-h-[45vh]">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold text-gray-500">#</th>
                      {columns.map((c) => (
                        <th key={c.key} className="px-2 py-1.5 text-left font-semibold text-gray-500 whitespace-nowrap">
                          {c.label}{c.required && <span className="text-red-500">*</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((r) => (
                      <tr key={r.rowNo} className={`border-t border-gray-100 ${r.missing.length ? "bg-amber-50" : ""}`}>
                        <td className="px-2 py-1.5 text-gray-400">{r.rowNo}</td>
                        {columns.map((c) => {
                          const v = r.mapped[c.key];
                          const isMissing = r.missing.includes(c.label);
                          return (
                            <td key={c.key} className={`px-2 py-1.5 whitespace-nowrap ${isMissing ? "text-red-500 italic" : "text-gray-800"}`}>
                              {isMissing ? "missing" : (v === "" || v == null ? "—" : String(v))}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 100 && <p className="text-xs text-gray-400">Showing first 100 of {rows.length} rows. All valid rows will be imported.</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setStage("upload")} className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Back</button>
                <button onClick={handleSubmit} disabled={validCount === 0 || submitting}
                  className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium disabled:opacity-60 flex items-center gap-1.5">
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Importing…</> : <><Upload size={14} /> Import {validCount} record{validCount === 1 ? "" : "s"}</>}
                </button>
              </div>
              {parseError && <p className="text-sm text-red-600">{parseError}</p>}
            </div>
          )}

          {/* ── STAGE: RESULT ── */}
          {stage === "result" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 size={24} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{result.created} record{result.created === 1 ? "" : "s"} imported</p>
                  <p className="text-sm text-gray-500">
                    {result.skipped.length} skipped · {result.errors.length} error{result.errors.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {result.skipped.length > 0 && (
                <Details title={`Skipped duplicates (${result.skipped.length})`} color="amber"
                  items={result.skipped.map((s) => `Row ${s.row}: ${s.reason}`)} />
              )}
              {result.errors.length > 0 && (
                <Details title={`Errors (${result.errors.length})`} color="red"
                  items={result.errors.map((s) => `Row ${s.row}: ${s.reason}`)} />
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => { setStage("upload"); setRows([]); setResult(null); setFileName(""); }}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Import another file</button>
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Details({ title, items, color }: { title: string; items: string[]; color: "amber" | "red" }) {
  const c = color === "amber"
    ? { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" }
    : { bg: "bg-red-50",   border: "border-red-200",   text: "text-red-800" };
  return (
    <details className={`rounded-lg border ${c.border} ${c.bg}`}>
      <summary className={`px-3 py-2 text-sm font-semibold cursor-pointer ${c.text}`}>{title}</summary>
      <ul className="px-4 pb-3 pt-1 text-xs space-y-1 max-h-40 overflow-auto">
        {items.map((it, i) => <li key={i} className={c.text}>{it}</li>)}
      </ul>
    </details>
  );
}
