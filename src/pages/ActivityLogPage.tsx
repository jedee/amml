// ─────────────────────────────────────────────────────────────
//  AMML — Activity Log Page
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

const ACTION_COLORS: Record<string, string> = {
  LOGIN:        'var(--blue)',
  LOGOUT:       'var(--text3)',
  CLOCK_IN:     'var(--green-logo)',
  CLOCK_OUT:    'var(--orange)',
  IMPORT:       '#4A148C',
  EXPORT_BACKUP:'var(--blue)',
  IMPORT_BACKUP:'var(--green-logo)',
  UPDATE_STAFF: 'var(--blue)',
  ADD_STAFF:    'var(--green-logo)',
  DELETE_STAFF: '#C0392B',
  CREATE_ALERT: 'var(--orange)',
  DISMISS_ALERT:'var(--text3)',
  CLEAR_DATA:   '#C0392B',
  TOGGLE_DEVICE:'var(--blue)',
};

export default function ActivityLogPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState('');

  const logs = useMemo(() => {
    const all = [...(state.activityLog || [])].reverse();
    if (!filter) return all;
    return all.filter(l =>
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.detail.toLowerCase().includes(filter.toLowerCase())
    );
  }, [state.activityLog, filter]);

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>📜 Activity Log</h2>
          <p>{logs.length} event{logs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="ph-r">
          <input
            type="search"
            placeholder="Search events…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, width: 220 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {logs.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">📜</div>
            <div className="es-title">No activity yet</div>
            <p>Events will appear here as users interact with the system.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 160 }}>Timestamp</th>
                <th style={{ width: 140 }}>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{l.timestamp}</td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: `${ACTION_COLORS[l.action] || 'var(--text3)'}18`,
                        color: ACTION_COLORS[l.action] || 'var(--text3)',
                      }}
                    >
                      {l.action}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
