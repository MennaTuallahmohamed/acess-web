import React, { useCallback, useEffect, useMemo, useState } from "react";

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

function clean(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text && text !== "null" && text !== "undefined" ? text : fallback;
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function getCurrentUserId() {
  const keys = ["dashboard_auth_user", "currentUser", "user"];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const user = JSON.parse(raw);
      return user?.id || user?.userId || user?.sub || null;
    } catch {
      // ignore
    }
  }

  return null;
}

function userName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    "System"
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

function deviceName(device = {}, snapshot = {}) {
  return (
    readValue(device, snapshot, "deviceName") ||
    readValue(device, snapshot, "name") ||
    "Unknown Device"
  );
}

function deviceCode(device = {}, snapshot = {}, fallback = "") {
  return (
    readValue(device, snapshot, "deviceCode") ||
    readValue(device, snapshot, "barcode") ||
    readValue(device, snapshot, "serialNumber") ||
    fallback ||
    "—"
  );
}

function getLocationParts(device = {}, snapshot = {}) {
  const location = snapshot?.location || device?.location || {};

  return {
    cluster:
      readValue(device, snapshot, "gateCluster") ||
      readValue(device, snapshot, "cluster") ||
      location?.cluster ||
      "",
    building:
      readValue(device, snapshot, "gateBuilding") ||
      readValue(device, snapshot, "building") ||
      location?.building ||
      "",
    zone:
      readValue(device, snapshot, "gateZone") ||
      readValue(device, snapshot, "zone") ||
      location?.zone ||
      "",
    direction:
      readValue(device, snapshot, "gateDirection") ||
      readValue(device, snapshot, "direction") ||
      location?.direction ||
      "",
    lane:
      readValue(device, snapshot, "gateNo") ||
      readValue(device, snapshot, "lane") ||
      location?.lane ||
      "",
  };
}

function locationText(device = {}, snapshot = {}) {
  const p = getLocationParts(device, snapshot);

  return [p.cluster, p.building, p.zone, p.direction, p.lane]
    .filter(Boolean)
    .join(" - ");
}

function getInspections(device) {
  if (Array.isArray(device?.inspections)) return device.inspections;
  if (Array.isArray(device?.inspectionHistory)) return device.inspectionHistory;
  return [];
}

function splitInspectionsByReplacement(device, record, side) {
  const all = getInspections(device);
  const replacementDate = new Date(record?.replacementDate || record?.createdAt || 0);

  if (!all.length || Number.isNaN(replacementDate.getTime())) {
    return all;
  }

  return all.filter((ins) => {
    const date = new Date(ins.inspectedAt || ins.createdAt || ins.updatedAt || 0);

    if (Number.isNaN(date.getTime())) return true;

    if (side === "OLD") return date <= replacementDate;
    return date >= replacementDate;
  });
}

function latestInspectionDate(device, record, side) {
  const list = splitInspectionsByReplacement(device, record, side);
  const first = list
    .slice()
    .sort(
      (a, b) =>
        new Date(b.inspectedAt || b.createdAt || 0) -
        new Date(a.inspectedAt || a.createdAt || 0)
    )[0];

  return first?.inspectedAt || first?.createdAt || null;
}

function statusLabel(status) {
  const v = String(status || "").toUpperCase();

  if (v === "OK") return "Operating";
  if (v === "ACTIVE") return "Active";
  if (v === "COMPLETED") return "Completed";
  if (v === "PENDING") return "Pending";
  if (v === "NEEDS_MAINTENANCE") return "Needs Maintenance";
  if (v === "UNDER_MAINTENANCE") return "Under Maintenance";
  if (v === "OUT_OF_SERVICE") return "Out Of Service";
  if (v === "REPLACED") return "Replaced";

  return clean(status);
}

function statusClass(status) {
  const v = String(status || "").toUpperCase();

  if (v === "OK" || v === "ACTIVE" || v === "COMPLETED") return "ok";
  if (v === "PENDING" || v === "UNDER_MAINTENANCE") return "progress";
  if (v === "NEEDS_MAINTENANCE") return "warn";
  if (v === "OUT_OF_SERVICE" || v === "REPLACED") return "bad";

  return "idle";
}

const styles = `
.rep-page{
  min-height:100vh;
  padding:24px 32px;
  background:
    radial-gradient(circle at top left,rgba(28,169,225,.18),transparent 32%),
    radial-gradient(circle at bottom right,rgba(38,55,70,.12),transparent 32%),
    linear-gradient(135deg,#ffffff,#eefaff);
  color:#263746;
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
}

.rep-hero{
  border-radius:30px;
  padding:26px;
  background:
    radial-gradient(circle at top right,rgba(255,255,255,.18),transparent 30%),
    linear-gradient(135deg,#263746,#147394,#1CA9E1);
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  box-shadow:0 26px 70px rgba(28,169,225,.24);
  position:relative;
  overflow:hidden;
}

.rep-hero:after{
  content:"";
  position:absolute;
  right:-90px;
  top:-120px;
  width:280px;
  height:280px;
  border-radius:50%;
  background:rgba(255,255,255,.14);
}

.rep-hero-left{
  position:relative;
  z-index:1;
  display:flex;
  align-items:center;
  gap:16px;
}

.rep-hero-logo{
  width:72px;
  height:72px;
  border-radius:22px;
  background:#fff;
  color:#1CA9E1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:31px;
  box-shadow:0 18px 40px rgba(0,0,0,.18);
}

.rep-hero h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.8px;
}

.rep-hero p{
  margin:8px 0 0;
  color:#eaf8ff;
  font-weight:800;
  line-height:1.6;
}

.rep-actions{
  position:relative;
  z-index:1;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.rep-btn{
  border:0;
  border-radius:16px;
  padding:12px 18px;
  font-weight:1000;
  cursor:pointer;
  background:#1CA9E1;
  color:#fff;
  box-shadow:0 14px 30px rgba(28,169,225,.22);
  transition:.18s ease;
}

.rep-btn:hover{
  transform:translateY(-1px);
}

.rep-btn.white{
  background:#fff;
  color:#263746;
  border:1px solid #dbeafe;
  box-shadow:none;
}

.rep-btn.dark{
  background:#263746;
}

.rep-btn.green{
  background:#22c55e;
}

.rep-btn:disabled{
  opacity:.55;
  cursor:not-allowed;
  transform:none;
}

.rep-stats{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
  margin-top:18px;
}

.rep-stat{
  background:#fff;
  border:1px solid #dbeafe;
  border-top:5px solid #1CA9E1;
  border-radius:22px;
  padding:17px;
  box-shadow:0 18px 42px rgba(15,23,42,.06);
}

.rep-stat span{
  display:block;
  font-size:11px;
  color:#64748b;
  font-weight:1000;
  text-transform:uppercase;
  letter-spacing:.4px;
}

.rep-stat strong{
  display:block;
  margin-top:8px;
  font-size:31px;
  color:#0f172a;
  line-height:1;
}

.rep-toolbar{
  margin-top:18px;
  background:#fff;
  border:1px solid #dbeafe;
  border-radius:24px;
  padding:16px;
  display:flex;
  gap:12px;
  flex-wrap:wrap;
  align-items:center;
  box-shadow:0 18px 42px rgba(15,23,42,.05);
}

.rep-search{
  flex:2;
  min-width:260px;
  border:1px solid #cbd5e1;
  border-radius:16px;
  padding:13px 14px;
  outline:none;
  font-weight:900;
  color:#263746;
}

.rep-select{
  min-width:190px;
  border:1px solid #cbd5e1;
  border-radius:16px;
  padding:13px 14px;
  outline:none;
  font-weight:900;
  color:#263746;
  background:#fff;
}

.rep-search:focus,
.rep-select:focus{
  border-color:#1CA9E1;
  box-shadow:0 0 0 4px rgba(28,169,225,.12);
}

.rep-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
  margin-top:18px;
}

.rep-card{
  background:#fff;
  border:1px solid #dbeafe;
  border-radius:28px;
  overflow:hidden;
  box-shadow:0 18px 44px rgba(15,23,42,.07);
  transition:.18s ease;
}

.rep-card:hover{
  transform:translateY(-2px);
  box-shadow:0 24px 60px rgba(15,23,42,.10);
}

.rep-card-head{
  padding:18px;
  background:linear-gradient(135deg,#f8fcff,#eaf8ff);
  border-bottom:1px solid #dbeafe;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}

.rep-card-head h3{
  margin:0;
  font-size:22px;
  color:#0f172a;
}

.rep-card-head p{
  margin:6px 0 0;
  color:#64748b;
  font-weight:800;
  line-height:1.55;
}

.rep-tags{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  margin-top:12px;
}

.rep-tag{
  display:inline-flex;
  align-items:center;
  gap:5px;
  padding:5px 9px;
  border-radius:999px;
  font-size:11px;
  font-weight:1000;
  background:#eef7ff;
  color:#0369a1;
}

.rep-tag.ok{
  background:#dcfce7;
  color:#15803d;
}

.rep-tag.progress{
  background:#dbeafe;
  color:#1d4ed8;
}

.rep-tag.warn{
  background:#fff7ed;
  color:#c2410c;
}

.rep-tag.bad{
  background:#fee2e2;
  color:#b91c1c;
}

.rep-tag.idle{
  background:#f1f5f9;
  color:#475569;
}

.rep-body{
  padding:18px;
}

.rep-swap{
  display:grid;
  grid-template-columns:1fr 54px 1fr;
  gap:12px;
  align-items:center;
}

.rep-device-box{
  background:#f8fcff;
  border:1px solid #e2f2fb;
  border-radius:20px;
  padding:14px;
}

.rep-device-box span{
  display:block;
  font-size:10px;
  color:#64748b;
  font-weight:1000;
  text-transform:uppercase;
  letter-spacing:.4px;
}

.rep-device-box strong{
  display:block;
  margin-top:7px;
  font-size:16px;
  color:#0f172a;
}

.rep-mini{
  margin-top:7px;
  color:#64748b;
  font-size:12px;
  font-weight:800;
  line-height:1.6;
}

.rep-arrow{
  width:48px;
  height:48px;
  border-radius:50%;
  background:linear-gradient(135deg,#263746,#1CA9E1);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:1000;
  font-size:22px;
  box-shadow:0 14px 28px rgba(28,169,225,.22);
}

.rep-info-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  margin-top:14px;
}

.rep-info{
  background:#fff;
  border:1px solid #e2f2fb;
  border-radius:16px;
  padding:12px;
}

.rep-info span{
  display:block;
  font-size:10px;
  color:#64748b;
  font-weight:1000;
  text-transform:uppercase;
}

.rep-info strong{
  display:block;
  margin-top:6px;
  color:#0f172a;
  font-size:13px;
  word-break:break-word;
}

.rep-card-footer{
  padding:16px 18px;
  border-top:1px solid #e2f2fb;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  flex-wrap:wrap;
}

.rep-empty{
  border:1px dashed #cbd5e1;
  background:#fff;
  border-radius:24px;
  padding:38px;
  text-align:center;
  color:#64748b;
  font-weight:1000;
  margin-top:18px;
}

.rep-alert{
  margin-top:18px;
  border-radius:18px;
  padding:14px 16px;
  font-weight:1000;
}

.rep-alert.err{
  background:#fff1f2;
  color:#b91c1c;
  border:1px solid #fecaca;
}

.rep-alert.ok{
  background:#ecfdf5;
  color:#15803d;
  border:1px solid #bbf7d0;
}

.rep-modal-backdrop{
  position:fixed;
  inset:0;
  z-index:9999;
  background:rgba(15,23,42,.62);
  backdrop-filter:blur(8px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
}

.rep-modal{
  width:min(1120px,96vw);
  max-height:92vh;
  overflow:auto;
  background:#fff;
  border-radius:30px;
  border:1px solid #dbeafe;
  box-shadow:0 44px 120px rgba(0,0,0,.36);
}

.rep-modal-head{
  padding:22px;
  background:linear-gradient(135deg,#263746,#147394,#1CA9E1);
  color:#fff;
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:14px;
}

.rep-modal-head h2{
  margin:0;
  font-size:28px;
}

.rep-modal-head p{
  margin:7px 0 0;
  color:#eaf8ff;
  font-weight:800;
}

.rep-close{
  width:44px;
  height:44px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.32);
  background:rgba(255,255,255,.16);
  color:#fff;
  cursor:pointer;
  font-size:25px;
}

.rep-modal-body{
  padding:18px;
}

.rep-detail-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:14px;
}

.rep-detail-card{
  border:1px solid #dbeafe;
  border-radius:24px;
  overflow:hidden;
  background:#fff;
}

.rep-detail-card h3{
  margin:0;
  padding:16px;
  background:linear-gradient(135deg,#f8fcff,#eaf8ff);
  border-bottom:1px solid #dbeafe;
  color:#0f172a;
}

.rep-table{
  width:100%;
  border-collapse:collapse;
  font-size:13px;
}

.rep-table th{
  text-align:left;
  background:#f8fafc;
  color:#64748b;
  font-size:10px;
  font-weight:1000;
  text-transform:uppercase;
  padding:10px;
  width:160px;
}

.rep-table td{
  padding:11px 10px;
  border-top:1px solid #f1f5f9;
  color:#263746;
  font-weight:800;
  vertical-align:top;
}

.replace-modal-preview{
  display:grid;
  grid-template-columns:1fr 70px 1fr;
  gap:14px;
  align-items:center;
}

.replace-form{
  margin-top:16px;
  border:1px solid #dbeafe;
  border-radius:24px;
  padding:16px;
  background:#fff;
}

.replace-form h3{
  margin:0;
  font-size:22px;
}

.replace-form p{
  margin:6px 0 0;
  color:#64748b;
  font-weight:800;
}

.replace-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
  margin-top:14px;
}

.replace-field label{
  display:block;
  color:#64748b;
  font-size:10px;
  font-weight:1000;
  text-transform:uppercase;
  margin-bottom:6px;
}

.replace-input,
.replace-textarea{
  width:100%;
  border:1px solid #cbd5e1;
  border-radius:15px;
  padding:12px;
  outline:none;
  font-weight:900;
  color:#263746;
  font-family:inherit;
}

.replace-input:focus,
.replace-textarea:focus{
  border-color:#1CA9E1;
  box-shadow:0 0 0 4px rgba(28,169,225,.12);
}

.replace-input:disabled{
  background:#f1f5f9;
  color:#64748b;
}

.replace-wide{
  grid-column:span 4;
}

.replace-half{
  grid-column:span 2;
}

.replace-textarea{
  min-height:90px;
  resize:vertical;
}

.replace-actions{
  display:flex;
  justify-content:flex-end;
  gap:10px;
  flex-wrap:wrap;
  margin-top:16px;
}

@media(max-width:1100px){
  .rep-grid,
  .rep-detail-grid{
    grid-template-columns:1fr;
  }

  .rep-stats{
    grid-template-columns:repeat(2,1fr);
  }

  .replace-modal-preview{
    grid-template-columns:1fr;
  }

  .rep-arrow{
    transform:rotate(90deg);
    margin:auto;
  }

  .replace-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .replace-wide,
  .replace-half{
    grid-column:span 2;
  }
}

@media(max-width:700px){
  .rep-page{
    padding:14px;
  }

  .rep-hero{
    flex-direction:column;
  }

  .rep-hero-left{
    align-items:flex-start;
  }

  .rep-hero h1{
    font-size:25px;
  }

  .rep-stats{
    grid-template-columns:1fr;
  }

  .rep-swap{
    grid-template-columns:1fr;
  }

  .rep-arrow{
    transform:rotate(90deg);
    margin:auto;
  }

  .rep-info-grid{
    grid-template-columns:1fr 1fr;
  }

  .replace-grid{
    grid-template-columns:1fr;
  }

  .replace-wide,
  .replace-half{
    grid-column:span 1;
  }
}

@media(max-width:480px){
  .rep-info-grid{
    grid-template-columns:1fr;
  }
}
`;

function InjectStyles() {
  useEffect(() => {
    const id = "device-replacement-log-styles";
    const old = document.getElementById(id);
    if (old) old.remove();

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = styles;
    document.head.appendChild(style);

    return () => {
      const current = document.getElementById(id);
      if (current) current.remove();
    };
  }, []);

  return null;
}

function Info({ label, value }) {
  return (
    <div className="rep-info">
      <span>{label}</span>
      <strong>{clean(value)}</strong>
    </div>
  );
}

function ReplacementCard({ item, onOpen }) {
  const oldDevice = item?.oldDevice || {};
  const newDevice = item?.newDevice || {};
  const oldSnapshot = item?.oldSnapshot || {};
  const newSnapshot = item?.newSnapshot || {};

  const oldCode = deviceCode(oldDevice, oldSnapshot, item.oldDeviceId);
  const newCode = deviceCode(newDevice, newSnapshot, item.newDeviceId);
  const oldName = deviceName(oldDevice, oldSnapshot);
  const newName = deviceName(newDevice, newSnapshot);

  const oldIp = readValue(oldDevice, oldSnapshot, "ipAddress") || item.oldIpAddress;
  const newIp = readValue(newDevice, newSnapshot, "ipAddress") || item.oldIpAddress;

  return (
    <article className="rep-card">
      <div className="rep-card-head">
        <div>
          <h3>{oldCode} → {newCode}</h3>

          <p>
            Replacement date: {formatDate(item.replacementDate || item.createdAt)}
            <br />
            Replaced by: {userName(item.replacedBy)}
          </p>

          <div className="rep-tags">
            <span className={`rep-tag ${statusClass(item.status)}`}>
              {statusLabel(item.status)}
            </span>

            <span className="rep-tag">Same Device ID: {clean(item.oldDeviceId)}</span>
            <span className="rep-tag">IP: {clean(item.oldIpAddress || newIp)}</span>
          </div>
        </div>

        <button className="rep-btn white" onClick={() => onOpen(item)}>
          Full Details
        </button>
      </div>

      <div className="rep-body">
        <div className="rep-swap">
          <div className="rep-device-box">
            <span>Before Location Change</span>
            <strong>{oldCode}</strong>

            <div className="rep-mini">
              {oldName}
              <br />
              IP: {clean(oldIp)}
              <br />
              Location: {clean(locationText(oldDevice, oldSnapshot))}
            </div>
          </div>

          <div className="rep-arrow">→</div>

          <div className="rep-device-box">
            <span>After Location Change</span>
            <strong>{newCode}</strong>

            <div className="rep-mini">
              {newName}
              <br />
              IP: {clean(newIp)}
              <br />
              Location: {clean(locationText(newDevice, newSnapshot))}
            </div>
          </div>
        </div>

        <div className="rep-info-grid">
          <Info
            label="Old Last Inspection"
            value={formatDate(latestInspectionDate(oldDevice, item, "OLD"))}
          />

          <Info
            label="New Last Inspection"
            value={formatDate(latestInspectionDate(newDevice, item, "NEW"))}
          />

          <Info
            label="Old Location"
            value={locationText(oldDevice, oldSnapshot)}
          />

          <Info
            label="New Location"
            value={locationText(newDevice, newSnapshot)}
          />
        </div>
      </div>

      <div className="rep-card-footer">
        <div className="rep-tags">
          {item.reason ? <span className="rep-tag warn">Reason Saved</span> : null}
          {item.notes ? <span className="rep-tag">Notes Saved</span> : null}
        </div>

        <button className="rep-btn dark" onClick={() => onOpen(item)}>
          Open Record
        </button>
      </div>
    </article>
  );
}

function InspectionList({ title, device, record, side }) {
  const inspections = splitInspectionsByReplacement(device, record, side)
    .slice()
    .sort(
      (a, b) =>
        new Date(b.inspectedAt || b.createdAt || 0) -
        new Date(a.inspectedAt || a.createdAt || 0)
    );

  return (
    <div className="rep-detail-card" style={{ marginTop: 16 }}>
      <h3>{title}</h3>

      {inspections.length === 0 ? (
        <div className="rep-empty" style={{ margin: 16 }}>
          No inspection history was returned for this period.
        </div>
      ) : (
        <table className="rep-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>

          <tbody>
            {inspections.map((ins, index) => (
              <tr key={ins.id || index}>
                <td>{formatDate(ins.inspectedAt || ins.createdAt)}</td>

                <td>{clean(ins.inspectionStatus || ins.status || "Logged")}</td>

                <td>
                  {ins.notes ||
                    ins.issueReason ||
                    ins.description ||
                    "No notes were saved."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function DeviceInfoTable({ title, device, snapshot, fallbackId }) {
  return (
    <div className="rep-detail-card">
      <h3>{title}</h3>

      <table className="rep-table">
        <tbody>
          <tr>
            <th>Device ID</th>
            <td>{clean(readValue(device, snapshot, "id") || fallbackId)}</td>
          </tr>

          <tr>
            <th>Device Code</th>
            <td>{deviceCode(device, snapshot, fallbackId)}</td>
          </tr>

          <tr>
            <th>Device Name</th>
            <td>{deviceName(device, snapshot)}</td>
          </tr>

          <tr>
            <th>IP Address</th>
            <td>{clean(readValue(device, snapshot, "ipAddress"))}</td>
          </tr>

          <tr>
            <th>Serial</th>
            <td>{clean(readValue(device, snapshot, "serialNumber"))}</td>
          </tr>

          <tr>
            <th>Barcode</th>
            <td>{clean(readValue(device, snapshot, "barcode"))}</td>
          </tr>

          <tr>
            <th>Manufacturer</th>
            <td>{clean(readValue(device, snapshot, "manufacturer"))}</td>
          </tr>

          <tr>
            <th>Model Number</th>
            <td>{clean(readValue(device, snapshot, "modelNumber"))}</td>
          </tr>

          <tr>
            <th>Firmware</th>
            <td>{clean(readValue(device, snapshot, "firmware"))}</td>
          </tr>

          <tr>
            <th>Status</th>
            <td>{statusLabel(readValue(device, snapshot, "currentStatus"))}</td>
          </tr>

          <tr>
            <th>Lifecycle</th>
            <td>{clean(readValue(device, snapshot, "lifecycleStatus"))}</td>
          </tr>

          <tr>
            <th>Cluster</th>
            <td>{clean(getLocationParts(device, snapshot).cluster)}</td>
          </tr>

          <tr>
            <th>Building</th>
            <td>{clean(getLocationParts(device, snapshot).building)}</td>
          </tr>

          <tr>
            <th>Zone</th>
            <td>{clean(getLocationParts(device, snapshot).zone)}</td>
          </tr>

          <tr>
            <th>Direction</th>
            <td>{clean(getLocationParts(device, snapshot).direction)}</td>
          </tr>

          <tr>
            <th>Lane</th>
            <td>{clean(getLocationParts(device, snapshot).lane)}</td>
          </tr>

          <tr>
            <th>Created At</th>
            <td>{formatDate(readValue(device, snapshot, "createdAt"))}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DetailsModal({ record, onClose }) {
  const [loading, setLoading] = useState(false);
  const [fullRecord, setFullRecord] = useState(record);

  const loadFullRecord = useCallback(async () => {
    if (!record?.id) return;

    setLoading(true);

    try {
      const data = await api(`/device-replacements/${record.id}`);
      setFullRecord(data || record);
    } catch {
      setFullRecord(record);
    } finally {
      setLoading(false);
    }
  }, [record]);

  useEffect(() => {
    loadFullRecord();
  }, [loadFullRecord]);

  const oldDevice = fullRecord?.oldDevice || {};
  const newDevice = fullRecord?.newDevice || {};
  const oldSnapshot = fullRecord?.oldSnapshot || {};
  const newSnapshot = fullRecord?.newSnapshot || {};

  return (
    <div className="rep-modal-backdrop">
      <div className="rep-modal">
        <div className="rep-modal-head">
          <div>
            <h2>Replacement Record Details</h2>
            <p>Same device, same IP, old location snapshot and new location snapshot.</p>
          </div>

          <button className="rep-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="rep-modal-body">
          {loading ? <div className="rep-empty">Loading full record details...</div> : null}

          <div className="rep-detail-grid">
            <DeviceInfoTable
              title="Old Device Snapshot"
              device={oldDevice}
              snapshot={oldSnapshot}
              fallbackId={fullRecord.oldDeviceId}
            />

            <DeviceInfoTable
              title="New Device Snapshot"
              device={newDevice}
              snapshot={newSnapshot}
              fallbackId={fullRecord.newDeviceId}
            />
          </div>

          <div className="rep-detail-card" style={{ marginTop: 16 }}>
            <h3>Replacement Information</h3>

            <table className="rep-table">
              <tbody>
                <tr>
                  <th>Replacement ID</th>
                  <td>{fullRecord.id}</td>
                </tr>

                <tr>
                  <th>Same Device ID</th>
                  <td>{clean(fullRecord.oldDeviceId)} → {clean(fullRecord.newDeviceId)}</td>
                </tr>

                <tr>
                  <th>Status</th>
                  <td>{statusLabel(fullRecord.status)}</td>
                </tr>

                <tr>
                  <th>Replacement Date</th>
                  <td>{formatDate(fullRecord.replacementDate || fullRecord.createdAt)}</td>
                </tr>

                <tr>
                  <th>Replaced By</th>
                  <td>{userName(fullRecord.replacedBy)}</td>
                </tr>

                <tr>
                  <th>Same IP Address</th>
                  <td>{clean(fullRecord.oldIpAddress)}</td>
                </tr>

                <tr>
                  <th>Reason</th>
                  <td>{clean(fullRecord.reason)}</td>
                </tr>

                <tr>
                  <th>Notes</th>
                  <td>{clean(fullRecord.notes)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <InspectionList
            title="Old Device Inspection History Before Replacement"
            device={oldDevice}
            record={fullRecord}
            side="OLD"
          />

          <InspectionList
            title="New Device Inspection History After Replacement"
            device={newDevice}
            record={fullRecord}
            side="NEW"
          />
        </div>
      </div>
    </div>
  );
}

export function DeviceReplaceModal({ device, onClose, onSaved }) {
  const loc = getLocationParts(device || {});

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    newCluster: loc.cluster || "",
    newBuilding: loc.building || "",
    newZone: loc.zone || "",
    newDirection: loc.direction || "",
    newLane: loc.lane || "",
    reason: "",
    notes: "",
  });

  if (!device) return null;

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function submitReplace() {
    setError("");

    const confirmed = window.confirm(
      `Confirm same-device location replacement?\n\nDevice: ${device.deviceCode || device.id}\nSame IP: ${device.ipAddress || "No IP"}\n\nOnly location fields will be changed.`
    );

    if (!confirmed) return;

    setBusy(true);

    try {
      const payload = {
        oldDeviceId: Number(device.id),
        replacedById: getCurrentUserId(),

        newCluster: form.newCluster.trim(),
        newBuilding: form.newBuilding.trim(),
        newZone: form.newZone.trim(),
        newDirection: form.newDirection.trim(),
        newLane: form.newLane.trim(),

        reason: form.reason.trim(),
        notes: form.notes.trim(),
      };

      const result = await api("/device-replacements", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSaved?.(result);
    } catch (e) {
      setError(e.message || "Failed to replace device location.");
    } finally {
      setBusy(false);
    }
  }

  const newPreview = {
    ...device,
    gateCluster: form.newCluster,
    gateBuilding: form.newBuilding,
    gateZone: form.newZone,
    gateDirection: form.newDirection,
    gateNo: form.newLane,
    cluster: form.newCluster,
    building: form.newBuilding,
    zone: form.newZone,
    direction: form.newDirection,
    lane: form.newLane,
  };

  return (
    <>
      <InjectStyles />

      <div className="rep-modal-backdrop">
        <div className="rep-modal">
          <div className="rep-modal-head">
            <div>
              <h2>Replace / Move Device</h2>
              <p>Same device, same IP. Only location fields will be changed.</p>
            </div>

            <button className="rep-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="rep-modal-body">
            <div className="replace-modal-preview">
              <div className="rep-detail-card">
                <h3>Current Device Data</h3>

                <div className="rep-info-grid" style={{ padding: 16 }}>
                  <Info label="Device ID" value={device.id} />
                  <Info label="Device Code" value={device.deviceCode} />
                  <Info label="Device Name" value={device.deviceName} />
                  <Info label="IP Address" value={device.ipAddress} />
                  <Info label="Serial" value={device.serialNumber} />
                  <Info label="Barcode" value={device.barcode} />
                  <Info label="Firmware" value={device.firmware} />
                  <Info label="Location" value={locationText(device, {})} />
                </div>
              </div>

              <div className="rep-arrow">→</div>

              <div className="rep-detail-card">
                <h3>After Location Change</h3>

                <div className="rep-info-grid" style={{ padding: 16 }}>
                  <Info label="Device ID" value={device.id} />
                  <Info label="Device Code" value={device.deviceCode} />
                  <Info label="Device Name" value={device.deviceName} />
                  <Info label="Same IP" value={device.ipAddress} />
                  <Info label="Serial" value={device.serialNumber} />
                  <Info label="Barcode" value={device.barcode} />
                  <Info label="Firmware" value={device.firmware} />
                  <Info label="New Location" value={locationText(newPreview, {})} />
                </div>
              </div>
            </div>

            <div className="replace-form">
              <h3>Location Change Only</h3>
              <p>All device data will stay exactly the same. Change only cluster, building, zone, direction, and lane.</p>

              <div className="replace-grid">
                <div className="replace-field">
                  <label>Cluster</label>
                  <input
                    className="replace-input"
                    value={form.newCluster}
                    onChange={(e) => update("newCluster", e.target.value)}
                  />
                </div>

                <div className="replace-field">
                  <label>Building</label>
                  <input
                    className="replace-input"
                    value={form.newBuilding}
                    onChange={(e) => update("newBuilding", e.target.value)}
                  />
                </div>

                <div className="replace-field">
                  <label>Zone</label>
                  <input
                    className="replace-input"
                    value={form.newZone}
                    onChange={(e) => update("newZone", e.target.value)}
                  />
                </div>

                <div className="replace-field">
                  <label>Direction</label>
                  <select
                    className="replace-input"
                    value={form.newDirection}
                    onChange={(e) => update("newDirection", e.target.value)}
                  >
                    <option value="">Select direction</option>
                    <option value="IN">IN</option>
                    <option value="OUT">OUT</option>
                  </select>
                </div>

                <div className="replace-field replace-half">
                  <label>Lane</label>
                  <input
                    className="replace-input"
                    value={form.newLane}
                    onChange={(e) => update("newLane", e.target.value)}
                  />
                </div>

                <div className="replace-field replace-half">
                  <label>Reason</label>
                  <input
                    className="replace-input"
                    value={form.reason}
                    onChange={(e) => update("reason", e.target.value)}
                    placeholder="Location change reason"
                  />
                </div>

                <div className="replace-field replace-wide">
                  <label>Notes</label>
                  <textarea
                    className="replace-textarea"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {error ? <div className="rep-alert err">{error}</div> : null}

              <div className="rep-alert ok">
                This will update the same device record. No new device will be created.
              </div>

              <div className="replace-actions">
                <button className="rep-btn white" onClick={onClose} disabled={busy}>
                  Cancel
                </button>

                <button className="rep-btn green" onClick={submitReplace} disabled={busy}>
                  {busy ? "Saving..." : "Confirm Location Change"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function DeviceReplacementPage({ onBack, refreshKey = 0 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selected, setSelected] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/device-replacements");
      setRecords(toArray(data));
    } catch (e) {
      setError(e.message || "Failed to load replacement records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords, refreshKey]);

  const stats = useMemo(() => {
    const total = records.length;
    const completed = records.filter(
      (r) => String(r.status || "").toUpperCase() === "COMPLETED"
    ).length;
    const pending = records.filter(
      (r) => String(r.status || "").toUpperCase() === "PENDING"
    ).length;
    const withReason = records.filter((r) => String(r.reason || "").trim()).length;

    return {
      total,
      completed,
      pending,
      withReason,
    };
  }, [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return records.filter((r) => {
      const oldDevice = r.oldDevice || {};
      const newDevice = r.newDevice || {};
      const oldSnapshot = r.oldSnapshot || {};
      const newSnapshot = r.newSnapshot || {};

      if (status !== "ALL" && String(r.status || "").toUpperCase() !== status) {
        return false;
      }

      if (!q) return true;

      const text = [
        r.id,
        r.oldDeviceId,
        r.newDeviceId,
        r.oldIpAddress,
        r.reason,
        r.notes,
        userName(r.replacedBy),

        deviceCode(oldDevice, oldSnapshot),
        deviceCode(newDevice, newSnapshot),

        deviceName(oldDevice, oldSnapshot),
        deviceName(newDevice, newSnapshot),

        readValue(oldDevice, oldSnapshot, "ipAddress"),
        readValue(newDevice, newSnapshot, "ipAddress"),

        readValue(oldDevice, oldSnapshot, "serialNumber"),
        readValue(newDevice, newSnapshot, "serialNumber"),

        readValue(oldDevice, oldSnapshot, "barcode"),
        readValue(newDevice, newSnapshot, "barcode"),

        locationText(oldDevice, oldSnapshot),
        locationText(newDevice, newSnapshot),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [records, search, status]);

  return (
    <section className="rep-page">
      <InjectStyles />

      <div className="rep-hero">
        <div className="rep-hero-left">
          <div className="rep-hero-logo">📱</div>

          <div>
            <h1>Device Replacement Log</h1>
            <p>
              Same device replacement records, old location snapshot, new location snapshot, and inspection history.
            </p>
          </div>
        </div>

        <div className="rep-actions">
          {onBack ? (
            <button className="rep-btn white" onClick={onBack}>
              Back To Devices
            </button>
          ) : null}

          <button className="rep-btn white" onClick={loadRecords} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="rep-stats">
        <div className="rep-stat">
          <span>Total Records</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="rep-stat">
          <span>Completed</span>
          <strong>{stats.completed}</strong>
        </div>

        <div className="rep-stat">
          <span>Pending</span>
          <strong>{stats.pending}</strong>
        </div>

        <div className="rep-stat">
          <span>With Reason</span>
          <strong>{stats.withReason}</strong>
        </div>
      </div>

      <div className="rep-toolbar">
        <input
          className="rep-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by IP, same device id, old location, new location, device code, serial, barcode, reason..."
        />

        <select
          className="rep-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
        </select>

        <button
          className="rep-btn white"
          onClick={() => {
            setSearch("");
            setStatus("ALL");
          }}
        >
          Clear Filters
        </button>
      </div>

      {error ? <div className="rep-alert err">{error}</div> : null}

      {loading ? (
        <div className="rep-empty">Loading replacement records...</div>
      ) : filtered.length === 0 ? (
        <div className="rep-empty">No replacement records found.</div>
      ) : (
        <div className="rep-grid">
          {filtered.map((item) => (
            <ReplacementCard key={item.id} item={item} onOpen={setSelected} />
          ))}
        </div>
      )}

      {selected ? (
        <DetailsModal record={selected} onClose={() => setSelected(null)} />
      ) : null}
    </section>
  );
}

export default DeviceReplacementPage;