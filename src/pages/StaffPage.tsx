// ─────────────────────────────────────────────────────────────
//  AMML — Staff Management Page
//  Shows all staff + Excel nominal roll import
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useStaffImport } from '../hooks/useStaffImport';

export default function StaffPage() {
  const { state } = useApp();
  const { staff, markets } = state;
  const { readFile, preview, error, confirmImport, cancelImport } = useStaffImport();

  const [search, setSearch] = useState('');
  const [mktFilter, setMktFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'import'>('table');

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const q = search.toLowerCase();
      const match = !q ||
        `${s.first} ${s.last}`.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.dept.toLowerCase().includes(q) ||
        s.market.toLowerCase().includes(q);
      const mkt = !mktFilter || s.market === mktFilter;
      const lvl = !levelFilter || s.authLevel === levelFilter;
      return match && mkt && lvl;
    });
  }, [staff, search, mktFilter, levelFilter]);

  const authColor = (lvl: string) => {
    const map: Record<string, string> = {
      SUPERADMIN: '#4A148C', MD: '#003C78', MANAGER: '#0064B4',
      SUPERVISOR: '#DC6400', OFFICER: '#288C28',
    };
    return map[lvl] ?? '#6A8AAB';
  };

  const authBadge = (lvl: string) => {
    const colors: Record<string, string> = {
      SUPERADMIN: 'background:#f3e8ff;color:#4a148c',
      MD: 'background:#dbeafe;color:#003c78',
      MANAGER: 'background:#dbeafe;color:#0064b4',
      SUPERVISOR: 'background:#fff7ed;color:#dc6400',
      OFFICER: 'background:#f0fdf4;color:#288c28',
    };
    return (
      <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 800, letterSpacing: '.04em', ...Object.fromEntries(colors[lvl]?.split(';').map(s => s.split(':'))) } }>
        {lvl}
      </span>
    );
  };

  const duplicateCount = preview ? preview.filter(p => staff.some(s => s.id === p.id)).length : 0;

  return (
    <div className="page active">
      {/* Page Header */}
      <div className="ph">
        <div className="ph-l">
          <h2>👥 Staff Management</h2>
          <p>{staff.length} registered staff across all markets</p>
        </div>
        <div className="ph-r">
          <button className={`btn btn-sm ${activeTab === 'table' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('table')}>
            📋 All Staff ({staff.length})
          </button>
          <button className={`btn btn-sm ${activeTab === 'import' ? 'btn-blue' : 'btn-outline'}`} onClick={() => setActiveTab('import')}>
            📥 Import Nominal Roll
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">📥 Import Staff from Excel / CSV</div>
          </div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

            {!preview ? (
              <>
                {/* Upload Area */}
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--r)', padding: '36px 24px', textAlign: 'center', background: 'var(--surface2)' }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Upload your Nominal Roll</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 16 }}>
                    Supported: <strong>.xlsx, .xls, .csv</strong>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, maxWidth: 480, margin: '0 auto 16px' }}>
                    Required columns: <code>AMML ID</code>, <code>First</code>, <code>Last</code>, <code>Department</code>, <code>Market</code>.<br />
                    Optional: <code>Phone</code>, <code>Role</code>, <code>Salary</code>, <code>AuthLevel</code>.<br />
                    AuthLevel accepts: SUPERADMIN, MD, MANAGER, SUPERVISOR, OFFICER.
                  </div>
                  <label className="btn btn-blue" style={{ cursor: 'pointer', display: 'inline-block' }}>
                    Choose File
                    <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
                  </label>
                  {error && <div style={{ color: '#C0392B', fontSize: 13, marginTop: 10 }}>{error}</div>}
                </div>

                {/* Market summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                  {markets.slice(0, 6).map(m => {
                    const cnt = staff.filter(s => s.market === m.name).length;
                    return (
                      <div key={m.id} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--r-sm)', fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{m.name}</span>
                        <span style={{ background: 'var(--blue)', color: '#fff', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>{cnt}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Preview */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{preview.length} records ready to import</span>
                    {duplicateCount > 0 && (
                      <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--orange)' }}>
                        ⚠️ {duplicateCount} will update existing records
                      </span>
                    )}
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={cancelImport}>✕ Clear Preview</button>
                </div>

                <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)' }}>
                  <table className="tbl" style={{ fontSize: 12 }}>
                    <thead>
                      <tr>
                        <th>AMML ID</th><th>First</th><th>Last</th><th>Department</th><th>Market</th><th>Phone</th><th>Role</th><th>Salary</th><th>Auth Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((s, i) => (
                        <tr key={i} style={{ background: staff.some(x => x.id === s.id) ? 'rgba(220,100,0,.05)' : 'transparent' }}>
                          <td><span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 11 }}>{s.id}</span></td>
                          <td>{s.first}</td>
                          <td>{s.last}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.dept || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.market || '—'}</td>
                          <td style={{ color: 'var(--text3)', fontFamily: 'monospace', fontSize: 11 }}>{s.phone || '—'}</td>
                          <td style={{ color: 'var(--text3)' }}>{s.role || '—'}</td>
                          <td style={{ fontFamily: 'monospace' }}>{s.salary > 0 ? s.salary.toLocaleString() : '—'}</td>
                          <td>{authBadge(s.authLevel)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {duplicateCount > 0 && (
                  <div style={{ padding: '10px 14px', background: 'rgba(220,100,0,.08)', border: '1px solid rgba(220,100,0,.2)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--orange)' }}>
                    ⚠️ {duplicateCount} staff already exist with matching IDs and will be <strong>updated</strong> with the new data.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-blue" onClick={confirmImport}>✅ Confirm Import ({preview.length} records)</button>
                  <button className="btn btn-outline" onClick={cancelImport}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="search-input"
              placeholder="Search staff name, ID, department…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: '1', minWidth: 220, padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none' }}
            />
            <select value={mktFilter} onChange={e => setMktFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 160 }}>
              <option value="">All Markets</option>
              {[...new Set(staff.map(s => s.market))].sort().map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)}
              style={{ padding: '8px 12px', border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', color: 'var(--text)', outline: 'none', cursor: 'pointer', minWidth: 160 }}>
              <option value="">All Levels</option>
              <option>SUPERADMIN</option><option>MD</option><option>MANAGER</option><option>SUPERVISOR</option><option>OFFICER</option>
            </select>
            <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 4 }}>{filtered.length} of {staff.length}</span>
          </div>

          {/* Coming Soon banner */}
          <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(0,100,180,.06), rgba(220,100,0,.04))', border: '1px solid var(--border)', borderRadius: 'var(--r)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 3 }}>Manual Staff Enrollment — Coming Soon</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                For now, staff are created automatically when you import biometric device logs. To add or update staff, use the <strong>Import Nominal Roll</strong> button above to upload an Excel/CSV file with your staff list.
              </div>
            </div>
          </div>

          {/* Staff Table */}
          <div className="card" style={{ padding: 0 }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="es-icon">👥</div>
                <div className="es-title">No staff found</div>
                <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>AMML ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Market</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Salary</th>
                      <th>Auth Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(s => (
                      <tr key={s.id}>
                        <td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700 }}>{s.id}</span></td>
                        <td style={{ fontWeight: 600 }}>{s.first} {s.last}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.dept}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.market}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{s.phone || '—'}</td>
                        <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.role || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.salary > 0 ? `₦${s.salary.toLocaleString()}` : '—'}</td>
                        <td>{authBadge(s.authLevel)}</td>
                        <td>
                          <span style={{ padding: '2px 9px', borderRadius: 99, fontSize: 10, fontWeight: 700,
                            background: s.active ? 'rgba(40,140,40,.1)' : 'var(--surface3)',
                            color: s.active ? 'var(--green-logo)' : 'var(--text3)',
                          }}>
                            {s.active ? '● Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
