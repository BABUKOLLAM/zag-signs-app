import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return err("Document not found", 404);

  await prisma.document.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}
