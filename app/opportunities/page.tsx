"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "@/components/TopBar";
import { fmt } from "@/lib/utils";
import { useApi } from "@/lib/use-api";
import { api } from "@/lib/api-client";
import { LoadingState, ErrorState, EmptyState, TableSkeleton } from "@/components/States";
import { useToast } from "@/components/Toaster";
import { Plus, X, Eye, TrendingUp, UserCheck, FileText, RefreshCw } from "lucide-react";

const BRANCHES = ["TVM", "KTYM", "EKM", "CLT"];

const STAGES = [
  { value: "QUALIFICATION",     label: "Qualification" },
  { value: "PROPOSAL_SENT",     label: "Proposal Sent" },
  { value: "NEGOTIATION",       label: "Negotiation" },
  { value: "VERBAL_COMMITMENT", label: "Verbal Commitment" },
  { value: "CLOSED_WON",        label: "Closed Won" },
  { value: "CLOSED_LOST",       label: "Closed Lost" },
];

const STAGE_COLORS: Record<string, string> = {
  QUALIFICATION:     "bg-gray-100 text-gray-700",
  PROPOSAL_SENT:     "bg-blue-100 text-blue-700",
  NEGOTIATION:       "bg-yellow-100 text-yellow-700",
  VERBAL_COMMITMENT: "bg-indigo-100 text-indigo-700",
  CLOSED_WON:        "bg-green-100 text-green-700",
  CLOSED_LOST:       "bg-red-100 text-red-700",
};

const STAGE_PROB: Record<string, number> = {
  QUALIFICATION: 20, PROPOSAL_SENT: 40, NEGOTIATION: 65,
  VERBAL_COMMITMENT: 85, CLOSED_WON: 100, CLOSED_LOST: 0,
};

interface Opportunity {
  id: string; title: string; stage: string; stageLabel: string;
  probability: number; value: number; branch: string;
  expectedClose: string; notes: string; createdAt: string;
  leadId: string | null; leadName: string; leadPhone: string;
}

const BLANK = {
  title: "", branch: "TVM", stage: "QUALIFICATION",
  value: "", expectedClose: "", notes: "",
};

const ic = "border border-gray-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500";
const lc = "block text-xs font-medium text-gray-600 mb-1";

export default function OpportunitiesPage() {
  const toast = useToast();
  const router = useRouter();
  const [filterStage, setFilterStage] = useState("");
  const [filterBranch, setFilterBranch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewOpp, setViewOpp] = useState<Opportunity | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);

  const { data, loading, error, refetch } = useApi<Opportunity[]>("/opportunities", {
    stage:  filterStage  || undefined,
    branch: filterBranch || undefined,
    limit: 100,
  });
  const opps = data ?? [];

  const active    = opps.filter((o) => o.stage !== "CLOSED_WON" && o.stage !== "CLOSED_LOST");
  const pipeline  = active.reduce((s, o) => s + (o.value * o.probability / 100), 0);
  const wonValue  = opps.filter((o) => o.stage === "CLOSED_WON").reduce((s, o) => s + o.value, 0);

  const set = (f: keyof typeof BLANK) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      await api.post("/opportunities", {
        title: form.title,
        branch: form.branch,
        stage: form.stage,
        value: Number(form.value) || 0,
        expectedClose: form.expectedClose || undefined,
        notes: form.notes || undefined,
      });
      setForm(BLANK);
      setShowModal(false);
      refetch();
      toast.success("Opportunity created");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const updateStage = async (opp: Opportunity, stage: string) => {
    try {
      await api.put("/opportunities", { id: opp.id, stage });
      refetch();
    } catch {
      toast.error("Failed to update stage");
    }
  };

  const convertToCustomer = async (opp: Opportunity) => {
    if (!opp.leadId) { toast.error("No lead linked — can only convert from a Lead-backed opportunity"); return; }
    if (!confirm(`Convert "${opp.leadName}" to a Customer?`)) return;
    setConverting(opp.id);
    try {
      const res = await api.post<{ data: { customerNo: string } }>(
        `/leads/${opp.leadId}/convert`, { action: "to_customer" }
      );
      toast.success(`Customer created (${res.data?.customerNo ?? ""})`);
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Conversion failed");
    } finally {
      setConverting(null);
    }
  };

  const openQuotation = (opp: Opportunity) => {
    const company = encodeURIComponent(opp.leadName || opp.title);
    const fromLead = opp.leadId ? `fromLead=${opp.leadId}&` : "";
    router.push(`/quotations?${fromLead}company=${company}`);
  };

  return (
    <div>
      <TopBar title="Opportunity Management" />
      <div className="p-4 md:p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open Opportunities", value: active.length },
            { label: "Weighted Pipeline",  value: fmt(Math.round(pipeline)) },
            { label: "Total Value",        value: fmt(opps.reduce((s, o) => s + o.value, 0)) },
            { label: "Closed Won",         value: fmt(wonValue) },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Stage funnel */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pipeline by Stage</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {STAGES.map((s) => {
              const cnt = opps.filter((o) => o.stage === s.value).length;
              const val = opps.filter((o) => o.stage === s.value).reduce((sum, o) => sum + o.value, 0);
              return (
                <button key={s.value}
                  onClick={() => setFilterStage(filterStage === s.value ? "" : s.value)}
                  className={`rounded-lg p-3 text-center border-2 transition-all ${STAGE_COLORS[s.value]} ${filterStage === s.value ? "border-current opacity-100" : "border-transparent opacity-80"}`}>
                  <p className="text-lg font-bold">{cnt}</p>
                  <p className="text-xs font-medium leading-tight">{s.label}</p>
                  {val > 0 && <p className="text-xs mt-1 opacity-75">{fmt(val)}</p>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Stages</option>
              {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
              <option value="">All Branches</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <button onClick={refetch} title="Refresh"
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
              <RefreshCw size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={14} /> Add Opportunity
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <TableSkeleton rows={5} cols={8} />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : opps.length === 0 ? (
            <EmptyState label="No opportunities found" hint="Add opportunities or convert leads." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-medium">
                  <tr>
                    <th className="text-left px-4 py-3">Opportunity</th>
                    <th className="text-left px-4 py-3">Lead / Company</th>
                    <th className="text-left px-4 py-3">Branch</th>
                    <th className="text-right px-4 py-3">Value</th>
                    <th className="text-right px-4 py-3">Prob%</th>
                    <th className="text-left px-4 py-3">Stage</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Close Date</th>
                    <th className="text-center px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {opps.filter((o) =>
                    (!filterStage  || o.stage  === filterStage) &&
                    (!filterBranch || o.branch === filterBranch)
                  ).map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50 text-sm">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[180px] truncate">{o.title}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{o.leadName || "—"}</td>
                      <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{o.branch}</span></td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{fmt(o.value)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${o.probability >= 80 ? "text-green-600" : o.probability >= 50 ? "text-yellow-600" : "text-gray-600"}`}>
                          {o.probability}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select value={o.stage}
                          onChange={(e) => updateStage(o, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STAGE_COLORS[o.stage]}`}>
                          {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs hidden lg:table-cell">{o.expectedClose || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-center flex-wrap">
                          {o.leadId && (
                            <button
                              onClick={() => convertToCustomer(o)}
                              disabled={converting === o.id}
                              title="Convert lead to Customer"
                              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-40 font-medium whitespace-nowrap"
                            >
                              <UserCheck size={10} /> Customer
                            </button>
                          )}
                          <button
                            onClick={() => openQuotation(o)}
                            title="Create Quotation"
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium whitespace-nowrap"
                          >
                            <FileText size={10} /> Quote
                          </button>
                          <button onClick={() => setViewOpp(o)}
                            className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-600">
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Add Opportunity</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={lc}>Opportunity Title *</label>
                  <input type="text" placeholder="e.g. KSRTC TVM Depot Signage" value={form.title} onChange={set("title")} className={ic} />
                </div>
                <div>
                  <label className={lc}>Branch</label>
                  <select value={form.branch} onChange={set("branch")} className={ic}>
                    {BRANCHES.map((b) => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Stage</label>
                  <select value={form.stage} onChange={set("stage")} className={ic}>
                    {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lc}>Opportunity Value (₹)</label>
                  <input type="number" min="0" value={form.value} onChange={set("value")} className={ic} />
                </div>
                <div>
                  <label className={lc}>Expected Close Date</label>
                  <input type="date" value={form.expectedClose} onChange={set("expectedClose")} className={ic} />
                </div>
                <div className="col-span-2">
                  <label className={lc}>Notes</label>
                  <textarea rows={2} value={form.notes} onChange={set("notes")} placeholder="Key points, next steps…" className={ic} />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.title}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving…" : "Save Opportunity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewOpp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="font-bold text-gray-900">{viewOpp.title}</h2>
                <p className="text-xs text-gray-500">{viewOpp.branch} · {viewOpp.leadName}</p>
              </div>
              <button onClick={() => setViewOpp(null)} className="p-1 rounded hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Value", fmt(viewOpp.value)],
                  ["Probability", `${viewOpp.probability}%`],
                  ["Weighted", fmt(Math.round(viewOpp.value * viewOpp.probability / 100))],
                ].map(([l, v]) => (
                  <div key={l} className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-blue-700">{v}</p>
                    <p className="text-xs text-gray-500">{l}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Stage</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[viewOpp.stage]}`}>{viewOpp.stageLabel}</span></div>
                {viewOpp.expectedClose && <div className="flex justify-between"><span className="text-gray-500">Expected Close</span><span className="font-medium">{viewOpp.expectedClose}</span></div>}
                {viewOpp.leadName && <div className="flex justify-between"><span className="text-gray-500">Company</span><span className="font-medium">{viewOpp.leadName}</span></div>}
              </div>
              {viewOpp.notes && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{viewOpp.notes}</div>}
              <div className="flex gap-2 justify-end pt-1">
                {viewOpp.leadId && (
                  <button onClick={() => { setViewOpp(null); convertToCustomer(viewOpp); }}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 font-medium">
                    <UserCheck size={12} /> Convert to Customer
                  </button>
                )}
                <button onClick={() => { setViewOpp(null); openQuotation(viewOpp); }}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium">
                  <FileText size={12} /> Create Quotation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
