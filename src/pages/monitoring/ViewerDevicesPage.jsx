import React, { useCallback, useEffect, useMemo, useState } from "react";

/* ─────────────────────────── CSS ─────────────────────────── */
const VIEWER_DEVICES_CSS = `
.vd-root *, .vd-root *::before, .vd-root *::after { box-sizing: border-box; }

.vd-root {
  --dk: #1a2535;
  --blue: #1ca9e1;
  --blue2: #147394;
  --bg: #f0f4f8;
  --card: #ffffff;
  --border: #e2e8f0;
  --text: #0f172a;
  --muted: #64748b;
  --faint: #94a3b8;
  --ok: #10b981;
  --bad: #ef4444;
  --warn: #f97316;
  --new: #0ea5e9;
  --purple: #6366f1;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, "Segoe UI", system-ui, -apple-system, sans-serif;
  display: block;
  width: 100%;
}

/* ── Sidebar styles are kept only for old builds, but the internal SMARTIT sidebar is removed from JSX. */
.vd-sidebar {
  width: 220px;
  min-height: 100vh;
  background: #fff;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

.vd-logo {
  padding: 22px 20px 14px;
  border-bottom: 1px solid var(--border);
}

.vd-logo-text {
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -1px;
  color: var(--dk);
}

.vd-logo-text span { color: var(--blue); }

.vd-logo-sub {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--faint);
  font-weight: 800;
  margin-top: 3px;
}

.vd-nav-label {
  padding: 18px 16px 6px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--faint);
  font-weight: 900;
}

.vd-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  border-radius: 10px;
  margin: 1px 8px;
  transition: .15s;
  border: none;
  background: none;
  width: calc(100% - 16px);
  text-align: left;
}

.vd-nav-item:hover { background: #f8fafc; color: var(--text); }

.vd-nav-item.active {
  background: linear-gradient(135deg, rgba(28,169,225,.12), rgba(20,115,148,.08));
  color: var(--blue2);
  font-weight: 900;
}

.vd-nav-icon { font-size: 16px; width: 20px; text-align: center; }

.vd-sidebar-bottom {
  margin-top: auto;
  padding: 14px;
  border-top: 1px solid var(--border);
}

.vd-refresh-btn {
  width: 100%;
  padding: 9px 14px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: #f8fafc;
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: .15s;
}

.vd-refresh-btn:hover { background: #fff; border-color: var(--blue); color: var(--blue2); }

.vd-lang-btn {
  width: 100%;
  margin-top: 8px;
  padding: 8px 14px;
  border-radius: 10px;
  border: none;
  background: none;
  color: var(--faint);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  text-align: center;
}

/* ── Main ── */
.vd-main { flex: 1; min-width: 0; width: 100%; display: flex; flex-direction: column; }

.vd-topbar {
  background: transparent;
  border-bottom: 0;
  padding: 6px 0 18px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.vd-page-title { font-size: 20px; font-weight: 900; color: var(--text); }

.vd-topbar-actions { display: flex; align-items: center; gap: 10px; }

.vd-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  transition: .15s;
}

.vd-btn:hover { border-color: var(--blue); color: var(--blue2); }

.vd-btn.excel { border-color: #16a34a; color: #16a34a; background: #f0fdf4; }
.vd-btn.excel:hover { background: #dcfce7; }
.vd-btn.pdf { border-color: #dc2626; color: #dc2626; background: #fff1f2; }
.vd-btn.pdf:hover { background: #fee2e2; }

.vd-btn.primary {
  border: 0;
  background: var(--dk);
  color: #fff;
  box-shadow: 0 4px 14px rgba(15,23,42,.2);
}

.vd-btn.primary:hover { background: #263a50; }

.vd-btn:disabled { opacity: .5; cursor: not-allowed; }

.vd-user-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 12px;
}

.vd-user-name { font-weight: 900; color: var(--text); }
.vd-user-role { color: var(--faint); font-weight: 700; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; }

/* ── Content ── */
.vd-content { padding: 0 24px 22px; flex: 1; }

/* ── KPIs ── */
.vd-kpis {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}

.vd-kpi {
  appearance: none;
  text-align: left;
  font-family: inherit;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 1px 4px rgba(15,23,42,.04);
}

.vd-kpi-label {
  font-size: 11px;
  color: var(--muted);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
}

.vd-kpi-value {
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  color: var(--text);
}

.vd-kpi-sub { font-size: 11px; color: var(--faint); font-weight: 700; }

.vd-kpi.ok .vd-kpi-value { color: var(--ok); }
.vd-kpi.bad .vd-kpi-value { color: var(--bad); }
.vd-kpi.accent { border-top: 3px solid var(--blue); }
.vd-kpi.week { border-top: 3px solid var(--purple); }
.vd-kpi.month { border-top: 3px solid var(--warn); }
.vd-kpi.year { border-top: 3px solid var(--new); }
.vd-kpi.clickable { cursor: pointer; transition: .18s ease; }
.vd-kpi.clickable:hover { transform: translateY(-2px); border-color: rgba(28,169,225,.35); box-shadow: 0 12px 28px rgba(15,23,42,.08); }
.vd-kpi.clickable:active { transform: translateY(0); }
.vd-kpi.week .vd-kpi-value { color: var(--purple); }
.vd-kpi.month .vd-kpi-value { color: var(--warn); }
.vd-kpi.year .vd-kpi-value { color: var(--new); }

/* ── Filter box ── */
.vd-filter-box {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 18px;
  margin-bottom: 18px;
  box-shadow: 0 1px 4px rgba(15,23,42,.04);
}

.vd-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.vd-filter-title { font-size: 14px; font-weight: 900; color: var(--text); display: flex; align-items: center; gap: 8px; }

.vd-filter-count {
  font-size: 12px;
  font-weight: 800;
  color: var(--blue2);
  background: rgba(28,169,225,.08);
  border: 1px solid rgba(28,169,225,.2);
  border-radius: 999px;
  padding: 4px 10px;
}

.vd-filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: 12px;
  align-items: end;
}

.vd-filter-grid-month {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  align-items: end;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.vd-field label {
  display: block;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  font-weight: 900;
  margin-bottom: 6px;
}

.vd-input, .vd-select {
  width: 100%;
  height: 40px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: var(--text);
  border-radius: 10px;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
  font-weight: 700;
  transition: .15s;
}

.vd-input:focus, .vd-select:focus {
  border-color: var(--blue);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(28,169,225,.12);
}

.vd-filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 14px;
  justify-content: space-between;
  flex-wrap: wrap;
}

.vd-filter-summary { font-size: 12px; color: var(--muted); font-weight: 700; }

/* ── Device section header ── */
.vd-devices-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.vd-devices-title { font-size: 15px; font-weight: 900; color: var(--text); }
.vd-devices-sub { font-size: 12px; color: var(--muted); font-weight: 700; }

.vd-view-toggle {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 3px;
}

.vd-toggle-btn {
  padding: 6px 12px;
  border-radius: 8px;
  border: none;
  background: none;
  color: var(--muted);
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.vd-toggle-btn.active {
  background: #fff;
  color: var(--text);
  box-shadow: 0 1px 4px rgba(15,23,42,.10);
}

/* ── Grid view ── */
.vd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 16px;
}

/* ── List view ── */
.vd-list-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; border: 1px solid var(--border); box-shadow: 0 1px 4px rgba(15,23,42,.04); }

.vd-list-table thead tr { background: #f8fafc; border-bottom: 2px solid var(--border); }

.vd-list-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .07em;
  color: var(--muted);
  font-weight: 900;
  white-space: nowrap;
}

.vd-list-table td {
  padding: 11px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  border-top: 1px solid #f1f5f9;
  vertical-align: middle;
}

.vd-list-table tr:hover td { background: #f8fcff; }

.vd-list-code { font-weight: 900; font-size: 13px; }
.vd-list-name { color: var(--muted); font-size: 12px; margin-top: 2px; }

/* ── Card ── */
.vd-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(15,23,42,.04);
  transition: .18s;
}

.vd-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15,23,42,.09); }
.vd-card.old { border-color: #fed7aa; border-top: 3px solid var(--warn); }
.vd-card.new { border-color: #bae6fd; border-top: 3px solid var(--new); }
.vd-card.has-replacement { border-top: 3px solid var(--blue); }

.vd-card-head {
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.vd-card-icon {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 900; color: #475569;
  flex-shrink: 0;
}

.vd-card-code { font-size: 15px; font-weight: 900; color: var(--text); }
.vd-card-name { font-size: 12px; font-weight: 700; color: var(--muted); margin-top: 2px; }
.vd-card-serial { font-size: 11px; color: var(--faint); font-weight: 700; margin-top: 4px; }

.vd-card-badge-row {
  display: flex; gap: 6px; align-items: center;
  padding: 8px 16px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;
}

.vd-badge {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 999px; padding: 4px 9px;
  font-size: 10px; text-transform: uppercase; font-weight: 900;
}

.vd-badge.ok { background: #ecfdf5; color: #047857; }
.vd-badge.bad { background: #fef2f2; color: #dc2626; }
.vd-badge.warn { background: #fff7ed; color: #c2410c; }
.vd-badge.new-tag { background: #e0f2fe; color: #0369a1; }
.vd-badge.gray { background: #f1f5f9; color: #475569; }

.vd-card-body {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: #f8fafc;
}

.vd-stat span { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: .06em; color: var(--faint); font-weight: 900; margin-bottom: 3px; }
.vd-stat strong { font-size: 12px; font-weight: 800; color: var(--text); overflow-wrap: anywhere; }

.vd-problem-block {
  grid-column: 1/-1;
  border: 1px solid #fecaca;
  background: #fff7f7;
  border-radius: 10px;
  padding: 9px 11px;
}

.vd-problem-title { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; color: #dc2626; margin-bottom: 6px; }
.vd-problem-item { display: flex; gap: 6px; align-items: flex-start; margin-bottom: 4px; font-size: 11px; color: #7f1d1d; font-weight: 800; }
.vd-problem-num { width: 18px; height: 18px; border-radius: 50%; background: #ef4444; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; flex-shrink: 0; margin-top: 1px; }

.vd-ok-block { grid-column: 1/-1; border: 1px solid #bbf7d0; background: #ecfdf5; color: #047857; border-radius: 10px; padding: 8px 11px; font-size: 11px; font-weight: 800; }

.vd-change-block { grid-column: 1/-1; border: 1px solid #dbeafe; background: #fff; border-radius: 10px; padding: 10px 11px; display: grid; gap: 5px; }
.vd-change-row { display: grid; grid-template-columns: 52px 1fr; gap: 6px; font-size: 11px; }
.vd-change-row span { font-size: 9px; font-weight: 900; text-transform: uppercase; color: var(--faint); }
.vd-change-row strong { font-weight: 800; color: var(--text); }

.vd-replace-flag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 999px; background: #eaf8ff; color: #0369a1; border: 1px solid #bae6fd; font-size: 10px; font-weight: 900; text-transform: uppercase; margin-top: 5px; }

.vd-card-ribbon {
  padding: 8px 14px;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  font-size: 11px;
  font-weight: 900;
  display: flex;
  justify-content: space-between;
}

.vd-card-ribbon.old { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
.vd-card-ribbon.new { background: #eaf8ff; color: #0369a1; border-color: #bae6fd; }

.vd-card-actions {
  padding: 12px 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  border-top: 1px solid #f1f5f9;
}

.vd-card-actions.single { grid-template-columns: 1fr; }

.vd-readmore {
  border: 1px solid rgba(99,102,241,.3);
  color: var(--purple);
  background: #fff;
  border-radius: 10px;
  min-height: 38px;
  font-weight: 900;
  font-size: 13px;
  cursor: pointer;
  transition: .15s;
}

.vd-readmore:hover { background: #eef2ff; }

.vd-icon-btn {
  width: 38px; height: 38px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, var(--dk), var(--blue));
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(28,169,225,.22);
  transition: .15s;
}

.vd-icon-btn:hover { transform: scale(1.05); }

.vd-status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 5px; }

/* ── Empty / loading ── */
.vd-empty, .vd-loading {
  grid-column: 1/-1;
  padding: 42px;
  border: 1px dashed #cbd5e1;
  background: #fff;
  border-radius: 16px;
  text-align: center;
  color: var(--muted);
  font-weight: 800;
}

/* ── Alert ── */
.vd-alert {
  margin-bottom: 14px;
  border-radius: 12px;
  padding: 11px 14px;
  border: 1px solid #fecaca;
  background: #fff1f2;
  color: #991b1b;
  font-size: 13px;
  font-weight: 800;
}

/* ── Modal ── */
.vd-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15,23,42,.6);
  backdrop-filter: blur(6px);
  display: grid; place-items: center; padding: 18px;
}

.vd-modal {
  width: min(1280px, 96vw);
  max-height: 93vh;
  overflow: hidden;
  display: flex; flex-direction: column;
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 40px 100px rgba(0,0,0,.32);
}

.vd-modal-head {
  padding: 18px 22px;
  background: linear-gradient(135deg, var(--dk), var(--blue2), var(--blue));
  color: #fff;
  display: flex; justify-content: space-between; align-items: flex-start; gap: 14px;
  position: sticky;
  top: 0;
  z-index: 50;
}

.vd-modal-title { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
.vd-modal-sub { color: rgba(255,255,255,.8); font-size: 12px; font-weight: 700; }

.vd-close {
  width: 40px; height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.12);
  color: #fff; font-size: 22px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}

.vd-modal-body {
  padding: 18px 20px;
  overflow: auto;
  background: linear-gradient(180deg, #fff, #f8fafc);
}

.vd-compare {
  display: grid;
  grid-template-columns: 1fr 56px 1fr;
  gap: 14px;
  align-items: stretch;
  margin-bottom: 16px;
}

.vd-compare-card {
  border: 1px solid var(--border);
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
}

.vd-compare-card.old { border-color: #fed7aa; }
.vd-compare-card.new { border-color: #bae6fd; }

.vd-compare-title {
  padding: 12px 14px;
  font-size: 14px;
  font-weight: 900;
  border-bottom: 1px solid var(--border);
}

.vd-compare-card.old .vd-compare-title { color: #c2410c; background: #fff7ed; }
.vd-compare-card.new .vd-compare-title { color: #0369a1; background: #eaf8ff; }

.vd-info-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.vd-info-table th { width: 130px; text-align: left; color: var(--muted); background: #f8fafc; text-transform: uppercase; letter-spacing: .04em; font-size: 9px; font-weight: 900; padding: 9px 10px; border-top: 1px solid #f1f5f9; }
.vd-info-table td { color: var(--text); font-size: 12px; font-weight: 800; padding: 9px 10px; border-top: 1px solid #f1f5f9; overflow-wrap: anywhere; }

.vd-arrow-circle {
  width: 48px; height: 48px; margin: auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--dk), var(--blue));
  color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 900;
  box-shadow: 0 8px 24px rgba(28,169,225,.24);
}

.vd-history-section {
  margin-top: 16px;
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
}

.vd-history-head {
  padding: 14px 16px;
  background: linear-gradient(135deg, #f8fcff, #eaf8ff);
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
}

.vd-history-title { font-size: 15px; font-weight: 900; }
.vd-history-sub { font-size: 11px; color: var(--muted); font-weight: 700; margin-top: 3px; }

.vd-history-count {
  background: rgba(99,102,241,.08);
  border: 1px solid rgba(99,102,241,.15);
  color: var(--purple);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 900;
}

.vd-history-item {
  padding: 13px 16px;
  border-bottom: 1px solid #f1f5f9;
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
}

.vd-history-item:last-child { border-bottom: none; }
.vd-history-date { font-weight: 900; color: var(--text); font-size: 12px; }
.vd-history-meta { color: var(--muted); font-size: 11px; font-weight: 700; line-height: 1.6; }
.vd-history-note { margin-top: 6px; border: 1px solid #e2e8f0; background: #f8fafc; padding: 8px 10px; border-radius: 10px; color: #334155; font-size: 11px; font-weight: 700; line-height: 1.5; }

/* ── Replacement log modal ── */
.vd-replog-filter {
  display: grid;
  grid-template-columns: 1fr 130px;
  gap: 12px;
  margin-bottom: 16px;
}

/* ── Print / export styles ── */
@media print {
  .vd-sidebar, .vd-topbar-actions, .vd-view-toggle, .vd-filter-actions, .vd-card-actions { display: none !important; }
  .vd-root { display: block; }
  .vd-main { width: 100%; }
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .vd-kpis { grid-template-columns: repeat(3, 1fr); }
  .vd-filter-grid { grid-template-columns: 1fr 1fr; }
  .vd-compare { grid-template-columns: 1fr; }
  .vd-arrow-circle { transform: rotate(90deg); }
}

@media (max-width: 720px) {
  .vd-sidebar { display: none; }
  .vd-content { padding: 14px; }
  .vd-kpis, .vd-filter-grid, .vd-filter-grid-month { grid-template-columns: 1fr; }
  .vd-card-body { grid-template-columns: 1fr; }
  .vd-history-item { grid-template-columns: 1fr; }
  .vd-backdrop { padding: 0; align-items: flex-end; }
  .vd-modal { width: 100%; border-radius: 18px 18px 0 0; max-height: 94vh; }
  .vd-list-table { font-size: 11px; }
}
`;

/* ─────────────────── constants / helpers ─────────────────── */
const DEFAULT_API_BASE = "https://acess-backend-production-8856.up.railway.app";

function getBaseUrl(apiBaseUrl = "") {
  const raw =
    apiBaseUrl ||
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_BASE_URL) ||
    (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) ||
    localStorage.getItem("dashboard_api_base_url") ||
    localStorage.getItem("api_base_url") ||
    localStorage.getItem("apiBaseUrl") ||
    DEFAULT_API_BASE;
  return String(raw).replace(/\/+$/, "");
}

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    ""
  );
}

const VIEWER_DEVICES_CACHE_KEY = "viewer_devices_page_cache_v12";

function readViewerDevicesCache() {
  try {
    const raw = localStorage.getItem(VIEWER_DEVICES_CACHE_KEY);
    if (!raw) return { devices: [], inspections: [], replacements: [] };
    const parsed = JSON.parse(raw);
    return {
      devices: Array.isArray(parsed?.devices) ? parsed.devices.map(normalizeDevice) : [],
      inspections: Array.isArray(parsed?.inspections) ? parsed.inspections.map(normalizeInspection) : [],
      replacements: Array.isArray(parsed?.replacements) ? parsed.replacements.map(normalizeReplacement) : [],
    };
  } catch {
    return { devices: [], inspections: [], replacements: [] };
  }
}

function writeViewerDevicesCache(devices = [], inspections = [], replacements = []) {
  try {
    localStorage.setItem(
      VIEWER_DEVICES_CACHE_KEY,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        devices,
        inspections,
        replacements,
      })
    );
  } catch {
    // cache is optional
  }
}

async function requestJson(baseUrl, path, token) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) throw new Error(data?.message || data?.error || `${response.status} ${response.statusText}`);
  return data;
}

async function fetchFirst(baseUrl, paths, token) {
  let lastError = null;
  for (const path of paths) {
    try { return await requestJson(baseUrl, path, token); } catch (err) { lastError = err; }
  }
  throw lastError || new Error("No working endpoint found");
}

function toArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  const bags = [payload, payload?.data, payload?.result, payload?.payload].filter(Boolean);
  for (const bag of bags) {
    if (Array.isArray(bag)) return bag;
    for (const key of keys) { if (Array.isArray(bag?.[key])) return bag[key]; }
    for (const key of ["items", "rows", "records", "results", "data"]) { if (Array.isArray(bag?.[key])) return bag[key]; }
  }
  return [];
}

function clean(value, fallback = "—") {
  const t = String(value ?? "").trim();
  return t && t !== "null" && t !== "undefined" ? t : fallback;
}

function text(value) { return String(value ?? "").trim(); }

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[^\p{L}\p{N}.]+/gu, " ").replace(/\s+/g, " ").trim();
}

function normId(value) { return String(value ?? "").trim().toLowerCase(); }

function fmtDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function statusToResult(status) {
  const s = String(status || "").toUpperCase();
  if (["OK", "GOOD", "PASSED", "PASS", "COMPLETED", "ACTIVE"].includes(s)) return "OK";
  return "NOT_OK";
}

function getInspectionDate(item) {
  return item?.inspectedAt || item?.createdAt || item?.updatedAt || item?.inspectionDate || item?.scanDate || null;
}

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const daysFromSaturday = (day + 1) % 7;
  d.setDate(d.getDate() - daysFromSaturday);
  return d;
}

function isInspectionInPeriod(inspection, period, now = new Date()) {
  const dateValue = getInspectionDate(inspection);
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return false;

  let start = startOfDay(now);
  let end = new Date(start);
  end.setDate(end.getDate() + 1);

  if (period === "WEEK") {
    start = startOfWeek(now);
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  }

  if (period === "MONTH") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  if (period === "YEAR") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }

  return d >= start && d < end;
}

function periodTitle(period) {
  if (period === "TODAY") return "Today Inspection History";
  if (period === "WEEK") return "This Week Inspection History";
  if (period === "MONTH") return "This Month Inspection History";
  if (period === "YEAR") return "This Year Inspection History";
  return "Inspection History";
}

function periodSubtitle(period) {
  const now = new Date();
  if (period === "TODAY") return fmtDate(now);
  if (period === "WEEK") {
    const start = startOfWeek(now);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${fmtDate(start)} → ${fmtDate(end)}`;
  }
  if (period === "MONTH") {
    return now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  if (period === "YEAR") {
    return String(now.getFullYear());
  }
  return "";
}

function getLocationFromAny(obj = {}) {
  const loc = obj.location || obj.locationSnapshot || obj.parsedLoc || {};
  return {
    cluster: text(obj.gateCluster || obj.cluster || loc.cluster || loc.clusterName),
    building: text(obj.gateBuilding || obj.building || loc.building || loc.buildingName),
    zone: text(obj.gateZone || obj.zone || loc.zone || loc.zoneName),
    direction: text(obj.gateDirection || obj.direction || loc.direction || loc.side),
    lane: text(obj.gateNo || obj.lane || loc.lane || loc.gateNo),
  };
}

function locationText(parts = {}) {
  return [parts.cluster, parts.building, parts.zone, parts.direction, parts.lane].filter(Boolean).join(" - ");
}

function locationKey(parts = {}) {
  return normalizeText([parts.cluster, parts.building, parts.zone, parts.direction, parts.lane].join(" "));
}

function normalizeDevice(item = {}) {
  const deviceType = item.deviceType || item.type || {};
  const inspections = Array.isArray(item.inspections) ? item.inspections : [];
  const loc = getLocationFromAny(item);
  return {
    id: item.id,
    deviceId: item.deviceId || item.device_id || item.hardwareDeviceId || item.assetId || item.id,
    deviceCode: item.deviceCode || item.code || item.barcode || `DEV-${item.id || ""}`,
    deviceName: item.deviceName || item.name || "Unknown Device",
    serialNumber: item.serialNumber || item.serial || "",
    barcode: item.barcode || "",
    ipAddress: item.ipAddress || item.ip || item.ip_address || "",
    firmware: item.firmware || item.firmwareVersion || "",
    manufacturer: item.manufacturer || "",
    modelNumber: item.modelNumber || "",
    currentStatus: String(item.currentStatus || item.status || "OK").toUpperCase(),
    deviceTypeName: deviceType.name || item.deviceTypeName || "",
    parsedLoc: loc,
    relatedInspections: inspections.map(normalizeInspection),
    inspectionsCount: item.inspectionsCount ?? item._count?.inspections ?? inspections.length ?? 0,
    lastInspectionAt: item.lastInspectionAt || item.latestInspectionAt || inspections[0]?.createdAt || null,
    _sourceDeviceId: item.id,
  };
}

function normalizeInspection(item = {}) {
  const device = item.device || {};
  const safeLocation = item.locationSnapshot || item.location || device.location || {};
  const loc = getLocationFromAny({ ...safeLocation, location: safeLocation });
  return {
    id: item.id,
    deviceId: item.deviceId || item.device_id || device.id || null,
    deviceCode: item.deviceCode || item.device_code || device.deviceCode || device.code || "",
    serialNumber: item.serialNumber || item.serial || item.deviceSerial || device.serialNumber || device.serial || "",
    barcode: item.barcode || item.deviceBarcode || device.barcode || "",
    inspectionStatus: String(item.inspectionStatus || item.status || item.result || "LOGGED").toUpperCase(),
    inspectedAt: getInspectionDate(item),
    notes: item.notes || item.issueReason || item.reason || item.problem || item.issue || item.description || "",
    locationSnapshot: loc,
  };
}

function cleanInspectionText(value) {
  return String(value || "")
    .replace(/\[\[INSPECTION_SYSTEM_META\]\]\s*\{[\s\S]*?\}\s*$/gi, "")
    .replace(/\[\[INSPECTION_SYSTEM_META\]\][\s\S]*$/gi, "")
    .replace(/technician\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/الفني\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/اسم\s*الفني\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/المهندس\s*[:：-]?\s*[^,|؛\n]+/gi, "")
    .replace(/Completed\s+Steps?\s+IDs?\s*[:：]\s*[0-9,\s]+/gi, "")
    .replace(/Final\s+Device\s+Condition\s*[:：]\s*(OK|NOT_OK|GOOD|BAD)/gi, "")
    .replace(/beforeDeviceStatus\s*[:：]\s*"?[^,}"]+"?/gi, "")
    .replace(/afterDeviceStatus\s*[:：]\s*"?[^,}"]+"?/gi, "")
    .replace(/\s+/g, " ").trim();
}

function extractBetween(source, startRegex, endRegex) {
  const t = String(source || "");
  const match = t.match(startRegex);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = t.slice(start);
  const end = rest.match(endRegex);
  const value = end && end.index !== undefined ? rest.slice(0, end.index) : rest;
  return cleanInspectionText(value);
}

function extractProblemReasons(inspection = {}) {
  const result = statusToResult(inspection.inspectionStatus || inspection.status || inspection.result);
  if (result === "OK") return [];
  const raw = cleanInspectionText(
    [inspection.problemReason, inspection.issueReason, inspection.reason, inspection.problem, inspection.issue, inspection.notes, inspection.description, inspection.details, inspection.comment]
      .filter(Boolean).join(" ")
  );
  if (!raw) return ["No problem reason was saved from backend."];
  const stop = /(?:وصف المشكلة|المشكلة المختارة|تصنيف المشكلة|كود المشكلة|الحل|Problem Description|Selected Problem|Problem Code|Category|Solution|Action Taken|$)/i;
  const description = extractBetween(raw, /(?:وصف المشكلة|Problem Description|Issue Description|Description)\s*[:：]\s*/i, stop) || extractBetween(raw, /(?:المشكلة|Problem|Issue)\s*[:：]\s*/i, stop);
  const selected = extractBetween(raw, /(?:المشكلة المختارة|Selected Problem|Selected Issue)\s*[:：]\s*/i, stop);
  const category = extractBetween(raw, /(?:تصنيف المشكلة|Category|Classification|Problem Type)\s*[:：]\s*/i, stop);
  const codeValue = extractBetween(raw, /(?:كود المشكلة المختارة|Problem Code|Issue Code|Code)\s*[:：]\s*/i, stop);
  const solution = extractBetween(raw, /(?:الحل|Solution|Fix|Action Taken)\s*[:：]\s*/i, stop);
  const parts = [description, selected, category ? `Category: ${category}` : "", codeValue ? `Code: ${codeValue}` : "", solution ? `Action: ${solution}` : ""].filter(Boolean);
  const fallbackParts = raw.split(/\s*(?:\||؛|;|\n|\r|•|-\s+(?=\p{L}))/gu).map(cleanInspectionText).filter(Boolean).filter((line) => !/^(ok|good|سليم)$/i.test(line));
  const list = parts.length ? parts : fallbackParts.length ? fallbackParts : [raw];
  const seen = new Set();
  return list.map((item) => item.replace(/^[:：\-\s]+/, "").trim()).filter(Boolean).filter((item) => { const key = normalizeText(item); if (!key || seen.has(key)) return false; seen.add(key); return true; }).slice(0, 8);
}

function latestInspectionForDevice(device = {}) {
  const list = Array.isArray(device.relatedInspections) ? device.relatedInspections : [];
  return list.slice().sort((a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0))[0] || null;
}

function inspectionResultForDevice(device = {}) {
  const latest = latestInspectionForDevice(device);
  if (!latest) return "NOT_INSPECTED";
  return statusToResult(latest.inspectionStatus || latest.status || latest.result);
}

function getObjectLocationCandidate(obj = {}) {
  if (!obj || typeof obj !== "object") return {};
  return getLocationFromAny({ ...obj, ...(obj.location || {}), ...(obj.locationSnapshot || {}), ...(obj.oldLocation || {}), ...(obj.newLocation || {}), ...(obj.beforeLocation || {}), ...(obj.afterLocation || {}) });
}

function hasAnyLocation(parts = {}) { return Boolean(parts.cluster || parts.building || parts.zone || parts.direction || parts.lane); }

function firstLocation(...locations) { return locations.find(hasAnyLocation) || { cluster: "", building: "", zone: "", direction: "", lane: "" }; }

function replacementMatchesDevice(record = {}, device = {}) {
  const keys = deviceKeys(device);
  const replacementKeys = [record.oldDeviceId, record.newDeviceId, getReplacementCode(record, "old"), getReplacementCode(record, "new"), getReplacementSerial(record, "old"), getReplacementSerial(record, "new"), getReplacementBarcode(record, "old"), getReplacementBarcode(record, "new"), getReplacementIp(record, "old"), getReplacementIp(record, "new"), record.oldIpAddress].map(normId).filter(Boolean);
  return keys.some((key) => replacementKeys.includes(key));
}

function attachReplacementMarkers(rows = [], replacements = []) {
  return rows.map((row) => {
    const related = replacements.find((record) => replacementMatchesDevice(record, row));
    if (!related) return { ...row, _hasReplacement: false };
    return { ...row, _hasReplacement: true, _replacementRecord: related, _replacementRecordId: related.id, _oldLocationText: locationText(getReplacementLocationParts(related, "old")), _newLocationText: locationText(getReplacementLocationParts(related, "new")) };
  });
}

function parseMaybeJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try { return JSON.parse(String(value)); } catch { return null; }
}

function getReplacementMeta(record = {}) {
  const candidates = [record.metadata, record.meta, record.extra, record.notes, record.reason];
  for (const candidate of candidates) {
    const parsed = parseMaybeJson(candidate);
    if (!parsed || typeof parsed !== "object") continue;
    if (parsed.oldSnapshot || parsed.newSnapshot || parsed.beforeSnapshot || parsed.afterSnapshot) return parsed;
    if (parsed.replacementMeta) return parsed.replacementMeta;
  }
  return {};
}

function getSnapshot(record = {}, side = "old") {
  const meta = getReplacementMeta(record);
  if (side === "old") return record.oldSnapshot || record.oldDeviceSnapshot || record.beforeSnapshot || record.old_device_snapshot || record.oldLocationSnapshot || meta.oldSnapshot || meta.beforeSnapshot || meta.oldDeviceSnapshot || {};
  return record.newSnapshot || record.newDeviceSnapshot || record.afterSnapshot || record.new_device_snapshot || record.newLocationSnapshot || meta.newSnapshot || meta.afterSnapshot || meta.newDeviceSnapshot || {};
}

function getReplacementDevice(record = {}, side = "old") { return side === "old" ? record.oldDevice || {} : record.newDevice || {}; }

function getReplacementLocationParts(record, side) {
  const meta = getReplacementMeta(record);
  const snapshot = getSnapshot(record, side);
  const device = getReplacementDevice(record, side);
  const snapshotLoc = getLocationFromAny(snapshot || {});
  const deviceLoc = getLocationFromAny(device || {});
  const directLoc = { cluster: record?.[`${side}Cluster`] || record?.[`${side}GateCluster`] || record?.[`${side}LocationCluster`] || "", building: record?.[`${side}Building`] || record?.[`${side}GateBuilding`] || record?.[`${side}LocationBuilding`] || "", zone: record?.[`${side}Zone`] || record?.[`${side}GateZone`] || record?.[`${side}LocationZone`] || "", direction: record?.[`${side}Direction`] || record?.[`${side}GateDirection`] || record?.[`${side}LocationDirection`] || "", lane: record?.[`${side}Lane`] || record?.[`${side}GateNo`] || record?.[`${side}LocationLane`] || "" };
  const explicitOldLoc = firstLocation(getObjectLocationCandidate(record.oldLocationSnapshot), getObjectLocationCandidate(record.beforeLocationSnapshot), getObjectLocationCandidate(record.oldLocation), getObjectLocationCandidate(record.beforeLocation), getObjectLocationCandidate(record.fromLocation), getObjectLocationCandidate(meta.oldLocationSnapshot), getObjectLocationCandidate(meta.beforeLocationSnapshot), getObjectLocationCandidate(meta.oldLocation), getObjectLocationCandidate(meta.beforeLocation), getObjectLocationCandidate(meta.fromLocation), directLoc);
  const explicitNewLoc = firstLocation(getObjectLocationCandidate(record.newLocationSnapshot), getObjectLocationCandidate(record.afterLocationSnapshot), getObjectLocationCandidate(record.newLocation), getObjectLocationCandidate(record.afterLocation), getObjectLocationCandidate(record.toLocation), getObjectLocationCandidate(meta.newLocationSnapshot), getObjectLocationCandidate(meta.afterLocationSnapshot), getObjectLocationCandidate(meta.newLocation), getObjectLocationCandidate(meta.afterLocation), getObjectLocationCandidate(meta.toLocation), directLoc);
  const selected = side === "old" ? firstLocation(explicitOldLoc, snapshotLoc, deviceLoc) : firstLocation(explicitNewLoc, snapshotLoc, deviceLoc);
  return { cluster: text(selected.cluster), building: text(selected.building), zone: text(selected.zone), direction: text(selected.direction), lane: text(selected.lane) };
}

function getReplacementField(record, side, key, fallback = "") {
  const snapshot = getSnapshot(record, side);
  const device = getReplacementDevice(record, side);
  return snapshot?.[key] || device?.[key] || record?.[`${side}${key[0].toUpperCase()}${key.slice(1)}`] || fallback;
}

function getReplacementCode(record, side) { return clean(getReplacementField(record, side, "deviceCode") || getReplacementField(record, side, "code") || getReplacementField(record, side, "barcode") || getReplacementField(record, side, "serialNumber") || (side === "old" ? record.oldDeviceId : record.newDeviceId)); }
function getReplacementName(record, side) { return clean(getReplacementField(record, side, "deviceName") || getReplacementField(record, side, "name"), "Unknown Device"); }
function getReplacementIp(record, side) { return clean(getReplacementField(record, side, "ipAddress") || record.oldIpAddress || record.ipAddress, ""); }
function getReplacementSerial(record, side) { return clean(getReplacementField(record, side, "serialNumber") || getReplacementField(record, side, "serial"), ""); }
function getReplacementBarcode(record, side) { return clean(getReplacementField(record, side, "barcode"), ""); }
function getReplacementFirmware(record, side) { return clean(getReplacementField(record, side, "firmware") || getReplacementField(record, side, "firmwareVersion"), ""); }

function normalizeReplacement(item = {}) {
  return { ...item, id: item.id, oldDeviceId: item.oldDeviceId || item.oldDevice?.id || item.oldSnapshot?.id || null, newDeviceId: item.newDeviceId || item.newDevice?.id || item.newSnapshot?.id || null, status: String(item.status || "COMPLETED").toUpperCase(), replacementDate: item.replacementDate || item.createdAt || item.updatedAt || null, reason: item.reason || "", notes: item.notes || "" };
}

function deviceKeys(device = {}) { return [device._sourceDeviceId, device.id, device.deviceId, device.deviceCode, device.code, device.barcode, device.serialNumber, device.serial].map(normId).filter(Boolean); }

function inspectionKeys(inspection = {}) { return [inspection.deviceId, inspection.deviceCode, inspection.barcode, inspection.serialNumber, inspection.deviceBarcode, inspection.deviceSerial].map(normId).filter(Boolean); }

function matchInspectionToDevice(inspection, device) { return inspectionKeys(inspection).some((key) => deviceKeys(device).includes(key)); }

function mergeUniqueInspections(primary = [], secondary = []) {
  const map = new Map();
  [...primary, ...secondary].forEach((item, index) => {
    const inspection = normalizeInspection(item);
    const key = normId(inspection.id) || `${normId(inspection.deviceId)}-${inspection.inspectedAt || index}-${inspection.inspectionStatus}`;
    if (!map.has(key)) map.set(key, inspection);
  });
  return [...map.values()].sort((a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0));
}

function splitHistoryForReplacement(record, side, inspections = []) {
  const replacementDate = new Date(record.replacementDate || record.createdAt || 0);
  const snapshotDevice = { id: side === "old" ? record.oldDeviceId : record.newDeviceId, deviceCode: getReplacementCode(record, side), serialNumber: getReplacementSerial(record, side), barcode: getReplacementBarcode(record, side) };
  const fromDevice = getReplacementDevice(record, side)?.inspections || [];
  const oldLocKey = locationKey(getReplacementLocationParts(record, "old"));
  const newLocKey = locationKey(getReplacementLocationParts(record, "new"));
  const matched = inspections.filter((inspection) => matchInspectionToDevice(inspection, snapshotDevice)).filter((inspection) => {
    const d = new Date(getInspectionDate(inspection) || 0);
    const insLocKey = locationKey(inspection.locationSnapshot || {});
    const hasGoodDate = !isNaN(d) && !isNaN(replacementDate);
    if (side === "old") { if (insLocKey && oldLocKey && insLocKey === oldLocKey) return true; if (hasGoodDate) return d <= replacementDate; return true; }
    if (insLocKey && newLocKey && insLocKey === newLocKey) return true;
    if (hasGoodDate) return d >= replacementDate;
    return true;
  });
  return mergeUniqueInspections(matched, fromDevice);
}

function attachInspectionData(devices = [], inspections = []) {
  return devices.map((device) => {
    const related = mergeUniqueInspections(inspections.filter((inspection) => matchInspectionToDevice(inspection, device)), device.relatedInspections || []);
    return { ...device, relatedInspections: related, inspectionsCount: Math.max(Number(device.inspectionsCount) || 0, related.length), lastInspectionAt: getInspectionDate(related[0]) || device.lastInspectionAt };
  });
}

function buildReplacementVirtualDevice(record, side, inspections = []) {
  const snapshot = getSnapshot(record, side);
  const snapshotMissing = !snapshot || Object.keys(snapshot).length === 0;
  const related = splitHistoryForReplacement(record, side, inspections);
  const loc = getReplacementLocationParts(record, side);
  return { id: `replacement-${record.id || "x"}-${side}-${side === "old" ? record.oldDeviceId : record.newDeviceId}`, _virtualReplacement: true, _replacementSide: side === "old" ? "OLD" : "NEW", _replacementRecord: record, _replacementRecordId: record.id, _snapshotMissing: snapshotMissing, _oldLocationText: locationText(getReplacementLocationParts(record, "old")), _newLocationText: locationText(getReplacementLocationParts(record, "new")), _sourceDeviceId: side === "old" ? record.oldDeviceId : record.newDeviceId, deviceCode: getReplacementCode(record, side), deviceName: getReplacementName(record, side), serialNumber: getReplacementSerial(record, side), barcode: getReplacementBarcode(record, side), ipAddress: getReplacementIp(record, side), firmware: getReplacementFirmware(record, side), manufacturer: getReplacementField(record, side, "manufacturer"), modelNumber: getReplacementField(record, side, "modelNumber"), currentStatus: side === "old" ? "OLD_SNAPSHOT" : "NEW_CURRENT", parsedLoc: loc, relatedInspections: related, inspectionsCount: related.length, lastInspectionAt: getInspectionDate(related[0]) || null };
}

function buildReplacementRows(replacements = [], inspections = []) {
  return replacements.flatMap((record) => [buildReplacementVirtualDevice(record, "old", inspections), buildReplacementVirtualDevice(record, "new", inspections)]);
}

function replacementSearchText(record) {
  return normalizeText([record.id, record.oldDeviceId, record.newDeviceId, record.oldIpAddress, record.status, record.reason, record.notes, getReplacementCode(record, "old"), getReplacementCode(record, "new"), getReplacementName(record, "old"), getReplacementName(record, "new"), getReplacementIp(record, "old"), getReplacementIp(record, "new"), getReplacementSerial(record, "old"), getReplacementSerial(record, "new"), getReplacementBarcode(record, "old"), getReplacementBarcode(record, "new"), locationText(getReplacementLocationParts(record, "old")), locationText(getReplacementLocationParts(record, "new")), "old new before after replacement snapshot"].join(" "));
}

function rowSearchText(row) {
  return normalizeText([row.id, row._sourceDeviceId, row.deviceCode, row.deviceName, row.serialNumber, row.barcode, row.ipAddress, row.firmware, row.manufacturer, row.modelNumber, row.currentStatus, row._replacementSide, row._replacementRecordId, row._oldLocationText, row._newLocationText, row.parsedLoc?.cluster, row.parsedLoc?.building, row.parsedLoc?.zone, row.parsedLoc?.direction, row.parsedLoc?.lane, row._replacementRecord ? replacementSearchText(row._replacementRecord) : ""].join(" "));
}

function uniqueOptions(rows, key) { return [...new Set(rows.map((row) => row.parsedLoc?.[key]).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar")); }

/* ─────────────────── Export helpers ─────────────────── */
function devicesToCsvRows(devices) {
  const headers = ["Device Code", "Device Name", "Serial", "IP Address", "Cluster", "Building", "Zone", "Direction", "Lane", "Status", "Inspections", "Last Inspection"];
  const rows = devices.map((d) => [
    clean(d.deviceCode), clean(d.deviceName), clean(d.serialNumber), clean(d.ipAddress),
    clean(d.parsedLoc?.cluster), clean(d.parsedLoc?.building), clean(d.parsedLoc?.zone),
    clean(d.parsedLoc?.direction), clean(d.parsedLoc?.lane),
    d.currentStatus, d.inspectionsCount || 0, fmtDate(d.lastInspectionAt),
  ]);
  return [headers, ...rows];
}

function exportExcel(devices) {
  const rows = devicesToCsvRows(devices);
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `devices_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function exportPdf(devices, monthLabel) {
  const rows = devicesToCsvRows(devices);
  const tableRows = rows.slice(1).map((row) => `<tr>${row.map((cell, i) => `<td style="${i===0?"font-weight:900;":""}padding:6px 8px;border-bottom:1px solid #eee;font-size:12px;">${cell}</td>`).join("")}</tr>`).join("");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Devices Export</title>
<style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1{font-size:22px;margin-bottom:4px}p{color:#64748b;font-size:13px;margin-bottom:20px}table{width:100%;border-collapse:collapse}th{background:#1a2535;color:#fff;padding:8px;font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:.05em}tr:nth-child(even){background:#f8fafc}@media print{body{padding:0}}</style></head>
<body><h1>Global Device Directory</h1><p>${monthLabel ? `Monthly Inspection Report – ${monthLabel} · ` : ""}Exported ${fmtDate(new Date())} · ${rows.length - 1} devices</p>
<table><thead><tr>${rows[0].map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
  const win = window.open("", "_blank");
  if (!win) { alert("Allow pop-ups to export PDF."); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); };
}

/* ─────────────────── Sub-components ─────────────────── */

function DeviceCard({ device, onOpen, onOpenReplacement }) {
  const isOld = device._replacementSide === "OLD";
  const isNew = device._replacementSide === "NEW";
  const isReplacement = device._virtualReplacement;
  const canOpenReplacement = isReplacement || device._hasReplacement;
  const latestInspection = latestInspectionForDevice(device);
  const inspectionResult = inspectionResultForDevice(device);
  const problems = latestInspection ? extractProblemReasons(latestInspection) : [];
  const result = isReplacement ? inspectionResult : statusToResult(device.currentStatus);
  const statusColor = isOld ? "#f97316" : isNew ? "#0ea5e9" : result === "OK" ? "#10b981" : "#ef4444";
  const statusRing = isOld ? "#ffedd5" : isNew ? "#e0f2fe" : result === "OK" ? "#dcfce7" : "#fee2e2";

  return (
    <article className={`vd-card ${isOld ? "old" : ""} ${isNew ? "new" : ""} ${canOpenReplacement && !isReplacement ? "has-replacement" : ""}`}>
      <div className="vd-card-head">
        <div style={{ display: "flex", gap: 10, flex: 1, minWidth: 0 }}>
          <div className="vd-card-icon">{String(device.deviceName || "D").charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="vd-card-code">{clean(device.deviceCode)}</div>
            <div className="vd-card-name">{clean(device.deviceName, "Unknown Device")}</div>
            <div className="vd-card-serial">SN: {clean(device.serialNumber)}</div>
            {canOpenReplacement && !isReplacement ? <div className="vd-replace-flag">📱 Replacement linked</div> : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <span className="vd-status-dot" style={{ background: statusColor, boxShadow: `0 0 0 4px ${statusRing}` }} />
          {canOpenReplacement ? <button type="button" className="vd-icon-btn" onClick={() => onOpenReplacement(device)} title="Replacement details" style={{ width: 30, height: 30, fontSize: 14 }}>📱</button> : null}
        </div>
      </div>

      {isReplacement ? (
        <div className={`vd-card-ribbon ${isOld ? "old" : "new"}`}>
          <span>{isOld ? "OLD LOCATION SNAPSHOT" : "NEW / CURRENT LOCATION"}</span>
          <span>#{clean(device._replacementRecordId)}</span>
        </div>
      ) : null}

      <div className="vd-card-badge-row">
        <span className={`vd-badge ${inspectionResult === "OK" ? "ok" : inspectionResult === "NOT_INSPECTED" ? "gray" : "bad"}`}>
          {latestInspection ? (inspectionResult === "OK" ? "✓ OK" : "✗ Not OK") : "Not Inspected"}
        </span>
        <span style={{ fontSize: 11, color: "var(--faint)", fontWeight: 700 }}>Last: {fmtDate(device.lastInspectionAt)}</span>
      </div>

      <div className="vd-card-body">
        <div className="vd-stat"><span>Cluster</span><strong>{clean(device.parsedLoc?.cluster)}</strong></div>
        <div className="vd-stat"><span>Building</span><strong>{clean(device.parsedLoc?.building)}</strong></div>
        <div className="vd-stat"><span>Zone</span><strong>{clean(device.parsedLoc?.zone)}</strong></div>
        <div className="vd-stat"><span>Direction</span><strong>{clean(device.parsedLoc?.direction)}</strong></div>
        <div className="vd-stat"><span>Lane</span><strong>{clean(device.parsedLoc?.lane)}</strong></div>
        <div className="vd-stat"><span>Scan Logs</span><strong>{device.inspectionsCount || 0}</strong></div>
        <div className="vd-stat"><span>IP Address</span><strong style={{ fontFamily: "monospace" }}>{clean(device.ipAddress, "DHCP")}</strong></div>
        <div className="vd-stat"><span>Serial</span><strong>{clean(device.serialNumber)}</strong></div>

        {latestInspection && inspectionResult === "NOT_OK" ? (
          <div className="vd-problem-block">
            <div className="vd-problem-title">Problem Reason</div>
            {problems.slice(0, 3).map((problem, i) => (
              <div className="vd-problem-item" key={i}>
                <span className="vd-problem-num">{i + 1}</span>
                <strong>{problem}</strong>
              </div>
            ))}
          </div>
        ) : latestInspection && inspectionResult === "OK" ? (
          <div className="vd-ok-block">✓ Latest inspection is OK. No problem reason saved.</div>
        ) : null}

        {(isReplacement || canOpenReplacement) ? (
          <div className="vd-change-block">
            <div className="vd-change-row"><span>Before</span><strong>{clean(device._oldLocationText)}</strong></div>
            <div className="vd-change-row"><span>After</span><strong>{clean(device._newLocationText)}</strong></div>
            {device._snapshotMissing ? <div className="vd-change-row"><span>Note</span><strong>Old snapshot was not saved correctly.</strong></div> : null}
          </div>
        ) : null}
      </div>

      <div className={`vd-card-actions ${canOpenReplacement ? "" : "single"}`}>
        <button type="button" className="vd-readmore" onClick={() => onOpen(device)}>Read More Details →</button>
        {canOpenReplacement ? <button type="button" className="vd-icon-btn" onClick={() => onOpenReplacement(device)} title="Replacement">📱</button> : null}
      </div>
    </article>
  );
}

function DeviceListRow({ device, onOpen, onOpenReplacement }) {
  const isOld = device._replacementSide === "OLD";
  const isNew = device._replacementSide === "NEW";
  const inspectionResult = inspectionResultForDevice(device);
  const result = device._virtualReplacement ? inspectionResult : statusToResult(device.currentStatus);
  const statusColor = isOld ? "#f97316" : isNew ? "#0ea5e9" : result === "OK" ? "#10b981" : "#ef4444";

  return (
    <tr>
      <td>
        <div className="vd-list-code">{clean(device.deviceCode)}</div>
        <div className="vd-list-name">{clean(device.deviceName)}</div>
      </td>
      <td>
        <span className={`vd-badge ${inspectionResult === "OK" ? "ok" : inspectionResult === "NOT_INSPECTED" ? "gray" : "bad"}`} style={{ fontSize: 10 }}>
          {inspectionResult === "OK" ? "OK" : inspectionResult === "NOT_INSPECTED" ? "N/A" : "Not OK"}
        </span>
      </td>
      <td><span style={{ fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: "#f1f5f9", color: statusColor }}>{isOld ? "OLD" : isNew ? "NEW" : result}</span></td>
      <td>{clean(device.parsedLoc?.cluster)}</td>
      <td>{clean(device.parsedLoc?.building)}</td>
      <td>{clean(device.parsedLoc?.zone)}</td>
      <td>{clean(device.parsedLoc?.direction)}</td>
      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{fmtDate(device.lastInspectionAt)}</td>
      <td style={{ fontFamily: "monospace", fontSize: 12 }}>{clean(device.serialNumber)}</td>
      <td>{device.inspectionsCount || 0}</td>
      <td>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#6366f1", fontWeight: 800, fontSize: 11, cursor: "pointer" }} onClick={() => onOpen(device)}>Details</button>
          {(device._virtualReplacement || device._hasReplacement) ? <button type="button" style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #bae6fd", background: "#eaf8ff", color: "#0369a1", fontWeight: 800, fontSize: 11, cursor: "pointer" }} onClick={() => onOpenReplacement(device)}>📱</button> : null}
        </div>
      </td>
    </tr>
  );
}

function InfoTable({ title, device, className = "" }) {
  return (
    <section className={`vd-compare-card ${className}`}>
      <div className="vd-compare-title">{title}</div>
      <table className="vd-info-table">
        <tbody>
          {[["Device Code", clean(device?.deviceCode)], ["Device Name", clean(device?.deviceName)], ["Serial", clean(device?.serialNumber)], ["Barcode", clean(device?.barcode)], ["IP Address", clean(device?.ipAddress)], ["Firmware", clean(device?.firmware)], ["Cluster", clean(device?.parsedLoc?.cluster)], ["Building", clean(device?.parsedLoc?.building)], ["Zone", clean(device?.parsedLoc?.zone)], ["Direction", clean(device?.parsedLoc?.direction)], ["Lane", clean(device?.parsedLoc?.lane)], ["Last Inspection", fmtDateTime(device?.lastInspectionAt)], ["Inspection Logs", device?.inspectionsCount || 0]].map(([label, value]) => (
            <tr key={label}><th>{label}</th><td>{value}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function HistorySection({ title, subtitle, history }) {
  return (
    <section className="vd-history-section">
      <div className="vd-history-head">
        <div>
          <div className="vd-history-title">{title}</div>
          <div className="vd-history-sub">{subtitle}</div>
        </div>
        <div className="vd-history-count">{history.length} inspections</div>
      </div>
      {history.length === 0 ? (
        <div className="vd-empty" style={{ margin: 16 }}>No inspection history found for this period.</div>
      ) : (
        <div>
          {history.map((inspection, index) => {
            const loc = inspection.locationSnapshot || {};
            const result = statusToResult(inspection.inspectionStatus);
            return (
              <div className="vd-history-item" key={inspection.id || `${inspection.deviceId}-${index}`}>
                <div>
                  <div className="vd-history-date">{fmtDateTime(getInspectionDate(inspection))}</div>
                  <div style={{ marginTop: 8 }}><span className={`vd-badge ${result === "OK" ? "ok" : "bad"}`}>{result === "OK" ? "OK" : "Not OK"}</span></div>
                </div>
                <div>
                  <div className="vd-history-meta">Location: {clean(locationText(loc))}<br />Serial: {clean(inspection.serialNumber)}</div>
                  {result === "OK" ? (
                    <div className="vd-history-note">OK inspection. No problem reason saved.</div>
                  ) : (
                    <div className="vd-problem-block" style={{ marginTop: 8 }}>
                      <div className="vd-problem-title">Problem Reason</div>
                      {extractProblemReasons(inspection).map((problem, pIndex) => (
                        <div className="vd-problem-item" key={pIndex}><span className="vd-problem-num">{pIndex + 1}</span><strong>{problem}</strong></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DetailsModal({ device, onClose }) {
  if (!device) return null;
  const record = device._replacementRecord;
  let oldVirtual = null;
  let newVirtual = null;
  if (record) {
    oldVirtual = buildReplacementVirtualDevice(record, "old", device._allInspections || []);
    newVirtual = buildReplacementVirtualDevice(record, "new", device._allInspections || []);
  }
  return (
    <div className="vd-backdrop" onMouseDown={onClose}>
      <div className="vd-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="vd-modal-head">
          <div>
            <div className="vd-modal-title">{device._virtualReplacement ? "Replacement Record Details" : clean(device.deviceCode)}</div>
            <div className="vd-modal-sub">{device._virtualReplacement ? "Old and new location, inspection history split by location/date. Technician names hidden." : "Device details and inspection history. Technician names hidden."}</div>
          </div>
          <button type="button" className="vd-close" onClick={onClose}>×</button>
        </div>
        <div className="vd-modal-body">
          {record ? (
            <>
              <div className="vd-compare">
                <InfoTable title="Old Device / Before Location" device={oldVirtual} className="old" />
                <div className="vd-arrow-circle">→</div>
                <InfoTable title="New Device / Current Location" device={newVirtual} className="new" />
              </div>
              <div className="vd-change-block" style={{ marginBottom: 16 }}>
                <div className="vd-change-row"><span>Before</span><strong>{clean(oldVirtual._oldLocationText)}</strong></div>
                <div className="vd-change-row"><span>After</span><strong>{clean(newVirtual._newLocationText)}</strong></div>
                <div className="vd-change-row"><span>Date</span><strong>{fmtDateTime(record.replacementDate || record.createdAt)}</strong></div>
                <div className="vd-change-row"><span>Reason</span><strong>{clean(record.reason)}</strong></div>
              </div>
              <HistorySection title="Old Location Inspection History" subtitle="All inspections linked to the old location before the device moved." history={oldVirtual.relatedInspections || []} />
              <HistorySection title="New / Current Location Inspection History" subtitle="All inspections linked to the new location after the device moved." history={newVirtual.relatedInspections || []} />
            </>
          ) : (
            <>
              <InfoTable title="Device Information" device={device} />
              <HistorySection title="Device Inspection History" subtitle="Inspection history linked to this device." history={device.relatedInspections || []} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReplacementLogModal({ records, inspections, onClose }) {
  const rows = useMemo(() => buildReplacementRows(records, inspections), [records, inspections]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
    const q = normalizeText(search);
    if (!q) return rows;
    return rows.filter((row) => rowSearchText(row).includes(q));
  }, [rows, search]);
  return (
    <div className="vd-backdrop" onMouseDown={onClose}>
      <div className="vd-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="vd-modal-head">
          <div>
            <div className="vd-modal-title">Replacement Log</div>
            <div className="vd-modal-sub">Search by IP to see old and new cards together.</div>
          </div>
          <button type="button" className="vd-close" onClick={onClose}>×</button>
        </div>
        <div className="vd-modal-body">
          <div className="vd-replog-filter">
            <div className="vd-field">
              <label>Search</label>
              <input className="vd-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="IP, serial, device code, old/new location..." />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <div style={{ height: 40, display: "flex", alignItems: "center", padding: "0 14px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", fontWeight: 800, fontSize: 13, color: "var(--muted)" }}>{filtered.length} cards</div>
            </div>
          </div>
          <div className="vd-grid">
            {filtered.map((row) => (
              <DeviceCard key={row.id} device={{ ...row, _allInspections: inspections }} onOpen={(item) => setSelected(item)} onOpenReplacement={(item) => setSelected(item)} />
            ))}
          </div>
        </div>
      </div>
      {selected ? <DetailsModal device={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function InspectionPeriodModal({ period, inspections, onClose }) {
  const title = periodTitle(period);
  const subtitle = periodSubtitle(period);
  const sorted = useMemo(
    () => inspections.slice().sort((a, b) => new Date(getInspectionDate(b) || 0) - new Date(getInspectionDate(a) || 0)),
    [inspections]
  );

  const counts = useMemo(() => {
    const ok = sorted.filter((item) => statusToResult(item.inspectionStatus || item.status || item.result) === "OK").length;
    return { total: sorted.length, ok, notOk: sorted.length - ok };
  }, [sorted]);

  return (
    <div className="vd-backdrop" onMouseDown={onClose}>
      <div className="vd-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="vd-modal-head">
          <div>
            <div className="vd-modal-title">{title}</div>
            <div className="vd-modal-sub">{subtitle} · {counts.total} inspections · OK: {counts.ok} · Not OK: {counts.notOk}</div>
          </div>
          <button type="button" className="vd-close" onClick={onClose}>×</button>
        </div>
        <div className="vd-modal-body">
          <HistorySection
            title={title}
            subtitle="OK / Not OK inspection log. Technician names are hidden."
            history={sorted}
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main export ─────────────────── */
export function ViewerDevicesPage({ devices: devicesProp = null, inspections: inspectionsProp = null, lang = "en", apiBaseUrl = "" }) {
  const cachedInitial = useMemo(() => readViewerDevicesCache(), []);

  const [devices, setDevices] = useState(() =>
    Array.isArray(devicesProp) ? devicesProp.map(normalizeDevice) : cachedInitial.devices
  );
  const [inspections, setInspections] = useState(() =>
    Array.isArray(inspectionsProp) ? inspectionsProp.map(normalizeInspection) : cachedInitial.inspections
  );
  const [replacements, setReplacements] = useState(() => cachedInitial.replacements);
  const [loading, setLoading] = useState(() => !Array.isArray(devicesProp) && cachedInitial.devices.length === 0);
  const [error, setError] = useState("");
  const [replacementError, setReplacementError] = useState("");

  /* filters */
  const [search, setSearch] = useState("");
  const [cluster, setCluster] = useState("ALL");
  const [zone, setZone] = useState("ALL");
  const [building, setBuilding] = useState("ALL");
  const [resultFilter, setResultFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [directionFilter, setDirectionFilter] = useState("ALL");

  /* Monthly inspection selector removed: use all loaded inspections for faster first load. */

  /* view mode: grid | list */
  const [viewMode, setViewMode] = useState("grid");

  /* modals */
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showReplacementLog, setShowReplacementLog] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState(null);

  const baseUrl = useMemo(() => getBaseUrl(apiBaseUrl), [apiBaseUrl]);

  const loadData = useCallback(async () => {
    setLoading((devices.length || inspections.length) ? false : true);
    setError("");
    setReplacementError("");
    const token = getToken();
    try {
      const [devResult, insResult, repResult] = await Promise.allSettled([
        Array.isArray(devicesProp) ? Promise.resolve(devicesProp) : fetchFirst(baseUrl, ["/devices", "/api/devices", "/viewer/devices", "/dashboard/devices"], token),
        Array.isArray(inspectionsProp) ? Promise.resolve(inspectionsProp) : fetchFirst(baseUrl, ["/inspections", "/api/inspections", "/viewer/inspections", "/dashboard/inspections"], token),
        fetchFirst(baseUrl, ["/device-replacements", "/api/device-replacements", "/devices/replacements", "/api/devices/replacements"], token),
      ]);
      const loadedInspections = insResult.status === "fulfilled" ? toArray(insResult.value, ["inspections"]).map(normalizeInspection) : [];
      const loadedDevices = devResult.status === "fulfilled" ? toArray(devResult.value, ["devices"]).map(normalizeDevice) : [];
      const loadedReplacements = repResult.status === "fulfilled" ? toArray(repResult.value, ["replacements", "deviceReplacements"]).map(normalizeReplacement) : [];
      if (devResult.status === "rejected") setError(devResult.reason?.message || "Failed to load devices from backend.");
      if (repResult.status === "rejected") setReplacementError("Replacement endpoint is not available yet.");
      const devicesWithInspections = attachInspectionData(loadedDevices, loadedInspections);
      setInspections(loadedInspections);
      setDevices(devicesWithInspections);
      setReplacements(loadedReplacements);
      writeViewerDevicesCache(devicesWithInspections, loadedInspections, loadedReplacements);
    } catch (err) {
      setError(err?.message || "Failed to load viewer devices.");
      setDevices([]); setInspections([]); setReplacements([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, devicesProp, inspectionsProp]);

  useEffect(() => { loadData(); }, [loadData]);

  const inspectionsForMonth = inspections;

  const realRows = useMemo(() => {
    return attachReplacementMarkers(devices, replacements);
  }, [devices, replacements]);

  const replacementRows = useMemo(() => buildReplacementRows(replacements, inspectionsForMonth), [replacements, inspectionsForMonth]);
  const allOptionRows = useMemo(() => [...realRows, ...replacementRows], [realRows, replacementRows]);

  const options = useMemo(() => ({
    clusters: uniqueOptions(allOptionRows, "cluster"),
    buildings: uniqueOptions(allOptionRows, "building"),
    zones: uniqueOptions(allOptionRows, "zone"),
    directions: uniqueOptions(allOptionRows, "direction"),
  }), [allOptionRows]);

  function passesFilters(row) {
    if (cluster !== "ALL" && row.parsedLoc?.cluster !== cluster) return false;
    if (building !== "ALL" && row.parsedLoc?.building !== building) return false;
    if (zone !== "ALL" && row.parsedLoc?.zone !== zone) return false;
    if (directionFilter !== "ALL" && row.parsedLoc?.direction !== directionFilter) return false;
    if (resultFilter !== "ALL") {
      const res = row._virtualReplacement ? inspectionResultForDevice(row) : statusToResult(row.currentStatus);
      if (resultFilter === "OK" && res !== "OK") return false;
      if (resultFilter === "NOT_OK" && res === "OK") return false;
    }
    if (statusFilter !== "ALL") {
      const hasInspection = (row.inspectionsCount || 0) > 0;
      if (statusFilter === "inspected" && !hasInspection) return false;
      if (statusFilter === "not_inspected" && hasInspection) return false;
    }
    return true;
  }

  const filtered = useMemo(() => {
    const q = normalizeText(search);
    if (!q) {
      return realRows.filter(passesFilters).map((row) => ({ ...row, _allInspections: inspectionsForMonth }));
    }
    const virtualMatches = replacementRows.filter((row) => passesFilters(row) && rowSearchText(row).includes(q));
    if (virtualMatches.length) return virtualMatches.map((row) => ({ ...row, _allInspections: inspectionsForMonth }));
    return realRows.filter((row) => passesFilters(row) && rowSearchText(row).includes(q)).map((row) => ({ ...row, _allInspections: inspectionsForMonth }));
  }, [search, realRows, replacementRows, cluster, building, zone, directionFilter, resultFilter, statusFilter, inspectionsForMonth]);

  const periodInspections = useMemo(() => ({
    TODAY: inspectionsForMonth.filter((item) => isInspectionInPeriod(item, "TODAY")),
    WEEK: inspectionsForMonth.filter((item) => isInspectionInPeriod(item, "WEEK")),
    MONTH: inspectionsForMonth.filter((item) => isInspectionInPeriod(item, "MONTH")),
    YEAR: inspectionsForMonth.filter((item) => isInspectionInPeriod(item, "YEAR")),
  }), [inspectionsForMonth]);

  const stats = useMemo(() => {
    const inspected = realRows.filter((row) => Number(row.inspectionsCount) > 0).length;
    const ok = realRows.filter((row) => statusToResult(row.currentStatus) === "OK").length;
    const notOk = realRows.filter((row) => statusToResult(row.currentStatus) !== "OK").length;
    return {
      total: realRows.length,
      ok,
      notOk,
      inspections: inspectionsForMonth.length,
      replacements: replacements.length,
      todayInspections: periodInspections.TODAY.length,
      weekInspections: periodInspections.WEEK.length,
      monthInspections: periodInspections.MONTH.length,
      yearInspections: periodInspections.YEAR.length,
    };
  }, [realRows, inspectionsForMonth, replacements, periodInspections]);

  function openDetails(row) { setSelectedDevice(row); }
  function openReplacement(row) {
    if (row._virtualReplacement) { setSelectedDevice(row); return; }
    const related = replacements.find((record) => { const src = normId(row.id || row.deviceId); return [record.oldDeviceId, record.newDeviceId].map(normId).includes(src); });
    if (related) setSelectedDevice({ ...buildReplacementVirtualDevice(related, "new", inspectionsForMonth), _allInspections: inspectionsForMonth });
  }

  function resetFilters() { setSearch(""); setCluster("ALL"); setBuilding("ALL"); setZone("ALL"); setDirectionFilter("ALL"); setResultFilter("ALL"); setStatusFilter("ALL"); }

  function showAllDevices() { resetFilters(); }
  function showOkDevices() { setResultFilter("OK"); setStatusFilter("ALL"); }
  function showNotOkDevices() { setResultFilter("NOT_OK"); setStatusFilter("ALL"); }
  function openInspectionPeriod(period) { setHistoryPeriod(period); }

  const okCount = filtered.filter((r) => statusToResult(r.currentStatus) === "OK").length;
  const notOkCount = filtered.filter((r) => statusToResult(r.currentStatus) !== "OK").length;

  return (
    <>
      <style>{VIEWER_DEVICES_CSS}</style>
      <div className="vd-root" dir={lang === "ar" ? "rtl" : "ltr"}>
        {/* Content only: internal SMARTIT sidebar removed because the app already has the main sidebar. */}

        {/* ── Main ── */}
        <div className="vd-main">
          {/* Top actions only. The app layout already shows the page title and viewer chip. */}
          <div className="vd-topbar">
            <div className="vd-topbar-actions">
              <button className="vd-btn excel" type="button" onClick={() => exportExcel(filtered)}>
                <span>📊</span> Export Excel
              </button>
              <button className="vd-btn pdf" type="button" onClick={() => exportPdf(filtered, "")}>
                <span>📄</span> Export PDF
              </button>
              <button className="vd-btn primary" type="button" onClick={loadData} disabled={loading}>
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="vd-content">
            {/* Alerts */}
            {error ? <div className="vd-alert">Backend error: {error}</div> : null}
            {replacementError ? <div className="vd-alert">{replacementError}</div> : null}

            {/* KPIs */}
            <div className="vd-kpis">
              <button type="button" className="vd-kpi accent clickable" onClick={showAllDevices}>
                <div className="vd-kpi-label">Total Devices</div>
                <div className="vd-kpi-value">{stats.total}</div>
                <div className="vd-kpi-sub">Click to show all</div>
              </button>
              <button type="button" className="vd-kpi ok clickable" onClick={showOkDevices}>
                <div className="vd-kpi-label">OK</div>
                <div className="vd-kpi-value">{stats.ok}</div>
                <div className="vd-kpi-sub">Click to filter OK</div>
              </button>
              <button type="button" className="vd-kpi bad clickable" onClick={showNotOkDevices}>
                <div className="vd-kpi-label">Not OK</div>
                <div className="vd-kpi-value">{stats.notOk}</div>
                <div className="vd-kpi-sub">Click to filter issues</div>
              </button>
              <button type="button" className="vd-kpi accent clickable" onClick={() => openInspectionPeriod("TODAY")}>
                <div className="vd-kpi-label">Today Inspections</div>
                <div className="vd-kpi-value">{stats.todayInspections}</div>
                <div className="vd-kpi-sub">Open today history</div>
              </button>
              <button type="button" className="vd-kpi week clickable" onClick={() => openInspectionPeriod("WEEK")}>
                <div className="vd-kpi-label">This Week</div>
                <div className="vd-kpi-value">{stats.weekInspections}</div>
                <div className="vd-kpi-sub">Open week history</div>
              </button>
              <button type="button" className="vd-kpi month clickable" onClick={() => openInspectionPeriod("MONTH")}>
                <div className="vd-kpi-label">This Month</div>
                <div className="vd-kpi-value">{stats.monthInspections}</div>
                <div className="vd-kpi-sub">Open month history</div>
              </button>
              <button type="button" className="vd-kpi year clickable" onClick={() => openInspectionPeriod("YEAR")}>
                <div className="vd-kpi-label">This Year</div>
                <div className="vd-kpi-value">{stats.yearInspections}</div>
                <div className="vd-kpi-sub">Open year history</div>
              </button>
            </div>

            {/* Filter */}
            <div className="vd-filter-box">
              <div className="vd-filter-header">
                <div className="vd-filter-title">🔍 Advanced Device Filter <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}></span></div>
                <div className="vd-filter-count">🔵 {filtered.length} / {realRows.length} records</div>
              </div>

              <div className="vd-filter-grid">
                <div className="vd-field">
                  <label>Serial &amp; IP</label>
                  <input className="vd-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Enter serial number or IP address..." />
                </div>
                <div className="vd-field">
                  <label>Result</label>
                  <select className="vd-select" value={resultFilter} onChange={(e) => setResultFilter(e.target.value)}>
                    <option value="ALL">All results</option>
                    <option value="OK">OK</option>
                    <option value="NOT_OK">Not OK</option>
                  </select>
                </div>
                <div className="vd-field">
                  <label>Status</label>
                  <select className="vd-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="ALL">All devices</option>
                    <option value="inspected">Inspected</option>
                    <option value="not_inspected">Not inspected</option>
                  </select>
                </div>
                <div className="vd-field">
                  <label>Cluster</label>
                  <select className="vd-select" value={cluster} onChange={(e) => setCluster(e.target.value)}>
                    <option value="ALL">All clusters</option>
                    {options.clusters.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="vd-field">
                  <label>Direction</label>
                  <select className="vd-select" value={directionFilter} onChange={(e) => setDirectionFilter(e.target.value)}>
                    <option value="ALL">All directions</option>
                    {options.directions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
              </div>

              {/* Second row: monthly filter removed for faster performance. */}
              <div className="vd-filter-grid-month">
                <div className="vd-field">
                  <label>Building</label>
                  <select className="vd-select" value={building} onChange={(e) => setBuilding(e.target.value)}>
                    <option value="ALL">All buildings</option>
                    {options.buildings.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="vd-field">
                  <label>Zone</label>
                  <select className="vd-select" value={zone} onChange={(e) => setZone(e.target.value)}>
                    <option value="ALL">All zones</option>
                    {options.zones.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="vd-field" style={{ display: "flex", alignItems: "flex-end" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", minHeight: 40, display: "flex", alignItems: "center" }}>
                    Filtered OK: {okCount} · Not OK: {notOkCount}
                  </div>
                </div>
                <div className="vd-field" style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="vd-btn primary" type="button" onClick={() => setShowReplacementLog(true)} style={{ height: 40, width: "100%" }}>
                    📱 Replacement Log ({replacements.length})
                  </button>
                </div>
              </div>

              <div className="vd-filter-actions">
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="vd-btn" type="button" onClick={resetFilters}>Reset</button>
                </div>
              </div>
            </div>

            {/* Devices header */}
            <div className="vd-devices-header">
              <div>
                <div className="vd-devices-title"><span style={{ color: "var(--muted)", fontSize: 13, fontWeight: 900 }}>{filtered.length} records</span></div>
                <div className="vd-devices-sub">All registered devices in current scope</div>
              </div>
              <div className="vd-view-toggle">
                <button className={`vd-toggle-btn ${viewMode === "grid" ? "active" : ""}`} type="button" onClick={() => setViewMode("grid")}>⊞ Box</button>
                <button className={`vd-toggle-btn ${viewMode === "list" ? "active" : ""}`} type="button" onClick={() => setViewMode("list")}>☰ List</button>
              </div>
            </div>

            {/* Devices grid / list */}
            {loading ? (
              <div className={viewMode === "grid" ? "vd-grid" : ""}>
                <div className="vd-loading">Loading devices and replacement snapshots...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div className={viewMode === "grid" ? "vd-grid" : ""}>
                <div className="vd-empty">No devices match the selected filters.</div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="vd-grid">
                {filtered.map((device) => (
                  <DeviceCard key={device.id} device={device} onOpen={openDetails} onOpenReplacement={openReplacement} />
                ))}
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table className="vd-list-table">
                  <thead>
                    <tr>
                      <th>Device</th>
                      <th>Result</th>
                      <th>Status</th>
                      <th>Cluster</th>
                      <th>Building</th>
                      <th>Zone</th>
                      <th>Direction</th>
                      <th>Last Inspection</th>
                      <th>Serial</th>
                      <th>Inspections</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((device) => (
                      <DeviceListRow key={device.id} device={device} onOpen={openDetails} onOpenReplacement={openReplacement} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedDevice ? <DetailsModal device={selectedDevice} onClose={() => setSelectedDevice(null)} /> : null}
      {showReplacementLog ? <ReplacementLogModal records={replacements} inspections={inspectionsForMonth} onClose={() => setShowReplacementLog(false)} /> : null}
      {historyPeriod ? (
        <InspectionPeriodModal
          period={historyPeriod}
          inspections={periodInspections[historyPeriod] || []}
          onClose={() => setHistoryPeriod(null)}
        />
      ) : null}
    </>
  );
}

export default ViewerDevicesPage;