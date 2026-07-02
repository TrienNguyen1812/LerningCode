import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, theme, language, onRunCode, onSubmitCode }) {
  const isDark = theme === "vs-dark";
  const [formattedCode, setFormattedCode] = useState("");

  // 🌟 SỬA LỖI \n: Tự động chuyển chuỗi "\\n" thành ký tự xuống dòng thực tế
  useEffect(() => {
    if (code) {
      const cleanCode = code.replace(/\\n/g, "\n");
      setFormattedCode(cleanCode);
    } else {
      setFormattedCode("");
    }
  }, [code]);

  // Xử lý sự kiện thay đổi code trên Monaco Editor
  const handleEditorChange = (value) => {
    setFormattedCode(value || "");
    onChange(value || ""); // Cập nhật liên tục lên component cha
  };

  // Cấu hình các tùy chọn nâng cao cho Monaco Editor giống hệt VS Code / VS2022
  const editorOptions = {
    selectOnLineNumbers: true,    // Cho phép click vào số dòng để chọn nhanh
    roundedSelection: true,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,         // Tự động co giãn kích thước theo khung bao ngoài
    fontSize: 14,
    fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
    minimap: { enabled: false },   // Ẩn bản đồ code nhỏ bên phải nếu không cần thiết
    scrollbar: {
      vertical: "visible",
      horizontal: "visible"
    },
    // Bật các tính năng tự động đóng ngoặc, đếm dòng chuẩn
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    formatOnPaste: true,
    lineNumbers: "on"              // 🌟 HIỂN THỊ SỐ DÒNG CODE CHUẨN XÁC
  };

  return (
    <div 
      className="h-100 d-flex flex-column text-start transition-all" 
      style={{ backgroundColor: isDark ? "#1e1e1e" : "#ffffff" }}
    >
      {/* --- THANH TIÊU ĐỀ FILE --- */}
      <div className={`d-flex align-items-center justify-content-between px-3 py-2 border-bottom ${
        isDark ? "bg-dark text-muted border-secondary border-opacity-25" : "bg-light text-secondary border-light"
      }`} style={{ height: "41px" }}>
        <div className="d-flex align-items-center gap-2">
          {language === "csharp" ? (
            <i className="fa-solid fa-code" style={{ color: "#a179f2" }}></i>
          ) : (
            <i className="fa-brands fa-js text-warning"></i>
          )}
          <span className="font-monospace fw-medium" style={{ fontSize: "13px" }}>
            {language === "csharp" ? "Solution.cs" : "solution.js"}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-secondary bg-opacity-25 text-muted font-monospace" style={{ fontSize: "11px" }}>
            {language === "csharp" ? "C#" : "JavaScript"}
          </span>
        </div>
      </div>

      {/* --- KHU VỰC VIẾT CODE (ĐÃ NÂNG CẤP LÊN MONACO EDITOR) --- */}
      <div className="flex-grow-1 position-relative overflow-hidden" style={{ minHeight: "200px" }}>
        <Editor
          height="100%"
          width="100%"
          language={language === "csharp" ? "csharp" : "javascript"}
          theme={isDark ? "vs-dark" : "light"} // Tự động đồng bộ giao diện sáng/tối
          value={formattedCode}
          onChange={handleEditorChange}
          options={editorOptions}
          loading={<div className="p-3 text-muted font-monospace">Đang tải trình soạn thảo code...</div>}
        />
      </div>

      {/* --- THANH ĐIỀU KHIỂN CHẠY BÀI (FOOTER GIỮ NGUYÊN BẢN CỦA BẠN) --- */}
      <div className={`p-3 d-flex align-items-center justify-content-end border-top ${
        isDark ? "border-secondary border-opacity-25 bg-dark" : "border-light bg-light"
      }`} style={{ height: "60px" }}>
        <div className="d-flex gap-3">
          <button 
            className={`btn fw-semibold px-4 btn-sm ${isDark ? "btn-outline-secondary text-light" : "btn-outline-dark"}`}
            onClick={onRunCode}
          >
            Run Code
          </button>
          <button 
            className="btn btn-primary fw-bold px-4 btn-sm" 
            style={{ backgroundColor: "#3525cd", borderColor: "#3525cd" }}
            onClick={onSubmitCode}
          >
            Submit <i className="fa-solid fa-rocket ms-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
}