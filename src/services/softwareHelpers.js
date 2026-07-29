// Helper constants and functions for SoftwarePage
export const SMART = {
  blue: "#1CA9E1",
  dark: "#263746",
  green: "#22C55E",
  red: "#EF4444",
  orange: "#F97316",
};

export const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

export const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("authToken") ||
  "";

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("dashboard_auth_user") || "null");
  } catch {
    return null;
  }
}

export function getLoggedUserId(currentUser) {
  const u = currentUser || getStoredUser();

  return (
    u?.id ||
    u?.userId ||
    u?.sub ||
    u?.data?.id ||
    u?.user?.id ||
    null
  );
}

export async function api(path, options = {}) {
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

export async function fetchMerged(paths) {
  const results = await Promise.allSettled(paths.map((path) => api(path)));
  const merged = [];
  const seen = new Set();

  results.forEach((result) => {
    if (result.status !== "fulfilled") return;

    const list = toArray(result.value);

    list.forEach((item) => {
      if (!item?.id) return;

      const key = String(item.id);

      if (seen.has(key)) return;

      seen.add(key);
      merged.push(item);
    });
  });

  return merged;
}

export async function tryPaths(paths, options = {}) {
  let lastError;

  for (const path of paths) {
    try {
      return await api(path, options);
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error("Request failed");
}

export function toArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.devices)) return data.devices;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(data?.activity)) return data.activity;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.solutions)) return data.solutions;
  if (Array.isArray(data?.issues)) return data.issues;
  return [];
}

export function userName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    `User #${user?.id || ""}`
  );
}

export function cleanText(value, fallback = "—") {
  const text = String(value ?? "").trim();
  return text && text !== "null" && text !== "undefined" ? text : fallback;
}

export function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && !Number.isNaN(n) ? n : null;
}

export function firstNumber(...values) {
  for (const value of values) {
    const n = toNumber(value);
    if (n !== null) return n;
  }

  return null;
}

export function normalizeIssue(raw, index = 0) {
  const source = raw?.issue || raw?.selectedIssue || raw || {};

  const id = firstNumber(
    raw?.id,
    raw?.issueId,
    raw?.selectedIssueId,
    source?.id,
    source?.issueId
  );

  return {
    ...raw,
    _uid: String(id ?? `issue-${index}`),
    _idNumber: id,
    id: id ?? raw?.id ?? source?.id ?? `issue-${index}`,
    issueCode:
      raw?.issueCode ||
      source?.issueCode ||
      raw?.code ||
      source?.code ||
      "",
    title:
      raw?.title ||
      raw?.name ||
      raw?.issueTitle ||
      source?.title ||
      source?.name ||
      `Issue ${id ?? index + 1}`,
    description:
      raw?.description ||
      raw?.issueDescription ||
      source?.description ||
      "",
    categoryName:
      raw?.categoryName ||
      raw?.category?.name ||
      source?.categoryName ||
      source?.category?.name ||
      "",
  };
}

export function normalizeSolution(raw, index = 0) {
  const source =
    raw?.solution ||
    raw?.issueSolution ||
    raw?.solutionAction ||
    raw?.action ||
    raw?.step ||
    raw ||
    {};

  const id = firstNumber(
    raw?.id,
    raw?.solutionId,
    raw?.issueSolutionId,
    raw?.solutionActionId,
    raw?.completedSolutionId,
    raw?.completedStepId,
    source?.id,
    source?.solutionId,
    source?.issueSolutionId,
    source?.solutionActionId
  );

  return {
    ...raw,
    _uid: String(id ?? `step-${index}`),
    _idNumber: id,
    id: id ?? raw?.id ?? source?.id ?? `step-${index}`,
    title:
      raw?.title ||
      raw?.name ||
      raw?.solutionTitle ||
      raw?.actionTitle ||
      source?.title ||
      source?.name ||
      source?.solutionTitle ||
      source?.actionTitle ||
      `Step ${index + 1}`,
    description:
      raw?.description ||
      raw?.notes ||
      raw?.action ||
      raw?.actionTaken ||
      source?.description ||
      source?.notes ||
      source?.action ||
      source?.actionTaken ||
      "Step completed",
    stepOrder:
      Number(raw?.stepOrder || raw?.order || source?.stepOrder || source?.order) ||
      index + 1,
  };
}

export function statusAr(status) {
  const value = String(status || "").toUpperCase();

  if (value === "OK") return "سليم";
  if (value === "NEEDS_MAINTENANCE") return "يحتاج إلى صيانة";
  if (value === "UNDER_MAINTENANCE") return "تحت الصيانة";
  if (value === "OUT_OF_SERVICE") return "خارج الخدمة";
  if (value === "PENDING") return "قيد الانتظار";
  if (value === "IN_PROGRESS") return "قيد التنفيذ";
  if (value === "DONE" || value === "COMPLETED") return "تم";
  if (value === "ISSUE_FOUND") return "تم تسجيل مشكلة";
  if (value === "NOT_REACHABLE") return "تعذر الوصول";
  if (value === "REPORTED_FIXED") return "تم الإبلاغ بالإصلاح";
  if (value === "REOPENED") return "ما زالت المشكلة";
  if (value === "NOT_OK") return "غير سليم";
  if (value === "FIXED") return "تم الإصلاح";
  if (value === "BROKEN") return "به عطل";
  if (value === "STILL_BROKEN") return "ما زال به عطل";

  return cleanText(status);
}

export function statusClass(status) {
  const value = String(status || "").toUpperCase();

  if (
    value === "OK" ||
    value === "DONE" ||
    value === "COMPLETED" ||
    value === "REPORTED_FIXED" ||
    value === "FIXED"
  ) {
    return "ok";
  }

  if (value === "IN_PROGRESS" || value === "UNDER_MAINTENANCE") {
    return "progress";
  }

  if (
    value === "NEEDS_MAINTENANCE" ||
    value === "ISSUE_FOUND" ||
    value === "REOPENED" ||
    value === "BROKEN" ||
    value === "STILL_BROKEN"
  ) {
    return "warn";
  }

  if (value === "OUT_OF_SERVICE" || value === "NOT_REACHABLE" || value === "NOT_OK") {
    return "bad";
  }

  return "idle";
}

export function isFinishedStatus(status) {
  const value = String(status || "").toUpperCase();

  return (
    value === "DONE" ||
    value === "COMPLETED" ||
    value === "ISSUE_FOUND" ||
    value === "NOT_REACHABLE" ||
    value === "SKIPPED" ||
    value === "OK" ||
    value === "NOT_OK"
  );
}

export function deviceTitle(device) {
  return (
    device?.deviceName ||
    device?.name ||
    device?.deviceCode ||
    device?.barcode ||
    `Device ${device?.id || ""}`
  );
}

export function gateTitle(gate) {
  return `Gate ${gate?.gateNo || gate?.gateNumber || gate?.id || ""}`;
}

export function deviceLocation(device) {
  const location = device?.location || {};

  return [
    device?.gateCluster || device?.cluster || location?.cluster,
    device?.gateBuilding || device?.building || location?.building,
    device?.gateZone || device?.zone || location?.zone,
    device?.gateDirection || device?.direction || location?.direction,
    device?.lane || location?.lane,
  ]
    .filter(Boolean)
    .join(" - ");
}

export function gateLocation(gate) {
  const location = gate?.location || {};

  return [
    gate?.cluster || location?.cluster,
    gate?.building || location?.building,
    gate?.zone || location?.zone,
    gate?.direction || location?.direction,
    gate?.lane || location?.lane,
  ]
    .filter(Boolean)
    .join(" - ");
}

export function normalizeTask(task) {
  const rawItems = toArray(task?.items);

  let items = rawItems.map((item) => {
    const device = item?.device || {};
    const gate = item?.gate || {};
    const isGate = Boolean(item?.gateId || gate?.id);

    return {
      ...item,
      id: item.id,
      backendItemId: item.id,
      taskId: task.id,
      deviceId: item.deviceId || device.id || null,
      gateId: item.gateId || gate.id || null,
      assetType: isGate ? "GATE" : "DEVICE",
      status: item.status || "PENDING",
      completionNote: item.completionNote || "",
      notes: item.notes || "",
      inspectedAt:
        item.inspectedAt ||
        item.completedAt ||
        item.doneAt ||
        item.updatedAt ||
        task.completedAt ||
        null,
      device,
      gate,
      label: isGate ? gateTitle(gate) : deviceTitle(device),
      location: isGate ? gateLocation(gate) : deviceLocation(device),
      completedSolutionIds:
        item.completedSolutionIds ||
        item.completedStepIds ||
        item.completionMetadata?.completedSolutionIds ||
        [],
      completedSolutions:
        item.completedSolutions ||
        item.completedStepObjects ||
        item.completionMetadata?.completedSolutions ||
        [],
      issueId:
        item.issueId ||
        item.issueInfo?.id ||
        item.completionMetadata?.issueId ||
        null,
    };
  });

  if (!items.length && task?.device) {
    items = [
      {
        id: `device-${task.device.id}`,
        backendItemId: null,
        taskId: task.id,
        deviceId: task.device.id,
        gateId: null,
        assetType: "DEVICE",
        status: task.status || "PENDING",
        completionNote: "",
        notes: "",
        inspectedAt: task.updatedAt || null,
        device: task.device,
        gate: null,
        label: deviceTitle(task.device),
        location: deviceLocation(task.device),
        completedSolutionIds: [],
        completedSolutions: [],
        issueId: null,
      },
    ];
  }

  if (!items.length && task?.gate) {
    items = [
      {
        id: `gate-${task.gate.id}`,
        backendItemId: null,
        taskId: task.id,
        deviceId: null,
        gateId: task.gate.id,
        assetType: "GATE",
        status: task.status || "PENDING",
        completionNote: "",
        notes: "",
        inspectedAt: task.updatedAt || null,
        device: null,
        gate: task.gate,
        label: gateTitle(task.gate),
        location: gateLocation(task.gate),
        completedSolutionIds: [],
        completedSolutions: [],
        issueId: null,
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

export function formatDate(value) {
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
