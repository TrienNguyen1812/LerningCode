class SubmissionModel {
  constructor(data = {}) {
    // 1. Lấy userId linh hoạt từ req.body (bất kể viết hoa hay thường) nhưng GIỮ NGUYÊN key 'idUser'
    const rawUserId = data.idUser ?? data.IdUser ?? data.userId ?? data.UserId;
    this.idUser = rawUserId ? Number(rawUserId) : null;

    // 2. Lấy problemId linh hoạt nhưng GIỮ NGUYÊN key 'idProblem' để Service đọc được
    const rawProblemId = data.idProblem ?? data.IdProblem ?? data.problemId ?? data.ProblemId;
    this.idProblem = rawProblemId ? Number(rawProblemId) : null;

    // 3. Các thông tin khác
    this.codeContent = data.codeContent ?? data.Code_content ?? data.code_content ?? "";
    this.language = data.language ?? data.Language ?? "csharp";
    this.durationInSeconds = Number(data.durationInSeconds ?? data.DurationInSeconds ?? 0);
  }
}

module.exports = SubmissionModel;