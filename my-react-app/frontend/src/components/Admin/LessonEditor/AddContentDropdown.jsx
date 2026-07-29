import { useState } from "react";

export default function AddContentDropdown({
  dropdownRef,
  showMenu,
  setShowMenu,
  onAddText,
  onSelectMedia,
  onSelectProblem, // Bổ sung prop trigger mở Modal Problem
}) {
  // State quản lý riêng cho menu Library
  const [showLibraryMenu, setShowLibraryMenu] = useState(false);

  return (
    <div className="mt-4 position-relative" ref={dropdownRef}>
      <div className="d-flex align-items-center gap-2">
        {/* Nút + Content (Giữ nguyên logic mở menu Content của bạn) */}
        <button
          type="button"
          className="btn btn-light border rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2"
          onClick={() => {
            setShowMenu(!showMenu);
            setShowLibraryMenu(false); // Đóng menu Library nếu đang mở
          }}
        >
          <span className="fs-5 lh-1">+</span> Content
        </button>

        {/* Nút Library (Có event onClick riêng) */}
        <button
          type="button"
          className="btn btn-light border rounded-3 px-3 py-2 fw-medium d-flex align-items-center gap-2"
          onClick={() => {
            setShowLibraryMenu(!showLibraryMenu);
            setShowMenu(false); // Đóng menu Content nếu đang mở
          }}
        >
          <i className="fa-solid fa-folder-plus text-primary"></i> Library
        </button>
      </div>

      {/* 1. DROPDOWN CHO NÚT CONTENT (GIỮ NGUYÊN HOÀN TOÀN) */}
      {showMenu && (
        <div className="position-absolute start-0 mt-2 content-dropdown-menu shadow-lg p-2 rounded bg-white border z-3">
          <div className="dropdown-section-title px-2 py-1 text-muted small fw-bold">
            Basic Blocks
          </div>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={onAddText}
          >
            Text
          </button>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={() => setShowMenu(false)}
          >
            Bullet List
          </button>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={() => setShowMenu(false)}
          >
            Numbered List
          </button>

          <div className="dropdown-section-title px-2 py-1 text-muted small fw-bold mt-2">
            Media & Files
          </div>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={() => onSelectMedia("Image")}
          >
            Image
          </button>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={() => onSelectMedia("Video")}
          >
            Video
          </button>
          <button
            className="content-option-btn dropdown-item rounded py-1 px-2"
            onClick={() => onSelectMedia("Document")}
          >
            Document (DOCX, PPTX...)
          </button>
        </div>
      )}

      {/* 2. DROPDOWN RIÊNG BÊN LIBRARY */}
      {showLibraryMenu && (
        <div 
          className="position-absolute mt-2 content-dropdown-menu shadow-lg p-2 rounded bg-white border z-3"
          style={{ left: "120px" }} // Căn vị trí ngay bên dưới nút Library
        >
          <div className="dropdown-section-title px-2 py-1 text-muted small fw-bold">
            Bank & Library
          </div>
          <button
            type="button"
            className="content-option-btn dropdown-item rounded py-1 px-2 d-flex align-items-center gap-2 fw-semibold text-primary"
            onClick={() => {
              setShowLibraryMenu(false);
              if (onSelectProblem) onSelectProblem();
            }}
          >
            <i className="fa-solid fa-code"></i> Problem (Exercise)
          </button>
        </div>
      )}
    </div>
  );
}