// Who may decide a leave request. Pure + tested. Roles are session.user.role labels.
export const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
/** Roles that may approve/reject leave (the HR page's managers). */
export const LEAVE_APPROVER_ROLES = ["HR", "Business Manager", "MD", "AVP"];

/** Returns { status, error } to answer with, or null when the update may proceed. */
export function leaveUpdateCheck(o: {
  role: string | undefined | null;
  myId: string | undefined | null;
  myEmail: string | undefined | null;
  status: unknown;
  leave: { userId: string | null; employeeEmail: string | null };
}): { status: number; error: string } | null {
  if (typeof o.status !== "string" || !(LEAVE_STATUSES as readonly string[]).includes(o.status)) {
    return { status: 400, error: "status must be PENDING, APPROVED or REJECTED" };
  }
  if (o.status === "APPROVED" || o.status === "REJECTED") {
    if (!LEAVE_APPROVER_ROLES.includes(o.role ?? "")) return { status: 403, error: "Your role cannot approve or reject leave" };
    const mine =
      (!!o.myId && o.leave.userId === o.myId) ||
      (!!o.myEmail && !!o.leave.employeeEmail && o.leave.employeeEmail.trim().toLowerCase() === o.myEmail.trim().toLowerCase());
    if (mine) return { status: 403, error: "You cannot approve or reject your own leave" };
  }
  return null;
}
