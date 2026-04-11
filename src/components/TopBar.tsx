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
  const { state, dispatch } = useApp();
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

  return (
    <header className="topbar">
      {/* Brand */}
      <div className="topbar-brand">
        <img src="/images/ammllogo.png" height="32" alt="AMML" />
      </div>

      <div className="topbar-sep" />

      {/* Market Selector */}
      <div className="market-sel">
        <span>📍</span>
        <select
          value={state.marketFilter}
          onChange={e => dispatch({ type: 'SET_MARKET_FILTER', payload: e.target.value })}
        >
          <option>All Markets</option>
          {state.markets.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="topbar-spacer" />
      <div className="topbar-clock">{time}</div>

      {/* Notification bell */}
      <div className="notif-btn">
        🔔
        {state.alerts.length > 0 && <div className="notif-dot" />}
      </div>

      {/* User */}
      <div
        className="topbar-user"
        onClick={() => dispatch({ type: 'LOGOUT' })}
        title="Click to logout"
      >
        <div className="ua" style={{ background: roleColor }}>{initials}</div>
        <span>{state.user.name.split(' ')[0]}</span>
      </div>
    </header>
  );
}
