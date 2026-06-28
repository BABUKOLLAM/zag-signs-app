import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

const BRANCHES = ["HO", "TVM", "KTYM", "EKM", "CLT"];

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const branch = req.nextUrl.searchParams.get("branch") || "TVM";
  if (!BRANCHES.includes(branch)) return err("Invalid branch", 400);

  const setting = await prisma.branchOperationalSetting.upsert({
    where: { id: branch },
    create: { id: branch },
    update: {},
  });

  return ok({ ...setting, machineTypes: JSON.parse(setting.machineTypes || "[]"), materialCategories: JSON.parse(setting.materialCategories || "[]") });
}

export async function PUT(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const role = (session.user as any).role;
  if (!["MD", "IT_ADMIN"].includes(role)) return err("Forbidden — MD or IT Admin only", 403);

  const body = await req.json();
  const { branch, machineTypes, materialCategories, ...rest } = body;

  if (!branch || !BRANCHES.includes(branch)) return err("Invalid branch", 400);

  const setting = await prisma.branchOperationalSetting.upsert({
    where: { id: branch },
    create: {
      id: branch,
      ...rest,
      machineTypes: JSON.stringify(machineTypes ?? []),
      materialCategories: JSON.stringify(materialCategories ?? []),
    },
    update: {
      ...rest,
      machineTypes: JSON.stringify(machineTypes ?? []),
      materialCategories: JSON.stringify(materialCategories ?? []),
    },
  });

  return ok({ ...setting, machineTypes: JSON.parse(setting.machineTypes || "[]"), materialCategories: JSON.parse(setting.materialCategories || "[]") });
}
