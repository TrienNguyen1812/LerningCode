import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Import components Navbar & Banner
import Navbar from "../components/Navbar";
import WelcomeBanner from "../components/Welcomebanner";

// Import Pages
import CourseDetailPage from "../pages/CourseDetailPage";
import ProblemWorkspacePage from "../pages/ProblemWorkspace";

// Import UI Components
import StudentStats from "../components/User/StudentStats";
import RightSidebarPanel from "../components/User/RightSidebarPanel";
import AssignedCourseCard from "../components/User/AssignedCourseCard";

export default function StudentDashboard({ currentUser, onLogout }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  // Thêm state này để ép StudentStats tải lại API ngay sau khi nộp bài xong
  const [refreshStatsTrigger, setRefreshStatsTrigger] = useState(0);

  const [myCourses, setMyCourses] = useState([]);
  const [assignmentDeadlines, setAssignmentDeadlines] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const userId = currentUser?.id || currentUser?.IdUser;
      if (!userId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `http://localhost:5000/api/students/${userId}/dashboard`
        );

        if (!response.ok) {
          throw new Error("Lỗi máy chủ: Không thể tải danh sách khóa học.");
        }

        const data = await response.json();

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

  // TRƯỜNG HỢP LÀM BÀI TẬP: Full màn hình
  if (selectedProblem) {
    return (
      <ProblemWorkspacePage
        problem={selectedProblem}
        onExitWorkspace={() => {
          setSelectedProblem(null);
          // Tăng trigger lên 1 để ép StudentStats gọi lại API thống kê mới nhất
          setRefreshStatsTrigger((prev) => prev + 1);
        }}
      />
    );
  }

  return (
    <div
      className="min-vh-100 text-dark font-sans w-100 m-0 p-0 position-relative"
      style={{ backgroundColor: "#f0f2f5" }}
    >
      {/* Header Navbar */}
      <Navbar currentUser={currentUser} onLogout={onLogout} />

      {/* Vùng bao quanh chính */}
      <div className="container-xl pt-5 mt-4 pb-5 px-3 px-md-4">
        {/* KHỐI CARD TRẮNG BAO BỌC TOÀN BỘ BẢNG ĐIỀU HƯỚNG */}
        <div className="bg-white rounded-4 shadow-sm border p-4 p-md-5 my-3">
          {isLoading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: "50vh" }}
            >
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-danger shadow-sm" role="alert">
              <i className="fa-solid fa-triangle-exclamation me-2"></i> {error}
            </div>
          ) : selectedCourse ? (
            // MÀN HÌNH CHI TIẾT KHÓA HỌC
            <div>
              <button
                className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-3 d-flex align-items-center gap-2 fw-semibold"
                onClick={() => setSelectedCourse(null)}
              >
                <i className="fa-solid fa-arrow-left-long"></i> Quay lại
                Dashboard
              </button>

              <CourseDetailPage
                course={selectedCourse}
                onStartCoding={(problem) => setSelectedProblem(problem)}
              />
            </div>
          ) : (
            // MÀN HÌNH DASHBOARD CHÍNH (LAYOUT THEO FIGMA GỐC)
            <>
              {/* 1. Welcome Banner */}
              <WelcomeBanner
                name={
                  currentUser?.fullName ||
                  currentUser?.FullName ||
                  "Trịnh Triển Nguyên"
                }
              />

              {/* 2. Your Statistic - TRUYỀN REFRESH TRIGGER VÀO DƯỚI */}
              <div className="mb-4">
                <StudentStats
                  currentUser={currentUser}
                  refreshKey={refreshStatsTrigger}
                />
              </div>

              {/* 3. LƯỚI BÊN DƯỚI: ASSIGNED ITEMS (TRÁI) & SUMMARY + GROUP (PHẢI) */}
              <div className="row g-4">
                {/* CỘT TRÁI (8 CỘT): Assigned Items */}
                <div className="col-12 col-xl-8">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-dark m-0 fs-5">
                      Assigned Items
                    </h6>
                    <button
                      className="btn btn-link text-primary p-0 text-decoration-none border-0 bg-transparent fw-semibold"
                      style={{ fontSize: "13px" }}
                    >
                      View My Content
                    </button>
                  </div>

                  {myCourses.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-3 border">
                      <p className="text-muted mb-3">
                        Bạn chưa đăng ký tham gia khóa học nào.
                      </p>
                      <button className="btn btn-primary rounded-pill px-4">
                        Khám phá khóa học
                      </button>
                    </div>
                  ) : (
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
                      {myCourses.map((course) => (
                        <div key={course.id || course.IdCourse}>
                          <AssignedCourseCard
                            course={course}
                            onClick={() => setSelectedCourse(course)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CỘT PHẢI (4 CỘT): Learning Item Summary & My Group */}
                <div className="col-12 col-xl-4">
                  <RightSidebarPanel />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global CSS Overrides */}
      <style>{`
        html, body, #root, #app { 
          margin: 0 !important; 
          padding: 0 !important; 
          max-width: 100% !important; 
          width: 100% !important; 
          background-color: #f0f2f5 !important; 
        }
        .hover-lift { 
          transition: transform 0.2s ease, box-shadow 0.2s ease; 
        }
        .hover-lift:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important; 
        }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}