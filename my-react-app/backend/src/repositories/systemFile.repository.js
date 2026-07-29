const { sql, poolPromise } = require("../config/db");

class SystemFileRepository {
  async getAllFiles() {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM SYSTEM_FILE ORDER BY UploadDate DESC");
    return result.recordset;
  }

  async createFile({ fileName, filePath, fileType, fileSize }) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("FileName", sql.NVarChar(255), fileName)
      .input("FilePath", sql.VarChar(500), filePath)
      .input("FileType", sql.VarChar(50), fileType)
      .input("FileSize", sql.Int, fileSize)
      .query(`
        INSERT INTO SYSTEM_FILE (FileName, FilePath, FileType, FileSize, UploadDate)
        OUTPUT INSERTED.*
        VALUES (@FileName, @FilePath, @FileType, @FileSize, GETDATE())
      `);
    return result.recordset[0];
  }
}

module.exports = new SystemFileRepository();