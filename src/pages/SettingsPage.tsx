// ─────────────────────────────────────────────────────────────
//  AMML — Settings Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Save, Download, Upload, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    startTime: state.settings?.startTime ?? '08:00',
    endTime: state.settings?.endTime ?? '17:00',
    lateMinutes: state.settings?.lateMinutes ?? 15,
    minHours: state.settings?.minHours ?? 7,
    dailyRate: state.settings?.dailyRate ?? 5000,
    lateDeduction: state.settings?.lateDeduction ?? 500,
    absentDeductPct: state.settings?.absentDeductPct ?? 100,
  });

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const exportBackup = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amml-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        dispatch({ type: 'LOAD_STATE', payload: data });
        alert('Backup restored successfully.');
      } catch {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  const fmt = (n: number) => `₦${n.toLocaleString()}`;

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>⚙️ Settings</h2>
          <p>Configure payroll rules, attendance thresholds, and system preferences</p>
        </div>
        <div className="ph-r">
          <button className="btn btn-blue btn-sm" onClick={save}>
            <Save size={14} /> {saved ? '✓ Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>
        {/* Attendance Rules */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">🕐 Attendance Rules</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>Start Time</label>
                <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} />
              </div>
              <div className="fg">
                <label>End Time</label>
                <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>Late threshold (minutes)</label>
                <input type="number" min={0} value={form.lateMinutes} onChange={e => set('lateMinutes', Number(e.target.value))} />
              </div>
              <div className="fg">
                <label>Min hours per day</label>
                <input type="number" min={1} max={24} value={form.minHours} onChange={e => set('minHours', Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Rules */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">💵 Payroll Rules</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="fg">
              <label>Daily rate (₦)</label>
              <input type="number" min={0} value={form.dailyRate} onChange={e => set('dailyRate', Number(e.target.value))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="fg">
                <label>Late deduction per instance (₦)</label>
                <input type="number" min={0} value={form.lateDeduction} onChange={e => set('lateDeduction', Number(e.target.value))} />
              </div>
              <div className="fg">
                <label>Absent deduction (% of daily rate)</label>
                <input type="number" min={0} max={100} value={form.absentDeductPct} onChange={e => set('absentDeductPct', Number(e.target.value))} />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">💾 Data Management</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="flex gap-2 flex-wrap">
              <button className="btn btn-outline" onClick={exportBackup}>
                <Download size={14} /> Export Backup (JSON)
              </button>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                <Upload size={14} /> Import Backup
                <input type="file" accept=".json" style={{ display: 'none' }} onChange={importBackup} />
              </label>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)' }}>
              {fmt(JSON.stringify(state).length * 2)} chars in memory · Exported backup is a full snapshot
            </p>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">ℹ️ System Info</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {([
              ['Markets', state.markets.length],
              ['Staff', state.staff.length],
              ['Devices', state.devices.length],
              ['Attendance Records', state.att.length],
              ['Activity Log Entries', state.activityLog.length],
              ['Auth Level', state.user?.authLevel ?? '—'],
              ['Version', 'AMML v2.0.0'],
            ] as const).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text3)' }}>{k}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}