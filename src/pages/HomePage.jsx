import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

/* ─────────────────────────────────────────────────────────────────
   API CONFIG
───────────────────────────────────────────────────────────────── */
const API_BASE_URL =
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

const buildHeaders = (json = true) => {
  const token = getToken();
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
};

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...buildHeaders(options.body ? true : false),
      ...(options.headers || {}),
    },
  });

  const raw = await res.text();
  let data = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!res.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        (typeof data === "string" ? data : "") ||
        `Request failed: ${res.status}`
    );
  }

  return data;
}

async function tryGet(paths = []) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await apiRequest(path, { method: "GET" });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All GET endpoints failed");
}

function normalizeArrayResponse(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const resolvedInspectionStatuses = new Set([
  "OK",
  "COMPLETED",
  "DONE",
  "RESOLVED",
  "PASSED",
]);

const issueInspectionStatuses = new Set([
  "ISSUE",
  "FAILED",
  "PROBLEM",
  "REJECTED",
  "NEEDS_REPAIR",
  "MAINTENANCE_REQUIRED",
  "NOT_OK",
  "PARTIAL",
]);

const isResolvedInspection = (ins) =>
  resolvedInspectionStatuses.has(
    String(ins?.inspectionStatus || ins?.result || "").toUpperCase()
  );

const isIssueInspection = (ins) => {
  const status = String(ins?.inspectionStatus || ins?.result || "").toUpperCase();

  return (
    issueInspectionStatuses.has(status) ||
    Boolean(ins?.issueReason) ||
    Boolean(ins?.hasIssue) ||
    Boolean(ins?.needsMaintenance)
  );
};

const isEmergencyTask = (task) =>
  task?.priority === "EMERGENCY" ||
  task?.isEmergency === true ||
  /EMERGENCY/i.test(task?.notes || "");

const isCompletedTask = (task) =>
  String(task?.status || "").toUpperCase() === "COMPLETED";

const isPendingTask = (task) =>
  String(task?.status || "").toUpperCase() === "PENDING" ||
  String(task?.status || "").toUpperCase() === "IN_PROGRESS";

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatShortTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTechnicianName = (ins) =>
  ins?.technician?.fullName ||
  ins?.technician?.username ||
  ins?.user?.fullName ||
  ins?.user?.username ||
  ins?.technicianName ||
  "Technician";

const getInspectionTime = (ins) =>
  ins?.inspectedAt || ins?.createdAt || ins?.updatedAt;

const getTaskDate = (task) =>
  task?.scheduledDate || task?.createdAt || task?.updatedAt || null;

const n = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/* ─────────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────────── */
const LUX_HOME_CSS = `
  .lux-home-root { padding: 32px; background: transparent; font-family: 'Inter', system-ui, sans-serif; }
  
  .lux-sec-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
  .lux-sec-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
  
  .lux-top-actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }

  .lux-refresh-btn {
    border: 1px solid #dbe3ef;
    background: #fff;
    color: #334155;
    height: 38px;
    padding: 0 14px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s ease;
  }
  .lux-refresh-btn:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .lux-mini-status {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 12px;
    border-radius: 12px;
  }
  
  .lux-kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
  .lux-kpi-card { 
    background: #fff; border-radius: 20px; padding: 24px; position: relative; overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .lux-kpi-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); border-color: #cbd5e1; }
  .lux-kpi-card::before { content: ''; position: absolute; top:0; left:0; right:0; height:4px; opacity: 0.8; }
  
  .lux-kpi-1::before { background: linear-gradient(90deg, #6366f1, #a855f7); }
  .lux-kpi-2::before { background: linear-gradient(90deg, #10b981, #34d399); }
  .lux-kpi-3::before { background: linear-gradient(90deg, #ef4444, #f87171); }
  .lux-kpi-4::before { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
  .lux-kpi-5::before { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
  .lux-kpi-6::before { background: linear-gradient(90deg, #8b5cf6, #c084fc); }

  .lux-kpi-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
  .lux-kpi-val { font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1; letter-spacing: -1px; }
  .lux-kpi-label { font-size: 13px; font-weight: 700; color: #64748b; margin-top: 6px; }
  .lux-kpi-sub { font-size: 11px; color: #94a3b8; font-weight: 500; margin-top: 4px; }

  .lux-panels { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 32px; }
  @media (max-width: 1200px) { .lux-panels { grid-template-columns: 1fr; } }
  
  .lux-panel { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
  .lux-panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
  .lux-panel-title { font-size: 16px; font-weight: 800; color: #0f172a; }
  .lux-panel-meta { font-size: 12px; font-weight: 700; color: #4f46e5; background: #e0e7ff; padding: 4px 10px; border-radius: 100px; }

  .lux-list-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; border-radius: 8px; }
  .lux-list-item:hover { background: #f8fafc; cursor: pointer; }
  .lux-list-item:last-child { border-bottom: none; }
  
  .lux-li-left { display: flex; align-items: center; gap: 12px; }
  .lux-li-icon { width: 36px; height: 36px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #475569; }
  .lux-li-title { font-size: 14px; font-weight: 700; color: #0f172a; }
  .lux-li-sub { font-size: 11px; font-weight: 500; color: #64748b; }
  
  .lux-li-right { text-align: right; }
  .lux-li-stat { font-size: 13px; font-weight: 800; }
  .lux-li-date { font-size: 11px; font-weight: 600; color: #94a3b8; }

  .lux-home-error {
    margin-bottom: 16px;
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 700;
  }

  .lux-home-loading {
    margin-bottom: 16px;
    background: #ffffff;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 14px 16px;
    font-size: 13px;
    font-weight: 700;
  }
`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0f172a",
          border: "1px solid #334155",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px 0",
            fontWeight: 700,
            color: "#f8fafc",
            fontSize: "13px",
          }}
        >
          {label}
        </p>

        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: entry.color,
              }}
            />

            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#e2e8f0",
              }}
            >
              {entry.name}:
            </span>

            <span
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              {Number(entry.value || 0).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export function HomePage({
  summary,
  techniciansCount,
  tasks = [],
  inspections = [],
  onOpen,
}) {
  const [adminOverview, setAdminOverview] = useState(null);
  const [liveSummary, setLiveSummary] = useState(summary || null);
  const [liveTasks, setLiveTasks] = useState(tasks || []);
  const [liveInspections, setLiveInspections] = useState(inspections || []);
  const [liveTechniciansCount, setLiveTechniciansCount] = useState(
    techniciansCount || 0
  );
  const [liveDevices, setLiveDevices] = useState([]);

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let el = document.getElementById("lux-home-css");

    if (!el) {
      el = document.createElement("style");
      el.id = "lux-home-css";
      el.innerHTML = LUX_HOME_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [
        techniciansCountStatsRes,
        summaryRes,
        tasksRes,
        inspectionsRes,
        techniciansRes,
        devicesRes,
      ] = await Promise.all([
        tryGet(["/inspections/debug/technicians-count"]).catch(() => []),
        tryGet(["/dashboard/summary"]).catch(() => null),
        tryGet(["/inspection-tasks", "/tasks"]).catch(() => []),

        // ده لآخر التفتيشات فقط، مش للإجمالي
        tryGet(["/inspections"]).catch(() => []),

        tryGet([
          "/users?role=technician",
          "/users?type=technician",
          "/users/technicians",
        ]).catch(() => []),

        tryGet(["/devices"]).catch(() => []),
      ]);

      const techniciansStatsList = normalizeArrayResponse(
        techniciansCountStatsRes
      );

      const totalInspectionsFromTechnicians = techniciansStatsList.reduce(
        (sum, item) => sum + Number(item.totalInspections || 0),
        0
      );

      const activeTechniciansFromStats = techniciansStatsList.length;

      setAdminOverview({
        totalInspections: totalInspectionsFromTechnicians,
        activeTechnicians: activeTechniciansFromStats,
      });

      setLiveSummary(summaryRes || null);
      setLiveTasks(normalizeArrayResponse(tasksRes));
      setLiveInspections(normalizeArrayResponse(inspectionsRes));
      setLiveTechniciansCount(normalizeArrayResponse(techniciansRes).length);
      setLiveDevices(normalizeArrayResponse(devicesRes));
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.message || "Failed to load dashboard data from backend.");
    } finally {
      setLoading(false);
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 15000);

    const onFocusRefresh = () => loadDashboardData();
    window.addEventListener("focus", onFocusRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocusRefresh);
    };
  }, [loadDashboardData]);

  const computed = useMemo(() => {
    const allTasks = liveTasks || [];
    const allInspections = liveInspections || [];
    const allDevices = liveDevices || [];

    const activeTechnicians =
      n(liveSummary?.activeTechnicians) ||
      n(liveSummary?.techniciansCount) ||
      liveTechniciansCount ||
      n(adminOverview?.activeTechnicians) ||
      0;

    const totalDevices =
      n(liveSummary?.totalDevices) || allDevices.length || 0;

    const totalInspections =
      n(adminOverview?.totalInspections) ||
      n(liveSummary?.totalInspections) ||
      n(liveSummary?.totalInspected) ||
      0;

    const goodInspections =
      n(liveSummary?.goodInspections) ||
      n(liveSummary?.good) ||
      allInspections.filter(isResolvedInspection).length ||
      0;

    const needsRepair =
      n(liveSummary?.needsMaintenance) ||
      n(liveSummary?.needsMaintenanceDevices) ||
      allInspections.filter(isIssueInspection).length ||
      0;

    const underReview = n(liveSummary?.underReview) || 0;

    const completedTasks =
      n(liveSummary?.completedTasks) ||
      allTasks.filter(isCompletedTask).length ||
      0;

    const pendingTasks =
      n(liveSummary?.pendingTasks) ||
      allTasks.filter(isPendingTask).length ||
      0;

    const emergencyActive =
      n(liveSummary?.emergencyTasks) ||
      allTasks.filter(
        (t) =>
          isEmergencyTask(t) &&
          !["COMPLETED", "CANCELLED"].includes(
            String(t?.status || "").toUpperCase()
          )
      ).length ||
      0;

    const now = startOfDay(new Date());

    const weekBuckets = [0, 1, 2, 3].map((index) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (27 - index * 7));

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      return {
        start,
        end,
      };
    });

    const trendData = weekBuckets.map((bucket, index) => {
      const inspectionsInWeek = allInspections.filter((ins) => {
        const ts = getInspectionTime(ins);
        if (!ts) return false;

        const d = startOfDay(ts);
        return d >= bucket.start && d <= bucket.end;
      });

      const tasksInWeek = allTasks.filter((task) => {
        const ts = getTaskDate(task);
        if (!ts) return false;

        const d = startOfDay(ts);
        return d >= bucket.start && d <= bucket.end;
      });

      return {
        name: `Week ${index + 1}`,
        inspections: inspectionsInWeek.length,
        completed: tasksInWeek.filter(isCompletedTask).length,
      };
    });

    const recentInspections = [...allInspections]
      .sort(
        (a, b) =>
          new Date(getInspectionTime(b)) - new Date(getInspectionTime(a))
      )
      .slice(0, 5);

    return {
      activeTechnicians,
      totalDevices,
      totalInspections,
      goodInspections,
      needsRepair,
      underReview,
      completedTasks,
      pendingTasks,
      emergencyActive,
      trendData,
      recentInspections,
    };
  }, [
    adminOverview,
    liveTasks,
    liveInspections,
    liveDevices,
    liveSummary,
    liveTechniciansCount,
  ]);

  const pieData = useMemo(() => {
    return [
      {
        name: "Good",
        value: computed.goodInspections,
        color: "#10b981",
      },
      {
        name: "Needs Repair",
        value: computed.needsRepair,
        color: "#f59e0b",
      },
      {
        name: "Under Review",
        value: computed.underReview,
        color: "#ef4444",
      },
    ];
  }, [computed]);

  const openSection = (key) => {
    if (typeof onOpen === "function") onOpen(key);
  };

  return (
    <div className="lux-home-root">
      {bootLoading && (
        <div className="lux-home-loading">
          Loading live dashboard data from backend...
        </div>
      )}

      {error && <div className="lux-home-error">{error}</div>}

      <div className="lux-sec-header">
        <div>
          <h2 className="lux-sec-title">Global Overview Tracker</h2>

          <p
            style={{
              marginTop: "4px",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Real-time statistics covering operations across all sectors.
          </p>
        </div>

        <div className="lux-top-actions">
          <div className="lux-mini-status">
            {lastUpdated
              ? `Last update: ${lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : "Waiting for backend..."}
          </div>

          <button
            className="lux-refresh-btn"
            onClick={loadDashboardData}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh now"}
          </button>
        </div>
      </div>

      <div className="lux-kpi-grid">
        <div
          className="lux-kpi-card lux-kpi-1"
          onClick={() => openSection("technicians")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#e0e7ff",
              color: "#4f46e5",
            }}
          >
            👨‍🔧
          </div>

          <div className="lux-kpi-val">
            {computed.activeTechnicians.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Active Technicians</div>
          <div className="lux-kpi-sub">Total field units registered</div>
        </div>

        <div
          className="lux-kpi-card lux-kpi-2"
          onClick={() => openSection("inspections")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#d1fae5",
              color: "#059669",
            }}
          >
            ✅
          </div>

          <div className="lux-kpi-val">
            {computed.totalInspections.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Total Inspections</div>
          <div className="lux-kpi-sub">All inspections from all technicians</div>
        </div>

        <div
          className="lux-kpi-card lux-kpi-3"
          onClick={() => openSection("tasks_emergency")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#fee2e2",
              color: "#e11d48",
            }}
          >
            🚨
          </div>

          <div className="lux-kpi-val">
            {computed.emergencyActive.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Emergency Alerts</div>
          <div className="lux-kpi-sub">Requiring immediate response</div>
        </div>

        <div
          className="lux-kpi-card lux-kpi-4"
          onClick={() => openSection("tasks_pending")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#fef3c7",
              color: "#d97706",
            }}
          >
            ⏱️
          </div>

          <div className="lux-kpi-val">
            {computed.pendingTasks.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Pending Tasks</div>
          <div className="lux-kpi-sub">Live queue from backend</div>
        </div>

        <div
          className="lux-kpi-card lux-kpi-5"
          onClick={() => openSection("devices")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#dbeafe",
              color: "#1d4ed8",
            }}
          >
            📡
          </div>

          <div className="lux-kpi-val">
            {computed.totalDevices.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Total Devices</div>
          <div className="lux-kpi-sub">Registered hardware online</div>
        </div>

        <div
          className="lux-kpi-card lux-kpi-6"
          onClick={() => openSection("devices")}
        >
          <div
            className="lux-kpi-icon"
            style={{
              background: "#f3e8ff",
              color: "#7e22ce",
            }}
          >
            🔧
          </div>

          <div className="lux-kpi-val">
            {computed.needsRepair.toLocaleString()}
          </div>

          <div className="lux-kpi-label">Hardware Needs Repair</div>
          <div className="lux-kpi-sub">Detected from backend inspections</div>
        </div>
      </div>

      <div className="lux-panels">
        <div className="lux-panel">
          <div className="lux-panel-head">
            <h3 className="lux-panel-title">Operations Completion Trend</h3>
            <span className="lux-panel-meta">Inspections vs Completed Tasks</span>
          </div>

          <div
            style={{
              width: "100%",
              height: "300px",
              minHeight: "300px",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={computed.trendData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="colorInspections"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="colorCompleted"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                    fontWeight: 600,
                  }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "#64748b",
                    fontWeight: 600,
                  }}
                  dx={-10}
                />

                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="inspections"
                  name="Inspections"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorInspections)"
                />

                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed Tasks"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <div
            className="lux-panel"
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              className="lux-panel-head"
              style={{
                marginBottom: 0,
              }}
            >
              <h3 className="lux-panel-title">Inspection Distribution</h3>
            </div>

            <div
              style={{
                flex: 1,
                minHeight: "220px",
                height: "220px",
                position: "relative",
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>

                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div
            className="lux-panel"
            style={{
              flex: 1,
            }}
          >
            <div
              className="lux-panel-head"
              style={{
                marginBottom: "16px",
              }}
            >
              <h3 className="lux-panel-title">Recent Inspections</h3>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {computed.recentInspections.length > 0 ? (
                computed.recentInspections.map((ins, i) => {
                  const techName = getTechnicianName(ins);

                  const status =
                    ins?.inspectionStatus ||
                    (isResolvedInspection(ins)
                      ? "OK"
                      : isIssueInspection(ins)
                      ? "ISSUE"
                      : "DONE");

                  return (
                    <div
                      key={ins?.id || i}
                      className="lux-list-item"
                      onClick={() => openSection("inspections_monthly")}
                    >
                      <div className="lux-li-left">
                        <div className="lux-li-icon">
                          {techName?.[0]?.toUpperCase() || "T"}
                        </div>

                        <div>
                          <div className="lux-li-title">{techName}</div>
                          <div className="lux-li-sub">
                            Inspected Hardware/Loc
                          </div>
                        </div>
                      </div>

                      <div className="lux-li-right">
                        <div
                          className="lux-li-stat"
                          style={{
                            color: isResolvedInspection(ins)
                              ? "#10b981"
                              : isIssueInspection(ins)
                              ? "#ef4444"
                              : "#0f172a",
                          }}
                        >
                          {status}
                        </div>

                        <div className="lux-li-date">
                          {formatShortTime(getInspectionTime(ins))}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "13px",
                    color: "#94a3b8",
                    fontWeight: 600,
                  }}
                >
                  No recent inspections recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}