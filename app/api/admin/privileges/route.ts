import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";

const ROLE_DISPLAY: Record<string, string> = {
  MD: "MD", AVP: "AVP",
  BUSINESS_MANAGER: "Business Manager", SALES_EXECUTIVE: "Sales Executive",
  CRES: "CRES", PRODUCTION: "Production", ACCOUNTS: "Accounts",
  HR: "HR", IT_ADMIN: "IT Admin", CONSULTANT: "Consultant",
};

function isPrivilegeManager(role: string) {
  return ["IT Admin", "Consultant", "IT_ADMIN", "CONSULTANT"].includes(role);
}

export async function GET() {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (session as { user?: { role?: string } }).user?.role ?? "";
  if (!isPrivilegeManager(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true, role: true, branch: true, isActive: true,
      permission: { select: { modules: true, updatedAt: true } },
    },
  });

  return NextResponse.json({
    data: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: ROLE_DISPLAY[u.role] ?? u.role,
      branch: u.branch ?? "All",
      isActive: u.isActive,
      customModules: u.permission?.modules ?? null,
      lastUpdated: u.permission?.updatedAt?.toISOString().split("T")[0] ?? null,
    })),
  });
}
