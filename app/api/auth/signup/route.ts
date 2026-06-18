import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err } from "@/lib/api-helpers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendApprovalEmail } from "@/lib/email";

const VALID_ROLES = ["MD","AVP","BUSINESS_MANAGER","SALES_EXECUTIVE","CRES","PRODUCTION","ACCOUNTS","HR","IT_ADMIN"];
const VALID_BRANCHES = ["TVM","KTYM","EKM","CLT"];
const ALL_BRANCH_ROLES = ["MD","AVP","HR","IT_ADMIN"];

const ROLE_LABELS: Record<string, string> = {
  MD:"MD", AVP:"AVP", BUSINESS_MANAGER:"Business Manager",
  SALES_EXECUTIVE:"Sales Executive", CRES:"CRES",
  PRODUCTION:"Production", ACCOUNTS:"Accounts", HR:"HR", IT_ADMIN:"IT Admin",
};

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    branch?: string;
    phone?: string;
  };

  const { name, email, password, role, branch, phone } = body;

  if (!name?.trim())    return err("Name is required");
  if (!email?.trim())   return err("Email is required");
  if (!password)        return err("Password is required");
  if (password.length < 8) return err("Password must be at least 8 characters");
  if (!role || !VALID_ROLES.includes(role)) return err("Valid role is required");

  const needsBranch = !ALL_BRANCH_ROLES.includes(role);
  if (needsBranch && (!branch || !VALID_BRANCHES.includes(branch)))
    return err("Branch is required for this role");

  const normalEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalEmail } });
  if (existing) return err("An account with this email already exists", 409);

  const hashed = await bcrypt.hash(password, 12);
  const token  = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

  await prisma.user.create({
    data: {
      name:          name.trim(),
      email:         normalEmail,
      password:      hashed,
      role:          role as never,
      branch:        (needsBranch ? branch : null) as never,
      phone:         phone?.trim() || null,
      status:        "PENDING",
      approvalToken: token,
      tokenExpiry:   expiry,
      isActive:      false,
    },
  });

  // Find approvers to notify (IT_ADMIN and MD users already in DB)
  const approvers = await prisma.user.findMany({
    where: { role: { in: ["IT_ADMIN", "MD"] as never[] }, status: "ACTIVE", isActive: true },
    select: { name: true, email: true },
  });

  const base    = process.env.NEXTAUTH_URL ?? "https://bprozagcrm.xyz";
  const approve = `${base}/auth/approve?token=${token}&action=approve`;
  const reject  = `${base}/auth/approve?token=${token}&action=reject`;

  if (approvers.length > 0) {
    await Promise.all(approvers.map(a =>
      sendApprovalEmail({
        toEmail:        a.email,
        toName:         a.name,
        applicantName:  name.trim(),
        applicantEmail: normalEmail,
        applicantRole:  ROLE_LABELS[role] ?? role,
        approveUrl:     approve,
        rejectUrl:      reject,
      })
    ));
  } else {
    // No active approvers in DB yet — log link to console
    sendApprovalEmail({
      toEmail:        "admin@zagsigns.com",
      toName:         "Admin",
      applicantName:  name.trim(),
      applicantEmail: normalEmail,
      applicantRole:  ROLE_LABELS[role] ?? role,
      approveUrl:     approve,
      rejectUrl:      reject,
    });
  }

  return ok({ message: "Account created. Waiting for admin approval." }, 201);
}
