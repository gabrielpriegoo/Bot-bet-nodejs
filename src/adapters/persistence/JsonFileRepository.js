const fs = require("fs").promises;

class JsonFileRepository {
  constructor(filePath) {
    this.path = filePath;
  }

  async read() {
    try {
      const raw = await fs.readFile(this.path, "utf-8");
      return JSON.parse(raw);
    } catch (error) {
      return [];
    }
  }

  async write(data) {
    await fs.writeFile(this.path, JSON.stringify(data));
  }
}

module.exports = JsonFileRepository;
