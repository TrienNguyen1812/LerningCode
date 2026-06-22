// Nhận prop onClose từ component cha
export default function AIAssistantPopup({ onClose }) {
  return (
    <div
      className="card border-0 shadow-lg position-absolute rounded-4 overflow-hidden text-start animate-fade-in"
      style={{
        width: "360px",
        bottom: "70px",
        right: "24px",
        zIndex: 1050,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header Hộp thoại AI */}
      <div className="px-3 py-2.5 d-flex align-items-center justify-content-between border-bottom text-dark bg-light">
        <div
          className="d-flex align-items-center gap-2 fw-bold"
          style={{ fontSize: "14px" }}
        >
          <i className="fa-solid fa-robot text-primary"></i> AI Assistant
        </div>
        {/* THÊM onClick: Gọi hàm onClose khi bấm nút X để đóng popup */}
        <button
          className="btn-close small"
          style={{ fontSize: "10px", cursor: "pointer" }}
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      {/* Khu vực Tin nhắn */}
      <div className="p-3 bg-white overflow-y-auto" style={{ height: "180px" }}>
        <div className="d-flex flex-column align-items-start mb-2">
          <div
            className="p-3 rounded-4 small text-secondary"
            style={{
              backgroundColor: "#eef2f7",
              maxWidth: "90%",
              lineHeight: "1.5",
            }}
          >
            Chào Alex, tôi có thể giúp gì cho bạn với bài tập "Two Sum" này
            không?
          </div>
          <span className="text-muted ps-2 mt-1" style={{ fontSize: "10px" }}>
            Vừa xong
          </span>
        </div>
      </div>

      {/* Khung ô Chat input */}
      <div className="p-3 border-top bg-white">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm rounded-start-3 bg-light border-end-0 py-2 shadow-none px-3"
            placeholder="Hỏi AI..."
            style={{ fontSize: "13px" }}
          />
          <button
            className="btn btn-primary btn-sm rounded-end-3 px-3 fw-semibold text-white border-start-0"
            style={{ backgroundColor: "#3525cd", borderColor: "#3525cd" }}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
