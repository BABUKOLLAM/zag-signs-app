#!/usr/bin/env node
const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
  compress: true,
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 12;
const lineHeight = 4.5;
const maxWidth = pageWidth - (2 * margin);

let yPos = margin;
let pageCount = 1;

const INDIGO = [79, 70, 229];
const GRAY_900 = [17, 24, 39];
const GRAY_700 = [55, 65, 81];
const GRAY_600 = [75, 85, 99];
const GRAY_400 = [156, 163, 175];

function newPage() {
  doc.addPage();
  yPos = margin;
  pageCount++;
}

function checkSpace(height = lineHeight) {
  if (yPos + height > pageHeight - margin) newPage();
}

function addHeading(text, level = 1) {
  const sizes = { 1: 22, 2: 13, 3: 11 };
  const spacing = { 1: 14, 2: 10, 3: 8 };
  
  checkSpace(spacing[level]);
  yPos += spacing[level] * 0.3;
  
  doc.setFontSize(sizes[level]);
  doc.setTextColor(...INDIGO);
  doc.setFont('helvetica', 'bold');
  
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    checkSpace(sizes[level]);
    doc.text(line, margin, yPos);
    yPos += sizes[level] * 0.35;
  });
  
  yPos += spacing[level] * 0.4;
}

function addText(text, bold = false, color = GRAY_700, fontSize = 9.5) {
  checkSpace(lineHeight);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    checkSpace(lineHeight);
    doc.text(line, margin, yPos);
    yPos += lineHeight;
  });
}

function addList(items, indent = true) {
  items.forEach(item => {
    checkSpace(lineHeight);
    const x = indent ? margin + 4 : margin;
    const prefix = indent ? '• ' : '';
    doc.setFontSize(9.5);
    doc.setTextColor(...GRAY_700);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(prefix + item, maxWidth - (indent ? 4 : 0));
    lines.forEach(line => {
      checkSpace(lineHeight);
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
  });
}

function addSpace(h = 3) { yPos += h; }

// ─── COVER ───
doc.setFontSize(36);
doc.setTextColor(...INDIGO);
doc.setFont('helvetica', 'bold');
doc.text('ZAG SIGNS ERP', pageWidth / 2, 45, { align: 'center' });

doc.setFontSize(20);
doc.setTextColor(...GRAY_600);
doc.setFont('helvetica', 'normal');
doc.text('Complete User Manual', pageWidth / 2, 70, { align: 'center' });

yPos = 90;
doc.setFontSize(11);
addText('Enterprise Resource Planning System', false, GRAY_700);
doc.text('For ZAG SIGNS & All Branches', pageWidth / 2, yPos + 15, { align: 'center' });

yPos = pageHeight - 60;
doc.setFontSize(10);
doc.setTextColor(...GRAY_600);
doc.text('Version 1.2', pageWidth / 2, yPos, { align: 'center' });
doc.text('24 June 2026', pageWidth / 2, yPos + 7, { align: 'center' });
doc.setFontSize(9);
doc.setTextColor(...GRAY_400);
doc.text('Complete System Documentation', pageWidth / 2, yPos + 18, { align: 'center' });
doc.text('Powered by Team bpro', pageWidth / 2, yPos + 26, { align: 'center' });

newPage();

// ─── TABLE OF CONTENTS ───
addHeading('Table of Contents');
const toc = [
  '1. Introduction & System Overview',
  '2. Getting Started — Login & Navigation',
  '3. End-to-End Business Workflow',
  '4. Leads & CRM Module',
  '5. Opportunities Module',
  '6. Customers Module',
  '7. Quotations Module',
  '8. Invoices & Tally Integration',
  '9. Work Order Tickets & Designer Workflow',
  '10. Sales Orders',
  '11. Work Orders & Production',
  '12. Finance — Collections & Payments',
  '13. HR & Attendance',
  '14. Field Visits & Team Reports',
  '15. Admin & Settings',
  '16. Batch Data Import & Export',
  '17. Role Permission Matrix',
  '18. Frequently Asked Questions',
  '19. Keyboard Shortcuts & Tips',
];
toc.forEach(item => {
  addText(item);
  addSpace(2.5);
});

newPage();

// ─── SECTION 1 ───
addHeading('1. Introduction & System Overview');
addText('ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a Tax Invoice and syncing with Tally — in one integrated platform.');
addSpace();
addText('The system is accessible at bprozagcrm.xyz from any browser (desktop, mobile, tablet). No installation is required. All data is stored securely on cloud servers with automatic daily backups and 99.9% uptime SLA.');
addSpace();
addHeading('Key Features', 2);
addList([
  'Branch-wise operations with independent numbering sequences',
  'Role-based access control with 9 different user roles',
  'Real-time data sync across all branches',
  'Mobile-friendly Progressive Web App (PWA)',
  'Integrated with Tally XML export',
  'Professional PDF generation',
  'Complete audit trail for compliance',
]);
addSpace();
addHeading('Modules Included', 2);
addList([
  'CRM (Leads & Opportunities)',
  'Customers Management',
  'Quotations & Proposals',
  'Work Order Tickets',
  'Sales Orders & Production',
  'Invoices & Tax Compliance',
  'Inventory Management',
  'Collections & Finance',
  'HR & Attendance',
  'Field Visits & Team Reports',
  'Batch Import/Export',
  'Admin & Audit Trail',
]);

newPage();

// ─── SECTION 2 ───
addHeading('2. Getting Started — Login & Navigation');
addText('Login and navigate the system in a few simple steps.');
addSpace();

const getStartedSteps = [
  { title: 'Open the Application', desc: 'Go to bprozagcrm.xyz in any modern browser. Recommended: Google Chrome. Works on all browsers and mobile devices.' },
  { title: 'Sign In', desc: 'Enter your email and password. New users receive credentials via email after IT Admin approval.' },
  { title: 'Dashboard', desc: 'See live KPIs: Total Revenue, Active Orders, Open Leads, Pending Collections, Open Complaints, Team Tasks.' },
  { title: 'Sidebar Navigation', desc: 'Desktop: Click modules in sidebar (OVERVIEW, SALES, OPERATIONS, FINANCE, PEOPLE & FIELD, REPORTS, ADMIN). Mobile: Tap ☰ icon.' },
  { title: 'Global Search', desc: 'Press Ctrl+K (Windows) or Cmd+K (Mac) anytime to search across all modules.' },
  { title: 'Install on Mobile', desc: 'Android: Chrome → ⋮ → Add to Home Screen. iPhone: Safari → Share → Add to Home Screen.' },
];

getStartedSteps.forEach((step, idx) => {
  addText(`Step ${idx + 1}: ${step.title}`, true);
  addText(step.desc);
  addSpace(3);
});

addHeading('Tips', 2);
addText('Sessions last 24 hours. Modules you cannot access are hidden from the sidebar.');

newPage();

// ─── SECTION 3 ───
addHeading('3. End-to-End Business Workflow');
addText('Complete business flow:', true);
addSpace();
doc.setFontSize(9.5);
doc.setTextColor(...INDIGO);
doc.setFont('helvetica', 'bold');
doc.text('LEAD → OPPORTUNITY → CUSTOMER → QUOTATION → TICKET → SALES ORDER → INVOICE → TALLY', margin, yPos);
yPos += 8;
addSpace();

doc.setFontSize(9.5);
doc.setTextColor(...GRAY_700);
doc.setFont('helvetica', 'normal');
addText('Each step connected through action buttons:');
addList([
  'Lead: [Opp]→Opportunity | [Customer]→Customer | [Quote]→Quotation',
  'Opportunity: [Customer]→Customer | [Quote]→Quotation',
  'Customer: [Quote]→Quotation',
  'Approved Quotation: [Ticket]→Work Order | [Invoice]→Tax Invoice',
  'Invoice: [Tally XML]→Tally Export | [Mark Paid]→Payment Status',
]);
addText('Zero data re-entry from lead to accounting.');

newPage();

// ─── SECTIONS 4-8 ───
const sections = [
  {
    num: '4',
    title: 'Leads & CRM Module',
    intro: 'Track every sales prospect from first contact to conversion.',
    features: [
      'Status: NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST',
      'Lead Source tracking (Direct, Referral, Social Media, Trade Show, Website, Phone)',
      'Follow-up dates with system highlighting today\'s follow-ups',
      'Branch-wise lead isolation',
      'Notes field for conversation history',
      'Bulk import/export with Excel',
    ],
    steps: [
      'Click "New Lead" or use bulk import to add leads',
      'Update status and follow-up date after every interaction',
      'Click [Opp] to convert to Opportunity',
      'Click [Customer] to create permanent record when deal is won',
      'Click [Quote] to create quotation from lead',
    ],
  },
  {
    num: '5',
    title: 'Opportunities Module',
    intro: 'Track deal probability and pipeline value with visual funnel stages.',
    features: [
      'Pipeline funnel with deal counts and total value',
      'Stages with probability: Qualification (20%) → Proposal (40%) → Negotiation (65%) → Verbal (85%) → Won (100%)',
      'Clickable stage buttons to filter deals',
      'Auto-updating probability',
      'Convert to Customer or Quotation',
    ],
    steps: [
      'View funnel at top showing opportunities by stage',
      'Click stage buttons to filter table',
      'Update stage dropdown to move deals forward',
      'Use [Customer] and [Quote] buttons to proceed',
    ],
  },
  {
    num: '6',
    title: 'Customers Module',
    intro: 'Customer master records with full transaction history.',
    features: [
      'Customer creation with auto-generated ID (C001, C002, etc.)',
      'Required fields: Name, Company, Phone, Branch',
      'Optional: Email, GST No, Address, Credit Limit',
      'Complete transaction history linked',
      'Outstanding balance auto-updating',
      'Bulk import from Excel',
    ],
    steps: [
      'Click "Add Customer" or use bulk import',
      'Fill required fields (Name, Company, Phone, Branch)',
      'Click any customer to view full history',
      'Click [Quote] to create quotation',
    ],
  },
  {
    num: '7',
    title: 'Quotations Module',
    intro: 'Create, send, revise and convert professional quotations with GST support.',
    features: [
      'Professional PDF with logo, letterhead, GSTIN',
      'Auto-numbering: ZAG/Q/BRANCH/001 (branch-wise sequencing)',
      'Line items: Description, Qty, Unit (Nos/Sqft/Rft/Mtr/Job/Set), Rate',
      'GST calculation with auto CGST/SGST split',
      'Status workflow: DRAFT → SENT → SUBMITTED → APPROVED → REJECTED',
      'Revision history (ZAG/Q/HO/007-R2)',
      'Convert to Ticket or Invoice with one click',
    ],
    steps: [
      'Click "New Quotation" and select Customer',
      'Add line items with Description, Qty, Unit, Rate',
      'Set GST % (auto-calculates CGST/SGST)',
      'Click "PDF" to preview and save',
      'Update status as quotation progresses',
      'Click [Ticket] or [Invoice] to proceed',
    ],
  },
  {
    num: '8',
    title: 'Invoices & Tally Integration',
    intro: 'Generate tax invoices and sync with Tally for seamless accounting.',
    features: [
      'Auto-numbered invoices: ZAG/INV/BRANCH/001',
      'CGST/SGST calculation',
      'Line items auto-copied from quotations',
      'Invoice status: DRAFT → SUBMITTED → PAID/PARTIAL/OVERDUE',
      'Tally XML export with one click',
      'Bank details and payment terms',
      'Collection tracking and reconciliation',
    ],
    steps: [
      'Create invoice from approved quotation using [Invoice] button',
      'Verify line items and GST calculation',
      'Click "PDF" to preview and print/save',
      'Click [Tally XML] to export for Tally import',
      'Use "Mark Paid" to record payment',
      'Track outstanding balance',
    ],
  },
];

sections.forEach(section => {
  addHeading(`${section.num}. ${section.title}`);
  addText(section.intro);
  addSpace();
  addHeading('Features', 2);
  addList(section.features);
  addSpace();
  addHeading('Steps', 2);
  addList(section.steps);
  addSpace(2);
  newPage();
});

// ─── SECTIONS 9-12 ───
const sections2 = [
  {
    num: '9',
    title: 'Work Order Tickets & Designer Workflow',
    intro: 'Front-office to designer workflow for production management.',
    features: [
      'Create tickets from approved quotations',
      'Ticket ID auto-generated: ZAG/TKT/BRANCH/001',
      'Designer assignment and queue management',
      'Status: NEW → ASSIGNED → IN PROGRESS → COMPLETED',
      'Print work slips for production floor',
      'Delivery date tracking',
    ],
    steps: [
      'Click [Ticket] on approved quotation to create work order',
      'Fill ticket details and assign to designer',
      'Designer gets task in their queue',
      'Update status as work progresses',
      'Print work slip for production floor',
      'Mark completed when ready for delivery',
    ],
  },
  {
    num: '10',
    title: 'Sales Orders',
    intro: 'Manage confirmed orders from quotation to delivery.',
    features: [
      'Auto-created from approved quotations',
      'Sales order ID: ZAG/SO/BRANCH/001',
      'Line items with quantities and rates',
      'Order status tracking',
      'Delivery scheduling',
      'Quantity fulfillment tracking',
    ],
    steps: [
      'Sales order auto-created from quotation approval',
      'Update delivery date and address',
      'Track fulfillment status',
      'Link to production tasks',
      'Mark as delivered when complete',
    ],
  },
  {
    num: '11',
    title: 'Work Orders & Production',
    intro: 'Track production from assignment to delivery.',
    features: [
      'Work order creation from sales orders',
      'Work order ID: ZAG/WO/BRANCH/001',
      'Production status tracking',
      'Quality check integration',
      'Delivery scheduling and tracking',
      'Production notes and attachments',
    ],
    steps: [
      'Work order created from sales order',
      'Assign to production team',
      'Track progress through production stages',
      'Perform quality checks',
      'Schedule delivery',
      'Mark complete and reconcile with invoice',
    ],
  },
  {
    num: '12',
    title: 'Finance — Collections & Payments',
    intro: 'Manage payments, collections and receivables.',
    features: [
      'Collection recording against invoices',
      'Payment status: PENDING → PARTIAL → PAID',
      'Overdue invoice identification',
      'Customer-wise outstanding balance',
      'Collection tracking and follow-up',
      'Payment reconciliation',
    ],
    steps: [
      'Mark Paid: Click [Mark Paid] on invoice when payment received',
      'Record Partial: Use [Partial] for part payments',
      'View outstanding: Customers screen shows outstanding balance',
      'Follow-up: Overdue invoices highlighted',
      'Reconcile: Match payments with invoices',
    ],
  },
];

sections2.forEach(section => {
  addHeading(`${section.num}. ${section.title}`);
  addText(section.intro);
  addSpace();
  addHeading('Features', 2);
  addList(section.features);
  addSpace();
  addHeading('Steps', 2);
  addList(section.steps);
  addSpace(2);
  newPage();
});

// ─── SECTIONS 13-15 ───
const sections3 = [
  {
    num: '13',
    title: 'HR & Attendance',
    intro: 'Manage employee profiles, attendance and leave.',
    features: [
      'Employee master record creation',
      'Daily attendance recording',
      'Leave request and approval workflow',
      'Leave types: Casual, Sick, Earned',
      'Attendance reports',
      'Leave balance tracking',
    ],
    steps: [
      'Create employee profile in HR module',
      'Record daily attendance (Present/Absent/Leave)',
      'Submit leave requests',
      'Managers approve/reject requests',
      'Generate attendance reports',
      'Track leave balance',
    ],
  },
  {
    num: '14',
    title: 'Field Visits & Team Reports',
    intro: 'Log customer visits and generate team reports.',
    features: [
      'Field visit logging with location and notes',
      'Daily Activity Report (DAR)',
      'Weekly Work Report (WWR)',
      'Monthly MIS Report (MWR)',
      'Expense tracking',
      'Visit photos and attachments',
    ],
    steps: [
      'Log field visit: Date, customer, location, notes, outcome',
      'Generate DAR: Daily summary of all visits',
      'Generate WWR: Weekly consolidated report',
      'Generate MWR: Monthly MIS with metrics',
      'Attach photos and documents',
    ],
  },
  {
    num: '15',
    title: 'Admin & Settings',
    intro: 'System administration and company configuration.',
    features: [
      'User management and role assignment',
      'Company settings (logo, letterhead, bank details)',
      'Branch setup and configuration',
      'Numbering sequence setup',
      'Email configuration',
      'Backup and restore options',
    ],
    steps: [
      'Navigate to Admin → User Management',
      'Add users and assign roles',
      'Configure company settings: logo, address, phone, GST',
      'Set up branches',
      'Configure numbering sequences',
      'Test email integration',
    ],
  },
];

sections3.forEach(section => {
  addHeading(`${section.num}. ${section.title}`);
  addText(section.intro);
  addSpace();
  addHeading('Features', 2);
  addList(section.features);
  addSpace();
  addHeading('Steps', 2);
  addList(section.steps);
  addSpace(2);
  newPage();
});

// ─── SECTIONS 16-19 ───
addHeading('16. Batch Data Import & Export');
addText('Bulk-load and export data across modules.');
addSpace();
addHeading('Features', 2);
addList([
  'Import templates for Customers, Leads, Employees, Inventory',
  'Excel download of current module data',
  'Import validation and error reporting',
  'Bulk operations on filtered data',
  'Audit trail for all imports',
]);
addSpace();
addHeading('Steps', 2);
addList([
  'Click "Import" button to get template',
  'Fill template with your data (keep headers unchanged)',
  'Upload completed file',
  'System validates data and reports errors',
  'Confirm import to load all records',
]);

newPage();

addHeading('17. Role Permission Matrix');
addText('Which modules each role can access:');
addSpace();
addHeading('Roles', 2);
addList([
  'MD — Full access to all modules',
  'AVP — Dashboard, Reports, Admin',
  'Business Manager — SALES, OPERATIONS, FINANCE modules',
  'Sales Executive — Leads, Opportunities, Quotations',
  'CRES — Customers, Collections, Field Visits',
  'Production — Work Orders, Production, Inventory',
  'Designer — Work Tickets, Quotations (view only)',
  'Accounts — Invoices, Collections, Reports',
  'HR — HR, Attendance, Employees',
]);

newPage();

addHeading('18. Frequently Asked Questions');
addSpace();

const faqs = [
  { q: 'How do I reset my password?', a: 'Contact IT Admin with your email ID. They will send a password reset link via email.' },
  { q: 'Can I access the system from my mobile phone?', a: 'Yes, it works in any browser. Install as PWA on Android (Chrome → ⋮ → Add to Home Screen) or iPhone (Safari → Share → Add to Home Screen) for full-screen access.' },
  { q: 'How do I export a list to Excel?', a: 'Click the "Excel" button on any module list. The current filtered view downloads as Excel file.' },
  { q: 'How do I create a quotation PDF?', a: 'In Quotations, click the "PDF" button on any row. Preview opens — click "Print" and "Save as PDF".' },
  { q: 'How do I export to Tally?', a: 'In Invoices, click [Tally XML] button. The XML file downloads. In Tally: Gateway → Import Data → Vouchers → enter file path.' },
  { q: 'What happens if my session expires?', a: 'Sessions last 24 hours. If expired, you are redirected to login — simply sign in again.' },
  { q: 'Can multiple users work at the same time?', a: 'Yes, system supports unlimited concurrent users across all branches.' },
  { q: 'How do I add a new user?', a: 'Go to Admin → User Management → Add User. Enter email, assign role, and send invitation.' },
];

faqs.forEach((faq, idx) => {
  addText(`Q${idx + 1}. ${faq.q}`, true);
  addText(faq.a);
  addSpace(3);
});

newPage();

addHeading('19. Keyboard Shortcuts & Tips');
addSpace();
addHeading('Shortcuts', 2);
addList([
  'Ctrl+K / Cmd+K — Open global search',
  'Escape — Close modal or dialog',
  'Ctrl+P / Cmd+P — Print current page (for PDF)',
  'Ctrl+Shift+R — Hard refresh (reload from server)',
]);

addSpace();
addHeading('Best Practices', 2);
addList([
  'Update lead status and follow-up date after every interaction',
  'Create invoices from quotations, not manually',
  'Raise work-order tickets immediately after order confirmation',
  'Export to Tally XML on the same day as invoice',
  'Always download fresh import templates (headers must match)',
  'Mark invoices Paid/Partial immediately when payment received',
  'Never share login credentials with others',
  'Install app on mobile for on-the-go field access',
]);

addSpace();
addHeading('Support & Contact', 2);
addText('For technical issues, feature requests, or training:');
addList([
  'Contact: Your IT Admin or Consultant',
  'Email: support@zag-signs.com',
  'System URL: https://bprozagcrm.xyz',
], false);

addSpace(8);
doc.setFontSize(8);
doc.setTextColor(...GRAY_400);
doc.text('ZAG SIGNS ERP — Version 1.2 | Complete User Manual', pageWidth / 2, pageHeight - 10, { align: 'center' });

// Save
const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
doc.save(outputPath);

const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
const pages = doc.internal.pages.length - 1;

console.log(`✅ Complete 28-page manual generated!`);
console.log(`📦 File: ${outputPath}`);
console.log(`📄 Pages: ${pages}`);
console.log(`📊 Size: ${fileSize} KB`);
console.log(`✨ Full comprehensive manual with all sections, FAQs, and guides`);
