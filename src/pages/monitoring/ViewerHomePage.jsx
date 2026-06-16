import React, { useEffect, useMemo, useRef, useState } from "react";

/* ─── CSS ──────────────────────────────────────────────────────────────────── */
const HOME_CSS = `
.vh *, .vh *::before, .vh *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.vh {
  --primary: #4f46e5;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --info: #0ea5e9;
  --surface: #ffffff;
  --surface2: #f8fafc;
  --border: rgba(15, 23, 42, 0.08);
  --text: #0f172a;
  --muted: #475569;
  --faint: #94a3b8;
  --shadow: 0 14px 35px rgba(15, 23, 42, 0.07);
  --shadow2: 0 20px 55px rgba(79, 70, 229, 0.12);

  font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background:
    radial-gradient(circle at 15% 5%, rgba(79, 70, 229, 0.08), transparent 28%),
    radial-gradient(circle at 90% 15%, rgba(14, 165, 233, 0.08), transparent 30%),
    #f1f5f9;
  color: var(--text);
  padding: 28px 24px;
  min-height: 100vh;
}


.vh__brand-logo img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.vh__alert {
  margin-bottom: 14px;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.vh__alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.vh__topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 22px;
}

.vh__title {
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -0.035em;
  color: var(--text);
}

.vh__page-sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 5px;
}

.vh__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  padding-top: 4px;
}

.vh__chip {
  font-size: 12px;
  color: var(--muted);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 7px 13px;
  background: rgba(255,255,255,0.86);
  white-space: nowrap;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.vh__chip--sync {
  color: #166534;
  background: #ecfdf5;
  border-color: #bbf7d0;
  font-weight: 800;
}

.vh__kpis {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.vh__kpi {
  text-align: left;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 17px 16px 15px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 122px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.045);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.vh[dir="rtl"] .vh__kpi {
  text-align: right;
}

.vh__kpi:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: rgba(79, 70, 229, 0.26);
}

.vh__kpi:focus-visible {
  outline: 3px solid rgba(79, 70, 229, 0.22);
  outline-offset: 2px;
}

.vh__kpi::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--card-color, var(--primary));
}

.vh__kpi::after {
  content: "";
  position: absolute;
  width: 90px;
  height: 90px;
  right: -34px;
  bottom: -38px;
  background: var(--card-bg, rgba(79, 70, 229, 0.08));
  border-radius: 50%;
}

.vh__kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.vh__kpi-icon {
  width: 34px;
  height: 34px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: var(--card-bg, rgba(79, 70, 229, 0.08));
  color: var(--card-color, var(--primary));
  font-size: 17px;
}

.vh__kpi-click {
  font-size: 10px;
  color: var(--faint);
  font-weight: 800;
}

.vh__kpi-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 800;
}

.vh__kpi-value {
  font-size: 31px;
  font-weight: 950;
  line-height: 1;
  margin-bottom: 8px;
  letter-spacing: -0.04em;
  color: var(--card-color, var(--primary));
}

.vh__kpi-note {
  font-size: 11px;
  color: var(--faint);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vh__grid-main {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 14px;
  margin-bottom: 14px;
}

.vh__bottom {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 14px;
}

.vh__card {
  background: rgba(255,255,255,0.94);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.045);
}

.vh__card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.vh__card-title {
  font-size: 15px;
  font-weight: 900;
  color: var(--text);
  margin-bottom: 4px;
  letter-spacing: -0.015em;
}

.vh__card-sub {
  font-size: 12px;
  color: var(--faint);
}

.vh__split {
  display: grid;
  grid-template-columns: 170px 1fr;
  gap: 18px;
  align-items: center;
}

.vh__donut-wrap {
  display: grid;
  place-items: center;
}

.vh__status-list {
  display: grid;
  gap: 10px;
}

.vh__status-row {
  border: 1px solid var(--border);
  border-radius: 15px;
  padding: 11px 12px;
  background: var(--surface2);
}

.vh__status-row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 8px;
}

.vh__status-name {
  color: var(--muted);
  font-weight: 900;
}

.vh__status-value {
  color: var(--text);
  font-weight: 950;
}

.vh__track {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.vh__fill {
  height: 100%;
  border-radius: 999px;
  width: 0%;
  background: var(--fill, var(--primary));
}

.vh__trend {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  min-height: 205px;
  align-items: end;
  padding-top: 10px;
}

.vh__week {
  display: grid;
  gap: 8px;
}

.vh__week-bars {
  height: 145px;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 5px;
  background: linear-gradient(to top, rgba(15,23,42,0.04), transparent);
  border: 1px solid rgba(15,23,42,0.05);
  border-radius: 15px;
  padding: 10px 7px;
}

.vh__week-bar {
  width: 18px;
  min-height: 3px;
  border-radius: 999px 999px 5px 5px;
  transition: 0.2s ease;
}

.vh__week-label {
  text-align: center;
  font-size: 11px;
  color: var(--faint);
  font-weight: 900;
}

.vh__legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.vh__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.vh__legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 3px;
}

.vh__bar-list {
  display: grid;
  gap: 12px;
}

.vh__bar-row {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) 2fr 46px;
  align-items: center;
  gap: 10px;
}

.vh__bar-label {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 800;
}

.vh__bar-val {
  text-align: right;
  font-size: 12px;
  font-weight: 950;
  color: var(--text);
}

.vh[dir="rtl"] .vh__bar-val {
  text-align: left;
}

.vh__empty {
  border: 1px dashed rgba(148, 163, 184, 0.6);
  border-radius: 16px;
  padding: 18px;
  color: var(--faint);
  font-size: 13px;
  text-align: center;
  background: rgba(248,250,252,0.72);
}

.vh__analysis {
  display: grid;
  gap: 14px;
}

.vh__analysis-hero {
  border: 1px solid rgba(79, 70, 229, 0.14);
  background:
    radial-gradient(circle at 15% 20%, rgba(79, 70, 229, 0.13), transparent 34%),
    radial-gradient(circle at 90% 30%, rgba(14, 165, 233, 0.12), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 16px;
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 16px;
  align-items: center;
  overflow: hidden;
}

.vh__analysis-ring {
  width: 138px;
  height: 138px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    conic-gradient(
      from 180deg,
      #4f46e5 0deg,
      #4f46e5 var(--ready-deg),
      #f59e0b var(--ready-deg),
      #f59e0b 360deg
    );
  position: relative;
  box-shadow: 0 18px 40px rgba(79, 70, 229, 0.16);
}

.vh__analysis-ring::before {
  content: "";
  position: absolute;
  inset: 15px;
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
}

.vh__analysis-ring-inner {
  position: relative;
  z-index: 1;
  text-align: center;
}

.vh__analysis-ring-label {
  font-size: 10px;
  color: var(--faint);
  font-weight: 950;
  margin-bottom: 4px;
}

.vh__analysis-ring-value {
  font-size: 28px;
  color: var(--text);
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.04em;
}

.vh__analysis-main-title {
  font-size: 16px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 5px;
  letter-spacing: -0.025em;
}

.vh__analysis-main-sub {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 13px;
}

.vh__analysis-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;
}

.vh__analysis-stat {
  background: rgba(255,255,255,0.82);
  border: 1px solid rgba(15,23,42,0.07);
  border-radius: 15px;
  padding: 10px;
}

.vh__analysis-stat-label {
  font-size: 10px;
  color: var(--faint);
  font-weight: 950;
  margin-bottom: 5px;
  white-space: nowrap;
}

.vh__analysis-stat-value {
  font-size: 18px;
  font-weight: 950;
  color: var(--text);
  line-height: 1;
}

.vh__compare {
  display: grid;
  gap: 11px;
}

.vh__compare-row {
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 17px;
  padding: 12px;
}

.vh__compare-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 9px;
}

.vh__compare-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text);
  font-size: 13px;
  font-weight: 950;
}

.vh__compare-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(79, 70, 229, 0.09);
}

.vh__compare-percent {
  font-size: 12px;
  color: var(--muted);
  font-weight: 950;
}

.vh__compare-track {
  height: 12px;
  display: flex;
  overflow: hidden;
  border-radius: 999px;
  background: #e5e7eb;
  margin-bottom: 8px;
}

.vh__compare-ok {
  background: #4f46e5;
  min-width: 0;
}

.vh__compare-bad {
  background: #f59e0b;
  min-width: 0;
}

.vh__compare-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--faint);
  font-size: 11px;
  font-weight: 850;
}

.vh__insight-list {
  display: grid;
  gap: 9px;
}

.vh__insight {
  border-radius: 16px;
  padding: 12px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: flex-start;
  border: 1px solid var(--border);
  background: var(--surface2);
}

.vh__insight-icon {
  width: 30px;
  height: 30px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #fff;
  box-shadow: 0 8px 18px rgba(15,23,42,0.06);
}

.vh__insight-title {
  font-size: 12px;
  color: var(--text);
  font-weight: 950;
  margin-bottom: 3px;
}

.vh__insight-text {
  font-size: 11px;
  color: var(--muted);
  line-height: 1.55;
}

.vh__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
}

.vh__pill--ok {
  color: #047857;
  background: #d1fae5;
}

.vh__pill--warn {
  color: #92400e;
  background: #fef3c7;
}

.vh__pill--bad {
  color: #b91c1c;
  background: #fee2e2;
}

.vh__pill--neutral {
  color: #475569;
  background: #e2e8f0;
}

.vh__loading {
  padding: 52px 20px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.vh__loading-spinner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  border-top-color: #4f46e5;
  margin: 0 auto 12px;
  animation: vhSpin .8s linear infinite;
}

@keyframes vhSpin {
  to { transform: rotate(360deg); }
}

/* ─── Modal ────────────────────────────────────────────────────────────────── */
.vh__modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(6px);
  padding: 22px;
  display: grid;
  place-items: center;
}

.vh__modal {
  width: min(1240px, 100%);
  max-height: min(780px, 92vh);
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.28);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.vh__modal-head {
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.vh__modal-title {
  font-size: 18px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 4px;
}

.vh__modal-sub {
  font-size: 12px;
  color: var(--faint);
}

.vh__modal-close {
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
}

.vh__modal-tools {
  padding: 14px 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.vh__search {
  height: 39px;
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 0 13px;
  width: min(360px, 100%);
  outline: none;
  font-size: 13px;
}

.vh__search:focus {
  border-color: rgba(79, 70, 229, 0.45);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.vh__modal-count {
  color: var(--muted);
  font-weight: 950;
  font-size: 12px;
}

.vh__table-wrap {
  overflow: auto;
  padding: 0 16px 20px;
  scrollbar-gutter: stable;
}

.vh__table {
  width: 100%;
  min-width: 1280px;
  border-collapse: separate;
  border-spacing: 0 9px;
  table-layout: fixed;
}

.vh__table th {
  text-align: left;
  color: var(--faint);
  font-size: 11px;
  font-weight: 950;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vh[dir="rtl"] .vh__table th {
  text-align: right;
}

.vh__table td {
  background: #f8fafc;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 10px;
  color: var(--text);
  font-size: 12px;
  vertical-align: middle;
  max-width: none;
  overflow: hidden;
  line-height: 1.45;
}

.vh__cell {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vh__table .vh__td--status .vh__cell,
.vh__table .vh__td--serial .vh__cell,
.vh__table .vh__td--type .vh__cell,
.vh__table .vh__td--firmware .vh__cell,
.vh__table .vh__td--date .vh__cell,
.vh__table .vh__td--notes .vh__cell {
  white-space: nowrap;
}

.vh__table .vh__td--location .vh__cell {
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-height: 38px;
}

.vh__table .vh__td--ip {
  text-align: center;
}

.vh__table .vh__td--ip .vh__cell {
  direction: ltr;
  unicode-bidi: isolate;
  text-align: center;
  white-space: nowrap;
  font-family: "Cascadia Mono", "Consolas", "SFMono-Regular", monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.01em;
  color: #0f172a;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 9px;
  padding: 5px 6px;
  line-height: 1.25;
}

.vh[dir="rtl"] .vh__table .vh__td--ip,
.vh[dir="rtl"] .vh__table .vh__td--ip .vh__cell {
  text-align: center;
}

.vh__table tr td:first-child {
  border-left: 1px solid var(--border);
  border-radius: 14px 0 0 14px;
}

.vh__table tr td:last-child {
  border-right: 1px solid var(--border);
  border-radius: 0 14px 14px 0;
}

.vh[dir="rtl"] .vh__table tr td:first-child {
  border-right: 1px solid var(--border);
  border-left: none;
  border-radius: 0 14px 14px 0;
}

.vh[dir="rtl"] .vh__table tr td:last-child {
  border-left: 1px solid var(--border);
  border-right: none;
  border-radius: 14px 0 0 14px;
}

/* ─── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 1450px) {
  .vh__kpis {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1050px) {
  .vh__grid-main,
  .vh__bottom {
    grid-template-columns: 1fr;
  }

  .vh__split {
    grid-template-columns: 1fr;
  }

  .vh__donut-wrap {
    order: -1;
  }
}

@media (max-width: 760px) {
  .vh {
    padding: 18px 14px;
  }



  .vh__kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vh__trend {
    gap: 8px;
  }

  .vh__week-bars {
    height: 120px;
  }

  .vh__bar-row {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .vh__bar-val {
    text-align: left;
  }

  .vh__analysis-hero {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
  }

  .vh__analysis-grid {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .vh__compare-meta {
    flex-direction: column;
    gap: 3px;
  }

  .vh__modal-backdrop {
    padding: 10px;
    align-items: end;
  }

  .vh__modal {
    max-height: 92vh;
    border-radius: 22px 22px 0 0;
  }

  .vh__modal-tools {
    align-items: stretch;
    flex-direction: column;
  }

  .vh__search {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .vh {
    padding: 14px 10px;
  }

  .vh__kpis {
    grid-template-columns: 1fr;
  }

  .vh__kpi {
    min-height: 112px;
  }

  .vh__topbar {
    margin-bottom: 16px;
  }

  .vh__title {
    font-size: 21px;
  }

  .vh__card {
    padding: 16px;
  }

  .vh__trend {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const MIN_HOMELOAD_MS = 650;

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
    "https://acess-backend-production-8856.up.railway.app";

  return raw.replace(/\/+$/, "");
}

function formatDate(lang) {
  return new Date().toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(iso, lang) {
  if (!iso) return lang === "ar" ? "لا يوجد" : "No update";

  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return lang === "ar" ? "لا يوجد" : "No update";

    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return lang === "ar" ? "لا يوجد" : "No update";
  }
}

function formatDateTime(iso, lang) {
  if (!iso) return lang === "ar" ? "لا يوجد" : "No update";

  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return lang === "ar" ? "لا يوجد" : "No update";

    return d.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return lang === "ar" ? "لا يوجد" : "No update";
  }
}

function numberText(value, lang) {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB").format(
    Number(value || 0)
  );
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  const bags = [
    payload,
    payload?.data,
    payload?.result,
    payload?.payload,
    payload?.response,
  ].filter(Boolean);

  for (const bag of bags) {
    if (Array.isArray(bag)) return bag;

    for (const key of keys) {
      if (Array.isArray(bag?.[key])) return bag[key];
    }

    if (Array.isArray(bag?.data)) return bag.data;
    if (Array.isArray(bag?.items)) return bag.items;
    if (Array.isArray(bag?.results)) return bag.results;
    if (Array.isArray(bag?.rows)) return bag.rows;
  }

  return [];
}

function safeStatus(status, fallback = "UNKNOWN") {
  return String(status || fallback).trim().toUpperCase();
}

function mapCurrentStatus(status) {
  const s = safeStatus(status, "OK");

  if (
    [
      "OK",
      "ATTENTION",
      "NEEDS_MAINTENANCE",
      "UNDER_MAINTENANCE",
      "OUT_OF_SERVICE",
    ].includes(s)
  ) {
    return s;
  }

  return "OK";
}

function statusTone(status) {
  const s = safeStatus(status);

  if (["OK", "ACTIVE", "COMPLETED", "DONE", "APPROVED"].includes(s)) return "ok";

  if (
    [
      "PENDING",
      "IN_PROGRESS",
      "PARTIAL",
      "PENDING_REVIEW",
      "DRAFT",
      "ASSIGNED",
      "MEDIUM",
      "HIGH",
      "URGENT",
    ].includes(s)
  ) {
    return "warn";
  }

  if (
    [
      "NOT_OK",
      "NOT_REACHABLE",
      "NEEDS_MAINTENANCE",
      "UNDER_MAINTENANCE",
      "OUT_OF_SERVICE",
      "INACTIVE",
      "MAINTENANCE",
      "CANCELLED",
      "REJECTED",
      "ISSUE_FOUND",
      "CRITICAL",
    ].includes(s)
  ) {
    return "bad";
  }

  return "neutral";
}

function statusLabel(status, lang) {
  const s = safeStatus(status);

  const ar = {
    OK: "سليم",
    ACTIVE: "نشط",
    INACTIVE: "غير نشط",
    MAINTENANCE: "صيانة",
    ATTENTION: "متابعة",
    NEEDS_MAINTENANCE: "يحتاج صيانة",
    UNDER_MAINTENANCE: "تحت الصيانة",
    OUT_OF_SERVICE: "خارج الخدمة",
    PENDING: "قيد الانتظار",
    IN_PROGRESS: "قيد التنفيذ",
    COMPLETED: "مكتمل",
    CANCELLED: "ملغي",
    NOT_OK: "غير سليم",
    PARTIAL: "جزئي",
    NOT_REACHABLE: "غير متاح",
    DONE: "تم",
    ISSUE_FOUND: "مشكلة",
    SKIPPED: "متخطى",
  };

  return lang === "ar" ? ar[s] || s : s.replaceAll("_", " ");
}

function StatusPill({ status, lang }) {
  const tone = statusTone(status);

  return (
    <span className={`vh__pill vh__pill--${tone}`}>
      {statusLabel(status, lang)}
    </span>
  );
}

function fixCompactIpText(value) {
  return String(value || "")
    .replace(/\b10(?=\d{3}\.\d{1,3}\.\d{1,3}\b)/g, "10.")
    .replace(/\s+/g, " ")
    .trim();
}

function isValidIPv4(value) {
  const parts = String(value || "").split(".");
  if (parts.length !== 4) return false;

  return parts.every((part) => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const n = Number(part);
    return n >= 0 && n <= 255;
  });
}

function extractIPv4(value) {
  const fixed = fixCompactIpText(value);
  const matches = fixed.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || [];
  return matches.find(isValidIPv4) || "";
}

function normalizeIpAddress(value) {
  const fixed = fixCompactIpText(value);
  const extracted = extractIPv4(fixed);
  if (extracted) return extracted;

  const onlyIpChars = fixed.replace(/[^0-9.]/g, "");
  return isValidIPv4(onlyIpChars) ? onlyIpChars : "";
}

function removeIpFromLocationPart(value) {
  const fixed = fixCompactIpText(value);
  return fixed
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "")
    .replace(/\s*\/\s*$/g, "")
    .replace(/^\s*\/\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getDeviceIp(item = {}) {
  const directIp = normalizeIpAddress(
    item.ipAddress || item.ip || item.ip_address || item.networkIp || item.deviceIp || ""
  );

  if (directIp) return directIp;

  const location = item.location || {};
  return extractIPv4([
    item.cluster,
    item.building,
    item.zone,
    item.direction,
    item.lane,
    location.cluster,
    location.building,
    location.zone,
    location.direction,
    location.lane,
  ].filter(Boolean).join(" / "));
}

function joinLocation(location = {}) {
  return [
    location.cluster,
    location.building,
    location.zone,
    location.direction,
    location.lane,
  ]
    .map(removeIpFromLocationPart)
    .filter(Boolean)
    .join(" / ");
}

function sortByNewest(a, b, keys = ["updatedAt", "createdAt"]) {
  const getTime = (item) => {
    for (const key of keys) {
      const value = item?.[key];
      if (!value) continue;
      const t = new Date(value).getTime();
      if (!Number.isNaN(t)) return t;
    }

    return 0;
  };

  return getTime(b) - getTime(a);
}

async function fetchJsonCandidates(candidates, token) {
  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText}`);
        continue;
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return { ok: true, url, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found.");
}

async function fetchOptional(label, candidates, token) {
  try {
    const res = await fetchJsonCandidates(candidates, token);
    return { label, ok: true, data: res.data, url: res.url, error: "" };
  } catch (error) {
    return {
      label,
      ok: false,
      data: [],
      url: "",
      error: error?.message || `Failed to load ${label}`,
    };
  }
}

/* ─── Normalize backend data ───────────────────────────────────────────────── */
function normalizeDevice(item = {}) {
  const location = item.location || {};
  const deviceType = item.deviceType || item.type || {};
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];

  return {
    id: item.id,
    assetType: "DEVICE",
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id || ""}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    barcode: item.barcode || "",
    serialNumber: item.serialNumber || "",
    manufacturer: item.manufacturer || "",
    modelNumber: item.modelNumber || "",
    firmware: item.firmware || "",
    ipAddress: getDeviceIp(item),
    deviceTypeName: deviceType.name || item.deviceTypeName || "",
    currentStatus: mapCurrentStatus(item.currentStatus || item.status),
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      inspectionsArray[0]?.inspectedAt ||
      null,
    notes: item.notes || "",
    location: {
      cluster: location.cluster || item.cluster || item.gateCluster || "",
      building: location.building || item.building || item.gateBuilding || "",
      zone: location.zone || item.zone || item.gateZone || "",
      direction: location.direction || item.direction || item.gateDirection || "",
      lane: location.lane || item.lane || "",
      type: location.type || item.type || "",
    },
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
}

function normalizeGate(item = {}) {
  const location = item.location || {};

  return {
    id: item.id,
    assetType: "GATE",
    gateNo: item.gateNo || item.gateNumber || item.no || `GATE-${item.id || ""}`,
    secretCode: item.secretCode || item.secret || "",
    excelId: item.excelId || "",
    status: safeStatus(item.status, "ACTIVE"),
    currentStatus: mapCurrentStatus(item.currentStatus || item.deviceStatus || item.status),
    cluster: item.cluster || location.cluster || "",
    building: item.building || location.building || "",
    zone: item.zone || location.zone || "",
    direction: item.direction || location.direction || "",
    lane: item.lane || location.lane || "",
    type: item.type || location.type || "",
    notes: item.notes || "",
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || null,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    location: {
      cluster: item.cluster || location.cluster || "",
      building: item.building || location.building || "",
      zone: item.zone || location.zone || "",
      direction: item.direction || location.direction || "",
      lane: item.lane || location.lane || "",
      type: item.type || location.type || "",
    },
  };
}

function normalizeInspection(item = {}) {
  const device = item.device || {};
  const gate = item.gate || {};
  const isGate = Boolean(item.gateId || gate.id);

  const assetLocation = isGate
    ? {
        cluster: gate.cluster || gate.location?.cluster || "",
        building: gate.building || gate.location?.building || "",
        zone: gate.zone || gate.location?.zone || "",
        direction: gate.direction || gate.location?.direction || "",
        lane: gate.lane || gate.location?.lane || "",
      }
    : {
        cluster: device.location?.cluster || "",
        building: device.location?.building || "",
        zone: device.location?.zone || "",
        direction: device.location?.direction || "",
        lane: device.location?.lane || "",
      };

  return {
    id: item.id,
    assetType: isGate ? "GATE" : "DEVICE",
    deviceId: item.deviceId || device.id || null,
    gateId: item.gateId || gate.id || null,
    inspectionStatus: safeStatus(item.inspectionStatus || item.status, "NOT_REACHABLE"),
    issueReason: item.issueReason || "",
    notes: item.notes || "",
    inspectedAt: item.inspectedAt || item.createdAt || null,
    createdAt: item.createdAt || item.inspectedAt || null,
    updatedAt: item.updatedAt || null,
    assetLabel: isGate
      ? `Gate ${gate.gateNo || item.gateId || ""}`
      : `${device.deviceCode || item.deviceId || ""} ${device.deviceName || ""}`.trim(),
    assetLocation,
  };
}

function normalizeLocation(item = {}) {
  return {
    id: item.id || item.excelId || `${item.cluster || ""}-${item.building || ""}-${item.zone || ""}`,
    excelId: item.excelId || "",
    cluster: item.cluster || "",
    building: item.building || "",
    zone: item.zone || "",
    direction: item.direction || "",
    lane: item.lane || "",
    type: item.type || "",
    devicesCount: Number(item.devicesCount || item._count?.devices || 0),
    gatesCount: Number(item.gatesCount || item._count?.gates || 0),
    inspectionsCount: Number(item.inspectionsCount || 0),
  };
}

function buildLocationRows(devices, gates, inspections, backendLocations) {
  const map = new Map();

  function ensureRow(location = {}) {
    const key = [
      location.cluster || "",
      location.building || "",
      location.zone || "",
      location.direction || "",
      location.lane || "",
    ].join("|");

    if (!map.has(key)) {
      map.set(key, {
        id: key || `loc-${map.size + 1}`,
        cluster: location.cluster || "",
        building: location.building || "",
        zone: location.zone || "",
        direction: location.direction || "",
        lane: location.lane || "",
        type: location.type || "",
        devicesCount: 0,
        gatesCount: 0,
        inspectionsCount: 0,
      });
    }

    return map.get(key);
  }

  backendLocations.forEach((loc) => {
    const row = ensureRow(loc);
    row.id = loc.id || row.id;
    row.excelId = loc.excelId || row.excelId || "";
    row.type = loc.type || row.type || "";
    row.devicesCount = Math.max(row.devicesCount, Number(loc.devicesCount || 0));
    row.gatesCount = Math.max(row.gatesCount, Number(loc.gatesCount || 0));
    row.inspectionsCount = Math.max(row.inspectionsCount, Number(loc.inspectionsCount || 0));
  });

  devices.forEach((device) => {
    const row = ensureRow(device.location);
    row.devicesCount += 1;
  });

  gates.forEach((gate) => {
    const row = ensureRow(gate.location);
    row.gatesCount += 1;
  });

  inspections.forEach((inspection) => {
    const row = ensureRow(inspection.assetLocation);
    row.inspectionsCount += 1;
  });

  return Array.from(map.values());
}

function buildWeeklyData(inspections, lang) {
  const now = new Date();

  return [3, 2, 1, 0].map((offset) => {
    const start = new Date(now);
    start.setDate(now.getDate() - (offset * 7 + 6));
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setDate(now.getDate() - offset * 7);
    end.setHours(23, 59, 59, 999);

    const weekInspections = inspections.filter((inspection) => {
      const d = new Date(inspection.inspectedAt || inspection.createdAt || 0);
      if (Number.isNaN(d.getTime())) return false;
      return d >= start && d <= end;
    });

    const ok = weekInspections.filter((inspection) => inspection.inspectionStatus === "OK").length;
    const attention = weekInspections.filter((inspection) => inspection.inspectionStatus !== "OK").length;

    return {
      label: lang === "ar" ? `الأسبوع ${4 - offset}` : `Week ${4 - offset}`,
      ok,
      attention,
      total: ok + attention,
    };
  });
}

function getLatestDate(items, keys = ["lastInspectionAt", "updatedAt", "createdAt"]) {
  let latest = null;

  items.forEach((item) => {
    keys.forEach((key) => {
      const value = item?.[key];
      if (!value) return;

      const time = new Date(value).getTime();
      if (Number.isNaN(time)) return;

      if (!latest || time > latest.time) {
        latest = { value, time };
      }
    });
  });

  return latest?.value || null;
}

function buildAssetAnalysis(devices, gates, inspections) {
  const deviceTotal = devices.length;
  const gateTotal = gates.length;

  const deviceOk = devices.filter((item) => item.currentStatus === "OK").length;

  const gateOk = gates.filter(
    (item) =>
      item.currentStatus === "OK" &&
      !["INACTIVE", "MAINTENANCE", "OUT_OF_SERVICE", "NEEDS_MAINTENANCE"].includes(item.status)
  ).length;

  const deviceBad = Math.max(deviceTotal - deviceOk, 0);
  const gateBad = Math.max(gateTotal - gateOk, 0);

  const totalAssets = deviceTotal + gateTotal;
  const totalOk = deviceOk + gateOk;
  const totalBad = deviceBad + gateBad;

  const readiness = totalAssets ? Math.round((totalOk / totalAssets) * 100) : 0;
  const deviceReadiness = deviceTotal ? Math.round((deviceOk / deviceTotal) * 100) : 0;
  const gateReadiness = gateTotal ? Math.round((gateOk / gateTotal) * 100) : 0;

  const deviceInspections = inspections.filter((item) => item.assetType === "DEVICE").length;
  const gateInspections = inspections.filter((item) => item.assetType === "GATE").length;

  const latestInspection = getLatestDate(inspections, ["inspectedAt", "createdAt"]);

  return {
    deviceTotal,
    gateTotal,
    deviceOk,
    gateOk,
    deviceBad,
    gateBad,
    totalAssets,
    totalOk,
    totalBad,
    readiness,
    deviceReadiness,
    gateReadiness,
    deviceInspections,
    gateInspections,
    latestInspection,
  };
}

/* ─── UI Components ────────────────────────────────────────────────────────── */
function ReadinessDonut({ healthy, attention, total, lang }) {
  const safeTotal = total || 1;
  const pct = Math.round((healthy / safeTotal) * 100);
  const C = 2 * Math.PI * 46;
  const healthyDash = (healthy / safeTotal) * C;
  const attentionDash = (attention / safeTotal) * C;

  return (
    <svg viewBox="0 0 160 160" width="160" height="160" aria-hidden="true">
      <circle cx="80" cy="80" r="46" fill="none" stroke="#e5e7eb" strokeWidth="18" />

      <circle
        cx="80"
        cy="80"
        r="46"
        fill="none"
        stroke="#4f46e5"
        strokeWidth="18"
        strokeLinecap="round"
        strokeDasharray={`${healthyDash} ${C}`}
        strokeDashoffset={C / 4}
        style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
      />

      {attention > 0 && (
        <circle
          cx="80"
          cy="80"
          r="46"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${attentionDash} ${C}`}
          strokeDashoffset={-(healthyDash - C / 4)}
          style={{ transform: "rotate(-90deg)", transformOrigin: "80px 80px" }}
        />
      )}

      <circle cx="80" cy="80" r="29" fill="#ffffff" />

      <text x="80" y="74" textAnchor="middle" fontSize="10" fill="#94a3b8" fontFamily="inherit">
        {lang === "ar" ? "جاهزية" : "Ready"}
      </text>

      <text x="80" y="96" textAnchor="middle" fontSize="23" fontWeight="900" fill="#0f172a" fontFamily="inherit">
        {pct}%
      </text>
    </svg>
  );
}

function KpiBox({ icon, label, value, note, color, bg, onClick, lang }) {
  return (
    <button
      type="button"
      className="vh__kpi"
      onClick={onClick}
      style={{ "--card-color": color, "--card-bg": bg }}
      title={lang === "ar" ? "اضغط لعرض التفاصيل" : "Click to view details"}
    >
      <div className="vh__kpi-top">
        <span className="vh__kpi-icon">{icon}</span>
        <span className="vh__kpi-click">{lang === "ar" ? "تفاصيل" : "Details"}</span>
      </div>

      <div className="vh__kpi-label">{label}</div>
      <div className="vh__kpi-value">{value}</div>
      <div className="vh__kpi-note">{note}</div>
    </button>
  );
}

function TrendBars({ weeklyData, lang }) {
  const max = Math.max(
    ...weeklyData.flatMap((week) => [Number(week.ok || 0), Number(week.attention || 0)]),
    1
  );

  return (
    <>
      <div className="vh__trend">
        {weeklyData.map((week) => {
          const okHeight = Math.max(3, (Number(week.ok || 0) / max) * 100);
          const attentionHeight = Math.max(3, (Number(week.attention || 0) / max) * 100);

          return (
            <div className="vh__week" key={week.label}>
              <div className="vh__week-bars">
                <div
                  className="vh__week-bar"
                  style={{
                    height: `${okHeight}%`,
                    background: "#4f46e5",
                  }}
                  title={`${week.label} OK: ${week.ok}`}
                />
                <div
                  className="vh__week-bar"
                  style={{
                    height: `${attentionHeight}%`,
                    background: "#f59e0b",
                  }}
                  title={`${week.label} Attention: ${week.attention}`}
                />
              </div>
              <div className="vh__week-label">{week.label}</div>
            </div>
          );
        })}
      </div>

      <div className="vh__legend">
        <div className="vh__legend-item">
          <span className="vh__legend-dot" style={{ background: "#4f46e5" }} />
          {lang === "ar" ? "سليم" : "OK"}
        </div>

        <div className="vh__legend-item">
          <span className="vh__legend-dot" style={{ background: "#f59e0b" }} />
          {lang === "ar" ? "تحتاج متابعة" : "Attention"}
        </div>
      </div>
    </>
  );
}

function AssetAnalysisPanel({ analysis, lang }) {
  const readyDeg = `${Math.max(0, Math.min(100, analysis.readiness)) * 3.6}deg`;

  const deviceOkWidth = analysis.deviceTotal
    ? (analysis.deviceOk / analysis.deviceTotal) * 100
    : 0;

  const deviceBadWidth = analysis.deviceTotal
    ? (analysis.deviceBad / analysis.deviceTotal) * 100
    : 0;

  const gateOkWidth = analysis.gateTotal
    ? (analysis.gateOk / analysis.gateTotal) * 100
    : 0;

  const gateBadWidth = analysis.gateTotal
    ? (analysis.gateBad / analysis.gateTotal) * 100
    : 0;

  const worstType =
    analysis.deviceReadiness < analysis.gateReadiness
      ? lang === "ar"
        ? "الأجهزة"
        : "devices"
      : lang === "ar"
      ? "البوابات"
      : "gates";

  const bestType =
    analysis.deviceReadiness >= analysis.gateReadiness
      ? lang === "ar"
        ? "الأجهزة"
        : "devices"
      : lang === "ar"
      ? "البوابات"
      : "gates";

  return (
    <div className="vh__analysis">
      <div className="vh__analysis-hero">
        <div className="vh__analysis-ring" style={{ "--ready-deg": readyDeg }}>
          <div className="vh__analysis-ring-inner">
            <div className="vh__analysis-ring-label">
              {lang === "ar" ? "الجاهزية" : "Readiness"}
            </div>
            <div className="vh__analysis-ring-value">{analysis.readiness}%</div>
          </div>
        </div>

        <div>
          <div className="vh__analysis-main-title">
            {lang === "ar" ? "تحليل صحة الأصول" : "Asset Health Analysis"}
          </div>

          <div className="vh__analysis-main-sub">
            {lang === "ar"
              ? "مقارنة مباشرة بين الأجهزة والبوابات بناءً على البيانات الحقيقية القادمة من الباك إند."
              : "Direct comparison between devices and gates using live backend data."}
          </div>

          <div className="vh__analysis-grid">
            <div className="vh__analysis-stat">
              <div className="vh__analysis-stat-label">
                {lang === "ar" ? "إجمالي الأصول" : "Total assets"}
              </div>
              <div className="vh__analysis-stat-value">
                {numberText(analysis.totalAssets, lang)}
              </div>
            </div>

            <div className="vh__analysis-stat">
              <div className="vh__analysis-stat-label">
                {lang === "ar" ? "سليم" : "Operational"}
              </div>
              <div className="vh__analysis-stat-value">
                {numberText(analysis.totalOk, lang)}
              </div>
            </div>

            <div className="vh__analysis-stat">
              <div className="vh__analysis-stat-label">
                {lang === "ar" ? "يحتاج متابعة" : "Need attention"}
              </div>
              <div className="vh__analysis-stat-value">
                {numberText(analysis.totalBad, lang)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="vh__compare">
        <div className="vh__compare-row">
          <div className="vh__compare-head">
            <div className="vh__compare-name">
              <span className="vh__compare-icon">🛠️</span>
              {lang === "ar" ? "الأجهزة" : "Devices"}
            </div>

            <div className="vh__compare-percent">{analysis.deviceReadiness}%</div>
          </div>

          <div className="vh__compare-track">
            <div className="vh__compare-ok" style={{ width: `${deviceOkWidth}%` }} />
            <div className="vh__compare-bad" style={{ width: `${deviceBadWidth}%` }} />
          </div>

          <div className="vh__compare-meta">
            <span>{lang === "ar" ? "سليم: " : "OK: "}{numberText(analysis.deviceOk, lang)}</span>
            <span>{lang === "ar" ? "متابعة: " : "Attention: "}{numberText(analysis.deviceBad, lang)}</span>
            <span>{lang === "ar" ? "فحوصات: " : "Inspections: "}{numberText(analysis.deviceInspections, lang)}</span>
          </div>
        </div>

        <div className="vh__compare-row">
          <div className="vh__compare-head">
            <div className="vh__compare-name">
              <span className="vh__compare-icon">🚪</span>
              {lang === "ar" ? "البوابات" : "Gates"}
            </div>

            <div className="vh__compare-percent">{analysis.gateReadiness}%</div>
          </div>

          <div className="vh__compare-track">
            <div className="vh__compare-ok" style={{ width: `${gateOkWidth}%` }} />
            <div className="vh__compare-bad" style={{ width: `${gateBadWidth}%` }} />
          </div>

          <div className="vh__compare-meta">
            <span>{lang === "ar" ? "سليم: " : "OK: "}{numberText(analysis.gateOk, lang)}</span>
            <span>{lang === "ar" ? "متابعة: " : "Attention: "}{numberText(analysis.gateBad, lang)}</span>
            <span>{lang === "ar" ? "فحوصات: " : "Inspections: "}{numberText(analysis.gateInspections, lang)}</span>
          </div>
        </div>
      </div>

      <div className="vh__insight-list">
        <div className="vh__insight">
          <div className="vh__insight-icon">📊</div>
          <div>
            <div className="vh__insight-title">
              {lang === "ar" ? "أفضل أداء" : "Best performance"}
            </div>
            <div className="vh__insight-text">
              {lang === "ar"
                ? `أفضل نسبة جاهزية حاليًا في ${bestType}.`
                : `The highest readiness percentage is currently in ${bestType}.`}
            </div>
          </div>
        </div>

        <div className="vh__insight">
          <div className="vh__insight-icon">🔎</div>
          <div>
            <div className="vh__insight-title">
              {lang === "ar" ? "الأولوية القادمة" : "Next priority"}
            </div>
            <div className="vh__insight-text">
              {lang === "ar"
                ? `ابدأي المراجعة من ${worstType} لأنها الأقل في الجاهزية مقارنة بباقي الأصول.`
                : `Start reviewing ${worstType}, because it has the lower readiness percentage.`}
            </div>
          </div>
        </div>

        <div className="vh__insight">
          <div className="vh__insight-icon">🕒</div>
          <div>
            <div className="vh__insight-title">
              {lang === "ar" ? "آخر فحص" : "Latest inspection"}
            </div>
            <div className="vh__insight-text">
              {formatDateTime(analysis.latestInspection, lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ detail, onClose, lang }) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [detail?.key]);

  useEffect(() => {
    if (!detail) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [detail, onClose]);

  const rows = Array.isArray(detail?.rows) ? detail.rows : [];
  const columns = Array.isArray(detail?.columns) ? detail.columns : [];

  const tableMinWidth = useMemo(() => {
    const totalWidth = columns.reduce((sum, column) => {
      const width = Number.parseInt(String(column.width || "130"), 10);
      return sum + (Number.isFinite(width) ? width : 130);
    }, 0);

    return Math.max(totalWidth, 1280);
  }, [columns]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
  }, [rows, query]);

  if (!detail) return null;

  return (
    <div className="vh__modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="vh__modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="vh__modal-head">
          <div>
            <div className="vh__modal-title">{detail.title}</div>
            <div className="vh__modal-sub">{detail.subtitle}</div>
          </div>

          <button className="vh__modal-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="vh__modal-tools">
          <input
            className="vh__search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={lang === "ar" ? "ابحث داخل البيانات..." : "Search inside data..."}
          />

          <div className="vh__modal-count">
            {lang === "ar" ? "النتائج: " : "Results: "}
            {numberText(filteredRows.length, lang)}
          </div>
        </div>

        <div className="vh__table-wrap">
          {filteredRows.length === 0 ? (
            <div className="vh__empty" style={{ marginTop: 20 }}>
              {lang === "ar" ? "لا توجد بيانات مطابقة." : "No matching data."}
            </div>
          ) : (
            <table className="vh__table" style={{ minWidth: `${tableMinWidth}px` }}>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key || column.label}
                      className={column.className || ""}
                      style={column.width ? { width: column.width } : undefined}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row, rowIndex) => (
                  <tr key={row.id || row.key || rowIndex}>
                    {columns.map((column) => {
                      const cellValue = column.render ? column.render(row) : row[column.key] ?? "—";
                      const titleValue =
                        typeof cellValue === "string" || typeof cellValue === "number"
                          ? String(cellValue)
                          : "";

                      return (
                        <td
                          key={column.key || column.label}
                          className={column.className || ""}
                          style={column.width ? { width: column.width } : undefined}
                          title={titleValue}
                        >
                          <span className="vh__cell">{cellValue}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────────── */
export function ViewerHomePage({
  currentUser: currentUserProp = null,
  loading: loadingProp = false,
  lang = "en",
  apiBaseUrl = "",
}) {
  const [currentUser, setCurrentUser] = useState(currentUserProp || null);
  const [devices, setDevices] = useState([]);
  const [gates, setGates] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);
  const isLoading = Boolean(loading || loadingProp);

  const deviceColumns = useMemo(
    () => [
      { key: "id", label: "ID", width: "70px" },
      {
        key: "deviceCode",
        label: lang === "ar" ? "كود الجهاز" : "Device code",
        width: "130px",
      },
      {
        key: "deviceName",
        label: lang === "ar" ? "اسم الجهاز" : "Device name",
        width: "150px",
      },
      {
        key: "currentStatus",
        label: lang === "ar" ? "الحالة" : "Status",
        width: "145px",
        className: "vh__td--status",
        render: (row) => <StatusPill status={row.currentStatus} lang={lang} />,
      },
      {
        key: "serialNumber",
        label: lang === "ar" ? "السيريال" : "Serial",
        width: "150px",
        className: "vh__td--serial",
      },
      {
        key: "deviceTypeName",
        label: lang === "ar" ? "النوع" : "Type",
        width: "120px",
        className: "vh__td--type",
      },
      {
        key: "location",
        label: lang === "ar" ? "الموقع" : "Location",
        width: "390px",
        className: "vh__td--location",
        render: (row) => joinLocation(row.location) || "—",
      },
      {
        key: "ipAddress",
        label: "IP Address",
        width: "170px",
        className: "vh__td--ip",
        render: (row) => normalizeIpAddress(row.ipAddress) || "—",
      },
      {
        key: "firmware",
        label: "Firmware",
        width: "95px",
        className: "vh__td--firmware",
      },
      {
        key: "lastInspectionAt",
        label: lang === "ar" ? "آخر فحص" : "Last inspection",
        width: "165px",
        className: "vh__td--date",
        render: (row) => formatDateTime(row.lastInspectionAt, lang),
      },
      {
        key: "notes",
        label: lang === "ar" ? "ملاحظات" : "Notes",
        width: "170px",
        className: "vh__td--notes",
      },
    ],
    [lang]
  );

  const gateColumns = useMemo(
    () => [
      { key: "id", label: "ID" },
      { key: "gateNo", label: lang === "ar" ? "رقم البوابة" : "Gate no" },
      { key: "secretCode", label: lang === "ar" ? "السيكريت كود" : "Secret code" },
      {
        key: "currentStatus",
        label: lang === "ar" ? "حالة التشغيل" : "Current status",
        render: (row) => <StatusPill status={row.currentStatus} lang={lang} />,
      },
      {
        key: "status",
        label: lang === "ar" ? "حالة البوابة" : "Gate status",
        render: (row) => <StatusPill status={row.status} lang={lang} />,
      },
      { key: "cluster", label: "Cluster" },
      { key: "building", label: "Building" },
      { key: "zone", label: "Zone" },
      { key: "direction", label: "Direction" },
      { key: "lane", label: "Lane" },
      { key: "type", label: "Type" },
      {
        key: "lastInspectionAt",
        label: lang === "ar" ? "آخر فحص" : "Last inspection",
        render: (row) => formatDateTime(row.lastInspectionAt, lang),
      },
      { key: "notes", label: lang === "ar" ? "ملاحظات" : "Notes" },
    ],
    [lang]
  );

  async function loadHomeData() {
    const requestId = ++requestIdRef.current;
    const startTime = Date.now();

    try {
      setLoading(true);
      setError("");

      const token = pickToken();

      const endpoints = {
        auth: [
          `${baseUrl}/auth/me`,
          `${baseUrl}/api/auth/me`,
          `${baseUrl}/users/me`,
          `${baseUrl}/api/users/me`,
          `${baseUrl}/profile`,
        ],
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

      const [authPack, devicesPack, gatesPack, inspectionsPack, locationsPack] =
        await Promise.all([
          fetchOptional("auth", endpoints.auth, token),
          fetchOptional("devices", endpoints.devices, token),
          fetchOptional("gates", endpoints.gates, token),
          fetchOptional("inspections", endpoints.inspections, token),
          fetchOptional("locations", endpoints.locations, token),
        ]);

      const rawUser =
        authPack.data?.user ||
        authPack.data?.data?.user ||
        authPack.data?.data ||
        authPack.data ||
        currentUserProp ||
        null;

      const normalizedDevices = extractArray(devicesPack.data, ["devices"])
        .map(normalizeDevice)
        .sort((a, b) => sortByNewest(a, b, ["lastInspectionAt", "updatedAt", "createdAt"]));

      const normalizedGates = extractArray(gatesPack.data, ["gates"])
        .map(normalizeGate)
        .sort((a, b) => sortByNewest(a, b, ["lastInspectionAt", "updatedAt", "createdAt"]));

      const normalizedInspections = extractArray(inspectionsPack.data, ["inspections"])
        .map(normalizeInspection)
        .sort((a, b) => sortByNewest(a, b, ["inspectedAt", "createdAt"]));

      const normalizedLocations = extractArray(locationsPack.data, ["locations"])
        .map(normalizeLocation);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      setCurrentUser(rawUser);
      setDevices(normalizedDevices);
      setGates(normalizedGates);
      setInspections(normalizedInspections);
      setLocations(normalizedLocations);

      if (!devicesPack.ok && !gatesPack.ok && !inspectionsPack.ok) {
        setError(
          lang === "ar"
            ? "لم يتم تحميل أي بيانات من الباك إند. راجعي رابط API أو التوكن."
            : "No backend data loaded. Check API URL or token."
        );
      }
    } catch (err) {
      console.error("Failed to load home data:", err);

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      setError(err?.message || "Failed to load home data from backend.");
    } finally {
      const elapsed = Date.now() - startTime;
      const wait = Math.max(0, MIN_HOMELOAD_MS - elapsed);

      if (wait > 0) {
        await new Promise((resolve) => setTimeout(resolve, wait));
      }

      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      setLoading(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadHomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const deviceOk = useMemo(
    () => devices.filter((device) => device.currentStatus === "OK"),
    [devices]
  );

  const deviceBad = useMemo(
    () => devices.filter((device) => device.currentStatus !== "OK"),
    [devices]
  );

  const gateOk = useMemo(
    () =>
      gates.filter(
        (gate) =>
          gate.currentStatus === "OK" &&
          (gate.status === "ACTIVE" || gate.status === "OK" || !gate.status)
      ),
    [gates]
  );

  const gateBad = useMemo(
    () =>
      gates.filter(
        (gate) =>
          gate.currentStatus !== "OK" ||
          ["INACTIVE", "MAINTENANCE", "OUT_OF_SERVICE", "NEEDS_MAINTENANCE"].includes(gate.status)
      ),
    [gates]
  );

  const allHealthy = deviceOk.length + gateOk.length;
  const allAttention = deviceBad.length + gateBad.length;
  const allAssetsTotal = devices.length + gates.length;

  const latestUpdate = getLatestDate(
    [...devices, ...gates, ...inspections],
    ["lastInspectionAt", "inspectedAt", "updatedAt", "createdAt"]
  );

  const weeklyData = useMemo(() => buildWeeklyData(inspections, lang), [inspections, lang]);

  const locationRows = useMemo(
    () => buildLocationRows(devices, gates, inspections, locations),
    [devices, gates, inspections, locations]
  );

  const topLocations = useMemo(
    () =>
      [...locationRows]
        .map((row) => ({
          ...row,
          totalAssets: Number(row.devicesCount || 0) + Number(row.gatesCount || 0),
        }))
        .sort((a, b) => b.totalAssets - a.totalAssets)
        .slice(0, 6),
    [locationRows]
  );

  const maxLocationAssets = Math.max(...topLocations.map((row) => row.totalAssets), 1);

  const assetAnalysis = useMemo(
    () => buildAssetAnalysis(devices, gates, inspections),
    [devices, gates, inspections]
  );

  function openDetails({ key, title, subtitle, rows, columns }) {
    setDetail({
      key,
      title,
      subtitle,
      rows,
      columns,
    });
  }

  return (
    <>
      <style>{HOME_CSS}</style>

      <div className="vh" dir={lang === "ar" ? "rtl" : "ltr"}>
        {!!error && (
          <div className="vh__alert vh__alert--error">
            {lang === "ar" ? "خطأ في الاتصال بالباك إند: " : "Backend connection error: "}
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="vh__loading">
            <div className="vh__loading-spinner" />
            {lang === "ar" ? "جارٍ تحميل البيانات..." : "Loading data..."}
          </div>
        ) : (
          <>
            <div className="vh__topbar">
              <div>
               
              </div>

              <div className="vh__chips">
                <div className="vh__chip">
                  {lang === "ar" ? "التاريخ: " : "Date: "}
                  {formatDate(lang)}
                </div>
                <div className="vh__chip">
                  {lang === "ar" ? "آخر تحديث: " : "Latest update: "}
                  {formatShortDate(latestUpdate, lang)}
                </div>
              </div>
            </div>

            <div className="vh__kpis">
              <KpiBox
                icon="🛠️"
                label={lang === "ar" ? "إجمالي الأجهزة" : "Total devices"}
                value={numberText(devices.length, lang)}
                note={lang === "ar" ? "من الباك إند" : "From backend"}
                color="#4f46e5"
                bg="rgba(79,70,229,0.10)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "all-devices",
                    title: lang === "ar" ? "إجمالي الأجهزة" : "Total devices",
                    subtitle: lang === "ar" ? "كل الأجهزة القادمة من الباك إند" : "All devices from backend",
                    rows: devices,
                    columns: deviceColumns,
                  })
                }
              />

              <KpiBox
                icon="✅"
                label={lang === "ar" ? "أجهزة سليمة" : "Operational devices"}
                value={numberText(deviceOk.length, lang)}
                note={lang === "ar" ? "حالتها OK" : "Status OK"}
                color="#10b981"
                bg="rgba(16,185,129,0.10)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "ok-devices",
                    title: lang === "ar" ? "أجهزة سليمة" : "Operational devices",
                    subtitle: lang === "ar" ? "الأجهزة السليمة فقط" : "Only operational devices",
                    rows: deviceOk,
                    columns: deviceColumns,
                  })
                }
              />

              <KpiBox
                icon="⚠️"
                label={lang === "ar" ? "أجهزة تحتاج متابعة" : "Devices need attention"}
                value={numberText(deviceBad.length, lang)}
                note={lang === "ar" ? "صيانة أو خارج الخدمة" : "Maintenance or out of service"}
                color="#f59e0b"
                bg="rgba(245,158,11,0.12)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "bad-devices",
                    title: lang === "ar" ? "أجهزة تحتاج متابعة" : "Devices need attention",
                    subtitle: lang === "ar" ? "الأجهزة التي تحتاج متابعة" : "Devices that need attention",
                    rows: deviceBad,
                    columns: deviceColumns,
                  })
                }
              />

              <KpiBox
                icon="🚪"
                label={lang === "ar" ? "إجمالي البوابات" : "Total gates"}
                value={numberText(gates.length, lang)}
                note={lang === "ar" ? "من الباك إند" : "From backend"}
                color="#0ea5e9"
                bg="rgba(14,165,233,0.11)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "all-gates",
                    title: lang === "ar" ? "إجمالي البوابات" : "Total gates",
                    subtitle: lang === "ar" ? "كل البوابات القادمة من الباك إند" : "All gates from backend",
                    rows: gates,
                    columns: gateColumns,
                  })
                }
              />

              <KpiBox
                icon="🟢"
                label={lang === "ar" ? "بوابات سليمة" : "Operational gates"}
                value={numberText(gateOk.length, lang)}
                note={lang === "ar" ? "بوابات تعمل" : "Operational gates"}
                color="#10b981"
                bg="rgba(16,185,129,0.10)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "ok-gates",
                    title: lang === "ar" ? "بوابات سليمة" : "Operational gates",
                    subtitle: lang === "ar" ? "البوابات السليمة فقط" : "Only operational gates",
                    rows: gateOk,
                    columns: gateColumns,
                  })
                }
              />

              <KpiBox
                icon="🚨"
                label={lang === "ar" ? "بوابات تحتاج متابعة" : "Gates need attention"}
                value={numberText(gateBad.length, lang)}
                note={lang === "ar" ? "تحتاج مراجعة" : "Need review"}
                color="#ef4444"
                bg="rgba(239,68,68,0.11)"
                lang={lang}
                onClick={() =>
                  openDetails({
                    key: "bad-gates",
                    title: lang === "ar" ? "بوابات تحتاج متابعة" : "Gates need attention",
                    subtitle: lang === "ar" ? "البوابات التي تحتاج متابعة" : "Gates that need attention",
                    rows: gateBad,
                    columns: gateColumns,
                  })
                }
              />
            </div>

            <div className="vh__grid-main">
              <div className="vh__card">
                <div className="vh__card-head">
                  <div>
                    <div className="vh__card-title">
                      {lang === "ar" ? "اتجاه الفحوصات" : "Inspection trend"}
                    </div>
                    <div className="vh__card-sub">
                      {lang === "ar" ? "آخر 4 أسابيع من الفحوصات" : "Last 4 weeks from inspections"}
                    </div>
                  </div>
                </div>

                <TrendBars weeklyData={weeklyData} lang={lang} />
              </div>

              <div className="vh__card">
                <div className="vh__card-head">
                  <div>
                    <div className="vh__card-title">
                      {lang === "ar" ? "جاهزية النظام" : "System readiness"}
                    </div>
                    <div className="vh__card-sub">
                      {lang === "ar" ? "صحة الأجهزة والبوابات" : "Devices and gates health split"}
                    </div>
                  </div>
                </div>

                <div className="vh__split">
                  <div className="vh__donut-wrap">
                    <ReadinessDonut
                      healthy={allHealthy}
                      attention={allAttention}
                      total={allAssetsTotal}
                      lang={lang}
                    />
                  </div>

                  <div className="vh__status-list">
                    <div className="vh__status-row">
                      <div className="vh__status-row-top">
                        <span className="vh__status-name">
                          {lang === "ar" ? "سليم" : "Operational"}
                        </span>
                        <span className="vh__status-value">{numberText(allHealthy, lang)}</span>
                      </div>
                      <div className="vh__track">
                        <div
                          className="vh__fill"
                          style={{
                            "--fill": "#4f46e5",
                            width: `${allAssetsTotal ? (allHealthy / allAssetsTotal) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="vh__status-row">
                      <div className="vh__status-row-top">
                        <span className="vh__status-name">
                          {lang === "ar" ? "تحتاج متابعة" : "Need attention"}
                        </span>
                        <span className="vh__status-value">{numberText(allAttention, lang)}</span>
                      </div>
                      <div className="vh__track">
                        <div
                          className="vh__fill"
                          style={{
                            "--fill": "#f59e0b",
                            width: `${allAssetsTotal ? (allAttention / allAssetsTotal) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="vh__status-row">
                      <div className="vh__status-row-top">
                        <span className="vh__status-name">
                          {lang === "ar" ? "إجمالي العناصر" : "Total assets"}
                        </span>
                        <span className="vh__status-value">{numberText(allAssetsTotal, lang)}</span>
                      </div>
                      <div className="vh__track">
                        <div className="vh__fill" style={{ "--fill": "#0ea5e9", width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="vh__bottom">
              <div className="vh__card">
                <div className="vh__card-head">
                  <div>
                    <div className="vh__card-title">
                      {lang === "ar" ? "أكثر المواقع نشاطًا" : "Top active locations"}
                    </div>
                    <div className="vh__card-sub">
                      {lang === "ar" ? "الأجهزة والبوابات لكل موقع" : "Devices and gates per location"}
                    </div>
                  </div>
                </div>

                {topLocations.length === 0 ? (
                  <div className="vh__empty">
                    {lang === "ar" ? "لا توجد مواقع من الباك إند." : "No locations from backend."}
                  </div>
                ) : (
                  <div className="vh__bar-list">
                    {topLocations.map((loc, index) => {
                      const label =
                        joinLocation(loc) ||
                        loc.excelId ||
                        `${lang === "ar" ? "موقع" : "Location"} ${index + 1}`;

                      const percent = (loc.totalAssets / maxLocationAssets) * 100;

                      return (
                        <div className="vh__bar-row" key={loc.id || label}>
                          <div className="vh__bar-label" title={label}>
                            {label}
                          </div>

                          <div className="vh__track">
                            <div
                              className="vh__fill"
                              style={{
                                "--fill": index % 2 === 0 ? "#4f46e5" : "#0ea5e9",
                                width: `${percent}%`,
                              }}
                            />
                          </div>

                          <div className="vh__bar-val">
                            {numberText(loc.totalAssets, lang)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="vh__card">
                <div className="vh__card-head">
                  <div>
                    <div className="vh__card-title">
                      {lang === "ar" ? "رسم تحليل صحة النظام" : "System Health Analysis"}
                    </div>

                    <div className="vh__card-sub">
                      {lang === "ar"
                        ? "تحليل بصري للأجهزة والبوابات من الباك إند"
                        : "Visual analysis for devices and gates from backend"}
                    </div>
                  </div>
                </div>

                <AssetAnalysisPanel analysis={assetAnalysis} lang={lang} />
              </div>
            </div>
          </>
        )}

        <DetailModal detail={detail} onClose={() => setDetail(null)} lang={lang} />
      </div>
    </>
  );
}

export default ViewerHomePage;