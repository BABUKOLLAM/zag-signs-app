import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, requirePathAccess, autoNo } from "@/lib/api-helpers";
import { hasRole } from "@/lib/bulk-helpers";
import { validateText, validatePhone, validateEmail, isNegative } from "@/lib/validation";

// Employee records carry payroll data — restrict writes to HR / mgmt / admins.
const EMP_ROLES = ["MD", "AVP", "IT Admin", "HR", "Consultant"];

function shape(e: {
  id: string; employeeNo: string; name: string; designation: string;
  department: string; branch: string; phone: string | null; email: string | null;
  dateOfJoining: Date | null; salary: number | null; isActive: boolean; createdAt: Date;
}) {
  return {
    id: e.id, employeeNo: e.employeeNo, name: e.name,
    designation: e.designation, department: e.department,
    branch: e.branch, phone: e.phone ?? "", email: e.email ?? "",
    dateOfJoining: e.dateOfJoining ? e.dateOfJoining.toISOString().split("T")[0] : "",
    salary: e.salary ?? 0, isActive: e.isActive,
    createdAt: e.createdAt.toISOString().split("T")[0],
  };
}

export async function GET(request: NextRequest) {
  // Uses the same override-aware check as the /hr page's RouteGuard, so this
  // endpoint's access exactly matches who can actually see the page — not a
  // second hardcoded role list that can drift out of sync (salary is in here).
  const session = await requirePathAccess("/hr");
  if (!session) return err("Forbidden — you don't have access to staff records", 403);
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const dept   = searchParams.get("department");
  const branch = searchParams.get("branch");

  const employees = await prisma.employee.findMany({
    where: {
      ...(dept   ? { department: dept }   : {}),
      ...(branch ? { branch: branch as never } : {}),
      ...(search ? { OR: [
        { name:        { contains: search, mode: "insensitive" } },
        { employeeNo:  { contains: search, mode: "insensitive" } },
        { designation: { contains: search, mode: "insensitive" } },
      ]} : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return ok(employees.map(shape));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  if (!hasRole((session.user as { role?: string }).role, EMP_ROLES))
    return err("Forbidden — only HR or an administrator can add employees", 403);
  const body = await request.json() as {
    name?: string; designation?: string; department?: string; branch?: string;
    phone?: string; email?: string; dateOfJoining?: string; salary?: number;
  };
  const nameError = validateText(body.name, "Full Name");
  if (nameError) return err(nameError);
  const designationError = validateText(body.designation, "Designation");
  if (designationError) return err(designationError);
  if (!body.department?.trim())  return err("Department is required");
  if (!body.branch)              return err("Branch is required");
  const phoneError = validatePhone(body.phone, "Phone");
  if (phoneError) return err(phoneError);
  const emailError = validateEmail(body.email, "Email");
  if (emailError) return err(emailError);
  if (isNegative(body.salary)) return err("Salary cannot be negative");

  const count = await prisma.employee.count();
  const employeeNo = autoNo("EMP-", count);

  const emp = await prisma.employee.create({
    data: {
      employeeNo, name: (body.name as string).trim(),
      designation: (body.designation as string).trim(),
      department: body.department.trim(),
      branch: body.branch as never,
      phone: body.phone || null,
      email: body.email?.toLowerCase() || null,
      dateOfJoining: body.dateOfJoining ? new Date(body.dateOfJoining) : null,
      salary: body.salary ?? null,
    },
  });
  return ok(shape(emp), 201);
}
