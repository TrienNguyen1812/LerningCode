import { useState, useEffect, useMemo } from "react";

export default function AssignStudentModal({ show, course, onClose, onSave }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [assignStatusFilter, setAssignStatusFilter] = useState("all");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const courseId = course?.id || course?.IdCourse;

  // Tải danh sách User kèm trạng thái gán từ Server
  useEffect(() => {
    if (!show || !courseId) return;

    const fetchCourseUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/courses/${courseId}/users`);
        const result = await response.json();

        if (result.success) {
          const userList = result.data || [];
          setUsers(userList);

          // Khởi tạo các checkbox dựa trên danh sách đã được Enroll trong CSDL
          const initialEnrolledIds = userList
            .filter((user) => user.isAssigned)
            .map((user) => user.IdUser);

          setSelectedUserIds(initialEnrolledIds);
        } else {
          alert(result.message || "Không thể tải danh sách người dùng!");
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseUsers();
  }, [show, courseId]);

  // Bộ lọc danh sách người dùng
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRole = roleFilter === "all" || user.Role === roleFilter;

      const matchStatus =
        assignStatusFilter === "all"
          ? true
          : assignStatusFilter === "assigned"
          ? user.isAssigned
          : !user.isAssigned;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchTerm, roleFilter, assignStatusFilter]);

  // Chọn hoặc bỏ chọn tất cả các dòng đang hiển thị
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const selectableIds = filteredUsers.map((u) => u.IdUser);
      setSelectedUserIds(Array.from(new Set([...selectedUserIds, ...selectableIds])));
    } else {
      const selectableIds = filteredUsers.map((u) => u.IdUser);
      setSelectedUserIds(selectedUserIds.filter((id) => !selectableIds.includes(id)));
    }
  };

  const handleToggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onSave && onSave(courseId, selectedUserIds);
  };

  if (!show) return null;

  const isAllSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedUserIds.includes(u.IdUser));

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1055 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "12px" }}>
          
          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark fs-5">
              Assign Learners: <span className="text-info">{course?.name || course?.CourseName}</span>
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body p-4">
            {/* Thanh tìm kiếm & bộ lọc */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text bg-white text-muted border-end-0">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by Name or Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="sinh viên">Sinh viên</option>
                  <option value="giảng viên">Giảng viên</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select"
                  value={assignStatusFilter}
                  onChange={(e) => setAssignStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="unassigned">Not Enrolled</option>
                  <option value="assigned">Enrolled</option>
                </select>
              </div>
            </div>

            {/* Bảng danh sách Users */}
            <div className="table-responsive border rounded" style={{ maxHeight: "350px" }}>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-info" role="status"></div>
                  <p className="mt-2 text-muted mb-0">Đang tải danh sách người dùng...</p>
                </div>
              ) : (
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th width="40" className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No users found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user.IdUser}>
                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedUserIds.includes(user.IdUser)}
                              onChange={() => handleToggleUser(user.IdUser)}
                            />
                          </td>
                          <td className="fw-medium text-dark">{user.FullName}</td>
                          <td className="text-muted">{user.Email}</td>
                          <td>
                            <span
                              className={`badge ${
                                user.Role === "giảng viên"
                                  ? "bg-warning text-dark"
                                  : "bg-secondary"
                              }`}
                            >
                              {user.Role}
                            </span>
                          </td>
                          <td className="text-center">
                            {user.isAssigned ? (
                              <span className="badge bg-success-subtle text-success border border-success-subtle">
                                Enrolled
                              </span>
                            ) : (
                              <span className="badge bg-light text-muted border">
                                Not Enrolled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light">
            <span className="me-auto text-muted small">
              Selected: <strong>{selectedUserIds.length}</strong> learner(s)
            </span>
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-info text-white fw-semibold"
              onClick={handleConfirm}
            >
              Assign Selected
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}