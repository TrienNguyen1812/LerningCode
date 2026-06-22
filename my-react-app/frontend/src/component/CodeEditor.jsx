import { useState } from "react";

export default function CodeEditor() {
  // STATE: Lưu trữ giá trị code động do sinh viên nhập vào
  const [code, setCode] = useState(`// Solve the Two Sum challenge
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
}`);

  // Hàm hỗ trợ gõ phím Tab trong textarea (mặc định Tab sẽ nhảy sang element khác)
  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      // Chèn 4 khoảng trắng khi ấn Tab
      setCode(code.substring(0, start) + "    " + code.substring(end));
      // Đặt lại vị trí con trỏ chuột sau khi chèn
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  return (
    <div className="h-100 d-flex flex-column text-start" style={{ backgroundColor: "#1e1e2f" }}>
      
      {/* --- PHẦN 1: KHU VỰC GÕ CODE (Nửa trên) --- */}
      <div className="flex-grow-1 d-flex flex-column position-relative">
        {/* Thanh tiêu đề file */}
        <div className="d-flex align-items-center justify-content-between px-3 py-2 bg-dark text-muted small border-bottom border-secondary border-opacity-25">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-brands fa-js text-warning"></i>
            <span className="font-monospace">solution.js</span>
          </div>
          <i className="fa-solid fa-gear cursor-pointer hover-text-white"></i>
        </div>

        {/* Textarea nhập code động */}
        <div className="flex-grow-1 position-relative overflow-hidden">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-100 h-100 p-3 bg-transparent text-light font-monospace border-0"
            style={{ 
              outline: "none", 
              boxShadow: "none", 
              resize: "none", 
              fontSize: "14px", 
              lineHeight: "1.6",
              whiteSpace: "pre"
            }}
            spellCheck="false"
          />
        </div>
      </div>

      {/* --- PHẦN 2: CONSOLE & TEST CASES (Nửa dưới) --- */}
      <div className="border-top border-secondary border-opacity-25 bg-dark d-flex flex-column" style={{ height: "45%" }}>
        
        {/* Tab điều hướng Console */}
        <div className="d-flex align-items-center justify-content-between px-4 py-2 border-bottom border-secondary border-opacity-25">
          <div className="d-flex gap-4 text-white fw-medium small">
            <span className="border-bottom border-2 border-white pb-1 cursor-pointer">Console</span>
            <span className="text-muted cursor-pointer hover-text-white pb-1">Test Cases</span>
          </div>
          <div className="text-success small fw-bold d-flex align-items-center gap-2">
            <i className="fa-regular fa-circle-check"></i> ALL TESTS PASSED <span className="text-muted fw-normal ms-2">Exec Time: 42ms</span>
          </div>
        </div>
        
        {/* Danh sách kết quả Test */}
        <div className="flex-grow-1 p-3 overflow-y-auto">
          <div className="card bg-dark border border-success border-opacity-25 mb-3 rounded-3">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-success fw-bold small"><i className="fa-regular fa-circle-check me-2"></i>Test Case 1</span>
                <span className="text-muted small">Passed</span>
              </div>
              <div className="text-light font-monospace" style={{ fontSize: "12px" }}>
                Input: nums=[2,7,11,15], target=9 <span className="ms-4 opacity-75">Output: [0,1]</span>
              </div>
            </div>
          </div>
          
          <div className="card bg-dark border border-success border-opacity-25 rounded-3">
            <div className="card-body p-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-success fw-bold small"><i className="fa-regular fa-circle-check me-2"></i>Test Case 2</span>
                <span className="text-muted small">Passed</span>
              </div>
              <div className="text-light font-monospace" style={{ fontSize: "12px" }}>
                Input: nums=[3,2,4], target=6 <span className="ms-4 opacity-75">Output: [1,2]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thanh Footer Submit Code */}
        <div className="p-3 d-flex align-items-center justify-content-between border-top border-secondary border-opacity-25">
          <button className="btn btn-link text-muted text-decoration-none px-0 fs-6">
            <i className="fa-solid fa-arrow-left me-2"></i>Previous
          </button>
          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary text-light fw-semibold px-4">Run Code</button>
            <button className="btn btn-primary fw-bold px-4" style={{ backgroundColor: "#3525cd", borderColor: "#3525cd" }}>
              Submit <i className="fa-solid fa-rocket ms-1"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}