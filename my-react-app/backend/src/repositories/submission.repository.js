const { sql, poolPromise } = require("../config/db");

class SubmissionRepository {
  /**
   * Tạo bản ghi submission ban đầu
   */
  async createInitialSubmission(data) {
    const pool = await poolPromise;
    const request = pool.request();

    // ⚡ Bắt an toàn cả idUser/IdUser và idProblem/IdProblem
    const userId = Number(data.idUser ?? data.IdUser ?? data.userId);
    const problemId = Number(data.idProblem ?? data.IdProblem ?? data.problemId);
    const duration = Number(data.durationInSeconds ?? data.DurationInSeconds ?? 0);
    const code = data.codeContent ?? data.Code_content ?? "";
    const lang = data.language ?? data.Language ?? "csharp";

    const result = await request
      .input("Code_content", sql.NVarChar(sql.MAX), code)
      .input("Language", sql.NVarChar(20), lang)
      .input("Status", sql.NVarChar(30), "Judging")
      .input("SubmitDate", sql.DateTime, new Date())
      .input("IdUser", sql.Int, userId)
      .input("IdProblem", sql.Int, problemId)
      .input("DurationInSeconds", sql.Int, duration)
      .query(`
        INSERT INTO SUBMISSION (Code_content, Language, Status, SubmitDate, IdUser, IdProblem, DurationInSeconds)
        OUTPUT INSERTED.IdSubmission
        VALUES (@Code_content, @Language, @Status, @SubmitDate, @IdUser, @IdProblem, @DurationInSeconds)
      `);

    const newIdSubmission = result.recordset[0].IdSubmission;

    // 🌟 Cập nhật IdSubmission cho các lượt Hint trước đó
    if (newIdSubmission && userId && problemId) {
      await this.linkPendingHints(userId, problemId, newIdSubmission);
    }

    return newIdSubmission;
  }

  /**
   * 🌟 CẬP NHẬT RIÊNG BẢNG HINT_USAGE
   */
  async linkPendingHints(idUser, idProblem, idSubmission) {
    try {
      const pool = await poolPromise;
      const request = pool.request();

      await request
        .input("IdUser", sql.Int, Number(idUser))
        .input("IdProblem", sql.Int, Number(idProblem))
        .input("IdSubmission", sql.Int, Number(idSubmission))
        .query(`
          UPDATE HINT_USAGE 
          SET IdSubmission = @IdSubmission
          WHERE IdUser = @IdUser 
            AND IdProblem = @IdProblem 
            AND IdSubmission IS NULL
        `);

      console.log(`[DB SUCCESS] Đã cập nhật IdSubmission = ${idSubmission} cho HINT_USAGE của User ${idUser}!`);
    } catch (err) {
      console.error("[DB ERROR] Lỗi khi cập nhật IdSubmission vào HINT_USAGE:", err.message);
    }
  }

  /**
   * Cập nhật kết quả chấm điểm cuối cùng cho Submission
   */
  async updateFinalSubmission(idSubmission, status, scores = {}) {
    const pool = await poolPromise;
    const request = pool.request();

    await request
      .input("IdSubmission", sql.Int, Number(idSubmission))
      .input("Status", sql.NVarChar(30), status || "Evaluated")
      .input("CorrectnessScore", sql.Float, scores.correctnessScore || 0)
      .input("ReliabilityScore", sql.Float, scores.reliabilityScore || 0)
      .input("CodeQualityScore", sql.Float, scores.codeQualityScore || 0)
      .input("FinalScore", sql.Float, scores.finalScore || 0)
      .query(`
        UPDATE SUBMISSION 
        SET Status = @Status,
            CorrectnessScore = @CorrectnessScore,
            ReliabilityScore = @ReliabilityScore,
            CodeQualityScore = @CodeQualityScore,
            FinalScore = @FinalScore
        WHERE IdSubmission = @IdSubmission
      `);
  }

  /**
   * Lưu chi tiết từng Test Case vào Execution_Result
   */
  async saveExecutionResults(idSubmission, executionResults = []) {
    const pool = await poolPromise;

    for (const item of executionResults) {
      const request = pool.request();

      const testCaseId = Number(item.idTestCase ?? item.IdTestCase);
      const subId = Number(idSubmission);

      await request
        .input("Actual_output", sql.NVarChar(sql.MAX), item.actualOutput || "") // Dùng NVARCHAR(MAX) chuẩn Unicode
        .input("Is_passed", sql.Bit, item.isPassed ? 1 : 0)
        .input("Memory_used", sql.Int, item.memoryUsed || 0)
        .input("Execution_time", sql.Int, item.executionTime || 0)
        .input("Error_message", sql.NVarChar(sql.MAX), item.errorMessage || null)
        .input("Score_earned", sql.Float, item.scoreEarned || 0)
        .input("IdTestCase", sql.Int, testCaseId)
        .input("IdSubmission", sql.Int, subId)
        .query(`
          INSERT INTO Execution_Result (
            Actual_output, Is_passed, Memory_used, Execution_time, Error_message, Score_earned, IdTestCase, IdSubmission
          )
          VALUES (@Actual_output, @Is_passed, @Memory_used, @Execution_time, @Error_message, @Score_earned, @IdTestCase, @IdSubmission)
        `);
    }
  }

  /**
   * Đếm số lượt người dùng đã xem Hint/Gợi ý của bài tập này
   */
  async getUsedHintCount(idUser, idProblem) {
    const pool = await poolPromise;
    const request = pool.request();

    const userId = Number(idUser);
    const problemId = Number(idProblem);

    const result = await request
      .input("IdUser", sql.Int, userId)
      .input("IdProblem", sql.Int, problemId)
      .query(`
        SELECT COUNT(*) AS HintCount 
        FROM HINT_USAGE 
        WHERE IdUser = @IdUser AND IdProblem = @IdProblem
      `);

    return result.recordset[0]?.HintCount || 0;
  }
}

module.exports = new SubmissionRepository();