const DEFAULT_API_BASE_URL = "https://acess-backend-production.up.railway.app";

const ENV_BASE = (import.meta.env.VITE_API_BASE_URL || "").trim();
const ENV_TOKEN = (import.meta.env.VITE_API_TOKEN || "").trim();

let API_BASE_URL =
  (ENV_BASE || localStorage.getItem("dashboard_api_base_url") || DEFAULT_API_BASE_URL)
    .trim()
    .replace(/\/+$/, "");

let API_TOKEN = ENV_TOKEN || localStorage.getItem("dashboard_api_token") || "";

export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  token: API_TOKEN,
});

export const setApiConfig = ({ baseUrl, token }) => {
  API_BASE_URL = (baseUrl || DEFAULT_API_BASE_URL).trim().replace(/\/+$/, "");
  API_TOKEN = (token || "").trim();

  localStorage.setItem("dashboard_api_base_url", API_BASE_URL);
  localStorage.setItem("dashboard_api_token", API_TOKEN);
};

export const resetApiConfig = () => {
  API_BASE_URL = DEFAULT_API_BASE_URL;
  API_TOKEN = "";

  localStorage.setItem("dashboard_api_base_url", DEFAULT_API_BASE_URL);
  localStorage.removeItem("dashboard_api_token");
};

const ROLE_KEYWORDS = {
  admin: ["admin", "administrator", "superadmin", "super admin"],
  viewer: ["viewer", "monitor", "monitoring", "observer", "readonly", "read only"],
};

const normalizeText = (value) => String(value || "").trim().toLowerCase();

const normalizeRoleKey = (value) => {
  const role = normalizeText(value);

  if (!role) return "";

  if (ROLE_KEYWORDS.admin.some((keyword) => role === keyword || role.includes(keyword))) {
    return "admin";
  }

  if (ROLE_KEYWORDS.viewer.some((keyword) => role === keyword || role.includes(keyword))) {
    return "viewer";
  }

  return "";
};

const getRoleDisplayName = (roleKey) => (roleKey === "admin" ? "ADMIN" : "VIEWER");

const matchesRoleName = (roleName, roleKey) =>
  normalizeRoleKey(roleName) === roleKey;

const getUserRoleKey = (user) => {
  const roleSignals = [
    user?.accessRole,
    user?.role?.name,
    user?.userRole,
    user?.jobTitle,
    user?.type,
    user?.email,
  ];

  for (const signal of roleSignals) {
    const roleKey = normalizeRoleKey(signal);
    if (roleKey) return roleKey;
  }

  return "";
};

export const resolveUserAccessRole = (user) => {
  if (!user) return "";
  return getUserRoleKey(user) || "viewer";
};

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.rows)) return value.rows;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const formatNetworkError = (baseUrl, original) => {
  const host = (() => {
    try {
      return new URL(baseUrl).host;
    } catch {
      return baseUrl;
    }
  })();

  return `Cannot connect to backend (${host}). Check backend is running and CORS is enabled. (${original})`;
};

const request = async (path, { method = "GET", body, query, timeoutMs = 20000 } = {}) => {
  if (!API_BASE_URL) {
    API_BASE_URL = DEFAULT_API_BASE_URL;
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${cleanPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  let res;

  try {
    res = await fetch(url.toString(), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    });
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      throw new Error(`Connection timed out to ${url.host}.`);
    }

    throw new Error(formatNetworkError(API_BASE_URL, err.message || "network error"));
  }

  clearTimeout(timer);

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let message = `HTTP ${res.status}`;

    if (Array.isArray(data?.message)) {
      message = data.message.join(", ");
    } else if (typeof data?.message === "string") {
      message = data.message;
    } else if (typeof data?.error === "string") {
      message = data.error;
    }

    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data?.data ?? data;
};

const requestFirstAvailable = async (paths, options = {}) => {
  let lastErr;

  for (const path of paths) {
    try {
      return await request(path, options);
    } catch (err) {
      lastErr = err;
      if (err?.status && err.status !== 404) throw err;
    }
  }

  throw lastErr || new Error("No endpoint available.");
};

// ==================== DASHBOARD ====================
export const probeBackend = () =>
  requestFirstAvailable(
    ["/dashboard/summary", "/dashboard/admin", "/inspections"],
    { timeoutMs: 7000 }
  );

export const getDashboardSummary = async () => {
  try {
    return await requestFirstAvailable(["/dashboard/summary", "/dashboard/admin"]);
  } catch {
    return {
      totalDevices: 0,
      totalTechnicians: 0,
      openTasks: 0,
      inspectionsToday: 0,
    };
  }
};

export const getTechnicianPerformance = async () => {
  try {
    return await request("/dashboard/technicians-performance");
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== USERS ====================
export const getUsers = async () => normalizeList(await request("/users"));
export const getUserById = (id) => request(`/users/${id}`);

export const createUser = async (payload) => {
  const data = {
    firstName: payload.firstName || "Unknown",
    lastName: payload.lastName || "",
    fullName:
      payload.fullName ||
      `${payload.firstName || ""} ${payload.lastName || ""}`.trim(),
    email: payload.email,
    username: payload.username,
    password: payload.password,
    phone: payload.phone || null,
    officeNumber: payload.officeNumber || null,
    jobTitle: payload.jobTitle || "TECHNICIAN",
    region: payload.region || null,
    notes: payload.notes || null,
    roleId: payload.roleId || 2,
  };

  return request("/users", { method: "POST", body: data });
};

export const updateUser = (id, payload) =>
  request(`/users/${id}`, { method: "PATCH", body: payload });

export const deleteUser = (id) =>
  request(`/users/${id}`, { method: "DELETE" });

// ==================== ROLES ====================
export const getRoles = async () => normalizeList(await request("/roles"));
export const getRoleById = (id) => request(`/roles/${id}`);

export const createRole = (payload) =>
  request("/roles", { method: "POST", body: payload });

export const updateRole = (id, payload) =>
  request(`/roles/${id}`, { method: "PATCH", body: payload });

const ensureRole = async (roleKey) => {
  const normalizedRole = normalizeRoleKey(roleKey);

  if (!normalizedRole) {
    throw new Error("Invalid role. Use admin or viewer.");
  }

  const roles = await getRoles();
  const existing = roles.find((role) => matchesRoleName(role.name, normalizedRole));
  if (existing) return existing;

  return createRole({ name: getRoleDisplayName(normalizedRole) });
};

export const createAccessAccount = async ({ role, email, password }) => {
  const normalizedRole = normalizeRoleKey(role);
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedRole || !normalizedEmail || !password) {
    throw new Error("Role, email, and password are required.");
  }

  const existingUsers = await getUsers();
  const duplicate = existingUsers.find(
    (user) => String(user.email || "").trim().toLowerCase() === normalizedEmail
  );

  if (duplicate) {
    throw new Error("This email is already registered.");
  }

  const roleRecord = await ensureRole(normalizedRole);
  const namePrefix = normalizedRole === "admin" ? "Admin" : "Viewer";
  const emailPrefix = normalizedEmail.split("@")[0] || normalizedRole;

  const createdUser = await createUser({
    firstName: namePrefix,
    lastName: emailPrefix,
    fullName: `${namePrefix} ${emailPrefix}`.trim(),
    email: normalizedEmail,
    username: emailPrefix,
    password,
    jobTitle: getRoleDisplayName(normalizedRole),
    roleId: roleRecord.id,
    notes: `Access account (${normalizedRole})`,
  });

  return {
    ...createdUser,
    accessRole: normalizedRole,
  };
};

// ==================== AUTH ====================
export const authenticateUser = async ({ email }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  const users = await getUsers();

  const matchedUser = users.find((user) => {
    return String(user.email || "").trim().toLowerCase() === normalizedEmail;
  });

  if (!matchedUser) {
    throw new Error("Invalid email or user not found.");
  }

  return {
    ...matchedUser,
    accessRole: resolveUserAccessRole(matchedUser),
  };
};

// ==================== DEVICES ====================
export const getDevices = async () => {
  try {
    return normalizeList(await request("/devices"));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getDeviceById = (id) => request(`/devices/${id}`);

export const createDevice = (payload) =>
  request("/devices", { method: "POST", body: payload });

export const updateDevice = (id, payload) =>
  request(`/devices/${id}`, { method: "PATCH", body: payload });

export const deleteDevice = (id) =>
  request(`/devices/${id}`, { method: "DELETE" });

export const getDevicesByLocation = async (locationId) => {
  try {
    return normalizeList(await request(`/devices/location/${locationId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getDevicesByType = async (typeId) => {
  try {
    return normalizeList(await request(`/devices/type/${typeId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== DEVICE TYPES ====================
export const getDeviceTypes = async () => {
  try {
    return normalizeList(await request("/device-types"));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getDeviceTypeById = (id) => request(`/device-types/${id}`);

export const createDeviceType = (payload) =>
  request("/device-types", { method: "POST", body: payload });

export const updateDeviceType = (id, payload) =>
  request(`/device-types/${id}`, { method: "PATCH", body: payload });

// ==================== LOCATIONS ====================
export const getLocations = async () => normalizeList(await request("/locations"));

export const getLocationById = (id) => request(`/locations/${id}`);

export const createLocation = (payload) =>
  request("/locations", { method: "POST", body: payload });

export const updateLocation = (id, payload) =>
  request(`/locations/${id}`, { method: "PATCH", body: payload });

export const deleteLocation = (id) =>
  request(`/locations/${id}`, { method: "DELETE" });

// ==================== INSPECTION TASKS ====================
export const getTasks = async () => normalizeList(await request("/inspection-tasks"));

export const getTaskById = (id) => request(`/inspection-tasks/${id}`);

export const createTask = (payload) =>
  request("/inspection-tasks", { method: "POST", body: payload });

export const updateTask = (id, payload) =>
  request(`/inspection-tasks/${id}`, { method: "PATCH", body: payload });

export const updateTaskStatus = (id, status) =>
  request(`/inspection-tasks/${id}`, { method: "PATCH", body: { status } });

export const deleteTask = (id) =>
  request(`/inspection-tasks/${id}`, { method: "DELETE" });

export const getTasksByDevice = async (deviceId) => {
  try {
    return normalizeList(await request(`/inspection-tasks/device/${deviceId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getTasksByUser = async (userId) => {
  try {
    return normalizeList(await request(`/inspection-tasks/user/${userId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== INSPECTIONS ====================
export const getInspections = async (query = {}) =>
  normalizeList(await request("/inspections", { query }));

export const getInspectionById = (id) => request(`/inspections/${id}`);

export const createInspection = (payload) =>
  request("/inspections", { method: "POST", body: payload });

export const updateInspection = (id, payload) =>
  request(`/inspections/${id}`, { method: "PATCH", body: payload });

export const deleteInspection = (id) =>
  request(`/inspections/${id}`, { method: "DELETE" });

export const getInspectionsByDevice = async (deviceId) => {
  try {
    return normalizeList(await request(`/inspections/device/${deviceId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getInspectionsByTechnician = async (technicianId) => {
  try {
    return normalizeList(await request(`/inspections/technician/${technicianId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const getInspectionsByTask = async (taskId) => {
  try {
    return normalizeList(await request(`/inspections/task/${taskId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== INSPECTION IMAGES ====================
export const getInspectionImages = async (inspectionId) => {
  try {
    return normalizeList(await request(`/inspection-images/inspection/${inspectionId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

export const createInspectionImage = (payload) =>
  request("/inspection-images", { method: "POST", body: payload });

export const deleteInspectionImage = (id) =>
  request(`/inspection-images/${id}`, { method: "DELETE" });

// ==================== MAINTENANCE LOGS ====================
export const getMaintenanceLogs = async (query = {}) =>
  normalizeList(await request("/maintenance-logs", { query }));

export const getMaintenanceLogById = (id) => request(`/maintenance-logs/${id}`);

export const createMaintenanceLog = (payload) =>
  request("/maintenance-logs", { method: "POST", body: payload });

export const updateMaintenanceLog = (id, payload) =>
  request(`/maintenance-logs/${id}`, { method: "PATCH", body: payload });

export const deleteMaintenanceLog = (id) =>
  request(`/maintenance-logs/${id}`, { method: "DELETE" });

export const getMaintenanceLogsByDevice = async (deviceId) => {
  try {
    return normalizeList(await request(`/maintenance-logs/device/${deviceId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== DEVICE MOVEMENTS ====================
export const getDeviceMovements = async (query = {}) =>
  normalizeList(await request("/device-movements", { query }));

export const getMovementById = (id) => request(`/device-movements/${id}`);

export const createMovement = (payload) =>
  request("/device-movements", { method: "POST", body: payload });

export const getMovementsByDevice = async (deviceId) => {
  try {
    return normalizeList(await request(`/device-movements/device/${deviceId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== DEVICE STATUS HISTORY ====================
export const getDeviceStatusHistory = async (query = {}) =>
  normalizeList(await request("/device-status-history", { query }));

export const getStatusHistoryById = (id) =>
  request(`/device-status-history/${id}`);

export const getDeviceStatusHistoryByDevice = async (deviceId) => {
  try {
    return normalizeList(await request(`/device-status-history/device/${deviceId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== AUDIT LOGS ====================
export const getAuditLogs = async (query = {}) =>
  normalizeList(await request("/audit-logs", { query }));

export const getAuditLogById = (id) => request(`/audit-logs/${id}`);

export const getAuditLogsByUser = async (userId) => {
  try {
    return normalizeList(await request(`/audit-logs/user/${userId}`));
  } catch (err) {
    if (err?.status === 404) return [];
    throw err;
  }
};

// ==================== TROUBLESHOOTING / ISSUES ====================
export const getIssueCategories = async () =>
  normalizeList(await request("/issues/categories"));

export const getIssueCategoryById = (id) =>
  request(`/issues/categories/${id}`);

export const createIssueCategory = (payload) =>
  request("/issues/categories", { method: "POST", body: payload });

export const updateIssueCategory = (id, payload) =>
  request(`/issues/categories/${id}`, { method: "PATCH", body: payload });

export const deleteIssueCategory = (id) =>
  request(`/issues/categories/${id}`, { method: "DELETE" });

export const getIssues = async (query = {}) =>
  normalizeList(await request("/issues", { query }));

export const getIssueById = (id) =>
  request(`/issues/${id}`);

export const createIssue = (payload) =>
  request("/issues", { method: "POST", body: payload });

export const updateIssue = (id, payload) =>
  request(`/issues/${id}`, { method: "PATCH", body: payload });

export const deleteIssue = (id) =>
  request(`/issues/${id}`, { method: "DELETE" });

export const getIssuesByDeviceType = async (deviceTypeId) =>
  normalizeList(await request(`/issues/device-type/${deviceTypeId}`));

export const getIssueSolutions = async (issueId) =>
  normalizeList(await request(`/issues/${issueId}/solutions`));

export const createIssueSolution = (payload) =>
  request("/issues/solutions", { method: "POST", body: payload });

export const updateIssueSolution = (id, payload) =>
  request(`/issues/solutions/${id}`, { method: "PATCH", body: payload });

export const deleteIssueSolution = (id) =>
  request(`/issues/solutions/${id}`, { method: "DELETE" });

export const reportInspectionIssue = (payload) =>
  request("/issues/inspection/report", { method: "POST", body: payload });

export const getInspectionIssuesByInspection = async (inspectionId) =>
  normalizeList(await request(`/issues/inspection/${inspectionId}/reported`));

export const getInspectionIssueById = (id) =>
  request(`/issues/inspection-item/${id}`);

export const executeInspectionSolutionAction = (payload) =>
  request("/issues/inspection/action", { method: "POST", body: payload });

export const updateInspectionIssueStatus = (id, payload) =>
  request(`/issues/inspection-item/${id}/status`, {
    method: "PATCH",
    body: payload,
  });