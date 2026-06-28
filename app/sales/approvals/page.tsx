"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api-client";
import { CheckCircle, XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Loader2, Paperclip, ExternalLink } from "lucide-react";
import { useSession } from "next-auth/react";

type Tab = "pending" | "reviewed" | "all";
type Stage = "HOD" | "ACCOUNTS" | "CEO";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  DRAFT:              { label: "Draft",                  color: "bg-gray-100 text-gray-700" },
  SUBMITTED:          { label: "Submitted",              color: "bg-blue-100 text-blue-700" },
  HOD_REVIEW:         { label: "HOD Review",             color: "bg-yellow-100 text-yellow-700" },
  HOD_RECOMMENDED:    { label: "HOD Recommended",        color: "bg-green-100 text-green-700" },
  HOD_HOLD:           { label: "On Hold (HOD)",          color: "bg-orange-100 text-orange-700" },
  HOD_REJECTED:       { label: "Rejected by HOD",        color: "bg-red-100 text-red-700" },
  ACCOUNTS_VERIFY:    { label: "Accounts Verify",        color: "bg-purple-100 text-purple-700" },
  ACCOUNTS_VERIFIED:  { label: "Accounts Verified",      color: "bg-green-100 text-green-700" },
  ACCOUNTS_HOLD:      { label: "On Hold (Accts)",        color: "bg-orange-100 text-orange-700" },
  CEO_REVIEW:         { label: "CEO Review",             color: "bg-blue-100 text-blue-800" },
  APPROVED:           { label: "Approved",               color: "bg-green-100 text-green-800" },
  REJECTED:           { label: "Rejected",               color: "bg-red-100 text-red-800" },
  HOLD:               { label: "On Hold",                color: "bg-orange-100 text-orange-800" },
};

// Which statuses need action from which role groups
const PENDING_STATUSES: Record<string, string[]> = {
  HOD:      ["SUBMITTED", "HOD_REVIEW"],
  ACCOUNTS: ["ACCOUNTS_VERIFY"],
  CEO:      ["CEO_REVIEW"],
};

const ROLE_STAGE: Record<string, Stage> = {
  BUSINESS_MANAGER: "HOD",
  AVP: "HOD",
  MD: "HOD",
  ACCOUNTS: "ACCOUNTS",
};

function getStageForRole(role: string): Stage | null {
  return ROLE_STAGE[role] || null;
}

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ expenseId: string; expenseNo: string; stage: Stage } | null>(null);
  const [pendingAction, setPendingAction] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const role = (session?.user as any)?.role || "";
  const stage = getStageForRole(role);
  const isCEO = role === "MD";

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/sales/expenses") as any;
      if (res?.data) setExpenses(res.data);
    } finally {
      setLoading(false);
    }
  };

  const pendingStatuses = stage ? PENDING_STATUSES[stage] || [] : [];
  const ceoPendingStatuses = ["CEO_REVIEW"];

  const filterExpenses = (tab: Tab) => {
    if (tab === "all") return expenses;
    if (tab === "pending") {
      const statuses = isCEO ? ceoPendingStatuses : pendingStatuses;
      return expenses.filter(e => statuses.includes(e.status));
    }
    // reviewed = not pending anymore
    const allPending = [...pendingStatuses, ...ceoPendingStatuses];
    return expenses.filter(e => !allPending.includes(e.status));
  };

  const handleAction = async () => {
    if (!actionModal) return;
    const requiresReason = pendingAction === "HOLD" || pendingAction === "REJECTED";
    if (requiresReason && !reason.trim()) { alert("Please provide a reason for this action."); return; }

    setSubmitting(true);
    try {
      const actualStage = isCEO && actionModal.stage === "HOD" ? "CEO" : actionModal.stage;
      await api.post(`/api/sales/expenses/${actionModal.expenseId}/approve`, {
        stage: actualStage,
        action: pendingAction,
        reason: reason || undefined,
      });
      alert(`Action recorded: ${pendingAction}`);
      setActionModal(null);
      setPendingAction("");
      setReason("");
      fetchExpenses();
    } catch { alert("Action failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  const openModal = (exp: any) => {
    const effectiveStage: Stage = isCEO ? "CEO" : (stage || "HOD");
    setActionModal({ expenseId: exp.id, expenseNo: exp.expenseNo, stage: effectiveStage });
    setPendingAction("");
    setReason("");
  };

  const getActions = (st: Stage) => {
    if (st === "HOD") return [
      { action: "RECOMMENDED", label: "Recommend", icon: CheckCircle, color: "bg-green-600 hover:bg-green-700 text-white" },
      { action: "HOLD", label: "Hold",         icon: AlertCircle, color: "bg-amber-500 hover:bg-amber-600 text-white" },
      { action: "REJECTED", label: "Reject",   icon: XCircle,     color: "bg-red-600 hover:bg-red-700 text-white" },
    ];
    if (st === "ACCOUNTS") return [
      { action: "VERIFIED", label: "Verify",  icon: CheckCircle, color: "bg-green-600 hover:bg-green-700 text-white" },
      { action: "HOLD", label: "Hold",         icon: AlertCircle, color: "bg-amber-500 hover:bg-amber-600 text-white" },
      { action: "REJECTED", label: "Reject",   icon: XCircle,     color: "bg-red-600 hover:bg-red-700 text-white" },
    ];
    // CEO
    return [
      { action: "APPROVED", label: "Approve",  icon: CheckCircle, color: "bg-green-600 hover:bg-green-700 text-white" },
      { action: "HOLD", label: "Hold",          icon: AlertCircle, color: "bg-amber-500 hover:bg-amber-600 text-white" },
      { action: "REJECTED", label: "Reject",    icon: XCircle,     color: "bg-red-600 hover:bg-red-700 text-white" },
    ];
  };

  const canAct = (exp: any): boolean => {
    if (isCEO) return exp.status === "CEO_REVIEW";
    if (stage === "HOD") return ["SUBMITTED", "HOD_REVIEW"].includes(exp.status);
    if (stage === "ACCOUNTS") return exp.status === "ACCOUNTS_VERIFY";
    return false;
  };

  const visibleExpenses = filterExpenses(activeTab);

  const StepBadge = ({ label, active, done }: { label: string; active: boolean; done: boolean }) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${done ? "bg-green-100 text-green-700" : active ? "bg-blue-100 text-blue-700 ring-1 ring-blue-400" : "bg-gray-100 text-gray-400"}`}>
      {done ? <CheckCircle className="w-3 h-3" /> : active ? <Clock className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-300" />}
      {label}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expense Approvals</h1>
        <p className="text-sm text-gray-500 mt-1">
          {stage ? `Acting as ${stage} approver` : isCEO ? "Acting as CEO approver" : "View only — no approval role"}
          {role && <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">{role}</span>}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Pending",   value: filterExpenses("pending").length,  color: "bg-blue-50 text-blue-700" },
          { label: "Approved",        value: expenses.filter(e => e.status === "APPROVED").length, color: "bg-green-50 text-green-700" },
          { label: "Rejected",        value: expenses.filter(e => ["REJECTED", "HOD_REJECTED"].includes(e.status)).length, color: "bg-red-50 text-red-700" },
          { label: "On Hold",         value: expenses.filter(e => ["HOLD", "HOD_HOLD", "ACCOUNTS_HOLD"].includes(e.status)).length, color: "bg-amber-50 text-amber-700" },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["pending", "reviewed", "all"] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {tab} {tab === "pending" && filterExpenses("pending").length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{filterExpenses("pending").length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Expense list */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
      ) : (
        <div className="space-y-3">
          {visibleExpenses.map(exp => {
            const cfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.DRAFT;
            const isOpen = expanded === exp.id;
            const actable = canAct(exp);

            // Approval chain state
            const hodDone = ["HOD_RECOMMENDED", "ACCOUNTS_VERIFY", "ACCOUNTS_VERIFIED", "ACCOUNTS_HOLD", "CEO_REVIEW", "APPROVED"].includes(exp.status);
            const hodActive = ["SUBMITTED", "HOD_REVIEW", "HOD_HOLD"].includes(exp.status);
            const acctsDone = ["ACCOUNTS_VERIFIED", "CEO_REVIEW", "APPROVED"].includes(exp.status);
            const acctsActive = ["ACCOUNTS_VERIFY", "ACCOUNTS_HOLD"].includes(exp.status);
            const ceoDone = exp.status === "APPROVED";
            const ceoActive = ["CEO_REVIEW", "HOLD"].includes(exp.status);

            return (
              <div key={exp.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${actable ? "border-blue-200" : "border-gray-100"}`}>
                {/* Header row */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 cursor-pointer" onClick={() => setExpanded(isOpen ? null : exp.id)}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-blue-700">{exp.expenseNo}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                        {actable && <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium animate-pulse">Action Required</span>}
                      </div>
                      <div className="mt-1 flex gap-4 text-sm text-gray-600">
                        <span className="font-medium">{exp.user?.name}</span>
                        <span className="text-gray-400">·</span>
                        <span>{exp.expenseType}</span>
                        <span className="text-gray-400">·</span>
                        <span>{exp.forMonth}</span>
                        <span className="text-gray-400">·</span>
                        <span>{exp.description}</span>
                      </div>
                      {/* Approval chain */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StepBadge label="HOD" active={hodActive} done={hodDone} />
                        <div className="w-4 h-0.5 bg-gray-200" />
                        <StepBadge label="Accounts" active={acctsActive} done={acctsDone} />
                        <div className="w-4 h-0.5 bg-gray-200" />
                        <StepBadge label="CEO" active={ceoActive} done={ceoDone} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4 text-right">
                      <div>
                        <p className="text-lg font-bold">₹{exp.totalAmount?.toLocaleString("en-IN")}</p>
                        <p className="text-xs text-gray-500">Net: ₹{exp.netPayable?.toLocaleString("en-IN")}</p>
                      </div>
                      {actable && (
                        <button onClick={() => openModal(exp)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap">
                          Take Action
                        </button>
                      )}
                      <button onClick={() => setExpanded(isOpen ? null : exp.id)} className="text-gray-400 hover:text-gray-600">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded details */}
                {isOpen && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    {/* Line items */}
                    {exp.items?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Expense Items</h4>
                        <table className="w-full text-xs">
                          <thead><tr className="text-gray-500">
                            <th className="text-left py-1">Date</th>
                            <th className="text-left py-1">Category</th>
                            <th className="text-left py-1">Description</th>
                            <th className="text-left py-1">From → To</th>
                            <th className="text-right py-1">KM</th>
                            <th className="text-right py-1">Amount</th>
                            <th className="text-center py-1">Bill</th>
                          </tr></thead>
                          <tbody className="divide-y divide-gray-200">
                            {exp.items.map((item: any, i: number) => (
                              <tr key={i} className="bg-white">
                                <td className="py-1">{new Date(item.date).toLocaleDateString("en-IN")}</td>
                                <td className="py-1">{item.category}</td>
                                <td className="py-1">{item.description || "-"}</td>
                                <td className="py-1">{item.fromPlace || "-"} → {item.toPlace || "-"}</td>
                                <td className="py-1 text-right">{item.km || "-"}</td>
                                <td className="py-1 text-right font-medium">₹{item.amount?.toLocaleString("en-IN")}</td>
                                <td className="py-1 text-center">{item.billAvailable ? "✓" : "✗"}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="font-semibold border-t-2 border-gray-300">
                              <td colSpan={5} className="py-1 text-right">Total:</td>
                              <td className="py-1 text-right">₹{exp.totalAmount?.toLocaleString("en-IN")}</td>
                              <td />
                            </tr>
                            {exp.advanceReceived > 0 && <tr>
                              <td colSpan={5} className="py-1 text-right text-orange-600">Less Advance:</td>
                              <td className="py-1 text-right text-orange-600">₹{exp.advanceReceived?.toLocaleString("en-IN")}</td>
                              <td />
                            </tr>}
                            <tr className="text-blue-700 font-bold">
                              <td colSpan={5} className="py-1 text-right">Net Payable:</td>
                              <td className="py-1 text-right">₹{exp.netPayable?.toLocaleString("en-IN")}</td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {/* FJP reference */}
                    {exp.fjp && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">FJP Reference</h4>
                        <p className="text-sm">{exp.fjp.fjpNo} — {exp.fjp.forMonth}</p>
                      </div>
                    )}

                    {/* Approval history */}
                    {exp.approvals?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Approval History</h4>
                        <div className="space-y-2">
                          {exp.approvals.map((a: any, i: number) => (
                            <div key={i} className={`flex items-start gap-3 p-2 rounded-lg text-sm ${
                              a.action === "REJECTED" ? "bg-red-50" : a.action === "HOLD" ? "bg-amber-50" : "bg-green-50"
                            }`}>
                              {a.action === "REJECTED" ? <XCircle className="w-4 h-4 text-red-500 mt-0.5" /> :
                               a.action === "HOLD" ? <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" /> :
                               <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />}
                              <div>
                                <p className="font-medium">{a.stage}: {a.action} by {a.actionBy?.name}</p>
                                <p className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString("en-IN")}</p>
                                {a.reason && <p className="text-xs text-gray-700 mt-1 italic">"{a.reason}"</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Attachments */}
                    {exp.attachments?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" /> Attached Documents
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {exp.attachments.map((a: any, i: number) => (
                            <a key={i} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
                              <Paperclip className="w-3 h-3" /> {a.fileName} <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hold/Reject reason */}
                    {(exp.holdReason || exp.rejectionReason) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        <strong>Reason:</strong> {exp.holdReason || exp.rejectionReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {visibleExpenses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {activeTab === "pending" ? "No expenses pending your approval" : "No expenses found"}
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Approval Action</h2>
              <p className="text-sm text-gray-500">{actionModal.expenseNo} — {actionModal.stage} Stage</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Action:</label>
              <div className="space-y-2">
                {getActions(actionModal.stage).map(({ action, label, icon: Icon, color }) => (
                  <button key={action} onClick={() => setPendingAction(action)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      pendingAction === action ? color + " border-current" : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {pendingAction && (
              <div>
                <label className="text-sm font-medium">
                  {["HOLD", "REJECTED"].includes(pendingAction) ? "Reason (Required) *" : "Remarks (Optional)"}
                </label>
                <textarea value={reason} onChange={e => setReason(e.target.value)}
                  placeholder={["HOLD", "REJECTED"].includes(pendingAction) ? "Please provide a reason..." : "Any remarks or notes..."}
                  rows={3} className="w-full border rounded-lg px-3 py-2 mt-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setActionModal(null)} className="flex-1 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleAction} disabled={!pendingAction || submitting}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
