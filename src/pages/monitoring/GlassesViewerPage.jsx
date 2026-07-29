import React from "react";

export default function GlassesViewerPage() {
  return (
    <section style={{ padding: "24px" }}>
      <h1>Gate Glass Viewer</h1>
      <p>This is the viewer version for gate glass monitoring.</p>
      <div
        style={{
          marginTop: "18px",
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(56, 189, 248, 0.08)",
          border: "1px solid rgba(56, 189, 248, 0.16)",
        }}
      >
        <p>
          Add viewer-facing glasses status and read-only overview content here.
        </p>
      </div>
    </section>
  );
}
