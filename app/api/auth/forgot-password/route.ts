import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";
import crypto from "crypto";
import nodemailer from "nodemailer";

function mailer() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT ?? 587),
    secure: process.env.EMAIL_PORT === "465",
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) return err("Email is required");

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, status: true, isActive: true },
  });

  // Always return success to avoid email enumeration
  if (!user || user.status !== "ACTIVE" || !user.isActive) {
    return ok({ message: "If that email exists, a reset link has been sent." });
  }

  const token  = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data:  { resetToken: token, resetTokenExpiry: expiry },
  });

  const base     = process.env.NEXTAUTH_URL ?? "https://bprozagcrm.xyz";
  const resetUrl = `${base}/reset-password?token=${token}`;

  try {
    await mailer().sendMail({
      from:    `ZAG SIGNS ERP <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: "Reset your ZAG SIGNS password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#1e40af;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your ZAG SIGNS ERP password. Click the button below to set a new password.</p>
          <p style="margin:24px 0;">
            <a href="${resetUrl}"
               style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
              Reset Password
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="color:#9ca3af;font-size:12px;">ZAG SIGNS ERP · Powered by Team bpro</p>
        </div>
      `,
    });
  } catch (e: any) {
    console.error("Reset email failed:", e.message);
  }

  return ok({ message: "If that email exists, a reset link has been sent." });
}
