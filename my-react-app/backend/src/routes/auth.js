const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// API ĐĂNG KÝ
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    const pool = await poolPromise;
    const checkUser = await pool
      .request()
      .input("Email", sql.VarChar, email)
      .query(`SELECT IdUser FROM USERS WHERE Email = @Email`);

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ success: false, message: "Email này đã được đăng ký!" });
    }

    await pool
      .request()
      .input("FullName", sql.NVarChar, fullName)
      .input("Email", sql.VarChar, email)
      .input("Password", sql.VarChar, password).query(`
        INSERT INTO USERS (FullName, Email, Role, CreateDate, UpdateDate, Password)
        VALUES (@FullName, @Email, N'sinh viên', GETDATE(), GETDATE(), @Password)
      `);

    res.status(201).json({ success: true, message: "Đăng ký thành công! Bạn có thể đăng nhập ngay." });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

// API ĐĂNG NHẬP
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Email", sql.VarChar, email)
      .input("Password", sql.VarChar, password)
      .query(`SELECT IdUser, FullName, Email, Role FROM USERS WHERE Email = @Email AND Password = @Password`);

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      res.status(200).json({
        success: true,
        user: { id: user.IdUser, fullName: user.FullName, email: user.Email, role: user.Role },
      });
    } else {
      res.status(401).json({ success: false, message: "Email hoặc mật khẩu không chính xác!" });
    }
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

module.exports = router;