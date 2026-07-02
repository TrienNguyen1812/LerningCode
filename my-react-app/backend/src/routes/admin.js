const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// DASHBOARD QUẢN TRỊ VIÊN
router.get("/dashboard", async (req, res) => {
  try {
    const pool = await poolPromise;
    const studentCount = await pool.request().query(`SELECT COUNT(*) as Total FROM USERS WHERE Role = N'sinh viên'`);
    const courseCount = await pool.request().query(`SELECT COUNT(*) as Total FROM COURSE`);
    const topCourses = await pool.request().query(`
      SELECT TOP 4 c.CourseName, COUNT(e.IdUser) as EnrolledCount
      FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.CourseName ORDER BY EnrolledCount DESC
    `);

    res.status(200).json({
      success: true,
      data: {
        metrics: [
          { title: "Total Students", value: studentCount.recordset[0].Total.toLocaleString(), trend: "+12%", isUp: true },
          { title: "Active Courses", value: courseCount.recordset[0].Total.toString(), trend: "+5%", isUp: true },
          { title: "Total Revenue", value: "$45,200", trend: "+10%", isUp: true },
          { title: "Completion Rate", value: "78%", trend: "-2%", isUp: false },
        ],
        enrollmentChart: [
          { month: "Jan", percent: 35 }, { month: "Feb", percent: 45 }, { month: "Mar", percent: 65 },
          { month: "Apr", percent: 55 }, { month: "May", percent: 85 }, { month: "Jun", percent: 100 },
        ],
        topCourses: topCourses.recordset.length > 0
          ? topCourses.recordset.map((c) => ({ name: c.CourseName, students: c.EnrolledCount, percent: 80 }))
          : [{ name: "Chưa có dữ liệu", students: 0, percent: 0 }],
        recentActivities: [],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// LẤY DANH SÁCH KHÓA HỌC KHỎI DATABASE
router.get("/courses", async (req, res) => {
  try {
    const pool = await poolPromise;
    const coursesResult = await pool.request().query(`
      SELECT c.IdCourse, c.CourseName, CONVERT(varchar, c.CreateDate, 103) AS CreateDateStr, COUNT(e.IdUser) as EnrolledCount
      FROM COURSE c LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.IdCourse, c.CourseName, c.CreateDate ORDER BY c.CreateDate DESC
    `);

    const coursesData = coursesResult.recordset.map((course) => ({
      id: course.IdCourse.toString(),
      name: course.CourseName,
      updatedAt: course.CreateDateStr,
      instructor: "Giảng viên",
      category: "Technology",
      enrolled: course.EnrolledCount.toLocaleString(),
      status: "Published",
    }));

    res.status(200).json({ success: true, data: coursesData });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// THÊM KHÓA HỌC MỚI
router.post("/courses", async (req, res) => {
  const { courseName } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request().input("CourseName", sql.NVarChar, courseName)
      .query(`INSERT INTO COURSE (CourseName, CreateDate) VALUES (@CourseName, GETDATE())`);
    res.status(201).json({ success: true, message: "Thêm khóa học thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// CHỈNH SỬA KHÓA HỌC
router.put("/courses/:id", async (req, res) => {
  const { id } = req.params;
  const { courseName } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request().input("IdCourse", sql.Int, id).input("CourseName", sql.NVarChar, courseName)
      .query(`UPDATE COURSE SET CourseName = @CourseName WHERE IdCourse = @IdCourse`);
    res.status(200).json({ success: true, message: "Cập nhật tên khóa học thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
});

// XÓA KHÓA HỌC KHỎI DATABASE
router.delete("/courses/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input("IdCourse", sql.Int, id).query(`DELETE FROM Enroll WHERE IdCourse = @IdCourse`);
    await pool.request().input("IdCourse", sql.Int, id).query(`DELETE FROM COURSE WHERE IdCourse = @IdCourse`);
    res.status(200).json({ success: true, message: "Xóa thành công!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// QUẢN LÝ GIẢNG VIÊN
router.get("/instructors", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`SELECT IdUser, FullName, Email FROM USERS WHERE Role = N'giảng viên'`);
    const instructors = result.recordset.map((inst, index) => ({
      id: inst.IdUser, name: inst.FullName, email: inst.Email,
      expertise: index % 2 === 0 ? "Data Science" : "Web Development",
      totalCourses: Math.floor(Math.random() * 8) + 1,
      totalStudents: Math.floor(Math.random() * 3000) + 100,
      rating: (4.2 + Math.random() * 0.8).toFixed(1),
      status: "ACTIVE",
    }));
    res.status(200).json({ success: true, data: instructors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

// QUẢN LÝ HỌC VIÊN
router.get("/students", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.IdUser, u.FullName, u.Email, CONVERT(varchar, u.CreateDate, 107) as JoinedDate, COUNT(e.IdCourse) as CoursesEnrolled
      FROM USERS u LEFT JOIN Enroll e ON u.IdUser = e.IdUser WHERE u.Role = N'sinh viên'
      GROUP BY u.IdUser, u.FullName, u.Email, u.CreateDate ORDER BY u.CreateDate DESC
    `);
    const students = result.recordset.map((st) => ({
      id: st.IdUser, name: st.FullName, email: st.Email, joinedDate: st.JoinedDate,
      coursesEnrolled: st.CoursesEnrolled, progress: Math.floor(Math.random() * 100), status: "Active",
    }));
    res.status(200).json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

module.exports = router;