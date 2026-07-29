import {
  FaMagnifyingGlass,
  FaRegBell,
  FaRegEnvelope,
  FaChevronDown,
  FaArrowRightFromBracket,
  FaUser,
} from "react-icons/fa6";

export default function Navbar({ currentUser, onLogout }) {
  const userName = currentUser?.fullName || currentUser?.FullName || "John Doe";

  return (
    <header
      className="navbar navbar-expand-lg bg-white border-bottom fixed-top px-4 py-2"
      style={{ zIndex: 1050, minHeight: "64px" }}
    >
      <div className="container-fluid p-0 d-flex justify-content-between align-items-center">
        
        {/* --- KHỐI BÊN TRÁI: LOGO & WORKSPACE DROPDOWN --- */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2 px-3 py-1.5 rounded-3 border bg-light cursor-pointer">
            <div
              className="rounded-2 bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "26px", height: "26px", fontSize: "12px" }}
            >
              F
            </div>
            <span className="fw-bold text-dark" style={{ fontSize: "14px" }}>
              Fikri Studio
            </span>
            <FaChevronDown size={12} className="text-secondary ms-1" />
          </div>

          {/* --- MENU TABS ĐIỀU HƯỚNG CHÍNH --- */}
          <nav className="d-none d-md-flex align-items-center gap-1 ms-3">
            <button
              className="btn btn-light text-success fw-bold px-3 py-1.5 rounded-3 d-flex align-items-center gap-2 active border-0"
              style={{ backgroundColor: "#e6f7f5", color: "#00bba7", fontSize: "14px" }}
            >
              <i className="fa-solid fa-border-all" style={{ fontSize: "13px" }}></i>
              Dashboard
            </button>
            <button
              className="btn btn-text text-secondary fw-semibold px-3 py-1.5 rounded-3 d-flex align-items-center gap-2 border-0"
              style={{ fontSize: "14px" }}
            >
              <i className="fa-regular fa-folder" style={{ fontSize: "13px" }}></i>
              Assigned
            </button>
            <button
              className="btn btn-text text-secondary fw-semibold px-3 py-1.5 rounded-3 d-flex align-items-center gap-2 border-0"
              style={{ fontSize: "14px" }}
            >
              <i className="fa-regular fa-compass" style={{ fontSize: "13px" }}></i>
              Explore
            </button>
          </nav>
        </div>

        {/* --- KHỐI BÊN PHẢI: UTILITIES & USER PROFILE --- */}
        <div className="d-flex align-items-center gap-2">
          {/* Nút Tin Nhắn */}
          <button className="btn btn-light rounded-circle p-2 text-secondary border-0 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
            <FaRegEnvelope size={16} />
          </button>

          {/* Nút Thông Báo */}
          <button className="btn btn-light rounded-circle p-2 text-secondary border-0 d-flex align-items-center justify-content-center position-relative" style={{ width: "38px", height: "38px" }}>
            <FaRegBell size={16} />
            <span className="position-absolute top-2 start-2 translate-middle p-1 bg-danger border border-light rounded-circle">
              <span className="visually-hidden">New alerts</span>
            </span>
          </button>

          {/* Ô Tìm Kiếm / Icon Tìm Kiếm */}
          <button className="btn btn-light rounded-circle p-2 text-secondary border-0 d-flex align-items-center justify-content-center" style={{ width: "38px", height: "38px" }}>
            <FaMagnifyingGlass size={16} />
          </button>

          {/* Đường gạch phân cách */}
          <div className="vr mx-2 opacity-25" style={{ height: "24px" }}></div>

          {/* Thông tin User & Avatar */}
          <div className="d-flex align-items-center gap-2 ms-1">
            <div
              className="rounded-circle overflow-hidden bg-secondary text-white d-flex align-items-center justify-content-center fw-bold"
              style={{ width: "36px", height: "36px", fontSize: "14px" }}
            >
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="Avatar" className="w-100 h-100 object-fit-cover" />
              ) : (
                <FaUser size={16} />
              )}
            </div>

            <div className="d-none d-lg-block text-start" style={{ lineHeight: "1.2" }}>
              <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                {userName}
              </div>
              <div className="text-muted" style={{ fontSize: "11px" }}>
                Learner
              </div>
            </div>

            <FaChevronDown size={11} className="text-secondary ms-1 d-none d-lg-block" />

            {/* Nút Đăng Xuất */}
            <button
              className="btn btn-sm btn-outline-danger rounded-pill px-2.5 py-1.5 ms-2 d-flex align-items-center gap-1 border-0"
              onClick={onLogout}
              title="Đăng xuất tài khoản"
              style={{ fontSize: "12px" }}
            >
              <FaArrowRightFromBracket size={14} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}