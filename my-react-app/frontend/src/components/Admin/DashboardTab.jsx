import React, { useState } from "react";

export default function DashboardTab({ dashboardData }) {
  // State quản lý Hover Cột để hiển thị Tooltip động
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);
  const [filterResource, setFilterResource] = useState("Courses");
  const [filterTime, setFilterTime] = useState("Daily");

  if (!dashboardData) {
    return (
      <div className="p-5 text-center text-muted">
        <div className="spinner-border text-primary me-2" role="status"></div>
        Đang tải dữ liệu biểu đồ tổng quan...
      </div>
    );
  }

  // Safe fallback arrays & data
  const metricsList = dashboardData?.metrics || [];
  const chartList = dashboardData?.enrollmentChart || [];
  const recentActivities = dashboardData?.recentActivity || [];

  // TÍNH TOÁN DỮ LIỆU "TOTAL CONTENTS" DYNAMIC
  const contentBreakdown = dashboardData?.contentBreakdown || {
    courses: dashboardData?.totalCourses || 0,
    quizzes: dashboardData?.totalQuizzes || 0,
    problems: dashboardData?.totalProblems || 0,
  };

  const totalContents =
    dashboardData?.totalContents ??
    Object.values(contentBreakdown).reduce(
      (acc, curr) => acc + (Number(curr) || 0),
      0,
    );

  // Tính phần trăm fill cho SVG Donut Circle
  const mainProgressPercent =
    totalContents > 0
      ? Math.min(
          Math.round(((contentBreakdown.courses || 0) / totalContents) * 100),
          100,
        )
      : 0;

  // Safe colors mapping
  const colors = ["#e0f2fe", "#fef3c7", "#dcfce7", "#f3e8ff"];
  const iconColors = ["#0284c7", "#b45309", "#15803d", "#6b21a8"];
  const icons = ["fa-users", "fa-clock", "fa-compass", "fa-chart-pie"];

  return (
    <div className="p-4" style={{ backgroundColor: "#f8fafc" }}>
      {/* ROW 1: METRICS + TOTAL CONTENTS + RECENT ACTIVITY */}
      <div className="row g-4 mb-4">
        {/* Left Side: Dynamic Metrics Cards List */}
        <div className="col-12 col-xl-4 d-flex flex-column gap-3">
          {metricsList.length > 0 ? (
            metricsList.map((m, i) => (
              <div
                key={i}
                className="card border-0 shadow-sm rounded-4 p-3 bg-white d-flex flex-row align-items-center gap-3"
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: colors[i % colors.length],
                  }}
                >
                  <i
                    className={`fa-solid ${icons[i % icons.length]}`}
                    style={{ color: iconColors[i % iconColors.length] }}
                  ></i>
                </div>
                <div>
                  <small
                    className="text-muted fw-medium d-block mb-0.5"
                    style={{ fontSize: "12px" }}
                  >
                    {m.title}
                  </small>
                  <h5
                    className="fw-bold text-dark m-0"
                    style={{ letterSpacing: "-0.5px" }}
                  >
                    {m.value}
                  </h5>
                </div>
                <span
                  className={`badge rounded-pill px-2 py-1 small ms-auto ${
                    m.isUp
                      ? "bg-success bg-opacity-10 text-success"
                      : "bg-danger bg-opacity-10 text-danger"
                  }`}
                  style={{ fontSize: "11px" }}
                >
                  <i
                    className={`fa-solid ${
                      m.isUp ? "fa-arrow-trend-up" : "fa-arrow-trend-down"
                    } me-1`}
                  ></i>
                  {m.trend}
                </span>
              </div>
            ))
          ) : (
            <div className="text-muted p-3 text-center bg-white rounded-4 border-0 shadow-sm">
              Không có chỉ số đo lường.
            </div>
          )}
        </div>

        {/* Center Card: Total Contents Donut Progress Indicator */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center d-flex flex-column justify-content-between">
            <h6
              className="fw-bold text-start text-dark mb-3"
              style={{ fontSize: "14px" }}
            >
              Total Contents
            </h6>

            {/* SVG Donut Chart */}
            <div
              className="position-relative d-inline-flex align-items-center justify-content-center mx-auto my-3"
              style={{ width: "140px", height: "140px" }}
            >
              <svg
                width="140"
                height="140"
                viewBox="0 0 36 36"
                className="w-100 h-100"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="3"
                ></circle>
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#0fbca9"
                  strokeWidth="3"
                  strokeDasharray={`${mainProgressPercent} ${100 - mainProgressPercent}`}
                  strokeDashoffset="25"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
                ></circle>
              </svg>
              <div className="position-absolute text-center">
                <h2
                  className="fw-bold m-0 text-dark"
                  style={{ letterSpacing: "-1px" }}
                >
                  {totalContents.toLocaleString()}
                </h2>
                <small
                  className="text-muted fw-semibold"
                  style={{ fontSize: "11px" }}
                >
                  Contents
                </small>
              </div>
            </div>

            {/* Content Legend Breakdown */}
            <div className="row text-start mt-2 g-2">
              <div className="col-6 d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-block flex-shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#0fbca9",
                  }}
                ></span>
                <span className="text-muted small">
                  {contentBreakdown.courses || 0} Courses
                </span>
              </div>
              <div className="col-6 d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-block flex-shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#047857",
                  }}
                ></span>
                <span className="text-muted small">
                  {contentBreakdown.quizzes || 0} Quizzes
                </span>
              </div>
              <div className="col-6 d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-block flex-shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#34d399",
                  }}
                ></span>
                <span className="text-muted small">
                  {contentBreakdown.problems || 0} Problems
                </span>
              </div>
              <div className="col-6 d-flex align-items-center gap-2">
                <span
                  className="rounded-circle d-block flex-shrink-0"
                  style={{
                    width: "8px",
                    height: "8px",
                    backgroundColor: "#a7f3d0",
                  }}
                ></span>
                <span className="text-muted small">Others</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Recent Learner Activity Feed */}
        <div className="col-12 col-md-6 col-xl-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
              Recent Learner Activity
            </h6>
            <div className="d-flex flex-column gap-3 overflow-hidden">
              {recentActivities.length > 0 ? (
                recentActivities.map((act, i) => (
                  <div key={i} className="d-flex gap-3 position-relative">
                    <div
                      className="p-2 rounded-3 bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "34px",
                        height: "34px",
                        color: act.type === "course" ? "#b45309" : "#0fbca9",
                      }}
                    >
                      <i
                        className={`fa-solid ${
                          act.type === "course" ? "fa-book" : "fa-circle-check"
                        } fs-6`}
                      ></i>
                    </div>
                    <div>
                      <p
                        className="m-0 text-dark small fw-medium"
                        style={{ fontSize: "13px" }}
                      >
                        <strong className="fw-bold me-1">
                          {act.studentName || act.user || "User"}
                        </strong>
                        {act.actionText ||
                          act.action ||
                          "vừa thực hiện thao tác"}
                      </p>
                      <small
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        <i className="fa-regular fa-calendar me-1"></i>
                        {act.timestamp || act.time || "Gần đây"}
                      </small>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted p-3 text-center">
                  Chưa có hoạt động gần đây.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: LEARNER INSIGHT CHART (DUAL-BAR CHART WITH DYNAMIC TOOLTIP) */}
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
          <div className="d-flex align-items-center gap-4">
            <h5 className="fw-bold text-dark m-0" style={{ fontSize: "16px" }}>
              Learner Insight
            </h5>
            <span className="small text-muted fw-semibold">
              <span
                className="d-inline-block rounded-circle me-1"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#0fbca9",
                }}
              ></span>
              {dashboardData?.activeLearnersCount || 0} Active Learner
            </span>
            <span className="small text-muted fw-semibold">
              <span
                className="d-inline-block rounded-circle me-1"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#ffb93d",
                }}
              ></span>
              {dashboardData?.completionRate || "0%"} Completion Rate
            </span>
          </div>

          <div className="d-flex gap-2">
            <select
              value={filterResource}
              onChange={(e) => setFilterResource(e.target.value)}
              className="form-select form-select-sm border-light rounded-3 bg-light text-muted fw-medium px-3"
            >
              <option value="Courses">Courses</option>
              <option value="Problems">Problems</option>
              <option value="Quizzes">Quizzes</option>
            </select>
            <select
              value={filterTime}
              onChange={(e) => setFilterTime(e.target.value)}
              className="form-select form-select-sm border-light rounded-3 bg-light text-muted fw-medium px-3"
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>
        </div>

        {/* Dual Bar Chart Container */}
        <div
          className="d-flex align-items-end justify-content-center gap-4 flex-grow-1 pt-4 px-2"
          style={{ height: "220px", position: "relative" }}
        >
          {/* Custom Dynamic Hover Tooltip */}
          {hoveredBarIndex !== null && chartList[hoveredBarIndex] && (
            <div
              className="bg-white shadow-lg rounded-3 p-2 border border-light position-absolute"
              style={{
                bottom: "170px",
                left:
                  chartList.length === 1
                    ? "50%"
                    : `${Math.max(4, Math.min(82, (hoveredBarIndex / chartList.length) * 100))}%`,
                transform: chartList.length === 1 ? "translateX(-50%)" : "none",
                zIndex: 20,
                width: "160px",
                pointerEvents: "none",
              }}
            >
              <small
                className="text-muted d-block fw-semibold mb-1"
                style={{ fontSize: "10px" }}
              >
                {chartList[hoveredBarIndex].month}
              </small>
              <span
                className="fw-bold text-dark d-block"
                style={{ fontSize: "12px" }}
              >
                <span style={{ color: "#0fbca9" }}>•</span>{" "}
                {chartList[hoveredBarIndex].active ??
                  chartList[hoveredBarIndex].count ??
                  0}{" "}
                Active Learner
              </span>
              <span
                className="fw-bold text-dark d-block"
                style={{ fontSize: "12px" }}
              >
                <span style={{ color: "#ffb93d" }}>•</span>{" "}
                {chartList[hoveredBarIndex].completion ??
                  chartList[hoveredBarIndex].percent ??
                  0}
                % Completion Rate
              </span>
            </div>
          )}

          {chartList.length > 0 ? (
            (() => {
              // 1. Tìm giá trị lớn nhất trong mảng để tính tỷ lệ tương đối linh hoạt
              const maxActive = Math.max(
                ...chartList.map((c) => Number(c.active || c.count || 0)),
                1,
              );
              const maxCompletion = Math.max(
                ...chartList.map((c) => Number(c.completion || c.percent || 0)),
                1,
              );

              const maxChartHeight = 130; // Chiều cao tối đa của cột (px)

              return chartList.map((col, i) => {
                const activeVal = Number(col.active ?? col.count ?? 0);
                const completionVal = Number(
                  col.completion ?? col.percent ?? 0,
                );

                // 2. Tính chiều cao theo % so với max value
                const activeCalcHeight =
                  (activeVal / maxActive) * maxChartHeight;
                const completionCalcHeight =
                  (completionVal / maxCompletion) * maxChartHeight;

                // 3. Cài đặt chiều cao tối thiểu nếu val > 0 (ít nhất 30px để cột vừa vặn, không bị lùn)
                const activeHeight =
                  activeVal > 0 ? Math.max(activeCalcHeight, 35) : 4;
                const completionHeight =
                  completionVal > 0 ? Math.max(completionCalcHeight, 35) : 4;

                const isHovered = hoveredBarIndex === i;

                return (
                  <div
                    key={i}
                    className="d-flex flex-column align-items-center"
                    style={{
                      // Nếu chỉ có vài cột dữ liệu thì không nên kéo quá giãn
                      width:
                        chartList.length <= 3
                          ? "120px"
                          : `${100 / chartList.length}%`,
                      cursor: "pointer",
                    }}
                    onMouseEnter={() => setHoveredBarIndex(i)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Cặp Cột Đôi */}
                    <div
                      className="d-flex align-items-end gap-2"
                      style={{ height: "140px" }}
                    >
                      {/* Cột 1: Active Learners */}
                      <div
                        className="rounded-top transition-all"
                        style={{
                          width: "12px", // Tăng độ dày cột lên 12px cho dễ nhìn hơn
                          height: `${activeHeight}px`,
                          backgroundColor: "#0fbca9",
                          opacity:
                            isHovered || hoveredBarIndex === null ? 1 : 0.4,
                          transition: "height 0.3s ease",
                        }}
                      ></div>

                      {/* Cột 2: Completion Rate */}
                      <div
                        className="rounded-top transition-all"
                        style={{
                          width: "12px", // Tăng độ dày cột lên 12px
                          height: `${completionHeight}px`,
                          backgroundColor: "#ffb93d",
                          opacity:
                            isHovered || hoveredBarIndex === null ? 1 : 0.4,
                          transition: "height 0.3s ease",
                        }}
                      ></div>
                    </div>

                    {/* Nhãn tháng/ngày bên dưới */}
                    <span
                      className={`mt-2 fw-semibold ${isHovered ? "text-dark" : "text-muted"}`}
                      style={{ fontSize: "12px" }}
                    >
                      {col.month}
                    </span>
                  </div>
                );
              });
            })()
          ) : (
            <p className="text-muted m-auto">Chưa có dữ liệu biểu đồ.</p>
          )}
        </div>
      </div>
    </div>
  );
}
