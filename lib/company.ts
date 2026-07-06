import { prisma } from "./prisma";

/** Server-side: the configured company name for outbound emails/WhatsApp — falls back to "ZAG SIGNS" if unset. */
export async function getCompanyName(): Promise<string> {
  try {
    const settings = await prisma.companySetting.findUnique({ where: { id: "company" }, select: { name: true } });
    return settings?.name || "ZAG SIGNS";
  } catch {
    return "ZAG SIGNS";
  }
}
