const { sql, poolPromise } = require("../config/db");

class StudentStatsRepository {
  async getStudentStatsByUserId(idUser) {
    const pool = await poolPromise;
    const request = pool.request();

    // Query lấy dữ liệu chuẩn từ bảng USER_PROBLEM_PROGRESS
    const query = `
      SELECT 
        -- 1. TOTAL LEARNING ITEMS: Tổng số bài tập sinh viên đã làm
        COUNT(IdProblem) AS totalItems,

        -- 2. SCORE IMPROVEMENT: Ép kiểu FLOAT để Node.js đọc đúng kiểu Number
        ISNULL(CAST(ROUND(AVG(CAST(ScoreImprovement AS FLOAT)), 1) AS FLOAT), 0.0) AS avgImprovement,

        -- 3. AVERAGE RESULT: Điểm trung bình BestScore
        ISNULL(CAST(ROUND(AVG(CAST(BestScore AS FLOAT)), 1) AS FLOAT), 0.0) AS avgScore,

        -- 4. ITEMS COMPLETED: Số bài tập đã giải xong (IsSelfResolved = 1)
        ISNULL(SUM(CASE WHEN IsSelfResolved = 1 THEN 1 ELSE 0 END), 0) AS completedItems
      FROM USER_PROBLEM_PROGRESS
      WHERE IdUser = @IdUser
    `;

    const result = await request
      .input("IdUser", sql.Int, idUser)
      .query(query);

    return result.recordset[0];
  }
}

module.exports = new StudentStatsRepository();