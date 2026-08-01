module.exports = {
  // 1. Thống kê tổng quan chỉ số trên Cards
  GET_OVERVIEW_STATS: `
    SELECT 
      (SELECT COUNT(*) FROM AI_FEEDBACK) AS totalAiFeedbacks,
      (SELECT COUNT(*) FROM HINT_USAGE) AS totalHintUsages,
      (SELECT COUNT(DISTINCT IdSubmission) FROM AI_FEEDBACK WHERE IdSubmission IS NOT NULL) AS totalSubmissionsAnalyzed,
      (SELECT COUNT(*) FROM SUBMISSION) AS totalSubmissions
  `,

  // 2. Thắc mắc / loại gợi ý AI được sinh viên hỏi nhiều nhất (Card 3)
  GET_TOP_AI_QUESTIONS: `
    SELECT 
      ISNULL(Suggestion, N'Hỏi đáp chung / Giải thích code') AS questionCategory,
      COUNT(*) AS totalRequests,
      MAX(CreatedDate) AS lastAskedAt
    FROM AI_FEEDBACK
    GROUP BY Suggestion
    ORDER BY totalRequests DESC
  `,

  // 3. Phân tích chi tiết thắc mắc theo 1 Bài tập cụ thể (Card 4)
  GET_PROBLEM_AI_FEEDBACKS: `
    SELECT 
      p.IdProblem,
      p.Title AS problemTitle,
      af.IdFeedback,
      af.Analysis_content AS aiAnalysis,
      af.Suggestion AS suggestion,
      af.CreatedDate AS askedDate,
      s.IdSubmission,
      s.IdUser,
      u.FullName AS studentName,
      u.Email AS studentEmail
    FROM AI_FEEDBACK af
    INNER JOIN SUBMISSION s ON af.IdSubmission = s.IdSubmission
    INNER JOIN PROBLEM p ON s.IdProblem = p.IdProblem
    INNER JOIN USERS u ON s.IdUser = u.IdUser
    WHERE (@idProblem IS NULL OR p.IdProblem = @idProblem)
      AND (@problemTitle IS NULL OR p.Title LIKE '%' + @problemTitle + '%')
    ORDER BY af.CreatedDate DESC
  `,

  // 4. Top các bài tập sinh viên bấm xin Hint (Trợ giúp AI) nhiều nhất (Card 1)
  GET_TOP_HELPED_PROBLEMS: `
    SELECT TOP 10
      p.IdProblem,
      p.Title AS problemTitle,
      p.Difficulty AS difficulty,
      COUNT(hu.IdProblem) AS totalHintsUsed,
      COUNT(DISTINCT hu.IdUser) AS totalStudentsAsking
    FROM HINT_USAGE hu
    INNER JOIN PROBLEM p ON hu.IdProblem = p.IdProblem
    GROUP BY p.IdProblem, p.Title, p.Difficulty
    ORDER BY totalHintsUsed DESC
  `,

  // 5. 🌟 ĐÃ FIX LỖI: Sửa s.Score -> s.FinalScore & hu.IdHintUsage -> hu.IdHint
  GET_MAILS_NOTIFICATIONS: `
  -- 1. Nhóm Cần trợ giúp / Can thiệp (Điểm thấp < 5 HOẶC nộp >= 2 lần mà điểm chưa cao)
  SELECT 
    'danger' AS type,
    N'Cảnh báo: Sinh viên gặp khó khăn & điểm thấp' AS title,
    u.FullName AS name,
    ISNULL(MAX(s.FinalScore), 0) AS score,
    COUNT(DISTINCT s.IdSubmission) AS attempts,
    COUNT(DISTINCT hu.IdHint) AS hints,
    5 AS maxHint
  FROM USERS u
  INNER JOIN SUBMISSION s ON u.IdUser = s.IdUser
  LEFT JOIN HINT_USAGE hu ON u.IdUser = hu.IdUser
  WHERE u.Role = N'sinh viên'
  GROUP BY u.IdUser, u.FullName
  HAVING MAX(s.FinalScore) < 5 OR (COUNT(DISTINCT s.IdSubmission) >= 2 AND MAX(s.FinalScore) < 7)

  UNION ALL

  -- 2. Nhóm Lạm dụng AI (Bấm Hint từ 2 lần trở lên để dễ bắt dữ liệu test)
  SELECT 
    'warning' AS type,
    N'Cảnh báo: Sinh viên có dấu hiệu lạm dụng Hint AI' AS title,
    u.FullName AS name,
    ISNULL(MAX(s.FinalScore), 0) AS score,
    COUNT(DISTINCT s.IdSubmission) AS attempts,
    COUNT(DISTINCT hu.IdHint) AS hints,
    5 AS maxHint
  FROM USERS u
  INNER JOIN HINT_USAGE hu ON u.IdUser = hu.IdUser
  LEFT JOIN SUBMISSION s ON u.IdUser = s.IdUser
  WHERE u.Role = N'sinh viên'
  GROUP BY u.IdUser, u.FullName
  HAVING COUNT(DISTINCT hu.IdHint) >= 2

  UNION ALL

  -- 3. Nhóm Tiến bộ / Kết quả tốt (Điểm >= 7)
  SELECT 
    'success' AS type,
    N'Báo cáo: Danh sách sinh viên đạt kết quả tốt' AS title,
    u.FullName AS name,
    ISNULL(MAX(s.FinalScore), 0) AS score,
    COUNT(DISTINCT s.IdSubmission) AS attempts,
    COUNT(DISTINCT hu.IdHint) AS hints,
    5 AS maxHint
  FROM USERS u
  INNER JOIN SUBMISSION s ON u.IdUser = s.IdUser
  LEFT JOIN HINT_USAGE hu ON u.IdUser = hu.IdUser
  WHERE u.Role = N'sinh viên'
  GROUP BY u.IdUser, u.FullName
  HAVING MAX(s.FinalScore) >= 7
`
};