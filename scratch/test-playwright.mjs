import { chromium } from "@playwright/test";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", msg => {
    console.log(`[BROWSER ${msg.type()}]`, msg.text());
  });

  page.on("pageerror", err => {
    console.log(`[BROWSER ERROR]`, err.message);
  });

  page.on("response", res => {
    if (res.status() >= 400) {
      console.log(`[HTTP ${res.status()}]`, res.url());
    }
  });

  console.log("Navigating to http://localhost:3000/blog ...");
  await page.goto("http://localhost:3000/blog", { waitUntil: "networkidle" });
  console.log("Current URL:", page.url());
  console.log("Page title:", await page.title());

  // Let's find the first blog card link
  const cardLink = page.locator('article h2 a, article h3 a').first();
  const href = await cardLink.getAttribute("href");
  const text = await cardLink.innerText();
  console.log(`Clicking card: "${text}" with href: "${href}"`);

  await cardLink.click();
  await page.waitForTimeout(3000);

  console.log("After click URL:", page.url());
  console.log("After click title:", await page.title());

  const h1 = await page.locator("h1, h2").allInnerTexts();
  console.log("Headings found on page:", h1);

  const bodyText = await page.innerText("body");
  if (bodyText.includes("The page you are looking for does not exist")) {
    console.log(">>> CONFIRMED: 404 page is showing! <<<");
  } else {
    console.log(">>> SUCCESS: Blog post rendered properly! <<<");
  }

  await browser.close();
}

main().catch(console.error);
