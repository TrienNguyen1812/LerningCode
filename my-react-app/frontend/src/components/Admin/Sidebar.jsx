import { useState } from "react";

import DashboardIcon from "../../assets/icons/dashboard.svg";
import InboxIcon from "../../assets/icons/mail-outline.svg";
import ContentIcon from "../../assets/icons/content-view-28-regular.svg";
import LearningPathIcon from "../../assets/icons/book-open.svg";
import DownIcon from "../../assets/icons/down.svg";
import PublicSiteIcon from "../../assets/icons/folder-public-20-regular.svg";
import UserIcon from "../../assets/icons/user.svg";
import TrackingIcon from "../../assets/icons/bar-chart.svg";
import HelpIcon from "../../assets/icons/help-outline-rounded.svg";
import SettingIcon from "../../assets/icons/setting-outlined.svg";

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [isContentsOpen, setIsContentsOpen] = useState(true);
  const [isUserOpen, setIsUserOpen] = useState(false);

  return (
    <div className="sb-sidebar">
      {/* Header Studio */}
      <div className="sb-header-box">
        <div className="sb-studio-card">
          <div className="d-flex align-items-center gap-2">
            <div className="sb-logo-wrapper">
              <span>F</span>
            </div>
            <h6 className="sb-studio-name">DevLerner</h6>
          </div>
          <div className="text-muted" style={{ fontSize: "12px" }}>
            <i className="fa-solid fa-code-compare"></i>
          </div>
        </div>
      </div>

      {/* Danh sách Menu điều hướng */}
      <div className="sb-menu-list">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`sb-item-btn ${activeTab === "dashboard" ? "sb-active" : ""}`}
        >
          <span className="d-flex align-items-center">
            <img src={DashboardIcon} className="sb-icon-img" alt="Dashboard" />
            Dashboard
          </span>
        </button>

        {/* 2. Inbox (Tĩnh) */}
        <button className="sb-item-btn">
          <span className="d-flex align-items-center">
            <img src={InboxIcon} className="sb-icon-img" alt="Inbox" />
            Inbox
          </span>
        </button>

        {/* 3. Contents Dropdown */}
        <div>
          <button
            onClick={() => setIsContentsOpen(!isContentsOpen)}
            className="sb-item-btn"
          >
            <span className="d-flex align-items-center">
              <img src={ContentIcon} className="sb-icon-img" alt="Content" />
              Contents
            </span>
            <img src={DownIcon} className="sb-icon-img" alt="Down" />
          </button>

          {/* SUBMENU CONTENTS (Đã làm sạch, không bị lặp) */}
          {isContentsOpen && (
            <div className="sb-submenu-box">
              <button
                onClick={() => setActiveTab("courses")}
                className={`sb-sub-btn ${activeTab === "courses" ? "sb-active" : ""}`}
              >
                Courses
              </button>

              <button className="sb-sub-btn">Quiz</button>

              <button
                onClick={() => setActiveTab("files")}
                className={`sb-sub-btn ${activeTab === "files" ? "sb-active" : ""}`}
              >
                File & Folder
              </button>

              <button
                onClick={() => setActiveTab("problem")}
                className={`sb-sub-btn ${activeTab === "problem" ? "sb-active" : ""}`}
              >
                Problem
              </button>
            </div>
          )}
        </div>

        {/* 4. Learning Path (Tĩnh) */}
        <button className="sb-item-btn">
          <span className="d-flex align-items-center">
            <img
              src={LearningPathIcon}
              className="sb-icon-img"
              alt="LearningPath"
            />
            Learning Path
          </span>
        </button>

        {/* 5. Public Site (Tĩnh) */}
        <button className="sb-item-btn">
          <span className="d-flex align-items-center">
            <img
              src={PublicSiteIcon}
              className="sb-icon-img"
              alt="PublicSite"
            />
            Public Site
          </span>
        </button>

        {/* 6. User Dropdown */}
        <div>
          <button
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="sb-item-btn"
          >
            <span className="d-flex align-items-center">
              <img src={UserIcon} className="sb-icon-img" alt="User" />
              User
            </span>
            <img src={DownIcon} className="sb-icon-img" alt="Down" />
          </button>

          {/* SUBMENU USER */}
          {isUserOpen && (
            <div className="sb-submenu-box">
              <button
                onClick={() => setActiveTab("students")}
                className={`sb-sub-btn ${activeTab === "students" ? "sb-active" : ""}`}
              >
                Students
              </button>

              <button
                onClick={() => setActiveTab("instructors")}
                className={`sb-sub-btn ${activeTab === "instructors" ? "sb-active" : ""}`}
              >
                Instructors
              </button>
            </div>
          )}
        </div>

        {/* 7. Tracking (Tĩnh) */}
        <button className="sb-item-btn">
          <span className="d-flex align-items-center">
            <img src={TrackingIcon} className="sb-icon-img" alt="Tracking" />
            Tracking
          </span>
        </button>
      </div>

      {/* Footer đáy Sidebar */}
      <div className="sb-footer">
        <button className="sb-item-btn mb-1">
          <span className="d-flex align-items-center">
            <img src={HelpIcon} className="sb-icon-img" alt="Help" />
            Help
          </span>
        </button>
        <button className="sb-item-btn mb-2">
          <span className="d-flex align-items-center">
            <img src={SettingIcon} className="sb-icon-img" alt="Setting" />
            Settings
          </span>
        </button>
        <button
          onClick={onLogout}
          className="btn text-start border-0 fw-semibold px-3 py-2 rounded-3 w-100 text-danger text-sm d-flex align-items-center"
          style={{ backgroundColor: "#fff5f5" }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket me-2"></i>
          Log out
        </button>
      </div>
    </div>
  );
}
