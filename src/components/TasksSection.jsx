import React from "react";
import { statusAr, statusClass, formatDate, isFinishedStatus, userName } from "../services/softwareHelpers";

export function TasksSection({
  tasks,
  loading,
  busy,
  loggedUserId,
  loggedUser,
  onOpenIssueModal,
  onQuickDone,
  onQuickNotReachable
}) {
  return (
    <div className="sw-panel">
      <div className="sw-panel-head">
        <div>
          <h2>Global Software Tasks</h2>
          <p>
            افحص الجهاز. إذا كان سليماً اضغط Done، وإذا ظهرت مشكلة اتبع
            الخطوات وسجل النتيجة.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="sw-empty">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="sw-empty">لا توجد مهام مخصصة لك حالياً.</div>
      ) : (
        <div className="sw-list">
          {tasks.map((task) => (
            <article className="sw-card" key={task.id}>
              <div className="sw-card-top">
                <div>
                  <h3>{task.title}</h3>

                  <div className="sw-meta">
                    Assigned to: {task.assignedName || userName(loggedUser)}
                    <br />
                    Scheduled: {formatDate(task.scheduledDate)}
                  </div>

                  <div className="sw-tags">
                    <span className={`sw-tag ${statusClass(task.status)}`}>
                      {statusAr(task.status)}
                    </span>

                    <span className="sw-tag">Items {task.items.length}</span>

                    {task.assetType && (
                      <span className="sw-tag">{task.assetType}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="sw-items">
                {task.items.length === 0 ? (
                  <div className="sw-empty">لا توجد أجهزة داخل المهمة.</div>
                ) : (
                  task.items.map((item) => (
                    <div
                      key={item.id}
                      className={`sw-item ${statusClass(item.status)}`}
                    >
                      <div>
                        <b>{item.label}</b>

                        <div className="sw-meta">
                          {item.assetType === "DEVICE" ? (
                            <>
                              {item.device?.deviceCode || "No code"} •{" "}
                              {item.device?.ipAddress || "No IP"}
                              <br />
                              {item.location || "No location"}
                            </>
                          ) : (
                            <>
                              Gate #{item.gate?.gateNo || item.gateId || "—"}
                              <br />
                              {item.location || "No location"}
                            </>
                          )}
                        </div>

                        <div className="sw-tags">
                          <span className={`sw-tag ${statusClass(item.status)}`}>
                            {statusAr(item.status)}
                          </span>

                          {item.device?.currentStatus && (
                            <span
                              className={`sw-tag ${statusClass(
                                item.device.currentStatus
                              )}`}
                            >
                              Device: {statusAr(item.device.currentStatus)}
                            </span>
                          )}

                          {item.gate?.currentStatus && (
                            <span
                              className={`sw-tag ${statusClass(
                                item.gate.currentStatus
                              )}`}
                            >
                              Gate: {statusAr(item.gate.currentStatus)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="sw-item-actions">
                        <button
                          className="sw-btn green sw-small"
                          disabled={
                            busy === `complete-${task.id}-${item.id}` ||
                            isFinishedStatus(item.status)
                          }
                          onClick={() => onQuickDone(task, item)}
                        >
                          Done
                        </button>

                        <button
                          className="sw-btn orange sw-small"
                          disabled={
                            busy === `complete-${task.id}-${item.id}` ||
                            isFinishedStatus(item.status)
                          }
                          onClick={() => onOpenIssueModal(task, item)}
                        >
                          Issue Steps
                        </button>

                        <button
                          className="sw-btn white sw-small"
                          disabled={
                            busy === `complete-${task.id}-${item.id}` ||
                            isFinishedStatus(item.status)
                          }
                          onClick={() => onQuickNotReachable(task, item)}
                        >
                          Not Reachable
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
