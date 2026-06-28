import { NextRequest } from "next/server";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const workOrderId = searchParams.get("workOrderId");
    const materialId = searchParams.get("materialId");

    const where: any = {};
    if (workOrderId) where.workOrderId = workOrderId;
    if (materialId) where.materialId = materialId;

    const consumptions = await prisma.materialConsumption.findMany({
      where,
      include: {
        material: true,
        workOrder: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return ok(consumptions, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();

    // Generate consumption number
    const count = await prisma.materialConsumption.count();
    const consumptionNo = autoNo("MC", count);

    const consumption = await prisma.materialConsumption.create({
      data: {
        consumptionNo,
        workOrderId: body.workOrderId,
        materialId: body.materialId,
        plannedQty: body.plannedQty,
        unit: body.unit || "units",
        notes: body.notes || null,
      },
      include: { material: true, workOrder: true },
    });

    // Auto-deduct from inventory
    await prisma.stockMovement.create({
      data: {
        type: "OUT",
        quantity: body.plannedQty,
        reference: consumptionNo,
        materialId: body.materialId,
        notes: `Consumption for WO ${body.workOrderId}`,
      },
    });

    await prisma.material.update({
      where: { id: body.materialId },
      data: { currentStock: { decrement: body.plannedQty } },
    });

    return ok(consumption, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();
    const { id, actualQty, wastageQty, costValue } = body;

    const consumption = await prisma.materialConsumption.update({
      where: { id },
      data: {
        actualQty: actualQty !== undefined ? actualQty : undefined,
        wastageQty: wastageQty !== undefined ? wastageQty : undefined,
        costValue: costValue !== undefined ? costValue : undefined,
      },
      include: { material: true },
    });

    return ok(consumption, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
