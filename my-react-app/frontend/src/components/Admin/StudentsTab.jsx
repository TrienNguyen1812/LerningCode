export default function StudentsTab({ studentsData, studentSearch, setStudentSearch, handleExportCSV }) {
  const filteredStudents = studentsData.filter((s) =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold text-dark m-0" style={{ letterSpacing: "-0.5px" }}>Student Directory</h5>
        <button onClick={handleExportCSV} className="btn btn-white border border-light bg-white fw-semibold rounded-3 text-sm text-secondary shadow-sm px-3 py-2">
          <i className="fa-solid fa-file-export me-2"></i>Export CSV
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="p-3 border-bottom">
          <div className="position-relative" style={{ width: "320px" }}>
            <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control bg-light border-0 rounded-3 ps-5 text-sm py-2"
              placeholder="Search student profile..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table align-middle custom-table mb-0 text-sm">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-4 py-3">Student Name</th>
                <th>Joined Date</th>
                <th className="text-center">Courses</th>
                <th style={{ width: "20%" }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-bottom">
                  <td className="ps-4 py-3">
                    <h6 className="fw-bold m-0 text-dark" style={{ fontSize: "14px" }}>{s.name}</h6>
                    <small className="text-muted" style={{ fontSize: "11px" }}>{s.email}</small>
                  </td>
                  <td className="text-muted" style={{ fontSize: "13px" }}>{s.joinedDate}</td>
                  <td className="fw-semibold text-center text-dark">{s.coursesEnrolled}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1 bg-light rounded-pill" style={{ height: "6px" }}>
                        <div className="progress-bar rounded-pill" style={{ width: `${s.progress}%`, backgroundColor: "#0fbca9" }}></div>
                      </div>
                      <span className="fw-bold text-dark" style={{ fontSize: "12px" }}>{s.progress}%</span>
                    </div>
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