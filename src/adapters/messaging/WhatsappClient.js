const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

class WhatsappClient {
  constructor() {
    this.client = new Client({ authStrategy: new LocalAuth() });
    this.client.on("qr", (qr) => qrcode.generate(qr, { small: true }));
  }

  onReady(callback) {
    this.client.on("ready", callback);
    this.client.initialize();
  }

  async send(groupId, message) {
    await this.client.sendMessage(groupId, message);
  }
}

module.exports = WhatsappClient;
