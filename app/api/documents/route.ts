import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession, toDate } from "@/lib/api-helpers";
import { Branch } from "@prisma/client";

function shape(d: Awaited<ReturnType<typeof prisma.document.findFirst>> & {
  uploadedBy?: { id: string; name: string } | null;
}) {
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    category: d.category,
    fileType: d.fileType,
    fileSize: d.fileSize ?? "",
    fileUrl: d.fileUrl ?? "",
    relatedTo: d.relatedTo ?? "",
    relatedType: d.relatedType ?? "",
    branch: d.branch ?? "",
    tags: d.tags,
    createdAt: toDate(d.createdAt),
    uploadedBy: d.uploadedBy?.name ?? "System",
  };
}

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const relatedTo = searchParams.get("relatedTo");
  const relatedType = searchParams.get("relatedType");
  const category = searchParams.get("category");
  const search = searchParams.get("search") ?? "";

  const docs = await prisma.document.findMany({
    where: {
      ...(relatedTo ? { relatedTo } : {}),
      ...(relatedType ? { relatedType } : {}),
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { relatedTo: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  return ok(docs.map(shape));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const body = await request.json() as {
    name?: string;
    category?: string;
    fileType?: string;
    fileSize?: string;
    fileUrl?: string;
    relatedTo?: string;
    relatedType?: string;
    branch?: string;
    tags?: string[];
  };

  const { name, category, fileType, fileSize, fileUrl, relatedTo, relatedType, branch, tags } = body;

  if (!name) return err("name is required");
  if (!category) return err("category is required");
  if (!fileType) return err("fileType is required");

  const uploader = session.user.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  const doc = await prisma.document.create({
    data: {
      name,
      category,
      fileType,
      fileSize: fileSize ?? null,
      fileUrl: fileUrl ?? null,
      relatedTo: relatedTo ?? null,
      relatedType: relatedType ?? null,
      branch: (branch as Branch) ?? null,
      tags: tags ?? [],
      uploadedById: uploader?.id ?? null,
    },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  return ok(shape(doc), 201);
}
