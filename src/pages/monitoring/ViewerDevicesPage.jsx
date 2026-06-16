import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   CSS
═══════════════════════════════════════════ */
const DEVICES_CSS = `
.dev-root *, .dev-root *::before, .dev-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.dev-root {
  --primary: #4f46e5;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
  --primary-light: #818cf8;
  --slate: #64748b;
  --surface: #ffffff;
  --surface2: #f7f8fa;
  --border: rgba(0,0,0,0.07);
  --text: #0f172a;
  --muted: #475569;
  --faint: #94a3b8;
  font-family: "Segoe UI", system-ui, sans-serif;
  background: #f1f5f9;
  color: var(--text);
  padding: 28px 24px;
  min-height: 100vh;
}



/* ── top actions ── */
.dev-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.dev-topbar__title {
  font-size: 22px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: -0.02em;
}

.dev-topbar__sub {
  font-size: 12px;
  color: var(--faint);
  margin-top: 4px;
}

.dev-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.dev-export-btn {
  height: 40px;
  padding: 0 16px;
  border: 1px solid #dbe4ef;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.18s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
}

.dev-export-btn:hover {
  transform: translateY(-1px);
  border-color: rgba(79, 70, 229, 0.35);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
}

.dev-export-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
  transform: none;
}

.dev-export-btn--excel {
  color: #047857;
  background: #ecfdf5;
  border-color: #bbf7d0;
}

.dev-export-btn--pdf {
  color: #b91c1c;
  background: #fff1f2;
  border-color: #fecdd3;
}

.dev-refresh-btn {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.18s ease;
}

.dev-refresh-btn:hover {
  transform: translateY(-1px);
  background: #4f46e5;
}

.dev-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
}

/* ── alerts ── */
.dev-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.dev-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.dev-alert--success {
  background: #ecfdf5;
  color: #166534;
  border-color: #bbf7d0;
}

/* ── summary cards ── */
.dev-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.dev-summary-card {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  position: relative;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
}

.dev-summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(15,23,42,0.08);
  border-color: rgba(79, 70, 229, 0.24);
}

.dev-summary-card.active {
  background: linear-gradient(135deg, rgba(79,70,229,0.09), #fff);
  border-color: rgba(79,70,229,0.35);
}

.dev-summary-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--card-color, linear-gradient(90deg, #4f46e5, #818cf8));
}

.dev-summary-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 800;
}

.dev-summary-value {
  font-size: 28px;
  font-weight: 900;
  color: var(--text);
}

.dev-summary-note {
  margin-top: 6px;
  font-size: 11px;
  color: var(--faint);
}

/* ═══════════════════════════════════════════
   Advanced Filter
═══════════════════════════════════════════ */
.dev-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(55,138,221,0.16), transparent 34%),
    radial-gradient(circle at bottom right, rgba(127,119,221,0.10), transparent 32%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.dev-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.dev-filter-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.dev-filter-icon {
  width: 38px;
  height: 38px;
  border-radius: 15px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.12);
}

.dev-filter-title-text {
  font-size: 15px;
  font-weight: 900;
  color: #0f172a;
}

.dev-filter-title-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.dev-filter-result {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  border: 1px solid rgba(79, 70, 229, 0.16);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.dev-filter-result-dot {
  width: 7px;
  height: 7px;
  background: #4f46e5;
  border-radius: 50%;
}

.dev-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(7, minmax(130px, 1fr));
  gap: 12px;
  align-items: end;
}

.dev-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.dev-filter-field label {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: #475569;
  white-space: nowrap;
}

.dev-filter-input,
.dev-filter-select {
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

.dev-filter-input {
  font-weight: 600;
}

.dev-filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.dev-filter-input:hover,
.dev-filter-select:hover {
  background-color: #ffffff;
  border-color: rgba(79, 70, 229, 0.3);
}

.dev-filter-input:focus,
.dev-filter-select:focus {
  border-color: #4f46e5;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.13);
}

.dev-filter-select {
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

.dev-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.dev-filter-hint {
  font-size: 12px;
  color: #94a3b8;
}

.dev-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dev-filter-btn {
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

.dev-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.dev-filter-btn-ok {
  background: #0f172a;
  color: #ffffff;
  min-width: 78px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

.dev-filter-btn:hover {
  transform: translateY(-1px);
}

.dev-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.dev-filter-btn-ok:hover {
  background: #4f46e5;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.24);
}

.dev-filter-btn:active {
  transform: translateY(0);
}

/* ── Panel ── */
.dev-panel {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.dev-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 0.5px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.dev-panel__title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}

.dev-panel__sub {
  font-size: 12px;
  color: var(--faint);
}

.dev-records {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
}

/* ── Table ── */
.dev-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.dev-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1100px;
}

.dev-table th {
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

.dev-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.dev-table tr:last-child td {
  border-bottom: none;
}

.dev-table tbody tr {
  cursor: pointer;
  transition: 0.16s ease;
}

.dev-table tbody tr:hover td {
  background: #fafbfc;
}

.dev-code {
  font-size: 13px;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: .3px;
}

.dev-name {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.dev-subline {
  font-size: 11px;
  color: var(--faint);
  margin-top: 2px;
}

.dev-insp-count {
  font-size: 15px;
  font-weight: 900;
  color: var(--text);
}

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
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
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
}

.badge--oos {
  background: #f1f3f5;
  color: #475569;
}

/* ── Empty / loading ── */
.dev-empty,
.dev-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.dev-loading-spinner {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  border-top-color: #4f46e5;
  margin: 0 auto 12px;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Modal / Real History Timeline ── */
.dev-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.dev-modal {
  width: min(1180px, 100%);
  max-height: 92vh;
  overflow: hidden;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 34px 100px rgba(15,23,42,0.32);
  display: flex;
  flex-direction: column;
}

.dev-modal-head {
  padding: 20px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  background:
    radial-gradient(circle at 15% 0%, rgba(79, 70, 229, 0.10), transparent 36%),
    radial-gradient(circle at 90% 5%, rgba(14, 165, 233, 0.10), transparent 35%),
    #ffffff;
}

.dev-modal-title {
  font-size: 22px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 5px;
  letter-spacing: -0.025em;
}

.dev-modal-sub {
  font-size: 12px;
  color: var(--faint);
  line-height: 1.6;
}

.dev-modal-close {
  border: none;
  background: #f1f5f9;
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 14px;
  cursor: pointer;
  font-size: 22px;
  transition: 0.16s ease;
}

.dev-modal-close:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.dev-modal-body {
  padding: 20px;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.dev-history-hero {
  display: grid;
  grid-template-columns: 1.05fr 1.35fr;
  gap: 16px;
  align-items: stretch;
  margin-bottom: 16px;
}

.dev-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.dev-detail {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255,255,255,0.92);
  border-radius: 17px;
  padding: 13px;
  box-shadow: 0 8px 18px rgba(15,23,42,0.03);
}

.dev-detail-label {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--faint);
  margin-bottom: 7px;
}

.dev-detail-value {
  font-size: 13px;
  font-weight: 850;
  color: var(--text);
  overflow-wrap: anywhere;
}

.dev-history-panel {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 22px;
  background:
    radial-gradient(circle at 5% 0%, rgba(79,70,229,0.10), transparent 34%),
    radial-gradient(circle at 100% 20%, rgba(16,185,129,0.10), transparent 30%),
    #ffffff;
  padding: 16px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.055);
}

.dev-history-title {
  font-size: 16px;
  font-weight: 950;
  color: #0f172a;
  margin-bottom: 4px;
}

.dev-history-sub {
  font-size: 12px;
  color: #94a3b8;
  line-height: 1.55;
  margin-bottom: 14px;
}

.dev-history-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.dev-history-kpi {
  border: 1px solid rgba(226, 232, 240, 0.96);
  background: rgba(248,250,252,0.78);
  border-radius: 16px;
  padding: 11px;
}

.dev-history-kpi-label {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 950;
  margin-bottom: 5px;
  white-space: nowrap;
}

.dev-history-kpi-value {
  color: #0f172a;
  font-size: 20px;
  font-weight: 950;
  line-height: 1;
}

.dev-chart-block {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: rgba(255,255,255,0.82);
  border-radius: 18px;
  padding: 12px;
  margin-top: 12px;
}

.dev-chart-head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.dev-chart-title {
  font-size: 12px;
  font-weight: 950;
  color: #0f172a;
}

.dev-chart-note {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 800;
}

.dev-day-bars,
.dev-month-bars {
  display: grid;
  align-items: end;
  gap: 5px;
  min-height: 96px;
}

.dev-day-bars {
  grid-template-columns: repeat(30, minmax(4px, 1fr));
}

.dev-month-bars {
  grid-template-columns: repeat(12, minmax(22px, 1fr));
  min-height: 118px;
}

.dev-bar-wrap {
  display: grid;
  align-items: end;
  gap: 5px;
  min-width: 0;
}

.dev-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 999px 999px 5px 5px;
  background: linear-gradient(180deg, #4f46e5, #818cf8);
  position: relative;
}

.dev-bar--bad {
  background: linear-gradient(180deg, #f59e0b, #fbbf24);
}

.dev-bar-label {
  font-size: 9px;
  color: #94a3b8;
  font-weight: 900;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dev-history-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin: 18px 0 12px;
}

.dev-period-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.dev-period-tab {
  border: 1px solid #dbe4ef;
  background: #ffffff;
  color: #475569;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
  transition: .16s ease;
}

.dev-period-tab:hover,
.dev-period-tab.active {
  background: #4f46e5;
  color: #ffffff;
  border-color: #4f46e5;
  box-shadow: 0 10px 22px rgba(79,70,229,0.22);
}

.dev-history-count {
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 950;
}

.dev-log-list {
  display: grid;
  gap: 12px;
  margin-top: 0;
  position: relative;
}

.dev-log-list::before {
  content: "";
  position: absolute;
  left: 17px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: linear-gradient(180deg, rgba(79,70,229,.45), rgba(14,165,233,.18));
}

.dev-root[dir="rtl"] .dev-log-list::before {
  left: auto;
  right: 17px;
}

.dev-log {
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 18px;
  padding: 14px 14px 14px 48px;
  background: #ffffff;
  position: relative;
  box-shadow: 0 10px 24px rgba(15,23,42,0.04);
}

.dev-root[dir="rtl"] .dev-log {
  padding: 14px 48px 14px 14px;
}

.dev-log::before {
  content: "";
  position: absolute;
  left: 9px;
  top: 17px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #ffffff;
  border: 5px solid #4f46e5;
  box-shadow: 0 0 0 4px #eef2ff;
}

.dev-root[dir="rtl"] .dev-log::before {
  left: auto;
  right: 9px;
}

.dev-log--bad::before {
  border-color: #f59e0b;
  box-shadow: 0 0 0 4px #fef3c7;
}

.dev-log-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.dev-log-date {
  color: #64748b;
  font-size: 11px;
  font-weight: 950;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  padding: 5px 9px;
}

.dev-log-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 10px 0;
}

.dev-log-meta-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  padding: 9px;
}

.dev-log-meta-label {
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}

.dev-log-meta-value {
  font-size: 12px;
  font-weight: 850;
  color: #0f172a;
  overflow-wrap: anywhere;
}

.dev-log-note {
  margin-top: 8px;
  font-size: 13px;
  color: #475569;
  line-height: 1.65;
  background: #f8fafc;
  border-radius: 13px;
  padding: 10px;
}

.dev-mini-loader {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 12px;
  font-weight: 900;
}

.dev-mini-loader::before {
  content: "";
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #dbeafe;
  border-top-color: #4f46e5;
  animation: spin .8s linear infinite;
}


.dev-log-meta--clean {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.dev-log--bad .dev-log-meta--clean {
  background: rgba(255, 241, 242, 0.4);
}

/* ── Responsive ── */
@media (max-width: 1600px) {
  .dev-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(150px, 1fr));
  }
}

@media (max-width: 1100px) {
  .dev-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dev-history-hero {
    grid-template-columns: 1fr;
  }

  .dev-history-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dev-log-meta {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .dev-root {
    padding: 16px 14px;
  }

  .dev-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dev-filter-actions {
    width: 100%;
  }

  .dev-filter-btn {
    flex: 1;
  }

  .dev-actions {
    width: 100%;
    justify-content: stretch;
  }

  .dev-refresh-btn,
  .dev-export-btn {
    flex: 1;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .dev-root {
    padding: 14px 10px;
  }



  .dev-summary {
    grid-template-columns: 1fr;
  }

  .dev-summary-card {
    min-height: 100px;
  }

  .dev-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .dev-filter-head {
    align-items: stretch;
  }

  .dev-filter-result {
    width: 100%;
    justify-content: center;
  }

  .dev-filter-grid {
    grid-template-columns: 1fr;
  }

  .dev-filter-footer {
    align-items: stretch;
  }

  .dev-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .dev-filter-btn {
    width: 100%;
  }

  .dev-panel__head {
    padding: 16px;
  }

  .dev-records {
    width: 100%;
    text-align: center;
  }

  .dev-table {
    min-width: 0;
  }

  .dev-table thead {
    display: none;
  }

  .dev-table,
  .dev-table tbody,
  .dev-table tr,
  .dev-table td {
    display: block;
    width: 100%;
  }

  .dev-table tr {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
  }

  .dev-table td {
    border-bottom: none;
    padding: 8px 0;
    display: grid;
    grid-template-columns: 118px 1fr;
    gap: 10px;
    align-items: center;
  }

  .dev-table td::before {
    content: attr(data-label);
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    color: var(--faint);
  }

  .dev-detail-grid,
  .dev-history-kpis {
    grid-template-columns: 1fr;
  }

  .dev-day-bars {
    grid-template-columns: repeat(15, minmax(4px, 1fr));
    row-gap: 10px;
  }

  .dev-month-bars {
    grid-template-columns: repeat(6, minmax(24px, 1fr));
    row-gap: 10px;
  }

  .dev-history-toolbar {
    align-items: stretch;
  }

  .dev-period-tabs {
    width: 100%;
  }

  .dev-period-tab {
    flex: 1;
  }

  .dev-modal-backdrop {
    padding: 0;
    align-items: end;
  }

  .dev-modal {
    border-radius: 22px 22px 0 0;
    max-height: 92vh;
  }
}

@media (max-width: 420px) {
  .dev-table td {
    grid-template-columns: 100px 1fr;
  }

  .dev-topbar__title {
    font-size: 20px;
  }
}
`;

/* ═══════════════════════════════════════════
   STATUS MAPS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK: { label: "Operational", cls: "badge--ok" },
  ATTENTION: { label: "Attention", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "Needs Maint.", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "Under Maint.", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "Out of Service", cls: "badge--oos" },
};

const BADGE_MAP_AR = {
  OK: { label: "تعمل", cls: "badge--ok" },
  ATTENTION: { label: "تحتاج متابعة", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "تحتاج صيانة", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "تحت الصيانة", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "خارج الخدمة", cls: "badge--oos" },
};

const STATUS_OPTIONS = [
  { key: "ALL", en: "All statuses", ar: "كل الحالات" },
  { key: "OK", en: "Operational", ar: "تعمل" },
  { key: "NON_OK", en: "Need attention", ar: "تحتاج متابعة" },
  { key: "ATTENTION", en: "Attention", ar: "متابعة" },
  { key: "NEEDS_MAINTENANCE", en: "Needs maintenance", ar: "تحتاج صيانة" },
  { key: "UNDER_MAINTENANCE", en: "Under maintenance", ar: "تحت الصيانة" },
  { key: "OUT_OF_SERVICE", en: "Out of service", ar: "خارج الخدمة" },
];

const RESULT_OPTIONS = [
  { key: "ALL", en: "All results", ar: "كل النتائج" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "NOT_OK", en: "Not OK", ar: "غير سليم" },
];

const INSPECTION_OPTIONS = [
  { key: "ALL", en: "All devices", ar: "كل الأجهزة" },
  { key: "INSPECTED", en: "Inspected", ar: "تم فحصه" },
  { key: "NOT_INSPECTED", en: "Not inspected", ar: "لم يتم فحصه" },
];

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function fmt(iso, lang = "en") {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fmtDateTime(iso, lang = "en") {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
    "https://acess-backend-production-8856.up.railway.app";

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

function normalizeId(value) {
  return String(value ?? "").trim().toLowerCase();
}

function mapStatus(rawStatus, inspectionsCount = 0) {
  const s = String(rawStatus || "").toUpperCase();

  if (s === "OK") return "OK";
  if (s === "NEEDS_MAINTENANCE") return "NEEDS_MAINTENANCE";
  if (s === "UNDER_MAINTENANCE") return "UNDER_MAINTENANCE";
  if (s === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";

  if (s === "NOT_OK" || s === "PARTIAL" || s === "NOT_REACHABLE") {
    return "ATTENTION";
  }

  if (s === "IN_PROGRESS") return "UNDER_MAINTENANCE";
  if (s === "OPEN") return "NEEDS_MAINTENANCE";
  if (s === "COMPLETED") return "OK";

  if (!s && inspectionsCount > 0) return "ATTENTION";

  return "OK";
}

function getDeviceResult(device) {
  return device.currentStatus === "OK" ? "OK" : "NOT_OK";
}

function cleanOptions(list) {
  return [...new Set(list.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ar"));
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
  ].filter(Boolean);

  for (const bag of bags) {
    if (Array.isArray(bag)) return bag;

    for (const key of keys) {
      if (Array.isArray(bag?.[key])) return bag[key];
    }

    if (Array.isArray(bag?.data)) return bag.data;
    if (Array.isArray(bag?.items)) return bag.items;
    if (Array.isArray(bag?.rows)) return bag.rows;
    if (Array.isArray(bag?.records)) return bag.records;
  }

  return [];
}

function getInspectionDate(inspection) {
  return (
    inspection?.inspectedAt ||
    inspection?.createdAt ||
    inspection?.updatedAt ||
    inspection?.date ||
    inspection?.scanDate ||
    inspection?.inspectionDate ||
    null
  );
}

function getInspectionDeviceId(inspection) {
  return normalizeId(
    inspection?.deviceId ||
    inspection?.device?.id ||
    inspection?.device_id ||
    inspection?.hardwareDeviceId ||
    inspection?.assetId ||
    ""
  );
}

function getDeviceId(device) {
  return normalizeId(
    device?.id ||
    device?.deviceId ||
    device?.device_id ||
    device?.hardwareDeviceId ||
    device?.assetId ||
    ""
  );
}

function makeMatchKeysFromDevice(device = {}) {
  return [
    device?.id,
    device?.deviceId,
    device?.device_id,
    device?.hardwareDeviceId,
    device?.assetId,
    device?.deviceCode,
    device?.code,
    device?.barcode,
    device?.serialNumber,
    device?.serial,
  ]
    .map(normalizeId)
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function makeMatchKeysFromInspection(inspection = {}) {
  const nestedDevice = inspection?.device || {};

  return [
    inspection?.deviceId,
    inspection?.device_id,
    inspection?.hardwareDeviceId,
    inspection?.assetId,
    inspection?.deviceCode,
    inspection?.device_code,
    inspection?.barcode,
    inspection?.serialNumber,
    inspection?.serial,
    inspection?.deviceSerial,
    inspection?.deviceBarcode,
    nestedDevice?.id,
    nestedDevice?.deviceId,
    nestedDevice?.device_id,
    nestedDevice?.hardwareDeviceId,
    nestedDevice?.assetId,
    nestedDevice?.deviceCode,
    nestedDevice?.code,
    nestedDevice?.barcode,
    nestedDevice?.serialNumber,
    nestedDevice?.serial,
  ]
    .map(normalizeId)
    .filter(Boolean)
    .filter((value, index, list) => list.indexOf(value) === index);
}

function normalizeInspection(item = {}) {
  const nestedDevice = item.device || {};
  const {
    technician,
    technicianName,
    techName,
    user,
    createdBy,
    updatedBy,
    ...safeItem
  } = item;

  return {
    ...safeItem,
    id: item.id,
    deviceId: item.deviceId || nestedDevice.id || item.device_id || null,
    deviceCode:
      item.deviceCode ||
      item.device_code ||
      nestedDevice.deviceCode ||
      nestedDevice.code ||
      "",
    deviceSerial:
      item.deviceSerial ||
      item.serialNumber ||
      item.serial ||
      nestedDevice.serialNumber ||
      nestedDevice.serial ||
      "",
    deviceBarcode:
      item.deviceBarcode ||
      item.barcode ||
      nestedDevice.barcode ||
      "",
    inspectionStatus: String(
      item.inspectionStatus || item.status || item.result || "NOT_REACHABLE"
    ).toUpperCase(),
    inspectedAt: getInspectionDate(item),
    issueReason: item.issueReason || item.reason || item.problem || item.issue || "",
    notes: item.notes || item.comment || item.description || "",
    locationSnapshot: item.locationSnapshot || item.location || nestedDevice.location || null,
  };
}

function normalizeDevice(item) {
  const location =
    item.location ||
    item.parsedLoc ||
    item.locationData ||
    {};

  const deviceType = item.deviceType || item.type || {};
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];

  const inspectionsCount =
    item.inspectionsCount ??
    item._count?.inspections ??
    item.inspections_count ??
    inspectionsArray.length ??
    0;

  const rawStatus =
    item.currentStatus ||
    item.status ||
    item.deviceStatus ||
    item.inspectionStatus ||
    item.lastInspectionStatus ||
    "";

  return {
    id: item.id,
    deviceId: item.deviceId || item.device_id || item.hardwareDeviceId || item.assetId || item.id,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    serialNumber: item.serialNumber || item.serial || "",
    barcode: item.barcode || "",
    currentStatus: mapStatus(rawStatus, inspectionsCount),
    manufacturer: item.manufacturer || "",
    modelNumber: item.modelNumber || "",
    firmware: item.firmware || item.firmwareVersion || "",
    ipAddress: item.ipAddress || item.ip || item.ip_address || "",
    deviceTypeName: deviceType.name || item.deviceTypeName || item.typeName || "",
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      item.lastInspection ||
      inspectionsArray[0]?.inspectedAt ||
      inspectionsArray[0]?.createdAt ||
      null,
    inspectionsCount,
    relatedInspections: inspectionsArray.map(normalizeInspection),
    parsedLoc: {
      cluster: location.cluster || item.cluster || item.gateCluster || "",
      building: location.building || item.building || item.gateBuilding || "",
      zone: location.zone || item.zone || item.gateZone || "",
      direction: location.direction || item.direction || item.gateDirection || "",
      lane: location.lane || item.lane || "",
      type: location.type || item.type || "",
    },
  };
}

function mergeUniqueInspections(primary = [], secondary = []) {
  const map = new Map();

  [...primary, ...secondary].forEach((inspection, index) => {
    const normalized = normalizeInspection(inspection);
    const key = normalizeId(normalized.id) || `${normalizeId(normalized.deviceId)}-${normalized.inspectedAt || index}-${normalized.inspectionStatus}`;
    if (!map.has(key)) {
      map.set(key, normalized);
    }
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0)
  );
}

function attachInspectionData(devices, inspections) {
  const map = new Map();

  inspections.forEach((inspection) => {
    const keys = makeMatchKeysFromInspection(inspection);

    keys.forEach((key) => {
      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(inspection);
    });
  });

  map.forEach((list) => {
    list.sort((a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0));
  });

  return devices.map((device) => {
    const keys = makeMatchKeysFromDevice(device);
    const matched = keys.flatMap((key) => map.get(key) || []);
    const related = mergeUniqueInspections(matched, device.relatedInspections || []);
    const latest = related[0] || null;

    return {
      ...device,
      inspectionsCount: Math.max(Number(device.inspectionsCount) || 0, related.length),
      lastInspectionAt: latest ? getInspectionDate(latest) : device.lastInspectionAt,
      relatedInspections: related,
    };
  });
}

function buildDeviceSearchText(device) {
  return normalizeText(
    [
      device.id,
      device.deviceCode,
      device.deviceName,
      device.serialNumber,
      device.barcode,
      device.manufacturer,
      device.modelNumber,
      device.ipAddress,
      device.firmware,
      device.deviceTypeName,
      device.currentStatus,
      getDeviceResult(device),
      device.parsedLoc?.cluster,
      device.parsedLoc?.building,
      device.parsedLoc?.zone,
      device.parsedLoc?.direction,
      device.parsedLoc?.lane,
      device.parsedLoc?.type,
      fmt(device.lastInspectionAt),
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
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText} @ ${url}`);
        continue;
      }

      const data = await response.json();

      return {
        sourceUrl: url,
        data,
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found.");
}

async function fetchDevicesFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/devices`,
    `${baseUrl}/api/devices`,
    `${baseUrl}/viewer/devices`,
    `${baseUrl}/dashboard/devices`,
    `${baseUrl}/dashboard/viewer/devices`,
  ];

  const result = await fetchJsonCandidates(candidates, token);

  const rawList = extractArray(result.data, ["devices"]);

  return {
    sourceUrl: result.sourceUrl,
    items: rawList.map(normalizeDevice),
  };
}

async function fetchInspectionsFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/inspections`,
    `${baseUrl}/api/inspections`,
    `${baseUrl}/viewer/inspections`,
    `${baseUrl}/dashboard/inspections`,
    `${baseUrl}/dashboard/viewer/inspections`,
  ];

  const result = await fetchJsonCandidates(candidates, token);

  const rawList = extractArray(result.data, ["inspections"]);

  return {
    sourceUrl: result.sourceUrl,
    items: rawList.map(normalizeInspection),
  };
}

async function fetchDeviceHistoryFromApi(baseUrl, token, device) {
  const keys = makeMatchKeysFromDevice(device);
  const primaryId = encodeURIComponent(device?.id || device?.deviceId || device?.deviceCode || "");
  const deviceCode = encodeURIComponent(device?.deviceCode || "");
  const serial = encodeURIComponent(device?.serialNumber || "");
  const barcode = encodeURIComponent(device?.barcode || "");

  const candidates = [
    primaryId && `${baseUrl}/devices/${primaryId}/inspections`,
    primaryId && `${baseUrl}/api/devices/${primaryId}/inspections`,
    primaryId && `${baseUrl}/viewer/devices/${primaryId}/inspections`,
    primaryId && `${baseUrl}/devices/${primaryId}/history`,
    primaryId && `${baseUrl}/api/devices/${primaryId}/history`,
    primaryId && `${baseUrl}/inspections?deviceId=${primaryId}`,
    primaryId && `${baseUrl}/api/inspections?deviceId=${primaryId}`,
    deviceCode && `${baseUrl}/inspections?deviceCode=${deviceCode}`,
    deviceCode && `${baseUrl}/api/inspections?deviceCode=${deviceCode}`,
    serial && `${baseUrl}/inspections?serialNumber=${serial}`,
    serial && `${baseUrl}/api/inspections?serialNumber=${serial}`,
    barcode && `${baseUrl}/inspections?barcode=${barcode}`,
    barcode && `${baseUrl}/api/inspections?barcode=${barcode}`,
  ].filter(Boolean);

  const result = await fetchJsonCandidates(candidates, token);
  const rawList = extractArray(result.data, ["inspections", "history", "items", "records"]);
  const normalized = rawList.map(normalizeInspection);

  return normalized.filter((inspection) => {
    const inspectionKeys = makeMatchKeysFromInspection(inspection);
    return inspectionKeys.some((key) => keys.includes(key));
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
}

function downloadBlob(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getInspectionNote(inspection) {
  return inspection?.notes || inspection?.issueReason || inspection?.reason || "";
}

function monthKeyFromDate(iso) {
  const d = new Date(iso || 0);
  if (Number.isNaN(d.getTime())) return "No date";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function yearKeyFromDate(iso) {
  const d = new Date(iso || 0);
  if (Number.isNaN(d.getTime())) return "No date";
  return String(d.getFullYear());
}

function formatMonthLabel(year, monthIndex, lang) {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    month: "short",
  });
}

function countOkBad(list) {
  const ok = list.filter((item) => String(item.inspectionStatus).toUpperCase() === "OK").length;
  const bad = Math.max(list.length - ok, 0);
  return { ok, bad, total: list.length };
}

function getDeviceHistoryStats(device) {
  const related = device?.relatedInspections || [];
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const thisMonth = related.filter((inspection) => {
    const d = new Date(getInspectionDate(inspection) || 0);
    return !Number.isNaN(d.getTime()) && d >= monthStart && d <= now;
  });

  const thisYear = related.filter((inspection) => {
    const d = new Date(getInspectionDate(inspection) || 0);
    return !Number.isNaN(d.getTime()) && d >= yearStart && d <= now;
  });

  const all = countOkBad(related);
  const month = countOkBad(thisMonth);
  const year = countOkBad(thisYear);

  return {
    all,
    month,
    year,
    latest: related[0] || null,
    first: related.length ? related[related.length - 1] : null,
  };
}

function buildLast30DaysSeries(related) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return Array.from({ length: 30 }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - index));
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const list = related.filter((inspection) => {
      const inspected = new Date(getInspectionDate(inspection) || 0);
      return !Number.isNaN(inspected.getTime()) && inspected >= start && inspected <= end;
    });

    return {
      key: d.toISOString().slice(0, 10),
      label: String(d.getDate()),
      ...countOkBad(list),
    };
  });
}

function buildYearSeries(related, lang) {
  const now = new Date();
  const year = now.getFullYear();

  return Array.from({ length: 12 }, (_, monthIndex) => {
    const list = related.filter((inspection) => {
      const d = new Date(getInspectionDate(inspection) || 0);
      return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === monthIndex;
    });

    return {
      key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      label: formatMonthLabel(year, monthIndex, lang),
      ...countOkBad(list),
    };
  });
}

function filterHistoryByPeriod(related, period) {
  if (period === "ALL") return related;

  const now = new Date();
  const start = new Date(now);

  if (period === "30D") {
    start.setDate(now.getDate() - 30);
  } else if (period === "YEAR") {
    start.setMonth(now.getMonth() - 12);
  } else {
    return related;
  }

  return related.filter((inspection) => {
    const d = new Date(getInspectionDate(inspection) || 0);
    return !Number.isNaN(d.getTime()) && d >= start && d <= now;
  });
}

function buildReportData(devices, inspections, lang) {
  const normalizedDevices = devices.map(normalizeDevice);
  const finalDevices = attachInspectionData(normalizedDevices, inspections.map(normalizeInspection));

  const deviceRows = finalDevices.map((device) => {
    const result = getDeviceResult(device);
    return {
      "Device Code": device.deviceCode || "",
      "Device Name": device.deviceName || "",
      "Result": result,
      "Status": device.currentStatus || "",
      "Cluster": device.parsedLoc?.cluster || "",
      "Building": device.parsedLoc?.building || "",
      "Zone": device.parsedLoc?.zone || "",
      "Direction": device.parsedLoc?.direction || "",
      "Lane": device.parsedLoc?.lane || "",
      "Serial": device.serialNumber || "",
      "IP Address": device.ipAddress || "",
      "Firmware": device.firmware || "",
      "Manufacturer": device.manufacturer || "",
      "Model": device.modelNumber || "",
      "Last Inspection": fmtDateTime(device.lastInspectionAt, lang),
      "Inspections Count": device.inspectionsCount || 0,
    };
  });

  // مهم: لا نصدّر أسماء الفنيين ولا الملاحظات الطويلة أو JSON حتى لا يثقل PDF/Excel.
  const historyRows = finalDevices.flatMap((device) =>
    (device.relatedInspections || []).map((inspection) => ({
      "Device Code": device.deviceCode || "",
      "Serial": device.serialNumber || "",
      "Result": inspection.inspectionStatus === "OK" ? "OK" : "NOT OK",
      "Device Status": inspection.inspectionStatus || "",
      "Date": fmtDateTime(getInspectionDate(inspection), lang),
      "Month": monthKeyFromDate(getInspectionDate(inspection)),
      "Year": yearKeyFromDate(getInspectionDate(inspection)),
    }))
  );

  const monthMap = new Map();
  historyRows.forEach((row) => {
    const key = `${row["Device Code"]}|${row.Month}`;
    if (!monthMap.has(key)) {
      monthMap.set(key, {
        "Device Code": row["Device Code"],
        "Month": row.Month,
        "OK": 0,
        "Not OK": 0,
        "Total": 0,
      });
    }
    const item = monthMap.get(key);
    item.Total += 1;
    if (row.Result === "OK") item.OK += 1;
    else item["Not OK"] += 1;
  });

  const yearMap = new Map();
  historyRows.forEach((row) => {
    const key = `${row["Device Code"]}|${row.Year}`;
    if (!yearMap.has(key)) {
      yearMap.set(key, {
        "Device Code": row["Device Code"],
        "Year": row.Year,
        "OK": 0,
        "Not OK": 0,
        "Total": 0,
      });
    }
    const item = yearMap.get(key);
    item.Total += 1;
    if (row.Result === "OK") item.OK += 1;
    else item["Not OK"] += 1;
  });

  const okDevices = finalDevices.filter((device) => getDeviceResult(device) === "OK").length;
  const notOkDevices = finalDevices.length - okDevices;

  const summaryRows = [
    { Metric: "Export date", Value: fmtDateTime(new Date().toISOString(), lang) },
    { Metric: "Total devices", Value: finalDevices.length },
    { Metric: "OK devices", Value: okDevices },
    { Metric: "Not OK devices", Value: notOkDevices },
    { Metric: "Total inspections", Value: historyRows.length },
    { Metric: "Technician names", Value: "Hidden" },
    { Metric: "Long notes / JSON", Value: "Hidden for fast clean reports" },
  ];

  return {
    summaryRows,
    deviceRows,
    historyRows,
    monthlyRows: Array.from(monthMap.values()).sort((a, b) => String(a.Month).localeCompare(String(b.Month))),
    yearlyRows: Array.from(yearMap.values()).sort((a, b) => String(a.Year).localeCompare(String(b.Year))),
  };
}

function rowsToXmlWorksheet(sheetName, rows) {
  const headers = rows.length ? Object.keys(rows[0]) : ["No data"];
  const headerXml = headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(header)}</Data></Cell>`).join("");
  const rowsXml = rows.length
    ? rows
        .map((row) => `<Row>${headers.map((header) => `<Cell><Data ss:Type="String">${escapeXml(row[header] ?? "")}</Data></Cell>`).join("")}</Row>`)
        .join("")
    : `<Row><Cell><Data ss:Type="String">No data</Data></Cell></Row>`;

  return `<Worksheet ss:Name="${escapeXml(sheetName).slice(0, 31)}"><Table><Row>${headerXml}</Row>${rowsXml}</Table></Worksheet>`;
}

function exportExcelReport(devices, inspections, lang) {
  const report = buildReportData(devices, inspections, lang);
  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${rowsToXmlWorksheet("Summary", report.summaryRows)}
 ${rowsToXmlWorksheet("Devices", report.deviceRows)}
 ${rowsToXmlWorksheet("Inspection History", report.historyRows)}
 ${rowsToXmlWorksheet("Monthly Analysis", report.monthlyRows)}
 ${rowsToXmlWorksheet("Yearly Analysis", report.yearlyRows)}
</Workbook>`;

  downloadBlob(
    workbook,
    `devices_full_report_${dateStamp()}.xls`,
    "application/vnd.ms-excel;charset=utf-8"
  );
}

function tableHtml(title, rows) {
  if (!rows.length) {
    return `<section><h2>${escapeHtml(title)}</h2><div class="empty">No data</div></section>`;
  }

  const headers = Object.keys(rows[0]);
  const bodyRows = rows
    .map((row) => `<tr>${headers.map((h) => `<td>${escapeHtml(row[h] ?? "")}</td>`).join("")}</tr>`)
    .join("");

  return `<section>
    <h2>${escapeHtml(title)} <small>${escapeHtml(rows.length)} rows</small></h2>
    <table>
      <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
  </section>`;
}

async function exportPdfReport(devices, inspections, lang) {
  const title = lang === "ar" ? "تقرير الأجهزة السريع" : "Fast Devices Report";
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    const report = buildReportData(devices, inspections, lang);
    const fallbackHtml = `<html><body>${tableHtml("Summary", report.summaryRows)}${tableHtml("Devices", report.deviceRows)}</body></html>`;
    downloadBlob(fallbackHtml, `devices_fast_report_${dateStamp()}.html`, "text/html;charset=utf-8");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(title)}</title></head><body style="font-family:Segoe UI,Arial,sans-serif;padding:24px;color:#0f172a"><h2>${escapeHtml(lang === "ar" ? "جارٍ تجهيز التقرير..." : "Preparing report...")}</h2><p>${escapeHtml(lang === "ar" ? "تم إلغاء الملاحظات الطويلة والـ JSON لتجنب التهنيج." : "Long notes and JSON are hidden to keep export fast.")}</p></body></html>`);
  printWindow.document.close();

  await new Promise((resolve) => setTimeout(resolve, 80));

  const report = buildReportData(devices, inspections, lang);
  const html = `<!doctype html>
<html dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4 landscape; margin: 8mm; }
  * { box-sizing: border-box; }
  body { font-family: "Segoe UI", Arial, sans-serif; color: #0f172a; margin: 0; background: #fff; }
  .screen-actions { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; gap: 12px; background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 12px; }
  .screen-actions button { border: none; border-radius: 12px; padding: 10px 16px; background: #0f172a; color: #fff; font-weight: 900; cursor: pointer; }
  header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; margin: 12px 0 14px; border-bottom: 3px solid #4f46e5; padding: 0 0 10px; }
  h1 { font-size: 22px; margin: 0 0 6px; }
  .sub { color: #64748b; font-size: 11px; line-height: 1.5; }
  .pill { display: inline-block; border: 1px solid #dbe4ef; border-radius: 999px; padding: 6px 9px; font-size: 10px; font-weight: 800; margin: 0 4px 6px; }
  section { margin: 0 0 14px; break-inside: auto; page-break-inside: auto; }
  h2 { font-size: 13px; margin: 0 0 6px; background: #f1f5f9; padding: 8px 9px; border-radius: 8px; }
  h2 small { color: #64748b; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; font-size: 8px; table-layout: fixed; }
  th { background: #eef2ff; color: #334155; text-align: start; font-weight: 900; }
  th, td { border: 1px solid #e2e8f0; padding: 4px; vertical-align: top; overflow: hidden; text-overflow: ellipsis; word-break: break-word; }
  tr:nth-child(even) td { background: #fafafa; }
  .empty { border: 1px dashed #cbd5e1; color: #94a3b8; padding: 14px; border-radius: 10px; }
  .watermark { color: #94a3b8; font-size: 10px; margin-top: 8px; }
  @media print { .screen-actions { display: none; } body { margin: 0; } }
</style>
</head>
<body>
<div class="screen-actions">
  <strong>${escapeHtml(title)}</strong>
  <button onclick="window.print()">${escapeHtml(lang === "ar" ? "حفظ كـ PDF" : "Save as PDF")}</button>
</div>
<header>
  <div>
    <h1>${escapeHtml(title)}</h1>
    <div class="sub">${escapeHtml(lang === "ar" ? "تقرير سريع ومنظم بدون أسماء الفنيين وبدون الملاحظات الطويلة أو JSON. اضغطي حفظ كـ PDF من الزر بالأعلى." : "Fast organized report without technician names, long notes, or JSON. Use the Save as PDF button at the top.")}</div>
  </div>
  <div>
    <span class="pill">${escapeHtml(fmtDateTime(new Date().toISOString(), lang))}</span>
    <span class="pill">Devices: ${escapeHtml(report.deviceRows.length)}</span>
    <span class="pill">History: ${escapeHtml(report.historyRows.length)}</span>
  </div>
</header>
${tableHtml("Summary", report.summaryRows)}
${tableHtml("Devices", report.deviceRows)}
${tableHtml("Inspection History", report.historyRows)}
${tableHtml("Monthly Analysis", report.monthlyRows)}
${tableHtml("Yearly Analysis", report.yearlyRows)}
<div class="watermark">Technician names, long notes, and backend JSON are hidden by design for privacy and speed.</div>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function StatusBadge({ value, lang }) {
  const map = lang === "ar" ? BADGE_MAP_AR : BADGE_MAP;
  const badge = map[value] || { label: value || "Unknown", cls: "badge--oos" };

  return <span className={`badge ${badge.cls}`}>{badge.label}</span>;
}

function ResultBadge({ result, lang }) {
  if (result === "OK") {
    return <span className="badge badge--ok">{lang === "ar" ? "سليم" : "OK"}</span>;
  }

  return <span className="badge badge--maint">{lang === "ar" ? "غير سليم" : "Not OK"}</span>;
}

function TinyBarChart({ items, type = "day" }) {
  const max = Math.max(...items.map((item) => Number(item.total || 0)), 1);

  return (
    <div className={type === "month" ? "dev-month-bars" : "dev-day-bars"}>
      {items.map((item) => {
        const height = Math.max(4, (Number(item.total || 0) / max) * 100);
        const hasBad = Number(item.bad || 0) > 0;

        return (
          <div className="dev-bar-wrap" key={item.key} title={`${item.label}: ${item.total} | OK: ${item.ok} | Not OK: ${item.bad}`}>
            <div
              className={`dev-bar ${hasBad ? "dev-bar--bad" : ""}`}
              style={{ height: `${height}%` }}
            />
            <div className="dev-bar-label">{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function DeviceDetailsModal({ device, lang, onClose, historyLoading = false }) {
  const [period, setPeriod] = useState("30D");

  if (!device) return null;

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const result = getDeviceResult(device);
  const related = (device.relatedInspections || []).sort(
    (a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0)
  );
  const visibleHistory = filterHistoryByPeriod(related, period);
  const loc = device.parsedLoc || {};
  const stats = getDeviceHistoryStats({ ...device, relatedInspections: related });
  const last30Days = buildLast30DaysSeries(related);
  const yearSeries = buildYearSeries(related, lang);
  const latestStatus = stats.latest?.inspectionStatus || device.currentStatus;

  return (
    <div className="dev-modal-backdrop" onMouseDown={onClose}>
      <div className="dev-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="dev-modal-head">
          <div>
            <div className="dev-modal-title">{device.deviceCode || `DEV-${device.id}`}</div>
            <div className="dev-modal-sub">
              {device.deviceName || t("Unknown device", "جهاز غير معروف")} · {t("real backend history", "تاريخ حقيقي من الباك إند")}
            </div>
          </div>

          <button className="dev-modal-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="dev-modal-body">
          <div className="dev-history-hero">
            <div className="dev-detail-grid">
              <div className="dev-detail">
                <div className="dev-detail-label">{t("Result", "النتيجة")}</div>
                <div className="dev-detail-value"><ResultBadge result={result} lang={lang} /></div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Latest status", "آخر حالة")}</div>
                <div className="dev-detail-value"><StatusBadge value={latestStatus} lang={lang} /></div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Cluster", "المجموعة")}</div>
                <div className="dev-detail-value">{loc.cluster || "—"}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Building", "المبنى")}</div>
                <div className="dev-detail-value">{loc.building || "—"}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Zone", "المنطقة")}</div>
                <div className="dev-detail-value">{loc.zone || "—"}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Direction", "الاتجاه")}</div>
                <div className="dev-detail-value">{loc.direction || "—"}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Last Inspection", "آخر فحص")}</div>
                <div className="dev-detail-value">{fmtDateTime(device.lastInspectionAt, lang)}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Total history", "إجمالي السجل")}</div>
                <div className="dev-detail-value">{related.length}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">{t("Serial", "السيريال")}</div>
                <div className="dev-detail-value">{device.serialNumber || "—"}</div>
              </div>

              <div className="dev-detail">
                <div className="dev-detail-label">IP Address</div>
                <div className="dev-detail-value">{device.ipAddress || "—"}</div>
              </div>
            </div>

            <div className="dev-history-panel">
              <div className="dev-history-title">
                {t("Timeline & Health History", "الـ Timeline وتحليل تاريخ الجهاز")}
              </div>
              <div className="dev-history-sub">
                {t(
                  "Monthly and yearly view built from the actual inspections linked to this device. Only device status is shown.",
                  "عرض شهري وسنوي مبني على الفحوصات الحقيقية المرتبطة بالجهاز، ويظهر حالة الجهاز فقط."
                )}
              </div>

              <div className="dev-history-kpis">
                <div className="dev-history-kpi">
                  <div className="dev-history-kpi-label">{t("This month", "هذا الشهر")}</div>
                  <div className="dev-history-kpi-value">{stats.month.total}</div>
                </div>
                <div className="dev-history-kpi">
                  <div className="dev-history-kpi-label">{t("Month OK", "سليم شهريًا")}</div>
                  <div className="dev-history-kpi-value">{stats.month.ok}</div>
                </div>
                <div className="dev-history-kpi">
                  <div className="dev-history-kpi-label">{t("This year", "هذه السنة")}</div>
                  <div className="dev-history-kpi-value">{stats.year.total}</div>
                </div>
                <div className="dev-history-kpi">
                  <div className="dev-history-kpi-label">{t("Year issues", "مشاكل السنة")}</div>
                  <div className="dev-history-kpi-value">{stats.year.bad}</div>
                </div>
              </div>

              <div className="dev-chart-block">
                <div className="dev-chart-head">
                  <div className="dev-chart-title">{t("Last 30 days", "آخر 30 يوم")}</div>
                  <div className="dev-chart-note">{t("Orange = issues", "البرتقالي = مشاكل")}</div>
                </div>
                <TinyBarChart items={last30Days} />
              </div>

              <div className="dev-chart-block">
                <div className="dev-chart-head">
                  <div className="dev-chart-title">{t("Current year by month", "السنة الحالية بالشهور")}</div>
                  <div className="dev-chart-note">{new Date().getFullYear()}</div>
                </div>
                <TinyBarChart items={yearSeries} type="month" />
              </div>
            </div>
          </div>

          <div className="dev-history-toolbar">
            <div className="dev-period-tabs">
              <button type="button" className={`dev-period-tab ${period === "30D" ? "active" : ""}`} onClick={() => setPeriod("30D")}>
                {t("Last 30 days", "آخر 30 يوم")}
              </button>
              <button type="button" className={`dev-period-tab ${period === "YEAR" ? "active" : ""}`} onClick={() => setPeriod("YEAR")}>
                {t("Last 12 months", "آخر 12 شهر")}
              </button>
              <button type="button" className={`dev-period-tab ${period === "ALL" ? "active" : ""}`} onClick={() => setPeriod("ALL")}>
                {t("All history", "كل التاريخ")}
              </button>
            </div>

            <div className="dev-history-count">
              {historyLoading ? (
                <span className="dev-mini-loader">{t("Updating history", "تحديث السجل")}</span>
              ) : (
                <>{visibleHistory.length} {t("records", "سجل")}</>
              )}
            </div>
          </div>

          {visibleHistory.length === 0 ? (
            <div className="dev-empty">
              {historyLoading
                ? t("Loading fresh device history...", "جارٍ تحميل تاريخ الجهاز...")
                : t("No inspections linked to this device in the selected period.", "لا توجد فحوصات مرتبطة بهذا الجهاز في الفترة المختارة.")}
            </div>
          ) : (
            <div className="dev-log-list">
              {visibleHistory.map((inspection) => {
                const isOk = inspection.inspectionStatus === "OK";
                const snapshot = inspection.locationSnapshot || {};

                return (
                  <div
                    className={`dev-log ${isOk ? "" : "dev-log--bad"}`}
                    key={inspection.id || `${inspection.deviceId}-${inspection.inspectedAt}`}
                  >
                    <div className="dev-log-top">
                      <ResultBadge result={isOk ? "OK" : "NOT_OK"} lang={lang} />
                      <span className="dev-log-date">{fmtDateTime(inspection.inspectedAt, lang)}</span>
                    </div>

                    <div className="dev-log-meta dev-log-meta--clean">
                      <div className="dev-log-meta-item">
                        <div className="dev-log-meta-label">{t("Device status", "حالة الجهاز")}</div>
                        <div className="dev-log-meta-value">
                          <StatusBadge value={inspection.inspectionStatus || device.currentStatus} lang={lang} />
                        </div>
                      </div>
                      <div className="dev-log-meta-item">
                        <div className="dev-log-meta-label">{t("Month", "الشهر")}</div>
                        <div className="dev-log-meta-value">{monthKeyFromDate(inspection.inspectedAt)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export function ViewerDevicesPage({
  devices: devicesProp = null,
  inspections: inspectionsProp = null,
  lang = "en",
  apiBaseUrl = "",
}) {
  const DEFAULT_FILTERS = {
    search: "",
    result: "ALL",
    status: "ALL",
    cluster: "ALL",
    building: "ALL",
    zone: "ALL",
    direction: "ALL",
    inspection: "ALL",
  };

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [devices, setDevices] = useState(
    Array.isArray(devicesProp) ? devicesProp.map(normalizeDevice) : []
  );

  const [inspections, setInspections] = useState(
    Array.isArray(inspectionsProp) ? inspectionsProp.map(normalizeInspection) : []
  );

  const [loading, setLoading] = useState(!Array.isArray(devicesProp));
  const [error, setError] = useState("");
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [exporting, setExporting] = useState("");

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");

      const token = pickToken();

      const [devicesResult, inspectionsResult] = await Promise.allSettled([
        Array.isArray(devicesProp)
          ? Promise.resolve({ items: devicesProp.map(normalizeDevice), sourceUrl: "" })
          : fetchDevicesFromApi(baseUrl, token),
        Array.isArray(inspectionsProp)
          ? Promise.resolve({ items: inspectionsProp.map(normalizeInspection), sourceUrl: "" })
          : fetchInspectionsFromApi(baseUrl, token),
      ]);

      const loadedDevices =
        devicesResult.status === "fulfilled"
          ? devicesResult.value.items
          : [];

      const loadedInspections =
        inspectionsResult.status === "fulfilled"
          ? inspectionsResult.value.items
          : [];

      if (devicesResult.status === "rejected") {
        console.error("Failed to load devices:", devicesResult.reason);
      }

      if (inspectionsResult.status === "rejected") {
        console.warn("Failed to load inspections:", inspectionsResult.reason);
      }

      const finalDevices = attachInspectionData(loadedDevices, loadedInspections);

      setDevices(finalDevices);
      setInspections(loadedInspections);

      if (!finalDevices.length && devicesResult.status === "rejected") {
        setError(
          devicesResult.reason?.message ||
            t("Failed to load devices from backend.", "فشل تحميل الأجهزة من الباك إند.")
        );
      }
    } catch (err) {
      console.error("Failed to load devices:", err);
      setError(err?.message || t("Failed to load devices from backend.", "فشل تحميل الأجهزة من الباك إند."));
      setDevices([]);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }

  async function openDeviceDetails(device) {
    setSelectedDevice(device);

    try {
      setHistoryLoading(true);
      const token = pickToken();
      const freshHistory = await fetchDeviceHistoryFromApi(baseUrl, token, device);

      if (freshHistory.length) {
        const mergedHistory = mergeUniqueInspections(freshHistory, device.relatedInspections || []);
        const updatedDevice = {
          ...device,
          relatedInspections: mergedHistory,
          inspectionsCount: Math.max(Number(device.inspectionsCount) || 0, mergedHistory.length),
          lastInspectionAt: getInspectionDate(mergedHistory[0]) || device.lastInspectionAt,
        };

        setSelectedDevice(updatedDevice);
        setDevices((prev) =>
          prev.map((item) =>
            normalizeId(item.id) === normalizeId(device.id) ||
            normalizeId(item.deviceCode) === normalizeId(device.deviceCode)
              ? updatedDevice
              : item
          )
        );
      }
    } catch (err) {
      console.warn("Fresh device history endpoint was not available. Using loaded inspections.", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const options = useMemo(() => {
    const clusters = [];
    const buildings = [];
    const zones = [];
    const directions = [];

    devices.forEach((d) => {
      clusters.push(d.parsedLoc?.cluster);
      buildings.push(d.parsedLoc?.building);
      zones.push(d.parsedLoc?.zone);
      directions.push(d.parsedLoc?.direction);
    });

    return {
      clusters: cleanOptions(clusters),
      buildings: cleanOptions(buildings),
      zones: cleanOptions(zones),
      directions: cleanOptions(directions),
    };
  }, [devices]);

  const filtered = useMemo(() => {
    const query = normalizeText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return devices.filter((d) => {
      const deviceResult = getDeviceResult(d);

      if (filters.result !== "ALL" && deviceResult !== filters.result) {
        return false;
      }

      if (filters.status === "NON_OK" && d.currentStatus === "OK") {
        return false;
      }

      if (
        filters.status !== "ALL" &&
        filters.status !== "NON_OK" &&
        d.currentStatus !== filters.status
      ) {
        return false;
      }

      if (filters.inspection === "INSPECTED" && !(Number(d.inspectionsCount) > 0)) {
        return false;
      }

      if (filters.inspection === "NOT_INSPECTED" && Number(d.inspectionsCount) > 0) {
        return false;
      }

      if (filters.cluster !== "ALL" && d.parsedLoc?.cluster !== filters.cluster) {
        return false;
      }

      if (filters.building !== "ALL" && d.parsedLoc?.building !== filters.building) {
        return false;
      }

      if (filters.zone !== "ALL" && d.parsedLoc?.zone !== filters.zone) {
        return false;
      }

      if (filters.direction !== "ALL" && d.parsedLoc?.direction !== filters.direction) {
        return false;
      }

      if (!queryWords.length) {
        return true;
      }

      const haystack = buildDeviceSearchText(d);

      return queryWords.every((word) => haystack.includes(word));
    });
  }, [devices, filters]);

  const counts = useMemo(() => {
    const all = devices.length;
    const ok = devices.filter((d) => getDeviceResult(d) === "OK").length;
    const notOk = devices.filter((d) => getDeviceResult(d) === "NOT_OK").length;

    const filteredOk = filtered.filter((d) => getDeviceResult(d) === "OK").length;
    const filteredNotOk = filtered.filter((d) => getDeviceResult(d) === "NOT_OK").length;

    return {
      all,
      ok,
      notOk,
      filtered: filtered.length,
      filteredOk,
      filteredNotOk,
    };
  }, [devices, filtered]);

  const totalInspectionsFromDevices = devices.reduce(
    (sum, d) => sum + (Number(d.inspectionsCount) || 0),
    0
  );

  const totalInspections =
    inspections.length > 0 ? inspections.length : totalInspectionsFromDevices;

  const latestInspection =
    inspections
      .map((inspection) => getInspectionDate(inspection))
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] ||
    devices
      .map((d) => d.lastInspectionAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => {
      const next = {
        ...prev,
        [key]: value,
      };

      if (key === "result") {
        if (value === "OK") {
          next.status = "OK";
        } else if (value === "NOT_OK") {
          next.status = "NON_OK";
        } else {
          next.status = "ALL";
        }
      }

      if (key === "status") {
        if (value === "OK") {
          next.result = "OK";
        } else if (value === "ALL") {
          next.result = "ALL";
        } else {
          next.result = "NOT_OK";
        }
      }

      return next;
    });
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const setQuickFilter = (type) => {
    const next = { ...DEFAULT_FILTERS };

    if (type === "OK") {
      next.result = "OK";
      next.status = "OK";
    }

    if (type === "NOT_OK") {
      next.result = "NOT_OK";
      next.status = "NON_OK";
    }

    if (type === "INSPECTIONS") {
      next.inspection = "INSPECTED";
    }

    setDraftFilters(next);
    setFilters(next);
  };

  const isCardActive = (type) => {
    if (type === "ALL") {
      return (
        filters.result === "ALL" &&
        filters.status === "ALL" &&
        filters.inspection === "ALL"
      );
    }

    if (type === "OK") return filters.result === "OK";
    if (type === "NOT_OK") return filters.result === "NOT_OK";
    if (type === "INSPECTIONS") return filters.inspection === "INSPECTED";

    return false;
  };


  const handleExportExcel = async () => {
    if (exporting || loading || !devices.length) return;

    try {
      setExporting("excel");
      await new Promise((resolve) => setTimeout(resolve, 30));
      exportExcelReport(devices, inspections, lang);
    } finally {
      setExporting("");
    }
  };

  const handleExportPdf = async () => {
    if (exporting || loading || !devices.length) return;

    try {
      setExporting("pdf");
      await exportPdfReport(devices, inspections, lang);
    } finally {
      setExporting("");
    }
  };

  return (
    <>
      <style>{DEVICES_CSS}</style>

      <div className="dev-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="dev-topbar">
          <div>
            

            
          </div>

          <div className="dev-actions">
            <button
              className="dev-export-btn dev-export-btn--excel"
              onClick={handleExportExcel}
              disabled={loading || exporting || !devices.length}
              type="button"
            >
              📊 {exporting === "excel" ? t("Preparing...", "جارٍ التجهيز...") : t("Export Excel", "تصدير Excel")}
            </button>

            <button
              className="dev-export-btn dev-export-btn--pdf"
              onClick={handleExportPdf}
              disabled={loading || exporting || !devices.length}
              type="button"
            >
              📄 {exporting === "pdf" ? t("Preparing...", "جارٍ التجهيز...") : t("Export PDF", "تصدير PDF")}
            </button>

            <button
              className="dev-refresh-btn"
              onClick={loadDevices}
              disabled={loading}
              type="button"
            >
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="dev-alert dev-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}


        <div className="dev-summary">
          <button
            type="button"
            className={`dev-summary-card ${isCardActive("ALL") ? "active" : ""}`}
            style={{ "--card-color": "linear-gradient(90deg, #4f46e5, #818cf8)" }}
            onClick={() => setQuickFilter("ALL")}
          >
            <div className="dev-summary-label">
              {t("Total Devices", "إجمالي الأجهزة")}
            </div>
            <div className="dev-summary-value">{devices.length}</div>
            <div className="dev-summary-note">
              {t("All loaded records", "كل السجلات المحملة")}
            </div>
          </button>

          <button
            type="button"
            className={`dev-summary-card ${isCardActive("OK") ? "active" : ""}`}
            style={{ "--card-color": "#10b981" }}
            onClick={() => setQuickFilter("OK")}
          >
            <div className="dev-summary-label">OK</div>
            <div className="dev-summary-value">{counts.ok}</div>
            <div className="dev-summary-note">
              {t("Operational devices", "الأجهزة السليمة")}
            </div>
          </button>

          <button
            type="button"
            className={`dev-summary-card ${isCardActive("NOT_OK") ? "active" : ""}`}
            style={{ "--card-color": "#f59e0b" }}
            onClick={() => setQuickFilter("NOT_OK")}
          >
            <div className="dev-summary-label">Not OK</div>
            <div className="dev-summary-value">{counts.notOk}</div>
            <div className="dev-summary-note">
              {t("Needs attention or maintenance", "تحتاج متابعة أو صيانة")}
            </div>
          </button>

          <button
            type="button"
            className={`dev-summary-card ${isCardActive("INSPECTIONS") ? "active" : ""}`}
            style={{ "--card-color": "#0ea5e9" }}
            onClick={() => setQuickFilter("INSPECTIONS")}
          >
            <div className="dev-summary-label">
              {t("Inspections", "الفحوصات")}
            </div>
            <div className="dev-summary-value">{totalInspections}</div>
            <div className="dev-summary-note">
              {latestInspection
                ? `${t("Latest:", "آخر فحص:")} ${fmt(latestInspection, lang)}`
                : t("No inspection date", "لا يوجد تاريخ فحص")}
            </div>
          </button>
        </div>

        <div className="dev-filter-card">
          <div className="dev-filter-head">
            <div className="dev-filter-title">
              <div className="dev-filter-icon">⌕</div>

              <div>
                <div className="dev-filter-title-text">
                  {t("Advanced Device Filter", "فلتر الأجهزة المتقدم")}
                </div>
                <div className="dev-filter-title-sub">
                  {t(
                    "Search devices by result, status, inspection, location, or text",
                    "فلتر الأجهزة حسب النتيجة أو الحالة أو الفحص أو الموقع أو البحث"
                  )}
                </div>
              </div>
            </div>

            <div className="dev-filter-result">
              <span className="dev-filter-result-dot" />
              {filtered.length} / {devices.length} {t("records", "سجل")}
            </div>
          </div>

          <div className="dev-filter-grid">
            <div className="dev-filter-field">
              <label>{t("Search", "بحث")}</label>
              <input
                className="dev-filter-input"
                value={draftFilters.search}
                onChange={(e) => updateDraft("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder={t(
                  "Code, name, serial, barcode, building...",
                  "كود، اسم، سيريال، باركود، مبنى..."
                )}
              />
            </div>

            <div className="dev-filter-field">
              <label>{t("Result", "النتيجة")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.result}
                onChange={(e) => updateDraft("result", e.target.value)}
              >
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Status", "الحالة")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.status}
                onChange={(e) => updateDraft("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Inspection", "الفحص")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.inspection}
                onChange={(e) => updateDraft("inspection", e.target.value)}
              >
                {INSPECTION_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option[lang] || option.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.cluster}
                onChange={(e) => updateDraft("cluster", e.target.value)}
              >
                <option value="ALL">{t("All clusters", "كل المجموعات")}</option>
                {options.clusters.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Building", "المبنى")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.building}
                onChange={(e) => updateDraft("building", e.target.value)}
              >
                <option value="ALL">{t("All buildings", "كل المباني")}</option>
                {options.buildings.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.zone}
                onChange={(e) => updateDraft("zone", e.target.value)}
              >
                <option value="ALL">{t("All zones", "كل المناطق")}</option>
                {options.zones.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="dev-filter-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select
                className="dev-filter-select"
                value={draftFilters.direction}
                onChange={(e) => updateDraft("direction", e.target.value)}
              >
                <option value="ALL">{t("All directions", "كل الاتجاهات")}</option>
                {options.directions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="dev-filter-footer">
            <div className="dev-filter-hint">
              {t(
                `Filtered OK: ${counts.filteredOk} · Not OK: ${counts.filteredNotOk}`,
                `المفلتر سليم: ${counts.filteredOk} · غير سليم: ${counts.filteredNotOk}`
              )}
            </div>

            <div className="dev-filter-actions">
              <button
                type="button"
                className="dev-filter-btn dev-filter-btn-reset"
                onClick={resetFilters}
              >
                {t("Reset", "إعادة ضبط")}
              </button>

              <button
                type="button"
                className="dev-filter-btn dev-filter-btn-ok"
                onClick={applyFilters}
              >
                {t("Apply", "تطبيق")}
              </button>
            </div>
          </div>
        </div>

        <div className="dev-panel">
          <div className="dev-panel__head">
            <div>
              <div className="dev-panel__title">
                {t("Devices", "الأجهزة")}
              </div>

              <div className="dev-panel__sub">
                {t(
                  "All registered devices in current scope",
                  "جميع الأجهزة المسجلة في النطاق الحالي"
                )}
              </div>
            </div>

            <div className="dev-records">
              {filtered.length} {t("records", "سجل")}
            </div>
          </div>

          {loading ? (
            <div className="dev-loading">
              <div className="dev-loading-spinner" />
              {t("Loading devices from backend...", "جارٍ تحميل الأجهزة من الباك إند...")}
            </div>
          ) : filtered.length ? (
            <div className="dev-table-wrap">
              <table className="dev-table">
                <thead>
                  <tr>
                    <th>{t("Device", "الجهاز")}</th>
                    <th>{t("Result", "النتيجة")}</th>
                    <th>{t("Status", "الحالة")}</th>
                    <th>{t("Cluster", "المجموعة")}</th>
                    <th>{t("Building", "المبنى")}</th>
                    <th>{t("Zone", "المنطقة")}</th>
                    <th>{t("Direction", "الاتجاه")}</th>
                    <th>{t("Last Inspection", "آخر فحص")}</th>
                    <th>{t("Serial", "السيريال")}</th>
                    <th style={{ textAlign: "center" }}>
                      {t("Inspections", "الفحوصات")}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((d) => {
                    const result = getDeviceResult(d);

                    return (
                      <tr key={d.id || d.deviceCode} onClick={() => openDeviceDetails(d)}>
                        <td data-label={t("Device", "الجهاز")}>
                          <div className="dev-code">
                            {d.deviceCode || `DEV-${d.id}`}
                          </div>

                          <div className="dev-name">
                            {d.deviceName || t("Unknown", "غير معروف")}
                          </div>

                          {(d.manufacturer || d.modelNumber) && (
                            <div className="dev-subline">
                              {[d.manufacturer, d.modelNumber].filter(Boolean).join(" · ")}
                            </div>
                          )}
                        </td>

                        <td data-label={t("Result", "النتيجة")}>
                          <ResultBadge result={result} lang={lang} />
                        </td>

                        <td data-label={t("Status", "الحالة")}>
                          <StatusBadge value={d.currentStatus} lang={lang} />
                        </td>

                        <td data-label={t("Cluster", "المجموعة")} style={{ fontSize: 12 }}>
                          {d.parsedLoc?.cluster || "—"}
                        </td>

                        <td data-label={t("Building", "المبنى")} style={{ fontSize: 12 }}>
                          {d.parsedLoc?.building || "—"}
                        </td>

                        <td data-label={t("Zone", "المنطقة")} style={{ fontSize: 12 }}>
                          {d.parsedLoc?.zone || "—"}
                        </td>

                        <td data-label={t("Direction", "الاتجاه")} style={{ fontSize: 12 }}>
                          {d.parsedLoc?.direction || "—"}
                        </td>

                        <td data-label={t("Last Inspection", "آخر فحص")} style={{ fontSize: 12, color: "var(--faint)" }}>
                          {fmt(d.lastInspectionAt, lang)}
                        </td>

                        <td data-label={t("Serial", "السيريال")} style={{ fontSize: 12 }}>
                          {d.serialNumber || "—"}
                        </td>

                        <td data-label={t("Inspections", "الفحوصات")} style={{ textAlign: "center" }}>
                          <span className="dev-insp-count">
                            {d.inspectionsCount ?? 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="dev-empty">
              {t(
                "No devices match the selected filters or no data came from backend.",
                "لا توجد أجهزة مطابقة للفلاتر أو لم تصل بيانات من الباك إند."
              )}
            </div>
          )}
        </div>

        <DeviceDetailsModal
          device={selectedDevice}
          lang={lang}
          historyLoading={historyLoading}
          onClose={() => setSelectedDevice(null)}
        />
      </div>
    </>
  );
}

export default ViewerDevicesPage;