import { useState } from "react";
import { useLang } from "../context/LanguageContext";

export function TechniciansDetailPage({ technicians = [], onBack }) {
  const { lang } = useLang();
  const [selectedTech, setSelectedTech] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTechs = technicians.filter(t =>
    (t.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.phone?.includes(searchTerm))
  );

  if (selectedTech) {
    return (
      <div className="detail-view">
        <button onClick={() => setSelectedTech(null)} className="back-btn">
          ← {lang === "ar" ? "رجوع" : "Back"}
        </button>
        
        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-avatar">👷</div>
            <div className="detail-title-group">
              <h1>{selectedTech.fullName}</h1>
              <p>{selectedTech.specialization || "Technician"}</p>
            </div>
          </div>

          <div className="detail-grid">
            <div className="detail-row">
              <label>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</label>
              <p>{selectedTech.email || "N/A"}</p>
            </div>
            <div className="detail-row">
              <label>{lang === "ar" ? "الهاتف" : "Phone"}</label>
              <p>{selectedTech.phone || "N/A"}</p>
            </div>
            <div className="detail-row">
              <label>{lang === "ar" ? "الحالة" : "Status"}</label>
              <p>
                <span className={`status-badge ${selectedTech.isActive ? "active" : "inactive"}`}>
                  {selectedTech.isActive ? "🟢 Active" : "🔴 Inactive"}
                </span>
              </p>
            </div>
            <div className="detail-row">
              <label>{lang === "ar" ? "تاريخ التوظيف" : "Hire Date"}</label>
              <p>{new Date(selectedTech.hireDate || Date.now()).toLocaleDateString()}</p>
            </div>
            {selectedTech.address && (
              <div className="detail-row">
                <label>{lang === "ar" ? "العنوان" : "Address"}</label>
                <p>{selectedTech.address}</p>
              </div>
            )}
            {selectedTech.certifications && (
              <div className="detail-row">
                <label>{lang === "ar" ? "الشهادات" : "Certifications"}</label>
                <p>{selectedTech.certifications}</p>
              </div>
            )}
          </div>

          <div className="detail-actions">
            <button className="btn btn-primary">{lang === "ar" ? "تعديل" : "Edit"}</button>
            <button className="btn btn-secondary">{lang === "ar" ? "عرض المهام" : "View Tasks"}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-header">
        <h2>👷 {lang === "ar" ? "الفنيون" : "Technicians"} ({filteredTechs.length})</h2>
        <button onClick={onBack} className="back-btn">
          {lang === "ar" ? "رجوع للرئيسية" : "Back to Home"}
        </button>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder={lang === "ar" ? "ابحث عن فني..." : "Search technicians..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {filteredTechs.length > 0 ? (
        <div className="list-grid">
          {filteredTechs.map((tech) => (
            <div
              key={tech.id}
              className="list-card"
              onClick={() => setSelectedTech(tech)}
            >
              <div className="list-card-header">
                <div className="list-card-icon">👷</div>
                <span className={`status-badge ${tech.isActive ? "active" : "inactive"}`}>
                  {tech.isActive ? "🟢" : "🔴"}
                </span>
              </div>
              <h3>{tech.fullName}</h3>
              <p className="text-secondary">{tech.specialization || "Technician"}</p>
              <div className="list-card-footer">
                <span className="email-badge">{tech.email?.split("@")[0]}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>{lang === "ar" ? "لم يتم العثور على فنيين" : "No technicians found"}</p>
        </div>
      )}
    </div>
  );
}
