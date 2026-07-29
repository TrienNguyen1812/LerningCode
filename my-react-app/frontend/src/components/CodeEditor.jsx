import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, theme, onRunCode, onSubmitCode }) {
  const isDark = theme === "vs-dark";
  const [formattedCode, setFormattedCode] = useState("");
  const [showPasteWarning, setShowPasteWarning] = useState(false); // Thông báo khi cố gắng paste

  // Tự động chuyển chuỗi "\\n" thành ký tự xuống dòng thực tế
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

  // 🛡️ CHẶN PASTE CODE TỪ BÊN NGOÀI
  const handleEditorDidMount = (editor, monaco) => {
    // 1. Vô hiệu hóa phím tắt Paste (Ctrl + V / Cmd + V) trong Editor
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
      triggerPasteWarning();
    });

    // 2. Lắng nghe và ngăn chặn trực tiếp event 'paste' trên DOM Element của Editor
    const editorDomNode = editor.getDomNode();
    if (editorDomNode) {
      editorDomNode.addEventListener(
        "paste",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerPasteWarning();
        },
        true // Thêm capture phase để chặn từ ngoài cùng
      );
    }
  };

  // Hiển thị cảnh báo khi học sinh cố gắng dán code
  const triggerPasteWarning = () => {
    setShowPasteWarning(true);
    setTimeout(() => {
      setShowPasteWarning(false);
    }, 3000);
  };

  // Cấu hình các tùy chọn nâng cao cho Monaco Editor
  const editorOptions = {
    selectOnLineNumbers: true,
    roundedSelection: true,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
    fontSize: 14,
    fontFamily: "'Fira Code', 'Courier New', Courier, monospace",
    minimap: { enabled: false },
    scrollbar: {
      vertical: "visible",
      horizontal: "visible",
    },
    autoClosingBrackets: "always",
    autoClosingQuotes: "always",
    formatOnPaste: false, // 🛡️ Tắt tự động định dạng khi paste
    lineNumbers: "on",
    contextmenu: false, // 🛡️ Tắt Menu chuột phải (để ẩn lựa chọn "Paste" trong menu context)
  };

  return (
    <div
      className="h-100 d-flex flex-column text-start transition-all position-relative"
      style={{ backgroundColor: isDark ? "#1e1e1e" : "#ffffff" }}
    >
      {/* ⚠️ THÔNG BÁO CẢNH BÁO KHI CỐ GẮNG PASTE */}
      {showPasteWarning && (
        <div
          className="position-absolute start-50 translate-middle-x bg-danger text-white px-3 py-2 rounded-3 shadow-lg d-flex align-items-center gap-2 font-monospace"
          style={{ top: "50px", zIndex: 1000, fontSize: "13px" }}
        >
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>Thao tác dán (Paste) bị cấm! Vui lòng tự gõ code bài làm.</span>
        </div>
      )}

      {/* --- THANH TIÊU ĐỀ FILE (CỐ ĐỊNH C#) --- */}
      <div
        className={`d-flex align-items-center justify-content-between px-3 py-2 border-bottom ${
          isDark
            ? "bg-dark text-muted border-secondary border-opacity-25"
            : "bg-light text-secondary border-light"
        }`}
        style={{ height: "41px" }}
      >
        <div className="d-flex align-items-center gap-2">
          <i className="fa-solid fa-code" style={{ color: "#a179f2" }}></i>
          <span className="font-monospace fw-medium" style={{ fontSize: "13px" }}>
            Solution.cs
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span
            className="badge bg-secondary bg-opacity-25 text-muted font-monospace"
            style={{ fontSize: "11px" }}
          >
            C#
          </span>
        </div>
      </div>

      {/* --- KHU VỰC VIẾT CODE (MONACO EDITOR) --- */}
      <div className="flex-grow-1 position-relative overflow-hidden" style={{ minHeight: "200px" }}>
        <Editor
          height="100%"
          width="100%"
          language="csharp"
          theme={isDark ? "vs-dark" : "light"}
          value={formattedCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount} // 👈 Gắn hàm lắng nghe sự kiện chặn Paste ở đây
          options={editorOptions}
          loading={<div className="p-3 text-muted font-monospace">Đang tải trình soạn thảo code...</div>}
        />
      </div>

      {/* --- THANH ĐIỀU KHIỂN CHẠY BÀI (RUN & SUBMIT) --- */}
      <div
        className={`p-3 d-flex align-items-center justify-content-end border-top ${
          isDark ? "border-secondary border-opacity-25 bg-dark" : "border-light bg-light"
        }`}
        style={{ height: "60px" }}
      >
        <div className="d-flex gap-3">
          <button
            className={`btn fw-semibold px-4 btn-sm ${
              isDark ? "btn-outline-secondary text-light" : "btn-outline-dark"
            }`}
            onClick={onRunCode}
          >
            <i className="fa-solid fa-play me-1"></i> Run Code
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