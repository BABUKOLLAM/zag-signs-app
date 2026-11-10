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
