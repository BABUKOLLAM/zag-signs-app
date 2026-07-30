import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import { validateText, isNegative } from "@/lib/validation";

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

  if (body.name) {
    const nameError = validateText(body.name, "Material name");
    if (nameError) return err(nameError);
  }
  if (body.supplier) {
    const supplierError = validateText(body.supplier, "Supplier");
    if (supplierError) return err(supplierError);
  }
  if (isNegative(body.minimumStock)) return err("Reorder Level cannot be negative");

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
