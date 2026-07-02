import {
  FaMagnifyingGlass,
  FaRegBell,
  FaStar,
  FaArrowRightFromBracket,
  FaUser,
} from "react-icons/fa6";

export default function Navbar({ currentUser, onLogout }) {
  return (
    <header
      className="navbar navbar-expand-md bg-white border-bottom shadow-sm fixed-top px-4 py-3"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-4">
          <h1
            className="h4 fw-bold m-0 text-primary"
            style={{ color: "#3525cd" }}
          >
            DevLearner
          </h1>
          <nav className="d-none d-md-flex gap-3 ms-4">
            <a
              className="nav-link text-primary fw-bold border-bottom border-primary border-2 pb-1"
              href="#dashboard"
            >
              Dashboard
            </a>
            <a className="nav-link text-secondary" href="#explore">
              Explore
            </a>
            <a className="nav-link text-secondary" href="#projects">
              Projects
            </a>
          </nav>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Ô tìm kiếm nhanh */}
          <div className="position-relative d-none d-sm-block">
            {/* Thay thẻ <i> bằng Component Icon, chỉnh css qua className hoặc style */}
            <FaMagnifyingGlass className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
            <input
              type="text"
              className="form-control rounded-pill border-0 bg-light ps-5 text-sm"
              placeholder="Tìm kiếm khóa học..."
              style={{ width: "260px", fontSize: "14px" }}
            />
          </div>

          {/* Các nút tính năng */}
          <button className="btn btn-light rounded-circle p-2 text-secondary border-0 d-flex align-items-center justify-content-center">
            <FaRegBell size={18} />
          </button>
          <button className="btn btn-light rounded-circle p-2 text-warning border-0 d-flex align-items-center justify-content-center">
            <FaStar size={18} />
          </button>

          {/* Khối thông tin User & Avatar Favicon */}
          <div className="d-flex align-items-center gap-2 border-start ps-3 ms-2">
            <div className="text-end d-none d-lg-block">
              <p className="fw-bold m-0 small text-dark">
                {currentUser?.fullName || "Học viên"}
              </p>
            </div>

            <div
              className="d-flex align-items-center justify-content-center rounded-circle border border-2 border-primary bg-light text-secondary shadow-sm"
              style={{ width: "40px", height: "40px" }}
            >
              <FaUser size={18} className="text-primary" />
            </div>

            {/* Nút Đăng xuất dùng React Icon */}
            <button
              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1.5 ms-2 d-flex align-items-center gap-1"
              onClick={onLogout}
              title="Đăng xuất tài khoản"
              style={{ fontSize: "12px" }}
            >
              <FaArrowRightFromBracket />
              <span className="fw-semibold">Exit</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
