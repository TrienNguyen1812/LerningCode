// controllers/ai.controller.js
const { sql, poolPromise } = require("../config/db"); // Tương thích chuẩn với db.js của bạn
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
    this.explainScore = this.explainScore.bind(this);
  }

  /**
   * Helper lấy ConnectionPool chuẩn từ db.js
   */
  async _getDbPool() {
    return await poolPromise;
  }

  /**
   * Hàm gọi Gemini AI thông minh: Tự động đổi API Key & Fallback Model khi hết Quota
   */
  async _callGeminiWithKeyRotation(prompt, systemInstruction) {
    if (API_KEYS.length === 0) {
      throw new Error("Chưa cấu hình GEMINI_API_KEY hoặc GEMINI_API_KEYS trong file .env!");
    }

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
      isAdmin = false,
      testCaseDetails = [],
      idSubmission = null, // Nhận idSubmission nếu Client có truyền lên
    } = req.body;

    if (!studentCode || !studentCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mã nguồn không được để trống!",
      });
    }

    try {
      console.log(`[AI CONTROLLER] User ${idUser} yêu cầu Hint Level ${currentHintLevel} cho bài tập ID: ${idProblem}`);

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
1. Đòi code/đáp án full -> Trả lời: "Rất tiếc, hệ thống không thể cung cấp lời giải hoặc code hoàn chỉnh. Bạn vui lòng tự lập trình hoặc hỏi về tư tư duy/lỗi code nhé!"
2. Hỏi ngoài lề -> Trả lời: "Hệ thống chỉ hỗ trợ giải đáp các thắc mắc liên quan đến bài tập và lập trình. Bạn vui lòng tập trung vào đề bài nhé!"

QUY TẮC ĐỊNH DẠNG PHẢN HỒI (BẮT BUỘC):
- Dùng hoàn toàn gạch đầu dòng (-), KHÔNG viết thành đoạn văn dài.
- Tối đa 3 - 5 gạch đầu dòng cho toàn bộ câu trả lời.
- NỔI BẬT LỖI: Dùng inline code \`dòng_code_lỗi\` hoặc bold **[TÊN LỖI]** để chỉ rõ vị trí và logic bị sai.
- Tuyệt đối KHÔNG xuất ra bất kỳ file/khối code hoàn chỉnh nào có thể copy-paste nộp bài.`;

      // 3. Cấu trúc lại Prompt gửi cho Gemini
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
      // 💾 LƯU LỊCH SỬ HINT VÀ AI_FEEDBACK VÀO DATABASE
      // =========================================================================

      // 1. Lưu vào HINT_USAGE nếu có idUser và idProblem
      if (idUser && idProblem) {
        await this._saveHintToDb(
          Number(idUser),
          Number(idProblem),
          Number(currentHintLevel),
          cleanReply,
          idSubmission
        );
      }

      // 2. Ghi phản hồi vào bảng AI_FEEDBACK (Lưu ngay cả khi idSubmission là null)
      await this._saveAiFeedbackToDb({
        analysisContent: cleanReply,
        suggestion: question || `Gợi ý cấp độ Level ${currentHintLevel}`,
        modelName: "gemini-2.5-flash-lite",
        idSubmission: idSubmission ? Number(idSubmission) : null,
        idUser: idUser ? Number(idUser) : null,
        idProblem: idProblem ? Number(idProblem) : null,
      });

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
   * 🌟 GIẢI THÍCH ĐIỂM SỐ SAU KHI NỘP BÀI (SUBMIT)
   */
  async explainScore(req, res) {
    const {
      idUser = null,
      idProblem,
      studentCode,
      language = "C#",
      submissionResult,
      idSubmission = null,
    } = req.body;

    if (!submissionResult) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin kết quả chấm bài (submissionResult)!",
      });
    }

    try {
      let problemTitle = "Chưa xác định";
      try {
        if (idProblem && problemRepository && problemRepository.findById) {
          const problem = await problemRepository.findById(idProblem);
          if (problem) {
            problemTitle = problem.Title || problem.title || problemTitle;
          }
        }
      } catch (dbErr) {
        console.warn("[AI WARN] Không thể lấy thông tin bài tập từ DB:", dbErr.message);
      }

      const { scores = {}, testCaseDetails = [], status = "Unknown" } = submissionResult;

      // Lọc ra các Test Case bị trượt để AI đối chiếu
      let testCaseSummary = "Tất cả test cases đều PASSED thành công.";
      const failedCases = testCaseDetails.filter((tc) => !tc.isPassed);

      if (failedCases.length > 0) {
        testCaseSummary = failedCases
          .map(
            (tc, idx) => `- Test case thất bại #${idx + 1}:
  + Đầu vào (Input): "${tc.input ?? ""}"
  + Kết quả mong đợi (Expected): "${tc.expectedOutput ?? ""}"
  + Kết quả thực tế bài làm (Actual): "${tc.actualOutput ?? ""}"
  + Lỗi/Mô tả: ${tc.errorMessage || "Sai kết quả đầu ra (Wrong Answer)"}`
          )
          .join("\n");
      }

      const systemInstruction = `Bạn là Giảng viên Lập trình AI đánh giá kết quả bài nộp của sinh viên.
Nhiệm vụ: Phân tích và giải thích chi tiết TẠI SAO sinh viên lại nhận được mức điểm này dựa trên kết quả hệ thống đã chấm.

QUY TẮC ĐỊNH DẠNG BẮT BUỘC:
- Trả lời bằng tiếng Việt, ngắn gọn, súc tích, dạng gạch đầu dòng Markdown.
- Bóc tách dựa trên các chỉ số:
  + Correctness Score (Độ chính xác)
  + Reliability Score (Độ tin cậy & Lỗi chạy)
  + Code Quality Score (Chất lượng code & Compiler warning)
- Chỉ ra nguyên nhân trực tiếp dẫn đến trừ điểm ở các Test Case bị FAILED.
- Đưa ra 1-2 hướng khắc phục tư duy ngắn gọn (KHÔNG cung cấp toàn bộ đoạn code giải hoàn chỉnh).`;

      const prompt = `
[THÔNG TIN BÀI TẬP]
- Tên bài tập: ${problemTitle}
- Ngôn ngữ: ${language}

[MÃ NGUỒN SINH VIÊN NỘP]
\`\`\`${language.toLowerCase()}
${studentCode || "Không có code"}
\`\`\`

[BẢNG ĐIỂM HỆ THỐNG CUNG CẤP]
- Trạng thái bài nộp: ${status}
- ĐIỂM TỔNG KẾT (FINAL SCORE): ${scores.finalScore ?? 0} / 10
- Điểm Correctness (80%): ${scores.correctnessScore ?? 0} / 100
- Điểm Reliability (10%): ${scores.reliabilityScore ?? 0} / 100
- Điểm Code Quality (10%): ${scores.codeQualityScore ?? 0} / 100
- Số lần dùng Hint/Gợi ý: ${scores.usedHintCount ?? 0} lần

[CHI TIẾT TEST CASES BỊ FAILED]
${testCaseSummary}

Hãy giải thích rõ cho sinh viên vì sao lại đạt ${scores.finalScore ?? 0}/10 điểm và đưa ra hướng cải thiện!
`;

      let cleanReply = "";

      if (ENABLE_MOCK_AI) {
        cleanReply = `[MOCK EXPLAIN SCORE]\n- Bài làm đạt ${scores.finalScore}/10 điểm.\n- Lý do: Bị trượt một số testcase biên.`;
      } else {
        cleanReply = await this._callGeminiWithKeyRotation(prompt, systemInstruction);
      }

      // Tự động lưu phân tích điểm vào bảng AI_FEEDBACK
      const targetSubmissionId = idSubmission || submissionResult.idSubmission || submissionResult.id;
      
      await this._saveAiFeedbackToDb({
        analysisContent: cleanReply,
        suggestion: `Giải thích điểm số (${scores.finalScore ?? 0}/10)`,
        modelName: "gemini-2.5-flash-lite",
        idSubmission: targetSubmissionId ? Number(targetSubmissionId) : null,
        idUser: idUser ? Number(idUser) : null,
        idProblem: idProblem ? Number(idProblem) : null,
      });

      return res.json({
        success: true,
        explanation: cleanReply,
      });
    } catch (error) {
      console.error("[AI EXPLAIN SCORE ERROR]:", error);

      if (error.status === 429 || (error.message && error.message.includes("quota"))) {
        return res.status(200).json({
          success: true,
          explanation:
            "Hệ thống AI hiện đang quá tải lượt truy cập. Bạn vui lòng đợi khoảng 15–30 giây rồi bấm thử lại nhé!",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi kết nối tới AI khi giải thích điểm số!",
        error: error.message,
      });
    }
  }

  /**
   * Hàm lưu vết lịch sử Hint vào HINT_USAGE
   * Cấu trúc bảng SQL Server: IdUser, IdProblem, IdSubmission, HintContent, CreatedDate
   */
  async _saveHintToDb(idUser, idProblem, hintLevel, replyContent, idSubmission = null) {
    try {
      const pool = await this._getDbPool();
      const request = new sql.Request(pool);

      const formattedHintContent = `[Hint Level ${hintLevel}]\n${replyContent}`;

      request.input("idUser", sql.Int, idUser);
      request.input("idProblem", sql.Int, idProblem);
      request.input("idSubmission", sql.Int, idSubmission ? Number(idSubmission) : null);
      request.input("hintContent", sql.NVarChar, formattedHintContent);

      await request.query(`
        INSERT INTO HINT_USAGE (IdUser, IdProblem, IdSubmission, HintContent, CreatedDate) 
        VALUES (@idUser, @idProblem, @idSubmission, @hintContent, GETDATE())
      `);

      console.log(`[AI DB SUCCESS] Đã ghi lịch sử Hint Level ${hintLevel} vào HINT_USAGE cho User ${idUser}!`);
    } catch (dbSaveErr) {
      console.error("[AI DB ERROR] Lỗi khi lưu vết Hint vào HINT_USAGE:", dbSaveErr.message);
    }
  }

  /**
   * Ghi dữ liệu vào bảng AI_FEEDBACK
   * Đã hỗ trợ ghi nhận ngay cả khi idSubmission = null (lưu IdUser & IdProblem)
   */
  async _saveAiFeedbackToDb({
    analysisContent,
    suggestion = "",
    modelName = "gemini-2.5-flash-lite",
    promptToken = 0,
    completionToken = 0,
    idSubmission = null,
    idUser = null,
    idProblem = null,
  }) {
    try {
      const pool = await this._getDbPool();
      const request = new sql.Request(pool);

      request.input("analysisContent", sql.NVarChar, analysisContent || "");
      request.input("suggestion", sql.NVarChar, suggestion || "");
      request.input("modelName", sql.VarChar, modelName);
      request.input("promptToken", sql.Int, promptToken);
      request.input("completionToken", sql.Int, completionToken);
      request.input("idSubmission", sql.Int, idSubmission ? Number(idSubmission) : null);
      request.input("idUser", sql.Int, idUser ? Number(idUser) : null);
      request.input("idProblem", sql.Int, idProblem ? Number(idProblem) : null);

      await request.query(`
        INSERT INTO AI_FEEDBACK (Analysis_content, Suggestion, Model_name, Prompt_token, Completion_token, CreatedDate, IdSubmission, IdUser, IdProblem)
        VALUES (@analysisContent, @suggestion, @modelName, @promptToken, @completionToken, GETDATE(), @idSubmission, @idUser, @idProblem)
      `);

      console.log(`[AI DB SUCCESS] Đã lưu thành công 1 bản ghi vào AI_FEEDBACK! (User: ${idUser}, Problem: ${idProblem}, Submission: ${idSubmission})`);
    } catch (dbErr) {
      console.error("[AI DB ERROR] Lỗi khi lưu vào AI_FEEDBACK:", dbErr.message);
    }
  }

  /**
   * HÀM ĐÁNH GIÁ CHẤT LƯỢNG CODE (Được gọi trực tiếp từ submissionService)
   */
  async evaluateCodeQuality(codeContent, language = "C#", compileWarningCount = 0) {
    try {
      const systemInstruction = "Bạn là một chuyên gia Review Code trong hệ thống chấm bài tự động. Nhiệm vụ của bạn là đánh giá chất lượng mã nguồn và trả về JSON chuẩn.";

      const prompt = `
Hãy đánh giá chất lượng mã nguồn (Code Quality) dưới đây viết bằng ngôn ngữ ${language} trên thang điểm từ 0 đến 100.

CÁC TIÊU CHÍ ĐÁNH GIÁ (Thang điểm 100):
1. Warning nghiêm trọng: Code có tiềm ẩn lỗi nguy hiểm hoặc có cảnh báo compiler không? (Số warning phát hiện: ${compileWarningCount})
2. Naming Convention: Cách đặt tên biến, tên hàm có rõ nghĩa và theo đúng quy ước của ${language} không? (tránh tên biến vô nghĩa như a, b, c1, x2...)
3. Code Duplication: Có bị lặp code thừa thãi không?
4. Function Organization & Structure: Tổ chức hàm có hợp lý, tối ưu, modular không?
5. Readability & Clean Code: Code có dễ đọc, định dạng sạch sẽ, thụt lề chuẩn không?

MÃ NGUỒN CẦN ĐÁNH GIÁ:
\`\`\`${language.toLowerCase()}
${codeContent}
\`\`\`

YÊU CẦU ĐẦU RA (BẮT BUỘC CHỈ TRẢ VỀ DẠNG JSON NÀY, KHÔNG CHỨA KHỐI MARKDOWN CODEBLOCK, KHÔNG CHỨA CHỮ NGOÀI JSON):
{
  "score": <số nguyên từ 0 đến 100>,
  "feedback": "<Nhận xét ngắn gọn 1-2 câu bằng tiếng Việt chỉ ra điểm tốt và điểm cần cải thiện>"
}
`;

      if (ENABLE_MOCK_AI) {
        return { score: 85, feedback: "[MOCK] Code trình bày khá ổn và rõ ràng." };
      }

      const aiResponseText = await this._callGeminiWithKeyRotation(prompt, systemInstruction);

      const cleanJsonString = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJsonString);

      return {
        score: Math.min(100, Math.max(0, parsedData.score ?? 80)),
        feedback: parsedData.feedback || "Code trình bày khá ổn.",
      };
    } catch (error) {
      console.error("⚠️ Lỗi AI Code Quality (ai.controller):", error.message);
      const fallbackScore = Math.max(0, 100 - compileWarningCount * 10);
      return {
        score: fallbackScore,
        feedback: "Chưa thể phân tích chi tiết bằng AI.",
      };
    }
  }
}

module.exports = new AiController();