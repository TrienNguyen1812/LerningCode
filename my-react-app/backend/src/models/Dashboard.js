class DashboardModel {
  static formatDashboardData({ metricsRaw, chartRaw, topProblemsRaw, recentSubmissionsRaw }) {
    const totalSubmissions = metricsRaw?.totalSubmissions || 0;
    const successfulSubmissions = metricsRaw?.successfulSubmissions || 0;

    // 1. Lấy số lượng khóa học & bài tập -> Tính Tổng Contents
    const totalCourses = metricsRaw?.totalCourses || 0;
    const totalProblems = metricsRaw?.totalProblems || 0;
    const totalQuizzes = metricsRaw?.totalQuizzes || 0; // Thêm Quizzes nếu có
    const totalContents = totalCourses + totalProblems + totalQuizzes;

    // Tính phần trăm cho Pie Chart phân bổ Content (Tránh lỗi chia cho 0)
    const coursePercent = totalContents > 0 ? Math.round((totalCourses / totalContents) * 100) : 0;
    const problemPercent = totalContents > 0 ? Math.round((totalProblems / totalContents) * 100) : 0;

    // 2. Tính tỷ lệ nộp bài thành công (% Pass Rate)
    const passRateCalc = totalSubmissions > 0 
      ? ((successfulSubmissions / totalSubmissions) * 100).toFixed(1) 
      : 0;

    // 3. Xử lý Biểu đồ 2 chỉ số: Active Learners & Completion Rate
    const safeChartRaw = Array.isArray(chartRaw) ? chartRaw : [];
    
    // Map dữ liệu mảng enrollmentChart cho Frontend
    const enrollmentChart = safeChartRaw.map((col) => {
      // Lấy số học viên hoạt động (Fallback từ count hoặc activeLearners)
      const active = Number(col.activeLearners ?? col.active ?? col.count ?? 0);
      
      // Lấy tỷ lệ hoàn thành % (Fallback tính toán dựa trên passRate hoặc ngẫu nhiên/cố định nếu DB chưa lưu)
      const completion = Number(
        col.completionRate ?? 
        col.completion ?? 
        (totalSubmissions > 0 ? Math.round((successfulSubmissions / totalSubmissions) * 100) : 0)
      );

      return {
        month: col.monthYear || col.label || col.month || "N/A",
        active,
        completion,
      };
    });

    // 4. Xử lý phần trăm progress bar cho Top Bài Tập
    const safeTopProblems = Array.isArray(topProblemsRaw) ? topProblemsRaw : [];
    const maxProblemSubmits = Math.max(...safeTopProblems.map((p) => p.submissionsCount || 0), 1);
    
    const topProblems = safeTopProblems.map((p) => ({
      title: p.title || "Untitled Problem",
      submissionsCount: p.submissionsCount || 0,
      percent: Math.round(((p.submissionsCount || 0) / maxProblemSubmits) * 100),
    }));

    // 5. Trả về object chuẩn hóa đầy đủ cho Frontend AdminApp & DashboardTab
    return {
      totalStudents: metricsRaw?.totalStudents || 0,
      totalCourses,
      totalProblems,
      totalContents,
      
      // Chỉ số tổng quan góc biểu đồ
      activeLearnersCount: metricsRaw?.activeLearnersCount || metricsRaw?.totalStudents || 0,
      completionRate: `${passRateCalc}%`,

      contentBreakdown: {
        courses: totalCourses,
        problems: totalProblems,
        quizzes: totalQuizzes,
        coursePercent,
        problemPercent,
      },
      totalSubmissions,
      passRate: `${passRateCalc}%`,

      // Mảng dữ liệu biểu đồ 2 chỉ số
      enrollmentChart,
      
      topProblems,
      recentActivity: Array.isArray(recentSubmissionsRaw) ? recentSubmissionsRaw : [],
    };
  }
}

module.exports = DashboardModel;