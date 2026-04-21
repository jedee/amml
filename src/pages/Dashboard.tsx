// ─────────────────────────────────────────────────────────────
//  AMML — Dashboard
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import GateKeeper from '../components/GateKeeper';
import GhostWatch from '../components/GhostWatch';
import MarketPulse from '../components/MarketPulse';

function StatCard({ value, label, accent }: { value: string | number; label: string; accent: string }) {
  return (
    <div className="sr">
      <div className="sr-val" style={{ color: accent }}>{value}</div>
      <div className="sr-lbl">{label}</div>
    </div>
  );
}

function KpiCard({ val, label, icon, accent }: { val: number | string; label: string; icon: string; accent: string }) {
  return (
    <div className="kpi">
      <div className="kpi-l">
        <div className="kpi-icon" style={{ background: accent + '18', color: accent }}>{icon}</div>
        <div>
          <div className="kpi-val">{val}</div>
          <div className="kpi-sub">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state } = useApp();
  const { markets, staff, devices, att, user } = state;
  const today = new Date().toISOString().slice(0, 10);
  const todayRecs = useMemo(() => att.filter(r => r.date === today), [att, today]);

  const kpis = useMemo(() => ({
    activeStaff: staff.filter(s => s.active).length,
    marketsCount: markets.filter(m => m.active).length,
    onlineDevices: devices.filter(d => d.active).length,
    onTime: todayRecs.filter(r => !r.late).length,
    late: todayRecs.filter(r => r.late).length,
    absent: Math.max(0, staff.filter(s => s.active).length - todayRecs.length),
  }), [staff, markets, devices, todayRecs]);

  const dateLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page active">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-l">
          <h1>Dashboard</h1>
          <p>{user?.name} · {dateLabel}</p>
        </div>
        <div className="page-header-r">
          <GateKeeper />
          <button className="btn btn-outline btn-sm">📊 Full Report</button>
          <button className="btn btn-blue btn-sm">🕐 Attendance</button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <KpiCard val={kpis.activeStaff} label="Active Staff" icon="👥" accent="#0064B4" />
        <KpiCard val={kpis.marketsCount} label="Markets" icon="🏪" accent="#DC6400" />
        <KpiCard val={kpis.onlineDevices} label="Online Devices" icon="📱" accent="#288C28" />
        <KpiCard val={kpis.onTime} label="On Time" icon="✅" accent="#003C78" />
        <KpiCard val={kpis.late} label="Late Arrivals" icon="⚠️" accent="#E8821A" />
        <KpiCard val={kpis.absent} label="Absent" icon="❌" accent="#C0392B" />
      </div>

      {/* Agent Panels */}
      <div className="agent-strip">
        <Card><CardContent className="p-4"><GhostWatch /></CardContent></Card>
        <Card><CardContent className="p-4"><MarketPulse /></CardContent></Card>
      </div>

      {/* Stats Strip */}
      <div className="stats-row">
        <StatCard value={kpis.onTime} label="Clocked In" accent="var(--color-brand-green)" />
        <StatCard value={kpis.late} label="Late" accent="var(--color-brand-orange)" />
        <StatCard value={todayRecs.length} label="Total Events" accent="var(--color-brand-blue)" />
        <StatCard value={staff.length} label="Total Staff" accent="var(--color-text)" />
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance Log</CardTitle>
          <CardAction>
            <Badge variant="outline">{todayRecs.length} records</Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          {todayRecs.length === 0 ? (
            <div className="empty-state">
              <div className="es-icon">🕐</div>
              <div className="es-title">No attendance records yet</div>
              <p className="es-sub">Staff clock in using biometric devices or the Attendance page.</p>
            </div>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Market</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayRecs.slice(0, 12).map(r => (
                  <tr key={r.id}>
                    <td className="fw-700">{r.staffName}</td>
                    <td className="tbl-col-sm">{r.market}</td>
                    <td className="tbl-col-mono">{r.clockIn || '—'}</td>
                    <td className="tbl-col-mono">{r.clockOut || '—'}</td>
                    <td className="tbl-col-mono">{r.duration || '—'}</td>
                    <td>
                      <Badge variant={r.late ? 'destructive' : 'secondary'}>
                        {r.late ? '⚠️ Late' : '✅ On Time'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mf">
            <button className="btn btn-outline btn-sm">➕ Add Staff</button>
            <button className="btn btn-outline btn-sm">📱 Register Device</button>
            <button className="btn btn-outline btn-sm">📊 View Reports</button>
            <button className="btn btn-blue btn-sm">🕐 Record Attendance</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
