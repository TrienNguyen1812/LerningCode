import { useState } from "react";

const OutputBox = ({
  content,
  theme,
  variant = "default",
  extraClass = "",
}) => {
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

// Sub-component hiển thị chi tiết từng Test Case
const TestCaseDetailView = ({ tc, activeTab, theme, onDownload }) => {
  return (
    <div
      className="flex-grow-1 overflow-y-auto pe-2 d-flex flex-column gap-3"
      style={{ fontSize: "13px" }}
    >
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

          {tc.executionTime && (
            <span className="badge bg-secondary bg-opacity-25 text-info font-monospace fw-normal">
              <i className="fa-regular fa-clock me-1"></i>
              {tc.executionTime} ms
            </span>
          )}
        </div>

        {tc.errorMessage && (
          <pre className="text-danger mt-1 bg-black bg-opacity-25 p-2 rounded small text-wrap">
            {tc.errorMessage}
          </pre>
        )}
      </div>

      {[
        {
          label: `Input (stdin) - Trọng số (weight): ${tc.weight ?? 1.0}`,
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
                  onDownload(
                    item.data,
                    `${item.filePrefix}_tc_${activeTab + 1}.txt`,
                  )
                }
              >
                <i className="fa-solid fa-download me-1"></i> Download
              </span>
            )}
          </div>
          <OutputBox content={item.data} theme={theme} />
        </div>
      ))}

      <div>
        <div className="text-muted small mb-1">Your Output</div>
        <OutputBox
          content={tc.actualOutput || tc.Actual_output || tc.stdout || ""}
          theme={theme}
          variant={
            tc.isPassed || tc.Is_passed || tc.status === "Passed"
              ? "success"
              : "danger"
          }
        />
      </div>
    </div>
  );
};

export default function SubmissionResultView({
  show,
  onClose,
  isCompiling,
  output,
  currentAction,
  theme,
  onDownload,
  showScoreModal,
  onCloseScoreModal,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const isDark = theme === "vs-dark";

  if (!show && !showScoreModal) return null;

  // Chuẩn hóa danh sách test case
  const getDisplayTestCases = () => {
    if (!output) return [];
    const details = output.testCaseDetails || output.results || output.details;

    if (Array.isArray(details) && details.length > 0) {
      return details.map((tc, idx) => ({
        name: tc.name || tc.testCaseName || `Test Case ${idx + 1}`,
        isPassed:
          tc.isPassed ??
          tc.Is_passed ??
          (tc.status === "Passed" || tc.status === "Accepted"),
        status: tc.status || (tc.isPassed ? "Passed" : "Wrong Answer"),
        input: tc.input || tc.testCaseInput || tc.Input_data || "",
        expectedOutput: tc.expectedOutput || tc.Expected_output || "",
        actualOutput: tc.actualOutput || tc.Actual_output || tc.stdout || "",
        errorMessage: tc.errorMessage || tc.message || "",
        executionTime: tc.executionTime || tc.duration || "",
        weight: tc.weight ?? 1.0,
      }));
    }

    return [
      {
        name: "Test Case 1",
        isPassed:
          output.isCorrect ||
          output.status === "Success" ||
          output.status === "Accepted",
        status: output.status,
        input: output.testCaseInput || output.input || "",
        expectedOutput: output.expectedOutput || "",
        actualOutput: output.actualOutput || output.stdout || "",
        errorMessage: output.message || output.errorMessage || "",
        executionTime: output.executionTime || output.duration || "",
        weight: 1.0,
      },
    ];
  };

  const testCasesList = getDisplayTestCases();
  const currentTestCase = testCasesList[activeTab] || testCasesList[0] || {};

  return (
    <>
      {/* 🟢 HÌNH 2: KHU VỰC KẾT QUẢ CHẠY THỬ (CONSOLE DƯỚI BÀN PHÍM) */}
      {show && (
        <div
          className={`border-top transition-all d-flex flex-column ${
            isDark
              ? "border-secondary bg-dark text-light"
              : "border-light bg-light text-dark"
          }`}
          style={{ height: "55%", zIndex: 10 }}
        >
          {/* HEADER CONSOLE */}
          <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom border-secondary border-opacity-10 bg-black bg-opacity-10">
            <div className="d-flex align-items-center gap-3">
              <span className="fw-bold small font-monospace text-uppercase tracking-wider">
                <i className="fa-solid fa-terminal me-2 text-primary"></i>
                Console Kết quả (Chạy thử)
              </span>

              {/* Bổ sung hiển thị thời gian biên dịch / thực thi */}
              {output?.executionTime !== undefined && (
                <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 font-monospace fw-normal ms-2">
                  <i className="fa-regular fa-clock me-1"></i>
                  Thời gian biên dịch:{" "}
                  <strong>{output.executionTime} ms</strong>
                </span>
              )}
            </div>

            <button
              className="btn btn-sm text-muted hover-text-white border-0 text-decoration-none"
              onClick={onClose}
            >
              <i className="fa-solid fa-xmark"></i> Đóng
            </button>
          </div>

          {/* BODY CONSOLE */}
          <div className="flex-grow-1 overflow-hidden d-flex flex-column p-3">
            {isCompiling ? (
              <div className="d-flex align-items-center gap-2 text-warning font-monospace p-2 small">
                <div
                  className="spinner-border spinner-border-sm text-warning"
                  role="status"
                ></div>
                <span>Hệ thống đang biên dịch & thực thi test case...</span>
              </div>
            ) : output ? (
              <div className="d-flex flex-column h-100 overflow-hidden font-monospace">
                <div className="d-flex flex-grow-1 overflow-hidden gap-3">
                  {/* DANH SÁCH TEST CASE BÊN TRÁI */}
                  <div
                    className="d-flex flex-column gap-1 overflow-y-auto pe-1"
                    style={{ width: "210px", minWidth: "180px" }}
                  >
                    {testCasesList.map((tc, index) => {
                      const isPassed =
                        tc.isPassed || tc.Is_passed || tc.status === "Passed";
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
                            <span style={{ fontSize: "13px" }}>{tc.name}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* CHI TIẾT TEST CASE BÊN PHẢI */}
                  {currentTestCase && (
                    <TestCaseDetailView
                      tc={currentTestCase}
                      activeTab={activeTab}
                      theme={theme}
                      onDownload={onDownload}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-muted font-monospace small p-2">
                Vui lòng bấm nút Run Code hoặc Submit để kiểm tra kết quả bài
                làm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🟡 HÌNH 1: MODAL CHẤM ĐIỂM BÀI NỘP (TỰ BẬT LÊN SAU 5 GIÂY) */}
      {showScoreModal && output && output.scores && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 1050 }}
        >
          <div
            className={`rounded-3 shadow-lg w-100 overflow-hidden font-monospace ${
              isDark
                ? "bg-dark text-light border border-secondary"
                : "bg-white text-dark"
            }`}
            style={{ maxWidth: "850px" }}
          >
            {/* Modal Header */}
            <div className="d-flex justify-content-between align-items-center px-4 py-2 border-bottom border-secondary border-opacity-25 bg-black bg-opacity-10">
              <span className="fw-bold text-uppercase">
                <i className="fa-solid fa-award me-2 text-warning"></i>
                CONSOLE KẾT QUẢ (CHẤM ĐIỂM BÀI NỘP)
              </span>
              <button
                className="btn btn-sm text-muted border-0"
                onClick={onCloseScoreModal}
              >
                <i className="fa-solid fa-xmark fs-5"></i> Đóng
              </button>
            </div>

            {/* Modal Body */}
            <div
              className="p-4 space-y-3"
              style={{ backgroundColor: isDark ? "#121212" : "#e9ecef" }}
            >
              <div className="p-3 rounded bg-black bg-opacity-25 border border-secondary border-opacity-25">
                {/* 1. HIỂN THỊ 3 CỘT ĐÁNH GIÁ TỔNG QUAN GIẢNG VIÊN */}
                <div className="row text-center g-2 mb-3 pb-2 border-bottom border-secondary border-opacity-25">
                  <div className="col-4 border-end border-secondary border-opacity-25">
                    <span className="text-muted small d-block">
                      1. Điểm bài làm
                    </span>
                    <span className="fs-3 fw-bold text-warning">
                      {output.scores.finalScore} / 10
                    </span>
                  </div>
                  <div className="col-4 border-end border-secondary border-opacity-25">
                    <span className="text-muted small d-block">
                      2. Mức độ học tập độc lập
                    </span>
                    <span
                      className={`badge mt-2 px-3 py-2 ${
                        output.progress?.independenceLevel === "Rất cao"
                          ? "bg-success"
                          : output.progress?.independenceLevel === "Thường"
                            ? "bg-info"
                            : "bg-warning"
                      }`}
                    >
                      {output.progress?.independenceLevel || "Rất cao"}
                    </span>
                  </div>
                  <div className="col-4">
                    <span className="text-muted small d-block">
                      3. Số lần dùng gợi ý
                    </span>
                    <span className="fs-4 fw-bold text-info">
                      {output.scores.usedHintCount || 0} lần
                    </span>
                  </div>
                </div>

                {/* 2. BẢNG PHÂN TÍCH TIÊU CHÍ ĐIỂM CHÍNH (80% - 10% - 10%) */}
                <div
                  className="row g-2 text-center"
                  style={{ fontSize: "12px" }}
                >
                  <div className="col-4">
                    <div className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                      <span className="text-muted d-block">
                        Correctness (80%)
                      </span>
                      <strong className="text-success fs-6">
                        {output.scores.correctnessScore} / 100
                      </strong>
                      <div
                        className="text-muted mt-1"
                        style={{ fontSize: "10px" }}
                      >
                        ({output.passCount}/{testCasesList.length} test passed)
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                      <span className="text-muted d-block">
                        Reliability (10%)
                      </span>
                      <strong className="text-info fs-6">
                        {output.scores.reliabilityScore} / 100
                      </strong>
                      <div
                        className="text-muted mt-1"
                        style={{ fontSize: "10px" }}
                      >
                        (Độ ổn định & Runtime)
                      </div>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded bg-secondary bg-opacity-10 border border-secondary border-opacity-10">
                      <span className="text-muted d-block">
                        Code Quality (10%)
                      </span>
                      <strong className="text-primary fs-6">
                        {output.scores.codeQualityScore} / 100
                      </strong>
                      <div
                        className="text-muted mt-1"
                        style={{ fontSize: "10px" }}
                      >
                        (Chuẩn Style & Cấu trúc)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. LỜI NHẬN XÉT CỦA AI VỀ CHẤT LƯỢNG CODE */}
                {output.scores.aiFeedback && (
                  <div className="mt-3 p-2.5 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25 text-start">
                    <div className="fw-bold text-primary small mb-1">
                      <i className="fa-solid fa-robot me-1"></i> Đánh giá từ AI
                      (Code Review):
                    </div>
                    <div
                      className="text-light small opacity-90"
                      style={{ fontSize: "12px", lineHeight: "1.4" }}
                    >
                      {output.scores.aiFeedback}
                    </div>
                  </div>
                )}

                {/* 3. CHỈ SỐ TIẾN BỘ HỌC TẬP */}
                {output.progress && (
                  <div
                    className="mt-3 pt-2 text-muted d-flex justify-content-between align-items-center"
                    style={{ fontSize: "11px" }}
                  >
                    <span>
                      <i className="fa-solid fa-arrows-rotate me-1"></i> Số lần
                      nộp: <strong>{output.progress.attemptCount}</strong>
                    </span>
                    <span>
                      <i className="fa-solid fa-chart-line me-1"></i> Mức tăng
                      điểm:{" "}
                      <strong className="text-success">
                        +{output.progress.scoreImprovement}
                      </strong>
                    </span>
                    <span>
                      <i className="fa-solid fa-clock me-1"></i> Thời gian tích
                      lũy:{" "}
                      <strong>
                        {output.progress.totalTimeSpentMinutes} phút
                      </strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
