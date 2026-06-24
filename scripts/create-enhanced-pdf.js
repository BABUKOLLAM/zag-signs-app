#!/usr/bin/env node
const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4',
});

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 15;
const maxWidth = pageWidth - (2 * margin);

let yPos = margin;

// Helper function to add text with wrapping
function addText(text, fontSize = 11, bold = false, color = [55, 65, 81]) {
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  doc.setFont('helvetica', bold ? 'bold' : 'normal');
  
  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach(line => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(line, margin, yPos);
    yPos += fontSize === 11 ? 7 : fontSize / 2 + 2;
  });
}

// Cover page
doc.setFontSize(32);
doc.setTextColor(79, 70, 229);
doc.setFont('helvetica', 'bold');
doc.text('ZAG SIGNS ERP', pageWidth / 2, 60, { align: 'center' });

doc.setFontSize(16);
doc.setTextColor(107, 114, 128);
doc.text('User Manual — Complete Guide', pageWidth / 2, 85, { align: 'center' });

yPos = 110;
addText('This manual covers every module of the ZAG SIGNS ERP — from lead capture and quotations to work-order tickets, tax invoices, Tally sync and bulk data import.', 11, false);

yPos += 15;
addText('MODULES INCLUDED:', 12, true, [79, 70, 229]);
yPos += 3;

const modules = [
  '• CRM (Leads & Opportunities) — Track every sales prospect from first contact to conversion',
  '• Customers — Master records with full transaction history',
  '• Quotations — Professional quotations with revisions and branch-wise numbering',
  '• Work Order Tickets & Designer Workflow — Front-office to designer queue system',
  '• Sales Orders & Production — Manage confirmed orders through production to delivery',
  '• Invoices & Tally Integration — Generate tax invoices and sync to Tally with one click',
  '• Inventory Management — Stock catalogue and movement tracking with low-stock alerts',
  '• Collections & Finance — Record payments and track outstanding dues',
  '• HR & Attendance — Employee profiles, daily attendance and leave management',
  '• Field Visits & Team Reports — Log customer visits and file activity reports',
  '• Reports & MIS — Daily, weekly and monthly reports, GST summaries and KPI dashboards',
  '• Admin & User Management — User management, company settings and complete audit trail',
  '• Batch Data Import & Export — Bulk-load data for Customers, Leads, Inventory and Employees',
];

modules.forEach(module => {
  addText(module, 10, false);
  yPos += 1;
});

yPos += 10;
addText('KEY FEATURES:', 12, true, [79, 70, 229]);
yPos += 3;

const features = [
  '✓ Branch-wise numbering and data isolation',
  '✓ Role-based access control (9 different roles)',
  '✓ Real-time sync across all branches',
  '✓ Mobile-friendly (Progressive Web App)',
  '✓ Integrated with Tally XML export',
  '✓ Professional PDF generation for quotations & invoices',
  '✓ Complete audit trail for compliance',
  '✓ Works on desktop, tablet, and mobile',
];

features.forEach(feature => {
  addText(feature, 10, false);
  yPos += 1;
});

yPos += 10;
addText('GETTING STARTED:', 12, true, [79, 70, 229]);
yPos += 3;

addText('1. Open https://bprozagcrm.xyz in any modern browser (Chrome, Firefox, Safari, Edge)', 10);
addText('2. Login with your credentials (credentials provided by your IT Admin)', 10);
addText('3. Navigate using the sidebar menu to access different modules', 10);
addText('4. Use Ctrl+K (Windows) or Cmd+K (Mac) to open global search anytime', 10);
addText('5. Click on the user icon (top-right) to access settings and user preferences', 10);

// Add new page for workflow
doc.addPage();
yPos = margin;

addText('END-TO-END WORKFLOW', 14, true, [79, 70, 229]);
yPos += 8;

addText('The complete business workflow in ZAG SIGNS ERP follows this chain:', 11, false);
yPos += 5;

addText('LEAD → OPPORTUNITY → CUSTOMER → QUOTATION → WORK ORDER → SALES ORDER → INVOICE → TALLY', 11, true, [30, 30, 30]);
yPos += 10;

addText('Each step is connected. Action buttons on every row let you move forward without re-entering data:', 11, false);
yPos += 8;

const workflow = [
  '• On a Lead row: [Opp] creates Opportunity | [Customer] creates Customer | [Quote] creates Quotation',
  '• On an Opportunity row: [Customer] creates Customer | [Quote] creates Quotation',
  '• On a Customer row: [Quote] creates Quotation',
  '• On an approved Quotation: [Ticket] raises Work Order Ticket | [Invoice] creates Tax Invoice',
  '• On an Invoice: [Tally XML] downloads Tally import file | [Mark Paid] updates payment status',
];

workflow.forEach(item => {
  addText(item, 10, false);
  yPos += 1;
});

// Footer
yPos = pageHeight - 20;
doc.setFontSize(9);
doc.setTextColor(156, 163, 175);
doc.text('Version 1.2 | 2026-06-24', margin, yPos);
doc.text('Powered by Team bpro', margin, yPos + 5);
doc.text('Confidential — Internal Use Only', margin, yPos + 10);

// Save
const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
doc.save(outputPath);

const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
console.log(`✅ Enhanced PDF created: ${outputPath}`);
console.log(`📊 Size: ${fileSize} KB`);
