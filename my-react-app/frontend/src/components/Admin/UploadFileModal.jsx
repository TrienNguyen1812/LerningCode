import { useState, useRef } from "react";

export default function UploadFileModal({ show, onClose, onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!show) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert("Upload thành công!");
        setSelectedFile(null);
        onUploadSuccess && onUploadSuccess(data.file);
        onClose();
      } else {
        alert("Upload thất bại: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi upload:", error);
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 position-relative text-center d-block">
            <h4 className="modal-title fw-bold text-dark">Upload New File</h4>
            <p className="text-muted small mb-0">Please upload the file of yours</p>
            <button
              type="button"
              className="btn-close position-absolute"
              style={{ top: "20px", right: "20px" }}
              onClick={onClose}
            ></button>
          </div>

          {/* Body: Drag and Drop Area */}
          <div className="modal-body p-4">
            <div
              className={`p-5 text-center border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center transition-all ${
                isDragging ? "bg-light border-teal" : "bg-white border-light-subtle"
              }`}
              style={{
                borderStyle: "dashed",
                borderColor: isDragging ? "#0d9488" : "#cbd5e1",
                backgroundColor: isDragging ? "#f0fdf4" : "#fafafa",
                minHeight: "260px",
                cursor: "pointer",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                onChange={handleFileSelect}
              />

              {/* Icon Upload Circle */}
              <div
                className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px", backgroundColor: "#ccfbf1", color: "#0d9488" }}
              >
                <i className="fa-solid fa-upload fs-3"></i>
              </div>

              {selectedFile ? (
                <div>
                  <h6 className="fw-bold text-dark mb-1">{selectedFile.name}</h6>
                  <span className="badge bg-secondary">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              ) : (
                <>
                  <p className="fw-medium text-secondary mb-2" style={{ fontSize: "15px" }}>
                    Drag and drop your file here or you can
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline-teal px-4 py-2 fw-semibold rounded-3 mb-2"
                    style={{ borderColor: "#0d9488", color: "#0d9488" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse File
                  </button>
                  <span className="text-muted" style={{ fontSize: "11px" }}>
                    You can upload: PDF, DOC, XLS, MP3, MP4
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          {selectedFile && (
            <div className="modal-footer border-0 pt-0 pb-4 px-4 justify-content-end">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4 me-2"
                onClick={() => setSelectedFile(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn text-white px-4 rounded-3"
                style={{ backgroundColor: "#0d9488" }}
                disabled={uploading}
                onClick={handleUpload}
              >
                {uploading ? "Uploading..." : "Upload Now"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}