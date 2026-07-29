export default function ProblemDescription({ problem, theme }) {
  // 1. Kiểm tra nếu không có dữ liệu hoặc object rỗng
  if (!problem || Object.keys(problem).length === 0 || (!problem.title && !problem.Title)) {
    return (
      <div className={`h-100 p-4 text-center d-flex align-items-center justify-content-center ${theme === "vs-dark" ? "bg-dark text-muted" : "bg-white text-muted"}`}>
        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        <span>Đang tải nội dung đề bài...</span>
      </div>
    );
  }

  const isDark = theme === "vs-dark";

  // 2. CHUẨN HÓA DỮ LIỆU ĐẦU VÀO (Bất chấp API trả về viết Hoa hay viết Thường)
  const title = problem.title || problem.Title || "Bài tập chưa đặt tên";
  const description = problem.description || problem.Description || "Chưa có mô tả chi tiết cho bài tập này. Vui lòng kiểm tra lại API.";

  // Bóc tách độ khó từ chuỗi "Coding [Dễ]" hoặc thuộc tính riêng lẻ
  let difficulty = "DỄ";
  const typeStr = problem.type || "";
  if (typeStr.includes("[") && typeStr.includes("]")) {
    difficulty = typeStr.substring(typeStr.indexOf("[") + 1, typeStr.indexOf("]")).toUpperCase();
  } else if (problem.difficulty || problem.Difficulty) {
    difficulty = (problem.difficulty || problem.Difficulty).toUpperCase();
  }

  // Bộ Parser tối ưu riêng cho định dạng văn bản thuần từ SQL Server của bạn
  const parsePlainToDynamicHTML = (text) => {
    if (!text) return "";

    // Bảo mật: Tránh lỗi XSS bảo vệ cấu trúc HTML
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // 1. Nhận diện các biến/từ khóa nằm trong dấu ` và làm nổi bật
    const codeClass = isDark ? "bg-secondary text-warning bg-opacity-40" : "bg-light text-danger fw-semibold";
    html = html.replace(/`([^`]+)`/g, `<code class="${codeClass} px-1.5 py-0.5 rounded" style="font-size: 14.5px;">$1</code>`);

    // 2. Làm đậm và đổi màu các nhãn dữ liệu chuẩn của bài toán
    html = html.replace(/(Input:|Output:|Ví dụ mẫu:|Định dạng đầu vào \(Input\):|Định dạng đầu ra \(Output\):|Mô tả bài toán:)/g, 
      `<strong class="text-primary d-inline-block mt-2 mb-1" style="font-size: 16px;">$1</strong>`
    );

    // 3. Tự động gom các dòng chứa dữ liệu Input/Output mẫu vào một khung xám (Khối Card giả lập)
    html = html.replace(/(Input: .+\nOutput: .+(?:\nExplanation: .+)?)/g, 
      `<div class="p-3 rounded-3 my-2 font-monospace ${isDark ? "bg-secondary bg-opacity-10 border border-secondary border-opacity-25 text-light" : "bg-light text-dark"}" style="white-space: pre-wrap; line-height: 1.6;">$1</div>`
    );

    // 4. Tách dòng và bọc thẻ Paragraph chuẩn chỉnh
    html = html.split("\n").map(line => {
      if (line.trim().startsWith("<div") || line.trim().startsWith("</div")) return line;
      return line.trim() ? `<p class="mb-2">${line}</p>` : "<br/>";
    }).join("");

    return html;
  };

  return (
    <div
      className="h-100 overflow-y-auto p-4 text-start transition-all"
      style={{ 
        maxHeight: "calc(100vh - 57px)",
        backgroundColor: isDark ? "#1e1e1e" : "#ffffff",
        color: isDark ? "#f8f9fa" : "#212529"
      }}
    >
      {/* Khối Header: Đã chuyển sang dùng các biến chuẩn hóa độc lập */}
      <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3 border-secondary border-opacity-10">
        <h2 className="fw-bold m-0" style={{ fontSize: "24px" }}>
          {title}
        </h2>
        <span 
          className={`badge rounded-pill px-3 py-1.5 fw-bold ${
            difficulty === "DỄ" ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"
          }`}
          style={{ fontSize: "11px", letterSpacing: "0.5px" }}
        >
          {difficulty}
        </span>
      </div>

      {/* Khối Body: Đã chuyển sang dùng biến description đã chuẩn hóa */}
      <div 
        className={`problem-description-content ${isDark ? "text-light" : "text-secondary"}`}
        style={{ fontSize: "15px", lineHeight: "1.7" }}
        dangerouslySetInnerHTML={{ __html: parsePlainToDynamicHTML(description) }}
      />
    </div>
  );
}