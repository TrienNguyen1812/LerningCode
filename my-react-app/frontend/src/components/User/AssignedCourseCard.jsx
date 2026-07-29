export default function AssignedCourseCard({ course, onClick }) {
  // 1. Lấy tên khóa học từ DB DevLearnerDB
  const courseName =
    course?.CourseName ||
    course?.courseName ||
    course?.name ||
    course?.Title ||
    "Khóa học không tên";

  // 2. Lấy dữ liệu Thumbnail từ DB DevLearnerDB
  const rawThumbnail = course?.Thumbnail || course?.thumbnail || course?.image;

  // 3. Xử lý đường dẫn ảnh (Chống lỗi broken image)
  const getImageUrl = (url) => {
    if (!url) {
      // Ảnh fallback mặc định khi DB bị NULL
      return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80";
    }
    // Nếu link bắt đầu bằng http/https thì giữ nguyên
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    // Nếu link trong DB là dạng tương đối (/uploads/abc.jpg) -> Ghép domain backend
    return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const thumbnailUrl = getImageUrl(rawThumbnail);

  return (
    <div
      onClick={onClick}
      className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden cursor-pointer hover-lift"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Khung chứa ảnh */}
      <div style={{ height: "135px", overflow: "hidden", backgroundColor: "#eef2f6" }}>
        <img
          src={thumbnailUrl}
          alt={courseName}
          className="w-100 h-100 object-fit-cover"
          onError={(e) => {
            // Khi link ảnh bị hỏng/404, tự đổi sang ảnh mặc định
            e.target.onerror = null;
            e.target.src =
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&q=80";
          }}
        />
      </div>

      {/* Nội dung bên dưới */}
      <div className="card-body p-3 d-flex flex-column justify-content-between">
        <div>
          <h6
            className="fw-bold text-dark mb-1 text-truncate-2"
            style={{ fontSize: "14px", lineHeight: "1.3", minHeight: "36px" }}
            title={courseName}
          >
            {courseName}
          </h6>
          <p className="text-muted mb-3" style={{ fontSize: "11px" }}>
            <i className="fa-regular fa-clock me-1"></i> Đã ghi danh
          </p>
        </div>

        <button
          className="btn btn-sm w-100 rounded-2 fw-semibold"
          style={{
            backgroundColor: "#e6f7f5",
            color: "#00bba7",
            border: "none",
            fontSize: "12px",
            padding: "6px 0",
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}