import StatusIcon from "../../assets/icons/tick-circle-outline.svg";
import FilterIcon from "../../assets/icons/filter.svg";
import SortIcon from "../../assets/icons/sort.svg";
import ListIcon from "../../assets/icons/list.svg";
import GridIcon from "../../assets/icons/view-grid.svg";

export default function ContentHeader({
  count = 0,
  unitText = "Courses in total",
  onNewCourse,
  buttonText = "New Course",
  customAction, // Prop mới: cho phép truyền custom UI (như Dropdown) từ bên ngoài vào
}) {
  return (
    <div className="cm-nav-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      {/* Khối hiển thị số lượng & Tiêu đề */}
      <div className="text-nowrap">
        <h5 className="m-0 text-secondary fw-semibold d-flex align-items-baseline gap-2">
          <span className="text-dark fs-1 fw-bold lh-1">{count}</span>
          <span className="fs-5 text-muted fw-medium">{unitText}</span>
        </h5>
      </div>

      {/* Khối các nút chức năng */}
      <div className="cm-action-group d-flex align-items-center gap-2 flex-wrap">
        <button type="button" className="cm-btn-filter d-flex align-items-center gap-2">
          <img src={StatusIcon} alt="Status" style={{ width: "16px", height: "16px" }} />
          All status
        </button>

        <button type="button" className="cm-btn-filter d-flex align-items-center gap-2">
          <img src={FilterIcon} alt="Filter" style={{ width: "16px", height: "16px" }} />
          Filter
        </button>

        <button type="button" className="cm-btn-filter d-flex align-items-center gap-2">
          <img src={SortIcon} alt="Sort" style={{ width: "16px", height: "16px" }} />
          Sort
        </button>

        {/* Toggle Layout */}
        <div className="cm-layout-toggle d-flex">
          <button type="button" className="cm-toggle-btn d-flex align-items-center justify-content-center p-0" style={{ width: "36px", height: "36px" }}>
            <img src={ListIcon} alt="List View" style={{ width: "18px", height: "18px" }} />
          </button>
          <button type="button" className="cm-toggle-btn active d-flex align-items-center justify-content-center p-0" style={{ width: "36px", height: "36px" }}>
            <img src={GridIcon} alt="Grid View" style={{ width: "18px", height: "18px" }} />
          </button>
        </div>

        {/* Nút hành động chính: Ưu tiên dùng customAction nếu có, không thì dùng nút đơn mặc định */}
        {customAction ? (
          customAction
        ) : (
          onNewCourse && (
            <button type="button" className="cm-btn-primary d-flex align-items-center gap-1" onClick={onNewCourse}>
              <span className="fs-4 lh-1" style={{ marginTop: "-2px" }}>+</span> {buttonText}
            </button>
          )
        )}
      </div>
    </div>
  );
}