import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { id } = await params;
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return err("Document not found", 404);

  await prisma.document.delete({ where: { id } });
  return ok({ deleted: true });
}
