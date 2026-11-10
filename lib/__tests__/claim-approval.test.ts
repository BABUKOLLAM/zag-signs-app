import { describe, it, expect } from "vitest";
import { claimApprovalCheck, nextClaimStatus } from "../claim-approval";

const claim = (status: string, owner = "owner", amount = 1000) => ({ submittedByUserId: owner, amount, status });
const check = (role: string, stage: string, status: string, extra: Record<string, unknown> = {}) =>
  claimApprovalCheck({ role, myId: "me", stage, action: "APPROVED", approvedAmount: undefined, claim: claim(status), ...extra });

describe("claim approval: who may act where", () => {
  it.each([
    ["Business Manager", "MANAGER", "SUBMITTED"], ["AVP", "MANAGER", "MANAGER_REVIEW"], ["MD", "MANAGER", "SUBMITTED"],
    ["AVP", "AVP", "MANAGER_APPROVED"], ["MD", "AVP", "AVP_REVIEW"], ["MD", "MD", "AVP_APPROVED"], ["MD", "MD", "MD_FINAL_REVIEW"],
  ])("%s may act at %s on %s", (role, stage, status) => expect(check(role, stage, status)).toBeNull());

  it.each([
    ["Sales Executive", "MANAGER"], ["Sales Executive", "MD"], ["CRES", "MANAGER"], ["Accounts", "AVP"],
    ["Business Manager", "AVP"], ["Business Manager", "MD"], ["AVP", "MD"], ["IT Admin", "MANAGER"], ["Consultant", "MD"],
  ])("%s may NOT act at %s (403)", (role, stage) => {
    expect(check(role, stage, "AVP_APPROVED")?.status).toBe(403);
  });

  it("a Sales Executive POSTing stage MD on their own claim gets 403", () => {
    const r = claimApprovalCheck({ role: "Sales Executive", myId: "me", stage: "MD", action: "APPROVED", approvedAmount: 99999, claim: claim("SUBMITTED", "me") });
    expect(r?.status).toBe(403);
  });
  it("nobody approves their own claim, MD included", () => {
    const r = claimApprovalCheck({ role: "MD", myId: "me", stage: "MD", action: "APPROVED", approvedAmount: undefined, claim: claim("AVP_APPROVED", "me") });
    expect(r).toEqual({ status: 403, error: "You cannot approve your own claim" });
  });
  it("rejects bad stage/action with 400", () => {
    expect(check("MD", "CEO", "SUBMITTED")?.status).toBe(400);
    expect(claimApprovalCheck({ role: "MD", myId: "me", stage: "MD", action: "HOLD", approvedAmount: undefined, claim: claim("AVP_APPROVED") })?.status).toBe(400);
  });
});

describe("claim approval: stage order (409)", () => {
  it.each([
    ["MD", "MD", "SUBMITTED"],            // skipping MANAGER and AVP
    ["AVP", "AVP", "SUBMITTED"],          // skipping MANAGER
    ["MD", "MANAGER", "MANAGER_APPROVED"],// already past MANAGER (double action)
    ["MD", "MD", "APPROVED"],             // no reopening
    ["MD", "MANAGER", "REJECTED"],
    ["Business Manager", "MANAGER", "DRAFT"],
  ])("%s at %s on %s → 409", (role, stage, status) => expect(check(role, stage, status)?.status).toBe(409));
});

describe("claim approval: approvedAmount", () => {
  const amt = (role: string, approvedAmount: unknown) =>
    claimApprovalCheck({ role, myId: "me", stage: "MANAGER", action: "APPROVED", approvedAmount, claim: claim("SUBMITTED") });
  it("must be > 0", () => {
    expect(amt("MD", 0)?.status).toBe(400);
    expect(amt("MD", -5)?.status).toBe(400);
    expect(amt("MD", "abc")?.status).toBe(400);
  });
  it("must be ≤ claimed unless MD", () => {
    expect(amt("Business Manager", 1000)).toBeNull();
    expect(amt("Business Manager", 1001)?.status).toBe(400);
    expect(amt("AVP", 5000)?.status).toBe(400);
    expect(amt("MD", 5000)).toBeNull();
  });
  it("optional", () => expect(amt("Business Manager", undefined)).toBeNull());
  it("ignored on reject", () => {
    expect(claimApprovalCheck({ role: "Business Manager", myId: "me", stage: "MANAGER", action: "REJECTED", approvedAmount: -1, claim: claim("SUBMITTED") })).toBeNull();
  });
});

describe("nextClaimStatus", () => {
  it("maps stages", () => {
    expect(nextClaimStatus("MANAGER", "APPROVED")).toBe("MANAGER_APPROVED");
    expect(nextClaimStatus("AVP", "APPROVED")).toBe("AVP_APPROVED");
    expect(nextClaimStatus("MD", "APPROVED")).toBe("APPROVED");
    expect(nextClaimStatus("AVP", "REJECTED")).toBe("REJECTED");
  });
});
