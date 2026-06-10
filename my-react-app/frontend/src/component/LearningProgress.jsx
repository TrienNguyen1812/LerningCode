export default function LearningProgress() {
  return (
    <section className="mb-5">
      <div
        className="card border-0 rounded-4 text-white p-4 p-md-5 shadow-lg position-relative overflow-hidden"
        style={{ backgroundColor: "#3525cd" }}
      >
        <div
          className="position-absolute top-0 end-0 translate-middle-x mt-n5 me-n5 bg-white bg-opacity-10 rounded-circle blur-3xl"
          style={{ width: "250px", height: "250px", pointerEvents: "none" }}
        ></div>

        <div className="position-relative d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 z-1">
          <div className="flex-grow-1 w-100 text-center text-md-start">
            <div className="mb-3">
              <span
                className="badge bg-white bg-opacity-20 rounded-pill text-uppercase px-3 py-2 fw-bold d-inline-flex align-items-center"
                style={{ fontSize: "11px", letterSpacing: "0.05em" }}
              >
                <span
                  className="spinner-grow spinner-grow-sm text-success me-2"
                  role="status"
                  style={{ width: "8px", height: "8px" }}
                ></span>
                Đang học
              </span>
            </div>

            <h3 className="h2 fw-bold mb-2">Lập trình ReactJS Nâng cao</h3>
            <p
              className="text-white-50 mb-4 mx-auto mx-md-0"
              style={{ maxWidth: "650px", fontSize: "15px", lineHeight: "1.6" }}
            >
              Học về Hooks nâng cao, State Management với Redux Toolkit và
              Performance Optimization phục vụ tự đánh giá đồ án.
            </p>

            <div className="mb-4 mx-auto mx-md-0" style={{ maxWidth: "500px" }}>
              <div className="d-flex justify-content-between fw-semibold small mb-2">
                <span className="text-white-50">Tiến độ khóa học</span>
                <span className="fw-bold">65%</span>
              </div>
              <div
                className="progress bg-white bg-opacity-25 shadow-sm"
                style={{ height: "8px" }}
              >
                <div
                  className="progress-bar bg-white rounded-pill"
                  role="progressbar"
                  style={{ width: "65%" }}
                  aria-valuenow="65"
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <p className="text-white-50 fst-italic small mt-2 mb-0">
                Còn 8 bài học nữa để hoàn thành chương 4
              </p>
            </div>

            <button className="btn bg-white text-primary fw-bold px-4 py-2.5 rounded-3 shadow d-inline-flex align-items-center gap-2 transition-all hover-scale">
              Tiếp tục học{" "}
              <i className="fa-solid fa-play" style={{ fontSize: "12px" }}></i>
            </button>
          </div>

          <div
            className="d-none d-md-flex align-items-center justify-content-center bg-white bg-opacity-10 rounded-4 border border-white border-opacity-10 shadow-sm flex-shrink-0"
            style={{
              width: "160px",
              height: "160px",
              transform: "rotate(6deg)",
              backdropFilter: "blur(5px)",
            }}
          >
            <i
              className="fa-solid fa-code text-white text-opacity-25"
              style={{ fontSize: "64px" }}
            ></i>
          </div>
        </div>
      </div>
    </section>
  );
}
