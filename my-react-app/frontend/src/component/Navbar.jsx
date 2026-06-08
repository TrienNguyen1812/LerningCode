export default function navBar(){
    return(
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
            <div className="position-relative d-none d-sm-block">
              <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"></i>
              <input
                type="text"
                className="form-control rounded-pill border-0 bg-light ps-5 text-sm"
                placeholder="Tìm kiếm khóa học..."
                style={{ width: "260px", fontSize: "14px" }}
              />
            </div>

            <button className="btn btn-light rounded-circle p-2 text-secondary border-0">
              <i className="fa-regular fa-bell"></i>
            </button>
            <button className="btn btn-light rounded-circle p-2 text-warning border-0">
              <i className="fa-solid fa-star"></i>
            </button>

            <div className="d-flex align-items-center gap-2 border-start ps-3 ms-2">
              <div className="text-end d-none d-lg-block">
                <p className="fw-bold m-0 small">Alex Dev</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                alt="Student Profile"
                className="rounded-circle border border-2 border-primary object-cover"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
          </div>
        </div>
      </header>
    );
}