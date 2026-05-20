import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const INSPECTIONS_CSS = `
.insp-root *, .insp-root *::before, .insp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.insp-root {
  --blue: #378ADD;
  --green: #1D9E75;
  --amber: #BA7517;
  --red: #C0392B;
  --slate: #7B8A9A;
  --surface: #ffffff;
  --surface2: #f7f8fa;
  --border: rgba(0,0,0,0.07);
  --text: #16181d;
  --muted: #6b7585;
  --faint: #9aa0ad;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #f4f6f9;
  color: var(--text);
  padding: 28px 24px;
  min-height: 100vh;
}

/* Top bar */
.insp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.insp-topbar__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.insp-topbar__sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}

.insp-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.insp-refresh-btn {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.insp-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* Alerts */
.insp-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.insp-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.insp-alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* Filter - Premium */
.insp-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(55,138,221,0.15), transparent 34%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.insp-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.insp-filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.insp-filter-icon {
  width: 36px;
  height: 36px;
  border-radius: 13px;
  background: #ebf4ff;
  color: #378add;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 900;
}

.insp-filter-title-text {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.insp-filter-title-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.insp-filter-result {
  font-size: 12px;
  font-weight: 800;
  color: #378add;
  background: #ebf4ff;
  border: 1px solid rgba(55,138,221,0.16);
  border-radius: 999px;
  padding: 7px 12px;
}

.insp-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(5, minmax(135px, 1fr));
  gap: 12px;
  align-items: end;
}

.insp-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.insp-filter-field label {
  font-size: 10px;
  font-weight: 900;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.insp-filter-input,
.insp-filter-select {
  width: 100%;
  height: 46px;
  border-radius: 15px;
  border: 1px solid #dbe4ef;
  background-color: #f8fafc;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  outline: none;
  transition: 0.18s ease;
}

.insp-filter-input {
  font-weight: 600;
}

.insp-filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.insp-filter-input:hover,
.insp-filter-select:hover {
  border-color: #b7c6d8;
  background-color: #ffffff;
}

.insp-filter-input:focus,
.insp-filter-select:focus {
  border-color: #378add;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(55, 138, 221, 0.13);
}

.insp-filter-select {
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 21px) 50%,
    calc(100% - 14px) 50%;
  background-size: 7px 7px, 7px 7px;
  background-repeat: no-repeat;
  padding-right: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.insp-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.insp-filter-hint {
  font-size: 12px;
  color: #94a3b8;
}

.insp-filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.insp-filter-btn {
  height: 44px;
  border-radius: 14px;
  border: 0;
  padding: 0 18px;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.18s ease;
  white-space: nowrap;
}

.insp-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.insp-filter-btn-ok {
  background: #0f172a;
  color: #ffffff;
  min-width: 78px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

.insp-filter-btn:hover {
  transform: translateY(-1px);
}

.insp-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.insp-filter-btn-ok:hover {
  background: #378add;
  box-shadow: 0 10px 20px rgba(55, 138, 221, 0.24);
}

.insp-filter-btn:active {
  transform: translateY(0);
}

/* Summary */
.insp-summary {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.insp-summary-tile {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 16px 16px 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.insp-summary-tile__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.insp-summary-tile__val {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
  margin-top: 3px;
}

.insp-summary-tile__label {
  font-size: 11px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 700;
}

/* View */
.insp-view-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 14px;
}

.insp-view-toggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 10px;
}

.insp-view-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.insp-view-btn--active {
  background: var(--surface2);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Panel */
.insp-panel {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.insp-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 0.5px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.insp-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}

.insp-panel__sub {
  font-size: 12px;
  color: var(--faint);
}

.insp-records {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
}

/* Table */
.insp-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.insp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1100px;
}

.insp-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
  background: var(--surface2);
  border-bottom: 0.5px solid var(--border);
}

.insp-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.insp-table tr:last-child td {
  border-bottom: none;
}

.insp-table tr:hover td {
  background: #fafbfc;
}

.insp-dev-code {
  font-size: 13px;
  font-weight: 800;
  color: var(--blue);
  letter-spacing: .3px;
}

.insp-dev-name {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.insp-tech-name {
  font-size: 12px;
  color: var(--muted);
}

.insp-notes {
  font-size: 12px;
  color: var(--faint);
  max-width: 280px;
}

.insp-locline {
  font-size: 12px;
  color: var(--muted);
}

/* Badges */
.badge {
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: .2px;
}

.badge--ok {
  background: #e6f7f1;
  color: #0f6e56;
}

.badge--att {
  background: #fff4e0;
  color: #854f0b;
}

.badge--maint {
  background: #fdecea;
  color: #a32d2d;
}

.badge--oos {
  background: #f1f3f5;
  color: #6b7585;
}

/* Timeline */
.insp-timeline {
  padding: 8px 20px;
}

.insp-tl-item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 0.5px solid var(--border);
}

.insp-tl-item:last-child {
  border-bottom: none;
}

.insp-tl-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
}

.insp-tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.insp-tl-connector {
  width: 1px;
  flex: 1;
  background: var(--border);
  margin-top: 5px;
  min-height: 16px;
}

.insp-tl-body {
  flex: 1;
}

.insp-tl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.insp-tl-dev {
  font-size: 13px;
  font-weight: 800;
  color: var(--blue);
}

.insp-tl-loc {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 4px;
}

.insp-tl-meta {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.insp-tl-time,
.insp-tl-note,
.insp-tl-tech {
  font-size: 11px;
  color: var(--faint);
}

/* Empty / Loading */
.insp-empty,
.insp-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.insp-loading-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  border-top-color: #378ADD;
  margin: 0 auto 12px;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1450px) {
  .insp-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(150px, 1fr));
  }
}

@media (max-width: 1100px) {
  .insp-summary {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .insp-root {
    padding: 16px 14px;
  }

  .insp-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insp-filter-actions {
    width: 100%;
  }

  .insp-filter-btn {
    flex: 1;
  }
}

@media (max-width: 620px) {
  .insp-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .insp-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .insp-filter-grid {
    grid-template-columns: 1fr;
  }

  .insp-filter-footer {
    align-items: stretch;
  }

  .insp-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .insp-filter-btn {
    width: 100%;
  }
}
`;

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK: { label: "OK", cls: "badge--ok" },
  NOT_OK: { label: "Not OK", cls: "badge--maint" },
  PARTIAL: { label: "Partial", cls: "badge--att" },
  NOT_REACHABLE: { label: "Not Reachable", cls: "badge--oos" },
};

const BADGE_MAP_AR = {
  OK: { label: "سليم", cls: "badge--ok" },
  NOT_OK: { label: "غير سليم", cls: "badge--maint" },
  PARTIAL: { label: "جزئي", cls: "badge--att" },
  NOT_REACHABLE: { label: "غير متاح", cls: "badge--oos" },
};

const DOT_COLORS = {
  OK: "#1D9E75",
  NOT_OK: "#C0392B",
  PARTIAL: "#BA7517",
  NOT_REACHABLE: "#7B8A9A",
};

const TILE_COLORS = {
  total: "#378ADD",
  ok: "#1D9E75",
  notOk: "#C0392B",
  partial: "#BA7517",
  unreachable: "#7B8A9A",
};

const DEFAULT_FILTERS = {
  search: "",
  status: "ALL",
  cluster: "ALL",
  building: "ALL",
  zone: "ALL",
  direction: "ALL",
};

const STATUS_OPTIONS = [
  { key: "ALL", en: "All statuses", ar: "كل الحالات" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "NOT_OK", en: "Not OK", ar: "غير سليم" },
  { key: "PARTIAL", en: "Partial", ar: "جزئي" },
  { key: "NOT_REACHABLE", en: "Not Reachable", ar: "غير متاح" },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(iso) {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fmtTime(iso) {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function pickToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

function pickBaseUrl(propBaseUrl) {
  const fromProp = propBaseUrl?.trim();
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();

  const fromLocal =
    localStorage.getItem("apiBaseUrl") ||
    localStorage.getItem("baseUrl") ||
    sessionStorage.getItem("apiBaseUrl") ||
    sessionStorage.getItem("baseUrl");

  const raw =
    fromProp ||
    fromEnv ||
    fromLocal ||
    "https://acess-backend-production.up.railway.app";

  return raw.replace(/\/+$/, "");
}

function normalizeSearchText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (raw === "OK" || raw === "GOOD" || raw === "VALID") return "OK";
  if (raw === "NOT_OK" || raw === "BAD" || raw === "FAILED" || raw === "FAIL") return "NOT_OK";
  if (raw === "PARTIAL" || raw === "PARTLY") return "PARTIAL";
  if (raw === "NOT_REACHABLE" || raw === "UNREACHABLE" || raw === "OFFLINE") return "NOT_REACHABLE";

  return raw || "NOT_REACHABLE";
}

function cleanOptions(list) {
  return [...new Set(list.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ar"));
}

function normalizeInspection(item) {
  const device = item.device || {};

  const location =
    device.location ||
    item.location ||
    item.deviceLocation ||
    item.place ||
    {};

  const tech =
    item.technician ||
    item.user ||
    item.createdBy ||
    item.inspector ||
    item.employee ||
    {};

  const cleanLocation = {
    cluster:
      location.cluster ||
      item.cluster ||
      device.cluster ||
      location.clusterName ||
      item.clusterName ||
      device.clusterName ||
      "",

    building:
      location.building ||
      item.building ||
      device.building ||
      location.buildingName ||
      item.buildingName ||
      device.buildingName ||
      "",

    zone:
      location.zone ||
      item.zone ||
      device.zone ||
      location.zoneName ||
      item.zoneName ||
      device.zoneName ||
      "",

    direction:
      location.direction ||
      item.direction ||
      device.direction ||
      location.side ||
      item.side ||
      device.side ||
      "",
  };

  const deviceCode =
    device.deviceCode ||
    device.code ||
    device.barcode ||
    item.deviceCode ||
    item.code ||
    item.barcode ||
    item.serial ||
    `#${item.deviceId || item.id || ""}`;

  const deviceName =
    device.deviceName ||
    device.name ||
    item.deviceName ||
    item.name ||
    "Unknown device";

  const serialNumber =
    device.serialNumber ||
    device.serial ||
    item.serialNumber ||
    item.serial ||
    "";

  const technicianName =
    tech.fullName ||
    tech.name ||
    tech.username ||
    [tech.firstName, tech.lastName].filter(Boolean).join(" ") ||
    tech.email ||
    item.technicianName ||
    item.inspectorName ||
    "";

  return {
    id: item.id,
    deviceId: item.deviceId || device.id,

    inspectionStatus: normalizeStatus(
      item.inspectionStatus ||
      item.status ||
      item.result ||
      item.condition
    ),

    issueReason: item.issueReason || item.reason || item.issue || "",
    notes: item.notes || item.note || item.comment || item.comments || "",

    locationText:
      item.locationText ||
      item.locationName ||
      [
        cleanLocation.cluster,
        cleanLocation.building,
        cleanLocation.zone,
        cleanLocation.direction,
      ]
        .filter(Boolean)
        .join(" · "),

    inspectedAt: item.inspectedAt || item.createdAt || item.updatedAt || null,
    createdAt: item.createdAt || item.inspectedAt || item.updatedAt || null,

    technicianName,

    device: {
      id: device.id || item.deviceId,
      deviceCode,
      deviceName,
      serialNumber,
      location: cleanLocation,
    },
  };
}

function buildInspectionSearchText(ins) {
  const loc = ins.device?.location || {};

  return normalizeSearchText(
    [
      ins.id,
      ins.deviceId,
      ins.inspectionStatus,
      ins.issueReason,
      ins.notes,
      ins.locationText,
      ins.technicianName,
      ins.device?.id,
      ins.device?.deviceCode,
      ins.device?.deviceName,
      ins.device?.serialNumber,
      loc.cluster,
      loc.building,
      loc.zone,
      loc.direction,
      fmt(ins.inspectedAt || ins.createdAt),
      fmtTime(ins.inspectedAt || ins.createdAt),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function fetchInspectionsFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/inspections`,
    `${baseUrl}/api/inspections`,
    `${baseUrl}/viewer/inspections`,
    `${baseUrl}/dashboard/inspections`,
    `${baseUrl}/dashboard/viewer/inspections`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText} @ ${url}`);
        continue;
      }

      const data = await response.json();

      const rawList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.inspections)
          ? data.inspections
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.results)
          ? data.results
          : [];

      return {
        sourceUrl: url,
        items: rawList.map(normalizeInspection),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working inspections endpoint found.");
}

function StatusBadge({ value, lang }) {
  const map = lang === "ar" ? BADGE_MAP_AR : BADGE_MAP;
  const b = map[value] || { label: value || "Unknown", cls: "badge--oos" };

  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export function ViewerInspectionsPage({
  inspections: inspectionsProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const [view, setView] = useState("table");

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [inspections, setInspections] = useState(
    Array.isArray(inspectionsProp)
      ? inspectionsProp.map(normalizeInspection)
      : []
  );

  const [loading, setLoading] = useState(!Array.isArray(inspectionsProp));
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadInspections() {
    if (Array.isArray(inspectionsProp)) {
      setInspections(inspectionsProp.map(normalizeInspection));
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const result = await fetchInspectionsFromApi(baseUrl, token);

      const sorted = [...result.items].sort(
        (a, b) =>
          new Date(b.inspectedAt || b.createdAt || 0) -
          new Date(a.inspectedAt || a.createdAt || 0)
      );

      setInspections(sorted);
      setSourceUrl(result.sourceUrl);
    } catch (err) {
      console.error("Failed to load inspections:", err);
      setError(err?.message || "Failed to load inspections from backend.");
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const options = useMemo(() => {
    const clusters = [];
    const buildings = [];
    const zones = [];
    const directions = [];

    inspections.forEach((ins) => {
      const loc = ins.device?.location || {};
      clusters.push(loc.cluster);
      buildings.push(loc.building);
      zones.push(loc.zone);
      directions.push(loc.direction);
    });

    return {
      clusters: cleanOptions(clusters),
      buildings: cleanOptions(buildings),
      zones: cleanOptions(zones),
      directions: cleanOptions(directions),
    };
  }, [inspections]);

  const filtered = useMemo(() => {
    const query = normalizeSearchText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return inspections.filter((ins) => {
      const loc = ins.device?.location || {};

      if (filters.status !== "ALL" && ins.inspectionStatus !== filters.status) {
        return false;
      }

      if (filters.cluster !== "ALL" && loc.cluster !== filters.cluster) {
        return false;
      }

      if (filters.building !== "ALL" && loc.building !== filters.building) {
        return false;
      }

      if (filters.zone !== "ALL" && loc.zone !== filters.zone) {
        return false;
      }

      if (filters.direction !== "ALL" && loc.direction !== filters.direction) {
        return false;
      }

      if (!queryWords.length) {
        return true;
      }

      const haystack = buildInspectionSearchText(ins);

      return queryWords.every((word) => haystack.includes(word));
    });
  }, [inspections, filters]);

  const filteredCounts = useMemo(() => {
    const c = { ALL: filtered.length };

    filtered.forEach((i) => {
      c[i.inspectionStatus] = (c[i.inspectionStatus] || 0) + 1;
    });

    return c;
  }, [filtered]);

  const tiles = [
    {
      key: "total",
      label: t("Total", "الإجمالي"),
      val: filteredCounts.ALL || 0,
      color: TILE_COLORS.total,
    },
    {
      key: "ok",
      label: t("OK", "سليم"),
      val: filteredCounts.OK || 0,
      color: TILE_COLORS.ok,
    },
    {
      key: "notOk",
      label: t("Not OK", "غير سليم"),
      val: filteredCounts.NOT_OK || 0,
      color: TILE_COLORS.notOk,
    },
    {
      key: "partial",
      label: t("Partial", "جزئي"),
      val: filteredCounts.PARTIAL || 0,
      color: TILE_COLORS.partial,
    },
    {
      key: "unreachable",
      label: t("Not Reachable", "غير متاح"),
      val: filteredCounts.NOT_REACHABLE || 0,
      color: TILE_COLORS.unreachable,
    },
  ];

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const locationParts = (ins) => ({
    cluster: ins.device?.location?.cluster || "",
    building: ins.device?.location?.building || "",
    zone: ins.device?.location?.zone || "",
    direction: ins.device?.location?.direction || "",
  });

  return (
    <>
      <style>{INSPECTIONS_CSS}</style>

      <div className="insp-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="insp-topbar">
          <div>
            <div className="insp-topbar__title">
              {t("Viewer Inspections", "فحوصات المشاهد")}
            </div>

            <div className="insp-topbar__sub">
              {t(
                "Read-only monitoring of all inspection records",
                "عرض فقط لكل سجلات الفحص"
              )}
            </div>
          </div>

          <div className="insp-actions">
            <button
              className="insp-refresh-btn"
              onClick={loadInspections}
              disabled={loading}
            >
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="insp-alert insp-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}

        {!!sourceUrl && !error && (
          <div className="insp-alert insp-alert--info">
            {t("Connected endpoint: ", "تم الاتصال مع: ")}
            <strong>{sourceUrl}</strong>
          </div>
        )}

        <div className="insp-filter-card">
          <div className="insp-filter-head">
            <div className="insp-filter-title">
              <div className="insp-filter-icon">⌕</div>

              <div>
                <div className="insp-filter-title-text">
                  {t("Smart Filters", "فلترة ذكية")}
                </div>
                <div className="insp-filter-title-sub">
                  {t(
                    "Filter inspections by status, location, or search text",
                    "فلتر الفحوصات بالحالة أو الموقع أو البحث"
                  )}
                </div>
              </div>
            </div>

            <div className="insp-filter-result">
              {filtered.length} / {inspections.length} {t("records", "سجل")}
            </div>
          </div>

          <div className="insp-filter-grid">
            <div className="insp-filter-field">
              <label>{t("Search", "بحث")}</label>
              <input
                className="insp-filter-input"
                value={draftFilters.search}
                onChange={(e) => updateDraft("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder={t(
                  "Code, name, serial, technician, building, zone...",
                  "الكود، الاسم، السيريال، الفني، المبنى، الزون..."
                )}
              />
            </div>

            <div className="insp-filter-field">
              <label>{t("Status", "الحالة")}</label>
              <select
                className="insp-filter-select"
                value={draftFilters.status}
                onChange={(e) => updateDraft("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select
                className="insp-filter-select"
                value={draftFilters.cluster}
                onChange={(e) => updateDraft("cluster", e.target.value)}
              >
                <option value="ALL">{t("All clusters", "كل المجموعات")}</option>
                {options.clusters.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>{t("Building", "المبنى")}</label>
              <select
                className="insp-filter-select"
                value={draftFilters.building}
                onChange={(e) => updateDraft("building", e.target.value)}
              >
                <option value="ALL">{t("All buildings", "كل المباني")}</option>
                {options.buildings.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select
                className="insp-filter-select"
                value={draftFilters.zone}
                onChange={(e) => updateDraft("zone", e.target.value)}
              >
                <option value="ALL">{t("All zones", "كل المناطق")}</option>
                {options.zones.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select
                className="insp-filter-select"
                value={draftFilters.direction}
                onChange={(e) => updateDraft("direction", e.target.value)}
              >
                <option value="ALL">{t("All directions", "كل الاتجاهات")}</option>
                {options.directions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="insp-filter-footer">
            <div className="insp-filter-hint">
              {t(
                "Tip: press Enter inside search to apply quickly.",
                "معلومة: اضغطي Enter داخل البحث للتطبيق بسرعة."
              )}
            </div>

            <div className="insp-filter-actions">
              <button
                type="button"
                className="insp-filter-btn insp-filter-btn-reset"
                onClick={resetFilters}
              >
                Reset
              </button>

              <button
                type="button"
                className="insp-filter-btn insp-filter-btn-ok"
                onClick={applyFilters}
              >
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="insp-summary">
          {tiles.map((tile) => (
            <div key={tile.key} className="insp-summary-tile">
              <div
                className="insp-summary-tile__bar"
                style={{ background: tile.color }}
              />

              <div
                className="insp-summary-tile__val"
                style={{ color: tile.color }}
              >
                {tile.val}
              </div>

              <div className="insp-summary-tile__label">{tile.label}</div>
            </div>
          ))}
        </div>

        <div className="insp-view-row">
          <div className="insp-view-toggle">
            <button
              className={`insp-view-btn${view === "table" ? " insp-view-btn--active" : ""}`}
              onClick={() => setView("table")}
            >
              {t("Table", "جدول")}
            </button>

            <button
              className={`insp-view-btn${view === "timeline" ? " insp-view-btn--active" : ""}`}
              onClick={() => setView("timeline")}
            >
              {t("Timeline", "تسلسل")}
            </button>
          </div>
        </div>

        <div className="insp-panel">
          <div className="insp-panel__head">
            <div>
              <div className="insp-panel__title">
                {t("Inspections Log", "سجل الفحوصات")}
              </div>

              <div className="insp-panel__sub">
                {t("All recorded inspections", "جميع الفحوصات المسجلة")}
              </div>
            </div>

            <div className="insp-records">
              {filtered.length} {t("records", "سجل")}
            </div>
          </div>

          {loading ? (
            <div className="insp-loading">
              <div className="insp-loading-spinner" />
              {t(
                "Loading inspections from backend...",
                "جارٍ تحميل الفحوصات من الباك إند..."
              )}
            </div>
          ) : view === "table" ? (
            filtered.length ? (
              <div className="insp-table-wrap">
                <table className="insp-table">
                  <thead>
                    <tr>
                      <th>{t("Device", "الجهاز")}</th>
                      <th>{t("Status", "الحالة")}</th>
                      <th>{t("Cluster", "المجموعة")}</th>
                      <th>{t("Building", "المبنى")}</th>
                      <th>{t("Zone", "المنطقة")}</th>
                      <th>{t("Direction", "الاتجاه")}</th>
                      <th>{t("Technician", "الفني")}</th>
                      <th>{t("Notes", "ملاحظات")}</th>
                      <th>{t("Date", "التاريخ")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((ins) => {
                      const loc = locationParts(ins);

                      return (
                        <tr key={ins.id || `${ins.deviceId}-${ins.createdAt}`}>
                          <td>
                            <div className="insp-dev-code">
                              {ins.device?.deviceCode || `#${ins.deviceId}`}
                            </div>

                            <div className="insp-dev-name">
                              {ins.device?.deviceName || t("Unknown", "غير معروف")}
                            </div>
                          </td>

                          <td>
                            <StatusBadge
                              value={ins.inspectionStatus}
                              lang={lang}
                            />
                          </td>

                          <td>
                            <div className="insp-locline">
                              {loc.cluster || "—"}
                            </div>
                          </td>

                          <td>
                            <div className="insp-locline">
                              {loc.building || "—"}
                            </div>
                          </td>

                          <td>
                            <div className="insp-locline">
                              {loc.zone || "—"}
                            </div>
                          </td>

                          <td>
                            <div className="insp-locline">
                              {loc.direction || "—"}
                            </div>
                          </td>

                          <td>
                            <div className="insp-tech-name">
                              {ins.technicianName || "—"}
                            </div>
                          </td>

                          <td className="insp-notes">
                            {ins.issueReason || ins.notes || "—"}
                          </td>

                          <td style={{ fontSize: 12, color: "var(--faint)" }}>
                            {fmt(ins.inspectedAt || ins.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="insp-empty">
                {t(
                  "No inspections match the selected filters.",
                  "لا توجد فحوصات مطابقة للفلاتر."
                )}
              </div>
            )
          ) : filtered.length ? (
            <div className="insp-timeline">
              {filtered.map((ins, idx) => {
                const loc = locationParts(ins);

                const locStr =
                  [
                    loc.cluster,
                    loc.building,
                    loc.zone,
                    loc.direction,
                  ]
                    .filter(Boolean)
                    .join(" · ") || t("Unknown", "غير معروف");

                return (
                  <div
                    className="insp-tl-item"
                    key={ins.id || `${ins.deviceId}-${ins.createdAt}`}
                  >
                    <div className="insp-tl-line">
                      <div
                        className="insp-tl-dot"
                        style={{
                          background:
                            DOT_COLORS[ins.inspectionStatus] || "#378ADD",
                        }}
                      />

                      {idx < filtered.length - 1 && (
                        <div className="insp-tl-connector" />
                      )}
                    </div>

                    <div className="insp-tl-body">
                      <div className="insp-tl-head">
                        <span className="insp-tl-dev">
                          {ins.device?.deviceCode || `#${ins.deviceId}`}
                        </span>

                        <StatusBadge
                          value={ins.inspectionStatus}
                          lang={lang}
                        />
                      </div>

                      <div className="insp-tl-loc">{locStr}</div>

                      <div className="insp-tl-meta">
                        <span className="insp-tl-time">
                          {fmt(ins.inspectedAt || ins.createdAt)}{" "}
                          {fmtTime(ins.inspectedAt || ins.createdAt)}
                        </span>

                        {ins.technicianName && (
                          <span className="insp-tl-tech">
                            {t("Technician:", "الفني:")} {ins.technicianName}
                          </span>
                        )}

                        {(ins.issueReason || ins.notes) && (
                          <span className="insp-tl-note">
                            {ins.issueReason || ins.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="insp-empty">
              {t("No inspections found.", "لا توجد فحوصات.")}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewerInspectionsPage;