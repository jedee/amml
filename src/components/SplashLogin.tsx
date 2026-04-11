// ─────────────────────────────────────────────────────────────
//  AMML — Login Screen
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { ROLE_CONFIG } from '../data/roles';
import { useApp } from '../contexts/AppContext';

export function LoginScreen() {
  const { dispatch, state } = useApp();
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!staffId.trim()) { setError('Please enter your Staff ID.'); return; }

    // Find staff member — exact match or prefix (case-insensitive)
    const match = state.staff.find(s =>
      s.id.toLowerCase() === staffId.trim().toLowerCase() ||
      s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
    );

    if (!match) {
      setError('Staff ID not found. Try AMML-001, AMML-002…');
      return;
    }

    // Auth level is set on the staff record — no role picker needed
    const user = {
      id: match.id,
      name: `${match.first} ${match.last}`,
      staffId: match.id,
      authLevel: match.authLevel,
      market: match.market,
    };

    const levelConfig = ROLE_CONFIG[match.authLevel];
    dispatch({ type: 'LOGIN', payload: user });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'LOGIN', detail: `Logged in as ${levelConfig.label}` } });
  };

  return (
    <div id="loginScreen" style={{ display: 'flex' }}>
      <div className="login-card">
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
          <svg width="160" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
            <polygon points="10,10 100,10 60,80" fill="var(--blue)" />
            <polygon points="100,10 190,10 130,80" fill="var(--orange)" />
            <rect x="10" y="85" width="180" height="22" rx="4" fill="var(--green-logo)" />
            <text x="110" y="100" textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily="Outfit,sans-serif" letterSpacing="2">WE DELIVER VALUE</text>
            <text x="110" y="145" textAnchor="middle" fill="var(--navy)" fontSize="13" fontWeight="800" fontFamily="Outfit,sans-serif" letterSpacing="3">ABUJA MARKETS</text>
          </svg>
        </div>

        <div className="login-divider" />
        <div className="login-title">Welcome Back</div>
        <div className="login-sub">Sign in to your AMML account</div>

        {/* Staff ID input */}
        <div className="login-input-group">
          <label className="login-label">Staff ID</label>
          <input
            type="text"
            className="login-input"
            placeholder="e.g. AMML-001"
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
            onInput={e => setStaffId((e.target as HTMLInputElement).value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <button className="btn-login" onClick={handleLogin} type="button">
          Sign In →
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 11 }}>
          AMML Staff Attendance & Management System
        </div>
      </div>
    </div>
  );
}
