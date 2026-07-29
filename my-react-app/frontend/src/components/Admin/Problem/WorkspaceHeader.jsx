export default function WorkspaceHeader({ title, onBack }) {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3 bg-white p-2 px-3 rounded-3 shadow-sm border">
      <div className="d-flex align-items-center gap-3">
        <button className="btn btn-sm btn-outline-secondary rounded-3" onClick={onBack}>
          <i className="fa-solid fa-arrow-left me-2"></i>Quay lại Quản lý Bài tập
        </button>
        <span className="fw-bold text-primary fs-6">
          [Giảng viên Test] {title || "Xem trước IDE Bài tập"}
        </span>
      </div>
      <div className="d-flex align-items-center gap-2">
        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-3 py-2">
          Language: C#
        </span>
        <span className="badge bg-warning bg-opacity-10 text-warning border border-warning-subtle px-3 py-2 fw-semibold">
          Chế độ Test Giảng viên
        </span>
      </div>
    </div>
  );
}