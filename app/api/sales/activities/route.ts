import { NextRequest } from "next/server";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const customerId = searchParams.get("customerId");
    const leadId = searchParams.get("leadId");
    const type = searchParams.get("type");

    const where: any = {};
    if (userId) where.userId = userId;
    if (customerId) where.customerId = customerId;
    if (leadId) where.leadId = leadId;
    if (type) where.type = type;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      where.AND = [
        { startTime: { gte: startOfDay } },
        { startTime: { lte: endOfDay } },
      ];
    }

    const activities = await prisma.activityLog.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        lead: { select: { id: true, leadNo: true, name: true } },
        opportunity: { select: { id: true, title: true } },
        user: { select: { id: true, name: true } },
        reminders: { select: { id: true, reminderDate: true, isDone: true } },
      },
      orderBy: { startTime: "desc" },
      take: 100,
    });

    return new Response(JSON.stringify(ok(activities)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

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

    return new Response(JSON.stringify(ok(activity)), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
