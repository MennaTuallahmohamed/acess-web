import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_API_BASE_URL = "https://acess-backend-production-8856.up.railway.app";
const EXPECTED_NOT_INSPECTED_COUNT = 170;

/* =========================================================
   SMART IT — TRUE REPORTS DASHBOARD
   Source of truth:
   1) GET /reports/devices-scan-report
   2) GET /inspections or /reports/latest-inspections

   Important rule:
   Device is NOT_SCANNED when it has zero Inspection records.
========================================================= */

/* =========================
   API HELPERS
========================= */

function getApiBase(apiBase = "") {
  const cleanProp = String(apiBase || "").trim().replace(/\/+$/, "");

  if (
    cleanProp &&
    !cleanProp.includes("localhost") &&
    !cleanProp.includes("127.0.0.1")
  ) {
    return cleanProp;
  }

  const saved =
    String(localStorage.getItem("dashboard_api_base_url") || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(localStorage.getItem("apiBaseUrl") || "")
      .trim()
      .replace(/\/+$/, "") ||
    String(localStorage.getItem("baseUrl") || "")
      .trim()
      .replace(/\/+$/, "");

  if (
    saved &&
    !saved.includes("localhost") &&
    !saved.includes("127.0.0.1")
  ) {
    return saved;
  }

  return DEFAULT_API_BASE_URL;
}

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
}

async function apiGetJson(base, path) {
  const token = getToken();

  const res = await fetch(`${base}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${path} HTTP ${res.status} ${text}`);
  }

  return res.json();
}

async function tryPaths(base, paths, validator) {
  let lastError = null;

  for (const path of paths) {
    try {
      const data = await apiGetJson(base, path);

      if (validator && !validator(data)) {
        throw new Error(`${path} returned invalid format`);
      }

      return { data, path };
    } catch (err) {
      lastError = err;
      console.warn("Failed endpoint:", path, err);
    }
  }

  throw lastError || new Error("All endpoints failed");
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }

  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.inspections)) return payload.inspections;
  if (Array.isArray(payload?.devices)) return payload.devices;
  if (Array.isArray(payload?.locations)) return payload.locations;

  return [];
}

async function apiGetReportSummary(base) {
  return tryPaths(
    base,
    [
      "/reports/devices-scan-report",
      "/reports/locations-scan-summary",
      "/api/reports/devices-scan-report",
      "/api/reports/locations-scan-summary",
    ],
    (data) => data && Array.isArray(data.locations)
  );
}

async function apiGetAllInspections(base) {
  try {
    return await tryPaths(
      base,
      [
        "/inspections",
        "/api/inspections",
        "/reports/latest-inspections",
        "/api/reports/latest-inspections",
        "/viewer/inspections",
        "/dashboard/inspections",
        "/dashboard/viewer/inspections",
      ],
      (data) => extractArray(data, ["inspections", "latestInspections", "data", "items"]).length >= 0
    );
  } catch {
    return { data: [], path: "" };
  }
}

/* =========================
   COMMON HELPERS
========================= */

function safe(value) {
  if (value === undefined || value === null || value === "") return "—";
  return value;
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

function includesNormalized(text, query) {
  const q = normalizeText(query);
  if (!q) return true;
  return normalizeText(text).includes(q);
}

function fmtDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function arStatus(status) {
  const map = {
    OK: "سليم",
    NOT_OK: "عطل كامل",
    PARTIAL: "عطل جزئي",
    NOT_REACHABLE: "غير متاح",
    NEEDS_MAINTENANCE: "يحتاج صيانة",
    UNDER_MAINTENANCE: "تحت الصيانة",
    OUT_OF_SERVICE: "خارج الخدمة",
    PENDING: "معلق",
    DONE: "تم",
    FAILED: "فشل",
    SKIPPED: "تم تخطيه",
    OPEN: "مفتوح",
    IN_PROGRESS: "قيد التنفيذ",
    RESOLVED: "تم الحل",
    UNRESOLVED: "لم يتم الحل",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
    ACTIVE: "نشط",
    INACTIVE: "غير نشط",
    SCANNED: "تم فحصه",
    NOT_SCANNED: "لم يتم فحصه",
    ALL_SCANNED: "كل الأجهزة اتفحصت",
    HAS_NOT_SCANNED_DEVICES: "يوجد أجهزة لم تفحص",
  };

  return map[status] || status || "—";
}

function statusClass(status) {
  if (
    ["OK", "DONE", "RESOLVED", "COMPLETED", "ACTIVE", "SCANNED", "ALL_SCANNED"].includes(
      status
    )
  ) {
    return "good";
  }

  if (
    [
      "NOT_OK",
      "FAILED",
      "OUT_OF_SERVICE",
      "UNRESOLVED",
      "INACTIVE",
      "NOT_SCANNED",
      "HAS_NOT_SCANNED_DEVICES",
    ].includes(status)
  ) {
    return "bad";
  }

  if (
    [
      "PARTIAL",
      "NEEDS_MAINTENANCE",
      "IN_PROGRESS",
      "UNDER_MAINTENANCE",
      "PENDING",
      "NOT_REACHABLE",
    ].includes(status)
  ) {
    return "warn";
  }

  return "muted";
}

function getImages(obj) {
  if (!obj) return [];

  const possible =
    obj.images ||
    obj.inspectionImages ||
    obj.photos ||
    obj.attachments ||
    obj.files ||
    [];

  return Array.isArray(possible) ? possible : [];
}

function getImagePath(img) {
  if (!img) return "";
  if (typeof img === "string") return img;

  return (
    img.imageUrl ||
    img.url ||
    img.secureUrl ||
    img.path ||
    img.filePath ||
    img.fullPath ||
    img.filename ||
    img.fileName ||
    img.name ||
    ""
  );
}

function fixImageUrl(value, apiBase = "") {
  if (!value) return "";

  let raw = String(value).trim().replace(/\\/g, "/");
  if (!raw) return "";

  const base = getApiBase(apiBase);

  raw = raw
    .replace("http://localhost:3000", base)
    .replace("https://localhost:3000", base)
    .replace("http://127.0.0.1:3000", base)
    .replace("https://127.0.0.1:3000", base)
    .replace("http://localhost:5173", base)
    .replace("https://localhost:5173", base)
    .replace("http://127.0.0.1:5173", base)
    .replace("https://127.0.0.1:5173", base);

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return `${base}${raw}`;

  return `${base}/${raw}`;
}

function getDeviceId(device) {
  return device?.id || device?.deviceId || device?.ID || null;
}

function getLocationId(location) {
  return location?.id || location?.locationId || location?.ID || null;
}

function getDeviceDisplayName(device = {}) {
  return (
    device.deviceName ||
    device.name ||
    device.deviceCode ||
    device.code ||
    device.serialNumber ||
    `Device #${safe(getDeviceId(device))}`
  );
}

function getLocationDisplay(location = {}) {
  const parts = [
    location.cluster,
    location.building,
    location.zone,
    location.lane,
    location.direction,
    location.type,
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : `Location #${safe(getLocationId(location))}`;
}

function getTechObj(input) {
  return input?.technician || input?.lastTechnician || input?.user || input?.createdBy || {};
}

function getTechName(input) {
  const tech = getTechObj(input);

  return (
    tech.fullName ||
    tech.username ||
    tech.email ||
    input?.technicianName ||
    input?.techName ||
    input?.createdByName ||
    (input?.technicianId ? `#${input.technicianId}` : "—")
  );
}

function getTechId(input) {
  const tech = getTechObj(input);
  return input?.technicianId || tech?.id || input?.userId || input?.createdById || "";
}

function getDeviceLocation(device = {}) {
  return device.location || {};
}

function normalizeInspection(raw, fallbackLocation = null) {
  const device = raw?.device || {};
  const location = device.location || raw?.location || fallbackLocation || {};
  const technician = getTechObj(raw);

  return {
    ...raw,
    id: raw?.id,
    deviceId: raw?.deviceId || device?.id,
    technicianId: raw?.technicianId || technician?.id || raw?.userId || raw?.createdById,
    inspectionStatus:
      String(raw?.inspectionStatus || raw?.status || "NOT_REACHABLE").toUpperCase(),
    inspectedAt: raw?.inspectedAt || raw?.createdAt || null,
    createdAt: raw?.createdAt || raw?.inspectedAt || null,
    technician: {
      ...technician,
      fullName:
        technician.fullName ||
        technician.name ||
        raw?.technicianName ||
        raw?.techName ||
        technician.username ||
        technician.email ||
        "",
    },
    device: {
      ...device,
      id: device.id || raw?.deviceId,
      location: {
        ...location,
      },
    },
  };
}

function exportCsv(filename, rows) {
  const escapeCell = (v) => {
    const text = String(v ?? "");
    if (text.includes(",") || text.includes('"') || text.includes("\n")) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

/* =========================
   CSS
========================= */

const CSS = `
html, body, #root { height: 100%; }
body { overflow: hidden; }

.smart-inspections-page {
  height: 100vh;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 10% 0%, rgba(79,70,229,.12), transparent 28%),
    radial-gradient(circle at 90% 10%, rgba(16,185,129,.10), transparent 25%),
    #f4f7fb;
  padding: 18px;
  box-sizing: border-box;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.smart-shell {
  width: 100%;
  max-width: 1760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 60px;
}

.smart-hero {
  background:
    linear-gradient(135deg, rgba(15,23,42,.97), rgba(30,41,59,.94)),
    radial-gradient(circle at top right, rgba(79,70,229,.45), transparent 45%);
  color: white;
  border-radius: 28px;
  padding: 22px;
  box-shadow: 0 22px 60px rgba(15,23,42,.18);
  overflow: hidden;
  position: relative;
}

.smart-hero::before {
  content: "";
  position: absolute;
  width: 380px;
  height: 380px;
  right: -120px;
  top: -160px;
  background: radial-gradient(circle, rgba(99,102,241,.48), transparent 65%);
  border-radius: 50%;
}

.smart-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.smart-title-wrap {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.smart-logo {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 14px 35px rgba(79,70,229,.35);
  font-size: 24px;
  flex: 0 0 auto;
}

.smart-eyebrow {
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 1.3px;
  margin-bottom: 6px;
}

.smart-title {
  margin: 0;
  color: white;
  font-size: clamp(25px, 3vw, 38px);
  line-height: 1.06;
  font-weight: 950;
  letter-spacing: -1.3px;
}

.smart-subtitle {
  margin-top: 9px;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.65;
  max-width: 900px;
}

.smart-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.smart-btn {
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(15,23,42,.10);
  border-radius: 13px;
  background: white;
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  transition: .18s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  white-space: nowrap;
}

.smart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15,23,42,.14);
}

.smart-btn.primary {
  color: white;
  border-color: transparent;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 14px 30px rgba(79,70,229,.30);
}

.smart-btn.danger {
  color: white;
  border-color: transparent;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.smart-btn.glass {
  color: white;
  background: rgba(255,255,255,.10);
  border-color: rgba(255,255,255,.16);
  backdrop-filter: blur(10px);
}

.smart-btn.small {
  height: 34px;
  padding: 0 11px;
  font-size: 12px;
}

.smart-toggle {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 14px;
}

.smart-toggle button {
  height: 32px;
  padding: 0 13px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

.smart-toggle button.active {
  background: white;
  color: #0f172a;
}

.error-box,
.success-box,
.warning-box {
  border-radius: 16px;
  padding: 13px 15px;
  font-weight: 850;
  font-size: 13px;
  line-height: 1.6;
}

.error-box {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

.success-box {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.warning-box {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fde68a;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 12px;
}

.stat-card {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 22px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  position: relative;
  overflow: hidden;
}

.stat-card.clickable {
  cursor: pointer;
  transition: .18s ease;
}

.stat-card.clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(15,23,42,.12);
  border-color: rgba(79,70,229,.28);
}

.stat-card.clickable::after {
  content: "Click";
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .4px;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--stat-color, #4f46e5);
}

.stat-label {
  color: #64748b;
  font-size: 11px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .75px;
}

.stat-value {
  display: block;
  color: var(--stat-color, #0f172a);
  font-size: 29px;
  line-height: 1;
  font-weight: 950;
  margin-top: 10px;
  letter-spacing: -1px;
}

.stat-sub {
  display: block;
  margin-top: 7px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 750;
}

.panel {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.06);
  padding: 16px;
}

.panel-title {
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
  margin-bottom: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tab-btn {
  height: 40px;
  padding: 0 15px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #334155;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
}

.tab-btn.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(260px, 2fr) minmax(190px, 1.2fr) repeat(4, minmax(130px, 1fr)) repeat(2, auto);
  gap: 10px;
  align-items: end;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field label {
  color: #64748b;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .75px;
}

.filter-field input,
.filter-field select {
  height: 40px;
  border: 1px solid rgba(15,23,42,.10);
  border-radius: 13px;
  outline: 0;
  background: #f8fafc;
  padding: 0 12px;
  color: #0f172a;
  font-size: 13px;
  font-weight: 750;
}

.check-pill {
  height: 40px;
  padding: 0 12px;
  border-radius: 13px;
  background: #f8fafc;
  border: 1px solid rgba(15,23,42,.10);
  color: #334155;
  font-size: 12px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.check-pill input {
  accent-color: #4f46e5;
}

.location-grid,
.device-list,
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.location-card,
.device-card,
.inspection-card {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  overflow: hidden;
  transition: .18s ease;
}

.location-card,
.inspection-card {
  cursor: pointer;
}

.location-card:hover,
.device-card:hover,
.inspection-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 42px rgba(15,23,42,.10);
}

.card-cover {
  height: 185px;
  background: #e2e8f0;
  position: relative;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: #e2e8f0;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #eef2ff, #f8fafc);
  color: #64748b;
  font-size: 13px;
  font-weight: 950;
  text-align: center;
  padding: 20px;
}

.photo-count {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15,23,42,.78);
  color: white;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 950;
}

.card-body,
.device-card {
  padding: 15px;
}

.card-topline {
  display: flex;
  justify-content: space-between;
  gap: 9px;
  align-items: flex-start;
  margin-bottom: 11px;
}

.card-id {
  color: #4f46e5;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 950;
}

.card-title,
.device-name {
  color: #0f172a;
  font-size: 17px;
  line-height: 1.25;
  font-weight: 950;
  margin-bottom: 8px;
}

.device-name {
  font-size: 14px;
}

.card-meta,
.device-meta {
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
  font-weight: 700;
}

.card-tags,
.device-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 950;
  border: 1px solid transparent;
  white-space: nowrap;
}

.tag.good { background: #dcfce7; color: #15803d; border-color: #86efac; }
.tag.bad { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
.tag.warn { background: #fef9c3; color: #a16207; border-color: #fde68a; }
.tag.muted { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }
.tag.info { background: #dbeafe; color: #1d4ed8; border-color: #bfdbfe; }
.tag.purple { background: #f3e8ff; color: #7e22ce; border-color: #e9d5ff; }
.tag.orange { background: #ffedd5; color: #c2410c; border-color: #fed7aa; }

.state-card {
  min-height: 260px;
  display: grid;
  place-items: center;
  text-align: center;
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.06);
  color: #64748b;
  font-size: 14px;
  font-weight: 850;
  padding: 25px;
}

.spinner {
  width: 54px;
  height: 54px;
  border: 5px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 999px;
  margin: 0 auto 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.table-card {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  max-height: calc(100vh - 405px);
  min-height: 360px;
  overflow: auto;
}

.smart-table {
  width: 100%;
  min-width: 1250px;
  border-collapse: collapse;
}

.smart-table th {
  position: sticky;
  top: 0;
  z-index: 3;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 950;
  padding: 13px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  white-space: nowrap;
}

.smart-table td {
  padding: 12px 13px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  font-size: 13px;
  font-weight: 720;
  vertical-align: top;
}

.smart-table tbody tr:hover td { background: #f8fafc; }
.clickable-row { cursor: pointer; }

.thumb-list {
  display: flex;
  gap: 6px;
  align-items: center;
}

.thumb {
  width: 54px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  background: #e2e8f0;
  border: 1px solid #e5e7eb;
}

.split-layout {
  display: grid;
  grid-template-columns: 410px 1fr;
  gap: 14px;
  align-items: start;
}

.side-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: calc(100vh - 375px);
  overflow: auto;
  padding-right: 3px;
}

.location-row {
  border: 1px solid #e5e7eb;
  background: #fff;
  border-radius: 18px;
  padding: 13px;
  cursor: pointer;
  transition: .18s ease;
}

.location-row:hover {
  border-color: #c7d2fe;
  box-shadow: 0 10px 24px rgba(15,23,42,.07);
}

.location-row.active {
  border-color: #4f46e5;
  background: #eef2ff;
}

.location-row-title {
  color: #0f172a;
  font-size: 14px;
  font-weight: 950;
  margin-bottom: 7px;
}

.location-row-meta {
  color: #64748b;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.6;
}

.location-details {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.location-header {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  padding: 18px;
}

.location-header-title {
  color: #0f172a;
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -.4px;
}

.location-header-sub {
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
  margin-top: 8px;
  line-height: 1.7;
}

.mini-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-top: 14px;
}

.mini-stat {
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 16px;
  padding: 12px;
}

.mini-stat strong {
  display: block;
  color: #0f172a;
  font-size: 22px;
  font-weight: 950;
}

.mini-stat span {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 950;
  text-transform: uppercase;
  margin-top: 3px;
}

.section {
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  padding: 16px;
  background: #fff;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 950;
  margin-bottom: 14px;
}

.section-title::after {
  content: "";
  height: 1px;
  background: #e5e7eb;
  flex: 1;
}

.empty {
  color: #94a3b8;
  font-size: 13px;
  font-weight: 850;
  padding: 14px;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 13px;
}

.image-card {
  border: 1px solid #e5e7eb;
  border-radius: 17px;
  overflow: hidden;
  background: #f8fafc;
}

.image-card img {
  display: block;
  width: 100%;
  height: 175px;
  object-fit: cover;
  cursor: pointer;
  background: #e5e7eb;
}

.missing-image-box {
  height: 175px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
  background: #f1f5f9;
  color: #64748b;
  font-weight: 950;
  font-size: 13px;
  line-height: 1.5;
  border-bottom: 1px solid #e5e7eb;
}

.image-body {
  padding: 10px;
  font-size: 12px;
  color: #475569;
  font-weight: 800;
  line-height: 1.55;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.62);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 28px 14px;
  z-index: 9999;
  overflow-y: auto;
  overflow-x: hidden;
  backdrop-filter: blur(8px);
}

.modal {
  width: 100%;
  max-width: 1180px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 25px 80px rgba(15,23,42,.34);
  overflow: hidden;
  margin-bottom: 50px;
}

.modal-head {
  padding: 22px 26px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  background: linear-gradient(135deg, #f8fafc, #eef2ff);
}

.modal-eyebrow {
  display: block;
  font-size: 12px;
  color: #64748b;
  font-weight: 950;
  margin-bottom: 6px;
}

.modal-title {
  font-size: 22px;
  color: #0f172a;
  font-weight: 950;
  line-height: 1.25;
}

.modal-sub {
  margin-top: 7px;
  color: #64748b;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.6;
}

.modal-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 11px;
}

.modal-close {
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #0f172a;
  width: 38px;
  height: 38px;
  border-radius: 13px;
  font-size: 20px;
  cursor: pointer;
  flex-shrink: 0;
}

.modal-body {
  padding: 24px 26px 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.info-box {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px;
  min-height: 70px;
}

.info-key {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 950;
  margin-bottom: 5px;
}

.info-val {
  color: #0f172a;
  font-size: 13px;
  font-weight: 850;
  word-break: break-word;
}

.summary-modal-table-wrap {
  max-height: 62vh;
  overflow: auto;
  border-radius: 18px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.summary-modal-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

.summary-modal-table th {
  position: sticky;
  top: 0;
  z-index: 2;
  background: #f8fafc;
  color: #475569;
  font-size: 11px;
  font-weight: 950;
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.summary-modal-table td {
  color: #0f172a;
  font-size: 12px;
  font-weight: 750;
  padding: 11px 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.summary-modal-table tr:hover td {
  background: #f8fafc;
}

.modal-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 1450px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
  .filters-grid { grid-template-columns: repeat(3, 1fr); }
  .split-layout { grid-template-columns: 360px 1fr; }
  .mini-stats { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 1050px) {
  .split-layout { grid-template-columns: 1fr; }
  .side-list { max-height: 360px; }
  .mini-stats { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 950px) {
  .stats-grid, .filters-grid, .location-grid, .device-list, .grid-view {
    grid-template-columns: 1fr;
  }
  .info-grid { grid-template-columns: repeat(2, 1fr); }
  .smart-hero-inner { flex-direction: column; }
  .smart-actions { justify-content: flex-start; }
}

@media (max-width: 560px) {
  .smart-inspections-page { padding: 10px; }
  .stats-grid, .info-grid, .mini-stats { grid-template-columns: 1fr; }
  .modal-body { padding: 18px; }
}
`;

function injectStyles() {
  if (document.getElementById("smartit-reports-dashboard-css")) return;

  const el = document.createElement("style");
  el.id = "smartit-reports-dashboard-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({ label, value, sub, color, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? "clickable" : ""}`}
      style={{ "--stat-color": color || "#4f46e5" }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <span className="stat-label">{label}</span>
      <span className="stat-value">{safe(value)}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="mini-stat">
      <strong>{safe(value)}</strong>
      <span>{label}</span>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="info-box">
      <span className="info-key">{label}</span>
      <span className="info-val">{safe(value)}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="smart-inspections-page">
      <div className="state-card">
        <div>
          <div className="spinner" />
          جاري تحميل التقرير الصحيح من الباك إند...
        </div>
      </div>
    </div>
  );
}

/* =========================
   IMAGE COMPONENTS
========================= */

function FirstImagePreview({ inspection, apiBase }) {
  const [failed, setFailed] = useState(false);
  const images = getImages(inspection);
  const first = images[0];
  const path = getImagePath(first);
  const src = fixImageUrl(path, apiBase);

  if (!src || failed) {
    return <div className="no-photo">No image uploaded</div>;
  }

  return (
    <img
      src={src}
      alt={`Inspection ${inspection?.id || "image"}`}
      onError={() => setFailed(true)}
    />
  );
}

function InspectionImage({ img, index, inspectionId, apiBase }) {
  const [failed, setFailed] = useState(false);
  const imagePath = getImagePath(img);
  const src = fixImageUrl(imagePath, apiBase);

  return (
    <div className="image-card">
      {failed || !src ? (
        <div className="missing-image-box">
          الصورة لم تظهر
          <br />
          تأكدي أن الملف موجود في السيرفر
        </div>
      ) : (
        <img
          src={src}
          alt={`Inspection ${inspectionId} image ${index + 1}`}
          onClick={() => window.open(src, "_blank")}
          onError={() => setFailed(true)}
        />
      )}

      <div className="image-body">
        <div>Image ID: {safe(img?.id)}</div>
        <div>Type: {safe(img?.imageType || img?.type || "general")}</div>
        <div>Created: {fmtDateTime(img?.createdAt)}</div>
        <div style={{ wordBreak: "break-all" }}>Path: {safe(imagePath)}</div>
      </div>
    </div>
  );
}

function TableThumbs({ inspection, apiBase }) {
  const images = getImages(inspection).slice(0, 3);

  if (!images.length) {
    return <span className="tag info">0 image</span>;
  }

  return (
    <div className="thumb-list">
      {images.map((img, index) => {
        const src = fixImageUrl(getImagePath(img), apiBase);

        return (
          <img
            key={img?.id || index}
            className="thumb"
            src={src}
            alt={`thumb ${index + 1}`}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        );
      })}

      <span className="tag good">{getImages(inspection).length} image</span>
    </div>
  );
}

/* =========================
   CARDS
========================= */

function LocationCard({ locationSummary, onOpen }) {
  const {
    location,
    devices,
    inspections,
    uninspectedDevices,
    counts,
    lastInspectionAt,
    scanStatus,
  } = locationSummary;

  const missingCount =
    counts?.notInspectedDevices ?? uninspectedDevices?.length ?? 0;

  return (
    <div className="location-card" onClick={() => onOpen(locationSummary)}>
      <div className="card-body">
        <div className="card-topline">
          <span className="card-id">Location #{safe(getLocationId(location))}</span>
          <span className={`tag ${missingCount ? "warn" : "good"}`}>
            {missingCount ? `${missingCount} لم يتم فحصهم` : "كل الأجهزة اتفحصت"}
          </span>
        </div>

        <div className="card-title">{getLocationDisplay(location)}</div>

        <div className="card-meta">
          Cluster: {safe(location.cluster)}
          <br />
          Building: {safe(location.building)}
          <br />
          Zone: {safe(location.zone)} · Lane: {safe(location.lane)}
          <br />
          Last inspection: {fmtDateTime(lastInspectionAt)}
        </div>

        <div className="card-tags">
          <span className="tag info">{counts?.totalDevices ?? devices.length} أجهزة</span>
          <span className="tag good">{counts?.inspectedDevices ?? 0} تم فحصهم</span>
          <span className="tag warn">{missingCount} لم يتم فحصهم</span>
          <span className="tag purple">{inspections.length} تفتيش</span>
          <span className={`tag ${statusClass(scanStatus)}`}>{arStatus(scanStatus)}</span>
        </div>
      </div>
    </div>
  );
}

function DeviceCard({ device, latestInspection, onOpenInspection }) {
  const hasInspection =
    Boolean(latestInspection) ||
    device?.isInspected === true ||
    device?.scanStatus === "SCANNED";

  const loc = getDeviceLocation(device);
  const inspection = latestInspection || device?.latestInspection || null;

  return (
    <div className="device-card">
      <div className="card-topline">
        <span className="card-id">Device #{safe(getDeviceId(device))}</span>
        <span className={`tag ${hasInspection ? "good" : "warn"}`}>
          {hasInspection ? "تم فحصه" : "لم يتم فحصه"}
        </span>
      </div>

      <div className="device-name">{getDeviceDisplayName(device)}</div>

      <div className="device-meta">
        Code: {safe(device.deviceCode || device.code)}
        <br />
        Serial: {safe(device.serialNumber)}
        <br />
        Barcode: {safe(device.barcode)}
        <br />
        IP: {safe(device.ipAddress)}
        <br />
        Type: {safe(device.deviceType?.name)}
        <br />
        Current Status: {arStatus(device.currentStatus)}
        <br />
        Location: {getLocationDisplay(loc)}
        <br />
        Last Inspection:{" "}
        {inspection
          ? fmtDateTime(inspection.inspectedAt || inspection.createdAt)
          : "—"}
        <br />
        Technician: {inspection ? getTechName(inspection) : "—"}
      </div>

      <div className="device-actions">
        {inspection ? (
          <>
            <span className={`tag ${statusClass(inspection.inspectionStatus)}`}>
              {arStatus(inspection.inspectionStatus)}
            </span>
            <button
              className="smart-btn small"
              type="button"
              onClick={() => onOpenInspection(inspection)}
            >
              فتح آخر فحص
            </button>
          </>
        ) : (
          <span className="tag warn">لا يوجد أي فحص مسجل للجهاز</span>
        )}
      </div>
    </div>
  );
}

function InspectionCard({ inspection, apiBase, onOpen }) {
  const device = inspection.device || {};
  const loc = getDeviceLocation(device);
  const images = getImages(inspection);

  return (
    <div className="inspection-card" onClick={() => onOpen(inspection)}>
      <div className="card-cover">
        <FirstImagePreview inspection={inspection} apiBase={apiBase} />
        <div className="photo-count">📷 {images.length}</div>
      </div>

      <div className="card-body">
        <div className="card-topline">
          <span className="card-id">Inspection #{safe(inspection.id)}</span>
          <span className={`tag ${statusClass(inspection.inspectionStatus)}`}>
            {arStatus(inspection.inspectionStatus)}
          </span>
        </div>

        <div className="card-title">{getDeviceDisplayName(device)}</div>

        <div className="card-meta">
          Technician: {getTechName(inspection)}
          <br />
          Location: {getLocationDisplay(loc)}
          <br />
          Date: {fmtDateTime(inspection.inspectedAt || inspection.createdAt)}
        </div>

        <div className="card-tags">
          <span className="tag good">تم فحصه</span>
          <span className={images.length ? "tag good" : "tag info"}>
            {images.length} image
          </span>
          <span className="tag purple">
            Issues: {inspection.issuesCount ?? inspection.inspectionIssues?.length ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MODALS
========================= */

function InspectionDetailsModal({ inspection, apiBase = "", onClose }) {
  if (!inspection) return null;

  const device = inspection.device || {};
  const location = getDeviceLocation(device);
  const deviceType = device.deviceType || {};
  const technician = getTechObj(inspection);
  const images = getImages(inspection);
  const issues = Array.isArray(inspection.inspectionIssues)
    ? inspection.inspectionIssues
    : [];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="modal-eyebrow">
              Inspection #{safe(inspection.id)} ·{" "}
              {fmtDateTime(inspection.inspectedAt || inspection.createdAt)}
            </span>

            <div className="modal-title">
              {getDeviceDisplayName(device)} — {arStatus(inspection.inspectionStatus)}
            </div>

            <div className="modal-sub">
              Technician: {getTechName(inspection)}
              <br />
              Location: {getLocationDisplay(location)}
            </div>

            <div className="modal-tags">
              <span className={`tag ${statusClass(inspection.inspectionStatus)}`}>
                {arStatus(inspection.inspectionStatus)}
              </span>
              <span className="tag good">تم فحصه</span>
              <span className={images.length > 0 ? "tag good" : "tag info"}>
                {images.length} image
              </span>
              <span className="tag purple">{issues.length} issue</span>
            </div>
          </div>

          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="section">
            <div className="section-title">Inspection main information</div>
            <div className="info-grid">
              <InfoBox label="Inspection ID" value={inspection.id} />
              <InfoBox label="Status" value={arStatus(inspection.inspectionStatus)} />
              <InfoBox label="Issue Reason" value={inspection.issueReason} />
              <InfoBox label="Notes" value={inspection.notes} />
              <InfoBox label="Inspected At" value={fmtDateTime(inspection.inspectedAt)} />
              <InfoBox label="Created At" value={fmtDateTime(inspection.createdAt)} />
              <InfoBox label="Location Text" value={inspection.locationText} />
              <InfoBox
                label="GPS"
                value={
                  inspection.latitude && inspection.longitude
                    ? `${inspection.latitude}, ${inspection.longitude}`
                    : "—"
                }
              />
            </div>
          </div>

          <div className="section">
            <div className="section-title">Technician information</div>
            <div className="info-grid">
              <InfoBox label="Technician ID" value={technician.id || inspection.technicianId} />
              <InfoBox label="Full Name" value={technician.fullName || technician.name} />
              <InfoBox label="Username" value={technician.username} />
              <InfoBox label="Email" value={technician.email} />
              <InfoBox label="Phone" value={technician.phone} />
              <InfoBox label="Job Title" value={technician.jobTitle} />
            </div>
          </div>

          <div className="section">
            <div className="section-title">Device information</div>
            <div className="info-grid">
              <InfoBox label="Device ID" value={getDeviceId(device) || inspection.deviceId} />
              <InfoBox label="Device Code" value={device.deviceCode || device.code} />
              <InfoBox label="Device Name" value={device.deviceName || device.name} />
              <InfoBox label="Barcode" value={device.barcode} />
              <InfoBox label="Serial Number" value={device.serialNumber} />
              <InfoBox label="Device Type" value={deviceType.name} />
              <InfoBox label="IP Address" value={device.ipAddress} />
              <InfoBox label="Current Status" value={arStatus(device.currentStatus)} />
            </div>
          </div>

          <div className="section">
            <div className="section-title">Location information</div>
            <div className="info-grid">
              <InfoBox label="Location ID" value={getLocationId(location) || device.locationId} />
              <InfoBox label="Cluster" value={location.cluster} />
              <InfoBox label="Building" value={location.building} />
              <InfoBox label="Zone" value={location.zone} />
              <InfoBox label="Lane" value={location.lane} />
              <InfoBox label="Direction" value={location.direction} />
              <InfoBox label="Type" value={location.type} />
              <InfoBox label="Excel ID" value={location.excelId} />
            </div>
          </div>

          <div className="section">
            <div className="section-title">Uploaded inspection images ({images.length})</div>
            {images.length === 0 ? (
              <div className="empty">لا توجد صور مرفوعة لهذا الفحص.</div>
            ) : (
              <div className="image-grid">
                {images.map((img, index) => (
                  <InspectionImage
                    key={img?.id || getImagePath(img) || index}
                    img={img}
                    index={index}
                    inspectionId={inspection.id}
                    apiBase={apiBase}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryDetailsModal({ modal, apiBase = "", onClose }) {
  if (!modal) return null;

  const rows = Array.isArray(modal.rows) ? modal.rows : [];
  const columns = Array.isArray(modal.columns) ? modal.columns : [];

  function exportModalCsv() {
    const header = columns.map((c) => c.label);
    const body = rows.map((row, index) =>
      columns.map((c) => {
        const value =
          typeof c.value === "function" ? c.value(row, index) : row?.[c.key];

        if (value && typeof value === "object") return JSON.stringify(value);
        return value;
      })
    );

    exportCsv(`${modal.filename || "summary-details"}.csv`, [header, ...body]);
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="modal-eyebrow">SmartIT detailed report</span>
            <div className="modal-title">{modal.title}</div>
            <div className="modal-sub">
              {modal.description}
              <br />
              Total records: {rows.length}
            </div>
            <div className="modal-tags">
              <span className="tag info">{rows.length} record</span>
              <span className="tag purple">Source: backend</span>
            </div>
          </div>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="modal-actions-row">
            <div className="section-title" style={{ margin: 0 }}>
              كل البيانات الخاصة بالبوكس
            </div>
            <button className="smart-btn small" type="button" onClick={exportModalCsv}>
              Export CSV
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="empty">لا توجد بيانات.</div>
          ) : (
            <div className="summary-modal-table-wrap">
              <table className="summary-modal-table">
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th key={col.key}>{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row?.id || row?.inspectionId || row?.deviceId || index}>
                      {columns.map((col) => {
                        const value =
                          typeof col.value === "function"
                            ? col.value(row, index)
                            : row?.[col.key];

                        return (
                          <td key={col.key}>
                            {col.render ? col.render(row, index, apiBase) : safe(value)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   TABLE COLUMNS
========================= */

function makeLocationColumns() {
  return [
    { key: "id", label: "Location ID", value: (s) => getLocationId(s.location) },
    { key: "cluster", label: "Cluster", value: (s) => s.location?.cluster },
    { key: "building", label: "Building", value: (s) => s.location?.building },
    { key: "zone", label: "Zone", value: (s) => s.location?.zone },
    { key: "lane", label: "Lane", value: (s) => s.location?.lane },
    { key: "direction", label: "Direction", value: (s) => s.location?.direction },
    { key: "total", label: "Total Devices", value: (s) => s.counts?.totalDevices ?? s.devices?.length ?? 0 },
    { key: "inspected", label: "Inspected", value: (s) => s.counts?.inspectedDevices ?? s.inspectedDevices?.length ?? 0 },
    { key: "missing", label: "Not Inspected", value: (s) => s.counts?.notInspectedDevices ?? s.uninspectedDevices?.length ?? 0 },
    { key: "last", label: "Last Inspection", value: (s) => fmtDateTime(s.lastInspectionAt) },
    { key: "status", label: "Scan Status", render: (s) => <span className={`tag ${statusClass(s.scanStatus)}`}>{arStatus(s.scanStatus)}</span> },
  ];
}

function makeDeviceColumns() {
  return [
    { key: "id", label: "Device ID", value: (d) => getDeviceId(d) },
    {
      key: "scan",
      label: "Scan",
      render: (d) => (
        <span className={`tag ${d.isInspected || d.scanStatus === "SCANNED" || d.latestInspection ? "good" : "warn"}`}>
          {d.isInspected || d.scanStatus === "SCANNED" || d.latestInspection ? "تم فحصه" : "لم يتم فحصه"}
        </span>
      ),
    },
    { key: "code", label: "Code", value: (d) => d.deviceCode || d.code },
    { key: "name", label: "Name", value: (d) => getDeviceDisplayName(d) },
    { key: "serial", label: "Serial", value: (d) => d.serialNumber },
    { key: "barcode", label: "Barcode", value: (d) => d.barcode },
    { key: "ip", label: "IP", value: (d) => d.ipAddress },
    { key: "type", label: "Type", value: (d) => d.deviceType?.name },
    { key: "current", label: "Current Status", value: (d) => arStatus(d.currentStatus) },
    { key: "location", label: "Location", value: (d) => getLocationDisplay(getDeviceLocation(d)) },
    { key: "last", label: "Last Inspection", value: (d) => fmtDateTime(d.latestInspection?.inspectedAt || d.latestInspection?.createdAt || d.lastInspectionAt) },
    { key: "tech", label: "Technician", value: (d) => d.latestInspection ? getTechName(d.latestInspection) : "—" },
    { key: "reason", label: "Reason", value: (d) => d.reason || "No inspection record found for this device" },
  ];
}

function makeInspectionColumns() {
  return [
    { key: "id", label: "Inspection ID", value: (i) => i.id },
    { key: "status", label: "Status", render: (i) => <span className={`tag ${statusClass(i.inspectionStatus)}`}>{arStatus(i.inspectionStatus)}</span> },
    { key: "device", label: "Device", value: (i) => getDeviceDisplayName(i.device || {}) },
    { key: "code", label: "Device Code", value: (i) => i.device?.deviceCode },
    { key: "serial", label: "Serial", value: (i) => i.device?.serialNumber },
    { key: "technician", label: "Technician", value: (i) => getTechName(i) },
    { key: "location", label: "Location", value: (i) => getLocationDisplay(getDeviceLocation(i.device || {})) },
    { key: "images", label: "Images", value: (i) => getImages(i).length },
    { key: "issues", label: "Issues", value: (i) => i.issuesCount || i.inspectionIssues?.length || 0 },
    { key: "date", label: "Date", value: (i) => fmtDateTime(i.inspectedAt || i.createdAt) },
    { key: "notes", label: "Notes", value: (i) => i.notes },
  ];
}

/* =========================
   MAIN PAGE
========================= */

export function InspectionsPage({
  inspections: propInspections,
  devices: propDevices,
  technicians = [],
  locations: propLocations,
  apiBase = "",
}) {
  injectStyles();

  const base = getApiBase(apiBase);

  const [reportData, setReportData] = useState(null);
  const [loadedPath, setLoadedPath] = useState("");
  const [inspectionsPath, setInspectionsPath] = useState("");
  const [allBackendInspections, setAllBackendInspections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("INSPECTIONS");
  const [viewMode, setViewMode] = useState("LIST");

  const [selectedInspection, setSelectedInspection] = useState(null);
  const [selectedSummaryModal, setSelectedSummaryModal] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState("");

  const [search, setSearch] = useState("");
  const [technicianName, setTechnicianName] = useState("");
  const [status, setStatus] = useState("");
  const [techId, setTechId] = useState("");
  const [cluster, setCluster] = useState("");
  const [building, setBuilding] = useState("");
  const [notInspectedOnly, setNotInspectedOnly] = useState(false);
  const [showOnlyFaults, setShowOnlyFaults] = useState(false);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const reportResult = await apiGetReportSummary(base);
      setReportData(reportResult.data);
      setLoadedPath(reportResult.path);

      const inspectionsResult = await apiGetAllInspections(base);
      const rawExtraInspections = extractArray(inspectionsResult.data, [
        "inspections",
        "latestInspections",
        "data",
        "items",
      ]);

      setAllBackendInspections(rawExtraInspections.map((i) => normalizeInspection(i)));
      setInspectionsPath(inspectionsResult.path || "from report latestInspections");
    } catch (err) {
      console.error(err);
      setReportData(null);
      setLoadedPath("");
      setAllBackendInspections([]);
      setInspectionsPath("");
      setError(
        "فشل تحميل التقرير من الباك إند. تأكدي أن /reports/devices-scan-report يعمل على Railway."
      );
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const locationSummaries = useMemo(() => {
    if (!reportData || !Array.isArray(reportData.locations)) return [];

    return reportData.locations.map((item) => {
      const location = item.location || {};

      const devicesList = Array.isArray(item.devices)
        ? item.devices.map((device) => ({
            ...device,
            location,
            locationId: location.id || device.locationId,
          }))
        : [];

      const inspectedDevicesList = Array.isArray(item.inspectedDevices)
        ? item.inspectedDevices.map((device) => ({
            ...device,
            location,
            locationId: location.id || device.locationId,
            isInspected: true,
            scanStatus: "SCANNED",
          }))
        : [];

      const uninspectedDevicesList = Array.isArray(item.notInspectedDevices)
        ? item.notInspectedDevices.map((device) => ({
            ...device,
            location,
            locationId: location.id || device.locationId,
            isInspected: false,
            scanStatus: "NOT_SCANNED",
            reason: device.reason || "No inspection record found for this device",
          }))
        : [];

      const latestInspectionsList = Array.isArray(item.latestInspections)
        ? item.latestInspections.map((inspection) =>
            normalizeInspection(
              {
                ...inspection,
                device: inspection.device
                  ? {
                      ...inspection.device,
                      location: inspection.device.location || location,
                      locationId:
                        inspection.device.locationId ||
                        inspection.device.location?.id ||
                        location.id,
                    }
                  : null,
              },
              location
            )
          )
        : [];

      const lastInspection = item.lastInspection
        ? normalizeInspection(
            {
              ...item.lastInspection,
              device: item.lastInspection.device
                ? {
                    ...item.lastInspection.device,
                    location: item.lastInspection.device.location || location,
                  }
                : item.lastInspection.device,
            },
            location
          )
        : null;

      return {
        location,
        devices: devicesList,
        inspectedDevices: inspectedDevicesList,
        uninspectedDevices: uninspectedDevicesList,
        inspections: latestInspectionsList,
        counts: item.counts || {
          totalDevices: devicesList.length,
          inspectedDevices: inspectedDevicesList.length,
          notInspectedDevices: uninspectedDevicesList.length,
          latestInspections: latestInspectionsList.length,
        },
        lastInspectionAt: item.lastInspectionAt || lastInspection?.inspectedAt || null,
        lastInspection,
        scanStatus: item.scanStatus || "—",
      };
    });
  }, [reportData]);

  const allDevices = useMemo(() => {
    return locationSummaries.flatMap((summary) => summary.devices || []);
  }, [locationSummaries]);

  const allUninspectedDevices = useMemo(() => {
    return locationSummaries.flatMap((summary) => summary.uninspectedDevices || []);
  }, [locationSummaries]);

  const allReportInspections = useMemo(() => {
    return locationSummaries.flatMap((summary) => summary.inspections || []);
  }, [locationSummaries]);

  const allInspections = useMemo(() => {
    const map = new Map();

    allReportInspections.forEach((i) => {
      if (i?.id) map.set(String(i.id), i);
    });

    allBackendInspections.forEach((i) => {
      if (i?.id) {
        map.set(String(i.id), {
          ...i,
          device: {
            ...(i.device || {}),
            location: i.device?.location || i.location || {},
          },
        });
      }
    });

    const merged = Array.from(map.values());

    return merged.sort((a, b) => {
      const da = new Date(a.inspectedAt || a.createdAt || 0).getTime();
      const db = new Date(b.inspectedAt || b.createdAt || 0).getTime();
      return db - da;
    });
  }, [allReportInspections, allBackendInspections]);

  const latestInspectionByDeviceId = useMemo(() => {
    const map = new Map();

    allInspections.forEach((inspection) => {
      const deviceId = inspection?.deviceId || inspection?.device?.id;
      if (!deviceId) return;

      const old = map.get(String(deviceId));
      const oldDate = new Date(old?.inspectedAt || old?.createdAt || 0).getTime();
      const newDate = new Date(inspection?.inspectedAt || inspection?.createdAt || 0).getTime();

      if (!old || newDate >= oldDate) {
        map.set(String(deviceId), inspection);
      }
    });

    return map;
  }, [allInspections]);

  const enrichedDevices = useMemo(() => {
    return allDevices.map((device) => {
      const deviceId = getDeviceId(device);
      const latestInspection = deviceId
        ? latestInspectionByDeviceId.get(String(deviceId))
        : null;

      return {
        ...device,
        latestInspection,
        isInspected: Boolean(latestInspection) || device.isInspected === true,
        scanStatus: Boolean(latestInspection) || device.scanStatus === "SCANNED" ? "SCANNED" : "NOT_SCANNED",
      };
    });
  }, [allDevices, latestInspectionByDeviceId]);

  const trulyUninspectedDevices = useMemo(() => {
    const byId = new Map();

    allUninspectedDevices.forEach((device) => {
      const id = getDeviceId(device);
      if (id) byId.set(String(id), device);
    });

    enrichedDevices.forEach((device) => {
      const id = getDeviceId(device);
      if (!id) return;

      if (!latestInspectionByDeviceId.has(String(id))) {
        byId.set(String(id), {
          ...device,
          isInspected: false,
          scanStatus: "NOT_SCANNED",
          reason: "No inspection record found for this device",
        });
      }
    });

    return Array.from(byId.values());
  }, [allUninspectedDevices, enrichedDevices, latestInspectionByDeviceId]);

  const clusters = useMemo(() => {
    return [
      ...new Set(locationSummaries.map((s) => s.location?.cluster).filter(Boolean)),
    ].sort();
  }, [locationSummaries]);

  const buildings = useMemo(() => {
    return [
      ...new Set(locationSummaries.map((s) => s.location?.building).filter(Boolean)),
    ].sort();
  }, [locationSummaries]);

  const statuses = useMemo(() => {
    return [...new Set(allInspections.map((i) => i.inspectionStatus).filter(Boolean))].sort();
  }, [allInspections]);

  const techOptions = useMemo(() => {
    const map = new Map();

    technicians.forEach((t) => {
      if (t?.id) map.set(String(t.id), t);
    });

    allInspections.forEach((i) => {
      const id = getTechId(i);
      const t = getTechObj(i);

      if (id && !map.has(String(id))) {
        map.set(String(id), {
          id,
          fullName: t.fullName || t.name || i.technicianName,
          username: t.username,
          email: t.email,
        });
      }
    });

    return Array.from(map.values());
  }, [technicians, allInspections]);

  const activeTechLabel = useMemo(() => {
    if (technicianName) return technicianName;

    if (techId) {
      const found = techOptions.find((t) => String(t.id) === String(techId));
      return found?.fullName || found?.username || found?.email || `#${techId}`;
    }

    return "";
  }, [technicianName, techId, techOptions]);

  const filteredInspections = useMemo(() => {
    const q = normalizeText(search);
    const techQ = normalizeText(technicianName);

    return allInspections.filter((ins) => {
      const device = ins.device || {};
      const loc = getDeviceLocation(device);
      const tech = getTechObj(ins);
      const currentTechId = getTechId(ins);
      const techName = getTechName(ins);

      if (status && ins.inspectionStatus !== status) return false;

      if (techId && String(currentTechId) !== String(techId)) return false;

      if (techQ && !includesNormalized(techName, techQ)) return false;

      if (cluster && loc.cluster !== cluster) return false;
      if (building && loc.building !== building) return false;

      if (showOnlyFaults && ins.inspectionStatus === "OK") return false;

      if (q) {
        const text = [
          ins.id,
          ins.inspectionStatus,
          ins.issueReason,
          ins.notes,
          device.id,
          device.deviceCode,
          device.deviceName,
          device.name,
          device.serialNumber,
          device.barcode,
          device.ipAddress,
          device.currentStatus,
          loc.cluster,
          loc.building,
          loc.zone,
          loc.lane,
          loc.direction,
          loc.excelId,
          tech.fullName,
          tech.name,
          tech.username,
          tech.email,
          techName,
        ]
          .filter(Boolean)
          .join(" ");

        if (!includesNormalized(text, q)) return false;
      }

      return true;
    });
  }, [
    allInspections,
    search,
    technicianName,
    status,
    techId,
    cluster,
    building,
    showOnlyFaults,
  ]);

  const filteredLocationSummaries = useMemo(() => {
    const q = normalizeText(search);

    return locationSummaries.filter((summary) => {
      const loc = summary.location || {};
      const missing = summary.uninspectedDevices || [];

      if (cluster && loc.cluster !== cluster) return false;
      if (building && loc.building !== building) return false;
      if (notInspectedOnly && missing.length === 0) return false;

      if (q) {
        const text = [
          getLocationId(loc),
          loc.cluster,
          loc.building,
          loc.zone,
          loc.lane,
          loc.direction,
          loc.type,
          loc.excelId,
          ...summary.devices.flatMap((d) => [
            getDeviceId(d),
            d.deviceCode,
            d.deviceName,
            d.name,
            d.serialNumber,
            d.barcode,
            d.ipAddress,
            d.deviceType?.name,
          ]),
        ]
          .filter(Boolean)
          .join(" ");

        if (!includesNormalized(text, q)) return false;
      }

      return true;
    });
  }, [locationSummaries, search, cluster, building, notInspectedOnly]);

  const filteredUninspectedDevices = useMemo(() => {
    const q = normalizeText(search);

    return trulyUninspectedDevices.filter((device) => {
      const loc = getDeviceLocation(device);

      if (cluster && loc.cluster !== cluster) return false;
      if (building && loc.building !== building) return false;

      if (q) {
        const text = [
          getDeviceId(device),
          device.deviceCode,
          device.deviceName,
          device.name,
          device.serialNumber,
          device.barcode,
          device.ipAddress,
          device.currentStatus,
          device.deviceType?.name,
          loc.cluster,
          loc.building,
          loc.zone,
          loc.lane,
          loc.direction,
          loc.type,
        ]
          .filter(Boolean)
          .join(" ");

        if (!includesNormalized(text, q)) return false;
      }

      return true;
    });
  }, [trulyUninspectedDevices, search, cluster, building]);

  const filteredStatsData = useMemo(() => {
    const filteredLocations = filteredLocationSummaries || [];

    const filteredDevices = filteredLocations.flatMap((summary) => {
      return Array.isArray(summary.devices) ? summary.devices : [];
    });

    const filteredDeviceIds = new Set(
      filteredDevices.map((d) => String(getDeviceId(d))).filter(Boolean)
    );

    const filteredNotInspectedDevices = filteredUninspectedDevices.filter((d) => {
      const id = getDeviceId(d);
      return !id || filteredDeviceIds.has(String(id));
    });

    const filteredInspectedDevices = filteredDevices.filter((device) => {
      const id = getDeviceId(device);
      return id && latestInspectionByDeviceId.has(String(id));
    });

    const selectedInspections = filteredInspections;

    const okInspections = selectedInspections.filter(
      (inspection) => inspection.inspectionStatus === "OK"
    );

    const faultInspections = selectedInspections.filter(
      (inspection) => inspection.inspectionStatus === "NOT_OK"
    );

    const partialInspections = selectedInspections.filter(
      (inspection) => inspection.inspectionStatus === "PARTIAL"
    );

    const notReachableInspections = selectedInspections.filter(
      (inspection) => inspection.inspectionStatus === "NOT_REACHABLE"
    );

    const inspectionsWithImages = selectedInspections.filter(
      (inspection) => getImages(inspection).length > 0
    );

    const inspectionsWithIssues = selectedInspections.filter((inspection) => {
      if (Array.isArray(inspection.inspectionIssues)) {
        return inspection.inspectionIssues.length > 0;
      }
      return Number(inspection.issuesCount || 0) > 0;
    });

    const imagesCount = selectedInspections.reduce((sum, inspection) => {
      return sum + getImages(inspection).length;
    }, 0);

    const issuesCount = selectedInspections.reduce((sum, inspection) => {
      if (Array.isArray(inspection.inspectionIssues)) {
        return sum + inspection.inspectionIssues.length;
      }
      return sum + Number(inspection.issuesCount || 0);
    }, 0);

    const locationsWithMissing = filteredLocations.filter((summary) => {
      return Array.isArray(summary.uninspectedDevices)
        ? summary.uninspectedDevices.length > 0
        : Number(summary.counts?.notInspectedDevices || 0) > 0;
    });

    return {
      locations: filteredLocations,
      devices: filteredDevices,
      inspectedDevices: filteredInspectedDevices,
      notInspectedDevices: filteredNotInspectedDevices,
      locationsMissing: locationsWithMissing,
      latestInspections: selectedInspections,
      okInspections,
      faultInspections,
      partialInspections,
      notReachableInspections,
      inspectionsWithImages,
      inspectionsWithIssues,
      imagesCount,
      issuesCount,
    };
  }, [
    filteredLocationSummaries,
    filteredUninspectedDevices,
    filteredInspections,
    latestInspectionByDeviceId,
  ]);

  const stats = useMemo(() => {
    return {
      totalLocations: filteredStatsData.locations.length,
      totalDevices: filteredStatsData.devices.length,
      inspectedDevices: filteredStatsData.inspectedDevices.length,
      uninspectedDevices: filteredStatsData.notInspectedDevices.length,
      locationsWithMissing: filteredStatsData.locationsMissing.length,
      totalInspections: filteredStatsData.latestInspections.length,
      ok: filteredStatsData.okInspections.length,
      notOk: filteredStatsData.faultInspections.length,
      partial: filteredStatsData.partialInspections.length,
      notReachable: filteredStatsData.notReachableInspections.length,
      imagesCount: filteredStatsData.imagesCount,
      issuesCount: filteredStatsData.issuesCount,
      scannedCount: filteredStatsData.inspectedDevices.length,
      notScannedCount: filteredStatsData.notInspectedDevices.length,
    };
  }, [filteredStatsData]);

  const selectedLocationSummary = useMemo(() => {
    if (selectedLocationId) {
      const found = filteredLocationSummaries.find(
        (x) => String(getLocationId(x.location)) === String(selectedLocationId)
      );
      if (found) return found;
    }

    return filteredLocationSummaries[0] || null;
  }, [filteredLocationSummaries, selectedLocationId]);

  useEffect(() => {
    if (!selectedLocationId && filteredLocationSummaries[0]) {
      setSelectedLocationId(String(getLocationId(filteredLocationSummaries[0].location)));
    }
  }, [filteredLocationSummaries, selectedLocationId]);

  function resetFilters() {
    setSearch("");
    setTechnicianName("");
    setStatus("");
    setTechId("");
    setCluster("");
    setBuilding("");
    setNotInspectedOnly(false);
    setShowOnlyFaults(false);
  }

  function filterTehami() {
    setTechnicianName("تهامي");
    setTechId("");
    setActiveTab("INSPECTIONS");
    setViewMode("LIST");
  }

  function exportUninspectedDevices() {
    const rows = [
      [
        "Device ID",
        "Device Code",
        "Device Name",
        "Serial Number",
        "Barcode",
        "IP Address",
        "Current Status",
        "Device Type",
        "Location ID",
        "Cluster",
        "Building",
        "Zone",
        "Lane",
        "Direction",
        "Reason",
      ],
      ...filteredUninspectedDevices.map((device) => {
        const loc = getDeviceLocation(device);
        return [
          getDeviceId(device),
          device.deviceCode || device.code,
          device.deviceName || device.name,
          device.serialNumber,
          device.barcode,
          device.ipAddress,
          device.currentStatus,
          device.deviceType?.name,
          getLocationId(loc) || device.locationId,
          loc.cluster,
          loc.building,
          loc.zone,
          loc.lane,
          loc.direction,
          device.reason || "No inspection record found for this device",
        ];
      }),
    ];

    exportCsv("not-inspected-devices.csv", rows);
  }

  function exportLocationsSummary() {
    const rows = [
      [
        "Location ID",
        "Cluster",
        "Building",
        "Zone",
        "Lane",
        "Direction",
        "Total Devices",
        "Inspected Devices",
        "Not Inspected Devices",
        "Latest Inspections",
        "Last Inspection At",
        "Scan Status",
      ],
      ...filteredLocationSummaries.map((summary) => {
        const loc = summary.location;
        return [
          getLocationId(loc),
          loc.cluster,
          loc.building,
          loc.zone,
          loc.lane,
          loc.direction,
          summary.counts?.totalDevices ?? summary.devices.length,
          summary.counts?.inspectedDevices ?? summary.inspectedDevices.length,
          summary.counts?.notInspectedDevices ?? summary.uninspectedDevices.length,
          summary.counts?.latestInspections ?? summary.inspections.length,
          summary.lastInspectionAt,
          summary.scanStatus,
        ];
      }),
    ];

    exportCsv("locations-scan-summary.csv", rows);
  }

  function exportInspections() {
    const rows = [
      [
        "Inspection ID",
        "Device Code",
        "Device Name",
        "Inspection Status",
        "Technician",
        "Location",
        "Images",
        "Issues",
        "Inspected At",
      ],
      ...filteredInspections.map((inspection) => {
        const device = inspection.device || {};
        const loc = getDeviceLocation(device);

        return [
          inspection.id,
          device.deviceCode,
          device.deviceName || device.name,
          inspection.inspectionStatus,
          getTechName(inspection),
          getLocationDisplay(loc),
          getImages(inspection).length,
          inspection.issuesCount || inspection.inspectionIssues?.length || 0,
          inspection.inspectedAt || inspection.createdAt,
        ];
      }),
    ];

    exportCsv("inspections.csv", rows);
  }

  function openSummaryBox(type) {
    const baseModal = {
      filename: type,
      description:
        activeTechLabel
          ? `الداتا هنا مفلترة على الفني: ${activeTechLabel}`
          : "الداتا هنا محسوبة من نتيجة الفلاتر الحالية فقط.",
    };

    if (type === "locations") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "كل اللوكيشنز",
        rows: filteredStatsData.locations,
        columns: makeLocationColumns(),
      });
      return;
    }

    if (type === "devices") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "كل الأجهزة المسجلة",
        rows: filteredStatsData.devices,
        columns: makeDeviceColumns(),
      });
      return;
    }

    if (type === "inspectedDevices") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "الأجهزة التي تم فحصها",
        rows: filteredStatsData.inspectedDevices,
        columns: makeDeviceColumns(),
      });
      return;
    }

    if (type === "notInspectedDevices") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "الأجهزة التي لم يتم فحصها",
        rows: filteredStatsData.notInspectedDevices,
        columns: makeDeviceColumns(),
      });
      return;
    }

    if (type === "locationsMissing") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "اللوكيشنز التي بها أجهزة لم يتم فحصها",
        rows: filteredStatsData.locationsMissing,
        columns: makeLocationColumns(),
      });
      return;
    }

    if (type === "allInspections") {
      setSelectedSummaryModal({
        ...baseModal,
        title: activeTechLabel ? `كل تفتيشات ${activeTechLabel}` : "كل التفتيشات",
        rows: filteredStatsData.latestInspections,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "ok") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات السليمة OK",
        rows: filteredStatsData.okInspections,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "faults") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات التي بها عطل كامل",
        rows: filteredStatsData.faultInspections,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "partial") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات ذات العطل الجزئي",
        rows: filteredStatsData.partialInspections,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "notReachable") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات غير المتاحة",
        rows: filteredStatsData.notReachableInspections,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "images") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات التي تحتوي على صور",
        rows: filteredStatsData.inspectionsWithImages,
        columns: makeInspectionColumns(),
      });
      return;
    }

    if (type === "issues") {
      setSelectedSummaryModal({
        ...baseModal,
        title: "التفتيشات التي تحتوي على مشاكل",
        rows: filteredStatsData.inspectionsWithIssues,
        columns: makeInspectionColumns(),
      });
    }
  }

  if (loading) return <LoadingScreen />;

  const notInspectedCountIsCorrect =
    Number(stats.uninspectedDevices) === Number(EXPECTED_NOT_INSPECTED_COUNT);

  return (
    <div className="smart-inspections-page">
      <div className="smart-shell">
        <section className="smart-hero">
          <div className="smart-hero-inner">
            <div className="smart-title-wrap">
              <div className="smart-logo">📍</div>

              <div>
                <div className="smart-eyebrow">SmartIT Reports</div>
                <h1 className="smart-title">
                  True Inspections Report
                </h1>
                <div className="smart-subtitle">
                  تقرير مباشر من الباك إند. اكتبي اسم الفني مثل تهامي وسيظهر كل تفتيشاته وعددها وكل التفاصيل.
                </div>
              </div>
            </div>

            <div className="smart-actions">
              <div className="smart-toggle">
                <button
                  type="button"
                  className={viewMode === "GRID" ? "active" : ""}
                  onClick={() => setViewMode("GRID")}
                >
                  Grid
                </button>

                <button
                  type="button"
                  className={viewMode === "LIST" ? "active" : ""}
                  onClick={() => setViewMode("LIST")}
                >
                  List
                </button>
              </div>

              <button className="smart-btn glass" type="button" onClick={loadAllData}>
                ↻ Refresh Data
              </button>

              <button className="smart-btn glass" type="button" onClick={filterTehami}>
                تفتيشات تهامي
              </button>

              <button className="smart-btn primary" type="button" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {error && <div className="error-box">⚠ {error}</div>}

        <div className="success-box">
          ✅ Loaded report from: {loadedPath || "—"}
          <br />
          ✅ Loaded inspections from: {inspectionsPath || "—"}
          <br />
          Rule: الجهاز يعتبر لم يتم فحصه عندما لا يوجد له أي Inspection record في قاعدة البيانات.
        </div>

        {!notInspectedCountIsCorrect && (
          <div className="warning-box">
            ⚠ تنبيه مهم: العدد المتوقع للأجهزة التي لم يتم فحصها هو{" "}
            <strong>{EXPECTED_NOT_INSPECTED_COUNT}</strong>، لكن الداتا الحالية الراجعة من الباك إند بعد الفلاتر =
            {" "}
            <strong>{stats.uninspectedDevices}</strong>.
            <br />
            لو الفلتر فاضي ومفروض يظهر 170، يبقى لازم Endpoint{" "}
            <strong>/reports/devices-scan-report</strong> يرجع كل أجهزة notInspectedDevices.
          </div>
        )}

        {activeTechLabel && (
          <div className="warning-box">
            🔎 أنتِ الآن تعرضي تفتيشات الفني: <strong>{activeTechLabel}</strong>
            <br />
            عدد التفتيشات المطابقة: <strong>{filteredInspections.length}</strong>
          </div>
        )}

        <section className="stats-grid">
          <StatCard label="Locations" value={stats.totalLocations} sub="all locations" color="#4f46e5" onClick={() => openSummaryBox("locations")} />
          <StatCard label="Devices" value={stats.totalDevices} sub="all devices" color="#0ea5e9" onClick={() => openSummaryBox("devices")} />
          <StatCard label="Inspected devices" value={stats.inspectedDevices} sub="devices with inspection" color="#16a34a" onClick={() => openSummaryBox("inspectedDevices")} />
          <StatCard label="Not inspected" value={stats.uninspectedDevices} sub={`expected ${EXPECTED_NOT_INSPECTED_COUNT}`} color="#f59e0b" onClick={() => openSummaryBox("notInspectedDevices")} />
          <StatCard label="Locations missing" value={stats.locationsWithMissing} sub="have missing devices" color="#ef4444" onClick={() => openSummaryBox("locationsMissing")} />
          <StatCard label={activeTechLabel ? `Inspections: ${activeTechLabel}` : "All inspections"} value={stats.totalInspections} sub="filtered inspections" color="#7c3aed" onClick={() => openSummaryBox("allInspections")} />
          <StatCard label="OK" value={stats.ok} sub="سليم" color="#22c55e" onClick={() => openSummaryBox("ok")} />
          <StatCard label="Faults" value={stats.notOk} sub="عطل كامل" color="#ef4444" onClick={() => openSummaryBox("faults")} />
          <StatCard label="Partial" value={stats.partial} sub="عطل جزئي" color="#f59e0b" onClick={() => openSummaryBox("partial")} />
          <StatCard label="Not reachable" value={stats.notReachable} sub="غير متاح" color="#f97316" onClick={() => openSummaryBox("notReachable")} />
          <StatCard label="Images" value={stats.imagesCount} sub="uploaded photos" color="#06b6d4" onClick={() => openSummaryBox("images")} />
          <StatCard label="Issues" value={stats.issuesCount} sub="reported issues" color="#7c3aed" onClick={() => openSummaryBox("issues")} />
        </section>

        <section className="panel">
          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === "INSPECTIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("INSPECTIONS")}
            >
              كل التفتيشات / الفني
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === "UNINSPECTED" ? "active" : ""}`}
              onClick={() => setActiveTab("UNINSPECTED")}
            >
              Devices Not Inspected
            </button>

            <button
              type="button"
              className={`tab-btn ${activeTab === "LOCATIONS" ? "active" : ""}`}
              onClick={() => setActiveTab("LOCATIONS")}
            >
              Locations & Missing Devices
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">Filters</div>

          <div className="filters-grid">
            <div className="filter-field">
              <label>Search</label>
              <input
                type="text"
                value={search}
                placeholder="location / device / serial / technician..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-field">
              <label>Technician name</label>
              <input
                type="text"
                value={technicianName}
                placeholder="مثال: تهامي"
                onChange={(e) => {
                  setTechnicianName(e.target.value);
                  setTechId("");
                  setActiveTab("INSPECTIONS");
                }}
              />
            </div>

            <div className="filter-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {arStatus(s)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Technician</label>
              <select
                value={techId}
                onChange={(e) => {
                  setTechId(e.target.value);
                  setTechnicianName("");
                  setActiveTab("INSPECTIONS");
                }}
              >
                <option value="">All technicians</option>
                {techOptions.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    #{t.id} — {t.fullName || t.username || t.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Cluster</label>
              <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
                <option value="">All clusters</option>
                {clusters.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label>Building</label>
              <select value={building} onChange={(e) => setBuilding(e.target.value)}>
                <option value="">All buildings</option>
                {buildings.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <label className="check-pill">
              <input
                type="checkbox"
                checked={notInspectedOnly}
                onChange={(e) => setNotInspectedOnly(e.target.checked)}
              />
              Missing only
            </label>

            <label className="check-pill">
              <input
                type="checkbox"
                checked={showOnlyFaults}
                onChange={(e) => setShowOnlyFaults(e.target.checked)}
              />
              Faults only
            </label>
          </div>
        </section>

        <section className="content-area">
          {activeTab === "INSPECTIONS" && (
            <>
              {filteredInspections.length === 0 ? (
                <div className="state-card">
                  لا توجد تفتيشات مطابقة للفلاتر.
                  <br />
                  لو كتبتي تهامي ولم يظهر شيء، يبقى اسم الفني في الداتا مختلف أو Endpoint التفتيشات لا يرجع كل التفتيشات.
                </div>
              ) : viewMode === "GRID" ? (
                <div className="grid-view">
                  {filteredInspections.map((row) => (
                    <InspectionCard
                      key={row.id}
                      inspection={row}
                      apiBase={base}
                      onOpen={setSelectedInspection}
                    />
                  ))}
                </div>
              ) : (
                <div className="table-card">
                  <div className="panel-title" style={{ padding: 16, margin: 0 }}>
                    {activeTechLabel
                      ? `كل تفتيشات ${activeTechLabel} (${filteredInspections.length})`
                      : `كل التفتيشات (${filteredInspections.length})`}
                    <button className="smart-btn small" type="button" onClick={exportInspections}>
                      Export inspections CSV
                    </button>
                  </div>

                  <div className="table-scroll">
                    <table className="smart-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Images</th>
                          <th>Status</th>
                          <th>Device</th>
                          <th>Technician</th>
                          <th>Location</th>
                          <th>Issues</th>
                          <th>Inspected At</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredInspections.map((row) => {
                          const device = row.device || {};
                          const loc = getDeviceLocation(device);
                          const issuesCount =
                            row.issuesCount || row.inspectionIssues?.length || 0;

                          return (
                            <tr
                              key={row.id}
                              className="clickable-row"
                              onClick={() => setSelectedInspection(row)}
                            >
                              <td>#{row.id}</td>
                              <td>
                                <TableThumbs inspection={row} apiBase={base} />
                              </td>
                              <td>
                                <span className={`tag ${statusClass(row.inspectionStatus)}`}>
                                  {arStatus(row.inspectionStatus)}
                                </span>
                              </td>
                              <td>
                                <div style={{ fontWeight: 950 }}>
                                  {getDeviceDisplayName(device)}
                                </div>
                                <div style={{ color: "#64748b", fontSize: 11 }}>
                                  Code: {safe(device.deviceCode || device.code)} · SN:{" "}
                                  {safe(device.serialNumber)}
                                </div>
                              </td>
                              <td>{getTechName(row)}</td>
                              <td>
                                <div>{safe(loc.building)}</div>
                                <div style={{ color: "#64748b", fontSize: 11 }}>
                                  {safe(loc.cluster)} · {safe(loc.zone)} · {safe(loc.lane)}
                                </div>
                              </td>
                              <td>
                                <span className={`tag ${issuesCount ? "warn" : "muted"}`}>
                                  {issuesCount} issue
                                </span>
                              </td>
                              <td>{fmtDateTime(row.inspectedAt || row.createdAt)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "UNINSPECTED" && (
            <div className="panel">
              <div className="panel-title">
                Devices Not Inspected ({filteredUninspectedDevices.length})
                <button
                  className="smart-btn danger small"
                  type="button"
                  onClick={exportUninspectedDevices}
                >
                  Export missing CSV
                </button>
              </div>

              {filteredUninspectedDevices.length === 0 ? (
                <div className="empty">كل الأجهزة الظاهرة في الفلاتر لها فحص مسجل.</div>
              ) : (
                <div className="device-list">
                  {filteredUninspectedDevices.map((device, index) => (
                    <DeviceCard
                      key={getDeviceId(device) || index}
                      device={device}
                      latestInspection={null}
                      onOpenInspection={setSelectedInspection}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "LOCATIONS" && (
            <div className="panel">
              <div className="panel-title">
                Locations Summary ({filteredLocationSummaries.length})
                <button className="smart-btn small" type="button" onClick={exportLocationsSummary}>
                  Export locations CSV
                </button>
              </div>

              {viewMode === "GRID" ? (
                filteredLocationSummaries.length === 0 ? (
                  <div className="empty">لا توجد لوكيشنز مطابقة للفلاتر.</div>
                ) : (
                  <div className="location-grid">
                    {filteredLocationSummaries.map((summary) => (
                      <LocationCard
                        key={getLocationId(summary.location)}
                        locationSummary={summary}
                        onOpen={(item) => {
                          setSelectedLocationId(String(getLocationId(item.location)));
                          setViewMode("LIST");
                        }}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="split-layout">
                  <div className="panel">
                    <div className="panel-title">Locations</div>

                    <div className="side-list">
                      {filteredLocationSummaries.map((summary) => {
                        const id = String(getLocationId(summary.location));
                        const activeId = String(
                          selectedLocationSummary &&
                            getLocationId(selectedLocationSummary.location)
                        );

                        return (
                          <div
                            key={id}
                            className={`location-row ${activeId === id ? "active" : ""}`}
                            onClick={() => setSelectedLocationId(id)}
                          >
                            <div className="location-row-title">
                              {getLocationDisplay(summary.location)}
                            </div>
                            <div className="location-row-meta">
                              Devices: {summary.counts?.totalDevices ?? summary.devices.length} ·
                              Inspected: {summary.counts?.inspectedDevices ?? summary.inspectedDevices.length} ·
                              Missing: {summary.counts?.notInspectedDevices ?? summary.uninspectedDevices.length}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <LocationDetails
                    summary={selectedLocationSummary}
                    latestInspectionByDeviceId={latestInspectionByDeviceId}
                    onOpenInspection={setSelectedInspection}
                  />
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {selectedSummaryModal && (
        <SummaryDetailsModal
          modal={selectedSummaryModal}
          apiBase={base}
          onClose={() => setSelectedSummaryModal(null)}
        />
      )}

      {selectedInspection && (
        <InspectionDetailsModal
          inspection={selectedInspection}
          apiBase={base}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
}

/* =========================
   LOCATION DETAILS
========================= */

function LocationDetails({ summary, latestInspectionByDeviceId, onOpenInspection }) {
  if (!summary) {
    return (
      <div className="location-details">
        <div className="state-card">اختاري لوكيشن لعرض الأجهزة والتفتيشات.</div>
      </div>
    );
  }

  const {
    location,
    devices,
    inspections,
    inspectedDevices,
    uninspectedDevices,
    counts,
    lastInspectionAt,
    scanStatus,
  } = summary;

  return (
    <div className="location-details">
      <div className="location-header">
        <div className="location-header-title">{getLocationDisplay(location)}</div>

        <div className="location-header-sub">
          Cluster: {safe(location.cluster)} · Building: {safe(location.building)} ·
          Zone: {safe(location.zone)} · Lane: {safe(location.lane)} · Direction:{" "}
          {safe(location.direction)}
          <br />
          Last inspection: {fmtDateTime(lastInspectionAt)} · Status: {arStatus(scanStatus)}
        </div>

        <div className="mini-stats">
          <MiniStat label="Devices" value={counts?.totalDevices ?? devices.length} />
          <MiniStat label="Inspected" value={counts?.inspectedDevices ?? inspectedDevices.length} />
          <MiniStat label="Not inspected" value={counts?.notInspectedDevices ?? uninspectedDevices.length} />
          <MiniStat label="Latest inspections" value={counts?.latestInspections ?? inspections.length} />
          <MiniStat label="Missing list" value={uninspectedDevices.length} />
        </div>
      </div>

      <div className="section">
        <div className="section-title">
          الأجهزة التي لم يتم فحصها في هذا اللوكيشن ({uninspectedDevices.length})
        </div>

        {uninspectedDevices.length === 0 ? (
          <div className="empty">ممتاز. لا توجد أجهزة بدون فحص في هذا اللوكيشن.</div>
        ) : (
          <div className="device-list">
            {uninspectedDevices.map((device, index) => (
              <DeviceCard
                key={getDeviceId(device) || index}
                device={device}
                latestInspection={null}
                onOpenInspection={onOpenInspection}
              />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">كل الأجهزة المرتبطة بهذا اللوكيشن ({devices.length})</div>

        {devices.length === 0 ? (
          <div className="empty">لا توجد أجهزة مربوطة بهذا اللوكيشن في الداتا الحالية.</div>
        ) : (
          <div className="device-list">
            {devices.map((device, index) => {
              const deviceId = getDeviceId(device);
              const latestInspection = deviceId
                ? latestInspectionByDeviceId.get(String(deviceId))
                : device.latestInspection || null;

              return (
                <DeviceCard
                  key={deviceId || index}
                  device={device}
                  latestInspection={latestInspection}
                  onOpenInspection={onOpenInspection}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-title">آخر التفتيشات في هذا اللوكيشن ({inspections.length})</div>

        {inspections.length === 0 ? (
          <div className="empty">لا توجد تفتيشات مسجلة لهذا اللوكيشن.</div>
        ) : (
          <div className="table-card">
            <div className="table-scroll" style={{ maxHeight: 450, minHeight: 0 }}>
              <table className="smart-table" style={{ minWidth: 980 }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th>Images</th>
                    <th>Issues</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {inspections.map((inspection) => {
                    const device = inspection.device || {};
                    const issuesCount =
                      inspection.issuesCount ||
                      inspection.inspectionIssues?.length ||
                      0;

                    return (
                      <tr
                        key={inspection.id}
                        className="clickable-row"
                        onClick={() => onOpenInspection(inspection)}
                      >
                        <td>#{inspection.id}</td>
                        <td>{getDeviceDisplayName(device)}</td>
                        <td>
                          <span className={`tag ${statusClass(inspection.inspectionStatus)}`}>
                            {arStatus(inspection.inspectionStatus)}
                          </span>
                        </td>
                        <td>{getTechName(inspection)}</td>
                        <td>{getImages(inspection).length}</td>
                        <td>{issuesCount}</td>
                        <td>{fmtDateTime(inspection.inspectedAt || inspection.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InspectionsPage;