import { chromium } from '@playwright/test';
import path from 'node:path';

async function verify() {
  console.log('--- Starting Landing Page & Navbar Verification ---');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('[Vercel Web Analytics]') && !text.includes('React DevTools')) {
      consoleMessages.push(`[${msg.type()}] ${text}`);
    }
  });

  const pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });

  console.log('Step 1: Navigating to http://localhost:3000/ ...');
  const response = await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  console.log(`HTTP status: ${response.status()}`);

  // 1. Verify Navbar
  console.log('\nStep 2: Checking Navbar...');
  const homeLink = await page.$('nav[aria-label="Main Navigation"] a[aria-label="Home"]');
  console.log(`Home icon link found: ${homeLink ? 'PASS' : 'FAIL'}`);
  if (homeLink) {
    const homeHref = await homeLink.getAttribute('href');
    console.log(`Home link href: "${homeHref}" (expected "/")`);
    const homeSvg = await homeLink.$('svg');
    console.log(`Home link contains SVG icon: ${homeSvg ? 'PASS' : 'FAIL'}`);
  }

  // Verify A symbol and Ajinkya Dharkar are not in the brand element
  const navText = await page.$eval('nav[aria-label="Main Navigation"]', el => el.innerText);
  const hasAInitial = navText.split('\n').some(t => t.trim() === 'A');
  const hasFullName = navText.includes('Ajinkya');
  console.log(`Old "A" logo initial removed: ${!hasAInitial ? 'PASS' : 'FAIL'}`);
  console.log(`Old "Ajinkya" brand text removed: ${!hasFullName ? 'PASS' : 'FAIL'}`);

  // 2. Verify Landing Page Headline
  console.log('\nStep 3: Checking Headline "I write blogs too"...');
  const h1 = await page.$('h1');
  console.log(`H1 found: ${h1 ? 'PASS' : 'FAIL'}`);
  if (h1) {
    const h1Text = await h1.innerText();
    console.log(`H1 text: "${h1Text}"`);

    const blogsLink = await h1.$('a[href="/blog"]');
    console.log(`"blogs" link to /blog found: ${blogsLink ? 'PASS' : 'FAIL'}`);
    if (blogsLink) {
      const blogsClasses = await blogsLink.getAttribute('class');
      console.log(`"blogs" classes: "${blogsClasses}"`);
      const hasSerif = blogsClasses?.includes('font-serif') || blogsClasses?.includes('font-instrument-serif');
      const hasItalic = blogsClasses?.includes('italic');
      console.log(`"blogs" uses font-serif / Instrument Serif: ${hasSerif ? 'PASS' : 'FAIL'}`);
      console.log(`"blogs" is italicized: ${hasItalic ? 'PASS' : 'FAIL'}`);
    }
  }

  // 3. Verify Matrix Ripple Canvas
  console.log('\nStep 4: Checking Matrix Ripple Canvas...');
  const canvas = await page.$('canvas');
  console.log(`Matrix canvas element found: ${canvas ? 'PASS' : 'FAIL'}`);

  if (canvas) {
    const boundingBox = await canvas.boundingBox();
    console.log(`Canvas dimensions: ${boundingBox?.width}x${boundingBox?.height}`);

    // Trigger click events at different points on the screen to trigger ripples
    console.log('Simulating clicks to trigger matrix ripple effect...');
    await page.mouse.click(720, 450); // center
    await page.waitForTimeout(300);
    await page.mouse.click(300, 300); // top-left
    await page.waitForTimeout(500);
    console.log('Ripples triggered successfully.');
  }

  // 4. Verify Console & Page Errors
  console.log('\nStep 5: Checking for errors...');
  const errorLogs = consoleMessages.filter(m => m.startsWith('[error]'));
  console.log(`Console error count: ${errorLogs.length}`);
  if (errorLogs.length > 0) {
    console.log('Console errors:', errorLogs);
  }
  console.log(`Uncaught page error count: ${pageErrors.length}`);

  // 5. Capture Screenshot
  const artifactDir = 'C:/Users/ajink/.gemini/antigravity-cli/brain/4643ec6e-824b-482a-882a-c3dd7283e4be';
  const screenshotPath = path.join(artifactDir, 'matrix-landing-page.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`Screenshot saved to: ${screenshotPath}`);

  await browser.close();
  console.log('\n--- Verification Finished Successfully ---');
}

verify().catch(err => {
  console.error(err);
  process.exit(1);
});
