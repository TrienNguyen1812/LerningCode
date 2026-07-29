import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, onChange, onRunCode, isRunning }) {
  return (
    <div className="bg-white rounded-4 flex-grow-1 border shadow-sm d-flex flex-column overflow-hidden">
      {/* BAR CÔNG CỤ CODE */}
      <div className="d-flex justify-content-between align-items-center p-2 bg-light border-bottom">
        <span className="fw-bold small ms-2 text-secondary">
          <i className="fa-solid fa-code me-2 text-primary"></i>Solution.cs
        </span>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-primary rounded-pill px-4 fw-semibold text-white shadow-sm"
            onClick={onRunCode}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Đang chạy...
              </>
            ) : (
              <>
                <i className="fa-solid fa-play me-1"></i>
                Run Code (Chạy thử)
              </>
            )}
          </button>
        </div>
      </div>

      {/* MONACO EDITOR */}
      <div className="flex-grow-1">
        <Editor
          height="100%"
          defaultLanguage="csharp"
          theme="vs"
          value={code}
          onChange={(val) => onChange(val || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            quickSuggestions: true,
            snippetSuggestions: "top",
          }}
        />
      </div>
    </div>
  );
}