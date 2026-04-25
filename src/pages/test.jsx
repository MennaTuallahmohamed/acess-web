import React, { useMemo, useState } from "react";

const deviceTypesByCategory = {
  "Access Control": [
    "Morpho Reader",
    "Morpho Controller",
    "Morpho Terminal",
    "Morpho Biometric",
    "Morpho MA500",
    "Morpho MorphoWave",
  ],
  "Gates": [
    "Barrier Gate",
    "Turnstile",
    "Sliding Gate",
    "Swing Gate",
  ],
};

const allDeviceTypes = Object.values(deviceTypesByCategory).flat();

const initialIssues = [
  {
    id: 1,
    issueCode: "ISS-001",
    solvedIssueId: null,
    category: "Access Control",
    deviceType: "Morpho Reader",
    issueTitle: "Device not responding",
    issueDescription:
      "The controller is powered but does not respond to commands or network requests.",
    severity: "High",
    status: "Active",
    steps: [
      "Check main power supply and adapter voltage.",
      "Inspect all controller wiring connections.",
      "Restart the controller and wait 60 seconds.",
      "Verify network cable and switch port status.",
      "Check status LEDs and document their behavior.",
    ],
  },
  {
    id: 2,
    issueCode: "ISS-002",
    solvedIssueId: null,
    category: "Access Control",
    deviceType: "Morpho Reader",
    issueTitle: "Card not detected",
    issueDescription:
      "The card reader does not read valid access cards consistently.",
    severity: "Medium",
    status: "Active",
    steps: [
      "Clean the reader surface carefully.",
      "Test with another valid access card.",
      "Inspect reader wiring and terminal connection.",
      "Check reader power and communication signal.",
      "Replace the reader if issue persists.",
    ],
  },
  {
    id: 3,
    issueCode: "ISS-003",
    solvedIssueId: null,
    category: "Gates",
    deviceType: "Barrier Gate",
    issueTitle: "Gate not opening",
    issueDescription:
      "Barrier arm remains closed even after receiving an open command.",
    severity: "High",
    status: "Active",
    steps: [
      "Confirm incoming power to gate controller.",
      "Inspect motor fuse and internal wiring.",
      "Check safety sensor alignment and cleanliness.",
      "Test open command from controller manually.",
      "Inspect motor condition and gearbox movement.",
    ],
  },
  {
    id: 4,
    issueCode: "ISS-004",
    solvedIssueId: null,
    category: "Gates",
    deviceType: "Turnstile",
    issueTitle: "Arm rotation blocked",
    issueDescription:
      "Turnstile arms cannot rotate freely or lock unexpectedly during use.",
    severity: "Medium",
    status: "Inactive",
    steps: [
      "Inspect mechanical blockage around arm housing.",
      "Check internal locking mechanism.",
      "Verify controller signal to release arm.",
      "Lubricate moving mechanical parts safely.",
      "Test arm movement after reset.",
    ],
  },
];

const categoryOptions = ["All", "Access Control", "Gates"];

const emptyForm = {
  issueCode: "",
  solvedIssueId: null,
  category: "Access Control",
  deviceType: "Morpho Reader",
  issueTitle: "",
  issueDescription: "",
  severity: "Medium",
  status: "Active",
  steps: [""],
};

export default function TroubleshootingManagement() {
  const [issues, setIssues] = useState(initialIssues);
  const [selectedId, setSelectedId] = useState(initialIssues[0]?.id || null);

  const [categoryFilter, setCategoryFilter] = useState("All");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Device types available in filter based on selected category
  const filterDeviceOptions = useMemo(() => {
    if (categoryFilter === "All") return ["All", ...allDeviceTypes];
    return ["All", ...(deviceTypesByCategory[categoryFilter] ?? [])];
  }, [categoryFilter]);

  // Device types available in modal form based on selected category
  const formDeviceOptions = useMemo(() => {
    return deviceTypesByCategory[form.category] ?? [];
  }, [form.category]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchCategory =
        categoryFilter === "All" || issue.category === categoryFilter;
      const matchDeviceType =
        deviceTypeFilter === "All" || issue.deviceType === deviceTypeFilter;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        issue.issueTitle.toLowerCase().includes(q) ||
        issue.deviceType.toLowerCase().includes(q) ||
        issue.category.toLowerCase().includes(q) ||
        issue.issueDescription.toLowerCase().includes(q) ||
        (issue.issueCode && issue.issueCode.toLowerCase().includes(q));
      return matchCategory && matchDeviceType && matchSearch;
    });
  }, [issues, categoryFilter, deviceTypeFilter, search]);

  const selectedIssue =
    filteredIssues.find((item) => item.id === selectedId) ||
    filteredIssues[0] ||
    null;

  const stats = useMemo(() => {
    const categoriesCount = new Set(issues.map((i) => i.category)).size;
    const deviceTypesCount = new Set(issues.map((i) => i.deviceType)).size;
    const activeIssuesCount = issues.filter((i) => i.status === "Active").length;
    const totalStepsCount = issues.reduce((acc, cur) => acc + cur.steps.length, 0);
    return { categoriesCount, deviceTypesCount, activeIssuesCount, totalStepsCount };
  }, [issues]);

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val);
    setDeviceTypeFilter("All");
  };

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (issue) => {
    setEditingId(issue.id);
    setForm({
      issueCode: issue.issueCode || "",
      solvedIssueId: issue.solvedIssueId ?? null,
      category: issue.category,
      deviceType: issue.deviceType,
      issueTitle: issue.issueTitle,
      issueDescription: issue.issueDescription,
      severity: issue.severity,
      status: issue.status,
      steps: issue.steps.length ? issue.steps : [""],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const updateForm = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // When category changes, reset deviceType to first option in new category
      if (key === "category") {
        const opts = deviceTypesByCategory[value] ?? [];
        next.deviceType = opts[0] ?? "";
      }
      return next;
    });
  };

  const updateStep = (index, value) => {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = value;
      return { ...prev, steps: nextSteps };
    });
  };

  const addStep = () => {
    setForm((prev) => ({ ...prev, steps: [...prev.steps, ""] }));
  };

  const removeStep = (index) => {
    setForm((prev) => {
      if (prev.steps.length === 1) return prev;
      const nextSteps = prev.steps.filter((_, i) => i !== index);
      return { ...prev, steps: nextSteps };
    });
  };

  const handleSave = () => {
    const cleanedSteps = form.steps.map((s) => s.trim()).filter(Boolean);
    const payload = {
      issueCode: form.issueCode.trim(),
      solvedIssueId: form.solvedIssueId || null,
      category: form.category,
      deviceType: form.deviceType,
      issueTitle: form.issueTitle.trim(),
      issueDescription: form.issueDescription.trim(),
      severity: form.severity,
      status: form.status,
      steps: cleanedSteps.length ? cleanedSteps : ["No troubleshooting steps yet."],
    };
    if (!payload.issueTitle) return;

    if (editingId) {
      const updated = issues.map((item) =>
        item.id === editingId ? { ...item, ...payload } : item
      );
      setIssues(updated);
      setSelectedId(editingId);
    } else {
      const newIssue = { id: Date.now(), ...payload };
      setIssues([newIssue, ...issues]);
      setSelectedId(newIssue.id);
    }
    closeModal();
  };

  const handleDelete = (id) => {
    const next = issues.filter((item) => item.id !== id);
    setIssues(next);
    if (selectedId === id) setSelectedId(next[0]?.id || null);
  };

  const getSeverityClass = (severity) => {
    if (severity === "High") return "severity high";
    if (severity === "Medium") return "severity medium";
    return "severity low";
  };

  const getStatusClass = (status) =>
    status === "Active" ? "status active" : "status inactive";

  const getSolvedIssueLabel = (solvedId) => {
    if (!solvedId) return null;
    const found = issues.find((i) => String(i.id) === String(solvedId));
    return found ? `${found.issueCode || `#${found.id}`} — ${found.issueTitle}` : null;
  };

  return (
    <div className="trouble-page">
      <style>{`
        * { box-sizing: border-box; }

        .trouble-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top right, rgba(99,102,241,0.14), transparent 24%),
            radial-gradient(circle at bottom left, rgba(59,130,246,0.12), transparent 24%),
            linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
          padding: 24px;
          font-family: Inter, Arial, sans-serif;
          color: #0f172a;
        }

        .trouble-shell {
          max-width: 1450px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 15px 40px rgba(15,23,42,0.08);
        }

        .hero-left h1 { margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.04em; }
        .hero-left p { margin: 10px 0 0; color: #475569; font-size: 14px; line-height: 1.7; max-width: 760px; }

        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn {
          border: none; outline: none; cursor: pointer;
          padding: 12px 18px; border-radius: 14px;
          font-weight: 700; font-size: 14px; transition: 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: #fff;
          box-shadow: 0 10px 24px rgba(37,99,235,0.25);
        }
        .btn-primary:hover { transform: translateY(-1px); opacity: 0.96; }

        .btn-light {
          background: #fff; color: #0f172a;
          border: 1px solid rgba(148,163,184,0.22);
        }
        .btn-light:hover { background: #f8fafc; }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .stat-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
        }
        .stat-label { color: #64748b; font-size: 13px; font-weight: 700; margin-bottom: 10px; }
        .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }

        .filters-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
        }

        .filters-row {
          display: grid;
          grid-template-columns: 1.1fr 1fr 1fr 1.2fr;
          gap: 14px;
          align-items: end;
        }

        .field { display: flex; flex-direction: column; gap: 8px; }
        .field label { font-size: 13px; font-weight: 700; color: #334155; }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #dbe3f0;
          background: #fff;
          padding: 12px 14px;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          transition: 0.2s ease;
        }

        .field textarea { min-height: 96px; resize: vertical; }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.10);
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.05fr 1.35fr;
          gap: 20px;
          align-items: start;
        }

        .issues-panel,
        .details-panel {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 24px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
          overflow: hidden;
        }

        .panel-head {
          padding: 18px 20px;
          border-bottom: 1px solid rgba(226,232,240,0.9);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: linear-gradient(180deg, rgba(248,250,252,0.9), rgba(255,255,255,0.9));
        }
        .panel-head h3 { margin: 0; font-size: 18px; font-weight: 800; }
        .panel-sub { font-size: 13px; color: #64748b; margin-top: 4px; }

        .issues-list {
          max-height: 720px;
          overflow: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-card {
          border: 1px solid rgba(203,213,225,0.85);
          border-radius: 18px;
          padding: 16px;
          cursor: pointer;
          transition: 0.2s ease;
          background: #fff;
        }
        .issue-card:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(15,23,42,0.08); }
        .issue-card.selected {
          border-color: #4f46e5;
          box-shadow: 0 12px 28px rgba(79,70,229,0.16);
          background: linear-gradient(180deg, #ffffff, #f7f9ff);
        }

        .issue-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
        .issue-title { margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; }

        .issue-code-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          background: #eef2ff;
          color: #4338ca;
          border: 1px solid #c7d2fe;
          white-space: nowrap;
          margin-bottom: 6px;
        }

        .issue-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }

        .tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          border: 1px solid transparent;
        }

        .tag.gray { background: #f1f5f9; color: #334155; border-color: #e2e8f0; }

        .severity.high { background: rgba(239,68,68,0.10); color: #b91c1c; border-color: rgba(239,68,68,0.20); }
        .severity.medium { background: rgba(245,158,11,0.12); color: #b45309; border-color: rgba(245,158,11,0.22); }
        .severity.low { background: rgba(16,185,129,0.10); color: #047857; border-color: rgba(16,185,129,0.18); }

        .status.active { background: rgba(59,130,246,0.10); color: #1d4ed8; border-color: rgba(59,130,246,0.22); }
        .status.inactive { background: rgba(100,116,139,0.10); color: #475569; border-color: rgba(100,116,139,0.18); }

        .issue-desc { margin: 12px 0 0; font-size: 13px; line-height: 1.7; color: #64748b; }

        .issue-actions { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }

        .mini-btn { border: none; cursor: pointer; border-radius: 12px; padding: 8px 12px; font-size: 12px; font-weight: 700; }
        .mini-btn.edit { background: #eef2ff; color: #4338ca; }
        .mini-btn.delete { background: #fef2f2; color: #b91c1c; }

        .details-body { padding: 22px; }
        .details-empty { padding: 50px 24px; text-align: center; color: #64748b; }

        .detail-title-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .detail-title { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.03em; }
        .detail-desc { margin: 14px 0 22px; color: #475569; line-height: 1.8; font-size: 14px; }

        .solved-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 18px;
          font-size: 13px;
          color: #166534;
          font-weight: 600;
        }

        .section-title { margin: 0 0 14px; font-size: 16px; font-weight: 800; color: #0f172a; }

        .steps-list { display: flex; flex-direction: column; gap: 12px; }

        .step-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: #f8fbff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 14px;
        }

        .step-index {
          width: 34px; min-width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: #fff; font-weight: 800; font-size: 13px;
          box-shadow: 0 8px 16px rgba(37,99,235,0.22);
        }

        .step-text { font-size: 14px; line-height: 1.7; color: #1e293b; }

        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; z-index: 999;
          backdrop-filter: blur(6px);
        }

        .modal-card {
          width: 100%; max-width: 920px; max-height: 92vh; overflow: auto;
          background: #fff; border-radius: 28px;
          box-shadow: 0 24px 70px rgba(15,23,42,0.22);
          border: 1px solid rgba(226,232,240,0.9);
        }

        .modal-head {
          padding: 22px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        .modal-head h2 { margin: 0; font-size: 22px; font-weight: 800; }

        .modal-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .full-span { grid-column: 1 / -1; }

        .steps-editor { display: flex; flex-direction: column; gap: 10px; }

        .step-editor-row {
          display: grid;
          grid-template-columns: 42px 1fr 48px;
          gap: 10px;
          align-items: center;
        }

        .step-badge {
          width: 42px; height: 42px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          background: #eef2ff; color: #4338ca; font-weight: 800;
          border: 1px solid #c7d2fe;
        }

        .icon-btn {
          border: none; cursor: pointer; border-radius: 14px;
          width: 48px; height: 44px; font-size: 18px; font-weight: 800;
          background: #fef2f2; color: #b91c1c;
        }

        .add-step-btn {
          border: 1px dashed #94a3b8;
          background: #f8fafc;
          color: #334155;
          border-radius: 14px;
          padding: 12px; font-weight: 700; cursor: pointer;
        }

        .modal-actions {
          padding: 18px 24px 24px;
          display: flex; justify-content: flex-end; gap: 12px;
        }

        .empty-list { padding: 40px 18px; text-align: center; color: #64748b; }

        .field-hint { font-size: 11px; color: #94a3b8; margin-top: 4px; }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .hero { flex-direction: column; align-items: stretch; }
          .filters-row { grid-template-columns: 1fr; }
          .modal-body { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .trouble-page { padding: 14px; }
          .stats-grid { grid-template-columns: 1fr; }
          .detail-title-row { flex-direction: column; }
          .step-editor-row { grid-template-columns: 1fr; }
          .step-badge, .icon-btn { width: 100%; }
        }
      `}</style>

      <div className="trouble-shell">
        {/* Hero */}
        <div className="hero">
          <div className="hero-left">
            <h1>Troubleshooting Management</h1>
            <p>
              Manage maintenance issues, device-specific troubleshooting steps, and
              solution workflows for technicians. Each issue has a unique ID and can
              reference a solving issue for linked resolution tracking.
            </p>
          </div>
          <div className="hero-actions">
            <button className="btn btn-light">Export Preview</button>
            <button className="btn btn-primary" onClick={openAddModal}>+ Add New Issue</button>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Categories</div>
            <div className="stat-value">{stats.categoriesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Device Types</div>
            <div className="stat-value">{stats.deviceTypesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Issues</div>
            <div className="stat-value">{stats.activeIssuesCount}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Troubleshooting Steps</div>
            <div className="stat-value">{stats.totalStepsCount}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-row">
            <div className="field">
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => handleCategoryFilterChange(e.target.value)}
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Device Type</label>
              <select
                value={deviceTypeFilter}
                onChange={(e) => setDeviceTypeFilter(e.target.value)}
              >
                {filterDeviceOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by issue, ID, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Quick Action</label>
              <button className="btn btn-primary" onClick={openAddModal}>
                Create Issue Template
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-grid">
          {/* Issues List */}
          <div className="issues-panel">
            <div className="panel-head">
              <div>
                <h3>Issues Library</h3>
                <div className="panel-sub">
                  {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""} found
                </div>
              </div>
            </div>

            <div className="issues-list">
              {filteredIssues.length === 0 ? (
                <div className="empty-list">No issues found for the selected filters.</div>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`issue-card ${selectedIssue?.id === issue.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(issue.id)}
                  >
                    {issue.issueCode && (
                      <div className="issue-code-badge">{issue.issueCode}</div>
                    )}
                    <div className="issue-top">
                      <h4 className="issue-title">{issue.issueTitle}</h4>
                      <span className={getStatusClass(issue.status)}>{issue.status}</span>
                    </div>

                    <div className="issue-meta">
                      <span className="tag gray">{issue.category}</span>
                      <span className="tag gray">{issue.deviceType}</span>
                      <span className={getSeverityClass(issue.severity)}>{issue.severity}</span>
                    </div>

                    <p className="issue-desc">{issue.issueDescription}</p>

                    <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="mini-btn edit" onClick={() => openEditModal(issue)}>Edit</button>
                      <button className="mini-btn delete" onClick={() => handleDelete(issue.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="details-panel">
            <div className="panel-head">
              <div>
                <h3>Issue Details</h3>
                <div className="panel-sub">Selected issue troubleshooting flow</div>
              </div>
            </div>

            {!selectedIssue ? (
              <div className="details-empty">Select an issue to preview its details.</div>
            ) : (
              <div className="details-body">
                {selectedIssue.issueCode && (
                  <div style={{ marginBottom: 8 }}>
                    <span className="issue-code-badge" style={{ fontSize: 13 }}>
                      {selectedIssue.issueCode}
                    </span>
                  </div>
                )}

                <div className="detail-title-row">
                  <div>
                    <h2 className="detail-title">{selectedIssue.issueTitle}</h2>
                    <div className="issue-meta">
                      <span className="tag gray">{selectedIssue.category}</span>
                      <span className="tag gray">{selectedIssue.deviceType}</span>
                      <span className={getSeverityClass(selectedIssue.severity)}>{selectedIssue.severity}</span>
                      <span className={getStatusClass(selectedIssue.status)}>{selectedIssue.status}</span>
                    </div>
                  </div>
                  <button className="btn btn-light" onClick={() => openEditModal(selectedIssue)}>
                    Edit Issue
                  </button>
                </div>

                {selectedIssue.solvedIssueId && getSolvedIssueLabel(selectedIssue.solvedIssueId) && (
                  <div className="solved-banner">
                    <span>✓</span>
                    <span>
                      Solved by: <strong>{getSolvedIssueLabel(selectedIssue.solvedIssueId)}</strong>
                    </span>
                  </div>
                )}

                <p className="detail-desc">{selectedIssue.issueDescription}</p>

                <h4 className="section-title">Troubleshooting Steps</h4>
                <div className="steps-list">
                  {selectedIssue.steps.map((step, index) => (
                    <div className="step-item" key={`${selectedIssue.id}-step-${index}`}>
                      <div className="step-index">{index + 1}</div>
                      <div className="step-text">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingId ? "Edit Issue Template" : "Add New Issue Template"}</h2>
              <button className="btn btn-light" onClick={closeModal}>Close</button>
            </div>

            <div className="modal-body">
              {/* Issue Code */}
              <div className="field">
                <label>Issue ID</label>
                <input
                  type="text"
                  placeholder="e.g. ISS-005"
                  value={form.issueCode}
                  onChange={(e) => updateForm("issueCode", e.target.value)}
                />
                <div className="field-hint">Unique identifier for this issue</div>
              </div>

              {/* Solved Issue ID */}
              <div className="field">
                <label>Solved Issue ID</label>
                <select
                  value={form.solvedIssueId ?? ""}
                  onChange={(e) => updateForm("solvedIssueId", e.target.value || null)}
                >
                  <option value="">— None —</option>
                  {issues
                    .filter((i) => i.id !== editingId)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.issueCode ? `${i.issueCode} — ` : ""}{i.issueTitle}
                      </option>
                    ))}
                </select>
                <div className="field-hint">Link to the issue that resolves this one</div>
              </div>

              {/* Category */}
              <div className="field">
                <label>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateForm("category", e.target.value)}
                >
                  <option value="Access Control">Access Control</option>
                  <option value="Gates">Gates</option>
                </select>
              </div>

              {/* Device Type — filtered by category */}
              <div className="field">
                <label>Device Type</label>
                <select
                  value={form.deviceType}
                  onChange={(e) => updateForm("deviceType", e.target.value)}
                >
                  {formDeviceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="field-hint">Options filtered by selected category</div>
              </div>

              {/* Issue Title */}
              <div className="field full-span">
                <label>Issue Title</label>
                <input
                  type="text"
                  placeholder="Example: Gate not opening"
                  value={form.issueTitle}
                  onChange={(e) => updateForm("issueTitle", e.target.value)}
                />
              </div>

              {/* Issue Description */}
              <div className="field full-span">
                <label>Issue Description</label>
                <textarea
                  placeholder="Write a short explanation for the issue..."
                  value={form.issueDescription}
                  onChange={(e) => updateForm("issueDescription", e.target.value)}
                />
              </div>

              {/* Severity */}
              <div className="field">
                <label>Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => updateForm("severity", e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Status */}
              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Steps */}
              <div className="field full-span">
                <label>Troubleshooting Steps</label>
                <div className="steps-editor">
                  {form.steps.map((step, index) => (
                    <div className="step-editor-row" key={index}>
                      <div className="step-badge">{index + 1}</div>
                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step}
                        onChange={(e) => updateStep(index, e.target.value)}
                      />
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => removeStep(index)}
                        title="Remove step"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-step-btn" onClick={addStep}>
                    + Add Step
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-light" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editingId ? "Save Changes" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}