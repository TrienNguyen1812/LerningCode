import { useState, useEffect, useRef } from "react";

export default function AIAssistantPopup({
  onClose,
  hasRunCode = false,
  code = "",
  problemContext = {}, // Nhận problemContext từ Workspace
  language = "csharp",
  output = null,
}) {
  // 🎯 Thêm State quản lý Hint Level (Mặc định Level 1)
  const [hintLevel, setHintLevel] = useState(1);

  // Mô tả ngắn gọn cho từng Level
  const hintLevelDescriptions = {
    1: "Level 1: Chỉ ra vị trí dòng lỗi & loại lỗi.",
    2: "Level 2: Chỉ lỗi + Gợi ý tư duy/thuật toán.",
    3: "Level 3: Phân tích sâu nguyên nhân & gợi ý cú pháp sửa.",
  };

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: hasRunCode
        ? "Chào bạn, tôi đã nhận được thông tin bài tập và kết quả chạy code gần nhất. Bạn có thể chọn Mức độ Hint ở trên và gửi câu hỏi nhé!"
        : "Chào bạn, tôi là AI Assistant. Bạn hãy chạy thử code (Run Code) trước khi cần tôi hỗ trợ nhé!",
      time: "Vừa xong",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Tự động cuộn xuống cuối khung chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Cập nhật câu chào nếu popup đang mở mà người dùng vừa nhấn Run Code
  useEffect(() => {
    if (hasRunCode && messages.length === 1 && messages[0].sender === "ai") {
      setMessages([
        {
          sender: "ai",
          text: "Tuyệt vời! Tôi đã nhận được kết quả chạy code gần nhất. Chọn Cấp độ Hint phù hợp và đặt câu hỏi cho tôi nhé!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  }, [hasRunCode]);

  const handleSendMessage = async () => {
    if (!input.trim() || !hasRunCode || loading) return;

    const userQuery = input.trim();
    const userMessage = {
      sender: "user",
      text: userQuery,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // 1. Chuẩn hóa dữ liệu output console
      let formattedOutput = "";
      if (output) {
        if (typeof output === "string") {
          formattedOutput = output;
        } else {
          formattedOutput = output.message || output.output || output.actualOutput || JSON.stringify(output);
        }
      }

      // 2. Lấy idProblem an toàn từ problemContext
      const problemId = problemContext?.id || problemContext?.idProblem || problemContext?.IdProblem || 1;

      // 3. Trích xuất testCaseDetails (nếu có từ console output)
      const testCaseDetails = output?.testCaseDetails || output?.results || [];

      // 4. Gửi payload đầy đủ lên Backend API
      const response = await fetch("http://localhost:5000/api/judges/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idProblem: problemId,
          studentCode: code || "",
          language: language,
          question: userQuery,
          lastConsoleOutput: formattedOutput,
          currentHintLevel: hintLevel, // 👈 Đã bổ sung truyền Hint Level
          testCaseDetails: testCaseDetails, // 👈 Bổ sung truyền dữ liệu Test Cases chi tiết
        }),
      });

      const data = await response.json();

      const aiResponseText = data.feedback || data.reply || "Xin lỗi, tôi không thể phản hồi lúc này.";

      const aiMessage = {
        sender: "ai",
        text: aiResponseText,
        level: hintLevel, // Lưu nhãn level để hiển thị badge trong chat
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Lỗi gọi API AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Đã xảy ra lỗi khi kết nối với AI Assistant. Vui lòng thử lại!",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <div
      className="card border-0 shadow-lg position-absolute rounded-4 overflow-hidden text-start animate-fade-in"
      style={{
        width: "400px",
        bottom: "70px",
        right: "24px",
        zIndex: 1050,
        backgroundColor: "#ffffff",
      }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 d-flex align-items-center justify-content-between border-bottom text-dark bg-light">
        <div className="d-flex align-items-center gap-2 fw-bold" style={{ fontSize: "14px" }}>
          <i className="fa-solid fa-robot text-primary"></i> AI Assistant
        </div>
        <button
          className="btn-close small"
          style={{ fontSize: "10px", cursor: "pointer" }}
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>

      {/* 🎯 BỘ CHỌN HINT LEVEL CHO SINH VIÊN */}
      <div className="px-3 py-2 bg-light border-bottom">
        <div className="d-flex align-items-center justify-content-between mb-1">
          <span className="fw-bold text-secondary" style={{ fontSize: "12px" }}>
            <i className="fa-solid fa-layer-group me-1 text-warning"></i> Mức độ gợi ý:
          </span>
          <span className="badge bg-warning text-dark fw-bold" style={{ fontSize: "10px" }}>
            Level {hintLevel}
          </span>
        </div>

        {/* Button Group chọn Level 1, 2, 3 */}
        <div className="btn-group w-100 mb-1" role="group">
          {[1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              type="button"
              className={`btn btn-sm py-1 ${
                hintLevel === lvl
                  ? "btn-warning fw-bold text-dark shadow-sm"
                  : "btn-outline-secondary bg-white text-dark opacity-75"
              }`}
              style={{ fontSize: "11px" }}
              onClick={() => setHintLevel(lvl)}
            >
              Lvl {lvl}
            </button>
          ))}
        </div>

        <div className="text-muted" style={{ fontSize: "10.5px", lineHeight: "1.2" }}>
          <i className="fa-solid fa-circle-info me-1"></i>
          {hintLevelDescriptions[hintLevel]}
        </div>
      </div>

      {/* Messages Area */}
      <div className="p-3 bg-white overflow-y-auto" style={{ height: "230px" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`d-flex flex-column mb-3 ${
              msg.sender === "user" ? "align-items-end" : "align-items-start"
            }`}
          >
            {/* Hiển thị Badge Hint Level trong câu trả lời AI */}
            {msg.sender === "ai" && msg.level && (
              <span className="badge bg-warning-subtle text-warning-emphasis mb-1 border border-warning-subtle" style={{ fontSize: "9px" }}>
                Hint Level {msg.level}
              </span>
            )}

            <div
              className={`p-2.5 rounded-4 small ${
                msg.sender === "user"
                  ? "text-white bg-primary rounded-bottom-end-0"
                  : "text-dark rounded-bottom-start-0"
              }`}
              style={{
                backgroundColor: msg.sender === "user" ? "#3525cd" : "#eef2f7",
                maxWidth: "88%",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.text}
            </div>
            <span className="text-muted px-1 mt-1" style={{ fontSize: "10px" }}>
              {msg.time}
            </span>
          </div>
        ))}

        {loading && (
          <div className="d-flex align-items-center gap-2 text-muted small fst-italic">
            <i className="fa-solid fa-spinner fa-spin text-primary"></i> AI đang phân tích theo Level {hintLevel}...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Lock Notice */}
      {!hasRunCode && (
        <div
          className="px-3 py-1 bg-warning-subtle text-warning-emphasis small text-center border-top"
          style={{ fontSize: "11px" }}
        >
          <i className="fa-solid fa-lock me-1"></i> Vui lòng nhấn <strong>Run Code</strong> ít nhất 1 lần để mở khóa AI!
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 border-top bg-white">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm rounded-start-3 bg-light border-end-0 py-2 shadow-none px-3"
            placeholder={hasRunCode ? `Hỏi AI (Hint Lvl ${hintLevel})...` : "Tính năng đang bị khóa..."}
            style={{ fontSize: "12.5px" }}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!hasRunCode || loading}
          />
          <button
            className="btn btn-sm rounded-end-3 px-3 fw-semibold text-white border-start-0"
            style={{
              backgroundColor: hasRunCode ? "#3525cd" : "#6c757d",
              borderColor: hasRunCode ? "#3525cd" : "#6c757d",
              cursor: hasRunCode ? "pointer" : "not-allowed",
            }}
            onClick={handleSendMessage}
            disabled={!hasRunCode || loading}
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin"></i> : "Gửi"}
          </button>
        </div>
      </div>
    </div>
  );
}