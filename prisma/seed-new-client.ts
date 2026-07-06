// Minimal seed for onboarding a NEW SaaS customer — deliberately does NOT
// run the demo-data-heavy seed.ts (which is full of ZAG-SIGNS-specific fake
// leads/customers/staff). A new client gets only:
//   1. CompanySetting with their real name
//   2. Team bpro's universal admin account (support/oversight access)
// The client's own MD sets up their own real staff from here.
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const companyName = process.env.NEW_CLIENT_NAME;
  const bproPassword = process.env.BPRO_ADMIN_PASSWORD;

  if (!companyName) throw new Error("NEW_CLIENT_NAME env var is required");
  if (!bproPassword) throw new Error("BPRO_ADMIN_PASSWORD env var is required");

  await prisma.companySetting.upsert({
    where: { id: "company" },
    update: { name: companyName },
    create: { id: "company", name: companyName },
  });
  console.log(`  ✓ Company settings: ${companyName}`);

  await prisma.user.upsert({
    where: { email: "tech@bpropms.com" },
    update: { status: "ACTIVE", isActive: true },
    create: {
      name: "Team bpro Admin", email: "tech@bpropms.com",
      password: await bcrypt.hash(bproPassword, 10),
      role: UserRole.IT_ADMIN, branch: null, status: "ACTIVE", isActive: true,
    },
  });
  console.log("  ✓ Team bpro universal admin account");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
