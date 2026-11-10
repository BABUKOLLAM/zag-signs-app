// Every record/bulk route now uses the same page-access rule as its list.
// The session is mocked; Prisma throws a sentinel on any data access, so a
// request that gets past the access check surfaces as that sentinel (or a
// 500 from the route's own try/catch) — never a 403.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const state = vi.hoisted(() => ({ role: "" }));
const PASSED = "PASSED_ACCESS_CHECK";
vi.mock("next-auth", () => ({ getServerSession: vi.fn(async () => (state.role ? { user: { id: "u1", role: state.role, email: "me@example.com" } } : null)) }));
vi.mock("@/lib/prisma", () => {
  const sentinel = (): unknown => new Proxy(() => {}, {
    get: () => sentinel(),
    apply: () => { throw new Error("PASSED_ACCESS_CHECK"); },
  });
  return { prisma: new Proxy({}, {
    get: (_t, model) => model === "userPermission"
      ? { findUnique: async () => null }
      : sentinel(),
  }) };
});

import * as complaintRec from "@/app/api/complaints/[id]/route";
import * as serviceRec from "@/app/api/service-tickets/[id]/route";
import * as scheduleRec from "@/app/api/production/schedules/[id]/route";
import * as defectRec from "@/app/api/production/quality/defects/[id]/route";
import * as consBulk from "@/app/api/production/materials/consumption/bulk/route";
import * as machines from "@/app/api/production/machines/route";
import * as machineRec from "@/app/api/production/machines/[id]/route";
import * as machineBulk from "@/app/api/production/machines/bulk/route";
import * as taskRec from "@/app/api/tasks/[id]/route";
import * as wotRec from "@/app/api/work-order-tickets/[id]/route";
import * as leaveRec from "@/app/api/leave-requests/[id]/route";
import * as audit from "@/app/api/audit-logs/route";

type Handler = (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<Response>;
const ctx = { params: Promise.resolve({ id: "x1" }) };
const req = (method: string) => new NextRequest("http://localhost/api/x", {
  method, ...(method === "GET" || method === "DELETE" ? {} : { body: JSON.stringify({ status: "PENDING", rows: [] }), headers: { "content-type": "application/json" } }),
});

/** "403" if refused by the access check, otherwise "passed". */
async function outcome(role: string, h: Handler, method: string): Promise<"403" | "passed"> {
  state.role = role;
  try {
    const res = await h(req(method), ctx);
    return res.status === 403 ? "403" : "passed";
  } catch (e) {
    if (e instanceof Error && e.message === PASSED) return "passed";
    throw e;
  }
}

const H = (m: Record<string, unknown>, k: string) => m[k] as Handler;
const routes: [string, Handler, string, string[], string[]][] = [
  // name, handler, method, page roles that must still work, roles that must be refused
  ["complaints/[id] PUT", H(complaintRec, "PUT"), "PUT", ["CRES", "Sales Executive", "Business Manager", "AVP"], ["Production", "Designer", "Accounts", "HR"]],
  ["complaints/[id] GET", H(complaintRec, "GET"), "GET", ["CRES"], ["Designer", "HR"]],
  ["service-tickets/[id] PUT", H(serviceRec, "PUT"), "PUT", ["Accounts", "Business Manager", "MD", "AVP"], ["Sales Executive", "CRES", "HR", "Designer"]],
  ["production/schedules/[id] PUT", H(scheduleRec, "PUT"), "PUT", ["Production", "Business Manager"], ["Sales Executive", "HR", "Accounts", "Designer"]],
  ["production/schedules/[id] GET", H(scheduleRec, "GET"), "GET", ["Production"], ["CRES"]],
  ["production/quality/defects/[id] PUT", H(defectRec, "PUT"), "PUT", ["Production", "Business Manager"], ["Sales Executive", "HR"]],
  ["production/materials/consumption/bulk POST", H(consBulk, "POST"), "POST", ["Production", "IT Admin"], ["Sales Executive", "Accounts"]],
  ["production/machines GET", H(machines, "GET"), "GET", ["Production", "Business Manager"], ["Sales Executive", "Designer"]],
  ["production/machines POST", H(machines, "POST"), "POST", ["Production"], ["HR"]],
  ["production/machines/[id] GET", H(machineRec, "GET"), "GET", ["Production"], ["CRES"]],
  ["production/machines/[id] PUT", H(machineRec, "PUT"), "PUT", ["Production"], ["Accounts"]],
  ["production/machines/[id] DELETE", H(machineRec, "DELETE"), "DELETE", ["Business Manager"], ["Sales Executive"]],
  ["production/machines/bulk POST", H(machineBulk, "POST"), "POST", ["Production"], ["Designer"]],
  ["tasks/[id] PUT", H(taskRec, "PUT"), "PUT", ["Designer", "HR", "CRES", "Production", "Accounts", "Sales Executive"], ["MD"]],
  ["tasks/[id] DELETE", H(taskRec, "DELETE"), "DELETE", ["Business Manager"], ["MD"]],
  ["work-order-tickets/[id] GET", H(wotRec, "GET"), "GET", ["Designer", "CRES", "Sales Executive", "Business Manager"], ["HR", "Accounts", "Production"]],
  ["work-order-tickets/[id] PUT", H(wotRec, "PUT"), "PUT", ["Designer", "CRES"], ["HR", "Production"]],
  ["work-order-tickets/[id] DELETE", H(wotRec, "DELETE"), "DELETE", ["Business Manager"], ["Accounts"]],
  ["leave-requests/[id] PUT", H(leaveRec, "PUT"), "PUT", ["HR", "Business Manager", "AVP"], ["Sales Executive", "Designer", "Accounts", "CRES", "MD"]],
  ["audit-logs GET", H(audit, "GET"), "GET", ["MD", "AVP", "IT Admin"], ["Business Manager", "Accounts", "HR", "Sales Executive"]],
];

beforeEach(() => { state.role = ""; });

describe.each(routes)("%s", (_name, handler, method, allowed, denied) => {
  it.each(allowed)("%s still gets through", async (role) => {
    expect(await outcome(role, handler, method)).toBe("passed");
  });
  it.each(denied)("%s is refused (403)", async (role) => {
    expect(await outcome(role, handler, method)).toBe("403");
  });
});
