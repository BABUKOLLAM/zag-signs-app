import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token)               return err("Reset token is required");
  if (!password)            return err("New password is required");
  if (password.length < 8)  return err("Password must be at least 8 characters");

  const user = await prisma.user.findUnique({
    where:  { resetToken: token },
    select: { id: true, resetTokenExpiry: true, status: true, isActive: true },
  });

  if (!user)                                          return err("Invalid or expired reset link", 400);
  if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) return err("Reset link has expired. Please request a new one.", 400);
  if (user.status !== "ACTIVE" || !user.isActive)     return err("Account is not active", 403);

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data:  { password: hashed, resetToken: null, resetTokenExpiry: null },
  });

  return ok({ message: "Password updated successfully." });
}
