// ─────────────────────────────────────────────────────────────
//  AMML — Staff Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function StaffPage() {
  const { state, roleConfig, can } = useApp();
  const [search, setSearch] = useState('');
  
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
        </div>
      </div>

      {/* Staff enrollment is done via biometric device import */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,100,180,.06), rgba(220,100,0,.04))',
        border: '1.5px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        marginBottom: 4,
      }}>
        <div style={{ fontSize: 28 }}>📋</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Staff Enrollment — Coming Soon</div>
          <div style={{ fontSize: 12.5, color: 'var(--text3)', marginTop: 2 }}>
            For now, staff records are created automatically when you import biometric device logs.
            New staff appearing in ZKTeco / Bantech logs will be auto-enrolled on import.
          </div>
        </div>
        <span style={{
          background: 'rgba(0,100,180,.1)',
          color: 'var(--blue)',
          fontSize: 11,
          fontWeight: 800,
          padding: '4px 12px',
          borderRadius: 99,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>BIOMETRIC</span>
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
                      {roleConfig[s.authLevel]?.short ?? s.authLevel}
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

    </div>
  );
}
