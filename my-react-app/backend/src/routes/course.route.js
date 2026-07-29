const express = require("express");
const router = express.Router();
const courseController = require("../controllers/course.controller");
const upload = require("../middleware/upload.middleware");

// Cấu hình các Endpoint định tuyến
router.get("/", courseController.getAllCourses);

// Lấy chi tiết 1 khóa học theo ID
router.get("/:id", courseController.getCourseById);

// Nhận vào key body tên 'thumbnail' chứa file chọn từ máy
router.post("/", upload.single("thumbnail"), courseController.createCourse);
router.put("/:id", upload.single("thumbnail"), courseController.updateCourse);

router.delete("/:id", courseController.deleteCourse);

router.get("/:id/users", courseController.getCourseUsers);
router.post("/:id/assign", courseController.assignUsers);

module.exports = router;