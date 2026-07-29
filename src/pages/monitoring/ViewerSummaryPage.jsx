import React, { useMemo } from "react";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
  marginTop: "20px",
};

const panelStyle = {
  background: "#ffffff",
  borderRadius: "20px",
  border: "1px solid #e2e8f0",
  padding: "24px",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.05)",
};

const titleStyle = {
  margin: 0,
  color: "#102033",
  fontSize: "28px",
  fontWeight: 800,
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#475569",
  fontSize: "14px",
  lineHeight: 1.7,
};

const labelStyle = {
  color: "#64748b",
  textTransform: "uppercase",
  fontSize: "12px",
  letterSpacing: "0.06em",
  fontWeight: 700,
  marginBottom: "10px",
};

const valueStyle = {
  fontSize: "34px",
  fontWeight: 900,
  color: "#111827",
};

const noteStyle = {
  marginTop: "12px",
  color: "#525252",
  fontSize: "13px",
  lineHeight: 1.75,
};

const buildKpis = ({ devices, locations, inspections }) => {
  const totalDevices = devices.length;
  const totalLocations = locations.length;
  const totalInspections = inspections.length;
  const healthyDevices = devices.filter((device) => device.currentStatus === "OK").length;
  const attentionDevices = devices.filter((device) => ["NEEDS_MAINTENANCE", "UNDER_MAINTENANCE", "OUT_OF_SERVICE"].includes(device.currentStatus)).length;
  const lastInspection = [...inspections]
    .sort((a, b) => new Date(b.inspectedAt || b.createdAt) - new Date(a.inspectedAt || a.createdAt))[0];

  return [
    {
      label: "Total Devices",
      value: totalDevices,
      note: "Devices available in the viewer scope.",
    },
    {
      label: "Healthy Devices",
      value: healthyDevices,
      note: "Devices currently reporting OK status.",
    },
    {
      label: "Needs Attention",
      value: attentionDevices,
      note: "Devices requiring maintenance or review.",
    },
    {
      label: "Inspections",
      value: totalInspections,
      note: "Total inspection checks loaded.",
    },
    {
      label: "Locations",
      value: totalLocations,
      note: "Monitored locations in the current feed.",
    },
    {
      label: "Latest Inspection",
      value: lastInspection
        ? new Date(lastInspection.inspectedAt || lastInspection.createdAt).toLocaleDateString()
        : "—",
      note: "Most recent inspection timestamp.",
    },
  ];
};

export function ViewerSummaryPage({ devices = [], locations = [], inspections = [] }) {
  const metrics = useMemo(() => buildKpis({ devices, locations, inspections }), [devices, locations, inspections]);

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#eef2ff" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h1 style={titleStyle}>Viewer Summary</h1>
        <p style={subtitleStyle}>
          A focused read-only summary for the viewer role, showing device health, inspection activity, and location coverage.
        </p>
      </div>

      <div style={gridStyle}>
        {metrics.map((metric) => (
          <section key={metric.label} style={panelStyle}>
            <div style={labelStyle}>{metric.label}</div>
            <div style={valueStyle}>{metric.value ?? "—"}</div>
            <div style={noteStyle}>{metric.note}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
