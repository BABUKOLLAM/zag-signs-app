import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requirePathAccess, rangeFromQuery, okList } from "@/lib/api-helpers";
import { tripWhere } from "@/lib/list-filters";

export async function GET(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return err("Forbidden", 403);
  const { searchParams } = new URL(req.url);
  const vehicleId = searchParams.get("vehicleId") || undefined;
  const { range, error: rangeError } = rangeFromQuery(searchParams, { allowMonth: false });
  if (rangeError) return rangeError;
  const where = tripWhere({ vehicleId, range });
  const [rows, total] = await Promise.all([prisma.fleetTrip.findMany({
    where,
    include: {
      vehicle: { select: { vehicleNo: true, make: true, model: true } },
      driver: { select: { name: true } },
    },
    orderBy: { startTime: "desc" },
    take: 100,
  }), prisma.fleetTrip.count({ where })]);
  return okList(rows, { total, limit: 100 });
}

export async function POST(req: NextRequest) {
  const session = await requirePathAccess("/fleet");
  if (!session) return err("Forbidden", 403);
  const body = await req.json();
  const count = await prisma.fleetTrip.count();
  const tripNo = `TRIP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
  const row = await prisma.fleetTrip.create({
    data: {
      tripNo,
      vehicleId: body.vehicleId,
      driverId: body.driverId || (session.user as any).id,
      startKm: Number(body.startKm),
      endKm: body.endKm ? Number(body.endKm) : null,
      startTime: new Date(body.startTime),
      endTime: body.endTime ? new Date(body.endTime) : null,
      purpose: body.purpose,
      fromPlace: body.fromPlace,
      toPlace: body.toPlace,
      relatedOrderId: body.relatedOrderId || null,
      notes: body.notes ?? null,
    },
  });
  return ok(row, 201);
}
