import { FaCode, FaFileDownload } from "react-icons/fa"; // Import thêm icon phù hợp

export default function ChapterCard({ chapter, onSelectProblem }) {
  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3 bg-white">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-2">
        <h5 className="fw-bold text-dark mb-0">{chapter.title}</h5>
      </div>
      <div className="card-body px-4 pt-2 pb-4">
        <div className="d-flex flex-column gap-3">
          {chapter.lessons && chapter.lessons.map((item) => {
            // Kiểm tra xem đây là bài tập Code hay Bài giảng Lý thuyết dựa theo dữ liệu từ DB gửi lên
            // Giả định: nếu có độ khó (Difficulty) hoặc type chứa từ 'Coding' thì là bài tập lập trình
            const isCodingTask = item.type && item.type.includes("Coding");

            return (
              <div 
                key={item.id} 
                className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light transition-all"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (isCodingTask) {
                    // Nếu là bài tập code -> kích hoạt chuyển sang màn hình Workspace làm bài
                    onSelectProblem(item); 
                  }
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  <div className="text-primary fs-5">
                    {isCodingTask ? <FaCode /> : <FaFileDownload />}
                  </div>
                  <div>
                    <h6 className="fw-semibold text-dark mb-1">{item.title}</h6>
                    <span className="text-muted small fw-medium">
                      {/* ĐÃ SỬA: Chỉ hiển thị Loại bài tập (Coding [Dễ] / Lý thuyết), ẨN HOÀN TOÀN cấu trúc time_limit/memory_limit */}
                      {isCodingTask ? item.type : "Tài liệu lý thuyết & Bài giảng"}
                    </span>
                  </div>
                </div>

                {/* Phần nút bấm hoặc hành động bên phải */}
                <div>
                  {isCodingTask ? (
                    <button className="btn btn-sm btn-outline-primary rounded-2 px-3 fw-medium">
                      Làm bài
                    </button>
                  ) : (
                    // Nếu là bài học lý thuyết thì cho phép tải file đính kèm về máy máy tính học viên
                    <a 
                      href={item.fileUrl || "#"} 
                      download 
                      className="btn btn-sm btn-light border rounded-2 px-3 fw-medium text-dark d-flex align-items-center gap-1"
                      onClick={(e) => e.stopPropagation()} // Chặn không cho kích hoạt onClick của div cha ngoài ý muốn
                    >
                      Tải bài giảng
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}