const { GoogleGenerativeAI } = require("@google/generative-ai");
const AiStrategy = require("./Ai.strategy");

class GeminiStrategy extends AiStrategy {
  constructor() {
    super();
    // Lấy API Key Gemini từ file .env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Chưa cấu hình GEMINI_API_KEY trong file .env!");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Sử dụng model gemini-1.5-flash hoặc gemini-pro
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateFeedback(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Giả lập hoặc lấy usage metadata token nếu có
      return {
        analysisContent: text,
        suggestion: "Hãy kiểm tra lại điều kiện biên theo phản hồi của AI.",
        modelName: "gemini-1.5-flash",
        promptToken: prompt.length / 4, // Lượng tính toán ước lượng
        completionToken: text.length / 4,
      };
    } catch (error) {
      console.error("Lỗi khi gọi Gemini API:", error);
      throw new Error(`Gemini AI Error: ${error.message}`);
    }
  }
}

module.exports = GeminiStrategy;