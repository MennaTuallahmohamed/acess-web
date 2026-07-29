import { useLang } from "../context/LanguageContext";

const NAV_ITEMS = [
  { key: "home", icon: "🏠", labelKey: "home" },
  { key: "tasks", icon: "📋", labelKey: "tasks" },
  { key: "software", icon: "💻", labelKey: "software" },
  { key: "technicians", icon: "👷", labelKey: "technicians" },
  { key: "devices", icon: "🔧", labelKey: "devices" },
  { key: "gates", icon: "🚧", labelKey: "gates" },
  { key: "inspections", icon: "🔍", labelKey: "inspections" },
  { key: "analytics", icon: "📊", labelKey: "analytics" },
  { key: "locations", icon: "📍", labelKey: "locations" },
];

const PAGE_ICONS = {
  home: "🏠",
  tasks: "📋",
  software: "💻",
  technicians: "👷",
  devices: "🔧",
  gates: "🚧",
  inspections: "🔍",
  analytics: "📊",
  locations: "📍",
};

function getPageLabel(t, key, labelKey) {
  if (key === "gates") return t.gates || "Gates";
  if (key === "software") return t.software || "Software";
  return t[labelKey || key] || key;
}

const layoutStyles = `
.app-shell{
  min-height:100vh;
  display:flex;
  background:#f4f8fb;
  color:#172331;
  font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
}

.sidebar{
  width:280px;
  min-height:100vh;
  background:linear-gradient(180deg,#147394 0%,#0f607d 45%,#0b2638 100%);
  color:#fff;
  padding:28px 20px;
  display:flex;
  flex-direction:column;
  position:sticky;
  top:0;
  box-shadow:10px 0 30px rgba(15,23,42,.12);
}

.brand-wrap{
  display:flex;
  align-items:center;
  gap:14px;
  padding:18px;
  border-radius:22px;
  background:rgba(255,255,255,.10);
  border:1px solid rgba(255,255,255,.16);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18);
  margin-bottom:28px;
}

.brand-icon{
  width:54px;
  height:54px;
  border-radius:16px;
  background:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 12px 26px rgba(0,0,0,.16);
  flex-shrink:0;
}

.brand-icon img{
  width:34px !important;
  height:34px !important;
  object-fit:contain;
}

.brand-text h1{
  margin:0;
  font-size:18px;
  font-weight:900;
  letter-spacing:-.4px;
}

.brand-text p{
  margin:5px 0 0;
  font-size:12px;
  color:rgba(255,255,255,.72);
  font-weight:600;
  line-height:1.35;
}

.side-nav{
  display:flex;
  flex-direction:column;
  gap:8px;
  flex:1;
}

.tab-btn{
  width:100%;
  min-height:48px;
  border:0;
  border-radius:15px;
  background:transparent;
  color:rgba(255,255,255,.78);
  display:flex;
  align-items:center;
  gap:12px;
  padding:0 16px;
  cursor:pointer;
  font-size:14px;
  font-weight:800;
  text-align:left;
  transition:.22s;
  font-family:inherit;
}

.tab-btn:hover{
  background:rgba(255,255,255,.10);
  color:#fff;
  transform:translateX(3px);
}

.tab-btn.active{
  background:#fff;
  color:#147394;
  box-shadow:
    0 14px 30px rgba(0,0,0,.16),
    inset 0 1px 0 rgba(255,255,255,.9);
}

.tab-icon{
  width:28px;
  height:28px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:10px;
  background:rgba(255,255,255,.12);
  font-size:15px;
  flex-shrink:0;
}

.tab-btn.active .tab-icon{
  background:rgba(20,115,148,.12);
}

.tab-label{
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.sidebar-footer{
  margin-top:28px;
  padding-top:20px;
  border-top:1px solid rgba(255,255,255,.14);
  display:flex;
  flex-direction:column;
  gap:10px;
}

.refresh-btn,
.lang-btn{
  width:100%;
  min-height:44px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.16);
  background:rgba(255,255,255,.10);
  color:#fff;
  cursor:pointer;
  font-size:13px;
  font-weight:800;
  font-family:inherit;
  transition:.2s;
}

.refresh-btn:hover,
.lang-btn:hover{
  background:rgba(255,255,255,.18);
}

.refresh-btn:disabled{
  opacity:.7;
  cursor:not-allowed;
}

.spinner{
  display:inline-block;
  margin-right:6px;
  animation:spin .8s linear infinite;
}

@keyframes spin{
  to{transform:rotate(360deg);}
}

.content{
  flex:1;
  min-width:0;
  padding:24px;
}

.topbar{
  min-height:76px;
  background:rgba(255,255,255,.92);
  backdrop-filter:blur(18px);
  border:1px solid #e3edf3;
  border-radius:24px;
  padding:16px 20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  box-shadow:0 18px 42px rgba(15,23,42,.06);
  margin-bottom:22px;
}

.page-title-group{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}

.page-title-icon{
  width:46px;
  height:46px;
  border-radius:15px;
  background:linear-gradient(135deg,#147394,#18a7d4);
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:20px;
  box-shadow:0 12px 24px rgba(20,115,148,.22);
  flex-shrink:0;
}

.page-title-group h2{
  margin:0;
  font-size:22px;
  font-weight:900;
  color:#172331;
  letter-spacing:-.4px;
}

.user-chip{
  display:flex;
  align-items:center;
  gap:12px;
  padding:8px 10px 8px 16px;
  border-radius:999px;
  background:#f7fbfd;
  border:1px solid #dcebf2;
  box-shadow:0 8px 20px rgba(15,23,42,.04);
  flex-shrink:0;
}

.user-chip-info{
  display:flex;
  flex-direction:column;
  line-height:1.2;
  min-width:0;
}

.user-chip-info strong{
  font-size:13px;
  font-weight:900;
  color:#172331;
  max-width:220px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}

.link-btn{
  min-height:36px;
  padding:0 14px;
  border:0;
  border-radius:999px;
  background:linear-gradient(135deg,#147394,#18a7d4);
  color:#fff;
  font-size:13px;
  font-weight:900;
  cursor:pointer;
  font-family:inherit;
  box-shadow:0 10px 22px rgba(20,115,148,.22);
}

.link-btn:hover{
  transform:translateY(-1px);
}

@media(max-width:900px){
  .app-shell{
    flex-direction:column;
  }

  .sidebar{
    width:100%;
    min-height:auto;
    position:relative;
    padding:18px;
  }

  .brand-wrap{
    margin-bottom:18px;
  }

  .side-nav{
    display:grid;
    grid-template-columns:repeat(2,1fr);
  }

  .tab-btn:hover{
    transform:none;
  }

  .content{
    padding:16px;
  }

  .topbar{
    border-radius:20px;
  }
}

@media(max-width:520px){
  .side-nav{
    grid-template-columns:1fr;
  }

  .topbar{
    flex-direction:column;
    align-items:flex-start;
  }

  .page-title-group h2{
    font-size:20px;
  }

  .user-chip{
    width:100%;
    justify-content:space-between;
    border-radius:18px;
  }

  .user-chip-info strong{
    max-width:180px;
  }
}
`;

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

  const currentPageLabel =
    tab === "software"
      ? t.software || "Software"
      : tab === "gates"
        ? t.gates || "Gates"
        : t[tab] || "Dashboard";

  return (
    <>
      <style>{layoutStyles}</style>

      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-wrap">
            <div className="brand-icon">
              <img src="/favicon.svg" alt="SmartIT logo" />
            </div>

            <div className="brand-text">
              <h1>{t.brand || "SmartIT Inspect"}</h1>
              <p>{t.brandSub || "Security & Smart Solutions"}</p>
            </div>
          </div>

          <nav className="side-nav">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`tab-btn${tab === item.key ? " active" : ""}`}
                onClick={() => onChangeTab?.(item.key)}
                aria-current={tab === item.key ? "page" : undefined}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-label">
                  {getPageLabel(t, item.key, item.labelKey)}
                </span>
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
                <h2>{currentPageLabel}</h2>
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
    </>
  );
}

export default PageLayout;