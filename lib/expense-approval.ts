// Who may record an expense-approval action at which stage. Pure + tested.
// Roles are session.user.role labels (see lib/permissions.ts).
export type ApprovalStage = "HOD" | "ACCOUNTS" | "CEO";

/** Mirrors the Approvals page: HOD = Business Manager/AVP/MD (and the IT
 *  Admin/Consultant oversight roles, which the page sends as HOD),
 *  ACCOUNTS = Accounts, CEO = MD. */
export const STAGE_ROLES: Record<ApprovalStage, string[]> = {
  HOD: ["Business Manager", "AVP", "MD", "IT Admin", "Consultant"],
  ACCOUNTS: ["Accounts"],
  CEO: ["MD"],
};

export function approvalDenial(o: {
  role: string | undefined | null;
  myId: string | undefined | null;
  stage: ApprovalStage;
  expenseOwnerId: string;
}): string | null {
  if (!STAGE_ROLES[o.stage]?.includes(o.role ?? "")) return `Your role cannot act at the ${o.stage} stage`;
  if (o.myId && o.myId === o.expenseOwnerId) return "You cannot approve your own expense report";
  return null;
}
