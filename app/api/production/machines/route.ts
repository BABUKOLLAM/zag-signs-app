import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { normBranch } from "@/lib/bulk-helpers";
import { validateText, isNegative } from "@/lib/validation";

const CAT_CODES: Record<string, string> = {
  "Printing":         "PRT",
  "UV Printing":      "PRT",
  "Digital Printing": "PRT",
  "Cutting":          "CUT",
  "Laminating":       "LAM",
  "Finishing":        "FIN",
  "Fabrication":      "FAB",
  "Office Printer":   "OFP",
  "UPS":              "UPS",
  "Battery":          "BAT",
  "Computer":         "COM",
  "Other":            "OTH",
};

async function genMachineCode(branch: string, type: string): Promise<string> {
  const cat = CAT_CODES[type] ?? "OTH";
  const prefix = `${branch}-${cat}-`;
  const existing = await prisma.machine.findMany({
    where: { machineNo: { startsWith: prefix } },
    select: { machineNo: true },
  });
  const maxSeq = existing.reduce((max, m) => {
    const num = parseInt(m.machineNo.slice(prefix.length), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const searchParams = req.nextUrl.searchParams;
    const branch = searchParams.get("branch");
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where: any = {};
    if (branch) where.branch = normBranch(branch);
    if (status) where.status = status;
    if (type) where.type = type;

    const machines = await prisma.machine.findMany({
      where,
      orderBy: { machineNo: "asc" },
      take: 300,
    });

    return ok(machines, 200);
  } catch (error: any) {
    return err(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();

    const nameError = validateText(body.name, "Machine name");
    if (nameError) return err(nameError);
    if (body.model) {
      const modelError = validateText(body.model, "Model / Make");
      if (modelError) return err(modelError);
    }
    if (body.location) {
      const locationError = validateText(body.location, "Location");
      if (locationError) return err(locationError);
    }
    if (isNegative(body.hourlyRate)) return err("Hourly Rate cannot be negative");
    if (isNegative(body.capacityPerHour)) return err("Capacity/hr cannot be negative");

    // Generate structured machine code: [BRANCH]-[CAT]-[SEQ]
    const machineNo = await genMachineCode(body.branch || "TVM", body.type || "Other");

    const machine = await prisma.machine.create({
      data: {
        machineNo,
        name: body.name,
        type: body.type,
        printType: body.printType || null,
        model: body.model || null,
        location: body.location || null,
        branch: body.branch || "TVM",
        hourlyRate: body.hourlyRate || 0,
        capacityPerHour: body.capacityPerHour || null,
        notes: body.notes || null,
      },
    });

    return ok(machine, 201);
  } catch (error: any) {
    return err(error.message, 500);
  }
}
