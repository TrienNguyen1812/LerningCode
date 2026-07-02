const express = require("express");
const router = express();
const db = require("../config/db");
// const verify= ...
router.post("/api/register", verify, async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const pool = await db.pool(); // Lấy kết nối đã có sẵn

    // Kiểm tra trùng Email
    const checkUser = await pool
      .request()
      .input("Email", sql.VarChar, email)
      .query(`SELECT IdUser FROM USERS WHERE Email = @Email`);

    if (checkUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email này đã được đăng ký!" });
    }

    // Thêm vào DB
    await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.VarChar, email)
      .input("Password", sql.VarChar, password).query(`
        INSERT INTO USERS (FullName, Email, Role, CreateDate, UpdateDate, Password)
        VALUES (@FullName, @Email, N'sinh viên', GETDATE(), GETDATE(), @Password)
      `);

    res.status(200).json({
      success: true,
      message: "Đăng ký thành công! Bạn có thể đăng nhập ngay.",
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(401).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});
module.exports = router;
