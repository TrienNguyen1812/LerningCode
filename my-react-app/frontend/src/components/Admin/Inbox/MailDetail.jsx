export default function MailDetail({ activeMail }) {
  if (!activeMail) {
    return (
      <div className="col-12 col-md-7 col-lg-8">
        <div className="card border-0 shadow-sm rounded-4 p-5 bg-white text-center text-muted">
          <i className="fa-regular fa-envelope-open fs-1 mb-2"></i>
          <p className="m-0">Vui lòng chọn một thông báo để xem chi tiết.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-12 col-md-7 col-lg-8">
      <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
        {/* Header thư */}
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
          <h6 className="fw-bold text-dark m-0">{activeMail.title}</h6>
          <span className="text-muted small">{activeMail.time}</span>
        </div>

        {/* Bảng dữ liệu sinh viên */}
        <div className="table-responsive">
          <table className="table align-middle custom-table mb-0">
            <thead className="bg-light text-muted small text-uppercase">
              <tr>
                <th className="ps-3">Sinh viên</th>
                <th className="text-center">Điểm số</th>
                <th className="text-center">Số lần nộp</th>
                <th className="text-center pe-3">Gợi ý đã dùng</th>
              </tr>
            </thead>
            <tbody>
              {activeMail.data && activeMail.data.length > 0 ? (
                activeMail.data.map((st, idx) => (
                  <tr key={idx} className="border-bottom">
                    <td className="ps-3 py-3">
                      <span className="fw-bold text-dark small d-block">{st.name}</span>
                    </td>
                    <td className="text-center fw-bold text-primary small">
                      {st.score}
                    </td>
                    <td className="text-center small text-muted">
                      {st.attempts} lần
                    </td>
                    <td className="text-center pe-3 small">
                      <span className="badge bg-light text-dark border fw-normal px-2 py-1">
                        {st.hints} lượt <span className="text-muted">({st.maxHint})</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted small">
                    Không có dữ liệu sinh viên trong báo cáo này.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
          <button className="btn btn-sm btn-outline-secondary rounded-3 px-3">
            <i className="fa-regular fa-eye-slash me-1"></i> Đánh dấu đã xem
          </button>
          <button className="btn btn-sm btn-primary rounded-3 px-3">
            <i className="fa-solid fa-file-export me-1"></i> Xuất danh sách SV
          </button>
        </div>
      </div>
    </div>
  );
}