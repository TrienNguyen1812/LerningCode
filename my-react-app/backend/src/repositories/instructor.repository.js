const { poolPromise } = require("../config/db");

class InstructorRepository {
  async getAllInstructors() {
    const pool = await poolPromise;
    const result = await pool.request().query(
      `SELECT IdUser, FullName, Email FROM USERS WHERE Role = N'giảng viên'`
    );
    return result.recordset;
  }
}

module.exports = new InstructorRepository();