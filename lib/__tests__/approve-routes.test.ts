// Route-level tests for the two approve endpoints with Prisma and the session
// mocked: authorization, stage order, and the atomic compare-and-set (a
// double-click / race records exactly one action).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({
  session: null as null | { user: { id: string; role: string } },
  expense: null as null | Record<string, unknown>,
  claim: null as null | Record<string, unknown>,
}));

const db = vi.hoisted(() => {
  const mk = () => ({
    expenseReport: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(async () => ({ id: "e1" })),
    },
    expenseApproval: { create: vi.fn() },
    salesClaim: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      findUniqueOrThrow: vi.fn(async () => ({ id: "c1" })),
    },
    claimApprovalHistory: { create: vi.fn() },
    auditLog: { create: vi.fn() },
  });
  const tx = mk();
  return { tx, prisma: { ...mk(), $transaction: vi.fn(async (cb: (t: unknown) => unknown) => cb(tx)) } };
});

vi.mock("@/lib/prisma", () => ({ prisma: db.prisma }));
vi.mock("@/lib/api-helpers", async (orig) => ({
  ...(await orig<typeof import("@/lib/api-helpers")>()),
  requirePathAccess: vi.fn(async () => state.session),
}));

import { POST as approveExpense } from "@/app/api/sales/expenses/[id]/approve/route";
import { POST as approveClaim } from "@/app/api/sales/claims/[id]/approve/route";

const req = (body: unknown) =>
  new NextRequest("http://localhost/api/x", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } });
const as = (role: string, id = "me") => { state.session = { user: { id, role } }; };

beforeEach(() => {
  vi.clearAllMocks();
  state.expense = { id: "e1", userId: "owner", status: "SUBMITTED", netPayable: 100, totalAmount: 100 };
  state.claim = { id: "c1", submittedByUserId: "owner", amount: 1000, status: "SUBMITTED", approvedAmount: null };
  db.prisma.expenseReport.findUnique.mockImplementation(async () => state.expense);
  db.prisma.salesClaim.findUnique.mockImplementation(async () => state.claim);
  db.tx.expenseReport.updateMany.mockResolvedValue({ count: 1 });
  db.tx.salesClaim.updateMany.mockResolvedValue({ count: 1 });
});

describe("POST /api/sales/expenses/[id]/approve", () => {
  const call = (body: unknown) => approveExpense(req(body), { params: Promise.resolve({ id: "e1" }) });

  it("Business Manager recommends at HOD: compare-and-set on HOD statuses, one approval + audit", async () => {
    as("Business Manager");
    const res = await call({ stage: "HOD", action: "RECOMMENDED" });
    expect(res.status).toBe(200);
    expect(db.tx.expenseReport.updateMany).toHaveBeenCalledWith({
      where: { id: "e1", status: { in: ["SUBMITTED", "HOD_REVIEW"] } },
      data: { status: "ACCOUNTS_VERIFY" },
    });
    expect(db.tx.expenseApproval.create).toHaveBeenCalledTimes(1);
    expect(db.tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: "EXPENSE_HOD_RECOMMENDED", recordId: "e1", userId: "me" }),
    }));
  });

  it("double-click: second request changes 0 rows → 409 and records nothing", async () => {
    as("Business Manager");
    db.tx.expenseReport.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const [a, b] = [await call({ stage: "HOD", action: "RECOMMENDED" }), await call({ stage: "HOD", action: "RECOMMENDED" })];
    expect([a.status, b.status]).toEqual([200, 409]);
    expect(db.tx.expenseApproval.create).toHaveBeenCalledTimes(1);
    expect(db.tx.auditLog.create).toHaveBeenCalledTimes(1);
  });

  it.each([["APPROVED"], ["REJECTED"], ["CEO_REVIEW"], ["HOD_HOLD"]])("HOD cannot act on a %s report (409)", async (status) => {
    as("Business Manager"); state.expense!.status = status;
    expect((await call({ stage: "HOD", action: "RECOMMENDED" })).status).toBe(409);
    expect(db.prisma.$transaction).not.toHaveBeenCalled();
  });

  it("MD cannot skip to CEO on a SUBMITTED report (409)", async () => {
    as("MD");
    expect((await call({ stage: "CEO", action: "APPROVED" })).status).toBe(409);
  });

  it.each([["Sales Executive", "HOD"], ["Sales Executive", "CEO"], ["IT Admin", "HOD"], ["Consultant", "HOD"], ["Accounts", "HOD"]])(
    "%s at %s → 403", async (role, stage) => {
      as(role);
      expect((await call({ stage, action: stage === "CEO" ? "APPROVED" : "RECOMMENDED" })).status).toBe(403);
      expect(db.prisma.$transaction).not.toHaveBeenCalled();
    });

  it("own report → 403", async () => {
    as("Business Manager", "owner");
    expect((await call({ stage: "HOD", action: "RECOMMENDED" })).status).toBe(403);
  });
});

describe("POST /api/sales/claims/[id]/approve", () => {
  const call = (body: unknown) => approveClaim(req(body), { params: Promise.resolve({ id: "c1" }) });

  it("Sales Executive POSTing stage MD on their own claim → 403, nothing written", async () => {
    as("Sales Executive", "owner");
    const res = await call({ stage: "MD", action: "APPROVED", approvedAmount: 999999 });
    expect(res.status).toBe(403);
    expect(db.prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([["Sales Executive"], ["CRES"], ["Accounts"], ["IT Admin"]])("%s at MANAGER → 403", async (role) => {
    as(role);
    expect((await call({ stage: "MANAGER", action: "APPROVED" })).status).toBe(403);
  });

  it("Business Manager approves at MANAGER: compare-and-set, history + audit", async () => {
    as("Business Manager");
    const res = await call({ stage: "MANAGER", action: "APPROVED", approvedAmount: 800 });
    expect(res.status).toBe(200);
    expect(db.tx.salesClaim.updateMany).toHaveBeenCalledWith({
      where: { id: "c1", status: { in: ["SUBMITTED", "MANAGER_REVIEW"] } },
      data: { status: "MANAGER_APPROVED", approvedAmount: 800, rejectionReason: undefined, resubmissionAllowed: false },
    });
    expect(db.tx.claimApprovalHistory.create).toHaveBeenCalledTimes(1);
    expect(db.tx.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ action: "CLAIM_MANAGER_APPROVED", recordId: "c1" }),
    }));
  });

  it("over-claim amount: 400 for AVP, allowed for MD", async () => {
    state.claim!.status = "MANAGER_APPROVED";
    as("AVP");
    expect((await call({ stage: "AVP", action: "APPROVED", approvedAmount: 1500 })).status).toBe(400);
    as("MD");
    expect((await call({ stage: "AVP", action: "APPROVED", approvedAmount: 1500 })).status).toBe(200);
  });

  it("skipping stages or reopening → 409", async () => {
    as("MD");
    expect((await call({ stage: "MD", action: "APPROVED" })).status).toBe(409); // still SUBMITTED
    state.claim!.status = "REJECTED";
    expect((await call({ stage: "MANAGER", action: "APPROVED" })).status).toBe(409);
    state.claim!.status = "APPROVED";
    expect((await call({ stage: "MD", action: "REJECTED" })).status).toBe(409);
  });

  it("double-click records one action", async () => {
    as("Business Manager");
    db.tx.salesClaim.updateMany.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 });
    const a = await call({ stage: "MANAGER", action: "APPROVED" });
    const b = await call({ stage: "MANAGER", action: "APPROVED" });
    expect([a.status, b.status]).toEqual([200, 409]);
    expect(db.tx.claimApprovalHistory.create).toHaveBeenCalledTimes(1);
  });
});
