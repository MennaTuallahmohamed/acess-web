import { useEffect, useMemo, useState } from "react";
import { AuthPage } from "./components/AuthPage";
import { AuthPanel } from "./components/AuthPanel";
import { DashboardLayout } from "./components/DashboardLayout";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { DevicesPage } from "./pages/DevicesPage";
import { HomePage } from "./pages/HomePage";
import { InspectionsPage } from "./pages/InspectionsPage";
import { LocationsPage } from "./pages/LocationsPage";
import { TasksPage } from "./pages/TasksPage";
import { TechniciansPage } from "./pages/TechniciansPage";
import { TechniciansDetailPage } from "./pages/TechniciansDetailPage";
import { OperationsSnapshotPage } from "./pages/OperationsSnapshotPage";
import TroubleshootingManagement from "./pages/TroubleshootingManagement";
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
  "tasks",
  "technicians",
  "devices",
  "inspections",
  "troubleshooting",
  "analytics",
  "locations",
  "accounts",
];

const AUTH_STORAGE_KEY = "dashboard_auth_user";

const isTechnician = (u) => {
  const roleName = String(u?.role?.name || "").toUpperCase();
  const jobTitle = String(u?.jobTitle || "").toLowerCase();
  const titleLooksTechnical =
    jobTitle.includes("technician") ||
    jobTitle.includes("tech") ||
    jobTitle.includes("inspector");

  return roleName === "TECHNICIAN" || titleLooksTechnical;
};

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

      const [usersR, tasksR, devicesR, locationsR, inspectionsR, performanceR] = results;

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
    syncAll();
  }, [config.baseUrl, authUser?.id]);

  const handleSaveConfig = async (nextConfig) => {
    setConfig(nextConfig);
    setApiConfig(nextConfig);
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

  const handleLogin = async (payload) => {
    setLoading(true);
    try {
      const user = await authenticateUser(payload);
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
      return;
    }

    if (action === "tasks_pending") {
      setQuickTaskFilter({ status: "PENDING", emergency: false });
      setTab("tasks");
      return;
    }

    if (action === "tasks_emergency") {
      setQuickTaskFilter({ status: "ALL", emergency: true });
      setTab("tasks");
      return;
    }

    if (action === "inspections_monthly") {
      setTab("inspections");
      return;
    }

    if (action === "troubleshooting") {
      setTab("troubleshooting");
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
      onChangeTab={setTab}
      onRefresh={syncAll}
      loading={loading}
      currentUser={authUser}
      readOnly={!canManage}
      onLogout={clearAuthUser}
    >
      {!config.baseUrl ? (
        <p className="error-box">
          Missing API base URL. Set <code>VITE_API_BASE_URL</code> in `.env` then restart{" "}
          <code>npm run dev</code>.
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

          {tab === "inspections" ? (
            <InspectionsPage
              inspections={inspections}
              technicians={technicians}
              locations={locations}
            />
          ) : null}

          {tab === "troubleshooting" ? (
            <TroubleshootingManagement />
          ) : null}

          {tab === "analytics" ? (
            <AnalyticsPage
              tasks={tasks}
              devices={devices}
              inspections={inspections}
              technicians={technicians}
            />
          ) : null}

          {tab === "locations" ? (
            <LocationsPage locations={locations} />
          ) : null}

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
