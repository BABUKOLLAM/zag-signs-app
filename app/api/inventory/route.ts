import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";

function stockStatus(current: number, minimum: number): string {
  if (current <= 0)               return "Out";
  if (current < minimum * 0.5)    return "Critical";
  if (current < minimum)          return "Low";
  return "OK";
}

function shape(m: Awaited<ReturnType<typeof prisma.material.findFirst>>) {
  if (!m) return null;
  return {
    id: m.id,
    name: m.name,
    category: m.category,
    unit: m.unit,
    currentStock: m.currentStock,
    minimumStock: m.minimumStock,
    unitCost: m.unitCost,
    supplier: m.supplier ?? "",
    createdAt: toDate(m.createdAt),
    stockStatus: stockStatus(m.currentStock, m.minimumStock),
    stockValue: m.currentStock * m.unitCost,
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search   = searchParams.get("search") ?? "";

  const items = await prisma.material.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(search   ? {
        OR: [
          { name:     { contains: search, mode: "insensitive" } },
          { supplier: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: { name: "asc" },
  });

  return ok(items.map(shape));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const body = await request.json() as {
    name?: string;
    category?: string;
    unit?: string;
    currentStock?: number;
    minimumStock?: number;
    unitCost?: number;
    supplier?: string;
  };

  if (!body.name?.trim())     return err("name is required");
  if (!body.category?.trim()) return err("category is required");

  const material = await prisma.material.create({
    data: {
      name:         body.name.trim(),
      category:     body.category.trim(),
      unit:         body.unit        ?? "Nos",
      currentStock: body.currentStock ?? 0,
      minimumStock: body.minimumStock ?? 0,
      unitCost:     body.unitCost     ?? 0,
      supplier:     body.supplier || null,
    },
  });

  return ok(shape(material), 201);
}
