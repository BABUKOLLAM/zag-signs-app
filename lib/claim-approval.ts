// Sales-claim approval rules. Pure + tested. Roles are session.user.role labels.
export type ClaimStage = "MANAGER" | "AVP" | "MD";
export type ClaimAction = "APPROVED" | "REJECTED";

/** Who may act at each stage (unchanged list from the route, now enforced). */
export const CLAIM_STAGE_ROLES: Record<ClaimStage, string[]> = {
  MANAGER: ["AVP", "Business Manager", "MD"],
  AVP: ["AVP", "MD"],
  MD: ["MD"],
};

/** Statuses each stage may act on; the order is MANAGER → AVP → MD. */
export const CLAIM_STAGE_PENDING: Record<ClaimStage, string[]> = {
  MANAGER: ["SUBMITTED", "MANAGER_REVIEW"],
  AVP: ["MANAGER_APPROVED", "AVP_REVIEW"],
  MD: ["AVP_APPROVED", "MD_FINAL_REVIEW"],
};

export const CLAIM_APPROVED_STATUS: Record<ClaimStage, string> = {
  MANAGER: "MANAGER_APPROVED",
  AVP: "AVP_APPROVED",
  MD: "APPROVED",
};

export function isClaimStage(s: unknown): s is ClaimStage {
  return s === "MANAGER" || s === "AVP" || s === "MD";
}

export function nextClaimStatus(stage: ClaimStage, action: ClaimAction): string {
  return action === "APPROVED" ? CLAIM_APPROVED_STATUS[stage] : "REJECTED";
}

/**
 * Validates a claim approval request. Returns { status, error } where status
 * is the HTTP code to answer with, or null when the request may proceed.
 * (The current-status check is repeated atomically in the DB update.)
 */
export function claimApprovalCheck(o: {
  role: string | undefined | null;
  myId: string | undefined | null;
  stage: unknown;
  action: unknown;
  approvedAmount: unknown;
  claim: { submittedByUserId: string; amount: number; status: string };
}): { status: number; error: string } | null {
  if (!isClaimStage(o.stage)) return { status: 400, error: "Invalid stage" };
  if (o.action !== "APPROVED" && o.action !== "REJECTED") return { status: 400, error: "Invalid action" };
  if (!CLAIM_STAGE_ROLES[o.stage].includes(o.role ?? "")) {
    return { status: 403, error: `Your role cannot act at the ${o.stage} stage` };
  }
  if (!o.myId || o.myId === o.claim.submittedByUserId) {
    return { status: 403, error: "You cannot approve your own claim" };
  }
  if (!CLAIM_STAGE_PENDING[o.stage].includes(o.claim.status)) {
    return { status: 409, error: `Claim is ${o.claim.status}; it is not awaiting ${o.stage} action` };
  }
  if (o.action === "APPROVED" && o.approvedAmount !== undefined && o.approvedAmount !== null && o.approvedAmount !== "") {
    const amt = typeof o.approvedAmount === "number" ? o.approvedAmount : Number(o.approvedAmount);
    if (!Number.isFinite(amt) || amt <= 0) return { status: 400, error: "Approved amount must be greater than 0" };
    if (amt > o.claim.amount && o.role !== "MD") {
      return { status: 400, error: "Approved amount cannot exceed the claimed amount (only MD may approve more)" };
    }
  }
  return null;
}
