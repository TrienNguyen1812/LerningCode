export default function Calendar() {
  const daysOfWeek = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="card bg-white border-0 shadow-sm rounded-4 p-4 h-100">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0 small text-uppercase text-muted tracking-wider">
          Lịch học & Phản hồi
        </h5>
        <span className="badge bg-light text-dark px-3 py-2 rounded-2 fw-semibold">
          Tháng 6, 2026
        </span>
      </div>

      <div className="bg-light p-3 rounded-3 flex-grow-1 d-flex flex-column justify-content-between">
        <div className="row text-center fw-bold text-muted small mb-2 g-1">
          {daysOfWeek.map((day) => (
            <div key={day} className="col">{day}</div>
          ))}
        </div>

        <div className="row row-cols-7 g-1 text-center font-monospace">
          {Array.from({ length: 35 }).map((_, index) => {
            const dayNumber = index - 2;
            const isValidDay = dayNumber > 0 && dayNumber <= 30;
            const isDeadline = dayNumber === 12 || dayNumber === 25;
            const isToday = dayNumber === 5;

            return (
              <div key={index} className="col p-1">
                <div
                  className={`py-2 rounded-3 d-flex flex-column align-items-center justify-content-center position-relative ${
                    isDeadline
                      ? "bg-danger bg-opacity-10 text-danger fw-bold border border-danger border-opacity-20"
                      : isToday
                        ? "bg-primary text-white fw-bold shadow-sm"
                        : isValidDay
                          ? "bg-white hover-bg-light border"
                          : "text-transparent"
                  }`}
                  style={{
                    minHeight: "42px",
                    fontSize: "13px",
                    cursor: isValidDay ? "pointer" : "default",
                  }}
                >
                  {isValidDay ? dayNumber : ""}
                  {isDeadline && (
                    <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}