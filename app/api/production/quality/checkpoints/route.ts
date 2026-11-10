import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, autoNo, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { checkpointWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function GET(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const workOrderId = searchParams.get("workOrderId");
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");

    const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
    if (rangeError) return rangeError;
    const where = checkpointWhere({ workOrderId, stage, status, range });

    const [checkpoints, total, defectCount, criticalCount] = await Promise.all([prisma.qualityCheckpoint.findMany({
      where,
      include: {
        workOrder: true,
        inspector: { select: { id: true, name: true } },
        defects: true,
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }), prisma.qualityCheckpoint.count({ where }),
      // defect totals over ALL matching checkpoints, not just the 300 returned
      prisma.qualityDefect.count({ where: { checkpoint: where } }),
      prisma.qualityDefect.count({ where: { checkpoint: where, severity: "CRITICAL" } })]);

    return okList(checkpoints, { total, limit: 300, defectCount, criticalCount });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();

    // If status is FAIL, defects are required
    if (body.status === "FAIL" && (!body.defects || body.defects.length === 0)) {
      return new Response(
        JSON.stringify(err("Defects are required when QC status is FAIL")),
        { status: 400 }
      );
    }

    // Generate checkpoint number
    const count = await prisma.qualityCheckpoint.count();
    const checkpointNo = autoNo("QC", count);

    const checkpoint = await prisma.qualityCheckpoint.create({
      data: {
        checkpointNo,
        workOrderId: body.workOrderId,
        stage: body.stage,
        inspectorId: body.inspectorId,
        status: body.status,
        remarks: body.remarks || null,
        defects: body.defects
          ? {
              create: body.defects.map((d: any) => ({
                description: d.description,
                severity: d.severity,
                category: d.category,
                correctionRequired: d.correctionRequired || true,
              })),
            }
          : undefined,
      },
      include: {
        workOrder: true,
        inspector: true,
        defects: true,
      },
    });

    return ok(checkpoint, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
