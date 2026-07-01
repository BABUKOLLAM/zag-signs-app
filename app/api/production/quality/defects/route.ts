import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err } from "@/lib/api-helpers";


export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const checkpointId = searchParams.get("checkpointId");
    const severity = searchParams.get("severity");

    const where: any = {};
    if (checkpointId) where.checkpointId = checkpointId;
    if (severity) where.severity = severity;

    const defects = await prisma.qualityDefect.findMany({
      where,
      include: {
        checkpoint: { include: { workOrder: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return ok(defects, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

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
