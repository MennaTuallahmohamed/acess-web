import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import "../styles/AnalyticsPage.css";

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
   ICONS
───────────────────────────────────────────────────────────────── */
const IconFilter = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconHeart = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>
  </svg>
);

const IconActivity = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const IconClose = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const IconDownload = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const IconTrendingUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const CustomTooltipLux = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip-lux">
        <div className="label">{label}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {payload.map((entry, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: entry.color,
                }}
              />
              <span style={{ color: "var(--text-secondary)" }}>{entry.name}:</span>
              <span>{typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const initials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
};

const calcPct = (v, t) => (t ? Math.round((v / t) * 100) : 0);

const parseDeviceLocation = (dev) => {
  const loc = dev?.location || {};
  const out = {
    cluster: loc.cluster || dev?.cluster || "",
    building: loc.building || dev?.building || "",
    zone: loc.zone || dev?.zone || "",
    lane: loc.lane || dev?.lane || "",
    direction: loc.direction || dev?.direction || "",
  };

  if (!out.cluster && (dev?.deviceName || dev?.deviceCode)) {
    const text = `${dev.deviceName || ""} - ${dev.deviceCode || ""}`;
    const parts = text.split("-").map((p) => p.trim());

    for (const p of parts) {
      const low = p.toLowerCase();
      if (low.startsWith("cluster")) out.cluster = p.substring(7).trim();
      else if (low.startsWith("building")) out.building = p.substring(8).trim();
      else if (low.startsWith("zone")) out.zone = p.substring(4).trim();
      else if (low.startsWith("lane")) out.lane = p.substring(4).trim();
      else if (p === "IN" || p === "OUT" || low === "entry" || low === "exit") out.direction = p;
    }
  }

  return out;
};

const resolvedInspectionStatuses = new Set(["OK", "COMPLETED", "DONE", "RESOLVED", "PASSED"]);
const failedInspectionStatuses = new Set([
  "ISSUE",
  "FAILED",
  "PROBLEM",
  "REJECTED",
  "NEEDS_REPAIR",
  "MAINTENANCE_REQUIRED",
]);

const isTaskCompleted = (task) => String(task?.status || "").toUpperCase() === "COMPLETED";
const isTaskPending = (task) => {
  const s = String(task?.status || "").toUpperCase();
  return s === "PENDING" || s === "IN_PROGRESS";
};
const isEmergencyTask = (task) =>
  task?.priority === "EMERGENCY" || task?.isEmergency || /EMERGENCY/i.test(task?.notes || "");

const isInspectionResolved = (ins) =>
  resolvedInspectionStatuses.has(String(ins?.inspectionStatus || "").toUpperCase());

const isInspectionIssue = (ins) => {
  const s = String(ins?.inspectionStatus || "").toUpperCase();
  return (
    failedInspectionStatuses.has(s) ||
    Boolean(ins?.issueReason) ||
    Boolean(ins?.hasIssue) ||
    Boolean(ins?.needsMaintenance)
  );
};

const extractTechName = (tech) =>
  tech?.fullName ||
  (tech?.firstName ? `${tech.firstName} ${tech?.lastName || ""}`.trim() : "") ||
  tech?.username ||
  tech?.name ||
  "Unknown Tech";

const extractInspectionTechName = (ins) =>
  ins?.technician?.fullName ||
  ins?.technician?.username ||
  ins?.user?.fullName ||
  ins?.user?.username ||
  ins?.technicianName ||
  "Unknown";

const extractTaskTechId = (task) =>
  task?.techId || task?.assignedToId || task?.technicianId || task?.assignedTo?.id || null;

const extractTaskDeviceId = (task) =>
  task?.deviceId || task?.device?.id || task?.hardwareDeviceId || null;

const extractInspectionDeviceId = (ins) =>
  ins?.deviceId || ins?.device?.id || null;

const extractTaskDate = (task) =>
  task?.scheduledDate || task?.updatedAt || task?.createdAt || null;

const extractInspectionDate = (ins) =>
  ins?.inspectedAt || ins?.updatedAt || ins?.createdAt || null;

const sameDayKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

const startOfDay = (value) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* ─────────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────────── */
export function AnalyticsPage() {
  const [tasks, setTasks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const [techFilter, setTechFilter] = useState({
    search: "",
    minRatio: 0,
    hasEmergency: "all",
  });

  const [deviceFilter, setDeviceFilter] = useState({
    search: "",
    status: "all",
    cluster: "all",
    building: "all",
    zone: "all",
    lane: "all",
    direction: "all",
  });

  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const [tasksRes, devicesRes, inspectionsRes, techniciansRes] = await Promise.all([
        tryGet(["/inspection-tasks", "/tasks"]).catch(() => []),
        tryGet(["/devices"]).catch(() => []),
        tryGet(["/inspections"]).catch(() => []),
        tryGet([
          "/users?role=technician",
          "/users?type=technician",
          "/users/technicians",
          "/users",
        ]).catch(() => []),
      ]);

      const rawUsers = normalizeArrayResponse(techniciansRes);
      const normalizedTechs =
        rawUsers.filter((u) => {
          const role = String(u?.role?.name || u?.role || u?.userRole || "").toLowerCase();
          return role.includes("technician") || rawUsers === techniciansRes;
        }) || [];

      setTasks(normalizeArrayResponse(tasksRes));
      setDevices(normalizeArrayResponse(devicesRes));
      setInspections(normalizeArrayResponse(inspectionsRes));
      setTechnicians(normalizedTechs.length ? normalizedTechs : rawUsers);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.message || "Failed to load analytics data from backend.");
    } finally {
      setLoading(false);
      setBootLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadAnalyticsData();
    }, 15000);

    const onFocusRefresh = () => loadAnalyticsData();
    window.addEventListener("focus", onFocusRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocusRefresh);
    };
  }, [loadAnalyticsData]);

  const devicesMapped = useMemo(() => {
    return devices.map((d) => ({ ...d, parsedLoc: parseDeviceLocation(d) }));
  }, [devices]);

  const totalTasks = tasks.length;
  const completed = Math.max(
    tasks.filter(isTaskCompleted).length,
    inspections.filter(isInspectionResolved).length
  );
  const pending = Math.max(tasks.filter(isTaskPending).length, totalTasks - completed, 0);
  const emergency = tasks.filter(isEmergencyTask).length;

  const totalDevices = devicesMapped.length;
  const ok = devicesMapped.filter((d) => String(d?.currentStatus || "").toUpperCase() === "OK").length;
  const maint = Math.max(
    devicesMapped.filter((d) => String(d?.currentStatus || "").toUpperCase() !== "OK").length,
    inspections.filter(isInspectionIssue).length
  );

  const monthlyCount = inspections.filter((i) => {
    const d = new Date(extractInspectionDate(i));
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length || inspections.length;

  const tasksByTechnician = useMemo(() => {
    return technicians.map((tech) => {
      const techId = tech?.id;
      const techTasks = tasks.filter((tk) => String(extractTaskTechId(tk)) === String(techId));

      const techRelatedInspections = inspections.filter((ins) => {
        const insTechId =
          ins?.technicianId || ins?.technician?.id || ins?.userId || ins?.user?.id || null;
        return String(insTechId) === String(techId);
      });

      const completedCount = Math.max(
        techTasks.filter(isTaskCompleted).length,
        techRelatedInspections.filter(isInspectionResolved).length
      );

      const pendingCount = Math.max(
        techTasks.filter(isTaskPending).length,
        techTasks.length - completedCount,
        0
      );

      const emergencyCount = techTasks.filter(isEmergencyTask).length;

      return {
        ...tech,
        id: tech.id,
        name: extractTechName(tech),
        email: tech.email,
        jobTitle: tech.jobTitle || "Technician",
        completed: completedCount,
        pending: pendingCount,
        emergency: emergencyCount,
        tasks: techTasks,
        inspections: techRelatedInspections,
      };
    });
  }, [technicians, tasks, inspections]);

  const uniqueLocs = useMemo(() => {
    const list = {
      cluster: new Set(),
      building: new Set(),
      zone: new Set(),
      lane: new Set(),
      direction: new Set(),
    };

    devicesMapped.forEach((d) => {
      const ploc = d.parsedLoc || {};
      if (ploc.cluster) list.cluster.add(ploc.cluster);
      if (ploc.building) list.building.add(ploc.building);
      if (ploc.zone) list.zone.add(ploc.zone);
      if (ploc.lane) list.lane.add(String(ploc.lane));
      if (ploc.direction) list.direction.add(ploc.direction);
    });

    return {
      cluster: [...list.cluster].sort(),
      building: [...list.building].sort(),
      zone: [...list.zone].sort(),
      lane: [...list.lane].sort(),
      direction: [...list.direction].sort(),
    };
  }, [devicesMapped]);

  const filteredTechs = useMemo(() => {
    return tasksByTechnician.filter((t) => {
      const srch = techFilter.search.toLowerCase();
      const matchSearch = t.name.toLowerCase().includes(srch);

      const total = t.completed + t.pending;
      const ratio = total === 0 ? 0 : Math.round((t.completed / total) * 100);
      const matchRatio = ratio >= Number(techFilter.minRatio);

      const matchEmergency =
        techFilter.hasEmergency === "all"
          ? true
          : techFilter.hasEmergency === "yes"
          ? t.emergency > 0
          : t.emergency === 0;

      return matchSearch && matchRatio && matchEmergency;
    });
  }, [tasksByTechnician, techFilter]);

  const devicesWithRelations = useMemo(() => {
    return devicesMapped.map((d) => {
      const devTasks = tasks.filter((t) => String(extractTaskDeviceId(t)) === String(d.id));
      const devInspections = inspections.filter(
        (ins) => String(extractInspectionDeviceId(ins)) === String(d.id)
      );

      const repairs = Math.max(
        devTasks.filter(isTaskCompleted).length,
        devInspections.filter(isInspectionResolved).length
      );

      return {
        ...d,
        tasks: devTasks,
        inspections: devInspections,
        repairs,
      };
    });
  }, [devicesMapped, tasks, inspections]);

  const filteredDevices = useMemo(() => {
    return devicesWithRelations.filter((d) => {
      const srch = deviceFilter.search.toLowerCase();
      const text = `${d.deviceCode || ""} ${d.deviceName || ""} ${d.barcode || ""} ${d.serialNumber || ""} ${d.ipAddress || ""} ${d.parsedLoc.cluster} ${d.parsedLoc.building} ${d.parsedLoc.zone} ${d.parsedLoc.direction}`.toLowerCase();
      const matchSearch = text.includes(srch);

      let matchStatus = true;
      if (deviceFilter.status !== "all") {
        if (deviceFilter.status === "OK")
          matchStatus = String(d.currentStatus || "").toUpperCase() === "OK";
        if (deviceFilter.status === "MAINT")
          matchStatus = String(d.currentStatus || "").toUpperCase() !== "OK";
      }

      const ploc = d.parsedLoc || {};
      const matchCl = deviceFilter.cluster === "all" ? true : ploc.cluster === deviceFilter.cluster;
      const matchBldg =
        deviceFilter.building === "all" ? true : ploc.building === deviceFilter.building;
      const matchZn = deviceFilter.zone === "all" ? true : ploc.zone === deviceFilter.zone;
      const matchLn =
        deviceFilter.lane === "all" ? true : String(ploc.lane) === deviceFilter.lane;
      const matchDir =
        deviceFilter.direction === "all" ? true : ploc.direction === deviceFilter.direction;

      return matchSearch && matchStatus && matchCl && matchBldg && matchZn && matchLn && matchDir;
    });
  }, [devicesWithRelations, deviceFilter]);

  const bindDetailTimeline = (dev) => {
    if (!dev) return [];

    const ins = (dev.inspections || []).map((i) => ({
      date: new Date(extractInspectionDate(i) || Date.now()),
      type: "INSPECTION",
      status: i.inspectionStatus || "UNKNOWN",
      tech: extractInspectionTechName(i),
      notes: i.notes || i.issueReason || "Routine check completed.",
    }));

    const tks = (dev.tasks || []).map((t) => ({
      date: new Date(extractTaskDate(t) || Date.now()),
      type: "TASK",
      status: t.status || "UNKNOWN",
      tech: t.assignedTo?.fullName || t.techName || "Unassigned",
      notes: t.notes || t.title || "System task logged.",
    }));

    return [...ins, ...tks].sort((a, b) => b.date - a.date);
  };

  const exportReport = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      totals: {
        totalTasks,
        completed,
        pending,
        emergency,
        totalDevices,
        ok,
        maint,
        inspections: inspections.length,
        technicians: technicians.length,
      },
      tasks,
      devices: devicesMapped,
      inspections,
      technicians: tasksByTechnician,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics-report.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderOverview = () => {
    const clusterHealthMap = {};
    devicesWithRelations.forEach((d) => {
      const cls = d.parsedLoc?.cluster || "Unassigned";
      if (!clusterHealthMap[cls]) {
        clusterHealthMap[cls] = { cluster: cls, Operational: 0, RequiresAttention: 0 };
      }
      if (String(d.currentStatus || "").toUpperCase() === "OK") clusterHealthMap[cls].Operational++;
      else clusterHealthMap[cls].RequiresAttention++;
    });

    const deviceHealthData = Object.values(clusterHealthMap)
      .sort((a, b) => b.Operational + b.RequiresAttention - (a.Operational + a.RequiresAttention))
      .slice(0, 8);

    const techPerfData = tasksByTechnician
      .sort((a, b) => b.completed + b.pending - (a.completed + a.pending))
      .slice(0, 6)
      .map((t) => ({
        name: t.name.split(" ")[0],
        Completed: t.completed,
        Pending: t.pending,
      }));

    const inspTrendData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = sameDayKey(d);

      const count = inspections.filter((ins) => sameDayKey(extractInspectionDate(ins)) === dStr).length;

      inspTrendData.push({
        date: d.toLocaleDateString("en-US", { weekday: "short" }),
        Inspections: count,
      });
    }

    const statusMap = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
    tasks.forEach((t) => {
      const s = String(t.status || "").toUpperCase();
      if (statusMap[s] !== undefined) statusMap[s]++;
    });

    const taskStatusData = [
      { name: "Pending", value: statusMap.PENDING, color: "#f59e0b" },
      { name: "In Progress", value: statusMap.IN_PROGRESS, color: "#3b82f6" },
      { name: "Completed", value: statusMap.COMPLETED, color: "#10b981" },
      { name: "Cancelled", value: statusMap.CANCELLED, color: "#ef4444" },
    ];

    const prioMap = { NORMAL: 0, EMERGENCY: 0 };
    tasks.forEach((t) => {
      if (isEmergencyTask(t)) prioMap.EMERGENCY++;
      else prioMap.NORMAL++;
    });

    const prioData = [
      { name: "Normal", value: prioMap.NORMAL, color: "#8b5cf6" },
      { name: "Emergency", value: prioMap.EMERGENCY, color: "#ef4444" },
    ];

    const radarData = deviceHealthData
      .map((d) => ({
        cluster: d.cluster,
        Failures: d.RequiresAttention,
        Total: d.Operational + d.RequiresAttention,
      }))
      .sort((a, b) => b.Failures - a.Failures)
      .slice(0, 6);

    const workloadData = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = sameDayKey(d);

      const incoming = tasks.filter((t) => sameDayKey(extractTaskDate(t)) === dStr).length;
      const resolved = tasks.filter(
        (t) => isTaskCompleted(t) && sameDayKey(t.updatedAt || t.createdAt) === dStr
      ).length;

      workloadData.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        Incoming: incoming,
        Resolved: resolved,
      });
    }

    const ChartCard = ({ title, children, fullWidth = false }) => (
      <div
        style={{
          background: "var(--bg-primary, #fff)",
          border: "1px solid rgba(0,0,0,0.05)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          gridColumn: fullWidth ? "1 / -1" : "auto",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "800",
            color: "var(--text-primary)",
            marginBottom: "20px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </h3>

        <div style={{ height: "300px", width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    );

    return (
      <>
        <div className="exec-kpi-grid">
          <div className="kpi-card-exec" style={{ "--card-color": "var(--success)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Resolution Rate</span>
              <div className="kpi-icon-wrap">
                <IconCheck />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{calcPct(completed, totalTasks)}%</div>
              <div className="kpi-footer">
                <span className="trend-up">
                  <IconTrendingUp /> {completed} / {totalTasks} Tasks
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card-exec" style={{ "--card-color": "var(--primary)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Fleet Health Index</span>
              <div className="kpi-icon-wrap">
                <IconHeart />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{calcPct(ok, totalDevices)}%</div>
              <div className="kpi-footer">
                <span className={ok >= maint ? "trend-up" : "trend-down"}>
                  <IconTrendingUp /> {ok} Active / {maint} Broken
                </span>
              </div>
            </div>
          </div>

          <div className="kpi-card-exec" style={{ "--card-color": "var(--warning)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Active Inspections</span>
              <div className="kpi-icon-wrap">
                <IconActivity />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{monthlyCount}</div>
              <div className="kpi-footer">
                <span className="trend-neutral">Total lifetime: {inspections.length}</span>
              </div>
            </div>
          </div>

          <div className="kpi-card-exec" style={{ "--card-color": "var(--danger)" }}>
            <div className="kpi-header">
              <span className="kpi-title">Critical Escalations</span>
              <div className="kpi-icon-wrap">
                <IconAlert />
              </div>
            </div>
            <div className="kpi-body">
              <div className="kpi-value">{emergency}</div>
              <div className="kpi-footer">
                <span className={emergency > 0 ? "trend-down" : "trend-up"}>
                  <IconTrendingUp /> {emergency > 0 ? "Requires Attention" : "Clear"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "24px",
            marginTop: "32px",
          }}
        >
          <ChartCard title="1. Device Integrity by Cluster">
            <BarChart data={deviceHealthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="cluster" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltipLux />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Operational" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="RequiresAttention" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="2. Technician Workload & Output">
            <BarChart
              data={techPerfData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }} />
              <Tooltip content={<CustomTooltipLux />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Completed" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="Pending" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ChartCard>

          <ChartCard title="3. Inspection Volume (7 Days)">
            <AreaChart data={inspTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorInsp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltipLux />} />
              <Area type="monotone" dataKey="Inspections" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorInsp)" />
            </AreaChart>
          </ChartCard>

          <ChartCard title="4. Vulnerability Index (Clusters)">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="cluster" tick={{ fill: "#4b5563", fontSize: 11, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, "auto"]} tick={{ fill: "#9ca3af", fontSize: 10 }} />
              <Radar name="Failures" dataKey="Failures" stroke="#ef4444" fill="#ef4444" fillOpacity={0.4} />
              <Radar name="Total" dataKey="Total" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
              <Tooltip content={<CustomTooltipLux />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </RadarChart>
          </ChartCard>

          <ChartCard title="5. Task Status Pipeline">
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipLux />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} verticalAlign="middle" align="right" layout="vertical" />
            </PieChart>
          </ChartCard>

          <ChartCard title="6. Emergency Impact">
            <PieChart>
              <Pie
                data={prioData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                stroke="none"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {prioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltipLux />} />
            </PieChart>
          </ChartCard>

          <ChartCard title="7. Operational Workload (14 Days Trend)" fullWidth>
            <ComposedChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip content={<CustomTooltipLux />} cursor={{ fill: "rgba(0,0,0,0.02)" }} />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar dataKey="Resolved" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="Incoming" stroke="#3b82f6" strokeWidth={3} dot={{ strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ChartCard>
        </div>
      </>
    );
  };

  const renderTechIntel = () => (
    <div className="intelligence-section">
      <div className="advanced-filter-panel">
        <div style={{ flex: 2, position: "relative" }}>
          <div style={{ position: "absolute", top: "12px", left: "16px", color: "var(--text-tertiary)" }}>
            <IconSearch />
          </div>
          <input
            type="text"
            className="intel-search-input"
            placeholder="Search technicians by name..."
            style={{ paddingLeft: "44px", width: "100%", border: "1px solid var(--border-strong)" }}
            value={techFilter.search}
            onChange={(e) => setTechFilter({ ...techFilter, search: e.target.value })}
          />
        </div>

        <select
          className="adv-select"
          value={techFilter.minRatio}
          onChange={(e) => setTechFilter({ ...techFilter, minRatio: e.target.value })}
        >
          <option value={0}>All Completion Ratios</option>
          <option value={50}>High Performers (&gt; 50%)</option>
          <option value={80}>Star Performers (&gt; 80%)</option>
        </select>

        <select
          className="adv-select"
          value={techFilter.hasEmergency}
          onChange={(e) => setTechFilter({ ...techFilter, hasEmergency: e.target.value })}
        >
          <option value="all">All Incident Histories</option>
          <option value="yes">Handled Emergencies</option>
          <option value="no">No Emergencies</option>
        </select>
      </div>

      <div className="lux-table-wrap">
        <table className="lux-table">
          <thead>
            <tr>
              <th>Technician</th>
              <th>Task Completion Ratio</th>
              <th>Emergencies Handled</th>
              <th>Assigned Devices</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTechs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
                  No technician matches your filter.
                </td>
              </tr>
            )}

            {filteredTechs.map((t) => {
              const total = t.completed + t.pending;
              const ratio = calcPct(t.completed, total);

              return (
                <tr key={t.id} onClick={() => setSelectedTech(t)}>
                  <td>
                    <div className="user-cell">
                      <div className="lux-avatar">{initials(t.name)}</div>
                      <div>
                        <div className="user-name">{t.name}</div>
                        <div className="user-meta">{t.email || `ID: ${t.id}`}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: ratio > 75 ? "var(--success)" : "var(--warning)",
                          fontSize: "15px",
                        }}
                      >
                        {ratio}%
                      </span>
                      <span className="user-meta">({t.completed} of {total})</span>
                    </div>

                    <div
                      style={{
                        width: "100px",
                        height: "6px",
                        background: "var(--bg-hover)",
                        borderRadius: "3px",
                        marginTop: "6px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${ratio}%`,
                          height: "100%",
                          background: ratio > 75 ? "var(--success)" : "var(--warning)",
                        }}
                      ></div>
                    </div>
                  </td>

                  <td>
                    <span
                      style={{
                        padding: "6px 12px",
                        borderRadius: "100px",
                        background:
                          t.emergency > 0 ? "rgba(239, 68, 68, 0.1)" : "var(--bg-hover)",
                        color: t.emergency > 0 ? "var(--danger)" : "var(--text-tertiary)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {t.emergency} Incidents
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary)" }}>
                      {
                        new Set(
                          t.tasks.map((task) => extractTaskDeviceId(task)).filter(Boolean).map(String)
                        ).size
                      }{" "}
                      Assigned Devices
                    </div>
                  </td>

                  <td>
                    <button className="btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
                      View Intel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDeviceIntel = () => (
    <div className="intelligence-section">
      <div className="advanced-filter-panel">
        <div style={{ flex: 2, position: "relative" }}>
          <div style={{ position: "absolute", top: "12px", left: "16px", color: "var(--text-tertiary)" }}>
            <IconSearch />
          </div>
          <input
            type="text"
            className="intel-search-input"
            placeholder="Search devices by code or name..."
            style={{ paddingLeft: "44px", width: "100%", border: "1px solid var(--border-strong)" }}
            value={deviceFilter.search}
            onChange={(e) => setDeviceFilter({ ...deviceFilter, search: e.target.value })}
          />
        </div>

        <select className="adv-select" value={deviceFilter.status} onChange={(e) => setDeviceFilter({ ...deviceFilter, status: e.target.value })}>
          <option value="all">All Conditions</option>
          <option value="OK">Working Optimal (OK)</option>
          <option value="MAINT">Requires Attention</option>
        </select>

        <select className="adv-select" value={deviceFilter.cluster} onChange={(e) => setDeviceFilter({ ...deviceFilter, cluster: e.target.value })}>
          <option value="all">All Clusters</option>
          {uniqueLocs.cluster.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select className="adv-select" value={deviceFilter.building} onChange={(e) => setDeviceFilter({ ...deviceFilter, building: e.target.value })}>
          <option value="all">All Buildings</option>
          {uniqueLocs.building.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select className="adv-select" value={deviceFilter.zone} onChange={(e) => setDeviceFilter({ ...deviceFilter, zone: e.target.value })}>
          <option value="all">All Zones</option>
          {uniqueLocs.zone.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select className="adv-select" value={deviceFilter.lane} onChange={(e) => setDeviceFilter({ ...deviceFilter, lane: e.target.value })}>
          <option value="all">All Lanes</option>
          {uniqueLocs.lane.map((c) => (
            <option key={c} value={c}>
              Lane {c}
            </option>
          ))}
        </select>

        <select className="adv-select" value={deviceFilter.direction} onChange={(e) => setDeviceFilter({ ...deviceFilter, direction: e.target.value })}>
          <option value="all">Direction</option>
          {uniqueLocs.direction.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="lux-table-wrap">
        <table className="lux-table">
          <thead>
            <tr>
              <th>Device Integrity</th>
              <th>Status Vector</th>
              <th>Location Context</th>
              <th>Maintenance DNA</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-tertiary)" }}>
                  No device matches your filters.
                </td>
              </tr>
            )}

            {filteredDevices.map((d) => (
              <tr key={d.id} onClick={() => setSelectedDevice(d)}>
                <td>
                  <div style={{ fontWeight: 800, fontSize: "15px", color: "var(--text-primary)" }}>
                    {d.deviceCode || `DEV-${d.id}`}
                  </div>
                  <div className="user-meta" style={{ marginTop: "2px" }}>
                    {d.deviceName || "Unknown Type"}
                  </div>
                </td>

                <td>
                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: "100px",
                      fontWeight: 700,
                      fontSize: "12px",
                      background:
                        String(d.currentStatus || "").toUpperCase() === "OK"
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      color:
                        String(d.currentStatus || "").toUpperCase() === "OK"
                          ? "var(--success)"
                          : "var(--danger)",
                      display: "inline-block",
                    }}
                  >
                    {d.currentStatus || "UNKNOWN"}
                  </span>
                </td>

                <td>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {d.parsedLoc.building || "Unknown Building"}
                  </div>
                  <div className="user-meta" style={{ marginTop: "4px" }}>
                    {d.parsedLoc.cluster || "—"} · {d.parsedLoc.zone || "—"}
                  </div>
                </td>

                <td>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--primary)" }}>
                    {d.tasks.length + d.inspections.length} Incidents Logged
                  </div>
                  <div className="user-meta" style={{ marginTop: "4px" }}>
                    {d.repairs} Successful Repairs
                  </div>
                </td>

                <td>
                  <button className="btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
                    Audit Log
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="analytics-container">
      {bootLoading && (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#fff",
            border: "1px solid rgba(0,0,0,0.08)",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          Loading analytics from backend...
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "14px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#b91c1c",
            fontWeight: 700,
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <div className="analytics-hero" style={selectedTech || selectedDevice ? { opacity: 0.1, pointerEvents: "none" } : {}}>
        <div className="analytics-header">
          <div className="analytics-title">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <h1>Data Infrastructure</h1>
              <span
                style={{
                  fontSize: "12px",
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "var(--success)",
                  padding: "4px 8px",
                  borderRadius: "100px",
                  fontWeight: "700",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                LIVE SYNC ACTIVE
              </span>
              <span
                style={{
                  fontSize: "12px",
                  background: "rgba(59,130,246,0.12)",
                  color: "#2563eb",
                  padding: "4px 8px",
                  borderRadius: "100px",
                  fontWeight: "700",
                  border: "1px solid rgba(59,130,246,0.18)",
                }}
              >
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : "Waiting..."}
              </span>
            </div>
            <p>Executive analytics, technician tracking, and deep hardware diagnostics.</p>
          </div>

          <div className="analytics-actions" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn-outline" onClick={loadAnalyticsData}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button className="btn-premium" onClick={exportReport}>
              <IconDownload /> Export Report
            </button>
          </div>
        </div>

        <div className="analytics-nav-tabs">
          <button className={`analytics-nav-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
            Executive Overview
          </button>
          <button className={`analytics-nav-tab ${activeTab === "tech" ? "active" : ""}`} onClick={() => setActiveTab("tech")}>
            Technician Intelligence
          </button>
          <button className={`analytics-nav-tab ${activeTab === "devices" ? "active" : ""}`} onClick={() => setActiveTab("devices")}>
            Device Intelligence
          </button>
        </div>
      </div>

      <div style={selectedTech || selectedDevice ? { opacity: 0.1, pointerEvents: "none" } : {}}>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "tech" && renderTechIntel()}
        {activeTab === "devices" && renderDeviceIntel()}
      </div>

      {selectedTech && (
        <>
          <div className="lux-overlay-shadow" onClick={() => setSelectedTech(null)}></div>
          <div className="lux-overlay-panel">
            <div className="panel-header">
              <div className="lux-avatar" style={{ width: 60, height: 60, fontSize: 24 }}>
                {initials(selectedTech.name)}
              </div>
              <div>
                <div className="panel-title">
                  <h2>{selectedTech.name}</h2>
                </div>
                <div className="panel-title">
                  <p>{selectedTech.email || "Senior Field Technician"}</p>
                </div>
              </div>
              <button className="btn-close" style={{ marginLeft: "auto" }} onClick={() => setSelectedTech(null)}>
                <IconClose />
              </button>
            </div>

            <div className="panel-body">
              <div className="kpi-row">
                <div className="kpi-box">
                  <span className="box-lbl">Completion Ratio</span>
                  <span className="box-val" style={{ color: "var(--success)" }}>
                    {calcPct(selectedTech.completed, selectedTech.completed + selectedTech.pending)}%
                  </span>
                </div>

                <div className="kpi-box">
                  <span className="box-lbl">Emergencies Handled</span>
                  <span className="box-val" style={{ color: "var(--danger)" }}>
                    {selectedTech.emergency}
                  </span>
                </div>

                <div className="kpi-box">
                  <span className="box-lbl">Total Tasks</span>
                  <span className="box-val" style={{ color: "var(--primary)" }}>
                    {selectedTech.tasks.length}
                  </span>
                </div>
              </div>

              <div className="timeline-box">
                <h3>Action History Timeline</h3>
                {selectedTech.tasks.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No recorded actions.</p>
                ) : null}

                {selectedTech.tasks
                  .sort((a, b) => new Date(extractTaskDate(b)) - new Date(extractTaskDate(a)))
                  .map((tk, idx) => {
                    const linkedDevice = devicesWithRelations.find(
                      (d) => String(d.id) === String(extractTaskDeviceId(tk))
                    );

                    return (
                      <div className="timeline-item" key={idx}>
                        <div className="timeline-time">{formatDate(extractTaskDate(tk))}</div>
                        <div
                          className="timeline-content"
                          style={isTaskCompleted(tk) ? { borderLeft: "4px solid var(--success)" } : {}}
                        >
                          <h4>
                            {linkedDevice?.deviceCode || tk.deviceCode || "-"} -{" "}
                            {linkedDevice?.deviceName || tk.deviceName || "-"}
                          </h4>
                          <p>
                            Status:{" "}
                            <span
                              style={{
                                fontWeight: 700,
                                color: isTaskCompleted(tk) ? "var(--success)" : "var(--warning)",
                              }}
                            >
                              {tk.status}
                            </span>
                          </p>
                          <p style={{ marginTop: "8px" }}>{tk.notes || "No operational notes provided."}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedDevice && (
        <>
          <div className="lux-overlay-shadow" onClick={() => setSelectedDevice(null)}></div>
          <div className="lux-overlay-panel">
            <div className="panel-header">
              <div
                className="lux-avatar"
                style={{ width: 60, height: 60, fontSize: 24, background: "var(--bg-hover)", color: "var(--primary)" }}
              >
                <IconHeart />
              </div>
              <div>
                <div className="panel-title">
                  <h2>{selectedDevice.deviceCode || `DEV-${selectedDevice.id}`}</h2>
                </div>
                <div className="panel-title">
                  <p>{selectedDevice.deviceName || "Unknown Hardware Module"}</p>
                </div>
              </div>
              <button className="btn-close" style={{ marginLeft: "auto" }} onClick={() => setSelectedDevice(null)}>
                <IconClose />
              </button>
            </div>

            <div className="panel-body">
              <div className="kpi-row">
                <div
                  className="kpi-box"
                  style={
                    String(selectedDevice.currentStatus || "").toUpperCase() === "OK"
                      ? { borderColor: "var(--success)" }
                      : { borderColor: "var(--danger)" }
                  }
                >
                  <span className="box-lbl">Integrity Status</span>
                  <span
                    className="box-val"
                    style={
                      String(selectedDevice.currentStatus || "").toUpperCase() === "OK"
                        ? { color: "var(--success)" }
                        : { color: "var(--danger)" }
                    }
                  >
                    {selectedDevice.currentStatus || "UNKNOWN"}
                  </span>
                </div>

                <div className="kpi-box">
                  <span className="box-lbl">Cluster / Building</span>
                  <span className="box-val">
                    {selectedDevice.parsedLoc.cluster || "Global"} / {selectedDevice.parsedLoc.building || "Unknown"}
                  </span>
                </div>

                <div className="kpi-box">
                  <span className="box-lbl">Maintenance Incidents</span>
                  <span className="box-val" style={{ color: "var(--primary)" }}>
                    {selectedDevice.tasks.length + selectedDevice.inspections.length}
                  </span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "16px",
                  background: "var(--bg-hover)",
                  padding: "16px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  border: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <div
                  style={{
                    background: "var(--primary)",
                    color: "#fff",
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconCheck />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Last Inspection Data
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {bindDetailTimeline(selectedDevice).length > 0 ? (
                      <>
                        <strong>{bindDetailTimeline(selectedDevice)[0].status}</strong> on{" "}
                        {formatDate(bindDetailTimeline(selectedDevice)[0].date)} by{" "}
                        {bindDetailTimeline(selectedDevice)[0].tech}
                      </>
                    ) : (
                      "No inspections recorded yet"
                    )}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ background: "var(--bg-hover)", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <strong>Zone:</strong> {selectedDevice.parsedLoc.zone || "N/A"}
                </span>
                <span style={{ background: "var(--bg-hover)", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <strong>Lane:</strong> {selectedDevice.parsedLoc.lane || "N/A"}
                </span>
                <span style={{ background: "var(--bg-hover)", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <strong>Direction:</strong> {selectedDevice.parsedLoc.direction || "N/A"}
                </span>
                <span style={{ background: "var(--bg-hover)", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <strong>IP:</strong> {selectedDevice.ipAddress || "Unknown"}
                </span>
                <span style={{ background: "var(--bg-hover)", padding: "6px 12px", borderRadius: "4px", fontSize: "13px", color: "var(--text-secondary)" }}>
                  <strong>Created:</strong> {formatDate(selectedDevice.createdAt)}
                </span>
              </div>

              <div className="timeline-box">
                <h3>Hardware Audit & Timeline</h3>
                {bindDetailTimeline(selectedDevice).length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No audit records found.</p>
                ) : null}

                {bindDetailTimeline(selectedDevice).map((item, idx) => (
                  <div className="timeline-item" key={idx}>
                    <div className="timeline-time" style={{ color: item.type === "INSPECTION" ? "var(--info)" : "var(--warning)" }}>
                      {formatDate(item.date)}
                      <br />
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>{item.type}</span>
                    </div>
                    <div
                      className="timeline-content"
                      style={{
                        borderLeft:
                          item.type === "INSPECTION"
                            ? "4px solid var(--info)"
                            : "4px solid var(--warning)",
                      }}
                    >
                      <h4>Event Logged by {item.tech}</h4>
                      <p>
                        Audit Context: <strong style={{ color: "var(--text-primary)" }}>{item.status}</strong>
                      </p>
                      <p style={{ marginTop: "8px", fontStyle: "italic" }}>"{item.notes}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}