const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { execSync } = require("child_process");
const BaseStrategy = require("./BaseStrategy");

class CSharpStrategy extends BaseStrategy {
  // 🌟 NHẬN THÊM THAM SỐ testCaseInput TỪ CONTEXT TRUYỀN XUỐNG
  async execute(studentCode, testCaseInput = "") {
    const runId = uuidv4();
    const tempDir = path.join(process.cwd(), "temp_codes", runId);
    const templateDir = path.join(process.cwd(), "template", "CSharpTemplate");

    try {
      if (!(await fs.pathExists(templateDir))) {
        throw new Error(
          `Không tìm thấy thư mục cấu trúc mẫu tại: ${templateDir}`,
        );
      }

      // 1. Copy khuôn mẫu sang thư mục tạm
      await fs.copy(templateDir, tempDir);

      // 2. Điền code sinh viên vào file Solution.cs
      await fs.writeFile(
        path.join(tempDir, "Solution.cs"),
        studentCode,
        "utf8",
      );

      // 3. THỰC THI ĐỒNG BỘ VÀ BƠM INPUT TỰ ĐỘNG
      const projectPath = path.join(tempDir, "TemplateProject.csproj");

      // Chạy lệnh biên dịch và trả kết quả đồng bộ
      const stdout = execSync(
        `dotnet run --project "${projectPath}" --no-launch-profile`,
        {
          input: testCaseInput,
          timeout: 4000,
          encoding: "utf8",
        },
      );

      return { status: "Success", output: stdout };
    } catch (catchError) {
      console.error("[CSHARP COMPILER STRATEGY ERROR]:", catchError.message);

      // 🌟 1. KHẮC PHỤC LỖI TREO: Kiểm tra nếu lỗi do chạy quá thời gian (Timeout / Vòng lặp vô hạn)
      if (catchError.code === "ETIMEDOUT" || catchError.signal === "SIGTERM" || catchError.message.includes("ETIMEDOUT")) {
        return {
          status: "Time Limit Exceeded", // Trạng thái TLE kinh điển của các hệ thống chấm bài
          output: "❌ Time Limit Exceeded: Mã nguồn chạy quá thời gian giới hạn (Tối đa 4 giây). Vui lòng kiểm tra lại vòng lặp vô hạn hoặc cấu trúc thuật toán!",
        };
      }

      // 🌟 2. TRƯỜNG HỢP LỖI BIÊN DỊCH THÔNG THƯỜNG (Compile Error / Syntax Error)
      // Gom sạch dữ liệu lỗi thô xuất ra từ console (cả luồng stdout và stderr) khi lệnh build thất bại
      const detailedError = 
        (catchError.stdout ? catchError.stdout.toString() : "") + "\n" + 
        (catchError.stderr ? catchError.stderr.toString() : "");

      return {
        status: "Error",
        output: detailedError.trim() || catchError.message,
      };
    } finally {
      // 🌟 GIẢI PHÁP: Đợi 200ms để Windows giải phóng file .exe chạy ngầm trước khi xóa
      if (await fs.pathExists(tempDir)) {
        setTimeout(async () => {
          try {
            await fs.remove(tempDir);
          } catch (cleanupError) {
            console.warn(
              "[CLEANUP WARNING]: Chưa xóa được thư mục tạm ngay lập tức, Windows đang bận.",
              cleanupError.message,
            );
          }
        }, 200);
      }
    }
  }
}

module.exports = CSharpStrategy;
