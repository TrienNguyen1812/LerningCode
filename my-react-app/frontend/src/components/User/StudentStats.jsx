import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentStats({ currentUser, refreshKey }) {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Tìm userId từ tất cả các nguồn có thể
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    const userId =
      currentUser?.id ||
      currentUser?.IdUser ||
      parsedUser?.id ||
      parsedUser?.IdUser;

    console.log(">>> Checking UserId for Stats:", userId); // Debug ID

    if (userId) {
      setLoading(true);
      axios
        .get(`http://localhost:5000/api/stats/student/${userId}`)
        .then((response) => {
          console.log(">>> Data Stats Response:", response.data); // Debug Data
          if (response.data.success) {
            setStatsData(response.data.data);
          }
        })
        .catch((error) => {
          console.error("Lỗi khi tải thống kê sinh viên:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [currentUser, refreshKey]);

  return (
    <div className="mb-4">
      <h6 className="fw-bold text-dark mb-3">Your Statistic</h6>
      <div className="row g-3">
        {/* TOTAL ITEMS */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 text-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: "#00bba7" }}>
            <div>
              <h3 className="fw-bold mb-1 fs-3">{loading ? "..." : statsData?.totalItems ?? 0}</h3>
              <span className="fw-bold text-uppercase opacity-75" style={{ fontSize: "11px" }}>TOTAL LEARNING ITEMS</span>
            </div>
            <div className="fs-2 opacity-50"><i className="fa-solid fa-book-open"></i></div>
          </div>
        </div>

        {/* SCORE IMPROVEMENT */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 text-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: "#ffaa00" }}>
            <div>
              <h3 className="fw-bold mb-1 fs-3">
                {loading ? "..." : `+${statsData?.avgImprovement ?? "0.0"}`}
              </h3>
              <span className="fw-bold text-uppercase opacity-75" style={{ fontSize: "11px" }}>SCORE IMPROVEMENT</span>
            </div>
            <div className="fs-2 opacity-50"><i className="fa-solid fa-chart-line"></i></div>
          </div>
        </div>

        {/* AVERAGE RESULT */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 text-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: "#3b82f6" }}>
            <div>
              <h3 className="fw-bold mb-1 fs-3">
                {loading ? "..." : statsData?.avgScore ?? "0.0"}
              </h3>
              <span className="fw-bold text-uppercase opacity-75" style={{ fontSize: "11px" }}>AVERAGE RESULT</span>
            </div>
            <div className="fs-2 opacity-50"><i className="fa-solid fa-graduation-cap"></i></div>
          </div>
        </div>

        {/* ITEMS COMPLETED */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="p-3 text-white rounded-3 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: "#6366f1" }}>
            <div>
              <h3 className="fw-bold mb-1 fs-3">{loading ? "..." : statsData?.completedItems ?? 0}</h3>
              <span className="fw-bold text-uppercase opacity-75" style={{ fontSize: "11px" }}>ITEMS COMPLETED</span>
            </div>
            <div className="fs-2 opacity-50"><i className="fa-solid fa-circle-check"></i></div>
          </div>
        </div>
      </div>
    </div>
  );
}