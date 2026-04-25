import React, { useState, useMemo, useEffect, useRef } from "react";
import { DataGrid } from "../components/DataGrid";

const LUX_LOC_CSS = `
  .lux-loc-root {
    padding: 32px;
    background: transparent;
    font-family: 'Inter', system-ui, sans-serif;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  /* Header */
  .lux-loc-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
    flex-wrap: wrap;
  }
  .lux-loc-title {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    letter-spacing: -0.5px;
  }
  .lux-loc-sub {
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .lux-loc-sub::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #10b981;
  }

  /* Actions */
  .lux-loc-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .lux-btn {
    padding: 10px 18px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: none;
  }
  .lux-btn:active { transform: scale(0.95); }

  .lux-btn-export {
    background: #fff;
    color: #475569;
    border: 1px solid #cbd5e1;
    box-shadow: 0 2px 5px rgba(0,0,0,0.02);
  }
  .lux-btn-export:hover {
    background: #f8fafc;
    border-color: #94a3b8;
    color: #0f172a;
  }

  .lux-btn-import {
    background: #4f46e5;
    color: #fff;
    box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  }
  .lux-btn-import:hover {
    background: #4338ca;
    box-shadow: 0 6px 20px rgba(79,70,229,0.4);
  }

  /* Filter Panel */
  .lux-loc-filters {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
    display: grid;
    grid-template-columns: minmax(240px, 2fr) repeat(5, minmax(140px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
    align-items: end;
  }

  .lux-f-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .lux-f-group label {
    font-size: 11px;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .lux-f-input {
    height: 40px;
    padding: 0 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    background: #f8fafc;
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    transition: all 0.2s;
    width: 100%;
  }

  .lux-f-input:focus {
    border-color: #4f46e5;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(79,70,229,0.1);
  }
  
  .lux-f-search {
    position: relative;
    min-width: 240px;
  }

  .lux-f-search input {
    padding-left: 42px;
    width: 100%;
  }

  .lux-f-search svg {
    position: absolute;
    left: 14px;
    top: 11px;
    color: #94a3b8;
    width: 18px;
    height: 18px;
  }

  /* Data Table Shell */
  .lux-loc-table-wrap {
    flex: 1;
    min-height: 0;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
  }
  
  /* Upload Overlay */
  .lux-upload-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15,23,42,0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  .lux-upload-card {
    background: #fff;
    width: 100%;
    max-width: 480px;
    border-radius: 24px;
    padding: 32px;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    text-align: center;
  }

  .lux-upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 16px;
    padding: 40px 20px;
    margin: 24px 0;
    cursor: pointer;
    transition: all 0.2s;
    background: #f8fafc;
  }

  .lux-upload-area:hover {
    border-color: #4f46e5;
    background: #e0e7ff;
  }

  .lux-upload-area.drag-active {
    border-color: #10b981;
    background: #ecfdf5;
  }

  @media (max-width: 1400px) {
    .lux-loc-filters {
      grid-template-columns: repeat(3, minmax(180px, 1fr));
    }
    .lux-f-search {
      grid-column: span 3;
    }
  }

  @media (max-width: 900px) {
    .lux-loc-root {
      padding: 20px;
    }
    .lux-loc-filters {
      grid-template-columns: repeat(2, minmax(160px, 1fr));
    }
    .lux-f-search {
      grid-column: span 2;
    }
  }

  @media (max-width: 640px) {
    .lux-loc-filters {
      grid-template-columns: 1fr;
    }
    .lux-f-search {
      grid-column: span 1;
    }
  }
`;

// Helper component for styled badge rendering
const Badge = ({ val, color }) => {
  if (!val) return <span style={{ color: "#cbd5e1" }}>—</span>;

  const colors = {
    blue: { bg: "#e0e7ff", text: "#4f46e5" },
    green: { bg: "#d1fae5", text: "#059669" },
    slate: { bg: "#f1f5f9", text: "#475569" },
    amber: { bg: "#fef3c7", text: "#b45309" },
  };

  const theme = colors[color] || colors.slate;

  return (
    <span
      style={{
        background: theme.bg,
        color: theme.text,
        padding: "4px 10px",
        borderRadius: "100px",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {val}
    </span>
  );
};

export function LocationsPage({ locations = [] }) {
  const [search, setSearch] = useState("");
  const [fCluster, setFCluster] = useState("ALL");
  const [fBuilding, setFBuilding] = useState("ALL");
  const [fZone, setFZone] = useState("ALL");
  const [fDirection, setFDirection] = useState("ALL");
  const [fType, setFType] = useState("ALL");

  const [showImport, setShowImport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let el = document.getElementById("lux-loc-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "lux-loc-css";
      el.innerHTML = LUX_LOC_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const uniqueOpts = useMemo(() => {
    const list = {
      cluster: new Set(),
      building: new Set(),
      zone: new Set(),
      direction: new Set(),
      type: new Set(),
    };

    locations.forEach((loc) => {
      if (loc.cluster) list.cluster.add(loc.cluster);
      if (loc.building) list.building.add(loc.building);
      if (loc.zone) list.zone.add(loc.zone);
      if (loc.direction) list.direction.add(loc.direction);
      if (loc.type) list.type.add(loc.type);
    });

    return {
      cluster: [...list.cluster].sort(),
      building: [...list.building].sort(),
      zone: [...list.zone].sort(),
      direction: [...list.direction].sort(),
      type: [...list.type].sort(),
    };
  }, [locations]);

  const filtered = useMemo(() => {
    return locations.filter((loc) => {
      if (search) {
        const text = [
          loc.cluster,
          loc.building,
          loc.zone,
          loc.direction,
          loc.type,
          loc.excelId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!text.includes(search.toLowerCase())) return false;
      }

      if (fCluster !== "ALL" && loc.cluster !== fCluster) return false;
      if (fBuilding !== "ALL" && loc.building !== fBuilding) return false;
      if (fZone !== "ALL" && loc.zone !== fZone) return false;
      if (fDirection !== "ALL" && loc.direction !== fDirection) return false;
      if (fType !== "ALL" && loc.type !== fType) return false;

      return true;
    });
  }, [locations, search, fCluster, fBuilding, fZone, fDirection, fType]);

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("No locations to export.");
      return;
    }

    const headers = ["ID", "Excel ID", "Cluster", "Building", "Zone", "Type", "Direction"];
    let csv = headers.join(",") + "\n";

    filtered.forEach((loc) => {
      const row = [
        loc.id,
        loc.excelId,
        loc.cluster,
        loc.building,
        loc.zone,
        loc.type,
        loc.direction,
      ]
        .map((v) => `"${v || ""}"`)
        .join(",");

      csv += row + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Locations_Export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulateImport = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      alert(`File "${file.name}" selected. Mapping structure...`);
      setShowImport(false);
    }
  };

  const columns = [
    {
      key: "excelId",
      label: "Excel ID / Code",
      render: (v) => (
        <span style={{ fontFamily: "monospace", fontWeight: 800 }}>
          {v || "—"}
        </span>
      ),
    },
    {
      key: "cluster",
      label: "Cluster Name",
      render: (v) => <Badge val={v} color="blue" />,
    },
    {
      key: "building",
      label: "Facility / Building",
      render: (v) => <Badge val={v} color="slate" />,
    },
    {
      key: "zone",
      label: "Detailed Zone",
      render: (v) => <span style={{ fontWeight: 600 }}>{v || "—"}</span>,
    },
    {
      key: "direction",
      label: "Direction",
      render: (v) => <Badge val={v} color="amber" />,
    },
    {
      key: "type",
      label: "Location Type",
      render: (v) => <Badge val={v} color="green" />,
    },
  ];

  return (
    <div className="lux-loc-root">
      <div className="lux-loc-head">
        <div>
          <h1 className="lux-loc-title">Facility & Location Mapping</h1>
          <p className="lux-loc-sub">
            Total {filtered.length} tracking zones mapped to sectors.
          </p>
        </div>

        <div className="lux-loc-actions">
          <button className="lux-btn lux-btn-export" onClick={handleExport}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Export Selection
          </button>

          <button className="lux-btn lux-btn-import" onClick={() => setShowImport(true)}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Import Database
          </button>
        </div>
      </div>

      <div className="lux-loc-filters">
        <div className="lux-f-group lux-f-search">
          <label>Broad Search</label>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="lux-f-input"
            type="text"
            placeholder="Search by Zone, Direction, Excel ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lux-f-group">
          <label>Cluster</label>
          <select
            className="lux-f-input"
            value={fCluster}
            onChange={(e) => setFCluster(e.target.value)}
          >
            <option value="ALL">All Clusters</option>
            {uniqueOpts.cluster.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-f-group">
          <label>Building / Facility</label>
          <select
            className="lux-f-input"
            value={fBuilding}
            onChange={(e) => setFBuilding(e.target.value)}
          >
            <option value="ALL">All Facilities</option>
            {uniqueOpts.building.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-f-group">
          <label>Zone</label>
          <select
            className="lux-f-input"
            value={fZone}
            onChange={(e) => setFZone(e.target.value)}
          >
            <option value="ALL">All Zones</option>
            {uniqueOpts.zone.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-f-group">
          <label>Direction</label>
          <select
            className="lux-f-input"
            value={fDirection}
            onChange={(e) => setFDirection(e.target.value)}
          >
            <option value="ALL">All Directions</option>
            {uniqueOpts.direction.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="lux-f-group">
          <label>Zone Type</label>
          <select
            className="lux-f-input"
            value={fType}
            onChange={(e) => setFType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            {uniqueOpts.type.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="lux-loc-table-wrap">
        <DataGrid data={filtered} columns={columns} keyField="id" />
      </div>

      {showImport && (
        <div className="lux-upload-overlay" onClick={() => setShowImport(false)}>
          <div className="lux-upload-card" onClick={(e) => e.stopPropagation()}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 800,
                margin: "0 0 8px 0",
                color: "#0f172a",
              }}
            >
              Import Locations
            </h2>

            <p style={{ fontSize: "13px", color: "#64748b" }}>
              Upload a CSV or Excel file containing the location directory tree. The backend will parse the document.
            </p>

            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              ref={fileInputRef}
              onChange={simulateImport}
              style={{ display: "none" }}
            />

            <div
              className={`lux-upload-area ${isDragging ? "drag-active" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                simulateImport({ target: { files: e.dataTransfer.files } });
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                Click to browse or drag drops file here
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
                Supported formats: .XLSX, .CSV (Max 10MB)
              </div>
            </div>

            <button
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "#f1f5f9",
                border: "none",
                color: "#475569",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onClick={() => setShowImport(false)}
            >
              Cancel Transaction
            </button>
          </div>
        </div>
      )}
    </div>
  );
}