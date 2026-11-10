import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAnyPathAccess } from "@/lib/api-helpers";
import { ROUTE_ACCESS } from "@/lib/route-access";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAnyPathAccess(ROUTE_ACCESS.production);
  if (!session) return err("Forbidden", 403);

  try {
    const body = await req.json();
    const { id } = await params;

    const defect = await prisma.qualityDefect.update({
      where: { id },
      data: {
        correctedAt: body.correctedAt ? new Date(body.correctedAt) : new Date(),
        notes: body.notes || undefined,
      },
      include: {
        checkpoint: true,
      },
    });

    return ok(defect, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
