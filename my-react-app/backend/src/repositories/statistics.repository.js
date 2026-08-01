const { sql, poolPromise } = require("../config/db"); // Giữ nguyên db.js dùng msnodesqlv8
const queries = require("../models/Statistic");

class StatisticsRepository {
  // Lấy tổng quan các con số thống kê
  async getOverviewStats() {
    const pool = await poolPromise;
    const result = await pool.request().query(queries.GET_OVERVIEW_STATS);
    return result.recordset[0];
  }

  // Lấy danh sách thắc mắc/chủ đề AI được hỏi nhiều nhất
  async getTopAiQuestions() {
    const pool = await poolPromise;
    const result = await pool.request().query(queries.GET_TOP_AI_QUESTIONS);
    return result.recordset;
  }

  // Lấy thắc mắc AI theo Bài tập cụ thể (idProblem hoặc title)
  async getFeedbacksByProblem({ idProblem = null, problemTitle = "" }) {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("idProblem", sql.Int, idProblem ? Number(idProblem) : null);
    request.input("problemTitle", sql.NVarChar, problemTitle || null);

    const result = await request.query(queries.GET_PROBLEM_AI_FEEDBACKS);
    return result.recordset;
  }

  // Lấy Top bài tập sinh viên xin Hint nhiều nhất
  async getTopHelpedProblems() {
    const pool = await poolPromise;
    const result = await pool.request().query(queries.GET_TOP_HELPED_PROBLEMS);
    return result.recordset;
  }

  async getTopHints() {
    const pool = await poolPromise;
    const request = pool.request();

    const result = await request.query(`
    SELECT 
      -- 1. Bắt chuỗi [Hint Level X] hoặc mặc định là "Cấp độ 1"
      CASE 
        WHEN HintContent LIKE N'%[Hint Level 1]%' THEN N'Cấp độ 1 (Gợi ý nhẹ)'
        WHEN HintContent LIKE N'%[Hint Level 2]%' THEN N'Cấp độ 2 (Chi tiết lỗi)'
        WHEN HintContent LIKE N'%[Hint Level 3]%' THEN N'Cấp độ 3 (Hướng dẫn giải)'
        ELSE N'Cấp độ 1 (Tự động)'
      END AS hintLevel,

      -- 2. Phân loại nội dung theo từ khóa có trong HintContent
      CASE 
        WHEN HintContent LIKE N'%LỖI BIÊN DỊCH%' OR HintContent LIKE N'%CS%' THEN N'Sửa lỗi Biên dịch & Cú pháp'
        WHEN HintContent LIKE N'%Wrong Answer%' OR HintContent LIKE N'%kết quả mong đợi%' THEN N'Sửa lỗi Logic & Sai Output'
        WHEN HintContent LIKE N'%công thức%' OR HintContent LIKE N'%toán học%' THEN N'Gợi ý Công thức & Thuật toán'
        ELSE N'Hướng dẫn & Điều kiện bài toán'
      END AS hintType,

      -- 3. Đếm số lượng
      COUNT(*) AS totalRequests

    FROM HINT_USAGE
    GROUP BY 
      CASE 
        WHEN HintContent LIKE N'%[Hint Level 1]%' THEN N'Cấp độ 1 (Gợi ý nhẹ)'
        WHEN HintContent LIKE N'%[Hint Level 2]%' THEN N'Cấp độ 2 (Chi tiết lỗi)'
        WHEN HintContent LIKE N'%[Hint Level 3]%' THEN N'Cấp độ 3 (Hướng dẫn giải)'
        ELSE N'Cấp độ 1 (Tự động)'
      END,
      CASE 
        WHEN HintContent LIKE N'%LỖI BIÊN DỊCH%' OR HintContent LIKE N'%CS%' THEN N'Sửa lỗi Biên dịch & Cú pháp'
        WHEN HintContent LIKE N'%Wrong Answer%' OR HintContent LIKE N'%kết quả mong đợi%' THEN N'Sửa lỗi Logic & Sai Output'
        WHEN HintContent LIKE N'%công thức%' OR HintContent LIKE N'%toán học%' THEN N'Gợi ý Công thức & Thuật toán'
        ELSE N'Hướng dẫn & Điều kiện bài toán'
      END
    ORDER BY totalRequests DESC
  `);

    return result.recordset;
  }

  async getMailNotifications() {
  const pool = await poolPromise;
  const result = await pool.request().query(queries.GET_MAILS_NOTIFICATIONS);
  const rawRows = result.recordset;

  // Gom nhóm các dòng dữ liệu thành danh sách Mail gọn gàng
  const mailsMap = {};

  rawRows.forEach((row) => {
    if (!mailsMap[row.type]) {
      mailsMap[row.type] = {
        id: row.type === 'danger' ? 1 : row.type === 'warning' ? 2 : 3,
        type: row.type,
        title: row.title,
        time: "Hôm nay",
        data: []
      };
    }

    // Đẩy thông tin sinh viên vào thuộc tính data của Mail đó
    mailsMap[row.type].data.push({
      name: row.name,
      score: row.score,
      attempts: row.attempts,
      hints: row.hints,
      maxHint: row.maxHint
    });
  });

  return Object.values(mailsMap);
}
}

module.exports = new StatisticsRepository();
