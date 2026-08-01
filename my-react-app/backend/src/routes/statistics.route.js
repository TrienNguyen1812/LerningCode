const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statistics.controller");

// 1. Lấy chỉ số thống kê tổng quan
router.get("/overview", statisticsController.getOverview);

// 2. Lấy danh sách thắc mắc sinh viên hỏi AI nhiều nhất
router.get("/top-questions", statisticsController.getTopQuestions);

// 3. Lấy vấn đề bị hỏi nhiều nhất tại 1 bài tập cụ thể (như QuickSort Algorithm)
// Ví dụ: /api/statistics/problem-feedbacks?title=QuickSort Algorithm
router.get("/problem-feedbacks", statisticsController.getProblemFeedbacks);

// 4. Lấy Top bài tập sinh viên xin Hint AI nhiều nhất
router.get("/top-helped-problems", statisticsController.getTopHelpedProblems);

router.get("/top-hints", statisticsController.getTopHints);

router.get("/mails", statisticsController.getMails);

module.exports = router;