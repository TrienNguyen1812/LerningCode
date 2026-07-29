import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  FaAngleLeft,
  FaArrowLeft,
  FaArrowRight,
  FaCode,
  FaPaperclip,
  FaDownload,
  FaTriangleExclamation,
} from "react-icons/fa6";

export default function CourseDetailPage({
  course: propCourse,
  courseId: propCourseId,
  onStartCoding,
  onBack,
}) {
  const routeParams = useParams();
  
  // Xử lý Lấy ID khóa học linh hoạt từ Props hoặc Route Params
  const courseId =
    propCourseId ||
    propCourse?.id ||
    propCourse?.Id ||
    propCourse?.CourseId ||
    propCourse?.IdCourse ||
    routeParams?.courseId;

  // States Quản lý Dữ liệu
  const [course, setCourse] = useState(propCourse || null);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // States Chi tiết Bài học (Bài tập & File đính kèm)
  const [currentProblems, setCurrentProblems] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);

  // States Trạng thái UI
  const [loading, setLoading] = useState(true);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = "http://127.0.0.1:5000/api";
  const SERVER_HOST = "http://127.0.0.1:5000";

  // 1. Fetch thông tin khóa học & Danh sách bài học
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const loadDetailData = async () => {
      try {
        // Tải thông tin khóa học nếu chưa có từ prop
        const courseRes = await fetch(`${BASE_URL}/courses/${courseId}`, {
          signal: controller.signal,
        });
        if (courseRes.ok) {
          const resJson = await courseRes.json();
          const rawCourse = resJson.data || resJson.course || resJson;

          setCourse({
            ...rawCourse,
            title:
              rawCourse.title ||
              rawCourse.name ||
              rawCourse.CourseName ||
              "Chi tiết khóa học",
            id: rawCourse.id || rawCourse.Id || rawCourse.CourseId || courseId,
            progress: rawCourse.progress || rawCourse.Progress || 0,
            createdAt: rawCourse.createdAt || rawCourse.CreatedDate || "2026",
            thumbnail: rawCourse.thumbnail || rawCourse.Thumbnail || null,
          });
        }

        // Tải danh sách các bài học (Lessons/Chapters)
        const lessonRes = await fetch(`${BASE_URL}/lessons/course/${courseId}`, {
          signal: controller.signal,
        });
        if (lessonRes.ok) {
          const resLessonJson = await lessonRes.json();
          const rawLessons =
            resLessonJson.data || resLessonJson.lessons || resLessonJson;

          if (Array.isArray(rawLessons)) {
            const sortedLessons = [...rawLessons].sort((a, b) => {
              const orderA = a.orderIndex ?? a.OrderIndex ?? 0;
              const orderB = b.orderIndex ?? b.OrderIndex ?? 0;
              return orderA - orderB;
            });

            setLessons(sortedLessons);

            if (sortedLessons.length > 0) {
              const firstId =
                sortedLessons[0].id ??
                sortedLessons[0].IdLesson ??
                sortedLessons[0].LessonId;
              setSelectedLessonId((prev) => prev || firstId);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Lỗi fetch chi tiết khóa học:", err);
          setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadDetailData();

    return () => controller.abort();
  }, [courseId]);

  // 2. Fetch Chi tiết bài học (Lấy danh sách Bài tập & File tài liệu)
  useEffect(() => {
    if (!selectedLessonId) return;

    const controller = new AbortController();
    setLoadingLessonDetail(true);
    setCurrentProblems([]);
    setCurrentFiles([]);

    fetch(`${BASE_URL}/lessons/${selectedLessonId}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((resJson) => {
        if (!resJson) return;

        const lessonData = resJson.data || resJson.lesson || resJson;

        const rawProblems =
          lessonData.problems ||
          lessonData.Problems ||
          lessonData.lessonProblems ||
          lessonData.LessonProblems ||
          lessonData.lesson_problems ||
          lessonData.problemsList ||
          lessonData.ProblemLessons ||
          lessonData.problem_lessons ||
          [];

        const rawFiles =
          lessonData.files ||
          lessonData.Files ||
          lessonData.lessonFiles ||
          lessonData.LessonFiles ||
          lessonData.lesson_files ||
          lessonData.filesList ||
          [];

        setCurrentProblems(Array.isArray(rawProblems) ? rawProblems : []);
        setCurrentFiles(Array.isArray(rawFiles) ? rawFiles : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Lỗi fetch chi tiết bài học:", err);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingLessonDetail(false);
        }
      });

    return () => controller.abort();
  }, [selectedLessonId]);

  // Hàm ghép URL đầy đủ cho File tài liệu
  const getFullFileUrl = (fileObj) => {
    let rawPath =
      fileObj.fileUrl ||
      fileObj.FileUrl ||
      fileObj.path ||
      fileObj.url ||
      fileObj.filePath ||
      "";

    if (!rawPath) return "#";
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
      return rawPath;
    }

    rawPath = rawPath.replace(/\\/g, "/");
    if (!rawPath.startsWith("/")) {
      rawPath = "/" + rawPath;
    }

    return `${SERVER_HOST}${rawPath}`;
  };

  // Xác định vị trí bài học hiện tại trong danh sách
  const currentIndex = lessons.findIndex(
    (l) =>
      String(l.id ?? l.IdLesson ?? l.LessonId) === String(selectedLessonId)
  );
  const currentLesson = lessons[currentIndex] || null;

  if (loading) {
    return (
      <div className="text-center py-5 my-5">
        <div className="spinner-border text-teal" style={{ color: "#00bba7" }}></div>
        <p className="text-muted mt-2">Đang tải nội dung khóa học...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger shadow-sm border-0 rounded-3 my-4 text-start">
        <FaTriangleExclamation className="me-2" /> {error}
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 text-start">
      {/* 1. TOP HEADER - TÊN KHÓA HỌC & TIẾN ĐỘ */}
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <button
            className="btn btn-link p-0 text-secondary text-decoration-none fw-semibold mb-2 d-flex align-items-center gap-1"
            style={{ fontSize: "13px" }}
            onClick={() => (onBack ? onBack() : window.history.back())}
          >
            <FaAngleLeft size={12} /> Quay lại danh sách
          </button>
          <h3 className="fw-bold text-dark m-0" style={{ fontSize: "24px" }}>
            {course?.title || course?.name || course?.CourseName || "Chi tiết khóa học"}
          </h3>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
            <span
              className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1"
              style={{ fontSize: "11px" }}
            >
              ● Đang phát hành
            </span>
            <span
              className="badge bg-light text-secondary border rounded-pill px-2.5 py-1"
              style={{ fontSize: "11px" }}
            >
              Lập trình
            </span>
            <span className="text-muted" style={{ fontSize: "12px" }}>
              Ngày tạo: {course?.createdAt || "18/03/2026"}
            </span>
          </div>
        </div>

        {/* Khối Progress Tiến Độ */}
        <div className="bg-white border rounded-3 p-2.5 d-flex align-items-center gap-3 shadow-sm">
          <div
            className="rounded-circle border border-2 d-flex align-items-center justify-content-center fw-bold text-primary"
            style={{
              width: "42px",
              height: "42px",
              fontSize: "12px",
              borderColor: "#00bba7 !important",
              color: "#00bba7",
            }}
          >
            {course?.progress || 0}%
          </div>
          <div>
            <div
              className="text-muted fw-semibold"
              style={{ fontSize: "10px", textTransform: "uppercase" }}
            >
              Tiến độ khóa học
            </div>
            <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
              {lessons.length} Bài học
            </div>
          </div>
        </div>
      </div>

      <hr className="my-3 opacity-10" />

      {/* 2. BỐ CỤC CHÍNH (CỘT TRÁI: DANH SÁCH BÀI HỌC / CỘT PHẢI: CHI TIẾT) */}
      <div className="row g-4 mt-1">
        
        {/* --- CỘT TRÁI: DANH SÁCH BÀI HỌC (SECTIONS) --- */}
        <div className="col-12 col-md-3">
          <div className="d-flex flex-column gap-2">
            {lessons.length === 0 ? (
              <div className="text-muted small p-2">Chưa có bài học nào.</div>
            ) : (
              lessons.map((lesson, idx) => {
                const lessonId =
                  lesson.id ?? lesson.IdLesson ?? lesson.LessonId ?? `lesson-${idx}`;
                const isActive = String(selectedLessonId) === String(lessonId);

                return (
                  <div
                    key={lessonId}
                    onClick={() => setSelectedLessonId(lessonId)}
                    className="p-3 rounded-3 cursor-pointer border transition-all"
                    style={{
                      cursor: "pointer",
                      backgroundColor: isActive ? "#e6f7f5" : "#f8f9fa",
                      borderColor: isActive ? "#00bba7" : "transparent",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-semibold" style={{ fontSize: "13px" }}>
                        Bài - {idx + 1}
                      </span>
                      {isActive && (
                        <span
                          className="badge text-white rounded-circle p-1"
                          style={{ backgroundColor: "#00bba7" }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div
                      className="text-truncate"
                      style={{
                        fontSize: "12px",
                        color: isActive ? "#000" : "#6c757d",
                        fontWeight: isActive ? "600" : "normal",
                      }}
                    >
                      {lesson.title ?? lesson.Title ?? lesson.LessonName ?? `Bài học ${idx + 1}`}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* --- CỘT PHẢI: CHI TIẾT BÀI HỌC, FILE VÀ BÀI TẬP --- */}
        <div className="col-12 col-md-9">
          <div className="bg-white rounded-3 border p-4 shadow-sm min-vh-50">
            {currentLesson ? (
              <>
                {/* Tiêu đề bài học */}
                <h4 className="fw-bold text-dark mb-4">
                  {currentIndex + 1}.{" "}
                  {currentLesson.title ?? currentLesson.Title ?? currentLesson.LessonName}
                </h4>

                {/* Nội dung văn bản bài học */}
                <div
                  className="text-secondary mb-4 lh-lg"
                  style={{ fontSize: "14px" }}
                  dangerouslySetInnerHTML={{
                    __html:
                      currentLesson.content ??
                      currentLesson.Content ??
                      currentLesson.Description ??
                      "<i>Chưa có nội dung lý thuyết cho bài học này.</i>",
                  }}
                />

                {/* KHỐI FILE ĐÍNH KÈM */}
                <div className="my-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaPaperclip style={{ color: "#00bba7" }} /> Tài liệu / File đính kèm (
                    {currentFiles.length}):
                  </h6>

                  {loadingLessonDetail ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-info me-2"></div>
                      <span className="text-muted small">Đang tải tài liệu...</span>
                    </div>
                  ) : currentFiles.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {currentFiles.map((file, fIdx) => {
                        const fileName =
                          file.fileName ||
                          file.FileName ||
                          file.name ||
                          file.originalName ||
                          `Tài liệu ${fIdx + 1}`;
                        const downloadUrl = getFullFileUrl(file);

                        return (
                          <div
                            key={file.id || file.IdFile || fIdx}
                            className="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between"
                          >
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="p-2.5 rounded-3 text-white"
                                style={{ backgroundColor: "#00bba7" }}
                              >
                                <FaPaperclip size={18} />
                              </div>
                              <div>
                                <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                                  {fileName}
                                </div>
                                <small className="text-muted">Tài liệu tham khảo bài học</small>
                              </div>
                            </div>
                            {downloadUrl !== "#" && (
                              <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                              >
                                <FaDownload size={12} /> Xem / Tải về
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 text-muted text-center" style={{ fontSize: "13px" }}>
                      Bài học này chưa đính kèm file tài liệu nào.
                    </div>
                  )}
                </div>

                {/* KHỐI BÀI TẬP THỰC HÀNH */}
                <div className="my-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaCode style={{ color: "#00bba7" }} /> Bài tập thực hành (
                    {currentProblems.length}):
                  </h6>

                  {loadingLessonDetail ? (
                    <div className="text-center py-3">
                      <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                      <span className="text-muted small">Đang tải bài tập...</span>
                    </div>
                  ) : currentProblems.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {currentProblems.map((prob, pIdx) => {
                        const realProb = prob.Problem || prob.problem || prob;
                        const probId =
                          realProb.id || realProb.IdProblem || realProb.idProblem || pIdx;
                        const probTitle =
                          realProb.title ||
                          realProb.Title ||
                          realProb.ProblemName ||
                          `Bài tập ${pIdx + 1}`;
                        const difficulty =
                          realProb.difficulty || realProb.Difficulty || "Thông thường";

                        return (
                          <div
                            key={probId}
                            className="d-flex justify-content-between align-items-center p-3 rounded-3 border bg-light"
                          >
                            <div>
                              <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>
                                {probTitle}
                              </div>
                              <small className="text-muted">
                                Độ khó:{" "}
                                <span className="badge bg-info-subtle text-info">
                                  {difficulty}
                                </span>
                              </small>
                            </div>
                            <button
                              className="btn btn-sm text-white rounded-2 px-3 py-1.5 fw-semibold"
                              style={{ backgroundColor: "#00bba7" }}
                              onClick={() => onStartCoding && onStartCoding(realProb)}
                            >
                              Làm bài ngay
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 text-muted text-center" style={{ fontSize: "13px" }}>
                      Bài học này hiện chưa gắn bài tập thực hành nào.
                    </div>
                  )}
                </div>

                {/* NÚT ĐIỀU HƯỚNG BÀI TRƯỚC / BÀI SAU */}
                <div className="d-flex justify-content-between align-items-center mt-5 pt-3 border-top">
                  <button
                    className="btn btn-light text-secondary rounded-2 px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                    style={{ fontSize: "13px" }}
                    disabled={currentIndex <= 0}
                    onClick={() => {
                      const prevLesson = lessons[currentIndex - 1];
                      if (prevLesson) {
                        setSelectedLessonId(
                          prevLesson.id ?? prevLesson.IdLesson ?? prevLesson.LessonId
                        );
                      }
                    }}
                  >
                    <FaArrowLeft size={12} /> Bài trước
                  </button>

                  <button
                    className="btn text-white rounded-2 px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                    style={{ backgroundColor: "#00bba7", fontSize: "13px" }}
                    disabled={currentIndex >= lessons.length - 1}
                    onClick={() => {
                      const nextLesson = lessons[currentIndex + 1];
                      if (nextLesson) {
                        setSelectedLessonId(
                          nextLesson.id ?? nextLesson.IdLesson ?? nextLesson.LessonId
                        );
                      }
                    }}
                  >
                    Bài tiếp theo <FaArrowRight size={12} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-5 text-muted">
                Vui lòng chọn bài học ở cột bên trái để xem nội dung.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}