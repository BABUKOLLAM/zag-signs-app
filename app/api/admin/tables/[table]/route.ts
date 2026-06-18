import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

function isAdmin(role: string) {
  return ["MD","IT Admin","IT_ADMIN"].some(r => role === r || role.replace(/\s/g,"_") === r.replace(/\s/g,"_"));
}

const MODEL_MAP: Record<string, string> = {
  users:          "user",
  leads:          "lead",
  customers:      "customer",
  opportunities:  "opportunity",
  quotations:     "quotation",
  "sales-orders": "salesOrder",
  "work-orders":  "workOrder",
  materials:      "material",
  documents:      "document",
  employees:      "employee",
  invoices:       "invoice",
  collections:    "collection",
  complaints:     "complaint",
  tasks:          "task",
};

// Fields to omit from user records for security
const OMIT_FIELDS: Record<string, string[]> = {
  users: ["password","approvalToken"],
};

function sanitize(table: string, row: Record<string, unknown>): Record<string, unknown> {
  const omit = OMIT_FIELDS[table] ?? [];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (!omit.includes(k)) out[k] = v;
  }
  return out;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  const { table } = await params;
  const model = MODEL_MAP[table];
  if (!model) return err("Unknown table", 404);

  const { searchParams } = new URL(request.url);
  const page  = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? 50));
  const skip  = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (prisma as any)[model];
  const [rows, total] = await Promise.all([
    delegate.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    delegate.count(),
  ]);

  return ok({
    table,
    total,
    page,
    limit,
    rows: rows.map((r: Record<string, unknown>) => sanitize(table, r)),
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const role = (session.user as { role: string }).role;
  if (!isAdmin(role)) return err("Forbidden", 403);

  const { table } = await params;
  const model = MODEL_MAP[table];
  if (!model) return err("Unknown table", 404);

  const body = await request.json() as { id: string; data: Record<string, unknown> };
  if (!body.id || !body.data) return err("id and data required");

  // Prevent mutation of sensitive fields
  const safeData = { ...body.data };
  for (const f of (OMIT_FIELDS[table] ?? [])) delete safeData[f];
  delete safeData.id;
  delete safeData.createdAt;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updated = await (prisma as any)[model].update({
    where: { id: body.id },
    data:  safeData,
  });

  return ok(sanitize(table, updated));
}
