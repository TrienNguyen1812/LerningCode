export default function MailList({ mails, selectedMail, onSelectMail }) {
  return (
    <div className="col-12 col-md-5 col-lg-4">
      <div className="list-group shadow-sm rounded-4 border-0 overflow-hidden">
        {mails.map((m) => {
          const isSelected = selectedMail === m.id;
          
          // Badge config dựa trên loại mail
          const badgeConfig = {
            danger: { bg: "bg-danger", label: " Cần can thiệp" },
            warning: { bg: "bg-warning text-dark", label: " Lạm dụng AI" },
            success: { bg: "bg-success", label: " Tiến bộ" },
          }[m.type] || { bg: "bg-secondary", label: "Thông báo" };

          return (
            <button
              key={m.id}
              onClick={() => onSelectMail(m.id)}
              className={`list-group-item list-group-item-action p-3 border-0 border-bottom text-start transition-all ${
                isSelected ? "bg-light border-start border-4 border-primary fw-bold" : ""
              }`}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className={`badge ${badgeConfig.bg} rounded-pill px-2 py-1`}>
                  {badgeConfig.label}
                </span>
                <small className="text-muted" style={{ fontSize: "11px" }}>
                  {m.time}
                </small>
              </div>
              <div className="text-dark small text-truncate mt-1">{m.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}