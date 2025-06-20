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

client.on("ready", async () => {
  console.log("✅ WhatsApp conectado!");

  // 📄 Lê sinais do arquivo
  let sinais;
  try {
    const dados = fs.readFileSync("./sinais.json", "utf8");
    sinais = JSON.parse(dados);
  } catch (err) {
    console.error("❌ Erro ao ler sinais.json:", err);
    return;
  }

  // 🚧 Verifica se tem sinais
  if (sinais.length === 0) {
    console.log("🚫 Nenhum sinal para enviar.");
    return;
  }

  // 📤 Monta mensagem
  let mensagem = "⚽️ *ENTRADAS ENCONTRADAS* ⚽️\n\n";
  sinais.forEach((sinal) => {
    mensagem += `🎯 *Jogo:* ${sinal.jogo}\n`;
    mensagem += `📊 *Linha:* ${sinal.linha}\n`;
    mensagem += `✅ *Green:* ${sinal.greens} | ❌ *Red:* ${sinal.reds}\n`;
    mensagem += `🔥 *% Green:* ${sinal.percentualGreen}%\n`;
    mensagem += `━━━━━━━━━━━━━━\n`;
  });

  console.log("📨 Enviando mensagem...");

  const groupId = "120363420324759444@g.us";

  await client.sendMessage(groupId, mensagem);

  console.log("✅ Mensagem enviada com sucesso!");
});

client.initialize();
