const submissionService = require("../services/submissionService");
const SubmissionModel = require("../models/Submission");

class SubmissionController {
  async submit(req, res) {
    try {
      // 1. Chuẩn hóa payload đầu vào, ép kiểu an toàn cho ID
      const payload = {
        ...req.body,
        idUser: Number(req.body.idUser || req.body.IdUser),
        idProblem: Number(req.body.idProblem || req.body.IdProblem),
        durationInSeconds: Number(req.body.durationInSeconds || 0)
      };

      const submissionData = new SubmissionModel(payload);

      // 2. Chạy dịch vụ chấm bài
      // Note: SubmissionService đã tự động chấm điểm & cập nhật USER_PROBLEM_PROGRESS chuẩn xác.
      const result = await submissionService.processSubmission(submissionData);

      // 3. Trả kết quả hoàn chỉnh về cho Frontend React
      return res.json({
        success: true,
        message: "Chấm bài hoàn tất!",
        data: result,
      });
    } catch (error) {
      console.error("SUBMIT CONTROLLER ERROR:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Lỗi hệ thống khi chấm bài.",
      });
    }
  }
}

module.exports = new SubmissionController();