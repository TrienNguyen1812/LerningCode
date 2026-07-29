import AddIcon from "../../assets/icons/add.svg";
import NotificationIcon from "../../assets/icons/bell.svg";
import SearchIcon from "../../assets/icons/search.svg";
import DownIcon from "../../assets/icons/down.svg";

export default function Header() {
  return (
    <div className="bg-white border-bottom px-4 py-3 sticky-top d-flex align-items-center justify-content-between">
      {/* Welcome Title */}
      <div>
        <h4
          className="fw-bold text-dark m-0 d-flex align-items-center gap-2"
          style={{ letterSpacing: "-0.5px" }}
        >
          Welcome, Theresa <span style={{ fontSize: "1.2rem" }}> </span>
        </h4>
        <small
          className="text-muted d-block mt-0.5"
          style={{ fontSize: "12px" }}
        >
          Here's what happened with your learning system
        </small>
      </div>

      {/* Header Utilities Actions */}
      <div className="d-flex align-items-center gap-3">
        {/* Actions short cut keys */}
        <button
          className="btn p-0 rounded-circle border-0 text-muted bg-light d-flex align-items-center justify-content-center"
          style={{ width: "36px", height: "36px" }}
        >
          <img
            src={AddIcon}
            alt="Add"
            style={{
              width: "16px",
              height: "16px",
              display: "block",
              objectFit: "contain",
            }}
          />
        </button>

        <button
          className="btn p-0 rounded-circle border-0 text-muted bg-light d-flex align-items-center justify-content-center"
          style={{ width: "36px", height: "36px" }}
        >
          <img
            src={NotificationIcon}
            alt="Notification"
            style={{
              width: "16px",
              height: "16px",
              display: "block",
              objectFit: "contain",
            }}
          />
        </button>

        <button
          className="btn p-0 rounded-circle border-0 text-muted bg-light d-flex align-items-center justify-content-center"
          style={{ width: "36px", height: "36px" }}
        >
          <img
            src={SearchIcon}
            alt="Search"
            style={{
              width: "16px",
              height: "16px",
              display: "block",
              objectFit: "contain",
            }}
          />
        </button>
        <div className="vr text-muted my-1" style={{ height: "24px" }}></div>

        {/* User profile dropdown component placeholder */}
        <div className="d-flex align-items-center gap-2 cursor-pointer">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
            alt="Admin profile"
            className="rounded-circle object-cover"
            style={{ width: "36px", height: "36px" }}
          />
          <div className="d-none d-md-block text-start">
            <h6
              className="fw-bold text-dark m-0 small"
              style={{ fontSize: "13px" }}
            >
              Theresa
            </h6>
            <span className="text-muted d-block" style={{ fontSize: "11px" }}>
              Super Admin
            </span>
          </div>
          <img src={DownIcon} className="sb-icon-img" alt="Down" />
        </div>
      </div>
    </div>
  );
}
