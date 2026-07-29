import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

const CONFIGURED_API_BASE_URL = String(
  import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    "",
)
  .trim()
  .replace(/\/+$/, "");

// In local development, always call NestJS on port 3000.
// This prevents requests from going to the Vite server on port 5173.
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : CONFIGURED_API_BASE_URL;

const TICKETS_API = `${API_BASE_URL}/issues/tickets`;

const typeOptions = ["Software", "Gates", "Reader"];
const statusOptions = ["Open", "In Progress", "Resolved"];
const priorityOptions = ["Low", "Medium", "High", "Urgent"];

const excelHeaders = [
  "Date",
  "Category",
  "Problem Location",
  "Problem Description",
  "Solution / Action Taken",
  "Status",
  "Status Date",
];

const emptyTicket = () => ({
  problemDate: localDate(),
  type: "Software",
  title: "",
  locationText: "",
  locationBuildings: [],
  locationZones: [],
  customLocationText: "",
  description: "",
  priority: "Medium",
  status: "Open",
  workflowStatus: "IN_PROGRESS",
  existingStatus: "OPEN",
  startedAt: null,
  resolvedAt: null,
  solutionText: "",
  steps: [""],
  finalResult: "",
});

function Icon({ name, size = 18, strokeWidth = 1.9 }) {
  const paths = {
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    upload: <><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
    download: <><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M8 13h8" /><path d="M8 17h8" /></>,
    refresh: <><path d="M20 6v6h-6" /><path d="M4 18v-6h6" /><path d="M18.5 9a7 7 0 0 0-12-3L4 9" /><path d="M5.5 15a7 7 0 0 0 12 3l2.5-3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    filter: <><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    play: <path d="m8 5 11 7-11 7Z" />,
    check: <><path d="m5 12 4 4L19 6" /></>,
    alert: <><path d="M10.3 3.4 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    resolved: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16 9" /></>,
    monitor: <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /></>,
    gate: <><path d="M5 21V4h14v17" /><path d="M5 8h14" /><path d="M9 8v13" /><path d="M15 8v13" /></>,
    reader: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 7h6" /><path d="M9 11h6" /><circle cx="12" cy="16" r="1" /></>,
    map: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M3 10h18" /></>,
    layers: <><path d="m12 2 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 17 9 5 9-5" /></>,
    back: <><path d="m15 18-6-6 6-6" /><path d="M9 12h11" /></>,
    trash: <><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="m6 7 1 14h10l1-14" /><path d="M9 7V4h6v3" /></>,
  };

  return (
    <svg
      className="ui-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.layers}
    </svg>
  );
}

function localDate(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function apiStatus(value) {
  const text = String(value || "").trim().toUpperCase();
  if (
    text.includes("RESOLVED") ||
    text.includes("SOLVED") ||
    text.includes("الحل")
  ) {
    return "RESOLVED";
  }
  if (text.includes("PROGRESS") || text.includes("التنفيذ")) {
    return "IN_PROGRESS";
  }
  return "OPEN";
}

function displayStatus(value) {
  return (
    {
      OPEN: "Open",
      IN_PROGRESS: "In Progress",
      RESOLVED: "Resolved",
    }[apiStatus(value)] || "Open"
  );
}

function apiType(value) {
  const text = String(value || "").trim().toUpperCase();
  if (text.includes("GATE") || text.includes("بواب")) return "GATE";
  if (text.includes("READER") || text.includes("قارئ")) return "READER";
  return "SOFTWARE";
}

function displayType(value) {
  return (
    {
      GATE: "Gates",
      READER: "Reader",
      SOFTWARE: "Software",
    }[apiType(value)] || "Software"
  );
}

function apiPriority(value) {
  const normalized = String(value || "MEDIUM").trim().toUpperCase();
  return priorityOptions.map((item) => item.toUpperCase()).includes(normalized)
    ? normalized
    : "MEDIUM";
}

function displayPriority(value) {
  return String(value || "Medium").replace(/^./, (letter) =>
    letter.toUpperCase(),
  );
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
}

function ticketStatusDate(ticket) {
  const status = apiStatus(ticket?.status);

  if (status === "RESOLVED") {
    return ticket?.resolvedAt || ticket?.statusDate || ticket?.updatedAt;
  }

  if (status === "IN_PROGRESS") {
    return ticket?.startedAt || ticket?.statusDate || ticket?.updatedAt;
  }

  return ticket?.problemDate || ticket?.createdAt || ticket?.statusDate;
}

function ticketStatusDateLabel(ticket) {
  const status = apiStatus(ticket?.status);
  if (status === "RESOLVED") return "Resolved at";
  if (status === "IN_PROGRESS") return "Started at";
  return "Registered at";
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ticketSteps(ticket) {
  const value =
    ticket?.solutionSteps ||
    ticket?.steps ||
    ticket?.problemSteps ||
    [];

  if (Array.isArray(value)) {
    return value
      .map((step) =>
        typeof step === "string"
          ? step
          : step?.text || step?.description || "",
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((step) => step.replace(/^\s*\d+[.)-]?\s*/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function getToken() {
  return ["accessToken", "access_token", "token", "authToken", "jwt"]
    .map(
      (key) => localStorage.getItem(key) || sessionStorage.getItem(key),
    )
    .find(Boolean);
}

async function request(url, options = {}) {
  const token = getToken();
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" | ")
      : payload?.message ||
        payload?.error ||
        `Request failed (${response.status})`;

    throw new Error(message);
  }

  return payload;
}

function normalizeImportedRow(row) {
  const get = (...keys) =>
    keys
      .map((key) => row[key])
      .find(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).trim() !== "",
      ) || "";

  const dateValue = get("Date", "التاريخ");
  const parsedDate =
    dateValue instanceof Date
      ? localDate(dateValue)
      : dateValue
        ? localDate(new Date(dateValue))
        : localDate();

  return {
    ...emptyTicket(),
    problemDate: parsedDate === "NaN-NaN-NaN" ? localDate() : parsedDate,
    type: displayType(get("Category", "الفئة")),
    locationText: get("Problem Location", "مكان المشكلة"),
    description: get("Problem Description", "وصف المشكلة"),
    solutionText: get(
      "Solution / Action Taken",
      "الحل / الإجراء المتخذ",
    ),
    status: displayStatus(get("Status", "الحالة")),
  };
}



function normalizeLocationName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("ar");
}

function splitLocationText(value) {
  return String(value || "")
    .split(/\s*(?:\+|،|,|&|\n|\r|؛|;)\s*/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function makeZoneKey(building, zone) {
  return `${String(building || "").trim()}|||${String(zone || "").trim()}`;
}

function parseZoneKey(value) {
  const [building = "", ...zoneParts] = String(value || "").split("|||");
  return {
    building: building.trim(),
    zone: zoneParts.join("|||").trim(),
  };
}

function composeLocationText(source) {
  const buildings = Array.isArray(source.locationBuildings)
    ? source.locationBuildings.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  const zoneMap = new Map();

  (Array.isArray(source.locationZones) ? source.locationZones : []).forEach(
    (zoneKey) => {
      const { building, zone } = parseZoneKey(zoneKey);
      if (!building || !zone || !buildings.includes(building)) return;

      const current = zoneMap.get(building) || [];
      if (!current.includes(zone)) current.push(zone);
      zoneMap.set(building, current);
    },
  );

  const locationParts = buildings.map((building) => {
    const zones = zoneMap.get(building) || [];
    return zones.length
      ? `${building} [${zones.join("، ")}]`
      : building;
  });

  const customLocation = String(source.customLocationText || "").trim();
  if (customLocation) locationParts.push(customLocation);

  return [...new Set(locationParts)].join(" + ");
}

function extractStoredLocationData(locationText, buildingOptions) {
  const textValue = String(locationText || "").trim();
  const locationBuildings = [];
  const locationZones = [];
  let customLocationText = textValue;

  const sortedBuildings = [...buildingOptions].sort(
    (a, b) => String(b.name || "").length - String(a.name || "").length,
  );

  sortedBuildings.forEach((option) => {
    const building = String(option.name || option.building || "").trim();
    if (!building) return;

    const pattern = new RegExp(
      `${escapeRegExp(building)}(?:\\s*\\[([^\\]]*)\\])?`,
      "i",
    );
    const match = customLocationText.match(pattern);
    if (!match) return;

    locationBuildings.push(building);

    const availableZones = Array.isArray(option.zones) ? option.zones : [];
    const zoneMap = new Map(
      availableZones.map((zone) => [normalizeLocationName(zone), zone]),
    );

    String(match[1] || "")
      .split(/\s*(?:،|,|;|؛)\s*/g)
      .map((zone) => zone.trim())
      .filter(Boolean)
      .forEach((zone) => {
        const canonical = zoneMap.get(normalizeLocationName(zone)) || zone;
        locationZones.push(makeZoneKey(building, canonical));
      });

    customLocationText = customLocationText.replace(match[0], " ");
  });

  customLocationText = customLocationText
    .replace(/\s*\+\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    locationBuildings: [...new Set(locationBuildings)],
    locationZones: [...new Set(locationZones)],
    customLocationText,
  };
}

function resolveImportedLocations(locationText, buildingOptions) {
  const extracted = extractStoredLocationData(locationText, buildingOptions);

  if (extracted.locationBuildings.length) {
    return extracted;
  }

  const optionMap = new Map(
    buildingOptions.map((option) => [
      normalizeLocationName(option.name || option.building || option),
      option.name || option.building || option,
    ]),
  );

  const matched = [];
  const unmatched = [];

  splitLocationText(locationText).forEach((part) => {
    const canonical = optionMap.get(normalizeLocationName(part));
    if (canonical) matched.push(canonical);
    else unmatched.push(part);
  });

  return {
    locationBuildings: [...new Set(matched)],
    locationZones: [],
    customLocationText: unmatched.join(" + "),
  };
}

function readStoredCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("dashboard_auth_user") || "null");
  } catch {
    return null;
  }
}

function currentUserId(currentUser) {
  const stored = readStoredCurrentUser();
  const value =
    currentUser?.id ??
    currentUser?.userId ??
    stored?.id ??
    stored?.userId ??
    stored?.user?.id;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function TypeMark({ type }) {
  const display = displayType(type);
  const icon =
    display === "Gates" ? "gate" : display === "Reader" ? "reader" : "monitor";

  return (
    <span className={`type-mark ${display.toLowerCase()}`}>
      <span className="type-mark-icon"><Icon name={icon} size={15} /></span>
      <span>{display}</span>
    </span>
  );
}

function StatusBadge({ status }) {
  const display = displayStatus(status);
  const className = display.toLowerCase().replaceAll(" ", "-");
  return (
    <span className={`status-badge ${className}`}>
      <i />
      {display}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const display = displayPriority(priority);
  return (
    <span className={`priority-badge ${display.toLowerCase()}`}>
      {display}
    </span>
  );
}

function StatCard({ className, icon, value, label, caption, onClick, active }) {
  return (
    <button
      type="button"
      className={`stat-card ${className || ""} ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span className="stat-accent" />
      <span className="stat-icon"><Icon name={icon} size={21} /></span>
      <span className="stat-copy">
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{caption}</small>
      </span>
      <span className="stat-arrow"><Icon name="chevron" size={16} /></span>
    </button>
  );
}



function BuildingMultiSelect({ options, value, onChange, loading, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeLocationName(query);
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      normalizeLocationName(option.name).includes(normalizedQuery),
    );
  }, [options, query]);

  const toggle = (name) => {
    const selected = value.includes(name);
    onChange(selected ? value.filter((item) => item !== name) : [...value, name]);
  };

  return (
    <div className={`building-picker ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="building-picker-trigger"
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
      >
        <span className="building-picker-summary">
          <Icon name="map" size={16} />
          <span>
            {loading
              ? "Loading buildings..."
              : value.length
                ? `${value.length} building${value.length > 1 ? "s" : ""} selected`
                : "Select one or more buildings"}
          </span>
        </span>
        <span className="picker-chevron"><Icon name="chevron" size={15} /></span>
      </button>

      {value.length > 0 && (
        <div className="selected-building-chips">
          {value.map((name) => (
            <span className="building-chip" key={name}>
              {name}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== name))}
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="building-picker-menu">
          <div className="picker-search">
            <Icon name="search" size={15} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search backend buildings..."
            />
          </div>

          <div className="building-options-list">
            {!filteredOptions.length ? (
              <div className="picker-empty">No matching buildings.</div>
            ) : (
              filteredOptions.map((option) => {
                const checked = value.includes(option.name);
                return (
                  <button
                    type="button"
                    className={`building-option ${checked ? "selected" : ""}`}
                    key={option.name}
                    onClick={() => toggle(option.name)}
                  >
                    <span className="option-check">{checked ? "✓" : ""}</span>
                    <span className="option-copy">
                      <strong>{option.name}</strong>
                      <small>{option.locationCount || 0} backend location rows</small>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="picker-footer">
            <span>{value.length} selected</span>
            <button type="button" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ZoneMultiSelect({ options, value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeLocationName(query);
    if (!normalizedQuery) return options;

    return options.filter((option) =>
      normalizeLocationName(`${option.zone} ${option.building}`).includes(
        normalizedQuery,
      ),
    );
  }, [options, query]);

  const toggle = (key) => {
    const selected = value.includes(key);
    onChange(
      selected ? value.filter((item) => item !== key) : [...value, key],
    );
  };

  return (
    <div className={`building-picker zone-picker ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="building-picker-trigger"
        onClick={() => !disabled && setOpen((current) => !current)}
        disabled={disabled}
      >
        <span className="building-picker-summary">
          <Icon name="layers" size={16} />
          <span>
            {disabled
              ? "Select a building first"
              : value.length
                ? `${value.length} zone${value.length > 1 ? "s" : ""} selected`
                : "Select one or more zones"}
          </span>
        </span>
        <span className="picker-chevron"><Icon name="chevron" size={15} /></span>
      </button>

      {value.length > 0 && (
        <div className="selected-building-chips zone-chips">
          {value.map((key) => {
            const { building, zone } = parseZoneKey(key);
            return (
              <span className="building-chip zone-chip" key={key}>
                <b>{zone}</b>
                <small>{building}</small>
                <button
                  type="button"
                  onClick={() => onChange(value.filter((item) => item !== key))}
                  aria-label={`Remove ${zone}`}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="building-picker-menu">
          <div className="picker-search">
            <Icon name="search" size={15} />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search zones or buildings..."
            />
          </div>

          <div className="building-options-list">
            {!filteredOptions.length ? (
              <div className="picker-empty">No zones found for the selected buildings.</div>
            ) : (
              filteredOptions.map((option) => {
                const checked = value.includes(option.key);
                return (
                  <button
                    type="button"
                    className={`building-option ${checked ? "selected" : ""}`}
                    key={option.key}
                    onClick={() => toggle(option.key)}
                  >
                    <span className="option-check">{checked ? "✓" : ""}</span>
                    <span className="option-copy">
                      <strong>{option.zone}</strong>
                      <small>{option.building}</small>
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="picker-footer">
            <span>{value.length} selected</span>
            <button type="button" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SoftwareProblemPage({ onBack, currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyTicket);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    priority: "",
    from: "",
    to: "",
  });
  const [previewRows, setPreviewRows] = useState([]);
  const [resolveDialog, setResolveDialog] = useState(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const inputRef = useRef(null);
  const editorRef = useRef(null);
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);


const loadBuildingOptions = async () => {
  setBuildingsLoading(true);

  try {
    const payload = await request(
      `${TICKETS_API}/locations/buildings`,
    );

    const rows = Array.isArray(payload)
      ? payload
      : payload?.items || payload?.data || [];

    const buildings = rows
      .map((item) => ({
        name: String(item.name || item.building || "").trim(),
        locationCount: Number(
          item.locationCount || item.count || 0,
        ),
        zones: Array.isArray(item.zones)
          ? [...new Set(
              item.zones
                .map((zone) => String(zone || "").trim())
                .filter(Boolean),
            )]
          : [],
      }))
      .filter((item) => item.name);

    setBuildingOptions(buildings);
  } catch (error) {
    setBuildingOptions([]);
    setNotice(
      error.message ||
        "Could not load building options from the backend.",
    );
  } finally {
    setBuildingsLoading(false);
  }
};

const loadTickets = async () => {
  setLoading(true);

  try {
    const allTickets = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const payload = await request(
        `${TICKETS_API}?page=${currentPage}&limit=100`,
      );

      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];

      allTickets.push(...rows);

      totalPages = Math.max(
        1,
        Number(payload?.pagination?.totalPages || 1),
      );

      currentPage += 1;
    } while (currentPage <= totalPages);

    setTickets(
      Array.from(
        new Map(allTickets.map((ticket) => [ticket.id, ticket])).values(),
      ),
    );
  } catch (error) {
    setTickets([]);
    setNotice(
      error.message || "Could not load the complete issue register.",
    );
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadTickets();
  loadBuildingOptions();
}, []);

  const availableZoneOptions = useMemo(() => {
    const selectedBuildings = new Set(form.locationBuildings);

    return buildingOptions.flatMap((building) =>
      selectedBuildings.has(building.name)
        ? (building.zones || []).map((zone) => ({
            key: makeZoneKey(building.name, zone),
            building: building.name,
            zone,
          }))
        : [],
    );
  }, [buildingOptions, form.locationBuildings]);

  const updateSelectedBuildings = (buildings) => {
    setForm((current) => ({
      ...current,
      locationBuildings: buildings,
      locationZones: current.locationZones.filter((key) =>
        buildings.includes(parseZoneKey(key).building),
      ),
    }));
  };

  const visibleTickets = useMemo(
    () =>
      tickets.filter((ticket) => {
        const search = filters.search.trim().toLowerCase();
        const matchesSearch =
          !search ||
          [ticket.title, ticket.description, ticket.locationText].some((value) =>
            String(value || "").toLowerCase().includes(search),
          );
        const date = String(
          ticket.problemDate || ticket.createdAt || "",
        ).slice(0, 10);

        return (
          matchesSearch &&
          (!filters.type || displayType(ticket.type) === filters.type) &&
          (!filters.status ||
            displayStatus(ticket.status) === filters.status) &&
          (!filters.priority ||
            displayPriority(ticket.priority) === filters.priority) &&
          (!filters.from || date >= filters.from) &&
          (!filters.to || date <= filters.to)
        );
      }),
    [tickets, filters],
  );

  const metrics = useMemo(() => {
    const today = localDate();
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    return tickets.reduce(
      (result, ticket) => {
        const status = displayStatus(ticket.status);
        const priority = displayPriority(ticket.priority);
        const dateValue = ticket.problemDate || ticket.createdAt;
        const dateText = String(dateValue || "").slice(0, 10);
        const date = new Date(dateValue || 0);

        result.total += 1;
        if (status === "Open") result.open += 1;
        if (status === "In Progress") result.inProgress += 1;
        if (status === "Resolved") result.resolved += 1;
        if (priority === "Urgent" && status !== "Resolved") result.urgent += 1;
        if (dateText === today) result.today += 1;
        if (!Number.isNaN(date.getTime()) && date >= startOfWeek) result.week += 1;
        return result;
      },
      {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        urgent: 0,
        today: 0,
        week: 0,
      },
    );
  }, [tickets]);

  const hasFilters = Object.values(filters).some(Boolean);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyTicket());
    setEditingId(null);
  };

  const openEditor = () => {
    setShowEditor(true);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const closeEditor = () => {
    resetForm();
    setShowEditor(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "",
      priority: "",
      from: "",
      to: "",
    });
  };

  const createPayload = (source) => {
    const locationText =
      composeLocationText(source) || String(source.locationText || "").trim();
    const userId = currentUserId(currentUser);

    return {
      problemDate: `${source.problemDate}T00:00:00.000Z`,
      type: apiType(source.type),
      title:
        source.title.trim() ||
        source.description.trim().slice(0, 80) ||
        "Untitled issue",
      locationText,
      locationBuildings: Array.isArray(source.locationBuildings)
        ? source.locationBuildings
        : [],
      description: source.description.trim(),
      priority: apiPriority(source.priority),
      solutionSteps: source.steps.map((step) => step.trim()).filter(Boolean),
      solutionText: source.solutionText.trim(),
      resultNotes: source.finalResult.trim(),
      ...(userId ? { createdById: userId } : {}),
    };
  };

  const saveTicket = async (event) => {
    event.preventDefault();

    if (!composeLocationText(form) || !form.description.trim()) {
      setNotice(
        "Select at least one building or enter an additional system location, then add the problem description.",
      );
      return;
    }

    const desiredStatus = form.workflowStatus || "IN_PROGRESS";
    const solutionSteps = form.steps
      .map((step) => step.trim())
      .filter(Boolean);

    if (desiredStatus === "RESOLVED") {
      if (!form.solutionText.trim()) {
        setNotice("Solution summary is required before marking the issue as Resolved.");
        return;
      }

      if (!solutionSteps.length) {
        setNotice("Add at least one resolution step before marking the issue as Resolved.");
        return;
      }
    }

    if (
      apiStatus(form.existingStatus) === "RESOLVED" &&
      desiredStatus === "IN_PROGRESS"
    ) {
      setNotice("A resolved issue cannot be moved back to In Progress.");
      return;
    }

    setSaving(true);

    try {
      const payload = createPayload(form);
      let savedTicket;

      if (editingId) {
        savedTicket = await request(`${TICKETS_API}/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        savedTicket = await request(TICKETS_API, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      const ticketId = editingId || savedTicket?.id;
      const existingStatus = editingId
        ? apiStatus(form.existingStatus)
        : "OPEN";
      const userId = currentUserId(currentUser);

      if (!ticketId) {
        throw new Error("The backend did not return the saved issue ID.");
      }

      if (desiredStatus === "IN_PROGRESS" && existingStatus !== "IN_PROGRESS") {
        await request(`${TICKETS_API}/${ticketId}/start`, {
          method: "PATCH",
          body: JSON.stringify(userId ? { createdById: userId } : {}),
        });
      }

      if (desiredStatus === "RESOLVED" && existingStatus !== "RESOLVED") {
        await request(`${TICKETS_API}/${ticketId}/resolve`, {
          method: "PATCH",
          body: JSON.stringify({
            solutionText: form.solutionText.trim(),
            solutionSteps,
            resultNotes: form.finalResult.trim(),
            ...(userId ? { createdById: userId } : {}),
          }),
        });
      }

      setNotice(
        desiredStatus === "RESOLVED"
          ? "Issue saved and marked as Resolved."
          : "Issue saved and moved to In Progress.",
      );
      resetForm();
      setShowEditor(false);
      await loadTickets();
    } catch (error) {
      setNotice(error.message || "Could not save the issue.");
    } finally {
      setSaving(false);
    }
  };

  const startTicket = async (ticket) => {
    try {
      const userId = currentUserId(currentUser);
      await request(`${TICKETS_API}/${ticket.id}/start`, {
        method: "PATCH",
        body: JSON.stringify(userId ? { createdById: userId } : {}),
      });
      setNotice("Issue moved to In Progress.");
      await loadTickets();
    } catch (error) {
      setNotice(error.message || "Could not start the issue.");
    }
  };

  const resolveTicket = async (event) => {
    event.preventDefault();

    const ticket = resolveDialog?.ticket;
    const solutionText = resolveDialog?.solutionText.trim();

    if (!ticket || !solutionText) {
      setNotice("A solution summary is required.");
      return;
    }

    setSaving(true);
    try {
      await request(`${TICKETS_API}/${ticket.id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({
          solutionText,
          finalResult: resolveDialog.finalResult.trim(),
          steps: resolveDialog.steps
            .map((step) => step.trim())
            .filter(Boolean),
          ...(currentUserId(currentUser)
            ? { createdById: currentUserId(currentUser) }
            : {}),
        }),
      });
      setResolveDialog(null);
      setNotice("Issue resolved successfully.");
      await loadTickets();
    } catch (error) {
      setNotice(error.message || "Could not resolve the issue.");
    } finally {
      setSaving(false);
    }
  };

  const editTicket = (ticket) => {
    const resolvedLocation = extractStoredLocationData(
      ticket.locationText || "",
      buildingOptions,
    );
    const locationBuildings = Array.isArray(ticket.locationBuildings)
      ? ticket.locationBuildings
      : resolvedLocation.locationBuildings;
    const currentStatus = apiStatus(ticket.status);

    setEditingId(ticket.id);
    setForm({
      problemDate: localDate(
        new Date(ticket.problemDate || ticket.createdAt || Date.now()),
      ),
      type: displayType(ticket.type),
      title: ticket.title || "",
      locationText: ticket.locationText || "",
      locationBuildings,
      locationZones: resolvedLocation.locationZones.filter((key) =>
        locationBuildings.includes(parseZoneKey(key).building),
      ),
      customLocationText: resolvedLocation.customLocationText,
      description: ticket.description || "",
      priority: displayPriority(ticket.priority),
      status: displayStatus(ticket.status),
      workflowStatus:
        currentStatus === "RESOLVED" ? "RESOLVED" : "IN_PROGRESS",
      existingStatus: currentStatus,
      startedAt: ticket.startedAt || null,
      resolvedAt: ticket.resolvedAt || null,
      solutionText: ticket.solutionText || "",
      steps: ticketSteps(ticket).length ? ticketSteps(ticket) : [""],
      finalResult: ticket.finalResult || ticket.resultNotes || "",
    });
    setShowEditor(true);
    window.requestAnimationFrame(() => {
      editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const downloadWorkbook = (rows, filename) => {
    const sheet = XLSX.utils.aoa_to_sheet([excelHeaders, ...rows]);
    sheet["!cols"] = [14, 16, 30, 52, 38, 16, 16].map((width) => ({
      wch: width,
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Issue Register");
    XLSX.writeFile(workbook, filename);
  };

  const exportTickets = () => {
    downloadWorkbook(
      visibleTickets.map((ticket) => [
        formatDate(ticket.problemDate || ticket.createdAt),
        displayType(ticket.type),
        ticket.locationText || "",
        ticket.description || ticket.title || "",
        ticket.solutionText || "",
        displayStatus(ticket.status),
        formatDate(ticket.statusDate || ticket.updatedAt),
      ]),
      "issue-register.xlsx",
    );
  };

  const downloadTemplate = () => {
    downloadWorkbook(
      [
        [
          localDate(),
          "Software",
          "Example location",
          "Describe the problem",
          "",
          "Open",
          "",
        ],
      ],
      "issue-register-template.xlsx",
    );
  };

  const readExcel = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils
        .sheet_to_json(sheet, { defval: "" })
        .map(normalizeImportedRow)
        .filter((row) => row.locationText || row.description);

      setPreviewRows(rows);
      setNotice(`${rows.length} row(s) ready to review.`);
    } catch {
      setNotice("The selected file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  const saveImportedRows = async () => {
    if (!previewRows.length) return;

    setSaving(true);
    try {
      await Promise.all(
        previewRows.map((row) => {
          const resolvedLocations = resolveImportedLocations(
            row.locationText,
            buildingOptions,
          );
          const enrichedRow = { ...row, ...resolvedLocations };
          return request(TICKETS_API, {
            method: "POST",
            body: JSON.stringify({
              ...createPayload(enrichedRow),
              status: apiStatus(row.status),
            }),
          });
        }),
      );
      setNotice(`${previewRows.length} issue(s) imported successfully.`);
      setPreviewRows([]);
      await loadTickets();
    } catch (error) {
      setNotice(error.message || "Some imported rows could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="software-pro-page">
      <style>{softwareProStyles}</style>

      <div className="software-pro-shell">
        <header className="software-topbar">
          <div className="title-zone">
            {onBack && (
              <button type="button" className="back-button" onClick={onBack}>
                <Icon name="back" size={18} />
              </button>
            )}
            <div>
              <div className="eyebrow">
                <span className="live-dot" />
                SMART IT OPERATIONS
              </div>
              <h1>Software Problems</h1>
              <p>
                One professional workspace to register, track, execute and resolve
                technical issues.
              </p>
            </div>
          </div>

          <div className="top-actions">
            <button type="button" className="pro-button light" onClick={downloadTemplate}>
              <Icon name="file" size={17} />
              <span>Template</span>
            </button>
            <button type="button" className="pro-button light" onClick={exportTickets}>
              <Icon name="download" size={17} />
              <span>Export</span>
            </button>
            <button
              type="button"
              className="pro-button light"
              onClick={() => inputRef.current?.click()}
            >
              <Icon name="upload" size={17} />
              <span>Import Excel</span>
            </button>
            <button type="button" className="pro-button primary" onClick={openEditor}>
              <Icon name="plus" size={18} />
              <span>New Issue</span>
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              hidden
              onChange={readExcel}
            />
          </div>
        </header>

        <section className="stats-grid" aria-label="Issue statistics">
          <StatCard
            className="total"
            icon="layers"
            value={metrics.total}
            label="Total Issues"
            caption="Complete register"
            active={!filters.status && !filters.priority}
            onClick={() => setFilters((current) => ({ ...current, status: "", priority: "" }))}
          />
          <StatCard
            className="open"
            icon="alert"
            value={metrics.open}
            label="Open"
            caption="Waiting to start"
            active={filters.status === "Open"}
            onClick={() => setFilters((current) => ({ ...current, status: "Open" }))}
          />
          <StatCard
            className="progress"
            icon="clock"
            value={metrics.inProgress}
            label="In Progress"
            caption="Currently active"
            active={filters.status === "In Progress"}
            onClick={() => setFilters((current) => ({ ...current, status: "In Progress" }))}
          />
          <StatCard
            className="resolved"
            icon="resolved"
            value={metrics.resolved}
            label="Resolved"
            caption="Successfully closed"
            active={filters.status === "Resolved"}
            onClick={() => setFilters((current) => ({ ...current, status: "Resolved" }))}
          />
          <StatCard
            className="today"
            icon="calendar"
            value={metrics.today}
            label="Today"
            caption="Registered today"
            active={filters.from === localDate() && filters.to === localDate()}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                from: localDate(),
                to: localDate(),
              }))
            }
          />
          <StatCard
            className="urgent"
            icon="alert"
            value={metrics.urgent}
            label="Urgent Active"
            caption="Needs attention"
            active={filters.priority === "Urgent"}
            onClick={() => setFilters((current) => ({ ...current, priority: "Urgent" }))}
          />
        </section>

        {notice && (
          <div className="notice-bar" role="status">
            <div>
              <span className="notice-icon"><Icon name="check" size={16} /></span>
              <span>{notice}</span>
            </div>
            <button type="button" onClick={() => setNotice("")} aria-label="Close message">
              <Icon name="close" size={17} />
            </button>
          </div>
        )}

        {previewRows.length > 0 && (
          <section className="pro-panel import-panel">
            <div className="panel-head">
              <div className="panel-title-wrap">
                <span className="panel-icon cyan"><Icon name="upload" size={19} /></span>
                <div>
                  <span className="section-kicker">EXCEL IMPORT</span>
                  <h2>Review imported rows</h2>
                  <p>Confirm the data before saving it to the backend.</p>
                </div>
              </div>
              <div className="panel-actions">
                <span className="record-pill">{previewRows.length} rows</span>
                <button
                  type="button"
                  className="pro-button light"
                  onClick={() => setPreviewRows([])}
                >
                  Discard
                </button>
                <button
                  type="button"
                  className="pro-button primary"
                  disabled={saving}
                  onClick={saveImportedRows}
                >
                  <Icon name="check" size={17} />
                  Save Rows
                </button>
              </div>
            </div>

            <div className="pro-table-wrap compact-table">
              <table>
                <thead>
                  <tr>
                    {excelHeaders.slice(0, 6).map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.slice(0, 8).map((row, index) => (
                    <tr key={`${row.problemDate}-${index}`}>
                      <td>{row.problemDate}</td>
                      <td><TypeMark type={row.type} /></td>
                      <td>{row.locationText}</td>
                      <td className="description-cell">{row.description}</td>
                      <td>{row.solutionText || "—"}</td>
                      <td><StatusBadge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewRows.length > 8 && (
              <p className="table-foot-note">
                Showing the first 8 rows from {previewRows.length} imported rows.
              </p>
            )}
          </section>
        )}

        {showEditor && (
          <section ref={editorRef} className="pro-panel editor-panel">
            <div className="panel-head">
              <div className="panel-title-wrap">
                <span className="panel-icon navy"><Icon name={editingId ? "edit" : "plus"} size={19} /></span>
                <div>
                  <span className="section-kicker">ISSUE FORM</span>
                  <h2>{editingId ? "Edit issue details" : "Register a new issue"}</h2>
                  <p>
                    {editingId
                      ? "Update the issue information without changing the workflow."
                      : "Every new issue is created with Open status."}
                  </p>
                </div>
              </div>
              <button type="button" className="close-editor" onClick={closeEditor}>
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={saveTicket}>
              <div className="form-section">
                <div className="form-section-label">
                  <span>01</span>
                  <div>
                    <strong>Core Information</strong>
                    <small>Basic classification and location</small>
                  </div>
                </div>

                <div className="form-grid core-grid">
                  <label className="field-group">
                    <span>Date</span>
                    <div className="field-with-icon">
                      <Icon name="calendar" size={16} />
                      <input
                        type="date"
                        value={form.problemDate}
                        onChange={(event) => updateForm("problemDate", event.target.value)}
                      />
                    </div>
                  </label>

                  <label className="field-group">
                    <span>Category</span>
                    <select
                      value={form.type}
                      onChange={(event) => updateForm("type", event.target.value)}
                    >
                      {typeOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field-group">
                    <span>Priority</span>
                    <select
                      value={form.priority}
                      onChange={(event) => updateForm("priority", event.target.value)}
                    >
                      {priorityOptions.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  </label>

                  <div className="field-group location-builder-field">
                    <span>Backend Buildings <b>*</b></span>
                    <BuildingMultiSelect
                      options={buildingOptions}
                      value={form.locationBuildings}
                      onChange={updateSelectedBuildings}
                      loading={buildingsLoading}
                    />
                  </div>

                  <div className="field-group location-zone-field">
                    <span>Zones</span>
                    <ZoneMultiSelect
                      options={availableZoneOptions}
                      value={form.locationZones}
                      onChange={(value) => updateForm("locationZones", value)}
                      disabled={!form.locationBuildings.length}
                    />
                    <small className="field-help">
                      Zones are filtered automatically by the selected buildings.
                    </small>
                  </div>

                  <label className="field-group location-custom-field">
                    <span>Additional / System Location</span>
                    <div className="field-with-icon">
                      <Icon name="monitor" size={16} />
                      <input
                        placeholder="Example: Morpho program, server room..."
                        value={form.customLocationText}
                        onChange={(event) =>
                          updateForm("customLocationText", event.target.value)
                        }
                      />
                    </div>
                    <small className="field-help">
                      Saved result: {composeLocationText(form) || "No location selected yet"}
                    </small>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-label">
                  <span>02</span>
                  <div>
                    <strong>Problem Details</strong>
                    <small>Clear information for the technician</small>
                  </div>
                </div>

                <div className="form-grid details-grid">
                  <label className="field-group full-width">
                    <span>Issue Name</span>
                    <input
                      placeholder="Short and clear issue name"
                      value={form.title}
                      onChange={(event) => updateForm("title", event.target.value)}
                    />
                  </label>

                  <label className="field-group full-width">
                    <span>Problem Description <b>*</b></span>
                    <textarea
                      placeholder="Describe exactly what happened, the affected system and any visible error message..."
                      value={form.description}
                      onChange={(event) => updateForm("description", event.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className="workflow-choice-panel">
                <div className="workflow-choice-copy">
                  <span className="section-kicker">WORKFLOW STATUS</span>
                  <h3>Choose the current issue status</h3>
                  <p>
                    In Progress records the work start date. Resolved opens the
                    resolution section and records the completion date.
                  </p>
                </div>

                <div className="workflow-choice-buttons">
                  <button
                    type="button"
                    className={`workflow-choice in-progress ${
                      form.workflowStatus === "IN_PROGRESS" ? "active" : ""
                    }`}
                    disabled={apiStatus(form.existingStatus) === "RESOLVED"}
                    onClick={() => updateForm("workflowStatus", "IN_PROGRESS")}
                  >
                    <span className="workflow-choice-icon"><Icon name="clock" size={21} /></span>
                    <span>
                      <strong>In Progress</strong>
                      <small>
                        {form.startedAt
                          ? `Started: ${formatDateTime(form.startedAt)}`
                          : "Start time will be recorded when saved"}
                      </small>
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`workflow-choice resolved ${
                      form.workflowStatus === "RESOLVED" ? "active" : ""
                    }`}
                    onClick={() => updateForm("workflowStatus", "RESOLVED")}
                  >
                    <span className="workflow-choice-icon"><Icon name="resolved" size={21} /></span>
                    <span>
                      <strong>Resolved</strong>
                      <small>
                        {form.resolvedAt
                          ? `Resolved: ${formatDateTime(form.resolvedAt)}`
                          : "Resolution date will be recorded when saved"}
                      </small>
                    </span>
                  </button>
                </div>
              </div>

              {form.workflowStatus === "RESOLVED" ? (
                <div className="form-section resolution-section">
                  <div className="form-section-label">
                    <span>03</span>
                    <div>
                      <strong>Resolution Information</strong>
                      <small>Required because the issue is marked Resolved</small>
                    </div>
                  </div>

                  <div className="form-grid details-grid">
                    <label className="field-group full-width">
                      <span>Solution Summary <b>*</b></span>
                      <textarea
                        placeholder="Write a professional summary of the action taken..."
                        value={form.solutionText}
                        onChange={(event) =>
                          updateForm("solutionText", event.target.value)
                        }
                      />
                    </label>

                    <div className="field-group full-width">
                      <div className="steps-heading">
                        <div>
                          <span>Resolution Steps <b>*</b></span>
                          <small>Numbered steps shown in the final issue details.</small>
                        </div>
                        <button
                          type="button"
                          className="add-step-button"
                          onClick={() => updateForm("steps", [...form.steps, ""])}
                        >
                          <Icon name="plus" size={15} />
                          Add Step
                        </button>
                      </div>

                      <div className="steps-list">
                        {form.steps.map((step, index) => (
                          <div className="step-row" key={`form-step-${index}`}>
                            <span className="step-number">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            <input
                              value={step}
                              placeholder={`Resolution step ${index + 1}`}
                              onChange={(event) =>
                                updateForm(
                                  "steps",
                                  form.steps.map((item, stepIndex) =>
                                    stepIndex === index
                                      ? event.target.value
                                      : item,
                                  ),
                                )
                              }
                            />
                            <button
                              type="button"
                              className="remove-step-button"
                              aria-label="Remove step"
                              onClick={() =>
                                updateForm(
                                  "steps",
                                  form.steps.length === 1
                                    ? [""]
                                    : form.steps.filter(
                                        (_, stepIndex) => stepIndex !== index,
                                      ),
                                )
                              }
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <label className="field-group full-width">
                      <span>Final Result</span>
                      <input
                        placeholder="Example: Device is online, tested and working normally"
                        value={form.finalResult}
                        onChange={(event) =>
                          updateForm("finalResult", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="resolution-locked-panel">
                  <span className="resolution-locked-icon"><Icon name="clock" size={22} /></span>
                  <div>
                    <strong>Resolution section is closed</strong>
                    <p>
                      The issue will be saved as In Progress. The backend records
                      the exact start time, and the resolution fields appear when
                      you select Resolved.
                    </p>
                  </div>
                </div>
              )}

              <div className="form-footer">
                <div className="form-help">
                  <span><Icon name="alert" size={16} /></span>
                  Location and problem description are required.
                </div>
                <div className="form-footer-actions">
                  <button type="button" className="pro-button light" onClick={closeEditor}>
                    Cancel
                  </button>
                  <button type="submit" className="pro-button primary large" disabled={saving}>
                    {saving ? (
                      <span className="loading-inline"><i /> Saving...</span>
                    ) : (
                      <>
                        <Icon name="check" size={18} />
                        {form.workflowStatus === "RESOLVED"
                          ? editingId
                            ? "Save as Resolved"
                            : "Create & Resolve Issue"
                          : editingId
                            ? "Save & Keep In Progress"
                            : "Create & Start Work"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        <section className="pro-panel register-panel">
          <div className="panel-head register-head">
            <div className="panel-title-wrap">
              <span className="panel-icon cyan"><Icon name="layers" size={19} /></span>
              <div>
                <span className="section-kicker">LIVE REGISTER</span>
                <h2>Software Problem Log</h2>
                <p>Organized backend records with complete issue history.</p>
              </div>
            </div>

            <div className="register-meta">
              <span className="record-pill strong">{visibleTickets.length} records</span>
              <button type="button" className="icon-action" onClick={loadTickets} title="Refresh data">
                <Icon name="refresh" size={18} />
              </button>
            </div>
          </div>

          <div className="filters-shell">
            <div className="search-field">
              <Icon name="search" size={18} />
              <input
                placeholder="Search issue name, location or description..."
                value={filters.search}
                onChange={(event) =>
                  setFilters({ ...filters, search: event.target.value })
                }
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => setFilters({ ...filters, search: "" })}
                  aria-label="Clear search"
                >
                  <Icon name="close" size={15} />
                </button>
              )}
            </div>

            <div className="filter-control">
              <Icon name="monitor" size={16} />
              <select
                value={filters.type}
                onChange={(event) =>
                  setFilters({ ...filters, type: event.target.value })
                }
              >
                <option value="">All Categories</option>
                {typeOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <Icon name="clock" size={16} />
              <select
                value={filters.status}
                onChange={(event) =>
                  setFilters({ ...filters, status: event.target.value })
                }
              >
                <option value="">All Statuses</option>
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-control">
              <Icon name="alert" size={16} />
              <select
                value={filters.priority}
                onChange={(event) =>
                  setFilters({ ...filters, priority: event.target.value })
                }
              >
                <option value="">All Priorities</option>
                {priorityOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="filter-control date-control">
              <Icon name="calendar" size={16} />
              <input
                type="date"
                value={filters.from}
                title="From date"
                onChange={(event) =>
                  setFilters({ ...filters, from: event.target.value })
                }
              />
            </div>

            <div className="filter-control date-control">
              <Icon name="calendar" size={16} />
              <input
                type="date"
                value={filters.to}
                title="To date"
                onChange={(event) =>
                  setFilters({ ...filters, to: event.target.value })
                }
              />
            </div>

            {hasFilters && (
              <button type="button" className="clear-filter-button" onClick={clearFilters}>
                <Icon name="close" size={15} />
                Clear
              </button>
            )}
          </div>

          <div className="active-filter-line">
            <div>
              <Icon name="filter" size={15} />
              <span>
                Showing <strong>{visibleTickets.length}</strong> of <strong>{tickets.length}</strong> issues
              </span>
            </div>
            <span>Updated from the connected backend</span>
          </div>

          <div className="pro-table-wrap register-table-wrap">
            <table className="register-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Problem Location</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Status Date</th>
                  <th className="actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="empty-state-cell">
                      <div className="table-loader"><span /><span /><span /></div>
                      <strong>Loading issue register...</strong>
                      <small>Getting the latest data from the backend</small>
                    </td>
                  </tr>
                ) : !visibleTickets.length ? (
                  <tr>
                    <td colSpan="8" className="empty-state-cell">
                      <span className="empty-visual"><Icon name="search" size={27} /></span>
                      <strong>No matching issues</strong>
                      <small>Try changing the search or filter values.</small>
                      {hasFilters && (
                        <button type="button" className="pro-button light" onClick={clearFilters}>
                          Clear Filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  visibleTickets.map((ticket, index) => (
                    <tr key={ticket.id || `${ticket.title}-${index}`}>
                      <td className="date-cell">
                        <strong>{formatDate(ticket.problemDate || ticket.createdAt)}</strong>
                        <small>Issue date</small>
                      </td>
                      <td><TypeMark type={ticket.type} /></td>
                      <td>
                        <div className="location-cell">
                          <span><Icon name="map" size={14} /></span>
                          <strong>{ticket.locationText || "—"}</strong>
                        </div>
                      </td>
                      <td className="issue-cell">
                        <button
                          type="button"
                          className="issue-title-button"
                          onClick={() => setSelected(ticket)}
                        >
                          {ticket.title || ticket.description || "Untitled issue"}
                        </button>
                        <p>{ticket.description || "No description added."}</p>
                      </td>
                      <td><PriorityBadge priority={ticket.priority} /></td>
                      <td><StatusBadge status={ticket.status} /></td>
                      <td className="update-cell">
                        <strong>{formatDateTime(ticketStatusDate(ticket))}</strong>
                        <small>{ticketStatusDateLabel(ticket)}</small>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action details-action"
                            onClick={() => setSelected(ticket)}
                            title="View details"
                          >
                            <Icon name="eye" size={15} />
                            <span>Details</span>
                          </button>
                          <button
                            type="button"
                            className="table-action edit-action"
                            onClick={() => editTicket(ticket)}
                            title="Edit issue"
                          >
                            <Icon name="edit" size={15} />
                            <span>Edit</span>
                          </button>
                          {displayStatus(ticket.status) === "Open" && (
                            <button
                              type="button"
                              className="table-action start-action"
                              onClick={() => startTicket(ticket)}
                              title="Start issue"
                            >
                              <Icon name="play" size={14} />
                              <span>Start</span>
                            </button>
                          )}
                          {displayStatus(ticket.status) !== "Resolved" && (
                            <button
                              type="button"
                              className="table-action resolve-action"
                              onClick={() =>
                                setResolveDialog({
                                  ticket,
                                  solutionText: ticket.solutionText || "",
                                  finalResult: ticket.finalResult || "",
                                  steps: ticketSteps(ticket).length
                                    ? ticketSteps(ticket)
                                    : [""],
                                })
                              }
                              title="Resolve issue"
                            >
                              <Icon name="check" size={15} />
                              <span>Resolve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <section
            className="pro-modal details-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close details"
            >
              <Icon name="close" size={19} />
            </button>

            <div className="modal-hero">
              <div className="modal-hero-icon"><Icon name="monitor" size={24} /></div>
              <div>
                <span>ISSUE DETAILS</span>
                <h2>{selected.title || "Untitled issue"}</h2>
                <div className="modal-badges">
                  <TypeMark type={selected.type} />
                  <StatusBadge status={selected.status} />
                  <PriorityBadge priority={selected.priority} />
                </div>
              </div>
            </div>

            <div className="detail-cards">
              <div>
                <span><Icon name="calendar" size={15} /> Date</span>
                <strong>{formatDate(selected.problemDate || selected.createdAt)}</strong>
              </div>
              <div>
                <span><Icon name="map" size={15} /> Location</span>
                <strong>{selected.locationText || "—"}</strong>
              </div>
              <div>
                <span>
                  <Icon name={apiStatus(selected.status) === "RESOLVED" ? "resolved" : "clock"} size={15} />
                  {ticketStatusDateLabel(selected)}
                </span>
                <strong>{formatDateTime(ticketStatusDate(selected))}</strong>
              </div>
              <div>
                <span><Icon name="resolved" size={15} /> Final Result</span>
                <strong>{selected.finalResult || "Not added yet"}</strong>
              </div>
            </div>

            <div className="modal-content-block">
              <div className="content-block-title">
                <span>01</span>
                <h3>Problem Description</h3>
              </div>
              <p>{selected.description || "No description added."}</p>
            </div>

            {apiStatus(selected.status) === "RESOLVED" ? (
              <>
                <div className="modal-content-block solution-block">
                  <div className="content-block-title">
                    <span>02</span>
                    <h3>Solution Summary</h3>
                  </div>
                  <p>{selected.solutionText || "No solution has been added yet."}</p>
                </div>

                <div className="modal-content-block">
                  <div className="content-block-title">
                    <span>03</span>
                    <h3>Resolution Steps</h3>
                  </div>
                  {ticketSteps(selected).length ? (
                    <ol className="resolution-list">
                      {ticketSteps(selected).map((step, index) => (
                        <li key={`${step}-${index}`}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          <p>{step}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No resolution steps have been added yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="modal-content-block workflow-running-block">
                <div className="content-block-title">
                  <span><Icon name="clock" size={15} /></span>
                  <h3>Work In Progress</h3>
                </div>
                <p>
                  Work started at {formatDateTime(ticketStatusDate(selected))}.
                  Resolution information stays closed until the issue is marked Resolved.
                </p>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="pro-button light" onClick={() => setSelected(null)}>
                Close
              </button>
              <button
                type="button"
                className="pro-button primary"
                onClick={() => {
                  setSelected(null);
                  editTicket(selected);
                }}
              >
                <Icon name="edit" size={17} />
                Edit Issue
              </button>
            </div>
          </section>
        </div>
      )}

      {resolveDialog && (
        <div className="modal-backdrop" onMouseDown={() => setResolveDialog(null)}>
          <form
            className="pro-modal resolve-modal"
            onSubmit={resolveTicket}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setResolveDialog(null)}
              aria-label="Close resolution form"
            >
              <Icon name="close" size={19} />
            </button>

            <div className="modal-hero resolve-hero">
              <div className="modal-hero-icon"><Icon name="resolved" size={24} /></div>
              <div>
                <span>RESOLVE ISSUE</span>
                <h2>{resolveDialog.ticket.title || "Issue resolution"}</h2>
                <p>Document the completed work before closing the issue.</p>
              </div>
            </div>

            <div className="resolve-form-body">
              <label className="field-group">
                <span>Solution Summary <b>*</b></span>
                <textarea
                  autoFocus
                  placeholder="Write the action taken and the completed solution..."
                  value={resolveDialog.solutionText}
                  onChange={(event) =>
                    setResolveDialog({
                      ...resolveDialog,
                      solutionText: event.target.value,
                    })
                  }
                />
              </label>

              <div className="field-group">
                <div className="steps-heading">
                  <div>
                    <span>Resolution Steps</span>
                    <small>Add the work steps in the correct order.</small>
                  </div>
                  <button
                    type="button"
                    className="add-step-button"
                    onClick={() =>
                      setResolveDialog({
                        ...resolveDialog,
                        steps: [...resolveDialog.steps, ""],
                      })
                    }
                  >
                    <Icon name="plus" size={15} />
                    Add Step
                  </button>
                </div>

                <div className="steps-list">
                  {resolveDialog.steps.map((step, index) => (
                    <div className="step-row" key={`resolve-step-${index}`}>
                      <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
                      <input
                        value={step}
                        placeholder={`Resolution step ${index + 1}`}
                        onChange={(event) =>
                          setResolveDialog({
                            ...resolveDialog,
                            steps: resolveDialog.steps.map((item, stepIndex) =>
                              stepIndex === index ? event.target.value : item,
                            ),
                          })
                        }
                      />
                      <button
                        type="button"
                        className="remove-step-button"
                        onClick={() =>
                          setResolveDialog({
                            ...resolveDialog,
                            steps:
                              resolveDialog.steps.length === 1
                                ? [""]
                                : resolveDialog.steps.filter(
                                    (_, stepIndex) => stepIndex !== index,
                                  ),
                          })
                        }
                        aria-label="Remove resolution step"
                      >
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="field-group">
                <span>Final Result</span>
                <input
                  placeholder="Example: System tested and working normally"
                  value={resolveDialog.finalResult}
                  onChange={(event) =>
                    setResolveDialog({
                      ...resolveDialog,
                      finalResult: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="pro-button light"
                onClick={() => setResolveDialog(null)}
              >
                Cancel
              </button>
              <button type="submit" className="pro-button success large" disabled={saving}>
                {saving ? (
                  <span className="loading-inline"><i /> Saving...</span>
                ) : (
                  <>
                    <Icon name="check" size={18} />
                    Mark as Resolved
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

const softwareProStyles = `
  .software-pro-page,
  .software-pro-page * {
    box-sizing: border-box;
  }

  .software-pro-page {
    --smart-cyan: #18a9d4;
    --smart-cyan-dark: #087fa6;
    --smart-navy: #0f2035;
    --smart-navy-2: #172c46;
    --smart-text: #1d2e43;
    --smart-muted: #7d8fa4;
    --smart-line: #dfe9f1;
    --smart-line-soft: #edf3f7;
    --smart-bg: #f2f7fa;
    --smart-panel: #ffffff;
    --success: #0db87a;
    --warning: #f6a313;
    --danger: #ef4e59;
    --violet: #7658f6;
    min-height: 100%;
    width: 100%;
    padding: 22px;
    color: var(--smart-text);
    background:
      radial-gradient(circle at 12% -10%, rgba(24, 169, 212, 0.11), transparent 31%),
      radial-gradient(circle at 92% 5%, rgba(118, 88, 246, 0.075), transparent 24%),
      linear-gradient(180deg, #f9fcfe 0%, var(--smart-bg) 31%, #f4f8fb 100%);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .software-pro-shell {
    width: min(100%, 1720px);
    margin: 0 auto;
  }

  .ui-icon {
    flex: 0 0 auto;
    display: block;
  }

  .software-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 22px;
    min-height: 90px;
    margin-bottom: 18px;
    padding: 8px 4px;
  }

  .title-zone {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    min-width: 0;
  }

  .back-button {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    margin-top: 4px;
    border: 1px solid var(--smart-line);
    border-radius: 13px;
    background: rgba(255,255,255,.92);
    color: var(--smart-navy);
    box-shadow: 0 8px 20px rgba(23, 44, 70, .07);
    cursor: pointer;
    transition: .2s ease;
  }

  .back-button:hover {
    color: var(--smart-cyan-dark);
    border-color: #b6dfec;
    transform: translateX(-2px);
  }

  .eyebrow,
  .section-kicker {
    display: flex;
    align-items: center;
    gap: 7px;
    margin-bottom: 5px;
    color: var(--smart-cyan-dark);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .16em;
  }

  .live-dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--success);
    box-shadow: 0 0 0 5px rgba(13, 184, 122, .11);
  }

  .software-topbar h1 {
    margin: 0;
    color: var(--smart-navy);
    font-size: clamp(25px, 2.3vw, 35px);
    line-height: 1.12;
    letter-spacing: -.045em;
  }

  .software-topbar p {
    max-width: 700px;
    margin: 7px 0 0;
    color: var(--smart-muted);
    font-size: 13px;
    line-height: 1.55;
  }

  .top-actions,
  .panel-actions,
  .form-footer-actions,
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    flex-wrap: wrap;
  }

  .pro-button {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 9px 14px;
    border: 1px solid transparent;
    border-radius: 11px;
    font: inherit;
    font-size: 12px;
    font-weight: 850;
    white-space: nowrap;
    cursor: pointer;
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease, background .18s ease;
  }

  .pro-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .pro-button:disabled {
    opacity: .62;
    cursor: wait;
  }

  .pro-button.light {
    border-color: var(--smart-line);
    background: rgba(255,255,255,.94);
    color: #52687d;
    box-shadow: 0 7px 17px rgba(27, 49, 71, .045);
  }

  .pro-button.light:hover:not(:disabled) {
    color: var(--smart-navy);
    border-color: #b9d8e5;
    box-shadow: 0 9px 22px rgba(24, 119, 151, .09);
  }

  .pro-button.primary {
    border-color: var(--smart-navy);
    background: linear-gradient(135deg, var(--smart-navy), #1b3656);
    color: #fff;
    box-shadow: 0 12px 23px rgba(15, 32, 53, .17);
  }

  .pro-button.primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #142b47, #22476f);
    box-shadow: 0 14px 27px rgba(15, 32, 53, .23);
  }

  .pro-button.success {
    border-color: #0aa66e;
    background: linear-gradient(135deg, #0aa66e, #13bf83);
    color: #fff;
    box-shadow: 0 12px 23px rgba(13, 184, 122, .2);
  }

  .pro-button.large {
    min-height: 45px;
    padding-inline: 18px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(155px, 1fr));
    gap: 13px;
    margin-bottom: 18px;
  }

  .stat-card {
    --accent: var(--smart-cyan);
    position: relative;
    min-width: 0;
    min-height: 112px;
    display: grid;
    grid-template-columns: 42px 1fr 17px;
    align-items: center;
    gap: 11px;
    overflow: hidden;
    padding: 18px 15px 16px;
    border: 1px solid var(--smart-line);
    border-radius: 17px;
    background: rgba(255,255,255,.96);
    color: var(--smart-text);
    text-align: left;
    box-shadow: 0 11px 28px rgba(21, 49, 73, .065);
    cursor: pointer;
    transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
  }

  .stat-card:hover,
  .stat-card.active {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--accent) 45%, white);
    box-shadow: 0 16px 34px rgba(21, 49, 73, .11);
  }

  .stat-card.active {
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--accent) 7%, white), #fff 66%);
  }

  .stat-card.total { --accent: #5b4ff5; }
  .stat-card.open { --accent: #ef4e59; }
  .stat-card.progress { --accent: #18a9d4; }
  .stat-card.resolved { --accent: #0db87a; }
  .stat-card.today { --accent: #f59b0b; }
  .stat-card.urgent { --accent: #bd3dd9; }

  .stat-accent {
    position: absolute;
    inset: 0 0 auto;
    height: 3px;
    background: var(--accent);
  }

  .stat-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: color-mix(in srgb, var(--accent) 11%, white);
    color: var(--accent);
  }

  .stat-copy {
    min-width: 0;
    display: grid;
  }

  .stat-copy strong {
    color: var(--accent);
    font-size: 26px;
    line-height: 1;
    letter-spacing: -.04em;
  }

  .stat-copy > span {
    margin-top: 7px;
    color: var(--smart-navy);
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .stat-copy small {
    margin-top: 3px;
    overflow: hidden;
    color: #9aa9b8;
    font-size: 10px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .stat-arrow {
    color: #b6c2ce;
    transition: .2s ease;
  }

  .stat-card:hover .stat-arrow {
    color: var(--accent);
    transform: translateX(2px);
  }

  .notice-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 16px;
    padding: 11px 13px;
    border: 1px solid #bde5dc;
    border-radius: 13px;
    background: linear-gradient(135deg, #effcf8, #f8fffd);
    color: #18735a;
    box-shadow: 0 8px 22px rgba(18, 113, 85, .06);
    font-size: 12px;
    font-weight: 750;
  }

  .notice-bar > div {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .notice-icon {
    width: 27px;
    height: 27px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #d9f7ed;
  }

  .notice-bar > button {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .pro-panel {
    position: relative;
    margin-bottom: 18px;
    overflow: hidden;
    border: 1px solid var(--smart-line);
    border-radius: 20px;
    background: rgba(255,255,255,.97);
    box-shadow: 0 15px 38px rgba(17, 44, 68, .075);
  }

  .panel-head {
    min-height: 78px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 17px 20px;
    border-bottom: 1px solid var(--smart-line-soft);
    background:
      linear-gradient(90deg, rgba(24,169,212,.03), transparent 34%),
      #fff;
  }

  .panel-title-wrap {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .panel-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 13px;
  }

  .panel-icon.cyan {
    background: #e8f8fc;
    color: var(--smart-cyan-dark);
  }

  .panel-icon.navy {
    background: #e9eef5;
    color: var(--smart-navy);
  }

  .panel-head h2 {
    margin: 0;
    color: var(--smart-navy);
    font-size: 17px;
    line-height: 1.2;
    letter-spacing: -.02em;
  }

  .panel-head p {
    margin: 4px 0 0;
    color: var(--smart-muted);
    font-size: 11px;
  }

  .section-kicker {
    margin-bottom: 4px;
    font-size: 9px;
  }

  .record-pill {
    display: inline-flex;
    align-items: center;
    min-height: 32px;
    padding: 6px 11px;
    border: 1px solid #deebf1;
    border-radius: 999px;
    background: #f8fbfd;
    color: #71879a;
    font-size: 10px;
    font-weight: 900;
    white-space: nowrap;
  }

  .record-pill.strong {
    border-color: #d3e5ee;
    background: #f5fafc;
    color: var(--smart-navy);
  }

  .close-editor,
  .icon-action,
  .modal-close {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid var(--smart-line);
    border-radius: 11px;
    background: #fff;
    color: #75899c;
    cursor: pointer;
    transition: .18s ease;
  }

  .close-editor:hover,
  .icon-action:hover,
  .modal-close:hover {
    border-color: #badce8;
    color: var(--smart-cyan-dark);
    background: #f4fbfd;
  }

  .editor-panel form {
    padding: 0 20px 20px;
  }

  .form-section {
    display: grid;
    grid-template-columns: 185px minmax(0, 1fr);
    gap: 22px;
    padding: 22px 0;
    border-bottom: 1px solid var(--smart-line-soft);
  }

  .form-section-label {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding-top: 4px;
  }

  .form-section-label > span {
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 10px;
    background: var(--smart-navy);
    color: #fff;
    font-size: 10px;
    font-weight: 900;
  }

  .form-section-label strong {
    display: block;
    color: var(--smart-navy);
    font-size: 12px;
  }

  .form-section-label small {
    display: block;
    margin-top: 3px;
    color: #9aa9b7;
    font-size: 10px;
    line-height: 1.4;
  }

  .form-grid {
    display: grid;
    gap: 13px;
  }

  .core-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .details-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .full-width {
    grid-column: 1 / -1;
  }

  .field-group {
    display: grid;
    gap: 7px;
    min-width: 0;
    color: #566d82;
    font-size: 11px;
    font-weight: 800;
  }

  .field-group > span,
  .steps-heading > div > span {
    color: #4e6579;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .03em;
    text-transform: uppercase;
  }

  .field-group b {
    color: var(--danger);
  }

  .software-pro-page input,
  .software-pro-page select,
  .software-pro-page textarea {
    width: 100%;
    min-width: 0;
    border: 1px solid #d9e5ed;
    border-radius: 11px;
    outline: none;
    background: #fbfdfe;
    color: var(--smart-text);
    font: inherit;
    font-size: 12px;
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .software-pro-page input,
  .software-pro-page select {
    min-height: 43px;
    padding: 9px 11px;
  }

  .software-pro-page textarea {
    min-height: 95px;
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.55;
  }

  .software-pro-page input::placeholder,
  .software-pro-page textarea::placeholder {
    color: #a4b1bd;
  }

  .software-pro-page input:focus,
  .software-pro-page select:focus,
  .software-pro-page textarea:focus {
    border-color: var(--smart-cyan);
    background: #fff;
    box-shadow: 0 0 0 4px rgba(24,169,212,.1);
  }

  .field-with-icon {
    position: relative;
  }

  .field-with-icon > .ui-icon {
    position: absolute;
    top: 50%;
    left: 12px;
    z-index: 2;
    color: #90a2b3;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .field-with-icon input {
    padding-left: 37px;
  }

  .steps-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 9px;
  }

  .steps-heading small {
    display: block;
    margin-top: 3px;
    color: #9aa9b7;
    font-size: 10px;
    font-weight: 500;
  }

  .add-step-button {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border: 1px solid #bfe2ec;
    border-radius: 10px;
    background: #effafe;
    color: var(--smart-cyan-dark);
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .steps-list {
    display: grid;
    gap: 8px;
  }

  .step-row {
    display: grid;
    grid-template-columns: 39px minmax(0, 1fr) 38px;
    gap: 8px;
    align-items: center;
  }

  .step-number {
    width: 39px;
    height: 39px;
    display: grid;
    place-items: center;
    border-radius: 11px;
    background: #edf6fa;
    color: var(--smart-cyan-dark);
    font-size: 10px;
    font-weight: 900;
  }

  .remove-step-button {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border: 1px solid #f0d4d7;
    border-radius: 10px;
    background: #fff8f8;
    color: #d95a65;
    cursor: pointer;
  }

  .form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: 18px;
  }

  .form-help {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #8396a7;
    font-size: 10px;
  }

  .form-help > span {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #fff6e7;
    color: #c9840d;
  }

  .filters-shell {
    display: grid;
    grid-template-columns: minmax(260px, 1.8fr) repeat(3, minmax(135px, .7fr)) repeat(2, minmax(135px, .7fr)) auto;
    gap: 9px;
    padding: 15px 20px;
    border-bottom: 1px solid var(--smart-line-soft);
    background: #fbfdfe;
  }

  .search-field,
  .filter-control {
    min-height: 42px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border: 1px solid #dce8ef;
    border-radius: 11px;
    background: #fff;
    color: #8da0b1;
  }

  .search-field:focus-within,
  .filter-control:focus-within {
    border-color: var(--smart-cyan);
    box-shadow: 0 0 0 3px rgba(24,169,212,.09);
  }

  .search-field input,
  .filter-control select,
  .filter-control input {
    min-height: 39px;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none !important;
    color: #50677b;
    font-size: 11px;
  }

  .search-field > button {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 0;
    border-radius: 8px;
    background: #f1f6f9;
    color: #889aaa;
    cursor: pointer;
  }

  .date-control input {
    min-width: 107px;
  }

  .clear-filter-button {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 11px;
    border: 1px solid #f0d4d7;
    border-radius: 11px;
    background: #fff8f8;
    color: #d6535d;
    font: inherit;
    font-size: 10px;
    font-weight: 900;
    cursor: pointer;
  }

  .active-filter-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 20px;
    color: #93a3b1;
    font-size: 10px;
  }

  .active-filter-line > div {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .active-filter-line strong {
    color: var(--smart-navy);
  }

  .pro-table-wrap {
    width: 100%;
    overflow: auto;
  }

  .compact-table {
    padding: 0 20px 18px;
  }

  .pro-table-wrap table {
    width: 100%;
    min-width: 1120px;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 11px;
  }

  .pro-table-wrap thead th {
    position: sticky;
    top: 0;
    z-index: 3;
    padding: 12px 13px;
    border-top: 1px solid var(--smart-line);
    border-bottom: 1px solid var(--smart-line);
    background: #f4f9fc;
    color: #7c90a2;
    font-size: 9px;
    font-weight: 950;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: .08em;
    white-space: nowrap;
  }

  .pro-table-wrap thead th:first-child {
    border-left: 1px solid var(--smart-line);
    border-radius: 12px 0 0 0;
  }

  .pro-table-wrap thead th:last-child {
    border-right: 1px solid var(--smart-line);
    border-radius: 0 12px 0 0;
  }

  .pro-table-wrap tbody td {
    padding: 13px;
    border-bottom: 1px solid var(--smart-line-soft);
    background: #fff;
    color: #50677b;
    vertical-align: middle;
  }

  .pro-table-wrap tbody tr:hover td {
    background: #f9fcfe;
  }

  .register-table-wrap {
    padding: 0 20px 20px;
  }

  .register-table tbody tr:last-child td {
    border-bottom: 1px solid var(--smart-line);
  }

  .register-table tbody td:first-child {
    border-left: 1px solid var(--smart-line);
  }

  .register-table tbody td:last-child {
    border-right: 1px solid var(--smart-line);
  }

  .register-table tbody tr:last-child td:first-child {
    border-radius: 0 0 0 12px;
  }

  .register-table tbody tr:last-child td:last-child {
    border-radius: 0 0 12px 0;
  }

  .date-cell strong,
  .update-cell strong {
    display: block;
    color: var(--smart-navy);
    font-size: 11px;
    white-space: nowrap;
  }

  .date-cell small,
  .update-cell small {
    display: block;
    margin-top: 4px;
    color: #a1afbb;
    font-size: 9px;
    white-space: nowrap;
  }

  .type-mark {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--smart-navy);
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }

  .type-mark-icon {
    width: 29px;
    height: 29px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #e8f8fc;
    color: var(--smart-cyan-dark);
  }

  .type-mark.gates .type-mark-icon {
    background: #f0ecff;
    color: #7658f6;
  }

  .type-mark.reader .type-mark-icon {
    background: #fff4e4;
    color: #d3820d;
  }

  .location-cell {
    max-width: 210px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .location-cell > span {
    width: 27px;
    height: 27px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 9px;
    background: #f2f6f9;
    color: #71879a;
  }

  .location-cell strong {
    overflow: hidden;
    color: #40586e;
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
  }

  .issue-cell {
    min-width: 240px;
    max-width: 340px;
  }

  .issue-title-button {
    max-width: 100%;
    overflow: hidden;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--smart-navy);
    font: inherit;
    font-size: 11px;
    font-weight: 900;
    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;
  }

  .issue-title-button:hover {
    color: var(--smart-cyan-dark);
  }

  .issue-cell p {
    max-width: 320px;
    margin: 5px 0 0;
    overflow: hidden;
    color: #98a8b6;
    font-size: 9px;
    line-height: 1.45;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .status-badge,
  .priority-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 27px;
    padding: 5px 9px;
    border-radius: 999px;
    font-size: 9px;
    font-weight: 950;
    white-space: nowrap;
  }

  .status-badge i {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
    box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 13%, transparent);
  }

  .status-badge.open {
    background: #fff3e3;
    color: #d17d08;
  }

  .status-badge.in-progress {
    background: #e9f6fb;
    color: #1689ae;
  }

  .status-badge.resolved {
    background: #e7f8f1;
    color: #0a9a65;
  }

  .priority-badge.low {
    background: #f0f4f7;
    color: #6f8292;
  }

  .priority-badge.medium {
    background: #edf4ff;
    color: #4d73b7;
  }

  .priority-badge.high {
    background: #fff1df;
    color: #ca7609;
  }

  .priority-badge.urgent {
    background: #ffeaec;
    color: #d94754;
  }

  .actions-heading {
    min-width: 235px;
  }

  .table-actions {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }

  .table-action {
    min-height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 6px 8px;
    border: 1px solid #dce7ee;
    border-radius: 8px;
    background: #fff;
    color: #61778a;
    font: inherit;
    font-size: 9px;
    font-weight: 850;
    cursor: pointer;
    transition: .17s ease;
  }

  .table-action:hover {
    transform: translateY(-1px);
  }

  .details-action:hover {
    border-color: #b8dce8;
    background: #f1fbfe;
    color: var(--smart-cyan-dark);
  }

  .edit-action:hover {
    border-color: #c9c0fb;
    background: #f6f4ff;
    color: #6551d4;
  }

  .start-action {
    border-color: #b9deeb;
    background: #edf9fc;
    color: #1689ae;
  }

  .resolve-action {
    border-color: #bfe7d7;
    background: #effbf6;
    color: #0a9160;
  }

  .empty-state-cell {
    height: 270px;
    text-align: center;
  }

  .empty-state-cell > strong,
  .empty-state-cell > small {
    display: block;
  }

  .empty-state-cell > strong {
    margin-top: 13px;
    color: var(--smart-navy);
    font-size: 13px;
  }

  .empty-state-cell > small {
    margin: 5px 0 14px;
    color: #9aaab8;
    font-size: 10px;
  }

  .empty-visual {
    width: 54px;
    height: 54px;
    display: grid;
    place-items: center;
    margin: auto;
    border-radius: 17px;
    background: #eef7fa;
    color: var(--smart-cyan-dark);
  }

  .table-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
  }

  .table-loader span {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: var(--smart-cyan);
    animation: tablePulse 1s infinite ease-in-out;
  }

  .table-loader span:nth-child(2) { animation-delay: .15s; }
  .table-loader span:nth-child(3) { animation-delay: .3s; }

  @keyframes tablePulse {
    0%, 100% { transform: translateY(0); opacity: .45; }
    50% { transform: translateY(-5px); opacity: 1; }
  }

  .table-foot-note {
    margin: 0;
    padding: 0 20px 18px;
    color: #94a5b3;
    font-size: 10px;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    place-items: center;
    overflow: auto;
    padding: 25px;
    background: rgba(8, 22, 38, .59);
    backdrop-filter: blur(8px);
    animation: modalFade .18s ease;
  }

  @keyframes modalFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .pro-modal {
    position: relative;
    width: min(720px, 100%);
    max-height: calc(100vh - 50px);
    overflow: auto;
    border: 1px solid rgba(255,255,255,.72);
    border-radius: 22px;
    background: #fff;
    box-shadow: 0 34px 90px rgba(0,0,0,.28);
    animation: modalRise .22s ease;
  }

  @keyframes modalRise {
    from { opacity: 0; transform: translateY(14px) scale(.985); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 3;
  }

  .modal-hero {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 24px 64px 22px 24px;
    border-bottom: 1px solid var(--smart-line-soft);
    background:
      radial-gradient(circle at 8% 20%, rgba(24,169,212,.13), transparent 26%),
      linear-gradient(135deg, #fbfeff, #f5fafc);
  }

  .modal-hero-icon {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 15px;
    background: linear-gradient(135deg, var(--smart-navy), #1d4268);
    color: #fff;
    box-shadow: 0 12px 24px rgba(15,32,53,.19);
  }

  .modal-hero > div:last-child {
    min-width: 0;
  }

  .modal-hero > div > span {
    color: var(--smart-cyan-dark);
    font-size: 9px;
    font-weight: 950;
    letter-spacing: .14em;
  }

  .modal-hero h2 {
    margin: 5px 0 10px;
    color: var(--smart-navy);
    font-size: 22px;
    line-height: 1.25;
    letter-spacing: -.035em;
  }

  .modal-hero p {
    margin: 5px 0 0;
    color: var(--smart-muted);
    font-size: 11px;
  }

  .modal-badges {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: wrap;
  }

  .detail-cards {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    padding: 20px 24px 0;
  }

  .detail-cards > div {
    min-height: 76px;
    padding: 13px;
    border: 1px solid var(--smart-line);
    border-radius: 14px;
    background: #fbfdfe;
  }

  .detail-cards span {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #8fa0ae;
    font-size: 9px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: .04em;
  }

  .detail-cards strong {
    display: block;
    margin-top: 8px;
    color: #395168;
    font-size: 11px;
    line-height: 1.45;
  }

  .modal-content-block {
    margin: 16px 24px 0;
    padding: 15px;
    border: 1px solid var(--smart-line);
    border-radius: 15px;
    background: #fff;
  }

  .solution-block {
    background: #f8fcfe;
  }

  .content-block-title {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 9px;
  }

  .content-block-title span {
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #eaf7fb;
    color: var(--smart-cyan-dark);
    font-size: 9px;
    font-weight: 950;
  }

  .content-block-title h3 {
    margin: 0;
    color: var(--smart-navy);
    font-size: 12px;
  }

  .modal-content-block > p {
    margin: 0;
    color: #617689;
    font-size: 11px;
    line-height: 1.75;
    white-space: pre-wrap;
  }

  .resolution-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .resolution-list li {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 9px;
    align-items: start;
  }

  .resolution-list li > span {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    background: #eef7fa;
    color: var(--smart-cyan-dark);
    font-size: 9px;
    font-weight: 950;
  }

  .resolution-list li p {
    margin: 7px 0 0;
    color: #607588;
    font-size: 11px;
    line-height: 1.55;
  }

  .modal-footer {
    margin-top: 18px;
    padding: 16px 24px 21px;
    border-top: 1px solid var(--smart-line-soft);
    background: #fbfdfe;
  }

  .resolve-form-body {
    display: grid;
    gap: 17px;
    padding: 20px 24px 4px;
  }

  .resolve-modal textarea {
    min-height: 120px;
  }

  .resolve-hero .modal-hero-icon {
    background: linear-gradient(135deg, #079b67, #11bd80);
    box-shadow: 0 12px 24px rgba(13,184,122,.22);
  }

  .loading-inline {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .loading-inline i {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255,255,255,.45);
    border-top-color: #fff;
    border-radius: 999px;
    animation: spin .7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 1450px) {
    .stats-grid {
      grid-template-columns: repeat(3, minmax(180px, 1fr));
    }

    .filters-shell {
      grid-template-columns: minmax(260px, 1.6fr) repeat(3, minmax(135px, .75fr));
    }

    .date-control,
    .clear-filter-button {
      grid-row: 2;
    }
  }

  @media (max-width: 1080px) {
    .software-topbar {
      align-items: flex-start;
      flex-direction: column;
    }

    .top-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .core-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .form-section {
      grid-template-columns: 1fr;
      gap: 14px;
    }

    .filters-shell {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .search-field {
      grid-column: 1 / -1;
    }

    .date-control,
    .clear-filter-button {
      grid-row: auto;
    }
  }

  @media (max-width: 760px) {
    .software-pro-page {
      padding: 13px;
    }

    .stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .stat-card {
      grid-template-columns: 36px 1fr;
      min-height: 102px;
      padding: 16px 13px;
    }

    .stat-icon {
      width: 36px;
      height: 36px;
    }

    .stat-arrow {
      display: none;
    }

    .panel-head,
    .form-footer,
    .active-filter-line {
      align-items: flex-start;
      flex-direction: column;
    }

    .panel-actions,
    .form-footer-actions,
    .modal-footer {
      width: 100%;
      justify-content: stretch;
    }

    .panel-actions .pro-button,
    .form-footer-actions .pro-button,
    .modal-footer .pro-button {
      flex: 1;
    }

    .core-grid,
    .details-grid,
    .filters-shell,
    .detail-cards {
      grid-template-columns: 1fr;
    }

    .search-field,
    .full-width {
      grid-column: auto;
    }

    .modal-backdrop {
      padding: 10px;
    }

    .pro-modal {
      max-height: calc(100vh - 20px);
      border-radius: 18px;
    }

    .modal-hero {
      padding: 21px 58px 19px 18px;
    }

    .detail-cards,
    .resolve-form-body {
      padding-inline: 18px;
    }

    .modal-content-block {
      margin-inline: 18px;
    }

    .modal-footer {
      padding-inline: 18px;
    }
  }

  @media (max-width: 500px) {
    .software-topbar h1 {
      font-size: 25px;
    }

    .top-actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    }

    .top-actions .pro-button {
      width: 100%;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-card {
      min-height: 94px;
    }

    .form-section {
      padding: 17px 0;
    }

    .editor-panel form,
    .filters-shell,
    .panel-head,
    .register-table-wrap,
    .compact-table {
      padding-left: 14px;
      padding-right: 14px;
    }

    .steps-heading {
      align-items: flex-start;
      flex-direction: column;
    }

    .add-step-button {
      width: 100%;
      justify-content: center;
    }
  }


  .location-builder-field,
  .location-zone-field,
  .location-custom-field {
    grid-column: span 2;
  }

  .zone-chip {
    border-color: #d9ccfb;
    background: #f7f2ff;
    color: #7046bd;
  }

  .zone-chip b {
    font-size: 11px;
  }

  .zone-chip small {
    max-width: 150px;
    overflow: hidden;
    font-size: 9px;
    opacity: .75;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workflow-choice-panel {
    display: grid;
    grid-template-columns: minmax(220px, .7fr) minmax(0, 1.3fr);
    gap: 22px;
    align-items: center;
    margin: 0 20px 20px;
    border: 1px solid #dce9f1;
    border-radius: 17px;
    padding: 18px;
    background: linear-gradient(135deg, #f8fcfe, #fff);
  }

  .workflow-choice-copy h3 {
    margin: 0;
    color: var(--smart-navy);
    font-size: 15px;
  }

  .workflow-choice-copy p {
    margin: 6px 0 0;
    color: #7c91a3;
    font-size: 11px;
    line-height: 1.6;
  }

  .workflow-choice-buttons {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 11px;
  }

  .workflow-choice {
    min-height: 82px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: 1px solid #dce7ef;
    border-radius: 15px;
    padding: 13px;
    background: #fff;
    color: #536b7f;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: .18s ease;
  }

  .workflow-choice:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 25px rgba(29, 63, 87, .08);
  }

  .workflow-choice:disabled {
    opacity: .45;
    cursor: not-allowed;
  }

  .workflow-choice-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 13px;
  }

  .workflow-choice > span:last-child {
    min-width: 0;
    display: grid;
    gap: 4px;
  }

  .workflow-choice strong {
    color: var(--smart-navy);
    font-size: 13px;
  }

  .workflow-choice small {
    overflow: hidden;
    color: #899baa;
    font-size: 10px;
    line-height: 1.45;
    text-overflow: ellipsis;
  }

  .workflow-choice.in-progress .workflow-choice-icon {
    background: #e8f8fc;
    color: #0c91ba;
  }

  .workflow-choice.resolved .workflow-choice-icon {
    background: #e7f9f1;
    color: #0b9d69;
  }

  .workflow-choice.in-progress.active {
    border-color: #73cce5;
    background: #f2fbfe;
    box-shadow: 0 0 0 4px rgba(24, 169, 212, .08);
  }

  .workflow-choice.resolved.active {
    border-color: #7dd9b5;
    background: #f2fcf8;
    box-shadow: 0 0 0 4px rgba(13, 184, 122, .08);
  }

  .resolution-locked-panel {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    margin: 0 20px 20px;
    border: 1px dashed #b9dbe7;
    border-radius: 16px;
    padding: 18px;
    background: #f5fbfd;
    color: #507085;
  }

  .resolution-locked-icon {
    width: 42px;
    height: 42px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border-radius: 13px;
    background: #e3f5fb;
    color: #138cb2;
  }

  .resolution-locked-panel strong {
    display: block;
    color: var(--smart-navy);
    font-size: 13px;
  }

  .resolution-locked-panel p {
    margin: 5px 0 0;
    color: #7890a2;
    font-size: 11px;
    line-height: 1.6;
  }

  .workflow-running-block {
    border-color: #cce7f0;
    background: #f4fbfd;
  }

  .field-help {
    color: #7890a3;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.45;
  }

  .building-picker {
    position: relative;
    min-width: 0;
  }

  .building-picker-trigger {
    width: 100%;
    min-height: 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border: 1px solid #d7e5ee;
    border-radius: 13px;
    padding: 0 14px;
    background: #fbfdff;
    color: #20364b;
    font: inherit;
    cursor: pointer;
    transition: border-color .18s ease, box-shadow .18s ease, background .18s ease;
  }

  .building-picker.open .building-picker-trigger,
  .building-picker-trigger:focus {
    border-color: #1aa8d2;
    box-shadow: 0 0 0 4px rgba(26, 168, 210, .11);
    outline: none;
    background: #fff;
  }

  .building-picker-trigger:disabled {
    cursor: wait;
    opacity: .7;
  }

  .building-picker-summary {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-width: 0;
    color: #647f94;
    font-size: 13px;
    font-weight: 700;
  }

  .building-picker-summary > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .picker-chevron {
    display: inline-grid;
    place-items: center;
    color: #668096;
    transform: rotate(90deg);
    transition: transform .18s ease;
  }

  .building-picker.open .picker-chevron {
    transform: rotate(-90deg);
  }

  .selected-building-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin-top: 9px;
  }

  .building-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    max-width: 100%;
    border: 1px solid #bfe7f3;
    border-radius: 999px;
    padding: 6px 8px 6px 11px;
    background: #eefaff;
    color: #0e7897;
    font-size: 11px;
    font-weight: 800;
  }

  .building-chip button {
    width: 18px;
    height: 18px;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: rgba(14, 120, 151, .1);
    color: inherit;
    font: inherit;
    line-height: 1;
    cursor: pointer;
  }

  .building-picker-menu {
    position: absolute;
    z-index: 70;
    top: calc(100% + 9px);
    left: 0;
    right: 0;
    overflow: hidden;
    border: 1px solid #cfe4ee;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 24px 65px rgba(25, 64, 89, .18);
  }

  .picker-search {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 11px;
    border: 1px solid #dce9f0;
    border-radius: 11px;
    padding: 0 11px;
    background: #f8fbfd;
    color: #7390a3;
  }

  .picker-search input {
    min-height: 40px;
    border: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .building-options-list {
    max-height: 280px;
    overflow: auto;
    padding: 0 8px 8px;
  }

  .building-option {
    width: 100%;
    display: grid;
    grid-template-columns: 23px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    border: 0;
    border-radius: 11px;
    padding: 10px;
    background: transparent;
    color: #20364b;
    text-align: left;
    font: inherit;
    cursor: pointer;
  }

  .building-option:hover,
  .building-option.selected {
    background: #effaff;
  }

  .option-check {
    width: 21px;
    height: 21px;
    display: grid;
    place-items: center;
    border: 1px solid #bfd3df;
    border-radius: 7px;
    background: #fff;
    color: #fff;
    font-size: 12px;
    font-weight: 900;
  }

  .building-option.selected .option-check {
    border-color: #16a3cd;
    background: #16a3cd;
  }

  .option-copy {
    min-width: 0;
    display: grid;
    gap: 2px;
  }

  .option-copy strong {
    overflow: hidden;
    color: #243a4e;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-copy small {
    color: #8799a8;
    font-size: 10px;
    font-weight: 650;
  }

  .picker-empty {
    padding: 28px 15px;
    color: #7d91a1;
    text-align: center;
    font-size: 12px;
  }

  .picker-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-top: 1px solid #e3edf2;
    padding: 10px 13px;
    background: #fbfdfe;
    color: #70899c;
    font-size: 11px;
    font-weight: 750;
  }

  .picker-footer button {
    border: 0;
    border-radius: 8px;
    padding: 7px 12px;
    background: #102033;
    color: #fff;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .location-builder-field,
    .location-zone-field,
    .location-custom-field {
      grid-column: 1 / -1;
    }

    .workflow-choice-panel {
      grid-template-columns: 1fr;
      margin-inline: 14px;
    }

    .workflow-choice-buttons {
      grid-template-columns: 1fr;
    }

    .resolution-locked-panel {
      margin-inline: 14px;
    }
  }

`;
