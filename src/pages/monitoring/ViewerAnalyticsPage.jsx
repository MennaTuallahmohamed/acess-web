import React, { useEffect, useMemo, useState } from "react";

/* =========================================================
   VIEWER ANALYTICS - ORGANIZED + CLICKABLE + DETAILED
   - Fixes location/data accuracy
   - Loads all backend pages
   - All KPI / chart cards clickable
   - Each click opens detailed charts + detailed table
   - No heatmap
========================================================= */

const PAGE_LIMIT = 100;
const TABLE_PAGE_SIZE = 20;

const ANALYTICS_CSS = `
.viewer-analytics,
.viewer-analytics *,
.viewer-analytics *::before,
.viewer-analytics *::after {
  box-sizing: border-box;
}

.viewer-analytics {
  --primary: #4f46e5;
  --primary-soft: #eef2ff;
  --cyan: #0891b2;
  --cyan-soft: #ecfeff;
  --green: #059669;
  --green-soft: #ecfdf5;
  --amber: #d97706;
  --amber-soft: #fffbeb;
  --red: #dc2626;
  --red-soft: #fef2f2;
  --slate: #475569;
  --text: #0f172a;
  --muted: #64748b;
  --faint: #94a3b8;
  --border: #e2e8f0;
  --surface: #ffffff;
  --surface-soft: #f8fafc;
  --bg: #f1f5f9;

  min-height: 100vh;
  padding: 24px;
  background: var(--bg);
  color: var(--text);
  font-family: "Segoe UI", Tahoma, Arial, sans-serif;
}

.va-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;
}

.va-title {
  margin: 0;
  font-size: 25px;
  font-weight: 950;
  letter-spacing: -0.03em;
}

.va-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}

.va-refresh {
  min-width: 120px;
  height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: var(--text);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.18s ease;
}

.va-refresh:hover {
  background: var(--primary);
  transform: translateY(-1px);
}

.va-refresh:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

.va-alert {
  margin-bottom: 16px;
  padding: 13px 15px;
  border: 1px solid #fecaca;
  border-radius: 13px;
  background: var(--red-soft);
  color: #991b1b;
  font-size: 13px;
  line-height: 1.6;
}

.va-loading {
  min-height: 280px;
  display: grid;
  place-items: center;
  color: var(--muted);
  font-size: 14px;
}

.va-spinner {
  width: 34px;
  height: 34px;
  margin: 0 auto 12px;
  border: 3px solid #dbeafe;
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: va-spin .8s linear infinite;
}

@keyframes va-spin {
  to { transform: rotate(360deg); }
}

.va-section {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
}

.va-section-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.va-section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 950;
}

.va-section-subtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

.va-badge {
  padding: 7px 11px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 11px;
  font-weight: 850;
  white-space: nowrap;
}

.va-kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.va-kpi {
  width: 100%;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  text-align: left;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.04);
  position: relative;
  overflow: hidden;
}

.va-kpi::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--kpi-color, var(--primary));
}

.va-kpi--clickable {
  cursor: pointer;
  transition: .18s ease;
}

.va-kpi--clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.10);
  border-color: rgba(79, 70, 229, 0.20);
}

.va-kpi__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--muted);
  letter-spacing: .05em;
}

.va-kpi__value {
  margin-top: 8px;
  font-size: 28px;
  line-height: 1;
  font-weight: 950;
  color: var(--kpi-color, var(--text));
}

.va-kpi__note {
  margin-top: 7px;
  font-size: 11px;
  color: var(--faint);
}

.va-kpi__hint {
  margin-top: 10px;
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
}

.va-check-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.va-check {
  width: 100%;
  padding: 13px;
  border-radius: 13px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  text-align: left;
}

.va-check--clickable {
  cursor: pointer;
  transition: .18s ease;
}

.va-check--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 26px rgba(15, 23, 42, .08);
}

.va-check-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: center;
}

.va-check-name {
  font-size: 12px;
  font-weight: 900;
}

.va-check-badge {
  padding: 5px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.va-check-badge--verified { background: var(--green-soft); color: var(--green); }
.va-check-badge--loaded { background: var(--primary-soft); color: var(--primary); }
.va-check-badge--warning { background: var(--amber-soft); color: var(--amber); }
.va-check-badge--failed { background: var(--red-soft); color: var(--red); }

.va-check-value {
  margin-top: 10px;
  font-size: 22px;
  font-weight: 950;
}

.va-check-meta {
  margin-top: 6px;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.5;
}

.va-check-endpoint {
  margin-top: 5px;
  font-size: 10px;
  color: var(--faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.va-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.va-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.va-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--surface);
  padding: 16px;
  position: relative;
  overflow: hidden;
}

.va-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--card-color, var(--primary));
}

.va-card--clickable {
  cursor: pointer;
  transition: .18s ease;
}

.va-card--clickable:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.10);
  border-color: rgba(79, 70, 229, 0.20);
}

.va-card-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
}

.va-card-title {
  font-size: 14px;
  font-weight: 950;
  margin-bottom: 4px;
}

.va-card-subtitle {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 12px;
}

.va-card-hint {
  display: inline-flex;
  align-items: center;
  padding: 5px 8px;
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.chart-grid-line {
  stroke: rgba(0,0,0,.07);
  stroke-width: .8;
}

.chart-axis-label {
  fill: #94a3b8;
  font-size: 10px;
  font-family: "Segoe UI", Tahoma, Arial, sans-serif;
}

.chart-line {
  fill: none;
  stroke-width: 2.4;
  stroke-linecap: round;
}

.va-donut-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.va-donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.va-donut-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--slate);
}

.va-donut-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.va-donut-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.va-donut-value {
  margin-left: auto;
  font-weight: 900;
  color: var(--text);
}

.viewer-analytics[dir="rtl"] .va-donut-value {
  margin-left: 0;
  margin-right: auto;
}

.va-hbar-row {
  margin-bottom: 12px;
}

.va-hbar-row:last-child {
  margin-bottom: 0;
}

.va-hbar-top {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.va-hbar-name {
  font-size: 12px;
  color: var(--slate);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.va-hbar-value {
  font-size: 12px;
  font-weight: 900;
}

.va-hbar-track {
  height: 7px;
  border-radius: 999px;
  background: #eef2f7;
  overflow: hidden;
}

.va-hbar-fill {
  height: 100%;
  border-radius: 999px;
}

.va-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.va-tab {
  min-height: 38px;
  padding: 0 15px;
  border-radius: 11px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--slate);
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

.va-tab:hover {
  border-color: #c7d2fe;
  color: var(--primary);
}

.va-tab--active {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary);
}

.va-toolbar {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 180px 180px auto;
  gap: 10px;
  margin-bottom: 14px;
}

.va-input,
.va-select {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.va-input {
  padding: 0 13px;
}

.va-select {
  padding: 0 10px;
}

.va-input:focus,
.va-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79,70,229,.10);
}

.va-results-count {
  min-width: 120px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
  padding: 0 12px;
  white-space: nowrap;
}

.va-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 14px;
}

.va-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  background: #fff;
}

.va-table th {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  background: #f8fafc;
  color: var(--muted);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
}

.viewer-analytics[dir="rtl"] .va-table th {
  text-align: right;
}

.va-table td {
  padding: 13px 14px;
  border-bottom: 1px solid #edf2f7;
  font-size: 12px;
  color: var(--text);
  vertical-align: middle;
}

.va-table tbody tr:hover {
  background: #fafbff;
}

.va-table tbody tr:last-child td {
  border-bottom: 0;
}

.va-primary-text {
  font-weight: 850;
  overflow-wrap: anywhere;
}

.va-secondary-text {
  margin-top: 3px;
  font-size: 11px;
  color: var(--muted);
  overflow-wrap: anywhere;
}

.va-type-badge,
.va-status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 900;
  white-space: nowrap;
}

.va-type-badge--device { background: var(--primary-soft); color: var(--primary); }
.va-type-badge--gate { background: var(--cyan-soft); color: var(--cyan); }

.va-status-badge--ok { background: var(--green-soft); color: var(--green); }
.va-status-badge--attention { background: var(--amber-soft); color: var(--amber); }
.va-status-badge--danger { background: var(--red-soft); color: var(--red); }
.va-status-badge--other { background: #f1f5f9; color: var(--slate); }

.va-empty {
  padding: 34px 20px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}

.va-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

.va-page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 11px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

.va-page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.va-page-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.va-page-info {
  min-width: 95px;
  text-align: center;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

/* modal */
.va-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.va-modal {
  width: min(1220px, 100%);
  max-height: 92vh;
  border-radius: 22px;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 28px 90px rgba(15,23,42,.30);
  display: flex;
  flex-direction: column;
}

.va-modal-head {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: flex-start;
}

.va-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 950;
}

.va-modal-subtitle {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--muted);
}

.va-modal-close {
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 12px;
  background: var(--surface-soft);
  color: var(--text);
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.va-modal-tools {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.va-modal-search {
  width: min(380px, 100%);
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
  padding: 0 13px;
  color: var(--text);
  font-size: 13px;
  outline: none;
}

.va-modal-search:focus {
  background: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79,70,229,.10);
}

.va-modal-count {
  display: inline-flex;
  align-items: center;
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
}

.va-modal-body {
  padding: 20px;
  overflow: auto;
}

.va-modal-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.va-mini-kpi {
  padding: 14px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--surface-soft);
}

.va-mini-kpi__label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 800;
  text-transform: uppercase;
}

.va-mini-kpi__value {
  margin-top: 7px;
  font-size: 24px;
  line-height: 1;
  font-weight: 950;
  color: var(--mini-kpi-color, var(--text));
}

@media (max-width: 1300px) {
  .va-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .va-grid-3,
  .va-grid-2 { grid-template-columns: 1fr; }
  .va-check-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 860px) {
  .viewer-analytics { padding: 16px 12px; }
  .va-header { flex-direction: column; }
  .va-refresh { width: 100%; }
  .va-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .va-toolbar { grid-template-columns: 1fr 1fr; }
  .va-modal-backdrop { padding: 0; align-items: end; }
  .va-modal {
    border-radius: 22px 22px 0 0;
    max-height: 94vh;
  }
  .va-modal-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 560px) {
  .va-kpis,
  .va-check-grid,
  .va-toolbar,
  .va-modal-kpis { grid-template-columns: 1fr; }
  .va-title { font-size: 21px; }
  .va-kpi__value { font-size: 24px; }
  .va-donut-wrap {
    flex-direction: column;
    align-items: stretch;
  }
  .va-donut-wrap svg {
    align-self: center;
  }
}
`;

/* =========================================================
   BASIC HELPERS
========================================================= */

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
  const fromProp = String(propBaseUrl || "").trim();
  const fromEnv = String(import.meta.env.VITE_API_BASE_URL || "").trim();
  const fromStorage =
    localStorage.getItem("apiBaseUrl") ||
    localStorage.getItem("baseUrl") ||
    sessionStorage.getItem("apiBaseUrl") ||
    sessionStorage.getItem("baseUrl") ||
    "";

  const value =
    fromProp ||
    fromEnv ||
    fromStorage ||
    "https://acess-backend-production-8856.up.railway.app";

  return value.replace(/\/+$/, "");
}

function getNestedValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function firstFiniteNumber(payload, paths) {
  for (const path of paths) {
    const value = Number(getNestedValue(payload, path));
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return null;
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  const bags = [
    payload,
    payload?.data,
    payload?.result,
    payload?.results,
    payload?.payload,
    payload?.response,
    payload?.data?.data,
  ].filter(Boolean);

  const allKeys = [...keys, "items", "rows", "records", "list", "data"];

  for (const bag of bags) {
    if (Array.isArray(bag)) return bag;
    for (const key of allKeys) {
      if (Array.isArray(bag?.[key])) return bag[key];
    }
  }

  return [];
}

function readTotal(payload) {
  return firstFiniteNumber(payload, [
    "total",
    "totalCount",
    "recordsTotal",
    "data.total",
    "data.totalCount",
    "meta.total",
    "pagination.total",
    "data.meta.total",
    "data.pagination.total",
  ]);
}

function readTotalPages(payload) {
  return firstFiniteNumber(payload, [
    "pages",
    "totalPages",
    "pageCount",
    "data.pages",
    "data.totalPages",
    "meta.totalPages",
    "pagination.totalPages",
    "data.meta.totalPages",
    "data.pagination.totalPages",
  ]);
}

function addPagination(url, page, limit) {
  const parsed = new URL(url, window.location.origin);
  parsed.searchParams.set("page", String(page));
  parsed.searchParams.set("limit", String(limit));
  return parsed.toString();
}

function rowIdentity(row, index) {
  return String(
    row?.id ??
      row?.uuid ??
      row?.deviceId ??
      row?.gateId ??
      row?.inspectionId ??
      row?.deviceCode ??
      row?.gateNo ??
      row?.code ??
      `row-${index}-${JSON.stringify(row)}`
  );
}

function dedupeRows(rows) {
  const map = new Map();

  rows.forEach((row, index) => {
    const key = rowIdentity(row, index);
    if (!map.has(key)) map.set(key, row);
  });

  return Array.from(map.values());
}

function pageSignature(rows) {
  if (!rows.length) return "EMPTY";
  const first = rowIdentity(rows[0], 0);
  const last = rowIdentity(rows[rows.length - 1], rows.length - 1);
  return `${rows.length}|${first}|${last}`;
}

async function requestJson(url, token) {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Backend response is not valid JSON.");
  }
}

async function fetchAllPages({ label, candidates, token, arrayKeys }) {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      const collected = [];
      const seenPageSignatures = new Set();

      let backendTotal = null;
      let totalPages = null;
      let pagesLoaded = 0;
      let endedNormally = false;
      let endpointIgnoredPagination = false;

      for (let page = 1; page <= 500; page += 1) {
        const requestUrl = addPagination(candidate, page, PAGE_LIMIT);
        const payload = await requestJson(requestUrl, token);
        const pageRows = extractArray(payload, arrayKeys);

        pagesLoaded += 1;

        const payloadTotal = readTotal(payload);
        const payloadPages = readTotalPages(payload);
        if (payloadTotal !== null) backendTotal = payloadTotal;
        if (payloadPages !== null && payloadPages > 0) totalPages = payloadPages;

        const signature = pageSignature(pageRows);

        if (page > 1 && seenPageSignatures.has(signature) && pageRows.length > 0) {
          endpointIgnoredPagination = true;
          break;
        }

        seenPageSignatures.add(signature);
        collected.push(...pageRows);

        const uniqueLoaded = dedupeRows(collected).length;

        if (totalPages !== null) {
          if (page >= totalPages) {
            endedNormally = true;
            break;
          }
          continue;
        }

        if (backendTotal !== null) {
          if (uniqueLoaded >= backendTotal || pageRows.length === 0) {
            endedNormally = uniqueLoaded >= backendTotal;
            break;
          }
          continue;
        }

        if (pageRows.length < PAGE_LIMIT) {
          endedNormally = true;
          break;
        }
      }

      const rows = dedupeRows(collected);
      const complete =
        backendTotal !== null
          ? rows.length >= backendTotal
          : endedNormally && !endpointIgnoredPagination;

      return {
        label,
        ok: true,
        rows,
        endpoint: candidate,
        backendTotal,
        pagesLoaded,
        complete,
        endpointIgnoredPagination,
        error: "",
      };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    label,
    ok: false,
    rows: [],
    endpoint: "",
    backendTotal: null,
    pagesLoaded: 0,
    complete: false,
    endpointIgnoredPagination: false,
    error: lastError?.message || `Failed to load ${label}.`,
  };
}

/* =========================================================
   NORMALIZATION
========================================================= */

function normalizeAssetStatus(value) {
  const raw = String(value || "").trim();
  if (!raw) return "UNKNOWN";

  const status = raw.toUpperCase().replace(/\s+/g, "_");

  if (["OK", "GOOD", "WORKING", "OPERATIONAL"].includes(status)) return "OK";
  if (["NOT_OK", "BAD", "FAILED", "ATTENTION", "PARTIAL", "NOT_REACHABLE"].includes(status)) return "ATTENTION";
  if (["NEEDS_MAINTENANCE", "NEEDS_MAINT", "MAINTENANCE"].includes(status)) return "NEEDS_MAINTENANCE";
  if (["UNDER_MAINTENANCE", "IN_PROGRESS"].includes(status)) return "UNDER_MAINTENANCE";
  if (["OUT_OF_SERVICE", "INACTIVE"].includes(status)) return "OUT_OF_SERVICE";

  return status;
}

function normalizeInspectionStatus(value) {
  const raw = String(value || "").trim();
  if (!raw) return "UNKNOWN";

  const status = raw.toUpperCase().replace(/\s+/g, "_");

  if (["OK", "GOOD", "DONE", "PASSED", "COMPLETED"].includes(status)) return "OK";
  if (["NOT_OK", "BAD", "FAILED"].includes(status)) return "NOT_OK";
  if (status === "PARTIAL") return "PARTIAL";
  if (status === "NOT_REACHABLE") return "NOT_REACHABLE";

  return status;
}

function assetLocation(item = {}) {
  const location =
    item.location ||
    item.deviceLocation ||
    item.gateLocation ||
    item.device?.location ||
    item.gate?.location ||
    {};

  return {
    cluster: location.cluster || item.cluster || item.gateCluster || "",
    building: location.building || item.building || item.gateBuilding || "",
    zone: location.zone || item.zone || item.gateZone || "",
    direction: location.direction || item.direction || item.gateDirection || "",
    lane: location.lane || item.lane || "",
    type: location.type || item.locationType || item.type || "",
  };
}

function locationKey(location = {}) {
  return [
    location.cluster || "",
    location.building || "",
    location.zone || "",
    location.direction || "",
    location.lane || "",
  ].join("|");
}

function locationLabel(location = {}, fallback = "—") {
  return [
    location.building,
    location.zone,
    location.direction,
    location.lane,
    location.cluster,
  ].filter(Boolean).join(" · ") || fallback;
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value, lang, includeTime = false) {
  const d = safeDate(value);
  if (!d) return "—";

  return includeTime
    ? d.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")
    : d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB");
}

function monthLabel(index) {
  return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][index];
}

function normalizeDevice(item = {}) {
  const inspections = Array.isArray(item.inspections) ? item.inspections : [];
  return {
    id: item.id ?? item.uuid ?? item.deviceId,
    assetType: "DEVICE",
    code: item.deviceCode || item.code || item.barcode || item.serialNumber || `DEV-${item.id || ""}`,
    name: item.deviceName || item.name || item.title || "Unknown device",
    currentStatus: normalizeAssetStatus(item.currentStatus || item.healthStatus || item.condition || item.excelStatus),
    recordStatus: String(item.status || item.lifecycleStatus || "").toUpperCase(),
    location: assetLocation(item),
    inspectionsCount: Number(item.inspectionsCount ?? item._count?.inspections ?? inspections.length ?? 0) || 0,
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || inspections[0]?.inspectedAt || null,
    raw: item,
  };
}

function normalizeGate(item = {}) {
  const inspections = Array.isArray(item.inspections) ? item.inspections : [];
  return {
    id: item.id ?? item.uuid ?? item.gateId,
    assetType: "GATE",
    code: item.gateNo || item.gateNumber || item.code || item.no || `GATE-${item.id || ""}`,
    name: item.gateName || item.name || item.title || item.building || `Gate ${item.gateNo || item.id || ""}`,
    secretCode: item.secretCode || item.secret || "",
    currentStatus: normalizeAssetStatus(item.currentStatus || item.healthStatus || item.gateStatus || item.condition),
    recordStatus: String(item.status || "").toUpperCase(),
    location: assetLocation(item),
    inspectionsCount: Number(item.inspectionsCount ?? item._count?.inspections ?? inspections.length ?? 0) || 0,
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || inspections[0]?.inspectedAt || null,
    raw: item,
  };
}

function normalizeInspection(item = {}) {
  const explicitType = String(item.assetType || item.type || "").toUpperCase();
  const gate = item.gate || null;
  const device = item.device || null;
  const isGate = explicitType === "GATE" || Boolean(item.gateId) || Boolean(gate?.id);
  const asset = isGate ? gate || {} : device || {};

  const inspector =
    item.technician?.fullName ||
    item.technician?.name ||
    item.user?.fullName ||
    item.user?.name ||
    item.inspector?.fullName ||
    item.inspector?.name ||
    item.technicianName ||
    item.userName ||
    "";

  return {
    id: item.id ?? item.uuid ?? item.inspectionId,
    assetType: isGate ? "GATE" : "DEVICE",
    assetCode: isGate
      ? asset.gateNo || asset.gateNumber || item.gateNo || item.assetCode || `GATE-${item.gateId || ""}`
      : asset.deviceCode || asset.code || item.deviceCode || item.assetCode || `DEV-${item.deviceId || ""}`,
    assetName: isGate
      ? asset.gateName || asset.name || item.gateName || item.assetName || "Gate"
      : asset.deviceName || asset.name || item.deviceName || item.assetName || "Device",
    inspectionStatus: normalizeInspectionStatus(item.inspectionStatus || item.result || item.status),
    inspectedAt: item.inspectedAt || item.completedAt || item.createdAt || item.updatedAt || null,
    inspector,
    location: assetLocation({
      ...item,
      ...asset,
      location: asset.location || item.location || item.deviceLocation || item.gateLocation,
    }),
    raw: item,
  };
}

/*
  Important fix:
  - We build location counts primarily from the loaded device/gate/inspection records.
  - We merge backend location metadata only to enrich labels.
  - We include backend-only locations only if they have real non-zero counts.
  - This prevents huge rows of zeros and avoids count duplication.
*/
function buildLocationRows(devices, gates, inspections, backendLocations = []) {
  const map = new Map();

  function ensure(location = {}) {
    const key = locationKey(location);
    if (!map.has(key)) {
      map.set(key, {
        id: key || `unknown-location-${map.size + 1}`,
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
        lane: location.lane || "",
        devicesCount: 0,
        gatesCount: 0,
        inspectionsCount: 0,
      });
    }
    return map.get(key);
  }

  devices.forEach((device) => {
    const row = ensure(device.location);
    row.devicesCount += 1;
  });

  gates.forEach((gate) => {
    const row = ensure(gate.location);
    row.gatesCount += 1;
  });

  inspections.forEach((inspection) => {
    const row = ensure(inspection.location);
    row.inspectionsCount += 1;
  });

  backendLocations.forEach((locationItem) => {
    const location = assetLocation(locationItem);
    const key = locationKey(location);

    const backendDevices = Number(locationItem.devicesCount ?? locationItem._count?.devices ?? 0);
    const backendGates = Number(locationItem.gatesCount ?? locationItem._count?.gates ?? 0);
    const backendInspections = Number(locationItem.inspectionsCount ?? locationItem._count?.inspections ?? 0);

    const backendHasData =
      (Number.isFinite(backendDevices) && backendDevices > 0) ||
      (Number.isFinite(backendGates) && backendGates > 0) ||
      (Number.isFinite(backendInspections) && backendInspections > 0);

    if (map.has(key)) {
      const row = map.get(key);
      row.id = locationItem.id || row.id;
      row.cluster = row.cluster || location.cluster || "";
      row.building = row.building || location.building || "";
      row.zone = row.zone || location.zone || "";
      row.direction = row.direction || location.direction || "";
      row.lane = row.lane || location.lane || "";
    } else if (backendHasData) {
      map.set(key, {
        id: locationItem.id || key || `backend-location-${map.size + 1}`,
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
        lane: location.lane || "",
        devicesCount: Number.isFinite(backendDevices) ? backendDevices : 0,
        gatesCount: Number.isFinite(backendGates) ? backendGates : 0,
        inspectionsCount: Number.isFinite(backendInspections) ? backendInspections : 0,
      });
    }
  });

  return Array.from(map.values())
    .map((row) => ({
      ...row,
      assetsCount: Number(row.devicesCount || 0) + Number(row.gatesCount || 0),
    }))
    .filter((row) => row.devicesCount > 0 || row.gatesCount > 0 || row.inspectionsCount > 0)
    .sort((a, b) => (b.assetsCount || 0) - (a.assetsCount || 0));
}

function isKnownHealthy(status) {
  return status === "OK";
}

function isAttentionStatus(status) {
  return [
    "ATTENTION",
    "NOT_OK",
    "NEEDS_MAINTENANCE",
    "UNDER_MAINTENANCE",
    "OUT_OF_SERVICE",
    "PARTIAL",
    "NOT_REACHABLE",
  ].includes(status);
}

function statusClass(status) {
  if (status === "OK") return "va-status-badge--ok";
  if (["ATTENTION", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "PARTIAL", "NOT_REACHABLE"].includes(status)) {
    return "va-status-badge--attention";
  }
  if (["NOT_OK", "OUT_OF_SERVICE", "FAILED"].includes(status)) {
    return "va-status-badge--danger";
  }
  return "va-status-badge--other";
}

function cleanEndpoint(endpoint) {
  if (!endpoint) return "—";
  try {
    const parsed = new URL(endpoint);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return endpoint;
  }
}

function countsByStatus(rows, key) {
  const counts = {};
  rows.forEach((row) => {
    const status = row?.[key] || "UNKNOWN";
    counts[status] = (counts[status] || 0) + 1;
  });
  return counts;
}

function monthlyInspectionSeries(rows) {
  const counts = new Array(12).fill(0);
  rows.forEach((row) => {
    const d = safeDate(row.inspectedAt || row.createdAt);
    if (d) counts[d.getMonth()] += 1;
  });
  return counts.map((value, i) => ({ label: monthLabel(i), value }));
}

function topLocationsFromAssets(rows, count = 6) {
  const map = new Map();

  rows.forEach((row) => {
    const label = locationLabel(row.location || {}, "Unknown");
    map.set(label, (map.get(label) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([label, value]) => ({
      label: label.slice(0, 16),
      fullLabel: label,
      value,
    }));
}

function topLocationsFromInspections(rows, count = 6) {
  const map = new Map();

  rows.forEach((row) => {
    const label = locationLabel(row.location || {}, "Unknown");
    map.set(label, (map.get(label) || 0) + 1);
  });

  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([label, value]) => ({
      label: label.slice(0, 16),
      fullLabel: label,
      value,
    }));
}

/* =========================================================
   CHART HELPERS
========================================================= */

function scaleY(v, min, max, H) {
  return max === min ? H / 2 : H - ((v - min) / (max - min)) * H;
}

function smoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const cx = (points[i][0] + points[i + 1][0]) / 2;
    d += ` C ${cx},${points[i][1]} ${cx},${points[i + 1][1]} ${points[i + 1][0]},${points[i + 1][1]}`;
  }
  return d;
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function SectionHead({ title, subtitle, badge }) {
  return (
    <div className="va-section-head">
      <div>
        <h2 className="va-section-title">{title}</h2>
        <div className="va-section-subtitle">{subtitle}</div>
      </div>
      {badge ? <div className="va-badge">{badge}</div> : null}
    </div>
  );
}

function KpiBox({ label, value, note, color, onClick, clickable = false, lang = "en" }) {
  return (
    <button
      type="button"
      className={`va-kpi ${clickable ? "va-kpi--clickable" : ""}`}
      style={{ "--kpi-color": color }}
      onClick={onClick}
    >
      <div className="va-kpi__label">{label}</div>
      <div className="va-kpi__value">{value}</div>
      <div className="va-kpi__note">{note}</div>
      {clickable ? <div className="va-kpi__hint">{lang === "ar" ? "اضغط للتفاصيل" : "Click for details"}</div> : null}
    </button>
  );
}

function DataCheckCard({ pack, lang, onClick }) {
  const t = (en, ar) => (lang === "ar" ? ar : en);

  let badgeClass = "va-check-badge--loaded";
  let badgeText = t("Loaded", "تم التحميل");

  if (!pack?.ok) {
    badgeClass = "va-check-badge--failed";
    badgeText = t("Failed", "فشل");
  } else if (pack.backendTotal !== null && pack.complete) {
    badgeClass = "va-check-badge--verified";
    badgeText = t("Verified", "مؤكد");
  } else if (!pack.complete) {
    badgeClass = "va-check-badge--warning";
    badgeText = t("Check", "راجع");
  }

  const countText =
    pack?.backendTotal !== null
      ? `${numberText(pack.rows.length, lang)} / ${numberText(pack.backendTotal, lang)}`
      : numberText(pack?.rows?.length || 0, lang);

  let metaText = t(
    `${pack?.pagesLoaded || 0} page(s) loaded`,
    `تم تحميل ${numberText(pack?.pagesLoaded || 0, lang)} صفحة`
  );

  if (!pack?.ok) {
    metaText = pack?.error || t("Request failed", "فشل الطلب");
  } else if (pack?.endpointIgnoredPagination) {
    metaText = t(
      "Endpoint may be ignoring page parameters",
      "قد يكون المسار لا يطبق أرقام الصفحات"
    );
  } else if (pack?.backendTotal !== null && !pack?.complete) {
    metaText = t(
      "Loaded rows do not match backend total",
      "الصفوف المحملة لا تطابق إجمالي الباك إند"
    );
  }

  return (
    <button type="button" className="va-check va-check--clickable" onClick={onClick}>
      <div className="va-check-top">
        <div className="va-check-name">{pack?.displayName || pack?.label}</div>
        <span className={`va-check-badge ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="va-check-value">{countText}</div>
      <div className="va-check-meta">{metaText}</div>
      <div className="va-check-endpoint" title={pack?.endpoint || pack?.error || ""}>
        {pack?.endpoint ? cleanEndpoint(pack.endpoint) : pack?.error || "—"}
      </div>
    </button>
  );
}

function ChartCard({ title, subtitle, color = "#4f46e5", onClick, children, lang = "en" }) {
  return (
    <div
      className="va-card va-card--clickable"
      style={{ "--card-color": color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="va-card-top">
        <div>
          <div className="va-card-title">{title}</div>
          <div className="va-card-subtitle">{subtitle}</div>
        </div>
        <div className="va-card-hint">{lang === "ar" ? "تفاصيل" : "Details"}</div>
      </div>
      {children}
    </div>
  );
}

function TypeBadge({ value }) {
  const isGate = value === "GATE";
  return (
    <span className={`va-type-badge ${isGate ? "va-type-badge--gate" : "va-type-badge--device"}`}>
      {value}
    </span>
  );
}

function StatusBadge({ value }) {
  const status = value || "UNKNOWN";
  return <span className={`va-status-badge ${statusClass(status)}`}>{status}</span>;
}

function Pagination({ currentPage, totalPages, onPrevious, onNext, lang }) {
  const t = (en, ar) => (lang === "ar" ? ar : en);

  if (totalPages <= 1) return null;

  return (
    <div className="va-pagination">
      <button type="button" className="va-page-btn" onClick={onPrevious} disabled={currentPage <= 1}>
        {t("Previous", "السابق")}
      </button>
      <div className="va-page-info">
        {numberText(currentPage, lang)} / {numberText(totalPages, lang)}
      </div>
      <button type="button" className="va-page-btn" onClick={onNext} disabled={currentPage >= totalPages}>
        {t("Next", "التالي")}
      </button>
    </div>
  );
}

/* =========================================================
   CHARTS
========================================================= */

function BarChart({ data, color = "#4f46e5", h = 150 }) {
  const W = 460;
  const H = h;
  const PL = 32;
  const PT = 10;
  const PB = 24;
  const PR = 8;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.15;
  const bW = (cW / Math.max(data.length, 1)) * 0.58;
  const gap = cW / Math.max(data.length, 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      {[0, 0.5, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">
              {Math.round(f * max)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const bH = (d.value / max) * cH;
        const x = PL + i * gap + (gap - bW) / 2;
        const y = PT + cH - bH;

        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={Math.max(bH, 2)} fill={color} rx="4" opacity=".9" />
            <text x={x + bW / 2} y={H - 5} className="chart-axis-label" textAnchor="middle">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({ data, color = "#10b981", h = 150 }) {
  const W = 460;
  const H = h;
  const PL = 32;
  const PT = 10;
  const PB = 24;
  const PR = 8;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const max = Math.max(...data.map((d) => d.value), 1) * 1.1;
  const points = data.map((d, i) => [
    PL + (i / (data.length - 1 || 1)) * cW,
    PT + scaleY(d.value, 0, max, cH),
  ]);
  const line = smoothPath(points);
  const gradientId = `line-${color.replace(/[^a-z0-9]/gi, "")}-${data.length}`;
  const area = points.length
    ? `${line} L ${points[points.length - 1][0]},${PT + cH} L ${points[0][0]},${PT + cH} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" style={{ height: h }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 0.5, 1].map((f, i) => {
        const y = PT + (1 - f) * cH;
        return (
          <g key={i}>
            <line x1={PL} y1={y} x2={PL + cW} y2={y} className="chart-grid-line" />
            <text x={PL - 4} y={y + 4} className="chart-axis-label" textAnchor="end">
              {Math.round(f * max)}
            </text>
          </g>
        );
      })}

      {points.length > 1 ? (
        <>
          <path d={area} fill={`url(#${gradientId})`} />
          <path d={line} className="chart-line" stroke={color} />
          {points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />)}
        </>
      ) : null}

      {data.map((d, i) => (
        <text
          key={i}
          x={PL + (i / (data.length - 1 || 1)) * cW}
          y={H - 5}
          className="chart-axis-label"
          textAnchor="middle"
        >
          {d.label}
        </text>
      ))}
    </svg>
  );
}

function DonutChart({ segments }) {
  const R = 55;
  const cx = 70;
  const cy = 70;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  let startA = -Math.PI / 2;

  const arcs = segments.map((segment) => {
    const angle = (segment.value / total) * 2 * Math.PI;
    const x1 = cx + R * Math.cos(startA);
    const y1 = cy + R * Math.sin(startA);
    startA += angle;
    const x2 = cx + R * Math.cos(startA);
    const y2 = cy + R * Math.sin(startA);

    return {
      ...segment,
      d: `M ${cx},${cy} L ${x1},${y1} A ${R},${R} 0 ${angle > Math.PI ? 1 : 0},1 ${x2},${y2} Z`,
    };
  });

  return (
    <div className="va-donut-wrap">
      <svg viewBox="0 0 140 140" width="140" height="140">
        {arcs.map((arc, i) => <path key={i} d={arc.d} fill={arc.color} opacity=".92" />)}
        <circle cx={cx} cy={cy} r={R * 0.55} fill="#fff" />
        <text x={cx} y={cy - 7} textAnchor="middle" className="chart-axis-label">TOTAL</text>
        <text x={cx} y={cy + 13} textAnchor="middle" fill="#0f172a" fontSize="20" fontWeight="800">
          {total}
        </text>
      </svg>

      <div className="va-donut-legend">
        {segments.map((segment, i) => (
          <div key={i} className="va-donut-item">
            <div className="va-donut-dot" style={{ background: segment.color }} />
            <span className="va-donut-label">{segment.label}</span>
            <span className="va-donut-value">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HorizontalBars({ data, color = "#818cf8" }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="va-hbar-row">
          <div className="va-hbar-top">
            <span className="va-hbar-name" title={d.fullLabel || d.label}>{d.label}</span>
            <span className="va-hbar-value">{d.value}</span>
          </div>
          <div className="va-hbar-track">
            <div className="va-hbar-fill" style={{ width: `${(d.value / max) * 100}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DETAIL MODAL
========================================================= */

function DetailModal({ detail, onClose, lang }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [detail?.title]);

  useEffect(() => {
    if (!detail) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [detail, onClose]);

  if (!detail) return null;

  const rows = Array.isArray(detail.rows) ? detail.rows : [];
  const q = query.trim().toLowerCase();

  const filteredRows = !q
    ? rows
    : rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));

  const columns = detail.columns || [];

  return (
    <div className="va-modal-backdrop" onMouseDown={onClose}>
      <div className="va-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="va-modal-head">
          <div>
            <h3 className="va-modal-title">{detail.title}</h3>
            <div className="va-modal-subtitle">{detail.subtitle}</div>
          </div>
          <button type="button" className="va-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="va-modal-tools">
          <input
            className="va-modal-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث داخل التفاصيل..." : "Search inside details..."}
          />
          <div className="va-modal-count">
            {lang === "ar" ? "النتائج: " : "Results: "}
            {numberText(filteredRows.length, lang)}
          </div>
        </div>

        <div className="va-modal-body">
          {detail.summary?.length ? (
            <div className="va-modal-kpis">
              {detail.summary.map((item, index) => (
                <div key={index} className="va-mini-kpi" style={{ "--mini-kpi-color": item.color || "var(--text)" }}>
                  <div className="va-mini-kpi__label">{item.label}</div>
                  <div className="va-mini-kpi__value">{numberText(item.value, lang)}</div>
                </div>
              ))}
            </div>
          ) : null}

          {detail.charts?.length ? (
            <div className={detail.charts.length === 1 ? "va-grid-2" : "va-grid-2"} style={{ marginBottom: 16 }}>
              {detail.charts.map((chart, index) => (
                <Card key={index} title={chart.title} subtitle={chart.subtitle}>
                  {chart.type === "bar" ? <BarChart data={chart.data || []} color={chart.color} /> : null}
                  {chart.type === "line" ? <LineChart data={chart.data || []} color={chart.color} /> : null}
                  {chart.type === "donut" ? <DonutChart segments={chart.data || []} /> : null}
                  {chart.type === "hbars" ? <HorizontalBars data={chart.data || []} color={chart.color} /> : null}
                </Card>
              ))}
            </div>
          ) : null}

          {filteredRows.length === 0 ? (
            <div className="va-empty">{lang === "ar" ? "لا توجد بيانات." : "No data found."}</div>
          ) : (
            <div className="va-table-wrap">
              <table className="va-table">
                <thead>
                  <tr>
                    {columns.map((column) => <th key={column.key}>{column.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr key={row.id || row.code || row.assetCode || index}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render ? column.render(row, index) : row[column.key] ?? "—"}
                        </td>
                      ))}
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

function Card({ title, subtitle, children }) {
  return (
    <div className="va-card">
      <div className="va-card-title">{title}</div>
      <div className="va-card-subtitle">{subtitle}</div>
      {children}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export function ViewerAnalyticsPage({ lang = "en", apiBaseUrl = "" }) {
  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  const [devices, setDevices] = useState([]);
  const [gates, setGates] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [locations, setLocations] = useState([]);

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  const [activeView, setActiveView] = useState("assets");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
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
        fetchAllPages({ label: "devices", candidates: endpoints.devices, token, arrayKeys: ["devices"] }),
        fetchAllPages({ label: "gates", candidates: endpoints.gates, token, arrayKeys: ["gates"] }),
        fetchAllPages({ label: "inspections", candidates: endpoints.inspections, token, arrayKeys: ["inspections"] }),
        fetchAllPages({ label: "locations", candidates: endpoints.locations, token, arrayKeys: ["locations"] }),
      ]);

      const normalizedDevices = devicesPack.rows.map(normalizeDevice);
      const normalizedGates = gatesPack.rows.map(normalizeGate);
      const normalizedInspections = inspectionsPack.rows.map(normalizeInspection);
      const normalizedLocations = buildLocationRows(
        normalizedDevices,
        normalizedGates,
        normalizedInspections,
        locationsPack.rows
      );

      setDevices(normalizedDevices);
      setGates(normalizedGates);
      setInspections(normalizedInspections);
      setLocations(normalizedLocations);

      setPacks([
        { ...devicesPack, displayName: t("Devices", "الأجهزة") },
        { ...gatesPack, displayName: t("Gates", "البوابات") },
        { ...inspectionsPack, displayName: t("Inspections", "الفحوصات") },
        { ...locationsPack, displayName: t("Locations", "المواقع"), rows: normalizedLocations },
      ]);

      const coreFailed = !devicesPack.ok && !gatesPack.ok && !inspectionsPack.ok;

      if (coreFailed) {
        setError(
          t(
            "Devices, gates, and inspections could not be loaded from the backend.",
            "تعذر تحميل الأجهزة والبوابات والفحوصات من الباك إند."
          )
        );
      } else {
        const incomplete = [devicesPack, gatesPack, inspectionsPack].filter(
          (pack) => pack.ok && pack.backendTotal !== null && !pack.complete
        );

        if (incomplete.length > 0) {
          setError(
            t(
              "Some backend totals do not match the loaded rows. Check the verification cards below.",
              "بعض إجماليات الباك إند لا تطابق الصفوف المحملة. راجعي كروت التحقق بالأسفل."
            )
          );
        }
      }
    } catch (loadError) {
      console.error("Viewer analytics load error:", loadError);

      setDevices([]);
      setGates([]);
      setInspections([]);
      setLocations([]);
      setPacks([]);

      setError(
        loadError?.message || t("Failed to load backend data.", "فشل تحميل بيانات الباك إند.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, query, typeFilter, statusFilter]);

  const allAssets = useMemo(() => [...devices, ...gates], [devices, gates]);
  const deviceInspections = useMemo(() => inspections.filter((x) => x.assetType === "DEVICE"), [inspections]);
  const gateInspections = useMemo(() => inspections.filter((x) => x.assetType === "GATE"), [inspections]);

  const healthyAssets = useMemo(() => allAssets.filter((x) => isKnownHealthy(x.currentStatus)).length, [allAssets]);
  const attentionAssets = useMemo(() => allAssets.filter((x) => isAttentionStatus(x.currentStatus)).length, [allAssets]);
  const unknownAssets = Math.max(allAssets.length - healthyAssets - attentionAssets, 0);

  const deviceStatusCounts = useMemo(() => countsByStatus(devices, "currentStatus"), [devices]);
  const gateStatusCounts = useMemo(() => countsByStatus(gates, "currentStatus"), [gates]);
  const inspectionStatusCounts = useMemo(() => countsByStatus(inspections, "inspectionStatus"), [inspections]);

  const monthlyAllInspections = useMemo(() => monthlyInspectionSeries(inspections), [inspections]);

  const chartAssetsByType = useMemo(() => ([
    { label: t("Devices", "الأجهزة"), value: devices.length },
    { label: t("Gates", "البوابات"), value: gates.length },
  ]), [devices.length, gates.length, lang]);

  const chartTopAssetLocations = useMemo(() => {
    return locations
      .slice(0, 6)
      .map((item, index) => ({
        label: locationLabel(item, `LOC-${index + 1}`).slice(0, 16),
        fullLabel: locationLabel(item, `LOC-${index + 1}`),
        value: item.assetsCount || 0,
      }));
  }, [locations]);

  const chartTopInspectionLocations = useMemo(() => {
    return [...locations]
      .sort((a, b) => (b.inspectionsCount || 0) - (a.inspectionsCount || 0))
      .slice(0, 6)
      .map((item, index) => ({
        label: locationLabel(item, `LOC-${index + 1}`).slice(0, 16),
        fullLabel: locationLabel(item, `LOC-${index + 1}`),
        value: item.inspectionsCount || 0,
      }));
  }, [locations]);

  const chartDeviceDonut = useMemo(() => ([
    { label: t("OK", "سليم"), value: deviceStatusCounts.OK || 0, color: "#059669" },
    { label: t("Attention", "متابعة"), value: deviceStatusCounts.ATTENTION || 0, color: "#d97706" },
    { label: t("Maintenance", "صيانة"), value: (deviceStatusCounts.NEEDS_MAINTENANCE || 0) + (deviceStatusCounts.UNDER_MAINTENANCE || 0), color: "#dc2626" },
    {
      label: t("Other", "أخرى"),
      value: Math.max(
        devices.length -
          ((deviceStatusCounts.OK || 0) +
            (deviceStatusCounts.ATTENTION || 0) +
            (deviceStatusCounts.NEEDS_MAINTENANCE || 0) +
            (deviceStatusCounts.UNDER_MAINTENANCE || 0)),
        0
      ),
      color: "#64748b",
    },
  ]), [deviceStatusCounts, devices.length, lang]);

  const chartGateDonut = useMemo(() => ([
    { label: t("OK", "سليم"), value: gateStatusCounts.OK || 0, color: "#059669" },
    { label: t("Attention", "متابعة"), value: gateStatusCounts.ATTENTION || 0, color: "#d97706" },
    { label: t("Maintenance", "صيانة"), value: (gateStatusCounts.NEEDS_MAINTENANCE || 0) + (gateStatusCounts.UNDER_MAINTENANCE || 0), color: "#dc2626" },
    {
      label: t("Other", "أخرى"),
      value: Math.max(
        gates.length -
          ((gateStatusCounts.OK || 0) +
            (gateStatusCounts.ATTENTION || 0) +
            (gateStatusCounts.NEEDS_MAINTENANCE || 0) +
            (gateStatusCounts.UNDER_MAINTENANCE || 0)),
        0
      ),
      color: "#64748b",
    },
  ]), [gateStatusCounts, gates.length, lang]);

  const chartInspectionSplit = useMemo(() => ([
    { label: t("Device Inspections", "فحوصات الأجهزة"), value: deviceInspections.length, color: "#4f46e5" },
    { label: t("Gate Inspections", "فحوصات البوابات"), value: gateInspections.length, color: "#0891b2" },
  ]), [deviceInspections.length, gateInspections.length, lang]);

  const assetColumns = [
    { key: "type", label: t("Type", "النوع"), render: (row) => <TypeBadge value={row.assetType} /> },
    { key: "code", label: t("Code / Name", "الكود / الاسم"), render: (row) => (
      <>
        <div className="va-primary-text">{row.code || "—"}</div>
        <div className="va-secondary-text">
          {row.name || "—"}{row.secretCode ? ` · ${row.secretCode}` : ""}
        </div>
      </>
    )},
    { key: "status", label: t("Status", "الحالة"), render: (row) => <StatusBadge value={row.currentStatus} /> },
    { key: "recordStatus", label: t("Record Status", "حالة السجل"), render: (row) => row.recordStatus || "—" },
    { key: "location", label: t("Location", "الموقع"), render: (row) => locationLabel(row.location || {}, "—") },
    { key: "inspectionsCount", label: t("Inspections", "الفحوصات"), render: (row) => numberText(row.inspectionsCount, lang) },
    { key: "lastInspectionAt", label: t("Last Inspection", "آخر فحص"), render: (row) => formatDate(row.lastInspectionAt, lang, false) },
  ];

  const inspectionColumns = [
    { key: "type", label: t("Type", "النوع"), render: (row) => <TypeBadge value={row.assetType} /> },
    { key: "asset", label: t("Asset", "الأصل"), render: (row) => (
      <>
        <div className="va-primary-text">{row.assetCode || "—"}</div>
        <div className="va-secondary-text">{row.assetName || "—"}</div>
      </>
    )},
    { key: "status", label: t("Result", "النتيجة"), render: (row) => <StatusBadge value={row.inspectionStatus} /> },
    { key: "inspector", label: t("Inspector", "القائم بالفحص"), render: (row) => row.inspector || "—" },
    { key: "location", label: t("Location", "الموقع"), render: (row) => locationLabel(row.location || {}, "—") },
    { key: "inspectedAt", label: t("Date", "التاريخ"), render: (row) => formatDate(row.inspectedAt, lang, true) },
  ];

  const locationColumns = [
    { key: "location", label: t("Location", "الموقع"), render: (row) => <div className="va-primary-text">{locationLabel(row, "—")}</div> },
    { key: "devicesCount", label: t("Devices", "الأجهزة"), render: (row) => numberText(row.devicesCount, lang) },
    { key: "gatesCount", label: t("Gates", "البوابات"), render: (row) => numberText(row.gatesCount, lang) },
    { key: "assetsCount", label: t("All Assets", "كل الأصول"), render: (row) => numberText(row.assetsCount, lang) },
    { key: "inspectionsCount", label: t("Inspections", "الفحوصات"), render: (row) => numberText(row.inspectionsCount, lang) },
  ];

  function openAssetDetail(title, rows, subtitle = "") {
    const counts = countsByStatus(rows, "currentStatus");
    setDetail({
      title,
      subtitle: subtitle || t("Detailed asset analytics and records.", "تحليلات مفصلة وسجلات الأصول."),
      rows,
      columns: assetColumns,
      summary: [
        { label: t("Assets", "الأصول"), value: rows.length, color: "#0f172a" },
        { label: t("OK", "سليم"), value: counts.OK || 0, color: "#059669" },
        { label: t("Attention", "متابعة"), value: (counts.ATTENTION || 0) + (counts.NEEDS_MAINTENANCE || 0) + (counts.UNDER_MAINTENANCE || 0), color: "#d97706" },
        { label: t("Other", "أخرى"), value: Math.max(rows.length - ((counts.OK || 0) + (counts.ATTENTION || 0) + (counts.NEEDS_MAINTENANCE || 0) + (counts.UNDER_MAINTENANCE || 0)), 0), color: "#64748b" },
      ],
      charts: [
        {
          type: "donut",
          title: t("Status Split", "توزيع الحالات"),
          subtitle: t("Current status distribution", "توزيع الحالة الحالية"),
          data: [
            { label: t("OK", "سليم"), value: counts.OK || 0, color: "#059669" },
            { label: t("Attention", "متابعة"), value: counts.ATTENTION || 0, color: "#d97706" },
            { label: t("Needs Maintenance", "تحتاج صيانة"), value: counts.NEEDS_MAINTENANCE || 0, color: "#dc2626" },
            { label: t("Under Maintenance", "تحت الصيانة"), value: counts.UNDER_MAINTENANCE || 0, color: "#4f46e5" },
          ],
        },
        {
          type: "hbars",
          title: t("Top Asset Locations", "أعلى المواقع"),
          subtitle: t("Locations with most matching assets", "المواقع الأعلى في الأصول المطابقة"),
          data: topLocationsFromAssets(rows),
          color: "#818cf8",
        },
      ],
    });
  }

  function openInspectionDetail(title, rows, subtitle = "") {
    const statusCounts = countsByStatus(rows, "inspectionStatus");
    const deviceRows = rows.filter((x) => x.assetType === "DEVICE");
    const gateRows = rows.filter((x) => x.assetType === "GATE");

    setDetail({
      title,
      subtitle: subtitle || t("Detailed inspection analytics and records.", "تحليلات مفصلة وسجلات الفحوصات."),
      rows,
      columns: inspectionColumns,
      summary: [
        { label: t("Inspections", "الفحوصات"), value: rows.length, color: "#0f172a" },
        { label: t("Device Inspections", "فحوصات الأجهزة"), value: deviceRows.length, color: "#4f46e5" },
        { label: t("Gate Inspections", "فحوصات البوابات"), value: gateRows.length, color: "#0891b2" },
        { label: t("OK Results", "نتائج سليمة"), value: statusCounts.OK || 0, color: "#059669" },
      ],
      charts: [
        {
          type: "line",
          title: t("Monthly Trend", "الاتجاه الشهري"),
          subtitle: t("Inspection volume by month", "حجم الفحوصات حسب الشهر"),
          data: monthlyInspectionSeries(rows),
          color: "#10b981",
        },
        {
          type: "donut",
          title: t("Inspection Result Split", "توزيع نتائج الفحوصات"),
          subtitle: t("Inspection statuses", "حالات الفحص"),
          data: [
            { label: "OK", value: statusCounts.OK || 0, color: "#059669" },
            { label: "NOT_OK", value: statusCounts.NOT_OK || 0, color: "#dc2626" },
            { label: "PARTIAL", value: statusCounts.PARTIAL || 0, color: "#d97706" },
            { label: "NOT_REACHABLE", value: statusCounts.NOT_REACHABLE || 0, color: "#64748b" },
          ],
        },
        {
          type: "donut",
          title: t("Asset Type Split", "توزيع نوع الأصل"),
          subtitle: t("Device vs gate inspections", "فحوصات الأجهزة مقابل البوابات"),
          data: [
            { label: t("Devices", "الأجهزة"), value: deviceRows.length, color: "#4f46e5" },
            { label: t("Gates", "البوابات"), value: gateRows.length, color: "#0891b2" },
          ],
        },
        {
          type: "hbars",
          title: t("Top Inspection Locations", "أعلى مواقع الفحص"),
          subtitle: t("Most inspected locations", "أكثر المواقع فحصًا"),
          data: topLocationsFromInspections(rows),
          color: "#818cf8",
        },
      ],
    });
  }

  function openLocationDetail(title, rows, subtitle = "") {
    const totalDevices = rows.reduce((sum, row) => sum + Number(row.devicesCount || 0), 0);
    const totalGates = rows.reduce((sum, row) => sum + Number(row.gatesCount || 0), 0);
    const totalInspections = rows.reduce((sum, row) => sum + Number(row.inspectionsCount || 0), 0);

    const assetsBars = rows.slice(0, 6).map((row, index) => ({
      label: locationLabel(row, `LOC-${index + 1}`).slice(0, 16),
      fullLabel: locationLabel(row, `LOC-${index + 1}`),
      value: row.assetsCount || 0,
    }));

    const inspectionsBars = [...rows]
      .sort((a, b) => (b.inspectionsCount || 0) - (a.inspectionsCount || 0))
      .slice(0, 6)
      .map((row, index) => ({
        label: locationLabel(row, `LOC-${index + 1}`).slice(0, 16),
        fullLabel: locationLabel(row, `LOC-${index + 1}`),
        value: row.inspectionsCount || 0,
      }));

    setDetail({
      title,
      subtitle: subtitle || t("Detailed location analytics and records.", "تحليلات مفصلة وسجلات المواقع."),
      rows,
      columns: locationColumns,
      summary: [
        { label: t("Locations", "المواقع"), value: rows.length, color: "#0f172a" },
        { label: t("Devices", "الأجهزة"), value: totalDevices, color: "#4f46e5" },
        { label: t("Gates", "البوابات"), value: totalGates, color: "#0891b2" },
        { label: t("Inspections", "الفحوصات"), value: totalInspections, color: "#059669" },
      ],
      charts: [
        {
          type: "bar",
          title: t("Assets by Location", "الأصول حسب الموقع"),
          subtitle: t("Top locations by assets", "أعلى المواقع في الأصول"),
          data: assetsBars,
          color: "#4f46e5",
        },
        {
          type: "hbars",
          title: t("Inspections by Location", "الفحوصات حسب الموقع"),
          subtitle: t("Top locations by inspections", "أعلى المواقع في الفحوصات"),
          data: inspectionsBars,
          color: "#818cf8",
        },
      ],
    });
  }

  function openPackDetail(pack) {
    if (!pack) return;

    if (pack.label === "devices") {
      openAssetDetail(t("Devices Verification Details", "تفاصيل تحقق الأجهزة"), devices, t("Rows loaded from backend device endpoints.", "الصفوف المحملة من مسارات الأجهزة في الباك إند."));
      return;
    }

    if (pack.label === "gates") {
      openAssetDetail(t("Gates Verification Details", "تفاصيل تحقق البوابات"), gates, t("Rows loaded from backend gate endpoints.", "الصفوف المحملة من مسارات البوابات في الباك إند."));
      return;
    }

    if (pack.label === "inspections") {
      openInspectionDetail(t("Inspections Verification Details", "تفاصيل تحقق الفحوصات"), inspections, t("Rows loaded from backend inspection endpoints.", "الصفوف المحملة من مسارات الفحوصات في الباك إند."));
      return;
    }

    openLocationDetail(t("Locations Verification Details", "تفاصيل تحقق المواقع"), locations, t("Location rows built from loaded assets and inspections.", "صفوف المواقع المبنية من الأصول والفحوصات المحملة."));
  }

  const statusOptions = useMemo(() => {
    let rows = [];

    if (activeView === "assets") rows = allAssets;
    else if (activeView === "inspections") rows = inspections;

    const statuses = new Set(
      rows.map((row) => (activeView === "inspections" ? row.inspectionStatus : row.currentStatus))
    );

    return Array.from(statuses).filter(Boolean).sort((a, b) => a.localeCompare(b));
  }, [activeView, allAssets, inspections]);

  useEffect(() => {
    if (statusFilter !== "ALL" && !statusOptions.includes(statusFilter)) {
      setStatusFilter("ALL");
    }
  }, [statusFilter, statusOptions]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (activeView === "assets") {
      return allAssets.filter((asset) => {
        const matchesType = typeFilter === "ALL" || asset.assetType === typeFilter;
        const matchesStatus = statusFilter === "ALL" || asset.currentStatus === statusFilter;
        const searchable = [
          asset.assetType,
          asset.code,
          asset.name,
          asset.secretCode,
          asset.currentStatus,
          asset.recordStatus,
          locationLabel(asset.location || {}, ""),
        ].join(" ").toLowerCase();

        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        return matchesType && matchesStatus && matchesQuery;
      });
    }

    if (activeView === "inspections") {
      return inspections.filter((inspection) => {
        const matchesType = typeFilter === "ALL" || inspection.assetType === typeFilter;
        const matchesStatus = statusFilter === "ALL" || inspection.inspectionStatus === statusFilter;
        const searchable = [
          inspection.assetType,
          inspection.assetCode,
          inspection.assetName,
          inspection.inspectionStatus,
          inspection.inspector,
          locationLabel(inspection.location || {}, ""),
        ].join(" ").toLowerCase();

        const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
        return matchesType && matchesStatus && matchesQuery;
      });
    }

    return locations.filter((location) => {
      const searchable = [
        location.building,
        location.zone,
        location.direction,
        location.lane,
        location.cluster,
      ].join(" ").toLowerCase();

      return !normalizedQuery || searchable.includes(normalizedQuery);
    });
  }, [activeView, allAssets, inspections, locations, query, typeFilter, statusFilter]);

  const totalPages = Math.max(Math.ceil(filteredRows.length / TABLE_PAGE_SIZE), 1);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * TABLE_PAGE_SIZE;
    return filteredRows.slice(start, start + TABLE_PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  function renderAssetsTable() {
    return (
      <table className="va-table">
        <thead>
          <tr>
            {assetColumns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr key={`${row.assetType}-${row.id || row.code}-${index}`}>
              {assetColumns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row, index) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderInspectionsTable() {
    return (
      <table className="va-table">
        <thead>
          <tr>
            {inspectionColumns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr key={`inspection-${row.id || index}`}>
              {inspectionColumns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row, index) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderLocationsTable() {
    return (
      <table className="va-table">
        <thead>
          <tr>
            {locationColumns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, index) => (
            <tr key={row.id || `location-${index}`}>
              {locationColumns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row, index) : row[column.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <>
      <style>{ANALYTICS_CSS}</style>

      <div className="viewer-analytics" dir={lang === "ar" ? "rtl" : "ltr"}>
        <header className="va-header">
          <div>
            <h1 className="va-title">{t("Viewer Analytics", "تحليلات المشاهد")}</h1>
            <div className="va-subtitle">
              {t(
                "Organized analytics with verified backend loading, clickable cards, detailed charts, and better location accuracy.",
                "تحليلات منظمة مع تحقق من تحميل الباك إند، وكروت قابلة للضغط، ورسومات تفصيلية، ودقة أفضل للمواقع."
              )}
            </div>
          </div>

          <button type="button" className="va-refresh" onClick={loadAnalytics} disabled={loading}>
            {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh Data", "تحديث البيانات")}
          </button>
        </header>

        {!!error && <div className="va-alert">{error}</div>}

        {loading ? (
          <div className="va-loading">
            <div>
              <div className="va-spinner" />
              {t("Loading analytics from backend...", "جارٍ تحميل التحليلات من الباك إند...")}
            </div>
          </div>
        ) : (
          <>
            <section className="va-kpis">
              <KpiBox
                label={t("Devices", "الأجهزة")}
                value={numberText(devices.length, lang)}
                note={t("All loaded device records", "كل سجلات الأجهزة المحملة")}
                color="#4f46e5"
                clickable
                lang={lang}
                onClick={() => openAssetDetail(t("All Devices", "كل الأجهزة"), devices)}
              />
              <KpiBox
                label={t("Gates", "البوابات")}
                value={numberText(gates.length, lang)}
                note={t("All loaded gate records", "كل سجلات البوابات المحملة")}
                color="#0891b2"
                clickable
                lang={lang}
                onClick={() => openAssetDetail(t("All Gates", "كل البوابات"), gates)}
              />
              <KpiBox
                label={t("Assets", "الأصول")}
                value={numberText(allAssets.length, lang)}
                note={t("Devices + gates", "الأجهزة + البوابات")}
                color="#0f172a"
                clickable
                lang={lang}
                onClick={() => openAssetDetail(t("All Assets", "كل الأصول"), allAssets)}
              />
              <KpiBox
                label={t("Inspections", "الفحوصات")}
                value={numberText(inspections.length, lang)}
                note={t("All loaded inspection rows", "كل سجلات الفحوصات المحملة")}
                color="#7c3aed"
                clickable
                lang={lang}
                onClick={() => openInspectionDetail(t("All Inspections", "كل الفحوصات"), inspections)}
              />
              <KpiBox
                label={t("Healthy", "سليم")}
                value={numberText(healthyAssets, lang)}
                note={t("Only explicit OK", "الحالات الصريحة OK فقط")}
                color="#059669"
                clickable
                lang={lang}
                onClick={() => openAssetDetail(
                  t("Healthy Assets", "الأصول السليمة"),
                  allAssets.filter((row) => row.currentStatus === "OK")
                )}
              />
              <KpiBox
                label={t("Need Attention / Other", "متابعة / أخرى")}
                value={numberText(attentionAssets + unknownAssets, lang)}
                note={t("Not silently counted as OK", "لا يتم احتسابها سليمة تلقائيًا")}
                color="#d97706"
                clickable
                lang={lang}
                onClick={() => openAssetDetail(
                  t("Attention & Other Assets", "الأصول التي تحتاج متابعة / أخرى"),
                  allAssets.filter((row) => row.currentStatus !== "OK")
                )}
              />
            </section>

            <section className="va-section">
              <SectionHead
                title={t("Backend Data Check", "التحقق من بيانات الباك إند")}
                subtitle={t(
                  "Each card shows whether loaded rows match the backend total. Click any card for details.",
                  "كل كارت يوضح هل الصفوف المحملة تطابق إجمالي الباك إند أم لا. اضغطي على أي كارت للتفاصيل."
                )}
                badge={t("Verification", "تحقق")}
              />

              <div className="va-check-grid">
                {packs.map((pack) => (
                  <DataCheckCard
                    key={pack.label}
                    pack={pack}
                    lang={lang}
                    onClick={() => openPackDetail(pack)}
                  />
                ))}
              </div>
            </section>

            <section className="va-section">
              <SectionHead
                title={t("Overview Charts", "الرسومات الرئيسية")}
                subtitle={t(
                  "All chart cards are clickable and open a more detailed analytics view.",
                  "كل كروت الرسومات قابلة للضغط وتفتح عرض تحليلي أكثر تفصيلًا."
                )}
                badge={t("Interactive", "تفاعلي")}
              />

              <div className="va-grid-3">
                <ChartCard
                  title={t("Assets by Type", "الأصول حسب النوع")}
                  subtitle={t("Devices versus gates", "الأجهزة مقابل البوابات")}
                  color="#4f46e5"
                  lang={lang}
                  onClick={() => openAssetDetail(t("Assets by Type", "الأصول حسب النوع"), allAssets)}
                >
                  <BarChart data={chartAssetsByType} color="#4f46e5" />
                </ChartCard>

                <ChartCard
                  title={t("Monthly Inspections", "الفحوصات الشهرية")}
                  subtitle={t("Inspection activity by month", "نشاط الفحوصات حسب الشهر")}
                  color="#10b981"
                  lang={lang}
                  onClick={() => openInspectionDetail(t("Monthly Inspection Details", "تفاصيل الفحوصات الشهرية"), inspections)}
                >
                  <LineChart data={monthlyAllInspections} color="#10b981" />
                </ChartCard>

                <ChartCard
                  title={t("Top Asset Locations", "أعلى مواقع الأصول")}
                  subtitle={t("Highest locations by assets", "أعلى المواقع في عدد الأصول")}
                  color="#818cf8"
                  lang={lang}
                  onClick={() => openLocationDetail(t("Top Asset Locations", "أعلى مواقع الأصول"), locations)}
                >
                  <HorizontalBars data={chartTopAssetLocations} color="#818cf8" />
                </ChartCard>
              </div>

              <div className="va-grid-2" style={{ marginTop: 14 }}>
                <ChartCard
                  title={t("Device Status Split", "توزيع حالات الأجهزة")}
                  subtitle={t("Status counts for devices only", "عدد الحالات للأجهزة فقط")}
                  color="#4f46e5"
                  lang={lang}
                  onClick={() => openAssetDetail(t("Device Status Details", "تفاصيل حالات الأجهزة"), devices)}
                >
                  <DonutChart segments={chartDeviceDonut} />
                </ChartCard>

                <ChartCard
                  title={t("Gate Status Split", "توزيع حالات البوابات")}
                  subtitle={t("Status counts for gates only", "عدد الحالات للبوابات فقط")}
                  color="#0891b2"
                  lang={lang}
                  onClick={() => openAssetDetail(t("Gate Status Details", "تفاصيل حالات البوابات"), gates)}
                >
                  <DonutChart segments={chartGateDonut} />
                </ChartCard>
              </div>

              <div className="va-grid-2" style={{ marginTop: 14 }}>
                <ChartCard
                  title={t("Inspection Split", "تقسيم الفحوصات")}
                  subtitle={t("Devices versus gates in inspections", "الأجهزة مقابل البوابات في الفحوصات")}
                  color="#7c3aed"
                  lang={lang}
                  onClick={() => openInspectionDetail(t("Inspection Split Details", "تفاصيل تقسيم الفحوصات"), inspections)}
                >
                  <DonutChart segments={chartInspectionSplit} />
                </ChartCard>

                <ChartCard
                  title={t("Top Inspection Locations", "أعلى مواقع الفحص")}
                  subtitle={t("Most inspected locations", "أكثر المواقع فحصًا")}
                  color="#4f46e5"
                  lang={lang}
                  onClick={() => openLocationDetail(t("Top Inspection Locations", "أعلى مواقع الفحص"), locations)}
                >
                  <HorizontalBars data={chartTopInspectionLocations} color="#4f46e5" />
                </ChartCard>
              </div>
            </section>

            <section className="va-section">
              <SectionHead
                title={
                  activeView === "assets"
                    ? t("Assets Table", "جدول الأصول")
                    : activeView === "inspections"
                    ? t("Inspections Table", "جدول الفحوصات")
                    : t("Locations Table", "جدول المواقع")
                }
                subtitle={t("Search and review the loaded records.", "ابحثي وراجعي السجلات المحملة.")}
                badge={
                  activeView === "assets"
                    ? `${numberText(allAssets.length, lang)} ${t("rows", "صف")}`
                    : activeView === "inspections"
                    ? `${numberText(inspections.length, lang)} ${t("rows", "صف")}`
                    : `${numberText(locations.length, lang)} ${t("rows", "صف")}`
                }
              />

              <div className="va-tabs">
                <button
                  type="button"
                  className={`va-tab ${activeView === "assets" ? "va-tab--active" : ""}`}
                  onClick={() => setActiveView("assets")}
                >
                  {t("Assets", "الأصول")} ({numberText(allAssets.length, lang)})
                </button>

                <button
                  type="button"
                  className={`va-tab ${activeView === "inspections" ? "va-tab--active" : ""}`}
                  onClick={() => setActiveView("inspections")}
                >
                  {t("Inspections", "الفحوصات")} ({numberText(inspections.length, lang)})
                </button>

                <button
                  type="button"
                  className={`va-tab ${activeView === "locations" ? "va-tab--active" : ""}`}
                  onClick={() => setActiveView("locations")}
                >
                  {t("Locations", "المواقع")} ({numberText(locations.length, lang)})
                </button>
              </div>

              <div className="va-toolbar">
                <input
                  className="va-input"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t("Search code, name, location...", "ابحثي بالكود أو الاسم أو الموقع...")}
                />

                {activeView !== "locations" ? (
                  <select className="va-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                    <option value="ALL">{t("All Types", "كل الأنواع")}</option>
                    <option value="DEVICE">{t("Devices", "الأجهزة")}</option>
                    <option value="GATE">{t("Gates", "البوابات")}</option>
                  </select>
                ) : (
                  <div />
                )}

                {activeView !== "locations" ? (
                  <select className="va-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="ALL">{t("All Statuses", "كل الحالات")}</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <div />
                )}

                <div className="va-results-count">
                  {t("Results", "النتائج")}: {numberText(filteredRows.length, lang)}
                </div>
              </div>

              {paginatedRows.length === 0 ? (
                <div className="va-empty">{t("No matching records found.", "لا توجد سجلات مطابقة.")}</div>
              ) : (
                <div className="va-table-wrap">
                  {activeView === "assets" && renderAssetsTable()}
                  {activeView === "inspections" && renderInspectionsTable()}
                  {activeView === "locations" && renderLocationsTable()}
                </div>
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevious={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                lang={lang}
              />
            </section>
          </>
        )}

        <DetailModal detail={detail} onClose={() => setDetail(null)} lang={lang} />
      </div>
    </>
  );
}

export default ViewerAnalyticsPage;