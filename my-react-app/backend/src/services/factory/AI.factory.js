const GeminiStrategy = require("../strategy/Gemini.strategy");

class AiFactory {
  static createAiStrategy(modelType = "gemini") {
    switch (modelType.toLowerCase()) {
      case "gemini":
      case "gemini-1.5-flash":
        return new GeminiStrategy();
      default:
        throw new Error(`Model AI '${modelType}' không được hỗ trợ!`);
    }
  }
}

module.exports = AiFactory;