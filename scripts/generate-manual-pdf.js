#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('🔄 Generating manual PDF...');

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport to A4 dimensions
    await page.setViewport({ width: 1000, height: 1414 });

    // Navigate to the manual page (use localhost during build)
    const url = process.env.MANUAL_URL || 'http://localhost:3000/help/manual';
    console.log(`📄 Loading: ${url}`);

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Wait for content to render
    await page.waitForSelector('[data-manual-content]', { timeout: 10000 });

    // Hide print buttons
    await page.evaluate(() => {
      const noPrint = document.querySelectorAll('.no-print');
      noPrint.forEach(el => el.style.display = 'none');
    });

    // Generate PDF
    const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '12mm',
        right: '12mm',
      },
      printBackground: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    console.log(`✅ PDF generated: ${outputPath}`);
    console.log(`📦 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    process.exit(1);
  }
}

generatePDF();
