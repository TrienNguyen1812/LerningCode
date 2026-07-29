export default function CoursesTab({
  coursesData,
  courseSearch,
  setCourseSearch,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteCourse,
  showModal,
  setShowModal,
  modalTitle,
  handleSaveCourse,
  courseInputValue,
  setCourseInputValue,
  isSubmitting,
}) {
  const filteredCourses = coursesData.filter((c) =>
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold m-0 text-dark" style={{ letterSpacing: "-0.5px" }}>Course Management</h5>
        <button
          onClick={handleOpenCreateModal}
          className="btn text-white fw-semibold px-3 py-2 rounded-3 shadow-sm text-sm"
          style={{ backgroundColor: "#0fbca9", border: "none" }}
        >
          <i className="fa-solid fa-plus me-2"></i> Create New Course
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="p-3 border-bottom d-flex align-items-center">
          <div className="position-relative" style={{ width: "320px" }}>
            <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-light border-0 rounded-3 ps-5 text-sm py-2"
              placeholder="Search courses..."
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle custom-table mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3" style={{ fontSize: "11px", fontWeight: "600" }}>Course Name</th>
                <th style={{ fontSize: "11px", fontWeight: "600" }}>Instructor</th>
                <th style={{ fontSize: "11px", fontWeight: "600" }}>Status</th>
                <th className="pe-4 text-end" style={{ fontSize: "11px", fontWeight: "600" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((c) => (
                  <tr key={c.id} className="border-bottom text-sm">
                    <td className="ps-4 py-3">
                      <h6 className="fw-bold m-0 text-dark" style={{ fontSize: "14px" }}>{c.name}</h6>
                      <small className="text-muted" style={{ fontSize: "11px" }}>Updated {c.updatedAt}</small>
                    </td>
                    <td><span className="text-dark fw-medium">{c.instructor}</span></td>
                    <td>
                      <span className="badge rounded-pill px-2.5 py-1 bg-success bg-opacity-10 text-success" style={{ fontSize: "11px" }}>
                        • {c.status}
                      </span>
                    </td>
                    <td className="pe-4 text-end">
                      <button
                        onClick={() => handleOpenEditModal(c.id, c.name)}
                        className="btn btn-sm btn-light me-2 rounded-circle border-0"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-pen text-primary small"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.id, c.name)}
                        className="btn btn-sm btn-light rounded-circle border-0"
                        style={{ width: "32px", height: "32px" }}
                      >
                        <i className="fa-solid fa-trash text-danger small"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted small">
                    Chưa có khóa học nào được tìm thấy.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Layout integration */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.3)", zIndex: 1050, backdropFilter: "blur(4px)" }}
        >
          <div className="bg-white p-4 rounded-4 w-100 shadow-lg border-0 m-3" style={{ maxWidth: "440px" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold m-0 text-dark" style={{ letterSpacing: "-0.5px" }}>{modalTitle}</h5>
              <i className="fa-solid fa-xmark fs-5 cursor-pointer text-muted" onClick={() => setShowModal(false)}></i>
            </div>
            <form onSubmit={handleSaveCourse}>
              <div className="mb-4">
                <label className="form-label small fw-semibold text-muted mb-2">Tên khóa học mới</label>
                <input
                  type="text"
                  className="form-control py-2.5 rounded-3 border-light bg-light text-sm shadow-none"
                  value={courseInputValue}
                  onChange={(e) => setCourseInputValue(e.target.value)}
                  required
                  autoFocus
                  placeholder="Ví dụ: Lập trình ReactJS căn bản..."
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light fw-medium rounded-3 text-sm px-4 py-2" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn text-white fw-medium rounded-3 text-sm px-4 py-2" style={{ backgroundColor: "#0fbca9" }} disabled={isSubmitting}>
                  {isSubmitting ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}