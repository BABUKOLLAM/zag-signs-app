import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const body = await req.json();
    const { id } = params;

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

    return new Response(JSON.stringify(ok(schedule)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const { id } = params;

    const schedule = await prisma.machineSchedule.findUnique({
      where: { id },
      include: {
        machine: true,
        workOrder: true,
        operator: true,
      },
    });

    if (!schedule) {
      return new Response(JSON.stringify(err("Schedule not found")), { status: 404 });
    }

    return new Response(JSON.stringify(ok(schedule)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
