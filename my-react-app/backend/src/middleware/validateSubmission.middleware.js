const validateSubmission = (req, res, next) => {
  const { idUser, idProblem, codeContent, language } = req.body;

  if (!idUser || !idProblem || !codeContent || !language) {
    return res.status(400).json({
      success: false,
      message: "Thiếu các thông tin bắt buộc: idUser, idProblem, codeContent, language.",
    });
  }

  next();
};

module.exports = validateSubmission;