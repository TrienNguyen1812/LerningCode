export default function FileSelectModal({
  selectedMediaType,
  searchQuery,
  setSearchQuery,
  filteredFiles,
  selectedFile,
  setSelectedFile,
  onClose,
  onAddMedia,
}) {
  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
          <div className="modal-header border-bottom px-4 py-3">
            <h5 className="modal-title fw-bold text-dark">
              Add {selectedMediaType}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body p-4">
            <div className="mb-3">
              <input
                type="text"
                className="form-control rounded-3 py-2 fs-7"
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              className="border rounded-3 overflow-auto"
              style={{ maxHeight: "300px" }}
            >
              <table className="table table-hover align-middle mb-0 file-select-table">
                <thead className="table-light fs-7 text-muted">
                  <tr>
                    <th className="ps-3 py-2">Name</th>
                    <th className="py-2">Added by</th>
                    <th className="py-2 pe-3">Details</th>
                  </tr>
                </thead>
                <tbody className="fs-7">
                  {filteredFiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-4 text-muted"
                      >
                        Không tìm thấy file phù hợp
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((f) => {
                      const isSelected = selectedFile?.IdFile === f.IdFile;
                      return (
                        <tr
                          key={f.IdFile}
                          className={isSelected ? "table-active" : ""}
                          onClick={() => setSelectedFile(f)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="ps-3 py-3 fw-medium text-dark">
                            {f.FileName}.{f.FileType}
                          </td>
                          <td className="py-3 text-secondary">Admin</td>
                          <td className="py-3 pe-3 text-muted">
                            {f.FileSize
                              ? `${(f.FileSize / (1024 * 1024)).toFixed(1)} MB`
                              : "0 MB"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="modal-footer border-top px-4 py-3 d-flex justify-content-between">
            <label className="form-check-label text-muted small cursor-pointer">
              <input
                type="checkbox"
                className="form-check-input me-2 rounded"
              />
              Make content downloadable
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-light px-4 rounded-3 fw-medium"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-teal px-4 rounded-3 fw-medium"
                onClick={onAddMedia}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}