const express = require("express");
const router = express.Router();
const systemFileController = require("../controllers/systemFile.controller");
const upload = require("../middleware/upload.middleware");

// Lấy danh sách toàn bộ file trong hệ thống
router.get("/", systemFileController.getAllFiles);

// Upload 1 file mới lên hệ thống
router.post("/upload", upload.single("file"), systemFileController.uploadFile);

module.exports = router;