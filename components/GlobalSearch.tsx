"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type SearchResult = {
  type: string; id: string; title: string; subtitle: string; badge: string; href: string;
};

const TYPE_COLORS: Record<string,string> = {
  Lead:      "bg-amber-100 text-amber-700",
  Customer:  "bg-emerald-100 text-emerald-700",
  Order:     "bg-indigo-100 text-indigo-700",
  Quotation: "bg-blue-100 text-blue-700",
  Employee:  "bg-purple-100 text-purple-700",
};

export default function GlobalSearch() {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json() as { data: SearchResult[] };
      setResults(json.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 300);
  }, [query, search]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); }
  }, [open]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Trigger button in TopBar */}
      <button
        onClick={() => setOpen(true)}
        className="relative hidden md:flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-xl w-52 bg-slate-50 text-slate-400 hover:border-indigo-300 hover:bg-white transition-all text-left">
        <Search size={14} className="flex-shrink-0" />
        <span className="flex-1">Search anything…</span>
        <span className="text-xs text-slate-300 font-medium">⌘K</span>
      </button>

      {/* Search overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start justify-center z-50 pt-20 px-4">
          <div ref={containerRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              {loading ? <Loader2 size={16} className="animate-spin text-slate-400 flex-shrink-0" /> : <Search size={16} className="text-slate-400 flex-shrink-0" />}
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search leads, customers, orders, employees…"
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none" />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
              <kbd className="text-xs text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">Esc</kbd>
            </div>

            {results.length > 0 ? (
              <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                {results.map(r => (
                  <button key={`${r.type}-${r.id}`} onClick={() => navigate(r.href)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                      <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {r.badge && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{r.badge}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[r.type] ?? "bg-slate-100 text-slate-500"}`}>{r.type}</span>
                      <ArrowRight size={12} className="text-slate-300" />
                    </div>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 && !loading ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">No results for &ldquo;{query}&rdquo;</div>
            ) : query.length < 2 && query.length > 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400">Type at least 2 characters…</div>
            ) : null}

            {!query && (
              <div className="px-4 py-4">
                <p className="text-xs text-slate-400 mb-2">Quick links</p>
                <div className="flex flex-wrap gap-2">
                  {[["Leads","/leads"],["Customers","/customers"],["Orders","/sales-orders"],["HR","/hr"],["Accounts","/accounts"]].map(([l,h]) => (
                    <button key={l} onClick={() => navigate(h)} className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50">{l}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
