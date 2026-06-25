import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function expNo(count: number) {
  const d = new Date();
  return `EXP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const sp = req.nextUrl.searchParams;
    const userId = sp.get("userId");
    const status = sp.get("status");
    const month = sp.get("month");
    const role = (session.user as any).role;
    const myId = (session.user as any).id;

    // HOD/Accounts/CEO/MD/AVP see pending approvals; others see own
    const isApprover = ["MD", "AVP", "BUSINESS_MANAGER", "ACCOUNTS"].includes(role);

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

    return new Response(JSON.stringify(ok(expenses)), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify(err(e.message)), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return new Response(JSON.stringify(err("Unauthorized")), { status: 401 });

  try {
    const body = await req.json();
    const { expenseType, description, fjpId, items = [], advanceReceived = 0, status = "SUBMITTED" } = body;
    const userId = (session.user as any).id;

    if (!expenseType || !description) {
      return new Response(JSON.stringify(err("expenseType and description are required")), { status: 400 });
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
      },
      include: { items: true, user: { select: { name: true } } },
    });

    return new Response(JSON.stringify(ok(expense)), { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify(err(e.message)), { status: 500 });
  }
}
