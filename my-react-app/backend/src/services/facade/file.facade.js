const fileRepository = require("../../repositories/file.repository");

class FileFacade {
  constructor() {
    this.SERVER_URL = "http://localhost:5000";
  }

  // Chuẩn hóa định dạng danh sách File trả về
  formatFiles(files) {
    return files.map((file) => ({
      id: file.IdFile.toString(),
      fileName: file.FileName,
      fileType: file.FileType,
      fileSize: file.FileSize,
      uploadedAt: file.UploadDateStr,
      path: `${this.SERVER_URL}/assets/files/${file.FilePath}`,
    }));
  }

  async getAllFiles() {
    const files = await fileRepository.getAllFiles();
    return this.formatFiles(files);
  }

  async getFilesByLesson(lessonId) {
    if (!lessonId) throw new Error("Mã bài học không hợp lệ.");
    const files = await fileRepository.getFilesByLessonId(lessonId);
    return this.formatFiles(files);
  }

  // Upload file mới và gắn trực tiếp vào bài học (nếu có lessonId)
  async uploadAndAttachFile({ fileName, filePath, fileType, fileSize, lessonId }) {
    if (!fileName || !filePath) throw new Error("Thông tin tập tin không hợp lệ.");

    const newFileId = await fileRepository.createFile(fileName, filePath, fileType, fileSize);

    if (lessonId) {
      await fileRepository.attachFileToLesson(lessonId, newFileId);
    }

    return newFileId;
  }

  async attachFileToLesson(lessonId, fileId) {
    if (!lessonId || !fileId) throw new Error("Mã bài học hoặc Mã file không đúng.");
    return await fileRepository.attachFileToLesson(lessonId, fileId);
  }

  async detachFileFromLesson(lessonId, fileId) {
    if (!lessonId || !fileId) throw new Error("Mã bài học hoặc Mã file không đúng.");
    return await fileRepository.detachFileFromLesson(lessonId, fileId);
  }

  async deleteFile(fileId) {
    if (!fileId) throw new Error("Yêu cầu mã file để xóa.");
    return await fileRepository.deleteFile(fileId);
  }
}

module.exports = FileFacade;