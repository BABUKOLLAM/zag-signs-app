import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, autoNo, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { consumptionWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function GET(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const workOrderId = searchParams.get("workOrderId");
    const materialId = searchParams.get("materialId");

    const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
    if (rangeError) return rangeError;
    const where = consumptionWhere({ workOrderId, materialId, range });

    const [consumptions, total] = await Promise.all([prisma.materialConsumption.findMany({
      where,
      include: {
        material: true,
        workOrder: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }), prisma.materialConsumption.count({ where })]);

    return okList(consumptions, { total, limit: 300 });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

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
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

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
