import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, autoNo } from "@/lib/api-helpers";

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
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
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
  const body = await request.json() as {
    name?: string; designation?: string; department?: string; branch?: string;
    phone?: string; email?: string; dateOfJoining?: string; salary?: number;
  };
  if (!body.name?.trim())        return err("Name is required");
  if (!body.designation?.trim()) return err("Designation is required");
  if (!body.department?.trim())  return err("Department is required");
  if (!body.branch)              return err("Branch is required");

  const count = await prisma.employee.count();
  const employeeNo = autoNo("EMP-", count);

  const emp = await prisma.employee.create({
    data: {
      employeeNo, name: body.name.trim(),
      designation: body.designation.trim(),
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
