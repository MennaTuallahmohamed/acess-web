import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

/*
  ملاحظة:
  استخدمت IDs الحالية الموجودة عندك في الداتابيز:
  2   -> Reader
  4   -> Morpho md
  140 -> Argus 60

  لو اتغيرت IDs عندك بعدين، عدليها هنا فقط.
*/
const DEVICE_TYPE_OPTIONS = [
  { id: 1, name: "Access Control", categoryName: "Access Control" },
  { id: 2, name: "Reader", categoryName: "Access Control" },
  { id: 3, name: "Controller", categoryName: "Access Control" },
  { id: 4, name: "Morpho md", categoryName: "Access Control" },
  { id: 140, name: "Argus 60", categoryName: "Gates" },
];

const emptyForm = {
  issueCode: "",
  categoryId: "",
  deviceTypeId: "",
  issueTitle: "",
  issueDescription: "",
  severity: "HIGH",
  status: "ACTIVE",
  steps: [{ id: null, text: "", isRequired: true, status: "ACTIVE", solutionCode: "" }],
};

function toUiSeverity(value) {
  return String(value || "MEDIUM").toUpperCase();
}

function toUiStatus(value) {
  return String(value || "ACTIVE").toUpperCase();
}

function severityLabel(value) {
  const v = toUiSeverity(value);
  if (v === "CRITICAL") return "Critical";
  if (v === "HIGH") return "High";
  if (v === "LOW") return "Low";
  return "Medium";
}

function statusLabel(value) {
  return toUiStatus(value) === "ACTIVE" ? "Active" : "Inactive";
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export default function TroubleshootingManagement() {
  const [issues, setIssues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [issuesData, categoriesData] = await Promise.all([
        apiRequest("/issues"),
        apiRequest("/issues/categories"),
      ]);

      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      const firstId =
        (Array.isArray(issuesData) && issuesData[0]?.id) || null;

      setSelectedId((prev) => prev ?? firstId);
    } catch (error) {
      setPageError(error.message || "Failed to load troubleshooting data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [String(c.id), c]));
  }, [categories]);

  const filterDeviceOptions = useMemo(() => {
    if (categoryFilter === "all") return DEVICE_TYPE_OPTIONS;
    const selectedCategory = categoryMap.get(String(categoryFilter));
    if (!selectedCategory) return [];
    return DEVICE_TYPE_OPTIONS.filter(
      (item) => item.categoryName === selectedCategory.name
    );
  }, [categoryFilter, categoryMap]);

  const formDeviceOptions = useMemo(() => {
    const selectedCategory = categoryMap.get(String(form.categoryId));
    if (!selectedCategory) return [];
    return DEVICE_TYPE_OPTIONS.filter(
      (item) => item.categoryName === selectedCategory.name
    );
  }, [form.categoryId, categoryMap]);

  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const matchesCategory =
        categoryFilter === "all" || String(issue.categoryId) === String(categoryFilter);

      const matchesDeviceType =
        deviceTypeFilter === "all" || String(issue.deviceTypeId) === String(deviceTypeFilter);

      const matchesSearch =
        !q ||
        String(issue.issueCode || "").toLowerCase().includes(q) ||
        String(issue.title || "").toLowerCase().includes(q) ||
        String(issue.description || "").toLowerCase().includes(q) ||
        String(issue.category?.name || "").toLowerCase().includes(q) ||
        String(issue.deviceType?.name || "").toLowerCase().includes(q);

      return matchesCategory && matchesDeviceType && matchesSearch;
    });
  }, [issues, categoryFilter, deviceTypeFilter, search]);

  const selectedIssue =
    filteredIssues.find((item) => item.id === selectedId) ||
    issues.find((item) => item.id === selectedId) ||
    filteredIssues[0] ||
    null;

  useEffect(() => {
    if (!selectedIssue && filteredIssues[0]) {
      setSelectedId(filteredIssues[0].id);
    }
  }, [selectedIssue, filteredIssues]);

  const stats = useMemo(() => {
    const categoriesCount = new Set(issues.map((i) => i.categoryId)).size;
    const deviceTypesCount = new Set(issues.map((i) => i.deviceTypeId)).size;
    const activeIssuesCount = issues.filter(
      (i) => toUiStatus(i.status) === "ACTIVE"
    ).length;
    const totalStepsCount = issues.reduce(
      (acc, cur) => acc + (Array.isArray(cur.solutions) ? cur.solutions.length : 0),
      0
    );

    return {
      categoriesCount,
      deviceTypesCount,
      activeIssuesCount,
      totalStepsCount,
    };
  }, [issues]);

  const openAddModal = () => {
    const firstCategoryId = categories[0]?.id || "";
    const firstCategory = categories[0]?.name || "";
    const firstDeviceType =
      DEVICE_TYPE_OPTIONS.find((item) => item.categoryName === firstCategory)?.id || "";

    setEditingIssue(null);
    setForm({
      ...emptyForm,
      categoryId: firstCategoryId,
      deviceTypeId: firstDeviceType,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (issue) => {
    setEditingIssue(issue);
    setForm({
      issueCode: issue.issueCode || "",
      categoryId: issue.categoryId || "",
      deviceTypeId: issue.deviceTypeId || "",
      issueTitle: issue.title || "",
      issueDescription: issue.description || "",
      severity: toUiSeverity(issue.severity),
      status: toUiStatus(issue.status),
      steps:
        issue.solutions?.length > 0
          ? issue.solutions
              .slice()
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step) => ({
                id: step.id,
                text: step.title || "",
                isRequired: Boolean(step.isRequired),
                status: toUiStatus(step.status),
                solutionCode: step.solutionCode || "",
              }))
          : [{ id: null, text: "", isRequired: true, status: "ACTIVE", solutionCode: "" }],
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingIssue(null);
    setForm(emptyForm);
  };

  const updateForm = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "categoryId") {
        const selectedCategory = categoryMap.get(String(value));
        const matchingDeviceType =
          DEVICE_TYPE_OPTIONS.find(
            (item) => item.categoryName === selectedCategory?.name
          )?.id || "";
        next.deviceTypeId = matchingDeviceType;
      }

      return next;
    });
  };

  const updateStep = (index, patch) => {
    setForm((prev) => {
      const nextSteps = [...prev.steps];
      nextSteps[index] = { ...nextSteps[index], ...patch };
      return { ...prev, steps: nextSteps };
    });
  };

  const addStep = () => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: null, text: "", isRequired: true, status: "ACTIVE", solutionCode: "" },
      ],
    }));
  };

  const removeStep = (index) => {
    setForm((prev) => {
      if (prev.steps.length === 1) return prev;
      return {
        ...prev,
        steps: prev.steps.filter((_, i) => i !== index),
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setPageError("");

      const cleanedSteps = form.steps
        .map((step, index) => ({
          ...step,
          text: step.text.trim(),
          stepOrder: index + 1,
        }))
        .filter((step) => step.text);

      if (!form.issueCode.trim()) {
        throw new Error("Issue ID is required.");
      }

      if (!form.issueTitle.trim()) {
        throw new Error("Issue title is required.");
      }

      if (!form.categoryId) {
        throw new Error("Category is required.");
      }

      if (!form.deviceTypeId) {
        throw new Error("Device type is required.");
      }

      const issuePayload = {
        issueCode: form.issueCode.trim(),
        title: form.issueTitle.trim(),
        description: form.issueDescription.trim(),
        severity: toUiSeverity(form.severity),
        status: toUiStatus(form.status),
        categoryId: Number(form.categoryId),
        deviceTypeId: Number(form.deviceTypeId),
      };

      let issueId = editingIssue?.id;

      if (editingIssue) {
        await apiRequest(`/issues/${editingIssue.id}`, {
          method: "PATCH",
          body: JSON.stringify(issuePayload),
        });
      } else {
        const createdIssue = await apiRequest("/issues", {
          method: "POST",
          body: JSON.stringify(issuePayload),
        });
        issueId = createdIssue.id;
      }

      if (!issueId) {
        throw new Error("Issue ID could not be resolved.");
      }

      const existingSolutions = editingIssue?.solutions || [];
      const existingIds = new Set(existingSolutions.map((s) => s.id));
      const keptIds = new Set();

      for (const step of cleanedSteps) {
        const payload = {
          issueId,
          solutionCode:
            step.solutionCode?.trim() ||
            `${form.issueCode.trim()}-STEP-${step.stepOrder}`,
          title: step.text,
          description: step.text,
          stepOrder: step.stepOrder,
          isRequired: Boolean(step.isRequired),
          status: toUiStatus(step.status),
        };

        if (step.id) {
          keptIds.add(step.id);
          await apiRequest(`/issues/solutions/${step.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        } else {
          const createdStep = await apiRequest("/issues/solutions", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          if (createdStep?.id) keptIds.add(createdStep.id);
        }
      }

      for (const oldStep of existingSolutions) {
        if (existingIds.has(oldStep.id) && !keptIds.has(oldStep.id)) {
          await apiRequest(`/issues/solutions/${oldStep.id}`, {
            method: "DELETE",
          });
        }
      }

      await loadData();
      setSelectedId(issueId);
      closeModal();
    } catch (error) {
      setPageError(error.message || "Failed to save issue.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteIssue = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this issue?"
    );
    if (!confirmDelete) return;

    try {
      setSaving(true);
      await apiRequest(`/issues/${id}`, { method: "DELETE" });
      await loadData();

      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (error) {
      setPageError(error.message || "Failed to delete issue.");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityClass = (severity) => {
    const value = toUiSeverity(severity);
    if (value === "CRITICAL") return "severity critical";
    if (value === "HIGH") return "severity high";
    if (value === "LOW") return "severity low";
    return "severity medium";
  };

  const getStatusClass = (status) =>
    toUiStatus(status) === "ACTIVE" ? "status active" : "status inactive";

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
          max-width: 1480px;
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
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 15px 40px rgba(15,23,42,0.08);
        }

        .hero-left h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .hero-left p {
          margin: 10px 0 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
          max-width: 760px;
        }

        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .btn {
          border: none;
          outline: none;
          cursor: pointer;
          padding: 12px 18px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 14px;
          transition: 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: #fff;
          box-shadow: 0 10px 24px rgba(37,99,235,0.25);
        }

        .btn-primary:hover { transform: translateY(-1px); opacity: 0.96; }

        .btn-light {
          background: #fff;
          color: #0f172a;
          border: 1px solid rgba(148,163,184,0.22);
        }

        .btn-light:hover { background: #f8fafc; }

        .btn-danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

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

        .stat-label {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .filters-card {
          background: rgba(255,255,255,0.92);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
        }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr auto;
          gap: 14px;
          align-items: end;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }

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

        .field textarea {
          min-height: 96px;
          resize: vertical;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79,70,229,0.10);
        }

        .error-box {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 600;
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

        .panel-head h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
        }

        .panel-sub {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .issues-list {
          max-height: 760px;
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

        .issue-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(15,23,42,0.08);
        }

        .issue-card.selected {
          border-color: #4f46e5;
          box-shadow: 0 12px 28px rgba(79,70,229,0.16);
          background: linear-gradient(180deg, #ffffff, #f7f9ff);
        }

        .issue-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .issue-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

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

        .issue-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

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

        .tag.gray {
          background: #f1f5f9;
          color: #334155;
          border-color: #e2e8f0;
        }

        .severity.high { background: rgba(239,68,68,0.10); color: #b91c1c; border-color: rgba(239,68,68,0.20); }
        .severity.medium { background: rgba(245,158,11,0.12); color: #b45309; border-color: rgba(245,158,11,0.22); }
        .severity.low { background: rgba(16,185,129,0.10); color: #047857; border-color: rgba(16,185,129,0.18); }
        .severity.critical { background: rgba(127,29,29,0.14); color: #991b1b; border-color: rgba(127,29,29,0.24); }

        .status.active { background: rgba(59,130,246,0.10); color: #1d4ed8; border-color: rgba(59,130,246,0.22); }
        .status.inactive { background: rgba(100,116,139,0.10); color: #475569; border-color: rgba(100,116,139,0.18); }

        .issue-desc {
          margin: 12px 0 0;
          font-size: 13px;
          line-height: 1.7;
          color: #64748b;
        }

        .issue-actions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .mini-btn {
          border: none;
          cursor: pointer;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 700;
        }

        .mini-btn.edit { background: #eef2ff; color: #4338ca; }
        .mini-btn.delete { background: #fef2f2; color: #b91c1c; }

        .details-body { padding: 22px; }

        .details-empty {
          padding: 50px 24px;
          text-align: center;
          color: #64748b;
        }

        .detail-title-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .detail-title {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.03em;
        }

        .detail-desc {
          margin: 14px 0 22px;
          color: #475569;
          line-height: 1.8;
          font-size: 14px;
        }

        .section-title {
          margin: 0 0 14px;
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

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
          width: 34px;
          min-width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: #fff;
          font-weight: 800;
          font-size: 13px;
          box-shadow: 0 8px 16px rgba(37,99,235,0.22);
        }

        .step-text {
          font-size: 14px;
          line-height: 1.7;
          color: #1e293b;
        }

        .step-sub {
          margin-top: 4px;
          font-size: 12px;
          color: #64748b;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 999;
          backdrop-filter: blur(6px);
        }

        .modal-card {
          width: 100%;
          max-width: 940px;
          max-height: 92vh;
          overflow: auto;
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 24px 70px rgba(15,23,42,0.22);
          border: 1px solid rgba(226,232,240,0.9);
        }

        .modal-head {
          padding: 22px 24px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .modal-head h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
        }

        .modal-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .full-span { grid-column: 1 / -1; }

        .steps-editor {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .step-editor-row {
          display: grid;
          grid-template-columns: 42px 1fr 140px 120px 48px;
          gap: 10px;
          align-items: center;
        }

        .step-badge {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #4338ca;
          font-weight: 800;
          border: 1px solid #c7d2fe;
        }

        .icon-btn {
          border: none;
          cursor: pointer;
          border-radius: 14px;
          width: 48px;
          height: 44px;
          font-size: 18px;
          font-weight: 800;
          background: #fef2f2;
          color: #b91c1c;
        }

        .add-step-btn {
          border: 1px dashed #94a3b8;
          background: #f8fafc;
          color: #334155;
          border-radius: 14px;
          padding: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .modal-actions {
          padding: 18px 24px 24px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .empty-list {
          padding: 40px 18px;
          text-align: center;
          color: #64748b;
        }

        .field-hint {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
        }

        @media (max-width: 1280px) {
          .step-editor-row {
            grid-template-columns: 42px 1fr;
          }
        }

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
        }
      `}</style>

      <div className="trouble-shell">
        <div className="hero">
          <div className="hero-left">
            <h1>Troubleshooting Management</h1>
            <p>
              Live admin management for issues and troubleshooting steps, fully connected
              to the backend API. Create, update, delete, filter, and inspect issue flows
              by category and device type.
            </p>
          </div>

          <div className="hero-actions">
            <button className="btn btn-light" onClick={loadData} disabled={loading || saving}>
              {loading ? "Refreshing..." : "Refresh Data"}
            </button>
            <button className="btn btn-primary" onClick={openAddModal}>
              + Add New Issue
            </button>
          </div>
        </div>

        {pageError ? <div className="error-box">{pageError}</div> : null}

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

        <div className="filters-card">
          <div className="filters-row">
            <div className="field">
              <label>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setDeviceTypeFilter("all");
                }}
              >
                <option value="all">All</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Device Type</label>
              <select
                value={deviceTypeFilter}
                onChange={(e) => setDeviceTypeFilter(e.target.value)}
              >
                <option value="all">All</option>
                {filterDeviceOptions.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by issue code, title, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={openAddModal}>
              Create Issue
            </button>
          </div>
        </div>

        <div className="content-grid">
          <div className="issues-panel">
            <div className="panel-head">
              <div>
                <h3>Issues Library</h3>
                <div className="panel-sub">
                  {loading ? "Loading..." : `${filteredIssues.length} issues found`}
                </div>
              </div>
            </div>

            <div className="issues-list">
              {loading ? (
                <div className="empty-list">Loading issues...</div>
              ) : filteredIssues.length === 0 ? (
                <div className="empty-list">No issues found for the selected filters.</div>
              ) : (
                filteredIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`issue-card ${selectedIssue?.id === issue.id ? "selected" : ""}`}
                    onClick={() => setSelectedId(issue.id)}
                  >
                    <div className="issue-code-badge">{issue.issueCode}</div>

                    <div className="issue-top">
                      <h4 className="issue-title">{issue.title}</h4>
                      <span className={getStatusClass(issue.status)}>
                        {statusLabel(issue.status)}
                      </span>
                    </div>

                    <div className="issue-meta">
                      <span className="tag gray">{issue.category?.name}</span>
                      <span className="tag gray">{issue.deviceType?.name}</span>
                      <span className={getSeverityClass(issue.severity)}>
                        {severityLabel(issue.severity)}
                      </span>
                    </div>

                    <p className="issue-desc">{issue.description || "No description."}</p>

                    <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="mini-btn edit"
                        onClick={() => openEditModal(issue)}
                      >
                        Edit
                      </button>
                      <button
                        className="mini-btn delete"
                        onClick={() => handleDeleteIssue(issue.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="details-panel">
            <div className="panel-head">
              <div>
                <h3>Issue Details</h3>
                <div className="panel-sub">Live data from backend</div>
              </div>
            </div>

            {!selectedIssue ? (
              <div className="details-empty">Select an issue to preview its steps.</div>
            ) : (
              <div className="details-body">
                <div style={{ marginBottom: 8 }}>
                  <span className="issue-code-badge">{selectedIssue.issueCode}</span>
                </div>

                <div className="detail-title-row">
                  <div>
                    <h2 className="detail-title">{selectedIssue.title}</h2>
                    <div className="issue-meta">
                      <span className="tag gray">{selectedIssue.category?.name}</span>
                      <span className="tag gray">{selectedIssue.deviceType?.name}</span>
                      <span className={getSeverityClass(selectedIssue.severity)}>
                        {severityLabel(selectedIssue.severity)}
                      </span>
                      <span className={getStatusClass(selectedIssue.status)}>
                        {statusLabel(selectedIssue.status)}
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-light" onClick={() => openEditModal(selectedIssue)}>
                    Edit Issue
                  </button>
                </div>

                <p className="detail-desc">{selectedIssue.description || "No description."}</p>

                <h4 className="section-title">Troubleshooting Steps</h4>

                {selectedIssue.solutions?.length ? (
                  <div className="steps-list">
                    {selectedIssue.solutions
                      .slice()
                      .sort((a, b) => a.stepOrder - b.stepOrder)
                      .map((step, index) => (
                        <div className="step-item" key={step.id}>
                          <div className="step-index">{index + 1}</div>
                          <div>
                            <div className="step-text">{step.title}</div>
                            <div className="step-sub">
                              Code: {step.solutionCode || "—"} •{" "}
                              {step.isRequired ? "Required" : "Optional"} •{" "}
                              {statusLabel(step.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="empty-list">No troubleshooting steps yet.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{editingIssue ? "Edit Issue" : "Add New Issue"}</h2>
              <button className="btn btn-light" onClick={closeModal}>
                Close
              </button>
            </div>

            <div className="modal-body">
              <div className="field">
                <label>Issue ID</label>
                <input
                  type="text"
                  value={form.issueCode}
                  onChange={(e) => updateForm("issueCode", e.target.value)}
                  placeholder="e.g. SWP18"
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateForm("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Device Type</label>
                <select
                  value={form.deviceTypeId}
                  onChange={(e) => updateForm("deviceTypeId", e.target.value)}
                >
                  <option value="">Select device type</option>
                  {formDeviceOptions.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => updateForm("severity", e.target.value)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              <div className="field full-span">
                <label>Issue Title</label>
                <input
                  type="text"
                  value={form.issueTitle}
                  onChange={(e) => updateForm("issueTitle", e.target.value)}
                  placeholder="Example: Gate not opening"
                />
              </div>

              <div className="field full-span">
                <label>Issue Description</label>
                <textarea
                  value={form.issueDescription}
                  onChange={(e) => updateForm("issueDescription", e.target.value)}
                  placeholder="Write issue description..."
                />
              </div>

              <div className="field">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => updateForm("status", e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="field full-span">
                <label>Troubleshooting Steps</label>
                <div className="steps-editor">
                  {form.steps.map((step, index) => (
                    <div className="step-editor-row" key={`${step.id || "new"}-${index}`}>
                      <div className="step-badge">{index + 1}</div>

                      <input
                        type="text"
                        placeholder={`Step ${index + 1}`}
                        value={step.text}
                        onChange={(e) => updateStep(index, { text: e.target.value })}
                      />

                      <select
                        value={step.isRequired ? "true" : "false"}
                        onChange={(e) =>
                          updateStep(index, { isRequired: e.target.value === "true" })
                        }
                      >
                        <option value="true">Required</option>
                        <option value="false">Optional</option>
                      </select>

                      <select
                        value={step.status}
                        onChange={(e) => updateStep(index, { status: e.target.value })}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>

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
              <button className="btn btn-light" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editingIssue ? "Save Changes" : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}