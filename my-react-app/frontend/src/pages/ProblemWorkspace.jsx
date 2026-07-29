import { useState, useEffect, useRef } from "react";
import axios from "axios";

import WorkspaceHeader from "../components/WorkspaceHeader";
import ProblemDescription from "../components/ProblemDescription";
import CodeEditor from "../components/CodeEditor";
import AIAssistantPopup from "../components/AIAssistant";

const API_BASE_URL = "http://localhost:5000/api";

const OutputBox = ({ content, theme, variant = "default", extraClass = "" }) => {
  const isDark = theme === "vs-dark";
  const colorClass =
    variant === "success"
      ? "text-success"
      : variant === "danger"
      ? "text-danger"
      : isDark
      ? "text-light"
      : "text-dark";
  const bgClass = isDark
    ? "bg-black border-secondary border-opacity-25"
    : "bg-white border-light";

  return (
    <pre
      className={`p-2 rounded border m-0 fw-bold ${bgClass} ${colorClass} ${extraClass}`}
      style={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}
    >
      {content || "Rỗng (No data)"}
    </pre>
  );
};

// Sub-component hiển thị chi tiết Test Case (Public + Hidden)
const TestCaseDetailView = ({ tc, activeTab, theme, onDownload }) => {
  // Bỏ ẩn hoàn toàn ở Frontend
  const isHidden = false; 

  return (
    <div
      className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-3"
      style={{ fontSize: "13px" }}
    >
      {/* STATUS & COMPILER MESSAGE + EXECUTION TIME */}
      <div>
        <div className="text-muted small mb-1">Compiler Message</div>
        <div className="d-flex align-items-center justify-content-between">
          <div
            className={`fw-bold fs-5 ${
              tc.isPassed || tc.Is_passed || tc.status === "Passed"
                ? "text-success"
                : "text-danger"
            }`}
          >
            {tc.isPassed || tc.Is_passed || tc.status === "Passed"
              ? "Success"
              : tc.status === "Compile Error" || tc.status === "Error"
              ? "Compilation / System Error"
              : "Wrong Answer"}
          </div>

          {/* ⏱️ HIỂN THỊ THỜI GIAN RIÊNG CỦA TEST CASE */}
          {tc.executionTime && (
            <span className="badge bg-secondary bg-opacity-25 text-info font-monospace fw-normal">
              <i className="fa-regular fa-clock me-1"></i>
              {tc.executionTime}
            </span>
          )}
        </div>

        {tc.errorMessage && (
          <pre className="text-danger mt-1 bg-black bg-opacity-25 p-2 rounded small text-wrap">
            {tc.errorMessage}
          </pre>
        )}
      </div>

      {/* HIỂN THỊ CÁC TRƯỜNG DỮ LIỆU INPUT / EXPECTED */}
      {[
        {
          label: "Input (stdin)",
          data: tc.input || tc.testCaseInput || tc.Input_data,
          filePrefix: "input",
        },
        {
          label: "Expected Output",
          data: tc.expectedOutput || tc.Expected_output,
          filePrefix: "expected",
        },
      ].map((item, idx) => (
        <div key={idx}>
          <div className="text-muted small mb-1 d-flex justify-content-between align-items-center">
            <span>{item.label}</span>
            {item.data && (
              <span
                className="text-primary cursor-pointer small opacity-75 hover-opacity-100"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  onDownload(item.data, `${item.filePrefix}_tc_${activeTab + 1}.txt`)
                }
              >
                <i className="fa-solid fa-download me-1"></i> Download
              </span>
            )}
          </div>
          <OutputBox content={item.data} theme={theme} />
        </div>
      ))}

      {/* YOUR OUTPUT */}
      <div>
        <div className="text-muted small mb-1">Your Output</div>
        <OutputBox
          content={tc.actualOutput || tc.Actual_output || tc.stdout || ""}
          theme={theme}
          variant={tc.isPassed || tc.Is_passed || tc.status === "Passed" ? "success" : "danger"}
        />
      </div>
    </div>
  );
};

export default function ProblemWorkspacePage({ problem: initialProblem, onExitWorkspace }) {
  const rawId = initialProblem?.IdProblem || initialProblem?.idProblem || initialProblem?.id;
  const problemId = rawId ? Number(rawId) : null;

  const DEFAULT_SAMPLE_CODE = "// Viết code của bạn tại đây...";

  const [problem, setProblem] = useState(initialProblem);
  const [loadingProblem, setLoadingProblem] = useState(false);

  const extractSampleCode = (probData) => {
    return (
      probData?.Sample_code ||
      probData?.sampleCode ||
      probData?.sample_code ||
      DEFAULT_SAMPLE_CODE
    );
  };

  const [code, setCode] = useState(() => extractSampleCode(initialProblem));
  const prevProblemIdRef = useRef(problemId);

  const [showAI, setShowAI] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [language, setLanguage] = useState("csharp");

  const [showTestCases, setShowTestCases] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState(null);
  const [currentAction, setCurrentAction] = useState("RUN");
  const [activeTab, setActiveTab] = useState(0);
  const [hasRunCode, setHasRunCode] = useState(false);

  const currentUserId = 1;
  const isDark = theme === "vs-dark";

  useEffect(() => {
    const fetchFullProblem = async () => {
      if (!problemId) return;

      if (initialProblem?.Description || initialProblem?.description) {
        setProblem(initialProblem);
        if (problemId !== prevProblemIdRef.current) {
          setCode(extractSampleCode(initialProblem));
          prevProblemIdRef.current = problemId;
        }
        return;
      }

      try {
        setLoadingProblem(true);
        const res = await axios.get(`${API_BASE_URL}/problems/${problemId}`);
        const fullData = res.data?.data || res.data;
        if (fullData) {
          setProblem(fullData);
          setCode(extractSampleCode(fullData));
          prevProblemIdRef.current = problemId;
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin chi tiết bài tập:", err);
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchFullProblem();
  }, [problemId, initialProblem]);

  const handleDownload = (content, fileName) => {
    if (!content) return;
    const element = document.createElement("a");
    element.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const executeCode = async (action) => {
    setHasRunCode(true);
    setCurrentAction(action);
    setShowTestCases(true);
    setIsCompiling(true);
    setOutput(null);
    setActiveTab(0);

    const isRun = action === "RUN";
    const url = isRun
      ? `${API_BASE_URL}/judges/execute`
      : `${API_BASE_URL}/submissions/submit`;

    const body = isRun
      ? {
          idProblem: problemId,
          problemId: problemId,
          code: code,
          codeContent: code,
          language: language,
          action: "RUN",
          includeHidden: true, // Gửi flag yêu cầu Backend chạy cả Hidden test cases khi RUN
        }
      : {
          idUser: currentUserId,
          idProblem: problemId,
          problemId: problemId,
          codeContent: code,
          code: code,
          language: language,
        };

    try {
      const response = await axios.post(url, body);
      const resData = response.data;

      if (resData?.success) {
        const resultData = resData.data || resData;
        setOutput(resultData);

        if (resultData.testCaseDetails && resultData.testCaseDetails.length > 0) {
          const firstFailedIndex = resultData.testCaseDetails.findIndex(
            (tc) => !tc.isPassed && !tc.Is_passed
          );
          if (firstFailedIndex !== -1) {
            setActiveTab(firstFailedIndex);
          }
        }
      } else {
        setOutput({
          status: "Error",
          message:
            resData?.message ||
            (isRun ? "Lỗi biên dịch hệ thống." : "Gặp lỗi trong quá trình nộp bài."),
        });
      }
    } catch (error) {
      console.error(`${action} code error:`, error);
      setOutput({
        status: "Error",
        message:
          error.response?.data?.message ||
          `Không thể kết nối đến máy chủ ${isRun ? "Compiler" : "Submissions"}.`,
      });
    } finally {
      setIsCompiling(false);
    }
  };

  // 🔥 HÀM CHUẨN HÓA LẤY TOÀN BỘ DANH SÁCH TEST CASES ĐÃ SỬA
  const getDisplayTestCases = () => {
    if (!output) return [];

    // Ưu tiên mảng testCaseDetails
    const details = output.testCaseDetails || output.results || output.details;

    if (Array.isArray(details) && details.length > 0) {
      return details.map((tc, idx) => {
        return {
          name: tc.name || tc.testCaseName || `Test Case ${idx + 1}`,
          isPassed: tc.isPassed ?? tc.Is_passed ?? (tc.status === "Passed" || tc.status === "Accepted"),
          status: tc.status || (tc.isPassed ? "Passed" : "Wrong Answer"),
          input: tc.input || tc.testCaseInput || tc.Input_data || "",
          expectedOutput: tc.expectedOutput || tc.Expected_output || "",
          actualOutput: tc.actualOutput || tc.Actual_output || tc.stdout || "",
          errorMessage: tc.errorMessage || tc.message || "",
          executionTime: tc.executionTime || tc.duration || output?.executionTime || output?.duration || "", // ⏱️ Lấy thời gian biên dịch
          isHidden: false // Luôn hiển thị dữ liệu gốc, bỏ icon khoá ẩn
        };
      });
    }

    // Fallback nếu API chỉ trả kết quả tổng quan
    return [
      {
        name: "Test Case 1",
        isPassed: output.isCorrect || output.status === "Success" || output.status === "Accepted",
        status: output.status,
        input: output.testCaseInput || output.input || "",
        expectedOutput: output.expectedOutput || "",
        actualOutput: output.actualOutput || output.stdout || "",
        errorMessage: output.message || output.errorMessage || "",
        executionTime: output.executionTime || output.duration || "", // ⏱️ Lấy thời gian biên dịch
        isHidden: false
      },
    ];
  };

  const testCasesList = getDisplayTestCases();
  const currentTestCase = testCasesList[activeTab] || testCasesList[0] || {};

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
        backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa",
      }}
    >
      <WorkspaceHeader
        problemTitle={problem?.Title || problem?.title || "Bài tập lập trình"}
        onExit={onExitWorkspace}
        onToggleAI={() => setShowAI(!showAI)}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
        onRunCode={() => executeCode("RUN")}
        onSubmitCode={() => executeCode("SUBMIT")}
      />

      <div className="row g-0 flex-grow-1 overflow-hidden w-100 m-0">
        <div
          className={`col-12 col-lg-5 h-100 overflow-y-auto border-end ${
            isDark ? "bg-dark text-light border-secondary" : "bg-white text-dark"
          }`}
        >
          {loadingProblem ? (
            <div className="p-4 text-center text-muted">
              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
              <span>Đang lấy chi tiết bài tập từ Server...</span>
            </div>
          ) : (
            <ProblemDescription problem={problem} theme={theme} />
          )}
        </div>

        <div className="col-12 col-lg-7 position-relative h-100 d-flex flex-column bg-dark">
          <div className="flex-grow-1 position-relative overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              theme={theme}
              language={language}
              onRunCode={() => executeCode("RUN")}
              onSubmitCode={() => executeCode("SUBMIT")}
            />
          </div>

          {showTestCases && (
            <div
              className={`border-top transition-all d-flex flex-column ${
                isDark
                  ? "border-secondary bg-dark text-light"
                  : "border-light bg-light text-dark"
              }`}
              style={{ height: "45%", zIndex: 10 }}
            >
              <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom border-secondary border-opacity-10 bg-black bg-opacity-10">
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-bold small font-monospace text-uppercase tracking-wider">
                    <i className="fa-solid fa-terminal me-2 text-primary"></i>
                    Console Kết quả{" "}
                    {currentAction === "RUN"
                      ? `Chạy Thử (${output?.passCount ?? testCasesList.filter(t=>t.isPassed).length}/${testCasesList.length} Passed)`
                      : `Nộp Bài (${output?.passCount ?? testCasesList.filter(t=>t.isPassed).length}/${testCasesList.length} Passed)`}
                  </span>

                  {/* ⏱️ THỜI GIAN THỰC THI BIÊN DỊCH Ở HEADER CONSOLE */}
                  {output && (output.executionTime || output.duration) && (
                    <span className="badge bg-secondary bg-opacity-25 text-info border border-info border-opacity-25 font-monospace fw-normal">
                      <i className="fa-regular fa-clock me-1"></i>
                      {output.executionTime || output.duration}
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-sm text-muted hover-text-white border-0 text-decoration-none"
                  onClick={() => setShowTestCases(false)}
                >
                  <i className="fa-solid fa-xmark"></i> Đóng
                </button>
              </div>

              <div className="flex-grow-1 overflow-hidden d-flex flex-column p-3">
                {isCompiling ? (
                  <div className="d-flex align-items-center gap-2 text-warning font-monospace p-2 small">
                    <div
                      className="spinner-border spinner-border-sm text-warning"
                      role="status"
                    ></div>
                    <span>Hệ thống đang thực thi mã nguồn của bạn, vui lòng đợi...</span>
                  </div>
                ) : output ? (
                  <div className="d-flex flex-column h-100 overflow-hidden font-monospace">
                    {["Error", "Compile Error", "Time Limit Exceeded", "Execution Error"].includes(
                      output.status
                    ) ? (
                      <div className="d-flex flex-column gap-2 w-100 overflow-y-auto pe-2">
                        <h4
                          className="text-danger fw-bold mb-1"
                          style={{ fontSize: "18px" }}
                        >
                          {output.status === "Time Limit Exceeded"
                            ? "Time Limit Exceeded (TLE)"
                            : "Compilation / System Error"}
                        </h4>
                        <OutputBox
                          content={
                            output.message ||
                            output.actualOutput ||
                            output.output ||
                            "Lỗi cú pháp hoặc biên dịch."
                          }
                          theme={theme}
                          variant="danger"
                        />
                      </div>
                    ) : (
                      <>
                        {output.isCorrect || output.status === "Accepted" ? (
                          <div className="mb-3 p-2 px-3 rounded bg-success bg-opacity-10 border border-success border-opacity-25">
                            <h5
                              className="text-success fw-bold m-0"
                              style={{ fontSize: "14px" }}
                            >
                              Congratulations!
                            </h5>
                            <p
                              className="text-muted m-0 mt-1"
                              style={{ fontSize: "12px" }}
                            >
                              Bạn đã vượt qua tất cả {testCasesList.length} test cases!
                            </p>
                          </div>
                        ) : (
                          <div className="mb-3 p-2 px-3 rounded bg-danger bg-opacity-10 border border-danger border-opacity-25">
                            <h5
                              className="text-danger fw-bold m-0"
                              style={{ fontSize: "14px" }}
                            >
                              Wrong Answer
                            </h5>
                            <p
                              className="text-muted m-0 mt-1"
                              style={{ fontSize: "12px" }}
                            >
                              Đã hoàn thành {output?.passCount ?? testCasesList.filter(t=>t.isPassed).length}/{testCasesList.length} test cases.
                            </p>
                          </div>
                        )}

                        <div className="d-flex flex-grow-1 overflow-hidden gap-3">
                          {/* TAB LỰA CHỌN CÁC TEST CASES */}
                          <div
                            className="d-flex flex-column gap-1 overflow-y-auto pe-1"
                            style={{ width: "210px", minWidth: "180px" }}
                          >
                            {testCasesList.map((tc, index) => {
                              const isPassed = tc.isPassed || tc.Is_passed || tc.status === "Passed";
                              return (
                                <button
                                  key={index}
                                  className={`btn btn-sm text-start py-2 px-3 rounded border-0 d-flex align-items-center justify-content-between ${
                                    activeTab === index
                                      ? isDark
                                        ? "bg-secondary bg-opacity-25 text-white fw-bold"
                                        : "bg-primary bg-opacity-10 text-primary fw-bold"
                                      : "text-muted bg-transparent"
                                  }`}
                                  onClick={() => setActiveTab(index)}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <i
                                      className={`fa-solid ${
                                        isPassed
                                          ? "fa-circle-check text-success"
                                          : "fa-circle-xmark text-danger"
                                      }`}
                                    ></i>
                                    <span style={{ fontSize: "13px" }}>
                                      {tc.name}
                                    </span>
                                  </div>
                                  {tc.isHidden && (
                                    <i className="fa-solid fa-lock text-muted small" title="Hidden Test Case"></i>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* CHI TIẾT TEST CASE */}
                          {currentTestCase && (
                            <TestCaseDetailView
                              tc={currentTestCase}
                              activeTab={activeTab}
                              theme={theme}
                              onDownload={handleDownload}
                            />
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-muted font-monospace small p-2">
                    Vui lòng bấm nút Run Code hoặc Submit để kiểm tra kết quả bài làm.
                  </div>
                )}
              </div>
            </div>
          )}

          {showAI && (
            <AIAssistantPopup
              onClose={() => setShowAI(false)}
              hasRunCode={hasRunCode}
              code={code}
              output={output}
              language={language}
              problemContext={problem}
            />
          )}
        </div>
      </div>
    </div>
  );
}