// Interface/Abstract Class cho AI Strategy
class AiStrategy {
  async generateFeedback(prompt) {
    throw new Error("Phương thức generateFeedback() phải được triển khai!");
  }
}

module.exports = AiStrategy;