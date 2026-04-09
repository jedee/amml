// ─────────────────────────────────────────────────────────────
//  AMML — Dashboard Page
// ─────────────────────────────────────────────────────────────

import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';

export default function Dashboard() {
  const { state } = useApp();
  const { markets, staff, devices, att } = state;

  const today = new Date().toISOString().split('T')[0];
  const todayRecs = useMemo(() => att.filter(r => r.date === today), [att, today]);

  const kpis = useMemo(() => {
    const activeStaff = staff.filter(s => s.active).length;
    const activeDevices = devices.filter(d => d.active).length;
    const onTimeToday = todayRecs.filter(r => !r.late).length;
    const lateToday = todayRecs.filter(r => r.late).length;
    const absentToday = staff.filter(s => s.active).length - todayRecs.length;

    return {
      activeStaff,
      activeDevices,
      marketsCount: markets.filter(m => m.active).length,
      todayOnTime: onTimeToday,
      todayLate: lateToday,
      todayAbsent: Math.max(0, absentToday),
      totalClocks: todayRecs.length,
    };
  }, [staff, devices, markets, todayRecs]);

  const recentAtt = useMemo(() =>
    [...todayRecs]
      .sort((a, b) => a.clockIn.localeCompare(b.clockIn))
      .slice(0, 8),
    [todayRecs]
  );

  const kpiCards = [
    { val: kpis.activeStaff,  label: 'Active Staff',     icon: '👥', accent: '#0064B4' },
    { val: kpis.marketsCount, label: 'Markets',          icon: '🏪', accent: '#DC6400' },
    { val: kpis.activeDevices,label: 'Online Devices',   icon: '📱', accent: '#288C28' },
    { val: kpis.todayOnTime,  label: 'On Time',          icon: '✅', accent: '#003C78' },
    { val: kpis.todayLate,    label: 'Late Arrivals',     icon: '⚠️', accent: '#E8821A' },
    { val: kpis.todayAbsent,  label: 'Absent',            icon: '❌', accent: '#C0392B' },
  ];

  return (
    <div className="page active">
      {/* Page header */}
      <div className="ph">
        <div className="ph-l">
          <h2>Dashboard</h2>
          <p>Abuja Markets Management Limited — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="ph-r">
          <button className="btn btn-outline btn-sm">📊 Full Report</button>
          <button className="btn btn-blue btn-sm">🕐 Attendance</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        {kpiCards.map(k => (
          <div key={k.label} className="kpi">
            <div className="kpi-l">
              <div className="kpi-icon" style={{ background: `${k.accent}18`, color: k.accent }}>
                {k.icon}
              </div>
              <div>
                <div className="kpi-val">{k.val}</div>
                <div className="kpi-sub">{k.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="sr">
          <div className="sr-val" style={{ color: 'var(--green-logo)' }}>{kpis.todayOnTime}</div>
          <div className="sr-lbl">Clocked In</div>
        </div>
        <div className="sr">
          <div className="sr-val" style={{ color: 'var(--orange)' }}>{kpis.todayLate}</div>
          <div className="sr-lbl">Late</div>
        </div>
        <div className="sr">
          <div className="sr-val">{kpis.totalClocks}</div>
          <div className="sr-lbl">Total Events</div>
        </div>
        <div className="sr">
          <div className="sr-val">{staff.length}</div>
          <div className="sr-lbl">Total Staff</div>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">📋 Today's Attendance Log</div>
          <span className="badge b-blue">{todayRecs.length} records</span>
        </div>

        {recentAtt.length === 0 ? (
          <div className="empty-state">
            <div className="es-icon">🕐</div>
            <div className="es-title">No attendance records yet</div>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
              Staff can clock in using biometric devices or the Attendance page.
            </p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Market</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAtt.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700 }}>{r.staffName}</td>
                  <td style={{ fontSize: 12, color: 'var(--text3)' }}>{r.market}</td>
                  <td>{r.clockIn}</td>
                  <td>{r.clockOut || '—'}</td>
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

      {/* Quick links */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">🚀 Quick Actions</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-outline">➕ Add Staff</button>
          <button className="btn btn-outline">📱 Register Device</button>
          <button className="btn btn-outline">📊 View Reports</button>
          <button className="btn btn-blue">🕐 Record Attendance</button>
        </div>
      </div>
    </div>
  );
}
