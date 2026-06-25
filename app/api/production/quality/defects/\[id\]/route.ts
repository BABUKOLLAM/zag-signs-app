import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const body = await req.json();
    const { id } = params;

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

    return new Response(JSON.stringify(ok(defect)), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify(err(error.message)), { status: 500 });
  }
}
