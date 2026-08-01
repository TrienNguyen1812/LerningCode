const express = require("express");
const submissionController = require("../controllers/submission.controller");
const validateSubmission = require("../middleware/validateSubmission.middleware");
const aiController = require("../controllers/ai.controller");

const router = express.Router();

// POST /api/submissions/submit
router.post("/submit", validateSubmission, (req, res) => submissionController.submit(req, res));

router.post("/explain-score", aiController.explainScore);

module.exports = router;