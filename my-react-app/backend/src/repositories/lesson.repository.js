const { sql, poolPromise } = require("../config/db");
const Lesson = require("../models/lesson");

class LessonRepository {
  /**
   * Lấy danh sách bài học thuộc khóa học kèm file & bài tập
   */
  async getLessonsByCourseId(idCourse) {
    const pool = await poolPromise;
    const result = await pool.request().input("IdCourse", sql.Int, idCourse)
      .query(`
        SELECT 
          L.IdLesson,
          L.Title,
          L.Content,
          L.Order_index,
          L.CreateDate,
          L.IdCourse,
          F.IdFile,
          F.FileName,
          F.FilePath,
          F.FileType,
          F.FileSize,
          LF.AttachedAt,
          P.IdProblem,
          P.Title AS ProblemTitle,
          P.Difficulty,
          P.Time_limit
        FROM LESSON L
        LEFT JOIN LESSON_FILE LF ON L.IdLesson = LF.IdLesson
        LEFT JOIN SYSTEM_FILE F ON LF.IdFile = F.IdFile
        LEFT JOIN Lesson_Problem LP ON L.IdLesson = LP.IdLesson
        LEFT JOIN PROBLEM P ON LP.IdProblem = P.IdProblem
        WHERE L.IdCourse = @IdCourse
        ORDER BY L.Order_index ASC
      `);

    const lessonsMap = {};

    result.recordset.forEach((row) => {
      if (!lessonsMap[row.IdLesson]) {
        lessonsMap[row.IdLesson] = {
          IdLesson: row.IdLesson,
          Title: row.Title,
          Content: row.Content,
          Order_index: row.Order_index,
          CreateDate: row.CreateDate,
          IdCourse: row.IdCourse,
          Files: [],
          Problems: [],
        };
      }

      if (
        row.IdFile &&
        !lessonsMap[row.IdLesson].Files.some((f) => f.IdFile === row.IdFile)
      ) {
        lessonsMap[row.IdLesson].Files.push({
          IdFile: row.IdFile,
          FileName: row.FileName,
          FilePath: row.FilePath,
          FileType: row.FileType,
          FileSize: row.FileSize,
          AttachedAt: row.AttachedAt,
        });
      }

      if (
        row.IdProblem &&
        !lessonsMap[row.IdLesson].Problems.some(
          (p) => p.IdProblem === row.IdProblem
        )
      ) {
        lessonsMap[row.IdLesson].Problems.push({
          IdProblem: row.IdProblem,
          Title: row.ProblemTitle,
          Difficulty: row.Difficulty,
          Time_limit: row.Time_limit,
        });
      }
    });

    return Object.values(lessonsMap).map((data) => new Lesson(data));
  }

  /**
   * Lấy chi tiết 1 bài học theo ID (Kèm File & Bài tập)
   */
  async getLessonById(idLesson) {
    const pool = await poolPromise;
    const result = await pool.request().input("IdLesson", sql.Int, idLesson)
      .query(`
        SELECT 
          L.IdLesson,
          L.Title,
          L.Content,
          L.Order_index,
          L.CreateDate,
          L.IdCourse,
          F.IdFile,
          F.FileName,
          F.FilePath,
          F.FileType,
          F.FileSize,
          P.IdProblem,
          P.Title AS ProblemTitle,
          P.Difficulty,
          P.Time_limit
        FROM LESSON L
        LEFT JOIN LESSON_FILE LF ON L.IdLesson = LF.IdLesson
        LEFT JOIN SYSTEM_FILE F ON LF.IdFile = F.IdFile
        LEFT JOIN Lesson_Problem LP ON L.IdLesson = LP.IdLesson
        LEFT JOIN PROBLEM P ON LP.IdProblem = P.IdProblem
        WHERE L.IdLesson = @IdLesson
      `);

    if (result.recordset.length === 0) return null;

    const firstRow = result.recordset[0];
    const lessonData = {
      IdLesson: firstRow.IdLesson,
      Title: firstRow.Title,
      Content: firstRow.Content,
      Order_index: firstRow.Order_index,
      CreateDate: firstRow.CreateDate,
      IdCourse: firstRow.IdCourse,
      Files: [],
      Problems: [],
    };

    result.recordset.forEach((row) => {
      if (
        row.IdFile &&
        !lessonData.Files.some((f) => f.IdFile === row.IdFile)
      ) {
        lessonData.Files.push({
          IdFile: row.IdFile,
          FileName: row.FileName,
          FilePath: row.FilePath,
          FileType: row.FileType,
          FileSize: row.FileSize,
        });
      }

      if (
        row.IdProblem &&
        !lessonData.Problems.some((p) => p.IdProblem === row.IdProblem)
      ) {
        lessonData.Problems.push({
          IdProblem: row.IdProblem,
          Title: row.ProblemTitle,
          Difficulty: row.Difficulty,
          Time_limit: row.Time_limit,
        });
      }
    });

    return new Lesson(lessonData);
  }

  /**
   * Đính kèm Bài tập vào bài học (Ghi vào bảng Lesson_Problem)
   */
  async attachProblemToLesson(idLesson, idProblem) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("IdLesson", sql.Int, idLesson)
      .input("IdProblem", sql.Int, idProblem)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Lesson_Problem] WHERE IdLesson = @IdLesson AND IdProblem = @IdProblem)
        INSERT INTO [dbo].[Lesson_Problem] (IdLesson, IdProblem)
        VALUES (@IdLesson, @IdProblem)
      `);
  }

  /**
   * Tạo bài học mới
   */
  async createLesson({ title, content, orderIndex, idCourse }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("Title", sql.NVarChar(255), title)
      .input("Content", sql.NVarChar(sql.MAX), content || null)
      .input("CreateDate", sql.DateTime, new Date())
      .input("Order_index", sql.Int, orderIndex || 1)
      .input("IdCourse", sql.Int, idCourse).query(`
        INSERT INTO LESSON (Title, Content, CreateDate, Order_index, IdCourse)
        OUTPUT INSERTED.*
        VALUES (@Title, @Content, @CreateDate, @Order_index, @IdCourse)
      `);

    return new Lesson(result.recordset[0]);
  }

  /**
   * Đính kèm file vào bài học (Ghi vào LESSON_FILE)
   */
  async attachFileToLesson(idLesson, idFile) {
    const pool = await poolPromise;
    await pool
      .request()
      .input("IdLesson", sql.Int, idLesson)
      .input("IdFile", sql.Int, idFile).query(`
        IF NOT EXISTS (SELECT 1 FROM LESSON_FILE WHERE IdLesson = @IdLesson AND IdFile = @IdFile)
        INSERT INTO LESSON_FILE (IdLesson, IdFile) VALUES (@IdLesson, @IdFile)
      `);
  }
}

module.exports = new LessonRepository();