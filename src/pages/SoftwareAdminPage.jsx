import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as XLSX from "xlsx";

/* =========================================================
   SMART IT — SOFTWARE ADMIN CONTROL CENTER
   File: src/pages/SoftwareAdminPage.jsx

   READ-ONLY ADMIN PAGE:
   - Loads every backend page automatically (no visible pagination).
   - Shows Global Tasks, task items, solved/unresolved issues,
     completed solution steps, Problem Tickets, activity and Morpho work.
   - Details are grouped in clear tables and a full details modal.
   - Nothing is deleted or changed from this page.
========================================================= */

const CONFIGURED_API_BASE_URL = String(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "",
)
  .trim()
  .replace(/\/+$/, "");

const API_BASE_URL =
  "https://acess-backend-production-8856.up.railway.app";

const PAGE_BATCH_SIZE = 100;
const REQUEST_CONCURRENCY = 5;

const ENDPOINTS = {
  tasks: ["/inspection-tasks", "/api/inspection-tasks"],
  tickets: ["/issues/tickets", "/api/issues/tickets"],
  activity: [
    "/inspection-tasks/activity",
    "/technician-activity",
    "/technician-activity-logs",
    "/activity",
  ],
  morpho: [
    "/morpho-repairs",
    "/devices/morpho-repairs",
    "/device-morpho-repairs",
  ],
  issues: ["/issues", "/api/issues"],
  solutions: [
    "/issue-solutions",
    "/issues/solutions",
    "/api/issue-solutions",
  ],
};

function getToken() {
  return ["accessToken", "access_token", "token", "authToken", "jwt"]
    .map((key) => localStorage.getItem(key) || sessionStorage.getItem(key))
    .find(Boolean);
}

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function request(path, options = {}) {
  const token = getToken();
  const response = await fetch(
    /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path}`,
    {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    },
  );

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" | ")
      : payload?.message ||
        payload?.error ||
        `${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload;
}

function first(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function safe(value, fallback = "—") {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

function extractRows(payload) {
  if (Array.isArray(payload)) return payload;

  const candidates = [
    payload?.data,
    payload?.items,
    payload?.records,
    payload?.rows,
    payload?.results,
    payload?.tasks,
    payload?.tickets,
    payload?.activity,
    payload?.logs,
    payload?.repairs,
    payload?.issues,
    payload?.solutions,
    payload?.result,
    payload?.payload,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  if (payload?.data && typeof payload.data === "object") {
    return extractRows(payload.data);
  }

  return [];
}

function totalPagesFromPayload(payload) {
  const value = first(
    payload?.pagination?.totalPages,
    payload?.pagination?.pages,
    payload?.meta?.totalPages,
    payload?.meta?.pages,
    payload?.totalPages,
    payload?.pages,
    payload?.data?.pagination?.totalPages,
    payload?.data?.meta?.totalPages,
  );
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function totalCountFromPayload(payload) {
  const value = first(
    payload?.pagination?.total,
    payload?.pagination?.totalCount,
    payload?.meta?.total,
    payload?.meta?.totalCount,
    payload?.total,
    payload?.totalCount,
    payload?.data?.pagination?.total,
    payload?.data?.meta?.total,
  );
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function identity(row, index = 0) {
  const explicit = first(
    row?.id,
    row?.taskId,
    row?.ticketId,
    row?.inspectionId,
    row?.morphoRepairId,
  );
  if (explicit !== "") return String(explicit);
  return `${safe(row?.createdAt, "unknown")}-${safe(row?.title, "row")}-${index}`;
}

function uniqueRows(rows) {
  const map = new Map();
  rows.forEach((row, index) => {
    const key = identity(row, index);
    map.set(key, { ...(map.get(key) || {}), ...row });
  });
  return Array.from(map.values());
}

async function poolMap(values, concurrency, worker) {
  const result = new Array(values.length);
  let cursor = 0;

  async function run() {
    while (true) {
      const index = cursor;
      cursor += 1;
      if (index >= values.length) return;
      result[index] = await worker(values[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => run()),
  );
  return result;
}

async function loadEveryPage(path, onProgress = () => {}) {
  const firstUrl = buildUrl(path, { page: 1, limit: PAGE_BATCH_SIZE });
  const firstPayload = await request(firstUrl);
  const firstRows = extractRows(firstPayload);

  if (!firstRows.length) return [];

  const declaredPages = totalPagesFromPayload(firstPayload);
  const declaredTotal = totalCountFromPayload(firstPayload);

  if (declaredPages && declaredPages > 1) {
    const pageNumbers = Array.from(
      { length: declaredPages - 1 },
      (_, index) => index + 2,
    );

    let finished = 1;
    const rest = await poolMap(pageNumbers, REQUEST_CONCURRENCY, async (page) => {
      const payload = await request(
        buildUrl(path, { page, limit: PAGE_BATCH_SIZE }),
      );
      finished += 1;
      onProgress(
        `Loading ${path}: page ${finished} of ${declaredPages}${
          declaredTotal ? ` · ${declaredTotal} records` : ""
        }`,
      );
      return extractRows(payload);
    });

    return uniqueRows([firstRows, ...rest].flat());
  }

  const pages = [firstRows];
  const seenPageSignatures = new Set([
    firstRows.map((row, index) => identity(row, index)).join("|"),
  ]);
  let page = 2;

  while (true) {
    const payload = await request(
      buildUrl(path, { page, limit: PAGE_BATCH_SIZE }),
    );
    const rows = extractRows(payload);
    if (!rows.length) break;

    const signature = rows
      .map((row, index) => identity(row, index))
      .join("|");
    if (seenPageSignatures.has(signature)) break;

    seenPageSignatures.add(signature);
    pages.push(rows);
    onProgress(`Loading ${path}: ${uniqueRows(pages.flat()).length} records`);

    if (rows.length < firstRows.length) break;
    page += 1;
  }

  return uniqueRows(pages.flat());
}

async function loadFirstAvailable(paths, onProgress = () => {}, optional = false) {
  let lastError = null;

  for (const path of paths) {
    try {
      onProgress(`Connecting to ${path}`);
      return await loadEveryPage(path, onProgress);
    } catch (error) {
      lastError = error;
      console.warn(`Admin endpoint failed: ${path}`, error);
    }
  }

  if (optional) return [];
  throw lastError || new Error("No available backend endpoint returned data.");
}

async function loadTaskDetail(task) {
  if (!task?.id) return task;

  const paths = [
    `/inspection-tasks/${task.id}`,
    `/api/inspection-tasks/${task.id}`,
    `/inspection-tasks/admin/${task.id}`,
  ];

  for (const path of paths) {
    try {
      const payload = await request(path);
      const detail =
        payload?.task || payload?.data || payload?.item || payload?.result || payload;
      return {
        ...task,
        ...(detail || {}),
        assignedTo: { ...(task.assignedTo || {}), ...(detail?.assignedTo || {}) },
        createdBy: { ...(task.createdBy || {}), ...(detail?.createdBy || {}) },
        items: asArray(detail?.items).length ? detail.items : asArray(task.items),
        inspections: asArray(detail?.inspections).length
          ? detail.inspections
          : asArray(task.inspections),
        activityLogs: asArray(detail?.activityLogs).length
          ? detail.activityLogs
          : asArray(task.activityLogs),
      };
    } catch {
      // Try the next compatible route.
    }
  }

  return task;
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function personName(person, fallback = "—") {
  if (!person) return fallback;
  if (typeof person === "string") return person;
  return safe(
    first(
      person.fullName,
      person.name,
      `${person.firstName || ""} ${person.lastName || ""}`.trim(),
      person.username,
      person.email,
      person.id ? `User #${person.id}` : "",
    ),
    fallback,
  );
}

function normalizeSearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[^\p{L}\p{N}.@_-]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

function localDateKey(value) {
  const date = toDate(value);
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function statusText(value) {
  return safe(value, "UNKNOWN").toUpperCase().replaceAll("_", " ");
}

function statusTone(value) {
  const status = statusText(value);
  if (
    status.includes("DONE") ||
    status.includes("COMPLETED") ||
    status.includes("RESOLVED") ||
    status.includes("FIXED") ||
    status.includes("APPROVED") ||
    status === "OK"
  ) {
    return "good";
  }
  if (
    status.includes("OPEN") ||
    status.includes("ISSUE") ||
    status.includes("NOT OK") ||
    status.includes("FAILED") ||
    status.includes("UNRESOLVED") ||
    status.includes("REJECTED") ||
    status.includes("NOT REACHABLE")
  ) {
    return "bad";
  }
  if (
    status.includes("PROGRESS") ||
    status.includes("PENDING") ||
    status.includes("PARTIAL") ||
    status.includes("REVIEW")
  ) {
    return "progress";
  }
  return "idle";
}

function statusCaption(value) {
  const tone = statusTone(value);
  if (tone === "good") return "Solved";
  if (tone === "bad") return "Not solved";
  return "Pending / In progress";
}

function assetFrom(value = {}) {
  return value.device || value.gate || value.glass || value.asset || {};
}

function assetName(value = {}) {
  const asset = assetFrom(value);
  return safe(
    first(
      asset.deviceCode,
      asset.deviceName,
      asset.name,
      asset.gateNo,
      asset.secretCode,
      asset.excelId,
      value.deviceCode,
      value.gateNo,
      value.glassId ? `Glass #${value.glassId}` : "",
      value.deviceId ? `Device #${value.deviceId}` : "",
      value.gateId ? `Gate #${value.gateId}` : "",
    ),
  );
}

function assetLocation(value = {}) {
  const asset = assetFrom(value);
  const location =
    value.location ||
    value.inspection?.location ||
    asset.location ||
    value.task?.location ||
    {};

  return [
    first(location.cluster, asset.cluster, asset.gateCluster),
    first(location.building, asset.building, asset.gateBuilding),
    first(location.zone, asset.zone, asset.gateZone),
    first(location.direction, asset.direction, asset.gateDirection),
    first(location.lane, asset.lane, asset.gateNo),
  ]
    .filter(Boolean)
    .join(" · ") || safe(first(value.completedLocationText, value.locationText));
}

function solutionStepFrom(value, solutionMap) {
  if (!value) return null;
  if (typeof value === "string" || typeof value === "number") {
    const matched = solutionMap.get(String(value));
    return {
      id: value,
      title: matched?.title || matched?.description || `Step #${value}`,
      status: matched?.status || "DONE",
      note: "",
      doneAt: "",
    };
  }

  const source = value.solution || value.issueSolution || value;
  const id = first(value.solutionId, source.id, value.id);
  const matched = solutionMap.get(String(id));

  return {
    id,
    title: safe(
      first(
        source.title,
        source.name,
        source.description,
        value.title,
        value.description,
        matched?.title,
        matched?.description,
        id ? `Step #${id}` : "Step",
      ),
    ),
    status: first(value.status, source.status, matched?.status, "DONE"),
    note: first(value.note, value.notes, value.completionNote),
    doneAt: first(value.doneAt, value.completedAt, value.updatedAt),
    stepOrder: first(value.stepOrder, source.stepOrder, matched?.stepOrder),
  };
}

function collectSolutionSteps(item, solutionMap) {
  const inspection = item?.inspection || {};
  const metadata = parseJson(first(item?.metadata, inspection?.metadata));
  const issueActions = asArray(inspection.inspectionIssues).flatMap((issue) =>
    asArray(issue.actions),
  );

  const sources = [
    item?.completedSolutions,
    item?.solutionActions,
    item?.steps,
    item?.solutionSteps,
    inspection?.solutionActions,
    issueActions,
    metadata?.completedSolutions,
    metadata?.solutionActions,
    metadata?.completedSolutionIds,
    metadata?.solutionIds,
    metadata?.doneSolutionIds,
    metadata?.completedStepIds,
  ];

  const map = new Map();
  sources.forEach((source) => {
    const values = Array.isArray(source)
      ? source
      : typeof source === "string"
        ? source.split(/\r?\n|\s*\|\s*/g).filter(Boolean)
        : source
          ? [source]
          : [];

    values.forEach((value, index) => {
      const step = solutionStepFrom(value, solutionMap);
      if (!step) return;
      const key = String(first(step.id, `${step.title}-${index}`));
      map.set(key, { ...(map.get(key) || {}), ...step });
    });
  });

  return Array.from(map.values()).sort(
    (a, b) => Number(a.stepOrder || 0) - Number(b.stepOrder || 0),
  );
}

function collectInspectionIssues(item, issueMap) {
  const inspection = item?.inspection || {};
  const metadata = parseJson(first(item?.metadata, inspection?.metadata));
  const sources = [
    inspection?.inspectionIssues,
    item?.inspectionIssues,
    item?.issues,
    metadata?.issues,
    metadata?.issue,
  ];
  const map = new Map();

  sources.forEach((source) => {
    const values = Array.isArray(source) ? source : source ? [source] : [];
    values.forEach((value, index) => {
      const issueSource = value.issue || value.problem || value;
      const issueId = first(value.issueId, issueSource.id, value.id);
      const catalog = issueMap.get(String(issueId));
      const issue = {
        id: issueId,
        code: first(issueSource.issueCode, catalog?.issueCode),
        title: safe(
          first(
            issueSource.title,
            issueSource.name,
            issueSource.description,
            catalog?.title,
            catalog?.description,
            item?.issueReason,
            inspection?.issueReason,
            issueId ? `Issue #${issueId}` : "Issue",
          ),
        ),
        status: first(value.status, issueSource.status, catalog?.status, "OPEN"),
        notes: first(value.notes, value.note, issueSource.notes),
        unresolvedReason: first(value.unresolvedReason, issueSource.unresolvedReason),
        resolvedAt: first(value.resolvedAt, issueSource.resolvedAt),
      };
      const key = String(first(issue.id, `${issue.title}-${index}`));
      map.set(key, { ...(map.get(key) || {}), ...issue });
    });
  });

  if (!map.size && first(item?.issueReason, inspection?.issueReason)) {
    map.set("reason", {
      id: "",
      title: first(item.issueReason, inspection.issueReason),
      status: item?.status === "DONE" ? "RESOLVED" : "OPEN",
      notes: first(item?.completionNote, inspection?.notes),
    });
  }

  return Array.from(map.values());
}

function normalizeTask(task = {}) {
  const items = asArray(first(task.items, task.taskItems, []));
  const totalItems = Number(first(task.totalItems, items.length, 0)) || 0;
  const completedItems =
    Number(
      first(
        task.completedItems,
        items.filter((item) => statusTone(item.status) === "good").length,
        0,
      ),
    ) || 0;
  const issueItems =
    Number(
      first(
        task.issueItems,
        items.filter((item) => statusTone(item.status) === "bad").length,
        0,
      ),
    ) || 0;
  const remainingItems =
    Number(first(task.remainingItems, Math.max(0, totalItems - completedItems), 0)) ||
    0;
  const progressPercent =
    Number(
      first(
        task.progressPercent,
        totalItems ? (completedItems / totalItems) * 100 : 0,
      ),
    ) || 0;

  const normalized = {
    ...task,
    id: first(task.id, task.taskId),
    title: safe(first(task.title, task.name, `Task #${task.id}`)),
    taskKind: first(task.taskKind, task.kind, task.taskType, "GLOBAL_ROUTE"),
    assetType: first(task.assetType, task.type, "SOFTWARE"),
    status: first(task.status, "PENDING"),
    priority: first(task.priority, "MEDIUM"),
    assignedTo: task.assignedTo || task.technician || {},
    createdBy: task.createdBy || {},
    scheduledDate: first(task.scheduledDate, task.startDate, task.createdAt),
    dueDate: task.dueDate,
    startedAt: task.startedAt,
    completedAt: task.completedAt,
    adminReview: first(task.adminReview, "PENDING_REVIEW"),
    adminNote: task.adminNote,
    totalItems,
    completedItems,
    issueItems,
    notReachableItems: Number(task.notReachableItems || 0),
    remainingItems,
    progressPercent,
    items,
    _raw: task,
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.title,
      normalized.taskKind,
      normalized.assetType,
      normalized.status,
      normalized.priority,
      personName(normalized.assignedTo),
      personName(normalized.createdBy),
      normalized.adminReview,
      normalized.adminNote,
      normalized.notes,
    ].join(" "),
  );

  return normalized;
}

function normalizeTaskItem(item = {}, task, issueMap, solutionMap) {
  const matchingInspection =
    item.inspection ||
    asArray(task.inspections).find(
      (inspection) =>
        String(inspection.id || "") === String(item.inspectionId || "") ||
        (item.deviceId && String(inspection.deviceId) === String(item.deviceId)) ||
        (item.gateId && String(inspection.gateId) === String(item.gateId)) ||
        (item.glassId && String(inspection.glassId) === String(item.glassId)),
    ) ||
    {};

  const merged = { ...item, inspection: matchingInspection, task };
  const steps = collectSolutionSteps(merged, solutionMap);
  const issues = collectInspectionIssues(merged, issueMap);
  const technician =
    item.completedBy ||
    matchingInspection.technician ||
    item.assignedTo ||
    task.assignedTo ||
    {};
  const inspectionStatus = first(
    matchingInspection.inspectionStatus,
    item.inspectionStatus,
    item.result,
  );
  const issueResult =
    statusTone(item.status) === "good" || statusTone(inspectionStatus) === "good"
      ? "RESOLVED"
      : statusTone(item.status) === "bad" || statusTone(inspectionStatus) === "bad"
        ? "UNRESOLVED"
        : "PENDING";

  const normalized = {
    ...item,
    id: first(item.id, item.itemId),
    taskId: first(item.taskId, task.id),
    taskTitle: task.title,
    taskKind: task.taskKind,
    taskStatus: task.status,
    status: first(item.status, "PENDING"),
    inspectionStatus: first(inspectionStatus, "—"),
    inspectionId: first(item.inspectionId, matchingInspection.id),
    technician,
    asset: assetFrom(merged),
    assetName: assetName(merged),
    location: assetLocation(merged),
    issueFound:
      Boolean(item.issueFound) ||
      issues.length > 0 ||
      statusTone(item.status) === "bad",
    issueResult,
    issues,
    steps,
    notes: first(item.notes, matchingInspection.notes),
    completionNote: first(item.completionNote, matchingInspection.notes),
    startedAt: first(item.startedAt, matchingInspection.startedAt),
    inspectedAt: first(item.inspectedAt, matchingInspection.inspectedAt),
    completedAt: first(
      item.completedAt,
      matchingInspection.completedAt,
      item.inspectedAt,
      matchingInspection.inspectedAt,
    ),
    scannedCode: item.scannedCode,
    gps:
      first(item.completedLatitude, matchingInspection.latitude) &&
      first(item.completedLongitude, matchingInspection.longitude)
        ? `${first(item.completedLatitude, matchingInspection.latitude)}, ${first(
            item.completedLongitude,
            matchingInspection.longitude,
          )}`
        : "",
    _raw: { ...item, inspection: matchingInspection, task },
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.taskId,
      normalized.taskTitle,
      normalized.taskKind,
      normalized.status,
      normalized.inspectionStatus,
      normalized.issueResult,
      personName(normalized.technician),
      normalized.assetName,
      normalized.location,
      normalized.notes,
      normalized.completionNote,
      issues.map((issue) => `${issue.title} ${issue.status} ${issue.notes}`).join(" "),
      steps.map((step) => `${step.title} ${step.status} ${step.note}`).join(" "),
    ].join(" "),
  );

  return normalized;
}

function ticketSteps(ticket) {
  const source = first(ticket.solutionSteps, ticket.steps, ticket.problemSteps, []);
  if (Array.isArray(source)) {
    return source
      .map((step) =>
        typeof step === "string"
          ? step
          : first(step.text, step.title, step.description),
      )
      .filter(Boolean);
  }
  if (typeof source === "string") {
    const parsed = parseJson(source);
    if (Array.isArray(parsed)) return ticketSteps({ solutionSteps: parsed });
    return source
      .split(/\r?\n|\s*\|\s*/g)
      .map((step) => step.replace(/^\s*\d+[.)-]?\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function normalizeTicket(ticket = {}) {
  const steps = ticketSteps(ticket);
  const normalized = {
    ...ticket,
    id: first(ticket.id, ticket.ticketId),
    type: first(ticket.type, "SOFTWARE"),
    title: safe(first(ticket.title, ticket.description, `Ticket #${ticket.id}`)),
    locationText: safe(ticket.locationText),
    locationBuildings: asArray(ticket.locationBuildings),
    description: safe(ticket.description),
    priority: first(ticket.priority, "MEDIUM"),
    status: first(ticket.status, "OPEN"),
    solutionText: ticket.solutionText,
    steps,
    resultNotes: first(ticket.resultNotes, ticket.finalResult),
    problemDate: first(ticket.problemDate, ticket.createdAt),
    statusDate: first(ticket.statusDate, ticket.updatedAt),
    startedAt: ticket.startedAt,
    resolvedAt: ticket.resolvedAt,
    createdBy: ticket.createdBy || {},
    assignedTo: ticket.assignedTo || {},
    resolvedBy: ticket.resolvedBy || {},
    _raw: ticket,
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.type,
      normalized.title,
      normalized.locationText,
      normalized.locationBuildings.join(" "),
      normalized.description,
      normalized.priority,
      normalized.status,
      normalized.solutionText,
      normalized.steps.join(" "),
      normalized.resultNotes,
      personName(normalized.createdBy),
      personName(normalized.assignedTo),
      personName(normalized.resolvedBy),
    ].join(" "),
  );

  return normalized;
}

function normalizeIssue(issue = {}) {
  const normalized = {
    ...issue,
    id: first(issue.id, issue.issueId),
    code: first(issue.issueCode, issue.code, issue.key),
    title: safe(
      first(
        issue.title,
        issue.name,
        issue.description,
        `Issue #${first(issue.id, issue.issueId)}`,
      ),
    ),
    description: safe(
      first(issue.description, issue.details, issue.problemDescription),
    ),
    category: first(
      issue.category,
      issue.type,
      issue.issueType,
      issue.assetType,
      "ISSUE",
    ),
    status: first(
      issue.status,
      issue.isActive === false ? "INACTIVE" : "ACTIVE",
    ),
    priority: first(issue.priority, issue.severity),
    createdAt: first(issue.createdAt, issue.problemDate),
    updatedAt: first(issue.updatedAt, issue.statusDate),
    createdBy: issue.createdBy || issue.user || {},
    solutions: asArray(first(issue.solutions, issue.issueSolutions, [])),
    _raw: issue,
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.code,
      normalized.title,
      normalized.description,
      normalized.category,
      normalized.status,
      normalized.priority,
      personName(normalized.createdBy),
      normalized.solutions
        .map((solution) =>
          first(solution.title, solution.name, solution.description),
        )
        .join(" "),
    ].join(" "),
  );

  return normalized;
}

function normalizeActivity(row = {}) {
  const metadata = parseJson(row.metadata);
  const user = row.user || row.technician || row.createdBy || {};
  const normalized = {
    ...row,
    id: first(row.id, row.activityId),
    action: first(row.action, row.type, "ACTIVITY"),
    title: safe(first(row.title, row.action, "Activity")),
    message: safe(first(row.message, row.notes, metadata.note, metadata.notes)),
    user,
    date: first(row.createdAt, row.updatedAt, row.actionAt),
    beforeStatus: first(row.beforeStatus, metadata.beforeStatus),
    afterStatus: first(row.afterStatus, metadata.afterStatus),
    locationText: first(row.locationText, metadata.locationText),
    taskId: first(row.taskId, metadata.taskId),
    taskItemId: first(row.taskItemId, metadata.taskItemId),
    inspectionId: first(row.inspectionId, metadata.inspectionId),
    deviceId: first(row.deviceId, metadata.deviceId),
    morphoRepairId: first(row.morphoRepairId, metadata.morphoRepairId),
    metadata,
    _raw: row,
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.action,
      normalized.title,
      normalized.message,
      personName(normalized.user),
      normalized.beforeStatus,
      normalized.afterStatus,
      normalized.locationText,
      JSON.stringify(metadata),
    ].join(" "),
  );

  return normalized;
}

function normalizeMorpho(row = {}) {
  const device = row.device || {};
  const technician = row.technician || row.user || {};
  const normalized = {
    ...row,
    id: first(row.id, row.morphoRepairId),
    device,
    technician,
    deviceName: safe(
      first(device.deviceCode, device.deviceName, device.name, row.deviceId && `Device #${row.deviceId}`),
    ),
    status: first(row.status, row.morphoResult, "REPORTED_FIXED"),
    oldStatus: row.oldStatus,
    newStatus: row.newStatus,
    source: first(row.source, "MORPHO_APP"),
    notes: row.notes,
    proofImageUrl: row.proofImageUrl,
    date: first(row.fixedAt, row.createdAt, row.updatedAt),
    taskItemId: row.taskItemId,
    inspectionId: row.inspectionId,
    _raw: row,
  };

  normalized.searchText = normalizeSearch(
    [
      normalized.id,
      normalized.deviceName,
      personName(normalized.technician),
      normalized.status,
      normalized.oldStatus,
      normalized.newStatus,
      normalized.source,
      normalized.notes,
    ].join(" "),
  );

  return normalized;
}

function mergeMorphoWithActivity(morphoRows, activityRows) {
  const derived = activityRows
    .filter((row) => statusText(row.action).includes("MORPHO"))
    .map((row) =>
      normalizeMorpho({
        id: first(row.morphoRepairId, `activity-${row.id}`),
        deviceId: row.deviceId,
        technician: row.user,
        status: first(row.afterStatus, row.action),
        oldStatus: row.beforeStatus,
        newStatus: row.afterStatus,
        notes: row.message,
        source: "ACTIVITY_LOG",
        fixedAt: row.date,
        taskItemId: row.taskItemId,
        inspectionId: row.inspectionId,
        activity: row,
      }),
    );

  const map = new Map();
  [...morphoRows, ...derived].forEach((row, index) => {
    const key = String(first(row.id, `${row.deviceName}-${row.date}-${index}`));
    map.set(key, { ...(map.get(key) || {}), ...row });
  });
  return Array.from(map.values());
}

function recordMatches({ searchText, technician, status, kind, date }, filters) {
  const queryTokens = normalizeSearch(filters.search).split(" ").filter(Boolean);
  if (queryTokens.length && !queryTokens.every((token) => searchText.includes(token))) {
    return false;
  }
  if (
    filters.technician &&
    normalizeSearch(technician) !== normalizeSearch(filters.technician)
  ) {
    return false;
  }
  if (filters.status && statusText(status) !== statusText(filters.status)) {
    return false;
  }
  if (filters.taskKind && statusText(kind) !== statusText(filters.taskKind)) {
    return false;
  }

  const key = localDateKey(date);
  if (filters.from && (!key || key < filters.from)) return false;
  if (filters.to && (!key || key > filters.to)) return false;
  return true;
}

function Badge({ value }) {
  return <span className={`sa-badge ${statusTone(value)}`}>{statusText(value)}</span>;
}

function Icon({ name, size = 18 }) {
  const paths = {
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h11" /></>,
    refresh: <><path d="M20 6v6h-6" /><path d="M4 18v-6h6" /><path d="M18.5 9a7 7 0 0 0-12-3L4 9" /><path d="M5.5 15a7 7 0 0 0 12 3l2.5-3" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    task: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>,
    item: <><path d="m12 2 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    issue: <><path d="M10.3 3.4 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    activity: <><path d="M3 12h4l2-5 4 10 2-5h6" /></>,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    morpho: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6" /><path d="M9 11h6" /><circle cx="12" cy="16" r="1" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] || paths.task}
    </svg>
  );
}

function MetricCard({ icon, label, value, caption, tone = "blue", onClick }) {
  return (
    <button type="button" className={`sa-metric ${tone}`} onClick={onClick}>
      <span className="sa-metric-icon"><Icon name={icon} size={20} /></span>
      <span className="sa-metric-copy">
        <strong>{value}</strong>
        <b>{label}</b>
        <small>{caption}</small>
      </span>
    </button>
  );
}

function ProgressBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="sa-progress-wrap">
      <div className="sa-progress-track"><span style={{ width: `${safeValue}%` }} /></div>
      <b>{Math.round(safeValue)}%</b>
    </div>
  );
}

function EmptyTable({ message }) {
  return (
    <tr>
      <td colSpan="20" className="sa-empty-cell">
        <span><Icon name="search" size={25} /></span>
        <strong>{message}</strong>
        <small>غيّري الفلاتر أو اضغطي Refresh لتحميل أحدث بيانات الباك إند.</small>
      </td>
    </tr>
  );
}

function DetailsModal({ selected, onClose }) {
  if (!selected) return null;
  const { type, record } = selected;

  const renderTask = () => (
    <>
      <div className="sa-detail-grid">
        <Detail label="Task ID" value={record.id} />
        <Detail label="Title" value={record.title} />
        <Detail label="Task Kind" value={statusText(record.taskKind)} />
        <Detail label="Asset Type" value={statusText(record.assetType)} />
        <Detail label="Assigned Technician" value={personName(record.assignedTo)} />
        <Detail label="Created By" value={personName(record.createdBy)} />
        <Detail label="Status" value={statusText(record.status)} />
        <Detail label="Priority" value={statusText(record.priority)} />
        <Detail label="Scheduled" value={formatDateTime(record.scheduledDate)} />
        <Detail label="Due Date" value={formatDateTime(record.dueDate)} />
        <Detail label="Started" value={formatDateTime(record.startedAt)} />
        <Detail label="Completed" value={formatDateTime(record.completedAt)} />
        <Detail label="Total Items" value={record.totalItems} />
        <Detail label="Completed Items" value={record.completedItems} />
        <Detail label="Issue Items" value={record.issueItems} />
        <Detail label="Not Reachable" value={record.notReachableItems} />
        <Detail label="Remaining" value={record.remainingItems} />
        <Detail label="Admin Review" value={statusText(record.adminReview)} />
        <Detail label="Admin Note" value={record.adminNote} wide />
        <Detail label="Task Notes" value={record.notes} wide />
      </div>
      <SectionTitle title={`Task Items (${record.items.length})`} />
      <div className="sa-mini-list">
        {record.items.length ? record.items.map((item, index) => (
          <div className="sa-mini-row" key={item.id || index}>
            <span>{index + 1}</span>
            <div><strong>{assetName(item)}</strong><small>{safe(item.completionNote || item.notes)}</small></div>
            <Badge value={item.status} />
          </div>
        )) : <p className="sa-muted">No task items were returned.</p>}
      </div>
    </>
  );

  const renderItem = () => (
    <>
      <div className="sa-detail-grid">
        <Detail label="Task ID" value={record.taskId} />
        <Detail label="Task Item ID" value={record.id} />
        <Detail label="Task" value={record.taskTitle} />
        <Detail label="Task Kind" value={statusText(record.taskKind)} />
        <Detail label="Technician" value={personName(record.technician)} />
        <Detail label="Asset" value={record.assetName} />
        <Detail label="Location" value={record.location} wide />
        <Detail label="Item Status" value={statusText(record.status)} />
        <Detail label="Inspection Status" value={statusText(record.inspectionStatus)} />
        <Detail label="Issue Result" value={statusText(record.issueResult)} />
        <Detail label="Inspection ID" value={record.inspectionId} />
        <Detail label="Scanned Code" value={record.scannedCode} />
        <Detail label="Started" value={formatDateTime(record.startedAt)} />
        <Detail label="Inspected" value={formatDateTime(record.inspectedAt)} />
        <Detail label="Completed" value={formatDateTime(record.completedAt)} />
        <Detail label="GPS" value={record.gps} />
        <Detail label="Notes" value={record.notes} wide />
        <Detail label="Completion Note" value={record.completionNote} wide />
      </div>
      <SectionTitle title={`Problems (${record.issues.length})`} />
      {record.issues.length ? (
        <div className="sa-mini-list">
          {record.issues.map((issue, index) => (
            <div className="sa-mini-row" key={issue.id || index}>
              <span>{index + 1}</span>
              <div><strong>{issue.title}</strong><small>{safe(first(issue.notes, issue.unresolvedReason))}</small></div>
              <Badge value={issue.status} />
            </div>
          ))}
        </div>
      ) : <p className="sa-muted">No problem was linked to this item.</p>}

      <SectionTitle title={`Completed / Recorded Solution Steps (${record.steps.length})`} />
      {record.steps.length ? (
        <div className="sa-mini-list">
          {record.steps.map((step, index) => (
            <div className="sa-mini-row" key={step.id || index}>
              <span>{index + 1}</span>
              <div><strong>{step.title}</strong><small>{safe(first(step.note, step.doneAt && formatDateTime(step.doneAt)))}</small></div>
              <Badge value={step.status} />
            </div>
          ))}
        </div>
      ) : <p className="sa-muted">The backend did not return any completed solution steps.</p>}
    </>
  );

  const renderTicket = () => (
    <>
      <div className="sa-detail-grid">
        <Detail label="Ticket ID" value={record.id} />
        <Detail label="Type" value={statusText(record.type)} />
        <Detail label="Title" value={record.title} wide />
        <Detail label="Location" value={record.locationText} wide />
        <Detail label="Buildings" value={record.locationBuildings.join(" · ")} wide />
        <Detail label="Priority" value={statusText(record.priority)} />
        <Detail label="Status" value={statusText(record.status)} />
        <Detail label="Created By" value={personName(record.createdBy)} />
        <Detail label="Assigned To" value={personName(record.assignedTo)} />
        <Detail label="Resolved By" value={personName(record.resolvedBy)} />
        <Detail label="Problem Date" value={formatDateTime(record.problemDate)} />
        <Detail label="Started At" value={formatDateTime(record.startedAt)} />
        <Detail label="Resolved At" value={formatDateTime(record.resolvedAt)} />
        <Detail label="Status Date" value={formatDateTime(record.statusDate)} />
        <Detail label="Problem Description" value={record.description} wide />
        <Detail label="Solution Summary" value={record.solutionText} wide />
        <Detail label="Final Result" value={record.resultNotes} wide />
      </div>
      <SectionTitle title={`Resolution Steps (${record.steps.length})`} />
      {record.steps.length ? (
        <div className="sa-mini-list">
          {record.steps.map((step, index) => (
            <div className="sa-mini-row" key={`${step}-${index}`}>
              <span>{index + 1}</span><div><strong>{step}</strong></div><Badge value="DONE" />
            </div>
          ))}
        </div>
      ) : <p className="sa-muted">No resolution steps saved.</p>}
    </>
  );

  const renderIssue = () => renderTicket();

  const renderActivity = () => (
    <div className="sa-detail-grid">
      <Detail label="Activity ID" value={record.id} />
      <Detail label="Technician" value={personName(record.user)} />
      <Detail label="Action" value={statusText(record.action)} />
      <Detail label="Date" value={formatDateTime(record.date)} />
      <Detail label="Title" value={record.title} wide />
      <Detail label="Message" value={record.message} wide />
      <Detail label="Before Status" value={statusText(record.beforeStatus)} />
      <Detail label="After Status" value={statusText(record.afterStatus)} />
      <Detail label="Task ID" value={record.taskId} />
      <Detail label="Task Item ID" value={record.taskItemId} />
      <Detail label="Inspection ID" value={record.inspectionId} />
      <Detail label="Device ID" value={record.deviceId} />
      <Detail label="Morpho Repair ID" value={record.morphoRepairId} />
      <Detail label="Location" value={record.locationText} wide />
    </div>
  );

  const renderMorpho = () => (
    <div className="sa-detail-grid">
      <Detail label="Morpho Repair ID" value={record.id} />
      <Detail label="Device" value={record.deviceName} />
      <Detail label="Technician" value={personName(record.technician)} />
      <Detail label="Status" value={statusText(record.status)} />
      <Detail label="Old Status" value={statusText(record.oldStatus)} />
      <Detail label="New Status" value={statusText(record.newStatus)} />
      <Detail label="Source" value={record.source} />
      <Detail label="Date" value={formatDateTime(record.date)} />
      <Detail label="Task Item ID" value={record.taskItemId} />
      <Detail label="Inspection ID" value={record.inspectionId} />
      <Detail label="Notes" value={record.notes} wide />
      <Detail label="Proof Image" value={record.proofImageUrl} wide />
    </div>
  );

  const titleMap = {
    TASK: `Global Task #${record.id}`,
    ITEM: `Task Item #${record.id}`,
    TICKET: `Problem Ticket #${record.id}`,
    ISSUE: `Issue #${record.id}`,
    ACTIVITY: `Activity #${record.id}`,
    MORPHO: `Morpho Repair #${record.id}`,
  };

  return (
    <div className="sa-modal-backdrop" onMouseDown={onClose}>
      <section className="sa-modal" onMouseDown={(event) => event.stopPropagation()}>
        <header className="sa-modal-head">
          <div>
            <span>COMPLETE BACKEND DETAILS</span>
            <h2>{titleMap[type] || "Details"}</h2>
          </div>
          <button type="button" onClick={onClose}><Icon name="close" size={20} /></button>
        </header>
        <div className="sa-modal-body">
          {type === "TASK" && renderTask()}
          {type === "ITEM" && renderItem()}
          {type === "TICKET" && renderTicket()}
          {type === "ISSUE" && renderIssue()}
          {type === "ACTIVITY" && renderActivity()}
          {type === "MORPHO" && renderMorpho()}
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value, wide = false }) {
  return (
    <div className={`sa-detail ${wide ? "wide" : ""}`}>
      <span>{label}</span>
      <strong>{safe(value)}</strong>
    </div>
  );
}

function SectionTitle({ title }) {
  return <h3 className="sa-section-title">{title}</h3>;
}

function exportWorkbook({ tasks, items, tickets, issues, activity, morpho }) {
  const workbook = XLSX.utils.book_new();

  const addSheet = (name, rows) => {
    const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Message: "No matching records" }]);
    sheet["!cols"] = Object.keys(rows[0] || { Message: "" }).map(() => ({ wch: 22 }));
    XLSX.utils.book_append_sheet(workbook, sheet, name.slice(0, 31));
  };

  addSheet("Global Tasks", tasks.map((task) => ({
    "Task ID": task.id,
    Title: task.title,
    "Task Kind": statusText(task.taskKind),
    "Asset Type": statusText(task.assetType),
    Technician: personName(task.assignedTo),
    "Created By": personName(task.createdBy),
    Status: statusText(task.status),
    Priority: statusText(task.priority),
    Scheduled: formatDateTime(task.scheduledDate),
    Due: formatDateTime(task.dueDate),
    Started: formatDateTime(task.startedAt),
    Completed: formatDateTime(task.completedAt),
    "Total Items": task.totalItems,
    "Completed Items": task.completedItems,
    "Issue Items": task.issueItems,
    "Not Reachable": task.notReachableItems,
    Remaining: task.remainingItems,
    "Progress %": Math.round(task.progressPercent || 0),
    "Admin Review": statusText(task.adminReview),
    "Admin Note": safe(task.adminNote, ""),
    Notes: safe(task.notes, ""),
  })));

  addSheet("Task Items", items.map((item) => ({
    "Task ID": item.taskId,
    "Task Item ID": item.id,
    Task: item.taskTitle,
    "Task Kind": statusText(item.taskKind),
    Technician: personName(item.technician),
    Asset: item.assetName,
    Location: item.location,
    "Item Status": statusText(item.status),
    "Inspection Status": statusText(item.inspectionStatus),
    "Issue Result": statusText(item.issueResult),
    "Inspection ID": item.inspectionId,
    "Problems Count": item.issues.length,
    Problems: item.issues.map((issue) => `${issue.title} [${statusText(issue.status)}]`).join(" | "),
    "Steps Count": item.steps.length,
    "Completed Steps": item.steps.map((step) => `${step.title} [${statusText(step.status)}]`).join(" | "),
    Started: formatDateTime(item.startedAt),
    Inspected: formatDateTime(item.inspectedAt),
    Completed: formatDateTime(item.completedAt),
    Notes: safe(item.notes, ""),
    "Completion Note": safe(item.completionNote, ""),
    GPS: safe(item.gps, ""),
  })));

  addSheet("Problem Tickets", tickets.map((ticket) => ({
    "Ticket ID": ticket.id,
    Type: statusText(ticket.type),
    Title: ticket.title,
    Location: ticket.locationText,
    Buildings: ticket.locationBuildings.join(" | "),
    Description: ticket.description,
    Priority: statusText(ticket.priority),
    Status: statusText(ticket.status),
    "Created By": personName(ticket.createdBy),
    "Assigned To": personName(ticket.assignedTo),
    "Resolved By": personName(ticket.resolvedBy),
    "Problem Date": formatDateTime(ticket.problemDate),
    "Started At": formatDateTime(ticket.startedAt),
    "Resolved At": formatDateTime(ticket.resolvedAt),
    "Solution Summary": safe(ticket.solutionText, ""),
    "Resolution Steps": ticket.steps.join(" | "),
    "Final Result": safe(ticket.resultNotes, ""),
  })));

  addSheet("Issues", issues.map((issue) => ({
    "Issue / Ticket ID": issue.id,
    Type: statusText(issue.type),
    Title: issue.title,
    Location: issue.locationText,
    Buildings: issue.locationBuildings.join(" | "),
    Description: issue.description,
    Priority: statusText(issue.priority),
    Status: statusText(issue.status),
    "Created By": personName(issue.createdBy),
    "Assigned To": personName(issue.assignedTo),
    "Resolved By": personName(issue.resolvedBy),
    "Problem Date": formatDateTime(issue.problemDate),
    "Started At": formatDateTime(issue.startedAt),
    "Resolved At": formatDateTime(issue.resolvedAt),
    "Status Date": formatDateTime(issue.statusDate),
    "Solution Summary": safe(issue.solutionText, ""),
    "Resolution Steps": issue.steps.join(" | "),
    "Final Result": safe(issue.resultNotes, ""),
  })));

  addSheet("Activity", activity.map((row) => ({
    "Activity ID": row.id,
    Date: formatDateTime(row.date),
    Technician: personName(row.user),
    Action: statusText(row.action),
    Title: row.title,
    Message: row.message,
    "Before Status": statusText(row.beforeStatus),
    "After Status": statusText(row.afterStatus),
    "Task ID": row.taskId,
    "Task Item ID": row.taskItemId,
    "Inspection ID": row.inspectionId,
    "Device ID": row.deviceId,
    Location: safe(row.locationText, ""),
  })));

  addSheet("Morpho", morpho.map((row) => ({
    "Repair ID": row.id,
    Date: formatDateTime(row.date),
    Device: row.deviceName,
    Technician: personName(row.technician),
    Status: statusText(row.status),
    "Old Status": statusText(row.oldStatus),
    "New Status": statusText(row.newStatus),
    Source: row.source,
    Notes: safe(row.notes, ""),
    "Task Item ID": row.taskItemId,
    "Inspection ID": row.inspectionId,
    "Proof Image": safe(row.proofImageUrl, ""),
  })));

  XLSX.writeFile(
    workbook,
    `SmartIT_Software_Admin_${localDateKey(new Date())}.xlsx`,
  );
}

export default function SoftwareAdminPage({ onBack, currentUser }) {
  const [loading, setLoading] = useState(true);
  const [loadStage, setLoadStage] = useState("");
  const [error, setError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [activity, setActivity] = useState([]);
  const [morpho, setMorpho] = useState([]);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("OVERVIEW");
  const [filters, setFilters] = useState({
    search: "",
    technician: "",
    status: "",
    taskKind: "",
    from: "",
    to: "",
  });

  const deferredSearch = useDeferredValue(filters.search);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoadStage("Connecting to the administration data...");

    try {
      const [taskRows, ticketRows, activityRows, issueRows] =
        await Promise.all([
          loadFirstAvailable(ENDPOINTS.tasks, setLoadStage),
          loadFirstAvailable(ENDPOINTS.tickets, setLoadStage, true),
          loadFirstAvailable(ENDPOINTS.activity, setLoadStage, true),
          loadFirstAvailable(ENDPOINTS.issues, setLoadStage, true),
        ]);

      // Railway currently has no public list endpoints for Morpho repairs or
      // IssueSolution records. Morpho rows are still derived from activity logs,
      // and ticket resolution steps come directly from /issues/tickets.
      const morphoRows = [];
      const solutionRows = [];

      setLoadStage(`Loading full details for ${taskRows.length} task(s)...`);
      let completed = 0;
      const detailedTasks = await poolMap(
        taskRows,
        REQUEST_CONCURRENCY,
        async (task) => {
          const detail = await loadTaskDetail(task);
          completed += 1;
          if (completed === taskRows.length || completed % 5 === 0) {
            setLoadStage(`Loading task details: ${completed} / ${taskRows.length}`);
          }
          return detail;
        },
      );

      const issueMap = new Map(
        issueRows.map((issue) => [String(issue.id), issue]),
      );
      const solutionMap = new Map(
        solutionRows.map((solution) => [String(solution.id), solution]),
      );

      const normalizedTasks = detailedTasks
        .map(normalizeTask)
        .sort(
          (a, b) =>
            (toDate(b.scheduledDate)?.getTime() || 0) -
            (toDate(a.scheduledDate)?.getTime() || 0),
        );

      normalizedTasks.forEach((task) => {
        task.items = asArray(task.items).map((item) =>
          normalizeTaskItem(item, task, issueMap, solutionMap),
        );
      });

      const normalizedTickets = ticketRows
        .map(normalizeTicket)
        .sort(
          (a, b) =>
            (toDate(b.problemDate)?.getTime() || 0) -
            (toDate(a.problemDate)?.getTime() || 0),
        );
      // The visible ISSUES section must show the complete Problem Ticket register.
      // /issues is still loaded only as the issue catalog used to enrich task items.
      const normalizedIssues = normalizedTickets;
      const normalizedActivity = activityRows
        .map(normalizeActivity)
        .sort(
          (a, b) =>
            (toDate(b.date)?.getTime() || 0) -
            (toDate(a.date)?.getTime() || 0),
        );
      const normalizedMorpho = mergeMorphoWithActivity(
        morphoRows.map(normalizeMorpho),
        normalizedActivity,
      ).sort(
        (a, b) =>
          (toDate(b.date)?.getTime() || 0) -
          (toDate(a.date)?.getTime() || 0),
      );

      setTasks(normalizedTasks);
      setTickets(normalizedTickets);
      setIssues(normalizedIssues);
      setActivity(normalizedActivity);
      setMorpho(normalizedMorpho);
    } catch (loadError) {
      setError(loadError.message || "Failed to load the software administration page.");
    } finally {
      setLoadStage("");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const items = useMemo(
    () => tasks.flatMap((task) => task.items || []),
    [tasks],
  );

  const filterState = useMemo(
    () => ({ ...filters, search: deferredSearch }),
    [filters, deferredSearch],
  );

  const technicians = useMemo(() => {
    const names = [
      ...tasks.map((task) => personName(task.assignedTo)),
      ...items.map((item) => personName(item.technician)),
      ...tickets.flatMap((ticket) => [
        personName(ticket.assignedTo),
        personName(ticket.resolvedBy),
      ]),
      ...issues.flatMap((issue) => [
        personName(issue.createdBy),
        personName(issue.assignedTo),
        personName(issue.resolvedBy),
      ]),
      ...activity.map((row) => personName(row.user)),
      ...morpho.map((row) => personName(row.technician)),
    ].filter((name) => name && name !== "—");

    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "en"));
  }, [tasks, items, tickets, issues, activity, morpho]);

  const taskKinds = useMemo(
    () => [...new Set(tasks.map((task) => statusText(task.taskKind)))].sort(),
    [tasks],
  );

  const statuses = useMemo(() => {
    const values = [
      ...tasks.map((row) => row.status),
      ...items.flatMap((row) => [row.status, row.inspectionStatus, row.issueResult]),
      ...tickets.map((row) => row.status),
      ...issues.map((row) => row.status),
      ...activity.map((row) => row.action),
      ...morpho.map((row) => row.status),
    ];
    return [...new Set(values.filter(Boolean).map(statusText))].sort();
  }, [tasks, items, tickets, issues, activity, morpho]);

  const filteredTasks = useMemo(
    () =>
      tasks.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: personName(row.assignedTo),
            status: row.status,
            kind: row.taskKind,
            date: row.scheduledDate,
          },
          filterState,
        ),
      ),
    [tasks, filterState],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: personName(row.technician),
            status: first(row.issueResult, row.status),
            kind: row.taskKind,
            date: first(row.completedAt, row.inspectedAt, row.startedAt),
          },
          filterState,
        ),
      ),
    [items, filterState],
  );

  const filteredTickets = useMemo(
    () =>
      tickets.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: first(
              personName(row.resolvedBy, ""),
              personName(row.assignedTo, ""),
              personName(row.createdBy, ""),
            ),
            status: row.status,
            kind: "",
            date: row.problemDate,
          },
          { ...filterState, taskKind: "" },
        ),
      ),
    [tickets, filterState],
  );

  const filteredIssues = useMemo(
    () =>
      issues.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: first(
              personName(row.resolvedBy, ""),
              personName(row.assignedTo, ""),
              personName(row.createdBy, ""),
            ),
            status: row.status,
            kind: "",
            date: row.problemDate,
          },
          { ...filterState, taskKind: "" },
        ),
      ),
    [issues, filterState],
  );

  const filteredActivity = useMemo(
    () =>
      activity.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: personName(row.user),
            status: row.action,
            kind: "",
            date: row.date,
          },
          { ...filterState, taskKind: "" },
        ),
      ),
    [activity, filterState],
  );

  const filteredMorpho = useMemo(
    () =>
      morpho.filter((row) =>
        recordMatches(
          {
            searchText: row.searchText,
            technician: personName(row.technician),
            status: row.status,
            kind: "",
            date: row.date,
          },
          { ...filterState, taskKind: "" },
        ),
      ),
    [morpho, filterState],
  );

  const overviewRows = useMemo(() => {
    const rows = [
      ...filteredTasks.map((row) => ({
        source: "GLOBAL TASK",
        type: "TASK",
        record: row,
        date: row.scheduledDate,
        technician: personName(row.assignedTo),
        title: row.title,
        status: row.status,
        details: `${statusText(row.taskKind)} · ${row.completedItems}/${row.totalItems} completed`,
      })),
      ...filteredItems.map((row) => ({
        source: "TASK ITEM",
        type: "ITEM",
        record: row,
        date: first(row.completedAt, row.inspectedAt, row.startedAt),
        technician: personName(row.technician),
        title: `${row.assetName} · ${row.taskTitle}`,
        status: row.issueResult,
        details: `${row.issues.length} problem(s) · ${row.steps.length} step(s)`,
      })),
      ...filteredTickets.map((row) => ({
        source: "PROBLEM TICKET",
        type: "TICKET",
        record: row,
        date: row.problemDate,
        technician: first(personName(row.resolvedBy, ""), personName(row.assignedTo)),
        title: row.title,
        status: row.status,
        details: `${statusText(row.priority)} · ${row.locationText}`,
      })),
      ...filteredActivity.map((row) => ({
        source: "ACTIVITY",
        type: "ACTIVITY",
        record: row,
        date: row.date,
        technician: personName(row.user),
        title: row.title,
        status: row.action,
        details: row.message,
      })),
      ...filteredMorpho.map((row) => ({
        source: "MORPHO",
        type: "MORPHO",
        record: row,
        date: row.date,
        technician: personName(row.technician),
        title: row.deviceName,
        status: row.status,
        details: `${statusText(row.oldStatus)} → ${statusText(row.newStatus)} · ${safe(row.notes)}`,
      })),
    ];

    return rows.sort(
      (a, b) =>
        (toDate(b.date)?.getTime() || 0) -
        (toDate(a.date)?.getTime() || 0),
    );
  }, [filteredTasks, filteredItems, filteredTickets, filteredActivity, filteredMorpho]);

  const metrics = useMemo(() => ({
    globalTasks: tasks.filter(
      (task) => statusText(task.taskKind) === "GLOBAL ROUTE",
    ).length,
    taskItems: items.length,
    doneItems: items.filter((item) => statusTone(item.status) === "good").length,
    unresolvedItems: items.filter((item) => item.issueResult === "UNRESOLVED").length,
    pendingItems: items.filter((item) => item.issueResult === "PENDING").length,
    openTickets: tickets.filter((ticket) => statusText(ticket.status) !== "RESOLVED").length,
    resolvedTickets: tickets.filter((ticket) => statusText(ticket.status) === "RESOLVED").length,
    issues: issues.length,
    morphoRepairs: morpho.length,
  }), [tasks, items, tickets, issues, morpho]);

  const mohamedNames = useMemo(
    () =>
      technicians.filter((name) => {
        const normalized = normalizeSearch(name);
        return (
          normalized.includes("mohamed farag") ||
          normalized.includes("mohammad farag") ||
          normalized.includes("محمد فرج")
        );
      }),
    [technicians],
  );

  const mohamedStats = useMemo(() => {
    const names = new Set(mohamedNames.map(normalizeSearch));
    const matches = (name) => names.has(normalizeSearch(name));
    const ownItems = items.filter((row) => matches(personName(row.technician)));
    const ownTickets = tickets.filter((row) =>
      matches(first(personName(row.resolvedBy, ""), personName(row.assignedTo, ""))),
    );
    const ownActivity = activity.filter((row) => matches(personName(row.user)));
    return {
      items: ownItems.length,
      done: ownItems.filter((row) => row.issueResult === "RESOLVED").length,
      unresolved: ownItems.filter((row) => row.issueResult === "UNRESOLVED").length,
      steps: ownItems.reduce((sum, row) => sum + row.steps.length, 0),
      ticketsResolved: ownTickets.filter((row) => statusText(row.status) === "RESOLVED").length,
      lastActivity: ownActivity[0]?.date || "",
    };
  }, [mohamedNames, items, tickets, activity]);

  const clearFilters = () =>
    setFilters({
      search: "",
      technician: "",
      status: "",
      taskKind: "",
      from: "",
      to: "",
    });

  const exportCurrentData = () =>
    exportWorkbook({
      tasks: filteredTasks,
      items: filteredItems,
      tickets: filteredTickets,
      issues: filteredIssues,
      activity: filteredActivity,
      morpho: filteredMorpho,
    });

  const tabCounts = {
    OVERVIEW: overviewRows.length,
    TASKS: filteredTasks.length,
    ITEMS: filteredItems.length,
    TICKETS: filteredTickets.length,
    ISSUES: filteredIssues.length,
    ACTIVITY: filteredActivity.length,
    MORPHO: filteredMorpho.length,
  };

  return (
    <main className="software-admin-page">
      <style>{adminStyles}</style>

      <div className="sa-shell">
        <header className="sa-hero">
          <div className="sa-hero-main">
            {onBack ? (
              <button type="button" className="sa-back" onClick={onBack}>
                <Icon name="back" size={18} />
              </button>
            ) : null}
            <div>
              <span className="sa-kicker">SMART IT · ADMIN MONITORING</span>
              <h1>Software Administration Center</h1>
              <p>
                متابعة كل Global Tasks، ما تم وما لم يتم، المشاكل، خطوات الحل،
                Problem Tickets، نشاط محمد فرج وباقي الفنيين، وسجل Morpho.
              </p>
            </div>
          </div>

          <div className="sa-hero-actions">
            <button type="button" className="sa-button light" onClick={exportCurrentData} disabled={loading}>
              <Icon name="download" size={17} /> Export All Tables
            </button>
            <button type="button" className="sa-button primary" onClick={loadAll} disabled={loading}>
              <Icon name="refresh" size={17} /> {loading ? "Loading..." : "Refresh Backend"}
            </button>
          </div>
        </header>

        {error ? <div className="sa-alert error">{error}</div> : null}
        {loading ? (
          <div className="sa-alert info">
            <span className="sa-spinner" /> {loadStage || "Loading all backend records..."}
          </div>
        ) : (
          <div className="sa-alert success">
            Loaded {tasks.length} task(s), {items.length} task item(s), {tickets.length} problem ticket(s), {issues.length} complete issue record(s), {activity.length} activity row(s) and {morpho.length} Morpho record(s). The ISSUES section uses the full Railway /issues/tickets register with no visible page limit.
          </div>
        )}

        <section className="sa-metrics">
          <MetricCard icon="task" label="Global Tasks" value={metrics.globalTasks} caption={`${tasks.length} total task records`} tone="violet" onClick={() => setTab("TASKS")} />
          <MetricCard icon="item" label="Assigned Items" value={metrics.taskItems} caption="All devices and assets" tone="blue" onClick={() => setTab("ITEMS")} />
          <MetricCard icon="check" label="Completed" value={metrics.doneItems} caption="Finished task items" tone="green" onClick={() => { setTab("ITEMS"); setFilters((old) => ({ ...old, status: "RESOLVED" })); }} />
          <MetricCard icon="issue" label="Unresolved" value={metrics.unresolvedItems} caption="Problem still exists" tone="red" onClick={() => { setTab("ITEMS"); setFilters((old) => ({ ...old, status: "UNRESOLVED" })); }} />
          <MetricCard icon="clock" label="Pending" value={metrics.pendingItems} caption="Waiting or in progress" tone="orange" onClick={() => { setTab("ITEMS"); setFilters((old) => ({ ...old, status: "PENDING" })); }} />
          <MetricCard icon="issue" label="Open Tickets" value={metrics.openTickets} caption="Open or in progress" tone="pink" onClick={() => setTab("TICKETS")} />
          <MetricCard icon="check" label="Resolved Tickets" value={metrics.resolvedTickets} caption="Closed with solution" tone="teal" onClick={() => setTab("TICKETS")} />
          <MetricCard icon="issue" label="Issues" value={metrics.issues} caption="Complete Railway ticket register" tone="red" onClick={() => setTab("ISSUES")} />
          <MetricCard icon="morpho" label="Morpho Records" value={metrics.morphoRepairs} caption="Repairs and review history" tone="navy" onClick={() => setTab("MORPHO")} />
        </section>

        <section className="sa-spotlight">
          <div className="sa-spotlight-title">
            <span><Icon name="user" size={20} /></span>
            <div>
              <b>Mohamed Farag Spotlight</b>
              <small>
                {mohamedNames.length
                  ? `Backend name: ${mohamedNames.join(" · ")}`
                  : "The card will populate automatically when Mohamed Farag appears in the backend records."}
              </small>
            </div>
          </div>

          <div className="sa-spotlight-stats">
            <div><strong>{mohamedStats.items}</strong><span>Task Items</span></div>
            <div><strong>{mohamedStats.done}</strong><span>Solved / Done</span></div>
            <div><strong>{mohamedStats.unresolved}</strong><span>Not Solved</span></div>
            <div><strong>{mohamedStats.steps}</strong><span>Recorded Steps</span></div>
            <div><strong>{mohamedStats.ticketsResolved}</strong><span>Resolved Tickets</span></div>
            <div><strong>{formatDateTime(mohamedStats.lastActivity)}</strong><span>Last Activity</span></div>
          </div>

          <button
            type="button"
            className="sa-button soft"
            disabled={!mohamedNames.length}
            onClick={() => setFilters((old) => ({ ...old, technician: mohamedNames[0] }))}
          >
            Show Mohamed Farag Only
          </button>
        </section>

        <section className="sa-filter-panel">
          <div className="sa-filter-title">
            <div><Icon name="filter" size={18} /><span>Precise Filters</span></div>
            <button type="button" onClick={clearFilters}>Clear All</button>
          </div>

          <div className="sa-filter-grid">
            <label className="sa-field search">
              <span>Search Everything</span>
              <div><Icon name="search" size={17} /><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Task, technician, device, problem, step, location..." /></div>
            </label>

            <label className="sa-field">
              <span>Technician</span>
              <select value={filters.technician} onChange={(event) => setFilters({ ...filters, technician: event.target.value })}>
                <option value="">All Technicians</option>
                {technicians.map((name) => <option key={name}>{name}</option>)}
              </select>
            </label>

            <label className="sa-field">
              <span>Status / Result</span>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">All Statuses</option>
                {statuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>

            <label className="sa-field">
              <span>Task Kind</span>
              <select value={filters.taskKind} onChange={(event) => setFilters({ ...filters, taskKind: event.target.value })}>
                <option value="">All Task Kinds</option>
                {taskKinds.map((kind) => <option key={kind}>{kind}</option>)}
              </select>
            </label>

            <label className="sa-field">
              <span>Date From</span>
              <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
            </label>

            <label className="sa-field">
              <span>Date To</span>
              <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
            </label>
          </div>
        </section>

        <nav className="sa-tabs">
          {[
            ["OVERVIEW", "Complete Timeline"],
            ["TASKS", "Tasks / Global Tasks"],
            ["ITEMS", "Task Items & Problems"],
            ["TICKETS", "Problem Tickets"],
            ["ISSUES", "Issues"],
            ["ACTIVITY", "Technician Activity"],
            ["MORPHO", "Morpho History"],
          ].map(([value, label]) => (
            <button type="button" key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>
              <span>{label}</span><b>{tabCounts[value]}</b>
            </button>
          ))}
        </nav>

        <section className="sa-table-panel">
          <div className="sa-table-head">
            <div>
              <span className="sa-kicker">COMPLETE BACKEND TABLE</span>
              <h2>{
                tab === "OVERVIEW" ? "Complete Operational Timeline" :
                tab === "TASKS" ? "Tasks and Global Tasks" :
                tab === "ITEMS" ? "Task Items, Problems and Completed Steps" :
                tab === "TICKETS" ? "Software Problem Tickets" :
                tab === "ISSUES" ? "All Issues — Complete 209 Records" :
                tab === "ACTIVITY" ? "Technician Activity History" :
                "Morpho Repair History"
              }</h2>
            </div>
            <span className="sa-count-pill">{tabCounts[tab]} row(s) · all displayed</span>
          </div>

          <div className="sa-table-wrap">
            {tab === "OVERVIEW" && (
              <table>
                <thead><tr><th>Date / Time</th><th>Source</th><th>Technician</th><th>Title</th><th>Status</th><th>Details</th><th>Action</th></tr></thead>
                <tbody>
                  {!overviewRows.length ? <EmptyTable message="No matching operational rows" /> : overviewRows.map((row, index) => (
                    <tr key={`${row.source}-${row.record.id}-${index}`}>
                      <td className="sa-date"><strong>{formatDate(row.date)}</strong><small>{formatDateTime(row.date)}</small></td>
                      <td><span className="sa-source">{row.source}</span></td>
                      <td><strong>{row.technician}</strong></td>
                      <td className="sa-title-cell"><strong>{row.title}</strong></td>
                      <td><Badge value={row.status} /></td>
                      <td className="sa-wrap-text">{row.details}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: row.type, record: row.record })}><Icon name="eye" size={15} /> Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "TASKS" && (
              <table>
                <thead><tr><th>Task</th><th>Kind / Asset</th><th>Technician</th><th>Scheduled</th><th>Status</th><th>Progress</th><th>Done / Issues / Remaining</th><th>Admin Review</th><th>Created By</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredTasks.length ? <EmptyTable message="No matching tasks" /> : filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="sa-title-cell"><strong>#{task.id} · {task.title}</strong><small>{safe(task.notes)}</small></td>
                      <td><b>{statusText(task.taskKind)}</b><small className="sa-block-small">{statusText(task.assetType)}</small></td>
                      <td><strong>{personName(task.assignedTo)}</strong><small className="sa-block-small">ID #{safe(task.assignedTo?.id)}</small></td>
                      <td className="sa-date"><strong>{formatDate(task.scheduledDate)}</strong><small>{formatDateTime(task.scheduledDate)}</small></td>
                      <td><Badge value={task.status} /></td>
                      <td><ProgressBar value={task.progressPercent} /></td>
                      <td><div className="sa-number-line"><span className="good">{task.completedItems} done</span><span className="bad">{task.issueItems} issues</span><span>{task.remainingItems} remaining</span></div></td>
                      <td><Badge value={task.adminReview} /><small className="sa-block-small">{safe(task.adminNote)}</small></td>
                      <td>{personName(task.createdBy)}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "TASK", record: task })}><Icon name="eye" size={15} /> Full Task</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "ITEMS" && (
              <table>
                <thead><tr><th>Task / Item</th><th>Technician</th><th>Device / Asset</th><th>Location</th><th>Item Status</th><th>Problem Result</th><th>Problems</th><th>Completed Steps</th><th>Completion Time</th><th>Notes</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredItems.length ? <EmptyTable message="No matching task items" /> : filteredItems.map((item) => (
                    <tr key={`${item.taskId}-${item.id}`}>
                      <td className="sa-title-cell"><strong>Task #{item.taskId} · Item #{item.id}</strong><small>{item.taskTitle}</small></td>
                      <td><strong>{personName(item.technician)}</strong><small className="sa-block-small">ID #{safe(item.technician?.id)}</small></td>
                      <td><strong>{item.assetName}</strong><small className="sa-block-small">Inspection #{safe(item.inspectionId)}</small></td>
                      <td className="sa-wrap-text">{item.location}</td>
                      <td><Badge value={item.status} /><small className="sa-block-small">Inspection: {statusText(item.inspectionStatus)}</small></td>
                      <td><Badge value={item.issueResult} /></td>
                      <td><strong>{item.issues.length}</strong><small className="sa-block-small">{item.issues.map((issue) => issue.title).join(" · ") || "No problem"}</small></td>
                      <td><strong>{item.steps.length}</strong><small className="sa-block-small">{item.steps.map((step) => step.title).join(" · ") || "No recorded steps"}</small></td>
                      <td className="sa-date"><strong>{formatDate(item.completedAt)}</strong><small>{formatDateTime(item.completedAt)}</small></td>
                      <td className="sa-wrap-text">{safe(first(item.completionNote, item.notes))}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "ITEM", record: item })}><Icon name="eye" size={15} /> Problems & Steps</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "TICKETS" && (
              <table>
                <thead><tr><th>Ticket</th><th>Type</th><th>Location</th><th>Priority</th><th>Status</th><th>Created / Assigned / Resolved By</th><th>Dates</th><th>Solution</th><th>Steps</th><th>Final Result</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredTickets.length ? <EmptyTable message="No matching problem tickets" /> : filteredTickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="sa-title-cell"><strong>#{ticket.id} · {ticket.title}</strong><small>{ticket.description}</small></td>
                      <td><span className="sa-source">{statusText(ticket.type)}</span></td>
                      <td className="sa-wrap-text">{ticket.locationText}</td>
                      <td><Badge value={ticket.priority} /></td>
                      <td><Badge value={ticket.status} /></td>
                      <td className="sa-people"><span>Created: <b>{personName(ticket.createdBy)}</b></span><span>Assigned: <b>{personName(ticket.assignedTo)}</b></span><span>Resolved: <b>{personName(ticket.resolvedBy)}</b></span></td>
                      <td className="sa-people"><span>Problem: <b>{formatDateTime(ticket.problemDate)}</b></span><span>Started: <b>{formatDateTime(ticket.startedAt)}</b></span><span>Resolved: <b>{formatDateTime(ticket.resolvedAt)}</b></span></td>
                      <td className="sa-wrap-text">{safe(ticket.solutionText)}</td>
                      <td><strong>{ticket.steps.length}</strong><small className="sa-block-small">{ticket.steps.join(" · ") || "No steps"}</small></td>
                      <td className="sa-wrap-text">{safe(ticket.resultNotes)}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "TICKET", record: ticket })}><Icon name="eye" size={15} /> Full Ticket</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "ISSUES" && (
              <table className="sa-issues-table">
                <thead><tr><th>Issue</th><th>Location</th><th>People</th><th>Status</th><th>Dates</th><th>Summary</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredIssues.length ? <EmptyTable message="No matching issues from the Railway ticket register" /> : filteredIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="sa-title-cell">
                        <strong>#{issue.id} · {issue.title}</strong>
                        <small className="sa-block-small">{statusText(issue.type)} · Priority: {statusText(issue.priority)}</small>
                      </td>
                      <td className="sa-wrap-text">
                        <strong>{issue.locationText || "—"}</strong>
                        <small className="sa-block-small sa-clamp-2">{issue.locationBuildings.join(" · ") || "No building list"}</small>
                      </td>
                      <td className="sa-people">
                        <span>Created: <b>{personName(issue.createdBy)}</b></span>
                        <span>Assigned: <b>{personName(issue.assignedTo)}</b></span>
                        <span>Resolved: <b>{personName(issue.resolvedBy)}</b></span>
                      </td>
                      <td>
                        <div className="sa-status-stack">
                          <Badge value={issue.status} />
                          <Badge value={issue.priority} />
                        </div>
                        <small className={`sa-state-note ${statusTone(issue.status)}`}>{statusCaption(issue.status)}</small>
                      </td>
                      <td className="sa-people">
                        <span>Problem: <b>{formatDateTime(issue.problemDate)}</b></span>
                        <span>Started: <b>{formatDateTime(issue.startedAt)}</b></span>
                        <span>Resolved: <b>{formatDateTime(issue.resolvedAt)}</b></span>
                      </td>
                      <td className="sa-summary-cell">
                        <div className="sa-summary-block">
                          <label>Problem</label>
                          <p className="sa-clamp-2">{issue.description || "—"}</p>
                        </div>
                        <div className="sa-summary-block">
                          <label>Solution</label>
                          <p className="sa-clamp-2">{safe(issue.solutionText)}</p>
                        </div>
                        <div className="sa-summary-inline">
                          <span><b>Steps:</b> {issue.steps.length}</span>
                          <span><b>Result:</b> {safe(issue.resultNotes)}</span>
                        </div>
                      </td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "ISSUE", record: issue })}><Icon name="eye" size={15} /> Full Issue</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "ACTIVITY" && (
              <table>
                <thead><tr><th>Date / Time</th><th>Technician</th><th>Action</th><th>Title</th><th>Message</th><th>Before → After</th><th>Linked Records</th><th>Location</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredActivity.length ? <EmptyTable message="No matching technician activity" /> : filteredActivity.map((row, index) => (
                    <tr key={row.id || index}>
                      <td className="sa-date"><strong>{formatDate(row.date)}</strong><small>{formatDateTime(row.date)}</small></td>
                      <td><strong>{personName(row.user)}</strong><small className="sa-block-small">ID #{safe(row.user?.id)}</small></td>
                      <td><Badge value={row.action} /></td>
                      <td className="sa-title-cell"><strong>{row.title}</strong></td>
                      <td className="sa-wrap-text">{row.message}</td>
                      <td><span className="sa-status-change"><Badge value={row.beforeStatus} /><b>→</b><Badge value={row.afterStatus} /></span></td>
                      <td className="sa-people"><span>Task: <b>#{safe(row.taskId)}</b></span><span>Item: <b>#{safe(row.taskItemId)}</b></span><span>Inspection: <b>#{safe(row.inspectionId)}</b></span><span>Device: <b>#{safe(row.deviceId)}</b></span></td>
                      <td className="sa-wrap-text">{safe(row.locationText)}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "ACTIVITY", record: row })}><Icon name="eye" size={15} /> Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "MORPHO" && (
              <table>
                <thead><tr><th>Date / Time</th><th>Device</th><th>Technician</th><th>Status</th><th>Old → New</th><th>Source</th><th>Notes</th><th>Linked Records</th><th>Proof</th><th>Action</th></tr></thead>
                <tbody>
                  {!filteredMorpho.length ? <EmptyTable message="No matching Morpho history" /> : filteredMorpho.map((row, index) => (
                    <tr key={row.id || index}>
                      <td className="sa-date"><strong>{formatDate(row.date)}</strong><small>{formatDateTime(row.date)}</small></td>
                      <td><strong>{row.deviceName}</strong><small className="sa-block-small">ID #{safe(row.device?.id || row.deviceId)}</small></td>
                      <td><strong>{personName(row.technician)}</strong></td>
                      <td><Badge value={row.status} /></td>
                      <td><span className="sa-status-change"><Badge value={row.oldStatus} /><b>→</b><Badge value={row.newStatus} /></span></td>
                      <td><span className="sa-source">{row.source}</span></td>
                      <td className="sa-wrap-text">{safe(row.notes)}</td>
                      <td className="sa-people"><span>Task Item: <b>#{safe(row.taskItemId)}</b></span><span>Inspection: <b>#{safe(row.inspectionId)}</b></span></td>
                      <td>{row.proofImageUrl ? <a href={row.proofImageUrl} target="_blank" rel="noreferrer" className="sa-proof">Open Image ↗</a> : "—"}</td>
                      <td><button className="sa-view" type="button" onClick={() => setSelected({ type: "MORPHO", record: row })}><Icon name="eye" size={15} /> Details</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <DetailsModal selected={selected} onClose={() => setSelected(null)} />
    </main>
  );
}

const adminStyles = `
  .software-admin-page,
  .software-admin-page * { box-sizing: border-box; }

  .software-admin-page {
    --navy: #10243a;
    --navy-2: #183955;
    --cyan: #18a9d4;
    --cyan-dark: #087fa6;
    --text: #1d2e43;
    --muted: #74889d;
    --line: #dce8ef;
    --soft-line: #ebf2f6;
    --bg: #f3f7fa;
    --green: #0da874;
    --red: #df4d5c;
    --orange: #e99513;
    min-height: 100vh;
    width: 100%;
    padding: 22px;
    color: var(--text);
    background:
      radial-gradient(circle at 10% -5%, rgba(24,169,212,.12), transparent 28%),
      radial-gradient(circle at 96% 3%, rgba(104,76,237,.08), transparent 24%),
      linear-gradient(180deg, #fbfdfe, var(--bg));
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .sa-shell { width: min(100%, 1840px); margin: 0 auto; }

  .sa-hero {
    min-height: 112px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    overflow: hidden;
    padding: 23px 25px;
    border-radius: 22px;
    background:
      radial-gradient(circle at 90% -20%, rgba(255,255,255,.17), transparent 30%),
      linear-gradient(120deg, var(--navy), #155779 70%, #168d91);
    color: #fff;
    box-shadow: 0 18px 46px rgba(16,36,58,.18);
  }

  .sa-hero-main { display: flex; align-items: flex-start; gap: 13px; min-width: 0; }
  .sa-back {
    width: 41px; height: 41px; display: grid; place-items: center; flex: 0 0 auto;
    border: 1px solid rgba(255,255,255,.25); border-radius: 12px;
    background: rgba(255,255,255,.11); color: #fff; cursor: pointer;
  }
  .sa-kicker { color: #97e5ff; font-size: 9px; font-weight: 950; letter-spacing: .14em; }
  .sa-hero h1 { margin: 5px 0 6px; font-size: clamp(25px, 2.5vw, 37px); line-height: 1; letter-spacing: -.045em; }
  .sa-hero p { max-width: 920px; margin: 0; color: #d9f3fc; font-size: 12px; font-weight: 700; line-height: 1.65; }
  .sa-hero-actions { display: flex; gap: 9px; flex-wrap: wrap; justify-content: flex-end; }

  .sa-button {
    min-height: 41px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    padding: 9px 13px; border: 1px solid transparent; border-radius: 11px;
    font: inherit; font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap;
    transition: .18s ease;
  }
  .sa-button:hover:not(:disabled) { transform: translateY(-1px); }
  .sa-button:disabled { opacity: .55; cursor: not-allowed; }
  .sa-button.primary { border-color: #fff; background: #fff; color: var(--navy); }
  .sa-button.light { border-color: rgba(255,255,255,.25); background: rgba(255,255,255,.1); color: #fff; }
  .sa-button.soft { border-color: #c9e7f0; background: #f0fbfe; color: var(--cyan-dark); }

  .sa-alert {
    display: flex; align-items: center; gap: 9px; margin-top: 13px; padding: 11px 13px;
    border-radius: 12px; border: 1px solid; font-size: 11px; font-weight: 800;
  }
  .sa-alert.info { color: #087090; border-color: #bce5f0; background: #eefafe; }
  .sa-alert.error { color: #a62e3d; border-color: #f3c8ce; background: #fff3f4; }
  .sa-alert.success { color: #08734f; border-color: #bde7d5; background: #effbf6; }
  .sa-spinner { width: 17px; height: 17px; border: 2px solid #b7dfeb; border-top-color: var(--cyan-dark); border-radius: 50%; animation: saSpin .7s linear infinite; }
  @keyframes saSpin { to { transform: rotate(360deg); } }

  .sa-metrics { display: grid; grid-template-columns: repeat(8, minmax(125px, 1fr)); gap: 10px; margin: 15px 0; }
  .sa-metric {
    --accent: var(--cyan);
    position: relative; min-height: 103px; display: grid; grid-template-columns: 39px 1fr; gap: 10px;
    align-items: center; overflow: hidden; padding: 14px; border: 1px solid var(--line);
    border-radius: 15px; background: rgba(255,255,255,.96); color: var(--text); text-align: left;
    box-shadow: 0 8px 22px rgba(17,44,68,.055); cursor: pointer; transition: .18s ease;
  }
  .sa-metric:before { content: ""; position: absolute; inset: 0 0 auto; height: 3px; background: var(--accent); }
  .sa-metric:hover { transform: translateY(-2px); border-color: color-mix(in srgb, var(--accent) 35%, white); }
  .sa-metric.violet { --accent: #6657db; } .sa-metric.blue { --accent: #159bd3; }
  .sa-metric.green { --accent: #0da874; } .sa-metric.red { --accent: #df4d5c; }
  .sa-metric.orange { --accent: #e99513; } .sa-metric.pink { --accent: #b84acb; }
  .sa-metric.teal { --accent: #0b988d; } .sa-metric.navy { --accent: #203b59; }
  .sa-metric-icon { width: 39px; height: 39px; display: grid; place-items: center; border-radius: 12px; background: color-mix(in srgb, var(--accent) 11%, white); color: var(--accent); }
  .sa-metric-copy { min-width: 0; display: grid; }
  .sa-metric-copy strong { color: var(--accent); font-size: 24px; line-height: 1; letter-spacing: -.04em; }
  .sa-metric-copy b { margin-top: 6px; color: var(--navy); font-size: 9px; text-transform: uppercase; letter-spacing: .04em; }
  .sa-metric-copy small { margin-top: 3px; overflow: hidden; color: #97a7b5; font-size: 8px; white-space: nowrap; text-overflow: ellipsis; }

  .sa-spotlight {
    display: grid; grid-template-columns: minmax(230px,.8fr) minmax(500px,2fr) auto; gap: 14px; align-items: center;
    margin-bottom: 15px; padding: 14px; border: 1px solid #cfe5ed; border-radius: 16px;
    background: linear-gradient(135deg, #f6fcfe, #fff); box-shadow: 0 8px 22px rgba(17,44,68,.045);
  }
  .sa-spotlight-title { display: flex; align-items: center; gap: 10px; }
  .sa-spotlight-title > span { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 13px; background: var(--navy); color: #fff; }
  .sa-spotlight-title b { display: block; color: var(--navy); font-size: 13px; }
  .sa-spotlight-title small { display: block; margin-top: 3px; color: var(--muted); font-size: 9px; line-height: 1.45; }
  .sa-spotlight-stats { display: grid; grid-template-columns: repeat(6, minmax(80px,1fr)); gap: 7px; }
  .sa-spotlight-stats > div { min-height: 55px; display: grid; align-content: center; padding: 8px; border: 1px solid var(--soft-line); border-radius: 10px; background: #fff; }
  .sa-spotlight-stats strong { overflow: hidden; color: var(--navy); font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
  .sa-spotlight-stats span { margin-top: 3px; color: #8b9cab; font-size: 8px; text-transform: uppercase; font-weight: 900; }

  .sa-filter-panel { margin-bottom: 14px; overflow: visible; border: 1px solid var(--line); border-radius: 17px; background: #fff; box-shadow: 0 8px 22px rgba(17,44,68,.045); }
  .sa-filter-title { display: flex; align-items: center; justify-content: space-between; padding: 11px 14px; border-bottom: 1px solid var(--soft-line); }
  .sa-filter-title > div { display: flex; align-items: center; gap: 7px; color: var(--navy); font-size: 11px; font-weight: 900; }
  .sa-filter-title button { border: 0; background: transparent; color: #c34755; font: inherit; font-size: 10px; font-weight: 900; cursor: pointer; }
  .sa-filter-grid { display: grid; grid-template-columns: minmax(280px,1.8fr) repeat(5,minmax(140px,.8fr)); gap: 9px; padding: 13px; }
  .sa-field { display: grid; gap: 5px; min-width: 0; }
  .sa-field > span { color: #7a8ea1; font-size: 8px; font-weight: 950; text-transform: uppercase; letter-spacing: .06em; }
  .sa-field input, .sa-field select {
    width: 100%; min-width: 0; min-height: 40px; border: 1px solid #d8e5ec; border-radius: 10px; outline: 0;
    padding: 8px 10px; background: #fbfdfe; color: #41586d; font: inherit; font-size: 10px; font-weight: 750;
  }
  .sa-field input:focus, .sa-field select:focus { border-color: var(--cyan); box-shadow: 0 0 0 3px rgba(24,169,212,.1); background: #fff; }
  .sa-field.search > div { display: flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 10px; border: 1px solid #d8e5ec; border-radius: 10px; background: #fbfdfe; color: #8ca0b0; }
  .sa-field.search input { min-height: 37px; padding: 0; border: 0; background: transparent; box-shadow: none; }

  .sa-tabs { display: flex; gap: 4px; overflow: auto; margin-bottom: 13px; padding: 5px; border-radius: 13px; background: #e9f1f5; }
  .sa-tabs button { min-height: 37px; display: inline-flex; align-items: center; gap: 7px; padding: 8px 11px; border: 0; border-radius: 9px; background: transparent; color: #5d7286; font: inherit; font-size: 10px; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .sa-tabs button.active { background: #fff; color: var(--navy); box-shadow: 0 2px 8px rgba(15,23,42,.09); }
  .sa-tabs button b { min-width: 21px; height: 21px; display: grid; place-items: center; padding: 0 5px; border-radius: 999px; background: #dceaf0; color: #4d6579; font-size: 8px; }
  .sa-tabs button.active b { background: #e8f7fc; color: var(--cyan-dark); }

  .sa-table-panel { overflow: hidden; border: 1px solid var(--line); border-radius: 18px; background: #fff; box-shadow: 0 12px 30px rgba(17,44,68,.06); }
  .sa-table-head { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 15px 17px; border-bottom: 1px solid var(--soft-line); }
  .sa-table-head h2 { margin: 4px 0 0; color: var(--navy); font-size: 16px; }
  .sa-count-pill { min-height: 30px; display: inline-flex; align-items: center; padding: 5px 10px; border: 1px solid #d7e7ed; border-radius: 999px; background: #f7fbfd; color: #61788b; font-size: 9px; font-weight: 900; white-space: nowrap; }
  .sa-table-wrap { width: 100%; max-height: 68vh; overflow: auto; }
  .sa-table-wrap table { width: 100%; min-width: 1280px; border-collapse: separate; border-spacing: 0; font-size: 9px; }
  .sa-issues-table { min-width: 1180px !important; }
  .sa-table-wrap thead th { position: sticky; top: 0; z-index: 4; padding: 10px; border-bottom: 1px solid var(--line); background: #f4f8fb; color: #74889a; font-size: 8px; font-weight: 950; text-align: left; text-transform: uppercase; letter-spacing: .055em; white-space: nowrap; }
  .sa-table-wrap tbody tr { content-visibility: auto; contain-intrinsic-size: 54px; }
  .sa-table-wrap tbody td { padding: 12px 10px; border-bottom: 1px solid var(--soft-line); background: #fff; color: #536a7e; vertical-align: top; line-height: 1.55; }
  .sa-table-wrap tbody tr:nth-child(even) td { background: #fcfdff; }
  .sa-table-wrap tbody tr:hover td { background: #f5fafc; }
  .sa-table-wrap td strong { color: var(--navy); font-size: 9.5px; }
  .sa-title-cell { min-width: 190px; max-width: 300px; }
  .sa-title-cell strong, .sa-title-cell small { display: block; }
  .sa-title-cell small, .sa-block-small { display: block; margin-top: 3px; max-width: 280px; overflow: hidden; color: #91a1af; font-size: 8px; line-height: 1.35; text-overflow: ellipsis; }
  .sa-wrap-text { min-width: 150px; max-width: 280px; overflow-wrap: anywhere; }
  .sa-date { min-width: 115px; }
  .sa-date strong, .sa-date small { display: block; white-space: nowrap; }
  .sa-date small { margin-top: 3px; color: #97a6b3; font-size: 8px; }
  .sa-source { display: inline-flex; align-items: center; min-height: 24px; padding: 4px 7px; border: 1px solid #cfe5ed; border-radius: 7px; background: #eef9fc; color: #147b9b; font-size: 8px; font-weight: 950; white-space: nowrap; }
  .sa-badge { display: inline-flex; align-items: center; justify-content: center; min-height: 24px; padding: 4px 7px; border: 1px solid transparent; border-radius: 999px; font-size: 7.5px; font-weight: 950; white-space: nowrap; }
  .sa-badge.good { color: #08734f; background: #eaf9f2; border-color: #bce8d5; }
  .sa-badge.progress { color: #9a6207; background: #fff8e8; border-color: #f4dfae; }
  .sa-badge.bad { color: #b33645; background: #fff0f2; border-color: #f2c7cd; }
  .sa-badge.idle { color: #8a6a1b; background: #fffaf0; border-color: #ecdba8; }
  .sa-progress-wrap { min-width: 110px; display: grid; grid-template-columns: 1fr 32px; gap: 6px; align-items: center; }
  .sa-progress-track { height: 7px; overflow: hidden; border-radius: 999px; background: #e6eef3; }
  .sa-progress-track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--cyan), var(--green)); }
  .sa-progress-wrap b { color: var(--navy); font-size: 8px; }
  .sa-number-line { min-width: 120px; display: flex; gap: 4px; flex-wrap: wrap; }
  .sa-number-line span { padding: 3px 5px; border-radius: 6px; background: #f1f5f8; color: #65798a; font-size: 7.5px; font-weight: 900; }
  .sa-number-line span.good { color: #08734f; background: #eaf9f2; }
  .sa-number-line span.bad { color: #b33645; background: #fff0f2; }
  .sa-view { min-height: 28px; display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border: 1px solid #cfe1e9; border-radius: 8px; background: #fff; color: #426277; font: inherit; font-size: 8px; font-weight: 900; cursor: pointer; white-space: nowrap; }
  .sa-view:hover { border-color: #9fd4e5; background: #f1fbfe; color: var(--cyan-dark); }
  .sa-people { min-width: 145px; }
  .sa-people span { display: block; margin-bottom: 3px; font-size: 8px; }
  .sa-people b { color: var(--navy); }
  .sa-status-stack { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
  .sa-state-note { display: inline-block; margin-top: 6px; font-size: 8px; font-weight: 900; }
  .sa-state-note.good { color: #08734f; }
  .sa-state-note.bad { color: #b33645; }
  .sa-state-note.progress, .sa-state-note.idle { color: #9a6207; }
  .sa-summary-cell { min-width: 300px; max-width: 440px; }
  .sa-summary-block { padding: 8px 9px; border: 1px solid #e5edf2; border-radius: 10px; background: #fbfdfe; }
  .sa-summary-block + .sa-summary-block { margin-top: 7px; }
  .sa-summary-block label { display: block; margin-bottom: 4px; color: #7f93a6; font-size: 7px; font-weight: 950; text-transform: uppercase; letter-spacing: .06em; }
  .sa-summary-block p { margin: 0; color: #395165; font-size: 8.5px; line-height: 1.6; }
  .sa-summary-inline { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 7px; }
  .sa-summary-inline span { padding: 4px 7px; border-radius: 999px; background: #f1f6f9; color: #536a7e; font-size: 8px; font-weight: 800; }
  .sa-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sa-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .sa-status-change { display: inline-flex; align-items: center; gap: 4px; }
  .sa-status-change > b { color: #9aa9b5; }
  .sa-proof { color: var(--cyan-dark); font-weight: 900; text-decoration: none; }

  .sa-empty-cell { height: 260px; text-align: center; }
  .sa-empty-cell > span { width: 52px; height: 52px; display: grid; place-items: center; margin: 0 auto; border-radius: 16px; background: #eef7fa; color: var(--cyan-dark); }
  .sa-empty-cell strong, .sa-empty-cell small { display: block; }
  .sa-empty-cell strong { margin-top: 12px; color: var(--navy); font-size: 12px; }
  .sa-empty-cell small { margin-top: 4px; color: #92a2af; font-size: 9px; }

  .sa-modal-backdrop { position: fixed; inset: 0; z-index: 9999; display: grid; place-items: center; overflow: auto; padding: 20px; background: rgba(8,22,38,.62); backdrop-filter: blur(8px); }
  .sa-modal { width: min(1050px, 96vw); max-height: 93vh; overflow: hidden; border-radius: 20px; background: #fff; box-shadow: 0 35px 100px rgba(0,0,0,.3); }
  .sa-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 15px; padding: 18px 20px; background: linear-gradient(120deg, var(--navy), #176789); color: #fff; }
  .sa-modal-head span { color: #9be6ff; font-size: 8px; font-weight: 950; letter-spacing: .12em; }
  .sa-modal-head h2 { margin: 5px 0 0; font-size: 20px; }
  .sa-modal-head button { width: 37px; height: 37px; display: grid; place-items: center; border: 1px solid rgba(255,255,255,.25); border-radius: 10px; background: rgba(255,255,255,.1); color: #fff; cursor: pointer; }
  .sa-modal-body { max-height: calc(93vh - 75px); overflow: auto; padding: 16px; background: #f7fafc; }
  .sa-detail-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 8px; }
  .sa-detail { min-height: 62px; padding: 9px; border: 1px solid var(--line); border-radius: 10px; background: #fff; }
  .sa-detail.wide { grid-column: 1 / -1; }
  .sa-detail span { display: block; color: #8294a4; font-size: 7px; font-weight: 950; text-transform: uppercase; letter-spacing: .05em; }
  .sa-detail strong { display: block; margin-top: 5px; color: #324a5f; font-size: 9px; line-height: 1.5; overflow-wrap: anywhere; }
  .sa-section-title { margin: 14px 0 8px; padding: 7px 9px; border-radius: 8px; background: var(--navy); color: #fff; font-size: 10px; }
  .sa-mini-list { display: grid; gap: 6px; }
  .sa-mini-row { display: grid; grid-template-columns: 28px minmax(0,1fr) auto; gap: 8px; align-items: center; padding: 8px; border: 1px solid var(--line); border-radius: 9px; background: #fff; }
  .sa-mini-row > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: #eaf7fb; color: var(--cyan-dark); font-size: 8px; font-weight: 950; }
  .sa-mini-row strong, .sa-mini-row small { display: block; }
  .sa-mini-row strong { color: var(--navy); font-size: 9px; }
  .sa-mini-row small { margin-top: 3px; color: #8ea0ae; font-size: 8px; }
  .sa-muted { color: var(--muted); font-size: 9px; }

  @media (max-width: 1450px) {
    .sa-metrics { grid-template-columns: repeat(4,1fr); }
    .sa-filter-grid { grid-template-columns: repeat(3,1fr); }
    .sa-field.search { grid-column: span 2; }
    .sa-spotlight { grid-template-columns: 1fr; }
  }
  @media (max-width: 900px) {
    .software-admin-page { padding: 12px; }
    .sa-hero { align-items: flex-start; flex-direction: column; }
    .sa-hero-actions { width: 100%; justify-content: flex-start; }
    .sa-metrics { grid-template-columns: repeat(2,1fr); }
    .sa-filter-grid { grid-template-columns: 1fr 1fr; }
    .sa-field.search { grid-column: 1 / -1; }
    .sa-spotlight-stats { grid-template-columns: repeat(3,1fr); }
    .sa-detail-grid { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 560px) {
    .sa-metrics, .sa-filter-grid, .sa-spotlight-stats, .sa-detail-grid { grid-template-columns: 1fr; }
    .sa-field.search { grid-column: auto; }
    .sa-table-head { align-items: flex-start; flex-direction: column; }
    .sa-modal-backdrop { padding: 0; align-items: end; }
    .sa-modal { width: 100%; max-height: 96vh; border-radius: 18px 18px 0 0; }
  }
`;