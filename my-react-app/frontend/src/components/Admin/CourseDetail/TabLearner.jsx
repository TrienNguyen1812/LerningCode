export default function TabLearner({ learners = [], searchLearner = "", setSearchLearner, onAssign }) {
  const learnerList = Array.isArray(learners) ? learners : [];

  // Lọc học viên (Hỗ trợ cả CamelCase và PascalCase)
  const filteredLearners = learnerList.filter((l) => {
    const name = l.fullName ?? l.FullName ?? l.name ?? "";
    const email = l.email ?? l.Email ?? "";
    const keyword = searchLearner.toLowerCase();

    return name.toLowerCase().includes(keyword) || email.toLowerCase().includes(keyword);
  });

  return (
    <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-start">
      {/* Thanh công cụ tìm kiếm */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "400px" }}>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted"></span>
            <input
              type="text"
              className="form-control border-start-0 ps-0 shadow-none"
              placeholder="Tìm theo Tên hoặc Email..."
              value={searchLearner}
              onChange={(e) => setSearchLearner(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            className="btn text-white fw-medium rounded-3 px-3 py-2 border-0"
            style={{ backgroundColor: "#14b8a6" }}
            onClick={onAssign}
          >
            + Gán học viên
          </button>
        </div>
      </div>

      {/* Bảng danh sách Học viên */}
      <div className="table-responsive">
        <table className="table align-middle table-hover">
          <thead>
            <tr className="text-muted small border-bottom">
              <th style={{ width: "40px" }}>
                <input type="checkbox" className="form-check-input" />
              </th>
              <th>Mã ID</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Ngày tham gia</th>
              <th style={{ width: "40px" }}></th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {filteredLearners.map((user, index) => {
              // Bóc tách biến an toàn phòng thủ cả 2 chuẩn naming
              const userId = user.id ?? user.IdUser ?? user.userId ?? user.UserId ?? index + 1;
              const fullName = user.fullName ?? user.FullName ?? user.name ?? "Chưa đặt tên";
              const email = user.email ?? user.Email ?? "N/A";
              const role = user.role ?? user.Role ?? user.roleName ?? "Học viên";
              const createDate = user.createdAt ?? user.CreateDate ?? user.createdDate;

              return (
                <tr key={userId}>
                  <td>
                    <input type="checkbox" className="form-check-input" />
                  </td>
                  <td className="fw-medium text-secondary">#{userId}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold text-uppercase"
                        style={{ width: "32px", height: "32px", fontSize: "13px" }}
                      >
                        {fullName.charAt(0)}
                      </div>
                      <span className="fw-semibold text-dark">{fullName}</span>
                    </div>
                  </td>
                  <td className="text-secondary">{email}</td>
                  <td>
                    <span
                      className={`badge ${
                        role.toLowerCase() === "admin"
                          ? "bg-danger"
                          : role.toLowerCase().includes("giảng viên") || role.toLowerCase() === "teacher"
                          ? "bg-warning text-dark"
                          : "bg-info text-dark"
                      }`}
                    >
                      {role}
                    </span>
                  </td>
                  <td className="text-secondary">
                    {createDate
                      ? typeof createDate === "string" && createDate.includes("/")
                        ? createDate
                        : new Date(createDate).toLocaleDateString("vi-VN")
                      : "N/A"}
                  </td>
                  <td>
                    <button className="btn btn-link text-muted p-0 border-0">...</button>
                  </td>
                </tr>
              );
            })}

            {filteredLearners.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-muted">
                  Chưa có học viên nào ghi danh khóa học này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}