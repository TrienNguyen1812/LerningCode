const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Khởi tạo ứng dụng Express
const app = express();

// Cấu hình Middleware hệ thống
app.use(express.json());
app.use(cors());

// Nhập (Import) các module định tuyến API
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");
const studentRoutes = require("./src/routes/student");
const problemRoutes = require("./src/routes/judge"); // Tuyến đường compiler chuyên biệt

// Đăng ký sử dụng các Routes với tiền tố prefix chuẩn RESTful
app.use("/api/auth", authRoutes);       // Ví dụ: /api/auth/login
app.use("/api/admin", adminRoutes);     // Ví dụ: /api/admin/dashboard
app.use("/api/students", studentRoutes); // Ví dụ: /api/students/:id/dashboard, /api/students/courses/:idCourse/details
app.use("/api/judges", problemRoutes);   // Ví dụ: /api/judges/execute

// Khởi chạy máy chủ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Hệ thống DevLearner Backend đang chạy tại http://localhost:${PORT}`);
});