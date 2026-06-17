// Demo login credentials — displayed on the login page for testing all 9 roles.
// These are placeholder credentials only. Replace DEMO_USERS in lib/auth.ts
// with real database lookups in Step 3.

export const DEMO_CREDENTIALS = [
  { role: "MD",               name: "Dr. Babu B",   email: "md@zagsigns.com",       password: "MD@2026",    branch: "All" },
  { role: "AVP",              name: "Rajesh Kumar",  email: "avp@zagsigns.com",      password: "AVP@2026",   branch: "All" },
  { role: "Business Manager", name: "Priya Nair",    email: "bm@zagsigns.com",       password: "BM@2026",    branch: "TVM" },
  { role: "Sales Executive",  name: "Arun Kumar",    email: "sales@zagsigns.com",    password: "Sales@2026", branch: "TVM" },
  { role: "CRES",             name: "Vijay CRE",     email: "cres@zagsigns.com",     password: "CRES@2026",  branch: "EKM" },
  { role: "Production",       name: "Kumar Suresh",  email: "prod@zagsigns.com",     password: "Prod@2026",  branch: "TVM" },
  { role: "Accounts",         name: "Meera Thomas",  email: "accounts@zagsigns.com", password: "Acc@2026",   branch: "TVM" },
  { role: "HR",               name: "Sonia Mathew",  email: "hr@zagsigns.com",       password: "HR@2026",    branch: "All" },
  { role: "IT Admin",         name: "IT Admin",      email: "admin@zagsigns.com",    password: "Admin@2026", branch: "All" },
] as const;
