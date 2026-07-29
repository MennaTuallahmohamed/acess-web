import React, { useCallback, useEffect, useMemo, useState } from "react";
import DeviceReplacementPage, { DeviceReplaceModal } from "./DeviceReplacementPage";

const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

async function api(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }

  return data;
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.replacements)) return data.replacements;
  return [];
}

const STATUS_META = {
  OK: {
    label: "Operating OK",
    bg: "#ecfdf5",
    color: "#10b981",
  },
  NEEDS_MAINTENANCE: {
    label: "Needs Maintenance",
    bg: "#fffbeb",
    color: "#f59e0b",
  },
  OUT_OF_SERVICE: {
    label: "Offline / Broken",
    bg: "#fef2f2",
    color: "#ef4444",
  },
  UNDER_MAINTENANCE: {
    label: "Under Repair",
    bg: "#e0e7ff",
    color: "#6366f1",
  },
  REPLACEMENT_OLD: {
    label: "Old Snapshot",
    bg: "#fff7ed",
    color: "#f97316",
  },
  REPLACEMENT_NEW: {
    label: "New / Current",
    bg: "#eaf8ff",
    color: "#1CA9E1",
  },
};

function safeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
}

function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function normalizeId(v) {
  return v === null || v === undefined ? "" : String(v).trim().toLowerCase();
}

function clean(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text && text !== "null" && text !== "undefined" ? text : fallback;
}

function formatDateTimeSafe(dateValue) {
  if (!dateValue) return "—";

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString();
}

function parseJsonSafe(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch {
    return null;
  }
}

function getReplacementMeta(record) {
  const candidates = [
    record?.meta,
    record?.metadata,
    record?.replacementMeta,
    record?.notes,
    record?.reason,
  ];

  for (const item of candidates) {
    const parsed = parseJsonSafe(item);

    if (parsed?.oldSnapshot || parsed?.newSnapshot) {
      return parsed;
    }

    if (parsed?.replacementMeta?.oldSnapshot || parsed?.replacementMeta?.newSnapshot) {
      return parsed.replacementMeta;
    }
  }

  return {};
}

function pickSnapshot(record, side) {
  const meta = getReplacementMeta(record);

  if (side === "OLD") {
    return (
      record?.oldSnapshot ||
      record?.beforeSnapshot ||
      record?.old_device_snapshot ||
      meta?.oldSnapshot ||
      meta?.beforeSnapshot ||
      {}
    );
  }

  return (
    record?.newSnapshot ||
    record?.afterSnapshot ||
    record?.new_device_snapshot ||
    meta?.newSnapshot ||
    meta?.afterSnapshot ||
    {}
  );
}

function readValue(device = {}, snapshot = {}, key) {
  if (snapshot && snapshot[key] !== undefined && snapshot[key] !== null && snapshot[key] !== "") {
    return snapshot[key];
  }

  if (device && device[key] !== undefined && device[key] !== null && device[key] !== "") {
    return device[key];
  }

  return "";
}

function parseDeviceLocation(dev = {}) {
  const loc = dev?.location || {};

  return {
    cluster:
      dev?.gateCluster ||
      dev?.cluster ||
      loc?.cluster ||
      "",
    building:
      dev?.gateBuilding ||
      dev?.building ||
      loc?.building ||
      "",
    zone:
      dev?.gateZone ||
      dev?.zone ||
      loc?.zone ||
      "",
    lane:
      dev?.gateNo ||
      dev?.lane ||
      loc?.lane ||
      "",
    direction:
      dev?.gateDirection ||
      dev?.direction ||
      loc?.direction ||
      "",
  };
}

function parseSnapshotLocation(device = {}, snapshot = {}) {
  const loc = snapshot?.location || device?.location || {};

  return {
    cluster:
      readValue(device, snapshot, "gateCluster") ||
      readValue(device, snapshot, "cluster") ||
      loc?.cluster ||
      "",
    building:
      readValue(device, snapshot, "gateBuilding") ||
      readValue(device, snapshot, "building") ||
      loc?.building ||
      "",
    zone:
      readValue(device, snapshot, "gateZone") ||
      readValue(device, snapshot, "zone") ||
      loc?.zone ||
      "",
    lane:
      readValue(device, snapshot, "gateNo") ||
      readValue(device, snapshot, "lane") ||
      loc?.lane ||
      "",
    direction:
      readValue(device, snapshot, "gateDirection") ||
      readValue(device, snapshot, "direction") ||
      loc?.direction ||
      "",
  };
}

function locationToText(loc = {}) {
  return [loc.cluster, loc.building, loc.zone, loc.direction, loc.lane]
    .filter(Boolean)
    .join(" - ");
}

function getInspectionDate(ins) {
  return (
    ins?.inspectedAt ||
    ins?.createdAt ||
    ins?.updatedAt ||
    ins?.date ||
    ins?.scanDate ||
    ins?.inspectionDate ||
    null
  );
}

function getTechnicianName(ins) {
  return (
    ins?.technician?.fullName ||
    ins?.technician?.username ||
    ins?.technicianName ||
    ins?.techName ||
    ins?.user?.fullName ||
    ins?.user?.username ||
    "—"
  );
}

function getInspectionImages(ins) {
  if (Array.isArray(ins?.images)) return ins.images;
  if (Array.isArray(ins?.photos)) return ins.photos;
  if (Array.isArray(ins?.attachments)) return ins.attachments;
  return [];
}

function getImageUrl(img) {
  return typeof img === "string"
    ? img
    : img?.imageUrl || img?.url || img?.path || img?.src || "";
}

function getInspectionDeviceId(ins) {
  return normalizeId(
    ins?.deviceId ||
      ins?.device?.id ||
      ins?.device_id ||
      ins?.hardwareDeviceId ||
      ins?.assetId ||
      ""
  );
}

function getDeviceId(device) {
  return normalizeId(
    device?._sourceDeviceId ||
      device?.id ||
      device?.deviceId ||
      device?.device_id ||
      device?.hardwareDeviceId ||
      device?.assetId ||
      ""
  );
}

function deviceMatchesInspection(device, ins) {
  const devId = getDeviceId(device);
  const insDeviceId = getInspectionDeviceId(ins);

  return Boolean(devId && insDeviceId && devId === insDeviceId);
}

function getInspectionAgeDays(dateValue) {
  if (!dateValue) return null;

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;

  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function filterInspectionsByReplacementSide(device, related) {
  if (!device?._virtualReplacement) return related;

  const replacementDate = new Date(
    device?._replacementRecord?.replacementDate ||
      device?._replacementRecord?.createdAt ||
      0
  );

  if (Number.isNaN(replacementDate.getTime())) return related;

  return related.filter((ins) => {
    const d = new Date(getInspectionDate(ins) || 0);

    if (Number.isNaN(d.getTime())) return true;

    if (device._replacementSide === "OLD") {
      return d <= replacementDate;
    }

    return d >= replacementDate;
  });
}

function buildInspectionSummary(device, inspections = []) {
  const relatedBeforeSplit = inspections
    .filter((ins) => deviceMatchesInspection(device, ins))
    .map((ins) => ({ ...ins, _inspectionDate: getInspectionDate(ins) }));

  const related = filterInspectionsByReplacementSide(device, relatedBeforeSplit).sort(
    (a, b) =>
      new Date(b._inspectionDate || 0) - new Date(a._inspectionDate || 0)
  );

  const latest = related[0] || null;
  const lastDate = latest?._inspectionDate || null;
  const ageDays = getInspectionAgeDays(lastDate);
  const hasInspection = related.length > 0;
  const hasImages = related.some((ins) => getInspectionImages(ins).length > 0);

  let riskLevel = "Not Inspected";
  let riskColor = "#ef4444";
  let riskBg = "#fef2f2";

  if (hasInspection && ageDays !== null && ageDays <= 7) {
    riskLevel = "Fresh Scan";
    riskColor = "#10b981";
    riskBg = "#ecfdf5";
  } else if (hasInspection && ageDays !== null && ageDays <= 30) {
    riskLevel = "Old Scan";
    riskColor = "#f59e0b";
    riskBg = "#fffbeb";
  } else if (hasInspection) {
    riskLevel = "Stale Scan";
    riskColor = "#f97316";
    riskBg = "#fff7ed";
  }

  return {
    hasInspection,
    inspectionCount: related.length,
    latestInspection: latest,
    lastInspectionDate: lastDate,
    lastInspectionAgeDays: ageDays,
    latestInspectionStatus:
      latest?.inspectionStatus || latest?.status || latest?.result || "NOT_INSPECTED",
    lastTechnician: latest ? getTechnicianName(latest) : "—",
    hasInspectionImages: hasImages,
    riskLevel,
    riskColor,
    riskBg,
    relatedInspections: related,
  };
}

function makeReplacementDeviceRow(record, side, inspections = []) {
  const oldDevice = record?.oldDevice || {};
  const newDevice = record?.newDevice || {};

  const device = side === "OLD" ? oldDevice : newDevice;
  const snapshot = pickSnapshot(record, side);
  const sourceId =
    side === "OLD"
      ? record?.oldDeviceId || snapshot?.id || oldDevice?.id
      : record?.newDeviceId || snapshot?.id || newDevice?.id;

  const parsedLoc = parseSnapshotLocation(device, snapshot);

  const row = {
    ...device,
    ...snapshot,
    id: `replacement-${record?.id}-${side}-${sourceId}`,
    _sourceDeviceId: sourceId,
    _virtualReplacement: true,
    _replacementSide: side,
    _replacementRecord: record,
    _replacementRecordId: record?.id,
    _snapshotMissing: !snapshot || Object.keys(snapshot).length === 0,

    deviceCode:
      readValue(device, snapshot, "deviceCode") ||
      readValue(device, snapshot, "barcode") ||
      readValue(device, snapshot, "serialNumber") ||
      sourceId ||
      "—",

    deviceName:
      readValue(device, snapshot, "deviceName") ||
      readValue(device, snapshot, "name") ||
      "Unknown Device",

    barcode: readValue(device, snapshot, "barcode"),
    serialNumber: readValue(device, snapshot, "serialNumber"),
    ipAddress:
      readValue(device, snapshot, "ipAddress") ||
      record?.oldIpAddress ||
      "",
    firmware: readValue(device, snapshot, "firmware"),
    manufacturer: readValue(device, snapshot, "manufacturer"),
    currentStatus:
      side === "OLD"
        ? "REPLACEMENT_OLD"
        : "REPLACEMENT_NEW",

    parsedLoc,
  };

  row.inspectionInfo = buildInspectionSummary(row, inspections);

  return row;
}

function buildReplacementRows(replacements = [], inspections = []) {
  return replacements.flatMap((record) => [
    makeReplacementDeviceRow(record, "OLD", inspections),
    makeReplacementDeviceRow(record, "NEW", inspections),
  ]);
}

function rowSearchText(d) {
  const rec = d?._replacementRecord || {};
  const oldSnapshot = pickSnapshot(rec, "OLD");
  const newSnapshot = pickSnapshot(rec, "NEW");
  const pl = d.parsedLoc || parseDeviceLocation(d);

  return [
    d.id,
    d._sourceDeviceId,
    d.deviceCode,
    d.deviceName,
    d.serialNumber,
    d.barcode,
    d.ipAddress,
    d.firmware,
    d.manufacturer,
    d.currentStatus,
    d._replacementSide,
    d._replacementRecordId,
    rec.id,
    rec.oldDeviceId,
    rec.newDeviceId,
    rec.oldIpAddress,
    rec.reason,
    rec.notes,
    oldSnapshot?.ipAddress,
    newSnapshot?.ipAddress,
    oldSnapshot?.gateCluster,
    oldSnapshot?.gateBuilding,
    oldSnapshot?.gateZone,
    oldSnapshot?.gateDirection,
    oldSnapshot?.gateNo,
    newSnapshot?.gateCluster,
    newSnapshot?.gateBuilding,
    newSnapshot?.gateZone,
    newSnapshot?.gateDirection,
    newSnapshot?.gateNo,
    pl.cluster,
    pl.building,
    pl.zone,
    pl.direction,
    pl.lane,
    d.inspectionInfo?.lastTechnician,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const LUX_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.lux-tp-root{
  font-family:'Inter',system-ui,sans-serif;
  background:var(--bg-tertiary,#f8fafc);
  min-height:100vh;
  padding:24px 32px;
  color:#0f172a;
}

.lux-page-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  margin-bottom:16px;
  gap:16px;
  flex-wrap:wrap;
}

.lux-page-title{
  font-size:28px;
  font-weight:900;
  letter-spacing:-.5px;
  margin:0 0 6px;
  color:#0f172a;
}

.lux-page-sub{
  font-size:14px;
  color:#64748b;
  font-weight:700;
  display:flex;
  align-items:center;
  gap:8px;
}

.lux-pulse{
  width:8px;
  height:8px;
  background:#10b981;
  border-radius:50%;
  box-shadow:0 0 0 4px #d1fae5;
  animation:luxPulse 2s infinite;
  flex-shrink:0;
}

.lux-top-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:center;
}

.lux-btn-outline,
.lux-btn-readmore{
  border-radius:12px;
  font-weight:900;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  transition:.2s;
  font-size:14px;
  font-family:inherit;
}

.lux-btn-outline{
  border:1px solid #e2e8f0;
  background:#fff;
  color:#475569;
  padding:10px 18px;
}

.lux-btn-outline:hover{
  background:#f8fafc;
  border-color:#cbd5e1;
}

.lux-phone-button{
  min-width:190px;
  height:54px;
  border:0;
  border-radius:18px;
  padding:0 18px;
  background:linear-gradient(135deg,#263746,#147394,#1CA9E1);
  color:#fff;
  cursor:pointer;
  font-weight:1000;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:12px;
  box-shadow:0 18px 40px rgba(28,169,225,.25);
  transition:.2s ease;
}

.lux-phone-button:hover{
  transform:translateY(-2px);
  box-shadow:0 24px 52px rgba(28,169,225,.32);
}

.lux-phone-icon{
  width:36px;
  height:36px;
  border-radius:13px;
  background:#fff;
  color:#1CA9E1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
}

.lux-phone-text{
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  line-height:1.2;
}

.lux-phone-text strong{
  font-size:13px;
}

.lux-phone-text span{
  font-size:10px;
  opacity:.82;
}

.lux-btn-readmore{
  background:transparent;
  color:#4f46e5;
  border:1px solid rgba(79,70,229,.3);
  padding:8px 12px;
  width:100%;
}

.lux-btn-readmore:hover{
  background:#e0e7ff;
  border-color:#4f46e5;
}

.lux-kpi-grid{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:16px;
  margin-top:24px;
  margin-bottom:24px;
}

.lux-kpi-card{
  background:#fff;
  padding:16px 20px;
  border-radius:16px;
  border:1px solid #f1f5f9;
  border-top:5px solid #1CA9E1;
  box-shadow:0 4px 15px rgba(0,0,0,.02);
  display:flex;
  flex-direction:column;
  cursor:pointer;
  transition:.2s;
}

.lux-kpi-card:hover{
  transform:translateY(-2px);
  border-color:#cbd5e1;
}

.lux-kpi-card.active{
  border-color:#1CA9E1;
  background:#eaf8ff;
  box-shadow:0 6px 20px rgba(28,169,225,.15);
}

.lux-kpi-title{
  font-size:12px;
  color:#64748b;
  font-weight:900;
  text-transform:uppercase;
  letter-spacing:.5px;
  margin-bottom:5px;
}

.lux-kpi-val{
  font-size:29px;
  font-weight:900;
  line-height:1;
}

.lux-audit-board{
  background:linear-gradient(135deg,#0f172a 0%,#263746 55%,#1CA9E1 100%);
  border-radius:24px;
  padding:22px;
  margin-bottom:24px;
  color:#fff;
  box-shadow:0 18px 40px rgba(15,23,42,.18);
  overflow:hidden;
  position:relative;
}

.lux-audit-board:before{
  content:"";
  position:absolute;
  right:-70px;
  top:-80px;
  width:220px;
  height:220px;
  background:rgba(255,255,255,.16);
  border-radius:999px;
  filter:blur(5px);
}

.lux-audit-head{
  position:relative;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  flex-wrap:wrap;
}

.lux-audit-title{
  font-size:18px;
  font-weight:1000;
  margin-bottom:6px;
  letter-spacing:-.3px;
}

.lux-audit-sub{
  font-size:13px;
  color:rgba(255,255,255,.74);
  font-weight:700;
  line-height:1.6;
}

.lux-chip-row{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-top:14px;
  position:relative;
}

.lux-chip{
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.1);
  color:#fff;
  border-radius:999px;
  padding:7px 12px;
  font-size:12px;
  font-weight:900;
  cursor:pointer;
  transition:.2s;
}

.lux-chip:hover{
  background:rgba(255,255,255,.18);
}

.lux-coverage-ring{
  width:88px;
  height:88px;
  border-radius:999px;
  background:conic-gradient(#22c55e var(--p),rgba(255,255,255,.18) 0);
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:inset 0 0 0 10px rgba(255,255,255,.06);
}

.lux-coverage-ring-inner{
  width:60px;
  height:60px;
  border-radius:999px;
  background:#111827;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:15px;
  font-weight:1000;
}

.lux-filter-bar{
  display:flex;
  align-items:center;
  gap:16px;
  background:#fff;
  padding:16px;
  border-radius:16px;
  box-shadow:0 4px 15px rgba(0,0,0,.02);
  border:1px solid #e2e8f0;
  margin-bottom:24px;
  flex-wrap:wrap;
}

.lux-search-box{
  position:relative;
  flex:2;
  min-width:250px;
}

.lux-search-box input{
  width:100%;
  padding:12px 16px 12px 42px;
  border-radius:12px;
  border:1px solid #cbd5e1;
  background:#f8fafc;
  font-size:14px;
  outline:none;
  transition:.2s;
  font-weight:600;
  box-sizing:border-box;
}

.lux-search-box input:focus{
  border-color:#1CA9E1;
  background:#fff;
  box-shadow:0 0 0 4px rgba(28,169,225,.1);
}

.lux-search-box svg{
  position:absolute;
  left:14px;
  top:12px;
  color:#94a3b8;
}

.lux-select-wrap{
  flex:1;
  min-width:150px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.lux-select-wrap label{
  font-size:11px;
  font-weight:900;
  color:#64748b;
  text-transform:uppercase;
}

.lux-select{
  padding:10px 14px;
  border-radius:10px;
  border:1px solid #cbd5e1;
  background:#f8fafc;
  font-size:13px;
  font-weight:800;
  color:#334155;
  outline:none;
  cursor:pointer;
}

.lux-summary-note{
  font-size:13px;
  color:#64748b;
  font-weight:900;
  margin-left:auto;
}

.lux-hw-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(280px,1fr));
  gap:20px;
}

.lux-hw-card{
  background:#fff;
  border-radius:16px;
  border:1px solid #e2e8f0;
  box-shadow:0 4px 15px rgba(0,0,0,.02);
  overflow:hidden;
  display:flex;
  flex-direction:column;
  transition:.25s;
  position:relative;
}

.lux-hw-card:hover{
  transform:translateY(-6px);
  box-shadow:0 16px 32px rgba(0,0,0,.06);
  border-color:#cbd5e1;
}

.lux-card-alert{
  border-color:#fecaca !important;
  box-shadow:0 12px 28px rgba(239,68,68,.10) !important;
}

.lux-replacement-card{
  border-color:#bae6fd !important;
  box-shadow:0 16px 34px rgba(28,169,225,.12) !important;
}

.lux-replacement-old{
  border-color:#fed7aa !important;
  box-shadow:0 16px 34px rgba(249,115,22,.12) !important;
}

.lux-hw-head{
  padding:20px;
  display:flex;
  justify-content:space-between;
  border-bottom:1px solid #f8fafc;
  align-items:flex-start;
}

.lux-hw-icon{
  width:48px;
  height:48px;
  border-radius:12px;
  background:linear-gradient(135deg,#f1f5f9,#e2e8f0);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:900;
  font-size:18px;
  color:#475569;
}

.lux-card-top-actions{
  display:flex;
  align-items:center;
  gap:8px;
}

.lux-replace-round{
  width:38px;
  height:38px;
  border:0;
  border-radius:14px;
  background:linear-gradient(135deg,#263746,#1CA9E1);
  color:#fff;
  font-size:18px;
  cursor:pointer;
  box-shadow:0 12px 24px rgba(28,169,225,.22);
  transition:.2s;
}

.lux-replace-round:hover{
  transform:translateY(-2px) scale(1.03);
}

.lux-priority-ribbon{
  padding:10px 14px;
  border-top:1px solid #fee2e2;
  background:#fef2f2;
  color:#991b1b;
  font-size:12px;
  font-weight:1000;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

.lux-replacement-ribbon{
  padding:10px 14px;
  border-top:1px solid #bae6fd;
  background:#eaf8ff;
  color:#0369a1;
  font-size:12px;
  font-weight:1000;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}

.lux-replacement-ribbon.old{
  border-top-color:#fed7aa;
  background:#fff7ed;
  color:#c2410c;
}

.lux-scan-row{
  padding:14px 16px;
  border-bottom:1px solid #f1f5f9;
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  align-items:center;
}

.lux-scan-badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:6px 9px;
  border-radius:999px;
  font-size:10px;
  font-weight:1000;
  text-transform:uppercase;
}

.lux-mini-muted{
  color:#94a3b8;
  font-size:11px;
  font-weight:900;
}

.lux-hw-body{
  padding:20px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
  background:#f8fafc;
  flex:1;
}

.lux-hw-stat{
  display:flex;
  flex-direction:column;
  gap:4px;
}

.lux-hw-stat span:first-child{
  font-size:10px;
  font-weight:1000;
  text-transform:uppercase;
  color:#94a3b8;
}

.lux-hw-stat span:last-child{
  font-size:13px;
  font-weight:800;
  color:#0f172a;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.lux-card-actions{
  padding:16px;
  border-top:1px solid #f1f5f9;
  display:grid;
  grid-template-columns:1fr 52px;
  gap:10px;
}

.lux-replace-mini{
  border:0;
  border-radius:12px;
  background:linear-gradient(135deg,#263746,#1CA9E1);
  color:#fff;
  font-size:18px;
  cursor:pointer;
}

.lux-slide-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.4);
  backdrop-filter:blur(2px);
  z-index:998;
  animation:luxFadeIn .3s forwards;
}

.lux-slide-panel{
  position:fixed;
  top:0;
  right:0;
  bottom:0;
  width:100%;
  max-width:620px;
  background:#f8fafc;
  z-index:999;
  box-shadow:-10px 0 40px rgba(0,0,0,.1);
  transform:translateX(100%);
  transition:.4s cubic-bezier(.16,1,.3,1);
  display:flex;
  flex-direction:column;
}

.lux-slide-panel.open{
  transform:translateX(0);
}

.lux-empty{
  grid-column:1/-1;
  padding:40px;
  text-align:center;
  color:#64748b;
  font-weight:900;
  border:1px dashed #cbd5e1;
  background:#fff;
  border-radius:20px;
}

@keyframes luxPulse{
  0%{box-shadow:0 0 0 0 rgba(16,185,129,.4);}
  70%{box-shadow:0 0 0 6px rgba(16,185,129,0);}
  100%{box-shadow:0 0 0 0 rgba(16,185,129,0);}
}

@keyframes luxFadeIn{
  from{opacity:0;}
  to{opacity:1;}
}

@media(max-width:1100px){
  .lux-kpi-grid{
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:700px){
  .lux-tp-root{
    padding:16px 14px;
  }

  .lux-kpi-grid{
    grid-template-columns:1fr;
  }

  .lux-page-head{
    flex-direction:column;
  }

  .lux-phone-button{
    width:100%;
  }
}
`;

function DeviceDetailsOverlay({ device, inspections = [], onBack }) {
  if (!device) return null;

  const ploc = device.parsedLoc || {};
  const sMeta = STATUS_META[device.currentStatus || "OK"] || STATUS_META.OK;

  return (
    <>
      <div className="lux-slide-backdrop" onClick={onBack}></div>

      <div className="lux-slide-panel open">
        <div
          style={{
            padding: "32px",
            background: "#fff",
            borderBottom: "1px solid #e2e8f0",
            position: "relative",
          }}
        >
          <button
            onClick={onBack}
            style={{
              position: "absolute",
              top: "24px",
              right: "24px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ×
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                background: sMeta.bg,
                color: sMeta.color,
                fontSize: "13px",
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: sMeta.color,
                }}
              ></span>
              {sMeta.label}
            </span>

            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 700 }}>
              ID: {device._sourceDeviceId || device.id}
            </span>

            {device._virtualReplacement ? (
              <span style={{ fontSize: "13px", color: "#0369a1", fontWeight: 900 }}>
                Replacement #{device._replacementRecordId}
              </span>
            ) : null}
          </div>

          <h2 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
            {device.deviceCode || "Unknown"}
          </h2>

          <div style={{ fontSize: "15px", color: "#475569", fontWeight: 700 }}>
            {device.deviceName} • {device.manufacturer || "Generic"}
          </div>
        </div>

        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          {device._snapshotMissing ? (
            <div style={{ padding: "16px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "14px", color: "#c2410c", fontWeight: 900, marginBottom: 22 }}>
              This old snapshot was not saved in the backend record. New records after the backend fix will show the real old location.
            </div>
          ) : null}

          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: ".5px", margin: "0 0 16px", fontWeight: 900 }}>
            Hardware Specs & Network
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            {[
              ["Barcode / Tag", device.barcode || "—"],
              ["Serial Number", device.serialNumber || "—"],
              ["IP Address", device.ipAddress || "—"],
              ["Firmware Version", device.firmware || "—"],
            ].map(([label, value]) => (
              <div key={label} style={{ padding: "16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 }}>
                  {label}
                </div>

                <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: ".5px", margin: "0 0 16px", fontWeight: 900 }}>
            Deployment Coordinates
          </h3>

          <div style={{ padding: "20px", background: "#eaf8ff", border: "1px solid #cdeafe", borderRadius: "16px", marginBottom: "32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {[
              ["Cluster", ploc.cluster],
              ["Building", ploc.building],
              ["Zone", ploc.zone],
              ["Direction", ploc.direction],
              ["Lane", ploc.lane],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: "11px", fontWeight: 900, color: "#0369a1", textTransform: "uppercase" }}>
                  {label}
                </div>

                <div style={{ fontSize: "15px", fontWeight: 900, color: "#263746" }}>
                  {value || "—"}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: ".5px", margin: "0 0 16px", fontWeight: 900 }}>
            Inspection Log
          </h3>

          {inspections.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 700 }}>
                No inspection records were found for this device.
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {inspections
                .sort(
                  (a, b) =>
                    new Date(getInspectionDate(b) || 0) -
                    new Date(getInspectionDate(a) || 0)
                )
                .map((ins, idx) => (
                  <div key={ins.id || idx} style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 6,
                            background: ins.inspectionStatus === "OK" ? "#ecfdf5" : "#fef2f2",
                            color: ins.inspectionStatus === "OK" ? "#10b981" : "#ef4444",
                            fontSize: "11px",
                            fontWeight: 900,
                          }}
                        >
                          {ins.inspectionStatus || "LOGGED"}
                        </span>

                        <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                          {ins.technician?.fullName || ins.technician?.username || "Technician"}
                        </span>
                      </div>

                      <span style={{ fontSize: "12px", fontWeight: 700, color: "#94a3b8" }}>
                        {formatDateTimeSafe(getInspectionDate(ins))}
                      </span>
                    </div>

                    <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, background: "#f8fafc", padding: 12, border: "1px solid #f1f5f9", borderRadius: 8 }}>
                      {ins.notes || ins.issueReason || "Inspection confirmed. No extra remarks."}
                    </div>

                    {getInspectionImages(ins).length > 0 && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                        {getInspectionImages(ins).map((img, i) => (
                          <img
                            key={i}
                            src={getImageUrl(img)}
                            alt="Inspection proof"
                            style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: "1px solid #e2e8f0" }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export function DevicesPage({ devices = [], inspections = [], onBack }) {
  const [screen, setScreen] = useState("DEVICES");
  const [activeStat, setActiveStat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [filterLoc, setFilterLoc] = useState({
    cluster: "ALL",
    building: "ALL",
    zone: "ALL",
  });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [replaceDevice, setReplaceDevice] = useState(null);
  const [replacementRefreshKey, setReplacementRefreshKey] = useState(0);
  const [replacementRecords, setReplacementRecords] = useState([]);

  useEffect(() => {
    const id = "devices-page-lux-css";
    const old = document.getElementById(id);
    if (old) old.remove();

    const el = document.createElement("style");
    el.id = id;
    el.innerHTML = LUX_CSS;
    document.head.appendChild(el);

    return () => {
      const current = document.getElementById(id);
      if (current) current.remove();
    };
  }, []);

  const loadReplacements = useCallback(async () => {
    try {
      const data = await api("/device-replacements");
      setReplacementRecords(toArray(data));
    } catch (err) {
      console.warn("Failed to load replacement records:", err);
      setReplacementRecords([]);
    }
  }, []);

  useEffect(() => {
    loadReplacements();
  }, [loadReplacements, replacementRefreshKey]);

  const devicesMapped = useMemo(
    () =>
      devices.map((d) => {
        const parsedLoc = parseDeviceLocation(d);
        const inspectionInfo = buildInspectionSummary({ ...d, parsedLoc }, inspections);

        return {
          ...d,
          parsedLoc,
          inspectionInfo,
          _sourceDeviceId: d.id,
        };
      }),
    [devices, inspections]
  );

  const replacementRows = useMemo(
    () => buildReplacementRows(replacementRecords, inspections),
    [replacementRecords, inspections]
  );

  const stats = useMemo(() => {
    let ok = 0;
    let maint = 0;
    let out = 0;
    let under = 0;
    let inspected = 0;
    let notInspected = 0;
    let stale = 0;

    devicesMapped.forEach((d) => {
      if (d.currentStatus === "OK") ok += 1;
      else if (d.currentStatus === "NEEDS_MAINTENANCE") maint += 1;
      else if (d.currentStatus === "OUT_OF_SERVICE") out += 1;
      else if (d.currentStatus === "UNDER_MAINTENANCE") under += 1;

      if (d.inspectionInfo?.hasInspection) inspected += 1;
      else notInspected += 1;

      if (
        !d.inspectionInfo?.hasInspection ||
        (d.inspectionInfo?.lastInspectionAgeDays ?? 9999) > 30
      ) {
        stale += 1;
      }
    });

    const total = devicesMapped.length;
    const coveragePct = total ? Math.round((inspected / total) * 100) : 0;

    return {
      total,
      inspectionRecords: inspections.length,
      ok,
      maint,
      out,
      under,
      inspected,
      notInspected,
      stale,
      coveragePct,
    };
  }, [devicesMapped, inspections]);

  const uniqueLocs = useMemo(() => {
    const loc = {
      cluster: new Set(),
      building: new Set(),
      zone: new Set(),
    };

    devicesMapped.forEach((d) => {
      if (d.parsedLoc.cluster) loc.cluster.add(d.parsedLoc.cluster);
      if (d.parsedLoc.building) loc.building.add(d.parsedLoc.building);
      if (d.parsedLoc.zone) loc.zone.add(d.parsedLoc.zone);
    });

    replacementRows.forEach((d) => {
      if (d.parsedLoc.cluster) loc.cluster.add(d.parsedLoc.cluster);
      if (d.parsedLoc.building) loc.building.add(d.parsedLoc.building);
      if (d.parsedLoc.zone) loc.zone.add(d.parsedLoc.zone);
    });

    return {
      cluster: [...loc.cluster].sort(),
      building: [...loc.building].sort(),
      zone: [...loc.zone].sort(),
    };
  }, [devicesMapped, replacementRows]);

  function passesFilter(d, useSearch = true) {
    if (activeStat === "HAS_INSPECTION" && !d.inspectionInfo?.hasInspection) {
      return false;
    }

    if (activeStat === "NOT_INSPECTED" && d.inspectionInfo?.hasInspection) {
      return false;
    }

    if (
      activeStat === "STALE_SCAN" &&
      d.inspectionInfo?.hasInspection &&
      (d.inspectionInfo?.lastInspectionAgeDays ?? 0) <= 30
    ) {
      return false;
    }

    if (
      !["ALL", "HAS_INSPECTION", "NOT_INSPECTED", "STALE_SCAN"].includes(
        activeStat
      ) &&
      d.currentStatus !== activeStat
    ) {
      return false;
    }

    if (useSearch && search.trim()) {
      const q = search.toLowerCase();
      if (!rowSearchText(d).includes(q)) return false;
    }

    const pl = d.parsedLoc || {};

    if (filterLoc.cluster !== "ALL" && pl.cluster !== filterLoc.cluster) {
      return false;
    }

    if (filterLoc.building !== "ALL" && pl.building !== filterLoc.building) {
      return false;
    }

    if (filterLoc.zone !== "ALL" && pl.zone !== filterLoc.zone) {
      return false;
    }

    return true;
  }

  const filtered = useMemo(() => {
    const realRows = devicesMapped.filter((d) => passesFilter(d, true));

    if (!search.trim()) {
      return realRows;
    }

    const virtualMatches = replacementRows.filter((d) => passesFilter(d, true));

    if (!virtualMatches.length) {
      return realRows;
    }

    const replacementSourceIds = new Set(
      virtualMatches.map((d) => normalizeId(d._sourceDeviceId))
    );

    const realWithoutDuplicatedReplacementDevices = realRows.filter(
      (d) => !replacementSourceIds.has(normalizeId(d.id))
    );

    return [...virtualMatches, ...realWithoutDuplicatedReplacementDevices];
  }, [devicesMapped, replacementRows, activeStat, search, filterLoc]);

  function exportRows(sourceRows = filtered) {
    return sourceRows.map((dev) => ({
      id: dev._sourceDeviceId || dev.id,
      displayType: dev._virtualReplacement
        ? dev._replacementSide === "OLD"
          ? "OLD_SNAPSHOT"
          : "NEW_CURRENT"
        : "CURRENT_DEVICE",
      replacementRecordId: dev._replacementRecordId || "",
      deviceCode: dev.deviceCode || "",
      deviceName: dev.deviceName || "",
      barcode: dev.barcode || "",
      serialNumber: dev.serialNumber || "",
      ipAddress: dev.ipAddress || "",
      firmware: dev.firmware || "",
      currentStatus: dev.currentStatus || "",
      scanStatus: dev.inspectionInfo?.hasInspection
        ? "INSPECTED"
        : "NOT_INSPECTED",
      riskLevel: dev.inspectionInfo?.riskLevel || "Not Inspected",
      inspectionCount: dev.inspectionInfo?.inspectionCount || 0,
      lastInspectionDate: dev.inspectionInfo?.lastInspectionDate || "",
      lastTechnician: dev.inspectionInfo?.lastTechnician || "",
      cluster: dev.parsedLoc?.cluster || "",
      building: dev.parsedLoc?.building || "",
      zone: dev.parsedLoc?.zone || "",
      lane: dev.parsedLoc?.lane || "",
      direction: dev.parsedLoc?.direction || "",
    }));
  }

  function downloadCsvFromRows(rows, filename) {
    const headers = [
      "id",
      "displayType",
      "replacementRecordId",
      "deviceCode",
      "deviceName",
      "barcode",
      "serialNumber",
      "ipAddress",
      "firmware",
      "currentStatus",
      "scanStatus",
      "riskLevel",
      "inspectionCount",
      "lastInspectionDate",
      "lastTechnician",
      "cluster",
      "building",
      "zone",
      "lane",
      "direction",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => safeCsv(row[h])).join(",")),
    ].join("\n");

    downloadTextFile(filename, csv, "text/csv;charset=utf-8;");
  }

  function handleExportCsv() {
    downloadCsvFromRows(
      exportRows(filtered),
      `devices_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  function handleExportMissingCsv() {
    const missing = devicesMapped.filter((d) => !d.inspectionInfo?.hasInspection);

    downloadCsvFromRows(
      exportRows(missing),
      `not_inspected_devices_${new Date().toISOString().slice(0, 10)}.csv`
    );
  }

  function resetFilters() {
    setActiveStat("ALL");
    setSearch("");
    setFilterLoc({
      cluster: "ALL",
      building: "ALL",
      zone: "ALL",
    });
  }

  function openReplace(device) {
    if (device?._replacementSide === "OLD") {
      setScreen("REPLACEMENTS");
      return;
    }

    setSelectedDevice(null);
    setReplaceDevice({
      ...device,
      id: device._sourceDeviceId || device.id,
    });
  }

  function handleReplaceSaved() {
    setReplaceDevice(null);
    setReplacementRefreshKey((old) => old + 1);
    loadReplacements();
    setScreen("REPLACEMENTS");
  }

  if (screen === "REPLACEMENTS") {
    return (
      <DeviceReplacementPage
        refreshKey={replacementRefreshKey}
        onBack={() => {
          setScreen("DEVICES");
          loadReplacements();
        }}
      />
    );
  }

  return (
    <div className="lux-tp-root">
      <div className="lux-page-head">
        <div>
          <h1 className="lux-page-title">Global Device Directory</h1>
          <p className="lux-page-sub">
            <span className="lux-pulse"></span>
            Live connection established. Hardware data synchronized.
          </p>
        </div>

        <div className="lux-top-actions">
          <button
            className="lux-phone-button"
            onClick={() => setScreen("REPLACEMENTS")}
            title="Open device replacement log"
          >
            <span className="lux-phone-icon">📱</span>
            <span className="lux-phone-text">
              <strong>Replacement Log</strong>
              <span>Old and new snapshots</span>
            </span>
          </button>

          {onBack ? (
            <button className="lux-btn-outline" onClick={onBack}>
              Back
            </button>
          ) : null}

          <button className="lux-btn-outline" onClick={handleExportMissingCsv}>
            Export Not Inspected
          </button>

          <button className="lux-btn-outline" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="lux-kpi-grid">
        {[
          { key: "ALL", label: "Fleet Size", val: stats.total, color: "#263746" },
          {
            key: "INSPECTION_RECORDS",
            label: "Inspection Records",
            val: stats.inspectionRecords,
            color: "#0ea5e9",
            locked: true,
          },
          {
            key: "HAS_INSPECTION",
            label: "Inspected Devices",
            val: stats.inspected,
            color: "#10b981",
          },
          {
            key: "NOT_INSPECTED",
            label: "Not Inspected",
            val: stats.notInspected,
            color: "#ef4444",
          },
          {
            key: "STALE_SCAN",
            label: "No / Old Scan",
            val: stats.stale,
            color: "#f97316",
          },
          { key: "OK", label: "Operational", val: stats.ok, color: "#10b981" },
          {
            key: "NEEDS_MAINTENANCE",
            label: "Degraded",
            val: stats.maint,
            color: "#f59e0b",
          },
          {
            key: "UNDER_MAINTENANCE",
            label: "Under Repair",
            val: stats.under,
            color: "#6366f1",
          },
          {
            key: "OUT_OF_SERVICE",
            label: "Offline/Dead",
            val: stats.out,
            color: "#ef4444",
          },
        ].map(({ key, label, val, color, locked }) => (
          <div
            key={key}
            className={`lux-kpi-card ${activeStat === key ? "active" : ""}`}
            onClick={() => !locked && setActiveStat(key)}
            style={locked ? { cursor: "default" } : undefined}
          >
            <div className="lux-kpi-title">{label}</div>
            <div className="lux-kpi-val" style={{ color }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      <div className="lux-audit-board">
        <div className="lux-audit-head">
          <div>
            <div className="lux-audit-title">Inspection Command Center</div>

            <div className="lux-audit-sub">
              All numbers are calculated from backend devices and inspections.
            </div>

            <div className="lux-audit-sub" style={{ marginTop: 4 }}>
              Backend inspection records: <b>{stats.inspectionRecords}</b> ·
              Matched inspected devices: <b>{stats.inspected}</b>
            </div>

            <div className="lux-chip-row">
              <button className="lux-chip" onClick={() => setActiveStat("NOT_INSPECTED")}>
                Show not inspected
              </button>

              <button className="lux-chip" onClick={() => setActiveStat("STALE_SCAN")}>
                Show stale scans
              </button>

              <button className="lux-chip" onClick={handleExportMissingCsv}>
                Download missing list
              </button>

              <button className="lux-chip" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          </div>

          <div className="lux-coverage-ring" style={{ "--p": `${stats.coveragePct}%` }}>
            <div className="lux-coverage-ring-inner">{stats.coveragePct}%</div>
          </div>
        </div>
      </div>

      <div className="lux-filter-bar">
        <div className="lux-search-box">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            type="text"
            placeholder="Smart Search: Device ID, Name, Serial, IP, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lux-select-wrap">
          <label>Cluster</label>
          <select
            className="lux-select"
            value={filterLoc.cluster}
            onChange={(e) =>
              setFilterLoc({ ...filterLoc, cluster: e.target.value })
            }
          >
            <option value="ALL">All Clusters</option>
            {uniqueLocs.cluster.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-select-wrap">
          <label>Sector / Zone</label>
          <select
            className="lux-select"
            value={filterLoc.zone}
            onChange={(e) =>
              setFilterLoc({ ...filterLoc, zone: e.target.value })
            }
          >
            <option value="ALL">All Zones</option>
            {uniqueLocs.zone.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-select-wrap">
          <label>Facility</label>
          <select
            className="lux-select"
            value={filterLoc.building}
            onChange={(e) =>
              setFilterLoc({ ...filterLoc, building: e.target.value })
            }
          >
            <option value="ALL">All Facilities</option>
            {uniqueLocs.building.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-summary-note">
          Showing {filtered.length} devices
        </div>
      </div>

      <div className="lux-hw-grid">
        {filtered.map((dev) => {
          const sMeta = STATUS_META[dev.currentStatus || "OK"] || STATUS_META.OK;
          const audit = dev.inspectionInfo;
          const isReplacementOld = dev._replacementSide === "OLD";
          const isReplacementNew = dev._replacementSide === "NEW";

          return (
            <div
              key={dev.id}
              className={[
                "lux-hw-card",
                !audit?.hasInspection ? "lux-card-alert" : "",
                dev._virtualReplacement ? "lux-replacement-card" : "",
                isReplacementOld ? "lux-replacement-old" : "",
              ].join(" ")}
            >
              <div className="lux-hw-head">
                <div style={{ display: "flex", gap: 12 }}>
                  <div className="lux-hw-icon">
                    {dev.deviceName ? dev.deviceName[0].toUpperCase() : "H"}
                  </div>

                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                      {dev.deviceCode || "N/A"}
                    </div>

                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>
                      {dev.deviceName}
                    </div>
                  </div>
                </div>

                <div className="lux-card-top-actions">
                  <button
                    className="lux-replace-round"
                    title={isReplacementOld ? "Open Replacement Log" : "Replace this device"}
                    onClick={() => openReplace(dev)}
                  >
                    📱
                  </button>

                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: sMeta.color,
                      boxShadow: `0 0 0 4px ${sMeta.bg}`,
                    }}
                  ></div>
                </div>
              </div>

              {dev._virtualReplacement ? (
                <div className={`lux-replacement-ribbon ${isReplacementOld ? "old" : ""}`}>
                  <span>
                    {isReplacementOld ? "OLD LOCATION SNAPSHOT" : "NEW / CURRENT LOCATION"}
                  </span>
                  <span>Record #{dev._replacementRecordId}</span>
                </div>
              ) : !audit?.hasInspection ? (
                <div className="lux-priority-ribbon">
                  <span>Not inspected yet</span>
                  <span>Priority</span>
                </div>
              ) : null}

              <div className="lux-scan-row">
                <span
                  className="lux-scan-badge"
                  style={{
                    background: audit?.riskBg,
                    color: audit?.riskColor,
                  }}
                >
                  {audit?.hasInspection ? "INSPECTED" : "NOT INSPECTED"}
                </span>

                <span className="lux-mini-muted">
                  Last: {formatDateTimeSafe(audit?.lastInspectionDate)}
                </span>
              </div>

              <div className="lux-hw-body">
                <div className="lux-hw-stat">
                  <span>Cluster</span>
                  <span>{dev.parsedLoc.cluster || "Unknown"}</span>
                </div>

                <div className="lux-hw-stat">
                  <span>Zone</span>
                  <span>{dev.parsedLoc.zone || "—"}</span>
                </div>

                <div className="lux-hw-stat">
                  <span>IP Address</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {dev.ipAddress || "DHCP"}
                  </span>
                </div>

                <div className="lux-hw-stat">
                  <span>Direction</span>
                  <span>{dev.parsedLoc.direction || "—"}</span>
                </div>

                <div className="lux-hw-stat">
                  <span>Lane</span>
                  <span>{dev.parsedLoc.lane || "—"}</span>
                </div>

                <div className="lux-hw-stat">
                  <span>Scan Logs</span>
                  <span>{audit?.inspectionCount || 0}</span>
                </div>
              </div>

              <div className="lux-card-actions">
                <button
                  className="lux-btn-readmore"
                  onClick={() => setSelectedDevice(dev)}
                >
                  Read More Details →
                </button>

                <button
                  className="lux-replace-mini"
                  title={isReplacementOld ? "Open Replacement Log" : "Replace"}
                  onClick={() => openReplace(dev)}
                >
                  📱
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="lux-empty">
            No devices match the specified criteria.
          </div>
        )}
      </div>

      {selectedDevice && (
        <DeviceDetailsOverlay
          device={selectedDevice}
          inspections={
            selectedDevice.inspectionInfo?.relatedInspections ||
            inspections.filter((i) => deviceMatchesInspection(selectedDevice, i))
          }
          onBack={() => setSelectedDevice(null)}
        />
      )}

      {replaceDevice && (
        <DeviceReplaceModal
          device={replaceDevice}
          onClose={() => setReplaceDevice(null)}
          onSaved={handleReplaceSaved}
        />
      )}
    </div>
  );
}

export default DevicesPage;