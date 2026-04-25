import React, { useState, useMemo, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────
   HELPERS & PARSERS
───────────────────────────────────────────────────────────────── */
const parseDeviceLocation = (dev) => {
  let loc = dev?.location || {};
  let out = {
    cluster: loc.cluster || "",
    building: loc.building || "",
    zone: loc.zone || "",
    lane: loc.lane || "",
    direction: loc.direction || "",
  };

  if (!out.cluster && (dev?.deviceName || dev?.deviceCode)) {
    const text = `${dev.deviceName || ""} - ${dev.deviceCode || ""}`;
    const parts = text.split("-").map((p) => p.trim());
    for (const p of parts) {
      const low = p.toLowerCase();
      if (low.startsWith("cluster")) out.cluster = p.substring(7).trim();
      else if (low.startsWith("building") || p.includes("وزارة")) out.building = p.replace("Building", "").trim();
      else if (low.startsWith("zone")) out.zone = p.substring(4).trim();
      else if (low.startsWith("lane")) out.lane = p.substring(4).trim();
      else if (["in", "out", "entry", "exit"].includes(low)) out.direction = p.toUpperCase();
    }
  }

  return out;
};

const STATUS_META = {
  OK: { label: "Operating OK", bg: "#ecfdf5", color: "#10b981", icon: "✓" },
  NEEDS_MAINTENANCE: { label: "Needs Maintenance", bg: "#fffbeb", color: "#f59e0b", icon: "!" },
  OUT_OF_SERVICE: { label: "Offline / Broken", bg: "#fef2f2", color: "#ef4444", icon: "✕" },
  UNDER_MAINTENANCE: { label: "Under Repair", bg: "#e0e7ff", color: "#6366f1", icon: "🔧" },
};

const safeCsv = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value).replace(/"/g, '""');
  return `"${str}"`;
};

const downloadTextFile = (filename, content, mime = "text/plain;charset=utf-8;") => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const parseCsvLine = (line) => {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current.trim());
  return result.map((v) => v.replace(/^"|"$/g, ""));
};

const parseCsvText = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
};

/* ─────────────────────────────────────────────────────────────────
   EXCEL PARSER — uses SheetJS (xlsx) loaded from CDN
───────────────────────────────────────────────────────────────── */
let _xlsxLib = null;

const loadXlsxLib = () =>
  new Promise((resolve, reject) => {
    if (_xlsxLib) return resolve(_xlsxLib);
    if (window.XLSX) {
      _xlsxLib = window.XLSX;
      return resolve(_xlsxLib);
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => {
      _xlsxLib = window.XLSX;
      resolve(_xlsxLib);
    };
    script.onerror = () => reject(new Error("Failed to load SheetJS library"));
    document.head.appendChild(script);
  });

const parseExcelFile = async (file) => {
  const XLSX = await loadXlsxLib();
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  return rows;
};

/* ─────────────────────────────────────────────────────────────────
   BACKEND API HELPER
   ✅ FIX: استبدلنا process.env بـ قيمة ثابتة أو window متغير
   غيّر BASE_URL لـ URL الـ API بتاعتك
───────────────────────────────────────────────────────────────── */
const BASE_URL =
  (typeof window !== "undefined" && window.__API_URL__) ||
  "https://your-api.example.com/api";

const api = {
  bulkImportDevices: async (devices) => {
    const response = await fetch(`${BASE_URL}/devices/bulk-import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // لو عندك Authorization token ضيفه هنا:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ devices }),
    });

    if (!response.ok) {
      let errorMsg = `Server error: ${response.status}`;
      try {
        const errBody = await response.json();
        errorMsg = errBody?.message || errBody?.error || errorMsg;
      } catch (_) {}
      throw new Error(errorMsg);
    }

    return response.json();
  },
};

/* ─────────────────────────────────────────────────────────────────
   نورمالايز صفوف الإكسيل لشكل الداتا الموحد
───────────────────────────────────────────────────────────────── */
const normalizeExcelRow = (row, idx) => ({
  rowNo: idx + 1,
  deviceCode: row.deviceCode || row["Device Code"] || row["كود الجهاز"] || row.code || "",
  deviceName: row.deviceName || row["Device Name"] || row["اسم الجهاز"] || row.name || "",
  serialNumber: row.serialNumber || row["Serial Number"] || row["الرقم التسلسلي"] || row.serial || "",
  barcode: row.barcode || row["Barcode"] || row["باركود"] || "",
  ipAddress: row.ipAddress || row["IP Address"] || row["IP"] || "",
  firmware: row.firmware || row["Firmware"] || row["الفيرمور"] || "",
  manufacturer: row.manufacturer || row["Manufacturer"] || row["الشركة المصنعة"] || "",
  currentStatus: row.currentStatus || row["Status"] || row["الحالة"] || "OK",
  cluster: row.cluster || row["Cluster"] || row["الكلستر"] || "",
  building: row.building || row["Building"] || row["المبنى"] || "",
  zone: row.zone || row["Zone"] || row["المنطقة"] || "",
  lane: row.lane || row["Lane"] || row["المسار"] || "",
  direction: row.direction || row["Direction"] || row["الاتجاه"] || "",
});

/* ─────────────────────────────────────────────────────────────────
   INJECTED LUXURY CSS
───────────────────────────────────────────────────────────────── */
const LUX_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .lux-tp-root { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-tertiary, #f8fafc); min-height: 100vh; padding: 24px 32px; color: #0f172a; }

  .lux-btn-outline {
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #475569;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
  }
  .lux-btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

  .lux-btn-primary {
    border: none;
    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
    color: #fff;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(79,70,229,0.3);
  }
  .lux-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(79,70,229,0.4); }
  .lux-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .lux-btn-danger {
    border: 1px solid #fecaca;
    background: #fff;
    color: #ef4444;
    padding: 8px 14px;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
    font-size: 13px;
  }
  .lux-btn-danger:hover { background: #fef2f2; }

  .lux-btn-readmore {
    background: transparent;
    color: #4f46e5;
    border: 1px solid rgba(79,70,229,0.3);
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 13px;
  }
  .lux-btn-readmore:hover { background: #e0e7ff; border-color: #4f46e5; }

  .lux-page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0; color: #0f172a; }
  .lux-page-sub { font-size: 14px; color: #64748b; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .lux-pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; box-shadow: 0 0 0 4px #d1fae5; animation: luxPulse 2s infinite; flex-shrink: 0; }

  .lux-top-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }

  .lux-kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-top: 24px; margin-bottom: 24px; }
  .lux-kpi-card { background: #fff; padding: 16px 20px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s; }
  .lux-kpi-card:hover { transform: translateY(-2px); border-color: #cbd5e1; }
  .lux-kpi-card.active { border-color: #6366f1; background: #e0e7ff; box-shadow: 0 6px 20px rgba(99,102,241,0.15); }
  .lux-kpi-title { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .lux-kpi-card.active .lux-kpi-title { color: #4338ca; }
  .lux-kpi-val { font-size: 28px; font-weight: 800; line-height: 1; }

  .lux-filter-bar {
    display: flex; align-items: center; gap: 16px; background: #fff;
    padding: 16px; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    border: 1px solid #e2e8f0; margin-bottom: 24px; flex-wrap: wrap;
  }

  .lux-search-box { position: relative; flex: 2; min-width: 250px; }
  .lux-search-box input {
    width: 100%; padding: 12px 16px 12px 42px; border-radius: 12px;
    border: 1px solid #cbd5e1; background: #f8fafc; font-size: 14px;
    outline: none; transition: all 0.2s ease; font-weight: 500; box-sizing: border-box;
  }
  .lux-search-box input:focus { border-color: #4f46e5; background: #fff; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
  .lux-search-box svg { position: absolute; left: 14px; top: 12px; color: #94a3b8; }

  .lux-select-wrap { flex: 1; min-width: 150px; display: flex; flex-direction: column; gap: 6px; }
  .lux-select-wrap label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
  .lux-select { padding: 10px 14px; border-radius: 10px; border: 1px solid #cbd5e1; background: #f8fafc; font-size: 13px; font-weight: 600; color: #334155; outline: none; cursor: pointer; }
  .lux-select:focus { border-color: #4f46e5; }

  .lux-summary-note { font-size: 13px; color: #64748b; font-weight: 700; margin-left: auto; }

  /* ── Excel Import Box ── */
  .lux-import-box {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  }

  .lux-import-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .lux-import-header-left { display: flex; align-items: center; gap: 12px; }

  .lux-import-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }

  .lux-import-title { font-size: 17px; font-weight: 800; color: #fff; margin: 0; }
  .lux-import-subtitle { font-size: 13px; color: rgba(255,255,255,0.7); margin: 2px 0 0 0; font-weight: 500; }

  .lux-import-body { padding: 24px; }

  /* Dropzone */
  .lux-dropzone {
    border: 2px dashed #c7d2fe;
    border-radius: 16px;
    background: #f5f3ff;
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .lux-dropzone:hover, .lux-dropzone.drag-over {
    border-color: #6366f1;
    background: #ede9fe;
  }
  .lux-dropzone-icon { font-size: 40px; margin-bottom: 12px; }
  .lux-dropzone-title { font-size: 16px; font-weight: 800; color: #312e81; margin-bottom: 6px; }
  .lux-dropzone-sub { font-size: 13px; color: #6366f1; font-weight: 600; }
  .lux-dropzone-formats { font-size: 11px; color: #94a3b8; margin-top: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

  /* Preview table */
  .lux-preview-wrap {
    margin-top: 20px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;
  }

  .lux-preview-toolbar {
    padding: 14px 20px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  .lux-preview-count { font-size: 13px; font-weight: 800; color: #334155; }
  .lux-preview-count span { color: #6366f1; }

  .lux-preview-table-wrap { overflow-x: auto; max-height: 280px; overflow-y: auto; }

  .lux-preview-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .lux-preview-table th {
    padding: 10px 14px;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 0.5px;
    text-align: left;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .lux-preview-table td {
    padding: 10px 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
    font-weight: 600;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .lux-preview-table tr:last-child td { border-bottom: none; }
  .lux-preview-table tr:hover td { background: #f8fafc; }

  .lux-row-num { font-family: monospace; color: #94a3b8; font-size: 11px; }

  /* Status badge */
  .lux-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
  }

  /* Submit result */
  .lux-submit-result {
    margin-top: 16px;
    padding: 16px 20px;
    border-radius: 14px;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .lux-submit-result.success { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
  .lux-submit-result.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
  .lux-submit-result.warning { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }

  .lux-result-icon { font-size: 20px; flex-shrink: 0; }
  .lux-result-detail { margin-top: 8px; font-size: 12px; opacity: 0.8; font-weight: 600; line-height: 1.6; }

  /* Spinner */
  .lux-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: luxSpin 0.7s linear infinite;
    flex-shrink: 0;
  }

  /* Error */
  .lux-error-box {
    margin-top: 16px;
    padding: 14px 18px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    color: #991b1b;
    font-size: 13px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Progress bar */
  .lux-progress-bar-wrap { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-top: 12px; }
  .lux-progress-bar { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 99px; transition: width 0.4s ease; }

  /* Cards */
  .lux-hw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .lux-hw-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; display: flex; flex-direction: column; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
  .lux-hw-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.06); border-color: #cbd5e1; }
  .lux-hw-head { padding: 20px; display: flex; justify-content: space-between; border-bottom: 1px solid #f8fafc; align-items: flex-start; }
  .lux-hw-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; color: #475569; }
  .lux-hw-body { padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: #f8fafc; flex: 1; }
  .lux-hw-stat { display: flex; flex-direction: column; gap: 4px; }
  .lux-hw-stat span:first-child { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; }
  .lux-hw-stat span:last-child { font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Slide panel */
  .lux-slide-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(2px); z-index: 998; animation: luxFadeIn 0.3s forwards; }
  .lux-slide-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 600px; background: #f8fafc; z-index: 999; box-shadow: -10px 0 40px rgba(0,0,0,0.1); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; }
  .lux-slide-panel.open { transform: translateX(0); }

  @keyframes luxPulse {
    0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); }
    70% { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }
  @keyframes luxFadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes luxSpin { to { transform: rotate(360deg); } }

  @media (max-width: 1100px) { .lux-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 700px) { .lux-tp-root { padding: 16px 14px; } .lux-kpi-grid { grid-template-columns: 1fr; } }
`;

/* ─────────────────────────────────────────────────────────────────
   EXCEL IMPORT PANEL COMPONENT
───────────────────────────────────────────────────────────────── */
function ExcelImportPanel({ onClose, onImportSuccess }) {
  const [rows, setRows] = useState([]);
  const [parseError, setParseError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const processFile = async (file) => {
    setParseError("");
    setRows([]);
    setSubmitResult(null);
    setFileName(file.name);

    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      setParseError("الملف مش متوافق. الأنواع المدعومة: .xlsx, .xls, .csv");
      return;
    }

    try {
      let rawRows = [];

      if (ext === "csv") {
        const text = await file.text();
        rawRows = parseCsvText(text);
      } else {
        rawRows = await parseExcelFile(file);
      }

      if (!rawRows.length) {
        setParseError("الملف فاضي أو ما فيهوش بيانات.");
        return;
      }

      const normalized = rawRows.map((r, idx) => normalizeExcelRow(r, idx));
      setRows(normalized);
    } catch (err) {
      setParseError(err?.message || "فشل في قراءة الملف.");
    }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleSubmit = async () => {
    if (!rows.length) return;

    setSubmitting(true);
    setSubmitResult(null);
    setProgress(10);

    const payload = rows.map((r) => ({
      deviceCode: r.deviceCode,
      deviceName: r.deviceName,
      serialNumber: r.serialNumber,
      barcode: r.barcode,
      ipAddress: r.ipAddress,
      firmware: r.firmware,
      manufacturer: r.manufacturer,
      currentStatus: r.currentStatus || "OK",
      location: {
        cluster: r.cluster,
        building: r.building,
        zone: r.zone,
        lane: r.lane,
        direction: r.direction,
      },
    }));

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 15, 85));
    }, 300);

    try {
      const result = await api.bulkImportDevices(payload);
      clearInterval(progressInterval);
      setProgress(100);

      const { created = 0, updated = 0, failed = 0, errors = [] } = result;

      if (failed === 0) {
        setSubmitResult({
          type: "success",
          msg: `✅ تم الحفظ بنجاح! ${created} جهاز جديد، ${updated} تم تحديثه.`,
          detail: null,
        });
        onImportSuccess?.({ created, updated, total: rows.length });
      } else {
        setSubmitResult({
          type: "warning",
          msg: `⚠️ تم مع أخطاء: ${created} نجح، ${failed} فشل.`,
          detail: errors.slice(0, 5).join("\n"),
        });
      }
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      setSubmitResult({
        type: "error",
        msg: "❌ فشل الإرسال للسيرفر",
        detail: err?.message || "خطأ غير معروف",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s) => {
    const m = STATUS_META[s] || STATUS_META.OK;
    return { background: m.bg, color: m.color };
  };

  const previewCols = [
    { key: "rowNo", label: "#" },
    { key: "deviceCode", label: "Device Code" },
    { key: "deviceName", label: "Device Name" },
    { key: "serialNumber", label: "Serial" },
    { key: "ipAddress", label: "IP" },
    { key: "cluster", label: "Cluster" },
    { key: "zone", label: "Zone" },
    { key: "currentStatus", label: "Status" },
  ];

  return (
    <div className="lux-import-box">
      {/* Header */}
      <div className="lux-import-header">
        <div className="lux-import-header-left">
          <div className="lux-import-icon">📊</div>
          <div>
            <div className="lux-import-title">Excel / CSV Import</div>
            <div className="lux-import-subtitle">
              ارفع ملف الإكسيل وراجع البيانات قبل الحفظ
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "none",
            borderRadius: "8px",
            color: "#fff",
            cursor: "pointer",
            padding: "8px 14px",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          ✕ إغلاق
        </button>
      </div>

      {/* Body */}
      <div className="lux-import-body">
        {/* Dropzone */}
        <div
          className={`lux-dropzone ${isDragOver ? "drag-over" : ""}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            onChange={handleFileInput}
          />
          <div className="lux-dropzone-icon">📂</div>
          <div className="lux-dropzone-title">
            {fileName ? `📄 ${fileName}` : "اسحب الملف هنا أو اضغط لاختياره"}
          </div>
          <div className="lux-dropzone-sub">
            {fileName ? "اضغط لاختيار ملف مختلف" : "اختار ملف من جهازك"}
          </div>
          <div className="lux-dropzone-formats">Supported: .xlsx · .xls · .csv</div>
        </div>

        {/* Parse Error */}
        {parseError && (
          <div className="lux-error-box">
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span>{parseError}</span>
          </div>
        )}

        {/* Preview Table */}
        {rows.length > 0 && (
          <div className="lux-preview-wrap">
            <div className="lux-preview-toolbar">
              <div className="lux-preview-count">
                معاينة: <span>{rows.length} صف</span> — أول 20 صف معروضين
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  className="lux-btn-danger"
                  onClick={() => { setRows([]); setFileName(""); setSubmitResult(null); }}
                >
                  🗑 مسح
                </button>
                <button
                  className="lux-btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="lux-spinner"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>💾 حفظ {rows.length} جهاز في الباك إند</>
                  )}
                </button>
              </div>
            </div>

            {/* Progress */}
            {submitting && (
              <div style={{ padding: "0 20px 12px" }}>
                <div className="lux-progress-bar-wrap">
                  <div className="lux-progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, marginTop: 4 }}>
                  {progress}% — جاري إرسال البيانات...
                </div>
              </div>
            )}

            <div className="lux-preview-table-wrap">
              <table className="lux-preview-table">
                <thead>
                  <tr>
                    {previewCols.map((c) => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row) => (
                    <tr key={row.rowNo}>
                      {previewCols.map((c) => (
                        <td key={c.key}>
                          {c.key === "rowNo" ? (
                            <span className="lux-row-num">#{row[c.key]}</span>
                          ) : c.key === "currentStatus" ? (
                            <span className="lux-status-badge" style={statusColor(row[c.key])}>
                              {row[c.key] || "OK"}
                            </span>
                          ) : (
                            row[c.key] || <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length > 20 && (
              <div style={{ padding: "10px 20px", fontSize: 12, color: "#64748b", fontWeight: 700, borderTop: "1px solid #f1f5f9" }}>
                + {rows.length - 20} صف إضافي مش معروض
              </div>
            )}
          </div>
        )}

        {/* Submit Result */}
        {submitResult && (
          <div className={`lux-submit-result ${submitResult.type}`}>
            <span className="lux-result-icon">
              {submitResult.type === "success" ? "✅" : submitResult.type === "warning" ? "⚠️" : "❌"}
            </span>
            <div>
              <div>{submitResult.msg}</div>
              {submitResult.detail && (
                <div className="lux-result-detail">{submitResult.detail}</div>
              )}
            </div>
          </div>
        )}

        {/* Template Download Hint */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, fontSize: 12, color: "#166534", fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 18 }}>💡</span>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 2 }}>ملاحظة على أعمدة الإكسيل</div>
            الأعمدة المدعومة بالإنجليزي والعربي: deviceCode, deviceName, serialNumber, barcode, ipAddress, firmware, manufacturer, currentStatus, cluster, building, zone, lane, direction
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DETAILS OVERLAY
───────────────────────────────────────────────────────────────── */
function DeviceDetailsOverlay({ device, inspections = [], onBack }) {
  if (!device) return null;
  const ploc = device.parsedLoc || {};
  const sMeta = STATUS_META[device.currentStatus || "OK"] || STATUS_META.OK;

  return (
    <>
      <div className="lux-slide-backdrop" onClick={onBack}></div>
      <div className="lux-slide-panel open">
        <div style={{ padding: "32px", background: "#fff", borderBottom: "1px solid #e2e8f0", position: "relative" }}>
          <button
            onClick={onBack}
            style={{ position: "absolute", top: "24px", right: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ padding: "6px 12px", borderRadius: "20px", background: sMeta.bg, color: sMeta.color, fontSize: "13px", fontWeight: 800, display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: sMeta.color }}></span>
              {sMeta.label}
            </span>
            <span style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 600 }}>ID: {device.id}</span>
          </div>

          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: "0 0 4px 0" }}>{device.deviceCode || "Unknown"}</h2>
          <div style={{ fontSize: "15px", color: "#475569", fontWeight: 500 }}>{device.deviceName} • {device.manufacturer || "Generic"}</div>
        </div>

        <div style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: "0.5px", margin: "0 0 16px 0", fontWeight: 800 }}>Hardware Specs & Network</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
            {[
              ["Barcode / Tag", device.barcode || "—"],
              ["Serial Number", device.serialNumber || "—"],
              ["IP Address", device.ipAddress || "—"],
              ["Firmware Ver.", device.firmware || "—"],
            ].map(([l, v], i) => (
              <div key={i} style={{ padding: "16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: "4px" }}>{l}</div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{v}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: "0.5px", margin: "0 0 16px 0", fontWeight: 800 }}>Deployment Coordinates</h3>
          <div style={{ padding: "20px", background: "#e0e7ff", border: "1px solid #c7d2fe", borderRadius: "16px", marginBottom: "32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            {[
              ["Cluster", ploc.cluster],
              ["Sector/Zone", ploc.zone],
              ["Facility/Bldg", ploc.building],
              ["Lane Route", ploc.lane],
              ["Traffic Direction", ploc.direction],
            ].map(([l, v], i) => (
              <div key={i} style={i === 4 ? { gridColumn: "span 2" } : {}}>
                <div style={{ fontSize: "11px", fontWeight: 800, color: "#4f46e5", textTransform: "uppercase" }}>{l}</div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#312e81" }}>{v || "—"}</div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: "13px", textTransform: "uppercase", color: "#475569", letterSpacing: "0.5px", margin: "0 0 16px 0", fontWeight: 800 }}>Inspection Log</h3>

          {inspections.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", background: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
              <div style={{ fontSize: "13px", color: "#94a3b8", fontWeight: 500 }}>No maintenance logs filed for this unit.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {inspections
                .sort((a, b) => new Date(b.inspectedAt) - new Date(a.inspectedAt))
                .map((ins, idx) => (
                  <div key={idx} style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ padding: "4px 8px", borderRadius: "4px", background: ins.inspectionStatus === "OK" ? "#ecfdf5" : "#fef2f2", color: ins.inspectionStatus === "OK" ? "#10b981" : "#ef4444", fontSize: "11px", fontWeight: 800 }}>
                          {ins.inspectionStatus || "LOGGED"}
                        </span>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          {ins.technician?.fullName || ins.technician?.username || "Tech"}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: 600, color: "#94a3b8" }}>
                        {new Date(ins.inspectedAt || ins.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: "14px", color: "#475569", lineHeight: 1.5, background: "#f8fafc", padding: "12px", border: "1px solid #f1f5f9", borderRadius: "8px" }}>
                      {ins.notes || ins.issueReason || "Inspection confirmed. No extra remarks."}
                    </div>
                    {ins.images?.length > 0 && (
                      <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                        {ins.images.map((img, i) => (
                          <img key={i} src={img.imageUrl} alt="Inspection proof" style={{ width: "56px", height: "56px", borderRadius: "8px", objectFit: "cover", border: "1px solid #e2e8f0" }} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export function DevicesPage({ devices = [], inspections = [] }) {
  const [activeStat, setActiveStat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [filterLoc, setFilterLoc] = useState({ cluster: "ALL", building: "ALL", zone: "ALL" });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [showExcelImport, setShowExcelImport] = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = LUX_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const devicesMapped = useMemo(
    () => devices.map((d) => ({ ...d, parsedLoc: parseDeviceLocation(d) })),
    [devices]
  );

  const stats = useMemo(() => {
    let ok = 0, maint = 0, out = 0, under = 0;
    devicesMapped.forEach((d) => {
      if (d.currentStatus === "OK") ok++;
      else if (d.currentStatus === "NEEDS_MAINTENANCE") maint++;
      else if (d.currentStatus === "OUT_OF_SERVICE") out++;
      else if (d.currentStatus === "UNDER_MAINTENANCE") under++;
    });
    return { total: devicesMapped.length, ok, maint, out, under };
  }, [devicesMapped]);

  const uniqueLocs = useMemo(() => {
    const l = { cluster: new Set(), building: new Set(), zone: new Set() };
    devicesMapped.forEach((d) => {
      if (d.parsedLoc.cluster) l.cluster.add(d.parsedLoc.cluster);
      if (d.parsedLoc.building) l.building.add(d.parsedLoc.building);
      if (d.parsedLoc.zone) l.zone.add(d.parsedLoc.zone);
    });
    return {
      cluster: [...l.cluster].sort(),
      building: [...l.building].sort(),
      zone: [...l.zone].sort(),
    };
  }, [devicesMapped]);

  const filtered = useMemo(() => {
    return devicesMapped.filter((d) => {
      if (activeStat !== "ALL" && d.currentStatus !== activeStat) return false;
      if (search) {
        const q = search.toLowerCase();
        const text = `${d.deviceCode} ${d.deviceName} ${d.serialNumber} ${d.barcode} ${d.ipAddress}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      const pl = d.parsedLoc;
      if (filterLoc.cluster !== "ALL" && pl.cluster !== filterLoc.cluster) return false;
      if (filterLoc.building !== "ALL" && pl.building !== filterLoc.building) return false;
      if (filterLoc.zone !== "ALL" && pl.zone !== filterLoc.zone) return false;
      return true;
    });
  }, [devicesMapped, activeStat, search, filterLoc]);

  const handleExportCsv = () => {
    const rows = filtered.map((dev) => ({
      id: dev.id,
      deviceCode: dev.deviceCode || "",
      deviceName: dev.deviceName || "",
      barcode: dev.barcode || "",
      serialNumber: dev.serialNumber || "",
      ipAddress: dev.ipAddress || "",
      firmware: dev.firmware || "",
      currentStatus: dev.currentStatus || "",
      cluster: dev.parsedLoc?.cluster || "",
      building: dev.parsedLoc?.building || "",
      zone: dev.parsedLoc?.zone || "",
      lane: dev.parsedLoc?.lane || "",
      direction: dev.parsedLoc?.direction || "",
    }));
    const headers = ["id","deviceCode","deviceName","barcode","serialNumber","ipAddress","firmware","currentStatus","cluster","building","zone","lane","direction"];
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((h) => safeCsv(row[h])).join(",")),
    ].join("\n");
    downloadTextFile(
      `devices_export_${new Date().toISOString().slice(0, 10)}.csv`,
      csv,
      "text/csv;charset=utf-8;"
    );
  };

  const handleExportJson = () => {
    const payload = filtered.map((dev) => ({
      id: dev.id,
      deviceCode: dev.deviceCode,
      deviceName: dev.deviceName,
      barcode: dev.barcode,
      serialNumber: dev.serialNumber,
      ipAddress: dev.ipAddress,
      firmware: dev.firmware,
      currentStatus: dev.currentStatus,
      location: dev.parsedLoc,
    }));
    downloadTextFile(
      `devices_export_${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(payload, null, 2),
      "application/json;charset=utf-8;"
    );
  };

  return (
    <div className="lux-tp-root">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 className="lux-page-title">Global Device Directory</h1>
          <p className="lux-page-sub">
            <span className="lux-pulse"></span>
            Live connection established. Hardware data synchronized.
          </p>
        </div>

        <div className="lux-top-actions">
          <button
            className="lux-btn-primary"
            onClick={() => setShowExcelImport((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="16" y2="17"/>
            </svg>
            📊 Import Excel
          </button>

          <button className="lux-btn-outline" onClick={handleExportCsv}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Export CSV
          </button>

          <button className="lux-btn-outline" onClick={handleExportJson}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="lux-kpi-grid">
        {[
          { key: "ALL", label: "Fleet Size", val: stats.total, color: "#4f46e5" },
          { key: "OK", label: "Operational", val: stats.ok, color: "#10b981" },
          { key: "NEEDS_MAINTENANCE", label: "Degraded", val: stats.maint, color: "#f59e0b" },
          { key: "UNDER_MAINTENANCE", label: "Under Repair", val: stats.under, color: "#6366f1" },
          { key: "OUT_OF_SERVICE", label: "Offline/Dead", val: stats.out, color: "#ef4444" },
        ].map(({ key, label, val, color }) => (
          <div
            key={key}
            className={`lux-kpi-card ${activeStat === key ? "active" : ""}`}
            onClick={() => setActiveStat(key)}
          >
            <div className="lux-kpi-title">{label}</div>
            <div className="lux-kpi-val" style={{ color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Excel Import Panel */}
      {showExcelImport && (
        <ExcelImportPanel
          onClose={() => setShowExcelImport(false)}
          onImportSuccess={({ created, updated, total }) => {
            console.log(`Import done: ${created} created, ${updated} updated out of ${total}`);
            // ممكن هنا تعمل refetch للداتا من الباك إند
          }}
        />
      )}

      {/* Filter Bar */}
      <div className="lux-filter-bar">
        <div className="lux-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Smart Search: Device ID, Name, Serial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lux-select-wrap">
          <label>Cluster</label>
          <select
            className="lux-select"
            value={filterLoc.cluster}
            onChange={(e) => setFilterLoc({ ...filterLoc, cluster: e.target.value })}
          >
            <option value="ALL">All Clusters</option>
            {uniqueLocs.cluster.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="lux-select-wrap">
          <label>Sector / Zone</label>
          <select
            className="lux-select"
            value={filterLoc.zone}
            onChange={(e) => setFilterLoc({ ...filterLoc, zone: e.target.value })}
          >
            <option value="ALL">All Zones</option>
            {uniqueLocs.zone.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>

        <div className="lux-select-wrap">
          <label>Facility</label>
          <select
            className="lux-select"
            value={filterLoc.building}
            onChange={(e) => setFilterLoc({ ...filterLoc, building: e.target.value })}
          >
            <option value="ALL">All Facilities</option>
            {uniqueLocs.building.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className="lux-summary-note">
          Showing {filtered.length} device{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="lux-hw-grid">
        {filtered.map((dev) => {
          const sMeta = STATUS_META[dev.currentStatus || "OK"] || STATUS_META.OK;
          return (
            <div key={dev.id} className="lux-hw-card">
              <div className="lux-hw-head">
                <div style={{ display: "flex", gap: "12px" }}>
                  <div className="lux-hw-icon">
                    {dev.deviceName ? dev.deviceName[0].toUpperCase() : "H"}
                  </div>
                  <div>
                    <div style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                      {dev.deviceCode || "N/A"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                      {dev.deviceName}
                    </div>
                  </div>
                </div>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: sMeta.color, boxShadow: `0 0 0 4px ${sMeta.bg}` }}></div>
              </div>
              <div className="lux-hw-body">
                <div className="lux-hw-stat"><span>Cluster</span><span>{dev.parsedLoc.cluster || "Unknown"}</span></div>
                <div className="lux-hw-stat"><span>Zone</span><span>{dev.parsedLoc.zone || "—"}</span></div>
                <div className="lux-hw-stat"><span>IP Address</span><span style={{ fontFamily: "monospace" }}>{dev.ipAddress || "DHCP"}</span></div>
                <div className="lux-hw-stat"><span>Direction</span><span>{dev.parsedLoc.direction || "—"}</span></div>
              </div>
              <div style={{ padding: "16px", borderTop: "1px solid #f1f5f9" }}>
                <button className="lux-btn-readmore" onClick={() => setSelectedDevice(dev)}>
                  Read More Details →
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "#64748b", fontWeight: 600 }}>
            No devices match the specified criteria.
          </div>
        )}
      </div>

      {selectedDevice && (
        <DeviceDetailsOverlay
          device={selectedDevice}
          inspections={inspections.filter((i) => i.deviceId === selectedDevice.id)}
          onBack={() => setSelectedDevice(null)}
        />
      )}
    </div>
  );
}

export default DevicesPage;