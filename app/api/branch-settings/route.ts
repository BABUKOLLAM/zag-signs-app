import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

// GET — fetch branch-specific bank settings by branch code
export async function GET(request: NextRequest) {
  const branch = request.nextUrl.searchParams.get("branch") || "HO";
  const settings = await prisma.branchSetting.findUnique({
    where: { id: branch },
  });

  if (!settings) {
    return ok({
      id: branch,
      bankName: "",
      bankBranch: "",
      accountNo: "",
      ifscCode: "",
      accountType: "Current Account",
    });
  }

  return ok(settings);
}

// PUT — update branch-specific bank settings (admin only)
export async function PUT(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as { role: string }).role;
  const isAdmin = ["MD", "IT Admin", "IT_ADMIN"].some(
    r => role === r || role.replace(/\s/g, "_") === r.replace(/\s/g, "_")
  );
  if (!isAdmin) return err("Forbidden — MD or IT Admin only", 403);

  const raw = await request.json() as Record<string, unknown>;
  const branch = (raw.branch as string) || "HO";

  const data = {
    ...(raw.bankName !== undefined && { bankName: String(raw.bankName) }),
    ...(raw.bankBranch !== undefined && { bankBranch: String(raw.bankBranch) }),
    ...(raw.accountNo !== undefined && { accountNo: String(raw.accountNo) }),
    ...(raw.ifscCode !== undefined && { ifscCode: String(raw.ifscCode) }),
    ...(raw.accountType !== undefined && { accountType: String(raw.accountType) }),
  };

  const settings = await prisma.branchSetting.upsert({
    where: { id: branch },
    create: { id: branch, ...data },
    update: data,
  });

  return ok(settings);
}
