const express = require("express");
const router = express.Router();
const studentStatsController = require("../controllers/studentStats.controller");

// Route chính: truyền idUser qua URL parameter (Ví dụ: GET /api/stats/student/1)
router.get("/student/:idUser", studentStatsController.getStats);

// Route dự phòng: truyền idUser qua query string (Ví dụ: GET /api/stats/student?idUser=1)
router.get("/student", studentStatsController.getStats);

module.exports = router;