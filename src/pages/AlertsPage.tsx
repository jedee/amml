// ─────────────────────────────────────────────────────────────
//  AMML — Alerts + Activity Log Pages
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export default function AlertsPage() {
  const { state, dispatch } = useApp();
  const [msg, setMsg] = useState('');
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<'info' | 'warn' | 'critical'>('warn');
  const [kind, setKind] = useState<'alert' | 'notice'>('alert');

  const alerts = (state.alerts || []).filter((a: any) => a.dismissed !== true);

  function createAlert() {
    if (!text.trim()) return;
    const id = 'al' + Math.random().toString(36).slice(2, 8);
    dispatch({
      type: 'ADD_ALERT',
      payload: {
        id,
        text: text.trim(),
        priority,
        kind,
        date: new Date().toISOString().slice(0, 10),
        read: false,
        dismissed: false,
      } as any,
    });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'CREATE_ALERT', detail: `${kind}: ${text.trim().slice(0, 50)}` } });
    setText('');
    setMsg('✅ Alert posted');
    setTimeout(() => setMsg(''), 3000);
  }

  function dismiss(id: string) {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  }

  const infoAlerts = alerts.filter((a: any) => a.priority === 'info');
  const warnAlerts = alerts.filter((a: any) => a.priority === 'warn');
  const critAlerts = alerts.filter((a: any) => a.priority === 'critical');

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🔔 Alerts & Notices</h2>
          <p>{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Create alert */}
      {(state.user?.authLevel === 'SUPERADMIN' || state.user?.authLevel === 'MD' || state.user?.authLevel === 'MANAGER') && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">📢 Post Alert / Notice</div>
          </div>
          <div className="fg" style={{ marginBottom: 10 }}>
            <label>Message</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="e.g. Wuse Market will be closed on 25th Dec for general cleaning…"
              rows={3}
              style={{ width: '100%', padding: '9px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--border)', fontSize: 13.5, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={priority} onChange={e => setPriority(e.target.value as any)} style={{ width: 'auto' }}>
              <option value="info">ℹ️ Info</option>
              <option value="warn">⚠️ Warning</option>
              <option value="critical">🚨 Critical</option>
            </select>
            <select value={kind} onChange={e => setKind(e.target.value as any)} style={{ width: 'auto' }}>
              <option value="alert">🔔 Alert</option>
              <option value="notice">📋 Notice</option>
            </select>
            <button className="btn btn-blue" onClick={createAlert}>Post Alert</button>
          </div>
          {msg && <p style={{ fontSize: 13, marginTop: 8, fontWeight: 600 }}>{msg}</p>}
        </div>
      )}

      {/* Alert sections */}
      {critAlerts.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(192,57,43,.4)', background: 'rgba(192,57,43,.04)' }}>
          <div className="card-head">
            <div className="card-title" style={{ color: '#C0392B' }}>🚨 Critical ({critAlerts.length})</div>
          </div>
          {critAlerts.map(a => <AlertRow key={a.id} a={a} onDismiss={dismiss} />)}
        </div>
      )}
      {warnAlerts.length > 0 && (
        <div className="card" style={{ borderColor: 'rgba(220,100,0,.3)', background: 'rgba(220,100,0,.04)' }}>
          <div className="card-head">
            <div className="card-title" style={{ color: 'var(--orange)' }}>⚠️ Warnings ({warnAlerts.length})</div>
          </div>
          {warnAlerts.map(a => <AlertRow key={a.id} a={a} onDismiss={dismiss} />)}
        </div>
      )}
      {infoAlerts.length > 0 && (
        <div className="card">
          <div className="card-head">
            <div className="card-title">ℹ️ Info ({infoAlerts.length})</div>
          </div>
          {infoAlerts.map(a => <AlertRow key={a.id} a={a} onDismiss={dismiss} />)}
        </div>
      )}
      {alerts.length === 0 && (
        <div className="empty-state">
          <div className="es-icon">🔔</div>
          <div className="es-title">No active alerts</div>
          <p>All clear — post an alert above if needed.</p>
        </div>
      )}
    </div>
  );
}

function AlertRow({ a, onDismiss }: { a: any; onDismiss: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{a.text}</p>
        <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{a.date} · {a.kind}</p>
      </div>
      <button onClick={() => onDismiss(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)', padding: '0 4px' }}>✕</button>
    </div>
  );
}
