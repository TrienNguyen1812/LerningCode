export default function DeadlinePanel({ deadlines }) {
  return (
    <div className="card bg-white border-0 shadow-sm rounded-4 p-4 h-100">
      <h5 className="fw-bold mb-3 small text-uppercase text-muted tracking-wider">
        Hạn chót bài tập bài nộp
      </h5>

      <div className="d-flex flex-column gap-3">
        {deadlines.map((item) => (
          <div key={item.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light bg-opacity-50">
            <div className="d-flex align-items-center gap-3">
              <div className={`p-2 rounded-circle ${
                item.status === "expired" ? "bg-danger bg-opacity-10 text-danger" :
                item.status === "completed" ? "bg-success bg-opacity-10 text-success" :
                "bg-warning bg-opacity-10 text-warning"
              }`}>
                <i className={`fa-solid ${item.status === "completed" ? "fa-circle-check" : "fa-clock"} fs-5`}></i>
              </div>
              <div>
                <p className="fw-bold m-0 text-sm line-clamp-1" style={{ fontSize: "14px" }}>
                  {item.title}
                </p>
                <p className="text-muted m-0" style={{ fontSize: "12px" }}>
                  {item.course}
                </p>
              </div>
            </div>
            <span className={`badge rounded-2 px-2 py-1.5 font-monospace ${
              item.status === "expired" ? "bg-danger text-white" :
              item.status === "completed" ? "bg-success text-white" :
              "bg-warning text-dark"
            }`} style={{ fontSize: "11px" }}>
              {item.dueDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}