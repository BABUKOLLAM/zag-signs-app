import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";
import { str, num, normBranch, rowNo, maxTrailingInt, hasRole, type RowResult } from "@/lib/bulk-helpers";

// Employee records carry payroll data — restrict to HR / management / admins.
const EMP_ROLES = ["MD", "AVP", "IT Admin", "HR", "Consultant"];

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  if (!hasRole((session.user as { role?: string }).role, EMP_ROLES))
    return err("Forbidden — only HR or an administrator can import employees", 403);

  const { rows } = (await req.json()) as { rows?: Record<string, unknown>[] };
  if (!Array.isArray(rows) || rows.length === 0) return err("No rows provided");
  if (rows.length > 2000) return err("Too many rows — split into files of 2000 or fewer");

  const result: RowResult = { created: 0, skipped: [], errors: [] };

  // Duplicate key = email (if present) else name (case-insensitive)
  const existing = await prisma.employee.findMany({ select: { email: true, name: true, employeeNo: true } });
  const seenEmail = new Set(existing.filter((e) => e.email).map((e) => e.email!.toLowerCase()));
  const seenName  = new Set(existing.map((e) => e.name.toLowerCase()));

  // Max existing number, not count, to avoid duplicate employeeNo collisions.
  let seq = maxTrailingInt(existing.map((e) => e.employeeNo));
  const toCreate: Prisma.EmployeeCreateManyInput[] = [];

  rows.forEach((r, i) => {
    const rn = rowNo(r, i);
    const name = str(r.name), designation = str(r.designation), department = str(r.department);
    const branch = normBranch(r.branch);
    const email = str(r.email).toLowerCase();

    if (!name)        { result.errors.push({ row: rn, reason: "Name is required" }); return; }
    if (!designation) { result.errors.push({ row: rn, reason: "Designation is required" }); return; }
    if (!department)  { result.errors.push({ row: rn, reason: "Department is required" }); return; }
    if (!branch)      { result.errors.push({ row: rn, reason: `Invalid branch "${str(r.branch)}" — use TVM/KTYM/EKM/CLT` }); return; }

    if (email && seenEmail.has(email)) { result.skipped.push({ row: rn, reason: `Duplicate email ${email}` }); return; }
    if (!email && seenName.has(name.toLowerCase())) { result.skipped.push({ row: rn, reason: `Duplicate name ${name}` }); return; }
    if (email) seenEmail.add(email);
    seenName.add(name.toLowerCase());

    const doj = str(r.dateOfJoining);
    const dojDate = doj ? new Date(doj) : null;

    toCreate.push({
      employeeNo:    autoNo("EMP-", seq++),
      name, designation, department,
      branch:        branch as never,
      phone:         str(r.phone) || null,
      email:         email || null,
      dateOfJoining: dojDate && !isNaN(dojDate.getTime()) ? dojDate : null,
      salary:        r.salary != null && str(r.salary) !== "" ? num(r.salary) : null,
    });
  });

  if (toCreate.length) {
    try {
      await prisma.employee.createMany({ data: toCreate });
      result.created = toCreate.length;
    } catch {
      return err("Could not save the import — a database error occurred and no records were created. Please retry.", 500);
    }
  }
  return ok(result);
}
