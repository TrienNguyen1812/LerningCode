import { useState } from "react";
import WorkspaceHeader from "../component/WorkspaceHeader";
import ProblemDescription from "../component/ProblemDescription";
import CodeEditor from "../component/CodeEditor";
import AIAssistantPopup from "../component/AIAssistant"; 

export default function ProblemWorkspacePage({ problem, onExitWorkspace }) {
  const [showAI, setShowAI] = useState(false);

  return (
    <div 
      className="vw-100 vh-100 d-flex flex-column bg-light m-0 p-0 overflow-hidden"
      style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      
      <WorkspaceHeader
        // 1. Sử dụng biến problem: Lấy title từ object truyền vào, nếu không có thì lấy mặc định
        problemTitle={problem?.title || "Two Sum (Simplified)"} 
        
        // 2. Sử dụng biến onExitWorkspace: Truyền hàm xuống cho component Header
        onExit={onExitWorkspace} 
        
        onToggleAI={() => setShowAI(!showAI)}
      />

      {/* ... Các phần bên dưới giữ nguyên y hệt như cũ ... */}
      <div className="row g-0 flex-grow-1 overflow-hidden w-100 m-0">
        <div className="col-12 col-lg-5 h-100 overflow-y-auto border-end bg-white">
          <ProblemDescription problem={problem} /> {/* Truyền thêm problem xuống đây nếu cần */}
        </div>
        <div className="col-12 col-lg-7 position-relative h-100 d-flex flex-column">
          <CodeEditor />
          {showAI && <AIAssistantPopup onClose={() => setShowAI(false)} />}
        </div>
      </div>
    </div>
  );
}