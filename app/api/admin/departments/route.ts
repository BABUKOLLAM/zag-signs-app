import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

const GUARD = ["MD", "IT_ADMIN"];

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const divisionId = req.nextUrl.searchParams.get("divisionId") || undefined;
  const branch     = req.nextUrl.searchParams.get("branch")     || undefined;

  const departments = await prisma.department.findMany({
    where: {
      ...(divisionId ? { divisionId } : {}),
      ...(branch ? { division: { branch } } : {}),
    },
    include: { division: true },
    orderBy: [{ division: { branch: "asc" } }, { name: "asc" }],
  });

  return ok(departments);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!GUARD.includes(role)) return err("Forbidden — MD or IT Admin only", 403);

  const body = await req.json();
  if (!body.name?.trim())       return err("name is required");
  if (!body.divisionId?.trim()) return err("divisionId is required");

  try {
    const department = await prisma.department.create({
      data: {
        name:       body.name.trim(),
        divisionId: body.divisionId,
        headName:   body.headName  || "",
        headEmail:  body.headEmail || "",
        headPhone:  body.headPhone || "",
        notes:      body.notes     || "",
      },
      include: { division: true },
    });
    return ok(department, 201);
  } catch (e: any) {
    if (e.code === "P2003") return err("Division not found");
    return err(e.message, 500);
  }
}
