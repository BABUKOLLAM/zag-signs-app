import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ok, err } from "@/lib/api-helpers";


export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

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
