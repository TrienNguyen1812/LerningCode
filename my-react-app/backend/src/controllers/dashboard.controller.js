const dashboardRepository = require("../repositories/dashboard.repository");
const DashboardModel = require("../models/dashboard");

class AdminController {
  async getDashboardData(req, res) {
    try {
      // 1. Nhận bộ lọc từ Frontend (Daily/Weekly/Monthly hoặc Courses/Problems/Quizzes)
      const { timeframe = "Daily", resource = "Courses" } = req.query;

      // 2. Lấy dữ liệu thô từ Repository truyền bộ lọc vào
      const rawData = await dashboardRepository.getDashboardMetrics({
        timeframe,
        resource,
      });

      // 3. Định dạng lại dữ liệu thông qua Model
      const formattedData = DashboardModel.formatDashboardData(rawData);

      // 4. Ép cấu trúc phản hồi khớp hoàn toàn với Frontend UI
      const finalData = {
        ...formattedData,
        
        // Các chỉ số đếm tổng quan
        activeLearnersCount: formattedData.activeLearnersCount || 0,
        completionRate: formattedData.completionRate || "0%",

        // Các thẻ Metrics chính bên trái
        metrics: [
          {
            title: "Total Students",
            value: formattedData.totalStudents || "0",
            trend: formattedData.studentsTrend || "12%",
            isUp: formattedData.isStudentsUp ?? true,
          },
          {
            title: "Active Courses",
            value: formattedData.totalCourses || "0",
            trend: formattedData.coursesTrend || "5%",
            isUp: formattedData.isCoursesUp ?? true,
          },
          {
            title: "Total Submissions",
            value: formattedData.totalSubmissions || "0",
            trend: formattedData.submissionsTrend || "3%",
            isUp: formattedData.isSubmissionsUp ?? false,
          },
          {
            title: "Accepted Rate",
            value: formattedData.passRate || "0%",
            trend: formattedData.passRateTrend || "8%",
            isUp: formattedData.isPassRateUp ?? true,
          },
        ],

        // Mảng biểu đồ kết hợp 2 chỉ số (Active Learners & Completion Rate)
        enrollmentChart: formattedData.enrollmentChart || [],
      };

      return res.status(200).json({
        success: true,
        message: "Lấy dữ liệu Dashboard thành công",
        data: finalData,
      });
    } catch (error) {
      console.error("Lỗi tại AdminController - getDashboardData:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi máy chủ nội bộ khi lấy dữ liệu Dashboard!",
        error: error.message,
      });
    }
  }
}

module.exports = new AdminController();