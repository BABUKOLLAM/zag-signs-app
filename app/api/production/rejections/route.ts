import { NextRequest } from "next/server";
import { requireSession, ok, err, autoNo } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const searchParams = req.nextUrl.searchParams;
    const workOrderId = searchParams.get("workOrderId");
    const action = searchParams.get("action");

    const where: any = {};
    if (workOrderId) where.workOrderId = workOrderId;
    if (action) where.action = action;

    const rejections = await prisma.productionRejection.findMany({
      where,
      include: {
        workOrder: true,
        approver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return new Response(JSON.stringify(ok(rejections)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

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

    return new Response(JSON.stringify(ok(rejection)), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
