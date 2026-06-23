import type { ColumnSpec } from "@/lib/import";

// Column specifications for each batch-import target. Shared by the page
// (Import button) and the template download so headers always match the API.

export const CUSTOMER_COLUMNS: ColumnSpec[] = [
  { key: "name",        label: "Name",        required: true,  example: "Rajesh Kumar",        hint: "Contact person / customer name." },
  { key: "company",     label: "Company",     required: true,  example: "Kumar Enterprises",   hint: "Business / firm name." },
  { key: "phone",       label: "Phone",       required: true,  example: "9876543210",          hint: "Used to detect duplicates." },
  { key: "branch",      label: "Branch",      required: true,  example: "TVM",                 hint: "One of TVM, KTYM, EKM, CLT." },
  { key: "email",       label: "Email",       example: "rajesh@kumar.com" },
  { key: "gstNo",       label: "GST No",      example: "32ABCDE1234F1Z5" },
  { key: "address",     label: "Address",     example: "MG Road, Kochi" },
  { key: "creditLimit", label: "Credit Limit", example: "50000", hint: "Number only, no symbols." },
];

export const LEAD_COLUMNS: ColumnSpec[] = [
  { key: "name",    label: "Name",    required: true, example: "Anil Menon",       hint: "Lead / contact name." },
  { key: "phone",   label: "Phone",   required: true, example: "9847012345",       hint: "Used to detect duplicates." },
  { key: "branch",  label: "Branch",  required: true, example: "EKM",              hint: "One of TVM, KTYM, EKM, CLT." },
  { key: "company", label: "Company", example: "Menon Traders" },
  { key: "email",   label: "Email",   example: "anil@menon.com" },
  { key: "source",  label: "Source",  example: "EXHIBITION", hint: "COLD_CALL, REFERRAL, WALK_IN, WEBSITE, SOCIAL_MEDIA, EXHIBITION, OTHER. Defaults to OTHER." },
  { key: "status",  label: "Status",  example: "NEW",        hint: "NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST. Defaults to NEW." },
  { key: "value",   label: "Est. Value", example: "120000", hint: "Expected deal value, number only." },
  { key: "notes",   label: "Notes",   example: "Met at trade expo" },
];

export const MATERIAL_COLUMNS: ColumnSpec[] = [
  { key: "name",         label: "Name",        required: true, example: "ACP Sheet 4mm",   hint: "Material / item name." },
  { key: "category",     label: "Category",    required: true, example: "Raw Material",    hint: "e.g. Raw Material, Hardware, Consumable." },
  { key: "unit",         label: "Unit",        example: "Sheet", hint: "Nos, Sqft, Sheet, Mtr, Kg… Defaults to Nos." },
  { key: "currentStock", label: "Current Stock", example: "120", hint: "Opening quantity on hand." },
  { key: "minimumStock", label: "Minimum Stock", example: "20",  hint: "Reorder threshold." },
  { key: "unitCost",     label: "Unit Cost",   example: "1850", hint: "Cost per unit, number only." },
  { key: "supplier",     label: "Supplier",    example: "Alstone India" },
];

export const EMPLOYEE_COLUMNS: ColumnSpec[] = [
  { key: "name",          label: "Name",          required: true, example: "Sneha Pillai",     hint: "Employee full name." },
  { key: "designation",   label: "Designation",   required: true, example: "Sales Executive",  hint: "Job title." },
  { key: "department",    label: "Department",    required: true, example: "Sales",            hint: "e.g. Sales, Production, Accounts." },
  { key: "branch",        label: "Branch",        required: true, example: "KTYM",             hint: "One of TVM, KTYM, EKM, CLT." },
  { key: "phone",         label: "Phone",         example: "9961012345" },
  { key: "email",         label: "Email",         example: "sneha@zagsigns.com", hint: "Used to detect duplicates." },
  { key: "dateOfJoining", label: "Date of Joining", example: "2024-04-01", hint: "Format YYYY-MM-DD." },
  { key: "salary",        label: "Salary",        example: "28000", hint: "Monthly salary, number only." },
];
