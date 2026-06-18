import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token  = searchParams.get("token");
  const action = searchParams.get("action"); // approve | reject

  if (!token)  return err("Token is required", 400);
  if (!action || !["approve","reject"].includes(action)) return err("Invalid action", 400);

  const user = await prisma.user.findUnique({ where: { approvalToken: token } });
  if (!user)         return err("Invalid or already-used token", 404);
  if (user.tokenExpiry && user.tokenExpiry < new Date())
    return err("This approval link has expired. Use the Admin → Users panel.", 410);

  if (action === "approve") {
    await prisma.user.update({
      where: { id: user.id },
      data:  { status: "ACTIVE", isActive: true, approvalToken: null, tokenExpiry: null },
    });
    const base = process.env.NEXTAUTH_URL ?? "https://bprozagcrm.xyz";
    await sendWelcomeEmail({
      toEmail:  user.email,
      toName:   user.name,
      role:     user.role,
      loginUrl: `${base}/login`,
    });
    return ok({ action: "approved", name: user.name, email: user.email });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data:  { status: "REJECTED", isActive: false, approvalToken: null, tokenExpiry: null },
    });
    return ok({ action: "rejected", name: user.name });
  }
}

// Admin can also approve/reject via PATCH from the user management page
export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  if (!["MD","AVP","IT Admin","IT_ADMIN"].some(r => role.includes(r.replace(" ","_")) || role === r))
    return err("Forbidden", 403);

  const body = await request.json() as { userId: string; action: "approve" | "reject" };
  if (!body.userId || !body.action) return err("userId and action required");

  const user = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!user) return err("User not found", 404);

  if (body.action === "approve") {
    await prisma.user.update({
      where: { id: user.id },
      data:  { status: "ACTIVE", isActive: true, approvalToken: null, tokenExpiry: null },
    });
    const base = process.env.NEXTAUTH_URL ?? "https://bprozagcrm.xyz";
    await sendWelcomeEmail({
      toEmail:  user.email,
      toName:   user.name,
      role:     user.role,
      loginUrl: `${base}/login`,
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data:  { status: "REJECTED", isActive: false, approvalToken: null, tokenExpiry: null },
    });
  }

  return ok({ action: body.action, name: user.name });
}
