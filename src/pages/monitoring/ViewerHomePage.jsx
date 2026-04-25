import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const HOME_CSS = `
.vh *, .vh *::before, .vh *::after { box-sizing: border-box; margin: 0; padding: 0; }

.vh {
  --blue:    #378ADD;
  --green:   #1D9E75;
  --amber:   #BA7517;
  --purple:  #7F77DD;
  --blue-bg:   rgba(55,138,221,0.08);
  --green-bg:  rgba(29,158,117,0.08);
  --amber-bg:  rgba(186,117,23,0.08);
  --purple-bg: rgba(127,119,221,0.08);
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
.vh__header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.vh__page-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}
.vh__page-sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}
.vh__action-btn {
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
.vh__action-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* ── alerts ── */
.vh__alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}
.vh__alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}
.vh__alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* ── Top bar ── */
.vh__topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 26px;
}
.vh__greeting {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 4px;
}
.vh__title {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.015em;
  color: var(--text);
}
.vh__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 4px;
}
.vh__chip {
  font-size: 12px;
  color: var(--muted);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 13px;
  background: var(--surface);
  white-space: nowrap;
}

/* ── KPI row ── */
.vh__kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.vh__kpi {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 18px 18px 15px;
  position: relative;
  overflow: hidden;
}
.vh__kpi-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.vh__kpi-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 10px;
  margin-top: 3px;
}
.vh__kpi-value {
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 7px;
  letter-spacing: -0.02em;
}
.vh__kpi-note {
  font-size: 11px;
  color: var(--faint);
}

/* ── Charts row ── */
.vh__charts {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}

/* ── Bottom row ── */
.vh__bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ── Card ── */
.vh__card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 20px 20px 18px;
}
.vh__card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}
.vh__card-sub {
  font-size: 12px;
  color: var(--faint);
  margin-bottom: 16px;
}

/* ── Legend ── */
.vh__legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.vh__legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--muted);
}
.vh__legend-dot {
  width: 9px; height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}

/* ── Bar rows (locations) ── */
.vh__bar-row {
  display: grid;
  grid-template-columns: 110px 1fr 38px;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}
.vh__bar-row:last-child { margin-bottom: 0; }
.vh__bar-label {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.vh__bar-track {
  height: 8px;
  border-radius: 999px;
  background: var(--surface2);
  overflow: hidden;
}
.vh__bar-fill {
  height: 100%;
  border-radius: 999px;
}
.vh__bar-val {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  text-align: right;
}

/* ── Recent inspections ── */
.vh__recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 0.5px solid var(--border);
}
.vh__recent-item:last-child { border-bottom: none; }
.vh__avatar {
  width: 32px; height: 32px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}
.vh__recent-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 2px;
}
.vh__recent-desc {
  font-size: 11px;
  color: var(--faint);
}
.vh__badge {
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 999px;
  flex-shrink: 0;
  margin-left: auto;
}
.vh__badge--ok   { background: #e6f7f1; color: #0f6e56; }
.vh__badge--warn { background: #fff4e0; color: #854f0b; }
.vh__badge--bad  { background: #fceaea; color: #a32d2d; }

.vh__loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}
.vh__loading-spinner {
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
@media (max-width: 900px) {
  .vh__kpis   { grid-template-columns: repeat(2, 1fr); }
  .vh__charts { grid-template-columns: 1fr; }
  .vh__bottom { grid-template-columns: 1fr; }
}
@media (max-width: 500px) {
  .vh__kpis { grid-template-columns: 1fr 1fr; }
  .vh { padding: 16px 14px; }
}
`;

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function formatDate(lang) {
  return new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShort(iso, lang) {
  if (!iso) return lang === "ar" ? "لا يوجد" : "No update";
  try {
    return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return lang === "ar" ? "لا يوجد" : "No update";
  }
}

function initials(name = "") {
  return name
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1e40af" },
  { bg: "#dcfce7", color: "#166534" },
  { bg: "#fef3c7", color: "#92400e" },
  { bg: "#ede9fe", color: "#5b21b6" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#cffafe", color: "#155e75" },
];

function avatarColor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
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

function mapDeviceStatus(status) {
  const s = String(status || "").toUpperCase();
  if (["OK", "ATTENTION", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(s)) {
    return s;
  }
  return "OK";
}

function inspectionToRecentStatus(inspectionStatus) {
  const s = String(inspectionStatus || "").toUpperCase();

  if (s === "OK") return "OK";
  if (s === "NOT_OK") return "NOT_OK";
  if (s === "PARTIAL") return "PARTIAL";
  if (s === "NOT_REACHABLE") return "NOT_REACHABLE";

  return "NOT_REACHABLE";
}

function normalizeDevice(item) {
  const location = item.location || {};
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];

  return {
    id: item.id,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    currentStatus: mapDeviceStatus(item.currentStatus || item.status),
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      inspectionsArray[0]?.inspectedAt ||
      null,
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
  const tech = item.technician || item.user || item.createdBy || {};

  return {
    id: item.id,
    deviceId: item.deviceId,
    inspectionStatus: String(item.inspectionStatus || "").toUpperCase() || "NOT_REACHABLE",
    issueReason: item.issueReason || "",
    notes: item.notes || "",
    inspectedAt: item.inspectedAt || item.createdAt || null,
    createdAt: item.createdAt || item.inspectedAt || null,
    technicianName:
      tech.fullName ||
      tech.username ||
      [tech.firstName, tech.lastName].filter(Boolean).join(" ") ||
      tech.email ||
      "Technician",
    device: {
      id: device.id || item.deviceId,
      deviceCode: device.deviceCode || device.code || device.barcode || `#${item.deviceId}`,
      deviceName: device.deviceName || device.name || "Unknown device",
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
      });
    }

    return map.get(key);
  }

  devices.forEach((d) => {
    const row = ensureRow(d.location);
    row.devicesCount += 1;
  });

  inspections.forEach((ins) => {
    const row = ensureRow(ins.device?.location);
    row.inspectionsCount += 1;
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

function DonutSVG({ healthy, attention, total, lang }) {
  const safe = total || 1;
  const pct = Math.round((healthy / safe) * 100);
  const C = 2 * Math.PI * 52;
  const healthyDash = (healthy / safe) * C;
  const attentionDash = (attention / safe) * C;

  return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="80" cy="80" r="52" fill="none" stroke="#eef1f6" strokeWidth="18" />
      <circle
        cx="80" cy="80" r="52"
        fill="none"
        stroke="#378ADD"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={`${healthyDash} ${C}`}
        strokeDashoffset={C / 4}
        style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
      />
      {attention > 0 && (
        <circle
          cx="80" cy="80" r="52"
          fill="none"
          stroke="#BA7517"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${attentionDash} ${C}`}
          strokeDashoffset={-(healthyDash - C / 4)}
          style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
        />
      )}
      <circle cx="80" cy="80" r="34" fill="#ffffff" />
      <text x="80" y="74" textAnchor="middle" fontSize="11" fill="#9aa0ad" fontFamily="inherit">
        {lang === "ar" ? "جاهزية" : "Readiness"}
      </text>
      <text x="80" y="95" textAnchor="middle" fontSize="22" fontWeight="700" fill="#16181d" fontFamily="inherit">
        {pct}%
      </text>
    </svg>
  );
}

const CHARTJS_CDN = "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";

function loadChartJS() {
  return new Promise((resolve) => {
    if (window.Chart) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = CHARTJS_CDN;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

function TrendChart({ weeklyData = [], lang = "en" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const labels = weeklyData.length
    ? weeklyData.map((_, i) => (lang === "ar" ? `الأسبوع ${i + 1}` : `Week ${i + 1}`))
    : ["Week 1", "Week 2", "Week 3", "Week 4"];

  const completions = weeklyData.length
    ? weeklyData.map((w) => w.completions ?? 0)
    : [0, 0, 0, 0];

  const pending = weeklyData.length
    ? weeklyData.map((w) => w.pending ?? 0)
    : [0, 0, 0, 0];

  useEffect(() => {
    let alive = true;

    loadChartJS().then(() => {
      if (!alive || !canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new window.Chart(canvasRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: lang === "ar" ? "مكتملة" : "Completions",
              data: completions,
              borderColor: "#378ADD",
              backgroundColor: "rgba(55,138,221,0.08)",
              borderWidth: 2,
              pointBackgroundColor: "#378ADD",
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.42,
              fill: true,
            },
            {
              label: lang === "ar" ? "تحتاج متابعة" : "Attention",
              data: pending,
              borderColor: "#1D9E75",
              backgroundColor: "transparent",
              borderWidth: 1.5,
              borderDash: [4, 4],
              pointBackgroundColor: "#1D9E75",
              pointRadius: 3,
              pointHoverRadius: 5,
              tension: 0.42,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "#ffffff",
              titleColor: "#16181d",
              bodyColor: "#6b7585",
              borderColor: "rgba(0,0,0,0.08)",
              borderWidth: 1,
              padding: 10,
              boxPadding: 4,
            },
          },
          scales: {
            x: {
              grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
              ticks: { color: "#9aa0ad", font: { size: 11 } },
              border: { display: false },
            },
            y: {
              grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
              ticks: { color: "#9aa0ad", font: { size: 11 } },
              border: { display: false },
              beginAtZero: true,
            },
          },
        },
      });
    });

    return () => {
      alive = false;
      chartRef.current?.destroy();
    };
  }, [JSON.stringify(weeklyData), lang]);

  return (
    <div style={{ position: "relative", width: "100%", height: 185 }}>
      <canvas ref={canvasRef} role="img" aria-label="Line chart showing operations completion trend" />
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────────────── */
export function ViewerHomePage({
  currentUser: currentUserProp = null,
  kpis: kpisProp = null,
  locationRows: locationRowsProp = null,
  recentInspections: recentInspectionsProp = null,
  weeklyData: weeklyDataProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [kpis, setKpis] = useState(kpisProp || {});
  const [locationRows, setLocationRows] = useState(Array.isArray(locationRowsProp) ? locationRowsProp : []);
  const [recentInspections, setRecentInspections] = useState(Array.isArray(recentInspectionsProp) ? recentInspectionsProp : []);
  const [weeklyData, setWeeklyData] = useState(Array.isArray(weeklyDataProp) ? weeklyDataProp : []);

  const [loading, setLoading] = useState(
    !currentUserProp || !kpisProp || !Array.isArray(locationRowsProp) || !Array.isArray(recentInspectionsProp)
  );
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState([]);

  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadHomeData() {
    if (
      currentUserProp &&
      kpisProp &&
      Array.isArray(locationRowsProp) &&
      Array.isArray(recentInspectionsProp) &&
      Array.isArray(weeklyDataProp)
    ) {
      setCurrentUser(currentUserProp);
      setKpis(kpisProp);
      setLocationRows(locationRowsProp);
      setRecentInspections(recentInspectionsProp);
      setWeeklyData(weeklyDataProp);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const sources = [];

      let userInfo = currentUserProp;

      if (!userInfo) {
        try {
          const authRes = await fetchJsonCandidates(
            [
              `${baseUrl}/auth/me`,
              `${baseUrl}/api/auth/me`,
              `${baseUrl}/users/me`,
              `${baseUrl}/api/users/me`,
              `${baseUrl}/profile`,
            ],
            token
          );

          const rawUser = authRes.data?.user || authRes.data?.data || authRes.data;
          userInfo = rawUser;
          sources.push(authRes.url);
        } catch {
          userInfo = null;
        }
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

      const devices = rawDevices.map(normalizeDevice);
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

      const inspections = rawInspections
        .map(normalizeInspection)
        .sort((a, b) => new Date(b.inspectedAt || b.createdAt || 0) - new Date(a.inspectedAt || a.createdAt || 0));

      sources.push(inspectionsRes.url);

      let locationRowsBuilt = [];

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

        const rawLocations =
          Array.isArray(locationsRes.data) ? locationsRes.data :
          Array.isArray(locationsRes.data?.data) ? locationsRes.data.data :
          Array.isArray(locationsRes.data?.locations) ? locationsRes.data.locations :
          Array.isArray(locationsRes.data?.items) ? locationsRes.data.items :
          [];

        const autoRows = buildLocationRows(devices, inspections);

        locationRowsBuilt = rawLocations.map((loc) => {
          const matched = autoRows.find((r) =>
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
          };
        });

        sources.push(locationsRes.url);
      } catch {
        locationRowsBuilt = buildLocationRows(devices, inspections);
      }

      const healthyDevices = devices.filter((d) => d.currentStatus === "OK").length;
      const attentionDevices = devices.filter((d) =>
        ["ATTENTION", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(d.currentStatus)
      ).length;

      const latestInspectionAt = inspections[0]?.inspectedAt || null;

      const kpiBuilt = {
        totalDevices: devices.length,
        healthyDevices,
        attentionDevices,
        totalInspections: inspections.length,
        latestInspectionAt,
        inspectedDevices: new Set(inspections.map((i) => i.deviceId).filter(Boolean)).size,
      };

      const recentBuilt = inspections.slice(0, 5).map((ins) => ({
        id: ins.id,
        techName: ins.technicianName || "Technician",
        deviceLabel: [
          ins.device?.deviceCode || `#${ins.deviceId}`,
          ins.device?.deviceName || "",
          ins.device?.location?.building || ins.device?.location?.cluster || "",
        ].filter(Boolean).join(" · "),
        time: (() => {
          try {
            return new Date(ins.inspectedAt || ins.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            return "";
          }
        })(),
        status: inspectionToRecentStatus(ins.inspectionStatus),
      }));

      const now = new Date();
      const weeklyBuilt = [3, 2, 1, 0].map((offset) => {
        const start = new Date(now);
        start.setDate(now.getDate() - (offset * 7 + 6));
        start.setHours(0, 0, 0, 0);

        const end = new Date(now);
        end.setDate(now.getDate() - (offset * 7));
        end.setHours(23, 59, 59, 999);

        const weekInspections = inspections.filter((ins) => {
          const d = new Date(ins.inspectedAt || ins.createdAt);
          return d >= start && d <= end;
        });

        const completions = weekInspections.filter((ins) => ins.inspectionStatus === "OK").length;
        const pending = weekInspections.filter((ins) => ins.inspectionStatus !== "OK").length;

        return { completions, pending };
      });

      setCurrentUser(userInfo);
      setKpis(kpisProp || kpiBuilt);
      setLocationRows(Array.isArray(locationRowsProp) ? locationRowsProp : locationRowsBuilt);
      setRecentInspections(Array.isArray(recentInspectionsProp) ? recentInspectionsProp : recentBuilt);
      setWeeklyData(Array.isArray(weeklyDataProp) ? weeklyDataProp : weeklyBuilt);
      setSourceInfo(sources);
    } catch (err) {
      console.error("Failed to load home data:", err);
      setError(err?.message || "Failed to load home data from backend.");
      setCurrentUser(currentUserProp || null);
      setKpis(kpisProp || {});
      setLocationRows(Array.isArray(locationRowsProp) ? locationRowsProp : []);
      setRecentInspections(Array.isArray(recentInspectionsProp) ? recentInspectionsProp : []);
      setWeeklyData(Array.isArray(weeklyDataProp) ? weeklyDataProp : []);
      setSourceInfo([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHomeData();
  }, [baseUrl]);

  const total = kpis.totalDevices ?? 0;
  const healthy = kpis.healthyDevices ?? 0;
  const attention = kpis.attentionDevices ?? 0;
  const totalInsp = kpis.totalInspections ?? 0;
  const latest = kpis.latestInspectionAt;
  const inspected = kpis.inspectedDevices ?? 0;

  const userName =
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.email ||
    (lang === "ar" ? "المستخدم" : "User");

  const topLocations = [...locationRows]
    .sort((a, b) => (b.devicesCount || 0) - (a.devicesCount || 0))
    .slice(0, 4);

  const maxLoc = Math.max(...topLocations.map((l) => l.devicesCount || 0), 1);

  const T = {
    greeting:            lang === "ar" ? `أهلًا ${userName}` : `Hello, ${userName}`,
    title:               lang === "ar" ? "نظرة عامة على العمليات" : "Operational Overview",
    dateChip:            formatDate(lang),
    updateChip:          (lang === "ar" ? "آخر تحديث: " : "Updated: ") + formatShort(latest, lang),
    inspChip:            (lang === "ar" ? "مفحوص: " : "Inspected: ") + inspected + (lang === "ar" ? " جهاز" : " devices"),
    kpi1Label:           lang === "ar" ? "إجمالي الأجهزة" : "Total devices",
    kpi1Note:            lang === "ar" ? "كل الأجهزة في النطاق" : "All visible in scope",
    kpi2Label:           lang === "ar" ? "تعمل بشكل طبيعي" : "Operational",
    kpi2Note:            lang === "ar" ? "جاهزية مستقرة" : "Stable readiness",
    kpi3Label:           lang === "ar" ? "تحتاج متابعة" : "Need attention",
    kpi3Note:            lang === "ar" ? "مُعلَّمة للمراجعة" : "Flagged for review",
    kpi4Label:           lang === "ar" ? "الفحوصات" : "Inspections",
    kpi4Note:            (lang === "ar" ? "آخر: " : "Last: ") + formatShort(latest, lang),
    trendTitle:          lang === "ar" ? "اتجاه إتمام العمليات" : "Operations completion trend",
    trendSub:            lang === "ar" ? "آخر 4 أسابيع" : "Last 4 weeks",
    trendComp:           lang === "ar" ? "مكتملة" : "Completions",
    trendPend:           lang === "ar" ? "تحتاج متابعة" : "Attention",
    donutTitle:          lang === "ar" ? "توزيع الحالة" : "Readiness split",
    donutSub:            lang === "ar" ? "أجهزة سليمة مقابل تحتاج متابعة" : "Healthy vs attention devices",
    donutOp:             lang === "ar" ? "تعمل" : "Operational",
    donutAt:             lang === "ar" ? "تحتاج متابعة" : "Need attention",
    locTitle:            lang === "ar" ? "أكثر المواقع نشاطًا" : "Top active locations",
    locSub:              lang === "ar" ? "عدد الأجهزة لكل موقع" : "Device count per site",
    locEmpty:            lang === "ar" ? "لا توجد مواقع." : "No locations available.",
    recTitle:            lang === "ar" ? "آخر الفحوصات" : "Recent inspections",
    recSub:              lang === "ar" ? "آخر نشاط للفنيين" : "Latest technician activity",
    badgeOk:             lang === "ar" ? "سليم" : "OK",
    badgeNotOk:          lang === "ar" ? "غير سليم" : "NOT_OK",
    badgePartial:        lang === "ar" ? "جزئي" : "PARTIAL",
    badgeNotReachable:   lang === "ar" ? "غير متاح" : "NOT_REACHABLE",
  };

  const barColors = ["#378ADD", "#7F77DD", "#1D9E75", "#BA7517"];

  return (
    <>
      <style>{HOME_CSS}</style>

      <div className="vh" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="vh__header-actions">
          <div>
            <div className="vh__page-title">{lang === "ar" ? "الصفحة الرئيسية" : "Home"}</div>
            <div className="vh__page-sub">
              {lang === "ar" ? "عرض مباشر لمؤشرات النظام" : "Live operational snapshot from backend"}
            </div>
          </div>

          <button className="vh__action-btn" onClick={loadHomeData} disabled={loading}>
            {loading ? (lang === "ar" ? "جارٍ التحميل..." : "Loading...") : (lang === "ar" ? "تحديث" : "Refresh")}
          </button>
        </div>

        {!!error && (
          <div className="vh__alert vh__alert--error">
            {lang === "ar" ? "خطأ في الاتصال بالباك إند: " : "Backend connection error: "}
            {error}
          </div>
        )}

        {!!sourceInfo.length && !error && (
          <div className="vh__alert vh__alert--info">
            {lang === "ar" ? "المصادر المتصلة: " : "Connected sources: "}
            <strong>{sourceInfo.join(" | ")}</strong>
          </div>
        )}

        {loading ? (
          <div className="vh__loading">
            <div className="vh__loading-spinner" />
            {lang === "ar" ? "جارٍ تحميل بيانات الصفحة الرئيسية..." : "Loading home data from backend..."}
          </div>
        ) : (
          <>
            <div className="vh__topbar">
              <div>
                <div className="vh__greeting">{T.greeting}</div>
                <div className="vh__title">{T.title}</div>
              </div>

              <div className="vh__chips">
                <div className="vh__chip">{T.dateChip}</div>
                <div className="vh__chip">{T.updateChip}</div>
                <div className="vh__chip">{T.inspChip}</div>
              </div>
            </div>

            <div className="vh__kpis">
              <div className="vh__kpi">
                <div className="vh__kpi-bar" style={{ background: "var(--blue)" }} />
                <div className="vh__kpi-label">{T.kpi1Label}</div>
                <div className="vh__kpi-value" style={{ color: "var(--blue)" }}>{total}</div>
                <div className="vh__kpi-note">{T.kpi1Note}</div>
              </div>

              <div className="vh__kpi">
                <div className="vh__kpi-bar" style={{ background: "var(--green)" }} />
                <div className="vh__kpi-label">{T.kpi2Label}</div>
                <div className="vh__kpi-value" style={{ color: "var(--green)" }}>{healthy}</div>
                <div className="vh__kpi-note">{T.kpi2Note}</div>
              </div>

              <div className="vh__kpi">
                <div className="vh__kpi-bar" style={{ background: "var(--amber)" }} />
                <div className="vh__kpi-label">{T.kpi3Label}</div>
                <div className="vh__kpi-value" style={{ color: "var(--amber)" }}>{attention}</div>
                <div className="vh__kpi-note">{T.kpi3Note}</div>
              </div>

              <div className="vh__kpi">
                <div className="vh__kpi-bar" style={{ background: "var(--purple)" }} />
                <div className="vh__kpi-label">{T.kpi4Label}</div>
                <div className="vh__kpi-value" style={{ color: "var(--purple)" }}>{totalInsp}</div>
                <div className="vh__kpi-note">{T.kpi4Note}</div>
              </div>
            </div>

            <div className="vh__charts">
              <div className="vh__card">
                <div className="vh__card-title">{T.trendTitle}</div>
                <div className="vh__card-sub">{T.trendSub}</div>

                <div className="vh__legend">
                  <div className="vh__legend-item">
                    <span className="vh__legend-dot" style={{ background: "#378ADD" }} />
                    {T.trendComp}
                  </div>
                  <div className="vh__legend-item">
                    <span
                      className="vh__legend-dot"
                      style={{
                        background: "#1D9E75",
                        backgroundImage: "repeating-linear-gradient(90deg,#1D9E75 0 4px,transparent 4px 8px)",
                        height: 2,
                        borderRadius: 0
                      }}
                    />
                    {T.trendPend}
                  </div>
                </div>

                <TrendChart weeklyData={weeklyData} lang={lang} />
              </div>

              <div className="vh__card">
                <div className="vh__card-title">{T.donutTitle}</div>
                <div className="vh__card-sub">{T.donutSub}</div>

                <div className="vh__legend">
                  <div className="vh__legend-item">
                    <span className="vh__legend-dot" style={{ background: "#378ADD" }} />
                    {T.donutOp} — {healthy}
                  </div>
                  <div className="vh__legend-item">
                    <span className="vh__legend-dot" style={{ background: "#BA7517" }} />
                    {T.donutAt} — {attention}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
                  <DonutSVG healthy={healthy} attention={attention} total={total} lang={lang} />
                </div>
              </div>
            </div>

            <div className="vh__bottom">
              <div className="vh__card">
                <div className="vh__card-title">{T.locTitle}</div>
                <div className="vh__card-sub">{T.locSub}</div>

                {topLocations.length === 0 ? (
                  <div style={{ fontSize: 13, color: "var(--faint)" }}>{T.locEmpty}</div>
                ) : (
                  topLocations.map((loc, i) => (
                    <div className="vh__bar-row" key={loc.id}>
                      <div className="vh__bar-label">
                        {loc.building || loc.cluster || `#${loc.id}`}
                      </div>
                      <div className="vh__bar-track">
                        <div
                          className="vh__bar-fill"
                          style={{
                            width: `${((loc.devicesCount || 0) / maxLoc) * 100}%`,
                            background: barColors[i % barColors.length],
                          }}
                        />
                      </div>
                      <div className="vh__bar-val">{loc.devicesCount || 0}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="vh__card">
                <div className="vh__card-title">{T.recTitle}</div>
                <div className="vh__card-sub">{T.recSub}</div>

                {recentInspections.length ? (
                  recentInspections.map((item) => {
                    const { bg, color } = avatarColor(item.techName || "");

                    const badgeClass =
                      item.status === "OK"
                        ? "vh__badge vh__badge--ok"
                        : item.status === "PARTIAL"
                        ? "vh__badge vh__badge--warn"
                        : "vh__badge vh__badge--bad";

                    const badgeText =
                      item.status === "OK"
                        ? T.badgeOk
                        : item.status === "NOT_OK"
                        ? T.badgeNotOk
                        : item.status === "PARTIAL"
                        ? T.badgePartial
                        : T.badgeNotReachable;

                    return (
                      <div className="vh__recent-item" key={item.id}>
                        <div className="vh__avatar" style={{ background: bg, color }}>
                          {initials(item.techName || "T")}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="vh__recent-name">{item.techName}</div>
                          <div className="vh__recent-desc">
                            {item.deviceLabel}
                            {item.time ? ` — ${item.time}` : ""}
                          </div>
                        </div>

                        <span className={badgeClass}>{badgeText}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ fontSize: 13, color: "var(--faint)" }}>
                    {lang === "ar" ? "لا توجد فحوصات حديثة." : "No recent inspections."}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ViewerHomePage;