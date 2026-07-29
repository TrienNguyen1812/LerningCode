const AiFactory = require("./factory/AI.factory");
const PromptBuilder = require("./builder/prompt.builder");

class AiService {
  constructor() {
    this.promptBuilder = new PromptBuilder();
  }

  async analyzeSubmission({ problemTitle, aiInstruction, studentCode, language, modelType = "gemini" }) {
    // 1. Sử dụng Builder Pattern để tạo ra Prompt
    const finalPrompt = this.promptBuilder
      .setProblemTitle(problemTitle)
      .setInstruction(aiInstruction)
      .setStudentCode(studentCode, language)
      .build();

    // 2. Sử dụng Factory Pattern để lấy Strategy tương ứng
    const aiStrategy = AiFactory.createAiStrategy(modelType);

    // 3. Thực thi Strategy để nhận kết quả từ AI
    const result = await aiStrategy.generateFeedback(finalPrompt);

    return result;
  }
}

module.exports = new AiService();