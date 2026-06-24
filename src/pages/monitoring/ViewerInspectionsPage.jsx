import React, { useEffect, useMemo, useState } from "react";

const INSPECTIONS_CSS = `
.insp-root *, .insp-root *::before, .insp-root *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.insp-root {
  --primary: #4f46e5;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --week: #8b5cf6;
  --year: #14b8a6;
  --surface: #ffffff;
  --surface2: #f7f8fa;
  --border: rgba(0,0,0,0.07);
  --text: #0f172a;
  --muted: #475569;
  --faint: #94a3b8;
  font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f1f5f9;
  color: var(--text);
  padding: 28px 24px;
  min-height: 100vh;
}

.insp-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.insp-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.insp-refresh-btn {
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

.insp-refresh-btn:hover {
  transform: translateY(-1px);
  background: #4f46e5;
}

.insp-refresh-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
  transform: none;
}

.insp-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  border: 1px solid transparent;
}

.insp-alert--error {
  background: #fff1f2;
  color: #9f1239;
  border-color: #fecdd3;
}

.insp-filter-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.94)),
    radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), transparent 34%);
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 26px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow:
    0 18px 45px rgba(15, 23, 42, 0.08),
    inset 0 1px 0 rgba(255,255,255,0.9);
}

.insp-filter-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.insp-filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.insp-filter-icon {
  width: 36px;
  height: 36px;
  border-radius: 13px;
  background: rgba(79, 70, 229, 0.08);
  color: #4f46e5;
  display: grid;
  place-items: center;
  font-size: 18px;
  font-weight: 900;
}

.insp-filter-title-text {
  font-size: 14px;
  font-weight: 900;
  color: #0f172a;
}

.insp-filter-title-sub {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.insp-filter-result {
  font-size: 12px;
  font-weight: 800;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.16);
  border-radius: 999px;
  padding: 7px 12px;
}

.insp-filter-grid {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(6, minmax(130px, 1fr));
  gap: 12px;
  align-items: end;
}

.insp-filter-field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.insp-filter-field label {
  font-size: 10px;
  font-weight: 900;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  white-space: nowrap;
}

.insp-filter-input,
.insp-filter-select {
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

.insp-filter-input {
  font-weight: 600;
}

.insp-filter-input::placeholder {
  color: #94a3b8;
  font-weight: 500;
}

.insp-filter-input:hover,
.insp-filter-select:hover {
  border-color: #b7c6d8;
  background-color: #ffffff;
}

.insp-filter-input:focus,
.insp-filter-select:focus {
  border-color: #4f46e5;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.13);
}

.insp-filter-select {
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

.insp-filter-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.insp-filter-hint {
  font-size: 12px;
  color: #94a3b8;
}

.insp-filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.insp-filter-btn {
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

.insp-filter-btn-reset {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.insp-filter-btn-ok {
  background: #0f172a;
  color: #ffffff;
  min-width: 78px;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

.insp-filter-btn:hover {
  transform: translateY(-1px);
}

.insp-filter-btn-reset:hover {
  background: #fee2e2;
  color: #b91c1c;
  border-color: #fecaca;
}

.insp-filter-btn-ok:hover {
  background: #4f46e5;
  box-shadow: 0 10px 20px rgba(79, 70, 229, 0.24);
}

.insp-summary {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.insp-summary-tile {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 14px;
  padding: 16px 16px 14px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.insp-summary-tile--clickable {
  cursor: pointer;
  transition: 0.18s ease;
}

.insp-summary-tile--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(15,23,42,0.08);
  border-color: rgba(79, 70, 229, 0.25);
}

.insp-summary-tile__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.insp-summary-tile__val {
  font-size: 28px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
  margin-top: 3px;
}

.insp-summary-tile__label {
  font-size: 11px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 800;
}

.insp-summary-tile__note {
  margin-top: 6px;
  font-size: 10px;
  color: var(--faint);
  font-weight: 700;
}

.insp-panel {
  background: var(--surface);
  border: 0.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

.insp-panel__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 20px 14px;
  border-bottom: 0.5px solid var(--border);
  gap: 12px;
  flex-wrap: wrap;
}

.insp-panel__title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
}

.insp-panel__sub {
  font-size: 12px;
  color: var(--faint);
}

.insp-records {
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  background: var(--surface2);
  border: 0.5px solid var(--border);
  border-radius: 999px;
  padding: 5px 12px;
}

.insp-table-wrap {
  width: 100%;
  overflow-x: auto;
}

.insp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 1180px;
}

.insp-table th {
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

.insp-table td {
  padding: 12px 16px;
  border-bottom: 0.5px solid var(--border);
  color: var(--muted);
  vertical-align: top;
}

.insp-table tr:last-child td {
  border-bottom: none;
}

.insp-table tr:hover td {
  background: #fafbfc;
}

.insp-dev-code {
  font-size: 13px;
  font-weight: 900;
  color: var(--primary);
  letter-spacing: .3px;
}

.insp-dev-name {
  font-size: 11px;
  color: var(--faint);
  margin-top: 3px;
}

.insp-locline {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.55;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  padding: 5px 11px;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: .2px;
}

.badge--ok {
  background: #e6f7f1;
  color: #0f6e56;
}

.badge--not-ok {
  background: #fdecea;
  color: #a32d2d;
}

.problem-preview {
  max-width: 520px;
}

.problem-preview-box {
  border: 1px solid #fecaca;
  background: #fff7f7;
  color: #991b1b;
  border-radius: 14px;
  padding: 10px 12px;
}

.problem-preview-title {
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: #ef4444;
  margin-bottom: 6px;
}

.problem-preview-text {
  font-size: 12px;
  font-weight: 750;
  line-height: 1.6;
  color: #7f1d1d;
  word-break: break-word;
  max-height: 58px;
  overflow: hidden;
}

.problem-preview-empty {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
  border-radius: 14px;
  padding: 10px 12px;
}

.problem-preview-empty .problem-preview-title,
.problem-preview-empty .problem-preview-text {
  color: #94a3b8;
}

.problem-details-btn {
  margin-top: 8px;
  border: 0;
  background: #0f172a;
  color: #fff;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
}

.problem-details-btn:hover {
  background: #4f46e5;
}

.insp-empty,
.insp-loading {
  padding: 40px;
  text-align: center;
  color: var(--faint);
  font-size: 13px;
}

.insp-loading-spinner {
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

.insp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(7px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.insp-modal {
  width: min(1280px, 100%);
  max-height: 94vh;
  overflow: hidden;
  background: #fff;
  border-radius: 26px;
  box-shadow: 0 34px 100px rgba(15,23,42,0.32);
  display: flex;
  flex-direction: column;
}

.insp-modal-head {
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

.insp-modal-title {
  font-size: 22px;
  font-weight: 950;
  color: var(--text);
  margin-bottom: 5px;
  letter-spacing: -0.025em;
}

.insp-modal-sub {
  font-size: 12px;
  color: var(--faint);
  line-height: 1.6;
}

.insp-modal-close {
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

.insp-modal-close:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.insp-modal-body {
  padding: 20px;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.insp-modal-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.insp-modal-stat {
  border: 1px solid rgba(226, 232, 240, 0.95);
  background: #ffffff;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 18px rgba(15,23,42,0.03);
  position: relative;
  overflow: hidden;
}

.insp-modal-stat::before {
  content: "";
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: var(--stat-color, #4f46e5);
}

.insp-modal-stat-label {
  font-size: 10px;
  font-weight: 950;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 8px;
}

.insp-modal-stat-value {
  font-size: 28px;
  font-weight: 950;
  line-height: 1;
}

.history-groups {
  display: grid;
  gap: 16px;
}

.history-group {
  background: #ffffff;
  border: 1px solid rgba(226, 232, 240, 0.95);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(15,23,42,0.04);
}

.history-group-head {
  padding: 14px 16px;
  background:
    linear-gradient(180deg, rgba(248,250,252,.98), rgba(255,255,255,.98));
  border-bottom: 1px solid rgba(226, 232, 240, 0.95);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.history-group-title {
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.history-group-count {
  font-size: 12px;
  font-weight: 950;
  color: #4f46e5;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.16);
  border-radius: 999px;
  padding: 6px 10px;
}

.history-list {
  display: grid;
}

.history-record {
  padding: 16px;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(320px, 1.6fr);
  gap: 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.75);
  align-items: start;
}

.history-record:last-child {
  border-bottom: none;
}

.history-device-code {
  font-size: 15px;
  font-weight: 950;
  color: #4f46e5;
  word-break: break-word;
}

.history-device-name {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 800;
  margin-top: 4px;
}

.history-meta {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.history-meta-line {
  font-size: 12px;
  color: #475569;
  font-weight: 750;
  line-height: 1.45;
}

.history-meta-line span {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-right: 6px;
}

.problem-list {
  display: grid;
  gap: 10px;
}

.problem-item {
  background: #fff7f7;
  border: 1px solid #fecaca;
  border-radius: 16px;
  padding: 12px;
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
}

.problem-number {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #ef4444;
  color: #fff;
  font-weight: 950;
  font-size: 13px;
}

.problem-content {
  min-width: 0;
}

.problem-content-title {
  color: #991b1b;
  font-size: 13px;
  font-weight: 950;
  margin-bottom: 7px;
  word-break: break-word;
}

.problem-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.problem-detail {
  background: #ffffff;
  border: 1px solid rgba(252,165,165,.5);
  border-radius: 12px;
  padding: 8px 10px;
}

.problem-detail-label {
  font-size: 9px;
  font-weight: 950;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: .07em;
  margin-bottom: 4px;
}

.problem-detail-text {
  color: #7f1d1d;
  font-size: 12px;
  font-weight: 750;
  line-height: 1.45;
  word-break: break-word;
}

.problem-done-ids {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.problem-done-id {
  font-size: 10px;
  font-weight: 950;
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 999px;
  padding: 4px 8px;
}

.no-problems {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 14px;
  padding: 12px;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 800;
}


/* Better Box/List view */
.insp-panel-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.insp-view-toggle {
  display: inline-flex;
  gap: 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 4px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.8);
}

.insp-view-btn {
  border: 0;
  height: 32px;
  padding: 0 13px;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 950;
  cursor: pointer;
  transition: .16s ease;
}

.insp-view-btn:hover {
  color: #4f46e5;
}

.insp-view-btn.active {
  background: #0f172a;
  color: #fff;
  box-shadow: 0 8px 18px rgba(15,23,42,.18);
}

.insp-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  padding: 16px;
  background: linear-gradient(180deg,#ffffff 0%,#f8fafc 100%);
}

.insp-box-card {
  border: 1px solid rgba(226,232,240,.95);
  border-top: 4px solid var(--box-color, #4f46e5);
  background:
    radial-gradient(circle at top right, rgba(79,70,229,.06), transparent 32%),
    #fff;
  border-radius: 22px;
  padding: 15px;
  box-shadow: 0 12px 28px rgba(15,23,42,.05);
  transition: .18s ease;
}

.insp-box-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 42px rgba(15,23,42,.09);
  border-color: rgba(79,70,229,.22);
}

.insp-box-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.insp-box-device {
  min-width: 0;
}

.insp-box-code {
  color: #4f46e5;
  font-size: 18px;
  font-weight: 950;
  line-height: 1.15;
  word-break: break-word;
}

.insp-box-name {
  color: #64748b;
  font-size: 12px;
  font-weight: 850;
  margin-top: 5px;
  word-break: break-word;
}

.insp-box-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 12px;
}

.insp-box-mini {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  padding: 10px;
  min-width: 0;
}

.insp-box-mini span {
  display: block;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: .07em;
  margin-bottom: 5px;
}

.insp-box-mini strong {
  display: block;
  color: #0f172a;
  font-size: 12px;
  font-weight: 900;
  line-height: 1.35;
  word-break: break-word;
}

.insp-box-problem {
  margin-top: 12px;
}

.insp-box-actions {
  margin-top: 11px;
  display: flex;
  justify-content: flex-end;
}

.insp-ip-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  border-radius: 999px;
  padding: 5px 9px;
  background: #eaf8ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
  font-size: 11px;
  font-weight: 950;
  line-height: 1;
  white-space: nowrap;
}

.insp-table-ip {
  color: #0369a1;
  font-weight: 900;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
}

@media (max-width: 1450px) {
  .insp-card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insp-filter-grid {
    grid-template-columns: minmax(260px, 2fr) repeat(3, minmax(150px, 1fr));
  }

  .insp-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .insp-summary {
    grid-template-columns: repeat(3, 1fr);
  }

  .insp-modal-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .history-record {
    grid-template-columns: 1fr;
  }

  .problem-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .insp-root {
    padding: 16px 14px;
  }

  .insp-filter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insp-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .insp-filter-actions {
    width: 100%;
  }

  .insp-filter-btn {
    flex: 1;
  }

  .insp-actions {
    width: 100%;
  }

  .insp-refresh-btn {
    width: 100%;
  }
}

@media (max-width: 620px) {
  .insp-card-grid {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .insp-box-info {
    grid-template-columns: 1fr;
  }

  .insp-panel-tools {
    width: 100%;
  }

  .insp-view-toggle {
    width: 100%;
  }

  .insp-view-btn {
    flex: 1;
  }

  .insp-root {
    padding: 14px 10px;
  }

  .insp-filter-card {
    padding: 15px;
    border-radius: 20px;
  }

  .insp-filter-head {
    align-items: stretch;
  }

  .insp-filter-result {
    width: 100%;
    text-align: center;
  }

  .insp-filter-grid {
    grid-template-columns: 1fr;
  }

  .insp-summary {
    grid-template-columns: 1fr;
  }

  .insp-filter-footer {
    align-items: stretch;
  }

  .insp-filter-actions {
    width: 100%;
    flex-direction: column;
  }

  .insp-filter-btn {
    width: 100%;
  }

  .insp-records {
    width: 100%;
    text-align: center;
  }

  .insp-table {
    min-width: 0;
  }

  .insp-table thead {
    display: none;
  }

  .insp-table,
  .insp-table tbody,
  .insp-table tr,
  .insp-table td {
    display: block;
    width: 100%;
  }

  .insp-table tr {
    padding: 12px 14px;
    border-bottom: 1px solid var(--border);
  }

  .insp-table td {
    border-bottom: none;
    padding: 8px 0;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 10px;
    align-items: start;
  }

  .insp-table td::before {
    content: attr(data-label);
    font-size: 10px;
    font-weight: 900;
    text-transform: uppercase;
    color: var(--faint);
  }

  .insp-modal-backdrop {
    padding: 0;
    align-items: end;
  }

  .insp-modal {
    border-radius: 22px 22px 0 0;
    max-height: 92vh;
  }

  .insp-modal-head {
    padding: 16px;
  }

  .insp-modal-body {
    padding: 14px;
  }

  .insp-modal-stats {
    grid-template-columns: 1fr;
  }
}
`;

const TILE_COLORS = {
  total: "#4f46e5",
  ok: "#10b981",
  notOk: "#ef4444",
  today: "#0ea5e9",
  week: "#8b5cf6",
  month: "#f59e0b",
  year: "#14b8a6",
};

const DEFAULT_FILTERS = {
  search: "",
  result: "ALL",
  period: "ALL",
  monthKey: "",
  year: "ALL",
  cluster: "ALL",
  building: "ALL",
  zone: "ALL",
  direction: "ALL",
};

const RESULT_OPTIONS = [
  { key: "ALL", label: "All results" },
  { key: "OK", label: "OK" },
  { key: "NOT_OK", label: "Not OK" },
];

const PERIOD_OPTIONS = [
  { key: "ALL", label: "All time" },
  { key: "TODAY", label: "Today" },
  { key: "WEEK", label: "This week" },
  { key: "MONTH", label: "Selected month" },
  { key: "YEAR", label: "Selected year" },
];

function fmt(iso) {
  if (!iso) return "—";

  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function fmtTime(iso) {
  if (!iso) return "—";

  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";

    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function fmtMonthKey(monthKey) {
  if (!monthKey || !monthKey.includes("-")) return "Selected Month";

  const [year, month] = monthKey.split("-").map(Number);
  const d = new Date(year, month - 1, 1);

  return d.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function fmtHistoryGroup(dateValue, mode) {
  const d = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(d.getTime())) return "No date";

  if (mode === "YEAR") {
    return d.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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
    localStorage.getItem("dashboard_api_base_url") ||
    localStorage.getItem("api_base_url") ||
    sessionStorage.getItem("apiBaseUrl") ||
    sessionStorage.getItem("baseUrl");

  const raw =
    fromProp ||
    fromEnv ||
    fromLocal ||
    "https://acess-backend-production-8856.up.railway.app";

  return raw.replace(/\/+$/, "");
}

function normalizeSearchText(value) {
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

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  if (typeof value !== "string") return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function cleanText(value) {
  let text = String(value || "").trim();

  if (!text) return "";

  text = text
    .replace(/\[\[INSPECTION_SYSTEM_META\]\]\s*\{[\s\S]*?\}\s*$/gi, "")
    .replace(/\[\[INSPECTION_SYSTEM_META\]\][\s\S]*$/gi, "")
    .replace(/technician\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/technicianName\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/performedBy\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/createdBy\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/الفني\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/اسم\s*الفني\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/المهندس\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}

function removeStatusNoise(text) {
  return cleanText(text)
    .replace(/Final\s+Device\s+Condition\s*:\s*(OK|NOT_OK|PARTIAL|NOT_REACHABLE|GOOD|BAD)/gi, "")
    .replace(/beforeDeviceStatus\s*:\s*"?[^,}"]+"?/gi, "")
    .replace(/afterDeviceStatus\s*:\s*"?[^,}"]+"?/gi, "")
    .replace(/حالة الجهاز في البداية\s*[:：-]?\s*[^:]+?(?=حالة الجهاز بعد الحل|الحل|$)/gi, "")
    .replace(/حالة الجهاز بعد الحل\s*[:：-]?\s*[^:]+?(?=الحل|$)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanOptions(list) {
  return [
    ...new Set(
      list
        .filter(Boolean)
        .map((v) => String(v).trim())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b, "ar"));
}

function normalizeResult(value) {
  const raw = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    raw === "OK" ||
    raw === "GOOD" ||
    raw === "VALID" ||
    raw === "PASSED" ||
    raw === "PASS" ||
    raw === "SUCCESS" ||
    raw === "DONE"
  ) {
    return "OK";
  }

  return "NOT_OK";
}

function extractValue(source, labelRegex, stopRegex) {
  const text = String(source || "");
  const labelMatch = text.match(labelRegex);

  if (!labelMatch || labelMatch.index === undefined) return "";

  const start = labelMatch.index + labelMatch[0].length;
  const rest = text.slice(start);
  const stopMatch = rest.match(stopRegex);
  const end = stopMatch && stopMatch.index !== undefined ? stopMatch.index : rest.length;

  return removeStatusNoise(rest.slice(0, end));
}

function extractDoneIds(text) {
  const ids = [];

  String(text || "").replace(/Completed\s+Steps?\s+IDs?\s*[:：]\s*([0-9,\s]+)/gi, (_, group) => {
    String(group)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((id) => ids.push(id));
    return "";
  });

  String(text || "").replace(/completedStepIds?\s*[:：]\s*\[?([0-9,\s]+)\]?/gi, (_, group) => {
    String(group)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .forEach((id) => ids.push(id));
    return "";
  });

  return [...new Set(ids)];
}

function problemFromText(text) {
  const cleaned = removeStatusNoise(text)
    .replace(/Completed\s+Steps?\s+IDs?\s*[:：]\s*[0-9,\s]+/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return null;

  const stop =
    /(?:وصف المشكلة|المشكلة المختارة|تصنيف المشكلة|كود المشكلة المختارة|الحل|Problem Description|Selected Problem|Problem Code|Category|Classification|Solution|Completed Steps)/i;

  const description =
    extractValue(
      cleaned,
      /(?:وصف المشكلة|Problem Description|Issue Description|Description)\s*[:：]\s*/i,
      stop
    ) ||
    extractValue(
      cleaned,
      /(?:المشكلة|Problem|Issue)\s*[:：]\s*/i,
      stop
    );

  const selectedProblem =
    extractValue(
      cleaned,
      /(?:المشكلة المختارة|Selected Problem|Selected Issue)\s*[:：]\s*/i,
      stop
    );

  const category =
    extractValue(
      cleaned,
      /(?:تصنيف المشكلة|Category|Classification|Problem Type)\s*[:：]\s*/i,
      stop
    );

  const code =
    extractValue(
      cleaned,
      /(?:كود المشكلة المختارة|Problem Code|Issue Code|Code)\s*[:：]\s*/i,
      stop
    );

  const solution =
    extractValue(
      cleaned,
      /(?:الحل|Solution|Fix|Action Taken)\s*[:：]\s*/i,
      stop
    );

  const doneIds = extractDoneIds(text);

  const title =
    selectedProblem ||
    description ||
    category ||
    code ||
    cleaned;

  return {
    title: title || "Problem",
    description: description || selectedProblem || cleaned,
    category,
    code,
    solution,
    doneIds,
  };
}

function problemFromObject(obj) {
  if (!obj || typeof obj !== "object") return null;

  const title = cleanText(
    obj.title ||
      obj.name ||
      obj.label ||
      obj.problemTitle ||
      obj.issueTitle ||
      obj.selectedProblem ||
      obj.problem ||
      obj.issue ||
      obj.description ||
      obj.text ||
      obj.reason ||
      ""
  );

  const description = cleanText(
    obj.description ||
      obj.details ||
      obj.problemDescription ||
      obj.issueDescription ||
      obj.problem ||
      obj.issue ||
      obj.reason ||
      obj.note ||
      obj.notes ||
      obj.comment ||
      ""
  );

  const category = cleanText(
    obj.category ||
      obj.classification ||
      obj.type ||
      obj.problemType ||
      obj.issueType ||
      ""
  );

  const code = cleanText(
    obj.code ||
      obj.problemCode ||
      obj.issueCode ||
      obj.selectedCode ||
      obj.stepId ||
      obj.id ||
      ""
  );

  const solution = cleanText(
    obj.solution ||
      obj.fix ||
      obj.action ||
      obj.actionTaken ||
      obj.afterSolution ||
      ""
  );

  const doneIds = [
    ...extractDoneIds(JSON.stringify(obj)),
    ...(Array.isArray(obj.completedStepIds) ? obj.completedStepIds.map(String) : []),
  ];

  if (!title && !description && !category && !code && !solution) return null;

  return {
    title: title || description || category || code || "Problem",
    description: description || title || "No description provided.",
    category,
    code,
    solution,
    doneIds: [...new Set(doneIds)],
  };
}

function asArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  const parsed = parseMaybeJson(value);

  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === "object") return [parsed];

  if (typeof value === "string") return [value];

  if (typeof value === "object") return [value];

  return [];
}

function collectProblemCandidates(source) {
  if (!source) return [];

  const meta =
    parseMaybeJson(source.metadata) ||
    parseMaybeJson(source.extra) ||
    parseMaybeJson(source.completionMetadata) ||
    source.metadata ||
    source.extra ||
    source.completionMetadata ||
    {};

  const candidates = [
    source.problemReasons,
    source.problems,
    source.selectedProblems,
    source.selectedIssues,
    source.completedProblems,
    source.completedSolutions,
    source.completedStepObjects,
    source.completedSteps,
    source.steps,
    source.checklist,
    source.checklistItems,
    source.items,
    source.answers,
    source.responses,
    source.problemReason,
    source.issueReason,
    source.reason,
    source.issue,
    source.problem,
    source.notes,
    source.note,
    source.comment,
    source.comments,
    source.description,
    source.details,

    meta.problemReasons,
    meta.problems,
    meta.selectedProblems,
    meta.selectedIssues,
    meta.completedProblems,
    meta.completedSolutions,
    meta.completedStepObjects,
    meta.completedSteps,
    meta.steps,
    meta.checklist,
    meta.checklistItems,
    meta.items,
    meta.answers,
    meta.responses,
    meta.problemReason,
    meta.issueReason,
    meta.reason,
    meta.issue,
    meta.problem,
    meta.notes,
    meta.comment,
    meta.description,
    meta.details,
  ];

  if (Array.isArray(source.activityLogs)) {
    source.activityLogs.forEach((log) => {
      candidates.push(log.problemReasons);
      candidates.push(log.problems);
      candidates.push(log.completedProblems);
      candidates.push(log.completedSolutions);
      candidates.push(log.steps);
      candidates.push(log.notes);
      candidates.push(log.description);

      const logMeta = parseMaybeJson(log.metadata) || log.metadata || {};
      candidates.push(logMeta.problemReasons);
      candidates.push(logMeta.problems);
      candidates.push(logMeta.completedProblems);
      candidates.push(logMeta.completedSolutions);
      candidates.push(logMeta.steps);
      candidates.push(logMeta.notes);
      candidates.push(logMeta.description);
    });
  }

  return candidates;
}

function getProblemList(item = {}) {
  const rawProblems = [];

  collectProblemCandidates(item).forEach((candidate) => {
    asArray(candidate).forEach((entry) => {
      if (typeof entry === "string") {
        const text = cleanText(entry);
        if (!text) return;

        const chunks = text
          .split(/(?=وصف المشكلة\s*[:：]|Problem Description\s*[:：]|Selected Problem\s*[:：]|المشكلة المختارة\s*[:：])/gi)
          .map((x) => x.trim())
          .filter(Boolean);

        (chunks.length ? chunks : [text]).forEach((chunk) => {
          const p = problemFromText(chunk);
          if (p) rawProblems.push(p);
        });
      } else if (entry && typeof entry === "object") {
        const p = problemFromObject(entry);
        if (p) rawProblems.push(p);
      }
    });
  });

  const fullText = cleanText(
    [
      item.problemReason,
      item.issueReason,
      item.reason,
      item.issue,
      item.problem,
      item.notes,
      item.note,
      item.comment,
      item.comments,
      item.description,
      item.details,
    ]
      .filter(Boolean)
      .join(" ")
  );

  if (fullText) {
    const p = problemFromText(fullText);
    if (p) rawProblems.push(p);
  }

  const dedup = [];
  const seen = new Set();

  rawProblems.forEach((p) => {
    const key = normalizeSearchText(
      [p.title, p.description, p.category, p.code, p.solution].join(" ")
    );

    if (!key || seen.has(key)) return;

    seen.add(key);
    dedup.push(p);
  });

  return dedup.slice(0, 30);
}

function getMainProblemReason(item) {
  const problems = getProblemList(item);

  if (problems.length) {
    return problems[0].description || problems[0].title;
  }

  return cleanText(
    item.problemReason ||
      item.issueReason ||
      item.reason ||
      item.issue ||
      item.problem ||
      item.notes ||
      item.note ||
      item.comment ||
      item.comments ||
      item.description ||
      item.details ||
      ""
  );
}

function getInspectionDateValue(ins) {
  return ins?.inspectedAt || ins?.createdAt || ins?.updatedAt || null;
}

function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function startOfWeek(now = new Date()) {
  const d = startOfToday(now);
  const day = d.getDay();
  const daysFromSaturday = (day + 1) % 7;
  d.setDate(d.getDate() - daysFromSaturday);
  return d;
}

function monthKeyFromDate(value) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function yearFromDate(value) {
  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return "";

  return String(d.getFullYear());
}

function isInPeriod(dateValue, period, filters = DEFAULT_FILTERS, now = new Date()) {
  if (!dateValue) return false;

  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) return false;

  if (period === "TODAY") {
    const start = startOfToday(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return d >= start && d < end;
  }

  if (period === "WEEK") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return d >= start && d < end;
  }

  if (period === "MONTH") {
    return monthKeyFromDate(dateValue) === filters.monthKey;
  }

  if (period === "YEAR") {
    return yearFromDate(dateValue) === filters.year;
  }

  return true;
}

function historyGroupKey(dateValue, mode) {
  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) return "No date";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  if (mode === "YEAR") return `${y}-${m}`;

  return `${y}-${m}-${day}`;
}

function buildHistoryGroups(records, mode) {
  const map = new Map();

  records.forEach((record) => {
    const dateValue = getInspectionDateValue(record);
    const key = historyGroupKey(dateValue, mode);

    if (!map.has(key)) {
      map.set(key, {
        key,
        dateValue,
        records: [],
        ok: 0,
        notOk: 0,
      });
    }

    const group = map.get(key);
    group.records.push(record);

    if (record.result === "OK") {
      group.ok += 1;
    } else {
      group.notOk += 1;
    }
  });

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      records: [...group.records].sort(
        (a, b) =>
          new Date(getInspectionDateValue(b) || 0) -
          new Date(getInspectionDateValue(a) || 0)
      ),
    }))
    .sort((a, b) => new Date(b.dateValue || 0) - new Date(a.dateValue || 0));
}

function normalizeInspection(item = {}) {
  const device = item.device || {};

  const location =
    device.location ||
    item.location ||
    item.deviceLocation ||
    item.place ||
    {};

  const cleanLocation = {
    cluster:
      location.cluster ||
      item.cluster ||
      device.cluster ||
      location.clusterName ||
      item.clusterName ||
      device.clusterName ||
      "",

    building:
      location.building ||
      item.building ||
      device.building ||
      location.buildingName ||
      item.buildingName ||
      device.buildingName ||
      "",

    zone:
      location.zone ||
      item.zone ||
      device.zone ||
      location.zoneName ||
      item.zoneName ||
      device.zoneName ||
      "",

    direction:
      location.direction ||
      item.direction ||
      device.direction ||
      location.side ||
      item.side ||
      device.side ||
      "",
  };

  const deviceCode =
    device.deviceCode ||
    device.code ||
    device.barcode ||
    item.deviceCode ||
    item.code ||
    item.barcode ||
    item.serial ||
    item.gateNo ||
    item.gateCode ||
    `#${item.deviceId || item.gateId || item.id || ""}`;

  const deviceName =
    device.deviceName ||
    device.name ||
    item.deviceName ||
    item.name ||
    item.gateName ||
    (item.gateId ? `Gate ${item.gateId}` : "") ||
    "Unknown asset";

  const serialNumber =
    device.serialNumber ||
    device.serial ||
    item.serialNumber ||
    item.serial ||
    "";

  const ipAddress =
    device.ipAddress ||
    device.ip ||
    item.ipAddress ||
    item.deviceIp ||
    item.ip ||
    item.ip_address ||
    "";

  const result = normalizeResult(
    item.inspectionStatus ||
      item.status ||
      item.result ||
      item.condition ||
      item.finalStatus ||
      item.finalResult
  );

  const problems = result === "NOT_OK" ? getProblemList(item) : [];
  const problemReason =
    result === "NOT_OK" ? getMainProblemReason(item) : "";

  return {
    id: item.id,
    deviceId: item.deviceId || device.id || null,
    gateId: item.gateId || null,

    result,
    problemReason,
    problems,
    raw: item,

    inspectedAt: item.inspectedAt || item.createdAt || item.updatedAt || null,
    createdAt: item.createdAt || item.inspectedAt || item.updatedAt || null,
    updatedAt: item.updatedAt || item.createdAt || item.inspectedAt || null,

    locationText:
      item.locationText ||
      item.locationName ||
      [
        cleanLocation.cluster,
        cleanLocation.building,
        cleanLocation.zone,
        cleanLocation.direction,
      ]
        .filter(Boolean)
        .join(" · "),

    device: {
      id: device.id || item.deviceId || item.gateId,
      deviceCode,
      deviceName,
      serialNumber,
      ipAddress,
      location: cleanLocation,
    },
  };
}

function buildInspectionSearchText(ins) {
  const loc = ins.device?.location || {};

  return normalizeSearchText(
    [
      ins.id,
      ins.deviceId,
      ins.gateId,
      ins.result,
      ins.problemReason,
      ins.problems?.map((p) => [p.title, p.description, p.category, p.code, p.solution].join(" ")).join(" "),
      ins.locationText,
      ins.device?.id,
      ins.device?.deviceCode,
      ins.device?.deviceName,
      ins.device?.serialNumber,
      ins.device?.ipAddress,
      loc.cluster,
      loc.building,
      loc.zone,
      loc.direction,
      fmt(ins.inspectedAt || ins.createdAt),
      fmtTime(ins.inspectedAt || ins.createdAt),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

async function fetchInspectionsFromApi(baseUrl, token) {
  const candidates = [
    `${baseUrl}/inspections`,
    `${baseUrl}/api/inspections`,
    `${baseUrl}/viewer/inspections`,
    `${baseUrl}/dashboard/inspections`,
    `${baseUrl}/dashboard/viewer/inspections`,
  ];

  let lastError = null;

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        lastError = new Error(`${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      const rawList =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.inspections)
          ? data.inspections
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.results)
          ? data.results
          : [];

      return {
        items: rawList.map(normalizeInspection),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("No working inspections endpoint found.");
}

function ResultBadge({ value }) {
  if (value === "OK") {
    return <span className="badge badge--ok">OK</span>;
  }

  return <span className="badge badge--not-ok">Not OK</span>;
}

function ProblemList({ problems }) {
  const list = Array.isArray(problems) ? problems : [];

  if (!list.length) {
    return (
      <div className="no-problems">
        No organized problem data was provided from backend.
      </div>
    );
  }

  return (
    <div className="problem-list">
      {list.map((problem, index) => (
        <div className="problem-item" key={`${problem.title}-${index}`}>
          <div className="problem-number">{index + 1}</div>

          <div className="problem-content">
            <div className="problem-content-title">
              {problem.title || "Problem"}
            </div>

            <div className="problem-detail-grid">
              <div className="problem-detail">
                <div className="problem-detail-label">Problem Description</div>
                <div className="problem-detail-text">
                  {problem.description || "No description provided."}
                </div>
              </div>

              <div className="problem-detail">
                <div className="problem-detail-label">Problem Category</div>
                <div className="problem-detail-text">
                  {problem.category || "—"}
                </div>
              </div>

              <div className="problem-detail">
                <div className="problem-detail-label">Problem Code</div>
                <div className="problem-detail-text">
                  {problem.code || "—"}
                </div>
              </div>

              <div className="problem-detail">
                <div className="problem-detail-label">Technician Selected / Action</div>
                <div className="problem-detail-text">
                  {problem.solution || problem.title || "—"}
                </div>
              </div>
            </div>

            {problem.doneIds?.length ? (
              <div className="problem-done-ids">
                {problem.doneIds.map((id) => (
                  <span className="problem-done-id" key={id}>
                    Done Step ID: {id}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProblemPreview({ inspection, onOpen }) {
  if (inspection.result === "OK") {
    return (
      <div className="problem-preview-empty">
        <div className="problem-preview-title">Problem Reason</div>
        <div className="problem-preview-text">No problem detected.</div>
      </div>
    );
  }

  const count = inspection.problems?.length || 0;

  return (
    <div className="problem-preview">
      <div className="problem-preview-box">
        <div className="problem-preview-title">
          Problem Reason {count ? `(${count})` : ""}
        </div>

        <div className="problem-preview-text">
          {inspection.problemReason || "No problem reason was provided from backend."}
        </div>
      </div>

      <button
        type="button"
        className="problem-details-btn"
        onClick={() => onOpen(inspection)}
      >
        View organized problems
      </button>
    </div>
  );
}

function RecordProblemsModal({ inspection, onClose }) {
  if (!inspection) return null;

  const loc = inspection.device?.location || {};
  const dateValue = getInspectionDateValue(inspection);

  return (
    <div className="insp-modal-backdrop" onMouseDown={onClose}>
      <div className="insp-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="insp-modal-head">
          <div>
            <div className="insp-modal-title">
              Organized Problem Details
            </div>

            <div className="insp-modal-sub">
              {inspection.device?.deviceCode || `#${inspection.deviceId || inspection.gateId || ""}`} ·{" "}
              {fmt(dateValue)} {fmtTime(dateValue)}
            </div>
          </div>

          <button
            className="insp-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="insp-modal-body">
          <div className="history-record" style={{ borderBottom: "none", padding: 0 }}>
            <div>
              <div className="history-device-code">
                {inspection.device?.deviceCode || `#${inspection.deviceId || inspection.gateId || ""}`}
              </div>

              <div className="history-device-name">
                {inspection.device?.deviceName || "Unknown asset"}
              </div>

              <div style={{ marginTop: 10 }}>
                <ResultBadge value={inspection.result} />
              </div>

              <div className="history-meta">
                <div className="history-meta-line">
                  <span>Date</span>
                  {fmt(dateValue)} {fmtTime(dateValue)}
                </div>

                <div className="history-meta-line">
                  <span>Cluster</span>
                  {loc.cluster || "—"}
                </div>

                <div className="history-meta-line">
                  <span>Building</span>
                  {loc.building || "—"}
                </div>

                <div className="history-meta-line">
                  <span>Zone</span>
                  {loc.zone || "—"}
                </div>

                <div className="history-meta-line">
                  <span>Direction</span>
                  {loc.direction || "—"}
                </div>

                <div className="history-meta-line">
                  <span>Serial</span>
                  {inspection.device?.serialNumber || "—"}
                </div>

                <div className="history-meta-line">
                  <span>IP</span>
                  {inspection.device?.ipAddress || "—"}
                </div>
              </div>
            </div>

            <ProblemList problems={inspection.problems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryModal({ title, subtitle, records, mode, onClose, onOpenRecord }) {
  const groups = useMemo(() => buildHistoryGroups(records, mode), [records, mode]);

  const counts = useMemo(() => {
    const c = {
      total: records.length,
      ok: 0,
      notOk: 0,
      problems: 0,
    };

    records.forEach((record) => {
      if (record.result === "OK") {
        c.ok += 1;
      } else {
        c.notOk += 1;
        c.problems += record.problems?.length || 0;
      }
    });

    return c;
  }, [records]);

  return (
    <div className="insp-modal-backdrop" onMouseDown={onClose}>
      <div className="insp-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="insp-modal-head">
          <div>
            <div className="insp-modal-title">{title}</div>
            <div className="insp-modal-sub">{subtitle}</div>
          </div>

          <button
            className="insp-modal-close"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="insp-modal-body">
          <div className="insp-modal-stats">
            <div className="insp-modal-stat" style={{ "--stat-color": TILE_COLORS.total }}>
              <div className="insp-modal-stat-label">Total</div>
              <div className="insp-modal-stat-value" style={{ color: TILE_COLORS.total }}>
                {counts.total}
              </div>
            </div>

            <div className="insp-modal-stat" style={{ "--stat-color": TILE_COLORS.ok }}>
              <div className="insp-modal-stat-label">OK</div>
              <div className="insp-modal-stat-value" style={{ color: TILE_COLORS.ok }}>
                {counts.ok}
              </div>
            </div>

            <div className="insp-modal-stat" style={{ "--stat-color": TILE_COLORS.notOk }}>
              <div className="insp-modal-stat-label">Not OK</div>
              <div className="insp-modal-stat-value" style={{ color: TILE_COLORS.notOk }}>
                {counts.notOk}
              </div>
            </div>

            <div className="insp-modal-stat" style={{ "--stat-color": TILE_COLORS.month }}>
              <div className="insp-modal-stat-label">Total Problems</div>
              <div className="insp-modal-stat-value" style={{ color: TILE_COLORS.month }}>
                {counts.problems}
              </div>
            </div>
          </div>

          {groups.length ? (
            <div className="history-groups">
              {groups.map((group) => (
                <div className="history-group" key={group.key}>
                  <div className="history-group-head">
                    <div>
                      <div className="history-group-title">
                        {fmtHistoryGroup(group.dateValue, mode)}
                      </div>

                      <div style={{ marginTop: 5, fontSize: 11, color: "#94a3b8", fontWeight: 800 }}>
                        OK: {group.ok} · Not OK: {group.notOk}
                      </div>
                    </div>

                    <div className="history-group-count">
                      {group.records.length} inspections
                    </div>
                  </div>

                  <div className="history-list">
                    {group.records.map((record) => {
                      const loc = record.device?.location || {};
                      const dateValue = getInspectionDateValue(record);

                      return (
                        <div
                          className="history-record"
                          key={record.id || `${record.deviceId}-${record.gateId}-${dateValue}`}
                        >
                          <div>
                            <div className="history-device-code">
                              {record.device?.deviceCode || `#${record.deviceId || record.gateId || ""}`}
                            </div>

                            <div className="history-device-name">
                              {record.device?.deviceName || "Unknown asset"}
                            </div>

                            <div style={{ marginTop: 10 }}>
                              <ResultBadge value={record.result} />
                            </div>

                            <div className="history-meta">
                              <div className="history-meta-line">
                                <span>Date</span>
                                {fmt(dateValue)} {fmtTime(dateValue)}
                              </div>

                              <div className="history-meta-line">
                                <span>Location</span>
                                {[loc.cluster, loc.building, loc.zone, loc.direction]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </div>

                              <div className="history-meta-line">
                                <span>Serial</span>
                                {record.device?.serialNumber || "—"}
                              </div>

                              <div className="history-meta-line">
                                <span>IP</span>
                                {record.device?.ipAddress || "—"}
                              </div>
                            </div>
                          </div>

                          {record.result === "OK" ? (
                            <div className="no-problems">
                              No problem detected for this inspection.
                            </div>
                          ) : (
                            <div>
                              <ProblemList problems={record.problems} />

                              <button
                                type="button"
                                className="problem-details-btn"
                                onClick={() => onOpenRecord(record)}
                              >
                                Open full details
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="insp-empty">No inspections found in this period.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ViewerInspectionsPage({
  inspections: inspectionsProp = null,
  apiBaseUrl = "",
}) {
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [historyMode, setHistoryMode] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [view, setView] = useState("box");

  const [inspections, setInspections] = useState(
    Array.isArray(inspectionsProp)
      ? inspectionsProp.map(normalizeInspection)
      : []
  );

  const [loading, setLoading] = useState(!Array.isArray(inspectionsProp));
  const [error, setError] = useState("");

  const baseUrl = useMemo(() => pickBaseUrl(apiBaseUrl), [apiBaseUrl]);

  async function loadInspections() {
    if (Array.isArray(inspectionsProp)) {
      const sortedProp = inspectionsProp
        .map(normalizeInspection)
        .sort(
          (a, b) =>
            new Date(getInspectionDateValue(b) || 0) -
            new Date(getInspectionDateValue(a) || 0)
        );

      setInspections(sortedProp);
      setLoading(false);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = pickToken();
      const result = await fetchInspectionsFromApi(baseUrl, token);

      const sorted = [...result.items].sort(
        (a, b) =>
          new Date(getInspectionDateValue(b) || 0) -
          new Date(getInspectionDateValue(a) || 0)
      );

      setInspections(sorted);
    } catch (err) {
      console.error("Failed to load inspections:", err);
      setError(err?.message || "Failed to load inspections from backend.");
      setInspections([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInspections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, Array.isArray(inspectionsProp) ? inspectionsProp.length : 0]);

  const monthOptions = useMemo(() => {
    const keys = cleanOptions(
      inspections
        .map((ins) => monthKeyFromDate(getInspectionDateValue(ins)))
        .filter(Boolean)
    ).reverse();

    const current = monthKeyFromDate(new Date());

    return cleanOptions([current, ...keys]).reverse();
  }, [inspections]);

  const yearOptions = useMemo(() => {
    const years = cleanOptions(
      inspections
        .map((ins) => yearFromDate(getInspectionDateValue(ins)))
        .filter(Boolean)
    ).reverse();

    const current = yearFromDate(new Date());

    return cleanOptions([current, ...years]).reverse();
  }, [inspections]);

  useEffect(() => {
    setDraftFilters((prev) => {
      const next = { ...prev };

      if (!next.monthKey && monthOptions.length) {
        next.monthKey = monthOptions[0];
      }

      if ((!next.year || next.year === "ALL") && yearOptions.length) {
        next.year = yearOptions[0];
      }

      return next;
    });

    setFilters((prev) => {
      const next = { ...prev };

      if (!next.monthKey && monthOptions.length) {
        next.monthKey = monthOptions[0];
      }

      if ((!next.year || next.year === "ALL") && yearOptions.length) {
        next.year = yearOptions[0];
      }

      return next;
    });
  }, [monthOptions, yearOptions]);

  const options = useMemo(() => {
    const clusters = [];
    const buildings = [];
    const zones = [];
    const directions = [];

    inspections.forEach((ins) => {
      const loc = ins.device?.location || {};
      clusters.push(loc.cluster);
      buildings.push(loc.building);
      zones.push(loc.zone);
      directions.push(loc.direction);
    });

    return {
      clusters: cleanOptions(clusters),
      buildings: cleanOptions(buildings),
      zones: cleanOptions(zones),
      directions: cleanOptions(directions),
    };
  }, [inspections]);

  const filtered = useMemo(() => {
    const query = normalizeSearchText(filters.search);
    const queryWords = query.split(" ").filter(Boolean);

    return inspections.filter((ins) => {
      const loc = ins.device?.location || {};
      const dateValue = getInspectionDateValue(ins);

      if (filters.result !== "ALL" && ins.result !== filters.result) {
        return false;
      }

      if (filters.period !== "ALL" && !isInPeriod(dateValue, filters.period, filters)) {
        return false;
      }

      if (filters.cluster !== "ALL" && loc.cluster !== filters.cluster) {
        return false;
      }

      if (filters.building !== "ALL" && loc.building !== filters.building) {
        return false;
      }

      if (filters.zone !== "ALL" && loc.zone !== filters.zone) {
        return false;
      }

      if (filters.direction !== "ALL" && loc.direction !== filters.direction) {
        return false;
      }

      if (!queryWords.length) {
        return true;
      }

      const haystack = buildInspectionSearchText(ins);
      return queryWords.every((word) => haystack.includes(word));
    });
  }, [inspections, filters]);

  const periodLists = useMemo(() => {
    return {
      TODAY: inspections.filter((ins) =>
        isInPeriod(getInspectionDateValue(ins), "TODAY", filters)
      ),
      WEEK: inspections.filter((ins) =>
        isInPeriod(getInspectionDateValue(ins), "WEEK", filters)
      ),
      MONTH: inspections.filter((ins) =>
        isInPeriod(getInspectionDateValue(ins), "MONTH", filters)
      ),
      YEAR: inspections.filter((ins) =>
        isInPeriod(getInspectionDateValue(ins), "YEAR", filters)
      ),
    };
  }, [inspections, filters]);

  const counts = useMemo(() => {
    const c = {
      total: filtered.length,
      ok: 0,
      notOk: 0,
    };

    filtered.forEach((ins) => {
      if (ins.result === "OK") {
        c.ok += 1;
      } else {
        c.notOk += 1;
      }
    });

    return c;
  }, [filtered]);

  const tiles = [
    {
      key: "total",
      label: "Total",
      val: counts.total,
      color: TILE_COLORS.total,
    },
    {
      key: "ok",
      label: "OK",
      val: counts.ok,
      color: TILE_COLORS.ok,
    },
    {
      key: "notOk",
      label: "Not OK",
      val: counts.notOk,
      color: TILE_COLORS.notOk,
    },
    {
      key: "TODAY",
      label: "Today",
      val: periodLists.TODAY.length,
      color: TILE_COLORS.today,
      note: "Open history",
      clickable: true,
    },
    {
      key: "WEEK",
      label: "This Week",
      val: periodLists.WEEK.length,
      color: TILE_COLORS.week,
      note: "Open history",
      clickable: true,
    },
    {
      key: "MONTH",
      label: fmtMonthKey(filters.monthKey),
      val: periodLists.MONTH.length,
      color: TILE_COLORS.month,
      note: "Open month history",
      clickable: true,
    },
    {
      key: "YEAR",
      label: filters.year || "This Year",
      val: periodLists.YEAR.length,
      color: TILE_COLORS.year,
      note: "Open year history",
      clickable: true,
    },
  ];

  const updateDraft = (key, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    const next = {
      ...DEFAULT_FILTERS,
      monthKey: monthOptions[0] || "",
      year: yearOptions[0] || "ALL",
    };

    setDraftFilters(next);
    setFilters(next);
  };

  const locationParts = (ins) => ({
    cluster: ins.device?.location?.cluster || "",
    building: ins.device?.location?.building || "",
    zone: ins.device?.location?.zone || "",
    direction: ins.device?.location?.direction || "",
  });

  function getHistoryRecords(mode) {
    if (mode === "TODAY") return periodLists.TODAY;
    if (mode === "WEEK") return periodLists.WEEK;
    if (mode === "MONTH") return periodLists.MONTH;
    if (mode === "YEAR") return periodLists.YEAR;
    return [];
  }

  function getHistoryTitle(mode) {
    if (mode === "TODAY") return "Today Inspection History";
    if (mode === "WEEK") return "This Week Inspection History";
    if (mode === "MONTH") return `${fmtMonthKey(filters.monthKey)} Inspection History`;
    if (mode === "YEAR") return `${filters.year} Inspection History`;
    return "Inspection History";
  }

  function getHistorySubtitle(mode) {
    const records = getHistoryRecords(mode);
    const notOk = records.filter((r) => r.result === "NOT_OK").length;
    const problems = records.reduce((sum, r) => sum + (r.problems?.length || 0), 0);

    return `${records.length} inspections · ${notOk} not OK · ${problems} organized problems`;
  }

  return (
    <>
      <style>{INSPECTIONS_CSS}</style>

      <div className="insp-root">
        <div className="insp-topbar">
          <div></div>

          <div className="insp-actions">
            <button
              className="insp-refresh-btn"
              onClick={loadInspections}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {!!error && (
          <div className="insp-alert insp-alert--error">
            Backend connection error: {error}
          </div>
        )}

        <div className="insp-filter-card">
          <div className="insp-filter-head">
            <div className="insp-filter-title">
              <div className="insp-filter-icon">⌕</div>

              <div>
                <div className="insp-filter-title-text">
                  Advanced Inspection Filter
                </div>

                <div className="insp-filter-title-sub">
                  OK / Not OK results with organized problem reasons from backend
                </div>
              </div>
            </div>

            <div className="insp-filter-result">
              {filtered.length} / {inspections.length} records
            </div>
          </div>

          <div className="insp-filter-grid">
            <div className="insp-filter-field">
              <label>Search</label>

              <input
                className="insp-filter-input"
                value={draftFilters.search}
                onChange={(e) => updateDraft("search", e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder="Code, name, serial, building, zone, reason..."
              />
            </div>

            <div className="insp-filter-field">
              <label>Result</label>

              <select
                className="insp-filter-select"
                value={draftFilters.result}
                onChange={(e) => updateDraft("result", e.target.value)}
              >
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Period</label>

              <select
                className="insp-filter-select"
                value={draftFilters.period}
                onChange={(e) => updateDraft("period", e.target.value)}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Month</label>

              <select
                className="insp-filter-select"
                value={draftFilters.monthKey}
                onChange={(e) => updateDraft("monthKey", e.target.value)}
              >
                {monthOptions.map((value) => (
                  <option key={value} value={value}>
                    {fmtMonthKey(value)}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Year</label>

              <select
                className="insp-filter-select"
                value={draftFilters.year}
                onChange={(e) => updateDraft("year", e.target.value)}
              >
                {yearOptions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Cluster</label>

              <select
                className="insp-filter-select"
                value={draftFilters.cluster}
                onChange={(e) => updateDraft("cluster", e.target.value)}
              >
                <option value="ALL">All clusters</option>

                {options.clusters.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Building</label>

              <select
                className="insp-filter-select"
                value={draftFilters.building}
                onChange={(e) => updateDraft("building", e.target.value)}
              >
                <option value="ALL">All buildings</option>

                {options.buildings.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Zone</label>

              <select
                className="insp-filter-select"
                value={draftFilters.zone}
                onChange={(e) => updateDraft("zone", e.target.value)}
              >
                <option value="ALL">All zones</option>

                {options.zones.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            <div className="insp-filter-field">
              <label>Direction</label>

              <select
                className="insp-filter-select"
                value={draftFilters.direction}
                onChange={(e) => updateDraft("direction", e.target.value)}
              >
                <option value="ALL">All directions</option>

                {options.directions.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="insp-filter-footer">
            <div className="insp-filter-hint">
              Choose a month/year, then click the month or year card to open organized history.
            </div>

            <div className="insp-filter-actions">
              <button
                type="button"
                className="insp-filter-btn insp-filter-btn-reset"
                onClick={resetFilters}
              >
                Reset
              </button>

              <button
                type="button"
                className="insp-filter-btn insp-filter-btn-ok"
                onClick={applyFilters}
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        <div className="insp-summary">
          {tiles.map((tile) => (
            <div
              key={tile.key}
              className={`insp-summary-tile${tile.clickable ? " insp-summary-tile--clickable" : ""}`}
              onClick={() => {
                if (tile.clickable) {
                  setHistoryMode(tile.key);
                }
              }}
              role={tile.clickable ? "button" : undefined}
              tabIndex={tile.clickable ? 0 : undefined}
            >
              <div
                className="insp-summary-tile__bar"
                style={{ background: tile.color }}
              />

              <div
                className="insp-summary-tile__val"
                style={{ color: tile.color }}
              >
                {tile.val}
              </div>

              <div className="insp-summary-tile__label">{tile.label}</div>

              {tile.note ? (
                <div className="insp-summary-tile__note">{tile.note}</div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="insp-panel">
          <div className="insp-panel__head">
            <div>
              <div className="insp-panel__title">
                Inspections Result Log
              </div>

              <div className="insp-panel__sub">
                OK / Not OK with organized backend problem reasons
              </div>
            </div>

            <div className="insp-panel-tools">
              <div className="insp-view-toggle" aria-label="Choose view">
                <button
                  type="button"
                  className={`insp-view-btn ${view === "box" ? "active" : ""}`}
                  onClick={() => setView("box")}
                >
                  Box
                </button>

                <button
                  type="button"
                  className={`insp-view-btn ${view === "list" ? "active" : ""}`}
                  onClick={() => setView("list")}
                >
                  List
                </button>
              </div>

              <div className="insp-records">
                {filtered.length} records
              </div>
            </div>
          </div>

          {loading ? (
            <div className="insp-loading">
              <div className="insp-loading-spinner" />
              Loading inspections from backend...
            </div>
          ) : filtered.length ? (
            view === "box" ? (
              <div className="insp-card-grid">
                {filtered.map((ins) => {
                  const loc = locationParts(ins);
                  const dateValue = getInspectionDateValue(ins);

                  return (
                    <article
                      className="insp-box-card"
                      key={ins.id || `${ins.deviceId}-${ins.gateId}-${dateValue}`}
                      style={{ "--box-color": ins.result === "OK" ? TILE_COLORS.ok : TILE_COLORS.notOk }}
                    >
                      <div className="insp-box-head">
                        <div className="insp-box-device">
                          <div className="insp-box-code">
                            {ins.device?.deviceCode || `#${ins.deviceId || ins.gateId || ""}`}
                          </div>

                          <div className="insp-box-name">
                            {ins.device?.deviceName || "Unknown asset"}
                          </div>
                        </div>

                        <ResultBadge value={ins.result} />
                      </div>

                      <div className="insp-box-info">
                        <div className="insp-box-mini">
                          <span>IP Address</span>
                          <strong>
                            <span className="insp-ip-chip">{ins.device?.ipAddress || "—"}</span>
                          </strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Serial</span>
                          <strong>{ins.device?.serialNumber || "—"}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Cluster</span>
                          <strong>{loc.cluster || "—"}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Building</span>
                          <strong>{loc.building || "—"}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Zone</span>
                          <strong>{loc.zone || "—"}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Direction</span>
                          <strong>{loc.direction || "—"}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Date</span>
                          <strong>{fmt(dateValue)} {fmtTime(dateValue)}</strong>
                        </div>

                        <div className="insp-box-mini">
                          <span>Problems</span>
                          <strong>{ins.problems?.length || 0}</strong>
                        </div>
                      </div>

                      <div className="insp-box-problem">
                        <ProblemPreview
                          inspection={ins}
                          onOpen={setSelectedRecord}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
            <div className="insp-table-wrap">
              <table className="insp-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>IP</th>
                    <th>Result</th>
                    <th>Problem Reason</th>
                    <th>Cluster</th>
                    <th>Building</th>
                    <th>Zone</th>
                    <th>Direction</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((ins) => {
                    const loc = locationParts(ins);
                    const dateValue = getInspectionDateValue(ins);

                    return (
                      <tr key={ins.id || `${ins.deviceId}-${ins.gateId}-${dateValue}`}>
                        <td data-label="Device">
                          <div className="insp-dev-code">
                            {ins.device?.deviceCode || `#${ins.deviceId || ins.gateId || ""}`}
                          </div>

                          <div className="insp-dev-name">
                            {ins.device?.deviceName || "Unknown asset"}
                          </div>

                          {ins.device?.serialNumber ? (
                            <div className="insp-dev-name">
                              Serial: {ins.device.serialNumber}
                            </div>
                          ) : null}
                        </td>

                        <td data-label="IP">
                          <span className="insp-table-ip">
                            {ins.device?.ipAddress || "—"}
                          </span>
                        </td>

                        <td data-label="Result">
                          <ResultBadge value={ins.result} />
                        </td>

                        <td data-label="Problem Reason">
                          <ProblemPreview
                            inspection={ins}
                            onOpen={setSelectedRecord}
                          />
                        </td>

                        <td data-label="Cluster">
                          <div className="insp-locline">
                            {loc.cluster || "—"}
                          </div>
                        </td>

                        <td data-label="Building">
                          <div className="insp-locline">
                            {loc.building || "—"}
                          </div>
                        </td>

                        <td data-label="Zone">
                          <div className="insp-locline">
                            {loc.zone || "—"}
                          </div>
                        </td>

                        <td data-label="Direction">
                          <div className="insp-locline">
                            {loc.direction || "—"}
                          </div>
                        </td>

                        <td data-label="Date" style={{ fontSize: 12, color: "var(--faint)" }}>
                          {fmt(dateValue)} {fmtTime(dateValue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )
          ) : (
            <div className="insp-empty">
              No inspections match the selected filters.
            </div>
          )}
        </div>

        {historyMode ? (
          <HistoryModal
            title={getHistoryTitle(historyMode)}
            subtitle={getHistorySubtitle(historyMode)}
            mode={historyMode}
            records={getHistoryRecords(historyMode)}
            onClose={() => setHistoryMode(null)}
            onOpenRecord={setSelectedRecord}
          />
        ) : null}

        {selectedRecord ? (
          <RecordProblemsModal
            inspection={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        ) : null}
      </div>
    </>
  );
}

export default ViewerInspectionsPage;