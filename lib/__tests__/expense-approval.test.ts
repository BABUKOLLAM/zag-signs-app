import { describe, it, expect } from "vitest";
import { approvalDenial } from "../expense-approval";

const ok = (role: string, stage: "HOD" | "ACCOUNTS" | "CEO") =>
  approvalDenial({ role, myId: "me", stage, expenseOwnerId: "someone-else" });

describe("expense approval authorization", () => {
  it.each([
    ["Business Manager", "HOD"], ["AVP", "HOD"], ["MD", "HOD"], ["MD", "CEO"],
    ["Accounts", "ACCOUNTS"],
  ] as const)("%s may act at %s", (role, stage) => expect(ok(role, stage)).toBeNull());

  it.each([
    ["Sales Executive", "HOD"], ["Sales Executive", "ACCOUNTS"], ["Sales Executive", "CEO"],
    ["CRES", "HOD"], ["Accounts", "HOD"], ["Accounts", "CEO"], ["Business Manager", "ACCOUNTS"],
    ["Business Manager", "CEO"], ["AVP", "CEO"], ["Production", "HOD"],
    ["IT Admin", "HOD"], ["Consultant", "HOD"], ["IT Admin", "CEO"],
  ] as const)("%s may NOT act at %s", (role, stage) => expect(ok(role, stage)).toMatch(/cannot act/));

  it("a session without a user id is refused", () => {
    expect(approvalDenial({ role: "MD", myId: undefined, stage: "CEO", expenseOwnerId: "x" })).not.toBeNull();
  });
  it("nobody approves their own report", () => {
    expect(approvalDenial({ role: "MD", myId: "me", stage: "CEO", expenseOwnerId: "me" })).toMatch(/own/);
    expect(approvalDenial({ role: "Business Manager", myId: "me", stage: "HOD", expenseOwnerId: "me" })).toMatch(/own/);
  });
});
