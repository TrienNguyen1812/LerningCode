const path = require("path"); // 1. Import thêm module path có sẵn của Node.js
const fileService = require("../services/singleton/file.singleton");

class FileController {
  // GET /api/files - Lấy toàn bộ kho file
  async getAllFiles(req, res) {
    try {
      const data = await fileService.getAllFiles();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/files/lesson/:lessonId - Lấy danh sách file đính kèm của 1 bài học
  async getFilesByLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const data = await fileService.getFilesByLesson(lessonId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/files/upload - Upload file mới (Có thể truyền thêm body: lessonId)
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Chưa chọn file để upload!" });
      }

      const { filename, size } = req.file;
      const { lessonId } = req.body;

      // 1. SỬA LỖI FONT TIẾNG VIỆT (Latin1 -> UTF-8)
      const correctOriginalName = Buffer.from(
        req.file.originalname,
        "latin1",
      ).toString("utf8");

      // 2. LẤY ĐUÔI FILE NGẮN GỌN (vd: "docx")
      const fileExt = path.extname(correctOriginalName).slice(1).toLowerCase();

      // 3. SỬA LỖI LẶP ĐUÔI (.docxdocx)
      // Tách lấy tên file không chứa đuôi extension (vd: "Tuần4")
      const cleanFileName = path.parse(correctOriginalName).name;

      const fileId = await fileService.uploadAndAttachFile({
        fileName: cleanFileName, // Hoặc nếu muốn lưu cả extension chuẩn: `${cleanFileName}.${fileExt}`
        filePath: filename,
        fileType: fileExt || "unknown",
        fileSize: size,
        lessonId: lessonId || null,
      });

      res.status(201).json({
        success: true,
        message: "Upload file thành công!",
        fileId,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/files/attach - Gắn file sẵn có vào bài học
  async attachToLesson(req, res) {
    try {
      const { lessonId, fileId } = req.body;
      await fileService.attachFileToLesson(lessonId, fileId);
      res
        .status(200)
        .json({
          success: true,
          message: "Đính kèm file vào bài học thành công!",
        });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/files/detach - Gỡ file khỏi bài học
  async detachFromLesson(req, res) {
    try {
      const { lessonId, fileId } = req.body;
      await fileService.detachFileFromLesson(lessonId, fileId);
      res
        .status(200)
        .json({ success: true, message: "Gỡ file khỏi bài học thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/files/:id - Xóa file khỏi hệ thống
  async deleteFile(req, res) {
    try {
      const { id } = req.params;
      await fileService.deleteFile(id);
      res
        .status(200)
        .json({ success: true, message: "Xóa file khỏi hệ thống thành công!" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new FileController();
