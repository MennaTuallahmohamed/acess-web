import React, { useState } from "react";
import { cleanText, statusAr, statusClass, deviceTitle, deviceLocation, formatDate, tryPaths, toArray, toNumber, api, getLoggedUserId, getStoredUser } from "../services/softwareHelpers";

export function MorphoSection({
  filteredDevices,
  loading,
  busy,
  loggedUserId,
  onLoadDevices,
  onStatusUpdate,
  onModalOpen
}) {
  return (
    <div className="sw-panel">
      <div className="sw-panel-head">
        <div>
          <h2>Morpho Review</h2>
          <p>
            راجع حالة الأجهزة من تطبيق Morpho الخارجي، ثم حدث الحالة وسجل
            ملاحظتك.
          </p>
        </div>
      </div>

      <div>
        {filteredDevices.length === 0 ? (
          <div className="sw-empty">لا توجد أجهزة مطابقة للبحث.</div>
        ) : (
          <div className="sw-list">
            {filteredDevices.map((device) => (
              <article className="sw-card" key={device.id}>
                <div className="sw-card-top">
                  <div>
                    <h3>{deviceTitle(device)}</h3>

                    <div className="sw-meta">
                      {device.deviceCode || "—"} •{" "}
                      {device.ipAddress || "No IP"}
                      <br />
                      {deviceLocation(device) || "No location"}
                    </div>

                    <div className="sw-tags">
                      <span
                        className={`sw-tag ${statusClass(
                          device.currentStatus
                        )}`}
                      >
                        {statusAr(device.currentStatus)}
                      </span>

                      <span className="sw-tag">
                        Last: {formatDate(device.lastInspectionAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="sw-btn sw-small"
                    onClick={() => onModalOpen(device)}
                  >
                    Update Status
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
