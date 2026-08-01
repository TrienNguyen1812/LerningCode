const studentStatsRepository = require("../repositories/studentStats.repository");

class StudentStatsController {
  async getStats(req, res) {
    try {
      const idUser = req.params.idUser || req.query.idUser;

      if (!idUser || idUser === "undefined") {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin idUser hợp lệ!",
        });
      }

      const rawStats = await studentStatsRepository.getStudentStatsByUserId(idUser);

      // Chuyển đổi an toàn giá trị float trả về từ SQL
      const avgImp = parseFloat(rawStats?.avgImprovement ?? 0).toFixed(1);
      const avgSc = parseFloat(rawStats?.avgScore ?? 0).toFixed(1);

      return res.status(200).json({
        success: true,
        data: {
          totalItems: rawStats?.totalItems || 0,
          avgImprovement: avgImp,
          avgScore: avgSc,
          completedItems: rawStats?.completedItems || 0,
        },
      });
    } catch (error) {
      console.error("Lỗi khi truy vấn thống kê sinh viên:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ nội bộ!",
        error: error.message,
      });
    }
  }
}

module.exports = new StudentStatsController();