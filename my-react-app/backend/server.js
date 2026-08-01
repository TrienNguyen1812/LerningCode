const express = require("express");
const cors = require("cors");
const sql = require("mssql");
const path = require("path");
require("dotenv").config();

// Khởi tạo ứng dụng Express
const app = express();

// Cấu hình Middleware hệ thống
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Nhập (Import) các module định tuyến API
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/admin");
const studentRoutes = require("./src/routes/student");
const problemRoutes = require("./src/routes/judge.route"); // Tuyến đường compiler chuyên biệt
const submissionRoutes = require("./src/routes/submission.route");
const courseRoute = require("./src/routes/course.route");
const fileRoute = require("./src/routes/file.route");
const lessonRoute = require("./src/routes/lesson.route");
const systemFileRoute = require("./src/routes/systemFile.route");
const problemRoute = require('./src/routes/problem.route');
const studentStatsRoutes = require("./src/routes/studentStats.route");
const statisticsRoutes = require("./src/routes/statistics.route");

// Đăng ký sử dụng các Routes với tiền tố prefix chuẩn RESTful
app.use("/api/auth", authRoutes);       // Ví dụ: /api/auth/login
app.use("/api/admin", adminRoutes);     // Ví dụ: /api/admin/dashboard
app.use("/api/students", studentRoutes); // Ví dụ: /api/students/:id/dashboard, /api/students/courses/:idCourse/details
app.use("/api/judges", problemRoutes);   // Ví dụ: /api/judges/execute
app.use('/api/submissions', submissionRoutes);
app.use("/api/courses", courseRoute);
app.use("/api/files", fileRoute);
app.use("/api", lessonRoute);
app.use("/api/system-files", systemFileRoute);
app.use('/api/problems', problemRoute);
app.use("/api/stats", studentStatsRoutes);
app.use("/api/statistics", statisticsRoutes);

// Khởi chạy máy chủ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Hệ thống DevLearner Backend đang chạy tại http://localhost:${PORT}`);
});