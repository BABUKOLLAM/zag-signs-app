#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function generatePDF() {
  console.log('🔄 Generating full manual PDF from public HTML endpoint...');

  let browser;
  try {
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    if (!fs.existsSync(executablePath)) {
      console.error('❌ Chrome not found. Please install Google Chrome.');
      process.exit(1);
    }

    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1600 });

    const url = 'http://localhost:3000/api/manual/html';
    console.log(`📄 Loading: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });
    } catch (error) {
      console.warn('⚠️  Navigation timeout, proceeding...');
    }

    await sleep(2000);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      path: null,
      format: 'A4',
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
      },
      printBackground: true,
      displayHeaderFooter: false,
      scale: 1,
    });

    await browser.close();

    // Save to public folder
    const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`📦 File: ${outputPath}`);
    console.log(`📊 Size: ${fileSize} KB`);
    console.log('✨ PDF now captures the exact print view of the manual');
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

generatePDF();
