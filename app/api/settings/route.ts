import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

// GET — readable by all authenticated users (needed when printing quotations)
export async function GET() {
  const settings = await prisma.companySetting.upsert({
    where: { id: "company" },
    create: { id: "company" },
    update: {},
  });
  return ok(settings);
}

// PUT — admin/MD only
export async function PUT(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  const isAdmin = ["MD", "IT Admin", "IT_ADMIN"].some(
    r => role === r || role.replace(/\s/g, "_") === r.replace(/\s/g, "_")
  );
  if (!isAdmin) return err("Forbidden — MD or IT Admin only", 403);

  const body = await request.json() as {
    name?: string; tagline?: string; address?: string;
    phone?: string; email?: string; website?: string;
    gstNo?: string; panNo?: string; logoUrl?: string;
    bankName?: string; bankBranch?: string; accountNo?: string;
    ifscCode?: string; accountType?: string;
    defaultTerms?: string; validityDays?: number;
  };

  const settings = await prisma.companySetting.upsert({
    where: { id: "company" },
    create: { id: "company", ...body },
    update: body,
  });
  return ok(settings);
}
