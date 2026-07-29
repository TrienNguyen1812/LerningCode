import { useState, useEffect } from "react";
import axios from "axios";
import ProblemModal from "../../components/Admin/Problem/ProblemModal";
import CodeWorkspace from "./CodeWorkspace";
import ContentHeader from "../../components/Admin/ContentHeader";
import MoreIcon from "../../assets/icons/more.svg";

// Đường dẫn API Backend của bạn
const API_URL = "http://localhost:5000/api/problems";

export default function ProblemManager() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [previewProblem, setPreviewProblem] = useState(null);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  // 1. LẤY DANH SÁCH BÀI TẬP TỪ BACKEND (GET)
  const fetchProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      if (response.data.success) {
        // Chuẩn hóa dữ liệu trả về từ SQL Server để khớp với các trường hiển thị của Component
        const formattedData = response.data.data.map((item) => ({
          id: item.IdProblem,
          title: item.Title,
          problemId: `#PROB${item.IdProblem}`,
          difficulty: item.Difficulty,
          timeLimit: item.Time_limit,
          memoryLimit: item.Memory_limit,
          sampleCode: item.Sample_code,
          aiPromptInstruction: item.Ai_Prompt_Instruction,
          description: item.Description,
          deadline: item.Deadline,
          status: "Active",
          testCaseCount: item.TestCaseCount || 0,
        }));
        setProblems(formattedData);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách bài tập:", err);
      setError("Không thể kết nối đến máy chủ backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === id ? null : id);
  };

  // 2. LẤY CHI TIẾT KÈM TESTCASES KHI BẤM SỬA/XEM (GET BY ID)
  const handleEditClick = async (problem) => {
    try {
      const res = await axios.get(`${API_URL}/${problem.id}`);
      if (res.data.success) {
        const fullProblemData = res.data.data;
        // Map lại dữ liệu để truyền vào ProblemModal
        setEditingProblem({
          id: fullProblemData.IdProblem,
          title: fullProblemData.Title,
          description: fullProblemData.Description,
          difficulty: fullProblemData.Difficulty,
          timeLimit: fullProblemData.Time_limit,
          memoryLimit: fullProblemData.Memory_limit,
          maxHintAllowed: fullProblemData.MaxHintAllowed,
          sampleCode: fullProblemData.Sample_code,
          aiPromptInstruction: fullProblemData.Ai_Prompt_Instruction,
          deadline: fullProblemData.Deadline,
          testCases: fullProblemData.testCases
            ? fullProblemData.testCases.map((tc) => ({
                inputData: tc.InputData || "",
                outputData: tc.OutputData || "",
                isHidden: tc.IsHidden || false,
                weight: tc.Weight !== undefined ? tc.Weight : 1.0,
                testType: tc.TestType || "Thông thường",
                expectError: tc.ExpectError || false,
                description: tc.Description || "",
              }))
            : [],
        });
        setShowModal(true);
      }
    } catch (err) {
      alert("Không thể tải chi tiết bài tập!");
    }
    setActiveDropdownId(null);
  };

  // 3. THÊM MỚI HOẶC CẬP NHẬT BÀI TẬP (POST / PUT)
  const handleSaveProblem = async (problemData) => {
    try {
      if (editingProblem) {
        // CẬP NHẬT (PUT)
        const res = await axios.put(
          `${API_URL}/${editingProblem.id}`,
          problemData,
        );
        if (res.data.success) {
          alert("Cập nhật bài tập thành công!");
          fetchProblems(); // Load lại bảng
        }
      } else {
        // THÊM MỚI (POST)
        const res = await axios.post(API_URL, problemData);
        if (res.data.success) {
          alert("Tạo bài tập mới thành công!");
          fetchProblems(); // Load lại bảng
        }
      }
      setShowModal(false);
      setEditingProblem(null);
    } catch (err) {
      console.error("Lỗi khi lưu bài tập:", err);
      alert(err.response?.data?.message || "Đã có lỗi xảy ra khi lưu bài tập!");
    }
  };

  // 4. XÓA BÀI TẬP (DELETE)
  const handleDeleteProblem = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài tập này không?")) return;

    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      if (res.data.success) {
        alert("Xóa bài tập thành công!");
        setProblems(problems.filter((p) => p.id !== id));
      }
    } catch (err) {
      alert("Xóa thất bại! Lỗi hệ thống.");
    }
    setActiveDropdownId(null);
  };

  if (previewProblem) {
    return (
      <CodeWorkspace
        problem={previewProblem}
        onBack={() => setPreviewProblem(null)}
      />
    );
  }

  return (
    <div
      className="p-4 bg-light min-vh-100 text-start"
      onClick={() => setActiveDropdownId(null)}
    >
      {/* HEADER */}
      <ContentHeader
        count={problems.length}
        unitText="Problems in total"
        buttonText="New Problem"
        onNewCourse={() => {
          setEditingProblem(null);
          setShowModal(true);
        }}
      />

      {/* TABLE CONTAINING WRAPPER */}
      <div
        className="card border-0 rounded-4 shadow-sm bg-white"
        style={{ overflow: "visible" }}
      >
        <div className="table-responsive" style={{ overflow: "visible" }}>
          <table
            className="table align-middle mb-0 text-start"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <colgroup>
              <col style={{ width: "25%" }} /> {/* Problem Name */}
              <col style={{ width: "12%" }} /> {/* Problem ID */}
              <col style={{ width: "11%" }} /> {/* Difficulty */}
              <col style={{ width: "13%" }} /> {/* Time Limit */}
              <col style={{ width: "11%" }} /> {/* Memory */}
              <col style={{ width: "11%" }} /> {/* Test Cases */}
              <col style={{ width: "9%" }} /> {/* Status */}
              <col style={{ width: "8%" }} /> {/* Action */}
            </colgroup>

            <thead className="bg-light border-bottom text-muted small fw-semibold">
              <tr>
                <th className="py-3 ps-4 border-0 text-nowrap align-middle">
                  Problem Name ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Problem ID ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Difficulty ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Time Limit ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Memory ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Test Cases ↕
                </th>
                <th className="py-3 px-2 border-0 text-nowrap align-middle">
                  Status ↕
                </th>
                <th className="py-3 pe-4 text-center border-0 text-nowrap align-middle">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Đang tải dữ liệu bài tập từ máy chủ...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-5 text-danger fw-medium"
                  >
                    {error}
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    Chưa có bài tập nào. Hãy bấm "New Problem" để tạo!
                  </td>
                </tr>
              ) : (
                problems.map((item) => (
                  <tr key={item.id} className="border-bottom">
                    {/* Problem Name */}
                    <td className="py-3 ps-4">
                      <div
                        className="fw-bold text-dark text-truncate"
                        title={item.title}
                      >
                        {item.title}
                      </div>
                      <div
                        className="text-muted small text-truncate"
                        title={item.description}
                      >
                        {item.description}
                      </div>
                    </td>

                    {/* Problem ID */}
                    <td className="py-3 px-2 text-muted fw-medium small text-truncate">
                      {item.problemId}
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-2">
                      <span
                        className={`badge rounded-pill px-2 py-1 fw-semibold small ${
                          item.difficulty === "Easy"
                            ? "bg-success bg-opacity-10 text-success"
                            : item.difficulty === "Medium"
                              ? "bg-warning bg-opacity-10 text-warning"
                              : "bg-danger bg-opacity-10 text-danger"
                        }`}
                      >
                        {item.difficulty}
                      </span>
                    </td>

                    {/* Time Limit */}
                    <td className="py-3 px-2 text-secondary small fw-medium text-truncate">
                      {item.timeLimit} ms
                    </td>

                    {/* Memory Limit */}
                    <td className="py-3 px-2 text-secondary small fw-medium text-truncate">
                      {item.memoryLimit} MB
                    </td>

                    {/* Test Cases Count */}
                    <td className="py-3 px-2 text-secondary small fw-medium text-truncate">
                      {item.testCaseCount} Cases
                    </td>

                    {/* Status */}
                    <td className="py-3 px-2">
                      <span className="badge rounded-pill bg-success bg-opacity-10 text-success px-2 py-1 fw-semibold small">
                        {item.status}
                      </span>
                    </td>

                    {/* ACTION DROPDOWN */}
                    <td
                      className="py-3 pe-4 text-center position-relative"
                      style={{ overflow: "visible" }}
                    >
                      <button
                        type="button"
                        className="btn btn-light btn-sm rounded-circle p-0 d-inline-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        onClick={(e) => toggleDropdown(item.id, e)}
                      >
                        <img
                          src={MoreIcon}
                          alt="More Actions"
                          style={{ width: "16px", height: "16px" }}
                        />
                      </button>

                      {/* Menu thả xuống */}
                      {activeDropdownId === item.id && (
                        <div
                          className="dropdown-menu show border-0 shadow-lg rounded-3 py-2 position-absolute"
                          style={{
                            top: "85%",
                            right: "1rem",
                            zIndex: 1050,
                            minWidth: "130px",
                          }}
                        >
                          <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small text-primary"
                            onClick={() => {
                              setPreviewProblem(item);
                              setActiveDropdownId(null);
                            }}
                          >
                            <i className="fa-solid fa-code"></i> Test IDE
                          </button>

                          <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small text-dark"
                            onClick={() => handleEditClick(item)}
                          >
                            <i className="fa-regular fa-pen-to-square"></i> Edit
                          </button>

                          <div className="dropdown-divider my-1"></div>

                          <button
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 small text-danger"
                            onClick={() => handleDeleteProblem(item.id)}
                          >
                            <i className="fa-regular fa-trash-can"></i> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <ProblemModal
        show={showModal}
        initialData={editingProblem}
        onClose={() => {
          setShowModal(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveProblem}
      />
    </div>
  );
}
