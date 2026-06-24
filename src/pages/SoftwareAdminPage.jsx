import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

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
      Accept: "application/json",
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

function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.devices)) return data.devices;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.activity)) return data.activity;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.logs)) return data.logs;
  if (Array.isArray(data?.solutions)) return data.solutions;
  if (Array.isArray(data?.issues)) return data.issues;
  return [];
}

async function tryPaths(paths, options = {}) {
  let lastError;

  for (const path of paths.filter(Boolean)) {
    try {
      return await api(path, options);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Request failed");
}

async function fetchMerged(paths) {
  const cleanPaths = paths.filter(Boolean);
  const results = await Promise.allSettled(cleanPaths.map((p) => api(p)));
  const merged = [];
  const seen = new Set();

  results.forEach((result) => {
    if (result.status !== "fulfilled") return;

    toArray(result.value).forEach((x) => {
      if (!x?.id) return;
      const key = String(x.id);
      if (seen.has(key)) return;
      seen.add(key);
      merged.push(x);
    });
  });

  return merged;
}

function clean(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text && text !== "null" && text !== "undefined" ? text : fallback;
}

function safeJsonParse(value) {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function userName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    `User #${user?.id || ""}`
  );
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

function isResponsibleUser(user) {
  const text = [
    user?.fullName,
    user?.name,
    user?.username,
    user?.email,
    user?.jobTitle,
    getRole(user),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("mohamed farag") ||
    text.includes("farag") ||
    text.includes("فرج") ||
    text.includes("software") ||
    text.includes("morpho") ||
    text.includes("technician") ||
    text.includes("فني") ||
    text.includes("viewer")
  );
}

function statusAr(status) {
  const v = String(status || "").toUpperCase();

  if (v === "OK") return "سليم";
  if (v === "NEEDS_MAINTENANCE") return "يحتاج إلى صيانة";
  if (v === "UNDER_MAINTENANCE") return "تحت الصيانة";
  if (v === "OUT_OF_SERVICE") return "خارج الخدمة";
  if (v === "PENDING") return "قيد الانتظار";
  if (v === "IN_PROGRESS") return "قيد التنفيذ";
  if (v === "DONE" || v === "COMPLETED") return "تم";
  if (v === "ISSUE_FOUND") return "تم تسجيل مشكلة";
  if (v === "NOT_REACHABLE") return "تعذر الوصول";
  if (v === "NOT_OK") return "غير سليم";
  if (v === "REPORTED_FIXED") return "تم الإبلاغ عن الإصلاح";
  if (v === "REOPENED") return "أعيد فتح المشكلة";
  if (v === "FIXED") return "تم الإصلاح";
  if (v === "BROKEN") return "به عطل";
  if (v === "STILL_BROKEN") return "ما زال به عطل";

  return clean(status);
}

function statusClass(status) {
  const v = String(status || "").toUpperCase();

  if (
    v === "OK" ||
    v === "DONE" ||
    v === "COMPLETED" ||
    v === "REPORTED_FIXED" ||
    v === "FIXED"
  ) {
    return "ok";
  }

  if (v === "IN_PROGRESS" || v === "UNDER_MAINTENANCE") return "progress";

  if (
    v === "NEEDS_MAINTENANCE" ||
    v === "ISSUE_FOUND" ||
    v === "REOPENED" ||
    v === "BROKEN" ||
    v === "STILL_BROKEN"
  ) {
    return "warn";
  }

  if (v === "OUT_OF_SERVICE" || v === "NOT_REACHABLE" || v === "NOT_OK") {
    return "bad";
  }

  return "idle";
}

function isDoneStatus(status) {
  const v = String(status || "").toUpperCase();
  return v === "DONE" || v === "COMPLETED" || v === "OK";
}

function isFinishedStatus(status) {
  const v = String(status || "").toUpperCase();

  return (
    v === "DONE" ||
    v === "COMPLETED" ||
    v === "ISSUE_FOUND" ||
    v === "NOT_REACHABLE" ||
    v === "SKIPPED" ||
    v === "OK" ||
    v === "NOT_OK"
  );
}

function deviceTitle(device) {
  return (
    device?.deviceName ||
    device?.name ||
    device?.deviceCode ||
    device?.barcode ||
    `Device ${device?.id || ""}`
  );
}

function gateTitle(gate) {
  return `Gate ${gate?.gateNo || gate?.gateNumber || gate?.id || ""}`;
}

function deviceLocation(device) {
  const l = device?.location || {};

  return [
    device?.gateCluster || device?.cluster || l?.cluster,
    device?.gateBuilding || device?.building || l?.building,
    device?.gateZone || device?.zone || l?.zone,
    device?.gateDirection || device?.direction || l?.direction,
    device?.lane || l?.lane,
  ]
    .filter(Boolean)
    .join(" - ");
}

function gateLocation(gate) {
  const l = gate?.location || {};

  return [
    gate?.cluster || l?.cluster,
    gate?.building || l?.building,
    gate?.zone || l?.zone,
    gate?.direction || l?.direction,
    gate?.lane || l?.lane,
  ]
    .filter(Boolean)
    .join(" - ");
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function normalizeStepObject(raw, index = 0) {
  if (!raw) return null;

  const parsed = typeof raw === "string" ? safeJsonParse(raw) : null;
  const base = parsed || raw;

  if (typeof base !== "object") {
    return {
      id: String(base),
      title: `Completed Step ID: ${base}`,
      description: "This step was completed by the technician.",
      order: index + 1,
      raw,
    };
  }

  const source =
    base.solution ||
    base.issueSolution ||
    base.solutionAction ||
    base.action ||
    base.step ||
    base;

  const id =
    base.solutionId ||
    base.issueSolutionId ||
    base.solutionActionId ||
    base.completedSolutionId ||
    base.completedStepId ||
    source.id ||
    base.id ||
    `step-${index + 1}`;

  const title =
    source.title ||
    source.name ||
    source.solutionTitle ||
    source.actionTitle ||
    base.title ||
    base.name ||
    base.solutionTitle ||
    base.actionTitle ||
    `Step ${index + 1}`;

  const description =
    source.description ||
    source.notes ||
    source.action ||
    source.actionTaken ||
    base.description ||
    base.notes ||
    base.action ||
    base.actionTaken ||
    "Step completed";

  const order =
    source.stepOrder ||
    source.order ||
    base.stepOrder ||
    base.order ||
    index + 1;

  return {
    id: String(id),
    title,
    description,
    order: Number(order) || index + 1,
    raw,
  };
}

function collectIdsFromNode(node, ids = new Set(), depth = 0) {
  if (node === null || node === undefined || depth > 8) return ids;

  if (typeof node === "number") {
    ids.add(String(node));
    return ids;
  }

  if (typeof node === "string") {
    const trimmed = node.trim();

    if (/^\d+$/.test(trimmed)) {
      ids.add(trimmed);
      return ids;
    }

    const parsed = safeJsonParse(trimmed);

    if (parsed) collectIdsFromNode(parsed, ids, depth + 1);

    return ids;
  }

  if (Array.isArray(node)) {
    node.forEach((x) => collectIdsFromNode(x, ids, depth + 1));
    return ids;
  }

  if (typeof node !== "object") return ids;

  [
    node.solutionId,
    node.issueSolutionId,
    node.solutionActionId,
    node.completedSolutionId,
    node.completedStepId,
    node.solution?.id,
    node.issueSolution?.id,
    node.solutionAction?.id,
  ]
    .filter((x) => x !== null && x !== undefined && x !== "")
    .forEach((x) => ids.add(String(x)));

  [
    "completedSolutionIds",
    "completedSolutionsIds",
    "solutionIds",
    "doneSolutionIds",
    "completedStepIds",
    "completedSteps",
    "doneSteps",
    "solutionsDone",
    "completedSolutions",
    "completedStepObjects",
    "solutions",
    "solutionActions",
    "inspectionIssueSolutionActions",
    "actions",
    "inspectionIssues",
    "inspectionIssue",
    "inspection",
    "completionMetadata",
    "metadata",
    "meta",
    "extra",
  ].forEach((key) => {
    if (node[key] !== undefined && node[key] !== null) {
      collectIdsFromNode(node[key], ids, depth + 1);
    }
  });

  return ids;
}

function collectStepObjects(node, output = [], depth = 0) {
  if (!node || depth > 8) return output;

  if (typeof node === "string") {
    const parsed = safeJsonParse(node);
    if (parsed) collectStepObjects(parsed, output, depth + 1);
    return output;
  }

  if (Array.isArray(node)) {
    node.forEach((x) => collectStepObjects(x, output, depth + 1));
    return output;
  }

  if (typeof node !== "object") return output;

  const looksLikeStep =
    node.solution ||
    node.issueSolution ||
    node.solutionAction ||
    node.solutionId ||
    node.issueSolutionId ||
    node.solutionActionId ||
    node.completedSolutionId ||
    node.completedStepId ||
    node.stepOrder ||
    node.solutionTitle ||
    node.actionTaken ||
    node.title ||
    node.description;

  if (looksLikeStep) {
    const step = normalizeStepObject(node, output.length);
    if (step) output.push(step);
  }

  [
    "completedSolutions",
    "completedStepObjects",
    "solutions",
    "solutionActions",
    "inspectionIssueSolutionActions",
    "actions",
    "inspectionIssues",
    "inspectionIssue",
    "inspection",
    "completionMetadata",
    "metadata",
    "meta",
    "extra",
  ].forEach((key) => {
    if (node[key] !== undefined && node[key] !== null) {
      collectStepObjects(node[key], output, depth + 1);
    }
  });

  return output;
}

function uniqueIds(ids) {
  return [...new Set(ids.filter(Boolean).map(String))];
}

function uniqueSteps(steps) {
  const map = new Map();

  steps
    .filter(Boolean)
    .map((s, index) => normalizeStepObject(s, index))
    .filter(Boolean)
    .forEach((s) => {
      const key = String(s.id || s.title);
      if (!map.has(key)) map.set(key, s);
    });

  return [...map.values()].sort((a, b) => Number(a.order) - Number(b.order));
}

function extractStepIds(item) {
  return uniqueIds([...collectIdsFromNode(item)]);
}

function extractStepObjects(item) {
  return uniqueSteps(collectStepObjects(item));
}

function extractCompletionMetadata(item) {
  return (
    safeJsonParse(item?.completionMetadata) ||
    safeJsonParse(item?.metadata) ||
    safeJsonParse(item?.meta) ||
    {}
  );
}

function extractIssueInfo(item) {
  const meta = extractCompletionMetadata(item);

  const issue =
    item?.issue ||
    item?.issueInfo ||
    item?.inspectionIssue?.issue ||
    item?.inspectionIssues?.[0]?.issue ||
    item?.selectedIssue ||
    item?.inspection?.inspectionIssues?.[0]?.issue ||
    meta?.issue ||
    meta?.issueInfo ||
    null;

  return {
    id:
      item?.issueId ||
      item?.issueInfo?.id ||
      item?.inspectionIssue?.issueId ||
      item?.inspection?.inspectionIssues?.[0]?.issueId ||
      meta?.issueId ||
      issue?.id ||
      null,
    title:
      issue?.title ||
      issue?.name ||
      item?.issueTitle ||
      item?.issueReason ||
      item?.problemTitle ||
      meta?.issueTitle ||
      "",
    code: issue?.issueCode || item?.issueCode || meta?.issueCode || "",
    category: issue?.category?.name || issue?.categoryName || meta?.categoryName || "",
    description:
      issue?.description ||
      item?.issueDescription ||
      meta?.issueDescription ||
      "",
  };
}

function extractSolvedText(item) {
  const meta = extractCompletionMetadata(item);

  if (item?.isResolved === true || meta?.isResolved === true) {
    return "نعم، تم الحل";
  }

  if (item?.isResolved === false || meta?.isResolved === false) {
    return "لا، لم يتم الحل";
  }

  const text = [
    item?.completionNote,
    item?.notes,
    item?.inspection?.notes,
    item?.resultNote,
    meta?.completionNote,
    meta?.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (text.includes("issue solved") || text.includes("resolved")) {
    return "نعم، تم الحل";
  }

  if (
    text.includes("still exists") ||
    text.includes("not resolved") ||
    text.includes("still broken")
  ) {
    return "لا، لم يتم الحل";
  }

  if (isDoneStatus(item?.status)) return "نعم، تم";
  if (String(item?.status || "").toUpperCase() === "ISSUE_FOUND") {
    return "تم تسجيل مشكلة";
  }

  return "—";
}

function normalizeTask(task) {
  const rawItems = toArray(task?.items);

  let items = rawItems.map((item) => {
    const device = item?.device || {};
    const gate = item?.gate || {};
    const isGate = Boolean(item?.gateId || gate?.id);
    const meta = extractCompletionMetadata(item);

    const ids = uniqueIds([
      ...extractStepIds(item),
      ...extractStepIds(meta),
      ...toArray(item?.completedSolutionIds),
      ...toArray(item?.completedStepIds),
      ...toArray(meta?.completedSolutionIds),
      ...toArray(meta?.completedStepIds),
    ]);

    const steps = uniqueSteps([
      ...extractStepObjects(item),
      ...extractStepObjects(meta),
      ...toArray(item?.completedSolutions),
      ...toArray(item?.completedStepObjects),
      ...toArray(meta?.completedSolutions),
      ...toArray(meta?.completedStepObjects),
    ]);

    return {
      ...item,
      id: item.id,
      backendItemId: item.id,
      taskId: task.id,
      deviceId: item.deviceId || device.id || null,
      gateId: item.gateId || gate.id || null,
      assetType: isGate ? "GATE" : "DEVICE",
      status: item.status || "PENDING",
      completionNote:
        item.completionNote ||
        meta?.completionNote ||
        item.notes ||
        meta?.notes ||
        "",
      notes: item.notes || meta?.notes || "",
      inspectedAt:
        item.inspectedAt ||
        item.completedAt ||
        item.doneAt ||
        item.updatedAt ||
        task.completedAt ||
        null,
      completedBy: item.completedBy || item.technician || task.assignedTo || null,
      device,
      gate,
      label: isGate ? gateTitle(gate) : deviceTitle(device),
      location: isGate ? gateLocation(gate) : deviceLocation(device),
      completedStepIds: ids,
      completedStepObjects: steps,
      issueInfo: extractIssueInfo({ ...item, completionMetadata: meta }),
      solvedText: extractSolvedText({ ...item, completionMetadata: meta }),
      completionMetadata: meta,
      rawItem: item,
    };
  });

  if (!items.length && task?.device) {
    const meta = extractCompletionMetadata(task);

    items = [
      {
        id: `device-${task.device.id}`,
        backendItemId: null,
        taskId: task.id,
        deviceId: task.device.id,
        gateId: null,
        assetType: "DEVICE",
        status: task.status || "PENDING",
        completionNote: task.completionNote || meta?.completionNote || "",
        notes: task.notes || meta?.notes || "",
        inspectedAt: task.completedAt || task.updatedAt || null,
        completedBy: task.assignedTo || null,
        device: task.device,
        gate: null,
        label: deviceTitle(task.device),
        location: deviceLocation(task.device),
        completedStepIds: uniqueIds([
          ...extractStepIds(task),
          ...extractStepIds(meta),
        ]),
        completedStepObjects: uniqueSteps([
          ...extractStepObjects(task),
          ...extractStepObjects(meta),
        ]),
        issueInfo: extractIssueInfo({ ...task, completionMetadata: meta }),
        solvedText: extractSolvedText({ ...task, completionMetadata: meta }),
        completionMetadata: meta,
        rawItem: task,
      },
    ];
  }

  return {
    ...task,
    items,
    assignedName: userName(task?.assignedTo || task?.technician),
    title: task?.title || "Software Global Task",
    status: task?.status || "PENDING",
    progressPercent: task?.progressPercent || 0,
  };
}

const styles = `
.software-admin{
  min-height:100vh;
  padding:22px;
  background:
    radial-gradient(circle at top left, rgba(28,169,225,.20), transparent 30%),
    radial-gradient(circle at top right, rgba(38,55,70,.14), transparent 30%),
    linear-gradient(135deg,#f8fbff,#eefaff);
  color:#263746;
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
}

.sa-hero{
  border-radius:30px;
  padding:26px;
  background:linear-gradient(135deg,#263746,#1CA9E1);
  color:#fff;
  box-shadow:0 26px 60px rgba(28,169,225,.25);
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  overflow:hidden;
  position:relative;
}

.sa-hero:after{
  content:"";
  position:absolute;
  width:230px;
  height:230px;
  border-radius:50%;
  right:-80px;
  top:-90px;
  background:rgba(255,255,255,.13);
}

.sa-brand{
  display:flex;
  align-items:center;
  gap:14px;
  position:relative;
  z-index:1;
}

.sa-logo{
  width:62px;
  height:62px;
  border-radius:20px;
  background:#fff;
  color:#1CA9E1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:1000;
  font-size:13px;
  letter-spacing:-.4px;
  box-shadow:0 18px 38px rgba(0,0,0,.16);
}

.sa-hero h1{
  margin:0;
  font-size:34px;
  letter-spacing:-.9px;
}

.sa-hero p{
  margin:8px 0 0;
  color:#eaf8ff;
  font-weight:800;
  line-height:1.6;
}

.sa-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  position:relative;
  z-index:1;
}

.sa-btn{
  border:0;
  border-radius:15px;
  padding:11px 15px;
  font-weight:1000;
  cursor:pointer;
  color:#fff;
  background:#1CA9E1;
  box-shadow:0 12px 26px rgba(28,169,225,.22);
  transition:.18s ease;
}

.sa-btn:hover{
  transform:translateY(-1px);
  filter:brightness(1.03);
}

.sa-btn.white{
  background:#fff;
  color:#263746;
  box-shadow:none;
  border:1px solid #dbeafe;
}

.sa-btn.green{
  background:#22C55E;
}

.sa-btn.orange{
  background:#F97316;
}

.sa-btn.red{
  background:#EF4444;
}

.sa-btn:disabled{
  opacity:.45;
  cursor:not-allowed;
  transform:none;
}

.sa-small{
  padding:8px 10px;
  border-radius:12px;
  font-size:12px;
}

.sa-panel{
  background:#fff;
  border:1px solid #dbeafe;
  border-radius:26px;
  padding:18px;
  box-shadow:0 18px 44px rgba(15,23,42,.07);
  margin-top:16px;
}

.sa-panel-head{
  display:flex;
  justify-content:space-between;
  gap:14px;
  align-items:flex-start;
  margin-bottom:14px;
}

.sa-panel h2{
  margin:0;
  font-size:23px;
}

.sa-panel p{
  margin:6px 0 0;
  color:#64748b;
  font-weight:800;
  line-height:1.55;
}

.sa-tabs{
  margin:18px 0 0;
  display:grid;
  grid-template-columns:repeat(5,minmax(0,1fr));
  gap:10px;
}

.sa-tab{
  border:1px solid #cdeafe;
  background:#fff;
  border-radius:18px;
  padding:13px 14px;
  font-weight:1000;
  color:#263746;
  cursor:pointer;
  box-shadow:0 10px 24px rgba(15,23,42,.04);
}

.sa-tab.active{
  background:#263746;
  color:#fff;
  border-color:#263746;
}

.sa-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
  margin-top:16px;
}

.sa-stat{
  background:#fff;
  border:1px solid #dbeafe;
  border-radius:22px;
  padding:16px;
  box-shadow:0 14px 35px rgba(15,23,42,.06);
  position:relative;
  overflow:hidden;
}

.sa-stat:before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:4px;
  background:linear-gradient(90deg,#1CA9E1,#263746);
}

.sa-stat span{
  display:block;
  color:#64748b;
  font-size:11px;
  font-weight:1000;
  text-transform:uppercase;
}

.sa-stat strong{
  display:block;
  font-size:30px;
  margin-top:8px;
}

.sa-input,.sa-select,.sa-textarea{
  width:100%;
  border:1px solid #cbd5e1;
  border-radius:15px;
  padding:12px;
  outline:none;
  font-weight:900;
  background:#fff;
  font-family:inherit;
}

.sa-input:focus,.sa-select:focus,.sa-textarea:focus{
  border-color:#1CA9E1;
  box-shadow:0 0 0 4px rgba(28,169,225,.12);
}

.sa-textarea{
  min-height:94px;
  resize:vertical;
}

.sa-list{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}

.sa-card{
  border:1px solid #dbeafe;
  background:linear-gradient(180deg,#fff,#f8fcff);
  border-radius:24px;
  padding:15px;
  box-shadow:0 12px 28px rgba(15,23,42,.05);
}

.sa-card-top{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.sa-card h3{
  margin:0;
  font-size:18px;
}

.sa-meta{
  color:#64748b;
  font-size:12px;
  font-weight:800;
  margin-top:5px;
  line-height:1.55;
}

.sa-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:10px;
}

.sa-tag{
  font-size:11px;
  font-weight:1000;
  padding:5px 8px;
  border-radius:999px;
  background:#eef7ff;
  color:#0369a1;
}

.sa-tag.ok{
  background:#dcfce7;
  color:#15803d;
}

.sa-tag.progress{
  background:#dbeafe;
  color:#1d4ed8;
}

.sa-tag.warn{
  background:#fff7ed;
  color:#c2410c;
}

.sa-tag.bad{
  background:#fee2e2;
  color:#b91c1c;
}

.sa-tag.idle{
  background:#f1f5f9;
  color:#475569;
}

.sa-items{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:13px;
}

.sa-item{
  border-radius:18px;
  border:1px solid #fecdd3;
  background:#fff1f2;
  padding:12px;
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start;
}

.sa-item.ok{
  border-color:#86efac;
  background:#f0fdf4;
}

.sa-item.progress{
  border-color:#93c5fd;
  background:#eff6ff;
}

.sa-item.warn{
  border-color:#fdba74;
  background:#fff7ed;
}

.sa-item.bad{
  border-color:#fecaca;
  background:#fef2f2;
}

.sa-item b{
  display:block;
  font-size:14px;
}

.sa-item-actions{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.sa-empty{
  border:1px dashed #cbd5e1;
  border-radius:20px;
  padding:28px;
  text-align:center;
  color:#64748b;
  font-weight:900;
  background:#f8fafc;
}

.sa-alert{
  padding:13px 15px;
  border-radius:18px;
  background:#fff1f2;
  border:1px solid #fecaca;
  color:#b91c1c;
  font-weight:900;
  margin:14px 0;
}

.sa-ok-alert{
  padding:13px 15px;
  border-radius:18px;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  color:#15803d;
  font-weight:900;
  margin:14px 0;
}

.sa-morpho-layout{
  display:grid;
  grid-template-columns:310px 1fr;
  gap:14px;
}

.sa-filter-box{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:22px;
  padding:14px;
  height:max-content;
}

.sa-stack{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.sa-done-list{
  display:grid;
  grid-template-columns:1fr;
  gap:14px;
}

.sa-done-card{
  border:1px solid #bbf7d0;
  background:linear-gradient(180deg,#ffffff,#f0fdf4);
  border-radius:24px;
  padding:16px;
  box-shadow:0 12px 30px rgba(22,163,74,.08);
}

.sa-done-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}

.sa-info-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  margin-top:12px;
}

.sa-info-box{
  background:#fff;
  border:1px solid #dcfce7;
  border-radius:16px;
  padding:11px;
}

.sa-info-box span{
  display:block;
  font-size:10px;
  font-weight:1000;
  color:#64748b;
  text-transform:uppercase;
}

.sa-info-box strong{
  display:block;
  margin-top:5px;
  font-size:13px;
  color:#263746;
  word-break:break-word;
}

.sa-step-list{
  margin-top:12px;
  display:grid;
  gap:8px;
}

.sa-step-chip{
  background:#fff;
  border:1px solid #dbeafe;
  border-radius:16px;
  padding:10px 12px;
  display:flex;
  gap:10px;
  align-items:flex-start;
}

.sa-step-bullet{
  width:24px;
  height:24px;
  border-radius:50%;
  background:#22C55E;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:12px;
  font-weight:1000;
  flex:0 0 auto;
}

.sa-history{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.sa-history-item{
  border:1px solid #dbeafe;
  background:#fff;
  border-radius:20px;
  padding:14px;
  display:flex;
  gap:12px;
  align-items:flex-start;
}

.sa-dot{
  width:12px;
  height:12px;
  border-radius:50%;
  margin-top:5px;
  background:#1CA9E1;
  box-shadow:0 0 0 5px rgba(28,169,225,.12);
}

.sa-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.58);
  backdrop-filter:blur(8px);
  z-index:1000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
}

.sa-modal{
  width:min(860px,96vw);
  max-height:92vh;
  overflow:auto;
  background:#fff;
  border-radius:28px;
  border:1px solid #dbeafe;
  box-shadow:0 35px 100px rgba(0,0,0,.32);
}

.sa-modal-head{
  padding:18px;
  background:linear-gradient(135deg,#263746,#1CA9E1);
  color:#fff;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.sa-modal-head h2{
  margin:0;
  font-size:22px;
}

.sa-modal-head p{
  margin:6px 0 0;
  color:#eaf8ff;
  font-weight:800;
}

.sa-close{
  border:1px solid rgba(255,255,255,.3);
  background:rgba(255,255,255,.16);
  color:#fff;
  width:40px;
  height:40px;
  border-radius:14px;
  font-size:22px;
  cursor:pointer;
}

.sa-modal-body{
  padding:18px;
}

.sa-modal-foot{
  padding:15px 18px;
  border-top:1px solid #e2e8f0;
  display:flex;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
}

@media(max-width:1050px){
  .sa-grid{grid-template-columns:repeat(2,1fr)}
  .sa-list{grid-template-columns:1fr}
  .sa-morpho-layout{grid-template-columns:1fr}
  .sa-info-grid{grid-template-columns:repeat(2,1fr)}
}

@media(max-width:650px){
  .software-admin{padding:12px}
  .sa-hero{
    flex-direction:column;
    border-radius:24px;
    padding:18px;
  }
  .sa-hero h1{font-size:24px}
  .sa-logo{width:52px;height:52px}
  .sa-tabs{grid-template-columns:1fr}
  .sa-grid{grid-template-columns:1fr}
  .sa-panel{border-radius:22px;padding:14px}
  .sa-panel-head{flex-direction:column}
  .sa-card-top{flex-direction:column}
  .sa-item{flex-direction:column}
  .sa-item-actions{justify-content:flex-start}
  .sa-info-grid{grid-template-columns:1fr}
  .sa-done-head{flex-direction:column}
}
`;

function DoneReportCard({ row, onOpenDetails }) {
  const item = row.item;
  const issue = item.issueInfo || {};
  const steps = item.completedStepObjects || [];
  const stepIds = item.completedStepIds || [];

  return (
    <article className="sa-done-card">
      <div className="sa-done-head">
        <div>
          <h3 style={{ margin: 0 }}>{item.label}</h3>

          <div className="sa-meta">
            {row.task.title} • {row.task.assignedName}
            <br />
            {item.location || "No location"}
          </div>

          <div className="sa-tags">
            <span className={`sa-tag ${statusClass(item.status)}`}>
              {statusAr(item.status)}
            </span>

            <span className="sa-tag ok">
              Finished: {formatDate(row.finishedAt)}
            </span>

            <span className="sa-tag">Result: {item.solvedText || "—"}</span>

            <span className="sa-tag">
              Steps: {steps.length || stepIds.length || 0}
            </span>
          </div>
        </div>

        <button className="sa-btn white sa-small" onClick={() => onOpenDetails(row)}>
          Full Details
        </button>
      </div>

      <div className="sa-info-grid">
        <div className="sa-info-box">
          <span>Device Code</span>
          <strong>{item.device?.deviceCode || "—"}</strong>
        </div>

        <div className="sa-info-box">
          <span>IP Address</span>
          <strong>{item.device?.ipAddress || "—"}</strong>
        </div>

        <div className="sa-info-box">
          <span>Problem</span>
          <strong>{issue.title || item.notes || "—"}</strong>
        </div>

        <div className="sa-info-box">
          <span>Notes</span>
          <strong>{item.completionNote || item.notes || "—"}</strong>
        </div>
      </div>

      <div className="sa-step-list">
        {steps.length > 0 ? (
          steps.slice(0, 4).map((s, index) => (
            <div className="sa-step-chip" key={s.id || index}>
              <div className="sa-step-bullet">✓</div>
              <div>
                <b>{s.title || `Step ${index + 1}`}</b>
                <div className="sa-meta">{s.description || "Step completed"}</div>
              </div>
            </div>
          ))
        ) : stepIds.length > 0 ? (
          stepIds.slice(0, 6).map((id, index) => (
            <div className="sa-step-chip" key={`${id}-${index}`}>
              <div className="sa-step-bullet">✓</div>
              <div>
                <b>Completed Step ID: {id}</b>
                <div className="sa-meta">
                  This step was completed by the technician.
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="sa-step-chip">
            <div className="sa-step-bullet">i</div>
            <div>
              <b>No executed steps returned</b>
              <div className="sa-meta">
                If this was saved using direct Done, there are no issue steps.
                If the technician selected issue steps, press Full Details then Reload Steps.
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function SoftwareAdminPage() {
  const [tab, setTab] = useState("OVERVIEW");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [users, setUsers] = useState([]);
  const [assignedToId, setAssignedToId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activity, setActivity] = useState([]);

  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("ALL");

  const [doneDetails, setDoneDetails] = useState(null);
  const [doneDetailsSteps, setDoneDetailsSteps] = useState([]);
  const [doneDetailsStepsLoading, setDoneDetailsStepsLoading] = useState(false);

  const [morphoModal, setMorphoModal] = useState(null);
  const [morphoResult, setMorphoResult] = useState("FIXED");
  const [morphoNotes, setMorphoNotes] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = styles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const responsibleUsers = useMemo(() => {
    const filtered = users.filter(isResponsibleUser);
    return filtered.length ? filtered : users;
  }, [users]);

  const selectedUser = useMemo(() => {
    return responsibleUsers.find((u) => String(u.id) === String(assignedToId));
  }, [responsibleUsers, assignedToId]);

  const loadUsers = useCallback(async () => {
    const data = await tryPaths(["/users", "/accounts", "/auth/users"]).catch(
      () => []
    );

    const list = toArray(data);
    setUsers(list);

    if (!assignedToId && list.length) {
      const defaultUser =
        list.find((u) =>
          [u.fullName, u.name, u.username, u.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes("mohamed farag")
        ) ||
        list.find((u) =>
          [u.fullName, u.name, u.username, u.email]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes("فرج")
        ) ||
        list.find(isResponsibleUser) ||
        list[0];

      setAssignedToId(String(defaultUser.id));
      return String(defaultUser.id);
    }

    return assignedToId || "";
  }, [assignedToId]);

  const loadTasks = useCallback(
    async (id = assignedToId) => {
      if (!id) {
        setTasks([]);
        return;
      }

      const merged = await fetchMerged([
        `/inspection-tasks/technician/${id}`,
        `/inspection-tasks?assignedToId=${id}`,
        `/inspection-tasks/technician/${id}?taskType=SOFTWARE`,
        `/inspection-tasks/technician/${id}?assetType=SOFTWARE`,
        `/inspection-tasks?assignedToId=${id}&taskType=SOFTWARE`,
        `/inspection-tasks?assignedToId=${id}&assetType=SOFTWARE`,
      ]);

      const normalized = merged
        .map(normalizeTask)
        .filter((task) => {
          const taskAssigned =
            task?.assignedToId ||
            task?.assignedTo?.id ||
            task?.technicianId ||
            task?.technician?.id;

          const hasAssignedItem = (task?.items || []).some(
            (item) =>
              String(item?.assignedToId || item?.assignedTo?.id || "") ===
              String(id)
          );

          return String(taskAssigned || "") === String(id) || hasAssignedItem;
        });

      setTasks(normalized);
    },
    [assignedToId]
  );

  const loadDevices = useCallback(async () => {
    const data = await tryPaths(["/devices/morpho-candidates", "/devices"]).catch(
      () => []
    );

    setDevices(toArray(data));
  }, []);

  const loadActivity = useCallback(
    async (id = assignedToId) => {
      if (!id) {
        setActivity([]);
        return;
      }

      const data = await tryPaths([
        `/inspection-tasks/activity?technicianId=${id}`,
        `/technician-activity?technicianId=${id}`,
        `/activity?technicianId=${id}`,
      ]).catch(() => []);

      setActivity(toArray(data));
    },
    [assignedToId]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const id = await loadUsers();
      await Promise.all([loadTasks(id), loadDevices(), loadActivity(id)]);
    } catch (e) {
      setError(e.message || "Failed to load software center");
    } finally {
      setLoading(false);
    }
  }, [loadUsers, loadTasks, loadDevices, loadActivity]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (!assignedToId) return;
    loadTasks(assignedToId);
    loadActivity(assignedToId);
  }, [assignedToId]);

  const allItems = useMemo(() => tasks.flatMap((t) => t.items || []), [tasks]);

  const doneRows = useMemo(() => {
    const rows = [];

    tasks.forEach((task) => {
      (task.items || []).forEach((item) => {
        if (isFinishedStatus(item.status)) {
          rows.push({
            task,
            item,
            finishedAt:
              item.inspectedAt ||
              item.completedAt ||
              item.doneAt ||
              task.completedAt ||
              task.updatedAt ||
              item.updatedAt,
          });
        }
      });
    });

    return rows.sort((a, b) => {
      const da = new Date(a.finishedAt || 0).getTime();
      const db = new Date(b.finishedAt || 0).getTime();
      return db - da;
    });
  }, [tasks]);

  const summary = useMemo(() => {
    const done = allItems.filter((i) => isDoneStatus(i.status)).length;
    const progress = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "IN_PROGRESS"
    ).length;
    const issuesCount = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "ISSUE_FOUND"
    ).length;
    const notReachable = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "NOT_REACHABLE"
    ).length;
    const pending = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "PENDING"
    ).length;

    return {
      tasks: tasks.length,
      items: allItems.length,
      done,
      progress,
      issues: issuesCount,
      notReachable,
      pending,
      devices: devices.length,
      finished: doneRows.length,
    };
  }, [tasks, allItems, devices, doneRows]);

  const filteredDevices = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();

    return devices.filter((d) => {
      const status = String(d.currentStatus || "").toUpperCase();

      const text = [
        d.deviceName,
        d.name,
        d.deviceCode,
        d.barcode,
        d.serialNumber,
        d.ipAddress,
        d.modelNumber,
        d.currentStatus,
        deviceLocation(d),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !text.includes(q)) return false;
      if (deviceStatus !== "ALL" && status !== deviceStatus) return false;

      return true;
    });
  }, [devices, deviceSearch, deviceStatus]);

  async function fetchSolutionsForIssue(issueId) {
    if (!issueId) return [];

    const data = await tryPaths([
      `/issues/${issueId}/solutions`,
      `/issues/solutions/${issueId}`,
      `/issue-solutions?issueId=${issueId}`,
    ]).catch(() => []);

    return toArray(data)
      .map((x, index) => normalizeStepObject(x, index))
      .filter(Boolean)
      .sort((a, b) => Number(a.order) - Number(b.order));
  }

  async function loadDoneDetailsSteps(row) {
    setDoneDetailsSteps([]);
    setDoneDetailsStepsLoading(true);

    try {
      const item = row.item;
      const existing = uniqueSteps(item.completedStepObjects || []);
      const stepIds = uniqueIds(item.completedStepIds || []);
      const issueId =
        item.issueInfo?.id ||
        item.issueId ||
        item.completionMetadata?.issueId ||
        row.task.issueId ||
        null;

      if (existing.length > 0) {
        setDoneDetailsSteps(existing);
        return;
      }

      const fetchedSolutions = await fetchSolutionsForIssue(issueId);

      if (fetchedSolutions.length > 0 && stepIds.length > 0) {
        const ids = new Set(stepIds.map(String));
        const matched = fetchedSolutions.filter((s) => ids.has(String(s.id)));

        if (matched.length > 0) {
          setDoneDetailsSteps(matched);
          return;
        }
      }

      if (stepIds.length > 0) {
        setDoneDetailsSteps(
          stepIds.map((id, index) => ({
            id: String(id),
            title: `Completed Step ID: ${id}`,
            description: "This step was completed by the technician.",
            order: index + 1,
          }))
        );
        return;
      }

      if (fetchedSolutions.length > 0) {
        setDoneDetailsSteps(
          fetchedSolutions.map((s) => ({
            ...s,
            description:
              s.description ||
              "This is an available issue step. Backend did not return completed step IDs.",
          }))
        );
        return;
      }

      setDoneDetailsSteps([]);
    } catch {
      setDoneDetailsSteps([]);
    } finally {
      setDoneDetailsStepsLoading(false);
    }
  }

  async function openDoneDetails(row) {
    setDoneDetails(row);
    await loadDoneDetailsSteps(row);
  }

  function openMorphoModal(device) {
    setMorphoModal(device);
    setMorphoResult(
      String(device.currentStatus || "").toUpperCase() === "OK"
        ? "STILL_BROKEN"
        : "FIXED"
    );
    setMorphoNotes("");
  }

  async function saveMorphoStatus() {
    if (!morphoModal) return;

    setBusy(`morpho-${morphoModal.id}`);
    setError("");
    setSuccess("");

    try {
      await api(`/devices/${morphoModal.id}/morpho-status`, {
        method: "POST",
        body: JSON.stringify({
          technicianId: Number(assignedToId),
          morphoResult,
          notes: morphoNotes || null,
        }),
      });

      setMorphoModal(null);
      setSuccess("Morpho status updated successfully.");
      await Promise.all([loadDevices(), loadActivity()]);
    } catch (e) {
      setError(e.message || "Failed to update Morpho status");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="software-admin">
      <div className="sa-hero">
        <div className="sa-brand">
          <div className="sa-logo">SMART IT</div>

          <div>
            <h1>Software Admin Center</h1>
            <p>
              Complete monitoring for software tasks, issue steps, notes, and Morpho updates.
            </p>
          </div>
        </div>

        <div className="sa-actions">
          <button className="sa-btn white" onClick={loadAll} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className="sa-alert">{error}</div>}
      {success && <div className="sa-ok-alert">{success}</div>}

      <div className="sa-panel">
        <div className="sa-panel-head">
          <div>
            <h2>Responsible User</h2>
            <p>Select the software responsible user to view all related work details.</p>
          </div>

          <div style={{ minWidth: 260 }}>
            <select
              className="sa-select"
              value={assignedToId}
              onChange={(e) => setAssignedToId(e.target.value)}
            >
              <option value="">Select user...</option>
              {responsibleUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {userName(u)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="sa-grid">
        <div className="sa-stat">
          <span>Global Tasks</span>
          <strong>{summary.tasks}</strong>
        </div>

        <div className="sa-stat">
          <span>Assigned Items</span>
          <strong>{summary.items}</strong>
        </div>

        <div className="sa-stat">
          <span>Done</span>
          <strong>{summary.done}</strong>
        </div>

        <div className="sa-stat">
          <span>Finished Total</span>
          <strong>{summary.finished}</strong>
        </div>
      </div>

      <div className="sa-grid">
        <div className="sa-stat">
          <span>Issues</span>
          <strong>{summary.issues}</strong>
        </div>

        <div className="sa-stat">
          <span>Not Reachable</span>
          <strong>{summary.notReachable}</strong>
        </div>

        <div className="sa-stat">
          <span>Pending</span>
          <strong>{summary.pending}</strong>
        </div>

        <div className="sa-stat">
          <span>Morpho Devices</span>
          <strong>{summary.devices}</strong>
        </div>
      </div>

      <div className="sa-tabs">
        <button
          className={`sa-tab ${tab === "OVERVIEW" ? "active" : ""}`}
          onClick={() => setTab("OVERVIEW")}
        >
          Overview
        </button>

        <button
          className={`sa-tab ${tab === "DONE_REPORT" ? "active" : ""}`}
          onClick={() => setTab("DONE_REPORT")}
        >
          Done Report
        </button>

        <button
          className={`sa-tab ${tab === "TASKS" ? "active" : ""}`}
          onClick={() => setTab("TASKS")}
        >
          Global Tasks
        </button>

        <button
          className={`sa-tab ${tab === "MORPHO" ? "active" : ""}`}
          onClick={() => setTab("MORPHO")}
        >
          Morpho Review
        </button>

        <button
          className={`sa-tab ${tab === "HISTORY" ? "active" : ""}`}
          onClick={() => setTab("HISTORY")}
        >
          History
        </button>
      </div>

      {tab === "OVERVIEW" && (
        <div className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>Live Summary</h2>
              <p>Quick summary for completed work, reported issues, and updates.</p>
            </div>
          </div>

          <div className="sa-list">
            <article className="sa-card">
              <h3>Work Progress</h3>

              <div className="sa-tags">
                <span className="sa-tag ok">Done {summary.done}</span>
                <span className="sa-tag progress">Started {summary.progress}</span>
                <span className="sa-tag warn">Issues {summary.issues}</span>
                <span className="sa-tag bad">Not Reachable {summary.notReachable}</span>
                <span className="sa-tag idle">Pending {summary.pending}</span>
              </div>

              <p className="sa-meta">
                Current responsible user: {selectedUser ? userName(selectedUser) : "—"}
              </p>
            </article>

            <article className="sa-card">
              <h3>Latest Finished Work</h3>

              {doneRows.slice(0, 4).length === 0 ? (
                <div className="sa-empty" style={{ padding: 16 }}>
                  No finished work yet.
                </div>
              ) : (
                <div className="sa-items">
                  {doneRows.slice(0, 4).map((row) => (
                    <div
                      className={`sa-item ${statusClass(row.item.status)}`}
                      key={`${row.task.id}-${row.item.id}`}
                    >
                      <div>
                        <b>{row.item.label}</b>
                        <div className="sa-meta">
                          {statusAr(row.item.status)} • {formatDate(row.finishedAt)}
                        </div>
                      </div>

                      <button
                        className="sa-btn white sa-small"
                        onClick={() => openDoneDetails(row)}
                      >
                        Details
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </div>
        </div>
      )}

      {tab === "DONE_REPORT" && (
        <div className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>Done Report</h2>
              <p>
                Completed work details: device, issue, result, notes, and executed steps.
              </p>
            </div>

            <div className="sa-tags">
              <span className="sa-tag ok">
                Done only {doneRows.filter((r) => isDoneStatus(r.item.status)).length}
              </span>
              <span className="sa-tag">Finished all {doneRows.length}</span>
            </div>
          </div>

          {loading ? (
            <div className="sa-empty">Loading done report...</div>
          ) : doneRows.length === 0 ? (
            <div className="sa-empty">No finished work yet.</div>
          ) : (
            <div className="sa-done-list">
              {doneRows.map((row) => (
                <DoneReportCard
                  key={`${row.task.id}-${row.item.id}`}
                  row={row}
                  onOpenDetails={openDoneDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "TASKS" && (
        <div className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>Global Software Tasks</h2>
              <p>All assigned devices and the current status for each task item.</p>
            </div>
          </div>

          {loading ? (
            <div className="sa-empty">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="sa-empty">No software tasks available.</div>
          ) : (
            <div className="sa-list">
              {tasks.map((task) => (
                <article className="sa-card" key={task.id}>
                  <div className="sa-card-top">
                    <div>
                      <h3>{task.title}</h3>

                      <div className="sa-meta">
                        {task.assignedName} • {formatDate(task.scheduledDate)}
                      </div>

                      <div className="sa-tags">
                        <span className={`sa-tag ${statusClass(task.status)}`}>
                          {statusAr(task.status)}
                        </span>
                        <span className="sa-tag">Items {task.items.length}</span>
                        <span className="sa-tag">{task.progressPercent || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="sa-items">
                    {task.items.map((item) => (
                      <div
                        key={item.id}
                        className={`sa-item ${statusClass(item.status)}`}
                      >
                        <div>
                          <b>{item.label}</b>

                          <div className="sa-meta">
                            {item.device?.deviceCode || "—"} •{" "}
                            {item.device?.ipAddress || "No IP"}
                            <br />
                            {item.location || "No location"}
                          </div>

                          <div className="sa-tags">
                            <span className={`sa-tag ${statusClass(item.status)}`}>
                              {statusAr(item.status)}
                            </span>

                            <span className="sa-tag">
                              {item.completedStepIds?.length || 0} steps
                            </span>

                            <span className="sa-tag">
                              {item.device?.currentStatus
                                ? statusAr(item.device.currentStatus)
                                : "No status"}
                            </span>
                          </div>
                        </div>

                        <div className="sa-item-actions">
                          {isFinishedStatus(item.status) && (
                            <button
                              className="sa-btn white sa-small"
                              onClick={() => openDoneDetails({ task, item })}
                            >
                              Work Details
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "MORPHO" && (
        <div className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>Morpho Review</h2>
              <p>
                Review all devices and update their status according to the external Morpho application.
              </p>
            </div>
          </div>

          <div className="sa-morpho-layout">
            <aside className="sa-filter-box">
              <div className="sa-stack">
                <input
                  className="sa-input"
                  placeholder="Search device, IP, barcode..."
                  value={deviceSearch}
                  onChange={(e) => setDeviceSearch(e.target.value)}
                />

                <select
                  className="sa-select"
                  value={deviceStatus}
                  onChange={(e) => setDeviceStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OK">OK</option>
                  <option value="NEEDS_MAINTENANCE">Needs Maintenance</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out Of Service</option>
                </select>

                <button className="sa-btn" onClick={loadDevices}>
                  Refresh Devices
                </button>
              </div>
            </aside>

            <div>
              {filteredDevices.length === 0 ? (
                <div className="sa-empty">No devices match the current filters.</div>
              ) : (
                <div className="sa-list">
                  {filteredDevices.map((device) => (
                    <article className="sa-card" key={device.id}>
                      <div className="sa-card-top">
                        <div>
                          <h3>{deviceTitle(device)}</h3>

                          <div className="sa-meta">
                            {device.deviceCode || "—"} • {device.ipAddress || "No IP"}
                            <br />
                            {deviceLocation(device) || "No location"}
                          </div>

                          <div className="sa-tags">
                            <span
                              className={`sa-tag ${statusClass(
                                device.currentStatus
                              )}`}
                            >
                              {statusAr(device.currentStatus)}
                            </span>

                            <span className="sa-tag">
                              Last: {formatDate(device.lastInspectionAt)}
                            </span>
                          </div>
                        </div>

                        <button
                          className="sa-btn sa-small"
                          onClick={() => openMorphoModal(device)}
                        >
                          Update Status
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "HISTORY" && (
        <div className="sa-panel">
          <div className="sa-panel-head">
            <div>
              <h2>History</h2>
              <p>All recorded actions: completed work, issues, and Morpho updates.</p>
            </div>

            <button className="sa-btn white" onClick={() => loadActivity()}>
              Refresh History
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="sa-empty">
              No history records are currently available from the backend.
            </div>
          ) : (
            <div className="sa-history">
              {activity.map((a, idx) => (
                <div className="sa-history-item" key={a.id || idx}>
                  <div className="sa-dot" />

                  <div>
                    <b>{a.title || a.action || "Activity"}</b>

                    <div className="sa-meta">
                      {a.message || a.notes || "—"}
                      <br />
                      {formatDate(a.createdAt)}
                    </div>

                    <div className="sa-tags">
                      {a.beforeStatus && (
                        <span className="sa-tag warn">
                          Before {statusAr(a.beforeStatus)}
                        </span>
                      )}

                      {a.afterStatus && (
                        <span className="sa-tag ok">
                          After {statusAr(a.afterStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {doneDetails && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal">
            <div className="sa-modal-head">
              <div>
                <h2>Completed Work Details</h2>
                <p>{doneDetails.item.label}</p>
              </div>

              <button
                className="sa-close"
                onClick={() => {
                  setDoneDetails(null);
                  setDoneDetailsSteps([]);
                }}
              >
                ×
              </button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-info-grid">
                <div className="sa-info-box">
                  <span>Technician</span>
                  <strong>{doneDetails.task.assignedName}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Status</span>
                  <strong>{statusAr(doneDetails.item.status)}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Finished At</span>
                  <strong>{formatDate(doneDetails.finishedAt)}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Result</span>
                  <strong>{doneDetails.item.solvedText}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Device Code</span>
                  <strong>{doneDetails.item.device?.deviceCode || "—"}</strong>
                </div>

                <div className="sa-info-box">
                  <span>IP</span>
                  <strong>{doneDetails.item.device?.ipAddress || "—"}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Location</span>
                  <strong>{doneDetails.item.location || "—"}</strong>
                </div>

                <div className="sa-info-box">
                  <span>Task</span>
                  <strong>{doneDetails.task.title}</strong>
                </div>
              </div>

              <div className="sa-panel" style={{ marginTop: 14 }}>
                <h2>Issue</h2>

                <div className="sa-tags">
                  {doneDetails.item.issueInfo?.code && (
                    <span className="sa-tag warn">
                      {doneDetails.item.issueInfo.code}
                    </span>
                  )}

                  <span className="sa-tag">
                    {doneDetails.item.issueInfo?.title || "No issue title"}
                  </span>

                  {doneDetails.item.issueInfo?.category && (
                    <span className="sa-tag">
                      {doneDetails.item.issueInfo.category}
                    </span>
                  )}
                </div>

                <p>
                  {doneDetails.item.issueInfo?.description ||
                    doneDetails.item.notes ||
                    "No issue description returned from backend."}
                </p>
              </div>

              <div className="sa-panel" style={{ marginTop: 14 }}>
                <div className="sa-panel-head">
                  <div>
                    <h2>Executed Steps</h2>
                    <p>Steps completed by the technician for this task.</p>
                  </div>

                  <button
                    className="sa-btn white sa-small"
                    onClick={() => loadDoneDetailsSteps(doneDetails)}
                    disabled={doneDetailsStepsLoading}
                  >
                    {doneDetailsStepsLoading ? "Loading..." : "Reload Steps"}
                  </button>
                </div>

                <div className="sa-step-list">
                  {doneDetailsStepsLoading ? (
                    <div className="sa-empty">Loading executed steps...</div>
                  ) : doneDetailsSteps.length > 0 ? (
                    doneDetailsSteps.map((s, index) => (
                      <div className="sa-step-chip" key={s.id || index}>
                        <div className="sa-step-bullet">✓</div>

                        <div>
                          <b>{s.title || `Step ${index + 1}`}</b>

                          <div className="sa-meta">
                            {s.description || "Step completed"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sa-empty">
                      لا توجد خطوات محفوظة لهذا العنصر. إذا تم الضغط على Done مباشرة
                      فلن توجد خطوات. إذا تم اختيار خطوات من Issue Steps وما زالت لا تظهر،
                      فهذا يعني أن الباك لم يرجع completedSolutionIds أو completedSolutions.
                    </div>
                  )}
                </div>
              </div>

              <div className="sa-panel" style={{ marginTop: 14 }}>
                <h2>Technician Notes</h2>
                <p>
                  {doneDetails.item.completionNote ||
                    doneDetails.item.notes ||
                    "No notes available."}
                </p>
              </div>
            </div>

            <div className="sa-modal-foot">
              <button
                className="sa-btn white"
                onClick={() => {
                  setDoneDetails(null);
                  setDoneDetailsSteps([]);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {morphoModal && (
        <div className="sa-modal-backdrop">
          <div className="sa-modal">
            <div className="sa-modal-head">
              <div>
                <h2>Morpho Status Update</h2>
                <p>{deviceTitle(morphoModal)}</p>
              </div>

              <button className="sa-close" onClick={() => setMorphoModal(null)}>
                ×
              </button>
            </div>

            <div className="sa-modal-body">
              <div className="sa-tags">
                <span className={`sa-tag ${statusClass(morphoModal.currentStatus)}`}>
                  Current: {statusAr(morphoModal.currentStatus)}
                </span>

                <span className="sa-tag">{morphoModal.ipAddress || "No IP"}</span>
              </div>

              <div style={{ height: 14 }} />

              <label className="sa-meta">Morpho Result</label>

              <select
                className="sa-select"
                value={morphoResult}
                onChange={(e) => setMorphoResult(e.target.value)}
              >
                <option value="FIXED">Fixed / OK</option>
                <option value="OK">OK</option>
                <option value="NOT_OK">Not OK</option>
                <option value="BROKEN">Broken</option>
                <option value="STILL_BROKEN">Still Broken</option>
              </select>

              <div style={{ height: 12 }} />

              <textarea
                className="sa-textarea"
                placeholder="Morpho review notes..."
                value={morphoNotes}
                onChange={(e) => setMorphoNotes(e.target.value)}
              />
            </div>

            <div className="sa-modal-foot">
              <button className="sa-btn white" onClick={() => setMorphoModal(null)}>
                Cancel
              </button>

              <button
                className="sa-btn green"
                disabled={busy === `morpho-${morphoModal.id}`}
                onClick={saveMorphoStatus}
              >
                Save Morpho Update
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SoftwareAdminPage;