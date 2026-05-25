import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_API_BASE_URL = "https://acess-backend-production.up.railway.app";

/* =========================
   API / IMAGE HELPERS
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

  const saved = String(localStorage.getItem("dashboard_api_base_url") || "")
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

function safe(value) {
  if (value === undefined || value === null || value === "") return "—";
  return value;
}

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtFull(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function boolFromAny(value) {
  if (value === true) return true;
  if (value === false) return false;

  const text = String(value || "").trim().toLowerCase();

  return [
    "true",
    "yes",
    "1",
    "done",
    "scanned",
    "verified",
    "scan_done",
    "scan done",
    "تم",
    "تم scan",
  ].includes(text);
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
  };

  return map[status] || status || "—";
}

function statusClass(status) {
  if (["OK", "DONE", "RESOLVED", "COMPLETED"].includes(status)) return "good";

  if (["NOT_OK", "FAILED", "OUT_OF_SERVICE", "UNRESOLVED"].includes(status)) {
    return "bad";
  }

  if (
    [
      "PARTIAL",
      "NEEDS_MAINTENANCE",
      "IN_PROGRESS",
      "UNDER_MAINTENANCE",
      "PENDING",
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
    obj.InspectionImage ||
    obj.inspectionImage ||
    obj.photos ||
    obj.attachments ||
    obj.files ||
    [];

  if (!Array.isArray(possible)) return [];

  return possible;
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

function getIssues(obj) {
  if (!obj) return [];
  if (Array.isArray(obj.inspectionIssues)) return obj.inspectionIssues;
  if (Array.isArray(obj.issues)) return obj.issues;
  return [];
}

function getActions(obj) {
  if (!obj) return [];

  if (Array.isArray(obj.solutionActions)) return obj.solutionActions;

  if (Array.isArray(obj.inspectionIssues)) {
    return obj.inspectionIssues.flatMap((issue) => issue.actions || []);
  }

  return [];
}

function getScanInfo(obj) {
  const scan = obj?.scanInfo || obj?.scan || obj?.security || {};

  const explicit =
    scan.scanned ??
    scan.isScanned ??
    scan.scanDone ??
    scan.verified ??
    scan.scanVerified ??
    obj?.scanned ??
    obj?.isScanned ??
    obj?.scanDone ??
    null;

  const hasExplicit =
    explicit !== null && explicit !== undefined && explicit !== "";

  const inferred =
    Boolean(obj?.id) &&
    Boolean(
      obj?.deviceId ||
        obj?.device?.id ||
        obj?.device?.deviceCode ||
        obj?.device?.barcode ||
        obj?.device?.secretCode
    );

  const scanned = hasExplicit ? boolFromAny(explicit) : inferred;

  const manualFallbackUsed = boolFromAny(
    scan.manualFallbackUsed ??
      scan.manualFallback ??
      scan.usedManualFallback ??
      obj?.manualFallbackUsed ??
      obj?.manualFallback
  );

  const qrAttempts =
    Number(
      scan.qrAttempts ??
        scan.scanAttempts ??
        scan.attempts ??
        obj?.qrAttempts ??
        obj?.scanAttempts ??
        0
    ) || 0;

  const scanMethod =
    scan.scanMethod ||
    scan.method ||
    obj?.scanMethod ||
    (scanned ? "VERIFIED_BY_INSPECTION" : "");

  const scanCodeType =
    scan.scanCodeType || scan.codeType || obj?.scanCodeType || "";

  const scanCodeValueMasked =
    scan.scanCodeValueMasked ||
    scan.maskedCode ||
    scan.masked ||
    obj?.scanCodeValueMasked ||
    "";

  return {
    scanned,
    manualFallbackUsed,
    qrAttempts,
    scanMethod,
    scanCodeType,
    scanCodeValueMasked,
    inferred: !hasExplicit && scanned,
  };
}

function getScanMethodText(obj) {
  const scan = getScanInfo(obj);
  const method = String(scan.scanMethod || "").toUpperCase();

  if (method === "VERIFIED_BY_INSPECTION") return "تم التحقق من الفحص";
  if (method === "QR" || method === "SECRET_QR") return "QR Code";
  if (method === "MANUAL" || method === "MANUAL_SEARCH") return "بحث يدوي";
  if (method === "BARCODE") return "Barcode";
  if (method === "SECRET_CODE") return "Secret Code";

  return scan.scanMethod || "—";
}

function getScanCodeTypeText(obj) {
  const scan = getScanInfo(obj);
  const type = String(scan.scanCodeType || "").toUpperCase();

  if (type === "SECRET_QR") return "QR سري";
  if (type === "BARCODE") return "Barcode";
  if (type === "DEVICE_CODE") return "كود الجهاز";
  if (type === "SERIAL_NUMBER") return "Serial Number";
  if (type === "SECRET_CODE") return "Secret Code";

  return scan.scanCodeType || "—";
}

function getStatusBefore(obj) {
  return (
    obj?.statusBeforeInspection ||
    obj?.beforeDeviceStatus ||
    obj?.beforeStatus ||
    obj?.deviceStatusBefore ||
    obj?.oldStatus ||
    null
  );
}

function getStatusAfter(obj) {
  return (
    obj?.statusAfterInspection ||
    obj?.afterDeviceStatus ||
    obj?.afterStatus ||
    obj?.currentDeviceStatus ||
    obj?.deviceStatusAfter ||
    obj?.device?.currentStatus ||
    null
  );
}

/* =========================
   CSS
========================= */

const CSS = `
html,
body,
#root {
  height: 100%;
}

body {
  overflow: hidden;
}

.inspections-page {
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

.inspections-shell {
  width: 100%;
  max-width: 1700px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 50px;
}

.insp-hero {
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

.insp-hero::before {
  content: "";
  position: absolute;
  width: 380px;
  height: 380px;
  right: -120px;
  top: -160px;
  background: radial-gradient(circle, rgba(99,102,241,.48), transparent 65%);
  border-radius: 50%;
}

.insp-hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.insp-title-wrap {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.insp-logo {
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

.insp-eyebrow {
  color: #c4b5fd;
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 1.3px;
  margin-bottom: 6px;
}

.insp-title {
  margin: 0;
  color: white;
  font-size: clamp(25px, 3vw, 38px);
  line-height: 1.06;
  font-weight: 950;
  letter-spacing: -1.3px;
}

.insp-subtitle {
  margin-top: 9px;
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 650;
  line-height: 1.65;
  max-width: 760px;
}

.insp-actions {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
}

.insp-btn {
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

.insp-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(15,23,42,.14);
}

.insp-btn.primary {
  color: white;
  border-color: transparent;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 14px 30px rgba(79,70,229,.30);
}

.insp-btn.glass {
  color: white;
  background: rgba(255,255,255,.10);
  border-color: rgba(255,255,255,.16);
  backdrop-filter: blur(10px);
}

.view-toggle {
  display: inline-flex;
  gap: 4px;
  padding: 4px;
  background: rgba(255,255,255,.10);
  border: 1px solid rgba(255,255,255,.15);
  border-radius: 14px;
}

.view-toggle button {
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

.view-toggle button.active {
  background: white;
  color: #0f172a;
}

.insp-error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 13px 15px;
  font-weight: 850;
  font-size: 13px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(140px, 1fr));
  gap: 12px;
}

.stat-card {
  background: rgba(255,255,255,.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 22px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  position: relative;
  overflow: hidden;
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

.filter-panel {
  background: rgba(255,255,255,.92);
  border: 1px solid rgba(255,255,255,.70);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.06);
  padding: 16px;
}

.filter-title {
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
  margin-bottom: 13px;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(230px, 2fr) repeat(4, minmax(130px, 1fr)) repeat(3, auto);
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

.filter-field input:focus,
.filter-field select:focus {
  background: white;
  border-color: rgba(79,70,229,.45);
  box-shadow: 0 0 0 4px rgba(79,70,229,.10);
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

.content-area {
  min-height: 300px;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

.inspection-card {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  overflow: hidden;
  cursor: pointer;
  transition: .18s ease;
}

.inspection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 48px rgba(15,23,42,.11);
}

.card-cover {
  height: 190px;
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
  background:
    linear-gradient(135deg, #eef2ff, #f8fafc);
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
  backdrop-filter: blur(8px);
}

.card-body {
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

.card-title {
  color: #0f172a;
  font-size: 17px;
  line-height: 1.25;
  font-weight: 950;
  margin-bottom: 8px;
}

.card-meta {
  color: #64748b;
  font-size: 12px;
  line-height: 1.65;
  font-weight: 700;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}

.table-card {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  overflow: hidden;
}

.table-scroll {
  width: 100%;
  max-height: calc(100vh - 390px);
  min-height: 360px;
  overflow: auto;
}

.insp-table {
  width: 100%;
  min-width: 1320px;
  border-collapse: collapse;
}

.insp-table th {
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

.insp-table td {
  padding: 12px 13px;
  border-bottom: 1px solid #f1f5f9;
  color: #0f172a;
  font-size: 13px;
  font-weight: 720;
  vertical-align: top;
}

.insp-table tr {
  cursor: pointer;
}

.insp-table tbody tr:hover td {
  background: #f8fafc;
}

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

.tag.good {
  background: #dcfce7;
  color: #15803d;
  border-color: #86efac;
}

.tag.bad {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.tag.warn {
  background: #fef9c3;
  color: #a16207;
  border-color: #fde68a;
}

.tag.muted {
  background: #f1f5f9;
  color: #475569;
  border-color: #e2e8f0;
}

.tag.info {
  background: #dbeafe;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.tag.purple {
  background: #f3e8ff;
  color: #7e22ce;
  border-color: #e9d5ff;
}

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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* MODAL */
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
  gap: 22px;
}

.section {
  border: 1px solid #e5e7eb;
  border-radius: 19px;
  padding: 18px;
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

.summary-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 14px;
  background: #f8fafc;
}

.summary-label {
  display: block;
  color: #64748b;
  font-size: 11px;
  font-weight: 950;
}

.summary-value {
  display: block;
  margin-top: 4px;
  color: #0f172a;
  font-size: 24px;
  font-weight: 950;
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

.issue-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  background: #f8fafc;
  margin-bottom: 12px;
}

.issue-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}

.issue-title {
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.issue-meta {
  font-size: 12px;
  color: #64748b;
  font-weight: 800;
  margin-top: 4px;
  line-height: 1.5;
}

.solution-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.solution-row {
  display: grid;
  grid-template-columns: 34px 1fr auto;
  gap: 10px;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 10px;
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4338ca;
  font-size: 12px;
  font-weight: 950;
}

.solution-title {
  color: #0f172a;
  font-size: 13px;
  font-weight: 950;
}

.solution-desc {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
  line-height: 1.5;
}

.done-time {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  margin-top: 4px;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.tl-item {
  display: flex;
  gap: 12px;
}

.tl-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.tl-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #64748b;
  margin-top: 4px;
  background: #fff;
}

.tl-dot.good {
  background: #dcfce7;
  border-color: #16a34a;
}

.tl-dot.bad {
  background: #fee2e2;
  border-color: #dc2626;
}

.tl-dot.warn {
  background: #fef9c3;
  border-color: #d97706;
}

.tl-dot.muted {
  background: #f1f5f9;
  border-color: #64748b;
}

.tl-line {
  width: 1px;
  flex: 1;
  min-height: 20px;
  background: #e5e7eb;
  margin: 3px 0;
}

.tl-right {
  padding-bottom: 16px;
}

.tl-time {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 950;
}

.tl-title {
  font-size: 13px;
  color: #0f172a;
  font-weight: 950;
  margin-top: 2px;
}

.tl-note {
  font-size: 12px;
  color: #64748b;
  font-weight: 700;
  margin-top: 2px;
  line-height: 1.5;
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

@media (max-width: 1350px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .filters-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 950px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .grid-view {
    grid-template-columns: 1fr;
  }

  .info-grid,
  .summary-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .insp-hero-inner {
    flex-direction: column;
  }

  .insp-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 560px) {
  .inspections-page {
    padding: 10px;
  }

  .stats-grid,
  .info-grid,
  .summary-row {
    grid-template-columns: 1fr;
  }

  .modal-body {
    padding: 18px;
  }

  .solution-row {
    grid-template-columns: 1fr;
  }
}
`;

function injectStyles() {
  if (document.getElementById("smartit-inspections-final-css")) return;

  const el = document.createElement("style");
  el.id = "smartit-inspections-final-css";
  el.textContent = CSS;
  document.head.appendChild(el);
}

/* =========================
   SMALL COMPONENTS
========================= */

function StatCard({ label, value, sub, color }) {
  return (
    <div className="stat-card" style={{ "--stat-color": color || "#4f46e5" }}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
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

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="inspections-page">
      <div className="state-card">
        <div>
          <div className="spinner" />
          جاري تحميل كل التفتيشات والصور...
        </div>
      </div>
    </div>
  );
}

/* =========================
   IMAGE COMPONENTS
========================= */

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
          <br />
          أو أن الباك إند عامل static files
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
        <div>Created: {fmtFull(img?.createdAt)}</div>
        <div style={{ wordBreak: "break-all" }}>Path: {safe(imagePath)}</div>
      </div>
    </div>
  );
}

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
      alt={`Inspection ${inspection.id}`}
      onError={() => setFailed(true)}
    />
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
   GRID CARD
========================= */

function InspectionCard({ inspection, apiBase, onOpen }) {
  const device = inspection.device || {};
  const loc = device.location || {};
  const tech = inspection.technician || {};
  const scan = getScanInfo(inspection);
  const images = getImages(inspection);
  const issues = getIssues(inspection);
  const actions = getActions(inspection);
  const doneActions = actions.filter((a) => a.status === "DONE");

  return (
    <div className="inspection-card" onClick={() => onOpen(inspection)}>
      <div className="card-cover">
        <FirstImagePreview inspection={inspection} apiBase={apiBase} />
        <div className="photo-count">📷 {images.length}</div>
      </div>

      <div className="card-body">
        <div className="card-topline">
          <span className="card-id">#{inspection.id}</span>
          <span className={`tag ${scan.scanned ? "good" : "warn"}`}>
            {scan.scanned ? "تم Scan" : "لم يتم Scan"}
          </span>
        </div>

        <div className="card-title">
          {device.deviceName || device.deviceCode || "Device"}
        </div>

        <div className="card-meta">
          Status: {arStatus(inspection.inspectionStatus)}
          <br />
          Technician:{" "}
          {tech.fullName || tech.username || tech.email || `#${inspection.technicianId || "—"}`}
          <br />
          Location: {safe(loc.building)} · {safe(loc.cluster)} · {safe(loc.zone)}
          <br />
          Date: {fmtFull(inspection.inspectedAt || inspection.createdAt)}
        </div>

        <div className="card-tags">
          <span className={`tag ${statusClass(inspection.inspectionStatus)}`}>
            {arStatus(inspection.inspectionStatus)}
          </span>
          <span className={images.length ? "tag good" : "tag info"}>
            {images.length} image
          </span>
          <span className={issues.length ? "tag warn" : "tag muted"}>
            {issues.length} issue
          </span>
          <span className={doneActions.length ? "tag good" : "tag muted"}>
            {doneActions.length}/{actions.length} actions
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   DETAILS MODAL
========================= */

function InspectionDetailsModal({ inspection, apiBase = "", onClose }) {
  const [detail, setDetail] = useState(inspection);
  const [loading, setLoading] = useState(Boolean(inspection?.id));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!inspection?.id) return;

    const controller = new AbortController();
    const base = getApiBase(apiBase);

    async function loadFullDetails() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${base}/inspections/full/${inspection.id}`, {
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        setDetail(data);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("تعذر تحميل التفاصيل الكاملة، سيتم عرض البيانات المتاحة.");
        setDetail(inspection);
      } finally {
        setLoading(false);
      }
    }

    loadFullDetails();

    return () => controller.abort();
  }, [inspection?.id, apiBase]);

  if (!inspection) return null;

  const d = detail || inspection;
  const device = d.device || {};
  const location = device.location || {};
  const deviceType = device.deviceType || {};
  const technician = d.technician || {};
  const task = d.task || {};

  const scan = getScanInfo(d);
  const images = getImages(d);
  const issues = getIssues(d);
  const actions = getActions(d);
  const history = Array.isArray(device.statusHistory) ? device.statusHistory : [];

  const doneActions = actions.filter((a) => a.status === "DONE").length;
  const failedActions = actions.filter((a) => a.status === "FAILED").length;
  const pendingActions = actions.filter((a) => a.status === "PENDING").length;

  const statusBefore = getStatusBefore(d) || "—";
  const statusAfter = getStatusAfter(d) || "—";

  const actionBySolutionId = new Map();

  actions.forEach((a) => {
    if (a.solutionId) actionBySolutionId.set(String(a.solutionId), a);
    if (a.solution?.id) actionBySolutionId.set(String(a.solution.id), a);
  });

  const timelineItems = [
    d.createdAt && {
      time: d.createdAt,
      status: "muted",
      title: "Inspection created",
      note: `Inspection #${d.id}`,
    },
    d.inspectedAt && {
      time: d.inspectedAt,
      status: d.inspectionStatus,
      title: `Inspection result: ${arStatus(d.inspectionStatus)}`,
      note: d.notes || d.issueReason || "—",
    },
    {
      time: d.inspectedAt || d.createdAt,
      status: scan.scanned ? "DONE" : "SKIPPED",
      title: scan.scanned ? "Scan Done" : "No Scan",
      note: `Method: ${getScanMethodText(d)} · Type: ${getScanCodeTypeText(
        d
      )} · QR attempts: ${scan.qrAttempts} · Manual fallback: ${
        scan.manualFallbackUsed ? "Yes" : "No"
      }`,
    },
    ...history.map((h) => ({
      time: h.changedAt,
      status: h.newStatus,
      title: `Device status changed: ${arStatus(h.oldStatus)} → ${arStatus(
        h.newStatus
      )}`,
      note: `${h.note || "—"} ${
        h.changedBy
          ? `· By ${
              h.changedBy.fullName ||
              h.changedBy.username ||
              h.changedBy.email ||
              "—"
            }`
          : ""
      }`,
    })),
    ...actions.map((a) => ({
      time: a.doneAt || a.updatedAt || a.createdAt,
      status: a.status,
      title: `Solution action: ${a.solution?.title || `#${a.solutionId}`}`,
      note: `${arStatus(a.status)} ${
        a.technician
          ? `· By ${a.technician.fullName || a.technician.username || "—"}`
          : ""
      } ${a.note ? `· Note: ${a.note}` : ""}`,
    })),
    d.updatedAt && {
      time: d.updatedAt,
      status: "muted",
      title: "Inspection updated",
      note: `Updated at ${fmtFull(d.updatedAt)}`,
    },
  ]
    .filter(Boolean)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="modal-eyebrow">
              Inspection #{d.id} · {fmtFull(d.inspectedAt || d.createdAt)}
            </span>

            <div className="modal-title">
              {device.deviceName || device.deviceCode || "Device"} —{" "}
              {arStatus(d.inspectionStatus)}
            </div>

            <div className="modal-sub">
              Technician:{" "}
              {technician.fullName ||
                technician.username ||
                technician.email ||
                `#${d.technicianId || "—"}`}
            </div>

            <div className="modal-tags">
              <span className={`tag ${statusClass(d.inspectionStatus)}`}>
                {arStatus(d.inspectionStatus)}
              </span>

              <span className={`tag ${scan.scanned ? "good" : "warn"}`}>
                {scan.scanned ? "تم Scan" : "لم يتم Scan"}
              </span>

              <span className={images.length > 0 ? "tag good" : "tag info"}>
                {images.length} image
              </span>

              <span className="tag purple">{issues.length} issue</span>

              <span className="tag good">
                Done {doneActions}/{actions.length}
              </span>
            </div>
          </div>

          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="state-card">
              <div>
                <div className="spinner" />
                جاري تحميل كل تفاصيل الفحص...
              </div>
            </div>
          ) : (
            <>
              {error && <div className="insp-error">{error}</div>}

              <div className="section">
                <div className="section-title">Full summary</div>
                <div className="summary-row">
                  <SummaryCard label="Scan" value={scan.scanned ? "Yes" : "No"} />
                  <SummaryCard label="Images" value={images.length} />
                  <SummaryCard label="Issues" value={issues.length} />
                  <SummaryCard
                    label="Actions"
                    value={`${doneActions}/${actions.length}`}
                  />
                  <SummaryCard label="QR Attempts" value={scan.qrAttempts} />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Scan / Security information</div>

                <div className="info-grid">
                  <InfoBox
                    label="Scan Status"
                    value={scan.scanned ? "تم عمل Scan" : "لم يتم عمل Scan"}
                  />
                  <InfoBox label="Scan Method" value={getScanMethodText(d)} />
                  <InfoBox label="Scan Code Type" value={getScanCodeTypeText(d)} />
                  <InfoBox label="Masked Code" value={scan.scanCodeValueMasked} />
                  <InfoBox label="QR Attempts" value={scan.qrAttempts} />
                  <InfoBox
                    label="Manual Fallback"
                    value={
                      scan.manualFallbackUsed
                        ? "تم استخدام البحث اليدوي"
                        : "لم يتم استخدام البحث اليدوي"
                    }
                  />
                  <InfoBox
                    label="Verified"
                    value={scan.scanned ? "Verified" : "Not Verified"}
                  />
                  <InfoBox
                    label="Security Note"
                    value={
                      scan.inferred && scan.scanned
                        ? "تم اعتبار الفحص Verified لأنه مربوط بجهاز"
                        : scan.scanned
                        ? "تم التحقق من الجهاز"
                        : "لم يتم تسجيل Scan"
                    }
                  />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Inspection main information</div>

                <div className="info-grid">
                  <InfoBox label="Inspection ID" value={d.id} />
                  <InfoBox
                    label="Inspection Status"
                    value={arStatus(d.inspectionStatus)}
                  />
                  <InfoBox label="Original Status" value={d.inspectionStatus} />
                  <InfoBox label="Issue Reason" value={d.issueReason} />
                  <InfoBox label="Notes" value={d.notes} />
                  <InfoBox label="Inspected At" value={fmtFull(d.inspectedAt)} />
                  <InfoBox label="Created At" value={fmtFull(d.createdAt)} />
                  <InfoBox label="Updated At" value={fmtFull(d.updatedAt)} />
                  <InfoBox label="Location Text" value={d.locationText} />
                  <InfoBox label="Latitude" value={d.latitude} />
                  <InfoBox label="Longitude" value={d.longitude} />
                  <InfoBox
                    label="GPS"
                    value={
                      d.latitude && d.longitude
                        ? `${d.latitude}, ${d.longitude}`
                        : "—"
                    }
                  />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Device status before / after</div>

                <div className="info-grid">
                  <InfoBox label="Before" value={arStatus(statusBefore)} />
                  <InfoBox label="After" value={arStatus(statusAfter)} />
                  <InfoBox
                    label="Device Current Status"
                    value={arStatus(device.currentStatus)}
                  />
                  <InfoBox
                    label="Last Inspection At"
                    value={fmtFull(device.lastInspectionAt)}
                  />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Technician information</div>

                <div className="info-grid">
                  <InfoBox
                    label="Technician ID"
                    value={technician.id || d.technicianId}
                  />
                  <InfoBox label="Full Name" value={technician.fullName} />
                  <InfoBox label="Username" value={technician.username} />
                  <InfoBox label="Email" value={technician.email} />
                  <InfoBox label="Phone" value={technician.phone} />
                  <InfoBox label="Job Title" value={technician.jobTitle} />
                  <InfoBox label="Role" value={technician.role?.name} />
                  <InfoBox label="Actions Done" value={doneActions} />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Device information</div>

                <div className="info-grid">
                  <InfoBox label="Device ID" value={device.id || d.deviceId} />
                  <InfoBox label="Device Code" value={device.deviceCode} />
                  <InfoBox label="Device Name" value={device.deviceName} />
                  <InfoBox label="Barcode" value={device.barcode} />
                  <InfoBox label="Serial Number" value={device.serialNumber} />
                  <InfoBox label="Manufacturer" value={device.manufacturer} />
                  <InfoBox label="Model Number" value={device.modelNumber} />
                  <InfoBox label="Device Type" value={deviceType.name} />
                  <InfoBox label="Device Type ID" value={device.deviceTypeId} />
                  <InfoBox label="IP Address" value={device.ipAddress} />
                  <InfoBox label="Firmware" value={device.firmware} />
                  <InfoBox label="Excel Status" value={device.excelStatus} />
                  <InfoBox label="Excel Date" value={device.excelDate} />
                  <InfoBox label="Install Date" value={fmtFull(device.installDate)} />
                  <InfoBox label="Notes" value={device.notes} />
                  <InfoBox label="Created At" value={fmtFull(device.createdAt)} />
                  <InfoBox label="Updated At" value={fmtFull(device.updatedAt)} />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Location information</div>

                <div className="info-grid">
                  <InfoBox
                    label="Location ID"
                    value={location.id || device.locationId}
                  />
                  <InfoBox label="Cluster" value={location.cluster} />
                  <InfoBox label="Building" value={location.building} />
                  <InfoBox label="Zone" value={location.zone} />
                  <InfoBox label="Lane" value={location.lane} />
                  <InfoBox label="Direction" value={location.direction} />
                  <InfoBox label="Type" value={location.type} />
                  <InfoBox label="Excel ID" value={location.excelId} />
                  <InfoBox label="Created At" value={fmtFull(location.createdAt)} />
                  <InfoBox label="Updated At" value={fmtFull(location.updatedAt)} />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Task information</div>

                {!task || !task.id ? (
                  <div className="empty">لا يوجد Task مربوط بهذا الفحص.</div>
                ) : (
                  <div className="info-grid">
                    <InfoBox label="Task ID" value={task.id || d.taskId} />
                    <InfoBox label="Task Status" value={arStatus(task.status)} />
                    <InfoBox
                      label="Scheduled Date"
                      value={fmtFull(task.scheduledDate)}
                    />
                    <InfoBox label="Frequency" value={task.frequency} />
                    <InfoBox label="Task Notes" value={task.notes} />
                    <InfoBox label="Created At" value={fmtFull(task.createdAt)} />
                    <InfoBox label="Updated At" value={fmtFull(task.updatedAt)} />
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">
                  Uploaded inspection images ({images.length})
                </div>

                {images.length === 0 ? (
                  <div className="empty">لا توجد صور مرفوعة لهذا الفحص.</div>
                ) : (
                  <div className="image-grid">
                    {images.map((img, index) => (
                      <InspectionImage
                        key={img?.id || getImagePath(img) || index}
                        img={img}
                        index={index}
                        inspectionId={d.id}
                        apiBase={apiBase}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">
                  Issues and solution steps — Done {doneActions}/{actions.length}
                </div>

                {issues.length === 0 ? (
                  <div className="empty">لا توجد مشاكل مسجلة على هذا الفحص.</div>
                ) : (
                  issues.map((item, itemIndex) => {
                    const issue = item.issue || item;
                    const solutions = issue.solutions || [];
                    const issueActions = item.actions || [];

                    return (
                      <div className="issue-card" key={item.id || itemIndex}>
                        <div className="issue-head">
                          <div>
                            <div className="issue-title">
                              {issue.title || issue.issueTitle || "Issue"}
                            </div>

                            <div className="issue-meta">
                              Inspection Issue ID: {safe(item.id)} · Issue ID:{" "}
                              {safe(issue.id || item.issueId)} · Code:{" "}
                              {safe(issue.issueCode)} · Category:{" "}
                              {safe(issue.category?.name)} · Severity:{" "}
                              {safe(issue.severity)}
                            </div>

                            <div className="issue-meta">
                              Status: {arStatus(item.status)} · Reported By:{" "}
                              {safe(
                                item.reportedBy?.fullName ||
                                  item.reportedBy?.username ||
                                  item.reportedById
                              )}
                            </div>

                            {issue.description && (
                              <div className="issue-meta">
                                Description: {issue.description}
                              </div>
                            )}

                            {item.notes && (
                              <div className="issue-meta">Notes: {item.notes}</div>
                            )}

                            {item.resolvedAt && (
                              <div className="issue-meta">
                                Resolved At: {fmtFull(item.resolvedAt)}
                              </div>
                            )}

                            {item.unresolvedReason && (
                              <div className="issue-meta">
                                Unresolved Reason: {item.unresolvedReason}
                              </div>
                            )}
                          </div>

                          <span className={`tag ${statusClass(item.status)}`}>
                            {arStatus(item.status)}
                          </span>
                        </div>

                        {solutions.length === 0 && issueActions.length === 0 ? (
                          <div className="empty">
                            لا توجد خطوات حل لهذه المشكلة.
                          </div>
                        ) : (
                          <div className="solution-list">
                            {solutions.map((sol, solIndex) => {
                              const action =
                                actionBySolutionId.get(String(sol.id)) ||
                                issueActions.find(
                                  (a) =>
                                    String(a.solutionId) === String(sol.id) ||
                                    String(a.solution?.id) === String(sol.id)
                                );

                              const st = action?.status || "PENDING";

                              return (
                                <div
                                  className="solution-row"
                                  key={sol.id || solIndex}
                                >
                                  <div className="step-num">
                                    {sol.stepOrder || solIndex + 1}
                                  </div>

                                  <div>
                                    <div className="solution-title">
                                      {sol.title || "Solution step"}
                                    </div>

                                    {sol.solutionCode && (
                                      <div className="solution-desc">
                                        Solution Code: {sol.solutionCode}
                                      </div>
                                    )}

                                    {sol.description && (
                                      <div className="solution-desc">
                                        {sol.description}
                                      </div>
                                    )}

                                    <div className="solution-desc">
                                      Required: {sol.isRequired ? "Yes" : "No"} ·
                                      Step Status: {arStatus(sol.status)}
                                    </div>

                                    {action && (
                                      <>
                                        <div className="solution-desc">
                                          Action ID: {safe(action.id)} ·
                                          Technician:{" "}
                                          {safe(
                                            action.technician?.fullName ||
                                              action.technician?.username ||
                                              action.technicianId
                                          )}
                                        </div>

                                        {action.note && (
                                          <div className="solution-desc">
                                            Technician note: {action.note}
                                          </div>
                                        )}

                                        <div className="done-time">
                                          Created: {fmtFull(action.createdAt)} ·
                                          Updated: {fmtFull(action.updatedAt)}
                                        </div>

                                        {action.doneAt && (
                                          <div className="done-time">
                                            Done at: {fmtFull(action.doneAt)}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  <span className={`tag ${statusClass(st)}`}>
                                    {arStatus(st)}
                                  </span>
                                </div>
                              );
                            })}

                            {solutions.length === 0 &&
                              issueActions.map((action, actionIndex) => (
                                <div
                                  className="solution-row"
                                  key={action.id || actionIndex}
                                >
                                  <div className="step-num">{actionIndex + 1}</div>

                                  <div>
                                    <div className="solution-title">
                                      {action.solution?.title ||
                                        `Solution #${action.solutionId}`}
                                    </div>

                                    {action.solution?.description && (
                                      <div className="solution-desc">
                                        {action.solution.description}
                                      </div>
                                    )}

                                    {action.note && (
                                      <div className="solution-desc">
                                        Technician note: {action.note}
                                      </div>
                                    )}

                                    <div className="done-time">
                                      Done at: {fmtFull(action.doneAt)}
                                    </div>
                                  </div>

                                  <span
                                    className={`tag ${statusClass(action.status)}`}
                                  >
                                    {arStatus(action.status)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="section">
                <div className="section-title">All solution actions</div>

                {actions.length === 0 ? (
                  <div className="empty">
                    لا توجد خطوات منفذة مسجلة لهذا الفحص.
                  </div>
                ) : (
                  <div className="solution-list">
                    {actions.map((action, index) => (
                      <div className="solution-row" key={action.id || index}>
                        <div className="step-num">{index + 1}</div>

                        <div>
                          <div className="solution-title">
                            {action.solution?.title ||
                              action.inspectionIssue?.issue?.title ||
                              `Action #${action.id}`}
                          </div>

                          <div className="solution-desc">
                            Action ID: {safe(action.id)} · Solution ID:{" "}
                            {safe(action.solutionId)} · Inspection Issue ID:{" "}
                            {safe(action.inspectionIssueId)}
                          </div>

                          <div className="solution-desc">
                            Technician:{" "}
                            {safe(
                              action.technician?.fullName ||
                                action.technician?.username ||
                                action.technicianId
                            )}
                          </div>

                          {action.note && (
                            <div className="solution-desc">Note: {action.note}</div>
                          )}

                          <div className="done-time">
                            Created: {fmtFull(action.createdAt)} · Updated:{" "}
                            {fmtFull(action.updatedAt)} · Done:{" "}
                            {fmtFull(action.doneAt)}
                          </div>
                        </div>

                        <span className={`tag ${statusClass(action.status)}`}>
                          {arStatus(action.status)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">Device status history</div>

                {history.length === 0 ? (
                  <div className="empty">لا يوجد تاريخ تغيير حالة للجهاز.</div>
                ) : (
                  <div className="timeline">
                    {history.map((h, index) => (
                      <div className="tl-item" key={h.id || index}>
                        <div className="tl-left">
                          <div className={`tl-dot ${statusClass(h.newStatus)}`} />
                          {index < history.length - 1 && <div className="tl-line" />}
                        </div>

                        <div className="tl-right">
                          <div className="tl-time">{fmtFull(h.changedAt)}</div>
                          <div className="tl-title">
                            {arStatus(h.oldStatus)} → {arStatus(h.newStatus)}
                          </div>
                          <div className="tl-note">
                            History ID: {safe(h.id)} · Changed By:{" "}
                            {safe(
                              h.changedBy?.fullName ||
                                h.changedBy?.username ||
                                h.changedById
                            )}{" "}
                            · Note: {safe(h.note)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">Full timeline</div>

                {timelineItems.length === 0 ? (
                  <div className="empty">لا يوجد Timeline لهذا الفحص.</div>
                ) : (
                  <div className="timeline">
                    {timelineItems.map((item, index) => (
                      <div className="tl-item" key={index}>
                        <div className="tl-left">
                          <div className={`tl-dot ${statusClass(item.status)}`} />
                          {index < timelineItems.length - 1 && (
                            <div className="tl-line" />
                          )}
                        </div>

                        <div className="tl-right">
                          <div className="tl-time">{fmtFull(item.time)}</div>
                          <div className="tl-title">{item.title}</div>
                          <div className="tl-note">{item.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   MAIN PAGE
========================= */

export function InspectionsPage({
  inspections: propInspections,
  technicians = [],
  locations = [],
  apiBase = "",
}) {
  injectStyles();

  const [inspections, setInspections] = useState(
    Array.isArray(propInspections) ? propInspections : []
  );

  const [loading, setLoading] = useState(!Array.isArray(propInspections));
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("GRID");

  const [selectedInspection, setSelectedInspection] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [techId, setTechId] = useState("");
  const [cluster, setCluster] = useState("");
  const [building, setBuilding] = useState("");
  const [monthlyOnly, setMonthlyOnly] = useState(false);
  const [scanOnly, setScanOnly] = useState(false);
  const [manualFallbackOnly, setManualFallbackOnly] = useState(false);

  const base = getApiBase(apiBase);

  const loadInspections = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken");

      const res = await fetch(`${base}/inspections`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.result)
        ? data.result
        : [];

      setInspections(list);
    } catch (err) {
      console.error(err);
      setError("تعذر تحميل التفتيشات من الباك إند.");
    } finally {
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    if (Array.isArray(propInspections)) {
      setInspections(propInspections);
      setLoading(false);
      return;
    }

    loadInspections();
  }, [propInspections, loadInspections]);

  const clusters = useMemo(() => {
    const fromInspections = [
      ...new Set(
        inspections.map((i) => i.device?.location?.cluster).filter(Boolean)
      ),
    ].sort();

    if (fromInspections.length) return fromInspections;

    return [...new Set(locations.map((l) => l.cluster).filter(Boolean))].sort();
  }, [inspections, locations]);

  const buildings = useMemo(() => {
    const fromInspections = [
      ...new Set(
        inspections.map((i) => i.device?.location?.building).filter(Boolean)
      ),
    ].sort();

    if (fromInspections.length) return fromInspections;

    return [...new Set(locations.map((l) => l.building).filter(Boolean))].sort();
  }, [inspections, locations]);

  const statuses = useMemo(
    () => [...new Set(inspections.map((i) => i.inspectionStatus).filter(Boolean))],
    [inspections]
  );

  const techOptions = useMemo(() => {
    const map = new Map();

    technicians.forEach((t) => {
      if (t?.id) map.set(String(t.id), t);
    });

    inspections.forEach((i) => {
      const t = i.technician;
      const id = i.technicianId || t?.id;
      if (id && !map.has(String(id))) {
        map.set(String(id), {
          id,
          fullName: t?.fullName,
          username: t?.username,
          email: t?.email,
        });
      }
    });

    return Array.from(map.values());
  }, [technicians, inspections]);

  const stats = useMemo(() => {
    const total = inspections.length;
    const ok = inspections.filter((i) => i.inspectionStatus === "OK").length;
    const notOk = inspections.filter((i) => i.inspectionStatus === "NOT_OK").length;
    const partial = inspections.filter((i) => i.inspectionStatus === "PARTIAL").length;
    const notReachable = inspections.filter(
      (i) => i.inspectionStatus === "NOT_REACHABLE"
    ).length;

    const imagesCount = inspections.reduce(
      (sum, i) => sum + getImages(i).length,
      0
    );

    const issuesCount = inspections.reduce(
      (sum, i) => sum + getIssues(i).length,
      0
    );

    const actionsCount = inspections.reduce(
      (sum, i) => sum + getActions(i).length,
      0
    );

    const doneActions = inspections.reduce(
      (sum, i) => sum + getActions(i).filter((a) => a.status === "DONE").length,
      0
    );

    const scannedCount = inspections.filter((i) => getScanInfo(i).scanned).length;
    const notScannedCount = total - scannedCount;

    const manualFallbackCount = inspections.filter(
      (i) => getScanInfo(i).manualFallbackUsed
    ).length;

    return {
      total,
      ok,
      notOk,
      partial,
      notReachable,
      imagesCount,
      issuesCount,
      actionsCount,
      doneActions,
      scannedCount,
      notScannedCount,
      manualFallbackCount,
    };
  }, [inspections]);

  const filtered = useMemo(() => {
    const now = new Date();
    const q = search.trim().toLowerCase();

    return inspections.filter((ins) => {
      const device = ins.device || {};
      const loc = device.location || {};
      const tech = ins.technician || {};
      const scan = getScanInfo(ins);

      if (status && ins.inspectionStatus !== status) return false;

      if (techId) {
        const currentTechId = ins.technicianId || tech.id;
        if (String(currentTechId) !== String(techId)) return false;
      }

      if (cluster && loc.cluster !== cluster) return false;
      if (building && loc.building !== building) return false;
      if (scanOnly && !scan.scanned) return false;
      if (manualFallbackOnly && !scan.manualFallbackUsed) return false;

      if (monthlyOnly) {
        const date = new Date(ins.inspectedAt || ins.createdAt);

        if (
          date.getMonth() !== now.getMonth() ||
          date.getFullYear() !== now.getFullYear()
        ) {
          return false;
        }
      }

      if (q) {
        const text = [
          ins.id,
          ins.inspectionStatus,
          ins.issueReason,
          ins.notes,
          getStatusBefore(ins),
          getStatusAfter(ins),
          scan.scanned ? "scanned تم scan" : "not scanned لم يتم scan",
          scan.scanMethod,
          scan.scanCodeType,
          scan.scanCodeValueMasked,
          device.id,
          device.deviceCode,
          device.deviceName,
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
          tech.username,
          tech.email,
          getImages(ins).map(getImagePath).join(" "),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!text.includes(q)) return false;
      }

      return true;
    });
  }, [
    inspections,
    search,
    status,
    techId,
    cluster,
    building,
    monthlyOnly,
    scanOnly,
    manualFallbackOnly,
  ]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setTechId("");
    setCluster("");
    setBuilding("");
    setMonthlyOnly(false);
    setScanOnly(false);
    setManualFallbackOnly(false);
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="inspections-page">
      <div className="inspections-shell">
        <section className="insp-hero">
          <div className="insp-hero-inner">
            <div className="insp-title-wrap">
              <div className="insp-logo">🔍</div>

              <div>
                <div className="insp-eyebrow">SmartIT Inspect</div>
                <h1 className="insp-title">Inspections Dashboard</h1>
                <div className="insp-subtitle">
                  كل التفتيشات + حالة الـ Scan + الصور + الفني + الجهاز + الموقع.
                  الصفحة دلوقتي فيها Scroll كامل، Grid/List، والصور تظهر في الكروت
                  والتفاصيل.
                </div>
              </div>
            </div>

            <div className="insp-actions">
              <div className="view-toggle">
                <button
                  className={viewMode === "GRID" ? "active" : ""}
                  onClick={() => setViewMode("GRID")}
                >
                  Grid
                </button>

                <button
                  className={viewMode === "LIST" ? "active" : ""}
                  onClick={() => setViewMode("LIST")}
                >
                  List
                </button>
              </div>

              <button className="insp-btn glass" onClick={loadInspections}>
                ↻ Refresh Data
              </button>

              <button className="insp-btn primary" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        </section>

        {error && <div className="insp-error">⚠ {error}</div>}

        <section className="stats-grid">
          <StatCard
            label="Total"
            value={stats.total}
            sub="all records"
            color="#4f46e5"
          />
          <StatCard
            label="Scanned"
            value={stats.scannedCount}
            sub="تم Scan"
            color="#16a34a"
          />
          <StatCard
            label="Not scanned"
            value={stats.notScannedCount}
            sub="لم يتم Scan"
            color="#f59e0b"
          />
          <StatCard
            label="Images"
            value={stats.imagesCount}
            sub="uploaded photos"
            color="#0ea5e9"
          />
          <StatCard label="OK" value={stats.ok} sub="سليم" color="#22c55e" />
          <StatCard
            label="Faults"
            value={stats.notOk}
            sub="عطل كامل"
            color="#ef4444"
          />
          <StatCard
            label="Partial"
            value={stats.partial}
            sub="عطل جزئي"
            color="#f59e0b"
          />
          <StatCard
            label="Not reachable"
            value={stats.notReachable}
            sub="غير متاح"
            color="#64748b"
          />
          <StatCard
            label="Issues"
            value={stats.issuesCount}
            sub="reported issues"
            color="#a855f7"
          />
          <StatCard
            label="Done actions"
            value={`${stats.doneActions}/${stats.actionsCount}`}
            sub="solution actions"
            color="#10b981"
          />
          <StatCard
            label="Manual fallback"
            value={stats.manualFallbackCount}
            sub="after QR attempts"
            color="#f97316"
          />
        </section>

        <section className="filter-panel">
          <div className="filter-title">Inspection filters</div>

          <div className="filters-grid">
            <div className="filter-field">
              <label>Search</label>
              <input
                type="text"
                value={search}
                placeholder="device / serial / technician / scan / issue..."
                onChange={(e) => setSearch(e.target.value)}
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
              <select value={techId} onChange={(e) => setTechId(e.target.value)}>
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
              <select
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              >
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
                checked={monthlyOnly}
                onChange={(e) => setMonthlyOnly(e.target.checked)}
              />
              Current month
            </label>

            <label className="check-pill">
              <input
                type="checkbox"
                checked={scanOnly}
                onChange={(e) => setScanOnly(e.target.checked)}
              />
              Scanned only
            </label>

            <label className="check-pill">
              <input
                type="checkbox"
                checked={manualFallbackOnly}
                onChange={(e) => setManualFallbackOnly(e.target.checked)}
              />
              Manual fallback
            </label>
          </div>
        </section>

        <section className="content-area">
          {filtered.length === 0 ? (
            <div className="state-card">لا توجد بيانات مطابقة للفلاتر.</div>
          ) : viewMode === "GRID" ? (
            <div className="grid-view">
              {filtered.map((row) => (
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
              <div className="table-scroll">
                <table className="insp-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Images</th>
                      <th>Scan</th>
                      <th>Status</th>
                      <th>Device</th>
                      <th>Technician</th>
                      <th>Location</th>
                      <th>Issues</th>
                      <th>Actions</th>
                      <th>Inspected At</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((row) => {
                      const device = row.device || {};
                      const loc = device.location || {};
                      const tech = row.technician || {};
                      const scan = getScanInfo(row);
                      const images = getImages(row);
                      const issues = getIssues(row);
                      const actions = getActions(row);
                      const doneActions = actions.filter(
                        (a) => a.status === "DONE"
                      );

                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedInspection(row)}
                        >
                          <td>#{row.id}</td>

                          <td>
                            <TableThumbs inspection={row} apiBase={base} />
                          </td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 4,
                              }}
                            >
                              <span
                                className={`tag ${
                                  scan.scanned ? "good" : "warn"
                                }`}
                              >
                                {scan.scanned ? "تم Scan" : "لم يتم Scan"}
                              </span>

                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#64748b",
                                  fontWeight: 800,
                                }}
                              >
                                {getScanMethodText(row)} · QR: {scan.qrAttempts}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`tag ${statusClass(
                                row.inspectionStatus
                              )}`}
                            >
                              {arStatus(row.inspectionStatus)}
                            </span>
                          </td>

                          <td>
                            <div style={{ fontWeight: 950 }}>
                              {device.deviceName || device.deviceCode || "—"}
                            </div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>
                              Code: {safe(device.deviceCode)} · SN:{" "}
                              {safe(device.serialNumber)}
                            </div>
                          </td>

                          <td>
                            {tech.fullName ||
                              tech.username ||
                              tech.email ||
                              `#${row.technicianId || "—"}`}
                          </td>

                          <td>
                            <div>{safe(loc.building)}</div>
                            <div style={{ color: "#64748b", fontSize: 11 }}>
                              {safe(loc.cluster)} · {safe(loc.zone)} ·{" "}
                              {safe(loc.lane)}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`tag ${
                                issues.length ? "warn" : "muted"
                              }`}
                            >
                              {issues.length} issue
                            </span>
                          </td>

                          <td>
                            <span
                              className={`tag ${
                                doneActions.length ? "good" : "muted"
                              }`}
                            >
                              {doneActions.length}/{actions.length}
                            </span>
                          </td>

                          <td>{fmtDate(row.inspectedAt || row.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>

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

export default InspectionsPage;