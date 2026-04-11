// ─────────────────────────────────────────────────────────────
//  AMML — TopBar Component
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getRoleColor(authLevel: string): string {
  const map: Record<string, string> = {
    SUPERADMIN: '#4A148C',
    MD:         '#003C78',
    MANAGER:    '#0064B4',
    SUPERVISOR: '#DC6400',
    OFFICER:    '#288C28',
  };
  return map[authLevel] ?? '#0064B4';
}

export default function TopBar() {
  const { state, dispatch, navItems } = useApp();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const d = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
      const t = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTime(`${d}  ${t}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!state.user) return null;

  const roleColor = getRoleColor(state.user.authLevel);
  const initials = getInitials(state.user.name);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const handleMarketChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_MARKET_FILTER', payload: e.target.value });
  };

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <img src="/images/pegasus.png" alt="AMML" style={{ height: 32, filter: 'brightness(1.1)' }} />
      </div>

      <div className="topbar-sep" />

      {/* Market Selector */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'rgba(255,255,255,.08)', borderRadius: 99,
        padding: '5px 14px', border: '1px solid rgba(255,255,255,.1)',
      }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>📍</span>
        <select
          value={state.marketFilter}
          onChange={handleMarketChange}
          style={{
            background: 'none', border: 'none', color: '#fff',
            fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
          }}
        >
          <option>All Markets</option>
          {state.markets.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="topbar-spacer" />

      {/* Clock */}
      <div className="topbar-clock">{time}</div>

      {/* Notification bell */}
      <div style={{
        width: 34, height: 34, borderRadius: '50%',
        background: 'rgba(255,255,255,.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, border: '1px solid rgba(255,255,255,.1)',
        cursor: 'pointer', position: 'relative',
      }}>
        🔔
        {state.alerts.length > 0 && (
          <div style={{
            position: 'absolute', top: 4, right: 4, width: 8, height: 8,
            background: 'var(--orange)', borderRadius: '50%',
            border: '2px solid var(--navy)',
          }} />
        )}
      </div>

      {/* User */}
      <div
        className="topbar-user"
        onClick={handleLogout}
        title="Click to logout"
        style={{ cursor: 'pointer' }}
      >
        <div
          className="ua"
          style={{ background: roleColor }}
        >
          {initials}
        </div>
        <span>{state.user.name.split(' ')[0]}</span>
      </div>
    </header>
  );
}
