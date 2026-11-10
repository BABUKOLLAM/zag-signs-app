// Who may record an expense-approval action at which stage, and which
// statuses each stage may act on. Pure + tested. Roles are session.user.role
// labels (see lib/permissions.ts).
export type ApprovalStage = "HOD" | "ACCOUNTS" | "CEO";

/** HOD = MD/AVP/Business Manager (same managers as activities/team performance),
 *  ACCOUNTS = Accounts, CEO = MD. */
export const STAGE_ROLES: Record<ApprovalStage, string[]> = {
  HOD: ["Business Manager", "AVP", "MD"],
  ACCOUNTS: ["Accounts"],
  CEO: ["MD"],
};

/** Statuses a stage may act on — the same ones the Approvals page offers.
 *  Anything else (APPROVED, REJECTED, holds, a later stage) is refused, so a
 *  stage can't be skipped and a finished report can't be reopened. */
export const STAGE_PENDING: Record<ApprovalStage, string[]> = {
  HOD: ["SUBMITTED", "HOD_REVIEW"],
  ACCOUNTS: ["ACCOUNTS_VERIFY"],
  CEO: ["CEO_REVIEW"],
};

/** Maps (stage, action) → next ExpenseReport.status. */
export const EXPENSE_TRANSITIONS: Record<ApprovalStage, Record<string, string>> = {
  HOD:      { RECOMMENDED: "ACCOUNTS_VERIFY", HOLD: "HOD_HOLD",      REJECTED: "HOD_REJECTED" },
  ACCOUNTS: { VERIFIED:    "CEO_REVIEW",       HOLD: "ACCOUNTS_HOLD", REJECTED: "REJECTED" },
  CEO:      { APPROVED:    "APPROVED",         HOLD: "HOLD",          REJECTED: "REJECTED" },
};

export function isApprovalStage(s: unknown): s is ApprovalStage {
  return s === "HOD" || s === "ACCOUNTS" || s === "CEO";
}

/** Reason the caller may not act (→ 403), or null. */
export function approvalDenial(o: {
  role: string | undefined | null;
  myId: string | undefined | null;
  stage: ApprovalStage;
  expenseOwnerId: string;
}): string | null {
  if (!STAGE_ROLES[o.stage]?.includes(o.role ?? "")) return `Your role cannot act at the ${o.stage} stage`;
  if (!o.myId || o.myId === o.expenseOwnerId) return "You cannot approve your own expense report";
  return null;
}
