// The list APIs that used to accept any signed-in user now require access to
// a page that uses them. Exercised through the real requireAnyPathAccess with
// the session and the per-user override mocked.
import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({ role: "", override: null as null | { modules: string[] } }));
vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => (state.role ? { user: { id: "u1", role: state.role } } : null)) }));
vi.mock("@/lib/prisma", () => ({
  prisma: { userPermission: { findUnique: vi.fn(async () => state.override) } },
}));

import { requireAnyPathAccess } from "../api-helpers";
import { ROUTE_ACCESS } from "../route-access";
import { GET as attendanceGET } from "@/app/api/attendance/route";
import { GET as leaveGET } from "@/app/api/leave-requests/route";
import { NextRequest } from "next/server";

const allowed = async (role: string, key: keyof typeof ROUTE_ACCESS) => {
  state.role = role;
  return !!(await requireAnyPathAccess(ROUTE_ACCESS[key]));
};

beforeEach(() => { state.role = ""; state.override = null; });

describe("role defaults per list API", () => {
  it.each([
    ["attendance", "HR", true], ["attendance", "Business Manager", true], ["attendance", "AVP", true],
    ["attendance", "Designer", false], ["attendance", "Sales Executive", false], ["attendance", "Accounts", false],
    ["attendance", "Production", false], ["attendance", "CRES", false], ["attendance", "MD", false],
    ["leaveRequests", "HR", true], ["leaveRequests", "Designer", false], ["leaveRequests", "Sales Executive", false],
    ["complaints", "CRES", true], ["complaints", "Sales Executive", true], ["complaints", "Production", false], ["complaints", "Designer", false], ["complaints", "Accounts", false],
    ["tasks", "Designer", true], ["tasks", "HR", true], ["tasks", "CRES", true],
    ["opportunities", "Sales Executive", true], ["opportunities", "Accounts", true], ["opportunities", "Production", false], ["opportunities", "HR", false],
    ["serviceTickets", "Accounts", true], ["serviceTickets", "Business Manager", true], ["serviceTickets", "Sales Executive", false], ["serviceTickets", "HR", false],
    ["workOrderTickets", "Designer", true], ["workOrderTickets", "CRES", true], ["workOrderTickets", "Sales Executive", true],
    ["workOrderTickets", "HR", false], ["workOrderTickets", "Accounts", false], ["workOrderTickets", "Production", false],
    ["production", "Production", true], ["production", "Business Manager", true], ["production", "Sales Executive", false], ["production", "HR", false],
  ] as const)("%s: %s → %s", async (key, role, expected) => {
    expect(await allowed(role, key)).toBe(expected);
  });

  it("a per-user override grants or removes access", async () => {
    state.override = { modules: ["/hr"] };
    expect(await allowed("Designer", "attendance")).toBe(true);
    state.override = { modules: ["/dashboard"] };
    expect(await allowed("HR", "attendance")).toBe(false);
  });
  it("signed out → no access", async () => {
    expect(await requireAnyPathAccess(ROUTE_ACCESS.attendance)).toBeNull();
  });
});

describe("route-level 403", () => {
  const req = (q = "") => new NextRequest(`http://localhost/api/x${q}`);
  it("a Designer can no longer read attendance or leave requests", async () => {
    state.role = "Designer";
    expect((await attendanceGET(req("?date=2026-11-10"))).status).toBe(403);
    expect((await leaveGET(req())).status).toBe(403);
  });
});
