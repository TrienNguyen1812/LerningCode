class BaseStrategy {
  constructor() {
    if (this.constructor === BaseStrategy) {
      throw new Error("Không thể khởi tạo trực tiếp BaseStrategy (Abstract Class).");
    }
  }

  // Hàm chuẩn để các ngôn ngữ ghi đè
  async execute(code, testCases) {
    throw new Error("Phương thức execute() phải được implement.");
  }
}

module.exports = BaseStrategy;