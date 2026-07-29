import React, { useEffect, useMemo, useState } from "react";
import smartitLogo from "../../assets/smartit-logo-transparent.png";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const ANALYTICS_CSS = `
.analytics-root *, .analytics-root *::before, .analytics-root *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.analytics-root {
  --primary: #4f46e5;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --primary-light: #818cf8;
  --accent-alt: #0ea5e9;
  --surface:  #ffffff;
  --surface2: #f7f8fa;
  --border:   rgba(0,0,0,0.07);
  --text:     #0f172a;
  --muted:    #475569;
  --faint:    #94a3b8;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #f1f5f9;
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
.an-topbar__title { font-size: 22px; font-weight: 900; color: var(--text); letter-spacing: -0.02em; }
.an-topbar__sub { font-size: 12px; color: var(--faint); margin-top: 4px; }
.an-actions { display: flex; gap: 10px; align-items: center; }
.an-refresh-btn {
  height: 38px;
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: .18s ease;
}
.an-refresh-btn:hover { transform: translateY(-1px); background: var(--primary); }
.an-refresh-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }

/* alerts */
.an-alert { margin-bottom: 14px; border-radius: 12px; padding: 12px 14px; font-size: 13px; border: 1px solid transparent; }
.an-alert--error { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }

/* pills */
.an-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 22px; }
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
  font-weight: 700;
  transition: all .15s;
  white-space: nowrap;
  user-select: none;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.an-pill:hover { border-color: var(--primary); color: var(--text); }
.an-pill--active { background: rgba(79, 70, 229, 0.08); border-color: var(--primary); color: var(--primary); }
.an-pill-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

/* KPI strip */
.an-kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.an-kpi {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
}
.an-kpi::before { content: ""; position: absolute; inset: 0 0 auto 0; height: 3px; background: var(--kpi-color, var(--primary)); }
.an-kpi__label { font-size: 11px; color: var(--faint); text-transform: uppercase; font-weight: 900; letter-spacing: .05em; }
.an-kpi__value { margin-top: 8px; font-size: 28px; line-height: 1; font-weight: 950; color: var(--kpi-color, var(--text)); }
.an-kpi__note { margin-top: 6px; font-size: 11px; color: var(--faint); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* grid */
.ag { display: grid; gap: 14px; margin-bottom: 14px; }
.ag--3     { grid-template-columns: 2fr 1fr 1fr; }
.ag--equal { grid-template-columns: 1fr 1fr 1fr; }
.ag--2-1   { grid-template-columns: 2fr 1fr; }
.ag--1     { grid-template-columns: 1fr; }

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
.an-card__accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 14px 14px 0 0; }
.an-card__title { font-size: 13px; font-weight: 800; color: var(--text); margin-bottom: 3px; }
.an-card__sub { font-size: 12px; color: var(--faint); margin-bottom: 16px; }

/* charts */
.chart-svg { width: 100%; height: auto; display: block; }
.chart-grid-line { stroke: rgba(0,0,0,0.06); stroke-width: .5; }
.chart-axis-label { fill: #9aa0ad; font-size: 9px; font-family: "Segoe UI", system-ui, sans-serif; }
.chart-line { fill: none; stroke-width: 2; stroke-linecap: round; }

/* donut */
.donut-wrap { display: flex; align-items: center; gap: 16px; }
.donut-legend { display: flex; flex-direction: column; gap: 8px; flex: 1; min-width: 0; }
.donut-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); }
.donut-legend-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.donut-legend-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.donut-legend-value { margin-left: auto; font-weight: 800; color: var(--text); font-size: 13px; }
.analytics-root[dir="rtl"] .donut-legend-value { margin-left: 0; margin-right: auto; }

/* gauge */
.gauge-wrap { display: flex; flex-direction: column; align-items: center; }
.gauge-value { font-size: 28px; font-weight: 900; margin-top: -16px; letter-spacing: -0.02em; }
.gauge-label { font-size: 11px; color: var(--faint); margin-top: 3px; }

/* horizontal bars */
.hbar-row { margin-bottom: 11px; }
.hbar-row:last-child { margin-bottom: 0; }
.hbar-labels { display: flex; justify-content: space-between; margin-bottom: 5px; gap: 8px; }
.hbar-name { font-size: 12px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hbar-val { font-size: 12px; font-weight: 800; color: var(--text); }
.hbar-track { height: 6px; background: var(--surface2); border-radius: 999px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 999px; transition: width .6s; }

/* heatmap */
.heatmap-grid { display: grid; grid-template-columns: repeat(14, 1fr); gap: 4px; }
.heatmap-cell { aspect-ratio: 1; border-radius: 3px; }

/* spark */
.spark-row { margin-bottom: 13px; display: flex; align-items: center; gap: 10px; }
.spark-row:last-child { margin-bottom: 0; }
.spark-label { width: 90px; font-size: 12px; color: var(--muted); flex-shrink: 0; }
.spark-val { font-size: 15px; font-weight: 900; min-width: 36px; text-align: right; flex-shrink: 0; }

/* stat summary */
.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 0 18px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-bottom: 0.5px solid var(--border); gap: 10px; }
.stat-row:last-child { border-bottom: none; }
.stat-row__label { font-size: 12px; color: var(--muted); }
.stat-row__value { font-size: 14px; font-weight: 900; }

.radar-wrap { display: flex; justify-content: center; }

.an-loading { padding: 40px; text-align: center; color: var(--faint); font-size: 13px; }
.an-loading-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  border-top-color: #4f46e5;
  margin: 0 auto 12px;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }



/* clickable cards */
.an-kpi, .an-card { transition: .18s ease; }
.an-kpi--clickable, .an-card--clickable { cursor: pointer; }
.an-kpi--clickable:hover, .an-card--clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(15,23,42,0.09);
  border-color: rgba(79,70,229,0.22);
}
.an-card__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
.an-click-hint {
  font-size: 10px;
  color: var(--faint);
  font-weight: 900;
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 999px;
  background: var(--surface2);
  border: .5px solid var(--border);
}
.an-section-head {
  margin: 22px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.an-section-title {
  font-size: 17px;
  font-weight: 950;
  color: var(--text);
  letter-spacing: -0.02em;
}
.an-section-sub {
  color: var(--faint);
  font-size: 12px;
  margin-top: 4px;
}
.an-section-badge {
  background: #fff;
  border: .5px solid var(--border);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 900;
  color: var(--muted);
}

/* details modal */
.an-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, .54);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 22px;
}
.an-modal {
  width: min(1120px, 100%);
  max-height: 90vh;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 30px 90px rgba(15,23,42,.30);
  display: flex;
  flex-direction: column;
}
.an-modal-head {
  padding: 18px 20px;
  border-bottom: .5px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}
.an-modal-title {
  font-size: 18px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 4px;
}
.an-modal-sub {
  color: var(--faint);
  font-size: 12px;
  line-height: 1.5;
}
.an-modal-close {
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 13px;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}
.an-modal-tools {
  padding: 13px 20px;
  border-bottom: .5px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.an-modal-search {
  width: min(380px, 100%);
  height: 40px;
  border-radius: 13px;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
  padding: 0 13px;
  color: var(--text);
  outline: none;
  font-size: 13px;
}
.an-modal-search:focus {
  background: #fff;
  border-color: #4f46e5;
  box-shadow: 0 0 0 4px rgba(79,70,229,.12);
}
.an-modal-count {
  font-size: 12px;
  color: var(--muted);
  font-weight: 900;
  display: inline-flex;
  align-items: center;
}
.an-modal-body {
  padding: 0 20px 20px;
  overflow: auto;
}
.an-detail-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
  min-width: 860px;
}
.an-detail-table th {
  text-align: left;
  color: var(--faint);
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 0 12px;
  white-space: nowrap;
}
.analytics-root[dir="rtl"] .an-detail-table th { text-align: right; }
.an-detail-table td {
  background: #f8fafc;
  border-top: .5px solid var(--border);
  border-bottom: .5px solid var(--border);
  padding: 12px;
  color: var(--text);
  font-size: 12px;
  font-weight: 650;
  vertical-align: middle;
  max-width: 300px;
  overflow-wrap: anywhere;
}
.an-detail-table tr td:first-child {
  border-left: .5px solid var(--border);
  border-radius: 14px 0 0 14px;
}
.an-detail-table tr td:last-child {
  border-right: .5px solid var(--border);
  border-radius: 0 14px 14px 0;
}
.analytics-root[dir="rtl"] .an-detail-table tr td:first-child {
  border-right: .5px solid var(--border);
  border-left: 0;
  border-radius: 0 14px 14px 0;
}
.analytics-root[dir="rtl"] .an-detail-table tr td:last-child {
  border-left: .5px solid var(--border);
  border-right: 0;
  border-radius: 14px 0 0 14px;
}
.an-empty {
  padding: 30px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
  border: 1px dashed rgba(148,163,184,.6);
  border-radius: 18px;
  margin-top: 18px;
}

/* Mobile view */
@media (max-width: 1250px) {
  .an-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ag--3, .ag--equal, .ag--2-1 { grid-template-columns: 1fr; }
}
@media (max-width: 760px) {
  .analytics-root { padding: 16px 12px; }
  .an-topbar { align-items: stretch; }
  .an-actions { width: 100%; }
  .an-refresh-btn { width: 100%; }
  .an-topbar__title { font-size: 20px; }
  .an-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .an-kpi { padding: 14px; }
  .an-kpi__value { font-size: 24px; }
  .an-pills { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .an-pill { justify-content: center; padding: 10px 12px; }
  .an-card { padding: 16px; border-radius: 14px; }
  .donut-wrap { flex-direction: column; align-items: stretch; }
  .donut-wrap svg { align-self: center; }
  .heatmap-grid { grid-template-columns: repeat(7, 1fr); }
  .spark-label { width: 74px; }
  .stat-grid { grid-template-columns: 1fr; }

  .an-modal-backdrop { padding: 0; align-items: end; }
  .an-modal { border-radius: 22px 22px 0 0; max-height: 92vh; }
  .an-modal-tools { flex-direction: column; }
  .an-modal-search { width: 100%; }
  .an-detail-table { min-width: 0; border-spacing: 0; }
  .an-detail-table thead { display: none; }
  .an-detail-table,
  .an-detail-table tbody,
  .an-detail-table tr,
  .an-detail-table td { display: block; width: 100%; }
  .an-detail-table tr { border-bottom: 1px solid var(--border); padding: 12px 0; }
  .an-detail-table td {
    border: 0 !important;
    border-radius: 0 !important;
    padding: 8px 0;
    display: grid;
    grid-template-columns: 116px 1fr;
    gap: 10px;
    background: #fff;
  }
  .an-detail-table td::before {
    content: attr(data-label);
    font-size: 10px;
    font-weight: 950;
    color: var(--faint);
    text-transform: uppercase;
  }
}
@media (max-width: 430px) {
  .analytics-root { padding: 12px 10px; }
  .an-kpis { grid-template-columns: 1fr; }
  .an-pills { grid-template-columns: 1fr; }
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

function numberText(value, lang = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB").format(Number(value || 0));
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
    "https://acess-backend-production-8856.up.railway.app";

  return raw.replace(/\/+$/, "");
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  const bags = [payload, payload?.data, payload?.result, payload?.results, payload?.payload, payload?.response].filter(Boolean);

  for (const bag of bags) {
    if (Array.isArray(bag)) return bag;

    for (const key of keys) {
      if (Array.isArray(bag?.[key])) return bag[key];
    }

    if (Array.isArray(bag?.data)) return bag.data;
    if (Array.isArray(bag?.items)) return bag.items;
    if (Array.isArray(bag?.rows)) return bag.rows;
    if (Array.isArray(bag?.records)) return bag.records;
  }

  return [];
}

function normalizeStatus(status, fallback = "OK") {
  const s = String(status || fallback).trim().toUpperCase();

  if (s === "ACTIVE" || s === "COMPLETED" || s === "DONE") return "OK";
  if (s === "NOT_OK" || s === "PARTIAL" || s === "NOT_REACHABLE") return "ATTENTION";
  if (s === "MAINTENANCE" || s === "NEEDS_MAINT") return "NEEDS_MAINTENANCE";
  if (s === "IN_PROGRESS") return "UNDER_MAINTENANCE";

  if (
    [
      "OK",
      "ATTENTION",
      "NEEDS_MAINTENANCE",
      "UNDER_MAINTENANCE",
      "OUT_OF_SERVICE",
      "INACTIVE",
    ].includes(s)
  ) {
    return s;
  }

  return "OK";
}

function inspectionStatus(status) {
  const s = String(status || "NOT_REACHABLE").trim().toUpperCase();
  if (["OK", "NOT_OK", "PARTIAL", "NOT_REACHABLE"].includes(s)) return s;
  if (s === "GOOD" || s === "DONE") return "OK";
  if (s === "BAD" || s === "FAILED") return "NOT_OK";
  return "NOT_REACHABLE";
}

function assetLocation(asset = {}) {
  const loc = asset.location || {};
  return {
    cluster: loc.cluster || asset.cluster || "",
    building: loc.building || asset.building || "",
    zone: loc.zone || asset.zone || "",
    direction: loc.direction || asset.direction || "",
    lane: loc.lane || asset.lane || "",
    type: loc.type || asset.type || "",
  };
}

function locKey(location = {}) {
  return [location.cluster || "", location.building || "", location.zone || "", location.direction || "", location.lane || ""].join("|");
}

function locLabel(location = {}, fallback = "Location") {
  return [location.building, location.zone, location.direction, location.cluster].filter(Boolean).join(" · ") || fallback;
}

function getDate(item, keys = ["inspectedAt", "lastInspectionAt", "createdAt", "updatedAt"]) {
  for (const key of keys) {
    if (!item?.[key]) continue;
    const d = new Date(item[key]);
    if (!Number.isNaN(d.getTime())) return item[key];
  }
  return null;
}

function monthLabel(index) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
}

function normalizeDevice(item = {}) {
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];
  const location = assetLocation(item);

  return {
    id: item.id,
    assetType: "DEVICE",
    code: item.deviceCode || item.code || item.barcode || `DEV-${item.id || ""}`,
    name: item.deviceName || item.name || "Unknown device",
    currentStatus: normalizeStatus(item.currentStatus || item.status || item.excelStatus),
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || inspectionsArray[0]?.inspectedAt || null,
    inspectionsCount: item.inspectionsCount ?? item._count?.inspections ?? inspectionsArray.length ?? 0,
    location,
  };
}

function normalizeGate(item = {}) {
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];
  const location = assetLocation(item);

  return {
    id: item.id,
    assetType: "GATE",
    code: item.gateNo || item.gateNumber || item.no || item.code || `GATE-${item.id || ""}`,
    name: item.gateName || item.name || item.building || `Gate ${item.gateNo || item.id || ""}`,
    gateNo: item.gateNo || item.gateNumber || item.no || "",
    secretCode: item.secretCode || item.secret || "",
    currentStatus: normalizeStatus(item.currentStatus || item.status || item.gateStatus),
    status: String(item.status || "ACTIVE").toUpperCase(),
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || inspectionsArray[0]?.inspectedAt || null,
    inspectionsCount: item.inspectionsCount ?? item._count?.inspections ?? inspectionsArray.length ?? 0,
    tasksCount: item.tasksCount ?? item._count?.tasks ?? 0,
    location,
  };
}

function normalizeInspection(item = {}) {
  const device = item.device || null;
  const gate = item.gate || null;
  const isGate = Boolean(item.gateId || gate?.id || String(item.assetType || "").toUpperCase() === "GATE");
  const asset = isGate ? gate || {} : device || {};
  const location = assetLocation(asset.location ? asset : { ...asset, location: item.location || item.deviceLocation || item.gateLocation });

  return {
    id: item.id,
    assetType: isGate ? "GATE" : "DEVICE",
    deviceId: item.deviceId || device?.id || null,
    gateId: item.gateId || gate?.id || null,
    inspectionStatus: inspectionStatus(item.inspectionStatus || item.status || item.result),
    inspectedAt: item.inspectedAt || item.createdAt || item.updatedAt || null,
    createdAt: item.createdAt || item.inspectedAt || item.updatedAt || null,
    assetCode: isGate
      ? gate?.gateNo || gate?.gateNumber || item.gateNo || `GATE-${item.gateId || ""}`
      : device?.deviceCode || device?.code || item.deviceCode || `DEV-${item.deviceId || ""}`,
    assetName: isGate
      ? gate?.building || gate?.name || item.gateName || "Gate"
      : device?.deviceName || device?.name || item.deviceName || "Device",
    location,
  };
}

function buildLocationRows(devices, gates, inspections, backendLocations = []) {
  const map = new Map();

  function ensure(location = {}) {
    const key = locKey(location);
    if (!map.has(key)) {
      map.set(key, {
        id: key || `loc-${map.size + 1}`,
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
        lane: location.lane || "",
        devicesCount: 0,
        gatesCount: 0,
        inspectionsCount: 0,
        deviceInspections: 0,
        gateInspections: 0,
      });
    }
    return map.get(key);
  }

  backendLocations.forEach((loc) => {
    const location = assetLocation(loc);
    const row = ensure(location);
    row.id = loc.id || row.id;
    row.devicesCount = Math.max(row.devicesCount, Number(loc.devicesCount || loc._count?.devices || 0));
    row.gatesCount = Math.max(row.gatesCount, Number(loc.gatesCount || loc._count?.gates || 0));
    row.inspectionsCount = Math.max(row.inspectionsCount, Number(loc.inspectionsCount || 0));
  });

  devices.forEach((d) => {
    ensure(d.location).devicesCount += 1;
  });

  gates.forEach((g) => {
    ensure(g.location).gatesCount += 1;
  });

  inspections.forEach((ins) => {
    const row = ensure(ins.location);
    row.inspectionsCount += 1;
    if (ins.assetType === "GATE") row.gateInspections += 1;
    else row.deviceInspections += 1;
  });

  return Array.from(map.values()).map((row) => ({
    ...row,
    assetsCount: Number(row.devicesCount || 0) + Number(row.gatesCount || 0),
  }));
}

async function fetchJsonCandidates(candidates, token) {
  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText} @ ${url}`);
        continue;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      return { url, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found.");
}

async function fetchOptional(label, candidates, token) {
  try {
    const result = await fetchJsonCandidates(candidates, token);
    return { label, ok: true, data: result.data, error: "" };
  } catch (error) {
    return { label, ok: false, data: [], error: error?.message || `Failed to load ${label}` };
  }
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
            <span className="donut-legend-label">{s.label}</span>
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
  const col = value > 70 ? "#10b981" : value > 40 ? "#f59e0b" : "#ef4444";

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
            <span className="hbar-name" title={d.fullLabel || d.label}>{d.label}</span>
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
        const bg = d.value === 0 ? "#eef1f6" : `rgba(79, 70, 229, ${.15 + intensity * .85})`;
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
  const COLORS = { devices: "#4f46e5", gates: "#0ea5e9", faults: "#ef4444" };

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
          { key: "devices", val: d.devices },
          { key: "gates", val: d.gates },
          { key: "faults", val: d.faults },
        ];
        return (
          <g key={i}>
            {segs.map((seg) => {
              const bH = (seg.val / maxVal) * cH;
              const y = PT + cH - acc * (cH / maxVal) - bH;
              acc += seg.val;
              return <rect key={seg.key} x={x} y={y} width={bW} height={Math.max(bH, 0)} fill={COLORS[seg.key]} rx="3" opacity=".85" />;
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
            <span className="spark-val" style={{ color: item.color }}>{item.values[item.values.length - 1]}</span>
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
      <polygon points={polyPts} fill="rgba(79, 70, 229, 0.15)" stroke="#4f46e5" strokeWidth="2" />
      {data.map((d, i) => {
        const [x, y] = pt(i, R + 14);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="chart-axis-label" fontSize="9">{d.label}</text>;
      })}
    </svg>
  );
}


function StatSummary({ stats, onClick, lang = "en" }) {
  return (
    <div className="stat-grid">
      {stats.map((s, i) => (
        <button
          type="button"
          key={i}
          className={`stat-row ${s.onClick || onClick ? "an-kpi--clickable" : ""}`}
          onClick={s.onClick || onClick || undefined}
          style={{ background: "transparent", borderLeft: 0, borderRight: 0, borderTop: 0, width: "100%", textAlign: "inherit" }}
        >
          <span className="stat-row__label">{s.label}</span>
          <span className="stat-row__value" style={{ color: s.color || "var(--text)" }}>{s.value}</span>
        </button>
      ))}
    </div>
  );
}

function Card({ title, subtitle, accentColor, children, onClick, lang = "en" }) {
  const clickable = typeof onClick === "function";

  return (
    <div
      className={`an-card ${clickable ? "an-card--clickable" : ""}`}
      onClick={clickable ? onClick : undefined}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="an-card__accent" style={{ background: accentColor }} />
      <div className="an-card__top">
        <div>
          <div className="an-card__title">{title}</div>
          <div className="an-card__sub">{subtitle}</div>
        </div>
        {clickable ? <div className="an-click-hint">{lang === "ar" ? "تفاصيل" : "Details"}</div> : null}
      </div>
      {children}
    </div>
  );
}

function KpiBox({ label, value, note, color, lang, onClick }) {
  const clickable = typeof onClick === "function";

  return (
    <button
      type="button"
      className={`an-kpi ${clickable ? "an-kpi--clickable" : ""}`}
      style={{ "--kpi-color": color, textAlign: "inherit" }}
      onClick={onClick}
    >
      <div className="an-kpi__label">{label}</div>
      <div className="an-kpi__value">{numberText(value, lang)}</div>
      <div className="an-kpi__note">{note}</div>
    </button>
  );
}

function SectionHead({ title, subtitle, badge }) {
  return (
    <div className="an-section-head">
      <div>
        <div className="an-section-title">{title}</div>
        <div className="an-section-sub">{subtitle}</div>
      </div>
      {badge ? <div className="an-section-badge">{badge}</div> : null}
    </div>
  );
}

function AnalyticsDetailModal({ detail, onClose, lang }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [detail?.title]);

  useEffect(() => {
    if (!detail) return undefined;
    const handler = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [detail, onClose]);

  if (!detail) return null;

  const rows = Array.isArray(detail.rows) ? detail.rows : [];
  const columns = Array.isArray(detail.columns) ? detail.columns : [];
  const q = query.trim().toLowerCase();
  const filteredRows = !q
    ? rows
    : rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));

  return (
    <div className="an-modal-backdrop" onMouseDown={onClose}>
      <div className="an-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="an-modal-head">
          <div>
            <div className="an-modal-title">{detail.title}</div>
            <div className="an-modal-sub">{detail.subtitle}</div>
          </div>
          <button type="button" className="an-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="an-modal-tools">
          <input
            className="an-modal-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث داخل التفاصيل..." : "Search details..."}
          />
          <div className="an-modal-count">
            {lang === "ar" ? "النتائج: " : "Results: "}{numberText(filteredRows.length, lang)}
          </div>
        </div>

        <div className="an-modal-body">
          {filteredRows.length === 0 ? (
            <div className="an-empty">{lang === "ar" ? "لا توجد بيانات." : "No data found."}</div>
          ) : (
            <table className="an-detail-table">
              <thead>
                <tr>
                  {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, rowIndex) => (
                  <tr key={row.id || row.key || rowIndex}>
                    {columns.map((column) => (
                      <td key={column.key} data-label={column.label}>
                        {column.render ? column.render(row, rowIndex) : row[column.key] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const CHART_CATS = [
  { key: "all",         en: "All Analytics", ar: "كل التحليلات", color: "#4f46e5" },
  { key: "devices",     en: "Devices",       ar: "الأجهزة",       color: "#4f46e5" },
  { key: "gates",       en: "Gates",         ar: "البوابات",      color: "#06b6d4" },
  { key: "inspections", en: "Inspections",   ar: "الفحوصات",     color: "#10b981" },
  { key: "locations",   en: "Locations",     ar: "المواقع",       color: "#818cf8" },
  { key: "performance", en: "Performance",   ar: "الأداء",        color: "#f59e0b" },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function ViewerAnalyticsPage({ lang = "en", apiBaseUrl = "" }) {
  const [activeCat, setActiveCat] = useState("all");
  const [devices, setDevices] = useState([]);
  const [gates, setGates] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [locationRows, setLocationRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  const t = (en, ar) => lang === "ar" ? ar : en;
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError("");

      const token = pickToken();

      const endpoints = {
        devices: [
          `${baseUrl}/devices`,
          `${baseUrl}/api/devices`,
          `${baseUrl}/viewer/devices`,
          `${baseUrl}/dashboard/devices`,
          `${baseUrl}/dashboard/viewer/devices`,
        ],
        gates: [
          `${baseUrl}/gates`,
          `${baseUrl}/api/gates`,
          `${baseUrl}/viewer/gates`,
          `${baseUrl}/viewer-gates`,
          `${baseUrl}/dashboard/gates`,
          `${baseUrl}/dashboard/viewer/gates`,
        ],
        inspections: [
          `${baseUrl}/inspections`,
          `${baseUrl}/api/inspections`,
          `${baseUrl}/viewer/inspections`,
          `${baseUrl}/dashboard/inspections`,
          `${baseUrl}/dashboard/viewer/inspections`,
        ],
        locations: [
          `${baseUrl}/locations`,
          `${baseUrl}/api/locations`,
          `${baseUrl}/viewer/locations`,
          `${baseUrl}/dashboard/locations`,
          `${baseUrl}/dashboard/viewer/locations`,
        ],
      };

      const [devicesPack, gatesPack, inspectionsPack, locationsPack] = await Promise.all([
        fetchOptional("devices", endpoints.devices, token),
        fetchOptional("gates", endpoints.gates, token),
        fetchOptional("inspections", endpoints.inspections, token),
        fetchOptional("locations", endpoints.locations, token),
      ]);

      const normalizedDevices = extractArray(devicesPack.data, ["devices"]).map(normalizeDevice);
      const normalizedGates = extractArray(gatesPack.data, ["gates"]).map(normalizeGate);
      const normalizedInspections = extractArray(inspectionsPack.data, ["inspections"]).map(normalizeInspection);
      const normalizedLocations = extractArray(locationsPack.data, ["locations"]);

      setDevices(normalizedDevices);
      setGates(normalizedGates);
      setInspections(normalizedInspections);
      setLocationRows(buildLocationRows(normalizedDevices, normalizedGates, normalizedInspections, normalizedLocations));

      const criticalFailed = !devicesPack.ok && !gatesPack.ok && !inspectionsPack.ok;
      if (criticalFailed) {
        setError(t("No analytics data could be loaded from backend.", "لم يتم تحميل بيانات التحليلات من الباك إند."));
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load analytics data from backend.");
      setDevices([]);
      setGates([]);
      setInspections([]);
      setLocationRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const allAssets = useMemo(() => [...devices, ...gates], [devices, gates]);
  const deviceInspectionsList = useMemo(() => inspections.filter((x) => x.assetType === "DEVICE"), [inspections]);
  const gateInspectionsList = useMemo(() => inspections.filter((x) => x.assetType === "GATE"), [inspections]);

  const statusCounts = useMemo(() => {
    const all = {};
    const dev = {};
    const gate = {};

    devices.forEach((d) => {
      dev[d.currentStatus] = (dev[d.currentStatus] || 0) + 1;
      all[d.currentStatus] = (all[d.currentStatus] || 0) + 1;
    });

    gates.forEach((g) => {
      gate[g.currentStatus] = (gate[g.currentStatus] || 0) + 1;
      all[g.currentStatus] = (all[g.currentStatus] || 0) + 1;
    });

    return { all, dev, gate };
  }, [devices, gates]);

  const monthly = useMemo(() => {
    const counts = new Array(12).fill(0);
    inspections.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!Number.isNaN(d.getTime())) counts[d.getMonth()]++;
    });
    return counts.map((value, i) => ({ label: monthLabel(i), value }));
  }, [inspections]);

  const monthlyDevice = useMemo(() => {
    const counts = new Array(12).fill(0);
    deviceInspectionsList.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!Number.isNaN(d.getTime())) counts[d.getMonth()]++;
    });
    return counts.map((value, i) => ({ label: monthLabel(i), value }));
  }, [deviceInspectionsList]);

  const monthlyGate = useMemo(() => {
    const counts = new Array(12).fill(0);
    gateInspectionsList.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!Number.isNaN(d.getTime())) counts[d.getMonth()]++;
    });
    return counts.map((value, i) => ({ label: monthLabel(i), value }));
  }, [gateInspectionsList]);

  const weekly = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const counts = new Array(7).fill(0);
    inspections.forEach((ins) => {
      const d = new Date(ins.inspectedAt || ins.createdAt);
      if (!Number.isNaN(d.getTime())) counts[(d.getDay() + 6) % 7]++;
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
        value: inspections.filter((ins) => String(ins.inspectedAt || ins.createdAt || "").startsWith(s)).length,
      };
    });
  }, [inspections]);

  const deviceLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.devicesCount || 0) - (a.devicesCount || 0))
      .slice(0, 6)
      .map((l, i) => ({ label: locLabel(l, `LOC-${i + 1}`).slice(0, 12), fullLabel: locLabel(l, `LOC-${i + 1}`), value: l.devicesCount || 0 }));
  }, [locationRows]);

  const gateLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.gatesCount || 0) - (a.gatesCount || 0))
      .slice(0, 6)
      .map((l, i) => ({ label: locLabel(l, `LOC-${i + 1}`).slice(0, 12), fullLabel: locLabel(l, `LOC-${i + 1}`), value: l.gatesCount || 0 }));
  }, [locationRows]);

  const topAssetLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.assetsCount || 0) - (a.assetsCount || 0))
      .slice(0, 6)
      .map((l, i) => ({ label: locLabel(l, `LOC-${i + 1}`).slice(0, 12), fullLabel: locLabel(l, `LOC-${i + 1}`), value: l.assetsCount || 0 }));
  }, [locationRows]);

  const inspLocs = useMemo(() => {
    return [...locationRows]
      .sort((a, b) => (b.inspectionsCount || 0) - (a.inspectionsCount || 0))
      .slice(0, 6)
      .map((l, i) => ({ label: locLabel(l, `LOC-${i + 1}`).slice(0, 12), fullLabel: locLabel(l, `LOC-${i + 1}`), value: l.inspectionsCount || 0 }));
  }, [locationRows]);

  const totalAssets = allAssets.length;
  const healthyDevices = devices.filter((x) => x.currentStatus === "OK").length;
  const healthyGates = gates.filter((x) => x.currentStatus === "OK").length;
  const healthyAssets = healthyDevices + healthyGates;
  const attentionDevices = Math.max(devices.length - healthyDevices, 0);
  const attentionGates = Math.max(gates.length - healthyGates, 0);
  const attentionAssets = attentionDevices + attentionGates;
  const totalInspections = inspections.length;
  const deviceInspections = deviceInspectionsList.length;
  const gateInspections = gateInspectionsList.length;
  const healthRate = totalAssets ? Math.round((healthyAssets / totalAssets) * 100) : 0;
  const deviceHealthRate = devices.length ? Math.round((healthyDevices / devices.length) * 100) : 0;
  const gateHealthRate = gates.length ? Math.round((healthyGates / gates.length) * 100) : 0;

  const deviceStatusDonut = [
    { label: t("Operational", "تعمل"), value: statusCounts.dev.OK || 0, color: "#10b981" },
    { label: t("Attention", "تحتاج متابعة"), value: statusCounts.dev.ATTENTION || 0, color: "#f59e0b" },
    { label: t("Needs Maint.", "تحتاج صيانة"), value: statusCounts.dev.NEEDS_MAINTENANCE || 0, color: "#ef4444" },
    { label: t("Under Maint.", "تحت الصيانة"), value: statusCounts.dev.UNDER_MAINTENANCE || 0, color: "#4f46e5" },
    { label: t("Out of Service", "خارج الخدمة"), value: statusCounts.dev.OUT_OF_SERVICE || 0, color: "#9aa0ad" },
  ];

  const gateStatusDonut = [
    { label: t("Operational", "تعمل"), value: statusCounts.gate.OK || 0, color: "#10b981" },
    { label: t("Attention", "تحتاج متابعة"), value: statusCounts.gate.ATTENTION || 0, color: "#f59e0b" },
    { label: t("Maintenance", "صيانة"), value: (statusCounts.gate.NEEDS_MAINTENANCE || 0) + (statusCounts.gate.UNDER_MAINTENANCE || 0), color: "#ef4444" },
    { label: t("Out of Service", "خارج الخدمة"), value: (statusCounts.gate.OUT_OF_SERVICE || 0) + (statusCounts.gate.INACTIVE || 0), color: "#9aa0ad" },
  ];

  const assetTypeDonut = [
    { label: t("Devices", "الأجهزة"), value: devices.length, color: "#4f46e5" },
    { label: t("Gates", "البوابات"), value: gates.length, color: "#0ea5e9" },
  ];

  const radarData = [
    { label: "Assets", value: totalAssets },
    { label: "Devices", value: devices.length },
    { label: "Gates", value: gates.length },
    { label: "Insp", value: Math.min(totalInspections, 100) },
    { label: "Locs", value: locationRows.length },
    { label: "Ready", value: healthRate },
  ];

  const sparklines = [
    { label: t("Devices", "أجهزة"), values: monthlyDevice.slice(6).map((m) => m.value), color: "#4f46e5" },
    { label: t("Gates", "بوابات"), values: monthlyGate.slice(6).map((m) => m.value), color: "#0ea5e9" },
    { label: t("All", "الكل"), values: monthly.slice(6).map((m) => m.value), color: "#10b981" },
  ];

  const multiSeries = [
    { key: "deviceInspections", color: "#4f46e5", data: monthlyDevice.slice(0, 8) },
    { key: "gateInspections", color: "#0ea5e9", data: monthlyGate.slice(0, 8) },
  ];

  const monthlyAssetInspections = useMemo(() => {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((label, i) => {
      const monthIns = inspections.filter((ins) => {
        const d = new Date(ins.inspectedAt || ins.createdAt);
        return !Number.isNaN(d.getTime()) && d.getMonth() === i;
      });
      const deviceIns = monthIns.filter((x) => x.assetType === "DEVICE").length;
      const gateIns = monthIns.filter((x) => x.assetType === "GATE").length;
      const faults = monthIns.filter((x) => x.inspectionStatus !== "OK").length;
      return { label, devices: deviceIns, gates: gateIns, faults, total: deviceIns + gateIns + faults };
    });
  }, [inspections]);

  const deviceColumns = [
    { key: "code", label: t("Device", "الجهاز"), render: (d) => d.code || d.deviceCode || d.id || "—" },
    { key: "name", label: t("Name", "الاسم"), render: (d) => d.name || d.deviceName || "—" },
    { key: "status", label: t("Status", "الحالة"), render: (d) => d.currentStatus || "—" },
    { key: "location", label: t("Location", "الموقع"), render: (d) => locLabel(d.location || {}, "—") },
    { key: "inspections", label: t("Inspections", "الفحوصات"), render: (d) => d.inspectionsCount ?? 0 },
    { key: "last", label: t("Last Inspection", "آخر فحص"), render: (d) => d.lastInspectionAt ? new Date(d.lastInspectionAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB") : "—" },
  ];

  const gateColumns = [
    { key: "gate", label: t("Gate", "البوابة"), render: (g) => g.gateNo || g.id || "—" },
    { key: "secret", label: t("Secret", "السيكريت"), render: (g) => g.secretCode || "—" },
    { key: "status", label: t("Status", "الحالة"), render: (g) => g.currentStatus || "—" },
    { key: "location", label: t("Location", "الموقع"), render: (g) => locLabel(g.location || {}, "—") },
    { key: "inspections", label: t("Inspections", "الفحوصات"), render: (g) => g.inspectionsCount ?? 0 },
    { key: "last", label: t("Last Inspection", "آخر فحص"), render: (g) => g.lastInspectionAt ? new Date(g.lastInspectionAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB") : "—" },
  ];

  const inspectionColumns = [
    { key: "asset", label: t("Asset", "الأصل"), render: (i) => `${i.assetType || "—"} · ${i.assetCode || i.assetId || "—"}` },
    { key: "name", label: t("Name", "الاسم"), render: (i) => i.assetName || "—" },
    { key: "status", label: t("Status", "الحالة"), render: (i) => i.inspectionStatus || "—" },
    { key: "location", label: t("Location", "الموقع"), render: (i) => locLabel(i.location || {}, i.locationText || "—") },
    { key: "date", label: t("Date", "التاريخ"), render: (i) => i.inspectedAt || i.createdAt ? new Date(i.inspectedAt || i.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB") : "—" },
  ];

  const locationColumns = [
    { key: "loc", label: t("Location", "الموقع"), render: (l) => locLabel(l, "—") },
    { key: "devices", label: t("Devices", "الأجهزة"), render: (l) => l.devicesCount || 0 },
    { key: "gates", label: t("Gates", "البوابات"), render: (l) => l.gatesCount || 0 },
    { key: "assets", label: t("Assets", "الأصول"), render: (l) => l.assetsCount || 0 },
    { key: "inspections", label: t("Inspections", "الفحوصات"), render: (l) => l.inspectionsCount || 0 },
  ];

  function openDetail(title, subtitle, rows, columns) {
    setDetail({ title, subtitle, rows, columns });
  }

  const summaryStats = [
    { label: t("Total Devices", "إجمالي الأجهزة"), value: numberText(devices.length, lang), color: "#4f46e5", onClick: () => openDetail(t("Devices", "الأجهزة"), t("All device records loaded from backend", "كل سجلات الأجهزة القادمة من الباك إند"), devices, deviceColumns) },
    { label: t("Operational Devices", "الأجهزة السليمة"), value: numberText(healthyDevices, lang), color: "#10b981", onClick: () => openDetail(t("Operational Devices", "الأجهزة السليمة"), t("Devices with OK status", "الأجهزة التي حالتها OK"), devices.filter((d) => d.currentStatus === "OK"), deviceColumns) },
    { label: t("Device Attention", "أجهزة تحتاج متابعة"), value: numberText(attentionDevices, lang), color: "#f59e0b", onClick: () => openDetail(t("Devices Need Attention", "أجهزة تحتاج متابعة"), t("Non operational device records", "الأجهزة غير السليمة"), devices.filter((d) => d.currentStatus !== "OK"), deviceColumns) },
    { label: t("Device Inspections", "فحوصات الأجهزة"), value: numberText(deviceInspections, lang), color: "#4f46e5", onClick: () => openDetail(t("Device Inspections", "فحوصات الأجهزة"), t("Inspection records linked to devices", "سجلات الفحص المرتبطة بالأجهزة"), deviceInspectionsList, inspectionColumns) },
    { label: t("Total Gates", "إجمالي البوابات"), value: numberText(gates.length, lang), color: "#0ea5e9", onClick: () => openDetail(t("Gates", "البوابات"), t("All gate records loaded from backend", "كل سجلات البوابات القادمة من الباك إند"), gates, gateColumns) },
    { label: t("Operational Gates", "البوابات السليمة"), value: numberText(healthyGates, lang), color: "#10b981", onClick: () => openDetail(t("Operational Gates", "البوابات السليمة"), t("Gates with OK status", "البوابات التي حالتها OK"), gates.filter((g) => g.currentStatus === "OK"), gateColumns) },
    { label: t("Gate Attention", "بوابات تحتاج متابعة"), value: numberText(attentionGates, lang), color: "#f59e0b", onClick: () => openDetail(t("Gates Need Attention", "بوابات تحتاج متابعة"), t("Non operational gate records", "البوابات غير السليمة"), gates.filter((g) => g.currentStatus !== "OK"), gateColumns) },
    { label: t("Gate Inspections", "فحوصات البوابات"), value: numberText(gateInspections, lang), color: "#0ea5e9", onClick: () => openDetail(t("Gate Inspections", "فحوصات البوابات"), t("Inspection records linked to gates", "سجلات الفحص المرتبطة بالبوابات"), gateInspectionsList, inspectionColumns) },
    { label: t("Total Inspections", "إجمالي الفحوصات"), value: numberText(totalInspections, lang), color: "#818cf8", onClick: () => openDetail(t("All Inspections", "كل الفحوصات"), t("All backend inspection records", "كل سجلات الفحص القادمة من الباك إند"), inspections, inspectionColumns) },
    { label: t("Locations", "المواقع"), value: numberText(locationRows.length, lang), color: "#9aa0ad", onClick: () => openDetail(t("Locations", "المواقع"), t("Location coverage for devices and gates", "تغطية المواقع للأجهزة والبوابات"), locationRows, locationColumns) },
  ];

  const showDevices = activeCat === "all" || activeCat === "devices";
  const showGates = activeCat === "all" || activeCat === "gates";
  const showInspections = activeCat === "all" || activeCat === "inspections";
  const showLocations = activeCat === "all" || activeCat === "locations";
  const showPerformance = activeCat === "all" || activeCat === "performance";

  return (
    <>
      <style>{ANALYTICS_CSS}</style>

      <div className="analytics-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="an-topbar">
          <div>
           
           
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

        {loading ? (
          <div className="an-loading">
            <div className="an-loading-spinner" />
            {t("Loading analytics data from backend...", "جارٍ تحميل بيانات التحليلات من الباك إند...")}
          </div>
        ) : (
          <>
            <div className="an-kpis">
              <KpiBox label={t("Devices", "الأجهزة")} value={devices.length} note={t("Click for device records", "اضغطي لعرض سجلات الأجهزة")} color="#4f46e5" lang={lang} onClick={() => openDetail(t("Devices", "الأجهزة"), t("All device records loaded from backend", "كل سجلات الأجهزة القادمة من الباك إند"), devices, deviceColumns)} />
              <KpiBox label={t("Operational Devices", "أجهزة سليمة")} value={healthyDevices} note={`${deviceHealthRate}% ${t("ready", "جاهزية")}`} color="#10b981" lang={lang} onClick={() => openDetail(t("Operational Devices", "الأجهزة السليمة"), t("Devices with OK status", "الأجهزة التي حالتها OK"), devices.filter((d) => d.currentStatus === "OK"), deviceColumns)} />
              <KpiBox label={t("Gates", "البوابات")} value={gates.length} note={t("Click for gate records", "اضغطي لعرض سجلات البوابات")} color="#0ea5e9" lang={lang} onClick={() => openDetail(t("Gates", "البوابات"), t("All gate records loaded from backend", "كل سجلات البوابات القادمة من الباك إند"), gates, gateColumns)} />
              <KpiBox label={t("Operational Gates", "بوابات سليمة")} value={healthyGates} note={`${gateHealthRate}% ${t("ready", "جاهزية")}`} color="#10b981" lang={lang} onClick={() => openDetail(t("Operational Gates", "البوابات السليمة"), t("Gates with OK status", "البوابات التي حالتها OK"), gates.filter((g) => g.currentStatus === "OK"), gateColumns)} />
              <KpiBox label={t("Device Inspections", "فحوصات الأجهزة")} value={deviceInspections} note={t("Device-only inspections", "فحوصات الأجهزة فقط")} color="#4f46e5" lang={lang} onClick={() => openDetail(t("Device Inspections", "فحوصات الأجهزة"), t("Inspection records linked to devices", "سجلات الفحص المرتبطة بالأجهزة"), deviceInspectionsList, inspectionColumns)} />
              <KpiBox label={t("Gate Inspections", "فحوصات البوابات")} value={gateInspections} note={t("Gate-only inspections", "فحوصات البوابات فقط")} color="#0ea5e9" lang={lang} onClick={() => openDetail(t("Gate Inspections", "فحوصات البوابات"), t("Inspection records linked to gates", "سجلات الفحص المرتبطة بالبوابات"), gateInspectionsList, inspectionColumns)} />
            </div>

            <div className="an-pills">
              {CHART_CATS.map((cat) => (
                <div key={cat.key} className={`an-pill${activeCat === cat.key ? " an-pill--active" : ""}`} onClick={() => setActiveCat(cat.key)}>
                  <div className="an-pill-dot" style={{ background: cat.color }} />
                  {lang === "ar" ? cat.ar : cat.en}
                </div>
              ))}
            </div>

            {showDevices && (
              <>
                <SectionHead title={t("Device Analytics", "تحليلات الأجهزة")} subtitle={t("All device charts are calculated from backend device and inspection records", "كل تحليلات الأجهزة محسوبة من بيانات الأجهزة والفحوصات من الباك إند")} badge={`${numberText(devices.length, lang)} ${t("devices", "جهاز")}`} />
                <div className="ag ag--equal">
                  <Card title={t("Device Status", "حالة الأجهزة")} subtitle={t("Device readiness and attention split", "جاهزية الأجهزة وما يحتاج متابعة")} accentColor="#4f46e5" lang={lang} onClick={() => openDetail(t("Device Status", "حالة الأجهزة"), t("Device records by status", "سجلات الأجهزة حسب الحالة"), devices, deviceColumns)}>
                    <DonutChart segments={deviceStatusDonut} />
                  </Card>
                  <Card title={t("Devices by Location", "الأجهزة بالموقع")} subtitle={t("Top locations by device count", "أعلى المواقع بعدد الأجهزة")} accentColor="#4f46e5" lang={lang} onClick={() => openDetail(t("Device Locations", "مواقع الأجهزة"), t("Device count by location", "عدد الأجهزة حسب الموقع"), locationRows, locationColumns)}>
                    <BarChart data={deviceLocs} color="#4f46e5" />
                  </Card>
                  <Card title={t("Device Inspections", "فحوصات الأجهزة")} subtitle={t("Monthly device inspection volume", "حجم فحوصات الأجهزة شهرياً")} accentColor="#4f46e5" lang={lang} onClick={() => openDetail(t("Device Inspections", "فحوصات الأجهزة"), t("Inspection records linked to devices", "سجلات الفحص المرتبطة بالأجهزة"), deviceInspectionsList, inspectionColumns)}>
                    <LineChart data={monthlyDevice} color="#4f46e5" />
                  </Card>
                </div>
              </>
            )}

            {showGates && (
              <>
                <SectionHead title={t("Gate Analytics", "تحليلات البوابات")} subtitle={t("Gate analytics are separated from devices and calculated from backend gate records", "تحليلات البوابات منفصلة عن الأجهزة ومحسوبة من سجلات البوابات من الباك إند")} badge={`${numberText(gates.length, lang)} ${t("gates", "بوابة")}`} />
                <div className="ag ag--equal">
                  <Card title={t("Gate Status", "حالة البوابات")} subtitle={t("Gate readiness and attention split", "جاهزية البوابات وما يحتاج متابعة")} accentColor="#0ea5e9" lang={lang} onClick={() => openDetail(t("Gate Status", "حالة البوابات"), t("Gate records by status", "سجلات البوابات حسب الحالة"), gates, gateColumns)}>
                    <DonutChart segments={gateStatusDonut} />
                  </Card>
                  <Card title={t("Gates by Location", "البوابات بالموقع")} subtitle={t("Top locations by gate count", "أعلى المواقع بعدد البوابات")} accentColor="#06b6d4" lang={lang} onClick={() => openDetail(t("Gate Locations", "مواقع البوابات"), t("Gate count by location", "عدد البوابات حسب الموقع"), locationRows, locationColumns)}>
                    <BarChart data={gateLocs} color="#06b6d4" />
                  </Card>
                  <Card title={t("Gate Inspections", "فحوصات البوابات")} subtitle={t("Monthly gate inspection volume", "حجم فحوصات البوابات شهرياً")} accentColor="#0ea5e9" lang={lang} onClick={() => openDetail(t("Gate Inspections", "فحوصات البوابات"), t("Inspection records linked to gates", "سجلات الفحص المرتبطة بالبوابات"), gateInspectionsList, inspectionColumns)}>
                    <LineChart data={monthlyGate} color="#0ea5e9" />
                  </Card>
                </div>
              </>
            )}

            {showInspections && (
              <>
                <SectionHead title={t("Inspection Analytics", "تحليلات الفحوصات")} subtitle={t("Inspection charts are split by asset type and loaded from backend", "تحليلات الفحوصات مقسمة حسب نوع الأصل وقادمة من الباك إند")} badge={`${numberText(totalInspections, lang)} ${t("inspections", "فحص")}`} />
                <div className="ag ag--3">
                  <Card title={t("All Monthly Inspections", "كل الفحوصات الشهرية")} subtitle={t("Total inspections per month", "إجمالي الفحوصات لكل شهر")} accentColor="#10b981" lang={lang} onClick={() => openDetail(t("All Inspections", "كل الفحوصات"), t("All backend inspection records", "كل سجلات الفحص القادمة من الباك إند"), inspections, inspectionColumns)}>
                    <LineChart data={monthly} color="#10b981" />
                  </Card>
                  <Card title={t("Device vs Gate Split", "تقسيم الأجهزة والبوابات")} subtitle={t("Inspection split by asset type", "تقسيم الفحوصات حسب نوع الأصل")} accentColor="#818cf8" lang={lang} onClick={() => openDetail(t("Inspection Split", "تقسيم الفحوصات"), t("All inspection records", "كل سجلات الفحص"), inspections, inspectionColumns)}>
                    <DonutChart segments={[{ label: t("Devices", "الأجهزة"), value: deviceInspections, color: "#4f46e5" }, { label: t("Gates", "البوابات"), value: gateInspections, color: "#0ea5e9" }]} />
                  </Card>
                  <Card title={t("Inspection Heatmap", "خريطة حرارة الفحوصات")} subtitle={t("Daily activity – last 28 days", "النشاط اليومي آخر 28 يوم")} accentColor="#0ea5e9" lang={lang} onClick={() => openDetail(t("All Inspections", "كل الفحوصات"), t("Inspection records used in heatmap", "سجلات الفحوصات المستخدمة في الخريطة"), inspections, inspectionColumns)}>
                    <HeatmapCalendar data={heatmap} />
                  </Card>
                </div>
              </>
            )}

            {showLocations && (
              <>
                <SectionHead title={t("Location Analytics", "تحليلات المواقع")} subtitle={t("Devices, gates, and inspections grouped by backend locations", "الأجهزة والبوابات والفحوصات مجمعة حسب المواقع من الباك إند")} badge={`${numberText(locationRows.length, lang)} ${t("locations", "موقع")}`} />
                <div className="ag ag--equal">
                  <Card title={t("Assets by Location", "الأصول بالموقع")} subtitle={t("Devices and gates per location", "الأجهزة والبوابات بكل موقع")} accentColor="#f59e0b" lang={lang} onClick={() => openDetail(t("Assets by Location", "الأصول بالموقع"), t("Devices and gates per location", "الأجهزة والبوابات بكل موقع"), locationRows, locationColumns)}>
                    <BarChart data={topAssetLocs} color="#f59e0b" />
                  </Card>
                  <Card title={t("Inspections by Location", "الفحوصات بالموقع")} subtitle={t("Most frequently inspected", "أكثر المواقع فحصاً")} accentColor="#818cf8" lang={lang} onClick={() => openDetail(t("Inspections by Location", "الفحوصات بالموقع"), t("Inspection count by location", "عدد الفحوصات حسب الموقع"), locationRows, locationColumns)}>
                    <HorizBarChart data={inspLocs} color="#818cf8" />
                  </Card>
                  <Card title={t("Asset Type Split", "توزيع الأصول")} subtitle={t("Devices vs gates", "الأجهزة مقابل البوابات")} accentColor="#0ea5e9" lang={lang} onClick={() => openDetail(t("Assets", "الأصول"), t("Device and gate records", "سجلات الأجهزة والبوابات"), allAssets, [...deviceColumns.slice(0, 3), { key: "assetType", label: t("Type", "النوع"), render: (x) => x.assetType || (x.gateNo ? "GATE" : "DEVICE") }])}>
                    <DonutChart segments={assetTypeDonut} />
                  </Card>
                </div>
              </>
            )}

            {showPerformance && (
              <>
                <SectionHead title={t("Performance Analytics", "تحليلات الأداء")} subtitle={t("Operational rate and time patterns separated by assets", "معدل التشغيل والأنماط الزمنية حسب الأصول")} badge={`${healthRate}% ${t("ready", "جاهزية")}`} />
                <div className="ag ag--2-1">
                  <Card title={t("Weekly Inspection Pattern", "فحوصات أيام الأسبوع")} subtitle={t("Frequency by day of week", "توزيع الفحوصات حسب أيام الأسبوع")} accentColor="#0ea5e9" lang={lang} onClick={() => openDetail(t("Weekly Inspection Records", "سجلات الفحوصات الأسبوعية"), t("All inspection records", "كل سجلات الفحص"), inspections, inspectionColumns)}>
                    <BarChart data={weekly} color="#0ea5e9" h={130} showVals />
                  </Card>
                  <Card title={t("Device vs Gate Inspections", "فحوصات الأجهزة والبوابات")} subtitle={t("Dual time-series from backend", "مسارين زمنيين من الباك إند")} accentColor="#4f46e5" lang={lang} onClick={() => openDetail(t("Device vs Gate Inspections", "فحوصات الأجهزة والبوابات"), t("All inspection records split by asset type", "كل سجلات الفحص مقسمة حسب نوع الأصل"), inspections, inspectionColumns)}>
                    <MultiAreaChart series={multiSeries} />
                  </Card>
                </div>
                <div className="ag ag--equal">
                  <Card title={t("Readiness Gauge", "مؤشر الجاهزية")} subtitle={t("All assets operational rate", "معدل تشغيل كل الأصول")} accentColor="#10b981" lang={lang} onClick={() => openDetail(t("All Assets", "كل الأصول"), t("Devices and gates used in readiness calculation", "الأجهزة والبوابات المستخدمة في حساب الجاهزية"), allAssets, [...deviceColumns.slice(0, 3), { key: "type", label: t("Type", "النوع"), render: (x) => x.assetType || (x.gateNo ? "GATE" : "DEVICE") }])}>
                    <GaugeChart value={healthRate} />
                  </Card>
                  <Card title={t("Monthly Asset Workload", "حجم العمل الشهري للأصول")} subtitle={t("Stacked devices, gates, and faults", "الأجهزة والبوابات والأعطال")} accentColor="#ef4444" lang={lang} onClick={() => openDetail(t("All Inspections", "كل الفحوصات"), t("Inspection records used in monthly workload", "سجلات الفحوصات المستخدمة في حجم العمل الشهري"), inspections, inspectionColumns)}>
                    <StackedBarChart data={monthlyAssetInspections} />
                  </Card>
                  <Card title={t("System Radar", "رادار النظام")} subtitle={t("Multi-axis backend overview", "نظرة شاملة من الباك إند")} accentColor="#10b981" lang={lang} onClick={() => openDetail(t("Command Summary", "ملخص القيادة"), t("Backend records behind radar chart", "سجلات الباك إند المستخدمة في الرادار"), locationRows, locationColumns)}>
                    <div className="radar-wrap"><RadarChart data={radarData} /></div>
                  </Card>
                </div>
              </>
            )}

            <div className="ag ag--1">
              <Card title={t("Command Summary", "ملخص القيادة")} subtitle={t("Click any row to open related backend records", "اضغطي على أي صف لعرض السجلات المرتبطة من الباك إند")} accentColor="#10b981" lang={lang}>
                <StatSummary stats={summaryStats} lang={lang} />
              </Card>
            </div>
          </>
        )}

        <AnalyticsDetailModal detail={detail} onClose={() => setDetail(null)} lang={lang} />
      </div>
    </>
  );
}

export default ViewerAnalyticsPage;
