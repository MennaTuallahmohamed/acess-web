export const MONITORING_CSS = `
  .snapshot-root {
    min-height: 100%;
    padding: 32px;
    background:
      linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(15, 23, 42, 0.025) 1px, transparent 1px),
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.08), transparent 24%),
      radial-gradient(circle at top left, rgba(59, 130, 246, 0.10), transparent 28%),
      linear-gradient(180deg, #eef3f8 0%, #e7edf4 100%);
    background-size: 24px 24px, 24px 24px, auto, auto, auto;
  }

  .snapshot-command-grid,
  .snapshot-panels,
  .snapshot-strategic-grid {
    display: grid;
    gap: 24px;
  }

  .snapshot-command-grid {
    grid-template-columns: 1.65fr 0.95fr;
    margin-bottom: 24px;
  }

  .snapshot-command-main {
    border-radius: 34px;
    padding: 30px 32px;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 24%),
      radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.14), transparent 28%),
      linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #243b53 100%);
    border: 1px solid rgba(30, 41, 59, 0.65);
    box-shadow: 0 22px 50px rgba(15, 23, 42, 0.22);
  }

  .snapshot-command-main::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
  }

  .snapshot-command-topline,
  .snapshot-command-title-wrap,
  .snapshot-command-metrics,
  .snapshot-panel-head,
  .snapshot-mini-head,
  .snapshot-feed-top,
  .snapshot-location-top,
  .snapshot-ranking-item,
  .snapshot-readiness-head {
    position: relative;
    z-index: 1;
  }

  .snapshot-command-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .snapshot-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.10);
    color: #dbeafe;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .snapshot-command-tag {
    display: inline-flex;
    align-items: center;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.14);
    color: #dbeafe;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  .snapshot-command-title-wrap {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 24px;
    align-items: end;
  }

  .snapshot-command-label {
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #93c5fd;
    text-transform: uppercase;
  }

  .snapshot-command-total {
    margin-top: 10px;
    font-size: 96px;
    font-weight: 900;
    line-height: 0.9;
    color: #f8fafc;
    letter-spacing: -0.07em;
  }

  .snapshot-command-subtitle {
    margin-top: 18px;
    max-width: 720px;
    color: #cbd5e1;
    font-size: 15px;
    line-height: 1.8;
    font-weight: 500;
  }

  .snapshot-command-brief {
    padding: 18px;
    border-radius: 22px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .snapshot-command-brief-label,
  .snapshot-command-metric span,
  .snapshot-field label,
  .snapshot-mini-stat-label,
  .snapshot-side-title,
  .snapshot-location-stat span {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .snapshot-command-brief-label,
  .snapshot-command-metric span {
    color: #93c5fd;
  }

  .snapshot-command-brief-value {
    font-size: 18px;
    color: #f8fafc;
    font-weight: 800;
  }

  .snapshot-command-brief-meta {
    font-size: 13px;
    color: #cbd5e1;
    line-height: 1.6;
    font-weight: 600;
  }

  .snapshot-command-metrics {
    margin-top: 22px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
  }

  .snapshot-command-metric {
    padding: 16px;
    border-radius: 18px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
  }

  .snapshot-command-metric strong {
    display: block;
    margin-top: 8px;
    font-size: 28px;
    color: #f8fafc;
    font-weight: 900;
  }

  .snapshot-command-side,
  .snapshot-panel,
  .snapshot-filterbar,
  .snapshot-kpi,
  .snapshot-strategic-card {
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(226, 232, 240, 0.9);
    box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
  }

  .snapshot-command-side {
    border-radius: 30px;
    padding: 24px;
  }

  .snapshot-side-title {
    color: #475569;
  }

  .snapshot-readiness-stack,
  .snapshot-card-list,
  .snapshot-feed,
  .snapshot-top-locations,
  .snapshot-ranking,
  .snapshot-analytics-stack {
    display: grid;
    gap: 14px;
  }

  .snapshot-readiness-card,
  .snapshot-mini-card,
  .snapshot-feed-item,
  .snapshot-location-card,
  .snapshot-analytics-card,
  .snapshot-ranking-item,
  .snapshot-top-location-item {
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: linear-gradient(180deg, #ffffff 0%, #f5f8fc 100%);
  }

  .snapshot-readiness-card,
  .snapshot-mini-card,
  .snapshot-feed-item,
  .snapshot-analytics-card,
  .snapshot-ranking-item,
  .snapshot-top-location-item {
    padding: 16px;
  }

  .snapshot-readiness-head,
  .snapshot-panel-head,
  .snapshot-mini-head,
  .snapshot-feed-top,
  .snapshot-location-top,
  .snapshot-analytics-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .snapshot-readiness-head,
  .snapshot-analytics-label {
    font-size: 13px;
    font-weight: 800;
    color: #334155;
  }

  .snapshot-readiness-head strong,
  .snapshot-panel-title,
  .snapshot-mini-title,
  .snapshot-location-name,
  .snapshot-ranking-body strong,
  .snapshot-top-location-body strong {
    color: #0f172a;
  }

  .snapshot-readiness-bar,
  .snapshot-distribution-bar,
  .snapshot-analytics-bar {
    margin-top: 12px;
    width: 100%;
    height: 12px;
    border-radius: 999px;
    background: #e2e8f0;
    overflow: hidden;
    display: flex;
  }

  .snapshot-readiness-fill,
  .snapshot-distribution-fill,
  .snapshot-analytics-fill {
    height: 100%;
  }

  .snapshot-readiness-fill.good,
  .snapshot-distribution-fill.good,
  .snapshot-analytics-fill.good { background: linear-gradient(90deg, #22c55e, #4ade80); }
  .snapshot-readiness-fill.warn,
  .snapshot-distribution-fill.warn,
  .snapshot-analytics-fill.warn { background: linear-gradient(90deg, #f59e0b, #fb7185); }
  .snapshot-readiness-fill.neutral,
  .snapshot-distribution-fill.neutral,
  .snapshot-analytics-fill.neutral { background: linear-gradient(90deg, #3b82f6, #60a5fa); }

  .snapshot-kpi-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 18px;
    margin-bottom: 24px;
  }

  .snapshot-kpi {
    border-radius: 22px;
    padding: 20px;
    cursor: pointer;
    transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease;
    position: relative;
    overflow: hidden;
  }

  .snapshot-kpi::after {
    content: "";
    position: absolute;
    inset: auto 0 0 0;
    height: 4px;
    background: var(--snapshot-accent, linear-gradient(90deg, #4f46e5, #0ea5e9));
  }

  .snapshot-kpi:hover,
  .snapshot-kpi.active {
    transform: translateY(-4px);
    border-color: rgba(99, 102, 241, 0.35);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  }

  .snapshot-kpi-icon {
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.05);
    font-size: 22px;
  }

  .snapshot-kpi-label {
    margin-top: 14px;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
  }

  .snapshot-kpi-value,
  .snapshot-side-value,
  .snapshot-analytics-big {
    margin-top: 10px;
    font-size: 34px;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
  }

  .snapshot-kpi-sub,
  .snapshot-panel-sub,
  .snapshot-mini-sub,
  .snapshot-feed-sub,
  .snapshot-feed-time,
  .snapshot-location-sub,
  .snapshot-side-sub,
  .snapshot-top-location-body span,
  .snapshot-ranking-body span,
  .snapshot-ranking-metrics {
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    line-height: 1.6;
  }

  .snapshot-filterbar {
    border-radius: 24px;
    padding: 18px;
    display: grid;
    grid-template-columns: 2fr repeat(4, minmax(0, 1fr)) auto;
    gap: 14px;
    margin-bottom: 24px;
  }

  .snapshot-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .snapshot-field-wide {
    grid-column: span 2;
  }

  .snapshot-field label,
  .snapshot-mini-stat-label,
  .snapshot-location-stat span {
    color: #64748b;
  }

  .snapshot-input,
  .snapshot-select,
  .snapshot-btn {
    min-height: 46px;
    border-radius: 14px;
    border: 1px solid #dbe4ef;
    background: #f8fbff;
    padding: 0 14px;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .snapshot-input:focus,
  .snapshot-select:focus {
    background: #fff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.10);
  }

  .snapshot-btn {
    cursor: pointer;
    background: linear-gradient(135deg, #0f172a, #1e293b);
    color: #fff;
    font-weight: 800;
    margin-top: auto;
  }

  .snapshot-btn:hover {
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
  }

  .snapshot-panels {
    grid-template-columns: 1.45fr 1fr;
  }

  .snapshot-home-panels {
    align-items: start;
  }

  .snapshot-strategic-grid {
    grid-template-columns: 1.1fr 0.9fr;
    margin-bottom: 24px;
  }

  .snapshot-panel,
  .snapshot-strategic-card {
    border-radius: 28px;
    padding: 24px;
  }

  .snapshot-panel-head {
    align-items: flex-start;
    margin-bottom: 18px;
  }

  .snapshot-panel-title {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.03em;
  }

  .snapshot-table {
    width: 100%;
    border-collapse: collapse;
  }

  .snapshot-table th,
  .snapshot-table td {
    padding: 14px 12px;
    border-bottom: 1px solid #eef2f7;
    text-align: start;
    vertical-align: top;
  }

  .snapshot-table th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #64748b;
    font-weight: 800;
  }

  .snapshot-table td {
    font-size: 14px;
    color: #334155;
    font-weight: 600;
  }

  .snapshot-table tr:last-child td {
    border-bottom: none;
  }

  .snapshot-feed-item {
    display: grid;
    grid-template-columns: 18px 1fr;
    gap: 14px;
    align-items: start;
  }

  .snapshot-feed-dot {
    width: 12px;
    height: 12px;
    margin-top: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #22c55e);
    box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.10);
  }

  .snapshot-feed-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .snapshot-mini-grid,
  .snapshot-location-stats,
  .snapshot-analytics-grid {
    display: grid;
    gap: 12px;
  }

  .snapshot-mini-grid {
    margin-top: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .snapshot-location-stats {
    margin-top: 18px;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .snapshot-analytics-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .snapshot-mini-stat,
  .snapshot-location-stat {
    padding: 12px;
    border-radius: 16px;
    background: #fff;
    border: 1px solid #edf2f7;
  }

  .snapshot-mini-stat-value,
  .snapshot-location-stat strong {
    margin-top: 6px;
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.4;
    display: block;
  }

  .snapshot-location-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .snapshot-location-card {
    padding: 20px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .snapshot-location-card:hover,
  .snapshot-top-location-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  }

  .snapshot-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 800;
  }

  .snapshot-badge.good { background: #ecfdf5; color: #047857; }
  .snapshot-badge.warn { background: #fffbeb; color: #b45309; }
  .snapshot-badge.danger { background: #fef2f2; color: #b91c1c; }
  .snapshot-badge.neutral { background: #eff6ff; color: #1d4ed8; }

  .snapshot-badge-dot,
  .snapshot-legend {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: currentColor;
  }

  .snapshot-empty {
    border-radius: 24px;
    padding: 34px;
    border: 1px dashed #cbd5e1;
    text-align: center;
    font-size: 14px;
    color: #64748b;
    font-weight: 700;
    background: rgba(248, 250, 252, 0.72);
  }

  .snapshot-distribution {
    display: grid;
    gap: 16px;
  }

  .snapshot-distribution-legend,
  .snapshot-analytics-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .snapshot-distribution-legend {
    font-size: 14px;
    font-weight: 700;
    color: #334155;
  }

  .snapshot-top-location-item,
  .snapshot-ranking-item {
    display: grid;
    align-items: center;
  }

  .snapshot-top-location-item {
    grid-template-columns: 48px 1fr;
    gap: 12px;
  }

  .snapshot-ranking-item {
    grid-template-columns: 54px 1fr auto;
    gap: 14px;
  }

  .snapshot-top-location-rank,
  .snapshot-ranking-rank {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    color: #1d4ed8;
    background: #dbeafe;
  }

  .snapshot-top-location-rank {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    font-size: 17px;
  }

  .snapshot-ranking-rank {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    font-size: 18px;
  }

  @media (max-width: 1200px) {
    .snapshot-command-grid,
    .snapshot-panels,
    .snapshot-strategic-grid {
      grid-template-columns: 1fr;
    }

    .snapshot-kpi-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .snapshot-filterbar {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .snapshot-field-wide {
      grid-column: span 2;
    }

    .snapshot-command-title-wrap,
    .snapshot-command-metrics,
    .snapshot-analytics-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 720px) {
    .snapshot-root {
      padding: 18px;
    }

    .snapshot-kpi-grid,
    .snapshot-filterbar,
    .snapshot-mini-grid,
    .snapshot-location-stats,
    .snapshot-command-metrics,
    .snapshot-analytics-grid {
      grid-template-columns: 1fr;
    }

    .snapshot-command-total {
      font-size: 72px;
    }

    .snapshot-field-wide {
      grid-column: auto;
    }

    .snapshot-ranking-item {
      grid-template-columns: 1fr;
    }
  }
`;
