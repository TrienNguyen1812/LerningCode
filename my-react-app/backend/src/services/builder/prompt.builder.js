class PromptBuilder {
  constructor() {
    this.reset();
  }

  reset() {
    this.instruction = "";
    this.studentCode = "";
    this.language = "C#";
    this.problemTitle = "";
    return this;
  }

  setInstruction(instruction) {
    this.instruction =
      instruction || "Hãy đưa ra nhận xét ngắn gọn và gợi ý hướng sửa lỗi.";
    return this;
  }

  setProblemTitle(title) {
    this.problemTitle = title;
    return this;
  }

  setStudentCode(code, language = "C#") {
    this.studentCode = code;
    this.language = language;
    return this;
  }

  // Kết hợp tất cả thành 1 chuỗi Prompt hoàn chỉnh
  build() {
    // Map C# thành csharp để Markdown Syntax Highlighting đẹp hơn khi gửi cho AI
    const langTag = this.language.toLowerCase() === "c#" ? "csharp" : this.language.toLowerCase();

    const fullPrompt = `
[VAI TRÒ]: Bạn là trợ lý giảng dạy AI cho hệ thống DevLearner.
[TÊN BÀI TẬP]: ${this.problemTitle}
[QUY TẮC CẦN TUÂN THỦ DÀNH CHO AI]: ${this.instruction}

[MÃ NGUỒN CỦA SINH VIÊN (${this.language})]:
\`\`\`${langTag}
${this.studentCode}
\`\`\`

[YÊU CẦU]: Phân tích bài làm trên dựa theo quy tắc. Đưa ra gợi ý mà KHÔNG viết sẵn toàn bộ lời giải hoàn chỉnh.
    `.trim();

    return fullPrompt;
  }
}

module.exports = PromptBuilder;