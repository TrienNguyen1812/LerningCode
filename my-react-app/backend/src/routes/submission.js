const express = require("express");
// 🌟 THAY ĐỔI 1: Import sql và poolPromise từ file db.js (Điều chỉnh lại đường dẫn ../db cho đúng với cấu trúc thư mục của bạn)
const { sql, poolPromise } = require("../config/db"); 
const CSharpStrategy = require("../services/compiler/strategies/CSharpStrategy");

const router = express.Router();

// 🚀 API ENDPOINT: POST /api/submissions/submit
router.post("/submit", async (req, res) => {
  const { idUser, idProblem, codeContent, language } = req.body;

  try {
    // 🌟 THAY ĐỔI 2: Chờ kết nối database từ poolPromise sẵn sàng
    const pool = await poolPromise;
    if (!pool) {
      return res.status(500).json({ success: false, message: "Không thể kết nối đến cơ sở dữ liệu." });
    }

    // 🌟 THAY ĐỔI 3: Tạo request an toàn trực tiếp từ pool (sử dụng msnodesqlv8)
    const request = pool.request();

    // 1. Lấy toàn bộ Test Cases của bài toán
    const testCasesResult = await request
      .input("IdProblem", sql.Int, idProblem)
      .query(
        "SELECT IdTestCase, InputData, OutputData, IsHidden FROM TEST_CASE WHERE IdProblem = @IdProblem"
      );

    const testCases = testCasesResult.recordset;

    if (!testCases || testCases.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Bài toán chưa cấu hình test case." });
    }

    // 2. Khởi tạo Strategy tương ứng (Strategy Pattern)
    let compilerStrategy;
    const langLower = language.toLowerCase();
    if (langLower === "csharp" || langLower === "c#") {
      compilerStrategy = new CSharpStrategy();
    } else if (langLower === "javascript" || langLower === "js") {
      compilerStrategy = new JavaScriptStrategy();
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Ngôn ngữ không được hỗ trợ." });
    }

    // 3. Tạo bản ghi ban đầu trong bảng SUBMISSION với trạng thái 'Judging'
    const submissionRequest = pool.request();
    const submissionInsert = await submissionRequest
      .input("Code_content", sql.NVarChar(sql.MAX), codeContent)
      .input("Language", sql.NVarChar(20), language)
      .input("Status", sql.NVarChar(30), "Judging")
      .input("SubmitDate", sql.DateTime, new Date())
      .input("IdUser", sql.Int, idUser)
      .input("IdProblem", sql.Int, idProblem).query(`
        INSERT INTO SUBMISSION (Code_content, Language, Status, SubmitDate, IdUser, IdProblem)
        OUTPUT INSERTED.IdSubmission
        VALUES (@Code_content, @Language, @Status, @SubmitDate, @IdUser, @IdProblem)
      `);

    const idSubmission = submissionInsert.recordset[0].IdSubmission;

    // 4. Duyệt qua từng Test Case để chấm bài ngầm tuần tự
    let allPassed = true;
    let finalStatus = "Accepted";
    const executionResults = [];

    for (const tc of testCases) {
      const result = await compilerStrategy.execute(codeContent, tc.InputData);

      let isPassed = false;
      let errorMessage = "";
      let rawOutput = result.output || "";

      // 🌟 KHẮC PHỤC CHÍNH: Lọc bỏ dòng cảnh báo (Warning) của trình biên dịch C# (.NET)
      // Tách chuỗi thành từng dòng, loại bỏ các dòng chứa mã lỗi/cảnh báo compiler như 'warning CS', 'Solution.cs('
      let actualOutput = rawOutput
        .split(/\r?\n/)
        .filter(line => !line.includes("warning CS") && !line.includes(".cs("))
        .join("\n");

      if (result.status === "Time Limit Exceeded") {
        allPassed = false;
        finalStatus = "Time Limit Exceeded";
        errorMessage = result.output;
      } else if (result.status === "Error") {
        allPassed = false;
        finalStatus = "Compile Error";
        errorMessage = result.output;
      } else {
        const cleanActual = actualOutput.trim().replace(/\r?\n/g, "\n");
        const cleanExpected = tc.OutputData.trim().replace(/\r?\n/g, "\n");

        if (cleanActual === cleanExpected) {
          isPassed = true;
        } else {
          allPassed = false;
          if (finalStatus === "Accepted") finalStatus = "Wrong Answer";
        }
      }

      executionResults.push({
        idTestCase: tc.IdTestCase,
        actualOutput: actualOutput, // Lưu output đã được làm sạch vào DB và hiển thị UI
        isPassed: isPassed ? 1 : 0,
        memoryUsed: result.memory || 0,
        executionTime: result.timeElapsed || 0,
        errorMessage: errorMessage,
      });
    }

    if (!allPassed && finalStatus === "Accepted") {
      finalStatus = "Wrong Answer";
    }

    // 5. Cập nhật trạng thái tổng cuối cùng cho bản ghi SUBMISSION
    const updateRequest = pool.request();
    await updateRequest
      .input("IdSubmission", sql.Int, idSubmission)
      .input("Status", sql.NVarChar(30), finalStatus)
      .query(
        "UPDATE SUBMISSION SET Status = @Status WHERE IdSubmission = @IdSubmission"
      );

    // 6. Lưu kết quả chi tiết của từng Test Case vào bảng Execution_Result
    for (const resItem of executionResults) {
      const resultInsertRequest = pool.request();
      await resultInsertRequest
        .input("Actual_output", sql.VarChar(sql.MAX), resItem.actualOutput)
        .input("Is_passed", sql.Bit, resItem.isPassed)
        .input("Memory_used", sql.Int, resItem.memoryUsed)
        .input("Execution_time", sql.Int, resItem.executionTime)
        .input("Error_message", sql.NVarChar(sql.MAX), resItem.errorMessage)
        .input("IdTestCase", sql.Int, resItem.idTestCase)
        .input("IdSubmission", sql.Int, idSubmission).query(`
          INSERT INTO Execution_Result (Actual_output, Is_passed, Memory_used, Execution_time, Error_message, IdTestCase, IdSubmission)
          VALUES (@Actual_output, @Is_passed, @Memory_used, @Execution_time, @Error_message, @IdTestCase, @IdSubmission)
        `);
    }

    // 7. Trả dữ liệu thống kê về cho React hiển thị lên UI
    return res.json({
      success: true,
      message: "Chấm bài hoàn tất!",
      data: {
        idSubmission,
        status: finalStatus,
        totalTestCases: testCases.length,
        passCount: executionResults.filter((r) => r.isPassed === 1).length,
        testCaseDetails: executionResults.map((item, index) => {
          const originalTC = testCases.find(
            (t) => t.IdTestCase === item.idTestCase
          );
          return {
            name: `Test case ${index + 1}`,
            input: originalTC ? originalTC.InputData : "",
            expectedOutput: originalTC ? originalTC.OutputData : "",
            actualOutput: item.actualOutput,
            isPassed: item.isPassed === 1,
            errorMessage: item.errorMessage,
            status: item.errorMessage ? "Error" : "Success",
          };
        }),
      },
    });
  } catch (error) {
    console.error("SUBMIT CODE ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Lỗi hệ thống khi chấm bài." });
  }
});

module.exports = router;