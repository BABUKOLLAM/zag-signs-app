import { z } from "zod";

const phone = z
  .string()
  .min(1, "Phone is required")
  .regex(/^[0-9+\-\s().]{7,}$/, "Enter a valid phone number");

const emailField = z.string().email("Enter a valid email").or(z.literal(""));

export const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().optional(),
  phone: phone,
  email: emailField,
  branch: z.string().min(1, "Branch is required"),
  source: z.string().min(1, "Source is required"),
  value: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name is required"),
  phone: phone,
  email: emailField,
  branch: z.string().min(1, "Branch is required"),
  gstNo: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  priority: z.string().min(1),
  dueDate: z.string().optional(),
  relatedTo: z.string().optional(),
});

export const fieldVisitSchema = z.object({
  customerName: z.string().min(2, "Customer name is required"),
  visitType: z.string().min(1, "Visit type is required"),
  outcome: z.string().min(1, "Outcome is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  orderValue: z.string().optional(),
  nextAction: z.string().optional(),
  notes: z.string().optional(),
});

export const complaintSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  description: z.string().min(10, "Please provide more detail (min 10 characters)"),
  priority: z.string().min(1, "Priority is required"),
  customerName: z.string().optional(),
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
