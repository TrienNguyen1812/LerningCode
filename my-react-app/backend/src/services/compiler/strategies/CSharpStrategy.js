const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { execFile } = require("child_process");
const BaseStrategy = require("./BaseStrategy");

class CSharpStrategy extends BaseStrategy {
  async execute(studentCode, testCaseInput = "") {
    // Kiểm tra nếu code rỗng hoặc chỉ có khoảng trắng
    if (!studentCode || studentCode.trim() === "") {
      return {
        status: "Compile Error",
        output: "Lỗi biên dịch: Mã nguồn đang để trống!",
        executionTime: "0.00s",
      };
    }

    const runId = uuidv4();
    const tempDir = path.join(process.cwd(), "temp_codes", runId);
    const templateDir = path.join(process.cwd(), "template", "CSharpTemplate");

    let shouldCleanup = false;

    try {
      if (!(await fs.pathExists(templateDir))) {
        throw new Error(
          `Không tìm thấy thư mục cấu trúc mẫu tại: ${templateDir}`
        );
      }

      // 1. Copy khuôn mẫu sang thư mục tạm ở Host
      await fs.copy(templateDir, tempDir);

      // Xóa sạch bin/obj và các file .cs cũ
      await fs.remove(path.join(tempDir, "bin"));
      await fs.remove(path.join(tempDir, "obj"));

      const existingFiles = await fs.readdir(tempDir);
      for (const file of existingFiles) {
        if (file.endsWith(".cs")) {
          await fs.remove(path.join(tempDir, file));
        }
      }

      // 2. Ghi code sinh viên vào Solution.cs
      await fs.writeFile(
        path.join(tempDir, "Solution.cs"),
        studentCode,
        "utf8"
      );

      // 3. Chuẩn hóa Input Testcase
      let rawInput =
        typeof testCaseInput === "string"
          ? testCaseInput
          : String(testCaseInput || "");

      const normalizedInput = rawInput.replace(/\r\n/g, "\n").trim() + "\n";

      await fs.writeFile(
        path.join(tempDir, "input.txt"),
        normalizedInput,
        "utf8"
      );

      // 4. Chuẩn hóa đường dẫn tuyệt đối cho Docker Volume
      const absoluteTempDir = path.resolve(tempDir).replace(/\\/g, "/");

      // Tối ưu innerCmd: Nếu Build LỖI -> In log và exit 1 ngay lập tức (không bị treo)
      const innerCmd = `cd /app && dotnet build TemplateProject.csproj -c Release --nologo /p:WarningLevel=0 -o bin > build.log 2>&1; BUILD_EXIT_CODE=$?; if [ $BUILD_EXIT_CODE -ne 0 ]; then cat build.log; exit $BUILD_EXIT_CODE; fi; dotnet bin/TemplateProject.dll < input.txt`;

      const dockerArgs = [
        "run",
        "--rm",
        "--memory=512m",
        "--cpus=1.0",
        "--network",
        "none",
        "-e", "DOTNET_CLI_TELEMETRY_OPTOUT=1",
        "-e", "DOTNET_ENABLE_DIAGNOSTICS=0",
        "-v",
        `${absoluteTempDir}:/app`,
        "mcr.microsoft.com/dotnet/sdk:6.0",
        "sh",
        "-c",
        innerCmd,
      ];

      const startTime = Date.now();

      // 5. Chạy bằng execFile
      const execResult = await new Promise((resolve) => {
        execFile(
          "docker",
          dockerArgs,
          { timeout: 30000, maxBuffer: 10 * 1024 * 1024 }, // Timeout 30s
          (error, stdout, stderr) => {
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            // TH1: Timeout (TLE)
            if (error && error.killed) {
              return resolve({
                isError: true,
                status: "Time Limit Exceeded",
                output: `Time Limit Exceeded: Mã nguồn chạy quá thời gian giới hạn (${duration}s).`,
                duration: `${duration}s`,
              });
            }

            const rawOutput = (stdout || "").toString();
            const rawStderr = (stderr || "").toString();

            // Hàm lọc nâng cao: Xóa đuôi [.csproj], Warning(s), Error(s), build log rác
            const cleanLogText = (text) => {
              if (!text) return "";
              return text
                .split(/\r?\n/)
                .map((line) => {
                  let l = line.replace(/.*[\\\/]temp_codes[\\\/][^\\\/]+[\\\/]/g, "");
                  l = l.replace(/\s*\[.*?\.csproj\]/g, "");
                  return l;
                })
                .filter((line) => {
                  const l = line.trim();
                  return (
                    l.length > 0 &&
                    !l.startsWith("Command failed:") &&
                    !l.startsWith("app ") &&
                    !l.includes("mcr.microsoft.com") &&
                    !l.includes("Microsoft (R) Build Engine") &&
                    !l.includes("Copyright (C) Microsoft") &&
                    !l.includes("Build FAILED") &&
                    !l.includes("Time Elapsed") &&
                    !/^\d+\s+Warning\(s\)/i.test(l) &&
                    !/^\d+\s+Error\(s\)/i.test(l) &&
                    !l.startsWith("Determining projects to restore") &&
                    !l.startsWith("All projects are up-to-date")
                  );
                })
                .join("\n")
                .trim();
            };

            // TH2: Lỗi Build hoặc Lỗi Runtime
            if (error) {
              const cleanErrOutput = cleanLogText(rawOutput || rawStderr);

              const isCompileError =
                cleanErrOutput.includes(": error CS") ||
                cleanErrOutput.includes("Build FAILED") ||
                cleanErrOutput.includes("error MSB");

              return resolve({
                isError: true,
                status: isCompileError ? "Compile Error" : "Runtime Error",
                output:
                  cleanErrOutput ||
                  "Lỗi cú pháp C# hoặc Lỗi thực thi (Runtime Error).",
                duration: `${duration}s`,
              });
            }

            // TH3: Chạy thành công
            let cleanSuccessOutput = cleanLogText(rawOutput);

            if (!cleanSuccessOutput || cleanSuccessOutput.trim() === "") {
              cleanSuccessOutput = "(Chương trình không in ra gì)";
            }

            resolve({
              isError: false,
              status: "Success",
              output: cleanSuccessOutput,
              duration: `${duration}s`,
            });
          }
        );
      });

      if (execResult.isError) {
        shouldCleanup = false;
        return {
          status: execResult.status,
          output: execResult.output,
          executionTime: execResult.duration || "0.00s",
        };
      }

      shouldCleanup = true;
      return {
        status: "Success",
        output: execResult.output,
        executionTime: execResult.duration,
      };
    } catch (catchError) {
      shouldCleanup = false;
      return {
        status: "Error",
        output: catchError.message,
        executionTime: "0.00s",
      };
    } finally {
      if (shouldCleanup && (await fs.pathExists(tempDir))) {
        setTimeout(async () => {
          try {
            await fs.remove(tempDir);
          } catch (cleanupError) {}
        }, 300);
      }
    }
  }
}

module.exports = CSharpStrategy;