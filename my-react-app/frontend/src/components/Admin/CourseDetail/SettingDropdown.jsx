export default function SettingsDropdown({ isLocked, setIsLocked, onEdit, onDelete }) {
  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary bg-white text-dark rounded-3 p-2 border"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{ width: "40px", height: "40px" }}
      >
      </button>
      <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-3 p-2 mt-2" style={{ minWidth: "200px" }}>
        <li className="d-flex align-items-center justify-content-between px-3 py-2">
          <span className="small text-dark fw-medium">Lock course</span>
          <div className="form-check form-switch m-0">
            <input
              className="form-check-input cursor-pointer"
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
            />
          </div>
        </li>
        <li>
          <button className="dropdown-item py-2 rounded-2 small" onClick={onEdit}>
            Edit Course
          </button>
        </li>
        <li>
          <button className="dropdown-item py-2 rounded-2 small">Edit history</button>
        </li>
        <li>
          <button className="dropdown-item py-2 rounded-2 small">Export course</button>
        </li>
        <li><hr className="dropdown-divider my-1" /></li>
        <li>
          <button className="dropdown-item py-2 rounded-2 small text-danger fw-medium" onClick={onDelete}>
            Delete course
          </button>
        </li>
      </ul>
    </div>
  );
}