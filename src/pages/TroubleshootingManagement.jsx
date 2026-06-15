import React, { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const ASSET_TYPES = [
  {
    value: "DEVICE",
    label: "Device",
    arabic: "جهاز",
    hint: "مشاكل الأجهزة حسب نوع الجهاز",
  },
  {
    value: "GATE",
    label: "Gate",
    arabic: "بوابة",
    hint: "مشاكل البوابات فقط",
  },
  {
    value: "SOFTWARE",
    label: "Software",
    arabic: "سوفت وير",
    hint: "مشاكل النظام أو البرنامج",
  },
];

const DEVICE_TYPE_OPTIONS = [
  { id: 1, name: "Access Control", categoryName: "Access Control", assetType: "DEVICE" },
  { id: 2, name: "Reader", categoryName: "Access Control", assetType: "DEVICE" },
  { id: 3, name: "Controller", categoryName: "Access Control", assetType: "DEVICE" },
  { id: 4, name: "Morpho md", categoryName: "Access Control", assetType: "DEVICE" },
  { id: 140, name: "Argus 60", categoryName: "Gates", assetType: "GATE" },
];

const SOFTWARE_MODULE_OPTIONS = [
  { id: "ACCESS_APP", name: "Access App", assetType: "SOFTWARE" },
  { id: "SYNC_SERVICE", name: "Sync Service", assetType: "SOFTWARE" },
  { id: "DASHBOARD", name: "Dashboard", assetType: "SOFTWARE" },
];

const emptyForm = {
  assetType: "DEVICE",
  issueCode: "",
  categoryId: "",
  deviceTypeId: "",
  softwareModule: "",
  issueTitle: "",
  issueDescription: "",
  severity: "HIGH",
  status: "ACTIVE",
  steps: [
    {
      id: null,
      text: "",
      isRequired: true,
      status: "ACTIVE",
      solutionCode: "",
    },
  ],
};

function normalizeAssetType(value) {
  const v = String(value || "DEVICE").toUpperCase();
  if (v === "GATE") return "GATE";
  if (v === "SOFTWARE") return "SOFTWARE";
  return "DEVICE";
}

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

function assetTypeLabel(value) {
  const asset = ASSET_TYPES.find((item) => item.value === normalizeAssetType(value));
  return asset?.label || "Device";
}

function assetTypeArabic(value) {
  const asset = ASSET_TYPES.find((item) => item.value === normalizeAssetType(value));
  return asset?.arabic || "جهاز";
}

function getIssueAssetType(issue) {
  return normalizeAssetType(
    issue?.assetType ||
      issue?.category?.assetType ||
      issue?.deviceType?.assetType ||
      "DEVICE"
  );
}

function categoryMatchesAsset(category, assetType) {
  const value = String(category?.assetType || "").toUpperCase();
  if (!value || value === "ALL" || value === "NULL") return true;
  return value === normalizeAssetType(assetType);
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.issues)) return data.issues;
  if (Array.isArray(data?.categories)) return data.categories;
  return [];
}

function unwrapItem(data) {
  if (data?.data) return data.data;
  return data;
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

  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deviceTypeFilter, setDeviceTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [scanCode, setScanCode] = useState("");
  const [scanAssetType, setScanAssetType] = useState("DEVICE");
  const [scanDeviceTypeId, setScanDeviceTypeId] = useState("2");
  const [scanSoftwareModule, setScanSoftwareModule] = useState("ACCESS_APP");
  const [scanResult, setScanResult] = useState(null);

  const [selectedIssueIds, setSelectedIssueIds] = useState([]);
  const [payloadPreview, setPayloadPreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [String(c.id), c]));
  }, [categories]);

  const getDeviceOptionsForAsset = (assetType, categoryId = "all") => {
    const normalized = normalizeAssetType(assetType);

    if (normalized === "SOFTWARE") return [];

    const byAsset = DEVICE_TYPE_OPTIONS.filter((item) => item.assetType === normalized);

    if (categoryId === "all" || !categoryId) {
      return byAsset;
    }

    const selectedCategory = categoryMap.get(String(categoryId));
    const byCategory = byAsset.filter(
      (item) => item.categoryName === selectedCategory?.name
    );

    return byCategory.length ? byCategory : byAsset;
  };

  const visibleCategoriesForFilter = useMemo(() => {
    if (assetTypeFilter === "all") return categories;
    return categories.filter((category) =>
      categoryMatchesAsset(category, assetTypeFilter)
    );
  }, [categories, assetTypeFilter]);

  const visibleCategoriesForForm = useMemo(() => {
    return categories.filter((category) =>
      categoryMatchesAsset(category, form.assetType)
    );
  }, [categories, form.assetType]);

  const filterDeviceOptions = useMemo(() => {
    if (assetTypeFilter === "all") {
      return DEVICE_TYPE_OPTIONS;
    }

    return getDeviceOptionsForAsset(assetTypeFilter, categoryFilter);
  }, [assetTypeFilter, categoryFilter, categoryMap]);

  const formDeviceOptions = useMemo(() => {
    return getDeviceOptionsForAsset(form.assetType, form.categoryId);
  }, [form.assetType, form.categoryId, categoryMap]);

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [issuesData, categoriesData] = await Promise.all([
        apiRequest("/issues"),
        apiRequest("/issues/categories"),
      ]);

      const nextIssues = unwrapList(issuesData);
      const nextCategories = unwrapList(categoriesData);

      setIssues(nextIssues);
      setCategories(nextCategories);

      const firstId = nextIssues[0]?.id || null;
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

  const smartFilteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();

    return issues.filter((issue) => {
      const issueAssetType = getIssueAssetType(issue);

      const matchesAssetType =
        assetTypeFilter === "all" || issueAssetType === assetTypeFilter;

      const matchesScan =
        !scanResult ||
        issueAssetType === scanResult.assetType;

      const matchesScanDeviceType =
        !scanResult ||
        scanResult.assetType !== "DEVICE" ||
        !scanResult.deviceTypeId ||
        !issue.deviceTypeId ||
        String(issue.deviceTypeId) === String(scanResult.deviceTypeId);

      const matchesCategory =
        categoryFilter === "all" ||
        String(issue.categoryId) === String(categoryFilter);

      const matchesDeviceType =
        deviceTypeFilter === "all" ||
        String(issue.deviceTypeId) === String(deviceTypeFilter);

      const matchesSearch =
        !q ||
        String(issue.issueCode || "").toLowerCase().includes(q) ||
        String(issue.title || "").toLowerCase().includes(q) ||
        String(issue.description || "").toLowerCase().includes(q) ||
        String(issue.category?.name || "").toLowerCase().includes(q) ||
        String(issue.deviceType?.name || "").toLowerCase().includes(q) ||
        String(issue.assetType || "").toLowerCase().includes(q);

      return (
        matchesAssetType &&
        matchesScan &&
        matchesScanDeviceType &&
        matchesCategory &&
        matchesDeviceType &&
        matchesSearch
      );
    });
  }, [
    issues,
    assetTypeFilter,
    categoryFilter,
    deviceTypeFilter,
    search,
    scanResult,
  ]);

  const selectedIssue =
    smartFilteredIssues.find((item) => item.id === selectedId) ||
    issues.find((item) => item.id === selectedId) ||
    smartFilteredIssues[0] ||
    null;

  useEffect(() => {
    if (!selectedIssue && smartFilteredIssues[0]) {
      setSelectedId(smartFilteredIssues[0].id);
    }
  }, [selectedIssue, smartFilteredIssues]);

  const stats = useMemo(() => {
    const deviceIssues = issues.filter((i) => getIssueAssetType(i) === "DEVICE").length;
    const gateIssues = issues.filter((i) => getIssueAssetType(i) === "GATE").length;
    const softwareIssues = issues.filter(
      (i) => getIssueAssetType(i) === "SOFTWARE"
    ).length;

    const activeIssuesCount = issues.filter(
      (i) => toUiStatus(i.status) === "ACTIVE"
    ).length;

    const criticalIssuesCount = issues.filter(
      (i) => toUiSeverity(i.severity) === "CRITICAL"
    ).length;

    const totalStepsCount = issues.reduce(
      (acc, cur) =>
        acc + (Array.isArray(cur.solutions) ? cur.solutions.length : 0),
      0
    );

    return {
      deviceIssues,
      gateIssues,
      softwareIssues,
      activeIssuesCount,
      criticalIssuesCount,
      totalStepsCount,
    };
  }, [issues]);

  const setAssetFilter = (value) => {
    setAssetTypeFilter(value);
    setCategoryFilter("all");
    setDeviceTypeFilter("all");
  };

  const handleFrontendScan = () => {
    const assetType = normalizeAssetType(scanAssetType);
    const code = scanCode.trim() || `DEMO-${assetType}-${Date.now()}`;

    const deviceType =
      assetType === "DEVICE"
        ? DEVICE_TYPE_OPTIONS.find((item) => String(item.id) === String(scanDeviceTypeId))
        : assetType === "GATE"
          ? DEVICE_TYPE_OPTIONS.find((item) => item.assetType === "GATE")
          : null;

    const softwareModule =
      assetType === "SOFTWARE"
        ? SOFTWARE_MODULE_OPTIONS.find((item) => item.id === scanSoftwareModule)
        : null;

    const result = {
      code,
      assetType,
      deviceTypeId: assetType === "DEVICE" ? deviceType?.id || null : null,
      deviceTypeName: assetType === "DEVICE" ? deviceType?.name || "" : "",
      gateTypeName: assetType === "GATE" ? deviceType?.name || "Gate" : "",
      softwareModule: assetType === "SOFTWARE" ? softwareModule?.id || "" : "",
      softwareModuleName: assetType === "SOFTWARE" ? softwareModule?.name || "" : "",
      scannedAt: new Date().toISOString(),
      status: "OK",
    };

    setScanResult(result);
    setAssetFilter(assetType);
    setSelectedIssueIds([]);
    setPayloadPreview("");
  };

  const clearScan = () => {
    setScanResult(null);
    setScanCode("");
    setSelectedIssueIds([]);
    setPayloadPreview("");
    setAssetFilter("all");
  };

  const toggleIssueSelection = (issueId) => {
    setSelectedIssueIds((prev) => {
      if (prev.includes(issueId)) {
        return prev.filter((id) => id !== issueId);
      }
      return [...prev, issueId];
    });
  };

  const buildInspectionPayload = () => {
    const payload = {
      assetType: scanResult?.assetType || assetTypeFilter,
      scanCode: scanResult?.code || null,
      deviceTypeId: scanResult?.deviceTypeId || null,
      softwareModule: scanResult?.softwareModule || null,
      inspectionStatus: selectedIssueIds.length ? "NOT_OK" : "OK",
      issueIds: selectedIssueIds,
      notes: "",
      createdFrom: "frontend-preview",
      createdAt: new Date().toISOString(),
    };

    setPayloadPreview(JSON.stringify(payload, null, 2));
  };

  const openAddModal = () => {
    const defaultAssetType = assetTypeFilter === "all" ? "DEVICE" : assetTypeFilter;
    const firstCategory = categories.find((category) =>
      categoryMatchesAsset(category, defaultAssetType)
    );
    const firstDeviceType =
      getDeviceOptionsForAsset(defaultAssetType, firstCategory?.id)[0]?.id || "";

    setEditingIssue(null);
    setForm({
      ...emptyForm,
      assetType: defaultAssetType,
      categoryId: firstCategory?.id || "",
      deviceTypeId: defaultAssetType === "DEVICE" ? firstDeviceType : "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (issue) => {
    const issueAssetType = getIssueAssetType(issue);

    setEditingIssue(issue);
    setForm({
      assetType: issueAssetType,
      issueCode: issue.issueCode || "",
      categoryId: issue.categoryId || "",
      deviceTypeId: issue.deviceTypeId || "",
      softwareModule: issue.softwareModule || "",
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
          : [
              {
                id: null,
                text: "",
                isRequired: true,
                status: "ACTIVE",
                solutionCode: "",
              },
            ],
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

      if (key === "assetType") {
        const nextAssetType = normalizeAssetType(value);
        const firstCategory = categories.find((category) =>
          categoryMatchesAsset(category, nextAssetType)
        );
        const firstDeviceType =
          getDeviceOptionsForAsset(nextAssetType, firstCategory?.id)[0]?.id || "";

        next.assetType = nextAssetType;
        next.categoryId = firstCategory?.id || "";
        next.deviceTypeId = nextAssetType === "DEVICE" ? firstDeviceType : "";
        next.softwareModule =
          nextAssetType === "SOFTWARE" ? SOFTWARE_MODULE_OPTIONS[0]?.id || "" : "";
      }

      if (key === "categoryId") {
        const matchingDeviceType =
          getDeviceOptionsForAsset(prev.assetType, value)[0]?.id || "";
        next.deviceTypeId = prev.assetType === "DEVICE" ? matchingDeviceType : "";
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
        {
          id: null,
          text: "",
          isRequired: true,
          status: "ACTIVE",
          solutionCode: "",
        },
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

      if (form.assetType === "DEVICE" && !form.deviceTypeId) {
        throw new Error("Device type is required for device issues.");
      }

      const issuePayload = {
        assetType: normalizeAssetType(form.assetType),
        issueCode: form.issueCode.trim(),
        title: form.issueTitle.trim(),
        description: form.issueDescription.trim(),
        severity: toUiSeverity(form.severity),
        status: toUiStatus(form.status),
        categoryId: Number(form.categoryId),
        deviceTypeId:
          form.assetType === "DEVICE" && form.deviceTypeId
            ? Number(form.deviceTypeId)
            : null,
        softwareModule:
          form.assetType === "SOFTWARE" ? form.softwareModule || null : null,
      };

      let issueId = editingIssue?.id;

      if (editingIssue) {
        await apiRequest(`/issues/${editingIssue.id}`, {
          method: "PATCH",
          body: JSON.stringify(issuePayload),
        });
      } else {
        const createdIssueResponse = await apiRequest("/issues", {
          method: "POST",
          body: JSON.stringify(issuePayload),
        });
        const createdIssue = unwrapItem(createdIssueResponse);
        issueId = createdIssue?.id;
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
          const createdStepResponse = await apiRequest("/issues/solutions", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          const createdStep = unwrapItem(createdStepResponse);
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

      setSelectedIssueIds((prev) => prev.filter((item) => item !== id));
    } catch (error) {
      setPageError(error.message || "Failed to delete issue.");
    } finally {
      setSaving(false);
    }
  };

  const getSeverityClass = (severity) => {
    const value = toUiSeverity(severity);
    if (value === "CRITICAL") return "tag severity critical";
    if (value === "HIGH") return "tag severity high";
    if (value === "LOW") return "tag severity low";
    return "tag severity medium";
  };

  const getStatusClass = (status) =>
    toUiStatus(status) === "ACTIVE" ? "tag status active" : "tag status inactive";

  const getAssetClass = (assetType) => {
    const value = normalizeAssetType(assetType);
    if (value === "GATE") return "tag asset gate";
    if (value === "SOFTWARE") return "tag asset software";
    return "tag asset device";
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
          max-width: 1500px;
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
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 26px;
          padding: 24px;
          box-shadow: 0 15px 40px rgba(15,23,42,0.08);
        }

        .hero-left h1 {
          margin: 0;
          font-size: 31px;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .hero-left p {
          margin: 10px 0 0;
          color: #475569;
          font-size: 14px;
          line-height: 1.8;
          max-width: 820px;
        }

        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .btn {
          border: none;
          outline: none;
          cursor: pointer;
          padding: 12px 18px;
          border-radius: 15px;
          font-weight: 800;
          font-size: 14px;
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #2563eb);
          color: #fff;
          box-shadow: 0 10px 24px rgba(37,99,235,0.25);
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.96;
        }

        .btn-light {
          background: #fff;
          color: #0f172a;
          border: 1px solid rgba(148,163,184,0.28);
        }

        .btn-light:hover:not(:disabled) {
          background: #f8fafc;
        }

        .btn-danger {
          background: #fef2f2;
          color: #b91c1c;
          border: 1px solid #fecaca;
        }

        .tabs-row {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .asset-tab {
          border: 1px solid rgba(148,163,184,0.18);
          border-radius: 20px;
          background: rgba(255,255,255,0.92);
          padding: 17px;
          text-align: left;
          cursor: pointer;
          transition: 0.2s ease;
          box-shadow: 0 10px 26px rgba(15,23,42,0.05);
        }

        .asset-tab:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 30px rgba(15,23,42,0.08);
        }

        .asset-tab.active {
          border-color: #4f46e5;
          background: linear-gradient(180deg, #ffffff, #f6f8ff);
          box-shadow: 0 14px 34px rgba(79,70,229,0.16);
        }

        .asset-tab-title {
          font-weight: 900;
          font-size: 15px;
          color: #0f172a;
        }

        .asset-tab-sub {
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
        }

        .stat-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
        }

        .stat-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .stat-value {
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.05em;
        }

        .scan-card,
        .filters-card,
        .preview-card {
          background: rgba(255,255,255,0.94);
          border: 1px solid rgba(148,163,184,0.16);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.06);
        }

        .scan-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 16px;
        }

        .scan-head h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }

        .scan-head p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .scan-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.75fr 0.9fr auto auto;
          gap: 12px;
          align-items: end;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          font-size: 13px;
          font-weight: 800;
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

        .field-hint {
          font-size: 11px;
          color: #94a3b8;
        }

        .scan-result {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: center;
          background:
            linear-gradient(135deg, rgba(79,70,229,0.08), rgba(37,99,235,0.06)),
            #fff;
          border: 1px solid rgba(79,70,229,0.14);
          border-radius: 20px;
          padding: 16px;
        }

        .scan-result-title {
          font-weight: 900;
          font-size: 16px;
        }

        .scan-result-sub {
          margin-top: 6px;
          color: #475569;
          font-size: 13px;
          line-height: 1.7;
        }

        .filters-row {
          display: grid;
          grid-template-columns: 0.8fr 1fr 1fr 1.4fr auto;
          gap: 14px;
          align-items: end;
        }

        .error-box {
          background: #fff1f2;
          color: #be123c;
          border: 1px solid #fecdd3;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 700;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1.05fr 1.35fr;
          gap: 20px;
          align-items: start;
        }

        .issues-panel,
        .details-panel {
          background: rgba(255,255,255,0.96);
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
          font-weight: 900;
        }

        .panel-sub {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .issues-list {
          max-height: 790px;
          overflow: auto;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .issue-card {
          border: 1px solid rgba(203,213,225,0.85);
          border-radius: 19px;
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

        .issue-card.picked {
          border-color: #059669;
          background: linear-gradient(180deg, #ffffff, #f0fdf4);
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
          font-weight: 900;
          color: #0f172a;
        }

        .issue-code-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 900;
          background: #eef2ff;
          color: #4338ca;
          border: 1px solid #c7d2fe;
          white-space: nowrap;
          margin-bottom: 7px;
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
          font-weight: 800;
          border: 1px solid transparent;
        }

        .tag.gray {
          background: #f1f5f9;
          color: #334155;
          border-color: #e2e8f0;
        }

        .asset.device {
          background: rgba(59,130,246,0.10);
          color: #1d4ed8;
          border-color: rgba(59,130,246,0.20);
        }

        .asset.gate {
          background: rgba(124,58,237,0.10);
          color: #6d28d9;
          border-color: rgba(124,58,237,0.22);
        }

        .asset.software {
          background: rgba(20,184,166,0.10);
          color: #0f766e;
          border-color: rgba(20,184,166,0.22);
        }

        .severity.high {
          background: rgba(239,68,68,0.10);
          color: #b91c1c;
          border-color: rgba(239,68,68,0.20);
        }

        .severity.medium {
          background: rgba(245,158,11,0.12);
          color: #b45309;
          border-color: rgba(245,158,11,0.22);
        }

        .severity.low {
          background: rgba(16,185,129,0.10);
          color: #047857;
          border-color: rgba(16,185,129,0.18);
        }

        .severity.critical {
          background: rgba(127,29,29,0.14);
          color: #991b1b;
          border-color: rgba(127,29,29,0.24);
        }

        .status.active {
          background: rgba(59,130,246,0.10);
          color: #1d4ed8;
          border-color: rgba(59,130,246,0.22);
        }

        .status.inactive {
          background: rgba(100,116,139,0.10);
          color: #475569;
          border-color: rgba(100,116,139,0.18);
        }

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
          font-weight: 800;
        }

        .mini-btn.edit {
          background: #eef2ff;
          color: #4338ca;
        }

        .mini-btn.delete {
          background: #fef2f2;
          color: #b91c1c;
        }

        .mini-btn.pick {
          background: #ecfdf5;
          color: #047857;
        }

        .mini-btn.unpick {
          background: #dcfce7;
          color: #166534;
        }

        .details-body {
          padding: 22px;
        }

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
          font-weight: 900;
          letter-spacing: -0.04em;
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
          font-weight: 900;
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
          font-weight: 900;
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

        .inspection-box {
          margin-top: 22px;
          border: 1px solid rgba(148,163,184,0.24);
          background: #f8fafc;
          border-radius: 20px;
          padding: 16px;
        }

        .selected-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 12px 0;
        }

        .selected-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 10px 12px;
          font-size: 13px;
          font-weight: 800;
        }

        .payload-preview {
          margin-top: 14px;
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 16px;
          padding: 14px;
          overflow: auto;
          font-size: 12px;
          line-height: 1.6;
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
          max-width: 980px;
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
          font-weight: 900;
        }

        .modal-body {
          padding: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .full-span {
          grid-column: 1 / -1;
        }

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
          font-weight: 900;
          border: 1px solid #c7d2fe;
        }

        .icon-btn {
          border: none;
          cursor: pointer;
          border-radius: 14px;
          width: 48px;
          height: 44px;
          font-size: 18px;
          font-weight: 900;
          background: #fef2f2;
          color: #b91c1c;
        }

        .add-step-btn {
          border: 1px dashed #94a3b8;
          background: #f8fafc;
          color: #334155;
          border-radius: 14px;
          padding: 12px;
          font-weight: 800;
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

        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .scan-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filters-row {
            grid-template-columns: 1fr 1fr;
          }

          .step-editor-row {
            grid-template-columns: 42px 1fr;
          }
        }

        @media (max-width: 1100px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .tabs-row {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 780px) {
          .trouble-page {
            padding: 14px;
          }

          .hero {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-actions {
            justify-content: stretch;
          }

          .hero-actions .btn {
            width: 100%;
          }

          .stats-grid,
          .tabs-row,
          .scan-grid,
          .filters-row,
          .modal-body {
            grid-template-columns: 1fr;
          }

          .scan-result {
            grid-template-columns: 1fr;
          }

          .detail-title-row {
            flex-direction: column;
          }
        }
      `}</style>

      <div className="trouble-shell">
        <div className="hero">
          <div className="hero-left">
            <h1>Smart Troubleshooting Management</h1>
            <p>
              إدارة مشاكل الأجهزة والبوابات والسوفت وير من نفس الشاشة. الفني يعمل
              scan أو يختار النوع، والواجهة تعرض له المشاكل المناسبة فقط مع خطوات
              الحل.
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

        <div className="tabs-row">
          <button
            className={`asset-tab ${assetTypeFilter === "all" ? "active" : ""}`}
            onClick={() => setAssetFilter("all")}
          >
            <div className="asset-tab-title">All Issues</div>
            <div className="asset-tab-sub">كل المشاكل بدون تقييد</div>
          </button>

          {ASSET_TYPES.map((asset) => (
            <button
              key={asset.value}
              className={`asset-tab ${assetTypeFilter === asset.value ? "active" : ""}`}
              onClick={() => setAssetFilter(asset.value)}
            >
              <div className="asset-tab-title">
                {asset.label} / {asset.arabic}
              </div>
              <div className="asset-tab-sub">{asset.hint}</div>
            </button>
          ))}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Device Issues</div>
            <div className="stat-value">{stats.deviceIssues}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Gate Issues</div>
            <div className="stat-value">{stats.gateIssues}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Software Issues</div>
            <div className="stat-value">{stats.softwareIssues}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Active Issues</div>
            <div className="stat-value">{stats.activeIssuesCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Critical</div>
            <div className="stat-value">{stats.criticalIssuesCount}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">Steps</div>
            <div className="stat-value">{stats.totalStepsCount}</div>
          </div>
        </div>

        <div className="scan-card">
          <div className="scan-head">
            <div>
              <h3>Technician Scan Preview</h3>
              <p>
                ده Frontend simulation مؤقت. لما الباك يجهز هنبدل الجزء ده بنداء
                scan حقيقي، لكن نفس الفكرة: نتيجة الـ scan تحدد نوع المشاكل.
              </p>
            </div>

            {scanResult ? (
              <button className="btn btn-light" onClick={clearScan}>
                Clear Scan
              </button>
            ) : null}
          </div>

          <div className="scan-grid">
            <div className="field">
              <label>Scan Code</label>
              <input
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                placeholder="اكتبي أو اعملي paste للكود"
              />
            </div>

            <div className="field">
              <label>Scan Type</label>
              <select
                value={scanAssetType}
                onChange={(e) => setScanAssetType(e.target.value)}
              >
                {ASSET_TYPES.map((asset) => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label} / {asset.arabic}
                  </option>
                ))}
              </select>
            </div>

            {scanAssetType === "DEVICE" ? (
              <div className="field">
                <label>Device Type</label>
                <select
                  value={scanDeviceTypeId}
                  onChange={(e) => setScanDeviceTypeId(e.target.value)}
                >
                  {DEVICE_TYPE_OPTIONS.filter((item) => item.assetType === "DEVICE").map(
                    (device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    )
                  )}
                </select>
              </div>
            ) : scanAssetType === "SOFTWARE" ? (
              <div className="field">
                <label>Software Module</label>
                <select
                  value={scanSoftwareModule}
                  onChange={(e) => setScanSoftwareModule(e.target.value)}
                >
                  {SOFTWARE_MODULE_OPTIONS.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="field">
                <label>Gate Type</label>
                <input value="Gate / Argus 60" readOnly />
              </div>
            )}

            <button className="btn btn-primary" onClick={handleFrontendScan}>
              Run Scan
            </button>

            <button className="btn btn-light" onClick={clearScan}>
              Reset
            </button>
          </div>

          {scanResult ? (
            <div className="scan-result">
              <div>
                <div className="scan-result-title">
                  Scan Result: {assetTypeArabic(scanResult.assetType)}
                </div>
                <div className="scan-result-sub">
                  Code: <b>{scanResult.code}</b>
                  {scanResult.assetType === "DEVICE"
                    ? ` • Device Type: ${scanResult.deviceTypeName}`
                    : ""}
                  {scanResult.assetType === "GATE"
                    ? ` • Gate Type: ${scanResult.gateTypeName}`
                    : ""}
                  {scanResult.assetType === "SOFTWARE"
                    ? ` • Module: ${scanResult.softwareModuleName}`
                    : ""}
                  {" • "}
                  Matching issues: <b>{smartFilteredIssues.length}</b>
                </div>
              </div>

              <span className={getAssetClass(scanResult.assetType)}>
                {assetTypeLabel(scanResult.assetType)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="filters-card">
          <div className="filters-row">
            <div className="field">
              <label>Asset Type</label>
              <select
                value={assetTypeFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
              >
                <option value="all">All</option>
                {ASSET_TYPES.map((asset) => (
                  <option key={asset.value} value={asset.value}>
                    {asset.label}
                  </option>
                ))}
              </select>
            </div>

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
                {visibleCategoriesForFilter.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Device / Gate Type</label>
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
                placeholder="Search by code, title, category, type..."
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
                  {loading
                    ? "Loading..."
                    : `${smartFilteredIssues.length} issues found`}
                </div>
              </div>
            </div>

            <div className="issues-list">
              {loading ? (
                <div className="empty-list">Loading issues...</div>
              ) : smartFilteredIssues.length === 0 ? (
                <div className="empty-list">
                  No issues found for the selected filters.
                </div>
              ) : (
                smartFilteredIssues.map((issue) => {
                  const issueAssetType = getIssueAssetType(issue);
                  const isPicked = selectedIssueIds.includes(issue.id);

                  return (
                    <div
                      key={issue.id}
                      className={`issue-card ${
                        selectedIssue?.id === issue.id ? "selected" : ""
                      } ${isPicked ? "picked" : ""}`}
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
                        <span className={getAssetClass(issueAssetType)}>
                          {assetTypeLabel(issueAssetType)}
                        </span>
                        <span className="tag gray">
                          {issue.category?.name || "No Category"}
                        </span>
                        <span className="tag gray">
                          {issueAssetType === "DEVICE"
                            ? issue.deviceType?.name || "Generic Device"
                            : issueAssetType === "GATE"
                              ? issue.deviceType?.name || "All Gates"
                              : issue.softwareModule || "Software"}
                        </span>
                        <span className={getSeverityClass(issue.severity)}>
                          {severityLabel(issue.severity)}
                        </span>
                        <span className="tag gray">
                          {Array.isArray(issue.solutions)
                            ? `${issue.solutions.length} steps`
                            : "0 steps"}
                        </span>
                      </div>

                      <p className="issue-desc">
                        {issue.description || "No description."}
                      </p>

                      <div className="issue-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className={isPicked ? "mini-btn unpick" : "mini-btn pick"}
                          onClick={() => toggleIssueSelection(issue.id)}
                        >
                          {isPicked ? "Selected" : "Select for Technician"}
                        </button>

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
                  );
                })
              )}
            </div>
          </div>

          <div className="details-panel">
            <div className="panel-head">
              <div>
                <h3>Issue Details</h3>
                <div className="panel-sub">
                  Smart preview by asset type and scan result
                </div>
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
                      <span className={getAssetClass(getIssueAssetType(selectedIssue))}>
                        {assetTypeLabel(getIssueAssetType(selectedIssue))}
                      </span>
                      <span className="tag gray">
                        {selectedIssue.category?.name || "No Category"}
                      </span>
                      <span className="tag gray">
                        {selectedIssue.deviceType?.name || "Generic"}
                      </span>
                      <span className={getSeverityClass(selectedIssue.severity)}>
                        {severityLabel(selectedIssue.severity)}
                      </span>
                      <span className={getStatusClass(selectedIssue.status)}>
                        {statusLabel(selectedIssue.status)}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn btn-light"
                    onClick={() => openEditModal(selectedIssue)}
                  >
                    Edit Issue
                  </button>
                </div>

                <p className="detail-desc">
                  {selectedIssue.description || "No description."}
                </p>

                <h4 className="section-title">Troubleshooting Steps</h4>

                {selectedIssue.solutions?.length ? (
                  <div className="steps-list">
                    {selectedIssue.solutions
                      .slice()
                      .sort((a, b) => a.stepOrder - b.stepOrder)
                      .map((step, index) => (
                        <div className="step-item" key={step.id || index}>
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

                <div className="inspection-box">
                  <h4 className="section-title">Technician Selected Problems</h4>

                  {selectedIssueIds.length === 0 ? (
                    <div className="panel-sub">
                      اختاري مشكلة أو أكتر من الليست عشان يتبني payload التفتيش.
                    </div>
                  ) : (
                    <div className="selected-list">
                      {selectedIssueIds.map((id) => {
                        const issue = issues.find((item) => item.id === id);

                        return (
                          <div key={id} className="selected-item">
                            <span>
                              {issue?.issueCode || id} — {issue?.title || "Issue"}
                            </span>
                            <button
                              className="mini-btn delete"
                              onClick={() => toggleIssueSelection(id)}
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="issue-actions">
                    <button className="btn btn-primary" onClick={buildInspectionPayload}>
                      Build Inspection Payload
                    </button>

                    <button
                      className="btn btn-light"
                      onClick={() => {
                        setSelectedIssueIds([]);
                        setPayloadPreview("");
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>

                  {payloadPreview ? (
                    <pre className="payload-preview">{payloadPreview}</pre>
                  ) : null}
                </div>
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
                <label>Asset Type</label>
                <select
                  value={form.assetType}
                  onChange={(e) => updateForm("assetType", e.target.value)}
                >
                  {ASSET_TYPES.map((asset) => (
                    <option key={asset.value} value={asset.value}>
                      {asset.label} / {asset.arabic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Issue ID</label>
                <input
                  type="text"
                  value={form.issueCode}
                  onChange={(e) => updateForm("issueCode", e.target.value)}
                  placeholder="e.g. DEV-001 / GATE-001 / SW-001"
                />
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => updateForm("categoryId", e.target.value)}
                >
                  <option value="">Select category</option>
                  {visibleCategoriesForForm.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {form.assetType === "DEVICE" ? (
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
              ) : form.assetType === "GATE" ? (
                <div className="field">
                  <label>Gate Type</label>
                  <select
                    value={form.deviceTypeId}
                    onChange={(e) => updateForm("deviceTypeId", e.target.value)}
                  >
                    <option value="">All Gates</option>
                    {formDeviceOptions.map((device) => (
                      <option key={device.id} value={device.id}>
                        {device.name}
                      </option>
                    ))}
                  </select>
                  <div className="field-hint">اختياري للبوابات.</div>
                </div>
              ) : (
                <div className="field">
                  <label>Software Module</label>
                  <select
                    value={form.softwareModule}
                    onChange={(e) => updateForm("softwareModule", e.target.value)}
                  >
                    <option value="">General Software</option>
                    {SOFTWARE_MODULE_OPTIONS.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                <label>Issue Title</label>
                <input
                  type="text"
                  value={form.issueTitle}
                  onChange={(e) => updateForm("issueTitle", e.target.value)}
                  placeholder="Example: Gate not opening / Reader not responding"
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
                        onChange={(e) =>
                          updateStep(index, { text: e.target.value })
                        }
                      />

                      <select
                        value={step.isRequired ? "true" : "false"}
                        onChange={(e) =>
                          updateStep(index, {
                            isRequired: e.target.value === "true",
                          })
                        }
                      >
                        <option value="true">Required</option>
                        <option value="false">Optional</option>
                      </select>

                      <select
                        value={step.status}
                        onChange={(e) =>
                          updateStep(index, { status: e.target.value })
                        }
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
                {saving
                  ? "Saving..."
                  : editingIssue
                    ? "Save Changes"
                    : "Create Issue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}