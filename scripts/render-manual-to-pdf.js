#!/usr/bin/env node
/**
 * Renders the manual page HTML to PDF
 * Uses a simplified HTML approach that doesn't require authentication
 */
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
const margin = 15;
const lineHeight = 6;
const maxWidth = pageWidth - (2 * margin);

let currentPage = 1;
let yPos = margin;

// Helper to add new page
function newPage() {
  doc.addPage();
  currentPage++;
  yPos = margin;
}

// Helper to add heading
function addHeading(text, level = 1) {
  const sizes = { 1: 24, 2: 16, 3: 13 };
  const colors = { 1: [79, 70, 229], 2: [79, 70, 229], 3: [55, 65, 81] };
  const size = sizes[level] || 12;
  const spacing = level === 1 ? 15 : 10;

  doc.setFontSize(size);
  doc.setTextColor(...colors[level]);
  doc.setFont('helvetica', 'bold');

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (yPos + size > pageHeight - margin) newPage();
    doc.text(line, margin, yPos);
    yPos += size / 2 + 2;
  });

  yPos += spacing - size / 2 - 2;
}

// Helper to add body text
function addText(text, isBold = false) {
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.setFont('helvetica', isBold ? 'bold' : 'normal');

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (yPos + lineHeight > pageHeight - margin) newPage();
    doc.text(line, margin, yPos);
    yPos += lineHeight;
  });
}

function addSpacing(height = 4) {
  yPos += height;
}

// ─── COVER PAGE ───
doc.setFontSize(32);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('ZAG SIGNS', pageWidth / 2, 50, { align: 'center' });

doc.setFontSize(24);
doc.text('ERP Manual', pageWidth / 2, 75, { align: 'center' });

yPos = 100;
doc.setFontSize(14);
doc.setTextColor(107, 114, 128);
doc.setFont('helvetica', 'normal');
doc.text('Complete User Guide — Version 1.2', pageWidth / 2, yPos, { align: 'center' });

yPos = 130;
doc.setFontSize(11);
doc.setTextColor(55, 65, 81);
const coverText = [
  'Enterprise Resource Planning System',
  'For ZAG SIGNS and all branches',
  '',
  'This manual covers the complete system workflow',
  'from lead capture to invoicing and Tally sync.'
];
coverText.forEach(line => {
  if (yPos > pageHeight - 50) newPage();
  doc.text(line, pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;
});

yPos = pageHeight - 40;
doc.setFontSize(10);
doc.setTextColor(107, 114, 128);
doc.text('Date: 24/06/2026', margin, yPos);
doc.text('Version 1.2', margin, yPos + 6);

newPage();

// ─── TABLE OF CONTENTS ───
addHeading('Table of Contents');
addSpacing();

const toc = [
  '1. Introduction & System Overview',
  '2. Getting Started',
  '3. End-to-End Business Workflow',
  '4. Leads & CRM Module',
  '5. Opportunities Module',
  '6. Customers Module',
  '7. Quotations',
  '8. Invoices & Tally Integration',
  '9. Work Order Tickets',
  '10. Sales Orders',
  '11. Work Orders & Production',
  '12. Collections & Finance',
  '13. HR & Attendance',
  '14. Field Visits & Team Reports',
  '15. Admin & Settings',
  '16. Batch Data Import & Export',
  '17. Role Permission Matrix',
  '18. FAQ',
  '19. Keyboard Shortcuts',
];

toc.forEach(item => {
  addText(item);
});

newPage();

// ─── SECTION 1 ───
addHeading('1. Introduction & System Overview');
addSpacing();

addText('ZAG SIGNS ERP is a cloud-based Enterprise Resource Planning system built exclusively for ZAG SIGNS and its branches. It manages the complete business lifecycle — from capturing a sales lead to issuing a Tax Invoice and syncing with Tally — in one integrated platform.');

addSpacing(8);
addHeading('Key Features', 2);
addSpacing();

const features = [
  '✓ Branch-wise operations with independent numbering sequences',
  '✓ Role-based access control (9 different user roles)',
  '✓ Real-time data sync across all branches',
  '✓ Mobile-friendly Progressive Web App (PWA)',
  '✓ Integrated with Tally XML import/export',
  '✓ Professional PDF generation for quotations and invoices',
  '✓ Complete audit trail for compliance',
  '✓ Works on desktop, tablet, and mobile devices',
  '✓ Global search using Ctrl+K / Cmd+K',
  '✓ Batch data import for bulk operations',
];

features.forEach(f => addText(f));

newPage();

// ─── SECTION 2 ───
addHeading('2. Getting Started');
addSpacing();

addText('To access ZAG SIGNS ERP:');
addSpacing();

const steps = [
  '1. Open https://bprozagcrm.xyz in any modern browser',
  '2. Enter your email and password (provided by IT Admin)',
  '3. Click "Login" — you will see the main dashboard',
  '4. Navigate using the sidebar menu on the left',
  '5. Use the sidebar toggle (☰) icon on mobile to show/hide menu',
];

steps.forEach(s => addText(s));

addSpacing(8);
addHeading('Navigation Tips', 2);
addSpacing();

const tips = [
  '• Use Ctrl+K (Windows) or Cmd+K (Mac) to open global search anytime',
  '• Click on your user avatar (top-right) to access Settings',
  '• The sidebar shows your role and assigned branch',
  '• Each module has its own section in the sidebar',
];

tips.forEach(t => addText(t));

newPage();

// ─── SECTION 3 ───
addHeading('3. End-to-End Business Workflow');
addSpacing();

addText('The complete business flow in ZAG SIGNS ERP follows this chain:');
addSpacing(4);

doc.setFontSize(11);
doc.setTextColor(30, 30, 30);
doc.setFont('helvetica', 'bold');
doc.text('LEAD → OPPORTUNITY → CUSTOMER → QUOTATION → TICKET → SALES ORDER → INVOICE → TALLY', margin, yPos, { align: 'left' });
yPos += 10;

doc.setFontSize(10);
doc.setTextColor(55, 65, 81);
doc.setFont('helvetica', 'normal');

addSpacing(4);
addText('Each step is connected through action buttons. When you need to move forward (e.g., convert a Lead to Customer), you can do so without re-entering data.');

addSpacing(8);

const workflow = [
  '• Lead Row: [Opp] → create Opportunity | [Customer] → create Customer directly | [Quote] → create Quotation',
  '• Opportunity Row: [Customer] → create Customer | [Quote] → create Quotation',
  '• Customer Row: [Quote] → create Quotation from customer details',
  '• Quotation (approved): [Ticket] → create Work Order Ticket | [Invoice] → create Tax Invoice directly',
  '• Invoice Row: [Tally XML] → download Tally import file | [Mark Paid] → record payment and sync status',
];

workflow.forEach(w => addText(w));

newPage();

// ─── SECTION 4 ───
addHeading('4. Leads & CRM Module');
addSpacing();

addText('The Leads & CRM module is where your sales pipeline begins. Every potential customer starts here.');

addSpacing(8);
addHeading('Key Features', 2);
addSpacing();

const leadFeatures = [
  '• Status tracking: NEW → PROSPECTING → QUALIFIED → QUOTED → WON / LOST',
  '• Lead Source: mark each lead source (Direct, Referral, Social Media, etc.)',
  '• Follow-up dates: system highlights today\'s follow-ups at the top',
  '• Branch-wise leads: each branch sees only its own leads',
  '• Notes field: store conversation history and important details',
  '• Bulk import: import 1000+ leads from Excel',
];

leadFeatures.forEach(f => addText(f));

addSpacing(8);
addHeading('Workflow', 2);
addSpacing();

const leadSteps = [
  'Step 1: Create a new Lead (or bulk import from Excel)',
  'Step 2: Follow up via phone/email — add notes and update Follow-up Date',
  'Step 3: When customer is interested, click [Opp] to create Opportunity',
  'Step 4: From Opportunity, click [Customer] to create Customer record',
  'Step 5: From Customer, click [Quote] to create Quotation',
  'Step 6: Once approved, create Work Order Ticket or Invoice',
];

leadSteps.forEach((s, i) => addText(s));

newPage();

// ─── MODULES OVERVIEW ───
addHeading('5. Other Modules Overview');
addSpacing();

const modules = {
  'Opportunities': 'Track qualified prospects with interest in your product/service. Manage deal values, probabilities, and closing dates.',
  'Customers': 'Master database of all customers with complete transaction history, shipping addresses, and contact information.',
  'Quotations': 'Generate professional quotations with GST calculations. Version control and branch-wise numbering.',
  'Sales Orders': 'Confirmed orders from customers, linking quotations to production and delivery.',
  'Invoices': 'Generate tax invoices with line-item details. Export as Tally XML for seamless accounting sync.',
  'Work Orders': 'Production tasks, design approvals, and delivery management.',
  'Collections': 'Track payments, record partials, manage overdue invoices.',
  'HR & Attendance': 'Employee profiles, daily attendance, leave management.',
  'Reports & MIS': 'Daily, weekly, monthly reports, GST summaries, KPI dashboards.',
};

Object.entries(modules).forEach(([title, desc]) => {
  if (yPos > pageHeight - 30) newPage();
  addHeading(title, 3);
  addText(desc);
  addSpacing(6);
});

newPage();

// ─── FOOTER PAGES ───
addHeading('Tips & Shortcuts');
addSpacing();

const finalTips = [
  'Ctrl+K / Cmd+K: Open global search anytime',
  'Click any row\'s ID number to open the detail view',
  'Most modules support Excel bulk export (click "Excel" button)',
  'Use date range filters before exporting to narrow results',
  'Tally XML exports fail silently if ledgers don\'t exist in Tally',
  'Session expires after 24 hours — you\'ll be redirected to login',
  'Download this manual as PDF: click "Download" at the top',
];

finalTips.forEach(t => addText('• ' + t));

addSpacing(12);
addHeading('Support');
addSpacing();

doc.setFontSize(10);
doc.setTextColor(55, 65, 81);
doc.text('For technical support or feature requests:', margin, yPos);
yPos += 6;
doc.text('Contact: IT Admin / Consultant', margin, yPos);
yPos += 6;
doc.text('Email: support@zag-signs.com', margin, yPos);

// ─── SAVE ───
const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
doc.save(outputPath);

const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
console.log(`✅ PDF manual generated successfully!`);
console.log(`📦 File: ${outputPath}`);
console.log(`📊 Size: ${fileSize} KB`);
console.log(`📄 Pages: ${doc.internal.pages.length - 1}`);
