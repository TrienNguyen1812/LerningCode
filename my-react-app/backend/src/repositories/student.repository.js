const { poolPromise } = require("../config/db");

class StudentRepository {
  async getAllStudents() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.IdUser, u.FullName, u.Email, CONVERT(varchar, u.CreateDate, 107) as JoinedDate, COUNT(e.IdCourse) as CoursesEnrolled
      FROM USERS u LEFT JOIN Enroll e ON u.IdUser = e.IdUser 
      WHERE u.Role = N'sinh viên'
      GROUP BY u.IdUser, u.FullName, u.Email, u.CreateDate 
      ORDER BY u.CreateDate DESC
    `);
    return result.recordset;
  }
}

module.exports = new StudentRepository();