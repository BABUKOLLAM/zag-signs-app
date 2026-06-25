import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>ZAG SIGNS Manual</title>
<style>body{font-family:system-ui;background:#fff;margin:0;padding:0}
.manual{max-width:100%;padding:40px;background:#fff}
h1{color:#4F46E5;font-size:2.5em;margin:30px 0;border-bottom:3px solid #4F46E5;padding:20px 0}
h2{color:#4F46E5;font-size:1.5em;margin:20px 0 10px}
h3{color:#333;font-size:1.1em;margin:15px 0}
p{color:#555;line-height:1.6;margin:10px 0}
ul,ol{margin:10px 0;padding-left:20px}
li{color:#555;margin:8px 0}
.step{background:#f9f9f9;padding:15px;margin:15px 0;border-left:4px solid #4F46E5}
.step strong{color:#333}
.tip{background:#d4edda;padding:12px;margin:10px 0;border-left:4px solid #28a745}
.warning{background:#fff3cd;padding:12px;margin:10px 0;border-left:4px solid #ffc107}
.page-break{page-break-before:always;margin:40px 0;clear:both}
@media print{body{margin:0;padding:0}.manual{padding:40px;margin:0}h1,h2,h3{page-break-after:avoid}.page-break{margin:20px 0}}
</style></head><body><div class="manual">

<h1 style="text-align:center;border:none;margin:60px 0">ZAG SIGNS ERP</h1>
<h2 style="text-align:center;color:#6B7280;border:none">Complete User Manual</h2>
<p style="text-align:center;margin:40px 0;font-size:1.1em">Version 1.2 • 24 June 2026</p>

<div class="page-break"></div>
<h1>Table of Contents</h1>
<ol><li>Introduction & System Overview</li><li>Getting Started</li><li>End-to-End Workflow</li><li>Leads & CRM</li><li>Opportunities</li><li>Customers</li><li>Quotations</li><li>Invoices & Tally</li><li>Work Order Tickets</li><li>Sales Orders</li><li>Work Orders & Production</li><li>Finance & Collections</li><li>HR & Attendance</li><li>Field Visits & Reports</li><li>Admin & Settings</li><li>Batch Import/Export</li><li>Role Permissions</li><li>FAQ</li><li>Keyboard Shortcuts</li></ol>

<div class="page-break"></div>
<h1>1. Introduction & System Overview</h1>
<p>ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system designed for ZAG SIGNS and all branches.</p>
<h2>Key Highlights</h2>
<ul><li>Cloud-based—no installation required</li><li>Accessible from any browser on desktop, tablet, mobile</li><li>Real-time sync across all branches</li><li>Automatic daily backups with 99.9% uptime</li><li>Progressive Web App (PWA) for mobile</li><li>Complete audit trail</li><li>Role-based access (9 roles)</li></ul>

<div class="page-break"></div>
<h1>2. Getting Started</h1>
<h2>Login & Navigation</h2>
<div class="step"><strong>Step 1: Open App</strong><p>Go to https://bprozagcrm.xyz in any browser</p></div>
<div class="step"><strong>Step 2: Sign In</strong><p>Enter email and password provided by IT Admin</p></div>
<div class="step"><strong>Step 3: Dashboard</strong><p>View live KPIs: Revenue, Orders, Leads, Collections, Tasks</p></div>
<div class="step"><strong>Step 4: Navigate</strong><p>Desktop: Use sidebar (SALES, OPERATIONS, FINANCE, etc.) | Mobile: Tap ☰ menu</p></div>
<div class="step"><strong>Step 5: Search</strong><p>Press Ctrl+K (Windows) or Cmd+K (Mac) for global search</p></div>
<div class="step"><strong>Step 6: Mobile App</strong><p>Android: Chrome→⋮→"Add to Home Screen" | iPhone: Safari→Share→"Add to Home Screen"</p></div>

<div class="page-break"></div>
<h1>3. End-to-End Business Workflow</h1>
<p style="text-align:center;font-weight:bold;color:#4F46E5;font-size:1.2em">LEAD → OPPORTUNITY → CUSTOMER → QUOTATION → TICKET → SALES ORDER → INVOICE → TALLY</p>
<p>Each step connected through one-click buttons with auto-populated data.</p>
<h2>Key Connections</h2>
<ul><li><strong>Lead:</strong> [Opp]→Opportunity | [Customer]→Customer | [Quote]→Quotation</li><li><strong>Opportunity:</strong> [Customer]→Customer | [Quote]→Quotation</li><li><strong>Customer:</strong> [Quote]→Quotation</li><li><strong>Quotation (approved):</strong> [Ticket]→Work Order | [Invoice]→Tax Invoice</li><li><strong>Invoice:</strong> [Tally XML]→Tally Export | [Mark Paid]→Payment Status</li></ul>

<div class="page-break"></div>
<h1>4. Leads & CRM Module</h1>
<p>Track prospects from first contact to customer conversion.</p>
<h2>Features</h2>
<ul><li>Status: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST</li><li>Lead Source tracking (Direct, Referral, Social, Trade Show, Website, LinkedIn, Phone)</li><li>Follow-up dates with highlighting of today's follow-ups</li><li>Branch-wise lead isolation</li><li>Communication history and notes</li><li>Estimated value tracking</li><li>Bulk import/export via Excel</li><li>Advanced filtering and search</li></ul>
<h2>Workflow</h2>
<div class="step"><strong>1. Create Lead</strong><p>Click "New Lead" | Required: Name, Phone, Branch | Optional: Company, Email, Source, Value, Follow-up</p></div>
<div class="step"><strong>2. Update Status</strong><p>Progress through: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON</p></div>
<div class="step"><strong>3. Set Follow-up</strong><p>Schedule next action. Today's follow-ups appear highlighted at top</p></div>
<div class="step"><strong>4. Convert to Opportunity</strong><p>Click [Opp] when prospect shows interest</p></div>
<div class="step"><strong>5. Convert to Customer</strong><p>Click [Customer] when deal is won to create permanent record</p></div>
<div class="step"><strong>6. Create Quotation</strong><p>Click [Quote] to generate professional quotation from lead details</p></div>

<div class="page-break"></div>
<h1>5. Opportunities Module</h1>
<p>Track deals with visual pipeline funnel and probability management.</p>
<h2>Features</h2>
<ul><li>Pipeline funnel at top showing deals by stage and value</li><li>Stages: Qualification (20%) → Proposal (40%) → Negotiation (65%) → Verbal (85%) → Won (100%)</li><li>Clickable stage buttons to filter</li><li>Auto-updating probability</li><li>Expected close date tracking</li></ul>

<div class="page-break"></div>
<h1>6. Customers Module</h1>
<p>Master customer database with complete transaction history.</p>
<h2>Features</h2>
<ul><li>Auto-generated ID (C001, C002, etc.)</li><li>Required: Name, Company, Phone, Branch</li><li>Optional: Email, GST No, Address, Credit Limit</li><li>Complete transaction history linked</li><li>Auto-updating outstanding balance</li><li>Bulk import/export</li></ul>

<div class="page-break"></div>
<h1>7. Quotations Module</h1>
<p>Professional quotations with GST, revisions, and one-click conversion.</p>
<h2>Features</h2>
<ul><li>Auto-numbered: ZAG/Q/BRANCH/001 (branch-wise, never resets)</li><li>Professional PDF with logo, letterhead, GSTIN</li><li>Line items: Description, Qty, Unit, Rate</li><li>GST auto-split into CGST/SGST</li><li>Status: DRAFT → SENT → SUBMITTED → APPROVED → REJECTED</li><li>Revision history (R1, R2, etc.)</li><li>Valid Until date with auto-expiration</li><li>[PDF] [Revise] [Ticket] [Invoice] buttons</li></ul>
<h2>Workflow</h2>
<div class="step"><strong>1. Create</strong><p>Click "New Quotation" → Select Customer → Add line items</p></div>
<div class="step"><strong>2. Calculate</strong><p>Enter GST % → System auto-splits as CGST/SGST</p></div>
<div class="step"><strong>3. Preview PDF</strong><p>Click "PDF" to preview professional quotation</p></div>
<div class="step"><strong>4. Update Status</strong><p>Change status as quotation progresses (SENT, SUBMITTED, APPROVED)</p></div>
<div class="step"><strong>5. Revise if Needed</strong><p>Use "Revise" for modifications → Creates new quote with -R1, -R2, etc.</p></div>
<div class="step"><strong>6. Convert</strong><p>Click [Ticket] for Work Order or [Invoice] for Tax Invoice (auto-copies items)</p></div>

<div class="page-break"></div>
<h1>8. Invoices & Tally Integration</h1>
<p>Tax invoices with automatic Tally sync.</p>
<h2>Features</h2>
<ul><li>Auto-numbered: ZAG/INV/BRANCH/001</li><li>CGST/SGST with HSN/SAC codes</li><li>Items auto-copied from quotations</li><li>Status: DRAFT → SUBMITTED → PAID/PARTIAL/OVERDUE</li><li>Tally XML export with one click</li><li>Bank details and payment instructions</li><li>Collection status tracking</li></ul>
<h2>Workflow</h2>
<div class="step"><strong>1. Create from Quotation</strong><p>Click [Invoice] on approved quotation</p></div>
<div class="step"><strong>2. Verify Details</strong><p>Confirm customer, items, GST, totals</p></div>
<div class="step"><strong>3. Save as PDF</strong><p>Click "PDF" → Preview → Print → Save as PDF</p></div>
<div class="step"><strong>4. Export to Tally</strong><p>Click [Tally XML] → Download .xml file</p></div>
<div class="step"><strong>5. Import in Tally</strong><p>In TallyPrime: Gateway → Import Data → Vouchers → Select XML file → Enter</p></div>
<div class="step"><strong>6. Record Payment</strong><p>Click [Mark Paid] when payment received → Outstanding balance updates</p></div>

<div class="page-break"></div>
<h1>9. Work Order Tickets & Designer Workflow</h1>
<p>Front-office to designer workflow for production.</p>
<h2>Features</h2>
<ul><li>Ticket ID: ZAG/TKT/BRANCH/001</li><li>Designer assignment and queue</li><li>Status: NEW → ASSIGNED → IN PROGRESS → COMPLETED</li><li>Printable work slip for floor</li><li>Item details with specifications</li><li>Delivery date and address tracking</li></ul>

<div class="page-break"></div>
<h1>10. Sales Orders</h1>
<p>Confirmed orders from quotation to delivery.</p>
<h2>Features</h2>
<ul><li>Order ID: ZAG/SO/BRANCH/001</li><li>Auto-created from approved quotations</li><li>Line items with quantities and rates</li><li>Status: DRAFT → CONFIRMED → PARTIAL → FULFILLED</li><li>Delivery address and date</li><li>Order value tracking</li></ul>

<div class="page-break"></div>
<h1>11. Work Orders & Production</h1>
<p>Production from assignment to completion.</p>
<h2>Features</h2>
<ul><li>Work Order ID: ZAG/WO/BRANCH/001</li><li>Production status tracking</li><li>Quality check integration</li><li>Daily production logs</li><li>Delivery scheduling</li></ul>

<div class="page-break"></div>
<h1>12. Finance — Collections & Payments</h1>
<p>Payment tracking and receivables management.</p>
<h2>Features</h2>
<ul><li>Record payments against invoices</li><li>Payment modes: Cash, Cheque, NEFT, UPI, Bank Transfer</li><li>Invoice status: PENDING → PARTIAL → PAID → OVERDUE</li><li>Customer outstanding balance tracking</li><li>Collection summary by mode and date range</li></ul>

<div class="page-break"></div>
<h1>13. HR & Attendance</h1>
<p>Employee profiles and attendance tracking.</p>
<h2>Features</h2>
<ul><li>Employee master records</li><li>Daily attendance (Present/Absent/Half Day/Leave)</li><li>Leave request and approval workflow</li><li>Leave types: Casual, Sick, Earned</li><li>Attendance reports and analytics</li></ul>

<div class="page-break"></div>
<h1>14. Field Visits & Team Reports</h1>
<p>Customer visits and activity reports.</p>
<h2>Reports</h2>
<ul><li>Field Visit logs with location, time, outcome</li><li>Daily Activity Report (DAR)</li><li>Weekly Work Report (WWR)</li><li>Monthly MIS Report (MWR)</li><li>Expense tracking</li></ul>

<div class="page-break"></div>
<h1>15. Admin & Settings</h1>
<p>System administration and configuration.</p>
<h2>Admin Tasks</h2>
<ul><li>User management and role assignment</li><li>Company settings (logo, address, bank details)</li><li>Branch configuration</li><li>Numbering sequence setup</li><li>Backup and restore</li></ul>

<div class="page-break"></div>
<h1>16. Batch Data Import & Export</h1>
<p>Bulk-load data into system.</p>
<h2>Supported</h2>
<ul><li>Customers import/export</li><li>Leads import/export</li><li>Employees import/export</li><li>Inventory items import/export</li><li>Export any module data as Excel</li></ul>

<div class="page-break"></div>
<h1>17. Role Permission Matrix</h1>
<p>Module access by user role:</p>
<ul><li><strong>MD</strong> — Full access to all modules</li><li><strong>AVP</strong> — Dashboard, Reports, Admin</li><li><strong>Business Manager</strong> — SALES, OPERATIONS, FINANCE</li><li><strong>Sales Executive</strong> — Leads, Opportunities, Quotations</li><li><strong>CRES</strong> — Customers, Collections, Field Visits</li><li><strong>Production</strong> — Work Orders, Production, Inventory</li><li><strong>Designer</strong> — Work Tickets, Quotations (read-only)</li><li><strong>Accounts</strong> — Invoices, Collections, Reports</li><li><strong>HR</strong> — HR, Attendance, Employees</li></ul>

<div class="page-break"></div>
<h1>18. Frequently Asked Questions</h1>
<h2>Q1: How do I reset my password?</h2>
<p>Contact IT Admin with your email ID. They will send a password reset link via email.</p>

<h2>Q2: Can I access from mobile?</h2>
<p>Yes, use any browser. Install as PWA: Android (Chrome→⋮→"Add to Home Screen") or iPhone (Safari→Share→"Add to Home Screen").</p>

<h2>Q3: How do I export lists to Excel?</h2>
<p>Click "Excel" button on any list to export the filtered view as Excel file.</p>

<h2>Q4: How do I create quotation PDF?</h2>
<p>In Quotations, click "PDF" on the row. Preview opens. Click Print and Save as PDF.</p>

<h2>Q5: How do I export to Tally?</h2>
<p>In Invoices, click [Tally XML]. Download the XML file. In Tally: Gateway→Import Data→Vouchers→select file→Enter.</p>

<h2>Q6: What if my session expires?</h2>
<p>Sessions last 24 hours. If expired, simply sign in again.</p>

<h2>Q7: Can multiple users work simultaneously?</h2>
<p>Yes, system supports unlimited concurrent users with real-time sync.</p>

<h2>Q8: How do I add a new user?</h2>
<p>Go to Admin→User Management→Add User. Enter email, assign role, send invitation.</p>

<h2>Q9: How do I bulk import customers?</h2>
<p>Go to Customers→"Import". Download template, fill your data, upload file. System validates and imports.</p>

<h2>Q10: How do I track outstanding payments?</h2>
<p>In Customers, Outstanding Balance column shows dues. Go to Collections to record payments.</p>

<div class="page-break"></div>
<h1>19. Keyboard Shortcuts & Tips</h1>
<h2>Shortcuts</h2>
<ul><li><strong>Ctrl+K / Cmd+K</strong> — Global search (across all modules)</li><li><strong>Escape</strong> — Close modal, dialog, or search</li><li><strong>Ctrl+P / Cmd+P</strong> — Print page (for PDF in Quotations/Invoices)</li><li><strong>Ctrl+Shift+R / Cmd+Shift+R</strong> — Hard refresh (reload latest data)</li></ul>

<h2>Best Practices</h2>
<ul><li>Always update Lead status and Follow-up Date after every interaction</li><li>Create Invoices from Quotations (using [Invoice] button), not manually</li><li>Raise Work Order Tickets immediately after order confirmation</li><li>Export to Tally XML on the same day as invoicing</li><li>Download fresh import templates before bulk importing — keep headers unchanged</li><li>Record Payments (Mark Paid/Partial) immediately when payment received</li><li>Never share login credentials — contact IT Admin for issues</li><li>Install app on mobile (Add to Home Screen) for on-the-go field access</li><li>Use Global Search (Ctrl+K) to quickly find customers, invoices, quotations</li><li>Filter data before exporting to Excel to reduce file size</li></ul>

<div style="text-align:center;margin-top:80px;padding-top:20px;border-top:1px solid #ddd;color:#999;font-size:0.9em">
<p>ZAG SIGNS ERP — Complete User Manual — Version 1.2</p>
<p>© 2026 All Rights Reserved</p>
<p>For support, contact your IT Admin or Consultant</p>
</div>

</div></body></html>`;

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
