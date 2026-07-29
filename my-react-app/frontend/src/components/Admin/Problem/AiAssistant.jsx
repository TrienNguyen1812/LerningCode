export default function AiAssistant({
  chatHistory,
  userQuestion,
  setUserQuestion,
  onAskAI,
  isAsking,
  hintLevel,
  setHintLevel,
}) {
  // 🟢 ĐÃ CẬP NHẬT: Xóa thông tin trừ điểm khỏi mô tả các Level
  const hintLevelDescriptions = {
    1: "Level 1: Chỉ ra vị trí dòng lỗi & loại lỗi.",
    2: "Level 2: Chỉ lỗi + Gợi ý tư duy/thuật toán.",
    3: "Level 3: Phân tích sâu nguyên nhân & gợi ý cú pháp sửa.",
  };

  return (
    <div className="bg-white p-3 rounded-4 h-100 border shadow-sm d-flex flex-column">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-2 pb-2 border-bottom">
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-robot text-primary fs-5"></i>
          <h6 className="fw-bold mb-0 text-dark">Trợ lý Gemini AI</h6>
        </div>
      </div>

      {/* 🎯 BỘ CHỌN CẤP ĐỘ HINT */}
      <div className="bg-light p-2 rounded-3 border mb-2">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <label className="fw-bold text-secondary small mb-0">
            <i className="fa-solid fa-layer-group me-1 text-warning"></i> Cấp độ Hint:
          </label>
          <span className="badge bg-warning text-dark fw-bold">Level {hintLevel}</span>
        </div>

        {/* Nút chọn Level 1, 2, 3 */}
        <div className="btn-group w-100 mb-1" role="group">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`btn btn-sm ${
                hintLevel === lvl
                  ? "btn-warning fw-bold text-dark shadow-sm"
                  : "btn-outline-secondary bg-white text-dark"
              }`}
              onClick={() => setHintLevel(lvl)}
            >
              Level {lvl}
            </button>
          ))}
        </div>

        <div className="text-muted small" style={{ fontSize: "11px", lineHeight: "1.2" }}>
          <i className="fa-solid fa-circle-info me-1"></i>
          {hintLevelDescriptions[hintLevel]}
        </div>
      </div>

      {/* KHUNG CHAT AI */}
      <div className="flex-grow-1 overflow-auto pe-1 my-2 d-flex flex-column gap-2">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-3 small ${
              msg.sender === "user"
                ? "bg-primary text-white align-self-end w-80 shadow-sm"
                : "bg-light text-dark border align-self-start w-90"
            }`}
            style={{ whiteSpace: "pre-line" }}
          >
            {/* Nếu message từ AI có gắn nhãn Level, hiển thị badge */}
            {msg.level && (
              <div className="mb-1">
                <span className="badge bg-warning text-dark me-1" style={{ fontSize: "10px" }}>
                  Hint Lvl {msg.level}
                </span>
                <span className="text-muted" style={{ fontSize: "10px" }}>
                  (Đã lưu vào HINT_USAGE)
                </span>
              </div>
            )}
            {msg.text}
          </div>
        ))}

        {isAsking && (
          <div className="text-primary small italic d-flex align-items-center gap-2 my-1">
            <div className="spinner-border spinner-border-sm" role="status"></div>
            <span>Gemini AI đang phân tích theo Level {hintLevel}...</span>
          </div>
        )}
      </div>

      {/* Ô NHẬP HỎI AI */}
      <div className="d-flex gap-2 mt-auto pt-2 border-top">
        <input
          type="text"
          className="form-control form-control-sm bg-light text-dark border rounded-3"
          placeholder={`Hỏi AI lỗi code (Hint Lvl ${hintLevel})...`}
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAskAI()}
          disabled={isAsking}
        />
        <button
          className="btn btn-sm btn-primary rounded-3 px-3 text-white d-flex align-items-center gap-1"
          onClick={onAskAI}
          disabled={isAsking}
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
}