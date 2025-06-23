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
  if (!sinais || sinais.length === 0) {
    console.log("🚫 Nenhum sinal para enviar.");
    return;
  }

  // 📤 Monta mensagem
  let mensagem = "⚽️ *ENTRADAS ENCONTRADAS* ⚽️\n\n";

  // Pega o primeiro objeto da lista de sinais
  const primeiroSinal = sinais[(0, 1)]; // Acesse o primeiro objeto no array sinais

  // Agora monta a mensagem com as informações do primeiro sinal
  mensagem += `🏆 *Liga:* ${primeiroSinal.league}\n`;
  mensagem += `🎯 *Jogo:* ${primeiroSinal.times}\n`;
  mensagem += `⏰ *Minutos:* ${primeiroSinal.hMin}\n`;
  mensagem += `━━━━━━━━━━━━━━\n`;

  console.log("📨 Enviando mensagem...");

  const groupId = "120363420324759444@g.us";

  await client.sendMessage(groupId, mensagem);

  console.log("✅ Mensagem enviada com sucesso!");
});

client.initialize();
