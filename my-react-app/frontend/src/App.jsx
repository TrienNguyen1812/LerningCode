// import React, { useState } from 'react';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminApp from './pages/AdminApp'; 
// import StudentDashboard from './pages/StudentDashboard'; 
// import './App.css';

// function App() {
//   // Trạng thái lưu thông tin tài khoản sau khi đăng nhập thành công
//   const [currentUser, setCurrentUser] = useState(null);
  
//   // Trạng thái điều khiển việc hiển thị Form Đăng nhập hay Đăng ký
//   const [authView, setAuthView] = useState('login'); 

//   // Hàm callback nhận dữ liệu User từ Login.jsx truyền lên
//   const handleLoginSuccess = (userData) => {
//     setCurrentUser(userData);
//   };

//   // Hàm xử lý đăng xuất, đưa người dùng về trạng thái ban đầu
//   const handleLogout = () => {
//     setCurrentUser(null);
//     setAuthView('login');
//   };

//   // =========================================================
//   // LOGIC ĐIỀU PHỐI GIAO DIỆN VÀ PHÂN QUYỀN
//   // =========================================================

//   // BƯỚC 1: Nếu CHƯA đăng nhập -> Hiển thị cụm màn hình xác thực
//   if (!currentUser) {
//     if (authView === 'login') {
//       return (
//         <Login 
//           onLoginSuccess={handleLoginSuccess} 
//           onSwitchToRegister={() => setAuthView('register')} 
//         />
//       );
//     } else {
//       return (
//         <Register 
//           onSwitchToLogin={() => setAuthView('login')} 
//         />
//       );
//     }
//   }

//   // BƯỚC 2: Nếu ĐÃ đăng nhập -> Kiểm tra giá trị cột "Role" trong CSDL để phân tuyến
//   if (currentUser.role === 'admin') {
//     // Tài khoản có Role là 'admin' -> Vào giao diện AdminApp (Dashboard và Course Management)
//     return <AdminApp onLogout={handleLogout} />;
//   } 
  
//   if (currentUser.role === 'sinh viên') {
//     // Tài khoản có Role là 'sinh viên' -> Chỉ được phép vào trang StudentDashboard
//     return <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />;
//   }

//   // Phương án dự phòng cho các trường hợp vai trò khác (ví dụ: giảng viên)
//   return (
//     <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
//       <div className="text-center p-5 card border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: "400px" }}>
//         <i className="fa-solid fa-user-lock text-warning fs-1 mb-3"></i>
//         <h5 className="fw-bold text-dark">Xin chào {currentUser.fullName}</h5>
//         <p className="text-muted small">Tài khoản thuộc vai trò <span className="fw-bold">"{currentUser.role}"</span> chưa được cấu hình phân vùng giao diện học tập.</p>
//         <button className="btn btn-danger btn-sm rounded-3 px-4 py-2 fw-bold w-100 shadow-sm mt-2" onClick={handleLogout}>
//           <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;



// import React, { useState } from 'react';
// import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Thêm dòng này
// import Login from './pages/Login';
// import Register from './pages/Register';
// import AdminApp from './pages/AdminApp'; 
// import StudentDashboard from './pages/StudentDashboard'; 
// import CourseDetailPage from './pages/CourseDetailPage'; // Thêm dòng này
// import './App.css';

// function App() {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [authView, setAuthView] = useState('login'); 

//   const handleLoginSuccess = (userData) => {
//     setCurrentUser(userData);
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     setAuthView('login');
//   };

//   // Logic điều phối giao diện
//   if (!currentUser) {
//     if (authView === 'login') {
//       return (
//         <Login 
//           onLoginSuccess={handleLoginSuccess} 
//           onSwitchToRegister={() => setAuthView('register')} 
//         />
//       );
//     } else {
//       return (
//         <Register 
//           onSwitchToLogin={() => setAuthView('login')} 
//         />
//       );
//     }
//   }

//   // Nếu đã đăng nhập, bọc trong BrowserRouter để dùng được điều hướng
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Phân tuyến dựa trên Role */}
//         <Route path="/" element={
//            currentUser.role === 'admin' ? <AdminApp onLogout={handleLogout} /> : 
//            currentUser.role === 'sinh viên' ? <StudentDashboard currentUser={currentUser} onLogout={handleLogout} /> :
//            <RoleFallback currentUser={currentUser} onLogout={handleLogout} />
//         } />
        
//         {/* Đường dẫn tới trang chi tiết khóa học */}
//         <Route path="/course-detail/:id" element={<CourseDetailPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// // Component dự phòng cho các role khác
// function RoleFallback({ currentUser, onLogout }) {
//   return (
//     <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
//       <div className="text-center p-5 card border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: "400px" }}>
//         <i className="fa-solid fa-user-lock text-warning fs-1 mb-3"></i>
//         <h5 className="fw-bold text-dark">Xin chào {currentUser.fullName}</h5>
//         <p className="text-muted small">Tài khoản thuộc vai trò <span className="fw-bold">"{currentUser.role}"</span> chưa được cấu hình phân vùng giao diện.</p>
//         <button className="btn btn-danger btn-sm rounded-3 px-4 py-2 fw-bold w-100 shadow-sm mt-2" onClick={onLogout}>
//           <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
//         </button>
//       </div>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminApp from './pages/AdminApp'; 
import StudentDashboard from './pages/StudentDashboard'; 
import CourseDetailPage from './pages/CourseDetailPage';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); 

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
  };

  if (!currentUser) {
    if (authView === 'login') {
      return <Login onLoginSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} />;
    } else {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
  }

  return (
    <Routes>
      <Route path="/" element={
          currentUser.role === 'admin' ? <AdminApp onLogout={handleLogout} /> : 
          currentUser.role === 'sinh viên' ? <StudentDashboard currentUser={currentUser} onLogout={handleLogout} /> :
          <RoleFallback currentUser={currentUser} onLogout={handleLogout} />
      } />
      <Route path="/course-detail/:id" element={<CourseDetailPage />} />
    </Routes>
  );
}

function RoleFallback({ currentUser, onLogout }) {
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <div className="text-center p-5 card border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: "400px" }}>
        <i className="fa-solid fa-user-lock text-warning fs-1 mb-3"></i>
        <h5 className="fw-bold text-dark">Xin chào {currentUser.fullName}</h5>
        <p className="text-muted small">Tài khoản thuộc vai trò <span className="fw-bold">"{currentUser.role}"</span> chưa được cấu hình phân vùng giao diện.</p>
        <button className="btn btn-danger btn-sm rounded-3 px-4 py-2 fw-bold w-100 shadow-sm mt-2" onClick={onLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default App;