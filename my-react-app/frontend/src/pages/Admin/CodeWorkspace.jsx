import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Import UI Components
import WorkspaceHeader from "../../components/Admin/Problem/WorkspaceHeader";
import ProblemDescription from "../../components/Admin/Problem/ProblemDescription";
import ExecutionConsole from "../../components/Admin/Problem/ExecutionConsole";
import CodeEditor from "../../components/Admin/Problem/CodeEditor";
import AiAssistant from "../../components/Admin/Problem/AiAssistant";

const API_JUDGE_URL = "http://localhost:5000/api/judges";

export default function CodeWorkspacePage({ problem, onBack }) {
  const DEFAULT_CODE = `using System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello World!");\n    }\n}`;

  // State Code
  const [code, setCode] = useState(problem?.sampleCode || DEFAULT_CODE);
  const prevProblemIdRef = useRef(problem?.id || problem?.IdProblem);

  // State Cấp độ Hint (Level 1, 2, 3) - Mặc định Level 1
  const [hintLevel, setHintLevel] = useState(1);

  useEffect(() => {
    const currentId = problem?.id || problem?.IdProblem;
    if (currentId && currentId !== prevProblemIdRef.current) {
      setCode(problem?.sampleCode || DEFAULT_CODE);
      prevProblemIdRef.current = currentId;
    }
  }, [problem]);

  // State Chat AI - Đã cập nhật câu chào mới, bỏ thông tin trừ điểm
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: "Xin chào! Bạn có thể chọn Cấp độ Hint (1, 2, 3) bên trên để nhận hỗ trợ gợi ý từ trợ giảng AI.",
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);

  // State Console
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // "description" | "console"
  const [consoleOutput, setConsoleOutput] = useState(null);

  const visibleTestCase =
    problem?.testCases?.find((tc) => !tc.isHidden) || problem?.testCases?.[0];

  // 🎯 LOGIC GỌI AI TRỢ GIÚP DEBUG THEO CẤP ĐỘ HINT
  const handleAskAI = async () => {
    if (!userQuestion.trim() || isAsking) return;

    const currentQuestion = userQuestion;
    const selectedLevel = hintLevel;

    // Hiển thị tin nhắn sinh viên / admin hỏi
    setChatHistory((prev) => [...prev, { sender: "user", text: currentQuestion }]);
    setUserQuestion("");
    setIsAsking(true);

    try {
      // 🟢 TRUYỀN THÊM testCaseDetails VÀO REQUEST DÙNG CHO AI ANALYZER
      const response = await axios.post(`${API_JUDGE_URL}/ai-feedback`, {
        idUser: 1, // IdUser tạm thời khi Admin/Sinh viên đang Test
        idProblem: problem?.id || problem?.IdProblem || 1,
        studentCode: code,
        language: "C#",
        question: currentQuestion,
        lastConsoleOutput: consoleOutput?.actualOutput || null,
        currentHintLevel: selectedLevel,
        testCaseDetails: consoleOutput?.testCaseDetails || [], // 👈 ĐÃ BỔ SUNG TRUYỀN DỮ LIỆU TEST CASES
      });

      if (response.data && response.data.success) {
        const aiData = response.data.feedback;
        const replyText =
          typeof aiData === "string"
            ? aiData
            : aiData?.suggestion ||
              aiData?.analysisContent ||
              "AI đã phân tích bài làm nhưng không tìm thấy lỗi nghiêm trọng nào.";

        // Thêm phản hồi của AI vào lịch sử Chat
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: replyText,
            level: selectedLevel, // Lưu nhãn level để hiển thị UI
          },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: response.data?.message || "Server AI chưa sẵn sàng xử lý yêu cầu này.",
          },
        ]);
      }
    } catch (err) {
      console.error("Lỗi khi gọi AI Gemini:", err);
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: err.response?.data?.message || "Không thể kết nối tới Server AI!",
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  // Logic Chạy Thử Code (Run Code)
  const handleRunCode = async () => {
    setIsRunning(true);
    setActiveTab("console");
    setConsoleOutput({ status: "Pending", message: "Đang biên dịch và thực thi code..." });

    try {
      const currentInput = visibleTestCase?.inputData ?? visibleTestCase?.InputData ?? "";
      const expectedOut = visibleTestCase?.outputData ?? visibleTestCase?.OutputData ?? "";

      const res = await axios.post(`${API_JUDGE_URL}/execute`, {
        code: code,
        language: "C#",
        problemId: problem?.id || problem?.IdProblem || 1,
        input: currentInput,
        expectedOutput: expectedOut,
        action: "RUN",
      });

      const resData = res.data?.data || res.data;

      if (res.data?.success) {
        setConsoleOutput({
          status: resData?.status || (resData?.isCorrect ? "Accepted" : "Wrong Answer"),
          message: resData?.message || "",
          passCount: resData?.passCount ?? 0,
          totalTestCases: resData?.totalTestCases ?? 0,
          testCaseDetails: resData?.testCaseDetails || [],
          executionTime: resData?.executionTime || resData?.duration || "0.00s",
          testCaseInput: resData?.testCaseInput ?? currentInput,
          expectedOutput: resData?.expectedOutput ?? expectedOut,
          actualOutput: resData?.actualOutput || resData?.stdout || resData?.output || "(Không có kết quả in ra)",
          isCorrect: resData?.isCorrect,
        });
      } else {
        setConsoleOutput({
          status: resData?.status || "Compile Error",
          message: res.data?.message || "Lỗi biên dịch code C#.",
          actualOutput: resData?.output || resData?.errorMessage || resData?.stderr || "Lỗi biên dịch code.",
          testCaseDetails: [],
          isError: true,
          executionTime: resData?.executionTime || resData?.duration || "0.00s",
        });
      }
    } catch (err) {
      console.error("Lỗi biên dịch:", err);
      setConsoleOutput({
        status: "Execution Error",
        actualOutput: err.response?.data?.message || "Không thể kết nối tới Server Compiler.",
        testCaseDetails: [],
        isError: true,
        executionTime: "0.00s",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container-fluid vh-100 p-3 bg-light text-dark text-start">
      <WorkspaceHeader title={problem?.title} onBack={onBack} />

      <div className="row g-3" style={{ height: "calc(100vh - 95px)" }}>
        {/* CỘT 1: ĐỀ BÀI / CONSOLE */}
        <div className="col-12 col-lg-4 h-100 d-flex flex-column">
          <div className="bg-white rounded-4 h-100 overflow-hidden border shadow-sm d-flex flex-column">
            <div className="d-flex bg-light border-bottom px-3 pt-2">
              <button
                className={`btn btn-sm px-3 py-2 fw-semibold rounded-top-3 me-2 ${
                  activeTab === "description"
                    ? "btn-white bg-white text-primary border-top border-start border-end fw-bold"
                    : "btn-light text-secondary"
                }`}
                onClick={() => setActiveTab("description")}
              >
                <i className="fa-solid fa-file-lines me-2"></i>Đề bài
              </button>
              <button
                className={`btn btn-sm px-3 py-2 fw-semibold rounded-top-3 ${
                  activeTab === "console"
                    ? "btn-white bg-white text-primary border-top border-start border-end fw-bold"
                    : "btn-light text-secondary"
                }`}
                onClick={() => setActiveTab("console")}
              >
                <i className="fa-solid fa-terminal me-2"></i>Kết quả Chạy thử
              </button>
            </div>

            {activeTab === "description" ? (
              <ProblemDescription problem={problem} visibleTestCase={visibleTestCase} />
            ) : (
              <ExecutionConsole consoleOutput={consoleOutput} />
            )}
          </div>
        </div>

        {/* CỘT 2: MONACO EDITOR */}
        <div className="col-12 col-lg-5 h-100 d-flex flex-column">
          <CodeEditor
            code={code}
            onChange={setCode}
            onRunCode={handleRunCode}
            isRunning={isRunning}
          />
        </div>

        {/* CỘT 3: AI ASSISTANT */}
        <div className="col-12 col-lg-3 h-100">
          <AiAssistant
            chatHistory={chatHistory}
            userQuestion={userQuestion}
            setUserQuestion={setUserQuestion}
            onAskAI={handleAskAI}
            isAsking={isAsking}
            hintLevel={hintLevel}
            setHintLevel={setHintLevel}
          />
        </div>
      </div>
    </div>
  );
}