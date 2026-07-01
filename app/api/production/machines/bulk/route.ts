import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/api-helpers";
import {
  str, num, normBranch, rowNo, maxTrailingInt
} from "@/lib/bulk-helpers";


interface RowInput {
  __row: number;
  name?: string;
  type?: string;
  printType?: string;
  model?: string;
  location?: string;
  branch?: string;
  hourlyRate?: string;
  capacityPerHour?: string;
  notes?: string;
  [key: string]: any;
}

interface RowResult {
  row: number;
  error?: string;
  skip?: string;
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const body = await req.json();
    const rows: RowInput[] = body.rows || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ created: 0, skipped: [], errors: [] }), { status: 200 });
    }

    if (rows.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Maximum 2000 rows per upload" }),
        { status: 400 }
      );
    }

    // Pre-load existing machines by name
    const existing = await prisma.machine.findMany({
      select: { name: true },
    });
    const existingNames = new Set(existing.map((m) => m.name.toLowerCase()));

    // Calculate next sequence number
    const allMachines = await prisma.machine.findMany({
      select: { machineNo: true },
    });
    const nextSeq = maxTrailingInt(allMachines.map((m) => m.machineNo)) + 1;

    const created: any[] = [];
    const skipped: RowResult[] = [];
    const errors: RowResult[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rno = rowNo(row, i);

      // Validate required fields
      const name = str(row.name);
      const type = str(row.type);
      const branch = normBranch(str(row.branch));

      if (!name) {
        errors.push({ row: rno, error: "Missing machine name" });
        continue;
      }
      if (!type) {
        errors.push({ row: rno, error: "Missing type (Printing, Cutting, etc.)" });
        continue;
      }
      if (!branch) {
        errors.push({ row: rno, error: "Invalid or missing branch (TVM, KTYM, EKM, CLT)" });
        continue;
      }

      // Check for duplicates
      if (existingNames.has(name.toLowerCase())) {
        skipped.push({ row: rno, skip: `Machine "${name}" already exists` });
        continue;
      }
      existingNames.add(name.toLowerCase());

      // Create machine
      try {
        const machineNo = `M-${String(nextSeq + created.length).padStart(3, "0")}`;
        const machine = await prisma.machine.create({
          data: {
            machineNo,
            name,
            type,
            printType: str(row.printType) || null,
            model: str(row.model) || null,
            location: str(row.location) || null,
            branch,
            hourlyRate: num(row.hourlyRate),
            capacityPerHour: row.capacityPerHour ? num(row.capacityPerHour) : null,
            notes: str(row.notes) || null,
          },
        });
        created.push(machine);
      } catch (err: any) {
        errors.push({ row: rno, error: `Database error: ${err.message}` });
      }
    }

    return new Response(
      JSON.stringify({ created: created.length, skipped, errors }),
      { status: 201 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500 }
    );
  }
}
