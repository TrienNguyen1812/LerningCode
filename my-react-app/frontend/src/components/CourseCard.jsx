export default function CourseCard({ course }) {
  // Đường link ảnh mặc định chủ đề lập trình/công nghệ cực đẹp nếu DB chưa có ảnh
  const defaultCourseImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop";

  return (
    // Đã xóa thẻ <div className="col-12 col-md-6 col-lg-4"> ở ngoài cùng
    // Thẻ ngoài cùng giờ đây bắt đầu trực tiếp bằng khối .card
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-white custom-course-card text-start">
      
      {/* Khung ảnh khóa học */}
      <div className="ratio ratio-16x9 overflow-hidden position-relative img-wrapper">
        <img 
          src={course.image || defaultCourseImage} // Nếu không có ảnh từ DB, tự động lấy ảnh mặc định
          alt={course.title} 
          className="w-100 h-100 course-card-img" 
          style={{ objectFit: "cover" }} // Ép cứng style để đảm bảo ảnh luôn cắt cúp chuẩn, không méo
        />
        <div className="position-absolute top-0 start-0 m-3">
          <span className="badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1.5 fw-semibold backdrop-blur" style={{ fontSize: "11px", backdropFilter: "blur(4px)" }}>
            E-Learning
          </span>
        </div>
      </div>

      {/* Nội dung Card */}
      <div className="p-4 d-flex flex-column justify-content-between" style={{ flexGrow: 1 }}>
        <div>
          <h5 className="fw-bold text-dark mb-2 lh-base course-title" style={{ fontSize: "16px" }}>
            {course.title}
          </h5>

          {/* ĐÃ XÓA TOÀN BỘ KHỐI ĐÁNH GIÁ SAO (RATING) TẠI ĐÂY ĐỂ TRÁNH LỖI CRASH */}
        </div>

        {/* Thanh tiến độ */}
        <div className="mt-2">
          <div className="d-flex align-items-center justify-content-between mb-1.5">
            <span className="text-muted small fw-medium">Tiến độ</span>
            <span className="fw-bold small" style={{ color: course.progress === 100 ? "#198754" : "#3525cd" }}>
              {course.progress === 100 ? "Hoàn thành!" : `${course.progress}%`}
            </span>
          </div>

          <div className="progress bg-light shadow-none" style={{ height: "6px", borderRadius: "10px" }}>
            <div
              className={`progress-bar rounded-pill ${course.progress === 100 ? "bg-success" : "bg-primary"}`}
              role="progressbar"
              style={{ 
                width: `${course.progress}%`, 
                backgroundColor: course.progress === 100 ? "#198754" : "#3525cd" 
              }}
              aria-valuenow={course.progress}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}