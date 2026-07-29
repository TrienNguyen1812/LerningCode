import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard from "../../components/Admin/CourseCard";
import ContentHeader from "../../components/Admin/ContentHeader";
import AssignStudentModal from "../../components/Admin/AssignStudentModal";
import "../css/CourseManagement.css";

export default function CourseManagement() {
  const navigate = useNavigate();

  const [coursesData, setCoursesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // State quản lý Modal Assign
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const BASE_URL = "http://localhost:5000/api/courses";

  const fetchCourses = async () => {
    try {
      const res = await fetch(BASE_URL);
      const data = await res.json();

      if (data.success) {
        setCoursesData(data.data || []);
      } else if (Array.isArray(data)) {
        setCoursesData(data);
      }
    } catch (error) {
      console.error("Lỗi kết nối CSDL khi tải danh sách khóa học:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenCreatePage = () => navigate("/courses/create");
  const handleOpenEditPage = (courseId) => navigate(`/courses/edit/${courseId}`);
  const handleOpenDetailPage = (courseId) => navigate(`/admin/courses/${courseId}`);

  const handleOpenAssignModal = (course) => {
    setSelectedCourse(course);
    setShowAssignModal(true);
  };

  // Gọi API POST /api/courses/:id/assign để lưu danh sách gán
  const handleSaveAssignments = async (courseId, selectedUserIds) => {
    try {
      const response = await fetch(`${BASE_URL}/${courseId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userIds: selectedUserIds }),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message || "Cập nhật gán học viên thành công!");
        setShowAssignModal(false);
        fetchCourses(); // Tải lại khóa học để cập nhật số lượng enrolled
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật"));
      }
    } catch (error) {
      console.error("Lỗi khi lưu gán học viên:", error);
      alert("Lỗi kết nối Server!");
    }
  };

  const handleDeleteCourse = async (id, courseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khóa học "${courseName}"?`)) return;

    try {
      const response = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      const data = await response.json();

      if (data.success || response.ok) {
        setCoursesData((prev) => prev.filter((c) => (c.id || c.IdCourse) !== id));
        alert("Đã xóa khóa học thành công!");
      } else {
        alert("Lỗi xóa: " + (data.message || "Không thể xóa"));
      }
    } catch (error) {
      console.error("Lỗi xóa khóa học:", error);
      alert("Lỗi kết nối Server!");
    }
  };

  const renderCourses = Array.isArray(coursesData) ? coursesData : [];

  return (
    <div className="cm-container">
      <div className="cm-main-card">
        <ContentHeader
          count={renderCourses.length}
          unitText="Courses in total"
          buttonText="New Course"
          onNewCourse={handleOpenCreatePage}
        />

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-info" role="status"></div>
            <p className="mt-2 text-muted">Đang tải danh sách khóa học...</p>
          </div>
        ) : renderCourses.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Chưa có khóa học nào. Hãy nhấn "New Course" để tạo mới!
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-3 g-4">
            {renderCourses.map((course) => {
              const courseId = course.id || course.IdCourse;
              const courseName = course.name || course.CourseName || course.title;

              return (
                <CourseCard
                  key={courseId}
                  course={course}
                  onDetail={() => handleOpenDetailPage(courseId)}
                  onEdit={() => handleOpenEditPage(courseId)}
                  onDelete={() => handleDeleteCourse(courseId, courseName)}
                  onAssign={() => handleOpenAssignModal(course)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Assign Học Viên */}
      <AssignStudentModal
        show={showAssignModal}
        course={selectedCourse}
        onClose={() => setShowAssignModal(false)}
        onSave={handleSaveAssignments}
      />
    </div>
  );
}