import { NextRequest } from "next/server";
import { requireSession, ok, err } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";

function fjpNo(count: number) {
  const d = new Date();
  return `FJP-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(count + 1).padStart(3, "0")}`;
}

// Deadline: 27th of previous month
function getSubmissionWindow() {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const forMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`;
  const deadline = new Date(now.getFullYear(), now.getMonth(), 27);
  const isOpen = now.getDate() <= 27;
  const daysLeft = Math.max(0, 27 - now.getDate());
  return { forMonth, deadline, isOpen, daysLeft };
}

export async function GET(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const sp = req.nextUrl.searchParams;
    const userId = sp.get("userId") || (session.user as any).id;
    const month = sp.get("month");

    const fjps = await prisma.fJP.findMany({
      where: {
        userId,
        ...(month ? { forMonth: month } : {}),
      },
      include: {
        routes: { orderBy: { dayDate: "asc" } },
        user: { select: { id: true, name: true, branch: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const submissionWindow = getSubmissionWindow();
    return ok({ fjps, window: submissionWindow });
  } catch (e: any) {
    return err(e.message, 500);
  }
}

export async function POST(req: NextRequest) {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  try {
    const body = await req.json();
    const { routes = [], notes, status = "SUBMITTED" } = body;
    const userId = (session.user as any).id;

    const submissionWindow = getSubmissionWindow();

    const count = await prisma.fJP.count();
    const no = fjpNo(count);

    const totalKm = routes.reduce((s: number, r: any) => s + (parseFloat(r.estimatedKm) || 0), 0);
    const estimatedCost = totalKm * 6; // ₹6/km default rate

    const fjp = await prisma.fJP.create({
      data: {
        fjpNo: no,
        userId,
        forMonth: submissionWindow.forMonth,
        status,
        totalDays: routes.length,
        totalKm,
        estimatedCost,
        notes: notes || null,
        routes: {
          create: routes.map((r: any) => ({
            dayDate: new Date(r.dayDate),
            fromPlace: r.fromPlace,
            toPlace: r.toPlace,
            purpose: r.purpose,
            customerOrProspect: r.customerOrProspect || null,
            estimatedKm: parseFloat(r.estimatedKm) || 0,
            modeOfTravel: r.modeOfTravel || "Two Wheeler",
          })),
        },
      },
      include: { routes: true },
    });

    return ok(fjp, 201);
  } catch (e: any) {
    return err(e.message, 500);
  }
}
