import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const INSPECTIONS_CSS = `
.insp-root *, .insp-root *::before, .insp-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.insp-root {
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

/* ── top bar ── */
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
  font-weight: 700;
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
.insp-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* ── alerts ── */
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

/* ── Summary strip ── */
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
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.insp-summary-tile__val {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 6px;
  margin-top: 3px;
  letter-spacing: -0.02em;
}
.insp-summary-tile__label {
  font-size: 11px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 600;
}

/* ── Status pills ── */
.insp-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.insp-pill {
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
.insp-pill:hover { border-color: var(--blue); color: var(--text); }
.insp-pill--active { background: #EBF4FF; border-color: var(--blue); color: var(--blue); }
.insp-pill-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.insp-pill-count { font-size: 11px; opacity: 0.6; }

/* ── Search bar ── */
.insp-searchbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.insp-search-wrap {
  flex: 1;
  position: relative;
  min-width: 240px;
}
.insp-search-wrap input {
  width: 100%;
  height: 38px;
  padding: 0 14px;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 9px;
  background: var(--surface);
  font-size: 13px;
  color: var(--text);
  outline: none;
  transition: border-color .15s;
}
.insp-search-wrap input:focus { border-color: var(--blue); }
.insp-search-wrap input::placeholder { color: var(--faint); }

.insp-view-toggle {
  display: flex;
  gap: 3px;
  padding: 3px;
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 10px;
}
.insp-view-btn {
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
.insp-view-btn--active {
  background: var(--surface2);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

.insp-reset-btn {
  height: 38px;
  padding: 0 16px;
  border: 0.5px solid rgba(0,0,0,0.12);
  border-radius: 9px;
  background: var(--surface2);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.insp-reset-btn:hover { background: #FDECEA; color: #C0392B; border-color: #FBCCC8; }

/* ── Panel ── */
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
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.insp-panel__sub {
  font-size: 12px;
  color: var(--faint);
}
.insp-records {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 4px 12px;
}

/* ── Table ── */
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
  font-weight: 700;
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
.insp-table tr:last-child td { border-bottom: none; }
.insp-table tr:hover td { background: #fafbfc; }

.insp-dev-code {
  font-size: 13px;
  font-weight: 700;
  color: var(--blue);
  letter-spacing: .3px;
}
.insp-dev-name { font-size: 11px; color: var(--faint); margin-top: 3px; }
.insp-tech-name { font-size: 12px; color: var(--muted); }
.insp-notes { font-size: 12px; color: var(--faint); max-width: 260px; }
.insp-locline { font-size: 12px; color: var(--muted); }

/* ── Timeline view ── */
.insp-timeline { padding: 8px 20px; }
.insp-tl-item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 0.5px solid var(--border);
}
.insp-tl-item:last-child { border-bottom: none; }
.insp-tl-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
}
.insp-tl-dot {
  width: 10px; height: 10px;
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
.insp-tl-body { flex: 1; }
.insp-tl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}
.insp-tl-dev { font-size: 13px; font-weight: 700; color: var(--blue); }
.insp-tl-loc { font-size: 12px; color: var(--muted); margin-bottom: 4px; }
.insp-tl-meta { display: flex; gap: 14px; flex-wrap: wrap; }
.insp-tl-time { font-size: 11px; color: var(--faint); }
.insp-tl-note { font-size: 11px; color: var(--faint); font-style: italic; }
.insp-tl-tech { font-size: 11px; color: var(--muted); }

/* ── Badges ── */
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

/* ── Empty / Loading ── */
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

/* ── Responsive ── */
@media (max-width: 1100px) {
  .insp-summary { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .insp-root { padding: 16px 14px; }
}
@media (max-width: 600px) {
  .insp-summary { grid-template-columns: repeat(2, 1fr); }
}
`;

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK:            { label: "OK",            cls: "badge--ok" },
  NOT_OK:        { label: "Not OK",        cls: "badge--maint" },
  PARTIAL:       { label: "Partial",       cls: "badge--att" },
  NOT_REACHABLE: { label: "Not Reachable", cls: "badge--oos" },
};

const BADGE_MAP_AR = {
  OK:            { label: "سليم",        cls: "badge--ok" },
  NOT_OK:        { label: "غير سليم",    cls: "badge--maint" },
  PARTIAL:       { label: "جزئي",        cls: "badge--att" },
  NOT_REACHABLE: { label: "غير متاح",    cls: "badge--oos" },
};

const STATUS_FILTERS = [
  { key: "ALL",           en: "All",           ar: "الكل",         color: "#378ADD" },
  { key: "OK",            en: "OK",            ar: "سليم",         color: "#1D9E75" },
  { key: "NOT_OK",        en: "Not OK",        ar: "غير سليم",     color: "#C0392B" },
  { key: "PARTIAL",       en: "Partial",       ar: "جزئي",         color: "#BA7517" },
  { key: "NOT_REACHABLE", en: "Not Reachable", ar: "غير متاح",     color: "#7B8A9A" },
];

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

function normalizeInspection(item) {
  const device = item.device || {};
  const location = device.location || item.location || {};
  const tech = item.technician || item.user || item.createdBy || {};

  return {
    id: item.id,
    deviceId: item.deviceId,
    inspectionStatus: String(item.inspectionStatus || "").toUpperCase() || "NOT_REACHABLE",
    issueReason: item.issueReason || "",
    notes: item.notes || "",
    locationText:
      item.locationText ||
      [location.cluster, location.building, location.zone, location.direction]
        .filter(Boolean)
        .join(" · "),
    inspectedAt: item.inspectedAt || item.createdAt || null,
    createdAt: item.createdAt || item.inspectedAt || null,
    technicianName:
      tech.fullName ||
      tech.username ||
      [tech.firstName, tech.lastName].filter(Boolean).join(" ") ||
      tech.email ||
      "",
    device: {
      id: device.id || item.deviceId,
      deviceCode: device.deviceCode || device.code || device.barcode || `#${item.deviceId}`,
      deviceName: device.deviceName || device.name || "Unknown device",
      serialNumber: device.serialNumber || "",
      location: {
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
      },
    },
  };
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
        Array.isArray(data) ? data :
        Array.isArray(data?.data) ? data.data :
        Array.isArray(data?.inspections) ? data.inspections :
        Array.isArray(data?.items) ? data.items :
        Array.isArray(data?.results) ? data.results :
        [];

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
  const [activeStatus, setActiveStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");

  const [inspections, setInspections] = useState(
    Array.isArray(inspectionsProp) ? inspectionsProp.map(normalizeInspection) : []
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
        (a, b) => new Date(b.inspectedAt || b.createdAt || 0) - new Date(a.inspectedAt || a.createdAt || 0)
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

  const counts = useMemo(() => {
    const c = { ALL: inspections.length };
    inspections.forEach((i) => {
      c[i.inspectionStatus] = (c[i.inspectionStatus] || 0) + 1;
    });
    return c;
  }, [inspections]);

  const filtered = useMemo(() => {
    return inspections.filter((ins) => {
      if (activeStatus !== "ALL" && ins.inspectionStatus !== activeStatus) return false;

      const s = search.trim().toLowerCase();
      if (!s) return true;

      const haystack = [
        ins.device?.deviceCode,
        ins.device?.deviceName,
        ins.device?.serialNumber,
        ins.locationText,
        ins.issueReason,
        ins.notes,
        ins.technicianName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(s);
    });
  }, [inspections, activeStatus, search]);

  const tiles = [
    {
      key: "total",
      label: t("Total", "الإجمالي"),
      val: inspections.length,
      color: TILE_COLORS.total,
    },
    {
      key: "ok",
      label: t("OK", "سليم"),
      val: counts.OK || 0,
      color: TILE_COLORS.ok,
    },
    {
      key: "notOk",
      label: t("Not OK", "غير سليم"),
      val: counts.NOT_OK || 0,
      color: TILE_COLORS.notOk,
    },
    {
      key: "partial",
      label: t("Partial", "جزئي"),
      val: counts.PARTIAL || 0,
      color: TILE_COLORS.partial,
    },
    {
      key: "unreachable",
      label: t("Not Reachable", "غير متاح"),
      val: counts.NOT_REACHABLE || 0,
      color: TILE_COLORS.unreachable,
    },
  ];

  const locationParts = (ins) => ({
    cluster:   ins.device?.location?.cluster   || "",
    building:  ins.device?.location?.building  || "",
    zone:      ins.device?.location?.zone      || "",
    direction: ins.device?.location?.direction || "",
  });

  return (
    <>
      <style>{INSPECTIONS_CSS}</style>

      <div className="insp-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="insp-topbar">
          <div>
            <div className="insp-topbar__title">{t("Viewer Inspections", "فحوصات المشاهد")}</div>
            <div className="insp-topbar__sub">
              {t("Read-only monitoring of all inspection records", "عرض فقط لكل سجلات الفحص")}
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

        <div className="insp-summary">
          {tiles.map((tile) => (
            <div key={tile.key} className="insp-summary-tile">
              <div className="insp-summary-tile__bar" style={{ background: tile.color }} />
              <div className="insp-summary-tile__val" style={{ color: tile.color }}>
                {tile.val}
              </div>
              <div className="insp-summary-tile__label">{tile.label}</div>
            </div>
          ))}
        </div>

        <div className="insp-pills">
          {STATUS_FILTERS.map((sf) => (
            <div
              key={sf.key}
              className={`insp-pill${activeStatus === sf.key ? " insp-pill--active" : ""}`}
              onClick={() => setActiveStatus(sf.key)}
            >
              <div className="insp-pill-dot" style={{ background: sf.color }} />
              {lang === "ar" ? sf.ar : sf.en}
              <span className="insp-pill-count">({counts[sf.key] || 0})</span>
            </div>
          ))}
        </div>

        <div className="insp-searchbar">
          <div className="insp-search-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(
                "Search by device code, name, technician, notes or location…",
                "بحث بكود الجهاز أو الاسم أو الفني أو الملاحظات أو الموقع…"
              )}
            />
          </div>

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

          {(search || activeStatus !== "ALL") && (
            <button
              className="insp-reset-btn"
              onClick={() => {
                setSearch("");
                setActiveStatus("ALL");
              }}
            >
              {t("Clear", "مسح")}
            </button>
          )}
        </div>

        <div className="insp-panel">
          <div className="insp-panel__head">
            <div>
              <div className="insp-panel__title">{t("Inspections Log", "سجل الفحوصات")}</div>
              <div className="insp-panel__sub">{t("All recorded inspections", "جميع الفحوصات المسجلة")}</div>
            </div>

            <div className="insp-records">
              {filtered.length} {t("records", "سجل")}
            </div>
          </div>

          {loading ? (
            <div className="insp-loading">
              <div className="insp-loading-spinner" />
              {t("Loading inspections from backend...", "جارٍ تحميل الفحوصات من الباك إند...")}
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
                        <tr key={ins.id}>
                          <td>
                            <div className="insp-dev-code">
                              {ins.device?.deviceCode || `#${ins.deviceId}`}
                            </div>
                            <div className="insp-dev-name">
                              {ins.device?.deviceName || t("Unknown", "غير معروف")}
                            </div>
                          </td>

                          <td>
                            <StatusBadge value={ins.inspectionStatus} lang={lang} />
                          </td>

                          <td>
                            <div className="insp-locline">{loc.cluster || "—"}</div>
                          </td>

                          <td>
                            <div className="insp-locline">{loc.building || "—"}</div>
                          </td>

                          <td>
                            <div className="insp-locline">{loc.zone || "—"}</div>
                          </td>

                          <td>
                            <div className="insp-locline">{loc.direction || "—"}</div>
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
                  "No inspections match the selected filters or no data came from backend.",
                  "لا توجد فحوصات مطابقة للفلاتر أو لم تصل بيانات من الباك إند."
                )}
              </div>
            )
          ) : filtered.length ? (
            <div className="insp-timeline">
              {filtered.map((ins, idx) => {
                const loc = locationParts(ins);
                const locStr = [loc.cluster, loc.building, loc.zone, loc.direction]
                  .filter(Boolean)
                  .join(" · ") || t("Unknown", "غير معروف");
                return (
                  <div className="insp-tl-item" key={ins.id}>
                    <div className="insp-tl-line">
                      <div
                        className="insp-tl-dot"
                        style={{ background: DOT_COLORS[ins.inspectionStatus] || "#378ADD" }}
                      />
                      {idx < filtered.length - 1 && <div className="insp-tl-connector" />}
                    </div>

                    <div className="insp-tl-body">
                      <div className="insp-tl-head">
                        <span className="insp-tl-dev">
                          {ins.device?.deviceCode || `#${ins.deviceId}`}
                        </span>
                        <StatusBadge value={ins.inspectionStatus} lang={lang} />
                      </div>

                      <div className="insp-tl-loc">{locStr}</div>

                      <div className="insp-tl-meta">
                        <span className="insp-tl-time">
                          {fmt(ins.inspectedAt || ins.createdAt)} {fmtTime(ins.inspectedAt || ins.createdAt)}
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