const { chromium } = require("playwright");
require("dotenv").config();

async function createBrowserContext() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    httpCredentials: {
      username: process.env.USER_NAME,
      password: process.env.USER_PASSWORD,
    },
  });

  const page = await context.newPage();

  await page.goto(process.env.URL_SITE, {
    waitUntil: "domcontentloaded",
  });

  console.log("✅ Login realizado no site");

  // page.pause();

  await page
    .locator("#iframe")
    .contentFrame()
    .getByRole("button", { name: "⚽ Times" })
    .click();
  await page.waitForLoadState("networkidle");

  const tabelaLocator = page
    .frameLocator("#iframe")
    .locator("#tableContainer table");
  await tabelaLocator.waitFor();

  return tabelaLocator;
}

module.exports = {
  createBrowserContext,
};
