#!/usr/bin/env node
const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function capturePDF() {
  console.log('🔄 Capturing manual as PDF...');
  
  let browser;
  try {
    const executablePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    
    if (!fs.existsSync(executablePath)) {
      console.error('❌ Chrome not found');
      process.exit(1);
    }

    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600 });

    const url = 'http://localhost:3000/api/manual/exporthtml';
    console.log(`📄 Loading: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Capture as PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
      printBackground: true,
    });

    await browser.close();

    // Save
    const outputPath = path.join(__dirname, '../public/ZAG-SIGNS-ERP-Manual-v1.2.pdf');
    fs.writeFileSync(outputPath, pdfBuffer);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);

    console.log(`✅ PDF captured!`);
    console.log(`📦 File: ${outputPath}`);
    console.log(`📊 Size: ${fileSize} KB`);
    console.log(`✨ Ready for download`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) await browser.close();
    process.exit(1);
  }
}

capturePDF();
