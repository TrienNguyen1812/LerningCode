export default function InstructorsTab({ instructorsData, instructorSearch, setInstructorSearch, handleFilter, handleAddInstructor }) {
  const filteredInstructors = instructorsData.filter((i) =>
    i.name.toLowerCase().includes(instructorSearch.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>Instructors</h5>
        <div className="d-flex gap-2">
          <button onClick={handleFilter} className="btn btn-white border border-light bg-white fw-semibold rounded-3 text-sm text-secondary shadow-sm px-3 py-2">
            <i className="fa-solid fa-filter me-2"></i>Filter
          </button>
          <button onClick={handleAddInstructor} className="btn text-white fw-semibold rounded-3 text-sm shadow-sm px-3 py-2" style={{ backgroundColor: "#0fbca9" }}>
            <i className="fa-solid fa-user-plus me-2"></i>Add
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="p-3 border-bottom">
          <div className="position-relative" style={{ width: "320px" }}>
            <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-light border-0 rounded-3 ps-5 text-sm py-2"
              placeholder="Search instructor profile..."
              value={instructorSearch}
              onChange={(e) => setInstructorSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle custom-table mb-0 text-sm">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">Name</th>
                <th className="text-center">Courses</th>
                <th className="text-center">Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstructors.map((i) => (
                <tr key={i.id} className="border-bottom">
                  <td className="ps-4 py-3">
                    <h6 className="fw-bold m-0 text-dark" style={{ fontSize: "14px" }}>{i.name}</h6>
                    <small className="text-muted" style={{ fontSize: "11px" }}>{i.email}</small>
                  </td>
                  <td className="fw-semibold text-center text-dark">{i.totalCourses}</td>
                  <td className="fw-semibold text-center text-dark">
                    <i className="fa-solid fa-star text-warning me-1"></i>{i.rating}
                  </td>
                  <td>
                    <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2.5 py-1" style={{ fontSize: "11px" }}>
                      • Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}