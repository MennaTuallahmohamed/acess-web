import { useEffect, useMemo, useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { AuthPanel } from "./components/AuthPanel";
import { DashboardLayout } from "./components/DashboardLayout";

import { AnalyticsPage } from "./pages/AnalyticsPage";
import SummaryAdminPage from "./pages/AdminSummaryPage.jsx";
import { DevicesPage } from "./pages/DevicesPage";
import { GatesPage } from "./pages/GatesPage";
import { HomePage } from "./pages/HomePage";
import ViewerInspectionsPage from "./pages/monitoring/ViewerInspectionsPage.jsx";
import InspectionsPage from "./pages/InspectionsPage.jsx";
import { LocationsPage } from "./pages/LocationsPage";
import { TasksPage } from "./pages/TasksPage";
import { TechniciansPage } from "./pages/TechniciansPage";
import { TechniciansDetailPage } from "./pages/TechniciansDetailPage";
import { OperationsSnapshotPage } from "./pages/OperationsSnapshotPage";
import { SoftwarePage } from "./pages/SoftwarePage";
import SoftwareProblemPage from "./pages/SoftwareProblemPage";
import SoftwareAdminPage from "./pages/SoftwareAdminPage";
import TroubleshootingManagement from "./pages/TroubleshootingManagement";
import GlassesAdminPage from "./pages/GlassesAdminPage.jsx";

import {
  authenticateUser,
  createAccessAccount,
  createTask,
  createUser,
  deleteTask,
  getApiConfig,
  getDashboardSummary,
  getDeviceStatusHistoryByDevice,
  getDevices,
  getInspections,
  getLocations,
  getTasks,
  getTechnicianPerformance,
  getUsers,
  resolveUserAccessRole,
  setApiConfig,
  updateTaskStatus,
} from "./services/api";

const TABS = [
  "home",
  "summary",
  "tasks",
  "software",
  "technicians",
  "devices",
  "gates",
  "inspections",
  "glasses",
  "troubleshooting",
  "analytics",
  "locations",
  "accounts",
];

const TAB_LABELS = {
  home: "Home",
  summary: "Summary",
  tasks: "Tasks",
  software: "Software",
  technicians: "Technicians",
  devices: "Devices",
  gates: "Gates",
  inspections: "Inspections",
  glasses: "Gate Glass",
  troubleshooting: "Troubleshooting",
  analytics: "Analytics",
  locations: "Locations",
  accounts: "Accounts",
};

const AUTH_STORAGE_KEY = "dashboard_auth_user";

const isTechnician = (u) => {
  const roleName = String(u?.role?.name || u?.role || "").toUpperCase();
  const jobTitle = String(u?.jobTitle || "").toLowerCase();

  const titleLooksTechnical =
    jobTitle.includes("technician") ||
    jobTitle.includes("tech") ||
    jobTitle.includes("inspector") ||
    jobTitle.includes("software") ||
    jobTitle.includes("morpho") ||
    jobTitle.includes("فني");

  return roleName === "TECHNICIAN" || titleLooksTechnical;
};

const isSoftwareEntryUser = (u) => {
  const roleName = String(u?.role?.name || u?.role || "").toUpperCase();

  const text = [
    u?.fullName,
    u?.name,
    u?.username,
    u?.email,
    u?.jobTitle,
    roleName,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    roleName === "TECHNICIAN" ||
    text.includes("فرج") ||
    text.includes("farag") ||
    text.includes("software") ||
    text.includes("morpho") ||
    text.includes("فني")
  );
};

function SoftwareUserShell({ currentUser, onLogout }) {
  const [softwareView, setSoftwareView] = useState(() =>
    window.location.hash === "#software-problems" ? "problems" : "center"
  );

  useEffect(() => {
    const syncSoftwareView = () => {
      setSoftwareView(window.location.hash === "#software-problems" ? "problems" : "center");
    };
    window.addEventListener("hashchange", syncSoftwareView);
    return () => window.removeEventListener("hashchange", syncSoftwareView);
  }, []);

  const openProblems = () => {
    window.location.hash = "software-problems";
  };

  const openCenter = () => {
    window.location.hash = "software";
  };

  const styles = `
    .software-user-shell{
      min-height:100vh;
      background:#f4fbfe;
    }

    .software-user-topbar{
      min-height:68px;
      padding:0 34px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:16px;
      background:rgba(255,255,255,.94);
      border-bottom:1px solid #e7eef3;
      box-shadow:0 4px 18px rgba(15,23,42,.04);
      position:sticky;
      top:0;
      z-index:50;
    }

    .software-user-brand{
      display:flex;
      align-items:center;
      gap:12px;
    }

    .software-user-brand h1{
      margin:0;
      color:#102033;
      font-size:18px;
      font-weight:1000;
      letter-spacing:-.4px;
    }

    .software-user-brand p{
      margin:3px 0 0;
      color:#637083;
      font-size:12px;
      font-weight:800;
    }

    .software-user-chip{
      display:flex;
      align-items:center;
      gap:12px;
      background:#fff;
      border:1px solid #d8edf6;
      border-radius:999px;
      padding:7px 8px 7px 16px;
      box-shadow:0 8px 22px rgba(15,111,140,.06);
    }

    .software-user-chip strong{
      color:#102033;
      font-size:13px;
      font-weight:1000;
      display:block;
    }

    .software-user-chip span{
      color:#637083;
      font-size:11px;
      font-weight:900;
      text-transform:uppercase;
      display:block;
      text-align:right;
    }

    .software-logout{
      width:36px;
      height:36px;
      border:0;
      border-radius:50%;
      background:#eef9fd;
      color:#0f6f8c;
      cursor:pointer;
      font-weight:1000;
      transition:.2s;
    }

    .software-logout:hover{
      background:#fee2e2;
      color:#ef4444;
    }

    @media(max-width:650px){
      .software-user-topbar{
        height:auto;
        padding:14px 18px;
        flex-direction:column;
        align-items:flex-start;
      }

      .software-user-chip{
        width:100%;
        justify-content:space-between;
        border-radius:18px;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>

      <div className="software-user-shell">
        <header className="software-user-topbar">
          <div className="software-user-brand">
            <div>
              <h1>Software & Morpho Center</h1>
              <p>Assigned work, Morpho review, and activity history</p>
            </div>
          </div>

          <div className="software-user-chip">
            <div>
              <strong>
                {currentUser?.fullName ||
                  currentUser?.name ||
                  currentUser?.username ||
                  currentUser?.email ||
                  "User"}
              </strong>
              <span>Software User</span>
            </div>

            <button
              type="button"
              className="software-logout"
              onClick={onLogout}
              title="Logout"
            >
              ⎋
            </button>
          </div>
        </header>

        {softwareView === "problems" ? (
          <SoftwareProblemPage currentUser={currentUser} onBack={openCenter} />
        ) : (
          <SoftwarePage currentUser={currentUser} onOpenProblems={openProblems} />
        )}
      </div>
    </>
  );
}

function App() {
  const [tab, setTab] = useState("home");
  const [detailView, setDetailView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quickTaskFilter, setQuickTaskFilter] = useState(null);
  const [config, setConfig] = useState(() => getApiConfig());

  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [performance, setPerformance] = useState([]);

  const technicians = useMemo(() => users.filter(isTechnician), [users]);

  const accessRole = resolveUserAccessRole(authUser);
  const canManage = accessRole === "admin";

  const persistAuthUser = (user) => {
    const normalizedUser = user
      ? {
          ...user,
          accessRole: resolveUserAccessRole(user),
        }
      : null;

    setAuthUser(normalizedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
  };

  const clearAuthUser = () => {
    setAuthUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    setSummary(null);
    setUsers([]);
    setTasks([]);
    setDevices([]);
    setLocations([]);
    setInspections([]);
    setPerformance([]);
    setTab("home");
    setDetailView(null);
    setError("");
    setQuickTaskFilter(null);
  };

  const syncAll = async () => {
    if (!config.baseUrl || !authUser) return;

    setLoading(true);
    setError("");

    try {
      const dashboardResult = await getDashboardSummary().catch((err) => err);

      if (!(dashboardResult instanceof Error)) {
        setSummary(dashboardResult);
      }

      const requests = [
        getUsers(),
        getTasks(),
        getDevices(),
        getLocations(),
        getInspections(),
      ];

      if (accessRole !== "viewer") {
        requests.push(getTechnicianPerformance());
      }

      const results = await Promise.allSettled(requests);

      const [usersR, tasksR, devicesR, locationsR, inspectionsR, performanceR] =
        results;

      if (usersR?.status === "fulfilled") setUsers(usersR.value);
      if (tasksR?.status === "fulfilled") setTasks(tasksR.value);
      if (devicesR?.status === "fulfilled") setDevices(devicesR.value);
      if (locationsR?.status === "fulfilled") setLocations(locationsR.value);
      if (inspectionsR?.status === "fulfilled") setInspections(inspectionsR.value);

      if (accessRole !== "viewer") {
        if (performanceR?.status === "fulfilled") {
          setPerformance(performanceR.value);
        }
      } else {
        setPerformance([]);
      }

      const firstRejected = results.find((r) => r.status === "rejected");

      const firstError =
        dashboardResult instanceof Error
          ? dashboardResult
          : firstRejected?.reason;

      if (firstError) {
        setError(firstError.message || String(firstError));
      }
    } catch (err) {
      setError(err.message || "Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setApiConfig(config);
  }, [config]);

  useEffect(() => {
    if (!config.baseUrl || !authUser) return;

    if (accessRole !== "admin" && isSoftwareEntryUser(authUser)) return;

    syncAll();
  }, [config.baseUrl, authUser?.id, accessRole]);

  const handleSaveConfig = async (nextConfig) => {
    setConfig(nextConfig);
    setApiConfig(nextConfig);
  };

  const handleLogin = async (payload) => {
    setLoading(true);

    try {
      const user = await authenticateUser(payload);
      persistAuthUser(user);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (payload) => {
    setLoading(true);

    try {
      const user = await createAccessAccount(payload);
      persistAuthUser(user);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (payload) => {
    if (!canManage) {
      throw new Error("Viewer accounts can only view dashboard data.");
    }

    await createUser(payload);
    await syncAll();
  };

  const handleCreateTask = async (payload) => {
    if (!canManage) {
      throw new Error("Viewer accounts can only view dashboard data.");
    }

    await createTask(payload);
    await syncAll();
  };

  const handleTaskStatus = async (id, status) => {
    if (!canManage) {
      throw new Error("Viewer accounts can only view dashboard data.");
    }

    await updateTaskStatus(id, status);
    await syncAll();
  };

  const handleDeleteTask = async (id) => {
    if (!canManage) {
      throw new Error("Viewer accounts can only view dashboard data.");
    }

    await deleteTask(id);
    await syncAll();
  };

  const handleChangeTab = (nextTab) => {
    setTab(nextTab);
    setDetailView(null);

    if (nextTab !== "tasks") {
      setQuickTaskFilter(null);
    }
  };

  const handleOpenFromHome = (action) => {
    if (action === "technicians") {
      setDetailView("technicians");
      return;
    }

    if (action === "devices") {
      setDetailView("devices");
      return;
    }

    if (action === "tasks_completed") {
      setQuickTaskFilter({ status: "COMPLETED", emergency: false });
      setTab("tasks");
      setDetailView(null);
      return;
    }

    if (action === "tasks_pending") {
      setQuickTaskFilter({ status: "PENDING", emergency: false });
      setTab("tasks");
      setDetailView(null);
      return;
    }

    if (action === "tasks_emergency") {
      setQuickTaskFilter({ status: "ALL", emergency: true });
      setTab("tasks");
      setDetailView(null);
      return;
    }

    if (action === "inspections_monthly") {
      setTab("inspections");
      setDetailView(null);
      return;
    }

    if (action === "troubleshooting") {
      setTab("troubleshooting");
      setDetailView(null);
      return;
    }

    if (action === "software") {
      setTab("software");
      setDetailView(null);
    }
  };

  const handleOpenHistory = async (deviceId) => {
    try {
      return await getDeviceStatusHistoryByDevice(deviceId);
    } catch {
      return [];
    }
  };

  if (!authUser) {
    return <AuthPage onLogin={handleLogin} loading={loading} />;
  }

  if (accessRole !== "admin" && isSoftwareEntryUser(authUser)) {
    return <SoftwareUserShell currentUser={authUser} onLogout={clearAuthUser} />;
  }

  if (accessRole === "viewer") {
    return (
      <OperationsSnapshotPage
        tab={tab}
        setTab={setTab}
        currentUser={authUser}
        onLogout={clearAuthUser}
        onRefresh={syncAll}
        loading={loading}
        devices={devices}
        locations={locations}
        inspections={inspections}
      />
    );
  }

  return (
    <DashboardLayout
      tab={tab}
      tabs={TABS}
      tabLabels={TAB_LABELS}
      onChangeTab={handleChangeTab}
      onRefresh={syncAll}
      loading={loading}
      currentUser={authUser}
      readOnly={!canManage}
      onLogout={clearAuthUser}
    >
      {!config.baseUrl ? (
        <p className="error-box">
          Missing API base URL. Set <code>VITE_API_BASE_URL</code> in `.env` then
          restart <code>npm run dev</code>.
        </p>
      ) : null}

      {error ? <p className="error-box">{error}</p> : null}

      {detailView === "technicians" ? (
        <TechniciansDetailPage
          technicians={technicians}
          onBack={() => setDetailView(null)}
        />
      ) : null}

      {detailView === "devices" ? (
        <DevicesPage
          devices={devices}
          inspections={inspections}
          onBack={() => setDetailView(null)}
        />
      ) : null}

      {detailView === null ? (
        <>
          {tab === "home" ? (
            <HomePage
              summary={summary}
              techniciansCount={technicians.length}
              tasks={tasks}
              inspections={inspections}
              onOpen={handleOpenFromHome}
              canManage={canManage}
            />
          ) : null}

          {tab === "summary" ? (
            <SummaryAdminPage
              summary={summary}
              tasks={tasks}
              devices={devices}
              inspections={inspections}
              locations={locations}
              technicians={technicians}
            />
          ) : null}

          {tab === "tasks" ? (
            <TasksPage
              tasks={tasks}
              technicians={technicians}
              devices={devices}
              inspections={inspections}
              quickFilter={quickTaskFilter}
              onConsumeQuickFilter={() => setQuickTaskFilter(null)}
              onCreateTask={handleCreateTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleTaskStatus}
              loading={loading}
              canManage={canManage}
            />
          ) : null}

          {tab === "software" ? (
            <SoftwareAdminPage currentUser={authUser} />
          ) : null}

          {tab === "technicians" ? (
            <TechniciansPage
              technicians={technicians}
              tasks={tasks}
              inspections={inspections}
              performance={performance}
              onCreateUser={handleCreateUser}
              loading={loading}
              canManage={canManage}
            />
          ) : null}

          {tab === "devices" ? (
            <DevicesPage
              devices={devices}
              inspections={inspections}
              onOpenHistory={handleOpenHistory}
            />
          ) : null}

          {tab === "gates" ? <GatesPage /> : null}

          {tab === "inspections" ? (
            canManage ? (
              <InspectionsPage
                inspections={inspections}
                devices={devices}
                technicians={technicians}
                locations={locations}
                apiBase={config.baseUrl}
              />
            ) : (
              <ViewerInspectionsPage
                inspections={inspections}
                lang="en"
                apiBaseUrl={config.baseUrl}
              />
            )
          ) : null}

          {tab === "glasses" ? <GlassesAdminPage /> : null}

          {tab === "troubleshooting" ? <TroubleshootingManagement /> : null}

          {tab === "analytics" ? (
            <AnalyticsPage
              tasks={tasks}
              devices={devices}
              inspections={inspections}
              technicians={technicians}
            />
          ) : null}

          {tab === "locations" ? <LocationsPage locations={locations} /> : null}

          {tab === "accounts" ? (
            <div style={{ padding: "20px" }}>
              <h2 style={{ marginBottom: "20px" }}>Account Management</h2>

              <div
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: "24px",
                }}
              >
                <AuthPanel
                  config={config}
                  onSaveConfig={handleSaveConfig}
                  onLogin={handleLogin}
                  onRegister={handleRegister}
                  loading={loading}
                />
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </DashboardLayout>
  );
}

export default App;