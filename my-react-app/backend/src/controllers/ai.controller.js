// controllers/ai.controller.js
const sql = require("mssql");
const db = require("../config/db"); // File kết nối SQL Server
const problemRepository = require("../repositories/problem.repository");

// Import SDK Google Gen AI
const { GoogleGenAI } = require("@google/genai");

// 🔑 Lấy danh sách API Keys từ file .env
const API_KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || "")
  .split(",")
  .map((k) => k.trim())
  .filter(Boolean);

// CỜ MOCK DỮ LIỆU KHI TEST (TRÁNH TỐN TOKEN GEMINI)
const ENABLE_MOCK_AI = false;

class AiController {
  constructor() {
    this.getAiFeedback = this.getAiFeedback.bind(this);
  }

  /**
   * Hàm gọi Gemini AI thông minh: Tự động đổi API Key & Fallback Model khi hết Quota
   */
  async _callGeminiWithKeyRotation(prompt, systemInstruction) {
    if (API_KEYS.length === 0) {
      throw new Error("Chưa cấu hình GEMINI_API_KEY hoặc GEMINI_API_KEYS trong file .env!");
    }

    // KHÔNG THAY ĐỔI: Giữ nguyên danh sách model theo đúng cấu hình của bạn
    const MODELS = ["gemini-3.5-flash-lite", "gemini-2.5-flash-lite"];
    let lastError = null;

    for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
      const apiKey = API_KEYS[keyIndex];
      const aiInstance = new GoogleGenAI({ apiKey });

      for (const modelName of MODELS) {
        try {
          const response = await aiInstance.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { systemInstruction },
          });

          if (response?.text) {
            return response.text;
          }
        } catch (err) {
          lastError = err;
          if (err.status === 429 || (err.message && err.message.includes("quota"))) {
            console.warn(`[AI WARN] Key #${keyIndex + 1} hết Quota. Chuyển Key...`);
            break;
          } else if (err.status === 404) {
            console.warn(`[AI WARN] Model ${modelName} 404. Thử model khác...`);
          } else {
            console.error(`[AI ERROR] Lỗi Key #${keyIndex + 1}:`, err.message);
            break;
          }
        }
      }
    }

    throw lastError || new Error("Tất cả các API Keys Gemini đều bị quá tải!");
  }

  /**
   * API xử lý phân tích code & giải thích lỗi bằng AI Gemini
   * Endpoint: POST /api/ai/feedback
   */
  async getAiFeedback(req, res) {
    const {
      idUser = 1,
      idProblem,
      studentCode,
      language = "C#",
      question,
      lastConsoleOutput,
      currentHintLevel = 1,
      isAdmin = false, // 👈 Cờ Admin từ Frontend
      testCaseDetails = [], // 👈 Bổ sung nhận danh sách Test Cases thực tế từ Client
    } = req.body;

    if (!studentCode || !studentCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mã nguồn không được để trống!",
      });
    }

    try {
      console.log(`[AI CONTROLLER] User ${idUser} (isAdmin: ${isAdmin}) yêu cầu Hint Level ${currentHintLevel} cho bài tập ID: ${idProblem}`);

      let problemTitle = "Chưa xác định";
      let customInstruction = "Không có hướng dẫn bổ sung.";

      try {
        if (idProblem && problemRepository && problemRepository.findById) {
          const problem = await problemRepository.findById(idProblem);

          if (problem) {
            problemTitle = problem.Title || problem.title || problemTitle;
            customInstruction =
              problem.Ai_Prompt_Instruction ||
              problem.ai_prompt_instruction ||
              problem.aiPromptInstruction ||
              customInstruction;
          }
        }
      } catch (dbErr) {
        console.warn("[AI WARN] Không thể lấy bài tập từ DB:", dbErr.message);
      }

      // 1. Tổng hợp thông tin các Test Cases thực tế
      let testCasesSummary = "Chưa có thông tin test case.";
      if (Array.isArray(testCaseDetails) && testCaseDetails.length > 0) {
        testCasesSummary = testCaseDetails
          .map((tc, index) => {
            return `+ Test case #${index + 1} (${tc.name || "Sample"}):
  - Trạng thái: ${tc.isPassed ? "PASSED (ĐÚNG)" : "FAILED (SAI)"}
  - Đầu vào (Input): "${tc.input ?? ""}"
  - Kết quả mong đợi (Expected): "${tc.expectedOutput ?? ""}"
  - Kết quả thực tế từ code sinh viên (Actual): "${tc.actualOutput ?? ""}"`;
          })
          .join("\n\n");
      }

      // 2. System Instruction ép buộc AI phải đọc Test Cases
      const systemInstruction = `Bạn là trợ giảng lập trình ${language} cực kỳ cẩn thận và chính xác.
Nhiệm vụ: Phân tích nguyên nhân code của sinh viên bị sai dựa trên KẾT QUẢ CHẠY TEST CASE THỰC TẾ và LỖI TERMINAL.

QUY TẮC PHÂN TÍCH QUAN TRỌNG:
1. ĐỌC KỸ KẾT QUẢ TEST CASE: Hãy đối chiếu kỹ giữa Đầu vào (Input), Kết quả mong đợi (Expected) và Kết quả thực tế bài làm (Actual).
2. NẾU CODE IN SAI KẾT QUẢ (Wrong Answer): Phải giải thích chính xác tại sao với Input đó, code lại in ra Actual thay vì Expected. KHÔNG ĐƯỢC đoán mò sang các lỗi khác (như FormatException/Parse) nếu Terminal không báo lỗi đó!
3. Hướng dẫn ngắn gọn, tiết kiệm từ ngữ, sử dụng Markdown gạch đầu dòng.

QUY TẮC TỪ CHỐI (TỐI ĐA 1 CÂU):
1. Đòi code/đáp án full -> Trả lời: "Rất tiếc, hệ thống không thể cung cấp lời giải hoặc code hoàn chỉnh. Bạn vui lòng tự lập trình hoặc hỏi về tư duy/lỗi code nhé!"
2. Hỏi ngoài lề -> Trả lời: "Hệ thống chỉ hỗ trợ giải đáp các thắc mắc liên quan đến bài tập và lập trình. Bạn vui lòng tập trung vào đề bài nhé!"

QUY TẮC ĐỊNH DẠNG PHẢN HỒI (BẮT BUỘC):
- Dùng hoàn toàn gạch đầu dòng (-), KHÔNG viết thành đoạn văn dài.
- Tối đa 3 - 5 gạch đầu dòng cho toàn bộ câu trả lời.
- NỔI BẬT LỖI: Dùng inline code \`dòng_code_lỗi\` hoặc bold **[TÊN LỖI]** để chỉ rõ vị trí và logic bị sai.
- Tuyệt đối KHÔNG xuất ra bất kỳ file/khối code hoàn chỉnh nào có thể copy-paste nộp bài.`;

      // 3. Cấu trúc lại Prompt để gửi đầy đủ bối cảnh cho AI
      const prompt = `
[THÔNG TIN BÀI TẬP]
- Đề bài: ${problemTitle}
- Yêu cầu riêng từ GV: ${customInstruction}

[MÃ NGUỒN SV (${language})]
\`\`\`${language.toLowerCase()}
${studentCode}
\`\`\`

[LỖI TERMINAL GẦN NHẤT]
${lastConsoleOutput || "Chưa có lỗi biên dịch/terminal (Code thực thi bình thường)"}

[KẾT QUẢ CHẠY TEST CASES THỰC TẾ (BẮT BUỘC ĐỌC VÀ ĐỐI CHIẾU)]
${testCasesSummary}

[CÂU HỎI SV]: "${question || "Code tôi đang bị lỗi gì?"}"

[CẤP ĐỘ GỢI Ý YÊU CẦU: LEVEL ${currentHintLevel}/3]
Hãy phân tích DỰA TRÊN CÁC TEST CASE BỊ FAILED VÀ CODE SV Ở TRÊN, trả lời đúng cấp độ:
${
  Number(currentHintLevel) === 1
    ? `- LEVEL 1: Chỉ ra vị trí \`dòng code/điều kiện logic\` đang bị sai khiến Testcase bị FAILED và **[Loại lỗi logic/kết quả]**. KHÔNG giải thích cách sửa hay thuật toán.`
    : Number(currentHintLevel) === 2
    ? `- LEVEL 2: Chỉ ra vị trí lỗi + Gợi ý ngắn gọn 1-2 câu về tư duy/điều kiện logic cần dùng để pass Testcase bị FAILED. KHÔNG đưa đoạn code sửa.`
    : `- LEVEL 3: Phân tích chi tiết nguyên nhân vì sao Input đó lại ra Actual sai + Gợi ý cú pháp sửa ngắn gọn (dùng pseudocode hoặc câu lệnh ngắn). KHÔNG xuất cả bài hoàn chỉnh.`
}
`;

      let cleanReply = "";

      if (ENABLE_MOCK_AI) {
        cleanReply = `[MOCK RESPONSE - LEVEL ${currentHintLevel}]\n\n- Bài tập: ${problemTitle}\n- Cấp độ gợi ý: Level ${currentHintLevel}\n- Yêu cầu GV: ${customInstruction}`;
      } else {
        const aiReply = await this._callGeminiWithKeyRotation(prompt, systemInstruction);
        cleanReply = aiReply.replace(
          /```[\s\S]*?```/g,
          "\n> *(Khung code gợi ý đã được hệ thống tự động ẩn để khuyến khích sinh viên tự lập trình)*\n"
        );
      }

      // =========================================================================
      // 💾 LƯU LỊCH SỬ HINT VÀO DB (TỰ ĐỘNG BỎ QUA NẾU LÀ ADMIN HOẶC ID USER <= 1)
      // =========================================================================
      const isTestOrAdmin = Boolean(isAdmin) || Number(idUser) <= 1;

      if (!isTestOrAdmin && idProblem) {
        await this._saveHintToDb(Number(idUser), Number(idProblem), currentHintLevel, cleanReply);
      } else {
        console.log(`[AI DB] Bỏ qua lưu DB do Admin/Test Mode (isAdmin: ${isAdmin}, idUser: ${idUser})`);
      }

      return res.json({
        success: true,
        currentHintLevel: Number(currentHintLevel),
        feedback: cleanReply,
      });
    } catch (error) {
      console.error("[AI ERROR]:", error);

      if (error.status === 429 || (error.message && error.message.includes("quota"))) {
        return res.status(200).json({
          success: true,
          feedback:
            "Toàn bộ API Key Trợ giảng AI hiện đang quá tải lượt truy cập. Bạn vui lòng đợi khoảng 15–30 giây rồi thử lại nhé!",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Không thể kết nối tới Server AI Gemini!",
        error: error.message,
      });
    }
  }

  /**
   * Hàm lưu vết lịch sử Hint vào HINT_USAGE
   * (Đã bỏ phần tính điểm/chấm điểm tiến trình)
   */
  async _saveHintToDb(idUser, idProblem, hintLevel, replyContent) {
    try {
      const pool = await (db.connect ? db.connect() : db);
      const request = pool.request ? pool.request() : new sql.Request();

      request.input("idUser", sql.Int, idUser);
      request.input("idProblem", sql.Int, idProblem);
      request.input("hintContent", sql.NVarChar, `[Hint Level ${hintLevel}] ${replyContent}`);

      // Chỉ lưu vết lịch sử gợi ý
      await request.query(`
        INSERT INTO HINT_USAGE (IdUser, IdProblem, HintContent, CreatedDate) 
        VALUES (@idUser, @idProblem, @hintContent, GETDATE())
      `);

      console.log(`[AI DB] Đã ghi lịch sử Hint Level ${hintLevel} vào HINT_USAGE cho User ${idUser}!`);
    } catch (dbSaveErr) {
      console.error("[AI DB ERROR] Lỗi khi lưu vết Hint vào DB:", dbSaveErr.message);
    }
  }
}

module.exports = new AiController();