// 1. Require đầy đủ các Repositories
const courseRepository = require("../../repositories/course.repository");
const userRepository = require("../../repositories/user.repository");
const enrollRepository = require("../../repositories/enroll.repository");

// 2. Require Strategy Pattern
const { DeltaEnrollmentStrategy } = require("../strategy/enrollment.strategy");

class CourseFacade {
  constructor() {
    // Khởi tạo Strategy xử lý gán học viên
    this.enrollmentStrategy = new DeltaEnrollmentStrategy();
  }

  /**
   * Subsystem Logic: Truy vấn dữ liệu thô và chuyển đổi (Map) sang JSON chuẩn cho React
   */
  async getFormattedCourses() {
    const courses = await courseRepository.getAllCourses();

    const SERVER_URL = "http://localhost:5000";

    return courses.map((course) => {
      // Xử lý lấy đường dẫn ảnh chính xác
      let imageUrl =
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500"; // Ảnh mặc định nếu không có

      if (course.Thumbnail) {
        if (course.Thumbnail.startsWith("http")) {
          imageUrl = course.Thumbnail;
        } else if (course.Thumbnail.startsWith("/assets")) {
          imageUrl = `${SERVER_URL}${course.Thumbnail}`;
        } else {
          imageUrl = `${SERVER_URL}/assets/image/${course.Thumbnail}`;
        }
      }

      return {
        id: course.IdCourse.toString(),
        name: course.CourseName,
        description: course.Description || "",
        updatedAt: course.CreateDateStr,
        thumbnail: imageUrl,
        instructor: "Giảng viên",
        category: "Technology",
        enrolled: course.EnrolledCount
          ? course.EnrolledCount.toLocaleString()
          : "0",
        status: "Published",
      };
    });
  }

  async createNewCourse({ courseName, description, filename }) {
    if (!courseName || courseName.trim() === "") {
      throw new Error("Tên khóa học không được phép để trống.");
    }

    // Truyền đủ (courseName, description, filename) vào Repository
    return await courseRepository.createCourse(
      courseName,
      description,
      filename,
    );
  }

  async getCourseDetail(id) {
    try {
      if (!id) throw new Error("Mã khóa học không được để trống.");

      // 🌟 Gọi hàm vừa viết trong Repository
      const course = await courseRepository.getCourseById(id);

      if (!course) return null;

      // Xử lý lấy đường dẫn ảnh chính xác
      const SERVER_URL = "http://localhost:5000";
      let imageUrl = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";

      if (course.Thumbnail) {
        if (course.Thumbnail.startsWith("http")) {
          imageUrl = course.Thumbnail;
        } else if (course.Thumbnail.startsWith("/assets")) {
          imageUrl = `${SERVER_URL}${course.Thumbnail}`;
        } else {
          imageUrl = `${SERVER_URL}/assets/image/${course.Thumbnail}`;
        }
      }

      // Map lại đúng format JSON trả về cho React Frontend
      return {
        id: course.IdCourse.toString(),
        name: course.CourseName,
        description: course.Description || "",
        updatedAt: course.CreateDateStr,
        thumbnail: imageUrl,
        instructor: "Giảng viên",
        category: "Technology",
        enrolled: course.EnrolledCount ? course.EnrolledCount.toLocaleString() : "0",
        status: "Published",
      };
    } catch (error) {
      throw new Error("Lỗi Facade (getCourseDetail): " + error.message);
    }
  }

  async updateExistingCourse(id, { courseName, description, filename }) {
    if (!id) throw new Error("Yêu cầu mã khóa học (IdCourse) để cập nhật.");
    if (!courseName || courseName.trim() === "") {
      throw new Error("Tên khóa học không được trống khi cập nhật.");
    }

    return await courseRepository.updateCourse(
      id,
      courseName,
      description,
      filename,
    );
  }

  /**
   * Subsystem Logic: Thực thi chu trình xóa liên tầng (Cascade Delete) an toàn
   */
  async deleteExistingCourse(id) {
    if (!id) throw new Error("Thiếu ID khóa học cần xóa.");
    return await courseRepository.deleteCourse(id);
  }

  async getUsersForAssignment(courseId) {
    if (!courseId) {
      throw new Error("Mã khóa học không hợp lệ!");
    }
    return await userRepository.getUsersWithEnrollStatus(courseId);
  }

  /**
   * Xử lý gán / hủy gán học viên vào khóa học bằng Strategy Pattern
   */
  async assignUsersToCourse(courseId, selectedUserIds) {
    if (!courseId) {
      throw new Error("Mã khóa học không hợp lệ!");
    }

    // 1. Lấy danh sách ID đã Enroll hiện tại từ CSDL
    const currentEnrolledIds = await enrollRepository.getEnrolledUserIds(courseId);

    // 2. Tính toán danh sách chênh lệch thông qua Strategy Pattern
    const { userIdsToAdd, userIdsToRemove } = this.enrollmentStrategy.execute(
      currentEnrolledIds,
      selectedUserIds
    );

    // 3. Thực thi lưu/xóa xuống CSDL
    await enrollRepository.syncEnrollments(courseId, userIdsToAdd, userIdsToRemove);

    return {
      addedCount: userIdsToAdd.length,
      removedCount: userIdsToRemove.length,
      totalAssigned: selectedUserIds.length,
    };
  }
}

// Xuất bản Class Facade thô (chưa khởi tạo) để Singleton Container nạp vào
module.exports = CourseFacade;