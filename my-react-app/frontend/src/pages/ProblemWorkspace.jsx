import { useState, useEffect } from "react";
import WorkspaceHeader from "../component/WorkspaceHeader";
import ProblemDescription from "../component/ProblemDescription";
import CodeEditor from "../component/CodeEditor";
import AIAssistantPopup from "../component/AIAssistant";

export default function ProblemWorkspacePage({ problem, onExitWorkspace }) {
  const [showAI, setShowAI] = useState(false);

  // Quản lý trạng thái UI
  const [theme, setTheme] = useState("vs-light");
  const [language, setLanguage] = useState("csharp");
  const [code, setCode] = useState("");

  // Quản lý kết quả chấm bài
  const [showTestCases, setShowTestCases] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // 🌟 NÂNG CẤP STATE OUTPUT: Lưu đối tượng dữ liệu phong phú từ Judge Backend
  const [output, setOutput] = useState(null);
  
  // 🌟 QUẢN LÝ TAB TEST CASE ĐANG CHỌN (Hình 3)
  const [activeTab, setActiveTab] = useState(0);

  // Load sample code từ DB khi bài tập thay đổi
  useEffect(() => {
    if (problem) {
      setCode(problem.sampleCode || "// Viết code của bạn tại đây...");
      setShowTestCases(false);
      setOutput(null);
      setActiveTab(0); // Reset về tab đầu tiên khi đổi bài mới
    }
  }, [problem]);

  const handleExecuteCode = async (actionType) => {
    setShowTestCases(true); // Tự động đẩy panel kết quả từ dưới lên
    setIsCompiling(true);
    setOutput(null);

    try {
      // Gọi API tới Backend Node.js
      const response = await fetch("http://localhost:5000/api/judges/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem?.id,
          code: code,
          language: language,
          action: actionType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // 🌟 LƯU TRỰC TIẾP ĐỐI TƯỢNG DATA CỦA BACKEND TRẢ VỀ
        // Đối tượng này chứa: status, output, isCorrect, testCaseInput, v.v.
        setOutput(result.data);
      } else {
        setOutput({
          status: "Error",
          message: result.message || "Lỗi biên dịch hệ thống.",
        });
      }
    } catch (error) {
      setOutput({
        status: "Error",
        message: "Không thể kết nối đến máy chủ .NET CLI.",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div
      className="vw-100 vh-100 d-flex flex-column m-0 p-0 overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#f8f9fa",
      }}
    >
      {/* 1. Header điều hướng */}
      <WorkspaceHeader
        problemTitle={problem?.title || "Bài tập lập trình"}
        onExit={onExitWorkspace}
        onToggleAI={() => setShowAI(!showAI)}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
        onRunCode={() => handleExecuteCode("RUN")}
        onSubmitCode={() => handleExecuteCode("SUBMIT")}
      />

      <div className="row g-0 flex-grow-1 overflow-hidden w-100 m-0">
        {/* Đề bài (Bên trái) */}
        <div
          className={`col-12 col-lg-5 h-100 overflow-y-auto border-end ${
            theme === "vs-dark" ? "bg-dark text-light border-secondary" : "bg-white text-dark"
          }`}
        >
          <ProblemDescription problem={problem} theme={theme} />
        </div>

        {/* Trình soạn thảo code (Bên phải) */}
        <div className="col-12 col-lg-7 position-relative h-100 d-flex flex-column bg-dark">
          <div className="flex-grow-1 position-relative overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              theme={theme}
              language={language}
              onRunCode={() => handleExecuteCode("RUN")}
              onSubmitCode={() => handleExecuteCode("SUBMIT")}
            />
          </div>

          {/* 🌟 NÂNG CẤP: PANEL KẾT QUẢ TEST CASE PHÂN TAB CHUYÊN NGHIỆP */}
          {showTestCases && (
            <div
              className={`border-top transition-all d-flex flex-column ${
                theme === "vs-dark" ? "border-secondary bg-dark text-light" : "border-light bg-light text-dark"
              }`}
              style={{ height: "42%", zIndex: 10 }}
            >
              {/* Header của Panel Kết Quả */}
              <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom border-secondary border-opacity-10 bg-black bg-opacity-10">
                <span className="fw-bold small font-monospace text-uppercase tracking-wider">
                  <i className="fa-solid fa-terminal me-2 text-primary"></i>
                  Console Kết quả Chấm bài
                </span>
                <button
                  className="btn btn-sm text-muted hover-text-white border-0 text-decoration-none"
                  onClick={() => setShowTestCases(false)}
                >
                  <i className="fa-solid fa-xmark"></i> Đóng
                </button>
              </div>

              {/* Nội dung vùng Console hiển thị */}
              <div className="flex-grow-1 overflow-hidden d-flex flex-column p-3">
                {isCompiling ? (
                  <div className="d-flex align-items-center gap-2 text-warning font-monospace p-2 small">
                    <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                    <span>Đang biên dịch và thực thi bằng hệ thống .NET CLI...</span>
                  </div>
                ) : output ? (
                  <div className="d-flex flex-column h-100 overflow-hidden font-monospace">
                    
                    {/* A. Tiêu đề chúc mừng màu xanh lá (HackerRank Style) */}
                    {output.status === "Success" && output.isCorrect && (
                      <div className="mb-2 p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                        <h5 className="text-success fw-bold m-0" style={{ fontSize: "16px" }}>Congratulations!</h5>
                        <p className="text-muted m-0 mt-1" style={{ fontSize: "12px" }}>
                          You have passed the sample test cases. Click the submit button to run your code against all the test cases.
                        </p>
                      </div>
                    )}

                    {/* B. Vùng phân chia Menu bên trái và Nội dung chi tiết bên phải */}
                    <div className="d-flex flex-grow-1 overflow-hidden mt-1 gap-3">
                      
                      {/* Menu chọn Tab Test Case (Cột bên trái) */}
                      <div className="d-flex flex-column gap-2 overflow-y-auto" style={{ width: "220px", minWidth: "200px" }}>
                        <button
                          className={`btn btn-sm border-0 font-monospace text-start py-2 px-3 rounded d-flex align-items-center justify-content-between ${
                            activeTab === 0 
                              ? (theme === "vs-dark" ? "bg-secondary bg-opacity-25 text-white fw-bold" : "bg-primary bg-opacity-10 text-primary fw-bold")
                              : "text-muted bg-transparent"
                          }`}
                          onClick={() => setActiveTab(0)}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {output.status === "Success" && output.isCorrect ? (
                              <i className="fa-solid fa-circle-check text-success"></i>
                            ) : (
                              <i className="fa-solid fa-circle-xmark text-danger"></i>
                            )}
                            <span style={{ fontSize: "13px" }}>Sample Test case 0</span>
                          </div>
                        </button>
                      </div>

                      {/* Thông tin chi tiết giá trị Test Case (Vùng bên phải) */}
                      <div className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-3" style={{ fontSize: "13px" }}>
                        
                        {/* 🌟 CẬP NHẬT: GIAO DIỆN HIỂN THỊ LỖI BIÊN DỊCH CHI TIẾT THEO YÊU CẦU */}
                        {output.status === "Error" && (
                          <div className="d-flex flex-column gap-3 w-100 font-sans-serif" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
                            {/* Tiêu đề lỗi trực quan */}
                            <div>
                              <h4 className="text-danger fw-bold mb-1" style={{ fontSize: "22px", color: "#b30000", letterSpacing: "-0.5px" }}>
                                Compilation error :(
                              </h4>
                              <div className="text-muted small">
                                Check the compiler output, fix the error and try again.
                              </div>
                            </div>

                            {/* Khung nội dung Compile Message */}
                            <div className="d-flex flex-column gap-1">
                              <div className="text-muted small fw-semibold">Compile Message</div>
                              <div 
                                className={`p-3 rounded border font-monospace ${
                                  theme === "vs-dark" 
                                    ? "bg-black border-secondary border-opacity-25 text-light" 
                                    : "bg-light border-light text-dark"
                                }`}
                                style={{ fontSize: "13px", lineHeight: "1.6" }}
                              >
                                <pre className="m-0 p-0 bg-transparent border-0 text-wrap text-danger fw-bold" style={{ whiteSpace: "pre-wrap" }}>
                                  {output.message || output.output || "Không thể trích xuất thông tin lỗi biên dịch."}
                                </pre>
                              </div>
                            </div>

                            {/* Khung hiển thị Exit Status */}
                            <div className="d-flex flex-column gap-1" style={{ maxWidth: "150px" }}>
                              <div className="text-muted small fw-semibold">Exit Status</div>
                              <div 
                                className={`p-2 rounded border text-center font-monospace fw-bold ${
                                  theme === "vs-dark" 
                                    ? "bg-black border-secondary border-opacity-25 text-light" 
                                    : "bg-light border-light text-dark"
                                }`}
                                style={{ fontSize: "13.5px" }}
                              >
                                1
                              </div>
                            </div>
                          </div>
                        )}

                        {output.status !== "Error" && (
                          <>
                            {/* Khung Input (stdin) */}
                            <div>
                              <div className="text-muted small mb-1 d-flex justify-content-between align-items-center">
                                <span>Input (stdin)</span>
                                <span className="text-primary cursor-pointer small opacity-75 hover-opacity-100"><i className="fa-solid fa-download me-1"></i>Download</span>
                              </div>
                              <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25 text-light" : "bg-white border-light text-dark"}`}>
                                {output.testCaseInput || "No input data"}
                              </pre>
                            </div>

                            {/* Khung Your Output (stdout) */}
                            <div>
                              <div className="text-muted small mb-1">Your Output (stdout)</div>
                              <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25" : "bg-white border-light"} ${output.isCorrect ? "text-success" : "text-danger"}`}>
                                {output.actualOutput || "Rỗng (No output)"}
                              </pre>
                            </div>

                            {/* Khung Expected Output */}
                            <div>
                              <div className="text-muted small mb-1 d-flex justify-content-between align-items-center">
                                <span>Expected Output</span>
                                <span className="text-primary cursor-pointer small opacity-75 hover-opacity-100"><i className="fa-solid fa-download me-1"></i>Download</span>
                              </div>
                              <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25 text-light" : "bg-white border-light text-dark"}`}>
                                {output.expectedOutput || "No expected data"}
                              </pre>
                            </div>
                          </>
                        )}

                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="text-muted font-monospace small p-2">Vui lòng bấm nút Run Code hoặc Submit để kiểm tra kết quả bài làm.</div>
                )}
              </div>
            </div>
          )}
          {showAI && <AIAssistantPopup onClose={() => setShowAI(false)} />}
        </div>
      </div>
    </div>
  );
}