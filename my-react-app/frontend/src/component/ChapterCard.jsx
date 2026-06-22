
import LessonItem from "./LessonItem";

export default function ChapterCard({ chapter, onSelectProblem }) {
  const isActiveChapter = !chapter.isLocked && chapter.id === "02"; 

  return (
    <div className={`card border-0 shadow-sm rounded-4 overflow-hidden mb-3 bg-white ${chapter.isLocked ? "opacity-75" : ""}`}>
      {/* Header của Chương */}
      <div 
        className={`p-3.5 d-flex align-items-center justify-content-between border-bottom border-light ${
          isActiveChapter ? "bg-primary text-white" : "bg-white text-dark"
        }`}
        style={{ padding: "16px 24px" }}
      >
        <div className="d-flex align-items-center gap-3">
          <span className={`badge rounded-3 px-2.5 py-1.5 fw-bold ${isActiveChapter ? "bg-white text-primary" : "bg-light text-muted"}`}>
            {chapter.id}
          </span>
          <span className="fw-bold fs-6">{chapter.title}</span>
        </div>
        <div>
          {chapter.isLocked ? (
            <i className="fa-solid fa-lock text-muted"></i>
          ) : (
            <span className="small fw-semibold opacity-75">{chapter.completedCount}/{chapter.totalCount} HOÀN THÀNH</span>
          )}
        </div>
      </div>

      {/* Danh sách các bài học thuộc chương */}
      {!chapter.isLocked && chapter.lessons && chapter.lessons.length > 0 && (
        <div className="list-group list-group-flush">
          {chapter.lessons.map((lesson) => (
            // BẮN TIẾP PROP XUỐNG ITEM CON
            <LessonItem 
              key={lesson.id} 
              lesson={lesson} 
              onSelectProblem={onSelectProblem} 
            />
          ))}
        </div>
      )}
    </div>
  );
}