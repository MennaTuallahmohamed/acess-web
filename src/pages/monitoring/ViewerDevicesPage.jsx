import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const DEVICES_CSS = `
.dev-root *, .dev-root *::before, .dev-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.dev-root {
  --blue: #378ADD;
  --green: #1D9E75;
  --amber: #BA7517;
  --red: #C0392B;
  --purple: #7F77DD;
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

/* ── top actions ── */
.dev-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.dev-topbar__title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}

.dev-topbar__sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}

.dev-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.dev-refresh-btn {
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

.dev-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* ── alerts ── */
.dev-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.dev-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.dev-alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* ── summary cards ── */
.dev-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.dev-summary-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
}

.dev-summary-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, #378ADD, #7F77DD);
}

.dev-summary-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 700;
}

.dev-summary-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text);
}

.dev-summary-note {
  margin-top: 6px;
  font-size: 11px;
  color: var(--faint);
}

/* ═══════════════════════════════════════════
   Cute Filter
═══════════════════════════════════════════ */
.dev-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(55,138,221,0.16), transparent 34%),
    radial-gradient(circle at bottom right, rgba(127,119,221,0.10), transparent 32%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.dev-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.dev-filter-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.dev-filter-icon {
  width: 38px;
  height: 38px;
  border-radius: 15px;
  background: #ebf4ff;
  color: #378add;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(55,138,221,0.12);
}

.dev-filter-title-text {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
}

.dev-filter-title-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.dev-filter-result {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ebf4ff;
  color: #1d4ed8;
  border: 1px solid rgba(55,138,221,0.16);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.dev-filter-result-dot {
  width: 7px;
  height: 7px;
  background: #378add;
  border-radius: 50%;
}

.dev-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(6, minmax(130px, 1fr));
  gap: 12px;
  align-items: end;
}

.dev-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.dev-filter-field label {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: #475569;
  white-space: nowrap;
}

.dev-filter-input,
.dev-filter-select {
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

.dev-filter-input {
  font-weight: 600;
}

.dev-filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.dev-filter-input:hover,
.dev-filter-select:hover {
  background-color: #ffffff;
  border-color: #b7c6d8;
}

.dev-filter-input:focus,
.dev-filter-select:focus {
  border-color: #378add;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(55, 138, 221, 0.13);
}

.dev-filter-select {
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

.dev-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.dev-filter-hint {
  font-size: 12px;
  color: #94a3b8;
}

.dev-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dev-filter-btn {
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

.dev-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.dev-filter-btn-ok {
  background: #0f172a;
  color: #ffffff;
  min-width: 78px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

.dev-filter-btn:hover {
  transform: translateY(-1px);
}

.dev-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.dev-filter-btn-ok:hover {
  background: #378add;
  box-shadow: 0 10px 20px rgba(55, 138, 221, 0.24);
}

.dev-filter-btn:active {
  transform: translateY(0);
}

/* ── Panel ── */
.dev-panel {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.dev-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 0.5px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.dev-panel__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}

.dev-panel__sub {
  font-size: 12px;
  color: var(--faint);
}

.dev-records {
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
}

/* ── Table ── */
.dev-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.dev-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1100px;
}

.dev-table th {
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

.dev-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.dev-table tr:last-child td {
  border-bottom: none;
}

.dev-table tr:hover td {
  background: #fafbfc;
}

.dev-code {
  font-size: 13px;
  font-weight: 800;
  color: var(--blue);
  letter-spacing: .3px;
}

.dev-name {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.dev-subline {
  font-size: 11px;
  color: var(--faint);
  margin-top: 2px;
}

.dev-insp-count {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}

/* ── Badges ── */
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

.badge--under {
  background: #EBF4FF;
  color: #1e5fa8;
}

.badge--oos {
  background: #f1f3f5;
  color: #6b7585;
}

/* ── Empty / loading ── */
.dev-empty,
.dev-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.dev-loading-spinner {
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

/* ── Responsive ── */
@media (max-width: 1600px) {
  .dev-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(150px, 1fr));
  }
}

@media (max-width: 1100px) {
  .dev-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .dev-root {
    padding: 16px 14px;
  }

  .dev-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dev-filter-actions {
    width: 100%;
  }

  .dev-filter-btn {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .dev-summary {
    grid-template-columns: 1fr;
  }

  .dev-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .dev-filter-grid {
    grid-template-columns: 1fr;
  }

  .dev-filter-footer {
    align-items: stretch;
  }

  .dev-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .dev-filter-btn {
    width: 100%;
  }
}
`;

/* ═══════════════════════════════════════════
   STATUS MAPS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK: { label: "Operational", cls: "badge--ok" },
  ATTENTION: { label: "Attention", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "Needs Maint.", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "Under Maint.", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "Out of Service", cls: "badge--oos" },
};

const BADGE_MAP_AR = {
  OK: { label: "تعمل", cls: "badge--ok" },
  ATTENTION: { label: "تحتاج متابعة", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "تحتاج صيانة", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "تحت الصيانة", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "خارج الخدمة", cls: "badge--oos" },
};

const STATUS_OPTIONS = [
  { key: "ALL", en: "All statuses", ar: "كل الحالات" },
  { key: "OK", en: "Operational", ar: "تعمل" },
  { key: "ATTENTION", en: "Needs attention", ar: "تحتاج متابعة" },
  { key: "NEEDS_MAINTENANCE", en: "Needs maintenance", ar: "تحتاج صيانة" },
  { key: "UNDER_MAINTENANCE", en: "Under maintenance", ar: "تحت الصيانة" },
  { key: "OUT_OF_SERVICE", en: "Out of service", ar: "خارج الخدمة" },
];

const RESULT_OPTIONS = [
  { key: "ALL", en: "All results", ar: "كل النتائج" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "NOT_OK", en: "Not OK", ar: "غير سليم" },
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

function normalizeText(value) {
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

function mapStatus(rawStatus, inspectionsCount = 0) {
  const s = String(rawStatus || "").toUpperCase();

  if (s === "OK") return "OK";
  if (s === "NEEDS_MAINTENANCE") return "NEEDS_MAINTENANCE";
  if (s === "UNDER_MAINTENANCE") return "UNDER_MAINTENANCE";
  if (s === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";

  if (s === "NOT_OK" || s === "PARTIAL" || s === "NOT_REACHABLE") {
    return "ATTENTION";
  }

  if (s === "IN_PROGRESS") return "UNDER_MAINTENANCE";
  if (s === "OPEN") return "NEEDS_MAINTENANCE";
  if (s === "COMPLETED") return "OK";

  if (!s && inspectionsCount > 0) return "ATTENTION";

  return "OK";
}

function getDeviceResult(device) {
  return device.currentStatus === "OK" ? "OK" : "NOT_OK";
}

function cleanOptions(list) {
  return [...new Set(list.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ar"));
}

function normalizeDevice(item) {
  const location =
    item.location ||
    item.parsedLoc ||
    item.locationData ||
    {};

  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];

  const inspectionsCount =
    item.inspectionsCount ??
    item._count?.inspections ??
    item.inspections_count ??
    inspectionsArray.length ??
    0;

  const rawStatus =
    item.currentStatus ||
    item.status ||
    item.deviceStatus ||
    item.inspectionStatus ||
    item.lastInspectionStatus ||
    "";

  return {
    id: item.id,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    serialNumber: item.serialNumber || item.serial || "",
    barcode: item.barcode || "",
    currentStatus: mapStatus(rawStatus, inspectionsCount),
    manufacturer: item.manufacturer || "",
    modelNumber: item.modelNumber || "",
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      item.lastInspection ||
      inspectionsArray[0]?.inspectedAt ||
      null,
    inspectionsCount,
    parsedLoc: {
      cluster: location.cluster || item.cluster || "",
      building: location.building || item.building || "",
      zone: location.zone || item.zone || "",
      direction: location.direction || item.direction || "",
      lane: location.lane || item.lane || "",
      type: location.type || item.type || "",
    },
  };
}

function buildDeviceSearchText(device) {
  return normalizeText(
    [
      device.id,
      device.deviceCode,
      device.deviceName,
      device.serialNumber,
      device.barcode,
      device.manufacturer,
      device.modelNumber,
      device.currentStatus,
      getDeviceResult(device),
      device.parsedLoc?.cluster,
      device.parsedLoc?.building,
      device.parsedLoc?.zone,
      device.parsedLoc?.direction,
      device.parsedLoc?.lane,
      device.parsedLoc?.type,
      fmt(device.lastInspectionAt),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function fetchDevicesFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/devices`,
    `${baseUrl}/api/devices`,
    `${baseUrl}/viewer/devices`,
    `${baseUrl}/dashboard/devices`,
    `${baseUrl}/dashboard/viewer/devices`,
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
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.devices) ? data.devices :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.results) ? data.results :
        [];

      return {
        sourceUrl: url,
        items: rawList.map(normalizeDevice),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working devices endpoint found.");
}

function StatusBadge({ value, lang }) {
  const map = lang === "ar" ? BADGE_MAP_AR : BADGE_MAP;
  const badge = map[value] || { label: value || "Unknown", cls: "badge--oos" };

  return <span className={`badge ${badge.cls}`}>{badge.label}</span>;
}

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export function ViewerDevicesPage({
  devices: devicesProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const DEFAULT_FILTERS = {
    search: "",
    result: "ALL",
    status: "ALL",
    cluster: "ALL",
    building: "ALL",
    zone: "ALL",
    direction: "ALL",
  };

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [devices, setDevices] = useState(
    Array.isArray(devicesProp) ? devicesProp.map(normalizeDevice) : []
  );

  const [loading, setLoading] = useState(!Array.isArray(devicesProp));
  const [error, setError] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadDevices() {
    if (Array.isArray(devicesProp)) {
      setDevices(devicesProp.map(normalizeDevice));
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const result = await fetchDevicesFromApi(baseUrl, token);

      setDevices(result.items);
      setSourceUrl(result.sourceUrl);
    } catch (err) {
      console.error("Failed to load devices:", err);
      setError(err?.message || "Failed to load devices from backend.");
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const options = useMemo(() => {
    const clusters = [];
    const buildings = [];
    const zones = [];
    const directions = [];

    devices.forEach((d) => {
      clusters.push(d.parsedLoc?.cluster);
      buildings.push(d.parsedLoc?.building);
      zones.push(d.parsedLoc?.zone);
      directions.push(d.parsedLoc?.direction);
    });

    return {
      clusters: cleanOptions(clusters),
      buildings: cleanOptions(buildings),
      zones: cleanOptions(zones),
      directions: cleanOptions(directions),
    };
  }, [devices]);

  const filtered = useMemo(() => {
    const query = normalizeText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return devices.filter((d) => {
      const deviceResult = getDeviceResult(d);

      if (filters.result !== "ALL" && deviceResult !== filters.result) {
        return false;
      }

      if (filters.status !== "ALL" && d.currentStatus !== filters.status) {
        return false;
      }

      if (filters.cluster !== "ALL" && d.parsedLoc?.cluster !== filters.cluster) {
        return false;
      }

      if (filters.building !== "ALL" && d.parsedLoc?.building !== filters.building) {
        return false;
      }

      if (filters.zone !== "ALL" && d.parsedLoc?.zone !== filters.zone) {
        return false;
      }

      if (filters.direction !== "ALL" && d.parsedLoc?.direction !== filters.direction) {
        return false;
      }

      if (!queryWords.length) {
        return true;
      }

      const haystack = buildDeviceSearchText(d);

      return queryWords.every((word) => haystack.includes(word));
    });
  }, [devices, filters]);

  const counts = useMemo(() => {
    const all = devices.length;
    const ok = devices.filter((d) => getDeviceResult(d) === "OK").length;
    const notOk = devices.filter((d) => getDeviceResult(d) === "NOT_OK").length;

    const filteredOk = filtered.filter((d) => getDeviceResult(d) === "OK").length;
    const filteredNotOk = filtered.filter((d) => getDeviceResult(d) === "NOT_OK").length;

    return {
      all,
      ok,
      notOk,
      filtered: filtered.length,
      filteredOk,
      filteredNotOk,
    };
  }, [devices, filtered]);

  const statusCounts = useMemo(() => {
    const c = {};
    devices.forEach((d) => {
      c[d.currentStatus] = (c[d.currentStatus] || 0) + 1;
    });
    return c;
  }, [devices]);

  const totalInspections = devices.reduce(
    (sum, d) => sum + (Number(d.inspectionsCount) || 0),
    0
  );

  const latestInspection = devices
    .map((d) => d.lastInspectionAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

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

  return (
    <>
      <style>{DEVICES_CSS}</style>

      <div className="dev-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="dev-topbar">
          <div>
            <div className="dev-topbar__title">
              {t("Viewer Devices", "أجهزة المشاهد")}
            </div>

            <div className="dev-topbar__sub">
              {t(
                "Read-only monitoring of all registered devices",
                "عرض فقط لجميع الأجهزة المسجلة"
              )}
            </div>
          </div>

          <div className="dev-actions">
            <button
              className="dev-refresh-btn"
              onClick={loadDevices}
              disabled={loading}
            >
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="dev-alert dev-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}

        {!!sourceUrl && !error && (
          <div className="dev-alert dev-alert--info">
            {t("Connected endpoint: ", "تم الاتصال مع: ")}
            <strong>{sourceUrl}</strong>
          </div>
        )}

        <div className="dev-summary">
          <div className="dev-summary-card">
            <div className="dev-summary-label">
              {t("Total Devices", "إجمالي الأجهزة")}
            </div>
            <div className="dev-summary-value">{devices.length}</div>
            <div className="dev-summary-note">
              {t("All loaded records", "كل السجلات المحملة")}
            </div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">OK</div>
            <div className="dev-summary-value">{counts.ok}</div>
            <div className="dev-summary-note">
              {t("Operational devices", "الأجهزة السليمة")}
            </div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">Not OK</div>
            <div className="dev-summary-value">{counts.notOk}</div>
            <div className="dev-summary-note">
              {t("Needs attention or maintenance", "تحتاج متابعة أو صيانة")}
            </div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">
              {t("Inspections", "الفحوصات")}
            </div>
            <div className="dev-summary-value">{totalInspections}</div>
            <div className="dev-summary-note">
              {latestInspection
                ? `${t("Latest:", "آخر فحص:")} ${fmt(latestInspection)}`
                : t("No inspection date", "لا يوجد تاريخ فحص")}
            </div>
          </div>
        </div>

        <div className="dev-filter-card">
          <div className="dev-filter-head">
            <div className="dev-filter-title">
              <div className="dev-filter-icon">⌕</div>

              <div>
                <div className="dev-filter-title-text">
                  {t("Cute Smart Filter", "فلتر ذكي لطيف")}
                </div>
                <div className="dev-filter-title-sub">
                  {t(
                    "Search devices by result, status, location, or text",
                    "فلتر الأجهزة حسب OK / Not OK أو الحالة أو الموقع أو البحث"
                  )}
                </div>
              </div>
            </div>

            <div className="dev-filter-result">
              <span className="dev-filter-result-dot" />
              {filtered.length} / {devices.length} {t("records", "سجل")}
            </div>
          </div>

          <div className="dev-filter-grid">
            <div className="dev-filter-field">
              <label>{t("Search", "بحث")}</label>
              <input
                className="dev-filter-input"
                value={draftFilters.search}
                onChange={(e) => updateDraft("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder={t(
                  "Code, name, serial, barcode, building...",
                  "كود، اسم، سيريال، باركود، مبنى..."
                )}
              />
            </div>

            <div className="dev-filter-field">
              <label>{t("Result", "النتيجة")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.result}
                onChange={(e) => updateDraft("result", e.target.value)}
              >
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Status", "الحالة")}</label>
              <select
                className="dev-filter-select"
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

            <div className="dev-filter-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select
                className="dev-filter-select"
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

            <div className="dev-filter-field">
              <label>{t("Building", "المبنى")}</label>
              <select
                className="dev-filter-select"
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

            <div className="dev-filter-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select
                className="dev-filter-select"
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

            <div className="dev-filter-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select
                className="dev-filter-select"
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

          <div className="dev-filter-footer">
            <div className="dev-filter-hint">
              {t(
                `Filtered OK: ${counts.filteredOk} · Not OK: ${counts.filteredNotOk}`,
                `المفلتر سليم: ${counts.filteredOk} · غير سليم: ${counts.filteredNotOk}`
              )}
            </div>

            <div className="dev-filter-actions">
              <button
                type="button"
                className="dev-filter-btn dev-filter-btn-reset"
                onClick={resetFilters}
              >
                Reset
              </button>

              <button
                type="button"
                className="dev-filter-btn dev-filter-btn-ok"
                onClick={applyFilters}
              >
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="dev-panel">
          <div className="dev-panel__head">
            <div>
              <div className="dev-panel__title">
                {t("Devices", "الأجهزة")}
              </div>

              <div className="dev-panel__sub">
                {t(
                  "All registered devices in current scope",
                  "جميع الأجهزة المسجلة في النطاق الحالي"
                )}
              </div>
            </div>

            <div className="dev-records">
              {filtered.length} {t("records", "سجل")}
            </div>
          </div>

          {loading ? (
            <div className="dev-loading">
              <div className="dev-loading-spinner" />
              {t("Loading devices from backend...", "جارٍ تحميل الأجهزة من الباك إند...")}
            </div>
          ) : filtered.length ? (
            <div className="dev-table-wrap">
              <table className="dev-table">
                <thead>
                  <tr>
                    <th>{t("Device", "الجهاز")}</th>
                    <th>{t("Result", "النتيجة")}</th>
                    <th>{t("Status", "الحالة")}</th>
                    <th>{t("Cluster", "المجموعة")}</th>
                    <th>{t("Building", "المبنى")}</th>
                    <th>{t("Zone", "المنطقة")}</th>
                    <th>{t("Direction", "الاتجاه")}</th>
                    <th>{t("Last Inspection", "آخر فحص")}</th>
                    <th>{t("Serial", "السيريال")}</th>
                    <th style={{ textAlign: "center" }}>
                      {t("Inspections", "الفحوصات")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((d) => {
                    const result = getDeviceResult(d);

                    return (
                      <tr key={d.id}>
                        <td>
                          <div className="dev-code">
                            {d.deviceCode || `DEV-${d.id}`}
                          </div>

                          <div className="dev-name">
                            {d.deviceName || t("Unknown", "غير معروف")}
                          </div>

                          {(d.manufacturer || d.modelNumber) && (
                            <div className="dev-subline">
                              {[d.manufacturer, d.modelNumber].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </td>

                        <td>
                          {result === "OK" ? (
                            <span className="badge badge--ok">OK</span>
                          ) : (
                            <span className="badge badge--maint">Not OK</span>
                          )}
                        </td>

                        <td>
                          <StatusBadge value={d.currentStatus} lang={lang} />
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {d.parsedLoc?.cluster || "—"}
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {d.parsedLoc?.building || "—"}
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {d.parsedLoc?.zone || "—"}
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {d.parsedLoc?.direction || "—"}
                        </td>

                        <td style={{ fontSize: 12, color: "var(--faint)" }}>
                          {fmt(d.lastInspectionAt)}
                        </td>

                        <td style={{ fontSize: 12 }}>
                          {d.serialNumber || "—"}
                        </td>

                        <td style={{ textAlign: "center" }}>
                          <span className="dev-insp-count">
                            {d.inspectionsCount ?? 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dev-empty">
              {t(
                "No devices match the selected filters or no data came from backend.",
                "لا توجد أجهزة مطابقة للفلاتر أو لم تصل بيانات من الباك إند."
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ViewerDevicesPage;