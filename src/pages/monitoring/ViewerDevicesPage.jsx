import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const DEVICES_CSS = `
.dev-root *, .dev-root *::before, .dev-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.dev-root {
  --blue:    #378ADD;
  --green:   #1D9E75;
  --amber:   #BA7517;
  --red:     #C0392B;
  --purple:  #7F77DD;
  --slate:   #7B8A9A;
  --surface:  #ffffff;
  --surface2: #f7f8fa;
  --border:   rgba(0,0,0,0.07);
  --text:     #16181d;
  --muted:    #6b7585;
  --faint:    #9aa0ad;
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
  font-weight: 700;
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
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.dev-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* ── info / alerts ── */
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
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.dev-summary-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
}
.dev-summary-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
}
.dev-summary-note {
  margin-top: 6px;
  font-size: 11px;
  color: var(--faint);
}

/* ── Category pills ── */
.dev-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.dev-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  border: 0.5px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  transition: all .15s;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.dev-pill:hover { border-color: var(--blue); color: var(--text); }
.dev-pill--active {
  background: #EBF4FF;
  border-color: var(--blue);
  color: var(--blue);
}
.dev-pill-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dev-pill-count {
  font-size: 11px;
  opacity: 0.6;
}

/* ── Filter bar ── */
.dev-filters {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.dev-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.dev-field label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
}
.dev-field input,
.dev-field select {
  height: 38px;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 9px;
  background: var(--surface2);
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  outline: none;
  transition: border-color .15s;
}
.dev-field input:focus,
.dev-field select:focus { border-color: var(--blue); }
.dev-field input::placeholder { color: var(--faint); font-weight: 400; }
.dev-field--wide input { width: 260px; }
.dev-field select { padding-right: 28px; cursor: pointer; }

.dev-reset-btn {
  height: 38px;
  padding: 0 16px;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 9px;
  background: var(--surface2);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  margin-top: auto;
  transition: all .15s;
}
.dev-reset-btn:hover { background: #FDECEA; color: #C0392B; border-color: #FBCCC8; }

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
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.dev-panel__sub {
  font-size: 12px;
  color: var(--faint);
}
.dev-records {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
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
  font-weight: 700;
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
.dev-table tr:last-child td { border-bottom: none; }
.dev-table tr:hover td { background: #fafbfc; }

.dev-code {
  font-size: 13px;
  font-weight: 700;
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
  font-weight: 700;
  color: var(--text);
}

/* ── Badges ── */
.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: .2px;
}
.badge--ok    { background: #e6f7f1; color: #0f6e56; }
.badge--att   { background: #fff4e0; color: #854f0b; }
.badge--maint { background: #fdecea; color: #a32d2d; }
.badge--under { background: #EBF4FF; color: #1e5fa8; }
.badge--oos   { background: #f1f3f5; color: #6b7585; }

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
@media (max-width: 1100px) {
  .dev-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .dev-root { padding: 16px 14px; }
}
@media (max-width: 640px) {
  .dev-summary {
    grid-template-columns: 1fr;
  }
  .dev-field--wide input {
    width: 100%;
  }
}
`;

/* ═══════════════════════════════════════════
   STATUS MAPS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK:                { label: "Operational",   cls: "badge--ok"    },
  ATTENTION:         { label: "Attention",     cls: "badge--att"   },
  NEEDS_MAINTENANCE: { label: "Needs Maint.",  cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "Under Maint.",  cls: "badge--under" },
  OUT_OF_SERVICE:    { label: "Out of Service",cls: "badge--oos"   },
};

const BADGE_MAP_AR = {
  OK:                { label: "تعمل",          cls: "badge--ok"    },
  ATTENTION:         { label: "تحتاج متابعة",  cls: "badge--att"   },
  NEEDS_MAINTENANCE: { label: "تحتاج صيانة",   cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "تحت الصيانة",   cls: "badge--under" },
  OUT_OF_SERVICE:    { label: "خارج الخدمة",   cls: "badge--oos"   },
};

const CATEGORIES = [
  { key: "ALL",               en: "All Devices",       ar: "كل الأجهزة",       color: "#378ADD" },
  { key: "OK",                en: "Operational",       ar: "تعمل",             color: "#1D9E75" },
  { key: "ATTENTION",         en: "Needs Attention",   ar: "تحتاج متابعة",    color: "#BA7517" },
  { key: "NEEDS_MAINTENANCE", en: "Needs Maintenance", ar: "تحتاج صيانة",     color: "#C0392B" },
  { key: "UNDER_MAINTENANCE", en: "Under Maintenance", ar: "تحت الصيانة",     color: "#378ADD" },
  { key: "OUT_OF_SERVICE",    en: "Out of Service",    ar: "خارج الخدمة",     color: "#7B8A9A" },
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
  const fromLocal =
    localStorage.getItem("apiBaseUrl") ||
    localStorage.getItem("baseUrl") ||
    sessionStorage.getItem("apiBaseUrl") ||
    sessionStorage.getItem("baseUrl");

  const raw = fromProp || fromLocal || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

function mapStatus(rawStatus, inspectionsCount = 0) {
  const s = String(rawStatus || "").toUpperCase();

  if (s === "OK") return "OK";
  if (s === "NEEDS_MAINTENANCE") return "NEEDS_MAINTENANCE";
  if (s === "UNDER_MAINTENANCE") return "UNDER_MAINTENANCE";
  if (s === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";

  if (s === "NOT_OK" || s === "PARTIAL" || s === "NOT_REACHABLE") return "ATTENTION";
  if (s === "IN_PROGRESS") return "UNDER_MAINTENANCE";
  if (s === "OPEN") return "NEEDS_MAINTENANCE";
  if (s === "COMPLETED") return "OK";

  if (!s && inspectionsCount > 0) return "ATTENTION";
  return "OK";
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
  const [activeCat, setActiveCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState("ALL");
  const [building, setBuilding] = useState("ALL");
  const [zone, setZone] = useState("ALL");
  const [direction, setDirection] = useState("ALL");

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
      setError(
        err?.message ||
          "Failed to load devices from backend."
      );
      setDevices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const catCounts = useMemo(() => {
    const counts = { ALL: devices.length };
    devices.forEach((d) => {
      counts[d.currentStatus] = (counts[d.currentStatus] || 0) + 1;
    });

    if (!counts.ATTENTION) {
      counts.ATTENTION = 0;
    }

    return counts;
  }, [devices]);

  const clusters = useMemo(
    () => [...new Set(devices.map((d) => d.parsedLoc?.cluster).filter(Boolean))],
    [devices]
  );
  const buildings = useMemo(
    () => [...new Set(devices.map((d) => d.parsedLoc?.building).filter(Boolean))],
    [devices]
  );
  const zones = useMemo(
    () => [...new Set(devices.map((d) => d.parsedLoc?.zone).filter(Boolean))],
    [devices]
  );
  const directions = useMemo(
    () => [...new Set(devices.map((d) => d.parsedLoc?.direction).filter(Boolean))],
    [devices]
  );

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      if (activeCat !== "ALL" && d.currentStatus !== activeCat) return false;

      const s = search.trim().toLowerCase();
      const haystack = [
        d.deviceCode,
        d.deviceName,
        d.serialNumber,
        d.barcode,
        d.manufacturer,
        d.modelNumber,
        d.parsedLoc?.cluster,
        d.parsedLoc?.building,
        d.parsedLoc?.zone,
        d.parsedLoc?.direction,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (s && !haystack.includes(s)) return false;
      if (cluster !== "ALL" && d.parsedLoc?.cluster !== cluster) return false;
      if (building !== "ALL" && d.parsedLoc?.building !== building) return false;
      if (zone !== "ALL" && d.parsedLoc?.zone !== zone) return false;
      if (direction !== "ALL" && d.parsedLoc?.direction !== direction) return false;

      return true;
    });
  }, [devices, activeCat, search, cluster, building, zone, direction]);

  function resetFilters() {
    setSearch("");
    setCluster("ALL");
    setBuilding("ALL");
    setZone("ALL");
    setDirection("ALL");
    setActiveCat("ALL");
  }

  const totalInspections = devices.reduce(
    (sum, d) => sum + (Number(d.inspectionsCount) || 0),
    0
  );

  const latestInspection = devices
    .map((d) => d.lastInspectionAt)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0];

  return (
    <>
      <style>{DEVICES_CSS}</style>

      <div className="dev-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="dev-topbar">
          <div>
            <div className="dev-topbar__title">{t("Viewer Devices", "أجهزة المشاهد")}</div>
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
            <div className="dev-summary-label">{t("Total Devices", "إجمالي الأجهزة")}</div>
            <div className="dev-summary-value">{devices.length}</div>
            <div className="dev-summary-note">{t("All loaded records", "كل السجلات المحملة")}</div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">{t("Operational", "تعمل")}</div>
            <div className="dev-summary-value">{catCounts.OK || 0}</div>
            <div className="dev-summary-note">{t("Healthy devices", "الأجهزة السليمة")}</div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">{t("Need Maintenance", "تحتاج صيانة")}</div>
            <div className="dev-summary-value">
              {(catCounts.NEEDS_MAINTENANCE || 0) + (catCounts.ATTENTION || 0)}
            </div>
            <div className="dev-summary-note">{t("Attention / maintenance", "متابعة / صيانة")}</div>
          </div>

          <div className="dev-summary-card">
            <div className="dev-summary-label">{t("Inspections", "الفحوصات")}</div>
            <div className="dev-summary-value">{totalInspections}</div>
            <div className="dev-summary-note">
              {latestInspection
                ? `${t("Latest:", "آخر فحص:")} ${fmt(latestInspection)}`
                : t("No inspection date", "لا يوجد تاريخ فحص")}
            </div>
          </div>
        </div>

        <div className="dev-pills">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className={`dev-pill${activeCat === cat.key ? " dev-pill--active" : ""}`}
              onClick={() => setActiveCat(cat.key)}
            >
              <div className="dev-pill-dot" style={{ background: cat.color }} />
              {lang === "ar" ? cat.ar : cat.en}
              <span className="dev-pill-count">({catCounts[cat.key] || 0})</span>
            </div>
          ))}
        </div>

        <div className="dev-filters">
          <div className="dev-field dev-field--wide">
            <label>{t("Search", "بحث")}</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(
                "Code, name, serial, barcode, building or zone…",
                "كود، اسم، سيريال، باركود، مبنى أو منطقة…"
              )}
            />
          </div>

          {clusters.length > 0 && (
            <div className="dev-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
                <option value="ALL">{t("All Clusters", "كل المجموعات")}</option>
                {clusters.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          {buildings.length > 0 && (
            <div className="dev-field">
              <label>{t("Building", "المبنى")}</label>
              <select value={building} onChange={(e) => setBuilding(e.target.value)}>
                <option value="ALL">{t("All Buildings", "كل المباني")}</option>
                {buildings.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          {zones.length > 0 && (
            <div className="dev-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)}>
                <option value="ALL">{t("All Zones", "كل المناطق")}</option>
                {zones.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          {directions.length > 0 && (
            <div className="dev-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="ALL">{t("All Directions", "كل الاتجاهات")}</option>
                {directions.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <button className="dev-reset-btn" onClick={resetFilters}>
            {t("Reset filters", "مسح الفلاتر")}
          </button>
        </div>

        <div className="dev-panel">
          <div className="dev-panel__head">
            <div>
              <div className="dev-panel__title">{t("Devices", "الأجهزة")}</div>
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
                    <th>{t("Status", "الحالة")}</th>
                    <th>{t("Cluster", "المجموعة")}</th>
                    <th>{t("Building", "المبنى")}</th>
                    <th>{t("Zone", "المنطقة")}</th>
                    <th>{t("Direction", "الاتجاه")}</th>
                    <th>{t("Last Inspection", "آخر فحص")}</th>
                    <th>{t("Serial", "السيريال")}</th>
                    <th style={{ textAlign: "center" }}>{t("Inspections", "الفحوصات")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id}>
                      <td>
                        <div className="dev-code">{d.deviceCode || `DEV-${d.id}`}</div>
                        <div className="dev-name">{d.deviceName || t("Unknown", "غير معروف")}</div>
                        {(d.manufacturer || d.modelNumber) && (
                          <div className="dev-subline">
                            {[d.manufacturer, d.modelNumber].filter(Boolean).join(" · ")}
                          </div>
                        )}
                      </td>

                      <td>
                        <StatusBadge value={d.currentStatus} lang={lang} />
                      </td>

                      <td style={{ fontSize: 12 }}>{d.parsedLoc?.cluster || "—"}</td>
                      <td style={{ fontSize: 12 }}>{d.parsedLoc?.building || "—"}</td>
                      <td style={{ fontSize: 12 }}>{d.parsedLoc?.zone || "—"}</td>
                      <td style={{ fontSize: 12 }}>{d.parsedLoc?.direction || "—"}</td>

                      <td style={{ fontSize: 12, color: "var(--faint)" }}>
                        {fmt(d.lastInspectionAt)}
                      </td>

                      <td style={{ fontSize: 12 }}>
                        {d.serialNumber || "—"}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        <span className="dev-insp-count">{d.inspectionsCount ?? 0}</span>
                      </td>
                    </tr>
                  ))}
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