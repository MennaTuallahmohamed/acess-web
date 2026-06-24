import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_API_BASE_URL = "https://acess-backend-production-8856.up.railway.app";

const LOCATIONS_CSS = `
.loc-root *, .loc-root *::before, .loc-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.loc-root {
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

  min-height: 100vh;
  padding: 28px 24px;
  background:
    radial-gradient(circle at 12% 0%, rgba(79,70,229,0.08), transparent 28%),
    radial-gradient(circle at 90% 12%, rgba(14,165,233,0.08), transparent 30%),
    #f1f5f9;
  font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text);
}

.loc-topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.loc-title {
  font-size: 24px;
  font-weight: 950;
  letter-spacing: -0.035em;
  color: var(--text);
}

.loc-subtitle {
  font-size: 12px;
  color: var(--faint);
  margin-top: 5px;
  line-height: 1.5;
}

.loc-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.loc-btn {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: #0f172a;
  color: #fff;
  font-weight: 850;
  font-size: 13px;
  cursor: pointer;
  transition: 0.18s ease;
}

.loc-btn:hover {
  transform: translateY(-1px);
  background: var(--primary);
}

.loc-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
}

.loc-btn-light {
  background: #fff;
  color: var(--text);
  border: 1px solid var(--border);
}

.loc-btn-light:hover {
  background: #f8fafc;
  color: var(--primary);
}

.loc-alert {
  margin-bottom: 14px;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.loc-alert-error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.loc-alert-ok {
  background: #ecfdf5;
  color: #166534;
  border-color: #bbf7d0;
}

.loc-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.loc-summary-card {
  position: relative;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 17px;
  padding: 16px;
  min-height: 110px;
  box-shadow: 0 12px 30px rgba(15,23,42,0.045);
}

.loc-summary-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 4px;
  background: var(--card-color, var(--primary));
}

.loc-summary-label {
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
  margin-bottom: 9px;
}

.loc-summary-value {
  font-size: 30px;
  font-weight: 950;
  line-height: 1;
  letter-spacing: -0.04em;
  color: var(--card-color, var(--primary));
}

.loc-summary-note {
  color: var(--faint);
  font-size: 11px;
  margin-top: 8px;
  line-height: 1.45;
}

/* Filter */
.loc-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(79, 70, 229, 0.14), transparent 34%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.10), transparent 34%);
  border: 1px solid rgba(226,232,240,0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 18px 45px rgba(15,23,42,0.07);
}

.loc-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.loc-filter-title-row {
  display: flex;
  align-items: center;
  gap: 11px;
}

.loc-filter-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: rgba(79,70,229,0.09);
  color: var(--primary);
  font-size: 18px;
  font-weight: 950;
}

.loc-filter-title {
  color: var(--text);
  font-size: 15px;
  font-weight: 950;
}

.loc-filter-sub {
  color: var(--faint);
  font-size: 11px;
  margin-top: 2px;
}

.loc-filter-count {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  padding: 8px 13px;
  background: rgba(79,70,229,0.08);
  color: #4338ca;
  border: 1px solid rgba(79,70,229,0.18);
  font-size: 12px;
  font-weight: 900;
  white-space: nowrap;
}

.loc-filter-dot {
  width: 7px;
  height: 7px;
  background: var(--primary);
  border-radius: 50%;
}

.loc-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(6, minmax(130px, 1fr));
  gap: 12px;
  align-items: end;
}

.loc-field {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.loc-field label {
  color: var(--muted);
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.loc-input,
.loc-select {
  width: 100%;
  height: 46px;
  border-radius: 15px;
  border: 1px solid #dbe4ef;
  background: #f8fafc;
  padding: 0 14px;
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  outline: none;
  transition: 0.18s ease;
}

.loc-input {
  font-weight: 600;
}

.loc-input::placeholder {
  color: var(--faint);
}

.loc-input:focus,
.loc-select:focus {
  background: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79,70,229,0.12);
}

.loc-select {
  cursor: pointer;
  appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, #64748b 50%),
    linear-gradient(135deg, #64748b 50%, transparent 50%);
  background-position:
    calc(100% - 21px) 50%,
    calc(100% - 14px) 50%;
  background-size: 7px 7px, 7px 7px;
  background-repeat: no-repeat;
  padding-right: 36px;
}

.loc-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
}

.loc-filter-hint {
  color: var(--faint);
  font-size: 12px;
}

.loc-filter-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
}

.loc-filter-btn:hover {
  transform: translateY(-1px);
}

.loc-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.loc-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.loc-filter-btn-apply {
  background: #0f172a;
  color: #fff;
  min-width: 82px;
  box-shadow: 0 10px 20px rgba(15,23,42,0.18);
}

.loc-filter-btn-apply:hover {
  background: var(--primary);
}

/* View controls */
.loc-view-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.loc-count-pill {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 7px 14px;
  color: var(--muted);
  font-weight: 900;
  font-size: 12px;
}

.loc-view-toggle {
  display: flex;
  gap: 4px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 13px;
  padding: 4px;
}

.loc-view-btn {
  border: 0;
  background: transparent;
  padding: 7px 15px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
  cursor: pointer;
  color: var(--muted);
}

.loc-view-btn.active {
  background: #0f172a;
  color: #fff;
}

/* Cards */
.loc-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.loc-card {
  background: #fff;
  border: 1px solid var(--border);
  border-top: 4px solid var(--status-color, var(--success));
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 12px 30px rgba(15,23,42,0.045);
  cursor: pointer;
  transition: 0.18s ease;
  min-height: 190px;
  display: flex;
  flex-direction: column;
}

.loc-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow);
  border-color: rgba(79,70,229,0.24);
}

.loc-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;
}

.loc-card-title {
  color: var(--text);
  font-size: 14px;
  font-weight: 950;
  line-height: 1.45;
}

.loc-card-sub {
  color: var(--faint);
  font-size: 11px;
  font-weight: 650;
  line-height: 1.6;
  margin-top: 4px;
}

.loc-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
}

.loc-status-ok {
  background: #d1fae5;
  color: #047857;
}

.loc-status-bad {
  background: #fee2e2;
  color: #b91c1c;
}

.loc-mini-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid rgba(15,23,42,0.06);
}

.loc-mini-value {
  color: var(--text);
  font-size: 17px;
  font-weight: 950;
  line-height: 1;
}

.loc-mini-label {
  color: var(--faint);
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  margin-top: 5px;
}

.loc-progress {
  margin-top: 12px;
}

.loc-progress-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  margin-bottom: 7px;
}

.loc-track {
  height: 8px;
  background: #eef2f7;
  border-radius: 999px;
  overflow: hidden;
}

.loc-fill {
  height: 100%;
  width: var(--progress, 0%);
  background: linear-gradient(90deg, var(--primary), var(--info));
  border-radius: 999px;
}

/* Table */
.loc-panel {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 12px 30px rgba(15,23,42,0.045);
}

.loc-panel-head {
  padding: 17px 19px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

.loc-panel-title {
  font-size: 15px;
  font-weight: 950;
  color: var(--text);
}

.loc-panel-sub {
  color: var(--faint);
  font-size: 12px;
  margin-top: 4px;
}

.loc-records {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 6px 12px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
}

.loc-table-wrap {
  width: 100%;
  overflow: auto;
}

.loc-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

.loc-table th {
  background: var(--surface2);
  color: var(--muted);
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .06em;
  text-align: left;
  padding: 12px 15px;
  border-bottom: 1px solid var(--border);
}

.loc-table td {
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
  padding: 13px 15px;
  border-bottom: 1px solid rgba(15,23,42,0.06);
  vertical-align: middle;
}

.loc-table tr {
  cursor: pointer;
}

.loc-table tr:hover td {
  background: #f8fafc;
}

.loc-main-name {
  color: var(--text);
  font-weight: 950;
  font-size: 13px;
}

.loc-main-sub {
  color: var(--faint);
  font-size: 11px;
  margin-top: 4px;
}

/* Drawer */
.loc-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15,23,42,0.55);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
}

.loc-drawer {
  width: min(980px, 100%);
  height: 100vh;
  background: #fff;
  box-shadow: -20px 0 80px rgba(15,23,42,0.28);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.loc-drawer-head {
  padding: 22px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.loc-drawer-title {
  color: var(--text);
  font-size: 22px;
  font-weight: 950;
  letter-spacing: -0.03em;
  line-height: 1.3;
}

.loc-drawer-sub {
  color: var(--faint);
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.6;
}

.loc-close {
  border: 0;
  background: #f1f5f9;
  color: var(--text);
  width: 40px;
  height: 40px;
  border-radius: 14px;
  font-size: 24px;
  cursor: pointer;
  flex-shrink: 0;
}

.loc-drawer-body {
  padding: 18px 22px 22px;
  overflow: auto;
}

.loc-drawer-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.loc-drawer-stat {
  background: #f8fafc;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 13px;
}

.loc-drawer-stat-value {
  color: var(--primary);
  font-size: 22px;
  font-weight: 950;
  line-height: 1;
}

.loc-drawer-stat-label {
  color: var(--faint);
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 950;
  margin-top: 7px;
}

.loc-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.loc-tab {
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--muted);
  border-radius: 13px;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
}

.loc-tab.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.loc-section-card {
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
}

.loc-section-head {
  padding: 15px 17px;
  background: #f8fafc;
  border-bottom: 1px solid var(--border);
}

.loc-section-title {
  color: var(--text);
  font-size: 14px;
  font-weight: 950;
}

.loc-section-sub {
  color: var(--faint);
  font-size: 11px;
  margin-top: 4px;
}

.loc-inner-table-wrap {
  overflow: auto;
}

.loc-inner-table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
}

.loc-inner-table th {
  background: #fff;
  color: var(--muted);
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  text-align: left;
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
}

.loc-inner-table td {
  color: var(--muted);
  font-size: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(15,23,42,0.06);
  vertical-align: middle;
}

.loc-pill {
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 10px;
  font-weight: 950;
  white-space: nowrap;
}

.loc-pill-ok {
  background: #d1fae5;
  color: #047857;
}

.loc-pill-bad {
  background: #fee2e2;
  color: #b91c1c;
}

.loc-pill-warn {
  background: #fef3c7;
  color: #92400e;
}

.loc-empty {
  padding: 32px 18px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
  font-weight: 700;
}

.loc-loading {
  padding: 48px 20px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
  font-weight: 700;
}

.loc-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #dbeafe;
  border-top-color: var(--primary);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: locSpin .8s linear infinite;
}

@keyframes locSpin {
  to { transform: rotate(360deg); }
}



.loc-zone-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 15px;
}

.loc-zone-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.loc-zone-filter-title {
  color: var(--text);
  font-size: 13px;
  font-weight: 950;
}

.loc-zone-filter-sub {
  color: var(--faint);
  font-size: 11px;
  margin-top: 3px;
  line-height: 1.5;
}

.loc-zone-select {
  min-width: 240px;
  height: 42px;
  border-radius: 14px;
  border: 1px solid #dbe4ef;
  background: #fff;
  padding: 0 14px;
  color: var(--text);
  font-size: 12px;
  font-weight: 850;
  outline: none;
  cursor: pointer;
}

.loc-zone-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79,70,229,0.12);
}

.loc-zone-chips {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.loc-zone-chip {
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 15px;
  padding: 10px;
  text-align: left;
  cursor: pointer;
  transition: 0.18s ease;
  min-height: 76px;
}

.loc-zone-chip:hover {
  transform: translateY(-1px);
  border-color: var(--primary);
  box-shadow: 0 10px 22px rgba(15,23,42,0.06);
}

.loc-zone-chip.active {
  background: #eef2ff;
  border-color: rgba(79,70,229,0.35);
  box-shadow: 0 10px 24px rgba(79,70,229,0.10);
}

.loc-zone-name {
  color: var(--text);
  font-size: 12px;
  font-weight: 950;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.loc-zone-numbers {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 5px;
  margin-top: 8px;
}

.loc-zone-num {
  border-radius: 10px;
  background: #f8fafc;
  padding: 6px 5px;
}

.loc-zone-num strong {
  display: block;
  color: var(--primary);
  font-size: 14px;
  font-weight: 950;
  line-height: 1;
}

.loc-zone-num span {
  display: block;
  color: var(--faint);
  font-size: 8px;
  font-weight: 950;
  text-transform: uppercase;
  margin-top: 4px;
}

.loc-zone-empty {
  border: 1px dashed #cbd5e1;
  border-radius: 15px;
  padding: 14px;
  color: var(--faint);
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  background: #fff;
}

/* Responsive */
@media (max-width: 1500px) {
  .loc-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .loc-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(140px, 1fr));
  }
}

@media (max-width: 1200px) {
  .loc-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .loc-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .loc-drawer-stats {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .loc-root {
    padding: 16px 14px;
  }

  .loc-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loc-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loc-actions {
    width: 100%;
  }

  .loc-btn {
    flex: 1;
  }
}

@media (max-width: 650px) {
  .loc-root {
    padding: 14px 10px;
  }

  .loc-title {
    font-size: 21px;
  }

  .loc-summary {
    grid-template-columns: 1fr;
  }

  .loc-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .loc-filter-head {
    align-items: stretch;
  }

  .loc-filter-count {
    width: 100%;
    justify-content: center;
  }

  .loc-filter-grid {
    grid-template-columns: 1fr;
  }

  .loc-filter-footer {
    align-items: stretch;
  }

  .loc-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .loc-filter-btn {
    width: 100%;
  }

  .loc-view-row {
    align-items: stretch;
  }

  .loc-count-pill,
  .loc-view-toggle {
    width: 100%;
  }

  .loc-view-btn {
    flex: 1;
  }

  .loc-grid {
    grid-template-columns: 1fr;
  }

  .loc-card {
    min-height: 170px;
  }

  .loc-mini-stats {
    grid-template-columns: repeat(4, 1fr);
  }

  .loc-panel-head {
    padding: 15px;
  }

  .loc-records {
    width: 100%;
    text-align: center;
  }

  .loc-table {
    min-width: 0;
  }

  .loc-table thead {
    display: none;
  }

  .loc-table,
  .loc-table tbody,
  .loc-table tr,
  .loc-table td {
    display: block;
    width: 100%;
  }

  .loc-table tr {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
  }

  .loc-table td {
    border-bottom: 0;
    padding: 8px 0;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
    align-items: center;
  }

  .loc-table td::before {
    content: attr(data-label);
    color: var(--faint);
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
  }

  .loc-drawer-backdrop {
    align-items: flex-end;
    justify-content: center;
  }

  .loc-drawer {
    width: 100%;
    height: 92vh;
    border-radius: 24px 24px 0 0;
  }

  .loc-drawer-head {
    padding: 18px;
  }

  .loc-drawer-title {
    font-size: 19px;
  }

  .loc-drawer-body {
    padding: 15px;
  }

  .loc-drawer-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loc-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .loc-zone-filter-head {
    align-items: stretch;
  }

  .loc-zone-select {
    width: 100%;
    min-width: 0;
  }

  .loc-zone-chips {
    grid-template-columns: 1fr;
  }

  .loc-tab {
    width: 100%;
  }

  .loc-inner-table {
    min-width: 0;
  }

  .loc-inner-table thead {
    display: none;
  }

  .loc-inner-table,
  .loc-inner-table tbody,
  .loc-inner-table tr,
  .loc-inner-table td {
    display: block;
    width: 100%;
  }

  .loc-inner-table tr {
    padding: 11px 13px;
    border-bottom: 1px solid var(--border);
  }

  .loc-inner-table td {
    border-bottom: 0;
    padding: 7px 0;
    display: grid;
    grid-template-columns: 112px 1fr;
    gap: 10px;
  }

  .loc-inner-table td::before {
    content: attr(data-label);
    color: var(--faint);
    font-size: 10px;
    font-weight: 950;
    text-transform: uppercase;
  }
}

@media (max-width: 420px) {
  .loc-mini-stats {
    gap: 6px;
  }

  .loc-mini-value {
    font-size: 15px;
  }

  .loc-table td,
  .loc-inner-table td {
    grid-template-columns: 100px 1fr;
  }

  .loc-drawer-stats {
    grid-template-columns: 1fr;
  }

  .loc-tabs {
    grid-template-columns: 1fr;
  }
}
`;

const DEFAULT_FILTERS = {
  search: "",
  result: "ALL",
  building: "ALL",
  cluster: "ALL",
  direction: "ALL",
  zone: "ALL",
};

function pickBaseUrl(propBaseUrl = "") {
  const fromProp = propBaseUrl?.trim();
  const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();

  const fromLocal =
    localStorage.getItem("apiBaseUrl") ||
    localStorage.getItem("baseUrl") ||
    sessionStorage.getItem("apiBaseUrl") ||
    sessionStorage.getItem("baseUrl");

  return (fromProp || fromEnv || fromLocal || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
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

function cleanOptions(list = []) {
  return [...new Set(
    (Array.isArray(list) ? list : [])
      .map((value) => String(value ?? "").trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, "ar"));
}

function numberText(value, lang = "en") {
  return new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB").format(Number(value || 0));
}

function formatDate(value, lang = "en") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value, lang = "en") {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return d.toLocaleString(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      return { url, data };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working endpoint found");
}

async function fetchOptional(candidates, token) {
  try {
    const result = await fetchJsonCandidates(candidates, token);
    return { ok: true, data: result.data, url: result.url };
  } catch (error) {
    console.warn("Optional endpoint failed:", error);
    return { ok: false, data: [], url: "", error };
  }
}

function getStatus(value) {
  const s = String(value || "").trim().toUpperCase();

  if (["OK", "ACTIVE", "COMPLETED", "DONE"].includes(s)) return "OK";
  if (["NOT_OK", "NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE", "NOT_REACHABLE", "PARTIAL", "INACTIVE"].includes(s)) return "NOT_OK";

  return "OK";
}

function getLocationFields(item = {}) {
  const location = item.location || item.parsedLoc || item.locationData || {};

  return {
    id: item.locationId || location.id || item.id || "",
    excelId: item.excelId || location.excelId || "",
    cluster: item.cluster || location.cluster || item.gateCluster || "",
    building:
      item.building ||
      location.building ||
      item.ministry ||
      item.ministryName ||
      item.name ||
      location.ministry ||
      location.name ||
      "",
    zone: item.zone || location.zone || item.gateZone || "",
    direction: item.direction || location.direction || item.gateDirection || "",
    lane: item.lane || location.lane || "",
    type: item.type || location.type || "",
  };
}

function normalizeLocation(item = {}) {
  const loc = getLocationFields(item);

  return {
    id: item.id,
    excelId: loc.excelId,
    cluster: loc.cluster,
    building: loc.building || "Unknown Ministry",
    zone: loc.zone,
    direction: loc.direction,
    lane: loc.lane,
    type: loc.type,
    status: getStatus(item.currentStatus || item.status),
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    raw: item,
  };
}

function normalizeDevice(item = {}) {
  const loc = getLocationFields(item);
  const deviceType = item.deviceType || item.type || {};

  return {
    id: item.id,
    locationId: item.locationId || item.location?.id || null,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id || ""}`,
    deviceName: item.deviceName || item.name || "Unknown device",
    barcode: item.barcode || "",
    serialNumber: item.serialNumber || item.serial || "",
    manufacturer: item.manufacturer || "",
    modelNumber: item.modelNumber || "",
    ipAddress: item.ipAddress || "",
    firmware: item.firmware || "",
    deviceTypeName: deviceType.name || item.deviceTypeName || "",
    currentStatus: getStatus(item.currentStatus || item.status),
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || null,
    location: loc,
    raw: item,
  };
}

function normalizeGate(item = {}) {
  const loc = getLocationFields(item);

  return {
    id: item.id,
    locationId: item.locationId || item.location?.id || null,
    gateNo: item.gateNo || item.gateNumber || item.no || `GATE-${item.id || ""}`,
    secretCode: item.secretCode || item.secret || "",
    excelId: item.excelId || "",
    currentStatus: getStatus(item.currentStatus || item.status),
    status: String(item.status || "ACTIVE").toUpperCase(),
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || null,
    location: loc,
    raw: item,
  };
}

function normalizeInspection(item = {}) {
  const device = item.device || {};
  const gate = item.gate || {};
  const locFromDevice = getLocationFields(device);
  const locFromGate = getLocationFields(gate);
  const loc = getLocationFields(item);

  const technician = item.technician || item.user || item.createdBy || {};

  return {
    id: item.id,
    deviceId: item.deviceId || device.id || null,
    gateId: item.gateId || gate.id || null,
    inspectionStatus: getStatus(item.inspectionStatus || item.status || item.result),
    issueReason: item.issueReason || item.reason || "",
    notes: cleanInspectionNote(item.notes || item.note || item.comment || ""),
    inspectedAt: item.inspectedAt || item.createdAt || item.updatedAt || null,
    createdAt: item.createdAt || item.inspectedAt || item.updatedAt || null,
    technicianName:
      technician.fullName ||
      technician.username ||
      [technician.firstName, technician.lastName].filter(Boolean).join(" ") ||
      technician.email ||
      item.technicianName ||
      "",
    device: {
      id: device.id || item.deviceId,
      deviceCode: device.deviceCode || device.code || item.deviceCode || "",
      deviceName: device.deviceName || device.name || item.deviceName || "",
      location: locFromDevice,
    },
    gate: {
      id: gate.id || item.gateId,
      gateNo: gate.gateNo || item.gateNo || "",
      location: locFromGate,
    },
    location: {
      cluster: loc.cluster || locFromDevice.cluster || locFromGate.cluster,
      building: loc.building || locFromDevice.building || locFromGate.building,
      zone: loc.zone || locFromDevice.zone || locFromGate.zone,
      direction: loc.direction || locFromDevice.direction || locFromGate.direction,
      lane: loc.lane || locFromDevice.lane || locFromGate.lane,
      type: loc.type || locFromDevice.type || locFromGate.type,
    },
    raw: item,
  };
}

function cleanInspectionNote(value) {
  let text = String(value || "").trim();

  text = text.replace(/\[\[INSPECTION_SYSTEM_META\]\]\s*\{[\s\S]*?\}\s*$/gi, "").trim();
  text = text.replace(/\[\[INSPECTION_SYSTEM_META\]\][\s\S]*$/gi, "").trim();
  text = text.replace(/Final\s+Device\s+Condition\s*:\s*(OK|NOT_OK|PARTIAL|NOT_REACHABLE|GOOD|BAD)/gi, "").trim();

  if (/^(good|ok|سليم)$/i.test(text)) return "";

  return text;
}

function groupLocationKey(loc) {
  const building = normalizeText(loc.building);

  if (building && building !== "unknown ministry") {
    return `building:${building}`;
  }

  const cluster = normalizeText(loc.cluster);
  const zone = normalizeText(loc.zone);

  if (cluster || zone) {
    return `fallback:${cluster}|${zone}`;
  }

  return `unknown:${loc.id || loc.excelId || Math.random()}`;
}

function locationMatchesGroup(location, group) {
  const loc = getLocationFields(location || {});

  if (loc.id && group.locationIds.has(String(loc.id))) return true;
  if (loc.excelId && group.excelIds.has(String(loc.excelId))) return true;

  const building = normalizeText(loc.building);
  if (building && building === group.buildingKey) return true;

  return false;
}

function buildLocationGroups(locations, devices, gates, inspections) {
  const map = new Map();

  locations.forEach((loc) => {
    const key = groupLocationKey(loc);

    if (!map.has(key)) {
      map.set(key, {
        key,
        title: loc.building || "Unknown Ministry",
        buildingKey: normalizeText(loc.building || "Unknown Ministry"),
        clusters: new Set(),
        zones: new Set(),
        directions: new Set(),
        lanes: new Set(),
        types: new Set(),
        locationIds: new Set(),
        excelIds: new Set(),
        subLocations: [],
        status: "OK",
      });
    }

    const group = map.get(key);

    group.subLocations.push(loc);

    if (loc.id) group.locationIds.add(String(loc.id));
    if (loc.excelId) group.excelIds.add(String(loc.excelId));
    if (loc.cluster) group.clusters.add(loc.cluster);
    if (loc.zone) group.zones.add(loc.zone);
    if (loc.direction) group.directions.add(loc.direction);
    if (loc.lane) group.lanes.add(loc.lane);
    if (loc.type) group.types.add(loc.type);

    if (loc.status !== "OK") {
      group.status = "NOT_OK";
    }
  });

  const deviceById = new Map();
  const gateById = new Map();

  devices.forEach((device) => {
    if (device.id !== undefined && device.id !== null) {
      deviceById.set(normalizeId(device.id), device);
    }
  });

  gates.forEach((gate) => {
    if (gate.id !== undefined && gate.id !== null) {
      gateById.set(normalizeId(gate.id), gate);
    }
  });

  const groups = [...map.values()].map((group) => {
    const groupDevices = devices.filter((device) => locationMatchesGroup(device.location, group));
    const groupGates = gates.filter((gate) => locationMatchesGroup(gate.location, group));

    const deviceIds = new Set(groupDevices.map((device) => normalizeId(device.id)).filter(Boolean));
    const gateIds = new Set(groupGates.map((gate) => normalizeId(gate.id)).filter(Boolean));

    const groupInspections = inspections.filter((inspection) => {
      const deviceId = normalizeId(inspection.deviceId || inspection.device?.id);
      const gateId = normalizeId(inspection.gateId || inspection.gate?.id);

      if (deviceId && deviceIds.has(deviceId)) return true;
      if (gateId && gateIds.has(gateId)) return true;

      return locationMatchesGroup(inspection.location, group);
    });

    const inspectedDeviceIds = new Set(
      groupInspections
        .map((inspection) => normalizeId(inspection.deviceId || inspection.device?.id))
        .filter((id) => id && deviceIds.has(id))
    );

    const inspectedGateIds = new Set(
      groupInspections
        .map((inspection) => normalizeId(inspection.gateId || inspection.gate?.id))
        .filter((id) => id && gateIds.has(id))
    );

    const deviceBad = groupDevices.filter((device) => device.currentStatus !== "OK").length;
    const gateBad = groupGates.filter((gate) => gate.currentStatus !== "OK").length;
    const inspectionBad = groupInspections.filter((inspection) => inspection.inspectionStatus !== "OK").length;

    const allAssets = groupDevices.length + groupGates.length;
    const doneAssets = inspectedDeviceIds.size + inspectedGateIds.size;
    const progress = allAssets ? Math.round((doneAssets / allAssets) * 100) : 0;

    const status =
      deviceBad > 0 || gateBad > 0 || inspectionBad > 0 || group.status !== "OK"
        ? "NOT_OK"
        : "OK";

    return {
      ...group,
      clustersList: [...group.clusters],
      zonesList: [...group.zones],
      directionsList: [...group.directions],
      lanesList: [...group.lanes],
      typesList: [...group.types],
      devices: groupDevices,
      gates: groupGates,
      inspections: groupInspections,
      inspectedDeviceIds,
      inspectedGateIds,
      devicesCount: groupDevices.length,
      gatesCount: groupGates.length,
      inspectionsCount: groupInspections.length,
      doneDevicesCount: inspectedDeviceIds.size,
      notDoneDevicesCount: Math.max(groupDevices.length - inspectedDeviceIds.size, 0),
      doneAssetsCount: doneAssets,
      progress,
      status,
    };
  });

  return groups.sort((a, b) => a.title.localeCompare(b.title, "ar"));
}

function getDrawerZoneValue(item = {}) {
  const loc = item.location || item.parsedLoc || item.locationData || item;
  return String(
    loc.zone ||
      item.zone ||
      item.gateZone ||
      item.device?.location?.zone ||
      item.gate?.location?.zone ||
      ""
  ).trim() || "Unknown";
}

function getDrawerZoneKey(value) {
  return normalizeText(String(value || "Unknown"));
}

function buildDrawerZoneStats(group) {
  if (!group) return [];

  const map = new Map();

  function ensure(zoneValue) {
    const label = String(zoneValue || "").trim() || "Unknown";
    const key = getDrawerZoneKey(label);

    if (!map.has(key)) {
      map.set(key, {
        key,
        label,
        devices: 0,
        gates: 0,
        inspections: 0,
        locations: 0,
      });
    }

    return map.get(key);
  }

  (group.zonesList || []).forEach((zone) => ensure(zone));

  (group.subLocations || []).forEach((loc) => {
    ensure(getDrawerZoneValue(loc)).locations += 1;
  });

  (group.devices || []).forEach((device) => {
    ensure(getDrawerZoneValue(device)).devices += 1;
  });

  (group.gates || []).forEach((gate) => {
    ensure(getDrawerZoneValue(gate)).gates += 1;
  });

  (group.inspections || []).forEach((inspection) => {
    ensure(getDrawerZoneValue(inspection)).inspections += 1;
  });

  return [...map.values()].sort((a, b) => {
    if (a.label === "Unknown") return 1;
    if (b.label === "Unknown") return -1;
    return a.label.localeCompare(b.label, "ar", { numeric: true });
  });
}

function zoneMatchesFilter(zoneValue, selectedZone) {
  if (!selectedZone || selectedZone === "ALL") return true;
  return getDrawerZoneKey(zoneValue) === getDrawerZoneKey(selectedZone);
}

function Pill({ type, children }) {
  return (
    <span className={`loc-pill ${type === "ok" ? "loc-pill-ok" : type === "bad" ? "loc-pill-bad" : "loc-pill-warn"}`}>
      {children}
    </span>
  );
}

function LocationDrawer({ group, lang, onClose }) {
  const [tab, setTab] = useState("devices");
  const [zoneFilter, setZoneFilter] = useState("ALL");

  const t = (en, ar) => (lang === "ar" ? ar : en);

  useEffect(() => {
    setZoneFilter("ALL");
    setTab("devices");
  }, [group?.key]);

  const zoneStats = useMemo(() => buildDrawerZoneStats(group), [group]);

  const filteredDrawerData = useMemo(() => {
    if (!group) {
      return {
        devices: [],
        gates: [],
        inspections: [],
        subLocations: [],
        doneDevicesCount: 0,
        notDoneDevicesCount: 0,
        doneGatesCount: 0,
      };
    }

    const devices = (group.devices || []).filter((device) =>
      zoneMatchesFilter(getDrawerZoneValue(device), zoneFilter)
    );

    const gates = (group.gates || []).filter((gate) =>
      zoneMatchesFilter(getDrawerZoneValue(gate), zoneFilter)
    );

    const inspections = (group.inspections || []).filter((inspection) =>
      zoneMatchesFilter(getDrawerZoneValue(inspection), zoneFilter)
    );

    const subLocations = (group.subLocations || []).filter((loc) =>
      zoneMatchesFilter(getDrawerZoneValue(loc), zoneFilter)
    );

    const doneDevicesCount = devices.filter((device) =>
      group.inspectedDeviceIds.has(normalizeId(device.id))
    ).length;

    const doneGatesCount = gates.filter((gate) =>
      group.inspectedGateIds.has(normalizeId(gate.id))
    ).length;

    return {
      devices,
      gates,
      inspections,
      subLocations,
      doneDevicesCount,
      doneGatesCount,
      notDoneDevicesCount: Math.max(devices.length - doneDevicesCount, 0),
    };
  }, [group, zoneFilter]);

  if (!group) return null;

  const tabs = [
    { key: "devices", label: t("Devices", "الأجهزة") },
    { key: "inspections", label: t("Inspections", "الفحوصات") },
    { key: "gates", label: t("Gates", "البوابات") },
    { key: "locations", label: t("Sub locations", "المواقع الفرعية") },
  ];

  const allZonesDeviceCount = zoneStats.reduce((sum, zone) => sum + zone.devices, 0);
  const allZonesGateCount = zoneStats.reduce((sum, zone) => sum + zone.gates, 0);
  const allZonesInspectionCount = zoneStats.reduce((sum, zone) => sum + zone.inspections, 0);

  return (
    <div className="loc-drawer-backdrop" onMouseDown={onClose}>
      <div className="loc-drawer" onMouseDown={(event) => event.stopPropagation()}>
        <div className="loc-drawer-head">
          <div>
            <div className="loc-drawer-title">{group.title}</div>
            <div className="loc-drawer-sub">
              {[
                group.clustersList.join(", "),
                group.zonesList.slice(0, 4).join(", "),
                group.directionsList.slice(0, 4).join(", "),
              ]
                .filter(Boolean)
                .join(" · ") || t("Linked ministry location", "موقع وزارة مرتبط")}
            </div>
          </div>

          <button type="button" className="loc-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="loc-drawer-body">
          <div className="loc-drawer-stats">
            <div className="loc-drawer-stat">
              <div className="loc-drawer-stat-value">{numberText(filteredDrawerData.devices.length, lang)}</div>
              <div className="loc-drawer-stat-label">{t("Devices", "الأجهزة")}</div>
            </div>

            <div className="loc-drawer-stat">
              <div className="loc-drawer-stat-value">{numberText(filteredDrawerData.doneDevicesCount, lang)}</div>
              <div className="loc-drawer-stat-label">{t("Inspected devices", "أجهزة اتفحصت")}</div>
            </div>

            <div className="loc-drawer-stat">
              <div className="loc-drawer-stat-value">{numberText(filteredDrawerData.notDoneDevicesCount, lang)}</div>
              <div className="loc-drawer-stat-label">{t("Remaining devices", "أجهزة متبقية")}</div>
            </div>

            <div className="loc-drawer-stat">
              <div className="loc-drawer-stat-value">{numberText(filteredDrawerData.gates.length, lang)}</div>
              <div className="loc-drawer-stat-label">{t("Gates", "البوابات")}</div>
            </div>

            <div className="loc-drawer-stat">
              <div className="loc-drawer-stat-value">{numberText(filteredDrawerData.inspections.length, lang)}</div>
              <div className="loc-drawer-stat-label">{t("Inspections", "الفحوصات")}</div>
            </div>
          </div>

          <div className="loc-zone-filter-card">
            <div className="loc-zone-filter-head">
              <div>
                <div className="loc-zone-filter-title">
                  {t("Zone filter inside this ministry", "فلتر الزون داخل الوزارة")}
                </div>
                <div className="loc-zone-filter-sub">
                  {t(
                    "Each zone shows how many devices, gates, and inspections it contains.",
                    "كل زون بيظهر فيه عدد الأجهزة والبوابات والفحوصات الخاصة به."
                  )}
                </div>
              </div>

              <select
                className="loc-zone-select"
                value={zoneFilter}
                onChange={(event) => setZoneFilter(event.target.value)}
              >
                <option value="ALL">
                  {t("All zones", "كل الزونات")} · {numberText(allZonesDeviceCount, lang)} {t("devices", "جهاز")}
                </option>
                {zoneStats.map((zone) => (
                  <option key={zone.key} value={zone.label}>
                    {zone.label} · {numberText(zone.devices, lang)} {t("devices", "جهاز")} · {numberText(zone.gates, lang)} {t("gates", "بوابة")}
                  </option>
                ))}
              </select>
            </div>

            {zoneStats.length === 0 ? (
              <div className="loc-zone-empty">
                {t("No zone data found for this ministry.", "لا توجد بيانات زون لهذه الوزارة.")}
              </div>
            ) : (
              <div className="loc-zone-chips">
                <button
                  type="button"
                  className={`loc-zone-chip ${zoneFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setZoneFilter("ALL")}
                >
                  <div className="loc-zone-name">{t("All zones", "كل الزونات")}</div>
                  <div className="loc-zone-numbers">
                    <div className="loc-zone-num">
                      <strong>{numberText(allZonesDeviceCount, lang)}</strong>
                      <span>{t("Devices", "أجهزة")}</span>
                    </div>
                    <div className="loc-zone-num">
                      <strong>{numberText(allZonesGateCount, lang)}</strong>
                      <span>{t("Gates", "بوابات")}</span>
                    </div>
                    <div className="loc-zone-num">
                      <strong>{numberText(allZonesInspectionCount, lang)}</strong>
                      <span>{t("Insp.", "فحوصات")}</span>
                    </div>
                  </div>
                </button>

                {zoneStats.map((zone) => (
                  <button
                    type="button"
                    key={zone.key}
                    className={`loc-zone-chip ${zoneFilter === zone.label ? "active" : ""}`}
                    onClick={() => setZoneFilter(zone.label)}
                    title={`${zone.label} · ${zone.devices} devices`}
                  >
                    <div className="loc-zone-name">{zone.label}</div>
                    <div className="loc-zone-numbers">
                      <div className="loc-zone-num">
                        <strong>{numberText(zone.devices, lang)}</strong>
                        <span>{t("Devices", "أجهزة")}</span>
                      </div>
                      <div className="loc-zone-num">
                        <strong>{numberText(zone.gates, lang)}</strong>
                        <span>{t("Gates", "بوابات")}</span>
                      </div>
                      <div className="loc-zone-num">
                        <strong>{numberText(zone.inspections, lang)}</strong>
                        <span>{t("Insp.", "فحوصات")}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="loc-tabs">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`loc-tab ${tab === item.key ? "active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === "devices" && (
            <div className="loc-section-card">
              <div className="loc-section-head">
                <div className="loc-section-title">{t("Linked devices", "الأجهزة المرتبطة")}</div>
                <div className="loc-section-sub">
                  {zoneFilter === "ALL"
                    ? t("All devices attached to this ministry location", "كل الأجهزة المرتبطة بموقع الوزارة")
                    : t(`Devices filtered by ${zoneFilter}`, `الأجهزة داخل ${zoneFilter}`)}
                </div>
              </div>

              {filteredDrawerData.devices.length === 0 ? (
                <div className="loc-empty">{t("No devices linked in this zone.", "لا توجد أجهزة مرتبطة في هذا الزون.")}</div>
              ) : (
                <div className="loc-inner-table-wrap">
                  <table className="loc-inner-table">
                    <thead>
                      <tr>
                        <th>{t("Device", "الجهاز")}</th>
                        <th>{t("Status", "الحالة")}</th>
                        <th>{t("Inspected", "تم فحصه")}</th>
                        <th>{t("Zone", "المنطقة")}</th>
                        <th>{t("Direction", "الاتجاه")}</th>
                        <th>{t("Serial", "السيريال")}</th>
                        <th>IP</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDrawerData.devices.map((device) => {
                        const inspected = group.inspectedDeviceIds.has(normalizeId(device.id));

                        return (
                          <tr key={device.id || device.deviceCode}>
                            <td data-label={t("Device", "الجهاز")}>
                              <div className="loc-main-name">{device.deviceCode || "—"}</div>
                              <div className="loc-main-sub">{device.deviceName || "—"}</div>
                            </td>

                            <td data-label={t("Status", "الحالة")}>
                              <Pill type={device.currentStatus === "OK" ? "ok" : "bad"}>
                                {device.currentStatus === "OK" ? t("OK", "سليم") : t("Not OK", "غير سليم")}
                              </Pill>
                            </td>

                            <td data-label={t("Inspected", "تم فحصه")}>
                              <Pill type={inspected ? "ok" : "warn"}>
                                {inspected ? t("Done", "تم") : t("Pending", "لم يتم")}
                              </Pill>
                            </td>

                            <td data-label={t("Zone", "المنطقة")}>{device.location.zone || "—"}</td>
                            <td data-label={t("Direction", "الاتجاه")}>{device.location.direction || "—"}</td>
                            <td data-label={t("Serial", "السيريال")}>{device.serialNumber || "—"}</td>
                            <td data-label="IP">{device.ipAddress || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "inspections" && (
            <div className="loc-section-card">
              <div className="loc-section-head">
                <div className="loc-section-title">{t("Inspection history", "سجل الفحوصات")}</div>
                <div className="loc-section-sub">
                  {zoneFilter === "ALL"
                    ? t("Device and gate inspections for this location", "فحوصات الأجهزة والبوابات لهذا الموقع")
                    : t(`Inspections filtered by ${zoneFilter}`, `الفحوصات داخل ${zoneFilter}`)}
                </div>
              </div>

              {filteredDrawerData.inspections.length === 0 ? (
                <div className="loc-empty">{t("No inspections found in this zone.", "لا توجد فحوصات في هذا الزون.")}</div>
              ) : (
                <div className="loc-inner-table-wrap">
                  <table className="loc-inner-table">
                    <thead>
                      <tr>
                        <th>{t("Asset", "العنصر")}</th>
                        <th>{t("Type", "النوع")}</th>
                        <th>{t("Result", "النتيجة")}</th>
                        <th>{t("Technician", "الفني")}</th>
                        <th>{t("Zone", "المنطقة")}</th>
                        <th>{t("Date", "التاريخ")}</th>
                        <th>{t("Notes", "ملاحظات")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDrawerData.inspections.map((inspection) => {
                        const isGate = Boolean(inspection.gateId);
                        const assetLabel = isGate
                          ? `Gate ${inspection.gate?.gateNo || inspection.gateId || ""}`
                          : inspection.device?.deviceCode || `#${inspection.deviceId || ""}`;

                        return (
                          <tr key={inspection.id || `${inspection.deviceId}-${inspection.gateId}-${inspection.inspectedAt}`}>
                            <td data-label={t("Asset", "العنصر")}>{assetLabel}</td>
                            <td data-label={t("Type", "النوع")}>{isGate ? t("Gate", "بوابة") : t("Device", "جهاز")}</td>
                            <td data-label={t("Result", "النتيجة")}>
                              <Pill type={inspection.inspectionStatus === "OK" ? "ok" : "bad"}>
                                {inspection.inspectionStatus === "OK" ? t("OK", "سليم") : t("Not OK", "غير سليم")}
                              </Pill>
                            </td>
                            <td data-label={t("Technician", "الفني")}>{inspection.technicianName || "—"}</td>
                            <td data-label={t("Zone", "المنطقة")}>{inspection.location.zone || "—"}</td>
                            <td data-label={t("Date", "التاريخ")}>{formatDateTime(inspection.inspectedAt, lang)}</td>
                            <td data-label={t("Notes", "ملاحظات")}>
                              {inspection.notes || inspection.issueReason || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "gates" && (
            <div className="loc-section-card">
              <div className="loc-section-head">
                <div className="loc-section-title">{t("Linked gates", "البوابات المرتبطة")}</div>
                <div className="loc-section-sub">
                  {zoneFilter === "ALL"
                    ? t("All gates attached to this ministry location", "كل البوابات المرتبطة بموقع الوزارة")
                    : t(`Gates filtered by ${zoneFilter}`, `البوابات داخل ${zoneFilter}`)}
                </div>
              </div>

              {filteredDrawerData.gates.length === 0 ? (
                <div className="loc-empty">{t("No gates linked in this zone.", "لا توجد بوابات مرتبطة في هذا الزون.")}</div>
              ) : (
                <div className="loc-inner-table-wrap">
                  <table className="loc-inner-table">
                    <thead>
                      <tr>
                        <th>{t("Gate", "البوابة")}</th>
                        <th>{t("Status", "الحالة")}</th>
                        <th>{t("Inspected", "تم فحصها")}</th>
                        <th>{t("Zone", "المنطقة")}</th>
                        <th>{t("Direction", "الاتجاه")}</th>
                        <th>{t("Secret", "السيكريت")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDrawerData.gates.map((gate) => {
                        const inspected = group.inspectedGateIds.has(normalizeId(gate.id));

                        return (
                          <tr key={gate.id || gate.gateNo}>
                            <td data-label={t("Gate", "البوابة")}>Gate {gate.gateNo || gate.id}</td>
                            <td data-label={t("Status", "الحالة")}>
                              <Pill type={gate.currentStatus === "OK" ? "ok" : "bad"}>
                                {gate.currentStatus === "OK" ? t("OK", "سليم") : t("Not OK", "غير سليم")}
                              </Pill>
                            </td>
                            <td data-label={t("Inspected", "تم فحصها")}>
                              <Pill type={inspected ? "ok" : "warn"}>
                                {inspected ? t("Done", "تم") : t("Pending", "لم يتم")}
                              </Pill>
                            </td>
                            <td data-label={t("Zone", "المنطقة")}>{gate.location.zone || "—"}</td>
                            <td data-label={t("Direction", "الاتجاه")}>{gate.location.direction || "—"}</td>
                            <td data-label={t("Secret", "السيكريت")}>{gate.secretCode || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "locations" && (
            <div className="loc-section-card">
              <div className="loc-section-head">
                <div className="loc-section-title">{t("Original backend locations", "المواقع الأصلية من الباك إند")}</div>
                <div className="loc-section-sub">
                  {zoneFilter === "ALL"
                    ? t("Grouped rows under the selected ministry", "الصفوف المجمعة تحت الوزارة المختارة")
                    : t(`Backend rows filtered by ${zoneFilter}`, `صفوف الباك داخل ${zoneFilter}`)}
                </div>
              </div>

              {filteredDrawerData.subLocations.length === 0 ? (
                <div className="loc-empty">{t("No backend location rows in this zone.", "لا توجد صفوف موقع في هذا الزون.")}</div>
              ) : (
                <div className="loc-inner-table-wrap">
                  <table className="loc-inner-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{t("Cluster", "المجموعة")}</th>
                        <th>{t("Building", "المبنى")}</th>
                        <th>{t("Zone", "المنطقة")}</th>
                        <th>{t("Direction", "الاتجاه")}</th>
                        <th>{t("Lane", "المسار")}</th>
                        <th>Excel ID</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDrawerData.subLocations.map((loc) => (
                        <tr key={loc.id || loc.excelId || `${loc.cluster}-${loc.zone}-${loc.lane}`}>
                          <td data-label="ID">{loc.id || "—"}</td>
                          <td data-label={t("Cluster", "المجموعة")}>{loc.cluster || "—"}</td>
                          <td data-label={t("Building", "المبنى")}>{loc.building || "—"}</td>
                          <td data-label={t("Zone", "المنطقة")}>{loc.zone || "—"}</td>
                          <td data-label={t("Direction", "الاتجاه")}>{loc.direction || "—"}</td>
                          <td data-label={t("Lane", "المسار")}>{loc.lane || "—"}</td>
                          <td data-label="Excel ID">{loc.excelId || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ViewerLocationsPage({
  lang = "en",
  apiBaseUrl = "",
  locations: locationsProp = null,
  devices: devicesProp = null,
  gates: gatesProp = null,
  inspections: inspectionsProp = null,
}) {
  const t = (en, ar) => (lang === "ar" ? ar : en);

  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  const [rawLocations, setRawLocations] = useState(
    Array.isArray(locationsProp) ? locationsProp.map(normalizeLocation) : []
  );
  const [rawDevices, setRawDevices] = useState(
    Array.isArray(devicesProp) ? devicesProp.map(normalizeDevice) : []
  );
  const [rawGates, setRawGates] = useState(
    Array.isArray(gatesProp) ? gatesProp.map(normalizeGate) : []
  );
  const [rawInspections, setRawInspections] = useState(
    Array.isArray(inspectionsProp) ? inspectionsProp.map(normalizeInspection) : []
  );

  const [loading, setLoading] = useState(
    !Array.isArray(locationsProp) ||
      !Array.isArray(devicesProp) ||
      !Array.isArray(gatesProp) ||
      !Array.isArray(inspectionsProp)
  );
  const [error, setError] = useState("");

  const [view, setView] = useState("grid");
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const token = pickToken();

      const endpoints = {
        locations: [
          `${baseUrl}/locations`,
          `${baseUrl}/api/locations`,
          `${baseUrl}/viewer/locations`,
          `${baseUrl}/dashboard/locations`,
          `${baseUrl}/dashboard/viewer/locations`,
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
      };

      const [locationsPack, devicesPack, gatesPack, inspectionsPack] =
        await Promise.all([
          Array.isArray(locationsProp)
            ? Promise.resolve({ ok: true, data: locationsProp })
            : fetchOptional(endpoints.locations, token),
          Array.isArray(devicesProp)
            ? Promise.resolve({ ok: true, data: devicesProp })
            : fetchOptional(endpoints.devices, token),
          Array.isArray(gatesProp)
            ? Promise.resolve({ ok: true, data: gatesProp })
            : fetchOptional(endpoints.gates, token),
          Array.isArray(inspectionsProp)
            ? Promise.resolve({ ok: true, data: inspectionsProp })
            : fetchOptional(endpoints.inspections, token),
        ]);

      const locationsList = extractArray(locationsPack.data, ["locations"]).map(normalizeLocation);
      const devicesList = extractArray(devicesPack.data, ["devices"]).map(normalizeDevice);
      const gatesList = extractArray(gatesPack.data, ["gates"]).map(normalizeGate);
      const inspectionsList = extractArray(inspectionsPack.data, ["inspections"]).map(normalizeInspection);

      setRawLocations(locationsList);
      setRawDevices(devicesList);
      setRawGates(gatesList);
      setRawInspections(inspectionsList);

      if (!locationsPack.ok && locationsList.length === 0) {
        setError(t("Failed to load locations from backend.", "فشل تحميل المواقع من الباك إند."));
      }
    } catch (err) {
      console.error("ViewerLocationsPage load failed:", err);
      setError(err?.message || t("Failed to load data from backend.", "فشل تحميل البيانات من الباك إند."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  const groupedLocations = useMemo(() => {
    return buildLocationGroups(rawLocations, rawDevices, rawGates, rawInspections);
  }, [rawLocations, rawDevices, rawGates, rawInspections]);

  const options = useMemo(() => {
    return {
      buildings: cleanOptions(groupedLocations.map((group) => group.title)),
      clusters: cleanOptions(groupedLocations.flatMap((group) => group.clustersList)),
      directions: cleanOptions(groupedLocations.flatMap((group) => group.directionsList)),
      zones: cleanOptions(groupedLocations.flatMap((group) => group.zonesList)),
    };
  }, [groupedLocations]);

  const filteredGroups = useMemo(() => {
    const query = normalizeText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return groupedLocations.filter((group) => {
      if (filters.result !== "ALL") {
        const result = group.status === "OK" ? "OK" : "NOT_OK";
        if (result !== filters.result) return false;
      }

      if (filters.building !== "ALL" && group.title !== filters.building) return false;
      if (filters.cluster !== "ALL" && !group.clusters.has(filters.cluster)) return false;
      if (filters.direction !== "ALL" && !group.directions.has(filters.direction)) return false;
      if (filters.zone !== "ALL" && !group.zones.has(filters.zone)) return false;

      if (queryWords.length) {
        const haystack = normalizeText([
          group.title,
          group.clustersList.join(" "),
          group.zonesList.join(" "),
          group.directionsList.join(" "),
          group.lanesList.join(" "),
          group.typesList.join(" "),
          group.subLocations.map((loc) => loc.excelId).join(" "),
        ].join(" "));

        if (!queryWords.every((word) => haystack.includes(word))) {
          return false;
        }
      }

      return true;
    });
  }, [groupedLocations, filters]);

  const stats = useMemo(() => {
    const ok = groupedLocations.filter((group) => group.status === "OK").length;
    const notOk = groupedLocations.length - ok;

    const totalDoneDevices = groupedLocations.reduce((sum, group) => sum + group.doneDevicesCount, 0);
    const totalDoneAssets = groupedLocations.reduce((sum, group) => sum + group.doneAssetsCount, 0);

    return {
      ministries: groupedLocations.length,
      backendLocations: rawLocations.length,
      devices: rawDevices.length,
      doneDevices: totalDoneDevices,
      gates: rawGates.length,
      inspections: rawInspections.length,
      ok,
      notOk,
      doneAssets: totalDoneAssets,
    };
  }, [groupedLocations, rawLocations, rawDevices, rawGates, rawInspections]);

  function updateDraft(key, value) {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function applyFilters() {
    setFilters({ ...draftFilters });
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  }

  return (
    <>
      <style>{LOCATIONS_CSS}</style>

      <div className="loc-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="loc-topbar">
          <div>
           
          </div>

          <div className="loc-actions">
            <button className="loc-btn" type="button" onClick={loadData} disabled={loading}>
              {loading ? t("Loading...", "جارٍ التحميل...") : t("Refresh", "تحديث")}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="loc-alert loc-alert-error">
            {error}
          </div>
        )}

        <div className="loc-summary">
          <div className="loc-summary-card" style={{ "--card-color": "#4f46e5" }}>
            <div className="loc-summary-label">{t("Ministries", "الوزارات")}</div>
            <div className="loc-summary-value">{numberText(stats.ministries, lang)}</div>
            <div className="loc-summary-note">
              {t("Grouped without duplicates", "مجمعة بدون تكرار")}
            </div>
          </div>

          <div className="loc-summary-card" style={{ "--card-color": "#0ea5e9" }}>
            <div className="loc-summary-label">{t("Original Locations", "المواقع الأصلية")}</div>
            <div className="loc-summary-value">{numberText(stats.backendLocations, lang)}</div>
            <div className="loc-summary-note">
              {t("Raw rows from backend", "صفوف الباك إند الأصلية")}
            </div>
          </div>

          <div className="loc-summary-card" style={{ "--card-color": "#10b981" }}>
            <div className="loc-summary-label">{t("Devices", "الأجهزة")}</div>
            <div className="loc-summary-value">{numberText(stats.devices, lang)}</div>
            <div className="loc-summary-note">
              {t("Linked to ministries", "مرتبطة بالوزارات")}
            </div>
          </div>

          <div className="loc-summary-card" style={{ "--card-color": "#f59e0b" }}>
            <div className="loc-summary-label">{t("Inspected Devices", "أجهزة اتفحصت")}</div>
            <div className="loc-summary-value">{numberText(stats.doneDevices, lang)}</div>
            <div className="loc-summary-note">
              {t("Detected from inspections", "محسوبة من الفحوصات")}
            </div>
          </div>

          <div className="loc-summary-card" style={{ "--card-color": "#8b5cf6" }}>
            <div className="loc-summary-label">{t("Inspections", "الفحوصات")}</div>
            <div className="loc-summary-value">{numberText(stats.inspections, lang)}</div>
            <div className="loc-summary-note">
              {t("Device and gate records", "فحوصات الأجهزة والبوابات")}
            </div>
          </div>
        </div>

        <div className="loc-filter-card">
          <div className="loc-filter-head">
            <div className="loc-filter-title-row">
              <div className="loc-filter-icon">⌕</div>
              <div>
                <div className="loc-filter-title">
                  {t("Advanced Location Intelligence", "فلتر المواقع الذكي")}
                </div>
                <div className="loc-filter-sub">
                  {t(
                    "Search by ministry, cluster, zone, direction, Excel ID, or linked data.",
                    "ابحثي بالوزارة أو المجموعة أو الزون أو الاتجاه أو Excel ID أو البيانات المرتبطة."
                  )}
                </div>
              </div>
            </div>

            <div className="loc-filter-count">
              <span className="loc-filter-dot" />
              {numberText(filteredGroups.length, lang)} / {numberText(groupedLocations.length, lang)} {t("ministries", "وزارة")}
            </div>
          </div>

          <div className="loc-filter-grid">
            <div className="loc-field">
              <label>{t("Search", "بحث")}</label>
              <input
                className="loc-input"
                value={draftFilters.search}
                onChange={(event) => updateDraft("search", event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") applyFilters();
                }}
                placeholder={t(
                  "Ministry, building, cluster, zone, lane, Excel ID...",
                  "وزارة، مبنى، مجموعة، زون، لين، Excel ID..."
                )}
              />
            </div>

            <div className="loc-field">
              <label>{t("Result", "النتيجة")}</label>
              <select
                className="loc-select"
                value={draftFilters.result}
                onChange={(event) => updateDraft("result", event.target.value)}
              >
                <option value="ALL">{t("All results", "كل النتائج")}</option>
                <option value="OK">{t("OK", "سليم")}</option>
                <option value="NOT_OK">{t("Not OK", "غير سليم")}</option>
              </select>
            </div>

            <div className="loc-field">
              <label>{t("Ministry", "الوزارة")}</label>
              <select
                className="loc-select"
                value={draftFilters.building}
                onChange={(event) => updateDraft("building", event.target.value)}
              >
                <option value="ALL">{t("All ministries", "كل الوزارات")}</option>
                {options.buildings.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="loc-field">
              <label>{t("Cluster", "المجموعة")}</label>
              <select
                className="loc-select"
                value={draftFilters.cluster}
                onChange={(event) => updateDraft("cluster", event.target.value)}
              >
                <option value="ALL">{t("All clusters", "كل المجموعات")}</option>
                {options.clusters.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="loc-field">
              <label>{t("Zone", "المنطقة")}</label>
              <select
                className="loc-select"
                value={draftFilters.zone}
                onChange={(event) => updateDraft("zone", event.target.value)}
              >
                <option value="ALL">{t("All zones", "كل المناطق")}</option>
                {options.zones.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>

            <div className="loc-field">
              <label>{t("Direction", "الاتجاه")}</label>
              <select
                className="loc-select"
                value={draftFilters.direction}
                onChange={(event) => updateDraft("direction", event.target.value)}
              >
                <option value="ALL">{t("All directions", "كل الاتجاهات")}</option>
                {options.directions.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="loc-filter-footer">
            <div className="loc-filter-hint">
              {t(
                `Filtered OK: ${filteredGroups.filter((g) => g.status === "OK").length} · Not OK: ${filteredGroups.filter((g) => g.status !== "OK").length}`,
                `المفلتر سليم: ${filteredGroups.filter((g) => g.status === "OK").length} · غير سليم: ${filteredGroups.filter((g) => g.status !== "OK").length}`
              )}
            </div>

            <div className="loc-filter-actions">
              <button
                type="button"
                className="loc-filter-btn loc-filter-btn-reset"
                onClick={resetFilters}
              >
                {t("Reset", "إعادة ضبط")}
              </button>

              <button
                type="button"
                className="loc-filter-btn loc-filter-btn-apply"
                onClick={applyFilters}
              >
                {t("Apply", "تطبيق")}
              </button>
            </div>
          </div>
        </div>

        <div className="loc-view-row">
          <div className="loc-count-pill">
            {numberText(filteredGroups.length, lang)} {t("ministries", "وزارة")}
          </div>

          <div className="loc-view-toggle">
            <button
              type="button"
              className={`loc-view-btn ${view === "grid" ? "active" : ""}`}
              onClick={() => setView("grid")}
            >
              {t("Grid", "شبكة")}
            </button>

            <button
              type="button"
              className={`loc-view-btn ${view === "list" ? "active" : ""}`}
              onClick={() => setView("list")}
            >
              {t("List", "قائمة")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loc-loading">
            <div className="loc-spinner" />
            {t("Loading locations from backend...", "جارٍ تحميل المواقع من الباك إند...")}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="loc-empty">
            {t("No ministries match the selected filters.", "لا توجد وزارات مطابقة للفلاتر.")}
          </div>
        ) : view === "grid" ? (
          <div className="loc-grid">
            {filteredGroups.map((group) => (
              <button
                type="button"
                key={group.key}
                className="loc-card"
                style={{
                  "--status-color": group.status === "OK" ? "#10b981" : "#ef4444",
                  "--progress": `${group.progress}%`,
                }}
                onClick={() => setSelectedGroup(group)}
              >
                <div className="loc-card-top">
                  <div>
                    <div className="loc-card-title">{group.title}</div>
                    <div className="loc-card-sub">
                      {[
                        group.clustersList.slice(0, 2).join(", "),
                        group.zonesList.slice(0, 2).join(", "),
                        group.directionsList.slice(0, 2).join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ") || t("Linked location", "موقع مرتبط")}
                    </div>
                  </div>

                  <span className={`loc-status ${group.status === "OK" ? "loc-status-ok" : "loc-status-bad"}`}>
                    {group.status === "OK" ? t("OK", "سليم") : t("Not OK", "غير سليم")}
                  </span>
                </div>

                <div className="loc-mini-stats">
                  <div>
                    <div className="loc-mini-value">{numberText(group.devicesCount, lang)}</div>
                    <div className="loc-mini-label">{t("Devices", "أجهزة")}</div>
                  </div>

                  <div>
                    <div className="loc-mini-value">{numberText(group.doneDevicesCount, lang)}</div>
                    <div className="loc-mini-label">{t("Done", "تم")}</div>
                  </div>

                  <div>
                    <div className="loc-mini-value">{numberText(group.gatesCount, lang)}</div>
                    <div className="loc-mini-label">{t("Gates", "بوابات")}</div>
                  </div>

                  <div>
                    <div className="loc-mini-value">{numberText(group.inspectionsCount, lang)}</div>
                    <div className="loc-mini-label">{t("Insp.", "فحوصات")}</div>
                  </div>
                </div>

                <div className="loc-progress">
                  <div className="loc-progress-row">
                    <span>{t("Inspected assets", "العناصر المفحوصة")}</span>
                    <span>{group.progress}%</span>
                  </div>
                  <div className="loc-track">
                    <div className="loc-fill" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="loc-panel">
            <div className="loc-panel-head">
              <div>
                <div className="loc-panel-title">{t("Ministry locations", "مواقع الوزارات")}</div>
                <div className="loc-panel-sub">
                  {t("Grouped backend locations with linked data", "مواقع الباك إند مجمعة ومعاها البيانات المرتبطة")}
                </div>
              </div>

              <div className="loc-records">
                {numberText(filteredGroups.length, lang)} {t("records", "سجل")}
              </div>
            </div>

            <div className="loc-table-wrap">
              <table className="loc-table">
                <thead>
                  <tr>
                    <th>{t("Ministry", "الوزارة")}</th>
                    <th>{t("Result", "النتيجة")}</th>
                    <th>{t("Backend rows", "صفوف الباك")}</th>
                    <th>{t("Devices", "الأجهزة")}</th>
                    <th>{t("Inspected", "تم فحصه")}</th>
                    <th>{t("Gates", "البوابات")}</th>
                    <th>{t("Inspections", "الفحوصات")}</th>
                    <th>{t("Progress", "التقدم")}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.key} onClick={() => setSelectedGroup(group)}>
                      <td data-label={t("Ministry", "الوزارة")}>
                        <div className="loc-main-name">{group.title}</div>
                        <div className="loc-main-sub">
                          {[
                            group.clustersList.slice(0, 2).join(", "),
                            group.zonesList.slice(0, 2).join(", "),
                            group.directionsList.slice(0, 2).join(", "),
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </td>

                      <td data-label={t("Result", "النتيجة")}>
                        <Pill type={group.status === "OK" ? "ok" : "bad"}>
                          {group.status === "OK" ? t("OK", "سليم") : t("Not OK", "غير سليم")}
                        </Pill>
                      </td>

                      <td data-label={t("Backend rows", "صفوف الباك")}>{numberText(group.subLocations.length, lang)}</td>
                      <td data-label={t("Devices", "الأجهزة")}>{numberText(group.devicesCount, lang)}</td>
                      <td data-label={t("Inspected", "تم فحصه")}>{numberText(group.doneDevicesCount, lang)}</td>
                      <td data-label={t("Gates", "البوابات")}>{numberText(group.gatesCount, lang)}</td>
                      <td data-label={t("Inspections", "الفحوصات")}>{numberText(group.inspectionsCount, lang)}</td>
                      <td data-label={t("Progress", "التقدم")}>{group.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <LocationDrawer
          group={selectedGroup}
          lang={lang}
          onClose={() => setSelectedGroup(null)}
        />
      </div>
    </>
  );
}

export default ViewerLocationsPage;