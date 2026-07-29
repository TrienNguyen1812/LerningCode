import { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AdminApp({ onLogout }) {
  // Mặc định chọn Tab Dashboard
  const [activeTab, setActiveTab] = useState("dashboard");

  const [dashboardData, setDashboardData] = useState(null);
  const [instructorsData, setInstructorsData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const BASE_URL = "http://127.0.0.1:5000/api/admin";

  useEffect(() => {
    // 1. Fetch Dashboard Data
    fetch(`${BASE_URL}/dashboard`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDashboardData(data.data);
      })
      .catch((err) => console.error("Lỗi fetch dashboard:", err));

    // 2. Fetch Instructors Data
    fetch(`${BASE_URL}/instructors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setInstructorsData(data.data || []);
      })
      .catch((err) => console.error("Lỗi fetch instructors:", err));

    // 3. Fetch Students Data
    fetch(`${BASE_URL}/students`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudentsData(data.data || []);
      })
      .catch((err) => console.error("Lỗi fetch students:", err));
  }, []);

  const handleFilter = () => alert("Tính năng lọc nâng cao đang được phát triển!");
  const handleAddInstructor = () => alert("Tính năng thêm giảng viên mới đang được phát triển!");
  const handleExportCSV = () => alert("Đang xuất file Excel/CSV...");

  // ================= TAB DASHBOARD =================
  const DashboardTab = () => {
    if (!dashboardData) {
      return (
        <div className="p-5 text-center text-muted">
          <div className="spinner-border text-primary me-2" role="status"></div>
          Đang tải dữ liệu biểu đồ tổng quan...
        </div>
      );
    }

    const {
      totalStudents = 0,
      totalContents = 0,
      contentBreakdown = { courses: 0, problems: 0, coursePercent: 0, problemPercent: 0 },
      totalSubmissions = 0,
      passRate = "0%",
      submissionChart = [],
      topProblems = [],
      recentSubmissions = [],
    } = dashboardData;

    return (
      <div className="p-4">
        <h4 className="fw-bold text-dark mb-4">Dashboard Overview</h4>

        {/* 4 Thẻ KPI Chỉ số */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <p className="text-muted small fw-semibold mb-2">Total Students</p>
              <h3 className="fw-bold text-dark m-0">{totalStudents.toLocaleString()}</h3>
            </div>
          </div>

          {/* CẬP NHẬT: Total Contents */}
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted small fw-semibold mb-2">Total Contents</p>
                  <h3 className="fw-bold text-dark m-0">{totalContents.toLocaleString()}</h3>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill small">
                  {contentBreakdown.courses} C / {contentBreakdown.problems} P
                </span>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <p className="text-muted small fw-semibold mb-2">Total Submissions</p>
              <h3 className="fw-bold text-dark m-0">{totalSubmissions.toLocaleString()}</h3>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <p className="text-muted small fw-semibold mb-2">Accepted Rate</p>
              <h3 className="fw-bold text-success m-0">{passRate}</h3>
            </div>
          </div>
        </div>

        {/* Biểu đồ Cột + Biểu đồ Pie/Doughnut */}
        <div className="row g-3 mb-4">
          {/* Biểu đồ lượt nộp bài 6 tháng */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column">
              <h6 className="fw-bold mb-4">Submission Trend (6 Months)</h6>
              <div
                className="d-flex align-items-end justify-content-around flex-grow-1 pt-3"
                style={{ minHeight: "220px" }}
              >
                {submissionChart && submissionChart.length > 0 ? (
                  submissionChart.map((col, i) => (
                    <div
                      key={i}
                      className="d-flex flex-column align-items-center"
                      style={{ width: "12%" }}
                    >
                      <small className="text-muted mb-1 fw-semibold">{col.count}</small>
                      <div
                        className="w-100 rounded-top transition-all"
                        style={{
                          height: `${col.percent}%`,
                          backgroundColor: "#3525cd",
                          minHeight: col.count > 0 ? "6px" : "2px",
                        }}
                      ></div>
                      <span className="small text-muted mt-2 fw-semibold">{col.month}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted m-auto">Chưa có dữ liệu lượt nộp bài.</p>
                )}
              </div>
            </div>
          </div>

          {/* CẬP NHẬT: Biểu đồ Pie / Doughnut Chart cho Content Breakdown */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 d-flex flex-column align-items-center justify-content-between">
              <h6 className="fw-bold mb-3 w-100 text-start">Content Breakdown</h6>
              
              {/* Vòng tròn Doughnut vẽ bằng conic-gradient */}
              <div
                className="position-relative d-flex align-items-center justify-content-center my-2"
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  background: `conic-gradient(#3525cd 0% ${contentBreakdown.coursePercent}%, #0dcaf0 ${contentBreakdown.coursePercent}% 100%)`,
                }}
              >
                <div
                  className="bg-white rounded-circle d-flex flex-column align-items-center justify-content-center shadow-sm"
                  style={{ width: "95px", height: "95px" }}
                >
                  <span className="fw-bold fs-5 text-dark">{totalContents}</span>
                  <small className="text-muted" style={{ fontSize: "10px" }}>ITEMS</small>
                </div>
              </div>

              {/* Chú thích thông số Legend */}
              <div className="w-100 mt-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: "#3525cd" }}></span>
                    <span className="small text-muted fw-semibold">Courses</span>
                  </div>
                  <span className="small fw-bold text-dark">
                    {contentBreakdown.courses} ({contentBreakdown.coursePercent}%)
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle" style={{ width: "10px", height: "10px", backgroundColor: "#0dcaf0" }}></span>
                    <span className="small text-muted fw-semibold">Problems</span>
                  </div>
                  <span className="small fw-bold text-dark">
                    {contentBreakdown.problems} ({contentBreakdown.problemPercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top bài tập có nhiều submission nhất */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <h6 className="fw-bold mb-3">Top Submitted Problems</h6>
          <div className="d-flex flex-column gap-3">
            {topProblems && topProblems.length > 0 ? (
              topProblems.map((p, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="fw-semibold text-dark text-truncate me-2" style={{ maxWidth: "300px" }}>
                      {p.title}
                    </span>
                    <span className="text-muted fw-bold">{p.submissionsCount} subs</span>
                  </div>
                  <div className="progress bg-light" style={{ height: "6px" }}>
                    <div
                      className="progress-bar rounded-pill bg-success"
                      style={{ width: `${p.percent}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted m-0">Chưa có bài tập nào.</p>
            )}
          </div>
        </div>

        {/* Lượt nộp bài gần đây (Realtime Feeds) */}
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom">
            <h6 className="fw-bold m-0">Recent Submissions</h6>
          </div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4">Student</th>
                  <th>Problem</th>
                  <th>Language</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions && recentSubmissions.length > 0 ? (
                  recentSubmissions.map((s, i) => (
                    <tr key={i} className="border-bottom">
                      <td className="ps-4 py-3 fw-bold text-dark">{s.studentName}</td>
                      <td>{s.problemTitle}</td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-dark">
                          {s.language}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            s.status === "Accepted"
                              ? "bg-success bg-opacity-10 text-success"
                              : "bg-danger bg-opacity-10 text-danger"
                          }`}
                        >
                          • {s.status}
                        </span>
                      </td>
                      <td className="pe-4 text-end text-muted small">{s.submitDate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Chưa có lượt nộp bài nào gần đây.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ================= TAB GIẢNG VIÊN =================
  const InstructorsTab = () => {
    const filteredInstructors = instructorsData.filter((i) =>
      i.name.toLowerCase().includes(instructorSearch.toLowerCase())
    );
    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark m-0">Instructors Management</h4>
          <div className="d-flex gap-2">
            <button onClick={handleFilter} className="btn btn-white border fw-bold rounded-3 shadow-sm">
              <i className="fa-solid fa-filter me-2"></i>Filter
            </button>
            <button
              onClick={handleAddInstructor}
              className="btn text-white fw-bold rounded-3 shadow-sm"
              style={{ backgroundColor: "#3525cd" }}
            >
              <i className="fa-solid fa-user-plus me-2"></i>Add Instructor
            </button>
          </div>
        </div>
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom">
            <div className="position-relative" style={{ width: "350px" }}>
              <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control bg-light border-0 rounded-3 ps-5 text-sm"
                placeholder="Search instructors..."
                value={instructorSearch}
                onChange={(e) => setInstructorSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4">Name</th>
                  <th className="text-center">Courses</th>
                  <th className="text-center">Rating</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.length > 0 ? (
                  filteredInstructors.map((i) => (
                    <tr key={i.id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <h6 className="fw-bold m-0 text-dark small">{i.name}</h6>
                        <small className="text-muted">{i.email}</small>
                      </td>
                      <td className="fw-bold text-center small text-dark">{i.totalCourses}</td>
                      <td className="fw-bold text-center small text-dark">
                        <i className="fa-solid fa-star text-warning me-1"></i>
                        {i.rating}
                      </td>
                      <td>
                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">
                          • Active
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      Không tìm thấy giảng viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ================= TAB HỌC VIÊN =================
  const StudentsTab = () => {
    const filteredStudents = studentsData.filter((s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );
    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-dark m-0">Student Directory</h4>
          <button onClick={handleExportCSV} className="btn btn-white border fw-bold rounded-3 shadow-sm">
            <i className="fa-solid fa-file-export me-2"></i>Export CSV
          </button>
        </div>
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom">
            <div className="position-relative" style={{ width: "300px" }}>
              <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                className="form-control bg-light border-0 rounded-3 ps-5 text-sm"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-white text-muted small text-uppercase border-bottom">
                <tr>
                  <th className="ps-4">Student Name</th>
                  <th>Joined Date</th>
                  <th className="text-center">Courses</th>
                  <th style={{ width: "20%" }}>Progress</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <h6 className="fw-bold m-0 text-dark small">{s.name}</h6>
                        <small className="text-muted">{s.email}</small>
                      </td>
                      <td className="text-muted small">{s.joinedDate}</td>
                      <td className="fw-bold text-center text-dark small">{s.coursesEnrolled}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2 pe-3">
                          <div className="progress flex-grow-1" style={{ height: "6px" }}>
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${s.progress}%` }}
                            ></div>
                          </div>
                          <span className="small fw-bold text-dark">{s.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      Không tìm thấy sinh viên.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="d-flex"
      style={{
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* SIDEBAR BÊN TRÁI */}
      <div className="bg-white border-end d-flex flex-column" style={{ width: "260px" }}>
        <div className="p-4 d-flex align-items-center gap-2">
          <div
            className="rounded text-white d-flex align-items-center justify-content-center fw-bold"
            style={{
              width: "32px",
              height: "32px",
              backgroundColor: "#3525cd",
            }}
          >
            EA
          </div>
          <h5 className="fw-bold m-0 text-dark">EduAdmin Pro</h5>
        </div>

        <div className="px-3 flex-grow-1 mt-2 d-flex flex-column gap-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${
              activeTab === "dashboard" ? "text-primary" : "text-muted"
            }`}
            style={{
              backgroundColor: activeTab === "dashboard" ? "#f5f3ff" : "transparent",
              color: activeTab === "dashboard" ? "#3525cd" : "",
            }}
          >
            <i className="fa-solid fa-border-all me-3"></i>Dashboard
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${
              activeTab === "students" ? "text-primary" : "text-muted"
            }`}
            style={{
              backgroundColor: activeTab === "students" ? "#f5f3ff" : "transparent",
              color: activeTab === "students" ? "#3525cd" : "",
            }}
          >
            <i className="fa-solid fa-users me-3"></i>Students
          </button>

          <button
            onClick={() => setActiveTab("instructors")}
            className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${
              activeTab === "instructors" ? "text-primary" : "text-muted"
            }`}
            style={{
              backgroundColor: activeTab === "instructors" ? "#f5f3ff" : "transparent",
              color: activeTab === "instructors" ? "#3525cd" : "",
            }}
          >
            <i className="fa-solid fa-chalkboard-user me-3"></i>Instructors
          </button>

          <button
            onClick={onLogout}
            className="btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 text-danger mt-auto mb-3"
            style={{ backgroundColor: "#fef2f2" }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket me-3"></i>Log out
          </button>
        </div>
      </div>

      {/* CONTENT CHÍNH BÊN PHẢI */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto">
        <div className="bg-white border-bottom px-4 py-3 sticky-top">
          <div className="position-relative" style={{ width: "400px" }}>
            <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-light border-0 rounded-pill ps-5 text-sm"
              placeholder="Search resources..."
            />
          </div>
        </div>

        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "instructors" && <InstructorsTab />}
        {activeTab === "students" && <StudentsTab />}
      </div>

      <style>{`
        .custom-table th, .custom-table td { padding-top: 1rem; padding-bottom: 1rem; vertical-align: middle; } 
        .btn-white { background-color: #fff; } 
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
}