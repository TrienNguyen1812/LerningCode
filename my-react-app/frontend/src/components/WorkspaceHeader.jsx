export default function WorkspaceHeader({
  problemTitle,
  onExit,
  onToggleAI,
  theme,
  onChangeTheme,
}) {
  return (
    <header
      className={`navbar navbar-expand border-bottom px-4 py-2 justify-content-between sticky-top ${
        theme === "vs-dark"
          ? "bg-dark text-light border-secondary"
          : "bg-white text-dark"
      }`}
    >
      {/* KHU VỰC TRÁI: NÚT QUAY LẠI & TIÊU ĐỀ */}
      <div className="d-flex align-items-center gap-3">
        <button
          className={`btn btn-sm rounded-3 px-2.5 d-flex align-items-center gap-2 border ${
            theme === "vs-dark"
              ? "btn-outline-light border-secondary"
              : "btn-light"
          }`}
          onClick={onExit}
        >
          <i className="fa-solid fa-arrow-left small"></i> Problem
        </button>
        <span className="fw-bold fs-6">{problemTitle}</span>
      </div>

      {/* KHU VỰC PHẢI: CÁC NÚT THAO TÁC */}
      <div className="d-flex align-items-center gap-2">
        {/* Nút Bật/Tắt AI Assistant */}
        <button
          className="btn btn-primary btn-sm rounded-3 fw-semibold px-3 d-flex align-items-center gap-2"
          style={{ backgroundColor: "#3525cd", borderColor: "#3525cd" }}
          onClick={onToggleAI}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Trợ giúp
        </button>

        {/* Nút Chuyển Giao diện Dark/Light */}
        <button
          className={`btn btn-sm rounded-3 px-3 fw-semibold border ${
            theme === "vs-dark" ? "btn-dark border-secondary" : "btn-outline-secondary"
          }`}
          onClick={() =>
            onChangeTheme(theme === "vs-dark" ? "vs-light" : "vs-dark")
          }
        >
          <i className={`fa-solid ${theme === "vs-dark" ? "fa-sun" : "fa-moon"} me-1`}></i>
          {theme === "vs-dark" ? "Light Mode" : "Dark Mode"}
        </button>

        {/* Cố định hiển thị Ngôn ngữ C# */}
        <div
          className={`d-flex align-items-center gap-2 px-3 py-1.5 rounded-3 border fw-semibold fs-7 ${
            theme === "vs-dark"
              ? "bg-black border-secondary text-light"
              : "bg-light text-dark"
          }`}
        >
          <span className="text-muted small">Language:</span>
          <span>C#</span>
        </div>
      </div>
    </header>
  );
}