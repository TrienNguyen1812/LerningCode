const { sql, poolPromise } = require("../config/db");

class ProblemRepository {
  // 1. Lấy danh sách bài tập
  async findAll() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
    SELECT p.*, COUNT(tc.IdTestCase) AS TestCaseCount
    FROM PROBLEM p
    LEFT JOIN TEST_CASE tc ON p.IdProblem = tc.IdProblem
    GROUP BY p.IdProblem, p.Title, p.Description, p.Difficulty, 
             p.Time_limit, p.Memory_limit, p.Sample_code, 
             p.Ai_Prompt_Instruction, p.MaxHintAllowed, p.CreateDate, p.Deadline
    ORDER BY p.CreateDate DESC
  `);
    return result.recordset;
  }

  // 2. Lấy chi tiết 1 bài tập kèm danh sách Test Cases
  async findById(id) {
    const pool = await poolPromise;
    const problemQuery = await pool
      .request()
      .input("IdProblem", sql.Int, id)
      .query("SELECT * FROM PROBLEM WHERE IdProblem = @IdProblem");

    if (problemQuery.recordset.length === 0) return null;

    const testCasesQuery = await pool
      .request()
      .input("IdProblem", sql.Int, id)
      .query(
        "SELECT * FROM TEST_CASE WHERE IdProblem = @IdProblem ORDER BY Order_index ASC",
      );

    return {
      ...problemQuery.recordset[0],
      testCases: testCasesQuery.recordset,
    };
  }

  // 3. Tạo mới bài tập kèm Test Cases
  async createWithTestCases(problemData, testCases) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      const probReq = new sql.Request(transaction);
      const probRes = await probReq
        .input("Title", sql.NVarChar(255), problemData.title)
        .input(
          "Description",
          sql.NVarChar(sql.MAX),
          problemData.description || "",
        )
        .input("Difficulty", sql.NVarChar(255), problemData.difficulty)
        .input("Time_limit", sql.Int, problemData.timeLimit || 1000)
        .input("Memory_limit", sql.Int, problemData.memoryLimit || 65536)
        .input(
          "Sample_code",
          sql.VarChar(sql.MAX),
          problemData.sampleCode || null,
        )
        .input(
          "Ai_Prompt_Instruction",
          sql.NVarChar(sql.MAX),
          problemData.aiPromptInstruction || null,
        )
        .input("CreateDate", sql.DateTime, new Date())
        .input(
          "Deadline",
          sql.DateTime,
          problemData.deadline
            ? new Date(problemData.deadline)
            : new Date("2026-12-31"),
        ).query(`
          INSERT INTO PROBLEM (Title, Description, Difficulty, Time_limit, Memory_limit, Sample_code, Ai_Prompt_Instruction, CreateDate, Deadline)
          OUTPUT INSERTED.IdProblem
          VALUES (@Title, @Description, @Difficulty, @Time_limit, @Memory_limit, @Sample_code, @Ai_Prompt_Instruction, @CreateDate, @Deadline);
        `);

      const newId = probRes.recordset[0].IdProblem;

      if (testCases && testCases.length > 0) {
        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          const tcReq = new sql.Request(transaction);
          await tcReq
            .input("InputData", sql.NVarChar(sql.MAX), tc.inputData || "")
            .input("OutputData", sql.NVarChar(sql.MAX), tc.outputData || "")
            .input("IsHidden", sql.Bit, tc.isHidden ? 1 : 0)
            .input("Weight", sql.Float, tc.weight || 1.0)
            .input("TestType", sql.NVarChar(100), tc.testType || "Thông thường")
            .input("ExpectError", sql.Bit, tc.expectError ? 1 : 0)
            .input("Order_index", sql.Int, i + 1)
            .input("IdProblem", sql.Int, newId).query(`
              INSERT INTO TEST_CASE (InputData, OutputData, IsHidden, Weight, TestType, ExpectError, Order_index, IdProblem)
              VALUES (@InputData, @OutputData, @IsHidden, @Weight, @TestType, @ExpectError, @Order_index, @IdProblem)
            `);
        }
      }

      await transaction.commit();
      return newId;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // 4. Cập nhật bài tập
  async update(id, problemData, testCases) {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      await new sql.Request(transaction)
        .input("IdProblem", sql.Int, id)
        .input("Title", sql.NVarChar(255), problemData.title)
        .input(
          "Description",
          sql.NVarChar(sql.MAX),
          problemData.description || "",
        )
        .input("Difficulty", sql.NVarChar(255), problemData.difficulty)
        .input("Time_limit", sql.Int, problemData.timeLimit)
        .input("Memory_limit", sql.Int, problemData.memoryLimit)
        .input(
          "Sample_code",
          sql.VarChar(sql.MAX),
          problemData.sampleCode || null,
        )
        .input(
          "Ai_Prompt_Instruction",
          sql.NVarChar(sql.MAX),
          problemData.aiPromptInstruction || null,
        )
        .input(
          "Deadline",
          sql.DateTime,
          problemData.deadline
            ? new Date(problemData.deadline)
            : new Date("2026-12-31"),
        ).query(`
          UPDATE PROBLEM 
          SET Title = @Title, Description = @Description, Difficulty = @Difficulty,
              Time_limit = @Time_limit, Memory_limit = @Memory_limit, 
              Sample_code = @Sample_code, Ai_Prompt_Instruction = @Ai_Prompt_Instruction,
              Deadline = @Deadline
          WHERE IdProblem = @IdProblem
        `);

      if (testCases) {
        await new sql.Request(transaction)
          .input("IdProblem", sql.Int, id)
          .query("DELETE FROM TEST_CASE WHERE IdProblem = @IdProblem");

        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          await new sql.Request(transaction)
            .input("InputData", sql.NVarChar(sql.MAX), tc.inputData || "")
            .input("OutputData", sql.NVarChar(sql.MAX), tc.outputData || "")
            .input("IsHidden", sql.Bit, tc.isHidden ? 1 : 0)
            .input("Weight", sql.Float, tc.weight || 1.0)
            .input("TestType", sql.NVarChar(100), tc.testType || "Thông thường")
            .input("ExpectError", sql.Bit, tc.expectError ? 1 : 0)
            .input("Order_index", sql.Int, i + 1)
            .input("IdProblem", sql.Int, id).query(`
              INSERT INTO TEST_CASE (InputData, OutputData, IsHidden, Weight, TestType, ExpectError, Order_index, IdProblem)
              VALUES (@InputData, @OutputData, @IsHidden, @Weight, @TestType, @ExpectError, @Order_index, @IdProblem)
            `);
        }
      }

      await transaction.commit();
      return true;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // 5. Xóa bài tập
  async delete(id) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("IdProblem", sql.Int, id)
      .query("DELETE FROM PROBLEM WHERE IdProblem = @IdProblem");
  }
}

module.exports = new ProblemRepository();
