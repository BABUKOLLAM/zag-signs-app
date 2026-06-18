import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

function isAdmin(role: string) {
  return ["MD","IT Admin","IT_ADMIN","AVP"].some(r =>
    role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_")
  );
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  const { id } = await params;
  const body = await request.json() as {
    name?: string;
    role?: string;
    branch?: string | null;
    phone?: string;
    status?: string;
    isActive?: boolean;
    reportingToId?: string | null;
    password?: string;
  };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return err("User not found", 404);

  const wasNotActive = user.status !== "ACTIVE";
  const isNowActive  = body.status === "ACTIVE";

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(body.name        ? { name: body.name.trim() } : {}),
      ...(body.role        ? { role: body.role as never } : {}),
      ...(body.branch !== undefined ? { branch: (body.branch || null) as never } : {}),
      ...(body.phone !== undefined  ? { phone: body.phone || null } : {}),
      ...(body.status      ? { status: body.status, isActive: body.status === "ACTIVE" } : {}),
      ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      ...(body.reportingToId !== undefined ? { reportingToId: body.reportingToId || null } : {}),
      ...(body.password    ? { password: await bcrypt.hash(body.password, 12) } : {}),
      // Clear token when approving
      ...(isNowActive ? { approvalToken: null, tokenExpiry: null } : {}),
    },
    include: { reportingTo: { select: { id: true, name: true } } },
  });

  // Send welcome email if user just got activated
  if (wasNotActive && isNowActive) {
    const base = process.env.NEXTAUTH_URL ?? "https://bprozagcrm.xyz";
    sendWelcomeEmail({ toEmail: updated.email, toName: updated.name, role: updated.role, loginUrl: `${base}/login` }).catch(() => {});
  }

  return ok({
    id:          updated.id,
    name:        updated.name,
    email:       updated.email,
    role:        updated.role,
    branch:      updated.branch ?? "All",
    phone:       updated.phone ?? "",
    status:      updated.status,
    isActive:    updated.isActive,
    reportingTo: updated.reportingTo?.name ?? "",
    reportingToId: updated.reportingTo?.id ?? "",
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  if (!["MD","IT_ADMIN","IT Admin"].some(r => role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_")))
    return err("Forbidden", 403);

  const { id } = await params;
  await prisma.user.update({
    where: { id },
    data:  { isActive: false, status: "INACTIVE" },
  });
  return ok({ deactivated: true });
}
