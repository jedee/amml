// ─────────────────────────────────────────────────────────────
//  AMML — Attendance Page
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

export default function AttendancePage() {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    let recs = state.att;
    if (selectedDate) recs = recs.filter(r => r.date === selectedDate);
    if (state.marketFilter !== 'All Markets')
      recs = recs.filter(r => r.market === state.marketFilter);
    if (filter === 'late') recs = recs.filter(r => r.late);
    else if (filter === 'ontime') recs = recs.filter(r => !r.late);
    return recs.sort((a, b) => b.clockIn.localeCompare(a.clockIn));
  }, [state.att, selectedDate, state.marketFilter, filter]);

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🕐 Attendance</h2>
          <p>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            {state.marketFilter !== 'All Markets' ? ` · ${state.marketFilter}` : ''}
          </p>
        </div>
        <div className="ph-r">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8 }}
          >
            <option value="all">All</option>
            <option value="late">Late Only</option>
            <option value="ontime">On Time Only</option>
          </select>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">📋</div>
            <div className="es-title">No attendance records</div>
            <p>No records found for the selected date and filter.</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Market</th>
                <th>Dept</th>
                <th>Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Duration</th>
                <th>Device</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.staffName}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{r.market}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{r.dept}</td>
                  <td>{r.date}</td>
                  <td>{r.clockIn}</td>
                  <td>{r.clockOut || '—'}</td>
                  <td>
                    {r.duration != null
                      ? `${Math.floor(r.duration / 60)}h ${r.duration % 60}m`
                      : '—'}
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }}>{r.device}</td>
                  <td>
                    {r.late
                      ? <span className="badge b-orange">⚠️ Late</span>
                      : <span className="badge b-green">✅ On Time</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Import section */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">📥 Import Biometric Logs</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
          Upload a CSV or XLSX file from a ZKTeco or Bantech device. Staff must be pre-enrolled with their ZK ID.
        </p>
        <input type="file" accept=".csv,.xlsx,.xls" style={{ fontSize: 13 }} />
        <div style={{ marginTop: 10 }}>
          <button className="btn btn-blue">📤 Import Records</button>
        </div>
      </div>
    </div>
  );
}
