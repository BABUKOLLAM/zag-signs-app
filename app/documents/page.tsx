"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/Toaster";
import {
  FolderOpen, Search, ExternalLink, FileText, File, Image, Table,
  Trash2, RefreshCw, Link, Plus, X,
} from "lucide-react";

const CATEGORIES = [
  "Quotations", "Sales Orders", "Invoices", "Contracts",
  "Artwork", "Photos", "Reports", "HR Documents", "Marketing", "Other",
];

const RECORD_TYPES = ["LEAD", "CUSTOMER", "ORDER", "QUOTATION", "FIELD_VISIT"];

interface DocRecord {
  id: string;
  name: string;
  category: string;
  fileType: string;
  fileSize: string;
  fileUrl: string;
  relatedTo: string;
  relatedType: string;
  branch: string;
  tags: string[];
  createdAt: string;
  uploadedBy: string;
}

const typeIcon = (t: string) => {
  if (t === "PDF") return FileText;
  if (t === "XLSX") return Table;
  if (t === "JPG" || t === "PNG") return Image;
  return File;
};

const typeColor: Record<string, string> = {
  PDF:  "bg-red-100 text-red-700",
  DOCX: "bg-blue-100 text-blue-700",
  XLSX: "bg-green-100 text-green-700",
  JPG:  "bg-purple-100 text-purple-700",
  PNG:  "bg-violet-100 text-violet-700",
  Other:"bg-slate-100 text-slate-600",
};

const catColor: Record<string, string> = {
  Quotations:    "bg-indigo-100 text-indigo-700",
  "Sales Orders":"bg-blue-100 text-blue-700",
  Invoices:      "bg-emerald-100 text-emerald-700",
  Contracts:     "bg-violet-100 text-violet-700",
  Reports:       "bg-amber-100 text-amber-700",
  "HR Documents":"bg-rose-100 text-rose-700",
  Marketing:     "bg-cyan-100 text-cyan-700",
  Artwork:       "bg-orange-100 text-orange-700",
  Photos:        "bg-pink-100 text-pink-700",
  Other:         "bg-slate-100 text-slate-600",
};

const ic = "border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all";

const blankLink = { name: "", url: "", category: "Other", relatedTo: "", relatedType: "" };

export default function DocumentsPage() {
  const toast = useToast();
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [filterType, setFilterType] = useState("");
  const [showLink, setShowLink]     = useState(false);
  const [linkForm, setLinkForm]     = useState(blankLink);

  const { data, loading, refetch } = useApi<DocRecord[]>("/documents", {
    category: filterCat || undefined,
    search:   search    || undefined,
  });

  const docs = (data ?? []).filter((d) =>
    !filterType || d.relatedType === filterType
  );

  const handleDelete = async (id: string) => {
    try {
      await api.del(`/documents/${id}`);
      toast.success("Document removed");
      refetch();
    } catch {
      toast.error("Failed to remove document");
    }
  };

  const handleLinkSave = async () => {
    if (!linkForm.name || !linkForm.url) return;
    try {
      await api.post("/documents", {
        name:        linkForm.name,
        category:    linkForm.category,
        fileType:    "Other",
        fileUrl:     linkForm.url,
        relatedTo:   linkForm.relatedTo || undefined,
        relatedType: linkForm.relatedType || undefined,
      });
      toast.success("Document link saved");
      setShowLink(false);
      setLinkForm(blankLink);
      refetch();
    } catch {
      toast.error("Failed to save link");
    }
  };

  const catCounts = CATEGORIES.map((c) => ({
    cat: c,
    count: (data ?? []).filter((d) => d.category === c).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="Documents" subtitle="Reports & AI" />
      <div className="p-6 space-y-5">

        {/* Category filter chips */}
        {catCounts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCat("")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                !filterCat
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
              }`}
            >
              All ({(data ?? []).length})
            </button>
            {catCounts.map((c) => (
              <button
                key={c.cat}
                onClick={() => setFilterCat((prev) => (prev === c.cat ? "" : c.cat))}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  filterCat === c.cat
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : `${catColor[c.cat] ?? catColor.Other} border-transparent hover:border-indigo-200`
                }`}
              >
                {c.cat} ({c.count})
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, record, tag…"
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-64 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-slate-50"
            >
              <option value="">All Record Types</option>
              {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <button
              onClick={refetch}
              className="p-1.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw size={14} />
            </button>
            <span className="text-xs text-slate-400">{docs.length} document{docs.length !== 1 ? "s" : ""}</span>
          </div>
          <button
            onClick={() => setShowLink(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
          >
            <Plus size={14} /> Link Document
          </button>
        </div>

        {/* Document grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm py-16 text-center text-slate-400">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No documents found</p>
            <p className="text-xs mt-1">Attach files from Leads, Customers, Sales Orders, or Quotations pages</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {docs.map((doc) => {
              const DocIcon = typeIcon(doc.fileType);
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[doc.fileType] ?? typeColor.Other}`}>
                      <DocIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate" title={doc.name}>{doc.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${catColor[doc.category] ?? catColor.Other}`}>
                          {doc.category}
                        </span>
                        {doc.fileType && doc.fileType !== "Other" && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[doc.fileType] ?? typeColor.Other}`}>
                            {doc.fileType}
                          </span>
                        )}
                        {doc.relatedType && (
                          <span className="text-xs text-slate-400">{doc.relatedType}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Uploaded by</span>
                      <span className="font-medium text-slate-700">{doc.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium text-slate-700">{doc.createdAt}</span>
                    </div>
                    {doc.fileSize && (
                      <div className="flex justify-between">
                        <span>Size</span>
                        <span className="font-medium text-slate-700">{doc.fileSize}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    {doc.fileUrl ? (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 transition-all"
                      >
                        <ExternalLink size={12} /> Open in Drive
                      </a>
                    ) : (
                      <span className="flex-1 text-center text-xs text-slate-300 py-1.5">No Drive link</span>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="px-2.5 py-1.5 text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                      title="Remove document record"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link Document modal */}
      {showLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b">
              <div className="flex items-center gap-2">
                <Link size={16} className="text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900">Link a Document</h2>
              </div>
              <button onClick={() => setShowLink(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Document Name *</label>
                <input
                  value={linkForm.name}
                  onChange={(e) => setLinkForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Customer PO – June 2026"
                  className={ic}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Google Drive URL *</label>
                <input
                  value={linkForm.url}
                  onChange={(e) => setLinkForm((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://drive.google.com/file/..."
                  className={ic}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
                  <select
                    value={linkForm.category}
                    onChange={(e) => setLinkForm((p) => ({ ...p, category: e.target.value }))}
                    className={ic}
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Record Type</label>
                  <select
                    value={linkForm.relatedType}
                    onChange={(e) => setLinkForm((p) => ({ ...p, relatedType: e.target.value }))}
                    className={ic}
                  >
                    <option value="">— None —</option>
                    {RECORD_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              {linkForm.relatedType && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Record ID (optional)
                  </label>
                  <input
                    value={linkForm.relatedTo}
                    onChange={(e) => setLinkForm((p) => ({ ...p, relatedTo: e.target.value }))}
                    placeholder="e.g. cld123abc…"
                    className={ic}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 px-6 pb-5">
              <button
                onClick={() => { setShowLink(false); setLinkForm(blankLink); }}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleLinkSave}
                disabled={!linkForm.name || !linkForm.url}
                className="px-4 py-2 text-sm text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}
              >
                <Plus size={14} /> Save Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
