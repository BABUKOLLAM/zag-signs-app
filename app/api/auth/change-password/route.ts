import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { currentPassword, newPassword } = await req.json();
  if (!currentPassword) return err("Current password is required");
  if (!newPassword)     return err("New password is required");
  if (newPassword.length < 8) return err("Password must be at least 8 characters");
  if (currentPassword === newPassword) return err("New password must differ from current password");

  const userId = (session.user as any).id;
  const user   = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  if (!user) return err("User not found", 404);

  const match = await bcrypt.compare(currentPassword, user.password);
  if (!match) return err("Current password is incorrect", 400);

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

  return ok({ message: "Password changed successfully." });
}
