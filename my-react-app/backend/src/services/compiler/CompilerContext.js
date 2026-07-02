class CompilerContext {
  constructor() {
    this.strategy = null;
  }

  // Set chiến lược tại thời điểm runtime (dựa vào language do user chọn)
  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async executeCode(code, testCases) {
    if (!this.strategy) {
      throw new Error("Chưa thiết lập Compiler Strategy.");
    }
    return await this.strategy.execute(code, testCases);
  }
}

module.exports = CompilerContext;