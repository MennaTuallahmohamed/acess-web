import React, { useEffect } from "react";

const FILTERS_CSS = `
  .ops-filters-root { padding: 0 32px 24px; }
  .ops-filters-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    display: grid;
    grid-template-columns: 2fr repeat(5, minmax(0, 1fr)) auto;
    gap: 14px;
  }
  .ops-filter-field { display: flex; flex-direction: column; gap: 8px; }
  .ops-filter-field label {
    font-size: 11px; font-weight: 800; color: #64748b;
    text-transform: uppercase; letter-spacing: .06em;
  }
  .ops-filter-input, .ops-filter-select, .ops-filter-btn {
    min-height: 46px; border-radius: 14px; border: 1px solid #dbe4ef;
    background: #f8fafc; padding: 0 14px; font-size: 14px; font-weight: 600; color: #0f172a;
  }
  .ops-filter-btn {
    background: #0f172a; color: #fff; cursor: pointer; margin-top: auto; border-color: #0f172a;
  }
  @media (max-width: 1200px) {
    .ops-filters-card { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 720px) {
    .ops-filters-root { padding: 0 18px 18px; }
    .ops-filters-card { grid-template-columns: 1fr; }
  }
`;

const DEVICE_STATUS_OPTIONS = [
  { key: "ALL", en: "All statuses", ar: "كل الحالات" },
  { key: "OK", en: "OK", ar: "سليم" },
  { key: "ATTENTION", en: "Need attention", ar: "تحتاج متابعة" },
  { key: "NEEDS_MAINTENANCE", en: "Needs maintenance", ar: "تحتاج صيانة" },
  { key: "UNDER_MAINTENANCE", en: "Under maintenance", ar: "تحت الصيانة" },
  { key: "OUT_OF_SERVICE", en: "Out of service", ar: "خارج الخدمة" },
];

export function ViewerSharedFilters({ copy, lang, filters, options, onChange, onReset }) {
  useEffect(() => {
    let el = document.getElementById("ops-filters-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "ops-filters-css";
      el.innerHTML = FILTERS_CSS;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <div className="ops-filters-root">
      <div className="ops-filters-card">
        <div className="ops-filter-field">
          <label>{copy.search}</label>
          <input className="ops-filter-input" value={filters.search} onChange={(e) => onChange("search", e.target.value)} placeholder={copy.search} />
        </div>

        <div className="ops-filter-field">
          <label>{copy.status}</label>
          <select className="ops-filter-select" value={filters.status} onChange={(e) => onChange("status", e.target.value)}>
            {DEVICE_STATUS_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>{option[lang] || option.en}</option>
            ))}
          </select>
        </div>

        <div className="ops-filter-field">
          <label>{lang === "ar" ? "المجموعة" : "Cluster"}</label>
          <select className="ops-filter-select" value={filters.cluster} onChange={(e) => onChange("cluster", e.target.value)}>
            <option value="ALL">{copy.allClusters}</option>
            {options.cluster.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="ops-filter-field">
          <label>{lang === "ar" ? "المبنى" : "Building"}</label>
          <select className="ops-filter-select" value={filters.building} onChange={(e) => onChange("building", e.target.value)}>
            <option value="ALL">{copy.allBuildings}</option>
            {options.building.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="ops-filter-field">
          <label>{lang === "ar" ? "المنطقة" : "Zone"}</label>
          <select className="ops-filter-select" value={filters.zone} onChange={(e) => onChange("zone", e.target.value)}>
            <option value="ALL">{copy.allZones}</option>
            {options.zone.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <div className="ops-filter-field">
          <label>{lang === "ar" ? "الاتجاه" : "Direction"}</label>
          <select className="ops-filter-select" value={filters.direction} onChange={(e) => onChange("direction", e.target.value)}>
            <option value="ALL">{copy.allDirections}</option>
            {options.direction.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </div>

        <button type="button" className="ops-filter-btn" onClick={onReset}>{copy.clearFilters}</button>
      </div>
    </div>
  );
}
