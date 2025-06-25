class SignalSendUseCase {
  constructor(whatsappClient, groupId) {
    this.whatsapp = whatsappClient;
    this.groupId = groupId;
  }

  async execute(sinais) {
    if (sinais.length === 0) return;
    let msg = "⚽️ *ENTRADAS*\n\n";
    sinais.forEach((s) => {
      msg += `🏆 *Liga:* ${s.league}\n🎯 *Jogo:* ${s.times}\n⏰ *Min:* ${s.hMin}\n—\n`;
    });
    await this.whatsapp.send(this.groupId, msg);
  }
}

module.exports = SignalSendUseCase;
