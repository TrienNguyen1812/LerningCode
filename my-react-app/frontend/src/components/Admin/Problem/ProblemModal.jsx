import { useState, useEffect } from "react";
import PlusIcon from "../../../assets/icons/plus.svg";
import TrashIcon from "../../../assets/icons/trash.svg";

export default function ProblemModal({ show, initialData, onClose, onSave }) {
  // State Form Bài tập
  const [formData, setFormData] = useState({
    title: "",
    difficulty: "Easy",
    timeLimit: 1000,
    memoryLimit: 256,
    maxHintAllowed: 3,
    deadline: "",
    description: "",
    sampleCode: "// Viết code mẫu ban đầu tại đây...",
    aiPromptInstruction: "",
  });

  // State Danh sách Test Cases (Đã thêm Weight, TestType, ExpectError, Description)
  const [testCases, setTestCases] = useState([
    {
      inputData: "",
      outputData: "",
      isHidden: false,
      weight: 1.0,
      testType: "Thông thường",
      expectError: false,
      description: "",
    },
  ]);

  // Load dữ liệu khi sửa (Edit) hoặc reset khi thêm mới
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        difficulty: initialData.difficulty || "Easy",
        timeLimit: initialData.timeLimit || 1000,
        memoryLimit: initialData.memoryLimit || 256,
        maxHintAllowed:
          initialData.maxHintAllowed !== undefined
            ? initialData.maxHintAllowed
            : 3, // <--- BỔ SUNG
        deadline: initialData.deadline
          ? initialData.deadline.substring(0, 16)
          : "",
        description: initialData.description || "",
        sampleCode:
          initialData.sampleCode || "// Viết code mẫu ban đầu tại đây...",
        aiPromptInstruction: initialData.aiPromptInstruction || "",
      });

      setTestCases(
        initialData.testCases && initialData.testCases.length > 0
          ? initialData.testCases.map((tc) => ({
              inputData: tc.inputData || "",
              outputData: tc.outputData || "",
              isHidden: tc.isHidden || false,
              weight: tc.weight !== undefined ? tc.weight : 1.0,
              testType: tc.testType || "Thông thường",
              expectError: tc.expectError || false,
              description: tc.description || "",
            }))
          : [
              {
                inputData: "",
                outputData: "",
                isHidden: false,
                weight: 1.0,
                testType: "Thông thường",
                expectError: false,
                description: "",
              },
            ],
      );
    } else {
      setFormData({
        title: "",
        difficulty: "Easy",
        timeLimit: 1000,
        memoryLimit: 256,
        maxHintAllowed: 3,
        deadline: "",
        description: "",
        sampleCode: "// Viết code mẫu ban đầu tại đây...",
        aiPromptInstruction: "",
      });
      setTestCases([
        {
          inputData: "",
          outputData: "",
          isHidden: false,
          weight: 1.0,
          testType: "Thông thường",
          expectError: false,
          description: "",
        },
      ]);
    }
  }, [initialData, show]);

  // Thêm / Xóa / Cập nhật Test Cases
  const handleAddTestCase = () => {
    setTestCases([
      ...testCases,
      {
        inputData: "",
        outputData: "",
        isHidden: false,
        weight: 1.0,
        testType: "Thông thường",
        expectError: false,
        description: "",
      },
    ]);
  };

  const handleRemoveTestCase = (index) => {
    if (testCases.length === 1) {
      alert("Bài tập cần ít nhất 1 Test Case!");
      return;
    }
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...testCases];
    updated[index][field] = value;
    setTestCases(updated);
  };

  // Submit Form
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, testCases });
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        zIndex: 1050,
        overflow: "hidden",
      }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden text-start">
          {/* Header */}
          <div className="modal-header bg-white border-bottom px-4 py-3">
            <h5 className="fw-bold mb-0 text-dark">
              {initialData
                ? "Cập Nhật Bài Tập Lập Trình"
                : "Tạo Bài Tập Lập Trình & Cấu Hình AI"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div
              className="modal-body p-4"
              style={{ maxHeight: "75vh", overflowY: "auto" }}
            >
              {/* 1. Thông tin bài tập */}
              <h6 className="fw-bold text-primary mb-3">1. Thông tin chung</h6>
              <div className="row g-3 mb-4">
                <div className="col-md-8">
                  <label className="form-label fw-medium small">
                    Tiêu đề bài tập *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control rounded-3"
                    placeholder="VD: Tính diện tích và chu vi hình chữ nhật"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium small">Độ khó</label>
                  <select
                    className="form-select rounded-3"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({ ...formData, difficulty: e.target.value })
                    }
                  >
                    <option value="Easy">Dễ (Easy)</option>
                    <option value="Medium">Trung bình (Medium)</option>
                    <option value="Hard">Khó (Hard)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-medium small">
                    Giới hạn thời gian (ms)
                  </label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium small">
                    Giới hạn bộ nhớ (MB)
                  </label>
                  <input
                    type="number"
                    className="form-control rounded-3"
                    value={formData.memoryLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memoryLimit: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium small">
                    Hạn nộp (Deadline)
                  </label>
                  <input
                    type="datetime-local"
                    className="form-control rounded-3"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium small">
                    Mô tả đề bài *
                  </label>
                  <textarea
                    rows="3"
                    required
                    className="form-control rounded-3"
                    placeholder="Nhập yêu cầu bài toán, định dạng Input/Output..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label fw-medium small">
                    Code mẫu ban đầu (Sample Code)
                  </label>
                  <textarea
                    rows="3"
                    className="form-control font-monospace rounded-3 bg-light"
                    value={formData.sampleCode}
                    onChange={(e) =>
                      setFormData({ ...formData, sampleCode: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>
              {/* 2. Thiết lập AI Prompt */}
              <h6 className="fw-bold text-success mb-3">
                2. Thiết lập Trợ lý AI (Gemini Custom Prompt)
              </h6>
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 mb-4">
                <div className="row g-3">
                  <div className="col-md-9">
                    <label className="form-label fw-semibold text-dark small">
                      Hướng dẫn riêng cho AI khi sinh viên hỏi bài này (AI
                      Prompt Rule):
                    </label>
                    <textarea
                      rows="2"
                      className="form-control rounded-3"
                      placeholder="VD: Chỉ gợi ý công thức Chu vi = (a+b)*2, tuyệt đối không cho sẵn code hoàn chỉnh..."
                      value={formData.aiPromptInstruction}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          aiPromptInstruction: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold text-dark small">
                      Số lần AI gợi ý tối đa:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      className="form-control rounded-3"
                      value={formData.maxHintAllowed}
                      onChange={(e) => {
                        let val = Number(e.target.value);
                        if (val > 3) val = 3;
                        if (val < 0) val = 0;
                        setFormData({ ...formData, maxHintAllowed: val });
                      }}
                    />
                    <span
                      className="text-muted border-0 bg-transparent p-0 mt-1 d-block"
                      style={{ fontSize: "11px" }}
                    >
                      Tối đa 3 lần / bài tập
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 3. Bộ Test Cases mở rộng */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold text-dark mb-0">
                  3. Bộ Test Cases ({testCases.length})
                </h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1"
                  onClick={handleAddTestCase}
                >
                  <img
                    src={PlusIcon}
                    alt="Add"
                    style={{ width: "14px", height: "14px" }}
                  />
                  Thêm Test Case
                </button>
              </div>
              {testCases.map((tc, idx) => (
                <div key={idx} className="p-3 border rounded-3 bg-light mb-3">
                  {/* Hàng 1: Input, Output, Mô tả */}
                  <div className="row g-2 mb-2">
                    <div className="col-md-4">
                      <label className="form-label small fw-medium text-muted">
                        Input Data (Mỗi giá trị 1 dòng)
                      </label>
                      <textarea
                        rows="3"
                        className="form-control font-monospace small rounded-2"
                        placeholder={"5\n3"}
                        value={tc.inputData}
                        onChange={(e) =>
                          handleTestCaseChange(idx, "inputData", e.target.value)
                        }
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-medium text-muted">
                        Expected Output (Kết quả kỳ vọng)
                      </label>
                      <textarea
                        rows="3"
                        className="form-control font-monospace small rounded-2"
                        placeholder={"16.00\n15.00"}
                        value={tc.outputData}
                        onChange={(e) =>
                          handleTestCaseChange(
                            idx,
                            "outputData",
                            e.target.value,
                          )
                        }
                      ></textarea>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-medium text-muted">
                        Ghi chú / Mô tả Test Case
                      </label>
                      <textarea
                        rows="3"
                        className="form-control small rounded-2"
                        placeholder="VD: Kiểm tra với cạnh âm..."
                        value={tc.description}
                        onChange={(e) =>
                          handleTestCaseChange(
                            idx,
                            "description",
                            e.target.value,
                          )
                        }
                      ></textarea>
                    </div>
                  </div>

                  {/* Hàng 2: Thuộc tính mở rộng (Weight, TestType, Options, Xóa) */}
                  <div className="row g-2 align-items-center pt-2 border-top">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label small fw-medium text-muted mb-0 text-nowrap">
                          Trọng số (Weight):
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="form-control form-control-sm rounded-2"
                          value={tc.weight}
                          onChange={(e) =>
                            handleTestCaseChange(
                              idx,
                              "weight",
                              parseFloat(e.target.value) || 1.0,
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="col-md-4">
                      <div className="d-flex align-items-center gap-2">
                        <label className="form-label small fw-medium text-muted mb-0 text-nowrap">
                          Loại Test:
                        </label>
                        <select
                          className="form-select form-select-sm rounded-2"
                          value={tc.testType}
                          onChange={(e) =>
                            handleTestCaseChange(
                              idx,
                              "testType",
                              e.target.value,
                            )
                          }
                        >
                          <option value="Thông thường">Thông thường</option>
                          <option value="Giá trị biên">Giá trị biên</option>
                          <option value="Giá trị âm/Không hợp lệ">
                            Giá trị âm/Không hợp lệ
                          </option>
                          <option value="Bẫy chuỗi/Kiểu dữ liệu">
                            Bẫy chuỗi/Kiểu dữ liệu
                          </option>
                          <option value="Hiệu năng/Mảng lớn">
                            Hiệu năng/Mảng lớn
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-3 d-flex align-items-center justify-content-around">
                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`hidden-${idx}`}
                          checked={tc.isHidden}
                          onChange={(e) =>
                            handleTestCaseChange(
                              idx,
                              "isHidden",
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          className="form-check-label small"
                          htmlFor={`hidden-${idx}`}
                        >
                          Ẩn Test
                        </label>
                      </div>

                      <div className="form-check mb-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`expectErr-${idx}`}
                          checked={tc.expectError}
                          onChange={(e) =>
                            handleTestCaseChange(
                              idx,
                              "expectError",
                              e.target.checked,
                            )
                          }
                        />
                        <label
                          className="form-check-label small text-danger fw-medium"
                          htmlFor={`expectErr-${idx}`}
                        >
                          Bẫy lỗi
                        </label>
                      </div>
                    </div>

                    <div className="col-md-2 text-end">
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger w-100 rounded-2 d-inline-flex align-items-center justify-content-center gap-1"
                          onClick={() => handleRemoveTestCase(idx)}
                        >
                          <img
                            src={TrashIcon}
                            alt="Delete"
                            style={{ width: "14px", height: "14px" }}
                          />
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-white">
              <button
                type="button"
                className="btn btn-light rounded-3 px-4"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="btn btn-success rounded-3 px-4 fw-semibold"
              >
                Lưu Bài Tập
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
