import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import { str, num, rowNo, type RowResult } from "@/lib/bulk-helpers";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { rows } = (await req.json()) as { rows?: Record<string, unknown>[] };
  if (!Array.isArray(rows) || rows.length === 0) return err("No rows provided");
  if (rows.length > 2000) return err("Too many rows — split into files of 2000 or fewer");

  const result: RowResult = { created: 0, skipped: [], errors: [] };

  // Duplicate key = name + category (case-insensitive)
  const existing = await prisma.material.findMany({ select: { name: true, category: true } });
  const key = (n: string, c: string) => `${n.toLowerCase()}|${c.toLowerCase()}`;
  const seen = new Set(existing.map((m) => key(m.name, m.category)));

  const toCreate: Prisma.MaterialCreateManyInput[] = [];

  rows.forEach((r, i) => {
    const rn = rowNo(r, i);
    const name = str(r.name), category = str(r.category);

    if (!name)     { result.errors.push({ row: rn, reason: "Name is required" }); return; }
    if (!category) { result.errors.push({ row: rn, reason: "Category is required" }); return; }

    const k = key(name, category);
    if (seen.has(k)) { result.skipped.push({ row: rn, reason: `Duplicate item "${name}" in ${category}` }); return; }
    seen.add(k);

    toCreate.push({
      name, category,
      unit:         str(r.unit) || "Nos",
      currentStock: num(r.currentStock),
      minimumStock: num(r.minimumStock),
      unitCost:     num(r.unitCost),
      supplier:     str(r.supplier) || null,
    });
  });

  if (toCreate.length) {
    try {
      await prisma.material.createMany({ data: toCreate });
      result.created = toCreate.length;
    } catch {
      return err("Could not save the import — a database error occurred and no records were created. Please retry.", 500);
    }
  }
  return ok(result);
}
