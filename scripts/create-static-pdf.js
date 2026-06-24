#!/usr/bin/env node
const { jsPDF } = require('jspdf');
const path = require('path');
const fs = require('fs');

console.log('📄 Creating static PDF...');

try {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set font
  pdf.setFont('Arial', 'normal');
  pdf.setFontSize(11);
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - (2 * margin);

  let yPosition = margin;

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(79, 70, 229); // Indigo color
  pdf.text('ZAG SIGNS ERP', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 10;
  pdf.setFontSize(14);
  pdf.text('User Manual — Complete Guide', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 20;
  pdf.setFontSize(11);
  pdf.setTextColor(55, 65, 81);

  // Content
  const content = `
This manual covers every module of the ZAG SIGNS ERP — from lead capture and quotations to work-order tickets, tax invoices, Tally sync and bulk data import.

MODULES INCLUDED:
• CRM (Leads & Opportunities)
• Customers
• Quotations (with GST support)
• Work Order Tickets & Designer Workflow
• Sales Orders & Production
• Invoices & Tally Integration
• Inventory Management
• Collections & Finance
• HR & Attendance
• Field Visits & Team Reports
• Reports & MIS
• Admin & User Management
• Batch Data Import/Export

KEY FEATURES:
✓ Branch-wise numbering and data
✓ Role-based access (9 roles)
✓ Real-time sync across all branches
✓ Mobile-friendly (PWA)
✓ Integrated with Tally XML export
✓ Professional PDF generation
✓ Complete audit trail

GETTING STARTED:
1. Open https://bprozagcrm.xyz in any modern browser
2. Login with your credentials
3. Navigate using the sidebar menu
4. Use Ctrl+K (or Cmd+K on Mac) for global search

For detailed module documentation, visit the help page within the application.

Version 1.2 | 2026-06-24
Powered by Team bpro
Confidential — Internal Use Only
  `.trim();

  const lines = pdf.splitTextToSize(content, maxWidth);

  lines.forEach(line => {
    if (yPosition > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
    }
    pdf.text(line, margin, yPosition);
    yPosition += 6;
  });

  // Save to public folder
  const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
  pdf.save(outputPath);

  console.log(`✅ PDF created: ${outputPath}`);
  const fileSize = fs.statSync(outputPath).size / 1024;
  console.log(`📦 File size: ${fileSize.toFixed(2)} KB`);
} catch (error) {
  console.error('❌ PDF creation failed:', error.message);
  process.exit(1);
}
