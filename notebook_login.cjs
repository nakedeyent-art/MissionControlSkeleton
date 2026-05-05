const { webkit } = require('playwright');
const fs = require('fs');

const PROFILE_PATH = '/Users/rizzolini/.openclaw/browser_profile_safari';

async function loginAndSaveSession() {
  console.log('Launching browser. Please log into your Google Account...');
  
  // Launch visibly so you can sign in
  const browser = await webkit.launchPersistentContext(PROFILE_PATH, {
    headless: false,
    viewport: null
  });

  const page = await browser.newPage();
  await page.goto('https://notebooklm.google.com/notebook/dc3144cf-71a9-432d-90b4-e4ce97aad6ee');

  console.log('\n=========================================================');
  console.log('ACTION REQUIRED:');
  console.log('1. Go to the Chromium window that just opened.');
  console.log('2. Log into your Google Account.');
  console.log('3. Once you see the NotebookLLM content successfully load, come back here.');
  console.log('4. Close the browser window to save your session permanently.');
  console.log('=========================================================\n');

  // Keep the script running until the user closes the browser
  page.on('close', async () => {
    console.log('Browser closed! Your session is now saved for all future agent access.');
    process.exit(0);
  });
}

loginAndSaveSession().catch(console.error);
