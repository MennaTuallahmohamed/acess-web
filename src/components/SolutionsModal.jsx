import React from "react";
import { statusAr } from "../services/softwareHelpers";

export function SolutionsModal({
  issueModal,
  loadingSteps,
  issues,
  selectedIssueId,
  solutions,
  doneSolutions,
  solved,
  modalNotes,
  lastPayload,
  busy,
  onClose,
  onIssueChange,
  onToggleSolution,
  onSolvedChange,
  onNotesChange,
  onSave
}) {
  if (!issueModal) return null;

  return (
    <div className="sw-modal-backdrop">
      <div className="sw-modal">
        <div className="sw-modal-head">
          <div>
            <h2>Software Issue Steps</h2>
            <p>{issueModal.item.label}</p>
          </div>

          <button className="sw-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="sw-modal-body">
          {loadingSteps ? (
            <div className="sw-empty">Loading issue steps...</div>
          ) : (
            <>
              <label className="sw-meta">Issue</label>

              <select
                className="sw-select"
                value={selectedIssueId}
                onChange={(e) => onIssueChange(e.target.value)}
              >
                <option value="">Select issue...</option>

                {issues.map((issue) => (
                  <option key={issue._uid} value={issue._idNumber}>
                    {issue.issueCode ? `${issue.issueCode} - ` : ""}
                    {issue.title || `Issue ${issue._idNumber}`}
                  </option>
                ))}
              </select>

              <div style={{ height: 14 }} />

              {issues.length === 0 ? (
                <div className="sw-empty">
                  لا توجد مشاكل مسجلة لهذا الجهاز. يمكن كتابة الملاحظة وحفظ
                  النتيجة.
                </div>
              ) : solutions.length === 0 ? (
                <div className="sw-empty">
                  لا توجد خطوات حل مسجلة لهذه المشكلة.
                </div>
              ) : (
                solutions.map((solution, index) => {
                  const done = doneSolutions.includes(
                    String(solution._idNumber)
                  );

                  return (
                    <div
                      className={`sw-step ${done ? "done" : ""}`}
                      key={solution._uid}
                      onClick={() => onToggleSolution(solution)}
                    >
                      <div className="sw-step-number">
                        {done ? "✓" : index + 1}
                      </div>

                      <div>
                        <b>{solution.title || `Step ${index + 1}`}</b>

                        <div className="sw-meta">
                          ID: {solution._idNumber} •{" "}
                          {solution.description || "No description"}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div style={{ height: 12 }} />

              <label className="sw-meta">هل تم حل المشكلة؟</label>

              <div className="sw-result-box">
                <button
                  type="button"
                  className={`sw-result-choice ok ${
                    solved === "YES" ? "active" : ""
                  }`}
                  onClick={() => onSolvedChange("YES")}
                >
                  نعم، تم الحل
                </button>

                <button
                  type="button"
                  className={`sw-result-choice bad ${
                    solved === "NO" ? "active" : ""
                  }`}
                  onClick={() => onSolvedChange("NO")}
                >
                  لا، لم يتم الحل
                </button>
              </div>

              <div style={{ height: 12 }} />

              <textarea
                className="sw-textarea"
                placeholder="تعليق أو ملاحظات..."
                value={modalNotes}
                onChange={(e) => onNotesChange(e.target.value)}
              />

              {lastPayload && (
                <>
                  <div style={{ height: 12 }} />
                  <pre className="sw-debug">
                    {JSON.stringify(lastPayload, null, 2)}
                  </pre>
                </>
              )}
            </>
          )}
        </div>

        <div className="sw-modal-foot">
          <button className="sw-btn white" onClick={onClose}>
            Cancel
          </button>

          <button
            className="sw-btn green"
            disabled={busy.startsWith("complete-")}
            onClick={onSave}
          >
            Save Result
          </button>
        </div>
      </div>
    </div>
  );
}
