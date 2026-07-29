import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/* =========================================================
   SMART IT — LIST + GRID INSPECTIONS PAGE
   File name: src/pages/InspectionsPage.jsx
   Component name: InspectionsPage

   IMPORTANT:
   - No xlsx package.
   - No html2pdf.js package.
   - Excel export is a real SpreadsheetML .xls file.
   - PDF export uses the browser print engine (Save as PDF).
   - Inspection details are loaded only when needed.
   - List and Grid Box views show the first image lazily.
   - Full image gallery is available inside inspection details.
   - Weekday filtering supports one day, several days, or all days.
   - Pagination keeps the page fast with large datasets.
========================================================= */

const DEFAULT_API_BASE = "https://acess-backend-production-8856.up.railway.app";
const CACHE_KEY = "smartit_exact_backend_inspections_cache_v3";
const DEFAULT_PAGE_SIZE = 50;
const SERVER_PAGE_SIZE = 200;
const MAX_SERVER_PAGES = 600;

// JavaScript Date.getDay(): Sunday = 0 ... Saturday = 6.
// Values are strings because the shared MultiSelectFilter compares exact values.
const WEEKDAY_OPTIONS = [
  { value: "0", label: "Sunday — الأحد" },
  { value: "1", label: "Monday — الاثنين" },
  { value: "2", label: "Tuesday — الثلاثاء" },
  { value: "3", label: "Wednesday — الأربعاء" },
  { value: "4", label: "Thursday — الخميس" },
  { value: "5", label: "Friday — الجمعة" },
  { value: "6", label: "Saturday — السبت" },
];
const WEEKDAY_VALUES = WEEKDAY_OPTIONS.map((day) => day.value);

function weekdayLabel(value) {
  return WEEKDAY_OPTIONS.find((day) => day.value === String(value))?.label || String(value);
}

const CSS = `
.si-root, .si-root * { box-sizing: border-box; }
.si-root {
  --navy: #142234;
  --navy-2: #20384f;
  --blue: #159bd3;
  --cyan: #eaf8ff;
  --green: #0f9f75;
  --red: #dc3d4b;
  --orange: #ed8b20;
  --purple: #6657d9;
  --bg: #f3f6f9;
  --card: #ffffff;
  --line: #dde5ec;
  --muted: #64748b;
  --text: #102033;
  min-height: 100vh;
  width: 100%;
  padding: 18px;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, "Segoe UI", Arial, sans-serif;
}
.si-shell { max-width: 1760px; margin: 0 auto; display: grid; gap: 15px; }
.si-top {
  background: linear-gradient(135deg, var(--navy), #125f7e 62%, #149d8c);
  color: #fff;
  border-radius: 22px;
  padding: 20px;
  box-shadow: 0 16px 42px rgba(20,34,52,.16);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.si-kicker { color: #aee8ff; font-size: 11px; font-weight: 900; letter-spacing: .11em; text-transform: uppercase; }
.si-title { margin: 4px 0 5px; font-size: clamp(24px, 3vw, 38px); line-height: 1.05; font-weight: 950; letter-spacing: -.04em; }
.si-subtitle { color: #d8f4ff; font-size: 13px; font-weight: 700; line-height: 1.6; max-width: 850px; }
.si-top-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.si-btn {
  min-height: 40px;
  border-radius: 11px;
  padding: 0 13px;
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: .15s ease;
  white-space: nowrap;
}
.si-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(15,23,42,.10); }
.si-btn:disabled { opacity: .55; cursor: wait; transform: none; box-shadow: none; }
.si-btn.excel { color: #087a51; background: #ecfdf5; border-color: #9be6c7; }
.si-btn.pdf { color: #b4232e; background: #fff1f2; border-color: #ffc7cd; }
.si-btn.primary { color: #fff; background: var(--navy); border-color: var(--navy); }
.si-btn.ghost { color: #fff; background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.26); }
.si-btn.small { min-height: 32px; padding: 0 10px; font-size: 11px; border-radius: 9px; }
.si-select-export {
  height: 40px;
  border-radius: 11px;
  border: 1px solid rgba(255,255,255,.28);
  background: rgba(255,255,255,.13);
  color: #fff;
  padding: 0 10px;
  outline: none;
  font-size: 11px;
  font-weight: 900;
}
.si-select-export option { color: #102033; background: #fff; }
.si-alert { border-radius: 12px; padding: 11px 13px; font-size: 12px; font-weight: 800; line-height: 1.6; }
.si-alert.error { color: #9f2430; background: #fff1f2; border: 1px solid #ffc7cd; }
.si-alert.info { color: #075d79; background: #eaf8ff; border: 1px solid #b9e6f7; }
.si-alert.success { color: #087a51; background: #ecfdf5; border: 1px solid #a7ebcf; }
.si-kpis { display: grid; grid-template-columns: repeat(6, minmax(120px, 1fr)); gap: 11px; }
.si-kpi {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 15px;
  padding: 14px;
  box-shadow: 0 4px 12px rgba(15,23,42,.035);
  border-top: 3px solid var(--accent, var(--blue));
}
.si-kpi-label { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: .06em; font-weight: 900; }
.si-kpi-value { margin-top: 7px; color: var(--accent, var(--text)); font-size: 28px; line-height: 1; font-weight: 950; }
.si-kpi-sub { margin-top: 7px; color: #91a0b1; font-size: 10px; font-weight: 700; }
.si-panel { background: #fff; border: 1px solid var(--line); border-radius: 17px; padding: 15px; box-shadow: 0 4px 12px rgba(15,23,42,.035); }
.si-panel-head { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-bottom: 13px; flex-wrap: wrap; }
.si-panel-title { font-size: 14px; font-weight: 950; }
.si-count { padding: 4px 9px; border-radius: 999px; color: #075d79; background: #eaf8ff; border: 1px solid #b9e6f7; font-size: 11px; font-weight: 900; }
.si-filters { display: grid; grid-template-columns: minmax(220px,2fr) repeat(5,minmax(130px,1fr)); gap: 10px; align-items: end; }
.si-filters.second { margin-top: 10px; grid-template-columns: repeat(8,minmax(120px,1fr)); }
.si-field { display: grid; gap: 5px; min-width: 0; }
.si-field label { color: var(--muted); font-size: 9px; font-weight: 950; letter-spacing: .07em; text-transform: uppercase; }
.si-input, .si-select {
  width: 100%;
  height: 39px;
  border-radius: 10px;
  border: 1px solid #ccd7e1;
  background: #f8fafc;
  color: var(--text);
  padding: 0 10px;
  outline: none;
  font-size: 12px;
  font-weight: 750;
}
.si-input:focus, .si-select:focus { border-color: var(--blue); background: #fff; box-shadow: 0 0 0 3px rgba(21,155,211,.10); }
.si-filter-actions { display: flex; gap: 8px; margin-top: 11px; justify-content: space-between; align-items: center; flex-wrap: wrap; }
.si-filter-note { color: var(--muted); font-size: 11px; font-weight: 750; }
.si-table-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.si-view-toggle { display: inline-flex; gap: 3px; background: #eef2f6; padding: 3px; border-radius: 10px; }
.si-view-toggle button { min-height: 31px; border: 0; border-radius: 8px; padding: 0 10px; background: transparent; color: var(--muted); font-size: 11px; font-weight: 900; cursor: pointer; }
.si-view-toggle button.active { background: #fff; color: var(--text); box-shadow: 0 1px 4px rgba(15,23,42,.12); }
.si-table-wrap { overflow: auto; border: 1px solid var(--line); border-radius: 13px; }
.si-table { width: 100%; min-width: 1450px; border-collapse: collapse; background: #fff; }
.si-table th { position: sticky; top: 0; z-index: 2; background: #f7f9fb; color: #55677a; padding: 10px; border-bottom: 1px solid var(--line); text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: .05em; font-weight: 950; white-space: nowrap; }
.si-table td { padding: 10px; border-bottom: 1px solid #edf1f5; color: #172536; font-size: 11px; font-weight: 750; vertical-align: top; }
.si-table tbody tr:hover td { background: #f9fcfe; }
.si-main-text { font-weight: 950; font-size: 12px; color: var(--text); }
.si-sub-text { margin-top: 3px; color: #7b8c9d; font-size: 10px; font-weight: 700; }
.si-mono { font-family: Consolas, "Courier New", monospace; }
.si-badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 8px; border-radius: 999px; font-size: 9px; font-weight: 950; white-space: nowrap; border: 1px solid transparent; }
.si-badge.ok { color: #087a51; background: #ecfdf5; border-color: #a7ebcf; }
.si-badge.bad { color: #b4232e; background: #fff1f2; border-color: #ffc7cd; }
.si-badge.warn { color: #a65a08; background: #fff7e8; border-color: #ffd6a0; }
.si-badge.muted { color: #526273; background: #f1f5f9; border-color: #dbe3ea; }
.si-cards { display: grid; grid-template-columns: repeat(auto-fill,minmax(315px,1fr)); gap: 12px; }
.si-card { border: 1px solid var(--line); border-top: 3px solid var(--accent,var(--blue)); background: #fff; border-radius: 15px; padding: 13px; box-shadow: 0 3px 10px rgba(15,23,42,.04); }
.si-card-head { display: flex; justify-content: space-between; gap: 9px; align-items: flex-start; }
.si-card-title { font-size: 14px; font-weight: 950; }
.si-card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 11px; }
.si-card-cell { padding: 8px; border-radius: 9px; border: 1px solid #e6ebf0; background: #f8fafc; min-width: 0; }
.si-card-cell b { display: block; color: #718194; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 3px; }
.si-card-cell span { display: block; color: var(--text); font-size: 10px; font-weight: 850; overflow-wrap: anywhere; }
.si-card-cell.wide { grid-column: 1 / -1; }
.si-card-actions { margin-top: 10px; display: flex; justify-content: flex-end; }
.si-pagination { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
.si-pages { display: flex; gap: 5px; align-items: center; flex-wrap: wrap; }
.si-page-btn { width: 33px; height: 33px; border-radius: 8px; border: 1px solid var(--line); background: #fff; color: var(--text); font-size: 11px; font-weight: 900; cursor: pointer; }
.si-page-btn.active { background: var(--navy); color: #fff; border-color: var(--navy); }
.si-empty { min-height: 180px; display: grid; place-items: center; text-align: center; border: 1px dashed #cbd5e1; border-radius: 13px; color: var(--muted); font-size: 12px; font-weight: 850; padding: 22px; }
.si-loading { min-height: 300px; display: grid; place-items: center; text-align: center; color: var(--muted); font-size: 13px; font-weight: 900; }
.si-spinner { width: 40px; height: 40px; margin: 0 auto 12px; border: 4px solid #dfe7ee; border-top-color: var(--blue); border-radius: 50%; animation: si-spin .8s linear infinite; }
@keyframes si-spin { to { transform: rotate(360deg); } }
.si-backdrop { position: fixed; inset: 0; z-index: 9999; background: rgba(15,23,42,.62); padding: 20px; display: grid; place-items: center; backdrop-filter: blur(5px); }
.si-modal { width: min(1180px,96vw); max-height: 92vh; overflow: hidden; display: flex; flex-direction: column; background: #fff; border-radius: 19px; box-shadow: 0 30px 90px rgba(0,0,0,.28); }
.si-modal-head { padding: 16px 18px; color: #fff; background: linear-gradient(135deg,var(--navy),#126c8e); display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.si-modal-title { font-size: 19px; font-weight: 950; }
.si-modal-sub { margin-top: 4px; color: #d6f2ff; font-size: 11px; font-weight: 750; }
.si-close { width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.12); color: #fff; font-size: 20px; cursor: pointer; }
.si-modal-body { overflow: auto; padding: 16px; background: #f7f9fb; }
.si-detail-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 9px; }
.si-detail { border: 1px solid var(--line); background: #fff; border-radius: 10px; padding: 10px; min-height: 63px; }
.si-detail b { display: block; color: var(--muted); font-size: 8px; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 4px; }
.si-detail span { display: block; color: var(--text); font-size: 11px; line-height: 1.5; font-weight: 820; overflow-wrap: anywhere; }
.si-detail.wide { grid-column: 1 / -1; }
.si-modal-section { margin-top: 12px; border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 12px; }
.si-modal-section h3 { margin: 0 0 9px; font-size: 13px; font-weight: 950; }
.si-list { margin: 0; padding-left: 20px; color: #26384b; font-size: 11px; font-weight: 750; line-height: 1.7; }
.si-link-list { display: flex; gap: 7px; flex-wrap: wrap; }
.si-image-link { display: inline-flex; align-items: center; min-height: 32px; padding: 0 10px; border-radius: 8px; border: 1px solid #b9e6f7; background: #eaf8ff; color: #075d79; text-decoration: none; font-size: 10px; font-weight: 900; }

.si-records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
  gap: 16px;
}
.si-grid-card {
  position: relative;
  overflow: hidden;
  border: 1px solid #dce5ec;
  border-radius: 19px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15,23,42,.06);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.si-grid-card:hover {
  transform: translateY(-3px);
  border-color: #b7d7e5;
  box-shadow: 0 18px 38px rgba(15,23,42,.11);
}
.si-grid-card::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--accent, var(--blue));
  z-index: 3;
}
.si-media {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 24% 18%, rgba(21,155,211,.18), transparent 34%),
    linear-gradient(145deg, #e8f5fb, #f8fbfd 55%, #e9eef4);
}
.si-media.grid { aspect-ratio: 16 / 9; }
.si-media.list { min-height: 100%; height: 100%; }
.si-media a { display: block; width: 100%; height: 100%; color: inherit; text-decoration: none; }
.si-media-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform .35s ease;
}
.si-grid-card:hover .si-media-image,
.si-list-item:hover .si-media-image { transform: scale(1.035); }
.si-media-placeholder {
  width: 100%;
  height: 100%;
  min-height: 150px;
  display: grid;
  place-items: center;
  padding: 20px;
  text-align: center;
  color: #587083;
}
.si-media-placeholder-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 9px;
  border-radius: 17px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.86);
  border: 1px solid rgba(21,155,211,.22);
  box-shadow: 0 8px 20px rgba(15,23,42,.08);
  font-size: 24px;
}
.si-media-placeholder b { display: block; color: var(--navy); font-size: 11px; }
.si-media-placeholder span { display: block; margin-top: 4px; color: var(--muted); font-size: 9px; font-weight: 750; }
.si-media-count {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 2;
  min-height: 27px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #fff;
  background: rgba(15,23,42,.76);
  border: 1px solid rgba(255,255,255,.28);
  backdrop-filter: blur(8px);
  font-size: 9px;
  font-weight: 950;
}
.si-media-status {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  box-shadow: 0 7px 18px rgba(15,23,42,.14);
}
.si-grid-card-body { padding: 15px 16px 16px; }
.si-card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.si-grid-title {
  margin: 0;
  color: var(--navy);
  font-size: 16px;
  line-height: 1.25;
  font-weight: 950;
  overflow-wrap: anywhere;
}
.si-grid-subtitle {
  margin-top: 4px;
  color: #7b8c9d;
  font-size: 10px;
  line-height: 1.5;
  font-weight: 750;
}
.si-result-dot {
  flex: 0 0 auto;
  width: 11px;
  height: 11px;
  margin-top: 5px;
  border-radius: 50%;
  background: var(--accent, var(--blue));
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--accent, var(--blue)) 14%, transparent);
}
.si-card-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 8px;
  margin-top: 13px;
}
.si-meta-box {
  min-width: 0;
  padding: 9px 10px;
  border: 1px solid #e3eaf0;
  border-radius: 11px;
  background: #f8fafc;
}
.si-meta-box b {
  display: block;
  margin-bottom: 4px;
  color: #7b8c9d;
  font-size: 8px;
  letter-spacing: .055em;
  text-transform: uppercase;
}
.si-meta-box span {
  display: block;
  color: var(--text);
  font-size: 10px;
  line-height: 1.45;
  font-weight: 850;
  overflow-wrap: anywhere;
}
.si-card-location,
.si-card-note {
  margin-top: 9px;
  padding: 10px 11px;
  border-radius: 11px;
  border: 1px solid #e3eaf0;
}
.si-card-location { background: #f5fbfe; }
.si-card-note { background: #fbfcfd; }
.si-card-location b,
.si-card-note b {
  display: block;
  margin-bottom: 4px;
  color: #718194;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: .055em;
}
.si-card-location span,
.si-card-note span {
  display: -webkit-box;
  color: #23364a;
  font-size: 10px;
  line-height: 1.55;
  font-weight: 800;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.si-card-footer {
  margin-top: 13px;
  padding-top: 12px;
  border-top: 1px solid #e8edf2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 9px;
}
.si-card-counters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.si-counter {
  min-height: 25px;
  padding: 0 8px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #536678;
  background: #f1f5f9;
  border: 1px solid #dfe7ee;
  font-size: 9px;
  font-weight: 900;
}
.si-list-view { display: grid; gap: 13px; }
.si-list-item {
  position: relative;
  display: grid;
  grid-template-columns: 230px minmax(0,1fr) auto;
  min-height: 210px;
  overflow: hidden;
  border: 1px solid #dce5ec;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(15,23,42,.05);
  transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
}
.si-list-item:hover {
  transform: translateY(-2px);
  border-color: #b7d7e5;
  box-shadow: 0 15px 34px rgba(15,23,42,.09);
}
.si-list-item::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--accent, var(--blue));
  z-index: 4;
}
.si-list-body {
  min-width: 0;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
}
.si-list-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
}
.si-list-title {
  margin: 0;
  color: var(--navy);
  font-size: 17px;
  line-height: 1.25;
  font-weight: 950;
}
.si-list-id {
  margin-top: 5px;
  color: #7b8c9d;
  font-size: 10px;
  font-weight: 750;
}
.si-list-info-grid {
  display: grid;
  grid-template-columns: repeat(4,minmax(0,1fr));
  gap: 8px;
  margin-top: 13px;
}
.si-list-note {
  margin-top: 10px;
  padding: 10px 11px;
  border-radius: 11px;
  color: #2c3f52;
  background: #f8fafc;
  border: 1px solid #e2e9ef;
  font-size: 10px;
  line-height: 1.55;
  font-weight: 800;
}
.si-list-side {
  width: 142px;
  padding: 16px 14px;
  border-left: 1px solid #e6edf2;
  background: linear-gradient(180deg,#fbfdfe,#f4f8fb);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;
  gap: 12px;
}
.si-list-side .si-btn { width: 100%; }
.si-list-stats { display: grid; gap: 7px; }
.si-list-stat {
  padding: 8px;
  border-radius: 10px;
  text-align: center;
  background: #fff;
  border: 1px solid #dfe7ee;
}
.si-list-stat b { display: block; color: var(--navy); font-size: 15px; line-height: 1; }
.si-list-stat span { display: block; margin-top: 4px; color: var(--muted); font-size: 8px; text-transform: uppercase; font-weight: 900; }
.si-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill,minmax(210px,1fr));
  gap: 10px;
}
.si-gallery-item {
  position: relative;
  display: block;
  overflow: hidden;
  min-height: 165px;
  border-radius: 12px;
  border: 1px solid #dce5ec;
  background: #edf3f7;
  text-decoration: none;
}
.si-gallery-item img {
  width: 100%;
  height: 185px;
  display: block;
  object-fit: cover;
  transition: transform .25s ease;
}
.si-gallery-item:hover img { transform: scale(1.035); }
.si-gallery-label {
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 8px;
  min-height: 28px;
  padding: 0 9px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #fff;
  background: rgba(15,23,42,.75);
  backdrop-filter: blur(7px);
  font-size: 9px;
  font-weight: 900;
}


.si-multi { position: relative; min-width: 0; }
.si-multi-button {
  width: 100%;
  height: 39px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid #ccd7e1;
  background: #f8fafc;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 850;
  text-align: left;
}
.si-multi-button:hover,
.si-multi-button.open {
  border-color: var(--blue);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(21,155,211,.10);
}
.si-multi-button-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.si-multi-count {
  flex: 0 0 auto;
  min-width: 23px;
  height: 23px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #075d79;
  background: #eaf8ff;
  border: 1px solid #b9e6f7;
  font-size: 9px;
  font-weight: 950;
}
.si-multi-menu {
  position: absolute;
  top: calc(100% + 7px);
  left: 0;
  z-index: 120;
  width: min(360px, 88vw);
  max-height: 390px;
  overflow: hidden;
  border: 1px solid #cbd8e2;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 22px 55px rgba(15,23,42,.20);
}
.si-multi-head { padding: 10px; border-bottom: 1px solid #e6edf2; background: #f8fafc; }
.si-multi-search {
  width: 100%;
  height: 34px;
  border: 1px solid #ccd7e1;
  border-radius: 9px;
  padding: 0 9px;
  outline: none;
  font-size: 10px;
  font-weight: 750;
}
.si-multi-search:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(21,155,211,.10); }
.si-multi-actions { display: flex; gap: 6px; margin-top: 8px; }
.si-multi-action {
  min-height: 29px;
  padding: 0 9px;
  border-radius: 8px;
  border: 1px solid #d9e3ea;
  background: #fff;
  color: #375066;
  cursor: pointer;
  font-size: 9px;
  font-weight: 900;
}
.si-multi-action.primary { color: #075d79; background: #eaf8ff; border-color: #b9e6f7; }
.si-multi-options { max-height: 260px; overflow: auto; padding: 6px; }
.si-multi-option {
  width: 100%;
  min-height: 36px;
  padding: 7px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #22364a;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 10px;
  font-weight: 800;
}
.si-multi-option:hover { background: #f1f7fa; }
.si-multi-option.selected { background: #eaf8ff; color: #075d79; }
.si-multi-check {
  flex: 0 0 auto;
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 1px solid #b9c8d4;
  background: #fff;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 10px;
  font-weight: 950;
}
.si-multi-option.selected .si-multi-check { background: var(--blue); border-color: var(--blue); }
.si-multi-empty { padding: 18px 10px; color: var(--muted); text-align: center; font-size: 10px; font-weight: 800; }
.si-multi-foot { padding: 8px 10px; border-top: 1px solid #e6edf2; color: #718194; background: #fbfdfe; font-size: 9px; font-weight: 800; }
.si-filter-summary {
  margin-top: 11px;
  padding: 10px;
  border: 1px solid #dce7ee;
  border-radius: 12px;
  background: linear-gradient(135deg,#f8fbfd,#f2f8fb);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: wrap;
}
.si-filter-summary-label { color: #64748b; font-size: 9px; font-weight: 950; text-transform: uppercase; letter-spacing: .06em; padding-top: 4px; }
.si-filter-chip {
  min-height: 25px;
  padding: 0 8px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  color: #234258;
  background: #fff;
  border: 1px solid #d6e2e9;
  font-size: 9px;
  font-weight: 900;
}
.si-filter-chip.strong { color: #075d79; background: #eaf8ff; border-color: #b9e6f7; }

@media (max-width: 1250px) { .si-kpis { grid-template-columns: repeat(3,1fr); } .si-filters, .si-filters.second { grid-template-columns: repeat(3,1fr); } .si-detail-grid { grid-template-columns: repeat(2,1fr); } .si-list-info-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 760px) { .si-root { padding: 9px; } .si-kpis, .si-filters, .si-filters.second, .si-detail-grid, .si-card-meta, .si-list-info-grid { grid-template-columns: 1fr; } .si-top-actions { justify-content: flex-start; } .si-card-grid { grid-template-columns: 1fr; } .si-card-cell.wide { grid-column: auto; } .si-records-grid { grid-template-columns: 1fr; } .si-list-item { grid-template-columns: 1fr; } .si-media.list { min-height: 210px; height: 210px; } .si-list-side { width: auto; border-left: 0; border-top: 1px solid #e6edf2; flex-direction: row; align-items: center; } .si-list-stats { grid-template-columns: repeat(3,1fr); flex: 1; } .si-list-side .si-btn { width: auto; } .si-backdrop { padding: 0; align-items: end; } .si-modal { width: 100%; max-height: 95vh; border-radius: 17px 17px 0 0; } }
`;

/* =========================
   API AND NORMALIZATION
========================= */

function cleanBase(value = "") {
  return String(value || "").trim().replace(/\/+$/, "");
}

function getApiBase(apiBaseUrl = "") {
  return (
    cleanBase(apiBaseUrl) ||
    cleanBase(import.meta.env?.VITE_API_BASE_URL) ||
    cleanBase(import.meta.env?.VITE_API_URL) ||
    cleanBase(localStorage.getItem("dashboard_api_base_url")) ||
    cleanBase(localStorage.getItem("apiBaseUrl")) ||
    DEFAULT_API_BASE
  );
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

async function requestJson(base, path) {
  const token = getToken();
  const response = await fetch(`${base}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message = payload?.message || payload?.error || `${response.status} ${response.statusText}`;
    throw new Error(`${path}: ${message}`);
  }

  return payload;
}

async function fetchFirst(base, paths) {
  let lastError = null;
  for (const path of paths) {
    try {
      return { data: await requestJson(base, path), path };
    } catch (error) {
      lastError = error;
      console.warn("Inspection endpoint failed:", path, error);
    }
  }
  throw lastError || new Error("No inspections endpoint is available.");
}


function appendQuery(path, params = {}) {
  const [pathname, existing = ""] = String(path || "").split("?");
  const search = new URLSearchParams(existing);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function finiteNumber(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return null;
}

function backendTotalFromPayload(payload, loadedCount = 0) {
  const total = finiteNumber(
    payload?.total,
    payload?.totalCount,
    payload?.totalRecords,
    payload?.pagination?.total,
    payload?.pagination?.totalCount,
    payload?.meta?.total,
    payload?.meta?.totalCount,
    payload?.data?.total,
    payload?.data?.totalCount,
    payload?.data?.pagination?.total,
    payload?.data?.meta?.total,
    payload?.result?.total,
    payload?.result?.totalCount
  );
  return total === null ? null : Math.max(total, loadedCount);
}

function inspectionIdentity(record = {}, index = 0) {
  const explicitId = first(record.id, record.inspectionId);
  if (explicitId !== undefined && explicitId !== null && explicitId !== "") {
    return `id:${String(explicitId)}`;
  }

  const timestamp = first(
    record.inspectedAt,
    record.completedAt,
    record.taskItem?.completedAt,
    record.createdAt,
    record.updatedAt,
    record.date,
    record.inspectionDate,
    record.scanDate
  );
  const technicianId = first(
    record.technician?.id,
    record.user?.id,
    record.completedBy?.id,
    record.technicianId,
    record.userId,
    record.completedById,
    record.technicianName
  );
  const deviceId = first(
    record.device?.id,
    record.asset?.id,
    record.deviceId,
    record.device?.deviceCode,
    record.deviceCode,
    record.code
  );
  const locationId = first(record.location?.id, record.locationId, record.zone, record.building);
  const status = first(record.inspectionStatus, record.status, record.result, record.currentStatus);

  const fingerprint = [timestamp, technicianId, deviceId, locationId, status]
    .map((value) => normalizeText(value))
    .filter(Boolean)
    .join("|");

  return fingerprint ? `fp:${fingerprint}` : `unknown:${index}`;
}

function mergeUniqueInspectionPages(pages) {
  const map = new Map();
  let index = 0;
  pages.flat().forEach((item) => {
    const key = inspectionIdentity(item, index);
    index += 1;
    const normalized = normalizeInspection(item);
    const old = map.get(key);
    map.set(key, old ? mergeInspection(old, normalized) : normalized);
  });
  return Array.from(map.values()).sort((a, b) =>
    (toDate(b.inspectedAt)?.getTime() || 0) - (toDate(a.inspectedAt)?.getTime() || 0)
  );
}

async function loadAllBackendInspections(base, onProgress = () => {}) {
  const endpoints = [
    "/inspections",
    "/api/inspections",
    "/viewer/inspections",
    "/dashboard/inspections",
    "/reports/latest-inspections",
    "/api/reports/latest-inspections",
  ];

  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      onProgress(`Connecting to backend: ${endpoint}`);
      const firstPath = appendQuery(endpoint, { page: 1, limit: SERVER_PAGE_SIZE });
      const firstPayload = await requestJson(base, firstPath);
      const firstPage = collectInspections(firstPayload);
      if (!firstPage.length) continue;

      const declaredTotal = backendTotalFromPayload(firstPayload, firstPage.length);
      const reliableTotal = declaredTotal !== null && declaredTotal > firstPage.length;
      const detectedPageSize = Math.max(1, firstPage.length);
      const pageGroups = [firstPage];
      let loaded = firstPage.length;
      let pagesLoaded = 1;
      let pageModeWorked = false;

      onProgress(`Backend page 1 loaded: ${loaded}${declaredTotal ? ` / ${declaredTotal}` : ""}`);

      for (let page = 2; page <= MAX_SERVER_PAGES; page += 1) {
        if (reliableTotal && loaded >= declaredTotal) break;
        const payload = await requestJson(base, appendQuery(endpoint, { page, limit: SERVER_PAGE_SIZE }));
        const rows = collectInspections(payload);
        if (!rows.length) break;

        const before = mergeUniqueInspectionPages(pageGroups).length;
        pageGroups.push(rows);
        const after = mergeUniqueInspectionPages(pageGroups).length;
        const newRows = after - before;
        if (newRows <= 0) {
          pageGroups.pop();
          break;
        }

        pageModeWorked = true;
        loaded = after;
        pagesLoaded = page;
        onProgress(`Loading backend pages: ${loaded}${declaredTotal ? ` / ${declaredTotal}` : ""}`);

        if (!declaredTotal && rows.length < detectedPageSize) break;
      }

      let merged = mergeUniqueInspectionPages(pageGroups);

      // Some Nest/Prisma APIs ignore page but support offset/skip.
      if ((!pageModeWorked || (reliableTotal && merged.length < declaredTotal)) && merged.length) {
        for (const mode of ["offset", "skip"]) {
          const groups = [firstPage];
          let current = firstPage.length;
          let modeWorked = false;

          for (let pageIndex = 1; pageIndex < MAX_SERVER_PAGES; pageIndex += 1) {
            if (reliableTotal && current >= declaredTotal) break;
            const start = pageIndex * detectedPageSize;
            const params = mode === "offset"
              ? { offset: start, limit: SERVER_PAGE_SIZE }
              : { skip: start, take: SERVER_PAGE_SIZE, limit: SERVER_PAGE_SIZE };
            const payload = await requestJson(base, appendQuery(endpoint, params));
            const rows = collectInspections(payload);
            if (!rows.length) break;

            const before = mergeUniqueInspectionPages(groups).length;
            groups.push(rows);
            const after = mergeUniqueInspectionPages(groups).length;
            if (after <= before) {
              groups.pop();
              break;
            }

            modeWorked = true;
            current = after;
            onProgress(`Loading backend records: ${current}${declaredTotal ? ` / ${declaredTotal}` : ""}`);
            if (!declaredTotal && rows.length < detectedPageSize) break;
          }

          const candidate = mergeUniqueInspectionPages(groups);
          if (modeWorked && candidate.length > merged.length) {
            merged = candidate;
            pagesLoaded = Math.ceil(candidate.length / detectedPageSize);
          }
          if (!reliableTotal || merged.length >= declaredTotal) break;
        }
      }

      return {
        records: merged,
        endpoint,
        backendTotal: Math.max(declaredTotal || 0, merged.length),
        pagesLoaded,
        serverPageSize: detectedPageSize,
        complete: !reliableTotal || merged.length >= declaredTotal,
      };
    } catch (error) {
      lastError = error;
      console.warn("Backend pagination endpoint failed:", endpoint, error);
    }
  }

  throw lastError || new Error("No inspections endpoint returned backend records.");
}

function first(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safe(value, fallback = "—") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}.@_-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDay(value) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

function formatTime(value, seconds = true) {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    ...(seconds ? { second: "2-digit" } : {}),
  });
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  return `${formatDate(date)} ${formatTime(date, true)}`;
}

function localDateKey(value) {
  const date = toDate(value);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTimeKey(value) {
  const date = toDate(value);
  if (!date) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function normalizeStatus(value) {
  return String(value || "UNKNOWN").trim().toUpperCase();
}

function resultFromStatus(value) {
  const status = normalizeStatus(value);
  if (["OK", "GOOD", "PASS", "PASSED", "DONE", "COMPLETED", "RESOLVED", "FIXED", "ACTIVE", "APPROVED"].includes(status)) return "OK";
  if (["PARTIAL", "IN_PROGRESS", "PENDING", "PENDING_REVIEW", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE"].includes(status)) return "PARTIAL";
  return "NOT_OK";
}

function statusBadgeClass(value) {
  const result = resultFromStatus(value);
  if (result === "OK") return "ok";
  if (result === "PARTIAL") return "warn";
  return "bad";
}

function statusLabel(value) {
  const status = normalizeStatus(value);
  const labels = {
    OK: "OK",
    GOOD: "Good",
    NOT_OK: "Not OK",
    PARTIAL: "Partial",
    FAILED: "Failed",
    PENDING: "Pending",
    PENDING_REVIEW: "Pending Review",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    DONE: "Done",
    RESOLVED: "Resolved",
    UNRESOLVED: "Unresolved",
    NEEDS_MAINTENANCE: "Needs Maintenance",
    UNDER_MAINTENANCE: "Under Maintenance",
    OUT_OF_SERVICE: "Out of Service",
    NOT_REACHABLE: "Not Reachable",
    FIXED: "Fixed",
    ACTIVE: "Active",
    UNKNOWN: "Unknown",
  };
  return labels[status] || status.replaceAll("_", " ");
}

function getTechnician(item = {}) {
  const technician = first(
    item.technician,
    item.user,
    item.completedBy,
    item.createdBy,
    item.inspectedBy,
    item.reportedBy,
    item.assignedTo,
    {}
  );
  return typeof technician === "object" && technician ? technician : {};
}

function technicianName(item = {}) {
  const technician = getTechnician(item);
  return safe(
    first(
      technician.fullName,
      technician.name,
      `${technician.firstName || ""} ${technician.lastName || ""}`.trim(),
      technician.username,
      technician.email,
      item.technicianName,
      item.userName,
      item.completedByName,
      item.createdByName,
      item.technicianId ? `Technician #${item.technicianId}` : ""
    )
  );
}

function getLocation(item = {}) {
  const device = item.device || {};
  const gate = item.gate || {};
  const location = item.location || item.locationSnapshot || device.location || gate.location || {};
  return {
    id: first(location.id, item.locationId, device.locationId, gate.locationId),
    cluster: first(location.cluster, location.clusterName, item.cluster, item.gateCluster, device.gateCluster, gate.cluster),
    building: first(location.building, location.buildingName, item.building, item.gateBuilding, device.gateBuilding, gate.building),
    zone: first(location.zone, location.zoneName, item.zone, item.gateZone, device.gateZone, gate.zone),
    direction: first(location.direction, location.side, item.direction, item.gateDirection, device.gateDirection, gate.direction),
    lane: first(location.lane, location.gateNo, item.lane, gate.gateNo, gate.lane),
    type: first(location.type, gate.type),
  };
}

function getDevice(item = {}) {
  return item.device || item.asset || {};
}

function getGate(item = {}) {
  return item.gate || {};
}

function getImages(item = {}) {
  const candidates = [
    item.images,
    item.inspectionImages,
    item.photos,
    item.attachments,
    item.files,
    item.imageUrls,
    item.proofImages,
    item.evidenceImages,
    item.taskItem?.images,
    item.taskItem?.photos,
  ];

  const output = [];
  candidates.forEach((candidate) => {
    if (Array.isArray(candidate)) output.push(...candidate);
    else if (candidate) output.push(candidate);
  });

  const unique = new Map();
  output.forEach((image, index) => {
    const path = getImagePath(image);
    const key = path || JSON.stringify(image) || String(index);
    if (!unique.has(key)) unique.set(key, image);
  });

  return Array.from(unique.values());
}

function getImagePath(image) {
  if (!image) return "";
  if (typeof image === "string") return image;
  return first(
    image.imageUrl,
    image.url,
    image.secureUrl,
    image.publicUrl,
    image.downloadUrl,
    image.originalUrl,
    image.src,
    image.uri,
    image.path,
    image.filePath,
    image.fullPath,
    image.file?.url,
    image.file?.path,
    image.filename,
    image.fileName
  );
}

function fixFileUrl(path, base) {
  if (!path) return "";
  let value = String(path).trim().replace(/\\/g, "/");
  value = value
    .replace("http://localhost:3000", base)
    .replace("https://localhost:3000", base)
    .replace("http://127.0.0.1:3000", base)
    .replace("https://127.0.0.1:3000", base);
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return value.startsWith("/") ? `${base}${value}` : `${base}/${value}`;
}

function getIssues(item = {}) {
  return asArray(first(item.inspectionIssues, item.issues, item.reportedIssues, item.faults, []));
}

function issueText(issue = {}) {
  const source = issue.issue || issue.problem || issue.fault || issue;
  return safe(first(source.title, source.name, source.description, source.issueCode, issue.notes));
}

function getSteps(item = {}) {
  const direct = asArray(first(item.solutionActions, item.actions, item.inspectionIssueSolutionActions, []));
  const nested = getIssues(item).flatMap((issue) => asArray(first(issue.actions, issue.solutionActions, issue.inspectionIssueSolutionActions, [])));
  return [...direct, ...nested];
}

function stepText(step = {}) {
  const solution = step.solution || step.issueSolution || step.expectedSolution || step;
  return safe(first(solution.title, solution.name, solution.description, step.note, step.notes));
}

function inspectionTime(item = {}) {
  return first(
    item.inspectedAt,
    item.completedAt,
    item.taskItem?.inspectedAt,
    item.taskItem?.completedAt,
    item.scanDate,
    item.scannedAt,
    item.inspectionDate,
    item.date,
    item.createdAt,
    item.updatedAt
  );
}

function normalizeInspection(item = {}) {
  const device = getDevice(item);
  const gate = getGate(item);
  const location = getLocation(item);
  const technician = getTechnician(item);
  const deviceType = device.deviceType || item.deviceType || {};
  const when = inspectionTime(item);
  const status = normalizeStatus(first(item.inspectionStatus, item.status, item.result, item.currentStatus));
  const issues = getIssues(item);
  const steps = getSteps(item);
  const images = getImages(item);

  const normalized = {
    ...item,
    id: first(item.id, item.inspectionId),
    status,
    result: resultFromStatus(status),
    inspectedAt: when,
    technician: {
      ...technician,
      id: first(technician.id, item.technicianId, item.userId, item.completedById, item.createdById),
      name: technicianName(item),
      username: first(technician.username, item.technicianUsername),
      email: first(technician.email, item.technicianEmail),
      phone: first(technician.phone, item.technicianPhone),
    },
    device: {
      ...device,
      id: first(device.id, item.deviceId),
      code: first(device.deviceCode, device.code, item.deviceCode, item.code),
      name: first(device.deviceName, device.name, item.deviceName, "Unknown Device"),
      typeName: first(deviceType.name, device.deviceTypeName, item.deviceTypeName, device.assetType, item.assetType, gate.type, "Unknown"),
      serialNumber: first(device.serialNumber, device.serial, item.serialNumber, item.deviceSerial),
      barcode: first(device.barcode, item.barcode, item.deviceBarcode),
      ipAddress: first(device.ipAddress, device.ip, item.ipAddress),
      manufacturer: first(device.manufacturer, item.manufacturer),
      modelNumber: first(device.modelNumber, item.modelNumber),
      firmware: first(device.firmware, device.firmwareVersion, item.firmware),
      currentStatus: first(device.currentStatus, item.afterStatus, item.newStatus, status),
    },
    gate: {
      ...gate,
      id: first(gate.id, item.gateId),
      gateNo: first(gate.gateNo, item.gateNo, location.lane),
    },
    location,
    issueReason: first(item.issueReason, item.problemReason, item.reason, item.problem, item.issue),
    notes: first(item.notes, item.description, item.details, item.comment),
    beforeStatus: first(item.beforeStatus, item.oldStatus, item.previousStatus, device.previousStatus),
    afterStatus: first(item.afterStatus, item.newStatus, device.currentStatus, status),
    task: item.task || {},
    taskItem: item.taskItem || {},
    issues,
    steps,
    images,
    imagesCount: images.length,
    latitude: first(item.latitude, item.completedLatitude, item.taskItem?.completedLatitude),
    longitude: first(item.longitude, item.completedLongitude, item.taskItem?.completedLongitude),
  };

  normalized.searchText = normalizeText([
    normalized.id,
    normalized.status,
    normalized.result,
    normalized.technician.id,
    normalized.technician.name,
    normalized.technician.username,
    normalized.technician.email,
    normalized.device.id,
    normalized.device.code,
    normalized.device.name,
    normalized.device.typeName,
    normalized.device.serialNumber,
    normalized.device.barcode,
    normalized.device.ipAddress,
    normalized.location.cluster,
    normalized.location.building,
    normalized.location.zone,
    normalized.location.direction,
    normalized.location.lane,
    normalized.issueReason,
    normalized.notes,
    issues.map(issueText).join(" "),
    steps.map(stepText).join(" "),
  ].join(" "));

  return normalized;
}

function mergeInspection(base = {}, details = {}) {
  return normalizeInspection({
    ...base,
    ...details,
    technician: { ...(base.technician || {}), ...(details.technician || {}) },
    user: { ...(base.user || {}), ...(details.user || {}) },
    device: { ...(base.device || {}), ...(details.device || {}) },
    gate: { ...(base.gate || {}), ...(details.gate || {}) },
    location: { ...(base.location || {}), ...(details.location || {}) },
    task: { ...(base.task || {}), ...(details.task || {}) },
    taskItem: { ...(base.taskItem || {}), ...(details.taskItem || {}) },
  });
}

function collectInspections(payload) {
  const collected = [];

  const add = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(add);
      return;
    }
    collected.push(value);
  };

  if (Array.isArray(payload)) add(payload);

  const containers = [payload, payload?.data, payload?.result, payload?.payload].filter(Boolean);
  for (const container of containers) {
    for (const key of ["inspections", "items", "rows", "records", "results", "latestInspections"]) {
      if (Array.isArray(container?.[key])) add(container[key]);
    }

    if (Array.isArray(container?.locations)) {
      container.locations.forEach((locationRow) => {
        add(locationRow.inspections);
        add(locationRow.latestInspections);
        add(locationRow.lastInspection);
        [
          ...asArray(locationRow.devices),
          ...asArray(locationRow.inspectedDevices),
          ...asArray(locationRow.notInspectedDevices),
        ].forEach((device) => {
          add(device.inspections);
          add(device.latestInspection);
          add(device.lastInspection);
        });
      });
    }
  }

  const map = new Map();
  collected.forEach((item, index) => {
    const normalized = normalizeInspection(item);
    const key = inspectionIdentity(item, index);
    const old = map.get(key);
    map.set(key, old ? mergeInspection(old, normalized) : normalized);
  });

  return Array.from(map.values()).sort((a, b) => {
    return (toDate(b.inspectedAt)?.getTime() || 0) - (toDate(a.inspectedAt)?.getTime() || 0);
  });
}

function readCache() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.records)) return { records: [], endpoint: "" };
    return {
      records: parsed.records.map(normalizeInspection),
      endpoint: parsed.endpoint || "session cache",
    };
  } catch {
    return { records: [], endpoint: "" };
  }
}

function writeCache(records, endpoint) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      savedAt: new Date().toISOString(),
      endpoint,
      records,
    }));
  } catch {
    // Cache is optional.
  }
}

/* =========================
   EXPORT HELPERS
========================= */

function xmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function htmlEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function imageUrls(record, base) {
  return record.images
    .map((image) => fixFileUrl(getImagePath(image), base))
    .filter(Boolean);
}

function exportRow(record, base) {
  const when = record.inspectedAt;
  const issues = record.issues.map(issueText).filter((value) => value !== "—");
  const steps = record.steps.map(stepText).filter((value) => value !== "—");
  const urls = imageUrls(record, base);
  const task = record.task || {};

  return {
    "Inspection ID": safe(record.id, ""),
    "Technician ID": safe(record.technician.id, ""),
    "Technician Name": safe(record.technician.name, ""),
    "Technician Username": safe(record.technician.username, ""),
    "Technician Email": safe(record.technician.email, ""),
    "Technician Phone": safe(record.technician.phone, ""),
    Day: formatDay(when),
    Date: formatDate(when),
    "Exact Time": formatTime(when, true),
    Timestamp: safe(when, ""),
    "Device ID": safe(record.device.id, ""),
    "Device Code": safe(record.device.code, ""),
    "Device Name": safe(record.device.name, ""),
    "Device Type": safe(record.device.typeName, ""),
    Manufacturer: safe(record.device.manufacturer, ""),
    Model: safe(record.device.modelNumber, ""),
    Serial: safe(record.device.serialNumber, ""),
    Barcode: safe(record.device.barcode, ""),
    "IP Address": safe(record.device.ipAddress, ""),
    Status: statusLabel(record.status),
    Result: record.result,
    "Before Status": statusLabel(record.beforeStatus),
    "After Status": statusLabel(record.afterStatus),
    Cluster: safe(record.location.cluster, ""),
    Building: safe(record.location.building, ""),
    Zone: safe(record.location.zone, ""),
    Direction: safe(record.location.direction, ""),
    "Lane / Gate": safe(first(record.location.lane, record.gate.gateNo), ""),
    "Location Type": safe(record.location.type, ""),
    "Problem Reason": safe(record.issueReason, ""),
    Issues: issues.join(" | "),
    "Solution Steps": steps.join(" | "),
    "Images Count": record.images.length,
    "Image URLs": urls.join(" | "),
    Latitude: safe(record.latitude, ""),
    Longitude: safe(record.longitude, ""),
    "Task ID": safe(first(task.id, record.taskId), ""),
    "Task Title": safe(task.title, ""),
    "Task Status": safe(task.status, ""),
    Notes: safe(record.notes, ""),
    "Created At": safe(record.createdAt, ""),
    "Updated At": safe(record.updatedAt, ""),
    "Raw JSON": JSON.stringify(record).slice(0, 32000),
  };
}

function technicianDailyRows(records) {
  const map = new Map();
  records.forEach((record) => {
    const date = localDateKey(record.inspectedAt) || "Unknown date";
    const technician = safe(record.technician.name, "Unknown technician");
    const key = `${technician}__${date}`;
    const current = map.get(key) || {
      technician,
      date,
      day: formatDay(record.inspectedAt),
      firstTime: record.inspectedAt,
      lastTime: record.inspectedAt,
      total: 0,
      ok: 0,
      partial: 0,
      notOk: 0,
      deviceTypes: new Set(),
      devices: new Set(),
    };

    current.total += 1;
    if (record.result === "OK") current.ok += 1;
    else if (record.result === "PARTIAL") current.partial += 1;
    else current.notOk += 1;

    current.deviceTypes.add(safe(record.device.typeName, "Unknown"));
    current.devices.add(safe(first(record.device.code, record.device.id), "Unknown"));

    if ((toDate(record.inspectedAt)?.getTime() || 0) < (toDate(current.firstTime)?.getTime() || 0)) current.firstTime = record.inspectedAt;
    if ((toDate(record.inspectedAt)?.getTime() || 0) > (toDate(current.lastTime)?.getTime() || 0)) current.lastTime = record.inspectedAt;

    map.set(key, current);
  });

  return Array.from(map.values())
    .sort((a, b) =>
      String(a.date).localeCompare(String(b.date)) ||
      (toDate(a.firstTime)?.getTime() || 0) - (toDate(b.firstTime)?.getTime() || 0) ||
      a.technician.localeCompare(b.technician, "en")
    )
    .map((row) => ({
      "Technician Name": row.technician,
      Day: row.day,
      Date: row.date,
      "First Inspection": formatTime(row.firstTime, true),
      "Last Inspection": formatTime(row.lastTime, true),
      "Total Inspections": row.total,
      "Different Devices": row.devices.size,
      "Device Types": Array.from(row.deviceTypes).join(" | "),
      OK: row.ok,
      Partial: row.partial,
      "Not OK": row.notOk,
    }));
}

function spreadsheetXml(sheets) {
  const worksheetXml = sheets.map(({ name, rows }) => {
    const headers = rows.length ? Object.keys(rows[0]) : ["No Data"];
    const dataRows = rows.length ? rows : [{ "No Data": "No matching records" }];

    const headerXml = headers
      .map((header) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${xmlEscape(header)}</Data></Cell>`)
      .join("");

    const rowsXml = dataRows.map((row) => {
      const cells = headers.map((header) => {
        const value = row[header];
        const type = typeof value === "number" && Number.isFinite(value) ? "Number" : "String";
        return `<Cell><Data ss:Type="${type}">${xmlEscape(value)}</Data></Cell>`;
      }).join("");
      return `<Row>${cells}</Row>`;
    }).join("");

    return `
      <Worksheet ss:Name="${xmlEscape(name.slice(0, 31))}">
        <Table>
          <Row>${headerXml}</Row>
          ${rowsXml}
        </Table>
        <WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">
          <FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane>
          <ProtectObjects>False</ProtectObjects><ProtectScenarios>False</ProtectScenarios>
        </WorksheetOptions>
      </Worksheet>`;
  }).join("");

  return `<?xml version="1.0"?>
  <?mso-application progid="Excel.Sheet"?>
  <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Styles>
      <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Top" ss:WrapText="1"/><Font ss:FontName="Arial" ss:Size="10"/></Style>
      <Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#142234" ss:Pattern="Solid"/><Alignment ss:Vertical="Center" ss:WrapText="1"/></Style>
    </Styles>
    ${worksheetXml}
  </Workbook>`;
}

function conditionLabel(record) {
  if (record.result === "OK") return "سليم / GOOD";
  if (record.result === "PARTIAL") return "يحتاج متابعة / FOLLOW-UP";
  return "غير سليم / NOT GOOD";
}

function deviceNumber(record) {
  return safe(first(record.device.code, record.device.id), "—");
}

function deviceTypeNumber(record) {
  return safe(first(record.device.modelNumber, record.device.serialNumber, record.device.barcode), "—");
}

function selectedFilterText(selected, allValues, allLabel, formatter = (value) => value) {
  if (!selected.length) return `${allLabel} (${allValues.length})`;
  return selected.map(formatter).join(" | ");
}

function inspectionTimestamp(record) {
  return toDate(record.inspectedAt)?.getTime() || 0;
}

function technicianPdfSummary(records) {
  const map = new Map();

  records.forEach((record) => {
    const name = safe(record.technician.name, "Unknown technician");
    const current = map.get(name) || {
      name,
      total: 0,
      ok: 0,
      partial: 0,
      notOk: 0,
      first: record.inspectedAt,
      last: record.inspectedAt,
    };

    current.total += 1;
    if (record.result === "OK") current.ok += 1;
    else if (record.result === "PARTIAL") current.partial += 1;
    else current.notOk += 1;

    if (inspectionTimestamp(record) < (toDate(current.first)?.getTime() || 0)) current.first = record.inspectedAt;
    if (inspectionTimestamp(record) > (toDate(current.last)?.getTime() || 0)) current.last = record.inspectedAt;
    map.set(name, current);
  });

  return Array.from(map.values()).sort((a, b) => {
    return (toDate(a.first)?.getTime() || 0) - (toDate(b.first)?.getTime() || 0) || a.name.localeCompare(b.name, "en");
  });
}

function pdfTimelineRowHtml(record, index) {
  const location = [
    record.location.building,
    record.location.zone,
    record.location.direction,
    first(record.location.lane, record.gate.gateNo),
  ].filter(Boolean).join(" · ") || "—";

  return `<tr>
    <td class="num">${index + 1}</td>
    <td><strong>${htmlEscape(formatDate(record.inspectedAt))}</strong><small>${htmlEscape(formatDay(record.inspectedAt))}</small></td>
    <td class="time">${htmlEscape(formatTime(record.inspectedAt, true))}</td>
    <td class="technician">${htmlEscape(record.technician.name)}</td>
    <td><strong>${htmlEscape(record.device.name)}</strong><small>Inspection #${htmlEscape(safe(record.id))}</small></td>
    <td><strong>${htmlEscape(deviceNumber(record))}</strong><small>ID: ${htmlEscape(safe(record.device.id))}</small></td>
    <td><strong>${htmlEscape(record.device.typeName)}</strong><small>No: ${htmlEscape(deviceTypeNumber(record))}</small></td>
    <td class="condition ${record.result === "OK" ? "good" : record.result === "PARTIAL" ? "partial" : "bad"}">${htmlEscape(conditionLabel(record))}</td>
    <td>${htmlEscape(safe(record.location.cluster))}</td>
    <td class="location">${htmlEscape(location)}</td>
  </tr>`;
}

/* =========================
   SMALL COMPONENTS
========================= */

function Kpi({ label, value, sub, accent }) {
  return (
    <div className="si-kpi" style={{ "--accent": accent }}>
      <div className="si-kpi-label">{label}</div>
      <div className="si-kpi-value">{value}</div>
      <div className="si-kpi-sub">{sub}</div>
    </div>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={`si-detail ${wide ? "wide" : ""}`}>
      <b>{label}</b>
      <span>{safe(value)}</span>
    </div>
  );
}


function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
  allLabel,
  formatOption = (value) => value,
}) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeText(query);
  const allSelected = selected.length === 0;

  useEffect(() => {
    if (!open) return undefined;

    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const visibleOptions = options.filter((value) => {
    if (!normalizedQuery) return true;
    return normalizeText(formatOption(value)).includes(normalizedQuery);
  });

  const isChecked = (value) => allSelected || selected.includes(value);

  const toggleValue = (value) => {
    if (allSelected) {
      const next = options.filter((option) => option !== value);
      onChange(next.length === options.length ? [] : next);
      return;
    }

    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    if (!next.length || next.length === options.length) onChange([]);
    else onChange(next);
  };

  const buttonText = allSelected
    ? allLabel
    : selected.length === 1
      ? formatOption(selected[0])
      : `${selected.length} selected`;

  return (
    <div className="si-field si-multi" ref={rootRef}>
      <label>{label}</label>
      <button
        type="button"
        className={`si-multi-button ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span className="si-multi-button-text">{buttonText}</span>
        <span className="si-multi-count">{allSelected ? "ALL" : selected.length}</span>
      </button>

      {open ? (
        <div className="si-multi-menu">
          <div className="si-multi-head">
            <input
              className="si-multi-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}...`}
              autoFocus
            />
            <div className="si-multi-actions">
              <button type="button" className="si-multi-action primary" onClick={() => onChange([])}>
                Select all
              </button>
              <button type="button" className="si-multi-action" onClick={() => setQuery("")}>
                Clear search
              </button>
              <button type="button" className="si-multi-action" onClick={() => setOpen(false)}>
                Done
              </button>
            </div>
          </div>

          <div className="si-multi-options">
            {visibleOptions.length ? visibleOptions.map((value) => {
              const checked = isChecked(value);
              return (
                <button
                  type="button"
                  className={`si-multi-option ${checked ? "selected" : ""}`}
                  key={value}
                  onClick={() => toggleValue(value)}
                >
                  <span className="si-multi-check">{checked ? "✓" : ""}</span>
                  <span>{formatOption(value)}</span>
                </button>
              );
            }) : <div className="si-multi-empty">No matching options.</div>}
          </div>

          <div className="si-multi-foot">
            {allSelected ? `All ${options.length} option(s) are included.` : `${selected.length} of ${options.length} selected.`}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function inspectionAccent(record) {
  return record.result === "OK" ? "#0f9f75" : record.result === "PARTIAL" ? "#ed8b20" : "#dc3d4b";
}

function locationLine(record) {
  return [
    record.location.cluster,
    record.location.building,
    record.location.zone,
    record.location.direction,
    first(record.location.lane, record.gate.gateNo),
  ].filter(Boolean).join(" · ") || "—";
}

function InspectionMedia({ record, base, mode = "grid" }) {
  const urls = imageUrls(record, base);
  const [broken, setBroken] = useState(false);
  const firstUrl = urls[0];

  return (
    <div className={`si-media ${mode}`}>
      <span className={`si-badge ${statusBadgeClass(record.status)} si-media-status`}>
        {statusLabel(record.status)}
      </span>

      {firstUrl && !broken ? (
        <a href={firstUrl} target="_blank" rel="noreferrer" title="Open the original inspection image">
          <img
            className="si-media-image"
            src={firstUrl}
            alt={`Inspection ${safe(record.id)} — ${safe(first(record.device.code, record.device.name))}`}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        </a>
      ) : (
        <div className="si-media-placeholder">
          <div>
            <div className="si-media-placeholder-icon">▧</div>
            <b>{urls.length ? "Image could not be loaded" : "No inspection image"}</b>
            <span>{safe(first(record.device.code, record.device.name, record.id))}</span>
          </div>
        </div>
      )}

      <div className="si-media-count">▣ {urls.length} image{urls.length === 1 ? "" : "s"}</div>
    </div>
  );
}

function InspectionGridCard({ record, base, onOpen }) {
  const accent = inspectionAccent(record);

  return (
    <article className="si-grid-card" style={{ "--accent": accent }}>
      <InspectionMedia record={record} base={base} mode="grid" />

      <div className="si-grid-card-body">
        <div className="si-card-title-row">
          <div>
            <h3 className="si-grid-title">{safe(first(record.device.code, record.device.name, record.id))}</h3>
            <div className="si-grid-subtitle">
              Inspection #{safe(record.id)} · {safe(record.device.typeName)}
            </div>
          </div>
          <span className="si-result-dot" aria-hidden="true" />
        </div>

        <div className="si-card-meta">
          <div className="si-meta-box">
            <b>Technician</b>
            <span>{record.technician.name}</span>
          </div>
          <div className="si-meta-box">
            <b>Date & Time</b>
            <span>{formatDate(record.inspectedAt)} · {formatTime(record.inspectedAt, true)}</span>
          </div>
          <div className="si-meta-box">
            <b>Serial</b>
            <span className="si-mono">{safe(record.device.serialNumber)}</span>
          </div>
          <div className="si-meta-box">
            <b>IP Address</b>
            <span className="si-mono">{safe(record.device.ipAddress)}</span>
          </div>
        </div>

        <div className="si-card-location">
          <b>Location</b>
          <span>{locationLine(record)}</span>
        </div>

        <div className="si-card-note">
          <b>Problem / Notes</b>
          <span>{safe(first(record.issueReason, record.notes), "No problem saved")}</span>
        </div>

        <div className="si-card-footer">
          <div className="si-card-counters">
            <span className="si-counter">⚠ {record.issues.length} issues</span>
            <span className="si-counter">✓ {record.steps.length} steps</span>
            <span className="si-counter">▣ {record.images.length} images</span>
          </div>
          <button type="button" className="si-btn small primary" onClick={() => onOpen(record)}>
            Full Details
          </button>
        </div>
      </div>
    </article>
  );
}

function InspectionListItem({ record, base, onOpen }) {
  const accent = inspectionAccent(record);

  return (
    <article className="si-list-item" style={{ "--accent": accent }}>
      <InspectionMedia record={record} base={base} mode="list" />

      <div className="si-list-body">
        <div className="si-list-top">
          <div>
            <h3 className="si-list-title">{safe(first(record.device.code, record.device.name, record.id))}</h3>
            <div className="si-list-id">
              Inspection #{safe(record.id)} · {safe(record.device.typeName)} · {statusLabel(record.beforeStatus)} → {statusLabel(record.afterStatus)}
            </div>
          </div>
          <span className={`si-badge ${statusBadgeClass(record.status)}`}>{statusLabel(record.status)}</span>
        </div>

        <div className="si-list-info-grid">
          <div className="si-meta-box">
            <b>Technician</b>
            <span>{record.technician.name}</span>
          </div>
          <div className="si-meta-box">
            <b>Day / Date</b>
            <span>{formatDay(record.inspectedAt)} · {formatDate(record.inspectedAt)}</span>
          </div>
          <div className="si-meta-box">
            <b>Exact Time</b>
            <span className="si-mono">{formatTime(record.inspectedAt, true)}</span>
          </div>
          <div className="si-meta-box">
            <b>Serial / IP</b>
            <span className="si-mono">{safe(record.device.serialNumber)} · {safe(record.device.ipAddress)}</span>
          </div>
          <div className="si-meta-box">
            <b>Location</b>
            <span>{locationLine(record)}</span>
          </div>
          <div className="si-meta-box">
            <b>Result</b>
            <span>{safe(record.result)}</span>
          </div>
          <div className="si-meta-box">
            <b>Device ID</b>
            <span>{safe(record.device.id)}</span>
          </div>
          <div className="si-meta-box">
            <b>Technician ID</b>
            <span>{safe(record.technician.id)}</span>
          </div>
        </div>

        <div className="si-list-note">
          <strong>Problem / Notes:</strong>{" "}
          {safe(first(record.issueReason, record.notes), "No problem saved")}
        </div>
      </div>

      <aside className="si-list-side">
        <div className="si-list-stats">
          <div className="si-list-stat"><b>{record.issues.length}</b><span>Issues</span></div>
          <div className="si-list-stat"><b>{record.steps.length}</b><span>Steps</span></div>
          <div className="si-list-stat"><b>{record.images.length}</b><span>Images</span></div>
        </div>
        <button type="button" className="si-btn small primary" onClick={() => onOpen(record)}>
          Open Details
        </button>
      </aside>
    </article>
  );
}

function DetailsModal({ selected, base, onClose }) {
  if (!selected) return null;
  const record = selected.record;
  const imageLinks = imageUrls(record, base);

  return (
    <div className="si-backdrop" onMouseDown={onClose}>
      <div className="si-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="si-modal-head">
          <div>
            <div className="si-modal-title">Inspection #{safe(record.id)}</div>
            <div className="si-modal-sub">
              {record.device.code || record.device.name} · {record.technician.name} · {formatDateTime(record.inspectedAt)}
            </div>
          </div>
          <button type="button" className="si-close" onClick={onClose}>×</button>
        </div>

        <div className="si-modal-body">
          {selected.loading ? <div className="si-alert info">Loading full details only for this inspection...</div> : null}
          {selected.error ? <div className="si-alert error">Detail endpoint did not return extra data. The list data is still shown. {selected.error}</div> : null}

          <div className="si-detail-grid">
            <Detail label="Inspection ID" value={record.id} />
            <Detail label="Status" value={statusLabel(record.status)} />
            <Detail label="Result" value={record.result} />
            <Detail label="Exact Date & Time" value={formatDateTime(record.inspectedAt)} />
            <Detail label="Technician ID" value={record.technician.id} />
            <Detail label="Technician Name" value={record.technician.name} />
            <Detail label="Username" value={record.technician.username} />
            <Detail label="Email / Phone" value={[record.technician.email, record.technician.phone].filter(Boolean).join(" · ")} />
            <Detail label="Device ID" value={record.device.id} />
            <Detail label="Device Code" value={record.device.code} />
            <Detail label="Device Name" value={record.device.name} />
            <Detail label="Device Type" value={record.device.typeName} />
            <Detail label="Manufacturer / Model" value={[record.device.manufacturer, record.device.modelNumber].filter(Boolean).join(" · ")} />
            <Detail label="Serial" value={record.device.serialNumber} />
            <Detail label="Barcode" value={record.device.barcode} />
            <Detail label="IP Address" value={record.device.ipAddress} />
            <Detail label="Before Status" value={statusLabel(record.beforeStatus)} />
            <Detail label="After Status" value={statusLabel(record.afterStatus)} />
            <Detail label="Cluster" value={record.location.cluster} />
            <Detail label="Building" value={record.location.building} />
            <Detail label="Zone" value={record.location.zone} />
            <Detail label="Direction" value={record.location.direction} />
            <Detail label="Lane / Gate" value={first(record.location.lane, record.gate.gateNo)} />
            <Detail label="GPS" value={record.latitude && record.longitude ? `${record.latitude}, ${record.longitude}` : ""} />
            <Detail label="Problem Reason" value={record.issueReason} wide />
            <Detail label="Notes" value={record.notes} wide />
          </div>

          <div className="si-modal-section">
            <h3>Issues ({record.issues.length})</h3>
            {record.issues.length ? <ol className="si-list">{record.issues.map((issue, index) => <li key={issue.id || index}>{issueText(issue)}</li>)}</ol> : <div className="si-sub-text">No issues returned by the API.</div>}
          </div>

          <div className="si-modal-section">
            <h3>Solution Steps ({record.steps.length})</h3>
            {record.steps.length ? <ol className="si-list">{record.steps.map((step, index) => <li key={step.id || index}>{stepText(step)} · {statusLabel(step.status)}</li>)}</ol> : <div className="si-sub-text">No solution steps returned by the API.</div>}
          </div>

          <div className="si-modal-section">
            <h3>Inspection Images ({imageLinks.length})</h3>
            {imageLinks.length ? (
              <div className="si-gallery-grid">
                {imageLinks.map((url, index) => (
                  <a
                    className="si-gallery-item"
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    key={`${url}-${index}`}
                    title={`Open inspection image ${index + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Inspection ${safe(record.id)} image ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="si-gallery-label">
                      <span>Image {index + 1}</span>
                      <span>Open ↗</span>
                    </span>
                  </a>
                ))}
              </div>
            ) : <div className="si-sub-text">No inspection image paths were returned by the API.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   MAIN PAGE
========================= */

export function InspectionsPage({ apiBaseUrl = "" }) {
  const base = useMemo(() => getApiBase(apiBaseUrl), [apiBaseUrl]);
  const detailCacheRef = useRef(new Map());
  const previewHydratedRef = useRef(new Set());

  // Backend is the only source of truth. Old browser cache is never counted.
  const [records, setRecords] = useState([]);
  const [endpoint, setEndpoint] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadProgress, setLoadProgress] = useState("");
  const [backendInfo, setBackendInfo] = useState({
    total: 0,
    loaded: 0,
    pages: 0,
    pageSize: 0,
    complete: false,
  });

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  // Empty array means ALL. Any number of values can be selected together.
  const [technicianFilters, setTechnicianFilters] = useState([]);
  const [typeFilters, setTypeFilters] = useState([]);
  const [statusFilters, setStatusFilters] = useState([]);
  const [resultFilters, setResultFilters] = useState([]);
  const [clusterFilters, setClusterFilters] = useState([]);
  const [buildingFilters, setBuildingFilters] = useState([]);
  const [zoneFilters, setZoneFilters] = useState([]);
  // Empty means all weekdays. Multiple weekdays can be selected together.
  const [weekdayFilters, setWeekdayFilters] = useState([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [sortOrder, setSortOrder] = useState("DESC");

  const [viewMode, setViewMode] = useState("LIST");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);

  const [exportScope, setExportScope] = useState("FILTERED");
  const [exportDetailMode, setExportDetailMode] = useState("FAST");
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");

  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoadProgress("Starting a fresh backend load...");
    setRecords([]);
    setBackendInfo({ total: 0, loaded: 0, pages: 0, pageSize: 0, complete: false });
    detailCacheRef.current.clear();
    previewHydratedRef.current.clear();
    sessionStorage.removeItem(CACHE_KEY);

    try {
      const response = await loadAllBackendInspections(base, setLoadProgress);
      setRecords(response.records);
      setEndpoint(response.endpoint);
      setBackendInfo({
        total: response.backendTotal,
        loaded: response.records.length,
        pages: response.pagesLoaded,
        pageSize: response.serverPageSize,
        complete: response.complete,
      });

      if (!response.records.length) {
        setError("The backend endpoint worked, but it returned zero inspection records.");
      } else if (!response.complete) {
        setError(`Backend pagination is incomplete: loaded ${response.records.length} of ${response.backendTotal}. No cached records were added.`);
      }
    } catch (loadError) {
      setRecords([]);
      setBackendInfo({ total: 0, loaded: 0, pages: 0, pageSize: 0, complete: false });
      setError(loadError?.message || "Failed to load inspections directly from the backend.");
    } finally {
      setLoadProgress("");
      setLoading(false);
    }
  }, [base]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const options = useMemo(() => {
    const unique = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "en"));
    return {
      technicians: unique(records.map((record) => record.technician.name).filter((value) => value !== "—")),
      types: unique(records.map((record) => record.device.typeName).filter((value) => value !== "Unknown")),
      statuses: unique(records.map((record) => record.status)),
      clusters: unique(records.map((record) => record.location.cluster)),
      buildings: unique(records.map((record) => record.location.building)),
      zones: unique(records.map((record) => record.location.zone)),
    };
  }, [records]);

  const filtered = useMemo(() => {
    const queryTokens = normalizeText(deferredSearch).split(" ").filter(Boolean);
    const startBoundary = dateFrom
      ? toDate(`${dateFrom}T${timeFrom || "00:00:00"}`)
      : null;
    const endBoundary = dateTo
      ? toDate(`${dateTo}T${timeTo || "23:59:59.999"}`)
      : null;

    const timeToMinutes = (value) => {
      if (!value) return null;
      const [hours, minutes] = value.split(":").map(Number);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
      return hours * 60 + minutes;
    };

    const fromMinutes = !dateFrom ? timeToMinutes(timeFrom) : null;
    const toMinutes = !dateTo ? timeToMinutes(timeTo) : null;

    const result = records.filter((record) => {
      if (queryTokens.length && !queryTokens.every((token) => record.searchText.includes(token))) return false;
      if (technicianFilters.length && !technicianFilters.includes(record.technician.name)) return false;
      if (typeFilters.length && !typeFilters.includes(record.device.typeName)) return false;
      if (statusFilters.length && !statusFilters.includes(record.status)) return false;
      if (resultFilters.length && !resultFilters.includes(record.result)) return false;
      if (clusterFilters.length && !clusterFilters.includes(record.location.cluster)) return false;
      if (buildingFilters.length && !buildingFilters.includes(record.location.building)) return false;
      if (zoneFilters.length && !zoneFilters.includes(record.location.zone)) return false;

      const inspectedDate = toDate(record.inspectedAt);
      if (!inspectedDate) {
        return !weekdayFilters.length && !dateFrom && !dateTo && !timeFrom && !timeTo;
      }

      // Filter using the same local weekday that is shown by formatDay().
      // This keeps Sunday/Monday/etc. aligned with the displayed inspection date.
      if (weekdayFilters.length && !weekdayFilters.includes(String(inspectedDate.getDay()))) return false;

      if (startBoundary && inspectedDate.getTime() < startBoundary.getTime()) return false;
      if (endBoundary && inspectedDate.getTime() > endBoundary.getTime()) return false;

      const recordMinutes = inspectedDate.getHours() * 60 + inspectedDate.getMinutes();
      if (fromMinutes !== null && recordMinutes < fromMinutes) return false;
      if (toMinutes !== null && recordMinutes > toMinutes) return false;

      return true;
    });

    return result.sort((a, b) => {
      const difference = inspectionTimestamp(a) - inspectionTimestamp(b);
      if (difference !== 0) return sortOrder === "ASC" ? difference : -difference;
      return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
    });
  }, [
    records,
    deferredSearch,
    technicianFilters,
    typeFilters,
    statusFilters,
    resultFilters,
    clusterFilters,
    buildingFilters,
    zoneFilters,
    weekdayFilters,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    deferredSearch,
    technicianFilters,
    typeFilters,
    statusFilters,
    resultFilters,
    clusterFilters,
    buildingFilters,
    zoneFilters,
    weekdayFilters,
    dateFrom,
    dateTo,
    timeFrom,
    timeTo,
    sortOrder,
    pageSize,
  ]);

  const stats = useMemo(() => {
    const today = localDateKey(new Date());
    return {
      total: filtered.length,
      today: filtered.filter((record) => localDateKey(record.inspectedAt) === today).length,
      ok: filtered.filter((record) => record.result === "OK").length,
      partial: filtered.filter((record) => record.result === "PARTIAL").length,
      notOk: filtered.filter((record) => record.result === "NOT_OK").length,
      technicians: new Set(filtered.map((record) => record.technician.name).filter((value) => value !== "—")).size,
    };
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRecords = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    return filtered.slice(startIndex, startIndex + pageSize);
  }, [filtered, safePage, pageSize]);

  const pageNumbers = useMemo(() => {
    const result = [];
    const startNumber = Math.max(1, safePage - 2);
    const endNumber = Math.min(pageCount, safePage + 2);
    for (let number = startNumber; number <= endNumber; number += 1) result.push(number);
    return result;
  }, [safePage, pageCount]);

  const resetFilters = () => {
    setSearch("");
    setTechnicianFilters([]);
    setTypeFilters([]);
    setStatusFilters([]);
    setResultFilters([]);
    setClusterFilters([]);
    setBuildingFilters([]);
    setZoneFilters([]);
    setWeekdayFilters([]);
    setDateFrom("");
    setDateTo("");
    setTimeFrom("");
    setTimeTo("");
    setSortOrder("DESC");
  };

  const fetchDetail = useCallback(async (record) => {
    if (!record?.id) return record;
    const cacheKey = String(record.id);
    if (detailCacheRef.current.has(cacheKey)) return detailCacheRef.current.get(cacheKey);

    try {
      const response = await fetchFirst(base, [
        `/inspections/${record.id}`,
        `/api/inspections/${record.id}`,
        `/viewer/inspections/${record.id}`,
        `/dashboard/inspections/${record.id}`,
        `/reports/inspections/${record.id}`,
        `/api/reports/inspections/${record.id}`,
      ]);
      const payload = response.data?.inspection || response.data?.data || response.data?.item || response.data?.result || response.data;
      const merged = mergeInspection(record, payload || {});
      detailCacheRef.current.set(cacheKey, merged);
      return merged;
    } catch {
      detailCacheRef.current.set(cacheKey, record);
      return record;
    }
  }, [base]);

  useEffect(() => {
    let cancelled = false;

    const targets = visibleRecords.filter((record) => {
      if (!record?.id) return false;
      const key = String(record.id);
      if (previewHydratedRef.current.has(key)) return false;
      previewHydratedRef.current.add(key);
      return true;
    });

    if (!targets.length) return undefined;

    async function hydrateVisiblePreviews() {
      const hydrated = [];
      let nextIndex = 0;
      const workersCount = Math.min(4, targets.length);

      async function worker() {
        while (!cancelled) {
          const index = nextIndex;
          nextIndex += 1;
          if (index >= targets.length) return;

          const original = targets[index];
          const detail = await fetchDetail(original);
          hydrated.push(detail);
        }
      }

      await Promise.all(Array.from({ length: workersCount }, () => worker()));
      if (cancelled || !hydrated.length) return;

      const hydratedMap = new Map(
        hydrated
          .filter((record) => record?.id)
          .map((record) => [String(record.id), record])
      );

      setRecords((current) =>
        current.map((record) => {
          const detail = hydratedMap.get(String(record.id));
          return detail ? mergeInspection(record, detail) : record;
        })
      );
    }

    hydrateVisiblePreviews();

    return () => {
      cancelled = true;
    };
  }, [visibleRecords, fetchDetail]);

  const openDetails = async (record) => {
    setSelected({ record, loading: true, error: "" });
    try {
      const details = await fetchDetail(record);
      setSelected({ record: details, loading: false, error: details === record ? "No separate details endpoint was available." : "" });
    } catch (detailError) {
      setSelected({ record, loading: false, error: detailError?.message || "Failed to load details." });
    }
  };

  async function hydrateForExport(sourceRecords) {
    if (exportDetailMode === "FAST" || !sourceRecords.length) return sourceRecords;

    const output = new Array(sourceRecords.length);
    let nextIndex = 0;
    let finished = 0;
    const workersCount = Math.min(6, sourceRecords.length);

    async function worker() {
      while (true) {
        const index = nextIndex;
        nextIndex += 1;
        if (index >= sourceRecords.length) return;

        output[index] = await fetchDetail(sourceRecords[index]);
        finished += 1;

        if (finished === sourceRecords.length || finished % 10 === 0) {
          setExportProgress(`Loading full details ${finished} / ${sourceRecords.length}`);
        }
      }
    }

    await Promise.all(Array.from({ length: workersCount }, () => worker()));
    return output;
  }

  async function handleExcelExport() {
    const source = exportScope === "ALL" ? records : filtered;
    setExporting(true);
    setExportProgress(`Preparing Excel for ${source.length} inspection(s)...`);

    try {
      const complete = await hydrateForExport(source);
      const detailRows = complete.map((record) => exportRow(record, base));
      const dailyRows = technicianDailyRows(complete);
      const filtersRow = [{
        Scope: exportScope,
        "Detail Mode": exportDetailMode,
        Search: search,
        Technicians: selectedFilterText(technicianFilters, options.technicians, "All technicians"),
        "Device Types": selectedFilterText(typeFilters, options.types, "All device types"),
        Statuses: selectedFilterText(statusFilters, options.statuses, "All statuses", statusLabel),
        Results: selectedFilterText(resultFilters, ["OK", "PARTIAL", "NOT_OK"], "All results", (value) => value === "NOT_OK" ? "Not OK" : value),
        Clusters: selectedFilterText(clusterFilters, options.clusters, "All clusters"),
        Buildings: selectedFilterText(buildingFilters, options.buildings, "All buildings"),
        Zones: selectedFilterText(zoneFilters, options.zones, "All zones"),
        Weekdays: selectedFilterText(weekdayFilters, WEEKDAY_VALUES, "All weekdays", weekdayLabel),
        "Date From": dateFrom,
        "Date To": dateTo,
        "Time From": timeFrom,
        "Time To": timeTo,
        "UI Sort": sortOrder === "ASC" ? "Oldest first" : "Newest first",
        "Exported At": formatDateTime(new Date()),
      }];

      const xml = spreadsheetXml([
        { name: "Inspections", rows: detailRows },
        { name: "Technician Daily", rows: dailyRows },
        { name: "Applied Filters", rows: filtersRow },
      ]);

      downloadBlob(
        new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }),
        `SmartIT_Inspections_${localDateKey(new Date())}.xls`
      );
      setExportProgress("Excel exported successfully.");
    } catch (exportError) {
      setExportProgress(`Excel export failed: ${exportError?.message || exportError}`);
    } finally {
      setExporting(false);
    }
  }

  async function handlePdfExport() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportProgress("Please allow pop-ups, then try PDF export again.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Preparing PDF...</title></head><body style="font-family:Segoe UI,Arial;padding:30px"><h2>Preparing the fast inspection timeline...</h2><p>The report will open automatically.</p></body></html>`);
    printWindow.document.close();

    const source = exportScope === "ALL" ? records : filtered;
    setExporting(true);
    setExportProgress(`Preparing fast PDF timeline for ${source.length} inspection(s)...`);

    try {
      // PDF intentionally uses the already-loaded important fields only.
      // No image loading and no per-record detail requests, so large reports stay fast.
      const chronological = [...source].sort((a, b) => {
        const difference = inspectionTimestamp(a) - inspectionTimestamp(b);
        if (difference !== 0) return difference;
        return String(a.id).localeCompare(String(b.id), "en", { numeric: true });
      });

      const summary = {
        total: chronological.length,
        ok: chronological.filter((record) => record.result === "OK").length,
        partial: chronological.filter((record) => record.result === "PARTIAL").length,
        notOk: chronological.filter((record) => record.result === "NOT_OK").length,
        technicians: new Set(chronological.map((record) => record.technician.name)).size,
      };

      const appliedTechnicians = exportScope === "ALL" ? [] : technicianFilters;
      const technicianNames = appliedTechnicians.length
        ? appliedTechnicians
        : [...new Set(chronological.map((record) => record.technician.name).filter((value) => value && value !== "—"))]
          .sort((a, b) => a.localeCompare(b, "en"));

      const technicianTags = technicianNames.length
        ? technicianNames.map((name) => `<span class="tech-tag">${htmlEscape(name)}</span>`).join("")
        : `<span class="tech-tag">No technician records</span>`;

      const technicianSummaryHtml = technicianPdfSummary(chronological).map((row) => `<tr>
        <td><strong>${htmlEscape(row.name)}</strong></td>
        <td>${row.total}</td>
        <td class="good-text">${row.ok}</td>
        <td class="partial-text">${row.partial}</td>
        <td class="bad-text">${row.notOk}</td>
        <td>${htmlEscape(`${formatDate(row.first)} ${formatTime(row.first, true)}`)}</td>
        <td>${htmlEscape(`${formatDate(row.last)} ${formatTime(row.last, true)}`)}</td>
      </tr>`).join("");


      const technicianDailySummaryHtml = technicianDailyRows(chronological).map((row) => `<tr>
        <td><strong>${htmlEscape(row["Technician Name"])}</strong></td>
        <td>${htmlEscape(row.Day)}</td>
        <td>${htmlEscape(row.Date)}</td>
        <td class="time">${htmlEscape(row["First Inspection"])}</td>
        <td class="time">${htmlEscape(row["Last Inspection"])}</td>
        <td><strong>${row["Total Inspections"]}</strong></td>
        <td>${row["Different Devices"]}</td>
        <td class="good-text">${row.OK}</td>
        <td class="partial-text">${row.Partial}</td>
        <td class="bad-text">${row["Not OK"]}</td>
      </tr>`).join("");

      const timelineHtml = chronological.map(pdfTimelineRowHtml).join("");
      const dateWindow = exportScope === "ALL"
        ? "All available dates"
        : `${dateFrom || "Beginning"} ${timeFrom || "00:00"} → ${dateTo || "Latest"} ${timeTo || "23:59"}`;
      const weekdaysInReport = exportScope === "ALL"
        ? "All weekdays"
        : selectedFilterText(weekdayFilters, WEEKDAY_VALUES, "All weekdays", weekdayLabel);

      const documentHtml = `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Smart IT — Inspection Timeline</title>
        <style>
          @page { size: A4 landscape; margin: 8mm; }
          * { box-sizing: border-box; }
          html { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          body { margin: 0; color: #142234; background: #fff; font-family: "Segoe UI", Tahoma, Arial, sans-serif; font-size: 8px; direction: ltr; }
          .report-head { border: 2px solid #142234; border-radius: 13px; overflow: hidden; margin-bottom: 9px; }
          .head-band { padding: 11px 13px; color: #fff; background: linear-gradient(115deg,#142234,#125f7e 65%,#149d8c); display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
          h1 { margin: 0; font-size: 20px; line-height: 1.1; }
          .subtitle { margin-top: 4px; color: #d8f4ff; font-size: 8px; font-weight: 700; }
          .exported { text-align: right; color: #eaf8ff; font-size: 8px; line-height: 1.5; }
          .head-body { padding: 9px 11px; }
          .summary { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; }
          .summary-card { border: 1px solid #d8e3ea; border-radius: 8px; padding: 6px 8px; background: #f9fbfc; }
          .summary-card b { display: block; color: #64748b; font-size: 6.5px; text-transform: uppercase; }
          .summary-card span { display: block; margin-top: 2px; font-size: 14px; font-weight: 950; }
          .selection { margin-top: 8px; padding-top: 8px; border-top: 1px solid #e1e9ef; display: grid; grid-template-columns: 120px 1fr; gap: 7px; align-items: start; }
          .selection-label { color: #64748b; font-size: 7px; font-weight: 950; text-transform: uppercase; }
          .tech-list { display: flex; gap: 4px; flex-wrap: wrap; }
          .tech-tag { padding: 3px 7px; border-radius: 999px; color: #075d79; background: #eaf8ff; border: 1px solid #b9e6f7; font-size: 7px; font-weight: 900; }
          .filter-line { margin-top: 6px; color: #526273; font-size: 7px; line-height: 1.5; }
          .section-title { margin: 9px 0 5px; padding: 5px 7px; border-radius: 7px; color: #fff; background: #142234; font-size: 9px; font-weight: 950; }
          table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; }
          thead { display: table-header-group; }
          tr { break-inside: avoid; page-break-inside: avoid; }
          th { padding: 5px 4px; color: #fff; background: #20384f; border-right: 1px solid rgba(255,255,255,.16); font-size: 6.5px; text-transform: uppercase; letter-spacing: .02em; text-align: left; }
          td { padding: 5px 4px; border-right: 1px solid #dfe7ed; border-bottom: 1px solid #dfe7ed; vertical-align: top; line-height: 1.35; overflow-wrap: anywhere; }
          tbody tr:nth-child(even) td { background: #f8fafc; }
          tbody tr:first-child td { border-top: 1px solid #dfe7ed; }
          td:first-child, th:first-child { border-left: 1px solid #dfe7ed; }
          th:first-child { border-radius: 7px 0 0 0; }
          th:last-child { border-radius: 0 7px 0 0; }
          td strong { display: block; font-size: 7.5px; }
          td small { display: block; margin-top: 2px; color: #718194; font-size: 6.2px; }
          .num { width: 28px; text-align: center; font-weight: 950; }
          .time { width: 58px; font-family: Consolas,"Courier New",monospace; font-weight: 900; }
          .technician { font-weight: 950; }
          .condition { font-weight: 950; text-align: center; }
          .condition.good { color: #087a51; background: #ecfdf5 !important; }
          .condition.partial { color: #a65a08; background: #fff7e8 !important; }
          .condition.bad { color: #b4232e; background: #fff1f2 !important; }
          .good-text { color: #087a51; font-weight: 950; }
          .partial-text { color: #a65a08; font-weight: 950; }
          .bad-text { color: #b4232e; font-weight: 950; }
          .location { direction: auto; }
          .timeline th:nth-child(1) { width: 3%; }
          .timeline th:nth-child(2) { width: 9%; }
          .timeline th:nth-child(3) { width: 6%; }
          .timeline th:nth-child(4) { width: 11%; }
          .timeline th:nth-child(5) { width: 13%; }
          .timeline th:nth-child(6) { width: 9%; }
          .timeline th:nth-child(7) { width: 12%; }
          .timeline th:nth-child(8) { width: 10%; }
          .timeline th:nth-child(9) { width: 9%; }
          .timeline th:nth-child(10) { width: 18%; }
          .empty { padding: 20px; border: 1px dashed #cbd5e1; border-radius: 9px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <section class="report-head">
          <div class="head-band">
            <div>
              <h1>Smart IT — Inspection Timeline Report</h1>
              <div class="subtitle">Fast report · important inspection fields · exact chronological order</div>
            </div>
            <div class="exported">
              Exported: ${htmlEscape(formatDateTime(new Date()))}<br/>
              Source: ${htmlEscape(endpoint || "Unknown endpoint")}<br/>
              Scope: ${htmlEscape(exportScope)}
            </div>
          </div>
          <div class="head-body">
            <div class="summary">
              <div class="summary-card"><b>Total Inspections</b><span>${summary.total}</span></div>
              <div class="summary-card"><b>سليم / Good</b><span>${summary.ok}</span></div>
              <div class="summary-card"><b>Follow-up</b><span>${summary.partial}</span></div>
              <div class="summary-card"><b>غير سليم / Not Good</b><span>${summary.notOk}</span></div>
              <div class="summary-card"><b>Technicians</b><span>${summary.technicians}</span></div>
            </div>
            <div class="selection">
              <div class="selection-label">Technicians in report</div>
              <div class="tech-list">${technicianTags}</div>
            </div>
            <div class="filter-line">
              <strong>Weekdays:</strong> ${htmlEscape(weekdaysInReport)} ·
              <strong>Date & exact-time window:</strong> ${htmlEscape(dateWindow)} ·
              <strong>Device types:</strong> ${htmlEscape(exportScope === "ALL" ? "All" : selectedFilterText(typeFilters, options.types, "All"))} ·
              <strong>Statuses:</strong> ${htmlEscape(exportScope === "ALL" ? "All" : selectedFilterText(resultFilters, ["OK", "PARTIAL", "NOT_OK"], "All"))}<br/>
              Timeline is ordered by the exact inspection timestamp from oldest to newest. For example, 01:01 appears before 01:02 even when the technicians are different.
            </div>
          </div>
        </section>

        <div class="section-title">Technician Summary</div>
        ${chronological.length ? `<table>
          <thead><tr><th>Technician Name</th><th>Total</th><th>Good</th><th>Follow-up</th><th>Not Good</th><th>First Inspection</th><th>Last Inspection</th></tr></thead>
          <tbody>${technicianSummaryHtml}</tbody>
        </table>` : `<div class="empty">No matching inspection records.</div>`}

        <div class="section-title">Technician Daily Count — Exact Backend Records</div>
        ${chronological.length ? `<table>
          <thead><tr><th>Technician Name</th><th>Day</th><th>Date</th><th>First Time</th><th>Last Time</th><th>Total</th><th>Unique Devices</th><th>Good</th><th>Follow-up</th><th>Not Good</th></tr></thead>
          <tbody>${technicianDailySummaryHtml}</tbody>
        </table>` : `<div class="empty">No matching inspection records.</div>`}

        <div class="section-title">Inspection Timeline — Oldest to Newest</div>
        ${chronological.length ? `<table class="timeline">
          <thead><tr>
            <th>#</th><th>Date</th><th>Exact Time</th><th>Technician</th><th>Device Name</th><th>Device No.</th><th>Device Type / Type No.</th><th>Condition</th><th>Cluster</th><th>Location</th>
          </tr></thead>
          <tbody>${timelineHtml}</tbody>
        </table>` : `<div class="empty">No matching inspection records.</div>`}
      </body>
      </html>`;

      printWindow.document.open();
      printWindow.document.write(documentHtml);
      printWindow.document.close();
      setExportProgress("Fast PDF is ready. Choose Save as PDF in the print dialog.");

      const printDelay = Math.min(1100, 300 + chronological.length);
      window.setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, printDelay);
    } catch (exportError) {
      printWindow.document.open();
      printWindow.document.write(`<h2>PDF export failed</h2><p>${htmlEscape(exportError?.message || exportError)}</p>`);
      printWindow.document.close();
      setExportProgress(`PDF export failed: ${exportError?.message || exportError}`);
    } finally {
      setExporting(false);
    }
  }

  if (loading && records.length === 0) {
    return (
      <div className="si-root">
        <style>{CSS}</style>
        <div className="si-loading"><div><div className="si-spinner" />{loadProgress || "Loading every inspection directly from the backend..."}</div></div>
      </div>
    );
  }

  return (
    <div className="si-root">
      <style>{CSS}</style>
      <div className="si-shell">
        <header className="si-top">
          <div>
            <div className="si-kicker">Smart IT · Lightweight Inspection Operations</div>
            <h1 className="si-title">Inspections</h1>
            
          </div>

          <div className="si-top-actions">
            <select className="si-select-export" value={exportScope} onChange={(event) => setExportScope(event.target.value)} title="Export scope">
              <option value="FILTERED">Export filtered results</option>
              <option value="ALL">Export all records</option>
            </select>
            <select className="si-select-export" value={exportDetailMode} onChange={(event) => setExportDetailMode(event.target.value)} title="Export detail mode">
              <option value="FULL">Excel: full details</option>
              <option value="FAST">Excel: fast loaded data</option>
            </select>
            <button type="button" className="si-btn excel" onClick={handleExcelExport} disabled={exporting}>▦ Export Excel</button>
            <button type="button" className="si-btn pdf" onClick={handlePdfExport} disabled={exporting}>▤ Fast PDF Timeline</button>
            <button type="button" className="si-btn ghost" onClick={loadData} disabled={loading || exporting}>{loading ? "Loading..." : "↻ Refresh"}</button>
          </div>
        </header>

        {error ? <div className="si-alert error">{error}</div> : null}
        {exportProgress ? <div className={`si-alert ${exportProgress.includes("failed") ? "error" : exportProgress.includes("successfully") || exportProgress.includes("ready") ? "success" : "info"}`}>{exportProgress}</div> : null}
        <div className={`si-alert ${backendInfo.complete ? "success" : "info"}`}>
          Backend source: {safe(endpoint, "waiting for backend")} · Loaded {backendInfo.loaded} of {backendInfo.total || backendInfo.loaded} unique inspection(s) from {backendInfo.pages || 1} backend page(s) · Server page size detected: {backendInfo.pageSize || "—"}. Browser cache is not counted.
        </div>

        <section className="si-kpis">
          <Kpi label="Filtered Records" value={stats.total} sub={`from ${records.length} total`} accent="#159bd3" />
          <Kpi label="Today" value={stats.today} sub="today inspections" accent="#6657d9" />
          <Kpi label="OK" value={stats.ok} sub="successful inspections" accent="#0f9f75" />
          <Kpi label="Partial" value={stats.partial} sub="needs follow-up" accent="#ed8b20" />
          <Kpi label="Not OK" value={stats.notOk} sub="fault or failed" accent="#dc3d4b" />
          <Kpi label="Technicians" value={stats.technicians} sub="in filtered results" accent="#147394" />
        </section>

        <section className="si-panel">
          <div className="si-panel-head">
            <div className="si-panel-title">Advanced Multi-Selection Filters</div>
            <div className="si-count">{filtered.length} matching inspection(s)</div>
          </div>

          <div className="si-filters">
            <div className="si-field">
              <label>Precise Search</label>
              <input
                className="si-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="All typed words must match: technician, device, serial, location..."
              />
            </div>

            <MultiSelectFilter
              label="Technicians"
              options={options.technicians}
              selected={technicianFilters}
              onChange={setTechnicianFilters}
              allLabel="All technicians"
            />

            <MultiSelectFilter
              label="Device Types"
              options={options.types}
              selected={typeFilters}
              onChange={setTypeFilters}
              allLabel="All device types"
            />

            <MultiSelectFilter
              label="Statuses"
              options={options.statuses}
              selected={statusFilters}
              onChange={setStatusFilters}
              allLabel="All statuses"
              formatOption={statusLabel}
            />

            <MultiSelectFilter
              label="Results"
              options={["OK", "PARTIAL", "NOT_OK"]}
              selected={resultFilters}
              onChange={setResultFilters}
              allLabel="All results"
              formatOption={(value) => value === "NOT_OK" ? "Not OK" : value === "PARTIAL" ? "Partial" : "OK"}
            />

            <MultiSelectFilter
              label="Clusters"
              options={options.clusters}
              selected={clusterFilters}
              onChange={setClusterFilters}
              allLabel="All clusters"
            />
          </div>

          <div className="si-filters second">
            <MultiSelectFilter
              label="Weekdays / أيام الأسبوع"
              options={WEEKDAY_VALUES}
              selected={weekdayFilters}
              onChange={setWeekdayFilters}
              allLabel="All weekdays / كل الأيام"
              formatOption={weekdayLabel}
            />

            <MultiSelectFilter
              label="Buildings"
              options={options.buildings}
              selected={buildingFilters}
              onChange={setBuildingFilters}
              allLabel="All buildings"
            />

            <MultiSelectFilter
              label="Zones"
              options={options.zones}
              selected={zoneFilters}
              onChange={setZoneFilters}
              allLabel="All zones"
            />

            <div className="si-field">
              <label>Date From</label>
              <input type="date" className="si-input" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="si-field">
              <label>Date To</label>
              <input type="date" className="si-input" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <div className="si-field">
              <label>Exact Time From</label>
              <input type="time" step="1" className="si-input" value={timeFrom} onChange={(event) => setTimeFrom(event.target.value)} />
            </div>
            <div className="si-field">
              <label>Exact Time To</label>
              <input type="time" step="1" className="si-input" value={timeTo} onChange={(event) => setTimeTo(event.target.value)} />
            </div>
            <div className="si-field">
              <label>Timeline Order</label>
              <select className="si-select" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                <option value="DESC">Newest inspection first</option>
                <option value="ASC">Oldest inspection first</option>
              </select>
            </div>
          </div>

          <div className="si-filter-summary">
            <span className="si-filter-summary-label">Applied:</span>
            <span className="si-filter-chip strong">
              Technicians: {technicianFilters.length ? technicianFilters.join(" · ") : `All (${options.technicians.length})`}
            </span>
            <span className="si-filter-chip">
              Types: {typeFilters.length ? typeFilters.length : `All ${options.types.length}`}
            </span>
            <span className="si-filter-chip">
              Results: {resultFilters.length ? resultFilters.join(" · ") : "All"}
            </span>
            <span className="si-filter-chip strong">
              Days: {weekdayFilters.length ? weekdayFilters.map(weekdayLabel).join(" · ") : "All weekdays / كل الأيام"}
            </span>
            <span className="si-filter-chip">
              Window: {dateFrom || "Beginning"} {timeFrom || "00:00:00"} → {dateTo || "Latest"} {timeTo || "23:59:59"}
            </span>
          </div>

          <div className="si-filter-actions">
            <div className="si-filter-note">
              Choose one weekday or several weekdays together, such as Sunday, Monday and Tuesday. Date and time boundaries are inclusive and compared against the exact backend inspection timestamp.
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <div className="si-field" style={{ minWidth: 130 }}>
                <label>Rows Per Page</label>
                <select className="si-select" value={pageSize} onChange={(event) => setPageSize(Number(event.target.value))}>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <button type="button" className="si-btn" onClick={resetFilters}>Clear All Filters</button>
            </div>
          </div>
        </section>

        <section className="si-panel">
          <div className="si-panel-head">
            <div>
              <div className="si-panel-title">Inspection Records</div>
              <div className="si-sub-text">
                Showing {visibleRecords.length} inspection(s) on page {safePage} of {pageCount}
              </div>
            </div>

            <div className="si-table-tools">
              <div className="si-view-toggle" aria-label="Inspection display mode">
                <button
                  type="button"
                  className={viewMode === "LIST" ? "active" : ""}
                  onClick={() => setViewMode("LIST")}
                >
                  ☰ List
                </button>
                <button
                  type="button"
                  className={viewMode === "GRID" ? "active" : ""}
                  onClick={() => setViewMode("GRID")}
                >
                  ⊞ Grid Boxes
                </button>
              </div>
            </div>
          </div>

          {!visibleRecords.length ? (
            <div className="si-empty">No inspections match the selected filters.</div>
          ) : viewMode === "GRID" ? (
            <div className="si-records-grid">
              {visibleRecords.map((record, index) => (
                <InspectionGridCard
                  key={record.id || `${record.device.id}-${index}`}
                  record={record}
                  base={base}
                  onOpen={openDetails}
                />
              ))}
            </div>
          ) : (
            <div className="si-list-view">
              {visibleRecords.map((record, index) => (
                <InspectionListItem
                  key={record.id || `${record.device.id}-${index}`}
                  record={record}
                  base={base}
                  onOpen={openDetails}
                />
              ))}
            </div>
          )}

          <div className="si-pagination">
            <div className="si-filter-note">Records {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)} of {filtered.length}</div>
            <div className="si-pages">
              <button className="si-page-btn" type="button" disabled={safePage <= 1} onClick={() => setPage(1)}>«</button>
              <button className="si-page-btn" type="button" disabled={safePage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
              {pageNumbers.map((number) => <button className={`si-page-btn ${number === safePage ? "active" : ""}`} type="button" key={number} onClick={() => setPage(number)}>{number}</button>)}
              <button className="si-page-btn" type="button" disabled={safePage >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</button>
              <button className="si-page-btn" type="button" disabled={safePage >= pageCount} onClick={() => setPage(pageCount)}>»</button>
            </div>
          </div>
        </section>
      </div>

      <DetailsModal selected={selected} base={base} onClose={() => setSelected(null)} />
    </div>
  );
}

export default InspectionsPage;