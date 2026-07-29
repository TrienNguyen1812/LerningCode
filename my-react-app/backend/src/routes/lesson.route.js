const express = require("express");
const router = express.Router();
const lessonController = require("../controllers/lesson.controller");

// Do tiền tố server.js là "/api" nên phải thêm "/lessons" vào đây
router.get("/lessons/course/:courseId", lessonController.getLessonsByCourse);
router.get("/lessons/:id", lessonController.getLessonById);
router.post("/lessons/course/:courseId", lessonController.createLesson);

module.exports = router;