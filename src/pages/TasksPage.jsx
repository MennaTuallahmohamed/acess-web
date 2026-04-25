import React, { useMemo, useState, useEffect, useCallback } from "react";
import { DataGrid } from "../components/DataGrid";

/* ─────────────────────────────────────────────────────────────────
   API CONFIG
───────────────────────────────────────────────────────────────── */
const API_BASE_URL =
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

const buildHeaders = (json = true) => {
  const token = getToken();
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.body ? true : false),
      ...(options.headers || {}),
    },
  });

  const raw = await res.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        (typeof data === "string" ? data : "") ||
        `Request failed: ${res.status}`
    );
  }

  return data;
}

async function tryGet(paths = []) {
  let lastError = null;
  for (const path of paths) {
    try {
      return await apiRequest(path, { method: "GET" });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("All GET endpoints failed");
}

function normalizeArrayResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS & LOCATION PARSER
───────────────────────────────────────────────────────────────── */
const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const formatDate = (dateString, withTime = true) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  const opts = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime && { hour: "2-digit", minute: "2-digit" }),
  };
  return d.toLocaleDateString("en-GB", opts);
};

const parseDeviceLocation = (dev) => {
  const loc = dev?.location || {};

  const out = {
    cluster: loc.cluster || dev?.cluster || "",
    building: loc.building || dev?.building || "",
    zone: loc.zone || dev?.zone || "",
    lane: loc.lane || dev?.lane || "",
    direction: loc.direction || dev?.direction || "",
    type: loc.type || dev?.deviceType?.name || dev?.type || "",
  };

  if (!out.cluster && (dev?.deviceName || dev?.deviceCode || dev?.excelId)) {
    const text = `${dev.deviceName || ""} - ${dev.deviceCode || dev?.excelId || ""}`;
    const parts = text
      .split("-")
      .map((p) => p.trim())
      .filter(Boolean);

    for (const p of parts) {
      const low = p.toLowerCase();
      if (low.startsWith("cluster")) out.cluster = p.substring(7).trim();
      else if (low.startsWith("building")) out.building = p.substring(8).trim();
      else if (low.startsWith("zone")) out.zone = p.substring(4).trim();
      else if (low.startsWith("lane")) out.lane = p.substring(4).trim();
      else if (["in", "out", "entry", "exit"].includes(low)) out.direction = p.toUpperCase();
    }
  }

  return out;
};

const STATUS_META = {
  PENDING:     { label: "Pending",     bg: "#fffbeb", color: "#b45309", border: "#fcd34d" },
  IN_PROGRESS: { label: "In Progress", bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  COMPLETED:   { label: "Completed",   bg: "#f0fdf4", color: "#15803d", border: "#86efac" },
  CANCELLED:   { label: "Cancelled",   bg: "#fef2f2", color: "#b91c1c", border: "#fca5a5" },
};

const isEmergency = (t) =>
  t.isEmergency || t.priority === "EMERGENCY" || /EMERGENCY/i.test(t.notes || "");

const uniqueValues = (arr) => [...new Set(arr.filter(Boolean))];

const userDisplayName = (u) =>
  u?.fullName || u?.name || u?.username || u?.email || `ID: ${u?.id}`;

const extractRoleName = (u) =>
  String(u?.role?.name || u?.role || u?.userRole || "")
    .trim()
    .toLowerCase();

const isAdminUser = (u) => extractRoleName(u).includes("admin");
const isTechnicianUser = (u) => extractRoleName(u).includes("technician");

/* ─────────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────────── */
const LUX_CSS = `
  .lux-tp-root {
    font-family: 'Inter', system-ui, sans-serif;
    background: var(--bg-tertiary, #f8fafc);
    min-height: 100vh;
    padding: 24px 32px;
    color: #0f172a;
  }

  .lux-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(79,70,229,0.3);
  }
  .lux-btn-primary:hover {
    box-shadow: 0 6px 16px rgba(79,70,229,0.4);
    transform: translateY(-1px);
  }
  .lux-btn-primary:disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .lux-btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 12px;
    background: #fff;
    color: #334155;
    font-weight: 600;
    font-size: 14px;
    border: 1px solid #e2e8f0;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .lux-btn-secondary:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .lux-page-title {
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
    margin: 0 0 6px 0;
    color: #0f172a;
  }
  .lux-page-sub {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
  }

  .lux-filter-bar {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #fff;
    padding: 12px 16px;
    border-radius: 16px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    border: 1px solid #f1f5f9;
    margin-top: 24px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  .lux-search-box {
    position: relative;
    flex: 1;
    min-width: 320px;
  }
  .lux-search-box input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 14px;
    outline: none;
    transition: all 0.2s ease;
  }
  .lux-search-box input:focus {
    border-color: #4f46e5;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
  }
  .lux-search-box svg {
    position: absolute;
    left: 14px;
    top: 12px;
    color: #94a3b8;
  }

  .lux-filters-panel {
    background: #fff;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    padding: 16px;
    margin-bottom: 20px;
  }

  .lux-filters-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(120px, 1fr));
    gap: 12px;
    align-items: end;
  }

  .lux-filter-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lux-filter-label {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .lux-filter-select,
  .lux-filter-input {
    width: 100%;
    height: 40px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    transition: all 0.2s ease;
  }

  .lux-filter-select:focus,
  .lux-filter-input:focus {
    border-color: #4f46e5;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.08);
  }

  .lux-filter-actions {
    display: flex;
    gap: 10px;
    align-items: end;
    justify-content: flex-end;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .lux-clear-btn {
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #475569;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  .lux-clear-btn:hover {
    background: #f8fafc;
  }

  .lux-chip-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
  .lux-chip {
    padding: 6px 12px;
    border-radius: 999px;
    background: #eef2ff;
    color: #4338ca;
    font-size: 12px;
    font-weight: 700;
    border: 1px solid #c7d2fe;
  }

  .lux-table-wrapper {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    border: 1px solid #f1f5f9;
    overflow: hidden;
  }

  .lux-badge {
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .lux-badge.emerg {
    background: #fef2f2;
    color: #ef4444;
    border: 1px solid #fca5a5;
  }

  /* ── device block with separated location badges ── */
  .lux-device-block {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .lux-device-name {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.35;
    word-break: break-word;
  }
  .lux-device-code {
    font-size: 11px;
    font-weight: 700;
    color: #4f46e5;
  }
  .lux-device-loc-badges {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 2px;
  }

  /* ── location badges — each on its own row ── */
  .lux-device-loc-badges {
    display: flex !important;
    flex-direction: column !important;
    gap: 3px !important;
    flex-wrap: nowrap !important;
    margin-top: 4px;
  }
  .lux-loc-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
    border: 1px solid transparent;
    width: fit-content;
  }
  .lux-loc-tag--cluster  { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }
  .lux-loc-tag--building { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
  .lux-loc-tag--zone     { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
  .lux-loc-tag--lane     { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
  .lux-loc-tag--type     { background: #fdf4ff; color: #a21caf; border-color: #f0abfc; }
  .lux-loc-tag--in       { background: #dcfce7; color: #15803d; border-color: #86efac; }
  .lux-loc-tag--out      { background: #fef9c3; color: #a16207; border-color: #fde68a; }

  .lux-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: luxFadeIn 0.2s forwards;
  }

  .lux-modal-body {
    background: #ffffff;
    border-radius: 24px;
    box-shadow: 0 24px 48px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 760px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(20px);
    animation: luxSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .lux-modal-header {
    padding: 24px 32px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
  }

  .lux-modal-content {
    padding: 32px;
    overflow-y: auto;
    flex: 1;
  }

  .lux-modal-footer {
    padding: 20px 32px;
    background: #f8fafc;
    border-top: 1px solid #f1f5f9;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .lux-slide-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.4);
    backdrop-filter: blur(2px);
    z-index: 998;
    animation: luxFadeIn 0.3s forwards;
  }

  .lux-slide-panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    max-width: 500px;
    background: #fff;
    z-index: 999;
    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
    transform: translateX(100%);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    display: flex;
    flex-direction: column;
  }
  .lux-slide-panel.open {
    transform: translateX(0);
  }
  .lux-slide-header {
    padding: 32px;
    border-bottom: 1px solid #f1f5f9;
    background: #f8fafc;
    position: relative;
  }

  .lux-field {
    margin-bottom: 20px;
  }

  .lux-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .lux-input {
    width: 100%;
    padding: 12px 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #fff;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    color: #0f172a;
    font-weight: 500;
  }

  .lux-input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
  }

  .lux-input:disabled {
    background: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }

  .lux-img-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
    margin-top: 16px;
  }

  .lux-img-card {
    height: 130px;
    border-radius: 12px;
    background-size: cover;
    background-position: center;
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
    cursor: crosshair;
  }
  .lux-img-card:hover::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.1);
  }

  .lux-device-selector-shell {
    background: #f8fafc;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    padding: 18px;
  }

  .lux-device-selector-top {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .lux-device-search {
    position: relative;
  }

  .lux-device-search input {
    width: 100%;
    height: 44px;
    border-radius: 14px;
    border: 1px solid #dbe3f0;
    background: #fff;
    padding: 0 14px 0 42px;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    transition: 0.2s ease;
  }

  .lux-device-search input:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.08);
  }

  .lux-device-search svg {
    position: absolute;
    left: 14px;
    top: 13px;
    color: #94a3b8;
  }

  .lux-device-filter-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .lux-device-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    max-height: 260px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .lux-device-card {
    padding: 12px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .lux-device-card:hover {
    border-color: #c7d2fe;
    box-shadow: 0 4px 14px rgba(79,70,229,0.08);
    transform: translateY(-1px);
  }

  .lux-device-card.active {
    border-color: #4f46e5;
    background: #f5f3ff;
    box-shadow: 0 4px 14px rgba(79,70,229,0.12);
  }

  .lux-device-card-title {
    font-size: 14px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 2px;
  }

  .lux-device-card.active .lux-device-card-title {
    color: #4f46e5;
  }

  .lux-device-card-code {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
  }

  .lux-device-card-meta {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 5px;
    line-height: 1.45;
  }

  .lux-device-summary {
    margin-top: 14px;
    padding: 12px 16px;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #065f46;
    font-weight: 700;
    font-size: 13px;
  }

  .lux-device-inline-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    flex-wrap: wrap;
  }

  .lux-device-results-count {
    font-size: 12px;
    color: #64748b;
    font-weight: 700;
  }

  .lux-loading-box, .lux-error-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 18px;
    font-size: 14px;
    font-weight: 600;
  }

  .lux-error-box {
    color: #b91c1c;
    background: #fef2f2;
    border-color: #fecaca;
  }

  @media (max-width: 1350px) {
    .lux-filters-grid {
      grid-template-columns: repeat(4, minmax(140px, 1fr));
    }
  }

  @media (max-width: 900px) {
    .lux-tp-root {
      padding: 18px 14px;
    }
    .lux-filters-grid {
      grid-template-columns: repeat(2, minmax(140px, 1fr));
    }
    .lux-device-filter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .lux-device-list {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 600px) {
    .lux-filters-grid {
      grid-template-columns: 1fr;
    }
    .lux-device-filter-grid {
      grid-template-columns: 1fr;
    }
  }

  @keyframes luxFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes luxSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

/* ─────────────────────────────────────────────────────────────────
   LOCATION BADGES COMPONENT
───────────────────────────────────────────────────────────────── */
function LocationBadges({ ploc = {} }) {
  return (
    <div className="lux-device-loc-badges">
      {ploc.cluster && (
        <span className="lux-loc-tag lux-loc-tag--cluster">
          📍 {ploc.cluster}
        </span>
      )}
      {ploc.building && (
        <span className="lux-loc-tag lux-loc-tag--building">
          🏢 {ploc.building}
        </span>
      )}
      {ploc.zone && (
        <span className="lux-loc-tag lux-loc-tag--zone">
          {ploc.zone}
        </span>
      )}
      {ploc.lane && (
        <span className="lux-loc-tag lux-loc-tag--lane">
          Lane {ploc.lane}
        </span>
      )}
      {ploc.direction && (
        <span className={`lux-loc-tag lux-loc-tag--${ploc.direction === "IN" ? "in" : "out"}`}>
          {ploc.direction}
        </span>
      )}
      {ploc.type && (
        <span className="lux-loc-tag lux-loc-tag--type">
          {ploc.type}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────── */
function DeviceSelector({ devices, selectedId, onSelect }) {
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState("ALL");
  const [building, setBuilding] = useState("ALL");
  const [zone, setZone] = useState("ALL");
  const [lane, setLane] = useState("ALL");
  const [direction, setDirection] = useState("ALL");
  const [type, setType] = useState("ALL");

  const clusterOptions = useMemo(
    () => ["ALL", ...uniqueValues(devices.map((d) => d.parsedLoc.cluster)).sort()],
    [devices]
  );

  const buildingOptions = useMemo(() => {
    return [
      "ALL",
      ...uniqueValues(
        devices
          .filter((d) => cluster === "ALL" || d.parsedLoc.cluster === cluster)
          .map((d) => d.parsedLoc.building)
      ).sort(),
    ];
  }, [devices, cluster]);

  const zoneOptions = useMemo(() => {
    return [
      "ALL",
      ...uniqueValues(
        devices
          .filter((d) => cluster === "ALL" || d.parsedLoc.cluster === cluster)
          .filter((d) => building === "ALL" || d.parsedLoc.building === building)
          .map((d) => d.parsedLoc.zone)
      ).sort(),
    ];
  }, [devices, cluster, building]);

  const laneOptions = useMemo(() => {
    return [
      "ALL",
      ...uniqueValues(
        devices
          .filter((d) => cluster === "ALL" || d.parsedLoc.cluster === cluster)
          .filter((d) => building === "ALL" || d.parsedLoc.building === building)
          .filter((d) => zone === "ALL" || d.parsedLoc.zone === zone)
          .map((d) => String(d.parsedLoc.lane || ""))
      ).sort(),
    ];
  }, [devices, cluster, building, zone]);

  const directionOptions = useMemo(() => {
    return [
      "ALL",
      ...uniqueValues(
        devices
          .filter((d) => cluster === "ALL" || d.parsedLoc.cluster === cluster)
          .filter((d) => building === "ALL" || d.parsedLoc.building === building)
          .filter((d) => zone === "ALL" || d.parsedLoc.zone === zone)
          .filter((d) => lane === "ALL" || String(d.parsedLoc.lane || "") === lane)
          .map((d) => d.parsedLoc.direction)
      ).sort(),
    ];
  }, [devices, cluster, building, zone, lane]);

  const typeOptions = useMemo(() => {
    return [
      "ALL",
      ...uniqueValues(
        devices
          .filter((d) => cluster === "ALL" || d.parsedLoc.cluster === cluster)
          .filter((d) => building === "ALL" || d.parsedLoc.building === building)
          .filter((d) => zone === "ALL" || d.parsedLoc.zone === zone)
          .filter((d) => lane === "ALL" || String(d.parsedLoc.lane || "") === lane)
          .filter((d) => direction === "ALL" || d.parsedLoc.direction === direction)
          .map((d) => d.parsedLoc.type || d.deviceType?.name || "")
      ).sort(),
    ];
  }, [devices, cluster, building, zone, lane, direction]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return devices.filter((d) => {
      const haystack = [
        d.deviceName,
        d.deviceCode,
        d.barcode,
        d.parsedLoc.cluster,
        d.parsedLoc.building,
        d.parsedLoc.zone,
        d.parsedLoc.lane,
        d.parsedLoc.direction,
        d.parsedLoc.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !haystack.includes(q)) return false;
      if (cluster !== "ALL" && d.parsedLoc.cluster !== cluster) return false;
      if (building !== "ALL" && d.parsedLoc.building !== building) return false;
      if (zone !== "ALL" && d.parsedLoc.zone !== zone) return false;
      if (lane !== "ALL" && String(d.parsedLoc.lane || "") !== lane) return false;
      if (direction !== "ALL" && d.parsedLoc.direction !== direction) return false;
      if (type !== "ALL" && (d.parsedLoc.type || "") !== type) return false;

      return true;
    });
  }, [devices, search, cluster, building, zone, lane, direction, type]);

  const selectedDev = devices.find((d) => d.id === selectedId);

  const resetFilters = () => {
    setSearch("");
    setCluster("ALL");
    setBuilding("ALL");
    setZone("ALL");
    setLane("ALL");
    setDirection("ALL");
    setType("ALL");
  };

  return (
    <div className="lux-device-selector-shell">
      <div className="lux-device-selector-top">
        <div className="lux-device-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search by device name, code, cluster, building, zone, lane, direction..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lux-device-filter-grid">
          <div className="lux-filter-field">
            <label className="lux-filter-label">Cluster</label>
            <select
              className="lux-filter-select"
              value={cluster}
              onChange={(e) => {
                setCluster(e.target.value);
                setBuilding("ALL");
                setZone("ALL");
                setLane("ALL");
                setDirection("ALL");
                setType("ALL");
                onSelect(null);
              }}
            >
              {clusterOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Clusters" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Building</label>
            <select
              className="lux-filter-select"
              value={building}
              onChange={(e) => {
                setBuilding(e.target.value);
                setZone("ALL");
                setLane("ALL");
                setDirection("ALL");
                setType("ALL");
                onSelect(null);
              }}
            >
              {buildingOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Buildings" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Zone</label>
            <select
              className="lux-filter-select"
              value={zone}
              onChange={(e) => {
                setZone(e.target.value);
                setLane("ALL");
                setDirection("ALL");
                setType("ALL");
                onSelect(null);
              }}
            >
              {zoneOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Zones" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Lane</label>
            <select
              className="lux-filter-select"
              value={lane}
              onChange={(e) => {
                setLane(e.target.value);
                setDirection("ALL");
                setType("ALL");
                onSelect(null);
              }}
            >
              {laneOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Lanes" : `Lane ${v}`}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Direction</label>
            <select
              className="lux-filter-select"
              value={direction}
              onChange={(e) => {
                setDirection(e.target.value);
                setType("ALL");
                onSelect(null);
              }}
            >
              {directionOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Directions" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Type</label>
            <select
              className="lux-filter-select"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                onSelect(null);
              }}
            >
              {typeOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All Types" : v}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="lux-device-inline-actions">
          <div className="lux-device-results-count">
            Showing {filtered.length} of {devices.length} devices
          </div>
          <button type="button" className="lux-clear-btn" onClick={resetFilters}>
            Reset Device Filters
          </button>
        </div>

        {filtered.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No devices match these filters.</p>
        ) : (
          <div className="lux-device-list">
            {filtered.map((d) => {
              const sel = selectedId === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => onSelect(d.id)}
                  className={`lux-device-card ${sel ? "active" : ""}`}
                >
                  <div className="lux-device-card-title">{d.deviceName || "Unknown Device"}</div>
                  <div className="lux-device-card-code">
                    Code: {d.deviceCode || d.barcode || d.excelId || "—"}
                  </div>
                  {/* Separated location badges inside device selector card */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
                    {d.parsedLoc.cluster && (
                      <span className="lux-loc-tag lux-loc-tag--cluster">📍 {d.parsedLoc.cluster}</span>
                    )}
                    {d.parsedLoc.building && (
                      <span className="lux-loc-tag lux-loc-tag--building">🏢 {d.parsedLoc.building}</span>
                    )}
                    {d.parsedLoc.zone && (
                      <span className="lux-loc-tag lux-loc-tag--zone">{d.parsedLoc.zone}</span>
                    )}
                    {d.parsedLoc.lane && (
                      <span className="lux-loc-tag lux-loc-tag--lane">Lane {d.parsedLoc.lane}</span>
                    )}
                    {d.parsedLoc.direction && (
                      <span className={`lux-loc-tag lux-loc-tag--${d.parsedLoc.direction === "IN" ? "in" : "out"}`}>
                        {d.parsedLoc.direction}
                      </span>
                    )}
                    {d.parsedLoc.type && (
                      <span className="lux-loc-tag lux-loc-tag--type">{d.parsedLoc.type}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedDev && (
        <div className="lux-device-summary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Selected: {selectedDev.deviceName} ({selectedDev.deviceCode || selectedDev.barcode || selectedDev.excelId || "—"})
        </div>
      )}
    </div>
  );
}

function NewTaskModalLux({
  technicians,
  admins = [],
  devicesMapped,
  onClose,
  onSubmit,
  loading,
}) {
  const [form, setForm] = useState({
    assignedToId: "",
    createdById: "",
    scheduledDate: "",
    frequency: "ONCE",
    notes: "",
    isEmergency: false,
    deviceId: null,
  });

  const [error, setError] = useState("");

  const adminOptions = useMemo(() => {
    const map = new Map();
    (admins || []).forEach((a) => {
      if (!a?.id) return;
      map.set(String(a.id), a);
    });
    return Array.from(map.values());
  }, [admins]);

  const handle = async () => {
    if (!form.assignedToId || !form.createdById || !form.scheduledDate || !form.deviceId) {
      setError("Please fill out all required fields marked with * and select a device.");
      return;
    }

    setError("");
    const noteText = form.isEmergency ? `EMERGENCY | ${form.notes || "Urgent task"}` : form.notes;

    try {
      await onSubmit({
        deviceId: Number(form.deviceId),
        assignedToId: Number(form.assignedToId),
        createdById: Number(form.createdById),
        scheduledDate: new Date(form.scheduledDate).toISOString(),
        frequency: form.frequency,
        status: "PENDING",
        notes: noteText,
      });
      onClose();
    } catch (e) {
      setError(e?.message || "Failed to create task. Please try again.");
    }
  };

  return (
    <div className="lux-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lux-modal-body">
        <div className="lux-modal-header">
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
              Dispatch New Task
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              Assign maintenance or structural repairs to your field integrators.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="lux-modal-content">
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="lux-field">
              <label className="lux-label">Assign Technician *</label>
              <select
                className="lux-input"
                value={form.assignedToId}
                onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
              >
                <option value="">Select Technician...</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {userDisplayName(t)} ({t.jobTitle || "Technician"})
                  </option>
                ))}
              </select>
            </div>

            <div className="lux-field">
              <label className="lux-label">Scheduled Date/Time *</label>
              <input
                type="datetime-local"
                className="lux-input"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              />
            </div>

            <div className="lux-field">
              <label className="lux-label">Created By (Admin ID) *</label>
              <select
                className="lux-input"
                value={form.createdById}
                onChange={(e) => setForm({ ...form, createdById: e.target.value })}
              >
                <option value="">Select Admin...</option>
                {adminOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {userDisplayName(a)} (ID: {a.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="lux-field">
              <label className="lux-label">Recurrence / Frequency</label>
              <select
                className="lux-input"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                <option value="ONCE">One-time / ONCE</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>
          </div>

          <div className="lux-field" style={{ marginTop: "4px" }}>
            <label className="lux-label">Select Hardware Device *</label>
            <DeviceSelector
              devices={devicesMapped}
              selectedId={form.deviceId}
              onSelect={(id) => setForm({ ...form, deviceId: id })}
            />
          </div>

          <div className="lux-field">
            <label className="lux-label">Context / Instructions</label>
            <textarea
              className="lux-input"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Add specific warnings or steps required..."
              style={{ minHeight: "80px", resize: "vertical" }}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#b91c1c",
              cursor: "pointer",
              background: "#fef2f2",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #fecaca",
            }}
          >
            <input
              type="checkbox"
              checked={form.isEmergency}
              onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })}
              style={{ transform: "scale(1.2)" }}
            />
            Mark this operation as an EMERGENCY ESCALATION
          </label>
        </div>

        <div className="lux-modal-footer">
          <button className="lux-btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="lux-btn-primary" onClick={handle} disabled={loading}>
            {loading ? "Dispatching..." : "Dispatch Task to Field"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskDetailsOverlay({ task, onClose, devicesMapped, inspections = [] }) {
  if (!task) return null;

  const device = devicesMapped.find((d) => d.id === (task.deviceId || task.device?.id)) || {};
  const ploc = device.parsedLoc || {};

  const taskInspections = inspections.filter(
    (i) =>
      i.taskId === task.id ||
      (i.deviceId === device.id &&
        new Date(i.inspectedAt || i.createdAt).toDateString() ===
          new Date(task.scheduledDate || task.createdAt).toDateString())
  );

  const allImages = taskInspections.flatMap((i) => i.images || i.inspectionImages || []);
  const meta = STATUS_META[task.status] || STATUS_META.PENDING;
  const emerg = isEmergency(task);

  return (
    <>
      <div className="lux-slide-backdrop" onClick={onClose}></div>

      <div className="lux-slide-panel open">
        <div className="lux-slide-header">
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span className="lux-badge" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
              {meta.label}
            </span>
            {emerg && <span className="lux-badge emerg">EMERGENCY</span>}
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>TASK #{task.id}</span>
          </div>

          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0", lineHeight: 1.2 }}>
            {task.title || `Maintenance: ${device.deviceName || "Unknown Device"}`}
          </h2>

          <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.5 }}>
            Scheduled for <strong style={{ color: "#0f172a" }}>{formatDate(task.scheduledDate || task.createdAt)}</strong>
          </p>
        </div>

        <div style={{ flex: 1, padding: "32px", overflowY: "auto", background: "#fff" }}>
          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px", margin: "0 0 16px 0", fontWeight: 700 }}>
              Assignment Protocol
            </h3>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontWeight: 800,
                  fontSize: "18px",
                  border: "1px solid #a5b4fc",
                }}
              >
                {initials(task.assignedTo?.fullName || task.assignedTo?.username || String(task.assignedToId))}
              </div>

              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  {task.assignedTo?.fullName || task.assignedTo?.username || `Technician ID: ${task.assignedToId}`}
                </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                  {task.assignedTo?.jobTitle || "Field Operative"} · {task.assignedTo?.phone || "No phone listed"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px", margin: "0 0 12px 0", fontWeight: 700 }}>
              Hardware Designation
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "4px" }}>
                  Device / Hardware
                </div>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>
                  {device.deviceName || "—"}{" "}
                  <span style={{ color: "#64748b", fontWeight: 400, marginLeft: "4px" }}>
                    {device.deviceCode || device.barcode || device.excelId || ""}
                  </span>
                </div>
              </div>

              <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", fontWeight: 600, marginBottom: "8px" }}>
                  Deployment Vector
                </div>
                {/* Separated location badges in the detail overlay */}
                <LocationBadges ploc={ploc} />
              </div>
            </div>

            {(task.notes || task.description) && (
              <div style={{ marginTop: "16px", padding: "16px", borderLeft: "4px solid #4f46e5", background: "#e0e7ff", borderRadius: "0 12px 12px 0" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#3730a3", marginBottom: "4px" }}>
                  ADMIN DIRECTIVE / NOTES
                </div>
                <div style={{ fontSize: "14px", color: "#312e81", lineHeight: 1.5 }}>
                  "{task.notes || task.description}"
                </div>
              </div>
            )}
          </div>

          <div style={{ borderTop: "2px dashed #e2e8f0", paddingTop: "32px" }}>
            <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px", margin: "0 0 16px 0", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Technician Field Reports & Media
            </h3>

            {taskInspections.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#94a3b8" }}>No field reports submitted yet.</div>
                <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "4px" }}>
                  The assigned technician hasn't filed an inspection log for this task.
                </div>
              </div>
            ) : (
              <div>
                {taskInspections.map((ins) => (
                  <div key={ins.id} style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", marginBottom: "16px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: ins.inspectionStatus === "COMPLETED" || ins.inspectionStatus === "OK" ? "#10b981" : "#f59e0b" }}>
                        {ins.inspectionStatus || "LOGGED"}
                      </span>
                      <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                        {formatDate(ins.inspectedAt || ins.createdAt)}
                      </span>
                    </div>
                    <p style={{ margin: "0", fontSize: "14px", color: "#334155", lineHeight: 1.5 }}>
                      {ins.notes || ins.issueReason || "No specific text remarks left by technician."}
                    </p>
                  </div>
                ))}

                {allImages.length > 0 && (
                  <div style={{ marginTop: "24px" }}>
                    <div className="lux-label" style={{ fontSize: "11px" }}>
                      Attached Visual Evidence ({allImages.length})
                    </div>
                    <div className="lux-img-grid">
                      {allImages.map((img, idx) => {
                        const url = img?.imageUrl || img?.url || img?.path || "";
                        return (
                          <div
                            key={idx}
                            className="lux-img-card"
                            style={{ backgroundImage: `url(${url})` }}
                            onClick={() => url && window.open(url, "_blank")}
                            title="Click to enlarge"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export function TasksPage({ canManage = true }) {
  const [tasks, setTasks] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [devices, setDevices] = useState([]);
  const [inspections, setInspections] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [clusterFilter, setClusterFilter] = useState("ALL");
  const [buildingFilter, setBuildingFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [directionFilter, setDirectionFilter] = useState("ALL");
  const [technicianFilter, setTechnicianFilter] = useState("ALL");
  const [emergencyFilter, setEmergencyFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = LUX_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const techRes = await tryGet([
        "/users?role=technician",
        "/users?type=technician",
        "/users/technicians",
      ]);
      const technicianList = normalizeArrayResponse(techRes);

      let adminList = [];
      try {
        const adminRes = await tryGet([
          "/users?role=admin",
          "/users?type=admin",
          "/users/admins",
        ]);
        adminList = normalizeArrayResponse(adminRes);
      } catch {
        adminList = [];
      }

      if (technicianList.length > 0 || adminList.length > 0) {
        return { technicians: technicianList, admins: adminList };
      }
    } catch {
      /* fallback below */
    }

    const allUsersRes = await tryGet(["/users"]);
    const allUsers = normalizeArrayResponse(allUsersRes);

    return {
      technicians: allUsers.filter(isTechnicianUser),
      admins: allUsers.filter(isAdminUser),
    };
  }, []);

  const loadAllData = useCallback(async () => {
    try {
      setPageError("");
      setBootLoading(true);

      const [tasksRes, usersPack, devicesRes, inspectionsRes] = await Promise.all([
        tryGet(["/inspection-tasks", "/tasks"]),
        fetchUsers(),
        tryGet(["/devices"]),
        tryGet(["/inspections"]).catch(() => []),
      ]);

      setTasks(normalizeArrayResponse(tasksRes));
      setTechnicians(usersPack.technicians || []);
      setAdmins(usersPack.admins || []);
      setDevices(normalizeArrayResponse(devicesRes));
      setInspections(normalizeArrayResponse(inspectionsRes));
    } catch (err) {
      setPageError(err?.message || "Failed to load tasks page data from backend.");
    } finally {
      setBootLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const onCreateTask = useCallback(async (payload) => {
    setLoading(true);
    try {
      await apiRequest("/inspection-tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  const onDeleteTask = useCallback(async (taskId) => {
    const ok = window.confirm(`Are you sure you want to revoke task #${taskId}?`);
    if (!ok) return;

    setLoading(true);
    try {
      await apiRequest(`/inspection-tasks/${taskId}`, { method: "DELETE" });
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  const onUpdateTaskStatus = useCallback(async (taskId, status) => {
    setLoading(true);
    try {
      await apiRequest(`/inspection-tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadAllData();
    } finally {
      setLoading(false);
    }
  }, [loadAllData]);

  const devicesMapped = useMemo(
    () => devices.map((d) => ({ ...d, parsedLoc: parseDeviceLocation(d) })),
    [devices]
  );

  const tasksEnriched = useMemo(() => {
    return tasks.map((t) => {
      const deviceId =
        t.deviceId ||
        t.device?.id ||
        t.hardwareDeviceId ||
        t.device?.deviceId;

      const d =
        devicesMapped.find((dev) => String(dev.id) === String(deviceId)) ||
        { parsedLoc: {} };

      return {
        ...t,
        device: t.device || d,
        ploc: d.parsedLoc || {},
      };
    });
  }, [tasks, devicesMapped]);

  const statusOptions = useMemo(() => ["ALL", ...Object.keys(STATUS_META)], []);

  const clusterOptions = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        tasksEnriched
          .map((t) => t.ploc?.cluster)
          .filter((v) => v && v !== "Unknown")
      ),
    ];
  }, [tasksEnriched]);

  const buildingOptions = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        tasksEnriched
          .filter((t) => clusterFilter === "ALL" || t.ploc?.cluster === clusterFilter)
          .map((t) => t.ploc?.building)
          .filter((v) => v && v !== "Unknown")
      ),
    ];
  }, [tasksEnriched, clusterFilter]);

  const zoneOptions = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        tasksEnriched
          .filter((t) => clusterFilter === "ALL" || t.ploc?.cluster === clusterFilter)
          .filter((t) => buildingFilter === "ALL" || t.ploc?.building === buildingFilter)
          .map((t) => t.ploc?.zone)
          .filter((v) => v && v !== "Unknown")
      ),
    ];
  }, [tasksEnriched, clusterFilter, buildingFilter]);

  const directionOptions = useMemo(() => {
    return [
      "ALL",
      ...new Set(
        tasksEnriched
          .filter((t) => clusterFilter === "ALL" || t.ploc?.cluster === clusterFilter)
          .filter((t) => buildingFilter === "ALL" || t.ploc?.building === buildingFilter)
          .filter((t) => zoneFilter === "ALL" || t.ploc?.zone === zoneFilter)
          .map((t) => t.ploc?.direction)
          .filter((v) => v && v !== "Unknown")
      ),
    ];
  }, [tasksEnriched, clusterFilter, buildingFilter, zoneFilter]);

  const technicianOptions = useMemo(() => {
    const base = technicians.map((t) => ({
      id: String(t.id),
      name: t.fullName || t.username || t.name || `ID: ${t.id}`,
    }));

    const seen = new Set();
    const uniq = [];

    for (const item of base) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        uniq.push(item);
      }
    }

    return uniq;
  }, [technicians]);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return tasksEnriched
      .filter((t) => {
        const emergency = isEmergency(t);

        const haystack = [
          t.id,
          t.title,
          t.notes,
          t.description,
          t.device?.deviceName,
          t.device?.deviceCode,
          t.device?.barcode,
          t.device?.excelId,
          t.ploc?.cluster,
          t.ploc?.building,
          t.ploc?.zone,
          t.ploc?.lane,
          t.ploc?.direction,
          t.assignedTo?.fullName,
          t.assignedTo?.username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (q && !haystack.includes(q)) return false;
        if (statusFilter !== "ALL" && t.status !== statusFilter) return false;
        if (clusterFilter !== "ALL" && t.ploc?.cluster !== clusterFilter) return false;
        if (buildingFilter !== "ALL" && t.ploc?.building !== buildingFilter) return false;
        if (zoneFilter !== "ALL" && t.ploc?.zone !== zoneFilter) return false;
        if (directionFilter !== "ALL" && t.ploc?.direction !== directionFilter) return false;
        if (technicianFilter !== "ALL" && String(t.assignedToId || "") !== technicianFilter) return false;
        if (emergencyFilter === "YES" && !emergency) return false;
        if (emergencyFilter === "NO" && emergency) return false;

        return true;
      })
      .sort((a, b) => new Date(b.scheduledDate || b.createdAt) - new Date(a.scheduledDate || a.createdAt));
  }, [
    tasksEnriched,
    search,
    statusFilter,
    clusterFilter,
    buildingFilter,
    zoneFilter,
    directionFilter,
    technicianFilter,
    emergencyFilter,
  ]);

  const activeFilters = [
    statusFilter !== "ALL" ? `Status: ${statusFilter}` : null,
    clusterFilter !== "ALL" ? `Cluster: ${clusterFilter}` : null,
    buildingFilter !== "ALL" ? `Building: ${buildingFilter}` : null,
    zoneFilter !== "ALL" ? `Zone: ${zoneFilter}` : null,
    directionFilter !== "ALL" ? `Direction: ${directionFilter}` : null,
    technicianFilter !== "ALL"
      ? `Technician: ${technicianOptions.find((t) => t.id === technicianFilter)?.name || technicianFilter}`
      : null,
    emergencyFilter !== "ALL" ? `Emergency: ${emergencyFilter}` : null,
  ].filter(Boolean);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setClusterFilter("ALL");
    setBuildingFilter("ALL");
    setZoneFilter("ALL");
    setDirectionFilter("ALL");
    setTechnicianFilter("ALL");
    setEmergencyFilter("ALL");
  };

  const columns = [
    {
      key: "id",
      label: "TASK ID",
      render: (v, t) => <strong style={{ color: "#4f46e5" }}>#{t.id}</strong>,
    },
    {
      key: "assignedTo",
      label: "OPERATIVE",
      render: (v, t) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 800,
              color: "#475569",
            }}
          >
            {initials(t.assignedTo?.fullName || t.assignedTo?.username || String(t.assignedToId))}
          </div>
          <span style={{ fontWeight: 600, color: "#1e293b" }}>
            {t.assignedTo?.fullName || t.assignedTo?.username || `ID: ${t.assignedToId}`}
          </span>
        </div>
      ),
    },
    {
      key: "deviceName",
      label: "DEVICE",
      render: (v, t) => (
        <div className="lux-device-block">
          <div className="lux-device-name">{t.device?.deviceName || "—"}</div>
          <div className="lux-device-code">
            {t.device?.deviceCode || t.device?.barcode || t.device?.excelId || ""}
          </div>
        </div>
      ),
    },
    {
      key: "ploc_cluster",
      label: "CLUSTER",
      render: (v, t) =>
        t.ploc?.cluster ? (
          <span className="lux-loc-tag lux-loc-tag--cluster">📍 {t.ploc.cluster}</span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "ploc_building",
      label: "BUILDING",
      render: (v, t) =>
        t.ploc?.building ? (
          <span className="lux-loc-tag lux-loc-tag--building">🏢 {t.ploc.building}</span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "ploc_zone",
      label: "ZONE",
      render: (v, t) =>
        t.ploc?.zone ? (
          <span className="lux-loc-tag lux-loc-tag--zone">{t.ploc.zone}</span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "ploc_lane",
      label: "LANE",
      render: (v, t) =>
        t.ploc?.lane ? (
          <span className="lux-loc-tag lux-loc-tag--lane">Lane {t.ploc.lane}</span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "ploc_direction",
      label: "DIRECTION",
      render: (v, t) =>
        t.ploc?.direction ? (
          <span className={`lux-loc-tag lux-loc-tag--${t.ploc.direction === "IN" ? "in" : "out"}`}>
            {t.ploc.direction}
          </span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "ploc_type",
      label: "TYPE",
      render: (v, t) =>
        t.ploc?.type ? (
          <span className="lux-loc-tag lux-loc-tag--type">{t.ploc.type}</span>
        ) : <span style={{ color: "#ccc" }}>—</span>,
    },
    {
      key: "status",
      label: "STATUS VECTOR",
      render: (v, t) => {
        const meta = STATUS_META[t.status] || STATUS_META.PENDING;
        const emerg = isEmergency(t);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {canManage ? (
              <select
                value={t.status}
                onChange={(e) => onUpdateTaskStatus(t.id, e.target.value)}
                disabled={loading}
                style={{
                  background: meta.bg,
                  color: meta.color,
                  border: `1px solid ${meta.border}`,
                  borderRadius: "20px",
                  padding: "4px 28px 4px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {Object.keys(STATUS_META).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_META[k].label}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className="lux-badge"
                style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
              >
                {meta.label}
              </span>
            )}

            {emerg && <span className="lux-badge emerg">⚡</span>}
          </div>
        );
      },
    },
    {
      key: "scheduledDate",
      label: "TIMEFRAME",
      render: (v, t) => (
        <span style={{ color: "#475569", fontSize: "13px", fontWeight: 500 }}>
          {formatDate(t.scheduledDate || t.createdAt)}
        </span>
      ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "action",
      label: "",
      render: (v, t) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(t.id);
          }}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #fee2e2",
            background: "#fff",
            color: "#ef4444",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            opacity: 0.8,
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#fef2f2";
            e.target.style.opacity = "1";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#fff";
            e.target.style.opacity = "0.8";
          }}
        >
          Revoke
        </button>
      ),
    });
  }

  return (
    <div className="lux-tp-root">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="lux-page-title">Tasks</h1>
          <p className="lux-page-sub">System Administrative Control</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="lux-btn-secondary" onClick={loadAllData} disabled={loading || bootLoading}>
            Refresh
          </button>

          {canManage && (
            <button className="lux-btn-primary" onClick={() => setModalOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Dispatch New Task
            </button>
          )}
        </div>
      </div>

      {bootLoading && (
        <div className="lux-loading-box">
          Loading tasks, users, devices, and inspections from backend...
        </div>
      )}
      {pageError && <div className="lux-error-box">{pageError}</div>}

      <div className="lux-filter-bar">
        <div className="lux-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Trace tasks by ID, technician, device, cluster, building, zone, or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700, marginLeft: "auto" }}>
          Showing {filteredTasks.length} of {tasks.length} records
        </div>
      </div>

      <div className="lux-filters-panel">
        <div className="lux-filters-grid">
          <div className="lux-filter-field">
            <label className="lux-filter-label">Status</label>
            <select
              className="lux-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "All statuses" : STATUS_META[s]?.label || s}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Cluster</label>
            <select
              className="lux-filter-select"
              value={clusterFilter}
              onChange={(e) => {
                setClusterFilter(e.target.value);
                setBuildingFilter("ALL");
                setZoneFilter("ALL");
                setDirectionFilter("ALL");
              }}
            >
              {clusterOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All clusters" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Building</label>
            <select
              className="lux-filter-select"
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setZoneFilter("ALL");
                setDirectionFilter("ALL");
              }}
            >
              {buildingOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All buildings" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Zone</label>
            <select
              className="lux-filter-select"
              value={zoneFilter}
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setDirectionFilter("ALL");
              }}
            >
              {zoneOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All zones" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Direction</label>
            <select
              className="lux-filter-select"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value)}
            >
              {directionOptions.map((v) => (
                <option key={v} value={v}>
                  {v === "ALL" ? "All directions" : v}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Technician</label>
            <select
              className="lux-filter-select"
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
            >
              <option value="ALL">All technicians</option>
              {technicianOptions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lux-filter-field">
            <label className="lux-filter-label">Emergency</label>
            <select
              className="lux-filter-select"
              value={emergencyFilter}
              onChange={(e) => setEmergencyFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="YES">Emergency only</option>
              <option value="NO">Non-emergency</option>
            </select>
          </div>
        </div>

        <div className="lux-filter-actions">
          <button className="lux-clear-btn" onClick={clearFilters}>
            Reset Filters
          </button>
        </div>

        {activeFilters.length > 0 && (
          <div className="lux-chip-row">
            {activeFilters.map((chip) => (
              <span key={chip} className="lux-chip">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="lux-table-wrapper">
        <DataGrid
          data={filteredTasks}
          columns={columns}
          keyField="id"
          onRowClick={(row) => setSelectedTask(row)}
        />
      </div>

      {modalOpen && canManage && (
        <NewTaskModalLux
          technicians={technicians}
          admins={admins}
          devicesMapped={devicesMapped}
          onClose={() => setModalOpen(false)}
          onSubmit={onCreateTask}
          loading={loading}
        />
      )}

      {selectedTask && (
        <TaskDetailsOverlay
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          devicesMapped={devicesMapped}
          inspections={inspections}
        />
      )}
    </div>
  );
}