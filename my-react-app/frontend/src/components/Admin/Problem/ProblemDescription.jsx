export default function ProblemDescription({ problem, visibleTestCase }) {
  return (
    <div className="p-3 overflow-auto flex-grow-1">
      <h5 className="fw-bold text-dark">{problem?.title || "Tên bài tập"}</h5>

      <div className="d-flex gap-2 my-2">
        <span
          className={`badge ${
            problem?.difficulty === "Easy"
              ? "bg-success"
              : problem?.difficulty === "Medium"
              ? "bg-warning text-dark"
              : "bg-danger"
          }`}
        >
          {problem?.difficulty || "Easy"}
        </span>
        <span className="badge bg-light text-dark border">
          {problem?.timeLimit || 1000} ms
        </span>
        <span className="badge bg-light text-dark border">
          {problem?.memoryLimit || 256} MB
        </span>
      </div>

      <hr className="my-3 text-muted" />

      <h6 className="fw-bold text-primary">Mô tả bài toán:</h6>
      <p className="small text-secondary" style={{ whiteSpace: "pre-line" }}>
        {problem?.description || "Chưa có mô tả bài tập."}
      </p>

      <h6 className="fw-bold text-primary mt-3">Ví dụ mẫu:</h6>
      {visibleTestCase ? (
        <div className="bg-light p-3 rounded-3 border small">
          <div className="mb-1">
            <span className="fw-bold text-secondary">Input: </span>
            <code className="text-dark bg-white px-2 py-1 rounded border">
              {visibleTestCase.inputData || "(Không có)"}
            </code>
          </div>
          <div className="mt-2">
            <span className="fw-bold text-secondary">Output: </span>
            <code className="text-success bg-white px-2 py-1 rounded border fw-bold">
              {visibleTestCase.outputData}
            </code>
          </div>
        </div>
      ) : (
        <span className="small text-muted">Chưa có TestCase ví dụ mẫu.</span>
      )}
    </div>
  );
}