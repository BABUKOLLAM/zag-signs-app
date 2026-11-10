import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, autoNo, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { scheduleWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function GET(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const machineId = searchParams.get("machineId");
    const workOrderId = searchParams.get("workOrderId");
    const status = searchParams.get("status");
    const date = searchParams.get("date"); // YYYY-MM-DD for filtering

    // from/to; the older single ?date=YYYY-MM-DD is a one-day range. Start times are India days.
    const { range, error: rangeError } = rangeFromQuery(new URLSearchParams({
      from: searchParams.get("from") || date || "",
      to: searchParams.get("to") || date || "",
    }), { allowMonth: false });
    if (rangeError) return rangeError;
    const where = scheduleWhere({ machineId, workOrderId, status, range });

    const [schedules, total] = await Promise.all([prisma.machineSchedule.findMany({
      where,
      include: {
        machine: true,
        workOrder: true,
        operator: { select: { id: true, name: true } },
      },
      orderBy: { scheduledStartAt: "asc" },
      take: 300,
    }), prisma.machineSchedule.count({ where })]);

    return okList(schedules, { total, limit: 300 });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

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
