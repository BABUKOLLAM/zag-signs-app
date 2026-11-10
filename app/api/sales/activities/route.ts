import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePathAccess, ok, err, autoNo, rangeFromQuery, okList } from "@/lib/api-helpers";
import { activityWhere } from "@/lib/list-filters";


const ACTIVITY_CAP = 100;

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/sales/activities");
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const customerId = searchParams.get("customerId");
    const leadId = searchParams.get("leadId");
    const type = searchParams.get("type");

    // Legacy ?date=YYYY-MM-DD is treated as a one-day range. Days are India days.
    const { range, error: rangeError } = rangeFromQuery(
      new URLSearchParams({ from: searchParams.get("from") || date || "", to: searchParams.get("to") || date || "" }),
      { allowMonth: false },
    );
    if (rangeError) return rangeError;
    const where = activityWhere({
      role: (session.user as { role?: string }).role,
      myId: (session.user as { id?: string }).id,
      userId, customerId, leadId, type, range,
    });

    const [activities, total] = await Promise.all([prisma.activityLog.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        lead: { select: { id: true, leadNo: true, name: true } },
        opportunity: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
        reminders: { select: { id: true, reminderDate: true, isDone: true } },
      },
      orderBy: { startTime: "desc" },
      take: ACTIVITY_CAP,
    }), prisma.activityLog.count({ where })]);

    return okList(activities, { total, limit: ACTIVITY_CAP });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/sales/activities");
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();

    // Generate activity number
    const count = await prisma.activityLog.count();
    const activityNo = autoNo("AL", count);

    // Calculate duration if both times provided
    let duration: number | null = null;
    if (body.startTime && body.endTime) {
      const start = new Date(body.startTime);
      const end = new Date(body.endTime);
      duration = Math.round((end.getTime() - start.getTime()) / 60000); // minutes
    }

    const activity = await prisma.activityLog.create({
      data: {
        activityNo,
        type: body.type,
        customerId: body.customerId || null,
        leadId: body.leadId || null,
        opportunityId: body.opportunityId || null,
        userId: (session.user as any).id,
        startTime: new Date(body.startTime),
        endTime: body.endTime ? new Date(body.endTime) : null,
        duration,
        purpose: body.purpose || null,
        outcome: body.outcome || null,
        nextActionRequired: body.nextActionRequired || false,
        nextActionDate: body.nextActionDate ? new Date(body.nextActionDate) : null,
        nextActionDescription: body.nextActionDescription || null,
        notes: body.notes || null,
      },
      include: {
        customer: true,
        lead: true,
        opportunity: true,
        user: true,
      },
    });

    // Create follow-up reminder if scheduled
    if (body.nextActionDate && body.nextActionRequired) {
      await prisma.followUpReminder.create({
        data: {
          activityLogId: activity.id,
          reminderDate: new Date(body.nextActionDate),
          reminderType: body.reminderType || "CALL",
        },
      });
    }

    return ok(activity, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
