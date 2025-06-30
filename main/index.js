require("dotenv").config();
const fs = require("fs");

const playwrightClient = require("../src/infra/playwright-client");
const fetchTableFilter = require("../src/domain/services/fetch-signals");
const strategyFiveColumnsUseCase = require("../src/use-cases/strategy-five-columns-usecase");

async function runAnalysis() {
  try {
    const tabelaLocator = await playwrightClient.createBrowserContext();
    const listTable = await fetchTableFilter.fetchTable(tabelaLocator);

    // 2. Executa sua regra de negócio
    const signalsStrategyColumns =
      await strategyFiveColumnsUseCase.StrategyColumnsUsecase(listTable);

    // 3. Exibe e salva resultado
    if (signalsStrategyColumns.length > 0) {
      console.log("🎯 Sinais únicos encontrados:", signalsStrategyColumns);
      fs.writeFileSync(
        "./sinais.json",
        JSON.stringify(signalsStrategyColumns, null, 2)
      );
      console.log("💾 Arquivo sinais.json gerado com sucesso.");
    } else {
      console.log("⚠️ Nenhum sinal encontrado.");
    }

    // 4. (Opcional) fechar browser, se for exposto pelo playwrightClient
    // await playwrightClient.close();
  } catch (err) {
    console.error("❌ Erro na execução da análise:", err);
  }
}

// Executa imediatamente
runAnalysis();

// Agenda para rodar a cada 5 minutos (300.000 ms)
setInterval(runAnalysis, 5 * 60 * 1000);
