import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

const GUARD = ["MD", "IT Admin"];

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const branch = req.nextUrl.searchParams.get("branch") || undefined;

  const divisions = await prisma.division.findMany({
    where: branch ? { branch } : {},
    include: { departments: { orderBy: { name: "asc" } } },
    orderBy: [{ branch: "asc" }, { name: "asc" }],
  });

  return ok(divisions);
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!GUARD.includes(role)) return err("Forbidden — MD or IT Admin only", 403);

  const body = await req.json();
  if (!body.name?.trim()) return err("name is required");
  if (!body.branch?.trim()) return err("branch is required");

  const slug = body.name.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 12);
  const code = body.code?.trim() || `${body.branch}-${slug}`;

  try {
    const division = await prisma.division.create({
      data: {
        code,
        name:      body.name.trim(),
        branch:    body.branch,
        headName:  body.headName  || "",
        headEmail: body.headEmail || "",
        headPhone: body.headPhone || "",
        notes:     body.notes     || "",
      },
      include: { departments: true },
    });
    return ok(division, 201);
  } catch (e: any) {
    if (e.code === "P2002") return err("A division with this code already exists");
    return err(e.message, 500);
  }
}
