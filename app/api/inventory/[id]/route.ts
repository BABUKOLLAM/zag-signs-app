import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json() as {
    name?: string;
    category?: string;
    unit?: string;
    minimumStock?: number;
    unitCost?: number;
    supplier?: string;
  };

  const m = await prisma.material.findUnique({ where: { id } });
  if (!m) return err("Material not found", 404);

  const updated = await prisma.material.update({
    where: { id },
    data: {
      ...(body.name         ? { name: body.name }                 : {}),
      ...(body.category     ? { category: body.category }         : {}),
      ...(body.unit         ? { unit: body.unit }                 : {}),
      ...(body.minimumStock !== undefined ? { minimumStock: body.minimumStock } : {}),
      ...(body.unitCost     !== undefined ? { unitCost: body.unitCost }         : {}),
      ...(body.supplier     !== undefined ? { supplier: body.supplier || null } : {}),
    },
  });

  return ok(updated);
}
