import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const LOCATIONS_CSS = `
.loc-root *, .loc-root *::before, .loc-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.loc-root {
  --blue: #378ADD;
  --green: #1D9E75;
  --amber: #BA7517;
  --red: #C0392B;
  --purple: #7F77DD;
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
  font-weight: 800;
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

/* summary */
.loc-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}

.loc-summary-tile {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.loc-summary-tile__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.loc-summary-tile__val {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
  margin-top: 3px;
}

.loc-summary-tile__label {
  font-size: 11px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 700;
}

/* Cute filter */
.loc-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(55,138,221,0.15), transparent 34%),
    radial-gradient(circle at bottom right, rgba(127,119,221,0.10), transparent 32%);
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.loc-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.loc-filter-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.loc-filter-icon {
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

.loc-filter-title-text {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
}

.loc-filter-title-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.loc-filter-result {
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

.loc-filter-result-dot {
  width: 7px;
  height: 7px;
  background: #378add;
  border-radius: 50%;
}

.loc-filter-grid {
  display: grid;
  grid-template-columns: minmax(260px, 2fr) repeat(8, minmax(120px, 1fr));
  gap: 12px;
  align-items: end;
}

.loc-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.loc-filter-field label {
  font-size: 10px;
  font-weight: 900;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: .09em;
  white-space: nowrap;
}

.loc-filter-input,
.loc-filter-select {
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

.loc-filter-input {
  font-weight: 600;
}

.loc-filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.loc-filter-input:hover,
.loc-filter-select:hover {
  background-color: #ffffff;
  border-color: #b7c6d8;
}

.loc-filter-input:focus,
.loc-filter-select:focus {
  border-color: #378add;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(55,138,221,0.13);
}

.loc-filter-select {
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

.loc-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.loc-filter-hint {
  font-size: 12px;
  color: #94a3b8;
}

.loc-filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.loc-filter-btn {
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

.loc-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.loc-filter-btn-ok {
  background: #0f172a;
  color: #ffffff;
  min-width: 78px;
  box-shadow: 0 10px 20px rgba(15,23,42,0.18);
}

.loc-filter-btn:hover {
  transform: translateY(-1px);
}

.loc-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.loc-filter-btn-ok:hover {
  background: #378add;
  box-shadow: 0 10px 20px rgba(55,138,221,0.24);
}

.loc-filter-btn:active {
  transform: translateY(0);
}

/* view row */
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
  font-weight: 700;
  color: var(--muted);
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
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
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.loc-view-btn--active {
  background: var(--surface2);
  color: var(--text);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* cards */
.loc-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 14px;
}

.loc-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  padding: 18px;
  cursor: pointer;
  transition: box-shadow .15s, transform .1s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.loc-card__top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.loc-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  transform: translateY(-1px);
}

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
  font-weight: 800;
  color: var(--text);
  margin-bottom: 3px;
}

.loc-card__hint {
  font-size: 11px;
  color: var(--faint);
  line-height: 1.6;
}

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
  font-weight: 800;
  color: var(--text);
}

.loc-stat span {
  font-size: 10px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 700;
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
}

/* table */
.loc-list-wrap {
  width: 100%;
  overflow-x: auto;
}

.loc-list-table {
  width: 100%;
  min-width: 1150px;
  border-collapse: collapse;
  font-size: 13px;
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  border: 0.5px solid var(--border);
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.loc-list-table th {
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

.loc-list-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.loc-list-table tr:last-child td {
  border-bottom: none;
}

.loc-list-table tr:hover td {
  background: #fafbfc;
  cursor: pointer;
}

.loc-list-name {
  font-size: 13px;
  font-weight: 800;
  color: var(--text);
}

.loc-list-hint {
  font-size: 11px;
  color: var(--faint);
  margin-top: 2px;
}

.loc-list-count {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
}

/* detail */
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
  width: 390px;
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
  padding: 6px 14px;
  border: 0.5px solid var(--border);
  border-radius: 9px;
  background: var(--surface2);
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.loc-detail-close:hover {
  background: #FDECEA;
  color: #C0392B;
}

.loc-detail-name {
  font-size: 18px;
  font-weight: 800;
  color: var(--text);
}

.loc-detail-sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 3px;
  line-height: 1.7;
}

.loc-detail-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.loc-detail-kpi {
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 12px;
  padding: 14px;
}

.loc-detail-kpi strong {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 4px;
}

.loc-detail-kpi span {
  font-size: 10px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 700;
}

/* badges */
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

@media (max-width: 1600px) {
  .loc-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(4, minmax(145px, 1fr));
  }
}

@media (max-width: 1100px) {
  .loc-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .loc-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .loc-root {
    padding: 16px 14px;
  }
}

@media (max-width: 620px) {
  .loc-summary {
    grid-template-columns: 1fr;
  }

  .loc-filter-grid {
    grid-template-columns: 1fr;
  }

  .loc-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .loc-filter-btn {
    width: 100%;
  }
}
`;

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const DEFAULT_FILTERS = {
  search: "",
  result: "ALL",
  building: "ALL",
  cluster: "ALL",
  direction: "ALL",
  excellId: "ALL",
  lane: "ALL",
  type: "ALL",
  zone: "ALL",
};

const RESULT_OPTIONS = [
  { key: "ALL", en: "All results", ar: "كل النتائج" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "NOT_OK", en: "Not OK", ar: "غير سليم" },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmtShort(iso) {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
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

function mapDeviceStatus(status) {
  const s = String(status || "").toUpperCase();

  if (
    [
      "OK",
      "NEEDS_MAINTENANCE",
      "UNDER_MAINTENANCE",
      "OUT_OF_SERVICE",
      "ATTENTION",
    ].includes(s)
  ) {
    return s;
  }

  if (["NOT_OK", "PARTIAL", "NOT_REACHABLE", "FAILED", "BAD"].includes(s)) {
    return "ATTENTION";
  }

  return "OK";
}

function mapInspectionToAttention(inspectionStatus) {
  const s = String(inspectionStatus || "").toUpperCase();

  return ["NOT_OK", "PARTIAL", "NOT_REACHABLE", "FAILED", "BAD"].includes(s);
}

function getLocationResult(row) {
  return (row.needsAttentionCount || 0) > 0 ? "NOT_OK" : "OK";
}

function cleanOptions(list) {
  return [
    ...new Set(
      list
        .filter(Boolean)
        .map((v) => String(v).trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));
}

function getLocationFromAny(item = {}) {
  const location =
    item.location ||
    item.parsedLoc ||
    item.locationData ||
    item.deviceLocation ||
    item.place ||
    {};

  return {
    locationId:
      location.id ||
      item.locationId ||
      item.location_id ||
      "",

    building:
      location.building ||
      location.buildingName ||
      item.building ||
      item.buildingName ||
      "",

    cluster:
      location.cluster ||
      location.clusterName ||
      item.cluster ||
      item.clusterName ||
      "",

    direction:
      location.direction ||
      location.side ||
      item.direction ||
      item.side ||
      "",

    excellId:
      location.excellId ||
      location.excelId ||
      location.excellID ||
      location.excelID ||
      item.excellId ||
      item.excelId ||
      item.excellID ||
      item.excelID ||
      "",

    lane:
      location.lane ||
      item.lane ||
      "",

    type:
      location.type ||
      item.type ||
      "",

    zone:
      location.zone ||
      location.zoneName ||
      item.zone ||
      item.zoneName ||
      "",
  };
}

function fullLocationKey(location) {
  return [
    location?.building || "",
    location?.cluster || "",
    location?.direction || "",
    location?.excellId || "",
    location?.lane || "",
    location?.type || "",
    location?.zone || "",
  ]
    .map((v) => normalizeText(v))
    .join("|");
}

function softLocationKey(location) {
  return [
    location?.building || "",
    location?.cluster || "",
    location?.direction || "",
    location?.zone || "",
  ]
    .map((v) => normalizeText(v))
    .join("|");
}

function normalizeDevice(item) {
  const loc = getLocationFromAny({
    ...item,
    location: item.location || item.parsedLoc || item.locationData,
  });

  const locationId =
    item.locationId ||
    item.location_id ||
    item.location?.id ||
    item.parsedLoc?.id ||
    loc.locationId ||
    "";

  return {
    id: item.id,

    locationId,

    currentStatus: mapDeviceStatus(
      item.currentStatus ||
      item.status ||
      item.deviceStatus ||
      item.inspectionStatus ||
      item.lastInspectionStatus
    ),

    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      item.lastInspection ||
      item.updatedAt ||
      item.createdAt ||
      null,

    location: {
      ...loc,
      locationId,
    },
  };
}

function normalizeInspection(item) {
  const device = item.device || {};
  const deviceLocation = device.location || {};
  const itemLocation = item.location || {};

  const loc = getLocationFromAny({
    ...item,
    location:
      deviceLocation && Object.keys(deviceLocation).length
        ? deviceLocation
        : itemLocation,
  });

  const locationId =
    item.locationId ||
    item.location_id ||
    itemLocation.id ||
    device.locationId ||
    device.location_id ||
    deviceLocation.id ||
    loc.locationId ||
    "";

  return {
    id: item.id,

    locationId,

    deviceId:
      item.deviceId ||
      item.device_id ||
      device.id ||
      "",

    inspectionStatus:
      String(
        item.inspectionStatus ||
        item.status ||
        item.result ||
        item.condition ||
        ""
      ).toUpperCase() || "NOT_REACHABLE",

    inspectedAt:
      item.inspectedAt ||
      item.createdAt ||
      item.updatedAt ||
      null,

    device: {
      location: {
        ...loc,
        locationId,
      },
    },
  };
}

function normalizeLocation(item) {
  const loc = getLocationFromAny(item);

  const devicesArray = Array.isArray(item.devices) ? item.devices : [];
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];

  return {
    id: item.id ?? loc.locationId ?? fullLocationKey(loc),

    locationId:
      item.id ||
      item.locationId ||
      item.location_id ||
      loc.locationId ||
      "",

    ...loc,

    devicesCount:
      item.devicesCount ??
      item.devices_count ??
      item._count?.devices ??
      devicesArray.length ??
      0,

    inspectionsCount:
      item.inspectionsCount ??
      item.inspections_count ??
      item._count?.inspections ??
      inspectionsArray.length ??
      0,

    needsAttentionCount:
      item.needsAttentionCount ??
      item.needAttentionCount ??
      item.attentionCount ??
      item.notOkCount ??
      0,

    latestInspectionAt:
      item.latestInspectionAt ||
      item.lastInspectionAt ||
      item.updatedAt ||
      null,
  };
}

function buildLocationRows(rawLocations, devices, inspections) {
  const map = new Map();
  const idIndex = new Map();
  const fullIndex = new Map();
  const softIndex = new Map();

  const hasDevicesEndpoint = devices.length > 0;
  const hasInspectionsEndpoint = inspections.length > 0;

  function indexRow(row) {
    const idKey = String(row.locationId || row.id || "").trim();
    const fullKey = fullLocationKey(row);
    const softKey = softLocationKey(row);

    if (idKey) idIndex.set(idKey, row);
    if (fullKey) fullIndex.set(fullKey, row);
    if (softKey) softIndex.set(softKey, row);
  }

  function registerRow(rowData) {
    const clean = getLocationFromAny(rowData);

    const idKey = String(rowData.locationId || rowData.id || clean.locationId || "").trim();
    const fullKey = fullLocationKey({
      ...clean,
      ...rowData,
    });
    const softKey = softLocationKey({
      ...clean,
      ...rowData,
    });

    const key = idKey || fullKey || softKey || `loc-${map.size + 1}`;

    if (!map.has(key)) {
      map.set(key, {
        id: rowData.id || key,
        locationId: rowData.locationId || clean.locationId || "",
        building: rowData.building || clean.building || "",
        cluster: rowData.cluster || clean.cluster || "",
        direction: rowData.direction || clean.direction || "",
        excellId: rowData.excellId || clean.excellId || "",
        lane: rowData.lane || clean.lane || "",
        type: rowData.type || clean.type || "",
        zone: rowData.zone || clean.zone || "",
        devicesCount: 0,
        inspectionsCount: 0,
        needsAttentionCount: 0,
        latestInspectionAt: null,
      });
    }

    const saved = map.get(key);

    saved.id = saved.id || rowData.id || key;
    saved.locationId = saved.locationId || rowData.locationId || clean.locationId || "";
    saved.building = saved.building || rowData.building || clean.building || "";
    saved.cluster = saved.cluster || rowData.cluster || clean.cluster || "";
    saved.direction = saved.direction || rowData.direction || clean.direction || "";
    saved.excellId = saved.excellId || rowData.excellId || clean.excellId || "";
    saved.lane = saved.lane || rowData.lane || clean.lane || "";
    saved.type = saved.type || rowData.type || clean.type || "";
    saved.zone = saved.zone || rowData.zone || clean.zone || "";

    indexRow(saved);

    return saved;
  }

  function findOrCreateRow(location) {
    const clean = getLocationFromAny(location);

    const idKey = String(clean.locationId || "").trim();
    const fullKey = fullLocationKey(clean);
    const softKey = softLocationKey(clean);

    if (idKey && idIndex.has(idKey)) return idIndex.get(idKey);
    if (fullKey && fullIndex.has(fullKey)) return fullIndex.get(fullKey);
    if (softKey && softIndex.has(softKey)) return softIndex.get(softKey);

    return registerRow({
      id: idKey || fullKey || softKey || `loc-${map.size + 1}`,
      ...clean,
    });
  }

  rawLocations.forEach((locItem) => {
    const normalized = normalizeLocation(locItem);
    const row = registerRow(normalized);

    if (!hasDevicesEndpoint) {
      row.devicesCount = Math.max(
        row.devicesCount,
        Number(normalized.devicesCount) || 0
      );
    }

    if (!hasInspectionsEndpoint) {
      row.inspectionsCount = Math.max(
        row.inspectionsCount,
        Number(normalized.inspectionsCount) || 0
      );

      row.needsAttentionCount = Math.max(
        row.needsAttentionCount,
        Number(normalized.needsAttentionCount) || 0
      );
    }

    if (normalized.latestInspectionAt) {
      row.latestInspectionAt = normalized.latestInspectionAt;
    }

    indexRow(row);
  });

  devices.forEach((d) => {
    const row = findOrCreateRow({
      ...d.location,
      locationId: d.locationId || d.location?.locationId,
    });

    row.devicesCount += 1;

    if (
      ["ATTENTION", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(
        d.currentStatus
      )
    ) {
      row.needsAttentionCount += 1;
    }

    if (d.lastInspectionAt) {
      if (
        !row.latestInspectionAt ||
        new Date(d.lastInspectionAt) > new Date(row.latestInspectionAt)
      ) {
        row.latestInspectionAt = d.lastInspectionAt;
      }
    }

    indexRow(row);
  });

  inspections.forEach((ins) => {
    const row = findOrCreateRow({
      ...ins.device?.location,
      locationId: ins.locationId || ins.device?.location?.locationId,
    });

    row.inspectionsCount += 1;

    if (mapInspectionToAttention(ins.inspectionStatus)) {
      row.needsAttentionCount += 1;
    }

    if (ins.inspectedAt) {
      if (
        !row.latestInspectionAt ||
        new Date(ins.inspectedAt) > new Date(row.latestInspectionAt)
      ) {
        row.latestInspectionAt = ins.inspectedAt;
      }
    }

    indexRow(row);
  });

  return Array.from(map.values()).filter((row) =>
    [
      row.building,
      row.cluster,
      row.direction,
      row.excellId,
      row.lane,
      row.type,
      row.zone,
    ].some(Boolean)
  );
}

function buildLocationSearchText(loc) {
  return normalizeText(
    [
      loc.id,
      loc.locationId,
      loc.building,
      loc.cluster,
      loc.direction,
      loc.excellId,
      loc.lane,
      loc.type,
      loc.zone,
      getLocationResult(loc),
      fmtShort(loc.latestInspectionAt),
    ]
      .filter(Boolean)
      .join(" ")
  );
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

function extractList(data, keys = []) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function StatusBadge({ value, lang }) {
  const MAP_EN = {
    OK: { label: "OK", cls: "badge--ok" },
    NOT_OK: { label: "Not OK", cls: "badge--maint" },
    ATTENTION: { label: "Attention", cls: "badge--att" },
  };

  const MAP_AR = {
    OK: { label: "سليم", cls: "badge--ok" },
    NOT_OK: { label: "غير سليم", cls: "badge--maint" },
    ATTENTION: { label: "تحتاج متابعة", cls: "badge--att" },
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
  const [view, setView] = useState("grid");
  const [selected, setSelected] = useState(null);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [locationRows, setLocationRows] = useState(
    Array.isArray(locationRowsProp)
      ? locationRowsProp.map(normalizeLocation)
      : []
  );

  const [loading, setLoading] = useState(!Array.isArray(locationRowsProp));
  const [error, setError] = useState("");
  const [sourceInfo, setSourceInfo] = useState([]);

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadLocations() {
    if (Array.isArray(locationRowsProp)) {
      setLocationRows(locationRowsProp.map(normalizeLocation));
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
      let rawDevices = [];
      let rawInspections = [];

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

        rawLocations = extractList(locationsRes.data, ["locations"]);
        sources.push(locationsRes.url);
      } catch (err) {
        rawLocations = [];
      }

      try {
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

        rawDevices = extractList(devicesRes.data, ["devices"]);
        sources.push(devicesRes.url);
      } catch (err) {
        rawDevices = [];
      }

      try {
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

        rawInspections = extractList(inspectionsRes.data, ["inspections"]);
        sources.push(inspectionsRes.url);
      } catch (err) {
        rawInspections = [];
      }

      const devices = rawDevices.map(normalizeDevice);
      const inspections = rawInspections.map(normalizeInspection);
      const rows = buildLocationRows(rawLocations, devices, inspections);

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

  const options = useMemo(() => {
    return {
      buildings: cleanOptions(locationRows.map((l) => l.building)),
      clusters: cleanOptions(locationRows.map((l) => l.cluster)),
      directions: cleanOptions(locationRows.map((l) => l.direction)),
      excellIds: cleanOptions(locationRows.map((l) => l.excellId)),
      lanes: cleanOptions(locationRows.map((l) => l.lane)),
      types: cleanOptions(locationRows.map((l) => l.type)),
      zones: cleanOptions(locationRows.map((l) => l.zone)),
    };
  }, [locationRows]);

  const filtered = useMemo(() => {
    const query = normalizeText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return locationRows.filter((loc) => {
      const result = getLocationResult(loc);

      if (filters.result !== "ALL" && result !== filters.result) {
        return false;
      }

      if (filters.building !== "ALL" && loc.building !== filters.building) {
        return false;
      }

      if (filters.cluster !== "ALL" && loc.cluster !== filters.cluster) {
        return false;
      }

      if (filters.direction !== "ALL" && loc.direction !== filters.direction) {
        return false;
      }

      if (filters.excellId !== "ALL" && loc.excellId !== filters.excellId) {
        return false;
      }

      if (filters.lane !== "ALL" && loc.lane !== filters.lane) {
        return false;
      }

      if (filters.type !== "ALL" && loc.type !== filters.type) {
        return false;
      }

      if (filters.zone !== "ALL" && loc.zone !== filters.zone) {
        return false;
      }

      if (!queryWords.length) {
        return true;
      }

      const haystack = buildLocationSearchText(loc);

      return queryWords.every((word) => haystack.includes(word));
    });
  }, [locationRows, filters]);

  const totalDevices = locationRows.reduce(
    (sum, loc) => sum + (Number(loc.devicesCount) || 0),
    0
  );

  const totalInspections = locationRows.reduce(
    (sum, loc) => sum + (Number(loc.inspectionsCount) || 0),
    0
  );

  const okLocations = locationRows.filter((loc) => getLocationResult(loc) === "OK").length;
  const notOkLocations = locationRows.filter((loc) => getLocationResult(loc) === "NOT_OK").length;

  const filteredOk = filtered.filter((loc) => getLocationResult(loc) === "OK").length;
  const filteredNotOk = filtered.filter((loc) => getLocationResult(loc) === "NOT_OK").length;

  const tiles = [
    {
      label: t("Locations", "المواقع"),
      val: locationRows.length,
      color: "#378ADD",
    },
    {
      label: "OK",
      val: okLocations,
      color: "#1D9E75",
    },
    {
      label: "Not OK",
      val: notOkLocations,
      color: "#C0392B",
    },
    {
      label: t("Inspections", "الفحوصات"),
      val: totalInspections,
      color: "#BA7517",
    },
  ];

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
      <style>{LOCATIONS_CSS}</style>

      <div className="loc-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="loc-topbar">
          <div>
            <div className="loc-topbar__title">
              {t("Viewer Locations", "مواقع المشاهد")}
            </div>

            <div className="loc-topbar__sub">
              {t(
                "Read-only location monitoring from backend data",
                "عرض المواقع فقط من بيانات الباك إند"
              )}
            </div>
          </div>

          <div className="loc-actions">
            <button
              className="loc-refresh-btn"
              onClick={loadLocations}
              disabled={loading}
            >
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
              <div
                className="loc-summary-tile__bar"
                style={{ background: tile.color }}
              />

              <div
                className="loc-summary-tile__val"
                style={{ color: tile.color }}
              >
                {tile.val}
              </div>

              <div className="loc-summary-tile__label">{tile.label}</div>
            </div>
          ))}
        </div>

        <div className="loc-filter-card">
          <div className="loc-filter-head">
            <div className="loc-filter-title">
              <div className="loc-filter-icon">⌕</div>

              <div>
                <div className="loc-filter-title-text">
                  {t("Cute Location Filters", "فلاتر المواقع")}
                </div>

                <div className="loc-filter-title-sub">
                  {t(
                    "Filter by building, cluster, direction, excell ID, lane, type, zone and result",
                    "فلتر بالمبنى والكلاستر والاتجاه والإكسل ID واللين والنوع والزون والنتيجة"
                  )}
                </div>
              </div>
            </div>

            <div className="loc-filter-result">
              <span className="loc-filter-result-dot" />
              {filtered.length} / {locationRows.length} {t("locations", "موقع")}
            </div>
          </div>

          <div className="loc-filter-grid">
            <div className="loc-filter-field">
              <label>{t("Search", "بحث")}</label>

              <input
                className="loc-filter-input"
                value={draftFilters.search}
                onChange={(event) => updateDraft("search", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder={t(
                  "Building, cluster, zone, lane, excell ID...",
                  "المبنى، الكلاستر، الزون، اللين، الإكسل ID..."
                )}
              />
            </div>

            <div className="loc-filter-field">
              <label>{t("Result", "النتيجة")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.result}
                onChange={(event) => updateDraft("result", event.target.value)}
              >
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>{t("Building", "المبنى")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.building}
                onChange={(event) => updateDraft("building", event.target.value)}
              >
                <option value="ALL">{t("All buildings", "كل المباني")}</option>

                {options.buildings.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>{t("Cluster", "المجموعة")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.cluster}
                onChange={(event) => updateDraft("cluster", event.target.value)}
              >
                <option value="ALL">{t("All clusters", "كل المجموعات")}</option>

                {options.clusters.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>{t("Direction", "الاتجاه")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.direction}
                onChange={(event) => updateDraft("direction", event.target.value)}
              >
                <option value="ALL">{t("All directions", "كل الاتجاهات")}</option>

                {options.directions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>Excell ID</label>

              <select
                className="loc-filter-select"
                value={draftFilters.excellId}
                onChange={(event) => updateDraft("excellId", event.target.value)}
              >
                <option value="ALL">All Excell IDs</option>

                {options.excellIds.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>Lane</label>

              <select
                className="loc-filter-select"
                value={draftFilters.lane}
                onChange={(event) => updateDraft("lane", event.target.value)}
              >
                <option value="ALL">{t("All lanes", "كل الـ lanes")}</option>

                {options.lanes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>{t("Type", "النوع")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.type}
                onChange={(event) => updateDraft("type", event.target.value)}
              >
                <option value="ALL">{t("All types", "كل الأنواع")}</option>

                {options.types.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="loc-filter-field">
              <label>{t("Zone", "المنطقة")}</label>

              <select
                className="loc-filter-select"
                value={draftFilters.zone}
                onChange={(event) => updateDraft("zone", event.target.value)}
              >
                <option value="ALL">{t("All zones", "كل المناطق")}</option>

                {options.zones.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="loc-filter-footer">
            <div className="loc-filter-hint">
              {t(
                `Filtered OK: ${filteredOk} · Not OK: ${filteredNotOk}`,
                `المفلتر سليم: ${filteredOk} · غير سليم: ${filteredNotOk}`
              )}
            </div>

            <div className="loc-filter-actions">
              <button
                type="button"
                className="loc-filter-btn loc-filter-btn-reset"
                onClick={resetFilters}
              >
                Reset
              </button>

              <button
                type="button"
                className="loc-filter-btn loc-filter-btn-ok"
                onClick={applyFilters}
              >
                OK
              </button>
            </div>
          </div>
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
                const result = getLocationResult(loc);
                const isNotOk = result === "NOT_OK";

                const inspPct = loc.devicesCount
                  ? Math.min(
                      Math.round(
                        (Number(loc.inspectionsCount || 0) / Math.max(Number(loc.devicesCount || 0), 1)) *
                          100
                      ),
                      100
                    )
                  : loc.inspectionsCount
                  ? 100
                  : 0;

                const accentColor = isNotOk ? "#C0392B" : "#1D9E75";

                return (
                  <div
                    key={loc.id}
                    className="loc-card"
                    onClick={() => setSelected(loc)}
                  >
                    <div
                      className="loc-card__top-bar"
                      style={{ background: accentColor }}
                    />

                    <div className="loc-card__top">
                      <div>
                        <div className="loc-card__name">
                          {loc.building ||
                            loc.cluster ||
                            `${t("Location", "موقع")} #${loc.id}`}
                        </div>

                        <div className="loc-card__hint">
                          {[
                            loc.cluster,
                            loc.zone,
                            loc.direction,
                            loc.excellId,
                            loc.lane ? `lane ${loc.lane}` : "",
                            loc.type,
                          ]
                            .filter(Boolean)
                            .join(" · ") || t("No info", "لا معلومات")}
                        </div>
                      </div>

                      <StatusBadge value={result} lang={lang} />
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
                        <strong style={{ fontSize: 13 }}>
                          {fmtShort(loc.latestInspectionAt)}
                        </strong>
                        <span>{t("Latest", "الأخير")}</span>
                      </div>
                    </div>

                    <div className="loc-card__bar-wrap">
                      <div className="loc-card__bar-label">
                        <span>{t("Inspection coverage", "تغطية الفحص")}</span>
                        <span>{inspPct}%</span>
                      </div>

                      <div className="loc-bar-track">
                        <div
                          className="loc-bar-fill"
                          style={{
                            width: `${inspPct}%`,
                            background: accentColor,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="loc-empty">
              {t("No locations found.", "لا توجد مواقع.")}
            </div>
          )
        ) : filtered.length ? (
          <div className="loc-list-wrap">
            <table className="loc-list-table">
              <thead>
                <tr>
                  <th>{t("Building", "المبنى")}</th>
                  <th>{t("Cluster", "المجموعة")}</th>
                  <th>{t("Direction", "الاتجاه")}</th>
                  <th>Excell ID</th>
                  <th>Lane</th>
                  <th>{t("Type", "النوع")}</th>
                  <th>{t("Zone", "المنطقة")}</th>
                  <th>{t("Devices", "الأجهزة")}</th>
                  <th>{t("Inspections", "الفحوصات")}</th>
                  <th>{t("Latest", "الأخير")}</th>
                  <th>{t("Result", "النتيجة")}</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((loc) => {
                  const result = getLocationResult(loc);

                  return (
                    <tr key={loc.id} onClick={() => setSelected(loc)}>
                      <td>
                        <div className="loc-list-name">
                          {loc.building || "—"}
                        </div>

                        <div className="loc-list-hint">
                          {[loc.zone, loc.direction].filter(Boolean).join(" · ") || "—"}
                        </div>
                      </td>

                      <td style={{ fontSize: 12 }}>{loc.cluster || "—"}</td>
                      <td style={{ fontSize: 12 }}>{loc.direction || "—"}</td>
                      <td style={{ fontSize: 12 }}>{loc.excellId || "—"}</td>
                      <td style={{ fontSize: 12 }}>{loc.lane || "—"}</td>
                      <td style={{ fontSize: 12 }}>{loc.type || "—"}</td>
                      <td style={{ fontSize: 12 }}>{loc.zone || "—"}</td>
                      <td className="loc-list-count">{loc.devicesCount || 0}</td>
                      <td className="loc-list-count">{loc.inspectionsCount || 0}</td>

                      <td style={{ fontSize: 12, color: "var(--faint)" }}>
                        {fmtShort(loc.latestInspectionAt)}
                      </td>

                      <td>
                        <StatusBadge value={result} lang={lang} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="loc-empty">
            {t("No locations found.", "لا توجد مواقع.")}
          </div>
        )}

        {selected && (
          <div
            className="loc-detail-overlay"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelected(null);
              }
            }}
          >
            <div className="loc-detail-panel">
              <button
                className="loc-detail-close"
                onClick={() => setSelected(null)}
              >
                {t("✕ Close", "✕ إغلاق")}
              </button>

              <div>
                <div className="loc-detail-name">
                  {selected.building || selected.cluster || `#${selected.id}`}
                </div>

                <div className="loc-detail-sub">
                  {[
                    selected.cluster,
                    selected.direction,
                    selected.excellId,
                    selected.lane ? `lane ${selected.lane}` : "",
                    selected.type,
                    selected.zone,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>

              <div className="loc-detail-kpis">
                {[
                  {
                    label: t("Devices", "الأجهزة"),
                    val: selected.devicesCount || 0,
                  },
                  {
                    label: t("Inspections", "الفحوصات"),
                    val: selected.inspectionsCount || 0,
                  },
                  {
                    label: t("Need Attention", "تحتاج متابعة"),
                    val: selected.needsAttentionCount || 0,
                  },
                  {
                    label: t("Latest", "آخر فحص"),
                    val: fmtShort(selected.latestInspectionAt),
                  },
                ].map((kpi) => (
                  <div className="loc-detail-kpi" key={kpi.label}>
                    <strong>{kpi.val}</strong>
                    <span>{kpi.label}</span>
                  </div>
                ))}
              </div>

              <StatusBadge value={getLocationResult(selected)} lang={lang} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ViewerLocationsPage;