const statisticsRepository = require("../repositories/statistics.repository");

class StatisticsController {
  // GET /api/statistics/overview
  async getOverview(req, res) {
    try {
      const data = await statisticsRepository.getOverviewStats();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[STATISTICS ERROR] Overview:", error);
      return res.status(500).json({ success: false, message: "Lỗi thống kê tổng quan!", error: error.message });
    }
  }

  // GET /api/statistics/top-questions
  async getTopQuestions(req, res) {
    try {
      const data = await statisticsRepository.getTopAiQuestions();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[STATISTICS ERROR] Top Questions:", error);
      return res.status(500).json({ success: false, message: "Lỗi lấy danh sách thắc mắc phổ biến!", error: error.message });
    }
  }

  // GET /api/statistics/problem-feedbacks?idProblem=1  hoặc  ?title=QuickSort
  async getProblemFeedbacks(req, res) {
    try {
      const { idProblem, title } = req.query;

      const data = await statisticsRepository.getFeedbacksByProblem({
        idProblem,
        problemTitle: title,
      });

      return res.json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error) {
      console.error("[STATISTICS ERROR] Problem Feedbacks:", error);
      return res.status(500).json({ success: false, message: "Lỗi thống kê phản hồi theo bài tập!", error: error.message });
    }
  }

  // GET /api/statistics/top-helped-problems
  async getTopHelpedProblems(req, res) {
    try {
      const data = await statisticsRepository.getTopHelpedProblems();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[STATISTICS ERROR] Top Helped Problems:", error);
      return res.status(500).json({ success: false, message: "Lỗi thống kê top bài tập cần AI hỗ trợ!", error: error.message });
    }
  }

  // 🌟 BỔ SUNG: GET /api/statistics/top-hints
  async getTopHints(req, res) {
    try {
      const data = await statisticsRepository.getTopHints();
      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[STATISTICS ERROR] Top Hints:", error);
      return res.status(500).json({ success: false, message: "Lỗi thống kê top loại Hint được dùng!", error: error.message });
    }
  }

  async getMails(req, res) {
  try {
    const data = await statisticsRepository.getMailNotifications();
    return res.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    console.error("[STATISTICS ERROR] Mail Notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách thông báo!",
      error: error.message,
    });
  }
}
}

module.exports = new StatisticsController();