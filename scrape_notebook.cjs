const { chromium } = require('playwright');
const fs = require('fs');

async function scrapeNotebook() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to NotebookLLM...');
  await page.goto('https://notebooklm.google.com/notebook/dc3144cf-71a9-432d-90b4-e4ce97aad6ee', { waitUntil: 'networkidle' });
  
  console.log('Waiting for content to load...');
  // Wait a bit for React to render the notebook
  await page.waitForTimeout(5000);
  
  const textContent = await page.evaluate(() => document.body.innerText);
  
  fs.writeFileSync('/Users/rizzolini/Gemini/antigravity/scratch/Agent HQ/gsr_context.txt', textContent);
  console.log('Successfully saved NotebookLLM context to gsr_context.txt');
  
  await browser.close();
}

scrapeNotebook().catch(console.error);
