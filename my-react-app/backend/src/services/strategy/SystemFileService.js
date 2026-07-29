const systemFileRepository = require("../../repositories/systemFile.repository"); // Giả định repository của SystemFile
const FileProcessingContext = require("./FileProcessingContext");

class SystemFileService {
  constructor() {
    // Khởi tạo Strategy Context
    this.fileContext = new FileProcessingContext();
  }

  async getAllFiles() {
    return await systemFileRepository.getAllFiles();
  }

  /**
   * Tải file lên và xử lý qua Strategy Pattern
   */
  async saveUploadedFile(fileData) {
    if (!fileData) throw new Error("Dữ liệu file không hợp lệ!");

    // 1. Áp dụng Strategy Pattern để phân loại & xử lý thông tin file
    const fileMeta = this.fileContext.executeStrategy(fileData);

    // 2. Lưu thông tin file vào CSDL bảng SYSTEM_FILE
    const savedFile = await systemFileRepository.createFile({
      fileName: fileData.originalname,
      filePath: fileData.filename,
      fileType: fileData.mimetype,
      fileSize: fileData.size,
    });

    return {
      ...savedFile,
      metadata: fileMeta,
    };
  }
}

// Xuất ra Instance duy nhất (Vừa áp dụng Singleton cho Service, vừa chứa Strategy bên trong)
module.exports = new SystemFileService();