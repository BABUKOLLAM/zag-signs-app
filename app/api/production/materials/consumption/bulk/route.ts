import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";
import { str, num, rowNo, maxTrailingInt } from "@/lib/bulk-helpers";


interface RowInput {
  __row: number;
  workOrderId?: string;
  materialId?: string;
  plannedQty?: string;
  unit?: string;
  notes?: string;
  [key: string]: any;
}

interface RowResult {
  row: number;
  error?: string;
  skip?: string;
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const body = await req.json();
    const rows: RowInput[] = body.rows || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ created: 0, skipped: [], errors: [] }), { status: 200 });
    }

    if (rows.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Maximum 2000 rows per upload" }),
        { status: 400 }
      );
    }

    // Pre-load existing consumptions
    const existing = await prisma.materialConsumption.findMany({
      select: { workOrderId: true, materialId: true },
    });
    const existingSet = new Set(
      existing.map((c) => `${c.workOrderId}:${c.materialId}`)
    );

    // Calculate next sequence
    const allConsumptions = await prisma.materialConsumption.findMany({
      select: { consumptionNo: true },
    });
    const nextSeq = maxTrailingInt(allConsumptions.map((c) => c.consumptionNo)) + 1;

    // Pre-load work orders and materials for validation
    const workOrders = await prisma.workOrder.findMany({ select: { id: true } });
    const woIds = new Set(workOrders.map((wo) => wo.id));
    const materials = await prisma.material.findMany({ select: { id: true } });
    const materialIds = new Set(materials.map((m) => m.id));

    const created: any[] = [];
    const skipped: RowResult[] = [];
    const errors: RowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rno = rowNo(row, i);

      const woId = str(row.workOrderId);
      const matId = str(row.materialId);
      const plannedQty = num(row.plannedQty);

      if (!woId) {
        errors.push({ row: rno, error: "Missing workOrderId" });
        continue;
      }
      if (!matId) {
        errors.push({ row: rno, error: "Missing materialId" });
        continue;
      }
      if (plannedQty <= 0) {
        errors.push({ row: rno, error: "plannedQty must be greater than 0" });
        continue;
      }

      if (!woIds.has(woId)) {
        errors.push({ row: rno, error: `WorkOrder ${woId} not found` });
        continue;
      }
      if (!materialIds.has(matId)) {
        errors.push({ row: rno, error: `Material ${matId} not found` });
        continue;
      }

      const key = `${woId}:${matId}`;
      if (existingSet.has(key)) {
        skipped.push({ row: rno, skip: `Consumption for WO ${woId} + Material ${matId} already exists` });
        continue;
      }
      existingSet.add(key);

      try {
        const consumptionNo = `MC-${String(nextSeq + created.length).padStart(3, "0")}`;
        const consumption = await prisma.materialConsumption.create({
          data: {
            consumptionNo,
            workOrderId: woId,
            materialId: matId,
            plannedQty,
            unit: str(row.unit) || "units",
            notes: str(row.notes) || null,
          },
          include: { material: true },
        });
        created.push(consumption);

        // Auto-deduct from inventory (create StockMovement OUT)
        await prisma.stockMovement.create({
          data: {
            type: "OUT",
            quantity: plannedQty,
            reference: consumptionNo,
            materialId: matId,
            notes: `Consumption for WO ${woId}`,
          },
        });

        // Update material stock
        await prisma.material.update({
          where: { id: matId },
          data: { currentStock: { decrement: plannedQty } },
        });
      } catch (err: any) {
        errors.push({ row: rno, error: `Database error: ${err.message}` });
      }
    }

    return new Response(
      JSON.stringify({ created: created.length, skipped, errors }),
      { status: 201 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500 }
    );
  }
}
