require("dotenv").config();
const cron = require("node-cron");
const JsonFileRepository = require("../adapters/persistence/JsonFileRepository");
const PlaywrightScraper = require("../adapters/scraping/PlaywrightScraper");
const WhatsappClient = require("../adapters/messaging/WhatsappClient");
const SignalExtractUseCase = require("../use-cases/signal-extract-usecase");
const SignalFilterUseCase = require("../use-cases/signal-new-filter-usecase");
const SignalSendUseCase = require("../use-cases/signal-send-usecase");

(async () => {
  const scraper = new PlaywrightScraper({
    url: process.env.URL_SITE,
    credentials: {
      username: process.env.USER_NAME,
      password: process.env.USER_PASSWORD,
    },
  });
  const repo = new JsonFileRepository("./sinais_enviados.json");
  const whatsapp = new WhatsappClient();

  const extrair = new SignalExtractUseCase(scraper);
  const filtrar = new SignalFilterUseCase(repo);
  const enviar = new SignalSendUseCase(whatsapp, process.env.WA_GROUP_ID);

  const cronSchedule = process.env.CRON_SCHEDULE || "*/5 * * * *";

  whatsapp.onReady(() => {
    console.log("📱 WhatsApp pronto!");

    // 3. Agendar a tarefa de scraping a cada X minutos
    //    Aqui uso cron: a cada 5 minutos
    // scheduler
    cron.schedule(cronSchedule, async () => {
      try {
        console.log("🔍 Iniciando extração de sinais…");
        const sinais = await extrair.execute();
        const novos = await filtrar.execute(sinais);
        await enviar.execute(novos);
        console.log(`✅ Tarefa concluída. Novos sinais: ${novos.length}`);
      } catch (err) {
        console.error("❌ Erro durante a automação:", err);
      }
    });

    console.log("⏰ Agendado para rodar a cada 5 minutos.");
  });
})();
