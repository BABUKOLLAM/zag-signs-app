// Machine seed — ZAG SIGNS Excel data
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const MACHINES = [
  // ─── TVM ──────────────────────────────────────────────────────────────
  { branch: "TVM", name: "Image Press V 800 Printer",                       type: "Printing",    model: "Image Press V 800",     qty: 1, perf: "80 copies per minute",               notes: "With accessories" },
  { branch: "TVM", name: "Lamination Machine CFL-380L",                     type: "Laminating",  model: "CFL-380L",              qty: 1, perf: "30 copies per minute" },
  { branch: "TVM", name: "Auto Feed Label Cutter Smartcut-UC400 Dual Head", type: "Cutting",     model: "Smartcut-UC400",        qty: 1, perf: "250 copies per minute" },
  { branch: "TVM", name: "Digital Creasing & Perforation Machine MCP A13",  type: "Finishing",   model: "MCP A13",               qty: 1, perf: "30 copies per minute",               notes: "Manual Feed" },
  { branch: "TVM", name: "Smart Cut Electronic Paper Cutting Machine E4908",type: "Cutting",     model: "E4908",                 qty: 1, perf: "300 copies per minute" },
  { branch: "TVM", name: "Flex Printing Machine 1024i",                     type: "Printing",    model: "1024i",                 qty: 1, perf: "2200 sq.ft per hour",                notes: "Printer 1024i" },
  { branch: "TVM", name: "UPS 8-Hour",                                      type: "UPS",         model: null,                    qty: 1, perf: "8 hour backup" },
  { branch: "TVM", name: "Battery 100mAh (TVM)",                            type: "Battery",     model: "100mAh",                qty: 16, perf: null },
  { branch: "TVM", name: "Computer (TVM)",                                  type: "Computer",    model: null,                    qty: 11, perf: null },
  { branch: "TVM", name: "Mug Printing Machine",                            type: "Printing",    model: null,                    qty: 1, perf: "10 minutes per mug" },
  { branch: "TVM", name: "T-Shirt Printing Machine",                        type: "Printing",    model: null,                    qty: 1, perf: "10 minutes per shirt" },
  { branch: "TVM", name: "HP Laserjet M1005",                               type: "Office Printer", model: "M1005",             qty: 1, perf: "Normal printer" },
  { branch: "TVM", name: "Canon IR2004N",                                   type: "Office Printer", model: "IR2004N",            qty: 1, perf: "Photostat machine" },
  { branch: "TVM", name: "Epson L8050 Sublimation Printer",                 type: "Printing",    model: "L8050",                qty: 1, perf: "Normal printer",                      notes: "Sublimation" },
  { branch: "TVM", name: "Offset Printing Machine",                         type: "Printing",    model: null,                    qty: 1, perf: "5000 copies per hour" },
  { branch: "TVM", name: "Offset Cutting Machine",                          type: "Cutting",     model: null,                    qty: 1, perf: "5000 copies per cut" },
  { branch: "TVM", name: "Canon Laserjet Pro MFP M126nw",                   type: "Office Printer", model: "MFP M126nw",        qty: 1, perf: "Normal printer" },
  { branch: "TVM", name: "Grinder Bull Gold",                               type: "Fabrication", model: "Bull Gold",            qty: 1, perf: null },
  { branch: "TVM", name: "Big Cutting Machine (TVM)",                       type: "Cutting",     model: null,                   qty: 1, perf: null },
  { branch: "TVM", name: "Welding Machine Toshon",                          type: "Fabrication", model: "Toshon",               qty: 1, perf: null },
  { branch: "TVM", name: "Drilling Machine Normal XNT 21V",                 type: "Fabrication", model: "XNT 21V",              qty: 1, perf: null },
  { branch: "TVM", name: "Drilling Machine Heavy Duty JRK",                 type: "Fabrication", model: "JRK",                  qty: 1, perf: null },
  { branch: "TVM", name: "Wooden Stapler (TVM)",                            type: "Fabrication", model: null,                   qty: 5, perf: null },

  // ─── EKM ──────────────────────────────────────────────────────────────
  { branch: "EKM", name: "Canon Image Runner C3326",                        type: "Office Printer", model: "C3326",             qty: 1, perf: "20 copies per minute",                notes: "Digital Printer" },
  { branch: "EKM", name: "HP Laserjet (EKM)",                               type: "Office Printer", model: null,               qty: 1, perf: "Normal printer" },
  { branch: "EKM", name: "Flex Printing Machine Smuet 1024i (EKM)",         type: "Printing",    model: "Smuet 1024i",          qty: 1, perf: "1400 sq.ft per hour" },
  { branch: "EKM", name: "Computer (EKM)",                                  type: "Computer",    model: null,                   qty: 5, perf: null },
  { branch: "EKM", name: "Invertor Welding Machine MMA 2000NS",             type: "Fabrication", model: "MMA 2000NS",           qty: 1, perf: null },
  { branch: "EKM", name: "Angle Grinder MMA 2000NS",                        type: "Fabrication", model: "MMA 2000NS",           qty: 1, perf: null },
  { branch: "EKM", name: "Wooden Cutting Machine Emtrax (EKM)",             type: "Cutting",     model: "Emtrax",               qty: 1, perf: null },
  { branch: "EKM", name: "Cordless Impact Driller XTCDS 126",               type: "Fabrication", model: "XTCDS 126",            qty: 1, perf: null },
  { branch: "EKM", name: "Wooden Stapler (EKM)",                            type: "Fabrication", model: null,                   qty: 2, perf: null },
  { branch: "EKM", name: "Supra UPS 5KV (EKM)",                             type: "UPS",         model: "Supra 5KV",            qty: 1, perf: "5 hours backup" },
  { branch: "EKM", name: "Battery 100mAh (EKM)",                            type: "Battery",     model: "100mAh",               qty: 10, perf: null },

  // ─── CLT (Kozhikode) ──────────────────────────────────────────────────
  { branch: "CLT", name: "Supra Online UPS 5KV (CLT)",                      type: "UPS",         model: "Supra 5KV",            qty: 1, perf: "5 hours backup" },
  { branch: "CLT", name: "Battery 100mAh (CLT)",                            type: "Battery",     model: "100mAh",               qty: 10, perf: null },
  { branch: "CLT", name: "Canon Image Runner Photocopy (CLT)",               type: "Office Printer", model: "Canon Image Runner", qty: 1, perf: "20 copies per minute" },
  { branch: "CLT", name: "Colorjet Irisjet Flex Printing Machine",           type: "Printing",    model: "Irisjet",              qty: 1, perf: "800 sq.ft per hour" },
  { branch: "CLT", name: "Epson Inkjet Printer (CLT)",                       type: "Office Printer", model: "Epson Inkjet",      qty: 1, perf: "Normal printer" },
  { branch: "CLT", name: "Computer (CLT)",                                   type: "Computer",    model: null,                   qty: 4, perf: null },

  // ─── KTYM (Kottayam) ──────────────────────────────────────────────────
  { branch: "KTYM", name: "UV Hybrid Printer G6 10ft 5-Head",               type: "Printing",    model: "G6 10ft",              qty: 1, perf: "Not installed",  notes: "35 heads config; not yet installed" },
  { branch: "KTYM", name: "CNC Cutting Machine 8x4 CCD 150W",               type: "Cutting",     model: "CCD 150W 8x4",         qty: 1, perf: "Not installed" },
  { branch: "KTYM", name: "CNC Engraving Machine 8x4",                      type: "Fabrication", model: "8x4 CNC",              qty: 1, perf: "Not installed" },
  { branch: "KTYM", name: "Flex Printing Machine 1024i (KTYM)",             type: "Printing",    model: "1024i",                qty: 1, perf: "1400 sq.ft per hour" },
  { branch: "KTYM", name: "Flex Printing Machine 512i",                     type: "Printing",    model: "512i",                 qty: 1, perf: "550 sq.ft per hour" },
  { branch: "KTYM", name: "Canon Colour Printer (KTYM)",                    type: "Office Printer", model: "Canon Colour",       qty: 1, perf: "20 copies per minute" },
  { branch: "KTYM", name: "Computer (KTYM)",                                type: "Computer",    model: null,                   qty: 4, perf: null },
  { branch: "KTYM", name: "UPS 10KV (KTYM)",                                type: "UPS",         model: "10KV",                 qty: 1, perf: "8 hours backup" },
  { branch: "KTYM", name: "Battery 100mAh (KTYM-A)",                        type: "Battery",     model: "100mAh",               qty: 16, perf: null },
  { branch: "KTYM", name: "UPS 5KV (KTYM)",                                 type: "UPS",         model: "5KV",                  qty: 2, perf: null },
  { branch: "KTYM", name: "Battery 100mAh (KTYM-B)",                        type: "Battery",     model: "100mAh",               qty: 10, perf: null },
  { branch: "KTYM", name: "Wooden Cutting Machine Emtrax (KTYM)",           type: "Cutting",     model: "Emtrax",               qty: 1, perf: null },
  { branch: "KTYM", name: "Wooden Stapler (KTYM)",                          type: "Fabrication", model: null,                   qty: 2, perf: null },
];

async function seed() {
  // Get current max machine number
  const existing = await prisma.machine.findMany({ select: { machineNo: true, name: true } });
  const existingNames = new Set(existing.map(m => m.name.toLowerCase().trim()));

  const nums = existing.map(m => {
    const match = m.machineNo.match(/\d+$/);
    return match ? parseInt(match[0]) : 0;
  });
  let seq = nums.length > 0 ? Math.max(...nums) + 1 : 1;

  let created = 0, skipped = 0;

  for (const m of MACHINES) {
    const nameLower = m.name.toLowerCase().trim();
    if (existingNames.has(nameLower)) {
      console.log(`  SKIP: ${m.name} (${m.branch}) — already exists`);
      skipped++;
      continue;
    }
    existingNames.add(nameLower);

    const machineNo = `M-${String(seq).padStart(3, "0")}`;
    seq++;

    const notes = [
      m.notes ?? "",
      m.qty > 1 ? `Qty: ${m.qty}` : "",
    ].filter(Boolean).join(" | ") || null;

    await prisma.machine.create({
      data: {
        machineNo,
        name: m.name,
        type: m.type,
        model: m.model ?? null,
        branch: m.branch,
        capacityPerHour: null,
        notes: [m.perf ? `Performance: ${m.perf}` : "", notes ?? ""].filter(Boolean).join(" | ") || null,
        status: m.perf === "Not installed" ? "MAINTENANCE" : "ACTIVE",
      },
    });
    console.log(`  CREATE: [${m.branch}] ${machineNo} — ${m.name}`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}`);
}

seed()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
