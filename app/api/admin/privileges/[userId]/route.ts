import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";

function isPrivilegeManager(role: string) {
  return ["IT Admin", "Consultant", "IT_ADMIN", "CONSULTANT"].includes(role);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = session as { user?: { id?: string; role?: string } };
  const actorRole = sessionUser.user?.role ?? "";
  if (!isPrivilegeManager(actorRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json() as { modules: string[] | null };

  // null or empty → delete override (reset to role defaults)
  if (!body.modules || body.modules.length === 0) {
    await prisma.userPermission.deleteMany({ where: { userId } });
    return NextResponse.json({ ok: true, reset: true });
  }

  const perm = await prisma.userPermission.upsert({
    where: { userId },
    create: { userId, modules: body.modules, updatedById: sessionUser.user?.id },
    update: { modules: body.modules, updatedById: sessionUser.user?.id },
  });

  return NextResponse.json({ ok: true, modules: perm.modules });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sessionUser = session as { user?: { role?: string } };
  if (!isPrivilegeManager(sessionUser.user?.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  await prisma.userPermission.deleteMany({ where: { userId } });
  return NextResponse.json({ ok: true });
}
