import React, { useMemo, useState } from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { useLang } from "../context/LanguageContext";
import { ViewerHomePage } from "./monitoring/ViewerHomePage";
import { ViewerDevicesPage } from "./monitoring/ViewerDevicesPage";
import { ViewerInspectionsPage } from "./monitoring/ViewerInspectionsPage";
import { ViewerLocationsPage } from "./monitoring/ViewerLocationsPage";
import { ViewerAnalyticsPage } from "./monitoring/ViewerAnalyticsPage";

const SNAPSHOT_TABS = ["home", "devices", "inspections", "locations", "analytics"];

const COPY = {
  en: {
    heroEyebrow: "Operational Command",
    heroTitle: "Operations Home",
    heroSubtitle:
      "A structured command interface for device readiness, inspection activity, and strategic location coverage.",
    heroUser: "Signed in as",
    heroRole: "Monitoring access only",
    latestSync: "Latest inspection",
    totalDevices: "Total Devices",
    totalDevicesHint: "All registered units currently inside command visibility.",
    healthyDevices: "Healthy Devices",
    healthyDevicesHint: "Units currently reporting stable operational readiness.",
    attentionDevices: "Need Attention",
    attentionDevicesHint: "Devices that require review, maintenance, or follow-up.",
    totalInspections: "Inspections Logged",
    latestInspections: "Latest Inspections",
    latestInspectionsHint: "Most recent checks across visible devices.",
    attentionList: "Priority Queue",
    attentionListHint: "Devices that should be watched first.",
    noAttentionDevices: "All monitored devices are currently healthy.",
    search: "Search by code, name, serial, building, or zone",
    status: "Status",
    allClusters: "All clusters",
    allBuildings: "All buildings",
    allZones: "All zones",
    allDirections: "All directions",
    clearFilters: "Reset filters",
    devicesTable: "Devices Command Board",
    devicesTableHint: "Health, location, and latest inspection in one place.",
    inspectionsTable: "Inspection Log Board",
    inspectionsTableHint: "Recent inspection records filtered by your current operational view.",
    analyticsTitle: "Operational Analytics",
    analyticsHint: "Quick health ratios and location ranking for command review.",
    noDeviceRows: "No devices match the current filters.",
    noInspectionRows: "No inspections match the current filters.",
    noLocationsRows: "No locations are available for the current filters.",
    locationHint: "Tap to filter devices in this site.",
    device: "Device",
    location: "Location",
    lastInspection: "Last Inspection",
    inspectionsCount: "Inspections",
    notes: "Notes",
    noNotes: "No notes",
    unknown: "Unknown",
    devicesShort: "Devices",
    inspectionsShort: "Checks",
    lastCheckShort: "Last Check",
    performanceBoard: "Command Board",
    performanceHint: "A compact summary of operational readiness and inspection reach.",
    deviceMix: "Device Readiness Mix",
    topLocations: "Priority Locations",
    latestPulse: "Latest Activity Feed",
    healthyRate: "Healthy Rate",
    attentionRate: "Attention Rate",
    inspectionReach: "Inspection Reach",
    activeFilters: "Active Filters",
    noFilter: "No active filter",
    readinessOverview: "Readiness Overview",
    strategicLayout: "Strategic Layout",
    homeTab: "Home",
    devicesTab: "Devices",
    inspectionsTab: "Inspections",
    locationsTab: "Locations",
    analyticsTab: "Analytics",
    noInspectionYet: "No inspections logged yet.",
  },
  ar: {
    heroEyebrow: "قيادة تشغيلية",
    heroTitle: "الرئيسية",
    heroSubtitle:
      "واجهة قيادة منظمة لمتابعة جاهزية الأجهزة وحركة الفحوصات وتغطية المواقع بشكل واضح وقوي.",
    heroUser: "تسجيل الدخول باسم",
    heroRole: "وصول متابعة فقط",
    latestSync: "آخر فحص",
    totalDevices: "إجمالي الأجهزة",
    totalDevicesHint: "كل الأجهزة المتاحة حالياً داخل نطاق الرؤية التشغيلية.",
    healthyDevices: "أجهزة سليمة",
    healthyDevicesHint: "وحدات تعمل حالياً بجاهزية تشغيل مستقرة.",
    attentionDevices: "تحتاج متابعة",
    attentionDevicesHint: "أجهزة تحتاج مراجعة أو صيانة أو متابعة قريبة.",
    totalInspections: "إجمالي الفحوصات",
    latestInspections: "أحدث الفحوصات",
    latestInspectionsHint: "أحدث عمليات الفحص على الأجهزة الظاهرة للمستخدم.",
    attentionList: "قائمة الأولوية",
    attentionListHint: "الأجهزة التي تحتاج مراقبة أولاً.",
    noAttentionDevices: "كل الأجهزة الحالية بحالة جيدة.",
    search: "ابحث بالكود أو الاسم أو السيريال أو المبنى أو المنطقة",
    status: "الحالة",
    allClusters: "كل المجموعات",
    allBuildings: "كل المباني",
    allZones: "كل المناطق",
    allDirections: "كل الاتجاهات",
    clearFilters: "إعادة ضبط الفلاتر",
    devicesTable: "لوحة الأجهزة",
    devicesTableHint: "حالة الجهاز والموقع وآخر فحص في مكان واحد.",
    inspectionsTable: "سجل الفحوصات",
    inspectionsTableHint: "سجلات الفحص المعروضة حسب الفلاتر الحالية.",
    analyticsTitle: "التحليلات التشغيلية",
    analyticsHint: "ملخص سريع للنسب التشغيلية وترتيب المواقع للمراجعة.",
    noDeviceRows: "لا توجد أجهزة تطابق الفلاتر الحالية.",
    noInspectionRows: "لا توجد فحوصات تطابق الفلاتر الحالية.",
    noLocationsRows: "لا توجد مواقع متاحة بالفلاتر الحالية.",
    locationHint: "اضغط لتطبيق فلتر هذا الموقع.",
    device: "الجهاز",
    location: "الموقع",
    lastInspection: "آخر فحص",
    inspectionsCount: "عدد الفحوصات",
    notes: "ملاحظات",
    noNotes: "لا توجد ملاحظات",
    unknown: "غير معروف",
    devicesShort: "أجهزة",
    inspectionsShort: "فحوصات",
    lastCheckShort: "آخر تفتيش",
    performanceBoard: "لوحة القيادة",
    performanceHint: "ملخص عملي سريع لحالة الجاهزية ونطاق الفحص.",
    deviceMix: "توزيع جاهزية الأجهزة",
    topLocations: "المواقع ذات الأولوية",
    latestPulse: "آخر النشاطات",
    healthyRate: "نسبة السليم",
    attentionRate: "نسبة المتابعة",
    inspectionReach: "نطاق الفحص",
    activeFilters: "الفلاتر النشطة",
    noFilter: "لا توجد فلاتر مفعلة",
    readinessOverview: "نظرة الجاهزية",
    strategicLayout: "المخطط الاستراتيجي",
    homeTab: "الرئيسية",
    devicesTab: "الأجهزة",
    inspectionsTab: "الفحوصات",
    locationsTab: "المواقع",
    analyticsTab: "التحليلات",
    noInspectionYet: "لا توجد فحوصات مسجلة حتى الآن.",
  },
};

function parseDeviceLocation(device) {
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
      else if (lower.startsWith("building") || part.includes("وزارة")) output.building = part.replace(/building/i, "").trim();
      else if (lower.startsWith("zone")) output.zone = part.slice(4).trim();
      else if (lower.startsWith("lane")) output.lane = part.slice(4).trim();
      else if (["in", "out", "entry", "exit"].includes(lower)) output.direction = part.toUpperCase();
    }
  }

  return output;
}

function matchesDeviceStatus(device, status) {
  if (status === "ALL") return true;
  if (status === "ATTENTION") {
    return ["NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(device.currentStatus);
  }
  return device.currentStatus === status;
}

function matchesSharedFilters(device, filters) {
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

export function OperationsSnapshotPage({
  tab,
  setTab,
  currentUser,
  onLogout,
  onRefresh,
  loading,
  devices = [],
  locations = [],
  inspections = [],
}) {
  const { lang } = useLang();
  const copy = COPY[lang] || COPY.en;

  const tabLabels = useMemo(
    () => ({
      home: copy.homeTab,
      devices: copy.devicesTab,
      inspections: copy.inspectionsTab,
      locations: copy.locationsTab,
      analytics: copy.analyticsTab,
    }),
    [copy]
  );

  const [filters, setFilters] = useState({
    search: "",
    status: "ALL",
    cluster: "ALL",
    building: "ALL",
    zone: "ALL",
    direction: "ALL",
  });

  const deviceRows = useMemo(() => {
    const latestByDevice = new Map();
    inspections.forEach((inspection) => {
      if (!inspection.deviceId) return;
      const date = inspection.inspectedAt || inspection.createdAt;
      const current = latestByDevice.get(inspection.deviceId);
      if (!current || new Date(date) > new Date(current.inspectedAt || current.createdAt)) {
        latestByDevice.set(inspection.deviceId, inspection);
      }
    });

    return devices.map((device) => {
      const lastInspection = latestByDevice.get(device.id);
      const relatedInspections = inspections.filter((item) => item.deviceId === device.id);
      return {
        ...device,
        parsedLoc: parseDeviceLocation(device),
        inspectionsCount: relatedInspections.length,
        lastInspectionAt:
          lastInspection?.inspectedAt ||
          lastInspection?.createdAt ||
          device.lastInspectionAt ||
          "",
      };
    });
  }, [devices, inspections]);

  const filterOptions = useMemo(() => {
    const cluster = new Set();
    const building = new Set();
    const zone = new Set();
    const direction = new Set();

    deviceRows.forEach((device) => {
      if (device.parsedLoc.cluster) cluster.add(device.parsedLoc.cluster);
      if (device.parsedLoc.building) building.add(device.parsedLoc.building);
      if (device.parsedLoc.zone) zone.add(device.parsedLoc.zone);
      if (device.parsedLoc.direction) direction.add(device.parsedLoc.direction);
    });

    return {
      cluster: [...cluster].sort(),
      building: [...building].sort(),
      zone: [...zone].sort(),
      direction: [...direction].sort(),
    };
  }, [deviceRows]);

  const locationRows = useMemo(() => {
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
          ["NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(device.currentStatus)
        ).length,
        latestInspectionAt: latestInspection?.inspectedAt || latestInspection?.createdAt || "",
      };
    });
  }, [locations, deviceRows, inspections]);

  const kpis = useMemo(() => {
    const inspectedDevices = new Set(inspections.map((item) => item.deviceId).filter(Boolean));
    const latestInspection = [...inspections].sort(
      (a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt)
    )[0];

    return {
      totalDevices: deviceRows.length,
      healthyDevices: deviceRows.filter((device) => device.currentStatus === "OK").length,
      attentionDevices: deviceRows.filter((device) =>
        ["NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(device.currentStatus)
      ).length,
      totalInspections: inspections.length,
      inspectedDevices: inspectedDevices.size,
      totalLocations: locations.length,
      latestInspectionAt: latestInspection?.inspectedAt || latestInspection?.createdAt || "",
    };
  }, [deviceRows, inspections, locations]);

  const recentInspections = useMemo(
    () =>
      [...inspections]
        .sort((a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt))
        .slice(0, 6),
    [inspections]
  );

  const filteredDevices = useMemo(
    () => deviceRows.filter((device) => matchesSharedFilters(device, filters) && matchesDeviceStatus(device, filters.status)),
    [deviceRows, filters]
  );

  const filteredInspections = useMemo(
    () =>
      inspections
        .filter((inspection) => {
          const attachedDevice = deviceRows.find((device) => device.id === inspection.deviceId);
          if (!attachedDevice) return false;
          const statusMatch =
            filters.status === "ALL" ||
            (filters.status === "ATTENTION"
              ? matchesDeviceStatus(attachedDevice, "ATTENTION")
              : attachedDevice.currentStatus === filters.status || inspection.inspectionStatus === filters.status);
          return matchesSharedFilters(attachedDevice, filters) && statusMatch;
        })
        .sort((a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt)),
    [inspections, deviceRows, filters]
  );

  const filteredLocations = useMemo(
    () =>
      locationRows.filter((location) => {
        if (filters.cluster !== "ALL" && location.cluster !== filters.cluster) return false;
        if (filters.building !== "ALL" && location.building !== filters.building) return false;
        if (filters.zone !== "ALL" && location.zone !== filters.zone) return false;
        return true;
      }),
    [locationRows, filters]
  );

  const devicesNeedingAttention = useMemo(
    () => filteredDevices.filter((device) => matchesDeviceStatus(device, "ATTENTION")).slice(0, 4),
    [filteredDevices]
  );

  const activeFiltersText = useMemo(
    () =>
      [
        filters.search,
        filters.status !== "ALL" ? filters.status : "",
        filters.cluster !== "ALL" ? filters.cluster : "",
        filters.building !== "ALL" ? filters.building : "",
        filters.zone !== "ALL" ? filters.zone : "",
        filters.direction !== "ALL" ? filters.direction : "",
      ]
        .filter(Boolean)
        .join(" • "),
    [filters]
  );

  const statsCards = useMemo(
    () => [
      {
        key: "ALL",
        icon: "🖥️",
        label: copy.totalDevices,
        value: filteredDevices.length,
        sublabel: copy.totalDevicesHint,
        accentColor: "#2563eb",
      },
      {
        key: "OK",
        icon: "✅",
        label: copy.healthyDevices,
        value: filteredDevices.filter((device) => device.currentStatus === "OK").length,
        sublabel: copy.healthyDevicesHint,
        accentColor: "#10b981",
      },
      {
        key: "ATTENTION",
        icon: "🛠️",
        label: copy.attentionDevices,
        value: filteredDevices.filter((device) => matchesDeviceStatus(device, "ATTENTION")).length,
        sublabel: copy.attentionDevicesHint,
        accentColor: "#f59e0b",
      },
      {
        key: "OUT_OF_SERVICE",
        icon: "🚨",
        label: lang === "ar" ? "خارج الخدمة" : "Out of Service",
        value: filteredDevices.filter((device) => device.currentStatus === "OUT_OF_SERVICE").length,
        sublabel: lang === "ar" ? "وحدات متوقفة حالياً." : "Units currently unavailable.",
        accentColor: "#ef4444",
      },
    ],
    [filteredDevices, copy, lang]
  );

  const handleFilterChange = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "ALL",
      cluster: "ALL",
      building: "ALL",
      zone: "ALL",
      direction: "ALL",
    });
  };

  const handleKpiFilter = (nextTab, status) => {
    setTab(nextTab);
    setFilters((current) => ({ ...current, status }));
  };

  const handleLocationSelect = (location) => {
    setTab("devices");
    setFilters((current) => ({
      ...current,
      cluster: location.cluster || "ALL",
      building: location.building || "ALL",
      zone: location.zone || "ALL",
    }));
  };

  return (
    <DashboardLayout
      tab={tab}
      tabs={SNAPSHOT_TABS}
      tabLabels={tabLabels}
      onChangeTab={setTab}
      onRefresh={onRefresh}
      loading={loading}
      currentUser={currentUser}
      readOnly
      onLogout={onLogout}
    >
      {tab === "home" ? (
        <ViewerHomePage
          lang={lang}
          copy={copy}
          kpis={kpis}
          currentUser={currentUser}
          activeFiltersText={activeFiltersText}
          recentInspections={recentInspections}
          devicesNeedingAttention={devicesNeedingAttention}
          locationRows={filteredLocations}
          onKpiFilter={handleKpiFilter}
          activeDeviceStatus={filters.status}
        />
      ) : null}

      {tab === "devices" ? (
        <ViewerDevicesPage
          lang={lang}
          copy={copy}
          filteredDevices={filteredDevices}
          statsCards={statsCards}
          activeStatus={filters.status}
          onStatusClick={(status) => handleFilterChange("status", status)}
        />
      ) : null}

      {tab === "inspections" ? (
        <ViewerInspectionsPage lang={lang} copy={copy} filteredInspections={filteredInspections} />
      ) : null}

      {tab === "locations" ? (
        <ViewerLocationsPage
          lang={lang}
          copy={copy}
          locationRows={filteredLocations}
          onLocationSelect={handleLocationSelect}
        />
      ) : null}

      {tab === "analytics" ? (
        <ViewerAnalyticsPage
          lang={lang}
          copy={copy}
          kpis={kpis}
          devices={filteredDevices}
          inspections={filteredInspections}
          locationRows={filteredLocations}
        />
      ) : null}
    </DashboardLayout>
  );
}
