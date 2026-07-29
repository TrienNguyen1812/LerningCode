// controllers/judge.controller.js
const testCaseRepository = require("../repositories/testCase.repository");
const CompilerFactory = require("../services/compiler/CompilerFactory");
const CompilerContext = require("../services/compiler/CompilerContext");

// Import AiController để gọi lại khi client yêu cầu /api/judges/ai-feedback
const aiController = require("./ai.controller");

class JudgeController {
  constructor() {
    this.executeCode = this.executeCode.bind(this);
    this.getAiFeedback = this.getAiFeedback.bind(this);
  }

  /**
   * Chuyển tiếp yêu cầu gọi AI sang AiController
   * Endpoint: POST /api/judges/ai-feedback
   */
  async getAiFeedback(req, res) {
    return await aiController.getAiFeedback(req, res);
  }

  /**
   * API Thực thi Code cho việc Chạy thử (RUN) hoặc Nộp bài (SUBMIT)
   * Endpoint: POST /api/judges/execute
   */
  async executeCode(req, res) {
    const { code, language, problemId, idProblem, action = "RUN" } = req.body;
    const targetProblemId = problemId || idProblem;

    try {
      console.log(`[JUDGE] Nhận lệnh ${action} bài tập ID: ${targetProblemId}`);

      // 1. Lấy tất cả Test Cases từ DB
      const allTestCases = await testCaseRepository.getTestCasesByProblemId(targetProblemId);

      if (!allTestCases || allTestCases.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Bài tập này chưa được cấu hình test case trong hệ thống.",
        });
      }

      // 2. Chạy tất cả test case
      const selectedTestCases = allTestCases;

      // 3. Khởi tạo Compiler Engine
      const strategy = CompilerFactory.getStrategy(language);
      const context = new CompilerContext();
      context.setStrategy(strategy);

      const testCaseDetails = [];
      let passCount = 0;
      let globalStatus = "Accepted";
      let compileErrorMessage = "";
      let maxExecutionTimeSeconds = 0;

      // 4. Lặp qua từng Test Case để thực thi
      for (let index = 0; index < selectedTestCases.length; index++) {
        const tc = selectedTestCases[index];
        const rawInput = tc.inputData ?? tc.InputData ?? tc.input ?? tc.Input_data ?? "";
        const rawOutput = tc.outputData ?? tc.OutputData ?? tc.output ?? tc.Expected_output ?? "";

        const inputStr = String(rawInput).replace(/\r\n/g, "\n").trim();
        const expectedStr = String(rawOutput).trim();
        const isHidden = Boolean(tc.IsHidden ?? tc.isHidden ?? tc.is_hidden ?? false);

        // Chạy code với Compiler
        const execResult = await context.executeCode(code, inputStr);

        // Cập nhật thời gian chạy lớn nhất
        const currentExecTime = parseFloat(execResult.executionTime || "0") || 0;
        if (currentExecTime > maxExecutionTimeSeconds) {
          maxExecutionTimeSeconds = currentExecTime;
        }

        // NẾU GẶP LỖI THỰC THI/BIÊN DỊCH
        if (execResult.status !== "Success") {
          this._handleErrorResult(execResult);

          if (execResult.status === "Compile Error") {
            compileErrorMessage = execResult.output;
            globalStatus = "Compile Error";
            break;
          }

          if (globalStatus === "Accepted") {
            globalStatus = execResult.status;
          }

          const tabLabel = isHidden ? `Test case ${index + 1}` : `Sample Test case ${index + 1}`;

          testCaseDetails.push({
            id: tc.IdTestCase || tc.id || index,
            name: tabLabel,
            isHidden: isHidden,
            isPassed: false,
            input: inputStr,
            expectedOutput: expectedStr,
            actualOutput: execResult.output,
            status: execResult.status,
          });

          break;
        }

        // Trường hợp THỰC THI THÀNH CÔNG -> So sánh Output
        const actualOutput = this._cleanOutput(execResult.output);
        const isPassed = this._normalizeText(actualOutput) === this._normalizeText(expectedStr);

        if (isPassed) {
          passCount++;
        } else if (globalStatus === "Accepted") {
          globalStatus = "Wrong Answer";
        }

        const tabLabel = isHidden ? `Test case ${index + 1}` : `Sample Test case ${index + 1}`;

        testCaseDetails.push({
          id: tc.IdTestCase || tc.id || index,
          name: tabLabel,
          isHidden: isHidden,
          isPassed: isPassed,
          input: inputStr,
          expectedOutput: expectedStr,
          actualOutput: actualOutput,
          status: isPassed ? "Passed" : "Wrong Answer",
        });
      }

      // Chuẩn hóa định dạng chuỗi thời gian hiển thị (VD: "0.45s")
      const formattedExecutionTime = `${maxExecutionTimeSeconds.toFixed(2)}s`;

      // 5. Nếu gặp LỖI BIÊN DỊCH
      if (globalStatus === "Compile Error") {
        return res.json({
          success: true,
          data: {
            status: "Compile Error",
            isCorrect: false,
            message: compileErrorMessage,
            output: compileErrorMessage,
            actualOutput: compileErrorMessage,
            executionTime: "0.00s",
            testCaseDetails: [],
            totalTestCases: selectedTestCases.length,
            passCount: 0,
          },
        });
      }

      // 6. Trả về Response đầy đủ
      const isAllPassed = passCount === selectedTestCases.length;
      const sampleCaseZero = testCaseDetails[0] || {};

      return res.json({
        success: true,
        data: {
          status: isAllPassed ? "Accepted" : globalStatus,
          isCorrect: isAllPassed,
          action: action,
          message: isAllPassed
            ? "Congratulations! You have passed all test cases."
            : globalStatus === "Runtime Error"
            ? "Chương trình gặp lỗi trong quá trình thực thi (Runtime Error)."
            : `Passed ${passCount}/${selectedTestCases.length} test cases.`,

          executionTime: formattedExecutionTime,
          totalTestCases: selectedTestCases.length,
          passCount: passCount,
          testCaseDetails: testCaseDetails,

          testCaseInput: sampleCaseZero.input || "",
          expectedOutput: sampleCaseZero.expectedOutput || "",
          actualOutput: sampleCaseZero.actualOutput || "",
          stdout: sampleCaseZero.actualOutput || "",
        },
      });
    } catch (error) {
      console.error("[JUDGE EXECUTE ERROR]:", error.message);
      return res.json({
        success: false,
        data: {
          status: "Error",
          isCorrect: false,
          executionTime: "0.00s",
          output: `Hệ thống gặp sự cố: ${error.message}`,
          message: error.message,
        },
      });
    }
  }

  /**
   * Hàm làm sạch Output của Compiler
   */
  _cleanOutput(rawOutput) {
    if (!rawOutput) return "";
    const lines = String(rawOutput).split(/\r?\n/);
    const cleanLines = lines.filter(
      (line) =>
        !line.includes("warning CS") &&
        !line.includes("TemplateProject.csproj") &&
        !line.includes("Build succeeded")
    );
    return cleanLines.join("\n").trim();
  }

  /**
   * Hàm chuẩn hóa xuống dòng để so sánh đáp án
   */
  _normalizeText(text) {
    if (!text) return "";
    return text
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .join("\n")
      .trim();
  }

  /**
   * Xử lý & Bóc tách chi tiết Lỗi Biên dịch & Lỗi Runtime
   */
  _handleErrorResult(result) {
    result.isCorrect = false;
    result.actualOutput = "";

    if (result.status === "Time Limit Exceeded") {
      result.output =
        result.output || "Time Limit Exceeded: Mã nguồn chạy quá thời gian giới hạn (Tối đa 30 giây).";
      return;
    }

    let rawError = result.output || "Lỗi thực thi mã nguồn.";

    if (typeof rawError === "string") {
      rawError = rawError.replace(/.*[\\\/]temp_codes[\\\/][^\\\/]+[\\\/]/g, "");

      const errorLines = rawError.split(/\r?\n/);
      const formattedErrors = [];
      let isRuntimeError = false;

      const csErrorRegex = /(?:(\w+\.cs|\w+)\((\d+),(\d+)\):\s*)?error\s+(CS\d+):\s*(.*)/i;

      for (const line of errorLines) {
        const l = line.trim();

        if (
          !l ||
          l.includes("warning CS") ||
          l.includes("The build failed.") ||
          l.includes("Command failed:") ||
          l.includes("dotnet run --project") ||
          l.includes("TemplateProject.csproj]") ||
          l.startsWith("at System.") ||
          l.startsWith("at Program.")
        ) {
          continue;
        }

        const match = l.match(csErrorRegex);
        if (match) {
          const lineNum = match[2];
          const colNum = match[3];
          const errCode = match[4];
          const errMessage = match[5];

          if (lineNum) {
            formattedErrors.push(`• Dòng ${lineNum}, Cột ${colNum} [${errCode}]: ${errMessage}`);
          } else {
            formattedErrors.push(`• [${errCode}]: ${errMessage}`);
          }
        } else if (l.includes("Unhandled exception") || l.includes("Exception:")) {
          isRuntimeError = true;
          let cleanMsg = l.replace(/^Unhandled exception\.\s*/i, "");

          if (cleanMsg.includes("System.FormatException")) {
            formattedErrors.push(
              "• Lỗi định dạng dữ liệu (System.FormatException): Dữ liệu nhập vào không phải là số hợp lệ hoặc bị rỗng."
            );
          } else if (cleanMsg.includes("System.IndexOutOfRangeException")) {
            formattedErrors.push(
              "• Lỗi mảng (System.IndexOutOfRangeException): Truy cập vượt quá chỉ số mảng."
            );
          } else if (cleanMsg.includes("System.NullReferenceException")) {
            formattedErrors.push(
              "• Lỗi tham chiếu null (System.NullReferenceException): Đối tượng chưa được khởi tạo."
            );
          } else if (cleanMsg.includes("System.DivideByZeroException")) {
            formattedErrors.push("• Lỗi chia cho 0 (System.DivideByZeroException).");
          } else {
            formattedErrors.push(`• ${cleanMsg}`);
          }
        }
      }

      if (isRuntimeError) {
        result.status = "Runtime Error";
        result.output =
          formattedErrors.length > 0
            ? "Chi tiết lỗi trong quá trình thực thi (Runtime Error):\n" + formattedErrors.join("\n")
            : "Chi tiết lỗi trong quá trình thực thi (Runtime Error):\n• Chương trình bị dừng đột ngột do lỗi xử lý dữ liệu đầu vào.";
      } else {
        result.status = "Compile Error";
        result.output =
          formattedErrors.length > 0
            ? "Chi tiết lỗi cú pháp:\n" + formattedErrors.join("\n")
            : rawError.trim() || "Lỗi cú pháp (Thiếu dấu ;, ngoặc hoặc sai tên hàm).";
      }
    }
  }
}

module.exports = new JudgeController();