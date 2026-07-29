const { sql, poolPromise } = require("../config/db");

class TestCaseRepository {
  async getTestCasesByProblemId(problemId) {
    const pool = await poolPromise;
    const dbResult = await pool
      .request()
      .input("idProblem", sql.Int, problemId)
      .query(`
        SELECT 
          IdTestCase AS idTestCase,
          ISNULL(InputData, '') AS inputData, 
          ISNULL(OutputData, '') AS outputData, 
          IsHidden AS isHidden,
          ISNULL(Weight, 1.0) AS weight,
          ISNULL(TestType, N'Thông thường') AS testType,
          ISNULL(ExpectError, 0) AS expectError,
          Order_index AS orderIndex,
          IdProblem AS idProblem
        FROM TEST_CASE 
        WHERE IdProblem = @idProblem 
        ORDER BY Order_index ASC
      `);

    return dbResult.recordset;
  }
}

module.exports = new TestCaseRepository();