import { useRef } from "react";

export default function GeneralInfoForm({ formData, setFormData, previewImage, setPreviewImage }) {
  const fileInputRef = useRef(null);

  // Xử lý khi chọn ảnh cover từ máy tính
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, thumbnail: file }));
      // Tạo URL preview tạm thời để hiển thị ngay trên UI
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, thumbnail: null }));
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-white p-4 rounded-3 shadow-sm" style={{ maxWidth: "800px" }}>
      {/* Title Header */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Set the General Information</h4>
        <p className="text-muted fs-6">
          This information will attract learners to take this course, and help them find it easily.
        </p>
      </div>

      {/* 1. COURSE COVER (Ảnh bìa khóa học) */}
      <div className="mb-4">
        <label className="form-label fw-semibold text-dark">Course Cover</label>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="d-none" 
        />

        {previewImage ? (
          /* NẾU ĐÃ CÓ Ảnh Prevew/Tải lên */
          <div className="position-relative rounded-3 overflow-hidden border" style={{ height: "200px" }}>
            <img 
              src={previewImage} 
              alt="Course Cover" 
              className="w-100 h-100 object-fit-cover" 
            />
            {/* Nút X màu đen góc trên bên phải như trong hình */}
            <button
              type="button"
              className="btn btn-dark position-absolute top-0 end-0 m-2 rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: "28px", height: "28px", opacity: 0.85 }}
              onClick={handleRemoveImage}
            >
              <span className="text-white fs-5 lh-1">&times;</span>
            </button>
          </div>
        ) : (
          /* NẾU CHƯA CHỌN ẢNH: Khung nhấp để chọn file từ máy */
          <div
            className="border border-2 border-dashed rounded-3 p-4 text-center bg-light cursor-pointer"
            style={{ cursor: "pointer", borderColor: "#dee2e6" }}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <div className="py-3">
              <i className="fa-regular fa-image fs-1 text-secondary mb-2"></i>
              <p className="mb-1 fw-medium text-dark">Click to upload Course Cover</p>
              <span className="text-muted small">PNG, JPG, WEBP up to 5MB</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. COURSE NAME */}
      <div className="mb-4">
        <label className="form-label fw-semibold text-dark">
          Course Name <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control form-control-lg fs-6"
          placeholder="e.g. Introduction to Figma"
          value={formData.courseName}
          onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
          required
        />
      </div>

      {/* 3. COURSE DESCRIPTION */}
      <div className="mb-3">
        <label className="form-label fw-semibold text-dark">Course Description</label>
        <textarea
          className="form-control fs-6"
          rows="5"
          placeholder="Write a brief description about what students will learn..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        ></textarea>
      </div>
    </div>
  );
}