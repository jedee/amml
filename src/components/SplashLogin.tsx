// ─────────────────────────────────────────────────────────────
//  AMML — Splash + Login Screens
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

export function SplashScreen() {
  return (
    <div id="splash">
      <div className="splash-logo-wrap">
        <img src="/images/ammllogo.png" alt="AMML" className="splash-logo" />
      </div>
      <div className="splash-tagline">Abuja Markets Management Limited</div>
      <div className="splash-bar"><div className="splash-bar-fill" /></div>
    </div>
  );
}

export function LoginScreen() {
  const { dispatch, state } = useApp();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!staffId.trim()) { setError('Please enter your Staff ID.'); return; }
    const match = state.staff.find(s =>
      s.id.toLowerCase() === staffId.trim().toLowerCase() ||
      s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
    );
    if (!match) { setError('Staff ID not found. Try AMML-001, AMML-002…'); return; }
    if (match.password && match.password !== password) {
      setError('Incorrect password.'); setPassword(''); return;
    }
    setLoading(true);
    dispatch({ type: 'LOGIN', payload: { id: match.id, name: match.first + ' ' + match.last, staffId: match.id, authLevel: match.authLevel, market: match.market } });
    dispatch({ type: 'AUDIT_LOG', payload: { action: 'LOGIN', detail: 'Staff ID ' + match.id + ' signed in' } });
  };

  const hasPassword = state.staff.find(s =>
    s.id.toLowerCase() === staffId.trim().toLowerCase() ||
    s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
  )?.password;

  return (
    <div id="loginScreen" className="visible">
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src="/images/ammllogo.png" alt="AMML" className="login-logo" />
        </div>
        <div className="login-divider" />
        <div className="login-title">Welcome Back</div>
        <div className="login-sub">Sign in to Abuja Markets Management Limited</div>

        <div className="login-input-group">
          <label className="login-label">Staff ID</label>
          <input
            className="login-input"
            type="text"
            placeholder="e.g. AMML-001"
            value={staffId}
            onChange={e => { setStaffId(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="username"
            autoFocus
          />
        </div>

        {hasPassword && (
          <div className="login-input-group">
            <label className="login-label">Password</label>
            <input
              className="login-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="login-hint">Staff ID format: AMML-001 · Contact admin if locked out</p>
      </div>
    </div>
  );
};
