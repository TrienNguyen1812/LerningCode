export default function CourseCard({ course }) {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden position-relative bg-white custom-course-card text-start">
        <div className="ratio ratio-16x9 overflow-hidden position-relative img-wrapper">
          <img src={course.image} alt={course.title} className="w-100 h-100 object-cover course-card-img" />
          <div className="position-absolute top-0 start-0 m-3">
            <span className="badge bg-dark bg-opacity-75 text-white rounded-pill px-2.5 py-1.5 fw-semibold backdrop-blur" style={{ fontSize: "11px", backdropFilter: "blur(4px)" }}>
              E-Learning
            </span>
          </div>
        </div>

        <div className="p-4 d-flex flex-column justify-content-between" style={{ flexGrow: 1 }}>
          <div>
            <h5 className="fw-bold text-dark mb-2 lh-base course-title" style={{ fontSize: "16px" }}>
              {course.title}
            </h5>

            <div className="d-flex align-items-center gap-1 mb-3 text-warning font-awesome-stars" style={{ fontSize: "13px" }}>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className="fa-solid fa-star"></i>
              <i className={course.rating >= 5 ? "fa-solid fa-star" : "fa-solid fa-star-half-stroke"}></i>
              <span className="text-dark fw-bold ms-2" style={{ fontSize: "13px" }}>
                {course.rating.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <div className="d-flex align-items-center justify-content-between mb-1.5">
              <span className="text-muted small fw-medium">Tiến độ</span>
              <span className="fw-bold small" style={{ color: course.progress === 100 ? "#198754" : "#3525cd" }}>
                {course.progress === 100 ? "Hoàn thành!" : `${course.progress}%`}
              </span>
            </div>

            <div className="progress bg-light shadow-none" style={{ height: "6px", borderRadius: "10px" }}>
              <div
                className={`progress-bar rounded-pill ${course.progress === 100 ? "bg-success" : "bg-primary"}`}
                role="progressbar"
                style={{ width: `${course.progress}%`, backgroundColor: course.progress === 100 ? "#198754" : "#3525cd" }}
                aria-valuenow={course.progress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}