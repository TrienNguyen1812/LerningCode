const testCaseRepository = require("../repositories/testCase.repository");
const submissionRepository = require("../repositories/submission.repository");
const userProgressRepository = require("../repositories/userProgress.repository");
const CompilerFactory = require("./compiler/CompilerFactory");
const aiController = require("../controllers/ai.controller");

/**
 * =========================================================================
 * BỘ SO KHỚP TỔNG HỢP (ÁP DỤNG ĐỦ 4 THUẬT TOÁN ĐÃ THẢO LUẬN)
 * 1. Chuẩn hóa Văn bản (Text Normalization)
 * 2. Lọc Dòng Rỗng (Empty Line Filtering)
 * 3. Thu gọn Token / Space (Tokenizer & Space Collapse)
 * 4. Sai số Số thực (Floating-Point Error)
 * =========================================================================
 */
function evaluateOutput(actualRaw, expectedRaw, testType = 'EXACT', tolerance = 0.0001) {
  if (actualRaw === null || actualRaw === undefined) return false;
  if (expectedRaw === null || expectedRaw === undefined) return false;

  // BƯỚC 1: ÁP DỤNG 3 THUẬT TOÁN XỬ LÝ CHUỖI & DÒNG
  const normalizePipeline = (rawText) => {
    return rawText
      .replace(/\r\n/g, '\n')           // 1. Chuẩn hóa mọi ngắt dòng về \n
      .split('\n')                      // Tách thành mảng các dòng
      .map(line => line.trim())         // 2. Trim khoảng trắng thừa ở 2 đầu mỗi dòng
      .filter(line => line.length > 0)  // 3. Lọc bỏ hoàn toàn các dòng rỗng
      .join(' ')                        // Nối thành 1 chuỗi nằm trên cùng 1 dòng
      .replace(/\s+/g, ' ')             // 4. Thu gọn nhiều space liên tiếp thành đúng 1 space (Tokenizer)
      .toLowerCase();                   // 5. Hạ chữ thường
  };

  const cleanActual = normalizePipeline(actualRaw);
  const cleanExpected = normalizePipeline(expectedRaw);

  // Nếu đã trùng khớp 100% sau khi chuẩn hóa văn bản -> Trả về TRUE ngay
  if (cleanActual === cleanExpected) {
    return true;
  }

  // BƯỚC 2: ÁP DỤNG THUẬT TOÁN SAI SỐ SỐ THỰC
  // Kích hoạt khi TestType là bài toán số thực HOẶC khi cả 2 chuỗi đều parse ra được số
  const isFloatType = testType === 'FLOAT_TOLERANCE' || testType === 'Số thực';
  
  if (isFloatType || (!isNaN(parseFloat(cleanActual)) && !isNaN(parseFloat(cleanExpected)))) {
    const A = parseFloat(cleanActual);
    const E = parseFloat(cleanExpected);

    if (!isNaN(A) && !isNaN(E)) {
      const absError = Math.abs(A - E);
      const combinedError = absError / Math.max(1.0, Math.abs(E));

      // So sánh sai số kết hợp với ngưỡng cho phép
      if (combinedError <= tolerance) {
        return true;
      }
    }
  }

  return false;
}

class SubmissionService {
  async processSubmission(submissionData) {
    const { idUser, idProblem, codeContent, language, durationInSeconds } =
      submissionData;

    // 1. Lấy danh sách test cases
    const testCases = await testCaseRepository.getTestCasesByProblemId(idProblem);
    if (!testCases || testCases.length === 0) {
      throw new Error("Bài toán chưa cấu hình test case.");
    }

    // 2. Lấy Compiler Strategy & Tạo Submission ban đầu
    const compilerStrategy = CompilerFactory.getStrategy(language);
    const idSubmission = await submissionRepository.createInitialSubmission({
      codeContent,
      language,
      idUser,
      idProblem,
      durationInSeconds: durationInSeconds || 0,
    });

    // 3. Tính Tổng Trọng Số (Weights) Toàn Bộ Bài Tập
    const totalMaxWeight = testCases.reduce((sum, tc) => {
      return sum + (parseFloat(tc.Weight ?? tc.weight) || 1.0);
    }, 0);

    let earnedWeight = 0;
    let passCount = 0;
    let hasCompileError = false;
    let hasRuntimeOrTimeoutError = false;
    let compileWarningCount = 0;
    let finalStatus = "Accepted";

    const executionResults = [];

    // 4. Chạy thực thi tuần tự các test case
    for (const tc of testCases) {
      const input = tc.InputData ?? tc.inputData ?? "";
      const expectedOut = tc.OutputData ?? tc.outputData ?? "";
      const currentWeight = parseFloat(tc.Weight ?? tc.weight) || 1.0;
      const testCaseId = tc.IdTestCase ?? tc.idTestCase;
      
      // Lấy TestType và Tolerance từ CSDL (nếu không có thì dùng mặc định)
      const testType = tc.TestType ?? tc.testType ?? 'EXACT';
      const tolerance = parseFloat(tc.Tolerance ?? tc.tolerance) || 0.0001;

      const result = await compilerStrategy.execute(codeContent, input);

      let isPassed = false;
      let errorMessage = "";
      let rawOutput = result.output || "";

      // Đếm warning compiler
      let actualOutput = rawOutput
        .split(/\r?\n/)
        .filter((line) => !line.includes("warning CS") && !line.includes(".cs("))
        .join("\n");

      if (rawOutput.includes("warning CS")) {
        compileWarningCount++;
      }

      // Xử lý các loại Lỗi Thực Thi
      if (result.status === "Compile Error" || result.status === "Error") {
        finalStatus = "Compile Error";
        errorMessage = result.output;
        hasCompileError = true;

        executionResults.push({
          idTestCase: testCaseId,
          actualOutput: "",
          isPassed: 0,
          memoryUsed: 0,
          executionTime: 0,
          errorMessage,
          scoreEarned: 0,
          weight: currentWeight,
          inputData: input,
          expectedOutput: expectedOut,
        });

        // Lỗi biên dịch -> Dừng chấm ngay lập tức
        break;
      }

      if (result.status === "Time Limit Exceeded") {
        if (finalStatus === "Accepted") finalStatus = "Time Limit Exceeded";
        errorMessage = "Time Limit Exceeded";
        hasRuntimeOrTimeoutError = true;
      } else {
        // =========================================================================
        // 🌟 SỬ DỤNG HÀM SO KHỚP MỚI TẠI ĐÂY (THAY CHO ĐOẠN cleanActual === cleanExpected BỊ LỖI CŨ)
        // =========================================================================
        isPassed = evaluateOutput(actualOutput, expectedOut, testType, tolerance);

        if (isPassed) {
          passCount++;
          earnedWeight += currentWeight;
        } else {
          if (finalStatus === "Accepted") finalStatus = "Wrong Answer";
        }
      }

      executionResults.push({
        idTestCase: testCaseId,
        actualOutput,
        isPassed: isPassed ? 1 : 0,
        memoryUsed: result.memory || 0,
        executionTime: result.timeElapsed || 0,
        errorMessage,
        scoreEarned: isPassed ? currentWeight : 0,
        weight: currentWeight,
        inputData: input,
        expectedOutput: expectedOut,
      });
    }

    if (passCount < testCases.length && finalStatus === "Accepted") {
      finalStatus = "Wrong Answer";
    }

    // ==========================================
    // 5. TÍNH CHỈ SỐ THEO ĐÚNG CÔNG THỨC YÊU CẦU
    // ==========================================

    // a. Correctness (0 - 100 điểm): Tính theo tổng trọng số test case vượt qua
    const correctnessScore =
      totalMaxWeight > 0
        ? parseFloat(((earnedWeight / totalMaxWeight) * 100).toFixed(2))
        : 0;

    // b. Reliability (0 - 100 điểm): Đánh giá độ ổn định thực thi
    let reliabilityScore = 100;
    if (hasCompileError) {
      reliabilityScore = 0;
    } else {
      if (hasRuntimeOrTimeoutError) reliabilityScore -= 20;
      if (passCount < testCases.length) {
        reliabilityScore -= Math.round(
          ((testCases.length - passCount) / testCases.length) * 50
        );
      }
    }
    reliabilityScore = Math.max(0, reliabilityScore);

    // c. Code Quality (0 - 100 điểm): Đánh giá bằng AI thông qua aiController
    let codeQualityScore = 0;
    let aiFeedback = "";

    if (hasCompileError) {
      codeQualityScore = 0;
      aiFeedback = "Code bị lỗi biên dịch, chưa thể phân tích chất lượng.";
    } else {
      const aiEval = await aiController.evaluateCodeQuality(
        codeContent,
        language,
        compileWarningCount
      );
      codeQualityScore = aiEval.score;
      aiFeedback = aiEval.feedback;
    }

    // d. Final Score (Thang điểm 10)
    const finalScore = parseFloat(
      (
        (0.8 * correctnessScore +
          0.1 * reliabilityScore +
          0.1 * codeQualityScore) /
        10
      ).toFixed(2)
    );

    const scores = {
      correctnessScore,
      reliabilityScore,
      codeQualityScore,
      finalScore,
      aiFeedback,
    };

    // ==========================================
    // 6. LƯU DATABASE & CẬP NHẬT TIẾN ĐỘ NGƯỜI DÙNG
    // ==========================================
    await submissionRepository.updateFinalSubmission(idSubmission, finalStatus, scores);
    await submissionRepository.saveExecutionResults(idSubmission, executionResults);

    const usedHintCount = await submissionRepository.getUsedHintCount(idUser, idProblem);
    let independenceLevel = "Rất cao";
    if (usedHintCount >= 3) independenceLevel = "Cần hỗ trợ";
    else if (usedHintCount > 0) independenceLevel = "Thường";

    const isPassedAllTests = passCount === testCases.length && finalStatus === "Accepted";

    const progress = await userProgressRepository.updateProgress(
      idUser,
      idProblem,
      finalScore,
      independenceLevel,
      usedHintCount,
      durationInSeconds || 0,
      isPassedAllTests
    );

    // 7. Trả về Response cho Frontend React
    return {
      idSubmission,
      status: finalStatus,
      passCount,
      totalTestCases: testCases.length,
      scores: {
        ...scores,
        usedHintCount,
      },
      progress,
      testCaseDetails: executionResults.map((item, index) => ({
        name: `Test case ${index + 1}`,
        input: item.inputData,
        expectedOutput: item.expectedOutput,
        actualOutput: item.actualOutput,
        isPassed: item.isPassed === 1,
        errorMessage: item.errorMessage,
        status: item.errorMessage ? "Error" : "Success",
        weight: item.weight,
      })),
    };
  }
}

module.exports = new SubmissionService();