// Prisma `where` builders for the dated lists. Kept pure (no prisma client,
// no session lookups) so the date filtering AND the existing role/user
// scoping can be unit-tested without a database.
//
// Date basis per list (see DateBasis in ./date-range):
//   leads            createdAt       timestamp (India day)
//   field visits     date            calendar date
//   quotations       createdAt       timestamp
//   sales orders     orderDate       calendar date
//   work orders      createdAt       timestamp
//   invoices         invoiceDate     calendar date
//   collections      collectionDate  calendar date
//   expenses         createdAt       timestamp
//   sales claims     submittedDate   timestamp
//   activities       startTime       timestamp
//   team DARs        date            calendar date
//   team WWRs        weekFrom..weekTo overlapping the range (calendar dates)
//   team MWRs        (year, month) touched by the range
import type { Prisma } from "@prisma/client";
import { dateWhere, monthsInRange, rangeToWhere, type DateRange } from "./date-range";

type Range = DateRange | null;

export function leadWhere(o: { branch?: string | null; status?: string | null; search?: string; range: Range }): Prisma.LeadWhereInput {
  return {
    ...(o.branch ? { branch: o.branch } : {}),
    ...(o.status ? { status: o.status as Prisma.LeadWhereInput["status"] } : {}),
    ...(o.search
      ? {
          OR: [
            { name: { contains: o.search, mode: "insensitive" as const } },
            { company: { contains: o.search, mode: "insensitive" as const } },
            { phone: { contains: o.search } },
          ],
        }
      : {}),
    ...dateWhere("createdAt", o.range, "timestamp"),
  };
}

export function fieldVisitWhere(o: { employeeId?: string | null; range: Range }): Prisma.FieldVisitWhereInput {
  return {
    ...(o.employeeId ? { employeeId: o.employeeId } : {}),
    ...dateWhere("date", o.range, "date"),
  };
}

export function quotationWhere(o: { status?: string | null; customerId?: string | null; leadId?: string | null; range: Range }): Prisma.QuotationWhereInput {
  return {
    ...(o.status ? { status: o.status as Prisma.QuotationWhereInput["status"] } : {}),
    ...(o.customerId ? { customerId: o.customerId } : {}),
    ...(o.leadId ? { leadId: o.leadId } : {}),
    ...dateWhere("createdAt", o.range, "timestamp"),
  };
}

export function salesOrderWhere(o: { status?: string | null; customerId?: string | null; range: Range }): Prisma.SalesOrderWhereInput {
  return {
    ...(o.status ? { status: o.status as Prisma.SalesOrderWhereInput["status"] } : {}),
    ...(o.customerId ? { customerId: o.customerId } : {}),
    ...dateWhere("orderDate", o.range, "date"),
  };
}

export function workOrderWhere(o: { status?: string | null; priority?: string | null; search?: string; range: Range }): Prisma.WorkOrderWhereInput {
  return {
    ...(o.status ? { status: o.status as Prisma.WorkOrderWhereInput["status"] } : {}),
    ...(o.priority ? { priority: o.priority as Prisma.WorkOrderWhereInput["priority"] } : {}),
    ...(o.search
      ? {
          OR: [
            { workOrderNo: { contains: o.search, mode: "insensitive" as const } },
            { description: { contains: o.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...dateWhere("createdAt", o.range, "timestamp"),
  };
}

export function invoiceWhere(o: { status?: string | null; search?: string; range: Range }): Prisma.InvoiceWhereInput {
  return {
    ...(o.status ? { status: o.status as Prisma.InvoiceWhereInput["status"] } : {}),
    ...(o.search
      ? {
          OR: [
            { invoiceNo: { contains: o.search, mode: "insensitive" as const } },
            { customerName: { contains: o.search, mode: "insensitive" as const } },
            { customer: { name: { contains: o.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...dateWhere("invoiceDate", o.range, "date"),
  };
}

/** `month` is folded into `range` by parseRange, so old ?month= links still work. */
export function collectionWhere(o: { customerId?: string | null; range: Range }): Prisma.CollectionWhereInput {
  return {
    ...(o.customerId ? { customerId: o.customerId } : {}),
    ...dateWhere("collectionDate", o.range, "date"),
  };
}

export const EXPENSE_APPROVER_ROLES = ["MD", "AVP", "Business Manager", "Accounts"];

/** Roles that may see other sales people's activity and the team-performance view.
 *  Spelled as session.user.role carries them (ROLE_DISPLAY labels, see lib/permissions.ts). */
export const SALES_MANAGER_ROLES = ["MD", "AVP", "Business Manager"];

export function isSalesManager(role: string | undefined | null): boolean {
  return SALES_MANAGER_ROLES.includes(role ?? "");
}

/**
 * Expenses: approvers see everyone's and may narrow to one user with ?userId=.
 * Everyone else is ALWAYS pinned to their own reports — a non-approver's
 * ?userId= is ignored (it used to override the own-only rule).
 * `month` keeps its old meaning (exact forMonth match); from/to filters on
 * when the report was raised.
 */
export function expenseWhere(o: {
  role: string | undefined; myId: string | undefined;
  userId?: string | null; status?: string | null; month?: string | null; range: Range;
}): Prisma.ExpenseReportWhereInput {
  const isApprover = EXPENSE_APPROVER_ROLES.includes(o.role ?? "");
  const where: Prisma.ExpenseReportWhereInput = {};
  if (!isApprover) where.userId = o.myId ?? "__none__";
  else if (o.userId) where.userId = o.userId;
  if (o.status) where.status = o.status as Prisma.ExpenseReportWhereInput["status"];
  if (o.month) where.forMonth = o.month;
  if (o.range) where.createdAt = rangeToWhere(o.range, "timestamp");
  return where;
}

/** Claims: `month` keeps its old meaning (submission window); from/to = submitted date. */
export function claimWhere(o: { month?: string | null; submittedByUserId?: string | null; status?: string | null; range: Range }): Prisma.SalesClaimWhereInput {
  const where: Prisma.SalesClaimWhereInput = {};
  if (o.month) where.submissionWindow = o.month;
  if (o.submittedByUserId) where.submittedByUserId = o.submittedByUserId;
  if (o.status) where.status = o.status as Prisma.SalesClaimWhereInput["status"];
  if (o.range) where.submittedDate = rangeToWhere(o.range, "timestamp");
  return where;
}

/**
 * Activities: sales managers (MD/AVP/Business Manager) see everyone's and may
 * narrow with ?userId=; everyone else only ever sees their own.
 */
export function activityWhere(o: {
  role: string | undefined; myId: string | undefined;
  userId?: string | null; customerId?: string | null; leadId?: string | null; type?: string | null; range: Range;
}): Prisma.ActivityLogWhereInput {
  const scopedUserId = isSalesManager(o.role) ? o.userId || null : o.myId ?? "__none__";
  return {
    ...(scopedUserId ? { userId: scopedUserId } : {}),
    ...(o.customerId ? { customerId: o.customerId } : {}),
    ...(o.leadId ? { leadId: o.leadId } : {}),
    ...(o.type ? { type: o.type as Prisma.ActivityLogWhereInput["type"] } : {}),
    ...dateWhere("startTime", o.range, "timestamp"),
  };
}

/** The DAR summary is always the signed-in user's own activity. */
export function darActivityWhere(o: { myId: string; range: DateRange }): Prisma.ActivityLogWhereInput {
  return { userId: o.myId, startTime: rangeToWhere(o.range, "timestamp") };
}

export function teamDarWhere(o: { employeeId?: string | null; branch?: string | null; range: Range }): Prisma.DARWhereInput {
  return {
    ...(o.employeeId ? { employeeId: o.employeeId } : {}),
    ...(o.branch ? { branch: o.branch } : {}),
    ...dateWhere("date", o.range, "date"),
  };
}

/** A weekly report matches if its week overlaps the range at all. */
export function teamWwrWhere(o: { employeeId?: string | null; branch?: string | null; range: Range }): Prisma.WWRWhereInput {
  const w: Prisma.WWRWhereInput = {
    ...(o.employeeId ? { employeeId: o.employeeId } : {}),
    ...(o.branch ? { branch: o.branch } : {}),
  };
  if (o.range) {
    const { gte, lt } = rangeToWhere(o.range, "date");
    w.weekFrom = { lt };
    w.weekTo = { gte };
  }
  return w;
}

/** A monthly report matches if its month is touched by the range. `year` still works alone. */
export function teamMwrWhere(o: { employeeId?: string | null; branch?: string | null; year?: number | null; range: Range }): Prisma.MWRWhereInput {
  const w: Prisma.MWRWhereInput = {
    ...(o.employeeId ? { employeeId: o.employeeId } : {}),
    ...(o.branch ? { branch: o.branch } : {}),
    ...(o.year ? { year: o.year } : {}),
  };
  if (o.range) {
    w.OR = monthsInRange(o.range).map((ym) => ({ year: Number(ym.slice(0, 4)), month: Number(ym.slice(5, 7)) }));
  }
  return w;
}

// ─── Second batch: the remaining dated lists ─────────────────────────────────
// Date basis:
//   complaints         createdAt          timestamp (raised)
//   tasks              dueDate            calendar date (tasks with no due date drop out while filtered)
//   opportunities      createdAt          timestamp
//   AMC contracts      startDate..endDate overlapping the range (active during it)
//   service tickets    createdAt          timestamp
//   projects           createdAt          timestamp (start/end dates are optional)
//   purchase orders    createdAt          timestamp (PO raised)
//   goods received     receivedDate       calendar date
//   fleet trips        startTime          timestamp
//   fuel logs          date               calendar date
//   attendance         date               calendar date
//   leave requests     fromDate..toDate   overlapping the range
//   field plans (FJP)  forMonth           every plan month the range touches
//   work-order tickets receivedAt         timestamp
//   audit log          createdAt          timestamp
//   documents          createdAt          timestamp (uploaded)
//   digital approvals  createdAt          timestamp
//   tenders            createdAt          timestamp
//   machine schedules  scheduledStartAt   timestamp
//   material consumption, quality defects, rejections  createdAt  timestamp
//   quality checkpoints checkedAt         timestamp
//   error log          createdAt          timestamp

type Where = Record<string, unknown>;

/** Adds `{ [field]: {gte, lt} }` to a where object (no-op without a range). */
export function withRange<W extends Where>(where: W, field: string, range: Range, basis: "date" | "timestamp"): W {
  return range ? ({ ...where, [field]: rangeToWhere(range, basis) } as W) : where;
}

/** Records whose [startField, endField] period overlaps the range (both calendar dates). */
export function withOverlap<W extends Where>(where: W, startField: string, endField: string, range: Range): W {
  if (!range) return where;
  const { gte, lt } = rangeToWhere(range, "date");
  return { ...where, [startField]: { lt }, [endField]: { gte } } as W;
}

const pick = (o: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const complaintWhere = (o: { status?: string | null; priority?: string | null; range: Range }) =>
  withRange(pick({ status: o.status, priority: o.priority }), "createdAt", o.range, "timestamp") as Prisma.ComplaintWhereInput;

export const taskWhere = (o: { status?: string | null; priority?: string | null; assignedToId?: string | null; range: Range }) =>
  withRange(pick({ status: o.status, priority: o.priority, assignedToId: o.assignedToId }), "dueDate", o.range, "date") as Prisma.TaskWhereInput;

export const opportunityWhere = (o: { stage?: string | null; branch?: string | null; leadId?: string | null; range: Range }) =>
  withRange(pick({ stage: o.stage, branch: o.branch, leadId: o.leadId }), "createdAt", o.range, "timestamp") as Prisma.OpportunityWhereInput;

export const amcWhere = (o: { status?: string | null; range: Range }) =>
  withOverlap(pick({ status: o.status }), "startDate", "endDate", o.range) as Prisma.AMCContractWhereInput;

export const serviceTicketWhere = (o: { status?: string | null; priority?: string | null; range: Range }) =>
  withRange(pick({ status: o.status, priority: o.priority }), "createdAt", o.range, "timestamp") as Prisma.ServiceTicketWhereInput;

export const projectWhere = (o: { status?: string | null; branch?: string | null; range: Range }) =>
  withRange(pick({ status: o.status, branch: o.branch }), "createdAt", o.range, "timestamp") as Prisma.ProjectWhereInput;

export const purchaseOrderWhere = (o: { status?: string | null; range: Range }) =>
  withRange(pick({ status: o.status }), "createdAt", o.range, "timestamp") as Prisma.PurchaseOrderWhereInput;

export const grnWhere = (o: { range: Range }) =>
  withRange({}, "receivedDate", o.range, "date") as Prisma.GoodsReceivedWhereInput;

export const tripWhere = (o: { vehicleId?: string | null; range: Range }) =>
  withRange(pick({ vehicleId: o.vehicleId }), "startTime", o.range, "timestamp") as Prisma.FleetTripWhereInput;

export const fuelWhere = (o: { vehicleId?: string | null; range: Range }) =>
  withRange(pick({ vehicleId: o.vehicleId }), "date", o.range, "date") as Prisma.FuelLogWhereInput;

/** `date` (single day) and `month` are folded into `range` by the route. */
export const attendanceWhere = (o: { employeeId?: string | null; range: Range }) =>
  withRange(pick({ employeeId: o.employeeId }), "date", o.range, "date") as Prisma.AttendanceWhereInput;

export const leaveWhere = (o: { status?: string | null; employeeId?: string | null; range: Range }) =>
  withOverlap(pick({ status: o.status, employeeId: o.employeeId }), "fromDate", "toDate", o.range) as Prisma.LeaveRequestWhereInput;

/**
 * Field journey plans: sales managers may look at anyone's (?userId=);
 * everyone else only ever gets their own (a non-manager's ?userId= used to
 * expose other people's plans). `month` keeps its exact-match meaning;
 * from/to matches every plan month the range touches.
 */
export function fjpWhere(o: { role: string | undefined; myId: string | undefined; userId?: string | null; month?: string | null; range: Range }): Prisma.FJPWhereInput {
  const userId = isSalesManager(o.role) && o.userId ? o.userId : o.myId ?? "__none__";
  const w: Prisma.FJPWhereInput = { userId };
  if (o.month) w.forMonth = o.month;
  else if (o.range) w.forMonth = { in: monthsInRange(o.range) };
  return w;
}

export const workOrderTicketWhere = (base: Where, range: Range) =>
  withRange(base, "receivedAt", range, "timestamp") as Prisma.WorkOrderTicketWhereInput;

export const auditLogWhere = (o: { table?: string | null; userId?: string | null; range: Range }) =>
  withRange(pick({ tableName: o.table, userId: o.userId }), "createdAt", o.range, "timestamp") as Prisma.AuditLogWhereInput;

export const documentWhere = (base: Where, range: Range) =>
  withRange(base, "createdAt", range, "timestamp") as Prisma.DocumentWhereInput;

export const digitalApprovalWhere = (o: { type?: string | null; status?: string | null; range: Range }) =>
  withRange(pick({ type: o.type, status: o.status }), "createdAt", o.range, "timestamp") as Prisma.DigitalApprovalWhereInput;

export const tenderWhere = (o: { status?: string | null; branch?: string | null; range: Range }) =>
  withRange(pick({ status: o.status, branch: o.branch }), "createdAt", o.range, "timestamp") as Prisma.TenderWhereInput;

export const scheduleWhere = (o: { machineId?: string | null; workOrderId?: string | null; status?: string | null; range: Range }) =>
  withRange(pick({ machineId: o.machineId, workOrderId: o.workOrderId, status: o.status }), "scheduledStartAt", o.range, "timestamp") as Prisma.MachineScheduleWhereInput;

export const consumptionWhere = (o: { workOrderId?: string | null; materialId?: string | null; range: Range }) =>
  withRange(pick({ workOrderId: o.workOrderId, materialId: o.materialId }), "createdAt", o.range, "timestamp") as Prisma.MaterialConsumptionWhereInput;

export const checkpointWhere = (o: { workOrderId?: string | null; stage?: string | null; status?: string | null; range: Range }) =>
  withRange(pick({ workOrderId: o.workOrderId, stage: o.stage, status: o.status }), "checkedAt", o.range, "timestamp") as Prisma.QualityCheckpointWhereInput;

export const defectWhere = (o: { checkpointId?: string | null; severity?: string | null; range: Range }) =>
  withRange(pick({ checkpointId: o.checkpointId, severity: o.severity }), "createdAt", o.range, "timestamp") as Prisma.QualityDefectWhereInput;

export const rejectionWhere = (o: { workOrderId?: string | null; action?: string | null; range: Range }) =>
  withRange(pick({ workOrderId: o.workOrderId, action: o.action }), "createdAt", o.range, "timestamp") as Prisma.ProductionRejectionWhereInput;

export const errorLogWhere = (o: { range: Range }) =>
  withRange({}, "createdAt", o.range, "timestamp") as Prisma.ErrorLogWhereInput;

/** Opportunities header figures from (stage, probability) groups. */
export function summarizeOpportunities(groups: { stage: string; probability: number; value: number; count: number }[]) {
  const isOpen = (st: string) => st !== "CLOSED_WON" && st !== "CLOSED_LOST";
  return {
    openCount: groups.filter((g) => isOpen(g.stage)).reduce((s, g) => s + g.count, 0),
    weightedPipeline: groups.filter((g) => isOpen(g.stage)).reduce((s, g) => s + (g.value * g.probability) / 100, 0),
    wonValue: groups.filter((g) => g.stage === "CLOSED_WON").reduce((s, g) => s + g.value, 0),
    totalValue: groups.reduce((s, g) => s + g.value, 0),
  };
}
