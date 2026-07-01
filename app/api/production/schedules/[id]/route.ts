import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err } from "@/lib/api-helpers";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();
    const { id } = await params;

    const schedule = await prisma.machineSchedule.update({
      where: { id },
      data: {
        actualStartAt: body.actualStartAt ? new Date(body.actualStartAt) : undefined,
        actualEndAt: body.actualEndAt ? new Date(body.actualEndAt) : undefined,
        actualOutput: body.actualOutput || undefined,
        status: body.status || undefined,
        notes: body.notes || undefined,
      },
      include: {
        machine: true,
        workOrder: true,
        operator: true,
      },
    });

    return ok(schedule, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const { id } = await params;

    const schedule = await prisma.machineSchedule.findUnique({
      where: { id },
      include: {
        machine: true,
        workOrder: true,
        operator: true,
      },
    });

    if (!schedule) {
      return err("Schedule not found", 404);
    }

    return ok(schedule, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
