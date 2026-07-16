import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminApp from './pages/AdminApp'; 
import StudentDashboard from './pages/StudentDashboard'; 
import './App.css';

function App() {
  // 🌟 KHÔI PHỤC TRẠNG THÁI: Đọc dữ liệu user từ localStorage ngay khi khởi tạo App (nếu có)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Trạng thái điều khiển việc hiển thị Form Đăng nhập hay Đăng ký
  const [authView, setAuthView] = useState('login'); 

  // Hàm callback nhận dữ liệu User từ Login.jsx truyền lên
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // 🌟 LƯU VÀO STORAGE: Lưu thông tin phiên đăng nhập lại dưới dạng chuỗi JSON
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  // Hàm xử lý đăng xuất, đưa người dùng về trạng thái ban đầu
  const handleLogout = () => {
    setCurrentUser(null);
    setAuthView('login');
    // 🌟 XÓA BỎ STORAGE: Quét sạch phiên đăng nhập cũ trong máy sinh viên khi họ bấm Logout
    localStorage.removeItem('currentUser');
  };

  // =========================================================
  // LOGIC ĐIỀU PHỐI GIAO DIỆN VÀ PHÂN QUYỀN
  // =========================================================

  // BƯỚC 1: Nếu CHƯA đăng nhập -> Hiển thị cụm màn hình xác thực
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

  // BƯỚC 2: Nếu ĐÃ đăng nhập -> Kiểm tra giá trị cột "Role" trong CSDL để phân tuyến
  if (currentUser.role === 'admin') {
    // Tài khoản có Role là 'admin' -> Vào giao diện AdminApp (Dashboard và Course Management)
    return <AdminApp onLogout={handleLogout} />;
  } 
  
  if (currentUser.role === 'sinh viên' || currentUser.role === 'sinhvien') {
    // Tài khoản có Role là 'sinh viên' -> Chỉ được phép vào trang StudentDashboard
    return <StudentDashboard currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Phương án dự phòng cho các trường hợp vai trò khác (ví dụ: giảng viên)
  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
      <div className="text-center p-5 card border-0 shadow-sm rounded-4 bg-white" style={{ maxWidth: "400px" }}>
        <i className="fa-solid fa-user-lock text-warning fs-1 mb-3"></i>
        <h5 className="fw-bold text-dark">Xin chào {currentUser.fullName || currentUser.username}</h5>
        <p className="text-muted small">Tài khoản thuộc vai trò <span className="fw-bold">"{currentUser.role}"</span> chưa được cấu hình phân vùng giao diện học tập.</p>
        <button className="btn btn-danger btn-sm rounded-3 px-4 py-2 fw-bold w-100 shadow-sm mt-2" onClick={handleLogout}>
          <i className="fa-solid fa-arrow-right-from-bracket me-2"></i> Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default App;