const { chromium } = require("playwright");
require("dotenv").config();
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  // Loga no site com credenciais HTTP
  const context = await browser.newContext({
    httpCredentials: {
      username: process.env.USER_NAME,
      password: process.env.USER_PASSWORD,
    },
  });

  // Abre uma nova página
  const page = await context.newPage();

  // Intercepta requisições para evitar bloqueios
  await page.goto(process.env.URL_SITE, {
    waitUntil: "domcontentloaded",
  });

  console.log("✅ Login realizado no site");

  // page.pause();

  // Seleciona times e odds
  await page
    .locator("#iframe")
    .contentFrame()
    .getByRole("button", { name: "⚽ Times" })
    .click();
  await page.waitForLoadState("networkidle");
  // await page
  //   .locator("#iframe")
  //   .contentFrame()
  //   .getByRole("button", { name: "💰 Odds" })
  //   .click();

  // Aguarda o iframe carregar
  const tabelaLocator = page
    .frameLocator("#iframe")
    .locator("#tableContainer table");
  await tabelaLocator.waitFor();

  const resultados = await tabelaLocator.evaluate((tabela) => {
    const linhas = tabela.querySelectorAll("tbody tr");
    const dados = [];

    // Captura os valores de H/Min
    const hMinValues = Array.from(tabela.querySelectorAll("th"))
      .slice(3)
      .map((th) => th.innerText.trim());

    const ligaSelecionada =
      document.querySelector("#fileSelect").options[
        document.querySelector("#fileSelect").selectedIndex
      ].text;

    linhas.forEach((linha) => {
      // Pega o título da linha
      const th = linha.querySelector("th")?.innerText.trim() || "";
      const tds = Array.from(linha.querySelectorAll("td"));

      const processarTexto = (texto) => {
        const partes = texto.trim().split("\n");

        // Caso exista placar
        if (partes.length === 3) {
          const team1 = partes[0].trim();
          const placar = partes[1].trim();
          const team2 = partes[2].trim();

          return {
            team: `${team1} x ${team2}`,
            placar: placar,
          };
        }

        // Caso nao exista placar
        if (partes.length === 2) {
          const team1 = partes[0].trim();
          const team2 = partes[1].trim();

          return {
            team: `${team1} x ${team2}`,
            placar: "",
          };
        }

        return {
          team: "",
          placar: "",
        };
      };

      const linhaDados = tds
        .map((td, index) => {
          const texto = td.innerText.trim();
          const hMinValue = hMinValues[index] || "";
          const { team, placar } = processarTexto(texto);

          if (texto && (team || placar)) {
            return {
              league: ligaSelecionada,
              times: team,
              placar: placar,
              hMin: hMinValue,
              status: td.classList.contains("green")
                ? "green"
                : td.classList.contains("red")
                ? "red"
                : "",
            };
          }

          return null;
        })
        .filter((dado) => dado !== null);

      if (th === "% GREENS") {
        return;
      }

      // Verifica se há dados após o filtro
      if (linhaDados.length > 0) {
        dados.push({
          linha: th,
          data: linhaDados,
        });
      }
    });

    return dados[0];
  });

  // console.log(JSON.stringify(resultados, null, 2));
  console.log("📊 Dados capturados", resultados);

  // ✅ LÓGICA DE ANÁLISE
  // const sinais = resultados
  //   .filter((linha) => {
  //     const greens = linha.dados.filter((d) => d.status === "green").length;
  //     const total = linha.dados.length;
  //     const percentualGreen = total > 0 ? (greens / total) * 100 : 0;

  //     // Filtro mais flexível: Permitindo qualquer valor de percentualGreen
  //     return percentualGreen >= 50 && linha.jogosFuturos.length > 0;
  //   })
  //   .map((linha) => {
  //     const greens = linha.dados.filter((d) => d.status === "green").length;
  //     const reds = linha.dados.filter((d) => d.status === "red").length;
  //     const total = linha.dados.length;
  //     const percentualGreen = ((greens / total) * 100).toFixed(2);

  //     return {
  //       jogo: linha.jogosFuturos.join(", "), // Lista de jogos futuros
  //       linha: linha.linha,
  //       greens,
  //       reds,
  //       total,
  //       percentualGreen,
  //     };
  //   });

  // ✅ SALVA EM ARQUIVO
  // fs.writeFileSync("./sinais.json", JSON.stringify(sinais, null, 2));

  // console.log("💾 Arquivo sinais.json gerado com sucesso", sinais);

  // await browser.close();
})();
