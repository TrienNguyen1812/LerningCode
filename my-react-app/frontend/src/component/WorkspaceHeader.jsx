// Nhận prop onToggleAI từ component cha
export default function WorkspaceHeader({ problemTitle, onToggleAI }) {
  return (
    <header className="navbar navbar-expand bg-white border-bottom px-4 py-2 justify-content-between sticky-top">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-light btn-sm rounded-3 px-2.5 d-flex align-items-center gap-2 border">
          <i className="fa-solid fa-arrow-left small"></i> Problem
        </button>
        <span className="fw-bold text-dark fs-6">{problemTitle}</span>
      </div>

      <div className="d-flex align-items-center gap-2">
        {/* THÊM onClick: Gọi hàm onToggleAI khi người dùng nhấn nút */}
        <button 
          className="btn btn-primary btn-sm rounded-3 fw-semibold px-3 d-flex align-items-center gap-2" 
          style={{ backgroundColor: "#3525cd", borderColor: "#3525cd" }}
          onClick={onToggleAI}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> AI Trợ giúp
        </button>
        
        <button className="btn btn-outline-secondary btn-sm rounded-3 px-3 fw-semibold">
          Change Theme
        </button>

        <div className="d-flex align-items-center gap-1 bg-light px-2 py-1 rounded-3 border">
          <span className="text-muted small px-1">Language</span>
          <select className="form-select form-select-sm border-0 bg-transparent fw-semibold text-dark p-0 shadow-none" style={{ width: "100px", cursor: "pointer" }}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>

        <button className="btn btn-light btn-sm rounded-3 border px-2.5 text-muted"><i className="fa-solid fa-clock-rotate-left"></i></button>
        <button className="btn btn-light btn-sm rounded-3 border px-2.5 text-muted"><i className="fa-solid fa-expand"></i></button>
        <button className="btn btn-light btn-sm rounded-3 border px-2.5 text-muted"><i className="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
    </header>
  );
}