export default function TabContent({ lessons = [], selectedLessonId, onSelectLesson }) {
  // 1. Chuẩn hóa mảng bài học
  const lessonList = Array.isArray(lessons) ? lessons : [];

  // 2. Hàm phòng thủ lấy ID
  const getLessonId = (item) => item?.id ?? item?.IdLesson ?? item?.LessonId ?? item?.id_lesson;

  // 3. Tìm bài học đang chọn (Mặc định chọn bài đầu tiên nếu chưa chọn)
  const selectedLesson =
    lessonList.find((l) => String(getLessonId(l)) === String(selectedLessonId)) ||
    lessonList[0];

  // 4. Bóc tách mảng File & Bài tập (Bổ sung phòng thủ hầu hết mọi kiểu naming convention)
  const fileList =
    selectedLesson?.files ??
    selectedLesson?.Files ??
    selectedLesson?.LessonFiles ??
    selectedLesson?.lesson_files ??
    [];

  const problemList =
    selectedLesson?.problems ??
    selectedLesson?.Problems ??
    selectedLesson?.LessonProblems ??
    selectedLesson?.lesson_problems ??
    selectedLesson?.lessonProblems ??
    selectedLesson?.ProblemsList ??
    selectedLesson?.problemsList ??
    [];

  // --- HÀM HELPER HIỂN THỊ ---
  const formatLessonTitle = (title, order) => {
    if (!title) return `Bài ${order}`;
    const lower = title.trim().toLowerCase();
    if (lower.startsWith("bài") || lower.startsWith("chương")) {
      return title;
    }
    return `Bài ${order}: ${title}`;
  };

  const formatFileSize = (size) => {
    if (!size) return "";
    if (typeof size === "string" && (size.includes("MB") || size.includes("KB"))) {
      return `(${size})`;
    }
    const numSize = Number(size);
    if (isNaN(numSize)) return "";
    return `(${Math.round(numSize / 1024)} KB)`;
  };

  const getFileIcon = (file) => {
    const fileName = (file?.fileName ?? file?.FileName ?? file?.filePath ?? file?.FilePath ?? "").toLowerCase();
    const fileType = (file?.fileType ?? file?.FileType ?? "").toLowerCase();

    if (fileName.endsWith(".pdf") || fileType.includes("pdf")) return "fa-regular fa-file-pdf text-danger";
    if (fileName.endsWith(".doc") || fileName.endsWith(".docx") || fileType.includes("word") || fileType.includes("officedocument.wordprocessingml")) return "fa-regular fa-file-word text-primary";
    if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx") || fileType.includes("excel") || fileType.includes("spreadsheetml")) return "fa-regular fa-file-excel text-success";
    if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx") || fileType.includes("powerpoint") || fileType.includes("presentationml")) return "fa-regular fa-file-powerpoint text-warning";
    return "fa-regular fa-file text-secondary";
  };

  const getFileUrl = (file) => {
    const rawPath = file?.filePath ?? file?.FilePath ?? "";
    if (!rawPath) return "#";
    if (rawPath.startsWith("http")) return rawPath;

    const cleanPath = rawPath.startsWith("/") ? rawPath.slice(1) : rawPath;
    if (cleanPath.includes("assets/")) return `http://localhost:5000/${cleanPath}`;

    const lower = cleanPath.toLowerCase();
    const isImage = lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp");
    const folder = isImage ? "assets/image" : "assets/files";
    return `http://localhost:5000/${folder}/${cleanPath}`;
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 p-0 overflow-hidden bg-white text-start">
      <div className="row g-0">
        
        {/* COL 1: DANH SÁCH BÀI HỌC (BÊN TRÁI TAB CONTENT) */}
        <div className="col-12 col-md-4 border-end bg-light p-3" style={{ minHeight: "400px" }}>
          <div className="d-flex justify-content-between align-items-center mb-3 px-2">
            <h6 className="fw-bold mb-0 text-dark">
              Danh sách bài học ({lessonList.length})
            </h6>
          </div>

          <div className="d-flex flex-column gap-2">
            {lessonList.map((item, idx) => {
              const itemId = getLessonId(item) ?? `lesson-${idx}`;
              const itemTitle = item.title ?? item.Title ?? item.LessonName ?? `Bài ${idx + 1}`;
              const itemOrder = item.orderIndex ?? item.Order_index ?? item.OrderIndex ?? idx + 1;
              const itemDate = item.updatedAt ?? item.CreateDate ?? item.createdAt;

              const isSelected = selectedLesson && String(getLessonId(selectedLesson)) === String(itemId);

              return (
                <div
                  key={itemId}
                  onClick={() => onSelectLesson && onSelectLesson(itemId)}
                  className={`p-3 rounded-3 transition-all ${
                    isSelected ? "bg-white shadow-sm border-start border-success border-4" : "bg-light"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <h6 className={`fw-bold mb-1 ${isSelected ? "text-dark" : "text-secondary"}`} style={{ fontSize: "14px" }}>
                    {formatLessonTitle(itemTitle, itemOrder)}
                  </h6>
                  
                  {itemDate && (
                    <span className="text-muted" style={{ fontSize: "11px" }}>
                      {typeof itemDate === "string" && itemDate.includes("/")
                        ? itemDate
                        : new Date(itemDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>
              );
            })}

            {lessonList.length === 0 && (
              <div className="text-center py-4 text-muted small">
                Khóa học chưa có bài học nào.
              </div>
            )}
          </div>
        </div>

        {/* COL 2: NỘI DUNG CHI TIẾT BÀI HỌC (BÊN PHẢI UI) */}
        <div className="col-12 col-md-8 p-4">
          {selectedLesson ? (
            <div>
              {/* Tiêu đề bài học chi tiết */}
              <h4 className="fw-bold text-dark mb-3">
                {selectedLesson.title ?? selectedLesson.Title ?? selectedLesson.LessonName}
              </h4>

              {/* Nội dung văn bản/mô tả của bài học */}
              <div
                className="text-secondary lh-lg mb-4"
                dangerouslySetInnerHTML={{
                  __html:
                    (selectedLesson.content ?? selectedLesson.Content ?? selectedLesson.Description) ||
                    "<i>Chưa có nội dung văn bản.</i>",
                }}
              />

              {/* HIỂN THỊ KHỐI BÀI TẬP LẬP TRÌNH */}
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i className="fa-solid fa-code text-primary"></i> Bài tập lập trình thực hành:
                </h6>

                {Array.isArray(problemList) && problemList.length > 0 ? (
                  <div className="d-flex flex-column gap-3">
                    {problemList.map((prob, pIdx) => {
                      const probId = prob.IdProblem ?? prob.idProblem ?? prob.id ?? prob.ID ?? pIdx;
                      const title = prob.Title ?? prob.title ?? prob.ProblemName ?? `Bài tập ${pIdx + 1}`;
                      const difficulty = prob.Difficulty ?? prob.difficulty ?? "Thông thường";
                      const timeLimit = prob.Time_limit ?? prob.time_limit ?? prob.timeLimit ?? prob.TimeLimit ?? 1000;

                      return (
                        <div
                          key={probId}
                          className="card border-0 shadow-sm rounded-3 bg-white border-start border-4 border-primary p-3"
                        >
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                                <i className="fa-solid fa-laptop-code fs-4"></i>
                              </div>
                              <div>
                                <div className="fw-bold text-dark fs-6">{title}</div>
                                <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                    #PROB{probId}
                                  </span>
                                  <span>
                                    • Độ khó: <strong className="text-dark">{difficulty}</strong>
                                  </span>
                                  <span>• Thời gian: {timeLimit} ms</span>
                                </div>
                              </div>
                            </div>

                            <button className="btn btn-primary btn-sm px-3 rounded-2 fw-medium">
                              Làm bài <i className="fa-solid fa-arrow-right ms-1"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Hiển thị thông báo khi chưa gắn bài tập */
                  <div className="p-3 bg-light rounded-3 text-muted border text-center small">
                    <i className="fa-regular fa-folder-open me-2"></i>
                    Bài học này hiện chưa gắn bài tập thực hành nào.
                  </div>
                )}
              </div>

              {/* TÀI LIỆU ĐÍNH KÈM */}
              {Array.isArray(fileList) && fileList.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-3">Tài liệu đính kèm:</h6>
                  <div className="d-flex flex-column gap-2">
                    {fileList.map((file, fIdx) => {
                      const fileId = file.id ?? file.IdFile ?? fIdx;
                      const fileName = file.fileName ?? file.FileName ?? "Tài liệu đính kèm";
                      const fileUrl = getFileUrl(file);

                      return (
                        <a
                          key={fileId}
                          href={encodeURI(fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border rounded-3 bg-light text-decoration-none text-dark d-flex align-items-center gap-2"
                        >
                          <i className={`${getFileIcon(file)} fs-5`}></i>
                          <span className="fw-medium">{fileName}</span>
                          <span className="text-muted ms-auto small">
                            {formatFileSize(file.fileSize ?? file.FileSize)}
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              Vui lòng chọn bài học để xem nội dung.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}