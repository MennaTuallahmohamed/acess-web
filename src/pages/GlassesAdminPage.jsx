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

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app"
).replace(/\/+$/, "");

const TEXT = {
  en: {
    title: "Gate Glass",
    subtitle:
      "Import, add, edit, and manage every gate-glass record from the backend.",

    importExcel: "Import Excel",
    importing: "Importing...",
    downloadTemplate: "Excel Template",
    addGlass: "Add Gate Glass",
    refresh: "Refresh",

    total: "Total Glass",
    ok: "OK",
    notOk: "Not OK",
    followUp: "Needs Follow-up",
    notInspected: "Not Inspected",
    buildings: "Buildings",
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
    recordsHint:
      "All changes are saved directly to the backend.",
    loading: "Loading...",
    noRecords: "No gate-glass records found.",
    noRecordsHint:
      "Import Excel or add a gate-glass record manually.",

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
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    close: "Close",

    createTitle: "Add Gate Glass",
    editTitle: "Edit Gate Glass",
    detailsTitle: "Gate Glass Details",

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

    importSuccess: "Excel imported successfully.",
    sourceRows: "Source rows",
    created: "Created",
    updated: "Updated",
    rejected: "Rejected",

    saveSuccess: "Gate-glass record saved successfully.",
    deleteSuccess: "Gate-glass record deleted successfully.",
    confirmDelete:
      "Delete this gate-glass record?",
    chooseExcel:
      "Choose an Excel file in xlsx or xls format.",
    sessionExpired:
      "Your session has expired. Sign in again.",
    endpointMissing:
      "Gate Glass backend routes are not deployed on Railway yet.",
    failedLoad:
      "Failed to load Gate Glass data.",
    failedSave:
      "Failed to save the Gate Glass record.",
    failedDelete:
      "Failed to delete the Gate Glass record.",
    failedImport:
      "Failed to import the Excel file.",
    failedTemplate:
      "Failed to download the Excel template.",
    requiredFields:
      "Cluster, Building, Zone, and Direction are required.",
  },

  ar: {
    title: "زجاج البوابات",
    subtitle:
      "استيراد وإضافة وتعديل وإدارة جميع سجلات زجاج البوابات من الباك إند.",

    importExcel: "استيراد Excel",
    importing: "جاري الاستيراد...",
    downloadTemplate: "نموذج Excel",
    addGlass: "إضافة زجاج بوابة",
    refresh: "تحديث",

    total: "إجمالي الزجاج",
    ok: "سليم",
    notOk: "غير سليم",
    followUp: "يحتاج متابعة",
    notInspected: "لم يُفحص",
    buildings: "المباني",
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
    recordsHint:
      "كل الإضافات والتعديلات تُحفظ مباشرة في الباك إند.",
    loading: "جارٍ التحميل...",
    noRecords: "لا توجد سجلات زجاج بوابات.",
    noRecordsHint:
      "ارفعي Excel أو أضيفي سجل زجاج بوابة يدويًا.",

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
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    saving: "جاري الحفظ...",
    cancel: "إلغاء",
    close: "إغلاق",

    createTitle: "إضافة زجاج بوابة",
    editTitle: "تعديل زجاج بوابة",
    detailsTitle: "تفاصيل زجاج البوابة",

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

    importSuccess: "تم استيراد ملف Excel بنجاح.",
    sourceRows: "صفوف المصدر",
    created: "تم إنشاؤه",
    updated: "تم تحديثه",
    rejected: "مرفوض",

    saveSuccess: "تم حفظ سجل زجاج البوابة بنجاح.",
    deleteSuccess: "تم حذف سجل زجاج البوابة بنجاح.",
    confirmDelete:
      "هل تريدين حذف سجل زجاج البوابة؟",
    chooseExcel:
      "اختاري ملف Excel بصيغة xlsx أو xls.",
    sessionExpired:
      "انتهت الجلسة. سجّلي الدخول مرة أخرى.",
    endpointMissing:
      "مسارات زجاج البوابات لم تُنشر على Railway حتى الآن.",
    failedLoad:
      "تعذر تحميل بيانات زجاج البوابات.",
    failedSave:
      "تعذر حفظ سجل زجاج البوابة.",
    failedDelete:
      "تعذر حذف سجل زجاج البوابة.",
    failedImport:
      "تعذر استيراد ملف Excel.",
    failedTemplate:
      "تعذر تحميل نموذج Excel.",
    requiredFields:
      "الكلاستر والمبنى والزون والاتجاه حقول مطلوبة.",
  },
};

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
  const headers =
    new Headers(options.headers || {});

  const token =
    getStoredToken();

  if (
    token &&
    !headers.has("Authorization")
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
      credentials: "include",
    },
  );
}

function buildQueryString(filters) {
  const params =
    new URLSearchParams();

  Object.entries(filters).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
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
      label:
        text.statusNotInspected,
      className:
        "status-not-inspected",
    },
  };

  return (
    map[status] || {
      label:
        status || "—",
      className:
        "status-not-inspected",
    }
  );
}

function formatDate(value, lang) {
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
      dateStyle: "medium",
    },
  ).format(date);
}

function toDateInput(value) {
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

async function readJsonResponse(
  response,
) {
  const contentType =
    response.headers.get(
      "content-type",
    ) || "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return {
    message:
      text || response.statusText,
  };
}

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

export default function GlassesAdminPage() {
  const { lang } = useLang();

  const text =
    TEXT[
      lang === "ar"
        ? "ar"
        : "en"
    ];

  const fileInputRef =
    useRef(null);

  const [rows, setRows] =
    useState([]);

  const [summary, setSummary] =
    useState(INITIAL_SUMMARY);

  const [
    pagination,
    setPagination,
  ] = useState(
    INITIAL_PAGINATION,
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

  const [filters, setFilters] =
    useState({
      search: "",
      cluster: "",
      building: "",
      zone: "",
      direction: "",
      currentStatus: "",
      page: 1,
      limit: 20,
    });

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

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    importing,
    setImporting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    importResult,
    setImportResult,
  ] = useState(null);

  const checkResponse = useCallback(
    async (
      response,
      fallbackMessage,
    ) => {
      if (
        response.status === 401
      ) {
        throw new Error(
          text.sessionExpired,
        );
      }

      if (
        response.status === 404
      ) {
        throw new Error(
          text.endpointMissing,
        );
      }

      const data =
        await readJsonResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          Array.isArray(
            data?.message,
          )
            ? data.message.join(
                " - ",
              )
            : data?.message ||
              fallbackMessage,
        );
      }

      return data;
    },
    [text],
  );

  const loadFilters =
    useCallback(async () => {
      try {
        const response =
          await apiFetch(
            "/glasses/filters",
            {
              cache:
                "no-store",
            },
          );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        setFilterOptions({
          clusters:
            data.clusters || [],
          buildings:
            data.buildings || [],
          zones:
            data.zones || [],
          directions:
            data.directions || [],
          lanes:
            data.lanes || [],
        });
      } catch {
        // The list can still load.
      }
    }, []);

  const loadData =
    useCallback(async () => {
      setLoading(true);
      setError("");

      try {
        const listQuery =
          buildQueryString(
            filters,
          );

        const summaryQuery =
          buildQueryString({
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
        ] = await Promise.all([
          apiFetch(
            `/glasses?${listQuery}`,
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
          listData.data || [],
        );

        setPagination(
          listData.pagination ||
            INITIAL_PAGINATION,
        );

        setSummary({
          ...INITIAL_SUMMARY,
          ...summaryData,
        });
      } catch (requestError) {
        setRows([]);
        setSummary(
          INITIAL_SUMMARY,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : text.failedLoad,
        );
      } finally {
        setLoading(false);
      }
    }, [
      filters,
      checkResponse,
      text.failedLoad,
    ]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    const timer =
      window.setTimeout(
        loadData,
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

  const stats = useMemo(
    () => [
      {
        label:
          text.total,
        value:
          summary.total,
        color: "blue",
      },
      {
        label:
          text.ok,
        value:
          summary.ok,
        color: "green",
      },
      {
        label:
          text.notOk,
        value:
          summary.notOk,
        color: "red",
      },
      {
        label:
          text.followUp,
        value:
          summary.needsFollowUp,
        color: "orange",
      },
      {
        label:
          text.notInspected,
        value:
          summary.notInspected,
        color: "purple",
      },
      {
        label:
          text.zones,
        value:
          summary.zones,
        color: "cyan",
      },
    ],
    [summary, text],
  );

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

  function openCreate() {
    setEditingGlass(null);
    setForm({
      ...EMPTY_FORM,
    });
    setFormOpen(true);
    setError("");
  }

  function openEdit(glass) {
    setEditingGlass(glass);

    setForm({
      cluster:
        glass.cluster || "",
      building:
        glass.building || "",
      zone:
        glass.zone || "",
      direction:
        glass.direction || "IN",
      lane:
        glass.lane || "",
      glassType:
        glass.glassType || "",
      thickness:
        glass.thickness || "",
      status:
        glass.status || "ACTIVE",
      currentStatus:
        glass.currentStatus ||
        "NOT_INSPECTED",
      installDate:
        toDateInput(
          glass.installDate,
        ),
      notes:
        glass.notes || "",
    });

    setFormOpen(true);
    setError("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingGlass(null);
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
        [name]: value,
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
        text.requiredFields,
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

      const isEditing =
        Boolean(
          editingGlass?.id,
        );

      const response =
        await apiFetch(
          isEditing
            ? `/glasses/${editingGlass.id}`
            : "/glasses",
          {
            method:
              isEditing
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
        text.saveSuccess,
      );

      await Promise.all([
        loadData(),
        loadFilters(),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text.failedSave,
      );
    } finally {
      setSaving(false);
    }
  }

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
            method: "DELETE",
          },
        );

      await checkResponse(
        response,
        text.failedDelete,
      );

      setSuccess(
        text.deleteSuccess,
      );

      await Promise.all([
        loadData(),
        loadFilters(),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text.failedDelete,
      );
    }
  }

  async function importExcel(
    event,
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !/\.(xlsx|xls)$/i.test(
        file.name,
      )
    ) {
      setError(
        text.chooseExcel,
      );
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");
    setImportResult(null);

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
            method: "POST",
            body: formData,
          },
        );

      const data =
        await checkResponse(
          response,
          text.failedImport,
        );

      setImportResult(data);
      setSuccess(
        text.importSuccess,
      );

      setFilters(
        (current) => ({
          ...current,
          page: 1,
        }),
      );

      await Promise.all([
        loadData(),
        loadFilters(),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text.failedImport,
      );
    } finally {
      setImporting(false);
    }
  }

  async function downloadTemplate() {
    setError("");

    try {
      const response =
        await apiFetch(
          "/glasses/import-template",
        );

      if (
        response.status === 401
      ) {
        throw new Error(
          text.sessionExpired,
        );
      }

      if (
        response.status === 404
      ) {
        throw new Error(
          text.endpointMissing,
        );
      }

      if (!response.ok) {
        throw new Error(
          text.failedTemplate,
        );
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

      link.href = url;
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
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : text.failedTemplate,
      );
    }
  }

  return (
    <main
      className="gate-glass-page"
      dir={
        lang === "ar"
          ? "rtl"
          : "ltr"
      }
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
        select,
        textarea {
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .action-button {
          height: 41px;
          padding: 0 15px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 900;
        }

        .action-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .button-dark {
          border: 0;
          color: #ffffff;
          background: #17253a;
        }

        .button-blue {
          border: 1px solid #0ea5e9;
          color: #087da8;
          background: #ffffff;
        }

        .button-green {
          border: 1px solid #22c55e;
          color: #15803d;
          background: #ffffff;
        }

        .button-purple {
          border: 1px solid #7c3aed;
          color: #6d28d9;
          background: #ffffff;
        }

        .hidden-input {
          display: none;
        }

        .message {
          padding: 13px 15px;
          margin-bottom: 15px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 800;
          line-height: 1.8;
        }

        .message.error {
          border: 1px solid #fecaca;
          color: #b91c1c;
          background: #fff1f2;
        }

        .message.success {
          border: 1px solid #bbf7d0;
          color: #15803d;
          background: #f0fdf4;
        }

        .import-summary {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 5px;
          font-weight: 700;
        }

        .stats-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
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
          box-shadow:
            0 3px 10px
            rgba(20, 44, 71, 0.04);
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
          box-shadow:
            0 3px 12px
            rgba(20, 44, 71, 0.04);
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

        textarea.control {
          min-height: 90px;
          padding: 11px;
          resize: vertical;
        }

        .control:focus {
          border-color: #20a8df;
          background: #ffffff;
          box-shadow:
            0 0 0 3px
            rgba(32, 168, 223, 0.1);
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
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
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
          box-shadow:
            0 10px 24px
            rgba(20, 44, 71, 0.08);
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
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
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
          flex-wrap: wrap;
        }

        .small-button {
          height: 31px;
          padding: 0 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        .details-button {
          border: 0;
          color: #ffffff;
          background: #18273c;
        }

        .edit-button {
          border: 1px solid #38bdf8;
          color: #087da8;
          background: #ffffff;
        }

        .delete-button {
          border: 1px solid #fca5a5;
          color: #b91c1c;
          background: #ffffff;
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
          background:
            rgba(15, 28, 45, 0.6);
          backdrop-filter: blur(4px);
        }

        .modal {
          width: 100%;
          max-width: 850px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 14px;
          background: #ffffff;
          box-shadow:
            0 25px 70px
            rgba(0, 0, 0, 0.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 17px 19px;
          border-bottom:
            1px solid #e6edf4;
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

        .form-grid,
        .detail-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .full-field {
          grid-column: 1 / -1;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding-top: 16px;
        }

        .detail-box {
          padding: 14px;
          border: 1px solid #dfe7ef;
          border-radius: 10px;
          background: #fbfcfe;
        }

        .detail-row {
          display: grid;
          grid-template-columns:
            125px 1fr;
          gap: 10px;
          padding: 7px 0;
          border-bottom:
            1px solid #edf2f6;
          font-size: 11px;
        }

        .detail-row:last-child {
          border-bottom: 0;
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
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .glass-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
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

          .stats-grid,
          .filter-grid,
          .glass-grid,
          .form-grid,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .full-field {
            grid-column: auto;
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

          <div className="header-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden-input"
              onChange={importExcel}
            />

            <button
              type="button"
              className="action-button button-purple"
              onClick={downloadTemplate}
            >
              {text.downloadTemplate}
            </button>

            <button
              type="button"
              className="action-button button-green"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={importing}
            >
              {importing
                ? text.importing
                : text.importExcel}
            </button>

            <button
              type="button"
              className="action-button button-blue"
              onClick={openCreate}
            >
              + {text.addGlass}
            </button>

            <button
              type="button"
              className="action-button button-dark"
              onClick={loadData}
              disabled={loading}
            >
              {text.refresh}
            </button>
          </div>
        </header>

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {success && (
          <div className="message success">
            {success}

            {importResult && (
              <div className="import-summary">
                <span>
                  {text.sourceRows}:{" "}
                  {importResult.sourceRows}
                </span>

                <span>
                  {text.created}:{" "}
                  {importResult.created}
                </span>

                <span>
                  {text.updated}:{" "}
                  {importResult.updated}
                </span>

                <span>
                  {text.rejected}:{" "}
                  {importResult.rejectedCount}
                </span>
              </div>
            )}
          </div>
        )}

        <section className="stats-grid">
          {stats.map((stat) => (
            <article
              className={`stat-card ${stat.color}`}
              key={stat.label}
            >
              <div className="stat-label">
                {stat.label}
              </div>

              <div className="stat-value">
                {stat.value}
              </div>
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
                  updateFilter(
                    "search",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="field">
              <label>{text.currentStatus}</label>

              <select
                className="control"
                value={filters.currentStatus}
                onChange={(event) =>
                  updateFilter(
                    "currentStatus",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {text.allStatuses}
                </option>

                <option value="OK">
                  {text.statusOk}
                </option>

                <option value="NOT_OK">
                  {text.statusNotOk}
                </option>

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
                  updateFilter(
                    "cluster",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {text.allClusters}
                </option>

                {filterOptions.clusters.map(
                  (cluster) => (
                    <option
                      value={cluster}
                      key={cluster}
                    >
                      {cluster}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>{text.building}</label>

              <select
                className="control"
                value={filters.building}
                onChange={(event) =>
                  updateFilter(
                    "building",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {text.allBuildings}
                </option>

                {filterOptions.buildings.map(
                  (building) => (
                    <option
                      value={building}
                      key={building}
                    >
                      {building}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>{text.zone}</label>

              <select
                className="control"
                value={filters.zone}
                onChange={(event) =>
                  updateFilter(
                    "zone",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {text.allZones}
                </option>

                {filterOptions.zones.map(
                  (zone) => (
                    <option
                      value={zone}
                      key={zone}
                    >
                      {zone}
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="field">
              <label>{text.direction}</label>

              <select
                className="control"
                value={filters.direction}
                onChange={(event) =>
                  updateFilter(
                    "direction",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  {text.allDirections}
                </option>

                {filterOptions.directions.map(
                  (direction) => (
                    <option
                      value={direction}
                      key={direction}
                    >
                      {direction}
                    </option>
                  ),
                )}
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
                const statusInfo =
                  getStatusInfo(
                    glass.currentStatus,
                    text,
                  );

                return (
                  <article
                    className="glass-card"
                    key={glass.id}
                  >
                    <div className="card-top">
                      <div>
                        <h3>{glass.building}</h3>

                        <div className="card-subtitle">
                          {glass.cluster} · {glass.zone}
                        </div>
                      </div>

                      <span className="direction-badge">
                        {glass.direction}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-grid">
                        <div>
                          <span className="info-label">
                            {text.zone}
                          </span>

                          <span className="info-value">
                            {glass.zone || "—"}
                          </span>
                        </div>

                        <div>
                          <span className="info-label">
                            {text.lane}
                          </span>

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

                      <div
                        className="card-actions"
                        style={{
                          marginTop: 13,
                        }}
                      >
                        <button
                          type="button"
                          className="small-button details-button"
                          onClick={() =>
                            setSelectedGlass(glass)
                          }
                        >
                          {text.details}
                        </button>

                        <button
                          type="button"
                          className="small-button edit-button"
                          onClick={() =>
                            openEdit(glass)
                          }
                        >
                          {text.edit}
                        </button>

                        <button
                          type="button"
                          className="small-button delete-button"
                          onClick={() =>
                            deleteGlass(glass)
                          }
                        >
                          {text.delete}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

            {!loading &&
              rows.length === 0 && (
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
                  updateFilter(
                    "page",
                    pagination.page - 1,
                  )
                }
              >
                {text.previous}
              </button>

              <span>
                {text.page} {pagination.page}{" "}
                {text.of} {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={
                  pagination.page >=
                  pagination.totalPages
                }
                onClick={() =>
                  updateFilter(
                    "page",
                    pagination.page + 1,
                  )
                }
              >
                {text.next}
              </button>
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeForm();
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
          >
            <header className="modal-header">
              <h2>
                {editingGlass
                  ? text.editTitle
                  : text.createTitle}
              </h2>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
                title={text.close}
                aria-label={text.close}
              >
                ×
              </button>
            </header>

            <form
              className="modal-body"
              onSubmit={saveGlass}
            >
              <div className="form-grid">
                <div className="field">
                  <label>{text.cluster} *</label>

                  <input
                    className="control"
                    value={form.cluster}
                    onChange={(event) =>
                      updateForm(
                        "cluster",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>{text.building} *</label>

                  <input
                    className="control"
                    value={form.building}
                    onChange={(event) =>
                      updateForm(
                        "building",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>{text.zone} *</label>

                  <input
                    className="control"
                    value={form.zone}
                    onChange={(event) =>
                      updateForm(
                        "zone",
                        event.target.value,
                      )
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label>{text.direction} *</label>

                  <select
                    className="control"
                    value={form.direction}
                    onChange={(event) =>
                      updateForm(
                        "direction",
                        event.target.value,
                      )
                    }
                    required
                  >
                    <option value="IN">
                      {text.inDirection}
                    </option>

                    <option value="OUT">
                      {text.outDirection}
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>{text.lane}</label>

                  <input
                    className="control"
                    value={form.lane}
                    onChange={(event) =>
                      updateForm(
                        "lane",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>{text.glassType}</label>

                  <input
                    className="control"
                    value={form.glassType}
                    onChange={(event) =>
                      updateForm(
                        "glassType",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>{text.thickness}</label>

                  <input
                    className="control"
                    value={form.thickness}
                    onChange={(event) =>
                      updateForm(
                        "thickness",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="field">
                  <label>{text.assetStatus}</label>

                  <select
                    className="control"
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value,
                      )
                    }
                  >
                    <option value="ACTIVE">
                      {text.active}
                    </option>

                    <option value="INACTIVE">
                      {text.inactive}
                    </option>

                    <option value="MAINTENANCE">
                      {text.maintenance}
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>{text.currentStatus}</label>

                  <select
                    className="control"
                    value={form.currentStatus}
                    onChange={(event) =>
                      updateForm(
                        "currentStatus",
                        event.target.value,
                      )
                    }
                  >
                    <option value="NOT_INSPECTED">
                      {text.statusNotInspected}
                    </option>

                    <option value="OK">
                      {text.statusOk}
                    </option>

                    <option value="NOT_OK">
                      {text.statusNotOk}
                    </option>

                    <option value="NEEDS_FOLLOW_UP">
                      {text.statusFollowUp}
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>{text.installDate}</label>

                  <input
                    type="date"
                    className="control"
                    value={form.installDate}
                    onChange={(event) =>
                      updateForm(
                        "installDate",
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="field full-field">
                  <label>{text.notes}</label>

                  <textarea
                    className="control"
                    value={form.notes}
                    onChange={(event) =>
                      updateForm(
                        "notes",
                        event.target.value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="action-button button-blue"
                  onClick={closeForm}
                >
                  {text.cancel}
                </button>

                <button
                  type="submit"
                  className="action-button button-dark"
                  disabled={saving}
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

      {selectedGlass && (
        <div
          className="modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              setSelectedGlass(null);
            }
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
          >
            <header className="modal-header">
              <h2>{text.detailsTitle}</h2>

              <button
                type="button"
                className="close-button"
                onClick={() =>
                  setSelectedGlass(null)
                }
                title={text.close}
                aria-label={text.close}
              >
                ×
              </button>
            </header>

            <div className="modal-body">
              <div className="detail-grid">
                {[
                  [text.cluster, selectedGlass.cluster],
                  [text.building, selectedGlass.building],
                  [text.zone, selectedGlass.zone],
                  [text.direction, selectedGlass.direction],
                  [text.lane, selectedGlass.lane || "—"],
                  [text.glassType, selectedGlass.glassType || "—"],
                  [text.thickness, selectedGlass.thickness || "—"],
                  [text.assetStatus, selectedGlass.status],
                  [
                    text.currentStatus,
                    getStatusInfo(
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
                    formatDate(
                      selectedGlass.lastInspectionAt,
                      lang,
                    ),
                  ],
                  [text.notes, selectedGlass.notes || "—"],
                ].map(([label, value]) => (
                  <div
                    className="detail-box"
                    key={label}
                  >
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
