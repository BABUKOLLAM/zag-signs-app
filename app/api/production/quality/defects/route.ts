import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { defectWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function GET(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const checkpointId = searchParams.get("checkpointId");
    const severity = searchParams.get("severity");

    const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
    if (rangeError) return rangeError;
    const where = defectWhere({ checkpointId, severity, range });

    const [defects, total] = await Promise.all([prisma.qualityDefect.findMany({
      where,
      include: {
        checkpoint: { include: { workOrder: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }), prisma.qualityDefect.count({ where })]);

    return okList(defects, { total, limit: 300 });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();

    const defect = await prisma.qualityDefect.create({
      data: {
        checkpointId: body.checkpointId,
        description: body.description,
        severity: body.severity,
        category: body.category,
        correctionRequired: body.correctionRequired || true,
        notes: body.notes || null,
      },
      include: {
        checkpoint: true,
      },
    });

    return ok(defect, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
