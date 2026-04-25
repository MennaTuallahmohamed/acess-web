import { useLang } from "../context/LanguageContext";

const NAV_ITEMS = [
  { key: "home", icon: "🏠", labelKey: "home" },
  { key: "tasks", icon: "📋", labelKey: "tasks" },
  { key: "technicians", icon: "👷", labelKey: "technicians" },
  { key: "devices", icon: "🔧", labelKey: "devices" },
  { key: "inspections", icon: "🔍", labelKey: "inspections" },
  { key: "analytics", icon: "📊", labelKey: "analytics" },
  { key: "locations", icon: "📍", labelKey: "locations" },
];

const PAGE_ICONS = {
  home: "🏠",
  tasks: "📋",
  technicians: "👷",
  devices: "🔧",
  inspections: "🔍",
  analytics: "📊",
  locations: "📍",
};

export function PageLayout({
  tab,
  tabs = [],
  onChangeTab,
  onRefresh,
  loading,
  children,
  currentUser,
  onLogout,
}) {
  const { t, lang, toggleLang } = useLang();
  const navItems = NAV_ITEMS.filter((item) => tabs.includes(item.key));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-wrap">
          <div className="brand-icon">⚡</div>
          <div className="brand-text">
            <h1>{t.brand || "Access Dashboard"}</h1>
            <p>{t.brandSub || "Monitoring & Inspection System"}</p>
          </div>
        </div>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`tab-btn${tab === item.key ? " active" : ""}`}
              onClick={() => onChangeTab?.(item.key)}
              aria-current={tab === item.key ? "page" : undefined}
            >
              <span className="tab-icon">{item.icon}</span>
              <span>{t[item.labelKey] || item.key}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="refresh-btn" onClick={onRefresh} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner">⟳</span>
                {t.loading || "Loading..."}
              </>
            ) : (
              <>🔄 {t.refresh || "Refresh"}</>
            )}
          </button>

          <button className="lang-btn" onClick={toggleLang}>
            {lang === "ar" ? "🌐 English" : "🌐 العربية"}
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="page-title-group">
            <div className="page-title-icon">{PAGE_ICONS[tab] || "📌"}</div>
            <div>
              <h2>{t[tab] || "Dashboard"}</h2>
            </div>
          </div>

          {currentUser ? (
            <div className="user-chip">
              <div className="user-chip-info">
                <strong>{currentUser.fullName || currentUser.email}</strong>
              </div>

              {onLogout ? (
                <button type="button" className="link-btn" onClick={onLogout}>
                  Logout
                </button>
              ) : null}
            </div>
          ) : null}
        </header>

        {children}
      </main>
    </div>
  );
}

export default PageLayout;