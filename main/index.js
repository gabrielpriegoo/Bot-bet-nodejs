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

    return dados;
  });

  // Lógica de Análise
  const linha0 = resultados[0];
  const linha4 = resultados[4];

  if (!linha0 || !linha4) {
    console.log("❌ Linhas necessárias não existem.");
    process.exit(1);
  }

  // 1. Jogos com >= 5 gols na linha 4
  const resultInGames = linha4.data.filter((item) => {
    const [score1, score2] = item.placar.split("-").map(Number);
    const totalGoals = score1 + score2;
    return totalGoals >= 5;
  });

  // 2. Jogos futuros na linha 0
  const jogosFuturos = linha0.data.filter((item) => {
    return item.status === "" && item.placar === "";
  });

  // 3. Verifica matches baseados no hMin
  let matches = jogosFuturos.filter((futuro) =>
    resultInGames.some((passado) => passado.hMin === futuro.hMin)
  );

  // 4. Remove duplicatas por chave única
  const uniqueMatchesMap = new Map();

  matches.forEach((jogo) => {
    const chaveUnica = `${jogo.times}-${jogo.hMin}-${jogo.league}`;
    if (!uniqueMatchesMap.has(chaveUnica)) {
      uniqueMatchesMap.set(chaveUnica, jogo);
    }
  });

  const sinais = Array.from(uniqueMatchesMap.values());

  // 5. Exibe e salva
  if (sinais.length > 0) {
    console.log("🎯 Sinais únicos encontrados:", sinais);
    fs.writeFileSync("./sinais.json", JSON.stringify(sinais, null, 2));
    console.log("💾 Arquivo sinais.json gerado com sucesso.");
  } else {
    console.log("⚠️ Nenhum sinal encontrado.");
  }
  // await browser.close();
})();
