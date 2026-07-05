// Update machine codes to structured format: [BRANCH]-[CAT]-[SEQ]
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Category code map
const CAT = {
  "Printing":       "PRT",
  "Cutting":        "CUT",
  "Laminating":     "LAM",
  "Finishing":      "FIN",
  "Fabrication":    "FAB",
  "Office Printer": "OFP",
  "UPS":            "UPS",
  "Battery":        "BAT",
  "Computer":       "COM",
};

async function updateCodes() {
  const machines = await prisma.machine.findMany({ orderBy: [{ branch: "asc" }, { type: "asc" }, { createdAt: "asc" }] });

  // Group by branch + category, assign seq
  const seqMap = {};
  const updates = [];

  for (const m of machines) {
    const catCode = CAT[m.type] ?? "OTH";
    const key = `${m.branch}-${catCode}`;
    seqMap[key] = (seqMap[key] ?? 0) + 1;
    const newCode = `${m.branch}-${catCode}-${String(seqMap[key]).padStart(2, "0")}`;
    updates.push({ id: m.id, oldCode: m.machineNo, newCode, name: m.name, branch: m.branch, type: m.type });
  }

  for (const u of updates) {
    await prisma.machine.update({ where: { id: u.id }, data: { machineNo: u.newCode } });
    console.log(`  ${u.oldCode.padEnd(8)} → ${u.newCode.padEnd(16)} | [${u.branch}] ${u.type.padEnd(14)} | ${u.name}`);
  }

  console.log(`\nUpdated ${updates.length} machines.`);
}

updateCodes()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
