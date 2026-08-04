import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLang } from "../../context/LanguageContext";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app"
).replace(/\/+$/, "");

const TEXT = {
  en: {
    title: "Gate Glass",
    subtitle:
      "View and monitor every gate-glass record from the backend.",

    refresh: "Refresh",

    total: "Total Glass",
    ok: "OK",
    notOk: "Not OK",
    followUp: "Needs Follow-up",
    notInspected: "Not Inspected",
    zones: "Zones",

    filterTitle: "Advanced Gate Glass Filter",
    filterHint:
      "Search by cluster, building, Zone, direction, lane, or status",
    search: "Search",
    searchPlaceholder:
      "Cluster, building, Zone, direction, lane...",
    allStatuses: "All statuses",
    allClusters: "All clusters",
    allBuildings: "All buildings",
    allZones: "All zones",
    allDirections: "All directions",
    reset: "Reset",

    records: "records",
    recordsTitle: "Gate Glass Records",
    recordsHint: "Read-only view of all gate-glass records.",
    loading: "Loading...",
    noRecords: "No gate-glass records found.",
    noRecordsHint: "Try changing or resetting the filters.",

    cluster: "Cluster",
    building: "Building",
    zone: "Zone",
    direction: "Direction",
    lane: "Lane",
    glassType: "Glass Type",
    thickness: "Thickness",
    assetStatus: "Asset Status",
    currentStatus: "Current Status",
    installDate: "Install Date",
    notes: "Notes",
    lastInspection: "Last Inspection",
    details: "Details",
    close: "Close",

    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",

    statusOk: "OK",
    statusNotOk: "Not OK",
    statusFollowUp: "Needs Follow-up",
    statusNotInspected: "Not Inspected",

    inDirection: "IN",
    outDirection: "OUT",

    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",

    sessionExpired: "Your session has expired. Sign in again.",
    endpointMissing:
      "Gate Glass backend routes are not deployed on Railway yet.",
    failedLoad: "Failed to load Gate Glass data.",
    detailsTitle: "Gate Glass Details",
  },

  ar: {
    title: "زجاج البوابات",
    subtitle:
      "عرض ومتابعة جميع سجلات زجاج البوابات من الباك إند.",

    refresh: "تحديث",

    total: "إجمالي الزجاج",
    ok: "سليم",
    notOk: "غير سليم",
    followUp: "يحتاج متابعة",
    notInspected: "لم يُفحص",
    zones: "الزونات",

    filterTitle: "فلتر زجاج البوابات المتقدم",
    filterHint:
      "بحث بالكلاستر أو المبنى أو الزون أو الاتجاه أو المسار أو الحالة",
    search: "بحث",
    searchPlaceholder:
      "الكلاستر أو المبنى أو الزون أو الاتجاه أو المسار...",
    allStatuses: "كل الحالات",
    allClusters: "كل الكلاسترات",
    allBuildings: "كل المباني",
    allZones: "كل الزونات",
    allDirections: "كل الاتجاهات",
    reset: "إعادة ضبط",

    records: "سجل",
    recordsTitle: "سجلات زجاج البوابات",
    recordsHint: "عرض فقط لجميع سجلات زجاج البوابات.",
    loading: "جارٍ التحميل...",
    noRecords: "لا توجد سجلات زجاج بوابات.",
    noRecordsHint: "جرّبي تغيير الفلاتر أو إعادة ضبطها.",

    cluster: "الكلاستر",
    building: "المبنى",
    zone: "الزون",
    direction: "الاتجاه",
    lane: "المسار",
    glassType: "نوع الزجاج",
    thickness: "السُمك",
    assetStatus: "حالة الأصل",
    currentStatus: "الحالة الحالية",
    installDate: "تاريخ التركيب",
    notes: "الملاحظات",
    lastInspection: "آخر فحص",
    details: "التفاصيل",
    close: "إغلاق",

    active: "نشط",
    inactive: "غير نشط",
    maintenance: "صيانة",

    statusOk: "سليم",
    statusNotOk: "غير سليم",
    statusFollowUp: "يحتاج متابعة",
    statusNotInspected: "لم يُفحص",

    inDirection: "دخول IN",
    outDirection: "خروج OUT",

    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",

    sessionExpired: "انتهت الجلسة. سجّلي الدخول مرة أخرى.",
    endpointMissing:
      "مسارات زجاج البوابات لم تُنشر على Railway حتى الآن.",
    failedLoad: "تعذر تحميل بيانات زجاج البوابات.",
    detailsTitle: "تفاصيل زجاج البوابة",
  },
};

const INITIAL_SUMMARY = {
  total: 0,
  ok: 0,
  notOk: 0,
  needsFollowUp: 0,
  notInspected: 0,
  clusters: 0,
  buildings: 0,
  zones: 0,
};

const INITIAL_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

function getStoredToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("accessToken") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getStoredToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
}

function buildQueryString(filters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

async function readJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const responseText = await response.text();

  return {
    message: responseText || response.statusText,
  };
}

function getStatusInfo(status, text) {
  const map = {
    OK: {
      label: text.statusOk,
      className: "status-ok",
    },
    NOT_OK: {
      label: text.statusNotOk,
      className: "status-not-ok",
    },
    NEEDS_FOLLOW_UP: {
      label: text.statusFollowUp,
      className: "status-follow-up",
    },
    NOT_INSPECTED: {
      label: text.statusNotInspected,
      className: "status-not-inspected",
    },
  };

  return (
    map[status] || {
      label: status || "—",
      className: "status-not-inspected",
    }
  );
}

function getAssetStatusLabel(status, text) {
  const map = {
    ACTIVE: text.active,
    INACTIVE: text.inactive,
    MAINTENANCE: text.maintenance,
  };

  return map[status] || status || "—";
}

function getDirectionLabel(direction, text) {
  const map = {
    IN: text.inDirection,
    OUT: text.outDirection,
  };

  return map[direction] || direction || "—";
}

function formatDate(value, lang) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
  }).format(date);
}

export default function GlassesViewerPage() {
  const { lang } = useLang();
  const text = TEXT[lang === "ar" ? "ar" : "en"];

  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(INITIAL_SUMMARY);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);

  const [filterOptions, setFilterOptions] = useState({
    clusters: [],
    buildings: [],
    zones: [],
    directions: [],
    lanes: [],
  });

  const [filters, setFilters] = useState({
    search: "",
    cluster: "",
    building: "",
    zone: "",
    direction: "",
    currentStatus: "",
    page: 1,
    limit: 20,
  });

  const [selectedGlass, setSelectedGlass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const checkResponse = useCallback(
    async (response, fallbackMessage) => {
      if (response.status === 401) {
        throw new Error(text.sessionExpired);
      }

      if (response.status === 404) {
        throw new Error(text.endpointMissing);
      }

      const data = await readJsonResponse(response);

      if (!response.ok) {
        throw new Error(
          Array.isArray(data?.message)
            ? data.message.join(" - ")
            : data?.message || fallbackMessage,
        );
      }

      return data;
    },
    [text],
  );

  const loadFilters = useCallback(async () => {
    try {
      const response = await apiFetch("/glasses/filters", {
        cache: "no-store",
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();

      setFilterOptions({
        clusters: data.clusters || [],
        buildings: data.buildings || [],
        zones: data.zones || [],
        directions: data.directions || [],
        lanes: data.lanes || [],
      });
    } catch {
      // البيانات الرئيسية يمكن أن تعمل حتى لو فشل تحميل اختيارات الفلاتر.
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const listQuery = buildQueryString(filters);

      const summaryQuery = buildQueryString({
        search: filters.search,
        cluster: filters.cluster,
        building: filters.building,
        zone: filters.zone,
        direction: filters.direction,
      });

      const [listResponse, summaryResponse] = await Promise.all([
        apiFetch(`/glasses?${listQuery}`, {
          cache: "no-store",
        }),
        apiFetch(`/glasses/summary?${summaryQuery}`, {
          cache: "no-store",
        }),
      ]);

      const listData = await checkResponse(
        listResponse,
        text.failedLoad,
      );

      const summaryData = await checkResponse(
        summaryResponse,
        text.failedLoad,
      );

      setRows(listData.data || []);
      setPagination(listData.pagination || INITIAL_PAGINATION);
      setSummary({
        ...INITIAL_SUMMARY,
        ...summaryData,
      });
    } catch (requestError) {
      setRows([]);
      setSummary(INITIAL_SUMMARY);
      setPagination(INITIAL_PAGINATION);

      setError(
        requestError instanceof Error
          ? requestError.message
          : text.failedLoad,
      );
    } finally {
      setLoading(false);
    }
  }, [filters, checkResponse, text.failedLoad]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    const timer = window.setTimeout(
      loadData,
      filters.search ? 300 : 0,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadData, filters.search]);

  const stats = useMemo(
    () => [
      {
        label: text.total,
        value: summary.total,
        color: "blue",
      },
      {
        label: text.ok,
        value: summary.ok,
        color: "green",
      },
      {
        label: text.notOk,
        value: summary.notOk,
        color: "red",
      },
      {
        label: text.followUp,
        value: summary.needsFollowUp,
        color: "orange",
      },
      {
        label: text.notInspected,
        value: summary.notInspected,
        color: "purple",
      },
      {
        label: text.zones,
        value: summary.zones,
        color: "cyan",
      },
    ],
    [summary, text],
  );

  function updateFilter(name, value) {
    setFilters((current) => ({
      ...current,
      [name]: name === "page" ? Number(value) : value,
      page: name === "page" ? Number(value) : 1,
    }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      cluster: "",
      building: "",
      zone: "",
      direction: "",
      currentStatus: "",
      page: 1,
      limit: 20,
    });
  }

  return (
    <main
      className="gate-glass-page"
      dir={lang === "ar" ? "rtl" : "ltr"}
      lang={lang}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .gate-glass-page {
          min-height: 100%;
          padding: 29px 25px;
          color: #122238;
          background: #eef3f8;
          font-family:
            Inter,
            Cairo,
            Tajawal,
            Arial,
            sans-serif;
        }

        button,
        input,
        select {
          font: inherit;
        }

        .page-inner {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 18px;
        }

        .page-title h1 {
          margin: 0 0 5px;
          font-size: 25px;
          font-weight: 900;
        }

        .page-title p {
          margin: 0;
          color: #7b8ca3;
          font-size: 13px;
        }

        .action-button {
          height: 41px;
          padding: 0 15px;
          border: 0;
          border-radius: 9px;
          color: #ffffff;
          background: #17253a;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .action-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .message {
          padding: 13px 15px;
          margin-bottom: 15px;
          border: 1px solid #fecaca;
          border-radius: 10px;
          color: #b91c1c;
          background: #fff1f2;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.8;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          position: relative;
          overflow: hidden;
          min-height: 103px;
          padding: 17px 19px;
          border: 1px solid #dbe4ee;
          border-radius: 13px;
          background: #ffffff;
          box-shadow: 0 3px 10px rgba(20, 44, 71, 0.04);
        }

        .stat-card::before {
          position: absolute;
          inset-inline: 0;
          top: 0;
          height: 3px;
          content: "";
          background: #13a8e6;
        }

        .stat-card.green::before {
          background: #12b981;
        }

        .stat-card.red::before {
          background: #ef4444;
        }

        .stat-card.orange::before {
          background: #f59e0b;
        }

        .stat-card.purple::before {
          background: #6558ef;
        }

        .stat-card.cyan::before {
          background: #08b7c9;
        }

        .stat-label {
          margin-bottom: 7px;
          color: #7487a0;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 29px;
          font-weight: 900;
          line-height: 1;
        }

        .filter-panel,
        .content-panel {
          padding: 18px;
          border: 1px solid #dbe4ee;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 3px 12px rgba(20, 44, 71, 0.04);
        }

        .filter-panel {
          margin-bottom: 20px;
        }

        .filter-heading {
          display: flex;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 15px;
        }

        .filter-heading h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 900;
        }

        .filter-heading span {
          color: #8191a6;
          font-size: 11px;
        }

        .filter-grid {
          display: grid;
          grid-template-columns:
            minmax(230px, 1.35fr)
            repeat(5, minmax(135px, 0.75fr));
          gap: 10px;
        }

        .field label {
          display: block;
          margin-bottom: 6px;
          color: #637690;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .control {
          width: 100%;
          height: 41px;
          padding: 0 11px;
          outline: none;
          border: 1px solid #ccd8e5;
          border-radius: 9px;
          color: #17263c;
          background: #fbfcfe;
          font-size: 12px;
        }

        .control:focus {
          border-color: #20a8df;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(32, 168, 223, 0.1);
        }

        .reset-button {
          height: 36px;
          padding: 0 14px;
          margin-top: 12px;
          border: 1px solid #d5dfea;
          border-radius: 8px;
          color: #17263c;
          background: #ffffff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .content-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .content-heading h2 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 900;
        }

        .content-heading p {
          margin: 0;
          color: #8191a7;
          font-size: 11px;
        }

        .record-badge {
          padding: 7px 11px;
          border-radius: 999px;
          color: #087da8;
          background: #e9f8fe;
          font-size: 11px;
          font-weight: 900;
        }

        .glass-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .glass-card {
          overflow: hidden;
          border: 1px solid #dbe4ee;
          border-radius: 12px;
          background: #ffffff;
          transition: 0.2s ease;
        }

        .glass-card:hover {
          transform: translateY(-2px);
          border-color: #77ccef;
          box-shadow: 0 10px 24px rgba(20, 44, 71, 0.08);
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          padding: 15px;
          border-bottom: 1px solid #e8eef4;
          background: #f8fbfd;
        }

        .card-top h3 {
          margin: 0 0 4px;
          font-size: 14px;
          line-height: 1.5;
        }

        .card-subtitle {
          color: #7e8fa4;
          font-size: 10px;
        }

        .direction-badge {
          flex-shrink: 0;
          padding: 6px 8px;
          border-radius: 7px;
          color: #087da8;
          background: #e8f7fd;
          font-size: 10px;
          font-weight: 900;
        }

        .card-body {
          padding: 15px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
          margin-bottom: 14px;
        }

        .info-label {
          display: block;
          margin-bottom: 3px;
          color: #8998aa;
          font-size: 9px;
          text-transform: uppercase;
        }

        .info-value {
          display: block;
          overflow: hidden;
          color: #26384e;
          font-size: 11px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 900;
        }

        .status-ok {
          color: #15803d;
          background: #dcfce7;
        }

        .status-not-ok {
          color: #b91c1c;
          background: #fee2e2;
        }

        .status-follow-up {
          color: #a16207;
          background: #fef3c7;
        }

        .status-not-inspected {
          color: #475569;
          background: #e2e8f0;
        }

        .card-actions {
          display: flex;
          gap: 7px;
          margin-top: 13px;
        }

        .details-button {
          height: 31px;
          padding: 0 12px;
          border: 0;
          border-radius: 7px;
          color: #ffffff;
          background: #18273c;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 55px 20px;
          border: 1px dashed #ccd8e5;
          border-radius: 10px;
          color: #8292a7;
          background: #fbfcfe;
          text-align: center;
        }

        .empty-state strong {
          display: block;
          margin-bottom: 6px;
          color: #26384e;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding-top: 18px;
        }

        .pagination button {
          height: 35px;
          padding: 0 13px;
          border: 1px solid #d5dfea;
          border-radius: 8px;
          color: #17263c;
          background: #ffffff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .pagination button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .modal-overlay {
          position: fixed;
          z-index: 2000;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 28, 45, 0.6);
          backdrop-filter: blur(4px);
        }

        .modal {
          width: 100%;
          max-width: 850px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom: 1px solid #e6edf4;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 17px;
        }

        .close-button {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 8px;
          color: #26384e;
          background: #eef3f7;
          cursor: pointer;
          font-size: 18px;
        }

        .modal-body {
          padding: 18px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .detail-box {
          padding: 14px;
          border: 1px solid #dfe7ef;
          border-radius: 10px;
          background: #fbfcfe;
        }

        .detail-row {
          display: grid;
          grid-template-columns: 125px 1fr;
          gap: 10px;
          padding: 7px 0;
          font-size: 11px;
        }

        .detail-row span:first-child {
          color: #8191a6;
        }

        .detail-row span:last-child {
          color: #26384e;
          font-weight: 800;
          word-break: break-word;
        }

        @media (max-width: 1200px) {
          .filter-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .glass-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .gate-glass-page {
            padding: 18px 14px;
          }

          .page-header,
          .content-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .action-button {
            align-self: flex-start;
          }

          .stats-grid,
          .filter-grid,
          .glass-grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .detail-row {
            grid-template-columns: 1fr;
            gap: 2px;
          }
        }
      `}</style>

      <div className="page-inner">
        <header className="page-header">
          <div className="page-title">
            <h1>{text.title}</h1>
            <p>{text.subtitle}</p>
          </div>

          <button
            type="button"
            className="action-button"
            onClick={loadData}
            disabled={loading}
          >
            {text.refresh}
          </button>
        </header>

        {error && <div className="message">{error}</div>}

        <section className="stats-grid">
          {stats.map((stat) => (
            <article
              className={`stat-card ${stat.color}`}
              key={stat.label}
            >
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
            </article>
          ))}
        </section>

        <section className="filter-panel">
          <div className="filter-heading">
            <h2>{text.filterTitle}</h2>
            <span>{text.filterHint}</span>
          </div>

          <div className="filter-grid">
            <div className="field">
              <label>{text.search}</label>

              <input
                type="search"
                className="control"
                value={filters.search}
                placeholder={text.searchPlaceholder}
                onChange={(event) =>
                  updateFilter("search", event.target.value)
                }
              />
            </div>

            <div className="field">
              <label>{text.currentStatus}</label>

              <select
                className="control"
                value={filters.currentStatus}
                onChange={(event) =>
                  updateFilter("currentStatus", event.target.value)
                }
              >
                <option value="">{text.allStatuses}</option>
                <option value="OK">{text.statusOk}</option>
                <option value="NOT_OK">{text.statusNotOk}</option>
                <option value="NEEDS_FOLLOW_UP">
                  {text.statusFollowUp}
                </option>
                <option value="NOT_INSPECTED">
                  {text.statusNotInspected}
                </option>
              </select>
            </div>

            <div className="field">
              <label>{text.cluster}</label>

              <select
                className="control"
                value={filters.cluster}
                onChange={(event) =>
                  updateFilter("cluster", event.target.value)
                }
              >
                <option value="">{text.allClusters}</option>

                {filterOptions.clusters.map((cluster) => (
                  <option value={cluster} key={cluster}>
                    {cluster}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>{text.building}</label>

              <select
                className="control"
                value={filters.building}
                onChange={(event) =>
                  updateFilter("building", event.target.value)
                }
              >
                <option value="">{text.allBuildings}</option>

                {filterOptions.buildings.map((building) => (
                  <option value={building} key={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>{text.zone}</label>

              <select
                className="control"
                value={filters.zone}
                onChange={(event) =>
                  updateFilter("zone", event.target.value)
                }
              >
                <option value="">{text.allZones}</option>

                {filterOptions.zones.map((zone) => (
                  <option value={zone} key={zone}>
                    {zone}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>{text.direction}</label>

              <select
                className="control"
                value={filters.direction}
                onChange={(event) =>
                  updateFilter("direction", event.target.value)
                }
              >
                <option value="">{text.allDirections}</option>

                {filterOptions.directions.map((direction) => (
                  <option value={direction} key={direction}>
                    {getDirectionLabel(direction, text)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="reset-button"
            onClick={resetFilters}
          >
            {text.reset}
          </button>
        </section>

        <section className="content-panel">
          <div className="content-heading">
            <div>
              <h2>{text.recordsTitle}</h2>
              <p>{text.recordsHint}</p>
            </div>

            <span className="record-badge">
              {pagination.total} {text.records}
            </span>
          </div>

          <div className="glass-grid">
            {loading && (
              <div className="empty-state">
                <strong>{text.loading}</strong>
              </div>
            )}

            {!loading &&
              rows.map((glass) => {
                const statusInfo = getStatusInfo(
                  glass.currentStatus,
                  text,
                );

                return (
                  <article className="glass-card" key={glass.id}>
                    <div className="card-top">
                      <div>
                        <h3>{glass.building || "—"}</h3>

                        <div className="card-subtitle">
                          {glass.cluster || "—"} · {glass.zone || "—"}
                        </div>
                      </div>

                      <span className="direction-badge">
                        {getDirectionLabel(glass.direction, text)}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-grid">
                        <div>
                          <span className="info-label">{text.zone}</span>
                          <span className="info-value">
                            {glass.zone || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">{text.lane}</span>
                          <span className="info-value">
                            {glass.lane || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">
                            {text.glassType}
                          </span>
                          <span className="info-value">
                            {glass.glassType || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">
                            {text.thickness}
                          </span>
                          <span className="info-value">
                            {glass.thickness || "—"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`status-badge ${statusInfo.className}`}
                      >
                        {statusInfo.label}
                      </span>

                      <div className="card-actions">
                        <button
                          type="button"
                          className="details-button"
                          onClick={() => setSelectedGlass(glass)}
                        >
                          {text.details}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

            {!loading && rows.length === 0 && (
              <div className="empty-state">
                <strong>{text.noRecords}</strong>
                <span>{text.noRecordsHint}</span>
              </div>
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  updateFilter("page", pagination.page - 1)
                }
              >
                {text.previous}
              </button>

              <span>
                {text.page} {pagination.page} {text.of}{" "}
                {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  updateFilter("page", pagination.page + 1)
                }
              >
                {text.next}
              </button>
            </div>
          )}
        </section>
      </div>

      {selectedGlass && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedGlass(null);
            }
          }}
        >
          <section className="modal" role="dialog" aria-modal="true">
            <header className="modal-header">
              <h2>{text.detailsTitle}</h2>

              <button
                type="button"
                className="close-button"
                onClick={() => setSelectedGlass(null)}
                title={text.close}
                aria-label={text.close}
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="detail-grid">
                {[
                  [text.cluster, selectedGlass.cluster || "—"],
                  [text.building, selectedGlass.building || "—"],
                  [text.zone, selectedGlass.zone || "—"],
                  [
                    text.direction,
                    getDirectionLabel(selectedGlass.direction, text),
                  ],
                  [text.lane, selectedGlass.lane || "—"],
                  [text.glassType, selectedGlass.glassType || "—"],
                  [text.thickness, selectedGlass.thickness || "—"],
                  [
                    text.assetStatus,
                    getAssetStatusLabel(selectedGlass.status, text),
                  ],
                  [
                    text.currentStatus,
                    getStatusInfo(
                      selectedGlass.currentStatus,
                      text,
                    ).label,
                  ],
                  [
                    text.installDate,
                    formatDate(selectedGlass.installDate, lang),
                  ],
                  [
                    text.lastInspection,
                    formatDate(selectedGlass.lastInspectionAt, lang),
                  ],
                  [text.notes, selectedGlass.notes || "—"],
                ].map(([label, value]) => (
                  <div className="detail-box" key={label}>
                    <div className="detail-row">
                      <span>{label}</span>
                      <span>{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}