import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useLang,
} from "../context/LanguageContext";

/* =========================================================
   API
========================================================= */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app"
).replace(/\/+$/, "");

/* =========================================================
   TEXT
========================================================= */

const TEXT = {
  en: {
    title: "Gate Glass",
    subtitle:
      "Manage glass assets and monitor inspection activity.",

    refresh: "Refresh",
    importExcel: "Import Excel",
    importing: "Importing...",
    template: "Excel Template",
    addGlass: "Add Glass",

    totalGlass: "Total Glass",
    inspections: "Recent Inspections",
    ok: "OK",
    notOk: "Not OK",
    followUp: "Needs Follow-up",
    notInspected: "Not Inspected",

    inspectionActivity:
      "Inspection Activity",

    inspectionActivityHint:
      "Latest glass inspections including technician, location, comment and photos.",

    technician: "Technician",
    inspectionDate: "Inspection Date",
    comment: "Comment",
    images: "Images",
    status: "Status",

    glassByMinistry:
      "Glass by Ministry",

    glassByMinistryHint:
      "Each ministry is displayed as a separate context.",

    glassCount: "Glass",
    inspectionCount:
      "Inspections",

    filterTitle: "Filters",
    search: "Search",

    searchPlaceholder:
      "Cluster, ministry, zone, direction...",

    allStatuses: "All Statuses",
    allClusters: "All Clusters",
    allBuildings: "All Ministries",
    allZones: "All Zones",
    allDirections: "All Directions",

    cluster: "Cluster",
    building: "Ministry / Building",
    zone: "Zone",
    direction: "Direction",
    lane: "Lane",

    glassType: "Glass Type",
    thickness: "Thickness",

    assetStatus: "Asset Status",
    currentStatus: "Current Status",

    installDate: "Install Date",
    lastInspection: "Last Inspection",
    notes: "Notes",

    reset: "Reset",

    details: "Details",
    edit: "Edit",
    delete: "Delete",

    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",

    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",

    addTitle: "Add Glass",
    editTitle: "Edit Glass",
    detailsTitle: "Glass Details",
    inspectionDetails:
      "Inspection Details",

    active: "Active",
    inactive: "Inactive",
    maintenance: "Maintenance",

    noRecords:
      "No glass records found.",

    noInspections:
      "No inspections found.",

    loading: "Loading...",

    sessionExpired:
      "Session expired. Sign in again.",

    failedLoad:
      "Failed to load glass data.",

    failedSave:
      "Failed to save glass.",

    failedDelete:
      "Failed to delete glass.",

    failedImport:
      "Failed to import Excel.",

    required:
      "Cluster, Ministry, Zone and Direction are required.",

    saved:
      "Glass saved successfully.",

    deleted:
      "Glass deleted successfully.",

    imported:
      "Excel imported successfully.",

    confirmDelete:
      "Delete this glass record?",
  },

  ar: {
    title: "زجاج البوابات",

    subtitle:
      "إدارة الزجاج ومتابعة جميع عمليات التفتيش.",

    refresh: "تحديث",
    importExcel: "استيراد Excel",
    importing: "جاري الاستيراد...",
    template: "نموذج Excel",
    addGlass: "إضافة زجاج",

    totalGlass: "إجمالي الزجاج",
    inspections: "أحدث التفتيشات",
    ok: "سليم",
    notOk: "غير سليم",
    followUp: "يحتاج متابعة",
    notInspected: "لم يتم التفتيش",

    inspectionActivity:
      "سجل التفتيشات",

    inspectionActivityHint:
      "أحدث تفتيشات الزجاج مع الفني والمكان والتعليق والصور.",

    technician: "الفني",
    inspectionDate: "تاريخ التفتيش",
    comment: "التعليق",
    images: "الصور",
    status: "الحالة",

    glassByMinistry:
      "الزجاج حسب الوزارة",

    glassByMinistryHint:
      "كل وزارة تظهر كقسم مستقل وبداخلها الزجاج الخاص بها.",

    glassCount: "عدد الزجاج",
    inspectionCount:
      "عدد التفتيشات",

    filterTitle: "الفلاتر",
    search: "بحث",

    searchPlaceholder:
      "الكلاستر أو الوزارة أو الزون أو الاتجاه...",

    allStatuses: "كل الحالات",
    allClusters: "كل الكلاسترات",
    allBuildings: "كل الوزارات",
    allZones: "كل الزونات",
    allDirections: "كل الاتجاهات",

    cluster: "الكلاستر",
    building: "الوزارة / المبنى",
    zone: "الزون",
    direction: "الاتجاه",
    lane: "المسار",

    glassType: "نوع الزجاج",
    thickness: "السُمك",

    assetStatus: "حالة الأصل",
    currentStatus: "الحالة الحالية",

    installDate: "تاريخ التركيب",
    lastInspection: "آخر تفتيش",
    notes: "الملاحظات",

    reset: "إعادة ضبط",

    details: "التفاصيل",
    edit: "تعديل",
    delete: "حذف",

    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",

    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    close: "إغلاق",

    addTitle: "إضافة زجاج",
    editTitle: "تعديل الزجاج",
    detailsTitle: "تفاصيل الزجاج",

    inspectionDetails:
      "تفاصيل التفتيش",

    active: "نشط",
    inactive: "غير نشط",
    maintenance: "صيانة",

    noRecords:
      "لا توجد سجلات زجاج.",

    noInspections:
      "لا توجد تفتيشات حتى الآن.",

    loading: "جاري التحميل...",

    sessionExpired:
      "انتهت الجلسة. سجل الدخول مرة أخرى.",

    failedLoad:
      "تعذر تحميل بيانات الزجاج.",

    failedSave:
      "تعذر حفظ الزجاج.",

    failedDelete:
      "تعذر حذف الزجاج.",

    failedImport:
      "تعذر استيراد Excel.",

    required:
      "الكلاستر والوزارة والزون والاتجاه مطلوبين.",

    saved:
      "تم حفظ الزجاج بنجاح.",

    deleted:
      "تم حذف الزجاج بنجاح.",

    imported:
      "تم استيراد Excel بنجاح.",

    confirmDelete:
      "هل تريد حذف سجل الزجاج؟",
  },
};

/* =========================================================
   CONSTANTS
========================================================= */

const EMPTY_FORM = {
  cluster: "",
  building: "",
  zone: "",
  direction: "IN",
  lane: "",
  glassType: "",
  thickness: "",
  status: "ACTIVE",
  currentStatus: "NOT_INSPECTED",
  installDate: "",
  notes: "",
};

const EMPTY_SUMMARY = {
  total: 0,
  ok: 0,
  notOk: 0,
  needsFollowUp: 0,
  notInspected: 0,
  buildings: 0,
  zones: 0,
};

const EMPTY_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

/* =========================================================
   HELPERS
========================================================= */

function getStoredToken() {
  return (
    localStorage.getItem(
      "accessToken",
    ) ||
    localStorage.getItem(
      "access_token",
    ) ||
    localStorage.getItem(
      "token",
    ) ||
    sessionStorage.getItem(
      "accessToken",
    ) ||
    sessionStorage.getItem(
      "access_token",
    ) ||
    sessionStorage.getItem(
      "token",
    ) ||
    ""
  );
}

async function apiFetch(
  path,
  options = {},
) {
  const headers =
    new Headers(
      options.headers || {},
    );

  const token =
    getStoredToken();

  if (
    token &&
    !headers.has(
      "Authorization",
    )
  ) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  return fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials:
        "include",
    },
  );
}

async function readResponse(
  response,
) {
  const type =
    response.headers.get(
      "content-type",
    ) || "";

  if (
    type.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  const value =
    await response.text();

  return {
    message:
      value ||
      response.statusText,
  };
}

function buildQuery(
  values,
) {
  const params =
    new URLSearchParams();

  Object.entries(
    values,
  ).forEach(
    ([key, value]) => {
      if (
        value !== "" &&
        value !== null &&
        value !== undefined
      ) {
        params.set(
          key,
          String(value),
        );
      }
    },
  );

  return params.toString();
}

function formatDate(
  value,
  lang,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    lang === "ar"
      ? "ar-EG"
      : "en-GB",
    {
      dateStyle:
        "medium",
    },
  ).format(date);
}

function formatDateTime(
  value,
  lang,
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    lang === "ar"
      ? "ar-EG"
      : "en-GB",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    },
  ).format(date);
}

function toDateInput(
  value,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function getImageUrl(
  value,
) {
  if (!value) {
    return "";
  }

  const url =
    String(value);

  if (
    /^https?:\/\//i.test(
      url,
    )
  ) {
    return url;
  }

  return `${API_URL}${
    url.startsWith("/")
      ? ""
      : "/"
  }${url}`;
}

function technicianName(
  inspection,
) {
  const technician =
    inspection?.technician;

  if (!technician) {
    return "—";
  }

  return (
    technician.fullName ||
    [
      technician.firstName,
      technician.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    technician.username ||
    "—"
  );
}

function glassStatus(
  status,
  text,
) {
  const map = {
    OK: {
      label:
        text.ok,
      className:
        "status-ok",
    },

    NOT_OK: {
      label:
        text.notOk,
      className:
        "status-not-ok",
    },

    NEEDS_FOLLOW_UP: {
      label:
        text.followUp,
      className:
        "status-follow",
    },

    NOT_INSPECTED: {
      label:
        text.notInspected,
      className:
        "status-none",
    },
  };

  return (
    map[status] || {
      label:
        status || "—",

      className:
        "status-none",
    }
  );
}

function inspectionStatus(
  status,
  text,
) {
  const map = {
    OK: {
      label:
        text.ok,
      className:
        "status-ok",
    },

    NOT_OK: {
      label:
        text.notOk,
      className:
        "status-not-ok",
    },

    PARTIAL: {
      label:
        text.followUp,
      className:
        "status-follow",
    },

    NOT_REACHABLE: {
      label:
        "Not Reachable",
      className:
        "status-follow",
    },
  };

  return (
    map[status] || {
      label:
        status || "—",

      className:
        "status-none",
    }
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function GlassesAdminPage() {
  const {
    lang,
  } = useLang();

  const text =
    TEXT[
      lang === "ar"
        ? "ar"
        : "en"
    ];

  const fileInputRef =
    useRef(null);

  /* ==========================
     MAIN DATA
  ========================== */

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(
    EMPTY_SUMMARY,
  );

  const [
    pagination,
    setPagination,
  ] = useState(
    EMPTY_PAGINATION,
  );

  const [
    filterOptions,
    setFilterOptions,
  ] = useState({
    clusters: [],
    buildings: [],
    zones: [],
    directions: [],
    lanes: [],
  });

  const [
    filters,
    setFilters,
  ] = useState({
    search: "",
    cluster: "",
    building: "",
    zone: "",
    direction: "",
    currentStatus: "",
    page: 1,
    limit: 20,
  });

  /* ==========================
     INSPECTIONS
  ========================== */

  const [
    inspections,
    setInspections,
  ] = useState([]);

  const [
    inspectionsLoading,
    setInspectionsLoading,
  ] = useState(false);

  const [
    selectedInspection,
    setSelectedInspection,
  ] = useState(null);

  /* ==========================
     GLASS MODALS
  ========================== */

  const [
    selectedGlass,
    setSelectedGlass,
  ] = useState(null);

  const [
    editingGlass,
    setEditingGlass,
  ] = useState(null);

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM,
  );

  /* ==========================
     UI STATE
  ========================== */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    importing,
    setImporting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  /* =========================================================
     RESPONSE CHECK
  ========================================================= */

  const checkResponse =
    useCallback(
      async (
        response,
        fallback,
      ) => {
        if (
          response.status ===
          401
        ) {
          throw new Error(
            text.sessionExpired,
          );
        }

        const data =
          await readResponse(
            response,
          );

        if (
          !response.ok
        ) {
          throw new Error(
            Array.isArray(
              data?.message,
            )
              ? data.message.join(
                  " - ",
                )
              : data?.message ||
                  fallback,
          );
        }

        return data;
      },
      [
        text.sessionExpired,
      ],
    );

  /* =========================================================
     LOAD FILTER OPTIONS
  ========================================================= */

  const loadFilters =
    useCallback(
      async () => {
        try {
          const response =
            await apiFetch(
              "/glasses/filters",
              {
                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            return;
          }

          const data =
            await response.json();

          setFilterOptions({
            clusters:
              data?.clusters ||
              [],

            buildings:
              data?.buildings ||
              [],

            zones:
              data?.zones ||
              [],

            directions:
              data?.directions ||
              [],

            lanes:
              data?.lanes ||
              [],
          });
        } catch (
          requestError
        ) {
          console.error(
            "Glass filters:",
            requestError,
          );
        }
      },
      [],
    );

  /* =========================================================
     LOAD GLASS DATA

     IMPORTANT:
     Inspection failure cannot block glass list.
  ========================================================= */

  const loadData =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const query =
            buildQuery(
              filters,
            );

          const summaryQuery =
            buildQuery({
              search:
                filters.search,

              cluster:
                filters.cluster,

              building:
                filters.building,

              zone:
                filters.zone,

              direction:
                filters.direction,
            });

          const [
            listResponse,
            summaryResponse,
          ] =
            await Promise.all([
              apiFetch(
                `/glasses?${query}`,
                {
                  cache:
                    "no-store",
                },
              ),

              apiFetch(
                `/glasses/summary?${summaryQuery}`,
                {
                  cache:
                    "no-store",
                },
              ),
            ]);

          const listData =
            await checkResponse(
              listResponse,
              text.failedLoad,
            );

          const summaryData =
            await checkResponse(
              summaryResponse,
              text.failedLoad,
            );

          setRows(
            Array.isArray(
              listData?.data,
            )
              ? listData.data
              : [],
          );

          setPagination(
            listData?.pagination ||
              EMPTY_PAGINATION,
          );

          setSummary({
            ...EMPTY_SUMMARY,
            ...(summaryData ||
              {}),
          });
        } catch (
          requestError
        ) {
          console.error(
            requestError,
          );

          setRows([]);

          setSummary(
            EMPTY_SUMMARY,
          );

          setError(
            requestError instanceof
              Error
              ? requestError.message
              : text.failedLoad,
          );
        } finally {
          setLoading(false);
        }
      },
      [
        filters,
        checkResponse,
        text.failedLoad,
      ],
    );

  /* =========================================================
     LOAD INSPECTIONS

     ONE REQUEST ONLY.

     If this fails, the admin page still works.
  ========================================================= */

  const loadInspections =
    useCallback(
      async () => {
        setInspectionsLoading(
          true,
        );

        try {
          const response =
            await apiFetch(
              "/glasses/inspection-history",
              {
                cache:
                  "no-store",
              },
            );

          if (
            !response.ok
          ) {
            console.warn(
              "Inspection history endpoint returned:",
              response.status,
            );

            setInspections(
              [],
            );

            return;
          }

          const data =
            await readResponse(
              response,
            );

          const items =
            Array.isArray(
              data?.data,
            )
              ? data.data
              : Array.isArray(
                    data,
                  )
                ? data
                : [];

          setInspections(
            items,
          );
        } catch (
          requestError
        ) {
          console.error(
            "Inspection History Error:",
            requestError,
          );

          /*
           * مهم:
           * لا نضع setError هنا حتى لا يظهر أن
           * الصفحة كلها فشلت بسبب History.
           */
          setInspections([]);
        } finally {
          setInspectionsLoading(
            false,
          );
        }
      },
      [],
    );

  /* =========================================================
     EFFECTS
  ========================================================= */

  useEffect(() => {
    loadFilters();
  }, [
    loadFilters,
  ]);

  useEffect(() => {
    loadInspections();
  }, [
    loadInspections,
  ]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          loadData();
        },
        filters.search
          ? 300
          : 0,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    loadData,
    filters.search,
  ]);

  /* =========================================================
     GROUP GLASS BY MINISTRY / BUILDING
  ========================================================= */

  const groupedGlass =
    useMemo(() => {
      const groups =
        new Map();

      rows.forEach(
        (glass) => {
          const ministry =
            glass.building ||
            "—";

          if (
            !groups.has(
              ministry,
            )
          ) {
            groups.set(
              ministry,
              [],
            );
          }

          groups
            .get(ministry)
            .push(glass);
        },
      );

      return Array.from(
        groups.entries(),
      ).sort(
        ([a], [b]) =>
          String(a).localeCompare(
            String(b),
            lang === "ar"
              ? "ar"
              : "en",
          ),
      );
    }, [
      rows,
      lang,
    ]);

  /* =========================================================
     INSPECTION COUNTS
  ========================================================= */

  const inspectionCounts =
    useMemo(() => {
      const counts =
        new Map();

      inspections.forEach(
        (inspection) => {
          const id =
            Number(
              inspection
                ?.glassId ||
                inspection
                  ?.glass?.id,
            );

          if (!id) {
            return;
          }

          counts.set(
            id,
            (
              counts.get(
                id,
              ) || 0
            ) + 1,
          );
        },
      );

      return counts;
    }, [
      inspections,
    ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats =
    useMemo(
      () => [
        {
          label:
            text.totalGlass,

          value:
            summary.total,

          className:
            "blue",
        },

        {
          label:
            text.inspections,

          value:
            inspections.length,

          className:
            "cyan",
        },

        {
          label:
            text.ok,

          value:
            summary.ok,

          className:
            "green",
        },

        {
          label:
            text.notOk,

          value:
            summary.notOk,

          className:
            "red",
        },

        {
          label:
            text.followUp,

          value:
            summary.needsFollowUp,

          className:
            "orange",
        },

        {
          label:
            text.notInspected,

          value:
            summary.notInspected,

          className:
            "purple",
        },
      ],
      [
        text,
        summary,
        inspections.length,
      ],
    );

  /* =========================================================
     FILTERS
  ========================================================= */

  function updateFilter(
    name,
    value,
  ) {
    setFilters(
      (current) => ({
        ...current,

        [name]:
          name === "page"
            ? Number(value)
            : value,

        page:
          name === "page"
            ? Number(value)
            : 1,
      }),
    );
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

  /* =========================================================
     CREATE / EDIT GLASS
  ========================================================= */

  function openCreate() {
    setEditingGlass(
      null,
    );

    setForm({
      ...EMPTY_FORM,
    });

    setFormOpen(true);

    setError("");
  }

  function openEdit(
    glass,
  ) {
    setEditingGlass(
      glass,
    );

    setForm({
      cluster:
        glass.cluster ||
        "",

      building:
        glass.building ||
        "",

      zone:
        glass.zone ||
        "",

      direction:
        glass.direction ||
        "IN",

      lane:
        glass.lane ||
        "",

      glassType:
        glass.glassType ||
        "",

      thickness:
        glass.thickness ||
        "",

      status:
        glass.status ||
        "ACTIVE",

      currentStatus:
        glass.currentStatus ||
        "NOT_INSPECTED",

      installDate:
        toDateInput(
          glass.installDate,
        ),

      notes:
        glass.notes ||
        "",
    });

    setFormOpen(true);

    setError("");
  }

  function closeForm() {
    setFormOpen(false);

    setEditingGlass(
      null,
    );

    setForm({
      ...EMPTY_FORM,
    });
  }

  function updateForm(
    name,
    value,
  ) {
    setForm(
      (current) => ({
        ...current,

        [name]:
          value,
      }),
    );
  }

  async function saveGlass(
    event,
  ) {
    event.preventDefault();

    if (
      !form.cluster.trim() ||
      !form.building.trim() ||
      !form.zone.trim() ||
      !form.direction
    ) {
      setError(
        text.required,
      );

      return;
    }

    setSaving(true);

    setError("");

    setSuccess("");

    try {
      const payload = {
        cluster:
          form.cluster.trim(),

        building:
          form.building.trim(),

        zone:
          form.zone.trim(),

        direction:
          form.direction,

        lane:
          form.lane.trim() ||
          undefined,

        glassType:
          form.glassType.trim() ||
          undefined,

        thickness:
          form.thickness.trim() ||
          undefined,

        status:
          form.status,

        currentStatus:
          form.currentStatus,

        installDate:
          form.installDate ||
          undefined,

        notes:
          form.notes.trim() ||
          undefined,
      };

      const editing =
        Boolean(
          editingGlass?.id,
        );

      const response =
        await apiFetch(
          editing
            ? `/glasses/${editingGlass.id}`
            : "/glasses",

          {
            method:
              editing
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                payload,
              ),
          },
        );

      await checkResponse(
        response,
        text.failedSave,
      );

      closeForm();

      setSuccess(
        text.saved,
      );

      await Promise.all([
        loadData(),
        loadFilters(),
        loadInspections(),
      ]);
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : text.failedSave,
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function deleteGlass(
    glass,
  ) {
    if (
      !window.confirm(
        text.confirmDelete,
      )
    ) {
      return;
    }

    setError("");

    setSuccess("");

    try {
      const response =
        await apiFetch(
          `/glasses/${glass.id}`,
          {
            method:
              "DELETE",
          },
        );

      await checkResponse(
        response,
        text.failedDelete,
      );

      setSuccess(
        text.deleted,
      );

      await Promise.all([
        loadData(),
        loadFilters(),
        loadInspections(),
      ]);
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : text.failedDelete,
      );
    }
  }

  /* =========================================================
     IMPORT EXCEL
  ========================================================= */

  async function importExcel(
    event,
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    setImporting(true);

    setError("");

    setSuccess("");

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await apiFetch(
          "/glasses/import-excel",
          {
            method:
              "POST",

            body:
              formData,
          },
        );

      await checkResponse(
        response,
        text.failedImport,
      );

      setSuccess(
        text.imported,
      );

      await Promise.all([
        loadData(),
        loadFilters(),
      ]);
    } catch (
      requestError
    ) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : text.failedImport,
      );
    } finally {
      setImporting(false);
    }
  }

  /* =========================================================
     TEMPLATE
  ========================================================= */

  async function downloadTemplate() {
    try {
      const response =
        await apiFetch(
          "/glasses/import-template",
        );

      if (
        !response.ok
      ) {
        return;
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(
          blob,
        );

      const link =
        document.createElement(
          "a",
        );

      link.href =
        url;

      link.download =
        "gate-glass-import-template.xlsx";

      document.body.appendChild(
        link,
      );

      link.click();

      link.remove();

      URL.revokeObjectURL(
        url,
      );
    } catch (
      requestError
    ) {
      console.error(
        requestError,
      );
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className="glass-admin"
      dir={
        lang === "ar"
          ? "rtl"
          : "ltr"
      }
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        .glass-admin {
          min-height: 100vh;
          padding: 25px;
          background: #eef3f8;
          color: #17263c;
          font-family:
            Inter,
            Cairo,
            Tajawal,
            Arial,
            sans-serif;
        }

        .page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        /* =====================
           HEADER
        ===================== */

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .header h1 {
          margin: 0 0 5px;
          font-size: 26px;
          font-weight: 900;
        }

        .header p {
          margin: 0;
          color: #7a8ba1;
          font-size: 12px;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .btn {
          min-height: 40px;
          padding: 0 14px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .btn-dark {
          border: 0;
          color: white;
          background: #17263c;
        }

        .btn-blue {
          border: 1px solid #22aee5;
          color: #087da8;
          background: white;
        }

        .btn-green {
          border: 1px solid #22c55e;
          color: #15803d;
          background: white;
        }

        .btn-purple {
          border: 1px solid #8b5cf6;
          color: #6d28d9;
          background: white;
        }

        .hidden {
          display: none;
        }

        /* =====================
           MESSAGES
        ===================== */

        .message {
          margin-bottom: 15px;
          padding: 13px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .error {
          border: 1px solid #fecaca;
          color: #b91c1c;
          background: #fff1f2;
        }

        .success {
          border: 1px solid #bbf7d0;
          color: #15803d;
          background: #f0fdf4;
        }

        /* =====================
           STATS
        ===================== */

        .stats {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stat {
          position: relative;
          overflow: hidden;
          padding: 17px;
          min-height: 100px;
          border: 1px solid #dbe4ee;
          border-radius: 13px;
          background: white;
        }

        .stat::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: #0ea5e9;
        }

        .stat.green::before {
          background: #22c55e;
        }

        .stat.red::before {
          background: #ef4444;
        }

        .stat.orange::before {
          background: #f59e0b;
        }

        .stat.purple::before {
          background: #8b5cf6;
        }

        .stat.cyan::before {
          background: #06b6d4;
        }

        .stat-label {
          margin-bottom: 8px;
          color: #7487a0;
          font-size: 10px;
          font-weight: 900;
        }

        .stat-value {
          font-size: 30px;
          font-weight: 900;
        }

        /* =====================
           PANELS
        ===================== */

        .panel {
          padding: 18px;
          margin-bottom: 20px;
          border: 1px solid #dbe4ee;
          border-radius: 14px;
          background: white;
        }

        .panel-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .panel-title h2 {
          margin: 0 0 4px;
          font-size: 16px;
        }

        .panel-title p {
          margin: 0;
          color: #8191a6;
          font-size: 11px;
        }

        .count-badge {
          padding: 6px 10px;
          border-radius: 999px;
          color: #087da8;
          background: #e9f8fe;
          font-size: 10px;
          font-weight: 900;
        }

        /* =====================
           INSPECTIONS
        ===================== */

        .inspection-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .inspection {
          padding: 14px;
          border: 1px solid #dbe4ee;
          border-radius: 12px;
          background: #fbfcfe;
        }

        .inspection-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .inspection-title {
          font-size: 13px;
          font-weight: 900;
        }

        .muted {
          margin-top: 3px;
          color: #8191a6;
          font-size: 10px;
          line-height: 1.6;
        }

        .inspection-comment {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          background: #eef3f8;
          font-size: 11px;
          line-height: 1.6;
        }

        .thumbs {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          margin-top: 10px;
        }

        .thumb {
          width: 70px;
          height: 70px;
          flex: 0 0 70px;
          overflow: hidden;
          border-radius: 8px;
          background: #e2e8f0;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* =====================
           FILTERS
        ===================== */

        .filters {
          display: grid;
          grid-template-columns:
            1.4fr repeat(
              5,
              1fr
            );
          gap: 10px;
        }

        .field label {
          display: block;
          margin-bottom: 5px;
          color: #637690;
          font-size: 9px;
          font-weight: 900;
        }

        .control {
          width: 100%;
          min-height: 41px;
          padding: 0 10px;
          border: 1px solid #ccd8e5;
          border-radius: 9px;
          outline: none;
          background: #fbfcfe;
        }

        textarea.control {
          padding: 10px;
          min-height: 90px;
          resize: vertical;
        }

        .reset {
          margin-top: 12px;
        }

        /* =====================
           MINISTRY
        ===================== */

        .ministry {
          padding: 15px;
          margin-bottom: 20px;
          border: 1px solid #dbe4ee;
          border-radius: 14px;
          background: #f8fbfd;
        }

        .ministry-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding-bottom: 11px;
          margin-bottom: 13px;
          border-bottom: 1px solid #dfe7ef;
        }

        .ministry-head h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .ministry-meta {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          color: #7487a0;
          font-size: 10px;
          font-weight: 800;
        }

        .glass-grid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 13px;
        }

        .glass-card {
          overflow: hidden;
          border: 1px solid #dbe4ee;
          border-radius: 12px;
          background: white;
        }

        .glass-card-head {
          display: flex;
          justify-content: space-between;
          padding: 14px;
          border-bottom: 1px solid #e7eef5;
          background: #f8fbfd;
        }

        .glass-card-head h4 {
          margin: 0 0 4px;
        }

        .direction {
          height: fit-content;
          padding: 5px 8px;
          border-radius: 7px;
          color: #087da8;
          background: #e8f7fd;
          font-size: 10px;
          font-weight: 900;
        }

        .glass-body {
          padding: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 12px;
        }

        .info-label {
          display: block;
          margin-bottom: 3px;
          color: #8998aa;
          font-size: 9px;
        }

        .info-value {
          display: block;
          font-size: 11px;
          font-weight: 800;
        }

        /* =====================
           STATUS
        ===================== */

        .status {
          display: inline-flex;
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

        .status-follow {
          color: #a16207;
          background: #fef3c7;
        }

        .status-none {
          color: #475569;
          background: #e2e8f0;
        }

        /* =====================
           CARD ACTIONS
        ===================== */

        .card-actions {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .small-btn {
          min-height: 31px;
          padding: 0 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        .details-btn {
          border: 0;
          color: white;
          background: #17263c;
        }

        .edit-btn {
          border: 1px solid #38bdf8;
          color: #087da8;
          background: white;
        }

        .delete-btn {
          border: 1px solid #fca5a5;
          color: #b91c1c;
          background: white;
        }

        /* =====================
           EMPTY
        ===================== */

        .empty {
          grid-column: 1 / -1;
          padding: 40px;
          border: 1px dashed #ccd8e5;
          border-radius: 10px;
          color: #8191a6;
          text-align: center;
        }

        /* =====================
           PAGINATION
        ===================== */

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
        }

        /* =====================
           MODALS
        ===================== */

        .overlay {
          position: fixed;
          z-index: 5000;
          inset: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background:
            rgba(
              15,
              28,
              45,
              0.62
            );
        }

        .modal {
          width: 100%;
          max-width: 850px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 14px;
          background: white;
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 17px;
          border-bottom: 1px solid #e6edf4;
        }

        .modal-head h2 {
          margin: 0;
          font-size: 17px;
        }

        .close {
          width: 35px;
          height: 35px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
        }

        .modal-body {
          padding: 18px;
        }

        .form-grid,
        .details-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 12px;
        }

        .full {
          grid-column: 1 / -1;
        }

        .detail-box {
          padding: 12px;
          border: 1px solid #dfe7ef;
          border-radius: 9px;
          background: #fbfcfe;
        }

        .detail-label {
          margin-bottom: 5px;
          color: #8191a6;
          font-size: 10px;
        }

        .detail-value {
          font-size: 12px;
          font-weight: 800;
        }

        .gallery {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 10px;
          margin-top: 12px;
        }

        .gallery img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border-radius: 10px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 16px;
        }

        /* =====================
           RESPONSIVE
        ===================== */

        @media (
          max-width: 1200px
        ) {
          .filters {
            grid-template-columns:
              repeat(
                3,
                1fr
              );
          }

          .glass-grid,
          .inspection-grid {
            grid-template-columns:
              repeat(
                2,
                1fr
              );
          }
        }

        @media (
          max-width: 720px
        ) {
          .glass-admin {
            padding: 15px;
          }

          .header,
          .panel-title {
            align-items: stretch;
            flex-direction: column;
          }

          .stats,
          .filters,
          .glass-grid,
          .inspection-grid,
          .form-grid,
          .details-grid,
          .gallery {
            grid-template-columns:
              1fr;
          }

          .full {
            grid-column: auto;
          }
        }
      `}</style>

      <div className="page">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="header">
          <div>
            <h1>
              {text.title}
            </h1>

            <p>
              {text.subtitle}
            </p>
          </div>

          <div className="actions">
            <input
              ref={
                fileInputRef
              }
              className="hidden"
              type="file"
              accept=".xlsx,.xls"
              onChange={
                importExcel
              }
            />

            <button
              type="button"
              className="btn btn-purple"
              onClick={
                downloadTemplate
              }
            >
              {text.template}
            </button>

            <button
              type="button"
              className="btn btn-green"
              disabled={
                importing
              }
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              {importing
                ? text.importing
                : text.importExcel}
            </button>

            <button
              type="button"
              className="btn btn-blue"
              onClick={
                openCreate
              }
            >
              + {text.addGlass}
            </button>

            <button
              type="button"
              className="btn btn-dark"
              disabled={
                loading
              }
              onClick={() => {
                loadData();
                loadFilters();
                loadInspections();
              }}
            >
              {text.refresh}
            </button>
          </div>
        </header>

        {/* =====================================================
            MESSAGES
        ===================================================== */}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}
          </div>
        )}

        {/* =====================================================
            STATS
        ===================================================== */}

        <section className="stats">
          {stats.map(
            (stat) => (
              <article
                key={
                  stat.label
                }
                className={`stat ${stat.className}`}
              >
                <div className="stat-label">
                  {
                    stat.label
                  }
                </div>

                <div className="stat-value">
                  {
                    stat.value
                  }
                </div>
              </article>
            ),
          )}
        </section>

        {/* =====================================================
            INSPECTION ACTIVITY
        ===================================================== */}

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                {
                  text.inspectionActivity
                }
              </h2>

              <p>
                {
                  text.inspectionActivityHint
                }
              </p>
            </div>

            <span className="count-badge">
              {
                inspections.length
              }{" "}
              {
                text.inspections
              }
            </span>
          </div>

          <div className="inspection-grid">
            {inspectionsLoading && (
              <div className="empty">
                {
                  text.loading
                }
              </div>
            )}

            {!inspectionsLoading &&
              inspections
                .slice(
                  0,
                  9,
                )
                .map(
                  (
                    inspection,
                  ) => {
                    const glass =
                      inspection?.glass ||
                      {};

                    const status =
                      inspectionStatus(
                        inspection
                          ?.inspectionStatus,
                        text,
                      );

                    const images =
                      Array.isArray(
                        inspection
                          ?.images,
                      )
                        ? inspection.images.filter(
                            (
                              image,
                            ) =>
                              image?.imageUrl,
                          )
                        : [];

                    return (
                      <article
                        key={
                          inspection.id
                        }
                        className="inspection"
                      >
                        <div className="inspection-head">
                          <div>
                            <div className="inspection-title">
                              {glass.building ||
                                "—"}
                            </div>

                            <div className="muted">
                              {glass.cluster ||
                                "—"}{" "}
                              ·{" "}
                              {glass.zone ||
                                "—"}{" "}
                              ·{" "}
                              {glass.direction ||
                                "—"}
                            </div>
                          </div>

                          <span
                            className={`status ${status.className}`}
                          >
                            {
                              status.label
                            }
                          </span>
                        </div>

                        <div className="muted">
                          <strong>
                            {
                              text.technician
                            }
                            :
                          </strong>{" "}
                          {technicianName(
                            inspection,
                          )}
                        </div>

                        <div className="muted">
                          <strong>
                            {
                              text.inspectionDate
                            }
                            :
                          </strong>{" "}
                          {formatDateTime(
                            inspection
                              .inspectedAt,
                            lang,
                          )}
                        </div>

                        <div className="inspection-comment">
                          {inspection.notes ||
                            "—"}
                        </div>

                        {images.length >
                          0 && (
                          <div className="thumbs">
                            {images
                              .slice(
                                0,
                                4,
                              )
                              .map(
                                (
                                  image,
                                ) => (
                                  <div
                                    className="thumb"
                                    key={
                                      image.id ||
                                      image.imageUrl
                                    }
                                  >
                                    <img
                                      src={getImageUrl(
                                        image.imageUrl,
                                      )}
                                      alt=""
                                    />
                                  </div>
                                ),
                              )}
                          </div>
                        )}

                        <div className="card-actions">
                          <button
                            type="button"
                            className="small-btn details-btn"
                            onClick={() =>
                              setSelectedInspection(
                                inspection,
                              )
                            }
                          >
                            {
                              text.details
                            }
                          </button>
                        </div>
                      </article>
                    );
                  },
                )}

            {!inspectionsLoading &&
              inspections.length ===
                0 && (
                <div className="empty">
                  {
                    text.noInspections
                  }
                </div>
              )}
          </div>
        </section>

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                {
                  text.filterTitle
                }
              </h2>
            </div>
          </div>

          <div className="filters">
            <div className="field">
              <label>
                {
                  text.search
                }
              </label>

              <input
                className="control"
                type="search"
                value={
                  filters.search
                }
                placeholder={
                  text.searchPlaceholder
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "search",
                    event.target
                      .value,
                  )
                }
              />
            </div>

            <div className="field">
              <label>
                {
                  text.currentStatus
                }
              </label>

              <select
                className="control"
                value={
                  filters.currentStatus
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "currentStatus",
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {
                    text.allStatuses
                  }
                </option>

                <option value="OK">
                  {text.ok}
                </option>

                <option value="NOT_OK">
                  {
                    text.notOk
                  }
                </option>

                <option value="NEEDS_FOLLOW_UP">
                  {
                    text.followUp
                  }
                </option>

                <option value="NOT_INSPECTED">
                  {
                    text.notInspected
                  }
                </option>
              </select>
            </div>

            <div className="field">
              <label>
                {
                  text.cluster
                }
              </label>

              <select
                className="control"
                value={
                  filters.cluster
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "cluster",
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {
                    text.allClusters
                  }
                </option>

                {filterOptions.clusters.map(
                  (
                    cluster,
                  ) => (
                    <option
                      key={
                        cluster
                      }
                      value={
                        cluster
                      }
                    >
                      {
                        cluster
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>
                {
                  text.building
                }
              </label>

              <select
                className="control"
                value={
                  filters.building
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "building",
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {
                    text.allBuildings
                  }
                </option>

                {filterOptions.buildings.map(
                  (
                    building,
                  ) => (
                    <option
                      key={
                        building
                      }
                      value={
                        building
                      }
                    >
                      {
                        building
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>
                {
                  text.zone
                }
              </label>

              <select
                className="control"
                value={
                  filters.zone
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "zone",
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {
                    text.allZones
                  }
                </option>

                {filterOptions.zones.map(
                  (
                    zone,
                  ) => (
                    <option
                      key={
                        zone
                      }
                      value={
                        zone
                      }
                    >
                      {
                        zone
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>
                {
                  text.direction
                }
              </label>

              <select
                className="control"
                value={
                  filters.direction
                }
                onChange={(
                  event,
                ) =>
                  updateFilter(
                    "direction",
                    event.target
                      .value,
                  )
                }
              >
                <option value="">
                  {
                    text.allDirections
                  }
                </option>

                {filterOptions.directions.map(
                  (
                    direction,
                  ) => (
                    <option
                      key={
                        direction
                      }
                      value={
                        direction
                      }
                    >
                      {
                        direction
                      }
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-blue reset"
            onClick={
              resetFilters
            }
          >
            {text.reset}
          </button>
        </section>

        {/* =====================================================
            GLASS GROUPED BY MINISTRY
        ===================================================== */}

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                {
                  text.glassByMinistry
                }
              </h2>

              <p>
                {
                  text.glassByMinistryHint
                }
              </p>
            </div>

            <span className="count-badge">
              {
                pagination.total
              }{" "}
              {
                text.glassCount
              }
            </span>
          </div>

          {loading && (
            <div className="empty">
              {
                text.loading
              }
            </div>
          )}

          {!loading &&
            groupedGlass.map(
              ([
                ministry,
                ministryGlass,
              ]) => {
                const ministryInspections =
                  ministryGlass.reduce(
                    (
                      total,
                      glass,
                    ) =>
                      total +
                      (
                        inspectionCounts.get(
                          Number(
                            glass.id,
                          ),
                        ) || 0
                      ),

                    0,
                  );

                return (
                  <section
                    className="ministry"
                    key={
                      ministry
                    }
                  >
                    <div className="ministry-head">
                      <div>
                        <h3>
                          {
                            ministry
                          }
                        </h3>

                        <div className="ministry-meta">
                          <span>
                            {
                              text.glassCount
                            }
                            :{" "}
                            {
                              ministryGlass.length
                            }
                          </span>

                          <span>
                            {
                              text.inspectionCount
                            }
                            :{" "}
                            {
                              ministryInspections
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-grid">
                      {ministryGlass.map(
                        (
                          glass,
                        ) => {
                          const state =
                            glassStatus(
                              glass.currentStatus,
                              text,
                            );

                          const count =
                            inspectionCounts.get(
                              Number(
                                glass.id,
                              ),
                            ) ||
                            0;

                          return (
                            <article
                              className="glass-card"
                              key={
                                glass.id
                              }
                            >
                              <div className="glass-card-head">
                                <div>
                                  <h4>
                                    {glass.zone ||
                                      "—"}
                                  </h4>

                                  <div className="muted">
                                    {glass.cluster ||
                                      "—"}{" "}
                                    ·{" "}
                                    {
                                      ministry
                                    }
                                  </div>
                                </div>

                                <span className="direction">
                                  {glass.direction ||
                                    "—"}
                                </span>
                              </div>

                              <div className="glass-body">
                                <div className="info-grid">
                                  <div>
                                    <span className="info-label">
                                      {
                                        text.zone
                                      }
                                    </span>

                                    <span className="info-value">
                                      {glass.zone ||
                                        "—"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="info-label">
                                      {
                                        text.lane
                                      }
                                    </span>

                                    <span className="info-value">
                                      {glass.lane ||
                                        "—"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="info-label">
                                      {
                                        text.glassType
                                      }
                                    </span>

                                    <span className="info-value">
                                      {glass.glassType ||
                                        "—"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="info-label">
                                      {
                                        text.thickness
                                      }
                                    </span>

                                    <span className="info-value">
                                      {glass.thickness ||
                                        "—"}
                                    </span>
                                  </div>

                                  <div>
                                    <span className="info-label">
                                      {
                                        text.inspectionCount
                                      }
                                    </span>

                                    <span className="info-value">
                                      {
                                        count
                                      }
                                    </span>
                                  </div>

                                  <div>
                                    <span className="info-label">
                                      {
                                        text.lastInspection
                                      }
                                    </span>

                                    <span className="info-value">
                                      {formatDate(
                                        glass.lastInspectionAt,
                                        lang,
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <span
                                  className={`status ${state.className}`}
                                >
                                  {
                                    state.label
                                  }
                                </span>

                                <div className="card-actions">
                                  <button
                                    type="button"
                                    className="small-btn details-btn"
                                    onClick={() =>
                                      setSelectedGlass(
                                        glass,
                                      )
                                    }
                                  >
                                    {
                                      text.details
                                    }
                                  </button>

                                  <button
                                    type="button"
                                    className="small-btn edit-btn"
                                    onClick={() =>
                                      openEdit(
                                        glass,
                                      )
                                    }
                                  >
                                    {
                                      text.edit
                                    }
                                  </button>

                                  <button
                                    type="button"
                                    className="small-btn delete-btn"
                                    onClick={() =>
                                      deleteGlass(
                                        glass,
                                      )
                                    }
                                  >
                                    {
                                      text.delete
                                    }
                                  </button>
                                </div>
                              </div>
                            </article>
                          );
                        },
                      )}
                    </div>
                  </section>
                );
              },
            )}

          {!loading &&
            rows.length ===
              0 && (
              <div className="empty">
                {
                  text.noRecords
                }
              </div>
            )}

          {pagination.totalPages >
            1 && (
            <div className="pagination">
              <button
                type="button"
                className="btn btn-blue"
                disabled={
                  pagination.page <=
                  1
                }
                onClick={() =>
                  updateFilter(
                    "page",
                    pagination.page -
                      1,
                  )
                }
              >
                {
                  text.previous
                }
              </button>

              <span>
                {text.page}{" "}
                {
                  pagination.page
                }{" "}
                {text.of}{" "}
                {
                  pagination.totalPages
                }
              </span>

              <button
                type="button"
                className="btn btn-blue"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  updateFilter(
                    "page",
                    pagination.page +
                      1,
                  )
                }
              >
                {
                  text.next
                }
              </button>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================
          ADD / EDIT GLASS MODAL
      ===================================================== */}

      {formOpen && (
        <div
          className="overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <section className="modal">
            <header className="modal-head">
              <h2>
                {editingGlass
                  ? text.editTitle
                  : text.addTitle}
              </h2>

              <button
                type="button"
                className="close"
                onClick={
                  closeForm
                }
              >
                ×
              </button>
            </header>

            <form
              className="modal-body"
              onSubmit={
                saveGlass
              }
            >
              <div className="form-grid">
                <div className="field">
                  <label>
                    {text.cluster} *
                  </label>

                  <input
                    className="control"
                    required
                    value={
                      form.cluster
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "cluster",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {
                      text.building
                    }{" "}
                    *
                  </label>

                  <input
                    className="control"
                    required
                    value={
                      form.building
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "building",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {text.zone} *
                  </label>

                  <input
                    className="control"
                    required
                    value={
                      form.zone
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "zone",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {
                      text.direction
                    }{" "}
                    *
                  </label>

                  <select
                    className="control"
                    required
                    value={
                      form.direction
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "direction",
                        event.target
                          .value,
                      )
                    }
                  >
                    <option value="IN">
                      IN
                    </option>

                    <option value="OUT">
                      OUT
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    {
                      text.lane
                    }
                  </label>

                  <input
                    className="control"
                    value={
                      form.lane
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "lane",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {
                      text.glassType
                    }
                  </label>

                  <input
                    className="control"
                    value={
                      form.glassType
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "glassType",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {
                      text.thickness
                    }
                  </label>

                  <input
                    className="control"
                    value={
                      form.thickness
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "thickness",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>
                    {
                      text.assetStatus
                    }
                  </label>

                  <select
                    className="control"
                    value={
                      form.status
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "status",
                        event.target
                          .value,
                      )
                    }
                  >
                    <option value="ACTIVE">
                      {
                        text.active
                      }
                    </option>

                    <option value="INACTIVE">
                      {
                        text.inactive
                      }
                    </option>

                    <option value="MAINTENANCE">
                      {
                        text.maintenance
                      }
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    {
                      text.currentStatus
                    }
                  </label>

                  <select
                    className="control"
                    value={
                      form.currentStatus
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "currentStatus",
                        event.target
                          .value,
                      )
                    }
                  >
                    <option value="NOT_INSPECTED">
                      {
                        text.notInspected
                      }
                    </option>

                    <option value="OK">
                      {
                        text.ok
                      }
                    </option>

                    <option value="NOT_OK">
                      {
                        text.notOk
                      }
                    </option>

                    <option value="NEEDS_FOLLOW_UP">
                      {
                        text.followUp
                      }
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>
                    {
                      text.installDate
                    }
                  </label>

                  <input
                    type="date"
                    className="control"
                    value={
                      form.installDate
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "installDate",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>

                <div className="field full">
                  <label>
                    {
                      text.notes
                    }
                  </label>

                  <textarea
                    className="control"
                    value={
                      form.notes
                    }
                    onChange={(
                      event,
                    ) =>
                      updateForm(
                        "notes",
                        event.target
                          .value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-blue"
                  onClick={
                    closeForm
                  }
                >
                  {
                    text.cancel
                  }
                </button>

                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? text.saving
                    : text.save}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* =====================================================
          INSPECTION DETAILS MODAL
      ===================================================== */}

      {selectedInspection && (
        <div
          className="overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedInspection(
                null,
              );
            }
          }}
        >
          <section className="modal">
            <header className="modal-head">
              <h2>
                {
                  text.inspectionDetails
                }
              </h2>

              <button
                type="button"
                className="close"
                onClick={() =>
                  setSelectedInspection(
                    null,
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="details-grid">
                {[
                  [
                    text.building,

                    selectedInspection
                      ?.glass
                      ?.building ||
                      "—",
                  ],

                  [
                    text.cluster,

                    selectedInspection
                      ?.glass
                      ?.cluster ||
                      "—",
                  ],

                  [
                    text.zone,

                    selectedInspection
                      ?.glass
                      ?.zone ||
                      "—",
                  ],

                  [
                    text.direction,

                    selectedInspection
                      ?.glass
                      ?.direction ||
                      "—",
                  ],

                  [
                    text.technician,

                    technicianName(
                      selectedInspection,
                    ),
                  ],

                  [
                    text.inspectionDate,

                    formatDateTime(
                      selectedInspection
                        ?.inspectedAt,

                      lang,
                    ),
                  ],

                  [
                    text.status,

                    inspectionStatus(
                      selectedInspection
                        ?.inspectionStatus,

                      text,
                    ).label,
                  ],

                  [
                    text.comment,

                    selectedInspection
                      ?.notes ||
                      "—",
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      className="detail-box"
                      key={
                        label
                      }
                    >
                      <div className="detail-label">
                        {
                          label
                        }
                      </div>

                      <div className="detail-value">
                        {
                          value
                        }
                      </div>
                    </div>
                  ),
                )}
              </div>

              {Array.isArray(
                selectedInspection.images,
              ) &&
                selectedInspection.images.filter(
                  (
                    image,
                  ) =>
                    image?.imageUrl,
                ).length >
                  0 && (
                  <>
                    <h3>
                      {
                        text.images
                      }
                    </h3>

                    <div className="gallery">
                      {selectedInspection.images
                        .filter(
                          (
                            image,
                          ) =>
                            image?.imageUrl,
                        )
                        .map(
                          (
                            image,
                          ) => (
                            <a
                              key={
                                image.id ||
                                image.imageUrl
                              }
                              href={getImageUrl(
                                image.imageUrl,
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={getImageUrl(
                                  image.imageUrl,
                                )}
                                alt=""
                              />
                            </a>
                          ),
                        )}
                    </div>
                  </>
                )}
            </div>
          </section>
        </div>
      )}

      {/* =====================================================
          GLASS DETAILS MODAL
      ===================================================== */}

      {selectedGlass && (
        <div
          className="overlay"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedGlass(
                null,
              );
            }
          }}
        >
          <section className="modal">
            <header className="modal-head">
              <h2>
                {
                  text.detailsTitle
                }
              </h2>

              <button
                type="button"
                className="close"
                onClick={() =>
                  setSelectedGlass(
                    null,
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="details-grid">
                {[
                  [
                    text.cluster,
                    selectedGlass.cluster ||
                      "—",
                  ],

                  [
                    text.building,
                    selectedGlass.building ||
                      "—",
                  ],

                  [
                    text.zone,
                    selectedGlass.zone ||
                      "—",
                  ],

                  [
                    text.direction,
                    selectedGlass.direction ||
                      "—",
                  ],

                  [
                    text.lane,
                    selectedGlass.lane ||
                      "—",
                  ],

                  [
                    text.glassType,
                    selectedGlass.glassType ||
                      "—",
                  ],

                  [
                    text.thickness,
                    selectedGlass.thickness ||
                      "—",
                  ],

                  [
                    text.assetStatus,
                    selectedGlass.status ||
                      "—",
                  ],

                  [
                    text.currentStatus,

                    glassStatus(
                      selectedGlass.currentStatus,
                      text,
                    ).label,
                  ],

                  [
                    text.installDate,

                    formatDate(
                      selectedGlass.installDate,
                      lang,
                    ),
                  ],

                  [
                    text.lastInspection,

                    formatDateTime(
                      selectedGlass.lastInspectionAt,
                      lang,
                    ),
                  ],

                  [
                    text.notes,
                    selectedGlass.notes ||
                      "—",
                  ],
                ].map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      className="detail-box"
                      key={
                        label
                      }
                    >
                      <div className="detail-label">
                        {
                          label
                        }
                      </div>

                      <div className="detail-value">
                        {
                          value
                        }
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}