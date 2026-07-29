import SettingsDropdown from "./SettingDropdown";

export default function CourseHeader({ course, isLocked, setIsLocked, onEdit, onPreview, onDelete }) {
  const defaultCover = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop";

  // Lấy giá trị tương thích giữa format Facade (camelCase) và CSDL gốc (PascalCase)
  const title = course?.name || course?.CourseName || "Chưa có tên khóa học";
  const coverImage = course?.thumbnail || course?.Thumbnail || defaultCover;
  const courseId = course?.id || course?.IdCourse || "N/A";
  
  // Xử lý hiển thị ngày tạo/cập nhật
  const createdDate = course?.updatedAt || (course?.CreateDate ? new Date(course.CreateDate).toLocaleDateString("vi-VN") : "N/A");

  return (
    <>
      {/* Thumbnail Khóa học */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 position-relative">
        <div style={{ height: "260px", width: "100%" }}>
          <img
            src={coverImage}
            alt={title}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        <button
          className="btn btn-light bg-white rounded-3 shadow-sm border-0 position-absolute bottom-0 end-0 m-3 px-3 py-2 fw-medium text-secondary"
          style={{ fontSize: "13px" }}
        >
          Cập nhật ảnh bìa
        </button>
      </div>

      {/* Thông tin khóa học & Nút thao tác */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">
            {title}
          </h3>
          <div className="d-flex align-items-center gap-2 text-muted small">
            <span>Ngày tạo: {createdDate}</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary bg-white text-dark rounded-3 px-3 py-2 fw-medium border"
            onClick={onEdit}
          >
            Chỉnh sửa
          </button>

          <button
            className="btn btn-outline-secondary bg-white text-dark rounded-3 px-3 py-2 fw-medium border"
            onClick={onPreview}
          >
            Xem giao diện Học viên
          </button>

          <SettingsDropdown
            isLocked={isLocked}
            setIsLocked={setIsLocked}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>
    </>
  );
}