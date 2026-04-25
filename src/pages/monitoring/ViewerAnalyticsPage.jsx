import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const ANALYTICS_CSS = `
.analytics-root *, .analytics-root *::before, .analytics-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.analytics-root {
  --blue:    #378ADD;
  --green:   #1D9E75;
  --amber:   #BA7517;
  --red:     #C0392B;
  --purple:  #7F77DD;
  --cyan:    #0891B2;
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
.an-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.an-topbar__title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}
.an-topbar__sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}
.an-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.an-refresh-btn {
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
.an-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* alerts */
.an-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}
.an-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}
.an-alert--info {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

/* pills */
.an-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.an-pill {
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
.an-pill:hover { border-color: var(--blue); color: var(--text); }
.an-pill--active { background: #EBF4FF; border-color: var(--blue); color: var(--blue); }
.an-pill-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

/* grid */
.ag { display: grid; gap: 14px; margin-bottom: 14px; }
.ag--3     { grid-template-columns: 2fr 1fr 1fr; }
.ag--equal { grid-template-columns: 1fr 1fr 1fr; }
.ag--2-1   { grid-template-columns: 2fr 1fr; }
.ag--1     { grid-template-columns: 1fr; }
@media (max-width: 900px) {
  .ag--3, .ag--equal, .ag--2-1 { grid-template-columns: 1fr; }
}

/* card */
.an-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 18px 20px 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.an-card__accent {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  border-radius: 14px 14px 0 0;
}
.an-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 3px;
}
.an-card__sub {
  font-size: 12px;
  color: var(--faint);
  margin-bottom: 16px;
}

/* charts */
.chart-svg { width: 100%; height: auto; display: block; }
.chart-grid-line { stroke: rgba(0,0,0,0.06); stroke-width: .5; }
.chart-axis-label { fill: #9aa0ad; font-size: 9px; font-family: "Segoe UI", system-ui, sans-serif; }
.chart-line { fill: none; stroke-width: 2; stroke-linecap: round; }

/* donut */
.donut-wrap { display: flex; align-items: center; gap: 16px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; }
.donut-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); }
.donut-legend-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.donut-legend-value { margin-left: auto; font-weight: 600; color: var(--text); font-size: 13px; }

/* gauge */
.gauge-wrap { display: flex; flex-direction: column; align-items: center; }
.gauge-value { font-size: 28px; font-weight: 700; margin-top: -16px; letter-spacing: -0.02em; }
.gauge-label { font-size: 11px; color: var(--faint); margin-top: 3px; }

/* horizontal bars */
.hbar-row { margin-bottom: 11px; }
.hbar-row:last-child { margin-bottom: 0; }
.hbar-labels { display: flex; justify-content: space-between; margin-bottom: 5px; gap: 8px; }
.hbar-name { font-size: 12px; color: var(--muted); }
.hbar-val { font-size: 12px; font-weight: 600; color: var(--text); }
.hbar-track { height: 6px; background: var(--surface2); border-radius: 999px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 999px; transition: width .6s; }

/* heatmap */
.heatmap-grid { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; }
.heatmap-cell { aspect-ratio: 1; border-radius: 3px; }

/* spark */
.spark-row { margin-bottom: 13px; display: flex; align-items: center; gap: 10px; }
.spark-row:last-child { margin-bottom: 0; }
.spark-label { width: 90px; font-size: 12px; color: var(--muted); flex-shrink: 0; }
.spark-val { font-size: 15px; font-weight: 700; min-width: 36px; text-align: right; flex-shrink: 0; }

/* stat summary */
.stat-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 0.5px solid var(--border); gap: 10px; }
.stat-row:last-child { border-bottom: none; }
.stat-row__label { font-size: 12px; color: var(--muted); }
.stat-row__value { font-size: 14px; font-weight: 700; }

.radar-wrap { display: flex; justify-content: center; }

.an-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}
.an-loading-spinner {
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
`;

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function scaleY(v, min, max, H) {
  return max === min ? H / 2 : H - ((v - min) / (max - min)) * H;
}
function smoothPath(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i][0] + pts[i + 1][0]) / 2;
    d += ` C ${cx},${pts[i][1]} ${cx},${pts[i + 1][1]} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
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

function normalizeDevice(item) {
  const location = item.location || {};
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];
  return {
    id: item.id,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    currentStatus: String(item.currentStatus || item.status || "OK").toUpperCase(),
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      inspectionsArray[0]?.inspectedAt ||
      null,
    inspectionsCount:
      item.inspectionsCount ??
      item._count?.inspections ??
      inspectionsArray.length ??
      0,
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
    deviceId: item.deviceId,
    inspectionStatus: String(item.inspectionStatus || "").toUpperCase() || "NOT_REACHABLE",
    inspectedAt: item.inspectedAt || item.createdAt || null,
    createdAt: item.createdAt || item.inspectedAt || null,
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
    locationText:
      item.locationText ||
      [location.cluster, location.building, location.zone, location.direction]
        .filter(Boolean)
        .join(" · "),
  };
}

function buildLocationRows(devices, inspections) {
  const map = new Map();

  devices.forEach((d) => {
    const key = [
      d.location?.cluster || "",
      d.location?.building || "",
      d.location?.zone || "",
      d.location?.direction || "",
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        id: key || `loc-${map.size + 1}`,
        cluster: d.location?.cluster || "",
        building: d.location?.building || "",
        zone: d.location?.zone || "",
        direction: d.location?.direction || "",
        devicesCount: 0,
        inspectionsCount: 0,
      });
    }

    map.get(key).devicesCount += 1;
  });

  inspections.forEach((ins) => {
    const key = [
      ins.device?.location?.cluster || "",
      ins.device?.location?.building || "",
      ins.device?.location?.zone || "",
      ins.device?.location?.direction || "",
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        id: key || `loc-${map.size + 1}`,
        cluster: ins.device?.location?.cluster || "",
        building: ins.device?.location?.building || "",
        zone: ins.device?.location?.zone || "",
        direction: ins.device?.location?.direction || "",
        devicesCount: 0,
        inspectionsCount: 0,
      });
    }

    map.get(key).inspectionsCount += 1;
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

/* ═══════════════════════════════════════════
   CHARTS
═══════════════════════════════════════════ */
function LineChart({ data, color, h = 130 }) {
  const W = 460, H = h, PL = 32, PT = 8, PB = 24, PR = 8;
  const cW = W - PL - PR, cH = H - PT - PB;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.1;
  const pts = data.map((d, i) => [PL + (i / (data.length - 1 || 1)) * cW, PT + scaleY(d.value, 0, max, cH)]);
  const line = smoothPath(pts);
  const area = line + ` L ${pts[pts.length - 1][0]},${PT + cH} L ${pts[0][0]},${PT + cH} Z`;
  const id = `lg${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, .25, .5, .75, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">{Math.round(f * max)}</text>
          </g>
        );
      })}

      <path d={area} fill={`url(#${id})`} />
      <path d={line} className="chart-line" stroke={color} />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} opacity=".9" />)}
      {data.map((d, i) => (
        <text key={i} x={PL + (i / (data.length - 1 || 1)) * cW} y={H - 5} className="chart-axis-label" textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  );
}

function BarChart({ data, color, h = 130, showVals = false }) {
  const W = 460, H = h, PL = 32, PT = 8, PB = 24, PR = 8;
  const cW = W - PL - PR, cH = H - PT - PB;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const bW = (cW / Math.max(data.length, 1)) * .6;
  const gap = cW / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      {[0, .5, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">{Math.round(f * max)}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const bH = (d.value / max) * cH;
        const x = PL + i * gap + (gap - bW) / 2;
        const y = PT + cH - bH;

        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={Math.max(bH, 2)} fill={color} rx="4" opacity=".85" />
            {showVals && d.value > 0 && <text x={x + bW / 2} y={y - 4} className="chart-axis-label" textAnchor="middle">{d.value}</text>}
            <text x={x + bW / 2} y={H - 5} className="chart-axis-label" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments }) {
  const R = 55, cx = 70, cy = 70;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  let startA = -Math.PI / 2;

  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(startA), y1 = cy + R * Math.sin(startA);
    startA += angle;
    const x2 = cx + R * Math.cos(startA), y2 = cy + R * Math.sin(startA);
    return { ...seg, d: `M ${cx},${cy} L ${x1},${y1} A ${R},${R} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z` };
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 140 140" width="140" height="140">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} opacity=".9" />)}
        <circle cx={cx} cy={cy} r={R * .55} fill="#ffffff" />
        <text x={cx} y={cy - 6} textAnchor="middle" className="chart-axis-label" fontSize={9}>TOTAL</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill="#16181d" fontSize="20" fontWeight="700">{total}</text>
      </svg>

      <div className="donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="donut-legend-item">
            <div className="donut-legend-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span className="donut-legend-value">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GaugeChart({ value, max = 100 }) {
  const pct = Math.min(value / max, 1);
  const R = 65, cx = 90, cy = 85;
  const startA = Math.PI * .8, endA = Math.PI * 2.2, sweepA = endA - startA;
  const currentA = startA + sweepA * pct;

  const arc = (s, e) => {
    const x1 = cx + R * Math.cos(s), y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e);
    return `M ${x1},${y1} A ${R},${R} 0 ${e - s > Math.PI ? 1 : 0},1 ${x2},${y2}`;
  };

  const col = value > 70 ? "#1D9E75" : value > 40 ? "#BA7517" : "#C0392B";

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 180 110" width="180" height="110">
        <path d={arc(startA, endA)} fill="none" stroke="#eef1f6" strokeWidth="10" strokeLinecap="round" />
        <path d={arc(startA, currentA)} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round" />
      </svg>
      <div className="gauge-value" style={{ color: col }}>{value}%</div>
      <div className="gauge-label">Operational Rate</div>
    </div>
  );
}

function HorizBarChart({ data, color }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="hbar-row">
          <div className="hbar-labels">
            <span className="hbar-name">{d.label}</span>
            <span className="hbar-val">{d.value}</span>
          </div>
          <div className="hbar-track">
            <div className="hbar-fill" style={{ width: `${(d.value / maxVal) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HeatmapCalendar({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="heatmap-grid">
      {data.map((d, i) => {
        const intensity = d.value / max;
        const bg = d.value === 0 ? "#eef1f6" : `rgba(55,138,221,${.15 + intensity * .85})`;
        return <div key={i} className="heatmap-cell" style={{ background: bg }} title={`${d.label}: ${d.value}`} />;
      })}
    </div>
  );
}

function StackedBarChart({ data, h = 130 }) {
  const W = 460, H = h, PL = 32, PT = 8, PB = 24, PR = 8;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxVal = Math.max(...data.map((d) => d.total), 1) * 1.1;
  const bW = (cW / Math.max(data.length, 1)) * .6;
  const gap = cW / Math.max(data.length, 1);
  const COLORS = { ok: "#1D9E75", attention: "#BA7517", maintenance: "#C0392B" };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      {[0, .5, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">{Math.round(f * maxVal)}</text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = PL + i * gap + (gap - bW) / 2;
        let acc = 0;
        const segs = [
          { key: "ok", val: d.ok },
          { key: "attention", val: d.attention },
          { key: "maintenance", val: d.maintenance },
        ];

        return (
          <g key={i}>
            {segs.map((seg) => {
              const bH = (seg.val / maxVal) * cH;
              const y = PT + cH - acc * (cH / maxVal) - bH;
              acc += seg.val;
              return <rect key={seg.key} x={x} y={y} width={bW} height={Math.max(bH, 0)} fill={COLORS[seg.key]} rx={seg.key === "ok" ? "3" : "0"} opacity=".85" />;
            })}
            <text x={x + bW / 2} y={H - 5} className="chart-axis-label" textAnchor="middle">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function SparklineRow({ items }) {
  return (
    <div>
      {items.map((item, i) => {
        const max = Math.max(...item.values, 1);
        const pts = item.values.map((v, j) => [(j / (item.values.length - 1 || 1)) * 100, 30 - (v / max) * 30]);
        const line = smoothPath(pts);

        return (
          <div key={i} className="spark-row">
            <span className="spark-label">{item.label}</span>
            <svg viewBox="0 0 100 30" width={100} height={30} style={{ flex: 1 }}>
              <path d={line} fill="none" stroke={item.color} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="spark-val" style={{ color: item.color }}>
              {item.values[item.values.length - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MultiAreaChart({ series, h = 130 }) {
  const W = 460, H = h, PL = 32, PT = 8, PB = 24, PR = 8;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allVals = series.flatMap((s) => s.data.map((d) => d.value));
  const max = Math.max(...allVals, 1) * 1.1;
  const len = series[0]?.data.length || 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      <defs>
        {series.map((s) => (
          <linearGradient key={s.key} id={`ma${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity=".2" />
            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>

      {[0, .5, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">{Math.round(f * max)}</text>
          </g>
        );
      })}

      {series.map((s) => {
        const pts = s.data.map((d, i) => [PL + (i / (len - 1 || 1)) * cW, PT + scaleY(d.value, 0, max, cH)]);
        const line = smoothPath(pts);
        const area = line + ` L ${pts[pts.length - 1][0]},${PT + cH} L ${pts[0][0]},${PT + cH} Z`;

        return (
          <g key={s.key}>
            <path d={area} fill={`url(#ma${s.key})`} />
            <path d={line} className="chart-line" stroke={s.color} />
          </g>
        );
      })}

      {series[0]?.data.map((d, i) => (
        <text key={i} x={PL + (i / (len - 1 || 1)) * cW} y={H - 5} className="chart-axis-label" textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  );
}

function RadarChart({ data }) {
  const N = data.length, cx = 100, cy = 100, R = 75, levels = 4;
  const angle = (i) => (i / N) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
  const max = Math.max(...data.map((d) => d.value), 1);
  const polyPts = data.map((d, i) => pt(i, (d.value / max) * R).join(",")).join(" ");

  return (
    <svg viewBox="0 0 200 200" width="200" height="200">
      {Array.from({ length: levels }, (_, l) => {
        const r = (R / levels) * (l + 1);
        const pts = Array.from({ length: N }, (_, i) => pt(i, r).join(",")).join(" ");
        return <polygon key={l} points={pts} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />;
      })}
      {data.map((_, i) => <line key={i} x1={cx} y1={cy} x2={pt(i, R)[0]} y2={pt(i, R)[1]} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />)}
      <polygon points={polyPts} fill="rgba(55,138,221,0.15)" stroke="#378ADD" strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 14);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="chart-axis-label" fontSize="9">{d.label}</text>;
      })}
    </svg>
  );
}

function StatSummary({ stats }) {
  return (
    <div>
      {stats.map((s, i) => (
        <div key={i} className="stat-row">
          <span className="stat-row__label">{s.label}</span>
          <span className="stat-row__value" style={{ color: s.color || "var(--text)" }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, subtitle, accentColor, children }) {
  return (
    <div className="an-card">
      <div className="an-card__accent" style={{ background: accentColor }} />
      <div className="an-card__title">{title}</div>
      <div className="an-card__sub">{subtitle}</div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const CHART_CATS = [
  { key: "all",         en: "All Charts", ar: "كل الشارتات", color: "#378ADD" },
  { key: "trends",      en: "Trends",     ar: "الاتجاهات",   color: "#0891B2" },
  { key: "status",      en: "Status",     ar: "الحالة",      color: "#1D9E75" },
  { key: "locations",   en: "Locations",  ar: "المواقع",     color: "#7F77DD" },
  { key: "performance", en: "Performance",ar: "الأداء",      color: "#BA7517" },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function ViewerAnalyticsPage({
  kpis: kpisProp = null,
  devices: devicesProp = null,
  inspections: inspectionsProp = null,
  locationRows: locationRowsProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const [activeCat, setActiveCat] = useState("all");
  const [devices, setDevices] = useState(Array.isArray(devicesProp) ? devicesProp.map(normalizeDevice) : []);
  const [inspections, setInspections] = useState(Array.isArray(inspectionsProp) ? inspectionsProp.map(normalizeInspection) : []);
  const [kpis, setKpis] = useState(kpisProp || {});
  const [locationRows, setLocationRows] = useState(Array.isArray(locationRowsProp) ? locationRowsProp : []);
  const [loading, setLoading] = useState(!Array.isArray(devicesProp) || !Array.isArray(inspectionsProp));
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState([]);

  const t = (en, ar) => lang === "ar" ? ar : en;
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadAnalytics() {
    if (
      Array.isArray(devicesProp) &&
      Array.isArray(inspectionsProp) &&
      Array.isArray(locationRowsProp)
    ) {
      setDevices(devicesProp.map(normalizeDevice));
      setInspections(inspectionsProp.map(normalizeInspection));
      setLocationRows(locationRowsProp);
      setKpis(kpisProp || {});
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const sources = [];

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

      const normalizedDevices = rawDevices.map(normalizeDevice);
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

      const normalizedInspections = rawInspections.map(normalizeInspection);
      sources.push(inspectionsRes.url);

      let normalizedLocations = [];

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

        normalizedLocations = rawLocations.map((loc) => ({
          id: loc.id,
          cluster: loc.cluster || "",
          building: loc.building || "",
          zone: loc.zone || "",
          direction: loc.direction || "",
          devicesCount: rawDevices.filter((d) => {
            const l = d.location || {};
            return (
              (l.cluster || "") === (loc.cluster || "") &&
              (l.building || "") === (loc.building || "") &&
              (l.zone || "") === (loc.zone || "") &&
              (l.direction || "") === (loc.direction || "")
            );
          }).length,
          inspectionsCount: rawInspections.filter((ins) => {
            const l = ins.device?.location || ins.location || {};
            return (
              (l.cluster || "") === (loc.cluster || "") &&
              (l.building || "") === (loc.building || "") &&
              (l.zone || "") === (loc.zone || "") &&
              (l.direction || "") === (loc.direction || "")
            );
          }).length,
        }));

        sources.push(locationsRes.url);
      } catch {
        normalizedLocations = buildLocationRows(normalizedDevices, normalizedInspections);
      }

      const statusCounts = {};
      normalizedDevices.forEach((d) => {
        statusCounts[d.currentStatus] = (statusCounts[d.currentStatus] || 0) + 1;
      });

      const builtKpis = {
        totalDevices: normalizedDevices.length,
        healthyDevices: statusCounts.OK || 0,
        attentionDevices:
          (statusCounts.ATTENTION || 0) +
          (statusCounts.NEEDS_MAINTENANCE || 0) +
          (statusCounts.UNDER_MAINTENANCE || 0) +
          (statusCounts.OUT_OF_SERVICE || 0),
        totalInspections: normalizedInspections.length,
      };

      setDevices(normalizedDevices);
      setInspections(normalizedInspections);
      setLocationRows(normalizedLocations);
      setKpis(kpisProp || builtKpis);
      setSourceInfo(sources);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load analytics data from backend.");
      setDevices([]);
      setInspections([]);
      setLocationRows([]);
      setKpis({});
      setSourceInfo([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const monthly = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const counts = new Array(12).fill(0);

    inspections.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!isNaN(d)) counts[d.getMonth()]++;
    });

    return months.map((label, i) => ({ label, value: counts[i] }));
  }, [inspections]);

  const weekly = useMemo(() => {
    const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const counts = new Array(7).fill(0);

    inspections.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!isNaN(d)) counts[(d.getDay() + 6) % 7]++;
    });

    return days.map((label, i) => ({ label, value: counts[i] }));
  }, [inspections]);

  const heatmap = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (27 - i));
      const s = d.toISOString().split("T")[0];

      return {
        label: s,
        value: inspections.filter((ins) => {
          const raw = ins.inspectedAt || ins.createdAt || "";
          return String(raw).startsWith(s);
        }).length,
      };
    });
  }, [inspections]);

  const statusCounts = useMemo(() => {
    const m = {};
    devices.forEach((d) => {
      m[d.currentStatus] = (m[d.currentStatus] || 0) + 1;
    });
    return m;
  }, [devices]);

  const topLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.devicesCount || 0) - (a.devicesCount || 0))
      .slice(0, 6)
      .map((l) => ({
        label: (l.building || l.cluster || `LOC-${l.id}`).slice(0, 10),
        value: l.devicesCount || 0,
      }));
  }, [locationRows]);

  const inspLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.inspectionsCount || 0) - (a.inspectionsCount || 0))
      .slice(0, 6)
      .map((l) => ({
        label: (l.building || l.cluster || `LOC-${l.id}`).slice(0, 10),
        value: l.inspectionsCount || 0,
      }));
  }, [locationRows]);

  const total = kpis.totalDevices ?? devices.length;
  const healthy = kpis.healthyDevices ?? (statusCounts.OK || 0);
  const attention = kpis.attentionDevices ?? (
    (statusCounts.ATTENTION || 0) +
    (statusCounts.NEEDS_MAINTENANCE || 0) +
    (statusCounts.UNDER_MAINTENANCE || 0) +
    (statusCounts.OUT_OF_SERVICE || 0)
  );
  const totalInsp = kpis.totalInspections ?? inspections.length;
  const healthRate = total ? Math.round((healthy / total) * 100) : 0;

  const donutData = [
    { label: t("Operational", "تعمل"), value: statusCounts.OK || 0, color: "#1D9E75" },
    { label: t("Attention", "تحتاج متابعة"), value: statusCounts.ATTENTION || 0, color: "#BA7517" },
    { label: t("Needs Maint.", "تحتاج صيانة"), value: statusCounts.NEEDS_MAINTENANCE || 0, color: "#C0392B" },
    { label: t("Under Maint.", "تحت الصيانة"), value: statusCounts.UNDER_MAINTENANCE || 0, color: "#378ADD" },
    { label: t("Out of Service", "خارج الخدمة"), value: statusCounts.OUT_OF_SERVICE || 0, color: "#9aa0ad" },
  ];

  const radarData = [
    { label: "Ops", value: statusCounts.OK || 0 },
    { label: "Attn", value: statusCounts.ATTENTION || 0 },
    { label: "Maint", value: (statusCounts.NEEDS_MAINTENANCE || 0) + (statusCounts.UNDER_MAINTENANCE || 0) },
    { label: "Insp", value: Math.min(totalInsp, 100) },
    { label: "Locs", value: locationRows.length },
    { label: "Total", value: total },
  ];

  const sparklines = [
    { label: t("Healthy", "تعمل"), values: monthly.slice(6).map((m) => Math.max(m.value, 1)), color: "#1D9E75" },
    { label: t("Inspections", "فحوصات"), values: monthly.slice(6).map((m) => m.value), color: "#378ADD" },
    { label: t("Attention", "متابعة"), values: monthly.slice(6).map((_, i) => Math.floor(i * .5 + 1)), color: "#BA7517" },
  ];

  const multiSeries = [
    {
      key: "inspections",
      color: "#378ADD",
      data: monthly.slice(0, 8).map((m) => ({ label: m.label, value: m.value })),
    },
    {
      key: "devices",
      color: "#1D9E75",
      data: monthly.slice(0, 8).map((m, i) => ({ label: m.label, value: Math.max(m.value - i, 0) })),
    },
  ];

  const stackedMonthly = useMemo(() => {
    return ["Jan","Feb","Mar","Apr","May","Jun"].map((label, i) => {
      const devs = devices.filter((d) => {
        const dt = new Date(d.lastInspectionAt);
        return !isNaN(dt) && dt.getMonth() === i;
      });

      const ok = devs.filter((d) => d.currentStatus === "OK").length;
      const att = devs.filter((d) => d.currentStatus === "ATTENTION").length;
      const maintenance = devs.filter((d) =>
        ["NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(d.currentStatus)
      ).length;

      return { label, ok, attention: att, maintenance, total: ok + att + maintenance };
    });
  }, [devices]);

  const summaryStats = [
    { label: t("Total Devices", "إجمالي الأجهزة"), value: total, color: "#16181d" },
    { label: t("Operational", "تعمل"), value: healthy, color: "#1D9E75" },
    { label: t("Need Attention", "تحتاج متابعة"), value: attention, color: "#BA7517" },
    { label: t("Total Inspections", "إجمالي الفحوصات"), value: totalInsp, color: "#378ADD" },
    { label: t("Locations", "المواقع"), value: locationRows.length, color: "#7F77DD" },
    { label: t("Operational Rate", "معدل التشغيل"), value: `${healthRate}%`, color: healthRate > 70 ? "#1D9E75" : "#BA7517" },
    { label: t("Avg Insp / Device", "متوسط فحص/جهاز"), value: total ? (totalInsp / total).toFixed(1) : "—", color: "#9aa0ad" },
  ];

  const showTrends = activeCat === "all" || activeCat === "trends";
  const showStatus = activeCat === "all" || activeCat === "status";
  const showLocations = activeCat === "all" || activeCat === "locations";
  const showPerformance = activeCat === "all" || activeCat === "performance";

  return (
    <>
      <style>{ANALYTICS_CSS}</style>

      <div className="analytics-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="an-topbar">
          <div>
            <div className="an-topbar__title">{t("Viewer Analytics", "تحليلات المشاهد")}</div>
            <div className="an-topbar__sub">
              {t("Read-only operational analytics from backend data", "تحليلات تشغيلية للعرض فقط من بيانات الباك إند")}
            </div>
          </div>

          <div className="an-actions">
            <button className="an-refresh-btn" onClick={loadAnalytics} disabled={loading}>
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="an-alert an-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}

        {!!sourceInfo.length && !error && (
          <div className="an-alert an-alert--info">
            {t("Connected sources: ", "المصادر المتصلة: ")}
            <strong>{sourceInfo.join(" | ")}</strong>
          </div>
        )}

        {loading ? (
          <div className="an-loading">
            <div className="an-loading-spinner" />
            {t("Loading analytics data from backend...", "جارٍ تحميل بيانات التحليلات من الباك إند...")}
          </div>
        ) : (
          <>
            <div className="an-pills">
              {CHART_CATS.map((cat) => (
                <div
                  key={cat.key}
                  className={`an-pill${activeCat === cat.key ? " an-pill--active" : ""}`}
                  onClick={() => setActiveCat(cat.key)}
                >
                  <div className="an-pill-dot" style={{ background: cat.color }} />
                  {lang === "ar" ? cat.ar : cat.en}
                </div>
              ))}
            </div>

            {showTrends && (
              <div className="ag ag--3">
                <Card
                  title={t("Monthly Inspections", "الفحوصات الشهرية")}
                  subtitle={t("Total inspections per month", "عدد الفحوصات لكل شهر")}
                  accentColor="#378ADD"
                >
                  <LineChart data={monthly} color="#378ADD" />
                </Card>

                <Card
                  title={t("Operational Rate", "معدل التشغيل")}
                  subtitle={t("Fleet readiness gauge", "نسبة الأجهزة الجاهزة")}
                  accentColor="#1D9E75"
                >
                  <GaugeChart value={healthRate} />
                </Card>

                <Card
                  title={t("Key Metrics", "المؤشرات الرئيسية")}
                  subtitle={t("Last 6 months trend", "آخر 6 أشهر")}
                  accentColor="#0891B2"
                >
                  <SparklineRow items={sparklines} />
                </Card>
              </div>
            )}

            {showStatus && (
              <div className="ag ag--equal">
                <Card
                  title={t("Status Distribution", "توزيع الحالات")}
                  subtitle={t("Devices by operational status", "تصنيف الأجهزة")}
                  accentColor="#7F77DD"
                >
                  <DonutChart segments={donutData} />
                </Card>

                <Card
                  title={t("Device Status Monthly", "حالة الأجهزة شهرياً")}
                  subtitle={t("Stacked breakdown", "تحلل الحالات")}
                  accentColor="#C0392B"
                >
                  <StackedBarChart data={stackedMonthly} />
                </Card>

                <Card
                  title={t("Fleet Radar", "رادار الأسطول")}
                  subtitle={t("Multi-axis overview", "نظرة شاملة")}
                  accentColor="#1D9E75"
                >
                  <div className="radar-wrap">
                    <RadarChart data={radarData} />
                  </div>
                </Card>
              </div>
            )}

            {showLocations && (
              <div className="ag ag--equal">
                <Card
                  title={t("Devices by Location", "الأجهزة بالموقع")}
                  subtitle={t("Top locations by device count", "أعلى المواقع")}
                  accentColor="#BA7517"
                >
                  <BarChart data={topLocs} color="#BA7517" />
                </Card>

                <Card
                  title={t("Inspections by Location", "الفحوصات بالموقع")}
                  subtitle={t("Most frequently inspected", "أكثر المواقع فحصاً")}
                  accentColor="#7F77DD"
                >
                  <HorizBarChart data={inspLocs} color="#7F77DD" />
                </Card>

                <Card
                  title={t("Inspection Heatmap", "خريطة حرارة الفحوصات")}
                  subtitle={t("Daily activity – last 28 days", "آخر 28 يوم")}
                  accentColor="#0891B2"
                >
                  <HeatmapCalendar data={heatmap} />
                </Card>
              </div>
            )}

            {showPerformance && (
              <div className="ag ag--2-1">
                <Card
                  title={t("Weekly Inspection Pattern", "فحوصات أيام الأسبوع")}
                  subtitle={t("Frequency by day of week", "توزيع الفحوصات")}
                  accentColor="#0891B2"
                >
                  <BarChart data={weekly} color="#0891B2" h={130} showVals />
                </Card>

                <Card
                  title={t("Inspections vs Devices", "مقارنة الفحوصات والأجهزة")}
                  subtitle={t("Dual time-series", "مسارين زمنيين")}
                  accentColor="#378ADD"
                >
                  <MultiAreaChart series={multiSeries} />
                </Card>
              </div>
            )}

            <div className="ag ag--1">
              <Card
                title={t("Command Summary", "ملخص القيادة")}
                subtitle={t("Full KPI digest", "المؤشرات الرئيسية الكاملة")}
                accentColor="#1D9E75"
              >
                <StatSummary stats={summaryStats} />
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default ViewerAnalyticsPage;