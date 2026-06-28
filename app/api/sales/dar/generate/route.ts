import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();
    const { date } = body; // YYYY-MM-DD format

    // Get activities for the specified date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: (session.user as any).id,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        customer: true,
        lead: true,
      },
    });

    // Generate DAR data
    const darData = {
      date,
      activities: {
        calls: activities.filter((a) => a.type === "CALL").length,
        visits: activities.filter((a) => a.type === "VISIT").length,
        followUps: activities.filter((a) => a.type === "FOLLOW_UP").length,
        emails: activities.filter((a) => a.type === "EMAIL").length,
      },
      outcomes: {
        ordersBooked: activities.filter((a) => a.outcome?.toLowerCase().includes("order")).length,
        meetingsScheduled: activities.filter((a) => a.outcome?.toLowerCase().includes("meeting")).length,
        quotationsSent: activities.filter((a) => a.outcome?.toLowerCase().includes("quotation")).length,
      },
      activityDetails: activities.map((a) => ({
        type: a.type,
        customerOrLead: a.customer?.name || a.lead?.name,
        purpose: a.purpose,
        outcome: a.outcome,
        duration: a.duration,
      })),
      highlights: activities
        .filter((a) => a.outcome)
        .map((a) => `${a.type}: ${a.customer?.name || a.lead?.name} - ${a.outcome}`)
        .slice(0, 3),
      totalTime: activities.reduce((sum, a) => sum + (a.duration || 0), 0),
    };

    return ok({ ...darData, action: "submitted" }, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

// GET endpoint to preview DAR without saving
export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: (session.user as any).id,
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        customer: true,
        lead: true,
      },
    });

    const darData = {
      date,
      activities: {
        calls: activities.filter((a) => a.type === "CALL").length,
        visits: activities.filter((a) => a.type === "VISIT").length,
        followUps: activities.filter((a) => a.type === "FOLLOW_UP").length,
        emails: activities.filter((a) => a.type === "EMAIL").length,
      },
      outcomes: {
        ordersBooked: activities.filter((a) => a.outcome?.toLowerCase().includes("order")).length,
        meetingsScheduled: activities.filter((a) => a.outcome?.toLowerCase().includes("meeting")).length,
        quotationsSent: activities.filter((a) => a.outcome?.toLowerCase().includes("quotation")).length,
      },
      activityDetails: activities.map((a) => ({
        type: a.type,
        customerOrLead: a.customer?.name || a.lead?.name,
        purpose: a.purpose,
        outcome: a.outcome,
        duration: a.duration,
        time: a.startTime.toLocaleTimeString(),
      })),
      totalTime: activities.reduce((sum, a) => sum + (a.duration || 0), 0),
    };

    return ok(darData, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
