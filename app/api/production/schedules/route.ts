import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";


export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const machineId = searchParams.get("machineId");
    const workOrderId = searchParams.get("workOrderId");
    const status = searchParams.get("status");
    const date = searchParams.get("date"); // YYYY-MM-DD for filtering

    const where: any = {};
    if (machineId) where.machineId = machineId;
    if (workOrderId) where.workOrderId = workOrderId;
    if (status) where.status = status;

    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(endOfDay.getDate() + 1);
      where.AND = [
        { scheduledStartAt: { gte: startOfDay } },
        { scheduledStartAt: { lt: endOfDay } },
      ];
    }

    const schedules = await prisma.machineSchedule.findMany({
      where,
      include: {
        machine: true,
        workOrder: true,
        operator: { select: { id: true, name: true } },
      },
      orderBy: { scheduledStartAt: "asc" },
      take: 300,
    });

    return ok(schedules, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();

    // Check for conflicts - overlapping schedules on same machine
    const overlapping = await prisma.machineSchedule.findMany({
      where: {
        machineId: body.machineId,
        status: { in: ["SCHEDULED", "IN_PROGRESS"] },
        AND: [
          { scheduledStartAt: { lt: new Date(body.scheduledEndAt) } },
          { scheduledEndAt: { gt: new Date(body.scheduledStartAt) } },
        ],
      },
    });

    if (overlapping.length > 0) {
      return new Response(
        JSON.stringify(err("Machine already scheduled during this time slot")),
        { status: 409 }
      );
    }

    // Generate schedule number
    const count = await prisma.machineSchedule.count();
    const scheduleNo = autoNo("SCH", count);

    const schedule = await prisma.machineSchedule.create({
      data: {
        scheduleNo,
        workOrderId: body.workOrderId,
        machineId: body.machineId,
        scheduledStartAt: new Date(body.scheduledStartAt),
        scheduledEndAt: new Date(body.scheduledEndAt),
        estimatedOutput: body.estimatedOutput || null,
        operatorId: body.operatorId || null,
        notes: body.notes || null,
      },
      include: {
        machine: true,
        workOrder: true,
        operator: true,
      },
    });

    return ok(schedule, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
