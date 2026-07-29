import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

const CACHE_KEY = "smartit_software_viewer_single_global_card_v1";

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
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.devices)) return data.devices;
  return [];
}

async function fetchMerged(paths) {
  const results = await Promise.allSettled(paths.map((p) => api(p)));
  const merged = [];
  const seen = new Set();

  results.forEach((result) => {
    if (result.status !== "fulfilled") return;

    toArray(result.value).forEach((item) => {
      const key = String(item?.id || JSON.stringify(item));
      if (seen.has(key)) return;

      seen.add(key);
      merged.push(item);
    });
  });

  return merged;
}

function safeJsonParse(value) {
  if (!value) return {};
  if (typeof value === "object") return value;

  try {
    return JSON.parse(String(value));
  } catch {
    return {};
  }
}

function clean(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text && text !== "null" && text !== "undefined" ? text : fallback;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value) {
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

function formatShortDate(value) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDateValue(item) {
  return (
    item?.finishedAt ||
    item?.inspectedAt ||
    item?.completedAt ||
    item?.doneAt ||
    item?.updatedAt ||
    item?.scheduledDate ||
    item?.createdAt ||
    null
  );
}

function sameDay(dateValue, selectedDate) {
  if (!dateValue || !selectedDate) return true;

  const d = new Date(dateValue);
  const s = new Date(selectedDate);

  if (Number.isNaN(d.getTime()) || Number.isNaN(s.getTime())) return true;

  return (
    d.getFullYear() === s.getFullYear() &&
    d.getMonth() === s.getMonth() &&
    d.getDate() === s.getDate()
  );
}

function monthLabel(value) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const index = Number(value) - 1;
  return months[index] || value;
}

function getYearOptions() {
  const current = new Date().getFullYear();
  const years = [];

  for (let y = current + 1; y >= current - 6; y -= 1) {
    years.push(y);
  }

  return years;
}

function itemMatchesDateFilters(item, filters) {
  const dateValue = getDateValue(item);
  const d = dateValue ? new Date(dateValue) : null;

  if (!dateValue || !d || Number.isNaN(d.getTime())) {
    return !filters.day && filters.month === "ALL" && filters.year === "ALL";
  }

  if (filters.day && !sameDay(dateValue, filters.day)) return false;

  if (filters.month !== "ALL" && d.getMonth() + 1 !== Number(filters.month)) {
    return false;
  }

  if (filters.year !== "ALL" && d.getFullYear() !== Number(filters.year)) {
    return false;
  }

  return true;
}

function statusUpper(status) {
  return String(status || "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function getMeta(item) {
  return (
    safeJsonParse(item?.completionMetadata) ||
    safeJsonParse(item?.inspection?.completionMetadata) ||
    safeJsonParse(item?.metadata) ||
    item?.completionMetadata ||
    item?.metadata ||
    {}
  );
}

function isFinished(status) {
  const v = statusUpper(status);

  return (
    v === "DONE" ||
    v === "COMPLETED" ||
    v === "OK" ||
    v === "SUCCESS" ||
    v === "ISSUE_FOUND" ||
    v === "NOT_REACHABLE"
  );
}

function isOk(status, item = {}) {
  const v = statusUpper(status);

  const meta = getMeta(item);
  const after = statusUpper(
    meta.afterDeviceStatus ||
      item.afterDeviceStatus ||
      item.finalDeviceStatus ||
      item.finalStatus
  );

  if (after === "OK") return true;

  return (
    v === "DONE" ||
    v === "COMPLETED" ||
    v === "OK" ||
    v === "SUCCESS" ||
    v === "PASSED"
  );
}

function isNotOk(status, item = {}) {
  const v = statusUpper(status);

  const meta = getMeta(item);
  const after = statusUpper(
    meta.afterDeviceStatus ||
      item.afterDeviceStatus ||
      item.finalDeviceStatus ||
      item.finalStatus
  );

  if (after && after !== "OK") return true;

  return (
    v === "ISSUE_FOUND" ||
    v === "NOT_OK" ||
    v === "NOT_REACHABLE" ||
    v === "NEEDS_MAINTENANCE" ||
    v === "OUT_OF_SERVICE" ||
    v === "FAILED" ||
    v === "BAD"
  );
}

function statusLabel(status, item = {}) {
  if (isNotOk(status, item)) return "Not OK";
  if (isOk(status, item)) return "OK";

  const v = statusUpper(status);

  if (v === "IN_PROGRESS") return "In Progress";
  if (v === "PENDING") return "Pending";

  return clean(status, "Pending");
}

function statusClass(status, item = {}) {
  if (isNotOk(status, item)) return "notok";
  if (isOk(status, item)) return "ok";

  const v = statusUpper(status);

  if (v === "IN_PROGRESS") return "progress";
  return "pending";
}

function stripSystemMeta(text) {
  return String(text || "")
    .replace(/\[\[INSPECTION_SYSTEM_META\]\]\s*\{[\s\S]*?\}\s*$/gi, "")
    .replace(/\[\[INSPECTION_SYSTEM_META\]\][\s\S]*$/gi, "")
    .replace(/Final\s+Device\s+Condition\s*:\s*(OK|NOT_OK|GOOD|BAD)/gi, "")
    .replace(/beforeDeviceStatus\s*:\s*"?[^,}"]+"?/gi, "")
    .replace(/afterDeviceStatus\s*:\s*"?[^,}"]+"?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getProblemReason(item = {}) {
  const meta = getMeta(item);

  const candidates = [
    item.problemReason,
    item.issueReason,
    item.reason,
    item.issue,
    item.problem,
    item.notes,
    item.completionNote,
    item.description,
    item.details,
    item.inspection?.notes,
    item.inspection?.issueReason,
    meta.problemReason,
    meta.issueReason,
    meta.reason,
    meta.issue,
    meta.problem,
    meta.notes,
    meta.completionNote,
    meta.issueTitle,
    meta.issueDescription,
  ];

  const reason = candidates
    .map((x) => stripSystemMeta(x))
    .find((x) => String(x || "").trim());

  return reason || "";
}

function deviceTitle(device) {
  return (
    device?.deviceName ||
    device?.name ||
    device?.deviceCode ||
    device?.barcode ||
    `Device ${device?.id || ""}`
  );
}

function deviceCode(device, item = {}) {
  return (
    device?.deviceCode ||
    item?.deviceCode ||
    item?.code ||
    device?.barcode ||
    item?.barcode ||
    "—"
  );
}

function deviceSerial(device, item = {}) {
  return (
    device?.serialNumber ||
    device?.serial ||
    item?.serialNumber ||
    item?.serial ||
    "—"
  );
}

function deviceIp(device, item = {}) {
  return (
    device?.ipAddress ||
    item?.ipAddress ||
    item?.deviceIp ||
    item?.ip ||
    "—"
  );
}

function deviceLocation(device) {
  const l = device?.location || {};

  return [
    device?.gateCluster || device?.cluster || l?.cluster,
    device?.gateBuilding || device?.building || l?.building,
    device?.gateZone || device?.zone || l?.zone,
    device?.gateDirection || device?.direction || l?.direction,
    device?.gateNo || device?.lane || l?.lane,
  ]
    .filter(Boolean)
    .join(" - ");
}

function locationParts(device) {
  const l = device?.location || {};

  return {
    cluster: device?.gateCluster || device?.cluster || l?.cluster || "",
    building: device?.gateBuilding || device?.building || l?.building || "",
    zone: device?.gateZone || device?.zone || l?.zone || "",
    direction: device?.gateDirection || device?.direction || l?.direction || "",
    lane: device?.gateNo || device?.lane || l?.lane || "",
  };
}

function normalizeTask(task) {
  const rawItems = toArray(task?.items);

  const items = rawItems.map((item) => {
    const device = item?.device || task?.device || {};
    const status = item?.status || item?.inspectionStatus || "PENDING";
    const meta = getMeta(item);

    return {
      id: item?.id,
      taskId: task?.id,
      taskTitle: task?.title || task?.name || "Global Task",
      taskStatus: task?.status || "PENDING",
      scheduledDate: task?.scheduledDate,
      createdAt: item?.createdAt || task?.createdAt,
      updatedAt: item?.updatedAt || task?.updatedAt,
      finishedAt:
        item?.inspectedAt ||
        item?.completedAt ||
        item?.doneAt ||
        item?.updatedAt ||
        task?.completedAt ||
        null,

      status,
      result: statusLabel(status, item),
      isOk: isOk(status, item),
      isNotOk: isNotOk(status, item),
      isFinished: isFinished(status),

      device,
      deviceId: item?.deviceId || device?.id || item?.assetId || null,
      deviceCode: deviceCode(device, item),
      deviceName: deviceTitle(device),
      serial: deviceSerial(device, item),
      ipAddress: deviceIp(device, item),
      location: deviceLocation(device),
      locationParts: locationParts(device),
      problemReason: getProblemReason({ ...item, completionMetadata: meta }),
      raw: item,
    };
  });

  return {
    ...task,
    items,
  };
}

function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function loadCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveCache(payload) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        ...payload,
        cachedAt: new Date().toISOString(),
      })
    );
  } catch {
    // ignore cache errors
  }
}

const styles = `
.software-viewer-clean {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(28,169,225,.12), transparent 28%),
    radial-gradient(circle at bottom right, rgba(38,55,70,.08), transparent 30%),
    linear-gradient(135deg, #f8fcff 0%, #eefaff 45%, #ffffff 100%);
  color: #0f172a;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.sv-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.sv-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
  letter-spacing: -0.6px;
}

.sv-title p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 800;
}

.sv-btn {
  border: 0;
  border-radius: 14px;
  padding: 12px 17px;
  font-weight: 950;
  cursor: pointer;
  transition: 0.18s ease;
  font-family: inherit;
}

.sv-btn:hover {
  transform: translateY(-1px);
}

.sv-btn-dark {
  background: #0f172a;
  color: #fff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, .18);
}

.sv-btn-soft {
  background: #fff;
  color: #263746;
  border: 1px solid #dbeafe;
}

.sv-btn-green {
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #bbf7d0;
}

.sv-loading-line {
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: #dbeafe;
  margin-bottom: 16px;
}

.sv-loading-line i {
  display: block;
  height: 100%;
  width: 38%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1CA9E1, #22c55e);
  animation: svMove 1s infinite alternate ease-in-out;
}

@keyframes svMove {
  from { transform: translateX(-25%); }
  to { transform: translateX(190%); }
}

.sv-global-card {
  position: relative;
  overflow: hidden;
  margin-bottom: 18px;
  border-radius: 30px;
  padding: 24px;
  cursor: pointer;
  border: 1px solid rgba(186, 230, 253, .95);
  background:
    radial-gradient(circle at 10% 0%, rgba(255,255,255,.85), transparent 25%),
    radial-gradient(circle at 92% 8%, rgba(34,197,94,.18), transparent 24%),
    linear-gradient(135deg, #ffffff 0%, #eefaff 42%, #e9f8ff 100%);
  box-shadow: 0 24px 58px rgba(15, 23, 42, .09);
  transition: .2s ease;
}

.sv-global-card:hover {
  transform: translateY(-3px);
  border-color: #7dd3fc;
  box-shadow: 0 30px 70px rgba(15, 23, 42, .12);
}

.sv-global-card:focus {
  outline: none;
  box-shadow: 0 0 0 4px rgba(28, 169, 225, .15), 0 30px 70px rgba(15, 23, 42, .12);
}

.sv-global-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 6px;
  background: linear-gradient(90deg, #1CA9E1, #22c55e, #f59e0b, #ef4444);
}

.sv-global-card::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: -90px;
  top: -110px;
  border-radius: 50%;
  background: rgba(28,169,225,.13);
}

.sv-global-content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(260px, .8fr) minmax(420px, 1.4fr);
  gap: 22px;
  align-items: stretch;
}

.sv-global-main {
  background: rgba(255,255,255,.9);
  border: 1px solid rgba(219,234,254,.95);
  border-radius: 24px;
  padding: 20px;
  box-shadow: 0 14px 32px rgba(15,23,42,.045);
}

.sv-global-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0369a1;
  background: #eaf8ff;
  border: 1px solid #bae6fd;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .08em;
}

.sv-global-number {
  margin-top: 14px;
  font-size: 68px;
  line-height: .95;
  font-weight: 1000;
  letter-spacing: -3px;
  color: #0f172a;
}

.sv-global-title {
  margin-top: 8px;
  font-size: 17px;
  font-weight: 950;
  color: #263746;
}

.sv-global-desc {
  margin-top: 8px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
  font-weight: 850;
}

.sv-global-desc strong {
  color: #0369a1;
}

.sv-click-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 13px;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 11px;
  font-weight: 950;
  box-shadow: 0 12px 24px rgba(15,23,42,.15);
}

.sv-global-side {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sv-global-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.sv-global-stat {
  min-height: 104px;
  background: rgba(255,255,255,.94);
  border: 1px solid #dbeafe;
  border-radius: 22px;
  padding: 15px;
  box-shadow: 0 12px 26px rgba(15,23,42,.04);
}

.sv-global-stat span {
  display: block;
  color: #64748b;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .07em;
  font-weight: 950;
}

.sv-global-stat strong {
  display: block;
  margin-top: 9px;
  color: var(--stat-color, #0f172a);
  font-size: 29px;
  line-height: 1;
  font-weight: 1000;
}

.sv-global-stat small {
  display: block;
  margin-top: 8px;
  color: #94a3b8;
  font-size: 11px;
  line-height: 1.45;
  font-weight: 800;
}

.sv-global-progress-card {
  background: rgba(255,255,255,.94);
  border: 1px solid #dbeafe;
  border-radius: 22px;
  padding: 15px;
  box-shadow: 0 12px 26px rgba(15,23,42,.04);
}

.sv-global-progress-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 11px;
  color: #64748b;
  font-size: 12px;
  font-weight: 950;
}

.sv-global-progress-top strong {
  color: #0f172a;
  font-size: 18px;
}

.sv-global-progress {
  height: 13px;
  border-radius: 999px;
  overflow: hidden;
  background: #dff4ff;
}

.sv-global-progress i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1CA9E1, #22c55e);
}

.sv-global-tags {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.sv-global-tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border-radius: 999px;
  padding: 8px 11px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 11px;
  font-weight: 950;
}

.sv-filter-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #dbeafe;
  border-radius: 26px;
  padding: 18px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, .06);
  margin-bottom: 18px;
}

.sv-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.sv-filter-head h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 950;
}

.sv-filter-head p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
}

.sv-count-pill {
  background: #eaf8ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.sv-filter-grid {
  display: grid;
  grid-template-columns: 2fr repeat(5, minmax(130px, 1fr));
  gap: 12px;
}

.sv-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sv-field label {
  font-size: 10px;
  color: #64748b;
  font-weight: 950;
  letter-spacing: .08em;
  text-transform: uppercase;
}

.sv-input,
.sv-select {
  width: 100%;
  height: 46px;
  border-radius: 15px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  padding: 0 13px;
  outline: none;
  font-size: 13px;
  font-weight: 850;
  font-family: inherit;
}

.sv-input:focus,
.sv-select:focus {
  border-color: #1CA9E1;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(28, 169, 225, .12);
}

.sv-filter-foot {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.sv-filter-note {
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
}

.sv-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.sv-tab {
  border: 1px solid #dbeafe;
  background: #fff;
  color: #263746;
  border-radius: 16px;
  padding: 11px 16px;
  font-weight: 950;
  cursor: pointer;
}

.sv-tab.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.sv-panel {
  background: rgba(255,255,255,.92);
  border: 1px solid #dbeafe;
  border-radius: 26px;
  padding: 18px;
  box-shadow: 0 18px 42px rgba(15, 23, 42, .06);
}

.sv-panel-top {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.sv-panel-top h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 950;
}

.sv-panel-top p {
  margin: 5px 0 0;
  color: #64748b;
  font-weight: 800;
  font-size: 12px;
}

.sv-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.sv-card {
  background: linear-gradient(180deg, #fff, #f8fcff);
  border: 1px solid #dbeafe;
  border-radius: 24px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, .05);
  transition: .18s ease;
}

.sv-card:hover {
  transform: translateY(-2px);
  border-color: #1CA9E1;
  box-shadow: 0 18px 42px rgba(15, 23, 42, .08);
}

.sv-card-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.sv-device-name {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
}

.sv-device-sub {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.6;
}

.sv-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
}

.sv-badge.ok {
  background: #dcfce7;
  color: #15803d;
}

.sv-badge.notok {
  background: #fee2e2;
  color: #b91c1c;
}

.sv-badge.pending {
  background: #f1f5f9;
  color: #475569;
}

.sv-badge.progress {
  background: #dbeafe;
  color: #1d4ed8;
}

.sv-badge.soft {
  background: #eaf8ff;
  color: #0369a1;
}

.sv-mini-grid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;
}

.sv-mini-box {
  background: #fff;
  border: 1px solid #e2f2fb;
  border-radius: 15px;
  padding: 10px;
}

.sv-mini-box span {
  display: block;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.sv-mini-box strong {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #0f172a;
  font-weight: 950;
  word-break: break-word;
}

.sv-progress {
  margin-top: 14px;
  height: 10px;
  background: #eaf8ff;
  border-radius: 999px;
  overflow: hidden;
}

.sv-progress i {
  display: block;
  height: 100%;
  width: 0%;
  border-radius: 999px;
  background: linear-gradient(90deg, #1CA9E1, #22c55e);
}

.sv-card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.sv-problem {
  margin-top: 12px;
  border: 1px solid #fecaca;
  background: #fff7f7;
  color: #7f1d1d;
  border-radius: 16px;
  padding: 12px;
}

.sv-problem-title {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  color: #dc2626;
  margin-bottom: 5px;
}

.sv-problem-text {
  font-size: 12px;
  line-height: 1.6;
  font-weight: 800;
}

.sv-empty {
  padding: 36px;
  text-align: center;
  color: #64748b;
  font-weight: 900;
  border: 1px dashed #cbd5e1;
  border-radius: 22px;
  background: #fff;
}

.sv-alert {
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #b91c1c;
  border-radius: 18px;
  padding: 14px;
  font-weight: 900;
  margin-bottom: 16px;
}

.sv-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, .60);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.sv-modal {
  width: min(960px, 96vw);
  max-height: 92vh;
  overflow: hidden;
  background: #fff;
  border-radius: 28px;
  border: 1px solid #dbeafe;
  box-shadow: 0 42px 110px rgba(15, 23, 42, .34);
  display: flex;
  flex-direction: column;
}

.sv-modal-head {
  background: linear-gradient(135deg, #263746, #147394, #1CA9E1);
  color: #fff;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.sv-modal-head h2 {
  margin: 0;
  font-size: 25px;
  font-weight: 950;
}

.sv-modal-head p {
  margin: 6px 0 0;
  color: #eaf8ff;
  font-size: 13px;
  font-weight: 800;
}

.sv-close {
  width: 42px;
  height: 42px;
  border-radius: 15px;
  border: 1px solid rgba(255,255,255,.35);
  background: rgba(255,255,255,.16);
  color: #fff;
  cursor: pointer;
  font-size: 24px;
}

.sv-modal-body {
  padding: 18px;
  overflow: auto;
}

.sv-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.sv-table th {
  text-align: left;
  background: #f8fafc;
  color: #64748b;
  padding: 10px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.sv-table td {
  border-top: 1px solid #e2e8f0;
  padding: 11px 10px;
  color: #0f172a;
  font-weight: 800;
  vertical-align: top;
}

.sv-modal-section {
  border: 1px solid #dbeafe;
  border-radius: 20px;
  overflow: hidden;
  margin-top: 14px;
}

.sv-modal-section h3 {
  margin: 0;
  padding: 14px;
  background: #eaf8ff;
  color: #0f172a;
  font-size: 16px;
}

@media (max-width: 1250px) {
  .sv-global-content {
    grid-template-columns: 1fr;
  }

  .sv-global-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sv-filter-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .sv-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .software-viewer-clean {
    padding: 14px;
  }

  .sv-global-card {
    padding: 16px;
    border-radius: 24px;
  }

  .sv-global-number {
    font-size: 52px;
  }

  .sv-global-stats,
  .sv-filter-grid,
  .sv-mini-grid {
    grid-template-columns: 1fr;
  }

  .sv-actions,
  .sv-filter-head,
  .sv-panel-top {
    align-items: stretch;
    flex-direction: column;
  }

  .sv-btn,
  .sv-select,
  .sv-input {
    width: 100%;
  }
}
`;

export function SoftwareViewerPage() {
  const cache = loadCache();

  const [tab, setTab] = useState("DEVICES");
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState("");

  const [tasks, setTasks] = useState(cache?.tasks?.map(normalizeTask) || []);
  const [devices, setDevices] = useState(cache?.devices || []);

  const [filters, setFilters] = useState({
    search: "",
    result: "ALL",
    progress: "ALL",
    day: "",
    month: "ALL",
    year: "ALL",
  });

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [globalOpen, setGlobalOpen] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = styles;
    document.head.appendChild(style);

    return () => style.remove();
  }, []);

  const loadData = useCallback(async () => {
    setError("");

    if (!tasks.length && !devices.length) {
      setLoading(true);
    }

    try {
      const [taskData, deviceData] = await Promise.all([
        fetchMerged([
          "/inspection-tasks",
          "/inspection-tasks?taskType=SOFTWARE",
          "/inspection-tasks?assetType=SOFTWARE",
          "/inspection-tasks?type=SOFTWARE",
        ]),
        api("/devices").catch(() => []),
      ]);

      const normalizedTasks = taskData.map(normalizeTask);
      const normalizedDevices = toArray(deviceData);

      setTasks(normalizedTasks);
      setDevices(normalizedDevices);

      saveCache({
        tasks: taskData,
        devices: normalizedDevices,
      });
    } catch (e) {
      setError(e.message || "Failed to load software viewer data");
    } finally {
      setLoading(false);
    }
  }, [tasks.length, devices.length]);

  useEffect(() => {
    loadData();
  }, []);

  const allItems = useMemo(() => {
    return tasks.flatMap((task) => task.items || []);
  }, [tasks]);

  const filteredItemsByDate = useMemo(() => {
    return allItems.filter((item) => itemMatchesDateFilters(item, filters));
  }, [allItems, filters]);

  const deviceRows = useMemo(() => {
    const map = new Map();

    filteredItemsByDate.forEach((item) => {
      const key = String(
        item.deviceId ||
          item.deviceCode ||
          item.serial ||
          item.ipAddress ||
          item.deviceName
      );

      if (!map.has(key)) {
        map.set(key, {
          key,
          deviceId: item.deviceId,
          title: item.deviceName,
          deviceCode: item.deviceCode,
          serial: item.serial,
          ipAddress: item.ipAddress,
          location: item.location,
          locationParts: item.locationParts,
          total: 0,
          finished: 0,
          ok: 0,
          notOk: 0,
          remaining: 0,
          lastStatus: item.status,
          lastResult: item.result,
          lastUpdate: getDateValue(item),
          problemReasons: [],
          taskTitles: new Set(),
          records: [],
        });
      }

      const row = map.get(key);

      row.total += 1;
      row.taskTitles.add(item.taskTitle);

      if (item.isFinished) row.finished += 1;
      if (item.isOk) row.ok += 1;
      if (item.isNotOk) row.notOk += 1;

      const itemDate = getDateValue(item);
      const currentLast = row.lastUpdate ? new Date(row.lastUpdate) : null;
      const nextDate = itemDate ? new Date(itemDate) : null;

      if (!currentLast || (nextDate && nextDate > currentLast)) {
        row.lastStatus = item.status;
        row.lastResult = item.result;
        row.lastUpdate = itemDate;
      }

      if (item.problemReason && item.isNotOk) {
        row.problemReasons.push(item.problemReason);
      }

      row.records.push(item);
    });

    return [...map.values()].map((row) => {
      const remaining = Math.max(row.total - row.finished, 0);

      return {
        ...row,
        remaining,
        progress: percent(row.finished, row.total),
        taskTitles: [...row.taskTitles],
        problemReasons: [...new Set(row.problemReasons.filter(Boolean))],
        records: row.records.sort(
          (a, b) =>
            new Date(getDateValue(b) || 0) -
            new Date(getDateValue(a) || 0)
        ),
      };
    });
  }, [filteredItemsByDate]);

  const filteredDevices = useMemo(() => {
    const query = normalizeText(filters.search);

    return deviceRows.filter((row) => {
      const text = normalizeText(
        [
          row.ipAddress,
          row.serial,
          row.deviceCode,
          row.title,
          row.location,
          row.lastStatus,
          row.lastResult,
          ...row.taskTitles,
          ...row.problemReasons,
        ]
          .filter(Boolean)
          .join(" ")
      );

      if (query && !text.includes(query)) return false;

      if (filters.result === "OK" && row.ok <= 0) return false;
      if (filters.result === "NOT_OK" && row.notOk <= 0) return false;

      if (filters.progress === "DONE" && row.remaining > 0) return false;
      if (filters.progress === "REMAINING" && row.remaining <= 0) return false;
      if (filters.progress === "HAS_PROBLEM" && row.notOk <= 0) return false;

      return true;
    });
  }, [deviceRows, filters]);

  const taskBreakdown = useMemo(() => {
    const map = new Map();

    filteredItemsByDate.forEach((item) => {
      const key = String(item.taskId || item.taskTitle || "Global Task");

      if (!map.has(key)) {
        map.set(key, {
          key,
          title: item.taskTitle || "Global Task",
          taskId: item.taskId,
          devices: new Set(),
          total: 0,
          done: 0,
          remaining: 0,
          ok: 0,
          notOk: 0,
          lastUpdate: getDateValue(item),
        });
      }

      const row = map.get(key);
      const deviceKey = String(
        item.deviceId ||
          item.deviceCode ||
          item.serial ||
          item.ipAddress ||
          item.deviceName
      );

      row.devices.add(deviceKey);
      row.total += 1;

      if (item.isFinished) row.done += 1;
      if (item.isOk) row.ok += 1;
      if (item.isNotOk) row.notOk += 1;

      const itemDate = getDateValue(item);
      const currentLast = row.lastUpdate ? new Date(row.lastUpdate) : null;
      const nextDate = itemDate ? new Date(itemDate) : null;

      if (!currentLast || (nextDate && nextDate > currentLast)) {
        row.lastUpdate = itemDate;
      }
    });

    return [...map.values()]
      .map((row) => ({
        ...row,
        devicesCount: row.devices.size,
        remaining: Math.max(row.total - row.done, 0),
        progress: percent(row.done, row.total),
      }))
      .sort((a, b) => new Date(b.lastUpdate || 0) - new Date(a.lastUpdate || 0));
  }, [filteredItemsByDate]);

  const summary = useMemo(() => {
    const totalTasks = new Set(filteredItemsByDate.map((x) => x.taskId)).size;
    const totalItems = filteredItemsByDate.length;
    const finishedItems = filteredItemsByDate.filter((x) => x.isFinished).length;
    const okItems = filteredItemsByDate.filter((x) => x.isOk).length;
    const notOkItems = filteredItemsByDate.filter((x) => x.isNotOk).length;
    const remainingItems = Math.max(totalItems - finishedItems, 0);
    const completedDevices = deviceRows.filter(
      (d) => d.total > 0 && d.remaining === 0
    ).length;
    const pendingDevices = deviceRows.filter((d) => d.remaining > 0).length;

    return {
      totalTasks,
      totalItems,
      finishedItems,
      remainingItems,
      okItems,
      notOkItems,
      totalDevices: deviceRows.length || devices.length,
      completedDevices,
      pendingDevices,
      progress: percent(finishedItems, totalItems),
    };
  }, [filteredItemsByDate, deviceRows, devices]);

  function updateFilter(key, value) {
    setFilters((old) => ({
      ...old,
      [key]: value,
    }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      result: "ALL",
      progress: "ALL",
      day: "",
      month: "ALL",
      year: "ALL",
    });
  }

  return (
    <section className="software-viewer-clean">
      {loading ? (
        <div className="sv-loading-line">
          <i />
        </div>
      ) : null}

      <div className="sv-actions">
        <div className="sv-title">
          <h1></h1>
          <p></p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="sv-btn sv-btn-soft" onClick={resetFilters}>
            Reset Filters
          </button>

          <button className="sv-btn sv-btn-dark" onClick={loadData}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? <div className="sv-alert">{error}</div> : null}

      <GlobalTasksCard summary={summary} onOpen={() => setGlobalOpen(true)} />

      <div className="sv-filter-card">
        <div className="sv-filter-head">
          <div>
            <h2>Advanced Filter</h2>
            <p>
              Search by IP Address, Serial Number, device code, location, task,
              result, or date.
            </p>
          </div>

          <div className="sv-count-pill">
            {filteredDevices.length} / {deviceRows.length} devices
          </div>
        </div>

        <div className="sv-filter-grid">
          <div className="sv-field">
            <label>IP Address / Serial Number</label>
            <input
              className="sv-input"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="IP Address, Serial Number, Device Code..."
            />
          </div>

          <div className="sv-field">
            <label>Result</label>
            <select
              className="sv-select"
              value={filters.result}
              onChange={(e) => updateFilter("result", e.target.value)}
            >
              <option value="ALL">All Results</option>
              <option value="OK">OK</option>
              <option value="NOT_OK">Not OK</option>
            </select>
          </div>

          <div className="sv-field">
            <label>Progress</label>
            <select
              className="sv-select"
              value={filters.progress}
              onChange={(e) => updateFilter("progress", e.target.value)}
            >
              <option value="ALL">All Progress</option>
              <option value="DONE">Completed</option>
              <option value="REMAINING">Has Remaining</option>
              <option value="HAS_PROBLEM">Has Problem</option>
            </select>
          </div>

          <div className="sv-field">
            <label>Day</label>
            <input
              className="sv-input"
              type="date"
              value={filters.day}
              onChange={(e) => updateFilter("day", e.target.value)}
            />
          </div>

          <div className="sv-field">
            <label>Month</label>
            <select
              className="sv-select"
              value={filters.month}
              onChange={(e) => updateFilter("month", e.target.value)}
            >
              <option value="ALL">All Months</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>

          <div className="sv-field">
            <label>Year</label>
            <select
              className="sv-select"
              value={filters.year}
              onChange={(e) => updateFilter("year", e.target.value)}
            >
              <option value="ALL">All Years</option>
              {getYearOptions().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sv-filter-foot">
          <div className="sv-filter-note">
            Completion: {summary.progress}% · Done: {summary.finishedItems} ·
            Remaining: {summary.remainingItems}
          </div>

          <button className="sv-btn sv-btn-green" onClick={resetFilters}>
            Clear
          </button>
        </div>
      </div>

      <div className="sv-tabs">
        <button
          className={`sv-tab ${tab === "DEVICES" ? "active" : ""}`}
          onClick={() => setTab("DEVICES")}
        >
          Devices
        </button>

        <button
          className={`sv-tab ${tab === "NOT_OK" ? "active" : ""}`}
          onClick={() => setTab("NOT_OK")}
        >
          Not OK Only
        </button>

        <button
          className={`sv-tab ${tab === "REMAINING" ? "active" : ""}`}
          onClick={() => setTab("REMAINING")}
        >
          Remaining
        </button>
      </div>

      <div className="sv-panel">
        <div className="sv-panel-top">
          <div>
            <h2>
              {tab === "DEVICES"
                ? "Device Work Status"
                : tab === "NOT_OK"
                  ? "Not OK Devices"
                  : "Remaining Work"}
            </h2>

            <p>
              Clean work status only: result, serial number, IP address, and
              problem reason.
            </p>
          </div>

          <div className="sv-count-pill">{filteredDevices.length} records</div>
        </div>

        <DeviceList
          rows={filteredDevices.filter((row) => {
            if (tab === "NOT_OK") return row.notOk > 0;
            if (tab === "REMAINING") return row.remaining > 0;
            return true;
          })}
          onOpen={setSelectedDevice}
        />
      </div>

      {globalOpen ? (
        <GlobalTasksModal
          summary={summary}
          taskBreakdown={taskBreakdown}
          onClose={() => setGlobalOpen(false)}
        />
      ) : null}

      {selectedDevice ? (
        <DeviceDetailsModal
          row={selectedDevice}
          onClose={() => setSelectedDevice(null)}
        />
      ) : null}
    </section>
  );
}

function GlobalTasksCard({ summary, onOpen }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  }

  return (
    <div
      className="sv-global-card"
      onClick={onOpen}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      title="Click to view global task details"
    >
      <div className="sv-global-content">
        <div className="sv-global-main">
          <div className="sv-global-label">Global Tasks</div>

          <div className="sv-global-number">{summary.totalTasks}</div>

          <div className="sv-global-title">Total received tasks</div>

          <div className="sv-global-desc">
            Includes <strong>{summary.totalItems}</strong> task items assigned
            to <strong>{summary.totalDevices}</strong> devices.
          </div>

          <div className="sv-click-hint">Click for full task summary</div>
        </div>

        <div className="sv-global-side">
          <div className="sv-global-stats">
            <div
              className="sv-global-stat"
              style={{ "--stat-color": "#263746" }}
            >
              <span>Task Items</span>
              <strong>{summary.totalItems}</strong>
              <small>All assigned work</small>
            </div>

            <div
              className="sv-global-stat"
              style={{ "--stat-color": "#1CA9E1" }}
            >
              <span>Devices</span>
              <strong>{summary.totalDevices}</strong>
              <small>Included devices</small>
            </div>

            <div
              className="sv-global-stat"
              style={{ "--stat-color": "#10b981" }}
            >
              <span>Done</span>
              <strong>{summary.finishedItems}</strong>
              <small>Completed work</small>
            </div>

            <div
              className="sv-global-stat"
              style={{ "--stat-color": "#f59e0b" }}
            >
              <span>Remaining</span>
              <strong>{summary.remainingItems}</strong>
              <small>Still pending</small>
            </div>
          </div>

          <div className="sv-global-progress-card">
            <div className="sv-global-progress-top">
              <span>Global task completion</span>
              <strong>{summary.progress}%</strong>
            </div>

            <div className="sv-global-progress">
              <i style={{ width: `${summary.progress}%` }} />
            </div>

            <div className="sv-global-tags">
              <span className="sv-global-tag">OK {summary.okItems}</span>
              <span className="sv-global-tag">
                Not OK {summary.notOkItems}
              </span>
              <span className="sv-global-tag">
                Completed Devices {summary.completedDevices}
              </span>
              <span className="sv-global-tag">
                Pending Devices {summary.pendingDevices}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalTasksModal({ summary, taskBreakdown, onClose }) {
  return (
    <div className="sv-modal-backdrop" onMouseDown={onClose}>
      <div className="sv-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sv-modal-head">
          <div>
            <h2>Global Tasks Summary</h2>
            <p>
              Full clickable summary: tasks, devices, items, done, remaining,
              OK, and Not OK.
            </p>
          </div>

          <button className="sv-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sv-modal-body">
          <div className="sv-mini-grid">
            <div className="sv-mini-box">
              <span>Global Tasks</span>
              <strong>{summary.totalTasks}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Devices</span>
              <strong>{summary.totalDevices}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Task Items</span>
              <strong>{summary.totalItems}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Completion</span>
              <strong>{summary.progress}%</strong>
            </div>

            <div className="sv-mini-box">
              <span>Done</span>
              <strong>{summary.finishedItems}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Remaining</span>
              <strong>{summary.remainingItems}</strong>
            </div>

            <div className="sv-mini-box">
              <span>OK</span>
              <strong>{summary.okItems}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Not OK</span>
              <strong>{summary.notOkItems}</strong>
            </div>
          </div>

          <div className="sv-modal-section">
            <h3>Task Breakdown</h3>

            <table className="sv-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Devices</th>
                  <th>Items</th>
                  <th>Done</th>
                  <th>Remaining</th>
                  <th>OK</th>
                  <th>Not OK</th>
                  <th>Progress</th>
                  <th>Last Update</th>
                </tr>
              </thead>

              <tbody>
                {taskBreakdown.map((task) => (
                  <tr key={task.key}>
                    <td>{clean(task.title)}</td>
                    <td>{task.devicesCount}</td>
                    <td>{task.total}</td>
                    <td>{task.done}</td>
                    <td>{task.remaining}</td>
                    <td>{task.ok}</td>
                    <td>{task.notOk}</td>
                    <td>{task.progress}%</td>
                    <td>{formatShortDate(task.lastUpdate)}</td>
                  </tr>
                ))}

                {!taskBreakdown.length ? (
                  <tr>
                    <td colSpan="9">No global tasks available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ height: 14 }} />

          <button className="sv-btn sv-btn-dark" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function DeviceList({ rows, onOpen }) {
  if (!rows.length) {
    return <div className="sv-empty">No devices match the selected filters.</div>;
  }

  return (
    <div className="sv-list">
      {rows.map((row) => (
        <DeviceCard key={row.key} row={row} onOpen={() => onOpen(row)} />
      ))}
    </div>
  );
}

function DeviceCard({ row, onOpen }) {
  const mainStatus = row.notOk > 0 ? "NOT_OK" : row.ok > 0 ? "OK" : "PENDING";

  return (
    <article className="sv-card">
      <div className="sv-card-head">
        <div>
          <h3 className="sv-device-name">{row.title}</h3>
          <div className="sv-device-sub">
            Code: {clean(row.deviceCode)}
            <br />
            Serial: {clean(row.serial)} · IP: {clean(row.ipAddress)}
          </div>
        </div>

        <span
          className={`sv-badge ${
            mainStatus === "OK"
              ? "ok"
              : mainStatus === "NOT_OK"
                ? "notok"
                : "pending"
          }`}
        >
          {mainStatus === "OK"
            ? "OK"
            : mainStatus === "NOT_OK"
              ? "Not OK"
              : "Pending"}
        </span>
      </div>

      <div className="sv-mini-grid">
        <div className="sv-mini-box">
          <span>Total</span>
          <strong>{row.total}</strong>
        </div>

        <div className="sv-mini-box">
          <span>Done</span>
          <strong>{row.finished}</strong>
        </div>

        <div className="sv-mini-box">
          <span>Remaining</span>
          <strong>{row.remaining}</strong>
        </div>

        <div className="sv-mini-box">
          <span>Not OK</span>
          <strong>{row.notOk}</strong>
        </div>

        <div className="sv-mini-box">
          <span>OK</span>
          <strong>{row.ok}</strong>
        </div>

        <div className="sv-mini-box">
          <span>Progress</span>
          <strong>{row.progress}%</strong>
        </div>

        <div className="sv-mini-box">
          <span>Last Update</span>
          <strong>{formatShortDate(row.lastUpdate)}</strong>
        </div>

        <div className="sv-mini-box">
          <span>Tasks</span>
          <strong>{row.taskTitles.length}</strong>
        </div>
      </div>

      <div className="sv-progress">
        <i style={{ width: `${row.progress}%` }} />
      </div>

      {row.problemReasons.length ? (
        <div className="sv-problem">
          <div className="sv-problem-title">Problem Reason</div>
          <div className="sv-problem-text">{row.problemReasons[0]}</div>
        </div>
      ) : null}

      <div className="sv-card-bottom">
        <div className="sv-device-sub">{row.location || "No location"}</div>

        <button className="sv-btn sv-btn-soft" onClick={onOpen}>
          View Summary
        </button>
      </div>
    </article>
  );
}

function DeviceDetailsModal({ row, onClose }) {
  const visibleRecords = row.records.slice(0, 25);

  return (
    <div className="sv-modal-backdrop" onMouseDown={onClose}>
      <div className="sv-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sv-modal-head">
          <div>
            <h2>{row.title}</h2>
            <p>
              Simple summary only: OK / Not OK, completed, remaining, serial,
              IP, and problem reason.
            </p>
          </div>

          <button className="sv-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sv-modal-body">
          <div className="sv-mini-grid">
            <div className="sv-mini-box">
              <span>Device Code</span>
              <strong>{clean(row.deviceCode)}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Serial</span>
              <strong>{clean(row.serial)}</strong>
            </div>

            <div className="sv-mini-box">
              <span>IP Address</span>
              <strong>{clean(row.ipAddress)}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Progress</span>
              <strong>{row.progress}%</strong>
            </div>

            <div className="sv-mini-box">
              <span>Total Work</span>
              <strong>{row.total}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Done</span>
              <strong>{row.finished}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Remaining</span>
              <strong>{row.remaining}</strong>
            </div>

            <div className="sv-mini-box">
              <span>Not OK</span>
              <strong>{row.notOk}</strong>
            </div>
          </div>

          <div className="sv-modal-section">
            <h3>Device Information</h3>

            <table className="sv-table">
              <tbody>
                <tr>
                  <th>Device</th>
                  <td>{clean(row.title)}</td>
                </tr>

                <tr>
                  <th>Device Code</th>
                  <td>{clean(row.deviceCode)}</td>
                </tr>

                <tr>
                  <th>Serial</th>
                  <td>{clean(row.serial)}</td>
                </tr>

                <tr>
                  <th>IP Address</th>
                  <td>{clean(row.ipAddress)}</td>
                </tr>

                <tr>
                  <th>Location</th>
                  <td>{clean(row.location)}</td>
                </tr>

                <tr>
                  <th>Last Update</th>
                  <td>{formatDate(row.lastUpdate)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="sv-modal-section">
            <h3>Global Task Summary</h3>

            <table className="sv-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Result</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Problem Reason</th>
                </tr>
              </thead>

              <tbody>
                {visibleRecords.map((record) => (
                  <tr key={`${record.taskId}-${record.id}`}>
                    <td>{clean(record.taskTitle)}</td>

                    <td>
                      <span
                        className={`sv-badge ${statusClass(
                          record.status,
                          record
                        )}`}
                      >
                        {record.result}
                      </span>
                    </td>

                    <td>{statusLabel(record.status, record)}</td>

                    <td>{formatDate(getDateValue(record))}</td>

                    <td>
                      {record.isNotOk
                        ? clean(record.problemReason, "No reason saved")
                        : "—"}
                    </td>
                  </tr>
                ))}

                {!visibleRecords.length ? (
                  <tr>
                    <td colSpan="5">No task records available.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ height: 14 }} />

          <button className="sv-btn sv-btn-dark" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SoftwareViewerPage;