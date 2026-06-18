import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

function isAdmin(role: string) {
  return ["MD","IT Admin","IT_ADMIN"].some(r => role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_"));
}

// Whitelisted tables with their Prisma model delegate accessor
const TABLES: Record<string, string> = {
  users:         "user",
  leads:         "lead",
  customers:     "customer",
  opportunities: "opportunity",
  quotations:    "quotation",
  "sales-orders":"salesOrder",
  "work-orders": "workOrder",
  materials:     "material",
  documents:     "document",
  employees:     "employee",
  invoices:      "invoice",
  collections:   "collection",
  complaints:    "complaint",
  tasks:         "task",
};

export async function GET(_req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  // Return table list with record counts
  const counts = await Promise.all(
    Object.entries(TABLES).map(async ([table, model]) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const count = await (prisma as any)[model].count();
        return { table, model, count };
      } catch {
        return { table, model, count: 0 };
      }
    })
  );

  return ok(counts);
}
