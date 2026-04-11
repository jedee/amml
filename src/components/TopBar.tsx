// ─────────────────────────────────────────────────────────────
//  AMML — Top Bar
// ─────────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: '#4A148C', MD: '#003C78', MANAGER: '#0064B4',
  SUPERVISOR: '#DC6400', OFFICER: '#288C28',
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export default function TopBar() {
  const { state, dispatch } = useApp();
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const d = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
      const t = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTime(d + '  ' + t);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!state.user) return null;
  const roleColor = ROLE_COLORS[state.user.authLevel] ?? '#0064B4';
  const initials = getInitials(state.user.name);

  return (
    <header className="topbar">
      {/* Brand */}
      <a href="/" className="topbar-brand">
        <img src="/images/ammllogo.png" alt="AMML" className="topbar-brand-img" />
      </a>
      <div className="topbar-sep" />

      {/* Market Selector */}
      <div className="market-select">
        <span>📍</span>
        <select
          value={state.marketFilter}
          onChange={e => dispatch({ type: 'SET_MARKET_FILTER', payload: e.target.value })}
        >
          <option>All Markets</option>
          {state.markets.map(m => <option key={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="topbar-spacer" />
      <div className="topbar-clock">{time}</div>

      {/* Notifications */}
      <div className="topbar-notif" title="Notifications">
        🔔
        {state.alerts.length > 0 && <div className="topbar-notif-dot" />}
      </div>

      {/* User */}
      <div
        className="topbar-user"
        onClick={() => dispatch({ type: 'LOGOUT' })}
        title="Click to logout"
      >
        <div className="topbar-avatar" style={{ background: roleColor }}>{initials}</div>
        <span className="topbar-username">{state.user.name.split(' ')[0]}</span>
      </div>
    </header>
  );
};
