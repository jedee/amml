// ─────────────────────────────────────────────────────────────
//  AMML — Alerts Page
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { AlertCircle, CheckCircle, Info, XCircle, Bell, CheckCheck, Archive } from 'lucide-react';

const ICONS = {
  info:    <Info size={16} />,
  success: <CheckCircle size={16} />,
  warning: <AlertCircle size={16} />,
  error:   <XCircle size={16} />,
};

const COLORS = {
  info:    { bg: 'rgba(0,100,180,.08)',  border: '#0064B4', text: '#0064B4' },
  success: { bg: 'rgba(40,140,40,.08)',  border: '#288C28', text: '#288C28' },
  warning: { bg: 'rgba(220,100,0,.08)',  border: '#DC6400', text: '#DC6400' },
  error:   { bg: 'rgba(192,57,43,.08)',  border: '#C0392B', text: '#C0392B' },
};

export default function AlertsPage() {
  const { state, dispatch, can } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const alerts = filter === 'unread'
    ? state.alerts.filter(a => !a.dismissed)
    : state.alerts;

  const dismiss = (id: string) => {
    dispatch({ type: 'DISMISS_ALERT', payload: id });
  };

  const dismissAll = () => {
    state.alerts.forEach(a => {
      if (!a.dismissed) dispatch({ type: 'DISMISS_ALERT', payload: a.id });
    });
  };

  const stats = {
    total:   state.alerts.length,
    unread:  state.alerts.filter(a => !a.dismissed).length,
    info:    state.alerts.filter(a => a.type === 'info').length,
    success: state.alerts.filter(a => a.type === 'success').length,
    warning: state.alerts.filter(a => a.type === 'warning').length,
    error:   state.alerts.filter(a => a.type === 'error').length,
  };

  return (
    <div className="page active">
      <div className="ph">
        <div className="ph-l">
          <h2>🔔 Alerts & Notices</h2>
          <p>{stats.unread} unread · {stats.total} total</p>
        </div>
        <div className="ph-r">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${filter === 'all' ? 'btn-blue' : 'btn-outline'}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button
              className={`btn btn-sm ${filter === 'unread' ? 'btn-blue' : 'btn-outline'}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({stats.unread})
            </button>
            {stats.unread > 0 && (
              <button className="btn btn-sm btn-outline" onClick={dismissAll}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        {([
          { label: 'Info',    val: stats.info,    color: '#0064B4' },
          { label: 'Success', val: stats.success, color: '#288C28' },
          { label: 'Warnings',val: stats.warning, color: '#DC6400' },
          { label: 'Errors',  val: stats.error,   color: '#C0392B' },
        ] as const).map(s => (
          <div key={s.label} className="sr">
            <div className="sr-val" style={{ color: s.color }}>{s.val}</div>
            <div className="sr-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="es-icon"><Bell size={40} /></div>
            <div className="es-title">No alerts</div>
            <p>All caught up. New alerts appear here when triggered.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {alerts.map(alert => {
            const c = COLORS[(alert.type ?? 'info') as keyof typeof COLORS] ?? COLORS.info;
            return (
              <div
                key={alert.id}
                className="card"
                style={{
                  borderLeft: `4px solid ${c.border}`,
                  background: c.bg,
                  paddingLeft: 16,
                  opacity: alert.dismissed ? 0.5 : 1,
                  transition: 'opacity .2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ color: c.text, marginTop: 2, flexShrink: 0 }}>
                    {ICONS[(alert.type ?? 'info') as keyof typeof ICONS]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                      {alert.title}
                    </div>
                    {alert.message && (
                      <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
                        {alert.message}
                      </p>
                    )}
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                      {new Date(alert.timestamp).toLocaleString('en-GB')}
                      {alert.staffId && ` · Staff: ${alert.staffId}`}
                    </div>
                  </div>
                  {!alert.dismissed && (
                    <button
                      onClick={() => dismiss(alert.id)}
                      className="btn btn-sm btn-outline"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}