import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const translations = {
  en: {
    dir: "ltr",
    languageButton: "العربية",
    pageTitle: "Device Zone Samples",
    pageSubtitle:
      "One device is selected from each Zone inside every ministry.",
    importExcel: "Import Excel",
    importing: "Importing...",
    refresh: "Refresh",
    totalDevices: "Total Devices",
    selectedSamples: "Selected Samples",
    ministries: "Ministries",
    zones: "Zones",
    healthy: "Healthy",
    needsAction: "Needs Action",
    advancedFilter: "Advanced Device Filter",
    filterHint: "Search by ministry, zone, device, serial, IP, or text",
    search: "Search",
    searchPlaceholder: "Device, ministry, serial number, IP address...",
    status: "Status",
    cluster: "Cluster",
    ministry: "Ministry",
    zone: "Zone",
    allStatuses: "All statuses",
    allClusters: "All clusters",
    allMinistries: "All ministries",
    allZones: "All zones",
    reset: "Reset",
    records: "records",
    selectedDevices: "Selected devices",
    selectedDevicesHint:
      "Only one device is shown for every ministry and Zone number.",
    loading: "Loading...",
    noData: "No device samples found.",
    noDataHint: "Import an Excel file to create the samples.",
    deviceType: "Device Type",
    deviceCode: "Device Code",
    serialNumber: "Serial Number",
    ipAddress: "IP Address",
    macAddress: "MAC Address",
    lane: "Lane",
    direction: "Direction",
    firmware: "Firmware",
    originalZone: "Original Zone",
    details: "Details",
    close: "Close",
    previous: "Previous",
    next: "Next",
    page: "Page",
    of: "of",
    ok: "OK",
    needsMaintenance: "Needs Maintenance",
    underMaintenance: "Under Maintenance",
    outOfService: "Out of Service",
    unknown: "Unknown",
    importSuccess: "Excel file imported successfully.",
    importedRows: "Imported rows",
    created: "Created",
    updated: "Updated",
    rejected: "Rejected",
    failedLoad: "Failed to load device samples.",
    failedImport: "Failed to import the Excel file.",
    chooseExcel: "Choose an Excel file in xlsx or xls format.",
    location: "Location",
    device: "Device",
  },

  ar: {
    dir: "rtl",
    languageButton: "English",
    pageTitle: "عينات الأجهزة حسب الزونات",
    pageSubtitle:
      "يتم اختيار جهاز واحد فقط من كل Zone داخل كل وزارة.",
    importExcel: "استيراد Excel",
    importing: "جاري الاستيراد...",
    refresh: "تحديث",
    totalDevices: "إجمالي الأجهزة",
    selectedSamples: "العينات المختارة",
    ministries: "الوزارات",
    zones: "الزونات",
    healthy: "سليم",
    needsAction: "تحتاج إجراء",
    advancedFilter: "فلتر الأجهزة المتقدم",
    filterHint: "بحث بالوزارة أو الزون أو الجهاز أو السيريال أو IP",
    search: "بحث",
    searchPlaceholder: "الجهاز أو الوزارة أو السيريال أو IP...",
    status: "الحالة",
    cluster: "الكلاستر",
    ministry: "الوزارة",
    zone: "الزون",
    allStatuses: "كل الحالات",
    allClusters: "كل الكلاسترات",
    allMinistries: "كل الوزارات",
    allZones: "كل الزونات",
    reset: "إعادة ضبط",
    records: "سجل",
    selectedDevices: "الأجهزة المختارة",
    selectedDevicesHint:
      "يظهر جهاز واحد فقط لكل وزارة ورقم Zone.",
    loading: "جاري التحميل...",
    noData: "لا توجد عينات أجهزة.",
    noDataHint: "ارفعي ملف Excel لإنشاء العينات.",
    deviceType: "نوع الجهاز",
    deviceCode: "كود الجهاز",
    serialNumber: "السيريال",
    ipAddress: "IP Address",
    macAddress: "MAC Address",
    lane: "Lane",
    direction: "الاتجاه",
    firmware: "Firmware",
    originalZone: "الزون الأصلي",
    details: "التفاصيل",
    close: "إغلاق",
    previous: "السابق",
    next: "التالي",
    page: "صفحة",
    of: "من",
    ok: "سليم",
    needsMaintenance: "يحتاج صيانة",
    underMaintenance: "تحت الصيانة",
    outOfService: "خارج الخدمة",
    unknown: "غير محدد",
    importSuccess: "تم استيراد ملف Excel بنجاح.",
    importedRows: "الصفوف المستوردة",
    created: "تم إنشاؤه",
    updated: "تم تحديثه",
    rejected: "مرفوض",
    failedLoad: "تعذر تحميل عينات الأجهزة.",
    failedImport: "تعذر استيراد ملف Excel.",
    chooseExcel: "اختاري ملف Excel بصيغة xlsx أو xls.",
    location: "الموقع",
    device: "الجهاز",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLang = window.localStorage.getItem("lang");
    return savedLang === "ar" ? "ar" : "en";
  });

  useEffect(() => {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = translations[lang].dir;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      t: translations[lang],
      setLang,
      toggleLang: () => {
        setLang((current) =>
          current === "en" ? "ar" : "en",
        );
      },
    }),
    [lang],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLang must be used inside LanguageProvider",
    );
  }

  return context;
}

export { translations };