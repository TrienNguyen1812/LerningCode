const { poolPromise } = require("../config/db");

class UserRepository {
  /**
   * Lấy danh sách tất cả Users kèm theo trạng thái gán (isAssigned) cho một khóa học cụ thể
   * @param {number|string} courseId - ID khóa học cần kiểm tra
   */
  async getUsersWithEnrollStatus(courseId) {
    const pool = await poolPromise;
    const query = `
      SELECT 
        u.IdUser, 
        u.FullName, 
        u.Email, 
        u.Role,
        CASE 
          WHEN e.IdCourse IS NOT NULL THEN 1 
          ELSE 0 
        END AS isAssigned
      FROM USERS u
      LEFT JOIN Enroll e ON u.IdUser = e.IdUser AND e.IdCourse = @courseId
      ORDER BY u.FullName ASC
    `;

    const result = await pool
      .request()
      .input("courseId", courseId)
      .query(query);

    // Chuyển giá trị isAssigned từ 1/0 sang boolean (true/false) để dễ xử lý ở Frontend
    return result.recordset.map((row) => ({
      ...row,
      isAssigned: Boolean(row.isAssigned),
    }));
  }

  /**
   * Lấy danh sách tất cả người dùng trong hệ thống
   */
  async getAllUsers() {
    const pool = await poolPromise;
    const query = `
      SELECT IdUser, FullName, Email, Role, CreateDate 
      FROM USERS 
      ORDER BY FullName ASC
    `;
    const result = await pool.request().query(query);
    return result.recordset;
  }

  /**
   * Lấy thông tin 1 người dùng theo ID
   * @param {number|string} userId
   */
  async getUserById(userId) {
    const pool = await poolPromise;
    const query = `
      SELECT IdUser, FullName, Email, Role, CreateDate 
      FROM USERS 
      WHERE IdUser = @userId
    `;
    const result = await pool.request().input("userId", userId).query(query);

    return result.recordset[0] || null;
  }
}

module.exports = new UserRepository();
