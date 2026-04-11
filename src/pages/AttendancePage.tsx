// ─────────────────────────────────────────────────────────────
//  AMML — Attendance Page
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

export default function AttendancePage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [showClockIn, setShowClockIn] = useState(false);
  const [ciStaffId, setCiStaffId] = useState('');
  const [ciTime, setCiTime] = useState(() => new Date().toISOString().slice(0, 16));

  const today = new Date().toISOString().slice(0, 10);

  // Filter by date range + search
  const filtered = useMemo(() => {
    return state.att
      .filter(r => {
        const inRange = r.date >= dateFrom && r.date <= dateTo;
        const match = !search ||
          r.staffName?.toLowerCase().includes(search.toLowerCase()) ||
          r.staffId?.toLowerCase().includes(search.toLowerCase()) ||
          r.market?.toLowerCase().includes(search.toLowerCase());
        return inRange && match;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.clockIn.localeCompare(a.clockIn));
  }, [state.att, dateFrom, dateTo, search]);

  // Summary stats for the visible range
  const stats = useMemo(() => {
    const total = filtered.length;
    const clockOut = filtered.filter(r => r.clockOut).length;
    const late = filtered.filter(r => r.late).length;
    const activeStaff = state.staff.filter(s => s.active).length;
    return { total, clockOut, late, activeStaff };
  }, [filtered, state.staff]);

  function handleClockIn() {
    if (!ciStaffId.trim()) return;
    const match = state.staff.find(s =>
      s.id.toLowerCase() === ciStaffId.trim().toLowerCase() ||
      s.id.toLowerCase().startsWith(ciStaffId.trim().toLowerCase())
    );
    if (!match) { alert('Staff ID not found'); return; }
    const todayD = new Date().toISOString().slice(0, 10);
    const [date, HM] = ciTime.split('T');
    const [h, m] = HM.split(':').map(Number);
    const late = h > 8 || (h === 8 && m > 0);
    const id = 'a' + Math.random().toString(36).slice(2, 8);
    dispatch({
      type: 'ADD_ATTENDANCE',
      payload: {
        id, staffId: match.id, staffName: `${match.first} ${match.last}`,
        market: match.market, dept: match.dept, date,
        clockIn: HM + ':00', clockOut: '', device: 'Manual', late, duration: null,
      },
    });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'CLOCK_IN', detail: `${match.first} ${match.last} clocked in at ${HM}` } });
    setShowClockIn(false);
    setCiStaffId('');
  }

  function handleClockOut() {
    if (!ciStaffId.trim()) return;
    const match = state.staff.find(s =>
      s.id.toLowerCase() === ciStaffId.trim().toLowerCase()
    );
    if (!match) { alert('Staff ID not found'); return; }
    const [date, HM] = ciTime.split('T');
    const rec = state.att.find(r => r.staffId === match.id && r.date === date && !r.clockOut);
    if (rec) {
      dispatch({
        type: 'UPDATE_ATT',
        payload: { ...rec, clockOut: HM + ':00' },
      });
      dispatch({ type: 'AUDIT_LOG', payload: { action: 'CLOCK_OUT', detail: `${match.first} ${match.last} clocked out at ${HM}` } });
    } else {
      alert('No open clock-in record found for today');
      return;
    }
    setShowClockIn(false);
    setCiStaffId('');
  }

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🕐 Attendance</h2>
          <p>{stats.total} records · {stats.clockOut} clocked out · {stats.late} late</p>
        </div>
        <div className="ph-r">
          <button className="btn btn-green" onClick={() => setShowClockIn(v => !v)}>
            {showClockIn ? '✕ Cancel' : '🕐 Manual Clock'}
          </button>
        </div>
      </div>

      {/* Manual clock in/out form */}
      {showClockIn && (
        <div className="card" style={{ border: '1.5px solid var(--green-logo)' }}>
          <div className="card-head">
            <div className="card-title">🕐 Manual Clock-In / Clock-Out</div>
          </div>
          <div className="mf" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="fg">
              <label>Staff ID</label>
              <input type="text" placeholder="AMML-001" value={ciStaffId}
                onChange={e => setCiStaffId(e.target.value)} />
            </div>
            <div className="fg">
              <label>Date & Time</label>
              <input type="datetime-local" value={ciTime}
                onChange={e => setCiTime(e.target.value)} />
            </div>
            <div className="fg" style={{ flex: 'none' }}>
              <label>&nbsp;</label>
              <button className="btn btn-green" onClick={handleClockIn}>✅ Clock In</button>
            </div>
            <div className="fg" style={{ flex: 'none' }}>
              <label>&nbsp;</label>
              <button className="btn btn-orange" onClick={handleClockOut}>🚪 Clock Out</button>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text3)', marginTop: 8 }}>
            Use to record attendance for staff who forgot to badge. Requires a Supervisor or higher role.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="fg">
            <label>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="fg">
            <label>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <div className="fg" style={{ flex: 1 }}>
            <label>Search</label>
            <input type="search" placeholder="Staff name, ID, or market…" value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-outline btn-sm"
            onClick={() => { setDateFrom(today); setDateTo(today); setSearch(''); }}>
            Today
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="es-icon">🕐</div>
          <div className="es-title">No records found</div>
          <p>Try adjusting the date range or search.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Market</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{r.staffName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{r.staffId}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{r.market}</td>
                  <td style={{ fontSize: 12 }}>{r.date}</td>
                  <td>{r.clockIn?.slice(0, 5) || '—'}</td>
                  <td>{r.clockOut?.slice(0, 5) || <span style={{ color: 'var(--text3)', fontSize: 12 }}>—</span>}</td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{r.duration || '—'}</td>
                  <td>
                    {r.late
                      ? <span className="badge b-orange">⚠️ Late</span>
                      : r.clockIn
                        ? <span className="badge b-green">✅ On Time</span>
                        : <span className="badge b-navy">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
