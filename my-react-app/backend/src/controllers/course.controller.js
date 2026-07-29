const courseService = require("../services/singleton/course.singleton");
const lessonService = require("../services/singleton/lesson.singleton");

class CourseController {
  /**
   * Lấy danh sách khóa học
   */
  async getAllCourses(req, res) {
    try {
      const data = await courseService.getFormattedCourses();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Lấy chi tiết 1 khóa học theo ID
   */
  async getCourseById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học không hợp lệ!",
        });
      }

      const course = await courseService.getCourseDetail(id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy khóa học có ID: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        data: course,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Tạo mới khóa học + Bài học (LESSON) + File (LESSON_FILE) + Bài tập (LESSON_PROBLEM)
   */
  async createCourse(req, res) {
    try {
      // 1. Lấy đầy đủ dữ liệu từ req.body
      const { courseName, description, sections } = req.body;
      const filename = req.file ? req.file.filename : null;

      // Validate cơ bản
      if (!courseName || !courseName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Tên khóa học không được để trống!",
        });
      }

      // 2. Tạo Course trước để lấy IdCourse
      const newCourse = await courseService.createNewCourse({
        courseName: courseName.trim(),
        description,
        filename,
      });

      const courseId = newCourse?.IdCourse ?? newCourse?.id;

      // 3. Nếu có dữ liệu bài học (sections), tiến hành chèn LESSON, LESSON_FILE & LESSON_PROBLEM
      if (sections && courseId) {
        const parsedSections =
          typeof sections === "string" ? JSON.parse(sections) : sections;

        if (Array.isArray(parsedSections)) {
          for (let i = 0; i < parsedSections.length; i++) {
            const sec = parsedSections[i];

            // Gom các block dạng 'text' thành nội dung cho LESSON.Content
            const textContent = (sec.blocks || [])
              .filter((b) => b.type === "text")
              .map((b) => b.value)
              .join("<br/>");

            // Lọc các File ID
            const fileIds =
              sec.fileIds ||
              (sec.blocks || [])
                .filter((b) => b.fileId || b.IdFile)
                .map((b) => b.fileId || b.IdFile);

            // Lọc các Problem ID
            const problemIds =
              sec.problemIds ||
              (sec.blocks || [])
                .filter((b) => b.type === "problem" || b.problemId || b.IdProblem)
                .map((b) => b.problemId || b.IdProblem || b.id)
                .filter(Boolean);

            // Gọi LessonService để lưu Bài học, File đính kèm và Bài tập liên kết
            await lessonService.createLessonWithFiles({
              title: sec.title || `Bài ${i + 1}`,
              content: textContent,
              orderIndex: sec.orderIndex || sec.order || i + 1,
              idCourse: courseId,
              fileIds: fileIds,
              problemIds: problemIds,
            });
          }
        }
      }

      return res.status(201).json({
        success: true,
        message: "Thêm khóa học và bài học thành công!",
        data: newCourse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Cập nhật khóa học
   */
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const { courseName, description } = req.body;
      const filename = req.file ? req.file.filename : null;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học không hợp lệ!",
        });
      }

      await courseService.updateExistingCourse(id, {
        courseName: courseName ? courseName.trim() : courseName,
        description,
        filename,
      });

      return res.status(200).json({
        success: true,
        message: "Cập nhật khóa học thành công!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Xóa khóa học
   */
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học không hợp lệ!",
        });
      }

      await courseService.deleteExistingCourse(id);
      return res.status(200).json({
        success: true,
        message: "Xóa khóa học thành công!",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Lấy danh sách học viên của khóa học
   */
  async getCourseUsers(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học không hợp lệ!",
        });
      }

      const users = await courseService.getUsersForAssignment(id);

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }

  /**
   * Cập nhật danh sách học viên gán vào khóa học
   */
  async assignUsers(req, res) {
    try {
      const { id } = req.params;
      const { userIds } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Mã khóa học không hợp lệ!",
        });
      }

      if (!Array.isArray(userIds)) {
        return res.status(400).json({
          success: false,
          message: "Danh sách userIds phải là dạng mảng!",
        });
      }

      const result = await courseService.assignUsersToCourse(id, userIds);

      return res.status(200).json({
        success: true,
        message: "Cập nhật danh sách học viên thành công!",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi Hệ thống: " + error.message,
      });
    }
  }
}

module.exports = new CourseController();