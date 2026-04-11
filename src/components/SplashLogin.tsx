// ─────────────────────────────────────────────────────────────
//  AMML — Splash + Login Screens
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';

// ── Splash Screen ─────────────────────────────────────────

interface SplashProps { onDone: () => void; }

export function SplashScreen({ onDone }: SplashProps) {
  const { dispatch } = useApp();
  useEffect(() => {
    const t = setTimeout(() => {
      dispatch({ type: 'GO_TO_LOGIN' });
      onDone();
    }, 2800);
    return () => clearTimeout(t);
  }, [dispatch, onDone]);

  return (
    <div id="splash">
      <div className="splash-logo-wrap">
        <img src="/images/ammllogo.png" alt="AMML" style={{ width: 200, filter: 'brightness(1.1)' }} />
      </div>
      <div className="splash-tagline">Abuja Markets Management Limited</div>
      <div className="splash-bar"><div className="splash-bar-fill" /></div>
    </div>
  );
}

// ── Login Screen ────────────────────────────────────────────

export function LoginScreen() {
  const { dispatch, state } = useApp();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // When user logs out, we land back here — clear fields
  useEffect(() => {
    setStaffId('');
    setPassword('');
    setError('');
  }, []);

  const handleLogin = () => {
    if (!staffId.trim()) { setError('Please enter your Staff ID.'); return; }

    // Find staff — exact or prefix match
    const match = state.staff.find(s =>
      s.id.toLowerCase() === staffId.trim().toLowerCase() ||
      s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
    );

    if (!match) {
      setError('Staff ID not found. Try AMML-001, AMML-002…');
      return;
    }

    // If staff has a password, require it
    if (match.password && match.password !== password) {
      setError('Incorrect password. Try again.');
      setPassword('');
      return;
    }

    setLoading(true);
    const user = {
      id: match.id,
      name: `${match.first} ${match.last}`,
      staffId: match.id,
      authLevel: match.authLevel,
      market: match.market,
    };
    dispatch({ type: 'LOGIN', payload: user });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'LOGIN', detail: `Logged in as ${match.first} ${match.last}` } });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div id="loginScreen" style={{ display: 'flex' }}>
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo-area">
          <img src="/images/ammllogo.png" alt="AMML" style={{ width: 180, filter: 'brightness(1.1)' }} />
        </div>
        <div className="login-divider" />
        <div className="login-title">Welcome Back</div>
        <div className="login-sub">Sign in to Abuja Markets Management</div>

        {/* Staff ID */}
        <div className="login-input-group">
          <label className="login-label">Staff ID</label>
          <input
            className="login-input"
            type="text"
            placeholder="e.g. AMML-001"
            value={staffId}
            onChange={e => { setStaffId(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            autoComplete="username"
          />
        </div>

        {/* Password — shown conditionally */}
        {(() => {
          const match = state.staff.find(s =>
            s.id.toLowerCase() === staffId.trim().toLowerCase() ||
            s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
          );
          if (!match || !match.password) return null;
          return (
            <div className="login-input-group">
              <label className="login-label">Password</label>
              <input
                className="login-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
            </div>
          );
        })()}

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <button className="btn-login" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
          Staff ID format: AMML-001 · No password = no password login
        </p>
      </div>
    </div>
  );
}
