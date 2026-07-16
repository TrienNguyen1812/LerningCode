import { useState } from "react";
import WorkspaceHeader from "../component/WorkspaceHeader";
import ProblemDescription from "../component/ProblemDescription";
import CodeEditor from "../component/CodeEditor";
import AIAssistantPopup from "../component/AIAssistant";

export default function ProblemWorkspacePage({ problem, onExitWorkspace }) {
  const [showAI, setShowAI] = useState(false);

  // Quản lý trạng thái UI
  const [theme, setTheme] = useState("vs-light");
  const [language, setLanguage] = useState("csharp");
  
  // 🌟 KHỞI TẠO STATE TRỰCTIẾP TỪ PROPS
  const [code, setCode] = useState(() => problem?.sampleCode || "// Viết code của bạn tại đây...");

  // Quản lý kết quả chấm bài
  const [showTestCases, setShowTestCases] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  
  // Lưu kết quả phong phú (hỗ trợ cả dạng Object của RUN và Object thống kê của SUBMIT)
  const [output, setOutput] = useState(null);
  const [currentAction, setCurrentAction] = useState("RUN"); // "RUN" hoặc "SUBMIT"
  
  // 🌟 KHÔI PHỤC STATE QUẢN LÝ TAB HOẠT ĐỘNG
  const [activeTab, setActiveTab] = useState(0);

  // Giả lập lấy ID người dùng hiện tại
  const currentUserId = 1; 

  // 1. HÀM CHẠY THỬ (RUN CODE)
  const handleRunCode = async () => {
    setCurrentAction("RUN");
    setShowTestCases(true);
    setIsCompiling(true);
    setOutput(null);
    setActiveTab(0); // Reset tab về 0 khi chạy mới

    try {
      const response = await fetch("http://localhost:5000/api/judges/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem?.id,
          code: code,
          language: language,
          action: "RUN",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.data);
      } else {
        setOutput({
          status: "Error",
          message: result.message || "Lỗi biên dịch hệ thống.",
        });
      }
    } catch (error) {
      console.error("Run code error:", error);
      setOutput({
        status: "Error",
        message: "Không thể kết nối đến máy chủ compiler.",
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // 2. HÀM NỘP BÀI THẬT (SUBMIT CODE)
  const handleSubmitCode = async () => {
    setCurrentAction("SUBMIT");
    setShowTestCases(true);
    setIsCompiling(true);
    setOutput(null);
    setActiveTab(0); // Reset tab về 0 khi nộp bài mới

    try {
      const response = await fetch("http://localhost:5000/api/submissions/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUser: currentUserId,
          idProblem: problem?.id,
          codeContent: code,
          language: language
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOutput(result.data); 
      } else {
        setOutput({
          status: "Error",
          message: result.message || "Gặp lỗi trong quá trình nộp bài.",
        });
      }
    } catch (error) {
      console.error("Submit code error:", error);
      setOutput({
        status: "Error",
        message: "Không thể kết nối đến máy chủ Submissions.",
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
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 9999,
        backgroundColor: theme === "vs-dark" ? "#1e1e1e" : "#f8f9fa",
      }}
    >
      <WorkspaceHeader
        problemTitle={problem?.title || "Bài tập lập trình"}
        onExit={onExitWorkspace}
        onToggleAI={() => setShowAI(!showAI)}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
        onRunCode={handleRunCode}
        onSubmitCode={handleSubmitCode}
      />

      <div className="row g-0 flex-grow-1 overflow-hidden w-100 m-0">
        <div className={`col-12 col-lg-5 h-100 overflow-y-auto border-end ${theme === "vs-dark" ? "bg-dark text-light border-secondary" : "bg-white text-dark"}`}>
          <ProblemDescription problem={problem} theme={theme} />
        </div>

        <div className="col-12 col-lg-7 position-relative h-100 d-flex flex-column bg-dark">
          <div className="flex-grow-1 position-relative overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              theme={theme}
              language={language}
              onRunCode={handleRunCode}
              onSubmitCode={handleSubmitCode}
            />
          </div>

          {showTestCases && (
            <div
              className={`border-top transition-all d-flex flex-column ${theme === "vs-dark" ? "border-secondary bg-dark text-light" : "border-light bg-light text-dark"}`}
              style={{ height: "45%", zIndex: 10 }}
            >
              <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom border-secondary border-opacity-10 bg-black bg-opacity-10">
                <span className="fw-bold small font-monospace text-uppercase tracking-wider">
                  <i className="fa-solid fa-terminal me-2 text-primary"></i>
                  Console Kết quả {currentAction === "RUN" ? "Chạy Thử" : `Nộp Bài (${output?.passCount || 0}/${output?.totalTestCases || 0} Passed)`}
                </span>
                <button className="btn btn-sm text-muted hover-text-white border-0 text-decoration-none" onClick={() => setShowTestCases(false)}>
                  <i className="fa-solid fa-xmark"></i> Đóng
                </button>
              </div>

              <div className="flex-grow-1 overflow-hidden d-flex flex-column p-3">
                {isCompiling ? (
                  <div className="d-flex align-items-center gap-2 text-warning font-monospace p-2 small">
                    <div className="spinner-border spinner-border-sm text-warning" role="status"></div>
                    <span>Hệ thống đang thực thi mã nguồn của bạn, vui lòng đợi...</span>
                  </div>
                ) : output ? (
                  <div className="d-flex flex-column h-100 overflow-hidden font-monospace">
                    
                    {(output.status === "Error" || output.status === "Compile Error") && (
                      <div className="d-flex flex-column gap-2 w-100 overflow-y-auto pe-2">
                        <h4 className="text-danger fw-bold mb-1" style={{ fontSize: "20px" }}>Compilation error :(</h4>
                        <div className="text-muted small mb-2">Check the compiler output, fix the error and try again.</div>
                        <div className={`p-3 rounded border text-danger fw-bold ${theme === "vs-dark" ? "bg-black border-secondary" : "bg-light border-light"}`}>
                          <pre className="m-0 text-wrap" style={{ whiteSpace: "pre-wrap" }}>{output.message || output.output || "Lỗi biên dịch cấu trúc code."}</pre>
                        </div>
                      </div>
                    )}

                    {output.status !== "Error" && output.status !== "Compile Error" && (
                      currentAction === "RUN" ? (
                        <>
                          {output.status === "Success" && output.isCorrect && (
                            <div className="mb-2 p-2 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                              <h5 className="text-success fw-bold m-0" style={{ fontSize: "15px" }}>Congratulations!</h5>
                              <p className="text-muted m-0 mt-1" style={{ fontSize: "12px" }}>You have passed the sample test cases. Click the submit button to run your code against all the test cases.</p>
                            </div>
                          )}

                          <div className="d-flex flex-grow-1 overflow-hidden gap-3">
                            <div className="d-flex flex-column gap-2" style={{ width: "200px" }}>
                              <button className={`btn btn-sm text-start py-2 px-3 rounded border-0 ${theme === "vs-dark" ? "bg-secondary bg-opacity-25 text-white" : "bg-primary bg-opacity-10 text-primary fw-bold"}`}>
                                <i className={`fa-solid me-2 ${output.isCorrect ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"}`}></i>
                                Sample Case 0
                              </button>
                            </div>

                            <div className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-2" style={{ fontSize: "13px" }}>
                              <div>
                                <div className="text-muted small mb-1">Input (stdin)</div>
                                <pre className={`p-2 rounded border m-0 ${theme === "vs-dark" ? "bg-black border-secondary text-light" : "bg-white border-light"}`}>{output.testCaseInput || "No input"}</pre>
                              </div>
                              <div>
                                <div className="text-muted small mb-1">Your Output</div>
                                <pre className={`p-2 rounded border m-0 fw-bold ${output.isCorrect ? "text-success" : "text-danger"} ${theme === "vs-dark" ? "bg-black border-secondary" : "bg-white border-light"}`}>{output.actualOutput || "Rỗng (No output)"}</pre>
                              </div>
                              <div>
                                <div className="text-muted small mb-1">Expected Output</div>
                                <pre className={`p-2 rounded border m-0 ${theme === "vs-dark" ? "bg-black border-secondary text-light" : "bg-white border-light"}`}>{output.expectedOutput || "No expected data"}</pre>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* 🌟 GIAO DIỆN PHÂN TAB SUBMIT THEO ĐÚNG ẢNH MẪU CỦA BẠN */
                        <div className="d-flex flex-grow-1 overflow-hidden gap-3 h-100">
                          
                          {/* MENU CỘT BÊN TRÁI: Động hóa danh sách Test Cases */}
                          <div className="d-flex flex-column gap-1 overflow-y-auto pe-1" style={{ width: "200px", minWidth: "170px" }}>
                            {output.testCaseDetails?.map((tc, index) => (
                              <button
                                key={index}
                                className={`btn btn-sm text-start py-2 px-3 rounded border-0 d-flex align-items-center gap-2 ${
                                  activeTab === index 
                                    ? (theme === "vs-dark" ? "bg-secondary bg-opacity-25 text-white fw-bold" : "bg-primary bg-opacity-10 text-primary fw-bold")
                                    : "text-muted bg-transparent"
                                }`}
                                onClick={() => setActiveTab(index)}
                              >
                                <i className={`fa-solid ${tc.isPassed ? "fa-circle-check text-success" : "fa-circle-xmark text-danger"}`}></i>
                                <span style={{ fontSize: "14px" }}>{tc.name}</span>
                              </button>
                            ))}
                          </div>

                          {/* KHUNG NỘI DUNG CHI TIẾT BÊN PHẢI (Thay đổi theo tab được click chọn) */}
                          <div className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-3" style={{ fontSize: "13px" }}>
                            {output.testCaseDetails && output.testCaseDetails[activeTab] && (() => {
                              const currentTC = output.testCaseDetails[activeTab];
                              return (
                                <>
                                  {/* 1. Trạng thái Compiler Message */}
                                  <div>
                                    <div className="text-muted small mb-1">Compiler Message</div>
                                    <div className={`fw-bold fs-5 ${currentTC.isPassed ? "text-success" : "text-danger"}`}>
                                      {currentTC.isPassed ? "Success" : (currentTC.status === "Error" ? "Runtime Error / TLE" : "Wrong Answer")}
                                    </div>
                                    {currentTC.errorMessage && (
                                      <pre className="text-danger mt-1 bg-black bg-opacity-25 p-2 rounded small">{currentTC.errorMessage}</pre>
                                    )}
                                  </div>

                                  {/* 2. Khung Input (stdin) */}
                                  <div>
                                    <div className="text-muted small mb-1 d-flex justify-content-between align-items-center">
                                      <span>Input (stdin)</span>
                                      <span className="text-primary cursor-pointer small opacity-75 hover-opacity-100" style={{ cursor: "pointer" }}><i className="fa-solid fa-download me-1"></i>Download</span>
                                    </div>
                                    <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25 text-light" : "bg-white border-light text-dark"}`}>
                                      {currentTC.input || "No input data"}
                                    </pre>
                                  </div>

                                  {/* 3. Khung Expected Output */}
                                  <div>
                                    <div className="text-muted small mb-1 d-flex justify-content-between align-items-center">
                                      <span>Expected Output</span>
                                      <span className="text-primary cursor-pointer small opacity-75 hover-opacity-100" style={{ cursor: "pointer" }}><i className="fa-solid fa-download me-1"></i>Download</span>
                                    </div>
                                    <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25 text-light" : "bg-white border-light text-dark"}`}>
                                      {currentTC.expectedOutput || "No expected data"}
                                    </pre>
                                  </div>

                                  {/* 4. Khung Your Output (Thêm vào để học sinh dễ đối chiếu khi sai) */}
                                  <div>
                                    <div className="text-muted small mb-1">Your Output</div>
                                    <pre className={`p-2 rounded border m-0 fw-bold ${theme === "vs-dark" ? "bg-black border-secondary border-opacity-25" : "bg-white border-light"} ${currentTC.isPassed ? "text-success" : "text-danger"}`}>
                                      {currentTC.actualOutput || "Rỗng (No output)"}
                                    </pre>
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                        </div>
                      )
                    )}
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