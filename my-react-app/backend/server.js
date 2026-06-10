const express = require("express");
const sql = require("mssql/msnodesqlv8"); // Dùng driver cho Windows Auth
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // Cho phép ReactJS kết nối sau này

// Cấu hình kết nối SQL Server bằng Windows Authentication
const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-PFUNCTL\\SQLEXPRESS;Database=DevLearnerDB;Trusted_Connection=yes;TrustServerCertificate=yes;",
  options: {
    trustServerCertificate: true,
  },
};

// API Test: Thử nghiệm kết nối và lấy dữ liệu
app.get("/api/test-db", async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    // Thay 'TenBangCuaBan' bằng một bảng bất kỳ đã có dữ liệu trong DB của bạn
    let result = await pool.request().query("SELECT TOP 5 * FROM Users");

    res.json({
      success: true,
      message: "Kết nối SQL Server thành công bằng Windows Auth!",
      data: result.recordset,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Lỗi kết nối ",
      error: err.message,
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server Node.js đang chạy tại: http://localhost:${PORT}`);
});
