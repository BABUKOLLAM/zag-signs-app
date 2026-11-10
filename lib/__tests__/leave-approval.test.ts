import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { leaveUpdateCheck } from "../leave-approval";
import { summarizeOpportunities } from "../list-filters";

const base = { myId: "me", myEmail: "me@example.com", leave: { userId: "someone", employeeEmail: "other@example.com" } };

describe("leaveUpdateCheck", () => {
  it.each(["HR", "Business Manager", "MD", "AVP"])("%s may approve/reject someone else's leave", (role) => {
    expect(leaveUpdateCheck({ ...base, role, status: "APPROVED" })).toBeNull();
    expect(leaveUpdateCheck({ ...base, role, status: "REJECTED" })).toBeNull();
  });
  it.each(["Sales Executive", "CRES", "Accounts", "Production", "Designer", "IT Admin", "Consultant"])("%s may not approve/reject", (role) => {
    expect(leaveUpdateCheck({ ...base, role, status: "APPROVED" })?.status).toBe(403);
  });
  it("no self-approval, by user id or by employee email", () => {
    expect(leaveUpdateCheck({ ...base, role: "HR", status: "APPROVED", leave: { userId: "me", employeeEmail: null } })?.status).toBe(403);
    expect(leaveUpdateCheck({ ...base, role: "HR", status: "REJECTED", leave: { userId: null, employeeEmail: " ME@example.com " } })?.status).toBe(403);
  });
  it("setting back to PENDING needs no approver role", () => {
    expect(leaveUpdateCheck({ ...base, role: "Sales Executive", status: "PENDING" })).toBeNull();
  });
  it("unknown status → 400", () => {
    expect(leaveUpdateCheck({ ...base, role: "HR", status: "CANCELLED" })?.status).toBe(400);
    expect(leaveUpdateCheck({ ...base, role: "HR", status: 5 })?.status).toBe(400);
  });
});

describe("summarizeOpportunities", () => {
  it("weights open groups by probability; won/total sums", () => {
    expect(summarizeOpportunities([
      { stage: "QUALIFICATION", probability: 20, value: 1000, count: 2 },
      { stage: "PROPOSAL", probability: 50, value: 400, count: 1 },
      { stage: "CLOSED_WON", probability: 100, value: 700, count: 1 },
      { stage: "CLOSED_LOST", probability: 0, value: 300, count: 3 },
    ])).toEqual({ openCount: 3, weightedPipeline: 400, wonValue: 700, totalValue: 2400 });
  });
});

// Route level: the record route applies the rule against the stored leave.
const st = vi.hoisted(() => ({ role: "HR", leave: { userId: "someone" as string | null, employee: { email: "other@example.com" } }, update: vi.fn() }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => ({ user: { id: "me", role: st.role, email: "me@example.com" } })) }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userPermission: { findUnique: async () => null },
    leaveRequest: { findUnique: async () => st.leave, update: (...a: unknown[]) => { st.update(...a); return { id: "l1" }; } },
  },
}));
import { PUT } from "@/app/api/leave-requests/[id]/route";
const put = (status: string) => PUT(new NextRequest("http://localhost/api/leave-requests/l1", {
  method: "PUT", body: JSON.stringify({ status }), headers: { "content-type": "application/json" },
}), { params: Promise.resolve({ id: "l1" }) });

describe("PUT /api/leave-requests/[id]", () => {
  beforeEach(() => { st.role = "HR"; st.leave = { userId: "someone", employee: { email: "other@example.com" } }; st.update.mockClear(); });
  it("HR approves someone else's leave", async () => {
    expect((await put("APPROVED")).status).toBe(200);
    expect(st.update).toHaveBeenCalledTimes(1);
  });
  it("HR cannot approve their own leave", async () => {
    st.leave = { userId: null, employee: { email: "me@example.com" } };
    expect((await put("APPROVED")).status).toBe(403);
    expect(st.update).not.toHaveBeenCalled();
  });
  it("a Sales Executive (no /hr page) is refused before anything else", async () => {
    st.role = "Sales Executive";
    expect((await put("APPROVED")).status).toBe(403);
    expect(st.update).not.toHaveBeenCalled();
  });
});
