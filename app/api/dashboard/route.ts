import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";
import { Branch, LeadStatus, OrderStatus } from "@prisma/client";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalLeads,
    newLeadsThisMonth,
    leadFunnelRaw,
    ordersThisMonth,
    revenueThisMonth,
    collectionThisMonth,
    openComplaints,
    branchOrdersRaw,
    monthlyRevenueRaw,
  ] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { id: true },
      _sum: { value: true },
      where: { status: { notIn: [LeadStatus.WON, LeadStatus.LOST] } },
    }),
    prisma.salesOrder.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.salesOrder.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: monthStart },
        status: { in: [OrderStatus.INVOICED, OrderStatus.COLLECTED] },
      },
    }),
    prisma.collection.aggregate({
      _sum: { amount: true },
      where: { collectionDate: { gte: monthStart } },
    }),
    prisma.complaint.count({
      where: { status: { in: ["OPEN" as const, "IN_PROGRESS" as const] } },
    }),
    prisma.salesOrder.groupBy({
      by: ["customerId"],
      _sum: { totalAmount: true },
      _count: { id: true },
      where: { createdAt: { gte: monthStart } },
    }),
    // Monthly revenue for chart — last 6 months
    prisma.salesOrder.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: [OrderStatus.INVOICED, OrderStatus.COLLECTED] },
      },
      select: { totalAmount: true, createdAt: true },
    }),
  ]);

  // Branch performance
  const branchRev = await prisma.salesOrder.groupBy({
    by: ["customerId"],
    _sum: { totalAmount: true },
    _count: { id: true },
    where: { createdAt: { gte: monthStart } },
  });

  // Get branch from customers for those orders
  const branchRevByBranch = await prisma.$queryRaw<{ branch: Branch; revenue: number; orders: number }[]>`
    SELECT c.branch,
           COALESCE(SUM(so."totalAmount"), 0)::float AS revenue,
           COUNT(so.id)::int AS orders
    FROM sales_orders so
    JOIN customers c ON so."customerId" = c.id
    WHERE so."createdAt" >= ${monthStart}
    GROUP BY c.branch
  `;

  // Lead funnel
  const statusLabels: Record<string, string> = {
    NEW: "New", CONTACTED: "Contacted", QUALIFIED: "Qualified",
    PROPOSAL: "Proposal", NEGOTIATION: "Negotiation",
  };
  const leadFunnel = leadFunnelRaw.map((f) => ({
    stage: statusLabels[f.status] ?? f.status,
    count: f._count.id,
    value: f._sum.value ?? 0,
  }));

  // Monthly revenue chart
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revByMonth: Record<string, number> = {};
  for (const o of monthlyRevenueRaw) {
    const key = monthNames[o.createdAt.getMonth()];
    revByMonth[key] = (revByMonth[key] ?? 0) + o.totalAmount;
  }
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = monthNames[d.getMonth()];
    monthlyRevenue.push({ month, revenue: revByMonth[month] ?? 0, target: 2500000 });
  }

  // Pipeline value (leads not Won/Lost)
  const pipelineValue = (await prisma.lead.aggregate({
    _sum: { value: true },
    where: { status: { notIn: [LeadStatus.WON, LeadStatus.LOST] } },
  }))._sum.value ?? 0;

  const revenueValue = revenueThisMonth._sum.totalAmount ?? 0;
  const collectionValue = collectionThisMonth._sum.amount ?? 0;
  const collectionTarget = 1800000; // can be moved to settings table later

  const allBranches: Branch[] = ["TVM", "KTYM", "EKM", "CLT"];
  const branchPerformance = allBranches.map((b) => {
    const found = branchRevByBranch.find((r) => r.branch === b);
    return { branch: b, revenue: found?.revenue ?? 0, orders: found?.orders ?? 0, leads: 0 };
  });

  return NextResponse.json({
    data: {
      totalLeads,
      newLeadsThisMonth,
      pipelineValue,
      ordersThisMonth,
      revenueThisMonth: revenueValue,
      collectionTarget,
      collectionAchieved: collectionValue,
      openComplaints,
      branchPerformance,
      monthlyRevenue,
      leadFunnel,
    },
  });
}
