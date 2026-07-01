import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err } from "@/lib/api-helpers";


export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7); // YYYY-MM

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
        // Activities this month
        const monthStart = new Date(`${month}-01`);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const activities = await prisma.activityLog.findMany({
          where: {
            userId: user.id,
            startTime: { gte: monthStart, lt: monthEnd },
          },
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
            createdAt: { gte: monthStart, lt: monthEnd },
          },
        });

        const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0);

        // Get sales target for this month
        const target = await prisma.salesTarget.findUnique({
          where: {
            userId_month: {
              userId: user.id,
              month,
            },
          },
        });

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
