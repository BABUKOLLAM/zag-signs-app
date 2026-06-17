import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toLabel, toDate, autoNo } from "@/lib/api-helpers";
import { Branch, LeadStatus, LeadSource } from "@prisma/client";

function shape(l: Awaited<ReturnType<typeof prisma.lead.findFirst>>) {
  if (!l) return null;
  return {
    id: l.id,
    leadNo: l.leadNo,
    name: l.name,
    company: l.company ?? "",
    phone: l.phone,
    email: l.email ?? "",
    branch: l.branch,
    status: l.status,
    statusLabel: toLabel(l.status),
    source: l.source,
    sourceLabel: toLabel(l.source),
    value: l.value,
    assignedToId: l.assignedToId,
    followUpDate: toDate(l.followUpDate),
    createdAt: toDate(l.createdAt),
    notes: l.notes ?? "",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch") as Branch | null;
  const status = searchParams.get("status") as LeadStatus | null;
  const search = searchParams.get("search") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "50"));

  const where = {
    ...(branch ? { branch } : {}),
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { company: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search } },
          ],
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({
    data: leads.map((l) => ({
      ...shape(l),
      assignedTo: l.assignedTo?.name ?? "Unassigned",
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, company, phone, email, branch, status, source, value, followUpDate, notes, assignedToId } = body;

  if (!name?.trim()) return err("Name is required");
  if (!phone?.trim()) return err("Phone is required");
  if (!branch) return err("Branch is required");

  const count = await prisma.lead.count();
  const leadNo = autoNo("L", count);

  const lead = await prisma.lead.create({
    data: {
      leadNo,
      name: name.trim(),
      company: company?.trim() ?? null,
      phone: phone.trim(),
      email: email?.trim() ?? null,
      branch: branch as Branch,
      status: (status as LeadStatus) ?? LeadStatus.NEW,
      source: (source as LeadSource) ?? LeadSource.OTHER,
      value: Number(value) || 0,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes: notes?.trim() ?? null,
      assignedToId: assignedToId ?? null,
      createdById: null,
    },
  });

  return ok(shape(lead), 201);
}
