import { NextRequest } from "next/server";
import { requirePathAccess, ok, err, rangeFromQuery } from "@/lib/api-helpers";
import { darActivityWhere } from "@/lib/list-filters";
import { isValidYmd, istDayOf, todayIst } from "@/lib/date-range";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/sales/dar");
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();
    const { date } = body; // YYYY-MM-DD format
    if (!isValidYmd(date)) return err("date must be a valid YYYY-MM-DD date between 2000 and 2100");

    // Get the user's activities for that India day
    const activities = await prisma.activityLog.findMany({
      where: darActivityWhere({ myId: (session.user as any).id, range: { from: date, to: date } }),
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
  const session = await requirePathAccess("/sales/dar");
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    // from/to (or the legacy single ?date=) — defaults to today in India.
    const legacyDate = searchParams.get("date");
    const { range: parsed, error: rangeError } = rangeFromQuery(
      new URLSearchParams({
        from: searchParams.get("from") || legacyDate || "",
        to: searchParams.get("to") || legacyDate || "",
      }),
      { allowMonth: false },
    );
    if (rangeError) return rangeError;
    const range = parsed ?? { from: todayIst(), to: todayIst() };
    const date = range.from;

    const activities = await prisma.activityLog.findMany({
      where: darActivityWhere({ myId: (session.user as any).id, range }),
      orderBy: { startTime: "asc" },
      include: {
        customer: true,
        lead: true,
      },
    });

    const darData = {
      date,
      from: range.from,
      to: range.to,
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
        day: istDayOf(a.startTime),
        time: a.startTime.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" }),
      })),
      totalTime: activities.reduce((sum, a) => sum + (a.duration || 0), 0),
    };

    return ok(darData, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
