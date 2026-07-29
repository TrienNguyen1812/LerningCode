import React from "react";

export default function WelcomeBanner({ name = "John" }) {
  return (
    <div
      className="p-4 p-md-5 rounded-4 mb-4 position-relative overflow-hidden d-flex justify-content-between align-items-center"
      style={{
        backgroundColor: "#e8f7f5", // Màu nền xanh mint nhạt chuẩn Figma
        border: "none",
      }}
    >
      {/* Khối Văn Bản */}
      <div className="z-1" style={{ maxWidth: "60%" }}>
        <h3 className="fw-bold text-dark mb-2" style={{ fontSize: "28px" }}>
          Good Morning, {name}! 
        </h3>
        <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.5" }}>
          Here's update for your training information, your assignment and
          progress are all in one place.
        </p>
      </div>

      {/* Minh họa nhân vật / Icon trang trí bên phải */}
      <div className="d-none d-md-flex align-items-center justify-content-center me-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
          style={{
            width: "90px",
            height: "90px",
            backgroundColor: "#00bba7",
            color: "#ffffff",
          }}
        >
          <i className="fa-solid fa-laptop-code display-5"></i>
        </div>
      </div>
    </div>
  );
}