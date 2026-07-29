import { useState, useMemo } from "react";
import "./DataGrid.css";

export function DataGrid({
  data = [],
  columns = [],
  defaultVisible = [],
  keyField = "id",
  onRowClick,
}) {
  const [visibleCols, setVisibleCols] = useState(defaultVisible.length ? defaultVisible : columns.map(c => c.key));
  const [filters, setFilters] = useState({});
  const [activeMenu, setActiveMenu] = useState(null); // 'fields' | 'filters' | null

  // Process data based on filters
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // If any active filter doesn't match, exclude row
      for (const [colKey, filterValue] of Object.entries(filters)) {
        if (!filterValue) continue;
        const cellValue = String(row[colKey] ?? "").toLowerCase();
        if (!cellValue.includes(filterValue.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [data, filters]);

  const toggleField = (key) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setActiveMenu(null);
  };

  const hasActiveFilters = Object.values(filters).some((v) => !!v);

  return (
    <div className="datagrid-wrap">
      {/* Toolbar */}
      <div className="datagrid-toolbar">
        <div className="datagrid-controls">
          <div className="datagrid-group">
            <button
              type="button"
              className={`datagrid-btn ${hasActiveFilters ? "active" : ""}`}
              onClick={() => setActiveMenu(activeMenu === "filters" ? null : "filters")}
            >
              <span className="icon">🔍</span> Filters
              {hasActiveFilters && <span className="badge">Active</span>}
            </button>
            <button
              type="button"
              className="datagrid-btn"
              onClick={() => setActiveMenu(activeMenu === "fields" ? null : "fields")}
            >
              <span className="icon">👁️</span> Fields ({visibleCols.length})
            </button>
          </div>

          <div className="datagrid-showing">
            Showing {filteredData.length} of {data.length} records
          </div>
        </div>

        {/* Dropdowns */}
        {activeMenu === "fields" && (
          <div className="datagrid-menu datagrid-menu-fields">
            <h4>Toggle Columns</h4>
            <div className="fields-list">
              {columns.map((col) => (
                <label key={col.key} className="field-toggle">
                  <input
                    type="checkbox"
                    checked={visibleCols.includes(col.key)}
                    onChange={() => toggleField(col.key)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeMenu === "filters" && (
          <div className="datagrid-menu datagrid-menu-filters">
            <div className="filters-header">
              <h4>Active Filters</h4>
              {hasActiveFilters && (
                <button type="button" className="text-btn text-danger" onClick={clearFilters}>
                  Clear All
                </button>
              )}
            </div>
            <div className="filters-list">
              {columns.filter((c) => visibleCols.includes(c.key)).map((col) => (
                <div key={col.key} className="filter-item">
                  <label>{col.label}</label>
                  <input
                    type="text"
                    placeholder={`Filter by ${col.label.toLowerCase()}...`}
                    value={filters[col.key] || ""}
                    onChange={(e) => handleFilterChange(col.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="datagrid-table-container">
        <table className="datagrid-table">
          <thead>
            <tr>
              <th className="th-action"></th>
              {columns
                .filter((c) => visibleCols.includes(c.key))
                .map((col) => (
                  <th key={col.key}>
                    <div className="th-content">
                      <span className="th-label">{col.label}</span>
                      <span className="th-type">
                        {col.type === "number" ? "#" : "A?"}
                      </span>
                    </div>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr
                key={row[keyField] || idx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? "clickable" : ""}
              >
                <td className="td-action">
                  <input type="checkbox" className="row-check" />
                </td>
                {columns
                  .filter((c) => visibleCols.includes(c.key))
                  .map((col) => (
                    <td key={col.key}>
                      <div className="td-content">
                        {col.render ? col.render(row[col.key], row) : (
                          row[col.key] === null || row[col.key] === undefined ? (
                            <span className="td-null">null</span>
                          ) : (
                            String(row[col.key])
                          )
                        )}
                      </div>
                    </td>
                  ))}
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length + 1} className="td-empty">
                  No records found matching filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
