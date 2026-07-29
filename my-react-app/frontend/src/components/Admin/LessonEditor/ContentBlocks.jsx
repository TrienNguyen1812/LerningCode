export default function ContentBlocks({ blocks = [], onTextChange, onRemove }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-center py-4 text-muted border border-dashed rounded-3 bg-light">
        Chưa có nội dung nào. Hãy bấm <strong>+ Content</strong> hoặc <strong>Library</strong> để thêm.
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {blocks.map((block) => {
        // Text Block
        if (block.type === "text") {
          return (
            <div key={block.id} className="content-block-item position-relative">
              <textarea
                className="form-control border-0 bg-transparent text-secondary lh-lg fs-6 p-2"
                rows={3}
                placeholder="Nhập nội dung bài học..."
                value={block.value || ""}
                onChange={(e) => onTextChange(block.id, e.target.value)}
              />
              <button
                type="button"
                className="btn-remove-doc position-absolute top-0 end-0 m-1 border-0 bg-transparent text-muted"
                onClick={() => onRemove(block.id)}
                title="Xóa block"
              >
                ✕
              </button>
            </div>
          );
        }

        // Problem Block
        if (block.type === "problem") {
          return (
            <div key={block.id} className="content-block-item">
              <div className="p-3 border rounded-3 bg-white shadow-sm d-flex align-items-center justify-content-between border-start border-4 border-primary">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary bg-opacity-10 text-primary p-2 rounded-3">
                    <i className="fa-solid fa-code fs-4"></i>
                  </div>
                  <div>
                    <div className="fw-bold text-dark">{block.title}</div>
                    <div className="small text-muted d-flex align-items-center gap-2 mt-1">
                      <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                        #PROB{block.problemId}
                      </span>
                      <span>• Độ khó: <strong>{block.difficulty}</strong></span>
                      <span>• Giới hạn: {block.timeLimit} ms</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-remove-doc border-0 bg-transparent text-danger fw-bold"
                  onClick={() => onRemove(block.id)}
                  title="Xóa bài tập"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        }

        // Image Block
        if (block.type === "image") {
          return (
            <div key={block.id} className="content-block-item my-2 position-relative">
              <div className="media-preview-card border rounded p-3 position-relative">
                <button
                  type="button"
                  className="btn-remove-media position-absolute top-0 end-0 m-2 border-0 bg-transparent"
                  onClick={() => onRemove(block.id)}
                  title="Xóa block"
                >
                  ✕
                </button>
                {block.filePath ? (
                  <img
                    src={block.filePath}
                    alt={block.fileName}
                    className="img-fluid rounded"
                    style={{ maxHeight: "300px", objectFit: "contain" }}
                  />
                ) : (
                  <div className="p-3 bg-light rounded text-center">
                    <strong>{block.fileName}</strong> ({block.fileSize})
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Video Block
        if (block.type === "video") {
          return (
            <div key={block.id} className="content-block-item my-2 position-relative">
              <div className="media-preview-card border rounded p-3 position-relative">
                <button
                  type="button"
                  className="btn-remove-media position-absolute top-0 end-0 m-2 z-1 border-0 bg-transparent"
                  onClick={() => onRemove(block.id)}
                  title="Xóa block"
                >
                  ✕
                </button>
                {block.filePath ? (
                  <video
                    controls
                    src={block.filePath}
                    className="w-100 rounded"
                    style={{ maxHeight: "400px" }}
                  />
                ) : (
                  <div className="p-3 bg-light rounded text-center">
                    <strong>{block.fileName}</strong> ({block.fileSize})
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Document Block
        if (block.type === "document") {
          return (
            <div key={block.id} className="content-block-item my-1">
              <div className="document-file-block d-flex align-items-center justify-content-between p-3 border rounded">
                <div className="d-flex align-items-center gap-3">
                  <span className="doc-name fw-medium">{block.fileName}</span>
                </div>

                <div className="d-flex align-items-center gap-3">
                  <span className="text-muted small">{block.fileSize}</span>
                  <button
                    type="button"
                    className="btn-remove-doc border-0 bg-transparent text-danger fw-bold"
                    onClick={() => onRemove(block.id)}
                    title="Xóa tệp"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}