import { describe, it, expect } from "vitest";
import {
  complaintWhere, taskWhere, opportunityWhere, amcWhere, serviceTicketWhere, projectWhere,
  purchaseOrderWhere, grnWhere, tripWhere, fuelWhere, attendanceWhere, leaveWhere, fjpWhere,
  workOrderTicketWhere, auditLogWhere, documentWhere, digitalApprovalWhere, tenderWhere,
  scheduleWhere, consumptionWhere, checkpointWhere, defectWhere, rejectionWhere, errorLogWhere,
} from "../list-filters";
import { parseRange } from "../date-range";

const R = { from: "2026-11-01", to: "2026-11-10" };
const DATE = { gte: new Date("2026-11-01T00:00:00Z"), lt: new Date("2026-11-11T00:00:00Z") };
const TS = { gte: new Date("2026-10-31T18:30:00Z"), lt: new Date("2026-11-10T18:30:00Z") };

describe("date basis per list (batch 2)", () => {
  it.each([
    ["complaints", complaintWhere({ range: R }), "createdAt", TS],
    ["opportunities", opportunityWhere({ range: R }), "createdAt", TS],
    ["service tickets", serviceTicketWhere({ range: R }), "createdAt", TS],
    ["projects", projectWhere({ range: R }), "createdAt", TS],
    ["purchase orders", purchaseOrderWhere({ range: R }), "createdAt", TS],
    ["trips", tripWhere({ range: R }), "startTime", TS],
    ["work-order tickets", workOrderTicketWhere({}, R), "receivedAt", TS],
    ["audit log", auditLogWhere({ range: R }), "createdAt", TS],
    ["documents", documentWhere({}, R), "createdAt", TS],
    ["digital approvals", digitalApprovalWhere({ range: R }), "createdAt", TS],
    ["tenders", tenderWhere({ range: R }), "createdAt", TS],
    ["schedules", scheduleWhere({ range: R }), "scheduledStartAt", TS],
    ["consumption", consumptionWhere({ range: R }), "createdAt", TS],
    ["checkpoints", checkpointWhere({ range: R }), "checkedAt", TS],
    ["defects", defectWhere({ range: R }), "createdAt", TS],
    ["rejections", rejectionWhere({ range: R }), "createdAt", TS],
    ["error log", errorLogWhere({ range: R }), "createdAt", TS],
    ["tasks", taskWhere({ range: R }), "dueDate", DATE],
    ["goods received", grnWhere({ range: R }), "receivedDate", DATE],
    ["fuel", fuelWhere({ range: R }), "date", DATE],
    ["attendance", attendanceWhere({ range: R }), "date", DATE],
  ] as const)("%s filters %s", (_n, w, field, expected) => {
    expect((w as Record<string, unknown>)[field]).toEqual(expected);
  });

  it("no range → no date key, other filters kept", () => {
    expect(complaintWhere({ status: "OPEN", priority: "HIGH", range: null })).toEqual({ status: "OPEN", priority: "HIGH" });
    expect(taskWhere({ assignedToId: "u1", range: null })).toEqual({ assignedToId: "u1" });
    expect(opportunityWhere({ stage: "QUALIFICATION", branch: "TVM", leadId: "l1", range: null }))
      .toEqual({ stage: "QUALIFICATION", branch: "TVM", leadId: "l1" });
    expect(tripWhere({ vehicleId: "v1", range: null })).toEqual({ vehicleId: "v1" });
    expect(auditLogWhere({ table: "Lead", userId: "u1", range: null })).toEqual({ tableName: "Lead", userId: "u1" });
    expect(workOrderTicketWhere({ assignedDesignerId: "me" }, null)).toEqual({ assignedDesignerId: "me" });
    expect(errorLogWhere({ range: null })).toEqual({});
  });
  it("filters combine with the range", () => {
    expect(scheduleWhere({ machineId: "m1", status: "PLANNED", range: R }))
      .toEqual({ machineId: "m1", status: "PLANNED", scheduledStartAt: TS });
    expect(workOrderTicketWhere({ assignedDesignerId: "me", status: "NEW" }, R))
      .toEqual({ assignedDesignerId: "me", status: "NEW", receivedAt: TS });
  });
});

describe("period overlap (AMC contracts, leave)", () => {
  it("AMC: active at any point in the range", () => {
    expect(amcWhere({ status: "ACTIVE", range: R })).toEqual({ status: "ACTIVE", startDate: { lt: DATE.lt }, endDate: { gte: DATE.gte } });
  });
  it("leave: overlaps the range; endpoints count", () => {
    const w = leaveWhere({ range: R }) as { fromDate: { lt: Date }; toDate: { gte: Date } };
    const overlaps = (f: string, t: string) => new Date(f) < w.fromDate.lt && new Date(t) >= w.toDate.gte;
    expect(overlaps("2026-10-28", "2026-11-01")).toBe(true);  // ends on the first day
    expect(overlaps("2026-11-10", "2026-11-12")).toBe(true);  // starts on the last day
    expect(overlaps("2026-10-20", "2026-10-31")).toBe(false);
    expect(overlaps("2026-11-11", "2026-11-12")).toBe(false);
  });
  it("attendance legacy ?month= = the same window as before", () => {
    const p = parseRange({ month: "2026-02" });
    expect(p.ok && attendanceWhere({ range: p.range }).date).toEqual({
      gte: new Date("2026-02-01T00:00:00Z"), lt: new Date("2026-03-01T00:00:00Z"),
    });
  });
});

describe("FJP scoping", () => {
  it.each(["Sales Executive", "CRES", "Accounts", "IT Admin", undefined])("%s only ever gets their own plans", (role) => {
    expect(fjpWhere({ role, myId: "me", userId: "u9", range: null }).userId).toBe("me");
    expect(fjpWhere({ role, myId: undefined, range: null }).userId).toBe("__none__");
  });
  it.each(["MD", "AVP", "Business Manager"])("%s may look at another user's plans", (role) => {
    expect(fjpWhere({ role, myId: "me", userId: "u9", range: null }).userId).toBe("u9");
    expect(fjpWhere({ role, myId: "me", range: null }).userId).toBe("me");
  });
  it("month keeps exact match; a range matches every touched plan month", () => {
    expect(fjpWhere({ role: "MD", myId: "me", month: "2026-11", range: R }).forMonth).toBe("2026-11");
    expect(fjpWhere({ role: "MD", myId: "me", range: { from: "2026-10-20", to: "2026-12-05" } }).forMonth)
      .toEqual({ in: ["2026-10", "2026-11", "2026-12"] });
  });
});
