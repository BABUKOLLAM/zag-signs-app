import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePathAccess, ok, err, rangeFromQuery } from "@/lib/api-helpers";
import { monthToRange, monthsInRange, rangeToWhere, todayIst } from "@/lib/date-range";


export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/sales/team");
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    // from/to, or the legacy ?month=YYYY-MM; defaults to the current month (India).
    const { range: parsed, error: rangeError } = rangeFromQuery(searchParams);
    if (rangeError) return rangeError;
    const range = parsed ?? monthToRange(todayIst().slice(0, 7))!;
    const months = monthsInRange(range);
    const startTime = rangeToWhere(range, "timestamp");

    // Get all users (filter to sales team)
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["SALES_EXECUTIVE", "CRES", "BUSINESS_MANAGER"] },
      },
      select: { id: true, name: true, branch: true, role: true },
    });

    // Calculate metrics for each team member
    const teamMetrics = await Promise.all(
      users.map(async (user) => {
        // Activities in the range (India days)
        const activities = await prisma.activityLog.findMany({
          where: { userId: user.id, startTime },
        });

        const calls = activities.filter((a) => a.type === "CALL").length;
        const visits = activities.filter((a) => a.type === "VISIT").length;
        const followUps = activities.filter((a) => a.type === "FOLLOW_UP").length;

        // Opportunities assigned/created by this user
        const opportunities = await prisma.opportunity.findMany({
          where: {
            lead: {
              assignedToId: user.id,
            },
          },
        });

        const opportunityValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
        const wonCount = opportunities.filter((o) => o.stage === "CLOSED_WON").length;

        // Sales orders
        const salesOrders = await prisma.salesOrder.findMany({
          where: {
            customer: {
              quotations: {
                some: {
                  proposedById: user.id,
                },
              },
            },
          },
        });

        const confirmedOrders = salesOrders.filter((so) => so.status === "CONFIRMED").length;
        const totalOrderValue = salesOrders.reduce((sum, so) => sum + (so.totalAmount || 0), 0);

        // Collections
        const collections = await prisma.collection.findMany({
          where: {
            createdAt: startTime,
          },
        });

        const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);

        // Monthly targets for every month the range touches, summed. For a
        // single month this is exactly the old findUnique(userId_month).
        const targetRows = await prisma.salesTarget.findMany({
          where: { userId: user.id, month: { in: months } },
        });
        const sumOf = (k: "callsTarget" | "visitsTarget" | "followUpsTarget" | "ordersTarget" | "revenueTarget" | "collectionTarget") =>
          targetRows.reduce((acc, t) => acc + (Number(t[k]) || 0), 0);
        const target = targetRows.length
          ? {
              callsTarget: sumOf("callsTarget"), visitsTarget: sumOf("visitsTarget"),
              followUpsTarget: sumOf("followUpsTarget"), ordersTarget: sumOf("ordersTarget"),
              revenueTarget: sumOf("revenueTarget"), collectionTarget: sumOf("collectionTarget"),
            }
          : null;

        return {
          userId: user.id,
          name: user.name,
          branch: user.branch,
          role: user.role,
          metrics: {
            calls,
            callsTarget: target?.callsTarget || 15,
            visits,
            visitsTarget: target?.visitsTarget || 5,
            followUps,
            followUpsTarget: target?.followUpsTarget || 10,
            confirmedOrders,
            ordersTarget: target?.ordersTarget || 3,
            opportunityValue,
            revenueTarget: target?.revenueTarget || 500000,
            wonCount,
            totalCollected,
            collectionTarget: target?.collectionTarget || 200000,
          },
          achievements: {
            callAchievement: target?.callsTarget ? Math.round((calls / target.callsTarget) * 100) : 0,
            visitAchievement: target?.visitsTarget ? Math.round((visits / target.visitsTarget) * 100) : 0,
            orderAchievement: target?.ordersTarget ? Math.round((confirmedOrders / target.ordersTarget) * 100) : 0,
            revenueAchievement: target?.revenueTarget ? Math.round((totalCollected / target.revenueTarget) * 100) : 0,
          },
        };
      })
    );

    return ok(teamMetrics, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
