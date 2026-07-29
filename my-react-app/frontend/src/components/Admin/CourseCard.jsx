import UsersIcon from "../../assets/icons/user.svg";
import StatusIcon from "../../assets/icons/tick-circle-outline.svg";
import MoreIcon from "../../assets/icons/more.svg";

export default function CourseCard({ course, onDetail, onDelete, onAssign }) {
  const {
    id,
    IdCourse,
    name,
    title,
    enrolled = 0,
    completionRate = 0,
    // 🌟 Ưu tiên lấy 'thumbnail' từ DB, nếu không có mới dùng 'image' hoặc link dự phòng
    thumbnail,
    image,
  } = course;

  const courseId = id || IdCourse;
  const courseName = name || title || "Khóa học chưa có tên";
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
  const courseImage = thumbnail || image || DEFAULT_IMAGE;

  return (
    <div className="col">
      <div className="card h-100 border-light-subtle shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
        
        {/* 1. TOP LINE: Dòng chứa nút 3 chấm riêng biệt nằm trên cùng */}
        <div className="d-flex justify-content-end p-2 border-bottom border-light-subtle bg-white">
          <div className="dropdown">
            <button
              className="btn btn-link p-1 border-0 lh-1 d-flex align-items-center justify-content-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: "#f8f9fa" }}
            >
              <img 
                src={MoreIcon} 
                alt="More" 
                style={{ width: "16px", height: "16px", objectFit: "contain" }} 
              />
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-light-subtle py-1">
              <li>
                <button
                  className="dropdown-item py-2 d-flex align-items-center gap-2 text-secondary fs-6"
                  type="button"
                  onClick={() => onDetail && onDetail(courseId)}
                >
                  <i className="fa-solid fa-circle-info"></i>Detail
                </button>
              </li>
              <li>
                <hr className="dropdown-divider my-1 text-light-subtle" />
              </li>
              <li>
                <button
                  className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger fs-6"
                  type="button"
                  onClick={() => onDelete && onDelete(courseId, courseName)}
                >
                  <i className="fa-regular fa-trash-can"></i> Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* 2. COURSE IMAGE: Hiển thị hình ảnh thực tế từ CSDL */}
        <div className="bg-light" style={{ height: "150px", width: "100%", overflow: "hidden" }}>
          <img
            src={courseImage}
            className="w-100 h-100 object-fit-cover"
            style={{ objectFit: "cover", cursor: "pointer" }}
            alt={courseName}
            onClick={() => onDetail && onDetail(courseId)}
            onError={(e) => {
              // Dự phòng trường hợp file ảnh trên server bị mất hoặc lỗi link
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
            }}
          />
        </div>

        {/* 3. CARD BODY */}
        <div className="card-body p-3 d-flex flex-column justify-content-between">
          <div>
            {/* Tên khóa học */}
            <h6
              className="fw-bold text-dark mb-2"
              title={courseName}
              style={{
                fontSize: "14px",
                lineHeight: "1.4",
                minHeight: "40px",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                cursor: "pointer"
              }}
              onClick={() => onDetail && onDetail(courseId)}
            >
              {courseName}
            </h6>

            {/* Số lượng học viên */}
            <div className="d-flex align-items-center gap-2 text-muted mb-3">
              <img
                src={UsersIcon}
                alt="Students"
                style={{ width: "14px", height: "14px", display: "block", objectFit: "contain" }}
              />
              <span className="fw-medium" style={{ fontSize: "12px" }}>
                {enrolled} Learner{Number(enrolled) > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div>
            {/* COMPLETION RATE ROW */}
            <div className="border-top pt-2 pb-3 text-center">
              <span className="text-muted d-block mb-1" style={{ fontSize: "12px" }}>
                Completion rate
              </span>
              <div className="d-flex align-items-center justify-content-center gap-2 text-dark fw-bold fs-6">
                <div className="d-flex align-items-center" style={{ width: "16px", height: "16px" }}>
                  <img
                    src={StatusIcon}
                    alt="Status"
                    className="w-100 h-100 object-fit-contain"
                    style={{ display: "block", objectFit: "contain" }}
                  />
                </div>
                <span className="lh-1">{completionRate}%</span>
              </div>
            </div>

            {/* ASSIGN ACTION BUTTON */}
            <button
              type="button"
              className="btn btn-outline-info w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1"
              style={{ borderRadius: "8px", fontSize: "13px" }}
              onClick={() => onAssign && onAssign(course)}
            >
              <span className="fs-5 lh-1">+</span> Assign
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}