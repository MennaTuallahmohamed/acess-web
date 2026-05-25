import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "https://acess-backend-production.up.railway.app";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --stone-50:  #fafaf9;
  --stone-100: #f5f5f4;
  --stone-200: #e7e5e4;
  --stone-300: #d6d3d1;
  --stone-400: #a8a29e;
  --stone-500: #78716c;
  --stone-600: #57534e;
  --stone-700: #44403c;
  --stone-800: #292524;
  --stone-900: #1c1917;

  --sage:     #7c9082;
  --sage-soft:#e8eeea;
  --sage-mid: #c4d4c8;

  --amber:    #b45309;
  --amber-soft:#fef3c7;

  --rose:     #be123c;
  --rose-soft:#ffe4e6;
  --rose-mid: #fda4af;

  --sky:      #0369a1;
  --sky-soft: #e0f2fe;

  --radius-sm: 8px;
  --radius:    14px;
  --radius-lg: 22px;
  --radius-xl: 32px;

  --shadow-xs: 0 1px 3px rgba(28,25,23,0.06), 0 1px 2px rgba(28,25,23,0.04);
  --shadow-sm: 0 4px 12px rgba(28,25,23,0.07), 0 1px 3px rgba(28,25,23,0.04);
  --shadow-md: 0 12px 32px rgba(28,25,23,0.09), 0 4px 8px rgba(28,25,23,0.05);
  --shadow-lg: 0 24px 60px rgba(28,25,23,0.12), 0 8px 16px rgba(28,25,23,0.06);

  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body:    'DM Sans', system-ui, sans-serif;
}

body {
  font-family: var(--font-body);
  background: var(--stone-100);
  color: var(--stone-800);
  -webkit-font-smoothing: antialiased;
}

button, input, select { font-family: inherit; }

::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--stone-300); border-radius: 999px; }
::-webkit-scrollbar-thumb:hover { background: var(--stone-400); }

/* ── PAGE ── */
.lp-page {
  min-height: 100vh;
  padding: 28px 24px;
  background:
    radial-gradient(ellipse 60% 40% at 70% -10%, rgba(124,144,130,0.12), transparent),
    var(--stone-100);
}

.lp-shell {
  max-width: 1560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── HEADER ── */
.lp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--stone-200);
}

.lp-brand {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.lp-brand-mark {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: var(--stone-800);
  color: var(--stone-100);
  display: grid;
  place-items: center;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.lp-eyebrow {
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  color: var(--sage);
  margin-bottom: 4px;
}

.lp-title {
  font-family: var(--font-display);
  font-size: clamp(22px, 2.8vw, 34px);
  line-height: 1.1;
  color: var(--stone-900);
  letter-spacing: -0.3px;
}

.lp-sub {
  margin-top: 6px;
  font-size: 13px;
  color: var(--stone-400);
  font-weight: 400;
  line-height: 1.6;
  max-width: 560px;
}

.lp-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  padding-top: 4px;
}

/* ── BUTTONS ── */
.btn {
  height: 38px;
  padding: 0 14px;
  border-radius: var(--radius);
  border: 1px solid var(--stone-200);
  background: white;
  color: var(--stone-700);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.17s ease;
  box-shadow: var(--shadow-xs);
  white-space: nowrap;
  letter-spacing: 0.1px;
}

.btn:hover {
  border-color: var(--stone-300);
  box-shadow: var(--shadow-sm);
  color: var(--stone-900);
}

.btn:active { transform: scale(0.98); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn.solid {
  background: var(--stone-800);
  border-color: var(--stone-800);
  color: white;
  box-shadow: var(--shadow-sm);
}
.btn.solid:hover {
  background: var(--stone-900);
  border-color: var(--stone-900);
}

.btn.ghost {
  background: transparent;
  box-shadow: none;
  border-color: transparent;
  color: var(--stone-500);
}
.btn.ghost:hover {
  background: var(--stone-200);
  color: var(--stone-800);
  border-color: transparent;
  box-shadow: none;
}

.btn.danger-ghost {
  background: transparent;
  border-color: var(--rose-mid);
  color: var(--rose);
  box-shadow: none;
}

/* ── VIEW TOGGLE ── */
.view-toggle {
  display: flex;
  background: var(--stone-200);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.view-toggle button {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--stone-500);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s;
}

.view-toggle button.on {
  background: white;
  color: var(--stone-800);
  box-shadow: var(--shadow-xs);
}

/* ── KPI STRIP ── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.kpi {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-xs);
  transition: box-shadow 0.18s;
  position: relative;
  overflow: hidden;
}

.kpi:hover { box-shadow: var(--shadow-sm); }

.kpi-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 16px;
  margin-bottom: 16px;
}

.kpi-num {
  font-family: var(--font-display);
  font-size: 36px;
  line-height: 1;
  color: var(--stone-900);
  letter-spacing: -1px;
}

.kpi-label {
  margin-top: 6px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--stone-400);
}

.kpi-note {
  margin-top: 4px;
  font-size: 12px;
  color: var(--stone-400);
}

.kpi-progress {
  margin-top: 14px;
  height: 3px;
  background: var(--stone-200);
  border-radius: 999px;
  overflow: hidden;
}
.kpi-progress span {
  display: block;
  height: 100%;
  background: var(--sage);
  border-radius: 999px;
  transition: width 0.8s ease;
}

/* ── FILTERS ── */
.filter-bar {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  box-shadow: var(--shadow-xs);
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(220px, 2fr) repeat(5, 1fr) auto;
  gap: 10px;
  align-items: end;
}

.field { display: flex; flex-direction: column; gap: 5px; }

.field label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--stone-400);
}

.inp, .sel {
  height: 38px;
  width: 100%;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius);
  background: var(--stone-50);
  padding: 0 12px;
  color: var(--stone-800);
  font-size: 13px;
  font-weight: 400;
  outline: none;
  transition: 0.15s;
}

.inp::placeholder { color: var(--stone-300); }

.inp:focus, .sel:focus {
  border-color: var(--sage);
  background: white;
  box-shadow: 0 0 0 3px rgba(124,144,130,0.14);
}

.sel {
  appearance: none;
  padding-right: 30px;
  background-image:
    linear-gradient(45deg, transparent 50%, var(--stone-400) 50%),
    linear-gradient(135deg, var(--stone-400) 50%, transparent 50%);
  background-position: calc(100% - 14px) 16px, calc(100% - 10px) 16px;
  background-size: 4px 4px, 4px 4px;
  background-repeat: no-repeat;
  cursor: pointer;
}

/* ── LAYOUT ── */
.body-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 18px;
  align-items: start;
}

/* ── CARDS ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}

.loc-card {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
  cursor: default;
}

.loc-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--stone-300);
}

.loc-card.unscanned {
  border-left: 3px solid var(--rose-mid);
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.loc-code {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--stone-400);
  margin-bottom: 5px;
}

.loc-name {
  font-family: var(--font-display);
  font-size: 18px;
  line-height: 1.25;
  color: var(--stone-900);
  letter-spacing: -0.2px;
}

.loc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 9px;
}

.tag {
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.tag.neutral  { background: var(--stone-100); color: var(--stone-500); border: 1px solid var(--stone-200); }
.tag.sage     { background: var(--sage-soft); color: var(--sage); border: 1px solid var(--sage-mid); }
.tag.amber    { background: var(--amber-soft); color: var(--amber); border: 1px solid #fde68a; }
.tag.rose     { background: var(--rose-soft); color: var(--rose); border: 1px solid var(--rose-mid); }
.tag.sky      { background: var(--sky-soft); color: var(--sky); border: 1px solid #bae6fd; }

/* RING */
.ring-wrap { position: relative; width: 60px; height: 60px; flex-shrink: 0; }
.ring-wrap svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.ring-inner { position: absolute; inset: 0; display: grid; place-items: center; }
.ring-pct { font-size: 14px; font-weight: 600; color: var(--stone-700); }

.card-divider {
  height: 1px;
  background: var(--stone-100);
  margin: 14px 0;
}

.card-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat-box {
  background: var(--stone-50);
  border: 1px solid var(--stone-100);
  border-radius: 10px;
  padding: 10px 12px;
}

.stat-lbl {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--stone-400);
  margin-bottom: 4px;
}

.stat-val {
  font-size: 22px;
  font-weight: 600;
  color: var(--stone-800);
  letter-spacing: -0.5px;
}

.card-footer {
  margin-top: 14px;
}

.card-cta {
  width: 100%;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--stone-200);
  background: var(--stone-50);
  color: var(--stone-600);
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.17s;
  letter-spacing: 0.1px;
}

.card-cta:hover {
  background: var(--stone-800);
  border-color: var(--stone-800);
  color: white;
}

/* ── SIDE PANEL ── */
.side {
  position: sticky;
  top: 20px;
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
  max-height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.side-head {
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--stone-100);
}

.side-head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.side-hed-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--stone-800);
}

.side-badge {
  background: var(--rose-soft);
  color: var(--rose);
  font-size: 11px;
  font-weight: 600;
  height: 22px;
  min-width: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  padding: 0 7px;
}

.side-desc {
  margin-top: 5px;
  font-size: 12px;
  color: var(--stone-400);
  line-height: 1.55;
}

.side-list {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.side-item {
  border: 1px solid var(--stone-100);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.15s;
}

.side-item:hover {
  border-color: var(--rose-mid);
  background: var(--rose-soft);
}

.side-item-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--stone-700);
  margin-bottom: 6px;
  line-height: 1.35;
}

.side-meta {
  font-size: 11.5px;
  color: var(--stone-400);
  line-height: 1.7;
}

/* ── TABLE ── */
.table-wrap {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  overflow: auto;
}

.locs-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
}

.locs-table th {
  position: sticky;
  top: 0;
  background: var(--stone-50);
  color: var(--stone-400);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-align: left;
  padding: 13px 16px;
  border-bottom: 1px solid var(--stone-200);
}

.locs-table td {
  padding: 13px 16px;
  border-bottom: 1px solid var(--stone-100);
  font-size: 13px;
  color: var(--stone-700);
}

.locs-table tbody tr:last-child td { border-bottom: 0; }

.locs-table tbody tr:hover td { background: var(--stone-50); }

/* ── DRAWER ── */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: rgba(28, 25, 23, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: min(860px, 100vw);
  height: 100vh;
  background: var(--stone-50);
  box-shadow: -20px 0 60px rgba(28,25,23,0.15);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.22s ease;
}

@keyframes slideIn {
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}

.drawer-head {
  padding: 24px 24px 20px;
  background: white;
  border-bottom: 1px solid var(--stone-200);
}

.drawer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.drawer-code {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--sage);
  margin-bottom: 6px;
}

.drawer-name {
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1.1;
  color: var(--stone-900);
  letter-spacing: -0.5px;
}

.drawer-info {
  margin-top: 7px;
  font-size: 13px;
  color: var(--stone-400);
  line-height: 1.7;
}

.close-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--stone-200);
  background: white;
  color: var(--stone-500);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: 0.15s;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--rose-soft);
  border-color: var(--rose-mid);
  color: var(--rose);
}

.drawer-stats {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.drw-stat {
  background: var(--stone-50);
  border: 1px solid var(--stone-200);
  border-radius: 12px;
  padding: 13px 16px;
}

.drw-stat-lbl {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--stone-400);
  margin-bottom: 5px;
}

.drw-stat-val {
  font-family: var(--font-display);
  font-size: 28px;
  line-height: 1;
  color: var(--stone-900);
}

.drawer-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.drawer-filters {
  display: grid;
  grid-template-columns: auto auto auto 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.pill {
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid var(--stone-200);
  background: white;
  color: var(--stone-500);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.15s;
}

.pill:hover { border-color: var(--stone-300); color: var(--stone-700); }

.pill.on {
  background: var(--stone-800);
  border-color: var(--stone-800);
  color: white;
}

/* DEVICE CARD */
.dev-card {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: 14px;
  padding: 16px;
  margin-bottom: 10px;
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 16px;
  align-items: start;
  transition: box-shadow 0.15s;
}

.dev-card:hover { box-shadow: var(--shadow-sm); }

.dev-card.unscanned {
  border-left: 3px solid var(--rose-mid);
  background: #fff9f9;
}

.dev-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--stone-800);
  margin-bottom: 8px;
}

.dev-meta {
  font-size: 12px;
  color: var(--stone-400);
  line-height: 1.9;
}

.dev-meta b {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--stone-300);
  margin-right: 8px;
}

.dev-right {
  text-align: right;
  font-size: 12px;
  color: var(--stone-400);
  line-height: 1.9;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(28,25,23,0.5);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.modal {
  width: min(440px, 100%);
  background: white;
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--shadow-lg);
}

.modal-title {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--stone-900);
  text-align: center;
  margin-bottom: 6px;
}

.modal-sub {
  font-size: 13px;
  color: var(--stone-400);
  text-align: center;
  line-height: 1.6;
  margin-bottom: 20px;
}

.dropzone {
  border: 1.5px dashed var(--stone-300);
  background: var(--stone-50);
  border-radius: 18px;
  padding: 36px 20px;
  text-align: center;
  cursor: pointer;
  transition: 0.17s;
}

.dropzone:hover, .dropzone.drag {
  border-color: var(--sage);
  background: var(--sage-soft);
}

.dz-icon { font-size: 36px; margin-bottom: 10px; }
.dz-title { font-size: 14px; font-weight: 500; color: var(--stone-700); }
.dz-hint { font-size: 12px; color: var(--stone-400); margin-top: 4px; }

/* STATES */
.empty-state {
  background: white;
  border: 1px solid var(--stone-200);
  border-radius: var(--radius-lg);
  min-height: 160px;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 32px;
}

.empty-state p {
  font-size: 13px;
  color: var(--stone-400);
  margin-top: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--stone-200);
  border-top-color: var(--sage);
  border-radius: 999px;
  animation: spin 0.75s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin { to { transform: rotate(360deg); } }

.error-bar {
  background: var(--rose-soft);
  border: 1px solid var(--rose-mid);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13px;
  color: var(--rose);
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
  .filter-row { grid-template-columns: repeat(3, 1fr); }
  .body-layout { grid-template-columns: 1fr; }
  .side { position: relative; top: auto; max-height: 400px; }
}

@media (max-width: 760px) {
  .lp-page { padding: 16px 14px; }
  .lp-header { flex-direction: column; }
  .lp-actions { justify-content: flex-start; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .filter-row { grid-template-columns: 1fr; }
  .cards-grid { grid-template-columns: 1fr; }
  .drawer-stats { grid-template-columns: repeat(2, 1fr); }
  .drawer-filters { grid-template-columns: 1fr; }
  .dev-card { grid-template-columns: 1fr; }
  .dev-right { text-align: left; }
}

@media (max-width: 480px) {
  .kpi-strip { grid-template-columns: 1fr; }
}
`;

// ─────────────── helpers ───────────────

function safe(v) {
  return (v === null || v === undefined || v === "") ? "—" : String(v);
}

function fmt(v) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d)) return "—";
  return d.toLocaleString("en-GB", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function pct(s, t) {
  if (!t || t <= 0) return 0;
  return Math.round((Number(s) / Number(t)) * 100);
}

function locName(l) {
  return l.name || l.locationName || l.zone || l.zoneName || l.building || l.cluster || l.excelId || l.code || `Location ${l.id || ""}`;
}

function devName(d) {
  return d.name || d.deviceName || d.title || d.serialNumber || d.serial || d.ipAddress || d.ip || d.id || "Device";
}

function isScanned(d) {
  const s = String(d.scanStatus || d.status || d.inspectionStatus || d.latestStatus || "").toUpperCase();
  if (s.includes("NOT") || s.includes("NO_SCAN") || s.includes("PENDING") || s.includes("MISSING") || s.includes("WAIT")) return false;
  if (s.includes("SCAN") || s.includes("DONE") || s.includes("INSPECT") || s.includes("COMPLETE") || s.includes("FINISH")) return true;
  if (d.scanned === true || d.isScanned === true || d.hasScan === true || d.inspected === true) return true;
  if (Number(d.scanCount || d.scansCount || 0) > 0) return true;
  if (d.lastScanAt || d.scannedAt || d.inspectionAt || d.lastInspectionAt) return true;
  return false;
}

function normDev(raw) {
  const scanned = isScanned(raw);
  return {
    ...raw,
    id: raw.id || raw.deviceId || raw._id || raw.serialNumber || raw.serial || raw.ipAddress || Math.random().toString(36).slice(2),
    name: devName(raw),
    serialNumber: raw.serialNumber || raw.serial_number || raw.serial || raw.sn || "",
    ipAddress: raw.ipAddress || raw.ip_address || raw.ip || "",
    macAddress: raw.macAddress || raw.mac_address || raw.mac || "",
    deviceType: raw.deviceType || raw.device_type || raw.type || raw.category || raw.model || "",
    scanStatus: scanned ? "SCANNED" : "NOT_SCANNED",
    scanCount: Number(raw.scanCount || raw.scansCount || 0),
    lastScanAt: raw.lastScanAt || raw.scannedAt || raw.inspectionAt || raw.lastInspectionAt || null,
    lastTechnicianName: raw.lastTechnicianName || raw.technicianName || raw.techName || raw.userName || raw.inspectorName || "",
    lastTechnicianEmail: raw.lastTechnicianEmail || raw.technicianEmail || raw.techEmail || raw.userEmail || raw.inspectorEmail || "",
    notes: raw.notes || raw.comment || raw.description || "",
  };
}

function normLoc(raw) {
  const rawDevs = raw.devices || raw.locationDevices || raw.assets || raw.deviceList || raw.children || [];
  const devices = Array.isArray(rawDevs) ? rawDevs.map(normDev) : [];
  const totalDev = Number(raw.totalDevices ?? raw.devicesCount ?? raw.totalDeviceCount ?? raw.deviceCount) || devices.length || 0;
  const scannedRaw = raw.scannedDevicesCount ?? raw.scannedCount ?? raw.doneScans ?? raw.totalScannedDevices ?? raw.scannedDevices;
  const scannedDev = (scannedRaw !== undefined && scannedRaw !== null) ? Number(scannedRaw) : devices.filter(d => d.scanStatus === "SCANNED").length;
  return {
    ...raw,
    id: raw.id || raw.locationId || raw._id || raw.excelId || raw.code || Math.random().toString(36).slice(2),
    excelId: raw.excelId || raw.code || raw.locationCode || raw.externalId || "",
    cluster: raw.cluster || raw.clusterName || raw.sector || "",
    building: raw.building || raw.facility || raw.facilityName || raw.buildingName || raw.ministry || "",
    zone: raw.zone || raw.zoneName || raw.area || raw.locationName || raw.name || "",
    direction: raw.direction || raw.floorDirection || raw.side || "",
    type: raw.type || raw.locationType || raw.zoneType || "",
    devices,
    totalDevices: totalDev,
    scannedDevices: scannedDev,
    notScannedDevices: Math.max(totalDev - scannedDev, 0),
    scanPercentage: pct(scannedDev, totalDev),
    scanCount: Number(raw.scanCount || raw.totalScans || 0) || devices.reduce((s, d) => s + Number(d.scanCount || 0), 0),
    lastScanAt: raw.lastScanAt || raw.lastInspectionAt || raw.updatedAt || null,
  };
}

function statusOf(loc) {
  if (loc.scanPercentage >= 100) return { label: "Complete",  cls: "sage",    ring: "#7c9082" };
  if (loc.scannedDevices > 0)    return { label: "In Progress", cls: "amber", ring: "#b45309" };
  return                                 { label: "Not Scanned", cls: "rose",  ring: "#be123c" };
}

// ─────────────── Ring ───────────────

function Ring({ value, color }) {
  const r = 24, circ = 2 * Math.PI * r;
  const dash = circ * (Math.min(value, 100) / 100);
  return (
    <div className="ring-wrap">
      <svg width="60" height="60" viewBox="0 0 60 60">
        <circle cx="30" cy="30" r={r} fill="none" stroke="#e7e5e4" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="ring-inner">
        <span className="ring-pct">{value}%</span>
      </div>
    </div>
  );
}

// ─────────────── KPI ───────────────

function Kpi({ label, value, note, icon, bg, progress }) {
  return (
    <div className="kpi">
      <div className="kpi-icon-wrap" style={{ background: bg || "#f5f5f4" }}>{icon}</div>
      <div className="kpi-num">{value}</div>
      <div className="kpi-label">{label}</div>
      {note && <div className="kpi-note">{note}</div>}
      {progress !== undefined && (
        <div className="kpi-progress">
          <span style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

// ─────────────── Location Card ───────────────

function LocCard({ loc, onOpen }) {
  const st = statusOf(loc);
  return (
    <div className={`loc-card ${loc.scannedDevices === 0 ? "unscanned" : ""}`}>
      <div className="card-top">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="loc-code">{safe(loc.excelId || loc.id)}</div>
          <div className="loc-name">{locName(loc)}</div>
          <div className="loc-tags">
            {loc.cluster   && <span className="tag sage">{loc.cluster}</span>}
            {loc.building  && <span className="tag neutral">{loc.building}</span>}
            {loc.direction && <span className="tag amber">{loc.direction}</span>}
            <span className={`tag ${st.cls}`}>{st.label}</span>
          </div>
        </div>
        <Ring value={loc.scanPercentage} color={st.ring} />
      </div>
      <div className="card-divider" />
      <div className="card-stats">
        <div className="stat-box">
          <div className="stat-lbl">Total</div>
          <div className="stat-val">{loc.totalDevices}</div>
        </div>
        <div className="stat-box">
          <div className="stat-lbl">Scanned</div>
          <div className="stat-val" style={{ color: "#7c9082" }}>{loc.scannedDevices}</div>
        </div>
        <div className="stat-box">
          <div className="stat-lbl">Missing</div>
          <div className="stat-val" style={{ color: loc.notScannedDevices > 0 ? "#be123c" : "#7c9082" }}>{loc.notScannedDevices}</div>
        </div>
      </div>
      <div className="card-footer">
        <button className="card-cta" onClick={() => onOpen(loc)}>View Devices →</button>
      </div>
    </div>
  );
}

// ─────────────── Table View ───────────────

function LocsTable({ locations, onOpen }) {
  return (
    <div className="table-wrap">
      <table className="locs-table">
        <thead>
          <tr>
            <th>Code</th><th>Location</th><th>Cluster</th><th>Building</th><th>Zone</th>
            <th>Total</th><th>Scanned</th><th>Missing</th><th>Status</th><th>Last Scan</th><th></th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => {
            const st = statusOf(loc);
            return (
              <tr key={loc.id || loc.excelId}>
                <td><span className="tag neutral" style={{ fontFamily: "monospace" }}>{safe(loc.excelId || loc.id)}</span></td>
                <td style={{ fontWeight: 500 }}>{locName(loc)}</td>
                <td>{safe(loc.cluster)}</td>
                <td>{safe(loc.building)}</td>
                <td>{safe(loc.zone)}</td>
                <td>{loc.totalDevices}</td>
                <td style={{ color: "#7c9082", fontWeight: 600 }}>{loc.scannedDevices}</td>
                <td style={{ color: loc.notScannedDevices > 0 ? "#be123c" : "#7c9082", fontWeight: 600 }}>{loc.notScannedDevices}</td>
                <td><span className={`tag ${st.cls}`}>{st.label} · {loc.scanPercentage}%</span></td>
                <td>{fmt(loc.lastScanAt)}</td>
                <td><button className="btn" onClick={() => onOpen(loc)}>Open</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────── Drawer ───────────────

function Drawer({ loc, onClose }) {
  const [filter, setFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const scannedDevs = useMemo(() => loc.devices.filter(d => d.scanStatus === "SCANNED"), [loc.devices]);
  const notScannedDevs = useMemo(() => loc.devices.filter(d => d.scanStatus !== "SCANNED"), [loc.devices]);
  const visible = useMemo(() => {
    const s = q.trim().toLowerCase();
    return loc.devices.filter(d => {
      if (filter === "SCANNED" && d.scanStatus !== "SCANNED") return false;
      if (filter === "NOT_SCANNED" && d.scanStatus === "SCANNED") return false;
      if (s) {
        const text = [d.name, d.serialNumber, d.ipAddress, d.macAddress, d.deviceType, d.lastTechnicianName, d.lastTechnicianEmail, d.notes].filter(Boolean).join(" ").toLowerCase();
        if (!text.includes(s)) return false;
      }
      return true;
    });
  }, [loc.devices, filter, q]);
  const st = statusOf(loc);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={e => e.stopPropagation()}>
        <div className="drawer-head">
          <div className="drawer-top">
            <div>
              <div className="drawer-code">{safe(loc.excelId || loc.id)}</div>
              <div className="drawer-name">{locName(loc)}</div>
              <div className="drawer-info">
                {[loc.cluster, loc.building, loc.zone, loc.type, loc.direction].filter(Boolean).join("  ·  ")}
              </div>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="drawer-stats">
            <div className="drw-stat">
              <div className="drw-stat-lbl">Total</div>
              <div className="drw-stat-val">{loc.totalDevices}</div>
            </div>
            <div className="drw-stat">
              <div className="drw-stat-lbl">Scanned</div>
              <div className="drw-stat-val" style={{ color: "#7c9082" }}>{scannedDevs.length}</div>
            </div>
            <div className="drw-stat">
              <div className="drw-stat-lbl">Missing</div>
              <div className="drw-stat-val" style={{ color: "#be123c" }}>{notScannedDevs.length}</div>
            </div>
            <div className="drw-stat">
              <div className="drw-stat-lbl">Done</div>
              <div className={`drw-stat-val`} style={{ color: st.ring }}>{loc.scanPercentage}%</div>
            </div>
          </div>
        </div>
        <div className="drawer-body">
          <div className="drawer-filters">
            {[["ALL", `All (${loc.devices.length})`], ["SCANNED", `Scanned (${scannedDevs.length})`], ["NOT_SCANNED", `Missing (${notScannedDevs.length})`]].map(([v, l]) => (
              <button key={v} className={`pill ${filter === v ? "on" : ""}`} onClick={() => setFilter(v)}>{l}</button>
            ))}
            <input className="inp" placeholder="Search device, serial, IP…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          {visible.length === 0
            ? <div className="empty-state"><p>No devices match this filter.</p></div>
            : visible.map(d => {
                const sc = d.scanStatus === "SCANNED";
                return (
                  <div key={d.id} className={`dev-card ${sc ? "" : "unscanned"}`}>
                    <div>
                      <div className="dev-name">{safe(d.name)}</div>
                      <div className="dev-meta">
                        <div><b>Type</b>{safe(d.deviceType)}</div>
                        <div><b>Serial</b>{safe(d.serialNumber)}</div>
                        <div><b>IP</b>{safe(d.ipAddress)}</div>
                        <div><b>MAC</b>{safe(d.macAddress)}</div>
                        {d.notes && <div><b>Notes</b>{safe(d.notes)}</div>}
                      </div>
                    </div>
                    <div className="dev-right">
                      <span className={`tag ${sc ? "sage" : "rose"}`}>{sc ? "Scanned" : "Not Scanned"}</span>
                      {sc
                        ? <div style={{ marginTop: 8 }}>
                            <div>Date: {fmt(d.lastScanAt)}</div>
                            <div>Technician: {safe(d.lastTechnicianName)}</div>
                            <div>Email: {safe(d.lastTechnicianEmail)}</div>
                            <div>Count: {safe(d.scanCount)}</div>
                          </div>
                        : <div style={{ marginTop: 8, color: "#be123c", fontSize: 12 }}>No scan recorded yet.</div>
                      }
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

// ─────────────── Import Modal ───────────────

function ImportModal({ onClose, onImport }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef(null);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">Import Locations</div>
        <div className="modal-sub">Upload a CSV or Excel file to sync locations with SmartIT Inspect.</div>
        <div className={`dropzone ${drag ? "drag" : ""}`}
          onClick={() => ref.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onImport(f); }}>
          <div className="dz-icon">📂</div>
          <div className="dz-title">Click to browse or drop file here</div>
          <div className="dz-hint">Supports .CSV and .XLSX</div>
        </div>
        <input ref={ref} type="file" accept=".csv,.xlsx" style={{ display: "none" }}
          onChange={e => { const f = e.target.files?.[0]; if (f) onImport(f); }} />
        <button className="btn danger-ghost" style={{ width: "100%", marginTop: 12, height: 40, justifyContent: "center" }} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────── Page ───────────────

export function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("GRID");
  const [selected, setSelected] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [q, setQ] = useState("");
  const [fCluster, setFCluster] = useState("");
  const [fBuilding, setFBuilding] = useState("");
  const [fZone, setFZone] = useState("");
  const [fType, setFType] = useState("");
  const [fStatus, setFStatus] = useState("");

  useEffect(() => {
    let el = document.getElementById("__lp_css");
    if (!el) { el = document.createElement("style"); el.id = "__lp_css"; el.innerHTML = CSS; document.head.appendChild(el); }
  }, []);

  async function load() {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken");
      const res = await fetch(`${API_BASE}/locations-scan-summary`, {
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw = json.locations || json.data || json.items || json.result || json || [];
      if (!Array.isArray(raw)) throw new Error("Response is not an array.");
      setLocations(raw.map(normLoc));
    } catch (e) {
      console.error(e);
      setLocations([]);
      setError("Could not load locations. Check backend endpoint: /locations-scan-summary");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const opts = useMemo(() => {
    const C = new Set(), B = new Set(), Z = new Set(), T = new Set();
    locations.forEach(l => { if (l.cluster) C.add(l.cluster); if (l.building) B.add(l.building); if (l.zone) Z.add(l.zone); if (l.type) T.add(l.type); });
    return { clusters: [...C].sort(), buildings: [...B].sort(), zones: [...Z].sort(), types: [...T].sort() };
  }, [locations]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return locations.filter(loc => {
      if (fCluster  && loc.cluster  !== fCluster)  return false;
      if (fBuilding && loc.building !== fBuilding)  return false;
      if (fZone     && loc.zone     !== fZone)      return false;
      if (fType     && loc.type     !== fType)      return false;
      if (fStatus === "FULL"    && loc.scanPercentage !== 100)                          return false;
      if (fStatus === "PARTIAL" && !(loc.scanPercentage > 0 && loc.scanPercentage < 100)) return false;
      if (fStatus === "NONE"    && loc.scannedDevices > 0)                              return false;
      if (s) {
        const t = [loc.id, loc.excelId, loc.cluster, loc.building, loc.zone, loc.direction, loc.type,
          ...loc.devices.map(d => [d.name, d.serialNumber, d.ipAddress, d.macAddress, d.deviceType, d.lastTechnicianName, d.lastTechnicianEmail].join(" "))]
          .filter(Boolean).join(" ").toLowerCase();
        if (!t.includes(s)) return false;
      }
      return true;
    });
  }, [locations, q, fCluster, fBuilding, fZone, fType, fStatus]);

  const summary = useMemo(() => {
    const total = filtered.reduce((s, l) => s + Number(l.totalDevices || 0), 0);
    const scanned = filtered.reduce((s, l) => s + Number(l.scannedDevices || 0), 0);
    return {
      totalLocations: filtered.length,
      totalDevices: total,
      scannedDevices: scanned,
      overallScan: pct(scanned, total),
      full:    filtered.filter(l => l.scanPercentage === 100).length,
      partial: filtered.filter(l => l.scanPercentage > 0 && l.scanPercentage < 100).length,
      none:    filtered.filter(l => l.scannedDevices === 0).length,
    };
  }, [filtered]);

  const unscannedLocs = useMemo(() => filtered.filter(l => l.scannedDevices === 0), [filtered]);

  function reset() { setQ(""); setFCluster(""); setFBuilding(""); setFZone(""); setFType(""); setFStatus(""); }

  function doExport() {
    if (!filtered.length) { alert("No locations to export."); return; }
    const hdrs = ["Location ID","Excel ID","Location Name","Cluster","Building","Zone","Type","Direction","Total Devices","Scanned","Not Scanned","Scan %","Scan Count","Last Scan"];
    const rows = filtered.map(l => [l.id, l.excelId, locName(l), l.cluster, l.building, l.zone, l.type, l.direction, l.totalDevices, l.scannedDevices, l.notScannedDevices, `${l.scanPercentage}%`, l.scanCount, fmt(l.lastScanAt)].map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
    const csv = [hdrs.join(","), ...rows].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "SmartIT_Locations.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function doImport(file) {
    setShowImport(false);
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken");
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch(`${API_BASE}/api/admin/locations/import`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : {}, body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
      alert("Imported successfully.");
    } catch (e) { console.error(e); alert("Import failed."); }
  }

  return (
    <div className="lp-page">
      <div className="lp-shell">

        {/* Header */}
        <header className="lp-header">
          <div className="lp-brand">
            <div className="lp-brand-mark">⊙</div>
            <div>
              <div className="lp-eyebrow">SmartIT Inspect</div>
              <h1 className="lp-title">Locations Scan Dashboard</h1>
              <p className="lp-sub">Track every location, cluster, zone and device scan status in one clean admin view.</p>
            </div>
          </div>
          <div className="lp-actions">
            <div className="view-toggle">
              <button className={viewMode === "GRID" ? "on" : ""} onClick={() => setViewMode("GRID")}>Grid</button>
              <button className={viewMode === "LIST" ? "on" : ""} onClick={() => setViewMode("LIST")}>List</button>
            </div>
            <button className="btn ghost" onClick={load} disabled={loading}>↻ Refresh</button>
            <button className="btn" onClick={doExport}>↓ Export</button>
            <button className="btn solid" onClick={() => setShowImport(true)}>↑ Import</button>
          </div>
        </header>

        {error && <div className="error-bar">⚠ {error}</div>}

        {/* KPIs */}
        <section className="kpi-strip">
          <Kpi label="Locations"   value={summary.totalLocations}       note="Filtered"            icon="📍" bg="#f0f4f1" />
          <Kpi label="Scan Rate"   value={`${summary.overallScan}%`}    note={`${summary.scannedDevices} / ${summary.totalDevices} devices`} icon="◎" bg="#f0f4f1" progress={summary.overallScan} />
          <Kpi label="Complete"    value={summary.full}                  note="100% scanned"        icon="✓" bg="#ecfdf5" />
          <Kpi label="In Progress" value={summary.partial}               note="Partially scanned"   icon="◐" bg="#fffbeb" />
          <Kpi label="Not Scanned" value={summary.none}                  note="No activity yet"     icon="!" bg="#fff1f2" />
        </section>

        {/* Filters */}
        <section className="filter-bar">
          <div className="filter-row">
            <div className="field">
              <label>Search</label>
              <input className="inp" placeholder="Location, device, serial, IP…" value={q} onChange={e => setQ(e.target.value)} />
            </div>
            {[["Cluster", opts.clusters, fCluster, setFCluster, "All Clusters"],
              ["Building", opts.buildings, fBuilding, setFBuilding, "All Buildings"],
              ["Zone", opts.zones, fZone, setFZone, "All Zones"],
              ["Type", opts.types, fType, setFType, "All Types"]].map(([lbl, items, val, set, placeholder]) => (
              <div className="field" key={lbl}>
                <label>{lbl}</label>
                <select className="sel" value={val} onChange={e => set(e.target.value)}>
                  <option value="">{placeholder}</option>
                  {items.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            ))}
            <div className="field">
              <label>Status</label>
              <select className="sel" value={fStatus} onChange={e => setFStatus(e.target.value)}>
                <option value="">All Status</option>
                <option value="FULL">Complete</option>
                <option value="PARTIAL">In Progress</option>
                <option value="NONE">Not Scanned</option>
              </select>
            </div>
            <button className="btn ghost" style={{ height: 38, alignSelf: "flex-end" }} onClick={reset}>Clear</button>
          </div>
        </section>

        {/* Body */}
        {loading
          ? <div className="empty-state"><div className="spinner" /><p>Loading locations…</p></div>
          : (
            <div className="body-layout">
              <div>
                {filtered.length === 0
                  ? <div className="empty-state"><p>No locations match the current filters.</p></div>
                  : viewMode === "GRID"
                    ? <div className="cards-grid">{filtered.map(l => <LocCard key={l.id || l.excelId} loc={l} onOpen={setSelected} />)}</div>
                    : <LocsTable locations={filtered} onOpen={setSelected} />
                }
              </div>

              <aside className="side">
                <div className="side-head">
                  <div className="side-head-top">
                    <div className="side-hed-title">Not Scanned</div>
                    <span className="side-badge">{unscannedLocs.length}</span>
                  </div>
                  <p className="side-desc">Locations with zero scan activity. Click to inspect devices.</p>
                </div>
                <div className="side-list">
                  {unscannedLocs.length === 0
                    ? <div className="empty-state" style={{ minHeight: 100 }}><p>All visible locations have scan coverage.</p></div>
                    : unscannedLocs.map(l => (
                      <div key={l.id || l.excelId} className="side-item" onClick={() => setSelected(l)}>
                        <div className="side-item-name">{locName(l)}</div>
                        <div className="side-meta">
                          {safe(l.excelId || l.id)}<br />
                          {l.cluster && <>{l.cluster}<br /></>}
                          {l.building && <>{l.building}<br /></>}
                          {l.totalDevices} devices
                        </div>
                      </div>
                    ))
                  }
                </div>
              </aside>
            </div>
          )}

      </div>

      {selected && <Drawer loc={selected} onClose={() => setSelected(null)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={doImport} />}
    </div>
  );
}

export default LocationsPage;