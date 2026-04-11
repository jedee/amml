// ─────────────────────────────────────────────────────────────
//  AMML — Sidebar Navigation
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { useApp } from '../contexts/AppContext';

interface Props {
  currentPage: string;
  onNavigate: (page: string) => void;
}

// Section labels for each nav group
const SECTIONS: Record<string, string> = {
  dashboard:  'Main',
  attendance:  'Operations',
  markets:     'Management',
  staff:       'People',
  devices:     'Hardware',
  payroll:     'Finance',
  reports:     'Insights',
  'ai-sales':  'AI Suite',
  users:       'Admin',
  alerts:      'Alerts',
  activitylog: 'Audit',
  settings:    'Settings',
};

export default function Sidebar({ currentPage, onNavigate }: Props) {
  const { state, navItems, currentRole } = useApp();

  if (!state.user) return null;

  return (
    <aside className="sidebar">
      {/* Role badge */}
      <div className="sidebar-header">
        <div className="sidebar-role">
          <span
            className="role-badge"
            style={{ background: `${currentRole?.color}22`, color: currentRole?.color }}
          >
            {currentRole?.short}
          </span>
          <span className="role-name">{currentRole?.label}</span>
        </div>
      </div>

      {/* Navigation items */}
      {navItems.map(item => {
        const isActive = currentPage === item.id;
        const sectionLabel = SECTIONS[item.id];

        return (
          <React.Fragment key={item.id}>
            {sectionLabel && item.id === navItems.find(n => n.id === item.id)?.id && (
              <div className="nav-section">{sectionLabel}</div>
            )}
            <button
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}

      {/* Footer */}
      <div className="sidebar-foot">
        <small>AMML v1.0 · Abuja MMD</small>
      </div>
    </aside>
  );
}
