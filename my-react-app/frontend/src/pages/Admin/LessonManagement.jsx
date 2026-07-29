import { useState, useEffect, useRef } from "react";
import "../Css/LessonEditor.css";

import ContentBlocks from "../../components/Admin/LessonEditor/ContentBlocks";
import AddContentDropdown from "../../components/Admin/LessonEditor/AddContentDropdown";
import FileSelectModal from "../../components/Admin/LessonEditor/FileSelectModal";

export default function LessonManagement({
  title = "Section Title",
  blocks = [],
  onChangeData,
}) {
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedMediaType, setSelectedMediaType] = useState("File");

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [availableProblems, setAvailableProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const [systemFiles, setSystemFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  const BASE_URL = "http://localhost:5000/api/system-files";
  const API_PROBLEMS_URL = "http://localhost:5000/api/problems";

  const fetchSystemFiles = async () => {
    try {
      const res = await fetch(BASE_URL);
      const result = await res.json();
      if (result.success) {
        setSystemFiles(result.data || []);
      }
    } catch {
      // Direct error handling without debug log
    }
  };

  useEffect(() => {
    fetchSystemFiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowContentMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    if (onChangeData) {
      onChangeData(newTitle, blocks);
    }
  };

  const handleSelectMediaType = (type) => {
    setSelectedMediaType(type);
    setShowContentMenu(false);
    setSelectedFile(null);
    setShowFileModal(true);
  };

  const handleOpenProblemModal = async () => {
    setShowContentMenu(false);
    setShowProblemModal(true);
    setLoadingProblems(true);

    try {
      const res = await fetch(API_PROBLEMS_URL);
      const result = await res.json();
      if (result.success || Array.isArray(result.data)) {
        setAvailableProblems(result.data || result || []);
      }
    } catch {
      alert("Không thể kết nối đến máy chủ lấy danh sách bài tập!");
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleSelectProblem = (prob) => {
    const probId = prob.IdProblem || prob.id;

    if (blocks.some((b) => b.type === "problem" && b.problemId === probId)) {
      alert("Bài tập này đã có trong danh sách!");
      return;
    }

    const newBlock = {
      id: "b-" + Date.now(),
      type: "problem",
      problemId: probId,
      title: prob.Title || prob.title,
      difficulty: prob.Difficulty || prob.difficulty || "Easy",
      timeLimit: prob.Time_limit || prob.timeLimit || 1000,
      memoryLimit: prob.Memory_limit || prob.memoryLimit || 256,
    };

    const updatedBlocks = [...blocks, newBlock];
    if (onChangeData) {
      onChangeData(title, updatedBlocks);
    }
    setShowProblemModal(false);
  };

  const handleAddMediaBlock = () => {
    if (!selectedFile) {
      alert("Vui lòng chọn một file!");
      return;
    }

    const ext = (selectedFile.FileType || "").toLowerCase();
    const isImage = ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
    const isVideo = ["mp4", "mkv", "avi", "mov"].includes(ext);

    let blockType = "document";
    if (isImage) blockType = "image";
    else if (isVideo) blockType = "video";

    const newBlock = {
      id: "b-" + Date.now(),
      fileId: selectedFile.IdFile,
      type: blockType,
      fileName: `${selectedFile.FileName || "File"}.${selectedFile.FileType || ""}`,
      fileType: selectedFile.FileType,
      fileSize: selectedFile.FileSize
        ? `${(selectedFile.FileSize / (1024 * 1024)).toFixed(1)} MB`
        : "0 MB",
      filePath: selectedFile.Path || selectedFile.filePath || "",
    };

    const updatedBlocks = [...blocks, newBlock];
    if (onChangeData) {
      onChangeData(title, updatedBlocks);
    }
    setShowFileModal(false);
  };

  const handleAddTextBlock = () => {
    const newBlock = {
      id: "b-" + Date.now(),
      type: "text",
      value: "",
    };
    const updatedBlocks = [...blocks, newBlock];
    if (onChangeData) {
      onChangeData(title, updatedBlocks);
    }
    setShowContentMenu(false);
  };

  const handleTextBlockChange = (id, text) => {
    const updatedBlocks = blocks.map((b) =>
      b.id === id ? { ...b, value: text } : b
    );
    if (onChangeData) {
      onChangeData(title, updatedBlocks);
    }
  };

  const handleRemoveBlock = (id) => {
    const updatedBlocks = blocks.filter((b) => b.id !== id);
    if (onChangeData) {
      onChangeData(title, updatedBlocks);
    }
  };

  const filteredFiles = systemFiles.filter((f) => {
    const fileName = f.FileName?.toLowerCase() || "";
    const ext = f.FileType?.toLowerCase() || "";
    const matchesSearch = fileName.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedMediaType === "Image") {
      return ["png", "jpg", "jpeg", "gif", "webp"].includes(ext);
    }
    if (selectedMediaType === "Video") {
      return ["mp4", "mkv", "avi", "mov"].includes(ext);
    }
    if (selectedMediaType === "Document") {
      return ["pdf", "docx", "doc", "pptx", "xlsx", "txt"].includes(ext);
    }
    return true;
  });

  return (
    <div className="lesson-editor-container p-0">
      <div className="editor-main-card p-4 p-md-5">
        <div className="border-bottom pb-3 mb-4 d-flex align-items-center justify-content-between">
          <input
            type="text"
            className="form-control form-control-lg border-0 fs-2 fw-bold text-dark p-0 shadow-none"
            value={title}
            onChange={handleTitleChange}
            placeholder="Section Title"
          />
        </div>

        <ContentBlocks
          blocks={blocks}
          onTextChange={handleTextBlockChange}
          onRemove={handleRemoveBlock}
        />

        <AddContentDropdown
          dropdownRef={dropdownRef}
          showMenu={showContentMenu}
          setShowMenu={setShowContentMenu}
          onAddText={handleAddTextBlock}
          onSelectMedia={handleSelectMediaType}
          onSelectProblem={handleOpenProblemModal}
        />
      </div>

      {showFileModal && (
        <FileSelectModal
          selectedMediaType={selectedMediaType}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredFiles={filteredFiles}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          onClose={() => setShowFileModal(false)}
          onAddMedia={handleAddMediaBlock}
        />
      )}

      {showProblemModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header border-bottom px-4 py-3">
                <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                  <i className="fa-solid fa-code text-primary"></i> Chọn Bài tập từ Thư viện
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProblemModal(false)}
                ></button>
              </div>

              <div
                className="modal-body p-4"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                {loadingProblems ? (
                  <div className="text-center py-4 text-muted">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Đang tải danh sách bài tập...
                  </div>
                ) : availableProblems.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    Chưa có bài tập nào trong Problem Management.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light small text-muted">
                        <tr>
                          <th>Tên bài tập</th>
                          <th>Mã ID</th>
                          <th>Độ khó</th>
                          <th>Giới hạn thời gian</th>
                          <th className="text-end">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {availableProblems.map((prob) => {
                          const pId = prob.IdProblem || prob.id;
                          const isAdded = blocks.some(
                            (b) => b.type === "problem" && b.problemId === pId
                          );

                          return (
                            <tr key={pId}>
                              <td className="fw-bold text-dark">
                                {prob.Title || prob.title}
                              </td>
                              <td className="small text-muted">#PROB{pId}</td>
                              <td>
                                <span
                                  className={`badge rounded-pill ${
                                    (prob.Difficulty || prob.difficulty) ===
                                    "Easy"
                                      ? "bg-success bg-opacity-10 text-success"
                                      : (prob.Difficulty || prob.difficulty) ===
                                        "Medium"
                                      ? "bg-warning bg-opacity-10 text-warning"
                                      : "bg-danger bg-opacity-10 text-danger"
                                  }`}
                                >
                                  {prob.Difficulty ||
                                    prob.difficulty ||
                                    "Easy"}
                                </span>
                              </td>
                              <td className="small text-muted">
                                {prob.Time_limit || prob.timeLimit || 1000} ms
                              </td>
                              <td className="text-end">
                                <button
                                  className={`btn btn-sm rounded-3 px-3 fw-medium ${
                                    isAdded
                                      ? "btn-secondary disabled"
                                      : "btn-primary"
                                  }`}
                                  onClick={() => handleSelectProblem(prob)}
                                  disabled={isAdded}
                                >
                                  {isAdded ? "Đã thêm" : "Thêm vào Section"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top px-4 py-3">
                <button
                  className="btn btn-light rounded-3 px-4 fw-medium"
                  onClick={() => setShowProblemModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}