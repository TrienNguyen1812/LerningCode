// import { useState, useEffect } from "react";
// import ChapterCard from "../component/ChapterCard";
// import { FaCirclePlay, FaTriangleExclamation } from "react-icons/fa6";

// export default function CourseDetailPage({ course, onStartCoding }) {
//   const [chapters, setChapters] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchCourseDetails = async () => {
//       if (!course || !course.id) return;
//       try {
//         setIsLoading(true);
//         setError(null);
//         const response = await fetch(`http://localhost:5000/api/students/courses/${course.id}/details`);
//         if (!response.ok) throw new Error("Không thể tải cấu trúc bài học.");
//         const data = await response.json();
//         setChapters(data.chapters || []);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchCourseDetails();
//   }, [course]);

//   if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
//   if (error) return <div className="alert alert-danger"><FaTriangleExclamation /> {error}</div>;

//   return (
//     <div className="container-fluid py-2 px-0 text-start">
//       <div className="row align-items-center mb-4">
//         <div className="col-12 col-md-8">
//           <h2 className="fw-bold text-dark mb-2">{course?.title}</h2>
//           <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
//             Học tập và thực hành trực tiếp hệ thống bài tập code luyện giải thuật, chấm điểm tự động.
//           </p>
//         </div>
//         <div className="col-12 col-md-4 mt-3 mt-md-0">
//           <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
//             <div className="d-flex align-items-center justify-content-between mb-3">
//               <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: "11px" }}>Tiến độ khóa học</span>
//               <span className="fw-bold text-primary fs-4">{course?.progress || 0}%</span>
//             </div>
//             <button className="btn btn-primary w-100 rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2">
//               Tiếp tục học <FaCirclePlay />
//             </button>
//           </div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-12">
//           {chapters.length === 0 ? (
//             <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted">
//               Khóa học này hiện chưa có nội dung bài học nào.
//             </div>
//           ) : (
//             chapters.map((chapter) => (
//               <ChapterCard 
//                 key={chapter.id} 
//                 chapter={chapter} 
//                 // Truyền hàm bắt sự kiện click từ App.jsx xuống cho thẻ con xử lý tiếp
//                 onSelectProblem={onStartCoding} 
//               />
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Bổ sung để nhận dữ liệu từ Dashboard truyền sang
import ChapterCard from "../component/ChapterCard"; // Sửa lại thành components có chữ 's' để tránh lỗi đường dẫn
import { FaCirclePlay, FaTriangleExclamation } from "react-icons/fa6";

export default function CourseDetailPage({ onStartCoding }) {
  const location = useLocation();
  const course = location.state?.course; // Lấy dữ liệu khóa học từ state

  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      // Nếu không có course id (do truy cập trực tiếp url), không fetch
      if (!course || !course.id) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`http://localhost:5000/api/students/courses/${course.id}/details`);
        if (!response.ok) throw new Error("Không thể tải cấu trúc bài học.");
        const data = await response.json();
        setChapters(data.chapters || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseDetails();
  }, [course]);

  if (isLoading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;
  
  // Xử lý lỗi hoặc khi truy cập URL mà không có dữ liệu khóa học
  if (!course) return <div className="alert alert-warning m-4"><FaTriangleExclamation /> Không tìm thấy thông tin khóa học. Vui lòng quay lại trang chủ.</div>;
  if (error) return <div className="alert alert-danger m-4"><FaTriangleExclamation /> {error}</div>;

  return (
    <div className="container-fluid py-2 px-0 text-start">
      <div className="row align-items-center mb-4">
        <div className="col-12 col-md-8">
          <h2 className="fw-bold text-dark mb-2">{course?.title}</h2>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            Học tập và thực hành trực tiếp hệ thống bài tập code luyện giải thuật, chấm điểm tự động.
          </p>
        </div>
        <div className="col-12 col-md-4 mt-3 mt-md-0">
          <div className="card border-0 shadow-sm p-4 rounded-4 bg-white">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-muted fw-bold small text-uppercase" style={{ fontSize: "11px" }}>Tiến độ khóa học</span>
              <span className="fw-bold text-primary fs-4">{course?.progress || 0}%</span>
            </div>
            <button className="btn btn-primary w-100 rounded-3 py-2.5 fw-semibold d-flex align-items-center justify-content-center gap-2">
              Tiếp tục học <FaCirclePlay />
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {chapters.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted">
              Khóa học này hiện chưa có nội dung bài học nào.
            </div>
          ) : (
            chapters.map((chapter) => (
              <ChapterCard 
                key={chapter.id} 
                chapter={chapter} 
                onSelectProblem={onStartCoding} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}