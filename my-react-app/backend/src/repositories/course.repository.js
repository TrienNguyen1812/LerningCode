const { sql, poolPromise } = require("../config/db"); // File cấu hình kết nối DB msnodesqlv8

class CourseRepository {
  /**
   * Truy vấn danh sách khóa học kèm số lượng học viên enroll thực tế
   */
  async getAllCourses() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT c.IdCourse, c.CourseName, c.Description, c.Thumbnail, 
             CONVERT(varchar, c.CreateDate, 103) AS CreateDateStr, 
             COUNT(e.IdUser) as EnrolledCount
      FROM COURSE c 
      LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
      GROUP BY c.IdCourse, c.CourseName, c.Description, c.Thumbnail, c.CreateDate 
      ORDER BY c.CreateDate DESC
    `);
    return result.recordset;
  }

  /**
   * Thêm khóa học mới vào DB và trả về dữ liệu vừa chèn
   */
  async createCourse(courseName, description, thumbnail) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("CourseName", sql.NVarChar, courseName)
      .input("Description", sql.NVarChar, description || "") // Đảm bảo không bị NULL
      .input("Thumbnail", sql.VarChar, thumbnail || null)
      .query(`
        INSERT INTO COURSE (CourseName, Description, Thumbnail, CreateDate) 
        OUTPUT INSERTED.*
        VALUES (@CourseName, @Description, @Thumbnail, GETDATE())
      `);

    return result.recordset[0]; // Trả về khóa học vừa tạo để Controller phản hồi JSON
  }

  async getCourseById(id) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("IdCourse", sql.Int, parseInt(id, 10))
      .query(`
        SELECT c.IdCourse, c.CourseName, c.Description, c.Thumbnail, 
               CONVERT(varchar, c.CreateDate, 103) AS CreateDateStr, 
               COUNT(e.IdUser) as EnrolledCount
        FROM COURSE c 
        LEFT JOIN Enroll e ON c.IdCourse = e.IdCourse
        WHERE c.IdCourse = @IdCourse
        GROUP BY c.IdCourse, c.CourseName, c.Description, c.Thumbnail, c.CreateDate
      `);

    return result.recordset[0] || null;
  }

  /**
   * Cập nhật thông tin và hình ảnh khóa học
   */
  async updateCourse(id, courseName, description, thumbnail) {
    const pool = await poolPromise;
    let query = `UPDATE COURSE SET CourseName = @CourseName, Description = @Description`;
    const request = pool
      .request()
      .input("IdCourse", sql.Int, id)
      .input("CourseName", sql.NVarChar, courseName)
      .input("Description", sql.NVarChar, description || "");

    if (thumbnail) {
      query += `, Thumbnail = @Thumbnail`;
      request.input("Thumbnail", sql.VarChar, thumbnail);
    }

    query += ` WHERE IdCourse = @IdCourse`;
    return await request.query(query);
  }

  /**
   * Xóa khóa học an toàn bằng Transaction
   */
  async deleteCourse(id) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const request = new sql.Request(transaction).input("IdCourse", sql.Int, id);

      // BƯỚC 1: Xóa dữ liệu đăng ký học (Enroll)
      await request.query(`DELETE FROM Enroll WHERE IdCourse = @IdCourse`);

      // BƯỚC 2: Xóa file đính kèm bài học (LESSON_FILE)
      await request.query(`
        DELETE FROM LESSON_FILE 
        WHERE IdLesson IN (SELECT IdLesson FROM LESSON WHERE IdCourse = @IdCourse)
      `);

      // BƯỚC 3: Xóa liên kết bài tập (Lesson_Problem)
      await request.query(`
        DELETE FROM Lesson_Problem 
        WHERE IdLesson IN (SELECT IdLesson FROM LESSON WHERE IdCourse = @IdCourse)
      `);

      // BƯỚC 4: Xóa bài học (LESSON)
      await request.query(`DELETE FROM LESSON WHERE IdCourse = @IdCourse`);

      // BƯỚC 5: Xóa Khóa học ở bảng COURSE
      await request.query(`DELETE FROM COURSE WHERE IdCourse = @IdCourse`);

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error("Không thể xóa khóa học do lỗi ràng buộc hệ thống: " + error.message);
    }
  }
}

module.exports = new CourseRepository();