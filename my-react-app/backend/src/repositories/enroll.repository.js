const { poolPromise, sql } = require("../config/db");

class EnrollRepository {
  /**
   * Lấy danh sách IdUser đã ghi danh vào khóa học
   */
  async getEnrolledUserIds(courseId) {
    const pool = await poolPromise;
    const query = `SELECT IdUser FROM Enroll WHERE IdCourse = @courseId`;
    const result = await pool
      .request()
      .input("courseId", sql.Int, courseId)
      .query(query);

    return result.recordset.map((row) => row.IdUser);
  }

  /**
   * Đồng bộ danh sách Enroll trong Transaction (Áp dụng kết quả từ Strategy)
   */
  async syncEnrollments(courseId, userIdsToAdd, userIdsToRemove) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1. Thêm mới các học viên chưa có (EnrolledAt sẽ tự động lấy GETDATE() nhờ DEFAULT)
      for (const userId of userIdsToAdd) {
        const insertReq = new sql.Request(transaction);
        await insertReq
          .input("IdUser", sql.Int, userId)
          .input("IdCourse", sql.Int, courseId)
          .query(`
            IF NOT EXISTS (SELECT 1 FROM Enroll WHERE IdUser = @IdUser AND IdCourse = @IdCourse)
            BEGIN
              INSERT INTO Enroll (IdUser, IdCourse)
              VALUES (@IdUser, @IdCourse);
            END
          `);
      }

      // 2. Bỏ gán học viên khỏi khóa học
      for (const userId of userIdsToRemove) {
        const deleteReq = new sql.Request(transaction);
        await deleteReq
          .input("IdUser", sql.Int, userId)
          .input("IdCourse", sql.Int, courseId)
          .query(`
            DELETE FROM Enroll 
            WHERE IdUser = @IdUser AND IdCourse = @IdCourse
          `);
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new EnrollRepository();