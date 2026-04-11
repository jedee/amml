// ─────────────────────────────────────────────────────────────
//  AMML — Activity Log Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Search, Download, FileText } from 'lucide-react';

export default function ActivityLogPage() {
  const { state } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filtered = state.activityLog.filter(log => {
    const matchSearch = search
      ? log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.detail.toLowerCase().includes(search.toLowerCase()) ||
        log.user.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchAction = actionFilter === 'all' || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const uniqueActions = ['all', ...Array.from(new Set(state.activityLog.map(l => l.action)))];

  const exportCSV = () => {
    const header = 'Timestamp,User,Action,Detail\n';
    const rows = filtered.map(l =>
      `"${l.timestamp}","${l.user}","${l.action}","${l.detail}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amml-activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>📜 Activity Log</h2>
          <p>{filtered.length} of {state.activityLog.length} events</p>
        </div>
        <div className="ph-r">
          <input
            type="search"
            placeholder="Search logs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, width: 220}}
          />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          >
            {uniqueActions.map(a => (
              <option key={a} value={a}>{a === 'all' ? 'All actions' : a}</option>
            ))}
          </select>
          <button className="btn btn-outline btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="es-icon"><FileText size={40} /></div>
            <div className="es-title">No activity recorded</div>
            <p>Actions like logins, staff changes, and device events appear here.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text3)' }}>
                    {new Date(log.timestamp).toLocaleString('en-GB')}
                  </td>
                  <td>
                    <span className="badge b-navy">{log.user}</span>
                  </td>
                  <td>
                    <span className="badge b-blue">{log.action}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{log.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <div style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text3)', borderTop: '1px solid var(--border)' }}>
              Showing first 200 of {filtered.length} records. Export CSV for full data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}