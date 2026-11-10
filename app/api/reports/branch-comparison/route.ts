import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err, rangeFromQuery } from "@/lib/api-helpers";
import { rangeToWhere } from "@/lib/date-range";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  // Inclusive India-day ranges: invoiceDate is a calendar date, the rest are timestamps.
  const hasDate = !!range;
  const dateRange = range ? rangeToWhere(range, "timestamp") : {};
  const invoiceRange = range ? rangeToWhere(range, "date") : {};

  const [revenue, invoiced, leads, quotations, customers, tickets] = await Promise.all([
    // Revenue collected (paid + partial invoices)
    prisma.invoice.groupBy({
      by: ["branch" as any],
      where: { ...(hasDate ? { invoiceDate: invoiceRange } : {}), status: { in: ["PAID", "PARTIAL"] } },
      _sum: { totalAmount: true },
    }).catch(() => []),

    // Total invoiced (all statuses)
    prisma.invoice.groupBy({
      by: ["branch" as any],
      where: hasDate ? { invoiceDate: invoiceRange } : {},
      _sum: { totalAmount: true },
    }).catch(() => []),

    // New leads
    prisma.lead.groupBy({
      by: ["branch" as any],
      where: hasDate ? { createdAt: dateRange } : {},
      _count: { id: true },
    }).catch(() => []),

    // Quotations raised
    prisma.quotation.groupBy({
      by: ["branch" as any],
      where: hasDate ? { createdAt: dateRange } : {},
      _count: { id: true },
    }).catch(() => []),

    // Customers (active in period)
    prisma.customer.groupBy({
      by: ["branch" as any],
      where: hasDate ? { createdAt: dateRange } : {},
      _count: { id: true },
    }).catch(() => []),

    // Work order tickets
    prisma.workOrderTicket.groupBy({
      by: ["branch" as any],
      where: hasDate ? { createdAt: dateRange } : {},
      _count: { id: true },
    }).catch(() => []),
  ]);

  const branches = BRANCHES.map(b => ({
    branch:     b,
    revenue:    (revenue as any[]).find(r => r.branch === b)?._sum?.totalAmount    ?? 0,
    invoiced:   (invoiced as any[]).find(r => r.branch === b)?._sum?.totalAmount   ?? 0,
    leads:      (leads as any[]).find(r => r.branch === b)?._count?.id             ?? 0,
    quotations: (quotations as any[]).find(r => r.branch === b)?._count?.id        ?? 0,
    customers:  (customers as any[]).find(r => r.branch === b)?._count?.id         ?? 0,
    tickets:    (tickets as any[]).find(r => r.branch === b)?._count?.id           ?? 0,
  }));

  const topBranch = branches.reduce(
    (best, b) => b.revenue > best.revenue ? b : best,
    branches[0]
  ).branch;

  return ok({ branches, topBranch });
}
