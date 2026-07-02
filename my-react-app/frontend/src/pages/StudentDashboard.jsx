import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import components
import Navbar from "../component/Navbar";
import Sidebar from "../component/Sidebar";
import WelcomeBanner from "../component/WelcomeBanner";
import LearningProgress from "../component/LearningProgress";
import Calendar from "../component/Calendar";
import DeadlinePanel from "../component/DeadlinePanel";
import CourseCard from "../component/CourseCard";
import CourseDetailPage from "./CourseDetailPage"; 
import ProblemWorkspacePage from "./ProblemWorkspace"; 

// 1. Nhận currentUser và onLogout từ App.jsx truyền xuống
export default function StudentDashboard({ currentUser, onLogout }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // 2. Thay dữ liệu tĩnh bằng State quản lý dữ liệu động
  const [myCourses, setMyCourses] = useState([]);
  const [assignmentDeadlines, setAssignmentDeadlines] = useState([]);
  
  // State quản lý trạng thái tải dữ liệu
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. Tự động gọi API lấy khóa học khi trang được mở
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.id) return;

      try {
        setIsLoading(true);
        setError(null);

        // LƯU Ý: Đổi URL này thành Endpoint API thực tế trên ASP.NET Core backend của bạn
        // Ví dụ: `https://localhost:5001/api/students/${currentUser.id}/dashboard`
        const response = await fetch(`http://localhost:5000/api/students/${currentUser.id}/dashboard`);

        if (!response.ok) {
          throw new Error("Lỗi máy chủ: Không thể tải danh sách khóa học.");
        }

        const data = await response.json();
        
        // Cập nhật state với dữ liệu trả về (Giả định cấu trúc JSON có 2 mảng này)
        setMyCourses(data.enrolledCourses || []);
        setAssignmentDeadlines(data.deadlines || []);

      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // TRƯỜNG HỢP LÀM BÀI TẬP: Bung lụa 100% full màn hình, không sidebar
  if (selectedProblem) {
    return (
      <ProblemWorkspacePage 
        problem={selectedProblem} 
        onExitWorkspace={() => setSelectedProblem(null)} 
      />
    );
  }

  return (
    <div
      className="min-vh-100 text-dark font-sans w-100 m-0 p-0 position-relative"
      style={{ backgroundColor: "#f7f9fb" }}
    >
      {/* Top Navbar - Chuyền hàm onLogout để Navbar xử lý nút đăng xuất */}
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Main Layout */}
      <div className="container-fluid pt-5 mt-2 px-0">
        <div className="row g-0 w-100 m-0">
          
          {/* Sidebar Left */}
          <Sidebar />

          {/* Main Content Area */}
          <main
            className="col-12 col-md-9 col-xl-10 p-3 p-md-4 bg-light"
            style={{ backgroundColor: "#f7f9fb" }}
          >
            <div className="w-100">
              
              {/* KIỂM TRA TRẠNG THÁI LOADING / ERROR TRƯỚC KHI RENDER DỮ LIỆU */}
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải dữ liệu...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger m-4 shadow-sm" role="alert">
                  <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
                </div>
              ) : selectedCourse ? (
                
                // MÀN HÌNH CHI TIẾT KHÓA HỌC
                <div>
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-3 d-flex align-items-center gap-2 fw-semibold"
                    onClick={() => setSelectedCourse(null)}
                  >
                    <i className="fa-solid fa-arrow-left-long"></i> Quay lại Dashboard
                  </button>

                  <CourseDetailPage 
                    course={selectedCourse} 
                    onStartCoding={(problem) => setSelectedProblem(problem)}
                  />
                </div>

              ) : (

                // MÀN HÌNH DASHBOARD CHÍNH
                <>
                  {/* Tên hiển thị tự động lấy từ currentUser */}
                  <WelcomeBanner name={currentUser?.fullName || "Học viên"} />

                  <LearningProgress />

                  {/* Vùng Lịch & Deadlines */}
                  <section className="mb-5">
                    <h4 className="fw-bold mb-4 text-start">Hoạt động học tập</h4>
                    <div className="row g-4">
                      <div className="col-12 col-lg-7 col-xl-7">
                        <Calendar />
                      </div>
                      <div className="col-12 col-lg-5 col-xl-5">
                        <DeadlinePanel deadlines={assignmentDeadlines} />
                      </div>
                    </div>
                  </section>

                  {/* Section Khóa học của tôi */}
                  <section className="mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h4 className="fw-bold m-0 position-relative d-inline-block text-dark">
                        Khóa học của tôi
                        <span
                          className="position-absolute bottom-0 start-0 bg-primary rounded-pill"
                          style={{ height: "4px", width: "35px", bottom: "-6px", backgroundColor: "#3525cd" }}
                        ></span>
                      </h4>
                      <button className="btn btn-link text-primary p-0 fw-bold d-flex align-items-center gap-1 text-decoration-none small hover-translate-x">
                        Xem tất cả <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px" }}></i>
                      </button>
                    </div>

                    <div className="row g-4">
                      {/* Thông báo hiển thị nếu sinh viên chưa enroll khóa nào */}
                      {myCourses.length === 0 ? (
                        <div className="col-12 text-center py-5 bg-white rounded-3 shadow-sm">
                          <p className="text-muted mb-3 mt-3">Bạn chưa đăng ký tham gia khóa học nào.</p>
                          <button className="btn btn-primary rounded-pill px-4 mb-3">Khám phá khóa học</button>
                        </div>
                      ) : (
                        myCourses.map((course) => (
                          <div
                            key={course.id}
                            onClick={() => setSelectedCourse(course)}
                            className="col-12 col-sm-6 col-lg-4 cursor-pointer"
                          >
                            <CourseCard course={course} />
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* CSS Global Overrides */}
      <style>{`
        html, body, #root, #app { margin: 0 !important; padding: 0 !important; max-width: 100% !important; width: 100% !important; background-color: #f7f9fb !important; }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
        
        .row-cols-7 { display: flex !important; flex-wrap: wrap !important; }
        .row-cols-7 > * { flex: 0 0 14.2857142857% !important; max-width: 14.2857142857% !important; }

        .custom-course-card { transition: transform 0.25s ease, box-shadow 0.25s ease !important; }
        .custom-course-card:hover { transform: translateY(-6px); box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important; }
        .course-card-img { transition: transform 0.4s ease; }
        .custom-course-card:hover .course-card-img { transform: scale(1.06); }
        .course-title { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; height: 44px; }
        .hover-translate-x:hover i { transform: translateX(4px); transition: transform 0.2s ease; }
      `}</style>
    </div>
  );
}