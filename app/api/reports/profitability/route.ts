import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { searchParams } = new URL(req.url);
  const branch = searchParams.get("branch") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };

  // Job costs with linked sales orders
  const jobCosts = await prisma.jobCost.findMany({
    include: {
      salesOrder: {
        include: {
          customer: { select: { id: true, name: true, company: true } },
          invoices: { select: { totalAmount: true, status: true } },
        },
      },
      lines: true,
    },
    ...(from || to ? {
      where: { createdAt: Object.keys(dateFilter).length ? dateFilter : undefined },
    } : {}),
  });

  // Branch-level revenue from invoices
  const branchRevenue = await prisma.invoice.groupBy({
    by: ["branch" as any],
    where: {
      status: { in: ["PAID", "PARTIAL"] },
      ...(from || to ? { invoiceDate: Object.keys(dateFilter).length ? dateFilter : undefined } : {}),
    },
    _sum: { totalAmount: true },
  }).catch(() => []);

  // Collections by branch
  const branchCollections = await prisma.collection.groupBy({
    by: ["branch" as any],
    where: from || to ? { collectionDate: Object.keys(dateFilter).length ? { gte: from ? new Date(from) : undefined, lte: to ? new Date(to) : undefined } : undefined } : {},
    _sum: { amount: true },
  }).catch(() => []);

  // Per-job profitability
  const jobs = jobCosts.map((jc) => {
    const totalCost = jc.lines.reduce((s, l) => s + l.totalCost, 0);
    const revenue = jc.revenueActual > 0 ? jc.revenueActual : jc.revenueQuoted;
    const grossMargin = revenue > 0 ? ((revenue - totalCost) / revenue) * 100 : 0;
    const costBreakdown: Record<string, number> = {};
    jc.lines.forEach((l) => {
      costBreakdown[l.category] = (costBreakdown[l.category] ?? 0) + l.totalCost;
    });
    return {
      id: jc.id,
      salesOrderId: jc.salesOrderId,
      orderNo: jc.salesOrder?.orderNo,
      customer: jc.salesOrder?.customer?.name,
      company: jc.salesOrder?.customer?.company,
      revenueQuoted: jc.revenueQuoted,
      revenueActual: jc.revenueActual,
      totalCost,
      grossProfit: revenue - totalCost,
      grossMarginPct: Math.round(grossMargin * 10) / 10,
      costBreakdown,
    };
  });

  return NextResponse.json(ok({
    jobs,
    branchRevenue,
    branchCollections,
    summary: {
      totalRevenue: jobs.reduce((s, j) => s + j.revenueActual, 0),
      totalCost: jobs.reduce((s, j) => s + j.totalCost, 0),
      totalProfit: jobs.reduce((s, j) => s + j.grossProfit, 0),
      avgMarginPct: jobs.length ? jobs.reduce((s, j) => s + j.grossMarginPct, 0) / jobs.length : 0,
    },
  }));
}
