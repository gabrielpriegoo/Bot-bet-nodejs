class SignalFilterUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  async execute(signals) {
    const sent = await this.repository.read();
    const sendKeys = new Set(sent.map((signalKey) => signalKey.key));
    const news = signals.filter(
      (signalsItem) => !sendKeys.has(signalsItem.key)
    );

    if (news.length) {
      await this.repository.write([...sent, ...news]);
    }

    return news;
  }
}

module.exports = SignalFilterUseCase;
