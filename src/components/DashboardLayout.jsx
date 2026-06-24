import React, { useEffect } from "react";
import { useLang } from "../context/LanguageContext";
import smartitLogo from "../assets/smartit-logo-transparent.png";

const NAV_ITEMS = [
  { key: "home", icon: "🏠", labelKey: "home" },
  { key: "tasks", icon: "📋", labelKey: "tasks" },
  { key: "software", icon: "💻", labelKey: "software" },
  { key: "technicians", icon: "👷", labelKey: "technicians" },
  { key: "devices", icon: "🔧", labelKey: "devices" },
  { key: "gates", icon: "G", labelKey: "gates" },
  { key: "inspections", icon: "🔍", labelKey: "inspections" },
  { key: "troubleshooting", icon: "🛠️", labelKey: "troubleshooting" },
  { key: "analytics", icon: "📊", labelKey: "analytics" },
  { key: "locations", icon: "📍", labelKey: "locations" },
  { key: "accounts", icon: "👥", labelKey: "accounts" },
];

const LUX_NAV_CSS = `
  .lux-layout-root {
    display: flex;
    height: 100vh;
    background: #f0f4f8;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
  }

  .lux-layout-root.viewer-mode {
    background: #f5f7fb;
  }

  .lux-sidebar {
    width: 280px;
    background: #0f172a;
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0,0,0,0.1);
    position: relative;
    z-index: 100;
  }

  .lux-sidebar::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  }

  .lux-layout-root.viewer-mode .lux-sidebar {
    background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
    color: #172033;
    box-shadow: 4px 0 28px rgba(15, 23, 42, 0.04);
  }

  .lux-layout-root.viewer-mode .lux-sidebar::after {
    background: linear-gradient(180deg, rgba(203, 213, 225, 0.8) 0%, rgba(203, 213, 225, 0) 100%);
  }

  .lux-brand {
    padding: 24px 20px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0;
    position: relative;
  }

  .lux-brand-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    width: 100%;
    z-index: 1;
  }

  .lux-brand-image-wrap {
    width: 160px;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .lux-brand-image {
    width: 160px;
    height: auto;
    object-fit: contain;
    display: block;
  }

  .lux-brand-title {
    display: none;
  }

  .lux-brand-divider {
    height: 1px;
    margin: 0 20px 12px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  }

  .lux-layout-root.viewer-mode .lux-brand-divider {
    background: linear-gradient(90deg, transparent, rgba(79, 124, 255, 0.15), transparent);
  }

  .lux-nav {
    flex: 1;
    overflow-y: auto;
    padding: 0 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .lux-nav::-webkit-scrollbar {
    width: 4px;
  }

  .lux-nav::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
  }

  .lux-nav-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 16px;
    border-radius: 12px;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    text-align: left;
    position: relative;
  }

  .lux-nav-item:hover {
    background: rgba(255,255,255,0.05);
    color: #f8fafc;
  }

  .lux-nav-item.active {
    background: linear-gradient(90deg, rgba(99,102,241,0.15) 0%, transparent 100%);
    color: #818cf8;
    font-weight: 700;
  }

  .lux-nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 15%;
    bottom: 15%;
    width: 4px;
    background: #6366f1;
    border-radius: 0 4px 4px 0;
    box-shadow: 0 0 12px rgba(99,102,241,0.8);
  }

  .lux-layout-root.viewer-mode .lux-nav-item {
    color: #6b7890;
  }

  .lux-layout-root.viewer-mode .lux-nav-item:hover {
    background: #eef4ff;
    color: #172033;
  }

  .lux-layout-root.viewer-mode .lux-nav-item.active {
    background: linear-gradient(90deg, #eef4ff 0%, #f8fbff 100%);
    color: #3158d6;
  }

  .lux-layout-root.viewer-mode .lux-nav-item.active::before {
    background: #4f7cff;
    box-shadow: none;
  }

  .lux-sidebar-footer {
    padding: 24px 16px;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .lux-btn-refresh {
    background: rgba(255,255,255,0.05);
    color: #e2e8f0;
    border: 1px solid rgba(255,255,255,0.1);
    padding: 10px;
    border-radius: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .lux-btn-refresh:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
  }

  .lux-btn-refresh:disabled{
    opacity:.65;
    cursor:not-allowed;
  }

  .lux-btn-lang {
    background: transparent;
    border: none;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }

  .lux-btn-lang:hover {
    color: #fff;
  }

  .lux-layout-root.viewer-mode .lux-sidebar-footer {
    border-top: 1px solid #e2e8f0;
  }

  .lux-layout-root.viewer-mode .lux-btn-refresh {
    background: #f8fbff;
    color: #3158d6;
    border: 1px solid #dbe7ff;
  }

  .lux-layout-root.viewer-mode .lux-btn-refresh:hover:not(:disabled) {
    background: #eef4ff;
  }

  .lux-layout-root.viewer-mode .lux-btn-lang {
    color: #6b7890;
  }

  .lux-layout-root.viewer-mode .lux-btn-lang:hover {
    color: #172033;
  }

  .lux-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  .lux-header {
    height: 80px;
    padding: 0 32px;
    background: rgba(255,255,255,0.7);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 50;
    position: sticky;
    top: 0;
  }

  .lux-layout-root.viewer-mode .lux-header {
    background: rgba(255,255,255,0.92);
  }

  .lux-page-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
  }

  .lux-page-sub {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
    margin: 2px 0 0;
    display: none;
  }

  .lux-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid #e2e8f0;
    padding: 6px 6px 6px 16px;
    border-radius: 100px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  }

  .lux-user-info {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .lux-user-name {
    font-size: 13px;
    font-weight: 700;
    color: #0f172a;
  }

  .lux-user-role {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
  }

  .lux-logout-btn {
    width: 34px;
    height: 34px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: none;
    border-radius: 50%;
    color: #475569;
    cursor: pointer;
    transition: all 0.2s;
  }

  .lux-logout-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }

  .lux-content-wrap {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }

  .lux-layout-root.viewer-mode .lux-content-wrap {
    background: #f5f7fb;
  }

  @media (max-width: 992px) {
    .lux-sidebar {
      width: 92px;
    }

    .lux-brand-text,
    .lux-nav-label,
    .lux-menu-title,
    .lux-btn-lang-text {
      display: none;
    }

    .lux-brand {
      justify-content: center;
      padding: 16px 10px;
    }

    .lux-brand-image-wrap {
      width: 60px;
    }

    .lux-brand-image {
      width: 60px;
    }

    .lux-nav {
      padding: 0 10px;
      align-items: center;
    }

    .lux-nav-item {
      justify-content: center;
      width: 100%;
      padding: 12px;
    }

    .lux-sidebar-footer {
      padding: 18px 10px;
    }

    .lux-btn-refresh {
      font-size: 0;
      padding: 12px;
    }

    .lux-btn-refresh::before {
      content: "🔄";
      font-size: 16px;
    }

    .lux-btn-lang {
      font-size: 0;
    }

    .lux-btn-lang::before {
      content: "🌐";
      font-size: 16px;
    }
  }

  @media (max-width: 768px) {
    .lux-layout-root {
      flex-direction: column;
      height: auto;
      min-height: 100vh;
    }

    .lux-sidebar {
      width: 100%;
      height: auto;
    }

    .lux-nav {
      flex-direction: row;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 12px;
      gap: 8px;
    }

    .lux-nav-item {
      min-width: max-content;
      justify-content: center;
    }

    .lux-sidebar-footer {
      padding-top: 0;
    }

    .lux-main {
      height: auto;
      min-height: 0;
    }

    .lux-header {
      height: auto;
      padding: 16px;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  }
`;

const SMARTIT_LAYOUT_CSS = `
  .lux-layout-root {
    background: #f4fbfe;
  }

  .lux-sidebar {
    background: #ffffff;
    color: #102033;
    border-right: 1px solid #d6edf5;
    box-shadow: 8px 0 28px rgba(15, 111, 140, 0.09);
  }

  .lux-sidebar::after {
    background: linear-gradient(180deg, rgba(24,169,212,0.5), rgba(24,169,212,0));
  }

  .lux-brand {
    min-height: 116px;
    padding: 22px 18px 18px;
    background: #ffffff;
    border-bottom: 1px solid #d8edf6;
    margin: 0 0 12px;
  }

  .lux-brand-row {
    gap: 10px;
  }

  .lux-brand-image-wrap {
    width: 226px;
    height: 66px;
    min-height: 0;
    padding: 0;
    background: transparent;
    border-radius: 0;
    overflow: visible;
    box-shadow: none;
  }

  .lux-brand-image {
    width: 226px;
    height: 66px;
    object-fit: contain;
    object-position: center;
    filter: none;
    transform: none;
  }

  .lux-brand-divider {
    margin: 0 20px 14px;
    background: linear-gradient(90deg, transparent, rgba(21,125,155,0.24), transparent);
  }

  .lux-menu-title {
    color: #587184 !important;
  }

  .lux-nav-item {
    color: #637083;
    font-weight: 700;
  }

  .lux-nav-item:hover {
    background: #eef9fd;
    color: #0f6f8c;
  }

  .lux-nav-item.active {
    background: linear-gradient(90deg, #dff4fb 0%, #f7fcfe 100%);
    color: #0f6f8c;
    box-shadow: inset 0 0 0 1px rgba(24,169,212,0.28);
  }

  .lux-nav-item.active::before {
    background: #18a9d4;
    box-shadow: 0 0 14px rgba(24,169,212,0.5);
  }

  .lux-sidebar-footer {
    border-top: 1px solid #dcecf3;
  }

  .lux-btn-refresh {
    background: linear-gradient(135deg, #157d9b, #18a9d4);
    color: #ffffff;
    border: 1px solid rgba(21,125,155,0.2);
  }

  .lux-btn-refresh:hover:not(:disabled) {
    background: linear-gradient(135deg, #0f6f8c, #159bc4);
  }

  .lux-btn-lang {
    color: #637083;
  }

  .lux-btn-lang:hover {
    color: #0f6f8c;
  }

  .lux-header {
    background: rgba(255,255,255,0.92);
    border-bottom-color: #d8edf6;
  }

  .lux-page-title,
  .lux-user-name {
    color: #102033;
  }

  .lux-user-card {
    border-color: #d8edf6;
  }

  .lux-logout-btn:hover {
    background: #e9f8fc;
    color: #0f6f8c;
  }

  .lux-content-wrap {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.92), rgba(232,247,252,0.96)),
      linear-gradient(90deg, rgba(24,169,212,0.08), rgba(255,255,255,0));
  }

  .lux-layout-root.viewer-mode .lux-sidebar {
    background: #ffffff;
    color: #102033;
    border-right: 1px solid #d6edf5;
    box-shadow: 8px 0 28px rgba(15, 111, 140, 0.09);
  }

  .lux-layout-root.viewer-mode .lux-brand {
    background: #ffffff;
  }

  .lux-layout-root.viewer-mode .lux-nav-item {
    color: #637083;
  }

  .lux-layout-root.viewer-mode .lux-nav-item:hover {
    background: #eef9fd;
    color: #0f6f8c;
  }

  .lux-layout-root.viewer-mode .lux-nav-item.active {
    background: linear-gradient(90deg, #dff4fb 0%, #f7fcfe 100%);
    color: #0f6f8c;
    box-shadow: inset 0 0 0 1px rgba(24,169,212,0.28);
  }

  .lux-layout-root.viewer-mode .lux-nav-item.active::before {
    background: #18a9d4;
    box-shadow: 0 0 14px rgba(24,169,212,0.5);
  }

  .lux-layout-root.viewer-mode .lux-content-wrap {
    background:
      linear-gradient(135deg, rgba(255,255,255,0.94), rgba(232,247,252,0.96)),
      linear-gradient(90deg, rgba(24,169,212,0.08), rgba(255,255,255,0));
  }

  .lux-home-root {
    background:
      linear-gradient(135deg, rgba(15,120,150,0.08), rgba(255,255,255,0) 42%),
      transparent !important;
  }

  .lux-sec-title {
    color: #102033 !important;
  }

  .lux-sec-title::after {
    content: "";
    display: block;
    width: 72px;
    height: 4px;
    margin-top: 10px;
    border-radius: 999px;
    background: linear-gradient(90deg, #0f7896, #18a9d4);
  }

  .lux-kpi-card {
    border-color: #d8edf6 !important;
    box-shadow: 0 16px 36px rgba(15,111,140,0.08) !important;
  }

  .lux-kpi-card::before {
    height: 5px !important;
    background: linear-gradient(90deg, #0f7896, #18a9d4) !important;
    opacity: 1 !important;
  }

  .lux-kpi-icon {
    background: #e4f7fc !important;
    color: #0f7896 !important;
  }

  .lux-kpi-val {
    color: #082536 !important;
  }

  .lux-panel,
  .lux-chart-card {
    border-color: #d8edf6 !important;
  }

  .gates-page {
    padding: 32px;
  }

  .gates-hero {
    min-height: 320px;
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    gap: 28px;
    align-items: stretch;
    background: linear-gradient(135deg, #0f6f8c 0%, #18a9d4 58%, #ffffff 58%, #ffffff 100%);
    border: 1px solid #cfe7f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 24px 50px rgba(15, 111, 140, 0.16);
  }

  .gates-copy {
    padding: 46px;
    color: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .gates-eyebrow {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    opacity: 0.86;
  }

  .gates-copy h1 {
    margin: 14px 0;
    font-size: clamp(36px, 5vw, 62px);
    line-height: 0.95;
    letter-spacing: 0;
  }

  .gates-copy p {
    max-width: 620px;
    margin: 0;
    color: rgba(255,255,255,0.88);
    font-size: 16px;
    line-height: 1.7;
    font-weight: 600;
  }

  .gates-visual {
    min-height: 320px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, rgba(255,255,255,0.82), rgba(235,247,252,0.95));
  }

  .gate-frame {
    width: min(78%, 430px);
    aspect-ratio: 1.7 / 1;
    border: 10px solid #0f6f8c;
    border-bottom-width: 16px;
    border-radius: 6px 6px 0 0;
    position: relative;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    padding: 0 18px;
    align-items: stretch;
    box-shadow: 0 20px 40px rgba(15,111,140,0.16);
  }

  .gate-frame span {
    width: 8px;
    justify-self: center;
    background: linear-gradient(180deg, #18a9d4, #0f6f8c);
  }

  .gate-barrier {
    position: absolute;
    width: min(62%, 360px);
    height: 18px;
    right: 12%;
    bottom: 88px;
    border: 3px solid #0f6f8c;
    border-radius: 999px;
    background: repeating-linear-gradient(135deg, #ffffff 0 22px, #18a9d4 22px 44px);
    transform: rotate(-8deg);
  }

  .gate-base {
    position: absolute;
    width: min(82%, 470px);
    height: 18px;
    bottom: 54px;
    border-radius: 999px;
    background: #102033;
    opacity: 0.12;
  }

  .gates-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-top: 22px;
  }

  .gate-card {
    background: #ffffff;
    border: 1px solid #d8edf6;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 14px 34px rgba(15,111,140,0.08);
  }

  .gate-card-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    border-radius: 8px;
    background: #e7f7fc;
    color: #0f6f8c;
    font-weight: 900;
  }

  .gate-card h2 {
    margin: 0 0 8px;
    color: #102033;
    font-size: 18px;
  }

  .gate-card p {
    margin: 0;
    color: #637083;
    line-height: 1.6;
    font-size: 13px;
    font-weight: 600;
  }

  @media (max-width: 1100px) {
    .gates-hero,
    .gates-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 768px) {
    .lux-brand-image-wrap {
      width: 62px;
      height: 24px;
    }

    .lux-brand-image {
      width: 62px;
      height: 24px;
    }

    .gates-page {
      padding: 18px;
    }

    .gates-hero,
    .gates-grid {
      grid-template-columns: 1fr;
    }

    .gates-copy {
      padding: 32px 24px;
    }
  }
`;

function getLabel({ tabLabels, t, key, labelKey }) {
  if (tabLabels?.[key]) return tabLabels[key];

  if (key === "software") {
    return t?.software || "Software";
  }

  if (key === "gates") {
    return t?.gates || "Gates";
  }

  return t?.[labelKey] || key.charAt(0).toUpperCase() + key.slice(1);
}

export function DashboardLayout({
  tab,
  tabs = [],
  tabLabels = {},
  onChangeTab,
  onRefresh,
  loading = false,
  children,
  currentUser = null,
  readOnly = false,
  onLogout,
}) {
  const { t, lang, toggleLang } = useLang();

  useEffect(() => {
    let el = document.getElementById("lux-nav-css");

    if (!el) {
      el = document.createElement("style");
      el.id = "lux-nav-css";
      document.head.appendChild(el);
    }

    el.innerHTML = LUX_NAV_CSS + SMARTIT_LAYOUT_CSS;
  }, []);

  const navItems = NAV_ITEMS.filter((item) => tabs.includes(item.key));

  const pageTitle =
    tabLabels[tab] ||
    (tab === "software"
      ? t.software || "Software"
      : tab === "gates"
        ? t.gates || "Gates"
        : t[tab] || tab.charAt(0).toUpperCase() + tab.slice(1));

  return (
    <div className={`lux-layout-root ${readOnly ? "viewer-mode" : ""}`}>
      <aside className="lux-sidebar">
        <div className="lux-brand">
          <div className="lux-brand-row">
            <div className="lux-brand-image-wrap">
              <img
                src={smartitLogo}
                alt="SmartIT logo"
                className="lux-brand-image"
              />
            </div>
          </div>
        </div>

        <div className="lux-brand-divider" />

        <nav className="lux-nav">
          <div
            className="lux-menu-title"
            style={{
              fontSize: "11px",
              fontWeight: 800,
              color: "#475569",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: "8px",
              marginTop: "10px",
            }}
          >
            {lang === "ar" ? "القائمة" : "Menu"}
          </div>

          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`lux-nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => onChangeTab?.(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>

              <span className="lux-nav-label">
                {getLabel({
                  tabLabels,
                  t,
                  key: item.key,
                  labelKey: item.labelKey,
                })}
              </span>
            </button>
          ))}
        </nav>

        <div className="lux-sidebar-footer">
          <button
            type="button"
            className="lux-btn-refresh"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading
              ? lang === "ar"
                ? "جاري المزامنة..."
                : "Syncing..."
              : lang === "ar"
                ? "🔄 تحديث البيانات"
                : "🔄 Refresh Data"}
          </button>

          <button type="button" className="lux-btn-lang" onClick={toggleLang}>
            <span className="lux-btn-lang-text">
              {lang === "ar" ? "English Version" : "النسخة العربية"}
            </span>
          </button>
        </div>
      </aside>

      <main className="lux-main">
        <header className="lux-header">
          <div>
            <h2 className="lux-page-title">{pageTitle}</h2>

            <p className="lux-page-sub">
              {readOnly
                ? lang === "ar"
                  ? "وصول مخصص للمتابعة التشغيلية"
                  : "Operational Monitoring Access"
                : lang === "ar"
                  ? "لوحة تحكم إدارية للنظام"
                  : "System Administrative Control"}
            </p>
          </div>

          {currentUser && (
            <div className="lux-user-card">
              <div className="lux-user-info">
                <span className="lux-user-name">
                  {currentUser.fullName || currentUser.email || "Admin"}
                </span>

                <span className="lux-user-role">
                  {readOnly
                    ? lang === "ar"
                      ? "مراقبة"
                      : "Monitor"
                    : currentUser?.role?.name || "Admin"}
                </span>
              </div>

              <button
                type="button"
                className="lux-logout-btn"
                onClick={onLogout}
                title="Logout"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </header>

        <div className="lux-content-wrap">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;