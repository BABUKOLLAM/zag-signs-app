import { describe, it, expect } from "vitest";
import {
  leadWhere, fieldVisitWhere, quotationWhere, salesOrderWhere, workOrderWhere, invoiceWhere,
  collectionWhere, expenseWhere, claimWhere, activityWhere, darActivityWhere,
  teamDarWhere, teamWwrWhere, teamMwrWhere, isSalesManager,
} from "../list-filters";
import { parseRange } from "../date-range";

const R = { from: "2026-11-01", to: "2026-11-10" };
const DATE = { gte: new Date("2026-11-01T00:00:00Z"), lt: new Date("2026-11-11T00:00:00Z") };
const TS = { gte: new Date("2026-10-31T18:30:00Z"), lt: new Date("2026-11-10T18:30:00Z") };

describe("date basis per list", () => {
  it("timestamp lists use India-day boundaries on the right column", () => {
    expect(leadWhere({ range: R }).createdAt).toEqual(TS);
    expect(quotationWhere({ range: R }).createdAt).toEqual(TS);
    expect(workOrderWhere({ range: R }).createdAt).toEqual(TS);
    expect(activityWhere({ role: "MD", myId: "m", range: R }).startTime).toEqual(TS);
    expect(claimWhere({ range: R }).submittedDate).toEqual(TS);
    expect(expenseWhere({ role: "MD", myId: "u1", range: R }).createdAt).toEqual(TS);
  });
  it("calendar-date lists use UTC-midnight boundaries on the right column", () => {
    expect(fieldVisitWhere({ range: R }).date).toEqual(DATE);
    expect(salesOrderWhere({ range: R }).orderDate).toEqual(DATE);
    expect(invoiceWhere({ range: R }).invoiceDate).toEqual(DATE);
    expect(collectionWhere({ range: R }).collectionDate).toEqual(DATE);
    expect(teamDarWhere({ range: R }).date).toEqual(DATE);
  });
  it("no range → no date key at all (unchanged behaviour)", () => {
    expect(leadWhere({ range: null })).toEqual({});
    expect(fieldVisitWhere({ range: null })).toEqual({});
    expect(salesOrderWhere({ range: null })).toEqual({});
    expect(invoiceWhere({ range: null })).toEqual({});
    expect(collectionWhere({ range: null })).toEqual({});
    expect(teamDarWhere({ range: null })).toEqual({});
    expect(teamWwrWhere({ range: null })).toEqual({});
    expect(teamMwrWhere({ range: null })).toEqual({});
  });
});

describe("other filters are kept alongside the date filter", () => {
  it("leads keep branch/status/search", () => {
    const w = leadWhere({ branch: "TVM", status: "NEW", search: "acme", range: R });
    expect(w.branch).toBe("TVM");
    expect(w.status).toBe("NEW");
    expect(w.OR).toHaveLength(3);
    expect(w.createdAt).toEqual(TS);
  });
  it("field visits keep employeeId", () => {
    expect(fieldVisitWhere({ employeeId: "e1", range: R })).toEqual({ employeeId: "e1", date: DATE });
  });
  it("quotations / orders / work orders / invoices / collections keep their filters", () => {
    expect(quotationWhere({ status: "SENT", customerId: "c1", leadId: "l1", range: R }))
      .toEqual({ status: "SENT", customerId: "c1", leadId: "l1", createdAt: TS });
    expect(salesOrderWhere({ status: "CONFIRMED", customerId: "c1", range: R }))
      .toEqual({ status: "CONFIRMED", customerId: "c1", orderDate: DATE });
    const wo = workOrderWhere({ status: "PENDING", priority: "HIGH", search: "WO-1", range: R });
    expect(wo.status).toBe("PENDING"); expect(wo.priority).toBe("HIGH"); expect(wo.OR).toHaveLength(2);
    const inv = invoiceWhere({ status: "PAID", search: "INV", range: R });
    expect(inv.status).toBe("PAID"); expect(inv.OR).toHaveLength(3); expect(inv.invoiceDate).toEqual(DATE);
    expect(collectionWhere({ customerId: "c1", range: R })).toEqual({ customerId: "c1", collectionDate: DATE });
  });
  it("legacy collections ?month= gives the same window as the old code", () => {
    const p = parseRange({ month: "2026-10" });
    expect(p.ok && collectionWhere({ range: p.range }).collectionDate).toEqual({
      gte: new Date("2026-10-01T00:00:00Z"), lt: new Date("2026-11-01T00:00:00Z"),
    });
  });
});

describe("expense scoping is unchanged by the date filter", () => {
  it("non-approvers are always pinned to their own reports", () => {
    for (const role of ["Sales Executive", "CRES", "Production", undefined]) {
      expect(expenseWhere({ role, myId: "me", range: R }).userId).toBe("me");
      expect(expenseWhere({ role, myId: "me", range: null }).userId).toBe("me");
    }
  });
  it("approvers see everyone unless they ask for one user", () => {
    for (const role of ["MD", "AVP", "Business Manager", "Accounts"]) {
      expect(expenseWhere({ role, myId: "me", range: R }).userId).toBeUndefined();
      expect(expenseWhere({ role, myId: "me", userId: "u9", range: R }).userId).toBe("u9");
    }
  });
  it("a non-approver's ?userId= can NOT widen own-only scoping", () => {
    for (const role of ["Sales Executive", "CRES", "Production", "Designer", undefined]) {
      expect(expenseWhere({ role, myId: "me", userId: "u9", range: R }).userId).toBe("me");
      expect(expenseWhere({ role, myId: "me", userId: "u9", range: null }).userId).toBe("me");
    }
  });
  it("a session without an id never matches everyone", () => {
    expect(expenseWhere({ role: "Sales Executive", myId: undefined, range: null }).userId).toBe("__none__");
  });
  it("month keeps its forMonth meaning and combines with status + range", () => {
    expect(expenseWhere({ role: "Sales Executive", myId: "me", status: "SUBMITTED", month: "2026-11", range: R }))
      .toEqual({ userId: "me", status: "SUBMITTED", forMonth: "2026-11", createdAt: TS });
  });
});

describe("claims / activities / DAR scoping", () => {
  it("claims keep month (submission window), submitter and status", () => {
    expect(claimWhere({ month: "2026-11", submittedByUserId: "u1", status: "SUBMITTED", range: R }))
      .toEqual({ submissionWindow: "2026-11", submittedByUserId: "u1", status: "SUBMITTED", submittedDate: TS });
  });
  it("activities keep userId/customer/lead/type for managers", () => {
    expect(activityWhere({ role: "Business Manager", myId: "m", userId: "u1", customerId: "c1", leadId: "l1", type: "CALL", range: R }))
      .toEqual({ userId: "u1", customerId: "c1", leadId: "l1", type: "CALL", startTime: TS });
  });
  it.each(["MD", "AVP", "Business Manager"])("%s sees everyone's activities unless filtering", (role) => {
    expect(activityWhere({ role, myId: "m", range: R }).userId).toBeUndefined();
    expect(activityWhere({ role, myId: "m", userId: "u7", range: R }).userId).toBe("u7");
  });
  it.each(["Sales Executive", "CRES", "Accounts", "Production", "IT Admin", "Consultant", undefined])(
    "%s only ever sees their own activities, even with ?userId=", (role) => {
      expect(activityWhere({ role, myId: "me", range: R }).userId).toBe("me");
      expect(activityWhere({ role, myId: "me", userId: "u7", range: null }).userId).toBe("me");
      expect(activityWhere({ role, myId: undefined, range: null }).userId).toBe("__none__");
    });
  it("isSalesManager", () => {
    expect(["MD", "AVP", "Business Manager"].every(isSalesManager)).toBe(true);
    expect(["Sales Executive", "CRES", "Accounts", "BUSINESS_MANAGER", "", null, undefined].some(isSalesManager)).toBe(false);
  });
  it("DAR is always the signed-in user's own activity", () => {
    expect(darActivityWhere({ myId: "me", range: R })).toEqual({ userId: "me", startTime: TS });
  });
});

describe("team reports", () => {
  it("DARs keep employee + branch", () => {
    expect(teamDarWhere({ employeeId: "e1", branch: "EKM", range: R })).toEqual({ employeeId: "e1", branch: "EKM", date: DATE });
  });
  it("WWRs match weeks that overlap the range", () => {
    const w = teamWwrWhere({ branch: "EKM", range: R });
    expect(w).toEqual({ branch: "EKM", weekFrom: { lt: DATE.lt }, weekTo: { gte: DATE.gte } });
    // A week 26 Oct – 1 Nov overlaps (ends on the 1st); 11–17 Nov does not.
    const overlaps = (from: string, to: string) =>
      new Date(from) < (w.weekFrom as { lt: Date }).lt && new Date(to) >= (w.weekTo as { gte: Date }).gte;
    expect(overlaps("2026-10-26", "2026-11-01")).toBe(true);
    expect(overlaps("2026-11-11", "2026-11-17")).toBe(false);
    expect(overlaps("2026-10-19", "2026-10-25")).toBe(false);
  });
  it("MWRs match every (year, month) the range touches and keep ?year=", () => {
    expect(teamMwrWhere({ range: { from: "2026-12-15", to: "2027-01-10" } }).OR)
      .toEqual([{ year: 2026, month: 12 }, { year: 2027, month: 1 }]);
    expect(teamMwrWhere({ year: 2026, employeeId: "e1", range: null })).toEqual({ year: 2026, employeeId: "e1" });
  });
});
