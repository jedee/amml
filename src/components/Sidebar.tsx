// ─────────────────────────────────────────────────────────────
//  AMML — Sidebar Navigation
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const { state, navItems, roleConfig } = useApp();

  if (!state.user) return null;

  return (
    <aside className="sidebar">
      {/* Role badge */}
      <div className="sidebar-header">
        <div className="sidebar-role">
          <span
            className="role-badge"
            style={{
              background: `${roleConfig?.color}22`,
              color: roleConfig?.color,
              padding: '4px 10px',
              borderRadius: 99,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '.04em',
            }}
          >
            {roleConfig?.short}
          </span>
          <span className="role-name">{roleConfig?.label}</span>
        </div>
      </div>

      {/* Navigation sections */}
      {navItems.map((item, idx) => {
        // Group into sections (simple heuristic)
        const isActive = currentPage === item.id;
        return (
          <React.Fragment key={item.id}>
            {item.id === 'dashboard' && (
              <div className="nav-section">Main</div>
            )}
            {item.id === 'attendance' && navItems.find(n => n.id === 'markets') && currentPage !== 'dashboard' && !['markets','staff','devices','payroll','reports','users','settings','ai-sales'].includes(currentPage) && (
              <div className="nav-section">Operations</div>
            )}
            {item.id === 'markets' && (
              <div className="nav-section">Management</div>
            )}
            {item.id === 'staff' && (
              <div className="nav-section">People</div>
            )}
            {item.id === 'devices' && (
              <div className="nav-section">Hardware</div>
            )}
            {item.id === 'payroll' && (
              <div className="nav-section">Finance</div>
            )}
            {item.id === 'reports' && (
              <div className="nav-section">Insights</div>
            )}
            {item.id === 'ai-sales' && (
              <div className="nav-section">AI Suite</div>
            )}
            {item.id === 'users' && (
              <div className="nav-section">Admin</div>
            )}
            <button
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* Footer */}
      <div className="sidebar-foot" style={{ marginTop: 'auto' }}>
        <small style={{ fontSize: 10.5, color: 'var(--text3)', display: 'block', textAlign: 'center' }}>
          AMML v1.0 · Abuja MMD
        </small>
      </div>
    </aside>
  );
}
