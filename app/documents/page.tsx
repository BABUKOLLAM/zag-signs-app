"use client";
import { useState } from "react";
import TopBar from "@/components/TopBar";
const branches = ["TVM", "KTYM", "EKM", "CLT"];
import { FolderOpen, Upload, Search, Download, Eye, FileText, File, Image, Table, X, Plus } from "lucide-react";

// BRD Phase 4 — Document Management

type DocCategory = "Quotations" | "Sales Orders" | "Invoices" | "Contracts" | "Reports" | "HR Documents" | "Marketing" | "Other";
type DocType = "PDF" | "DOCX" | "XLSX" | "JPG" | "PNG" | "Other";

interface DocFile {
  id: string;
  name: string;
  category: DocCategory;
  type: DocType;
  size: string;
  branch: string;
  uploadedBy: string;
  uploadedAt: string;
  relatedTo?: string;
  tags: string[];
}

const categories: DocCategory[] = ["Quotations", "Sales Orders", "Invoices", "Contracts", "Reports", "HR Documents", "Marketing", "Other"];

const typeIcon = (t: DocType) => {
  if (t === "PDF") return FileText;
  if (t === "XLSX") return Table;
  if (t === "JPG" || t === "PNG") return Image;
  return File;
};

const typeColor: Record<DocType, string> = {
  PDF: "bg-red-100 text-red-700",
  DOCX: "bg-blue-100 text-blue-700",
  XLSX: "bg-green-100 text-green-700",
  JPG: "bg-purple-100 text-purple-700",
  PNG: "bg-violet-100 text-violet-700",
  Other: "bg-slate-100 text-slate-600",
};

const categoryColor: Record<DocCategory, string> = {
  "Quotations": "bg-indigo-100 text-indigo-700",
  "Sales Orders": "bg-blue-100 text-blue-700",
  "Invoices": "bg-emerald-100 text-emerald-700",
  "Contracts": "bg-violet-100 text-violet-700",
  "Reports": "bg-amber-100 text-amber-700",
  "HR Documents": "bg-rose-100 text-rose-700",
  "Marketing": "bg-cyan-100 text-cyan-700",
  "Other": "bg-slate-100 text-slate-600",
};

const sampleDocs: DocFile[] = [
  { id: "DOC001", name: "Quotation_LuluMall_2026-06-15.pdf", category: "Quotations", type: "PDF", size: "1.2 MB", branch: "EKM", uploadedBy: "Vijay CRE", uploadedAt: "2026-06-15", relatedTo: "Lulu Mall Kochi", tags: ["quotation", "mall", "Q2"] },
  { id: "DOC002", name: "SO_AshaHospitals_MAY26.pdf", category: "Sales Orders", type: "PDF", size: "850 KB", branch: "TVM", uploadedBy: "Arun Kumar", uploadedAt: "2026-05-28", relatedTo: "Asha Hospitals", tags: ["sales order", "hospital"] },
  { id: "DOC003", name: "Invoice_MalabarGold_Apr2026.pdf", category: "Invoices", type: "PDF", size: "640 KB", branch: "EKM", uploadedBy: "Rajesh Kumar", uploadedAt: "2026-04-22", relatedTo: "Malabar Gold EKM", tags: ["invoice", "retail"] },
  { id: "DOC004", name: "Contract_KSRTC_Signage_2026.docx", category: "Contracts", type: "DOCX", size: "2.1 MB", branch: "EKM", uploadedBy: "Admin User", uploadedAt: "2026-06-01", relatedTo: "KSRTC Ernakulam", tags: ["government", "contract"] },
  { id: "DOC005", name: "MWR_June2026_Sales.xlsx", category: "Reports", type: "XLSX", size: "445 KB", branch: "TVM", uploadedBy: "Arun Kumar", uploadedAt: "2026-06-10", relatedTo: undefined, tags: ["MWR", "june", "report"] },
  { id: "DOC006", name: "HR_Attendance_June2026.xlsx", category: "HR Documents", type: "XLSX", size: "380 KB", branch: "TVM", uploadedBy: "Admin User", uploadedAt: "2026-06-12", relatedTo: undefined, tags: ["attendance", "HR"] },
  { id: "DOC007", name: "Catalogue_Signage_Products_2026.pdf", category: "Marketing", type: "PDF", size: "8.3 MB", branch: "TVM", uploadedBy: "Admin User", uploadedAt: "2026-05-01", relatedTo: undefined, tags: ["catalogue", "marketing"] },
  { id: "DOC008", name: "SitePhoto_BabyMemorial_Install.jpg", category: "Other", type: "JPG", size: "3.5 MB", branch: "KTYM", uploadedBy: "Renu Thomas", uploadedAt: "2026-06-15", relatedTo: "Baby Memorial Hospital", tags: ["installation", "photo"] },
  { id: "DOC009", name: "Quotation_FederalBank_2026-06-14.pdf", category: "Quotations", type: "PDF", size: "920 KB", branch: "TVM", uploadedBy: "Arun Kumar", uploadedAt: "2026-06-14", relatedTo: "Federal Bank HO", tags: ["quotation", "bank"] },
  { id: "DOC010", name: "Invoice_AlBaraka_Jun2026.pdf", category: "Invoices", type: "PDF", size: "520 KB", branch: "CLT", uploadedBy: "Salman Khan", uploadedAt: "2026-06-13", relatedTo: "Al Baraka Exports", tags: ["invoice", "export"] },
];

const blankUpload = { name: "", category: "Quotations" as DocCategory, type: "PDF" as DocType, branch: branches[0], relatedTo: "", tags: "" };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocFile[]>(sampleDocs);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [filterBranch, setFilterBranch] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [viewDoc, setViewDoc] = useState<DocFile | null>(null);
  const [form, setForm] = useState(blankUpload);

  const set = (f: keyof typeof blankUpload) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(p => ({ ...p, [f]: e.target.value }));

  const handleUpload = () => {
    if (!form.name) return;
    const d: DocFile = {
      id: `DOC${String(docs.length + 1).padStart(3, "0")}`,
      name: form.name, category: form.category, type: form.type,
      size: "—", branch: form.branch, uploadedBy: "Admin User",
      uploadedAt: new Date().toISOString().split("T")[0],
      relatedTo: form.relatedTo || undefined,
      tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [],
    };
    setDocs(p => [d, ...p]);
    setForm(blankUpload); setShowUpload(false);
  };

  const filtered = docs.filter(d =>
    (filterCat === "All" || d.category === filterCat) &&
    (filterBranch === "All" || d.branch === filterBranch) &&
    (
      search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.relatedTo || "").toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    )
  );

  const catCounts = categories.map(c => ({ cat: c, count: docs.filter(d => d.category === c).length }));

  const ic = "border border-slate-200 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-all";
  const lc = "block text-xs font-medium text-slate-600 mb-1.5";

  return (
    <div className="flex-1 bg-slate-50">
      <TopBar title="Documents" subtitle="Reports & AI" />
      <div className="p-6 space-y-5">

        {/* Category cards */}
        <div className="grid grid-cols-4 gap-3">
          {catCounts.slice(0, 4).map(c => (
            <button key={c.cat} onClick={() => setFilterCat(prev => prev === c.cat ? "All" : c.cat)}
              className={`bg-white rounded-2xl border shadow-sm p-4 text-left hover:shadow-md transition-all card-hover ${filterCat === c.cat ? "border-indigo-300 ring-1 ring-indigo-200" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[c.cat]}`}>{c.cat}</span>
                <span className="text-2xl font-bold text-slate-800">{c.count}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">files</p>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {catCounts.slice(4).map(c => (
            <button key={c.cat} onClick={() => setFilterCat(prev => prev === c.cat ? "All" : c.cat)}
              className={`bg-white rounded-2xl border shadow-sm p-4 text-left hover:shadow-md transition-all card-hover ${filterCat === c.cat ? "border-indigo-300 ring-1 ring-indigo-200" : "border-slate-100"}`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[c.cat]}`}>{c.cat}</span>
                <span className="text-2xl font-bold text-slate-800">{c.count}</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">files</p>
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap items-center flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, customer, tag..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl w-64 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-slate-50">
              <option value="All">All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={filterBranch} onChange={e => setFilterBranch(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-1.5 text-sm bg-slate-50">
              <option value="All">All Branches</option>{branches.map(b => <option key={b}>{b}</option>)}
            </select>
            <span className="text-xs text-slate-400">{filtered.length} of {docs.length} files</span>
          </div>
          <button onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl"
            style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
            <Plus size={14} /> Upload Document
          </button>
        </div>

        {/* File grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(d => {
            const DocIcon = typeIcon(d.type);
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md transition-all card-hover">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeColor[d.type]}`}>
                    <DocIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate" title={d.name}>{d.name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[d.category]}`}>{d.category}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[d.type]}`}>{d.type}</span>
                      <span className="text-xs text-slate-400">{d.branch}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Uploaded by</span><span className="font-medium text-slate-700">{d.uploadedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span><span className="font-medium text-slate-700">{d.uploadedAt}</span>
                  </div>
                  {d.relatedTo && <div className="flex justify-between"><span>Related to</span><span className="font-medium text-indigo-600 truncate max-w-[140px]">{d.relatedTo}</span></div>}
                  <div className="flex justify-between"><span>Size</span><span className="font-medium text-slate-700">{d.size}</span></div>
                </div>
                {d.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {d.tags.map(t => (
                      <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                  <button onClick={() => setViewDoc(d)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-indigo-600 font-medium bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 transition-all">
                    <Eye size={12} /> Preview
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-100 hover:bg-slate-200 rounded-lg py-1.5 transition-all">
                    <Download size={12} /> Download
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <FolderOpen size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No documents found</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Upload Document</h2>
              <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Upload area */}
              <div className="border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50 p-8 text-center">
                <Upload size={28} className="mx-auto text-indigo-400 mb-3" />
                <p className="text-sm font-medium text-indigo-700">Click to select file</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, JPG, PNG supported. Max 25 MB.</p>
                <button className="mt-3 text-xs text-white font-semibold px-4 py-1.5 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
                  Browse Files
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><label className={lc}>Document Name *</label><input type="text" placeholder="Filename or description" value={form.name} onChange={set("name")} className={ic} /></div>
                <div><label className={lc}>Category</label><select value={form.category} onChange={set("category")} className={ic}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className={lc}>File Type</label><select value={form.type} onChange={set("type")} className={ic}>{(["PDF","DOCX","XLSX","JPG","PNG","Other"] as DocType[]).map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className={lc}>Branch</label><select value={form.branch} onChange={set("branch")} className={ic}>{branches.map(b => <option key={b}>{b}</option>)}</select></div>
                <div><label className={lc}>Related To (optional)</label><input type="text" placeholder="Customer / order ref" value={form.relatedTo} onChange={set("relatedTo")} className={ic} /></div>
                <div className="col-span-2"><label className={lc}>Tags (comma-separated)</label><input type="text" placeholder="e.g. invoice, mall, Q2" value={form.tags} onChange={set("tags")} className={ic} /></div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowUpload(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
                <button onClick={handleUpload} disabled={!form.name}
                  className="px-4 py-2 text-sm text-white rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
                  <Upload size={14} /> Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-sm truncate max-w-xs" title={viewDoc.name}>{viewDoc.name}</h2>
                <p className="text-xs text-slate-400">{viewDoc.id}</p>
              </div>
              <button onClick={() => setViewDoc(null)} className="p-1.5 rounded-lg hover:bg-slate-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor[viewDoc.category]}`}>{viewDoc.category}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor[viewDoc.type]}`}>{viewDoc.type}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Branch</span><span className="font-medium">{viewDoc.branch}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Uploaded by</span><span className="font-medium">{viewDoc.uploadedBy}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Date</span><span className="font-medium">{viewDoc.uploadedAt}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Size</span><span className="font-medium">{viewDoc.size}</span></div>
                {viewDoc.relatedTo && <div className="flex justify-between"><span className="text-slate-500">Related to</span><span className="font-medium text-indigo-600">{viewDoc.relatedTo}</span></div>}
              </div>
              {viewDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {viewDoc.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
              <div className="bg-slate-100 rounded-xl flex items-center justify-center h-32">
                <div className="text-center text-slate-400">
                  <FileText size={28} className="mx-auto mb-2" />
                  <p className="text-xs">File preview not available in demo mode</p>
                  <p className="text-xs mt-0.5">Connect storage backend to enable</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 text-sm text-white font-semibold py-2.5 rounded-xl"
                style={{ background: "linear-gradient(135deg, #4F46E5, #7C3AED)" }}>
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
