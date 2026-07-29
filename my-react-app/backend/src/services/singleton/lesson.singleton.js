const lessonRepository = require("../../repositories/lesson.repository");

class LessonService {
  async getLessonsByCourse(idCourse) {
    if (!idCourse) throw new Error("IdCourse không hợp lệ!");

    // 1. Lấy danh sách các bài học cơ bản
    const lessons = await lessonRepository.getLessonsByCourseId(idCourse);

    if (!lessons || lessons.length === 0) return [];

    // 2. Lấy đầy đủ chi tiết (kèm File và Bài tập) cho từng bài học
    const fullLessons = await Promise.all(
      lessons.map(async (lesson) => {
        const lessonId = lesson.id || lesson.IdLesson;
        return await lessonRepository.getLessonById(lessonId);
      })
    );

    return fullLessons;
  }

  async getLessonById(idLesson) {
    if (!idLesson) throw new Error("IdLesson không hợp lệ!");
    return await lessonRepository.getLessonById(idLesson);
  }

  async createLessonWithFiles({ title, content, orderIndex, idCourse, fileIds = [], problemIds = [] }) {
    if (!title || !title.trim()) {
      throw new Error("Tiêu đề bài học không được để trống!");
    }

    // 1. Tạo Lesson mới
    const lesson = await lessonRepository.createLesson({
      title: title.trim(),
      content,
      orderIndex,
      idCourse,
    });

    const lessonId = lesson?.IdLesson || lesson?.id || lesson?.Id || lesson?.ID;

    if (!lessonId) {
      throw new Error("Không thể lấy ID bài học sau khi tạo!");
    }

    // 2. Lưu vào LESSON_FILE
    if (Array.isArray(fileIds) && fileIds.length > 0) {
      for (const item of fileIds) {
        const cleanFileId = typeof item === "object" ? (item.fileId || item.id || item.IdFile) : item;
        if (cleanFileId) {
          await lessonRepository.attachFileToLesson(Number(lessonId), Number(cleanFileId));
        }
      }
    }

    // 3. Lưu vào LESSON_PROBLEM
    if (Array.isArray(problemIds) && problemIds.length > 0) {
      for (const item of problemIds) {
        const cleanProblemId = typeof item === "object" ? (item.problemId || item.id || item.IdProblem) : item;
        if (cleanProblemId) {
          await lessonRepository.attachProblemToLesson(Number(lessonId), Number(cleanProblemId));
        }
      }
    }

    return await lessonRepository.getLessonById(lessonId);
  }
}

// Xuất ra một instance duy nhất (Singleton Pattern)
module.exports = new LessonService();