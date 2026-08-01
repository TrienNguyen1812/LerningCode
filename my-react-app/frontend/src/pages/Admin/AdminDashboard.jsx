import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Import các component layout & tab tĩnh
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";
import DashboardTab from "../../components/admin/DashboardTab";
import InstructorsTab from "../../components/admin/InstructorsTab";
import StudentsTab from "../../components/admin/StudentsTab";

// Import các trang Quản lý tự ôm trọn logic
import CourseManagement from "../Admin/CourseManagement";
import FilesManagement from "../Admin/FileManagement";
import CourseDetail from "./CourseDetail";
import ProblemManager from "./ProblemManagement";
import AiInboxAnalyticsPage from "../Admin/AiInboxAnalyticsPage"; // 👈 1. IMPORT INBOX PAGE

// IMPORT FILE CSS 
import "../css/AdminDashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AdminDashboard({ onLogout, overrideTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: urlCourseId } = useParams();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [instructorsData, setInstructorsData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const BASE_URL = "http://127.0.0.1:5000/api/admin";

  // Lắng nghe thay đổi đường dẫn URL
  useEffect(() => {
    const path = location.pathname;

    if (urlCourseId || overrideTab === "course-detail" || path.includes("/admin/courses/")) {
      const extractedId = urlCourseId || path.split("/").pop();
      setSelectedCourseId(extractedId);
      setActiveTab("course-detail");
    } else if (path.includes("/admin/courses")) {
      setActiveTab("courses");
      setSelectedCourseId(null);
    } else if (path.includes("/admin/inbox")) { // 👈 2. XỬ LÝ PATH INBOX
      setActiveTab("inbox");
    } else if (path.includes("/admin/files")) {
      setActiveTab("files");
    } else if (path.includes("/admin/instructors")) {
      setActiveTab("instructors");
    } else if (path.includes("/admin/students")) {
      setActiveTab("students");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname, urlCourseId, overrideTab]);

  // Đổ dữ liệu ban đầu
  useEffect(() => {
    fetch(`${BASE_URL}/dashboard`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setDashboardData(data.data))
      .catch((err) => console.warn("Lỗi fetch dashboard:", err));

    fetch(`${BASE_URL}/instructors`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setInstructorsData(data.data || []))
      .catch((err) => console.warn("Lỗi fetch instructors:", err));

    fetch(`${BASE_URL}/students`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStudentsData(data.data || []))
      .catch((err) => console.warn("Lỗi fetch students:", err));
  }, []);

  const handleOpenCourseDetail = (courseId) => {
    if (!courseId) return;
    setSelectedCourseId(courseId);
    setActiveTab("course-detail");
    navigate(`/admin/courses/${courseId}`);
  };

  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    setActiveTab("courses");
    navigate("/admin");
  };

  const handleSidebarTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "course-detail") {
      setSelectedCourseId(null);
    }

    if (tab === "dashboard") navigate("/admin");
    else if (tab === "courses") navigate("/admin");
    else navigate(`/admin/${tab}`);
  };

  const handleFilter = () => alert("Tính năng lọc nâng cao đang được mở!");
  const handleAddInstructor = () => alert("Tính năng thêm giảng viên mới đang được mở!");
  const handleExportCSV = () => alert("Đang xuất file Excel/CSV...");

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-layout-container">
        
        <Sidebar
          activeTab={activeTab}
          setActiveTab={handleSidebarTabChange}
          onLogout={onLogout}
        />

        <div className="admin-main-content">
          <Header />

          <div className="tab-content-container">
            
            {/* Dashboard */}
            {activeTab === "dashboard" && (
              <DashboardTab dashboardData={dashboardData} />
            )}

            {/* 💡 3. RENDER TAB INBOX */}
            {activeTab === "inbox" && <AiInboxAnalyticsPage />}

            {/* Danh sách Khóa học */}
            {activeTab === "courses" && (
              <CourseManagement onOpenDetail={handleOpenCourseDetail} />
            )}

            {/* Chi tiết Khóa học */}
            {activeTab === "course-detail" && (
              <CourseDetail 
                courseId={selectedCourseId || urlCourseId} 
                onBack={handleBackToCourses} 
              />
            )}

            {/* Quản lý Files & Folders */}
            {activeTab === "files" && (
              <FilesManagement />
            )}

            {/* Quản lý Problem */}
            {activeTab === "problem" && <ProblemManager />}

            {/* Giảng viên */}
            {activeTab === "instructors" && (
              <InstructorsTab
                instructorsData={instructorsData}
                instructorSearch={instructorSearch}
                setInstructorSearch={setInstructorSearch}
                handleFilter={handleFilter}
                handleAddInstructor={handleAddInstructor}
              />
            )}

            {/* Học viên */}
            {activeTab === "students" && (
              <StudentsTab
                studentsData={studentsData}
                studentSearch={studentSearch}
                setStudentSearch={setStudentSearch}
                handleExportCSV={handleExportCSV}
              />
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}