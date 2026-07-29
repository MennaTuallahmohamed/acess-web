import { useState } from "react";
import { useLang } from "../context/LanguageContext";
import "./Devicespage.css";

/* ══════════════════════════════════════════════
   STATUS BADGE
══════════════════════════════════════════════ */
function StatusBadge({ status }) {
  const map = {
    OK:               { label: "OK",           cls: "dp-badge--ok" },
    NEEDS_MAINTENANCE:{ label: "تحتاج صيانة", cls: "dp-badge--warn" },
    UNDER_MAINTENANCE:{ label: "تحت الصيانة", cls: "dp-badge--blue" },
    OUT_OF_SERVICE:   { label: "خارج الخدمة", cls: "dp-badge--red" },
    FAULSE:           { label: "معطل",         cls: "dp-badge--red" },
  };
  const s = map[status] || { label: status || "—", cls: "dp-badge--muted" };
  return (
    <span className={`dp-badge ${s.cls}`}>
      <span className="dp-badge-dot" />
      {s.label}
    </span>
  );
}

/* ══════════════════════════════════════════════
   INFO ROW
══════════════════════════════════════════════ */
function InfoRow({ label, value, mono, accent }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="dd-info-row">
      <span className="dd-info-label">{label}</span>
      <span className={`dd-info-value${mono ? " dd-mono" : ""}${accent ? " dd-accent" : ""}`}>
        {value}
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════
   INSPECTION CARD
══════════════════════════════════════════════ */
function InspectionCard({ inspection }) {
  const statusMap = {
    OK:           { color: "#00C896", label: "سليم ✅",        cls: "dd-insp--ok" },
    NOT_OK:       { color: "#FF5C5C", label: "معطل ❌",        cls: "dd-insp--red" },
    PARTIAL:      { color: "#FFB340", label: "جزئي ⚠️",       cls: "dd-insp--warn" },
    NOT_REACHABLE:{ color: "#6B8CFF", label: "لا يُصل إليه 🔌", cls: "dd-insp--blue" },
  };
  const s = statusMap[inspection.inspectionStatus] || { label: inspection.inspectionStatus, cls: "" };

  const tech = inspection.technician;
  const dateStr = inspection.inspectedAt
    ? new Date(inspection.inspectedAt).toLocaleString("ar-EG")
    : "—";

  return (
    <div className={`dd-insp-card ${s.cls}`}>
      {/* Header: tech info + status */}
      <div className="dd-insp-header">
        <div className="dd-tech-row">
          <div className="dd-tech-avatar">👷</div>
          <div className="dd-tech-info">
            <p className="dd-tech-name">
              {tech?.fullName || tech?.username || "فني مجهول"}
            </p>
            <p className="dd-tech-role">
              {tech?.jobTitle || "تقني ميداني"}
              {tech?.phone && <> · 📞 {tech.phone}</>}
            </p>
          </div>
        </div>
        <span className={`dp-badge ${s.cls?.replace("dd-insp","dp-badge") || "dp-badge--muted"}`}>
          <span className="dp-badge-dot" />{s.label}
        </span>
      </div>

      {/* Meta */}
      <div className="dd-insp-meta">
        <span>📅 {dateStr}</span>
        {inspection.locationText && <span>📍 {inspection.locationText}</span>}
        {inspection.latitude && (
          <span>🌐 {inspection.latitude.toFixed(5)}, {inspection.longitude?.toFixed(5)}</span>
        )}
      </div>

      {/* Task link */}
      {inspection.task && (
        <div className="dd-insp-task">
          🗒 مهمة #{inspection.task.id}
          {inspection.task.scheduledDate && (
            <span> · مجدولة {new Date(inspection.task.scheduledDate).toLocaleDateString("ar-EG")}</span>
          )}
          {inspection.task.frequency && <span> · {inspection.task.frequency}</span>}
        </div>
      )}

      {/* Issue / Notes */}
      {inspection.issueReason && (
        <div className="dd-insp-issue">⚠️ {inspection.issueReason}</div>
      )}
      {inspection.notes && (
        <div className="dd-insp-notes">{inspection.notes}</div>
      )}

      {/* Images */}
      {inspection.images?.length > 0 && (
        <div className="dd-insp-images">
          {inspection.images.map((img) => (
            <a key={img.id} href={img.imageUrl} target="_blank" rel="noreferrer" className="dd-img-thumb">
              <img src={img.imageUrl} alt={img.imageType || "inspection"} />
              {img.imageType && <span className="dd-img-type">{img.imageType}</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAINTENANCE CARD
══════════════════════════════════════════════ */
function MaintenanceCard({ log }) {
  const statusMap = {
    OPEN:        { label: "مفتوح",       cls: "dp-badge--blue" },
    IN_PROGRESS: { label: "جارٍ",        cls: "dp-badge--warn" },
    COMPLETED:   { label: "مكتمل",       cls: "dp-badge--ok" },
    SENT_OUT:    { label: "أُرسل خارج",  cls: "dp-badge--red" },
    RETURNED:    { label: "عاد",         cls: "dp-badge--muted" },
  };
  const s = statusMap[log.status] || { label: log.status, cls: "dp-badge--muted" };

  return (
    <div className="dd-maint-card">
      <div className="dd-maint-header">
        <div className="dd-maint-id">🛠 طلب صيانة #{log.id}</div>
        <span className={`dp-badge ${s.cls}`}><span className="dp-badge-dot" />{s.label}</span>
      </div>
      {log.issueReason    && <p className="dd-maint-issue">⚠️ {log.issueReason}</p>}
      <div className="dd-maint-meta">
        {log.maintenancePlace && <span>📍 {log.maintenancePlace}</span>}
        {log.externalVendor   && <span>🏭 {log.externalVendor}</span>}
        {log.sentOut          && <span>📤 أُرسل خارجياً</span>}
      </div>
      <div className="dd-maint-dates">
        {log.startedAt   && <span>▶️ بدأ: {new Date(log.startedAt).toLocaleDateString("ar-EG")}</span>}
        {log.completedAt && <span>✅ انتهى: {new Date(log.completedAt).toLocaleDateString("ar-EG")}</span>}
        <span>📆 فُتح: {new Date(log.createdAt).toLocaleDateString("ar-EG")}</span>
      </div>
      {log.notes && <p className="dd-maint-notes">{log.notes}</p>}
      {log.createdBy && (
        <p className="dd-maint-by">
          👤 أنشأ بواسطة: {log.createdBy.fullName || log.createdBy.username}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MOVEMENT CARD
══════════════════════════════════════════════ */
function MovementCard({ movement }) {
  const typeMap = {
    TRANSFER:                  { icon: "🔁", label: "نقل",               cls: "dd-mv--blue" },
    SENT_TO_MAINTENANCE:       { icon: "📤", label: "أُرسل للصيانة",     cls: "dd-mv--warn" },
    RETURNED_FROM_MAINTENANCE: { icon: "📥", label: "عاد من الصيانة",    cls: "dd-mv--ok"   },
    RELOCATED:                 { icon: "📌", label: "إعادة تموضع",       cls: "dd-mv--red"  },
  };
  const t = typeMap[movement.movementType] || { icon: "🔄", label: movement.movementType, cls: "" };

  return (
    <div className={`dd-mv-card ${t.cls}`}>
      <div className="dd-mv-icon">{t.icon}</div>
      <div className="dd-mv-body">
        <div className="dd-mv-top">
          <span className="dd-mv-label">{t.label}</span>
          <span className="dd-mv-date">
            {new Date(movement.movedAt).toLocaleDateString("ar-EG")}
          </span>
        </div>
        {(movement.fromText || movement.toText) && (
          <p className="dd-mv-route">
            {movement.fromText && <span>من: {movement.fromText}</span>}
            {movement.fromText && movement.toText && <span className="dd-mv-arrow"> → </span>}
            {movement.toText && <span>إلى: {movement.toText}</span>}
          </p>
        )}
        {movement.reason && <p className="dd-mv-reason">{movement.reason}</p>}
        {movement.movedBy && (
          <p className="dd-mv-by">
            👤 {movement.movedBy.fullName || movement.movedBy.username}
          </p>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   STATUS HISTORY CARD
══════════════════════════════════════════════ */
function StatusHistoryCard({ entry }) {
  return (
    <div className="dd-hist-card">
      <div className="dd-hist-dot" />
      <div className="dd-hist-body">
        <div className="dd-hist-change">
          {entry.oldStatus && (
            <>
              <StatusBadge status={entry.oldStatus} />
              <span className="dd-hist-arrow">→</span>
            </>
          )}
          <StatusBadge status={entry.newStatus} />
        </div>
        <p className="dd-hist-meta">
          👤 {entry.changedBy?.fullName || entry.changedBy?.username || "—"}
          &nbsp;·&nbsp;
          📅 {new Date(entry.changedAt).toLocaleString("ar-EG")}
        </p>
        {entry.note && <p className="dd-hist-note">{entry.note}</p>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   EMPTY
══════════════════════════════════════════════ */
function Empty({ text }) {
  return (
    <div className="dp-empty">
      <div className="dp-empty-icon">📭</div>
      <p>{text}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN DETAIL PAGE
══════════════════════════════════════════════ */
export function DevicesDetailPage({ device, onBack }) {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState("info");

  if (!device) return null;

  const isRtl = lang === "ar";

  const lastInspection = device.inspections?.[0];

  const tabs = [
    { id: "info",      icon: "💡", label: "معلومات الجهاز" },
    { id: "inspections", icon: "🔍", label: `الفحوصات (${device.inspections?.length || 0})` },
    { id: "maintenance", icon: "🛠", label: `الصيانة (${device.maintenanceLogs?.length || 0})` },
    { id: "movements",   icon: "🔄", label: `الحركات (${device.movements?.length || 0})` },
    { id: "history",     icon: "📋", label: "سجل الحالة" },
  ];

  return (
    <div className="dp-root" dir={isRtl ? "rtl" : "ltr"}>

      {/* ══ HERO HEADER ══ */}
      <div className="dd-hero">
        <button className="dp-back-btn dd-back" onClick={onBack}>
          {isRtl ? "→ رجوع" : "← Back"}
        </button>

        <div className="dd-hero-body">
          {/* Avatar + title */}
          <div className="dd-hero-left">
            <div className="dd-hero-avatar">🔧</div>
            <div>
              <div className="dd-hero-title-row">
                <h1 className="dd-hero-name">{device.deviceName}</h1>
                <StatusBadge status={device.currentStatus} />
              </div>
              <div className="dd-hero-meta">
                <span>🏷 {device.deviceCode}</span>
                {device.barcode    && <span>📊 {device.barcode}</span>}
                {device.ipAddress  && <span>🌐 {device.ipAddress}</span>}
                {device.location?.cluster  && <span>📍 {device.location.cluster}</span>}
                {device.location?.building && <span>🏢 {device.location.building?.trim()}</span>}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="dd-hero-actions">
            <button className="dd-btn-primary">✏️ تعديل</button>
            <button className="dd-btn-secondary">🖨 طباعة</button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dd-quick-stats">
          {[
            { icon: "🔍", label: "فحوصات",  value: device.inspections?.length    || 0 },
            { icon: "🛠", label: "صيانة",   value: device.maintenanceLogs?.length || 0 },
            { icon: "🔄", label: "حركات",   value: device.movements?.length       || 0 },
            {
              icon: "📅",
              label: "آخر فحص",
              value: lastInspection
                ? new Date(lastInspection.inspectedAt).toLocaleDateString("ar-EG")
                : "—",
            },
            {
              icon: "👷",
              label: "آخر فني",
              value: lastInspection?.technician?.fullName
                  || lastInspection?.technician?.username
                  || "—",
            },
          ].map((s) => (
            <div key={s.label} className="dd-qs-card">
              <span className="dd-qs-icon">{s.icon}</span>
              <span className="dd-qs-val">{s.value}</span>
              <span className="dd-qs-lbl">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ TABS ══ */}
      <div className="dd-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`dd-tab${activeTab === t.id ? " dd-tab--active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div className="dd-tab-content">

        {/* ── INFO TAB ── */}
        {activeTab === "info" && (
          <div className="dd-info-grid">

            {/* Device Data */}
            <div className="dd-info-card">
              <h3 className="dd-info-card-title">🔧 بيانات الجهاز</h3>
              <InfoRow label="كود الجهاز"    value={device.deviceCode}   mono accent />
              <InfoRow label="الباركود"       value={device.barcode}      mono />
              <InfoRow label="الرقم التسلسلي" value={device.serialNumber} mono />
              <InfoRow label="عنوان IP"       value={device.ipAddress}    mono />
              <InfoRow label="الفيرموير"      value={device.firmware} />
              <InfoRow label="الشركة المصنعة" value={device.manufacturer} />
              <InfoRow label="رقم الموديل"    value={device.modelNumber} />
              <InfoRow label="نوع الجهاز"     value={device.deviceType?.name} />
              <InfoRow label="تاريخ Excel"    value={device.excelDate} />
              <InfoRow label="حالة Excel"     value={device.excelStatus} />
              <InfoRow label="تاريخ التثبيت"  value={device.installDate ? new Date(device.installDate).toLocaleDateString("ar-EG") : null} />
              <InfoRow label="آخر فحص"        value={device.lastInspectionAt ? new Date(device.lastInspectionAt).toLocaleDateString("ar-EG") : null} />
              {device.notes && <InfoRow label="ملاحظات" value={device.notes} />}
            </div>

            {/* Location Data */}
            <div className="dd-info-card">
              <h3 className="dd-info-card-title">📍 بيانات الموقع</h3>
              <InfoRow label="الكلاستر"    value={device.location?.cluster}   accent />
              <InfoRow label="المبنى"       value={device.location?.building?.trim()} />
              <InfoRow label="الزون"        value={device.location?.zone} />
              <InfoRow label="النوع"        value={device.location?.type} />
              <InfoRow label="الممر (Lane)" value={device.location?.lane} />
              <InfoRow label="الاتجاه"      value={device.location?.direction} />
              <InfoRow label="معرف Excel"   value={device.location?.excelId} mono />
            </div>

            {/* Last Inspection Summary */}
            {lastInspection && (
              <div className="dd-info-card dd-info-card--wide">
                <h3 className="dd-info-card-title">🔍 آخر فحص — ملخص</h3>
                <div className="dd-last-insp">
                  <div className="dd-tech-row">
                    <div className="dd-tech-avatar">👷</div>
                    <div className="dd-tech-info">
                      <p className="dd-tech-name">
                        {lastInspection.technician?.fullName || lastInspection.technician?.username || "—"}
                      </p>
                      <p className="dd-tech-role">
                        {lastInspection.technician?.jobTitle || "تقني"}
                        {lastInspection.technician?.phone && <> · {lastInspection.technician.phone}</>}
                        {lastInspection.technician?.region && <> · {lastInspection.technician.region}</>}
                      </p>
                    </div>
                    <StatusBadge status={lastInspection.inspectionStatus} />
                  </div>
                  <div className="dd-insp-meta">
                    <span>📅 {new Date(lastInspection.inspectedAt).toLocaleString("ar-EG")}</span>
                    {lastInspection.locationText && <span>📍 {lastInspection.locationText}</span>}
                  </div>
                  {lastInspection.notes && (
                    <p className="dd-insp-notes">{lastInspection.notes}</p>
                  )}
                  {lastInspection.images?.length > 0 && (
                    <div className="dd-insp-images">
                      {lastInspection.images.map((img) => (
                        <a key={img.id} href={img.imageUrl} target="_blank" rel="noreferrer" className="dd-img-thumb">
                          <img src={img.imageUrl} alt="last inspection" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── INSPECTIONS TAB ── */}
        {activeTab === "inspections" && (
          <div className="dd-tab-list">
            {device.inspections?.length > 0 ? (
              device.inspections.map((insp) => (
                <InspectionCard key={insp.id} inspection={insp} />
              ))
            ) : (
              <Empty text="لا يوجد سجل فحص لهذا الجهاز" />
            )}
          </div>
        )}

        {/* ── MAINTENANCE TAB ── */}
        {activeTab === "maintenance" && (
          <div className="dd-tab-list">
            {device.maintenanceLogs?.length > 0 ? (
              device.maintenanceLogs.map((log) => (
                <MaintenanceCard key={log.id} log={log} />
              ))
            ) : (
              <Empty text="لا توجد سجلات صيانة" />
            )}
          </div>
        )}

        {/* ── MOVEMENTS TAB ── */}
        {activeTab === "movements" && (
          <div className="dd-tab-list">
            {device.movements?.length > 0 ? (
              device.movements.map((mv) => (
                <MovementCard key={mv.id} movement={mv} />
              ))
            ) : (
              <Empty text="لا توجد حركات مسجلة" />
            )}
          </div>
        )}

        {/* ── STATUS HISTORY TAB ── */}
        {activeTab === "history" && (
          <div className="dd-timeline">
            {device.statusHistory?.length > 0 ? (
              device.statusHistory.map((entry) => (
                <StatusHistoryCard key={entry.id} entry={entry} />
              ))
            ) : (
              <Empty text="لا يوجد سجل تغييرات للحالة" />
            )}
          </div>
        )}

      </div>
    </div>
  );
}
