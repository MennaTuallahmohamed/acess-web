import React from "react";
import { statusAr, statusClass, deviceTitle } from "../services/softwareHelpers";

export function MorphoModal({
  morphoModal,
  morphoResult,
  morphoNotes,
  busy,
  onClose,
  onResultChange,
  onNotesChange,
  onSave
}) {
  if (!morphoModal) return null;

  return (
    <div className="sw-modal-backdrop">
      <div className="sw-modal">
        <div className="sw-modal-head">
          <div>
            <h2>Morpho Status Update</h2>
            <p>{deviceTitle(morphoModal)}</p>
          </div>

          <button className="sw-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sw-modal-body">
          <div className="sw-tags">
            <span className={`sw-tag ${statusClass(morphoModal.currentStatus)}`}>
              Current: {statusAr(morphoModal.currentStatus)}
            </span>

            <span className="sw-tag">{morphoModal.ipAddress || "No IP"}</span>
          </div>

          <div style={{ height: 14 }} />

          <label className="sw-meta">Morpho Result</label>

          <select
            className="sw-select"
            value={morphoResult}
            onChange={(e) => onResultChange(e.target.value)}
          >
            <option value="FIXED">Fixed / OK</option>
            <option value="OK">OK</option>
            <option value="NOT_OK">Not OK</option>
            <option value="BROKEN">Broken</option>
            <option value="STILL_BROKEN">Still Broken</option>
          </select>

          <div style={{ height: 12 }} />

          <textarea
            className="sw-textarea"
            placeholder="اكتب ملاحظات مراجعة Morpho..."
            value={morphoNotes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </div>

        <div className="sw-modal-foot">
          <button className="sw-btn white" onClick={onClose}>
            Cancel
          </button>

          <button
            className="sw-btn green"
            disabled={busy === `morpho-${morphoModal.id}`}
            onClick={onSave}
          >
            Save Morpho Update
          </button>
        </div>
      </div>
    </div>
  );
}
