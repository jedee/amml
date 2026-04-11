// ─────────────────────────────────────────────────────────────
//  AMML — Users Management Page  (Super Admin & MD only)
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import type { AuthLevel } from '../types/models';

export default function UsersPage() {
  const { state, dispatch, can, roleConfig, authLevels, levelLabels } = useApp();
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState<AuthLevel | 'ALL'>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLevel, setEditLevel] = useState<AuthLevel>('OFFICER');
  const [showAdd, setShowAdd] = useState(false);
  const [addId, setAddId] = useState('');
  const [addLevel, setAddLevel] = useState<AuthLevel>('OFFICER');
  const [addError, setAddError] = useState('');

  // Build user list from staff records
  const allUsers = useMemo(() => {
    return state.staff.map(s => ({
      id: s.id,
      name: `${s.first} ${s.last}`,
      staffId: s.id,
      authLevel: s.authLevel,
      market: s.market,
      dept: s.dept,
      active: true,
    }));
  }, [state.staff]);

  const filtered = useMemo(() => {
    return allUsers.filter(u => {
      const matchSearch = search === '' ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.market.toLowerCase().includes(search.toLowerCase());
      const matchLevel = filterLevel === 'ALL' || u.authLevel === filterLevel;
      return matchSearch && matchLevel;
    });
  }, [allUsers, search, filterLevel]);

  const handleSaveEdit = (staffId: string) => {
    dispatch({ type: 'UPDATE_STAFF_AUTH', payload: { staffId, authLevel: editLevel } });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'UPDATE_USER_ROLE', detail: `Changed ${staffId} to ${editLevel}` } });
    setEditingId(null);
  };

  const handleAddUser = () => {
    if (!addId.trim()) { setAddError('Enter a Staff ID.'); return; }
    const match = state.staff.find(s => s.id.toLowerCase() === addId.trim().toLowerCase());
    if (!match) { setAddError('Staff ID not found.'); return; }
    dispatch({ type: 'UPDATE_STAFF_AUTH', payload: { staffId: match.id, authLevel: addLevel } });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'ADD_USER', detail: `Added ${match.id} as ${addLevel}` } });
    setAddId(''); setAddLevel('OFFICER'); setAddError(''); setShowAdd(false);
  };

  const levelBadge = (level: AuthLevel) => {
    const cfg = roleConfig[level];
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
        background: cfg.color + '22', color: cfg.color, letterSpacing: '.04em',
      }}>
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="page-header">
      <div>
        <h2>👑 User Management</h2>
        <p style={{ color: 'var(--text2)', fontSize: 13 }}>Assign and manage auth levels for registered staff</p>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-blue" onClick={() => setShowAdd(s => !s)}>
          + Assign Role
        </button>
      </div>

      {/* Add User Panel */}
      {showAdd && (
        <div style={{
          background: 'var(--surface)', border: '1.5px solid var(--border)',
          borderRadius: 'var(--r)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Assign Role to Staff Member</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Staff ID</label>
              <input
                type="text"
                value={addId}
                onChange={e => { setAddId(e.target.value); setAddError(''); }}
                placeholder="AMML-001"
                style={{ padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface2)', minWidth: 160 }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Auth Level</label>
              <select
                value={addLevel}
                onChange={e => setAddLevel(e.target.value as AuthLevel)}
                style={{ padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface2)', minWidth: 200 }}
              >
                {authLevels.map(l => (
                  <option key={l} value={l}>{levelLabels[l]}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-blue" onClick={handleAddUser}>Assign</button>
            <button className="btn btn-outline" onClick={() => { setShowAdd(false); setAddError(''); }}>Cancel</button>
          </div>
          {addError && <div style={{ color: '#e74c3c', fontSize: 12 }}>⚠️ {addError}</div>}
          <div style={{ fontSize: 11.5, color: 'var(--text3)' }}>
            Available staff IDs: {state.staff.slice(0, 8).map(s => s.id).join(', ')}…
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by name, ID or market…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)', minWidth: 240, flex: 1 }}
        />
        <select
          value={filterLevel}
          onChange={e => setFilterLevel(e.target.value as AuthLevel | 'ALL')}
          style={{ padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontFamily: 'inherit', fontSize: 13, background: 'var(--surface)' }}
        >
          <option value="ALL">All Levels</option>
          {authLevels.map(l => <option key={l} value={l}>{roleConfig[l].label}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>
          {filtered.length} user{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--r)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
              {['Staff ID', 'Name', 'Department', 'Market', 'Auth Level', 'Last Login', 'Action'].map(h => (
                <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>No users match your filters.</td></tr>
            )}
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{u.id}</span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{u.dept}</td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text2)' }}>{u.market}</td>
                <td style={{ padding: '12px 16px' }}>
                  {editingId === u.id ? (
                    <select
                      value={editLevel}
                      onChange={e => setEditLevel(e.target.value as AuthLevel)}
                      style={{ padding: '5px 10px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--blue)', fontFamily: 'inherit', fontSize: 12, background: 'var(--surface)' }}
                    >
                      {authLevels.map(l => <option key={l} value={l}>{roleConfig[l].label}</option>)}
                    </select>
                  ) : levelBadge(u.authLevel)}
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text3)' }}>—</td>
                <td style={{ padding: '12px 16px' }}>
                  {editingId === u.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-blue" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => handleSaveEdit(u.id)}>Save</button>
                      <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '5px 12px', fontSize: 12 }}
                      onClick={() => { setEditingId(u.id); setEditLevel(u.authLevel); }}
                    >
                      Edit Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {authLevels.map(l => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {levelBadge(l)}
            <span style={{ fontSize: 11.5, color: 'var(--text3)' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
