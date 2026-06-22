export default function LessonItem({ lesson, onSelectProblem }) {
  // Hàm xử lý khi click vào hàng bài học
  const handleItemClick = () => {
    // Chỉ kích hoạt mở không gian code nếu bài học là Coding Exercise và không bị khóa
    if (lesson.type === "Coding Exercise" && lesson.status !== "locked") {
      onSelectProblem(lesson);
    }
  };

  return (
    <div 
      className={`list-group-item d-flex align-items-center justify-content-between border-0 border-bottom border-light px-4 py-3.5 ${
        lesson.isCurrent ? "bg-primary bg-opacity-10" : ""
      } ${lesson.type === "Coding Exercise" ? "cursor-pointer hover-bg-light" : ""}`}
      onClick={handleItemClick} // Gắn sự kiện click
    >
      <div className="d-flex align-items-center gap-3">
        {/* Icon trạng thái bài học */}
        {lesson.status === "completed" && <div className="text-success fs-5"><i className="fa-solid fa-circle-check"></i></div>}
        {lesson.status === "learning" && <div className="text-primary fs-5"><i className="fa-solid fa-circle-play"></i></div>}
        {lesson.status === "locked" && <div className="text-muted opacity-50 fs-5"><i className="fa-solid fa-lock"></i></div>}

        {/* Tiêu đề & Thông tin thời lượng */}
        <div className={lesson.status === "locked" ? "text-muted opacity-50" : ""}>
          <div className={`mb-1 ${lesson.status === "completed" ? "text-decoration-line-through text-muted" : "fw-medium text-dark"}`} style={{ fontSize: "14px" }}>
            {lesson.title}
            {lesson.isCurrent && <span className="badge bg-primary ms-2 text-uppercase" style={{ fontSize: "9px" }}>Tiếp</span>}
          </div>
          <div className="text-muted small d-flex align-items-center gap-2" style={{ fontSize: "12px" }}>
            <i className={lesson.type === "Video" ? "fa-solid fa-circle-play" : lesson.type === "Coding Exercise" ? "fa-solid fa-code" : "fa-regular fa-file-lines"}></i>
            {lesson.type} • {lesson.duration}
          </div>
        </div>
      </div>

      {/* Nút hành động */}
      {lesson.isCurrent && (
        <button className="btn btn-primary btn-sm rounded-3 px-4 py-2 fw-semibold" style={{ fontSize: "13px" }}>
          {lesson.type === "Coding Exercise" ? "Code ngay" : "Học ngay"}
        </button>
      )}
    </div>
  );
}