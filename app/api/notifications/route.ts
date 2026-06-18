import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const dbUser = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;

  if (!dbUser) return ok([]);

  const notifications = await prisma.notification.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return ok(notifications.map(n => ({
    id: n.id, title: n.title, message: n.message, type: n.type,
    isRead: n.isRead, link: n.link ?? "", createdAt: n.createdAt.toISOString(),
  })));
}

export async function POST(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);
  const body = await request.json() as {
    userId?: string; title?: string; message?: string; type?: string; link?: string;
  };
  if (!body.userId || !body.title || !body.message) return err("userId, title, message required");

  const n = await prisma.notification.create({
    data: { userId: body.userId, title: body.title, message: body.message, type: body.type ?? "info", link: body.link ?? null },
  });
  return ok(n, 201);
}

export async function PATCH(request: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const dbUser = session.user?.email
    ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    : null;
  if (!dbUser) return err("User not found", 404);

  await prisma.notification.updateMany({ where: { userId: dbUser.id, isRead: false }, data: { isRead: true } });
  return ok({ marked: true });
}
