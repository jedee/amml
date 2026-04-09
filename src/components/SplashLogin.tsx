// ─────────────────────────────────────────────────────────────
//  AMML — Splash & Login Screens
// ─────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { STAFF } from '../data/staff';
import { ROLE_CONFIG } from '../data/roles';

// ── Splash Screen ───────────────────────────────────────────

interface Props {
  onDone: () => void;
}

export function SplashScreen({ onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div id="splash">
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: 0,
      }}>
        <svg className="amml-svg-logo" viewBox="0 0 220 160" xmlns="http://www.w3.org/2000/svg">
          {/* Chevron blue */}
          <polygon
            className="logo-path-blue"
            points="10,10 100,10 60,80"
            fill="var(--blue)"
          />
          {/* Orange triangle */}
          <polygon
            className="logo-path-orange"
            points="100,10 190,10 130,80"
            fill="var(--orange)"
          />
          {/* Green bar */}
          <rect
            className="logo-path-green"
            x="10" y="85" width="180" height="22" rx="4"
            fill="var(--green-logo)"
          />
          {/* "WE DELIVER VALUE" text */}
          <text
            className="logo-text-tagline"
            x="110" y="100"
            text-anchor="middle"
            fill="white"
            font-size="9"
            font-weight="700"
            font-family="Outfit,sans-serif"
            letter-spacing="2"
          >
            WE DELIVER VALUE
          </text>
          {/* "ABUJA MARKETS" text */}
          <text
            className="logo-text-main"
            x="110" y="145"
            text-anchor="middle"
            fill="var(--navy)"
            font-size="13"
            font-weight="800"
            font-family="Outfit,sans-serif"
            letter-spacing="3"
          >
            ABUJA MARKETS
          </text>
        </svg>
      </div>
      <div className="splash-tagline">Abuja Markets Management Limited</div>
      <div className="splash-bar"><div className="splash-bar-fill" /></div>
    </div>
  );
}

// ── Login Screen ────────────────────────────────────────────

const LEVELS = [
  { key: 'SUPERADMIN', icon: '👑', name: 'Super Admin',  desc: 'Full system access', color: '#4A148C', rank: 'LEVEL 1' },
  { key: 'MD',          icon: '🎩', name: 'Managing Director', desc: 'Executive access', color: '#003C78', rank: 'LEVEL 2' },
  { key: 'MANAGER',     icon: '📊', name: 'Operations Manager', desc: 'Market management', color: '#0064B4', rank: 'LEVEL 3' },
  { key: 'SUPERVISOR',  icon: '🏪', name: 'Market Supervisor', desc: 'Assigned market', color: '#DC6400', rank: 'LEVEL 4' },
  { key: 'OFFICER',     icon: '🕐', name: 'Market Officer', desc: 'Clock in/out only', color: '#288C28', rank: 'LEVEL 5' },
] as const;

export function LoginScreen() {
  const { dispatch } = useApp();
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (!selectedLevel) { setError('Please select a role.'); return; }
    if (!staffId.trim()) { setError('Please enter your Staff ID.'); return; }

    // Find staff member by ID (case-insensitive prefix match)
    const match = STAFF.find(s =>
      s.id.toLowerCase() === staffId.trim().toLowerCase() ||
      s.id.toLowerCase().startsWith(staffId.trim().toLowerCase())
    );

    if (!match) {
      setError('Staff ID not found. Try AMML-001, AMML-002…');
      return;
    }

    const levelConfig = ROLE_CONFIG[selectedLevel as keyof typeof ROLE_CONFIG];
    const user = {
      id: match.id,
      name: `${match.first} ${match.last}`,
      staffId: match.id,
      authLevel: selectedLevel as any,
      market: match.market,
    };

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
            <text x="110" y="100" text-anchor="middle" fill="white" font-size="9" font-weight="700" font-family="Outfit,sans-serif" letter-spacing="2">WE DELIVER VALUE</text>
            <text x="110" y="145" text-anchor="middle" fill="var(--navy)" font-size="13" font-weight="800" font-family="Outfit,sans-serif" letter-spacing="3">ABUJA MARKETS</text>
          </svg>
        </div>

        <div className="login-divider" />
        <div className="login-title">Welcome Back</div>
        <div className="login-sub">Sign in to your AMML account</div>

        {/* Level selector */}
        <div className="level-grid">
          {LEVELS.map(l => (
            <button
              key={l.key}
              className={`level-btn ${selectedLevel === l.key ? 'active' : ''}`}
              onClick={() => setSelectedLevel(l.key)}
              type="button"
            >
              <div className="level-icon" style={{ background: `${l.color}22`, color: l.color }}>
                {l.icon}
              </div>
              <div className="level-meta">
                <div className="level-name">{l.name}</div>
                <div className="level-desc">{l.desc}</div>
              </div>
              <span className="level-rank" style={{ background: `${l.color}22`, color: l.color }}>
                {l.rank}
              </span>
            </button>
          ))}
        </div>

        {/* Staff ID input */}
        <div className="login-input-group">
          <label className="login-label">Staff ID</label>
          <input
            type="text"
            className="login-input"
            placeholder="e.g. AMML-001"
            value={staffId}
            onChange={e => setStaffId(e.target.value)}
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
