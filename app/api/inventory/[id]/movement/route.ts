import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { id } = await params;
  const body = await request.json() as {
    type?: string;     // IN | OUT | ADJUSTMENT
    quantity?: number;
    reference?: string;
    notes?: string;
  };

  if (!body.type || !["IN", "OUT", "ADJUSTMENT"].includes(body.type))
    return err("type must be IN, OUT, or ADJUSTMENT");
  if (body.quantity === undefined || body.quantity <= 0)
    return err("quantity must be > 0");

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) return err("Material not found", 404);

  const delta =
    body.type === "IN"         ? body.quantity :
    body.type === "OUT"        ? -body.quantity :
    body.quantity - material.currentStock; // ADJUSTMENT sets absolute value

  const newStock = Math.max(0, material.currentStock + delta);

  const [movement] = await prisma.$transaction([
    prisma.stockMovement.create({
      data: {
        materialId: id,
        type:       body.type,
        quantity:   body.quantity,
        reference:  body.reference || null,
        notes:      body.notes     || null,
      },
    }),
    prisma.material.update({
      where: { id },
      data:  { currentStock: newStock },
    }),
  ]);

  return ok({ movement, newStock }, 201);
}
