const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");

  const groupId = "120363420324759444@g.us";

  const emoji = "\u26BD";

  // setInterval(async () => {
  //   await client.sendMessage(groupId, "testandooo" + emoji);
  //   console.log("Mensagem enviada para o grupo com os jogos!");
  // }, 5000); // A cada 1 minuto
});

client.on("message_create", async (message) => {
  if (message.body.toLowerCase() === "jogos") {
    await client.sendMessage(message.from, "Aqui estão os jogos do dia!");
  }

  if (message.body.toLowerCase() === "ola") {
    await client.sendMessage(
      message.from,
      "Entrada a confirmar! Fique esperto!"
    );
  }
});

client.initialize();
