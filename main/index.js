const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    httpCredentials: {
      username: "LOGIN",
      password: "SENHA",
    },
  });

  const page = await context.newPage();

  await page.goto("WEB SITE PARA CAPTURA", {
    waitUntil: "domcontentloaded",
  });

  console.log("✅ Login realizado no site");

  const tabelaLocator = page
    .frameLocator("#iframe")
    .locator("#tableContainer table");
  await tabelaLocator.waitFor();

  const resultados = await tabelaLocator.evaluate((tabela) => {
    const linhas = tabela.querySelectorAll("tbody tr");
    const dados = [];

    linhas.forEach((linha) => {
      const th = linha.querySelector("th")?.innerText.trim() || "";
      const tds = Array.from(linha.querySelectorAll("td"));

      const linhaDados = tds.map((td) => {
        return {
          texto: td.innerText.trim(), // Texto da célula
          resultado: td.getAttribute("data-score") || "", // Placar (se existir)
          status: td.classList.contains("green")
            ? "green"
            : td.classList.contains("red")
            ? "red"
            : "",
          title: td.getAttribute("title") || "",
        };
      });

      // 🔥 Identificar jogos futuros: Celulas sem resultado, status ou title
      const jogosFuturos = linhaDados
        .filter((d) => d.texto !== "" && !d.resultado && !d.title && !d.status)
        .map((d) => d.texto);

      // Adiciona os dados processados
      dados.push({
        linha: th,
        dados: linhaDados,
        jogosFuturos: jogosFuturos,
      });
    });

    return dados;
  });
  console.log(JSON.stringify(resultados, null, 2));
  console.log("📊 Dados capturados", resultados);

  // ✅ LÓGICA DE ANÁLISE
  const sinais = resultados
    .filter((linha) => {
      const greens = linha.dados.filter((d) => d.status === "green").length;
      const total = linha.dados.length;
      const percentualGreen = total > 0 ? (greens / total) * 100 : 0;

      // Filtro mais flexível: Permitindo qualquer valor de percentualGreen
      return percentualGreen >= 50 && linha.jogosFuturos.length > 0;
    })
    .map((linha) => {
      const greens = linha.dados.filter((d) => d.status === "green").length;
      const reds = linha.dados.filter((d) => d.status === "red").length;
      const total = linha.dados.length;
      const percentualGreen = ((greens / total) * 100).toFixed(2);

      return {
        jogo: linha.jogosFuturos.join(", "), // Lista de jogos futuros
        linha: linha.linha,
        greens,
        reds,
        total,
        percentualGreen,
      };
    });

  // ✅ SALVA EM ARQUIVO
  fs.writeFileSync("./sinais.json", JSON.stringify(sinais, null, 2));

  console.log("💾 Arquivo sinais.json gerado com sucesso", sinais);

  await browser.close();
})();
