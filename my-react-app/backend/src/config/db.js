const sql = require("mssql/msnodesqlv8");
require("dotenv").config();

const dbConfig = {
  connectionString:
    "Driver={ODBC Driver 18 for SQL Server};Server=DESKTOP-PFUNCTL\\SQLEXPRESS;Database=DevLearnerDB;Trusted_Connection=yes;TrustServerCertificate=yes;",
  options: {
    trustServerCertificate: true,
  },
};

const poolPromise = sql
  .connect(dbConfig)
  .then((pool) => {
    console.log("👉 Đã kết nối thành công tới SQL Server: DevLearnerDB");
    return pool;
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối CSDL:", err);
  });

module.exports = {
  sql,
  poolPromise,
};