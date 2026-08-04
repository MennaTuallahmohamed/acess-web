import React, { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
  localStorage.getItem("dashboard_api_base_url") ||
  localStorage.getItem("api_base_url") ||
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "https://acess-backend-production-8856.up.railway.app";

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("auth_token") ||
  "";

const getCurrentLang = () =>
  localStorage.getItem("lang") || document.documentElement.lang || "ar";

const TEXT = {
  ar: {
    title: "SmartIT Report Timeline",
    subtitle: "تقرير مرتب بنظام واضح من الحصر حتى الحالة الحالية.",
    adminMode: "وضع الأدمن",
    viewerMode: "وضع المشاهدة",
    refresh: "تحديث بيانات الباك اند",
    loading: "جارٍ التحميل...",
    search: "بحث باسم الجهاز أو الموقع أو الحالة...",
    reset: "Reset",
    export: "Export CSV",
    allStatuses: "كل الحالات",
    allRounds: "كل الجولات",
    allSources: "كل المصادر",
    allTypes: "كل الأنواع",
    fixed: "Fixed / تم",
    pending: "Pending / قيد المتابعة",
    issue: "Offline / مشكلة",
    backend: "Backend",
    excel: "Excel",
    static: "Static",
    inventory: "Inventory",
    inspectionRound1: "Inspection Round 1",
    inspectionRound2: "Inspection Round 2",
    operationRound1: "Operation Round 1",
    operationRound2: "Operation Round 2",
    qrCode: "QR Code",
    whereNow: "Where We Are Now",
    inventorySub: "حصر الأجهزة والبوابات والمواقع والفحوصات من الباك اند.",
    inspection1Sub: "التفتيش الأول من Excel ويحتوي على كل العناصر والحالات.",
    inspection2Sub: "التفتيش الثاني من Excel بنفس البيانات للتأكيد والمراجعة.",
    operation1Sub: "تشغيل Round 1 بعد المرور على العناصر وتحديد الحالات.",
    operation2Sub: "تشغيل Round 2 بعد التفتيش الثاني وتجهيز الحالة النهائية.",
    qrSub: "ما تم تنفيذه بخصوص QR Code من 20 / 4 إلى 10 / 5.",
    whereNowSub: "كل بيانات الباك اند: أجهزة، بوابات، مواقع، فحوصات، مهام، والحالة الحالية.",
    period: "الفترة",
    source: "المصدر",
    total: "الإجمالي",
    id: "ID",
    name: "Name",
    location: "Location",
    type: "Type",
    oldStatus: "Old Status",
    newStatus: "New Status",
    status: "Status",
    date: "Date",
    notes: "Notes",
    action: "Action",
    devices: "الأجهزة",
    gates: "البوابات",
    locations: "المواقع",
    inspections: "الفحوصات",
    tasks: "المهام",
    technicians: "الفنيون",
    noData: "لا توجد بيانات مطابقة للفلاتر الحالية.",
    officialSummary: "ملخص Excel الرسمي",
    green: "Green",
    yellow: "Yellow",
    red: "Red",
    passive: "Passive",
    hardwareIssue: "Hardware Issue",
    count: "Count",
    round1: "Round 1",
    round2: "Round 2",
    devicesFromBackend: "الأجهزة من الباك اند",
    gatesFromBackend: "البوابات من الباك اند",
    locationsFromBackend: "المواقع من الباك اند",
    inspectionsFromBackend: "كل الفحوصات من الباك اند",
    tasksFromBackend: "المهام من الباك اند",
    currentSummary: "ملخص الحالة الحالية",
    reachedDetails: "تفاصيل ما وصلنا إليه",
    workingNow: "تعمل الآن",
    workingDevices: "الأجهزة الشغالة",
    workingGates: "البوابات الشغالة",
    needsFollow: "تحتاج متابعة",
    needsMaintenance: "تحتاج فحص / صيانة",
    clickTimeline: "اضغطي على أي خطوة لعرض تفاصيلها.",
    qrPeriod: "20 / 4 → 10 / 5",
    reportPeriod: "3 / 6 → 6 / 6",
    started: "بدأنا بإيه؟",
    done: "عملنا إيه؟",
    reached: "وصلنا لإيه؟",
    startedText: "بدأنا بحصر كل الأجهزة والبوابات والمواقع من الباك اند، ثم تجهيز بيانات التفتيش والتشغيل من Excel.",
    doneText: "تم تجهيز Inspection Round 1 و Inspection Round 2، ثم Operation Round 1 و Operation Round 2، وبعدها QR Code.",
    reachedText: "وصلنا لصورة واضحة تشمل عدد الأجهزة، الأجهزة الشغالة، المواقع، الفحوصات، والمهام من الباك اند.",
  },
  en: {
    title: "SmartIT Report Timeline",
    subtitle: "A structured timeline from inventory to the current status.",
    adminMode: "Admin Mode",
    viewerMode: "Viewer Mode",
    refresh: "Refresh Backend Data",
    loading: "Loading...",
    search: "Search by asset, location, or status...",
    reset: "Reset",
    export: "Export CSV",
    allStatuses: "All statuses",
    allRounds: "All rounds",
    allSources: "All sources",
    allTypes: "All types",
    fixed: "Fixed / Done",
    pending: "Pending",
    issue: "Offline / Issue",
    backend: "Backend",
    excel: "Excel",
    static: "Static",
    inventory: "Inventory",
    inspectionRound1: "Inspection Round 1",
    inspectionRound2: "Inspection Round 2",
    operationRound1: "Operation Round 1",
    operationRound2: "Operation Round 2",
    qrCode: "QR Code",
    whereNow: "Where We Are Now",
    inventorySub: "Backend inventory for devices, gates, locations, and inspections.",
    inspection1Sub: "First Excel inspection containing all assets and statuses.",
    inspection2Sub: "Second Excel inspection with the same data for confirmation and review.",
    operation1Sub: "Operation Round 1 after visiting assets and identifying statuses.",
    operation2Sub: "Operation Round 2 after the second inspection and final status preparation.",
    qrSub: "QR Code actions completed from 20 / 4 to 10 / 5.",
    whereNowSub: "All backend data: devices, gates, locations, inspections, tasks, and current status.",
    period: "Period",
    source: "Source",
    total: "Total",
    id: "ID",
    name: "Name",
    location: "Location",
    type: "Type",
    oldStatus: "Old Status",
    newStatus: "New Status",
    status: "Status",
    date: "Date",
    notes: "Notes",
    action: "Action",
    devices: "Devices",
    gates: "Gates",
    locations: "Locations",
    inspections: "Inspections",
    tasks: "Tasks",
    technicians: "Technicians",
    noData: "No data matches current filters.",
    officialSummary: "Official Excel Summary",
    green: "Green",
    yellow: "Yellow",
    red: "Red",
    passive: "Passive",
    hardwareIssue: "Hardware Issue",
    count: "Count",
    round1: "Round 1",
    round2: "Round 2",
    devicesFromBackend: "Backend Devices",
    gatesFromBackend: "Backend Gates",
    locationsFromBackend: "Backend Locations",
    inspectionsFromBackend: "All Backend Inspections",
    tasksFromBackend: "Backend Tasks",
    currentSummary: "Current Status Summary",
    reachedDetails: "Reached Details",
    workingNow: "Working Now",
    workingDevices: "Working Devices",
    workingGates: "Working Gates",
    needsFollow: "Needs Follow-up",
    needsMaintenance: "Needs Inspection / Maintenance",
    clickTimeline: "Click any timeline step to view details.",
    qrPeriod: "20 / 4 → 10 / 5",
    reportPeriod: "3 / 6 → 6 / 6",
    started: "Where did we start?",
    done: "What was done?",
    reached: "Where are we now?",
    startedText: "We started by inventorying all devices, gates, and locations from backend, then prepared Excel inspection and operation data.",
    doneText: "Inspection Round 1 and Round 2 were prepared, followed by Operation Round 1 and Operation Round 2, then QR Code.",
    reachedText: "We reached a clear view including devices count, working devices, locations, inspections, and tasks from backend.",
  },
};

const STYLE = `
* {
  box-sizing: border-box;
}

.report-root {
  min-height: 100vh;
  padding: 24px;
  color: #0f172a;
  background:
    radial-gradient(circle at top left, rgba(14,165,233,.12), transparent 32%),
    radial-gradient(circle at bottom right, rgba(15,118,110,.12), transparent 32%),
    linear-gradient(135deg, #f8fafc 0%, #edf7fb 100%);
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.report-root.rtl {
  direction: rtl;
}

.report-root.ltr {
  direction: ltr;
}

.report-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 18px;
}

.report-header h1 {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 950;
  color: #071833;
}

.report-header p {
  margin: 0;
  color: #526375;
  font-size: 14px;
  line-height: 1.8;
}

.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  border: 1px solid #dbeafe;
  background: rgba(255,255,255,.92);
  color: #075985;
  font-size: 12px;
  font-weight: 900;
  padding: 8px 12px;
  border-radius: 999px;
  box-shadow: 0 10px 22px rgba(15,23,42,.05);
  white-space: nowrap;
}

.filter-panel,
.timeline-panel,
.details-panel {
  background: rgba(255,255,255,.96);
  border: 1px solid #e2e8f0;
  border-radius: 26px;
  padding: 18px;
  box-shadow: 0 18px 44px rgba(15,23,42,.08);
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 1.5fr .8fr .8fr .8fr .8fr auto auto;
  gap: 10px;
  align-items: center;
}

.input,
.select {
  width: 100%;
  border: 1px solid #dbe4ee;
  background: #fff;
  color: #0f172a;
  border-radius: 14px;
  padding: 12px 13px;
  min-height: 44px;
  outline: none;
  font-weight: 750;
}

.input:focus,
.select:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 4px rgba(14,165,233,.1);
}

.btn {
  border: 0;
  min-height: 44px;
  border-radius: 14px;
  padding: 0 14px;
  background: linear-gradient(135deg, #0f766e, #0ea5e9);
  color: #fff;
  font-size: 13px;
  font-weight: 950;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(14,165,233,.20);
  white-space: nowrap;
}

.btn.secondary {
  background: #fff;
  color: #0f172a;
  border: 1px solid #dbe4ee;
  box-shadow: none;
}

.panel-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.panel-title h2 {
  margin: 0 0 7px;
  font-size: 22px;
  font-weight: 950;
  color: #0f172a;
}

.panel-title p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

.timeline-list {
  position: relative;
  display: grid;
  gap: 14px;
}

.timeline-list::before {
  content: "";
  position: absolute;
  top: 10px;
  bottom: 10px;
  width: 4px;
  border-radius: 999px;
  background: linear-gradient(180deg, #0ea5e9, #0f766e, #f59e0b, #ef4444);
  opacity: .27;
}

.report-root.rtl .timeline-list::before {
  right: 24px;
}

.report-root.ltr .timeline-list::before {
  left: 24px;
}

.timeline-step {
  width: 100%;
  border: 1px solid #e2e8f0;
  background: #fff;
  border-radius: 22px;
  padding: 14px 16px;
  cursor: pointer;
  display: grid;
  grid-template-columns: 50px 1fr auto;
  gap: 14px;
  align-items: center;
  transition: .22s ease;
  text-align: inherit;
  color: inherit;
  position: relative;
}

.report-root.rtl .timeline-step {
  padding-right: 72px;
}

.report-root.ltr .timeline-step {
  padding-left: 72px;
}

.timeline-step:hover {
  transform: translateY(-2px);
  border-color: #0ea5e9;
  box-shadow: 0 16px 32px rgba(14,165,233,.12);
}

.timeline-step.active {
  border-color: #0ea5e9;
  background:
    linear-gradient(135deg, rgba(14,165,233,.10), rgba(15,118,110,.06)),
    #fff;
  box-shadow: 0 18px 38px rgba(14,165,233,.16);
}

.timeline-dot {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #fff;
  border: 4px solid #0ea5e9;
  color: #0f172a;
  font-weight: 950;
  box-shadow: 0 10px 20px rgba(15,23,42,.1);
}

.report-root.rtl .timeline-dot {
  right: 5px;
}

.report-root.ltr .timeline-dot {
  left: 5px;
}

.timeline-icon {
  font-size: 24px;
}

.timeline-main h3 {
  margin: 0 0 6px;
  font-size: 17px;
  font-weight: 950;
  color: #0f172a;
}

.timeline-main p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
  font-size: 13px;
}

.timeline-meta {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.pill {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-size: 12px;
  font-weight: 850;
  padding: 6px 9px;
  border-radius: 999px;
  white-space: nowrap;
}

.pill.green {
  background: #dcfce7;
  border-color: #bbf7d0;
  color: #166534;
}

.pill.yellow {
  background: #fef3c7;
  border-color: #fde68a;
  color: #92400e;
}

.pill.red {
  background: #fee2e2;
  border-color: #fecaca;
  color: #991b1b;
}

.pill.blue {
  background: #e0f2fe;
  border-color: #bae6fd;
  color: #075985;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 16px;
}

.kpi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 15px;
  position: relative;
  overflow: hidden;
}

.kpi-card::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background: #0ea5e9;
}

.kpi-card.green::before {
  background: #16a34a;
}

.kpi-card.yellow::before {
  background: #d97706;
}

.kpi-card.red::before {
  background: #dc2626;
}

.kpi-card h3 {
  margin: 0 0 8px;
  color: #475569;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .06em;
}

.kpi-card strong {
  display: block;
  font-size: 28px;
  font-weight: 950;
  color: #0f172a;
}

.kpi-card p {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.summary-box {
  margin-top: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 14px;
  box-shadow: 0 12px 26px rgba(15,23,42,.05);
}

.summary-box h3 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 950;
  color: #0f172a;
}

.summary-box-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-mini {
  border-radius: 16px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.summary-mini.green {
  background: #dcfce7;
  border-color: #bbf7d0;
}

.summary-mini.yellow {
  background: #fef3c7;
  border-color: #fde68a;
}

.summary-mini.red {
  background: #fee2e2;
  border-color: #fecaca;
}

.summary-mini.blue {
  background: #e0f2fe;
  border-color: #bae6fd;
}

.summary-mini span {
  display: block;
  color: #475569;
  font-size: 12px;
  font-weight: 850;
  margin-bottom: 6px;
}

.summary-mini strong {
  display: block;
  font-size: 22px;
  font-weight: 950;
  color: #0f172a;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
}

.report-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

.report-table th {
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
  padding: 13px 12px;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.report-table td {
  padding: 13px 12px;
  border-bottom: 1px solid #edf2f7;
  font-size: 13px;
  color: #1e293b;
  vertical-align: middle;
}

.report-root.rtl .report-table th,
.report-root.rtl .report-table td {
  text-align: right;
}

.report-root.ltr .report-table th,
.report-root.ltr .report-table td {
  text-align: left;
}

.report-table tr:last-child td {
  border-bottom: 0;
}

.report-table tr:hover td {
  background: #f8fbff;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 950;
  white-space: nowrap;
}

.status-chip.fixed {
  background: #dcfce7;
  color: #166534;
}

.status-chip.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-chip.issue {
  background: #fee2e2;
  color: #991b1b;
}

.status-chip.neutral {
  background: #e0f2fe;
  color: #075985;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 13px;
  margin-bottom: 16px;
}

.info-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 15px;
}

.info-card h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 950;
}

.info-card p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.8;
}

.backend-section {
  margin-top: 18px;
}

.backend-section h3 {
  margin: 0 0 12px;
  font-size: 17px;
  font-weight: 950;
  color: #0f172a;
}

.empty-state {
  padding: 30px;
  text-align: center;
  color: #64748b;
  font-weight: 850;
}

@media (max-width: 1180px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .kpi-grid,
  .summary-box-grid,
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .timeline-step {
    grid-template-columns: 42px 1fr;
  }

  .timeline-meta {
    grid-column: 2 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .report-root {
    padding: 16px;
  }

  .filter-grid,
  .kpi-grid,
  .summary-box-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .report-header h1 {
    font-size: 24px;
  }

  .timeline-step {
    grid-template-columns: 1fr;
  }

  .timeline-meta {
    grid-column: auto;
  }

  .report-root.rtl .timeline-step,
  .report-root.ltr .timeline-step {
    padding-inline-start: 68px;
  }
}
`;

const EXCEL_DATA = `1	C17A/L1/Z5/ER/2-IN	وزارة النقل	Offline	Fixed
2	C17A/L1/Z5/ER/6-IN	وزارة النقل	Offline	Fixed
3	C17A/L2/Z10/EP/2-OUT	الهيئة العامة للاعتماد و الرقابة الصحية	Offline	Fixed
4	C19B/L1M/Z11/ER/6-OUT	سيناء/أراضي الدولة	Offline	Fixed
5	C5A/L1/Z01/ER/1-IN	الهيئه القوميه للتامين الاجتماعي	Offline	Fixed
6	C5A/LC/Z04/ER/1-IN	وزارة الإسكان	Offline	Fixed
7	C9B/L1/Z01/EP/4-IN	وزارة السياحة و الاثار	Offline	Pending
8	C9B/L1/Z01/EP/5-OUT	وزارة السياحة و الاثار	Offline	Pending
9	C9B/L1/Z01/ER/7-OUT	وزارة السياحة و الاثار	Offline	Fixed
10	C9B/L2/Z10/EP/1-IN	وزارة الثقافة	Offline	Fixed
11	Cabinet/Z04/2-IN	الأمانة العامة لرئاسة مجلس الوزراء	Offline	Fixed
12	Cabinet/Z05/4-OUT	الأمانة العامة لرئاسة مجلس الوزراء	Offline	Offline
13	PRLM-1Main-ER-1-IN	البرلمان	Offline	Fixed
14	PRLM-1Main-ER-1-OUT	البرلمان	Offline	Fixed
15	PRLM-1Main-ER-2-IN	البرلمان	Offline	Fixed
16	PRLM-1Main-ER-2-OUT	البرلمان	Offline	Fixed
17	PRLM-1Main-ER-3-IN	البرلمان	Offline	Fixed
18	PRLM-1Main-ER-3-OUT	البرلمان	Offline	Pending
19	C03A/L1/Z01/ER/1-OUT	وزاره التعليم العالي	Offline	Offline
20	C07A/L2/Z11/ER/2-IN	وزاره الهجره	Offline	Offline
21	C07A/L2/Z11/ER/7-IN	وزاره الهجره	Offline	Offline
22	C07A/L2M/Z7/EP/7-IN	وزاره التموين	Offline	Offline
23	C07A/L2M/Z8/EP/7-IN	وزاره التموين	Offline	Offline
24	C07A/LC/Z4/ER/6-OUT	وزارة التجارة والصناعة	Offline	Fixed
25	C13/L2M/Z10/EP/4-OUT	مصلحه الضرائب العقارية	Offline	Offline
26	C13A/L1/Z01/EP/1-IN	وزاره البيئه	Offline	Offline
27	C13A/L1/Z02/EP/6-IN	وزاره التنميه المحليه	Offline	Fixed
28	C15A/L1/Z01/ER/3-IN	وزاره البترول	Offline	Offline
29	C15A/L2M/Z7/ER/8-OUT	الشركة المصرية لنقل الكهرباء	Offline	Offline
30	C17A/L1/Z04/EP/1-OUT	وزاره النقل	Offline	Offline
31	C17A/L1/Z04/EP/5-IN	وزاره النقل	Offline	Offline
32	C17A/L1/Z04/EP/5-OUT	وزاره النقل	Offline	Fixed
33	C17A/L1/Z5/ER/2-IN	وزاره النقل	Offline	Fixed
34	C17A/L1/Z5/ER/6-IN	وزاره النقل	Offline	Fixed
35	C19B/L1M/Z11/ER/6-OUT	سيناء/أراضي الدولة	Offline	Offline
36	C5A/LC/Z04/ER/1-IN	وزاره الاسكان	Offline	Offline
37	C9B/L1/Z01/EP/4-IN	وزاره السياحه والاثار	Offline	Fixed
38	C9B/L1/Z01/EP/5-OUT	وزاره السياحه والاثار	Offline	Fixed
39	C9B/L1/Z01/ER/1-OUT	وزاره السياحه والاثار	Offline	Offline
40	C9B/L1/Z01/ER/7-OUT	وزاره السياحه والاثار	Offline	Fixed
41	C9B/L2/Z11/ER/7-IN	وزاره الثقافه	Offline	Fixed
42	C9B/L2/Z11/ER/6-IN	وزاره الثقافه	Offline	Fixed
43	C9B/L2/Z11/ER/1-IN	وزاره الثقافه	Offline	Offline`;

const OFFICIAL_SUMMARY = {
  fixed: 24,
  passive: 4,
  hardwareIssue: 15,
  total: 43,
};

function clean(value) {
  return String(value ?? "").trim();
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.devices)) return payload.devices;
  if (Array.isArray(payload?.gates)) return payload.gates;
  if (Array.isArray(payload?.locations)) return payload.locations;
  if (Array.isArray(payload?.inspections)) return payload.inspections;
  if (Array.isArray(payload?.tasks)) return payload.tasks;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.technicians)) return payload.technicians;
  return [];
}

async function apiGet(path) {
  const token = getToken();

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed: ${path}`);
  }

  return response.json();
}

async function apiGetFirst(paths) {
  for (const path of paths) {
    try {
      const data = await apiGet(path);
      return extractArray(data);
    } catch {
      // try next endpoint silently
    }
  }

  return [];
}

function getAssetType(name) {
  const value = clean(name).toUpperCase();

  if (value.includes("/EP/")) return "Gate";
  if (value.includes("/ER/")) return "Device";
  if (value.includes("CABINET")) return "Cabinet";
  if (value.includes("PRLM")) return "Parliament";

  return "Asset";
}

function getStatusGroup(status) {
  const value = clean(status).toLowerCase();

  if (
    value.includes("fixed") ||
    value.includes("ok") ||
    value.includes("active") ||
    value.includes("done") ||
    value.includes("completed") ||
    value.includes("تم")
  ) {
    return "fixed";
  }

  if (
    value.includes("pending") ||
    value.includes("passive") ||
    value.includes("progress") ||
    value.includes("maintenance") ||
    value.includes("قيد")
  ) {
    return "pending";
  }

  if (
    value.includes("offline") ||
    value.includes("issue") ||
    value.includes("hardware") ||
    value.includes("not_ok") ||
    value.includes("out_of_service") ||
    value.includes("inactive") ||
    value.includes("lost") ||
    value.includes("مشكلة")
  ) {
    return "issue";
  }

  return "neutral";
}

function getStatusText(status, lang) {
  const group = getStatusGroup(status);

  if (lang === "ar") {
    if (group === "fixed") return "تم / Fixed";
    if (group === "pending") return "قيد المتابعة";
    if (group === "issue") return "Offline / مشكلة";
    return status || "غير محدد";
  }

  if (group === "fixed") return "Fixed";
  if (group === "pending") return "Pending";
  if (group === "issue") return "Offline / Issue";

  return status || "Unknown";
}

function parseExcelRows(round) {
  return EXCEL_DATA.split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [id, name, location, oldStatus, newStatus] = line.split("\t");

      return {
        id: Number(id),
        name: clean(name),
        location: clean(location),
        oldStatus: clean(oldStatus),
        newStatus: clean(newStatus),
        status: clean(newStatus),
        type: getAssetType(name).toLowerCase(),
        typeLabel: getAssetType(name),
        round,
        source: "Excel",
        sourceKey: "excel",
        period: "3 / 6 → 6 / 6",
      };
    });
}

function rowMatches(row, filters) {
  const { search, statusFilter, roundFilter, sourceFilter, typeFilter } = filters;

  const statusValue = row.newStatus || row.status || row.currentStatus || "";
  const typeValue = clean(row.type || row.assetType || "").toLowerCase();
  const sourceValue = clean(row.sourceKey || row.source || "").toLowerCase();
  const roundValue = clean(row.round || "").toLowerCase();

  const searchText = Object.values(row).join(" ").toLowerCase();
  const keywordOk = !search || searchText.includes(search.toLowerCase());
  const statusOk = statusFilter === "all" || getStatusGroup(statusValue) === statusFilter;
  const roundOk = roundFilter === "all" || roundValue === roundFilter;
  const sourceOk = sourceFilter === "all" || sourceValue === sourceFilter;
  const typeOk = typeFilter === "all" || typeValue === typeFilter;

  return keywordOk && statusOk && roundOk && sourceOk && typeOk;
}

function exportCsv(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const body = rows.map((row) => headers.map((header) => escape(row[header])).join(","));
  const csv = "\uFEFF" + [headers.join(","), ...body].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function StatusChip({ status, lang }) {
  return (
    <span className={`status-chip ${getStatusGroup(status)}`}>
      {getStatusText(status, lang)}
    </span>
  );
}

function Kpi({ title, value, desc, tone = "" }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <h3>{title}</h3>
      <strong>{value}</strong>
      <p>{desc}</p>
    </div>
  );
}

function OfficialSummaryBox({ t }) {
  return (
    <div className="summary-box">
      <h3>{t.officialSummary}</h3>

      <div className="summary-box-grid">
        <div className="summary-mini green">
          <span>{t.green} / Fixed</span>
          <strong>{OFFICIAL_SUMMARY.fixed}</strong>
        </div>

        <div className="summary-mini yellow">
          <span>{t.yellow} / {t.passive}</span>
          <strong>{OFFICIAL_SUMMARY.passive}</strong>
        </div>

        <div className="summary-mini red">
          <span>{t.red} / {t.hardwareIssue}</span>
          <strong>{OFFICIAL_SUMMARY.hardwareIssue}</strong>
        </div>

        <div className="summary-mini blue">
          <span>{t.total}</span>
          <strong>{OFFICIAL_SUMMARY.total}</strong>
        </div>
      </div>
    </div>
  );
}

export function ViewerSummaryPage({
  summary = {},
  tasks = [],
  devices = [],
  gates = [],
  locations = [],
  inspections = [],
  technicians = [],
}) {
  const [lang, setLang] = useState(getCurrentLang());
  const t = TEXT[lang] || TEXT.ar;
  const dir = lang === "ar" ? "rtl" : "ltr";

  const [activeStep, setActiveStep] = useState("inventory");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [backend, setBackend] = useState({
    devices: [],
    gates: [],
    locations: [],
    inspections: [],
    tasks: [],
    technicians: [],
  });

  const [loading, setLoading] = useState(false);

  // هذه الصفحة مخصصة للـ Viewer فقط.
  // نفس تصميم وبيانات صفحة الأدمن، لكن بدون صلاحيات إدارية.
  const isViewer = true;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLang(getCurrentLang());
    }, 700);

    return () => window.clearInterval(interval);
  }, []);

  const loadBackend = useCallback(async () => {
    setLoading(true);

    try {
      const [devicesData, gatesData, locationsData, inspectionsData, tasksData, usersData] =
        await Promise.all([
          apiGetFirst(["/devices", "/device", "/admin/devices"]),
          apiGetFirst(["/gates", "/gate", "/admin/gates"]),
          apiGetFirst(["/locations", "/location", "/admin/locations"]),
          apiGetFirst(["/inspections", "/inspection", "/admin/inspections"]),
          apiGetFirst([
            "/inspection-tasks",
            "/inspectionTasks",
            "/tasks",
            "/task",
            "/admin/tasks",
            "/inspection/tasks",
          ]),
          apiGetFirst(["/users", "/technicians", "/admin/users", "/admin/technicians"]),
        ]);

      setBackend({
        devices: devicesData,
        gates: gatesData,
        locations: locationsData,
        inspections: inspectionsData,
        tasks: tasksData,
        technicians: usersData,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackend();
  }, [loadBackend]);

  const allDevices = backend.devices.length ? backend.devices : devices;
  const allGates = backend.gates.length ? backend.gates : gates;
  const allLocations = backend.locations.length ? backend.locations : locations;
  const allInspections = backend.inspections.length ? backend.inspections : inspections;
  const allTasks = backend.tasks.length ? backend.tasks : tasks;
  const allTechnicians = backend.technicians.length ? backend.technicians : technicians;

  const inspectionRound1Rows = useMemo(() => parseExcelRows("round1"), []);
  const inspectionRound2Rows = useMemo(() => parseExcelRows("round2"), []);
  const operationRound1Rows = useMemo(() => parseExcelRows("round1"), []);
  const operationRound2Rows = useMemo(() => parseExcelRows("round2"), []);

  const backendDeviceRows = useMemo(
    () =>
      allDevices.map((item, index) => ({
        id: item.id ?? index + 1,
        name:
          item.deviceName ||
          item.deviceCode ||
          item.name ||
          item.barcode ||
          `Device ${index + 1}`,
        location:
          item.location?.building ||
          item.location?.cluster ||
          item.locationText ||
          item.location ||
          item.gateBuilding ||
          "-",
        status: item.currentStatus || item.lifecycleStatus || item.status || "-",
        type: "device",
        typeLabel: "Device",
        source: "Backend",
        sourceKey: "backend",
        date: item.lastInspectionAt || item.updatedAt || item.createdAt || "-",
        notes: item.notes || item.ipAddress || item.serialNumber || "-",
      })),
    [allDevices]
  );

  const backendGateRows = useMemo(
    () =>
      allGates.map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.gateNo || item.secretCode || item.excelId || `Gate ${index + 1}`,
        location:
          item.building ||
          item.cluster ||
          item.location?.building ||
          item.locationText ||
          "-",
        status: item.currentStatus || item.status || "-",
        type: "gate",
        typeLabel: "Gate",
        source: "Backend",
        sourceKey: "backend",
        date: item.lastInspectionAt || item.updatedAt || item.createdAt || "-",
        notes: item.notes || item.zone || item.direction || "-",
      })),
    [allGates]
  );

  const backendLocationRows = useMemo(
    () =>
      allLocations.map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.excelId || item.building || item.cluster || `Location ${index + 1}`,
        location:
          [item.cluster, item.building, item.zone, item.direction, item.lane]
            .filter(Boolean)
            .join(" / ") || "-",
        status: item.type || "-",
        type: "location",
        typeLabel: "Location",
        source: "Backend",
        sourceKey: "backend",
        date: item.updatedAt || item.createdAt || "-",
        notes: item.notes || "-",
      })),
    [allLocations]
  );

  const backendInspectionRows = useMemo(
    () =>
      allInspections.map((item, index) => ({
        id: item.id ?? index + 1,
        name:
          item.device?.deviceName ||
          item.device?.deviceCode ||
          item.gate?.gateNo ||
          item.gate?.secretCode ||
          item.deviceName ||
          item.gateName ||
          `Inspection ${index + 1}`,
        location:
          item.locationText ||
          item.device?.location?.building ||
          item.gate?.building ||
          item.location?.building ||
          "-",
        status: item.inspectionStatus || item.status || "OK",
        type: item.gateId ? "gate" : "device",
        typeLabel: item.gateId ? "Gate Inspection" : "Device Inspection",
        source: "Backend",
        sourceKey: "backend",
        date: item.inspectedAt || item.createdAt || "-",
        notes: item.notes || item.issueReason || "-",
      })),
    [allInspections]
  );

  const backendTaskRows = useMemo(
    () =>
      allTasks.map((item, index) => ({
        id: item.id ?? index + 1,
        name: item.title || item.name || `Task ${index + 1}`,
        location:
          item.device?.location?.building ||
          item.gate?.building ||
          item.locationText ||
          "-",
        status: item.status || "-",
        type: "task",
        typeLabel: item.assetType || item.taskKind || "Task",
        source: "Backend",
        sourceKey: "backend",
        date: item.scheduledDate || item.createdAt || "-",
        notes: item.notes || item.adminNote || "-",
      })),
    [allTasks]
  );

  const inventoryCounts = useMemo(
    () => ({
      devices: safeNumber(summary.totalDevices ?? summary.devicesCount ?? allDevices.length),
      gates: safeNumber(summary.totalGates ?? summary.gatesCount ?? allGates.length),
      locations: safeNumber(summary.totalLocations ?? summary.locationsCount ?? allLocations.length),
      inspections: safeNumber(summary.totalInspections ?? summary.inspectionsCount ?? allInspections.length),
      tasks: safeNumber(summary.totalTasks ?? summary.tasksCount ?? allTasks.length),
      technicians: safeNumber(summary.totalTechnicians ?? summary.techniciansCount ?? allTechnicians.length),
    }),
    [summary, allDevices, allGates, allLocations, allInspections, allTasks, allTechnicians]
  );

  const workingDevicesCount = useMemo(
    () => backendDeviceRows.filter((row) => getStatusGroup(row.status) === "fixed").length,
    [backendDeviceRows]
  );

  const workingGatesCount = useMemo(
    () => backendGateRows.filter((row) => getStatusGroup(row.status) === "fixed").length,
    [backendGateRows]
  );

  const currentCounts = useMemo(
    () => ({
      total: OFFICIAL_SUMMARY.total,
      fixed: OFFICIAL_SUMMARY.fixed,
      pending: OFFICIAL_SUMMARY.passive,
      issues: OFFICIAL_SUMMARY.hardwareIssue,
    }),
    []
  );

  const qrRows = useMemo(
    () => [
      {
        id: 1,
        action: lang === "ar" ? "طباعة QR Code" : "QR Code Printing",
        period: "20 / 4 → 10 / 5",
        status: "Fixed",
        source: "Static",
        sourceKey: "static",
        type: "qr",
        typeLabel: "QR",
        notes:
          lang === "ar"
            ? "تم تجهيز وطباعة QR Code للأجهزة والبوابات."
            : "QR Codes were prepared and printed for devices and gates.",
      },
      {
        id: 2,
        action: lang === "ar" ? "تأكيد حالة كل جهاز" : "Verify Each Device Status",
        period: "20 / 4 → 10 / 5",
        status: "Fixed",
        source: "Static",
        sourceKey: "static",
        type: "qr",
        typeLabel: "QR",
        notes:
          lang === "ar"
            ? "تم التأكد من حالة كل جهاز وربطه بالموقع الصحيح."
            : "Each device status was verified and linked to the correct location.",
      },
      {
        id: 3,
        action:
          lang === "ar"
            ? "تجهيز QR للفحص والتشغيل"
            : "Prepare QR for Inspection and Operation",
        period: "20 / 4 → 10 / 5",
        status: "Fixed",
        source: "Static",
        sourceKey: "static",
        type: "qr",
        typeLabel: "QR",
        notes:
          lang === "ar"
            ? "تم التأكد من إمكانية استخدام QR Code في الفحص والتشغيل."
            : "QR Code readiness for inspection and operation was confirmed.",
      },
    ],
    [lang]
  );

  const filters = useMemo(
    () => ({
      search,
      statusFilter,
      roundFilter,
      sourceFilter,
      typeFilter,
    }),
    [search, statusFilter, roundFilter, sourceFilter, typeFilter]
  );

  const filteredRows = useCallback(
    (rows) => rows.filter((row) => rowMatches(row, filters)),
    [filters]
  );

  const timeline = useMemo(
    () => [
      {
        key: "inventory",
        number: "01",
        icon: "📦",
        title: t.inventory,
        sub: t.inventorySub,
        period: t.reportPeriod,
        source: t.backend,
        count: inventoryCounts.devices + inventoryCounts.gates,
        tone: "blue",
      },
      {
        key: "inspection1",
        number: "02",
        icon: "🔍",
        title: t.inspectionRound1,
        sub: t.inspection1Sub,
        period: t.reportPeriod,
        source: t.excel,
        count: OFFICIAL_SUMMARY.total,
        tone: "green",
      },
      {
        key: "inspection2",
        number: "03",
        icon: "🔎",
        title: t.inspectionRound2,
        sub: t.inspection2Sub,
        period: t.reportPeriod,
        source: t.excel,
        count: OFFICIAL_SUMMARY.total,
        tone: "green",
      },
      {
        key: "operation1",
        number: "04",
        icon: "⚙️",
        title: t.operationRound1,
        sub: t.operation1Sub,
        period: t.reportPeriod,
        source: t.excel,
        count: OFFICIAL_SUMMARY.total,
        tone: "yellow",
      },
      {
        key: "operation2",
        number: "05",
        icon: "🛠️",
        title: t.operationRound2,
        sub: t.operation2Sub,
        period: t.reportPeriod,
        source: t.excel,
        count: OFFICIAL_SUMMARY.total,
        tone: "yellow",
      },
      {
        key: "qr",
        number: "06",
        icon: "▦",
        title: t.qrCode,
        sub: t.qrSub,
        period: t.qrPeriod,
        source: t.static,
        count: qrRows.length,
        tone: "blue",
      },
      {
        key: "whereNow",
        number: "07",
        icon: "★",
        title: t.whereNow,
        sub: t.whereNowSub,
        period: lang === "ar" ? "الحالة الحالية" : "Current Status",
        source: t.backend,
        count:
          inventoryCounts.devices +
          inventoryCounts.gates +
          inventoryCounts.locations +
          inventoryCounts.inspections +
          inventoryCounts.tasks,
        tone: "red",
      },
    ],
    [t, inventoryCounts, qrRows.length, lang]
  );

  const activeTimeline = timeline.find((item) => item.key === activeStep) || timeline[0];

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRoundFilter("all");
    setSourceFilter("all");
    setTypeFilter("all");
  };

  const handleStepClick = (key) => {
    setActiveStep(key);
    resetFilters();
  };

  function renderExcelTable(rows) {
    const data = filteredRows(rows);

    return (
      <>
        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>{t.id}</th>
                <th>{t.name}</th>
                <th>{t.location}</th>
                <th>{t.type}</th>
                <th>{t.oldStatus}</th>
                <th>{t.newStatus}</th>
                <th>{t.source}</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row) => (
                  <tr key={`${row.round}-${row.id}-${row.name}`}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.location}</td>
                    <td>{row.typeLabel}</td>
                    <td>
                      <StatusChip status={row.oldStatus} lang={lang} />
                    </td>
                    <td>
                      <StatusChip status={row.newStatus} lang={lang} />
                    </td>
                    <td>{row.source}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">{t.noData}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <OfficialSummaryBox t={t} />
      </>
    );
  }

  function renderBackendTable(title, rows) {
    const data = filteredRows(rows);

    return (
      <div className="backend-section">
        <h3>{title}</h3>

        <div className="table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>{t.id}</th>
                <th>{t.name}</th>
                <th>{t.location}</th>
                <th>{t.type}</th>
                <th>{t.status}</th>
                <th>{t.date}</th>
                <th>{t.notes}</th>
              </tr>
            </thead>

            <tbody>
              {data.length ? (
                data.map((row, index) => (
                  <tr key={`${title}-${row.id}-${row.name}-${index}`}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>{row.location}</td>
                    <td>{row.typeLabel || row.type}</td>
                    <td>
                      <StatusChip status={row.status} lang={lang} />
                    </td>
                    <td>{clean(row.date).slice(0, 19) || "-"}</td>
                    <td>{row.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">{t.noData}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderInventory() {
    return (
      <>
        <div className="kpi-grid">
          <Kpi title={t.devices} value={inventoryCounts.devices} desc={t.backend} />
          <Kpi title={t.gates} value={inventoryCounts.gates} desc={t.backend} />
          <Kpi title={t.locations} value={inventoryCounts.locations} desc={t.backend} tone="green" />
          <Kpi title={t.inspections} value={inventoryCounts.inspections} desc={t.backend} tone="yellow" />
        </div>

        {renderBackendTable(t.devicesFromBackend, backendDeviceRows)}
        {renderBackendTable(t.gatesFromBackend, backendGateRows)}
        {renderBackendTable(t.locationsFromBackend, backendLocationRows)}
      </>
    );
  }

  function renderQr() {
    const data = filteredRows(qrRows);

    return (
      <div className="table-wrap">
        <table className="report-table">
          <thead>
            <tr>
              <th>{t.id}</th>
              <th>{t.action}</th>
              <th>{t.period}</th>
              <th>{t.status}</th>
              <th>{t.source}</th>
              <th>{t.notes}</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((row) => (
                <tr key={`qr-${row.id}`}>
                  <td>{row.id}</td>
                  <td>{row.action}</td>
                  <td>{row.period}</td>
                  <td>
                    <StatusChip status={row.status} lang={lang} />
                  </td>
                  <td>{row.source}</td>
                  <td>{row.notes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">{t.noData}</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  function renderWhereNow() {
    return (
      <>
        <div className="kpi-grid">
          <Kpi title={t.devices} value={inventoryCounts.devices} desc={t.devicesFromBackend} />
          <Kpi title={t.workingDevices} value={workingDevicesCount} desc={t.currentSummary} tone="green" />
          <Kpi title={t.gates} value={inventoryCounts.gates} desc={t.gatesFromBackend} />
          <Kpi title={t.workingGates} value={workingGatesCount} desc={t.currentSummary} tone="green" />
          <Kpi title={t.locations} value={inventoryCounts.locations} desc={t.locationsFromBackend} tone="yellow" />
          <Kpi title={t.inspections} value={inventoryCounts.inspections} desc={t.inspectionsFromBackend} tone="yellow" />
          <Kpi title={t.tasks} value={inventoryCounts.tasks} desc={t.tasksFromBackend} />
          <Kpi title={t.technicians} value={inventoryCounts.technicians} desc={t.backend} />
        </div>

        <div className="kpi-grid">
          <Kpi title={t.workingNow} value={currentCounts.fixed} desc={t.officialSummary} tone="green" />
          <Kpi title={t.needsFollow} value={currentCounts.pending} desc={t.officialSummary} tone="yellow" />
          <Kpi title={t.needsMaintenance} value={currentCounts.issues} desc={t.officialSummary} tone="red" />
          <Kpi title={t.total} value={currentCounts.total} desc={t.officialSummary} />
        </div>

        <div className="info-grid">
          <div className="info-card">
            <h3>{t.started}</h3>
            <p>{t.startedText}</p>
          </div>

          <div className="info-card">
            <h3>{t.done}</h3>
            <p>{t.doneText}</p>
          </div>

          <div className="info-card">
            <h3>{t.reached}</h3>
            <p>{t.reachedText}</p>
          </div>
        </div>

        {renderBackendTable(t.inspectionsFromBackend, backendInspectionRows)}
        {renderBackendTable(t.devicesFromBackend, backendDeviceRows)}
        {renderBackendTable(t.gatesFromBackend, backendGateRows)}
        {renderBackendTable(t.locationsFromBackend, backendLocationRows)}
        {renderBackendTable(t.tasksFromBackend, backendTaskRows)}
      </>
    );
  }

  function renderActiveContent() {
    if (activeStep === "inventory") return renderInventory();
    if (activeStep === "inspection1") return renderExcelTable(inspectionRound1Rows);
    if (activeStep === "inspection2") return renderExcelTable(inspectionRound2Rows);
    if (activeStep === "operation1") return renderExcelTable(operationRound1Rows);
    if (activeStep === "operation2") return renderExcelTable(operationRound2Rows);
    if (activeStep === "qr") return renderQr();
    if (activeStep === "whereNow") return renderWhereNow();

    return renderInventory();
  }

  const exportRows =
    activeStep === "inventory"
      ? [
          ...filteredRows(backendDeviceRows),
          ...filteredRows(backendGateRows),
          ...filteredRows(backendLocationRows),
        ]
      : activeStep === "inspection1"
        ? filteredRows(inspectionRound1Rows)
        : activeStep === "inspection2"
          ? filteredRows(inspectionRound2Rows)
          : activeStep === "operation1"
            ? filteredRows(operationRound1Rows)
            : activeStep === "operation2"
              ? filteredRows(operationRound2Rows)
              : activeStep === "qr"
                ? filteredRows(qrRows)
                : [
                    ...filteredRows(backendInspectionRows),
                    ...filteredRows(backendDeviceRows),
                    ...filteredRows(backendGateRows),
                    ...filteredRows(backendLocationRows),
                    ...filteredRows(backendTaskRows),
                  ];

  return (
    <div className={`report-root ${dir}`}>
      <style>{STYLE}</style>

      <section className="report-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="badges">
          <span className="badge">{isViewer ? t.viewerMode : t.adminMode}</span>
          <span className="badge">{t.reportPeriod}</span>
          <span className="badge">{t.qrPeriod}</span>
        </div>
      </section>

      <section className="filter-panel">
        <div className="filter-grid">
          <input
            className="input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.search}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">{t.allStatuses}</option>
            <option value="fixed">{t.fixed}</option>
            <option value="pending">{t.pending}</option>
            <option value="issue">{t.issue}</option>
          </select>

          <select
            className="select"
            value={roundFilter}
            onChange={(event) => setRoundFilter(event.target.value)}
          >
            <option value="all">{t.allRounds}</option>
            <option value="round1">{t.round1}</option>
            <option value="round2">{t.round2}</option>
          </select>

          <select
            className="select"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value)}
          >
            <option value="all">{t.allSources}</option>
            <option value="backend">{t.backend}</option>
            <option value="excel">{t.excel}</option>
            <option value="static">{t.static}</option>
          </select>

          <select
            className="select"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">{t.allTypes}</option>
            <option value="device">Device</option>
            <option value="gate">Gate</option>
            <option value="cabinet">Cabinet</option>
            <option value="parliament">Parliament</option>
            <option value="location">Location</option>
            <option value="task">Task</option>
            <option value="qr">QR</option>
          </select>

          <button type="button" className="btn secondary" onClick={resetFilters}>
            {t.reset}
          </button>

          <button type="button" className="btn" onClick={loadBackend}>
            {loading ? t.loading : t.refresh}
          </button>
        </div>
      </section>

      <section className="timeline-panel">
        <div className="panel-title">
          <div>
            <h2>{lang === "ar" ? "الخط الزمني للتقرير" : "Report Timeline"}</h2>
            <p>{t.clickTimeline}</p>
          </div>

          {!isViewer && exportRows.length ? (
            <button
              type="button"
              className="btn"
              onClick={() => exportCsv(`${activeStep}.csv`, exportRows)}
            >
              {t.export}
            </button>
          ) : null}
        </div>

        <div className="timeline-list">
          {timeline.map((step) => (
            <button
              key={step.key}
              type="button"
              className={`timeline-step ${activeStep === step.key ? "active" : ""}`}
              onClick={() => handleStepClick(step.key)}
            >
              <span className="timeline-dot">{step.number}</span>
              <span className="timeline-icon">{step.icon}</span>

              <span className="timeline-main">
                <h3>{step.title}</h3>
                <p>{step.sub}</p>
              </span>

              <span className="timeline-meta">
                <span className={`pill ${step.tone}`}>{step.period}</span>
                <span className="pill">{step.source}</span>
                <span className="pill blue">
                  {t.total}: {step.count}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="details-panel">
        <div className="panel-title">
          <div>
            <h2>{activeTimeline.title}</h2>
            <p>{activeTimeline.sub}</p>
          </div>

          <div className="badges">
            <span className="badge">{activeTimeline.period}</span>
            <span className="badge">{activeTimeline.source}</span>
          </div>
        </div>

        {renderActiveContent()}
      </section>
    </div>
  );
}

export default ViewerSummaryPage;