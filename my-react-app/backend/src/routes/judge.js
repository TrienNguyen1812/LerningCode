const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db"); 
const CompilerFactory = require("../services/compiler/CompilerFactory");
const CompilerContext = require("../services/compiler/CompilerContext");

router.post("/execute", async (req, res) => {
  const { code, language, problemId, action } = req.body;

  try {
    console.log(`[JUDGE] Nhận lệnh ${action} bài tập ID: ${problemId}`);
    
    // 1. KẾT NỐI DB VÀ LẤY CÁC TEST CASE THUỘC BÀI TẬP ĐANG LÀM
    const pool = await poolPromise;
    const dbResult = await pool.request()
      .input("idProblem", sql.Int, problemId)
      .query(`
        SELECT InputData, OutputData, IsHidden 
        FROM TEST_CASE 
        WHERE IdProblem = @idProblem 
        ORDER BY Order_index ASC
      `);

    if (dbResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Bài tập này chưa được cấu hình test case trong hệ thống." 
      });
    }

    // 2. PHÂN LOẠI XỬ LÝ THEO HÀNH ĐỘNG (RUN hoặc SUBMIT)
    let testCaseInput = "";
    let expectedOutput = "";

    if (action === "RUN") {
      // Khi Sinh viên bấm "Run Code": Chỉ chạy thử nghiệm với Test Case công khai đầu tiên (IsHidden = 0)
      const publicTestCase = dbResult.recordset.find(tc => tc.IsHidden === false || tc.IsHidden === 0) 
                             || dbResult.recordset[0]; 
      
      testCaseInput = publicTestCase.InputData ? publicTestCase.InputData.toString().trim() : "";
      expectedOutput = publicTestCase.OutputData ? publicTestCase.OutputData.toString().trim() : "";
    } else {
      // Khi Sinh viên bấm "Submit": Lấy test case đầu tiên (hoặc vòng lặp xử lý sau)
      const submitTestCase = dbResult.recordset[0];
      testCaseInput = submitTestCase.InputData ? submitTestCase.InputData.toString().trim() : "";
      expectedOutput = submitTestCase.OutputData ? submitTestCase.OutputData.toString().trim() : "";
    }

    console.log(`-> Đang chạy Test Case Input: "${testCaseInput}" | Kỳ vọng Output: "${expectedOutput}"`);

    // 3. KHỞI TẠO VÀ CHẠY COMPILER STRATEGY
    const strategy = CompilerFactory.getStrategy(language);
    const context = new CompilerContext();
    context.setStrategy(strategy);
    
    // Truyền dữ liệu đầu vào lấy từ DB vào Compiler
    const result = await context.executeCode(code, testCaseInput); 

    // Gán sẵn dữ liệu mẫu ban đầu từ DB vào result để kể cả khi LỖI hoặc SUCCESS đều có dữ liệu map lên Frontend
    result.testCaseInput = testCaseInput;
    result.expectedOutput = expectedOutput.trim();
    result.actualOutput = ""; // Mặc định rỗng

    // 4. KIỂM TRA SO SÁNH KẾT QUẢ (SO KHỚP ĐẦU RA + LỌC WARNING C#)
    if (result.status === "Success") {
      // Tách chuỗi kết quả thành các dòng riêng biệt
      const lines = result.output ? result.output.split(/\r?\n/) : [];
      
      // 🌟 LỌC BỎ WARNING: Quét sạch các dòng chứa thông tin cảnh báo Roslyn Compiler
      const cleanLines = lines.filter(line => 
        !line.includes("warning CS") && 
        !line.includes("TemplateProject.csproj") &&
        line.trim() !== ""
      );

      // Nối lại thành kết quả đầu ra thực tế sạch sẽ của sinh viên
      const actualOutput = cleanLines.join("\n").trim();
      const cleanExpected = expectedOutput.trim();

      // Cập nhật lại kết quả thực tế chạy được
      result.actualOutput = actualOutput;

      if (actualOutput === cleanExpected) {
        result.isCorrect = true;
        result.status = "Success";
        result.output = "Kết quả chính xác!";
      } else {
        result.isCorrect = false;
        result.status = "Wrong Answer"; // Trạng thái Wrong Answer để hiển thị bảng so khớp kết quả
        result.output = "Sai kết quả so với đáp án mẫu.";
      }
    } else {
      // 🌟 KHỐI XỬ LÝ KHI SINH VIÊN BỊ LỖI BIÊN DỊCH THỰC SỰ
      result.isCorrect = false;

      let rawError = result.output || "Compilation Error: Lỗi cấu trúc cú pháp mã nguồn.";

      if (typeof rawError === "string") {
        // 1. Loại bỏ đường dẫn tuyệt đối đến thư mục temp_codes
        rawError = rawError.replace(/.*[\\\/]temp_codes[\\\/][^\\\/]+[\\\/]/g, "");

        // 2. Tách dòng để lọc bỏ sạch các dòng báo lỗi hệ thống thừa thãi của Node/dotnet
        const errorLines = rawError.split(/\r?\n/);
        const cleanErrorLines = errorLines.filter(line => {
          const l = line.trim();
          return (
            l !== "" &&
            !l.includes("The build failed.") &&
            !l.includes("Command failed:") &&
            !l.includes("dotnet run --project") &&
            !l.includes("TemplateProject.csproj]")
          );
        });

        rawError = cleanErrorLines.join("\n");
      }

      // Đẩy thông tin lỗi sạch sẽ vào ô Compile Message
      result.output = rawError.trim() || "Lỗi cú pháp (Thiếu dấu ;, dấu ngoặc hoặc sai tên hàm).";
    }
    
    return res.json({ 
      success: true, 
      data: result 
    });

  } catch (error) {
    console.error("[JUDGE ERROR]:", error.message);
    
    // Dự phòng trường hợp lỗi phát sinh ngoài luồng chạy compiler chiến lược
    return res.json({ 
      success: true, 
      data: {
        status: "Error",
        isCorrect: false,
        testCaseInput: testCaseInput || "",
        expectedOutput: (expectedOutput || "").trim(),
        actualOutput: "",
        output: `Hệ thống gặp sự cố: ${error.message}`
      }
    });
  }
});

module.exports = router;