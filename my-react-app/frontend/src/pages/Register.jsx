import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Register({ onSwitchToLogin }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // Validate dữ liệu cơ bản
    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg(data.message);
        // Xóa form sau khi đăng ký thành công
        setFullName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      console.error("Lỗi gọi API:", error);
      setErrorMsg("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative w-100 m-0 p-0 font-sans" style={{ backgroundColor: "#f7f9fb" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 col-xl-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="card-body p-4 p-md-5">
                
                <div className="text-center mb-4">
                  <h1 className="h3 fw-bold mb-2" style={{ color: "#3525cd" }}>DevLearner</h1>
                  <p className="text-muted small">Tạo tài khoản mới để bắt đầu học tập.</p>
                </div>

                {/* Hiển thị thông báo */}
                {errorMsg && (
                  <div className="alert alert-danger py-2 small fw-medium" role="alert">
                    <i className="fa-solid fa-circle-exclamation me-2"></i>{errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="alert alert-success py-2 small fw-medium" role="alert">
                    <i className="fa-solid fa-circle-check me-2"></i>{successMsg}
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Họ và tên</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted px-3">
                        <i className="fa-regular fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-0 shadow-none py-2.5"
                        placeholder="VD: Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Email</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted px-3">
                        <i className="fa-regular fa-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className="form-control bg-light border-0 shadow-none py-2.5"
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted px-3">
                        <i className="fa-solid fa-lock"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-0 shadow-none py-2.5"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength="6"
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-muted">Xác nhận mật khẩu</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-0 text-muted px-3">
                        <i className="fa-solid fa-shield-halved"></i>
                      </span>
                      <input
                        type="password"
                        className="form-control bg-light border-0 shadow-none py-2.5"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div className="d-grid mb-4">
                    <button
                      type="submit"
                      className="btn text-white fw-bold py-2.5 rounded-3 shadow-sm transition-all custom-login-btn"
                      style={{ backgroundColor: "#3525cd" }}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      ) : (
                        <>Đăng ký ngay <i className="fa-solid fa-user-plus ms-1"></i></>
                      )}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="small text-muted mb-0">
                      Đã có tài khoản?{" "}
                      <span
                        className="fw-bold text-decoration-none cursor-pointer"
                        style={{ color: "#3525cd", cursor: "pointer" }}
                        onClick={onSwitchToLogin}
                      >
                        Đăng nhập ngay
                      </span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="small text-muted">&copy; 2026 DevLearner E-Learning Platform</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-login-btn:hover { background-color: #2a1da3 !important; transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
