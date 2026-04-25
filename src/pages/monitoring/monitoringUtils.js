const ATTENTION_DEVICE_STATUSES = [
  "NEEDS_MAINTENANCE",
  "UNDER_MAINTENANCE",
  "OUT_OF_SERVICE",
];

export function parseDeviceLocation(device) {
  const location = device?.location || {};
  const output = {
    cluster: location.cluster || "",
    building: location.building || "",
    zone: location.zone || "",
    lane: location.lane || "",
    direction: location.direction || "",
  };

  if (!output.cluster && (device?.deviceName || device?.deviceCode)) {
    const text = `${device.deviceName || ""} - ${device.deviceCode || ""}`;
    const parts = text.split("-").map((part) => part.trim()).filter(Boolean);

    for (const part of parts) {
      const lower = part.toLowerCase();
      if (lower.startsWith("cluster")) output.cluster = part.slice(7).trim();
      else if (lower.startsWith("building") || part.includes("وزارة")) {
        output.building = part.replace(/building/i, "").trim();
      } else if (lower.startsWith("zone")) output.zone = part.slice(4).trim();
      else if (lower.startsWith("lane")) output.lane = part.slice(4).trim();
      else if (["in", "out", "entry", "exit"].includes(lower)) output.direction = part.toUpperCase();
    }
  }

  return output;
}

export function formatDate(value, lang = "en") {
  if (!value) return lang === "ar" ? "غير متوفر" : "Not available";
  try {
    return new Date(value).toLocaleString(lang === "ar" ? "ar-EG" : "en-US");
  } catch {
    return value;
  }
}

export function getTone(value) {
  const normalized = String(value || "").toUpperCase();
  if (["OK", "COMPLETED", "ACTIVE"].includes(normalized)) return "good";
  if (["PENDING", "PARTIAL", "IN_PROGRESS", "UNDER_MAINTENANCE", "NEEDS_MAINTENANCE"].includes(normalized)) return "warn";
  if (["NOT_OK", "NOT_REACHABLE", "OUT_OF_SERVICE", "CANCELLED"].includes(normalized)) return "danger";
  return "neutral";
}

export function getDeviceRows(devices = [], inspections = []) {
  const lastInspectionMap = new Map();

  inspections.forEach((inspection) => {
    const deviceId = inspection.deviceId;
    if (!deviceId) return;

    const inspectedAt = inspection.inspectedAt || inspection.createdAt;
    const current = lastInspectionMap.get(deviceId);
    if (!current || new Date(inspectedAt) > new Date(current.inspectedAt || current.createdAt)) {
      lastInspectionMap.set(deviceId, inspection);
    }
  });

  return devices.map((device) => {
    const parsedLoc = parseDeviceLocation(device);
    const deviceInspections = inspections.filter((item) => item.deviceId === device.id);
    const lastInspection = lastInspectionMap.get(device.id) || null;
    return {
      ...device,
      parsedLoc,
      inspectionsCount: deviceInspections.length,
      lastInspection,
      lastInspectionAt: lastInspection?.inspectedAt || lastInspection?.createdAt || device.lastInspectionAt || "",
      lastInspectionStatus: lastInspection?.inspectionStatus || "",
    };
  });
}

export function getLocationRows(locations = [], deviceRows = [], inspections = []) {
  return locations.map((location) => {
    const locationDevices = deviceRows.filter((device) => device.locationId === location.id);
    const deviceIds = new Set(locationDevices.map((device) => device.id));
    const locationInspections = inspections.filter((inspection) => deviceIds.has(inspection.deviceId));
    const latestInspection = [...locationInspections].sort(
      (a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt)
    )[0];

    return {
      ...location,
      devicesCount: locationDevices.length,
      inspectionsCount: locationInspections.length,
      needsAttentionCount: locationDevices.filter((device) =>
        ATTENTION_DEVICE_STATUSES.includes(device.currentStatus)
      ).length,
      latestInspectionAt: latestInspection?.inspectedAt || latestInspection?.createdAt || "",
    };
  });
}

export function getFilterOptions(deviceRows = []) {
  const options = {
    cluster: new Set(),
    building: new Set(),
    zone: new Set(),
    direction: new Set(),
  };

  deviceRows.forEach((device) => {
    if (device.parsedLoc.cluster) options.cluster.add(device.parsedLoc.cluster);
    if (device.parsedLoc.building) options.building.add(device.parsedLoc.building);
    if (device.parsedLoc.zone) options.zone.add(device.parsedLoc.zone);
    if (device.parsedLoc.direction) options.direction.add(device.parsedLoc.direction);
  });

  return {
    cluster: [...options.cluster].sort(),
    building: [...options.building].sort(),
    zone: [...options.zone].sort(),
    direction: [...options.direction].sort(),
  };
}

export function matchesSharedFilters(device, filters) {
  const query = filters.search.trim().toLowerCase();
  const haystack = [
    device.deviceCode,
    device.deviceName,
    device.serialNumber,
    device.barcode,
    device.manufacturer,
    device.parsedLoc.cluster,
    device.parsedLoc.building,
    device.parsedLoc.zone,
    device.parsedLoc.direction,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (query && !haystack.includes(query)) return false;
  if (filters.cluster !== "ALL" && device.parsedLoc.cluster !== filters.cluster) return false;
  if (filters.building !== "ALL" && device.parsedLoc.building !== filters.building) return false;
  if (filters.zone !== "ALL" && device.parsedLoc.zone !== filters.zone) return false;
  if (filters.direction !== "ALL" && device.parsedLoc.direction !== filters.direction) return false;
  return true;
}

export function matchesDeviceStatus(device, status) {
  if (status === "ALL") return true;
  if (status === "ATTENTION") {
    return ATTENTION_DEVICE_STATUSES.includes(device.currentStatus);
  }
  return device.currentStatus === status;
}

export function getSnapshotKpis(deviceRows = [], locations = [], inspections = []) {
  const inspectedDevices = new Set(inspections.map((item) => item.deviceId).filter(Boolean));
  const latestInspection = [...inspections].sort(
    (a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt)
  )[0];

  return {
    totalDevices: deviceRows.length,
    healthyDevices: deviceRows.filter((device) => device.currentStatus === "OK").length,
    attentionDevices: deviceRows.filter((device) => ATTENTION_DEVICE_STATUSES.includes(device.currentStatus)).length,
    totalInspections: inspections.length,
    inspectedDevices: inspectedDevices.size,
    totalLocations: locations.length,
    latestInspectionAt: latestInspection?.inspectedAt || latestInspection?.createdAt || "",
  };
}

export function getRecentInspections(inspections = [], limit = 6) {
  return [...inspections]
    .sort((a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt))
    .slice(0, limit);
}
