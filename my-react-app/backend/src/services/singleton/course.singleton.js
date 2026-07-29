const CourseFacade = require("../facade/course.facade");

class CourseServiceSingleton {
  // Biến nội bộ lưu giữ thực thể duy nhất (Instance)
  static #instance = null;

  // Khóa hàm constructor lại để ngăn chặn việc sử dụng từ khóa `new` từ bên ngoài
  constructor() {
    if (CourseServiceSingleton.#instance) {
      throw new Error(
        "Không thể khởi tạo! Hãy sử dụng phương thức getInstance().",
      );
    }
  }

  /**
   * Điểm truy cập toàn cục để lấy thực thể duy nhất (Global Access Point)
   * @returns {CourseFacade}
   */
  static getInstance() {
    // Cơ chế Lazy Initialization: Nếu chưa có thực thể nào, tiến hành tạo mới một lần duy nhất
    if (!CourseServiceSingleton.#instance) {
      CourseServiceSingleton.#instance = new CourseFacade();
    }
    return CourseServiceSingleton.#instance;
  }
}

// Xuất bản phương thức tĩnh getInstance ra toàn hệ thống
module.exports = CourseServiceSingleton.getInstance();
