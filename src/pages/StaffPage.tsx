// ─────────────────────────────────────────────────────────────
//  AMML — Staff Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ROLE_CONFIG } from '../data/roles';

export default function StaffPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = state.staff.filter(s =>
    `${s.first} ${s.last} ${s.id} ${s.market}`.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleColor = (lvl: string) =>
    ({ SUPERADMIN:'#4A148C', MD:'#003C78', MANAGER:'#0064B4', SUPERVISOR:'#DC6400', OFFICER:'#288C28' })[lvl] ?? '#0064B4';

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>👥 Staff</h2>
          <p>{filtered.length} of {state.staff.length} staff members</p>
        </div>
        <div className="ph-r">
          <input
            type="search"
            placeholder="Search staff…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          />
          <button className="btn btn-blue" onClick={() => setShowAdd(true)}>➕ Add Staff</button>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">👥</div>
            <div className="es-title">No staff found</div>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Market</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><span className="badge b-navy" style={{ fontSize: 10 }}>{s.id}</span></td>
                  <td style={{ fontWeight: 700 }}>{s.first} {s.last}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.market.split(' ')[0]}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{s.dept}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${getRoleColor(s.authLevel)}18`,
                        color: getRoleColor(s.authLevel),
                      }}
                    >
                      {ROLE_CONFIG[s.authLevel]?.short ?? s.authLevel}
                    </span>
                  </td>
                  <td>
                    {s.active
                      ? <span className="badge b-green">✅ Active</span>
                      : <span className="badge b-red">❌ Inactive</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">➕ Add New Staff</div>
              <button className="modal-close" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text3)' }}>
              Full staff enrollment form coming soon. For now, staff are imported from biometric device logs.
            </p>
            <div style={{ marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
