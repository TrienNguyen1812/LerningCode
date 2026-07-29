export default function RightSidebarPanel() {
  const summaryItems = [
    { label: "Course", count: 6 },
    { label: "Quiz", count: 4 },
    { label: "Manuals", count: "-" },
    { label: "Learning Path", count: 2 },
  ];

  const groups = [
    { id: 1, name: "Design Department", visibility: "Public", members: "24 Members", bg: "#3b82f6" },
    { id: 2, name: "General Learning Group", visibility: "Public", members: "12 Members", bg: "#f97316" },
    { id: 3, name: "Language Learning Group", visibility: "Public", members: "18 Members", bg: "#8b5cf6" },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      {/* 1. Learning Item Summary */}
      <div className="bg-white p-3 rounded-3 shadow-sm border">
        <h6 className="fw-bold text-dark mb-3">Learning Item Summary</h6>
        <div className="d-flex flex-column gap-2">
          {summaryItems.map((item, idx) => (
            <div
              key={idx}
              className="d-flex justify-content-between align-items-center pb-2 border-bottom"
              style={{ fontSize: "13px" }}
            >
              <span className="text-muted d-flex align-items-center gap-2">
                <span className="bg-success rounded-circle" style={{ width: "6px", height: "6px" }}></span>
                {item.label}
              </span>
              <span className="fw-bold text-dark">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. My Group */}
      <div className="bg-white p-3 rounded-3 shadow-sm border">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark m-0">My Group</h6>
        </div>
        <div className="d-flex flex-column gap-3">
          {groups.map((group) => (
            <div key={group.id} className="d-flex align-items-center gap-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: "42px", height: "42px", backgroundColor: group.bg, flexShrink: 0 }}
              >
                <i className="fa-solid fa-user-group fs-6"></i>
              </div>
              <div className="overflow-hidden">
                <div className="fw-bold text-dark text-truncate" style={{ fontSize: "13px" }}>
                  {group.name}
                </div>
                <div className="text-muted" style={{ fontSize: "11px" }}>
                  {group.visibility} • {group.members}
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn-link text-primary p-0 mt-3 text-decoration-none fw-semibold border-0 bg-transparent" style={{ fontSize: "12px" }}>
          View all
        </button>
      </div>
    </div>
  );
}