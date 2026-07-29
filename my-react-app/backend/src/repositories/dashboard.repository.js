const { poolPromise } = require("../config/db");

class DashboardRepository {
  async getDashboardMetrics() {
    try {
      const pool = await poolPromise;

      // Query 1: Số liệu tổng quan (Đã thêm totalProblems)
      const metricsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM USERS WHERE Role = N'sinh viên') AS totalStudents,
          (SELECT COUNT(*) FROM COURSE) AS totalCourses,
          (SELECT COUNT(*) FROM PROBLEM) AS totalProblems,
          (SELECT COUNT(*) FROM SUBMISSION) AS totalSubmissions,
          (SELECT COUNT(*) FROM SUBMISSION WHERE Status = 'Accepted') AS successfulSubmissions
      `;

      // Query 2: Thống kê submission 6 tháng gần nhất
      const chartQuery = `
        SELECT 
          FORMAT(SubmitDate, 'MM/yyyy') AS monthYear,
          COUNT(*) AS count
        FROM SUBMISSION
        WHERE SubmitDate >= DATEADD(MONTH, -5, GETDATE())
        GROUP BY FORMAT(SubmitDate, 'MM/yyyy'), YEAR(SubmitDate), MONTH(SubmitDate)
        ORDER BY YEAR(SubmitDate) ASC, MONTH(SubmitDate) ASC
      `;

      // Query 3: Top 5 bài tập phổ biến nhất
      const topProblemsQuery = `
        SELECT TOP 5
          p.Title AS title,
          COUNT(s.IdSubmission) AS submissionsCount
        FROM PROBLEM p
        LEFT JOIN SUBMISSION s ON p.IdProblem = s.IdProblem
        GROUP BY p.IdProblem, p.Title
        ORDER BY submissionsCount DESC
      `;

      // Query 4: 5 lượt nộp bài mới nhất
      const recentSubmissionsQuery = `
        SELECT TOP 5
          u.FullName AS studentName,
          p.Title AS problemTitle,
          s.Language AS language,
          s.Status AS status,
          FORMAT(s.SubmitDate, 'dd/MM/yyyy HH:mm') AS submitDate
        FROM SUBMISSION s
        JOIN USERS u ON s.IdUser = u.IdUser
        JOIN PROBLEM p ON s.IdProblem = p.IdProblem
        ORDER BY s.SubmitDate DESC
      `;

      // Chạy song song 4 truy vấn
      const [metricsRes, chartRes, topProblemsRes, recentRes] = await Promise.all([
        pool.request().query(metricsQuery),
        pool.request().query(chartQuery),
        pool.request().query(topProblemsQuery),
        pool.request().query(recentSubmissionsQuery),
      ]);

      return {
        metricsRaw: metricsRes.recordset[0] || {},
        chartRaw: chartRes.recordset || [],
        topProblemsRaw: topProblemsRes.recordset || [],
        recentSubmissionsRaw: recentRes.recordset || [],
      };
    } catch (error) {
      console.error("Lỗi truy vấn CSDL tại DashboardRepository:", error);
      throw error;
    }
  }
}

module.exports = new DashboardRepository();