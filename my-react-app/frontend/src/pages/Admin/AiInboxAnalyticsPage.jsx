import { useState, useEffect } from "react";
import axios from "axios";
import MailList from "../../components/Admin/Inbox/MailList";
import MailDetail from "../../components/Admin/Inbox/MailDetail";

const API_BASE_URL = "http://localhost:5000/api/statistics";

export default function AiInboxAnalyticsPage() {
  const [selectedMail, setSelectedMail] = useState(null);
  const [loading, setLoading] = useState(true);

  // States lưu trữ dữ liệu thực từ Backend
  const [mails, setMails] = useState([]);
  const [topAIProblems, setTopAIProblems] = useState([]);
  const [topUsedHints, setTopUsedHints] = useState([]);
  const [topStudentQuestions, setTopStudentQuestions] = useState([]);

  // State lưu vấn đề bị hỏi nhiều nhất theo IdProblem
  const [problemIssueBreakdown, setProblemIssueBreakdown] = useState({
    idProblem: null,
    problemName: "",
    totalQuestions: 0,
    issues: [],
  });

  // 🚀 Gọi API Lấy Dữ Liệu Động Từ Backend
  useEffect(() => {
    const fetchDashboardStatistics = async () => {
      try {
        setLoading(true);

        // 1. Gọi đồng thời các API thống kê và API lấy danh sách Mails
        const [resHelpedProblems, resTopQuestions, resTopHints, resMails] =
          await Promise.all([
            axios
              .get(`${API_BASE_URL}/top-helped-problems`)
              .catch(() => ({ data: { success: false } })),
            axios
              .get(`${API_BASE_URL}/top-questions`)
              .catch(() => ({ data: { success: false } })),
            axios
              .get(`${API_BASE_URL}/top-hints`)
              .catch(() => ({ data: { success: false } })),
            axios
              .get(`${API_BASE_URL}/mails`) // 🌟 Đã thêm API lấy danh sách mails
              .catch(() => ({ data: { success: false } })),
          ]);

        let topProblemId = null;
        let topProblemTitle = "";

        // Xử lý Top bài tập dùng AI (Card 1)
        if (
          resHelpedProblems.data?.success &&
          Array.isArray(resHelpedProblems.data.data) &&
          resHelpedProblems.data.data.length > 0
        ) {
          const rawProblems = resHelpedProblems.data.data;
          const maxHints = Math.max(
            ...rawProblems.map((p) => p.totalHintsUsed || 1),
            1,
          );

          const formattedProblems = rawProblems.map((p) => ({
            idProblem: p.IdProblem,
            name: p.problemTitle,
            usageCount: p.totalHintsUsed,
            percentage: Math.round((p.totalHintsUsed / maxHints) * 100),
          }));
          setTopAIProblems(formattedProblems);

          topProblemId = rawProblems[0].IdProblem;
          topProblemTitle = rawProblems[0].problemTitle;
        } else {
          setTopAIProblems([]);
        }

        // 2. Xử lý Top Loại Hint được sử dụng (Card 2)
        if (resTopHints.data?.success && Array.isArray(resTopHints.data.data)) {
          const rawHints = resTopHints.data.data;
          const formattedHints = rawHints.map((h) => ({
            name: h.hintType || "Gợi ý chung",
            label: h.hintLevel || "Cấp độ 1",
            count: h.totalRequests || 0,
          }));
          setTopUsedHints(formattedHints);
        } else {
          setTopUsedHints([]);
        }

        // 3. Gọi API lấy vấn đề bị hỏi nhiều nhất ĐỘNG theo idProblem (Card 4)
        if (topProblemId) {
          try {
            const resFeedbacks = await axios.get(
              `${API_BASE_URL}/problem-feedbacks?idProblem=${topProblemId}`,
            );

            if (
              resFeedbacks.data?.success &&
              Array.isArray(resFeedbacks.data.data)
            ) {
              const rawFeedbacks = resFeedbacks.data.data;
              const total =
                resFeedbacks.data.total || rawFeedbacks.length || 0;

              if (total > 0) {
                const issuesGrouped = rawFeedbacks.reduce((acc, curr) => {
                  const issueKey = curr.suggestion || "Thắc mắc chung";
                  acc[issueKey] = (acc[issueKey] || 0) + 1;
                  return acc;
                }, {});

                const formattedIssues = Object.keys(issuesGrouped).map(
                  (key) => ({
                    issue: key,
                    count: issuesGrouped[key],
                    percent: Math.round((issuesGrouped[key] / total) * 100),
                  }),
                );

                setProblemIssueBreakdown({
                  idProblem: topProblemId,
                  problemName: topProblemTitle,
                  totalQuestions: total,
                  issues: formattedIssues,
                });
              } else {
                setProblemIssueBreakdown({
                  idProblem: topProblemId,
                  problemName: topProblemTitle,
                  totalQuestions: 0,
                  issues: [],
                });
              }
            }
          } catch (err) {
            console.error("Lỗi lấy chi tiết phản hồi bài tập:", err);
          }
        } else {
          setProblemIssueBreakdown({
            idProblem: null,
            problemName: "",
            totalQuestions: 0,
            issues: [],
          });
        }

        // 4. Thắc mắc phổ biến (Card 3)
        if (
          resTopQuestions.data?.success &&
          Array.isArray(resTopQuestions.data.data)
        ) {
          const rawQuestions = resTopQuestions.data.data;
          const formattedQuestions = rawQuestions.map((q) => ({
            question: q.questionCategory || "Chưa phân loại",
            count: q.totalRequests,
            topic: "Trợ giúp AI",
          }));
          setTopStudentQuestions(formattedQuestions);
        } else {
          setTopStudentQuestions([]);
        }

        // 🌟 5. Xử lý Danh sách Mails từ Backend
        if (resMails.data?.success && Array.isArray(resMails.data.data)) {
          const mailList = resMails.data.data;
          setMails(mailList);

          // Tự động chọn thư đầu tiên nếu có dữ liệu
          if (mailList.length > 0) {
            setSelectedMail(mailList[0].id);
          }
        } else {
          setMails([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu thống kê Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStatistics();
  }, []);

  const activeMail = mails.find((m) => m.id === selectedMail) || null;

  return (
    <div className="container-fluid p-4">
      {/* Title Bar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark m-0">
            <i className="fa-solid fa-inbox text-primary me-2"></i>
            AI & Exercise Analytics Inbox
          </h4>
          <small className="text-muted">
            Trung tâm thông báo tự động và phân tích chuyên sâu về thắc mắc làm
            bài của sinh viên
          </small>
        </div>
        {loading && (
          <div
            className="spinner-border spinner-border-sm text-primary"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        )}
      </div>

      {/* Analytics Summary Cards (Grid 4 thẻ) */}
      <div className="row g-3 mb-4">
        {/* Card 1: Top bài tập dùng AI nhiều nhất */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark m-0">
                <i className="fa-solid fa-robot text-primary me-2"></i>
                Top bài tập sử dụng AI nhiều nhất
              </h6>
              <span className="badge bg-primary bg-opacity-10 text-primary">
                Thống kê thực tế
              </span>
            </div>
            <div className="d-flex flex-column gap-2">
              {topAIProblems.length > 0 ? (
                topAIProblems.map((item, index) => (
                  <div key={index}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-dark">{item.name}</span>
                      <span className="text-muted fw-bold">
                        {item.usageCount} lượt dùng AI
                      </span>
                    </div>
                    <div
                      className="progress bg-light"
                      style={{ height: "6px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <small className="text-muted text-center py-4">
                  Chưa có dữ liệu bài tập
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Top loại Hint được gọi */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark m-0">
                <i className="fa-solid fa-lightbulb text-warning me-2"></i>
                Top loại Hint (Gợi ý) được yêu cầu nhiều nhất
              </h6>
              <span className="badge bg-warning bg-opacity-10 text-warning text-dark">
                Phân loại AI
              </span>
            </div>
            <div className="d-flex flex-column gap-2">
              {topUsedHints.length > 0 ? (
                topUsedHints.map((hint, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center justify-content-between p-2 rounded-3 bg-light"
                  >
                    <div>
                      <div className="fw-semibold text-dark small">
                        {hint.name}
                      </div>
                      <small
                        className="text-muted"
                        style={{ fontSize: "11px" }}
                      >
                        {hint.label}
                      </small>
                    </div>
                    <span className="badge bg-white text-dark border fw-bold">
                      {hint.count} lượt
                    </span>
                  </div>
                ))
              ) : (
                <small className="text-muted text-center py-4">
                  Chưa có dữ liệu gợi ý
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Câu hỏi sinh viên hỏi AI nhiều nhất */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h6 className="fw-bold text-dark m-0">
                <i className="fa-solid fa-comments text-info me-2"></i>
                Câu hỏi / Thắc mắc sinh viên hỏi AI nhiều nhất
              </h6>
              <span className="badge bg-info bg-opacity-10 text-info">
                Prompt phổ biến
              </span>
            </div>
            <div className="d-flex flex-column gap-2">
              {topStudentQuestions.length > 0 ? (
                topStudentQuestions.map((q, index) => (
                  <div key={index} className="p-2 border-bottom last-border-0">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <span
                        className="fw-semibold text-dark small text-truncate pe-2"
                        style={{ maxWidth: "80%" }}
                      >
                        "{q.question}"
                      </span>
                      <span className="badge bg-secondary bg-opacity-10 text-dark fw-bold">
                        {q.count} hỏi
                      </span>
                    </div>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Chủ đề: {q.topic}
                    </small>
                  </div>
                ))
              ) : (
                <small className="text-muted text-center py-4">
                  Chưa có lượt đặt câu hỏi nào
                </small>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: ĐỘNG - Phân tích bài tập bị hỏi vấn đề gì nhiều nhất */}
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="fw-bold text-dark m-0">
                <i className="fa-solid fa-bug text-danger me-2"></i>
                Vấn đề bị hỏi nhiều nhất tại bài '
                {problemIssueBreakdown.problemName || "Chưa có bài tập"}'
              </h6>
              <span className="badge bg-danger bg-opacity-10 text-danger">
                Điểm nghẽn
              </span>
            </div>
            <small className="text-muted mb-3 d-block">
              Tổng cộng {problemIssueBreakdown.totalQuestions} lượt thắc mắc từ
              sinh viên tại bài này
            </small>
            <div className="d-flex flex-column gap-2">
              {problemIssueBreakdown.issues.length > 0 ? (
                problemIssueBreakdown.issues.map((issue, index) => (
                  <div key={index}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-dark">
                        {issue.issue}
                      </span>
                      <span className="text-danger fw-bold">
                        {issue.count} câu hỏi ({issue.percent}%)
                      </span>
                    </div>
                    <div
                      className="progress bg-light"
                      style={{ height: "6px" }}
                    >
                      <div
                        className="progress-bar bg-danger"
                        style={{ width: `${issue.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <small className="text-muted text-center py-4">
                  Chưa có phản hồi tại bài tập này
                </small>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="row g-3">
        {mails.length > 0 ? (
          <>
            <MailList
              mails={mails}
              selectedMail={selectedMail}
              onSelectMail={setSelectedMail}
            />
            <MailDetail activeMail={activeMail} />
          </>
        ) : (
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-5 text-center text-muted bg-white">
              <i className="fa-regular fa-envelope-open fs-1 mb-2"></i>
              <p className="m-0">
                Chưa có thông báo hoặc cảnh báo nào mới từ hệ thống.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}