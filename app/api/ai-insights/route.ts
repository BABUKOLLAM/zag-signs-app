import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return err("Unauthorized", 401);

  const now = new Date();
  const d90 = new Date(now); d90.setDate(d90.getDate() - 90);
  const d30 = new Date(now); d30.setDate(d30.getDate() - 30);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Lead prioritisation: open leads sorted by value + activity ──
  const openLeads = await prisma.lead.findMany({
    where: { status: { notIn: ["WON", "LOST"] } },
    orderBy: [{ value: "desc" }, { updatedAt: "desc" }],
    take: 8,
  }).catch(() => []);

  const leadPriority = openLeads.map(l => {
    const daysSinceUpdate = Math.floor((now.getTime() - new Date(l.updatedAt).getTime()) / 86400000);
    const stageScore = l.status === "NEGOTIATION" ? 40 : l.status === "PROPOSAL" ? 30 : l.status === "QUALIFIED" ? 20 : 10;
    const score = Math.min(99, Math.round(
      ((l.value ?? 0) / 500000) * 30 +
      stageScore +
      Math.max(0, 30 - daysSinceUpdate)
    ));
    return {
      id: l.id, name: l.name, company: l.company ?? l.name,
      stage: l.status, score, estimatedValue: l.value ?? 0,
      daysSinceUpdate, branch: l.branch,
    };
  }).sort((a, b) => b.score - a.score);

  // ── Churn risk: customers with no order in 90+ days ──
  const customers = await prisma.customer.findMany({
    include: { salesOrders: { orderBy: { createdAt: "desc" }, take: 1 } },
    take: 200,
  }).catch(() => []);

  const churnRisk = customers
    .map(c => {
      const lastOrder = c.salesOrders[0];
      const daysSince = lastOrder
        ? Math.floor((now.getTime() - new Date(lastOrder.createdAt).getTime()) / 86400000)
        : 999;
      const risk = daysSince > 180 ? "High" : daysSince > 90 ? "Medium" : "Low";
      const riskPct = Math.min(95, Math.round((daysSince / 365) * 100));
      return { id: c.id, customer: c.name, company: c.company ?? "", risk, riskPct, daysSince, branch: c.branch };
    })
    .filter(c => c.risk !== "Low")
    .sort((a, b) => b.riskPct - a.riskPct)
    .slice(0, 8);

  // ── Branch performance this month ──
  const branchRevenue = await prisma.invoice.groupBy({
    by: ["branch" as any],
    where: { invoiceDate: { gte: thisMonthStart }, status: { in: ["PAID", "PARTIAL"] } },
    _sum: { totalAmount: true },
  }).catch(() => []);

  const branchOrders = await prisma.salesOrder.groupBy({
    by: ["branch" as any],
    where: { createdAt: { gte: thisMonthStart } },
    _count: { id: true },
  }).catch(() => []);

  const branchLeads = await prisma.lead.groupBy({
    by: ["branch" as any],
    where: { createdAt: { gte: thisMonthStart } },
    _count: { id: true },
  }).catch(() => []);

  const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];
  const branchPerf = BRANCHES.map(b => ({
    branch: b,
    revenue: (branchRevenue as any[]).find((r: any) => r.branch === b)?._sum?.totalAmount ?? 0,
    orders: (branchOrders as any[]).find((r: any) => r.branch === b)?._count?.id ?? 0,
    leads: (branchLeads as any[]).find((r: any) => r.branch === b)?._count?.id ?? 0,
  }));

  // ── Summary counts ──
  const [totalLeads, openOrders, openComplaints, openTickets] = await Promise.all([
    prisma.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } }).catch(() => 0),
    prisma.salesOrder.count({ where: { status: { notIn: ["INVOICED", "COLLECTED"] } } }).catch(() => 0),
    prisma.complaint.count({ where: { status: { notIn: ["RESOLVED", "CLOSED"] } } }).catch(() => 0),
    prisma.workOrderTicket.count({ where: { status: { notIn: ["DONE", "BILLED", "CANCELLED"] } } }).catch(() => 0),
  ]);

  // ── Recent 30-day revenue trend ──
  const recentInvoices = await prisma.invoice.findMany({
    where: { invoiceDate: { gte: d30 }, status: { in: ["PAID", "PARTIAL"] } },
    select: { invoiceDate: true, totalAmount: true },
    orderBy: { invoiceDate: "asc" },
  }).catch(() => []);

  const weekMap: Record<string, number> = {};
  recentInvoices.forEach(inv => {
    const d = new Date(inv.invoiceDate);
    const week = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleString("en-IN", { month: "short" })}`;
    weekMap[week] = (weekMap[week] ?? 0) + inv.totalAmount;
  });
  const revenueTrend = Object.entries(weekMap).map(([week, revenue]) => ({ week, revenue }));

  return ok({
    leadPriority,
    churnRisk,
    branchPerf,
    revenueTrend,
    summary: { totalLeads, openOrders, openComplaints, openTickets },
  });
}
