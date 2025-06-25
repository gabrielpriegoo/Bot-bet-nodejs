const { chromium } = require("playwright");

class PlaywrightScraper {
  constructor({ url, credentials }) {
    this.url = url;
    this.credentials = credentials;
  }

  async extracRawTable() {
    const browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled"],
    });

    const context = await browser.newContext({
      httpCredentials: this.credentials,
    });

    const page = await context.newPage();

    await page.goto(this.url, {
      waitUntil: "domcontentloaded",
    });

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

    // await browser.close();
    return resultados;
  }
}

module.exports = PlaywrightScraper;
