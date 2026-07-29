const express = require("express");
const router = express.Router();
const fileController = require("../controllers/file.controller");
const upload = require("../middleware/fileUpload.middleware"); // Middleware Multer

// Quản lý Kho File chung
router.get("/", (req, res) => fileController.getAllFiles(req, res));
router.post("/upload", upload.single("file"), (req, res) => fileController.uploadFile(req, res));
router.delete("/:id", (req, res) => fileController.deleteFile(req, res));

// Quản lý đính kèm File với Bài học (Quan hệ N-N)
router.get("/lesson/:lessonId", (req, res) => fileController.getFilesByLesson(req, res));
router.post("/attach", (req, res) => fileController.attachToLesson(req, res));
router.delete("/detach/remove", (req, res) => fileController.detachFromLesson(req, res));

module.exports = router;