const qrcode = require("qrcode-terminal");
const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");

// ✅ Inicializa WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

async function sendSignals() {
  // 📄 Lê sinais do arquivo
  let sinais;
  try {
    const dados = fs.readFileSync("./sinais.json", "utf8");
    sinais = JSON.parse(dados);
  } catch (err) {
    console.error("❌ Erro ao ler sinais.json:", err);
    return;
  }

  // 🚫 Sem sinais, nada a fazer
  if (!sinais || sinais.length === 0) {
    console.log("🚫 Nenhum sinal para enviar.");
    return;
  }

  // 📤 Monta mensagem
  let mensagem = "⚽️ *ENTRADAS ENCONTRADAS* ⚽️\n\n";
  sinais.forEach((sinal, idx) => {
    mensagem += `🔔 *Sinal ${idx + 1}*\n`;
    mensagem += `🏆 *Liga:* ${sinal.league}\n`;
    mensagem += `🎯 *Jogo:* ${sinal.times}\n`;
    mensagem += `⏰ *Minutos:* ${sinal.hMin}'\n`;
    mensagem += `━━━━━━━━━━━━━━\n`;
  });

  console.log("📨 Enviando mensagem...");
  const groupId = "120363420324759444@g.us";
  try {
    await client.sendMessage(groupId, mensagem);
    console.log("✅ Mensagem enviada com sucesso!");
  } catch (err) {
    console.error("❌ Falha ao enviar mensagem:", err);
  }
}

client.on("ready", async () => {
  console.log("✅ WhatsApp conectado!");

  // Executa imediatamente
  await sendSignals();

  // Agenda para rodar a cada 5 minutos (300.000 ms)
  setInterval(sendSignals, 5 * 60 * 1000);
});

client.initialize();
