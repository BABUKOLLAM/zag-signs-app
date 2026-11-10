import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, autoNo, requireAnyPathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { rejectionWhere } from "@/lib/list-filters";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function GET(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const searchParams = req.nextUrl.searchParams;
    const workOrderId = searchParams.get("workOrderId");
    const action = searchParams.get("action");

    const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
    if (rangeError) return rangeError;
    const where = rejectionWhere({ workOrderId, action, range });

    const [rejections, total] = await Promise.all([prisma.productionRejection.findMany({
      where,
      include: {
        workOrder: true,
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }), prisma.productionRejection.count({ where })]);

    return okList(rejections, { total, limit: 300 });
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();

    // Generate rejection number
    const count = await prisma.productionRejection.count();
    const rejectionNo = autoNo("REJ", count);

    const rejection = await prisma.productionRejection.create({
      data: {
        rejectionNo,
        workOrderId: body.workOrderId,
        reason: body.reason,
        quantity: body.quantity,
        action: body.action, // REWORK, SCRAP, REPLACE
        costImpact: body.costImpact || 0,
        approvedBy: body.approvedBy || null,
        notes: body.notes || null,
      },
      include: {
        workOrder: true,
        approver: true,
      },
    });

    return ok(rejection, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
