import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

// Minimal, non-sensitive User list for report/assignment dropdowns (DAR/WWR/MWR
// employee selectors). Deliberately separate from /api/employees, which lists
// HR payroll Employee records — a different table with different ids — and
// from /api/users (admin-only, exposes email/phone/reportingTo). DAR/WWR/MWR's
// employeeId foreign key references User.id, so the dropdown must be sourced
// from real User accounts, not Employee records.
export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch");

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      status: "ACTIVE",
      ...(branch ? { branch } : {}),
    },
    select: { id: true, name: true, role: true, branch: true },
    orderBy: { name: "asc" },
  });

  return ok(users.map((u) => ({ ...u, branch: u.branch ?? "All" })));
}
