// ─────────────────────────────────────────────────────────────
//  AMML — Settings Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const DB_KEY = 'amml_mmis_v1';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const [msg, setMsg] = useState('');

  function save() {
    try {
      const payload = {
        markets: state.markets,
        staff: state.staff,
        devices: state.devices,
        att: state.att.slice(-2000),
        users: state.users,
        settings: state.settings,
        activityLog: (state.activityLog || []).slice(0, 300),
        phase: state.phase,
        savedAt: new Date().toISOString(),
        version: 'AMML-MMIS-v2',
      };
      const serialised = JSON.stringify(payload);
      if (serialised.length > 4 * 1024 * 1024) {
        payload.att = payload.att.slice(-200);
      }
      localStorage.setItem(DB_KEY, JSON.stringify(payload));
      setMsg('✅ Saved to browser storage');
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        setMsg('❌ Storage full — try exporting a backup');
      } else {
        setMsg('❌ Save failed: ' + e.message);
      }
    }
    setTimeout(() => setMsg(''), 3000);
  }

  function exportBackup() {
    const payload = {
      markets: state.markets,
      staff: state.staff,
      devices: state.devices,
      att: state.att.slice(-2000),
      users: state.users,
      settings: state.settings,
      activityLog: (state.activityLog || []).slice(0, 300),
      savedAt: new Date().toISOString(),
      version: 'AMML-MMIS-v2',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amml-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'EXPORT_BACKUP', detail: 'Full data backup downloaded' } });
    setMsg('✅ Backup downloaded');
    setTimeout(() => setMsg(''), 3000);
  }

  function importBackup(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.version) throw new Error('Invalid backup file');
        dispatch({ type: 'LOAD_STATE', payload: data });
        dispatch({ type: 'AUDIT_LOG', payload: { action: 'IMPORT_BACKUP', detail: `Restored from backup dated ${data.savedAt}` } });
        setMsg(`✅ Restored ${data.staff.length} staff, ${data.att.length} attendance records`);
      } catch {
        setMsg('❌ Failed to parse backup file');
      }
      setTimeout(() => setMsg(''), 4000);
    };
    reader.readAsText(file);
  }

  const usedBytes = new Blob([JSON.stringify(state)]).size;
  const limitBytes = 5 * 1024 * 1024;
  const usedPct = Math.round((usedBytes / limitBytes) * 100);

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>⚙️ Settings</h2>
          <p>Data management, backup, and preferences</p>
        </div>
      </div>

      {/* Storage usage */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">💾 Storage</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>
          Data is stored in your browser's localStorage (max 5 MB).
        </p>
        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
            <span>Used</span>
            <span>{(usedBytes / 1024).toFixed(1)} KB / 5 MB</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(usedPct, 100)}%`, background: usedPct > 80 ? 'var(--orange)' : 'var(--green-logo)', borderRadius: 3, transition: 'width .4s' }} />
          </div>
        </div>
        {msg && <p style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{msg}</p>}
      </div>

      {/* Backup */}
      <div className="card">
        <div className="card-head">
          <div className="card-title">📦 Backup & Restore</div>
        </div>
        <div className="mf">
          <button className="btn btn-blue" onClick={exportBackup}>📥 Download Backup (JSON)</button>
          <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
            📂 Restore from Backup
            <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files?.[0]) importBackup(e.target.files[0]);
            }} />
          </label>
          <button className="btn btn-green" onClick={save}>💾 Save Now</button>
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--text3)', marginTop: 10 }}>
          Backup is a full JSON export — keep it safe. To restore, upload the same file.
        </p>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ borderColor: 'rgba(192,57,43,.3)' }}>
        <div className="card-head">
          <div className="card-title" style={{ color: '#C0392B' }}>⚠️ Danger Zone</div>
        </div>
        <button
          className="btn"
          style={{ background: '#C0392B', color: '#fff', border: 'none' }}
          onClick={() => {
            if (confirm('This will erase ALL data — staff, attendance, settings. This cannot be undone. Are you sure?')) {
              localStorage.removeItem(DB_KEY);
              dispatch({ type: 'AUDIT_LOG', payload: { action: 'CLEAR_DATA', detail: 'All data cleared' } });
              window.location.reload();
            }
          }}
        >
          🗑️ Clear All Data
        </button>
      </div>
    </div>
  );
}
