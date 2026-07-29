import { useState, useEffect } from "react";

export default function ExecutionConsole({ consoleOutput }) {
  const [selectedTcIndex, setSelectedTcIndex] = useState(0);

  // Reset về tab test case đầu tiên khi có dữ liệu chấm mới
  useEffect(() => {
    setSelectedTcIndex(0);
  }, [consoleOutput]);

  if (!consoleOutput) {
    return (
      <div className="p-4 text-center text-muted h-100 d-flex align-items-center justify-content-center">
        <div>
          <i className="fa-solid fa-terminal fa-2x mb-2 opacity-50"></i>
          <p className="mb-0 fw-medium">
            Nhấn nút <span className="fw-bold text-primary">Run Code</span> để bắt đầu kiểm thử bài làm.
          </p>
        </div>
      </div>
    );
  }

  // Giải nén dữ liệu an toàn
  const payload = consoleOutput.data ? consoleOutput.data : consoleOutput;

  // 1. Trạng thái Đang chờ (Pending)
  if (payload.status === "Pending") {
    return (
      <div className="p-4 text-center text-primary h-100 d-flex align-items-center justify-content-center">
        <div>
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          <span className="fw-medium">{payload.message || "Đang biên dịch và thực thi..."}</span>
        </div>
      </div>
    );
  }

  // 2. Trạng thái Lỗi Biên Dịch (Compile Error)
  if (payload.status === "Compile Error" || payload.isError) {
    return (
      <div className="p-3 h-100 d-flex flex-column overflow-hidden bg-light">
        <div className="alert alert-danger mb-2 py-2 px-3 fw-bold small d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <i className="fa-solid fa-triangle-exclamation me-2"></i>
            <span>{payload.status || "Compile Error"}</span>
          </div>
          {/* Hiển thị thời gian nếu có */}
          {(payload.executionTime || payload.duration) && (
            <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-normal">
              <i className="fa-regular fa-clock me-1"></i>
              {payload.executionTime || payload.duration}
            </span>
          )}
        </div>
        <div className="flex-grow-1 bg-dark text-danger p-3 rounded-3 font-monospace small overflow-auto">
          <pre className="mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {payload.actualOutput || payload.output || payload.message || "Lỗi cú pháp mã nguồn."}
          </pre>
        </div>
      </div>
    );
  }

  // Lấy mảng danh sách test cases
  const testCases = payload.testCaseDetails || [];
  
  // Dữ liệu hiển thị cho tab hiện tại
  const currentTc = testCases[selectedTcIndex] || {
    input: payload.testCaseInput ?? payload.inputData ?? payload.input ?? "",
    expectedOutput: payload.expectedOutput ?? payload.outputData ?? payload.output ?? "",
    actualOutput: payload.actualOutput ?? payload.stdout ?? payload.output ?? "",
    isPassed: payload.isCorrect,
    status: payload.status,
    isHidden: false,
  };

  const isAllPassed = payload.status === "Accepted" || (payload.passCount > 0 && payload.passCount === payload.totalTestCases);

  return (
    <div className="p-3 h-100 d-flex flex-column overflow-hidden bg-white text-dark font-monospace small">
      {/* 1. HEADER BANNER KẾT QUẢ + THỜI GIAN CHẠY */}
      <div className={`alert ${isAllPassed ? "alert-success" : "alert-danger"} py-2 px-3 mb-3 border-0 rounded-3 d-flex align-items-center justify-content-between shadow-sm`}>
        <div>
          <h6 className="fw-bold mb-0 font-sans-serif">
            {isAllPassed ? (
              <><i className="fa-solid fa-circle-check me-2 text-success"></i>Accepted</>
            ) : (
              <><i className="fa-solid fa-circle-xmark me-2 text-danger"></i>{payload.status || "Wrong Answer"}</>
            )}
          </h6>
          <small className="text-secondary font-sans-serif">
            Đã hoàn thành {payload.passCount ?? (isAllPassed ? 1 : 0)}/{payload.totalTestCases ?? (testCases.length || 1)} test cases.
          </small>
        </div>

        {/* CẬP NHẬT: HIỂN THỊ THỜI GIAN THỰC THI (EXECUTION TIME) */}
        {(payload.executionTime || payload.duration) && (
          <div className="text-end font-sans-serif">
            <span className="badge bg-white text-dark border fw-medium px-2 py-1 shadow-sm">
              <i className="fa-regular fa-clock me-1 text-primary"></i>
              {payload.executionTime || payload.duration}
            </span>
          </div>
        )}
      </div>

      {/* 2. TAB DANH SÁCH TEST CASES */}
      {testCases.length > 0 && (
        <div className="d-flex align-items-center gap-2 mb-3 overflow-auto pb-1 style-scroll">
          {testCases.map((tc, idx) => (
            <button
              key={tc.id || idx}
              onClick={() => setSelectedTcIndex(idx)}
              className={`btn btn-sm px-3 py-1 rounded-pill border fw-semibold text-nowrap d-flex align-items-center gap-2 ${
                selectedTcIndex === idx
                  ? "btn-dark shadow-sm"
                  : "btn-light text-secondary"
              }`}
            >
              <span
                className="rounded-circle d-inline-block"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: tc.isPassed ? "#198754" : "#dc3545",
                }}
              ></span>
              <span>{tc.name || `Testcase ${idx + 1}`}</span>
              {tc.isHidden && (
                <span className="badge bg-secondary style-badge-hidden ms-1">Ẩn</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 3. CHI TIẾT KHUNG VÀO / RA CỦA TEST CASE ĐANG CHỌN */}
      <div className="flex-grow-1 overflow-auto pe-1 d-flex flex-column gap-2 style-scroll">
        {/* INPUT */}
        <div>
          <div className="text-muted fw-bold mb-1 d-flex align-items-center justify-content-between">
            <span>Input (Đầu vào):</span>
            {currentTc.isHidden && (
              <span className="badge bg-warning text-dark font-sans-serif fw-normal">
                <i className="fa-solid fa-eye-slash me-1"></i>Test case ẩn
              </span>
            )}
          </div>
          <div className="bg-light p-2 px-3 rounded border text-dark">
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {String(currentTc.input ?? "").trim() || "(Không cần Input)"}
            </pre>
          </div>
        </div>

        {/* EXPECTED OUTPUT */}
        <div>
          <div className="text-muted fw-bold mb-1">Expected Output (Đáp án mẫu):</div>
          <div className="bg-light p-2 px-3 rounded border text-success fw-bold">
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {String(currentTc.expectedOutput ?? "").trim() || "(Chưa cấu hình Output mẫu)"}
            </pre>
          </div>
        </div>

        {/* ACTUAL OUTPUT */}
        <div>
          <div className="text-muted fw-bold mb-1">Actual Output (Kết quả thực tế):</div>
          <div
            className={`p-2 px-3 rounded border ${
              currentTc.isPassed
                ? "bg-light text-dark border-success"
                : "bg-danger bg-opacity-10 text-danger border-danger-subtle fw-medium"
            }`}
          >
            <pre className="mb-0" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {String(currentTc.actualOutput ?? "").trim() || "(Chương trình không in ra gì)"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}