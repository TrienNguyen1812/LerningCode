// Import Singleton/Strategy Service tương ứng
const lessonService = require("../services/singleton/lesson.singleton");

class LessonController {
  /**
   * Lấy danh sách các bài học của một khóa học
   * GET /api/lessons/course/:courseId
   */
  async getLessonsByCourse(req, res) {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học (courseId) không hợp lệ!",
        });
      }

      const lessons = await lessonService.getLessonsByCourse(courseId);
      return res.status(200).json({
        success: true,
        data: lessons,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Lấy chi tiết một bài học theo ID
   * GET /api/lessons/:id
   */
  async getLessonById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã bài học (id) không hợp lệ!",
        });
      }

      // Gọi qua Service Singleton lấy chi tiết bài học (kèm file và bài tập)
      const lesson = await lessonService.getLessonById(id);

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy bài học có ID: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: lesson,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Tạo bài học mới và đính kèm danh sách file, bài tập (nếu có)
   * POST /api/lessons/course/:courseId
   */
  async createLesson(req, res) {
    try {
      const { courseId } = req.params;
      const { title, content, orderIndex, fileIds, problemIds } = req.body;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học (courseId) không hợp lệ!",
        });
      }

      if (!title || !title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tiêu đề bài học không được để trống!",
        });
      }

      const newLesson = await lessonService.createLessonWithFiles({
        title: title.trim(),
        content,
        orderIndex: orderIndex ? parseInt(orderIndex, 10) : 1,
        idCourse: parseInt(courseId, 10),
        fileIds: Array.isArray(fileIds) ? fileIds : [],
        problemIds: Array.isArray(problemIds) ? problemIds : [],
      });

      return res.status(201).json({
        success: true,
        message: "Tạo bài học thành công!",
        data: newLesson,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }
}

module.exports = new LessonController();