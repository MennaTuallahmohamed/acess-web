import React, { useEffect, useMemo, useState } from "react";

/* ═══════════════════════════════════════════
   GATES PAGE CSS
═══════════════════════════════════════════ */
const GATES_CSS = `
.gate-root *, .gate-root *::before, .gate-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.gate-root {
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
  --shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
  font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background:
    radial-gradient(circle at 10% 0%, rgba(79,70,229,0.07), transparent 32%),
    radial-gradient(circle at 92% 5%, rgba(14,165,233,0.08), transparent 30%),
    #f1f5f9;
  color: var(--text);
  padding: 28px 24px;
  min-height: 100vh;
}

.gate-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.gate-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.gate-btn {
  height: 40px;
  padding: 0 16px;
  border: none;
  border-radius: 13px;
  background: #0f172a;
  color: #fff;
  font-size: 13px;
  font-weight: 900;
  cursor: pointer;
  transition: 0.18s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
}

.gate-btn:hover {
  transform: translateY(-1px);
  background: var(--primary);
  box-shadow: 0 10px 20px rgba(79,70,229,0.18);
}

.gate-btn:disabled {
  opacity: .62;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.gate-btn--soft {
  background: #ffffff;
  color: #0f172a;
  border: 1px solid #dbe4ef;
}

.gate-btn--soft:hover {
  background: #eef2ff;
  color: #3730a3;
}

.gate-btn--excel {
  background: #047857;
}

.gate-btn--excel:hover {
  background: #059669;
}

.gate-btn--pdf {
  background: #be123c;
}

.gate-btn--pdf:hover {
  background: #e11d48;
}

.gate-alert {
  margin-bottom: 14px;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.gate-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.gate-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.gate-summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
  position: relative;
  overflow: hidden;
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
  min-height: 108px;
}

.gate-root[dir="rtl"] .gate-summary-card {
  text-align: right;
}

.gate-summary-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: rgba(79, 70, 229, 0.28);
}

.gate-summary-card.active {
  background: linear-gradient(135deg, rgba(79,70,229,0.09), #fff);
  border-color: rgba(79,70,229,0.35);
}

.gate-summary-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--card-color, linear-gradient(90deg, #4f46e5, #818cf8));
}

.gate-summary-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-weight: 900;
}

.gate-summary-value {
  font-size: 31px;
  font-weight: 950;
  color: var(--text);
  letter-spacing: -0.04em;
}

.gate-summary-note {
  margin-top: 7px;
  font-size: 11px;
  color: var(--faint);
}

.gate-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(79,70,229,0.13), transparent 34%),
    radial-gradient(circle at bottom right, rgba(14,165,233,0.10), transparent 32%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.07), inset 0 1px 0 rgba(255,255,255,0.9);
}

.gate-filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.gate-filter-title {
  display: flex;
  align-items: center;
  gap: 11px;
}

.gate-filter-icon {
  width: 38px;
  height: 38px;
  border-radius: 15px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--primary);
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 900;
  box-shadow: inset 0 0 0 1px rgba(79, 70, 229, 0.12);
}

.gate-filter-title-text {
  font-size: 15px;
  font-weight: 950;
  color: var(--text);
}

.gate-filter-title-sub {
  font-size: 11px;
  color: var(--faint);
  margin-top: 2px;
}

.gate-filter-result {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(79, 70, 229, 0.08);
  color: var(--primary);
  border: 1px solid rgba(79, 70, 229, 0.16);
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.gate-filter-result-dot {
  width: 7px;
  height: 7px;
  background: var(--primary);
  border-radius: 50%;
}

.gate-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(7, minmax(130px, 1fr));
  gap: 12px;
  align-items: end;
}

.gate-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.gate-filter-field label {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .09em;
  color: var(--muted);
  white-space: nowrap;
}

.gate-filter-input,
.gate-filter-select {
  width: 100%;
  height: 46px;
  border-radius: 15px;
  border: 1px solid #dbe4ef;
  background-color: var(--surface2);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  outline: none;
  transition: 0.18s ease;
}

.gate-filter-input {
  font-weight: 600;
}

.gate-filter-input::placeholder {
  color: var(--faint);
  font-weight: 500;
}

.gate-filter-input:hover,
.gate-filter-select:hover {
  background-color: #ffffff;
  border-color: rgba(79, 70, 229, 0.3);
}

.gate-filter-input:focus,
.gate-filter-select:focus {
  border-color: var(--primary);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.13);
}

.gate-filter-select {
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

.gate-root[dir="rtl"] .gate-filter-select {
  padding-right: 14px;
  padding-left: 36px;
  background-position: 21px 50%, 14px 50%;
}

.gate-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.gate-filter-hint {
  font-size: 12px;
  color: var(--faint);
}

.gate-filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gate-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15,23,42,0.04);
}

.gate-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.gate-panel__title {
  font-size: 14px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 3px;
}

.gate-panel__sub {
  font-size: 12px;
  color: var(--faint);
}

.gate-records {
  font-size: 12px;
  font-weight: 900;
  color: var(--muted);
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
}

.gate-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.gate-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1120px;
}

.gate-table th {
  padding: 11px 16px;
  text-align: left;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--muted);
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.gate-root[dir="rtl"] .gate-table th {
  text-align: right;
}

.gate-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  vertical-align: middle;
}

.gate-table tr:last-child td {
  border-bottom: none;
}

.gate-table tbody tr {
  cursor: pointer;
  transition: 0.16s ease;
}

.gate-table tbody tr:hover td {
  background: #fafbfc;
}

.gate-code {
  font-size: 13px;
  font-weight: 950;
  color: var(--primary);
  letter-spacing: .2px;
}

.gate-name {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.gate-subline {
  font-size: 11px;
  color: var(--faint);
  margin-top: 2px;
}

.gate-insp-count {
  font-size: 15px;
  font-weight: 950;
  color: var(--text);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  padding: 5px 10px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: .2px;
}

.badge--ok {
  background: #d1fae5;
  color: #047857;
}

.badge--att {
  background: #fef3c7;
  color: #92400e;
}

.badge--maint {
  background: #fee2e2;
  color: #b91c1c;
}

.badge--under {
  background: rgba(79, 70, 229, 0.10);
  color: var(--primary);
}

.badge--oos {
  background: #e2e8f0;
  color: #475569;
}

.gate-empty,
.gate-loading {
  padding: 42px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.gate-loading-spinner {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 3px solid #dbeafe;
  border-top-color: var(--primary);
  margin: 0 auto 12px;
  animation: gateSpin .8s linear infinite;
}

@keyframes gateSpin {
  to { transform: rotate(360deg); }
}

.gate-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.52);
  backdrop-filter: blur(5px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.gate-modal {
  width: min(1120px, 100%);
  max-height: 92vh;
  overflow: hidden;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 30px 90px rgba(15,23,42,0.28);
  display: flex;
  flex-direction: column;
}

.gate-modal-head {
  padding: 20px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  background:
    radial-gradient(circle at 0% 0%, rgba(79,70,229,0.10), transparent 28%),
    radial-gradient(circle at 100% 0%, rgba(14,165,233,0.10), transparent 28%),
    #ffffff;
}

.gate-modal-title {
  font-size: 22px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 5px;
}

.gate-modal-sub {
  font-size: 12px;
  color: var(--faint);
}

.gate-modal-close {
  border: none;
  background: #f1f5f9;
  color: var(--text);
  width: 38px;
  height: 38px;
  border-radius: 13px;
  cursor: pointer;
  font-size: 22px;
}

.gate-modal-body {
  padding: 18px;
  overflow: auto;
}

.gate-detail-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.gate-detail {
  border: 1px solid var(--border);
  background: var(--surface2);
  border-radius: 16px;
  padding: 13px;
  min-height: 78px;
}

.gate-detail-label {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  color: var(--faint);
  margin-bottom: 7px;
}

.gate-detail-value {
  font-size: 13px;
  font-weight: 900;
  color: var(--text);
  overflow-wrap: anywhere;
}

.gate-history-panel {
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
}

.gate-history-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.gate-history-title {
  font-size: 15px;
  font-weight: 950;
  color: var(--text);
}

.gate-history-sub {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.gate-history-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.gate-tab {
  height: 34px;
  border-radius: 999px;
  border: 1px solid #dbe4ef;
  padding: 0 12px;
  background: #fff;
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
}

.gate-tab.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.gate-history-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: #fbfdff;
}

.gate-mini-stat {
  border: 1px solid var(--border);
  border-radius: 15px;
  background: #fff;
  padding: 11px;
}

.gate-mini-label {
  color: var(--faint);
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.gate-mini-value {
  color: var(--text);
  font-size: 18px;
  font-weight: 950;
}

.gate-bars {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  display: grid;
  gap: 9px;
}

.gate-bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 40px;
  gap: 10px;
  align-items: center;
}

.gate-bar-label {
  color: var(--muted);
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gate-track {
  height: 9px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.gate-fill {
  height: 100%;
  width: 0%;
  background: var(--fill, var(--primary));
  border-radius: 999px;
}

.gate-bar-count {
  text-align: end;
  font-size: 11px;
  color: var(--text);
  font-weight: 950;
}

.gate-timeline {
  padding: 16px;
  display: grid;
  gap: 12px;
  max-height: 430px;
  overflow: auto;
}

.gate-log {
  position: relative;
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px 14px 14px 18px;
  background: #fff;
  display: grid;
  gap: 12px;
}

.gate-root[dir="rtl"] .gate-log {
  padding: 14px 18px 14px 14px;
}

.gate-log::before {
  content: "";
  position: absolute;
  top: 16px;
  bottom: 16px;
  width: 4px;
  left: 0;
  border-radius: 999px;
  background: var(--log-color, var(--primary));
}

.gate-root[dir="rtl"] .gate-log::before {
  left: auto;
  right: 0;
}

.gate-log-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.gate-log-date {
  color: var(--text);
  font-size: 13px;
  font-weight: 950;
}

.gate-log-month {
  color: var(--faint);
  font-size: 11px;
  font-weight: 900;
  margin-top: 3px;
}

.gate-log-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.gate-log-cell {
  border: 1px solid var(--border);
  background: var(--surface2);
  border-radius: 14px;
  padding: 10px;
}

.gate-log-cell-label {
  color: var(--faint);
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.gate-log-cell-value {
  color: var(--text);
  font-size: 12px;
  font-weight: 900;
}

@media (max-width: 1600px) {
  .gate-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(150px, 1fr));
  }
}

@media (max-width: 1120px) {
  .gate-summary,
  .gate-detail-grid,
  .gate-history-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .gate-root {
    padding: 16px 14px;
  }

  .gate-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gate-actions,
  .gate-filter-actions {
    width: 100%;
  }

  .gate-actions .gate-btn,
  .gate-filter-actions .gate-btn {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .gate-root {
    padding: 14px 10px;
  }

  .gate-summary,
  .gate-filter-grid,
  .gate-detail-grid,
  .gate-history-summary,
  .gate-log-cards {
    grid-template-columns: 1fr;
  }

  .gate-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .gate-filter-head {
    align-items: stretch;
  }

  .gate-filter-result {
    width: 100%;
    justify-content: center;
  }

  .gate-filter-footer,
  .gate-filter-actions,
  .gate-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .gate-btn {
    width: 100%;
  }

  .gate-panel__head {
    padding: 16px;
  }

  .gate-records {
    width: 100%;
    text-align: center;
  }

  .gate-table {
    min-width: 0;
  }

  .gate-table thead {
    display: none;
  }

  .gate-table,
  .gate-table tbody,
  .gate-table tr,
  .gate-table td {
    display: block;
    width: 100%;
  }

  .gate-table tr {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
  }

  .gate-table td {
    border-bottom: none;
    padding: 8px 0;
    display: grid;
    grid-template-columns: 118px 1fr;
    gap: 10px;
    align-items: center;
  }

  .gate-table td::before {
    content: attr(data-label);
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
    color: var(--faint);
  }

  .gate-modal-backdrop {
    padding: 0;
    align-items: end;
  }

  .gate-modal {
    border-radius: 22px 22px 0 0;
    max-height: 92vh;
  }

  .gate-bar-row {
    grid-template-columns: 75px 1fr 35px;
  }
}
`;

/* ═══════════════════════════════════════════
   MAPS
═══════════════════════════════════════════ */
const BADGE_MAP = {
  OK: { label: "Operational", cls: "badge--ok" },
  ACTIVE: { label: "Active", cls: "badge--ok" },
  ATTENTION: { label: "Attention", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "Needs Maint.", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "Under Maint.", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "Out of Service", cls: "badge--oos" },
  INACTIVE: { label: "Inactive", cls: "badge--oos" },
  NOT_OK: { label: "Not OK", cls: "badge--maint" },
  PARTIAL: { label: "Partial", cls: "badge--att" },
  NOT_REACHABLE: { label: "Not reachable", cls: "badge--maint" },
};

const BADGE_MAP_AR = {
  OK: { label: "تعمل", cls: "badge--ok" },
  ACTIVE: { label: "نشطة", cls: "badge--ok" },
  ATTENTION: { label: "تحتاج متابعة", cls: "badge--att" },
  NEEDS_MAINTENANCE: { label: "تحتاج صيانة", cls: "badge--maint" },
  UNDER_MAINTENANCE: { label: "تحت الصيانة", cls: "badge--under" },
  OUT_OF_SERVICE: { label: "خارج الخدمة", cls: "badge--oos" },
  INACTIVE: { label: "غير نشطة", cls: "badge--oos" },
  NOT_OK: { label: "غير سليم", cls: "badge--maint" },
  PARTIAL: { label: "جزئي", cls: "badge--att" },
  NOT_REACHABLE: { label: "غير متاح", cls: "badge--maint" },
};

const STATUS_OPTIONS = [
  { key: "ALL", en: "All statuses", ar: "كل الحالات" },
  { key: "OK", en: "Operational", ar: "تعمل" },
  { key: "NON_OK", en: "Need attention", ar: "تحتاج متابعة" },
  { key: "ATTENTION", en: "Attention", ar: "متابعة" },
  { key: "NEEDS_MAINTENANCE", en: "Needs maintenance", ar: "تحتاج صيانة" },
  { key: "UNDER_MAINTENANCE", en: "Under maintenance", ar: "تحت الصيانة" },
  { key: "OUT_OF_SERVICE", en: "Out of service", ar: "خارج الخدمة" },
  { key: "INACTIVE", en: "Inactive", ar: "غير نشطة" },
];

const RESULT_OPTIONS = [
  { key: "ALL", en: "All results", ar: "كل النتائج" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "NOT_OK", en: "Not OK", ar: "غير سليم" },
];

const INSPECTION_OPTIONS = [
  { key: "ALL", en: "All gates", ar: "كل البوابات" },
  { key: "INSPECTED", en: "Inspected", ar: "تم فحصها" },
  { key: "NOT_INSPECTED", en: "Not inspected", ar: "لم يتم فحصها" },
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

function fmtMonth(iso, lang = "en") {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

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

function normalizeStatusValue(rawStatus) {
  return String(rawStatus ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function isOkInspectionStatus(rawStatus) {
  const s = normalizeStatusValue(rawStatus);

  return [
    "OK",
    "GOOD",
    "ACTIVE",
    "COMPLETED",
    "DONE",
    "OPERATIONAL",
    "SUCCESS",
    "PASSED",
    "PASS",
  ].includes(s);
}

function mapStatus(rawStatus, inspectionsCount = 0) {
  const s = normalizeStatusValue(rawStatus);

  if (
    [
      "OK",
      "GOOD",
      "ACTIVE",
      "COMPLETED",
      "DONE",
      "OPERATIONAL",
      "SUCCESS",
      "PASSED",
      "PASS",
    ].includes(s)
  ) {
    return "OK";
  }

  if (
    [
      "NOT_OK",
      "NOTOK",
      "FAULTY",
      "FAULT",
      "FAILED",
      "FAIL",
      "ATTENTION",
      "PARTIAL",
      "NOT_REACHABLE",
      "ISSUE_FOUND",
      "NOK",
      "BAD",
    ].includes(s)
  ) {
    return "ATTENTION";
  }

  if (s === "NEEDS_MAINTENANCE") return "NEEDS_MAINTENANCE";

  if (["UNDER_MAINTENANCE", "IN_PROGRESS"].includes(s)) {
    return "UNDER_MAINTENANCE";
  }

  if (s === "OUT_OF_SERVICE") return "OUT_OF_SERVICE";
  if (s === "INACTIVE") return "INACTIVE";

  if (["OPEN", "PENDING"].includes(s)) {
    return "NEEDS_MAINTENANCE";
  }

  if (!s && inspectionsCount > 0) {
    return "ATTENTION";
  }

  return "OK";
}

function getGateResult(gate) {
  return gate.currentStatus === "OK" ? "OK" : "NOT_OK";
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

function resolveInspectionGateId(inspection = {}) {
  const directGateId =
    inspection?.gateId ??
    inspection?.gate?.id ??
    inspection?.gate_id ??
    inspection?.taskItem?.gateId ??
    inspection?.taskItem?.gate?.id ??
    inspection?.task?.gateId ??
    inspection?.task?.gate?.id ??
    inspection?.targetGateId ??
    null;

  if (directGateId !== null && directGateId !== undefined && String(directGateId).trim() !== "") {
    return directGateId;
  }

  const assetType = normalizeStatusValue(
    inspection?.assetType ??
      inspection?.asset?.type ??
      inspection?.inspectionType ??
      inspection?.targetType ??
      ""
  );

  if (assetType === "GATE") {
    return (
      inspection?.assetId ??
      inspection?.asset?.id ??
      inspection?.targetId ??
      null
    );
  }

  return null;
}

function getInspectionGateId(inspection) {
  return normalizeId(resolveInspectionGateId(inspection));
}

function getGateId(gate) {
  return normalizeId(gate?.id || gate?.gateId || gate?.gate_id || gate?.assetId || "");
}

function normalizeInspection(item = {}) {
  const rawInspectionStatus =
    item.inspectionStatus ??
    item.result ??
    item.condition ??
    item.finalResult ??
    item.finalStatus ??
    item.status ??
    "NOT_REACHABLE";

  const inspectionStatus = normalizeStatusValue(rawInspectionStatus);

  const afterStatusRaw =
    item.afterGateStatus ??
    item.afterStatus ??
    item.afterDeviceStatus ??
    item.finalGateStatus ??
    item.finalStatus ??
    item.result ??
    item.inspectionStatus ??
    "";

  const beforeStatusRaw =
    item.beforeGateStatus ??
    item.beforeStatus ??
    item.beforeDeviceStatus ??
    item.previousStatus ??
    "";

  const gateId = resolveInspectionGateId(item);

  return {
    ...item,
    id: item.id ?? item.inspectionId ?? null,
    gateId,
    inspectionStatus,
    inspectedAt: getInspectionDate(item),
    beforeStatus: mapStatus(beforeStatusRaw || inspectionStatus),
    afterStatus: mapStatus(afterStatusRaw || inspectionStatus),
  };
}

function normalizeGate(item = {}) {
  const location = item.location || item.parsedLoc || item.locationData || {};
  const inspectionsArray = Array.isArray(item.inspections) ? item.inspections : [];
  const tasksArray = Array.isArray(item.tasks) ? item.tasks : [];

  const inspectionsCount =
    item.inspectionsCount ??
    item._count?.inspections ??
    item.inspections_count ??
    inspectionsArray.length ??
    0;

  const tasksCount =
    item.tasksCount ??
    item._count?.tasks ??
    item.tasks_count ??
    tasksArray.length ??
    0;

  const rawStatus =
    item.currentStatus ||
    item.status ||
    item.gateStatus ||
    item.inspectionStatus ||
    item.lastInspectionStatus ||
    "";

  const gateNo = item.gateNo || item.gateNumber || item.no || item.code || `GATE-${item.id || ""}`;

  return {
    id: item.id,
    gateNo,
    gateCode: item.gateCode || item.code || `Gate ${gateNo}`,
    gateName: item.gateName || item.name || item.building || `Gate ${gateNo}`,
    secretCode: item.secretCode || item.secret || "",
    serialNumber: item.serialNumber || item.serial || item.deviceSerial || item.deviceSerialNumber || "",
    ipAddress: item.ipAddress || item.ip || item.ip_address || item.deviceIp || item.deviceIP || "",
    excelId: item.excelId || "",
    currentStatus: mapStatus(rawStatus, inspectionsCount),
    status: String(item.status || item.currentStatus || "ACTIVE").toUpperCase(),
    lastInspectionAt:
      item.lastInspectionAt ||
      item.latestInspectionAt ||
      item.lastInspection ||
      inspectionsArray[0]?.inspectedAt ||
      null,
    inspectionsCount,
    tasksCount,
    relatedInspections: inspectionsArray.map(normalizeInspection),
    parsedLoc: {
      cluster: location.cluster || item.cluster || "",
      building: location.building || item.building || "",
      zone: location.zone || item.zone || "",
      direction: location.direction || item.direction || "",
      lane: location.lane || item.lane || "",
      type: location.type || item.type || "",
    },
  };
}

function attachInspectionData(gates, inspections) {
  const inspectionsByGateId = new Map();

  inspections.forEach((inspection) => {
    const gateId = getInspectionGateId(inspection);
    if (!gateId) return;

    if (!inspectionsByGateId.has(gateId)) {
      inspectionsByGateId.set(gateId, []);
    }

    inspectionsByGateId.get(gateId).push(inspection);
  });

  inspectionsByGateId.forEach((list) => {
    list.sort(
      (a, b) =>
        new Date(getInspectionDate(b) || 0).getTime() -
        new Date(getInspectionDate(a) || 0).getTime()
    );
  });

  return gates.map((gate) => {
    const gateId = getGateId(gate);

    const apiRelated = gateId ? inspectionsByGateId.get(gateId) || [] : [];
    const embeddedRelated = Array.isArray(gate.relatedInspections)
      ? gate.relatedInspections
      : [];

    /*
      لو /inspections رجّع تاريخ للبوابة نستخدمه.
      لو لم يرجع شيئًا نحتفظ بتاريخ inspections المضمّن داخل gate.
    */
    const related = apiRelated.length > 0 ? apiRelated : embeddedRelated;

    const sortedRelated = [...related].sort(
      (a, b) =>
        new Date(getInspectionDate(b) || 0).getTime() -
        new Date(getInspectionDate(a) || 0).getTime()
    );

    const latest = sortedRelated[0] || null;

    /*
      مهم جدًا:
      normalizeInspection() سبق وحوّل afterStatus إلى:
      OK / ATTENTION / NEEDS_MAINTENANCE / ...
      لذلك لا نعمل mapStatus() على afterStatus مرة ثانية.
      هذا هو الجزء الذي كان يجعل NOT_OK يتحول إلى OK.
    */
    const latestStatus = latest
      ? latest.afterStatus || mapStatus(latest.inspectionStatus)
      : gate.currentStatus;

    return {
      ...gate,
      inspectionsCount: Math.max(
        Number(gate.inspectionsCount) || 0,
        sortedRelated.length
      ),
      lastInspectionAt: latest
        ? getInspectionDate(latest)
        : gate.lastInspectionAt,
      currentStatus: latestStatus,
      relatedInspections: sortedRelated,
    };
  });
}

function buildGateSearchText(gate) {
  return normalizeText(
    [
      gate.id,
      gate.gateNo,
      gate.gateCode,
      gate.gateName,
      gate.secretCode,
      gate.serialNumber,
      gate.ipAddress,
      gate.excelId,
      gate.status,
      gate.currentStatus,
      getGateResult(gate),
      gate.parsedLoc?.cluster,
      gate.parsedLoc?.building,
      gate.parsedLoc?.zone,
      gate.parsedLoc?.direction,
      gate.parsedLoc?.lane,
      gate.parsedLoc?.type,
      fmt(gate.lastInspectionAt),
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
      return { sourceUrl: url, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found.");
}

async function fetchGatesFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/gates`,
    `${baseUrl}/api/gates`,
    `${baseUrl}/viewer/gates`,
    `${baseUrl}/viewer-gates`,
    `${baseUrl}/dashboard/gates`,
    `${baseUrl}/dashboard/viewer/gates`,
  ];

  const result = await fetchJsonCandidates(candidates, token);
  const rawList = extractArray(result.data, ["gates"]);

  return { sourceUrl: result.sourceUrl, items: rawList.map(normalizeGate) };
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

  const items = rawList
    .map(normalizeInspection)
    .filter((item) => resolveInspectionGateId(item));

  console.log("[GatesPage] inspections source:", result.sourceUrl);
  console.log("[GatesPage] raw inspections:", rawList.length);
  console.log("[GatesPage] gate-linked inspections:", items.length);
  console.log(
    "[GatesPage] NOT OK-like inspections:",
    items.filter((item) => !isOkInspectionStatus(item.inspectionStatus)).length
  );

  return {
    sourceUrl: result.sourceUrl,
    items,
  };
}

function csvSafe(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function htmlSafe(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function getMonthKey(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getYearKey(iso) {
  if (!iso) return "Unknown";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return String(d.getFullYear());
}

function filterHistoryByRange(list, range) {
  const rows = Array.isArray(list) ? list : [];
  if (range === "all") return rows;

  const now = new Date();
  const from = new Date(now);

  if (range === "30d") from.setDate(now.getDate() - 30);
  if (range === "12m") from.setMonth(now.getMonth() - 12);

  return rows.filter((item) => {
    const d = new Date(getInspectionDate(item) || 0);
    if (Number.isNaN(d.getTime())) return false;
    return d >= from && d <= now;
  });
}

function buildPeriodAnalysis(list, mode = "month") {
  const map = new Map();

  list.forEach((item) => {
    const key = mode === "year" ? getYearKey(getInspectionDate(item)) : getMonthKey(getInspectionDate(item));
    if (!map.has(key)) map.set(key, { key, total: 0, ok: 0, notOk: 0 });

    const row = map.get(key);
    row.total += 1;
    if (isOkInspectionStatus(item.inspectionStatus)) row.ok += 1;
    else row.notOk += 1;
  });

  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
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

function GateDetailsModal({ gate, lang, onClose }) {
  const [range, setRange] = useState("30d");

  if (!gate) return null;

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const result = getGateResult(gate);
  const related = gate.relatedInspections || [];
  const loc = gate.parsedLoc || {};
  const rangedHistory = filterHistoryByRange(related, range);
  const monthlyAnalysis = buildPeriodAnalysis(related, "month").slice(0, 12);
  const maxMonth = Math.max(...monthlyAnalysis.map((x) => x.total), 1);

  const okCount = rangedHistory.filter((x) => isOkInspectionStatus(x.inspectionStatus)).length;
  const notOkCount = Math.max(rangedHistory.length - okCount, 0);
  const latest = rangedHistory[0] || related[0] || null;

  return (
    <div className="gate-modal-backdrop" onMouseDown={onClose}>
      <div className="gate-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="gate-modal-head">
          <div>
            <div className="gate-modal-title">
              {t("Gate", "بوابة")} {gate.gateNo || gate.id}
            </div>
            <div className="gate-modal-sub">
              {gate.gateName || loc.building || t("Real backend history", "سجل حقيقي من الباك إند")}
            </div>
          </div>

          <button className="gate-modal-close" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="gate-modal-body">
          <div className="gate-detail-grid">
            <div className="gate-detail">
              <div className="gate-detail-label">{t("Current result", "النتيجة الحالية")}</div>
              <div className="gate-detail-value"><ResultBadge result={result} lang={lang} /></div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Current status", "حالة البوابة")}</div>
              <div className="gate-detail-value"><StatusBadge value={gate.currentStatus} lang={lang} /></div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Gate no", "رقم البوابة")}</div>
              <div className="gate-detail-value">{gate.gateNo || "—"}</div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Secret code", "السيكريت كود")}</div>
              <div className="gate-detail-value">{gate.secretCode || "—"}</div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Cluster", "المجموعة")}</div>
              <div className="gate-detail-value">{loc.cluster || "—"}</div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Building", "المبنى")}</div>
              <div className="gate-detail-value">{loc.building || "—"}</div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Zone", "المنطقة")}</div>
              <div className="gate-detail-value">{loc.zone || "—"}</div>
            </div>

            <div className="gate-detail">
              <div className="gate-detail-label">{t("Direction", "الاتجاه")}</div>
              <div className="gate-detail-value">{loc.direction || "—"}</div>
            </div>
          </div>

          <div className="gate-history-panel">
            <div className="gate-history-head">
              <div>
                <div className="gate-history-title">{t("Gate timeline / history", "تاريخ البوابة")}</div>
                <div className="gate-history-sub">
                  {t("Clean status-only history without technician names or long notes", "سجل مختصر للحالة فقط بدون أسماء الفنيين أو كلام طويل")}
                </div>
              </div>

              <div className="gate-history-tabs">
                <button className={`gate-tab ${range === "30d" ? "active" : ""}`} onClick={() => setRange("30d")} type="button">
                  {t("Last 30 days", "آخر 30 يوم")}
                </button>
                <button className={`gate-tab ${range === "12m" ? "active" : ""}`} onClick={() => setRange("12m")} type="button">
                  {t("Last 12 months", "آخر 12 شهر")}
                </button>
                <button className={`gate-tab ${range === "all" ? "active" : ""}`} onClick={() => setRange("all")} type="button">
                  {t("All history", "كل التاريخ")}
                </button>
              </div>
            </div>

            <div className="gate-history-summary">
              <div className="gate-mini-stat">
                <div className="gate-mini-label">{t("History records", "عدد السجلات")}</div>
                <div className="gate-mini-value">{numberText(rangedHistory.length, lang)}</div>
              </div>
              <div className="gate-mini-stat">
                <div className="gate-mini-label">{t("OK", "سليم")}</div>
                <div className="gate-mini-value">{numberText(okCount, lang)}</div>
              </div>
              <div className="gate-mini-stat">
                <div className="gate-mini-label">{t("Not OK", "غير سليم")}</div>
                <div className="gate-mini-value">{numberText(notOkCount, lang)}</div>
              </div>
              <div className="gate-mini-stat">
                <div className="gate-mini-label">{t("Latest", "آخر فحص")}</div>
                <div className="gate-mini-value" style={{ fontSize: 13 }}>{fmtDateTime(getInspectionDate(latest), lang)}</div>
              </div>
            </div>

            {monthlyAnalysis.length > 0 && (
              <div className="gate-bars">
                {monthlyAnalysis.slice(0, 6).map((item) => (
                  <div className="gate-bar-row" key={item.key}>
                    <div className="gate-bar-label" title={item.key}>{item.key}</div>
                    <div className="gate-track">
                      <div
                        className="gate-fill"
                        style={{
                          "--fill": item.notOk > 0 ? "#f59e0b" : "#4f46e5",
                          width: `${Math.max(4, (item.total / maxMonth) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="gate-bar-count">{item.total}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="gate-timeline">
              {rangedHistory.length === 0 ? (
                <div className="gate-empty">
                  {t("No inspection history for this selected period.", "لا يوجد تاريخ فحوصات في الفترة المختارة.")}
                </div>
              ) : (
                rangedHistory.map((inspection, index) => {
                  const inspectionResult = isOkInspectionStatus(inspection.inspectionStatus) ? "OK" : "NOT_OK";
                  const finalStatus = inspection.afterStatus || mapStatus(inspection.inspectionStatus);
                  const logColor = inspectionResult === "OK" ? "#10b981" : "#f59e0b";

                  return (
                    <div className="gate-log" key={inspection.id || `${inspection.gateId}-${inspection.inspectedAt}-${index}`} style={{ "--log-color": logColor }}>
                      <div className="gate-log-top">
                        <div>
                          <div className="gate-log-date">{fmtDateTime(inspection.inspectedAt, lang)}</div>
                          <div className="gate-log-month">{fmtMonth(inspection.inspectedAt, lang)}</div>
                        </div>
                        <ResultBadge result={inspectionResult} lang={lang} />
                      </div>

                      <div className="gate-log-cards">
                        <div className="gate-log-cell">
                          <div className="gate-log-cell-label">{t("Result", "النتيجة")}</div>
                          <div className="gate-log-cell-value"><ResultBadge result={inspectionResult} lang={lang} /></div>
                        </div>
                        <div className="gate-log-cell">
                          <div className="gate-log-cell-label">{t("Gate status", "حالة البوابة")}</div>
                          <div className="gate-log-cell-value"><StatusBadge value={finalStatus} lang={lang} /></div>
                        </div>
                        <div className="gate-log-cell">
                          <div className="gate-log-cell-label">{t("Month", "الشهر")}</div>
                          <div className="gate-log-cell-value">{getMonthKey(inspection.inspectedAt)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function GatesPage({
  gates: gatesProp = null,
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
  const [gates, setGates] = useState(Array.isArray(gatesProp) ? gatesProp.map(normalizeGate) : []);
  const [inspections, setInspections] = useState(
    Array.isArray(inspectionsProp)
      ? inspectionsProp.map(normalizeInspection).filter((item) => resolveInspectionGateId(item))
      : []
  );
  const [loading, setLoading] = useState(!Array.isArray(gatesProp));
  const [error, setError] = useState("");
  const [selectedGate, setSelectedGate] = useState(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const t = (en, ar) => (lang === "ar" ? ar : en);
  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadGates() {
    try {
      setLoading(true);
      setError("");

      const token = pickToken();

      const [gatesResult, inspectionsResult] = await Promise.allSettled([
        Array.isArray(gatesProp)
          ? Promise.resolve({ items: gatesProp.map(normalizeGate), sourceUrl: "" })
          : fetchGatesFromApi(baseUrl, token),
        Array.isArray(inspectionsProp)
          ? Promise.resolve({
              items: inspectionsProp.map(normalizeInspection).filter((item) => resolveInspectionGateId(item)),
              sourceUrl: "",
            })
          : fetchInspectionsFromApi(baseUrl, token),
      ]);

      const loadedGates = gatesResult.status === "fulfilled" ? gatesResult.value.items : [];
      const loadedInspections = inspectionsResult.status === "fulfilled" ? inspectionsResult.value.items : [];

      if (gatesResult.status === "rejected") console.error("Failed to load gates:", gatesResult.reason);
      if (inspectionsResult.status === "rejected") console.warn("Failed to load gate inspections:", inspectionsResult.reason);

      const finalGates = attachInspectionData(loadedGates, loadedInspections);

      setGates(finalGates);
      setInspections(loadedInspections);

      if (!finalGates.length && gatesResult.status === "rejected") {
        setError(gatesResult.reason?.message || t("Failed to load gates from backend.", "فشل تحميل البوابات من الباك إند."));
      }
    } catch (err) {
      console.error("Failed to load gates:", err);
      setError(err?.message || t("Failed to load gates from backend.", "فشل تحميل البوابات من الباك إند."));
      setGates([]);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const options = useMemo(() => {
    const clusters = [];
    const buildings = [];
    const zones = [];
    const directions = [];

    gates.forEach((g) => {
      clusters.push(g.parsedLoc?.cluster);
      buildings.push(g.parsedLoc?.building);
      zones.push(g.parsedLoc?.zone);
      directions.push(g.parsedLoc?.direction);
    });

    return {
      clusters: cleanOptions(clusters),
      buildings: cleanOptions(buildings),
      zones: cleanOptions(zones),
      directions: cleanOptions(directions),
    };
  }, [gates]);

  const filtered = useMemo(() => {
    const query = normalizeText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return gates.filter((g) => {
      const gateResult = getGateResult(g);

      if (filters.result !== "ALL" && gateResult !== filters.result) return false;
      if (filters.status === "NON_OK" && g.currentStatus === "OK") return false;
      if (filters.status !== "ALL" && filters.status !== "NON_OK" && g.currentStatus !== filters.status) return false;
      if (filters.inspection === "INSPECTED" && !(Number(g.inspectionsCount) > 0)) return false;
      if (filters.inspection === "NOT_INSPECTED" && Number(g.inspectionsCount) > 0) return false;
      if (filters.cluster !== "ALL" && g.parsedLoc?.cluster !== filters.cluster) return false;
      if (filters.building !== "ALL" && g.parsedLoc?.building !== filters.building) return false;
      if (filters.zone !== "ALL" && g.parsedLoc?.zone !== filters.zone) return false;
      if (filters.direction !== "ALL" && g.parsedLoc?.direction !== filters.direction) return false;

      if (!queryWords.length) return true;
      const haystack = buildGateSearchText(g);
      return queryWords.every((word) => haystack.includes(word));
    });
  }, [gates, filters]);

  const counts = useMemo(() => {
    const ok = gates.filter((g) => getGateResult(g) === "OK").length;
    const notOk = gates.filter((g) => getGateResult(g) === "NOT_OK").length;
    const filteredOk = filtered.filter((g) => getGateResult(g) === "OK").length;
    const filteredNotOk = filtered.filter((g) => getGateResult(g) === "NOT_OK").length;

    return { all: gates.length, ok, notOk, filtered: filtered.length, filteredOk, filteredNotOk };
  }, [gates, filtered]);

  const totalInspectionsFromGates = gates.reduce((sum, g) => sum + (Number(g.inspectionsCount) || 0), 0);
  const totalInspections = inspections.length > 0 ? inspections.length : totalInspectionsFromGates;

  const latestInspection =
    inspections
      .map((inspection) => getInspectionDate(inspection))
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0] ||
    gates
      .map((g) => g.lastInspectionAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b) - new Date(a))[0];

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "result") {
        if (value === "OK") next.status = "OK";
        else if (value === "NOT_OK") next.status = "NON_OK";
        else next.status = "ALL";
      }

      if (key === "status") {
        if (value === "OK") next.result = "OK";
        else if (value === "ALL") next.result = "ALL";
        else next.result = "NOT_OK";
      }

      return next;
    });
  };

  const applyFilters = () => setFilters({ ...draftFilters });

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

    if (type === "INSPECTIONS") next.inspection = "INSPECTED";

    setDraftFilters(next);
    setFilters(next);
  };

  const isCardActive = (type) => {
    if (type === "ALL") return filters.result === "ALL" && filters.status === "ALL" && filters.inspection === "ALL";
    if (type === "OK") return filters.result === "OK";
    if (type === "NOT_OK") return filters.result === "NOT_OK";
    if (type === "INSPECTIONS") return filters.inspection === "INSPECTED";
    return false;
  };

  function exportExcel() {
    try {
      setExportingExcel(true);

      const gateRows = filtered.map((g) => [
        g.id,
        g.gateNo,
        getGateResult(g),
        g.currentStatus,
        g.secretCode,
        g.parsedLoc?.cluster,
        g.parsedLoc?.building,
        g.parsedLoc?.zone,
        g.parsedLoc?.direction,
        g.parsedLoc?.lane,
        fmtDateTime(g.lastInspectionAt, lang),
        g.inspectionsCount || 0,
      ]);

      const historyRows = filtered.flatMap((g) =>
        (g.relatedInspections || []).map((inspection) => [
          g.gateNo,
          g.secretCode,
          fmtDateTime(getInspectionDate(inspection), lang),
          isOkInspectionStatus(inspection.inspectionStatus) ? "OK" : "NOT OK",
          inspection.afterStatus || mapStatus(inspection.inspectionStatus),
          getMonthKey(getInspectionDate(inspection)),
          getYearKey(getInspectionDate(inspection)),
        ])
      );

      const monthlyMap = new Map();
      historyRows.forEach((row) => {
        const month = row[5] || "Unknown";
        if (!monthlyMap.has(month)) monthlyMap.set(month, { month, total: 0, ok: 0, notOk: 0 });
        const item = monthlyMap.get(month);
        item.total += 1;
        if (row[3] === "OK") item.ok += 1;
        else item.notOk += 1;
      });

      const summary = [
        ["Metric", "Value"],
        ["Total gates", gates.length],
        ["Filtered gates", filtered.length],
        ["OK gates", counts.filteredOk],
        ["Not OK gates", counts.filteredNotOk],
        ["Total inspections", totalInspections],
        ["Latest inspection", fmtDateTime(latestInspection, lang)],
      ];

      const sections = [
        ["Summary", summary],
        ["Gates", [["ID", "Gate No", "Result", "Status", "Secret Code", "Cluster", "Building", "Zone", "Direction", "Lane", "Last Inspection", "Inspections"], ...gateRows]],
        ["Inspection History", [["Gate No", "Secret Code", "Date", "Result", "Gate Status", "Month", "Year"], ...historyRows]],
        ["Monthly Analysis", [["Month", "Total", "OK", "Not OK"], ...Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month)).map((x) => [x.month, x.total, x.ok, x.notOk])]],
      ];

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="UTF-8" /></head>
          <body>
            ${sections
              .map(([title, rows]) => `
                <h2>${htmlSafe(title)}</h2>
                <table border="1">
                  ${rows
                    .map((row, rowIndex) => `
                      <tr>
                        ${row
                          .map((cell) => rowIndex === 0 ? `<th>${htmlSafe(cell)}</th>` : `<td>${htmlSafe(cell)}</td>`)
                          .join("")}
                      </tr>
                    `)
                    .join("")}
                </table>
                <br />
              `)
              .join("")}
          </body>
        </html>
      `;

      downloadBlob(html, `gates-report-${new Date().toISOString().slice(0, 10)}.xls`, "application/vnd.ms-excel;charset=utf-8");
    } finally {
      setTimeout(() => setExportingExcel(false), 350);
    }
  }

  function exportPdf() {
    try {
      setExportingPdf(true);

      const rows = filtered.map((g) => `
        <tr>
          <td>${htmlSafe(g.gateNo || g.id || "—")}</td>
          <td>${htmlSafe(getGateResult(g))}</td>
          <td>${htmlSafe(g.currentStatus || "—")}</td>
          <td>${htmlSafe(g.secretCode || "—")}</td>
          <td>${htmlSafe(g.parsedLoc?.cluster || "—")}</td>
          <td>${htmlSafe(g.parsedLoc?.building || "—")}</td>
          <td>${htmlSafe(g.parsedLoc?.zone || "—")}</td>
          <td>${htmlSafe(g.parsedLoc?.direction || "—")}</td>
          <td>${htmlSafe(fmt(g.lastInspectionAt, lang))}</td>
          <td>${htmlSafe(g.inspectionsCount || 0)}</td>
        </tr>
      `).join("");

      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Full Gates Report</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: Arial, sans-serif; margin: 0; background: #f1f5f9; color: #0f172a; }
              .page { width: min(1200px, 100%); margin: 0 auto; padding: 24px; }
              .hero { background: #fff; border-radius: 18px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 16px; }
              h1 { margin: 0 0 6px; font-size: 24px; }
              .sub { color: #64748b; font-size: 12px; }
              .toolbar { display: flex; justify-content: flex-end; margin-bottom: 14px; }
              button { height: 40px; padding: 0 16px; border: 0; border-radius: 12px; background: #0f172a; color: white; font-weight: 800; cursor: pointer; }
              .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
              .stat { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px; }
              .label { color: #64748b; font-size: 11px; font-weight: 700; margin-bottom: 6px; }
              .value { font-size: 22px; font-weight: 900; }
              table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; }
              th, td { padding: 9px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; text-align: left; vertical-align: top; }
              th { background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: .05em; }
              tr:nth-child(even) td { background: #fbfdff; }
              @media print {
                body { background: #fff; }
                .toolbar { display: none; }
                .page { padding: 0; width: 100%; }
                .hero { border-radius: 0; }
                table { page-break-inside: auto; }
                tr { page-break-inside: avoid; page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="toolbar"><button onclick="window.print()">Save as PDF</button></div>
              <div class="hero">
                <h1>Full Gates Report</h1>
                <div class="sub">Generated: ${htmlSafe(new Date().toLocaleString())} · Clean report without technician names or long notes</div>
                <div class="stats">
                  <div class="stat"><div class="label">Total Gates</div><div class="value">${htmlSafe(gates.length)}</div></div>
                  <div class="stat"><div class="label">Filtered</div><div class="value">${htmlSafe(filtered.length)}</div></div>
                  <div class="stat"><div class="label">OK</div><div class="value">${htmlSafe(counts.filteredOk)}</div></div>
                  <div class="stat"><div class="label">Not OK</div><div class="value">${htmlSafe(counts.filteredNotOk)}</div></div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Gate No</th>
                    <th>Result</th>
                    <th>Status</th>
                    <th>Secret Code</th>
                    <th>Cluster</th>
                    <th>Building</th>
                    <th>Zone</th>
                    <th>Direction</th>
                    <th>Last Inspection</th>
                    <th>Inspections</th>
                  </tr>
                </thead>
                <tbody>${rows || `<tr><td colspan="10">No data</td></tr>`}</tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      const reportWindow = window.open("", "_blank");
      if (!reportWindow) {
        alert(t("Please allow pop-ups to open the PDF report.", "من فضلك فعّلي فتح النوافذ المنبثقة لعرض تقرير PDF."));
        return;
      }

      reportWindow.document.open();
      reportWindow.document.write(html);
      reportWindow.document.close();
    } finally {
      setTimeout(() => setExportingPdf(false), 600);
    }
  }

  return (
    <>
      <style>{GATES_CSS}</style>

      <div className="gate-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="gate-topbar">
          <div />

          <div className="gate-actions">
            <button className="gate-btn gate-btn--excel" onClick={exportExcel} disabled={loading || exportingExcel || filtered.length === 0} type="button">
              {exportingExcel ? t("Preparing Excel...", "جاري تجهيز Excel...") : t("Export Excel", "تصدير Excel")}
            </button>

            <button className="gate-btn gate-btn--pdf" onClick={exportPdf} disabled={loading || exportingPdf || filtered.length === 0} type="button">
              {exportingPdf ? t("Preparing PDF...", "جاري تجهيز PDF...") : t("Export PDF", "تصدير PDF")}
            </button>

            <button className="gate-btn" onClick={loadGates} disabled={loading} type="button">
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="gate-alert gate-alert--error">
            {t("Backend connection error: ", "خطأ في الاتصال بالباك إند: ")}
            {error}
          </div>
        )}

        <div className="gate-summary">
          <button
            type="button"
            className={`gate-summary-card ${isCardActive("ALL") ? "active" : ""}`}
            style={{ "--card-color": "linear-gradient(90deg, #4f46e5, #818cf8)" }}
            onClick={() => setQuickFilter("ALL")}
          >
            <div className="gate-summary-label">{t("Total Gates", "إجمالي البوابات")}</div>
            <div className="gate-summary-value">{numberText(gates.length, lang)}</div>
            <div className="gate-summary-note">{t("All loaded records", "كل السجلات المحملة")}</div>
          </button>

          <button
            type="button"
            className={`gate-summary-card ${isCardActive("OK") ? "active" : ""}`}
            style={{ "--card-color": "#10b981" }}
            onClick={() => setQuickFilter("OK")}
          >
            <div className="gate-summary-label">OK</div>
            <div className="gate-summary-value">{numberText(counts.ok, lang)}</div>
            <div className="gate-summary-note">{t("Operational gates", "البوابات السليمة")}</div>
          </button>

          <button
            type="button"
            className={`gate-summary-card ${isCardActive("NOT_OK") ? "active" : ""}`}
            style={{ "--card-color": "#f59e0b" }}
            onClick={() => setQuickFilter("NOT_OK")}
          >
            <div className="gate-summary-label">Not OK</div>
            <div className="gate-summary-value">{numberText(counts.notOk, lang)}</div>
            <div className="gate-summary-note">{t("Needs attention or maintenance", "تحتاج متابعة أو صيانة")}</div>
          </button>

          <button
            type="button"
            className={`gate-summary-card ${isCardActive("INSPECTIONS") ? "active" : ""}`}
            style={{ "--card-color": "#0ea5e9" }}
            onClick={() => setQuickFilter("INSPECTIONS")}
          >
            <div className="gate-summary-label">{t("Inspections", "الفحوصات")}</div>
            <div className="gate-summary-value">{numberText(totalInspections, lang)}</div>
            <div className="gate-summary-note">
              {latestInspection ? `${t("Latest:", "آخر فحص:")} ${fmt(latestInspection, lang)}` : t("No inspection date", "لا يوجد تاريخ فحص")}
            </div>
          </button>
        </div>

        <div className="gate-filter-card">
          <div className="gate-filter-head">
            <div className="gate-filter-title">
              <div className="gate-filter-icon">⌕</div>
              <div>
                <div className="gate-filter-title-text">{t("Advanced Gate Filter", "فلتر البوابات المتقدم")}</div>
                <div className="gate-filter-title-sub">
                  {t("Search gates by result, status, inspection, location, IP & serial", "فلتر البوابات حسب النتيجة أو الحالة أو الفحص أو الموقع أو IP و serial")}
                </div>
              </div>
            </div>

            <div className="gate-filter-result">
              <span className="gate-filter-result-dot" />
              {numberText(filtered.length, lang)} / {numberText(gates.length, lang)} {t("records", "سجل")}
            </div>
          </div>

          <div className="gate-filter-grid">
            <div className="gate-filter-field">
              <label>{t("Search", "بحث")}</label>
              <input
                className="gate-filter-input"
                value={draftFilters.search}
                onChange={(e) => updateDraft("search", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") applyFilters(); }}
                placeholder={t("Gate no, secret code, IP & serial, building, zone...", "رقم بوابة، سيكريت كود، IP و serial، مبنى، منطقة...")}
              />
            </div>

            <div className="gate-filter-field">
              <label>{t("Result", "النتيجة")}</label>
              <select className="gate-filter-select" value={draftFilters.result} onChange={(e) => updateDraft("result", e.target.value)}>
                {RESULT_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option[lang] || option.en}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Status", "الحالة")}</label>
              <select className="gate-filter-select" value={draftFilters.status} onChange={(e) => updateDraft("status", e.target.value)}>
                {STATUS_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option[lang] || option.en}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Inspection", "الفحص")}</label>
              <select className="gate-filter-select" value={draftFilters.inspection} onChange={(e) => updateDraft("inspection", e.target.value)}>
                {INSPECTION_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option[lang] || option.en}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select className="gate-filter-select" value={draftFilters.cluster} onChange={(e) => updateDraft("cluster", e.target.value)}>
                <option value="ALL">{t("All clusters", "كل المجموعات")}</option>
                {options.clusters.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Building", "المبنى")}</label>
              <select className="gate-filter-select" value={draftFilters.building} onChange={(e) => updateDraft("building", e.target.value)}>
                <option value="ALL">{t("All buildings", "كل المباني")}</option>
                {options.buildings.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select className="gate-filter-select" value={draftFilters.zone} onChange={(e) => updateDraft("zone", e.target.value)}>
                <option value="ALL">{t("All zones", "كل المناطق")}</option>
                {options.zones.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>

            <div className="gate-filter-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select className="gate-filter-select" value={draftFilters.direction} onChange={(e) => updateDraft("direction", e.target.value)}>
                <option value="ALL">{t("All directions", "كل الاتجاهات")}</option>
                {options.directions.map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </div>
          </div>

          <div className="gate-filter-footer">
            <div className="gate-filter-hint">
              {t(
                `Filtered OK: ${counts.filteredOk} · Not OK: ${counts.filteredNotOk}`,
                `المفلتر سليم: ${counts.filteredOk} · غير سليم: ${counts.filteredNotOk}`
              )}
            </div>

            <div className="gate-filter-actions">
              <button type="button" className="gate-btn gate-btn--soft" onClick={resetFilters}>{t("Reset", "إعادة ضبط")}</button>
              <button type="button" className="gate-btn" onClick={applyFilters}>{t("Apply", "تطبيق")}</button>
            </div>
          </div>
        </div>

        <div className="gate-panel">
          <div className="gate-panel__head">
            <div>
              <div className="gate-panel__title">{t("Gates", "البوابات")}</div>
              <div className="gate-panel__sub">{t("All registered gates in current scope", "جميع البوابات المسجلة في النطاق الحالي")}</div>
            </div>
            <div className="gate-records">{numberText(filtered.length, lang)} {t("records", "سجل")}</div>
          </div>

          {loading ? (
            <div className="gate-loading">
              <div className="gate-loading-spinner" />
              {t("Loading gates from backend...", "جارٍ تحميل البوابات من الباك إند...")}
            </div>
          ) : filtered.length ? (
            <div className="gate-table-wrap">
              <table className="gate-table">
                <thead>
                  <tr>
                    <th>{t("Gate", "البوابة")}</th>
                    <th>{t("Result", "النتيجة")}</th>
                    <th>{t("Status", "الحالة")}</th>
                    <th>{t("Cluster", "المجموعة")}</th>
                    <th>{t("Building", "المبنى")}</th>
                    <th>{t("Zone", "المنطقة")}</th>
                    <th>{t("Direction", "الاتجاه")}</th>
                    <th>{t("Last Inspection", "آخر فحص")}</th>
                    <th>{t("Secret Code", "السيكريت")}</th>
                    <th style={{ textAlign: "center" }}>{t("Inspections", "الفحوصات")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((g) => {
                    const result = getGateResult(g);

                    return (
                      <tr key={g.id || g.gateNo} onClick={() => setSelectedGate(g)}>
                        <td data-label={t("Gate", "البوابة")}>
                          <div className="gate-code">{t("Gate", "بوابة")} {g.gateNo || g.id}</div>
                          <div className="gate-name">{g.gateName || g.parsedLoc?.building || t("Unknown", "غير معروف")}</div>
                          {g.excelId && <div className="gate-subline">{g.excelId}</div>}
                        </td>

                        <td data-label={t("Result", "النتيجة")}><ResultBadge result={result} lang={lang} /></td>
                        <td data-label={t("Status", "الحالة")}><StatusBadge value={g.currentStatus} lang={lang} /></td>
                        <td data-label={t("Cluster", "المجموعة")} style={{ fontSize: 12 }}>{g.parsedLoc?.cluster || "—"}</td>
                        <td data-label={t("Building", "المبنى")} style={{ fontSize: 12 }}>{g.parsedLoc?.building || "—"}</td>
                        <td data-label={t("Zone", "المنطقة")} style={{ fontSize: 12 }}>{g.parsedLoc?.zone || "—"}</td>
                        <td data-label={t("Direction", "الاتجاه")} style={{ fontSize: 12 }}>{g.parsedLoc?.direction || "—"}</td>
                        <td data-label={t("Last Inspection", "آخر فحص")} style={{ fontSize: 12, color: "var(--faint)" }}>{fmt(g.lastInspectionAt, lang)}</td>
                        <td data-label={t("Secret Code", "السيكريت")} style={{ fontSize: 12 }}>{g.secretCode || "—"}</td>
                        <td data-label={t("Inspections", "الفحوصات")} style={{ textAlign: "center" }}><span className="gate-insp-count">{g.inspectionsCount ?? 0}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="gate-empty">
              {t("No gates match the selected filters or no data came from backend.", "لا توجد بوابات مطابقة للفلاتر أو لم تصل بيانات من الباك إند.")}
            </div>
          )}
        </div>

        <GateDetailsModal gate={selectedGate} lang={lang} onClose={() => setSelectedGate(null)} />
      </div>
    </>
  );
}

export default GatesPage;