#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  console.log('🔄 Generating manual PDF from rendered page...');

  let browser;
  try {
    // Use system Chrome on macOS
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    if (!fs.existsSync(executablePath)) {
      console.error('❌ Chrome not found at:', executablePath);
      console.error('Please install Google Chrome or update the path');
      process.exit(1);
    }

    // Launch browser with system Chrome
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

    // Navigate to manual page
    const url = 'http://localhost:3000/help/manual';
    console.log(`📄 Loading: ${url}`);

    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
    } catch (error) {
      console.warn('⚠️  Navigation timeout, proceeding with partial page...');
    }

    // Wait for main content to load
    try {
      await page.waitForSelector('main', { timeout: 5000 });
    } catch (error) {
      console.warn('⚠️  Main content selector not found, proceeding...');
    }

    // Hide header and footer for print
    await page.evaluate(() => {
      const noprint = document.querySelectorAll('[class*="no-print"]');
      noprint.forEach(el => el.style.display = 'none');
    });

    // Generate PDF with print-exact settings
    const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');

    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
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
    console.log('✨ PDF now matches the exact visual appearance of the manual page');
  } catch (error) {
    console.error('❌ PDF generation failed:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

generatePDF();
