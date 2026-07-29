import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GeneralInfoForm from "../../components/Admin/GeneralInfoForm";
import LessonManagement from "./LessonManagement";
import { courseService } from "../../services/courseService";

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [sections, setSections] = useState([]);

  const [formData, setFormData] = useState({
    courseName: "",
    description: "",
    thumbnail: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // 1. Thêm Section mới
  const handleAddSection = () => {
    const newSectionIndex = sections.length + 1;
    const newSection = {
      id: `section-${Date.now()}`,
      title: `Section ${newSectionIndex}`,
      blocks: [],
    };

    setSections((prev) => [...prev, newSection]);
    setActiveTab(newSection.id);
  };

  // 2. Xóa Section
  const handleDeleteSection = (e, sectionId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa Section này?")) {
      const updatedSections = sections.filter((s) => s.id !== sectionId);
      setSections(updatedSections);

      if (activeTab === sectionId) {
        setActiveTab(
          updatedSections.length > 0 ? updatedSections[0].id : "general"
        );
      }
    }
  };

  // 3. Callback cập nhật dữ liệu từ LessonManagement
  const handleSectionDataChange = (sectionId, updatedTitle, updatedBlocks) => {
    setSections((prevSections) =>
      prevSections.map((sec) =>
        sec.id === sectionId
          ? { ...sec, title: updatedTitle, blocks: updatedBlocks }
          : sec
      )
    );
  };

  // 4. Lưu toàn bộ khóa học
  const handleSaveCourse = async () => {
    if (!formData.courseName.trim()) {
      alert("Vui lòng nhập Tên khóa học!");
      setActiveTab("general");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("courseName", formData.courseName.trim());
      data.append("description", formData.description || "");

      if (formData.thumbnail) {
        data.append("thumbnail", formData.thumbnail);
      }

      const formattedSections = sections.map((sec, index) => {
        const blocks = sec.blocks || [];

        const problemIds = blocks
          .filter((b) => b.type === "problem" || b.problemId || b.IdProblem)
          .map((b) => Number(b.problemId || b.IdProblem || b.id))
          .filter((id) => !isNaN(id) && id > 0);

        const fileIds = blocks
          .filter((b) =>
            ["image", "video", "document", "file"].includes(b.type)
          )
          .map((b) => Number(b.fileId || b.IdFile || b.id))
          .filter((id) => !isNaN(id) && id > 0);

        const textContent = blocks
          .filter((b) => b.type === "text")
          .map((b) => b.value)
          .join("\n");

        return {
          orderIndex: index + 1,
          title: sec.title,
          content: textContent,
          problemIds: problemIds,
          fileIds: fileIds,
          blocks: blocks,
        };
      });

      data.append("sections", JSON.stringify(formattedSections));

      await courseService.createCourse(data);

      alert("Tạo khóa học và danh sách bài học thành công!");
      navigate("/courses");
    } catch (error) {
      alert(
        "Đã xảy ra lỗi khi tạo khóa học: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* SIDEBAR BÊN TRÁI */}
      <div
        className="bg-white border-end"
        style={{ width: "260px", minWidth: "260px" }}
      >
        <div className="p-3 border-bottom">
          <button
            className="btn btn-link text-decoration-none text-secondary p-0 d-flex align-items-center gap-2 fs-6"
            onClick={() => navigate("/courses")}
          >
            <span>&lt;</span> Back to Course List
          </button>
        </div>

        <div className="p-3">
          {/* General Information */}
          <div
            className={`p-3 rounded-3 mb-2 ${
              activeTab === "general"
                ? "bg-light border-start border-4 border-info shadow-sm fw-bold text-dark"
                : "text-secondary"
            }`}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveTab("general")}
          >
            <h6 className="mb-1" style={{ fontSize: "14px" }}>
              General Information
            </h6>
            <span
              className="text-muted fw-normal"
              style={{ fontSize: "11px" }}
            >
              Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Section Counter & Nút thêm Section */}
          <div className="d-flex align-items-center justify-content-between px-2 py-2 text-muted mt-3">
            <span className="fw-semibold" style={{ fontSize: "13px" }}>
              Sections ({sections.length})
            </span>
            <button
              type="button"
              className="btn btn-info text-white p-0 d-flex align-items-center justify-content-center rounded-2"
              style={{
                width: "28px",
                height: "28px",
                backgroundColor: "#30b0b0",
                border: "none",
              }}
              onClick={handleAddSection}
              title="Thêm Section mới"
            >
              +
            </button>
          </div>

          {/* Danh sách các Section */}
          <div className="d-flex flex-column gap-1 mt-2">
            {sections.map((sec) => (
              <div
                key={sec.id}
                className={`px-3 py-2 rounded-3 border-start border-3 d-flex justify-content-between align-items-center ${
                  activeTab === sec.id
                    ? "bg-light border-info fw-bold text-dark shadow-sm"
                    : "border-transparent text-secondary"
                }`}
                style={{ cursor: "pointer", fontSize: "14px" }}
                onClick={() => setActiveTab(sec.id)}
              >
                <span className="text-truncate" style={{ maxWidth: "170px" }}>
                  {sec.title}
                </span>

                <button
                  type="button"
                  className="btn btn-link text-danger p-0 border-0 fs-6 lh-1 opacity-75 hover-opacity-100"
                  onClick={(e) => handleDeleteSection(e, sec.id)}
                  title="Xóa section này"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH BÊN PHẢI */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* HEADER TOP BAR */}
        <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0 text-dark">
            {activeTab === "general"
              ? "Create Course"
              : sections.find((s) => s.id === activeTab)?.title ||
                "Section Editor"}
          </h5>

          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">
              Last Saved:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <button
              type="button"
              className="btn btn-outline-secondary px-3 py-1 fw-medium"
              style={{ borderRadius: "8px" }}
            >
              Preview
            </button>

            <button
              type="button"
              className="btn btn-info text-white px-4 py-1 fw-semibold d-flex align-items-center gap-2"
              style={{
                borderRadius: "8px",
                backgroundColor: "#30b0b0",
                border: "none",
              }}
              onClick={handleSaveCourse}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>

        {/* CONTENT CHÍNH */}
        <div className="p-4 overflow-auto flex-grow-1 d-flex justify-content-center">
          {activeTab === "general" ? (
            <GeneralInfoForm
              formData={formData}
              setFormData={setFormData}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
            />
          ) : (
            <div className="w-100" style={{ maxWidth: "900px" }}>
              {sections
                .filter((sec) => sec.id === activeTab)
                .map((sec) => (
                  <LessonManagement
                    key={sec.id}
                    title={sec.title}
                    blocks={sec.blocks}
                    onChangeData={(updatedTitle, updatedBlocks) =>
                      handleSectionDataChange(
                        sec.id,
                        updatedTitle,
                        updatedBlocks
                      )
                    }
                  />
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}