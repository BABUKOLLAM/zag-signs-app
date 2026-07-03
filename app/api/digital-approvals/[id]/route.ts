import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ok, err } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json(err("Unauthorized"), { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.remarks !== undefined) data.remarks = body.remarks;
  if (body.signatureUrl !== undefined) data.signatureUrl = body.signatureUrl;
  if (body.documentUrl !== undefined) data.documentUrl = body.documentUrl;
  if (body.status === "APPROVED") data.approvedAt = new Date();
  const row = await prisma.digitalApproval.update({ where: { id }, data });
  return NextResponse.json(ok(row));
}
