export default function sideBar({onLogout}){
    return(
        <aside
      className="col-12 col-md-3 col-xl-2 d-flex flex-column border-end bg-white p-3 gap-2 pt-4 position-sticky"
      style={{ top: "75px", height: "calc(100vh - 75px)", zIndex: 100 }}
    >
      <div className="nav flex-column gap-1 mb-4">
        <div className="nav-link active d-flex align-items-center gap-3 fw-bold rounded-3 p-3 bg-primary bg-opacity-10 text-primary cursor-pointer">
          <i className="fa-solid fa-chart-pie"></i>
          <span className="small">Dashboard</span>
        </div>
        <div className="nav-link d-flex align-items-center gap-3 text-secondary rounded-3 p-3 hover-bg-light cursor-pointer">
          <i className="fa-solid fa-graduation-cap"></i>
          <span className="small">My Courses</span>
        </div>
        <div className="nav-link d-flex align-items-center gap-3 text-secondary rounded-3 p-3 hover-bg-light cursor-pointer">
          <i className="fa-solid fa-route"></i>
          <span className="small">Learning Path</span>
        </div>
        <div className="nav-link d-flex align-items-center gap-3 text-secondary rounded-3 p-3 hover-bg-light cursor-pointer">
          <i className="fa-solid fa-users"></i>
          <span className="small">Community</span>
        </div>
        <div className="nav-link d-flex align-items-center gap-3 text-secondary rounded-3 p-3 hover-bg-light cursor-pointer">
          <i className="fa-solid fa-gear"></i>
          <span className="small">Settings</span>
        </div>
      </div>

      <div className="mt-auto pt-3 border-top">
        <div className="nav flex-column gap-1">
          <div className="nav-link d-flex align-items-center gap-3 text-secondary rounded-3 px-3 py-2 cursor-pointer">
            <i className="fa-regular fa-circle-question"></i>
            <span className="small">Help Center</span>
          </div>
          <div className="nav-link d-flex align-items-center gap-3 text-danger rounded-3 px-3 py-2 cursor-pointer">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span className="small">Logout</span>
          </div>
        </div>
      </div>
    </aside>
    );
}