import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TasksSection } from "../components/TasksSection";
import { MorphoSection } from "../components/MorphoSection";
import { SolutionsModal } from "../components/SolutionsModal";
import { MorphoModal } from "../components/MorphoModal";
import { MorphoFilter } from "../components/MorphoFilter";
import {
  SMART,
  getToken,
  getStoredUser,
  getLoggedUserId,
  api,
  fetchMerged,
  tryPaths,
  toArray,
  userName,
  normalizeIssue,
  normalizeSolution,
  statusAr,
  statusClass,
  isFinishedStatus,
  deviceTitle,
  deviceLocation,
  normalizeTask,
  formatDate,
  toNumber,
} from "../services/softwareHelpers";

const styles = `
.software-page{
  min-height:100vh;
  padding:28px 34px 42px;
  background:
    radial-gradient(circle at top right, rgba(28,169,225,.12), transparent 26%),
    linear-gradient(180deg,#f8fcfe 0%,#f3f9fc 100%);
  color:${SMART.dark};
  font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;
}

.sw-hero{
  border-radius:22px;
  padding:26px 30px;
  background:linear-gradient(115deg,#163548,#1d89b3);
  color:#fff;
  box-shadow:0 14px 30px rgba(18,74,98,.15);
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:18px;
  overflow:hidden;
  position:relative;
}

.sw-hero:after{
  content:"";
  position:absolute;
  width:170px;
  height:170px;
  border-radius:50%;
  right:-70px;
  top:-80px;
  background:rgba(255,255,255,.13);
}

.sw-brand{
  display:flex;
  align-items:center;
  gap:12px;
  position:relative;
  z-index:1;
}

.sw-hero h1{
  margin:0;
  font-size:29px;
  letter-spacing:-.8px;
}

.sw-hero p{
  margin:7px 0 0;
  color:#eaf8ff;
  font-weight:800;
  line-height:1.6;
}

.sw-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  position:relative;
  z-index:1;
}

.sw-user-strip{
  margin:14px 0 18px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:14px;
  background:transparent;
  border:0;
  border-radius:0;
  padding:4px 2px;
  box-shadow:none;
}

.sw-user-strip h2{
  margin:0;
  font-size:19px;
}

.sw-user-strip p{
  margin:5px 0 0;
  color:#64748b;
  font-weight:800;
}

.sw-user-badge{
  padding:8px 12px;
  border-radius:999px;
  background:#eef8fc;
  border:1px solid #d6edf6;
  color:#0369a1;
  font-weight:1000;
  white-space:nowrap;
}

.sw-btn{
  border:0;
  border-radius:12px;
  padding:10px 14px;
  font-weight:1000;
  cursor:pointer;
  color:white;
  background:${SMART.blue};
  box-shadow:0 12px 26px rgba(28,169,225,.22);
  transition:.18s ease;
}

.sw-btn:hover{
  transform:translateY(-1px);
  filter:brightness(1.03);
}

.sw-btn.white{
  background:white;
  color:${SMART.dark};
  box-shadow:none;
  border:1px solid #dbeafe;
}

.sw-btn.green{
  background:${SMART.green};
}

.sw-btn.orange{
  background:${SMART.orange};
}

.sw-btn:disabled{
  opacity:.45;
  cursor:not-allowed;
  transform:none;
}

.sw-small{
  padding:8px 10px;
  border-radius:12px;
  font-size:12px;
}

.sw-tabs{
  width:max-content;
  max-width:100%;
  margin:0 0 18px;
  display:flex;
  gap:4px;
  padding:5px;
  background:#eaf3f7;
  border-radius:14px;
}

.sw-tab{
  border:0;
  background:transparent;
  border-radius:10px;
  padding:10px 18px;
  font-weight:1000;
  color:${SMART.dark};
  cursor:pointer;
  box-shadow:none;
}

.sw-tab.active{
  background:white;
  color:${SMART.dark};
  box-shadow:0 3px 10px rgba(15,23,42,.09);
}

.sw-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:10px;
  margin-bottom:18px;
}

.sw-stat{
  background:rgba(255,255,255,.78);
  border:1px solid #dceaf0;
  border-radius:15px;
  padding:14px 16px;
  box-shadow:none;
  position:relative;
  overflow:hidden;
}

.sw-stat:before{
  content:"";
  position:absolute;
  inset:0 0 auto 0;
  height:3px;
  background:#1ca9e1;
}

.sw-stat span{
  display:block;
  color:#64748b;
  font-size:11px;
  font-weight:1000;
  text-transform:uppercase;
}

.sw-stat strong{
  display:block;
  font-size:27px;
  margin-top:5px;
}

.sw-panel{
  background:white;
  border:1px solid #dceaf0;
  border-radius:18px;
  padding:22px;
  box-shadow:0 10px 26px rgba(15,23,42,.045);
  margin-bottom:16px;
}

.sw-panel-head{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
  margin-bottom:14px;
}

.sw-panel h2{
  margin:0;
  font-size:23px;
}

.sw-panel p{
  margin:6px 0 0;
  color:#64748b;
  font-weight:800;
  line-height:1.55;
}

.sw-input,.sw-select,.sw-textarea{
  width:100%;
  border:1px solid #cbd5e1;
  border-radius:15px;
  padding:12px;
  outline:none;
  font-weight:900;
  background:white;
  font-family:inherit;
}

.sw-input:focus,.sw-select:focus,.sw-textarea:focus{
  border-color:${SMART.blue};
  box-shadow:0 0 0 4px rgba(28,169,225,.12);
}

.sw-textarea{
  min-height:92px;
  resize:vertical;
}

.sw-list{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
}

.sw-card{
  border:1px solid #dbeafe;
  background:linear-gradient(180deg,#fff,#f8fcff);
  border-radius:24px;
  padding:15px;
  box-shadow:0 12px 28px rgba(15,23,42,.05);
}

.sw-card-top{
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.sw-card h3{
  margin:0;
  font-size:18px;
}

.sw-meta{
  color:#64748b;
  font-size:12px;
  font-weight:800;
  margin-top:5px;
  line-height:1.5;
}

.sw-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:10px;
}

.sw-tag{
  font-size:11px;
  font-weight:1000;
  padding:5px 8px;
  border-radius:999px;
  background:#eef7ff;
  color:#0369a1;
}

.sw-tag.ok{
  background:#dcfce7;
  color:#15803d;
}

.sw-tag.progress{
  background:#dbeafe;
  color:#1d4ed8;
}

.sw-tag.warn{
  background:#fff7ed;
  color:#c2410c;
}

.sw-tag.bad{
  background:#fee2e2;
  color:#b91c1c;
}

.sw-tag.idle{
  background:#f1f5f9;
  color:#475569;
}

.sw-items{
  display:flex;
  flex-direction:column;
  gap:10px;
  margin-top:13px;
}

.sw-item{
  border-radius:18px;
  border:1px solid #fecdd3;
  background:#fff1f2;
  padding:12px;
  display:flex;
  justify-content:space-between;
  gap:10px;
  align-items:flex-start;
}

.sw-item.ok{
  border-color:#86efac;
  background:#f0fdf4;
}

.sw-item.progress{
  border-color:#93c5fd;
  background:#eff6ff;
}

.sw-item.warn{
  border-color:#fdba74;
  background:#fff7ed;
}

.sw-item.bad{
  border-color:#fecaca;
  background:#fef2f2;
}

.sw-item b{
  display:block;
  font-size:14px;
}

.sw-item-actions{
  display:flex;
  gap:7px;
  flex-wrap:wrap;
  justify-content:flex-end;
}

.sw-empty{
  border:1px dashed #cbd5e1;
  border-radius:20px;
  padding:28px;
  text-align:center;
  color:#64748b;
  font-weight:900;
  background:#f8fafc;
}

.sw-alert{
  padding:13px 15px;
  border-radius:18px;
  background:#fff1f2;
  border:1px solid #fecaca;
  color:#b91c1c;
  font-weight:900;
  margin:14px 0;
}

.sw-ok-alert{
  padding:13px 15px;
  border-radius:18px;
  background:#f0fdf4;
  border:1px solid #bbf7d0;
  color:#15803d;
  font-weight:900;
  margin:14px 0;
}

.sw-morpho-layout{
  display:grid;
  grid-template-columns:310px 1fr;
  gap:14px;
}

.sw-filter-box{
  background:#f8fafc;
  border:1px solid #e2e8f0;
  border-radius:22px;
  padding:14px;
  height:max-content;
}

.sw-stack{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.sw-history{
  display:flex;
  flex-direction:column;
  gap:10px;
}

.sw-history-item{
  border:1px solid #dbeafe;
  background:white;
  border-radius:20px;
  padding:14px;
  display:flex;
  gap:12px;
  align-items:flex-start;
}

.sw-dot{
  width:12px;
  height:12px;
  border-radius:50%;
  margin-top:5px;
  background:${SMART.blue};
  box-shadow:0 0 0 5px rgba(28,169,225,.12);
}

.sw-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.58);
  backdrop-filter:blur(8px);
  z-index:1000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:16px;
}

.sw-modal{
  width:min(760px,96vw);
  max-height:92vh;
  overflow:auto;
  background:white;
  border-radius:28px;
  border:1px solid #dbeafe;
  box-shadow:0 35px 100px rgba(0,0,0,.32);
}

.sw-modal-head{
  padding:18px;
  background:linear-gradient(135deg,${SMART.dark},${SMART.blue});
  color:white;
  display:flex;
  justify-content:space-between;
  gap:12px;
  align-items:flex-start;
}

.sw-modal-head h2{
  margin:0;
  font-size:22px;
}

.sw-modal-head p{
  margin:6px 0 0;
  color:#eaf8ff;
  font-weight:800;
}

.sw-close{
  border:1px solid rgba(255,255,255,.3);
  background:rgba(255,255,255,.16);
  color:white;
  width:40px;
  height:40px;
  border-radius:14px;
  font-size:22px;
  cursor:pointer;
}

.sw-modal-body{
  padding:18px;
}

.sw-step{
  border:1px solid #e2e8f0;
  border-radius:18px;
  padding:12px;
  margin-bottom:9px;
  display:flex;
  gap:10px;
  align-items:flex-start;
  cursor:pointer;
  background:#f8fafc;
}

.sw-step.done{
  background:#f0fdf4;
  border-color:#86efac;
}

.sw-step-number{
  width:28px;
  height:28px;
  border-radius:50%;
  background:${SMART.blue};
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:1000;
  flex:0 0 auto;
}

.sw-result-box{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  margin-top:12px;
}

.sw-result-choice{
  border:1px solid #dbeafe;
  background:#f8fafc;
  border-radius:18px;
  padding:14px;
  cursor:pointer;
  font-weight:1000;
}

.sw-result-choice.active.ok{
  border-color:#86efac;
  background:#f0fdf4;
  color:#15803d;
}

.sw-result-choice.active.bad{
  border-color:#fdba74;
  background:#fff7ed;
  color:#c2410c;
}

.sw-debug{
  background:#0f172a;
  color:#e2e8f0;
  border-radius:16px;
  padding:12px;
  font-size:11px;
  overflow:auto;
  max-height:180px;
  direction:ltr;
  text-align:left;
}

.sw-modal-foot{
  padding:15px 18px;
  border-top:1px solid #e2e8f0;
  display:flex;
  justify-content:space-between;
  gap:10px;
  flex-wrap:wrap;
}

@media(max-width:1050px){
  .sw-grid{grid-template-columns:repeat(2,1fr)}
  .sw-list{grid-template-columns:1fr}
  .sw-morpho-layout{grid-template-columns:1fr}
}

@media(max-width:650px){
  .software-page{padding:18px 12px 28px}
  .sw-hero{
    flex-direction:column;
    border-radius:18px;
    padding:18px;
  }
  .sw-hero h1{font-size:24px}
  .sw-tabs{width:100%;overflow:auto}
  .sw-tab{white-space:nowrap;flex:1;padding:10px 12px}
  .sw-grid{grid-template-columns:1fr}
  .sw-panel{border-radius:22px;padding:14px}
  .sw-panel-head{flex-direction:column}
  .sw-card-top{flex-direction:column}
  .sw-item{flex-direction:column}
  .sw-item-actions{justify-content:flex-start}
  .sw-user-strip{flex-direction:column;align-items:flex-start}
  .sw-user-badge{white-space:normal}
  .sw-result-box{grid-template-columns:1fr}
}
`;

export function SoftwarePage({ currentUser, onOpenProblems }) {
  const loggedUser = currentUser || getStoredUser();
  const loggedUserId = getLoggedUserId(currentUser);

  const [tab, setTab] = useState("TASKS");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tasks, setTasks] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activity, setActivity] = useState([]);

  const [deviceSearch, setDeviceSearch] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("ALL");

  const [issueModal, setIssueModal] = useState(null);
  const [morphoModal, setMorphoModal] = useState(null);

  const [issues, setIssues] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [doneSolutions, setDoneSolutions] = useState([]);
  const [solved, setSolved] = useState("");
  const [modalNotes, setModalNotes] = useState("");
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [lastPayload, setLastPayload] = useState(null);

  const [morphoResult, setMorphoResult] = useState("FIXED");
  const [morphoNotes, setMorphoNotes] = useState("");

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = styles;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  const loadTasks = useCallback(async () => {
    if (!loggedUserId) {
      setTasks([]);
      return;
    }

    const paths = [
      `/inspection-tasks/technician/${loggedUserId}`,
      `/inspection-tasks?assignedToId=${loggedUserId}`,
      `/inspection-tasks/technician/${loggedUserId}?taskType=SOFTWARE`,
      `/inspection-tasks/technician/${loggedUserId}?assetType=SOFTWARE`,
      `/inspection-tasks?assignedToId=${loggedUserId}&taskType=SOFTWARE`,
      `/inspection-tasks?assignedToId=${loggedUserId}&assetType=SOFTWARE`,
    ];

    const merged = await fetchMerged(paths);

    const normalized = merged
      .map(normalizeTask)
      .filter((task) => {
        const assignedToId =
          task?.assignedToId ||
          task?.assignedTo?.id ||
          task?.technicianId ||
          task?.technician?.id;

        const hasAssignedItem = (task?.items || []).some((item) => {
          return (
            String(item?.assignedToId || item?.assignedTo?.id || "") ===
            String(loggedUserId)
          );
        });

        return (
          String(assignedToId || "") === String(loggedUserId) ||
          hasAssignedItem
        );
      });

    setTasks(normalized);
  }, [loggedUserId]);

  const loadDevices = useCallback(async () => {
    const data = await tryPaths(["/devices/morpho-candidates", "/devices"]).catch(
      () => []
    );

    setDevices(toArray(data));
  }, []);

  const loadActivity = useCallback(async () => {
    if (!loggedUserId) {
      setActivity([]);
      return;
    }

    const data = await tryPaths([
      `/inspection-tasks/activity?technicianId=${loggedUserId}`,
      `/technician-activity?technicianId=${loggedUserId}`,
      `/activity?technicianId=${loggedUserId}`,
    ]).catch(() => []);

    setActivity(toArray(data));
  }, [loggedUserId]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([loadTasks(), loadDevices(), loadActivity()]);
    } catch (e) {
      setError(e.message || "Failed to load page");
    } finally {
      setLoading(false);
    }
  }, [loadTasks, loadDevices, loadActivity]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const allItems = useMemo(() => tasks.flatMap((t) => t.items || []), [tasks]);

  const summary = useMemo(() => {
    const done = allItems.filter((i) => statusClass(i.status) === "ok").length;
    const progress = allItems.filter(
      (i) => statusClass(i.status) === "progress"
    ).length;
    const issuesCount = allItems.filter(
      (i) => statusClass(i.status) === "warn" || statusClass(i.status) === "bad"
    ).length;
    const pending = allItems.filter((i) => statusClass(i.status) === "idle").length;

    return {
      tasks: tasks.length,
      items: allItems.length,
      done,
      progress,
      issues: issuesCount,
      pending,
      devices: devices.length,
    };
  }, [tasks, allItems, devices]);

  const filteredDevices = useMemo(() => {
    const q = deviceSearch.trim().toLowerCase();

    return devices.filter((d) => {
      const status = String(d.currentStatus || "").toUpperCase();
      const text = [
        d.deviceName,
        d.name,
        d.deviceCode,
        d.barcode,
        d.serialNumber,
        d.ipAddress,
        d.modelNumber,
        d.currentStatus,
        deviceLocation(d),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (q && !text.includes(q)) return false;
      if (deviceStatus !== "ALL" && status !== deviceStatus) return false;

      return true;
    });
  }, [devices, deviceSearch, deviceStatus]);

  async function loadSolutions(issueId) {
    const issueIdNumber = toNumber(issueId);

    if (issueIdNumber === null) {
      setSolutions([]);
      setDoneSolutions([]);
      return;
    }

    setLoadingSteps(true);
    setSolutions([]);
    setDoneSolutions([]);

    try {
      const data = await tryPaths([
        `/issues/${issueIdNumber}/solutions`,
        `/issues/solutions/${issueIdNumber}`,
        `/issue-solutions?issueId=${issueIdNumber}`,
      ]).catch(() => []);

      const list = toArray(data)
        .map(normalizeSolution)
        .filter((s) => s._idNumber !== null)
        .sort((a, b) => Number(a.stepOrder || 0) - Number(b.stepOrder || 0));

      setSolutions(list);
    } catch (e) {
      setError(e.message || "Failed to load solutions");
    } finally {
      setLoadingSteps(false);
    }
  }

  async function openIssueModal(task, item) {
    setIssueModal({ task, item });
    setIssues([]);
    setSolutions([]);
    setSelectedIssueId("");
    setDoneSolutions([]);
    setSolved("");
    setModalNotes("");
    setLastPayload(null);
    setLoadingSteps(true);
    setError("");

    try {
      const deviceId = item.deviceId;

      const issueData = await fetchMerged([
        deviceId ? `/issues/device/${deviceId}` : "",
        deviceId ? `/issues?deviceId=${deviceId}` : "",
        `/issues?assetType=SOFTWARE`,
        `/issues`,
      ].filter(Boolean)).catch(() => []);

      const normalizedIssues = issueData
        .map(normalizeIssue)
        .filter((issue) => issue._idNumber !== null);

      setIssues(normalizedIssues);

      const firstIssue = normalizedIssues[0];

      if (firstIssue?._idNumber !== null && firstIssue?._idNumber !== undefined) {
        setSelectedIssueId(String(firstIssue._idNumber));
        await loadSolutions(firstIssue._idNumber);
      }
    } catch (e) {
      setError(e.message || "Failed to load issues");
    } finally {
      setLoadingSteps(false);
    }
  }

  async function handleIssueChange(value) {
    setSelectedIssueId(value);
    setDoneSolutions([]);
    await loadSolutions(value);
  }

  function toggleSolution(solution) {
    const id = solution?._idNumber;

    if (id === null || id === undefined) {
      setError("This step does not have a valid database ID.");
      return;
    }

    const key = String(id);

    setDoneSolutions((old) =>
      old.includes(key) ? old.filter((x) => x !== key) : [...old, key]
    );
  }

  function buildCompletedSolutionIds() {
    return doneSolutions
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && !Number.isNaN(id));
  }

  function buildCompletedSolutionObjects(ids) {
    const idSet = new Set(ids.map(String));

    return solutions
      .filter((s) => idSet.has(String(s._idNumber)))
      .map((s) => ({
        id: s._idNumber,
        title: s.title,
        description: s.description,
        stepOrder: s.stepOrder,
      }));
  }

  async function submitTaskItem({
    task,
    item,
    itemStatus,
    inspectionStatus,
    note,
  }) {
    const key = `complete-${task.id}-${item.id}`;

    setBusy(key);
    setError("");
    setSuccess("");

    try {
      if (!loggedUserId) {
        throw new Error("User id not found. Please logout and login again.");
      }

      if (!item.backendItemId && item.id && String(item.id).startsWith("device-")) {
        throw new Error("Backend item id is missing for this task item.");
      }

      const completedSolutionIds = buildCompletedSolutionIds();
      const issueIdNumber = toNumber(selectedIssueId);
      const completedSolutionObjects =
        buildCompletedSolutionObjects(completedSolutionIds);

      const payload = {
        itemId: Number(item.backendItemId || item.id),
        technicianId: Number(loggedUserId),
        itemStatus,
        inspectionStatus,

        issueId: issueIdNumber,
        completedSolutionIds,
        solutionIds: completedSolutionIds,
        doneSolutionIds: completedSolutionIds,
        completedStepIds: completedSolutionIds,
        completedSolutions: completedSolutionObjects,

        notes: note || modalNotes || null,
        completionNote: note || modalNotes || null,
        isResolved:
          itemStatus === "DONE" || inspectionStatus === "OK" || solved === "YES",
      };

      setLastPayload(payload);
      console.log("SAVE_SOFTWARE_RESULT_BODY", payload);

      await api(`/inspection-tasks/${task.id}/complete-item`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setIssueModal(null);
      setSuccess("تم حفظ نتيجة المهمة بنجاح");
      await Promise.all([loadTasks(), loadActivity()]);
    } catch (e) {
      setError(e.message || "Failed to complete item");
    } finally {
      setBusy("");
    }
  }

  async function quickDone(task, item) {
    setSelectedIssueId("");
    setDoneSolutions([]);
    setSolved("YES");

    await submitTaskItem({
      task,
      item,
      itemStatus: "DONE",
      inspectionStatus: "OK",
      note: "Software check completed successfully",
    });
  }

  async function quickNotReachable(task, item) {
    setSelectedIssueId("");
    setDoneSolutions([]);
    setSolved("NO");

    await submitTaskItem({
      task,
      item,
      itemStatus: "NOT_REACHABLE",
      inspectionStatus: "NOT_REACHABLE",
      note: "Device not reachable",
    });
  }

  async function saveIssueResult() {
    if (!issueModal) return;

    const issueIdNumber = toNumber(selectedIssueId);
    const completedSolutionIds = buildCompletedSolutionIds();

    if (issues.length > 0 && issueIdNumber === null) {
      alert("يرجى اختيار المشكلة أولاً");
      return;
    }

    if (solutions.length > 0 && completedSolutionIds.length === 0) {
      alert("يرجى تحديد خطوة واحدة على الأقل");
      return;
    }

    if (!solved) {
      alert("يرجى تحديد هل تم حل المشكلة أم لا");
      return;
    }

    const itemStatus = solved === "YES" ? "DONE" : "ISSUE_FOUND";
    const inspectionStatus = solved === "YES" ? "OK" : "NOT_OK";

    await submitTaskItem({
      task: issueModal.task,
      item: issueModal.item,
      itemStatus,
      inspectionStatus,
      note:
        modalNotes ||
        (solved === "YES"
          ? "Issue solved after software steps"
          : "Issue still exists after software steps"),
    });
  }

  function openMorphoModal(device) {
    setMorphoModal(device);
    setMorphoResult(
      String(device.currentStatus || "").toUpperCase() === "OK"
        ? "STILL_BROKEN"
        : "FIXED"
    );
    setMorphoNotes("");
  }

  async function saveMorphoStatus() {
    if (!morphoModal) return;

    setBusy(`morpho-${morphoModal.id}`);
    setError("");
    setSuccess("");

    try {
      if (!loggedUserId) {
        throw new Error("User id not found. Please logout and login again.");
      }

      await api(`/devices/${morphoModal.id}/morpho-status`, {
        method: "POST",
        body: JSON.stringify({
          technicianId: Number(loggedUserId),
          morphoResult,
          notes: morphoNotes || null,
        }),
      });

      setMorphoModal(null);
      setSuccess("تم تحديث حالة Morpho بنجاح");
      await Promise.all([loadDevices(), loadActivity()]);
    } catch (e) {
      setError(e.message || "Failed to update Morpho status");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="software-page">
      <div className="sw-hero">
        <div className="sw-brand">
          <div>
            <h1>Smart IT Software & Morpho Center</h1>
            <p>
              مركز متابعة مهام السوفت وير، مراجعة حالات Morpho، وتسجيل سجل
              العمليات.
            </p>
          </div>
        </div>

        <div className="sw-actions">
          <button className="sw-btn white" type="button" onClick={onOpenProblems}>
            Software Problems
          </button>
          <button className="sw-btn white" onClick={loadAll} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="sw-user-strip">
        <div>
          <h2>مهام {userName(loggedUser)}</h2>
          <p>كل المهام المرسلة من الأدمن تظهر هنا مباشرة من الباك إند.</p>
        </div>

        <div className="sw-user-badge">
          ID #{loggedUserId || "—"} • Software User
        </div>
      </div>

      {error && <div className="sw-alert">{error}</div>}
      {success && <div className="sw-ok-alert">{success}</div>}

      <div className="sw-grid">
        <div className="sw-stat">
          <span>Global Tasks</span>
          <strong>{summary.tasks}</strong>
        </div>

        <div className="sw-stat">
          <span>Assigned Devices</span>
          <strong>{summary.items}</strong>
        </div>

        <div className="sw-stat">
          <span>Done</span>
          <strong>{summary.done}</strong>
        </div>

        <div className="sw-stat">
          <span>Morpho Devices</span>
          <strong>{summary.devices}</strong>
        </div>
      </div>

      <div className="sw-tabs">
        <button
          className={`sw-tab ${tab === "TASKS" ? "active" : ""}`}
          onClick={() => setTab("TASKS")}
        >
          Global Tasks
        </button>

        <button
          className={`sw-tab ${tab === "MORPHO" ? "active" : ""}`}
          onClick={() => setTab("MORPHO")}
        >
          Morpho Review
        </button>

        <button
          className={`sw-tab ${tab === "HISTORY" ? "active" : ""}`}
          onClick={() => setTab("HISTORY")}
        >
          History
        </button>
      </div>

      {tab === "TASKS" && (
        <TasksSection
          tasks={tasks}
          loading={loading}
          busy={busy}
          loggedUserId={loggedUserId}
          loggedUser={loggedUser}
          onOpenIssueModal={openIssueModal}
          onQuickDone={quickDone}
          onQuickNotReachable={quickNotReachable}
        />
      )}

      {tab === "MORPHO" && (
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

          <div className="sw-morpho-layout">
            <MorphoFilter
              deviceSearch={deviceSearch}
              deviceStatus={deviceStatus}
              onSearchChange={setDeviceSearch}
              onStatusChange={setDeviceStatus}
              onRefresh={loadDevices}
            />

            <MorphoSection
              filteredDevices={filteredDevices}
              loading={loading}
              busy={busy}
              loggedUserId={loggedUserId}
              onLoadDevices={loadDevices}
              onStatusUpdate={saveMorphoStatus}
              onModalOpen={openMorphoModal}
            />
          </div>
        </div>
      )}

      {tab === "HISTORY" && (
        <div className="sw-panel">
          <div className="sw-panel-head">
            <div>
              <h2>History</h2>
              <p>كل العمليات المسجلة: Done، مشاكل، وتحديثات Morpho.</p>
            </div>

            <button className="sw-btn white" onClick={loadActivity}>
              Refresh History
            </button>
          </div>

          {activity.length === 0 ? (
            <div className="sw-empty">
              لا توجد سجلات ظاهرة من الباك إند حالياً.
            </div>
          ) : (
            <div className="sw-history">
              {activity.map((a, idx) => (
                <div className="sw-history-item" key={a.id || idx}>
                  <div className="sw-dot" />

                  <div>
                    <b>{a.title || a.action || "Activity"}</b>

                    <div className="sw-meta">
                      {a.message || a.notes || "—"}
                      <br />
                      {formatDate(a.createdAt)}
                    </div>

                    <div className="sw-tags">
                      {a.beforeStatus && (
                        <span className="sw-tag warn">
                          Before {statusAr(a.beforeStatus)}
                        </span>
                      )}

                      {a.afterStatus && (
                        <span className="sw-tag ok">
                          After {statusAr(a.afterStatus)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <SolutionsModal
        issueModal={issueModal}
        loadingSteps={loadingSteps}
        issues={issues}
        selectedIssueId={selectedIssueId}
        solutions={solutions}
        doneSolutions={doneSolutions}
        solved={solved}
        modalNotes={modalNotes}
        lastPayload={lastPayload}
        busy={busy}
        onClose={() => setIssueModal(null)}
        onIssueChange={handleIssueChange}
        onToggleSolution={toggleSolution}
        onSolvedChange={setSolved}
        onNotesChange={setModalNotes}
        onSave={saveIssueResult}
      />

      <MorphoModal
        morphoModal={morphoModal}
        morphoResult={morphoResult}
        morphoNotes={morphoNotes}
        busy={busy}
        onClose={() => setMorphoModal(null)}
        onResultChange={setMorphoResult}
        onNotesChange={setMorphoNotes}
        onSave={saveMorphoStatus}
      />
    </section>
  );
}

export default SoftwarePage;
