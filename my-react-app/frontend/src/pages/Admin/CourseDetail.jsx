import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import CourseHeader from "../../components/Admin/CourseDetail/CourseHeader";
import TabLearner from "../../components/Admin/CourseDetail/TabLearner";
import PreviewModal from "../../components/Admin/CourseDetail/PreviewModal";

export default function CourseDetail({ courseId: propCourseId, onBack }) {
  const routeParams = useParams();
  const courseId = propCourseId || routeParams.courseId;

  // State Dữ liệu
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);

  // State Bài tập & File của bài học được chọn
  const [currentProblems, setCurrentProblems] = useState([]);
  const [currentFiles, setCurrentFiles] = useState([]);
  const [learners, setLearners] = useState([]);

  // State UI
  const [searchLearner, setSearchLearner] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const [loading, setLoading] = useState(true);
  const [loadingLessonDetail, setLoadingLessonDetail] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const BASE_URL = "http://127.0.0.1:5000/api";
  const SERVER_HOST = "http://127.0.0.1:5000";

  // 1. Fetch khóa học và danh sách bài học
  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const loadDetailData = async () => {
      try {
        const courseRes = await fetch(`${BASE_URL}/courses/${courseId}`, {
          signal: controller.signal,
        });
        if (courseRes.ok) {
          const resJson = await courseRes.json();
          const rawCourse = resJson.data || resJson.course || resJson;

          setCourse({
            ...rawCourse,
            name: rawCourse.name || rawCourse.CourseName || rawCourse.title || "Chi tiết khóa học",
            id: rawCourse.id || rawCourse.Id || rawCourse.CourseId || courseId,
            createdAt: rawCourse.createdAt || rawCourse.CreatedDate || "18/03/2026",
            thumbnail: rawCourse.thumbnail || rawCourse.Thumbnail || null,
          });
        }

        const lessonRes = await fetch(`${BASE_URL}/lessons/course/${courseId}`, {
          signal: controller.signal,
        });
        if (lessonRes.ok) {
          const resLessonJson = await lessonRes.json();
          const rawLessons = resLessonJson.data || resLessonJson.lessons || resLessonJson;

          if (Array.isArray(rawLessons)) {
            const sortedLessons = [...rawLessons].sort((a, b) => {
              const orderA = a.orderIndex ?? a.OrderIndex ?? 0;
              const orderB = b.orderIndex ?? b.OrderIndex ?? 0;
              return orderA - orderB;
            });

            setLessons(sortedLessons);

            if (sortedLessons.length > 0) {
              const firstId = sortedLessons[0].id ?? sortedLessons[0].IdLesson ?? sortedLessons[0].LessonId;
              setSelectedLessonId((prev) => prev || firstId);
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Lỗi xử lý dữ liệu CourseDetail:", err);
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

  // 2. Fetch chi tiết bài học (File và bài tập)
  useEffect(() => {
    if (!selectedLessonId) return;

    const controller = new AbortController();
    setLoadingLessonDetail(true);
    setCurrentProblems([]);
    setCurrentFiles([]);

    fetch(`${BASE_URL}/lessons/${selectedLessonId}`, { signal: controller.signal })
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
          lessonData.Lesson_Problems ||
          [];

        const rawFiles =
          lessonData.files ||
          lessonData.Files ||
          lessonData.lessonFiles ||
          lessonData.LessonFiles ||
          lessonData.lesson_files ||
          lessonData.filesList ||
          lessonData.Lesson_Files ||
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

  // 3. Fetch học viên khi thay đổi tab "Learner"
  useEffect(() => {
    if (activeTab !== "learner" || !courseId) return;

    const controller = new AbortController();

    fetch(`${BASE_URL}/enroll/course/${courseId}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return setLearners([]);
        const raw = data.data || data;
        setLearners(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Lỗi fetch danh sách học viên:", err);
          setLearners([]);
        }
      });

    return () => controller.abort();
  }, [activeTab, courseId]);

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

  const handleDeleteCourse = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) {
      try {
        const res = await fetch(`${BASE_URL}/courses/${courseId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          alert("Xóa khóa học thành công!");
          if (onBack) onBack();
        } else {
          alert("Xóa thất bại!");
        }
      } catch (err) {
        console.error("Lỗi khi xóa khóa học:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white rounded-4 shadow-sm my-3">
        <div className="spinner-border text-info" role="status"></div>
        <p className="mt-3 text-muted mb-0">Đang tải dữ liệu khóa học...</p>
      </div>
    );
  }

  const currentLesson = lessons.find(
    (l) => String(l.id ?? l.IdLesson ?? l.LessonId) === String(selectedLessonId)
  );

  return (
    <div className="text-start">
      {onBack && (
        <div className="mb-3">
          <button
            className="btn btn-link text-decoration-none text-secondary p-0 d-flex align-items-center gap-2 fw-medium"
            onClick={onBack}
          >
            <i className="fa-solid fa-arrow-left"></i> Quay lại danh sách khóa học
          </button>
        </div>
      )}

      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        <CourseHeader
          course={course}
          isLocked={isLocked}
          setIsLocked={setIsLocked}
          onEdit={() => {}}
          onPreview={() => setShowPreviewModal(true)}
          onDelete={handleDeleteCourse}
        />

        {/* TABS HEADER */}
        <div className="border-bottom my-4">
          <ul className="nav nav-tabs border-0 gap-4">
            {[
              { id: "content", label: "Nội dung khóa học" },
              { id: "statistic", label: "Thống kê" },
              { id: "learner", label: "Học viên" },
            ].map((tab) => (
              <li className="nav-item" key={tab.id}>
                <button
                  className={`nav-link border-0 bg-transparent fw-semibold pb-2 px-0 ${
                    activeTab === tab.id
                      ? "text-success border-bottom border-success border-3"
                      : "text-muted"
                  }`}
                  style={{ fontSize: "15px" }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* TAB 1: CONTENT */}
        {activeTab === "content" && (
          <div className="row g-4">
            {/* DANH SÁCH BÀI HỌC (BÊN TRÁI) */}
            <div className="col-12 col-md-4 col-lg-3 border-end pe-3">
              <div className="d-flex flex-column gap-2">
                {lessons.length > 0 ? (
                  lessons.map((lesson, idx) => {
                    const lessonId =
                      lesson.id ?? lesson.IdLesson ?? lesson.LessonId ?? `lesson-${idx}`;
                    const isSelected = String(selectedLessonId) === String(lessonId);

                    return (
                      <div
                        key={lessonId}
                        className={`p-3 rounded-3 transition-all ${
                          isSelected
                            ? "bg-success bg-opacity-10 border-start border-4 border-success"
                            : "bg-light text-secondary"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedLessonId(lessonId)}
                      >
                        <div
                          className={`fw-bold ${isSelected ? "text-success" : "text-dark"}`}
                          style={{ fontSize: "14px" }}
                        >
                          {lesson.title ?? lesson.Title ?? lesson.LessonName ?? `Bài ${idx + 1}`}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-muted p-2" style={{ fontSize: "13px" }}>
                    Chưa có bài học nào trong khóa học này.
                  </div>
                )}
              </div>
            </div>

            {/* CHI TIẾT BÀI HỌC (BÊN PHẢI) */}
            <div className="col-12 col-md-8 col-lg-9 ps-4">
              {!currentLesson ? (
                <div className="text-muted py-5 text-center">
                  Vui lòng chọn bài học để xem chi tiết.
                </div>
              ) : (
                <div>
                  <h4 className="fw-bold text-dark mb-3">
                    {currentLesson.title ?? currentLesson.Title ?? currentLesson.LessonName}
                  </h4>

                  {/* VĂN BẢN HỌC */}
                  <div
                    className="text-secondary lh-lg mb-4"
                    dangerouslySetInnerHTML={{
                      __html:
                        currentLesson.content ??
                        currentLesson.Content ??
                        currentLesson.Description ??
                        "<i>Chưa có nội dung văn bản.</i>",
                    }}
                  />

                  {/* KHỐI FILE ĐÍNH KÈM */}
                  <div className="mt-4 pt-3 border-top mb-4">
                    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                      <i className="fa-solid fa-paperclip text-info"></i> Tài liệu / File đính kèm ({currentFiles.length}):
                    </h6>

                    {loadingLessonDetail ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-info me-2"></div>
                        <span className="text-muted small">Đang tải file...</span>
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
                              className="card border-0 bg-light p-3 rounded-3 d-flex flex-row align-items-center justify-content-between"
                            >
                              <div className="d-flex align-items-center gap-3">
                                <div className="bg-info bg-opacity-10 text-info p-3 rounded-3">
                                  <i className="fa-solid fa-file-lines fs-4"></i>
                                </div>
                                <div>
                                  <div className="fw-bold text-dark fs-6">{fileName}</div>
                                  <div className="small text-muted">Tài liệu học tập đính kèm</div>
                                </div>
                              </div>
                              {downloadUrl !== "#" && (
                                <a
                                  href={downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-info btn-sm px-3 rounded-2 fw-medium"
                                >
                                  <i className="fa-solid fa-download me-1"></i> Xem / Tải về
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="alert alert-light border rounded-3 p-3 text-muted text-center mb-0">
                        Bài học này chưa đính kèm file tài liệu nào.
                      </div>
                    )}
                  </div>

                  {/* KHỐI BÀI TẬP LẬP TRÌNH */}
                  <div className="pt-3 border-top">
                    <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                      <i className="fa-solid fa-code text-primary"></i> Bài tập thực hành ({currentProblems.length}):
                    </h6>

                    {loadingLessonDetail ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                        <span className="text-muted small">Đang tải bài tập...</span>
                      </div>
                    ) : currentProblems.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                        {currentProblems.map((prob, pIdx) => {
                          const realProb = prob.Problem || prob.problem || prob;
                          const probId = realProb.id || realProb.IdProblem || realProb.idProblem || pIdx;
                          const probTitle = realProb.title || realProb.Title || realProb.ProblemName || `Bài tập ${pIdx + 1}`;
                          const difficulty = realProb.difficulty || realProb.Difficulty || "Thông thường";
                          const timeLimit = realProb.timeLimit || realProb.time_limit || realProb.Time_limit || 1000;

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
                                    <div className="fw-bold text-dark fs-6">{probTitle}</div>
                                    <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                                        #PROB{probId}
                                      </span>
                                      <span>• Độ khó: <strong className="text-dark">{difficulty}</strong></span>
                                      <span>• Giới hạn: {timeLimit} ms</span>
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
                      <div className="alert alert-light border rounded-3 p-3 text-muted text-center mb-0">
                        Bài học này hiện chưa gắn bài tập thực hành nào.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LEARNER */}
        {activeTab === "learner" && (
          <TabLearner
            learners={learners}
            searchLearner={searchLearner}
            setSearchLearner={setSearchLearner}
            onAssign={() => {}}
          />
        )}

        {/* TAB 3: STATISTIC */}
        {activeTab === "statistic" && (
          <div className="py-5 text-center text-muted">
            <h6 className="fw-bold text-dark">Thống kê khóa học</h6>
            <p className="mb-0">Tính năng đang được phát triển...</p>
          </div>
        )}
      </div>

      <PreviewModal
        show={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        lessons={lessons}
        courseTitle={course?.name}
        courseThumbnail={course?.thumbnail}
      />
    </div>
  );
}