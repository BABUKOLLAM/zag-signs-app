import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";
import { str, num, normBranch, normEnum, phoneKey, rowNo, maxTrailingInt, type RowResult } from "@/lib/bulk-helpers";

const STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const SOURCES  = ["COLD_CALL", "REFERRAL", "WALK_IN", "WEBSITE", "SOCIAL_MEDIA", "EXHIBITION", "OTHER"];

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { rows } = (await req.json()) as { rows?: Record<string, unknown>[] };
  if (!Array.isArray(rows) || rows.length === 0) return err("No rows provided");
  if (rows.length > 2000) return err("Too many rows — split into files of 2000 or fewer");

  const result: RowResult = { created: 0, skipped: [], errors: [] };

  const existing = await prisma.lead.findMany({ select: { phone: true, leadNo: true } });
  const seen = new Set(existing.map((l) => phoneKey(l.phone)));

  // Max existing number, not count — leads can be deleted, so count-based
  // numbering would risk a duplicate leadNo that fails the whole batch.
  let seq = maxTrailingInt(existing.map((l) => l.leadNo));
  const toCreate: Prisma.LeadCreateManyInput[] = [];

  rows.forEach((r, i) => {
    const rn = rowNo(r, i);
    const name = str(r.name), phone = str(r.phone);
    const branch = normBranch(r.branch);

    if (!name)   { result.errors.push({ row: rn, reason: "Name is required" }); return; }
    if (!phone)  { result.errors.push({ row: rn, reason: "Phone is required" }); return; }
    if (!branch) { result.errors.push({ row: rn, reason: `Invalid branch "${str(r.branch)}" — use TVM/KTYM/EKM/CLT` }); return; }

    const pk = phoneKey(phone);
    if (pk && seen.has(pk)) { result.skipped.push({ row: rn, reason: `Duplicate phone ${phone}` }); return; }
    if (pk) seen.add(pk);

    const status = STATUSES.includes(normEnum(r.status)) ? normEnum(r.status) : "NEW";
    const source = SOURCES.includes(normEnum(r.source)) ? normEnum(r.source) : "OTHER";

    toCreate.push({
      leadNo:       autoNo("L", seq++),
      name,
      company:      str(r.company) || null,
      phone,
      email:        str(r.email) || null,
      branch:       branch as never,
      status:       status as never,
      source:       source as never,
      value:        num(r.value),
      notes:        str(r.notes) || null,
    });
  });

  if (toCreate.length) {
    try {
      await prisma.lead.createMany({ data: toCreate });
      result.created = toCreate.length;
    } catch {
      return err("Could not save the import — a database error occurred and no records were created. Please retry.", 500);
    }
  }
  return ok(result);
}
