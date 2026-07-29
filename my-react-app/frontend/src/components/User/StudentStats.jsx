export default function StudentStats() {
  const stats = [
    {
      id: 1,
      title: "TOTAL LEARNING ITEMS",
      value: "13",
      bgColor: "#00bba7", // Teal Green
      icon: "fa-book-open",
    },
    {
      id: 2,
      title: "LEARNING THIS WEEK",
      value: "3 Hour",
      bgColor: "#ffaa00", // Amber Orange
      icon: "fa-clock",
    },
    {
      id: 3,
      title: "AVERAGE RESULT",
      value: "8",
      bgColor: "#3b82f6", // Bright Blue
      icon: "fa-graduation-cap",
    },
    {
      id: 4,
      title: "ITEMS COMPLETED",
      value: "6",
      bgColor: "#6366f1", // Purple Blue
      icon: "fa-circle-check",
    },
  ];

  return (
    <div className="mb-4">
      <h6 className="fw-bold text-dark mb-3">Your Statistic</h6>
      <div className="row g-3">
        {stats.map((stat) => (
          <div key={stat.id} className="col-12 col-sm-6 col-lg-3">
            <div
              className="p-3 text-white rounded-3 shadow-sm d-flex justify-content-between align-items-center"
              style={{ backgroundColor: stat.bgColor, minHeight: "90px" }}
            >
              <div>
                <h3 className="fw-bold mb-1 fs-3">{stat.value}</h3>
                <span
                  className="fw-bold text-uppercase opacity-75"
                  style={{ fontSize: "11px", letterSpacing: "0.5px" }}
                >
                  {stat.title}
                </span>
              </div>
              <div className="fs-2 opacity-50">
                <i className={`fa-solid ${stat.icon}`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}