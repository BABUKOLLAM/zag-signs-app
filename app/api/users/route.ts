import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function shape(u: {
  id: string; name: string; email: string; role: string; branch: string | null;
  phone: string | null; status: string; isActive: boolean; createdAt: Date;
  reportingTo: { id: string; name: string } | null;
}) {
  return {
    id:          u.id,
    name:        u.name,
    email:       u.email,
    role:        u.role,
    branch:      u.branch ?? "All",
    phone:       u.phone ?? "",
    status:      u.status,
    isActive:    u.isActive,
    createdAt:   u.createdAt.toISOString().split("T")[0],
    reportingTo: u.reportingTo?.name ?? "",
    reportingToId: u.reportingTo?.id ?? "",
  };
}

function isAdmin(role: string) {
  return ["MD","IT Admin","IT_ADMIN","AVP"].some(r => role === r || role.replace(" ","_") === r.replace(" ","_"));
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search") ?? "";

  const users = await prisma.user.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { name:  { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { reportingTo: { select: { id: true, name: true } } },
  });

  return ok(users.map(shape));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  if (!["MD","IT Admin","IT_ADMIN"].some(r => role === r || role.replace(" ","_") === r.replace(" ","_")))
    return err("Forbidden", 403);

  const body = await request.json() as {
    name?: string; email?: string; password?: string;
    role?: string; branch?: string; phone?: string; status?: string;
  };

  if (!body.name?.trim())  return err("Name is required");
  if (!body.email?.trim()) return err("Email is required");
  if (!body.password)      return err("Password is required");
  if (!body.role)          return err("Role is required");

  const normalEmail = body.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalEmail } });
  if (existing) return err("Email already exists", 409);

  const hashed = await bcrypt.hash(body.password, 12);
  const status = body.status ?? "ACTIVE";

  const ALL_BRANCH_ROLES = ["MD","AVP","HR","IT_ADMIN"];
  const needsBranch = !ALL_BRANCH_ROLES.includes(body.role);

  const created = await prisma.user.create({
    data: {
      name:     body.name.trim(),
      email:    normalEmail,
      password: hashed,
      role:     body.role as never,
      branch:   (needsBranch && body.branch ? body.branch : null) as never,
      phone:    body.phone?.trim() || null,
      status,
      isActive: status === "ACTIVE",
      approvalToken: status === "PENDING" ? crypto.randomBytes(32).toString("hex") : null,
      tokenExpiry:   status === "PENDING" ? new Date(Date.now() + 72 * 3600 * 1000) : null,
    },
    include: { reportingTo: { select: { id: true, name: true } } },
  });

  return ok(shape(created), 201);
}
