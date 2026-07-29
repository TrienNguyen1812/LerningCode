import { useState, useEffect, useRef } from "react";
import ContentHeader from "../../components/admin/ContentHeader";
import "../Css/FileManagement.css";

import MoreIcon from "../../assets/icons/more.svg";

export default function FileManagement() {
  const [files, setFiles] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const BASE_URL = "http://localhost:5000/api/files";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".file-card-action")) {
        setActiveMenuId(null);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch(BASE_URL);
      const result = await res.json();
      if (result.success) setFiles(result.data || []);
    } catch (err) {
      console.error("Lỗi lấy danh sách file:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Xóa File
  const handleDeleteFile = async (id) => {
    setActiveMenuId(null);
    if (!window.confirm("Bạn có chắc chắn muốn xóa file này khỏi hệ thống?")) return;

    try {
      const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        setFiles(files.filter((f) => f.id !== id));
      } else {
        alert("Xóa file thất bại: " + result.message);
      }
    } catch (err) {
      alert("Lỗi server khi xóa file!");
    }
  };

  const uploadFileToServer = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    try {
      const res = await fetch(`${BASE_URL}/upload`, { method: "POST", body: formData });
      const result = await res.json();
      if (result.success) {
        fetchFiles();
        setShowUploadModal(false);
      } else alert(`Upload thất bại: ${result.message}`);
    } catch (err) {
      alert("Lỗi kết nối đến Server!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const AddNewDropdownButton = (
    <div className="position-relative" ref={dropdownRef}>
      <button
        type="button"
        className="cm-btn-primary d-flex align-items-center gap-1"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="fs-4 lh-1" style={{ marginTop: "-2px" }}>+</span> Add New
        <span style={{ fontSize: "11px" }}>▼</span>
      </button>

      {showDropdown && (
        <div className="position-absolute end-0 mt-2 bg-white rounded-3 shadow-lg border-0 py-2" style={{ zIndex: 1050, minWidth: "150px" }}>
          <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary fw-medium" onClick={() => { setShowDropdown(false); setShowUploadModal(true); }}>
            File
          </button>
          <button className="dropdown-item d-flex align-items-center gap-2 px-3 py-2 text-secondary fw-medium" onClick={() => { setShowDropdown(false); alert("Tính năng tạo Folder!"); }}>
            Folder
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm border-0 position-relative">
      <ContentHeader
        count={files.length}
        unitText="Files in total"
        customAction={AddNewDropdownButton}
      />

      {/* DANH SÁCH FILE */}
      {files.length === 0 ? (
        <div className="text-center py-5 my-3 border border-dashed rounded-3 bg-light">
          <p className="text-muted mb-0 fw-medium">Chưa có tập tin nào được tải lên.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4 mt-2">
          {files.map((file) => {
            const isMenuOpen = activeMenuId === file.id;

            return (
              <div key={file.id} className="col">
                <div className="file-card h-100">
                  
                  {/* Preview Area */}
                  <div className="file-card-preview">
                    
                    {/* Action 3 Chấm */}
                    <div className="position-absolute top-0 end-0 m-2 file-card-action" style={{ zIndex: 10 }}>
                      <button
                        type="button"
                        className="btn-three-dots"
                        onClick={() => setActiveMenuId(isMenuOpen ? null : file.id)}
                      >
                        <img src={MoreIcon} alt="More" style={{ width: "16px", height: "16px" }} />
                      </button>

                      {/* DROPDOWN MENU */}
                      {isMenuOpen && (
                        <div className="file-dropdown-menu">
                          <a href={file.path || "#"} target="_blank" rel="noreferrer" className="file-dropdown-item">
                            Preview
                          </a>
                          <button className="file-dropdown-item">
                            Pin File
                          </button>
                          <a href={file.path || "#"} download className="file-dropdown-item">
                            Download File
                          </a>
                          
                          <div className="my-1 border-top"></div>

                          <button className="file-dropdown-item">
                            Rename File
                          </button>
                          <button className="file-dropdown-item">
                            Duplicate File
                          </button>

                          <div className="my-1 border-top"></div>

                          {/* NÚT DELETE FILE MÀU ĐỎ */}
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="file-dropdown-item delete-item"
                          >
                            Delete File
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Temporary Placeholder cho Icon giữa Card */}
                    <div className="text-uppercase fw-bold text-muted opacity-50 fs-5 border rounded-3 px-3 py-1 bg-white">
                      {file.fileType || "FILE"}
                    </div>
                  </div>

                  {/* Body chứa thông tin File */}
                  <div className="p-3">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="badge bg-light text-dark border me-1" style={{ fontSize: "10px" }}>
                        {file.fileType}
                      </span>
                      <h6 className="m-0 fw-semibold text-dark text-truncate" title={file.fileName} style={{ fontSize: "14px" }}>
                        {file.fileName}.{file.fileType}
                      </h6>
                    </div>
                    <span className="text-muted small" style={{ fontSize: "12px" }}>
                      {file.fileSize ? `${(file.fileSize / 1024).toFixed(1)} KB` : "0 KB"}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 rounded-4 p-3 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <div className="w-100 text-center">
                  <h4 className="fw-bold mb-1" style={{ color: "#111827" }}>Upload New File</h4>
                  <p className="text-muted small mb-0">Please upload the file of yours</p>
                </div>
                <button type="button" className="btn-close position-absolute end-0 top-0 m-4" onClick={() => setShowUploadModal(false)}></button>
              </div>

              <div className="modal-body py-4">
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) uploadFileToServer(e.dataTransfer.files[0]); }}
                  className={`border rounded-4 p-5 text-center d-flex flex-column align-items-center justify-content-center ${
                    dragActive ? "border-success bg-light" : "border-2"
                  }`}
                  style={{ borderColor: dragActive ? "#009688" : "#E5E7EB", borderStyle: "dashed", minHeight: "260px" }}
                >
                  <p className="fw-medium text-secondary mb-3">Drag and drop your file here or you can</p>
                  <label htmlFor="modal-file-input" className="btn px-4 py-2 rounded-3 fw-medium mb-3 cursor-pointer" style={{ border: "1px solid #009688", color: "#009688" }}>
                    {isUploading ? "Uploading..." : "Browse File"}
                  </label>
                  <input id="modal-file-input" type="file" ref={fileInputRef} className="d-none" onChange={(e) => e.target.files[0] && uploadFileToServer(e.target.files[0])} disabled={isUploading} />
                  <span className="text-muted" style={{ fontSize: "12px" }}>You can upload: PDF, DOC, ZIP, MP3, MP4...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}