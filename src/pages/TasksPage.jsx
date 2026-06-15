import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

const STORAGE_KEY = "smartit_global_tasks_wow_v2";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

async function api(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.error || `HTTP ${res.status}`);
  }

  return data;
}

async function tryPaths(paths) {
  let lastError;
  for (const p of paths) {
    try {
      return await api(p);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed");
}

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.devices)) return data.devices;
  if (Array.isArray(data?.gates)) return data.gates;
  return [];
}

function getRole(user) {
  return String(
    user?.role?.name ||
      user?.role ||
      user?.userRole ||
      user?.type ||
      user?.jobTitle ||
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ");
}

function isTechnician(user) {
  const r = getRole(user);
  return r === "technician" || r.includes("technician") || r.includes("فني");
}

function userName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    `Technician #${user?.id}`
  );
}

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function assetLocation(x) {
  const l = x?.location || {};

  return {
    ministry:
      x?.ministry ||
      x?.ministryName ||
      x?.organization ||
      l?.ministry ||
      l?.name ||
      x?.building ||
      "",
    cluster: x?.cluster || l?.cluster || "",
    building: x?.building || l?.building || "",
    zone: x?.zone || l?.zone || "",
    lane: x?.lane || l?.lane || "",
    direction: x?.direction || l?.direction || "",
    type:
      x?.type ||
      x?.deviceType?.name ||
      x?.gateType ||
      x?.currentStatus ||
      "",
  };
}

function assetTitle(a) {
  if (a.assetType === "GATE") {
    return `Gate ${a.gateNo || a.gateNumber || a.name || a.id}`;
  }

  return (
    a.deviceName ||
    a.name ||
    a.deviceCode ||
    a.barcode ||
    `Device ${a.id}`
  );
}

function unique(list) {
  return [...new Set(list.filter(Boolean).map(String))].sort();
}

function percent(done, total) {
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

function statusClass(status) {
  if (status === "DONE") return "done";
  if (status === "IN_PROGRESS") return "progress";
  if (status === "ISSUE") return "issue";
  return "pending";
}

const styles = `
.tasks-wow{
  min-height:100vh;
  padding:24px;
  background:
    radial-gradient(circle at top left,rgba(14,165,233,.18),transparent 28%),
    radial-gradient(circle at top right,rgba(99,102,241,.14),transparent 30%),
    linear-gradient(135deg,#f8fbff,#eefaff);
  color:#0f172a;
  font-family:Inter,system-ui,Arial,sans-serif;
}

.tw-hero{
  border-radius:32px;
  padding:30px;
  background:linear-gradient(135deg,#061427,#102f55,#0ea5e9);
  color:white;
  box-shadow:0 30px 80px rgba(14,165,233,.25);
  display:flex;
  justify-content:space-between;
  gap:20px;
  align-items:flex-start;
}

.tw-hero h1{
  margin:0;
  font-size:38px;
  letter-spacing:-1px;
}

.tw-hero p{
  margin:8px 0 0;
  color:#dff7ff;
  font-weight:800;
}

.tw-btn{
  border:0;
  border-radius:16px;
  padding:12px 18px;
  font-weight:1000;
  cursor:pointer;
  background:#0ea5e9;
  color:white;
  box-shadow:0 12px 28px rgba(14,165,233,.28);
  transition:.18s ease;
}

.tw-btn:hover{
  transform:translateY(-1px);
  filter:brightness(1.03);
}

.tw-btn.white{
  background:white;
  color:#0f172a;
  border:1px solid #dbeafe;
  box-shadow:none;
}

.tw-btn.dark{
  background:#0f172a;
}

.tw-btn.green{
  background:#22c55e;
}

.tw-btn.blue{
  background:#2563eb;
}

.tw-btn.red{
  background:#ef4444;
}

.tw-btn.orange{
  background:#f97316;
}

.tw-btn:disabled{
  opacity:.45;
  cursor:not-allowed;
}

.tw-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.tw-tabs{
  margin:18px 0;
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}

.tw-tab{
  background:white;
  border:1px solid #cbd5e1;
  border-radius:999px;
  padding:11px 16px;
  font-weight:1000;
  color:#334155;
  cursor:pointer;
}

.tw-tab.active{
  background:#0f172a;
  color:white;
  border-color:#0f172a;
}

.tw-stats{
  display:grid;
  grid-template-columns:repeat(6,minmax(0,1fr));
  gap:14px;
}

.tw-stat{
  background:white;
  border:1px solid #dbeafe;
  border-radius:24px;
  padding:18px;
  box-shadow:0 18px 42px rgba(15,23,42,.06);
  position:relative;
  overflow:hidden;
}

.tw-stat:before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:5px;
  background:linear-gradient(90deg,#0ea5e9,#6366f1,#22c55e);
}

.tw-stat span{
  display:block;
  color:#64748b;
  font-size:11px;
  font-weight:1000;
  text-transform:uppercase;
  letter-spacing:.4px;
}

.tw-stat strong{
  display:block;
  font-size:32px;
  margin-top:9px;
  line-height:1;
}

.tw-progress{
  height:12px;
  border-radius:999px;
  background:#e2e8f0;
  overflow:hidden;
  margin-top:12px;
}

.tw-progress i{
  display:block;
  height:100%;
  background:linear-gradient(90deg,#ef4444,#2563eb,#22c55e);
  transition:.3s;
}

.tw-panel{
  margin-top:18px;
  background:white;
  border:1px solid #dbeafe;
  border-radius:30px;
  padding:20px;
  box-shadow:0 20px 48px rgba(15,23,42,.07);
}

.tw-panel-head{
  display:flex;
  justify-content:space-between;
  gap:14px;
  align-items:flex-start;
  margin-bottom:16px;
}

.tw-panel h2{
  margin:0;
  font-size:23px;
}

.tw-panel p{
  margin:6px 0 0;
  color:#64748b;
  font-weight:800;
}

.tw-toolbar{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  align-items:center;
}

.tw-input,
.tw-select,
.tw-textarea{
  width:100%;
  border:1px solid #cbd5e1;
  border-radius:15px;
  padding:12px;
  outline:none;
  font-weight:900;
  background:white;
}

.tw-input:focus,
.tw-select:focus,
.tw-textarea:focus{
  border-color:#0ea5e9;
  box-shadow:0 0 0 4px rgba(14,165,233,.12);
}

.tw-textarea{
  min-height:90px;
}

.tw-grid-form{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
}

.tw-field label{
  display:block;
  font-size:11px;
  font-weight:1000;
  text-transform:uppercase;
  color:#64748b;
  margin-bottom:6px;
}

.tw-wide{
  grid-column:span 4;
}

.tw-layout{
  display:grid;
  grid-template-columns:330px 1fr 330px;
  gap:16px;
}

.tw-filter{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:24px;
  padding:16px;
}

.tw-stack{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.tw-list{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:24px;
  padding:12px;
  max-height:560px;
  overflow:auto;
}

.tw-asset{
  background:white;
  border:1px solid #e2e8f0;
  border-radius:20px;
  padding:13px;
  display:flex;
  gap:12px;
  cursor:pointer;
  margin-bottom:10px;
  transition:.18s ease;
}

.tw-asset:hover{
  transform:translateY(-1px);
  box-shadow:0 12px 28px rgba(15,23,42,.07);
}

.tw-asset.selected{
  background:#ecfeff;
  border-color:#0ea5e9;
}

.tw-asset.done{
  background:#f0fdf4;
  border-color:#86efac;
}

.tw-asset.progress{
  background:#eff6ff;
  border-color:#93c5fd;
}

.tw-asset.issue{
  background:#fff7ed;
  border-color:#fdba74;
}

.tw-asset.pending{
  background:#fff1f2;
  border-color:#fecdd3;
}

.tw-asset b{
  display:block;
}

.tw-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:8px;
}

.tw-tag{
  font-size:11px;
  font-weight:1000;
  padding:4px 8px;
  border-radius:999px;
  background:#eef2ff;
  color:#3730a3;
}

.tw-tag.device{
  background:#ecfdf5;
  color:#047857;
}

.tw-tag.gate{
  background:#fff7ed;
  color:#c2410c;
}

.tw-tag.done{
  background:#dcfce7;
  color:#15803d;
}

.tw-tag.progress{
  background:#dbeafe;
  color:#1d4ed8;
}

.tw-tag.pending{
  background:#fee2e2;
  color:#b91c1c;
}

.tw-mini{
  color:#64748b;
  font-size:12px;
  font-weight:800;
  margin-top:4px;
}

.tw-basket{
  background:linear-gradient(180deg,#ffffff,#f8fafc);
  border:1px solid #dbeafe;
  border-radius:24px;
  padding:16px;
  max-height:560px;
  overflow:auto;
}

.tw-basket h3{
  margin:0 0 10px;
}

.tw-basket-card{
  border:1px solid #e2e8f0;
  background:white;
  border-radius:18px;
  padding:11px;
  margin-bottom:8px;
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.tw-x{
  border:0;
  background:#fee2e2;
  color:#b91c1c;
  border-radius:10px;
  font-weight:1000;
  cursor:pointer;
  width:32px;
  height:32px;
}

.tw-task-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:14px;
}

.tw-task{
  border:1px solid #dbeafe;
  background:linear-gradient(180deg,#fff,#f8fbff);
  border-radius:26px;
  padding:16px;
  box-shadow:0 14px 35px rgba(15,23,42,.06);
}

.tw-task-head{
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.tw-task h3{
  margin:0;
}

.tw-task-meta{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin:12px 0;
}

.tw-task-items{
  display:grid;
  grid-template-columns:1fr;
  gap:10px;
  margin-top:12px;
}

.tw-item{
  border-radius:20px;
  padding:12px;
  border:1px solid #fecdd3;
  background:#fff1f2;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  transition:.2s ease;
}

.tw-item.progress{
  border-color:#93c5fd;
  background:#eff6ff;
}

.tw-item.done{
  border-color:#86efac;
  background:#f0fdf4;
}

.tw-item.issue{
  border-color:#fdba74;
  background:#fff7ed;
}

.tw-item-actions{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.tw-small{
  padding:8px 10px;
  border-radius:12px;
  font-size:12px;
}

.tw-empty{
  border:1px dashed #cbd5e1;
  border-radius:20px;
  padding:30px;
  text-align:center;
  color:#64748b;
  font-weight:900;
  background:#f8fafc;
}

.tw-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.62);
  backdrop-filter:blur(8px);
  z-index:1000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
}

.tw-modal{
  width:min(1180px,96vw);
  max-height:92vh;
  overflow:auto;
  background:white;
  border-radius:32px;
  box-shadow:0 40px 120px rgba(0,0,0,.35);
  border:1px solid #dbeafe;
}

.tw-modal-head{
  position:sticky;
  top:0;
  z-index:3;
  background:linear-gradient(135deg,#071427,#123a64,#0ea5e9);
  color:white;
  padding:22px;
  display:flex;
  justify-content:space-between;
  gap:14px;
  align-items:flex-start;
}

.tw-modal-head h2{
  margin:0;
  font-size:26px;
}

.tw-modal-head p{
  margin:6px 0 0;
  color:#dff7ff;
  font-weight:800;
}

.tw-close{
  background:rgba(255,255,255,.18);
  border:1px solid rgba(255,255,255,.3);
  color:white;
  border-radius:14px;
  width:42px;
  height:42px;
  font-size:22px;
  cursor:pointer;
}

.tw-modal-body{
  padding:20px;
}

.tw-stepper{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  margin-bottom:18px;
}

.tw-step{
  border-radius:18px;
  padding:13px;
  background:#f1f5f9;
  border:1px solid #e2e8f0;
  font-weight:1000;
  color:#64748b;
}

.tw-step.active{
  background:#eff6ff;
  color:#1d4ed8;
  border-color:#93c5fd;
}

.tw-step.done{
  background:#f0fdf4;
  color:#15803d;
  border-color:#86efac;
}

.tw-modal-foot{
  position:sticky;
  bottom:0;
  background:white;
  border-top:1px solid #e2e8f0;
  padding:16px 20px;
  display:flex;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
}

.tw-review{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:14px;
}

.tw-review-card{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:22px;
  padding:16px;
}

.tw-review-card span{
  color:#64748b;
  font-size:11px;
  font-weight:1000;
  text-transform:uppercase;
}

.tw-review-card strong{
  display:block;
  font-size:28px;
  margin-top:8px;
}

.tw-alert{
  padding:14px 16px;
  border-radius:18px;
  border:1px solid #fecaca;
  background:#fef2f2;
  color:#b91c1c;
  font-weight:900;
  margin-top:14px;
}

@media(max-width:1200px){
  .tw-stats{grid-template-columns:repeat(3,1fr)}
  .tw-layout{grid-template-columns:1fr}
  .tw-grid-form{grid-template-columns:repeat(2,1fr)}
  .tw-wide{grid-column:span 2}
  .tw-task-grid{grid-template-columns:1fr}
}

@media(max-width:700px){
  .tw-hero{flex-direction:column}
  .tw-stats{grid-template-columns:1fr}
  .tw-grid-form{grid-template-columns:1fr}
  .tw-wide{grid-column:span 1}
  .tw-review{grid-template-columns:1fr}
  .tw-stepper{grid-template-columns:1fr}
}
`;

export function TasksPage() {
  const [view, setView] = useState("ADMIN");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [gates, setGates] = useState([]);

  const [tasks, setTasks] = useState(loadLocal());

  const [form, setForm] = useState({
    title: "Global Inspection Task",
    technicianId: "",
    scheduledDate: "",
    priority: "HIGH",
    notes: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    assetType: "ALL",
    ministry: "ALL",
    cluster: "ALL",
    building: "ALL",
    zone: "ALL",
    direction: "ALL",
    type: "ALL",
  });

  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const s = document.createElement("style");
    s.innerHTML = styles;
    document.head.appendChild(s);
    return () => s.remove();
  }, []);

  useEffect(() => {
    saveLocal(tasks);
  }, [tasks]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [u, d, g] = await Promise.all([
        tryPaths(["/users", "/accounts", "/auth/users"]).catch(() => []),
        tryPaths(["/devices"]).catch(() => []),
        tryPaths(["/gates"]).catch(() => []),
      ]);

      setUsers(toArray(u));
      setDevices(toArray(d));
      setGates(toArray(g));
    } catch (e) {
      setError(e.message || "Failed to load backend data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const technicians = useMemo(() => users.filter(isTechnician), [users]);

  const assets = useMemo(() => {
    const mappedDevices = devices.map((d) => ({
      ...d,
      uid: `DEVICE-${d.id}`,
      assetType: "DEVICE",
      loc: assetLocation(d),
    }));

    const mappedGates = gates.map((g) => ({
      ...g,
      uid: `GATE-${g.id}`,
      assetType: "GATE",
      loc: assetLocation(g),
    }));

    return [...mappedDevices, ...mappedGates];
  }, [devices, gates]);

  const optionBase = useMemo(() => {
    return assets.filter((a) => {
      if (filters.assetType !== "ALL" && a.assetType !== filters.assetType) return false;
      if (filters.ministry !== "ALL" && a.loc.ministry !== filters.ministry) return false;
      if (filters.cluster !== "ALL" && a.loc.cluster !== filters.cluster) return false;
      if (filters.building !== "ALL" && a.loc.building !== filters.building) return false;
      if (filters.zone !== "ALL" && a.loc.zone !== filters.zone) return false;
      return true;
    });
  }, [assets, filters]);

  const filterOptions = useMemo(() => {
    return {
      ministry: unique(assets.map((a) => a.loc.ministry)),
      cluster: unique(optionBase.map((a) => a.loc.cluster)),
      building: unique(optionBase.map((a) => a.loc.building)),
      zone: unique(optionBase.map((a) => a.loc.zone)),
      direction: unique(optionBase.map((a) => a.loc.direction)),
      type: unique(optionBase.map((a) => a.loc.type)),
    };
  }, [assets, optionBase]);

  const filteredAssets = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return assets.filter((a) => {
      const text = [
        assetTitle(a),
        a.deviceCode,
        a.barcode,
        a.gateNo,
        a.loc.ministry,
        a.loc.cluster,
        a.loc.building,
        a.loc.zone,
        a.loc.direction,
        a.loc.type,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !text.includes(q)) return false;
      if (filters.assetType !== "ALL" && a.assetType !== filters.assetType) return false;
      if (filters.ministry !== "ALL" && a.loc.ministry !== filters.ministry) return false;
      if (filters.cluster !== "ALL" && a.loc.cluster !== filters.cluster) return false;
      if (filters.building !== "ALL" && a.loc.building !== filters.building) return false;
      if (filters.zone !== "ALL" && a.loc.zone !== filters.zone) return false;
      if (filters.direction !== "ALL" && a.loc.direction !== filters.direction) return false;
      if (filters.type !== "ALL" && a.loc.type !== filters.type) return false;

      return true;
    });
  }, [assets, filters]);

  const selectedAssets = useMemo(
    () => assets.filter((a) => selected.includes(a.uid)),
    [assets, selected]
  );

  const summary = useMemo(() => {
    const all = tasks.flatMap((t) => t.items);
    const done = all.filter((i) => i.status === "DONE");
    const progress = all.filter((i) => i.status === "IN_PROGRESS");
    const pending = all.filter((i) => i.status === "PENDING");
    const devicesAll = all.filter((i) => i.assetType === "DEVICE");
    const gatesAll = all.filter((i) => i.assetType === "GATE");

    return {
      tasks: tasks.length,
      total: all.length,
      done: done.length,
      progress: progress.length,
      pending: pending.length,
      remaining: all.length - done.length,
      devicesDone: devicesAll.filter((i) => i.status === "DONE").length,
      devicesTotal: devicesAll.length,
      gatesDone: gatesAll.filter((i) => i.status === "DONE").length,
      gatesTotal: gatesAll.length,
      percent: percent(done.length, all.length),
    };
  }, [tasks]);

  const shownTasks = useMemo(() => {
    if (view === "ADMIN") return tasks;
    const techId = form.technicianId || technicians[0]?.id;
    return tasks.filter((t) => String(t.technicianId) === String(techId));
  }, [view, tasks, form.technicianId, technicians]);

  function openAddTask() {
    setModalOpen(true);
    setStep(1);
  }

  function closeAddTask() {
    setModalOpen(false);
  }

  function toggleAsset(uid) {
    setSelected((old) =>
      old.includes(uid) ? old.filter((x) => x !== uid) : [...old, uid]
    );
  }

  function removeAsset(uid) {
    setSelected((old) => old.filter((x) => x !== uid));
  }

  function selectAllFiltered() {
    setSelected((old) => {
      const set = new Set(old);
      filteredAssets.forEach((a) => set.add(a.uid));
      return [...set];
    });
  }

  function selectOnlyDevices() {
    setSelected((old) => {
      const set = new Set(old);
      filteredAssets
        .filter((a) => a.assetType === "DEVICE")
        .forEach((a) => set.add(a.uid));
      return [...set];
    });
  }

  function selectOnlyGates() {
    setSelected((old) => {
      const set = new Set(old);
      filteredAssets
        .filter((a) => a.assetType === "GATE")
        .forEach((a) => set.add(a.uid));
      return [...set];
    });
  }

  function clearSelected() {
    setSelected([]);
  }

  function createTask() {
    if (!form.technicianId) return alert("اختاري الفني الأول");
    if (!form.scheduledDate) return alert("اختاري ميعاد التاسك");
    if (!selectedAssets.length) return alert("اختاري أجهزة أو بوابات");

    const tech = technicians.find((t) => String(t.id) === String(form.technicianId));

    const newTask = {
      id: Date.now(),
      title: form.title || "Global Inspection Task",
      technicianId: String(form.technicianId),
      technicianName: userName(tech),
      scheduledDate: form.scheduledDate,
      priority: form.priority,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      items: selectedAssets.map((a) => ({
        id: `${a.uid}-${Date.now()}-${Math.random()}`,
        assetUid: a.uid,
        assetId: a.id,
        assetType: a.assetType,
        label: assetTitle(a),
        loc: a.loc,
        status: "PENDING",
        doneAt: null,
        startedAt: null,
      })),
    };

    setTasks((old) => [newTask, ...old]);
    setModalOpen(false);
    setStep(1);
    setSelected([]);
  }

  function setItemStatus(taskId, itemId, nextStatus) {
    setTasks((old) =>
      old.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          items: task.items.map((item) => {
            if (item.id !== itemId) return item;

            return {
              ...item,
              status: nextStatus,
              startedAt:
                nextStatus === "IN_PROGRESS"
                  ? item.startedAt || new Date().toISOString()
                  : item.startedAt,
              doneAt:
                nextStatus === "DONE"
                  ? new Date().toISOString()
                  : nextStatus === "PENDING"
                    ? null
                    : item.doneAt,
            };
          }),
        };
      })
    );
  }

  function markAllDone(taskId) {
    setTasks((old) =>
      old.map((task) =>
        task.id === taskId
          ? {
              ...task,
              items: task.items.map((i) => ({
                ...i,
                status: "DONE",
                doneAt: i.doneAt || new Date().toISOString(),
              })),
            }
          : task
      )
    );
  }

  function deleteTask(taskId) {
    if (!confirm("Delete this task?")) return;
    setTasks((old) => old.filter((t) => t.id !== taskId));
  }

  const reviewDevices = selectedAssets.filter((a) => a.assetType === "DEVICE").length;
  const reviewGates = selectedAssets.filter((a) => a.assetType === "GATE").length;

  return (
    <section className="tasks-wow">
      <div className="tw-hero">
        <div>
          <h1>Global Task Command Center</h1>
          <p>
            اختاري فني، حددي أجهزة وبوابات، تابعي Done و Remaining بألوان واضحة.
          </p>
        </div>

        <div className="tw-actions">
          <button className="tw-btn white" onClick={loadData}>
            {loading ? "Loading..." : "Refresh Data"}
          </button>
          <button className="tw-btn green" onClick={openAddTask}>
            + Add Global Task
          </button>
        </div>
      </div>

      {error && <div className="tw-alert">{error}</div>}

      <div className="tw-tabs">
        <button
          className={`tw-tab ${view === "ADMIN" ? "active" : ""}`}
          onClick={() => setView("ADMIN")}
        >
          Admin Monitor
        </button>
        <button
          className={`tw-tab ${view === "TECH" ? "active" : ""}`}
          onClick={() => setView("TECH")}
        >
          Technician View
        </button>
      </div>

      <div className="tw-stats">
        <div className="tw-stat">
          <span>Tasks</span>
          <strong>{summary.tasks}</strong>
        </div>
        <div className="tw-stat">
          <span>Total Items</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="tw-stat">
          <span>Done Green</span>
          <strong>{summary.done}</strong>
        </div>
        <div className="tw-stat">
          <span>In Progress Blue</span>
          <strong>{summary.progress}</strong>
        </div>
        <div className="tw-stat">
          <span>Remaining Red</span>
          <strong>{summary.remaining}</strong>
        </div>
        <div className="tw-stat">
          <span>Progress</span>
          <strong>{summary.percent}%</strong>
          <div className="tw-progress">
            <i style={{ width: `${summary.percent}%` }} />
          </div>
        </div>
      </div>

      <div className="tw-stats" style={{ marginTop: 14 }}>
        <div className="tw-stat">
          <span>Devices Done</span>
          <strong>
            {summary.devicesDone}/{summary.devicesTotal}
          </strong>
        </div>
        <div className="tw-stat">
          <span>Gates Done</span>
          <strong>
            {summary.gatesDone}/{summary.gatesTotal}
          </strong>
        </div>
        <div className="tw-stat">
          <span>Backend Devices</span>
          <strong>{devices.length}</strong>
        </div>
        <div className="tw-stat">
          <span>Backend Gates</span>
          <strong>{gates.length}</strong>
        </div>
        <div className="tw-stat">
          <span>Technicians</span>
          <strong>{technicians.length}</strong>
        </div>
        <div className="tw-stat">
          <span>Selected</span>
          <strong>{selectedAssets.length}</strong>
        </div>
      </div>

      {view === "TECH" && (
        <div className="tw-panel">
          <div className="tw-panel-head">
            <div>
              <h2>Technician Preview</h2>
              <p>اختاري الفني علشان تشوفي التاسكات بتاعته وتعملي Done زي الموبايل.</p>
            </div>
          </div>

          <div className="tw-field">
            <label>Technician</label>
            <select
              className="tw-select"
              value={form.technicianId}
              onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
            >
              <option value="">Auto first technician</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {userName(t)} — TECHNICIAN
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="tw-panel">
        <div className="tw-panel-head">
          <div>
            <h2>{view === "ADMIN" ? "All Global Tasks" : "My Assigned Tasks"}</h2>
            <p>
              الأحمر = لسه، الأزرق = الفني بدأ، الأخضر = Done.
            </p>
          </div>

          {view === "ADMIN" && (
            <button className="tw-btn green" onClick={openAddTask}>
              + Add Task
            </button>
          )}
        </div>

        {shownTasks.length === 0 ? (
          <div className="tw-empty">
            No tasks yet. اضغطي Add Global Task وابدئي أول تاسك.
          </div>
        ) : (
          <div className="tw-task-grid">
            {shownTasks.map((task) => {
              const done = task.items.filter((i) => i.status === "DONE").length;
              const inProgress = task.items.filter((i) => i.status === "IN_PROGRESS").length;
              const total = task.items.length;
              const devicesTotal = task.items.filter((i) => i.assetType === "DEVICE").length;
              const gatesTotal = task.items.filter((i) => i.assetType === "GATE").length;
              const taskPercent = percent(done, total);

              return (
                <article className="tw-task" key={task.id}>
                  <div className="tw-task-head">
                    <div>
                      <h3>{task.title}</h3>
                      <div className="tw-mini">
                        {task.technicianName} • {new Date(task.scheduledDate).toLocaleString()}
                      </div>
                    </div>

                    <span className={`tw-tag ${taskPercent === 100 ? "done" : inProgress ? "progress" : "pending"}`}>
                      {taskPercent}%
                    </span>
                  </div>

                  <div className="tw-task-meta">
                    <span className="tw-tag">Total {total}</span>
                    <span className="tw-tag device">Devices {devicesTotal}</span>
                    <span className="tw-tag gate">Gates {gatesTotal}</span>
                    <span className="tw-tag done">Done {done}</span>
                    <span className="tw-tag progress">Blue {inProgress}</span>
                    <span className="tw-tag pending">Remaining {total - done}</span>
                  </div>

                  <div className="tw-progress">
                    <i style={{ width: `${taskPercent}%` }} />
                  </div>

                  {task.notes && <p>{task.notes}</p>}

                  <div className="tw-actions" style={{ marginTop: 12 }}>
                    <button className="tw-btn green tw-small" onClick={() => markAllDone(task.id)}>
                      Mark All Done
                    </button>
                    {view === "ADMIN" && (
                      <button className="tw-btn red tw-small" onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    )}
                  </div>

                  <div className="tw-task-items">
                    {task.items.map((item) => (
                      <div
                        key={item.id}
                        className={`tw-item ${statusClass(item.status)}`}
                      >
                        <div>
                          <b>{item.label}</b>
                          <div className="tw-mini">
                            {item.assetType} • {item.loc?.ministry || "—"} •{" "}
                            {item.loc?.building || "—"} • {item.loc?.zone || "—"}
                          </div>

                          <div className="tw-tags">
                            <span className={`tw-tag ${item.assetType === "GATE" ? "gate" : "device"}`}>
                              {item.assetType}
                            </span>
                            <span className={`tw-tag ${statusClass(item.status)}`}>
                              {item.status === "PENDING"
                                ? "Red Pending"
                                : item.status === "IN_PROGRESS"
                                  ? "Blue Started"
                                  : item.status === "DONE"
                                    ? "Green Done"
                                    : item.status}
                            </span>
                            {item.loc?.direction && <span className="tw-tag">{item.loc.direction}</span>}
                          </div>
                        </div>

                        <div className="tw-item-actions">
                          <button
                            className="tw-btn blue tw-small"
                            onClick={() => setItemStatus(task.id, item.id, "IN_PROGRESS")}
                          >
                            Start
                          </button>
                          <button
                            className="tw-btn green tw-small"
                            onClick={() => setItemStatus(task.id, item.id, "DONE")}
                          >
                            Done
                          </button>
                          <button
                            className="tw-btn white tw-small"
                            onClick={() => setItemStatus(task.id, item.id, "PENDING")}
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="tw-modal-backdrop">
          <div className="tw-modal">
            <div className="tw-modal-head">
              <div>
                <h2>Dispatch New Global Task</h2>
                <p>بوكس منظم: اختاري الفني، الفلاتر، الأجهزة والبوابات، ثم إرسال.</p>
              </div>
              <button className="tw-close" onClick={closeAddTask}>
                ×
              </button>
            </div>

            <div className="tw-modal-body">
              <div className="tw-stepper">
                <div className={`tw-step ${step === 1 ? "active" : step > 1 ? "done" : ""}`}>
                  1. Technician & Info
                </div>
                <div className={`tw-step ${step === 2 ? "active" : step > 2 ? "done" : ""}`}>
                  2. Select Assets
                </div>
                <div className={`tw-step ${step === 3 ? "active" : ""}`}>
                  3. Review & Dispatch
                </div>
              </div>

              {step === 1 && (
                <div className="tw-grid-form">
                  <div className="tw-field">
                    <label>Technician only</label>
                    <select
                      className="tw-select"
                      value={form.technicianId}
                      onChange={(e) => setForm({ ...form, technicianId: e.target.value })}
                    >
                      <option value="">Select Technician...</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {userName(t)} — TECHNICIAN
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="tw-field">
                    <label>Scheduled Date</label>
                    <input
                      className="tw-input"
                      type="datetime-local"
                      value={form.scheduledDate}
                      onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    />
                  </div>

                  <div className="tw-field">
                    <label>Priority</label>
                    <select
                      className="tw-select"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="EMERGENCY">EMERGENCY</option>
                    </select>
                  </div>

                  <div className="tw-field">
                    <label>Task Title</label>
                    <input
                      className="tw-input"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="tw-field tw-wide">
                    <label>Instructions</label>
                    <textarea
                      className="tw-textarea"
                      placeholder="تعليمات للفني..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="tw-layout">
                  <div className="tw-filter">
                    <h3>Power Filters</h3>

                    <div className="tw-stack">
                      <input
                        className="tw-input"
                        placeholder="Search ministry, building, device, gate..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      />

                      <select
                        className="tw-select"
                        value={filters.assetType}
                        onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
                      >
                        <option value="ALL">Devices + Gates</option>
                        <option value="DEVICE">Devices Only</option>
                        <option value="GATE">Gates Only</option>
                      </select>

                      <select
                        className="tw-select"
                        value={filters.ministry}
                        onChange={(e) => setFilters({ ...filters, ministry: e.target.value })}
                      >
                        <option value="ALL">All Ministries</option>
                        {filterOptions.ministry.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>

                      <select
                        className="tw-select"
                        value={filters.building}
                        onChange={(e) => setFilters({ ...filters, building: e.target.value })}
                      >
                        <option value="ALL">All Buildings</option>
                        {filterOptions.building.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>

                      <select
                        className="tw-select"
                        value={filters.cluster}
                        onChange={(e) => setFilters({ ...filters, cluster: e.target.value })}
                      >
                        <option value="ALL">All Clusters</option>
                        {filterOptions.cluster.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>

                      <select
                        className="tw-select"
                        value={filters.zone}
                        onChange={(e) => setFilters({ ...filters, zone: e.target.value })}
                      >
                        <option value="ALL">All Zones</option>
                        {filterOptions.zone.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>

                      <select
                        className="tw-select"
                        value={filters.direction}
                        onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
                      >
                        <option value="ALL">All Directions</option>
                        {filterOptions.direction.map((x) => (
                          <option key={x}>{x}</option>
                        ))}
                      </select>

                      <button className="tw-btn" onClick={selectAllFiltered}>
                        Select Current Filter ({filteredAssets.length})
                      </button>

                      <button className="tw-btn blue" onClick={selectOnlyDevices}>
                        Select Devices
                      </button>

                      <button className="tw-btn orange" onClick={selectOnlyGates}>
                        Select Gates
                      </button>

                      <button className="tw-btn white" onClick={clearSelected}>
                        Clear All ({selected.length})
                      </button>
                    </div>
                  </div>

                  <div className="tw-list">
                    {filteredAssets.map((a) => (
                      <div
                        key={a.uid}
                        className={`tw-asset ${selected.includes(a.uid) ? "selected" : ""}`}
                        onClick={() => toggleAsset(a.uid)}
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(a.uid)}
                          onChange={() => toggleAsset(a.uid)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div>
                          <b>{assetTitle(a)}</b>
                          <div className="tw-mini">
                            ID: {a.id} {a.deviceCode ? `• ${a.deviceCode}` : ""}
                          </div>

                          <div className="tw-tags">
                            <span className={`tw-tag ${a.assetType === "GATE" ? "gate" : "device"}`}>
                              {a.assetType}
                            </span>
                            {a.loc.ministry && <span className="tw-tag">{a.loc.ministry}</span>}
                            {a.loc.building && <span className="tw-tag">{a.loc.building}</span>}
                            {a.loc.zone && <span className="tw-tag">{a.loc.zone}</span>}
                            {a.loc.direction && <span className="tw-tag">{a.loc.direction}</span>}
                          </div>
                        </div>
                      </div>
                    ))}

                    {!filteredAssets.length && (
                      <div className="tw-empty">No assets match this filter.</div>
                    )}
                  </div>

                  <div className="tw-basket">
                    <h3>Selected Basket</h3>
                    <div className="tw-task-meta">
                      <span className="tw-tag device">Devices {reviewDevices}</span>
                      <span className="tw-tag gate">Gates {reviewGates}</span>
                      <span className="tw-tag">Total {selectedAssets.length}</span>
                    </div>

                    {selectedAssets.length === 0 ? (
                      <div className="tw-empty">اختاري أجهزة أو بوابات</div>
                    ) : (
                      selectedAssets.map((a) => (
                        <div className="tw-basket-card" key={a.uid}>
                          <div>
                            <b>{assetTitle(a)}</b>
                            <div className="tw-mini">
                              {a.assetType} • {a.loc.building || "—"} • {a.loc.zone || "—"}
                            </div>
                          </div>
                          <button className="tw-x" onClick={() => removeAsset(a.uid)}>
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <>
                  <div className="tw-review">
                    <div className="tw-review-card">
                      <span>Technician</span>
                      <strong>
                        {userName(
                          technicians.find((t) => String(t.id) === String(form.technicianId))
                        ) || "—"}
                      </strong>
                    </div>
                    <div className="tw-review-card">
                      <span>Total Selected</span>
                      <strong>{selectedAssets.length}</strong>
                    </div>
                    <div className="tw-review-card">
                      <span>Devices</span>
                      <strong>{reviewDevices}</strong>
                    </div>
                    <div className="tw-review-card">
                      <span>Gates</span>
                      <strong>{reviewGates}</strong>
                    </div>
                  </div>

                  <div className="tw-panel">
                    <h2>{form.title}</h2>
                    <p>{form.notes || "No notes"}</p>

                    <div className="tw-task-meta">
                      <span className="tw-tag pending">Will start RED pending</span>
                      <span className="tw-tag progress">Start makes it BLUE</span>
                      <span className="tw-tag done">Done makes it GREEN</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="tw-modal-foot">
              <div className="tw-actions">
                <button className="tw-btn white" onClick={closeAddTask}>
                  Cancel
                </button>
                {step > 1 && (
                  <button className="tw-btn white" onClick={() => setStep(step - 1)}>
                    Back
                  </button>
                )}
              </div>

              <div className="tw-actions">
                {step < 3 ? (
                  <button
                    className="tw-btn blue"
                    onClick={() => {
                      if (step === 1 && !form.technicianId) return alert("اختاري الفني");
                      if (step === 1 && !form.scheduledDate) return alert("اختاري الميعاد");
                      if (step === 2 && !selectedAssets.length) return alert("اختاري أجهزة أو بوابات");
                      setStep(step + 1);
                    }}
                  >
                    Next
                  </button>
                ) : (
                  <button className="tw-btn green" onClick={createTask}>
                    Dispatch Task To Field
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}