import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#1f3a93", "#f97316", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4"];

function getBaseUrl() {
  return (
    localStorage.getItem("apiBaseUrl") ||
    localStorage.getItem("baseUrl") ||
    "http://localhost:3000"
  );
}

function getToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function apiGet(path) {
  const baseUrl = getBaseUrl();
  const token = getToken();

  const response = await fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="custom-tooltip"
      style={{
        background: "#fff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
      }}
    >
      {label ? (
        <p style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>{label}</p>
      ) : null}

      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            margin: "6px 0 0",
            color: entry.color || "#334155",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {entry.name}:{" "}
          {typeof entry.value === "number"
            ? entry.value.toLocaleString()
            : String(entry.value)}
        </p>
      ))}
    </div>
  );
}

function normalizeSummary(summary) {
  if (!summary || typeof summary !== "object") {
    return {
      totalTasks: 0,
      pendingTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      cancelledTasks: 0,
      totalTechnicians: 0,
      totalDevices: 0,
      healthyDevices: 0,
      faultyDevices: 0,
      totalInspections: 0,
    };
  }

  return {
    totalTasks:
      summary.totalTasks ??
      summary.tasksCount ??
      summary.totalInspectionTasks ??
      0,

    pendingTasks:
      summary.pendingTasks ??
      summary.pending ??
      summary.pendingInspectionTasks ??
      0,

    completedTasks:
      summary.completedTasks ??
      summary.completed ??
      summary.completedInspectionTasks ??
      0,

    inProgressTasks:
      summary.inProgressTasks ??
      summary.inProgress ??
      summary.in_progress ??
      0,

    cancelledTasks:
      summary.cancelledTasks ??
      summary.cancelled ??
      0,

    totalTechnicians:
      summary.totalTechnicians ??
      summary.techniciansCount ??
      summary.technicianCount ??
      0,

    totalDevices:
      summary.totalDevices ??
      summary.devicesCount ??
      0,

    healthyDevices:
      summary.healthyDevices ??
      summary.okDevices ??
      summary.operationalDevices ??
      0,

    faultyDevices:
      summary.faultyDevices ??
      summary.outOfServiceDevices ??
      summary.badDevices ??
      0,

    totalInspections:
      summary.totalInspections ??
      summary.inspectionsCount ??
      0,
  };
}

function normalizeTaskStatus(raw, summary) {
  const fallback = [
    { name: "Pending", value: summary.pendingTasks || 0 },
    { name: "In Progress", value: summary.inProgressTasks || 0 },
    { name: "Completed", value: summary.completedTasks || 0 },
    { name: "Cancelled", value: summary.cancelledTasks || 0 },
  ];

  if (!raw) return fallback;

  const source = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
    ? raw.data
    : Array.isArray(raw.items)
    ? raw.items
    : [];

  if (!source.length) return fallback;

  return source.map((item) => ({
    name:
      item.name ??
      item.status ??
      item.label ??
      item.taskStatus ??
      "Unknown",
    value:
      item.value ??
      item.count ??
      item.total ??
      0,
  }));
}

function normalizeBuildingChart(raw) {
  const source = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
    ? raw.data
    : Array.isArray(raw.items)
    ? raw.items
    : [];

  return source.map((item) => ({
    name:
      item.name ??
      item.building ??
      item.location ??
      item.label ??
      "Unknown",
    value:
      item.value ??
      item.count ??
      item.total ??
      0,
  }));
}

function normalizeTechnicianChart(raw) {
  const source = Array.isArray(raw)
    ? raw
    : Array.isArray(raw.data)
    ? raw.data
    : Array.isArray(raw.items)
    ? raw.items
    : [];

  return source.map((item) => ({
    name:
      item.name ??
      item.fullName ??
      item.technician ??
      item.label ??
      "Unknown",
    value:
      item.value ??
      item.count ??
      item.total ??
      item.tasks ??
      0,
  }));
}

function buildDeviceHealth(summary) {
  const healthy = summary.healthyDevices || 0;
  const faulty = summary.faultyDevices || 0;
  const total = summary.totalDevices || 0;
  const other = Math.max(total - healthy - faulty, 0);

  const rows = [
    { name: "Healthy", value: healthy, fill: "#10b981" },
    { name: "Faulty", value: faulty, fill: "#ef4444" },
  ];

  if (other > 0) {
    rows.push({ name: "Other", value: other, fill: "#f59e0b" });
  }

  return rows.filter((item) => item.value > 0);
}

function KpiCard({ title, value, icon, tone = "primary" }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-icon">{icon}</div>
      <div className="kpi-content">
        <span>{title}</span>
        <strong>{Number(value || 0).toLocaleString()}</strong>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="card chart-card">
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <span className="text-tertiary">{subtitle}</span> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function DashboardCharts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [taskStatusRaw, setTaskStatusRaw] = useState([]);
  const [buildingRaw, setBuildingRaw] = useState([]);
  const [technicianRaw, setTechnicianRaw] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardCharts() {
      try {
        setLoading(true);
        setError("");

        const [summaryRes, taskStatusRes, buildingRes, technicianRes] =
          await Promise.all([
            apiGet("/dashboard/summary"),
            apiGet("/dashboard/charts/task-status"),
            apiGet("/dashboard/charts/by-building"),
            apiGet("/dashboard/charts/by-technician"),
          ]);

        if (cancelled) return;

        setSummary(summaryRes);
        setTaskStatusRaw(taskStatusRes);
        setBuildingRaw(buildingRes);
        setTechnicianRaw(technicianRes);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load dashboard charts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboardCharts();

    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSummary = useMemo(() => normalizeSummary(summary), [summary]);

  const taskStatusData = useMemo(
    () => normalizeTaskStatus(taskStatusRaw, normalizedSummary),
    [taskStatusRaw, normalizedSummary]
  );

  const buildingData = useMemo(
    () => normalizeBuildingChart(buildingRaw),
    [buildingRaw]
  );

  const technicianData = useMemo(
    () => normalizeTechnicianChart(technicianRaw),
    [technicianRaw]
  );

  const deviceHealthData = useMemo(
    () => buildDeviceHealth(normalizedSummary),
    [normalizedSummary]
  );

  if (loading) {
    return (
      <div className="dashboard-block">
        <div className="card">
          <p className="loading-text">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-block">
        <div className="card">
          <p className="error-text">Failed to load charts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-block">
      <section className="kpi-grid">
        <KpiCard
          title="Total Tasks"
          value={normalizedSummary.totalTasks}
          icon="📋"
          tone="primary"
        />
        <KpiCard
          title="Completed Tasks"
          value={normalizedSummary.completedTasks}
          icon="✅"
          tone="success"
        />
        <KpiCard
          title="Pending Tasks"
          value={normalizedSummary.pendingTasks}
          icon="⏳"
          tone="warning"
        />
        <KpiCard
          title="Technicians"
          value={normalizedSummary.totalTechnicians}
          icon="👷"
          tone="info"
        />
        <KpiCard
          title="Total Devices"
          value={normalizedSummary.totalDevices}
          icon="🔧"
          tone="primary"
        />
        <KpiCard
          title="Faulty Devices"
          value={normalizedSummary.faultyDevices}
          icon="🚨"
          tone="danger"
        />
      </section>

      <div className="charts-grid">
        <div className="chart-span-2">
          <ChartCard title="Task Status" subtitle="Completed / pending / in progress / cancelled">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={taskStatusData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary, #64748b)" />
                <YAxis stroke="var(--text-tertiary, #64748b)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Tasks" radius={[10, 10, 0, 0]}>
                  {taskStatusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="chart-span-1">
          <ChartCard title="Device Health" subtitle="Healthy vs faulty devices">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={deviceHealthData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={65}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {deviceHealthData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="chart-span-1">
          <ChartCard title="Tasks by Building" subtitle="Where work is concentrated">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={buildingData}
                layout="vertical"
                margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" />
                <XAxis type="number" stroke="var(--text-tertiary, #64748b)" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  stroke="var(--text-tertiary, #64748b)"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Tasks" radius={[0, 10, 10, 0]}>
                  {buildingData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="chart-span-2">
          <ChartCard title="Tasks by Technician" subtitle="Technician workload distribution">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={technicianData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #e2e8f0)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary, #64748b)" />
                <YAxis stroke="var(--text-tertiary, #64748b)" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Tasks" radius={[10, 10, 0, 0]}>
                  {technicianData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default DashboardCharts;