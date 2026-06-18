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

  // Explicitly pick only known fields to avoid Prisma validation errors
  // when the client sends extra DB columns (id, updatedAt) from the GET response.
  const raw = await request.json() as Record<string, unknown>;
  const data = {
    ...(raw.name        !== undefined && { name:        String(raw.name) }),
    ...(raw.tagline     !== undefined && { tagline:     String(raw.tagline) }),
    ...(raw.address     !== undefined && { address:     String(raw.address) }),
    ...(raw.phone       !== undefined && { phone:       String(raw.phone) }),
    ...(raw.email       !== undefined && { email:       String(raw.email) }),
    ...(raw.website     !== undefined && { website:     String(raw.website) }),
    ...(raw.gstNo       !== undefined && { gstNo:       String(raw.gstNo) }),
    ...(raw.panNo       !== undefined && { panNo:       String(raw.panNo) }),
    ...(raw.logoUrl     !== undefined && { logoUrl:     raw.logoUrl ? String(raw.logoUrl) : null }),
    ...(raw.bankName    !== undefined && { bankName:    String(raw.bankName) }),
    ...(raw.bankBranch  !== undefined && { bankBranch:  String(raw.bankBranch) }),
    ...(raw.accountNo   !== undefined && { accountNo:   String(raw.accountNo) }),
    ...(raw.ifscCode    !== undefined && { ifscCode:    String(raw.ifscCode) }),
    ...(raw.accountType !== undefined && { accountType: String(raw.accountType) }),
    ...(raw.defaultTerms !== undefined && { defaultTerms: String(raw.defaultTerms) }),
    ...(raw.validityDays !== undefined && { validityDays: Number(raw.validityDays) }),
  };

  const settings = await prisma.companySetting.upsert({
    where:  { id: "company" },
    create: { id: "company", ...data },
    update: data,
  });
  return ok(settings);
}
