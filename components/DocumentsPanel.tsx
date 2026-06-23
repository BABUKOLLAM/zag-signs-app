"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api-client";
import { uploadToDrive, isDriveConfigured } from "@/lib/google-drive";
import { useToast } from "@/components/Toaster";
import { Paperclip, ExternalLink, Trash2, Plus, FolderOpen, Link } from "lucide-react";

const CATEGORIES = [
  "Quotations", "Sales Orders", "Invoices", "Contracts",
  "Artwork", "Photos", "Reports", "Other",
];

interface DocRecord {
  id: string;
  name: string;
  category: string;
  fileType: string;
  fileUrl: string;
  createdAt: string;
  uploadedBy: string;
}

interface Props {
  /** Record ID this panel is attached to (lead.id, customer.id, etc.) */
  relatedTo: string;
  /** "LEAD" | "CUSTOMER" | "ORDER" | "QUOTATION" | "FIELD_VISIT" */
  relatedType: string;
}

function extToType(filename: string): string {
  const ext = (filename.split(".").pop() ?? "").toLowerCase();
  if (["xlsx", "xls"].includes(ext)) return "XLSX";
  if (ext === "pdf") return "PDF";
  if (["docx", "doc"].includes(ext)) return "DOCX";
  if (["jpg", "jpeg"].includes(ext)) return "JPG";
  if (ext === "png") return "PNG";
  return "Other";
}

const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function DocumentsPanel({ relatedTo, relatedType }: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("Other");
  const [showLink, setShowLink] = useState(false);
  const [linkForm, setLinkForm] = useState({ name: "", url: "", category: "Other" });

  const fetchDocs = useCallback(async () => {
    if (!relatedTo) return;
    setLoadingDocs(true);
    try {
      const res = await api.get<{ data: DocRecord[] }>("/documents", { relatedTo, relatedType });
      setDocs(res.data);
    } catch {
      // panel is optional — don't block the page on error
    } finally {
      setLoadingDocs(false);
    }
  }, [relatedTo, relatedType]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const driveUrl = await uploadToDrive(file.name, file);
      await api.post("/documents", {
        name: file.name,
        category,
        fileType: extToType(file.name),
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        fileUrl: driveUrl,
        relatedTo,
        relatedType,
      });
      toast.success("File uploaded to Drive and linked");
      fetchDocs();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
      toast.success("Document removed");
    } catch {
      toast.error("Failed to remove document");
    }
  };

  const handleLinkSave = async () => {
    if (!linkForm.name || !linkForm.url) return;
    try {
      await api.post("/documents", {
        name: linkForm.name,
        category: linkForm.category,
        fileType: "Other",
        fileUrl: linkForm.url,
        relatedTo,
        relatedType,
      });
      toast.success("Document link saved");
      setShowLink(false);
      setLinkForm({ name: "", url: "", category: "Other" });
      fetchDocs();
    } catch {
      toast.error("Failed to save link");
    }
  };

  const [canUpload, setCanUpload] = useState(false);
  useEffect(() => { isDriveConfigured().then(setCanUpload).catch(() => setCanUpload(false)); }, []);

  return (
    <>
      {/* Panel header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Paperclip size={14} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-700">Attached Documents</span>
          {docs.length > 0 && (
            <span className="text-xs bg-indigo-100 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
              {docs.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {canUpload && (
            <div className="flex items-center gap-1.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1 text-xs text-white font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                <Plus size={11} /> {uploading ? "Uploading…" : "Attach"}
              </button>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileSelect} />
            </div>
          )}
          <button
            onClick={() => setShowLink(true)}
            className="flex items-center gap-1 text-xs text-slate-600 border border-gray-200 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg"
            title="Paste a Drive URL"
          >
            <Link size={11} /> Link URL
          </button>
        </div>
      </div>

      {/* Document list */}
      {loadingDocs ? (
        <div className="text-center py-4 text-xs text-slate-400">Loading…</div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
          <FolderOpen size={22} className="mb-1.5 opacity-40" />
          <p className="text-xs">No documents attached yet</p>
          {!canUpload && (
            <p className="text-xs mt-1 text-slate-400">
              Configure Google Drive to enable file upload
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-2 py-2 px-2 rounded-lg hover:bg-gray-50 group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Paperclip size={11} className="text-indigo-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate max-w-[200px]" title={doc.name}>
                    {doc.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {doc.category} · {doc.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {doc.fileUrl ? (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <ExternalLink size={11} /> Open
                  </a>
                ) : (
                  <span className="text-xs text-slate-300">No link</span>
                )}
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-0.5 transition-opacity"
                  title="Remove"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual URL link modal */}
      {showLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b">
              <h3 className="text-sm font-bold text-slate-900">Link a Document</h3>
              <button onClick={() => setShowLink(false)} className="p-1 hover:bg-gray-100 rounded text-slate-400">✕</button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Document Name *</label>
                <input
                  value={linkForm.name}
                  onChange={(e) => setLinkForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Purchase Order from Customer"
                  className={ic}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Google Drive URL *</label>
                <input
                  value={linkForm.url}
                  onChange={(e) => setLinkForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://drive.google.com/file/..."
                  className={ic}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                <select
                  value={linkForm.category}
                  onChange={(e) => setLinkForm((p) => ({ ...p, category: e.target.value }))}
                  className={ic}
                >
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-4">
              <button
                onClick={() => setShowLink(false)}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSave}
                disabled={!linkForm.name || !linkForm.url}
                className="px-3 py-1.5 text-sm text-white rounded-lg font-semibold disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
