import React, { useMemo, useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────
   TECHNICIANS PAGE — SMART IT
   بيانات صحيحة من الباك إند:
   - technicians: كل الفنيين
   - tasks: التكليفات
   - inspections: كل التفتيشات القادمة من الباك إند
───────────────────────────────────────────────────────────────── */

/* =========================
   HELPERS
========================= */

const initials = (name = "") =>
  String(name || "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const calcPct = (value, total) => {
  const v = num(value);
  const t = num(total);
  return t ? Math.round((v / t) * 100) : 0;
};

const fmtDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const fmtDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const sameDayKey = (value) => toDateInput(value);

const todayKey = () => toDateInput(new Date());

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateInput(d);
};

const inDateRange = (value, from, to) => {
  if (!value) return false;
  const key = toDateInput(value);
  if (!key) return false;
  if (from && key < from) return false;
  if (to && key > to) return false;
  return true;
};

const lower = (v) => String(v || "").trim().toLowerCase();

const fullNameOf = (user = {}) => {
  const fullName = String(user.fullName || "").trim();
  if (fullName) return fullName;

  const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (name) return name;

  return user.username || user.email || `Technician #${user.id || "—"}`;
};

const getInspectionTechId = (inspection = {}) =>
  inspection.technicianId ??
  inspection.userId ??
  inspection.inspectorId ??
  inspection.createdById ??
  inspection.technician?.id ??
  inspection.user?.id ??
  inspection.inspector?.id ??
  inspection.createdBy?.id ??
  null;

const getInspectionTime = (inspection = {}) =>
  inspection.inspectedAt ||
  inspection.scanAt ||
  inspection.scannedAt ||
  inspection.completedAt ||
  inspection.createdAt ||
  inspection.updatedAt ||
  null;

const getDeviceName = (inspection = {}) =>
  inspection.device?.name ||
  inspection.device?.deviceName ||
  inspection.device?.serialNumber ||
  inspection.device?.code ||
  inspection.deviceName ||
  inspection.deviceCode ||
  inspection.serialNumber ||
  "Unknown device";

const getLocationName = (inspection = {}) =>
  inspection.location?.name ||
  inspection.device?.location?.name ||
  inspection.locationName ||
  inspection.device?.locationName ||
  "Unknown location";

const getZoneCluster = (inspection = {}) => {
  const cluster =
    inspection.cluster ||
    inspection.device?.cluster ||
    inspection.location?.cluster ||
    inspection.device?.location?.cluster ||
    "";
  const zone =
    inspection.zone ||
    inspection.device?.zone ||
    inspection.location?.zone ||
    inspection.device?.location?.zone ||
    "";

  if (cluster && zone) return `${cluster} / ${zone}`;
  return cluster || zone || "—";
};

/*
  مهم جدًا:
  هنا بنقرأ حالة التفتيش من أكتر من شكل ممكن ييجي من الباك إند.
  لو عندك اسم field محدد في Prisma مثل result أو status أو isOk الكود هيفهمه.
*/
const normalizeInspectionResult = (inspection = {}) => {
  const raw =
    inspection.result ??
    inspection.status ??
    inspection.inspectionStatus ??
    inspection.scanStatus ??
    inspection.condition ??
    inspection.deviceStatus ??
    inspection.finalStatus ??
    "";

  const value = lower(raw);

  if (
    inspection.isOk === true ||
    inspection.ok === true ||
    inspection.isGood === true ||
    inspection.passed === true ||
    value === "ok" ||
    value === "good" ||
    value === "passed" ||
    value === "pass" ||
    value === "safe" ||
    value === "سليم" ||
    value === "صالح"
  ) {
    return "OK";
  }

  if (
    inspection.isOk === false ||
    inspection.ok === false ||
    inspection.isGood === false ||
    inspection.passed === false ||
    value === "not_ok" ||
    value === "not ok" ||
    value === "not-good" ||
    value === "not_good" ||
    value === "failed" ||
    value === "fail" ||
    value === "issue" ||
    value === "issues" ||
    value === "defective" ||
    value === "damaged" ||
    value === "غير سليم" ||
    value === "تالف"
  ) {
    return "NOT_OK";
  }

  /*
    لو التفتيش فيه مشاكل أو issueReason يبقى غير سليم.
    بشرط إن التفتيش موجود فعلا ومش مجرد داتا ناقصة.
  */
  const issueCount =
    Array.isArray(inspection.issues) ? inspection.issues.length :
    Array.isArray(inspection.inspectionIssues) ? inspection.inspectionIssues.length :
    Array.isArray(inspection.issueReports) ? inspection.issueReports.length :
    0;

  if (issueCount > 0 || inspection.issueReason || inspection.problem || inspection.defect) {
    return "NOT_OK";
  }

  /*
    الافتراضي:
    طالما في Inspection record ومفيش مشاكل واضحة، نعتبره سليم.
    لو الباك إند عندك بيخزن حالة مختلفة، ضيفي اسمها فوق.
  */
  return "OK";
};

const getInspectionNotes = (inspection = {}) =>
  inspection.notes ||
  inspection.note ||
  inspection.comment ||
  inspection.issueReason ||
  inspection.problem ||
  inspection.defect ||
  inspection.description ||
  "Inspection recorded successfully.";

const isCompletedTask = (task = {}) => {
  const status = lower(task.status || task.taskStatus || task.state);
  return (
    task.completed === true ||
    task.isCompleted === true ||
    status === "completed" ||
    status === "done" ||
    status === "closed" ||
    status === "finished"
  );
};

const getTaskTechId = (task = {}) =>
  task.assignedToId ??
  task.technicianId ??
  task.userId ??
  task.assignedTo?.id ??
  task.technician?.id ??
  task.user?.id ??
  null;

const isActiveTech = (tech = {}) => {
  if (tech.isActive === false) return false;
  const status = lower(tech.status);
  if (!status) return true;
  return status === "active" || status === "enabled" || status === "available";
};

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  officeNumber: "",
  jobTitle: "TECHNICIAN",
  region: "",
  notes: "",
  roleId: 2,
};

/* ─────────────────────────────────────────────────────────────────
   LUXURY CSS
───────────────────────────────────────────────────────────────── */

const LUX_CSS = `
  .lux-tp-root {
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: var(--bg-tertiary, #f8fafc);
    min-height: 100vh;
    padding: 24px 32px;
    color: #0f172a;
  }

  .lux-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }

  .lux-btn-primary:hover {
    box-shadow: 0 6px 16px rgba(99,102,241,0.4);
    transform: translateY(-1px);
  }

  .lux-btn-primary:disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .lux-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: #fff;
    color: #334155;
    font-weight: 700;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lux-btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .lux-page-title {
    font-size: 28px;
    font-weight: 900;
    letter-spacing: -0.5px;
    margin: 0 0 6px 0;
    color: #0f172a;
  }

  .lux-page-sub {
    font-size: 14px;
    color: #64748b;
    font-weight: 600;
  }

  .lux-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(140px, 1fr));
    gap: 16px;
    margin-top: 24px;
    margin-bottom: 24px;
  }

  .lux-kpi-card {
    background: #fff;
    padding: 20px;
    border-radius: 16px;
    border: 1px solid #f1f5f9;
    box-shadow: 0 4px 20px rgba(0,0,0,0.025);
    display: flex;
    flex-direction: column;
    min-height: 110px;
  }

  .lux-kpi-title {
    font-size: 11px;
    color: #64748b;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }

  .lux-kpi-val {
    font-size: 32px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
  }

  .lux-kpi-mini {
    margin-top: auto;
    font-size: 12px;
    color: #94a3b8;
    font-weight: 700;
  }

  .lux-toolbar {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 14px;
    margin-bottom: 20px;
    display: grid;
    grid-template-columns: 1.5fr 180px 180px;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  }

  .lux-input,
  .lux-select {
    width: 100%;
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    color: #0f172a;
    font-weight: 700;
  }

  .lux-input:focus,
  .lux-select:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 4px rgba(139,92,246,0.1);
    background: #fff;
  }

  .lux-tech-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }

  .lux-tech-card {
    background: #fff;
    border-radius: 18px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 15px rgba(0,0,0,0.025);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    display: flex;
    flex-direction: column;
  }

  .lux-tech-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px rgba(15,23,42,0.08);
    border-color: #c7d2fe;
  }

  .lux-tech-head {
    padding: 22px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #f1f5f9;
    position: relative;
  }

  .lux-tech-avatar {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 900;
    color: #4f46e5;
    border: 2px solid #fff;
    box-shadow: 0 4px 10px rgba(79,70,229,0.15);
    flex-shrink: 0;
  }

  .lux-tech-status {
    position: absolute;
    top: 24px;
    right: 24px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 4px #ecfdf5;
  }

  .lux-tech-status.off {
    background: #94a3b8;
    box-shadow: 0 0 0 4px #f1f5f9;
  }

  .lux-stat-grid {
    padding: 18px 22px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    background: #f8fafc;
  }

  .lux-stat-box {
    background: #fff;
    border: 1px solid #eef2f7;
    border-radius: 14px;
    padding: 12px;
    min-height: 78px;
  }

  .lux-stat-label {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.35px;
    margin-bottom: 6px;
  }

  .lux-stat-value {
    font-size: 20px;
    font-weight: 900;
    color: #0f172a;
  }

  .lux-progress-wrap {
    padding: 0 22px 18px 22px;
    background: #f8fafc;
  }

  .lux-progress-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 11px;
    color: #64748b;
    font-weight: 900;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .lux-progress {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
  }

  .lux-progress > div {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #10b981, #6366f1);
  }

  .lux-table-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
    overflow: hidden;
    margin-top: 22px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.025);
  }

  .lux-table-head {
    padding: 18px 22px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }

  .lux-table {
    width: 100%;
    border-collapse: collapse;
  }

  .lux-table th {
    text-align: left;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.35px;
    padding: 14px 18px;
    background: #f8fafc;
    border-bottom: 1px solid #f1f5f9;
  }

  .lux-table td {
    padding: 14px 18px;
    border-bottom: 1px solid #f8fafc;
    font-size: 13px;
    color: #334155;
    font-weight: 700;
  }

  .lux-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 900;
    white-space: nowrap;
  }

  .lux-pill.ok {
    background: #ecfdf5;
    color: #047857;
  }

  .lux-pill.bad {
    background: #fef2f2;
    color: #b91c1c;
  }

  .lux-pill.neutral {
    background: #eef2ff;
    color: #4338ca;
  }

  .lux-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: luxFadeIn 0.2s forwards;
  }

  .lux-modal-body {
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 24px 48px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 720px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(20px);
    animation: luxSlideUp 0.3s forwards;
  }

  .lux-slide-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.4);
    backdrop-filter: blur(2px);
    z-index: 998;
    animation: luxFadeIn 0.3s forwards;
  }

  .lux-slide-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 720px;
    background: #fff;
    z-index: 999;
    box-shadow: -10px 0 40px rgba(0,0,0,0.12);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
    border-left: 1px solid #e2e8f0;
  }

  .lux-slide-panel.open {
    transform: translateX(0);
  }

  .lux-field {
    margin-bottom: 20px;
  }

  .lux-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: #475569;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .lux-empty {
    background: #fff;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    color: #94a3b8;
    font-weight: 800;
  }

  @keyframes luxFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes luxSlideUp {
    from { transform: translateY(20px); opacity: 0.7; }
    to { transform: translateY(0); opacity: 1; }
  }

  @media (max-width: 1100px) {
    .lux-kpi-grid {
      grid-template-columns: repeat(3, 1fr);
    }
    .lux-toolbar {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .lux-tp-root {
      padding: 18px;
    }
    .lux-kpi-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .lux-stat-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .lux-tech-grid {
      grid-template-columns: 1fr;
    }
  }
`;

/* ─────────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────── */

function NewTechModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handle = async () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.officeNumber
    ) {
      setError("Please complete all required fields.");
      return;
    }

    setError("");
    const payload = {
      ...form,
      fullName: `${form.firstName} ${form.lastName}`.trim(),
    };

    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err?.message || "Failed to create technician.");
    }
  };

  return (
    <div
      className="lux-modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="lux-modal-body">
        <div
          style={{
            padding: "24px 32px",
            borderBottom: "1px solid #f1f5f9",
            background: "#f8fafc",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Enroll Technician
            </h2>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "13px",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              Create login credentials for a new field technician.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#94a3b8",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "32px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "13px",
                fontWeight: 800,
                marginBottom: "24px",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0 20px",
            }}
          >
            <div className="lux-field">
              <label className="lux-label">First Name *</label>
              <input
                className="lux-input"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Last Name *</label>
              <input
                className="lux-input"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Username *</label>
              <input
                className="lux-input"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Password *</label>
              <input
                type="password"
                className="lux-input"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Email *</label>
              <input
                type="email"
                className="lux-input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Phone</label>
              <input
                className="lux-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Office / ID Number *</label>
              <input
                className="lux-input"
                value={form.officeNumber}
                onChange={(e) =>
                  setForm({ ...form, officeNumber: e.target.value })
                }
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Region</label>
              <input
                className="lux-input"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
              />
            </div>

            <div className="lux-field" style={{ gridColumn: "1 / -1" }}>
              <label className="lux-label">Notes</label>
              <input
                className="lux-input"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "20px 32px",
            background: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
          }}
        >
          <button className="lux-btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="lux-btn-primary" onClick={handle} disabled={loading}>
            {loading ? "Creating..." : "Create Technician"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricBox({ label, value, color }) {
  return (
    <div className="lux-stat-box">
      <div className="lux-stat-label">{label}</div>
      <div className="lux-stat-value" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function ResultPill({ result }) {
  const ok = result === "OK";
  return (
    <span className={`lux-pill ${ok ? "ok" : "bad"}`}>
      {ok ? "سليم / OK" : "غير سليم / NOT OK"}
    </span>
  );
}

function TechDetailsOverlay({ tech, onClose }) {
  if (!tech) return null;

  return (
    <>
      <div className="lux-slide-backdrop" onClick={onClose} />
      <div className="lux-slide-panel open">
        <div
          style={{
            padding: "38px 32px 28px 32px",
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderBottom: "1px solid #e2e8f0",
            position: "relative",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "22px",
              right: "22px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              className="lux-tech-avatar"
              style={{ width: "74px", height: "74px", fontSize: "28px" }}
            >
              {initials(tech.displayName)}
            </div>

            <div>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0 0 4px 0",
                }}
              >
                {tech.displayName}
              </h2>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                ID: {tech.officeNumber || tech.id} · {tech.jobTitle || "Technician"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#8b5cf6",
                  fontWeight: 900,
                  marginTop: "4px",
                }}
              >
                {tech.email || "—"}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowY: "auto",
            background: "#fff",
          }}
        >
          <h3
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: "0.5px",
              margin: "0 0 16px 0",
              fontWeight: 900,
            }}
          >
            Technician Accurate Performance
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <MetricBox label="Total Inspections" value={tech.inspectionsCount} color="#4f46e5" />
            <MetricBox label="OK" value={tech.okInspections} color="#10b981" />
            <MetricBox label="NOT OK" value={tech.notOkInspections} color="#ef4444" />
            <MetricBox label="Quality" value={`${tech.okRate}%`} color="#8b5cf6" />
          </div>

          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "16px",
              background: "#f8fafc",
              marginBottom: "26px",
            }}
          >
            <div className="lux-progress-label">
              <span>OK Ratio</span>
              <span>
                {tech.okInspections} سليم من {tech.inspectionsCount} تفتيش
              </span>
            </div>
            <div className="lux-progress">
              <div style={{ width: `${tech.okRate}%` }} />
            </div>
          </div>

          <h3
            style={{
              fontSize: "12px",
              textTransform: "uppercase",
              color: "#64748b",
              letterSpacing: "0.5px",
              margin: "0 0 16px 0",
              fontWeight: 900,
            }}
          >
            Latest Inspections Details
          </h3>

          {tech.recentInspections.length === 0 ? (
            <div className="lux-empty">لا يوجد تفتيشات لهذا الفني.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {tech.recentInspections.map((ins) => (
                <div
                  key={ins.__rowKey}
                  style={{
                    padding: "15px",
                    border: "1px solid #f1f5f9",
                    borderRadius: "14px",
                    background: "#f8fafc",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 900,
                        color: "#64748b",
                      }}
                    >
                      {fmtDateTime(ins.__time)}
                    </span>
                    <ResultPill result={ins.__result} />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div className="lux-stat-label">Device</div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
                        {getDeviceName(ins)}
                      </div>
                    </div>

                    <div>
                      <div className="lux-stat-label">Location</div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
                        {getLocationName(ins)}
                      </div>
                    </div>

                    <div>
                      <div className="lux-stat-label">Cluster / Zone</div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
                        {getZoneCluster(ins)}
                      </div>
                    </div>

                    <div>
                      <div className="lux-stat-label">Inspection ID</div>
                      <div style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
                        #{ins.id || ins._id || "—"}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#334155",
                      fontWeight: 700,
                      lineHeight: 1.6,
                    }}
                  >
                    {getInspectionNotes(ins)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

export function TechniciansPage({
  technicians = [],
  tasks = [],
  inspections = [],
  onCreateUser,
  loading,
  canManage,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("INSPECTIONS_DESC");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(true);

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = LUX_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const preparedInspections = useMemo(() => {
    return (Array.isArray(inspections) ? inspections : []).map((inspection, index) => {
      const result = normalizeInspectionResult(inspection);
      const time = getInspectionTime(inspection);

      return {
        ...inspection,
        __rowKey: inspection.id || inspection._id || `${time || "row"}-${index}`,
        __techId: getInspectionTechId(inspection),
        __result: result,
        __time: time,
      };
    });
  }, [inspections]);

  const dateFilteredInspections = useMemo(() => {
    if (!dateFrom && !dateTo) return preparedInspections;
    return preparedInspections.filter((inspection) =>
      inDateRange(inspection.__time, dateFrom, dateTo)
    );
  }, [preparedInspections, dateFrom, dateTo]);

  const techRows = useMemo(() => {
    const safeTechnicians = Array.isArray(technicians) ? technicians : [];
    const safeTasks = Array.isArray(tasks) ? tasks : [];

    return safeTechnicians.map((tech) => {
      const displayName = fullNameOf(tech);
      const myTasks = safeTasks.filter((task) => String(getTaskTechId(task)) === String(tech.id));

      const myInspections = dateFilteredInspections
        .filter((inspection) => String(inspection.__techId) === String(tech.id))
        .sort((a, b) => new Date(b.__time || 0) - new Date(a.__time || 0));

      const okInspections = myInspections.filter((x) => x.__result === "OK").length;
      const notOkInspections = myInspections.filter((x) => x.__result === "NOT_OK").length;
      const inspectionsCount = myInspections.length;
      const lastActivity = myInspections[0]?.__time || null;
      const uniqueLocations = new Set(myInspections.map(getLocationName).filter(Boolean)).size;
      const uniqueDevices = new Set(myInspections.map(getDeviceName).filter(Boolean)).size;
      const activeDays = new Set(myInspections.map((x) => sameDayKey(x.__time)).filter(Boolean)).size;
      const todayInspections = myInspections.filter((x) => sameDayKey(x.__time) === todayKey()).length;
      const yesterdayInspections = myInspections.filter((x) => sameDayKey(x.__time) === yesterdayKey()).length;
      const avgPerActiveDay = activeDays ? Math.round(inspectionsCount / activeDays) : 0;
      const riskScore = inspectionsCount ? Math.round((notOkInspections * 100) / inspectionsCount) : 0;

      return {
        ...tech,
        displayName,
        assignedTasks: myTasks.length,
        completedTasks: myTasks.filter(isCompletedTask).length,
        pendingTasks: myTasks.filter((x) => !isCompletedTask(x)).length,
        inspectionsCount,
        okInspections,
        notOkInspections,
        okRate: calcPct(okInspections, inspectionsCount),
        notOkRate: calcPct(notOkInspections, inspectionsCount),
        riskScore,
        uniqueLocations,
        uniqueDevices,
        activeDays,
        todayInspections,
        yesterdayInspections,
        avgPerActiveDay,
        lastActivity,
        recentInspections: myInspections.slice(0, 20),
        isActiveComputed: isActiveTech(tech),
      };
    });
  }, [technicians, tasks, dateFilteredInspections]);

  const filteredRows = useMemo(() => {
    const q = lower(search);

    let rows = techRows.filter((tech) => {
      const matchesSearch =
        !q ||
        lower(tech.displayName).includes(q) ||
        lower(tech.username).includes(q) ||
        lower(tech.email).includes(q) ||
        lower(tech.officeNumber).includes(q) ||
        lower(tech.region).includes(q) ||
        lower(tech.jobTitle).includes(q);

      const matchesResult =
        resultFilter === "ALL" ||
        (resultFilter === "HAS_NOT_OK" && tech.notOkInspections > 0) ||
        (resultFilter === "HIGH_RISK" && tech.riskScore >= 30 && tech.inspectionsCount > 0) ||
        (resultFilter === "ONLY_OK" && tech.inspectionsCount > 0 && tech.notOkInspections === 0) ||
        (resultFilter === "ACTIVE_TODAY" && tech.todayInspections > 0) ||
        (resultFilter === "NO_INSPECTIONS" && tech.inspectionsCount === 0);

      return matchesSearch && matchesResult;
    });

    rows = [...rows].sort((a, b) => {
      if (sortBy === "INSPECTIONS_DESC") return b.inspectionsCount - a.inspectionsCount;
      if (sortBy === "NOT_OK_DESC") return b.notOkInspections - a.notOkInspections;
      if (sortBy === "OK_DESC") return b.okInspections - a.okInspections;
      if (sortBy === "QUALITY_DESC") return b.okRate - a.okRate;
      if (sortBy === "RISK_DESC") return b.riskScore - a.riskScore;
      if (sortBy === "LOCATIONS_DESC") return b.uniqueLocations - a.uniqueLocations;
      if (sortBy === "LAST_ACTIVITY_DESC") {
        return new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0);
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return rows;
  }, [techRows, search, resultFilter, sortBy]);

  const totals = useMemo(() => {
    const totalTechs = techRows.length;
    const activeTechs = techRows.filter((x) => x.isActiveComputed).length;
    const totalInspections = techRows.reduce((sum, x) => sum + x.inspectionsCount, 0);
    const totalOk = techRows.reduce((sum, x) => sum + x.okInspections, 0);
    const totalNotOk = techRows.reduce((sum, x) => sum + x.notOkInspections, 0);
    const totalTasks = techRows.reduce((sum, x) => sum + x.assignedTasks, 0);
    const todayInspections = techRows.reduce((sum, x) => sum + x.todayInspections, 0);
    const yesterdayInspections = techRows.reduce((sum, x) => sum + x.yesterdayInspections, 0);
    const noWorkTechs = techRows.filter((x) => x.inspectionsCount === 0).length;
    const highRiskTechs = techRows.filter((x) => x.riskScore >= 30 && x.inspectionsCount > 0).length;

    return {
      totalTechs,
      activeTechs,
      totalInspections,
      totalOk,
      totalNotOk,
      totalTasks,
      todayInspections,
      yesterdayInspections,
      noWorkTechs,
      highRiskTechs,
      globalOkRate: calcPct(totalOk, totalInspections),
    };
  }, [techRows]);

  const smartInsights = useMemo(() => {
    const activeRows = techRows.filter((x) => x.inspectionsCount > 0);
    const topPerformer = [...activeRows].sort((a, b) => b.inspectionsCount - a.inspectionsCount)[0] || null;
    const bestQuality = [...activeRows].sort((a, b) => b.okRate - a.okRate || b.inspectionsCount - a.inspectionsCount)[0] || null;
    const mostIssues = [...activeRows].sort((a, b) => b.notOkInspections - a.notOkInspections)[0] || null;
    const mostLocations = [...activeRows].sort((a, b) => b.uniqueLocations - a.uniqueLocations)[0] || null;

    const dailyMap = new Map();
    const locationMap = new Map();

    dateFilteredInspections.forEach((inspection) => {
      const day = sameDayKey(inspection.__time) || "Unknown";
      const dayRow = dailyMap.get(day) || { day, total: 0, ok: 0, notOk: 0 };
      dayRow.total += 1;
      if (inspection.__result === "OK") dayRow.ok += 1;
      else dayRow.notOk += 1;
      dailyMap.set(day, dayRow);

      const loc = getLocationName(inspection);
      const locRow = locationMap.get(loc) || { location: loc, total: 0, ok: 0, notOk: 0 };
      locRow.total += 1;
      if (inspection.__result === "OK") locRow.ok += 1;
      else locRow.notOk += 1;
      locationMap.set(loc, locRow);
    });

    const dailyTrend = [...dailyMap.values()]
      .sort((a, b) => a.day.localeCompare(b.day))
      .slice(-7);

    const hotLocations = [...locationMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const problemLocations = [...locationMap.values()]
      .sort((a, b) => b.notOk - a.notOk)
      .filter((x) => x.notOk > 0)
      .slice(0, 5);

    const alerts = [];
    if (totals.noWorkTechs > 0) alerts.push(`${totals.noWorkTechs} technician(s) have no inspections in this filter.`);
    if (totals.highRiskTechs > 0) alerts.push(`${totals.highRiskTechs} technician(s) have NOT OK rate above 30%.`);
    if (totals.todayInspections === 0) alerts.push("No inspections recorded today in the loaded data.");
    if (totals.totalInspections && totals.globalOkRate < 70) alerts.push("Global OK quality is below 70%; review issues and locations.");

    return { topPerformer, bestQuality, mostIssues, mostLocations, dailyTrend, hotLocations, problemLocations, alerts };
  }, [techRows, dateFilteredInspections, totals]);

  const downloadCsv = (filename, headers, rows) => {
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTechniciansCsv = () => {
    const headers = [
      "Technician",
      "Email",
      "Office ID",
      "Total Inspections",
      "OK",
      "NOT OK",
      "OK Rate",
      "Assigned Tasks",
      "Completed Tasks",
      "Pending Tasks",
      "Last Activity",
    ];

    const rows = filteredRows.map((tech) => [
      tech.displayName,
      tech.email || "",
      tech.officeNumber || tech.id || "",
      tech.inspectionsCount,
      tech.okInspections,
      tech.notOkInspections,
      `${tech.okRate}%`,
      tech.assignedTasks,
      tech.completedTasks,
      tech.pendingTasks,
      fmtDateTime(tech.lastActivity),
    ]);

    downloadCsv("technicians-performance-report.csv", headers, rows);
  };

  const exportDetailedInspectionsCsv = () => {
    const headers = [
      "Technician",
      "Inspection ID",
      "Date / Time",
      "Result",
      "Device",
      "Location",
      "Cluster / Zone",
      "Notes",
    ];

    const rows = filteredRows.flatMap((tech) =>
      tech.recentInspections.map((ins) => [
        tech.displayName,
        ins.id || ins._id || "",
        fmtDateTime(ins.__time),
        ins.__result,
        getDeviceName(ins),
        getLocationName(ins),
        getZoneCluster(ins),
        getInspectionNotes(ins),
      ])
    );

    downloadCsv("technicians-inspections-details.csv", headers, rows);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="lux-tp-root">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
          gap: "16px",
        }}
      >
        <div>
          <h1 className="lux-page-title">Technician Intelligence</h1>
          <p className="lux-page-sub">
            بيانات كل فني محسوبة من التفتيشات الحقيقية: إجمالي، سليم، غير سليم، وآخر نشاط.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="lux-btn-secondary" onClick={exportTechniciansCsv}>
            Export Summary
          </button>
          <button className="lux-btn-secondary" onClick={exportDetailedInspectionsCsv}>
            Export Details
          </button>
          <button className="lux-btn-secondary" onClick={printReport}>
            Print
          </button>

          {canManage && (
            <button className="lux-btn-primary" onClick={() => setModalOpen(true)}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Register Technician
            </button>
          )}
        </div>
      </div>

      <div className="lux-kpi-grid">
        <div className="lux-kpi-card">
          <div className="lux-kpi-title">Total Technicians</div>
          <div className="lux-kpi-val" style={{ color: "#4f46e5" }}>
            {totals.totalTechs}
          </div>
          <div className="lux-kpi-mini">{totals.activeTechs} active</div>
        </div>

        <div className="lux-kpi-card">
          <div className="lux-kpi-title">Total Inspections</div>
          <div className="lux-kpi-val" style={{ color: "#0f172a" }}>
            {totals.totalInspections}
          </div>
          <div className="lux-kpi-mini">from backend inspections</div>
        </div>

        <div className="lux-kpi-card">
          <div className="lux-kpi-title">OK Inspections</div>
          <div className="lux-kpi-val" style={{ color: "#10b981" }}>
            {totals.totalOk}
          </div>
          <div className="lux-kpi-mini">{totals.globalOkRate}% quality</div>
        </div>

        <div className="lux-kpi-card">
          <div className="lux-kpi-title">NOT OK Inspections</div>
          <div className="lux-kpi-val" style={{ color: "#ef4444" }}>
            {totals.totalNotOk}
          </div>
          <div className="lux-kpi-mini">needs follow-up</div>
        </div>

        <div className="lux-kpi-card">
          <div className="lux-kpi-title">Global Tasks</div>
          <div className="lux-kpi-val" style={{ color: "#f59e0b" }}>
            {totals.totalTasks}
          </div>
          <div className="lux-kpi-mini">all assigned tasks</div>
        </div>

        <div className="lux-kpi-card">
          <div className="lux-kpi-title">Shown Results</div>
          <div className="lux-kpi-val" style={{ color: "#8b5cf6" }}>
            {filteredRows.length}
          </div>
          <div className="lux-kpi-mini">after filters</div>
        </div>
      </div>

      <div className="lux-toolbar" style={{ gridTemplateColumns: "1.4fr 160px 160px 190px 190px" }}>
        <input
          className="lux-input"
          placeholder="Search by technician name, email, ID, region..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          className="lux-input"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          title="From date"
        />

        <input
          className="lux-input"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          title="To date"
        />

        <select
          className="lux-select"
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
        >
          <option value="ALL">All technicians</option>
          <option value="ACTIVE_TODAY">Worked today</option>
          <option value="HAS_NOT_OK">Has NOT OK</option>
          <option value="HIGH_RISK">High risk 30%+</option>
          <option value="ONLY_OK">Only OK</option>
          <option value="NO_INSPECTIONS">No inspections</option>
        </select>

        <select
          className="lux-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="INSPECTIONS_DESC">Most inspections</option>
          <option value="NOT_OK_DESC">Most NOT OK</option>
          <option value="RISK_DESC">Highest risk</option>
          <option value="OK_DESC">Most OK</option>
          <option value="QUALITY_DESC">Best quality</option>
          <option value="LOCATIONS_DESC">Most locations</option>
          <option value="LAST_ACTIVITY_DESC">Latest activity</option>
          <option value="NAME_ASC">Name A-Z</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "10px", margin: "-8px 0 18px", flexWrap: "wrap" }}>
        <button className="lux-btn-secondary" onClick={() => { setDateFrom(todayKey()); setDateTo(todayKey()); }}>Today</button>
        <button className="lux-btn-secondary" onClick={() => { setDateFrom(yesterdayKey()); setDateTo(yesterdayKey()); }}>Yesterday</button>
        <button className="lux-btn-secondary" onClick={() => { const d = new Date(); d.setDate(d.getDate() - 6); setDateFrom(toDateInput(d)); setDateTo(todayKey()); }}>Last 7 days</button>
        <button className="lux-btn-secondary" onClick={() => { setDateFrom(""); setDateTo(""); }}>All dates</button>
        <button className="lux-btn-secondary" onClick={() => setShowAdvanced((v) => !v)}>{showAdvanced ? "Hide Smart Insights" : "Show Smart Insights"}</button>
      </div>

      {showAdvanced && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "22px" }}>
          <div className="lux-kpi-card">
            <div className="lux-kpi-title">Top Performer</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a" }}>{smartInsights.topPerformer?.displayName || "—"}</div>
            <div className="lux-kpi-mini">{smartInsights.topPerformer ? `${smartInsights.topPerformer.inspectionsCount} inspections` : "No data"}</div>
          </div>

          <div className="lux-kpi-card">
            <div className="lux-kpi-title">Best Quality</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#10b981" }}>{smartInsights.bestQuality?.displayName || "—"}</div>
            <div className="lux-kpi-mini">{smartInsights.bestQuality ? `${smartInsights.bestQuality.okRate}% OK` : "No data"}</div>
          </div>

          <div className="lux-kpi-card">
            <div className="lux-kpi-title">Most Issues</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#ef4444" }}>{smartInsights.mostIssues?.displayName || "—"}</div>
            <div className="lux-kpi-mini">{smartInsights.mostIssues ? `${smartInsights.mostIssues.notOkInspections} NOT OK` : "No issues"}</div>
          </div>

          <div className="lux-kpi-card">
            <div className="lux-kpi-title">Most Locations</div>
            <div style={{ fontSize: "18px", fontWeight: 900, color: "#8b5cf6" }}>{smartInsights.mostLocations?.displayName || "—"}</div>
            <div className="lux-kpi-mini">{smartInsights.mostLocations ? `${smartInsights.mostLocations.uniqueLocations} locations` : "No data"}</div>
          </div>
        </div>
      )}

      {showAdvanced && smartInsights.alerts.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "16px", padding: "16px 18px", marginBottom: "22px" }}>
          <div style={{ fontSize: "13px", fontWeight: 900, color: "#92400e", marginBottom: "8px" }}>Smart Alerts</div>
          <div style={{ display: "grid", gap: "6px" }}>
            {smartInsights.alerts.map((alert, index) => (
              <div key={index} style={{ fontSize: "13px", color: "#92400e", fontWeight: 800 }}>⚠ {alert}</div>
            ))}
          </div>
        </div>
      )}

      {showAdvanced && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "18px", marginBottom: "22px" }}>
          <div className="lux-table-card" style={{ marginTop: 0 }}>
            <div className="lux-table-head"><h2 style={{ margin: 0, fontSize: "16px", fontWeight: 900 }}>Last 7 Days Trend</h2></div>
            <div style={{ padding: "18px", display: "grid", gap: "12px" }}>
              {smartInsights.dailyTrend.length === 0 ? <div className="lux-empty">No daily data</div> : smartInsights.dailyTrend.map((d) => (
                <div key={d.day}>
                  <div className="lux-progress-label"><span>{d.day}</span><span>{d.total} inspections · {d.notOk} issues</span></div>
                  <div className="lux-progress"><div style={{ width: `${calcPct(d.total, Math.max(...smartInsights.dailyTrend.map((x) => x.total), 1))}%` }} /></div>
                </div>
              ))}
            </div>
          </div>

          <div className="lux-table-card" style={{ marginTop: 0 }}>
            <div className="lux-table-head"><h2 style={{ margin: 0, fontSize: "16px", fontWeight: 900 }}>Problem Locations</h2></div>
            <div style={{ overflowX: "auto" }}>
              <table className="lux-table">
                <thead><tr><th>Location</th><th>Total</th><th>NOT OK</th></tr></thead>
                <tbody>
                  {(smartInsights.problemLocations.length ? smartInsights.problemLocations : smartInsights.hotLocations).map((loc) => (
                    <tr key={loc.location}><td>{loc.location}</td><td>{loc.total}</td><td><span className={loc.notOk ? "lux-pill bad" : "lux-pill ok"}>{loc.notOk}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="lux-empty">Loading technicians performance...</div>
      ) : filteredRows.length === 0 ? (
        <div className="lux-empty">لا توجد بيانات مطابقة للفلاتر الحالية.</div>
      ) : (
        <div className="lux-tech-grid">
          {filteredRows.map((tech) => (
            <div
              key={tech.id}
              className="lux-tech-card"
              onClick={() => setSelectedTech(tech)}
            >
              <div className="lux-tech-head">
                <div className="lux-tech-avatar">{initials(tech.displayName)}</div>
                <div
                  className={`lux-tech-status ${
                    tech.isActiveComputed ? "" : "off"
                  }`}
                />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: "3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={tech.displayName}
                  >
                    {tech.displayName}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      fontWeight: 800,
                    }}
                  >
                    {tech.jobTitle || "Technician"} · ID:{" "}
                    {tech.officeNumber || tech.id}
                  </div>
                </div>
              </div>

              <div className="lux-stat-grid">
                <MetricBox
                  label="Inspections"
                  value={tech.inspectionsCount}
                  color="#4f46e5"
                />
                <MetricBox label="OK" value={tech.okInspections} color="#10b981" />
                <MetricBox
                  label="NOT OK"
                  value={tech.notOkInspections}
                  color="#ef4444"
                />
                <MetricBox label="Quality" value={`${tech.okRate}%`} color="#8b5cf6" />
              </div>

              <div style={{ padding: "0 22px 16px", background: "#f8fafc", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                <MetricBox label="Today" value={tech.todayInspections} color="#0ea5e9" />
                <MetricBox label="Locations" value={tech.uniqueLocations} color="#7c3aed" />
                <MetricBox label="Avg/Day" value={tech.avgPerActiveDay} color="#f59e0b" />
              </div>

              <div className="lux-progress-wrap">
                <div className="lux-progress-label">
                  <span>Inspection quality</span>
                  <span>
                    {tech.okInspections}/{tech.inspectionsCount}
                  </span>
                </div>
                <div className="lux-progress">
                  <div style={{ width: `${tech.okRate}%` }} />
                </div>
              </div>

              <div
                style={{
                  padding: "16px 22px",
                  background: "#fff",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Last: {tech.lastActivity ? fmtDate(tech.lastActivity) : "No activity"}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 900,
                    color: "#4f46e5",
                  }}
                >
                  View Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="lux-table-card">
        <div className="lux-table-head">
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                color: "#0f172a",
                fontWeight: 900,
              }}
            >
              Technicians Ranking
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "12px",
                color: "#64748b",
                fontWeight: 700,
              }}
            >
              ترتيب كامل بالأرقام الصحيحة لكل فني.
            </p>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="lux-table">
            <thead>
              <tr>
                <th>Technician</th>
                <th>Total</th>
                <th>OK</th>
                <th>NOT OK</th>
                <th>Quality</th>
                <th>Today</th>
                <th>Locations</th>
                <th>Avg/Day</th>
                <th>Tasks</th>
                <th>Last Activity</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((tech) => (
                <tr key={`table-${tech.id}`}>
                  <td>
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>
                      {tech.displayName}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {tech.email || "—"}
                    </div>
                  </td>
                  <td>{tech.inspectionsCount}</td>
                  <td>
                    <span className="lux-pill ok">{tech.okInspections}</span>
                  </td>
                  <td>
                    <span className="lux-pill bad">{tech.notOkInspections}</span>
                  </td>
                  <td>
                    <span className="lux-pill neutral">{tech.okRate}%</span>
                  </td>
                  <td>{tech.todayInspections}</td>
                  <td>{tech.uniqueLocations}</td>
                  <td>{tech.avgPerActiveDay}</td>
                  <td>
                    {tech.completedTasks}/{tech.assignedTasks}
                  </td>
                  <td>{fmtDateTime(tech.lastActivity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && canManage && (
        <NewTechModal
          loading={loading}
          onClose={() => setModalOpen(false)}
          onSubmit={onCreateUser}
        />
      )}

      {selectedTech && (
        <TechDetailsOverlay
          tech={selectedTech}
          onClose={() => setSelectedTech(null)}
        />
      )}
    </div>
  );
}

export default TechniciansPage;
