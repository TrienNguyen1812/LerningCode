import { useState, useEffect, useRef } from "react";
import axios from "axios";

import WorkspaceHeader from "../components/WorkspaceHeader";
import ProblemDescription from "../components/ProblemDescription";
import CodeEditor from "../components/CodeEditor";
import AIAssistantPopup from "../components/AIAssistant";
import SubmissionResultView from "../components/User/SubmissionResultView";

const API_BASE_URL = "http://localhost:5000/api";

export default function ProblemWorkspacePage({
  problem: initialProblem,
  currentUser,
  onExitWorkspace,
}) {
  const rawId =
    initialProblem?.IdProblem ||
    initialProblem?.idProblem ||
    initialProblem?.id;
  const problemId = rawId ? Number(rawId) : null;

  const DEFAULT_SAMPLE_CODE = "// Viết code của bạn tại đây...";

  const [problem, setProblem] = useState(initialProblem);
  const [loadingProblem, setLoadingProblem] = useState(false);

  const extractSampleCode = (probData) => {
    return (
      probData?.Sample_code ||
      probData?.sampleCode ||
      probData?.sample_code ||
      DEFAULT_SAMPLE_CODE
    );
  };

  const [code, setCode] = useState(() => extractSampleCode(initialProblem));
  const prevProblemIdRef = useRef(problemId);

  const [showAI, setShowAI] = useState(false);
  const [theme, setTheme] = useState("vs-dark");
  const [language, setLanguage] = useState("csharp");

  const [showTestCases, setShowTestCases] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState(null);
  const [currentAction, setCurrentAction] = useState("RUN");
  const [hasRunCode, setHasRunCode] = useState(false);

  // 🌟 LƯU ID SUBMISSION MỚI NHẤT DÙNG CHO PHƯƠNG ÁN 1
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);

  const submitTimerRef = useRef(null);
  const intervalTimerRef = useRef(null); // Ref lưu trữ bộ đếm thời gian (interval)

  const [duration, setDuration] = useState(0);

  const getActiveUserId = () => {
    if (currentUser?.id) return Number(currentUser.id);
    if (currentUser?.idUser) return Number(currentUser.idUser);

    try {
      const localData = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const localId = localData?.id || localData?.idUser;
      if (localId) return Number(localId);
    } catch (e) {
      // Ignore parse error
    }

    return null;
  };

  const isDark = theme === "vs-dark";

  // Quản lý đếm thời gian: Khởi tạo, dọn dẹp khi đổi bài hoặc unmount
  useEffect(() => {
    setDuration(0);

    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
    }

    intervalTimerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalTimerRef.current) {
        clearInterval(intervalTimerRef.current);
      }
      if (submitTimerRef.current) {
        clearTimeout(submitTimerRef.current);
      }
      setDuration(0);
    };
  }, [problemId]);

  // Xử lý thoát workspace: Dừng đếm thời gian và reset duration về 0
  const handleExit = () => {
    if (intervalTimerRef.current) {
      clearInterval(intervalTimerRef.current);
    }
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
    }
    setDuration(0);

    if (typeof onExitWorkspace === "function") {
      onExitWorkspace();
    }
  };

  useEffect(() => {
    const fetchFullProblem = async () => {
      if (!problemId) return;

      if (initialProblem?.Description || initialProblem?.description) {
        setProblem(initialProblem);
        if (problemId !== prevProblemIdRef.current) {
          setCode(extractSampleCode(initialProblem));
          prevProblemIdRef.current = problemId;
        }
        return;
      }

      try {
        setLoadingProblem(true);
        const res = await axios.get(`${API_BASE_URL}/problems/${problemId}`);
        const fullData = res.data?.data || res.data;
        if (fullData) {
          setProblem(fullData);
          setCode(extractSampleCode(fullData));
          prevProblemIdRef.current = problemId;
        }
      } catch (err) {
        console.error("Lỗi khi tải thông tin chi tiết bài tập:", err);
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchFullProblem();
  }, [problemId, initialProblem]);

  const handleDownload = (content, fileName) => {
    if (!content) return;
    const element = document.createElement("a");
    element.href = URL.createObjectURL(
      new Blob([content], { type: "text/plain" }),
    );
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const executeCode = async (action) => {
    setHasRunCode(true);
    setCurrentAction(action);
    setShowTestCases(true);
    setShowScoreModal(false);
    setIsCompiling(true);
    setOutput(null);

    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);

    const isRun = action === "RUN";
    const url = isRun
      ? `${API_BASE_URL}/judges/execute`
      : `${API_BASE_URL}/submissions/submit`;

    const currentSessionDuration = duration;

    const finalUserId = getActiveUserId();

    const body = isRun
      ? {
          idProblem: Number(problemId),
          code: code || "",
          language: language || "csharp",
          action: "RUN",
          includeHidden: true,
        }
      : {
          idUser: finalUserId,
          idProblem: Number(problemId),
          codeContent: code || "",
          language: language || "csharp",
          durationInSeconds: Number(currentSessionDuration || 0),
        };

    if (!isRun && (!body.idUser || !body.idProblem || !body.codeContent)) {
      setIsCompiling(false);
      setOutput({
        status: "Error",
        message: `Thiếu dữ liệu nộp bài: idUser=${body.idUser || "chưa đăng nhập"}, idProblem=${body.idProblem || "không rõ bài"}, codeContent=${body.codeContent ? "Có" : "Trống"}`,
      });
      return;
    }

    if (!isRun) {
      setDuration(0);
    }

    const startTime = performance.now();

    try {
      const response = await axios.post(url, body);
      const resData = response.data;
      const endTime = performance.now();
      const calcExecutionTime = Math.round(endTime - startTime);

      if (resData?.success) {
        const finalData = resData.data || resData;

        if (!finalData.executionTime) {
          finalData.executionTime = calcExecutionTime;
        }

        setOutput(finalData);

        // 🌟 NẾU LÀ ACTION SUBMIT: LẤY VÀ CẬP NHẬT ID SUBMISSION MỚI NHẤT
        if (action === "SUBMIT") {
          const newSubmissionId =
            finalData.idSubmission ||
            finalData.id ||
            finalData.submissionId ||
            resData.idSubmission;

          if (newSubmissionId) {
            setCurrentSubmissionId(Number(newSubmissionId));
          }

          submitTimerRef.current = setTimeout(() => {
            setShowScoreModal(true);
          }, 5000);
        }
      } else {
        setOutput({
          status: "Error",
          executionTime: calcExecutionTime,
          message:
            resData?.message ||
            (isRun
              ? "Lỗi biên dịch hệ thống."
              : "Gặp lỗi trong quá trình nộp bài."),
        });
      }
    } catch (error) {
      console.error(`${action} code error:`, error);
      setOutput({
        status: "Error",
        message:
          error.response?.data?.message ||
          `Không thể kết nối đến máy chủ ${isRun ? "Compiler" : "Submissions"}.`,
      });
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div
      className="vw-100 vh-100 d-flex flex-column m-0 p-0 overflow-hidden"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: isDark ? "#1e1e1e" : "#f8f9fa",
      }}
    >
      <WorkspaceHeader
        problemTitle={problem?.Title || problem?.title || "Bài tập lập trình"}
        onExit={handleExit}
        onToggleAI={() => setShowAI(!showAI)}
        theme={theme}
        onChangeTheme={setTheme}
        language={language}
        onChangeLanguage={setLanguage}
        onRunCode={() => executeCode("RUN")}
        onSubmitCode={() => executeCode("SUBMIT")}
      />

      <div className="row g-0 flex-grow-1 overflow-hidden w-100 m-0">
        {/* BÊN TRÁI: MÔ TẢ BÀI TẬP */}
        <div
          className={`col-12 col-lg-5 h-100 overflow-y-auto border-end ${
            isDark
              ? "bg-dark text-light border-secondary"
              : "bg-white text-dark"
          }`}
        >
          {loadingProblem ? (
            <div className="p-4 text-center text-muted">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              ></div>
              <span>Đang lấy chi tiết bài tập từ Server...</span>
            </div>
          ) : (
            <ProblemDescription problem={problem} theme={theme} />
          )}
        </div>

        {/* BÊN PHẢI: EDITOR VÀ KHU VỰC CHẤM ĐIỂM */}
        <div className="col-12 col-lg-7 position-relative h-100 d-flex flex-column bg-dark">
          <div className="flex-grow-1 position-relative overflow-hidden">
            <CodeEditor
              code={code}
              onChange={setCode}
              theme={theme}
              language={language}
              onRunCode={() => executeCode("RUN")}
              onSubmitCode={() => executeCode("SUBMIT")}
            />
          </div>

          <SubmissionResultView
            show={showTestCases}
            onClose={() => setShowTestCases(false)}
            showScoreModal={showScoreModal}
            onCloseScoreModal={() => setShowScoreModal(false)}
            isCompiling={isCompiling}
            output={output}
            currentAction={currentAction}
            theme={theme}
            onDownload={handleDownload}
          />

          {showAI && (
            <AIAssistantPopup
              onClose={() => setShowAI(false)}
              hasRunCode={hasRunCode}
              code={code}
              output={output}
              language={language}
              problemContext={problem}
              idSubmission={currentSubmissionId} // 🌟 CẤP ID SUBMISSION CHO AI POPUP
            />
          )}
        </div>
      </div>
    </div>
  );
}