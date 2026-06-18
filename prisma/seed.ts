import { PrismaClient, Branch, UserRole, LeadStatus, LeadSource, OrderStatus, QuotationStatus, ComplaintStatus, ComplaintPriority, TaskStatus, TaskPriority, VisitType, VisitOutcome, ApprovalStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(plain: string) {
  return bcrypt.hash(plain, 10);
}

async function main() {
  console.log("🌱 Seeding ZAG SIGNS ERP database...");

  // ── Users (9 BRD roles) ───────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "md@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Dr. Babu B", email: "md@zagsigns.com", password: await hash("MD@2026"), role: UserRole.MD, branch: null, phone: "9400000001", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "avp@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Rajesh Kumar", email: "avp@zagsigns.com", password: await hash("AVP@2026"), role: UserRole.AVP, branch: null, phone: "9400000002", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "bm@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Priya Nair", email: "bm@zagsigns.com", password: await hash("BM@2026"), role: UserRole.BUSINESS_MANAGER, branch: Branch.TVM, phone: "9400000003", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "sales@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Arun Kumar", email: "sales@zagsigns.com", password: await hash("Sales@2026"), role: UserRole.SALES_EXECUTIVE, branch: Branch.TVM, phone: "9400000004", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "cres@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Vijay CRE", email: "cres@zagsigns.com", password: await hash("CRES@2026"), role: UserRole.CRES, branch: Branch.EKM, phone: "9400000005", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "prod@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Kumar Suresh", email: "prod@zagsigns.com", password: await hash("Prod@2026"), role: UserRole.PRODUCTION, branch: Branch.TVM, phone: "9400000006", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "accounts@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Meera Thomas", email: "accounts@zagsigns.com", password: await hash("Acc@2026"), role: UserRole.ACCOUNTS, branch: Branch.TVM, phone: "9400000007", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "hr@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "Sonia Mathew", email: "hr@zagsigns.com", password: await hash("HR@2026"), role: UserRole.HR, branch: null, phone: "9400000008", status: "ACTIVE", isActive: true },
    }),
    prisma.user.upsert({
      where: { email: "admin@zagsigns.com" },
      update: { status: "ACTIVE", isActive: true },
      create: { name: "IT Admin", email: "admin@zagsigns.com", password: await hash("Admin@2026"), role: UserRole.IT_ADMIN, branch: null, phone: "9400000009", status: "ACTIVE", isActive: true },
    }),
  ]);
  console.log(`  ✓ ${users.length} users`);

  const [md, , , arun, vijay] = users;

  // ── Customers ─────────────────────────────────────────────────────────
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { customerNo: "CUST-001" },
      update: {},
      create: { customerNo: "CUST-001", name: "Dr. Ramesh PV", company: "Asha Hospitals", phone: "9447100001", email: "admin@ashahospitals.com", address: "Pattom, Thiruvananthapuram", branch: Branch.TVM, gstNo: "32AABCH1234A1Z5", creditLimit: 500000 },
    }),
    prisma.customer.upsert({
      where: { customerNo: "CUST-002" },
      update: {},
      create: { customerNo: "CUST-002", name: "Suresh Manager", company: "Lulu Hypermarket EKM", phone: "9447100002", email: "procurement@lulumall.com", address: "Edappally, Ernakulam", branch: Branch.EKM, gstNo: "32AABCL5678B1Z3", creditLimit: 1000000 },
    }),
    prisma.customer.upsert({
      where: { customerNo: "CUST-003" },
      update: {},
      create: { customerNo: "CUST-003", name: "Thomas Joseph", company: "Baby Memorial Hospital", phone: "9447100003", email: "purchase@babymemorial.com", address: "KK Road, Kottayam", branch: Branch.KTYM, creditLimit: 300000 },
    }),
    prisma.customer.upsert({
      where: { customerNo: "CUST-004" },
      update: {},
      create: { customerNo: "CUST-004", name: "Salim Rasheed", company: "Al Baraka Exports", phone: "9447100004", email: "info@albaraka.com", address: "SM Street, Kozhikode", branch: Branch.CLT, creditLimit: 250000 },
    }),
    prisma.customer.upsert({
      where: { customerNo: "CUST-005" },
      update: {},
      create: { customerNo: "CUST-005", name: "Anil Kumar", company: "Malabar Gold EKM", phone: "9447100005", email: "purchase@malabargold.com", address: "MG Road, Ernakulam", branch: Branch.EKM, creditLimit: 800000 },
    }),
  ]);
  console.log(`  ✓ ${customers.length} customers`);

  // ── Leads ─────────────────────────────────────────────────────────────
  const leads = await Promise.all([
    prisma.lead.upsert({
      where: { leadNo: "LEAD-001" },
      update: {},
      create: { leadNo: "LEAD-001", name: "Rajesh Menon", company: "Federal Bank HO", phone: "9446200001", email: "rajesh@federalbank.in", branch: Branch.TVM, status: LeadStatus.NEGOTIATION, source: LeadSource.REFERRAL, value: 320000, assignedToId: arun.id, followUpDate: new Date("2026-06-20") },
    }),
    prisma.lead.upsert({
      where: { leadNo: "LEAD-002" },
      update: {},
      create: { leadNo: "LEAD-002", name: "Anitha Nair", company: "Aster Medcity", phone: "9446200002", email: "anitha@astermedcity.com", branch: Branch.EKM, status: LeadStatus.PROPOSAL, source: LeadSource.COLD_CALL, value: 550000, assignedToId: vijay.id, followUpDate: new Date("2026-06-18") },
    }),
    prisma.lead.upsert({
      where: { leadNo: "LEAD-003" },
      update: {},
      create: { leadNo: "LEAD-003", name: "Suresh PV", company: "KSRTC Ernakulam", phone: "9446200003", branch: Branch.EKM, status: LeadStatus.QUALIFIED, source: LeadSource.WALK_IN, value: 1200000, assignedToId: vijay.id },
    }),
    prisma.lead.upsert({
      where: { leadNo: "LEAD-004" },
      update: {},
      create: { leadNo: "LEAD-004", name: "Fathima Beebi", company: "Gold Souk Mall CLT", phone: "9446200004", branch: Branch.CLT, status: LeadStatus.NEW, source: LeadSource.EXHIBITION, value: 480000 },
    }),
    prisma.lead.upsert({
      where: { leadNo: "LEAD-005" },
      update: {},
      create: { leadNo: "LEAD-005", name: "George Abraham", company: "SBI Regional HO TVM", phone: "9446200005", email: "george@sbi.co.in", branch: Branch.TVM, status: LeadStatus.CONTACTED, source: LeadSource.REFERRAL, value: 280000, assignedToId: arun.id },
    }),
    prisma.lead.upsert({
      where: { leadNo: "LEAD-006" },
      update: {},
      create: { leadNo: "LEAD-006", name: "Pradeep Nair", company: "HDFC Bank TVM", phone: "9446200006", branch: Branch.TVM, status: LeadStatus.WON, source: LeadSource.REFERRAL, value: 180000, closedAt: new Date("2026-05-15"), assignedToId: arun.id },
    }),
  ]);
  console.log(`  ✓ ${leads.length} leads`);

  // ── Quotation ─────────────────────────────────────────────────────────
  const quot1 = await prisma.quotation.upsert({
    where: { quotationNo: "QT-2026-001" },
    update: {},
    create: {
      quotationNo: "QT-2026-001",
      status: QuotationStatus.SENT,
      subtotal: 295000,
      tax: 53100,
      discount: 0,
      total: 348100,
      validUntil: new Date("2026-07-15"),
      customerId: customers[0].id,
      leadId: leads[0].id,
      items: {
        create: [
          { description: "ACP Signage Board 10x4 ft — 3M Vinyl Print", qty: 2, unit: "Nos", unitPrice: 45000, total: 90000 },
          { description: "LED Glow Sign Board 8x3 ft — Single Face", qty: 1, unit: "Nos", unitPrice: 85000, total: 85000 },
          { description: "Fabricated Steel Letters 24\" — Painted", qty: 20, unit: "Nos", unitPrice: 6000, total: 120000 },
        ],
      },
    },
  });

  // ── Sales Order ───────────────────────────────────────────────────────
  const so1 = await prisma.salesOrder.upsert({
    where: { orderNo: "SO-2026-001" },
    update: {},
    create: {
      orderNo: "SO-2026-001",
      status: OrderStatus.IN_PRODUCTION,
      totalAmount: 348100,
      paidAmount: 100000,
      deliveryDate: new Date("2026-07-10"),
      customerId: customers[0].id,
      quotationId: quot1.id,
      createdById: arun.id,
    },
  });
  console.log(`  ✓ 1 quotation, 1 sales order`);

  // ── Tasks ─────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.task.upsert({ where: { id: "task-seed-1" }, update: {}, create: { id: "task-seed-1", title: "Follow up: Federal Bank quotation", status: TaskStatus.PENDING, priority: TaskPriority.HIGH, dueDate: new Date("2026-06-18"), assignedToId: arun.id, relatedTo: "LEAD-001", relatedType: "Lead" } }),
    prisma.task.upsert({ where: { id: "task-seed-2" }, update: {}, create: { id: "task-seed-2", title: "Submit KSRTC compliance documents", status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: new Date("2026-06-20"), assignedToId: vijay.id, relatedTo: "LEAD-003", relatedType: "Lead" } }),
    prisma.task.upsert({ where: { id: "task-seed-3" }, update: {}, create: { id: "task-seed-3", title: "Collect payment — Asha Hospitals SO-001", status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, dueDate: new Date("2026-06-25"), assignedToId: arun.id, relatedTo: "SO-2026-001", relatedType: "SalesOrder" } }),
    prisma.task.upsert({ where: { id: "task-seed-4" }, update: {}, create: { id: "task-seed-4", title: "Site survey — Gold Souk Mall CLT", status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, dueDate: new Date("2026-06-19"), relatedTo: "LEAD-004", relatedType: "Lead" } }),
    prisma.task.upsert({ where: { id: "task-seed-5" }, update: {}, create: { id: "task-seed-5", title: "Prepare June MWR for Sales team", status: TaskStatus.PENDING, priority: TaskPriority.LOW, dueDate: new Date("2026-06-30") } }),
  ]);
  console.log(`  ✓ 5 tasks`);

  // ── Complaints ────────────────────────────────────────────────────────
  await Promise.all([
    prisma.complaint.upsert({ where: { complaintNo: "CMP-001" }, update: {}, create: { complaintNo: "CMP-001", subject: "LED signage flickering at entrance", description: "LED board installed 3 months ago is flickering. Needs immediate attention.", status: ComplaintStatus.IN_PROGRESS, priority: ComplaintPriority.HIGH, customerId: customers[4].id, assignedToId: arun.id } }),
    prisma.complaint.upsert({ where: { complaintNo: "CMP-002" }, update: {}, create: { complaintNo: "CMP-002", subject: "Wrong colour — ACP board delivered in white instead of blue", description: "Colour mismatch on the ACP board delivered for canteen area.", status: ComplaintStatus.OPEN, priority: ComplaintPriority.MEDIUM, customerId: customers[0].id } }),
  ]);
  console.log(`  ✓ 2 complaints`);

  // ── Field Visits ──────────────────────────────────────────────────────
  await prisma.fieldVisit.createMany({
    skipDuplicates: true,
    data: [
      { id: "fv-seed-1", date: new Date("2026-06-17"), visitType: VisitType.SALES_CALL, outcome: VisitOutcome.ORDER_EXPECTED, customerName: "Asha Hospitals", location: "Pattom, TVM", startTime: "10:00", endTime: "11:30", geoTagged: true, orderValue: 320000, nextAction: "Send revised quotation by EOD", notes: "Met Dr. Ramesh. Very positive.", employeeId: arun.id },
      { id: "fv-seed-2", date: new Date("2026-06-16"), visitType: VisitType.FOLLOW_UP, outcome: VisitOutcome.POSITIVE, customerName: "Al Baraka Exports", location: "SM Street, CLT", startTime: "11:00", endTime: "12:00", geoTagged: true, nextAction: "Submit final quotation, await PO", notes: "Client approved budget. Expecting PO next week.", employeeId: vijay.id },
    ],
  });
  console.log(`  ✓ 2 field visits`);

  // ── Materials ─────────────────────────────────────────────────────────
  await prisma.material.createMany({
    skipDuplicates: true,
    data: [
      { id: "mat-1", name: "ACP Sheet 4x8 ft", category: "Sheet Material", unit: "Sheet", currentStock: 45, minimumStock: 10, unitCost: 1800, supplier: "Alucobond India" },
      { id: "mat-2", name: "3M Vinyl — White Matte", category: "Vinyl", unit: "Roll", currentStock: 8, minimumStock: 3, unitCost: 4500, supplier: "3M India" },
      { id: "mat-3", name: "LED Strip 5050 — 12V", category: "Electrical", unit: "Meter", currentStock: 200, minimumStock: 50, unitCost: 120, supplier: "Philips India" },
      { id: "mat-4", name: "MS Angle 40x40x4mm", category: "Steel", unit: "kg", currentStock: 350, minimumStock: 100, unitCost: 75, supplier: "SAIL" },
      { id: "mat-5", name: "LED Driver 60W", category: "Electrical", unit: "Nos", currentStock: 15, minimumStock: 5, unitCost: 850, supplier: "Meanwell" },
    ],
  });
  console.log(`  ✓ 5 materials`);

  // ── WWR ───────────────────────────────────────────────────────────────
  await prisma.wWR.upsert({
    where: { id: "wwr-seed-1" },
    update: {},
    create: {
      id: "wwr-seed-1",
      weekFrom: new Date("2026-06-09"),
      weekTo: new Date("2026-06-15"),
      branch: Branch.TVM,
      department: "Sales",
      weeklyTarget: 300000,
      weeklyAchievement: 285000,
      challenges: "2 prospects delayed decisions due to budget approvals.",
      actionPlan: "Will escalate to decision-makers directly next week.",
      approvalStatus: ApprovalStatus.SUBMITTED,
      employeeId: arun.id,
    },
  });

  await prisma.mWR.upsert({
    where: { id: "mwr-seed-1" },
    update: {},
    create: {
      id: "mwr-seed-1",
      month: 5,
      year: 2026,
      branch: Branch.TVM,
      department: "Sales",
      salesTarget: 1200000,
      salesAchievement: 1080000,
      conversionPct: 32,
      collectionPct: 88,
      approvalStatus: ApprovalStatus.MANAGER_APPROVED,
      employeeId: arun.id,
    },
  });
  console.log(`  ✓ 1 WWR, 1 MWR`);

  // ── Notifications for MD ──────────────────────────────────────────────
  await prisma.notification.createMany({
    skipDuplicates: true,
    data: [
      { id: "notif-1", title: "WWR Pending Approval", message: "Arun Kumar has submitted WWR for week ending Jun 15. Action required.", type: "info", userId: md.id, link: "/team-reports" },
      { id: "notif-2", title: "New Lead — High Value", message: "KSRTC Ernakulam (₹12L) assigned to Vijay CRE. Follow up needed.", type: "info", userId: md.id, link: "/leads" },
      { id: "notif-3", title: "Complaint Escalated", message: "LED flickering complaint at Malabar Gold EKM is High priority and unresolved.", type: "warning", userId: md.id, link: "/complaints" },
    ],
  });
  console.log(`  ✓ 3 notifications`);

  // ── Company Settings ──────────────────────────────────────────────────
  await prisma.companySetting.upsert({
    where: { id: "company" },
    update: {},
    create: {
      id: "company",
      name: "Zag Signs",
      tagline: "Excellence in Signage Solutions",
      address: "TC 44/848/5, Sainarayana Building, Edapazhinji Road, Vazhuthakkad, Thiruvananthapuram - 695014, Kerala",
      phone: "+91 98953 73806 / +91 62820 50921",
      email: "zagadvt@gmail.com",
      website: "www.zagsigns.com",
      gstNo: "32ATXPK5181A1ZO",
      panNo: "",
      logoUrl: "https://bprozagcrm.xyz/zagsigns-logo.png",
      bankName: "Dhanlaxmi Bank",
      bankBranch: "Vazhuthakkad",
      accountNo: "003705300009231",
      ifscCode: "DLXB0000231",
      accountType: "Current Account",
      defaultTerms: [
        "Payment due within 15 days of invoice date.",
        "50% advance required to commence production.",
        "Goods once sold will not be taken back.",
        "This is a computer-generated quotation and does not require a signature to be valid.",
        "Price quoted is valid for 30 days from the date of quotation.",
        "Delivery timeline starts from receipt of advance & approved artwork.",
        "Disputes subject to Thiruvananthapuram jurisdiction.",
      ].join("\n"),
      validityDays: 30,
    },
  });
  console.log(`  ✓ company settings`);

  console.log("\n✅ Seed complete. ZAG SIGNS ERP is ready.");
}

main()
  .catch(e => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
