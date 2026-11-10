import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { fuelWhere } from "@/lib/list-filters";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = fuelWhere({ vehicleId, range });
  const [rows, total, agg] = await Promise.all([prisma.fuelLog.findMany({
    where,
    include: { vehicle: { select: { vehicleNo: true } } },
    orderBy: { date: "desc" },
    take: 200,
  }), prisma.fuelLog.count({ where }),
    prisma.fuelLog.aggregate({ where, _sum: { totalCost: true, litres: true } })]);
  return okList(rows, { total, limit: 200, totalCost: agg._sum.totalCost ?? 0, totalLitres: agg._sum.litres ?? 0 });
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
