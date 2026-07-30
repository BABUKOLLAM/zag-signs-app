import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const rows = await prisma.fuelLog.findMany({
    where: vehicleId ? { vehicleId } : {},
    include: { vehicle: { select: { vehicleNo: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });
  return ok(rows);
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const litres = Number(body.litres);
  const costPerLitre = Number(body.costPerLitre);
  const row = await prisma.fuelLog.create({
    data: {
      vehicleId: body.vehicleId,
      date: new Date(body.date),
      litres,
      costPerLitre,
      totalCost: litres * costPerLitre,
      odometer: Number(body.odometer),
      fuelStation: body.fuelStation ?? null,
    },
  });
  return ok(row, 201);
}
