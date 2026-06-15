import { useEffect, useMemo, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

const GATES_CSS = `
.gates-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(14,165,233,.16), transparent 32%),
    radial-gradient(circle at top right, rgba(16,185,129,.10), transparent 30%),
    #f4f8fb;
  color: #0f172a;
}

.gates-shell {
  max-width: 1800px;
  margin: 0 auto;
}

.gates-hero {
  background: linear-gradient(135deg, #071827, #0b6f8d);
  color: white;
  border-radius: 30px;
  padding: 26px;
  display: grid;
  grid-template-columns: 1.1fr 2fr;
  gap: 22px;
  box-shadow: 0 24px 70px rgba(15,23,42,.16);
  margin-bottom: 18px;
}

.gates-eyebrow {
  color: #a7f3ff;
  font-size: 12px;
  font-weight: 950;
  text-transform: uppercase;
  letter-spacing: 1.2px;
}

.gates-copy h1 {
  margin: 10px 0;
  font-size: 40px;
  line-height: 1;
  letter-spacing: -1.5px;
}

.gates-copy p {
  color: #d8f7ff;
  font-weight: 650;
  line-height: 1.6;
}

.gates-stats {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 12px;
}

.gate-stat {
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 20px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.gate-stat span {
  display: block;
  color: #d6f7ff;
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
}

.gate-stat strong {
  display: block;
  margin-top: 8px;
  font-size: 30px;
  line-height: 1;
}

.gates-panel {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(255,255,255,.76);
  border-radius: 24px;
  box-shadow: 0 12px 30px rgba(15,23,42,.07);
  padding: 16px;
  margin-bottom: 16px;
}

.gates-filters {
  display: grid;
  grid-template-columns: minmax(280px, 2fr) repeat(6, minmax(150px, 1fr));
  gap: 10px;
  align-items: end;
}

.gates-filters input,
.gates-filters select {
  height: 42px;
  border: 1px solid #cfe8f1;
  border-radius: 14px;
  padding: 0 12px;
  background: #fff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 750;
  outline: none;
}

.gates-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.gates-btn {
  height: 40px;
  border: 0;
  border-radius: 13px;
  padding: 0 15px;
  background: #0b8ead;
  color: #fff;
  font-weight: 950;
  cursor: pointer;
  transition: .18s;
}

.gates-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(15,23,42,.13);
}

.gates-btn.dark { background: #0f172a; }
.gates-btn.danger { background: #ef4444; }
.gates-btn.green { background: #16a34a; }

.gate-check {
  height: 40px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  background: #f8fafc;
  border: 1px solid #dbeafe;
  border-radius: 13px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 900;
}

.gates-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.gates-tab {
  height: 40px;
  padding: 0 16px;
  border-radius: 14px;
  border: 1px solid #dbeafe;
  background: #fff;
  color: #334155;
  font-weight: 950;
  cursor: pointer;
}

.gates-tab.active {
  background: #0f172a;
  color: #fff;
  border-color: #0f172a;
}

.gates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(285px, 1fr));
  gap: 16px;
}

.gate-card {
  background: #fff;
  border: 1px solid #dcecf2;
  border-radius: 24px;
  padding: 18px;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(15,23,42,.06);
  transition: .2s;
}

.gate-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 38px rgba(15,23,42,.11);
}

.gate-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.gate-icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: #e5f8ff;
  color: #087ea0;
  font-weight: 950;
  font-size: 18px;
}

.status {
  font-size: 11px;
  font-weight: 950;
  padding: 7px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #3730a3;
}

.status.OK,
.status.ACTIVE {
  background: #dcfce7;
  color: #15803d;
}

.status.NEEDS_MAINTENANCE {
  background: #fef3c7;
  color: #92400e;
}

.status.OUT_OF_SERVICE,
.status.NOT_OK {
  background: #fee2e2;
  color: #b91c1c;
}

.gate-card h2 {
  margin: 15px 0 10px;
  color: #102a43;
  font-size: 16px;
  line-height: 1.35;
}

.gate-meta {
  color: #52677a;
  font-size: 13px;
  line-height: 1.7;
  font-weight: 700;
}

.gate-counts {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
  color: #0b6f8d;
  font-size: 12px;
  font-weight: 950;
}

.gate-progress-line {
  margin-top: 12px;
  height: 7px;
  background: #e8f3f7;
  border-radius: 999px;
  overflow: hidden;
}

.gate-progress-line span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #18b77b, #0aa4c6);
}

.gates-table-wrap {
  overflow: auto;
  border-radius: 20px;
  border: 1px solid #e5eef3;
}

.gates-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;
  background: #fff;
}

.gates-table th {
  background: #f8fafc;
  color: #475569;
  padding: 13px;
  font-size: 11px;
  text-transform: uppercase;
  text-align: left;
  position: sticky;
  top: 0;
  z-index: 2;
}

.gates-table td {
  padding: 13px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
  font-weight: 750;
  color: #0f172a;
}

.gates-table tr:hover td {
  background: #f8fafc;
  cursor: pointer;
}

.gates-error {
  padding: 14px;
  border-radius: 16px;
  background: #fee2e2;
  color: #991b1b;
  font-weight: 850;
  margin-bottom: 16px;
}

.gates-loading,
.gates-empty {
  padding: 40px;
  text-align: center;
  font-weight: 950;
  color: #0b6f8d;
  background: #fff;
  border-radius: 22px;
}

.gate-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.62);
  display: flex;
  justify-content: flex-end;
  z-index: 9999;
  backdrop-filter: blur(6px);
}

.gate-drawer {
  width: min(980px, 100%);
  height: 100vh;
  background: #fff;
  box-shadow: -20px 0 70px rgba(15,23,42,.35);
  overflow: auto;
  padding: 24px;
}

.gate-details-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #e5eef3;
  padding-bottom: 18px;
  margin-bottom: 18px;
}

.gate-details-header h2 {
  margin: 8px 0;
  font-size: 28px;
}

.gate-close {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 14px;
  background: #0b8ead;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.drawer-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.drawer-tab {
  height: 38px;
  padding: 0 13px;
  border: 1px solid #dbeafe;
  border-radius: 13px;
  background: #fff;
  font-weight: 950;
  cursor: pointer;
}

.drawer-tab.active {
  background: #0f172a;
  color: #fff;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.details-box {
  border: 1px solid #e5eef3;
  border-radius: 22px;
  padding: 18px;
  background: #f8fcff;
}

.details-box h3 {
  margin: 0 0 14px;
  color: #102a43;
}

.info-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px dashed #dbeafe;
  font-size: 13px;
}

.info-line b {
  color: #334155;
}

.info-line span {
  color: #52677a;
  text-align: right;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e5eef3;
  border-radius: 18px;
  padding: 14px;
}

.timeline-dot {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #dcfce7;
  color: #15803d;
  font-weight: 950;
}

.timeline-title {
  font-weight: 950;
  color: #0f172a;
}

.timeline-sub {
  color: #64748b;
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.6;
}

.mini-row {
  border: 1px solid #e5eef3;
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mini-row b {
  display: block;
  color: #0b6f8d;
}

.mini-row span {
  display: block;
  color: #52677a;
  font-size: 12px;
  margin-top: 4px;
}

.mini-row small {
  color: #789;
  white-space: nowrap;
}

.analytics-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.analytics-row {
  display: grid;
  grid-template-columns: 130px 1fr 60px;
  gap: 10px;
  align-items: center;
}

.analytics-bar {
  height: 12px;
  background: #e5eef3;
  border-radius: 999px;
  overflow: hidden;
}

.analytics-bar span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9, #22c55e);
}

@media (max-width: 1200px) {
  .gates-hero { grid-template-columns: 1fr; }
  .gates-stats { grid-template-columns: repeat(3, 1fr); }
  .gates-filters { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 700px) {
  .gates-page { padding: 12px; }
  .gates-stats { grid-template-columns: repeat(2, 1fr); }
  .gates-filters { grid-template-columns: 1fr; }
  .details-grid { grid-template-columns: 1fr; }
}
`;

function injectCss() {
  if (document.getElementById("gates-command-center-css")) return;
  const style = document.createElement("style");
  style.id = "gates-command-center-css";
  style.innerHTML = GATES_CSS;
  document.head.appendChild(style);
}

function cleanText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ");
}

function safe(value) {
  return value === null || value === undefined || value === "" ? "-" : value;
}

function formatDate(value) {
  if (!value) return "Not inspected yet";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function statusLabel(status) {
  const map = {
    OK: "OK",
    NEEDS_MAINTENANCE: "Needs Maintenance",
    OUT_OF_SERVICE: "Out Of Service",
    UNDER_MAINTENANCE: "Under Maintenance",
    NOT_REACHABLE: "Not Reachable",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
    PENDING: "Pending",
    DONE: "Done",
    COMPLETED: "Completed",
    NOT_OK: "Fault",
    PARTIAL: "Partial Fault",
  };

  return map[status] || status || "-";
}

function exportCsv(filename, rows) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          return value.includes(",") || value.includes('"') || value.includes("\n")
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(",")
    )
    .join("\n");

  const blob = new Blob([`\uFEFF${csv}`], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function GatesPage({
  readOnly = false,
  title = "Gates Command Center",
  subtitle = "Advanced gate control dashboard with live backend data, inspections, tasks, filters, analytics, and full gate history.",
}) {
  const [gates, setGates] = useState([]);
  const [globalProgress, setGlobalProgress] = useState(null);

  const [selectedGate, setSelectedGate] = useState(null);
  const [inspections, setInspections] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [activeView, setActiveView] = useState("CARDS");
  const [drawerTab, setDrawerTab] = useState("OVERVIEW");

  const [search, setSearch] = useState("");
  const [gateNo, setGateNo] = useState("");
  const [cluster, setCluster] = useState("");
  const [building, setBuilding] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState("");
  const [onlyInspected, setOnlyInspected] = useState(false);
  const [onlyNotInspected, setOnlyNotInspected] = useState(false);
  const [onlyHasTasks, setOnlyHasTasks] = useState(false);
  const [sortBy, setSortBy] = useState("building");

  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    injectCss();
  }, []);

  async function loadGates() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/gates`);
      if (!res.ok) throw new Error(`Failed to load gates: ${res.status}`);
      const data = await res.json();
      setGates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load gates from backend.");
    } finally {
      setLoading(false);
    }
  }

  async function loadGlobalProgress() {
    try {
      const res = await fetch(`${API_BASE}/inspection-workflow/admin/global-progress`);
      if (!res.ok) return;
      const data = await res.json();
      setGlobalProgress(data);
    } catch (err) {
      console.warn(err);
    }
  }

  async function openGate(gate) {
    setSelectedGate(gate);
    setDrawerTab("OVERVIEW");
    setDetailsLoading(true);
    setInspections([]);
    setTasks([]);

    try {
      const [insRes, taskRes] = await Promise.all([
        fetch(`${API_BASE}/gates/${gate.id}/inspections`),
        fetch(`${API_BASE}/gates/${gate.id}/tasks`),
      ]);

      const insData = insRes.ok ? await insRes.json() : [];
      const taskData = taskRes.ok ? await taskRes.json() : [];

      setInspections(Array.isArray(insData) ? insData : []);
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    loadGates();
    loadGlobalProgress();
  }, []);

  const clusters = useMemo(
    () => [...new Set(gates.map((g) => g.cluster).filter(Boolean))].sort(),
    [gates]
  );

  const buildings = useMemo(
    () => [...new Set(gates.map((g) => g.building).filter(Boolean))].sort(),
    [gates]
  );

  const zones = useMemo(
    () => [...new Set(gates.map((g) => g.zone).filter(Boolean))].sort(),
    [gates]
  );

  const gateNumbers = useMemo(
    () => [...new Set(gates.map((g) => g.gateNo).filter(Boolean))].sort(),
    [gates]
  );

  const statuses = useMemo(
    () => [...new Set(gates.map((g) => g.currentStatus).filter(Boolean))].sort(),
    [gates]
  );

  const filteredGates = useMemo(() => {
    const q = cleanText(search);

    let list = gates.filter((gate) => {
      const inspectionsCount = gate._count?.inspections ?? 0;
      const tasksCount = gate._count?.tasks ?? 0;

      if (gateNo && String(gate.gateNo) !== String(gateNo)) return false;
      if (cluster && gate.cluster !== cluster) return false;
      if (building && gate.building !== building) return false;
      if (zone && gate.zone !== zone) return false;
      if (status && gate.currentStatus !== status) return false;
      if (onlyInspected && inspectionsCount <= 0) return false;
      if (onlyNotInspected && inspectionsCount > 0) return false;
      if (onlyHasTasks && tasksCount <= 0) return false;

      if (q) {
        const text = cleanText(
          [
            gate.id,
            gate.gateNo,
            gate.cluster,
            gate.building,
            gate.zone,
            gate.direction,
            gate.status,
            gate.currentStatus,
            gate.notes,
          ].join(" ")
        );

        if (!text.includes(q)) return false;
      }

      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "gateNo") return Number(a.gateNo) - Number(b.gateNo);
      if (sortBy === "inspections") {
        return (b._count?.inspections ?? 0) - (a._count?.inspections ?? 0);
      }
      if (sortBy === "tasks") {
        return (b._count?.tasks ?? 0) - (a._count?.tasks ?? 0);
      }
      if (sortBy === "lastInspectionAt") {
        return (
          new Date(b.lastInspectionAt || 0).getTime() -
          new Date(a.lastInspectionAt || 0).getTime()
        );
      }

      return String(a[sortBy] || "").localeCompare(String(b[sortBy] || ""));
    });

    return list;
  }, [
    gates,
    search,
    gateNo,
    cluster,
    building,
    zone,
    status,
    onlyInspected,
    onlyNotInspected,
    onlyHasTasks,
    sortBy,
  ]);

  const stats = useMemo(() => {
    const inspected = gates.filter((g) => (g._count?.inspections ?? 0) > 0).length;
    const notInspected = gates.length - inspected;
    const needsMaintenance = gates.filter(
      (g) => g.currentStatus === "NEEDS_MAINTENANCE"
    ).length;
    const totalTasks = gates.reduce((sum, g) => sum + (g._count?.tasks ?? 0), 0);
    const totalInspections = gates.reduce(
      (sum, g) => sum + (g._count?.inspections ?? 0),
      0
    );

    return {
      total: gates.length,
      inspected,
      notInspected,
      needsMaintenance,
      totalTasks,
      totalInspections,
      filtered: filteredGates.length,
    };
  }, [gates, filteredGates]);

  function resetFilters() {
    setSearch("");
    setGateNo("");
    setCluster("");
    setBuilding("");
    setZone("");
    setStatus("");
    setOnlyInspected(false);
    setOnlyNotInspected(false);
    setOnlyHasTasks(false);
    setSortBy("building");
  }

  function exportGates() {
    exportCsv("gates-report.csv", [
      [
        "ID",
        "Gate No",
        "Cluster",
        "Building",
        "Zone",
        "Direction",
        "Status",
        "Current Status",
        "Inspections",
        "Tasks",
        "Last Inspection",
      ],
      ...filteredGates.map((gate) => [
        gate.id,
        gate.gateNo,
        gate.cluster,
        gate.building,
        gate.zone,
        gate.direction,
        gate.status,
        gate.currentStatus,
        gate._count?.inspections ?? 0,
        gate._count?.tasks ?? 0,
        gate.lastInspectionAt || "",
      ]),
    ]);
  }

  const selectedAnalytics = useMemo(() => {
    const totalIns = inspections.length;
    const ok = inspections.filter((x) => x.inspectionStatus === "OK").length;
    const faults = inspections.filter((x) =>
      ["NOT_OK", "NEEDS_MAINTENANCE", "PARTIAL"].includes(x.inspectionStatus)
    ).length;
    const taskTotal = tasks.length;
    const taskDone = tasks.filter((x) =>
      ["DONE", "COMPLETED"].includes(x.status)
    ).length;

    return {
      totalIns,
      ok,
      faults,
      taskTotal,
      taskDone,
      okRate: totalIns ? Math.round((ok / totalIns) * 100) : 0,
      faultRate: totalIns ? Math.round((faults / totalIns) * 100) : 0,
      taskRate: taskTotal ? Math.round((taskDone / taskTotal) * 100) : 0,
    };
  }, [inspections, tasks]);

  return (
    <section className={`gates-page ${readOnly ? "viewer-gates-page" : ""}`}>
      <div className="gates-shell">
        <div className="gates-hero">
          <div className="gates-copy">
            <span className="gates-eyebrow">Smart IT Integrated Solutions</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="gates-stats">
            <div className="gate-stat">
              <span>Total Gates</span>
              <strong>{globalProgress?.totalGates ?? stats.total}</strong>
            </div>
            <div className="gate-stat">
              <span>Inspected</span>
              <strong>{globalProgress?.inspectedGates ?? stats.inspected}</strong>
            </div>
            <div className="gate-stat">
              <span>Not Inspected</span>
              <strong>{stats.notInspected}</strong>
            </div>
            <div className="gate-stat">
              <span>Inspections</span>
              <strong>{stats.totalInspections}</strong>
            </div>
            <div className="gate-stat">
              <span>Tasks</span>
              <strong>{stats.totalTasks}</strong>
            </div>
            <div className="gate-stat">
              <span>Filtered</span>
              <strong>{stats.filtered}</strong>
            </div>
          </div>
        </div>

        {error && <div className="gates-error">{error}</div>}

        <div className="gates-panel">
          <div className="gates-filters">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Smart search: gate, cluster, building, zone, status..."
            />

            <select value={gateNo} onChange={(e) => setGateNo(e.target.value)}>
              <option value="">All Gate Numbers</option>
              {gateNumbers.map((x) => (
                <option key={x} value={x}>
                  Gate {x}
                </option>
              ))}
            </select>

            <select value={cluster} onChange={(e) => setCluster(e.target.value)}>
              <option value="">All Clusters</option>
              {clusters.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select value={building} onChange={(e) => setBuilding(e.target.value)}>
              <option value="">All Buildings</option>
              {buildings.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select value={zone} onChange={(e) => setZone(e.target.value)}>
              <option value="">All Zones</option>
              {zones.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {statuses.map((x) => (
                <option key={x} value={x}>
                  {statusLabel(x)}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="building">Sort by Building</option>
              <option value="cluster">Sort by Cluster</option>
              <option value="gateNo">Sort by Gate No</option>
              <option value="inspections">Sort by Inspections</option>
              <option value="tasks">Sort by Tasks</option>
              <option value="lastInspectionAt">Sort by Last Inspection</option>
            </select>
          </div>

          <div className="gates-actions">
            <label className="gate-check">
              <input
                type="checkbox"
                checked={onlyInspected}
                onChange={(e) => {
                  setOnlyInspected(e.target.checked);
                  if (e.target.checked) setOnlyNotInspected(false);
                }}
              />
              Inspected only
            </label>

            <label className="gate-check">
              <input
                type="checkbox"
                checked={onlyNotInspected}
                onChange={(e) => {
                  setOnlyNotInspected(e.target.checked);
                  if (e.target.checked) setOnlyInspected(false);
                }}
              />
              Not inspected
            </label>

            <label className="gate-check">
              <input
                type="checkbox"
                checked={onlyHasTasks}
                onChange={(e) => setOnlyHasTasks(e.target.checked)}
              />
              Has tasks
            </label>

            <button className="gates-btn" onClick={loadGates}>
              Refresh
            </button>
            <button className="gates-btn dark" onClick={resetFilters}>
              Clear Filters
            </button>
            {!readOnly ? (
              <button className="gates-btn green" onClick={exportGates}>
                Export CSV
              </button>
            ) : null}
          </div>
        </div>

        <div className="gates-tabs">
          <button
            className={`gates-tab ${activeView === "CARDS" ? "active" : ""}`}
            onClick={() => setActiveView("CARDS")}
          >
            Cards View
          </button>
          <button
            className={`gates-tab ${activeView === "TABLE" ? "active" : ""}`}
            onClick={() => setActiveView("TABLE")}
          >
            Table View
          </button>
        </div>

        {loading ? (
          <div className="gates-loading">Loading gates...</div>
        ) : filteredGates.length === 0 ? (
          <div className="gates-empty">No gates match the current filters.</div>
        ) : activeView === "CARDS" ? (
          <div className="gates-grid">
            {filteredGates.map((gate) => {
              const inspectionsCount = gate._count?.inspections ?? 0;
              const tasksCount = gate._count?.tasks ?? 0;

              return (
                <article
                  className="gate-card"
                  key={gate.id}
                  onClick={() => openGate(gate)}
                >
                  <div className="gate-card-top">
                    <div className="gate-icon">G{gate.gateNo}</div>
                    <span className={`status ${gate.currentStatus}`}>
                      {statusLabel(gate.currentStatus)}
                    </span>
                  </div>

                  <h2>{safe(gate.building)}</h2>

                  <div className="gate-meta">
                    Cluster: {safe(gate.cluster)}
                    <br />
                    Zone: {safe(gate.zone)}
                    <br />
                    Direction: {safe(gate.direction)}
                    <br />
                    Last Inspection: {formatDate(gate.lastInspectionAt)}
                  </div>

                  <div className="gate-counts">
                    <span>Inspections: {inspectionsCount}</span>
                    <span>Tasks: {tasksCount}</span>
                  </div>

                  <div className="gate-progress-line">
                    <span style={{ width: inspectionsCount > 0 ? "100%" : "0%" }} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="gates-table-wrap">
            <table className="gates-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Gate</th>
                  <th>Cluster</th>
                  <th>Building</th>
                  <th>Zone</th>
                  <th>Direction</th>
                  <th>Status</th>
                  <th>Inspections</th>
                  <th>Tasks</th>
                  <th>Last Inspection</th>
                </tr>
              </thead>

              <tbody>
                {filteredGates.map((gate) => (
                  <tr key={gate.id} onClick={() => openGate(gate)}>
                    <td>#{gate.id}</td>
                    <td>Gate {gate.gateNo}</td>
                    <td>{safe(gate.cluster)}</td>
                    <td>{safe(gate.building)}</td>
                    <td>{safe(gate.zone)}</td>
                    <td>{safe(gate.direction)}</td>
                    <td>
                      <span className={`status ${gate.currentStatus}`}>
                        {statusLabel(gate.currentStatus)}
                      </span>
                    </td>
                    <td>{gate._count?.inspections ?? 0}</td>
                    <td>{gate._count?.tasks ?? 0}</td>
                    <td>{formatDate(gate.lastInspectionAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedGate && (
          <div className="gate-modal-backdrop" onClick={() => setSelectedGate(null)}>
            <div className="gate-drawer" onClick={(e) => e.stopPropagation()}>
              <div className="gate-details-header">
                <div>
                  <span className="gates-eyebrow">Gate Full Intelligence</span>
                  <h2>
                    Gate {selectedGate.gateNo} - {selectedGate.building}
                  </h2>
                  <p>
                    {selectedGate.cluster} / {selectedGate.zone || "-"} /{" "}
                    {selectedGate.direction || "-"}
                  </p>
                </div>

                <button className="gate-close" onClick={() => setSelectedGate(null)}>
                  ×
                </button>
              </div>

              <div className="drawer-tabs">
                {["OVERVIEW", "TIMELINE", "INSPECTIONS", "TASKS", "ANALYTICS"].map(
                  (tab) => (
                    <button
                      key={tab}
                      className={`drawer-tab ${drawerTab === tab ? "active" : ""}`}
                      onClick={() => setDrawerTab(tab)}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>

              {detailsLoading ? (
                <div className="gates-loading">Loading gate details...</div>
              ) : (
                <>
                  {drawerTab === "OVERVIEW" && (
                    <div className="details-grid">
                      <div className="details-box">
                        <h3>Gate Info</h3>
                        <InfoLine label="ID" value={selectedGate.id} />
                        <InfoLine label="Gate No" value={selectedGate.gateNo} />
                        <InfoLine label="Cluster" value={selectedGate.cluster} />
                        <InfoLine label="Building" value={selectedGate.building} />
                        <InfoLine label="Zone" value={selectedGate.zone} />
                        <InfoLine label="Direction" value={selectedGate.direction} />
                        <InfoLine label="Status" value={statusLabel(selectedGate.status)} />
                        <InfoLine
                          label="Current Status"
                          value={statusLabel(selectedGate.currentStatus)}
                        />
                        <InfoLine
                          label="Last Inspection"
                          value={formatDate(selectedGate.lastInspectionAt)}
                        />
                      </div>

                      <div className="details-box">
                        <h3>Smart Summary</h3>
                        <InfoLine label="Total Inspections" value={inspections.length} />
                        <InfoLine label="Total Tasks" value={tasks.length} />
                        <InfoLine label="OK Rate" value={`${selectedAnalytics.okRate}%`} />
                        <InfoLine label="Fault Rate" value={`${selectedAnalytics.faultRate}%`} />
                        <InfoLine label="Task Completion" value={`${selectedAnalytics.taskRate}%`} />
                      </div>
                    </div>
                  )}

                  {drawerTab === "TIMELINE" && (
                    <div className="timeline">
                      {inspections.length === 0 && tasks.length === 0 ? (
                        <div className="gates-empty">No timeline events yet.</div>
                      ) : (
                        [...inspections, ...tasks]
                          .sort(
                            (a, b) =>
                              new Date(b.inspectedAt || b.createdAt || 0).getTime() -
                              new Date(a.inspectedAt || a.createdAt || 0).getTime()
                          )
                          .map((item, index) => (
                            <div className="timeline-item" key={`${item.id}-${index}`}>
                              <div className="timeline-dot">
                                {item.inspectionStatus ? "✓" : "T"}
                              </div>
                              <div>
                                <div className="timeline-title">
                                  {item.inspectionStatus
                                    ? `Inspection ${statusLabel(item.inspectionStatus)}`
                                    : item.title || `Task #${item.id}`}
                                </div>
                                <div className="timeline-sub">
                                  {item.notes || item.issueReason || item.status || "-"}
                                  <br />
                                  {formatDate(item.inspectedAt || item.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  )}

                  {drawerTab === "INSPECTIONS" && (
                    <div className="details-box">
                      <h3>Inspections History ({inspections.length})</h3>

                      {inspections.length === 0 ? (
                        <p>No inspections yet.</p>
                      ) : (
                        inspections.map((inspection) => (
                          <div className="mini-row" key={inspection.id}>
                            <div>
                              <b>{statusLabel(inspection.inspectionStatus)}</b>
                              <span>{inspection.notes || inspection.issueReason || "-"}</span>
                            </div>
                            <small>{formatDate(inspection.inspectedAt)}</small>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {drawerTab === "TASKS" && (
                    <div className="details-box">
                      <h3>Tasks ({tasks.length})</h3>

                      {tasks.length === 0 ? (
                        <p>No tasks yet.</p>
                      ) : (
                        tasks.map((task) => (
                          <div className="mini-row" key={task.id}>
                            <div>
                              <b>{task.title || `Task #${task.id}`}</b>
                              <span>
                                {task.completedItems ?? 0}/{task.totalItems ?? 0} completed
                              </span>
                            </div>
                            <small>{statusLabel(task.status)}</small>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {drawerTab === "ANALYTICS" && (
                    <div className="details-box">
                      <h3>Gate Analytics</h3>

                      <div className="analytics-bars">
                        <AnalyticsRow label="OK Rate" value={selectedAnalytics.okRate} />
                        <AnalyticsRow label="Fault Rate" value={selectedAnalytics.faultRate} />
                        <AnalyticsRow label="Task Done" value={selectedAnalytics.taskRate} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="info-line">
      <b>{label}</b>
      <span>{safe(value)}</span>
    </div>
  );
}

function AnalyticsRow({ label, value }) {
  return (
    <div className="analytics-row">
      <b>{label}</b>
      <div className="analytics-bar">
        <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
      <strong>{value}%</strong>
    </div>
  );
}

export default GatesPage;
