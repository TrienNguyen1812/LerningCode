const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("../config/db");

// ==========================================
// 1. DASHBOARD SINH VIÊN
// ==========================================
router.get("/:id/dashboard", async (req, res) => {
  const studentId = req.params.id;
  try {
    const pool = await poolPromise;
    const coursesResult = await pool.request().input("StudentId", sql.Int, studentId).query(`
        SELECT c.IdCourse, c.CourseName FROM COURSE c
        INNER JOIN Enroll e ON c.IdCourse = e.IdCourse WHERE e.IdUser = @StudentId
      `);

    const enrolledCourses = coursesResult.recordset.map((course) => ({
      id: course.IdCourse,
      title: course.CourseName,
      progress: Math.floor(Math.random() * 60) + 15,
      image: null,
    }));

    const deadlines = enrolledCourses.map((course, index) => ({
      id: index + 1,
      title: `Bài tập thực hành tuần ${index + 2}: Đánh giá năng lực`,
      course: course.title,
      dueDate: index % 2 === 0 ? "Thứ 4, 15/07" : "Chủ nhật, 19/07",
      status: index % 2 === 0 ? "pending" : "completed",
    }));

    res.status(200).json({ success: true, enrolledCourses, deadlines });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
});

// ==========================================
// 2. CHI TIẾT BÀI HỌC VÀ BÀI TẬP (JOIN 3 BẢNG)
// ==========================================
router.get("/courses/:idCourse/details", async (req, res) => {
  const { idCourse } = req.params;
  try {
    const pool = await poolPromise;
    const query = `
      SELECT l.IdLesson, l.Title AS LessonTitle, l.Order_index, p.IdProblem, p.Title AS ProblemTitle,
             p.Difficulty, p.Memory_limit, p.Time_limit, p.Sample_code, 
             p.Description
      FROM LESSON l
      LEFT JOIN Lesson_Problem lp ON l.IdLesson = lp.IdLesson
      LEFT JOIN PROBLEM p ON lp.IdProblem = p.IdProblem
      WHERE l.IdCourse = @idCourse ORDER BY l.Order_index ASC, p.IdProblem ASC
    `;

    const request = pool.request();
    request.input("idCourse", sql.Int, idCourse);
    const result = await request.query(query);

    const chaptersMap = {};
    result.recordset.forEach((row) => {
      if (!chaptersMap[row.IdLesson]) {
        let cleanTitle = row.LessonTitle ? row.LessonTitle.trim() : "";
        if (cleanTitle.toLowerCase().includes("bài")) {
          const parts = cleanTitle.split(/(?=[bB]ài)/); 
          const uniqueParts = [];
          parts.forEach((part) => {
            const trimmedPart = part.trim();
            if (!uniqueParts.some(p => p.trim() === trimmedPart)) {
              uniqueParts.push(part);
            }
          });
          cleanTitle = uniqueParts.join(" ").trim();
          cleanTitle = cleanTitle.replace(/:\s*:/g, ":"); 
        }

        chaptersMap[row.IdLesson] = {
          id: row.IdLesson,
          title: cleanTitle, 
          lessons: []
        };
      }
      
      if (row.IdProblem) {
        chaptersMap[row.IdLesson].lessons.push({
          id: row.IdProblem,
          title: row.ProblemTitle,
          type: `Coding [${row.Difficulty}]`,
          duration: `${row.Time_limit}ms / ${row.Memory_limit}MB`,
          status: "learning",
          sampleCode: row.Sample_code,
          description: row.Description
        });
      }
    });

    res.json({ success: true, chapters: Object.values(chaptersMap) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi máy chủ cấu trúc môn học.", error: error.message });
  }
});

// ==========================================
// 3. LẤY CHI TIẾT NỘI DUNG MỘT BÀI TẬP (Mô tả, ví dụ, ràng buộc)
// ==========================================
router.get("/problems/:idProblem", async (req, res) => {
  const { idProblem } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("idProblem", sql.Int, idProblem)
      .query(`
        SELECT Title, Description, Examples, Constraints 
        FROM PROBLEM WHERE IdProblem = @idProblem
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy bài tập." });
    }

    res.json({ success: true, problem: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi lấy dữ liệu bài tập." });
  }
});

module.exports = router;