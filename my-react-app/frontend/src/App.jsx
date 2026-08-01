import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard'; 
import CreateCoursePage from './pages/Admin/CreateCoursePage';

import './App.css';

function AppContent() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [authView, setAuthView] = useState('login'); 

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
    localStorage.removeItem('currentUser');
  };

  if (!currentUser) {
    if (authView === 'login') {
      return (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onSwitchToRegister={() => setAuthView('register')} 
        />
      );
    } else {
      return (
        <Register 
          onSwitchToLogin={() => setAuthView('login')} 
        />
      );
    }
  }

  const isStudent = currentUser.role === 'sinh viên' || currentUser.role === 'sinhvien';
  const isAdmin = currentUser.role === 'admin';

  return (
    <Routes>
      {/* Route cho Sinh viên */}
      {isStudent && (
        <>
          <Route path="/student/*" element={<StudentDashboard currentUser={currentUser} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/student" replace />} />
        </>
      )}

      {/* Route cho Admin */}
      {isAdmin && (
        <>
          {/* 🌟 1. ROUTE CHI TIẾT KHÓA HỌC: Đặt lên trước /admin/* để React Router khớp đúng URL */}
          <Route 
            path="/admin/courses/:courseId" 
            element={
              <AdminDashboard onLogout={handleLogout} overrideTab="course-detail" />
            } 
          />

          {/* 🌟 2. Màn hình Admin chính */}
          <Route path="/admin/*" element={<AdminDashboard onLogout={handleLogout} />} />
          
          {/* Màn hình Tạo khóa học mới */}
          <Route path="/courses/create" element={<CreateCoursePage />} />

          {/* Mặc định điều hướng về trang Admin nếu sai path */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      )}

      {/* Dự phòng cho các role khác */}
      {!isAdmin && !isStudent && (
        <Route
          path="*"
          element={
            <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
              <div className="text-center p-5 card border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: "400px" }}>
                <i className="fa-solid fa-user-lock text-warning fs-1 mb-3"></i>
                <h5 className="fw-bold text-dark">Xin chào {currentUser.fullName || currentUser.username}</h5>
                <p className="text-muted small">Tài khoản thuộc vai trò <span className="fw-bold">"{currentUser.role}"</span> chưa được cấu hình phân vùng giao diện.</p>
                <button className="btn btn-danger btn-sm rounded-3 px-4 py-2 fw-bold w-100 shadow-sm mt-2" onClick={handleLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
                </button>
              </div>
            </div>
          }
        />
      )}
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}