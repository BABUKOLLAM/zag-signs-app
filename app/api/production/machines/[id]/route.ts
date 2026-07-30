import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { validateText, isNegative } from "@/lib/validation";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  try {
    const machine = await prisma.machine.findUnique({ where: { id } });
    if (!machine) return err("Not found", 404);
    return ok(machine);
  } catch (e: any) { return err(e.message, 500); }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  try {
    const body = await req.json();
    if (body.name) {
      const nameError = validateText(body.name, "Machine name");
      if (nameError) return err(nameError);
    }
    if (body.model) {
      const modelError = validateText(body.model, "Model / Make");
      if (modelError) return err(modelError);
    }
    if (body.location) {
      const locationError = validateText(body.location, "Location");
      if (locationError) return err(locationError);
    }
    if (isNegative(body.hourlyRate)) return err("Hourly Rate cannot be negative");
    if (isNegative(body.capacityPerHour)) return err("Capacity/hr cannot be negative");
    const machine = await prisma.machine.update({
      where: { id },
      data: {
        ...(body.name     !== undefined && { name: body.name }),
        ...(body.type     !== undefined && { type: body.type }),
        ...(body.model    !== undefined && { model: body.model || null }),
        ...(body.branch   !== undefined && { branch: body.branch }),
        ...(body.status   !== undefined && { status: body.status }),
        ...(body.notes    !== undefined && { notes: body.notes || null }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.hourlyRate       !== undefined && { hourlyRate: body.hourlyRate }),
        ...(body.capacityPerHour  !== undefined && { capacityPerHour: body.capacityPerHour }),
      },
    });
    return ok(machine);
  } catch (e: any) { return err(e.message, 500); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  try {
    await prisma.machine.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e: any) { return err(e.message, 500); }
}
