import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/budgets");
  if (!session) return err("Forbidden", 403);

  const { id } = await params;
  const body = await request.json();

  const row = await prisma.budget.update({
    where: { id },
    data: {
      ...(body.category !== undefined && { category: body.category.trim() }),
      ...(body.budgetedAmount !== undefined && { budgetedAmount: Number(body.budgetedAmount) || 0 }),
      ...(body.actualAmount !== undefined && { actualAmount: Number(body.actualAmount) || 0 }),
      ...(body.notes !== undefined && { notes: body.notes?.trim() ?? null }),
    },
  });

  return ok(row);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requirePathAccess("/budgets");
  if (!session) return err("Forbidden", 403);

  const { id } = await params;
  await prisma.budget.delete({ where: { id } });

  return ok({ id });
}
