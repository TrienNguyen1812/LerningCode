import { useState } from "react";
import ChapterCard from "../component/ChapterCard";

// NHẬN PROP onStartCoding TỪ STUDENTDASHBOARD TRUYỀN XUỐNG
export default function CourseDetailPage({onStartCoding }) {

  const [courseData] = useState({
    title: "Lập trình ReactJS Nâng cao",
    category: "REACTJS NÂNG CAO",
    description: "Làm chủ các kỹ thuật nâng cao trong React như Custom Hooks, Render Props, React Context API, và quản lý state phức tạp với Redux Toolkit.",
    overallProgress: 65,
    chapters: [
      {
        id: "01",
        title: "Chương 1: Khởi đầu với Hooks",
        completedCount: 4,
        totalCount: 4,
        isLocked: false,
        lessons: [
          { id: 1, title: "Bài 1: Giới thiệu về Hooks và động lực ra đời", type: "Video", duration: "12:45", status: "completed" },
          { id: 2, title: "Bài 2: Sử dụng useEffect chuyên sâu", type: "Reading", duration: "15 phút", status: "completed" },
        ],
      },
      {
        id: "02",
        title: "Chương 2: State Management with Redux",
        completedCount: 1,
        totalCount: 5,
        isLocked: false,
        lessons: [
          { id: 3, title: "Bài 1: Redux Architecture and Setup", type: "Video", duration: "25:30", status: "completed" },
          { id: 4, title: "Bài 2: Redux Toolkit: Slice and Thunk", type: "Coding Exercise", duration: "45:00", status: "learning", isCurrent: true },
          { id: 5, title: "Bài 3: Quản lý Global State phức tạp", type: "Video", duration: "18:20", status: "locked" },
        ],
      },
      {
        id: "03",
        title: "Chương 3: Performance Optimization",
        completedCount: 0,
        totalCount: 0,
        isLocked: true,
        lessons: [],
      },
    ],
  });

  return (
    // Đổi lại padding px-0 để khớp với khung main bên Dashboard, không bị thụt lề thụt góc
    <div className="container-fluid py-2 px-0 text-start">
      
      {/* Khối tiêu đề khóa học & Widget Tiến độ */}
      <div className="row align-items-center mb-4">
        <div className="col-12 col-md-8">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 text-uppercase fw-semibold" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
              <li className="breadcrumb-item">
                <a href="#courses" className="text-decoration-none text-muted">Courses</a>
              </li>
              <li className="breadcrumb-item active text-primary" aria-current="page">
                {courseData.category}
              </li>
            </ol>
          </nav>
          <h2 className="fw-bold text-dark mb-2">{courseData.title}</h2>
          <p className="text-muted mb-0 col-lg-10" style={{ fontSize: "14px", lineHeight: "1.6" }}>
            {courseData.description}
          </p>
        </div>

        {/* Khối Box Tiến độ bên phải */}
        <div className="col-12 col-md-4 mt-3 mt-md-0">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: "11px" }}>
                Tiến độ khóa học
              </span>
              <span className="fw-bold text-primary fs-4">
                {courseData.overallProgress}%
              </span>
            </div>
            <button className="btn btn-primary w-100 rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2">
              Tiếp tục học <i className="fa-regular fa-circle-play"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Khu vực danh sách các chương mục */}
      <div className="row">
        <div className="col-12">
          {courseData.chapters.map((chapter) => (
            <ChapterCard 
              key={chapter.id} 
              chapter={chapter} 
              // ĐẨY SỰ KIỆN LÊN THẲNG HÀM TRÊN TRANG CHỦ DASHBOARD
              onSelectProblem={onStartCoding} 
            />
          ))}
        </div>
      </div>

    </div>
  );
}