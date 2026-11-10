import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePathAccess, okWithMeta, err, rangeFromQuery } from "@/lib/api-helpers";
import { monthToRange, monthsInRange, rangeToWhere, todayIst } from "@/lib/date-range";
import { isSalesManager } from "@/lib/list-filters";
import { collectionOwner, monthCoverage, pct, proratedTargets, type MonthlyTarget } from "@/lib/team-performance";

const TEAM_ROLES = ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] as const;

// Used for a month with no SalesTarget row (same numbers as before, per month).
const DEFAULT_MONTHLY = {
  callsTarget: 15, visitsTarget: 5, followUpsTarget: 10,
  ordersTarget: 3, revenueTarget: 500000, collectionTarget: 200000,
};

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/sales/team");
  if (!session) return err("Forbidden", 403);
  // Everyone's numbers — managers only (MD / AVP / Business Manager).
  if (!isSalesManager((session.user as { role?: string }).role)) return err("Forbidden", 403);

  try {
    // from/to, or the legacy ?month=YYYY-MM; defaults to the current month (India).
    const { range: parsed, error: rangeError } = rangeFromQuery(req.nextUrl.searchParams);
    if (rangeError) return rangeError;
    const range = parsed ?? monthToRange(todayIst().slice(0, 7))!;
    const months = monthsInRange(range);
    const tsRange = rangeToWhere(range, "timestamp");   // activity start, opportunity created
    const dayRange = rangeToWhere(range, "date");       // order date, collection date

    const users = await prisma.user.findMany({
      where: { role: { in: [...TEAM_ROLES] } },
      select: { id: true, name: true, branch: true, role: true },
    });
    const ids = users.map((u) => u.id);

    // One query per metric for the whole team (was several queries per person).
    const [activityCounts, opportunities, orders, collections, targets] = await Promise.all([
      prisma.activityLog.groupBy({
        by: ["userId", "type"],
        where: { userId: { in: ids }, startTime: tsRange },
        _count: { _all: true },
      }),
      prisma.opportunity.findMany({
        where: { createdAt: tsRange, lead: { assignedToId: { in: ids } } },
        select: { value: true, stage: true, lead: { select: { assignedToId: true } } },
      }),
      prisma.salesOrder.findMany({
        where: { orderDate: dayRange, quotation: { proposedById: { in: ids } } },
        select: { status: true, totalAmount: true, quotation: { select: { proposedById: true } } },
      }),
      prisma.collection.findMany({
        where: { collectionDate: dayRange },
        select: {
          amount: true,
          salesOrder: { select: { quotation: { select: { proposedById: true } } } },
          invoice: {
            select: {
              quotation: { select: { proposedById: true } },
              salesOrder: { select: { quotation: { select: { proposedById: true } } } },
            },
          },
        },
      }),
      prisma.salesTarget.findMany({ where: { userId: { in: ids }, month: { in: months } } }),
    ]);

    const count = (userId: string, type: string) =>
      activityCounts.find((a) => a.userId === userId && a.type === type)?._count._all ?? 0;

    const collectedBy = new Map<string, number>();
    let unattributedCollected = 0;
    for (const c of collections) {
      const owner = collectionOwner(c);
      if (owner && ids.includes(owner)) collectedBy.set(owner, (collectedBy.get(owner) ?? 0) + c.amount);
      else unattributedCollected += c.amount;
    }

    const teamMetrics = users.map((user) => {
      const calls = count(user.id, "CALL");
      const visits = count(user.id, "VISIT");
      const followUps = count(user.id, "FOLLOW_UP");

      const myOpps = opportunities.filter((o) => o.lead?.assignedToId === user.id);
      const opportunityValue = myOpps.reduce((s, o) => s + (o.value || 0), 0);
      const wonCount = myOpps.filter((o) => o.stage === "CLOSED_WON").length;

      const myOrders = orders.filter((o) => o.quotation?.proposedById === user.id);
      const confirmedOrders = myOrders.filter((o) => o.status === "CONFIRMED").length;
      const totalOrderValue = myOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);

      const totalCollected = collectedBy.get(user.id) ?? 0;

      // Monthly targets (or the default) for each month, pro-rated by days in range.
      const rows: MonthlyTarget[] = months.map((m) =>
        targets.find((t) => t.userId === user.id && t.month === m) ?? { month: m, ...DEFAULT_MONTHLY },
      );
      const target = proratedTargets(rows, range)!;
      const targetsSet = targets.filter((t) => t.userId === user.id).length;

      return {
        userId: user.id,
        name: user.name,
        branch: user.branch,
        role: user.role,
        metrics: {
          calls, callsTarget: target.callsTarget,
          visits, visitsTarget: target.visitsTarget,
          followUps, followUpsTarget: target.followUpsTarget,
          confirmedOrders, ordersTarget: target.ordersTarget, totalOrderValue,
          opportunityValue, revenueTarget: target.revenueTarget, wonCount,
          totalCollected, collectionTarget: target.collectionTarget,
        },
        achievements: {
          callAchievement: pct(calls, target.callsTarget),
          visitAchievement: pct(visits, target.visitsTarget),
          orderAchievement: pct(confirmedOrders, target.ordersTarget),
          revenueAchievement: pct(totalCollected, target.revenueTarget),
        },
        targetBasis: { monthsWithTargetSet: targetsSet, monthsInRange: months.length },
      };
    });

    return okWithMeta(teamMetrics, {
      from: range.from,
      to: range.to,
      monthCoverage: monthCoverage(range),
      unattributedCollected,
    });
  } catch (error: unknown) {
    return err(error instanceof Error ? error.message : "Failed", 500);
  }
}

