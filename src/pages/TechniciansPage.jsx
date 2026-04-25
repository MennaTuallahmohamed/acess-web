import React, { useMemo, useState, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */
const initials = (name = "") => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "U";

const calcPct = (v, t) => (t ? Math.round((v / t) * 100) : 0);

const initialForm = {
  firstName: "", lastName: "", email: "", username: "", password: "", phone: "", officeNumber: "", jobTitle: "TECHNICIAN", region: "", notes: "", roleId: 2,
};

/* ─────────────────────────────────────────────────────────────────
   INJECTED LUXURY CSS
───────────────────────────────────────────────────────────────── */
const LUX_CSS = `
  .lux-tp-root { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-tertiary, #f8fafc); min-height: 100vh; padding: 24px 32px; color: #0f172a; }
  
  /* Buttons */
  .lux-btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); color: #fff; font-weight: 600; font-size: 14px; border: none; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
  .lux-btn-primary:hover { box-shadow: 0 6px 16px rgba(99,102,241,0.4); transform: translateY(-1px); }
  .lux-btn-primary:disabled { opacity: 0.6; pointer-events: none; }
  
  .lux-btn-secondary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; background: #fff; color: #334155; font-weight: 600; font-size: 14px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s ease; }
  .lux-btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
  
  /* Header & KPIs */
  .lux-page-title { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0; color: #0f172a; }
  .lux-page-sub { font-size: 14px; color: #64748b; font-weight: 500; }
  
  .lux-kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 24px; margin-bottom: 32px; }
  .lux-kpi-card { background: #fff; padding: 24px; border-radius: 16px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display: flex; flex-direction: column; }
  .lux-kpi-title { font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .lux-kpi-val { font-size: 36px; font-weight: 800; color: #0f172a; line-height: 1; }
  
  /* Cards Grid */
  .lux-tech-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
  .lux-tech-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; transition: all 0.3s ease; cursor: pointer; display: flex; flex-direction: column; }
  .lux-tech-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.06); border-color: #c7d2fe; }
  .lux-tech-head { padding: 24px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #f1f5f9; position: relative; }
  .lux-tech-avatar { width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #4f46e5; border: 2px solid #fff; box-shadow: 0 4px 10px rgba(79,70,229,0.15); flex-shrink: 0; }
  .lux-tech-status { position: absolute; top: 24px; right: 24px; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 0 4px #ecfdf5; }
  .lux-tech-body { padding: 20px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; flex: 1; }
  .lux-tech-stat { display: flex; flex-direction: column; gap: 4px; }
  
  /* Modal & Slide-over */
  .lux-modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; animation: luxFadeIn 0.2s forwards; }
  .lux-modal-body { background: #ffffff; border-radius: 24px; box-shadow: 0 24px 48px rgba(0,0,0,0.2); width: 100%; max-width: 700px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; transform: translateY(20px); animation: luxSlideUp 0.3s forwards; }
  
  .lux-slide-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.4); backdrop-filter: blur(2px); z-index: 998; animation: luxFadeIn 0.3s forwards; }
  .lux-slide-panel { position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 500px; background: #fff; z-index: 999; box-shadow: -10px 0 40px rgba(0,0,0,0.1); transform: translateX(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; border-left: 1px solid #e2e8f0; }
  .lux-slide-panel.open { transform: translateX(0); }
  
  /* Forms */
  .lux-field { margin-bottom: 20px; }
  .lux-label { display: block; font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
  .lux-input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; color: #0f172a; font-weight: 600;}
  .lux-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); background: #fff; }
`;

/* ─────────────────────────────────────────────────────────────────
   COMPONENTS
───────────────────────────────────────────────────────────────── */
function NewTechModal({ onClose, onSubmit, loading }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  const handle = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password || !form.officeNumber) {
      setError("Please map all fields required for system credentialing.");
      return;
    }
    setError("");
    const payload = { ...form, fullName: `${form.firstName} ${form.lastName}`.trim() };
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setError(err?.message || "Integration failed. Check database constraints.");
    }
  };

  return (
    <div className="lux-modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lux-modal-body">
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Enroll Technician</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Provision access mapping for a new field operative.</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
          {error && <div style={{ padding: "12px 16px", borderRadius: "12px", background: "#fef2f2", border: '1px solid #fecaca', color: "#b91c1c", fontSize: "13px", fontWeight: 600, marginBottom: "24px" }}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
            <div className="lux-field"><label className="lux-label">First Name *</label><input className="lux-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Last Name *</label><input className="lux-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">System Username *</label><input className="lux-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Access Password *</label><input type="password" className="lux-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Email Address *</label><input type="email" className="lux-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Telephone</label><input className="lux-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Office / ID Number *</label><input className="lux-input" value={form.officeNumber} onChange={(e) => setForm({ ...form, officeNumber: e.target.value })} /></div>
            <div className="lux-field"><label className="lux-label">Deployment Region</label><input className="lux-input" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} /></div>
            <div className="lux-field" style={{ gridColumn: '1 / -1' }}><label className="lux-label">Administrative Notes</label><input className="lux-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
        </div>

        <div style={{ padding: '20px 32px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="lux-btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="lux-btn-primary" onClick={handle} disabled={loading}>{loading ? "Provisioning..." : "Provision Technician"}</button>
        </div>
      </div>
    </div>
  );
}

function TechDetailsOverlay({ tech, onClose }) {
  if (!tech) return null;

  return (
    <>
      <div className="lux-slide-backdrop" onClick={onClose}></div>
      <div className="lux-slide-panel open">
        <div style={{ padding: '40px 32px 32px 32px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
           <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </button>
           
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
             <div className="lux-tech-avatar" style={{ width: '72px', height: '72px', fontSize: '28px' }}>
               {initials(tech.fullName || tech.username)}
             </div>
             <div>
               <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>{tech.fullName || tech.username || "Unknown"}</h2>
               <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>ID: {tech.officeNumber || tech.id} · {tech.jobTitle || 'Technician'}</div>
               <div style={{ fontSize: '13px', color: '#8b5cf6', fontWeight: 700, marginTop: '4px' }}>{tech.email || '—'}</div>
             </div>
           </div>
        </div>

        <div style={{ flex: 1, padding: '32px', overflowY: 'auto', background: '#fff' }}>
          
          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', margin: '0 0 16px 0', fontWeight: 700 }}>Performance Matrix</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
             <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
               <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>{tech.completedTasks}</div>
               <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Tasks Resolved</div>
             </div>
             <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
               <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>{tech.assignedTasks - tech.completedTasks}</div>
               <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Tasks Pending</div>
             </div>
             <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc', gridColumn: '1 / -1' }}>
               <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6' }}>{calcPct(tech.completedTasks, tech.assignedTasks)}%</div>
               <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginTop: '4px' }}>Resolution Ratio</div>
               <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', marginTop: '12px', overflow: 'hidden' }}>
                 <div style={{ width: `${calcPct(tech.completedTasks, tech.assignedTasks)}%`, height: '100%', background: '#8b5cf6', borderRadius: '4px' }}></div>
               </div>
             </div>
          </div>

          <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.5px', margin: '0 0 16px 0', fontWeight: 700 }}>Recent Inspections Ledger</h3>
          {tech.recentInspections.length === 0 ? (
             <div style={{ padding: '24px', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
               <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>No inspections filed recently.</div>
             </div>
          ) : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               {tech.recentInspections.map((ins, idx) => (
                 <div key={idx} style={{ padding: '14px', border: '1px solid #f1f5f9', borderRadius: '12px', background: '#f8fafc' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{new Date(ins.inspectedAt || ins.createdAt).toLocaleString()}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: ins.inspectionStatus === "COMPLETED" || ins.inspectionStatus === "OK" ? '#10b981' : '#f59e0b' }}>{ins.inspectionStatus || 'LOGGED'}</span>
                   </div>
                   <div style={{ fontSize: '13px', color: '#334155', fontWeight: 500 }}>{ins.notes || ins.issueReason || 'Inspection confirmed.'}</div>
                 </div>
               ))}
             </div>
          )}
          
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */
export function TechniciansPage({ technicians = [], tasks = [], inspections = [], onCreateUser, loading, canManage }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.innerHTML = LUX_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const techRows = useMemo(() => {
    return technicians.map((tech) => {
      const myTasks = tasks.filter((t) => t.assignedToId === tech.id || t.assignedTo?.id === tech.id);
      const myInspections = inspections.filter((i) => i.technicianId === tech.id || i.technician?.id === tech.id);
      const lastActivity = myInspections.map((x) => x.inspectedAt || x.createdAt).filter(Boolean).sort((a, b) => new Date(b) - new Date(a))[0];

      return {
        ...tech,
        assignedTasks: myTasks.length,
        completedTasks: myTasks.filter((x) => x.status === "COMPLETED").length,
        inspectionsCount: myInspections.length,
        lastActivity,
        recentInspections: myInspections.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
      };
    });
  }, [technicians, tasks, inspections]);

  const activeCount = techRows.filter((x) => x.status === "ACTIVE" || x.isActive || true).length;

  return (
    <div className="lux-tp-root">
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h1 className="lux-page-title">Technician Intelligence</h1>
          <p className="lux-page-sub">Manage operatives, track field performance, and establish deployment credentials.</p>
        </div>
        {canManage && (
          <button className="lux-btn-primary" onClick={() => setModalOpen(true)}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
             Register Technician
          </button>
        )}
      </div>

      <div className="lux-kpi-grid">
        <div className="lux-kpi-card">
           <div className="lux-kpi-title">Fleet / Total Staff</div>
           <div className="lux-kpi-val" style={{ color: '#4f46e5' }}>{techRows.length}</div>
        </div>
        <div className="lux-kpi-card">
           <div className="lux-kpi-title">Active Deployments</div>
           <div className="lux-kpi-val" style={{ color: '#10b981' }}>{activeCount}</div>
        </div>
        <div className="lux-kpi-card">
           <div className="lux-kpi-title">Global Assignments</div>
           <div className="lux-kpi-val" style={{ color: '#f59e0b' }}>{tasks.length}</div>
        </div>
      </div>

      <div className="lux-tech-grid">
        {techRows.map(tech => (
           <div key={tech.id} className="lux-tech-card" onClick={() => setSelectedTech(tech)}>
              <div className="lux-tech-head">
                 <div className="lux-tech-avatar">{initials(tech.fullName || tech.username)}</div>
                 <div className="lux-tech-status"></div>
                 <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{tech.fullName || tech.username || "Unknown"}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{tech.jobTitle || 'Technician'} · ID:{tech.officeNumber || tech.id}</div>
                 </div>
              </div>
              <div className="lux-tech-body">
                 <div className="lux-tech-stat">
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Resolved</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>{tech.completedTasks}</span>
                 </div>
                 <div className="lux-tech-stat">
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Pending</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>{tech.assignedTasks - tech.completedTasks}</span>
                 </div>
              </div>
              <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{tech.lastActivity ? new Date(tech.lastActivity).toLocaleDateString() : 'No recent activity'}</span>
                 <span style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5' }}>View Dossier &rarr;</span>
              </div>
           </div>
        ))}
      </div>

      {modalOpen && canManage && (
         <NewTechModal loading={loading} onClose={() => setModalOpen(false)} onSubmit={onCreateUser} />
      )}

      {selectedTech && (
         <TechDetailsOverlay tech={selectedTech} onClose={() => setSelectedTech(null)} />
      )}
    </div>
  );
}
