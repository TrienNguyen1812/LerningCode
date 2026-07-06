
// import React, { useState, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "@fortawesome/fontawesome-free/css/all.min.css";

// export default function AdminApp({ onLogout }) {
//   const [activeTab, setActiveTab] = useState("dashboard"); 
  
//   // STATES CHỨA DỮ LIỆU ĐỘNG TỪ DATABASE
//   const [dashboardData, setDashboardData] = useState(null);
//   const [coursesData, setCoursesData] = useState([]);
//   const [instructorsData, setInstructorsData] = useState([]);
//   const [studentsData, setStudentsData] = useState([]);
  
//   const [courseSearch, setCourseSearch] = useState("");
//   const [instructorSearch, setInstructorSearch] = useState("");
//   const [studentSearch, setStudentSearch] = useState("");
  
//   const [showModal, setShowModal] = useState(false);
//   const [modalTitle, setModalTitle] = useState("Tạo Khóa Học Mới");
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingCourseId, setEditingCourseId] = useState(null);

//   // const [showLessonModal, setShowLessonModal] = useState(false);
//   // const [selectedCourse, setSelectedCourse] = useState(null);
//   // const [lessonsData, setLessonsData] = useState([]);
  
//   // SỬA ĐỔI: Dùng object để lưu trữ nhiều thông tin cho form chi tiết, ĐÃ THÊM imageUrl
//   const [courseForm, setCourseForm] = useState({
//     name: "",
//     description: "",
//     imageUrl: "", // <-- Trường lưu link ảnh mới thêm
//     category: "technology",
//     status: "published"
//   });
  
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const BASE_URL = "http://127.0.0.1:5000/api/admin";

//   // HÀM LẤY TOÀN BỘ DỮ LIỆU ĐỘNG TỪ API
//   const fetchAllData = async () => {
//     try {
//       const [dashRes, courseRes, instRes, studRes] = await Promise.all([
//         fetch(`${BASE_URL}/dashboard`),
//         fetch(`${BASE_URL}/courses`),
//         fetch(`${BASE_URL}/instructors`),
//         fetch(`${BASE_URL}/students`)
//       ]);
      
//       const dashJson = await dashRes.json();
//       const courseJson = await courseRes.json();
//       const instJson = await instRes.json();
//       const studJson = await studRes.json();

//       if (dashJson.success) setDashboardData(dashJson.data);
//       if (courseJson.success) setCoursesData(courseJson.data);
//       if (instJson.success) setInstructorsData(instJson.data);
//       if (studJson.success) setStudentsData(studJson.data);
//     } catch (error) {
//       console.error("Lỗi lấy dữ liệu:", error);
//     }
//   };

//   // Tự động lấy dữ liệu khi trang vừa mở lên
//   useEffect(() => {
//     fetchAllData();
//   }, []);

//   // SỬA ĐỔI: MỞ POPUP TẠO MỚI VỚI FORM CHI TIẾT (Đã reset imageUrl)
//   const handleOpenCreateModal = () => {
//     setModalTitle("Tạo Khóa Học Mới");
//     setIsEditMode(false);
//     setCourseForm({ name: "", description: "", imageUrl: "", category: "technology", status: "published" });
//     setShowModal(true);
//   };

//   // SỬA ĐỔI: MỞ POPUP CHỈNH SỬA VỚI FORM CHI TIẾT (Đã truyền imageUrl)
//   const handleOpenEditModal = (course) => {
//     setModalTitle("Chỉnh Sửa Khóa Học");
//     setIsEditMode(true);
//     setEditingCourseId(course.id);
//     setCourseForm({ 
//       name: course.name, 
//       description: course.description || "", 
//       imageUrl: course.imageUrl || "", // <-- Lấy ảnh cũ hiển thị lên form
//       category: "technology", 
//       status: "published" 
//     });
//     setShowModal(true);
//   };

//   // SỬA ĐỔI: API LƯU KHÓA HỌC (Gửi name, description VÀ imageUrl)
//   const handleSaveCourse = async (e) => {
//     e.preventDefault();
//     if (!courseForm.name.trim() || !courseForm.description.trim()) {
//       return alert("Vui lòng nhập đầy đủ tên và mô tả khóa học!");
//     }

//     setIsSubmitting(true);
//     try {
//       let response;
//       // Đóng gói dữ liệu an toàn gửi xuống Database
//       const payload = { 
//         name: courseForm.name, 
//         description: courseForm.description,
//         imageUrl: courseForm.imageUrl // <-- Gửi link ảnh đi
//       };

//       if (isEditMode) {
//         response = await fetch(`${BASE_URL}/courses/${editingCourseId}`, {
//           method: "PUT", headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload)
//         });
//       } else {
//         response = await fetch(`${BASE_URL}/courses`, {
//           method: "POST", headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload)
//         });
//       }
      
//       const data = await response.json();
//       if (data.success) {
//         setShowModal(false); 
//         fetchAllData(); // Tải lại TOÀN BỘ dữ liệu để Dashboard cập nhật số lượng
//         alert(isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công! Khóa học đã hiển thị cho học viên.");
//       } else { alert("Lỗi: " + data.message); }
//     } catch (error) { alert("Lỗi kết nối CSDL!"); } finally { setIsSubmitting(false); }
//   };

//   // API: XÓA KHÓA HỌC
//   const handleDeleteCourse = async (id, courseName) => {
//     if (!window.confirm(`Bạn có chắc muốn xóa "${courseName}"?`)) return;
//     try {
//       const response = await fetch(`${BASE_URL}/courses/${id}`, { method: "DELETE" });
//       const data = await response.json();
//       if (data.success) {
//         fetchAllData(); // Tải lại toàn bộ dữ liệu để cập nhật Dashboard
//         alert("Đã xóa khóa học!");
//       } else { alert("Lỗi xóa: " + data.message); }
//     } catch (error) { alert("Lỗi kết nối!"); }
//   };

//   // BIỂU ĐỒ DASHBOARD - ĐỘNG 100%
//   const DashboardTab = () => {
//     if (!dashboardData) return <div className="p-5 text-center text-muted"><div className="spinner-border text-primary mb-3" role="status"></div><br/>Đang tải dữ liệu hệ thống...</div>;
//     return (
//       <div className="p-4">
//         <h4 className="fw-bold text-dark mb-4">Dashboard Overview</h4>
//         {/* Render 4 Thẻ thông số động */}
//         <div className="row g-3 mb-4">
//           {dashboardData.metrics.map((m, i) => (
//             <div key={i} className="col-3">
//               <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
//                 <p className="text-muted small fw-semibold mb-2">{m.title}</p>
//                 <div className="d-flex justify-content-between align-items-end">
//                   <h3 className="fw-bold text-dark m-0">{m.value}</h3>
//                   <span className={`badge rounded-pill px-2 py-1 small ${m.isUp ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
//                     <i className={`fa-solid ${m.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} me-1`}></i> {m.trend}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="row g-3">
//           {/* Biểu đồ lượng truy cập (Giả lập do DB chưa có bảng logs) */}
//           <div className="col-8">
//             <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
//               <h6 className="fw-bold mb-4">Lưu lượng truy cập hệ thống</h6>
//               <div className="d-flex align-items-end justify-content-between flex-grow-1" style={{ height: "200px" }}>
//                 {dashboardData.enrollmentChart.map((col, i) => (
//                   <div key={i} className="d-flex flex-column align-items-center" style={{ width: "10%" }}>
//                     <div className="w-100 rounded-top" style={{ height: `${col.percent}%`, backgroundColor: "#3525cd" }}></div>
//                     <span className="small text-muted mt-2">{col.month}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//           {/* Top Khóa Học Động */}
//           <div className="col-4">
//             <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
//               <h6 className="fw-bold mb-4">Khóa Học Nổi Bật Nhất</h6>
//               <div className="d-flex flex-column gap-3">
//                 {dashboardData.topCourses.length > 0 ? dashboardData.topCourses.map((c, i) => (
//                   <div key={i}>
//                     <div className="d-flex justify-content-between small mb-1"><span className="fw-semibold text-dark text-truncate" style={{maxWidth: "150px"}}>{c.name}</span><span className="text-muted">{c.students}</span></div>
//                     <div className="progress bg-light" style={{ height: "6px" }}><div className="progress-bar rounded-pill bg-success" style={{ width: `${c.percent}%` }}></div></div>
//                   </div>
//                 )) : <p className="text-muted small">Chưa có khóa học nào được đăng ký.</p>}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // QUẢN LÝ KHÓA HỌC - ĐỘNG 100%
//   const CoursesTab = () => {
//     const filteredCourses = coursesData.filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase()));
//     return (
//       <div className="p-4">
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h4 className="fw-bold m-0 text-dark">Course Management</h4>
//           <button onClick={handleOpenCreateModal} className="btn text-white fw-bold px-3 rounded-3 shadow-sm" style={{ backgroundColor: "#3525cd" }}><i className="fa-solid fa-plus me-2"></i> Create New Course</button>
//         </div>
//         <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
//           <div className="p-3 border-bottom d-flex align-items-center">
//             <div className="position-relative" style={{ width: "300px" }}>
//               <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
//               <input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm tên khóa học..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} />
//             </div>
//           </div>
//           <div className="table-responsive">
//             <table className="table align-middle custom-table mb-0">
//               <thead className="bg-light text-muted small text-uppercase">
//                 <tr>
//                   <th className="ps-4" style={{width:"80px"}}>Ảnh</th>
//                   <th>Tên Khóa Học</th>
//                   <th>Giảng Viên</th>
//                   <th className="text-center">Số HV</th>
//                   <th>Trạng Thái</th>
//                   <th className="pe-4 text-end">Hành Động</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredCourses.length > 0 ? filteredCourses.map(c => (
//                   <tr key={c.id} className="border-bottom">
//                     <td className="ps-4 py-3">
//                       {/* Cột hiển thị ảnh thu nhỏ (nếu có) */}
//                       {c.imageUrl ? 
//                         <img src={c.imageUrl} alt={c.name} className="rounded" style={{width: "50px", height:"50px", objectFit:"cover"}}/> : 
//                         <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{width: "50px", height:"50px"}}><i className="fa-regular fa-image"></i></div>
//                       }
//                     </td>
//                     <td><h6 className="fw-bold m-0 text-dark">{c.name}</h6><small className="text-muted">Ngày tạo: {c.updatedAt}</small></td>
//                     <td><span className="small text-dark fw-semibold">{c.instructor}</span></td>
//                     <td className="text-center fw-bold">{c.enrolled}</td>
//                     <td><span className="badge rounded-pill px-2 py-1 bg-success bg-opacity-10 text-success">• {c.status}</span></td>
//                     <td className="pe-4 text-end">
//                       <button onClick={() => handleOpenEditModal(c)} className="btn btn-sm btn-light me-2 rounded-circle"><i className="fa-solid fa-pen text-primary"></i></button>
//                       <button onClick={() => handleDeleteCourse(c.id, c.name)} className="btn btn-sm btn-light rounded-circle"><i className="fa-solid fa-trash text-danger"></i></button>
//                     </td>
//                   </tr>
//                 )) : <tr><td colSpan="6" className="text-center py-4 text-muted">Không tìm thấy khóa học nào.</td></tr>}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* POPUP XỬ LÝ KHÓA HỌC (ĐÃ THÊM Ô NHẬP IMAGEURL) */}
//         {showModal && (
//           <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
//             <div className="bg-white p-4 rounded-4 w-100 shadow-lg" style={{ maxWidth: "500px" }}>
//               <div className="d-flex justify-content-between align-items-center mb-4">
//                 <h5 className="fw-bold m-0">{modalTitle}</h5>
//                 <i className="fa-solid fa-xmark fs-5 cursor-pointer text-muted" onClick={() => setShowModal(false)}></i>
//               </div>
//               <form onSubmit={handleSaveCourse}>
//                 <div className="mb-3">
//                   <label className="form-label small fw-semibold text-muted">Tên khóa học <span className="text-danger">*</span></label>
//                   <input type="text" className="form-control py-2" value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} required autoFocus placeholder="VD: Lập trình Web..." />
//                 </div>
                
//                 {/* TRƯỜNG NHẬP ẢNH MỚI */}
//                 <div className="mb-3">
//                   <label className="form-label small fw-semibold text-muted">Link Ảnh Bìa (URL)</label>
//                   <div className="input-group">
//                     <span className="input-group-text bg-light border-end-0"><i className="fa-regular fa-image text-muted"></i></span>
//                     <input type="text" className="form-control py-2 border-start-0 ps-0 shadow-none" value={courseForm.imageUrl} onChange={(e) => setCourseForm({...courseForm, imageUrl: e.target.value})} placeholder="https://link-anh.jpg" />
//                   </div>
//                 </div>

//                 <div className="mb-3">
//                   <label className="form-label small fw-semibold text-muted">Mô tả chi tiết <span className="text-danger">*</span></label>
//                   <textarea className="form-control py-2" rows="4" value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} required placeholder="Nhập nội dung khóa học..."></textarea>
//                 </div>

//                 <div className="d-flex justify-content-end gap-2 mt-4">
//                   <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Hủy bỏ</button>
//                   <button type="submit" className="btn text-white fw-semibold" style={{ backgroundColor: "#3525cd" }} disabled={isSubmitting}>{isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}</button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // QUẢN LÝ GIẢNG VIÊN - ĐỘNG 100%
//   const InstructorsTab = () => {
//     const filteredInstructors = instructorsData.filter(i => i.name.toLowerCase().includes(instructorSearch.toLowerCase()));
//     return (
//       <div className="p-4">
//         <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold text-dark m-0">Instructors Directory</h4></div>
//         <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
//           <div className="p-3 border-bottom"><div className="position-relative" style={{ width: "350px" }}> <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm theo tên giảng viên..." value={instructorSearch} onChange={(e) => setInstructorSearch(e.target.value)} /></div></div>
//           <div className="table-responsive">
//             <table className="table align-middle custom-table mb-0">
//               <thead className="bg-light text-muted small text-uppercase"><tr><th className="ps-4">Tên Giảng Viên</th><th className="text-center">Số Khóa Đảm Nhận</th><th className="text-center">Đánh Giá</th><th>Trạng Thái</th></tr></thead>
//               <tbody>
//                 {filteredInstructors.length > 0 ? filteredInstructors.map(i => (
//                   <tr key={i.id} className="border-bottom">
//                     <td className="ps-4 py-3"><h6 className="fw-bold m-0 text-dark small">{i.name}</h6><small className="text-muted">{i.email}</small></td>
//                     <td className="fw-bold text-center small text-dark">{i.totalCourses}</td>
//                     <td className="fw-bold text-center small text-dark"><i className="fa-solid fa-star text-warning me-1"></i>{i.rating}</td>
//                     <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">• Active</span></td>
//                   </tr>
//                 )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy giảng viên nào.</td></tr>}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // QUẢN LÝ SINH VIÊN - ĐỘNG 100%
//   const StudentsTab = () => {
//     const filteredStudents = studentsData.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
//     return (
//       <div className="p-4">
//         <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold text-dark m-0">Student Directory</h4></div>
//         <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
//           <div className="p-3 border-bottom"><div className="position-relative" style={{ width: "300px" }}><i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm theo tên học viên..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} /></div></div>
//           <div className="table-responsive">
//             <table className="table align-middle custom-table mb-0">
//               <thead className="bg-white text-muted small text-uppercase border-bottom"><tr><th className="ps-4">Tên Học Viên</th><th>Ngày Tham Gia</th><th className="text-center">Khóa Đang Học</th><th style={{width: "15%"}}>Tiến Độ TB</th></tr></thead>
//               <tbody>
//                 {filteredStudents.length > 0 ? filteredStudents.map(s => (
//                   <tr key={s.id} className="border-bottom">
//                     <td className="ps-4 py-3"><h6 className="fw-bold m-0 text-dark small">{s.name}</h6><small className="text-muted">{s.email}</small></td>
//                     <td className="text-muted small">{s.joinedDate}</td>
//                     <td className="fw-bold text-center text-dark small">{s.coursesEnrolled}</td>
//                     <td>
//                       <div className="d-flex align-items-center gap-2"><div className="progress flex-grow-1" style={{ height: "6px" }}><div className="progress-bar bg-primary" style={{ width: `${s.progress}%` }}></div></div><span className="small fw-bold text-dark">{s.progress}%</span></div>
//                     </td>
//                   </tr>
//                 )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy sinh viên nào.</td></tr>}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="d-flex" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
//       <div className="bg-white border-end d-flex flex-column" style={{ width: "260px" }}>
//         <div className="p-4 d-flex align-items-center gap-2"><div className="rounded text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: "32px", height: "32px", backgroundColor: "#3525cd" }}>EA</div><h5 className="fw-bold m-0 text-dark">EduAdmin Pro</h5></div>
//         <div className="px-3 flex-grow-1 mt-2 d-flex flex-column gap-1">
//           <button onClick={() => setActiveTab('dashboard')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'dashboard' ? '#f5f3ff' : 'transparent', color: activeTab === 'dashboard' ? '#3525cd' : '' }}><i className="fa-solid fa-border-all me-3"></i>Dashboard</button>
//           <button onClick={() => setActiveTab('courses')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'courses' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'courses' ? '#f5f3ff' : 'transparent', color: activeTab === 'courses' ? '#3525cd' : '' }}><i className="fa-solid fa-book-open me-3"></i>Courses</button>
//           <button onClick={() => setActiveTab('students')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'students' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'students' ? '#f5f3ff' : 'transparent', color: activeTab === 'students' ? '#3525cd' : '' }}><i className="fa-solid fa-users me-3"></i>Students</button>
//           <button onClick={() => setActiveTab('instructors')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'instructors' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'instructors' ? '#f5f3ff' : 'transparent', color: activeTab === 'instructors' ? '#3525cd' : '' }}><i className="fa-solid fa-chalkboard-user me-3"></i>Instructors</button>
          
//           <button onClick={onLogout} className="btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 text-danger mt-auto mb-3" style={{ backgroundColor: "#fef2f2" }}><i className="fa-solid fa-arrow-right-from-bracket me-3"></i>Log out</button>
//         </div>
//       </div>
      
//       <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto">
//         <div className="bg-white border-bottom px-4 py-3 sticky-top"><div className="position-relative" style={{ width: "400px" }}><i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-pill ps-5 text-sm" placeholder="Tìm kiếm tài nguyên hệ thống..." /></div></div>
//         {activeTab === 'dashboard' && <DashboardTab />}
//         {activeTab === 'courses' && <CoursesTab />}
//         {activeTab === 'instructors' && <InstructorsTab />}
//         {activeTab === 'students' && <StudentsTab />}
//       </div>
//       <style>{`.custom-table th, .custom-table td { padding-top: 1rem; padding-bottom: 1rem; vertical-align: middle; } .btn-white { background-color: #fff; } .cursor-pointer { cursor: pointer; }`}</style>
//     </div>
//   );
// }



  // HÀM MỞ QUẢN LÝ BÀI HỌC
  // const openLessonManager = async (course) => {
  //   setSelectedCourse(course);
  //   try {
  //     const res = await fetch(`${BASE_URL}/courses/${course.id}/lessons`); // Cần đảm bảo API này tồn tại
  //     const data = await res.json();
  //     if (data.success) setLessonsData(data.data);
  //     setShowLessonModal(true);
  //   } catch (err) { alert("Không thể tải danh sách bài học!"); }
  // };

  // ... (Trong CoursesTab, tại phần hiển thị bảng danh sách khóa học)
  // TRONG BẢNG CỦA CoursesTab, THÊM CỘT NÀY VÀO MỖI TRONG <tr>
  // <td className="text-center">
  //    <button onClick={() => openLessonManager(c)} className="btn btn-sm btn-outline-primary rounded-pill">
  //      <i className="fa-solid fa-list-check me-1"></i> Quản lý
  //    </button>
  // </td>

  // ... (THÊM MODAL QUẢN LÝ BÀI HỌC VÀO CUỐI RETURN)
  // {showLessonModal && (
  //   <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
  //     <div className="bg-white p-4 rounded-4 shadow-lg w-100" style={{ maxWidth: "700px" }}>
  //       <div className="d-flex justify-content-between mb-4">
  //         <h5>Bài học khóa: {selectedCourse?.name}</h5>
  //         <i className="fa-solid fa-xmark cursor-pointer" onClick={() => setShowLessonModal(false)}></i>
  //       </div>
  //       <div className="list-group">
  //         {lessonsData.map(l => (
  //           <div key={l.IdLesson} className="list-group-item d-flex justify-content-between align-items-center">
  //             {l.Title}
  //             <button className="btn btn-sm btn-success">Quản lý Problem</button>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // )}





import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function AdminApp({ onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard"); 
  
  // STATES CHỨA DỮ LIỆU ĐỘNG TỪ DATABASE
  const [dashboardData, setDashboardData] = useState(null);
  const [coursesData, setCoursesData] = useState([]);
  const [instructorsData, setInstructorsData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  
  const [courseSearch, setCourseSearch] = useState("");
  const [instructorSearch, setInstructorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Tạo Khóa Học Mới");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);

  // ĐÃ MỞ COMMENT VÀ SỬ DỤNG STATE BÀI HỌC
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessonsData, setLessonsData] = useState([]);

  // THÊM STATE QUẢN LÝ BÀI TẬP VÀ TEST CASE
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [problemsData, setProblemsData] = useState([]);

  const [showAddProblemModal, setShowAddProblemModal] = useState(false);
  const [problemForm, setProblemForm] = useState({
    title: "",
    description: "",
    difficulty: "DỄ",
    timeLimit: 1000,
    memoryLimit: 256,
    sampleCode: "",
    testCases: [{ input: "", output: "" }]
  });
  
  // SỬA ĐỔI: Dùng object để lưu trữ nhiều thông tin cho form chi tiết, ĐÃ THÊM imageUrl
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    imageUrl: "", // <-- Trường lưu link ảnh mới thêm
    category: "technology",
    status: "published"
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = "http://127.0.0.1:5000/api/admin";

  // HÀM LẤY TOÀN BỘ DỮ LIỆU ĐỘNG TỪ API
  const fetchAllData = async () => {
    try {
      const [dashRes, courseRes, instRes, studRes] = await Promise.all([
        fetch(`${BASE_URL}/dashboard`),
        fetch(`${BASE_URL}/courses`),
        fetch(`${BASE_URL}/instructors`),
        fetch(`${BASE_URL}/students`)
      ]);
      
      const dashJson = await dashRes.json();
      const courseJson = await courseRes.json();
      const instJson = await instRes.json();
      const studJson = await studRes.json();

      if (dashJson.success) setDashboardData(dashJson.data);
      if (courseJson.success) setCoursesData(courseJson.data);
      if (instJson.success) setInstructorsData(instJson.data);
      if (studJson.success) setStudentsData(studJson.data);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };

  // Tự động lấy dữ liệu khi trang vừa mở lên
  useEffect(() => {
    fetchAllData();
  }, []);

  // SỬA ĐỔI: MỞ POPUP TẠO MỚI VỚI FORM CHI TIẾT (Đã reset imageUrl)
  const handleOpenCreateModal = () => {
    setModalTitle("Tạo Khóa Học Mới");
    setIsEditMode(false);
    setCourseForm({ name: "", description: "", imageUrl: "", category: "technology", status: "published" });
    setShowModal(true);
  };

  // SỬA ĐỔI: MỞ POPUP CHỈNH SỬA VỚI FORM CHI TIẾT (Đã truyền imageUrl)
  const handleOpenEditModal = (course) => {
    setModalTitle("Chỉnh Sửa Khóa Học");
    setIsEditMode(true);
    setEditingCourseId(course.id);
    setCourseForm({ 
      name: course.name, 
      description: course.description || "", 
      imageUrl: course.imageUrl || "", // <-- Lấy ảnh cũ hiển thị lên form
      category: "technology", 
      status: "published" 
    });
    setShowModal(true);
  };

  // SỬA ĐỔI: API LƯU KHÓA HỌC (Gửi name, description VÀ imageUrl)
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseForm.name.trim() || !courseForm.description.trim()) {
      return alert("Vui lòng nhập đầy đủ tên và mô tả khóa học!");
    }

    setIsSubmitting(true);
    try {
      let response;
      // Đóng gói dữ liệu an toàn gửi xuống Database
      const payload = { 
        name: courseForm.name, 
        description: courseForm.description,
        imageUrl: courseForm.imageUrl // <-- Gửi link ảnh đi
      };

      if (isEditMode) {
        response = await fetch(`${BASE_URL}/courses/${editingCourseId}`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${BASE_URL}/courses`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      
      const data = await response.json();
      if (data.success) {
        setShowModal(false); 
        fetchAllData(); // Tải lại TOÀN BỘ dữ liệu để Dashboard cập nhật số lượng
        alert(isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công! Khóa học đã hiển thị cho học viên.");
      } else { alert("Lỗi: " + data.message); }
    } catch (error) { alert("Lỗi kết nối CSDL!"); } finally { setIsSubmitting(false); }
  };

  // API: XÓA KHÓA HỌC
  const handleDeleteCourse = async (id, courseName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${courseName}"?`)) return;
    try {
      const response = await fetch(`${BASE_URL}/courses/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        fetchAllData(); // Tải lại toàn bộ dữ liệu để cập nhật Dashboard
        alert("Đã xóa khóa học!");
      } else { alert("Lỗi xóa: " + data.message); }
    } catch (error) { alert("Lỗi kết nối!"); }
  };

  // ==========================================
  // CÁC HÀM XỬ LÝ MỚI CHO LESSON VÀ PROBLEM
  // ==========================================
  const openLessonManager = async (course) => {
    setSelectedCourse(course);
    try {
      const res = await fetch(`${BASE_URL}/courses/${course.id}/lessons`);
      const data = await res.json();
      if (data.success) setLessonsData(data.data);
      setShowLessonModal(true);
    } catch (err) { alert("Không thể kết nối API bài học!"); }
  };

  const openProblemManager = async (lesson) => {
    setSelectedLesson(lesson);
    try {
      const res = await fetch(`${BASE_URL}/lessons/${lesson.IdLesson}/problems`);
      const data = await res.json();
      if (data.success) setProblemsData(data.data);
      setShowLessonModal(false);
      setShowProblemModal(true);
    } catch (err) { alert("Lỗi tải danh sách bài tập!"); }
  };

  const handleAddTestCase = () => {
    setProblemForm({ ...problemForm, testCases: [...problemForm.testCases, { input: "", output: "" }] });
  };

  const handleTestCaseChange = (index, field, value) => {
    const newTestCases = [...problemForm.testCases];
    newTestCases[index][field] = value;
    setProblemForm({ ...problemForm, testCases: newTestCases });
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...problemForm, idLesson: selectedLesson.IdLesson };
      const res = await fetch(`${BASE_URL}/problems-with-tests`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Đã thêm bài tập và Test Case thành công!");
        setShowAddProblemModal(false);
        openProblemManager(selectedLesson);
      } else { alert("Lỗi: " + data.message); }
    } catch (err) { alert("Lỗi kết nối Server"); }
    setIsSubmitting(false);
  };

  // BIỂU ĐỒ DASHBOARD - ĐỘNG 100%
  const DashboardTab = () => {
    if (!dashboardData) return <div className="p-5 text-center text-muted"><div className="spinner-border text-primary mb-3" role="status"></div><br/>Đang tải dữ liệu hệ thống...</div>;
    return (
      <div className="p-4">
        <h4 className="fw-bold text-dark mb-4">Dashboard Overview</h4>
        {/* Render 4 Thẻ thông số động */}
        <div className="row g-3 mb-4">
          {dashboardData.metrics.map((m, i) => (
            <div key={i} className="col-3">
              <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
                <p className="text-muted small fw-semibold mb-2">{m.title}</p>
                <div className="d-flex justify-content-between align-items-end">
                  <h3 className="fw-bold text-dark m-0">{m.value}</h3>
                  <span className={`badge rounded-pill px-2 py-1 small ${m.isUp ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                    <i className={`fa-solid ${m.isUp ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} me-1`}></i> {m.trend}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row g-3">
          {/* Biểu đồ lượng truy cập (Giả lập do DB chưa có bảng logs) */}
          <div className="col-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold mb-4">Lưu lượng truy cập hệ thống</h6>
              <div className="d-flex align-items-end justify-content-between flex-grow-1" style={{ height: "200px" }}>
                {dashboardData.enrollmentChart.map((col, i) => (
                  <div key={i} className="d-flex flex-column align-items-center" style={{ width: "10%" }}>
                    <div className="w-100 rounded-top" style={{ height: `${col.percent}%`, backgroundColor: "#3525cd" }}></div>
                    <span className="small text-muted mt-2">{col.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Top Khóa Học Động */}
          <div className="col-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold mb-4">Khóa Học Nổi Bật Nhất</h6>
              <div className="d-flex flex-column gap-3">
                {dashboardData.topCourses.length > 0 ? dashboardData.topCourses.map((c, i) => (
                  <div key={i}>
                    <div className="d-flex justify-content-between small mb-1"><span className="fw-semibold text-dark text-truncate" style={{maxWidth: "150px"}}>{c.name}</span><span className="text-muted">{c.students}</span></div>
                    <div className="progress bg-light" style={{ height: "6px" }}><div className="progress-bar rounded-pill bg-success" style={{ width: `${c.percent}%` }}></div></div>
                  </div>
                )) : <p className="text-muted small">Chưa có khóa học nào được đăng ký.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // QUẢN LÝ KHÓA HỌC - ĐỘNG 100%
  const CoursesTab = () => {
    const filteredCourses = coursesData.filter(c => c.name.toLowerCase().includes(courseSearch.toLowerCase()));
    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold m-0 text-dark">Course Management</h4>
          <button onClick={handleOpenCreateModal} className="btn text-white fw-bold px-3 rounded-3 shadow-sm" style={{ backgroundColor: "#3525cd" }}><i className="fa-solid fa-plus me-2"></i> Create New Course</button>
        </div>
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom d-flex align-items-center">
            <div className="position-relative" style={{ width: "300px" }}>
              <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm tên khóa học..." value={courseSearch} onChange={(e) => setCourseSearch(e.target.value)} />
            </div>
          </div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-light text-muted small text-uppercase">
                <tr>
                  <th className="ps-4" style={{width:"80px"}}>Ảnh</th>
                  <th>Tên Khóa Học</th>
                  <th>Giảng Viên</th>
                  <th className="text-center">Số HV</th>
                  <th>Trạng Thái</th>
                  <th className="text-center">Quản Lý</th> {/* CỘT MỚI THÊM VÀO */}
                  <th className="pe-4 text-end">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length > 0 ? filteredCourses.map(c => (
                  <tr key={c.id} className="border-bottom">
                    <td className="ps-4 py-3">
                      {/* Cột hiển thị ảnh thu nhỏ (nếu có) */}
                      {c.imageUrl ? 
                        <img src={c.imageUrl} alt={c.name} className="rounded" style={{width: "50px", height:"50px", objectFit:"cover"}}/> : 
                        <div className="bg-light rounded d-flex align-items-center justify-content-center text-muted" style={{width: "50px", height:"50px"}}><i className="fa-regular fa-image"></i></div>
                      }
                    </td>
                    <td><h6 className="fw-bold m-0 text-dark">{c.name}</h6><small className="text-muted">Ngày tạo: {c.updatedAt}</small></td>
                    <td><span className="small text-dark fw-semibold">{c.instructor}</span></td>
                    <td className="text-center fw-bold">{c.enrolled}</td>
                    <td><span className="badge rounded-pill px-2 py-1 bg-success bg-opacity-10 text-success">• {c.status}</span></td>
                    <td className="text-center">
                      {/* NÚT QUẢN LÝ BÀI HỌC MỚI THÊM VÀO */}
                      <button onClick={() => openLessonManager(c)} className="btn btn-sm btn-outline-primary rounded-pill fw-semibold">
                        <i className="fa-solid fa-list-check me-1"></i> Bài học
                      </button>
                    </td>
                    <td className="pe-4 text-end">
                      <button onClick={() => handleOpenEditModal(c)} className="btn btn-sm btn-light me-2 rounded-circle"><i className="fa-solid fa-pen text-primary"></i></button>
                      <button onClick={() => handleDeleteCourse(c.id, c.name)} className="btn btn-sm btn-light rounded-circle"><i className="fa-solid fa-trash text-danger"></i></button>
                    </td>
                  </tr>
                )) : <tr><td colSpan="7" className="text-center py-4 text-muted">Không tìm thấy khóa học nào.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* POPUP XỬ LÝ KHÓA HỌC (ĐÃ THÊM Ô NHẬP IMAGEURL) */}
        {showModal && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
            <div className="bg-white p-4 rounded-4 w-100 shadow-lg" style={{ maxWidth: "500px" }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0">{modalTitle}</h5>
                <i className="fa-solid fa-xmark fs-5 cursor-pointer text-muted" onClick={() => setShowModal(false)}></i>
              </div>
              <form onSubmit={handleSaveCourse}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Tên khóa học <span className="text-danger">*</span></label>
                  <input type="text" className="form-control py-2" value={courseForm.name} onChange={(e) => setCourseForm({...courseForm, name: e.target.value})} required autoFocus placeholder="VD: Lập trình Web..." />
                </div>
                
                {/* TRƯỜNG NHẬP ẢNH MỚI */}
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Link Ảnh Bìa (URL)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><i className="fa-regular fa-image text-muted"></i></span>
                    <input type="text" className="form-control py-2 border-start-0 ps-0 shadow-none" value={courseForm.imageUrl} onChange={(e) => setCourseForm({...courseForm, imageUrl: e.target.value})} placeholder="https://link-anh.jpg" />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted">Mô tả chi tiết <span className="text-danger">*</span></label>
                  <textarea className="form-control py-2" rows="4" value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} required placeholder="Nhập nội dung khóa học..."></textarea>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn text-white fw-semibold" style={{ backgroundColor: "#3525cd" }} disabled={isSubmitting}>{isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // QUẢN LÝ GIẢNG VIÊN - ĐỘNG 100%
  const InstructorsTab = () => {
    const filteredInstructors = instructorsData.filter(i => i.name.toLowerCase().includes(instructorSearch.toLowerCase()));
    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold text-dark m-0">Instructors Directory</h4></div>
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom"><div className="position-relative" style={{ width: "350px" }}> <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm theo tên giảng viên..." value={instructorSearch} onChange={(e) => setInstructorSearch(e.target.value)} /></div></div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-light text-muted small text-uppercase"><tr><th className="ps-4">Tên Giảng Viên</th><th className="text-center">Số Khóa Đảm Nhận</th><th className="text-center">Đánh Giá</th><th>Trạng Thái</th></tr></thead>
              <tbody>
                {filteredInstructors.length > 0 ? filteredInstructors.map(i => (
                  <tr key={i.id} className="border-bottom">
                    <td className="ps-4 py-3"><h6 className="fw-bold m-0 text-dark small">{i.name}</h6><small className="text-muted">{i.email}</small></td>
                    <td className="fw-bold text-center small text-dark">{i.totalCourses}</td>
                    <td className="fw-bold text-center small text-dark"><i className="fa-solid fa-star text-warning me-1"></i>{i.rating}</td>
                    <td><span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">• Active</span></td>
                  </tr>
                )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy giảng viên nào.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // QUẢN LÝ SINH VIÊN - ĐỘNG 100%
  const StudentsTab = () => {
    const filteredStudents = studentsData.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));
    return (
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-4"><h4 className="fw-bold text-dark m-0">Student Directory</h4></div>
        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-3 border-bottom"><div className="position-relative" style={{ width: "300px" }}><i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-3 ps-5 text-sm" placeholder="Tìm theo tên học viên..." value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} /></div></div>
          <div className="table-responsive">
            <table className="table align-middle custom-table mb-0">
              <thead className="bg-white text-muted small text-uppercase border-bottom"><tr><th className="ps-4">Tên Học Viên</th><th>Ngày Tham Gia</th><th className="text-center">Khóa Đang Học</th><th style={{width: "15%"}}>Tiến Độ TB</th></tr></thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map(s => (
                  <tr key={s.id} className="border-bottom">
                    <td className="ps-4 py-3"><h6 className="fw-bold m-0 text-dark small">{s.name}</h6><small className="text-muted">{s.email}</small></td>
                    <td className="text-muted small">{s.joinedDate}</td>
                    <td className="fw-bold text-center text-dark small">{s.coursesEnrolled}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2"><div className="progress flex-grow-1" style={{ height: "6px" }}><div className="progress-bar bg-primary" style={{ width: `${s.progress}%` }}></div></div><span className="small fw-bold text-dark">{s.progress}%</span></div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="text-center py-4 text-muted">Không tìm thấy sinh viên nào.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div className="bg-white border-end d-flex flex-column" style={{ width: "260px" }}>
        <div className="p-4 d-flex align-items-center gap-2"><div className="rounded text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: "32px", height: "32px", backgroundColor: "#3525cd" }}>EA</div><h5 className="fw-bold m-0 text-dark">EduAdmin Pro</h5></div>
        <div className="px-3 flex-grow-1 mt-2 d-flex flex-column gap-1">
          <button onClick={() => setActiveTab('dashboard')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'dashboard' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'dashboard' ? '#f5f3ff' : 'transparent', color: activeTab === 'dashboard' ? '#3525cd' : '' }}><i className="fa-solid fa-border-all me-3"></i>Dashboard</button>
          <button onClick={() => setActiveTab('courses')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'courses' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'courses' ? '#f5f3ff' : 'transparent', color: activeTab === 'courses' ? '#3525cd' : '' }}><i className="fa-solid fa-book-open me-3"></i>Courses</button>
          <button onClick={() => setActiveTab('students')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'students' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'students' ? '#f5f3ff' : 'transparent', color: activeTab === 'students' ? '#3525cd' : '' }}><i className="fa-solid fa-users me-3"></i>Students</button>
          <button onClick={() => setActiveTab('instructors')} className={`btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 ${activeTab === 'instructors' ? 'text-primary' : 'text-muted'}`} style={{ backgroundColor: activeTab === 'instructors' ? '#f5f3ff' : 'transparent', color: activeTab === 'instructors' ? '#3525cd' : '' }}><i className="fa-solid fa-chalkboard-user me-3"></i>Instructors</button>
          
          <button onClick={onLogout} className="btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 text-danger mt-auto mb-3" style={{ backgroundColor: "#fef2f2" }}><i className="fa-solid fa-arrow-right-from-bracket me-3"></i>Log out</button>
        </div>
      </div>
      
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto">
        <div className="bg-white border-bottom px-4 py-3 sticky-top"><div className="position-relative" style={{ width: "400px" }}><i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i><input type="text" className="form-control bg-light border-0 rounded-pill ps-5 text-sm" placeholder="Tìm kiếm tài nguyên hệ thống..." /></div></div>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'instructors' && <InstructorsTab />}
        {activeTab === 'students' && <StudentsTab />}
      </div>

      {/* ==========================================
          CÁC MODALS (POPUP) BỔ SUNG Ở ĐÂY
      ========================================== */}

      {/* MODAL DANH SÁCH BÀI HỌC (LESSONS) */}
      {showLessonModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg w-100" style={{ maxWidth: "600px" }}>
            <div className="d-flex justify-content-between mb-4">
              <h5 className="fw-bold">Bài học của khóa: <span className="text-primary">{selectedCourse?.name}</span></h5>
              <i className="fa-solid fa-xmark cursor-pointer fs-5" onClick={() => setShowLessonModal(false)}></i>
            </div>
            <div className="list-group">
              {lessonsData.length > 0 ? lessonsData.map(l => (
                <div key={l.IdLesson} className="list-group-item d-flex justify-content-between align-items-center p-3">
                  <span className="fw-semibold">{l.Title}</span>
                  <button className="btn btn-sm btn-outline-success fw-bold px-3" onClick={() => openProblemManager(l)}>
                    <i className="fa-solid fa-code me-1"></i> Quản lý Code Problem
                  </button>
                </div>
              )) : <div className="text-center text-muted py-3">Khóa học này chưa có bài học nào.</div>}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DANH SÁCH BÀI TẬP (PROBLEMS) CỦA BÀI HỌC */}
      {showProblemModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-4 shadow-lg w-100" style={{ maxWidth: "800px" }}>
            <div className="d-flex justify-content-between mb-3">
              <h5 className="fw-bold">Bài tập của Lesson: <span className="text-primary">{selectedLesson?.Title}</span></h5>
              <i className="fa-solid fa-xmark cursor-pointer fs-5" onClick={() => setShowProblemModal(false)}></i>
            </div>
            <button className="btn btn-primary mb-3 shadow-sm fw-semibold" onClick={() => setShowAddProblemModal(true)}><i className="fa-solid fa-plus me-1"></i> Thêm Bài Tập Mới</button>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="bg-light"><tr><th>Tên Bài Tập</th><th className="text-center">Độ Khó</th><th className="text-center">Thời Gian</th><th className="text-center">Bộ Nhớ</th></tr></thead>
                <tbody>
                  {problemsData.length > 0 ? problemsData.map(p => (
                    <tr key={p.IdProblem}>
                      <td className="fw-semibold">{p.Title}</td><td className="text-center"><span className="badge bg-secondary">{p.Difficulty}</span></td><td className="text-center">{p.Time_limit} ms</td><td className="text-center">{p.Memory_limit} MB</td>
                    </tr>
                  )) : <tr><td colSpan="4" className="text-center text-muted py-4">Chưa có bài tập nào. Hãy thêm mới!</td></tr>}
                </tbody>
              </table>
            </div>
            <button className="btn btn-light mt-2" onClick={() => { setShowProblemModal(false); setShowLessonModal(true); }}>Quay lại danh sách bài học</button>
          </div>
        </div>
      )}

      {/* MODAL THÊM MỚI BÀI TẬP & TEST CASE */}
      {showAddProblemModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}>
          <div className="bg-white rounded-4 shadow-lg w-100 d-flex flex-column" style={{ maxWidth: "900px", height: "90vh" }}>
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
              <h5 className="m-0 fw-bold text-dark">Tạo Bài Tập Lập Trình</h5>
              <i className="fa-solid fa-xmark cursor-pointer fs-5 text-muted" onClick={() => setShowAddProblemModal(false)}></i>
            </div>
            
            <div className="p-4 overflow-auto flex-grow-1" style={{ backgroundColor: "#f8fafc" }}>
              <form id="problemForm" onSubmit={handleSaveProblem}>
                <div className="card border-0 shadow-sm p-4 mb-4 rounded-4">
                  <h6 className="fw-bold mb-3 text-primary"><i className="fa-solid fa-circle-info me-2"></i>Thông tin bài toán</h6>
                  <div className="row g-3">
                    <div className="col-md-8"><label className="form-label small fw-bold">Tên bài tập</label><input type="text" className="form-control" value={problemForm.title} onChange={e => setProblemForm({...problemForm, title: e.target.value})} required /></div>
                    <div className="col-md-4"><label className="form-label small fw-bold">Độ khó</label><select className="form-select" value={problemForm.difficulty} onChange={e => setProblemForm({...problemForm, difficulty: e.target.value})}><option value="DỄ">Dễ</option><option value="TRUNG BÌNH">Trung Bình</option><option value="KHÓ">Khó</option></select></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Giới hạn thời gian (ms)</label><input type="number" className="form-control" value={problemForm.timeLimit} onChange={e => setProblemForm({...problemForm, timeLimit: e.target.value})} required /></div>
                    <div className="col-md-6"><label className="form-label small fw-bold">Giới hạn bộ nhớ (MB)</label><input type="number" className="form-control" value={problemForm.memoryLimit} onChange={e => setProblemForm({...problemForm, memoryLimit: e.target.value})} required /></div>
                    <div className="col-12"><label className="form-label small fw-bold">Mô tả bài toán (Hỗ trợ định dạng)</label><textarea className="form-control" rows="4" value={problemForm.description} onChange={e => setProblemForm({...problemForm, description: e.target.value})} required placeholder="Nhập đề bài ở đây..."></textarea></div>
                    <div className="col-12"><label className="form-label small fw-bold">Code Mẫu / Gợi ý (Sample Code)</label><textarea className="form-control font-monospace bg-dark text-light" rows="3" value={problemForm.sampleCode} onChange={e => setProblemForm({...problemForm, sampleCode: e.target.value})} placeholder="def solve():\n    pass"></textarea></div>
                  </div>
                </div>
                
                <div className="card border-0 shadow-sm p-4 rounded-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold m-0 text-primary"><i className="fa-solid fa-vial-circle-check me-2"></i>Bộ Test Cases (Dữ liệu chấm điểm)</h6>
                    <button type="button" className="btn btn-sm btn-outline-primary fw-bold" onClick={handleAddTestCase}><i className="fa-solid fa-plus me-1"></i> Thêm Hàng</button>
                  </div>
                  {problemForm.testCases.map((tc, index) => (
                    <div key={index} className="row g-3 mb-3 p-3 rounded-3" style={{ backgroundColor: "#f1f5f9" }}>
                      <div className="col-md-6"><label className="form-label small fw-bold text-muted">Input {index + 1}</label><textarea className="form-control font-monospace" rows="2" value={tc.input} onChange={e => handleTestCaseChange(index, 'input', e.target.value)} required placeholder="VD: 5 10"></textarea></div>
                      <div className="col-md-6"><label className="form-label small fw-bold text-muted">Expected Output {index + 1}</label><textarea className="form-control font-monospace" rows="2" value={tc.output} onChange={e => handleTestCaseChange(index, 'output', e.target.value)} required placeholder="VD: 15"></textarea></div>
                    </div>
                  ))}
                </div>
              </form>
            </div>

            <div className="p-3 border-top bg-white text-end">
              <button type="button" className="btn btn-light fw-bold px-4 me-2" onClick={() => setShowAddProblemModal(false)}>Hủy bỏ</button>
              <button type="submit" form="problemForm" className="btn btn-primary fw-bold px-4 shadow-sm" disabled={isSubmitting}>{isSubmitting ? "Đang xử lý..." : "Lưu Bài Tập & Test Cases"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.custom-table th, .custom-table td { padding-top: 1rem; padding-bottom: 1rem; vertical-align: middle; } .btn-white { background-color: #fff; } .cursor-pointer { cursor: pointer; }`}</style>
    </div>
  );
}