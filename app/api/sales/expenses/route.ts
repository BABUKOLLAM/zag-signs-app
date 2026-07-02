import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

function expNo(count: number) {
  const d = new Date();
  return `EXP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const sp = req.nextUrl.searchParams;
    const userId = sp.get("userId");
    const status = sp.get("status");
    const month = sp.get("month");
    const role = (session.user as any).role;
    const myId = (session.user as any).id;

    // HOD/Accounts/CEO/MD/AVP see pending approvals; others see own
    const isApprover = ["MD", "AVP", "Business Manager", "Accounts"].includes(role);

    const where: any = {};
    if (userId) where.userId = userId;
    else if (!isApprover) where.userId = myId;
    if (status) where.status = status;
    if (month) where.forMonth = month;

    const expenses = await prisma.expenseReport.findMany({
      where,
      include: {
        items: { orderBy: { date: "asc" } },
        attachments: true,
        approvals: {
          include: { actionBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
        user: { select: { id: true, name: true, branch: true, role: true } },
        fjp: { select: { fjpNo: true, forMonth: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return ok(expenses);
  } catch (e: any) {
    return err(e.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();
    const { expenseType, description, fjpId, items = [], attachments = [], advanceReceived = 0, status = "SUBMITTED" } = body;
    const userId = (session.user as any).id;

    if (!expenseType || !description) {
      return err("expenseType and description are required");
    }

    const count = await prisma.expenseReport.count();
    const no = expNo(count);
    const now = new Date();
    const forMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const totalAmount = items.reduce((s: number, i: any) => s + (parseFloat(i.amount) || 0), 0);
    const netPayable = totalAmount - parseFloat(advanceReceived) || 0;

    const expense = await prisma.expenseReport.create({
      data: {
        expenseNo: no,
        userId,
        fjpId: fjpId || null,
        expenseType,
        forMonth,
        description,
        totalAmount,
        advanceReceived: parseFloat(advanceReceived) || 0,
        netPayable,
        status,
        items: {
          create: items.map((i: any) => ({
            date: new Date(i.date),
            category: i.category,
            description: i.description,
            fromPlace: i.fromPlace || null,
            toPlace: i.toPlace || null,
            km: parseFloat(i.km) || 0,
            amount: parseFloat(i.amount) || 0,
            billAvailable: i.billAvailable !== false,
          })),
        },
        attachments: {
          create: attachments.map((a: any) => ({
            fileName: a.name,
            fileUrl: a.url,
            fileType: a.name?.split(".").pop()?.toLowerCase() || "file",
          })),
        },
      },
      include: { items: true, user: { select: { name: true } } },
    });

    return ok(expense, 201);
  } catch (e: any) {
    return err(e.message, 500);
  }
}
