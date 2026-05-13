import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const LOCATIONS_CSS = `
.loc-root *, .loc-root *::before, .loc-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.loc-root {
  --blue:    #378ADD;
  --green:   #1D9E75;
  --amber:   #BA7517;
  --red:     #C0392B;
  --purple:  #7F77DD;
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

/* top bar */
.loc-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.loc-topbar__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}
.loc-topbar__sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}
.loc-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.loc-refresh-btn {
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
.loc-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* alerts */
.loc-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}
.loc-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}
.loc-alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* ── Summary strip ── */
.loc-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.loc-summary-tile {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 16px 16px 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.loc-summary-tile__bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.loc-summary-tile__val {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
  margin-top: 3px;
  letter-spacing: -0.02em;
}
.loc-summary-tile__label {
  font-size: 11px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 600;
}

/* ── Filter bar ── */
.loc-filters {
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
.loc-field { display: flex; flex-direction: column; gap: 5px; }
.loc-field label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
}
.loc-field input,
.loc-field select {
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
.loc-field input:focus,
.loc-field select:focus { border-color: var(--blue); }
.loc-field input::placeholder { color: var(--faint); font-weight: 400; }
.loc-field--wide input { width: 220px; }

.loc-reset-btn {
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
.loc-reset-btn:hover { background: #FDECEA; color: #C0392B; border-color: #FBCCC8; }

/* ── View row ── */
.loc-view-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 12px;
  flex-wrap: wrap;
}
.loc-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
}
.loc-view-toggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 10px;
}
.loc-view-btn {
  padding: 5px 14px;
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
}
.loc-view-btn--active {
  background: var(--surface2);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* ── Cards grid ── */
.loc-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.loc-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  cursor: pointer;
  transition: box-shadow .15s, transform .1s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.loc-card__top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.loc-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.08); transform: translateY(-1px); }

.loc-card__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 14px;
  margin-top: 4px;
}
.loc-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 3px;
}
.loc-card__hint { font-size: 11px; color: var(--faint); }

.loc-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding-top: 14px;
  border-top: 0.5px solid var(--border);
}
.loc-stat strong {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
}
.loc-stat span {
  font-size: 10px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 600;
}

.loc-card__bar-wrap {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 0.5px solid var(--border);
}
.loc-card__bar-label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--faint);
  margin-bottom: 6px;
}
.loc-bar-track {
  height: 5px;
  background: var(--surface2);
  border-radius: 999px;
  overflow: hidden;
}
.loc-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width .6s;
}

/* ── List table ── */
.loc-list-wrap {
  width: 100%;
  overflow-x: auto;
}
.loc-list-table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
  font-size: 13px;
  background: var(--surface);
  border-radius: 14px;
  overflow: hidden;
  border: 0.5px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.loc-list-table th {
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
.loc-list-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}
.loc-list-table tr:last-child td { border-bottom: none; }
.loc-list-table tr:hover td { background: #fafbfc; cursor: pointer; }
.loc-list-name { font-size: 13px; font-weight: 700; color: var(--text); }
.loc-list-hint { font-size: 11px; color: var(--faint); margin-top: 2px; }
.loc-list-count { font-size: 15px; font-weight: 700; color: var(--text); }

/* ── Detail panel ── */
.loc-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.25);
  z-index: 100;
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
}
.loc-detail-panel {
  width: 360px;
  max-width: 100%;
  background: var(--surface);
  border-left: 0.5px solid var(--border);
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: -8px 0 32px rgba(0,0,0,0.08);
}
.loc-detail-close {
  align-self: flex-end;
  padding: 5px 14px;
  border: 0.5px solid var(--border);
  border-radius: 8px;
  background: var(--surface2);
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all .15s;
}
.loc-detail-close:hover { background: #FDECEA; color: #C0392B; }
.loc-detail-name { font-size: 18px; font-weight: 700; color: var(--text); }
.loc-detail-sub { font-size: 12px; color: var(--faint); margin-top: 3px; }
.loc-detail-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.loc-detail-kpi {
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 10px;
  padding: 14px;
}
.loc-detail-kpi strong {
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.01em;
  margin-bottom: 4px;
}
.loc-detail-kpi span {
  font-size: 10px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 600;
}

/* badges */
.badge {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: .2px;
}
.badge--ok    { background: #e6f7f1; color: #0f6e56; }
.badge--att   { background: #fff4e0; color: #854f0b; }
.badge--maint { background: #fdecea; color: #a32d2d; }
.badge--under { background: #EBF4FF; color: #1e5fa8; }
.badge--oos   { background: #f1f3f5; color: #6b7585; }

.loc-empty,
.loc-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}
.loc-loading-spinner {
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

@media (max-width: 900px) {
  .loc-summary { grid-template-columns: repeat(2, 1fr); }
  .loc-root { padding: 16px 14px; }
}
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmtShort(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
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

function mapDeviceStatus(status) {
  const s = String(status || "").toUpperCase();
  if (["OK", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "ATTENTION"].includes(s)) {
    return s;
  }
  return "OK";
}

function mapInspectionToAttention(inspectionStatus) {
  const s = String(inspectionStatus || "").toUpperCase();
  return ["NOT_OK", "PARTIAL", "NOT_REACHABLE"].includes(s);
}

function normalizeDevice(item) {
  const location = item.location || {};
  return {
    id: item.id,
    currentStatus: mapDeviceStatus(item.currentStatus || item.status),
    lastInspectionAt: item.lastInspectionAt || null,
    location: {
      cluster: location.cluster || item.cluster || "",
      building: location.building || item.building || "",
      zone: location.zone || item.zone || "",
      direction: location.direction || item.direction || "",
    },
  };
}

function normalizeInspection(item) {
  const device = item.device || {};
  const location = device.location || item.location || {};
  return {
    id: item.id,
    inspectionStatus: String(item.inspectionStatus || "").toUpperCase() || "NOT_REACHABLE",
    inspectedAt: item.inspectedAt || item.createdAt || null,
    device: {
      location: {
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
      },
    },
  };
}

function buildLocationRows(devices, inspections) {
  const map = new Map();

  function ensureRow(location) {
    const key = [
      location?.cluster || "",
      location?.building || "",
      location?.zone || "",
      location?.direction || "",
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        id: key || `loc-${map.size + 1}`,
        cluster: location?.cluster || "",
        building: location?.building || "",
        zone: location?.zone || "",
        direction: location?.direction || "",
        devicesCount: 0,
        inspectionsCount: 0,
        needsAttentionCount: 0,
        latestInspectionAt: null,
      });
    }

    return map.get(key);
  }

  devices.forEach((d) => {
    const row = ensureRow(d.location);
    row.devicesCount += 1;

    if (["ATTENTION", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(d.currentStatus)) {
      row.needsAttentionCount += 1;
    }

    if (d.lastInspectionAt) {
      if (!row.latestInspectionAt || new Date(d.lastInspectionAt) > new Date(row.latestInspectionAt)) {
        row.latestInspectionAt = d.lastInspectionAt;
      }
    }
  });

  inspections.forEach((ins) => {
    const row = ensureRow(ins.device?.location);
    row.inspectionsCount += 1;

    if (mapInspectionToAttention(ins.inspectionStatus)) {
      row.needsAttentionCount += 1;
    }

    if (ins.inspectedAt) {
      if (!row.latestInspectionAt || new Date(ins.inspectedAt) > new Date(row.latestInspectionAt)) {
        row.latestInspectionAt = ins.inspectedAt;
      }
    }
  });

  return Array.from(map.values());
}

async function fetchJsonCandidates(candidates, token) {
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
      return { url, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found.");
}

function StatusBadge({ value, lang }) {
  const MAP_EN = {
    OK:                { label: "Operational",    cls: "badge--ok" },
    NEEDS_MAINTENANCE: { label: "Needs Maint.",   cls: "badge--maint" },
    ATTENTION:         { label: "Attention",      cls: "badge--att" },
    UNDER_MAINTENANCE: { label: "Under Maint.",   cls: "badge--under" },
    OUT_OF_SERVICE:    { label: "Out of Service", cls: "badge--oos" },
  };

  const MAP_AR = {
    OK:                { label: "تعمل",          cls: "badge--ok" },
    NEEDS_MAINTENANCE: { label: "تحتاج صيانة",   cls: "badge--maint" },
    ATTENTION:         { label: "تحتاج متابعة",  cls: "badge--att" },
    UNDER_MAINTENANCE: { label: "تحت الصيانة",   cls: "badge--under" },
    OUT_OF_SERVICE:    { label: "خارج الخدمة",   cls: "badge--oos" },
  };

  const MAP = lang === "ar" ? MAP_AR : MAP_EN;
  const b = MAP[value] || { label: value || "Unknown", cls: "badge--oos" };
  return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export function ViewerLocationsPage({
  locationRows: locationRowsProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState("ALL");
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);

  const [locationRows, setLocationRows] = useState(Array.isArray(locationRowsProp) ? locationRowsProp : []);
  const [loading, setLoading] = useState(!Array.isArray(locationRowsProp));
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState([]);

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadLocations() {
    if (Array.isArray(locationRowsProp)) {
      setLocationRows(locationRowsProp);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const sources = [];

      let rawLocations = [];
      try {
        const locationsRes = await fetchJsonCandidates(
          [
            `${baseUrl}/locations`,
            `${baseUrl}/api/locations`,
            `${baseUrl}/viewer/locations`,
            `${baseUrl}/dashboard/locations`,
            `${baseUrl}/dashboard/viewer/locations`,
          ],
          token
        );

        rawLocations =
          Array.isArray(locationsRes.data) ? locationsRes.data :
          Array.isArray(locationsRes.data?.data) ? locationsRes.data.data :
          Array.isArray(locationsRes.data?.locations) ? locationsRes.data.locations :
          Array.isArray(locationsRes.data?.items) ? locationsRes.data.items :
          [];

        sources.push(locationsRes.url);
      } catch {
        rawLocations = [];
      }

      const devicesRes = await fetchJsonCandidates(
        [
          `${baseUrl}/devices`,
          `${baseUrl}/api/devices`,
          `${baseUrl}/viewer/devices`,
          `${baseUrl}/dashboard/devices`,
          `${baseUrl}/dashboard/viewer/devices`,
        ],
        token
      );

      const rawDevices =
        Array.isArray(devicesRes.data) ? devicesRes.data :
        Array.isArray(devicesRes.data?.data) ? devicesRes.data.data :
        Array.isArray(devicesRes.data?.devices) ? devicesRes.data.devices :
        Array.isArray(devicesRes.data?.items) ? devicesRes.data.items :
        [];

      sources.push(devicesRes.url);

      const inspectionsRes = await fetchJsonCandidates(
        [
          `${baseUrl}/inspections`,
          `${baseUrl}/api/inspections`,
          `${baseUrl}/viewer/inspections`,
          `${baseUrl}/dashboard/inspections`,
          `${baseUrl}/dashboard/viewer/inspections`,
        ],
        token
      );

      const rawInspections =
        Array.isArray(inspectionsRes.data) ? inspectionsRes.data :
        Array.isArray(inspectionsRes.data?.data) ? inspectionsRes.data.data :
        Array.isArray(inspectionsRes.data?.inspections) ? inspectionsRes.data.inspections :
        Array.isArray(inspectionsRes.data?.items) ? inspectionsRes.data.items :
        [];

      sources.push(inspectionsRes.url);

      const devices = rawDevices.map(normalizeDevice);
      const inspections = rawInspections.map(normalizeInspection);

      let rows = buildLocationRows(devices, inspections);

      if (rawLocations.length) {
        rows = rawLocations.map((loc) => {
          const matched = rows.find((r) =>
            (r.cluster || "") === (loc.cluster || "") &&
            (r.building || "") === (loc.building || "") &&
            (r.zone || "") === (loc.zone || "") &&
            (r.direction || "") === (loc.direction || "")
          );

          return {
            id: loc.id ?? matched?.id ?? `loc-${Math.random().toString(36).slice(2, 8)}`,
            cluster: loc.cluster || matched?.cluster || "",
            building: loc.building || matched?.building || "",
            zone: loc.zone || matched?.zone || "",
            direction: loc.direction || matched?.direction || "",
            devicesCount: matched?.devicesCount || 0,
            inspectionsCount: matched?.inspectionsCount || 0,
            needsAttentionCount: matched?.needsAttentionCount || 0,
            latestInspectionAt: matched?.latestInspectionAt || null,
          };
        });
      }

      setLocationRows(rows);
      setSourceInfo(sources);
    } catch (err) {
      console.error("Failed to load locations:", err);
      setError(err?.message || "Failed to load locations from backend.");
      setLocationRows([]);
      setSourceInfo([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const clusters = useMemo(
    () => [...new Set(locationRows.map((l) => l.cluster).filter(Boolean))],
    [locationRows]
  );

  const filtered = useMemo(() => {
    return locationRows.filter((loc) => {
      const s = search.trim().toLowerCase();

      if (s) {
        const haystack = [
          loc.building,
          loc.cluster,
          loc.zone,
          loc.direction,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(s)) return false;
      }

      if (cluster !== "ALL" && loc.cluster !== cluster) return false;
      return true;
    });
  }, [locationRows, search, cluster]);

  const totalDevices = locationRows.reduce((s, l) => s + (l.devicesCount || 0), 0);
  const totalInspections = locationRows.reduce((s, l) => s + (l.inspectionsCount || 0), 0);
  const needsAttention = locationRows.filter((l) => (l.needsAttentionCount || 0) > 0).length;

  const tiles = [
    { label: t("Locations", "المواقع"), val: locationRows.length, color: "#378ADD" },
    { label: t("Total Devices", "إجمالي الأجهزة"), val: totalDevices, color: "#0891B2" },
    { label: t("Inspections", "الفحوصات"), val: totalInspections, color: "#1D9E75" },
    { label: t("Need Attention", "تحتاج متابعة"), val: needsAttention, color: "#BA7517" },
  ];

  return (
    <>
      <style>{LOCATIONS_CSS}</style>

      <div className="loc-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="loc-topbar">
          <div>
            <div className="loc-topbar__title">{t("Viewer Locations", "مواقع المشاهد")}</div>
            <div className="loc-topbar__sub">
              {t("Read-only location monitoring from backend data", "عرض المواقع فقط من بيانات الباك إند")}
            </div>
          </div>

          <div className="loc-actions">
            <button className="loc-refresh-btn" onClick={loadLocations} disabled={loading}>
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="loc-alert loc-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}

        {!!sourceInfo.length && !error && (
          <div className="loc-alert loc-alert--info">
            {t("Connected sources: ", "المصادر المتصلة: ")}
            <strong>{sourceInfo.join(" | ")}</strong>
          </div>
        )}

        <div className="loc-summary">
          {tiles.map((tile) => (
            <div key={tile.label} className="loc-summary-tile">
              <div className="loc-summary-tile__bar" style={{ background: tile.color }} />
              <div className="loc-summary-tile__val" style={{ color: tile.color }}>{tile.val}</div>
              <div className="loc-summary-tile__label">{tile.label}</div>
            </div>
          ))}
        </div>

        <div className="loc-filters">
          <div className="loc-field loc-field--wide">
            <label>{t("Search", "بحث")}</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search building, cluster, zone…", "بحث بالمبنى أو المجموعة أو المنطقة…")}
            />
          </div>

          {clusters.length > 0 && (
            <div className="loc-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
                <option value="ALL">{t("All Clusters", "كل المجموعات")}</option>
                {clusters.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {(search || cluster !== "ALL") && (
            <button
              className="loc-reset-btn"
              onClick={() => {
                setSearch("");
                setCluster("ALL");
              }}
            >
              {t("Clear", "مسح")}
            </button>
          )}
        </div>

        <div className="loc-view-row">
          <div className="loc-count">
            {filtered.length} {t("locations", "موقع")}
          </div>

          <div className="loc-view-toggle">
            <button
              className={`loc-view-btn${view === "grid" ? " loc-view-btn--active" : ""}`}
              onClick={() => setView("grid")}
            >
              {t("Grid", "شبكة")}
            </button>
            <button
              className={`loc-view-btn${view === "list" ? " loc-view-btn--active" : ""}`}
              onClick={() => setView("list")}
            >
              {t("List", "قائمة")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loc-loading">
            <div className="loc-loading-spinner" />
            {t("Loading locations from backend...", "جارٍ تحميل المواقع من الباك إند...")}
          </div>
        ) : view === "grid" ? (
          filtered.length ? (
            <div className="loc-cards-grid">
              {filtered.map((loc) => {
                const hasAttn = (loc.needsAttentionCount || 0) > 0;
                const inspPct = loc.devicesCount
                  ? Math.min(Math.round((loc.inspectionsCount / Math.max(loc.devicesCount, 1)) * 25), 100)
                  : 0;

                const barColor = hasAttn ? "#BA7517" : "#1D9E75";
                const accentColor = hasAttn ? "#BA7517" : "#1D9E75";

                return (
                  <div key={loc.id} className="loc-card" onClick={() => setSelected(loc)}>
                    <div className="loc-card__top-bar" style={{ background: accentColor }} />

                    <div className="loc-card__top">
                      <div>
                        <div className="loc-card__name">
                          {loc.building || loc.cluster || `${t("Location", "موقع")} #${loc.id}`}
                        </div>
                        <div className="loc-card__hint">
                          {[loc.cluster, loc.zone, loc.direction].filter(Boolean).join(" · ") || t("No info", "لا معلومات")}
                        </div>
                      </div>

                      <StatusBadge value={hasAttn ? "ATTENTION" : "OK"} lang={lang} />
                    </div>

                    <div className="loc-card__stats">
                      <div className="loc-stat">
                        <strong>{loc.devicesCount || 0}</strong>
                        <span>{t("Devices", "أجهزة")}</span>
                      </div>
                      <div className="loc-stat">
                        <strong>{loc.inspectionsCount || 0}</strong>
                        <span>{t("Insp.", "فحص")}</span>
                      </div>
                      <div className="loc-stat">
                        <strong style={{ fontSize: 13 }}>{fmtShort(loc.latestInspectionAt)}</strong>
                        <span>{t("Latest", "الأخير")}</span>
                      </div>
                    </div>

                    <div className="loc-card__bar-wrap">
                      <div className="loc-card__bar-label">
                        <span>{t("Inspection coverage", "تغطية الفحص")}</span>
                        <span>{inspPct}%</span>
                      </div>
                      <div className="loc-bar-track">
                        <div className="loc-bar-fill" style={{ width: `${inspPct}%`, background: barColor }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="loc-empty">{t("No locations found.", "لا توجد مواقع.")}</div>
          )
        ) : filtered.length ? (
          <div className="loc-list-wrap">
            <table className="loc-list-table">
              <thead>
                <tr>
                  <th>{t("Location", "الموقع")}</th>
                  <th>{t("Cluster", "المجموعة")}</th>
                  <th>{t("Devices", "الأجهزة")}</th>
                  <th>{t("Inspections", "الفحوصات")}</th>
                  <th>{t("Need Attention", "تحتاج متابعة")}</th>
                  <th>{t("Latest", "الأخير")}</th>
                  <th>{t("Status", "الحالة")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loc) => (
                  <tr key={loc.id} onClick={() => setSelected(loc)}>
                    <td>
                      <div className="loc-list-name">{loc.building || loc.cluster || `#${loc.id}`}</div>
                      <div className="loc-list-hint">
                        {[loc.zone, loc.direction].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>{loc.cluster || "—"}</td>
                    <td className="loc-list-count">{loc.devicesCount || 0}</td>
                    <td className="loc-list-count">{loc.inspectionsCount || 0}</td>
                    <td className="loc-list-count">{loc.needsAttentionCount || 0}</td>
                    <td style={{ fontSize: 12, color: "var(--faint)" }}>{fmtShort(loc.latestInspectionAt)}</td>
                    <td>
                      <StatusBadge value={(loc.needsAttentionCount || 0) > 0 ? "ATTENTION" : "OK"} lang={lang} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loc-empty">{t("No locations found.", "لا توجد مواقع.")}</div>
        )}

        {selected && (
          <div className="loc-detail-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
            <div className="loc-detail-panel">
              <button className="loc-detail-close" onClick={() => setSelected(null)}>
                {t("✕ Close", "✕ إغلاق")}
              </button>

              <div>
                <div className="loc-detail-name">
                  {selected.building || selected.cluster || `#${selected.id}`}
                </div>
                <div className="loc-detail-sub">
                  {[selected.cluster, selected.zone, selected.direction].filter(Boolean).join(" · ")}
                </div>
              </div>

              <div className="loc-detail-kpis">
                {[
                  { label: t("Devices", "الأجهزة"), val: selected.devicesCount || 0 },
                  { label: t("Inspections", "الفحوصات"), val: selected.inspectionsCount || 0 },
                  { label: t("Need Attention", "تحتاج متابعة"), val: selected.needsAttentionCount || 0 },
                  { label: t("Latest", "آخر فحص"), val: fmtShort(selected.latestInspectionAt) },
                ].map((kpi) => (
                  <div className="loc-detail-kpi" key={kpi.label}>
                    <strong>{kpi.val}</strong>
                    <span>{kpi.label}</span>
                  </div>
                ))}
              </div>

              <StatusBadge value={(selected.needsAttentionCount || 0) > 0 ? "ATTENTION" : "OK"} lang={lang} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ViewerLocationsPage;