import React, { useEffect } from "react";
import { useLang } from "../context/LanguageContext";

const NAV_ITEMS = [
  { key: "home", icon: "🏠", labelKey: "home" },
  { key: "tasks", icon: "📋", labelKey: "tasks" },
  { key: "technicians", icon: "👷", labelKey: "technicians" },
  { key: "devices", icon: "🔧", labelKey: "devices" },
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

  /* Sidebar */
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

  /* Brand */
  .lux-brand {
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 16px;
  }

  .lux-brand-icon {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #6366f1, #4338ca);
    border-radius: 12px;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(99,102,241,0.4);
  }

  .lux-brand-text h1 {
    font-size: 20px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.5px;
    color: #fff;
  }

  .lux-brand-text p {
    font-size: 11px;
    font-weight: 500;
    color: #94a3b8;
    margin: 2px 0 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .lux-layout-root.viewer-mode .lux-brand {
    border-bottom: 1px solid #e2e8f0;
  }

  .lux-layout-root.viewer-mode .lux-brand-icon {
    background: linear-gradient(135deg, #eaf0ff, #dbe7ff);
    color: #4f46e5;
    box-shadow: none;
  }

  .lux-layout-root.viewer-mode .lux-brand-text h1 {
    color: #172033;
  }

  .lux-layout-root.viewer-mode .lux-brand-text p {
    color: #7b8798;
  }

  /* Nav */
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

  /* Footer */
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

  /* Main */
  .lux-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }

  /* Header */
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

  /* Content */
  .lux-content-wrap {
    flex: 1;
    overflow-y: auto;
    position: relative;
  }

  .lux-layout-root.viewer-mode .lux-content-wrap {
    background: #f5f7fb;
  }

  /* Responsive */
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
      padding: 20px 12px;
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
      el.innerHTML = LUX_NAV_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const navItems = NAV_ITEMS.filter((item) => tabs.includes(item.key));

  return (
    <div className={`lux-layout-root ${readOnly ? "viewer-mode" : ""}`}>
      <aside className="lux-sidebar">
        <div className="lux-brand">
          <div className="lux-brand-icon">
            <img src="/favicon.svg" alt="SmartIT logo" style={{ width: 26, height: 26 }} />
          </div>
          <div className="lux-brand-text">
            <h1>{t.brand || "SmartIT Inspect"}</h1>
            <p>{t.brandSub || "SmartIT Inspection"}</p>
          </div>
        </div>

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
              className={`lux-nav-item ${tab === item.key ? "active" : ""}`}
              onClick={() => onChangeTab?.(item.key)}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span className="lux-nav-label">
                {tabLabels[item.key] ||
                  t[item.labelKey] ||
                  item.key.charAt(0).toUpperCase() + item.key.slice(1)}
              </span>
            </button>
          ))}
        </nav>

        <div className="lux-sidebar-footer">
          <button className="lux-btn-refresh" onClick={onRefresh} disabled={loading}>
            {loading ? (lang === "ar" ? "جاري المزامنة..." : "Syncing...") : lang === "ar" ? "🔄 تحديث البيانات" : "🔄 Refresh Data"}
          </button>

          <button className="lux-btn-lang" onClick={toggleLang}>
            <span className="lux-btn-lang-text">
              {lang === "ar" ? "English Version" : "النسخة العربية"}
            </span>
          </button>
        </div>
      </aside>

      <main className="lux-main">
        <header className="lux-header">
          <div>
            <h2 className="lux-page-title">
              {tabLabels[tab] ||
                t[tab] ||
                (tab.charAt(0).toUpperCase() + tab.slice(1))}
            </h2>
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

              <button className="lux-logout-btn" onClick={onLogout} title="Logout">
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
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
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