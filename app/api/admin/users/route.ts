import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!["MD", "IT_ADMIN", "HR", "AVP"].includes(role)) return err("Forbidden", 403);

  const branch = req.nextUrl.searchParams.get("branch") || undefined;

  const users = await prisma.user.findMany({
    where: {
      ...(branch ? { branch: branch as any } : {}),
    },
    select: {
      id:           true,
      name:         true,
      email:        true,
      role:         true,
      branch:       true,
      phone:        true,
      isActive:     true,
      status:       true,
      reportingToId: true,
      reportingTo: {
        select: { id: true, name: true, role: true },
      },
      reportees: {
        select: { id: true, name: true, role: true, branch: true },
      },
      createdAt: true,
    },
    orderBy: [{ branch: "asc" }, { role: "asc" }, { name: "asc" }],
  });

  return ok(users);
}
