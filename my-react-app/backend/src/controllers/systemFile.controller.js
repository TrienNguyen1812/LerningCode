// Import SystemFileService (đã kết hợp Strategy Pattern)
const systemFileService = require("../services/strategy/SystemFileService");

class SystemFileController {
  /**
   * Lấy toàn bộ danh sách file trong hệ thống
   * GET /api/files
   */
  async getAllFiles(req, res) {
    try {
      const files = await systemFileService.getAllFiles();
      return res.status(200).json({
        success: true,
        data: files,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Upload file mới lên server và lưu vào SYSTEM_FILE
   * POST /api/files/upload
   */
  async uploadFile(req, res) {
    try {
      // req.file được sinh ra bởi upload.middleware.js (Multer)
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chọn tệp cần tải lên!",
        });
      }

      // Đưa thông tin file qua Service xử lý Strategy và lưu DB
      const savedFile = await systemFileService.saveUploadedFile(req.file);

      return res.status(201).json({
        success: true,
        message: "Tải tệp lên hệ thống thành công!",
        data: savedFile,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }
}

module.exports = new SystemFileController();