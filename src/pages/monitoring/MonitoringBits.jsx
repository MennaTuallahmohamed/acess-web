import React from "react";

/* ── Status Badge ──────────────────────────────────────── */
const STATUS_LABELS = {
  en: {
    OK: "OPERATIONAL",
    ATTENTION: "ATTENTION",
    NEEDS_MAINTENANCE: "MAINTENANCE REQ",
    UNDER_MAINTENANCE: "UNDER MAINT.",
    OUT_OF_SERVICE: "OUT OF SERVICE",
  },
  ar: {
    OK: "يعمل",
    ATTENTION: "تحتاج متابعة",
    NEEDS_MAINTENANCE: "تحتاج صيانة",
    UNDER_MAINTENANCE: "تحت الصيانة",
    OUT_OF_SERVICE: "خارج الخدمة",
  },
};

export function StatusBadge({ value, lang = "en" }) {
  const labels = STATUS_LABELS[lang] || STATUS_LABELS.en;
  const label = labels[value] || value || "UNKNOWN";
  const statusClass = `status-badge status-${value || "UNKNOWN"}`;
  return <span className={statusClass}>{label}</span>;
}

/* ── KPI Card ──────────────────────────────────────────── */
export function KpiCard({ icon, label, value, sublabel, accent, onClick, active }) {
  return (
    <div
      className={`snapshot-kpi-card${active ? " active" : ""}`}
      style={{ "--kpi-accent": accent }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="kpi-top">
        <div className="kpi-icon">{icon}</div>
        <div className="kpi-trend">
          {active ? "▸ ACTIVE" : ""}
        </div>
      </div>
      <div className="kpi-value">{value ?? "—"}</div>
      <div className="kpi-label">{label}</div>
      {sublabel && <div className="kpi-sublabel">{sublabel}</div>}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────── */
export function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">⬡</div>
      <div className="empty-state-text">{text || "No data available"}</div>
    </div>
  );
}