import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ modules: null }, { status: 401 });

  const userId = (session as { user?: { id?: string } }).user?.id;
  if (!userId) return NextResponse.json({ modules: null });

  const perm = await prisma.userPermission.findUnique({
    where: { userId },
    select: { modules: true },
  });

  // null = no override, caller falls back to role-based defaults
  return NextResponse.json({ modules: perm?.modules ?? null });
}
