const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    httpCredentials: {
      username: "Ocardoso",
      password: "Matheus94",
    },
  });

  const page = await context.newPage();

  await page.goto("https://betaxis.com.br", {
    waitUntil: "domcontentloaded",
  });

  console.log("✅ Login realizado com sucesso");

  // Aqui segue com seu scraping normalmente
  await page.pause();

  // await browser.close();
})();
