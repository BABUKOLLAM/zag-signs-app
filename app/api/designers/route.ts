import { prisma } from "@/lib/prisma";
import { ok, err, requireSession } from "@/lib/api-helpers";

// List active designers (users with role DESIGNER), with a quick load summary so
// front-office can pick the least-busy person.
export async function GET() {
  const session = await requireSession();
  if (!session) return err("Unauthorized", 401);

  const designers = await prisma.user.findMany({
    where: { role: "DESIGNER", status: "ACTIVE", isActive: true },
    select: {
      id: true, name: true, email: true, branch: true,
      assignedTickets: {
        where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "HALF_DONE"] } },
        select: { id: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return ok(designers.map((d) => ({
    id: d.id, name: d.name, email: d.email, branch: d.branch,
    activeCount:  d.assignedTickets.length,
    wipCount:     d.assignedTickets.filter((t) => t.status === "IN_PROGRESS").length,
    halfDoneCount:d.assignedTickets.filter((t) => t.status === "HALF_DONE").length,
  })));
}
