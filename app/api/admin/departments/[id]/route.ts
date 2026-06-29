import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

const GUARD = ["MD", "IT_ADMIN"];

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!GUARD.includes(role)) return err("Forbidden", 403);

  const { id } = await params;
  const body = await req.json();

  try {
    const department = await prisma.department.update({
      where: { id },
      data: {
        name:      body.name?.trim(),
        headName:  body.headName  ?? undefined,
        headEmail: body.headEmail ?? undefined,
        headPhone: body.headPhone ?? undefined,
        notes:     body.notes     ?? undefined,
        isActive:  body.isActive  ?? undefined,
      },
      include: { division: true },
    });
    return ok(department);
  } catch (e: any) {
    if (e.code === "P2025") return err("Department not found", 404);
    return err(e.message, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!GUARD.includes(role)) return err("Forbidden", 403);

  const { id } = await params;

  try {
    await prisma.department.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (e: any) {
    if (e.code === "P2025") return err("Department not found", 404);
    return err(e.message, 500);
  }
}
