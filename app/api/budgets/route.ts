import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

function shape(b: Awaited<ReturnType<typeof prisma.budget.findFirst>>) {
  if (!b) return null;
  return {
    id: b.id,
    branch: b.branch,
    category: b.category,
    fiscalYear: b.fiscalYear,
    month: b.month,
    budgetedAmount: b.budgetedAmount,
    actualAmount: b.actualAmount,
    variance: b.budgetedAmount - b.actualAmount,
    notes: b.notes ?? "",
    createdById: b.createdById,
    createdAt: b.createdAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const session = await requirePathAccess("/budgets");
  if (!session) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");
  const fiscalYear = searchParams.get("fiscalYear");
  const month = searchParams.get("month");

  const where = {
    ...(branch ? { branch } : {}),
    ...(fiscalYear ? { fiscalYear: Number(fiscalYear) } : {}),
    ...(month ? { month: Number(month) } : {}),
  };

  const rows = await prisma.budget.findMany({
    where,
    orderBy: [{ fiscalYear: "desc" }, { month: "desc" }, { category: "asc" }],
    include: { createdBy: { select: { id: true, name: true } } },
  });

  return ok(
    rows.map((b) => ({ ...shape(b), createdBy: b.createdBy?.name ?? "" }))
  );
}

export async function POST(request: NextRequest) {
  const session = await requirePathAccess("/budgets");
  if (!session) return err("Forbidden", 403);

  const body = await request.json();
  const { branch, category, fiscalYear, month, budgetedAmount, actualAmount, notes } = body;

  if (!branch) return err("Branch is required");
  if (!category?.trim()) return err("Category is required");
  if (!fiscalYear) return err("Fiscal year is required");
  if (!month || Number(month) < 1 || Number(month) > 12) return err("Month must be between 1 and 12");

  const userId = (session.user as { id?: string }).id;

  const row = await prisma.budget.upsert({
    where: {
      branch_category_fiscalYear_month: {
        branch,
        category: category.trim(),
        fiscalYear: Number(fiscalYear),
        month: Number(month),
      },
    },
    update: {
      budgetedAmount: Number(budgetedAmount) || 0,
      actualAmount: Number(actualAmount) || 0,
      notes: notes?.trim() ?? null,
    },
    create: {
      branch,
      category: category.trim(),
      fiscalYear: Number(fiscalYear),
      month: Number(month),
      budgetedAmount: Number(budgetedAmount) || 0,
      actualAmount: Number(actualAmount) || 0,
      notes: notes?.trim() ?? null,
      createdById: userId ?? null,
    },
  });

  return ok(shape(row), 201);
}
