#!/usr/bin/env node
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('🔄 Generating full manual PDF from rendered page...');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    // Navigate to manual page
    const url = 'http://localhost:3000/help/manual';
    console.log(`📄 Loading: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 60000,
      });
    } catch (error) {
      console.warn('⚠️  Navigation timeout, proceeding with partial page...');
    }

    // Wait for content to be ready
    try {
      await page.waitForSelector('[data-manual-content]', { timeout: 10000 });
    } catch (error) {
      console.warn('⚠️  Content selector not found, using full page...');
    }

    // Hide non-printable elements
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
      scale: 1,
    });

    await browser.close();

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`✅ PDF generated successfully!`);
    console.log(`📦 File: ${outputPath}`);
    console.log(`📊 Size: ${fileSize} KB`);
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

generatePDF();
