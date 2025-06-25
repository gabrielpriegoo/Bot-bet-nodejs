const Signal = require("../domain/entities/Signal");

class SignalExtractUseCase {
  constructor(scraper) {
    this.scraper = scraper;
  }

  async execute() {
    const results = await this.scraper.extracRawTable();
    const signals = results
      .flatMap((result) => result.data)
      .map((item) => new Signal(item));
    return signals;
  }
}

module.exports = SignalExtractUseCase;
