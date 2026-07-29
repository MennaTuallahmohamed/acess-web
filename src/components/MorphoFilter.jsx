import React from "react";

export function MorphoFilter({
  deviceSearch,
  deviceStatus,
  onSearchChange,
  onStatusChange,
  onRefresh
}) {
  return (
    <aside className="sw-filter-box">
      <div className="sw-stack">
        <input
          className="sw-input"
          placeholder="Search device, IP, barcode..."
          value={deviceSearch}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <select
          className="sw-select"
          value={deviceStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="OK">OK</option>
          <option value="NEEDS_MAINTENANCE">Needs Maintenance</option>
          <option value="UNDER_MAINTENANCE">Under Maintenance</option>
          <option value="OUT_OF_SERVICE">Out Of Service</option>
        </select>

        <button className="sw-btn" onClick={onRefresh}>
          Refresh Devices
        </button>
      </div>
    </aside>
  );
}
