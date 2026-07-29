const express = require("express");
const router = express.Router();
const judgeController = require("../controllers/judge.controller");

// Đã tách toàn bộ logic phức tạp sang Controller
router.post("/execute", (req, res) => judgeController.executeCode(req, res));

router.post("/ai-feedback", judgeController.getAiFeedback);

module.exports = router;