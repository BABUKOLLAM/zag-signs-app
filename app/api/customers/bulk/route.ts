import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";
import { str, num, normBranch, phoneKey, rowNo, maxTrailingInt, type RowResult } from "@/lib/bulk-helpers";

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { rows } = (await req.json()) as { rows?: Record<string, unknown>[] };
  if (!Array.isArray(rows) || rows.length === 0) return err("No rows provided");
  if (rows.length > 2000) return err("Too many rows — split into files of 2000 or fewer");

  const result: RowResult = { created: 0, skipped: [], errors: [] };

  // Preload existing phones (dedup) + existing numbers (next sequence)
  const existing = await prisma.customer.findMany({ select: { phone: true, customerNo: true } });
  const seen = new Set(existing.map((c) => phoneKey(c.phone)));

  // Derive from the MAX existing number, not the count — deleted rows must not
  // cause a generated customerNo to collide with one that already exists.
  let seq = maxTrailingInt(existing.map((c) => c.customerNo));
  const toCreate: Prisma.CustomerCreateManyInput[] = [];

  rows.forEach((r, i) => {
    const rn = rowNo(r, i);
    const name = str(r.name), company = str(r.company), phone = str(r.phone);
    const branch = normBranch(r.branch);

    if (!name)    { result.errors.push({ row: rn, reason: "Name is required" }); return; }
    if (!company) { result.errors.push({ row: rn, reason: "Company is required" }); return; }
    if (!phone)   { result.errors.push({ row: rn, reason: "Phone is required" }); return; }
    if (!branch)  { result.errors.push({ row: rn, reason: `Invalid branch "${str(r.branch)}" — use TVM/KTYM/EKM/CLT` }); return; }

    const pk = phoneKey(phone);
    if (pk && seen.has(pk)) { result.skipped.push({ row: rn, reason: `Duplicate phone ${phone}` }); return; }
    if (pk) seen.add(pk);

    toCreate.push({
      customerNo:  autoNo("C", seq++),
      name, company, phone,
      email:       str(r.email) || null,
      branch:      branch as never,
      address:     str(r.address) || null,
      gstNo:       str(r.gstNo) || null,
      creditLimit: num(r.creditLimit),
    });
  });

  if (toCreate.length) {
    try {
      await prisma.customer.createMany({ data: toCreate });
      result.created = toCreate.length;
    } catch {
      return err("Could not save the import — a database error occurred and no records were created. Please retry.", 500);
    }
  }
  return ok(result);
}
