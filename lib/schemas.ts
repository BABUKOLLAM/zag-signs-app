import { z } from "zod";

const phone = z
  .string()
  .min(1, "Phone is required")
  .regex(/^\d{10}$/, "Enter a valid 10-digit phone number")
  .refine((v) => !/^(\d)\1{9}$/.test(v), "Enter a valid phone number");

const emailField = z.string().email("Enter a valid email").or(z.literal(""));

// Rejects blank, whitespace-only, and special-characters-only text (e.g. "@#$%") —
// requires at least one real letter or digit. Also blocks raw HTML/script tags.
const realText = (min: number, label: string) =>
  z.string()
    .min(min, `${label} must be at least ${min} character${min === 1 ? "" : "s"}`)
    .refine((v) => /[a-zA-Z0-9]/.test(v), `${label} must contain valid characters`)
    .refine((v) => !/<[a-z][\s\S]*>/i.test(v), `${label} contains invalid characters`);

const optionalRealText = (label: string) =>
  z.string()
    .refine((v) => !v || /[a-zA-Z0-9]/.test(v), `${label} must contain valid characters`)
    .refine((v) => !/<[a-z][\s\S]*>/i.test(v), `${label} contains invalid characters`)
    .optional();

export const leadSchema = z.object({
  name: realText(2, "Name"),
  company: optionalRealText("Company"),
  phone: phone,
  email: emailField,
  branch: z.string().min(1, "Branch is required"),
  source: z.string().min(1, "Source is required"),
  value: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: optionalRealText("Notes"),
});

export const customerSchema = z.object({
  name: realText(2, "Name"),
  company: realText(2, "Company name"),
  phone: phone,
  email: emailField,
  branch: z.string().min(1, "Branch is required"),
  gstNo: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.string().optional(),
});

export const taskSchema = z.object({
  title: realText(3, "Title"),
  description: optionalRealText("Description"),
  priority: z.string().min(1),
  dueDate: z.string().optional(),
  relatedTo: optionalRealText("Related To"),
});

export const fieldVisitSchema = z.object({
  customerName: realText(2, "Customer name"),
  visitType: z.string().min(1, "Visit type is required"),
  outcome: z.string().min(1, "Outcome is required"),
  date: z.string().min(1, "Date is required"),
  location: optionalRealText("Location"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  orderValue: z.string().optional(),
  nextAction: optionalRealText("Next Action"),
  notes: optionalRealText("Visit Notes"),
}).refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
  message: "End Time must be after Start Time",
  path: ["endTime"],
}).refine((v) => !v.orderValue || Number(v.orderValue) >= 0, {
  message: "Order Value cannot be negative",
  path: ["orderValue"],
});

export const complaintSchema = z.object({
  subject: realText(5, "Subject"),
  description: realText(10, "Description"),
  priority: z.string().min(1, "Priority is required"),
  customerName: optionalRealText("Customer name"),
});

export type FormErrors = Record<string, string>;

export function parseErrors(zodError: z.ZodError): FormErrors {
  const out: FormErrors = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] as string;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
