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

export default function StudentDashboard() {
  // Dữ liệu mẫu danh sách khóa học
  const myCourses = [
    {
      id: 1,
      title: "Cấu trúc dữ liệu & Giải thuật",
      rating: 4.8,
      progress: 45,
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Thiết kế hệ thống",
      rating: 5.0,
      progress: 12,
      image: "https://images.unsplash.com/photo-1511376777868-611b54f68947?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: 3,
      title: "JavaScript Fundamentals",
      rating: 3.9,
      progress: 100,
      image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=400&auto=format&fit=crop",
    },
  ];

  // Dữ liệu mô phỏng deadline bài tập
  const assignmentDeadlines = [
    {
      id: 1,
      title: "Bài tập tuần 3: Đệ quy & Con trỏ",
      course: "Lập trình Cơ bản",
      dueDate: "Thứ 4, 12/06",
      status: "expired",
    },
    {
      id: 2,
      title: "Dự án giữa kỳ: Xây dựng CLI App",
      course: "JavaScript Cơ bản",
      dueDate: "Chủ nhật, 25/06",
      status: "pending",
    },
    {
      id: 3,
      title: "Trắc nghiệm tự đánh giá vòng lặp",
      course: "Nền tảng AI hỗ trợ",
      dueDate: "Đã hoàn thành",
      status: "completed",
    },
  ];

  return (
    <div className="min-vh-100 text-dark font-sans w-100 m-0 p-0 position-relative" style={{ backgroundColor: "#f7f9fb" }}>
      
      {/* Top Navbar */}
      <Navbar />

      {/* Main Layout */}
      <div className="container-fluid pt-5 mt-4 px-0">
        <div className="row g-0 w-100 m-0">
          
          {/* Sidebar Left */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="col-12 col-md-9 col-xl-10 p-3 p-md-4 bg-light" style={{ backgroundColor: "#f7f9fb" }}>
            <div className="w-100">
              
              <WelcomeBanner name="Alex" />

              <LearningProgress />

              {/* Grid: Calendar & Deadlines */}
              <section className="mb-5">
                <h4 className="fw-bold mb-4">Hoạt động học tập</h4>
                <div className="row g-4">
                  <div className="col-12 col-xl-7">
                    <Calendar />
                  </div>
                  <div className="col-12 col-xl-5">
                    <DeadlinePanel deadlines={assignmentDeadlines} />
                  </div>
                </div>
              </section>

              {/* Section: My Courses */}
              <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold m-0 position-relative d-inline-block text-dark">
                    Khóa học của tôi
                    <span className="position-absolute bottom-0 start-0 bg-primary rounded-pill" style={{ height: "4px", width: "35px", bottom: "-6px", backgroundColor: "#3525cd" }}></span>
                  </h4>
                  <button className="btn btn-link text-primary p-0 fw-bold d-flex align-items-center gap-1 text-decoration-none small hover-translate-x">
                    Xem tất cả <i className="fa-solid fa-arrow-right" style={{ fontSize: "12px" }}></i>
                  </button>
                </div>

                <div className="row g-4">
                  {myCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      {/* CSS Global Overrides */}
      <style>{`
        html, body, #root, #app {
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          background-color: #f7f9fb !important;
        }
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .cursor-pointer { cursor: pointer; }
        .transition-all { transition: all 0.2s ease-in-out; }
        .row-cols-7 > * { flex: 0 0 14.2857142857%; max-width: 14.2857142857%; }
        .custom-course-card { transition: transform 0.25s ease, box-shadow 0.25s ease !important; }
        .custom-course-card:hover { transform: translateY(-6px); box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.08) !important; }
        .course-card-img { transition: transform 0.4s ease; }
        .custom-course-card:hover .course-card-img { transform: scale(1.06); }
        .course-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 44px;
        }
        .hover-translate-x:hover i { transform: translateX(4px); transition: transform 0.2s ease; }
        .font-awesome-stars .fa-star, .font-awesome-stars .fa-star-half-stroke {
          font-family: "Font Awesome 5 Free", "Font Awesome 6 Free" !important;
          font-weight: 900 !important;
        }
      `}</style>
    </div>
  );
}