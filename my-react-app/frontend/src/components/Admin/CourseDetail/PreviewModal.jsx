import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function PreviewModal({ show, onClose, lessons = [], courseTitle, courseThumbnail }) {
  const lessonList = Array.isArray(lessons) ? lessons : [];
  const [activeLessonId, setActiveLessonId] = useState(null);

  const getLessonId = (item) => item?.id ?? item?.IdLesson ?? item?.LessonId;

  // Chọn bài học đầu tiên khi mở modal
  useEffect(() => {
    if (show && lessonList.length > 0) {
      setActiveLessonId(getLessonId(lessonList[0]));
    }
  }, [show, lessons]);

  // 🟢 KHÓA SCROLLBAR CỦA ADMIN DASHBOARD VÀ BODY KHI MODAL MỞ
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  const currentLesson =
    lessonList.find((l) => String(getLessonId(l)) === String(activeLessonId)) ||
    lessonList[0];

  const fileList = currentLesson?.files ?? currentLesson?.Files ?? [];

  const getFileUrl = (rawPath) => {
    if (!rawPath) return "#";
    if (rawPath.startsWith("http")) return rawPath;
    const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    return cleanPath.includes("assets/")
      ? `http://localhost:5000/${cleanPath}`
      : `http://localhost:5000/assets/files/${cleanPath}`;
  };

  // Nội dung Modal
  const modalContent = (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(0,0,0,0.65)",
        zIndex: 1055, // Đảm bảo đè lên trên toàn bộ UI Admin
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl w-100 my-0" style={{ maxWidth: "85vw" }}>
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden text-start">
          
          {/* HEADER MODAL */}
          <div className="modal-header border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-start bg-white">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">
                  Preview as Learner
                </span>
              </div>
              <h4 className="fw-bold text-dark mb-1">{courseTitle || "Chưa có tên khóa học"}</h4>
              <p className="text-muted small mb-0">Tổng số bài học: {lessonList.length} bài</p>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="border rounded-3 p-2 bg-light d-flex align-items-center gap-3">
                <div
                  className="rounded-circle border border-2 border-success d-flex align-items-center justify-content-center fw-bold text-success"
                  style={{ width: "42px", height: "42px", fontSize: "12px" }}
                >
                  0%
                </div>
                <div className="text-start">
                  <span className="d-block text-muted" style={{ fontSize: "10px" }}>Course Progress</span>
                  <strong className="text-dark fs-6">0 hours in total</strong>
                </div>
              </div>
              <button className="btn-close" onClick={onClose}></button>
            </div>
          </div>

          {/* BODY MODAL */}
          <div className="modal-body p-4 pt-2 bg-white">
            <div className="row g-0 border rounded-4 overflow-hidden" style={{ height: "62vh" }}>
              
              {/* CỘT TRÁI: DANH SÁCH LESSON */}
              <div
                className="col-12 col-md-4 border-end bg-light p-3"
                style={{ height: "100%", overflowY: "auto" }}
              >
                <h6 className="fw-bold text-dark mb-3 px-1">Nội dung khóa học</h6>
                
                {lessonList.map((item, index) => {
                  const itemId = getLessonId(item) ?? index;
                  const isActive = String(itemId) === String(activeLessonId);
                  const title = item.title ?? item.Title ?? item.LessonName ?? `Section - ${index + 1}`;
                  const updatedAt = item.updatedAt ?? item.CreateDate;

                  return (
                    <div
                      key={itemId}
                      onClick={() => setActiveLessonId(itemId)}
                      className={`p-3 mb-2 rounded-3 transition-all ${
                        isActive
                          ? "bg-success bg-opacity-10 border-start border-4 border-success shadow-sm"
                          : "bg-white border text-secondary"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      <h6 className={`fw-bold mb-1 ${isActive ? "text-success" : "text-dark"}`} style={{ fontSize: "14px" }}>
                        {title}
                      </h6>
                      <small className="text-muted d-block" style={{ fontSize: "11px" }}>
                        Updated: {updatedAt ? new Date(updatedAt).toLocaleDateString("vi-VN") : "Mới cập nhật"}
                      </small>
                    </div>
                  );
                })}

                {lessonList.length === 0 && (
                  <div className="text-center py-4 text-muted small">Khóa học chưa có bài học nào.</div>
                )}
              </div>

              {/* CỘT PHẢI: NỘI DUNG VĂN BẢN / MEDIA / FILE (ĐÂY LÀ KHU VỰC DUY NHẤT CUỘN TRONG MODAL) */}
              <div
                className="col-12 col-md-8 p-4 bg-white"
                style={{ height: "100%", overflowY: "auto" }}
              >
                {currentLesson ? (
                  <div>
                    <h5 className="fw-bold text-dark mb-3">
                      {currentLesson.title ?? currentLesson.Title ?? currentLesson.LessonName}
                    </h5>

                    {/* Banner / Thumbnail */}
                    {courseThumbnail && (
                      <div className="rounded-3 overflow-hidden bg-light mb-3 border" style={{ maxHeight: "260px" }}>
                        <img
                          src={courseThumbnail}
                          alt="Lesson Banner"
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    )}

                    {/* Nội dung bài học */}
                    <div
                      className="text-secondary lh-lg mb-4"
                      style={{ fontSize: "14px" }}
                      dangerouslySetInnerHTML={{
                        __html:
                          (currentLesson.content ?? currentLesson.Content ?? currentLesson.Description) ||
                          "<i>Chưa có nội dung chi tiết cho bài học này.</i>",
                      }}
                    />

                    {/* File đính kèm */}
                    {fileList.length > 0 && (
                      <div className="pt-3 border-top mt-4">
                        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "13px" }}>
                          Tài liệu đính kèm ({fileList.length}):
                        </h6>
                        <div className="d-flex flex-column gap-2">
                          {fileList.map((file, fIdx) => {
                            const fileId = file.id ?? file.IdFile ?? fIdx;
                            const fileName = file.fileName ?? file.FileName ?? "Tài liệu học tập";
                            const rawPath = file.filePath ?? file.FilePath;
                            const fileUrl = getFileUrl(rawPath);

                            return (
                              <a
                                key={fileId}
                                href={encodeURI(fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 border rounded-3 bg-light text-decoration-none text-dark d-flex align-items-center gap-2 small"
                              >
                                <i className="fa-regular fa-file-lines text-primary fs-5"></i>
                                <span className="fw-medium">{fileName}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">Vui lòng chọn bài học.</div>
                )}
              </div>

            </div>
          </div>

          {/* FOOTER MODAL */}
          <div className="modal-footer border-0 px-4 pb-4 pt-0 d-flex justify-content-between bg-white">
            <span className="text-muted small">Chế độ xem thử khóa học dành cho Giảng viên/Admin.</span>
            <button className="btn btn-secondary rounded-3 px-4" onClick={onClose}>
              Đóng xem trước
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  // DÙNG PORTAL RENDER TRỰC TIẾP LÊN BODY ĐỂ TRIỆT TIÊU SCROLLBAR CỦA ADMIN DASHBOARD
  return ReactDOM.createPortal(modalContent, document.body);
}