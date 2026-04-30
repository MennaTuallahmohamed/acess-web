import { useEffect, useMemo, useState, useCallback } from "react";
import { DataGrid } from "../components/DataGrid";

function fmtDate(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtFull(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
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

function getApiBase(apiBase) {
  const DEFAULT_API_BASE_URL =
    "https://acess-backend-production.up.railway.app";

  const cleanApiBase = String(apiBase || "")
    .trim()
    .replace(/\/+$/, "");

  if (
    cleanApiBase &&
    !cleanApiBase.includes("localhost") &&
    !cleanApiBase.includes("127.0.0.1")
  ) {
    return cleanApiBase;
  }

  const savedBaseUrl = String(
    localStorage.getItem("dashboard_api_base_url") || ""
  )
    .trim()
    .replace(/\/+$/, "");

  if (
    savedBaseUrl &&
    !savedBaseUrl.includes("localhost") &&
    !savedBaseUrl.includes("127.0.0.1")
  ) {
    return savedBaseUrl;
  }

  return DEFAULT_API_BASE_URL;
}

function fixImageUrl(url, apiBase = "") {
  if (!url) return "";

  const DEFAULT_API_BASE_URL =
    "https://acess-backend-production.up.railway.app";

  const raw = String(url).replace(/\\/g, "/").trim();

  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw
      .replace("http://localhost:3000", DEFAULT_API_BASE_URL)
      .replace("https://localhost:3000", DEFAULT_API_BASE_URL)
      .replace("http://127.0.0.1:3000", DEFAULT_API_BASE_URL)
      .replace("https://127.0.0.1:3000", DEFAULT_API_BASE_URL);
  }

  const base = getApiBase(apiBase);
  const cleanUrl = raw.startsWith("/") ? raw.slice(1) : raw;

  return `${base}/${cleanUrl}`;
}

function unique(arr, getter) {
  return [...new Set(arr.map(getter).filter(Boolean))].sort();
}

function safeValue(value) {
  if (value === undefined || value === null || value === "") return "—";
  return value;
}

function getInspectionImages(obj) {
  if (!obj) return [];

  if (Array.isArray(obj.images)) return obj.images;
  if (Array.isArray(obj.inspectionImages)) return obj.inspectionImages;
  if (Array.isArray(obj.InspectionImage)) return obj.InspectionImage;
  if (Array.isArray(obj.inspectionImage)) return obj.inspectionImage;

  return [];
}

function getImagesCount(obj) {
  const images = getInspectionImages(obj);

  if (images.length > 0) return images.length;
  if (obj?.summary?.imagesCount != null) return Number(obj.summary.imagesCount) || 0;
  if (obj?._count?.images != null) return Number(obj._count.images) || 0;
  if (obj?._count?.inspectionImages != null) {
    return Number(obj._count.inspectionImages) || 0;
  }

  return 0;
}

function getSolutionActions(obj) {
  if (!obj) return [];

  if (Array.isArray(obj.solutionActions)) return obj.solutionActions;

  if (Array.isArray(obj.inspectionIssues)) {
    return obj.inspectionIssues.flatMap((issue) => issue.actions || []);
  }

  return [];
}

function getDoneSummary(obj) {
  const actions = getSolutionActions(obj);

  return {
    total: actions.length,
    done: actions.filter((a) => a.status === "DONE").length,
    failed: actions.filter((a) => a.status === "FAILED").length,
    pending: actions.filter((a) => a.status === "PENDING").length,
    skipped: actions.filter((a) => a.status === "SKIPPED").length,
  };
}

function getIssueList(obj) {
  if (!obj) return [];
  if (Array.isArray(obj.inspectionIssues)) return obj.inspectionIssues;
  if (Array.isArray(obj.issues)) return obj.issues;
  return [];
}

function getScanInfo(obj) {
  return obj?.scanInfo || {};
}

function getScanLabel(obj) {
  const scan = getScanInfo(obj);

  if (scan.scanned === true) return "تم عمل Scan";
  if (scan.scanned === false) return "لم يتم Scan";

  return "—";
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

const CSS = `
.insp-page {
  display:flex;
  flex-direction:column;
  gap:20px;
  height:100%;
}

.insp-stats {
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(145px,1fr));
  gap:12px;
}

.insp-stat {
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:16px 18px;
  box-shadow:0 10px 24px rgba(15,23,42,.05);
}

.insp-stat__label {
  font-size:12px;
  color:#64748b;
  font-weight:700;
}

.insp-stat__val {
  display:block;
  font-size:28px;
  font-weight:900;
  color:#0f172a;
  margin-top:4px;
}

.insp-stat__sub {
  display:block;
  font-size:11px;
  color:#94a3b8;
  margin-top:2px;
  font-weight:700;
}

.insp-config {
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:18px 20px;
  box-shadow:0 10px 24px rgba(15,23,42,.04);
}

.insp-config__title {
  font-size:16px;
  font-weight:900;
  color:#0f172a;
  margin-bottom:14px;
}

.insp-filters {
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  align-items:flex-end;
}

.insp-filter {
  display:flex;
  flex-direction:column;
  gap:6px;
}

.insp-filter__label {
  font-size:12px;
  color:#64748b;
  font-weight:800;
}

.insp-filter input,
.insp-filter select {
  height:38px;
  min-width:170px;
  border:1px solid #d1d5db;
  border-radius:10px;
  padding:0 11px;
  background:#fff;
  outline:none;
  font-size:13px;
  color:#111827;
}

.insp-filter input:focus,
.insp-filter select:focus {
  border-color:#4f46e5;
  box-shadow:0 0 0 3px rgba(79,70,229,.13);
}

.insp-check {
  height:38px;
  display:flex;
  align-items:center;
  gap:8px;
  font-size:13px;
  color:#334155;
  font-weight:800;
}

.insp-check input {
  width:16px;
  height:16px;
  accent-color:#4f46e5;
}

.tag {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:5px;
  padding:4px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:900;
  border:1px solid transparent;
  white-space:nowrap;
}

.tag.good {
  background:#dcfce7;
  color:#15803d;
  border-color:#86efac;
}

.tag.bad {
  background:#fee2e2;
  color:#b91c1c;
  border-color:#fecaca;
}

.tag.warn {
  background:#fef9c3;
  color:#a16207;
  border-color:#fde68a;
}

.tag.muted {
  background:#f1f5f9;
  color:#475569;
  border-color:#e2e8f0;
}

.tag.info {
  background:#dbeafe;
  color:#1d4ed8;
  border-color:#bfdbfe;
}

.tag.purple {
  background:#f3e8ff;
  color:#7e22ce;
  border-color:#e9d5ff;
}

.loc-excel {
  display:inline-block;
  font-family:monospace;
  font-size:12px;
  background:#f8fafc;
  color:#0f172a;
  padding:2px 8px;
  border-radius:6px;
  border:1px solid #e2e8f0;
  white-space:nowrap;
}

.loc-cluster {
  display:inline-flex;
  align-items:center;
  padding:3px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  background:#dbeafe;
  color:#1e40af;
  border:1px solid #bfdbfe;
  white-space:nowrap;
}

.loc-building {
  display:inline-flex;
  align-items:center;
  padding:3px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  background:#f3e8ff;
  color:#6b21a8;
  border:1px solid #e9d5ff;
  white-space:nowrap;
  direction:rtl;
}

.loc-zone {
  font-size:12px;
  color:#475569;
  font-weight:700;
  white-space:nowrap;
}

.loc-lane {
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:28px;
  height:28px;
  border-radius:8px;
  font-size:12px;
  font-weight:900;
  background:#f1f5f9;
  color:#334155;
  border:1px solid #e2e8f0;
}

.loc-lane.empty {
  color:#cbd5e1;
  font-size:14px;
}

.dir-badge {
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:3px 10px;
  border-radius:7px;
  font-size:11px;
  font-weight:900;
  white-space:nowrap;
}

.dir-badge.in {
  background:#dcfce7;
  color:#15803d;
  border:1px solid #86efac;
}

.dir-badge.out {
  background:#fee2e2;
  color:#b91c1c;
  border:1px solid #fecaca;
}

.dir-badge.neutral {
  background:#f1f5f9;
  color:#475569;
  border:1px solid #e2e8f0;
}

.loc-type {
  display:inline-flex;
  align-items:center;
  padding:3px 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
  background:#fef9c3;
  color:#92400e;
  border:1px solid #fde68a;
  white-space:nowrap;
}

.row-clickable {
  cursor:pointer;
}

.row-clickable:hover {
  background:rgba(79,70,229,.04) !important;
}

.modal-backdrop {
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.60);
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:28px 14px;
  z-index:9999;
  overflow:auto;
}

.modal {
  width:100%;
  max-width:1180px;
  background:#fff;
  border-radius:22px;
  box-shadow:0 25px 80px rgba(15,23,42,.30);
  overflow:hidden;
  margin-bottom:40px;
}

.modal__head {
  padding:22px 26px;
  border-bottom:1px solid #e5e7eb;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  background:linear-gradient(135deg,#f8fafc,#eef2ff);
}

.modal__eyebrow {
  display:block;
  font-size:12px;
  color:#64748b;
  font-weight:900;
  margin-bottom:6px;
}

.modal__title {
  font-size:22px;
  color:#0f172a;
  font-weight:950;
}

.modal__sub {
  margin-top:7px;
  color:#64748b;
  font-size:13px;
  font-weight:700;
}

.modal__head-tags {
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin-top:10px;
}

.modal__close {
  border:1px solid #cbd5e1;
  background:#fff;
  color:#0f172a;
  width:36px;
  height:36px;
  border-radius:12px;
  font-size:18px;
  cursor:pointer;
  flex-shrink:0;
}

.modal__close:hover {
  background:#f1f5f9;
}

.modal__body {
  padding:24px 26px 30px;
  display:flex;
  flex-direction:column;
  gap:22px;
}

.modal__loading,
.modal__error {
  padding:42px;
  text-align:center;
  font-size:14px;
  font-weight:800;
}

.modal__error {
  color:#dc2626;
}

.section {
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:18px;
  background:#fff;
}

.section-title {
  display:flex;
  align-items:center;
  gap:10px;
  color:#0f172a;
  font-size:15px;
  font-weight:950;
  margin-bottom:14px;
}

.section-title::after {
  content:"";
  height:1px;
  background:#e5e7eb;
  flex:1;
}

.info-grid {
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
}

@media(max-width:950px) {
  .info-grid {
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:560px) {
  .info-grid {
    grid-template-columns:1fr;
  }
}

.info-box {
  background:#f8fafc;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:12px;
  min-height:70px;
}

.info-box__key {
  display:block;
  color:#64748b;
  font-size:11px;
  font-weight:900;
  margin-bottom:5px;
}

.info-box__val {
  color:#0f172a;
  font-size:13px;
  font-weight:900;
  word-break:break-word;
}

.status-flow {
  display:grid;
  grid-template-columns:1fr auto 1fr;
  gap:12px;
  align-items:center;
}

@media(max-width:700px) {
  .status-flow {
    grid-template-columns:1fr;
  }

  .status-arrow {
    transform:rotate(90deg);
    justify-self:center;
  }
}

.status-card {
  padding:16px;
  border-radius:18px;
  border:1px solid #e5e7eb;
  background:#f8fafc;
}

.status-card__label {
  color:#64748b;
  font-size:12px;
  font-weight:900;
  display:block;
  margin-bottom:8px;
}

.status-card__value {
  font-size:18px;
  font-weight:950;
}

.status-card.good {
  background:#f0fdf4;
  border-color:#bbf7d0;
}

.status-card.bad {
  background:#fef2f2;
  border-color:#fecaca;
}

.status-card.warn {
  background:#fffbeb;
  border-color:#fde68a;
}

.status-card.muted {
  background:#f8fafc;
  border-color:#e2e8f0;
}

.status-arrow {
  color:#64748b;
  font-size:26px;
  font-weight:950;
}

.summary-row {
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:10px;
}

@media(max-width:900px) {
  .summary-row {
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:520px) {
  .summary-row {
    grid-template-columns:1fr;
  }
}

.summary-card {
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:14px;
  background:#f8fafc;
}

.summary-card__label {
  display:block;
  color:#64748b;
  font-size:11px;
  font-weight:900;
}

.summary-card__value {
  display:block;
  margin-top:4px;
  color:#0f172a;
  font-size:24px;
  font-weight:950;
}

.image-grid {
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(180px,1fr));
  gap:12px;
}

.image-card {
  border:1px solid #e5e7eb;
  border-radius:16px;
  overflow:hidden;
  background:#f8fafc;
}

.image-card img {
  display:block;
  width:100%;
  height:145px;
  object-fit:cover;
  cursor:pointer;
  background:#e5e7eb;
}

.image-card__body {
  padding:10px;
  font-size:12px;
  color:#475569;
  font-weight:800;
  line-height:1.55;
}

.issue-card {
  border:1px solid #e5e7eb;
  border-radius:18px;
  padding:16px;
  background:#f8fafc;
  margin-bottom:12px;
}

.issue-head {
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  margin-bottom:12px;
}

.issue-title {
  font-size:15px;
  font-weight:950;
  color:#0f172a;
}

.issue-meta {
  font-size:12px;
  color:#64748b;
  font-weight:800;
  margin-top:4px;
  line-height:1.5;
}

.solution-list {
  display:flex;
  flex-direction:column;
  gap:8px;
}

.solution-row {
  display:grid;
  grid-template-columns:34px 1fr auto;
  gap:10px;
  align-items:flex-start;
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:14px;
  padding:10px;
}

.step-num {
  width:28px;
  height:28px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#eef2ff;
  color:#4338ca;
  font-size:12px;
  font-weight:950;
}

.solution-title {
  color:#0f172a;
  font-size:13px;
  font-weight:950;
}

.solution-desc {
  color:#64748b;
  font-size:12px;
  font-weight:700;
  margin-top:3px;
  line-height:1.5;
}

.done-time {
  color:#64748b;
  font-size:11px;
  font-weight:800;
  margin-top:4px;
}

.empty {
  color:#94a3b8;
  font-size:13px;
  font-weight:800;
  padding:14px;
  background:#f8fafc;
  border-radius:14px;
  border:1px dashed #cbd5e1;
}

.timeline {
  display:flex;
  flex-direction:column;
}

.tl-item {
  display:flex;
  gap:12px;
}

.tl-left {
  display:flex;
  flex-direction:column;
  align-items:center;
  width:20px;
  flex-shrink:0;
}

.tl-dot {
  width:12px;
  height:12px;
  border-radius:50%;
  border:2px solid #64748b;
  margin-top:4px;
  background:#fff;
}

.tl-dot.good {
  background:#dcfce7;
  border-color:#16a34a;
}

.tl-dot.bad {
  background:#fee2e2;
  border-color:#dc2626;
}

.tl-dot.warn {
  background:#fef9c3;
  border-color:#d97706;
}

.tl-dot.muted {
  background:#f1f5f9;
  border-color:#64748b;
}

.tl-line {
  width:1px;
  flex:1;
  min-height:20px;
  background:#e5e7eb;
  margin:3px 0;
}

.tl-right {
  padding-bottom:16px;
}

.tl-time {
  font-size:11px;
  color:#94a3b8;
  font-weight:900;
}

.tl-title {
  font-size:13px;
  color:#0f172a;
  font-weight:950;
  margin-top:2px;
}

.tl-note {
  font-size:12px;
  color:#64748b;
  font-weight:700;
  margin-top:2px;
  line-height:1.5;
}
`;

function injectStyles() {
  if (document.getElementById("inspection-details-page-styles-final")) return;

  const el = document.createElement("style");
  el.id = "inspection-details-page-styles-final";
  el.textContent = CSS;
  document.head.appendChild(el);
}

function StatCard({ label, value, sub }) {
  return (
    <div className="insp-stat">
      <span className="insp-stat__label">{label}</span>
      <span className="insp-stat__val">{value}</span>
      {sub && <span className="insp-stat__sub">{sub}</span>}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="info-box">
      <span className="info-box__key">{label}</span>
      <span className="info-box__val">{safeValue(value)}</span>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="summary-card">
      <span className="summary-card__label">{label}</span>
      <span className="summary-card__value">{value}</span>
    </div>
  );
}

function DirectionBadge({ direction }) {
  if (!direction || direction === "—") {
    return <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>;
  }

  const isIn = direction === "IN";
  const isOut = direction === "OUT";
  const cls = isIn ? "in" : isOut ? "out" : "neutral";
  const arrow = isIn ? "→" : isOut ? "←" : "";

  return (
    <span className={`dir-badge ${cls}`}>
      {arrow && <span style={{ fontSize: 10 }}>{arrow}</span>}
      {direction}
    </span>
  );
}

function LaneBadge({ lane }) {
  if (!lane) {
    return <span className="loc-lane empty">—</span>;
  }

  return <span className="loc-lane">{lane}</span>;
}

function InspectionDetailsModal({ inspection, apiBase = "", onClose }) {
  const [detail, setDetail] = useState(inspection);
  const [extraImages, setExtraImages] = useState([]);
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
        const fullRes = await fetch(`${base}/inspections/full/${inspection.id}`, {
          signal: controller.signal,
        });

        if (!fullRes.ok) {
          throw new Error(`HTTP ${fullRes.status}`);
        }

        const fullData = await fullRes.json();

        let imageData = [];

        try {
          const imgRes = await fetch(
            `${base}/inspection-image/inspection/${inspection.id}`,
            { signal: controller.signal }
          );

          if (imgRes.ok) {
            imageData = await imgRes.json();
          }
        } catch (imgErr) {
          console.warn("Could not load images from inspection-image endpoint", imgErr);
        }

        setDetail(fullData);
        setExtraImages(Array.isArray(imageData) ? imageData : []);
        setLoading(false);
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error(err);
        setDetail(inspection);
        setExtraImages([]);
        setError("تعذر تحميل كل التفاصيل من الباك اند، هنعرض المتاح فقط.");
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

  const directImages = getInspectionImages(d);
  const imagesMap = new Map();

  [...directImages, ...extraImages].forEach((img, index) => {
    const key = img?.id || img?.imageUrl || img?.url || index;
    imagesMap.set(String(key), img);
  });

  const images = [...imagesMap.values()];

  const statusBefore = getStatusBefore(d) || "—";
  const statusAfter = getStatusAfter(d) || "—";

  const history = Array.isArray(device.statusHistory) ? device.statusHistory : [];
  const issues = getIssueList(d);
  const actions = getSolutionActions(d);
  const doneSummary = getDoneSummary(d);

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
      note: `Inspection #${d.id} was created.`,
    },
    d.inspectedAt && {
      time: d.inspectedAt,
      status: d.inspectionStatus,
      title: `Inspection result: ${arStatus(d.inspectionStatus)}`,
      note: d.notes || d.issueReason || "—",
    },
    scan && {
      time: d.inspectedAt || d.createdAt,
      status: scan.scanned ? "DONE" : "SKIPPED",
      title: scan.scanned ? "Scan verification completed" : "No scan verification",
      note: `Method: ${safeValue(scan.scanMethodLabel || scan.scanMethod)} · Type: ${safeValue(
        scan.scanCodeTypeLabel || scan.scanCodeType
      )} · QR attempts: ${safeValue(scan.qrAttempts)} · Manual fallback: ${
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
      title: `Solution step: ${a.solution?.title || `#${a.solutionId}`}`,
      note: `${arStatus(a.status)} ${
        a.technician
          ? `· By ${a.technician.fullName || a.technician.username || "—"}`
          : ""
      } ${a.note ? `· Note: ${a.note}` : ""}`,
    })),
    d.updatedAt && {
      time: d.updatedAt,
      status: "muted",
      title: "Inspection last updated",
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
        <div className="modal__head">
          <div>
            <span className="modal__eyebrow">
              Inspection #{d.id} · {fmtFull(d.inspectedAt || d.createdAt)}
            </span>

            <div className="modal__title">
              {device.deviceName || device.deviceCode || "Device"} —{" "}
              {arStatus(d.inspectionStatus)}
            </div>

            <div className="modal__sub">
              Technician:{" "}
              {technician.fullName ||
                technician.username ||
                technician.email ||
                `#${d.technicianId || "—"}`}
            </div>

            <div className="modal__head-tags">
              <span className={`tag ${statusClass(d.inspectionStatus)}`}>
                {arStatus(d.inspectionStatus)}
              </span>

              <span className={images.length > 0 ? "tag good" : "tag info"}>
                {images.length} image
              </span>

              <span className="tag good">
                Done {doneSummary.done}/{doneSummary.total}
              </span>

              <span className="tag purple">Issues {issues.length}</span>

              <span className={scan.scanned ? "tag good" : "tag warn"}>
                {scan.scanned ? "Scan Done" : "No Scan"}
              </span>

              {scan.manualFallbackUsed && (
                <span className="tag warn">Manual after QR attempts</span>
              )}
            </div>
          </div>

          <button className="modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal__body">
          {loading ? (
            <div className="modal__loading">جاري تحميل كل تفاصيل الفحص...</div>
          ) : (
            <>
              {error && <div className="modal__error">{error}</div>}

              <div className="section">
                <div className="section-title">Full summary</div>

                <div className="summary-row">
                  <SummaryCard label="Images" value={images.length} />
                  <SummaryCard label="Issues" value={issues.length} />
                  <SummaryCard
                    label="Done steps"
                    value={`${doneSummary.done}/${doneSummary.total}`}
                  />
                  <SummaryCard label="QR Attempts" value={scan.qrAttempts ?? 0} />
                  <SummaryCard
                    label="Scan"
                    value={scan.scanned ? "Yes" : "No"}
                  />
                </div>
              </div>

              <div className="section">
                <div className="section-title">Device status before / after</div>

                <div className="status-flow">
                  <div className={`status-card ${statusClass(statusBefore)}`}>
                    <span className="status-card__label">
                      حالة الجهاز قبل الفحص
                    </span>
                    <div className="status-card__value">
                      {arStatus(statusBefore)}
                    </div>
                  </div>

                  <div className="status-arrow">→</div>

                  <div className={`status-card ${statusClass(statusAfter)}`}>
                    <span className="status-card__label">
                      حالة الجهاز بعد الفحص
                    </span>
                    <div className="status-card__value">
                      {arStatus(statusAfter)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="section-title">Scan / Security information</div>

                <div className="info-grid">
                  <InfoBox
                    label="Scan Status"
                    value={scan.scannedLabel || getScanLabel(d)}
                  />
                  <InfoBox
                    label="Scan Method"
                    value={scan.scanMethodLabel || scan.scanMethod}
                  />
                  <InfoBox
                    label="Scan Code Type"
                    value={scan.scanCodeTypeLabel || scan.scanCodeType}
                  />
                  <InfoBox
                    label="Masked Code"
                    value={scan.scanCodeValueMasked}
                  />
                  <InfoBox label="QR Attempts" value={scan.qrAttempts ?? 0} />
                  <InfoBox
                    label="Manual Fallback"
                    value={
                      scan.manualFallbackUsedLabel ||
                      (scan.manualFallbackUsed ? "تم فتح البحث اليدوي" : "لم يتم فتح البحث اليدوي")
                    }
                  />
                  <InfoBox
                    label="Security Note"
                    value={
                      scan.scanCodeType === "SECRET_QR"
                        ? "تم التحقق من الجهاز باستخدام QR السري"
                        : scan.manualFallbackUsed
                          ? "تم استخدام البحث اليدوي بعد محاولات QR"
                          : "لا توجد بيانات Scan مسجلة"
                    }
                  />
                  <InfoBox
                    label="Scan Verified"
                    value={scan.scanned ? "Verified" : "Not Verified"}
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
                  <InfoBox
                    label="Done Steps"
                    value={`${doneSummary.done}/${doneSummary.total}`}
                  />
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
                  <InfoBox
                    label="Install Date"
                    value={fmtFull(device.installDate)}
                  />
                  <InfoBox
                    label="Last Inspection At"
                    value={fmtFull(device.lastInspectionAt)}
                  />
                  <InfoBox
                    label="Current Status"
                    value={arStatus(device.currentStatus)}
                  />
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
                  <InfoBox
                    label="Created At"
                    value={fmtFull(location.createdAt)}
                  />
                  <InfoBox
                    label="Updated At"
                    value={fmtFull(location.updatedAt)}
                  />
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
                    <InfoBox
                      label="Assigned To"
                      value={task.assignedTo?.fullName || task.assignedTo?.username}
                    />
                    <InfoBox
                      label="Created By"
                      value={task.createdBy?.fullName || task.createdBy?.username}
                    />
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
                  <div className="empty">
                    لا توجد صور مرفوعة لهذا الفحص. لو الصورة موجودة في Prisma
                    Studio اتأكدي إن inspectionId بتاعها نفس رقم الفحص.
                  </div>
                ) : (
                  <div className="image-grid">
                    {images.map((img, index) => {
                      const imagePath =
                        img.imageUrl ||
                        img.url ||
                        img.path ||
                        img.filePath ||
                        img.filename ||
                        "";

                      const src = fixImageUrl(imagePath, apiBase);

                      return (
                        <div
                          className="image-card"
                          key={img.id || imagePath || index}
                        >
                          <img
                            src={src}
                            alt={`Inspection ${d.id} image ${index + 1}`}
                            onClick={() => window.open(src, "_blank")}
                            onError={(e) => {
                              e.currentTarget.style.opacity = "0.25";
                              e.currentTarget.title = "Image failed to load";
                            }}
                          />

                          <div className="image-card__body">
                            <div>Image ID: {safeValue(img.id)}</div>
                            <div>
                              Type: {safeValue(img.imageType || "general")}
                            </div>
                            <div>Created: {fmtFull(img.createdAt)}</div>
                            <div style={{ wordBreak: "break-all" }}>
                              Path: {safeValue(imagePath)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="section">
                <div className="section-title">
                  Issues and solution steps — Done {doneSummary.done}/
                  {doneSummary.total}
                </div>

                {issues.length === 0 ? (
                  <div className="empty">
                    لا توجد مشاكل مسجلة على هذا الفحص.
                  </div>
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
                              Inspection Issue ID: {safeValue(item.id)} · Issue
                              ID: {safeValue(issue.id || item.issueId)} · Code:{" "}
                              {safeValue(issue.issueCode)} · Category:{" "}
                              {safeValue(issue.category?.name)} · Severity:{" "}
                              {safeValue(issue.severity)}
                            </div>

                            <div className="issue-meta">
                              Status: {arStatus(item.status)} · Reported By:{" "}
                              {safeValue(
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
                                          Action ID: {safeValue(action.id)} ·
                                          Technician:{" "}
                                          {safeValue(
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
                                  <div className="step-num">
                                    {actionIndex + 1}
                                  </div>

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
                            Action ID: {safeValue(action.id)} · Solution ID:{" "}
                            {safeValue(action.solutionId)} · Inspection Issue
                            ID: {safeValue(action.inspectionIssueId)}
                          </div>

                          <div className="solution-desc">
                            Technician:{" "}
                            {safeValue(
                              action.technician?.fullName ||
                                action.technician?.username ||
                                action.technicianId
                            )}
                          </div>

                          {action.note && (
                            <div className="solution-desc">
                              Note: {action.note}
                            </div>
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
                          {index < history.length - 1 && (
                            <div className="tl-line" />
                          )}
                        </div>

                        <div className="tl-right">
                          <div className="tl-time">{fmtFull(h.changedAt)}</div>
                          <div className="tl-title">
                            {arStatus(h.oldStatus)} → {arStatus(h.newStatus)}
                          </div>
                          <div className="tl-note">
                            History ID: {safeValue(h.id)} · Changed By:{" "}
                            {safeValue(
                              h.changedBy?.fullName ||
                                h.changedBy?.username ||
                                h.changedById
                            )}{" "}
                            · Note: {safeValue(h.note)}
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

export function InspectionsPage({
  inspections = [],
  technicians = [],
  locations = [],
  apiBase = "",
}) {
  injectStyles();

  const [selectedInspection, setSelectedInspection] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [techId, setTechId] = useState("");
  const [cluster, setCluster] = useState("");
  const [building, setBuilding] = useState("");
  const [monthlyOnly, setMonthlyOnly] = useState(false);
  const [scanOnly, setScanOnly] = useState(false);
  const [manualFallbackOnly, setManualFallbackOnly] = useState(false);

  const clusters = useMemo(
    () =>
      unique(inspections, (i) => i.device?.location?.cluster).length
        ? unique(inspections, (i) => i.device?.location?.cluster)
        : unique(locations, (l) => l.cluster),
    [inspections, locations]
  );

  const buildings = useMemo(
    () =>
      unique(inspections, (i) => i.device?.location?.building).length
        ? unique(inspections, (i) => i.device?.location?.building)
        : unique(locations, (l) => l.building),
    [inspections, locations]
  );

  const statuses = useMemo(
    () => unique(inspections, (i) => i.inspectionStatus),
    [inspections]
  );

  const stats = useMemo(() => {
    const total = inspections.length;
    const ok = inspections.filter((i) => i.inspectionStatus === "OK").length;
    const notOk = inspections.filter((i) => i.inspectionStatus === "NOT_OK").length;
    const partial = inspections.filter((i) => i.inspectionStatus === "PARTIAL").length;
    const notReachable = inspections.filter(
      (i) => i.inspectionStatus === "NOT_REACHABLE"
    ).length;

    const imagesCount = inspections.reduce((sum, i) => sum + getImagesCount(i), 0);

    const doneActions = inspections.reduce((sum, i) => {
      const s = getDoneSummary(i);
      return sum + s.done;
    }, 0);

    const totalActions = inspections.reduce((sum, i) => {
      const s = getDoneSummary(i);
      return sum + s.total;
    }, 0);

    const issuesCount = inspections.reduce(
      (sum, i) => sum + getIssueList(i).length,
      0
    );

    const scannedCount = inspections.filter((i) => getScanInfo(i).scanned).length;
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
      doneActions,
      totalActions,
      issuesCount,
      scannedCount,
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
      const task = ins.task || {};
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
          scan.scannedLabel,
          scan.scanMethod,
          scan.scanMethodLabel,
          scan.scanCodeType,
          scan.scanCodeTypeLabel,
          scan.scanCodeValueMasked,
          scan.manualFallbackUsedLabel,
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
          task.status,
          task.notes,
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

  const columns = useMemo(
    () => [
      {
        key: "id",
        label: "ID",
        width: 70,
      },
      {
        key: "inspectionStatus",
        label: "Status",
        render: (val) => (
          <span className={`tag ${statusClass(val)}`}>{arStatus(val)}</span>
        ),
      },
      {
        key: "beforeDeviceStatus",
        label: "Before",
        render: (_, row) => {
          const before = getStatusBefore(row);
          return (
            <span className={`tag ${statusClass(before)}`}>
              {arStatus(before)}
            </span>
          );
        },
      },
      {
        key: "afterDeviceStatus",
        label: "After",
        render: (_, row) => {
          const after = getStatusAfter(row);
          return (
            <span className={`tag ${statusClass(after)}`}>
              {arStatus(after)}
            </span>
          );
        },
      },
      {
        key: "scanInfo",
        label: "Scan",
        render: (_, row) => {
          const scan = getScanInfo(row);

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span className={`tag ${scan.scanned ? "good" : "warn"}`}>
                {scan.scanned ? "تم Scan" : "لم يتم"}
              </span>
              <span style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>
                {scan.scanMethodLabel || scan.scanMethod || "—"} · QR:{" "}
                {scan.qrAttempts ?? 0}
              </span>
            </div>
          );
        },
      },
      {
        key: "manualFallback",
        label: "Manual",
        render: (_, row) => {
          const scan = getScanInfo(row);

          return (
            <span className={`tag ${scan.manualFallbackUsed ? "warn" : "muted"}`}>
              {scan.manualFallbackUsed ? "بعد 3 محاولات" : "لا"}
            </span>
          );
        },
      },
      {
        key: "device",
        label: "Device",
        render: (_, row) => {
          const d = row.device || {};

          return (
            <div>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>
                {d.deviceName || d.deviceCode || "—"}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 800 }}>
                SN: {d.serialNumber || "—"} · Code: {d.deviceCode || "—"}
              </div>
            </div>
          );
        },
      },
      {
        key: "technician",
        label: "Technician",
        render: (_, row) =>
          row.technician?.fullName ||
          row.technician?.username ||
          row.technician?.email ||
          `#${row.technicianId || "—"}`,
      },
      {
        key: "loc_excelId",
        label: "Excel ID",
        render: (_, row) => {
          const l = row.device?.location || {};

          return l.excelId ? (
            <span className="loc-excel">{l.excelId}</span>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          );
        },
      },
      {
        key: "loc_cluster",
        label: "Cluster",
        render: (_, row) => {
          const l = row.device?.location || {};

          return l.cluster ? (
            <span className="loc-cluster">{l.cluster}</span>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          );
        },
      },
      {
        key: "loc_building",
        label: "Building",
        render: (_, row) => {
          const l = row.device?.location || {};

          return l.building ? (
            <span className="loc-building">{l.building}</span>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          );
        },
      },
      {
        key: "loc_zone",
        label: "Zone",
        render: (_, row) => {
          const l = row.device?.location || {};

          return l.zone ? (
            <span className="loc-zone">{l.zone}</span>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          );
        },
      },
      {
        key: "loc_lane",
        label: "Lane",
        render: (_, row) => {
          const l = row.device?.location || {};
          return <LaneBadge lane={l.lane} />;
        },
      },
      {
        key: "loc_direction",
        label: "Direction",
        render: (_, row) => {
          const l = row.device?.location || {};
          return <DirectionBadge direction={l.direction} />;
        },
      },
      {
        key: "loc_type",
        label: "Loc. Type",
        render: (_, row) => {
          const l = row.device?.location || {};

          return l.type ? (
            <span className="loc-type">{l.type}</span>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
          );
        },
      },
      {
        key: "images",
        label: "Images",
        render: (_, row) => {
          const count = getImagesCount(row);

          return (
            <span className={`tag ${count > 0 ? "good" : "info"}`}>
              {count} image
            </span>
          );
        },
      },
      {
        key: "solutionActions",
        label: "Done steps",
        render: (_, row) => {
          const s = getDoneSummary(row);

          return (
            <span className={`tag ${s.done > 0 ? "good" : "muted"}`}>
              {s.done}/{s.total}
            </span>
          );
        },
      },
      {
        key: "inspectionIssues",
        label: "Issues",
        render: (_, row) => {
          const count = getIssueList(row).length;

          return (
            <span className={`tag ${count > 0 ? "warn" : "muted"}`}>
              {count} issue
            </span>
          );
        },
      },
      {
        key: "issueReason",
        label: "Issue Reason",
        render: (val) => val || "—",
      },
      {
        key: "inspectedAt",
        label: "Inspected At",
        render: (val) => fmtDate(val),
      },
    ],
    []
  );

  const handleRowClick = useCallback((row) => {
    setSelectedInspection(row);
  }, []);

  return (
    <div className="insp-page">
      <div className="insp-stats">
        <StatCard label="Total inspections" value={stats.total} sub="all records" />
        <StatCard label="OK" value={stats.ok} sub="سليم" />
        <StatCard label="Full faults" value={stats.notOk} sub="عطل كامل" />
        <StatCard label="Partial faults" value={stats.partial} sub="عطل جزئي" />
        <StatCard label="Not reachable" value={stats.notReachable} sub="غير متاح" />
        <StatCard
          label="Uploaded images"
          value={stats.imagesCount}
          sub="inspection photos"
        />
        <StatCard
          label="Done steps"
          value={`${stats.doneActions}/${stats.totalActions}`}
          sub="solution actions"
        />
        <StatCard label="Issues" value={stats.issuesCount} sub="reported issues" />
        <StatCard label="Scanned" value={stats.scannedCount} sub="QR / Manual" />
        <StatCard
          label="Manual fallback"
          value={stats.manualFallbackCount}
          sub="after QR attempts"
        />
      </div>

      <div className="insp-config">
        <div className="insp-config__title">Inspection filters</div>

        <div className="insp-filters">
          <div className="insp-filter">
            <span className="insp-filter__label">Search</span>
            <input
              type="text"
              value={search}
              placeholder="device / serial / technician / scan / issue..."
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="insp-filter">
            <span className="insp-filter__label">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {arStatus(s)}
                </option>
              ))}
            </select>
          </div>

          <div className="insp-filter">
            <span className="insp-filter__label">Technician</span>
            <select value={techId} onChange={(e) => setTechId(e.target.value)}>
              <option value="">All technicians</option>
              {technicians.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  #{t.id} — {t.fullName || t.username || t.email}
                </option>
              ))}
            </select>
          </div>

          <div className="insp-filter">
            <span className="insp-filter__label">Cluster</span>
            <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
              <option value="">All clusters</option>
              {clusters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="insp-filter">
            <span className="insp-filter__label">Building</span>
            <select value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="">All buildings</option>
              {buildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <label className="insp-check">
            <input
              type="checkbox"
              checked={monthlyOnly}
              onChange={(e) => setMonthlyOnly(e.target.checked)}
            />
            Current month only
          </label>

          <label className="insp-check">
            <input
              type="checkbox"
              checked={scanOnly}
              onChange={(e) => setScanOnly(e.target.checked)}
            />
            Scanned only
          </label>

          <label className="insp-check">
            <input
              type="checkbox"
              checked={manualFallbackOnly}
              onChange={(e) => setManualFallbackOnly(e.target.checked)}
            />
            Manual fallback only
          </label>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          data={filtered}
          columns={columns}
          keyField="id"
          onRowClick={handleRowClick}
          rowClassName={() => "row-clickable"}
        />
      </div>

      {selectedInspection && (
        <InspectionDetailsModal
          inspection={selectedInspection}
          apiBase={apiBase}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
}