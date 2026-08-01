const { sql, poolPromise } = require("../config/db");

class UserProgressRepository {
  async updateProgress(
    idUser,
    idProblem,
    finalScore,
    independenceLevel,
    hintCount,
    durationInSeconds,
    isPassed = false
  ) {
    const pool = await poolPromise;
    const request = pool.request();

    // 1. Lấy thông tin tiến độ hiện tại
    const existing = await request
      .input("IdUser", sql.Int, idUser)
      .input("IdProblem", sql.Int, idProblem)
      .query(
        `SELECT * FROM USER_PROBLEM_PROGRESS WHERE IdUser = @IdUser AND IdProblem = @IdProblem`
      );

    const minutesSpent = Math.ceil(durationInSeconds / 60);

    // XÁC ĐỊNH TRẠNG THÁI PASS (Đạt bài tập)
    const isPassedNow = isPassed || finalScore >= 8.0;

    if (existing.recordset.length === 0) {
      // ==========================================
      // TRƯỜNG HỢP 1: LẦN NỘP BÀI ĐẦU TIÊN (INSERT)
      // ==========================================
      const insertReq = pool.request();

      const isSelfResolvedVal = isPassedNow ? 1 : 0;
      const firstPassTimeVal = isPassedNow ? (minutesSpent || 1) : null;

      await insertReq
        .input("IdUser", sql.Int, idUser)
        .input("IdProblem", sql.Int, idProblem)
        .input("BestScore", sql.Float, finalScore)
        .input("IndependenceLevel", sql.NVarChar(30), independenceLevel || 'Rất cao')
        .input("TotalHintsUsed", sql.Int, hintCount || 0)
        .input("FirstScore", sql.Float, finalScore)
        .input("ScoreImprovement", sql.Float, 0) // Lần đầu tiên mức tăng điểm luôn = 0
        .input("AttemptCount", sql.Int, 1)
        .input("TotalTimeSpentMinutes", sql.Int, minutesSpent)
        .input("IsSelfResolved", sql.Bit, isSelfResolvedVal)
        .input("FirstPassTime", sql.Int, firstPassTimeVal)
        .query(`
          INSERT INTO USER_PROBLEM_PROGRESS 
            (IdUser, IdProblem, BestScore, IndependenceLevel, TotalHintsUsed, FirstScore, ScoreImprovement, AttemptCount, TotalTimeSpentMinutes, IsSelfResolved, FirstPassTime, LastUpdated)
          VALUES 
            (@IdUser, @IdProblem, @BestScore, @IndependenceLevel, @TotalHintsUsed, @FirstScore, @ScoreImprovement, @AttemptCount, @TotalTimeSpentMinutes, @IsSelfResolved, @FirstPassTime, GETDATE())
        `);

      return {
        attemptCount: 1,
        scoreImprovement: 0,
        independenceLevel: independenceLevel || 'Rất cao',
        totalTimeSpentMinutes: minutesSpent,
        isSelfResolved: Boolean(isSelfResolvedVal),
        firstPassTime: firstPassTimeVal,
      };
    } else {
      // ==========================================
      // TRƯỜNG HỢP 2: ĐÃ CÓ BẢN GHI (UPDATE)
      // ==========================================
      const current = existing.recordset[0];
      
      // a. Tính BestScore mới
      const newBestScore = Math.max(current.BestScore || 0, finalScore);

      // b. TÍNH MỨC TĂNG ĐIỂM (Tối ưu chống điểm âm & null fallback)
      const baselineScore = current.FirstScore ?? current.BestScore ?? 0;
      const rawImprovement = newBestScore - baselineScore;
      const scoreImprovement = parseFloat(Math.max(0, rawImprovement).toFixed(2));

      // c. Cộng dồn số lần thử & thời gian làm bài
      const newAttemptCount = (current.AttemptCount || 0) + 1;
      const newTotalTime = (current.TotalTimeSpentMinutes || 0) + minutesSpent;

      // d. Giữ trạng thái IsSelfResolved nếu đã từng Pass
      const isSelfResolvedVal = (current.IsSelfResolved || isPassedNow) ? 1 : 0;

      // e. Lưu tổng thời gian tích lũy ở lần PASS đầu tiên
      let firstPassTimeVal = current.FirstPassTime;
      if ((firstPassTimeVal === null || firstPassTimeVal === undefined) && isPassedNow) {
        firstPassTimeVal = newTotalTime || 1;
      }

      const updateReq = pool.request();
      await updateReq
        .input("IdUser", sql.Int, idUser)
        .input("IdProblem", sql.Int, idProblem)
        .input("BestScore", sql.Float, newBestScore)
        .input("IndependenceLevel", sql.NVarChar(30), independenceLevel || 'Rất cao')
        .input("TotalHintsUsed", sql.Int, hintCount || 0)
        .input("ScoreImprovement", sql.Float, scoreImprovement)
        .input("AttemptCount", sql.Int, newAttemptCount)
        .input("TotalTimeSpentMinutes", sql.Int, newTotalTime)
        .input("IsSelfResolved", sql.Bit, isSelfResolvedVal)
        .input("FirstPassTime", sql.Int, firstPassTimeVal)
        .query(`
          UPDATE USER_PROBLEM_PROGRESS
          SET BestScore = @BestScore,
              IndependenceLevel = @IndependenceLevel,
              TotalHintsUsed = @TotalHintsUsed,
              ScoreImprovement = @ScoreImprovement,
              AttemptCount = @AttemptCount,
              TotalTimeSpentMinutes = @TotalTimeSpentMinutes,
              IsSelfResolved = @IsSelfResolved,
              FirstPassTime = @FirstPassTime,
              LastUpdated = GETDATE()
          WHERE IdUser = @IdUser AND IdProblem = @IdProblem
        `);

      return {
        attemptCount: newAttemptCount,
        scoreImprovement,
        independenceLevel: independenceLevel || 'Rất cao',
        totalTimeSpentMinutes: newTotalTime,
        isSelfResolved: Boolean(isSelfResolvedVal),
        firstPassTime: firstPassTimeVal,
      };
    }
  }
}

module.exports = new UserProgressRepository();