// Mock data for ZAG SIGNS CRM/ERP

export const branches = ["TVM", "KTYM", "EKM", "CLT"] as const;
export type Branch = typeof branches[number];

export const leadStatuses = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won", "Lost"] as const;
export type LeadStatus = typeof leadStatuses[number];

export const orderStatuses = ["Draft", "Confirmed", "In Production", "Ready", "Installed", "Invoiced", "Collected"] as const;

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  branch: Branch;
  status: LeadStatus;
  source: string;
  value: number;
  assignedTo: string;
  createdAt: string;
  followUpDate: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  branch: Branch;
  gst: string;
  address: string;
  totalOrders: number;
  totalValue: number;
  outstandingAmount: number;
  createdAt: string;
}

export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  branch: Branch;
  items: QuotationItem[];
  total: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  createdAt: string;
  validUntil: string;
  createdBy: string;
}

export interface QuotationItem {
  description: string;
  qty: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface SalesOrder {
  id: string;
  quotationId: string;
  customerId: string;
  customerName: string;
  branch: Branch;
  total: number;
  status: typeof orderStatuses[number];
  deliveryDate: string;
  createdAt: string;
  jobCost: number;
  margin: number;
}

export interface Complaint {
  id: string;
  customerId: string;
  customerName: string;
  branch: Branch;
  type: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  assignedTo: string;
  createdAt: string;
  resolvedAt?: string;
}

// ---- Mock Data ----

export const leads: Lead[] = [
  { id: "L001", name: "Rajan Pillai", company: "Muthoot Finance", phone: "9847123456", email: "rajan@muthoot.com", branch: "TVM", status: "Qualified", source: "Reference", value: 280000, assignedTo: "Arun CRE", createdAt: "2026-06-01", followUpDate: "2026-06-18", notes: "3 branch signage project" },
  { id: "L002", name: "Sathish Kumar", company: "SBT Bank EKM", phone: "9946223344", email: "sathish@sbt.in", branch: "EKM", status: "Proposal", source: "Cold Call", value: 150000, assignedTo: "Meera CRE", createdAt: "2026-06-03", followUpDate: "2026-06-20", notes: "ATM signage" },
  { id: "L003", name: "Thomas George", company: "Lulu Mall Kochi", phone: "9745332211", email: "thomas@lulumall.in", branch: "EKM", status: "Negotiation", source: "Exhibition", value: 850000, assignedTo: "Vijay CRE", createdAt: "2026-06-05", followUpDate: "2026-06-17", notes: "Full branding project" },
  { id: "L004", name: "Asha Nair", company: "Asha Hospitals", phone: "9847556677", email: "asha@ashahospital.com", branch: "TVM", status: "Won", source: "Website", value: 320000, assignedTo: "Arun CRE", createdAt: "2026-05-20", followUpDate: "2026-06-10", notes: "Hospital signage complete" },
  { id: "L005", name: "Binu Varghese", company: "Varghese Builders", phone: "9446778899", email: "binu@vbuilders.com", branch: "KTYM", status: "New", source: "Walk-in", value: 95000, assignedTo: "Renu CRE", createdAt: "2026-06-14", followUpDate: "2026-06-19", notes: "Office branding" },
  { id: "L006", name: "Fathima Beevi", company: "Al Baraka Exports", phone: "9946112233", email: "fathima@albaraka.in", branch: "CLT", status: "Contacted", source: "WhatsApp", value: 175000, assignedTo: "Salman CRE", createdAt: "2026-06-10", followUpDate: "2026-06-21", notes: "Export house signage" },
  { id: "L007", name: "Pradeep Menon", company: "KSFE Office", phone: "9447889900", email: "pradeep@ksfe.gov.in", branch: "KTYM", status: "Lost", source: "Tender", value: 420000, assignedTo: "Renu CRE", createdAt: "2026-05-15", followUpDate: "2026-06-01", notes: "Lost to competitor on price" },
  { id: "L008", name: "Sreeja Devi", company: "Sreeja Jewellery", phone: "9947001122", email: "sreeja@sreejajewels.com", branch: "CLT", status: "Qualified", source: "Reference", value: 260000, assignedTo: "Salman CRE", createdAt: "2026-06-12", followUpDate: "2026-06-22", notes: "3 showroom branding" },
];

export const customers: Customer[] = [
  { id: "C001", name: "Mathew Joseph", company: "Malabar Gold", phone: "9847000111", email: "mathew@malabargold.com", branch: "EKM", gst: "32ABCDE1234F1Z5", address: "MG Road, Ernakulam", totalOrders: 8, totalValue: 1850000, outstandingAmount: 125000, createdAt: "2024-01-15" },
  { id: "C002", name: "Radha Krishna", company: "KSRTC", phone: "9446222333", email: "rk@ksrtc.in", branch: "TVM", gst: "32GOVT12345G1Z1", address: "Thampanoor, Thiruvananthapuram", totalOrders: 12, totalValue: 3200000, outstandingAmount: 0, createdAt: "2023-08-01" },
  { id: "C003", name: "Anwar Rasheed", company: "Rasheed Motors", phone: "9946444555", email: "anwar@rashmotors.com", branch: "CLT", gst: "32RSHMO1234R1Z2", address: "SM Street, Kozhikode", totalOrders: 5, totalValue: 720000, outstandingAmount: 85000, createdAt: "2024-03-20" },
  { id: "C004", name: "Suja Thomas", company: "Baby Memorial Hospital", phone: "9447666777", email: "suja@babymem.com", branch: "KTYM", gst: "32BMMHK5678B1Z3", address: "Kottayam Town", totalOrders: 3, totalValue: 480000, outstandingAmount: 48000, createdAt: "2025-01-10" },
  { id: "C005", name: "Vineeth Raj", company: "Vineeth Supermarket", phone: "9847888999", email: "vineeth@vsuper.com", branch: "TVM", gst: "32VSPMK4321V1Z4", address: "Kazhakootam, TVM", totalOrders: 6, totalValue: 920000, outstandingAmount: 0, createdAt: "2024-06-05" },
];

export const quotations: Quotation[] = [
  {
    id: "Q2026-001", customerId: "C001", customerName: "Malabar Gold", branch: "EKM",
    items: [
      { description: "ACP Cladding Signage 10x4ft", qty: 2, unit: "Nos", rate: 18500, amount: 37000 },
      { description: "LED Backlit Flex 8x3ft", qty: 5, unit: "Nos", rate: 4200, amount: 21000 },
      { description: "Fabrication & Installation", qty: 1, unit: "Job", rate: 15000, amount: 15000 },
    ],
    total: 73000, status: "Approved", createdAt: "2026-06-01", validUntil: "2026-06-30", createdBy: "Vijay CRE"
  },
  {
    id: "Q2026-002", customerId: "C003", customerName: "Rasheed Motors", branch: "CLT",
    items: [
      { description: "Vinyl Wrap Lettering", qty: 10, unit: "Sqft", rate: 350, amount: 3500 },
      { description: "Hoarding 20x10ft", qty: 1, unit: "Nos", rate: 45000, amount: 45000 },
    ],
    total: 48500, status: "Sent", createdAt: "2026-06-08", validUntil: "2026-07-08", createdBy: "Salman CRE"
  },
  {
    id: "Q2026-003", customerId: "C004", customerName: "Baby Memorial Hospital", branch: "KTYM",
    items: [
      { description: "Directory Signage Board", qty: 3, unit: "Nos", rate: 12000, amount: 36000 },
      { description: "Room Number Plates", qty: 80, unit: "Nos", rate: 450, amount: 36000 },
      { description: "Wayfinding Signage Set", qty: 1, unit: "Set", rate: 28000, amount: 28000 },
    ],
    total: 100000, status: "Draft", createdAt: "2026-06-14", validUntil: "2026-07-14", createdBy: "Renu CRE"
  },
];

export const salesOrders: SalesOrder[] = [
  { id: "SO2026-001", quotationId: "Q2026-001", customerId: "C001", customerName: "Malabar Gold", branch: "EKM", total: 73000, status: "In Production", deliveryDate: "2026-06-25", createdAt: "2026-06-03", jobCost: 52000, margin: 28.8 },
  { id: "SO2026-002", quotationId: "Q2025-048", customerId: "C002", customerName: "KSRTC", branch: "TVM", total: 185000, status: "Installed", deliveryDate: "2026-06-10", createdAt: "2026-05-28", jobCost: 128000, margin: 30.8 },
  { id: "SO2026-003", quotationId: "Q2025-051", customerId: "C005", customerName: "Vineeth Supermarket", branch: "TVM", total: 94000, status: "Invoiced", deliveryDate: "2026-06-12", createdAt: "2026-06-01", jobCost: 66000, margin: 29.8 },
];

export const complaints: Complaint[] = [
  { id: "CMP001", customerId: "C001", customerName: "Malabar Gold", branch: "EKM", type: "Installation", description: "LED not working after 2 weeks", status: "In Progress", priority: "High", assignedTo: "Installation Team", createdAt: "2026-06-10" },
  { id: "CMP002", customerId: "C002", customerName: "KSRTC", branch: "TVM", type: "Quality", description: "Vinyl peeling off", status: "Resolved", priority: "Medium", assignedTo: "Production Team", createdAt: "2026-06-05", resolvedAt: "2026-06-12" },
  { id: "CMP003", customerId: "C005", customerName: "Vineeth Supermarket", branch: "TVM", type: "Warranty", description: "Frame bent after delivery", status: "Open", priority: "Low", assignedTo: "Arun CRE", createdAt: "2026-06-14" },
];

export const dashboardStats = {
  totalLeads: 48,
  newLeadsThisMonth: 12,
  pipelineValue: 4850000,
  ordersThisMonth: 18,
  revenueThisMonth: 2340000,
  collectionTarget: 1800000,
  collectionAchieved: 1425000,
  openComplaints: 5,
  branchPerformance: [
    { branch: "TVM", revenue: 920000, orders: 7, leads: 14 },
    { branch: "EKM", revenue: 780000, orders: 5, leads: 18 },
    { branch: "KTYM", revenue: 340000, orders: 3, leads: 8 },
    { branch: "CLT", revenue: 300000, orders: 3, leads: 8 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 1850000, target: 2000000 },
    { month: "Feb", revenue: 2100000, target: 2000000 },
    { month: "Mar", revenue: 1750000, target: 2200000 },
    { month: "Apr", revenue: 2400000, target: 2200000 },
    { month: "May", revenue: 2150000, target: 2300000 },
    { month: "Jun", revenue: 2340000, target: 2500000 },
  ],
  leadFunnel: [
    { stage: "New", count: 12, value: 1200000 },
    { stage: "Contacted", count: 8, value: 980000 },
    { stage: "Qualified", count: 10, value: 1850000 },
    { stage: "Proposal", count: 7, value: 1420000 },
    { stage: "Negotiation", count: 5, value: 980000 },
    { stage: "Won", count: 4, value: 780000 },
  ],
};
