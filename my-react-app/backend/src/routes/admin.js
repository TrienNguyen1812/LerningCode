const express = require("express");
const router = express.Router();

const adminController = require("../controllers/dashboard.controller");
const instructorController = require("../controllers/instructor.controller");
const studentController = require("../controllers/student.controller");

// Thống kê Dashboard
router.get("/dashboard", adminController.getDashboardData);

// Quản lý Giảng viên
router.get("/instructors", instructorController.getInstructors);

// Quản lý Học viên
router.get("/students", studentController.getStudents);

module.exports = router;