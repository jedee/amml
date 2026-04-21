// ─────────────────────────────────────────────────────────────
//  GhostWatch — Real-time Attendance Anomaly Detection
//  Detects: zero clocks, excess late, overtime, weekend work
// ─────────────────────────────────────────────────────────────
import React, { useMemo } from 'react';
import { Eye, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface AnomalyEvent { type: string; staffName: string; date: string; detail: string; severity: 'warning' | 'critical' }

export default function GhostWatch() {
  const { state } = useApp();
  const { staff, att } = state;
  const today = new Date().toISOString().split('T')[0];

  const anomalies = useMemo<AnomalyEvent[]>(() => {
    const events: AnomalyEvent[] = [];
    const todayRecs = att.filter(r => r.date === today);
    const dayOfWeek = new Date().getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const s of staff.filter(s => s.active)) {
      const sRecs = todayRecs.filter(r => r.staffId === s.id);
      if (sRecs.length === 0) {
        events.push({ type: 'ZERO_CLOCKS', staffName: `${s.first} ${s.last}`, date: today, detail: 'No clock-in today', severity: 'warning' });
      }
      if (sRecs.filter(r => r.late).length > 3) {
        events.push({ type: 'EXCESSIVE_LATE', staffName: `${s.first} ${s.last}`, date: today, detail: 'More than 3 late arrivals', severity: 'warning' });
      }
      const clockOut = sRecs.find(r => r.clockOut);
      if (clockOut && isWeekend) {
        events.push({ type: 'WEEKEND_WORK', staffName: `${s.first} ${s.last}`, date: today, detail: 'Clocked out on weekend', severity: 'info' });
      }
      if (clockOut && clockOut.clockOut > '20:00') {
        events.push({ type: 'LATE_OVERTIME', staffName: `${s.first} ${s.last}`, date: today, detail: `Clocked out at ${clockOut.clockOut}`, severity: 'warning' });
      }
    }
    return events;
  }, [staff, att, today]);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-700 text-xs">
        <Eye size={12} className="text-blue-400" />
        <span className="font-bold text-blue-400">{anomalies.length}</span>
        <span className="text-zinc-400">anomalies today</span>
      </div>
      {anomalies.length === 0 ? (
        <div className="flex items-center gap-2 py-2 text-xs text-green-500">
          <CheckCircle2 size={13} />
          <span>All clear — no anomalies detected</span>
        </div>
      ) : (
        <div className="space-y-1">
          {anomalies.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-xs">
              <AlertTriangle size={11} className="text-amber-500 shrink-0" />
              <span className="text-amber-400 font-semibold">{a.staffName}</span>
              <span className="text-zinc-500">{fmt(a.date)}</span>
              <span className="text-amber-300">{a.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}