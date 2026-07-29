const { sql, poolPromise } = require("../config/db");

class FileRepository {
  // Lấy tất cả file trong kho (dùng cho giao diện Files & Folders)
  async getAllFiles() {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT IdFile, FileName, FilePath, FileType, FileSize, 
             CONVERT(varchar, UploadDate, 103) AS UploadDateStr
      FROM SYSTEM_FILE
      ORDER BY UploadDate DESC
    `);
    return result.recordset;
  }

  // Lấy danh sách File gắn kèm vào 1 Bài học cụ thể (Quan hệ N-N)
  async getFilesByLessonId(lessonId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("IdLesson", sql.Int, lessonId)
      .query(`
        SELECT f.IdFile, f.FileName, f.FilePath, f.FileType, f.FileSize,
               CONVERT(varchar, f.UploadDate, 103) AS UploadDateStr
        FROM SYSTEM_FILE f
        JOIN LESSON_FILE lf ON f.IdFile = lf.IdFile
        WHERE lf.IdLesson = @IdLesson
        ORDER BY lf.AttachedAt DESC
      `);
    return result.recordset;
  }

  // Thêm mới file vào kho SYSTEM_FILE
  async createFile(fileName, filePath, fileType, fileSize) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("FileName", sql.NVarChar, fileName)
      .input("FilePath", sql.VarChar, filePath)
      .input("FileType", sql.VarChar, fileType || null)
      .input("FileSize", sql.Int, fileSize || 0)
      .query(`
        INSERT INTO SYSTEM_FILE (FileName, FilePath, FileType, FileSize, UploadDate)
        OUTPUT INSERTED.IdFile
        VALUES (@FileName, @FilePath, @FileType, @FileSize, GETDATE())
      `);
    return result.recordset[0].IdFile;
  }

  // Gắn file đã có vào bài học (Tạo bản ghi bảng LESSON_FILE)
  async attachFileToLesson(lessonId, fileId) {
    const pool = await poolPromise;
    return await pool.request()
      .input("IdLesson", sql.Int, lessonId)
      .input("IdFile", sql.Int, fileId)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM LESSON_FILE WHERE IdLesson = @IdLesson AND IdFile = @IdFile)
        BEGIN
          INSERT INTO LESSON_FILE (IdLesson, IdFile) VALUES (@IdLesson, @IdFile)
        END
      `);
  }

  // Gỡ kết nối file khỏi bài học (Không xóa file gốc trong kho)
  async detachFileFromLesson(lessonId, fileId) {
    const pool = await poolPromise;
    return await pool.request()
      .input("IdLesson", sql.Int, lessonId)
      .input("IdFile", sql.Int, fileId)
      .query(`
        DELETE FROM LESSON_FILE 
        WHERE IdLesson = @IdLesson AND IdFile = @IdFile
      `);
  }

  // Xóa hẳn file khỏi hệ thống (Tự động xóa trong LESSON_FILE nhờ FK ON DELETE CASCADE)
  async deleteFile(idFile) {
    const pool = await poolPromise;
    return await pool.request()
      .input("IdFile", sql.Int, idFile)
      .query(`DELETE FROM SYSTEM_FILE WHERE IdFile = @IdFile`);
  }
}

module.exports = new FileRepository();